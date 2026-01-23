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
import { getNumaraColumns, numaraSortOptions } from "./numara-columns"

export function NumaraTable() {
  const router = useRouter()

  const { data, isLoading } = useNumaralar()

  const columns = React.useMemo(() => getNumaraColumns(), [])

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
          Kişiye Git
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )

  return (
    <DataTable
      columns={columns}
      data={data?.data || []}
      searchPlaceholder="Numara veya kişi adı ile ara..."
      isLoading={isLoading}
      sortOptions={numaraSortOptions}
      defaultSort={{ column: "createdAt", direction: "desc" }}
      onRowClick={handleRowClick}
      rowWrapper={rowWrapper}
      columnVisibilityLabels={{
        numara: "Numara",
        kisiAdSoyad: "Kişi",
        kisiTip: "Tip",
        takipVar: "Takip",
        baslamaTarihi: "Başlama",
        bitisTarihi: "Bitiş",
        kalanGun: "Kalan Gün",
      }}
    />
  )
}
