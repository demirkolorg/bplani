import { z } from "zod"

// Ayar anahtarları
export const AyarKey = z.enum([
  "alarm_gun_once_1",      // İlk alarm (varsayılan 20 gün)
  "alarm_gun_once_2",      // İkinci alarm (varsayılan 15 gün)
  "takip_varsayilan_sure", // Takip varsayılan süresi (varsayılan 90 gün)
])

export type AyarKey = z.infer<typeof AyarKey>

// Ayar güncelleme
export const updateAyarSchema = z.object({
  key: AyarKey,
  value: z.string().min(1, "Değer gerekli"),
  aciklama: z.string().optional(),
})

export type UpdateAyarInput = z.infer<typeof updateAyarSchema>

// Toplu ayar güncelleme
export const updateAyarlarSchema = z.object({
  ayarlar: z.array(updateAyarSchema),
})

export type UpdateAyarlarInput = z.infer<typeof updateAyarlarSchema>

// Varsayılan değerler
export const DEFAULT_AYARLAR: Record<AyarKey, { value: string; aciklama: string }> = {
  alarm_gun_once_1: { value: "20", aciklama: "İlk alarm kaç gün önce tetiklensin" },
  alarm_gun_once_2: { value: "15", aciklama: "İkinci alarm kaç gün önce tetiklensin" },
  takip_varsayilan_sure: { value: "90", aciklama: "Yeni takip kaç gün süreli olsun" },
}
