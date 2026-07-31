import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { MovimientosView } from '@/components/movimientos/movimientos-view'
import type { Cuenta, Categoria, Meta, Usuario } from '@/types/database.types'
import type { MovimientoRow, NavCategoria, NavMeta } from '@/components/movimientos/movimientos-view'

export default async function MovimientosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: usuarioData } = await supabase
    .from('usuarios')
    .select('empresa_id')
    .eq('id', user.id)
    .single() as unknown as { data: Pick<Usuario, 'empresa_id'> | null }

  const empresaId = usuarioData?.empresa_id

  const [{ data: cuentasRaw }, { data: movimientosRaw }, { data: categoriasRaw }, { data: metasRaw }] = await Promise.all([
    supabase
      .from('cuentas')
      .select('*')
      .order('created_at', { ascending: true }),
    supabase
      .from('movimientos')
      .select('id, tipo, monto, fecha, descripcion, cuenta_id, categoria_id, meta_id, categorias(nombre, icono), cuentas(nombre, tipo_cuenta)')
      .order('fecha', { ascending: false })
      .limit(300),
    supabase
      .from('categorias')
      .select('id, nombre, icono') as unknown as
      Promise<{ data: Pick<Categoria, 'id' | 'nombre' | 'icono'>[] | null }>,
    empresaId
      ? supabase
          .from('metas')
          .select('id, nombre, tipo')
          .eq('empresa_id', empresaId)
          .eq('tipo', 'Ahorro') as unknown as
          Promise<{ data: Pick<Meta, 'id' | 'nombre' | 'tipo'>[] | null }>
      : Promise.resolve({ data: null }),
  ])

  const cuentas = (cuentasRaw ?? []) as unknown as Cuenta[]
  const movimientos = (movimientosRaw ?? []) as unknown as MovimientoRow[]
  const categorias = (categoriasRaw ?? []) as NavCategoria[]
  const metas = (metasRaw ?? []) as NavMeta[]

  return <MovimientosView cuentas={cuentas} movimientos={movimientos} categorias={categorias} metas={metas} />
}
