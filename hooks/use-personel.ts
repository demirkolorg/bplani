import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import type {
  CreatePersonelInput,
  UpdatePersonelInput,
  ChangePasswordInput,
  ChangeRolInput,
  ListPersonelQuery,
  PersonelRol,
} from "@/lib/validations"
import { toast } from "sonner"
import { getErrorMessage } from "@/lib/error-handler"
import { queryConfig } from "@/lib/query-config"

// Types for API responses
export interface Personel {
  id: string
  visibleId: string
  ad: string
  soyad: string
  rol: PersonelRol
  fotograf: string | null
  isActive: boolean
  lastLoginAt: string | null
  createdAt: string
  updatedAt: string
  _count?: {
    createdKisiler: number
    updatedKisiler?: number
    createdTakipler: number
    updatedTakipler?: number
    createdNotlar: number
    createdTanitimlar: number
    updatedTanitimlar?: number
    createdAlarmlar?: number
  }
}

export interface PersonelListResponse {
  data: Personel[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Query keys
export const personelKeys = {
  all: ["personeller"] as const,
  lists: () => [...personelKeys.all, "list"] as const,
  list: (params: Partial<ListPersonelQuery>) => [...personelKeys.lists(), params] as const,
  details: () => [...personelKeys.all, "detail"] as const,
  detail: (id: string) => [...personelKeys.details(), id] as const,
}

// Fetch functions
async function fetchPersoneller(params: Partial<ListPersonelQuery> = {}): Promise<PersonelListResponse> {
  const searchParams = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, String(value))
    }
  })

  const response = await fetch(`/api/personel?${searchParams.toString()}`)
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Personeller yüklenirken hata oluştu")
  }
  return response.json()
}

async function fetchPersonel(id: string): Promise<Personel> {
  const response = await fetch(`/api/personel/${id}`)
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Personel yüklenirken hata oluştu")
  }
  return response.json()
}

async function createPersonel(data: CreatePersonelInput): Promise<Personel> {
  const response = await fetch("/api/personel", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Personel oluşturulurken hata oluştu")
  }
  return response.json()
}

async function updatePersonel({ id, data }: { id: string; data: UpdatePersonelInput }): Promise<Personel> {
  const response = await fetch(`/api/personel/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Personel güncellenirken hata oluştu")
  }
  return response.json()
}

async function deletePersonel(id: string): Promise<void> {
  const response = await fetch(`/api/personel/${id}`, {
    method: "DELETE",
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Personel silinirken hata oluştu")
  }
}

async function changePassword({ id, data }: { id: string; data: ChangePasswordInput }): Promise<void> {
  const response = await fetch(`/api/personel/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "change-password", ...data }),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Şifre değiştirilirken hata oluştu")
  }
}

async function changeRol({ id, data }: { id: string; data: ChangeRolInput }): Promise<Personel> {
  const response = await fetch(`/api/personel/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "change-role", ...data }),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Rol değiştirilirken hata oluştu")
  }
  return response.json()
}

async function toggleActive(id: string): Promise<Personel> {
  const response = await fetch(`/api/personel/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "toggle-active" }),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Durum değiştirilirken hata oluştu")
  }
  return response.json()
}

// Hooks
export function usePersoneller(params: Partial<ListPersonelQuery> = {}) {
  return useQuery({
    queryKey: personelKeys.list(params),
    queryFn: () => fetchPersoneller(params),
    staleTime: queryConfig.list.staleTime,
    gcTime: queryConfig.list.gcTime,
  })
}

export function usePersonel(id: string) {
  return useQuery({
    queryKey: personelKeys.detail(id),
    queryFn: () => fetchPersonel(id),
    enabled: !!id,
    staleTime: queryConfig.detail.staleTime,
    gcTime: queryConfig.detail.gcTime,
  })
}

export function useCreatePersonel() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createPersonel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: personelKeys.lists() })
      toast.success("Personel başarıyla oluşturuldu")
    },
    onError: (error) => {
      const message = getErrorMessage(error)
      toast.error(message)
    },
  })
}

export function useUpdatePersonel() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updatePersonel,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: personelKeys.lists() })
      queryClient.setQueryData(personelKeys.detail(data.id), data)
      toast.success("Personel başarıyla güncellendi")
    },
    onError: (error) => {
      const message = getErrorMessage(error)
      toast.error(message)
    },
  })
}

export function useDeletePersonel() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deletePersonel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: personelKeys.lists() })
      toast.success("Personel başarıyla silindi")
    },
    onError: (error) => {
      const message = getErrorMessage(error)
      toast.error(message)
    },
  })
}

export function useChangePassword() {
  return useMutation({
    mutationFn: changePassword,
    onSuccess: () => {
      toast.success("Şifre başarıyla değiştirildi")
    },
    onError: (error) => {
      const message = getErrorMessage(error)
      toast.error(message)
    },
  })
}

export function useChangeRol() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: changeRol,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: personelKeys.lists() })
      queryClient.setQueryData(personelKeys.detail(data.id), data)
      toast.success("Rol başarıyla değiştirildi")
    },
    onError: (error) => {
      const message = getErrorMessage(error)
      toast.error(message)
    },
  })
}

export function useToggleActive() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: toggleActive,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: personelKeys.lists() })
      queryClient.setQueryData(personelKeys.detail(data.id), data)
      toast.success("Durum başarıyla değiştirildi")
    },
    onError: (error) => {
      const message = getErrorMessage(error)
      toast.error(message)
    },
  })
}
