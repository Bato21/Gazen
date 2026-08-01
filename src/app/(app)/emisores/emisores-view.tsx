'use client'

import { useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { X, Plus, Pencil, Trash2, Building2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { crearEmisor, editarEmisor, eliminarEmisor } from './actions'
import type { Emisor } from '@/types/database.types'

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

export function EmisoresView({ emisores }: { emisores: Emisor[] }) {
  const router = useRouter()
  const [nuevoOpen, setNuevoOpen] = useState(false)
  const [editando, setEditando] = useState<Emisor | null>(null)

  async function handleEliminar(e: Emisor) {
    if (!window.confirm(`¿Eliminar el emisor "${e.nombre}"? Los movimientos referenciados quedarán sin emisor.`)) return
    const result = await eliminarEmisor(e.id)
    if (result.error) { window.alert(result.error); return }
    router.refresh()
  }

  return (
    <div style={{ maxWidth: 820, margin: '0 auto', padding: '20px 15px' }}>
      <header style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{
          background: 'var(--color-empresa-principal)', color: 'white',
          width: 52, height: 52, borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Building2 size={28} />
        </div>
        <div style={{ flex: 1 }}>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: 'white' }}>
            Emisores
          </h1>
          <p style={{ margin: '2px 0 0', fontSize: '0.85rem', color: 'rgba(255,255,255,0.85)' }}>
            Proveedores, clientes o contrapartes que aparecen en tus movimientos.
          </p>
        </div>
        <button type="button" onClick={() => setNuevoOpen(true)} style={{
          background: 'var(--color-empresa-principal)', color: '#fff', border: 'none',
          padding: '10px 16px', borderRadius: 8, fontSize: '0.9rem', fontWeight: 600,
          cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6,
        }}>
          <Plus size={16} /> Nuevo emisor
        </button>
      </header>

      <div style={{
        background: 'white', borderRadius: 12, padding: 20,
        boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
      }}>
        {emisores.length === 0 ? (
          <p style={{ color: '#666', textAlign: 'center', padding: '30px 0', margin: 0 }}>
            Aún no hay emisores registrados. Crea el primero para asociarlo a tus movimientos.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {emisores.map((e) => (
              <div key={e.id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '10px 12px', background: '#f8f9fa', border: '1px solid #e0e0e0',
                borderRadius: 8,
              }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 600, color: '#2c2c2c', fontSize: '0.95rem' }}>{e.nombre}</div>
                  {e.direccion && (
                    <div style={{ fontSize: '0.75rem', color: '#888', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {e.direccion}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  <button type="button" style={iconBtn} onClick={() => setEditando(e)} aria-label="Editar" title="Editar">
                    <Pencil size={14} />
                  </button>
                  <button type="button" style={{ ...iconBtn, color: '#C0392B', borderColor: '#e6b0aa' }}
                    onClick={() => handleEliminar(e)} aria-label="Eliminar" title="Eliminar">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <EmisorDialog
        mode="crear"
        open={nuevoOpen}
        onOpenChange={setNuevoOpen}
        onSuccess={() => router.refresh()}
      />
      <EmisorDialog
        mode="editar"
        emisor={editando}
        open={editando !== null}
        onOpenChange={(o) => { if (!o) setEditando(null) }}
        onSuccess={() => router.refresh()}
      />
    </div>
  )
}

function EmisorDialog({
  mode, emisor, open, onOpenChange, onSuccess,
}: {
  mode: 'crear' | 'editar'
  emisor?: Emisor | null
  open: boolean
  onOpenChange: (o: boolean) => void
  onSuccess: () => void
}) {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (mode === 'editar' && !emisor) return null

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setPending(true)
    setError(null)
    const fd = new FormData(e.currentTarget)
    const result = mode === 'crear' ? await crearEmisor(fd) : await editarEmisor(fd)
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
              {mode === 'crear' ? 'Nuevo emisor' : 'Editar emisor'}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666' }} aria-label="Cerrar">
                <X size={20} />
              </button>
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit}>
            {mode === 'editar' && emisor && <input type="hidden" name="id" value={emisor.id} />}

            <label style={labelStyle}>Nombre</label>
            <input name="nombre" type="text" required
              defaultValue={emisor?.nombre ?? ''}
              placeholder="Ej: Proveedor S.A. de C.V."
              style={inputStyle} />

            <label style={labelStyle}>Dirección <span style={{ color: '#999', fontWeight: 400 }}>(opcional)</span></label>
            <input name="direccion" type="text"
              defaultValue={emisor?.direccion ?? ''}
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
