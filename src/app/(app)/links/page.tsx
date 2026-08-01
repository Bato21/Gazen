import Link from 'next/link'
import {
  Home,
  ArrowLeftRight,
  CreditCard,
  PiggyBank,
  UserCircle,
  BookOpen,
  Mail,
  ExternalLink,
  Building2,
  Tag,
} from 'lucide-react'

interface LinkItem {
  href: string
  label: string
  description: string
  icon: React.ComponentType<{ size?: number }>
  external?: boolean
}

const SECCIONES: { titulo: string; items: LinkItem[] }[] = [
  {
    titulo: 'Navegación',
    items: [
      { href: '/home', label: 'Inicio', description: 'Dashboard con resumen general', icon: Home },
      { href: '/movimientos', label: 'Movimientos', description: 'Ingresos, gastos e historial', icon: ArrowLeftRight },
      { href: '/deudas', label: 'Deudas', description: 'Deudas activas y pagos', icon: CreditCard },
      { href: '/ahorros', label: 'Ahorros', description: 'Metas y caja chica', icon: PiggyBank },
    ],
  },
  {
    titulo: 'Cuenta',
    items: [
      { href: '/perfil', label: 'Mi perfil', description: 'Editar tus datos y contraseña', icon: UserCircle },
      { href: '/emisores', label: 'Emisores', description: 'Proveedores y clientes de tus movimientos', icon: Building2 },
      { href: '/categorias', label: 'Categorías', description: 'Etiquetas para clasificar movimientos', icon: Tag },
    ],
  },
  {
    titulo: 'Recursos',
    items: [
      {
        href: 'https://supabase.com/docs',
        label: 'Documentación Supabase',
        description: 'Referencia técnica para la base de datos',
        icon: BookOpen,
        external: true,
      },
      {
        href: 'mailto:soporte@gazenlibreta.example',
        label: 'Contacto / Soporte',
        description: 'Escríbenos si tienes dudas o encuentras errores',
        icon: Mail,
        external: true,
      },
    ],
  },
]

export default function LinksPage() {
  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '20px 15px' }}>
      <header style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 700, color: 'white' }}>Links y atajos</h1>
        <p style={{ margin: '4px 0 0', fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)' }}>
          Todo lo importante de Gazen Libreta en un solo lugar.
        </p>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {SECCIONES.map((seccion) => (
          <section key={seccion.titulo}>
            <h2
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: 'rgba(255,255,255,0.7)',
                textTransform: 'uppercase',
                letterSpacing: 1.5,
                margin: '0 0 10px',
              }}
            >
              {seccion.titulo}
            </h2>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                gap: 12,
              }}
            >
              {seccion.items.map(({ href, label, description, icon: Icon, external }) => {
                const contenido = (
                  <div
                    style={{
                      background: 'white',
                      borderRadius: 12,
                      padding: '14px 16px',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                      display: 'flex',
                      gap: 12,
                      alignItems: 'flex-start',
                      height: '100%',
                      transition: 'transform 0.15s',
                    }}
                  >
                    <div
                      style={{
                        background: 'var(--color-empresa-principal)',
                        color: 'white',
                        width: 36,
                        height: 36,
                        borderRadius: 8,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Icon size={18} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#212121' }}>
                          {label}
                        </span>
                        {external && <ExternalLink size={12} color="#888" />}
                      </div>
                      <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#555' }}>
                        {description}
                      </p>
                    </div>
                  </div>
                )
                return external ? (
                  <a
                    key={href}
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    style={{ textDecoration: 'none' }}
                  >
                    {contenido}
                  </a>
                ) : (
                  <Link key={href} href={href} style={{ textDecoration: 'none' }}>
                    {contenido}
                  </Link>
                )
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
