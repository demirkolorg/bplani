"use client"

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  PaginationState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ArrowUpDown, Check, ChevronsUpDown, Filter, X, Columns3, Download } from "lucide-react"
import * as XLSX from "xlsx"

import { Button } from "@/components/ui/button"
import { useLocale } from "@/components/providers/locale-provider"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { interpolate } from "@/locales"
import type { ColumnFilterState } from "@/lib/data-table/column-filter-config"
import { fuzzyFilter, getSearchableText } from "@/lib/data-table/fuzzy-filter"

// Deep search function for nested objects
function deepSearch(obj: unknown, searchTerm: string, booleanLabels?: { yes: string; no: string; active: string; inactive: string; exists: string; notExists: string }): boolean {
  if (obj === null || obj === undefined) return false

  if (typeof obj === "string") {
    return obj.toLowerCase().includes(searchTerm)
  }

  if (typeof obj === "number") {
    return String(obj).includes(searchTerm)
  }

  if (typeof obj === "boolean") {
    // Boolean için evet/hayır, aktif/pasif araması
    if (booleanLabels) {
      const boolText = obj
        ? `${booleanLabels.yes} ${booleanLabels.active} ${booleanLabels.exists}`.toLowerCase()
        : `${booleanLabels.no} ${booleanLabels.inactive} ${booleanLabels.notExists}`.toLowerCase()
      return boolText.includes(searchTerm)
    }
    return false
  }

  if (Array.isArray(obj)) {
    return obj.some((item) => deepSearch(item, searchTerm, booleanLabels))
  }

  if (typeof obj === "object") {
    // Skip only ID fields and timestamps
    const skipKeys = ["id", "createdAt", "updatedAt", "createdUserId", "updatedUserId"]
    return Object.entries(obj).some(([key, value]) => {
      if (skipKeys.includes(key)) return false
      // _count objelerini de ara (sayısal değerler)
      if (key === "_count" && typeof value === "object" && value !== null) {
        return Object.values(value).some(v => String(v).includes(searchTerm))
      }
      return deepSearch(value, searchTerm, booleanLabels)
    })
  }

  return false
}

// Search computed/formatted values (dates, calculated fields, enums)
function searchComputedValues(
  obj: Record<string, unknown>,
  searchTerm: string,
  translations?: {
    labelMaps: {
      durum: Record<string, string>
      tip: Record<string, string>
      rol: Record<string, string>
    }
    booleanLabels: Record<string, string>
    system: string
    daysRemaining: string
    expired: string
    neverLoggedIn: string
  }
): boolean {
  // Format and search date fields
  const dateFields = ["baslamaTarihi", "bitisTarihi", "tarih", "tetikTarihi", "lastLoginAt"]
  for (const field of dateFields) {
    if (obj[field]) {
      const date = new Date(obj[field] as string)
      if (!isNaN(date.getTime())) {
        const formatted = date.toLocaleDateString("tr-TR")
        if (formatted.includes(searchTerm)) return true
      }
    }
  }

  // Calculate and search "kalan gün"
  if (obj.bitisTarihi && translations) {
    const date = new Date(obj.bitisTarihi as string)
    const now = new Date()
    const daysLeft = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    const daysStr = String(daysLeft)
    const searchText = daysLeft <= 0
      ? translations.expired.toLowerCase()
      : `${daysLeft} ${translations.daysRemaining}`.toLowerCase()
    if (daysStr.includes(searchTerm) || searchText.includes(searchTerm)) return true
  }

  // Search enum fields with Turkish labels
  if (translations) {
    for (const [field, map] of Object.entries(translations.labelMaps)) {
      if (obj[field]) {
        const labelText = map[obj[field] as string] || String(obj[field]).toLowerCase()
        if (labelText.includes(searchTerm)) return true
      }
    }
  }

  // Search boolean fields with Turkish labels
  const boolFields = ["isActive", "isPaused", "isPrimary", "pio", "asli"]
  for (const field of boolFields) {
    if (field in obj && translations) {
      const val = obj[field] as boolean
      const labels = translations.booleanLabels
      const labelText = val
        ? `${labels.active || ""} ${labels.yes || ""} ${labels.exists || ""}`.toLowerCase()
        : `${labels.inactive || ""} ${labels.no || ""} ${labels.notExists || ""}`.toLowerCase()
      if (labelText.includes(searchTerm)) return true
    }
  }

  // Search nested kisi (takip, alarm, numara tablolarında)
  const gsm = obj.gsm as Record<string, unknown> | undefined
  const kisi = (gsm?.kisi || obj.kisi) as Record<string, unknown> | undefined
  if (kisi) {
    const fullName = `${kisi.ad || ""} ${kisi.soyad || ""}`.toLowerCase()
    if (fullName.includes(searchTerm)) return true
    if (kisi.tc && String(kisi.tc).includes(searchTerm)) return true
  }

  // Search createdUser/olusturan
  const createdUser = obj.createdUser as Record<string, unknown> | undefined
  if (createdUser) {
    const userName = `${createdUser.ad || ""} ${createdUser.soyad || ""}`.toLowerCase()
    if (userName.includes(searchTerm)) return true
  }

  // Search katilimcilar (tanitim tablosu)
  const katilimcilar = obj.katilimcilar as Array<Record<string, unknown>> | undefined
  if (katilimcilar && Array.isArray(katilimcilar)) {
    for (const k of katilimcilar) {
      const kisiData = k.kisi as Record<string, unknown> | undefined
      if (kisiData) {
        const name = `${kisiData.ad || ""} ${kisiData.soyad || ""}`.toLowerCase()
        if (name.includes(searchTerm)) return true
      }
    }
  }

  // Search mahalle/ilce/il (adres, tanitim tablolarında)
  const mahalle = obj.mahalle as Record<string, unknown> | undefined
  if (mahalle) {
    if (deepSearch(mahalle.ad, searchTerm)) return true
    const ilce = mahalle.ilce as Record<string, unknown> | undefined
    if (ilce) {
      if (deepSearch(ilce.ad, searchTerm)) return true
      const il = ilce.il as Record<string, unknown> | undefined
      if (il && deepSearch(il.ad, searchTerm)) return true
    }
  }

  return false
}

// Apply filter logic based on operator and type
function applyFilterLogic(
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

type TableDensity = "compact" | "normal" | "wide"

const densityStyles: Record<TableDensity, { header: string; cell: string }> = {
  compact: {
    header: "h-8 px-2 text-xs",
    cell: "px-2 py-1 text-xs",
  },
  normal: {
    header: "h-10 px-3 text-sm",
    cell: "px-3 py-2 text-sm",
  },
  wide: {
    header: "h-12 px-4 text-sm",
    cell: "p-4 text-sm",
  },
}

export interface SortOption {
  label: string
  value: string
  column: string
  direction: "asc" | "desc"
}

// Common sort options for date fields - these will be translated in the component
export const commonSortOptions: SortOption[] = [
  { label: "createdAt-desc", value: "createdAt-desc", column: "createdAt", direction: "desc" },
  { label: "createdAt-asc", value: "createdAt-asc", column: "createdAt", direction: "asc" },
  { label: "updatedAt-desc", value: "updatedAt-desc", column: "updatedAt", direction: "desc" },
  { label: "updatedAt-asc", value: "updatedAt-asc", column: "updatedAt", direction: "asc" },
]

export interface ColumnVisibilityLabels {
  [key: string]: string
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  searchPlaceholder?: string
  pageSize?: number
  density?: TableDensity
  isLoading?: boolean
  sortOptions?: SortOption[]
  defaultSort?: { column: string; direction: "asc" | "desc" } | null
  onRowClick?: (row: TData) => void
  rowWrapper?: (row: TData, children: React.ReactNode) => React.ReactNode
  columnVisibilityLabels?: ColumnVisibilityLabels
  defaultColumnVisibility?: VisibilityState
  headerActions?: React.ReactNode
  /** Default column filters (from preferences) */
  defaultColumnFilters?: ColumnFiltersState
  /** Callback when column visibility changes */
  onColumnVisibilityChange?: (visibility: VisibilityState) => void
  /** Callback when sorting changes */
  onSortChange?: (column: string, direction: "asc" | "desc") => void
  /** Callback when page size changes */
  onPageSizeChange?: (size: number) => void
  /** Callback when column filters change */
  onColumnFiltersChange?: (filters: ColumnFiltersState) => void
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchPlaceholder,
  pageSize = 20,
  density = "compact",
  isLoading,
  sortOptions = [],
  defaultSort,
  onRowClick,
  rowWrapper,
  columnVisibilityLabels = {},
  defaultColumnVisibility,
  defaultColumnFilters,
  headerActions,
  onColumnVisibilityChange,
  onSortChange,
  onPageSizeChange,
  onColumnFiltersChange,
}: DataTableProps<TData, TValue>) {
  const styles = densityStyles[density]
  const { t } = useLocale()

  // Label maps for enum fields
  const labelMaps = {
    durum: t.enums.takipDurumu,
    tip: t.enums.alarmTipi,
    rol: t.enums.personelRol,
  }

  // Get translated common sort option labels
  const getCommonSortLabel = (value: string): string => {
    switch (value) {
      case "createdAt-desc": return t.table.addedNewOld
      case "createdAt-asc": return t.table.addedOldNew
      case "updatedAt-desc": return t.table.updatedNewOld
      case "updatedAt-asc": return t.table.updatedOldNew
      default: return value
    }
  }

  // Use translated placeholder if not provided
  const effectiveSearchPlaceholder = searchPlaceholder ?? t.table.searchPlaceholder

  // Combine common and custom sort options
  const allSortOptions = [...sortOptions, ...commonSortOptions]

  // Initialize sorting state with default sort (only if provided)
  const initialSort: SortingState = defaultSort
    ? [{ id: defaultSort.column, desc: defaultSort.direction === "desc" }]
    : []

  const [sorting, setSorting] = React.useState<SortingState>(initialSort)
  const [selectedSort, setSelectedSort] = React.useState<string>(
    defaultSort
      ? `${defaultSort.column}-${defaultSort.direction}`
      : ""
  )
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    defaultColumnFilters || []
  )
  // Hide sort-only columns (date fields) by default, merge with provided defaults
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({
    createdAt: false,
    updatedAt: false,
    ...defaultColumnVisibility,
  })
  const [rowSelection, setRowSelection] = React.useState({})
  const [globalFilterInput, setGlobalFilterInput] = React.useState("")
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize,
  })

  const [sortOpen, setSortOpen] = React.useState(false)

  // Check if any column filter is active
  const hasActiveColumnFilters = columnFilters.length > 0

  // Advanced filter change handler (TanStack native)
  const handleAdvancedFilterChange = (columnId: string, filter: ColumnFilterState | null) => {
    setColumnFilters((prev) => {
      const newFilters = filter === null || filter.value === null
        ? prev.filter(f => f.id !== columnId)
        : [...prev.filter(f => f.id !== columnId), { id: columnId, value: filter }]

      return newFilters
    })
  }

  const clearAllColumnFilters = () => {
    setColumnFilters([])
  }

  // Notify parent when filters change (after render cycle, skip initial render)
  const isInitialMount = React.useRef(true)
  const prevFiltersRef = React.useRef<ColumnFiltersState>(columnFilters)

  React.useEffect(() => {
    // Skip initial mount (when defaultColumnFilters is loaded)
    if (isInitialMount.current) {
      isInitialMount.current = false
      prevFiltersRef.current = columnFilters
      return
    }

    // Only notify on actual changes
    if (JSON.stringify(prevFiltersRef.current) !== JSON.stringify(columnFilters)) {
      prevFiltersRef.current = columnFilters
      onColumnFiltersChange?.(columnFilters)
    }
  }, [columnFilters, onColumnFiltersChange])

  const handleSortChange = (value: string) => {
    setSelectedSort(value)
    setSortOpen(false)
    const option = allSortOptions.find((opt) => opt.value === value)
    if (option) {
      setSorting([{ id: option.column, desc: option.direction === "desc" }])
      onSortChange?.(option.column, option.direction)
    }
  }

  const selectedSortLabel = selectedSort
    ? (() => {
        const opt = allSortOptions.find((opt) => opt.value === selectedSort)
        if (!opt) return t.table.sortBy
        // Check if it's a common sort option
        if (commonSortOptions.some((c) => c.value === opt.value)) {
          return getCommonSortLabel(opt.value)
        }
        return opt.label
      })()
    : t.table.sortBy

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilterInput,
    // TanStack native fuzzy filter
    globalFilterFn: (row, columnId, value) => {
      const searchTerm = String(value || "").toLowerCase().trim()
      if (!searchTerm) return true

      // Get all searchable text from row
      const searchableText = getSearchableText(row, t)

      // Fuzzy match using match-sorter
      return searchableText.includes(searchTerm)
    },
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter: globalFilterInput,
      pagination,
    },
  })

  const totalRows = table.getFilteredRowModel().rows.length
  const currentPage = pagination.pageIndex + 1
  const totalPages = table.getPageCount()
  const startRow = pagination.pageIndex * pagination.pageSize + 1
  const endRow = Math.min(currentPage * pagination.pageSize, totalRows)

  // Excel Export fonksiyonu
  const [isExporting, setIsExporting] = React.useState(false)

  const exportToExcel = React.useCallback(() => {
    setIsExporting(true)

    try {
      // Görünen sütunları al
      const visibleColumns = table.getAllColumns().filter(col => col.getIsVisible() && col.id !== "actions")

      // Header satırını oluştur
      const headers = visibleColumns.map(col => {
        const label = columnVisibilityLabels[col.id]
        if (label) return label

        // Column header'ını render et
        const headerValue = col.columnDef.header
        if (typeof headerValue === "string") return headerValue
        return col.id
      })

      // Filtrelenmiş tüm satırları al
      const rows = table.getFilteredRowModel().rows

      // Veri satırlarını oluştur
      const excelData = rows.map(row => {
        const rowData: Record<string, unknown> = {}
        const original = row.original as Record<string, unknown>

        visibleColumns.forEach((col, idx) => {
          const columnId = col.id
          const headerName = headers[idx]
          let value: unknown = row.getValue(columnId)

          // Özel formatlama işlemleri
          // Tarih alanları
          if (["baslamaTarihi", "bitisTarihi", "tarih", "tetikTarihi", "createdAt", "updatedAt", "lastLoginAt"].includes(columnId)) {
            if (value) {
              const date = new Date(value as string)
              if (!isNaN(date.getTime())) {
                value = date.toLocaleDateString("tr-TR")
              }
            }
          }
          // Kalan gün
          else if (columnId === "kalanGun") {
            const bitisTarihi = original.bitisTarihi || (original.takipler as Array<Record<string, unknown>>)?.[0]?.bitisTarihi
            if (bitisTarihi) {
              const date = new Date(bitisTarihi as string)
              const now = new Date()
              const daysLeft = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
              value = daysLeft <= 0 ? t.common.expiredDaysAgo.replace("{days}", String(Math.abs(daysLeft))) : t.common.daysBefore.replace("{days}", String(daysLeft))
            } else {
              value = "-"
            }
          }
          // Boolean alanlar
          else if (typeof value === "boolean") {
            value = value ? t.common.yes : t.common.no
          }
          // Kişi bilgisi (nested)
          else if (columnId === "kisi" || columnId === "kisiAdSoyad" || columnId === "musteri") {
            const gsm = original.gsm as Record<string, unknown> | undefined
            const kisi = (gsm?.kisi || original.kisi) as Record<string, unknown> | undefined
            if (kisi) {
              value = `${kisi.ad || ""} ${kisi.soyad || ""}`.trim()
            } else {
              value = "-"
            }
          }
          // Ad Soyad
          else if (columnId === "adSoyad") {
            value = `${original.ad || ""} ${original.soyad || ""}`.trim()
          }
          // GSM numarası
          else if (columnId === "gsm" || columnId === "numara") {
            if (original.numara) {
              value = original.numara
            } else if (original.gsm) {
              const gsmObj = original.gsm as Record<string, unknown>
              value = gsmObj.numara || gsmObj
            }
          }
          // Durum enum'ları
          else if (columnId === "durum") {
            const durumVal = original.durum as string | undefined
            if (durumVal) {
              value = labelMaps.durum[durumVal as keyof typeof labelMaps.durum] || durumVal
            }
          }
          // Tip enum'ları
          else if (columnId === "tip") {
            const tipVal = original.tip as string | undefined
            if (tipVal) {
              value = labelMaps.tip[tipVal as keyof typeof labelMaps.tip] || tipVal
            }
          }
          // Rol enum'ları
          else if (columnId === "rol") {
            const rolVal = original.rol as string | undefined
            if (rolVal) {
              value = labelMaps.rol[rolVal as keyof typeof labelMaps.rol] || rolVal
            }
          }
          // TT (müşteri/aday)
          else if (columnId === "tt" || columnId === "kisiTip") {
            let ttVal: boolean | undefined
            if (columnId === "kisiTip") {
              const kisi = original.kisi as Record<string, unknown> | undefined
              ttVal = kisi?.tt as boolean | undefined
            } else {
              ttVal = original.tt as boolean | undefined
            }
            value = ttVal ? t.common.customer : t.common.candidate
          }
          // Count alanları
          else if (["alarmlar", "tanitim", "not", "aktivite", "katilimciSayisi"].includes(columnId)) {
            const countObj = original._count as Record<string, number> | undefined
            if (columnId === "katilimciSayisi") {
              value = (original.katilimcilar as unknown[])?.length || 0
            } else if (columnId === "aktivite" && countObj) {
              value = Object.values(countObj).reduce((a, b) => a + b, 0)
            } else if (countObj) {
              const countField = columnId === "tanitim" ? "tanitimlar" : columnId === "not" ? "notlar" : columnId
              value = countObj[countField] || 0
            }
          }
          // Katılımcılar (tanitim)
          else if (columnId === "katilimcilar") {
            const katilimcilar = original.katilimcilar as Array<Record<string, unknown>> | undefined
            if (katilimcilar && katilimcilar.length > 0) {
              const names = katilimcilar.map(k => {
                const kisiData = k.kisi as Record<string, unknown> | undefined
                return kisiData ? `${kisiData.ad || ""} ${kisiData.soyad || ""}`.trim() : ""
              }).filter(Boolean)
              value = names.join(", ")
            } else {
              value = "-"
            }
          }
          // Oluşturan (personel)
          else if (columnId === "olusturan") {
            const createdUser = original.createdUser as Record<string, unknown> | undefined
            value = createdUser ? `${createdUser.ad || ""} ${createdUser.soyad || ""}`.trim() : t.common.system
          }
          // Adres bilgileri
          else if (columnId === "adres") {
            const mahalle = original.mahalle as Record<string, unknown> | undefined
            if (mahalle) {
              const ilce = mahalle.ilce as Record<string, unknown> | undefined
              const parts = [mahalle.ad]
              if (original.adresDetay) parts.push(original.adresDetay)
              if (ilce) parts.push(ilce.ad)
              value = parts.filter(Boolean).join(", ")
            } else {
              value = "-"
            }
          }
          // HTML temizleme (notlar, faaliyet)
          else if (["notlar", "faaliyet"].includes(columnId) && typeof value === "string") {
            value = value.replace(/<[^>]*>/g, "").trim()
          }

          // Null/undefined kontrolü
          rowData[headerName] = value ?? "-"
        })

        return rowData
      })

      // Excel workbook oluştur
      const worksheet = XLSX.utils.json_to_sheet(excelData)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, "Data")

      // Dosya adı oluştur (tarih ile)
      const timestamp = new Date().toISOString().slice(0, 10)
      const filename = `export_${timestamp}.xlsx`

      // Dosyayı indir
      XLSX.writeFile(workbook, filename)
    } catch (error) {
      console.error("Excel export error:", error)
    } finally {
      setIsExporting(false)
    }
  }, [table, columnVisibilityLabels])

  return (
    <div className="w-full">
      {/* Search and Controls */}
      <div className="flex items-center justify-between gap-4 py-4">
        <Input
          placeholder={effectiveSearchPlaceholder}
          value={globalFilterInput}
          onChange={(e) => setGlobalFilterInput(e.target.value)}
          className="max-w-sm"
        />
        <div className="flex items-center gap-2">
          {headerActions}
          {/* Excel Export Button */}
          <Button
            variant="outline"
            size="icon"
            onClick={exportToExcel}
            disabled={isExporting || totalRows === 0}
            title={t.table.exportToExcel}
          >
            {isExporting ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            ) : (
              <Download className="h-4 w-4" />
            )}
          </Button>

          {/* Clear All Filters Button */}
          {hasActiveColumnFilters && (
            <Button
              variant="ghost"
              size="icon"
              onClick={clearAllColumnFilters}
              title={t.table.clearFilters || "Tüm filtreleri temizle"}
            >
              <X className="h-4 w-4" />
            </Button>
          )}

          {/* Column Visibility Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" title={t.table.visibleColumns}>
                <Columns3 className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              <DropdownMenuLabel>{t.table.visibleColumns}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {table
                .getAllColumns()
                .filter((column) => {
                  // Filter out internal columns (those without proper headers or hidden by design)
                  const columnId = column.id
                  // Skip internal columns that shouldn't be toggled
                  if (["createdAt", "updatedAt", "lastLoginAt", "ad", "soyad"].includes(columnId)) {
                    return false
                  }
                  // Only show columns that have a defined label or can be toggled
                  return column.getCanHide()
                })
                .map((column) => {
                  const label = columnVisibilityLabels[column.id] || column.id
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) => {
                        column.toggleVisibility(!!value)
                        // Notify parent of visibility change
                        const newVisibility = {
                          ...columnVisibility,
                          [column.id]: !!value,
                        }
                        onColumnVisibilityChange?.(newVisibility)
                      }}
                    >
                      {label}
                    </DropdownMenuCheckboxItem>
                  )
                })}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Sort Dropdown */}
          <Popover open={sortOpen} onOpenChange={setSortOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="icon" title={selectedSortLabel || t.table.sortBy}>
                <ArrowUpDown className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[240px] p-0" align="end">
              <Command>
                <CommandInput placeholder={`${t.table.sortBy}...`} />
                <CommandList>
                  <CommandEmpty>{t.table.noSortFound}</CommandEmpty>
                  {sortOptions.length > 0 && (
                    <CommandGroup heading={t.table.byField}>
                      {sortOptions.map((option) => (
                        <CommandItem
                          key={option.value}
                          value={option.value}
                          onSelect={handleSortChange}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedSort === option.value ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {option.label}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}
                  <CommandGroup heading={t.table.byDate}>
                    {commonSortOptions.map((option) => (
                      <CommandItem
                        key={option.value}
                        value={option.value}
                        onSelect={handleSortChange}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedSort === option.value ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {getCommonSortLabel(option.value)}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <table className="w-full caption-bottom text-sm">
          <thead className="bg-primary/5 [&_tr]:border-b">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b transition-colors hover:bg-muted/50">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className={cn(
                      "text-left align-middle font-bold text-muted-foreground [&:has([role=checkbox])]:pr-0",
                      styles.header
                    )}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="[&_tr:last-child]:border-0">
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="h-24 text-center">
                  <div className="flex items-center justify-center">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    <span className="ml-2">{t.common.loading}</span>
                  </div>
                </td>
              </tr>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => {
                const cells = row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className={cn("align-middle [&:has([role=checkbox])]:pr-0", styles.cell)}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))

                // If rowWrapper is provided, use it (for context menu support)
                if (rowWrapper) {
                  return rowWrapper(row.original, cells)
                }

                // Default row rendering
                return (
                  <tr
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className={cn(
                      "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
                      onRowClick && "cursor-pointer"
                    )}
                    onClick={() => onRowClick?.(row.original)}
                  >
                    {cells}
                  </tr>
                )
              })
            ) : (
              <tr>
                <td colSpan={columns.length} className="h-24 text-center">
                  {t.table.noRecords}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          {totalRows > 0 ? (
            <span>
              {interpolate(t.table.showingRecords, { total: totalRows, start: startRow, end: endRow })}
            </span>
          ) : (
            <span>{t.table.noRecordsAlt}</span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Select
            value={String(pagination.pageSize)}
            onValueChange={(value) => {
              const newSize = Number(value)
              table.setPageSize(newSize)
              onPageSizeChange?.(newSize)
            }}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 20, 30, 50, 100].map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex items-center space-x-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="flex h-8 items-center justify-center px-3 text-sm">
              {currentPage} / {totalPages || 1}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
