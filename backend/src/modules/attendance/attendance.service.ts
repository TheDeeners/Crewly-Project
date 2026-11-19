import prisma from '../../lib/prisma'
import { AppError } from '../../utils/AppError'
import { getTodayBangkok } from '../../utils/date'
import { AttendanceQuery } from './attendance.schema'

/**
 * บันทึกเวลาเช็คอิน (Check-in)
 * กฎ: เช็คอินได้วันละ 1 ครั้งเท่านั้น โดย workDate คำนวณจากเวลาไทย (Asia/Bangkok)
 */
export async function checkIn(userId: string) {
  const today = getTodayBangkok()

  // ตรวจสอบว่าเคยเช็คอินในวันนี้ไปแล้วหรือยัง
  const existingRecord = await prisma.attendance.findUnique({
    where: {
      userId_workDate: {
        userId,
        workDate: today,
      },
    },
  })

  if (existingRecord) {
    throw new AppError('You have already checked in today', 400)
  }

  // สร้างบันทึกการเข้างานใหม่ของวันนี้
  const attendance = await prisma.attendance.create({
    data: {
      userId,
      workDate: today,
      checkInAt: new Date(),
    },
  })

  return attendance
}

/**
 * บันทึกเวลาเช็คเอาต์ (Check-out)
 * กฎ: ต้องเคยเช็คอินของวันนั้นมาก่อน และต้องยังไม่เคยเช็คเอาต์
 */
export async function checkOut(userId: string) {
  const today = getTodayBangkok()

  // ค้นหาบันทึกการเข้างานของวันนี้
  const attendance = await prisma.attendance.findUnique({
    where: {
      userId_workDate: {
        userId,
        workDate: today,
      },
    },
  })

  // ถ้ายังไม่ได้เช็คอินวันนี้ ไม่อนุญาตให้เช็คเอาต์
  if (!attendance) {
    throw new AppError('You have not checked in today', 400)
  }

  // ถ้าเช็คเอาต์ไปแล้ว ไม่อนุญาตให้เช็คเอาต์ซ้ำ
  if (attendance.checkOutAt) {
    throw new AppError('You have already checked out today', 400)
  }

  // อัปเดตเวลาเช็คเอาต์
  const updatedAttendance = await prisma.attendance.update({
    where: {
      id: attendance.id,
    },
    data: {
      checkOutAt: new Date(),
    },
  })

  return updatedAttendance
}

/**
 * ดึงสถานะการเข้างานของวันนี้สำหรับผู้ใช้ปัจจุบัน
 */
export async function getTodayAttendance(userId: string) {
  const today = getTodayBangkok()
  const attendance = await prisma.attendance.findUnique({
    where: {
      userId_workDate: {
        userId,
        workDate: today,
      },
    },
  })
  return attendance
}

/**
 * ดึงประวัติการเข้างานของตัวเอง สามารถกรองตามช่วงวันที่ (startDate, endDate) ได้
 */
export async function getMyAttendance(userId: string, query: AttendanceQuery) {
  const whereCondition: any = { userId }

  if (query.startDate || query.endDate) {
    whereCondition.workDate = {}
    if (query.startDate) {
      whereCondition.workDate.gte = query.startDate
    }
    if (query.endDate) {
      whereCondition.workDate.lte = query.endDate
    }
  }

  const records = await prisma.attendance.findMany({
    where: whereCondition,
    orderBy: {
      workDate: 'desc',
    },
  })

  return records
}

/**
 * ดึงประวัติการเข้างานของทีมงาน
 * กฎ:
 * - Admin: เห็นประวัติของพนักงานทุกคนในระบบ
 * - Manager: เห็นเฉพาะประวัติของลูกทีมตนเอง (ผู้ใช้ที่มี managerId ตรงกับ id ของ Manager)
 */
export async function getTeamAttendance(
  currentUserId: string,
  currentUserRole: string,
  query: AttendanceQuery
) {
  const whereCondition: any = {}

  if (currentUserRole === 'ADMIN') {
    // Admin เห็นทุกคน
  } else if (currentUserRole === 'MANAGER') {
    // หาพนักงานที่เป็นลูกทีม (managerId = currentUserId)
    const subordinates = await prisma.user.findMany({
      where: { managerId: currentUserId },
      select: { id: true },
    })
    const subordinateIds = subordinates.map((u) => u.id)

    // ถ้าไม่มีลูกทีมเลย ให้คืนค่ารายการว่างเปล่า
    if (subordinateIds.length === 0) {
      return []
    }

    whereCondition.userId = { in: subordinateIds }
  } else {
    // พนักงานทั่วไปไม่มีสิทธิ์ดูประวัติของทีม
    throw new AppError('You do not have permission to access team attendance', 403)
  }

  // กรองตามช่วงวันที่ถ้ามีการส่งมา
  if (query.startDate || query.endDate) {
    whereCondition.workDate = {}
    if (query.startDate) {
      whereCondition.workDate.gte = query.startDate
    }
    if (query.endDate) {
      whereCondition.workDate.lte = query.endDate
    }
  }

  const records = await prisma.attendance.findMany({
    where: whereCondition,
    include: {
      user: {
        select: {
          id: true,
          employeeCode: true,
          firstName: true,
          lastName: true,
          role: true,
        },
      },
    },
    orderBy: {
      workDate: 'desc',
    },
  })

  return records
}
