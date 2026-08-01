'use client'

import { useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import {
  X, Plus, Pencil, Trash2, Tag,
  Car, Utensils, Package, Gamepad2, Zap, HeartPulse, GraduationCap, Home,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { crearCategoria, editarCategoria, eliminarCategoria } from './actions'
import type { Categoria } from '@/types/database.types'

const ICONOS = [
  { value: '', label: 'Sin icono', Icon: Tag },
  { value: 'car', label: 'Auto', Icon: Car },
  { value: 'utensils', label: 'Comida', Icon: Utensils },
  { value: 'package', label: 'Paquete', Icon: Package },
  { value: 'gamepad-2', label: 'Ocio', Icon: Gamepad2 },
  { value: 'zap', label: 'Servicios', Icon: Zap },
  { value: 'heart-pulse', label: 'Salud', Icon: HeartPulse },
  { value: 'graduation-cap', label: 'Educación', Icon: GraduationCap },
  { value: 'home', label: 'Hogar', Icon: Home },
] as const

const ICON_MAP: Record<string, React.ComponentType<{ size?: number; color?: string }>> = {
  car: Car, utensils: Utensils, package: Package, 'gamepad-2': Gamepad2,
  zap: Zap, 'heart-pulse': HeartPulse, 'graduation-cap': GraduationCap, home: Home,
}

function IconoFor({ icono, size = 18 }: { icono: string | null; size?: number }) {
  const Icon = icono ? (ICON_MAP[icono] ?? Tag) : Tag
  return <Icon size={size} color="white" />
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

export function CategoriasView({ globales, propias }: { globales: Categoria[]; propias: Categoria[] }) {
  const router = useRouter()
  const [nuevoOpen, setNuevoOpen] = useState(false)
  const [editando, setEditando] = useState<Categoria | null>(null)

  async function handleEliminar(c: Categoria) {
    if (!window.confirm(`¿Eliminar la categoría "${c.nombre}"? Los movimientos referenciados quedarán sin categoría.`)) return
    const result = await eliminarCategoria(c.id)
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
          <Tag size={26} />
        </div>
        <div style={{ flex: 1 }}>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: 'white' }}>
            Categorías
          </h1>
          <p style={{ margin: '2px 0 0', fontSize: '0.85rem', color: 'rgba(255,255,255,0.85)' }}>
            Agrupa tus movimientos. Las globales vienen predefinidas; puedes crear las tuyas.
          </p>
        </div>
        <button type="button" onClick={() => setNuevoOpen(true)} style={{
          background: 'var(--color-empresa-principal)', color: '#fff', border: 'none',
          padding: '10px 16px', borderRadius: 8, fontSize: '0.9rem', fontWeight: 600,
          cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6,
        }}>
          <Plus size={16} /> Nueva categoría
        </button>
      </header>

      <section style={{
        background: 'white', borderRadius: 12, padding: 20, marginBottom: 16,
        boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
      }}>
        <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#2c2c2c' }}>
          Mis categorías
        </h3>
        <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#666' }}>
          Categorías creadas por tu empresa.
        </p>

        <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {propias.length === 0 && (
            <p style={{ color: '#666', textAlign: 'center', padding: '20px 0', margin: 0 }}>
              Todavía no has creado categorías propias.
            </p>
          )}
          {propias.map((c) => <CategoriaRow key={c.id} categoria={c} onEditar={() => setEditando(c)} onEliminar={() => handleEliminar(c)} />)}
        </div>
      </section>

      <section style={{
        background: 'white', borderRadius: 12, padding: 20,
        boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
      }}>
        <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#2c2c2c' }}>
          Categorías globales
        </h3>
        <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#666' }}>
          Disponibles para todas las empresas. No se pueden editar ni eliminar.
        </p>

        <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {globales.map((c) => <CategoriaRow key={c.id} categoria={c} readonly />)}
        </div>
      </section>

      <CategoriaDialog
        mode="crear"
        open={nuevoOpen}
        onOpenChange={setNuevoOpen}
        onSuccess={() => router.refresh()}
      />
      <CategoriaDialog
        mode="editar"
        categoria={editando}
        open={editando !== null}
        onOpenChange={(o) => { if (!o) setEditando(null) }}
        onSuccess={() => router.refresh()}
      />
    </div>
  )
}

function CategoriaRow({
  categoria, onEditar, onEliminar, readonly = false,
}: {
  categoria: Categoria
  onEditar?: () => void
  onEliminar?: () => void
  readonly?: boolean
}) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '10px 12px', background: '#f8f9fa', border: '1px solid #e0e0e0',
      borderRadius: 8,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          background: 'var(--color-empresa-principal)', width: 32, height: 32,
          borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <IconoFor icono={categoria.icono} size={16} />
        </div>
        <div>
          <div style={{ fontWeight: 600, color: '#2c2c2c', fontSize: '0.95rem' }}>{categoria.nombre}</div>
          <div style={{ fontSize: '0.75rem', color: '#888' }}>
            {readonly ? 'Global' : categoria.icono ?? 'Sin icono'}
          </div>
        </div>
      </div>
      {!readonly && (
        <div style={{ display: 'flex', gap: 6 }}>
          <button type="button" style={iconBtn} onClick={onEditar} aria-label="Editar" title="Editar">
            <Pencil size={14} />
          </button>
          <button type="button" style={{ ...iconBtn, color: '#C0392B', borderColor: '#e6b0aa' }}
            onClick={onEliminar} aria-label="Eliminar" title="Eliminar">
            <Trash2 size={14} />
          </button>
        </div>
      )}
    </div>
  )
}

function CategoriaDialog({
  mode, categoria, open, onOpenChange, onSuccess,
}: {
  mode: 'crear' | 'editar'
  categoria?: Categoria | null
  open: boolean
  onOpenChange: (o: boolean) => void
  onSuccess: () => void
}) {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (mode === 'editar' && !categoria) return null

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setPending(true)
    setError(null)
    const fd = new FormData(e.currentTarget)
    const result = mode === 'crear' ? await crearCategoria(fd) : await editarCategoria(fd)
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
              {mode === 'crear' ? 'Nueva categoría' : 'Editar categoría'}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666' }} aria-label="Cerrar">
                <X size={20} />
              </button>
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit}>
            {mode === 'editar' && categoria && <input type="hidden" name="id" value={categoria.id} />}

            <label style={labelStyle}>Nombre</label>
            <input name="nombre" type="text" required
              defaultValue={categoria?.nombre ?? ''}
              placeholder="Ej: Materia prima"
              style={inputStyle} />

            <label style={labelStyle}>Icono</label>
            <select name="icono" defaultValue={categoria?.icono ?? ''}
              style={{ ...inputStyle, backgroundColor: '#f5bebe' }}>
              {ICONOS.map((i) => (
                <option key={i.value} value={i.value}>{i.label}</option>
              ))}
            </select>

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
