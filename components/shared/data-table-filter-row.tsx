"use client"

import * as React from "react"
import type { Column } from "@tanstack/react-table"
import { TypeAwareFilterInput } from "./type-aware-filter-input"
import type {
  ColumnFilterConfig,
  ColumnFilterState,
} from "@/lib/data-table/column-filter-config"
import type { DataTableColumnDef } from "@/lib/data-table/types"

interface DataTableFilterRowProps<TData> {
  columns: Column<TData, unknown>[]
  filterStates: Record<string, ColumnFilterState>
  onFilterChange: (columnId: string, filter: ColumnFilterState | null) => void
}

/**
 * Enhanced filter row for data tables
 * Renders type-aware filter inputs for each filterable column
 */
export function DataTableFilterRow<TData>({
  columns,
  filterStates,
  onFilterChange,
}: DataTableFilterRowProps<TData>) {
  return (
    <tr className="border-b bg-muted/30">
      {columns.map((column) => {
        // Get filter config from column meta
        const meta = column.columnDef.meta as any
        const filterConfig = meta?.filterConfig as ColumnFilterConfig | undefined

        // If no filter config or not filterable, render empty cell
        if (!filterConfig || filterConfig.filterable === false) {
          return (
            <th
              key={column.id}
              className="h-10 px-2"
              style={{ width: column.getSize() }}
            />
          )
        }

        // Get current filter state
        const currentFilter = filterStates[column.id] || null

        return (
          <th
            key={column.id}
            className="h-10 px-2"
            style={{ width: column.getSize() }}
          >
            <TypeAwareFilterInput
              config={filterConfig}
              filter={currentFilter}
              onChange={(filter) => onFilterChange(column.id, filter)}
            />
          </th>
        )
      })}
    </tr>
  )
}
