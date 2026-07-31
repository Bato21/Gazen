'use client'

import { useState } from 'react'
import { actualizarEmpresa } from './actions'
import type { Empresa } from '@/types/database.types'

const cardStyle: React.CSSProperties = {
  background: 'white', borderRadius: 12, padding: 20,
  boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
}
const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: '0.85rem', fontWeight: 600,
  color: '#211a1a', marginBottom: 4, marginTop: 10,
}
const inputStyle: React.CSSProperties = {
  width: '100%', padding: '8px 12px', border: '1px solid #ced4da',
  borderRadius: 6, fontSize: '0.95rem', backgroundColor: '#fff',
  color: '#212121', boxSizing: 'border-box',
}

export function EmpresaForm({ empresa }: { empresa: Empresa }) {
  const [pending, setPending] = useState(false)
  const [msg, setMsg] = useState<{ type: 'error' | 'ok'; text: string } | null>(null)
  const [colorPrincipal, setColorPrincipal] = useState(empresa.color_principal)
  const [colorSecundario, setColorSecundario] = useState(empresa.color_secundario)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setPending(true)
    setMsg(null)
    const result = await actualizarEmpresa(new FormData(e.currentTarget))
    setPending(false)
    if (result.error) setMsg({ type: 'error', text: result.error })
    else setMsg({ type: 'ok', text: 'Cambios guardados.' })
  }

  return (
    <div style={cardStyle}>
      <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#2c2c2c' }}>
        Datos de la empresa
      </h3>
      <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#666' }}>
        Nombre, dirección, moneda y colores. Los colores se aplican al layout tras guardar.
      </p>

      <form onSubmit={handleSubmit}>
        <label style={labelStyle} htmlFor="nombre">Nombre</label>
        <input id="nombre" name="nombre" type="text" required
          defaultValue={empresa.nombre} style={inputStyle} />

        <label style={labelStyle} htmlFor="direccion">Dirección <span style={{ color: '#999', fontWeight: 400 }}>(opcional)</span></label>
        <input id="direccion" name="direccion" type="text"
          defaultValue={empresa.direccion ?? ''} style={inputStyle} />

        <label style={labelStyle} htmlFor="moneda">Moneda</label>
        <select id="moneda" name="moneda" defaultValue={empresa.moneda}
          style={{ ...inputStyle, backgroundColor: '#f5bebe' }}>
          <option value="MXN">MXN — Peso mexicano</option>
          <option value="USD">USD — Dólar</option>
          <option value="EUR">EUR — Euro</option>
        </select>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 4 }}>
          <div>
            <label style={labelStyle} htmlFor="color_principal">Color principal</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input id="color_principal" name="color_principal" type="color"
                value={colorPrincipal}
                onChange={(e) => setColorPrincipal(e.target.value)}
                style={{ width: 48, height: 38, padding: 2, border: '1px solid #ced4da', borderRadius: 6, background: '#fff', cursor: 'pointer' }} />
              <input type="text" value={colorPrincipal}
                onChange={(e) => setColorPrincipal(e.target.value)}
                style={{ ...inputStyle, fontFamily: 'monospace' }} />
            </div>
          </div>
          <div>
            <label style={labelStyle} htmlFor="color_secundario">Color secundario</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input id="color_secundario" name="color_secundario" type="color"
                value={colorSecundario}
                onChange={(e) => setColorSecundario(e.target.value)}
                style={{ width: 48, height: 38, padding: 2, border: '1px solid #ced4da', borderRadius: 6, background: '#fff', cursor: 'pointer' }} />
              <input type="text" value={colorSecundario}
                onChange={(e) => setColorSecundario(e.target.value)}
                style={{ ...inputStyle, fontFamily: 'monospace' }} />
            </div>
          </div>
        </div>

        {/* Preview */}
        <div style={{ marginTop: 14, display: 'flex', gap: 10, alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: '#666' }}>Previsualización:</span>
          <div style={{
            padding: '10px 16px', borderRadius: 8, color: '#fff', fontWeight: 700,
            background: colorSecundario,
          }}>
            {empresa.nombre || 'Empresa'}
            <span style={{
              marginLeft: 10, background: colorPrincipal, padding: '3px 8px',
              borderRadius: 6, fontSize: '0.75rem',
            }}>
              acción
            </span>
          </div>
        </div>

        {msg && (
          <p style={{ color: msg.type === 'error' ? '#d60000' : '#0a7d3b', fontSize: '0.875rem', margin: '10px 0 0' }}>
            {msg.text}
          </p>
        )}

        <button type="submit" disabled={pending} style={{
          marginTop: 14, padding: '9px 20px', border: 'none', borderRadius: 8,
          backgroundColor: 'var(--color-empresa-principal)', color: 'white',
          fontSize: '0.9rem', fontWeight: 600,
          cursor: pending ? 'not-allowed' : 'pointer', opacity: pending ? 0.7 : 1,
        }}>
          {pending ? 'Guardando…' : 'Guardar cambios'}
        </button>
      </form>
    </div>
  )
}
