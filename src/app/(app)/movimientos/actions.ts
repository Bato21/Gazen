'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Usuario } from '@/types/database.types'

export async function crearCuenta(formData: FormData): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autorizado' }

  const { data: usuario } = await supabase
    .from('usuarios').select('empresa_id').eq('id', user.id).single() as unknown as { data: Pick<Usuario, 'empresa_id'> | null }
  if (!usuario) return { error: 'Usuario no encontrado' }

  const nombre = (formData.get('nombreCuenta') as string)?.trim()
  const saldoInicial = parseFloat(formData.get('saldoInicial') as string)
  const tipoCuenta = formData.get('tipoCuenta') as string

  if (!nombre) return { error: 'El nombre de la cuenta es requerido.' }
  if (isNaN(saldoInicial)) return { error: 'El saldo inicial debe ser un número.' }

  const { error } = await (supabase.from('cuentas') as unknown as {
    insert: (data: object) => Promise<{ error: { message: string } | null }>
  }).insert({
    empresa_id: usuario.empresa_id,
    nombre,
    saldo_inicial: saldoInicial,
    tipo_cuenta: tipoCuenta,
  })

  if (error) return { error: error.message }

  revalidatePath('/movimientos')
  return { success: true }
}
