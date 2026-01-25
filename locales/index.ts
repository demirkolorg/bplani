import { tr } from "./tr"
import { en } from "./en"
import type { Locale, Translations } from "@/types/locale"

const translations: Record<Locale, Translations> = {
  tr,
  en,
}

export function getTranslations(locale: Locale): Translations {
  return translations[locale]
}

/**
 * Interpolates a translation string with parameters.
 * @example interpolate("Showing {start}-{end} of {total}", { start: 1, end: 20, total: 100 })
 */
export function interpolate(
  text: string,
  params: Record<string, string | number>
): string {
  return Object.entries(params).reduce(
    (acc, [key, val]) => acc.replace(new RegExp(`\\{${key}\\}`, "g"), String(val)),
    text
  )
}

export { translations }
export type { Locale, Translations }
