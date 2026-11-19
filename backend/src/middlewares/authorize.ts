import { Request, Response, NextFunction } from 'express'
import { AppError } from '../utils/AppError'

// Middleware factory: only allow users whose role is in the allowed list
export function authorize(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401))
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to access this resource', 403))
    }

    next()
  }
}
