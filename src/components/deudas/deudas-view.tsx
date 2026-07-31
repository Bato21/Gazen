'use client'

import { useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { X, Plus, CreditCard, Pencil, Trash2, CheckCircle2, XCircle, RotateCcw } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { crearDeuda, registrarPago, editarDeuda, eliminarDeuda, cambiarEstadoDeuda } from '@/app/(app)/deudas/actions'
import type { Deuda, Cuenta } from '@/types/database.types'

interface DeudaConCuenta extends Deuda {
  cuentas: { nombre: string } | null
}

interface Props {
  deudas: DeudaConCuenta[]
  cuentas: Cuenta[]
  totalDeuda: number
  totalPagado: number
  totalRestante: number
  pendientesCount: number
  vencidasCount: number
  pagadasCount: number
  porcentajeTotal: number
  capacidadPago: number
  estadoCapacidad: 'saludable' | 'ajustado' | 'critico'
  mesesEstimados: number | null
}

function fmt(n: number) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(n)
}

function clamp(n: number) {
  return Math.min(100, Math.max(0, n))
}

const estadoBadge = {
  saludable: { label: '🟢 Saludable', color: '#27AE60', bg: '#d4edda' },
  ajustado: { label: '🟠 Ajustado', color: '#F39C12', bg: '#fff3cd' },
  critico: { label: '🔴 Crítico', color: '#C0392B', bg: '#f8d7da' },
}

function NuevaDeudaDialog({ cuentas, onSuccess }: { cuentas: Cuenta[]; onSuccess: () => void }) {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  const in30Date = new Date()
  in30Date.setDate(in30Date.getDate() + 30)
  const in30 = in30Date.toISOString().split('T')[0]

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setPending(true)
    const result = await crearDeuda(new FormData(e.currentTarget))
    setPending(false)
    if (result.error) { setError(result.error); return }
    setOpen(false)
    onSuccess()
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '8px 10px', border: '1px solid #ced4da',
    borderRadius: '6px', fontSize: '0.9rem', backgroundColor: '#fff',
    color: '#212121', boxSizing: 'border-box',
  }
  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '0.85rem', fontWeight: 500,
    color: '#444', marginBottom: '4px',
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button style={{
          background: 'var(--color-empresa-principal)', color: '#fff',
          border: 'none', padding: '8px 16px', borderRadius: '8px',
          fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: '6px',
          transition: 'opacity 0.2s',
        }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.85' }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = '1' }}
        >
          <Plus size={16} /> Añadir deuda
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100 }} />
        <Dialog.Content style={{
          position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
          backgroundColor: 'white', borderRadius: '12px', padding: '28px',
          width: '460px', maxWidth: '95vw', maxHeight: '90vh', overflowY: 'auto',
          zIndex: 101, boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <Dialog.Title style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: '#2c2c2c' }}>
              Registrar nueva deuda
            </Dialog.Title>
            <Dialog.Close asChild>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666' }} aria-label="Cerrar">
                <X size={20} />
              </button>
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={labelStyle}>Nombre / Acreedor</label>
              <input name="nombre_deuda" type="text" required
                placeholder="Ej: Banco BBVA, Crédito auto..." style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Monto Total</label>
              <input name="monto_total" type="number" step="0.01" min="0.01" required style={inputStyle} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={labelStyle}>Tasa de Interés (%) <span style={{ color: '#999', fontWeight: 400 }}>(opcional)</span></label>
                <input name="tasa_interes" type="number" step="0.01" min="0" defaultValue="0" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>N° de Cuotas <span style={{ color: '#999', fontWeight: 400 }}>(opcional)</span></label>
                <input name="numero_cuotas" type="number" min="1" style={inputStyle} />
              </div>
            </div>
            <div>
              <label style={labelStyle}>Cuenta asociada <span style={{ color: '#999', fontWeight: 400 }}>(opcional)</span></label>
              <select name="idCuenta" style={{ ...inputStyle, backgroundColor: '#f5bebe' }}>
                <option value="">— Sin cuenta —</option>
                {cuentas.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Fecha de Vencimiento</label>
              <input name="fecha_vencimiento" type="date" defaultValue={in30} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Descripción <span style={{ color: '#999', fontWeight: 400 }}>(opcional)</span></label>
              <textarea name="descripcion" rows={2} style={{ ...inputStyle, resize: 'vertical' }}
                placeholder="Ej: Crédito hipotecario, compra de equipo..." />
            </div>

            {error && <p style={{ color: '#C0392B', fontSize: '0.875rem', margin: 0 }}>{error}</p>}

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '4px' }}>
              <Dialog.Close asChild>
                <button type="button" style={{
                  padding: '8px 18px', border: '1px solid #ccc', borderRadius: '8px',
                  backgroundColor: 'white', cursor: 'pointer', fontSize: '0.9rem',
                }}>Cancelar</button>
              </Dialog.Close>
              <button type="submit" disabled={pending} style={{
                padding: '8px 18px', border: 'none', borderRadius: '8px',
                backgroundColor: 'var(--color-empresa-principal)', color: 'white',
                cursor: pending ? 'not-allowed' : 'pointer', fontSize: '0.9rem',
                fontWeight: 600, opacity: pending ? 0.7 : 1,
              }}>
                {pending ? 'Guardando…' : 'Guardar'}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

function PagoDeudaDialog({ deuda, onSuccess }: { deuda: DeudaConCuenta | null; onSuccess: () => void }) {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  const today = new Date().toISOString().split('T')[0]

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setPending(true)
    const result = await registrarPago(new FormData(e.currentTarget))
    setPending(false)
    if (result.error) { setError(result.error); return }
    setOpen(false)
    onSuccess()
  }

  if (!deuda) return null

  const restante = deuda.monto_total - deuda.monto_pagado

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '8px 10px', border: '1px solid #ced4da',
    borderRadius: '6px', fontSize: '0.9rem', backgroundColor: '#fff',
    color: '#212121', boxSizing: 'border-box',
  }
  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '0.85rem', fontWeight: 500,
    color: '#444', marginBottom: '4px',
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button style={{
          background: 'none', border: '1px solid var(--color-empresa-principal)',
          color: 'var(--color-empresa-principal)', padding: '5px 12px',
          borderRadius: '6px', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600,
          transition: 'all 0.2s',
        }}
          onMouseEnter={(e) => {
            const b = e.currentTarget as HTMLButtonElement
            b.style.background = 'var(--color-empresa-principal)'
            b.style.color = '#fff'
          }}
          onMouseLeave={(e) => {
            const b = e.currentTarget as HTMLButtonElement
            b.style.background = 'none'
            b.style.color = 'var(--color-empresa-principal)'
          }}
        >
          Editar pago
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100 }} />
        <Dialog.Content style={{
          position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
          backgroundColor: 'white', borderRadius: '12px', padding: '28px',
          width: '420px', maxWidth: '95vw', maxHeight: '90vh', overflowY: 'auto',
          zIndex: 101, boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <Dialog.Title style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#2c2c2c' }}>
              Registrar pago — {deuda.acreedor}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666' }} aria-label="Cerrar">
                <X size={20} />
              </button>
            </Dialog.Close>
          </div>

          <p style={{ fontSize: '0.85rem', color: '#666', margin: '0 0 16px 0' }}>
            Restante: <strong style={{ color: '#C0392B' }}>{fmt(restante)}</strong>
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <input type="hidden" name="deuda_id" value={deuda.id} />
            <input type="hidden" name="tasa_interes" value={deuda.tasa_interes} />

            <div>
              <label style={labelStyle}>Tasa de interés actual (%)</label>
              <input name="tasa_interes_display" type="number" step="0.01" min="0"
                defaultValue={deuda.tasa_interes} style={inputStyle} readOnly />
            </div>
            <div>
              <label style={labelStyle}>Monto a pagar</label>
              <input name="monto_pago" type="number" step="0.01" min="0.01"
                max={restante} required style={inputStyle}
                placeholder={`Máx: ${restante.toFixed(2)}`} />
            </div>
            <div>
              <label style={labelStyle}>Fecha de pago</label>
              <input name="fecha_pago" type="date" defaultValue={today} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Nota <span style={{ color: '#999', fontWeight: 400 }}>(opcional)</span></label>
              <textarea name="nota" rows={2} style={{ ...inputStyle, resize: 'vertical' }}
                placeholder="Ej: Pago mensual, abono..." />
            </div>

            {error && <p style={{ color: '#C0392B', fontSize: '0.875rem', margin: 0 }}>{error}</p>}

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '4px' }}>
              <Dialog.Close asChild>
                <button type="button" style={{
                  padding: '8px 18px', border: '1px solid #ccc', borderRadius: '8px',
                  backgroundColor: 'white', cursor: 'pointer', fontSize: '0.9rem',
                }}>Cancelar</button>
              </Dialog.Close>
              <button type="submit" disabled={pending} style={{
                padding: '8px 18px', border: 'none', borderRadius: '8px',
                backgroundColor: 'var(--color-empresa-principal)', color: 'white',
                cursor: pending ? 'not-allowed' : 'pointer', fontSize: '0.9rem',
                fontWeight: 600, opacity: pending ? 0.7 : 1,
              }}>
                {pending ? 'Guardando…' : 'Registrar pago'}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

function EditarDeudaDialog({
  deuda,
  cuentas,
  open,
  onOpenChange,
  onSuccess,
}: {
  deuda: DeudaConCuenta | null
  cuentas: Cuenta[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}) {
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  if (!deuda) return null

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setPending(true)
    const result = await editarDeuda(new FormData(e.currentTarget))
    setPending(false)
    if (result.error) { setError(result.error); return }
    onOpenChange(false)
    onSuccess()
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '8px 10px', border: '1px solid #ced4da',
    borderRadius: '6px', fontSize: '0.9rem', backgroundColor: '#fff',
    color: '#212121', boxSizing: 'border-box',
  }
  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '0.85rem', fontWeight: 500,
    color: '#444', marginBottom: '4px',
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100 }} />
        <Dialog.Content style={{
          position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
          backgroundColor: 'white', borderRadius: '12px', padding: '28px',
          width: '460px', maxWidth: '95vw', maxHeight: '90vh', overflowY: 'auto',
          zIndex: 101, boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <Dialog.Title style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: '#2c2c2c' }}>
              Editar deuda
            </Dialog.Title>
            <Dialog.Close asChild>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666' }} aria-label="Cerrar">
                <X size={20} />
              </button>
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <input type="hidden" name="id" value={deuda.id} />

            <div>
              <label style={labelStyle}>Nombre / Acreedor</label>
              <input name="nombre_deuda" type="text" required defaultValue={deuda.acreedor} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Monto Total</label>
              <input name="monto_total" type="number" step="0.01" min="0.01" required
                defaultValue={deuda.monto_total} style={inputStyle} />
              <p style={{ fontSize: '0.75rem', color: '#666', margin: '4px 0 0' }}>
                Ya pagado: {fmt(deuda.monto_pagado)}. El nuevo total no puede ser menor.
              </p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={labelStyle}>Tasa de Interés (%)</label>
                <input name="tasa_interes" type="number" step="0.01" min="0"
                  defaultValue={deuda.tasa_interes} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>N° de Cuotas</label>
                <input name="numero_cuotas" type="number" min="1"
                  defaultValue={deuda.numero_cuotas ?? ''} style={inputStyle} />
              </div>
            </div>
            <div>
              <label style={labelStyle}>Cuenta asociada</label>
              <select name="idCuenta" defaultValue={deuda.cuenta_id ?? ''}
                style={{ ...inputStyle, backgroundColor: '#f5bebe' }}>
                <option value="">— Sin cuenta —</option>
                {cuentas.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Prioridad</label>
              <select name="prioridad" defaultValue={deuda.prioridad}
                style={{ ...inputStyle, backgroundColor: '#f5bebe' }}>
                <option value="alta">Alta</option>
                <option value="media">Media</option>
                <option value="baja">Baja</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Fecha de Vencimiento</label>
              <input name="fecha_vencimiento" type="date" required
                defaultValue={deuda.fecha_vencimiento} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Descripción</label>
              <textarea name="descripcion" rows={2} defaultValue={deuda.descripcion ?? ''}
                style={{ ...inputStyle, resize: 'vertical' }} />
            </div>

            {error && <p style={{ color: '#C0392B', fontSize: '0.875rem', margin: 0 }}>{error}</p>}

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '4px' }}>
              <Dialog.Close asChild>
                <button type="button" style={{
                  padding: '8px 18px', border: '1px solid #ccc', borderRadius: '8px',
                  backgroundColor: 'white', cursor: 'pointer', fontSize: '0.9rem',
                }}>Cancelar</button>
              </Dialog.Close>
              <button type="submit" disabled={pending} style={{
                padding: '8px 18px', border: 'none', borderRadius: '8px',
                backgroundColor: 'var(--color-empresa-principal)', color: 'white',
                cursor: pending ? 'not-allowed' : 'pointer', fontSize: '0.9rem',
                fontWeight: 600, opacity: pending ? 0.7 : 1,
              }}>
                {pending ? 'Guardando…' : 'Guardar'}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export function DeudasView({
  deudas, cuentas,
  totalDeuda, totalPagado, totalRestante,
  pendientesCount, vencidasCount, pagadasCount,
  porcentajeTotal, capacidadPago, estadoCapacidad, mesesEstimados,
}: Props) {
  const router = useRouter()
  const refresh = () => router.refresh()

  const [editando, setEditando] = useState<DeudaConCuenta | null>(null)
  const [editOpen, setEditOpen] = useState(false)

  const handleEditar = (deuda: DeudaConCuenta) => {
    setEditando(deuda)
    setEditOpen(true)
  }

  const handleEliminar = async (id: string, acreedor: string) => {
    if (!window.confirm(`¿Eliminar la deuda "${acreedor}"? Esta acción no se puede deshacer.`)) return
    const result = await eliminarDeuda(id)
    if (result.error) { window.alert(result.error); return }
    refresh()
  }

  const handleCambiarEstado = async (id: string, nuevoEstado: 'activa' | 'pagada' | 'cancelada') => {
    const result = await cambiarEstadoDeuda(id, nuevoEstado)
    if (result.error) { window.alert(result.error); return }
    refresh()
  }

  const badge = estadoBadge[estadoCapacidad]
  const deudasActivas = deudas.filter(d => d.estado !== 'pagada')
  const deudasPagadas = deudas.filter(d => d.estado === 'pagada')

  const cardStyle: React.CSSProperties = {
    background: '#fff', borderRadius: '12px', padding: '25px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.1)', border: '1px solid rgba(0,0,0,0.05)',
  }

  const statCardStyle: React.CSSProperties = {
    background: '#f8f9fa', borderRadius: '8px', padding: '12px 15px',
    textAlign: 'center', border: '1px solid #e0e0e0',
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '2fr 3fr',
      gap: '20px',
      padding: '20px',
      alignItems: 'start',
      minHeight: 'calc(100vh - 100px)',
    }}>

      {/* ── Columna Izquierda: Resumen ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {/* Capacidad de Pago */}
        <div style={{
          ...cardStyle,
          border: '2px dashed #ccc',
          background: '#f8f9fa',
        }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '1rem', fontWeight: 600, color: '#555' }}>
            Capacidad de Pago Mensual
          </h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '1.8rem', fontWeight: 700, color: '#2c2c2c' }}>
              {fmt(capacidadPago)}
            </span>
            <span style={{
              padding: '4px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600,
              color: badge.color, backgroundColor: badge.bg, border: `1px solid ${badge.color}`,
            }}>
              {badge.label}
            </span>
          </div>
          {mesesEstimados !== null && (
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#666' }}>
              Estimado para liquidar:{' '}
              <strong>{mesesEstimados === 0 ? 'Este mes' : `${mesesEstimados} mes${mesesEstimados !== 1 ? 'es' : ''}`}</strong>
            </p>
          )}
          {capacidadPago <= 0 && (
            <p style={{ margin: '8px 0 0 0', fontSize: '0.8rem', color: '#C0392B' }}>
              ⚠ Los gastos superan los ingresos del último mes.
            </p>
          )}
        </div>

        {/* Resumen Grid */}
        <div style={cardStyle}>
          <h3 style={{
            margin: '0 0 16px 0', fontWeight: 600, fontSize: '1.1rem',
            borderBottom: '2px solid var(--color-empresa-principal)', paddingBottom: '8px',
            color: 'var(--color-empresa-secundario)',
          }}>
            Resumen de Deudas
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
            <div style={statCardStyle}>
              <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#C0392B' }}>{fmt(totalDeuda)}</div>
              <div style={{ fontSize: '0.75rem', color: '#777', marginTop: '3px' }}>Total Adeudado</div>
            </div>
            <div style={statCardStyle}>
              <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#27AE60' }}>{fmt(totalPagado)}</div>
              <div style={{ fontSize: '0.75rem', color: '#777', marginTop: '3px' }}>Total Pagado</div>
            </div>
            <div style={statCardStyle}>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#F39C12' }}>{pendientesCount}</div>
              <div style={{ fontSize: '0.75rem', color: '#777', marginTop: '3px' }}>Pendientes</div>
            </div>
            <div style={statCardStyle}>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#C0392B' }}>{vencidasCount}</div>
              <div style={{ fontSize: '0.75rem', color: '#777', marginTop: '3px' }}>Vencidas</div>
            </div>
          </div>

          <div style={{ ...statCardStyle, gridColumn: 'span 2', marginBottom: '16px' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#27AE60' }}>{pagadasCount}</div>
            <div style={{ fontSize: '0.75rem', color: '#777', marginTop: '3px' }}>Pagadas</div>
          </div>

          {/* Barra de progreso total */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#666', marginBottom: '5px' }}>
              <span>Progreso total</span>
              <span>{porcentajeTotal.toFixed(0)}%</span>
            </div>
            <div style={{
              background: '#e0e0e0', height: '10px', borderRadius: '5px', overflow: 'hidden',
            }}>
              <div style={{
                background: 'linear-gradient(90deg, #C0392B 0%, #E74C3C 50%, #F39C12 100%)',
                width: `${clamp(porcentajeTotal)}%`, height: '100%',
                transition: 'width 0.5s ease',
              }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#999', marginTop: '4px' }}>
              <span>{fmt(totalPagado)} pagado</span>
              <span>{fmt(totalRestante)} restante</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Columna Derecha: Deudas ── */}
      <div style={cardStyle}>
        <h2 style={{
          margin: '0 0 20px 0', fontWeight: 600, fontSize: '1.4rem',
          borderBottom: '2px solid var(--color-empresa-principal)', paddingBottom: '10px',
          color: 'var(--color-empresa-secundario)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span><CreditCard size={22} style={{ verticalAlign: 'middle', marginRight: '8px' }} />Deudas Activas</span>
          <NuevaDeudaDialog cuentas={cuentas} onSuccess={refresh} />
        </h2>

        {/* Lista deudas activas */}
        <div style={{ maxHeight: '450px', overflowY: 'auto', marginBottom: '24px' }}>
          {deudasActivas.length === 0 && (
            <p style={{ color: '#666', textAlign: 'center', padding: '20px 0' }}>
              No tienes deudas activas
            </p>
          )}
          {deudasActivas.map(deuda => (
            <DeudaItem
              key={deuda.id}
              deuda={deuda}
              onSuccess={refresh}
              onEditar={handleEditar}
              onEliminar={handleEliminar}
              onCambiarEstado={handleCambiarEstado}
            />
          ))}
        </div>

        {/* Deudas pagadas */}
        {deudasPagadas.length > 0 && (
          <>
            <h3 style={{
              margin: '0 0 12px 0', fontWeight: 600, fontSize: '1.1rem',
              borderBottom: '2px solid #27AE60', paddingBottom: '8px',
              color: '#27AE60',
            }}>
              Deudas Pagadas ✅
            </h3>
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {deudasPagadas.map(deuda => (
                <DeudaItem
                  key={deuda.id}
                  deuda={deuda}
                  onSuccess={refresh}
                  onEditar={handleEditar}
                  onEliminar={handleEliminar}
                  onCambiarEstado={handleCambiarEstado}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <EditarDeudaDialog
        deuda={editando}
        cuentas={cuentas}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSuccess={refresh}
      />
    </div>
  )
}

function DeudaItem({
  deuda,
  onSuccess,
  onEditar,
  onEliminar,
  onCambiarEstado,
}: {
  deuda: DeudaConCuenta
  onSuccess: () => void
  onEditar: (deuda: DeudaConCuenta) => void
  onEliminar: (id: string, acreedor: string) => void
  onCambiarEstado: (id: string, nuevoEstado: 'activa' | 'pagada' | 'cancelada') => void
}) {
  const restante = deuda.monto_total - deuda.monto_pagado
  const porcentaje = deuda.monto_total > 0 ? clamp((deuda.monto_pagado / deuda.monto_total) * 100) : 0
  const today = new Date().toISOString().split('T')[0]
  const vencida = deuda.estado === 'activa' && deuda.fecha_vencimiento < today
  const pagada = deuda.estado === 'pagada'
  const cancelada = deuda.estado === 'cancelada'

  const iconBtn: React.CSSProperties = {
    background: 'none', border: '1px solid #ccc', borderRadius: '6px',
    padding: '4px 6px', cursor: 'pointer', color: '#666',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  }
  const chipBtn: React.CSSProperties = {
    background: '#fff', border: '1px solid #ccc', borderRadius: '6px',
    padding: '3px 8px', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 600,
    display: 'inline-flex', alignItems: 'center', gap: '4px',
  }

  return (
    <div style={{
      background: '#f8f9fa', borderRadius: '10px', padding: '16px',
      marginBottom: '10px', border: '1px solid #e0e0e0',
      transition: 'all 0.2s ease',
    }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLDivElement
        el.style.background = '#f0f0f0'
        el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)'
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLDivElement
        el.style.background = '#f8f9fa'
        el.style.boxShadow = 'none'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
        {/* Info izquierda */}
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontWeight: 700, fontSize: '1rem', color: '#2c2c2c' }}>{deuda.acreedor}</span>
            {vencida && (
              <span style={{
                fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: '10px',
                background: '#f8d7da', color: '#C0392B', border: '1px solid #C0392B',
              }}>VENCIDA</span>
            )}
            {pagada && (
              <span style={{
                fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: '10px',
                background: '#d4edda', color: '#27AE60', border: '1px solid #27AE60',
              }}>PAGADA</span>
            )}
            {cancelada && (
              <span style={{
                fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: '10px',
                background: '#e9ecef', color: '#6c757d', border: '1px solid #6c757d',
              }}>CANCELADA</span>
            )}
          </div>

          {deuda.descripcion && (
            <div style={{ fontSize: '0.82rem', color: '#666', marginBottom: '6px' }}>{deuda.descripcion}</div>
          )}

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', fontSize: '0.78rem', color: '#888' }}>
            {deuda.numero_cuotas && (
              <span>📋 {deuda.numero_cuotas} cuotas</span>
            )}
            {deuda.tasa_interes > 0 && (
              <span>📈 {deuda.tasa_interes}% interés</span>
            )}
            {deuda.cuentas && (
              <span>🏦 {deuda.cuentas.nombre}</span>
            )}
            <span>📅 vence {new Date(deuda.fecha_vencimiento + 'T12:00:00').toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
          </div>
        </div>

        {/* Montos + botón derecha */}
        <div style={{ textAlign: 'right', minWidth: '150px' }}>
          <div style={{ fontSize: '0.8rem', color: '#888' }}>Total: <strong style={{ color: '#2c2c2c' }}>{fmt(deuda.monto_total)}</strong></div>
          <div style={{ fontSize: '0.8rem', color: '#888' }}>Pagado: <strong style={{ color: '#27AE60' }}>{fmt(deuda.monto_pagado)}</strong></div>
          <div style={{ fontSize: '0.8rem', color: '#888', marginBottom: '8px' }}>Restante: <strong style={{ color: '#C0392B' }}>{fmt(restante)}</strong></div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', justifyContent: 'flex-end', marginBottom: '6px' }}>
            {!pagada && !cancelada && <PagoDeudaDialog deuda={deuda} onSuccess={onSuccess} />}
            <button type="button" style={iconBtn} onClick={() => onEditar(deuda)} aria-label="Editar deuda" title="Editar">
              <Pencil size={14} />
            </button>
            <button type="button" style={{ ...iconBtn, color: '#C0392B', borderColor: '#e6b0aa' }}
              onClick={() => onEliminar(deuda.id, deuda.acreedor)} aria-label="Eliminar deuda" title="Eliminar">
              <Trash2 size={14} />
            </button>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', justifyContent: 'flex-end' }}>
            {deuda.estado === 'activa' && (
              <>
                <button type="button" style={{ ...chipBtn, color: '#27AE60', borderColor: '#a3e0b6' }}
                  onClick={() => onCambiarEstado(deuda.id, 'pagada')} title="Marcar como pagada">
                  <CheckCircle2 size={12} /> Pagada
                </button>
                <button type="button" style={{ ...chipBtn, color: '#6c757d', borderColor: '#ced4da' }}
                  onClick={() => onCambiarEstado(deuda.id, 'cancelada')} title="Cancelar deuda">
                  <XCircle size={12} /> Cancelar
                </button>
              </>
            )}
            {(pagada || cancelada) && (
              <button type="button" style={{ ...chipBtn, color: 'var(--color-empresa-principal)', borderColor: '#e0c9c9' }}
                onClick={() => onCambiarEstado(deuda.id, 'activa')} title="Reactivar deuda">
                <RotateCcw size={12} /> Reactivar
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Barra de progreso */}
      <div style={{
        background: '#e0e0e0', height: '8px', borderRadius: '4px',
        overflow: 'hidden', marginTop: '10px',
      }}>
        <div style={{
          background: pagada
            ? 'linear-gradient(90deg, #27AE60 0%, #2ECC71 100%)'
            : 'linear-gradient(90deg, #C0392B 0%, #E74C3C 50%, #F39C12 100%)',
          width: `${porcentaje}%`, height: '100%',
          transition: 'width 0.5s ease',
        }} />
      </div>
      <div style={{ textAlign: 'right', fontSize: '0.75rem', color: '#999', marginTop: '3px' }}>
        {porcentaje.toFixed(0)}% pagado
      </div>
    </div>
  )
}
