import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import type { CreateOperasyonInput, UpdateOperasyonInput, ListOperasyonQuery, AddOperasyonKatilimciInput, AddOperasyonAracInput } from "@/lib/validations"

// Types for API responses
export interface OperasyonKatilimci {
  id: string
  operasyonId: string
  kisiId: string | null
  gsmId: string | null
  kisi?: {
    id: string
    ad: string
    soyad: string
    tc: string | null
    tt: boolean
    gsmler?: {
      id: string
      numara: string
      isPrimary: boolean
    }[]
  } | null
}

export interface OperasyonArac {
  id: string
  operasyonId: string
  aracId: string
  aciklama: string | null
  createdAt: string
  arac: {
    id: string
    plaka: string
    renk: string | null
    model: {
      id: string
      ad: string
      marka: {
        id: string
        ad: string
      }
    }
    kisiler: {
      kisi: {
        id: string
        ad: string
        soyad: string
        tt: boolean
      }
      aciklama: string | null
    }[]
  }
}

export interface OperasyonMahalle {
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

export interface Operasyon {
  id: string
  baslik: string | null
  tarih: string
  saat: string | null
  mahalleId: string | null
  mahalle: OperasyonMahalle | null
  adresDetay: string | null
  notlar: string | null
  createdAt: string
  updatedAt: string
  createdUserId: string | null
  updatedUserId: string | null
  katilimcilar: OperasyonKatilimci[]
  araclar: OperasyonArac[]
  createdUser?: { ad: string; soyad: string } | null
  updatedUser?: { ad: string; soyad: string } | null
}

export interface OperasyonListResponse {
  data: Operasyon[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Query keys
export const operasyonKeys = {
  all: ["operasyonlar"] as const,
  lists: () => [...operasyonKeys.all, "list"] as const,
  list: (params: Partial<ListOperasyonQuery>) => [...operasyonKeys.lists(), params] as const,
  details: () => [...operasyonKeys.all, "detail"] as const,
  detail: (id: string) => [...operasyonKeys.details(), id] as const,
  katilimcilar: (operasyonId: string) => [...operasyonKeys.detail(operasyonId), "katilimcilar"] as const,
  araclar: (operasyonId: string) => [...operasyonKeys.detail(operasyonId), "araclar"] as const,
  byKisi: (kisiId: string) => [...operasyonKeys.all, "byKisi", kisiId] as const,
}

// Fetch functions
async function fetchOperasyonlar(params: Partial<ListOperasyonQuery> = {}): Promise<OperasyonListResponse> {
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

  const response = await fetch(`/api/operasyonlar?${searchParams.toString()}`)
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Operasyonlar yüklenirken hata oluştu")
  }
  return response.json()
}

async function fetchOperasyon(id: string): Promise<Operasyon> {
  const response = await fetch(`/api/operasyonlar/${id}`)
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Operasyon yüklenirken hata oluştu")
  }
  return response.json()
}

async function createOperasyon(data: CreateOperasyonInput): Promise<Operasyon> {
  const response = await fetch("/api/operasyonlar", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Operasyon oluşturulurken hata oluştu")
  }
  return response.json()
}

async function updateOperasyon({ id, data }: { id: string; data: UpdateOperasyonInput }): Promise<Operasyon> {
  const response = await fetch(`/api/operasyonlar/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Operasyon güncellenirken hata oluştu")
  }
  return response.json()
}

async function deleteOperasyon(id: string): Promise<void> {
  const response = await fetch(`/api/operasyonlar/${id}`, {
    method: "DELETE",
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Operasyon silinirken hata oluştu")
  }
}

async function addOperasyonKatilimci({ operasyonId, data }: { operasyonId: string; data: AddOperasyonKatilimciInput }): Promise<OperasyonKatilimci> {
  const response = await fetch(`/api/operasyonlar/${operasyonId}/katilimcilar`, {
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

async function removeOperasyonKatilimci({ operasyonId, katilimciId }: { operasyonId: string; katilimciId: string }): Promise<void> {
  const response = await fetch(`/api/operasyonlar/${operasyonId}/katilimcilar/${katilimciId}`, {
    method: "DELETE",
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Katılımcı silinirken hata oluştu")
  }
}

async function addOperasyonArac({ operasyonId, data }: { operasyonId: string; data: AddOperasyonAracInput }): Promise<OperasyonArac> {
  const response = await fetch(`/api/operasyonlar/${operasyonId}/araclar`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Araç eklenirken hata oluştu")
  }
  return response.json()
}

async function removeOperasyonArac({ operasyonId, aracId }: { operasyonId: string; aracId: string }): Promise<void> {
  const response = await fetch(`/api/operasyonlar/${operasyonId}/araclar/${aracId}`, {
    method: "DELETE",
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Araç kaldırılırken hata oluştu")
  }
}

async function fetchOperasyonlarByKisi(kisiId: string): Promise<Operasyon[]> {
  const response = await fetch(`/api/kisiler/${kisiId}/operasyonlar`)
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Kişi operasyonları yüklenirken hata oluştu")
  }
  return response.json()
}

// Hooks
export function useOperasyonlar(params: Partial<ListOperasyonQuery> = {}) {
  return useQuery({
    queryKey: operasyonKeys.list(params),
    queryFn: () => fetchOperasyonlar(params),
  })
}

export function useOperasyon(id: string) {
  return useQuery({
    queryKey: operasyonKeys.detail(id),
    queryFn: () => fetchOperasyon(id),
    enabled: !!id,
  })
}

export function useCreateOperasyon() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createOperasyon,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: operasyonKeys.lists() })
      // Invalidate all byKisi queries since we don't know which kisi was added
      queryClient.invalidateQueries({ queryKey: [...operasyonKeys.all, "byKisi"] })
    },
  })
}

export function useUpdateOperasyon() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateOperasyon,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: operasyonKeys.lists() })
      queryClient.setQueryData(operasyonKeys.detail(data.id), data)
    },
  })
}

export function useDeleteOperasyon() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteOperasyon,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: operasyonKeys.lists() })
    },
  })
}

export function useAddOperasyonKatilimci() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: addOperasyonKatilimci,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: operasyonKeys.detail(variables.operasyonId) })
      queryClient.invalidateQueries({ queryKey: operasyonKeys.lists() })
      // Invalidate all byKisi queries since we don't know which kisi was added
      queryClient.invalidateQueries({ queryKey: [...operasyonKeys.all, "byKisi"] })
    },
  })
}

export function useRemoveOperasyonKatilimci() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: removeOperasyonKatilimci,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: operasyonKeys.detail(variables.operasyonId) })
      queryClient.invalidateQueries({ queryKey: operasyonKeys.lists() })
      // Invalidate all byKisi queries
      queryClient.invalidateQueries({ queryKey: [...operasyonKeys.all, "byKisi"] })
    },
  })
}

export function useAddOperasyonArac() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: addOperasyonArac,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: operasyonKeys.detail(variables.operasyonId) })
      queryClient.invalidateQueries({ queryKey: operasyonKeys.lists() })
    },
  })
}

export function useRemoveOperasyonArac() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: removeOperasyonArac,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: operasyonKeys.detail(variables.operasyonId) })
      queryClient.invalidateQueries({ queryKey: operasyonKeys.lists() })
    },
  })
}

export function useOperasyonlarByKisi(kisiId: string) {
  return useQuery({
    queryKey: operasyonKeys.byKisi(kisiId),
    queryFn: () => fetchOperasyonlarByKisi(kisiId),
    enabled: !!kisiId,
  })
}
