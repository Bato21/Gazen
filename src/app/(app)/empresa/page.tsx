import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Usuario, Empresa, Cuenta } from '@/types/database.types'
import { EmpresaForm } from './empresa-form'
import { CuentasPanel } from './cuentas-panel'
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

  const [{ data: empresa }, { data: cuentasRaw }] = await Promise.all([
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
  ])

  if (!empresa) redirect('/perfil')

  const cuentas = cuentasRaw ?? []

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
      </div>
    </div>
  )
}
