import type { OperasyonlarTranslations } from "@/types/locale"

export const operasyonlar: OperasyonlarTranslations = {
  // Page
  pageTitle: "Operations",
  pageDescription: "View and manage all operations",
  newOperasyonButton: "New Operation",
  newOperasyonPageTitle: "New Operation",
  newOperasyonPageDescription: "Select participants and enter operation information",

  newOperasyon: "New Operation",
  editOperasyon: "Edit Operation",
  operasyonDetails: "Operation Details",
  addToOperasyon: "Add to Operation",
  addToExistingOperasyon: "Add to Existing Operation",
  createNewOperasyon: "Create New Operation",

  // Fields
  operasyonDate: "Operation Date",
  operasyonTime: "Operation Time",
  operasyonAddress: "Operation Address",
  dateTime: "Operation Date and Time",
  addressDetail: "Address Detail",
  addressDetailPlaceholder: "Street, building no, apartment...",
  notesPlaceholder: "Notes about the operation...",
  editOperasyonDescription: "Update operation information. You can manage participants from the detail page.",

  // Modal
  createModalTitle: "Create New Operation",
  createModalDescription: "Create a new operation. {name} will be automatically added as a participant.",
  optional: "(Optional)",
  creating: "Creating...",

  // Table columns
  date: "Date",
  address: "Address",
  count: "Count",
  notes: "Notes",
  unknownPerson: "Unknown",
  selectAtLeastOne: "You must select at least one participant",
  participantStats: "({mCount} Customers, {aCount} Leads)",

  // Sort options
  dateNewOld: "Date (New → Old)",
  dateOldNew: "Date (Old → New)",
  createdNewOld: "Created (New → Old)",
  createdOldNew: "Created (Old → New)",

  // Delete
  deleteOperasyon: "Delete Operation",
  deleteOperasyonConfirm: "Are you sure you want to delete this operation? This action cannot be undone and all participant records will also be deleted.",

  // Search
  searchPlaceholder: "Search in address or notes...",

  // Participants
  participants: "Participants",
  selectedParticipants: "Selected Participants",
  participantCount: "Selected Participants:",
  allSelectedWillBeAdded: "All selected people will be added as participants to this operation.",
  searchPerson: "Search person...",
  allPersonsParticipants: "All people are already participants",
  personNotFound: "Person not found",
  noParticipantsYet: "No participants added yet",
  useAddButton: "Use the Add button above",
  removeParticipant: "Remove Participant",
  removeParticipantConfirm: "Are you sure you want to remove this person from the operation?",

  // New Operasyon Page
  availablePeople: "Available People",
  itemsCount: "{count} items",
  searchByNameOrTc: "Search by name or ID...",
  searchInSelected: "Search in selected...",
  removeAll: "Remove All",
  noResultsFound: "No results found",
  allPeopleSelected: "All people selected",
  selectPeopleInstructions: "Select people from the left list to add to the operation",
  operasyonInfo: "Operation Information",
  createOperasyonButton: "Create Operation",

  // Additional
  selectedCountText: "operations selected",
  notFound: "Operation not found",
}
