/**
 * Default Filter Operators by Column Type
 * Defines the available operators for each data table column type
 */

import type { FilterOperator } from "@/lib/query-builder/types"
import type { DataTableColumnType } from "./column-filter-config"

/**
 * Default operators for each column type
 * Used when filterConfig.operators is not specified
 */
export const DEFAULT_OPERATORS: Record<DataTableColumnType, FilterOperator[]> = {
  // Text columns: ad, soyad, notlar
  text: [
    "contains",
    "equals",
    "startsWith",
    "endsWith",
    "isEmpty",
    "isNotEmpty",
    "inList",
  ],

  // Number columns: visibleId, gunOnce, counts
  number: [
    "equals",
    "greaterThan",
    "lessThan",
    "between",
    "inList",
  ],

  // Date columns: baslamaTarihi, bitisTarihi
  date: [
    "equals",
    "before",
    "after",
    "between",
  ],

  // Boolean columns: tt, pio, asli, isActive
  // Only "equals" because we use a select dropdown (Yes/No/All)
  boolean: ["equals"],

  // Enum columns: durum, rol, oncelik, renk
  // "in" for multi-select, "equals" for single select
  enum: ["equals", "in"],

  // Array columns: gsmler, adresler
  // Custom filtering with contains
  array: ["contains", "inList"],

  // Nested columns: mahalle.ilce.il
  // Custom filtering with contains
  nested: ["contains"],

  // Computed columns: kalanGun
  // Runtime calculated values
  computed: [
    "equals",
    "greaterThan",
    "lessThan",
    "between",
  ],
}

/**
 * Get the default operator for a column type
 */
export function getDefaultOperator(type: DataTableColumnType): FilterOperator {
  const operators = DEFAULT_OPERATORS[type]
  return operators[0]
}

/**
 * Check if an operator is valid for a column type
 */
export function isOperatorValidForType(
  operator: FilterOperator,
  type: DataTableColumnType
): boolean {
  return DEFAULT_OPERATORS[type].includes(operator)
}
