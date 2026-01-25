"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { X } from "lucide-react"
import { FilterValueInput } from "./filter-value-input"
import { useLocale } from "@/components/providers/locale-provider"
import type {
  ColumnConfig,
  Filter,
  FilterOperator,
} from "@/lib/query-builder/types"
import { getOperatorLabel } from "@/lib/query-builder/types"

interface FilterRowProps {
  filter: Filter
  columns: ColumnConfig[]
  onChange: (filter: Filter) => void
  onRemove: () => void
  canRemove: boolean
}

export function FilterRow({
  filter,
  columns,
  onChange,
  onRemove,
  canRemove,
}: FilterRowProps) {
  const { t } = useLocale()

  // Get current column config
  const currentColumn = columns.find((col) => col.field === filter.field)

  // Get available operators for selected column
  const availableOperators = currentColumn?.operators || []

  // Handle column change
  const handleColumnChange = (field: string) => {
    const newColumn = columns.find((col) => col.field === field)
    if (!newColumn) return

    // Reset operator and value when column changes
    const defaultOperator = newColumn.operators[0]
    onChange({
      field,
      operator: defaultOperator,
      value: null,
    })
  }

  // Handle operator change
  const handleOperatorChange = (operator: FilterOperator) => {
    // Reset value when operator changes
    onChange({
      ...filter,
      operator,
      value: null,
    })
  }

  return (
    <div className="flex items-start gap-2 p-3 rounded-lg border bg-card">
      {/* Column Select */}
      <div className="w-48">
        <Select value={filter.field} onValueChange={handleColumnChange}>
          <SelectTrigger>
            <SelectValue placeholder={t.queryBuilder.selectColumn} />
          </SelectTrigger>
          <SelectContent>
            {columns.map((column) => (
              <SelectItem key={column.field} value={column.field}>
                {column.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Operator Select */}
      <div className="w-48">
        <Select
          value={filter.operator}
          onValueChange={(value) => handleOperatorChange(value as FilterOperator)}
          disabled={!currentColumn}
        >
          <SelectTrigger>
            <SelectValue placeholder={t.queryBuilder.selectOperator} />
          </SelectTrigger>
          <SelectContent>
            {availableOperators.map((op) => (
              <SelectItem key={op} value={op}>
                {getOperatorLabel(op, t.queryBuilder)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Value Input */}
      <div className="flex-1">
        {currentColumn && (
          <FilterValueInput
            columnType={currentColumn.type}
            operator={filter.operator}
            value={filter.value}
            onChange={(value) =>
              onChange({
                ...filter,
                value,
              })
            }
            options={currentColumn.options}
            placeholder={currentColumn.placeholder}
          />
        )}
      </div>

      {/* Remove Button */}
      {canRemove && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onRemove}
          className="shrink-0"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}
