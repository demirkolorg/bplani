import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import type { CreateTakipInput, UpdateTakipInput, BulkCreateTakipInput, ListTakipQuery, TakipDurum } from "@/lib/validations"
import { gsmKeys } from "./use-gsm"
import { alarmKeys } from "./use-alarmlar"

export interface Takip {
  id: string
  gsmId: string
  baslamaTarihi: string
  bitisTarihi: string
  durum: TakipDurum
  isActive: boolean
  createdAt: string
  updatedAt: string
  createdUserId: string | null
  updatedUserId: string | null
  gsm: {
    id: string
    numara: string
    kisi: {
      id: string
      ad: string
      soyad: string
      tt: boolean
      fotograf?: string | null
    } | null
  }
  alarmlar?: Array<{
    id: string
    tip: string
    tetikTarihi: string
    mesaj: string | null
    durum: string
  }>
  createdUser: {
    id: string
    ad: string
    soyad: string
  } | null
  updatedUser: {
    id: string
    ad: string
    soyad: string
  } | null
  _count?: {
    alarmlar: number
  }
}

export interface TakipListResponse {
  data: Takip[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Query keys
export const takipKeys = {
  all: ["takipler"] as const,
  lists: () => [...takipKeys.all, "list"] as const,
  list: (params: Partial<ListTakipQuery>) => [...takipKeys.lists(), params] as const,
  details: () => [...takipKeys.all, "detail"] as const,
  detail: (id: string) => [...takipKeys.details(), id] as const,
  byGsm: (gsmId: string) => [...takipKeys.all, "gsm", gsmId] as const,
  byKisi: (kisiId: string) => [...takipKeys.all, "kisi", kisiId] as const,
}

// Fetch functions
async function fetchTakipler(params: Partial<ListTakipQuery> = {}): Promise<TakipListResponse> {
  const searchParams = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      if (value instanceof Date) {
        searchParams.set(key, value.toISOString())
      } else {
        searchParams.set(key, String(value))
      }
    }
  })

  const response = await fetch(`/api/takipler?${searchParams.toString()}`)
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Takipler yüklenirken hata oluştu")
  }
  return response.json()
}

async function fetchTakip(id: string): Promise<Takip> {
  const response = await fetch(`/api/takipler/${id}`)
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Takip yüklenirken hata oluştu")
  }
  return response.json()
}

async function createTakip(data: CreateTakipInput): Promise<Takip> {
  const response = await fetch("/api/takipler", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Takip oluşturulurken hata oluştu")
  }
  return response.json()
}

async function bulkCreateTakip(data: BulkCreateTakipInput): Promise<{ count: number }> {
  const response = await fetch("/api/takipler", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Takipler oluşturulurken hata oluştu")
  }
  return response.json()
}

async function updateTakip({ id, data }: { id: string; data: UpdateTakipInput }): Promise<Takip> {
  const response = await fetch(`/api/takipler/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Takip güncellenirken hata oluştu")
  }
  return response.json()
}

async function deleteTakip(id: string): Promise<void> {
  const response = await fetch(`/api/takipler/${id}`, {
    method: "DELETE",
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Takip silinirken hata oluştu")
  }
}

// Hooks
export function useTakipler(params: Partial<ListTakipQuery> = {}) {
  return useQuery({
    queryKey: takipKeys.list(params),
    queryFn: () => fetchTakipler(params),
  })
}

export function useTakip(id: string) {
  return useQuery({
    queryKey: takipKeys.detail(id),
    queryFn: () => fetchTakip(id),
    enabled: !!id,
  })
}

export function useTakiplerByGsm(gsmId: string) {
  return useQuery({
    queryKey: takipKeys.byGsm(gsmId),
    queryFn: () => fetchTakipler({ gsmId, limit: 100 }),
    enabled: !!gsmId,
  })
}

export function useTakiplerByKisi(kisiId: string) {
  return useQuery({
    queryKey: takipKeys.byKisi(kisiId),
    queryFn: () => fetchTakipler({ kisiId, limit: 100 }),
    enabled: !!kisiId,
  })
}

export function useCreateTakip() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createTakip,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: takipKeys.lists() })
      queryClient.invalidateQueries({ queryKey: takipKeys.byGsm(data.gsmId) })
      // Invalidate alarm queries (takip oluşturulunca otomatik alarm oluşuyor)
      queryClient.invalidateQueries({ queryKey: alarmKeys.all })
      if (data.gsm.kisi?.id) {
        queryClient.invalidateQueries({ queryKey: takipKeys.byKisi(data.gsm.kisi.id) })
        // Invalidate GSM queries to refresh takip data in GSM list
        queryClient.invalidateQueries({ queryKey: gsmKeys.byKisi(data.gsm.kisi.id) })
      }
    },
  })
}

export function useBulkCreateTakip() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: bulkCreateTakip,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: takipKeys.all })
      // Invalidate alarm queries (takip oluşturulunca otomatik alarm oluşuyor)
      queryClient.invalidateQueries({ queryKey: alarmKeys.all })
    },
  })
}

export function useUpdateTakip() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateTakip,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: takipKeys.lists() })
      queryClient.invalidateQueries({ queryKey: takipKeys.detail(data.id) })
      queryClient.invalidateQueries({ queryKey: takipKeys.byGsm(data.gsmId) })
      // Invalidate alarm queries (takip güncellenince alarm tarihleri değişebilir)
      queryClient.invalidateQueries({ queryKey: alarmKeys.all })
      if (data.gsm.kisi?.id) {
        queryClient.invalidateQueries({ queryKey: takipKeys.byKisi(data.gsm.kisi.id) })
        // Invalidate GSM queries to refresh takip data in GSM list
        queryClient.invalidateQueries({ queryKey: gsmKeys.byKisi(data.gsm.kisi.id) })
      }
    },
  })
}

export function useDeleteTakip() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteTakip,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: takipKeys.all })
      // Invalidate alarm queries (takip silinince alarmlar da siliniyor)
      queryClient.invalidateQueries({ queryKey: alarmKeys.all })
    },
  })
}
