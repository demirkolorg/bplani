import { useQuery } from "@tanstack/react-query"

export interface DashboardStats {
  kisi: {
    total: number
    musteri: number
    lead: number
  }
  takip: {
    total: number
    active: number
    expiringSoon: number
    expiringSoonList: Array<{
      id: string
      bitisTarihi: string
      gsm: {
        numara: string
        kisi: { ad: string; soyad: string } | null
      }
    }>
  }
  tanitim: {
    total: number
    thisMonth: number
  }
  operasyon: {
    total: number
    thisMonth: number
  }
  alarm: {
    pending: number
    triggered: number
  }
  gsm: number
  adres: number
  arac: number
  recentActivity: {
    kisiler: Array<{
      id: string
      ad: string
      soyad: string
      tip: string
      createdAt: string
    }>
    takipler: Array<{
      id: string
      createdAt: string
      gsm: {
        numara: string
        kisi: { ad: string; soyad: string } | null
      }
    }>
    tanitimlar: Array<{
      id: string
      tarih: string
      createdAt: string
      _count: { katilimcilar: number }
    }>
  }
}

async function fetchDashboardStats(): Promise<DashboardStats> {
  const response = await fetch("/api/dashboard/stats")
  if (!response.ok) {
    throw new Error("İstatistikler alınamadı")
  }
  return response.json()
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: fetchDashboardStats,
    refetchInterval: 60000, // Her 1 dakikada bir yenile
    staleTime: 30000, // 30 saniye boyunca taze say
  })
}
