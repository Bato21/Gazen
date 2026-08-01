'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import type { Usuario } from '@/types/database.types'

type Result = { error?: string; success?: boolean }

const HEX = /^#[0-9a-fA-F]{6}$/
const MONEDAS = ['MXN', 'USD', 'EUR'] as const
const TIPOS_CUENTA = ['Ahorro', 'Corriente', 'Inversión', 'Crédito', 'Efectivo'] as const
const CARGOS = ['Administrador', 'Contador', 'Usuario', 'Gerente'] as const

function validarPassword(pw: string): string | null {
  if (pw.length < 8) return 'La contraseña debe tener al menos 8 caracteres.'
  if (!/[A-Z]/.test(pw) || !/[a-z]/.test(pw) || !/\d/.test(pw)) {
    return 'La contraseña debe incluir mayúscula, minúscula y número.'
  }
  return null
}

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

// ─── Usuarios de la empresa (admin) ────────────────────────────────────────

async function contarAdmins(empresaId: string, excluyendoId?: string): Promise<number> {
  const admin = createAdminClient()
  const query = (admin.from('usuarios') as unknown as {
    select: (cols: string, opts: object) => {
      eq: (col: string, val: unknown) => {
        eq: (col: string, val: unknown) => {
          neq: (col: string, val: string) => Promise<{ count: number | null }>
        } & Promise<{ count: number | null }>
      }
    }
  })
    .select('id', { count: 'exact', head: true })
    .eq('empresa_id', empresaId)
    .eq('es_admin', true)

  if (excluyendoId) {
    const { count } = await query.neq('id', excluyendoId)
    return count ?? 0
  }
  const { count } = await query
  return count ?? 0
}

export async function invitarUsuario(formData: FormData): Promise<Result> {
  const { empresaId, error: authError } = await getAdminEmpresaId()
  if (authError || !empresaId) return { error: authError }

  const nombre = String(formData.get('nombre') ?? '').trim()
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  const password = String(formData.get('password') ?? '')
  const cargo = String(formData.get('cargo') ?? 'Usuario')
  const esAdmin = formData.get('es_admin') === 'on'

  if (!nombre) return { error: 'Ingresa un nombre.' }
  if (!email) return { error: 'Ingresa un correo.' }
  if (!CARGOS.includes(cargo as typeof CARGOS[number])) return { error: 'Cargo inválido.' }
  const pwError = validarPassword(password)
  if (pwError) return { error: pwError }

  const admin = createAdminClient()

  const { data: authData, error: authErrorCreate } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { nombre },
  })
  if (authErrorCreate || !authData.user) {
    return { error: authErrorCreate?.message ?? 'No se pudo crear el usuario.' }
  }

  const { error: insertError } = await (admin.from('usuarios') as unknown as {
    insert: (data: object) => Promise<{ error: { message: string } | null }>
  }).insert({
    id: authData.user.id,
    empresa_id: empresaId,
    nombre,
    cargo,
    es_admin: esAdmin,
  })

  if (insertError) {
    await admin.auth.admin.deleteUser(authData.user.id)
    return { error: insertError.message }
  }

  revalidatePath('/empresa')
  return { success: true }
}

export async function editarUsuario(formData: FormData): Promise<Result> {
  const { empresaId, error: authError } = await getAdminEmpresaId()
  if (authError || !empresaId) return { error: authError }

  const id = String(formData.get('id') ?? '')
  const nombre = String(formData.get('nombre') ?? '').trim()
  const cargo = String(formData.get('cargo') ?? '')
  const esAdmin = formData.get('es_admin') === 'on'

  if (!id) return { error: 'Usuario no identificado.' }
  if (!nombre) return { error: 'El nombre no puede estar vacío.' }
  if (!CARGOS.includes(cargo as typeof CARGOS[number])) return { error: 'Cargo inválido.' }

  const admin = createAdminClient()

  const { data: actual } = await (admin.from('usuarios') as unknown as {
    select: (cols: string) => {
      eq: (col: string, val: string) => {
        eq: (col: string, val: string) => {
          maybeSingle: () => Promise<{ data: Pick<Usuario, 'id' | 'es_admin'> | null }>
        }
      }
    }
  })
    .select('id, es_admin')
    .eq('id', id)
    .eq('empresa_id', empresaId)
    .maybeSingle()

  if (!actual) return { error: 'El usuario no pertenece a tu empresa.' }

  if (actual.es_admin && !esAdmin) {
    const otrosAdmins = await contarAdmins(empresaId, id)
    if (otrosAdmins === 0) {
      return { error: 'No puedes quitar el rol admin: es el único administrador de la empresa.' }
    }
  }

  const { error } = await (admin.from('usuarios') as unknown as {
    update: (data: object) => {
      eq: (col: string, val: string) => Promise<{ error: { message: string } | null }>
    }
  })
    .update({ nombre, cargo, es_admin: esAdmin })
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/empresa')
  return { success: true }
}

export async function eliminarUsuario(id: string): Promise<Result> {
  const { empresaId, error: authError } = await getAdminEmpresaId()
  if (authError || !empresaId) return { error: authError }
  if (!id) return { error: 'Usuario no identificado.' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user?.id === id) return { error: 'No puedes eliminar tu propia cuenta desde aquí.' }

  const admin = createAdminClient()

  const { data: objetivo } = await (admin.from('usuarios') as unknown as {
    select: (cols: string) => {
      eq: (col: string, val: string) => {
        eq: (col: string, val: string) => {
          maybeSingle: () => Promise<{ data: Pick<Usuario, 'id' | 'es_admin'> | null }>
        }
      }
    }
  })
    .select('id, es_admin')
    .eq('id', id)
    .eq('empresa_id', empresaId)
    .maybeSingle()

  if (!objetivo) return { error: 'El usuario no pertenece a tu empresa.' }

  if (objetivo.es_admin) {
    const otrosAdmins = await contarAdmins(empresaId, id)
    if (otrosAdmins === 0) {
      return { error: 'No puedes eliminar el único administrador de la empresa.' }
    }
  }

  // Borrar auth.users cascadea a public.usuarios (FK on delete cascade)
  const { error } = await admin.auth.admin.deleteUser(id)
  if (error) return { error: error.message }

  revalidatePath('/empresa')
  return { success: true }
}
