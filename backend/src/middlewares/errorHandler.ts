import { Request, Response, NextFunction } from 'express'
import { AppError } from '../utils/AppError'

// This middleware catches all errors thrown in route handlers
// It must have 4 parameters so Express recognizes it as an error handler
export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // If it's our custom AppError, use its status code and message
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ message: err.message })
    return
  }

  // For unexpected errors, log them and return a generic 500
  console.error('Unexpected error:', err)
  res.status(500).json({ message: 'Internal server error' })
}
