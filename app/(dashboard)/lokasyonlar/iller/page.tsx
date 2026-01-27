"use client"

import * as React from "react"
import Link from "next/link"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { IlTable } from "@/components/lokasyon/il-table"
import { IlFormModal } from "@/components/lokasyon/il-form-modal"
import { useLocale } from "@/components/providers/locale-provider"

export default function IllerPage() {
  const [modalOpen, setModalOpen] = React.useState(false)
  const { t } = useLocale()

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{t.lokasyon.iller}</h1>
          <p className="text-muted-foreground">{t.lokasyon.illerPageDescription}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            {t.common.quickAdd}
          </Button>
          <Button asChild>
            <Link href="/lokasyonlar/iller/yeni">
              <Plus className="mr-2 h-4 w-4" />
              {t.lokasyon.newIl}
            </Link>
          </Button>
        </div>
      </div>

      <IlTable />

      <IlFormModal open={modalOpen} onOpenChange={setModalOpen} />
    </div>
  )
}
