-- ============================================================
-- GAZEN LIBRETA — Schema Supabase (PostgreSQL)
-- ============================================================

-- Extensiones
create extension if not exists "uuid-ossp";

-- ============================================================
-- EMPRESAS
-- ============================================================
create table public.empresas (
  id              uuid primary key default gen_random_uuid(),
  nombre          text not null,
  direccion       text,
  membresia       text not null default 'Gratis'
                  check (membresia in ('Gratis','Pro','Premium','Ultimate')),
  moneda          text not null default 'MXN'
                  check (moneda in ('MXN','USD','EUR')),
  color_principal  text not null default '#3B82F6',
  color_secundario text not null default '#1E40AF',
  created_at      timestamptz not null default now()
);

-- ============================================================
-- USUARIOS (extiende auth.users de Supabase)
-- ============================================================
create table public.usuarios (
  id          uuid primary key references auth.users(id) on delete cascade,
  empresa_id  uuid not null references public.empresas(id) on delete cascade,
  nombre      text not null,
  cargo       text not null default 'Usuario'
              check (cargo in ('Administrador','Contador','Usuario','Gerente')),
  es_admin    boolean not null default false,
  created_at  timestamptz not null default now()
);

-- ============================================================
-- CUENTAS
-- ============================================================
create table public.cuentas (
  id            uuid primary key default gen_random_uuid(),
  empresa_id    uuid not null references public.empresas(id) on delete cascade,
  tipo_cuenta   text not null default 'Corriente'
                check (tipo_cuenta in ('Ahorro','Corriente','Inversión','Crédito','Efectivo')),
  nombre        text not null,
  saldo_inicial numeric(12,2) not null default 0,
  created_at    timestamptz not null default now()
);

-- ============================================================
-- CATEGORIAS
-- empresa_id null = categoria global; no null = categoria de empresa
-- ============================================================
create table public.categorias (
  id          uuid primary key default gen_random_uuid(),
  empresa_id  uuid references public.empresas(id) on delete cascade,
  nombre      text not null,
  icono       text
);

-- Seed de categorías globales
insert into public.categorias (nombre, icono) values
  ('Transporte',  'car'),
  ('Comida',      'utensils'),
  ('Material',    'package'),
  ('Ocio',        'gamepad-2'),
  ('Servicios',   'zap'),
  ('Salud',       'heart-pulse'),
  ('Educación',   'graduation-cap'),
  ('Hogar',       'home');

-- ============================================================
-- EMISORES (proveedores / pagadores)
-- ============================================================
create table public.emisores (
  id          uuid primary key default gen_random_uuid(),
  empresa_id  uuid not null references public.empresas(id) on delete cascade,
  nombre      text not null,
  direccion   text
);

-- ============================================================
-- METAS (ahorro / deuda)
-- ============================================================
create table public.metas (
  id              uuid primary key default gen_random_uuid(),
  empresa_id      uuid not null references public.empresas(id) on delete cascade,
  tipo            text not null default 'Ahorro'
                  check (tipo in ('Ahorro','Deuda')),
  nombre          text not null,
  monto_objetivo  numeric(12,2) not null,
  monto_actual    numeric(12,2) not null default 0,
  interes_anual   numeric(5,2),
  fecha_inicio    date not null default now(),
  fecha_limite    date,
  created_at      timestamptz not null default now()
);

-- ============================================================
-- MOVIMIENTOS (ingresos y gastos)
-- ============================================================
create table public.movimientos (
  id            uuid primary key default gen_random_uuid(),
  cuenta_id     uuid not null references public.cuentas(id) on delete cascade,
  usuario_id    uuid not null references public.usuarios(id) on delete cascade,
  categoria_id  uuid references public.categorias(id) on delete set null,
  tipo          text not null check (tipo in ('Ingreso','Gasto')),
  emisor_id     uuid references public.emisores(id) on delete set null,
  meta_id       uuid references public.metas(id) on delete set null,
  monto         numeric(12,2) not null,
  fecha         timestamptz not null default now(),
  descripcion   text,
  created_at    timestamptz not null default now()
);

-- ============================================================
-- DEUDAS
-- ============================================================
create table public.deudas (
  id                uuid primary key default gen_random_uuid(),
  usuario_id        uuid not null references public.usuarios(id) on delete cascade,
  cuenta_id         uuid references public.cuentas(id) on delete set null,
  acreedor          text not null,
  descripcion       text,
  monto_total       numeric(12,2) not null,
  monto_pagado      numeric(12,2) not null default 0,
  fecha_vencimiento date not null,
  prioridad         text not null default 'media'
                    check (prioridad in ('alta','media','baja')),
  estado            text not null default 'activa'
                    check (estado in ('activa','pagada','cancelada')),
  tasa_interes      numeric(5,2) not null default 0,
  numero_cuotas     integer,
  created_at        timestamptz not null default now()
);

-- ============================================================
-- PAGOS DE DEUDA
-- ============================================================
create table public.pagos_deuda (
  id          uuid primary key default gen_random_uuid(),
  deuda_id    uuid not null references public.deudas(id) on delete cascade,
  monto       numeric(12,2) not null,
  fecha_pago  date not null default now(),
  nota        text,
  created_at  timestamptz not null default now()
);

-- ============================================================
-- ÍNDICES
-- ============================================================
create index idx_movimientos_cuenta    on public.movimientos(cuenta_id);
create index idx_movimientos_usuario   on public.movimientos(usuario_id);
create index idx_movimientos_fecha     on public.movimientos(fecha desc);
create index idx_movimientos_tipo      on public.movimientos(tipo);
create index idx_deudas_usuario        on public.deudas(usuario_id);
create index idx_deudas_estado         on public.deudas(estado);
create index idx_cuentas_empresa       on public.cuentas(empresa_id);
create index idx_metas_empresa         on public.metas(empresa_id);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
alter table public.empresas   enable row level security;
alter table public.usuarios   enable row level security;
alter table public.cuentas    enable row level security;
alter table public.categorias enable row level security;
alter table public.emisores   enable row level security;
alter table public.metas      enable row level security;
alter table public.movimientos enable row level security;
alter table public.deudas     enable row level security;
alter table public.pagos_deuda enable row level security;

-- Función helper: obtiene empresa_id del usuario autenticado
create or replace function public.my_empresa_id()
returns uuid language sql stable security definer as $$
  select empresa_id from public.usuarios where id = auth.uid()
$$;

-- Función helper: verifica si el usuario es admin
create or replace function public.is_admin()
returns boolean language sql stable security definer as $$
  select coalesce(es_admin, false) from public.usuarios where id = auth.uid()
$$;

-- EMPRESAS: sólo ver la propia; sólo admin puede editar
create policy "empresa_select" on public.empresas for select
  using (id = public.my_empresa_id());
create policy "empresa_update" on public.empresas for update
  using (id = public.my_empresa_id() and public.is_admin());

-- USUARIOS: ver solo los de su empresa; admin puede insertar/editar
create policy "usuarios_select" on public.usuarios for select
  using (empresa_id = public.my_empresa_id());
create policy "usuarios_insert" on public.usuarios for insert
  with check (empresa_id = public.my_empresa_id() and public.is_admin());
create policy "usuarios_update" on public.usuarios for update
  using (empresa_id = public.my_empresa_id() and public.is_admin());
create policy "usuarios_delete" on public.usuarios for delete
  using (empresa_id = public.my_empresa_id() and public.is_admin());

-- CUENTAS: misma empresa
create policy "cuentas_select" on public.cuentas for select
  using (empresa_id = public.my_empresa_id());
create policy "cuentas_insert" on public.cuentas for insert
  with check (empresa_id = public.my_empresa_id());
create policy "cuentas_update" on public.cuentas for update
  using (empresa_id = public.my_empresa_id());
create policy "cuentas_delete" on public.cuentas for delete
  using (empresa_id = public.my_empresa_id() and public.is_admin());

-- CATEGORIAS: globales (empresa_id null) o de la propia empresa
create policy "categorias_select" on public.categorias for select
  using (empresa_id is null or empresa_id = public.my_empresa_id());
create policy "categorias_insert" on public.categorias for insert
  with check (empresa_id = public.my_empresa_id());

-- EMISORES
create policy "emisores_select" on public.emisores for select
  using (empresa_id = public.my_empresa_id());
create policy "emisores_insert" on public.emisores for insert
  with check (empresa_id = public.my_empresa_id());

-- METAS
create policy "metas_select" on public.metas for select
  using (empresa_id = public.my_empresa_id());
create policy "metas_insert" on public.metas for insert
  with check (empresa_id = public.my_empresa_id());
create policy "metas_update" on public.metas for update
  using (empresa_id = public.my_empresa_id());
create policy "metas_delete" on public.metas for delete
  using (empresa_id = public.my_empresa_id() and public.is_admin());

-- MOVIMIENTOS: cuentas de la empresa → acceso
create policy "movimientos_select" on public.movimientos for select
  using (
    cuenta_id in (
      select id from public.cuentas where empresa_id = public.my_empresa_id()
    )
  );
create policy "movimientos_insert" on public.movimientos for insert
  with check (
    cuenta_id in (
      select id from public.cuentas where empresa_id = public.my_empresa_id()
    )
  );
create policy "movimientos_update" on public.movimientos for update
  using (usuario_id = auth.uid());
create policy "movimientos_delete" on public.movimientos for delete
  using (usuario_id = auth.uid() or public.is_admin());

-- DEUDAS: usuario propio o admin de la empresa
create policy "deudas_select" on public.deudas for select
  using (
    usuario_id = auth.uid() or
    usuario_id in (
      select id from public.usuarios where empresa_id = public.my_empresa_id()
    ) and public.is_admin()
  );
create policy "deudas_insert" on public.deudas for insert
  with check (usuario_id = auth.uid());
create policy "deudas_update" on public.deudas for update
  using (usuario_id = auth.uid() or public.is_admin());
create policy "deudas_delete" on public.deudas for delete
  using (usuario_id = auth.uid() or public.is_admin());

-- PAGOS_DEUDA: mismo acceso que deudas
create policy "pagos_select" on public.pagos_deuda for select
  using (
    deuda_id in (
      select id from public.deudas
      where usuario_id = auth.uid() or
        (usuario_id in (
          select id from public.usuarios where empresa_id = public.my_empresa_id()
        ) and public.is_admin())
    )
  );
create policy "pagos_insert" on public.pagos_deuda for insert
  with check (
    deuda_id in (select id from public.deudas where usuario_id = auth.uid())
  );
