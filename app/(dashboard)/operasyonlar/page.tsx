import Link from "next/link"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { OperasyonTable } from "@/components/operasyonlar/operasyon-table"

export default function OperasyonlarPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Operasyonlar</h1>
          <p className="text-muted-foreground">Tüm operasyonları görüntüleyin ve yönetin</p>
        </div>
        <Button asChild>
          <Link href="/operasyonlar/yeni">
            <Plus className="mr-2 h-4 w-4" />
            Yeni Operasyon
          </Link>
        </Button>
      </div>

      <OperasyonTable />
    </div>
  )
}
