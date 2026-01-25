"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Eye } from "lucide-react"

import { useNumaralar, type NumaraWithKisi } from "@/hooks/use-numaralar"
import { DataTable } from "@/components/shared/data-table"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import { getNumaraColumns, getNumaraSortOptions } from "./numara-columns"
import { useLocale } from "@/components/providers/locale-provider"

export function NumaraTable() {
  const router = useRouter()
  const { t } = useLocale()

  const { data, isLoading } = useNumaralar()

  const columns = React.useMemo(() => getNumaraColumns(t.numaralar), [t.numaralar])
  const sortOptions = React.useMemo(() => getNumaraSortOptions(t.numaralar), [t.numaralar])

  const handleRowClick = (numara: NumaraWithKisi) => {
    router.push(`/kisiler/${numara.kisi.id}`)
  }

  // Custom row wrapper with context menu
  const rowWrapper = (row: NumaraWithKisi, children: React.ReactNode) => (
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
            router.push(`/kisiler/${row.kisi.id}`)
          }}
        >
          <Eye className="mr-2 h-4 w-4" />
          {t.numaralar.goToPerson}
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )

  return (
    <DataTable
      columns={columns}
      data={data?.data || []}
      searchPlaceholder={t.numaralar.searchPlaceholder}
      isLoading={isLoading}
      sortOptions={sortOptions}
      defaultSort={{ column: "createdAt", direction: "desc" }}
      onRowClick={handleRowClick}
      rowWrapper={rowWrapper}
      columnVisibilityLabels={{
        numara: t.numaralar.numara,
        kisiAdSoyad: t.numaralar.kisi,
        kisiTip: t.numaralar.tip,
        takipVar: t.numaralar.takip,
        baslamaTarihi: t.numaralar.baslama,
        bitisTarihi: t.numaralar.bitis,
        kalanGun: t.numaralar.kalanGun,
      }}
    />
  )
}
