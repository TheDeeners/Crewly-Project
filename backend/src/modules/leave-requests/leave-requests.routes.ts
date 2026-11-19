import { Router } from 'express'
import { authenticate } from '../../middlewares/authenticate'
import { authorize } from '../../middlewares/authorize'
import { validate } from '../../middlewares/validate'
import {
  createLeaveRequest,
  getMyLeaveRequests,
  cancelLeaveRequest,
  getPendingLeaveRequests,
  approveLeaveRequest,
  rejectLeaveRequest,
} from './leave-requests.controller'
import { createLeaveRequestSchema } from './leave-requests.schema'

const router = Router()

// ทุก endpoint ของ leave-requests ต้อง authenticate ก่อน
router.use(authenticate)

// POST /api/leave-requests — ยื่นใบลา
router.post('/', validate(createLeaveRequestSchema), createLeaveRequest)

// GET /api/leave-requests/me — ดูใบลาของตนเอง
router.get('/me', getMyLeaveRequests)

// PATCH /api/leave-requests/:id/cancel — ยกเลิกใบลาของตนเอง
router.patch('/:id/cancel', cancelLeaveRequest)

// GET /api/leave-requests/pending — ดูใบลาที่รออนุมัติ (Manager หรือ Admin เท่านั้น)
router.get('/pending', authorize('MANAGER', 'ADMIN'), getPendingLeaveRequests)

// PATCH /api/leave-requests/:id/approve — อนุมัติใบลา
router.patch('/:id/approve', authorize('MANAGER', 'ADMIN'), approveLeaveRequest)

// PATCH /api/leave-requests/:id/reject — ปฏิเสธใบลา
router.patch('/:id/reject', authorize('MANAGER', 'ADMIN'), rejectLeaveRequest)

export default router
