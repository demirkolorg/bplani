"use client"

import * as React from "react"
import { useIller, useDeleteIl, type Il } from "@/hooks/use-lokasyon"
import { DataTable } from "@/components/shared/data-table"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { getIlColumns } from "./il-columns"
import { IlFormModal } from "./il-form-modal"

export function IlTable() {
  const [editingIl, setEditingIl] = React.useState<Il | null>(null)
  const [deleteId, setDeleteId] = React.useState<string | null>(null)

  const { data, isLoading } = useIller()
  const deleteIl = useDeleteIl()

  const columns = React.useMemo(
    () => getIlColumns({
      onEdit: setEditingIl,
      onDelete: setDeleteId,
    }),
    []
  )

  const handleDelete = async () => {
    if (!deleteId) return
    await deleteIl.mutateAsync(deleteId)
    setDeleteId(null)
  }

  return (
    <>
      <DataTable
        columns={columns}
        data={data || []}
        searchPlaceholder="İl adı veya plaka kodu ile ara..."
        isLoading={isLoading}
      />

      <IlFormModal
        open={!!editingIl}
        onOpenChange={(open) => !open && setEditingIl(null)}
        initialData={editingIl || undefined}
      />

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="İli Sil"
        description="Bu ili silmek istediğinizden emin misiniz? Bu işlem geri alınamaz. İle bağlı ilçeler varsa silme işlemi engellenecektir."
        confirmText="Sil"
        onConfirm={handleDelete}
        isLoading={deleteIl.isPending}
      />
    </>
  )
}
