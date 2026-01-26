import type { TanitimlarTranslations } from "@/types/locale"

export const tanitimlar: TanitimlarTranslations = {
  // Page
  pageTitle: "Events",
  pageDescription: "View and manage all events",
  newTanitimButton: "New Event",
  newTanitimPageTitle: "New Event",
  newTanitimPageDescription: "Select participants and enter event information",

  newTanitim: "New Event",
  editTanitim: "Edit Event",
  tanitimDetails: "Event Details",
  addToTanitim: "Add to Event",
  addToExistingTanitim: "Add to Existing Event",
  createNewTanitim: "Create New Event",

  // Fields
  title: "Title",
  titlePlaceholder: "Event title...",
  tanitimDate: "Event Date",
  tanitimTime: "Event Time",
  tanitimAddress: "Event Address",
  dateTime: "Event Date and Time",
  addressDetail: "Address Detail",
  addressDetailPlaceholder: "Street, building no, apartment...",
  notesPlaceholder: "Notes about the event...",
  editTanitimDescription: "Update event information. You can manage participants from the detail page.",

  // Modal
  createModalTitle: "Create New Event",
  createModalDescription: "Create a new event. {name} will be automatically added as a participant.",
  optional: "(Optional)",
  creating: "Creating...",

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
  deleteTanitim: "Delete Event",
  deleteTanitimConfirm: "Are you sure you want to delete this event? This action cannot be undone and all participant records will also be deleted.",

  // Search
  searchPlaceholder: "Search in address or notes...",

  // Participants
  participants: "Participants",
  selectedParticipants: "Selected Participants",
  searchInSelected: "Search in selected...",
  participantCount: "Selected Participants:",
  allSelectedWillBeAdded: "All selected people will be added as participants to this event.",
  searchPerson: "Search person...",
  allPersonsParticipants: "All people are already participants",
  personNotFound: "Person not found",
  noParticipantsYet: "No participants added yet",
  useAddButton: "Use the Add button above",
  removeParticipant: "Remove Participant",
  removeParticipantConfirm: "Are you sure you want to remove this person from the event?",

  // New Tanitim Page
  availablePeople: "Available People",
  itemsCount: "{count} items",
  searchByNameOrTc: "Search by name or ID...",
  removeAll: "Remove All",
  noResultsFound: "No results found",
  allPeopleSelected: "All people selected",
  selectPeopleInstructions: "Select people from the left list to add to the event",
  tanitimInfo: "Event Information",
  createTanitimButton: "Create Event",

  // Additional
  selectedCountText: "events selected",
  notFound: "Event not found",
}
