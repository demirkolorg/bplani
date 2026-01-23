"use client"

import * as React from "react"
import Link from "next/link"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ModelTable } from "@/components/araclar/model-table"
import { ModelFormModal } from "@/components/araclar/model-form-modal"

export default function ModellerPage() {
  const [modalOpen, setModalOpen] = React.useState(false)

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Modeller</h1>
          <p className="text-muted-foreground">Tüm modelleri görüntüleyin ve yönetin</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Hızlı Ekle
          </Button>
          <Button asChild>
            <Link href="/marka-model/modeller/yeni">
              <Plus className="mr-2 h-4 w-4" />
              Yeni Model
            </Link>
          </Button>
        </div>
      </div>

      <ModelTable />

      <ModelFormModal open={modalOpen} onOpenChange={setModalOpen} />
    </div>
  )
}
