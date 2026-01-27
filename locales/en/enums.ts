import type { EnumsTranslations } from "@/types/locale"

export const enums: EnumsTranslations = {
  // Takip Durumu
  takipDurumu: {
    UZATILACAK: "To Be Extended",
    DEVAM_EDECEK: "To Continue",
    SONLANDIRILACAK: "To Be Terminated",
    UZATILDI: "Extended",
  },

  // Alarm Durumu
  alarmDurumu: {
    BEKLIYOR: "Waiting",
    TETIKLENDI: "Triggered",
    GORULDU: "Seen",
    IPTAL: "Canceled",
  },

  // Alarm Tipi
  alarmTipi: {
    MUSTERI: "Customer",
    ADAY: "Candidate",
    TAKIP_BITIS: "Decision End",
    ODEME_HATIRLATMA: "Payment Reminder",
    OZEL: "Custom",
  },

  // Personel Rol
  personelRol: {
    ADMIN: "Admin",
    YONETICI: "Manager",
    PERSONEL: "Staff",
  },

  // Kisi Tipi
  kisiTipi: {
    MUSTERI: "Customer",
    ADAY: "Candidate",
  },

  // Boolean Labels
  boolean: {
    yes: "Yes",
    no: "No",
    active: "Active",
    inactive: "Inactive",
    paused: "Paused",
    notPaused: "Not Paused",
    tt: "TT",
    notTt: "Not TT",
    pio: "PIO",
    notPio: "Not PIO",
    asli: "Judicial",
    notAsli: "Not Judicial",
    primary: "Primary",
    notPrimary: "Not Primary",
    faaliyet: "Has Activity",
    noFaaliyet: "No Activity",
  },

  // System
  system: "System",
  unknown: "Unknown",
  none: "None",

  // Date indicators
  daysRemaining: "days remaining",
  expired: "Expired",
  neverLoggedIn: "Never logged in",
}
