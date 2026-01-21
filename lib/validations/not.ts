import { z } from "zod"

// Create Not schema
export const createNotSchema = z.object({
  musteriId: z.string().cuid("Geçersiz müşteri ID"),
  icerik: z.string().min(1, "Not içeriği zorunludur").max(10000, "Not içeriği en fazla 10000 karakter olabilir"),
})

// Update Not schema
export const updateNotSchema = z.object({
  icerik: z.string().min(1, "Not içeriği zorunludur").max(10000, "Not içeriği en fazla 10000 karakter olabilir"),
})

// Types
export type CreateNotInput = z.infer<typeof createNotSchema>
export type UpdateNotInput = z.infer<typeof updateNotSchema>
