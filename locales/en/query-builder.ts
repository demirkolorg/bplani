import type { QueryBuilderTranslations } from "@/types/locale"

export const queryBuilder: QueryBuilderTranslations = {
  // Page
  pageTitle: "Advanced Search",
  pageDescription: "Search with detailed filtering criteria",

  // Components
  title: "Advanced Filtering",
  description: "Define your search criteria",
  submitLabel: "Show Results",
  addFilter: "Add Filter",
  addGroup: "Add Group",
  removeFilter: "Remove Filter",
  removeGroup: "Delete Group",
  clearAll: "Clear All",

  // Logic
  logic: "Logic:",
  logicAnd: "AND (All conditions)",
  logicOr: "OR (Any condition)",
  and: "AND",
  or: "OR",
  combinator: "Combinator:",

  // Status
  activeFilters: "{count} active filters",
  noFilters: "Add at least one filter",
  searching: "Searching...",

  // Operators - Text
  contains: "Contains",
  doesNotContain: "Does not contain",
  startsWith: "Starts with",
  endsWith: "Ends with",
  equals: "Equals",
  notEquals: "Not equals",
  isEmpty: "Is empty",
  isNotEmpty: "Is not empty",
  inList: "In list (Bulk)",
  notInList: "Not in list (Bulk)",

  // Operators - Number
  greaterThan: "Greater than",
  lessThan: "Less than",
  between: "Between",

  // Operators - Select
  in: "In (Multiple)",
  notIn: "Not in (Multiple)",

  // Operators - Date
  before: "Before",
  after: "After",

  // Input
  selectColumn: "Select column",
  selectOperator: "Select operator",
  enterValue: "Enter value...",
  noValueNeeded: "No value needed",

  // Bulk input
  bulkPaste: "Paste bulk values...",
  bulkPasteTitle: "Bulk Value Input",
  bulkPasteDescription: "Enter one value per line or paste from Excel",
  bulkPastePlaceholder: "Value1\nValue2\nValue3...",
  uniqueValues: "{count} unique values",
  valuesSelected: "{count} values selected",
  clear: "Clear",
  apply: "Apply",

  // Between input
  min: "Min",
  max: "Max",

  // Select input
  selectOption: "Select option...",
  search: "Search...",
  noResults: "No results found.",

  // Results
  resultsTitle: "Results",
  resultsCount: "{count} records found",
  noSearchYet: "No search performed yet",
  noResultsFound: "No results found",
  searchInstructions: "Use the criteria above to search",

  // Errors
  searchError: "An error occurred during search",

  // Debug
  debugTitle: "Last Query (Debug)",

  // Saved Queries
  savedQueries: "Saved Queries",
  saveQuery: "Save Query",
  loadQuery: "Load Query",
  deleteQuery: "Delete Query",
  queryName: "Query Name",
  queryNamePlaceholder: "e.g. Active Targets",
  saveSuccess: "Query saved successfully",
  loadSuccess: "Query loaded",
  deleteSuccess: "Query deleted",
  noSavedQueries: "No saved queries yet",

  // Export
  export: "Export",
  exportExcel: "Export to Excel",
  exportCsv: "Export to CSV",
  exportJson: "Export to JSON",
  exporting: "Exporting...",
  exportSuccess: "{count} records exported",
  exportError: "Export error",
}
