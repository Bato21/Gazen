'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Usuario } from '@/types/database.types'

type Result = { error?: string; success?: boolean }

async function getEmpresaId(): Promise<{ empresaId?: string; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autorizado' }

  const { data: usuario } = await supabase
    .from('usuarios').select('empresa_id').eq('id', user.id).single() as unknown as
    { data: Pick<Usuario, 'empresa_id'> | null }
  if (!usuario) return { error: 'Usuario no encontrado' }
  return { empresaId: usuario.empresa_id }
}

export async function crearEmisor(formData: FormData): Promise<Result> {
  const { empresaId, error: authError } = await getEmpresaId()
  if (authError || !empresaId) return { error: authError }

  const nombre = String(formData.get('nombre') ?? '').trim()
  const direccion = String(formData.get('direccion') ?? '').trim() || null

  if (!nombre) return { error: 'El nombre del emisor es requerido.' }

  const supabase = await createClient()
  const { error } = await (supabase.from('emisores') as unknown as {
    insert: (data: object) => Promise<{ error: { message: string } | null }>
  }).insert({ empresa_id: empresaId, nombre, direccion })

  if (error) return { error: error.message }

  revalidatePath('/emisores')
  revalidatePath('/movimientos')
  return { success: true }
}

export async function editarEmisor(formData: FormData): Promise<Result> {
  const { empresaId, error: authError } = await getEmpresaId()
  if (authError || !empresaId) return { error: authError }

  const id = String(formData.get('id') ?? '')
  if (!id) return { error: 'Emisor no identificado.' }

  const nombre = String(formData.get('nombre') ?? '').trim()
  const direccion = String(formData.get('direccion') ?? '').trim() || null
  if (!nombre) return { error: 'El nombre del emisor es requerido.' }

  const supabase = await createClient()
  const { error } = await (supabase.from('emisores') as unknown as {
    update: (data: object) => {
      eq: (col: string, val: string) => Promise<{ error: { message: string } | null }>
    }
  })
    .update({ nombre, direccion })
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/emisores')
  revalidatePath('/movimientos')
  return { success: true }
}

export async function eliminarEmisor(id: string): Promise<Result> {
  const { error: authError } = await getEmpresaId()
  if (authError) return { error: authError }
  if (!id) return { error: 'Emisor no identificado.' }

  const supabase = await createClient()
  const { error } = await (supabase.from('emisores') as unknown as {
    delete: () => {
      eq: (col: string, val: string) => Promise<{ error: { message: string } | null }>
    }
  }).delete().eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/emisores')
  revalidatePath('/movimientos')
  return { success: true }
}
