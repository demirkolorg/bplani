import { z } from "zod"

// Takip durumları
export const takipDurumEnum = z.enum(["UZATILACAK", "DEVAM_EDECEK", "SONLANDIRILACAK", "UZATILDI"])
export type TakipDurum = z.infer<typeof takipDurumEnum>

export const takipDurumLabels: Record<TakipDurum, string> = {
  UZATILACAK: "Uzatılacak",
  DEVAM_EDECEK: "Devam Edecek",
  SONLANDIRILACAK: "Sonlandırılacak",
  UZATILDI: "Uzatıldı",
}

// Create Takip schema
export const createTakipSchema = z.object({
  gsmId: z.string().cuid("Geçersiz GSM ID"),
  baslamaTarihi: z.coerce.date().optional(),
  bitisTarihi: z.coerce.date().optional(),
  durum: takipDurumEnum.default("UZATILACAK"),
}).refine((data) => {
  // If both dates provided, bitisTarihi should be after baslamaTarihi
  if (data.baslamaTarihi && data.bitisTarihi) {
    return data.bitisTarihi >= data.baslamaTarihi
  }
  return true
}, {
  message: "Bitiş tarihi başlama tarihinden önce olamaz",
  path: ["bitisTarihi"],
})

// Update Takip schema
export const updateTakipSchema = z.object({
  baslamaTarihi: z.coerce.date().optional(),
  bitisTarihi: z.coerce.date().optional(),
  durum: takipDurumEnum.optional(),
}).refine((data) => {
  if (data.baslamaTarihi && data.bitisTarihi) {
    return data.bitisTarihi >= data.baslamaTarihi
  }
  return true
}, {
  message: "Bitiş tarihi başlama tarihinden önce olamaz",
  path: ["bitisTarihi"],
})

// List query params schema
export const listTakipQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().optional(),
  gsmId: z.string().cuid().optional(),
  musteriId: z.string().cuid().optional(),
  durum: takipDurumEnum.optional(),
  bitisTarihiBaslangic: z.coerce.date().optional(),
  bitisTarihiBitis: z.coerce.date().optional(),
  sortBy: z.enum(["baslamaTarihi", "bitisTarihi", "createdAt", "updatedAt"]).default("bitisTarihi"),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
})

// Bulk create Takip schema
export const bulkCreateTakipSchema = z.object({
  gsmIds: z.array(z.string().cuid("Geçersiz GSM ID")).min(1, "En az bir GSM seçilmelidir"),
  baslamaTarihi: z.coerce.date().optional(),
  bitisTarihi: z.coerce.date().optional(),
}).refine((data) => {
  if (data.baslamaTarihi && data.bitisTarihi) {
    return data.bitisTarihi >= data.baslamaTarihi
  }
  return true
}, {
  message: "Bitiş tarihi başlama tarihinden önce olamaz",
  path: ["bitisTarihi"],
})

// Types
export type CreateTakipInput = z.infer<typeof createTakipSchema>
export type UpdateTakipInput = z.infer<typeof updateTakipSchema>
export type BulkCreateTakipInput = z.infer<typeof bulkCreateTakipSchema>
export type ListTakipQuery = z.infer<typeof listTakipQuerySchema>
