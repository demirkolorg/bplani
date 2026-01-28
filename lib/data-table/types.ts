/**
 * Extended Data Table Types
 * Extends TanStack Table's ColumnDef with filter configuration
 */

import type { ColumnDef } from "@tanstack/react-table"
import type { ColumnFilterConfig } from "./column-filter-config"

/**
 * Extended column meta with filter configuration
 */
export interface DataTableColumnMeta {
  /**
   * Filter configuration for this column
   */
  filterConfig?: ColumnFilterConfig
}

/**
 * Extended column definition with filter configuration in meta
 * Drop-in replacement for TanStack Table's ColumnDef
 */
export type DataTableColumnDef<TData, TValue = unknown> = ColumnDef<TData, TValue> & {
  /**
   * Column meta including filter configuration
   */
  meta?: DataTableColumnMeta
}
