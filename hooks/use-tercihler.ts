import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import type {
  TercihKategori,
  TercihDeger,
  UpsertTercihInput,
  BatchUpsertTercihInput,
  TabloTercih,
  TemaTercih,
  GenelTercih,
} from "@/lib/validations"

// API response types
export interface TercihlerResponse {
  data: Record<string, Record<string, unknown>>
  raw: Array<{
    id: string
    personelId: string
    kategori: string
    anahtar: string
    deger: unknown
    createdAt: string
    updatedAt: string
  }>
}

// Query keys
export const tercihKeys = {
  all: ["tercihler"] as const,
  byKategori: (kategori: TercihKategori) => [...tercihKeys.all, kategori] as const,
  tablo: (anahtar: string) => [...tercihKeys.all, "tablo", anahtar] as const,
}

// Fetch functions
async function fetchTercihler(kategori?: TercihKategori): Promise<TercihlerResponse> {
  const url = kategori ? `/api/tercihler?kategori=${kategori}` : "/api/tercihler"
  const response = await fetch(url)
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Tercihler yüklenirken hata oluştu")
  }
  return response.json()
}

async function upsertTercih(data: UpsertTercihInput): Promise<unknown> {
  const response = await fetch("/api/tercihler", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Tercih kaydedilirken hata oluştu")
  }
  return response.json()
}

async function batchUpsertTercih(data: BatchUpsertTercihInput): Promise<unknown> {
  const response = await fetch("/api/tercihler", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Tercihler kaydedilirken hata oluştu")
  }
  return response.json()
}

async function deleteTercih(kategori: string, anahtar: string): Promise<void> {
  const response = await fetch(`/api/tercihler?kategori=${kategori}&anahtar=${anahtar}`, {
    method: "DELETE",
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Tercih silinirken hata oluştu")
  }
}

// Main hook - fetches all preferences
export function useTercihler(kategori?: TercihKategori) {
  return useQuery({
    queryKey: kategori ? tercihKeys.byKategori(kategori) : tercihKeys.all,
    queryFn: () => fetchTercihler(kategori),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Hook for upserting a single preference
export function useUpsertTercih() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: upsertTercih,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tercihKeys.all })
    },
  })
}

// Hook for batch upserting preferences
export function useBatchUpsertTercih() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: batchUpsertTercih,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tercihKeys.all })
    },
  })
}

// Hook for deleting a preference
export function useDeleteTercih() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ kategori, anahtar }: { kategori: string; anahtar: string }) =>
      deleteTercih(kategori, anahtar),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tercihKeys.all })
    },
  })
}

// Convenience hook for table preferences
export function useTabloTercihi(tabloAnahtar: string) {
  const { data, isLoading, error } = useTercihler("tablo")
  const upsertMutation = useUpsertTercih()

  const tercih = data?.data?.tablo?.[tabloAnahtar] as TabloTercih | undefined

  const setTercih = (yeniTercih: Partial<TabloTercih>) => {
    const mergedTercih = { ...tercih, ...yeniTercih }
    return upsertMutation.mutateAsync({
      kategori: "tablo",
      anahtar: tabloAnahtar,
      deger: mergedTercih,
    })
  }

  const setKolonGorunum = (kolonId: string, gorunur: boolean) => {
    const mevcutKolonlar = tercih?.kolonlar || {}
    return setTercih({
      kolonlar: { ...mevcutKolonlar, [kolonId]: gorunur },
    })
  }

  const setSiralama = (kolon: string, yon: "asc" | "desc") => {
    return setTercih({
      siralama: { kolon, yon },
    })
  }

  const setSayfaBoyutu = (boyut: number) => {
    return setTercih({
      sayfaBoyutu: boyut,
    })
  }

  return {
    tercih,
    isLoading,
    error,
    setTercih,
    setKolonGorunum,
    setSiralama,
    setSayfaBoyutu,
    isSaving: upsertMutation.isPending,
  }
}

// Convenience hook for theme preferences
export function useTemaTercihi() {
  const { data, isLoading, error } = useTercihler("tema")
  const upsertMutation = useUpsertTercih()

  const tercih = data?.data?.tema?.["mode"] as TemaTercih | undefined

  const setTema = (mod: "light" | "dark" | "system") => {
    return upsertMutation.mutateAsync({
      kategori: "tema",
      anahtar: "mode",
      deger: { mod },
    })
  }

  return {
    tercih,
    tema: tercih?.mod || "system",
    isLoading,
    error,
    setTema,
    isSaving: upsertMutation.isPending,
  }
}

// Convenience hook for general preferences
export function useGenelTercihler() {
  const { data, isLoading, error } = useTercihler("genel")
  const upsertMutation = useUpsertTercih()

  const tercihler = data?.data?.genel as Record<string, GenelTercih> | undefined

  const setTercih = (anahtar: string, deger: Partial<GenelTercih>) => {
    const mevcut = tercihler?.[anahtar] || {}
    return upsertMutation.mutateAsync({
      kategori: "genel",
      anahtar,
      deger: { ...mevcut, ...deger },
    })
  }

  return {
    tercihler,
    isLoading,
    error,
    setTercih,
    isSaving: upsertMutation.isPending,
  }
}
