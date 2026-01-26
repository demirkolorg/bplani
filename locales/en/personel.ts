import type { PersonelTranslations } from "@/types/locale"

export const personel: PersonelTranslations = {
  // Page
  pageTitle: "Staff",
  pageDescription: "View and manage all staff",
  newPersonelButton: "New Staff",
  newPersonelPageTitle: "New Staff",
  newPersonelPageDescription: "Create a new system user",

  newPersonel: "New Staff",
  editPersonel: "Edit Staff",
  personelDetails: "Staff Details",
  deletePersonel: "Delete Staff",
  deletePersonelConfirm: "Are you sure you want to delete this staff member? This action cannot be undone.",
  createNewAccount: "Create a new staff account",

  // Fields
  visibleId: "User ID",
  rol: "Role",
  rolAdmin: "Admin",
  rolYonetici: "Manager",
  rolPersonel: "Staff",

  // Descriptions
  rolDescriptions: "Role Descriptions:",
  adminDescription: "Has all permissions, can manage users",
  yoneticiDescription: "Can view staff list, can edit records",
  personelDescription: "Can perform basic operations, cannot see staff module",

  // Form fields
  userId6Digit: "User ID (6 digits)",
  password: "Password",
  passwordRepeat: "Confirm Password",
  newPassword: "New Password",
  photoUrl: "Photo URL (optional)",
  activeAccount: "Active Account",
  inactiveAccountHint: "Inactive accounts cannot log in",

  // Form modal
  editPersonelDescription: "Update staff information",
  passwordDescription: "Set a new password for {name}",
  roleDescription: "Select a new role for {name}",
  setNewPassword: "Change Password",

  // Validation
  userIdRequired: "User ID is required",
  userIdMustBe6Digits: "User ID must be 6 digits",
  firstNameRequired: "First name is required",
  lastNameRequired: "Last name is required",
  passwordRequired: "Password is required",
  passwordMin6: "Password must be at least 6 characters",
  passwordRepeatRequired: "Password confirmation is required",
  passwordsDoNotMatch: "Passwords do not match",
  operationFailed: "Operation failed",
  passwordChangeFailed: "Failed to change password",
  roleChangeFailed: "Failed to change role",

  // Table columns
  fullName: "Full Name",
  status: "Status",
  activity: "Activity",
  lastLogin: "Last Login",
  neverLoggedIn: "Never logged in",

  // Status
  active: "Active",
  inactive: "Inactive",

  // Actions
  changePassword: "Change Password",
  changeRole: "Change Role",
  deactivate: "Deactivate",
  activate: "Activate",

  // Activity tooltips
  createdPersons: "Created Persons",
  createdFollowups: "Created Follow-ups",
  createdNotes: "Created Notes",
  createdIntroductions: "Created Events",

  // Sort options
  nameAZ: "Name (A → Z)",
  nameZA: "Name (Z → A)",
  surnameAZ: "Surname (A → Z)",
  surnameZA: "Surname (Z → A)",
  lastLoginNewOld: "Last Login (New → Old)",
  lastLoginOldNew: "Last Login (Old → New)",
  createdNewOld: "Created (New → Old)",
  createdOldNew: "Created (Old → New)",

  // Search
  searchPlaceholder: "Search by name or ID...",
}
