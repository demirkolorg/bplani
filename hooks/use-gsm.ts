import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import type { CreateGsmInput, UpdateGsmInput, BulkCreateGsmInput } from "@/lib/validations"
import { musteriKeys } from "./use-musteriler"

export interface Gsm {
  id: string
  numara: string
  isPrimary: boolean
  musteriId: string | null
  leadId: string | null
  createdAt: string
  updatedAt: string
}

export interface GsmWithMusteri extends Gsm {
  musteri: {
    id: string
    ad: string
    soyad: string
  } | null
}

export interface GsmTakip {
  id: string
  baslamaTarihi: string
  bitisTarihi: string
  durum: "UZATILACAK" | "DEVAM_EDECEK" | "SONLANDIRILACAK" | "UZATILDI"
  isActive: boolean
  createdAt: string
  updatedAt: string
  createdUser: {
    id: string
    ad: string
    soyad: string
  } | null
  updatedUser: {
    id: string
    ad: string
    soyad: string
  } | null
}

export interface GsmWithTakipler extends Gsm {
  takipler: GsmTakip[]
  createdUser: {
    id: string
    ad: string
    soyad: string
  } | null
}

// Query keys
export const gsmKeys = {
  all: ["gsmler"] as const,
  allWithMusteri: () => [...gsmKeys.all, "withMusteri"] as const,
  byMusteri: (musteriId: string) => [...gsmKeys.all, "musteri", musteriId] as const,
  byLead: (leadId: string) => [...gsmKeys.all, "lead", leadId] as const,
}

// Fetch functions
async function fetchAllGsmler(): Promise<GsmWithMusteri[]> {
  const response = await fetch("/api/gsmler?all=true")
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "GSM'ler yüklenirken hata oluştu")
  }
  return response.json()
}

async function fetchGsmlerByMusteri(musteriId: string): Promise<GsmWithTakipler[]> {
  const response = await fetch(`/api/gsmler?musteriId=${musteriId}`)
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "GSM'ler yüklenirken hata oluştu")
  }
  return response.json()
}

async function fetchGsmlerByLead(leadId: string): Promise<Gsm[]> {
  const response = await fetch(`/api/gsmler?leadId=${leadId}`)
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "GSM'ler yüklenirken hata oluştu")
  }
  return response.json()
}

async function createGsm(data: CreateGsmInput): Promise<Gsm> {
  const response = await fetch("/api/gsmler", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "GSM oluşturulurken hata oluştu")
  }
  return response.json()
}

async function bulkCreateGsm(data: BulkCreateGsmInput): Promise<{ count: number }> {
  const response = await fetch("/api/gsmler", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "GSM'ler oluşturulurken hata oluştu")
  }
  return response.json()
}

async function updateGsm({ id, data }: { id: string; data: UpdateGsmInput }): Promise<Gsm> {
  const response = await fetch(`/api/gsmler?id=${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "GSM güncellenirken hata oluştu")
  }
  return response.json()
}

async function deleteGsm(id: string): Promise<void> {
  const response = await fetch(`/api/gsmler?id=${id}`, {
    method: "DELETE",
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "GSM silinirken hata oluştu")
  }
}

// Hooks
export function useAllGsmler() {
  return useQuery({
    queryKey: gsmKeys.allWithMusteri(),
    queryFn: fetchAllGsmler,
  })
}

export function useGsmlerByMusteri(musteriId: string) {
  return useQuery({
    queryKey: gsmKeys.byMusteri(musteriId),
    queryFn: () => fetchGsmlerByMusteri(musteriId),
    enabled: !!musteriId,
  })
}

export function useGsmlerByLead(leadId: string) {
  return useQuery({
    queryKey: gsmKeys.byLead(leadId),
    queryFn: () => fetchGsmlerByLead(leadId),
    enabled: !!leadId,
  })
}

export function useCreateGsm() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createGsm,
    onSuccess: (data) => {
      if (data.musteriId) {
        queryClient.invalidateQueries({ queryKey: gsmKeys.byMusteri(data.musteriId) })
        queryClient.invalidateQueries({ queryKey: musteriKeys.detail(data.musteriId) })
      }
      if (data.leadId) {
        queryClient.invalidateQueries({ queryKey: gsmKeys.byLead(data.leadId) })
      }
    },
  })
}

export function useBulkCreateGsm() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: bulkCreateGsm,
    onSuccess: (_, variables) => {
      if (variables.musteriId) {
        queryClient.invalidateQueries({ queryKey: gsmKeys.byMusteri(variables.musteriId) })
        queryClient.invalidateQueries({ queryKey: musteriKeys.detail(variables.musteriId) })
      }
      if (variables.leadId) {
        queryClient.invalidateQueries({ queryKey: gsmKeys.byLead(variables.leadId) })
      }
    },
  })
}

export function useUpdateGsm() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateGsm,
    onSuccess: (data) => {
      if (data.musteriId) {
        queryClient.invalidateQueries({ queryKey: gsmKeys.byMusteri(data.musteriId) })
        queryClient.invalidateQueries({ queryKey: musteriKeys.detail(data.musteriId) })
      }
      if (data.leadId) {
        queryClient.invalidateQueries({ queryKey: gsmKeys.byLead(data.leadId) })
      }
    },
  })
}

export function useDeleteGsm() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteGsm,
    onSuccess: () => {
      // Invalidate all gsm queries since we don't know which customer/lead it belonged to
      queryClient.invalidateQueries({ queryKey: gsmKeys.all })
    },
  })
}
