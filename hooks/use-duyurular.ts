import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import type { CreateDuyuruInput, UpdateDuyuruInput, ListDuyuruQuery, DuyuruOncelik } from "@/lib/validations"

// Types for API responses
export interface Duyuru {
  id: string
  baslik: string
  icerik: string
  oncelik: DuyuruOncelik
  publishedAt: string
  expiresAt: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
  createdUserId: string | null
  updatedUserId: string | null
  createdUser?: { ad: string; soyad: string } | null
  updatedUser?: { ad: string; soyad: string } | null
}

export interface DuyuruListResponse {
  data: Duyuru[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Query keys
export const duyuruKeys = {
  all: ["duyurular"] as const,
  lists: () => [...duyuruKeys.all, "list"] as const,
  list: (params: Partial<ListDuyuruQuery>) => [...duyuruKeys.lists(), params] as const,
  active: () => [...duyuruKeys.all, "active"] as const,
  details: () => [...duyuruKeys.all, "detail"] as const,
  detail: (id: string) => [...duyuruKeys.details(), id] as const,
}

// Fetch functions
async function fetchDuyurular(params: Partial<ListDuyuruQuery> = {}): Promise<DuyuruListResponse> {
  const searchParams = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, String(value))
    }
  })

  const response = await fetch(`/api/duyurular?${searchParams.toString()}`)
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Duyurular yüklenirken hata oluştu")
  }
  return response.json()
}

async function fetchDuyuru(id: string): Promise<Duyuru> {
  const response = await fetch(`/api/duyurular/${id}`)
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Duyuru yüklenirken hata oluştu")
  }
  return response.json()
}

async function createDuyuru(data: CreateDuyuruInput): Promise<Duyuru> {
  const response = await fetch("/api/duyurular", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Duyuru oluşturulurken hata oluştu")
  }
  return response.json()
}

async function updateDuyuru({ id, data }: { id: string; data: UpdateDuyuruInput }): Promise<Duyuru> {
  const response = await fetch(`/api/duyurular/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Duyuru güncellenirken hata oluştu")
  }
  return response.json()
}

async function deleteDuyuru(id: string): Promise<void> {
  const response = await fetch(`/api/duyurular/${id}`, {
    method: "DELETE",
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Duyuru silinirken hata oluştu")
  }
}

// Hooks
export function useDuyurular(params: Partial<ListDuyuruQuery> = {}) {
  return useQuery({
    queryKey: duyuruKeys.list(params),
    queryFn: () => fetchDuyurular(params),
  })
}

// Special hook for homepage - shows max 3 active announcements with 5 minute cache
export function useActiveDuyurular() {
  return useQuery({
    queryKey: duyuruKeys.active(),
    queryFn: () => fetchDuyurular({
      limit: 3,
      onlyActive: true,
      sortBy: "oncelik",
      sortOrder: "desc"
    }),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (previously cacheTime)
  })
}

export function useDuyuru(id: string) {
  return useQuery({
    queryKey: duyuruKeys.detail(id),
    queryFn: () => fetchDuyuru(id),
    enabled: !!id,
  })
}

export function useCreateDuyuru() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createDuyuru,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: duyuruKeys.lists() })
      queryClient.invalidateQueries({ queryKey: duyuruKeys.active() })
    },
  })
}

export function useUpdateDuyuru() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateDuyuru,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: duyuruKeys.lists() })
      queryClient.invalidateQueries({ queryKey: duyuruKeys.active() })
      queryClient.setQueryData(duyuruKeys.detail(data.id), data)
    },
  })
}

export function useDeleteDuyuru() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteDuyuru,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: duyuruKeys.lists() })
      queryClient.invalidateQueries({ queryKey: duyuruKeys.active() })
    },
  })
}
