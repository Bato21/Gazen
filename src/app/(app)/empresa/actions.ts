'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Usuario } from '@/types/database.types'

type Result = { error?: string; success?: boolean }

const HEX = /^#[0-9a-fA-F]{6}$/
const MONEDAS = ['MXN', 'USD', 'EUR'] as const
const TIPOS_CUENTA = ['Ahorro', 'Corriente', 'Inversión', 'Crédito', 'Efectivo'] as const

async function getAdminEmpresaId(): Promise<{ empresaId?: string; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autorizado' }

  const { data: usuario } = await supabase
    .from('usuarios').select('empresa_id, es_admin').eq('id', user.id).single() as unknown as
    { data: Pick<Usuario, 'empresa_id' | 'es_admin'> | null }
  if (!usuario) return { error: 'Usuario no encontrado' }
  if (!usuario.es_admin) return { error: 'Solo administradores pueden realizar esta acción.' }
  return { empresaId: usuario.empresa_id }
}

export async function actualizarEmpresa(formData: FormData): Promise<Result> {
  const { empresaId, error: authError } = await getAdminEmpresaId()
  if (authError || !empresaId) return { error: authError }

  const nombre = (formData.get('nombre') as string)?.trim()
  const direccion = ((formData.get('direccion') as string) ?? '').trim() || null
  const moneda = formData.get('moneda') as string
  const colorPrincipal = ((formData.get('color_principal') as string) ?? '').trim()
  const colorSecundario = ((formData.get('color_secundario') as string) ?? '').trim()

  if (!nombre) return { error: 'El nombre es requerido.' }
  if (!MONEDAS.includes(moneda as typeof MONEDAS[number])) return { error: 'Moneda inválida.' }
  if (!HEX.test(colorPrincipal)) return { error: 'El color principal debe ser hexadecimal (#RRGGBB).' }
  if (!HEX.test(colorSecundario)) return { error: 'El color secundario debe ser hexadecimal (#RRGGBB).' }

  const supabase = await createClient()
  const { error } = await (supabase.from('empresas') as unknown as {
    update: (data: object) => {
      eq: (col: string, val: string) => Promise<{ error: { message: string } | null }>
    }
  })
    .update({
      nombre,
      direccion,
      moneda,
      color_principal: colorPrincipal,
      color_secundario: colorSecundario,
    })
    .eq('id', empresaId)

  if (error) return { error: error.message }

  revalidatePath('/', 'layout')
  return { success: true }
}

export async function crearCuenta(formData: FormData): Promise<Result> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autorizado' }

  const { data: usuario } = await supabase
    .from('usuarios').select('empresa_id').eq('id', user.id).single() as unknown as
    { data: Pick<Usuario, 'empresa_id'> | null }
  if (!usuario) return { error: 'Usuario no encontrado' }

  const nombre = (formData.get('nombre') as string)?.trim()
  const tipoCuenta = formData.get('tipo_cuenta') as string
  const saldoInicial = parseFloat(formData.get('saldo_inicial') as string)

  if (!nombre) return { error: 'El nombre de la cuenta es requerido.' }
  if (!TIPOS_CUENTA.includes(tipoCuenta as typeof TIPOS_CUENTA[number])) return { error: 'Tipo de cuenta inválido.' }
  if (isNaN(saldoInicial)) return { error: 'El saldo inicial debe ser numérico.' }

  const { error } = await (supabase.from('cuentas') as unknown as {
    insert: (data: object) => Promise<{ error: { message: string } | null }>
  }).insert({
    empresa_id: usuario.empresa_id,
    nombre,
    tipo_cuenta: tipoCuenta,
    saldo_inicial: saldoInicial,
  })

  if (error) return { error: error.message }

  revalidatePath('/empresa')
  revalidatePath('/', 'layout')
  return { success: true }
}

export async function editarCuenta(formData: FormData): Promise<Result> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autorizado' }

  const id = formData.get('id') as string
  if (!id) return { error: 'Cuenta no identificada.' }

  const nombre = (formData.get('nombre') as string)?.trim()
  const tipoCuenta = formData.get('tipo_cuenta') as string
  const saldoInicial = parseFloat(formData.get('saldo_inicial') as string)

  if (!nombre) return { error: 'El nombre de la cuenta es requerido.' }
  if (!TIPOS_CUENTA.includes(tipoCuenta as typeof TIPOS_CUENTA[number])) return { error: 'Tipo de cuenta inválido.' }
  if (isNaN(saldoInicial)) return { error: 'El saldo inicial debe ser numérico.' }

  const { error } = await (supabase.from('cuentas') as unknown as {
    update: (data: object) => {
      eq: (col: string, val: string) => Promise<{ error: { message: string } | null }>
    }
  })
    .update({ nombre, tipo_cuenta: tipoCuenta, saldo_inicial: saldoInicial })
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/empresa')
  revalidatePath('/', 'layout')
  return { success: true }
}

export async function eliminarCuenta(id: string): Promise<Result> {
  const { error: authError } = await getAdminEmpresaId()
  if (authError) return { error: authError }
  if (!id) return { error: 'Cuenta no identificada.' }

  const supabase = await createClient()
  const { error } = await (supabase.from('cuentas') as unknown as {
    delete: () => {
      eq: (col: string, val: string) => Promise<{ error: { message: string } | null }>
    }
  }).delete().eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/empresa')
  revalidatePath('/', 'layout')
  return { success: true }
}
