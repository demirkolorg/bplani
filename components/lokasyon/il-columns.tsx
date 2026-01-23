"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import type { Il } from "@/hooks/use-lokasyon"

export function getIlColumns(): ColumnDef<Il>[] {
  return [
    {
      accessorKey: "plaka",
      header: "Plaka",
      cell: ({ row }) => {
        const plaka = row.getValue("plaka") as number | null
        return plaka ? (
          <span className="font-mono font-medium">{plaka.toString().padStart(2, "0")}</span>
        ) : (
          <span className="text-muted-foreground">-</span>
        )
      },
    },
    {
      accessorKey: "ad",
      header: "İl Adı",
      cell: ({ row }) => {
        return <span className="font-medium">{row.getValue("ad")}</span>
      },
    },
    {
      id: "ilceSayisi",
      header: "İlçe Sayısı",
      cell: ({ row }) => {
        const count = row.original._count.ilceler
        return (
          <Badge variant="secondary">
            {count}
          </Badge>
        )
      },
    },
  ]
}
