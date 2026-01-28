"use client"

import { Badge } from "@/components/ui/badge"
import type { Il } from "@/hooks/use-lokasyon"
import type { Translations } from "@/types/locale"
import type { DataTableColumnDef } from "@/lib/data-table/types"

export function getIlColumns(t: Translations): DataTableColumnDef<Il>[] {
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
      meta: {
        filterConfig: {
          columnId: "plaka",
          type: "number",
          operators: ["equals", "greaterThan", "lessThan"],
          placeholder: "34...",
          label: t.lokasyon.plaka,
        },
      },
    },
    {
      accessorKey: "ad",
      header: t.lokasyon.ilAdi,
      cell: ({ row }) => {
        return <span className="font-medium">{row.getValue("ad")}</span>
      },
      meta: {
        filterConfig: {
          columnId: "ad",
          type: "text",
          operators: ["contains", "startsWith", "equals"],
          placeholder: t.lokasyon.ilAdi,
          label: t.lokasyon.ilAdi,
        },
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
      accessorFn: (row) => row._count?.ilceler || 0,
      filterFn: (row, columnId, filterValue) => {
        const count = row.original._count?.ilceler || 0
        const target = Number(filterValue)
        return count === target
      },
      meta: {
        filterConfig: {
          columnId: "ilceSayisi",
          type: "number",
          operators: ["equals", "greaterThan", "lessThan"],
          label: t.lokasyon.ilceSayisi,
          customFilterFn: (row, filterValue, operator) => {
            const count = row._count?.ilceler || 0
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
