import { PrismaClient, Role } from '@prisma/client'
import * as argon2 from 'argon2'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // --- Hash passwords for each role ---
  const adminHash = await argon2.hash('Admin1234!')
  const managerHash = await argon2.hash('Manager1234!')
  const employeeHash = await argon2.hash('Employee1234!')

  // --- Create Admin user ---
  const admin = await prisma.user.upsert({
    where: { email: 'admin@crewly.test' },
    update: {},
    create: {
      employeeCode: 'EMP001',
      email: 'admin@crewly.test',
      passwordHash: adminHash,
      firstName: 'Admin',
      lastName: 'HR',
      role: Role.ADMIN,
    },
  })

  // --- Create Manager user ---
  const manager = await prisma.user.upsert({
    where: { email: 'manager@crewly.test' },
    update: {},
    create: {
      employeeCode: 'EMP002',
      email: 'manager@crewly.test',
      passwordHash: managerHash,
      firstName: 'John',
      lastName: 'Manager',
      role: Role.MANAGER,
    },
  })

  // --- Create Employee 1 (reports to manager) ---
  const emp1 = await prisma.user.upsert({
    where: { email: 'emp1@crewly.test' },
    update: {},
    create: {
      employeeCode: 'EMP003',
      email: 'emp1@crewly.test',
      passwordHash: employeeHash,
      firstName: 'Alice',
      lastName: 'Smith',
      role: Role.EMPLOYEE,
      managerId: manager.id,
    },
  })

  // --- Create Employee 2 (reports to manager) ---
  const emp2 = await prisma.user.upsert({
    where: { email: 'emp2@crewly.test' },
    update: {},
    create: {
      employeeCode: 'EMP004',
      email: 'emp2@crewly.test',
      passwordHash: employeeHash,
      firstName: 'Bob',
      lastName: 'Jones',
      role: Role.EMPLOYEE,
      managerId: manager.id,
    },
  })

  // --- Create Leave Types ---
  const sickLeave = await prisma.leaveType.upsert({
    where: { name: 'ลาป่วย' },
    update: {},
    create: { name: 'ลาป่วย', defaultQuotaDays: 30, isPaid: true },
  })

  const vacationLeave = await prisma.leaveType.upsert({
    where: { name: 'ลาพักร้อน' },
    update: {},
    create: { name: 'ลาพักร้อน', defaultQuotaDays: 10, isPaid: true },
  })

  const personalLeave = await prisma.leaveType.upsert({
    where: { name: 'ลากิจ' },
    update: {},
    create: { name: 'ลากิจ', defaultQuotaDays: 3, isPaid: false },
  })

  const leaveTypes = [sickLeave, vacationLeave, personalLeave]
  const users = [admin, manager, emp1, emp2]
  const currentYear = new Date().getFullYear()

  // --- Create LeaveBalance for each user × each leave type ---
  for (const user of users) {
    for (const leaveType of leaveTypes) {
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
  }

  // --- Create sample Thai Holidays for 2026 ---
  const holidays = [
    { holidayDate: '2026-01-01', name: 'วันปีใหม่' },
    { holidayDate: '2026-04-13', name: 'วันสงกรานต์' },
    { holidayDate: '2026-04-14', name: 'วันสงกรานต์' },
    { holidayDate: '2026-04-15', name: 'วันสงกรานต์' },
    { holidayDate: '2026-12-31', name: 'วันสิ้นปี' },
  ]

  for (const holiday of holidays) {
    await prisma.holiday.upsert({
      where: { holidayDate: holiday.holidayDate },
      update: {},
      create: holiday,
    })
  }

  console.log('✅ Seed complete!')
  console.log(`   Users: ${users.length}`)
  console.log(`   Leave Types: ${leaveTypes.length}`)
  console.log(`   Holidays: ${holidays.length}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
