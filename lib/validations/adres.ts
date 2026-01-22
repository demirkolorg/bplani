import { z } from "zod"

// Create Adres schema
export const createAdresSchema = z.object({
  ad: z.string().max(50, "Adres adı en fazla 50 karakter olabilir").optional().nullable(),
  mahalleId: z.string().cuid("Geçersiz mahalle ID"),
  detay: z.string().max(2000, "Adres detayı en fazla 2000 karakter olabilir").optional().nullable(),
  kisiId: z.string().cuid("Geçersiz kişi ID"),
  isPrimary: z.boolean().default(false),
})

// Update Adres schema
export const updateAdresSchema = z.object({
  ad: z.string().max(50, "Adres adı en fazla 50 karakter olabilir").optional().nullable(),
  mahalleId: z.string().cuid("Geçersiz mahalle ID").optional(),
  detay: z.string().max(2000, "Adres detayı en fazla 2000 karakter olabilir").optional().nullable(),
  isPrimary: z.boolean().optional(),
})

// Bulk create Adres schema
export const bulkCreateAdresSchema = z.object({
  kisiId: z.string().cuid("Geçersiz kişi ID"),
  adresler: z.array(z.object({
    ad: z.string().max(50, "Adres adı en fazla 50 karakter olabilir").optional().nullable(),
    mahalleId: z.string().cuid("Geçersiz mahalle ID"),
    detay: z.string().max(2000, "Adres detayı en fazla 2000 karakter olabilir").optional().nullable(),
    isPrimary: z.boolean().default(false),
  })).min(1, "En az bir adres gereklidir"),
})

// Types
export type CreateAdresInput = z.infer<typeof createAdresSchema>
export type UpdateAdresInput = z.infer<typeof updateAdresSchema>
export type BulkCreateAdresInput = z.infer<typeof bulkCreateAdresSchema>
