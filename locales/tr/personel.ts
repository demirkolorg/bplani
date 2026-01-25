import type { PersonelTranslations } from "@/types/locale"

export const personel: PersonelTranslations = {
  // Page
  pageTitle: "Personel",
  pageDescription: "Tüm personelleri görüntüleyin ve yönetin",
  newPersonelButton: "Yeni Personel",

  newPersonel: "Yeni Personel",
  editPersonel: "Personel Düzenle",
  personelDetails: "Personel Detayları",
  deletePersonel: "Personeli Sil",
  deletePersonelConfirm: "Bu personeli silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.",
  createNewAccount: "Yeni bir personel hesabı oluşturun",

  // Fields
  visibleId: "Kullanıcı ID",
  rol: "Rol",
  rolAdmin: "Admin",
  rolYonetici: "Yönetici",
  rolPersonel: "Personel",

  // Descriptions
  rolDescriptions: "Rol Açıklamaları:",
  adminDescription: "Tüm yetkilere sahip, kullanıcı yönetimi yapabilir",
  yoneticiDescription: "Personel listesini görüntüleyebilir, düzenleme yapabilir",
  personelDescription: "Temel işlemleri yapabilir, personel modülünü göremez",

  // Form fields
  userId6Digit: "Kullanıcı ID (6 haneli)",
  password: "Şifre",
  passwordRepeat: "Şifre Tekrar",
  newPassword: "Yeni Şifre",
  photoUrl: "Fotoğraf URL (opsiyonel)",
  activeAccount: "Aktif Hesap",
  inactiveAccountHint: "Pasif hesaplar giriş yapamaz",

  // Form modal
  editPersonelDescription: "Personel bilgilerini güncelleyin",
  passwordDescription: "{name} için yeni şifre belirleyin",
  roleDescription: "{name} için yeni rol seçin",
  setNewPassword: "Şifreyi Değiştir",

  // Validation
  userIdRequired: "Kullanıcı ID zorunludur",
  userIdMustBe6Digits: "Kullanıcı ID 6 haneli rakam olmalıdır",
  firstNameRequired: "Ad zorunludur",
  lastNameRequired: "Soyad zorunludur",
  passwordRequired: "Şifre zorunludur",
  passwordMin6: "Şifre en az 6 karakter olmalıdır",
  passwordRepeatRequired: "Şifre tekrarı zorunludur",
  passwordsDoNotMatch: "Şifreler eşleşmiyor",
  operationFailed: "İşlem başarısız",
  passwordChangeFailed: "Şifre değiştirilemedi",
  roleChangeFailed: "Rol değiştirilemedi",

  // Table columns
  fullName: "Ad Soyad",
  status: "Durum",
  activity: "Aktivite",
  lastLogin: "Son Giriş",
  neverLoggedIn: "Hiç giriş yapmadı",

  // Status
  active: "Aktif",
  inactive: "Pasif",

  // Actions
  changePassword: "Şifre Değiştir",
  changeRole: "Rol Değiştir",
  deactivate: "Deaktive Et",
  activate: "Aktive Et",

  // Activity tooltips
  createdPersons: "Oluşturulan Kişiler",
  createdFollowups: "Oluşturulan Takipler",
  createdNotes: "Oluşturulan Notlar",
  createdIntroductions: "Oluşturulan Tanıtımlar",

  // Sort options
  nameAZ: "Ad (A → Z)",
  nameZA: "Ad (Z → A)",
  surnameAZ: "Soyad (A → Z)",
  surnameZA: "Soyad (Z → A)",
  lastLoginNewOld: "Son Giriş (Yeni → Eski)",
  lastLoginOldNew: "Son Giriş (Eski → Yeni)",
  createdNewOld: "Oluşturma (Yeni → Eski)",
  createdOldNew: "Oluşturma (Eski → Yeni)",

  // Search
  searchPlaceholder: "Ad, soyad veya ID ile ara...",
}
