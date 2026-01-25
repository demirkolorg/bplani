"use client"

import Link from "next/link"
import { Plus } from "lucide-react"

import { useLocale } from "@/components/providers/locale-provider"
import { Button } from "@/components/ui/button"
import { KisiTable } from "@/components/kisiler/musteri-table"

export default function KisilerPage() {
  const { t } = useLocale()

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{t.kisiler.pageTitle}</h1>
          <p className="text-muted-foreground">{t.kisiler.pageDescription}</p>
        </div>
        <Button asChild>
          <Link href="/kisiler/yeni">
            <Plus className="mr-2 h-4 w-4" />
            {t.kisiler.newKisiButton}
          </Link>
        </Button>
      </div>

      <KisiTable />
    </div>
  )
}
