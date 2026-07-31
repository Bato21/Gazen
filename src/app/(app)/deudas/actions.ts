'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Usuario } from '@/types/database.types'

export async function crearDeuda(formData: FormData): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autorizado' }

  const { data: usuario } = await supabase
    .from('usuarios').select('empresa_id').eq('id', user.id).single() as unknown as { data: Pick<Usuario, 'empresa_id'> | null }
  if (!usuario) return { error: 'Usuario no encontrado' }

  const acreedor = (formData.get('nombre_deuda') as string)?.trim()
  const montoTotal = parseFloat(formData.get('monto_total') as string)
  const tasaInteres = parseFloat(formData.get('tasa_interes') as string) || 0
  const numeroCuotas = parseInt(formData.get('numero_cuotas') as string) || null
  const cuentaId = (formData.get('idCuenta') as string) || null
  const fechaVencimiento = (formData.get('fecha_vencimiento') as string) || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]
  const descripcion = (formData.get('descripcion') as string)?.trim() || null

  if (!acreedor) return { error: 'El nombre de la deuda es requerido.' }
  if (isNaN(montoTotal) || montoTotal <= 0) return { error: 'El monto total debe ser mayor a 0.' }

  const { error } = await (supabase.from('deudas') as unknown as {
    insert: (data: object) => Promise<{ error: { message: string } | null }>
  }).insert({
    usuario_id: user.id,
    cuenta_id: cuentaId,
    acreedor,
    descripcion,
    monto_total: montoTotal,
    tasa_interes: tasaInteres,
    numero_cuotas: numeroCuotas,
    fecha_vencimiento: fechaVencimiento,
  })

  if (error) return { error: error.message }

  revalidatePath('/deudas')
  return { success: true }
}

export async function registrarPago(formData: FormData): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autorizado' }

  const deudaId = formData.get('deuda_id') as string
  const montoPago = parseFloat(formData.get('monto_pago') as string)
  const fechaPago = (formData.get('fecha_pago') as string) || new Date().toISOString().split('T')[0]
  const nota = (formData.get('nota') as string)?.trim() || null
  const tasaInteres = parseFloat(formData.get('tasa_interes') as string)

  if (!deudaId) return { error: 'Deuda no identificada.' }
  if (isNaN(montoPago) || montoPago <= 0) return { error: 'El monto a pagar debe ser mayor a 0.' }

  // Fetch current debt
  const { data: deuda } = await supabase
    .from('deudas').select('monto_total, monto_pagado').eq('id', deudaId).single() as unknown as
    { data: { monto_total: number; monto_pagado: number } | null }
  if (!deuda) return { error: 'Deuda no encontrada.' }

  const nuevoMontoPagado = Math.min(deuda.monto_total, deuda.monto_pagado + montoPago)
  const quedaPendiente = nuevoMontoPagado < deuda.monto_total

  // Insert pago record
  const { error: pagoError } = await (supabase.from('pagos_deuda') as unknown as {
    insert: (data: object) => Promise<{ error: { message: string } | null }>
  }).insert({ deuda_id: deudaId, monto: montoPago, fecha_pago: fechaPago, nota })

  if (pagoError) return { error: pagoError.message }

  // Update deuda
  const updateData: Record<string, unknown> = { monto_pagado: nuevoMontoPagado }
  if (!quedaPendiente) updateData.estado = 'pagada'
  if (!isNaN(tasaInteres)) updateData.tasa_interes = tasaInteres

  await (supabase.from('deudas') as unknown as {
    update: (data: object) => { eq: (col: string, val: string) => Promise<unknown> }
  }).update(updateData).eq('id', deudaId)

  revalidatePath('/deudas')
  return { success: true }
}

export async function editarDeuda(formData: FormData): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autorizado' }

  const id = formData.get('id') as string
  if (!id) return { error: 'Deuda no identificada.' }

  const acreedor = (formData.get('nombre_deuda') as string)?.trim()
  const montoTotal = parseFloat(formData.get('monto_total') as string)
  const tasaInteres = parseFloat(formData.get('tasa_interes') as string) || 0
  const numeroCuotas = parseInt(formData.get('numero_cuotas') as string) || null
  const cuentaId = (formData.get('idCuenta') as string) || null
  const fechaVencimiento = formData.get('fecha_vencimiento') as string
  const descripcion = (formData.get('descripcion') as string)?.trim() || null
  const prioridad = (formData.get('prioridad') as 'alta' | 'media' | 'baja') || 'media'

  if (!acreedor) return { error: 'El nombre de la deuda es requerido.' }
  if (isNaN(montoTotal) || montoTotal <= 0) return { error: 'El monto total debe ser mayor a 0.' }
  if (!fechaVencimiento) return { error: 'La fecha de vencimiento es requerida.' }

  // Verifica que el nuevo monto total no sea menor a lo ya pagado
  const { data: actual } = await supabase
    .from('deudas').select('monto_pagado').eq('id', id).single() as unknown as
    { data: { monto_pagado: number } | null }
  if (actual && montoTotal < actual.monto_pagado) {
    return { error: `El nuevo monto total (${montoTotal}) no puede ser menor a lo ya pagado (${actual.monto_pagado}).` }
  }

  const { error } = await (supabase.from('deudas') as unknown as {
    update: (data: object) => {
      eq: (col: string, val: string) => Promise<{ error: { message: string } | null }>
    }
  })
    .update({
      acreedor,
      descripcion,
      monto_total: montoTotal,
      tasa_interes: tasaInteres,
      numero_cuotas: numeroCuotas,
      cuenta_id: cuentaId,
      fecha_vencimiento: fechaVencimiento,
      prioridad,
    })
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/deudas')
  return { success: true }
}

export async function eliminarDeuda(id: string): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autorizado' }
  if (!id) return { error: 'Deuda no identificada.' }

  const { error } = await (supabase.from('deudas') as unknown as {
    delete: () => {
      eq: (col: string, val: string) => Promise<{ error: { message: string } | null }>
    }
  }).delete().eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/deudas')
  return { success: true }
}

export async function cambiarEstadoDeuda(
  id: string,
  nuevoEstado: 'activa' | 'pagada' | 'cancelada',
): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autorizado' }
  if (!id) return { error: 'Deuda no identificada.' }

  const { error } = await (supabase.from('deudas') as unknown as {
    update: (data: object) => {
      eq: (col: string, val: string) => Promise<{ error: { message: string } | null }>
    }
  })
    .update({ estado: nuevoEstado })
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/deudas')
  return { success: true }
}
