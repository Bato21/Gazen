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

export async function crearCategoria(formData: FormData): Promise<Result> {
  const { empresaId, error: authError } = await getEmpresaId()
  if (authError || !empresaId) return { error: authError }

  const nombre = String(formData.get('nombre') ?? '').trim()
  const icono = String(formData.get('icono') ?? '').trim() || null

  if (!nombre) return { error: 'El nombre de la categoría es requerido.' }

  const supabase = await createClient()
  const { error } = await (supabase.from('categorias') as unknown as {
    insert: (data: object) => Promise<{ error: { message: string } | null }>
  }).insert({ empresa_id: empresaId, nombre, icono })

  if (error) return { error: error.message }

  revalidatePath('/categorias')
  revalidatePath('/', 'layout')
  return { success: true }
}

export async function editarCategoria(formData: FormData): Promise<Result> {
  const { empresaId, error: authError } = await getEmpresaId()
  if (authError || !empresaId) return { error: authError }

  const id = String(formData.get('id') ?? '')
  if (!id) return { error: 'Categoría no identificada.' }

  const nombre = String(formData.get('nombre') ?? '').trim()
  const icono = String(formData.get('icono') ?? '').trim() || null
  if (!nombre) return { error: 'El nombre de la categoría es requerido.' }

  const supabase = await createClient()

  // Sólo permitimos editar categorías propias de la empresa (RLS también lo bloquea)
  const { error } = await (supabase.from('categorias') as unknown as {
    update: (data: object) => {
      eq: (col: string, val: string) => {
        eq: (col: string, val: string) => Promise<{ error: { message: string } | null }>
      }
    }
  })
    .update({ nombre, icono })
    .eq('id', id)
    .eq('empresa_id', empresaId)

  if (error) return { error: error.message }

  revalidatePath('/categorias')
  revalidatePath('/', 'layout')
  return { success: true }
}

export async function eliminarCategoria(id: string): Promise<Result> {
  const { empresaId, error: authError } = await getEmpresaId()
  if (authError || !empresaId) return { error: authError }
  if (!id) return { error: 'Categoría no identificada.' }

  const supabase = await createClient()
  const { error } = await (supabase.from('categorias') as unknown as {
    delete: () => {
      eq: (col: string, val: string) => {
        eq: (col: string, val: string) => Promise<{ error: { message: string } | null }>
      }
    }
  })
    .delete()
    .eq('id', id)
    .eq('empresa_id', empresaId)

  if (error) return { error: error.message }

  revalidatePath('/categorias')
  revalidatePath('/', 'layout')
  return { success: true }
}
