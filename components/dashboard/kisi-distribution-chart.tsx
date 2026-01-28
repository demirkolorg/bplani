"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import { useLocale } from "@/components/providers/locale-provider"
import { Users } from "lucide-react"

interface KisiDistributionData {
  name: string
  value: number
}

interface KisiDistributionChartProps {
  data: KisiDistributionData[]
}

const COLORS = {
  musteri: '#f59e0b', // amber-500
  aday: '#8b5cf6'     // violet-500
}

export function KisiDistributionChart({ data }: KisiDistributionChartProps) {
  const { t } = useLocale()

  const chartData = data.map(item => ({
    ...item,
    color: item.name === 'Müşteri' ? COLORS.musteri : COLORS.aday
  }))

  const total = data.reduce((sum, item) => sum + item.value, 0)

  return (
    <div className="space-y-4">
      {/* Header with icon */}
      <div className="flex items-center gap-2">
        <div className="p-2 rounded-lg bg-violet-50 dark:bg-violet-950/30">
          <Users className="h-5 w-5 text-violet-500" />
        </div>
        <div>
          <h3 className="text-xl font-bold">{t.dashboard.kisiDistribution || "Kişi Dağılımı"}</h3>
          <p className="text-xs text-muted-foreground">{t.dashboard.kisiDistributionDesc || "Müşteri ve aday kişi sayıları"}</p>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-card rounded-xl border p-4">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, value }) => {
                const percentage = total > 0 ? ((value / total) * 100).toFixed(0) : 0
                return `${name}: ${value} (${percentage}%)`
              }}
              outerRadius={90}
              fill="#8884d8"
              dataKey="value"
              strokeWidth={2}
              stroke="hsl(var(--background))"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--popover))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                color: 'hsl(var(--popover-foreground))'
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: '14px' }}
              iconType="circle"
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
