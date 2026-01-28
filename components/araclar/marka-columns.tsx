"use client"

import { Badge } from "@/components/ui/badge"
import type { Marka } from "@/hooks/use-araclar"
import type { Translations } from "@/types/locale"
import type { DataTableColumnDef } from "@/lib/data-table/types"

export function getMarkaColumns(t: Translations): DataTableColumnDef<Marka>[] {
  return [
    {
      accessorKey: "ad",
      header: t.araclar.markaAdi,
      cell: ({ row }) => {
        return <span className="font-medium">{row.getValue("ad")}</span>
      },
      meta: {
        filterConfig: {
          columnId: "ad",
          type: "text",
          operators: ["contains", "startsWith", "equals"],
          placeholder: t.araclar.markaAdi,
          label: t.araclar.markaAdi,
        },
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
      accessorFn: (row) => row._count?.modeller || 0,
      filterFn: (row, columnId, filterValue) => {
        const count = row.original._count?.modeller || 0
        const target = Number(filterValue)
        return count === target
      },
      meta: {
        filterConfig: {
          columnId: "modelSayisi",
          type: "number",
          operators: ["equals", "greaterThan", "lessThan"],
          label: t.araclar.modelSayisi,
          customFilterFn: (row, filterValue, operator) => {
            const count = row._count?.modeller || 0
            const target = Number(filterValue)

            switch (operator) {
              case "equals":
                return count === target
              case "greaterThan":
                return count > target
              case "lessThan":
                return count < target
              default:
                return false
            }
          },
        },
      },
    },
  ]
}
