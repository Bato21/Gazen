'use client'

import { useActionState } from 'react'
import { login } from './actions'

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(login, null)

  return (
    <div
      className="gazen-bg min-h-screen flex items-center justify-center"
      style={{ position: 'relative' }}
    >
      {/* Content above the ::before overlay */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div
          style={{
            background: 'rgba(255,255,255,0.8)',
            borderRadius: '25px',
            padding: '30px',
            width: '350px',
            boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
            textAlign: 'center',
          }}
        >
          <h2
            style={{
              color: '#d60000',
              fontWeight: 'bold',
              fontSize: '1.5rem',
              marginBottom: '20px',
            }}
          >
            Bienvenido
          </h2>

          <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="Correo electrónico"
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #ced4da',
                borderRadius: '6px',
                fontSize: '0.95rem',
                backgroundColor: '#fff',
                color: '#212121',
                boxSizing: 'border-box',
              }}
            />

            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              placeholder="Contraseña"
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #ced4da',
                borderRadius: '6px',
                fontSize: '0.95rem',
                backgroundColor: '#fff',
                color: '#212121',
                boxSizing: 'border-box',
              }}
            />

            {state?.error && (
              <p style={{ color: '#d60000', fontSize: '0.875rem', margin: 0 }}>
                {state.error}
              </p>
            )}

            <button
              type="submit"
              disabled={isPending}
              style={{
                width: '100%',
                padding: '10px',
                backgroundColor: '#d60000',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: isPending ? 'not-allowed' : 'pointer',
                opacity: isPending ? 0.7 : 1,
                marginTop: '4px',
              }}
            >
              {isPending ? 'Iniciando sesión…' : 'Iniciar sesión'}
            </button>
          </form>
        </div>

        <p
          style={{
            textAlign: 'center',
            fontSize: '0.8rem',
            color: 'rgba(255,255,255,0.85)',
            marginTop: '16px',
          }}
        >
          ¿Problemas para acceder? Contacta a tu administrador.
        </p>
      </div>
    </div>
  )
}
