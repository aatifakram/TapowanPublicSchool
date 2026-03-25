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
