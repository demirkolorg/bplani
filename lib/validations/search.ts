import { z } from "zod"

// Global search query validation
export const globalSearchQuerySchema = z.object({
  q: z.string().min(2, "Search must be at least 2 characters").max(100, "Search must be at most 100 characters"),
  limit: z.coerce.number().int().positive().max(10).default(5),
})

export type GlobalSearchQuery = z.infer<typeof globalSearchQuerySchema>

// Search result item type
export interface SearchResultItem {
  id: string
  title: string
  subtitle?: string
  url: string
  category: string
  metadata?: {
    // For kisiler
    tt?: boolean
    tc?: string

    // For lokasyonlar
    locationType?: "il" | "ilce" | "mahalle"
    plaka?: string
    parentLocation?: string

    // For markalar
    isMarka?: boolean
  }
}

// Search response type
export interface GlobalSearchResponse {
  query: string
  totalResults: number
  results: {
    kisiler: SearchResultItem[]
    gsmler: SearchResultItem[]
    adresler: SearchResultItem[]
    personel: SearchResultItem[]
    tanitimlar: SearchResultItem[]
    operasyonlar: SearchResultItem[]
    alarmlar: SearchResultItem[]
    takipler: SearchResultItem[]
    araclar: SearchResultItem[]
    markalar: SearchResultItem[]
    modeller: SearchResultItem[]
    lokasyonlar: SearchResultItem[]
    notlar: SearchResultItem[]
    loglar: SearchResultItem[]
  }
}
