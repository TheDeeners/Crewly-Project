import { Request, Response, NextFunction } from 'express'
import * as authService from './auth.service'

// POST /api/auth/login
export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await authService.login(req.body)
    res.json(result)
  } catch (error) {
    next(error)
  }
}

// GET /api/auth/me — returns the currently logged-in user's profile
export async function getMe(req: Request, res: Response, next: NextFunction) {
  try {
    // req.user is set by the authenticate middleware
    const user = await authService.getMe(req.user!.userId)
    res.json(user)
  } catch (error) {
    next(error)
  }
}
