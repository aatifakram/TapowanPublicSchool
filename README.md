# School Management System (Full Working Local Server)

Complete school management system with:
- HTML
- CSS
- JavaScript (vanilla frontend + Node.js backend)
- SQL database (SQLite local file)

## Included Modules
- Dashboard
- Students
- Teachers
- Classes
- Subjects
- Attendance
- Teacher Attendance
- Exams & Results
- Fees
- Library
- Transport
- Hostel
- Payroll
- Users & Roles
- Timetable

## New Useful Features
- Frontend login/auth screen with session state
- Role/user display and logout support
- Export CSV for every module
- Export PDF for every module
- Printable templates:
  - Student ID cards
  - Exam report cards
  - Fee invoices
- Face recognition attendance (frontend camera-based):
  - Enroll face embeddings per student/teacher
  - Mark attendance as present/late/leave
  - Works in `Attendance` and `Teacher Attendance` views

## Run Full System (Local Server)
1. Open terminal in this folder.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start server:
   ```bash
   npm start
   ```
4. Open:
   - `http://localhost:3000`

All data is stored in SQL database file: `server/school.db`

## Face Recognition Notes
- Camera permission is required in browser.
- First time, enter name + class/department and capture to enroll.
- After enrollment, captured face is matched locally from browser storage.
- This is a frontend-only demo implementation, not a secure biometric production system.

## Login
- Admin: `im_aatif / Aatif@123`
- Principal: `principal / principal123`
- Sign up: available on auth screen (creates active `Staff` user)

## Notes
- Uses session-based authentication (`express-session`).
- Includes persistent CRUD for all modules through local server APIs.
- Face attendance works with camera + face embedding matching in browser and is persisted in DB-backed attendance tables.
- Existing `schema.sql` remains for MySQL reference, while this fully working local system runs on SQLite by default.

## Online Deployment (Vercel + Render + Railway)

### What this project uses
- Frontend (Vercel): static HTML/CSS/JS from `public/`
- Backend (Render): Express API from `server.js`
- Database (Railway): PostgreSQL using `DATABASE_URL`

### 1) Railway (Postgres)
1. Create a Postgres database on Railway.
2. Copy the connection string into an environment variable named `DATABASE_URL`.

### 2) Render (Backend)
1. Create a Web Service on Render using this GitHub repo.
2. Environment variables to set on Render:
   - `DATABASE_URL` (from Railway)
   - `SESSION_SECRET` (any strong random string)
   - `NODE_ENV=production`
3. Start command:
   - `npm start`

### 3) Vercel (Frontend)
1. Deploy the same GitHub repo on Vercel.
2. Use `public/` as your static content (Vercel will detect it automatically).
3. Important: your frontend must know where the backend is.
   - Open your deployed frontend with:
     - `?api=<YOUR_RENDER_BACKEND_BASE_URL>`
   - Example:
     - `https://your-school-app.vercel.app/?api=https://your-render-service.onrender.com`

### Login / Sessions
- The backend uses cookies (`express-session`).
- CORS + cookie settings are configured for cross-origin use when `NODE_ENV=production`.
