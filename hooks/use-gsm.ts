import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import type { CreateGsmInput, UpdateGsmInput, BulkCreateGsmInput } from "@/lib/validations"
import { kisiKeys } from "./use-kisiler"
import { toast } from "sonner"
import { getErrorMessage } from "@/lib/error-handler"
import { queryConfig } from "@/lib/query-config"

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

// Custom error for duplicate GSM with kisi info
export class DuplicateGsmError extends Error {
  existingKisi: { id: string; ad: string; soyad: string }

  constructor(message: string, existingKisi: { id: string; ad: string; soyad: string }) {
    super(message)
    this.name = "DuplicateGsmError"
    this.existingKisi = existingKisi
  }
}

async function createGsm(data: CreateGsmInput): Promise<Gsm> {
  const response = await fetch("/api/gsmler", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    const error = await response.json()

    // Check if it's a duplicate GSM error (409 Conflict)
    if (response.status === 409 && error.existingKisi) {
      throw new DuplicateGsmError(
        error.error || "Bu GSM numarası sistemde zaten kayıtlı",
        error.existingKisi
      )
    }

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
    staleTime: queryConfig.list.staleTime,
    gcTime: queryConfig.list.gcTime,
  })
}

export function useGsmlerByKisi(kisiId: string) {
  return useQuery({
    queryKey: gsmKeys.byKisi(kisiId),
    queryFn: () => fetchGsmlerByKisi(kisiId),
    enabled: !!kisiId,
    staleTime: queryConfig.list.staleTime,
    gcTime: queryConfig.list.gcTime,
  })
}

export function useCreateGsm() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createGsm,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: gsmKeys.byKisi(data.kisiId) })
      queryClient.invalidateQueries({ queryKey: kisiKeys.detail(data.kisiId) })
      toast.success("GSM başarıyla eklendi")
    },
    onError: (error) => {
      const message = getErrorMessage(error)
      toast.error(message)
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
      toast.success("GSM numaraları başarıyla eklendi")
    },
    onError: (error) => {
      const message = getErrorMessage(error)
      toast.error(message)
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
      toast.success("GSM başarıyla güncellendi")
    },
    onError: (error) => {
      const message = getErrorMessage(error)
      toast.error(message)
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
      toast.success("GSM başarıyla silindi")
    },
    onError: (error) => {
      const message = getErrorMessage(error)
      toast.error(message)
    },
  })
}
