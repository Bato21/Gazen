'use client'

import { useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { X, Pencil, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { editarMeta, eliminarMeta } from '@/app/(app)/ahorros/actions'
import type { Meta } from '@/types/database.types'

function fmt(n: number) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(n)
}

function clamp(n: number) {
  return Math.min(100, Math.max(0, n))
}

export function MetaCard({ meta }: { meta: Meta }) {
  const router = useRouter()
  const [editOpen, setEditOpen] = useState(false)

  const porcentaje = meta.monto_objetivo > 0
    ? clamp((meta.monto_actual / meta.monto_objetivo) * 100)
    : 0
  const falta = Math.max(0, meta.monto_objetivo - meta.monto_actual)

  async function handleEliminar() {
    if (!window.confirm(`¿Eliminar la meta "${meta.nombre}"? Esta acción no se puede deshacer.`)) return
    const result = await eliminarMeta(meta.id)
    if (result.error) { window.alert(result.error); return }
    router.refresh()
  }

  const iconBtn: React.CSSProperties = {
    background: 'none', border: '1px solid #ccc', borderRadius: '6px',
    padding: '4px 6px', cursor: 'pointer', color: '#666',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  }

  return (
    <div style={{
      background: '#f8f9fa', borderRadius: '10px', padding: '18px',
      marginBottom: '12px', border: '1px solid #e0e0e0',
      transition: 'all 0.3s ease',
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
      {/* Header: nombre + fecha + acciones */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', gap: '8px' }}>
        <span style={{ color: '#333', fontSize: '1.1rem', fontWeight: 600, flex: 1 }}>
          {meta.nombre}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {meta.fecha_limite && (
            <span style={{ fontSize: '0.75rem', color: '#999' }}>
              hasta {new Date(meta.fecha_limite + 'T12:00:00').toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}
            </span>
          )}
          <button type="button" style={iconBtn} onClick={() => setEditOpen(true)} aria-label="Editar meta" title="Editar">
            <Pencil size={14} />
          </button>
          <button type="button" style={{ ...iconBtn, color: '#C0392B', borderColor: '#e6b0aa' }}
            onClick={handleEliminar} aria-label="Eliminar meta" title="Eliminar">
            <Trash2 size={14} />
          </button>
        </div>
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

      <EditarMetaDialog meta={meta} open={editOpen} onOpenChange={setEditOpen} onSuccess={() => router.refresh()} />
    </div>
  )
}

function EditarMetaDialog({
  meta,
  open,
  onOpenChange,
  onSuccess,
}: {
  meta: Meta
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}) {
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setPending(true)
    const result = await editarMeta(new FormData(e.currentTarget))
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
          width: '440px', maxWidth: '95vw', maxHeight: '90vh', overflowY: 'auto',
          zIndex: 101, boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <Dialog.Title style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: '#2c2c2c' }}>
              Editar meta
            </Dialog.Title>
            <Dialog.Close asChild>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666' }} aria-label="Cerrar">
                <X size={20} />
              </button>
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <input type="hidden" name="id" value={meta.id} />

            <div>
              <label style={labelStyle}>Nombre de la meta</label>
              <input name="nombre_meta" type="text" required defaultValue={meta.nombre} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Monto Objetivo</label>
              <input name="monto_objetivo" type="number" step="0.01" min="0.01" required
                defaultValue={meta.monto_objetivo} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Monto Actual</label>
              <input name="monto_actual" type="number" step="0.01" min="0" required
                defaultValue={meta.monto_actual} style={inputStyle} />
              <p style={{ fontSize: '0.75rem', color: '#666', margin: '4px 0 0' }}>
                Ajusta manualmente el ahorro acumulado.
              </p>
            </div>
            <div>
              <label style={labelStyle}>Fecha Límite <span style={{ color: '#999', fontWeight: 400 }}>(opcional)</span></label>
              <input name="fecha_limite" type="date" defaultValue={meta.fecha_limite ?? ''} style={inputStyle} />
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
