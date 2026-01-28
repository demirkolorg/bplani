"use client"

import * as React from "react"
import { Filter } from "lucide-react"
import type { Column, Table } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { HeaderFilterPopup, type HeaderFilterValue } from "./header-filter-popup"
import { cn } from "@/lib/utils"

interface ColumnHeaderFilterProps<TData> {
  column: Column<TData, unknown>
  table: Table<TData>
  title: string
  /** Custom value extractor (for nested/computed values) */
  getFilterValues?: (rows: TData[]) => HeaderFilterValue[]
  /** Custom value formatter */
  formatValue?: (value: any) => string
  /** Show blanks option */
  showBlanks?: boolean
}

/**
 * Extract unique values from column data
 * Fixed: Use column's accessorFn properly for computed/combined values
 */
function extractUniqueValues<TData>(
  column: Column<TData, unknown>,
  table: Table<TData>,
  formatValue?: (value: any) => string
): HeaderFilterValue[] {
  const rows = table.getPreFilteredRowModel().rows
  const valueMap = new Map<any, number>()

  rows.forEach(row => {
    // Try to get value using TanStack's getValue (respects accessorFn)
    let value: any
    try {
      value = row.getValue(column.id)
    } catch {
      // Fallback: access from original data
      value = (row.original as any)[column.id]
    }

    // Handle empty/null/undefined
    if (value === null || value === undefined || value === "" || (typeof value === "string" && value.trim() === "")) {
      return // Skip - will be handled by "(Blanks)" option
    }

    // Handle arrays (e.g., GSM numbers, addresses)
    if (Array.isArray(value)) {
      value.forEach(v => {
        const key = v?.numara || v // GSM object or primitive
        if (key && key !== "") {
          valueMap.set(key, (valueMap.get(key) || 0) + 1)
        }
      })
    } else {
      // Regular value
      const key = value
      valueMap.set(key, (valueMap.get(key) || 0) + 1)
    }
  })

  // Convert to array and sort
  const values: HeaderFilterValue[] = []
  valueMap.forEach((count, value) => {
    values.push({
      value,
      label: formatValue ? formatValue(value) : String(value),
      count,
    })
  })

  // Sort by label
  values.sort((a, b) => a.label.localeCompare(b.label, 'tr'))

  return values
}

export function ColumnHeaderFilter<TData>({
  column,
  table,
  title,
  getFilterValues,
  formatValue,
  showBlanks = true,
}: ColumnHeaderFilterProps<TData>) {
  // Get filter values
  const filterValues = React.useMemo(() => {
    if (getFilterValues) {
      const rows = table.getPreFilteredRowModel().rows.map(r => r.original)
      return getFilterValues(rows)
    }
    return extractUniqueValues(column, table, formatValue)
  }, [column, table, getFilterValues, formatValue])

  // Get current filter value
  const currentFilter = column.getFilterValue() as { operator: string; value: any[] } | undefined
  const selectedValues = currentFilter?.value || []

  // Check if filter is active
  const isFiltered = selectedValues.length > 0

  const handleApply = (newValues: any[]) => {
    if (newValues.length === 0) {
      // Clear filter
      column.setFilterValue(undefined)
    } else {
      // Apply filter with "in" operator
      column.setFilterValue({
        operator: "in",
        value: newValues,
      })
    }
  }

  return (
    <HeaderFilterPopup
      trigger={
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-8 w-8 p-0",
            isFiltered && "text-primary"
          )}
        >
          <Filter className={cn(
            "h-4 w-4",
            isFiltered && "fill-primary"
          )} />
        </Button>
      }
      values={filterValues}
      selectedValues={selectedValues}
      onApply={handleApply}
      title={title}
      showBlanks={showBlanks}
    />
  )
}
