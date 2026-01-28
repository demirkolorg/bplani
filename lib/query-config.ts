/**
 * React Query Configuration
 * Centralized configuration for query options
 */

export const queryConfig = {
  // List queries: 30 seconds stale time (data doesn't change frequently)
  list: {
    staleTime: 30000, // 30 seconds
    gcTime: 300000, // 5 minutes (formerly cacheTime)
  },

  // Detail queries: 1 minute stale time
  detail: {
    staleTime: 60000, // 1 minute
    gcTime: 600000, // 10 minutes
  },

  // Stats/dashboard queries: 2 minutes stale time
  stats: {
    staleTime: 120000, // 2 minutes
    gcTime: 300000, // 5 minutes
  },

  // Frequently changing data (alarms, notifications): 10 seconds
  realtime: {
    staleTime: 10000, // 10 seconds
    gcTime: 60000, // 1 minute
  },

  // Static/reference data (locations, categories): 5 minutes
  static: {
    staleTime: 300000, // 5 minutes
    gcTime: 3600000, // 1 hour
  },
} as const

export type QueryConfigType = keyof typeof queryConfig
