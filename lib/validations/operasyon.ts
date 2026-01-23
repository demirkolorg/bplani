import { z } from "zod"

// Katılımcı schema (for creating/updating operasyon with participants)
export const operasyonKatilimciSchema = z.object({
  kisiId: z.string().cuid("Geçersiz Kişi ID"),
  gsmId: z.string().cuid("Geçersiz GSM ID").optional().nullable(),
})

// Create Operasyon schema
export const createOperasyonSchema = z.object({
  tarih: z.coerce.date().default(() => new Date()),
  saat: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Geçersiz saat formatı (HH:mm)").optional().nullable(),
  mahalleId: z.string().cuid("Geçersiz Mahalle ID").optional().nullable(),
  adresDetay: z.string().max(500, "Adres detayı en fazla 500 karakter olabilir").optional().nullable(),
  notlar: z.string().max(5000, "Notlar en fazla 5000 karakter olabilir").optional().nullable(),
  katilimcilar: z.array(operasyonKatilimciSchema).optional(),
})

// Update Operasyon schema (all fields optional)
export const updateOperasyonSchema = z.object({
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
export type ListOperasyonQuery = z.infer<typeof listOperasyonQuerySchema>
