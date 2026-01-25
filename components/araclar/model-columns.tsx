"use client"

import { ColumnDef } from "@tanstack/react-table"
import type { Model } from "@/hooks/use-araclar"
import type { Translations } from "@/types/locale"

export function getModelColumns(t: Translations): ColumnDef<Model>[] {
  return [
    {
      accessorKey: "ad",
      header: t.araclar.modelAdi,
      cell: ({ row }) => {
        return <span className="font-medium">{row.getValue("ad")}</span>
      },
    },
    {
      id: "marka",
      header: t.araclar.marka,
      cell: ({ row }) => {
        return <span className="text-sm">{row.original.marka.ad}</span>
      },
    },
  ]
}
