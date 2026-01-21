import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import type { CreateNotInput, UpdateNotInput } from "@/lib/validations"
import { musteriKeys } from "./use-musteriler"

export interface Not {
  id: string
  musteriId: string
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
  byMusteri: (musteriId: string) => [...notKeys.all, "musteri", musteriId] as const,
}

// Fetch functions
async function fetchNotlarByMusteri(musteriId: string): Promise<Not[]> {
  const response = await fetch(`/api/notlar?musteriId=${musteriId}`)
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
export function useNotlarByMusteri(musteriId: string) {
  return useQuery({
    queryKey: notKeys.byMusteri(musteriId),
    queryFn: () => fetchNotlarByMusteri(musteriId),
    enabled: !!musteriId,
  })
}

export function useCreateNot() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createNot,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: notKeys.byMusteri(data.musteriId) })
      queryClient.invalidateQueries({ queryKey: musteriKeys.detail(data.musteriId) })
    },
  })
}

export function useUpdateNot() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateNot,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: notKeys.byMusteri(data.musteriId) })
      queryClient.invalidateQueries({ queryKey: musteriKeys.detail(data.musteriId) })
    },
  })
}

export function useDeleteNot() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteNot,
    onSuccess: () => {
      // Invalidate all not queries since we don't know which customer it belonged to
      queryClient.invalidateQueries({ queryKey: notKeys.all })
    },
  })
}
