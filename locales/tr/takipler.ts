import type { TakiplerTranslations } from "@/types/locale"

export const takipler: TakiplerTranslations = {
  // Page
  pageTitle: "Takipler",
  pageDescription: "Müşteri takiplerini yönetin",
  newTakipButton: "Yeni Takip",
  newTakipPageTitle: "Yeni Takip Ekle",
  newTakipPageDescription: "Takip eklemek istediğiniz GSM numaralarını seçin",

  newTakip: "Yeni Takip",
  editTakip: "Takip Düzenle",
  takipDetails: "Takip Detayları",
  addTakip: "Takip Ekle",

  // Fields
  startDate: "Başlama Tarihi",
  endDate: "Bitiş Tarihi",
  remainingDays: "Kalan Gün",
  expired: "Süresi doldu",
  daysLeft: "{days} gün kaldı",
  currentStatus: "Mevcut Durum",
  newStatus: "Yeni Durum",
  selectStatus: "Durum seçin",
  auto90Days: "Başlama tarihine göre otomatik +90 gün hesaplanır",

  // Status
  durum: "Durum",
  durumUzatilacak: "Uzatılacak",
  durumDevamEdecek: "Devam Edecek",
  durumSonlandirilacak: "Sonlandırılacak",
  durumUzatildi: "Uzatıldı",
  durumBekliyor: "Bekliyor",

  // Modal descriptions
  updateStatusTitle: "Takip Durumu Güncelle",
  updateStatusDescription: "{gsm} numaralı GSM için takip durumunu güncelleyin",
  addTakipDescription: "{gsm} numaralı GSM için yeni takip kaydı oluşturun.",
  activeWillBeExtended: "Mevcut aktif takip kayıtları otomatik olarak \"Uzatıldı\" durumuna geçecektir.",
  endDateBeforeStart: "Bitiş tarihi başlama tarihinden önce olamaz",
  createModalTitle: "Yeni Takip Oluştur",
  createModalDescription: "Yeni bir takip oluşturun. {name} için otomatik olarak oluşturulacak.",
  optional: "(Opsiyonel)",
  creating: "Oluşturuluyor...",

  // Selection
  selectedGsms: "Seçilen GSM'ler",
  searchInSelected: "Seçilenler içinde ara...",

  // Table columns
  person: "Kişi",
  alarm: "Alarm",
  daysPassed: "{days} gün geçti",
  daysRemaining: "{days} gün",
  activeTakip: "Aktif takip",

  // Sort options
  endDateNearFar: "Bitiş Tarihi (Yakın → Uzak)",
  endDateFarNear: "Bitiş Tarihi (Uzak → Yakın)",
  startDateOldNew: "Başlama Tarihi (Eski → Yeni)",
  startDateNewOld: "Başlama Tarihi (Yeni → Eski)",

  // Form
  selectGsm: "GSM",
  selectGsmPlaceholder: "GSM numarası seçin...",
  editTakipDescription: "Takip bilgilerini güncelleyin.",
  newTakipDescription: "Yeni bir takip kaydı oluşturun.",

  // Delete
  deleteTakip: "Takibi Sil",
  deleteTakipConfirm: "Bu takibi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz ve bağlı alarmlar da silinecektir.",

  // Search
  searchPlaceholder: "Müşteri adı veya GSM ile ara...",

  // New Takip Page
  availableGsms: "Mevcut GSM'ler",
  itemsCount: "{count} adet",
  searchGsmOrCustomer: "GSM veya müşteri ara...",
  removeAll: "Tümünü Kaldır",
  noResultsFound: "Sonuç bulunamadı",
  allGsmsSelected: "Tüm GSM'ler seçildi",
  selectGsmInstructions: "Takip eklemek için sol listeden GSM seçin",
  takipSettings: "Takip Ayarları",
  selectedGsmCount: "Seçilen GSM:",
  createMultipleTakip: "{count} Takip Oluştur",
  defaultPlusDays: "Varsayılan: Başlama + 90 gün",
  eachGsmWillGetSeparateTakip: "Her GSM için ayrı takip kaydı oluşturulacak.",
  canUpdateStatusIndividually: "Sonrasında her birinin durumunu ayrı ayrı değiştirebilirsiniz.",

  // Validation
  selectAtLeastOne: "En az bir GSM seçmelisiniz",

  // Detail Page
  gsmNotFound: "GSM bulunamadı",
  backToTakipler: "Takiplere Dön",
  goToPersonDetail: "Kişi Detayına Git",
  addNewTakip: "Yeni Takip Ekle",
  noActiveTakipDescription: "Bu GSM için aktif bir takip kaydı bulunmamaktadır.",
  takipHistory: "Takip Geçmişi",
  duration: "Süre",
  createdAt: "Oluşturulma",
  alarmList: "Alarmlar",
  triggered: "Tetiklendi",
  daysCount: "{days} gün",
}
