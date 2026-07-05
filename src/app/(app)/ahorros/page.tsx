import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { NuevaMetaDialog } from '@/components/ahorro/nueva-meta-dialog'
import type { Meta } from '@/types/database.types'

function fmt(n: number) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(n)
}

function clamp(n: number) {
  return Math.min(100, Math.max(0, n))
}

export default async function AhorrosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: metasRaw } = await supabase
    .from('metas')
    .select('*')
    .eq('tipo', 'Ahorro')
    .order('created_at', { ascending: true }) as unknown as { data: Meta[] | null }

  const metas = metasRaw ?? []

  // Calcular totales (igual que el Django)
  const totalAhorrado = metas.reduce((s, m) => s + m.monto_actual, 0)
  const totalObjetivo = metas.reduce((s, m) => s + m.monto_objetivo, 0)
  const porcentajeProgreso = totalObjetivo > 0 ? (totalAhorrado / totalObjetivo) * 100 : 0

  // Alertas: metas con < 50% de progreso
  const alertas = metas
    .map((m) => ({
      meta: m,
      porcentaje: m.monto_objetivo > 0 ? (m.monto_actual / m.monto_objetivo) * 100 : 0,
    }))
    .filter(({ porcentaje }) => porcentaje < 50)
    .map(({ meta, porcentaje }) =>
      porcentaje === 0
        ? `La meta "${meta.nombre}" aún no tiene progreso`
        : `La meta "${meta.nombre}" está por debajo del 50% (${porcentaje.toFixed(0)}%)`
    )

  const cardStyle: React.CSSProperties = {
    background: '#fff', borderRadius: '12px', padding: '30px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.1)', border: '1px solid rgba(0,0,0,0.05)',
  }
  const h2Style: React.CSSProperties = {
    margin: '0 0 20px 0', fontWeight: 600, fontSize: '1.8rem',
    borderBottom: '2px solid var(--color-empresa-principal)', paddingBottom: '10px',
    color: 'var(--color-empresa-secundario)',
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '450px 1fr',
      gridTemplateRows: 'auto 1fr',
      gap: '20px',
      padding: '20px',
      minHeight: 'calc(100vh - 100px)',
    }}>

      {/* ── Columna izquierda: metas (spans 2 rows) ── */}
      <div style={{
        ...cardStyle,
        gridRow: '1 / 3',
        overflowY: 'auto',
        maxHeight: 'calc(100vh - 140px)',
      }}>
        <h2 style={{ ...h2Style, textAlign: 'center' }}>Mis Metas de Ahorro</h2>

        {metas.length === 0 && (
          <p style={{ color: '#666', textAlign: 'center', padding: '20px 0' }}>
            No tienes metas de ahorro aún
          </p>
        )}

        {metas.map((meta) => {
          const porcentaje = meta.monto_objetivo > 0
            ? clamp((meta.monto_actual / meta.monto_objetivo) * 100)
            : 0
          const falta = Math.max(0, meta.monto_objetivo - meta.monto_actual)

          return (
            <div key={meta.id} style={{
              background: '#f8f9fa', borderRadius: '10px', padding: '18px',
              marginBottom: '12px', border: '1px solid #e0e0e0',
              transition: 'all 0.3s ease', cursor: 'default',
            }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLDivElement
                el.style.background = '#f0f0f0'
                el.style.transform = 'translateX(5px)'
                el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)'
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLDivElement
                el.style.background = '#f8f9fa'
                el.style.transform = 'translateX(0)'
                el.style.boxShadow = 'none'
              }}
            >
              {/* Nombre */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ color: '#333', fontSize: '1.1rem', fontWeight: 600 }}>
                  {meta.nombre}
                </span>
                {meta.fecha_limite && (
                  <span style={{ fontSize: '0.75rem', color: '#999' }}>
                    hasta {new Date(meta.fecha_limite).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </span>
                )}
              </div>

              {/* Montos */}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                <span style={{ color: '#27AE60', fontWeight: 600 }}>{fmt(meta.monto_actual)}</span>
                <span style={{ color: 'var(--color-empresa-principal)', fontWeight: 600 }}>{fmt(meta.monto_objetivo)}</span>
              </div>

              {/* Barra de progreso */}
              <div style={{
                background: '#e0e0e0', height: '20px', borderRadius: '10px',
                overflow: 'hidden', border: '1px solid #ccc',
              }}>
                <div style={{
                  background: 'linear-gradient(90deg, #27AE60 0%, #2ECC71 100%)',
                  width: `${porcentaje}%`, height: '100%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.75rem', fontWeight: 700, color: '#fff',
                  transition: 'width 0.5s ease', minWidth: porcentaje > 0 ? '28px' : '0',
                }}>
                  {porcentaje > 8 ? `${porcentaje.toFixed(0)}%` : ''}
                </div>
              </div>

              {/* Falta */}
              <div style={{ textAlign: 'right', fontSize: '0.8rem', color: '#999', marginTop: '5px' }}>
                Falta: {fmt(falta)}
              </div>
            </div>
          )
        })}

        <NuevaMetaDialog />
      </div>

      {/* ── Derecha fila 1: Caja Chica ── */}
      <div style={{ ...cardStyle, gridRow: '1', height: 'fit-content' }}>
        <h2 style={{ ...h2Style, borderBottomColor: '#27AE60' }}>Caja Chica</h2>

        <div style={{ color: '#27AE60', fontSize: '2.2rem', fontWeight: 700, marginBottom: '20px' }}>
          {fmt(totalAhorrado)} disponibles
        </div>

        {/* Barra amarilla */}
        <div style={{
          background: '#e0e0e0', height: '30px', borderRadius: '15px',
          overflow: 'hidden', marginBottom: '10px', border: '1px solid #ccc',
        }}>
          <div style={{
            background: 'linear-gradient(90deg, #f39c12 0%, #f1c40f 100%)',
            width: `${clamp(porcentajeProgreso)}%`, height: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
            paddingRight: '12px', fontWeight: 700, color: '#fff',
            transition: 'width 0.5s ease', fontSize: '0.9rem',
          }}>
            {porcentajeProgreso > 10 ? `${porcentajeProgreso.toFixed(0)}%` : ''}
          </div>
        </div>

        <div style={{ color: '#666', fontSize: '1.1rem' }}>
          Total del ahorro: {fmt(totalObjetivo)}
        </div>
      </div>

      {/* ── Derecha fila 2: Alertas ── */}
      <div style={{ gridRow: '2', display: 'flex', flexDirection: 'column', gap: '15px', alignContent: 'flex-start' }}>
        {alertas.length === 0 ? (
          <div style={{
            ...cardStyle, display: 'flex', alignItems: 'center', gap: '15px',
            border: '2px solid #27AE60',
          }}>
            <span style={{ fontSize: '2rem' }}>✅</span>
            <span style={{ color: '#27AE60', fontSize: '1.05rem', fontWeight: 600 }}>
              ¡Todas tus metas van bien!
            </span>
          </div>
        ) : (
          alertas.map((msg, i) => (
            <div key={i} style={{
              ...cardStyle, display: 'flex', alignItems: 'center', gap: '15px',
              border: '2px solid var(--color-empresa-principal)',
              transition: 'transform 0.2s',
            }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)' }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)' }}
            >
              <span style={{ fontSize: '2rem' }}>⚠️</span>
              <span style={{ color: 'var(--color-empresa-principal)', fontSize: '1.05rem', fontWeight: 600, flexGrow: 1, textAlign: 'center' }}>
                {msg}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
