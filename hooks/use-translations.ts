import { tr } from "@/locales/tr"

export function useTranslations() {
  // For now, we only support Turkish
  // In the future, this could check user preferences or browser settings
  return { t: tr }
}
