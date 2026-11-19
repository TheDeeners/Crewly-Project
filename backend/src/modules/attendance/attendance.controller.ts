import { Request, Response, NextFunction } from 'express'
import * as attendanceService from './attendance.service'
import { attendanceQuerySchema } from './attendance.schema'

// POST /api/attendance/check-in
export async function checkIn(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId
    const attendance = await attendanceService.checkIn(userId)
    res.status(201).json(attendance)
  } catch (error) {
    next(error)
  }
}

// POST /api/attendance/check-out
export async function checkOut(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId
    const attendance = await attendanceService.checkOut(userId)
    res.json(attendance)
  } catch (error) {
    next(error)
  }
}

// GET /api/attendance/today — ดูสถานะการเข้างานของวันนี้
export async function getToday(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId
    const attendance = await attendanceService.getTodayAttendance(userId)
    res.json(attendance)
  } catch (error) {
    next(error)
  }
}

// GET /api/attendance/me — ดูประวัติเข้างานของตัวเอง
export async function getMyAttendance(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId
    const parsedQuery = attendanceQuerySchema.parse(req.query)
    const records = await attendanceService.getMyAttendance(userId, parsedQuery)
    res.json(records)
  } catch (error) {
    next(error)
  }
}

// GET /api/attendance/team — ดูประวัติเข้างานของทีม (Manager ดูลูกทีม, Admin ดูทุกคน)
export async function getTeamAttendance(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId, role } = req.user!
    const parsedQuery = attendanceQuerySchema.parse(req.query)
    const records = await attendanceService.getTeamAttendance(userId, role, parsedQuery)
    res.json(records)
  } catch (error) {
    next(error)
  }
}
