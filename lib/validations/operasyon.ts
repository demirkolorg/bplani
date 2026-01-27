import { z } from "zod"

// Katılımcı schema (for creating/updating operasyon with participants)
export const operasyonKatilimciSchema = z.object({
  kisiId: z.string().cuid("Geçersiz Kişi ID"),
  gsmId: z.string().cuid("Geçersiz GSM ID").optional().nullable(),
})

// Araç schema (for creating operasyon with vehicles)
export const operasyonAracInputSchema = z.object({
  aracId: z.string().cuid("Geçersiz Araç ID"),
  aciklama: z.string()
    .max(500, "Açıklama en fazla 500 karakter olabilir")
    .optional()
    .nullable(),
})

// Create Operasyon schema
export const createOperasyonSchema = z.object({
  baslik: z.string().max(200, "Başlık en fazla 200 karakter olabilir").optional().nullable(),
  tarih: z.coerce.date().default(() => new Date()),
  saat: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Geçersiz saat formatı (HH:mm)").optional().nullable(),
  mahalleId: z.string().cuid("Geçersiz Mahalle ID").optional().nullable(),
  adresDetay: z.string().max(500, "Adres detayı en fazla 500 karakter olabilir").optional().nullable(),
  notlar: z.string().max(5000, "Notlar en fazla 5000 karakter olabilir").optional().nullable(),
  katilimcilar: z.array(operasyonKatilimciSchema).optional(),
  araclar: z.array(operasyonAracInputSchema).optional(),
})

// Update Operasyon schema (all fields optional)
export const updateOperasyonSchema = z.object({
  baslik: z.string().max(200, "Başlık en fazla 200 karakter olabilir").optional().nullable(),
  tarih: z.coerce.date().optional(),
  saat: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Geçersiz saat formatı (HH:mm)").optional().nullable(),
  mahalleId: z.string().cuid("Geçersiz Mahalle ID").optional().nullable(),
  adresDetay: z.string().max(500, "Adres detayı en fazla 500 karakter olabilir").optional().nullable(),
  notlar: z.string().max(5000, "Notlar en fazla 5000 karakter olabilir").optional().nullable(),
})

// Add participant schema
export const addOperasyonKatilimciSchema = z.object({
  kisiId: z.string().cuid("Geçersiz Kişi ID"),
  gsmId: z.string().cuid("Geçersiz GSM ID").optional().nullable(),
})

// Add vehicle schema
export const addOperasyonAracSchema = z.object({
  aracId: z.string().cuid("Geçersiz Araç ID"),
  aciklama: z.string()
    .max(500, "Açıklama en fazla 500 karakter olabilir")
    .optional()
    .nullable(),
})

// List query params schema
export const listOperasyonQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().optional(),
  tarihBaslangic: z.coerce.date().optional(),
  tarihBitis: z.coerce.date().optional(),
  kisiId: z.string().cuid().optional(),
  mahalleId: z.string().cuid().optional(),
  sortBy: z.enum(["tarih", "createdAt", "updatedAt"]).default("tarih"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
})

// Types
export type OperasyonKatilimciInput = z.infer<typeof operasyonKatilimciSchema>
export type CreateOperasyonInput = z.infer<typeof createOperasyonSchema>
export type UpdateOperasyonInput = z.infer<typeof updateOperasyonSchema>
export type AddOperasyonKatilimciInput = z.infer<typeof addOperasyonKatilimciSchema>
export type AddOperasyonAracInput = z.infer<typeof addOperasyonAracSchema>
export type ListOperasyonQuery = z.infer<typeof listOperasyonQuerySchema>
