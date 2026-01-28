import { NextResponse } from "next/server"
import { ZodError } from "zod"
import { getErrorMessage, isAppError, logError } from "./error-handler"
import { AppError } from "@/types/errors"

export interface ApiErrorResponse {
  error: string
  code?: string
  details?: Record<string, unknown>
  timestamp: string
}

export interface ApiSuccessResponse<T = unknown> {
  data: T
  timestamp: string
}

/**
 * Creates a standardized error response
 */
export function errorResponse(
  message: string,
  status: number,
  code?: string,
  details?: Record<string, unknown>
): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    {
      error: message,
      code,
      details,
      timestamp: new Date().toISOString(),
    },
    { status }
  )
}

/**
 * Creates a standardized validation error response from Zod error
 */
export function validationErrorResponse(zodError: ZodError): NextResponse<ApiErrorResponse> {
  const formattedErrors = zodError.flatten()

  return errorResponse(
    "Geçersiz veri girişi",
    400,
    "VALIDATION_ERROR",
    {
      fieldErrors: formattedErrors.fieldErrors,
      formErrors: formattedErrors.formErrors,
    }
  )
}

/**
 * Creates a standardized success response
 */
export function successResponse<T>(
  data: T,
  status: number = 200
): NextResponse<ApiSuccessResponse<T>> {
  return NextResponse.json(
    {
      data,
      timestamp: new Date().toISOString(),
    },
    { status }
  )
}

/**
 * Handles any error and returns appropriate response
 */
export function handleApiError(error: unknown, context?: string): NextResponse<ApiErrorResponse> {
  // Log the error
  logError(error, context)

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    return validationErrorResponse(error)
  }

  // Handle AppError instances
  if (isAppError(error)) {
    return errorResponse(
      error.message,
      error.statusCode,
      error.code,
      error.details
    )
  }

  // Handle generic errors
  const message = getErrorMessage(error)

  // Don't expose internal error details in production
  const safeMessage =
    process.env.NODE_ENV === "production"
      ? "Sunucu hatası oluştu"
      : message

  return errorResponse(safeMessage, 500, "INTERNAL_SERVER_ERROR")
}

/**
 * Wraps an async API handler with error handling
 */
export function withErrorHandling<T>(
  handler: () => Promise<NextResponse<T>>,
  context?: string
): Promise<NextResponse<T | ApiErrorResponse>> {
  return handler().catch((error) => handleApiError(error, context))
}
