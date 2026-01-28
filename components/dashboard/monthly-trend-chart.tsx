"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { useLocale } from "@/components/providers/locale-provider"
import { TrendingUp } from "lucide-react"

interface MonthlyTrendData {
  month: string
  tanitimCount: number
  operasyonCount: number
}

interface MonthlyTrendChartProps {
  data: MonthlyTrendData[]
}

export function MonthlyTrendChart({ data }: MonthlyTrendChartProps) {
  const { t } = useLocale()

  // Format month for display (YYYY-MM -> Ay YYYY)
  const formattedData = data.map(item => ({
    ...item,
    monthLabel: new Date(item.month + '-01').toLocaleDateString('tr-TR', {
      month: 'short',
      year: 'numeric'
    })
  }))

  return (
    <div className="space-y-4">
      {/* Header with icon */}
      <div className="flex items-center gap-2">
        <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/30">
          <TrendingUp className="h-5 w-5 text-blue-500" />
        </div>
        <div>
          <h3 className="text-xl font-bold">{t.dashboard.monthlyTrend || "Aylık Aktivite Trendi"}</h3>
          <p className="text-xs text-muted-foreground">{t.dashboard.monthlyTrendDesc || "Son 6 aydaki tanıtım ve operasyon sayıları"}</p>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-card rounded-xl border p-4">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={formattedData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis
              dataKey="monthLabel"
              stroke="hsl(var(--muted-foreground))"
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
            />
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
            />
            <Line
              type="monotone"
              dataKey="tanitimCount"
              stroke="#3b82f6"
              strokeWidth={3}
              name={t.dashboard.tanitimlar || "Tanıtımlar"}
              dot={{ fill: '#3b82f6', r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="operasyonCount"
              stroke="#10b981"
              strokeWidth={3}
              name={t.dashboard.operasyonlar || "Operasyonlar"}
              dot={{ fill: '#10b981', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
