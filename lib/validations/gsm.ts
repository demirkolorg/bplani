import { z } from "zod"

// Turkish phone number validation (05XX XXX XX XX format)
const gsmNumaraSchema = z.string()
  .transform((val) => val.replace(/\s/g, "")) // Remove spaces
  .refine((val) => /^(05\d{9}|5\d{9})$/.test(val), {
    message: "Geçersiz GSM numarası. 05XX XXX XX XX formatında olmalıdır",
  })
  .transform((val) => val.startsWith("0") ? val : `0${val}`) // Ensure starts with 0

// Create GSM schema
export const createGsmSchema = z.object({
  numara: gsmNumaraSchema,
  musteriId: z.string().cuid("Geçersiz müşteri ID").optional().nullable(),
  leadId: z.string().cuid("Geçersiz lead ID").optional().nullable(),
  isPrimary: z.boolean().default(false),
}).refine((data) => {
  // Must have either musteriId or leadId, but not both
  const hasMusteriId = data.musteriId !== null && data.musteriId !== undefined
  const hasLeadId = data.leadId !== null && data.leadId !== undefined
  return (hasMusteriId || hasLeadId) && !(hasMusteriId && hasLeadId)
}, {
  message: "GSM kaydı ya bir müşteriye ya da bir lead'e ait olmalıdır",
})

// Update GSM schema
export const updateGsmSchema = z.object({
  numara: gsmNumaraSchema.optional(),
  isPrimary: z.boolean().optional(),
})

// Bulk create GSM schema (for adding multiple GSMs to a customer)
export const bulkCreateGsmSchema = z.object({
  musteriId: z.string().cuid("Geçersiz müşteri ID").optional().nullable(),
  leadId: z.string().cuid("Geçersiz lead ID").optional().nullable(),
  gsmler: z.array(z.object({
    numara: gsmNumaraSchema,
    isPrimary: z.boolean().default(false),
  })).min(1, "En az bir GSM numarası gereklidir"),
}).refine((data) => {
  const hasMusteriId = data.musteriId !== null && data.musteriId !== undefined
  const hasLeadId = data.leadId !== null && data.leadId !== undefined
  return (hasMusteriId || hasLeadId) && !(hasMusteriId && hasLeadId)
}, {
  message: "GSM kayıtları ya bir müşteriye ya da bir lead'e ait olmalıdır",
})

// Types
export type CreateGsmInput = z.infer<typeof createGsmSchema>
export type UpdateGsmInput = z.infer<typeof updateGsmSchema>
export type BulkCreateGsmInput = z.infer<typeof bulkCreateGsmSchema>
