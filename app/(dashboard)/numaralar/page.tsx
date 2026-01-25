"use client"

import { useLocale } from "@/components/providers/locale-provider"
import { NumaraTable } from "@/components/numaralar/numara-table"

export default function NumaralarPage() {
  const { t } = useLocale()

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{t.numaralar.pageTitle}</h1>
          <p className="text-muted-foreground">{t.numaralar.pageDescription}</p>
        </div>
      </div>

      <NumaraTable />
    </div>
  )
}
