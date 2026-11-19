import prisma from '../../lib/prisma'
import { AppError } from '../../utils/AppError'
import { CreateHolidayInput } from './holidays.schema'

/**
 * ดึงรายการวันหยุดทั้งหมด เรียงตามวันที่
 */
export async function getAllHolidays() {
  return prisma.holiday.findMany({
    orderBy: { holidayDate: 'asc' },
  })
}

/**
 * เพิ่มวันหยุดใหม่ (Admin)
 */
export async function createHoliday(input: CreateHolidayInput) {
  const existing = await prisma.holiday.findUnique({
    where: { holidayDate: input.holidayDate },
  })

  if (existing) {
    throw new AppError('Holiday for this date already exists', 409)
  }

  return prisma.holiday.create({
    data: input,
  })
}

/**
 * ลบวันหยุด (Admin)
 */
export async function deleteHoliday(id: string) {
  const holiday = await prisma.holiday.findUnique({
    where: { id },
  })

  if (!holiday) {
    throw new AppError('Holiday not found', 404)
  }

  await prisma.holiday.delete({
    where: { id },
  })

  return { message: 'Holiday deleted successfully' }
}
