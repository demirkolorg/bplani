"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import type { Mahalle } from "@/hooks/use-lokasyon"

export function getMahalleColumns(): ColumnDef<Mahalle>[] {
  return [
    {
      accessorKey: "ad",
      header: "Mahalle Adı",
      cell: ({ row }) => {
        return <span className="font-medium">{row.getValue("ad")}</span>
      },
    },
    {
      id: "ilce",
      header: "İlçe",
      cell: ({ row }) => {
        return <span className="text-sm">{row.original.ilce.ad}</span>
      },
    },
    {
      id: "il",
      header: "İl",
      cell: ({ row }) => {
        const il = row.original.ilce.il
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
      id: "adresSayisi",
      header: "Adres Sayısı",
      cell: ({ row }) => {
        const count = row.original._count.adresler
        return (
          <Badge variant="secondary">
            {count}
          </Badge>
        )
      },
    },
  ]
}
