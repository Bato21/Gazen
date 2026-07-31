'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export type RegistroEmpresaState = { error: string } | null

const MONEDAS = ['MXN', 'USD', 'EUR'] as const
type Moneda = (typeof MONEDAS)[number]

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

export async function registrarEmpresa(
  _prev: RegistroEmpresaState,
  formData: FormData,
): Promise<RegistroEmpresaState> {
  const nombreEmpresa = String(formData.get('nombreEmpresa') ?? '').trim()
  const direccion = String(formData.get('direccion') ?? '').trim() || null
  const moneda = String(formData.get('moneda') ?? 'MXN') as Moneda
  const colorPrincipal = String(formData.get('colorPrincipal') ?? '#C0392B')
  const colorSecundario = String(formData.get('colorSecundario') ?? '#2c2c2c')

  const nombreUsuario = String(formData.get('nombreUsuario') ?? '').trim()
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  const password = String(formData.get('password') ?? '')

  if (!nombreEmpresa) return { error: 'Ingresa el nombre de la empresa.' }
  if (!nombreUsuario) return { error: 'Ingresa tu nombre.' }
  if (!email) return { error: 'Ingresa tu correo.' }
  if (!MONEDAS.includes(moneda)) return { error: 'Moneda inválida.' }

  const pwError = validarPassword(password)
  if (pwError) return { error: pwError }

  const admin = createAdminClient()

  const { data: existente } = await (admin.from('empresas') as unknown as {
    select: (cols: string) => {
      ilike: (col: string, val: string) => {
        maybeSingle: () => Promise<{ data: { id: string } | null }>
      }
    }
  })
    .select('id')
    .ilike('nombre', nombreEmpresa)
    .maybeSingle()

  if (existente) {
    return { error: `Ya existe una empresa con el nombre "${nombreEmpresa}".` }
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

  const { data: empresa, error: empresaError } = await (admin.from('empresas') as unknown as {
    insert: (data: object) => {
      select: (cols: string) => {
        single: () => Promise<{ data: { id: string } | null; error: { message: string } | null }>
      }
    }
  })
    .insert({
      nombre: nombreEmpresa,
      direccion,
      membresia: 'Gratis',
      moneda,
      color_principal: colorPrincipal,
      color_secundario: colorSecundario,
    })
    .select('id')
    .single()

  if (empresaError || !empresa) {
    await admin.auth.admin.deleteUser(authUserId)
    return { error: empresaError?.message ?? 'No se pudo crear la empresa.' }
  }

  const { error: usuarioError } = await (admin.from('usuarios') as unknown as {
    insert: (data: object) => Promise<{ error: { message: string } | null }>
  }).insert({
    id: authUserId,
    empresa_id: empresa.id,
    nombre: nombreUsuario,
    cargo: 'Administrador',
    es_admin: true,
  })

  if (usuarioError) {
    await (admin.from('empresas') as unknown as {
      delete: () => { eq: (col: string, val: string) => Promise<unknown> }
    }).delete().eq('id', empresa.id)
    await admin.auth.admin.deleteUser(authUserId)
    return { error: usuarioError.message }
  }

  // Log in inmediato con anon client (setea cookies de sesión)
  const supabase = await createClient()
  const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
  if (signInError) {
    return { error: 'Empresa creada, pero fallo el ingreso automático. Ve a Iniciar sesión.' }
  }

  redirect('/home')
}
