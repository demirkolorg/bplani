import Link from "next/link"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { TanitimTable } from "@/components/tanitimlar/tanitim-table"

export default function TanitimlarPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Tanıtımlar</h1>
          <p className="text-muted-foreground">Tüm tanıtımları görüntüleyin ve yönetin</p>
        </div>
        <Button asChild>
          <Link href="/tanitimlar/yeni">
            <Plus className="mr-2 h-4 w-4" />
            Yeni Tanıtım
          </Link>
        </Button>
      </div>

      <TanitimTable />
    </div>
  )
}
