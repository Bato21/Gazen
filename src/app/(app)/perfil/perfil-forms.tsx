'use client'

import { useState } from 'react'
import { actualizarNombre, cambiarPassword, type PerfilResult } from './actions'

const cardStyle: React.CSSProperties = {
  background: 'white',
  borderRadius: 12,
  padding: 20,
  boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.85rem',
  fontWeight: 600,
  color: '#211a1a',
  marginBottom: 4,
  marginTop: 10,
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 12px',
  border: '1px solid #ced4da',
  borderRadius: 6,
  fontSize: '0.95rem',
  backgroundColor: '#fff',
  color: '#212121',
  boxSizing: 'border-box',
}

const buttonStyle: React.CSSProperties = {
  padding: '9px 20px',
  border: 'none',
  borderRadius: 8,
  backgroundColor: 'var(--color-empresa-principal)',
  color: 'white',
  fontSize: '0.9rem',
  fontWeight: 600,
  cursor: 'pointer',
  marginTop: 14,
}

function Feedback({ result }: { result: PerfilResult | null }) {
  if (!result) return null
  const color = result.error ? '#d60000' : '#0a7d3b'
  const msg = result.error ?? result.success
  return (
    <p style={{ color, fontSize: '0.875rem', margin: '10px 0 0' }}>{msg}</p>
  )
}

export function NombreForm({ nombreInicial }: { nombreInicial: string }) {
  const [result, setResult] = useState<PerfilResult | null>(null)
  const [isPending, setIsPending] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsPending(true)
    setResult(null)
    const formData = new FormData(e.currentTarget)
    const res = await actualizarNombre(formData)
    setIsPending(false)
    setResult(res)
  }

  return (
    <div style={cardStyle}>
      <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#2c2c2c' }}>
        Nombre visible
      </h3>
      <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#666' }}>
        Se muestra en el navbar y en los movimientos que registras.
      </p>
      <form onSubmit={handleSubmit}>
        <label style={labelStyle} htmlFor="nombre">
          Nombre
        </label>
        <input
          id="nombre"
          name="nombre"
          type="text"
          required
          defaultValue={nombreInicial}
          style={inputStyle}
        />
        <Feedback result={result} />
        <button
          type="submit"
          disabled={isPending}
          style={{ ...buttonStyle, opacity: isPending ? 0.7 : 1, cursor: isPending ? 'not-allowed' : 'pointer' }}
        >
          {isPending ? 'Guardando…' : 'Guardar cambios'}
        </button>
      </form>
    </div>
  )
}

export function PasswordForm() {
  const [result, setResult] = useState<PerfilResult | null>(null)
  const [isPending, setIsPending] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsPending(true)
    setResult(null)
    const form = e.currentTarget
    const formData = new FormData(form)
    const res = await cambiarPassword(formData)
    setIsPending(false)
    setResult(res)
    if (res.success) form.reset()
  }

  return (
    <div style={cardStyle}>
      <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#2c2c2c' }}>
        Cambiar contraseña
      </h3>
      <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#666' }}>
        Necesitas tu contraseña actual para confirmar.
      </p>
      <form onSubmit={handleSubmit}>
        <label style={labelStyle} htmlFor="password_actual">
          Contraseña actual
        </label>
        <input
          id="password_actual"
          name="password_actual"
          type="password"
          autoComplete="current-password"
          required
          style={inputStyle}
        />
        <label style={labelStyle} htmlFor="password_nueva">
          Nueva contraseña
        </label>
        <input
          id="password_nueva"
          name="password_nueva"
          type="password"
          autoComplete="new-password"
          required
          style={inputStyle}
        />
        <p style={{ fontSize: '0.75rem', color: '#666', margin: '4px 0 0' }}>
          Mínimo 8 caracteres, con mayúscula, minúscula y número.
        </p>
        <label style={labelStyle} htmlFor="password_confirmar">
          Confirmar nueva contraseña
        </label>
        <input
          id="password_confirmar"
          name="password_confirmar"
          type="password"
          autoComplete="new-password"
          required
          style={inputStyle}
        />
        <Feedback result={result} />
        <button
          type="submit"
          disabled={isPending}
          style={{ ...buttonStyle, opacity: isPending ? 0.7 : 1, cursor: isPending ? 'not-allowed' : 'pointer' }}
        >
          {isPending ? 'Actualizando…' : 'Actualizar contraseña'}
        </button>
      </form>
    </div>
  )
}
