import prisma from '../../lib/prisma'
import { AppError } from '../../utils/AppError'
import { countWorkingDays } from '../../utils/date'
import { CreateLeaveRequestInput } from './leave-requests.schema'

/**
 * ดึงโควตาการลาและจำนวนวันที่ใช้ไปของตัวเองในปีปัจจุบัน
 */
export async function getMyLeaveBalances(userId: string) {
  const currentYear = new Date().getFullYear()

  return prisma.leaveBalance.findMany({
    where: {
      userId,
      year: currentYear,
    },
    include: {
      leaveType: true,
    },
    orderBy: {
      leaveType: {
        name: 'asc',
      },
    },
  })
}

/**
 * ยื่นคำขอลา (Submit Leave Request)
 * กฎ Business Logic:
 * 1. startDate ต้องไม่มากกว่า endDate
 * 2. คำนวณ totalDays โดยไม่นับเสาร์-อาทิตย์ และไม่นับวันหยุดบริษัทจากตาราง Holiday
 * 3. totalDays ต้อง > 0
 * 4. โควตาคงเหลือต้องพอ (quotaDays - usedDays >= totalDays)
 * 5. วันลาต้องไม่ซ้อนทับกับใบลาอื่นของตัวเองที่มีสถานะ PENDING หรือ APPROVED
 */
export async function createLeaveRequest(userId: string, input: CreateLeaveRequestInput) {
  const { leaveTypeId, startDate, endDate, reason } = input

  // 1. ตรวจสอบว่า startDate <= endDate
  if (startDate > endDate) {
    throw new AppError('Start date must be before or equal to end date', 400)
  }

  // 2. ดึงรายการวันหยุดทั้งหมดเพื่อนำไปคัดออกจากวันทำงาน
  const holidays = await prisma.holiday.findMany({
    select: { holidayDate: true },
  })
  const holidayDates = new Set(holidays.map((h) => h.holidayDate))

  // คำนวณจำนวนวันทำงานจริง (ไม่นับเสาร์-อาทิตย์ และวันหยุดบริษัท)
  const totalDays = countWorkingDays(startDate, endDate, holidayDates)

  // 3. ถ้าไม่มีวันทำงานในช่วงที่เลือก (เช่น ตรงกับเสาร์-อาทิตย์หรือวันหยุดทั้งหมด)
  if (totalDays <= 0) {
    throw new AppError('No working days in the requested date range', 400)
  }

  // 4. ตรวจสอบโควตาคงเหลือของปีที่ลา
  const leaveYear = parseInt(startDate.slice(0, 4), 10)
  const balance = await prisma.leaveBalance.findUnique({
    where: {
      userId_leaveTypeId_year: {
        userId,
        leaveTypeId,
        year: leaveYear,
      },
    },
  })

  if (!balance) {
    throw new AppError('Leave balance not found for the requested year', 400)
  }

  const remainingDays = balance.quotaDays - balance.usedDays
  if (remainingDays < totalDays) {
    throw new AppError(`Insufficient leave balance (Available: ${remainingDays} days, Requested: ${totalDays} days)`, 400)
  }

  // 5. ตรวจสอบวันลาซ้อนทับกับใบลาสถานะ PENDING หรือ APPROVED ที่มีอยู่เดิม
  const overlappingRequest = await prisma.leaveRequest.findFirst({
    where: {
      userId,
      status: {
        in: ['PENDING', 'APPROVED'],
      },
      startDate: { lte: endDate },
      endDate: { gte: startDate },
    },
  })

  if (overlappingRequest) {
    throw new AppError('You already have a pending or approved leave request during this period', 409)
  }

  // บันทึกคำขอลาใหม่ มีสถานะเริ่มต้นเป็น PENDING
  const leaveRequest = await prisma.leaveRequest.create({
    data: {
      userId,
      leaveTypeId,
      startDate,
      endDate,
      totalDays,
      reason,
      status: 'PENDING',
    },
    include: {
      leaveType: true,
    },
  })

  return leaveRequest
}

/**
 * ดึงรายการใบลาของตัวเอง
 */
export async function getMyLeaveRequests(userId: string) {
  return prisma.leaveRequest.findMany({
    where: { userId },
    include: {
      leaveType: true,
      approver: {
        select: {
          firstName: true,
          lastName: true,
          role: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })
}

/**
 * ยกเลิกใบลาของตัวเอง
 * กฎ: ยกเลิกได้เฉพาะของตัวเอง และต้องมีสถานะ PENDING เท่านั้น
 */
export async function cancelLeaveRequest(userId: string, requestId: string) {
  const request = await prisma.leaveRequest.findUnique({
    where: { id: requestId },
  })

  if (!request) {
    throw new AppError('Leave request not found', 404)
  }

  if (request.userId !== userId) {
    throw new AppError('You can only cancel your own leave request', 403)
  }

  if (request.status !== 'PENDING') {
    throw new AppError('Only pending leave requests can be cancelled', 400)
  }

  return prisma.leaveRequest.update({
    where: { id: requestId },
    data: {
      status: 'CANCELLED',
    },
  })
}

/**
 * ดึงรายการใบลาที่รออนุมัติ (PENDING)
 * กฎ:
 * - Admin: เห็นใบลา PENDING ของทุกคน ยกเว้นของตนเอง (เพราะห้ามอนุมัติใบลาตนเอง)
 * - Manager: เห็นเฉพาะใบลา PENDING ของลูกทีมตนเอง (ผู้ใช้ที่มี managerId = id ของ Manager)
 */
export async function getPendingLeaveRequests(currentUserId: string, currentUserRole: string) {
  if (currentUserRole === 'ADMIN') {
    return prisma.leaveRequest.findMany({
      where: {
        status: 'PENDING',
        userId: { not: currentUserId }, // ไม่รวมใบลาของตัวเอง
      },
      include: {
        user: {
          select: {
            id: true,
            employeeCode: true,
            firstName: true,
            lastName: true,
            role: true,
            email: true,
          },
        },
        leaveType: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    })
  } else if (currentUserRole === 'MANAGER') {
    // ดึงรหัสลูกทีม
    const subordinates = await prisma.user.findMany({
      where: { managerId: currentUserId },
      select: { id: true },
    })
    const subordinateIds = subordinates.map((s) => s.id)

    if (subordinateIds.length === 0) {
      return []
    }

    return prisma.leaveRequest.findMany({
      where: {
        status: 'PENDING',
        userId: { in: subordinateIds },
      },
      include: {
        user: {
          select: {
            id: true,
            employeeCode: true,
            firstName: true,
            lastName: true,
            role: true,
            email: true,
          },
        },
        leaveType: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    })
  }

  throw new AppError('You do not have permission to view approvals', 403)
}

/**
 * อนุมัติใบลา (Approve Leave Request)
 * กฎ:
 * 1. ใบลาต้องมีสถานะ PENDING เท่านั้น
 * 2. ห้ามอนุมัติใบลาของตนเอง (แม้เป็น Admin)
 * 3. Manager อนุมัติได้เฉพาะลูกทีมของตนเอง, Admin อนุมัติได้ทุกคน (ถ้าผู้ยื่นเป็น Manager ให้ Admin อนุมัติ)
 * 4. การอนุมัติและหักโควตา (usedDays) ต้องทำใน prisma.$transaction เดียวกัน
 */
export async function approveLeaveRequest(
  approverId: string,
  approverRole: string,
  requestId: string
) {
  const request = await prisma.leaveRequest.findUnique({
    where: { id: requestId },
    include: {
      user: true,
    },
  })

  if (!request) {
    throw new AppError('Leave request not found', 404)
  }

  if (request.status !== 'PENDING') {
    throw new AppError('Only pending leave requests can be approved', 400)
  }

  // ห้ามอนุมัติใบลาของตัวเอง
  if (request.userId === approverId) {
    throw new AppError('You cannot approve your own leave request', 403)
  }

  // ถ้าเป็น Manager ตรวจสอบว่าเป็นลูกทีมของตนเองหรือไม่
  if (approverRole === 'MANAGER') {
    if (request.user.managerId !== approverId) {
      throw new AppError('You can only approve leave requests for your own subordinates', 403)
    }
  }

  const leaveYear = parseInt(request.startDate.slice(0, 4), 10)

  // ดำเนินการใน transaction เดียวกัน
  return prisma.$transaction(async (tx) => {
    // 1. อัปเดตสถานะใบลาเป็น APPROVED
    const updatedRequest = await tx.leaveRequest.update({
      where: { id: requestId },
      data: {
        status: 'APPROVED',
        approverId,
        decidedAt: new Date(),
      },
      include: {
        leaveType: true,
      },
    })

    // 2. บวกจำนวนวันที่ใช้ (usedDays) ใน LeaveBalance ของปีนั้น
    await tx.leaveBalance.update({
      where: {
        userId_leaveTypeId_year: {
          userId: request.userId,
          leaveTypeId: request.leaveTypeId,
          year: leaveYear,
        },
      },
      data: {
        usedDays: {
          increment: request.totalDays,
        },
      },
    })

    return updatedRequest
  })
}

/**
 * ปฏิเสธใบลา (Reject Leave Request)
 * กฎ:
 * 1. ใบลาต้องมีสถานะ PENDING เท่านั้น
 * 2. ห้ามปฏิเสธใบลาของตนเอง
 * 3. Manager ปฏิเสธได้เฉพาะลูกทีมของตนเอง, Admin ปฏิเสธได้ทุกคน
 * 4. การปฏิเสธ ไม่ต้องหักโควตา
 */
export async function rejectLeaveRequest(
  approverId: string,
  approverRole: string,
  requestId: string
) {
  const request = await prisma.leaveRequest.findUnique({
    where: { id: requestId },
    include: {
      user: true,
    },
  })

  if (!request) {
    throw new AppError('Leave request not found', 404)
  }

  if (request.status !== 'PENDING') {
    throw new AppError('Only pending leave requests can be rejected', 400)
  }

  if (request.userId === approverId) {
    throw new AppError('You cannot reject your own leave request', 403)
  }

  if (approverRole === 'MANAGER') {
    if (request.user.managerId !== approverId) {
      throw new AppError('You can only reject leave requests for your own subordinates', 403)
    }
  }

  const updatedRequest = await prisma.leaveRequest.update({
    where: { id: requestId },
    data: {
      status: 'REJECTED',
      approverId,
      decidedAt: new Date(),
    },
    include: {
      leaveType: true,
    },
  })

  return updatedRequest
}
