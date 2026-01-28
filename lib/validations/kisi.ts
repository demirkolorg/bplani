import { z } from "zod"

// TC Kimlik No validation (11 digits, basic validation - algorithm check disabled for testing)
// Allows: null, undefined, empty string, or 11-digit number
const tcKimlikSchema = z
  .union([
    z.null(),
    z.literal(""),
    z
      .string()
      .length(11, "TC Kimlik No 11 haneli olmalıdır")
      .regex(/^\d{11}$/, "TC Kimlik No sadece rakamlardan oluşmalıdır")
      .refine((tc) => tc[0] !== "0", "TC Kimlik No 0 ile başlayamaz"),
  ])
  .optional()
  .nullable()

// Create Kisi schema
export const createKisiSchema = z.object({
  tt: z.boolean().default(false), // true = Müşteri, false = Aday
  tc: tcKimlikSchema,
  ad: z.string().min(1, "Ad zorunludur").max(100, "Ad en fazla 100 karakter olabilir"),
  soyad: z.string().min(1, "Soyad zorunludur").max(100, "Soyad en fazla 100 karakter olabilir"),
  faaliyet: z.string().max(5000, "Faaliyet en fazla 5000 karakter olabilir").optional().nullable(),
  pio: z.boolean().default(false),
  asli: z.boolean().default(false),
  fotograf: z.string().max(500, "Fotoğraf yolu en fazla 500 karakter olabilir").optional().nullable(),
})

// Update Kisi schema (all fields optional, includes faaliyetAlaniIds for relation management)
export const updateKisiSchema = createKisiSchema.partial().extend({
  faaliyetAlaniIds: z.array(z.string().cuid()).optional(),
})

// List query params schema
export const listKisiQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100000).default(10000),
  search: z.string().optional(),
  tt: z.coerce.boolean().optional(), // true = Müşteri, false = Aday
  isArchived: z.coerce.boolean().optional(),
  pio: z.coerce.boolean().optional(),
  asli: z.coerce.boolean().optional(),
  sortBy: z.enum(["ad", "soyad", "createdAt", "updatedAt"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
})

// Types
export type CreateKisiInput = z.infer<typeof createKisiSchema>
export type UpdateKisiInput = z.infer<typeof updateKisiSchema>
export type ListKisiQuery = z.infer<typeof listKisiQuerySchema>
