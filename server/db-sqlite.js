const path = require("path");
const Database = require("better-sqlite3");

const dbPath = path.join(__dirname, "school.db");
const db = new Database(dbPath);

const MODULES = {
  students: ["admissionNo", "rollNo", "fullName", "className", "gender", "dob", "parentName", "phone", "address", "photo", "status", "aadhar", "tc", "reportCard"],
  teachers: ["employeeNo", "fullName", "department", "qualification", "phone", "email", "joinDate"],
  classes: ["className", "section", "classTeacher", "roomNo", "capacity"],
  subjects: ["subjectCode", "subjectName", "className", "teacher", "credits"],
  attendance: ["date", "className", "studentName", "rollNo", "status", "arrivalTime", "departureTime", "remarks", "facePhoto"],
  teacherAttendance: ["date", "department", "teacherName", "status", "remarks"],
  exams: ["examName", "className", "subject", "studentName", "rollNo", "marksObtained", "maxMarks", "grade"],
  fees: ["studentName", "className", "rollNo", "term", "monthlyFee", "monthlyFeeLabel", "selectedBookIds", "totalFee", "paidAmount", "balance", "status", "paymentDate", "paymentMethod"],
  library: ["bookCode", "bookTitle", "author", "issuedTo", "issueDate", "returnDate", "status"],
  transport: ["routeName", "vehicleNo", "driverName", "studentName", "pickupPoint", "monthlyFee"],
  hostel: ["hostelName", "roomNo", "studentName", "warden", "checkInDate", "bedNo", "status"],
  payroll: ["employeeName", "designation", "month", "basicSalary", "allowances", "deductions", "netPay"],
  users: ["username", "fullName", "role", "email", "status", "lastLogin", "password"],
  timetable: ["className", "day", "period", "subject", "teacher", "roomNo"],
  notifications: ["message", "type", "date"],
  faceEmbeddings: ["targetType", "name", "tag", "descriptorJson"],
  schoolInvestments: ["title", "category", "amount", "expectedReturn", "bank", "startDate", "maturityDate", "notes", "status"],
  schoolIncome: ["date", "source", "category", "amount", "mode", "description"],
  schoolExpenses: ["date", "head", "category", "amount", "mode", "description"],
  booksAndDress: ["className", "itemType", "itemName", "price", "term"],
  feeStructures: ["className", "feeType", "amount", "term", "description"]
};

function runRaw(sql, params = []) {
  // SQLite uses `?` placeholders.
  const stmt = db.prepare(sql);
  return stmt.run(...params);
}

function createTable(tableName, fields) {
  const cols = fields.map((f) => `${f} TEXT`).join(", ");
  db.exec(`CREATE TABLE IF NOT EXISTS ${tableName} (id INTEGER PRIMARY KEY AUTOINCREMENT, ${cols});`);
}

function ensureColumns(tableName, fields) {
  const existing = db.prepare(`PRAGMA table_info(${tableName})`).all().map((r) => r.name);
  fields.forEach((field) => {
    if (!existing.includes(field)) db.exec(`ALTER TABLE ${tableName} ADD COLUMN ${field} TEXT`);
  });
}

function seedIfEmpty() {
  const count = db.prepare("SELECT COUNT(*) AS c FROM users").get().c;
  if (count > 0) return;
  const now = new Date().toISOString().slice(0, 19).replace("T", " ");
  const today = new Date().toISOString().slice(0, 10);

  insert("students", { admissionNo: "ADM001", rollNo: "10A-01", fullName: "Aarav Sharma", className: "10-A", gender: "Male", dob: "2010-03-12", parentName: "Rohit Sharma", phone: "9876501234", address: "Sector 5", status: "Active", aadhar: "", tc: "", reportCard: "" });
  insert("students", { admissionNo: "ADM002", rollNo: "9B-07", fullName: "Ananya Singh", className: "9-B", gender: "Female", dob: "2011-07-20", parentName: "Vikas Singh", phone: "9823401234", address: "Green Park", status: "Active", aadhar: "", tc: "", reportCard: "" });
  insert("teachers", { employeeNo: "EMP100", fullName: "Neha Verma", department: "Science", qualification: "M.Sc", phone: "9900112233", email: "neha@school.com", joinDate: "2018-06-10" });
  insert("teachers", { employeeNo: "EMP101", fullName: "Amit Kumar", department: "Math", qualification: "M.Ed", phone: "9900112244", email: "amit@school.com", joinDate: "2019-01-05" });
  insert("classes", { className: "10", section: "A", classTeacher: "Neha Verma", roomNo: "204", capacity: "40" });
  insert("subjects", { subjectCode: "MAT10", subjectName: "Mathematics", className: "10-A", teacher: "Amit Kumar", credits: "5" });
  insert("attendance", { date: today, className: "10-A", studentName: "Aarav Sharma", rollNo: "10A-01", status: "Present", remarks: "On time" });
  insert("teacherAttendance", { date: today, department: "Science", teacherName: "Neha Verma", status: "Present", remarks: "On time" });
  insert("exams", { examName: "Mid Term", className: "10-A", subject: "Mathematics", studentName: "Aarav Sharma", rollNo: "10A-01", marksObtained: "84", maxMarks: "100", grade: "A" });
  insert("fees", { studentName: "Aarav Sharma", className: "10-A", rollNo: "10A-01", term: "Q1", totalFee: "18000", paidAmount: "15000", balance: "3000", status: "Partial", paymentDate: today, paymentMethod: "Cash" });
  insert("users", { username: "im_aatif", fullName: "System Admin", role: "Administrator", email: "admin@school.com", status: "Active", lastLogin: now, password: "Aatif@123" });
  insert("users", { username: "principal", fullName: "School Principal", role: "Principal", email: "principal@school.com", status: "Active", lastLogin: now, password: "principal123" });
  insert("timetable", { className: "10-A", day: "Monday", period: "1", subject: "Mathematics", teacher: "Amit Kumar", roomNo: "204" });
  insert("notifications", { message: "Parent meeting on Friday 11 AM", type: "Announcement", date: today });
}

function ensureDefaultAdmin() {
  const adminByUsername = db.prepare("SELECT * FROM users WHERE username = ?").get("im_aatif");
  const anyAdmin = db.prepare("SELECT * FROM users WHERE lower(role) = 'administrator' LIMIT 1").get();
  const now = new Date().toISOString().slice(0, 19).replace("T", " ");

  if (!adminByUsername) {
    insert("users", {
      username: "im_aatif",
      fullName: "System Admin",
      role: "Administrator",
      email: "admin@school.com",
      status: "Active",
      lastLogin: now,
      password: "Aatif@123"
    });
  }

  if (anyAdmin && anyAdmin.username !== "im_aatif") {
    db.prepare("UPDATE users SET username = ?, password = ? WHERE id = ?").run("im_aatif", "Aatif@123", anyAdmin.id);
  }
}

function resetAndSeed() {
  const tx = db.transaction(() => {
    Object.keys(MODULES).forEach((moduleName) => {
      db.prepare(`DELETE FROM ${moduleName}`).run();
      db.prepare(`DELETE FROM sqlite_sequence WHERE name = ?`).run(moduleName);
    });
    seedIfEmpty();
  });
  tx();
}

function purgeDemoData() {
  ["schoolInvestments", "schoolIncome", "schoolExpenses"].forEach((tbl) => {
    try {
      db.prepare(`DELETE FROM ${tbl} WHERE isDemo = 1 OR isDemo = 'true' OR isDemo = '1'`).run();
    } catch (e) { /* table may not have isDemo column — safe to ignore */ }
  });
}

function initDb() {
  Object.entries(MODULES).forEach(([tableName, fields]) => {
    createTable(tableName, fields);
    ensureColumns(tableName, fields);
  });
  seedIfEmpty();
  purgeDemoData();
  ensureDefaultAdmin();
  return Promise.resolve();
}

function list(moduleName) {
  return db.prepare(`SELECT * FROM ${moduleName} ORDER BY id DESC`).all();
}

function insert(moduleName, payload) {
  const fields = MODULES[moduleName];
  const cols = fields.join(", ");
  const placeholders = fields.map((f) => `@${f}`).join(", ");
  const row = {};
  fields.forEach((f) => { row[f] = payload[f] ?? ""; });
  const stmt = db.prepare(`INSERT INTO ${moduleName} (${cols}) VALUES (${placeholders})`);
  const info = stmt.run(row);
  return db.prepare(`SELECT * FROM ${moduleName} WHERE id = ?`).get(info.lastInsertRowid);
}

function getById(moduleName, id) {
  return db.prepare(`SELECT * FROM ${moduleName} WHERE id = ?`).get(id);
}

function update(moduleName, id, payload) {
  const fields = MODULES[moduleName] || [];
  const allowedKeys = Object.keys(payload || {}).filter((k) => fields.includes(k));
  if (!allowedKeys.length) return getById(moduleName, id);

  const setSql = allowedKeys.map((k) => `${k}=@${k}`).join(", ");
  const stmt = db.prepare(`UPDATE ${moduleName} SET ${setSql} WHERE id=@id`);
  const row = { id: Number(id) };
  allowedKeys.forEach((k) => { row[k] = payload[k] ?? ""; });
  stmt.run(row);
  return getById(moduleName, id);
}

function remove(moduleName, id) {
  const stmt = db.prepare(`DELETE FROM ${moduleName} WHERE id = ?`);
  return stmt.run(id);
}

function replaceAll(moduleName, rows) {
  const tx = db.transaction(() => {
    db.prepare(`DELETE FROM ${moduleName}`).run();
    rows.forEach((r) => insert(moduleName, r));
  });
  tx();
}

function getStore() {
  const store = {};
  Object.keys(MODULES).forEach((m) => { store[m] = list(m); });
  return store;
}

module.exports = { db, MODULES, initDb, list, insert, getById, update, remove, replaceAll, getStore, resetAndSeed, runRaw, seedIfEmpty };

