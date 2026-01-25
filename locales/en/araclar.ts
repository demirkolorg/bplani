import type { AraclarTranslations } from "@/types/locale"

export const araclar: AraclarTranslations = {
  // Page
  pageTitle: "Vehicles",
  pageDescription: "View and manage all vehicles",

  // Vehicles
  araclar: "Vehicles",
  newArac: "New Vehicle",
  editArac: "Edit Vehicle",
  aracDetails: "Vehicle Details",
  deleteArac: "Delete Vehicle",
  removeArac: "Remove Vehicle",
  addArac: "Add Vehicle",
  selectArac: "Select a vehicle...",
  aracNotFound: "No vehicle found.",
  removeAracConfirm: "Are you sure you want to remove the vehicle with plate {plaka} from this person?",
  deleteAracConfirm: "Are you sure you want to delete the vehicle with plate {plaka}? This action cannot be undone.",
  newAracDescription: "Fill out the form below to add a new vehicle.",
  editAracDescription: "Update vehicle information.",

  // Fields
  plaka: "Plate",
  markaModel: "Brand / Model",
  renk: "Color",
  kisiler: "Persons",

  // Brand
  marka: "Brand",
  markalar: "Brands",
  newMarka: "New Brand",
  editMarka: "Edit Brand",
  markaAdi: "Brand Name",
  deleteMarka: "Delete Brand",
  deleteMarkaConfirm: "Are you sure you want to delete this brand? This action cannot be undone. Deletion will be blocked if there are linked models.",
  newMarkaDescription: "Fill out the form below to add a new brand.",
  editMarkaDescription: "Update brand information.",
  searchMarkaPlaceholder: "Search by brand name...",
  selectMarka: "Select a brand...",
  markaNotFound: "No brand found.",
  modelSayisi: "Model Count",
  addNewMarka: "Add New Brand",

  // Model
  model: "Model",
  modeller: "Models",
  newModel: "New Model",
  editModel: "Edit Model",
  modelAdi: "Model Name",
  deleteModel: "Delete Model",
  deleteModelConfirm: "Are you sure you want to delete this model? This action cannot be undone.",
  newModelDescription: "Fill out the form below to add a new model.",
  editModelDescription: "Update model information.",
  searchModelPlaceholder: "Search by model name or brand...",
  selectModel: "Select a model...",
  modelNotFound: "No model found.",
  addNewModel: "Add New Model",

  // Colors
  renkBeyaz: "White",
  renkSiyah: "Black",
  renkGri: "Gray",
  renkGumus: "Silver",
  renkKirmizi: "Red",
  renkMavi: "Blue",
  renkLacivert: "Navy",
  renkYesil: "Green",
  renkSari: "Yellow",
  renkTuruncu: "Orange",
  renkKahverengi: "Brown",
  renkBej: "Beige",
  renkBordo: "Burgundy",
  renkMor: "Purple",
  renkPembe: "Pink",
  renkAltin: "Gold",
  renkBronz: "Bronze",
  renkDiger: "Other",
  selectRenk: "Select color...",

  // Search
  searchPlaceholder: "Search by plate...",

  // Kisi selection
  selectKisi: "Select person...",
  searchKisi: "Search person...",
  kisiNotFound: "No person found.",
  kisilerSelected: "{count} person(s) selected",
  musteri: "Customer",
  aday: "Lead",

  // Sorting
  sortPlateAsc: "Plate (A → Z)",
  sortPlateDesc: "Plate (Z → A)",
  sortNewest: "Newest",
  sortOldest: "Oldest",

  // Actions
  deleting: "Deleting...",
  adding: "Adding...",
}
