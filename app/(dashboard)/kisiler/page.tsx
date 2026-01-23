import Link from "next/link"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { KisiTable } from "@/components/kisiler/musteri-table"

export default function KisilerPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Kişiler</h1>
          <p className="text-muted-foreground">Tüm kişileri görüntüleyin ve yönetin</p>
        </div>
        <Button asChild>
          <Link href="/kisiler/yeni">
            <Plus className="mr-2 h-4 w-4" />
            Yeni Kişi
          </Link>
        </Button>
      </div>

      <KisiTable />
    </div>
  )
}
