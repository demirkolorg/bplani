import * as React from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import type { VisibilityState, ColumnFiltersState } from "@tanstack/react-table"
import type { TabloTercih, TabloAnahtar } from "@/lib/validations"

// Query keys
const tercihKeys = {
  all: ["tercihler"] as const,
  tablo: (anahtar: string) => ["tercihler", "tablo", anahtar] as const,
}

// Fetch table preference from API
async function fetchTabloTercihi(tabloAnahtar: string): Promise<TabloTercih | null> {
  try {
    const response = await fetch(`/api/tercihler?kategori=tablo`)
    if (!response.ok) {
      if (response.status === 401) {
        // Not logged in, return null
        return null
      }
      throw new Error("Tercih yüklenirken hata oluştu")
    }
    const data = await response.json()
    return data?.data?.tablo?.[tabloAnahtar] || null
  } catch {
    return null
  }
}

// Save table preference to API
async function saveTabloTercihi(tabloAnahtar: string, tercih: TabloTercih): Promise<void> {
  const response = await fetch("/api/tercihler", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      kategori: "tablo",
      anahtar: tabloAnahtar,
      deger: tercih,
    }),
  })
  if (!response.ok) {
    throw new Error("Tercih kaydedilirken hata oluştu")
  }
}

export interface UseTablePreferencesOptions {
  /** Tablo tanımlayıcısı (örn: "kisiler", "takipler") */
  tabloAnahtar: TabloAnahtar | string
  /** Varsayılan kolon görünürlük ayarları */
  defaultColumnVisibility?: VisibilityState
  /** Varsayılan sıralama */
  defaultSort?: { column: string; direction: "asc" | "desc" }
  /** Varsayılan sayfa boyutu */
  defaultPageSize?: number
  /** Otomatik kaydetme (debounce ms) */
  autoSaveDelay?: number
}

export interface TablePreferencesState {
  /** Kolon görünürlük durumu */
  columnVisibility: VisibilityState
  /** Aktif sıralama */
  sorting: { column: string; direction: "asc" | "desc" } | null
  /** Sayfa boyutu */
  pageSize: number
  /** TanStack native ColumnFiltersState */
  filters: ColumnFiltersState | undefined
  /** Yükleniyor durumu */
  isLoading: boolean
  /** Kaydetme durumu */
  isSaving: boolean
  /** Kolon görünürlüğünü güncelle */
  setColumnVisibility: (visibility: VisibilityState) => void
  /** Tek kolon görünürlüğünü güncelle */
  toggleColumnVisibility: (columnId: string, visible: boolean) => void
  /** Sıralamayı güncelle */
  setSorting: (column: string, direction: "asc" | "desc") => void
  /** Sayfa boyutunu güncelle */
  setPageSize: (size: number) => void
  /** Filtreleri güncelle (TanStack native format) */
  setFilters: (filters: ColumnFiltersState) => void
  /** Tüm tercihleri sıfırla */
  resetPreferences: () => void
}

export function useTablePreferences({
  tabloAnahtar,
  defaultColumnVisibility = {},
  defaultSort,
  defaultPageSize = 20,
  autoSaveDelay = 500,
}: UseTablePreferencesOptions): TablePreferencesState {
  const queryClient = useQueryClient()

  // Local state for immediate UI updates
  const [localState, setLocalState] = React.useState<TabloTercih>({
    kolonlar: defaultColumnVisibility,
    siralama: defaultSort ? { kolon: defaultSort.column, yon: defaultSort.direction } : undefined,
    sayfaBoyutu: defaultPageSize,
    filtreler: undefined,
  })

  // Fetch preference from API
  const { data: serverTercih, isLoading } = useQuery({
    queryKey: tercihKeys.tablo(tabloAnahtar),
    queryFn: () => fetchTabloTercihi(tabloAnahtar),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
  })

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: (tercih: TabloTercih) => saveTabloTercihi(tabloAnahtar, tercih),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tercihKeys.all })
    },
  })

  // Debounced save
  const saveTimeoutRef = React.useRef<NodeJS.Timeout | null>(null)

  const debouncedSave = React.useCallback(
    (tercih: TabloTercih) => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
      saveTimeoutRef.current = setTimeout(() => {
        saveMutation.mutate(tercih)
      }, autoSaveDelay)
    },
    [autoSaveDelay, saveMutation]
  )

  // Initialize local state from server when data arrives
  React.useEffect(() => {
    if (serverTercih && !isLoading) {
      setLocalState((prev) => ({
        kolonlar: serverTercih.kolonlar || prev.kolonlar,
        siralama: serverTercih.siralama || prev.siralama,
        sayfaBoyutu: serverTercih.sayfaBoyutu || prev.sayfaBoyutu,
        filtreler: serverTercih.filtreler || prev.filtreler,
      }))
    }
  }, [serverTercih, isLoading])

  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [])

  // Computed column visibility (merge defaults with saved)
  const columnVisibility = React.useMemo(() => {
    // Start with defaults
    const merged: VisibilityState = {
      createdAt: false,
      updatedAt: false,
      ...defaultColumnVisibility,
    }

    // Override with saved preferences
    if (localState.kolonlar) {
      Object.entries(localState.kolonlar).forEach(([key, value]) => {
        merged[key] = value
      })
    }

    return merged
  }, [defaultColumnVisibility, localState.kolonlar])

  // Handlers
  const setColumnVisibility = React.useCallback(
    (visibility: VisibilityState) => {
      const newState = {
        ...localState,
        kolonlar: visibility,
      }
      setLocalState(newState)
      debouncedSave(newState)
    },
    [localState, debouncedSave]
  )

  const toggleColumnVisibility = React.useCallback(
    (columnId: string, visible: boolean) => {
      const newKolonlar = {
        ...localState.kolonlar,
        [columnId]: visible,
      }
      const newState = {
        ...localState,
        kolonlar: newKolonlar,
      }
      setLocalState(newState)
      debouncedSave(newState)
    },
    [localState, debouncedSave]
  )

  const setSorting = React.useCallback(
    (column: string, direction: "asc" | "desc") => {
      const newState = {
        ...localState,
        siralama: { kolon: column, yon: direction },
      }
      setLocalState(newState)
      debouncedSave(newState)
    },
    [localState, debouncedSave]
  )

  const setPageSize = React.useCallback(
    (size: number) => {
      const newState = {
        ...localState,
        sayfaBoyutu: size,
      }
      setLocalState(newState)
      debouncedSave(newState)
    },
    [localState, debouncedSave]
  )

  const setFilters = React.useCallback(
    (filters: ColumnFiltersState) => {
      const newState = {
        ...localState,
        filtreler: filters,
      }
      setLocalState(newState)
      debouncedSave(newState)
    },
    [localState, debouncedSave]
  )

  const resetPreferences = React.useCallback(() => {
    const newState: TabloTercih = {
      kolonlar: defaultColumnVisibility,
      siralama: defaultSort ? { kolon: defaultSort.column, yon: defaultSort.direction } : undefined,
      sayfaBoyutu: defaultPageSize,
      filtreler: undefined,
    }
    setLocalState(newState)
    saveMutation.mutate(newState)
  }, [defaultColumnVisibility, defaultSort, defaultPageSize, saveMutation])

  return {
    columnVisibility,
    sorting: localState.siralama
      ? { column: localState.siralama.kolon, direction: localState.siralama.yon }
      : null,
    pageSize: localState.sayfaBoyutu || defaultPageSize,
    filters: localState.filtreler,
    isLoading,
    isSaving: saveMutation.isPending,
    setColumnVisibility,
    toggleColumnVisibility,
    setSorting,
    setPageSize,
    setFilters,
    resetPreferences,
  }
}

// Helper hook for using with DataTable component props
export function useDataTablePreferences(
  tabloAnahtar: TabloAnahtar | string,
  options?: Omit<UseTablePreferencesOptions, "tabloAnahtar">
) {
  const prefs = useTablePreferences({
    tabloAnahtar,
    ...options,
  })

  return {
    // State from prefs
    columnVisibility: prefs.columnVisibility,
    sorting: prefs.sorting,
    pageSize: prefs.pageSize,
    filters: prefs.filters,
    isLoading: prefs.isLoading,
    isSaving: prefs.isSaving,
    // Handlers from prefs
    setColumnVisibility: prefs.setColumnVisibility,
    toggleColumnVisibility: prefs.toggleColumnVisibility,
    setSorting: prefs.setSorting,
    setPageSize: prefs.setPageSize,
    setFilters: prefs.setFilters,
    resetPreferences: prefs.resetPreferences,
    // Props for DataTable (with fallback to options)
    defaultColumnVisibility: prefs.columnVisibility,
    defaultSort: prefs.sorting || options?.defaultSort || null,
  }
}
