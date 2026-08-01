# Estado de la migración Django → Next.js

Traza el estado de la migración desde el Django original (`Desktop/UDD/Proyectos/Gazen-Libreta`) a este stack **Next.js 16 + React 19 + Supabase + Vercel**. Actualiza este archivo al cerrar cada bloque de trabajo.

## Stack

- **Next.js 16 (App Router)** + **React 19** — server components + server actions.
- **Supabase** — Postgres + Auth + RLS. Schema en `supabase/schema.sql`.
- **Radix UI** — dialogs.
- **lucide-react** — iconos.
- **Vercel** — target de deploy.

Cliente admin (`src/lib/supabase/admin.ts`) usa `SUPABASE_SERVICE_ROLE_KEY` sólo en el flujo de registro para bypassear RLS al crear empresa+admin en un solo paso.

## Hecho

### Auth y registro
- `POST /login` con Supabase Auth + middleware que protege todas las rutas no `/login`, `/registro*`.
- **`/registro-empresa`** — flujo mejorado: crea auth user + empresa + usuario (admin) atómicamente, con rollback si falla el insert de usuario.
- **`/registro`** — usuario nuevo que se une a una empresa existente por nombre; se crea con `cargo='Usuario'`, `es_admin=false`.
- Middleware en `src/middleware.ts`.

### Shell + dashboard
- `AppLayout` (`src/app/(app)/layout.tsx`) fetchea usuario, empresa, cuentas, categorías, metas y aplica los colores de empresa vía CSS vars.
- `AppNavbar` con dropdown; el link **Mi empresa** aparece sólo si `es_admin`.
- Home dashboard replicando estética Django.

### Movimientos (`/movimientos`)
- Panel de cuentas + historial filtrado.
- CRUD completo: crear (desde navbar), **editar** y **eliminar** (iconos lápiz/papelera con confirm).
- Al crear ingreso con meta ahorro asociada, best-effort `rpc('increment_meta')`.

### Deudas (`/deudas`)
- Resumen (capacidad de pago, alertas, progreso) + lista con registro de pagos.
- CRUD completo: crear, **editar** (valida nuevo monto_total ≥ pagado), **eliminar**.
- **Cambiar estado** con chips: activa → pagada/cancelada, y reactivar desde pagada/cancelada.

### Ahorros (`/ahorros`)
- Metas de ahorro, caja chica, alertas <50%.
- CRUD completo: crear, **editar** (monto_actual ajustable a mano), **eliminar**.
- Card extraído a `MetaCard` client component (fixa handlers `onMouseEnter` que estaban mal ubicados en un server component).

### Perfil (`/perfil`)
- Ver información de usuario y empresa.
- Editar nombre visible.
- Cambiar contraseña con re-autenticación de la contraseña actual.

### Empresa (`/empresa`) — admin only
- Editar nombre, dirección, moneda y colores (color picker + hex sincronizado + previsualización en vivo). Al guardar, `revalidatePath('/', 'layout')` aplica los nuevos colores en toda la app.
- CRUD de cuentas: crear, editar (todos), eliminar (sólo admin — consistente con RLS `cuentas_delete`).
- **CRUD de usuarios de la empresa** (`UsuariosPanel`): invitar (crea auth user + row `usuarios` atómico), editar nombre/cargo/es_admin, eliminar (cascade en `auth.users`). Guardarraíles: no puede editarse ni eliminarse a sí mismo desde el panel; no puede quedar la empresa sin admins.
- Redirige a `/perfil` si el usuario no es admin.

### Emisores (`/emisores`)
- CRUD completo: crear, editar, eliminar (protegido por RLS a la empresa; delete sólo admin).
- Wired al form de crear/editar movimiento (select "Emisor") y visible en la fila del historial.

### Categorías (`/categorias`)
- Dos secciones: propias (editables) y globales (solo lectura).
- CRUD sobre propias con selector de icono (mismos íconos de Lucide que usa el historial de movimientos).

### Links (`/links`)
- Grid de atajos a rutas principales, perfil, emisores, categorías, docs de Supabase, etc.

## Falta

### Migraciones pendientes en el proyecto Supabase
- Aplicar `supabase/migrations/001_emisores_categorias_update_delete.sql` (policies UPDATE/DELETE para `emisores` y `categorias`). Sin esto el CRUD de esas dos tablas fallará por RLS.

### Pendientes funcionales
- **Notificaciones**: la campanita del navbar sigue placeholder. Falta modelo, tabla y bandeja.
- **Membresías**: el campo `empresas.membresia` existe pero no hay flujo para cambiarla. Django tenía página de upgrade.
- **Reportes / exportación**: Django tiene vistas de reportes por rango de fechas y exportación PDF/Excel. No portadas.

### Cosas menores
- El warning de build "middleware convention is deprecated" (Next.js 16) sugiere renombrar `src/middleware.ts` → `src/proxy.ts`. Aún funciona pero eventualmente hay que migrarlo.
- **Configuración MCP Supabase**: el proyecto Supabase (`odsovfjwbtvgdoyuzhpp`) está en una cuenta a la que Claude no tiene acceso vía el MCP actual. Cuando se necesite aplicar migraciones directas, decidir entre:
  - Reconectar el MCP claude.ai a esa cuenta (pierdes acceso a las otras) vía `/mcp`.
  - Instalar un MCP local por proyecto: `claude mcp add supabase-gazen npx @supabase/mcp-server-supabase --access-token TOKEN --project-ref odsovfjwbtvgdoyuzhpp`.

### Chequeos pendientes antes de producción
- **Vercel CLI** no está instalado localmente (`npm i -g vercel`) — hace falta para `vercel env pull`, `vercel deploy`, `vercel logs`.
- **`.env.local`** — verificar que `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` y `SUPABASE_SERVICE_ROLE_KEY` estén también en el entorno de Vercel.
- Correr `next build` completo y validar bundle antes del primer deploy.
