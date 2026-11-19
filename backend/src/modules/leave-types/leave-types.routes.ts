import { Router } from 'express'
import { authenticate } from '../../middlewares/authenticate'
import { authorize } from '../../middlewares/authorize'
import { validate } from '../../middlewares/validate'
import {
  getAllLeaveTypes,
  createLeaveType,
  updateLeaveType,
} from './leave-types.controller'
import {
  createLeaveTypeSchema,
  updateLeaveTypeSchema,
} from './leave-types.schema'

const router = Router()

// ทุกคนสามารถดูรายการประเภทการลาได้ (หลังจากล็อกอิน)
router.get('/', authenticate, getAllLeaveTypes)

// Admin เท่านั้นที่สามารถสร้างและแก้ไขได้
router.post('/', authenticate, authorize('ADMIN'), validate(createLeaveTypeSchema), createLeaveType)
router.patch('/:id', authenticate, authorize('ADMIN'), validate(updateLeaveTypeSchema), updateLeaveType)

export default router
