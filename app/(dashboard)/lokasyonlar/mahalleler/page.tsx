"use client"

import * as React from "react"
import Link from "next/link"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { MahalleTable } from "@/components/lokasyon/mahalle-table"
import { MahalleFormModal } from "@/components/lokasyon/mahalle-form-modal"

export default function MahallelerPage() {
  const [modalOpen, setModalOpen] = React.useState(false)

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Mahalleler</h1>
          <p className="text-muted-foreground">Tüm mahalleleri görüntüleyin ve yönetin</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Hızlı Ekle
          </Button>
          <Button asChild>
            <Link href="/lokasyonlar/mahalleler/yeni">
              <Plus className="mr-2 h-4 w-4" />
              Yeni Mahalle
            </Link>
          </Button>
        </div>
      </div>

      <MahalleTable />

      <MahalleFormModal open={modalOpen} onOpenChange={setModalOpen} />
    </div>
  )
}
