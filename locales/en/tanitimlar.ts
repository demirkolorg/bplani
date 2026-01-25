import type { TanitimlarTranslations } from "@/types/locale"

export const tanitimlar: TanitimlarTranslations = {
  // Page
  pageTitle: "Introductions",
  pageDescription: "View and manage all introductions",
  newTanitimButton: "New Introduction",

  newTanitim: "New Introduction",
  editTanitim: "Edit Introduction",
  tanitimDetails: "Introduction Details",
  addToTanitim: "Add to Introduction",
  addToExistingTanitim: "Add to Existing Introduction",
  createNewTanitim: "Create New Introduction",

  // Fields
  tanitimDate: "Introduction Date",
  tanitimTime: "Introduction Time",
  tanitimAddress: "Introduction Address",
  dateTime: "Introduction Date and Time",
  addressDetail: "Address Detail",
  addressDetailPlaceholder: "Street, building no, apartment...",
  notesPlaceholder: "Notes about the introduction...",
  editTanitimDescription: "Update introduction information. You can manage participants from the detail page.",

  // Table columns
  date: "Date",
  address: "Address",
  count: "Count",
  notes: "Notes",
  unknownPerson: "Unknown",

  // Sort options
  dateNewOld: "Date (New → Old)",
  dateOldNew: "Date (Old → New)",
  createdNewOld: "Created (New → Old)",
  createdOldNew: "Created (Old → New)",

  // Delete
  deleteTanitim: "Delete Introduction",
  deleteTanitimConfirm: "Are you sure you want to delete this introduction? This action cannot be undone and all participant records will also be deleted.",

  // Search
  searchPlaceholder: "Search in address or notes...",

  // Participants
  participants: "Participants",
  selectedParticipants: "Selected Participants",
  searchInSelected: "Search in selected...",
  participantCount: "Selected Participants:",
  allSelectedWillBeAdded: "All selected people will be added as participants to this introduction.",
  searchPerson: "Search person...",
  allPersonsParticipants: "All people are already participants",
  personNotFound: "Person not found",
  noParticipantsYet: "No participants added yet",
  useAddButton: "Use the Add button above",
  removeParticipant: "Remove Participant",
  removeParticipantConfirm: "Are you sure you want to remove this person from the introduction?",
}
