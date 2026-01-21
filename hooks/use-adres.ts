import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import type { CreateAdresInput, UpdateAdresInput, BulkCreateAdresInput } from "@/lib/validations"
import { musteriKeys } from "./use-musteriler"

export interface Adres {
  id: string
  ad: string | null  // Adres adı (Ev, İş, vb.)
  detay: string | null
  isPrimary: boolean
  musteriId: string | null
  leadId: string | null
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
  byMusteri: (musteriId: string) => [...adresKeys.all, "musteri", musteriId] as const,
  byLead: (leadId: string) => [...adresKeys.all, "lead", leadId] as const,
}

// Fetch functions
async function fetchAdreslerByMusteri(musteriId: string): Promise<Adres[]> {
  const response = await fetch(`/api/adresler?musteriId=${musteriId}`)
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Adresler yüklenirken hata oluştu")
  }
  return response.json()
}

async function fetchAdreslerByLead(leadId: string): Promise<Adres[]> {
  const response = await fetch(`/api/adresler?leadId=${leadId}`)
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
export function useAdreslerByMusteri(musteriId: string) {
  return useQuery({
    queryKey: adresKeys.byMusteri(musteriId),
    queryFn: () => fetchAdreslerByMusteri(musteriId),
    enabled: !!musteriId,
  })
}

export function useAdreslerByLead(leadId: string) {
  return useQuery({
    queryKey: adresKeys.byLead(leadId),
    queryFn: () => fetchAdreslerByLead(leadId),
    enabled: !!leadId,
  })
}

export function useCreateAdres() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createAdres,
    onSuccess: (data) => {
      if (data.musteriId) {
        queryClient.invalidateQueries({ queryKey: adresKeys.byMusteri(data.musteriId) })
        queryClient.invalidateQueries({ queryKey: musteriKeys.detail(data.musteriId) })
      }
      if (data.leadId) {
        queryClient.invalidateQueries({ queryKey: adresKeys.byLead(data.leadId) })
      }
    },
  })
}

export function useBulkCreateAdres() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: bulkCreateAdres,
    onSuccess: (_, variables) => {
      if (variables.musteriId) {
        queryClient.invalidateQueries({ queryKey: adresKeys.byMusteri(variables.musteriId) })
        queryClient.invalidateQueries({ queryKey: musteriKeys.detail(variables.musteriId) })
      }
      if (variables.leadId) {
        queryClient.invalidateQueries({ queryKey: adresKeys.byLead(variables.leadId) })
      }
    },
  })
}

export function useUpdateAdres() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateAdres,
    onSuccess: (data) => {
      if (data.musteriId) {
        queryClient.invalidateQueries({ queryKey: adresKeys.byMusteri(data.musteriId) })
        queryClient.invalidateQueries({ queryKey: musteriKeys.detail(data.musteriId) })
      }
      if (data.leadId) {
        queryClient.invalidateQueries({ queryKey: adresKeys.byLead(data.leadId) })
      }
    },
  })
}

export function useDeleteAdres() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteAdres,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adresKeys.all })
    },
  })
}
