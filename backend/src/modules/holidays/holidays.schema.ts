import { z } from 'zod'

export const createHolidaySchema = z.object({
  holidayDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'holidayDate must be YYYY-MM-DD'),
  name: z.string().min(1, 'Name is required'),
})

export type CreateHolidayInput = z.infer<typeof createHolidaySchema>
