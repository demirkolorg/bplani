import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import type { UpdateAyarlarInput, AyarKey } from "@/lib/validations"

export interface Ayar {
  value: string
  aciklama: string
}

export type AyarlarResponse = Record<AyarKey, Ayar>

// Query keys
export const ayarKeys = {
  all: ["ayarlar"] as const,
}

// Fetch functions
async function fetchAyarlar(): Promise<AyarlarResponse> {
  const response = await fetch("/api/ayarlar")
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Ayarlar yüklenirken hata oluştu")
  }
  return response.json()
}

async function updateAyarlar(data: UpdateAyarlarInput): Promise<AyarlarResponse> {
  const response = await fetch("/api/ayarlar", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Ayarlar güncellenirken hata oluştu")
  }
  return response.json()
}

// Hooks
export function useAyarlar() {
  return useQuery({
    queryKey: ayarKeys.all,
    queryFn: fetchAyarlar,
    staleTime: 5 * 60 * 1000, // 5 dakika cache
  })
}

export function useUpdateAyarlar() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateAyarlar,
    onSuccess: (data) => {
      queryClient.setQueryData(ayarKeys.all, data)
    },
  })
}

// Helper: Tek bir ayar değerini number olarak al
export function getAyarAsNumber(ayarlar: AyarlarResponse | undefined, key: AyarKey, defaultValue: number): number {
  if (!ayarlar || !ayarlar[key]) return defaultValue
  const parsed = parseInt(ayarlar[key].value, 10)
  return isNaN(parsed) ? defaultValue : parsed
}
