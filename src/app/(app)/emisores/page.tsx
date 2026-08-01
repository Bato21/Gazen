import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Emisor, Usuario } from '@/types/database.types'
import { EmisoresView } from './emisores-view'

export default async function EmisoresPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: usuario } = await supabase
    .from('usuarios').select('empresa_id').eq('id', user.id).single() as unknown as
    { data: Pick<Usuario, 'empresa_id'> | null }
  if (!usuario) redirect('/login')

  const { data: emisoresRaw } = await supabase
    .from('emisores')
    .select('*')
    .eq('empresa_id', usuario.empresa_id)
    .order('nombre', { ascending: true }) as unknown as { data: Emisor[] | null }

  const emisores = emisoresRaw ?? []

  return <EmisoresView emisores={emisores} />
}
