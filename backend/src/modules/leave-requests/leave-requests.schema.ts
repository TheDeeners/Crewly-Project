import { z } from 'zod'

// Schema สำหรับตรวจสอบข้อมูลการยื่นขอลา
export const createLeaveRequestSchema = z.object({
  leaveTypeId: z.string().uuid('Invalid leaveTypeId format'),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'startDate must be YYYY-MM-DD'),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'endDate must be YYYY-MM-DD'),
  reason: z.string().min(1, 'Reason is required'),
})

export type CreateLeaveRequestInput = z.infer<typeof createLeaveRequestSchema>
