/**
 * Data Table Column Filter Configuration
 * Type-safe column filtering with support for different data types
 */

import type { FilterOperator, SelectOption } from "@/lib/query-builder/types"

/**
 * Data table column types for filtering
 */
export type DataTableColumnType =
  | "text"      // ad, soyad, notlar
  | "number"    // visibleId, gunOnce, counts
  | "date"      // baslamaTarihi, bitisTarihi
  | "boolean"   // tt, pio, asli, isActive
  | "enum"      // durum, rol, oncelik, renk
  | "array"     // gsmler, adresler (özel işleme)
  | "nested"    // mahalle.ilce.il (özel işleme)
  | "computed"  // kalanGun (runtime hesaplama)

/**
 * Column filter configuration
 * Defines how a column should be filtered in the data table
 */
export interface ColumnFilterConfig {
  /** Column ID to filter on (optional - defaults to column.id) */
  columnId?: string

  /** Data type of the column */
  type: DataTableColumnType

  /** Available operators for this column (optional - will use defaults) */
  operators?: FilterOperator[]

  /** Default operator when filter is first opened */
  defaultOperator?: FilterOperator

  /** Options for enum/select type columns */
  options?: SelectOption[]

  /** Placeholder text for the input */
  placeholder?: string

  /** Label for the filter (defaults to column header) */
  label?: string

  /** Field name to filter on (if different from columnId) */
  filterField?: string

  /** Custom filter function for complex filtering logic (DEPRECATED - use column.filterFn instead) */
  customFilterFn?: (value: unknown, filterValue: FilterValue, operator: FilterOperator) => boolean

  /** Whether this column is filterable (default: true) */
  filterable?: boolean
}

/**
 * Filter state for a single column
 */
export interface ColumnFilterState {
  /** Filter operator */
  operator: FilterOperator

  /** Filter value (can be string, number, array, or object for between) */
  value: FilterValue
}

/**
 * Filter value types
 */
export type FilterValue =
  | string
  | number
  | string[] // For multi-select or bulk list
  | { min: number | string; max: number | string } // For between
  | null // For isEmpty/isNotEmpty
