-- Migración incremental: policies de UPDATE/DELETE para emisores y categorías
-- Aplicar en el proyecto Supabase existente si ya tiene el schema base.

create policy "categorias_update" on public.categorias for update
  using (empresa_id = public.my_empresa_id());
create policy "categorias_delete" on public.categorias for delete
  using (empresa_id = public.my_empresa_id() and public.is_admin());

create policy "emisores_update" on public.emisores for update
  using (empresa_id = public.my_empresa_id());
create policy "emisores_delete" on public.emisores for delete
  using (empresa_id = public.my_empresa_id() and public.is_admin());
