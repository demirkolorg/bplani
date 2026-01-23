"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import type { Marka } from "@/hooks/use-araclar"

export function getMarkaColumns(): ColumnDef<Marka>[] {
  return [
    {
      accessorKey: "ad",
      header: "Marka Adı",
      cell: ({ row }) => {
        return <span className="font-medium">{row.getValue("ad")}</span>
      },
    },
    {
      id: "modelSayisi",
      header: "Model Sayısı",
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
