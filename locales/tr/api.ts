import type { ApiMessagesTranslations } from "@/types/locale"

export const api: ApiMessagesTranslations = {
  // Common
  notFound: "{entity} bulunamadı",
  fetchError: "{entity} getirilirken bir hata oluştu",
  updateError: "{entity} güncellenirken bir hata oluştu",
  deleteError: "{entity} silinirken bir hata oluştu",
  createError: "{entity} oluşturulurken bir hata oluştu",
  deleteSuccess: "{entity} başarıyla silindi",
  genericError: "Bir hata oluştu",

  // Auth
  sessionRequired: "Oturum gerekli",
  adminRequired: "Admin yetkisi gereklidir",
  noPermission: "Bu işlem için yetkiniz yok",

  // Specific
  duplicateTc: "Bu TC Kimlik No ile kayıtlı bir kişi zaten var",
  fileNotFound: "Dosya bulunamadı",
  invalidFileType: "Geçersiz dosya türü. Sadece JPEG, PNG, WebP ve GIF desteklenir.",
  fileTooLarge: "Dosya boyutu 5MB'dan büyük olamaz",
  uploadError: "Dosya yüklenirken bir hata oluştu",
  invalidQueryParams: "Geçersiz sorgu parametreleri",
  invalidData: "Geçersiz veri",
}
