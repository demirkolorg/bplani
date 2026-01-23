"use client"

import * as React from "react"
import Link from "next/link"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { MarkaTable } from "@/components/araclar/marka-table"
import { MarkaFormModal } from "@/components/araclar/marka-form-modal"

export default function MarkalarPage() {
  const [modalOpen, setModalOpen] = React.useState(false)

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Markalar</h1>
          <p className="text-muted-foreground">Tüm markaları görüntüleyin ve yönetin</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Hızlı Ekle
          </Button>
          <Button asChild>
            <Link href="/marka-model/markalar/yeni">
              <Plus className="mr-2 h-4 w-4" />
              Yeni Marka
            </Link>
          </Button>
        </div>
      </div>

      <MarkaTable />

      <MarkaFormModal open={modalOpen} onOpenChange={setModalOpen} />
    </div>
  )
}
