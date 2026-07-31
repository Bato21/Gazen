import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Empresa, Usuario, Cuenta, Categoria, Meta } from '@/types/database.types'
import { AppNavbar } from '@/components/app-navbar'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const [
    { data: usuarioData },
    { data: cuentasData },
    { data: categoriasData },
  ] = await Promise.all([
    supabase
      .from('usuarios')
      .select('*')
      .eq('id', user.id)
      .single() as unknown as Promise<{ data: Usuario | null }>,
    supabase
      .from('cuentas')
      .select('id, nombre, tipo_cuenta') as unknown as Promise<{ data: Pick<Cuenta, 'id' | 'nombre' | 'tipo_cuenta'>[] | null }>,
    supabase
      .from('categorias')
      .select('id, nombre, icono') as unknown as Promise<{ data: Pick<Categoria, 'id' | 'nombre' | 'icono'>[] | null }>,
  ])

  const usuario = usuarioData as Usuario | null

  // Fetch empresa and metas (depend on usuario)
  const empresaId = usuario?.empresa_id
  const [
    { data: empresaData },
    { data: metasData },
  ] = await Promise.all([
    empresaId
      ? supabase
          .from('empresas')
          .select('*')
          .eq('id', empresaId)
          .single() as unknown as Promise<{ data: Empresa | null }>
      : Promise.resolve({ data: null }),
    empresaId
      ? supabase
          .from('metas')
          .select('id, nombre, tipo')
          .eq('empresa_id', empresaId)
          .eq('tipo', 'Ahorro') as unknown as Promise<{ data: Pick<Meta, 'id' | 'nombre' | 'tipo'>[] | null }>
      : Promise.resolve({ data: null }),
  ])

  const empresa: Empresa = empresaData ?? {
    id: '',
    nombre: 'Gazen Libreta',
    direccion: null,
    membresia: 'Gratis',
    moneda: 'MXN',
    color_principal: '#C0392B',
    color_secundario: '#2c2c2c',
    created_at: '',
  }

  const cuentas = cuentasData ?? []
  const categorias = categoriasData ?? []
  const metas = metasData ?? []

  return (
    <div
      className="gazen-bg min-h-screen"
      style={{
        '--color-empresa-principal': empresa.color_principal,
        '--color-empresa-secundario': empresa.color_secundario,
        position: 'relative',
      } as React.CSSProperties}
    >
      {/* Content above the ::before overlay */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <AppNavbar
          nombreEmpresa={empresa.nombre}
          nombreUsuario={usuario?.nombre ?? user.email ?? 'Usuario'}
          userEmail={user.email ?? ''}
          esAdmin={usuario?.es_admin ?? false}
          cuentas={cuentas}
          categorias={categorias}
          metas={metas}
        />
        <main style={{ padding: '15px' }}>
          {children}
        </main>
      </div>
    </div>
  )
}
