import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DeudasView } from '@/components/deudas/deudas-view'
import type { Deuda, Cuenta } from '@/types/database.types'

interface DeudaConCuenta extends Deuda {
  cuentas: { nombre: string } | null
}

interface MovimientoRow {
  tipo: 'Ingreso' | 'Gasto'
  monto: number
}

export default async function DeudasPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const hace30Date = new Date()
  hace30Date.setDate(hace30Date.getDate() - 30)
  const hace30 = hace30Date.toISOString().split('T')[0]

  // Fetch en paralelo
  const [{ data: deudasRaw }, { data: cuentasRaw }, { data: movimientosRaw }] = await Promise.all([
    supabase
      .from('deudas')
      .select('*, cuentas(nombre)')
      .eq('usuario_id', user.id)
      .order('created_at', { ascending: false }) as unknown as
      Promise<{ data: DeudaConCuenta[] | null }>,

    supabase
      .from('cuentas')
      .select('*')
      .order('nombre') as unknown as
      Promise<{ data: Cuenta[] | null }>,

    supabase
      .from('movimientos')
      .select('tipo, monto')
      .eq('usuario_id', user.id)
      .gte('fecha', hace30) as unknown as
      Promise<{ data: MovimientoRow[] | null }>,
  ])

  const deudas = deudasRaw ?? []
  const cuentas = cuentasRaw ?? []
  const movimientos = movimientosRaw ?? []

  // ── Capacidad de pago ────────────────────────────────────────────────────────
  const ingresos30 = movimientos.filter(m => m.tipo === 'Ingreso').reduce((s, m) => s + m.monto, 0)
  const gastos30 = movimientos.filter(m => m.tipo === 'Gasto').reduce((s, m) => s + m.monto, 0)
  const capacidadPago = ingresos30 - gastos30

  let estadoCapacidad: 'saludable' | 'ajustado' | 'critico'
  if (capacidadPago <= 0) {
    estadoCapacidad = 'critico'
  } else if (ingresos30 > 0 && capacidadPago < ingresos30 * 0.20) {
    estadoCapacidad = 'ajustado'
  } else {
    estadoCapacidad = 'saludable'
  }

  // ── Métricas de deudas ───────────────────────────────────────────────────────
  const today = new Date().toISOString().split('T')[0]

  const deudasActivas = deudas.filter(d => d.estado !== 'pagada')
  const deudasPagadas = deudas.filter(d => d.estado === 'pagada')

  const totalDeuda = deudasActivas.reduce((s, d) => s + d.monto_total, 0)
  const totalPagado = deudasActivas.reduce((s, d) => s + d.monto_pagado, 0)
  const totalRestante = totalDeuda - totalPagado

  const pendientesCount = deudasActivas.filter(d => d.fecha_vencimiento >= today).length
  const vencidasCount = deudasActivas.filter(d => d.fecha_vencimiento < today).length
  const pagadasCount = deudasPagadas.length

  const porcentajeTotal = totalDeuda > 0 ? (totalPagado / totalDeuda) * 100 : 0

  const mesesEstimados = capacidadPago > 0 && totalRestante > 0
    ? Math.ceil(totalRestante / capacidadPago)
    : null

  return (
    <DeudasView
      deudas={deudas}
      cuentas={cuentas}
      totalDeuda={totalDeuda}
      totalPagado={totalPagado}
      totalRestante={totalRestante}
      pendientesCount={pendientesCount}
      vencidasCount={vencidasCount}
      pagadasCount={pagadasCount}
      porcentajeTotal={porcentajeTotal}
      capacidadPago={capacidadPago}
      estadoCapacidad={estadoCapacidad}
      mesesEstimados={mesesEstimados}
    />
  )
}
