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
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ArrowUpDown, Check, ChevronsUpDown, Filter, X } from "lucide-react"

import { Button } from "@/components/ui/button"
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
import { cn } from "@/lib/utils"

// Deep search function for nested objects
function deepSearch(obj: unknown, searchTerm: string): boolean {
  if (obj === null || obj === undefined) return false

  if (typeof obj === "string") {
    return obj.toLowerCase().includes(searchTerm)
  }

  if (typeof obj === "number") {
    return String(obj).includes(searchTerm)
  }

  if (typeof obj === "boolean") {
    return false
  }

  if (Array.isArray(obj)) {
    return obj.some((item) => deepSearch(item, searchTerm))
  }

  if (typeof obj === "object") {
    // Skip internal fields and dates
    const skipKeys = ["id", "createdAt", "updatedAt", "createdUserId", "updatedUserId", "_count"]
    return Object.entries(obj).some(([key, value]) => {
      if (skipKeys.includes(key)) return false
      return deepSearch(value, searchTerm)
    })
  }

  return false
}

// Search computed/formatted values (dates, calculated fields, enums)
function searchComputedValues(obj: Record<string, unknown>, searchTerm: string): boolean {
  // Format and search date fields
  const dateFields = ["baslamaTarihi", "bitisTarihi"]
  for (const field of dateFields) {
    if (obj[field]) {
      const date = new Date(obj[field] as string)
      const formatted = date.toLocaleDateString("tr-TR")
      if (formatted.includes(searchTerm)) return true
    }
  }

  // Calculate and search "kalan gün"
  if (obj.bitisTarihi) {
    const date = new Date(obj.bitisTarihi as string)
    const now = new Date()
    const daysLeft = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    const daysStr = String(daysLeft)
    const searchText = daysLeft <= 0 ? "süresi doldu" : `${daysLeft} gün`
    if (daysStr.includes(searchTerm) || searchText.includes(searchTerm)) return true
  }

  // Search durum with Turkish labels
  if (obj.durum) {
    const durumMap: Record<string, string> = {
      UZATILACAK: "uzatılacak",
      DEVAM_EDECEK: "devam edecek",
      SONLANDIRILACAK: "sonlandırılacak",
      UZATILDI: "uzatıldı",
    }
    const durumText = durumMap[obj.durum as string] || String(obj.durum).toLowerCase()
    if (durumText.includes(searchTerm)) return true
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

// Common sort options for date fields
export const commonSortOptions: SortOption[] = [
  { label: "Eklenme (Yeni → Eski)", value: "createdAt-desc", column: "createdAt", direction: "desc" },
  { label: "Eklenme (Eski → Yeni)", value: "createdAt-asc", column: "createdAt", direction: "asc" },
  { label: "Güncelleme (Yeni → Eski)", value: "updatedAt-desc", column: "updatedAt", direction: "desc" },
  { label: "Güncelleme (Eski → Yeni)", value: "updatedAt-asc", column: "updatedAt", direction: "asc" },
]

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  searchPlaceholder?: string
  pageSize?: number
  density?: TableDensity
  isLoading?: boolean
  sortOptions?: SortOption[]
  defaultSort?: { column: string; direction: "asc" | "desc" }
  onRowClick?: (row: TData) => void
  rowWrapper?: (row: TData, children: React.ReactNode) => React.ReactNode
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchPlaceholder = "Ara...",
  pageSize = 20,
  density = "compact",
  isLoading,
  sortOptions = [],
  defaultSort,
  onRowClick,
  rowWrapper,
}: DataTableProps<TData, TValue>) {
  const styles = densityStyles[density]

  // Combine common and custom sort options
  const allSortOptions = [...sortOptions, ...commonSortOptions]

  // Initialize sorting state with default sort
  const initialSort: SortingState = defaultSort
    ? [{ id: defaultSort.column, desc: defaultSort.direction === "desc" }]
    : [{ id: "createdAt", desc: true }]

  const [sorting, setSorting] = React.useState<SortingState>(initialSort)
  const [selectedSort, setSelectedSort] = React.useState<string>(
    defaultSort
      ? `${defaultSort.column}-${defaultSort.direction}`
      : "createdAt-desc"
  )
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  // Hide sort-only columns (date fields, ad, soyad) by default
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({
    createdAt: false,
    updatedAt: false,
    ad: false,
    soyad: false,
  })
  const [rowSelection, setRowSelection] = React.useState({})
  const [globalFilterInput, setGlobalFilterInput] = React.useState("")
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize,
  })

  const [sortOpen, setSortOpen] = React.useState(false)
  const [showColumnFilters, setShowColumnFilters] = React.useState(false)
  const [columnFilterValues, setColumnFilterValues] = React.useState<Record<string, string>>({})

  // Combined filter state to trigger re-filtering when column filters change
  const globalFilter = React.useMemo(
    () => ({ search: globalFilterInput, columns: columnFilterValues }),
    [globalFilterInput, columnFilterValues]
  )

  // Check if any column filter is active
  const hasActiveColumnFilters = Object.values(columnFilterValues).some((v) => v.trim() !== "")

  const handleColumnFilterChange = (columnId: string, value: string) => {
    setColumnFilterValues((prev) => ({ ...prev, [columnId]: value }))
  }

  const clearAllColumnFilters = () => {
    setColumnFilterValues({})
  }

  const handleSortChange = (value: string) => {
    setSelectedSort(value)
    setSortOpen(false)
    const option = allSortOptions.find((opt) => opt.value === value)
    if (option) {
      setSorting([{ id: option.column, desc: option.direction === "desc" }])
    }
  }

  const selectedSortLabel = allSortOptions.find((opt) => opt.value === selectedSort)?.label || "Sıralama"

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
    globalFilterFn: (row, _columnId, filterValue) => {
      const { search, columns } = filterValue as { search: string; columns: Record<string, string> }

      // Global search
      const searchTerm = (search || "").toLowerCase().trim()
      if (searchTerm) {
        const original = row.original as Record<string, unknown>
        const foundInData = deepSearch(original, searchTerm)
        const foundInComputed = searchComputedValues(original, searchTerm)
        if (!foundInData && !foundInComputed) {
          return false
        }
      }

      // Column filters (AND logic)
      const original = row.original as Record<string, unknown>
      for (const [columnId, filterVal] of Object.entries(columns || {})) {
        const term = (filterVal || "").toLowerCase().trim()
        if (!term) continue

        let matched = false

        // Handle specific columns
        if (columnId === "gsm") {
          // Müşteri tablosu: gsmler array, Takip tablosu: gsm object
          if (original.gsmler) {
            matched = deepSearch(original.gsmler, term)
          } else if (original.gsm) {
            matched = deepSearch(original.gsm, term)
          }
        } else if (columnId === "adres" && original.adresler) {
          matched = deepSearch(original.adresler, term)
        } else if (columnId === "adSoyad") {
          const fullName = `${original.ad || ""} ${original.soyad || ""}`.toLowerCase()
          matched = fullName.includes(term)
        } else if (columnId === "musteri") {
          // Takip tablosu: gsm.musteri
          const gsm = original.gsm as Record<string, unknown> | undefined
          const musteri = gsm?.musteri as Record<string, unknown> | undefined
          if (musteri) {
            const fullName = `${musteri.ad || ""} ${musteri.soyad || ""}`.toLowerCase()
            matched = fullName.includes(term)
          }
        } else if (columnId === "tc" && original.tc) {
          matched = String(original.tc).toLowerCase().includes(term)
        } else if (columnId === "pio") {
          const pioVal = original.pio ? "evet" : "hayır"
          matched = pioVal.includes(term)
        } else if (columnId === "asli") {
          const asliVal = original.asli ? "evet" : "hayır"
          matched = asliVal.includes(term)
        } else if (columnId === "baslamaTarihiDisplay" && original.baslamaTarihi) {
          // Tarih formatı: DD.MM.YYYY
          const date = new Date(original.baslamaTarihi as string)
          const formatted = date.toLocaleDateString("tr-TR")
          matched = formatted.includes(term)
        } else if (columnId === "bitisTarihiDisplay" && original.bitisTarihi) {
          const date = new Date(original.bitisTarihi as string)
          const formatted = date.toLocaleDateString("tr-TR")
          matched = formatted.includes(term)
        } else if (columnId === "kalanGun" && original.bitisTarihi) {
          const date = new Date(original.bitisTarihi as string)
          const now = new Date()
          const daysLeft = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
          // "90", "90 gün", "süresi doldu" gibi aramalara izin ver
          const daysStr = String(daysLeft)
          const searchText = daysLeft <= 0 ? "süresi doldu" : `${daysLeft} gün`
          matched = daysStr.includes(term) || searchText.includes(term)
        } else if (columnId === "durum" && original.durum) {
          // Durum araması: UZATILACAK -> "Uzatılacak" vb.
          const durumMap: Record<string, string> = {
            UZATILACAK: "uzatılacak",
            DEVAM_EDECEK: "devam edecek",
            SONLANDIRILACAK: "sonlandırılacak",
            UZATILDI: "uzatıldı",
          }
          const durumText = durumMap[original.durum as string] || String(original.durum).toLowerCase()
          matched = durumText.includes(term)
        } else if (columnId === "alarmlar") {
          // Alarm sayısı araması
          const count = (original._count as Record<string, number>)?.alarmlar || 0
          matched = String(count).includes(term)
        } else {
          // Generic: try to get value directly
          const val = original[columnId]
          matched = deepSearch(val, term)
        }

        if (!matched) return false
      }

      return true
    },
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
      pagination,
    },
  })

  const totalRows = table.getFilteredRowModel().rows.length
  const currentPage = pagination.pageIndex + 1
  const totalPages = table.getPageCount()
  const startRow = pagination.pageIndex * pagination.pageSize + 1
  const endRow = Math.min(currentPage * pagination.pageSize, totalRows)

  return (
    <div className="w-full">
      {/* Search, Filter Toggle and Sort */}
      <div className="flex items-center justify-between gap-4 py-4">
        <div className="flex items-center gap-2">
          <Input
            placeholder={searchPlaceholder}
            value={globalFilterInput}
            onChange={(e) => setGlobalFilterInput(e.target.value)}
            className="max-w-sm"
          />
          <Button
            variant={showColumnFilters ? "default" : "outline"}
            size="icon"
            onClick={() => setShowColumnFilters(!showColumnFilters)}
            className="relative"
            title="Kolon filtreleri"
          >
            <Filter className="h-4 w-4" />
            {hasActiveColumnFilters && (
              <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-destructive" />
            )}
          </Button>
          {hasActiveColumnFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllColumnFilters}
              className="h-8 px-2 text-xs"
            >
              <X className="mr-1 h-3 w-3" />
              Temizle
            </Button>
          )}
        </div>
        <Popover open={sortOpen} onOpenChange={setSortOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={sortOpen}
              className="w-[240px] justify-between"
            >
              <div className="flex items-center gap-2 truncate">
                <ArrowUpDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="truncate">{selectedSortLabel}</span>
              </div>
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[240px] p-0" align="end">
            <Command>
              <CommandInput placeholder="Sıralama ara..." />
              <CommandList>
                <CommandEmpty>Sıralama bulunamadı.</CommandEmpty>
                {sortOptions.length > 0 && (
                  <CommandGroup heading="Alana Göre">
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
                <CommandGroup heading="Tarihe Göre">
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
                      {option.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
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
            {showColumnFilters && (
              <tr className="border-b bg-muted/30">
                {table.getHeaderGroups()[0]?.headers.map((header) => {
                  // Skip filter for actions column, hidden columns, and columns with null header
                  const headerDef = header.column.columnDef.header
                  const isNullHeader = typeof headerDef === "function" && headerDef(header.getContext()) === null
                  const skipFilter = header.id === "actions" || !header.column.getIsVisible() || isNullHeader || !headerDef
                  return (
                    <th key={`filter-${header.id}`} className="px-2 py-1.5">
                      {!skipFilter && (
                        <Input
                          placeholder="Filtre..."
                          value={columnFilterValues[header.id] || ""}
                          onChange={(e) => handleColumnFilterChange(header.id, e.target.value)}
                          className="h-7 text-xs"
                        />
                      )}
                    </th>
                  )
                })}
              </tr>
            )}
          </thead>
          <tbody className="[&_tr:last-child]:border-0">
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="h-24 text-center">
                  <div className="flex items-center justify-center">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    <span className="ml-2">Yükleniyor...</span>
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
                  Kayıt bulunamadı.
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
              Toplam {totalRows} kayıttan {startRow}-{endRow} arası gösteriliyor
            </span>
          ) : (
            <span>Kayıt yok</span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Select
            value={String(pagination.pageSize)}
            onValueChange={(value) => {
              table.setPageSize(Number(value))
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
