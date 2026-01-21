"use client"

import * as React from "react"
import { useTakipler, useDeleteTakip, type Takip } from "@/hooks/use-takip"
import { DataTable } from "@/components/shared/data-table"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { TakipFormModal } from "./takip-form-modal"
import { getTakipColumns, takipSortOptions } from "./takip-columns"

export function TakipTable() {
  const [deleteId, setDeleteId] = React.useState<string | null>(null)
  const [editingTakip, setEditingTakip] = React.useState<Takip | null>(null)

  const { data, isLoading } = useTakipler()
  const deleteTakip = useDeleteTakip()

  const columns = React.useMemo(
    () =>
      getTakipColumns({
        onEdit: setEditingTakip,
        onDelete: setDeleteId,
      }),
    []
  )

  const handleDelete = async () => {
    if (!deleteId) return
    await deleteTakip.mutateAsync(deleteId)
    setDeleteId(null)
  }

  return (
    <>
      <DataTable
        columns={columns}
        data={data?.data || []}
        searchPlaceholder="Müşteri adı veya GSM ile ara..."
        isLoading={isLoading}
        sortOptions={takipSortOptions}
        defaultSort={{ column: "bitisTarihi", direction: "asc" }}
      />

      {/* Edit Modal */}
      <TakipFormModal
        open={!!editingTakip}
        onOpenChange={(open) => !open && setEditingTakip(null)}
        initialData={
          editingTakip
            ? {
                id: editingTakip.id,
                gsmId: editingTakip.gsmId,
                baslamaTarihi: editingTakip.baslamaTarihi,
                bitisTarihi: editingTakip.bitisTarihi,
                durum: editingTakip.durum,
              }
            : undefined
        }
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Takibi Sil"
        description="Bu takibi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz ve bağlı alarmlar da silinecektir."
        confirmText="Sil"
        onConfirm={handleDelete}
        isLoading={deleteTakip.isPending}
      />
    </>
  )
}
