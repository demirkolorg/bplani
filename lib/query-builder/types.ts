/**
 * Advanced Query Builder Types
 * Type-safe query builder with bulk paste support
 */

// Column data types
export type ColumnType = "text" | "number" | "select" | "date"

// Text operators
export type TextOperator =
  | "contains"
  | "doesNotContain"
  | "startsWith"
  | "endsWith"
  | "equals"
  | "notEquals"
  | "isEmpty"
  | "isNotEmpty"
  | "inList"
  | "notInList"

// Number operators
export type NumberOperator =
  | "equals"
  | "notEquals"
  | "greaterThan"
  | "lessThan"
  | "between"
  | "inList"
  | "notInList"

// Select operators
export type SelectOperator = "equals" | "notEquals" | "in" | "notIn"

// Date operators
export type DateOperator = "before" | "after" | "between" | "equals"

// Union of all operators
export type FilterOperator =
  | TextOperator
  | NumberOperator
  | SelectOperator
  | DateOperator

// Get operator label from translations
// Usage: getOperatorLabel(operator, t.queryBuilder)
export function getOperatorLabel(
  operator: FilterOperator,
  translations: any
): string {
  const labelMap: Record<FilterOperator, string> = {
    // Text
    contains: translations.contains || "Contains",
    doesNotContain: translations.doesNotContain || "Does not contain",
    startsWith: translations.startsWith || "Starts with",
    endsWith: translations.endsWith || "Ends with",
    equals: translations.equals || "Equals",
    notEquals: translations.notEquals || "Not equals",
    isEmpty: translations.isEmpty || "Is empty",
    isNotEmpty: translations.isNotEmpty || "Is not empty",
    inList: translations.inList || "In list (Bulk)",
    notInList: translations.notInList || "Not in list (Bulk)",
    // Number
    greaterThan: translations.greaterThan || "Greater than",
    lessThan: translations.lessThan || "Less than",
    between: translations.between || "Between",
    // Select
    in: translations.in || "In (Multiple)",
    notIn: translations.notIn || "Not in (Multiple)",
    // Date
    before: translations.before || "Before",
    after: translations.after || "After",
  }
  return labelMap[operator] || operator
}

// Column configuration
export interface ColumnConfig {
  field: string
  label: string
  type: ColumnType
  operators: FilterOperator[]
  options?: SelectOption[] // Only for select type
  placeholder?: string
}

export interface SelectOption {
  label: string
  value: string
}

// Filter value types
export type FilterValue =
  | string
  | number
  | string[] // For multi-select or bulk list
  | { min: number | string; max: number | string } // For between
  | null // For isEmpty/isNotEmpty

// Single filter
export interface Filter {
  field: string
  operator: FilterOperator
  value: FilterValue
}

// Query output (POST body format)
export interface QueryOutput {
  logic: "AND" | "OR"
  filters: Filter[]
}

// Operators by column type
export const operatorsByType: Record<ColumnType, FilterOperator[]> = {
  text: [
    "contains",
    "doesNotContain",
    "startsWith",
    "endsWith",
    "equals",
    "notEquals",
    "isEmpty",
    "isNotEmpty",
    "inList",
    "notInList",
  ],
  number: [
    "equals",
    "notEquals",
    "greaterThan",
    "lessThan",
    "between",
    "inList",
    "notInList",
  ],
  select: ["equals", "notEquals", "in", "notIn"],
  date: ["before", "after", "between", "equals"],
}

// Check if operator needs value input
export function operatorNeedsValue(operator: FilterOperator): boolean {
  return !["isEmpty", "isNotEmpty"].includes(operator)
}

// Check if operator needs bulk input (textarea)
export function operatorNeedsBulkInput(operator: FilterOperator): boolean {
  return ["inList", "notInList"].includes(operator)
}

// Check if operator needs between input (min/max)
export function operatorNeedsBetweenInput(operator: FilterOperator): boolean {
  return operator === "between"
}

// Check if operator needs multi-select
export function operatorNeedsMultiSelect(operator: FilterOperator): boolean {
  return ["in", "notIn"].includes(operator)
}

// Parse bulk text input into array
export function parseBulkInput(text: string): string[] {
  if (!text || !text.trim()) return []

  // Split by newlines, commas, or semicolons
  const delimiters = /[\n,;]+/
  const items = text
    .split(delimiters)
    .map((item) => item.trim())
    .filter((item) => item.length > 0)

  // Remove duplicates
  return [...new Set(items)]
}
