import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import type {
  CreateIlInput,
  UpdateIlInput,
  CreateIlceInput,
  UpdateIlceInput,
  CreateMahalleInput,
  UpdateMahalleInput,
} from "@/lib/validations"
import { toast } from "sonner"
import { getErrorMessage } from "@/lib/error-handler"
import { queryConfig } from "@/lib/query-config"

// ==================== TYPES ====================
interface UserInfo {
  ad: string
  soyad: string
}

export interface Il {
  id: string
  ad: string
  plaka: number | null
  isActive: boolean
  createdAt: string
  updatedAt: string
  createdUserId: string | null
  updatedUserId: string | null
  createdUser: UserInfo | null
  updatedUser: UserInfo | null
  _count: {
    ilceler: number
  }
}

export interface Ilce {
  id: string
  ad: string
  ilId: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  createdUserId: string | null
  updatedUserId: string | null
  createdUser: UserInfo | null
  updatedUser: UserInfo | null
  il: {
    id: string
    ad: string
    plaka: number | null
  }
  _count: {
    mahalleler: number
  }
}

export interface Mahalle {
  id: string
  ad: string
  ilceId: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  createdUserId: string | null
  updatedUserId: string | null
  createdUser: UserInfo | null
  updatedUser: UserInfo | null
  ilce: {
    id: string
    ad: string
    il: {
      id: string
      ad: string
      plaka: number | null
    }
  }
  _count: {
    adresler: number
  }
}

// ==================== QUERY KEYS ====================
export const ilKeys = {
  all: ["lokasyon", "iller"] as const,
  lists: () => [...ilKeys.all, "list"] as const,
  details: () => [...ilKeys.all, "detail"] as const,
  detail: (id: string) => [...ilKeys.details(), id] as const,
}

export const ilceKeys = {
  all: ["lokasyon", "ilceler"] as const,
  lists: () => [...ilceKeys.all, "list"] as const,
  listByIl: (ilId?: string) => [...ilceKeys.lists(), { ilId }] as const,
  details: () => [...ilceKeys.all, "detail"] as const,
  detail: (id: string) => [...ilceKeys.details(), id] as const,
}

export const mahalleKeys = {
  all: ["lokasyon", "mahalleler"] as const,
  lists: () => [...mahalleKeys.all, "list"] as const,
  listByIlce: (ilceId?: string) => [...mahalleKeys.lists(), { ilceId }] as const,
  listByIl: (ilId?: string) => [...mahalleKeys.lists(), { ilId }] as const,
  details: () => [...mahalleKeys.all, "detail"] as const,
  detail: (id: string) => [...mahalleKeys.details(), id] as const,
}

// ==================== FETCH FUNCTIONS ====================
// İl fetch functions
async function fetchIller(): Promise<Il[]> {
  const response = await fetch("/api/lokasyon/iller")
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "İller yüklenirken hata oluştu")
  }
  return response.json()
}

async function fetchIl(id: string): Promise<Il> {
  const response = await fetch(`/api/lokasyon/iller/${id}`)
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "İl yüklenirken hata oluştu")
  }
  return response.json()
}

async function createIl(data: CreateIlInput): Promise<Il> {
  const response = await fetch("/api/lokasyon/iller", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "İl oluşturulurken hata oluştu")
  }
  return response.json()
}

async function updateIl({ id, data }: { id: string; data: UpdateIlInput }): Promise<Il> {
  const response = await fetch(`/api/lokasyon/iller/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "İl güncellenirken hata oluştu")
  }
  return response.json()
}

async function deleteIl(id: string): Promise<void> {
  const response = await fetch(`/api/lokasyon/iller/${id}`, {
    method: "DELETE",
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "İl silinirken hata oluştu")
  }
}

// İlçe fetch functions
async function fetchIlceler(ilId?: string): Promise<Ilce[]> {
  const params = ilId ? `?ilId=${ilId}` : ""
  const response = await fetch(`/api/lokasyon/ilceler${params}`)
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "İlçeler yüklenirken hata oluştu")
  }
  return response.json()
}

async function fetchIlce(id: string): Promise<Ilce> {
  const response = await fetch(`/api/lokasyon/ilceler/${id}`)
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "İlçe yüklenirken hata oluştu")
  }
  return response.json()
}

async function createIlce(data: CreateIlceInput): Promise<Ilce> {
  const response = await fetch("/api/lokasyon/ilceler", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "İlçe oluşturulurken hata oluştu")
  }
  return response.json()
}

async function updateIlce({ id, data }: { id: string; data: UpdateIlceInput }): Promise<Ilce> {
  const response = await fetch(`/api/lokasyon/ilceler/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "İlçe güncellenirken hata oluştu")
  }
  return response.json()
}

async function deleteIlce(id: string): Promise<void> {
  const response = await fetch(`/api/lokasyon/ilceler/${id}`, {
    method: "DELETE",
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "İlçe silinirken hata oluştu")
  }
}

// Mahalle fetch functions
async function fetchMahalleler(params?: { ilceId?: string; ilId?: string }): Promise<Mahalle[]> {
  const searchParams = new URLSearchParams()
  if (params?.ilceId) searchParams.set("ilceId", params.ilceId)
  if (params?.ilId) searchParams.set("ilId", params.ilId)
  const queryString = searchParams.toString()
  const response = await fetch(`/api/lokasyon/mahalleler${queryString ? `?${queryString}` : ""}`)
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Mahalleler yüklenirken hata oluştu")
  }
  return response.json()
}

async function fetchMahalle(id: string): Promise<Mahalle> {
  const response = await fetch(`/api/lokasyon/mahalleler/${id}`)
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Mahalle yüklenirken hata oluştu")
  }
  return response.json()
}

async function createMahalle(data: CreateMahalleInput): Promise<Mahalle> {
  const response = await fetch("/api/lokasyon/mahalleler", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Mahalle oluşturulurken hata oluştu")
  }
  return response.json()
}

async function updateMahalle({ id, data }: { id: string; data: UpdateMahalleInput }): Promise<Mahalle> {
  const response = await fetch(`/api/lokasyon/mahalleler/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Mahalle güncellenirken hata oluştu")
  }
  return response.json()
}

async function deleteMahalle(id: string): Promise<void> {
  const response = await fetch(`/api/lokasyon/mahalleler/${id}`, {
    method: "DELETE",
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Mahalle silinirken hata oluştu")
  }
}

// ==================== QUERY HOOKS ====================
// İl hooks
export function useIller() {
  return useQuery({
    queryKey: ilKeys.lists(),
    queryFn: fetchIller,
    staleTime: queryConfig.static.staleTime,
    gcTime: queryConfig.static.gcTime,
  })
}

export function useIl(id: string) {
  return useQuery({
    queryKey: ilKeys.detail(id),
    queryFn: () => fetchIl(id),
    enabled: !!id,
    staleTime: queryConfig.static.staleTime,
    gcTime: queryConfig.static.gcTime,
  })
}

export function useCreateIl() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createIl,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ilKeys.lists() })
      toast.success("İl başarıyla oluşturuldu")
    },
    onError: (error) => {
      const message = getErrorMessage(error)
      toast.error(message)
    },
  })
}

export function useUpdateIl() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateIl,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ilKeys.lists() })
      queryClient.invalidateQueries({ queryKey: ilKeys.detail(data.id) })
      toast.success("İl başarıyla güncellendi")
    },
    onError: (error) => {
      const message = getErrorMessage(error)
      toast.error(message)
    },
  })
}

export function useDeleteIl() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteIl,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ilKeys.lists() })
      toast.success("İl başarıyla silindi")
    },
    onError: (error) => {
      const message = getErrorMessage(error)
      toast.error(message)
    },
  })
}

// İlçe hooks
export function useIlceler(ilId?: string) {
  return useQuery({
    queryKey: ilceKeys.listByIl(ilId),
    queryFn: () => fetchIlceler(ilId),
    staleTime: queryConfig.static.staleTime,
    gcTime: queryConfig.static.gcTime,
  })
}

export function useIlce(id: string) {
  return useQuery({
    queryKey: ilceKeys.detail(id),
    queryFn: () => fetchIlce(id),
    enabled: !!id,
    staleTime: queryConfig.static.staleTime,
    gcTime: queryConfig.static.gcTime,
  })
}

export function useCreateIlce() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createIlce,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ilceKeys.lists() })
      toast.success("İlçe başarıyla oluşturuldu")
    },
    onError: (error) => {
      const message = getErrorMessage(error)
      toast.error(message)
    },
  })
}

export function useUpdateIlce() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateIlce,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ilceKeys.lists() })
      queryClient.invalidateQueries({ queryKey: ilceKeys.detail(data.id) })
      toast.success("İlçe başarıyla güncellendi")
    },
    onError: (error) => {
      const message = getErrorMessage(error)
      toast.error(message)
    },
  })
}

export function useDeleteIlce() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteIlce,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ilceKeys.lists() })
      toast.success("İlçe başarıyla silindi")
    },
    onError: (error) => {
      const message = getErrorMessage(error)
      toast.error(message)
    },
  })
}

// Mahalle hooks
export function useMahalleler(params?: { ilceId?: string; ilId?: string }) {
  return useQuery({
    queryKey: params?.ilceId
      ? mahalleKeys.listByIlce(params.ilceId)
      : params?.ilId
      ? mahalleKeys.listByIl(params.ilId)
      : mahalleKeys.lists(),
    queryFn: () => fetchMahalleler(params),
    staleTime: queryConfig.static.staleTime,
    gcTime: queryConfig.static.gcTime,
  })
}

export function useMahalle(id: string) {
  return useQuery({
    queryKey: mahalleKeys.detail(id),
    queryFn: () => fetchMahalle(id),
    enabled: !!id,
    staleTime: queryConfig.static.staleTime,
    gcTime: queryConfig.static.gcTime,
  })
}

export function useCreateMahalle() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createMahalle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mahalleKeys.lists() })
      toast.success("Mahalle başarıyla oluşturuldu")
    },
    onError: (error) => {
      const message = getErrorMessage(error)
      toast.error(message)
    },
  })
}

export function useUpdateMahalle() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateMahalle,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: mahalleKeys.lists() })
      queryClient.invalidateQueries({ queryKey: mahalleKeys.detail(data.id) })
      toast.success("Mahalle başarıyla güncellendi")
    },
    onError: (error) => {
      const message = getErrorMessage(error)
      toast.error(message)
    },
  })
}

export function useDeleteMahalle() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteMahalle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mahalleKeys.lists() })
      toast.success("Mahalle başarıyla silindi")
    },
    onError: (error) => {
      const message = getErrorMessage(error)
      toast.error(message)
    },
  })
}
