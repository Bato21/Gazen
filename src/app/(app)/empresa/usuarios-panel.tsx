'use client'

import { useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { X, Plus, Pencil, Trash2, UserCircle, ShieldCheck } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { invitarUsuario, editarUsuario, eliminarUsuario } from './actions'

const CARGOS = ['Administrador', 'Contador', 'Usuario', 'Gerente'] as const
type Cargo = (typeof CARGOS)[number]

export interface UsuarioRow {
  id: string
  nombre: string
  email: string
  cargo: Cargo
  es_admin: boolean
  is_self: boolean
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

export function UsuariosPanel({ usuarios }: { usuarios: UsuarioRow[] }) {
  const router = useRouter()
  const [invitarOpen, setInvitarOpen] = useState(false)
  const [editando, setEditando] = useState<UsuarioRow | null>(null)

  async function handleEliminar(u: UsuarioRow) {
    if (!window.confirm(`¿Eliminar a "${u.nombre}"? Esta acción borra su cuenta de acceso.`)) return
    const result = await eliminarUsuario(u.id)
    if (result.error) { window.alert(result.error); return }
    router.refresh()
  }

  return (
    <div style={cardStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#2c2c2c' }}>
            Usuarios de la empresa
          </h3>
          <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#666' }}>
            Invita, edita y elimina las cuentas de acceso de tu equipo.
          </p>
        </div>
        <button type="button" onClick={() => setInvitarOpen(true)} style={{
          background: 'var(--color-empresa-principal)', color: '#fff', border: 'none',
          padding: '8px 14px', borderRadius: 8, fontSize: '0.85rem', fontWeight: 600,
          cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6,
        }}>
          <Plus size={16} /> Invitar usuario
        </button>
      </div>

      <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {usuarios.length === 0 && (
          <p style={{ color: '#666', textAlign: 'center', padding: '20px 0', margin: 0 }}>
            No hay usuarios registrados.
          </p>
        )}
        {usuarios.map((u) => (
          <div key={u.id} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '10px 12px', background: '#f8f9fa', border: '1px solid #e0e0e0',
            borderRadius: 8,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
              <UserCircle size={22} style={{ color: 'var(--color-empresa-principal)', flexShrink: 0 }} />
              <div style={{ minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontWeight: 600, color: '#2c2c2c', fontSize: '0.95rem' }}>
                    {u.nombre}
                  </span>
                  {u.is_self && (
                    <span style={{
                      fontSize: '0.65rem', fontWeight: 600, background: '#e0e7ff', color: '#3730a3',
                      padding: '2px 6px', borderRadius: 10, textTransform: 'uppercase',
                    }}>Tú</span>
                  )}
                  {u.es_admin && (
                    <span title="Administrador" style={{
                      display: 'inline-flex', alignItems: 'center', gap: 3,
                      fontSize: '0.65rem', fontWeight: 600, background: '#fef3c7', color: '#92400e',
                      padding: '2px 6px', borderRadius: 10, textTransform: 'uppercase',
                    }}>
                      <ShieldCheck size={10} /> Admin
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#888', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {u.email} · {u.cargo}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
              <button type="button" style={iconBtn} onClick={() => setEditando(u)} aria-label="Editar usuario" title="Editar">
                <Pencil size={14} />
              </button>
              {!u.is_self && (
                <button type="button" style={{ ...iconBtn, color: '#C0392B', borderColor: '#e6b0aa' }}
                  onClick={() => handleEliminar(u)} aria-label="Eliminar usuario" title="Eliminar">
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <InvitarDialog
        open={invitarOpen}
        onOpenChange={setInvitarOpen}
        onSuccess={() => router.refresh()}
      />

      <EditarDialog
        usuario={editando}
        open={editando !== null}
        onOpenChange={(o) => { if (!o) setEditando(null) }}
        onSuccess={() => router.refresh()}
      />
    </div>
  )
}

function DialogShell({
  open, onOpenChange, title, children,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  title: string
  children: React.ReactNode
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100 }} />
        <Dialog.Content style={{
          position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
          backgroundColor: 'white', borderRadius: 12, padding: 28,
          width: 440, maxWidth: '95vw', maxHeight: '90vh', overflowY: 'auto',
          zIndex: 101, boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Dialog.Title style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: '#2c2c2c' }}>
              {title}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666' }} aria-label="Cerrar">
                <X size={20} />
              </button>
            </Dialog.Close>
          </div>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

function InvitarDialog({
  open, onOpenChange, onSuccess,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  onSuccess: () => void
}) {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setPending(true)
    setError(null)
    const fd = new FormData(e.currentTarget)
    const result = await invitarUsuario(fd)
    setPending(false)
    if (result.error) { setError(result.error); return }
    onOpenChange(false)
    onSuccess()
  }

  return (
    <DialogShell open={open} onOpenChange={onOpenChange} title="Invitar usuario">
      <p style={{ margin: '0 0 8px', fontSize: '0.8rem', color: '#666' }}>
        Creas la cuenta con una contraseña temporal. Comparte el correo y contraseña con el usuario;
        podrá cambiarla desde su perfil al ingresar.
      </p>
      <form onSubmit={handleSubmit}>
        <label style={labelStyle}>Nombre</label>
        <input name="nombre" type="text" required style={inputStyle} placeholder="Ej: María López" />

        <label style={labelStyle}>Correo</label>
        <input name="email" type="email" required style={inputStyle} placeholder="usuario@empresa.com" />

        <label style={labelStyle}>Contraseña temporal</label>
        <input name="password" type="text" required style={inputStyle} placeholder="Mín. 8, con mayúscula, minúscula y número" />

        <label style={labelStyle}>Cargo</label>
        <select name="cargo" defaultValue="Usuario" style={{ ...inputStyle, backgroundColor: '#f5bebe' }}>
          {CARGOS.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>

        <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: 8, marginTop: 12 }}>
          <input name="es_admin" type="checkbox" />
          <span>Administrador (puede gestionar la empresa)</span>
        </label>

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
            {pending ? 'Creando…' : 'Crear usuario'}
          </button>
        </div>
      </form>
    </DialogShell>
  )
}

function EditarDialog({
  usuario, open, onOpenChange, onSuccess,
}: {
  usuario: UsuarioRow | null
  open: boolean
  onOpenChange: (o: boolean) => void
  onSuccess: () => void
}) {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!usuario) return null

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setPending(true)
    setError(null)
    const fd = new FormData(e.currentTarget)
    const result = await editarUsuario(fd)
    setPending(false)
    if (result.error) { setError(result.error); return }
    onOpenChange(false)
    onSuccess()
  }

  return (
    <DialogShell open={open} onOpenChange={onOpenChange} title={`Editar ${usuario.nombre}`}>
      <form onSubmit={handleSubmit}>
        <input type="hidden" name="id" value={usuario.id} />

        <label style={labelStyle}>Nombre</label>
        <input name="nombre" type="text" required defaultValue={usuario.nombre} style={inputStyle} />

        <label style={labelStyle}>Correo</label>
        <input type="email" value={usuario.email} disabled
          style={{ ...inputStyle, background: '#f2f2f2', color: '#888' }} />

        <label style={labelStyle}>Cargo</label>
        <select name="cargo" defaultValue={usuario.cargo} style={{ ...inputStyle, backgroundColor: '#f5bebe' }}>
          {CARGOS.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>

        <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: 8, marginTop: 12 }}>
          <input name="es_admin" type="checkbox" defaultChecked={usuario.es_admin} />
          <span>Administrador (puede gestionar la empresa)</span>
        </label>

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
    </DialogShell>
  )
}
