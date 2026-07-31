'use client'

import { useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { X, Plus, Pencil, Trash2, Wallet } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { crearCuenta, editarCuenta, eliminarCuenta } from './actions'
import type { Cuenta } from '@/types/database.types'

const TIPOS_CUENTA = ['Ahorro', 'Corriente', 'Inversión', 'Crédito', 'Efectivo'] as const

function fmt(n: number) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(n)
}

const cardStyle: React.CSSProperties = {
  background: 'white', borderRadius: 12, padding: 20,
  boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
}
const inputStyle: React.CSSProperties = {
  width: '100%', padding: '8px 10px', border: '1px solid #ced4da',
  borderRadius: 6, fontSize: '0.9rem', backgroundColor: '#fff',
  color: '#212121', boxSizing: 'border-box',
}
const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: '0.85rem', fontWeight: 500,
  color: '#444', marginBottom: 4, marginTop: 8,
}
const iconBtn: React.CSSProperties = {
  background: 'none', border: '1px solid #ccc', borderRadius: 6,
  padding: '4px 6px', cursor: 'pointer', color: '#666',
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
}

export function CuentasPanel({ cuentas, esAdmin }: { cuentas: Cuenta[]; esAdmin: boolean }) {
  const router = useRouter()
  const [nuevaOpen, setNuevaOpen] = useState(false)
  const [editando, setEditando] = useState<Cuenta | null>(null)

  async function handleEliminar(cuenta: Cuenta) {
    if (!window.confirm(`¿Eliminar la cuenta "${cuenta.nombre}"? Se borrarán también sus movimientos asociados.`)) return
    const result = await eliminarCuenta(cuenta.id)
    if (result.error) { window.alert(result.error); return }
    router.refresh()
  }

  return (
    <div style={cardStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#2c2c2c' }}>
            Cuentas de la empresa
          </h3>
          <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#666' }}>
            Cuentas visibles en movimientos y deudas.
          </p>
        </div>
        <button type="button" onClick={() => setNuevaOpen(true)} style={{
          background: 'var(--color-empresa-principal)', color: '#fff', border: 'none',
          padding: '8px 14px', borderRadius: 8, fontSize: '0.85rem', fontWeight: 600,
          cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6,
        }}>
          <Plus size={16} /> Nueva cuenta
        </button>
      </div>

      <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {cuentas.length === 0 && (
          <p style={{ color: '#666', textAlign: 'center', padding: '20px 0', margin: 0 }}>
            Aún no hay cuentas registradas.
          </p>
        )}
        {cuentas.map((c) => (
          <div key={c.id} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '10px 12px', background: '#f8f9fa', border: '1px solid #e0e0e0',
            borderRadius: 8,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Wallet size={18} style={{ color: 'var(--color-empresa-principal)' }} />
              <div>
                <div style={{ fontWeight: 600, color: '#2c2c2c', fontSize: '0.95rem' }}>{c.nombre}</div>
                <div style={{ fontSize: '0.75rem', color: '#888' }}>
                  {c.tipo_cuenta} · saldo inicial {fmt(c.saldo_inicial)}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button type="button" style={iconBtn} onClick={() => setEditando(c)} aria-label="Editar cuenta" title="Editar">
                <Pencil size={14} />
              </button>
              {esAdmin && (
                <button type="button" style={{ ...iconBtn, color: '#C0392B', borderColor: '#e6b0aa' }}
                  onClick={() => handleEliminar(c)} aria-label="Eliminar cuenta" title="Eliminar">
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Nueva cuenta dialog */}
      <CuentaDialog
        mode="crear"
        open={nuevaOpen}
        onOpenChange={setNuevaOpen}
        onSuccess={() => router.refresh()}
      />

      {/* Editar cuenta dialog */}
      <CuentaDialog
        mode="editar"
        cuenta={editando}
        open={editando !== null}
        onOpenChange={(o) => { if (!o) setEditando(null) }}
        onSuccess={() => router.refresh()}
      />
    </div>
  )
}

function CuentaDialog({
  mode,
  cuenta,
  open,
  onOpenChange,
  onSuccess,
}: {
  mode: 'crear' | 'editar'
  cuenta?: Cuenta | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}) {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (mode === 'editar' && !cuenta) return null

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setPending(true)
    setError(null)
    const fd = new FormData(e.currentTarget)
    const result = mode === 'crear' ? await crearCuenta(fd) : await editarCuenta(fd)
    setPending(false)
    if (result.error) { setError(result.error); return }
    onOpenChange(false)
    onSuccess()
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100 }} />
        <Dialog.Content style={{
          position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
          backgroundColor: 'white', borderRadius: 12, padding: 28,
          width: 420, maxWidth: '95vw', maxHeight: '90vh', overflowY: 'auto',
          zIndex: 101, boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Dialog.Title style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: '#2c2c2c' }}>
              {mode === 'crear' ? 'Nueva cuenta' : 'Editar cuenta'}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666' }} aria-label="Cerrar">
                <X size={20} />
              </button>
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
            {mode === 'editar' && cuenta && (
              <input type="hidden" name="id" value={cuenta.id} />
            )}

            <label style={labelStyle}>Nombre</label>
            <input name="nombre" type="text" required
              defaultValue={cuenta?.nombre ?? ''}
              placeholder="Ej: BBVA principal"
              style={inputStyle} />

            <label style={labelStyle}>Tipo de cuenta</label>
            <select name="tipo_cuenta" required
              defaultValue={cuenta?.tipo_cuenta ?? 'Corriente'}
              style={{ ...inputStyle, backgroundColor: '#f5bebe' }}>
              {TIPOS_CUENTA.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>

            <label style={labelStyle}>Saldo inicial</label>
            <input name="saldo_inicial" type="number" step="0.01" required
              defaultValue={cuenta?.saldo_inicial ?? 0}
              style={inputStyle} />

            {error && <p style={{ color: '#C0392B', fontSize: '0.875rem', margin: '10px 0 0' }}>{error}</p>}

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 16 }}>
              <Dialog.Close asChild>
                <button type="button" style={{
                  padding: '8px 18px', border: '1px solid #ccc', borderRadius: 8,
                  backgroundColor: 'white', cursor: 'pointer', fontSize: '0.9rem',
                }}>Cancelar</button>
              </Dialog.Close>
              <button type="submit" disabled={pending} style={{
                padding: '8px 18px', border: 'none', borderRadius: 8,
                backgroundColor: 'var(--color-empresa-principal)', color: 'white',
                fontSize: '0.9rem', fontWeight: 600,
                cursor: pending ? 'not-allowed' : 'pointer', opacity: pending ? 0.7 : 1,
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
