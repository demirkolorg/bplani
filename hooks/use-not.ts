import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import type { CreateNotInput, UpdateNotInput } from "@/lib/validations"
import { kisiKeys } from "./use-kisiler"
import { toast } from "sonner"
import { getErrorMessage } from "@/lib/error-handler"
import { queryConfig } from "@/lib/query-config"

export interface Not {
  id: string
  kisiId: string
  icerik: string
  createdAt: string
  createdUserId: string | null
  createdUser: {
    id: string
    ad: string
    soyad: string
  } | null
}

// Query keys
export const notKeys = {
  all: ["notlar"] as const,
  byKisi: (kisiId: string) => [...notKeys.all, "kisi", kisiId] as const,
}

// Fetch functions
async function fetchNotlarByKisi(kisiId: string): Promise<Not[]> {
  const response = await fetch(`/api/notlar?kisiId=${kisiId}`)
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Notlar yüklenirken hata oluştu")
  }
  return response.json()
}

async function createNot(data: CreateNotInput): Promise<Not> {
  const response = await fetch("/api/notlar", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Not oluşturulurken hata oluştu")
  }
  return response.json()
}

async function updateNot({ id, data }: { id: string; data: UpdateNotInput }): Promise<Not> {
  const response = await fetch(`/api/notlar?id=${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Not güncellenirken hata oluştu")
  }
  return response.json()
}

async function deleteNot(id: string): Promise<void> {
  const response = await fetch(`/api/notlar?id=${id}`, {
    method: "DELETE",
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Not silinirken hata oluştu")
  }
}

// Hooks
export function useNotlarByKisi(kisiId: string) {
  return useQuery({
    queryKey: notKeys.byKisi(kisiId),
    queryFn: () => fetchNotlarByKisi(kisiId),
    enabled: !!kisiId,
    staleTime: queryConfig.list.staleTime,
    gcTime: queryConfig.list.gcTime,
  })
}

export function useCreateNot() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createNot,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: notKeys.byKisi(data.kisiId) })
      queryClient.invalidateQueries({ queryKey: kisiKeys.detail(data.kisiId) })
      toast.success("Not başarıyla eklendi")
    },
    onError: (error) => {
      const message = getErrorMessage(error)
      toast.error(message)
    },
  })
}

export function useUpdateNot() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateNot,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: notKeys.byKisi(data.kisiId) })
      queryClient.invalidateQueries({ queryKey: kisiKeys.detail(data.kisiId) })
      toast.success("Not başarıyla güncellendi")
    },
    onError: (error) => {
      const message = getErrorMessage(error)
      toast.error(message)
    },
  })
}

export function useDeleteNot() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteNot,
    onSuccess: () => {
      // Invalidate all not queries since we don't know which kisi it belonged to
      queryClient.invalidateQueries({ queryKey: notKeys.all })
      toast.success("Not başarıyla silindi")
    },
    onError: (error) => {
      const message = getErrorMessage(error)
      toast.error(message)
    },
  })
}
