'use client'

import { useState, useRef, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import * as Dialog from '@radix-ui/react-dialog'
import {
  Home,
  ArrowLeftRight,
  CreditCard,
  PiggyBank,
  UserCircle,
  Bell,
  MoreVertical,
  LogOut,
  Link,
  User,
  X,
} from 'lucide-react'
import { crearMovimiento } from '@/app/(app)/actions'

interface NavCuenta {
  id: string
  nombre: string
  tipo_cuenta: string
}

interface NavCategoria {
  id: string
  nombre: string
  icono: string | null
}

interface NavMeta {
  id: string
  nombre: string
  tipo: string
}

interface AppNavbarProps {
  nombreEmpresa: string
  nombreUsuario: string
  userEmail: string
  cuentas: NavCuenta[]
  categorias: NavCategoria[]
  metas: NavMeta[]
}

const NAV_ITEMS = [
  { label: 'Home', href: '/home', icon: Home },
  { label: 'Movimientos', href: '/movimientos', icon: ArrowLeftRight },
  { label: 'Deudas', href: '/deudas', icon: CreditCard },
  { label: 'Ahorro', href: '/ahorros', icon: PiggyBank },
]

export function AppNavbar({
  nombreEmpresa,
  nombreUsuario,
  userEmail,
  cuentas,
  categorias,
  metas,
}: AppNavbarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function handleLogout() {
    const { logout } = await import('@/app/login/actions')
    await logout()
  }

  async function handleSubmitMovimiento(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setFormError(null)
    setIsPending(true)
    const formData = new FormData(e.currentTarget)
    const result = await crearMovimiento(formData)
    setIsPending(false)
    if (result?.error) {
      setFormError(result.error)
    } else {
      setModalOpen(false)
    }
  }

  // Default datetime for the form
  const defaultDatetime = new Date().toISOString().slice(0, 16)

  const selectStyle: React.CSSProperties = {
    width: '100%',
    padding: '8px 10px',
    border: '1px solid #ced4da',
    borderRadius: '6px',
    fontSize: '0.9rem',
    backgroundColor: '#f5bebe',
    color: '#212121',
    boxSizing: 'border-box',
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '8px 10px',
    border: '1px solid #ced4da',
    borderRadius: '6px',
    fontSize: '0.9rem',
    backgroundColor: '#fff',
    color: '#212121',
    boxSizing: 'border-box',
  }

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '0.85rem',
    fontWeight: 500,
    color: '#444',
    marginBottom: '4px',
  }

  return (
    <nav
      style={{
        background: 'linear-gradient(135deg, var(--color-empresa-secundario) 0%, var(--color-empresa-secundario) 100%)',
        borderRadius: '12px',
        padding: '15px 30px',
        color: 'white',
        boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        margin: '15px 15px 0 15px',
      }}
    >
      {/* Left: company name */}
      <h1
        style={{
          color: 'white',
          margin: 0,
          fontSize: '1.8rem',
          fontWeight: 700,
          letterSpacing: '2px',
          whiteSpace: 'nowrap',
        }}
      >
        {nombreEmpresa}
      </h1>

      {/* Center: nav items */}
      <nav style={{ display: 'flex', gap: '40px', alignItems: 'center' }}>
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/')
          return (
            <button
              key={href}
              onClick={() => router.push(href)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: isActive
                  ? 'var(--color-empresa-principal)'
                  : 'transparent',
                color: 'white',
                fontSize: '0.8rem',
                fontWeight: isActive ? 600 : 400,
                transition: 'background-color 0.2s, transform 0.2s',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgba(255,255,255,0.1)'
                  ;(e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)'
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'
                  ;(e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)'
                }
              }}
            >
              <Icon size={20} />
              <span>{label}</span>
            </button>
          )
        })}
      </nav>

      {/* Right: user info + actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* User info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <UserCircle size={24} />
          <div style={{ lineHeight: '1.2' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>
              Bienvenido, {nombreUsuario}
            </div>
            <div style={{ fontSize: '0.75rem', opacity: 0.75 }}>{userEmail}</div>
          </div>
        </div>

        {/* Ingresar Movimiento button */}
        <Dialog.Root open={modalOpen} onOpenChange={setModalOpen}>
          <Dialog.Trigger asChild>
            <button
              style={{
                backgroundColor: 'var(--color-empresa-principal)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 16px',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              + Ingresar Movimiento
            </button>
          </Dialog.Trigger>

          <Dialog.Portal>
            <Dialog.Overlay
              style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(0,0,0,0.5)',
                zIndex: 100,
              }}
            />
            <Dialog.Content
              style={{
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '30px',
                width: '480px',
                maxWidth: '95vw',
                maxHeight: '90vh',
                overflowY: 'auto',
                zIndex: 101,
                boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <Dialog.Title style={{ margin: 0, fontSize: '1.3rem', fontWeight: 700, color: '#2c2c2c' }}>
                  Ingresar Movimiento
                </Dialog.Title>
                <Dialog.Close asChild>
                  <button
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666' }}
                    aria-label="Cerrar"
                  >
                    <X size={20} />
                  </button>
                </Dialog.Close>
              </div>

              <form onSubmit={handleSubmitMovimiento} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={labelStyle}>Descripción</label>
                  <input
                    name="descripcion"
                    type="text"
                    required
                    placeholder="Ej: Pago de nómina"
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={labelStyle}>Valor</label>
                  <input
                    name="valor"
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    placeholder="0.00"
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={labelStyle}>Categoría</label>
                  <select name="categoria" style={selectStyle}>
                    <option value="">Sin categoría</option>
                    {categorias.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.icono ? `${cat.icono} ` : ''}{cat.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>Meta</label>
                  <select name="meta" style={selectStyle}>
                    <option value="">Sin meta</option>
                    {metas.map((meta) => (
                      <option key={meta.id} value={meta.id}>
                        {meta.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>Tipo</label>
                  <select name="tipoIngreso" required style={selectStyle}>
                    <option value="Ingreso">Ingreso</option>
                    <option value="Gasto">Gasto</option>
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>Cuenta Asociada</label>
                  <select name="cuenta" required style={selectStyle}>
                    <option value="">Seleccionar cuenta</option>
                    {cuentas.map((cuenta) => (
                      <option key={cuenta.id} value={cuenta.id}>
                        {cuenta.nombre} ({cuenta.tipo_cuenta})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>Fecha y hora</label>
                  <input
                    name="fecha"
                    type="datetime-local"
                    required
                    defaultValue={defaultDatetime}
                    style={inputStyle}
                  />
                </div>

                {formError && (
                  <p style={{ color: '#C0392B', fontSize: '0.875rem', margin: 0 }}>{formError}</p>
                )}

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '6px' }}>
                  <Dialog.Close asChild>
                    <button
                      type="button"
                      style={{
                        padding: '9px 20px',
                        border: '1px solid #ccc',
                        borderRadius: '8px',
                        backgroundColor: 'white',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                      }}
                    >
                      Cancelar
                    </button>
                  </Dialog.Close>
                  <button
                    type="submit"
                    disabled={isPending}
                    style={{
                      padding: '9px 20px',
                      border: 'none',
                      borderRadius: '8px',
                      backgroundColor: 'var(--color-empresa-principal)',
                      color: 'white',
                      cursor: isPending ? 'not-allowed' : 'pointer',
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      opacity: isPending ? 0.7 : 1,
                    }}
                  >
                    {isPending ? 'Guardando…' : 'Guardar'}
                  </button>
                </div>
              </form>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>

        {/* Bell icon */}
        <button
          style={{
            background: 'none',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
          }}
          aria-label="Notificaciones"
        >
          <Bell size={22} />
        </button>

        {/* 3-dots dropdown */}
        <div style={{ position: 'relative' }} ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((prev) => !prev)}
            style={{
              background: 'none',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
            }}
            aria-label="Más opciones"
          >
            <MoreVertical size={22} />
          </button>

          {dropdownOpen && (
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: '110%',
                backgroundColor: 'white',
                borderRadius: '8px',
                boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                minWidth: '160px',
                zIndex: 200,
                overflow: 'hidden',
              }}
            >
              <button
                onClick={() => {
                  setDropdownOpen(false)
                  router.push('/perfil')
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  width: '100%',
                  padding: '12px 16px',
                  border: 'none',
                  backgroundColor: 'transparent',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  color: '#212121',
                  textAlign: 'left',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#f5f5f5'
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'
                }}
              >
                <User size={16} />
                Mi perfil
              </button>
              <button
                onClick={() => {
                  setDropdownOpen(false)
                  router.push('/links')
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  width: '100%',
                  padding: '12px 16px',
                  border: 'none',
                  backgroundColor: 'transparent',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  color: '#212121',
                  textAlign: 'left',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#f5f5f5'
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'
                }}
              >
                <Link size={16} />
                Ver Links
              </button>
              <button
                onClick={() => {
                  setDropdownOpen(false)
                  handleLogout()
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  width: '100%',
                  padding: '12px 16px',
                  border: 'none',
                  backgroundColor: 'transparent',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  color: '#C0392B',
                  textAlign: 'left',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#fff5f5'
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'
                }}
              >
                <LogOut size={16} />
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
