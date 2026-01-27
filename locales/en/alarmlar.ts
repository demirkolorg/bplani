import type { AlarmlarTranslations } from "@/types/locale"

export const alarmlar: AlarmlarTranslations = {
  // Page
  pageTitle: "Alarms",
  pageDescription: "View and manage all alarms",

  // Types
  tipTakipBitis: "Decision End",
  tipOdemeHatirlatma: "Payment Reminder",
  tipOzel: "Custom",

  // Status
  durumTetiklendi: "Triggered",
  durumGoruldu: "Seen",
  durumIptal: "Cancelled",
  durumBekliyor: "Waiting",
  paused: "Paused",

  // Fields
  tetikTarihi: "Trigger Date",
  gunOnce: "Days Before",
  olusturan: "Created By",
  sistem: "System",
  baslikMesaj: "Title / Message",

  // Table columns
  durum: "Status",
  tip: "Type",
  person: "Person",
  days: "days",

  // Date display
  daysAgo: "{days} days ago",
  today: "Today",
  daysLeft: "{days} days left",

  // Actions
  goToPerson: "Go to Person",
  markAsRead: "Mark as Seen",
  pause: "Pause",
  resume: "Resume",

  // Delete
  deleteAlarm: "Delete Alarm",
  deleteAlarmConfirm: "Are you sure you want to delete this alarm? This action cannot be undone.",

  // Notifications
  noNotifications: "No notifications",
  markAllRead: "Mark All as Read",
  viewAllAlarms: "View All Alarms",

  // Sort
  tetikDateNear: "Trigger Date (Near)",
  tetikDateFar: "Trigger Date (Far)",
  createdNew: "Created (New)",
  createdOld: "Created (Old)",

  // Search
  searchPlaceholder: "Search alarms (title, person name, number...)",
}
