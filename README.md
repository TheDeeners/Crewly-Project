# Crewly — Simple Human Resource Management (HRM) System

ระบบบริหารจัดการทรัพยากรบุคคล (HRM) แบบเรียบง่าย สำหรับการเรียนรู้ Fullstack Development โดยเน้นการเขียนโค้ดที่ตรงไปตรงมา อ่านง่าย มีสถาปัตยกรรมชัดเจน ไม่ซับซ้อนเกินจำเป็น

---

## 🌟 ฟีเจอร์หลัก (Core Features)

1. **ระบบบันทึกเวลาเข้า-ออกงาน (Attendance Module)**
   - เช็คอิน (Check-in) และเช็คเอาต์ (Check-out) ได้วันละ 1 ครั้งตามเวลาประเทศไทย (`Asia/Bangkok`)
   - พนักงานตรวจสอบประวัติการเข้างานย้อนหลังของตนเองได้ พร้อมตัวกรองตามช่วงวันที่
   - หัวหน้างาน (Manager) ตรวจสอบประวัติการเข้างานของลูกทีมในสังกัดได้
   - ผู้ดูแลระบบ (Admin) ตรวจสอบประวัติการเข้างานของพนักงานทุกคนได้

2. **ระบบการขอลา (Leave Management Module)**
   - ยื่นใบลาโดยคำนวณจำนวนวันทำงานจริงอัตโนมัติ (ไม่นับวันเสาร์-อาทิตย์ และไม่นับวันหยุดบริษัท)
   - ตรวจสอบโควตาวันลาคงเหลือของปีปัจจุบันก่อนยื่น
   - ป้องกันการยื่นวันลาซ้อนทับกับใบลาอื่นที่รออนุมัติหรืออนุมัติแล้ว
   - พนักงานสามารถยกเลิกใบลาของตนเองได้หากยังอยู่ในสถานะรออนุมัติ (`PENDING`)
   - Manager พิจารณาอนุมัติ/ปฏิเสธใบลาของลูกทีมในสังกัด
   - Admin พิจารณาอนุมัติ/ปฏิเสธใบลาได้ทุกคน (ไม่อนุญาตให้อนุมัติใบลาของตัวเอง)
   - หักโควตาวันลาคงเหลืออัตโนมัติเมื่อได้รับการอนุมัติ (ใช้ Database Transaction เพื่อความถูกต้องของข้อมูล)

3. **ระบบผู้ดูแลระบบ (Admin Module)**
   - จัดการผู้ใช้งาน: เพิ่มพนักงานใหม่ กำหนดบทบาท (`ADMIN`, `MANAGER`, `EMPLOYEE`), กำหนดหัวหน้างาน, เปิด/ระงับการใช้งาน
   - เมื่อสร้างพนักงานใหม่ ระบบจะสร้างโควตาวันลาประจำปีปัจจุบันให้อัตโนมัติตามประเภทการลาทั้งหมด
   - จัดการประเภทการลา (`LeaveType`): กำหนดชื่อ โควตาวันลาต่อปี และเงื่อนไขการได้รับค่าจ้าง
   - จัดการวันหยุดบริษัท (`Holiday`): กำหนดวันหยุดตามประเพณี เพื่อใช้คัดออกจากวันลาอัตโนมัติ

4. **เอกสารและมาตรฐาน API (Swagger / OpenAPI)**
   - มีหน้า Swagger UI ที่ `/api-docs`
   - มีไฟล์ OpenAPI JSON ที่ `/api-docs.json` สามารถ Import เข้า Postman ได้ทันที

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, React Router v6
- **Backend**: Node.js, Express.js, TypeScript
- **Database & ORM**: PostgreSQL (ติดตั้งในเครื่อง ไม่ใช้ Docker), Prisma ORM
- **Authentication**: JWT (JSON Web Token อายุ 8 ชั่วโมง), Argon2 (Password Hashing)
- **Validation**: Zod (ตรวจสอบข้อมูล Request Body และ Query Parameters)
- **Package Manager**: pnpm (pnpm workspace จัดการ monorepo ระหว่าง backend และ frontend)

---

## 👥 บัญชีทดสอบในระบบ (Seed Users)

รหัสผ่านของทุกบัญชีถูกเข้ารหัสด้วย Argon2 และสร้างไว้ล่วงหน้าผ่าน `prisma/seed.ts`:

| บทบาท (Role) | อีเมล (Email) | รหัสผ่าน (Password) | รายละเอียด |
| :--- | :--- | :--- | :--- |
| **ADMIN (HR)** | `admin@crewly.test` | `Admin1234!` | ผู้ดูแลระบบและฝ่ายบุคคล จัดการผู้ใช้ ประเภทลา วันหยุด และอนุมัติใบลา |
| **MANAGER** | `manager@crewly.test` | `Manager1234!` | หัวหน้าทีม ดูแลลูกทีม (Alice และ Bob) ตรวจการเข้างานและอนุมัติใบลาลูกทีม |
| **EMPLOYEE 1** | `emp1@crewly.test` | `Employee1234!` | พนักงาน (Alice Smith) สังกัดหัวหน้า John Manager |
| **EMPLOYEE 2** | `emp2@crewly.test` | `Employee1234!` | พนักงาน (Bob Jones) สังกัดหัวหน้า John Manager |

---

## 📁 โครงสร้างโฟลเดอร์โปรเจกต์ (Folder Structure)

```text
crewly/
├── package.json               # Root scripts สำหรับรันทั้งโปรเจกต์
├── pnpm-workspace.yaml        # กำหนด workspaces (backend, frontend)
├── tsconfig.base.json         # การตั้งค่า TypeScript พื้นฐานที่แชร์ร่วมกัน
├── .gitignore                 # กำหนดไฟล์ที่ไม่ต้อง commit เข้า Git
├── README.md                  # เอกสารคู่มือการติดตั้งและการใช้งาน
├── backend/
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.example           # ตัวอย่าง Environment variables
│   ├── .env                   # ค่า Environment จริง (DATABASE_URL, JWT_SECRET, PORT)
│   ├── prisma/
│   │   ├── schema.prisma      # Prisma Database Schema (User, Attendance, Leave, etc.)
│   │   └── seed.ts            # สคริปต์จำลองข้อมูลตั้งต้น 4 ผู้ใช้, 3 ประเภทลา, 5 วันหยุด
│   └── src/
│       ├── app.ts             # ตั้งค่า Express App, Middleware, Routes, Swagger UI
│       ├── server.ts          # เริ่มต้น HTTP Server
│       ├── openapi.yaml       # เอกสาร OpenAPI 3.0 ครบทุก endpoint
│       ├── config/
│       │   └── env.ts         # ตรวจสอบความถูกต้องของ .env ด้วย Zod
│       ├── lib/
│       │   ├── prisma.ts      # PrismaClient Singleton Instance
│       │   ├── jwt.ts         # ฟังก์ชัน sign และ verify JWT Token
│       │   └── password.ts    # ฟังก์ชัน hash และ verify รหัสผ่านด้วย Argon2
│       ├── middlewares/
│       │   ├── authenticate.ts# ตรวจสอบ Bearer JWT Token
│       │   ├── authorize.ts   # ตรวจสอบสิทธิ์ตามบทบาท (Role-based access control)
│       │   ├── validate.ts    # ตรวจสอบ Request Body ด้วย Zod Schema
│       │   └── errorHandler.ts# Global Error Handler คืนค่า { "message": "..." }
│       ├── utils/
│       │   ├── AppError.ts    # Custom Error Class พร้อม HTTP Status Code
│       │   └── date.ts        # ฟังก์ชันคำนวณวันเวลาไทยและนับวันทำงานไม่รวมวันหยุด
│       └── modules/
│           ├── auth/          # Login และ ดูข้อมูลโปรไฟล์ตนเอง
│           ├── users/         # จัดการผู้ใช้สำหรับ Admin
│           ├── attendance/    # เช็คอิน เช็คเอาต์ และดูประวัติเข้างาน
│           ├── leave-types/   # ประเภทการลา
│           ├── leave-requests/# ยื่นใบลา ดูโควตา ยกเลิก อนุมัติ และปฏิเสธ
│           └── holidays/      # จัดการวันหยุดบริษัท
└── frontend/
    ├── package.json
    ├── vite.config.ts         # Vite Config พร้อม Proxy `/api` ไปยัง Backend Port 3000
    ├── tailwind.config.js     # การตั้งค่า Tailwind CSS
    ├── index.html
    └── src/
        ├── main.tsx           # Entry point ของ React
        ├── App.tsx            # React Router และจัดการ Route ทั้งหมด
        ├── lib/
        │   └── api.ts         # Fetch wrapper แนบ Authorization Bearer token ให้อัตโนมัติ
        ├── context/
        │   └── AuthContext.tsx# จัดการ Session การล็อกอิน, ข้อมูลผู้ใช้, และบันทึก Token
        ├── routes/
        │   ├── ProtectedRoute.tsx # ป้องกัน Route ต้องล็อกอินก่อนเข้าถึง
        │   └── RoleRoute.tsx      # จำกัดการเข้าถึงตามบทบาท (ADMIN, MANAGER, etc.)
        ├── components/
        │   ├── Navbar.tsx     # แถบเมนูด้านบน แสดงชื่อผู้ใช้ บทบาท และปุ่มออกจากระบบ
        │   ├── Sidebar.tsx    # เมนูด้านข้าง แสดงเมนูตามสิทธิ์ของแต่ละบทบาท
        │   ├── Button.tsx     # ปุ่ม UI พร้อม Loading state
        │   ├── Input.tsx      # ช่องกรอกข้อมูลพร้อมข้อความแจ้งเตือน Error
        │   └── Table.tsx      # ตารางแสดงข้อมูลแบบอ่านง่าย
        ├── pages/
        │   ├── Login.tsx          # หน้าเข้าสู่ระบบ
        │   ├── Dashboard.tsx      # แดชบอร์ด: ปุ่มเช็คอิน/เช็คเอาต์ และสรุปโควตาลา
        │   ├── Attendance.tsx     # ประวัติการเข้างาน (ของฉัน / ของทีม) พร้อมตัวกรองวันที่
        │   ├── MyLeaves.tsx       # ประวัติใบลาของฉัน และปุ่มยกเลิกใบลา
        │   ├── LeaveForm.tsx      # ฟอร์มยื่นคำขอลาใหม่
        │   ├── Approvals.tsx      # หน้าพิจารณาอนุมัติ/ปฏิเสธใบลา (Manager & Admin)
        │   ├── AdminUsers.tsx     # หน้าจัดการผู้ใช้ (Admin)
        │   ├── AdminLeaveTypes.tsx# หน้าจัดการประเภทการลา (Admin)
        │   └── AdminHolidays.tsx  # หน้าจัดการวันหยุดบริษัท (Admin)
        └── types/
            └── index.ts       # TypeScript Interfaces ทั้งหมด
```

---

## 💻 คู่มือการติดตั้งและเริ่มใช้งานแบบทีละขั้นตอน (Step-by-Step Guide)

### ขั้นตอนที่ 1: ติดตั้ง PostgreSQL บนเครื่องของคุณ (ไม่ใช้ Docker)

#### สำหรับ Windows:
1. ดาวน์โหลดตัวติดตั้ง PostgreSQL จากเว็บไซต์ทางการ: [https://www.postgresql.org/download/windows/](https://www.postgresql.org/download/windows/)
2. รันตัวติดตั้ง (Installer) เลือกติดตั้ง PostgreSQL Server และ pgAdmin (หรือ Command Line Tools)
3. กำหนดรหัสผ่านสำหรับ user `postgres` (เช่น `postgres` หรือ `password`) และจดจำรหัสผ่านนี้ไว้
4. Port ค่าเริ่มต้นคือ `5432`
5. เปิดโปรแกรม **pgAdmin 4** หรือเปิด Terminal / PowerShell แล้วสร้างฐานข้อมูลชื่อ `crewly_db`:
   ```bash
   # หากใช้ command line (psql)
   psql -U postgres
   # ป้อนรหัสผ่านที่คุณตั้งไว้ จากนั้นพิมพ์คำสั่ง:
   CREATE DATABASE crewly_db;
   \q
   ```

#### สำหรับ macOS:
```bash
# ติดตั้งผ่าน Homebrew
brew install postgresql@16
brew services start postgresql@16

# สร้างฐานข้อมูล
createdb crewly_db
```

#### สำหรับ Linux (Ubuntu/Debian):
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo -u postgres psql -c "CREATE DATABASE crewly_db;"
```

---

### ขั้นตอนที่ 2: ติดตั้ง Node.js และ pnpm

1. ตรวจสอบว่าติดตั้ง **Node.js** (แนะนำเวอร์ชัน 18 ขึ้นไป หรือ 20 LTS):
   ```bash
   node -v
   ```
2. ติดตั้ง **pnpm** (หากยังไม่มี):
   ```bash
   npm install -g pnpm
   pnpm -v
   ```

---

### ขั้นตอนที่ 3: ตั้งค่า Environment Variables (`.env`)

เปิดโฟลเดอร์ `backend/` แล้วคัดลอกไฟล์ `.env.example` ไปเป็น `.env`:
```bash
cd backend
cp .env.example .env
```
*(บน Windows PowerShell ใช้คำสั่ง: `Copy-Item .env.example .env`)*

เปิดไฟล์ `backend/.env` และตรวจสอบค่าการเชื่อมต่อฐานข้อมูลให้ตรงกับ PostgreSQL ในเครื่องของคุณ:
```env
# รูปแบบ: postgresql://<username>:<password>@localhost:5432/<database_name>
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/crewly_db"

# คีย์ความลับสำหรับออก JWT Token (ควรเป็นสตริงที่มีความยาวอย่างน้อย 16 ตัวอักษร)
JWT_SECRET="crewly-super-secret-jwt-key-for-development-change-in-prod"

PORT=3000
NODE_ENV=development
```

---

### ขั้นตอนที่ 4: ติดตั้ง Dependencies ทั้งหมด

กลับมาที่โฟลเดอร์หลัก (`crewly/`) แล้วสั่งติดตั้ง Dependencies สำหรับทั้ง Workspace:
```bash
# ติดตั้ง dependencies ทั้งโปรเจกต์
pnpm install
```

---

### ขั้นตอนที่ 5: รัน Database Migration และ Seed ข้อมูล

1. สั่งสร้างตารางในฐานข้อมูลผ่าน Prisma Migration:
   ```bash
   pnpm --filter backend db:migrate
   ```
   *(เมื่อมีข้อความถามชื่อ migration ให้พิมพ์เช่น `init`)*

2. สั่งรัน Seed ข้อมูลผู้ใช้ทดสอบ 4 คน, ประเภทการลา 3 แบบ, โควตาวันลา และวันหยุดตัวอย่าง:
   ```bash
   pnpm --filter backend db:seed
   ```
   ผลลัพธ์จะแสดง:
   ```text
   🌱 Starting seed...
   ✅ Seed complete!
      Users: 4
      Leave Types: 3
      Holidays: 5
   ```

---

### ขั้นตอนที่ 6: วิธีรัน Development Server

คุณสามารถรัน Backend และ Frontend พร้อมกันได้:

**เปิด Terminal ที่ 1 (รัน Backend Server):**
```bash
pnpm --filter backend dev
```
Backend จะทำงานที่: [http://localhost:3000](http://localhost:3000)

**เปิด Terminal ที่ 2 (รัน Frontend Vite Dev Server):**
```bash
pnpm --filter frontend dev
```
Frontend จะทำงานที่: [http://localhost:5173](http://localhost:5173)

เปิดเว็บเบราว์เซอร์ไปที่ [http://localhost:5173](http://localhost:5173) แล้วเข้าสู่ระบบด้วยบัญชีทดสอบด้านบนได้ทันที

---

## 📖 การดูเอกสาร API (Swagger / OpenAPI) และการนำเข้า Postman

### 1. ดูผ่าน Swagger UI (เว็บเบราว์เซอร์)
เมื่อเปิดรัน Backend Server แล้ว ให้เข้าไปที่:
👉 **[http://localhost:3000/api-docs](http://localhost:3000/api-docs)**

คุณจะเห็นรายการ API ทั้งหมด สามารถทดลองกด `Try it out` ยิง Request ได้โดยตรงบนเว็บ พร้อมทั้งมีปุ่ม `Authorize` สำหรับใส่ Bearer JWT Token

### 2. วิธี Import เข้า Postman
สามารถทำได้ 2 วิธีง่ายๆ:

- **วิธีที่ 1 (ผ่าน URL โดยตรง - แนะนำ):**
  1. เปิดโปรแกรม Postman
  2. คลิกปุ่ม **Import** ที่มุมบนซ้าย
  3. ใส่ URL: `http://localhost:3000/api-docs.json` ในช่องค้นหา/URL
  4. คลิก **Import** Postman จะสร้าง Collection ชื่อ **Crewly HRM API** พร้อม Endpoint ทั้งหมดให้อัตโนมัติ!

- **วิธีที่ 2 (ผ่านไฟล์):**
  1. เปิดโปรแกรม Postman คลิกปุ่ม **Import**
  2. ลากไฟล์ `backend/src/openapi.yaml` เข้าไปในหน้าต่าง Postman แล้วคลิกยืนยันการนำเข้า

---

## 🧪 การทดสอบฟังก์ชันต่างๆ ตามบทบาท (Test Scenarios)

### สถานการณ์ที่ 1: พนักงานทั่วไป (Alice Smith: `emp1@crewly.test`)
1. เข้าสู่ระบบด้วยอีเมล `emp1@crewly.test` รหัสผ่าน `Employee1234!`
2. ที่หน้า **Dashboard**: กดปุ่ม **📍 เช็คอิน (Check-in)** สังเกตเวลาและสถานะที่เปลี่ยนเป็น "เช็คอินแล้ว"
3. กดปุ่ม **🚪 เช็คเอาต์ (Check-out)** สังเกตเวลาเช็คเอาต์บันทึกเรียบร้อย
4. ไปที่เมนู **🗓️ ใบลาของฉัน** -> กด **+ ยื่นคำขอลาใหม่**
5. เลือกประเภท "ลาพักร้อน" เลือกช่วงวันที่ และระบุเหตุผล -> กดส่งคำขอ
6. ใบลาจะปรากฏในตารางด้วยสถานะสีเหลือง **รออนุมัติ (PENDING)** พร้อมปุ่มยกเลิก

### สถานการณ์ที่ 2: หัวหน้างาน (John Manager: `manager@crewly.test`)
1. ออกจากระบบ แล้วเข้าสู่ระบบใหม่ด้วย `manager@crewly.test` รหัสผ่าน `Manager1234!`
2. ที่เมนู **📋 ประวัติการเข้างาน**: จะมีแท็บ "ของทีมงาน" สำหรับดูเวลาเข้า-ออกงานของ Alice และ Bob
3. ที่เมนู **✅ อนุมัติใบลา**: จะเห็นคำขอลาของ Alice Smith ที่ยื่นไว้
4. กดปุ่ม **อนุมัติ**: ระบบจะบันทึกสถานะเป็น APPROVED และหักโควตาวันลาคงเหลือของ Alice โดยอัตโนมัติ

### สถานการณ์ที่ 3: ผู้ดูแลระบบ (Admin HR: `admin@crewly.test`)
1. เข้าสู่ระบบด้วย `admin@crewly.test` รหัสผ่าน `Admin1234!`
2. เมนูพิเศษฝั่ง Admin จะปรากฏขึ้น:
   - **👥 จัดการผู้ใช้**: เพิ่มพนักงานใหม่ กำหนดหัวหน้างาน และตั้งบทบาท
   - **📝 ประเภทการลา**: เพิ่มประเภทวันลาใหม่ หรือปรับโควตาเริ่มต้น
   - **🎉 วันหยุด**: กำหนดวันหยุดนักขัตฤกษ์เพื่อป้องกันการนับเป็นวันลา
   - **✅ อนุมัติใบลา**: สามารถอนุมัติหรือปฏิเสธใบลาของทุกคนในบริษัทได้ (ยกเว้นใบลาของตัวเอง)

---

## 🔒 กฎ Business Logic ที่สำคัญในระบบ

- **การคำนวณวันลา (`countWorkingDays`)**:
  ฟังก์ชันใน `backend/src/utils/date.ts` จะวนลูปตรวจนับวันทีละวัน โดยจะข้ามวันเสาร์ (`day === 6`), วันอาทิตย์ (`day === 0`), และข้ามวันที่ตรงกับตาราง `Holiday` ในฐานข้อมูล
- **การเช็คอิน/เอาต์**:
  วันที่ทำงาน (`workDate`) ถูกจัดเก็บในรูปแบบสตริง `"YYYY-MM-DD"` อิงตามโซนเวลาประเทศไทย (`Asia/Bangkok`) โดยใช้ JavaScript `Intl.DateTimeFormat` โดยตรง ไม่ต้องพึ่งพาไลบรารีภายนอก
- **การหักโควตาวันลา**:
  ทำผ่าน `prisma.$transaction` เพื่อให้แน่ใจว่าการเปลี่ยนสถานะใบลาเป็น `APPROVED` และการเพิ่มจำนวนวัน `usedDays` ในตาราง `LeaveBalance` จะสำเร็จพร้อมกันเสมอ ป้องกันปัญหาข้อมูลไม่สอดคล้องกัน
- **โครงสร้าง Error ที่เป็นมาตรฐาน**:
  ทุก Endpoint จะคืนค่าข้อผิดพลาดในรูปแบบ JSON เดียวกันเสมอ:
  ```json
  {
    "message": "คำอธิบายข้อผิดพลาดที่เกิดขึ้น"
  }
  ```
  พร้อม HTTP Status Code ที่ตรงตามมาตรฐานสากล (เช่น `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`, `409 Conflict`)
