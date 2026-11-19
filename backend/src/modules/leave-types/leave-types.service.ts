import prisma from '../../lib/prisma'
import { AppError } from '../../utils/AppError'
import { CreateLeaveTypeInput, UpdateLeaveTypeInput } from './leave-types.schema'

/**
 * ดึงรายการประเภทการลาทั้งหมด (ทุกคนสามารถดูได้)
 */
export async function getAllLeaveTypes() {
  return prisma.leaveType.findMany({
    orderBy: { name: 'asc' },
  })
}

/**
 * สร้างประเภทการลาใหม่ (Admin เท่านั้น)
 */
export async function createLeaveType(input: CreateLeaveTypeInput) {
  const existing = await prisma.leaveType.findUnique({
    where: { name: input.name },
  })

  if (existing) {
    throw new AppError('Leave type with this name already exists', 409)
  }

  const leaveType = await prisma.leaveType.create({
    data: input,
  })

  // สร้าง LeaveBalance สำหรับปีปัจจุบันให้แก่พนักงานทุกคนที่มีอยู่โดยอัตโนมัติ
  const users = await prisma.user.findMany({ select: { id: true } })
  const currentYear = new Date().getFullYear()

  for (const user of users) {
    await prisma.leaveBalance.upsert({
      where: {
        userId_leaveTypeId_year: {
          userId: user.id,
          leaveTypeId: leaveType.id,
          year: currentYear,
        },
      },
      update: {},
      create: {
        userId: user.id,
        leaveTypeId: leaveType.id,
        year: currentYear,
        quotaDays: leaveType.defaultQuotaDays,
        usedDays: 0,
      },
    })
  }

  return leaveType
}

/**
 * แก้ไขประเภทการลา (Admin เท่านั้น)
 */
export async function updateLeaveType(id: string, input: UpdateLeaveTypeInput) {
  const leaveType = await prisma.leaveType.findUnique({
    where: { id },
  })

  if (!leaveType) {
    throw new AppError('Leave type not found', 404)
  }

  if (input.name && input.name !== leaveType.name) {
    const duplicate = await prisma.leaveType.findUnique({
      where: { name: input.name },
    })
    if (duplicate) {
      throw new AppError('Leave type with this name already exists', 409)
    }
  }

  return prisma.leaveType.update({
    where: { id },
    data: input,
  })
}
