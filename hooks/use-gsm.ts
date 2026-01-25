import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import type { CreateGsmInput, UpdateGsmInput, BulkCreateGsmInput } from "@/lib/validations"
import { kisiKeys } from "./use-kisiler"

export interface Gsm {
  id: string
  numara: string
  isPrimary: boolean
  kisiId: string
  createdAt: string
  updatedAt: string
}

export interface GsmWithKisi extends Gsm {
  kisi: {
    id: string
    ad: string
    soyad: string
    tt: boolean
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
  allWithKisi: () => [...gsmKeys.all, "withKisi"] as const,
  byKisi: (kisiId: string) => [...gsmKeys.all, "kisi", kisiId] as const,
}

// Fetch functions
async function fetchAllGsmler(): Promise<GsmWithKisi[]> {
  const response = await fetch("/api/gsmler?all=true")
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "GSM'ler yüklenirken hata oluştu")
  }
  return response.json()
}

async function fetchGsmlerByKisi(kisiId: string): Promise<GsmWithTakipler[]> {
  const response = await fetch(`/api/gsmler?kisiId=${kisiId}`)
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
    queryKey: gsmKeys.allWithKisi(),
    queryFn: fetchAllGsmler,
  })
}

export function useGsmlerByKisi(kisiId: string) {
  return useQuery({
    queryKey: gsmKeys.byKisi(kisiId),
    queryFn: () => fetchGsmlerByKisi(kisiId),
    enabled: !!kisiId,
  })
}

export function useCreateGsm() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createGsm,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: gsmKeys.byKisi(data.kisiId) })
      queryClient.invalidateQueries({ queryKey: kisiKeys.detail(data.kisiId) })
    },
  })
}

export function useBulkCreateGsm() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: bulkCreateGsm,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: gsmKeys.byKisi(variables.kisiId) })
      queryClient.invalidateQueries({ queryKey: kisiKeys.detail(variables.kisiId) })
    },
  })
}

export function useUpdateGsm() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateGsm,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: gsmKeys.byKisi(data.kisiId) })
      queryClient.invalidateQueries({ queryKey: kisiKeys.detail(data.kisiId) })
    },
  })
}

export function useDeleteGsm() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteGsm,
    onSuccess: () => {
      // Invalidate all gsm queries since we don't know which kisi it belonged to
      queryClient.invalidateQueries({ queryKey: gsmKeys.all })
    },
  })
}
