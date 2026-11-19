import { Router } from 'express'
import { authenticate } from '../../middlewares/authenticate'
import { authorize } from '../../middlewares/authorize'
import { validate } from '../../middlewares/validate'
import {
  getAllUsers,
  createUser,
  updateUser,
} from './users.controller'
import {
  createUserSchema,
  updateUserSchema,
} from './users.schema'

const router = Router()

// ทุก endpoint ของ users จัดการโดย ADMIN เท่านั้น
router.use(authenticate, authorize('ADMIN'))

router.get('/', getAllUsers)
router.post('/', validate(createUserSchema), createUser)
router.patch('/:id', validate(updateUserSchema), updateUser)

export default router
