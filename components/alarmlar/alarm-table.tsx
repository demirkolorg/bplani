"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Eye, Pause, Play, Trash2, Check } from "lucide-react"

import { useAlarmlar, useUpdateAlarm, useDeleteAlarm, type Alarm } from "@/hooks/use-alarmlar"
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
import { getAlarmColumns, getAlarmSortOptions } from "./alarm-columns"

export function AlarmTable() {
  const router = useRouter()
  const { t, locale } = useLocale()
  const [deleteId, setDeleteId] = React.useState<string | null>(null)

  const { data, isLoading } = useAlarmlar()
  const updateAlarm = useUpdateAlarm()
  const deleteAlarm = useDeleteAlarm()

  // Table preferences
  const prefs = useDataTablePreferences("alarmlar", {
    defaultSort: { column: "tetikTarihi", direction: "asc" },
    defaultPageSize: 20,
  })

  const columns = React.useMemo(() => getAlarmColumns(t, locale), [t, locale])
  const sortOptions = React.useMemo(() => getAlarmSortOptions(t), [t])

  const handleDelete = async () => {
    if (!deleteId) return
    await deleteAlarm.mutateAsync(deleteId)
    setDeleteId(null)
  }

  const handleTogglePause = async (alarm: Alarm) => {
    await updateAlarm.mutateAsync({
      id: alarm.id,
      data: { isPaused: !alarm.isPaused },
    })
  }

  const handleMarkAsRead = async (alarm: Alarm) => {
    await updateAlarm.mutateAsync({
      id: alarm.id,
      data: { durum: "GORULDU" },
    })
  }

  const handleRowClick = (alarm: Alarm) => {
    // Eğer takip varsa kişiye git
    if (alarm.takip?.gsm?.kisi?.id) {
      router.push(`/kisiler/${alarm.takip.gsm.kisi.id}`)
    }
  }

  // Custom row wrapper with context menu
  const rowWrapper = (row: Alarm, children: React.ReactNode) => (
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
        {row.takip?.gsm?.kisi && (
          <>
            <ContextMenuItem
              onClick={(e) => {
                e.stopPropagation()
                router.push(`/kisiler/${row.takip!.gsm.kisi.id}`)
              }}
            >
              <Eye className="mr-2 h-4 w-4" />
              {t.alarmlar.goToPerson}
            </ContextMenuItem>
            <ContextMenuSeparator />
          </>
        )}
        {row.durum === "TETIKLENDI" && (
          <ContextMenuItem
            onClick={(e) => {
              e.stopPropagation()
              handleMarkAsRead(row)
            }}
          >
            <Check className="mr-2 h-4 w-4" />
            {t.alarmlar.markAsRead}
          </ContextMenuItem>
        )}
        <ContextMenuItem
          onClick={(e) => {
            e.stopPropagation()
            handleTogglePause(row)
          }}
        >
          {row.isPaused ? (
            <>
              <Play className="mr-2 h-4 w-4" />
              {t.alarmlar.resume}
            </>
          ) : (
            <>
              <Pause className="mr-2 h-4 w-4" />
              {t.alarmlar.pause}
            </>
          )}
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
        searchPlaceholder={t.alarmlar.searchPlaceholder}
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
          durum: t.alarmlar.durum,
          tip: t.alarmlar.tip,
          baslik: t.alarmlar.baslikMesaj,
          kisi: t.alarmlar.person,
          tetikTarihi: t.alarmlar.tetikTarihi,
          gunOnce: t.alarmlar.gunOnce,
          olusturan: t.alarmlar.olusturan,
        }}
      />

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title={t.alarmlar.deleteAlarm}
        description={t.alarmlar.deleteAlarmConfirm}
        confirmText={t.common.delete}
        onConfirm={handleDelete}
        isLoading={deleteAlarm.isPending}
      />
    </>
  )
}
