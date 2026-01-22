import { z } from "zod"

// KisiTip enum
export const kisiTipValues = ["LEAD", "MUSTERI"] as const
export type KisiTip = (typeof kisiTipValues)[number]

// TC Kimlik No validation (11 digits, specific algorithm)
const tcKimlikSchema = z.string()
  .length(11, "TC Kimlik No 11 haneli olmalıdır")
  .regex(/^\d{11}$/, "TC Kimlik No sadece rakamlardan oluşmalıdır")
  .refine((tc) => {
    if (tc[0] === "0") return false
    const digits = tc.split("").map(Number)
    const sum1 = digits[0] + digits[2] + digits[4] + digits[6] + digits[8]
    const sum2 = digits[1] + digits[3] + digits[5] + digits[7]
    const check1 = ((sum1 * 7) - sum2) % 10
    const check2 = (digits.slice(0, 10).reduce((a, b) => a + b, 0)) % 10
    return check1 === digits[9] && check2 === digits[10]
  }, "Geçersiz TC Kimlik No")
  .optional()
  .nullable()

// Create Kisi schema
export const createKisiSchema = z.object({
  tip: z.enum(kisiTipValues).default("LEAD"),
  tc: tcKimlikSchema,
  ad: z.string().min(1, "Ad zorunludur").max(100, "Ad en fazla 100 karakter olabilir"),
  soyad: z.string().min(1, "Soyad zorunludur").max(100, "Soyad en fazla 100 karakter olabilir"),
  faaliyet: z.string().max(5000, "Faaliyet en fazla 5000 karakter olabilir").optional().nullable(),
  pio: z.boolean().default(false),
  asli: z.boolean().default(false),
  fotograf: z.string().max(500, "Fotoğraf yolu en fazla 500 karakter olabilir").optional().nullable(),
})

// Update Kisi schema (all fields optional)
export const updateKisiSchema = createKisiSchema.partial()

// List query params schema
export const listKisiQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().optional(),
  tip: z.enum(kisiTipValues).optional(),
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

// Kisi tip labels for display
export const kisiTipLabels: Record<KisiTip, string> = {
  LEAD: "Lead",
  MUSTERI: "Müşteri",
}
