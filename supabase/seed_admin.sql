-- ============================================================
-- SEED: Primer admin + empresa
-- ============================================================
-- PASO 1: Crea el usuario en Supabase Auth desde el dashboard:
--   Authentication → Users → Add user
--   Anota el UUID que genera Supabase.
--
-- PASO 2: Ejecuta este script en el SQL Editor de Supabase,
--   reemplazando los valores marcados con <>.
-- ============================================================

do $$
declare
  v_auth_uid   uuid := '<UUID_DEL_USUARIO_EN_AUTH>'; -- reemplazar
  v_empresa_id uuid;
begin

  -- 1. Crear la empresa
  insert into public.empresas (nombre, direccion, membresia, moneda, color_principal, color_secundario)
  values (
    'Mi Empresa',       -- nombre de la empresa
    null,               -- dirección (opcional)
    'Gratis',           -- membresía inicial
    'MXN',              -- moneda
    '#3B82F6',          -- color principal
    '#1E40AF'           -- color secundario
  )
  returning id into v_empresa_id;

  -- 2. Crear el registro de usuario vinculado al auth user
  insert into public.usuarios (id, empresa_id, nombre, cargo, es_admin)
  values (
    v_auth_uid,
    v_empresa_id,
    'Admin',            -- nombre visible
    'Administrador',
    true
  );

  raise notice 'Empresa creada: %', v_empresa_id;
  raise notice 'Usuario admin vinculado: %', v_auth_uid;
end $$;
