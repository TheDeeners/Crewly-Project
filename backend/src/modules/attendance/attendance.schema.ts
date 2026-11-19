import { z } from 'zod'

// Schema สำหรับตรวจสอบ query parameters เมื่อเรียกดูประวัติเข้างาน
export const attendanceQuerySchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'startDate must be YYYY-MM-DD').optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'endDate must be YYYY-MM-DD').optional(),
})

export type AttendanceQuery = z.infer<typeof attendanceQuerySchema>
