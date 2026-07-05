'use client'

import { useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import {
  Car, Utensils, Package, Gamepad2, Zap, HeartPulse, GraduationCap, Home,
  Tag, ArrowUpCircle, ArrowDownCircle, Calendar, X, Plus,
} from 'lucide-react'
import { crearCuenta } from '@/app/(app)/movimientos/actions'
import type { Cuenta } from '@/types/database.types'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface MovimientoRow {
  id: string
  tipo: 'Ingreso' | 'Gasto'
  monto: number
  fecha: string
  descripcion: string | null
  cuenta_id: string
  categorias: { nombre: string; icono: string | null } | null
  cuentas: { nombre: string; tipo_cuenta: string } | null
}

interface Props {
  cuentas: Cuenta[]
  movimientos: MovimientoRow[]
}

// ── Icon map (Lucide) ──────────────────────────────────────────────────────────

const ICON_MAP: Record<string, React.ComponentType<{ size?: number; color?: string }>> = {
  car: Car,
  utensils: Utensils,
  package: Package,
  'gamepad-2': Gamepad2,
  zap: Zap,
  'heart-pulse': HeartPulse,
  'graduation-cap': GraduationCap,
  home: Home,
}

function CategoryIcon({ icono, size = 18 }: { icono: string | null; size?: number }) {
  const Icon = icono ? (ICON_MAP[icono] ?? Tag) : Tag
  return <Icon size={size} color="white" />
}

// ── Currency format ────────────────────────────────────────────────────────────

function fmt(amount: number) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount)
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function NuevaCuentaDialog({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setPending(true)
    const result = await crearCuenta(new FormData(e.currentTarget))
    setPending(false)
    if (result.error) { setError(result.error); return }
    setOpen(false)
    onCreated()
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '8px 10px', border: '1px solid #ced4da',
    borderRadius: '6px', fontSize: '0.9rem', backgroundColor: '#fff',
    color: '#212121', boxSizing: 'border-box',
  }
  const selectStyle: React.CSSProperties = { ...inputStyle, backgroundColor: '#f5bebe' }
  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '0.85rem', fontWeight: 500,
    color: '#444', marginBottom: '4px',
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          style={{
            background: '#fff',
            border: '2px solid var(--color-empresa-principal)',
            color: 'var(--color-empresa-principal)',
            width: '100%', padding: '14px', borderRadius: '10px',
            fontSize: '1rem', fontWeight: 500, cursor: 'pointer',
            marginBottom: '12px', transition: 'all 0.3s', textAlign: 'center',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          }}
          onMouseEnter={(e) => {
            const b = e.currentTarget
            b.style.background = 'var(--color-empresa-principal)'
            b.style.color = 'white'
          }}
          onMouseLeave={(e) => {
            const b = e.currentTarget
            b.style.background = '#fff'
            b.style.color = 'var(--color-empresa-principal)'
          }}
        >
          <Plus size={18} /> Agregar una nueva cuenta
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100 }} />
        <Dialog.Content style={{
          position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
          backgroundColor: 'white', borderRadius: '12px', padding: '28px',
          width: '420px', maxWidth: '95vw', zIndex: 101,
          boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <Dialog.Title style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: '#2c2c2c' }}>
              Agregar nueva cuenta
            </Dialog.Title>
            <Dialog.Close asChild>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666' }} aria-label="Cerrar">
                <X size={20} />
              </button>
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={labelStyle}>Nombre de la cuenta</label>
              <input name="nombreCuenta" type="text" required
                placeholder="Ej: Cuenta bancaria, Billetera, Efectivo..." style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Saldo inicial</label>
              <input name="saldoInicial" type="number" step="0.01" defaultValue="0" required style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Tipo de cuenta</label>
              <select name="tipoCuenta" style={selectStyle}>
                {['Ahorro', 'Corriente', 'Inversión', 'Crédito', 'Efectivo'].map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
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

// ── Main view ──────────────────────────────────────────────────────────────────

export function MovimientosView({ cuentas, movimientos }: Props) {
  const [selectedCuentaId, setSelectedCuentaId] = useState<string | null>(null)

  const filtered = selectedCuentaId
    ? movimientos.filter((m) => m.cuenta_id === selectedCuentaId)
    : movimientos

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 2fr',
      gap: '20px',
      padding: '15px',
    }}>
      {/* ── Left: cuentas ── */}
      <div style={{
        background: '#fff', borderRadius: '12px', padding: '25px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.1)', border: '1px solid rgba(0,0,0,0.05)',
        overflowY: 'auto', maxHeight: 'calc(100vh - 140px)',
      }}>
        <h2 style={{
          marginBottom: '15px', color: 'var(--color-empresa-secundario)',
          fontWeight: 600, fontSize: '1.3rem',
          borderBottom: '2px solid var(--color-empresa-principal)',
          paddingBottom: '8px', display: 'inline-block',
        }}>
          Mis Cuentas
        </h2>

        <NuevaCuentaDialog onCreated={() => window.location.reload()} />

        {/* All accounts button */}
        <button
          onClick={() => setSelectedCuentaId(null)}
          style={{
            width: '100%', padding: '16px 18px', borderRadius: '10px',
            border: 'none', cursor: 'pointer', textAlign: 'left',
            marginBottom: '10px', transition: 'all 0.3s',
            backgroundColor: selectedCuentaId === null
              ? 'var(--color-empresa-principal)' : '#f8f9fa',
            color: selectedCuentaId === null ? 'white' : '#333',
          }}
        >
          <div style={{ fontWeight: 600, fontSize: '1rem' }}>Todas las cuentas</div>
          <div style={{ fontSize: '0.8rem', opacity: 0.75, marginTop: '2px' }}>
            {movimientos.length} movimientos en total
          </div>
        </button>

        {cuentas.map((cuenta) => {
          const isActive = selectedCuentaId === cuenta.id
          const count = movimientos.filter((m) => m.cuenta_id === cuenta.id).length
          return (
            <button
              key={cuenta.id}
              onClick={() => setSelectedCuentaId(cuenta.id)}
              style={{
                width: '100%', padding: '16px 18px', borderRadius: '10px',
                border: '1px solid #e0e0e0', cursor: 'pointer', textAlign: 'left',
                marginBottom: '10px', transition: 'all 0.3s',
                backgroundColor: isActive ? 'var(--color-empresa-principal)' : '#f8f9fa',
                color: isActive ? 'white' : '#333',
              }}
              onMouseEnter={(e) => {
                if (!isActive) (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#f0f0f0'
              }}
              onMouseLeave={(e) => {
                if (!isActive) (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#f8f9fa'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 600, fontSize: '1rem' }}>{cuenta.nombre}</span>
                <span style={{
                  fontSize: '0.75rem', padding: '2px 8px', borderRadius: '10px',
                  backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : '#e8e8e8',
                  color: isActive ? 'white' : '#666',
                }}>
                  {count}
                </span>
              </div>
              <div style={{ fontSize: '0.8rem', opacity: 0.7, marginTop: '4px' }}>
                {cuenta.tipo_cuenta}
              </div>
            </button>
          )
        })}

        {cuentas.length === 0 && (
          <p style={{ color: '#999', fontSize: '0.9rem', textAlign: 'center', marginTop: '20px' }}>
            Aún no tienes cuentas. Agrega una para comenzar.
          </p>
        )}
      </div>

      {/* ── Right: historial ── */}
      <div style={{
        backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: '12px', padding: '25px',
        height: '84vh', boxShadow: '0 4px 15px rgba(0,0,0,0.15)',
        border: '1px solid rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column',
      }}>
        <h2 style={{
          marginBottom: '15px', color: 'var(--color-empresa-secundario)',
          fontWeight: 600, fontSize: '1.3rem',
          borderBottom: '2px solid var(--color-empresa-principal)',
          paddingBottom: '8px', display: 'inline-block',
        }}>
          Historial de Transacciones
        </h2>

        {/* Header info */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: '15px', padding: '10px 12px',
          background: 'linear-gradient(135deg, #f5f7fa 0%, #e3e8f0 100%)',
          borderRadius: '8px',
        }}>
          <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-empresa-principal)' }}>
            {selectedCuentaId
              ? cuentas.find((c) => c.id === selectedCuentaId)?.nombre ?? 'Cuenta'
              : 'Últimos movimientos'}
          </span>
          <span style={{ fontSize: '0.85rem', color: '#666', fontWeight: 500 }}>
            {filtered.length} transacciones
          </span>
        </div>

        {/* Transactions list */}
        <div style={{ flex: 1, overflowY: 'auto', paddingRight: '4px' }}>
          {filtered.length === 0 ? (
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', height: '200px', color: '#aaa', gap: '10px',
            }}>
              <ArrowDownCircle size={40} color="#ddd" />
              <p style={{ margin: 0 }}>Sin transacciones en esta cuenta.</p>
            </div>
          ) : (
            filtered.map((mov) => {
              const esIngreso = mov.tipo === 'Ingreso'
              const color = esIngreso ? '#27AE60' : '#C0392B'
              const iconoBg = color
              const catIcono = mov.categorias?.icono ?? null
              const catNombre = mov.categorias?.nombre ?? 'Sin categoría'
              const fecha = new Date(mov.fecha).toLocaleDateString('es-MX', {
                day: '2-digit', month: 'short', year: 'numeric',
              })

              return (
                <div key={mov.id} className="transaccion-item">
                  <div className="transaccion-header">
                    <div className="transaccion-info">
                      {/* Category icon circle */}
                      <div className="transaccion-icono" style={{ backgroundColor: iconoBg }}>
                        <CategoryIcon icono={catIcono} size={16} />
                      </div>
                      <div className="transaccion-detalles">
                        <div className="transaccion-titulo">{catNombre}</div>
                        <div className="transaccion-categoria">
                          {esIngreso
                            ? <ArrowUpCircle size={14} color={color} />
                            : <ArrowDownCircle size={14} color={color} />}
                          {mov.descripcion ?? '—'}
                        </div>
                      </div>
                    </div>
                    <div className="transaccion-monto" style={{ color }}>
                      {esIngreso ? '+' : '-'}{fmt(mov.monto)}
                    </div>
                  </div>
                  <div className="transaccion-footer">
                    <div className="transaccion-fecha">
                      <Calendar size={12} />
                      {fecha}
                    </div>
                    <div className="transaccion-metodo">
                      {mov.cuentas?.tipo_cuenta ?? ''}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
