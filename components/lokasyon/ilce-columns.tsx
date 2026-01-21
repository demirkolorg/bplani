"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal, Pencil, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import type { Ilce } from "@/hooks/use-lokasyon"

interface ColumnOptions {
  onEdit?: (ilce: Ilce) => void
  onDelete?: (id: string) => void
}

export function getIlceColumns({ onEdit, onDelete }: ColumnOptions = {}): ColumnDef<Ilce>[] {
  return [
    {
      accessorKey: "ad",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            İlçe Adı
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        return <span className="font-medium">{row.getValue("ad")}</span>
      },
    },
    {
      id: "il",
      header: "İl",
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
    },
    {
      id: "mahalleSayisi",
      header: "Mahalle Sayısı",
      cell: ({ row }) => {
        const count = row.original._count.mahalleler
        return (
          <Badge variant="secondary">
            {count}
          </Badge>
        )
      },
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const ilce = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Menüyü aç</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit?.(ilce)}>
                <Pencil className="mr-2 h-4 w-4" />
                Düzenle
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => onDelete?.(ilce.id)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Sil
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]
}
