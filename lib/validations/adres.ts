import { z } from "zod"

// Create Adres schema
export const createAdresSchema = z.object({
  ad: z.string().max(50, "Adres adı en fazla 50 karakter olabilir").optional().nullable(),
  mahalleId: z.string().cuid("Geçersiz mahalle ID"),
  detay: z.string().max(2000, "Adres detayı en fazla 2000 karakter olabilir").optional().nullable(),
  musteriId: z.string().cuid("Geçersiz müşteri ID").optional().nullable(),
  leadId: z.string().cuid("Geçersiz lead ID").optional().nullable(),
  isPrimary: z.boolean().default(false),
}).refine((data) => {
  // Must have either musteriId or leadId, but not both
  const hasMusteriId = data.musteriId !== null && data.musteriId !== undefined
  const hasLeadId = data.leadId !== null && data.leadId !== undefined
  return (hasMusteriId || hasLeadId) && !(hasMusteriId && hasLeadId)
}, {
  message: "Adres kaydı ya bir müşteriye ya da bir lead'e ait olmalıdır",
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
  musteriId: z.string().cuid("Geçersiz müşteri ID").optional().nullable(),
  leadId: z.string().cuid("Geçersiz lead ID").optional().nullable(),
  adresler: z.array(z.object({
    ad: z.string().max(50, "Adres adı en fazla 50 karakter olabilir").optional().nullable(),
    mahalleId: z.string().cuid("Geçersiz mahalle ID"),
    detay: z.string().max(2000, "Adres detayı en fazla 2000 karakter olabilir").optional().nullable(),
    isPrimary: z.boolean().default(false),
  })).min(1, "En az bir adres gereklidir"),
}).refine((data) => {
  const hasMusteriId = data.musteriId !== null && data.musteriId !== undefined
  const hasLeadId = data.leadId !== null && data.leadId !== undefined
  return (hasMusteriId || hasLeadId) && !(hasMusteriId && hasLeadId)
}, {
  message: "Adres kayıtları ya bir müşteriye ya da bir lead'e ait olmalıdır",
})

// Types
export type CreateAdresInput = z.infer<typeof createAdresSchema>
export type UpdateAdresInput = z.infer<typeof updateAdresSchema>
export type BulkCreateAdresInput = z.infer<typeof bulkCreateAdresSchema>
