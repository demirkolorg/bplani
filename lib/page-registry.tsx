// Page component registry - tüm dashboard sayfalarının dynamic import'ları
import dynamic from "next/dynamic"
import type { ComponentType } from "react"

// Loading component for pages
const PageLoading = () => (
  <div className="flex items-center justify-center h-full min-h-[200px]">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
  </div>
)

// Dynamic import with loading state
function createDynamicPage(importFn: () => Promise<{ default: ComponentType }>) {
  return dynamic(importFn, {
    loading: PageLoading,
    ssr: false,
  })
}

// Page component registry
export const PAGE_COMPONENTS: Record<string, ComponentType> = {
  // Ana Sayfa
  "/": createDynamicPage(() => import("@/app/(dashboard)/page")),

  // Kişiler
  "/kisiler": createDynamicPage(() => import("@/app/(dashboard)/kisiler/page")),
  "/kisiler/yeni": createDynamicPage(() => import("@/app/(dashboard)/kisiler/yeni/page")),
  "/kisiler/[id]": createDynamicPage(() => import("@/app/(dashboard)/kisiler/[id]/page")),

  // Numaralar
  "/numaralar": createDynamicPage(() => import("@/app/(dashboard)/numaralar/page")),

  // Araçlar
  "/araclar": createDynamicPage(() => import("@/app/(dashboard)/araclar/page")),

  // Takipler
  "/takipler": createDynamicPage(() => import("@/app/(dashboard)/takipler/page")),
  "/takipler/yeni": createDynamicPage(() => import("@/app/(dashboard)/takipler/yeni/page")),
  "/takipler/[id]": createDynamicPage(() => import("@/app/(dashboard)/takipler/[id]/page")),

  // Tanıtımlar
  "/tanitimlar": createDynamicPage(() => import("@/app/(dashboard)/tanitimlar/page")),
  "/tanitimlar/yeni": createDynamicPage(() => import("@/app/(dashboard)/tanitimlar/yeni/page")),
  "/tanitimlar/[id]": createDynamicPage(() => import("@/app/(dashboard)/tanitimlar/[id]/page")),

  // Operasyonlar
  "/operasyonlar": createDynamicPage(() => import("@/app/(dashboard)/operasyonlar/page")),
  "/operasyonlar/yeni": createDynamicPage(() => import("@/app/(dashboard)/operasyonlar/yeni/page")),
  "/operasyonlar/[id]": createDynamicPage(() => import("@/app/(dashboard)/operasyonlar/[id]/page")),

  // Alarmlar
  "/alarmlar": createDynamicPage(() => import("@/app/(dashboard)/alarmlar/page")),

  // Tanımlamalar
  "/tanimlamalar": createDynamicPage(() => import("@/app/(dashboard)/tanimlamalar/page")),

  // Lokasyonlar
  "/lokasyonlar": createDynamicPage(() => import("@/app/(dashboard)/lokasyonlar/page")),
  "/lokasyonlar/iller": createDynamicPage(() => import("@/app/(dashboard)/lokasyonlar/iller/page")),
  "/lokasyonlar/iller/yeni": createDynamicPage(() => import("@/app/(dashboard)/lokasyonlar/iller/yeni/page")),
  "/lokasyonlar/ilceler": createDynamicPage(() => import("@/app/(dashboard)/lokasyonlar/ilceler/page")),
  "/lokasyonlar/ilceler/yeni": createDynamicPage(() => import("@/app/(dashboard)/lokasyonlar/ilceler/yeni/page")),
  "/lokasyonlar/mahalleler": createDynamicPage(() => import("@/app/(dashboard)/lokasyonlar/mahalleler/page")),
  "/lokasyonlar/mahalleler/yeni": createDynamicPage(() => import("@/app/(dashboard)/lokasyonlar/mahalleler/yeni/page")),

  // Marka Model
  "/marka-model": createDynamicPage(() => import("@/app/(dashboard)/marka-model/page")),
  "/marka-model/markalar": createDynamicPage(() => import("@/app/(dashboard)/marka-model/markalar/page")),
  "/marka-model/markalar/yeni": createDynamicPage(() => import("@/app/(dashboard)/marka-model/markalar/yeni/page")),
  "/marka-model/modeller": createDynamicPage(() => import("@/app/(dashboard)/marka-model/modeller/page")),
  "/marka-model/modeller/yeni": createDynamicPage(() => import("@/app/(dashboard)/marka-model/modeller/yeni/page")),

  // Personel
  "/personel": createDynamicPage(() => import("@/app/(dashboard)/personel/page")),
  "/personel/yeni": createDynamicPage(() => import("@/app/(dashboard)/personel/yeni/page")),
  "/personel/[id]": createDynamicPage(() => import("@/app/(dashboard)/personel/[id]/page")),

  // Ayarlar
  "/ayarlar": createDynamicPage(() => import("@/app/(dashboard)/ayarlar/page")),

  // Loglar
  "/loglar": createDynamicPage(() => import("@/app/(dashboard)/loglar/page")),
  "/loglar/[id]": createDynamicPage(() => import("@/app/(dashboard)/loglar/[id]/page")),

  // Advanced Search / Gelişmiş Arama
  "/advanced-search": createDynamicPage(() => import("@/app/(dashboard)/advanced-search/page")),
  "/gelismi-arama": createDynamicPage(() => import("@/app/(dashboard)/advanced-search/page")),
}

// Path'i pattern'e çevir ve component'i bul
export function getPageComponent(path: string): { Component: ComponentType; params: Record<string, string> } | null {
  // Exact match
  if (PAGE_COMPONENTS[path]) {
    return { Component: PAGE_COMPONENTS[path], params: {} }
  }

  // Dynamic route matching
  const segments = path.split("/").filter(Boolean)

  // /kisiler/[id]
  if (segments.length === 2 && segments[0] === "kisiler" && segments[1] !== "yeni") {
    return {
      Component: PAGE_COMPONENTS["/kisiler/[id]"],
      params: { id: segments[1] },
    }
  }

  // /takipler/[id]
  if (segments.length === 2 && segments[0] === "takipler" && segments[1] !== "yeni") {
    return {
      Component: PAGE_COMPONENTS["/takipler/[id]"],
      params: { id: segments[1] },
    }
  }

  // /tanitimlar/[id]
  if (segments.length === 2 && segments[0] === "tanitimlar" && segments[1] !== "yeni") {
    return {
      Component: PAGE_COMPONENTS["/tanitimlar/[id]"],
      params: { id: segments[1] },
    }
  }

  // /operasyonlar/[id]
  if (segments.length === 2 && segments[0] === "operasyonlar" && segments[1] !== "yeni") {
    return {
      Component: PAGE_COMPONENTS["/operasyonlar/[id]"],
      params: { id: segments[1] },
    }
  }

  // /personel/[id]
  if (segments.length === 2 && segments[0] === "personel" && segments[1] !== "yeni") {
    return {
      Component: PAGE_COMPONENTS["/personel/[id]"],
      params: { id: segments[1] },
    }
  }

  // /loglar/[id]
  if (segments.length === 2 && segments[0] === "loglar" && segments[1] !== "yeni") {
    return {
      Component: PAGE_COMPONENTS["/loglar/[id]"],
      params: { id: segments[1] },
    }
  }

  return null
}
