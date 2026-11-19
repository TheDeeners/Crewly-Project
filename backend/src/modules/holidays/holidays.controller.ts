import { Request, Response, NextFunction } from 'express'
import * as holidaysService from './holidays.service'

// GET /api/holidays
export async function getAllHolidays(req: Request, res: Response, next: NextFunction) {
  try {
    const holidays = await holidaysService.getAllHolidays()
    res.json(holidays)
  } catch (error) {
    next(error)
  }
}

// POST /api/holidays (Admin)
export async function createHoliday(req: Request, res: Response, next: NextFunction) {
  try {
    const holiday = await holidaysService.createHoliday(req.body)
    res.status(201).json(holiday)
  } catch (error) {
    next(error)
  }
}

// DELETE /api/holidays/:id (Admin)
export async function deleteHoliday(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string
    const result = await holidaysService.deleteHoliday(id)
    res.json(result)
  } catch (error) {
    next(error)
  }
}
