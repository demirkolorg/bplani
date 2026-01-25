import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import type { CreateTanitimInput, UpdateTanitimInput, ListTanitimQuery, AddKatilimciInput } from "@/lib/validations"

// Types for API responses
export interface TanitimKatilimci {
  id: string
  tanitimId: string
  kisiId: string | null
  gsmId: string | null
  kisi?: {
    id: string
    ad: string
    soyad: string
    tt: boolean
    gsmler?: {
      id: string
      numara: string
      isPrimary: boolean
    }[]
  } | null
}

export interface TanitimMahalle {
  id: string
  ad: string
  ilce: {
    id: string
    ad: string
    il: {
      id: string
      ad: string
      plaka: number | null
    }
  }
}

export interface Tanitim {
  id: string
  tarih: string
  saat: string | null
  mahalleId: string | null
  mahalle: TanitimMahalle | null
  adresDetay: string | null
  notlar: string | null
  createdAt: string
  updatedAt: string
  createdUserId: string | null
  updatedUserId: string | null
  katilimcilar: TanitimKatilimci[]
  createdUser?: { ad: string; soyad: string } | null
  updatedUser?: { ad: string; soyad: string } | null
}

export interface TanitimListResponse {
  data: Tanitim[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Query keys
export const tanitimKeys = {
  all: ["tanitimlar"] as const,
  lists: () => [...tanitimKeys.all, "list"] as const,
  list: (params: Partial<ListTanitimQuery>) => [...tanitimKeys.lists(), params] as const,
  details: () => [...tanitimKeys.all, "detail"] as const,
  detail: (id: string) => [...tanitimKeys.details(), id] as const,
  katilimcilar: (tanitimId: string) => [...tanitimKeys.detail(tanitimId), "katilimcilar"] as const,
  byKisi: (kisiId: string) => [...tanitimKeys.all, "byKisi", kisiId] as const,
}

// Fetch functions
async function fetchTanitimlar(params: Partial<ListTanitimQuery> = {}): Promise<TanitimListResponse> {
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

  const response = await fetch(`/api/tanitimlar?${searchParams.toString()}`)
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Tanıtımlar yüklenirken hata oluştu")
  }
  return response.json()
}

async function fetchTanitim(id: string): Promise<Tanitim> {
  const response = await fetch(`/api/tanitimlar/${id}`)
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Tanıtım yüklenirken hata oluştu")
  }
  return response.json()
}

async function createTanitim(data: CreateTanitimInput): Promise<Tanitim> {
  const response = await fetch("/api/tanitimlar", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Tanıtım oluşturulurken hata oluştu")
  }
  return response.json()
}

async function updateTanitim({ id, data }: { id: string; data: UpdateTanitimInput }): Promise<Tanitim> {
  const response = await fetch(`/api/tanitimlar/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Tanıtım güncellenirken hata oluştu")
  }
  return response.json()
}

async function deleteTanitim(id: string): Promise<void> {
  const response = await fetch(`/api/tanitimlar/${id}`, {
    method: "DELETE",
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Tanıtım silinirken hata oluştu")
  }
}

async function addKatilimci({ tanitimId, data }: { tanitimId: string; data: AddKatilimciInput }): Promise<TanitimKatilimci> {
  const response = await fetch(`/api/tanitimlar/${tanitimId}/katilimcilar`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Katılımcı eklenirken hata oluştu")
  }
  return response.json()
}

async function removeKatilimci({ tanitimId, katilimciId }: { tanitimId: string; katilimciId: string }): Promise<void> {
  const response = await fetch(`/api/tanitimlar/${tanitimId}/katilimcilar/${katilimciId}`, {
    method: "DELETE",
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Katılımcı silinirken hata oluştu")
  }
}

async function fetchTanitimlarByKisi(kisiId: string): Promise<Tanitim[]> {
  const response = await fetch(`/api/kisiler/${kisiId}/tanitimlar`)
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Kişi tanıtımları yüklenirken hata oluştu")
  }
  return response.json()
}

// Hooks
export function useTanitimlar(params: Partial<ListTanitimQuery> = {}) {
  return useQuery({
    queryKey: tanitimKeys.list(params),
    queryFn: () => fetchTanitimlar(params),
  })
}

export function useTanitim(id: string) {
  return useQuery({
    queryKey: tanitimKeys.detail(id),
    queryFn: () => fetchTanitim(id),
    enabled: !!id,
  })
}

export function useCreateTanitim() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createTanitim,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tanitimKeys.lists() })
      // Invalidate all byKisi queries since we don't know which kisi was added
      queryClient.invalidateQueries({ queryKey: [...tanitimKeys.all, "byKisi"] })
    },
  })
}

export function useUpdateTanitim() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateTanitim,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: tanitimKeys.lists() })
      queryClient.setQueryData(tanitimKeys.detail(data.id), data)
    },
  })
}

export function useDeleteTanitim() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteTanitim,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tanitimKeys.lists() })
    },
  })
}

export function useAddKatilimci() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: addKatilimci,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: tanitimKeys.detail(variables.tanitimId) })
      queryClient.invalidateQueries({ queryKey: tanitimKeys.lists() })
      // Invalidate all byKisi queries since we don't know which kisi was added
      queryClient.invalidateQueries({ queryKey: [...tanitimKeys.all, "byKisi"] })
    },
  })
}

export function useRemoveKatilimci() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: removeKatilimci,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: tanitimKeys.detail(variables.tanitimId) })
      queryClient.invalidateQueries({ queryKey: tanitimKeys.lists() })
      // Invalidate all byKisi queries
      queryClient.invalidateQueries({ queryKey: [...tanitimKeys.all, "byKisi"] })
    },
  })
}

export function useTanitimlarByKisi(kisiId: string) {
  return useQuery({
    queryKey: tanitimKeys.byKisi(kisiId),
    queryFn: () => fetchTanitimlarByKisi(kisiId),
    enabled: !!kisiId,
  })
}
