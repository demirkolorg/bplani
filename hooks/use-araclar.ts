import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import type {
  CreateMarkaInput,
  UpdateMarkaInput,
  CreateModelInput,
  UpdateModelInput,
} from "@/lib/validations"

// ==================== TYPES ====================
interface UserInfo {
  ad: string
  soyad: string
}

export interface Marka {
  id: string
  ad: string
  createdAt: string
  updatedAt: string
  createdUserId: string | null
  updatedUserId: string | null
  createdUser: UserInfo | null
  updatedUser: UserInfo | null
  _count: {
    modeller: number
  }
}

export interface Model {
  id: string
  ad: string
  markaId: string
  createdAt: string
  updatedAt: string
  createdUserId: string | null
  updatedUserId: string | null
  createdUser: UserInfo | null
  updatedUser: UserInfo | null
  marka: {
    id: string
    ad: string
  }
}

// ==================== QUERY KEYS ====================
export const markaKeys = {
  all: ["marka-model", "markalar"] as const,
  lists: () => [...markaKeys.all, "list"] as const,
  details: () => [...markaKeys.all, "detail"] as const,
  detail: (id: string) => [...markaKeys.details(), id] as const,
}

export const modelKeys = {
  all: ["marka-model", "modeller"] as const,
  lists: () => [...modelKeys.all, "list"] as const,
  listByMarka: (markaId?: string) => [...modelKeys.lists(), { markaId }] as const,
  details: () => [...modelKeys.all, "detail"] as const,
  detail: (id: string) => [...modelKeys.details(), id] as const,
}

// ==================== FETCH FUNCTIONS ====================
// Marka fetch functions
async function fetchMarkalar(): Promise<Marka[]> {
  const response = await fetch("/api/araclar/markalar")
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Markalar yüklenirken hata oluştu")
  }
  return response.json()
}

async function fetchMarka(id: string): Promise<Marka> {
  const response = await fetch(`/api/araclar/markalar/${id}`)
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Marka yüklenirken hata oluştu")
  }
  return response.json()
}

async function createMarka(data: CreateMarkaInput): Promise<Marka> {
  const response = await fetch("/api/araclar/markalar", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Marka oluşturulurken hata oluştu")
  }
  return response.json()
}

async function updateMarka({ id, data }: { id: string; data: UpdateMarkaInput }): Promise<Marka> {
  const response = await fetch(`/api/araclar/markalar/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Marka güncellenirken hata oluştu")
  }
  return response.json()
}

async function deleteMarka(id: string): Promise<void> {
  const response = await fetch(`/api/araclar/markalar/${id}`, {
    method: "DELETE",
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Marka silinirken hata oluştu")
  }
}

// Model fetch functions
async function fetchModeller(markaId?: string): Promise<Model[]> {
  const params = markaId ? `?markaId=${markaId}` : ""
  const response = await fetch(`/api/araclar/modeller${params}`)
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Modeller yüklenirken hata oluştu")
  }
  return response.json()
}

async function fetchModel(id: string): Promise<Model> {
  const response = await fetch(`/api/araclar/modeller/${id}`)
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Model yüklenirken hata oluştu")
  }
  return response.json()
}

async function createModel(data: CreateModelInput): Promise<Model> {
  const response = await fetch("/api/araclar/modeller", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Model oluşturulurken hata oluştu")
  }
  return response.json()
}

async function updateModel({ id, data }: { id: string; data: UpdateModelInput }): Promise<Model> {
  const response = await fetch(`/api/araclar/modeller/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Model güncellenirken hata oluştu")
  }
  return response.json()
}

async function deleteModel(id: string): Promise<void> {
  const response = await fetch(`/api/araclar/modeller/${id}`, {
    method: "DELETE",
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Model silinirken hata oluştu")
  }
}

// ==================== QUERY HOOKS ====================
// Marka hooks
export function useMarkalar() {
  return useQuery({
    queryKey: markaKeys.lists(),
    queryFn: fetchMarkalar,
  })
}

export function useMarka(id: string) {
  return useQuery({
    queryKey: markaKeys.detail(id),
    queryFn: () => fetchMarka(id),
    enabled: !!id,
  })
}

export function useCreateMarka() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createMarka,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: markaKeys.lists() })
    },
  })
}

export function useUpdateMarka() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateMarka,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: markaKeys.lists() })
      queryClient.invalidateQueries({ queryKey: markaKeys.detail(data.id) })
    },
  })
}

export function useDeleteMarka() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteMarka,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: markaKeys.lists() })
    },
  })
}

// Model hooks
export function useModeller(markaId?: string) {
  return useQuery({
    queryKey: modelKeys.listByMarka(markaId),
    queryFn: () => fetchModeller(markaId),
  })
}

export function useModel(id: string) {
  return useQuery({
    queryKey: modelKeys.detail(id),
    queryFn: () => fetchModel(id),
    enabled: !!id,
  })
}

export function useCreateModel() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createModel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: modelKeys.lists() })
    },
  })
}

export function useUpdateModel() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateModel,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: modelKeys.lists() })
      queryClient.invalidateQueries({ queryKey: modelKeys.detail(data.id) })
    },
  })
}

export function useDeleteModel() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteModel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: modelKeys.lists() })
    },
  })
}
