import { PrismaClient, Role } from '@prisma/client'
import * as argon2 from 'argon2'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting seed...')

  // --- Hash passwords for each role ---
  const adminHash = await argon2.hash('admin123')
  const managerHash = await argon2.hash('manager123')
  const employeeHash = await argon2.hash('employee123')

  // --- Create Admin user ---
  const admin = await prisma.user.upsert({
    where: { email: 'pimchanok@crewly.com' },
    update: {},
    create: {
      employeeCode: 'admin-001',
      email: 'pimchanok@crewly.com',
      passwordHash: adminHash,
      firstName: 'พิมพ์ชนก',
      lastName: 'วงศ์สว่าง',
      role: Role.ADMIN,
    },
  })

  const manager1 = await prisma.user.upsert({
    where: { email: 'somchai@crewly.com' },
    update: {},
    create: {
      employeeCode: 'emp-001',
      email: 'somchai@crewly.com',
      passwordHash: managerHash,
      firstName: 'สมชาย',
      lastName: 'ศรีสุวรรณ',
      role: Role.MANAGER,
    },
  })

  const manager2 = await prisma.user.upsert({
    where: { email: 'waraporn@crewly.com' },
    update: {},
    create: {
      employeeCode: 'emp-002',
      email: 'waraporn@crewly.com',
      passwordHash: managerHash,
      firstName: 'วราภรณ์',
      lastName: 'จันทร์เพ็ญ',
      role: Role.MANAGER,
    },
  })

    const manager3 = await prisma.user.upsert({
    where: { email: 'thanakorn@crewly.com' },
    update: {},
    create: {
      employeeCode: 'emp-003',
      email: 'thanakorn@crewly.com',
      passwordHash: managerHash,
      firstName: 'ธนากร',
      lastName: 'เกษมสุข',
      role: Role.MANAGER,
    },
  })

  const employee1 = await prisma.user.upsert({
    where: { email: 'kamonchanok@crewly.com' },
    update: {},
    create: {
      employeeCode: 'emp-004',
      email: 'kamonchanok@crewly.com',
      passwordHash: employeeHash,
      firstName: 'กมลชนก',
      lastName: 'รัตนวงศ์',
      role: Role.EMPLOYEE,
    },
  })
  
    const employee2 = await prisma.user.upsert({
    where: { email: 'piyaphong@crewly.com' },
    update: {},
    create: {
      employeeCode: 'emp-005',
      email: 'piyaphong@crewly.com',
      passwordHash: employeeHash,
      firstName: 'ปิยะพงษ์',
      lastName: 'แก้วมณี',
      role: Role.EMPLOYEE,
    },
  })
  
    const employee3 = await prisma.user.upsert({
    where: { email: 'naphatsorn@crewly.com' },
    update: {},
    create: {
      employeeCode: 'emp-006',
      email: 'naphatsorn@crewly.com',
      passwordHash: employeeHash,
      firstName: 'นภัสสร',
      lastName: 'ใจดี',
      role: Role.EMPLOYEE,
    },
  })

    const employee4 = await prisma.user.upsert({
    where: { email: 'apichat@crewly.com' },
    update: {},
    create: {
      employeeCode: 'emp-007',
      email: 'apichat@crewly.com',
      passwordHash: employeeHash,
      firstName: 'อภิชาติ',
      lastName: 'มั่นคง',
      role: Role.EMPLOYEE,
    },
  })

    const employee5 = await prisma.user.upsert({
    where: { email: 'siriporn@crewly.com' },
    update: {},
    create: {
      employeeCode: 'emp-008',
      email: 'siriporn@crewly.com',
      passwordHash: employeeHash,
      firstName: 'ศิริพร',
      lastName: 'บุญมา',
      role: Role.EMPLOYEE,
    },
  })

    const employee6 = await prisma.user.upsert({
    where: { email: 'chayaphon@crewly.com' },
    update: {},
    create: {
      employeeCode: 'emp-009',
      email: 'chayaphon@crewly.com',
      passwordHash: employeeHash,
      firstName: 'ชยพล',
      lastName: 'พงษ์ไพร',
      role: Role.EMPLOYEE,
    },
  })

    const employee7 = await prisma.user.upsert({
    where: { email: 'nutthida@crewly.com' },
    update: {},
    create: {
      employeeCode: 'emp-010',
      email: 'nutthida@crewly.com',
      passwordHash: employeeHash,
      firstName: 'ณัฐธิดา',
      lastName: 'สุขสันต์',
      role: Role.EMPLOYEE,
    },
  })

    const employee8 = await prisma.user.upsert({
    where: { email: 'weerayut@crewly.com' },
    update: {},
    create: {
      employeeCode: 'emp-011',
      email: 'weerayut@crewly.com',
      passwordHash: employeeHash,
      firstName: 'วีรยุทธ',
      lastName: 'ทองดี',
      role: Role.EMPLOYEE,
    },
  })

    const employee9 = await prisma.user.upsert({
    where: { email: 'arunee@crewly.com' },
    update: {},
    create: {
      employeeCode: 'emp-012',
      email: 'arunee@crewly.com',
      passwordHash: employeeHash,
      firstName: 'อรุณี',
      lastName: 'แสงทอง',
      role: Role.EMPLOYEE,
    },
  })

    const employee10 = await prisma.user.upsert({
    where: { email: 'kittipat@crewly.com' },
    update: {},
    create: {
      employeeCode: 'emp-013',
      email: 'kittipat@crewly.com',
      passwordHash: employeeHash,
      firstName: 'กิตติพัฒน์',
      lastName: 'เจริญผล',
      role: Role.EMPLOYEE,
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
  const users = [admin, manager1, manager2, manager3, employee1, employee2, employee3, employee4, employee5, employee6, employee7, employee8, employee9, employee10]
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

  console.log('Seed complete!')
  console.log(`Users: ${users.length}`)
  console.log(`Leave Types: ${leaveTypes.length}`)
  console.log(`   Holidays: ${holidays.length}`)
}

main()
  .catch((e) => {
    console.error(e)
    throw e
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
