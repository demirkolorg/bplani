"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import type { Ilce } from "@/hooks/use-lokasyon"

export function getIlceColumns(): ColumnDef<Ilce>[] {
  return [
    {
      accessorKey: "ad",
      header: "İlçe Adı",
      cell: ({ row }) => {
        return <span className="font-medium">{row.getValue("ad")}</span>
      },
    },
    {
      id: "il",
      header: "İl",
      cell: ({ row }) => {
        const il = row.original.il
        return (
          <span className="text-sm">
            {il.plaka ? (
              <>
                <span className="font-mono">{il.plaka.toString().padStart(2, "0")}</span>
                {" - "}
              </>
            ) : null}
            {il.ad}
          </span>
        )
      },
    },
    {
      id: "mahalleSayisi",
      header: "Mahalle Sayısı",
      cell: ({ row }) => {
        const count = row.original._count.mahalleler
        return (
          <Badge variant="secondary">
            {count}
          </Badge>
        )
      },
    },
  ]
}
