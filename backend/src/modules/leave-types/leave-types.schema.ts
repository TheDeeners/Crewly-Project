import { z } from 'zod'

export const createLeaveTypeSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  defaultQuotaDays: z.coerce.number().int().min(1, 'defaultQuotaDays must be at least 1'),
  isPaid: z.boolean().default(true),
})

export const updateLeaveTypeSchema = z.object({
  name: z.string().min(1).optional(),
  defaultQuotaDays: z.coerce.number().int().min(1).optional(),
  isPaid: z.boolean().optional(),
})

export type CreateLeaveTypeInput = z.infer<typeof createLeaveTypeSchema>
export type UpdateLeaveTypeInput = z.infer<typeof updateLeaveTypeSchema>
