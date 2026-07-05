import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Usuario } from '@/types/database.types'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: usuario } = await supabase
    .from('usuarios')
    .select('*')
    .eq('id', user.id)
    .single() as unknown as { data: Usuario | null }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">Bienvenido, {usuario?.nombre ?? user.email}</h1>
        <p className="text-muted-foreground text-sm">{usuario?.cargo ?? 'Usuario'} — Dashboard en construcción</p>
      </div>
    </div>
  )
}
