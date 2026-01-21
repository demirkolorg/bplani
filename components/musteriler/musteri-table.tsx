"use client"

import * as React from "react"
import { useMusteriler, useDeleteMusteri } from "@/hooks/use-musteriler"
import { DataTable } from "@/components/shared/data-table"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { getMusteriColumns, musteriSortOptions } from "./musteri-columns"

export function MusteriTable() {
  const [deleteId, setDeleteId] = React.useState<string | null>(null)

  const { data, isLoading } = useMusteriler()
  const deleteMusteri = useDeleteMusteri()

  const columns = React.useMemo(
    () => getMusteriColumns({ onDelete: setDeleteId }),
    []
  )

  const handleDelete = async () => {
    if (!deleteId) return
    await deleteMusteri.mutateAsync(deleteId)
    setDeleteId(null)
  }

  return (
    <>
      <DataTable
        columns={columns}
        data={data || []}
        searchPlaceholder="Ad, soyad, TC veya GSM ile ara..."
        isLoading={isLoading}
        sortOptions={musteriSortOptions}
        defaultSort={{ column: "createdAt", direction: "desc" }}
      />

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Müşteriyi Sil"
        description="Bu müşteriyi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz."
        confirmText="Sil"
        onConfirm={handleDelete}
        isLoading={deleteMusteri.isPending}
      />
    </>
  )
}
