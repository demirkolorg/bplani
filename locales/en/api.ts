import type { ApiMessagesTranslations } from "@/types/locale"

export const api: ApiMessagesTranslations = {
  // Common
  notFound: "{entity} not found",
  fetchError: "An error occurred while fetching {entity}",
  updateError: "An error occurred while updating {entity}",
  deleteError: "An error occurred while deleting {entity}",
  createError: "An error occurred while creating {entity}",
  deleteSuccess: "{entity} deleted successfully",
  genericError: "An error occurred",

  // Auth
  sessionRequired: "Session required",
  adminRequired: "Admin permission required",
  noPermission: "You don't have permission for this action",

  // Specific
  duplicateTc: "A person with this ID number already exists",
  fileNotFound: "File not found",
  invalidFileType: "Invalid file type. Only JPEG, PNG, WebP and GIF are supported.",
  fileTooLarge: "File size cannot exceed 5MB",
  uploadError: "An error occurred while uploading the file",
  invalidQueryParams: "Invalid query parameters",
  invalidData: "Invalid data",
}
