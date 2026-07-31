'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { registrarEmpresa } from './actions'

const cardStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.9)',
  borderRadius: '25px',
  padding: '30px',
  width: '420px',
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

export default function RegistroEmpresaPage() {
  const [state, formAction, isPending] = useActionState(registrarEmpresa, null)

  return (
    <div
      className="gazen-bg min-h-screen flex items-center justify-center"
      style={{ position: 'relative', padding: '30px 0' }}
    >
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={cardStyle}>
          <h2 style={{ color: '#d60000', fontWeight: 'bold', fontSize: '1.5rem', margin: 0 }}>
            Registra tu empresa
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#444', marginTop: 4 }}>
            Crearás la empresa y tu cuenta de administrador.
          </p>

          <form action={formAction}>
            <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
              <legend
                style={{
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  color: '#666',
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                  marginTop: 8,
                }}
              >
                Empresa
              </legend>

              <label style={labelStyle}>Nombre de la empresa</label>
              <input name="nombreEmpresa" type="text" required style={inputStyle} />

              <label style={labelStyle}>Dirección (opcional)</label>
              <input name="direccion" type="text" style={inputStyle} />

              <label style={labelStyle}>Moneda</label>
              <select name="moneda" defaultValue="MXN" style={inputStyle}>
                <option value="MXN">MXN — Peso mexicano</option>
                <option value="USD">USD — Dólar</option>
                <option value="EUR">EUR — Euro</option>
              </select>

              <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Color principal</label>
                  <input
                    name="colorPrincipal"
                    type="color"
                    defaultValue="#C0392B"
                    style={{ ...inputStyle, height: 40, padding: 4 }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Color secundario</label>
                  <input
                    name="colorSecundario"
                    type="color"
                    defaultValue="#2c2c2c"
                    style={{ ...inputStyle, height: 40, padding: 4 }}
                  />
                </div>
              </div>
            </fieldset>

            <fieldset style={{ border: 0, padding: 0, margin: 0, marginTop: 16 }}>
              <legend
                style={{
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  color: '#666',
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                }}
              >
                Administrador
              </legend>

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
            </fieldset>

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
              {isPending ? 'Creando…' : 'Crear empresa'}
            </button>
          </form>

          <p style={{ fontSize: '0.85rem', color: '#333', marginTop: 16, textAlign: 'center' }}>
            ¿Tu empresa ya existe? <Link href="/registro" style={{ color: '#d60000', fontWeight: 600 }}>Únete como usuario</Link>
          </p>
          <p style={{ fontSize: '0.85rem', color: '#333', marginTop: 4, textAlign: 'center' }}>
            ¿Ya tienes cuenta? <Link href="/login" style={{ color: '#d60000', fontWeight: 600 }}>Inicia sesión</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
