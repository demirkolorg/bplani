import { AppError } from "@/types/errors"

export function getErrorMessage(error: unknown): string {
  if (error instanceof AppError) {
    return error.message
  }

  if (error instanceof Error) {
    return error.message
  }

  if (typeof error === "string") {
    return error
  }

  if (error && typeof error === "object" && "message" in error) {
    return String(error.message)
  }

  return "Beklenmeyen bir hata oluştu"
}

export function isNetworkError(error: unknown): boolean {
  if (error instanceof TypeError) {
    return error.message.includes("fetch") || error.message.includes("network")
  }
  return false
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError
}

export function getErrorCode(error: unknown): string | undefined {
  if (isAppError(error)) {
    return error.code
  }
  return undefined
}

export function getErrorDetails(error: unknown): Record<string, unknown> | undefined {
  if (isAppError(error)) {
    return error.details
  }
  return undefined
}

export function getStatusCode(error: unknown): number {
  if (isAppError(error)) {
    return error.statusCode
  }

  // Default status codes based on error type
  if (isNetworkError(error)) {
    return 503 // Service Unavailable
  }

  return 500 // Internal Server Error
}

/**
 * Logs error with structured format
 */
export function logError(error: unknown, context?: string): void {
  const message = getErrorMessage(error)
  const code = getErrorCode(error)
  const details = getErrorDetails(error)

  console.error({
    timestamp: new Date().toISOString(),
    context,
    message,
    code,
    details,
    stack: error instanceof Error ? error.stack : undefined,
  })
}
