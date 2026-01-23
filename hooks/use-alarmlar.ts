import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import type { CreateAlarmInput, UpdateAlarmInput, ListAlarmQuery, AlarmTip, AlarmDurum } from "@/lib/validations"

// Types for API responses
export interface AlarmKisi {
  id: string
  ad: string
  soyad: string
  tip?: string
  tc?: string | null
}

export interface AlarmGsm {
  id: string
  numara: string
  kisi: AlarmKisi
}

export interface AlarmTakip {
  id: string
  baslamaTarihi: string
  bitisTarihi: string
  gsm: AlarmGsm
}

export interface Alarm {
  id: string
  takipId: string | null
  tip: AlarmTip
  baslik: string | null
  mesaj: string | null
  tetikTarihi: string
  gunOnce: number
  isPaused: boolean
  durum: AlarmDurum
  createdAt: string
  updatedAt: string
  createdUserId: string | null
  takip: AlarmTakip | null
  createdUser?: { ad: string; soyad: string } | null
}

export interface AlarmListResponse {
  data: Alarm[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface BildirimResponse {
  bildirimler: Alarm[]
  unreadCount: number
}

// Query keys
export const alarmKeys = {
  all: ["alarmlar"] as const,
  lists: () => [...alarmKeys.all, "list"] as const,
  list: (params: Partial<ListAlarmQuery>) => [...alarmKeys.lists(), params] as const,
  details: () => [...alarmKeys.all, "detail"] as const,
  detail: (id: string) => [...alarmKeys.details(), id] as const,
  bildirimler: () => [...alarmKeys.all, "bildirimler"] as const,
}

// Fetch functions
async function fetchAlarmlar(params: Partial<ListAlarmQuery> = {}): Promise<AlarmListResponse> {
  const searchParams = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, String(value))
    }
  })

  const response = await fetch(`/api/alarmlar?${searchParams.toString()}`)
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Alarmlar yüklenirken hata oluştu")
  }
  return response.json()
}

async function fetchAlarm(id: string): Promise<Alarm> {
  const response = await fetch(`/api/alarmlar/${id}`)
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Alarm yüklenirken hata oluştu")
  }
  return response.json()
}

async function createAlarm(data: CreateAlarmInput): Promise<Alarm> {
  const response = await fetch("/api/alarmlar", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Alarm oluşturulurken hata oluştu")
  }
  return response.json()
}

async function updateAlarm({ id, data }: { id: string; data: UpdateAlarmInput }): Promise<Alarm> {
  const response = await fetch(`/api/alarmlar/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Alarm güncellenirken hata oluştu")
  }
  return response.json()
}

async function deleteAlarm(id: string): Promise<void> {
  const response = await fetch(`/api/alarmlar/${id}`, {
    method: "DELETE",
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Alarm silinirken hata oluştu")
  }
}

async function fetchBildirimler(): Promise<BildirimResponse> {
  const response = await fetch("/api/alarmlar/bildirimler")
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Bildirimler yüklenirken hata oluştu")
  }
  return response.json()
}

async function markAllAsRead(): Promise<void> {
  const response = await fetch("/api/alarmlar/bildirimler", {
    method: "POST",
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Bildirimler okundu olarak işaretlenirken hata oluştu")
  }
}

// Hooks
export function useAlarmlar(params: Partial<ListAlarmQuery> = {}) {
  return useQuery({
    queryKey: alarmKeys.list(params),
    queryFn: () => fetchAlarmlar(params),
  })
}

export function useAlarm(id: string) {
  return useQuery({
    queryKey: alarmKeys.detail(id),
    queryFn: () => fetchAlarm(id),
    enabled: !!id,
  })
}

export function useCreateAlarm() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createAlarm,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: alarmKeys.lists() })
      queryClient.invalidateQueries({ queryKey: alarmKeys.bildirimler() })
    },
  })
}

export function useUpdateAlarm() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateAlarm,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: alarmKeys.lists() })
      queryClient.invalidateQueries({ queryKey: alarmKeys.bildirimler() })
      queryClient.setQueryData(alarmKeys.detail(data.id), data)
    },
  })
}

export function useDeleteAlarm() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteAlarm,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: alarmKeys.lists() })
      queryClient.invalidateQueries({ queryKey: alarmKeys.bildirimler() })
    },
  })
}

export function useBildirimler() {
  return useQuery({
    queryKey: alarmKeys.bildirimler(),
    queryFn: fetchBildirimler,
    refetchInterval: 60000, // Refetch every minute
  })
}

export function useMarkAllAsRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: alarmKeys.bildirimler() })
      queryClient.invalidateQueries({ queryKey: alarmKeys.lists() })
    },
  })
}
