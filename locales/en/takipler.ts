import type { TakiplerTranslations } from "@/types/locale"

export const takipler: TakiplerTranslations = {
  // Page
  pageTitle: "Follow-ups",
  pageDescription: "Manage customer follow-ups",
  newTakipButton: "New Follow-up",

  newTakip: "New Follow-up",
  editTakip: "Edit Follow-up",
  takipDetails: "Follow-up Details",
  addTakip: "Add Follow-up",

  // Fields
  startDate: "Start Date",
  endDate: "End Date",
  remainingDays: "Remaining Days",
  expired: "Expired",
  daysLeft: "{days} days left",
  currentStatus: "Current Status",
  newStatus: "New Status",
  selectStatus: "Select status",
  auto90Days: "Automatically calculated +90 days from start date",

  // Status
  durum: "Status",
  durumUzatilacak: "To Be Extended",
  durumDevamEdecek: "Will Continue",
  durumSonlandirilacak: "To Be Terminated",
  durumUzatildi: "Extended",
  durumBekliyor: "Waiting",

  // Modal descriptions
  updateStatusTitle: "Update Follow-up Status",
  updateStatusDescription: "Update follow-up status for phone {gsm}",
  addTakipDescription: "Create a new follow-up record for phone {gsm}.",
  activeWillBeExtended: "Existing active follow-up records will automatically be marked as \"Extended\".",
  endDateBeforeStart: "End date cannot be before start date",

  // Selection
  selectedGsms: "Selected Phones",
  searchInSelected: "Search in selected...",

  // Table columns
  person: "Person",
  alarm: "Alarm",
  daysPassed: "{days} days passed",
  daysRemaining: "{days} days",
  activeTakip: "Active follow-up",

  // Sort options
  endDateNearFar: "End Date (Near → Far)",
  endDateFarNear: "End Date (Far → Near)",
  startDateOldNew: "Start Date (Old → New)",
  startDateNewOld: "Start Date (New → Old)",

  // Form
  selectGsm: "Phone",
  selectGsmPlaceholder: "Select phone number...",
  editTakipDescription: "Update follow-up information.",
  newTakipDescription: "Create a new follow-up record.",

  // Delete
  deleteTakip: "Delete Follow-up",
  deleteTakipConfirm: "Are you sure you want to delete this follow-up? This action cannot be undone and associated alarms will also be deleted.",

  // Search
  searchPlaceholder: "Search by customer name or phone...",
}
