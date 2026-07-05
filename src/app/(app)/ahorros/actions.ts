'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Usuario } from '@/types/database.types'

export async function crearMeta(formData: FormData): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autorizado' }

  const { data: usuario } = await supabase
    .from('usuarios').select('empresa_id').eq('id', user.id).single() as unknown as { data: Pick<Usuario, 'empresa_id'> | null }
  if (!usuario) return { error: 'Usuario no encontrado' }

  const nombre = (formData.get('nombre_meta') as string)?.trim()
  const montoObjetivo = parseFloat(formData.get('monto_objetivo') as string)
  const montoInicial = parseFloat(formData.get('monto_inicial') as string)
  const fechaLimite = (formData.get('fecha_limite') as string) || null

  if (!nombre) return { error: 'El nombre de la meta es requerido.' }
  if (isNaN(montoObjetivo) || montoObjetivo <= 0) return { error: 'El monto objetivo debe ser mayor a 0.' }
  if (isNaN(montoInicial) || montoInicial < 0) return { error: 'El monto inicial no puede ser negativo.' }

  const { error } = await (supabase.from('metas') as unknown as {
    insert: (data: object) => Promise<{ error: { message: string } | null }>
  }).insert({
    empresa_id: usuario.empresa_id,
    tipo: 'Ahorro',
    nombre,
    monto_objetivo: montoObjetivo,
    monto_actual: montoInicial,
    fecha_inicio: new Date().toISOString().split('T')[0],
    fecha_limite: fechaLimite,
  })

  if (error) return { error: error.message }

  revalidatePath('/ahorros')
  return { success: true }
}
