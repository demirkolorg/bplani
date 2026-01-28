import { z } from "zod"

// PersonelRol enum
export const personelRolValues = ["ADMIN", "YONETICI", "PERSONEL"] as const
export type PersonelRol = (typeof personelRolValues)[number]

// Şifre validation (en az 6 karakter)
const parolaSchema = z.string()
  .min(6, "Şifre en az 6 karakter olmalıdır")
  .max(100, "Şifre en fazla 100 karakter olabilir")

// Create Personel schema
export const createPersonelSchema = z.object({
  visibleId: z.string()
    .length(6, "Kullanıcı ID 6 haneli olmalıdır")
    .regex(/^\d{6}$/, "Kullanıcı ID sadece rakamlardan oluşmalıdır"),
  ad: z.string().min(1, "Ad zorunludur").max(100, "Ad en fazla 100 karakter olabilir"),
  soyad: z.string().min(1, "Soyad zorunludur").max(100, "Soyad en fazla 100 karakter olabilir"),
  parola: parolaSchema,
  rol: z.enum(personelRolValues).default("PERSONEL"),
  fotograf: z.string().max(500, "Fotoğraf yolu en fazla 500 karakter olabilir").optional().nullable(),
  isActive: z.boolean().default(true),
})

// Update Personel schema (parola hariç, diğer alanlar opsiyonel)
export const updatePersonelSchema = z.object({
  visibleId: z.string()
    .length(6, "Kullanıcı ID 6 haneli olmalıdır")
    .regex(/^\d{6}$/, "Kullanıcı ID sadece rakamlardan oluşmalıdır")
    .optional(),
  ad: z.string().min(1, "Ad zorunludur").max(100, "Ad en fazla 100 karakter olabilir").optional(),
  soyad: z.string().min(1, "Soyad zorunludur").max(100, "Soyad en fazla 100 karakter olabilir").optional(),
  fotograf: z.string().max(500, "Fotoğraf yolu en fazla 500 karakter olabilir").optional().nullable(),
  isActive: z.boolean().optional(),
})

// Change password schema
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Mevcut şifre zorunludur").optional(), // Admin değiştirirken opsiyonel
  newPassword: parolaSchema,
  confirmPassword: z.string().min(1, "Şifre tekrarı zorunludur"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Şifreler eşleşmiyor",
  path: ["confirmPassword"],
})

// Change role schema
export const changeRolSchema = z.object({
  rol: z.enum(personelRolValues),
})

// List query params schema
export const listPersonelQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100000).default(10000),
  search: z.string().optional(),
  rol: z.enum(personelRolValues).optional(),
  isActive: z.coerce.boolean().optional(),
  sortBy: z.enum(["ad", "soyad", "visibleId", "rol", "createdAt", "updatedAt", "lastLoginAt"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
})

// Types
export type CreatePersonelInput = z.infer<typeof createPersonelSchema>
export type UpdatePersonelInput = z.infer<typeof updatePersonelSchema>
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>
export type ChangeRolInput = z.infer<typeof changeRolSchema>
export type ListPersonelQuery = z.infer<typeof listPersonelQuerySchema>

// Rol labels for display
export const personelRolLabels: Record<PersonelRol, string> = {
  ADMIN: "Admin",
  YONETICI: "Yönetici",
  PERSONEL: "Personel",
}

// Rol colors for badges
export const personelRolColors: Record<PersonelRol, string> = {
  ADMIN: "bg-red-50 text-red-700 border-red-300 dark:bg-red-950 dark:text-red-300 dark:border-red-700",
  YONETICI: "bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-700",
  PERSONEL: "bg-gray-50 text-gray-700 border-gray-300 dark:bg-gray-950 dark:text-gray-300 dark:border-gray-700",
}
