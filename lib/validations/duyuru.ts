import { z } from "zod"

// Duyuru öncelik enum
export const duyuruOncelikEnum = z.enum(["NORMAL", "ONEMLI", "KRITIK"])

// Create Duyuru schema
export const createDuyuruSchema = z.object({
  baslik: z.string()
    .min(1, "Başlık zorunludur")
    .max(200, "Başlık en fazla 200 karakter olabilir"),
  icerik: z.string()
    .min(1, "İçerik zorunludur")
    .max(10000, "İçerik en fazla 10.000 karakter olabilir"),
  oncelik: duyuruOncelikEnum.default("NORMAL"),
  publishedAt: z.coerce.date().default(() => new Date()),
  expiresAt: z.coerce.date().optional().nullable(),
  isActive: z.boolean().default(true),
})

// Update Duyuru schema (all fields optional except id)
export const updateDuyuruSchema = z.object({
  baslik: z.string()
    .min(1, "Başlık zorunludur")
    .max(200, "Başlık en fazla 200 karakter olabilir")
    .optional(),
  icerik: z.string()
    .min(1, "İçerik zorunludur")
    .max(10000, "İçerik en fazla 10.000 karakter olabilir")
    .optional(),
  oncelik: duyuruOncelikEnum.optional(),
  publishedAt: z.coerce.date().optional(),
  expiresAt: z.coerce.date().optional().nullable(),
  isActive: z.boolean().optional(),
})

// List query params schema
export const listDuyuruQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  onlyActive: z.coerce.boolean().default(true),
  sortBy: z.enum(["oncelik", "publishedAt", "createdAt", "updatedAt"]).default("oncelik"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
})

// Types
export type DuyuruOncelik = z.infer<typeof duyuruOncelikEnum>
export type CreateDuyuruInput = z.infer<typeof createDuyuruSchema>
export type UpdateDuyuruInput = z.infer<typeof updateDuyuruSchema>
export type ListDuyuruQuery = z.infer<typeof listDuyuruQuerySchema>
