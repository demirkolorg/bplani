"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Eye, Pencil, Trash2 } from "lucide-react"

import { useKisiler, useDeleteKisi, type Kisi } from "@/hooks/use-kisiler"
import { DataTable } from "@/components/shared/data-table"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import { getKisiColumns, kisiSortOptions } from "./musteri-columns"

export function KisiTable() {
  const router = useRouter()
  const [deleteId, setDeleteId] = React.useState<string | null>(null)
  const [contextKisi, setContextKisi] = React.useState<Kisi | null>(null)

  const { data, isLoading } = useKisiler()
  const deleteKisi = useDeleteKisi()

  const columns = React.useMemo(() => getKisiColumns(), [])

  const handleDelete = async () => {
    if (!deleteId) return
    await deleteKisi.mutateAsync(deleteId)
    setDeleteId(null)
  }

  const handleRowClick = (kisi: Kisi) => {
    router.push(`/kisiler/${kisi.id}`)
  }

  // Custom row wrapper with context menu
  const rowWrapper = (row: Kisi, children: React.ReactNode) => (
    <ContextMenu key={row.id}>
      <ContextMenuTrigger asChild>
        <tr
          className="border-b transition-colors hover:bg-muted/50 cursor-pointer"
          onClick={() => handleRowClick(row)}
          onContextMenu={() => setContextKisi(row)}
        >
          {children}
        </tr>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-48">
        <ContextMenuItem
          onClick={(e) => {
            e.stopPropagation()
            router.push(`/kisiler/${row.id}`)
          }}
        >
          <Eye className="mr-2 h-4 w-4" />
          Görüntüle
        </ContextMenuItem>
        <ContextMenuItem
          onClick={(e) => {
            e.stopPropagation()
            router.push(`/kisiler/${row.id}?edit=true`)
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
        searchPlaceholder="Ad, soyad, TC veya GSM ile ara..."
        isLoading={isLoading}
        sortOptions={kisiSortOptions}
        defaultSort={{ column: "createdAt", direction: "desc" }}
        onRowClick={handleRowClick}
        rowWrapper={rowWrapper}
        columnVisibilityLabels={{
          tip: "Tip",
          tc: "TC Kimlik",
          adSoyad: "Ad Soyad",
          faaliyet: "Faaliyet",
          gsm: "GSM",
          adres: "Adres",
          tanitim: "Tanıtım",
          not: "Not",
          pio: "PIO",
          asli: "Asli",
        }}
      />

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Kişiyi Sil"
        description="Bu kişiyi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz."
        confirmText="Sil"
        onConfirm={handleDelete}
        isLoading={deleteKisi.isPending}
      />
    </>
  )
}
