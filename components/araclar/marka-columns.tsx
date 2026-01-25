"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import type { Marka } from "@/hooks/use-araclar"
import type { Translations } from "@/types/locale"

export function getMarkaColumns(t: Translations): ColumnDef<Marka>[] {
  return [
    {
      accessorKey: "ad",
      header: t.araclar.markaAdi,
      cell: ({ row }) => {
        return <span className="font-medium">{row.getValue("ad")}</span>
      },
    },
    {
      id: "modelSayisi",
      header: t.araclar.modelSayisi,
      cell: ({ row }) => {
        const count = row.original._count.modeller
        return (
          <Badge variant="secondary">
            {count}
          </Badge>
        )
      },
    },
  ]
}
