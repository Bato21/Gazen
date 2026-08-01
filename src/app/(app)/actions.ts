'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Movimiento } from '@/types/database.types'

type MovimientoInsert = Omit<Movimiento, 'id' | 'created_at'>
type MovimientoUpdate = Partial<Omit<Movimiento, 'id' | 'created_at' | 'usuario_id'>>

export async function crearMovimiento(formData: FormData): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autorizado' }

  const cuenta_id = formData.get('cuenta') as string
  const tipo = formData.get('tipoIngreso') as 'Ingreso' | 'Gasto'
  const monto = parseFloat(formData.get('valor') as string)
  const descripcion = formData.get('descripcion') as string
  const categoria_id = (formData.get('categoria') as string) || null
  const meta_id = (formData.get('meta') as string) || null
  const emisor_id = (formData.get('emisor') as string) || null
  const fecha = formData.get('fecha') as string

  if (!cuenta_id) return { error: 'Debes seleccionar una cuenta.' }
  if (isNaN(monto) || monto <= 0) return { error: 'El valor debe ser mayor a 0.' }

  const payload: MovimientoInsert = {
    cuenta_id,
    usuario_id: user.id,
    tipo,
    monto,
    descripcion,
    categoria_id,
    meta_id,
    emisor_id,
    fecha,
  }

  const { error } = await (supabase.from('movimientos') as unknown as {
    insert: (data: MovimientoInsert) => Promise<{ error: { message: string } | null }>
  }).insert(payload)

  if (error) return { error: error.message }

  // If ingreso + ahorro meta, update meta.monto_actual via RPC (best-effort)
  if (tipo === 'Ingreso' && meta_id) {
    try {
      await (supabase as unknown as {
        rpc: (fn: string, args: Record<string, unknown>) => Promise<unknown>
      }).rpc('increment_meta', { meta_id, amount: monto })
    } catch {
      // best-effort, ignore errors
    }
  }

  revalidatePath('/home')
  revalidatePath('/movimientos')
  return { success: true }
}

export async function editarMovimiento(formData: FormData): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autorizado' }

  const id = formData.get('id') as string
  if (!id) return { error: 'Movimiento no identificado.' }

  const cuenta_id = formData.get('cuenta') as string
  const tipo = formData.get('tipoIngreso') as 'Ingreso' | 'Gasto'
  const monto = parseFloat(formData.get('valor') as string)
  const descripcion = formData.get('descripcion') as string
  const categoria_id = (formData.get('categoria') as string) || null
  const meta_id = (formData.get('meta') as string) || null
  const emisor_id = (formData.get('emisor') as string) || null
  const fecha = formData.get('fecha') as string

  if (!cuenta_id) return { error: 'Debes seleccionar una cuenta.' }
  if (isNaN(monto) || monto <= 0) return { error: 'El valor debe ser mayor a 0.' }

  const payload: MovimientoUpdate = {
    cuenta_id,
    tipo,
    monto,
    descripcion,
    categoria_id,
    meta_id,
    emisor_id,
    fecha,
  }

  const { error } = await (supabase.from('movimientos') as unknown as {
    update: (data: MovimientoUpdate) => {
      eq: (col: string, val: string) => Promise<{ error: { message: string } | null }>
    }
  })
    .update(payload)
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/home')
  revalidatePath('/movimientos')
  return { success: true }
}

export async function eliminarMovimiento(id: string): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autorizado' }

  if (!id) return { error: 'Movimiento no identificado.' }

  const { error } = await (supabase.from('movimientos') as unknown as {
    delete: () => {
      eq: (col: string, val: string) => Promise<{ error: { message: string } | null }>
    }
  })
    .delete()
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/home')
  revalidatePath('/movimientos')
  return { success: true }
}
