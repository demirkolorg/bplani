// Tab sistemi konfigürasyonu - route başlıkları ve ikonları

export interface RouteConfig {
  title: string
  icon: string
  isDynamic?: boolean
}

// Static route tanımları
export const ROUTE_CONFIG: Record<string, RouteConfig> = {
  "/": { title: "Ana Sayfa", icon: "Home" },

  // Kayıtlar
  "/kisiler": { title: "Kişiler", icon: "Users" },
  "/kisiler/yeni": { title: "Yeni Kişi", icon: "UserPlus" },
  "/kisiler/[id]": { title: "Kişi Detay", icon: "User", isDynamic: true },

  "/numaralar": { title: "Numaralar", icon: "Phone" },

  "/araclar": { title: "Araçlar", icon: "Car" },

  // Faaliyetler
  "/takipler": { title: "Takipler", icon: "CalendarClock" },
  "/takipler/yeni": { title: "Yeni Takip", icon: "CalendarPlus" },
  "/takipler/[id]": { title: "Takip Detay", icon: "CalendarClock", isDynamic: true },

  "/tanitimlar": { title: "Tanıtımlar", icon: "Megaphone" },
  "/tanitimlar/yeni": { title: "Yeni Tanıtım", icon: "Megaphone" },
  "/tanitimlar/[id]": { title: "Tanıtım Detay", icon: "Megaphone", isDynamic: true },

  "/operasyonlar": { title: "Operasyonlar", icon: "Workflow" },
  "/operasyonlar/yeni": { title: "Yeni Operasyon", icon: "Workflow" },
  "/operasyonlar/[id]": { title: "Operasyon Detay", icon: "Workflow", isDynamic: true },

  "/alarmlar": { title: "Alarmlar", icon: "Bell" },

  // Tanımlar
  "/tanimlamalar": { title: "Tanımlamalar", icon: "ListTree" },

  "/lokasyonlar": { title: "Lokasyonlar", icon: "MapPin" },
  "/lokasyonlar/iller": { title: "İller", icon: "MapPin" },
  "/lokasyonlar/iller/yeni": { title: "Yeni İl", icon: "MapPin" },
  "/lokasyonlar/ilceler": { title: "İlçeler", icon: "MapPin" },
  "/lokasyonlar/ilceler/yeni": { title: "Yeni İlçe", icon: "MapPin" },
  "/lokasyonlar/mahalleler": { title: "Mahalleler", icon: "MapPin" },
  "/lokasyonlar/mahalleler/yeni": { title: "Yeni Mahalle", icon: "MapPin" },

  "/marka-model": { title: "Marka Model", icon: "Car" },
  "/marka-model/markalar": { title: "Markalar", icon: "Car" },
  "/marka-model/markalar/yeni": { title: "Yeni Marka", icon: "Car" },
  "/marka-model/modeller": { title: "Modeller", icon: "Car" },
  "/marka-model/modeller/yeni": { title: "Yeni Model", icon: "Car" },

  // Yönetim
  "/personel": { title: "Personel", icon: "UserCog" },
  "/personel/yeni": { title: "Yeni Personel", icon: "UserPlus" },
  "/personel/[id]": { title: "Personel Detay", icon: "UserCog", isDynamic: true },

  "/ayarlar": { title: "Ayarlar", icon: "Settings" },

  // Sistem
  "/loglar": { title: "Loglar", icon: "Activity" },
  "/loglar/[id]": { title: "Log Detay", icon: "Activity", isDynamic: true },
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

  // /loglar/[id]
  if (segments.length === 2 && segments[0] === "loglar" && segments[1] !== "yeni") {
    return {
      pattern: "/loglar/[id]",
      config: ROUTE_CONFIG["/loglar/[id]"],
      params: { id: segments[1] },
    }
  }

  // Fallback - path'in son segmenti
  return {
    pattern: path,
    config: {
      title: segments[segments.length - 1] || "Sayfa",
      icon: "FileText",
    },
    params: {},
  }
}

export function getRouteTitle(path: string): string {
  const match = matchRoute(path)
  return match?.config.title || "Sayfa"
}

export function getRouteIcon(path: string): string {
  const match = matchRoute(path)
  return match?.config.icon || "FileText"
}
