import { z } from "zod"

// ==================== MARKA (Brand) ====================
export const createMarkaSchema = z.object({
  ad: z.string()
    .min(1, "Marka adı zorunludur")
    .max(100, "Marka adı en fazla 100 karakter olabilir")
    .trim(),
})

export const updateMarkaSchema = createMarkaSchema.partial()

export const listMarkaQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100000).default(10000),
  search: z.string().optional(),
  sortBy: z.enum(["ad", "createdAt", "updatedAt"]).default("ad"),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
})

// ==================== MODEL ====================
export const createModelSchema = z.object({
  ad: z.string()
    .min(1, "Model adı zorunludur")
    .max(100, "Model adı en fazla 100 karakter olabilir")
    .trim(),
  markaId: z.string().cuid("Geçersiz marka ID"),
})

export const updateModelSchema = z.object({
  ad: z.string()
    .min(1, "Model adı zorunludur")
    .max(100, "Model adı en fazla 100 karakter olabilir")
    .trim()
    .optional(),
})

export const listModelQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100000).default(10000),
  markaId: z.string().cuid("Geçersiz marka ID").optional(),
  search: z.string().optional(),
  sortBy: z.enum(["ad", "createdAt", "updatedAt"]).default("ad"),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
})

// ==================== TYPE EXPORTS ====================
export type CreateMarkaInput = z.infer<typeof createMarkaSchema>
export type UpdateMarkaInput = z.infer<typeof updateMarkaSchema>
export type ListMarkaQuery = z.infer<typeof listMarkaQuerySchema>

export type CreateModelInput = z.infer<typeof createModelSchema>
export type UpdateModelInput = z.infer<typeof updateModelSchema>
export type ListModelQuery = z.infer<typeof listModelQuerySchema>
