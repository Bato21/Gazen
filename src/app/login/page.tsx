'use client'

import { useActionState } from 'react'
import { login } from './actions'

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(login, null)

  return (
    <div className="min-h-screen flex items-center justify-center gazen-bg">
      <div className="relative z-10 w-full max-w-sm px-4">

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white tracking-tight">Gazen Libreta</h1>
          <p className="text-muted-foreground mt-2 text-sm">Control financiero para PYMES</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 shadow-2xl">
          <h2 className="text-lg font-semibold mb-6">Iniciar sesión</h2>

          <form action={formAction} className="space-y-4">
            <div className="space-y-1">
              <label htmlFor="email" className="text-sm text-muted-foreground">
                Correo electrónico
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="nombre@empresa.com"
                className="w-full px-3 py-2 bg-input border border-border rounded-lg text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="password" className="text-sm text-muted-foreground">
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                className="w-full px-3 py-2 bg-input border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
              />
            </div>

            {state?.error && (
              <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
                {state.error}
              </p>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="w-full py-2.5 px-4 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isPending ? 'Iniciando sesión…' : 'Iniciar sesión'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          ¿Problemas para acceder? Contacta a tu administrador.
        </p>
      </div>
    </div>
  )
}
