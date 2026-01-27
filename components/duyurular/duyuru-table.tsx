"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Eye, Pencil, Trash2 } from "lucide-react"

import { useDuyurular, useDeleteDuyuru, type Duyuru } from "@/hooks/use-duyurular"
import { useDataTablePreferences } from "@/hooks/use-table-preferences"
import { useLocale } from "@/components/providers/locale-provider"
import { DataTable } from "@/components/shared/data-table"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import { getDuyuruColumns, getDuyuruSortOptions } from "./duyuru-columns"

export function DuyuruTable() {
  const router = useRouter()
  const { t, locale } = useLocale()
  const [deleteId, setDeleteId] = React.useState<string | null>(null)

  // Fetch all announcements (including inactive and expired) for admin panel
  const { data, isLoading } = useDuyurular({ onlyActive: false, limit: 100 })
  const deleteDuyuru = useDeleteDuyuru()

  // Table preferences
  const prefs = useDataTablePreferences("duyurular", {
    defaultSort: { column: "oncelik", direction: "desc" },
    defaultPageSize: 20,
  })

  const columns = React.useMemo(() => getDuyuruColumns(t, locale), [t, locale])
  const sortOptions = React.useMemo(() => getDuyuruSortOptions(t), [t])

  const handleDelete = async () => {
    if (!deleteId) return
    await deleteDuyuru.mutateAsync(deleteId)
    setDeleteId(null)
  }

  const handleRowClick = (duyuru: Duyuru) => {
    router.push(`/duyurular/${duyuru.id}`)
  }

  // Custom row wrapper with context menu
  const rowWrapper = (row: Duyuru, children: React.ReactNode) => (
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
            router.push(`/duyurular/${row.id}`)
          }}
        >
          <Eye className="mr-2 h-4 w-4" />
          {t.common.view}
        </ContextMenuItem>
        <ContextMenuItem
          onClick={(e) => {
            e.stopPropagation()
            router.push(`/duyurular/${row.id}?edit=true`)
          }}
        >
          <Pencil className="mr-2 h-4 w-4" />
          {t.common.edit}
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
          {t.common.delete}
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )

  return (
    <>
      <DataTable
        columns={columns}
        data={data?.data || []}
        searchPlaceholder={t.duyurular.title}
        isLoading={isLoading}
        sortOptions={sortOptions}
        defaultSort={prefs.defaultSort}
        pageSize={prefs.pageSize}
        defaultColumnVisibility={prefs.columnVisibility}
        onRowClick={handleRowClick}
        rowWrapper={rowWrapper}
        onColumnVisibilityChange={prefs.setColumnVisibility}
        onSortChange={prefs.setSorting}
        onPageSizeChange={prefs.setPageSize}
        columnVisibilityLabels={{
          oncelik: t.duyurular.priority,
          baslik: t.duyurular.title,
          icerik: t.duyurular.content,
          publishedAt: t.duyurular.publishDate,
          expiresAt: t.duyurular.expiryDate,
          isActive: t.duyurular.status,
          createdUser: t.duyurular.createdBy,
        }}
      />

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title={t.duyurular.deleteDuyuru}
        description={t.duyurular.deleteDuyuruConfirm}
        confirmText={t.common.delete}
        onConfirm={handleDelete}
        isLoading={deleteDuyuru.isPending}
      />
    </>
  )
}
