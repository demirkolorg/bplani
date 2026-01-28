"use client"

import { Badge } from "@/components/ui/badge"
import type { Ilce } from "@/hooks/use-lokasyon"
import type { Translations } from "@/types/locale"
import type { DataTableColumnDef } from "@/lib/data-table/types"

export function getIlceColumns(t: Translations): DataTableColumnDef<Ilce>[] {
  return [
    {
      accessorKey: "ad",
      header: t.lokasyon.ilceAdi,
      cell: ({ row }) => {
        return <span className="font-medium">{row.getValue("ad")}</span>
      },
      meta: {
        filterConfig: {
          columnId: "ad",
          type: "text",
          operators: ["contains", "startsWith", "equals"],
          placeholder: t.lokasyon.ilceAdi,
          label: t.lokasyon.ilceAdi,
        },
      },
    },
    {
      id: "il",
      header: t.lokasyon.il,
      cell: ({ row }) => {
        const il = row.original.il
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
      accessorFn: (row) => row.il?.ad || "",
      filterFn: (row, columnId, filterValue) => {
        const il = row.original.il
        if (!il) return false
        const searchStr = String(filterValue).toLowerCase()
        const ilAd = il.ad?.toLowerCase() || ""
        const plaka = il.plaka ? String(il.plaka) : ""
        return ilAd.includes(searchStr) || plaka.includes(searchStr)
      },
      meta: {
        filterConfig: {
          columnId: "il",
          type: "nested",
          operators: ["contains"],
          placeholder: t.lokasyon.il,
          label: t.lokasyon.il,
          customFilterFn: (row, filterValue, operator) => {
            const il = row.il
            if (!il) return false

            const searchStr = String(filterValue).toLowerCase()
            const ilAd = il.ad?.toLowerCase() || ""
            const plaka = il.plaka ? String(il.plaka) : ""

            return ilAd.includes(searchStr) || plaka.includes(searchStr)
          },
        },
      },
    },
    {
      id: "mahalleSayisi",
      header: t.lokasyon.mahalleSayisi,
      cell: ({ row }) => {
        const count = row.original._count.mahalleler
        return (
          <Badge variant="secondary">
            {count}
          </Badge>
        )
      },
      accessorFn: (row) => row._count?.mahalleler || 0,
      filterFn: (row, columnId, filterValue) => {
        const count = row.original._count?.mahalleler || 0
        const target = Number(filterValue)
        return count === target
      },
      meta: {
        filterConfig: {
          columnId: "mahalleSayisi",
          type: "number",
          operators: ["equals", "greaterThan", "lessThan"],
          label: t.lokasyon.mahalleSayisi,
          customFilterFn: (row, filterValue, operator) => {
            const count = row._count?.mahalleler || 0
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
