import { z } from "zod"

// Global search query validation
export const globalSearchQuerySchema = z.object({
  q: z.string().min(2, "Search must be at least 2 characters").max(100, "Search must be at most 100 characters"),
  limit: z.coerce.number().int().positive().max(10).default(5),
})

export type GlobalSearchQuery = z.infer<typeof globalSearchQuerySchema>

// Related entity interfaces
export interface RelatedKisi {
  id: string
  ad: string
  soyad: string
  tt?: boolean
  tc?: string | null
}

export interface RelatedArac {
  id: string
  plaka: string
  model: {
    ad: string
    marka: { ad: string }
  }
  renk?: string | null
  sahipler?: RelatedKisi[]
}

export interface RelatedTanitim {
  id: string
  baslik?: string | null
  tarih: Date | string
  katilimcilar?: RelatedKisi[]
}

export interface RelatedOperasyon {
  id: string
  baslik?: string | null
  tarih: Date | string
  katilimcilar?: RelatedKisi[]
}

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
    fullAddress?: string
    hasDetail?: boolean
    hasAddress?: boolean

    // For faaliyet alanlari
    kisiCount?: number
    parent?: {
      id: string
      ad: string
    }

    // İlişkisel alanlar
    relatedKisiler?: RelatedKisi[]
    relatedAraclar?: RelatedArac[]
    relatedTanitimlar?: RelatedTanitim[]
    relatedOperasyonlar?: RelatedOperasyon[]
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
    notlar: SearchResultItem[]
    faaliyetAlanlari: SearchResultItem[]
    loglar: SearchResultItem[]
  }
}
