"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useGsmWithActiveTakipler, type GsmWithActiveTakip } from "@/hooks/use-takip"
import { useDataTablePreferences } from "@/hooks/use-table-preferences"
import { useLocale } from "@/components/providers/locale-provider"
import { DataTable } from "@/components/shared/data-table"
import { getTakipColumns, getTakipSortOptions } from "./takip-columns"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import { Eye } from "lucide-react"

export function TakipTable() {
  const router = useRouter()
  const { t } = useLocale()

  const { data, isLoading } = useGsmWithActiveTakipler()

  // Table preferences
  const prefs = useDataTablePreferences("takipler", {
    defaultSort: { column: "bitisTarihi", direction: "asc" },
    defaultPageSize: 20,
  })

  const columns = React.useMemo(
    () => getTakipColumns(t),
    [t]
  )

  const sortOptions = React.useMemo(() => getTakipSortOptions(t), [t])

  const handleRowClick = (gsm: GsmWithActiveTakip) => {
    router.push(`/takipler/${gsm.gsmId}`)
  }

  const rowWrapper = (gsm: GsmWithActiveTakip, children: React.ReactNode) => (
    <ContextMenu key={gsm.gsmId}>
      <ContextMenuTrigger asChild>
        <tr
          className="border-b transition-colors hover:bg-muted/50 cursor-pointer"
          onClick={() => handleRowClick(gsm)}
        >
          {children}
        </tr>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onClick={() => router.push(`/takipler/${gsm.gsmId}`)}>
          <Eye className="mr-2 h-4 w-4" />
          {t.common.view}
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )

  return (
    <DataTable
      columns={columns}
      data={data || []}
      searchPlaceholder={t.takipler.searchPlaceholder}
      isLoading={isLoading}
      sortOptions={sortOptions}
      defaultSort={prefs.defaultSort}
      pageSize={prefs.pageSize}
      defaultColumnVisibility={prefs.columnVisibility}
      onColumnVisibilityChange={prefs.setColumnVisibility}
      onSortChange={prefs.setSorting}
      onPageSizeChange={prefs.setPageSize}
      rowWrapper={rowWrapper}
      columnVisibilityLabels={{
        gsm: "GSM",
        kisi: t.takipler.person,
        baslamaTarihiDisplay: t.takipler.startDate,
        bitisTarihiDisplay: t.takipler.endDate,
        kalanGun: t.takipler.remainingDays,
        durum: t.takipler.durum,
        alarmlar: t.takipler.alarm,
        actions: t.common.actions,
      }}
    />
  )
}
