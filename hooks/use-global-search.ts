import { useQuery } from "@tanstack/react-query"
import { useDebounce } from "./use-debounce"
import type { GlobalSearchResponse } from "@/lib/validations"

// Query keys
export const searchKeys = {
  all: ["search"] as const,
  query: (q: string, locale: string) => [...searchKeys.all, q, locale] as const,
}

// Fetch function
async function fetchSearchResults(query: string, locale: string): Promise<GlobalSearchResponse> {
  const searchParams = new URLSearchParams({ q: query })
  const response = await fetch(`/api/search?${searchParams.toString()}`, {
    headers: {
      "x-locale": locale,
    },
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Search error")
  }

  return response.json()
}

// Hook
export function useGlobalSearch(query: string, locale: string) {
  const debouncedQuery = useDebounce(query, 300)

  return useQuery({
    queryKey: searchKeys.query(debouncedQuery, locale),
    queryFn: () => fetchSearchResults(debouncedQuery, locale),
    enabled: debouncedQuery.length >= 2,
    staleTime: 60 * 1000, // 60 seconds
  })
}
