import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import type { CreateKisiInput, UpdateKisiInput, ListKisiQuery, KisiTip } from "@/lib/validations"

// Types for API responses
export interface Kisi {
  id: string
  tip: KisiTip
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
  createdUser?: { ad: string; soyad: string } | null
  updatedUser?: { ad: string; soyad: string } | null
  _count?: { gsmler: number; adresler: number }
}

export interface Gsm {
  id: string
  numara: string
  isPrimary: boolean
  kisiId: string
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
  })
}

export function useKisi(id: string) {
  return useQuery({
    queryKey: kisiKeys.detail(id),
    queryFn: () => fetchKisi(id),
    enabled: !!id,
  })
}

export function useCreateKisi() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createKisi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: kisiKeys.lists() })
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
    },
  })
}

export function useDeleteKisi() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteKisi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: kisiKeys.lists() })
    },
  })
}
