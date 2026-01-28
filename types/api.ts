/**
 * Standard API Response Types
 */

export interface ApiResponse<T = unknown> {
  data: T
  timestamp: string
  error?: never
}

export interface ApiErrorResponse {
  error: string
  code?: string
  details?: Record<string, unknown>
  timestamp: string
  data?: never
}

export type ApiResult<T> = ApiResponse<T> | ApiErrorResponse

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface PaginatedApiResponse<T> extends ApiResponse<unknown> {
  data: PaginatedResponse<T>
}

/**
 * Type guard to check if response is an error
 */
export function isApiError(response: ApiResult<unknown>): response is ApiErrorResponse {
  return 'error' in response && response.error !== undefined
}

/**
 * Type guard to check if response is successful
 */
export function isApiSuccess<T>(response: ApiResult<T>): response is ApiResponse<T> {
  return 'data' in response && response.data !== undefined
}

/**
 * Common filter value types
 */
export type FilterValue = string | number | boolean | Date | null | string[] | number[]

/**
 * Query parameters for list endpoints
 */
export interface ListQueryParams {
  page?: number
  limit?: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  [key: string]: FilterValue | undefined
}

/**
 * Batch operation request
 */
export interface BatchOperationRequest {
  ids: string[]
  action?: string
  data?: Record<string, unknown>
}

/**
 * Batch operation response
 */
export interface BatchOperationResponse {
  success: number
  failed: number
  errors?: Array<{
    id: string
    error: string
  }>
}
