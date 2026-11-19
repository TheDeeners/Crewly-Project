import { Router } from 'express'
import { authenticate } from '../../middlewares/authenticate'
import { authorize } from '../../middlewares/authorize'
import { validate } from '../../middlewares/validate'
import {
  getAllHolidays,
  createHoliday,
  deleteHoliday,
} from './holidays.controller'
import { createHolidaySchema } from './holidays.schema'

const router = Router()

// ทุกคนสามารถดูรายการวันหยุดได้
router.get('/', authenticate, getAllHolidays)

// Admin เท่านั้นที่สามารถเพิ่มหรือลบวันหยุดได้
router.post('/', authenticate, authorize('ADMIN'), validate(createHolidaySchema), createHoliday)
router.delete('/:id', authenticate, authorize('ADMIN'), deleteHoliday)

export default router
