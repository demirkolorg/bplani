import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import type { CreateMusteriInput, UpdateMusteriInput } from "@/lib/validations"

// Types for API responses
export interface Musteri {
  id: string
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
  musteriId: string | null
  leadId: string | null
}

export interface AdresWithLokasyon {
  id: string
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

// Query keys
export const musteriKeys = {
  all: ["musteriler"] as const,
  lists: () => [...musteriKeys.all, "list"] as const,
  details: () => [...musteriKeys.all, "detail"] as const,
  detail: (id: string) => [...musteriKeys.details(), id] as const,
}

// Fetch functions
async function fetchMusteriler(): Promise<Musteri[]> {
  const response = await fetch("/api/musteriler")
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Müşteriler yüklenirken hata oluştu")
  }
  return response.json()
}

async function fetchMusteri(id: string): Promise<Musteri> {
  const response = await fetch(`/api/musteriler/${id}`)
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Müşteri yüklenirken hata oluştu")
  }
  return response.json()
}

async function createMusteri(data: CreateMusteriInput): Promise<Musteri> {
  const response = await fetch("/api/musteriler", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Müşteri oluşturulurken hata oluştu")
  }
  return response.json()
}

async function updateMusteri({ id, data }: { id: string; data: UpdateMusteriInput }): Promise<Musteri> {
  const response = await fetch(`/api/musteriler/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Müşteri güncellenirken hata oluştu")
  }
  return response.json()
}

async function deleteMusteri(id: string): Promise<void> {
  const response = await fetch(`/api/musteriler/${id}`, {
    method: "DELETE",
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Müşteri silinirken hata oluştu")
  }
}

// Hooks
export function useMusteriler() {
  return useQuery({
    queryKey: musteriKeys.lists(),
    queryFn: fetchMusteriler,
  })
}

export function useMusteri(id: string) {
  return useQuery({
    queryKey: musteriKeys.detail(id),
    queryFn: () => fetchMusteri(id),
    enabled: !!id,
  })
}

export function useCreateMusteri() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createMusteri,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: musteriKeys.lists() })
    },
  })
}

export function useUpdateMusteri() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateMusteri,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: musteriKeys.lists() })
      queryClient.setQueryData(musteriKeys.detail(data.id), data)
    },
  })
}

export function useDeleteMusteri() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteMusteri,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: musteriKeys.lists() })
    },
  })
}
