import type { EnumsTranslations } from "@/types/locale"

export const enums: EnumsTranslations = {
  // Takip Durumu
  takipDurumu: {
    UZATILACAK: "Uzatılacak",
    DEVAM_EDECEK: "Devam Edecek",
    SONLANDIRILACAK: "Sonlandırılacak",
    UZATILDI: "Uzatıldı",
  },

  // Alarm Durumu
  alarmDurumu: {
    BEKLIYOR: "Bekliyor",
    TETIKLENDI: "Tetiklendi",
    GORULDU: "Görüldü",
    IPTAL: "İptal",
  },

  // Alarm Tipi
  alarmTipi: {
    MUSTERI: "Müşteri",
    ADAY: "Aday",
    TAKIP_BITIS: "Karar Bitiş",
    ODEME_HATIRLATMA: "Ödeme Hatırlatma",
    OZEL: "Özel",
  },

  // Personel Rol
  personelRol: {
    ADMIN: "Admin",
    YONETICI: "Yönetici",
    PERSONEL: "Personel",
  },

  // Kisi Tipi
  kisiTipi: {
    MUSTERI: "Müşteri",
    ADAY: "Aday",
  },

  // Boolean Labels
  boolean: {
    yes: "Evet",
    no: "Hayır",
    active: "Aktif",
    inactive: "Pasif",
    paused: "Duraklatılmış",
    notPaused: "Duraklı Değil",
    tt: "TT",
    notTt: "TT Değil",
    pio: "PIO",
    notPio: "PIO Değil",
    asli: "Adli",
    notAsli: "Adli Değil",
    primary: "Birincil",
    notPrimary: "Birincil Değil",
    faaliyet: "Faaliyet Var",
    noFaaliyet: "Faaliyet Yok",
  },

  // System
  system: "Sistem",
  unknown: "Bilinmiyor",
  none: "Yok",

  // Date indicators
  daysRemaining: "gün kaldı",
  expired: "Süresi doldu",
  neverLoggedIn: "Hiç giriş yapmadı",
}
