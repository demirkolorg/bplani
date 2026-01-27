import type { DuyurularTranslations } from "@/types/locale"

export const duyurular: DuyurularTranslations = {
  // Page
  pageTitle: "Announcements",
  pageDescription: "View and manage system announcements",
  newDuyuruButton: "New Announcement",

  // Form
  newDuyuru: "New Announcement",
  editDuyuru: "Edit Announcement",
  duyuruDetails: "Announcement Details",

  // Fields
  title: "Title",
  titlePlaceholder: "Announcement title...",
  content: "Content",
  contentPlaceholder: "Announcement content...",
  priority: "Priority",
  publishDate: "Publish Date",
  expiryDate: "Expiry Date",
  expiryDatePlaceholder: "Select expiry date (optional)",
  hasExpiryDate: "Has Expiry Date",
  status: "Status",
  active: "Active",
  inactive: "Inactive",

  // Priority levels
  priorityNormal: "Normal",
  priorityImportant: "Important",
  priorityCritical: "Critical",

  // Table columns
  createdBy: "Created By",
  updatedBy: "Updated By",
  createdAt: "Created",
  updatedAt: "Updated",
  unknownUser: "Unknown",

  // Sort options
  prioritySort: "Priority",
  publishDateNewOld: "Publish Date (New → Old)",
  publishDateOldNew: "Publish Date (Old → New)",
  createdNewOld: "Created (New → Old)",
  createdOldNew: "Created (Old → New)",

  // Delete
  deleteDuyuru: "Delete Announcement",
  deleteDuyuruConfirm: "Are you sure you want to delete this announcement?",
  deleteSuccess: "Announcement deleted successfully",
  deleteError: "An error occurred while deleting the announcement",

  // Create/Update
  createSuccess: "Announcement created successfully",
  createError: "An error occurred while creating the announcement",
  updateSuccess: "Announcement updated successfully",
  updateError: "An error occurred while updating the announcement",

  // Validation
  titleRequired: "Title is required",
  contentRequired: "Content is required",
  titleMaxLength: "Title can be at most 200 characters",
  contentMaxLength: "Content can be at most 10,000 characters",

  // Actions
  save: "Save",
  cancel: "Cancel",
  edit: "Edit",
  delete: "Delete",
  creating: "Creating...",
  updating: "Updating...",

  // Empty state
  noAnnouncements: "No announcements yet",
  noAnnouncementsDescription: "Start by creating a new announcement",

  // Expired
  expired: "Expired",
  expiresOn: "Expires On",
  noExpiry: "No Expiry",

  // Permissions
  permissionDenied: "You don't have permission for this action",
  adminOnly: "Only ADMIN and YONETICI can manage announcements",
}
