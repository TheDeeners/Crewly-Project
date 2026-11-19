import { Request, Response, NextFunction } from 'express'
import { ZodSchema } from 'zod'
import { AppError } from '../utils/AppError'

// Middleware factory: validate req.body against a Zod schema
// Returns 400 with validation error details if invalid
export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body)

    if (!result.success) {
      // Format Zod errors into a readable string
      const message = result.error.errors
        .map((e) => `${e.path.join('.')}: ${e.message}`)
        .join(', ')
      return next(new AppError(message, 400))
    }

    // Replace req.body with the parsed (and coerced) data
    req.body = result.data
    next()
  }
}
