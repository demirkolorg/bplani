import type { TakiplerTranslations } from "@/types/locale"

export const takipler: TakiplerTranslations = {
  // Page
  pageTitle: "Decisions",
  pageDescription: "Manage target decisions",
  newTakipButton: "New Decision",
  newTakipPageTitle: "Add New Decision",
  newTakipPageDescription: "Select phone numbers to add decisions",

  newTakip: "New Decision",
  editTakip: "Edit Decision",
  takipDetails: "Decision Details",
  addTakip: "Add Decision",

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
  updateStatusTitle: "Update Decision Status",
  updateStatusDescription: "Update decision status for phone {gsm}",
  addTakipDescription: "Create a new decision record for phone {gsm}.",
  activeWillBeExtended: "Existing active decision records will automatically be marked as \"Extended\".",
  endDateBeforeStart: "End date cannot be before start date",
  createModalTitle: "Create New Decision",
  createModalDescription: "Create a new decision. It will be automatically created for {name}.",
  optional: "(Optional)",
  creating: "Creating...",

  // Selection
  selectedGsms: "Selected Phones",
  searchInSelected: "Search in selected...",

  // Table columns
  person: "Person",
  alarm: "Alarm",
  daysPassed: "{days} days passed",
  daysRemaining: "{days} days",
  activeTakip: "Active decision",

  // Sort options
  endDateNearFar: "End Date (Near → Far)",
  endDateFarNear: "End Date (Far → Near)",
  startDateOldNew: "Start Date (Old → New)",
  startDateNewOld: "Start Date (New → Old)",

  // Form
  selectGsm: "Phone",
  selectGsmPlaceholder: "Select phone number...",
  editTakipDescription: "Update decision information.",
  newTakipDescription: "Create a new decision record.",

  // Delete
  deleteTakip: "Delete Decision",
  deleteTakipConfirm: "Are you sure you want to delete this decision? This action cannot be undone and associated alarms will also be deleted.",

  // Search
  searchPlaceholder: "Search by target name or phone...",

  // New Takip Page
  availableGsms: "Available Phones",
  itemsCount: "{count} items",
  searchGsmOrCustomer: "Search phone or target...",
  removeAll: "Remove All",
  noResultsFound: "No results found",
  allGsmsSelected: "All phones selected",
  selectGsmInstructions: "Select phones from the left list to add decisions",
  takipSettings: "Decision Settings",
  selectedGsmCount: "Selected Phones:",
  createMultipleTakip: "Create {count} Decisions",
  defaultPlusDays: "Default: Start date + 90 days",
  eachGsmWillGetSeparateTakip: "A separate decision record will be created for each phone.",
  canUpdateStatusIndividually: "You can update the status of each one individually later.",

  // Validation
  selectAtLeastOne: "You must select at least one phone number",

  // Detail Page
  gsmNotFound: "Phone not found",
  backToTakipler: "Back to Decisions",
  goToPersonDetail: "Go to Person Details",
  addNewTakip: "Add New Decision",
  noActiveTakip: "No active decision",
  noActiveTakipDescription: "There is no active decision record for this phone.",
  takipHistory: "Decision History",
  duration: "Duration",
  createdAt: "Created",
  alarmList: "Alarms",
  triggered: "Triggered",
  daysCount: "{days} days",
}
