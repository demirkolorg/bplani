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
import type { Il } from "@/hooks/use-lokasyon"

interface ColumnOptions {
  onEdit?: (il: Il) => void
  onDelete?: (id: string) => void
}

export function getIlColumns({ onEdit, onDelete }: ColumnOptions = {}): ColumnDef<Il>[] {
  return [
    {
      accessorKey: "plaka",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Plaka
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
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
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            İl Adı
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
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
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const il = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Menüyü aç</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit?.(il)}>
                <Pencil className="mr-2 h-4 w-4" />
                Düzenle
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => onDelete?.(il.id)}
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
