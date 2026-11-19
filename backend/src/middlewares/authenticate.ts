import { Request, Response, NextFunction } from 'express'
import { verifyToken } from '../lib/jwt'
import { AppError } from '../utils/AppError'

// Extend Express Request to carry the authenticated user's info
declare global {
  namespace Express {
    interface Request {
      user?: { userId: string; role: string }
    }
  }
}

// Middleware: check for a valid Bearer token and attach user info to req.user
export function authenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('Authentication required', 401))
  }

  const token = authHeader.split(' ')[1]
  const payload = verifyToken(token)

  if (!payload) {
    return next(new AppError('Invalid or expired token', 401))
  }

  req.user = payload
  next()
}
