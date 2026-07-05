'use client'

import { useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { X, Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { crearMeta } from '@/app/(app)/ahorros/actions'

export function NuevaMetaDialog() {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const router = useRouter()

  const today = new Date().toISOString().split('T')[0]

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setPending(true)
    const result = await crearMeta(new FormData(e.currentTarget))
    setPending(false)
    if (result.error) { setError(result.error); return }
    setOpen(false)
    router.refresh()
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
        <button
          style={{
            background: '#fff', border: '2px solid var(--color-empresa-principal)',
            color: 'var(--color-empresa-principal)', width: '100%', padding: '14px',
            borderRadius: '10px', fontSize: '1rem', fontWeight: 600,
            cursor: 'pointer', marginTop: '15px', transition: 'all 0.3s',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          }}
          onMouseEnter={(e) => {
            const b = e.currentTarget
            b.style.background = 'var(--color-empresa-principal)'
            b.style.color = 'white'
            b.style.transform = 'translateY(-2px)'
          }}
          onMouseLeave={(e) => {
            const b = e.currentTarget
            b.style.background = '#fff'
            b.style.color = 'var(--color-empresa-principal)'
            b.style.transform = 'translateY(0)'
          }}
        >
          <Plus size={18} /> Agregar Meta
        </button>
      </Dialog.Trigger>

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
              Registrar nueva meta
            </Dialog.Title>
            <Dialog.Close asChild>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666' }} aria-label="Cerrar">
                <X size={20} />
              </button>
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={labelStyle}>Nombre de la meta</label>
              <input name="nombre_meta" type="text" required
                placeholder="Ej: Vacaciones, Auto, Fondo de emergencia..." style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Monto Objetivo</label>
              <input name="monto_objetivo" type="number" step="0.01" min="0.01" required style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Monto Inicial</label>
              <input name="monto_inicial" type="number" step="0.01" min="0" defaultValue="0" required style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Fecha Límite</label>
              <input name="fecha_limite" type="date" defaultValue={today} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Nota / descripción <span style={{ color: '#999', fontWeight: 400 }}>(opcional)</span></label>
              <textarea name="descripcion" rows={2} style={{ ...inputStyle, resize: 'vertical' }}
                placeholder="Ej: Plan para vacaciones, Compra de auto..." />
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
