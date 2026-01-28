import { z } from "zod"

// Enum types
export const AlarmTip = z.enum(["TAKIP_BITIS", "ODEME_HATIRLATMA", "OZEL"])
export type AlarmTip = z.infer<typeof AlarmTip>

export const AlarmDurum = z.enum(["BEKLIYOR", "TETIKLENDI", "GORULDU", "IPTAL"])
export type AlarmDurum = z.infer<typeof AlarmDurum>

// Create Alarm schema
export const createAlarmSchema = z.object({
  takipId: z.string().cuid("Geçersiz Takip ID").optional().nullable(),
  tip: AlarmTip,
  baslik: z.string().max(200, "Başlık en fazla 200 karakter olabilir").optional().nullable(),
  mesaj: z.string().max(1000, "Mesaj en fazla 1000 karakter olabilir").optional().nullable(),
  tetikTarihi: z.coerce.date(),
  gunOnce: z.number().int().min(1).max(365).default(20),
})

// Update Alarm schema
export const updateAlarmSchema = z.object({
  baslik: z.string().max(200, "Başlık en fazla 200 karakter olabilir").optional().nullable(),
  mesaj: z.string().max(1000, "Mesaj en fazla 1000 karakter olabilir").optional().nullable(),
  tetikTarihi: z.coerce.date().optional(),
  gunOnce: z.number().int().min(1).max(365).optional(),
  isPaused: z.boolean().optional(),
  durum: AlarmDurum.optional(),
})

// List query params schema
export const listAlarmQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100000).default(10000),
  search: z.string().optional(),
  tip: AlarmTip.optional(),
  durum: AlarmDurum.optional(),
  takipId: z.string().cuid().optional(),
  aktifOnly: z.coerce.boolean().optional(), // Sadece bekleyen/tetiklenen
  sortBy: z.enum(["tetikTarihi", "createdAt", "durum"]).default("tetikTarihi"),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
})

// Bildirim query schema (header için)
export const bildirimQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(20).default(10),
})

// Alarm Ayar schema
export const alarmAyarSchema = z.object({
  defaultGunOnce: z.number().int().min(1).max(365).default(20),
  otomatikAlarmAktif: z.boolean().default(true),
})

// Types
export type CreateAlarmInput = z.infer<typeof createAlarmSchema>
export type UpdateAlarmInput = z.infer<typeof updateAlarmSchema>
export type ListAlarmQuery = z.infer<typeof listAlarmQuerySchema>
export type BildirimQuery = z.infer<typeof bildirimQuerySchema>
export type AlarmAyarInput = z.infer<typeof alarmAyarSchema>
