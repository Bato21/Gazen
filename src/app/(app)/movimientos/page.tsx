import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { MovimientosView } from '@/components/movimientos/movimientos-view'
import type { Cuenta } from '@/types/database.types'
import type { MovimientoRow } from '@/components/movimientos/movimientos-view'

export default async function MovimientosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: cuentasRaw }, { data: movimientosRaw }] = await Promise.all([
    supabase
      .from('cuentas')
      .select('*')
      .order('created_at', { ascending: true }),
    supabase
      .from('movimientos')
      .select('id, tipo, monto, fecha, descripcion, cuenta_id, categorias(nombre, icono), cuentas(nombre, tipo_cuenta)')
      .order('fecha', { ascending: false })
      .limit(300),
  ])

  const cuentas = (cuentasRaw ?? []) as unknown as Cuenta[]
  const movimientos = (movimientosRaw ?? []) as unknown as MovimientoRow[]

  return <MovimientosView cuentas={cuentas} movimientos={movimientos} />
}
