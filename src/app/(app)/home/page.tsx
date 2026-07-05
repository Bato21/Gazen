import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { BalanceChart } from '@/components/charts/balance-chart'
import { GastosPieChart } from '@/components/charts/pie-chart'

interface MovimientoRow {
  tipo: 'Ingreso' | 'Gasto'
  monto: number
  fecha: string
  categoria_id: string | null
}

interface CategoriaRow {
  id: string
  nombre: string
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount)
}

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Fetch last 30 days of movements
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const thirtyDaysAgoStr = thirtyDaysAgo.toISOString()

  // Fetch last 6 months of movements for monthly chart
  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

  const [res30, res6m, resCat] = await Promise.all([
    supabase
      .from('movimientos')
      .select('tipo, monto, fecha, categoria_id')
      .gte('fecha', thirtyDaysAgoStr)
      .order('fecha', { ascending: false }),
    supabase
      .from('movimientos')
      .select('tipo, monto, fecha')
      .gte('fecha', sixMonthsAgo.toISOString())
      .order('fecha', { ascending: true }),
    supabase.from('categorias').select('id, nombre'),
  ])

  const movimientos30 = (res30.data ?? []) as unknown as MovimientoRow[]
  const movimientos6m = (res6m.data ?? []) as unknown as Pick<MovimientoRow, 'tipo' | 'monto' | 'fecha'>[]
  const categorias = (resCat.data ?? []) as unknown as CategoriaRow[]

  // Calculate balance last 30 days
  const ingresos30 = movimientos30
    .filter((m) => m.tipo === 'Ingreso')
    .reduce((sum, m) => sum + (m.monto ?? 0), 0)

  const gastos30 = movimientos30
    .filter((m) => m.tipo === 'Gasto')
    .reduce((sum, m) => sum + (m.monto ?? 0), 0)

  const balance30 = ingresos30 - gastos30

  // Build monthly chart data (last 6 months)
  const MONTH_NAMES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
  const monthlyMap: Record<string, { mes: string; ingresos: number; gastos: number }> = {}

  for (let i = 5; i >= 0; i--) {
    const d = new Date()
    d.setMonth(d.getMonth() - i)
    const key = `${d.getFullYear()}-${d.getMonth()}`
    monthlyMap[key] = { mes: MONTH_NAMES[d.getMonth()], ingresos: 0, gastos: 0 }
  }

  movimientos6m.forEach((m) => {
    const d = new Date(m.fecha)
    const key = `${d.getFullYear()}-${d.getMonth()}`
    if (monthlyMap[key]) {
      if (m.tipo === 'Ingreso') monthlyMap[key].ingresos += m.monto ?? 0
      else if (m.tipo === 'Gasto') monthlyMap[key].gastos += m.monto ?? 0
    }
  })

  const chartData = Object.values(monthlyMap)

  // Build category breakdown for pie chart (gastos by category, last 30 days)
  const catMap: Record<string, number> = {}
  movimientos30
    .filter((m) => m.tipo === 'Gasto')
    .forEach((m) => {
      const catId = m.categoria_id ?? 'sin-categoria'
      catMap[catId] = (catMap[catId] ?? 0) + (m.monto ?? 0)
    })

  const catNombres: Record<string, string> = {}
  categorias.forEach((c) => {
    catNombres[c.id] = c.nombre
  })

  const pieData = Object.entries(catMap)
    .map(([id, total]) => ({
      nombre: catNombres[id] ?? 'Sin categoría',
      total,
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 8)

  // Recent transactions (last 5)
  const recentMovimientos = movimientos30.slice(0, 5)

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '15px',
      }}
    >
      {/* Card 1: Balance mensual */}
      <div className="dashboard-card">
        <h2>Balance — Últimos 30 días</h2>
        <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: '4px' }}>Ingresos</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#27AE60' }}>
              {formatCurrency(ingresos30)}
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: '4px' }}>Gastos</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#C0392B' }}>
              {formatCurrency(gastos30)}
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: '4px' }}>Resultado</div>
            <div
              style={{
                fontSize: '1.5rem',
                fontWeight: 700,
                color: balance30 >= 0 ? '#27AE60' : '#C0392B',
              }}
            >
              {formatCurrency(balance30)}
            </div>
          </div>
        </div>

        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#444', marginBottom: '8px' }}>
          Últimos movimientos
        </div>
        {recentMovimientos.length === 0 ? (
          <p style={{ color: '#999', fontSize: '0.9rem' }}>Sin movimientos recientes.</p>
        ) : (
          recentMovimientos.map((m, i) => (
            <div key={i} className="transaccion-item">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.9rem', color: '#333' }}>
                  {new Date(m.fecha).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })}
                </span>
                <span
                  style={{
                    fontWeight: 700,
                    color: m.tipo === 'Ingreso' ? '#27AE60' : '#C0392B',
                  }}
                >
                  {m.tipo === 'Ingreso' ? '+' : '-'}{formatCurrency(m.monto ?? 0)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Card 2: Gráfico mensual */}
      <div className="dashboard-card">
        <h2>Gastos e Ingresos Mensuales</h2>
        <BalanceChart data={chartData} />
      </div>

      {/* Card 3: Pie chart por categoría */}
      <div className="dashboard-card">
        <h2>Gastos por Categoría</h2>
        <GastosPieChart data={pieData} />
      </div>

      {/* Card 4: Próximamente */}
      <div className="dashboard-card">
        <h2>Noticias & Próximamente</h2>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '180px',
            color: '#aaa',
            fontSize: '1rem',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <span style={{ fontSize: '2rem' }}>📰</span>
          <span>Panel de noticias — próximamente</span>
        </div>
      </div>
    </div>
  )
}
