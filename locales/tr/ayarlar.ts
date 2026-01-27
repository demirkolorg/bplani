import type { AyarlarTranslations } from "@/types/locale"

export const ayarlar: AyarlarTranslations = {
  // Page
  pageTitle: "Ayarlar",
  pageDescription: "Sistem ayarlarını yapılandırın",
  save: "Kaydet",
  loading: "Yükleniyor...",

  // Tab labels
  alarmTab: "Alarm",
  takipTab: "Karar",
  bildirimTab: "Bildirim",
  gorunumTab: "Görünüm",

  // Alarm settings
  alarmTitle: "Alarm Ayarları",
  alarmDescription: "Karar bitiş alarmları için varsayılan gün sayılarını ayarlayın",
  firstAlarm: "İlk Alarm (gün önce)",
  firstAlarmDesc: "Karar bitiş tarihinden kaç gün önce ilk alarm tetiklensin",
  secondAlarm: "İkinci Alarm (gün önce)",
  secondAlarmDesc: "Karar bitiş tarihinden kaç gün önce ikinci alarm tetiklensin",
  currentRules: "Mevcut Alarm Kuralları",
  beforeEndDate1: "Bitiş tarihinden {days} gün önce ilk alarm",
  beforeEndDate2: "Bitiş tarihinden {days} gün önce ikinci alarm",

  // Takip settings
  takipTitle: "Karar Ayarları",
  takipDescription: "Yeni karar oluşturma için varsayılan değerleri ayarlayın",
  defaultDuration: "Varsayılan Karar Süresi (gün)",
  defaultDurationDesc: "Yeni karar oluşturulduğunda varsayılan süre (başlama tarihinden itibaren)",
  exampleScenario: "Örnek Senaryo",
  exampleScenarioText: "Bugün oluşturulan bir karar, {duration} gün sonra sona erecek. İlk alarm {alarm1}. günde, ikinci alarm {alarm2}. günde tetiklenecek.",

  // Notification settings
  notificationTitle: "Bildirim Ayarları",
  notificationDescription: "Bildirim tercihlerinizi yapılandırın",
  emailNotifications: "E-posta Bildirimleri",
  emailNotificationsDesc: "Alarm tetiklendiğinde e-posta gönder",
  browserNotifications: "Tarayıcı Bildirimleri",
  browserNotificationsDesc: "Alarm tetiklendiğinde tarayıcı bildirimi göster",
  checkFrequency: "Bildirim Kontrol Sıklığı",
  checkFrequencyDesc: "Yeni bildirimlerin ne sıklıkta kontrol edileceği",
  seconds30: "30 saniye",
  minute1: "1 dakika",
  minutes5: "5 dakika",
  minutes10: "10 dakika",
  notificationComingSoon: "Bildirim ayarları yakında aktif olacak.",

  // Appearance settings
  appearanceTitle: "Görünüm Ayarları",
  appearanceDescription: "Uygulama görünümünü özelleştirin",
  defaultTheme: "Varsayılan Tema",
  defaultThemeDesc: "Uygulama açıldığında kullanılacak tema",
  themeLight: "Açık",
  themeDark: "Koyu",
  themeSystem: "Sistem",
  tableDensity: "Tablo Yoğunluğu",
  tableDensityDesc: "Tablolardaki satır yüksekliği",
  densityCompact: "Sıkışık",
  densityNormal: "Normal",
  densityWide: "Geniş",
  appearanceComingSoon: "Görünüm ayarları yakında aktif olacak.",

  // Legacy (keeping for backward compatibility)
  title: "Ayarlar",
  takipDefaults: "Karar Varsayılanları",
  takipDefaultsDesc: "Yeni karar oluşturma için varsayılan değerleri ayarlayın",
  defaultTakipDuration: "Varsayılan Karar Süresi",
  defaultTakipDurationDesc: "Yeni karar oluşturulduğunda varsayılan süre (başlama tarihinden itibaren)",
  notificationCheckFrequency: "Bildirim Kontrol Sıklığı",
  notificationCheckFrequencyDesc: "Yeni bildirimlerin ne sıklıkta kontrol edileceği",
}
