"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import type { Mahalle } from "@/hooks/use-lokasyon"
import type { Translations } from "@/types/locale"

export function getMahalleColumns(t: Translations): ColumnDef<Mahalle>[] {
  return [
    {
      accessorKey: "ad",
      header: t.lokasyon.mahalleAdi,
      cell: ({ row }) => {
        return <span className="font-medium">{row.getValue("ad")}</span>
      },
    },
    {
      id: "ilce",
      header: t.lokasyon.ilce,
      cell: ({ row }) => {
        return <span className="text-sm">{row.original.ilce.ad}</span>
      },
    },
    {
      id: "il",
      header: t.lokasyon.il,
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
      header: t.lokasyon.adresSayisi,
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
