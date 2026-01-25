import type { DashboardTranslations } from "@/types/locale"

export const dashboard: DashboardTranslations = {
  // Welcome
  welcomeMessage: "Hoş Geldin, {name}",
  subtitle: "ALTAY - Analiz Takip Yönetim Sistemi",

  // Search
  searchPlaceholder: "TC, Telefon, İsim, Adres ile arama yapın...",
  searchTagTc: "TC: 11 rakam",
  searchTagPhone: "Tel: 10-12 rakam",
  searchTagName: "İsim: Ad Soyad",
  searchTagAddress: "Adres: İl/İlçe",

  // Stats
  kisiler: "Kişiler",
  gsm: "GSM",
  takipler: "Takipler",
  tanitimlar: "Tanıtımlar",
  operasyonlar: "Operasyonlar",
  araclar: "Araçlar",
  alarmlar: "Alarmlar",

  // Quick Actions
  quickActions: "Hızlı İşlemler",
  newKisi: "Yeni Kişi",
  newTakip: "Yeni Takip",
  newTanitim: "Yeni Tanıtım",
  newOperasyon: "Yeni Operasyon",

  // Alerts
  expiringSoon: "Yakında Bitecek Takipler",
  pendingAlarms: "{count} bekleyen alarm",
}
