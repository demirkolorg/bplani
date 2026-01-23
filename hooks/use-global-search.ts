import { useQuery } from "@tanstack/react-query"
import { useDebounce } from "./use-debounce"
import type { GlobalSearchResponse } from "@/lib/validations"

// Query keys
export const searchKeys = {
  all: ["search"] as const,
  query: (q: string) => [...searchKeys.all, q] as const,
}

// Fetch function
async function fetchSearchResults(query: string): Promise<GlobalSearchResponse> {
  const searchParams = new URLSearchParams({ q: query })
  const response = await fetch(`/api/search?${searchParams.toString()}`)

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Arama yapılırken hata oluştu")
  }

  return response.json()
}

// Hook
export function useGlobalSearch(query: string) {
  const debouncedQuery = useDebounce(query, 300)

  return useQuery({
    queryKey: searchKeys.query(debouncedQuery),
    queryFn: () => fetchSearchResults(debouncedQuery),
    enabled: debouncedQuery.length >= 2,
    staleTime: 60 * 1000, // 60 seconds
  })
}
