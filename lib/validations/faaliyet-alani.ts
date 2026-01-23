import { z } from "zod"

// ==================== FAALIYET ALANI ====================
export const createFaaliyetAlaniSchema = z.object({
  ad: z.string()
    .min(1, "Faaliyet alanı adı zorunludur")
    .max(200, "Faaliyet alanı adı en fazla 200 karakter olabilir")
    .trim(),
  parentId: z.string().cuid("Geçersiz üst kategori ID").optional().nullable(),
  sira: z.coerce.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
})

export const updateFaaliyetAlaniSchema = z.object({
  ad: z.string()
    .min(1, "Faaliyet alanı adı zorunludur")
    .max(200, "Faaliyet alanı adı en fazla 200 karakter olabilir")
    .trim()
    .optional(),
  parentId: z.string().cuid("Geçersiz üst kategori ID").optional().nullable(),
  sira: z.coerce.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
})

export const listFaaliyetAlaniQuerySchema = z.object({
  parentId: z.string().cuid("Geçersiz üst kategori ID").optional().nullable(),
  search: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
  flat: z.coerce.boolean().optional().default(false), // Tree vs flat list
})

// ==================== TYPE EXPORTS ====================
export type CreateFaaliyetAlaniInput = z.infer<typeof createFaaliyetAlaniSchema>
export type UpdateFaaliyetAlaniInput = z.infer<typeof updateFaaliyetAlaniSchema>
export type ListFaaliyetAlaniQuery = z.infer<typeof listFaaliyetAlaniQuerySchema>
