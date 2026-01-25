"use client"

import * as React from "react"
import { useTakipler, useDeleteTakip, type Takip } from "@/hooks/use-takip"
import { useDataTablePreferences } from "@/hooks/use-table-preferences"
import { useLocale } from "@/components/providers/locale-provider"
import { DataTable } from "@/components/shared/data-table"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { TakipFormModal } from "./takip-form-modal"
import { getTakipColumns, getTakipSortOptions } from "./takip-columns"

export function TakipTable() {
  const { t } = useLocale()
  const [deleteId, setDeleteId] = React.useState<string | null>(null)
  const [editingTakip, setEditingTakip] = React.useState<Takip | null>(null)

  const { data, isLoading } = useTakipler()
  const deleteTakip = useDeleteTakip()

  // Table preferences
  const prefs = useDataTablePreferences("takipler", {
    defaultSort: { column: "bitisTarihi", direction: "asc" },
    defaultPageSize: 20,
  })

  const columns = React.useMemo(
    () =>
      getTakipColumns(t, {
        onEdit: setEditingTakip,
        onDelete: setDeleteId,
      }),
    [t]
  )

  const sortOptions = React.useMemo(() => getTakipSortOptions(t), [t])

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
        searchPlaceholder={t.takipler.searchPlaceholder}
        isLoading={isLoading}
        sortOptions={sortOptions}
        defaultSort={prefs.defaultSort}
        pageSize={prefs.pageSize}
        defaultColumnVisibility={prefs.columnVisibility}
        onColumnVisibilityChange={prefs.setColumnVisibility}
        onSortChange={prefs.setSorting}
        onPageSizeChange={prefs.setPageSize}
        columnVisibilityLabels={{
          kisi: t.takipler.person,
          gsm: "GSM",
          baslamaTarihiDisplay: t.takipler.startDate,
          bitisTarihiDisplay: t.takipler.endDate,
          kalanGun: t.takipler.remainingDays,
          durum: t.takipler.durum,
          alarmlar: t.takipler.alarm,
          actions: t.common.actions,
        }}
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
        title={t.takipler.deleteTakip}
        description={t.takipler.deleteTakipConfirm}
        confirmText={t.common.delete}
        onConfirm={handleDelete}
        isLoading={deleteTakip.isPending}
      />
    </>
  )
}
