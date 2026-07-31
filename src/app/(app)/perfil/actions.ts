'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export type PerfilResult = { error?: string; success?: string }

export async function actualizarNombre(formData: FormData): Promise<PerfilResult> {
  const nuevoNombre = String(formData.get('nombre') ?? '').trim()
  if (!nuevoNombre) return { error: 'El nombre no puede estar vacío.' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autorizado.' }

  const { error } = await (supabase.from('usuarios') as unknown as {
    update: (data: object) => {
      eq: (col: string, val: string) => Promise<{ error: { message: string } | null }>
    }
  })
    .update({ nombre: nuevoNombre })
    .eq('id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/perfil')
  revalidatePath('/', 'layout')
  return { success: 'Nombre actualizado.' }
}

export async function cambiarPassword(formData: FormData): Promise<PerfilResult> {
  const actual = String(formData.get('password_actual') ?? '')
  const nueva = String(formData.get('password_nueva') ?? '')
  const confirmar = String(formData.get('password_confirmar') ?? '')

  if (!actual || !nueva) return { error: 'Completa todos los campos.' }
  if (nueva !== confirmar) return { error: 'La nueva contraseña y la confirmación no coinciden.' }
  if (nueva.length < 8) return { error: 'La nueva contraseña debe tener al menos 8 caracteres.' }
  if (!/[A-Z]/.test(nueva) || !/[a-z]/.test(nueva) || !/\d/.test(nueva)) {
    return { error: 'La nueva contraseña debe incluir mayúscula, minúscula y número.' }
  }
  if (actual === nueva) return { error: 'La nueva contraseña debe ser distinta a la actual.' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !user.email) return { error: 'No autorizado.' }

  // Verificar la contraseña actual re-autenticando
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: actual,
  })
  if (signInError) return { error: 'La contraseña actual es incorrecta.' }

  const { error } = await supabase.auth.updateUser({ password: nueva })
  if (error) return { error: error.message }

  return { success: 'Contraseña actualizada.' }
}
