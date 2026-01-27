import type { AlarmlarTranslations } from "@/types/locale"

export const alarmlar: AlarmlarTranslations = {
  // Page
  pageTitle: "Alarmlar",
  pageDescription: "Tüm alarmları görüntüleyin ve yönetin",

  // Types
  tipTakipBitis: "Karar Bitiş",
  tipOdemeHatirlatma: "Ödeme Hatırlatma",
  tipOzel: "Özel",

  // Status
  durumTetiklendi: "Tetiklendi",
  durumGoruldu: "Görüldü",
  durumIptal: "İptal",
  durumBekliyor: "Bekliyor",
  paused: "Duraklı",

  // Fields
  tetikTarihi: "Tetik Tarihi",
  gunOnce: "Gün Önce",
  olusturan: "Oluşturan",
  sistem: "Sistem",
  baslikMesaj: "Başlık / Mesaj",

  // Table columns
  durum: "Durum",
  tip: "Tip",
  person: "Kişi",
  days: "gün",

  // Date display
  daysAgo: "{days} gün geçti",
  today: "Bugün",
  daysLeft: "{days} gün kaldı",

  // Actions
  goToPerson: "Kişiye Git",
  markAsRead: "Görüldü İşaretle",
  pause: "Duraklat",
  resume: "Devam Ettir",

  // Delete
  deleteAlarm: "Alarmı Sil",
  deleteAlarmConfirm: "Bu alarmı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.",

  // Notifications
  noNotifications: "Bildirim yok",
  markAllRead: "Tümünü Okundu İşaretle",
  viewAllAlarms: "Tüm Alarmları Gör",

  // Sort
  tetikDateNear: "Tetik Tarihi (Yakın)",
  tetikDateFar: "Tetik Tarihi (Uzak)",
  createdNew: "Oluşturma (Yeni)",
  createdOld: "Oluşturma (Eski)",

  // Search
  searchPlaceholder: "Alarm ara (başlık, kişi adı, numara...)",
}
