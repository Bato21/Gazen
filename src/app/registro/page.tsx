'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { registrarUsuario } from './actions'

const cardStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.9)',
  borderRadius: '25px',
  padding: '30px',
  width: '380px',
  maxWidth: '95vw',
  boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
  textAlign: 'left',
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 12px',
  border: '1px solid #ced4da',
  borderRadius: '6px',
  fontSize: '0.95rem',
  backgroundColor: '#fff',
  color: '#212121',
  boxSizing: 'border-box',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.85rem',
  fontWeight: 600,
  color: '#211a1a',
  marginBottom: '4px',
  marginTop: '10px',
}

export default function RegistroPage() {
  const [state, formAction, isPending] = useActionState(registrarUsuario, null)

  return (
    <div
      className="gazen-bg min-h-screen flex items-center justify-center"
      style={{ position: 'relative', padding: '30px 0' }}
    >
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={cardStyle}>
          <h2 style={{ color: '#d60000', fontWeight: 'bold', fontSize: '1.5rem', margin: 0 }}>
            Únete a una empresa
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#444', marginTop: 4 }}>
            Regístrate en una empresa que ya existe en Gazen Libreta.
          </p>

          <form action={formAction}>
            <label style={labelStyle}>Nombre de la empresa</label>
            <input name="nombreEmpresa" type="text" required style={inputStyle} />

            <label style={labelStyle}>Tu nombre</label>
            <input name="nombreUsuario" type="text" required style={inputStyle} />

            <label style={labelStyle}>Correo</label>
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              style={inputStyle}
            />

            <label style={labelStyle}>Contraseña</label>
            <input
              name="password"
              type="password"
              required
              autoComplete="new-password"
              style={inputStyle}
            />
            <p style={{ fontSize: '0.75rem', color: '#666', margin: '4px 0 0' }}>
              Mínimo 8 caracteres, con mayúscula, minúscula y número.
            </p>

            {state?.error && (
              <p style={{ color: '#d60000', fontSize: '0.875rem', margin: '12px 0 0' }}>
                {state.error}
              </p>
            )}

            <button
              type="submit"
              disabled={isPending}
              style={{
                width: '100%',
                padding: '10px',
                marginTop: 16,
                backgroundColor: '#d60000',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: isPending ? 'not-allowed' : 'pointer',
                opacity: isPending ? 0.7 : 1,
              }}
            >
              {isPending ? 'Registrando…' : 'Registrarme'}
            </button>
          </form>

          <p style={{ fontSize: '0.85rem', color: '#333', marginTop: 16, textAlign: 'center' }}>
            ¿Tu empresa no existe? <Link href="/registro-empresa" style={{ color: '#d60000', fontWeight: 600 }}>Regístrala aquí</Link>
          </p>
          <p style={{ fontSize: '0.85rem', color: '#333', marginTop: 4, textAlign: 'center' }}>
            ¿Ya tienes cuenta? <Link href="/login" style={{ color: '#d60000', fontWeight: 600 }}>Inicia sesión</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
