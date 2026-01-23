import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import type {
  CreateFaaliyetAlaniInput,
  UpdateFaaliyetAlaniInput,
} from "@/lib/validations"

// ==================== TYPES ====================
interface UserInfo {
  ad: string
  soyad: string
}

export interface FaaliyetAlani {
  id: string
  ad: string
  parentId: string | null
  sira: number
  isActive: boolean
  createdAt: string
  updatedAt: string
  createdUserId: string | null
  updatedUserId: string | null
  createdUser: UserInfo | null
  updatedUser: UserInfo | null
  parent?: { id: string; ad: string } | null
  _count: {
    kisiler: number
    children: number
  }
  children?: FaaliyetAlani[]
}

// ==================== QUERY KEYS ====================
export const faaliyetAlaniKeys = {
  all: ["faaliyet-alanlari"] as const,
  tree: () => [...faaliyetAlaniKeys.all, "tree"] as const,
  flat: () => [...faaliyetAlaniKeys.all, "flat"] as const,
  details: () => [...faaliyetAlaniKeys.all, "detail"] as const,
  detail: (id: string) => [...faaliyetAlaniKeys.details(), id] as const,
}

// ==================== FETCH FUNCTIONS ====================
async function fetchFaaliyetAlaniTree(): Promise<FaaliyetAlani[]> {
  const response = await fetch("/api/faaliyet-alanlari")
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Faaliyet alanları yüklenirken hata oluştu")
  }
  return response.json()
}

async function fetchFaaliyetAlaniFlat(): Promise<FaaliyetAlani[]> {
  const response = await fetch("/api/faaliyet-alanlari?flat=true")
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Faaliyet alanları yüklenirken hata oluştu")
  }
  return response.json()
}

async function fetchFaaliyetAlani(id: string): Promise<FaaliyetAlani> {
  const response = await fetch(`/api/faaliyet-alanlari/${id}`)
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Faaliyet alanı yüklenirken hata oluştu")
  }
  return response.json()
}

async function createFaaliyetAlani(data: CreateFaaliyetAlaniInput): Promise<FaaliyetAlani> {
  const response = await fetch("/api/faaliyet-alanlari", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Faaliyet alanı oluşturulurken hata oluştu")
  }
  return response.json()
}

async function updateFaaliyetAlani({
  id,
  data,
}: {
  id: string
  data: UpdateFaaliyetAlaniInput
}): Promise<FaaliyetAlani> {
  const response = await fetch(`/api/faaliyet-alanlari/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Faaliyet alanı güncellenirken hata oluştu")
  }
  return response.json()
}

async function deleteFaaliyetAlani(id: string): Promise<void> {
  const response = await fetch(`/api/faaliyet-alanlari/${id}`, {
    method: "DELETE",
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Faaliyet alanı silinirken hata oluştu")
  }
}

// ==================== QUERY HOOKS ====================
export function useFaaliyetAlaniTree() {
  return useQuery({
    queryKey: faaliyetAlaniKeys.tree(),
    queryFn: fetchFaaliyetAlaniTree,
  })
}

export function useFaaliyetAlaniFlat() {
  return useQuery({
    queryKey: faaliyetAlaniKeys.flat(),
    queryFn: fetchFaaliyetAlaniFlat,
  })
}

export function useFaaliyetAlani(id: string) {
  return useQuery({
    queryKey: faaliyetAlaniKeys.detail(id),
    queryFn: () => fetchFaaliyetAlani(id),
    enabled: !!id,
  })
}

export function useCreateFaaliyetAlani() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createFaaliyetAlani,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: faaliyetAlaniKeys.all })
    },
  })
}

export function useUpdateFaaliyetAlani() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateFaaliyetAlani,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: faaliyetAlaniKeys.all })
      queryClient.invalidateQueries({ queryKey: faaliyetAlaniKeys.detail(data.id) })
    },
  })
}

export function useDeleteFaaliyetAlani() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteFaaliyetAlani,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: faaliyetAlaniKeys.all })
    },
  })
}
