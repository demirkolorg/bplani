"use client"

import * as React from "react"
import Link from "next/link"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { IlceTable } from "@/components/lokasyon/ilce-table"
import { IlceFormModal } from "@/components/lokasyon/ilce-form-modal"
import { useLocale } from "@/components/providers/locale-provider"

export default function IlcelerPage() {
  const [modalOpen, setModalOpen] = React.useState(false)
  const { t } = useLocale()

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{t.lokasyon.ilceler}</h1>
          <p className="text-muted-foreground">{t.lokasyon.ilcelerPageDescription}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            {t.common.quickAdd}
          </Button>
          <Button asChild>
            <Link href="/lokasyonlar/ilceler/yeni">
              <Plus className="mr-2 h-4 w-4" />
              {t.lokasyon.newIlce}
            </Link>
          </Button>
        </div>
      </div>

      <IlceTable />

      <IlceFormModal open={modalOpen} onOpenChange={setModalOpen} />
    </div>
  )
}
