import Link from "next/link"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { MusteriTable } from "@/components/musteriler/musteri-table"

export default function MusterilerPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Müşteriler</h1>
          <p className="text-muted-foreground">Tüm müşterileri görüntüleyin ve yönetin</p>
        </div>
        <Button asChild>
          <Link href="/musteriler/yeni">
            <Plus className="mr-2 h-4 w-4" />
            Yeni Müşteri
          </Link>
        </Button>
      </div>

      <MusteriTable />
    </div>
  )
}
