'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import type { ValueType, NameType } from 'recharts/types/component/DefaultTooltipContent'

interface BalanceChartProps {
  data: {
    mes: string
    ingresos: number
    gastos: number
  }[]
}

function tooltipFormatter(
  value: ValueType | undefined,
  _name: NameType | undefined
): [string, NameType | undefined] {
  if (typeof value !== 'number') return [String(value ?? ''), _name]
  return [
    new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value),
    _name,
  ]
}

export function BalanceChart({ data }: BalanceChartProps) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip formatter={tooltipFormatter} />
        <Legend />
        <Bar dataKey="ingresos" name="Ingresos" fill="#27AE60" radius={[4, 4, 0, 0]} />
        <Bar dataKey="gastos" name="Gastos" fill="#C0392B" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
