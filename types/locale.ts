export type Locale = "tr" | "en"

export interface CommonTranslations {
  // Actions
  save: string
  cancel: string
  delete: string
  edit: string
  create: string
  add: string
  close: string
  confirm: string
  search: string
  update: string
  submit: string
  remove: string
  refresh: string

  // States
  loading: string
  saving: string
  deleting: string
  adding: string
  updating: string
  removing: string

  // Results
  noData: string
  confirmDelete: string
  yes: string
  no: string
  active: string
  inactive: string

  // UI Elements
  actions: string
  details: string
  detail: string
  all: string
  select: string
  selectAll: string
  clear: string
  clearSelection: string
  filter: string
  filters: string
  reset: string
  apply: string
  back: string
  next: string
  previous: string
  view: string
  viewAll: string
  download: string
  upload: string
  copy: string
  copied: string
  quickAdd: string

  // Status
  error: string
  success: string
  warning: string
  info: string
  required: string
  optional: string
  none: string
  other: string
  total: string

  // Date/Time
  date: string
  time: string
  dateTime: string
  from: string
  to: string
  day: string
  days: string

  // General
  status: string
  type: string
  name: string
  description: string
  note: string
  notes: string
  primary: string
  makePrimary: string
  alreadyPrimary: string
  history: string
  more: string
  location: string
  participants: string
  vehicles: string

  // Person
  firstName: string
  lastName: string
  fullName: string

  // Format placeholders
  dateFormatPlaceholder: string
  timeFormatPlaceholder: string
  tcFormatPlaceholder: string

  // Search placeholders
  searchGsmOrCustomer: string
  selectGsm: string
  noResultsFound: string
  gsmNotFound: string
  categoryNotFound: string

  // Labels
  tcLabel: string
  gsmLabel: string
  ttYes: string
  ttNo: string

  // Status badges
  added: string
  cleared: string

  // Navigation
  backToOperations: string
  backToIntroductions: string

  // Selection
  selectedCount: string

  // UI Controls
  toggleTheme: string
  switchToEnglish: string
  switchToTurkish: string

  // Misc
  or: string
  createNew: string
  createNewVehicle: string

  // System values
  system: string
  customer: string
  candidate: string

  // Time expressions
  daysRemaining: string
  daysBefore: string
  expired: string
  expiredDaysAgo: string
  neverLoggedIn: string

  // Quick actions
  quickActions: string
  quickActionsDescription: string
}

export interface SidebarTranslations {
  general: string
  home: string
  records: string
  activities: string
  definitions: string
  management: string
  system: string
  subtitle: string
  menu: string
  other: string
}

export interface NavigationTranslations {
  home: string
  dashboard: string
  kisiler: string
  numaralar: string
  araclar: string
  takipler: string
  tanitimlar: string
  operasyonlar: string
  personel: string
  alarmlar: string
  tanimlamalar: string
  loglar: string
  ayarlar: string
  profil: string
  logout: string
  faaliyetAlanlari: string
  advancedSearch: string
  duyurular: string
}

export interface TableTranslations {
  searchPlaceholder: string
  noRecords: string
  showingRecords: string
  rowsPerPage: string
  page: string
  of: string
  sortBy: string
  sortAsc: string
  sortDesc: string
  columnFilters: string
  visibleColumns: string
  filterPlaceholder: string
  noSortFound: string
  byField: string
  byDate: string
  addedNewOld: string
  addedOldNew: string
  updatedNewOld: string
  updatedOldNew: string
  noRecordsAlt: string
  dateNewOld: string
  dateOldNew: string
  createdNewOld: string
  createdOldNew: string
  startDateOldNew: string
  startDateNewOld: string
  lastLoginNewOld: string
  lastLoginOldNew: string
  nameAZ: string
  nameZA: string
  newest: string
  exportToExcel: string
  exportingToExcel: string
  clearFilters: string
}

export interface AuthTranslations {
  login: string
  logout: string
  username: string
  password: string
  passwordRepeat: string
  newPassword: string
  currentPassword: string
  rememberMe: string
  forgotPassword: string
  loginError: string
  loginSuccess: string
  loggingIn: string
  logoutConfirm: string
  loginTitle: string
  loginSubtitle: string
  identityNumber: string
  genericError: string
  profile: string
  accountSettings: string
  notifications: string
  admin: string
  manager: string
  staff: string
  user: string
  changePassword: string
  passwordsDoNotMatch: string
  accountDisabled: string
  invalidPassword: string
  userNotFound: string
  lastLogin: string
  neverLoggedIn: string
  activeAccount: string
  inactiveAccountHint: string
  userId6Digit: string
}

export interface DialogTranslations {
  areYouSure: string
  cannotUndo: string
  deleteTitle: string
  deleteDescription: string
  removeTitle: string
  removeDescription: string
}

export interface ValidationTranslations {
  required: string
  minLength: string
  maxLength: string
  email: string
  phone: string
  url: string
  number: string
  integer: string
  positive: string
  date: string
  dateRange: string
  invalidFormat: string
  tcRequired: string
  tcInvalid: string
  tc11Digits: string
  gsmInvalid: string
  gsmRequired: string
  searchMin: string
  searchMax: string
  timeInvalid: string
  endDateBeforeStart: string
  passwordMin: string
  userId6Digits: string
  userIdOnlyNumbers: string
  selectNeighborhood: string
}

export interface KisilerTranslations {
  // Page
  pageTitle: string
  pageDescription: string
  newKisiButton: string
  newKisi: string
  newKisiPageTitle: string
  newKisiPageDescription: string
  editKisi: string
  kisiDetails: string

  // Sections
  personalInfo: string
  contactInfo: string
  additionalInfo: string
  overview: string

  // Fields
  tcKimlik: string
  tc11Digit: string
  tip: string
  tt: string
  ttYes: string
  ttNo: string
  tipMusteri: string
  tipAday: string
  tipLead: string
  faaliyet: string
  pio: string
  pioFull: string
  asli: string
  asliFull: string
  faaliyetAlanlari: string
  selectFaaliyetAlani: string
  searchFaaliyetAlani: string
  updateFaaliyetError: string
  addParticipantError: string
  selectOperationToAdd: string
  selectIntroductionToAdd: string
  searchOperasyon: string
  searchTanitim: string
  tcLabel: string

  // Photo
  photo: string
  profile: string
  uploadPhoto: string
  changePhoto: string
  editPhoto: string
  editPhotoDescription: string
  photoFormats: string
  maxFileSize: string

  // Additional info
  additionalInfoPlaceholder: string

  // GSM
  gsmNumbers: string
  gsmPlaceholder: string
  addGsm: string
  noGsmYet: string
  addNumberFromAbove: string
  noGsmNumber: string
  deleteGsm: string
  deleteGsmConfirm: string

  // Address
  addresses: string
  newAddress: string
  newAddressDescription: string
  addressName: string
  addressNamePlaceholder: string
  addressDetail: string
  addressDetailPlaceholder: string
  addressDetailShort: string
  addAddress: string
  noAddressYet: string
  deleteAddress: string
  deleteAddressConfirm: string
  neighborhoodSelected: string

  // Relations
  takipVar: string
  takipEkle: string
  activeTakipSummary: string
  noTakip: string
  history: string

  // Notes
  newNote: string
  editNote: string
  noteContent: string
  noteContentPlaceholder: string
  noNotesYet: string
  deleteNote: string
  deleteNoteConfirm: string
  noteRequired: string
  noteDescription: string
  editNoteDescription: string
  addGsmTitle: string
  addGsmDescription: string
  gsmRequired: string
  gsmAddedSuccess: string
  gsmAlreadyExists: string
  editKisiDescription: string
  newKisiDescription: string

  // Edit modals
  editDetails: string
  editDetailsDescription: string
  editFaaliyetAlanlari: string
  editFaaliyetAlanlariDescription: string
  selectFaaliyetAlanlari: string

  // Validation
  nameRequired: string
  surnameRequired: string
  tcInvalid: string

  // Search
  searchPlaceholder: string

  // Detail page
  backToKisiler: string
  archived: string
  phone: string
  address: string
  yes: string
  no: string
  noFaaliyetAlanlari: string
  notes: string
  viewAll: string
  createdAt: string
  gsm: string
  vehicles: string
  introductions: string
  operations: string
  recentIntroductions: string
  noIntroductionsYet: string
  recentOperations: string
  noOperationsYet: string
  noVehiclesYet: string
  recentActivity: string
  createdPersonRecord: string
  updatedPersonInfo: string
  personNotFound: string
  backToPersons: string

  // Tab content
  participants: string
  addToIntroduction: string
  createNewIntroduction: string
  addToExistingIntroduction: string
  addFirstIntroduction: string
  noIntroductionsYetDescription: string
  introductionsDescription: string
  addToOperation: string
  createNewOperation: string
  addToExistingOperation: string
  addFirstOperation: string
  noOperationsYetDescription: string
  operationsDescription: string

  // Tracking
  trackingStatus: string
  unknown: string
  endsAt: string
  daysAgoExpired: string
  daysLeft: string
  noActiveTracking: string
  gsmTrackingDescription: string
  addNewGsm: string
  activeTracking: string
  updateStatus: string
  expired: string
  daysRemaining: string
  daysShort: string
  startDate: string
  endDate: string
  progress: string
  noActiveTrackingForGsm: string
  addFirstGsm: string
  daysAgo: string

  // Vehicle tab
  addVehicle: string
  noVehiclesAdded: string
  addVehicleTitle: string
  selectFromExisting: string
  selectVehicle: string
  searchPlate: string
  vehicleNotFound: string
  descriptionOptional: string
  vehicleDescriptionPlaceholder: string
  adding: string
  or: string
  createNewVehicle: string
  newVehicle: string
  removeVehicle: string
  removeVehicleConfirm: string
  removing: string
  remove: string

  // Address details
  addressInfoAndLocations: string
  provinceDistrict: string
  neighborhood: string
  addressDetailLabel: string
  fullAddress: string

  // Vehicle details
  vehicleInfoAndSharing: string
  sharedWithPersons: string
  color: string
  description: string
  sharedPersons: string

  // Notes
  notesAndDescriptions: string
  addNote: string
}

export interface TakiplerTranslations {
  // Page
  pageTitle: string
  pageDescription: string
  newTakipButton: string
  newTakipPageTitle: string
  newTakipPageDescription: string

  newTakip: string
  editTakip: string
  takipDetails: string
  addTakip: string

  // Fields
  startDate: string
  endDate: string
  remainingDays: string
  expired: string
  daysLeft: string
  currentStatus: string
  newStatus: string
  selectStatus: string
  auto90Days: string

  // Status
  durum: string
  durumUzatilacak: string
  durumDevamEdecek: string
  durumSonlandirilacak: string
  durumUzatildi: string
  durumBekliyor: string

  // Modal descriptions
  updateStatusTitle: string
  updateStatusDescription: string
  addTakipDescription: string
  activeWillBeExtended: string
  endDateBeforeStart: string
  createModalTitle: string
  createModalDescription: string
  optional: string
  creating: string

  // Selection
  selectedGsms: string
  searchInSelected: string

  // Table columns
  person: string
  alarm: string
  daysPassed: string
  daysRemaining: string
  activeTakip: string

  // Sort options
  endDateNearFar: string
  endDateFarNear: string
  startDateOldNew: string
  startDateNewOld: string

  // Form
  selectGsm: string
  selectGsmPlaceholder: string
  editTakipDescription: string
  newTakipDescription: string

  // Delete
  deleteTakip: string
  deleteTakipConfirm: string

  // Search
  searchPlaceholder: string

  // New Takip Page
  availableGsms: string
  itemsCount: string
  searchGsmOrCustomer: string
  removeAll: string
  noResultsFound: string
  allGsmsSelected: string
  selectGsmInstructions: string
  takipSettings: string
  selectedGsmCount: string
  createMultipleTakip: string
  defaultPlusDays: string
  eachGsmWillGetSeparateTakip: string
  canUpdateStatusIndividually: string

  // Validation
  selectAtLeastOne: string

  // Detail Page
  gsmNotFound: string
  backToTakipler: string
  goToPersonDetail: string
  addNewTakip: string
  noActiveTakip: string
  noActiveTakipDescription: string
  takipHistory: string
  duration: string
  createdAt: string
  alarmList: string
  triggered: string
  daysCount: string
}

export interface TanitimlarTranslations {
  // Page
  pageTitle: string
  pageDescription: string
  newTanitimButton: string
  newTanitimPageTitle: string
  newTanitimPageDescription: string

  newTanitim: string
  editTanitim: string
  tanitimDetails: string
  addToTanitim: string
  addToExistingTanitim: string
  createNewTanitim: string

  // Fields
  title: string
  titlePlaceholder: string
  tanitimDate: string
  tanitimTime: string
  tanitimAddress: string
  dateTime: string
  addressDetail: string
  addressDetailPlaceholder: string
  notesPlaceholder: string
  editTanitimDescription: string

  // Modal
  createModalTitle: string
  createModalDescription: string
  optional: string
  creating: string

  // Table columns
  date: string
  address: string
  count: string
  notes: string
  unknownPerson: string

  // Sort options
  dateNewOld: string
  dateOldNew: string
  createdNewOld: string
  createdOldNew: string

  // Delete
  deleteTanitim: string
  deleteTanitimConfirm: string

  // Search
  searchPlaceholder: string

  // Participants
  participants: string
  selectedParticipants: string
  searchInSelected: string
  participantCount: string
  allSelectedWillBeAdded: string
  searchPerson: string
  allPersonsParticipants: string
  personNotFound: string
  noParticipantsYet: string
  useAddButton: string
  removeParticipant: string
  removeParticipantConfirm: string

  // Vehicles
  vehicles: string
  searchVehicle: string
  allVehiclesAdded: string
  vehicleNotFound: string
  noVehiclesYet: string
  useAddButtonVehicle: string
  removeVehicle: string
  removeVehicleConfirm: string
  vehicleInfo: string
  vehicleDescription: string
  newVehicleModalTitle: string
  newVehicleModalDescription: string

  // New Tanitim Page
  availablePeople: string
  itemsCount: string
  searchByNameOrTc: string
  removeAll: string
  noResultsFound: string
  allPeopleSelected: string
  selectPeopleInstructions: string
  tanitimInfo: string
  createTanitimButton: string

  // Additional
  selectedCountText: string
  notFound: string
}

export interface OperasyonlarTranslations {
  // Page
  pageTitle: string
  pageDescription: string
  newOperasyonButton: string
  newOperasyonPageTitle: string
  newOperasyonPageDescription: string

  newOperasyon: string
  editOperasyon: string
  operasyonDetails: string
  addToOperasyon: string
  addToExistingOperasyon: string
  createNewOperasyon: string

  // Fields
  title: string
  titlePlaceholder: string
  operasyonDate: string
  operasyonTime: string
  operasyonAddress: string
  dateTime: string
  addressDetail: string
  addressDetailPlaceholder: string
  notesPlaceholder: string
  editOperasyonDescription: string

  // Modal
  createModalTitle: string
  createModalDescription: string
  optional: string
  creating: string

  // Table columns
  date: string
  address: string
  count: string
  notes: string
  unknownPerson: string
  selectAtLeastOne: string
  participantStats: string

  // Sort options
  dateNewOld: string
  dateOldNew: string
  createdNewOld: string
  createdOldNew: string

  // Delete
  deleteOperasyon: string
  deleteOperasyonConfirm: string

  // Search
  searchPlaceholder: string

  // Participants
  participants: string
  selectedParticipants: string
  participantCount: string
  allSelectedWillBeAdded: string
  searchPerson: string
  allPersonsParticipants: string
  personNotFound: string
  noParticipantsYet: string
  useAddButton: string
  removeParticipant: string
  removeParticipantConfirm: string

  // Vehicles
  vehicles: string
  searchVehicle: string
  allVehiclesAdded: string
  vehicleNotFound: string
  noVehiclesYet: string
  useAddButtonVehicle: string
  removeVehicle: string
  removeVehicleConfirm: string
  vehicleInfo: string
  vehicleDescription: string
  newVehicleModalTitle: string
  newVehicleModalDescription: string

  // New Operasyon Page
  availablePeople: string
  itemsCount: string
  searchByNameOrTc: string
  searchInSelected: string
  removeAll: string
  noResultsFound: string
  allPeopleSelected: string
  selectPeopleInstructions: string
  operasyonInfo: string
  createOperasyonButton: string

  // Additional
  selectedCountText: string
  notFound: string
}

export interface AlarmlarTranslations {
  // Page
  pageTitle: string
  pageDescription: string

  // Types
  tipTakipBitis: string
  tipOdemeHatirlatma: string
  tipOzel: string

  // Status
  durumTetiklendi: string
  durumGoruldu: string
  durumIptal: string
  durumBekliyor: string
  paused: string

  // Fields
  tetikTarihi: string
  gunOnce: string
  olusturan: string
  sistem: string
  baslikMesaj: string

  // Table columns
  durum: string
  tip: string
  person: string
  days: string

  // Date display
  daysAgo: string
  today: string
  daysLeft: string

  // Actions
  goToPerson: string
  markAsRead: string
  pause: string
  resume: string

  // Delete
  deleteAlarm: string
  deleteAlarmConfirm: string

  // Notifications
  noNotifications: string
  markAllRead: string
  viewAllAlarms: string

  // Sort
  tetikDateNear: string
  tetikDateFar: string
  createdNew: string
  createdOld: string

  // Search
  searchPlaceholder: string
}

export interface PersonelTranslations {
  // Page
  pageTitle: string
  pageDescription: string
  newPersonelButton: string
  newPersonelPageTitle: string
  newPersonelPageDescription: string

  newPersonel: string
  editPersonel: string
  personelDetails: string
  deletePersonel: string
  deletePersonelConfirm: string
  createNewAccount: string

  // Fields
  visibleId: string
  rol: string
  rolAdmin: string
  rolYonetici: string
  rolPersonel: string

  // Descriptions
  rolDescriptions: string
  adminDescription: string
  yoneticiDescription: string
  personelDescription: string

  // Form fields
  userId6Digit: string
  password: string
  passwordRepeat: string
  newPassword: string
  photoUrl: string
  activeAccount: string
  inactiveAccountHint: string

  // Form modal
  editPersonelDescription: string
  passwordDescription: string
  roleDescription: string
  setNewPassword: string

  // Validation
  userIdRequired: string
  userIdMustBe6Digits: string
  firstNameRequired: string
  lastNameRequired: string
  passwordRequired: string
  passwordMin6: string
  passwordRepeatRequired: string
  passwordsDoNotMatch: string
  operationFailed: string
  passwordChangeFailed: string
  roleChangeFailed: string

  // Table columns
  fullName: string
  status: string
  activity: string
  lastLogin: string
  neverLoggedIn: string

  // Status
  active: string
  inactive: string

  // Actions
  changePassword: string
  changeRole: string
  deactivate: string
  activate: string

  // Activity tooltips
  createdPersons: string
  createdFollowups: string
  createdNotes: string
  createdIntroductions: string

  // Sort options
  nameAZ: string
  nameZA: string
  surnameAZ: string
  surnameZA: string
  lastLoginNewOld: string
  lastLoginOldNew: string
  createdNewOld: string
  createdOldNew: string

  // Search
  searchPlaceholder: string
}

export interface LokasyonTranslations {
  // İl
  il: string
  iller: string
  illerPageDescription: string
  newIl: string
  editIl: string
  ilAdi: string
  plakaKodu: string
  plaka: string
  ilceSayisi: string
  deleteIl: string
  deleteIlConfirm: string
  newIlDescription: string
  editIlDescription: string
  searchIlPlaceholder: string

  // İlçe
  ilce: string
  ilceler: string
  ilcelerPageDescription: string
  newIlce: string
  editIlce: string
  ilceAdi: string
  mahalleSayisi: string
  deleteIlce: string
  deleteIlceConfirm: string
  newIlceDescription: string
  editIlceDescription: string
  searchIlcePlaceholder: string

  // Mahalle
  mahalle: string
  mahalleler: string
  mahallelerPageDescription: string
  newMahalle: string
  editMahalle: string
  mahalleAdi: string
  adresSayisi: string
  deleteMahalle: string
  deleteMahalleConfirm: string
  newMahalleDescription: string
  editMahalleDescription: string
  searchMahallePlaceholder: string

  // Filters and selectors
  ilFilter: string
  ilceFilter: string
  selectIl: string
  selectIlce: string
  selectMahalle: string
  searchIl: string
  searchIlce: string
  searchMahalle: string
  ilNotFound: string
  ilceNotFound: string
  mahalleNotFound: string
  selectIlFirst: string
  selectIlceFirst: string
}

export interface NumaralarTranslations {
  // Page
  pageTitle: string
  pageDescription: string

  // Table columns
  numara: string
  kisi: string
  tip: string
  takip: string
  baslama: string
  bitis: string
  kalanGun: string

  // Table values
  musteri: string
  aday: string
  takipVar: string
  takipYok: string
  gunGecti: string
  bugun: string
  gun: string
  tumu: string

  // Sort options
  numaraAZ: string
  numaraZA: string
  kisiAdAZ: string
  kisiAdZA: string
  enYeni: string
  enEski: string

  // Actions
  goToPerson: string

  // Legacy (keeping for backward compatibility)
  gsm: string
  owner: string
  isPrimary: string
  hasTakip: string
  primaryNumber: string

  // Search
  searchPlaceholder: string
}

export interface AraclarTranslations {
  // Page
  pageTitle: string
  pageDescription: string

  // Vehicles
  araclar: string
  newArac: string
  editArac: string
  aracDetails: string
  deleteArac: string
  removeArac: string
  addArac: string
  selectArac: string
  aracNotFound: string
  removeAracConfirm: string
  deleteAracConfirm: string
  newAracDescription: string
  editAracDescription: string

  // Fields
  plaka: string
  markaModel: string
  renk: string
  kisiler: string

  // Marka
  marka: string
  markalar: string
  newMarka: string
  editMarka: string
  markaAdi: string
  deleteMarka: string
  deleteMarkaConfirm: string
  newMarkaDescription: string
  editMarkaDescription: string
  searchMarkaPlaceholder: string
  selectMarka: string
  markaNotFound: string
  modelSayisi: string
  addNewMarka: string

  // Model
  model: string
  modeller: string
  newModel: string
  editModel: string
  modelAdi: string
  deleteModel: string
  deleteModelConfirm: string
  newModelDescription: string
  editModelDescription: string
  searchModelPlaceholder: string
  selectModel: string
  modelNotFound: string
  addNewModel: string

  // Colors
  renkBeyaz: string
  renkSiyah: string
  renkGri: string
  renkGumus: string
  renkKirmizi: string
  renkMavi: string
  renkLacivert: string
  renkYesil: string
  renkSari: string
  renkTuruncu: string
  renkKahverengi: string
  renkBej: string
  renkBordo: string
  renkMor: string
  renkPembe: string
  renkAltin: string
  renkBronz: string
  renkDiger: string
  selectRenk: string

  // Search
  searchPlaceholder: string

  // Kisi selection
  selectKisi: string
  searchKisi: string
  kisiNotFound: string
  kisilerSelected: string
  musteri: string
  aday: string

  // Sorting
  sortPlateAsc: string
  sortPlateDesc: string
  sortNewest: string
  sortOldest: string

  // Actions
  deleting: string
  adding: string

  // Error pages
  aracNotFoundDescription: string
  backToAraclar: string

  // Related data
  noKisiler: string
  tanitimlar: string
  operasyonlar: string
  noTanitimlar: string
  noOperasyonlar: string
}

export interface FaaliyetTranslations {
  faaliyetAlani: string
  faaliyetAlanlari: string
  newFaaliyetAlani: string
  editFaaliyetAlani: string
  deleteFaaliyetAlani: string
  faaliyetAlaniAdi: string
  newRootArea: string
  addFirstArea: string
  selectedArea: string
  hasLinkedKisiler: string
  selectFaaliyetAlani: string
  searchFaaliyetAlani: string
  faaliyetAlaniAdiPlaceholder: string
  searchUstKategori: string

  // Form labels
  ustKategori: string
  rootLevel: string
  categoryNotFound: string
  inactive: string
  order: string
  active: string
}

export interface SearchTranslations {
  globalSearch: string
  searchDescription: string
  searchPlaceholder: string
  searchMinChars: string
  startTypingToSearch: string
  noResultsFor: string
  resultsFound: string

  // Categories
  kisiler: string
  gsmNumaralari: string
  adresler: string
  notlar: string
  personel: string
  tanitimlar: string
  operasyonlar: string
  araclar: string
  takipler: string
  alarmlar: string
  faaliyetAlanlari: string
  loglar: string

  // Related
  relatedPersons: string
  relatedVehicles: string
  relatedEvents: string
  relatedOperations: string
  vehicleOwners: string
  eventParticipants: string
  operationParticipants: string
}

export interface LoglarTranslations {
  // Page
  pageTitle: string
  pageDescription: string

  // Actions
  create: string
  update: string
  delete: string
  login: string
  logout: string
  failedLogin: string
  bulkCreate: string
  statusChange: string

  // Filters
  filters: string
  refresh: string
  clear: string
  allOperations: string
  all: string
  operationType: string
  dataType: string
  startDate: string
  endDate: string

  // Table
  date: string
  user: string
  operation: string
  dataTypeColumn: string
  description: string
  noRecords: string

  // Pagination
  totalRecordsPage: string
  previous: string
  next: string

  // Entities
  kisi: string
  gsm: string
  takip: string
  tanitim: string
  alarm: string
  personel: string
  il: string
  ilce: string
  mahalle: string
  system: string
}

export interface AyarlarTranslations {
  // Page
  pageTitle: string
  pageDescription: string
  save: string
  loading: string

  // Tab labels
  alarmTab: string
  takipTab: string
  bildirimTab: string
  gorunumTab: string

  // Alarm settings
  alarmTitle: string
  alarmDescription: string
  firstAlarm: string
  firstAlarmDesc: string
  secondAlarm: string
  secondAlarmDesc: string
  currentRules: string
  beforeEndDate1: string
  beforeEndDate2: string

  // Takip settings
  takipTitle: string
  takipDescription: string
  defaultDuration: string
  defaultDurationDesc: string
  exampleScenario: string
  exampleScenarioText: string

  // Notification settings
  notificationTitle: string
  notificationDescription: string
  emailNotifications: string
  emailNotificationsDesc: string
  browserNotifications: string
  browserNotificationsDesc: string
  checkFrequency: string
  checkFrequencyDesc: string
  seconds30: string
  minute1: string
  minutes5: string
  minutes10: string
  notificationComingSoon: string

  // Appearance settings
  appearanceTitle: string
  appearanceDescription: string
  defaultTheme: string
  defaultThemeDesc: string
  themeLight: string
  themeDark: string
  themeSystem: string
  tableDensity: string
  tableDensityDesc: string
  densityCompact: string
  densityNormal: string
  densityWide: string
  appearanceComingSoon: string

  // Legacy
  title: string
  takipDefaults: string
  takipDefaultsDesc: string
  defaultTakipDuration: string
  defaultTakipDurationDesc: string
  notificationCheckFrequency: string
  notificationCheckFrequencyDesc: string
}

export interface TabsTranslations {
  closeTab: string
  closeOtherTabs: string
  closeTabsToRight: string
  closeAllTabs: string
  newTab: string

  // Route titles
  home: string
  kisiler: string
  kisiYeni: string
  kisiDetay: string
  numaralar: string
  numaraDetay: string
  araclar: string
  aracDetay: string
  advancedSearch: string
  takipler: string
  takipYeni: string
  takipDetay: string
  tanitimlar: string
  tanitimYeni: string
  tanitimDetay: string
  operasyonlar: string
  operasyonYeni: string
  operasyonDetay: string
  alarmlar: string
  tanimlamalar: string
  faaliyetAlaniDetay: string
  lokasyonlar: string
  iller: string
  ilYeni: string
  ilceler: string
  ilceYeni: string
  mahalleler: string
  mahalleYeni: string
  markaModel: string
  markalar: string
  markaYeni: string
  modeller: string
  modelYeni: string
  personel: string
  personelYeni: string
  personelDetay: string
  duyurular: string
  duyuruDetay: string
  ayarlar: string
  loglar: string
  logDetay: string
  sayfa: string
}

export interface ApiMessagesTranslations {
  // Common
  notFound: string
  fetchError: string
  updateError: string
  deleteError: string
  createError: string
  deleteSuccess: string
  genericError: string

  // Auth
  sessionRequired: string
  adminRequired: string
  noPermission: string

  // Specific
  duplicateTc: string
  fileNotFound: string
  invalidFileType: string
  fileTooLarge: string
  uploadError: string
  invalidQueryParams: string
  invalidData: string
  searchError: string
}

export interface NotFoundTranslations {
  pageNotFound: string
}

export interface TanimlamalarTranslations {
  // Page
  pageTitle: string
  pageDescription: string

  // Main Tabs
  lokasyonlar: string
  markaModel: string
  faaliyetAlanlari: string

  // Lokasyon Sub-tabs
  iller: string
  ilceler: string
  mahalleler: string

  // Marka-Model Sub-tabs
  markalar: string
  markalarPageDescription: string
  modeller: string
  modellerPageDescription: string

  // Button texts
  newIl: string
  newIlce: string
  newMahalle: string
  newMarka: string
  newModel: string
  newButton: string
}

export interface DashboardTranslations {
  // Welcome
  welcomeMessage: string
  subtitle: string

  // Search
  searchPlaceholder: string
  searchTagTc: string
  searchTagPhone: string
  searchTagName: string
  searchTagAddress: string

  // Stats
  kisiler: string
  gsm: string
  takipler: string
  tanitimlar: string
  operasyonlar: string
  araclar: string
  alarmlar: string

  // Quick Actions
  quickActions: string
  newKisi: string
  newTakip: string
  newTanitim: string
  newOperasyon: string

  // Alerts
  expiringSoon: string
  pendingAlarms: string
}

export interface QueryBuilderTranslations {
  // Page
  pageTitle: string
  pageDescription: string

  // Components
  title: string
  description: string
  submitLabel: string
  addFilter: string
  addGroup: string
  removeFilter: string
  removeGroup: string
  clearAll: string

  // Logic
  logic: string
  logicAnd: string
  logicOr: string
  and: string
  or: string
  combinator: string

  // Status
  activeFilters: string
  noFilters: string
  searching: string

  // Operators - Text
  contains: string
  doesNotContain: string
  startsWith: string
  endsWith: string
  equals: string
  notEquals: string
  isEmpty: string
  isNotEmpty: string
  inList: string
  notInList: string

  // Operators - Number
  greaterThan: string
  lessThan: string
  between: string

  // Operators - Select
  in: string
  notIn: string

  // Operators - Date
  before: string
  after: string

  // Input
  selectColumn: string
  selectOperator: string
  enterValue: string
  noValueNeeded: string

  // Bulk input
  bulkPaste: string
  bulkPasteTitle: string
  bulkPasteDescription: string
  bulkPastePlaceholder: string
  uniqueValues: string
  valuesSelected: string
  clear: string
  apply: string

  // Between input
  min: string
  max: string

  // Select input
  selectOption: string
  search: string
  noResults: string

  // Results
  resultsTitle: string
  resultsCount: string
  noSearchYet: string
  noResultsFound: string
  searchInstructions: string

  // Errors
  searchError: string

  // Debug
  debugTitle: string

  // Saved Queries
  savedQueries: string
  saveQuery: string
  loadQuery: string
  deleteQuery: string
  queryName: string
  queryNamePlaceholder: string
  saveSuccess: string
  loadSuccess: string
  deleteSuccess: string
  noSavedQueries: string

  // Export
  export: string
  exportExcel: string
  exportCsv: string
  exportJson: string
  exporting: string
  exportSuccess: string
  exportError: string
}

export interface DuyurularTranslations {
  // Page
  pageTitle: string
  pageDescription: string
  pageSubtitle: string
  newDuyuruButton: string

  // Form
  newDuyuru: string
  editDuyuru: string
  duyuruDetails: string

  // Fields
  title: string
  titlePlaceholder: string
  content: string
  contentPlaceholder: string
  priority: string
  publishDate: string
  expiryDate: string
  expiryDatePlaceholder: string
  hasExpiryDate: string
  status: string
  active: string
  inactive: string

  // Priority levels
  priorityNormal: string
  priorityImportant: string
  priorityCritical: string

  // Table columns
  createdBy: string
  updatedBy: string
  createdAt: string
  updatedAt: string
  unknownUser: string

  // Sort options
  prioritySort: string
  publishDateNewOld: string
  publishDateOldNew: string
  createdNewOld: string
  createdOldNew: string

  // Delete
  deleteDuyuru: string
  deleteDuyuruConfirm: string
  deleteSuccess: string
  deleteError: string

  // Create/Update
  createSuccess: string
  createError: string
  updateSuccess: string
  updateError: string

  // Validation
  titleRequired: string
  contentRequired: string
  titleMaxLength: string
  contentMaxLength: string

  // Actions
  save: string
  cancel: string
  edit: string
  delete: string
  creating: string
  updating: string

  // Empty state
  noAnnouncements: string
  noAnnouncementsDescription: string

  // Expired
  expired: string
  expiresOn: string
  noExpiry: string

  // Permissions
  permissionDenied: string
  adminOnly: string
}

export interface EnumsTranslations {
  // Takip Durumu
  takipDurumu: {
    UZATILACAK: string
    DEVAM_EDECEK: string
    SONLANDIRILACAK: string
    UZATILDI: string
  }

  // Alarm Durumu
  alarmDurumu: {
    BEKLIYOR: string
    TETIKLENDI: string
    GORULDU: string
    IPTAL: string
  }

  // Alarm Tipi
  alarmTipi: {
    MUSTERI: string
    ADAY: string
    TAKIP_BITIS: string
    ODEME_HATIRLATMA: string
    OZEL: string
  }

  // Personel Rol
  personelRol: {
    ADMIN: string
    YONETICI: string
    PERSONEL: string
  }

  // Kisi Tipi
  kisiTipi: {
    MUSTERI: string
    ADAY: string
  }

  // Boolean Labels
  boolean: {
    yes: string
    no: string
    active: string
    inactive: string
    paused: string
    notPaused: string
    tt: string
    notTt: string
    pio: string
    notPio: string
    asli: string
    notAsli: string
    primary: string
    notPrimary: string
    faaliyet: string
    noFaaliyet: string
  }

  // System
  system: string
  unknown: string
  none: string

  // Date indicators
  daysRemaining: string
  expired: string
  neverLoggedIn: string
}

export interface Translations {
  common: CommonTranslations
  sidebar: SidebarTranslations
  navigation: NavigationTranslations
  table: TableTranslations
  auth: AuthTranslations
  dialog: DialogTranslations
  validation: ValidationTranslations
  kisiler: KisilerTranslations
  takipler: TakiplerTranslations
  tanitimlar: TanitimlarTranslations
  operasyonlar: OperasyonlarTranslations
  alarmlar: AlarmlarTranslations
  personel: PersonelTranslations
  lokasyon: LokasyonTranslations
  numaralar: NumaralarTranslations
  araclar: AraclarTranslations
  faaliyet: FaaliyetTranslations
  queryBuilder: QueryBuilderTranslations
  search: SearchTranslations
  loglar: LoglarTranslations
  ayarlar: AyarlarTranslations
  tanimlamalar: TanimlamalarTranslations
  tabs: TabsTranslations
  api: ApiMessagesTranslations
  notFound: NotFoundTranslations
  dashboard: DashboardTranslations
  duyurular: DuyurularTranslations
  enums: EnumsTranslations
}
