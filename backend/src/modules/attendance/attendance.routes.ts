import { Router } from 'express'
import { authenticate } from '../../middlewares/authenticate'
import { authorize } from '../../middlewares/authorize'
import {
  checkIn,
  checkOut,
  getToday,
  getMyAttendance,
  getTeamAttendance,
} from './attendance.controller'

const router = Router()

// ทุก endpoint ต้องผ่านการล็อกอิน (authenticate) ก่อนเสมอ
router.use(authenticate)

// POST /api/attendance/check-in — เช็คอิน
router.post('/check-in', checkIn)

// POST /api/attendance/check-out — เช็คเอาต์
router.post('/check-out', checkOut)

// GET /api/attendance/today — ดูข้อมูลการเข้างานวันนี้
router.get('/today', getToday)

// GET /api/attendance/me — ดูประวัติเข้างานของตัวเอง
router.get('/me', getMyAttendance)

// GET /api/attendance/team — ดูประวัติเข้างานของทีม (Manager หรือ Admin เท่านั้น)
router.get('/team', authorize('MANAGER', 'ADMIN'), getTeamAttendance)

export default router
