import type { DashboardTranslations } from "@/types/locale"

export const dashboard: DashboardTranslations = {
  // Welcome
  welcomeMessage: "Hoş Geldin, {name}",
  subtitle: "ALTAY - Analiz Listeleme ve Karar Yönetimi",

  // Search
  searchPlaceholder: "TC, Telefon, İsim, Adres ile arama yapın...",
  searchTagTc: "TC: 11 rakam",
  searchTagPhone: "Tel: 10-12 rakam",
  searchTagName: "İsim: Ad Soyad",
  searchTagAddress: "Adres: İl/İlçe",

  // Stats
  kisiler: "Kişiler",
  gsm: "GSM",
  takipler: "Kararlar",
  tanitimlar: "Etkinlikler",
  operasyonlar: "Operasyonlar",
  araclar: "Araçlar",
  alarmlar: "Alarmlar",

  // Quick Actions
  quickActions: "Hızlı İşlemler",
  newKisi: "Yeni Kişi",
  newTakip: "Yeni Karar",
  newTanitim: "Yeni Etkinlik",
  newOperasyon: "Yeni Operasyon",

  // Alerts
  expiringSoon: "Yakında Bitecek Kararlar",
  pendingAlarms: "{count} bekleyen alarm",

  // Charts
  monthlyTrend: "Aylık Aktivite Trendi",
  monthlyTrendDesc: "Son 6 aydaki tanıtım ve operasyon sayıları",
  kisiDistribution: "Kişi Dağılımı",
  kisiDistributionDesc: "Müşteri ve aday kişi sayıları",
}
