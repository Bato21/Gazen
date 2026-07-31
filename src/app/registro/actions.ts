'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export type RegistroState = { error: string } | null

function validarPassword(pw: string): string | null {
  if (pw.length < 8) return 'La contraseña debe tener al menos 8 caracteres.'
  const hasUpper = /[A-Z]/.test(pw)
  const hasLower = /[a-z]/.test(pw)
  const hasNumber = /\d/.test(pw)
  if (!hasUpper || !hasLower || !hasNumber) {
    return 'La contraseña debe incluir mayúscula, minúscula y número.'
  }
  return null
}

export async function registrarUsuario(
  _prev: RegistroState,
  formData: FormData,
): Promise<RegistroState> {
  const nombreEmpresa = String(formData.get('nombreEmpresa') ?? '').trim()
  const nombreUsuario = String(formData.get('nombreUsuario') ?? '').trim()
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  const password = String(formData.get('password') ?? '')

  if (!nombreEmpresa) return { error: 'Ingresa el nombre de la empresa.' }
  if (!nombreUsuario) return { error: 'Ingresa tu nombre.' }
  if (!email) return { error: 'Ingresa tu correo.' }

  const pwError = validarPassword(password)
  if (pwError) return { error: pwError }

  const admin = createAdminClient()

  const { data: empresa } = await (admin.from('empresas') as unknown as {
    select: (cols: string) => {
      ilike: (col: string, val: string) => {
        maybeSingle: () => Promise<{ data: { id: string } | null }>
      }
    }
  })
    .select('id')
    .ilike('nombre', nombreEmpresa)
    .maybeSingle()

  if (!empresa) {
    return { error: `La empresa "${nombreEmpresa}" no existe. Verifica el nombre o regístrala primero.` }
  }

  const { data: authData, error: authError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { nombre: nombreUsuario },
  })
  if (authError || !authData.user) {
    return { error: authError?.message ?? 'No se pudo crear el usuario de acceso.' }
  }
  const authUserId = authData.user.id

  const { error: usuarioError } = await (admin.from('usuarios') as unknown as {
    insert: (data: object) => Promise<{ error: { message: string } | null }>
  }).insert({
    id: authUserId,
    empresa_id: empresa.id,
    nombre: nombreUsuario,
    cargo: 'Usuario',
    es_admin: false,
  })

  if (usuarioError) {
    await admin.auth.admin.deleteUser(authUserId)
    return { error: usuarioError.message }
  }

  const supabase = await createClient()
  const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
  if (signInError) {
    return { error: 'Usuario creado, pero falló el ingreso automático. Ve a Iniciar sesión.' }
  }

  redirect('/home')
}
