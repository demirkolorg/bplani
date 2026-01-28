import type { DuyurularTranslations } from "@/types/locale"

export const duyurular: DuyurularTranslations = {
  // Page
  pageTitle: "Duyurular",
  pageDescription: "Sistem duyurularını görüntüleyin ve yönetin",
  pageSubtitle: "Son güncellemeler ve önemli duyurular",
  newDuyuruButton: "Yeni Duyuru",

  // Form
  newDuyuru: "Yeni Duyuru",
  editDuyuru: "Duyuru Düzenle",
  duyuruDetails: "Duyuru Detayları",

  // Fields
  title: "Başlık",
  titlePlaceholder: "Duyuru başlığı...",
  content: "İçerik",
  contentPlaceholder: "Duyuru içeriği...",
  priority: "Öncelik",
  publishDate: "Yayın Tarihi",
  expiryDate: "Bitiş Tarihi",
  expiryDatePlaceholder: "Bitiş tarihi seçin (opsiyonel)",
  hasExpiryDate: "Bitiş Tarihi Var",
  status: "Durum",
  active: "Aktif",
  inactive: "Pasif",

  // Priority levels
  priorityNormal: "Normal",
  priorityImportant: "Önemli",
  priorityCritical: "Kritik",

  // Table columns
  createdBy: "Oluşturan",
  updatedBy: "Güncelleyen",
  createdAt: "Oluşturulma",
  updatedAt: "Güncelleme",
  unknownUser: "Bilinmeyen",

  // Sort options
  prioritySort: "Öncelik",
  publishDateNewOld: "Yayın Tarihi (Yeni → Eski)",
  publishDateOldNew: "Yayın Tarihi (Eski → Yeni)",
  createdNewOld: "Oluşturulma (Yeni → Eski)",
  createdOldNew: "Oluşturulma (Eski → Yeni)",

  // Delete
  deleteDuyuru: "Duyuruyu Sil",
  deleteDuyuruConfirm: "Bu duyuruyu silmek istediğinizden emin misiniz?",
  deleteSuccess: "Duyuru başarıyla silindi",
  deleteError: "Duyuru silinirken bir hata oluştu",

  // Create/Update
  createSuccess: "Duyuru başarıyla oluşturuldu",
  createError: "Duyuru oluşturulurken bir hata oluştu",
  updateSuccess: "Duyuru başarıyla güncellendi",
  updateError: "Duyuru güncellenirken bir hata oluştu",

  // Validation
  titleRequired: "Başlık zorunludur",
  contentRequired: "İçerik zorunludur",
  titleMaxLength: "Başlık en fazla 200 karakter olabilir",
  contentMaxLength: "İçerik en fazla 10.000 karakter olabilir",

  // Actions
  save: "Kaydet",
  cancel: "İptal",
  edit: "Düzenle",
  delete: "Sil",
  creating: "Oluşturuluyor...",
  updating: "Güncelleniyor...",

  // Empty state
  noAnnouncements: "Henüz duyuru bulunmamaktadır",
  noAnnouncementsDescription: "Yeni bir duyuru oluşturarak başlayın",

  // Expired
  expired: "Süresi Doldu",
  expiresOn: "Bitiş Tarihi",
  noExpiry: "Süresiz",

  // Permissions
  permissionDenied: "Bu işlem için yetkiniz yok",
  adminOnly: "Sadece ADMIN ve YONETICI duyuru yönetebilir",
}
