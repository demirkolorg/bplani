"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Eye, Pencil, Trash2 } from "lucide-react"

import { useOperasyonlar, useDeleteOperasyon, type Operasyon } from "@/hooks/use-operasyonlar"
import { DataTable } from "@/components/shared/data-table"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import { getOperasyonColumns, operasyonSortOptions } from "./operasyon-columns"

export function OperasyonTable() {
  const router = useRouter()
  const [deleteId, setDeleteId] = React.useState<string | null>(null)

  const { data, isLoading } = useOperasyonlar()
  const deleteOperasyon = useDeleteOperasyon()

  const columns = React.useMemo(() => getOperasyonColumns(), [])

  const handleDelete = async () => {
    if (!deleteId) return
    await deleteOperasyon.mutateAsync(deleteId)
    setDeleteId(null)
  }

  const handleRowClick = (operasyon: Operasyon) => {
    router.push(`/operasyonlar/${operasyon.id}`)
  }

  // Custom row wrapper with context menu
  const rowWrapper = (row: Operasyon, children: React.ReactNode) => (
    <ContextMenu key={row.id}>
      <ContextMenuTrigger asChild>
        <tr
          className="border-b transition-colors hover:bg-muted/50 cursor-pointer"
          onClick={() => handleRowClick(row)}
        >
          {children}
        </tr>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-48">
        <ContextMenuItem
          onClick={(e) => {
            e.stopPropagation()
            router.push(`/operasyonlar/${row.id}`)
          }}
        >
          <Eye className="mr-2 h-4 w-4" />
          Görüntüle
        </ContextMenuItem>
        <ContextMenuItem
          onClick={(e) => {
            e.stopPropagation()
            router.push(`/operasyonlar/${row.id}?edit=true`)
          }}
        >
          <Pencil className="mr-2 h-4 w-4" />
          Düzenle
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem
          className="text-destructive focus:text-destructive"
          onClick={(e) => {
            e.stopPropagation()
            setDeleteId(row.id)
          }}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Sil
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )

  return (
    <>
      <DataTable
        columns={columns}
        data={data?.data || []}
        searchPlaceholder="Adres veya notlarda ara..."
        isLoading={isLoading}
        sortOptions={operasyonSortOptions}
        defaultSort={{ column: "tarih", direction: "desc" }}
        onRowClick={handleRowClick}
        rowWrapper={rowWrapper}
        columnVisibilityLabels={{
          tarih: "Tarih",
          adres: "Adres",
          katilimcilar: "Katılımcılar",
          katilimciSayisi: "Sayı",
          notlar: "Notlar",
        }}
      />

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Operasyonu Sil"
        description="Bu operasyonu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz ve tüm katılımcı kayıtları da silinecektir."
        confirmText="Sil"
        onConfirm={handleDelete}
        isLoading={deleteOperasyon.isPending}
      />
    </>
  )
}
