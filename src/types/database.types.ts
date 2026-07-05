export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      empresas: {
        Row: {
          id: string;
          nombre: string;
          direccion: string | null;
          membresia: "Gratis" | "Pro" | "Premium" | "Ultimate";
          moneda: "MXN" | "USD" | "EUR";
          color_principal: string;
          color_secundario: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["empresas"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["empresas"]["Insert"]>;
      };
      usuarios: {
        Row: {
          id: string;
          empresa_id: string;
          nombre: string;
          cargo: "Administrador" | "Contador" | "Usuario" | "Gerente";
          es_admin: boolean;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["usuarios"]["Row"], "created_at">;
        Update: Partial<Database["public"]["Tables"]["usuarios"]["Insert"]>;
      };
      cuentas: {
        Row: {
          id: string;
          empresa_id: string;
          tipo_cuenta: "Ahorro" | "Corriente" | "Inversión" | "Crédito" | "Efectivo";
          nombre: string;
          saldo_inicial: number;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["cuentas"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["cuentas"]["Insert"]>;
      };
      movimientos: {
        Row: {
          id: string;
          cuenta_id: string;
          usuario_id: string;
          categoria_id: string | null;
          tipo: "Ingreso" | "Gasto";
          emisor_id: string | null;
          meta_id: string | null;
          monto: number;
          fecha: string;
          descripcion: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["movimientos"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["movimientos"]["Insert"]>;
      };
      metas: {
        Row: {
          id: string;
          empresa_id: string;
          tipo: "Ahorro" | "Deuda";
          nombre: string;
          monto_objetivo: number;
          monto_actual: number;
          interes_anual: number | null;
          fecha_inicio: string;
          fecha_limite: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["metas"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["metas"]["Insert"]>;
      };
      deudas: {
        Row: {
          id: string;
          usuario_id: string;
          cuenta_id: string | null;
          acreedor: string;
          descripcion: string | null;
          monto_total: number;
          monto_pagado: number;
          fecha_vencimiento: string;
          prioridad: "alta" | "media" | "baja";
          estado: "activa" | "pagada" | "cancelada";
          tasa_interes: number;
          numero_cuotas: number | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["deudas"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["deudas"]["Insert"]>;
      };
      pagos_deuda: {
        Row: {
          id: string;
          deuda_id: string;
          monto: number;
          fecha_pago: string;
          nota: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["pagos_deuda"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["pagos_deuda"]["Insert"]>;
      };
      categorias: {
        Row: {
          id: string;
          nombre: string;
          icono: string | null;
          empresa_id: string | null;
        };
        Insert: Omit<Database["public"]["Tables"]["categorias"]["Row"], "id">;
        Update: Partial<Database["public"]["Tables"]["categorias"]["Insert"]>;
      };
      emisores: {
        Row: {
          id: string;
          empresa_id: string;
          nombre: string;
          direccion: string | null;
        };
        Insert: Omit<Database["public"]["Tables"]["emisores"]["Row"], "id">;
        Update: Partial<Database["public"]["Tables"]["emisores"]["Insert"]>;
      };
    };
  };
}

export type Empresa = Database["public"]["Tables"]["empresas"]["Row"];
export type Usuario = Database["public"]["Tables"]["usuarios"]["Row"];
export type Cuenta = Database["public"]["Tables"]["cuentas"]["Row"];
export type Movimiento = Database["public"]["Tables"]["movimientos"]["Row"];
export type Meta = Database["public"]["Tables"]["metas"]["Row"];
export type Deuda = Database["public"]["Tables"]["deudas"]["Row"];
export type PagoDeuda = Database["public"]["Tables"]["pagos_deuda"]["Row"];
export type Categoria = Database["public"]["Tables"]["categorias"]["Row"];
export type Emisor = Database["public"]["Tables"]["emisores"]["Row"];
