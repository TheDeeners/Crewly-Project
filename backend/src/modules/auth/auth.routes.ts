import { Router } from 'express'
import { validate } from '../../middlewares/validate'
import { authenticate } from '../../middlewares/authenticate'
import { login, getMe } from './auth.controller'
import { loginSchema } from './auth.schema'

const router = Router()

// POST /api/auth/login — no authentication needed
router.post('/login', validate(loginSchema), login)

// GET /api/auth/me — requires a valid JWT token
router.get('/me', authenticate, getMe)

export default router
