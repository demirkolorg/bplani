import type { DashboardTranslations } from "@/types/locale"

export const dashboard: DashboardTranslations = {
  // Welcome
  welcomeMessage: "Welcome, {name}",
  subtitle: "ALTAY - Analysis Listing and Decision Management",

  // Search
  searchPlaceholder: "Search by TC, Phone, Name, Address...",
  searchTagTc: "TC: 11 digits",
  searchTagPhone: "Phone: 10-12 digits",
  searchTagName: "Name: First Last",
  searchTagAddress: "Address: Province/District",

  // Stats
  kisiler: "People",
  gsm: "Phone Numbers",
  takipler: "Decisions",
  tanitimlar: "Events",
  operasyonlar: "Operations",
  araclar: "Vehicles",
  alarmlar: "Alarms",

  // Quick Actions
  quickActions: "Quick Actions",
  newKisi: "New Person",
  newTakip: "New Decision",
  newTanitim: "New Event",
  newOperasyon: "New Operation",

  // Alerts
  expiringSoon: "Expiring Soon",
  pendingAlarms: "{count} pending alarms",
}
