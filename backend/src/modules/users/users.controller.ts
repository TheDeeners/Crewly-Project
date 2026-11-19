import { Request, Response, NextFunction } from 'express'
import * as usersService from './users.service'

// GET /api/users
export async function getAllUsers(req: Request, res: Response, next: NextFunction) {
  try {
    const users = await usersService.getAllUsers()
    res.json(users)
  } catch (error) {
    next(error)
  }
}

// POST /api/users
export async function createUser(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await usersService.createUser(req.body)
    res.status(201).json(user)
  } catch (error) {
    next(error)
  }
}

// PATCH /api/users/:id
export async function updateUser(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string
    const user = await usersService.updateUser(id, req.body)
    res.json(user)
  } catch (error) {
    next(error)
  }
}
