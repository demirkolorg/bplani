import type { TakiplerTranslations } from "@/types/locale"

export const takipler: TakiplerTranslations = {
  // Page
  pageTitle: "Kararlar",
  pageDescription: "Hedef kararlarını yönetin",
  newTakipButton: "Yeni Karar",
  newTakipPageTitle: "Yeni Karar Ekle",
  newTakipPageDescription: "Karar eklemek istediğiniz GSM numaralarını seçin",

  newTakip: "Yeni Karar",
  editTakip: "Karar Düzenle",
  takipDetails: "Karar Detayları",
  addTakip: "Karar Ekle",

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
  updateStatusTitle: "Karar Durumu Güncelle",
  updateStatusDescription: "{gsm} numaralı GSM için karar durumunu güncelleyin",
  addTakipDescription: "{gsm} numaralı GSM için yeni karar kaydı oluşturun.",
  activeWillBeExtended: "Mevcut aktif karar kayıtları otomatik olarak \"Uzatıldı\" durumuna geçecektir.",
  endDateBeforeStart: "Bitiş tarihi başlama tarihinden önce olamaz",
  createModalTitle: "Yeni Karar Oluştur",
  createModalDescription: "Yeni bir karar oluşturun. {name} için otomatik olarak oluşturulacak.",
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
  activeTakip: "Aktif karar",

  // Sort options
  endDateNearFar: "Bitiş Tarihi (Yakın → Uzak)",
  endDateFarNear: "Bitiş Tarihi (Uzak → Yakın)",
  startDateOldNew: "Başlama Tarihi (Eski → Yeni)",
  startDateNewOld: "Başlama Tarihi (Yeni → Eski)",

  // Form
  selectGsm: "GSM",
  selectGsmPlaceholder: "GSM numarası seçin...",
  editTakipDescription: "Karar bilgilerini güncelleyin.",
  newTakipDescription: "Yeni bir karar kaydı oluşturun.",

  // Delete
  deleteTakip: "Kararı Sil",
  deleteTakipConfirm: "Bu kararı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz ve bağlı alarmlar da silinecektir.",

  // Search
  searchPlaceholder: "Hedef adı veya GSM ile ara...",

  // New Takip Page
  availableGsms: "Mevcut GSM'ler",
  itemsCount: "{count} adet",
  searchGsmOrCustomer: "GSM veya hedef ara...",
  removeAll: "Tümünü Kaldır",
  noResultsFound: "Sonuç bulunamadı",
  allGsmsSelected: "Tüm GSM'ler seçildi",
  selectGsmInstructions: "Karar eklemek için sol listeden GSM seçin",
  takipSettings: "Karar Ayarları",
  selectedGsmCount: "Seçilen GSM:",
  createMultipleTakip: "{count} Karar Oluştur",
  defaultPlusDays: "Varsayılan: Başlama + 90 gün",
  eachGsmWillGetSeparateTakip: "Her GSM için ayrı karar kaydı oluşturulacak.",
  canUpdateStatusIndividually: "Sonrasında her birinin durumunu ayrı ayrı değiştirebilirsiniz.",

  // Validation
  selectAtLeastOne: "En az bir GSM seçmelisiniz",

  // Detail Page
  gsmNotFound: "GSM bulunamadı",
  backToTakipler: "Kararlara Dön",
  goToPersonDetail: "Kişi Detayına Git",
  addNewTakip: "Yeni Karar Ekle",
  noActiveTakip: "Aktif karar bulunmuyor",
  noActiveTakipDescription: "Bu GSM için aktif bir karar kaydı bulunmamaktadır.",
  takipHistory: "Karar Geçmişi",
  duration: "Süre",
  createdAt: "Oluşturulma",
  alarmList: "Alarmlar",
  triggered: "Tetiklendi",
  daysCount: "{days} gün",
}
