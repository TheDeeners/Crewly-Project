import { Request, Response, NextFunction } from 'express'
import * as leaveTypesService from './leave-types.service'

// GET /api/leave-types
export async function getAllLeaveTypes(req: Request, res: Response, next: NextFunction) {
  try {
    const leaveTypes = await leaveTypesService.getAllLeaveTypes()
    res.json(leaveTypes)
  } catch (error) {
    next(error)
  }
}

// POST /api/leave-types (Admin)
export async function createLeaveType(req: Request, res: Response, next: NextFunction) {
  try {
    const leaveType = await leaveTypesService.createLeaveType(req.body)
    res.status(201).json(leaveType)
  } catch (error) {
    next(error)
  }
}

// PATCH /api/leave-types/:id (Admin)
export async function updateLeaveType(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string
    const leaveType = await leaveTypesService.updateLeaveType(id, req.body)
    res.json(leaveType)
  } catch (error) {
    next(error)
  }
}
