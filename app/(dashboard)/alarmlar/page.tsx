"use client"

import { useLocale } from "@/components/providers/locale-provider"
import { AlarmTable } from "@/components/alarmlar/alarm-table"

export default function AlarmlarPage() {
  const { t } = useLocale()

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{t.alarmlar.pageTitle}</h1>
          <p className="text-muted-foreground">{t.alarmlar.pageDescription}</p>
        </div>
      </div>

      <AlarmTable />
    </div>
  )
}
