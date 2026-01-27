import type { AyarlarTranslations } from "@/types/locale"

export const ayarlar: AyarlarTranslations = {
  // Page
  pageTitle: "Settings",
  pageDescription: "Configure system settings",
  save: "Save",
  loading: "Loading...",

  // Tab labels
  alarmTab: "Alarm",
  takipTab: "Decision",
  bildirimTab: "Notification",
  gorunumTab: "Appearance",

  // Alarm settings
  alarmTitle: "Alarm Settings",
  alarmDescription: "Set default day counts for decision end alarms",
  firstAlarm: "First Alarm (days before)",
  firstAlarmDesc: "How many days before the decision end date should the first alarm trigger",
  secondAlarm: "Second Alarm (days before)",
  secondAlarmDesc: "How many days before the decision end date should the second alarm trigger",
  currentRules: "Current Alarm Rules",
  beforeEndDate1: "{days} days before end date - first alarm",
  beforeEndDate2: "{days} days before end date - second alarm",

  // Takip settings
  takipTitle: "Decision Settings",
  takipDescription: "Set default values for creating new decisions",
  defaultDuration: "Default Decision Duration (days)",
  defaultDurationDesc: "Default duration when a new decision is created (from start date)",
  exampleScenario: "Example Scenario",
  exampleScenarioText: "A decision created today will end in {duration} days. First alarm will trigger on day {alarm1}, second alarm on day {alarm2}.",

  // Notification settings
  notificationTitle: "Notification Settings",
  notificationDescription: "Configure your notification preferences",
  emailNotifications: "Email Notifications",
  emailNotificationsDesc: "Send email when alarm triggers",
  browserNotifications: "Browser Notifications",
  browserNotificationsDesc: "Show browser notification when alarm triggers",
  checkFrequency: "Notification Check Frequency",
  checkFrequencyDesc: "How often to check for new notifications",
  seconds30: "30 seconds",
  minute1: "1 minute",
  minutes5: "5 minutes",
  minutes10: "10 minutes",
  notificationComingSoon: "Notification settings will be available soon.",

  // Appearance settings
  appearanceTitle: "Appearance Settings",
  appearanceDescription: "Customize application appearance",
  defaultTheme: "Default Theme",
  defaultThemeDesc: "Theme to use when application opens",
  themeLight: "Light",
  themeDark: "Dark",
  themeSystem: "System",
  tableDensity: "Table Density",
  tableDensityDesc: "Row height in tables",
  densityCompact: "Compact",
  densityNormal: "Normal",
  densityWide: "Wide",
  appearanceComingSoon: "Appearance settings will be available soon.",

  // Legacy (keeping for backward compatibility)
  title: "Settings",
  takipDefaults: "Decision Defaults",
  takipDefaultsDesc: "Set default values for creating new decisions",
  defaultTakipDuration: "Default Decision Duration",
  defaultTakipDurationDesc: "Default duration when a new decision is created (from start date)",
  notificationCheckFrequency: "Notification Check Frequency",
  notificationCheckFrequencyDesc: "How often to check for new notifications",
}
