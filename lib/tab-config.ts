// Tab sistemi konfigürasyonu - route başlıkları ve ikonları
import type { TabsTranslations } from "@/types/locale"

export interface RouteConfig {
  titleKey: keyof TabsTranslations
  icon: string
  isDynamic?: boolean
}

// Static route tanımları - translation key kullanır
export const ROUTE_CONFIG: Record<string, RouteConfig> = {
  "/": { titleKey: "home", icon: "Home" },

  // Kayıtlar
  "/kisiler": { titleKey: "kisiler", icon: "Users" },
  "/kisiler/yeni": { titleKey: "kisiYeni", icon: "UserPlus" },
  "/kisiler/[id]": { titleKey: "kisiDetay", icon: "User", isDynamic: true },

  "/numaralar": { titleKey: "numaralar", icon: "Phone" },
  "/numaralar/[id]": { titleKey: "numaraDetay", icon: "Phone", isDynamic: true },

  "/araclar": { titleKey: "araclar", icon: "Car" },
  "/araclar/[id]": { titleKey: "aracDetay", icon: "Car", isDynamic: true },

  "/advanced-search": { titleKey: "advancedSearch", icon: "Search" },

  // Faaliyetler
  "/takipler": { titleKey: "takipler", icon: "CalendarClock" },
  "/takipler/yeni": { titleKey: "takipYeni", icon: "CalendarPlus" },
  "/takipler/[id]": { titleKey: "takipDetay", icon: "CalendarClock", isDynamic: true },

  "/tanitimlar": { titleKey: "tanitimlar", icon: "Megaphone" },
  "/tanitimlar/yeni": { titleKey: "tanitimYeni", icon: "Megaphone" },
  "/tanitimlar/[id]": { titleKey: "tanitimDetay", icon: "Megaphone", isDynamic: true },

  "/operasyonlar": { titleKey: "operasyonlar", icon: "Workflow" },
  "/operasyonlar/yeni": { titleKey: "operasyonYeni", icon: "Workflow" },
  "/operasyonlar/[id]": { titleKey: "operasyonDetay", icon: "Workflow", isDynamic: true },

  "/alarmlar": { titleKey: "alarmlar", icon: "Bell" },

  // Tanımlar
  "/tanimlamalar": { titleKey: "tanimlamalar", icon: "ListTree" },
  "/tanimlamalar/faaliyet-alanlari/[id]": { titleKey: "faaliyetAlaniDetay", icon: "Briefcase", isDynamic: true },

  "/lokasyonlar": { titleKey: "lokasyonlar", icon: "MapPin" },
  "/lokasyonlar/iller": { titleKey: "iller", icon: "MapPin" },
  "/lokasyonlar/iller/yeni": { titleKey: "ilYeni", icon: "MapPin" },
  "/lokasyonlar/ilceler": { titleKey: "ilceler", icon: "MapPin" },
  "/lokasyonlar/ilceler/yeni": { titleKey: "ilceYeni", icon: "MapPin" },
  "/lokasyonlar/mahalleler": { titleKey: "mahalleler", icon: "MapPin" },
  "/lokasyonlar/mahalleler/yeni": { titleKey: "mahalleYeni", icon: "MapPin" },

  "/marka-model": { titleKey: "markaModel", icon: "Car" },
  "/marka-model/markalar": { titleKey: "markalar", icon: "Car" },
  "/marka-model/markalar/yeni": { titleKey: "markaYeni", icon: "Car" },
  "/marka-model/modeller": { titleKey: "modeller", icon: "Car" },
  "/marka-model/modeller/yeni": { titleKey: "modelYeni", icon: "Car" },

  // Yönetim
  "/personel": { titleKey: "personel", icon: "UserCog" },
  "/personel/yeni": { titleKey: "personelYeni", icon: "UserPlus" },
  "/personel/[id]": { titleKey: "personelDetay", icon: "UserCog", isDynamic: true },

  "/duyurular": { titleKey: "duyurular", icon: "Megaphone" },
  "/duyurular/[id]": { titleKey: "duyuruDetay", icon: "Megaphone", isDynamic: true },

  "/ayarlar": { titleKey: "ayarlar", icon: "Settings" },

  // Sistem
  "/loglar": { titleKey: "loglar", icon: "Activity" },
  "/loglar/[id]": { titleKey: "logDetay", icon: "Activity", isDynamic: true },
}

// Dynamic route pattern matching
interface RouteMatch {
  pattern: string
  config: RouteConfig
  params: Record<string, string>
}

export function matchRoute(path: string): RouteMatch | null {
  // Exact match
  if (ROUTE_CONFIG[path]) {
    return {
      pattern: path,
      config: ROUTE_CONFIG[path],
      params: {},
    }
  }

  // Dynamic route matching
  const segments = path.split("/").filter(Boolean)

  // /kisiler/[id]
  if (segments.length === 2 && segments[0] === "kisiler" && segments[1] !== "yeni") {
    return {
      pattern: "/kisiler/[id]",
      config: ROUTE_CONFIG["/kisiler/[id]"],
      params: { id: segments[1] },
    }
  }

  // /numaralar/[id]
  if (segments.length === 2 && segments[0] === "numaralar") {
    return {
      pattern: "/numaralar/[id]",
      config: ROUTE_CONFIG["/numaralar/[id]"],
      params: { id: segments[1] },
    }
  }

  // /araclar/[id]
  if (segments.length === 2 && segments[0] === "araclar") {
    return {
      pattern: "/araclar/[id]",
      config: ROUTE_CONFIG["/araclar/[id]"],
      params: { id: segments[1] },
    }
  }

  // /takipler/[id]
  if (segments.length === 2 && segments[0] === "takipler" && segments[1] !== "yeni") {
    return {
      pattern: "/takipler/[id]",
      config: ROUTE_CONFIG["/takipler/[id]"],
      params: { id: segments[1] },
    }
  }

  // /tanitimlar/[id]
  if (segments.length === 2 && segments[0] === "tanitimlar" && segments[1] !== "yeni") {
    return {
      pattern: "/tanitimlar/[id]",
      config: ROUTE_CONFIG["/tanitimlar/[id]"],
      params: { id: segments[1] },
    }
  }

  // /operasyonlar/[id]
  if (segments.length === 2 && segments[0] === "operasyonlar" && segments[1] !== "yeni") {
    return {
      pattern: "/operasyonlar/[id]",
      config: ROUTE_CONFIG["/operasyonlar/[id]"],
      params: { id: segments[1] },
    }
  }

  // /personel/[id]
  if (segments.length === 2 && segments[0] === "personel" && segments[1] !== "yeni") {
    return {
      pattern: "/personel/[id]",
      config: ROUTE_CONFIG["/personel/[id]"],
      params: { id: segments[1] },
    }
  }

  // /duyurular/[id]
  if (segments.length === 2 && segments[0] === "duyurular") {
    return {
      pattern: "/duyurular/[id]",
      config: ROUTE_CONFIG["/duyurular/[id]"],
      params: { id: segments[1] },
    }
  }

  // /loglar/[id]
  if (segments.length === 2 && segments[0] === "loglar" && segments[1] !== "yeni") {
    return {
      pattern: "/loglar/[id]",
      config: ROUTE_CONFIG["/loglar/[id]"],
      params: { id: segments[1] },
    }
  }

  // /tanimlamalar/faaliyet-alanlari/[id]
  if (segments.length === 3 && segments[0] === "tanimlamalar" && segments[1] === "faaliyet-alanlari") {
    return {
      pattern: "/tanimlamalar/faaliyet-alanlari/[id]",
      config: ROUTE_CONFIG["/tanimlamalar/faaliyet-alanlari/[id]"],
      params: { id: segments[2] },
    }
  }

  // Fallback - path'in son segmenti
  return {
    pattern: path,
    config: {
      titleKey: "sayfa",
      icon: "FileText",
    },
    params: {},
  }
}

export function getRouteTitle(path: string, tabs: TabsTranslations): string {
  const match = matchRoute(path)
  if (!match) return tabs.sayfa
  return tabs[match.config.titleKey] || tabs.sayfa
}

export function getRouteTitleKey(path: string): keyof TabsTranslations {
  const match = matchRoute(path)
  return match?.config.titleKey || "sayfa"
}

export function getRouteIcon(path: string): string {
  const match = matchRoute(path)
  return match?.config.icon || "FileText"
}
