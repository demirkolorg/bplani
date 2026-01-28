import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import type { CreateAdresInput, UpdateAdresInput, BulkCreateAdresInput } from "@/lib/validations"
import { kisiKeys } from "./use-kisiler"
import { toast } from "sonner"
import { getErrorMessage } from "@/lib/error-handler"
import { queryConfig } from "@/lib/query-config"

export interface Adres {
  id: string
  ad: string | null  // Adres adı (Ev, İş, vb.)
  detay: string | null
  isPrimary: boolean
  kisiId: string
  mahalleId: string
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
  createdAt: string
  updatedAt: string
}

// Query keys
export const adresKeys = {
  all: ["adresler"] as const,
  byKisi: (kisiId: string) => [...adresKeys.all, "kisi", kisiId] as const,
}

// Fetch functions
async function fetchAdreslerByKisi(kisiId: string): Promise<Adres[]> {
  const response = await fetch(`/api/adresler?kisiId=${kisiId}`)
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Adresler yüklenirken hata oluştu")
  }
  return response.json()
}

async function createAdres(data: CreateAdresInput): Promise<Adres> {
  const response = await fetch("/api/adresler", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Adres oluşturulurken hata oluştu")
  }
  return response.json()
}

async function bulkCreateAdres(data: BulkCreateAdresInput): Promise<{ count: number }> {
  const response = await fetch("/api/adresler", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Adresler oluşturulurken hata oluştu")
  }
  return response.json()
}

async function updateAdres({ id, data }: { id: string; data: UpdateAdresInput }): Promise<Adres> {
  const response = await fetch(`/api/adresler?id=${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Adres güncellenirken hata oluştu")
  }
  return response.json()
}

async function deleteAdres(id: string): Promise<void> {
  const response = await fetch(`/api/adresler?id=${id}`, {
    method: "DELETE",
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Adres silinirken hata oluştu")
  }
}

// Hooks
export function useAdreslerByKisi(kisiId: string) {
  return useQuery({
    queryKey: adresKeys.byKisi(kisiId),
    queryFn: () => fetchAdreslerByKisi(kisiId),
    enabled: !!kisiId,
    staleTime: queryConfig.list.staleTime,
    gcTime: queryConfig.list.gcTime,
  })
}

export function useCreateAdres() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createAdres,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: adresKeys.byKisi(data.kisiId) })
      queryClient.invalidateQueries({ queryKey: kisiKeys.detail(data.kisiId) })
      toast.success("Adres başarıyla eklendi")
    },
    onError: (error) => {
      const message = getErrorMessage(error)
      toast.error(message)
    },
  })
}

export function useBulkCreateAdres() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: bulkCreateAdres,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: adresKeys.byKisi(variables.kisiId) })
      queryClient.invalidateQueries({ queryKey: kisiKeys.detail(variables.kisiId) })
      toast.success("Adresler başarıyla eklendi")
    },
    onError: (error) => {
      const message = getErrorMessage(error)
      toast.error(message)
    },
  })
}

export function useUpdateAdres() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateAdres,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: adresKeys.byKisi(data.kisiId) })
      queryClient.invalidateQueries({ queryKey: kisiKeys.detail(data.kisiId) })
      toast.success("Adres başarıyla güncellendi")
    },
    onError: (error) => {
      const message = getErrorMessage(error)
      toast.error(message)
    },
  })
}

export function useDeleteAdres() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteAdres,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adresKeys.all })
      toast.success("Adres başarıyla silindi")
    },
    onError: (error) => {
      const message = getErrorMessage(error)
      toast.error(message)
    },
  })
}
