import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Usuario, Empresa } from '@/types/database.types'
import { NombreForm, PasswordForm } from './perfil-forms'
import { UserCircle } from 'lucide-react'

const infoCardStyle: React.CSSProperties = {
  background: 'white',
  borderRadius: 12,
  padding: 20,
  boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
}

const infoRowStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  padding: '8px 0',
  borderBottom: '1px solid #eee',
  fontSize: '0.9rem',
}

export default async function PerfilPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: usuario } = await supabase
    .from('usuarios')
    .select('*')
    .eq('id', user.id)
    .single() as unknown as { data: Usuario | null }

  if (!usuario) redirect('/login')

  const { data: empresa } = await supabase
    .from('empresas')
    .select('nombre, membresia, moneda')
    .eq('id', usuario.empresa_id)
    .single() as unknown as { data: Pick<Empresa, 'nombre' | 'membresia' | 'moneda'> | null }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '20px 15px' }}>
      <header style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 14 }}>
        <div
          style={{
            background: 'var(--color-empresa-principal)',
            color: 'white',
            width: 52,
            height: 52,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <UserCircle size={30} />
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: 'white' }}>
            {usuario.nombre}
          </h1>
          <p style={{ margin: '2px 0 0', fontSize: '0.85rem', color: 'rgba(255,255,255,0.85)' }}>
            {user.email}
          </p>
        </div>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={infoCardStyle}>
          <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#2c2c2c' }}>
            Información
          </h3>
          <div style={{ marginTop: 10 }}>
            <div style={infoRowStyle}>
              <span style={{ color: '#666' }}>Empresa</span>
              <span style={{ fontWeight: 600, color: '#212121' }}>{empresa?.nombre ?? '—'}</span>
            </div>
            <div style={infoRowStyle}>
              <span style={{ color: '#666' }}>Cargo</span>
              <span style={{ fontWeight: 600, color: '#212121' }}>{usuario.cargo}</span>
            </div>
            <div style={infoRowStyle}>
              <span style={{ color: '#666' }}>Rol</span>
              <span style={{ fontWeight: 600, color: '#212121' }}>
                {usuario.es_admin ? 'Administrador' : 'Usuario estándar'}
              </span>
            </div>
            <div style={infoRowStyle}>
              <span style={{ color: '#666' }}>Membresía</span>
              <span style={{ fontWeight: 600, color: '#212121' }}>{empresa?.membresia ?? '—'}</span>
            </div>
            <div style={{ ...infoRowStyle, borderBottom: 'none' }}>
              <span style={{ color: '#666' }}>Moneda</span>
              <span style={{ fontWeight: 600, color: '#212121' }}>{empresa?.moneda ?? '—'}</span>
            </div>
          </div>
        </div>

        <NombreForm nombreInicial={usuario.nombre} />
        <PasswordForm />
      </div>
    </div>
  )
}
