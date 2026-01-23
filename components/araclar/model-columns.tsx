"use client"

import { ColumnDef } from "@tanstack/react-table"
import type { Model } from "@/hooks/use-araclar"

export function getModelColumns(): ColumnDef<Model>[] {
  return [
    {
      accessorKey: "ad",
      header: "Model Adı",
      cell: ({ row }) => {
        return <span className="font-medium">{row.getValue("ad")}</span>
      },
    },
    {
      id: "marka",
      header: "Marka",
      cell: ({ row }) => {
        return <span className="text-sm">{row.original.marka.ad}</span>
      },
    },
  ]
}
