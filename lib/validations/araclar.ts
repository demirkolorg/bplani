import { z } from "zod"

// ==================== ARAÇ RENKLERİ ====================
export const aracRenkEnum = z.enum([
  "BEYAZ",
  "SIYAH",
  "GRI",
  "GUMUS",
  "KIRMIZI",
  "MAVI",
  "LACIVERT",
  "YESIL",
  "SARI",
  "TURUNCU",
  "KAHVERENGI",
  "BEJ",
  "BORDO",
  "MOR",
  "PEMBE",
  "ALTIN",
  "BRONZ",
  "DIGER",
])

export type AracRenk = z.infer<typeof aracRenkEnum>

// Renk etiketleri (UI için)
export const aracRenkLabels: Record<AracRenk, string> = {
  BEYAZ: "Beyaz",
  SIYAH: "Siyah",
  GRI: "Gri",
  GUMUS: "Gümüş",
  KIRMIZI: "Kırmızı",
  MAVI: "Mavi",
  LACIVERT: "Lacivert",
  YESIL: "Yeşil",
  SARI: "Sarı",
  TURUNCU: "Turuncu",
  KAHVERENGI: "Kahverengi",
  BEJ: "Bej",
  BORDO: "Bordo",
  MOR: "Mor",
  PEMBE: "Pembe",
  ALTIN: "Altın",
  BRONZ: "Bronz",
  DIGER: "Diğer",
}

// ==================== ARAÇ (Vehicle) ====================
export const createAracSchema = z.object({
  modelId: z.string().cuid("Geçersiz model ID"),
  renk: aracRenkEnum.optional().nullable(),
  plaka: z.string()
    .min(1, "Plaka zorunludur")
    .max(20, "Plaka en fazla 20 karakter olabilir")
    .trim()
    .transform(val => val.toUpperCase()),
  kisiIds: z.array(z.string().cuid()).optional(),
})

export const updateAracSchema = z.object({
  modelId: z.string().cuid("Geçersiz model ID").optional(),
  renk: aracRenkEnum.optional().nullable(),
  plaka: z.string()
    .min(1, "Plaka zorunludur")
    .max(20, "Plaka en fazla 20 karakter olabilir")
    .trim()
    .transform(val => val.toUpperCase())
    .optional(),
  kisiIds: z.array(z.string().cuid()).optional(),
})

export const listAracQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  kisiId: z.string().cuid("Geçersiz kişi ID").optional(),
  modelId: z.string().cuid("Geçersiz model ID").optional(),
  markaId: z.string().cuid("Geçersiz marka ID").optional(),
  search: z.string().optional(),
  sortBy: z.enum(["plaka", "renk", "createdAt", "updatedAt"]).default("plaka"),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
})

// ==================== ARAÇ-KİŞİ İLİŞKİSİ ====================
export const addKisiToAracSchema = z.object({
  kisiId: z.string().cuid("Geçersiz kişi ID"),
  aciklama: z.string().max(500, "Açıklama en fazla 500 karakter olabilir").optional().nullable(),
})

export const addAracToKisiSchema = z.object({
  aracId: z.string().cuid("Geçersiz araç ID"),
  aciklama: z.string().max(500, "Açıklama en fazla 500 karakter olabilir").optional().nullable(),
})

// ==================== TYPE EXPORTS ====================
export type CreateAracInput = z.infer<typeof createAracSchema>
export type UpdateAracInput = z.infer<typeof updateAracSchema>
export type ListAracQuery = z.infer<typeof listAracQuerySchema>
export type AddKisiToAracInput = z.infer<typeof addKisiToAracSchema>
export type AddAracToKisiInput = z.infer<typeof addAracToKisiSchema>
