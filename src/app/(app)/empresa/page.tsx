import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { Usuario, Empresa, Cuenta } from '@/types/database.types'
import { EmpresaForm } from './empresa-form'
import { CuentasPanel } from './cuentas-panel'
import { UsuariosPanel, type UsuarioRow } from './usuarios-panel'
import { Building2 } from 'lucide-react'

export default async function EmpresaPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: usuario } = await supabase
    .from('usuarios')
    .select('*')
    .eq('id', user.id)
    .single() as unknown as { data: Usuario | null }

  if (!usuario) redirect('/login')
  if (!usuario.es_admin) redirect('/perfil')

  const [{ data: empresa }, { data: cuentasRaw }, { data: usuariosRaw }] = await Promise.all([
    supabase
      .from('empresas')
      .select('*')
      .eq('id', usuario.empresa_id)
      .single() as unknown as Promise<{ data: Empresa | null }>,
    supabase
      .from('cuentas')
      .select('*')
      .eq('empresa_id', usuario.empresa_id)
      .order('created_at', { ascending: true }) as unknown as Promise<{ data: Cuenta[] | null }>,
    supabase
      .from('usuarios')
      .select('*')
      .eq('empresa_id', usuario.empresa_id)
      .order('created_at', { ascending: true }) as unknown as Promise<{ data: Usuario[] | null }>,
  ])

  if (!empresa) redirect('/perfil')

  const cuentas = cuentasRaw ?? []
  const usuariosBase = usuariosRaw ?? []

  // Fetch emails via admin client (auth.users no es accesible con RLS)
  const admin = createAdminClient()
  const emailById = new Map<string, string>()
  const perPage = 200
  let page = 1
  // Bucle mientras haya páginas — para PYMEs cabe todo en 1 sola
  while (true) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage })
    if (error || !data) break
    for (const u of data.users) if (u.email) emailById.set(u.id, u.email)
    if (data.users.length < perPage) break
    page += 1
  }

  const usuarios: UsuarioRow[] = usuariosBase.map((u) => ({
    id: u.id,
    nombre: u.nombre,
    email: emailById.get(u.id) ?? '(sin correo)',
    cargo: u.cargo,
    es_admin: u.es_admin,
    is_self: u.id === user.id,
  }))

  return (
    <div style={{ maxWidth: 820, margin: '0 auto', padding: '20px 15px' }}>
      <header style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{
          background: 'var(--color-empresa-principal)', color: 'white',
          width: 52, height: 52, borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Building2 size={28} />
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: 'white' }}>
            Mi empresa
          </h1>
          <p style={{ margin: '2px 0 0', fontSize: '0.85rem', color: 'rgba(255,255,255,0.85)' }}>
            {empresa.nombre} · membresía {empresa.membresia}
          </p>
        </div>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <EmpresaForm empresa={empresa} />
        <CuentasPanel cuentas={cuentas} esAdmin={usuario.es_admin} />
        <UsuariosPanel usuarios={usuarios} />
      </div>
    </div>
  )
}
