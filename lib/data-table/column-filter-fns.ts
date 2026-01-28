import type { FilterFn } from "@tanstack/react-table"
import type { FilterOperator } from "@/lib/query-builder/types"

/**
 * Operator-aware filter function factory
 * Her sütun tipi için operatör bazlı filtreleme mantığı sağlar
 */
export function createOperatorFilterFn<TData>(
  valueAccessor: (row: TData) => any,
  type: "text" | "number" | "date" | "boolean" | "enum"
): FilterFn<TData> {
  return (row, columnId, filterValue) => {
    const cellValue = valueAccessor(row.original)

    // filterValue format: { operator: string, value: any }
    if (!filterValue || typeof filterValue !== "object") return true

    const { operator, value } = filterValue as { operator: string; value: any }

    if (value === null || value === undefined) return true

    return applyOperatorLogic(cellValue, value, operator, type)
  }
}

/**
 * Operator mantığını uygular
 * data-table.tsx'teki applyFilterLogic fonksiyonundan taşındı
 */
export function applyOperatorLogic(
  cellValue: unknown,
  filterValue: unknown,
  operator: string,
  columnType?: string
): boolean {
  // Handle null/undefined
  if (cellValue === null || cellValue === undefined) {
    return operator === "isEmpty"
  }

  // Handle isEmpty/isNotEmpty
  if (operator === "isEmpty") {
    return !cellValue || (typeof cellValue === "string" && cellValue.trim() === "")
  }
  if (operator === "isNotEmpty") {
    return !!cellValue && (typeof cellValue !== "string" || cellValue.trim() !== "")
  }

  // Text operators
  if (columnType === "text" || typeof cellValue === "string") {
    const cellStr = String(cellValue).toLowerCase()
    const filterStr = String(filterValue).toLowerCase()

    switch (operator) {
      case "contains":
        return cellStr.includes(filterStr)
      case "doesNotContain":
        return !cellStr.includes(filterStr)
      case "startsWith":
        return cellStr.startsWith(filterStr)
      case "endsWith":
        return cellStr.endsWith(filterStr)
      case "equals":
        return cellStr === filterStr
      case "notEquals":
        return cellStr !== filterStr
      case "inList":
        if (Array.isArray(filterValue)) {
          return filterValue.some((v) => cellStr.includes(String(v).toLowerCase()))
        }
        return false
      case "notInList":
        if (Array.isArray(filterValue)) {
          return !filterValue.some((v) => cellStr.includes(String(v).toLowerCase()))
        }
        return false
      default:
        return false
    }
  }

  // Number operators
  if (columnType === "number" || typeof cellValue === "number") {
    const cellNum = Number(cellValue)
    const filterNum = Number(filterValue)

    if (isNaN(cellNum)) return false

    switch (operator) {
      case "equals":
        return cellNum === filterNum
      case "notEquals":
        return cellNum !== filterNum
      case "greaterThan":
        return cellNum > filterNum
      case "lessThan":
        return cellNum < filterNum
      case "between":
        if (
          typeof filterValue === "object" &&
          filterValue !== null &&
          "min" in filterValue &&
          "max" in filterValue
        ) {
          const min = Number((filterValue as any).min)
          const max = Number((filterValue as any).max)
          return cellNum >= min && cellNum <= max
        }
        return false
      case "inList":
        if (Array.isArray(filterValue)) {
          return filterValue.some((v) => Number(v) === cellNum)
        }
        return false
      case "notInList":
        if (Array.isArray(filterValue)) {
          return !filterValue.some((v) => Number(v) === cellNum)
        }
        return false
      default:
        return false
    }
  }

  // Date operators
  if (columnType === "date" || cellValue instanceof Date || typeof cellValue === "string") {
    const cellDate = new Date(cellValue as string | Date)
    if (isNaN(cellDate.getTime())) return false

    const filterDate = new Date(filterValue as string | Date)
    if (isNaN(filterDate.getTime())) {
      // Handle between for dates
      if (
        operator === "between" &&
        typeof filterValue === "object" &&
        filterValue !== null &&
        "min" in filterValue &&
        "max" in filterValue
      ) {
        const minDate = new Date((filterValue as any).min)
        const maxDate = new Date((filterValue as any).max)
        return cellDate >= minDate && cellDate <= maxDate
      }
      return false
    }

    switch (operator) {
      case "equals":
        return cellDate.toDateString() === filterDate.toDateString()
      case "before":
        return cellDate < filterDate
      case "after":
        return cellDate > filterDate
      default:
        return false
    }
  }

  // Boolean/Enum operators
  if (columnType === "boolean" || columnType === "enum") {
    const cellStr = String(cellValue).toLowerCase()
    const filterStr = String(filterValue).toLowerCase()

    switch (operator) {
      case "equals":
        return cellStr === filterStr
      case "notEquals":
        return cellStr !== filterStr
      case "in":
        if (Array.isArray(filterValue)) {
          return filterValue.some((v) => String(v).toLowerCase() === cellStr)
        }
        return false
      case "notIn":
        if (Array.isArray(filterValue)) {
          return !filterValue.some((v) => String(v).toLowerCase() === cellStr)
        }
        return false
      default:
        return false
    }
  }

  return false
}

/**
 * Array field filter factory (gsm, adresler gibi)
 */
export function createArrayFilterFn<TData>(
  arrayAccessor: (row: TData) => any[],
  searchField: string = "numara"
): FilterFn<TData> {
  return (row, columnId, filterValue) => {
    if (!filterValue || typeof filterValue !== "object") return true

    const { operator, value } = filterValue as { operator: string; value: any }
    const items = arrayAccessor(row.original) || []

    if (operator === "contains") {
      return items.some(item =>
        String(item[searchField]).toLowerCase().includes(String(value).toLowerCase())
      )
    }

    if (operator === "inList" && Array.isArray(value)) {
      return items.some(item =>
        value.some(v => String(item[searchField]).toLowerCase().includes(String(v).toLowerCase()))
      )
    }

    return false
  }
}

/**
 * Nested object filter factory (mahalle.ilce.il, model.marka gibi)
 */
export function createNestedFilterFn<TData>(
  nestedAccessor: (row: TData) => any,
  searchFields: string[]
): FilterFn<TData> {
  return (row, columnId, filterValue) => {
    if (!filterValue || typeof filterValue !== "object") return true

    const { operator, value } = filterValue as { operator: string; value: any }
    const nestedObj = nestedAccessor(row.original)
    if (!nestedObj) return false

    const searchTerm = String(value).toLowerCase()

    if (operator === "contains") {
      return searchFields.some(field => {
        const fieldValue = field.split(".").reduce((obj, key) => obj?.[key], nestedObj)
        return String(fieldValue).toLowerCase().includes(searchTerm)
      })
    }

    return false
  }
}

/**
 * Computed field filter factory (kalanGun gibi runtime'da hesaplanan alanlar)
 */
export function createComputedFilterFn<TData>(
  computeFn: (row: TData) => number,
  type: "number" | "date" = "number"
): FilterFn<TData> {
  return (row, columnId, filterValue) => {
    if (!filterValue || typeof filterValue !== "object") return true

    const computedValue = computeFn(row.original)
    const { operator, value } = filterValue as { operator: FilterOperator; value: any }

    return applyOperatorLogic(computedValue, value, operator, type)
  }
}

/**
 * Built-in: Simple text contains filter
 */
export const textContainsFilterFn: FilterFn<any> = (row, columnId, value) => {
  const cellValue = row.getValue(columnId)
  if (!value) return true
  return String(cellValue).toLowerCase().includes(String(value).toLowerCase())
}

/**
 * Built-in: Number range filter
 */
export const numberRangeFilterFn: FilterFn<any> = (row, columnId, value) => {
  const cellValue = Number(row.getValue(columnId))
  if (!value || typeof value !== "object") return true

  const { min, max } = value as { min: number; max: number }
  return cellValue >= min && cellValue <= max
}

/**
 * Built-in: Date range filter
 */
export const dateRangeFilterFn: FilterFn<any> = (row, columnId, value) => {
  const cellValue = new Date(row.getValue(columnId) as string | Date)
  if (isNaN(cellValue.getTime())) return false
  if (!value || typeof value !== "object") return true

  const { min, max } = value as { min: Date; max: Date }
  const minDate = new Date(min)
  const maxDate = new Date(max)

  return cellValue >= minDate && cellValue <= maxDate
}

/**
 * Built-in: Enum/Multi-select filter
 */
export const enumFilterFn: FilterFn<any> = (row, columnId, value) => {
  const cellValue = row.getValue(columnId)
  if (!value) return true

  if (Array.isArray(value)) {
    return value.includes(cellValue)
  }

  return cellValue === value
}
