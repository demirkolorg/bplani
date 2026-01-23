"use client"

import { useQuery } from "@tanstack/react-query"
import type { Log, Personel, LogIslem } from "@prisma/client"

export interface LogWithUser extends Log {
  user: Pick<Personel, "id" | "ad" | "soyad" | "fotograf"> | null
}

export interface LogDetail extends Log {
  user: Pick<Personel, "id" | "visibleId" | "ad" | "soyad" | "rol" | "fotograf"> | null
}

export interface LoglarResponse {
  data: LogWithUser[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface LoglarFilters {
  page?: number
  limit?: number
  userId?: string
  entityType?: string
  entityId?: string
  islem?: LogIslem
  startDate?: string
  endDate?: string
  search?: string
}

export const logKeys = {
  all: ["loglar"] as const,
  lists: () => [...logKeys.all, "list"] as const,
  list: (filters: LoglarFilters) => [...logKeys.lists(), filters] as const,
  details: () => [...logKeys.all, "detail"] as const,
  detail: (id: string) => [...logKeys.details(), id] as const,
}

async function fetchLoglar(filters: LoglarFilters): Promise<LoglarResponse> {
  const params = new URLSearchParams()

  if (filters.page) params.set("page", filters.page.toString())
  if (filters.limit) params.set("limit", filters.limit.toString())
  if (filters.userId) params.set("userId", filters.userId)
  if (filters.entityType) params.set("entityType", filters.entityType)
  if (filters.entityId) params.set("entityId", filters.entityId)
  if (filters.islem) params.set("islem", filters.islem)
  if (filters.startDate) params.set("startDate", filters.startDate)
  if (filters.endDate) params.set("endDate", filters.endDate)
  if (filters.search) params.set("search", filters.search)

  const response = await fetch(`/api/loglar?${params.toString()}`)
  if (!response.ok) {
    throw new Error("Loglar yüklenirken hata oluştu")
  }
  return response.json()
}

async function fetchLog(id: string): Promise<LogDetail> {
  const response = await fetch(`/api/loglar/${id}`)
  if (!response.ok) {
    throw new Error("Log yüklenirken hata oluştu")
  }
  return response.json()
}

export function useLoglar(filters: LoglarFilters = {}) {
  return useQuery({
    queryKey: logKeys.list(filters),
    queryFn: () => fetchLoglar(filters),
  })
}

export function useLog(id: string) {
  return useQuery({
    queryKey: logKeys.detail(id),
    queryFn: () => fetchLog(id),
    enabled: !!id,
  })
}

// İşlem türü çevirileri
export const islemLabels: Record<LogIslem, string> = {
  CREATE: "Oluşturma",
  UPDATE: "Güncelleme",
  DELETE: "Silme",
  VIEW: "Görüntüleme",
  LOGIN: "Giriş",
  LOGOUT: "Çıkış",
  LOGIN_FAIL: "Başarısız Giriş",
  BULK_CREATE: "Toplu Oluşturma",
  BULK_UPDATE: "Toplu Güncelleme",
  BULK_DELETE: "Toplu Silme",
  STATUS_CHANGE: "Durum Değişikliği",
  EXPORT: "Dışa Aktarma",
}

// Entity türü çevirileri
export const entityTypeLabels: Record<string, string> = {
  Kisi: "Kişi",
  Gsm: "GSM",
  Adres: "Adres",
  Takip: "Takip",
  Tanitim: "Tanıtım",
  Alarm: "Alarm",
  Personel: "Personel",
  Il: "İl",
  Ilce: "İlçe",
  Mahalle: "Mahalle",
  Not: "Not",
  AlarmAyar: "Ayar",
}

// İşlem renklerini al
export function getIslemColor(islem: LogIslem): string {
  switch (islem) {
    case "CREATE":
    case "BULK_CREATE":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
    case "UPDATE":
    case "BULK_UPDATE":
    case "STATUS_CHANGE":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
    case "DELETE":
    case "BULK_DELETE":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
    case "LOGIN":
      return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300"
    case "LOGOUT":
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    case "LOGIN_FAIL":
      return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300"
    case "VIEW":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
    case "EXPORT":
      return "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300"
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
  }
}
