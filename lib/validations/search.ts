import { z } from "zod"

// Global search query validation
export const globalSearchQuerySchema = z.object({
  q: z.string().min(2, "Arama en az 2 karakter olmalıdır").max(100, "Arama en fazla 100 karakter olabilir"),
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
