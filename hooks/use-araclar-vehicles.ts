import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import type {
  CreateAracInput,
  UpdateAracInput,
  AddKisiToAracInput,
  AracRenk,
} from "@/lib/validations"
import { toast } from "sonner"
import { getErrorMessage } from "@/lib/error-handler"
import { queryConfig } from "@/lib/query-config"

// ==================== TYPES ====================
interface UserInfo {
  ad: string
  soyad: string
}

interface MarkaInfo {
  id: string
  ad: string
}

interface ModelInfo {
  id: string
  ad: string
  marka: MarkaInfo
}

interface KisiInfo {
  id: string
  ad: string
  soyad: string
  tt: boolean
}

interface AracKisiInfo {
  kisi: KisiInfo
  aciklama?: string | null
  id: string
}

interface MahalleInfo {
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

interface KatilimciInfo {
  id: string
  kisi?: {
    id: string
    ad: string
    soyad: string
    tc: string | null
    tt: boolean
  } | null
}

interface TanitimInfo {
  id: string
  baslik: string | null
  tarih: string
  saat: string | null
  mahalleId: string | null
  mahalle: MahalleInfo | null
  adresDetay: string | null
  notlar: string | null
  katilimcilar: KatilimciInfo[]
}

interface OperasyonInfo {
  id: string
  baslik: string | null
  tarih: string
  saat: string | null
  mahalleId: string | null
  mahalle: MahalleInfo | null
  adresDetay: string | null
  notlar: string | null
  katilimcilar: KatilimciInfo[]
}

export interface Arac {
  id: string
  modelId: string
  renk: AracRenk | null
  plaka: string
  createdAt: string
  updatedAt: string
  createdUserId: string | null
  updatedUserId: string | null
  createdUser: UserInfo | null
  updatedUser: UserInfo | null
  model: ModelInfo
  kisiler: AracKisiInfo[]
  tanitimlar?: { tanitim: TanitimInfo }[]
  operasyonlar?: { operasyon: OperasyonInfo }[]
}

interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

interface ListAracParams {
  page?: number
  limit?: number
  kisiId?: string
  modelId?: string
  markaId?: string
  search?: string
  sortBy?: "plaka" | "renk" | "createdAt" | "updatedAt"
  sortOrder?: "asc" | "desc"
}

// ==================== QUERY KEYS ====================
export const aracKeys = {
  all: ["araclar", "vehicles"] as const,
  lists: () => [...aracKeys.all, "list"] as const,
  list: (params?: ListAracParams) => [...aracKeys.lists(), params] as const,
  listByKisi: (kisiId?: string) => [...aracKeys.lists(), { kisiId }] as const,
  details: () => [...aracKeys.all, "detail"] as const,
  detail: (id: string) => [...aracKeys.details(), id] as const,
}

// ==================== FETCH FUNCTIONS ====================
async function fetchAraclar(params?: ListAracParams): Promise<PaginatedResponse<Arac>> {
  const searchParams = new URLSearchParams()

  if (params?.page) searchParams.set("page", String(params.page))
  if (params?.limit) searchParams.set("limit", String(params.limit))
  if (params?.kisiId) searchParams.set("kisiId", params.kisiId)
  if (params?.modelId) searchParams.set("modelId", params.modelId)
  if (params?.markaId) searchParams.set("markaId", params.markaId)
  if (params?.search) searchParams.set("search", params.search)
  if (params?.sortBy) searchParams.set("sortBy", params.sortBy)
  if (params?.sortOrder) searchParams.set("sortOrder", params.sortOrder)

  const queryString = searchParams.toString()
  const url = `/api/araclar/vehicles${queryString ? `?${queryString}` : ""}`

  const response = await fetch(url)
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Araçlar yüklenirken hata oluştu")
  }
  return response.json()
}

async function fetchArac(id: string): Promise<Arac> {
  const response = await fetch(`/api/araclar/vehicles/${id}`)
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Araç yüklenirken hata oluştu")
  }
  return response.json()
}

async function createArac(data: CreateAracInput): Promise<Arac> {
  const response = await fetch("/api/araclar/vehicles", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Araç oluşturulurken hata oluştu")
  }
  return response.json()
}

async function updateArac({ id, data }: { id: string; data: UpdateAracInput }): Promise<Arac> {
  const response = await fetch(`/api/araclar/vehicles/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Araç güncellenirken hata oluştu")
  }
  return response.json()
}

async function deleteArac(id: string): Promise<void> {
  const response = await fetch(`/api/araclar/vehicles/${id}`, {
    method: "DELETE",
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Araç silinirken hata oluştu")
  }
}

async function addKisiToArac({ aracId, data }: { aracId: string; data: AddKisiToAracInput }): Promise<void> {
  const response = await fetch(`/api/araclar/vehicles/${aracId}/kisiler`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Kişi araca eklenirken hata oluştu")
  }
}

async function removeKisiFromArac({ aracId, kisiId }: { aracId: string; kisiId: string }): Promise<void> {
  const response = await fetch(`/api/araclar/vehicles/${aracId}/kisiler/${kisiId}`, {
    method: "DELETE",
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Kişi araçtan çıkarılırken hata oluştu")
  }
}

// ==================== QUERY HOOKS ====================
export function useAraclar(params?: ListAracParams) {
  return useQuery({
    queryKey: aracKeys.list(params),
    queryFn: () => fetchAraclar(params),
    staleTime: queryConfig.list.staleTime,
    gcTime: queryConfig.list.gcTime,
  })
}

export function useAraclarByKisi(kisiId?: string) {
  return useQuery({
    queryKey: aracKeys.listByKisi(kisiId),
    queryFn: () => fetchAraclar({ kisiId }),
    enabled: !!kisiId,
    staleTime: queryConfig.list.staleTime,
    gcTime: queryConfig.list.gcTime,
  })
}

export function useArac(id: string) {
  return useQuery({
    queryKey: aracKeys.detail(id),
    queryFn: () => fetchArac(id),
    enabled: !!id,
    staleTime: queryConfig.detail.staleTime,
    gcTime: queryConfig.detail.gcTime,
  })
}

export function useCreateArac() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createArac,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: aracKeys.lists() })
      toast.success("Araç başarıyla oluşturuldu")
    },
    onError: (error) => {
      const message = getErrorMessage(error)
      toast.error(message)
    },
  })
}

export function useUpdateArac() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateArac,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: aracKeys.lists() })
      queryClient.invalidateQueries({ queryKey: aracKeys.detail(data.id) })
      toast.success("Araç başarıyla güncellendi")
    },
    onError: (error) => {
      const message = getErrorMessage(error)
      toast.error(message)
    },
  })
}

export function useDeleteArac() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteArac,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: aracKeys.lists() })
      toast.success("Araç başarıyla silindi")
    },
    onError: (error) => {
      const message = getErrorMessage(error)
      toast.error(message)
    },
  })
}

export function useAddKisiToArac() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: addKisiToArac,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: aracKeys.lists() })
      queryClient.invalidateQueries({ queryKey: aracKeys.detail(variables.aracId) })
      toast.success("Kişi araca başarıyla eklendi")
    },
    onError: (error) => {
      const message = getErrorMessage(error)
      toast.error(message)
    },
  })
}

export function useRemoveKisiFromArac() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: removeKisiFromArac,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: aracKeys.lists() })
      queryClient.invalidateQueries({ queryKey: aracKeys.detail(variables.aracId) })
      toast.success("Kişi araçtan başarıyla çıkarıldı")
    },
    onError: (error) => {
      const message = getErrorMessage(error)
      toast.error(message)
    },
  })
}
