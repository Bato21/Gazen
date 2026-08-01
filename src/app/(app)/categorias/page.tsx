import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Categoria, Usuario } from '@/types/database.types'
import { CategoriasView } from './categorias-view'

export default async function CategoriasPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: usuario } = await supabase
    .from('usuarios').select('empresa_id').eq('id', user.id).single() as unknown as
    { data: Pick<Usuario, 'empresa_id'> | null }
  if (!usuario) redirect('/login')

  const { data: categoriasRaw } = await supabase
    .from('categorias')
    .select('*')
    .order('nombre', { ascending: true }) as unknown as { data: Categoria[] | null }

  const categorias = categoriasRaw ?? []
  const globales = categorias.filter((c) => c.empresa_id === null)
  const propias = categorias.filter((c) => c.empresa_id === usuario.empresa_id)

  return <CategoriasView globales={globales} propias={propias} />
}
