export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

// ── Row types ────────────────────────────────────────────────────────────────

export interface Empresa {
  id: string
  nombre: string
  direccion: string | null
  membresia: 'Gratis' | 'Pro' | 'Premium' | 'Ultimate'
  moneda: 'MXN' | 'USD' | 'EUR'
  color_principal: string
  color_secundario: string
  created_at: string
}

export interface Usuario {
  id: string
  empresa_id: string
  nombre: string
  cargo: 'Administrador' | 'Contador' | 'Usuario' | 'Gerente'
  es_admin: boolean
  created_at: string
}

export interface Cuenta {
  id: string
  empresa_id: string
  tipo_cuenta: 'Ahorro' | 'Corriente' | 'Inversión' | 'Crédito' | 'Efectivo'
  nombre: string
  saldo_inicial: number
  created_at: string
}

export interface Categoria {
  id: string
  empresa_id: string | null
  nombre: string
  icono: string | null
}

export interface Emisor {
  id: string
  empresa_id: string
  nombre: string
  direccion: string | null
}

export interface Meta {
  id: string
  empresa_id: string
  tipo: 'Ahorro' | 'Deuda'
  nombre: string
  monto_objetivo: number
  monto_actual: number
  interes_anual: number | null
  fecha_inicio: string
  fecha_limite: string | null
  created_at: string
}

export interface Movimiento {
  id: string
  cuenta_id: string
  usuario_id: string
  categoria_id: string | null
  tipo: 'Ingreso' | 'Gasto'
  emisor_id: string | null
  meta_id: string | null
  monto: number
  fecha: string
  descripcion: string | null
  created_at: string
}

export interface Deuda {
  id: string
  usuario_id: string
  cuenta_id: string | null
  acreedor: string
  descripcion: string | null
  monto_total: number
  monto_pagado: number
  fecha_vencimiento: string
  prioridad: 'alta' | 'media' | 'baja'
  estado: 'activa' | 'pagada' | 'cancelada'
  tasa_interes: number
  numero_cuotas: number | null
  created_at: string
}

export interface PagoDeuda {
  id: string
  deuda_id: string
  monto: number
  fecha_pago: string
  nota: string | null
  created_at: string
}

// ── Database schema ───────────────────────────────────────────────────────────

export type Database = {
  public: {
    Tables: {
      empresas: {
        Row: Empresa
        Insert: Omit<Empresa, 'id' | 'created_at'>
        Update: Partial<Omit<Empresa, 'id' | 'created_at'>>
      }
      usuarios: {
        Row: Usuario
        Insert: Omit<Usuario, 'created_at'>
        Update: Partial<Omit<Usuario, 'id' | 'created_at'>>
      }
      cuentas: {
        Row: Cuenta
        Insert: Omit<Cuenta, 'id' | 'created_at'>
        Update: Partial<Omit<Cuenta, 'id' | 'created_at'>>
      }
      categorias: {
        Row: Categoria
        Insert: Omit<Categoria, 'id'>
        Update: Partial<Omit<Categoria, 'id'>>
      }
      emisores: {
        Row: Emisor
        Insert: Omit<Emisor, 'id'>
        Update: Partial<Omit<Emisor, 'id'>>
      }
      metas: {
        Row: Meta
        Insert: Omit<Meta, 'id' | 'created_at'>
        Update: Partial<Omit<Meta, 'id' | 'created_at'>>
      }
      movimientos: {
        Row: Movimiento
        Insert: Omit<Movimiento, 'id' | 'created_at'>
        Update: Partial<Omit<Movimiento, 'id' | 'created_at'>>
      }
      deudas: {
        Row: Deuda
        Insert: Omit<Deuda, 'id' | 'created_at'>
        Update: Partial<Omit<Deuda, 'id' | 'created_at'>>
      }
      pagos_deuda: {
        Row: PagoDeuda
        Insert: Omit<PagoDeuda, 'id' | 'created_at'>
        Update: Partial<Omit<PagoDeuda, 'id' | 'created_at'>>
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      my_empresa_id: {
        Args: Record<string, never>
        Returns: string
      }
      is_admin: {
        Args: Record<string, never>
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
