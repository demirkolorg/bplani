"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Eye, Pause, Play, Trash2, Check } from "lucide-react"

import { useAlarmlar, useUpdateAlarm, useDeleteAlarm, type Alarm } from "@/hooks/use-alarmlar"
import { DataTable } from "@/components/shared/data-table"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import { getAlarmColumns, alarmSortOptions } from "./alarm-columns"

export function AlarmTable() {
  const router = useRouter()
  const [deleteId, setDeleteId] = React.useState<string | null>(null)

  const { data, isLoading } = useAlarmlar()
  const updateAlarm = useUpdateAlarm()
  const deleteAlarm = useDeleteAlarm()

  const columns = React.useMemo(() => getAlarmColumns(), [])

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
              Kişiye Git
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
            Görüldü İşaretle
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
              Devam Ettir
            </>
          ) : (
            <>
              <Pause className="mr-2 h-4 w-4" />
              Duraklat
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
        searchPlaceholder="Alarm ara (başlık, kişi adı, numara...)"
        isLoading={isLoading}
        sortOptions={alarmSortOptions}
        defaultSort={{ column: "tetikTarihi", direction: "asc" }}
        onRowClick={handleRowClick}
        rowWrapper={rowWrapper}
        columnVisibilityLabels={{
          durum: "Durum",
          tip: "Tip",
          baslik: "Başlık / Mesaj",
          kisi: "Kişi",
          tetikTarihi: "Tetik Tarihi",
          gunOnce: "Gün Önce",
          olusturan: "Oluşturan",
        }}
      />

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Alarmı Sil"
        description="Bu alarmı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz."
        confirmText="Sil"
        onConfirm={handleDelete}
        isLoading={deleteAlarm.isPending}
      />
    </>
  )
}
