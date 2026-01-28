"use client"

import * as React from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { useLocale } from "@/components/providers/locale-provider"
import { FilterValueInput } from "@/components/query-builder/filter-value-input"
import { getOperatorLabel } from "@/lib/query-builder/types"
import type { FilterOperator, ColumnType } from "@/lib/query-builder/types"
import type {
  ColumnFilterConfig,
  ColumnFilterState,
} from "@/lib/data-table/column-filter-config"
import { DEFAULT_OPERATORS } from "@/lib/data-table/filter-defaults"

interface TypeAwareFilterInputProps {
  config: ColumnFilterConfig
  filter: ColumnFilterState | null
  onChange: (filter: ColumnFilterState | null) => void
}

/**
 * Map DataTableColumnType to QueryBuilder's ColumnType
 */
function mapToQueryBuilderType(dataTableType: string): ColumnType {
  switch (dataTableType) {
    case "text":
    case "array":
    case "nested":
      return "text"
    case "number":
    case "computed":
      return "number"
    case "date":
      return "date"
    case "boolean":
    case "enum":
      return "select"
    default:
      return "text"
  }
}

/**
 * Get operator icon
 */
function getOperatorIcon(operator: FilterOperator): string {
  switch (operator) {
    case "contains":
    case "doesNotContain":
      return "≈"
    case "equals":
    case "notEquals":
      return "="
    case "greaterThan":
      return ">"
    case "lessThan":
      return "<"
    case "between":
      return "⟷"
    case "startsWith":
      return "⎿"
    case "endsWith":
      return "⏌"
    case "in":
    case "inList":
      return "∈"
    case "notIn":
    case "notInList":
      return "∉"
    case "isEmpty":
      return "∅"
    case "isNotEmpty":
      return "≠∅"
    case "before":
      return "◀"
    case "after":
      return "▶"
    default:
      return "•"
  }
}

/**
 * Type-aware filter input with operator selector
 * Wrapper around QueryBuilder's FilterValueInput
 */
export function TypeAwareFilterInput({
  config,
  filter,
  onChange,
}: TypeAwareFilterInputProps) {
  const { t } = useLocale()

  // Get available operators
  const availableOperators = config.operators || DEFAULT_OPERATORS[config.type]

  // Current operator
  const currentOperator = filter?.operator || availableOperators[0]

  // Handle operator change
  const handleOperatorChange = (newOperator: FilterOperator) => {
    onChange({
      operator: newOperator,
      value: null, // Reset value when operator changes
    })
  }

  // Handle value change
  const handleValueChange = (newValue: any) => {
    onChange({
      operator: currentOperator,
      value: newValue,
    })
  }

  // Handle clear
  const handleClear = () => {
    onChange(null)
  }

  // Show operator selector only if multiple operators available
  const showOperatorSelector = availableOperators.length > 1

  return (
    <div className="flex items-center gap-1">
      {/* Operator Selector */}
      {showOperatorSelector && (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "h-8 w-8 p-0 font-mono text-xs",
                filter && "bg-primary/10"
              )}
              title={getOperatorLabel(currentOperator, t.queryBuilder)}
            >
              {getOperatorIcon(currentOperator)}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-2" align="start">
            <div className="space-y-1">
              {availableOperators.map((op) => (
                <Button
                  key={op}
                  variant={op === currentOperator ? "secondary" : "ghost"}
                  size="sm"
                  className="w-full justify-start text-xs"
                  onClick={() => handleOperatorChange(op)}
                >
                  <span className="mr-2 font-mono text-muted-foreground">
                    {getOperatorIcon(op)}
                  </span>
                  {getOperatorLabel(op, t.queryBuilder)}
                </Button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      )}

      {/* Value Input (from QueryBuilder) */}
      <div className="flex-1 min-w-0">
        <FilterValueInput
          columnType={mapToQueryBuilderType(config.type)}
          operator={currentOperator}
          value={filter?.value ?? null}
          onChange={handleValueChange}
          options={config.options}
          placeholder={config.placeholder}
        />
      </div>

      {/* Clear Button */}
      {filter && filter.value !== null && (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={handleClear}
          title={t.queryBuilder.clear}
        >
          <X className="h-3 w-3" />
        </Button>
      )}
    </div>
  )
}
