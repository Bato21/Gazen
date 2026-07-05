'use client'

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import type { ValueType, NameType } from 'recharts/types/component/DefaultTooltipContent'

interface PieChartProps {
  data: {
    nombre: string
    total: number
  }[]
}

const COLORS = ['#C0392B', '#E74C3C', '#F39C12', '#F1C40F', '#27AE60', '#2ECC71', '#3498DB', '#9B59B6']

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

interface PieLabelProps {
  nombre?: string
  percent?: number
  cx?: number
  cy?: number
  midAngle?: number
  innerRadius?: number
  outerRadius?: number
}

function renderLabel(props: PieLabelProps): string {
  const { nombre = '', percent = 0 } = props
  return `${nombre} ${(percent * 100).toFixed(0)}%`
}

export function GastosPieChart({ data }: PieChartProps) {
  if (!data.length) {
    return (
      <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
        Sin datos de gastos
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={data}
          dataKey="total"
          nameKey="nombre"
          cx="50%"
          cy="50%"
          outerRadius={80}
          label={renderLabel}
          labelLine={false}
        >
          {data.map((_, index) => (
            <Cell key={index} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={tooltipFormatter} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}
