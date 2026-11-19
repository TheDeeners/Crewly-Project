import { z } from 'zod'

export const createUserSchema = z.object({
  employeeCode: z.string().min(1, 'Employee code is required'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  role: z.enum(['ADMIN', 'MANAGER', 'EMPLOYEE']),
  managerId: z.string().uuid().nullable().optional(),
})

export const updateUserSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  role: z.enum(['ADMIN', 'MANAGER', 'EMPLOYEE']).optional(),
  managerId: z.string().uuid().nullable().optional(),
  isActive: z.boolean().optional(),
  password: z.string().min(6).optional(),
})

export type CreateUserInput = z.infer<typeof createUserSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>
