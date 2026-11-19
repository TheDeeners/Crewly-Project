import { Request, Response, NextFunction } from 'express'
import * as leaveRequestsService from './leave-requests.service'

// GET /api/leave-balances/me — ดูโควตาคงเหลือของตัวเอง
export async function getMyLeaveBalances(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId
    const balances = await leaveRequestsService.getMyLeaveBalances(userId)
    res.json(balances)
  } catch (error) {
    next(error)
  }
}

// POST /api/leave-requests — ยื่นใบลา
export async function createLeaveRequest(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId
    const request = await leaveRequestsService.createLeaveRequest(userId, req.body)
    res.status(201).json(request)
  } catch (error) {
    next(error)
  }
}

// GET /api/leave-requests/me — ดูใบลาของตนเอง
export async function getMyLeaveRequests(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId
    const requests = await leaveRequestsService.getMyLeaveRequests(userId)
    res.json(requests)
  } catch (error) {
    next(error)
  }
}

// PATCH /api/leave-requests/:id/cancel — ยกเลิกใบลา
export async function cancelLeaveRequest(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId
    const id = req.params.id as string
    const result = await leaveRequestsService.cancelLeaveRequest(userId, id)
    res.json(result)
  } catch (error) {
    next(error)
  }
}

// GET /api/leave-requests/pending — ดูใบลาที่รออนุมัติ (Manager / Admin)
export async function getPendingLeaveRequests(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId, role } = req.user!
    const requests = await leaveRequestsService.getPendingLeaveRequests(userId, role)
    res.json(requests)
  } catch (error) {
    next(error)
  }
}

// PATCH /api/leave-requests/:id/approve — อนุมัติใบลา
export async function approveLeaveRequest(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId, role } = req.user!
    const id = req.params.id as string
    const result = await leaveRequestsService.approveLeaveRequest(userId, role, id)
    res.json(result)
  } catch (error) {
    next(error)
  }
}

// PATCH /api/leave-requests/:id/reject — ปฏิเสธใบลา
export async function rejectLeaveRequest(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId, role } = req.user!
    const id = req.params.id as string
    const result = await leaveRequestsService.rejectLeaveRequest(userId, role, id)
    res.json(result)
  } catch (error) {
    next(error)
  }
}
