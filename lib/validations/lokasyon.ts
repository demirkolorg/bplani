import { z } from "zod"

// ==================== IL (Province) ====================
export const createIlSchema = z.object({
  ad: z.string()
    .min(1, "İl adı zorunludur")
    .max(100, "İl adı en fazla 100 karakter olabilir")
    .trim(),
  plaka: z.coerce.number()
    .int("Plaka kodu tam sayı olmalıdır")
    .min(1, "Plaka kodu 1-81 arasında olmalıdır")
    .max(81, "Plaka kodu 1-81 arasında olmalıdır")
    .optional()
    .nullable(),
  isActive: z.boolean().default(true),
})

export const updateIlSchema = createIlSchema.partial()

export const listIlQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
  sortBy: z.enum(["ad", "plaka", "createdAt", "updatedAt"]).default("ad"),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
})

// ==================== ILCE (District) ====================
export const createIlceSchema = z.object({
  ad: z.string()
    .min(1, "İlçe adı zorunludur")
    .max(100, "İlçe adı en fazla 100 karakter olabilir")
    .trim(),
  ilId: z.string().cuid("Geçersiz il ID"),
  isActive: z.boolean().default(true),
})

export const updateIlceSchema = z.object({
  ad: z.string()
    .min(1, "İlçe adı zorunludur")
    .max(100, "İlçe adı en fazla 100 karakter olabilir")
    .trim()
    .optional(),
  isActive: z.boolean().optional(),
})

export const listIlceQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  ilId: z.string().cuid("Geçersiz il ID").optional(),
  search: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
  sortBy: z.enum(["ad", "createdAt", "updatedAt"]).default("ad"),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
})

// ==================== MAHALLE (Neighborhood) ====================
export const createMahalleSchema = z.object({
  ad: z.string()
    .min(1, "Mahalle adı zorunludur")
    .max(150, "Mahalle adı en fazla 150 karakter olabilir")
    .trim(),
  ilceId: z.string().cuid("Geçersiz ilçe ID"),
  isActive: z.boolean().default(true),
})

export const updateMahalleSchema = z.object({
  ad: z.string()
    .min(1, "Mahalle adı zorunludur")
    .max(150, "Mahalle adı en fazla 150 karakter olabilir")
    .trim()
    .optional(),
  isActive: z.boolean().optional(),
})

export const listMahalleQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  ilceId: z.string().cuid("Geçersiz ilçe ID").optional(),
  ilId: z.string().cuid("Geçersiz il ID").optional(),
  search: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
  sortBy: z.enum(["ad", "createdAt", "updatedAt"]).default("ad"),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
})

// ==================== TYPE EXPORTS ====================
export type CreateIlInput = z.infer<typeof createIlSchema>
export type UpdateIlInput = z.infer<typeof updateIlSchema>
export type ListIlQuery = z.infer<typeof listIlQuerySchema>

export type CreateIlceInput = z.infer<typeof createIlceSchema>
export type UpdateIlceInput = z.infer<typeof updateIlceSchema>
export type ListIlceQuery = z.infer<typeof listIlceQuerySchema>

export type CreateMahalleInput = z.infer<typeof createMahalleSchema>
export type UpdateMahalleInput = z.infer<typeof updateMahalleSchema>
export type ListMahalleQuery = z.infer<typeof listMahalleQuerySchema>
