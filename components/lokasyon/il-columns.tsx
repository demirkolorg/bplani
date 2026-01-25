"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import type { Il } from "@/hooks/use-lokasyon"
import type { Translations } from "@/types/locale"

export function getIlColumns(t: Translations): ColumnDef<Il>[] {
  return [
    {
      accessorKey: "plaka",
      header: t.lokasyon.plaka,
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
      header: t.lokasyon.ilAdi,
      cell: ({ row }) => {
        return <span className="font-medium">{row.getValue("ad")}</span>
      },
    },
    {
      id: "ilceSayisi",
      header: t.lokasyon.ilceSayisi,
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
