import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import type { CreateKisiInput, UpdateKisiInput, ListKisiQuery } from "@/lib/validations"
import { toast } from "sonner"
import { getErrorMessage } from "@/lib/error-handler"
import { queryConfig } from "@/lib/query-config"

// Types for API responses
export interface FaaliyetAlaniRef {
  id: string
  faaliyetAlani: {
    id: string
    ad: string
  }
}

export interface Kisi {
  id: string
  tt: boolean // true = Müşteri, false = Aday
  tc: string | null
  ad: string
  soyad: string
  faaliyet: string | null
  pio: boolean
  asli: boolean
  fotograf: string | null
  isArchived: boolean
  createdAt: string
  updatedAt: string
  createdUserId: string | null
  updatedUserId: string | null
  gsmler?: Gsm[]
  adresler?: AdresWithLokasyon[]
  notlar?: Not[]
  faaliyetAlanlari?: FaaliyetAlaniRef[]
  createdUser?: { ad: string; soyad: string } | null
  updatedUser?: { ad: string; soyad: string } | null
  _count?: {
    gsmler: number
    adresler: number
    notlar: number
    tanitimlar: number
    operasyonlar: number
    araclar: number
  }
}

export interface Gsm {
  id: string
  numara: string
  isPrimary: boolean
  kisiId: string
  takipler?: Takip[]
}

export interface Takip {
  id: string
  durum: 'UZATILACAK' | 'DEVAM_EDECEK' | 'SONLANDIRILACAK' | 'UZATILDI'
  baslamaTarihi: string
  bitisTarihi: string
  isActive: boolean
}

export interface AdresWithLokasyon {
  id: string
  ad: string | null
  detay: string | null
  isPrimary: boolean
  mahalle: {
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
}

export interface Not {
  id: string
  icerik: string
  createdAt: string
  createdUser?: { ad: string; soyad: string } | null
}

export interface KisiListResponse {
  data: Kisi[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Query keys
export const kisiKeys = {
  all: ["kisiler"] as const,
  lists: () => [...kisiKeys.all, "list"] as const,
  list: (params: Partial<ListKisiQuery>) => [...kisiKeys.lists(), params] as const,
  details: () => [...kisiKeys.all, "detail"] as const,
  detail: (id: string) => [...kisiKeys.details(), id] as const,
}

// Fetch functions
async function fetchKisiler(params: Partial<ListKisiQuery> = {}): Promise<KisiListResponse> {
  const searchParams = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, String(value))
    }
  })

  const response = await fetch(`/api/kisiler?${searchParams.toString()}`)
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Kişiler yüklenirken hata oluştu")
  }
  return response.json()
}

async function fetchKisi(id: string): Promise<Kisi> {
  const response = await fetch(`/api/kisiler/${id}`)
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Kişi yüklenirken hata oluştu")
  }
  return response.json()
}

async function createKisi(data: CreateKisiInput): Promise<Kisi> {
  const response = await fetch("/api/kisiler", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Kişi oluşturulurken hata oluştu")
  }
  return response.json()
}

async function updateKisi({ id, data }: { id: string; data: UpdateKisiInput }): Promise<Kisi> {
  const response = await fetch(`/api/kisiler/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Kişi güncellenirken hata oluştu")
  }
  return response.json()
}

async function deleteKisi(id: string): Promise<void> {
  const response = await fetch(`/api/kisiler/${id}`, {
    method: "DELETE",
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Kişi silinirken hata oluştu")
  }
}

// Hooks
export function useKisiler(params: Partial<ListKisiQuery> = {}) {
  return useQuery({
    queryKey: kisiKeys.list(params),
    queryFn: () => fetchKisiler(params),
    staleTime: queryConfig.list.staleTime,
    gcTime: queryConfig.list.gcTime,
  })
}

export function useKisi(id: string) {
  return useQuery({
    queryKey: kisiKeys.detail(id),
    queryFn: () => fetchKisi(id),
    enabled: !!id,
    staleTime: queryConfig.detail.staleTime,
    gcTime: queryConfig.detail.gcTime,
  })
}

export function useCreateKisi() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createKisi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: kisiKeys.lists() })
      toast.success("Kişi başarıyla oluşturuldu")
    },
    onError: (error) => {
      const message = getErrorMessage(error)
      toast.error(message)
    },
  })
}

export function useUpdateKisi() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateKisi,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: kisiKeys.lists() })
      queryClient.setQueryData(kisiKeys.detail(data.id), data)
      toast.success("Kişi başarıyla güncellendi")
    },
    onError: (error) => {
      const message = getErrorMessage(error)
      toast.error(message)
    },
  })
}

export function useDeleteKisi() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteKisi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: kisiKeys.lists() })
      toast.success("Kişi başarıyla silindi")
    },
    onError: (error) => {
      const message = getErrorMessage(error)
      toast.error(message)
    },
  })
}
