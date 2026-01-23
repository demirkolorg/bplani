import { useQuery } from "@tanstack/react-query"
import type { KisiTip } from "@/lib/validations"

// Types for API responses
export interface NumaraTakip {
  id: string
  baslamaTarihi: string
  bitisTarihi: string
  durum: string
}

export interface NumaraWithKisi {
  id: string
  numara: string
  isPrimary: boolean
  kisiId: string
  createdAt: string
  updatedAt: string
  kisi: {
    id: string
    ad: string
    soyad: string
    tip: KisiTip
    tc: string | null
  }
  takipler: NumaraTakip[]
}

export interface NumaraListResponse {
  data: NumaraWithKisi[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface ListNumaraQuery {
  page?: number
  limit?: number
  search?: string
  sortBy?: "numara" | "createdAt" | "kisiAd"
  sortOrder?: "asc" | "desc"
}

// Query keys
export const numaraKeys = {
  all: ["numaralar"] as const,
  lists: () => [...numaraKeys.all, "list"] as const,
  list: (params: Partial<ListNumaraQuery>) => [...numaraKeys.lists(), params] as const,
}

// Fetch function
async function fetchNumaralar(params: Partial<ListNumaraQuery> = {}): Promise<NumaraListResponse> {
  const searchParams = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, String(value))
    }
  })

  const response = await fetch(`/api/numaralar?${searchParams.toString()}`)
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Numaralar yüklenirken hata oluştu")
  }
  return response.json()
}

// Hook
export function useNumaralar(params: Partial<ListNumaraQuery> = {}) {
  return useQuery({
    queryKey: numaraKeys.list(params),
    queryFn: () => fetchNumaralar(params),
  })
}
