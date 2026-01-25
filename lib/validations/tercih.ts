import { z } from "zod"

// Tercih kategorileri
export const tercihKategoriValues = ["tablo", "tema", "genel"] as const
export type TercihKategori = (typeof tercihKategoriValues)[number]

// Tablo tercihleri için yapı
export const tabloTercihSchema = z.object({
  kolonlar: z.record(z.string(), z.boolean()).optional(), // { "tc": true, "adSoyad": true, ... }
  siralama: z.object({
    kolon: z.string(),
    yon: z.enum(["asc", "desc"]),
  }).optional(),
  sayfaBoyutu: z.number().int().positive().max(100).optional(),
})

// Tema tercihleri için yapı
export const temaTercihSchema = z.object({
  mod: z.enum(["light", "dark", "system"]).optional(),
})

// Genel tercihler için yapı
export const genelTercihSchema = z.object({
  sidebar: z.object({
    collapsed: z.boolean().optional(),
  }).optional(),
  notifications: z.object({
    enabled: z.boolean().optional(),
    sound: z.boolean().optional(),
  }).optional(),
})

// Tercih değeri - kategoriye göre değişir
export const tercihDegerSchema = z.union([
  tabloTercihSchema,
  temaTercihSchema,
  genelTercihSchema,
  z.record(z.string(), z.unknown()), // Esneklik için generic JSON
])

// Tercih oluşturma/güncelleme şeması
export const upsertTercihSchema = z.object({
  kategori: z.enum(tercihKategoriValues),
  anahtar: z.string().min(1, "Anahtar zorunludur").max(50, "Anahtar en fazla 50 karakter olabilir"),
  deger: tercihDegerSchema,
})

// Toplu tercih güncelleme şeması
export const batchUpsertTercihSchema = z.object({
  tercihler: z.array(upsertTercihSchema),
})

// Tercih silme şeması
export const deleteTercihSchema = z.object({
  kategori: z.enum(tercihKategoriValues),
  anahtar: z.string().min(1),
})

// Tercih sorgulama şeması
export const listTercihQuerySchema = z.object({
  kategori: z.enum(tercihKategoriValues).optional(),
})

// Types
export type TabloTercih = z.infer<typeof tabloTercihSchema>
export type TemaTercih = z.infer<typeof temaTercihSchema>
export type GenelTercih = z.infer<typeof genelTercihSchema>
export type TercihDeger = z.infer<typeof tercihDegerSchema>
export type UpsertTercihInput = z.infer<typeof upsertTercihSchema>
export type BatchUpsertTercihInput = z.infer<typeof batchUpsertTercihSchema>
export type DeleteTercihInput = z.infer<typeof deleteTercihSchema>
export type ListTercihQuery = z.infer<typeof listTercihQuerySchema>

// Tablo anahtar listesi (type-safe)
export const tabloAnahtarlari = [
  "kisiler",
  "takipler",
  "tanitimlar",
  "operasyonlar",
  "araclar",
  "personel",
  "loglar",
  "alarmlar",
] as const
export type TabloAnahtar = (typeof tabloAnahtarlari)[number]
