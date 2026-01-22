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
  kisiId: z.string().cuid("Geçersiz kişi ID"),
  isPrimary: z.boolean().default(false),
})

// Update GSM schema
export const updateGsmSchema = z.object({
  numara: gsmNumaraSchema.optional(),
  isPrimary: z.boolean().optional(),
})

// Bulk create GSM schema (for adding multiple GSMs to a kisi)
export const bulkCreateGsmSchema = z.object({
  kisiId: z.string().cuid("Geçersiz kişi ID"),
  gsmler: z.array(z.object({
    numara: gsmNumaraSchema,
    isPrimary: z.boolean().default(false),
  })).min(1, "En az bir GSM numarası gereklidir"),
})

// Types
export type CreateGsmInput = z.infer<typeof createGsmSchema>
export type UpdateGsmInput = z.infer<typeof updateGsmSchema>
export type BulkCreateGsmInput = z.infer<typeof bulkCreateGsmSchema>
