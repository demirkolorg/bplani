"use client"

import Link from "next/link"
import { Plus } from "lucide-react"

import { useLocale } from "@/components/providers/locale-provider"
import { Button } from "@/components/ui/button"
import { OperasyonTable } from "@/components/operasyonlar/operasyon-table"

export default function OperasyonlarPage() {
  const { t } = useLocale()

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{t.operasyonlar.pageTitle}</h1>
          <p className="text-muted-foreground">{t.operasyonlar.pageDescription}</p>
        </div>
        <Button asChild>
          <Link href="/operasyonlar/yeni">
            <Plus className="mr-2 h-4 w-4" />
            {t.operasyonlar.newOperasyonButton}
          </Link>
        </Button>
      </div>

      <OperasyonTable />
    </div>
  )
}
