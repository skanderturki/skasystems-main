import { Request, Response, NextFunction } from 'express'

export interface ApiError extends Error {
  statusCode?: number
  errors?: Record<string, string[]>
}

export function errorMiddleware(
  err: ApiError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error('Error:', err.message)

  const statusCode = err.statusCode || 500
  const message = err.message || 'Internal Server Error'

  res.status(statusCode).json({
    success: false,
    message,
    errors: err.errors,
  })
}

export function notFoundMiddleware(_req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    message: 'Resource not found',
  })
}

export function createError(message: string, statusCode: number = 500): ApiError {
  const error: ApiError = new Error(message)
  error.statusCode = statusCode
  return error
}
