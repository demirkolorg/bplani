"use client"

import * as React from "react"
import Link from "next/link"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { MahalleTable } from "@/components/lokasyon/mahalle-table"
import { MahalleFormModal } from "@/components/lokasyon/mahalle-form-modal"
import { useLocale } from "@/components/providers/locale-provider"

export default function MahallelerPage() {
  const [modalOpen, setModalOpen] = React.useState(false)
  const { t } = useLocale()

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{t.lokasyon.mahalleler}</h1>
          <p className="text-muted-foreground">{t.lokasyon.mahallelerPageDescription}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            {t.common.quickAdd}
          </Button>
          <Button asChild>
            <Link href="/lokasyonlar/mahalleler/yeni">
              <Plus className="mr-2 h-4 w-4" />
              {t.lokasyon.newMahalle}
            </Link>
          </Button>
        </div>
      </div>

      <MahalleTable />

      <MahalleFormModal open={modalOpen} onOpenChange={setModalOpen} />
    </div>
  )
}
