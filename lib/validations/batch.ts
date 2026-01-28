import { z } from "zod"

/**
 * Batch delete schema
 * For deleting multiple records at once
 */
export const batchDeleteSchema = z.object({
  ids: z.array(z.string().uuid("Geçersiz ID formatı"))
    .min(1, "En az bir ID gerekli")
    .max(100, "Maksimum 100 kayıt silinebilir"),
})

/**
 * Batch archive schema
 * For archiving/unarchiving multiple records
 */
export const batchArchiveSchema = z.object({
  ids: z.array(z.string().uuid("Geçersiz ID formatı"))
    .min(1, "En az bir ID gerekli")
    .max(100, "Maksimum 100 kayıt işlenebilir"),
  isArchived: z.boolean(),
})

/**
 * Batch update schema
 * For updating common fields across multiple records
 */
export const batchUpdateSchema = z.object({
  ids: z.array(z.string().uuid("Geçersiz ID formatı"))
    .min(1, "En az bir ID gerekli")
    .max(100, "Maksimum 100 kayıt güncellenebilir"),
  data: z.record(z.string(), z.unknown()),
})

// Types
export type BatchDeleteInput = z.infer<typeof batchDeleteSchema>
export type BatchArchiveInput = z.infer<typeof batchArchiveSchema>
export type BatchUpdateInput = z.infer<typeof batchUpdateSchema>

/**
 * Batch operation result
 */
export interface BatchOperationResult {
  success: number
  failed: number
  archived?: number
  deleted?: number
  errors?: Array<{
    id: string
    error: string
  }>
}
