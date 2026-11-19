คุณคือ Senior Fullstack Developer ที่ช่วยสอน ฉันกำลังฝึก Fullstack และจะอ่านโค้ดที่คุณสร้างเพื่อเรียนรู้
ช่วยสร้างโปรเจกต์ชื่อ "Crewly" ซึ่งเป็นระบบ HRM แบบง่าย มี 2 โมดูลหลักคือ (1) เช็คอิน/เช็คเอาต์ และ (2) ระบบขอลา

## หลักการสำคัญ (ต้องทำตามทุกข้อ)
- เขียนโค้ดให้ "ง่าย อ่านง่าย ตรงไปตรงมา" ห้ามใช้เทคนิคซับซ้อนเกินจำเป็น (ไม่ใช้ generics ซับซ้อน, ไม่ทำ abstraction เกินความจำเป็น, ไม่ใช้ design pattern ที่ไม่จำเป็น)
- ตั้งชื่อตัวแปร/ฟังก์ชันเป็นภาษาอังกฤษที่สื่อความหมายชัดเจน และเขียน comment อธิบายว่าโค้ดส่วนนั้นทำอะไร โดยเฉพาะส่วน business logic
- ห้ามใช้ Docker

## Tech stack
- Frontend: React (Vite), TypeScript, Tailwind CSS
- Backend: Node.js, Express.js, TypeScript
- Package manager: pnpm (workspace)
- Database: PostgreSQL (ติดตั้งในเครื่อง ไม่ใช้ Docker) + Prisma ORM
- Auth/Security: JWT, Argon2
- Validation: Zod (ใช้ฝั่ง backend)
- เอกสาร API: Swagger/OpenAPI (ที่ /api-docs) และให้ import เข้า Postman ได้
- Version control: Git + GitHub (สร้าง .gitignore ให้ครบ)

## โครงสร้างโฟลเดอร์
crewly/
├── package.json, pnpm-workspace.yaml, tsconfig.base.json, .gitignore, README.md
├── backend/
│   ├── package.json, tsconfig.json, .env.example
│   ├── prisma/ (schema.prisma, seed.ts)
│   └── src/
│       ├── server.ts, app.ts
│       ├── config/env.ts            (validate .env ด้วย Zod)
│       ├── lib/ (prisma.ts, jwt.ts, password.ts)
│       ├── middlewares/ (authenticate.ts, authorize.ts, validate.ts, errorHandler.ts)
│       ├── utils/ (AppError.ts, date.ts)
│       └── modules/
│           ├── auth/ users/ attendance/ leave-types/ leave-requests/ holidays/
│           (แต่ละโมดูลมี 4 ไฟล์: xxx.routes.ts, xxx.controller.ts, xxx.service.ts, xxx.schema.ts)
└── frontend/
    ├── package.json, vite.config.ts, tailwind config, index.html
    └── src/
        ├── main.tsx, App.tsx
        ├── routes/ (ProtectedRoute.tsx, RoleRoute.tsx)
        ├── pages/ (Login, Dashboard, Attendance, MyLeaves, LeaveForm, Approvals, AdminUsers, AdminLeaveTypes, AdminHolidays)
        ├── components/ (Navbar, Sidebar, Button, Input, Table ฯลฯ แบบเรียบง่าย)
        ├── context/AuthContext.tsx
        ├── lib/api.ts               (wrapper ของ fetch แนบ token ให้อัตโนมัติ)
        └── types/

## Role (3 role)
ADMIN (HR), MANAGER, EMPLOYEE
- Employee: เช็คอิน/เอาต์, ดูประวัติของตัวเอง, ยื่น/ยกเลิกใบลาตัวเอง, ดูโควตาลาคงเหลือ
- Manager: ทำได้เหมือน Employee + ดูประวัติเข้างานของลูกทีม + อนุมัติ/ปฏิเสธใบลาของลูกทีม
- Admin: ทำได้ทุกอย่างของ Manager (กับทุกคน) + จัดการผู้ใช้ (สร้าง/แก้ role/กำหนดหัวหน้า/ปิดการใช้งาน), ประเภทลา/โควตา, วันหยุดบริษัท
- ลูกทีมของ Manager = ผู้ใช้ที่มี managerId ตรงกับ id ของ Manager คนนั้น
- ตรวจสิทธิ์ที่ backend ทุก endpoint (authenticate + authorize ตาม role) frontend แค่ซ่อนเมนู

## Database (Prisma schema) — วันที่ทั้งหมดที่เป็นแค่ "วัน" ให้เก็บเป็น String รูปแบบ "YYYY-MM-DD"
- User: id (uuid), employeeCode (unique), email (unique), passwordHash, firstName, lastName, role (enum ADMIN|MANAGER|EMPLOYEE), managerId (nullable, self-relation ตั้งชื่อ relation "ManagerSubordinates"), isActive (default true), createdAt
- Attendance: id, userId, workDate (String YYYY-MM-DD, เวลาไทย), checkInAt (DateTime), checkOutAt (DateTime?, nullable)  → @@unique([userId, workDate])
- LeaveType: id, name (unique), defaultQuotaDays (Int), isPaid (Boolean)
- LeaveBalance: id, userId, leaveTypeId, year (Int), quotaDays (Int), usedDays (Int default 0) → @@unique([userId, leaveTypeId, year])
- LeaveRequest: id, userId (ผู้ยื่น, relation "Requester"), leaveTypeId, approverId (nullable, relation "Approver"), startDate (String), endDate (String), totalDays (Int), reason, status (enum PENDING|APPROVED|REJECTED|CANCELLED, default PENDING), decidedAt (DateTime?), createdAt
- Holiday: id, holidayDate (String unique), name
- เพิ่ม index ที่ LeaveRequest(status, userId) และ Attendance(userId, workDate)

## กฎ Business logic
Auth:
- Login ด้วย email + password, ตรวจรหัสผ่านด้วย Argon2, ส่ง JWT (อายุ 8 ชั่วโมง, ใส่ userId กับ role) ฝั่ง frontend เก็บใน localStorage และส่งใน header `Authorization: Bearer <token>`
- ผู้ใช้ที่ isActive = false ห้าม login

Attendance:
- check-in: ได้วันละ 1 ครั้ง (workDate คำนวณจากเวลา Asia/Bangkok ด้วย Intl.DateTimeFormat ใน utils/date.ts ไม่ต้องใช้ไลบรารีวันที่)
- check-out: ต้อง check-in แล้วของวันนั้น และยังไม่เคย check-out
- GET ประวัติของตัวเอง (กรองตามช่วงวันที่ได้)
- GET ประวัติของลูกทีม (Manager เห็นเฉพาะลูกทีม, Admin เห็นทุกคน)

Leave:
- นับ totalDays = จำนวนวันระหว่าง startDate–endDate โดยไม่นับเสาร์-อาทิตย์ และไม่นับวันที่อยู่ในตาราง Holiday (เขียนเป็นฟังก์ชันเล็กๆ ใน utils/date.ts พร้อม comment อธิบายชัดเจน)
- ตอนยื่นใบลา ตรวจ: startDate <= endDate, totalDays > 0, โควตาคงเหลือพอ (quotaDays - usedDays >= totalDays), ไม่ซ้อนกับใบลา PENDING/APPROVED ที่มีอยู่
- ยกเลิกใบลาได้เฉพาะของตัวเองและสถานะ PENDING เท่านั้น
- ใบลาของใคร ใครอนุมัติ: Manager อนุมัติได้เฉพาะลูกทีมของตัวเอง, Admin อนุมัติได้ทุกคน, ห้ามอนุมัติใบลาของตัวเอง (แม้เป็น Admin) ถ้าผู้ยื่นเป็น Manager ให้ Admin เป็นคนอนุมัติ
- อนุมัติได้เฉพาะสถานะ PENDING ตอนอนุมัติให้ตั้ง status, approverId, decidedAt และบวก usedDays ใน LeaveBalance ภายใน prisma.$transaction เดียวกัน
- ปฏิเสธ: ตั้ง status = REJECTED, approverId, decidedAt (ไม่หักโควตา)

Admin:
- สร้างผู้ใช้ใหม่แล้วให้สร้าง LeaveBalance ของปีปัจจุบันให้อัตโนมัติตาม LeaveType ทุกประเภท
- จัดการ LeaveType (list/create/update) และ Holiday (list/create/delete)

## API (prefix /api)
- POST /auth/login, GET /auth/me
- Users (Admin): GET /users, POST /users, PATCH /users/:id
- Attendance: POST /attendance/check-in, POST /attendance/check-out, GET /attendance/me, GET /attendance/team
- LeaveTypes: GET /leave-types (ทุกคน), POST /leave-types, PATCH /leave-types/:id (Admin)
- Balances: GET /leave-balances/me
- LeaveRequests: POST /leave-requests, GET /leave-requests/me, PATCH /leave-requests/:id/cancel, GET /leave-requests/pending (Manager/Admin), PATCH /leave-requests/:id/approve, PATCH /leave-requests/:id/reject
- Holidays: GET /holidays (ทุกคน), POST /holidays, DELETE /holidays/:id (Admin)
- รูปแบบ error ให้เหมือนกันทั้งระบบ: { "message": "..." } พร้อม HTTP status ที่เหมาะสม (400, 401, 403, 404, 409)

## Frontend
- หน้าที่ต้องมี: Login, Dashboard (ปุ่ม check-in/out + สรุปโควตาลา), Attendance (ประวัติ), MyLeaves (ใบลาของฉัน + ปุ่มยกเลิก), LeaveForm (ยื่นใบลา), Approvals (Manager/Admin), Admin pages (Users, LeaveTypes, Holidays)
- ใช้ React Router, ProtectedRoute (ต้อง login) และ RoleRoute (จำกัดตาม role) เมนูแสดงตาม role
- จัดการ state ด้วย useState/useEffect และ AuthContext เท่านั้น เขียน loading/error state ให้เห็นชัดๆ
- ฟอร์มเป็น controlled component ธรรมดา แสดง error จาก backend
- Tailwind แบบเรียบง่าย สะอาด ใช้ได้บนมือถือพอประมาณ

## Seed ข้อมูล (prisma/seed.ts)
- Admin: admin@crewly.test / Admin1234!
- Manager: manager@crewly.test / Manager1234!
- Employee 2 คน (หัวหน้าเป็น Manager ด้านบน): emp1@crewly.test, emp2@crewly.test / Employee1234!
- LeaveType: ลาป่วย (30 วัน), ลาพักร้อน (10 วัน), ลากิจ (3 วัน)
- LeaveBalance ของปีปัจจุบันให้ทุกคน และ Holiday ตัวอย่าง 3-5 วัน

## ลำดับการทำงาน (สำคัญ: ทำทีเดียวเลยไม่ต้องหยุดเพื่อถามฉันแต่ละ phase)
Phase 1: ตั้งค่า pnpm workspace, backend + frontend เปล่าๆ ที่รันได้, Prisma schema, migration, seed
Phase 2: Auth (backend + หน้า Login + AuthContext + ProtectedRoute/RoleRoute)
Phase 3: Attendance (backend + หน้า)
Phase 4: Leave (backend + หน้า รวมหน้าอนุมัติ)
Phase 5: Admin (Users, LeaveTypes, Holidays)
Phase 6: Swagger (/api-docs) + README

ท้ายแต่ละ Phase ให้สรุป: (1) ไฟล์ที่สร้าง/แก้ (2) คำสั่งที่ต้องรัน (3) วิธีทดสอบว่าทำงานถูก
README ต้องอธิบาย: วิธีติดตั้ง PostgreSQL ในเครื่อง, ตั้งค่า .env, pnpm install, prisma migrate + seed, วิธีรัน dev, บัญชีทดสอบ, และวิธี import OpenAPI เข้า Postman

## ขอบเขตที่ "ไม่ต้องทำ" (เพื่อให้ง่าย)
ลาครึ่งวัน, GPS/IP ตอน check-in, OT/เงินเดือน, แจ้งเตือนอีเมล, Docker, unit test (ยังไม่ต้อง)