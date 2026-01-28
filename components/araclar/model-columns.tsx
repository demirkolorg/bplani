"use client"

import type { Model } from "@/hooks/use-araclar"
import type { Translations } from "@/types/locale"
import type { DataTableColumnDef } from "@/lib/data-table/types"

export function getModelColumns(t: Translations): DataTableColumnDef<Model>[] {
  return [
    {
      accessorKey: "ad",
      header: t.araclar.modelAdi,
      cell: ({ row }) => {
        return <span className="font-medium">{row.getValue("ad")}</span>
      },
      meta: {
        filterConfig: {
          columnId: "ad",
          type: "text",
          operators: ["contains", "startsWith", "equals"],
          placeholder: t.araclar.modelAdi,
          label: t.araclar.modelAdi,
        },
      },
    },
    {
      id: "marka",
      header: t.araclar.marka,
      cell: ({ row }) => {
        return <span className="text-sm">{row.original.marka.ad}</span>
      },
      accessorFn: (row) => row.marka?.ad || "",
      filterFn: (row, columnId, filterValue) => {
        const marka = row.original.marka
        if (!marka) return false
        const searchStr = String(filterValue).toLowerCase()
        const markaAd = marka.ad?.toLowerCase() || ""
        return markaAd.includes(searchStr)
      },
      meta: {
        filterConfig: {
          columnId: "marka",
          type: "nested",
          operators: ["contains"],
          placeholder: t.araclar.marka,
          label: t.araclar.marka,
          customFilterFn: (row, filterValue, operator) => {
            const marka = row.marka
            if (!marka) return false

            const searchStr = String(filterValue).toLowerCase()
            const markaAd = marka.ad?.toLowerCase() || ""

            return markaAd.includes(searchStr)
          },
        },
      },
    },
  ]
}
