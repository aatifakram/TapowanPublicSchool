const { Pool } = require("pg");

const MODULES = {
  students: ["admissionNo", "rollNo", "fullName", "className", "gender", "dob", "parentName", "phone", "address", "photo", "status", "aadhar", "tc", "reportCard"],
  teachers: ["employeeNo", "fullName", "department", "qualification", "phone", "email", "joinDate"],
  classes: ["className", "section", "classTeacher", "roomNo", "capacity"],
  subjects: ["subjectCode", "subjectName", "className", "teacher", "credits"],
  attendance: ["date", "className", "studentName", "rollNo", "status", "arrivalTime", "departureTime", "remarks", "facePhoto"],
  teacherAttendance: ["date", "department", "teacherName", "status", "remarks"],
  exams: ["examName", "className", "subject", "studentName", "rollNo", "marksObtained", "maxMarks", "grade"],
  fees: ["studentName", "className", "rollNo", "term", "monthlyFee", "selectedBookIds", "totalFee", "paidAmount", "balance", "status", "paymentDate", "paymentMethod"],
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
  booksAndDress: ["className", "itemType", "itemName", "price", "term"]
};

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.PGSSLMODE === "disable" ? false : { rejectUnauthorized: false }
});

function normalizeRowKeys(moduleName, row) {
  if (!row || typeof row !== "object") return row;
  const out = { ...row };
  const fields = MODULES[moduleName] || [];
  for (const f of fields) {
    if (out[f] !== undefined) continue;
    const lower = f.toLowerCase();
    if (out[lower] !== undefined) out[f] = out[lower];
  }
  return out;
}

function convertQuestionMarksToDollarParams(sql, paramsLength) {
  let i = 0;
  return sql.replace(/\?/g, () => {
    i += 1;
    return `$${i}`;
  });
}

async function runRaw(sql, params = []) {
  const converted = convertQuestionMarksToDollarParams(sql, params.length);
  return pool.query(converted, params);
}

async function createTable(tableName, fields) {
  const cols = fields.map((f) => `${f} TEXT`).join(", ");
  await pool.query(`CREATE TABLE IF NOT EXISTS ${tableName} (id SERIAL PRIMARY KEY, ${cols});`);
}

async function ensureColumns(tableName, fields) {
  const res = await pool.query(
    `SELECT column_name FROM information_schema.columns WHERE table_name = $1 AND column_name <> 'id'`,
    [tableName]
  );
  const existing = new Set(res.rows.map((r) => r.column_name.toLowerCase()));
  for (const field of fields) {
    if (!existing.has(field.toLowerCase())) {
     await pool.query(`ALTER TABLE ${tableName} ADD COLUMN IF NOT EXISTS ${field} TEXT;`);
    }
  }
}

async function seedIfEmpty() {
  const users = await pool.query("SELECT COUNT(*)::int AS c FROM users");
  const count = users.rows[0]?.c || 0;
  if (count > 0) return;

  const now = new Date().toISOString().slice(0, 19).replace("T", " ");
  const today = new Date().toISOString().slice(0, 10);

  await insert("students", { admissionNo: "ADM001", rollNo: "10A-01", fullName: "Aarav Sharma", className: "10-A", gender: "Male", dob: "2010-03-12", parentName: "Rohit Sharma", phone: "9876501234", address: "Sector 5", status: "Active", aadhar: "", tc: "", reportCard: "" });
  await insert("students", { admissionNo: "ADM002", rollNo: "9B-07", fullName: "Ananya Singh", className: "9-B", gender: "Female", dob: "2011-07-20", parentName: "Vikas Singh", phone: "9823401234", address: "Green Park", status: "Active", aadhar: "", tc: "", reportCard: "" });
  await insert("teachers", { employeeNo: "EMP100", fullName: "Neha Verma", department: "Science", qualification: "M.Sc", phone: "9900112233", email: "neha@school.com", joinDate: "2018-06-10" });
  await insert("teachers", { employeeNo: "EMP101", fullName: "Amit Kumar", department: "Math", qualification: "M.Ed", phone: "9900112244", email: "amit@school.com", joinDate: "2019-01-05" });
  await insert("classes", { className: "10", section: "A", classTeacher: "Neha Verma", roomNo: "204", capacity: "40" });
  await insert("subjects", { subjectCode: "MAT10", subjectName: "Mathematics", className: "10-A", teacher: "Amit Kumar", credits: "5" });
  await insert("attendance", { date: today, className: "10-A", studentName: "Aarav Sharma", rollNo: "10A-01", status: "Present", remarks: "On time" });
  await insert("teacherAttendance", { date: today, department: "Science", teacherName: "Neha Verma", status: "Present", remarks: "On time" });
  await insert("exams", { examName: "Mid Term", className: "10-A", subject: "Mathematics", studentName: "Aarav Sharma", rollNo: "10A-01", marksObtained: "84", maxMarks: "100", grade: "A" });
  await insert("fees", { studentName: "Aarav Sharma", className: "10-A", rollNo: "10A-01", term: "Q1", totalFee: "18000", paidAmount: "15000", balance: "3000", status: "Partial", paymentDate: today, paymentMethod: "Cash" });
  await insert("users", { username: "im_aatif", fullName: "System Admin", role: "Administrator", email: "admin@school.com", status: "Active", lastLogin: now, password: "Aatif@123" });
  await insert("users", { username: "principal", fullName: "School Principal", role: "Principal", email: "principal@school.com", status: "Active", lastLogin: now, password: "principal123" });
  await insert("timetable", { className: "10-A", day: "Monday", period: "1", subject: "Mathematics", teacher: "Amit Kumar", roomNo: "204" });
  await insert("notifications", { message: "Parent meeting on Friday 11 AM", type: "Announcement", date: today });
}

async function ensureDefaultAdmin() {
  const adminByUsername = await pool.query("SELECT * FROM users WHERE username = $1 LIMIT 1", ["im_aatif"]);
  const anyAdmin = await pool.query("SELECT * FROM users WHERE lower(role) = 'administrator' LIMIT 1");

  const now = new Date().toISOString().slice(0, 19).replace("T", " ");
  const adminRow = adminByUsername.rows[0];
  const anyRow = anyAdmin.rows[0];

  if (!adminRow) {
    await insert("users", {
      username: "im_aatif",
      fullName: "System Admin",
      role: "Administrator",
      email: "admin@school.com",
      status: "Active",
      lastLogin: now,
      password: "Aatif@123"
    });
  }

  if (anyRow && anyRow.username !== "im_aatif") {
    await pool.query("UPDATE users SET username = $1, password = $2 WHERE id = $3", ["im_aatif", "Aatif@123", anyRow.id]);
  }
}

async function resetAndSeed() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    for (const moduleName of Object.keys(MODULES)) {
      await client.query(`TRUNCATE ${moduleName} RESTART IDENTITY;`);
    }
    await client.query("COMMIT");
    // seedIfEmpty must run outside the transaction (it uses pool directly)
    await seedIfEmpty();
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}

async function purgeDemoData() {
  for (const tbl of ["schoolInvestments", "schoolIncome", "schoolExpenses"]) {
    try {
      await pool.query("DELETE FROM " + tbl + " WHERE \"isDemo\" IN ('1','true') OR (\"isDemo\" IS NOT NULL AND \"isDemo\" NOT IN ('','0','false'))");
    } catch (e) { /* column may not exist - safe to ignore */ }
  }
}

async function initDb() {
  for (const [tableName, fields] of Object.entries(MODULES)) {
    await createTable(tableName, fields);
    await ensureColumns(tableName, fields);
  }
  await seedIfEmpty();
  await purgeDemoData();
  await ensureDefaultAdmin();
}

async function list(moduleName) {
  const res = await pool.query(`SELECT * FROM ${moduleName} ORDER BY id DESC`);
  return res.rows.map((r) => normalizeRowKeys(moduleName, r));
}

async function insert(moduleName, payload) {
  const fields = MODULES[moduleName];
  const cols = fields.join(", ");
  const values = fields.map((f) => payload[f] ?? "");
  const placeholders = fields.map((_, i) => `$${i + 1}`).join(", ");

  const res = await pool.query(
    `INSERT INTO ${moduleName} (${cols}) VALUES (${placeholders}) RETURNING *`,
    values
  );
  return normalizeRowKeys(moduleName, res.rows[0]);
}

async function getById(moduleName, id) {
  const res = await pool.query(`SELECT * FROM ${moduleName} WHERE id = $1 LIMIT 1`, [id]);
  const row = res.rows[0];
  return row ? normalizeRowKeys(moduleName, row) : null;
}

async function update(moduleName, id, payload) {
  const fields = MODULES[moduleName] || [];
  const allowedKeys = Object.keys(payload || {}).filter((k) => fields.includes(k));
  if (!allowedKeys.length) return getById(moduleName, id);

  const setParts = allowedKeys.map((k, i) => `${k}=$${i + 1}`);
  const values = allowedKeys.map((k) => payload[k] ?? "");
  values.push(id);

  const res = await pool.query(
    `UPDATE ${moduleName} SET ${setParts.join(", ")} WHERE id=$${allowedKeys.length + 1} RETURNING *`,
    values
  );
  return res.rows[0] ? normalizeRowKeys(moduleName, res.rows[0]) : null;
}

async function remove(moduleName, id) {
  await pool.query(`DELETE FROM ${moduleName} WHERE id = $1`, [id]);
}

async function replaceAll(moduleName, rows) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query(`TRUNCATE ${moduleName} RESTART IDENTITY;`);
    for (const r of rows) {
      // reuse insert by calling pool; acceptable for this size
      await insert(moduleName, r);
    }
    await client.query("COMMIT");
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}

async function getStore() {
  const store = {};
  for (const m of Object.keys(MODULES)) {
    store[m] = await list(m);
  }
  return store;
}

module.exports = {
  pool,
  MODULES,
  initDb,
  list,
  insert,
  getById,
  update,
  remove,
  replaceAll,
  getStore,
  resetAndSeed,
  runRaw
};
