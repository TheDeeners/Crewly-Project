import { Router } from 'express'
import { authenticate } from '../../middlewares/authenticate'
import { getMyLeaveBalances } from './leave-requests.controller'

const router = Router()

// GET /api/leave-balances/me
router.get('/me', authenticate, getMyLeaveBalances)

export default router
