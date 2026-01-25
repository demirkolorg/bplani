"use client"

import { useLocale } from "@/components/providers/locale-provider"
import { AracTable } from "@/components/araclar/vehicles"

export default function AraclarPage() {
  const { t } = useLocale()

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{t.araclar.pageTitle}</h1>
          <p className="text-muted-foreground">{t.araclar.pageDescription}</p>
        </div>
      </div>

      <AracTable />
    </div>
  )
}
