const path = require("path");
const express = require("express");
const session = require("express-session");
const cors = require("cors");
const os = require("os");
const { MODULES, initDb, list, insert, remove, replaceAll, getStore, resetAndSeed, runRaw } = require("./server/db");

const app = express();
const PORT = 3000;
// DB initialization is async when using Postgres; routes are defined below.

app.use(cors({
  origin: "https://aatifakram.github.io/TapowanPublicSchool/",
  credentials: true
}));
app.use(express.json({ limit: "10mb" }));
const isProd = String(process.env.NODE_ENV).toLowerCase() === "production";
app.use(session({
  secret: process.env.SESSION_SECRET || "school-management-local-secret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: isProd ? "none" : "lax",
    secure: isProd
  }
}));

app.use(express.static(path.join(__dirname)));

// Serve ID-card templates that live inside your Cursor project assets folder.
// This lets the browser print window load template images reliably.
const templatesDir = path.join(__dirname, "assets");
// Local dev fallback (your template image was originally saved in Cursor storage).
const cursorTemplatesDir = path.join(
  os.homedir(),
  ".cursor",
  "projects",
  "c-Users-Admin-school-management-system-node-modules",
  "assets"
);

app.use("/templates", express.static(templatesDir));
app.use("/templates", express.static(cursorTemplatesDir));

function authRequired(req, res, next) {
  if (!req.session.user) return res.status(401).json({ error: "Unauthorized" });
  next();
}

app.post("/api/auth/login", async (req, res) => {
  const { username, password } = req.body || {};
  const users = await list("users");
  const user = users.find((u) =>
    String(u.status).toLowerCase() === "active" &&
    u.username === username &&
    u.password === password
  );
  if (!user) return res.status(401).json({ error: "Invalid credentials" });
  req.session.user = { id: user.id, username: user.username, fullName: user.fullName, role: user.role };
  const now = new Date().toISOString().slice(0, 19).replace("T", " ");
  const allUsers = users.map((u) => (u.id === user.id ? { ...u, lastLogin: now } : u));
  await replaceAll("users", allUsers);
  res.json({ user: req.session.user });
});

app.post("/api/auth/signup", async (req, res) => {
  const { username, password, fullName, email } = req.body || {};
  const cleanUsername = String(username || "").trim();
  const cleanPassword = String(password || "");
  const cleanFullName = String(fullName || "").trim();
  const cleanEmail = String(email || "").trim();

  if (!cleanUsername || !cleanPassword || !cleanFullName || !cleanEmail) {
    return res.status(400).json({ error: "All fields are required" });
  }
  if (!/^[a-zA-Z0-9_]{4,30}$/.test(cleanUsername)) {
    return res.status(400).json({ error: "Username must be 4-30 chars and only letters, numbers, underscore" });
  }
  if (cleanPassword.length < 8 || !/[A-Z]/.test(cleanPassword) || !/[a-z]/.test(cleanPassword) || !/[0-9]/.test(cleanPassword) || !/[^A-Za-z0-9]/.test(cleanPassword)) {
    return res.status(400).json({ error: "Password must be 8+ chars with upper, lower, number, special char" });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    return res.status(400).json({ error: "Invalid email address" });
  }

  const users = await list("users");
  if (users.some((u) => String(u.username).toLowerCase() === cleanUsername.toLowerCase())) {
    return res.status(409).json({ error: "Username already exists" });
  }
  if (users.some((u) => String(u.email).toLowerCase() === cleanEmail.toLowerCase())) {
    return res.status(409).json({ error: "Email already exists" });
  }

  const now = new Date().toISOString().slice(0, 19).replace("T", " ");
  const user = await insert("users", {
    username: cleanUsername,
    fullName: cleanFullName,
    role: "Staff",
    email: cleanEmail,
    status: "Active",
    lastLogin: now,
    password: cleanPassword
  });

  req.session.user = { id: user.id, username: user.username, fullName: user.fullName, role: user.role };
  res.status(201).json({ user: req.session.user });
});

app.post("/api/auth/logout", (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});

app.get("/api/auth/me", (req, res) => {
  res.json({ user: req.session.user || null });
});

app.get("/api/store", authRequired, async (_req, res) => {
  res.json(await getStore());
});

app.put("/api/store", authRequired, async (req, res) => {
  const body = req.body || {};
  for (const moduleName of Object.keys(MODULES)) {
    if (Array.isArray(body[moduleName])) await replaceAll(moduleName, body[moduleName]);
  }
  res.json({ ok: true });
});

app.get("/api/modules/:moduleName", authRequired, async (req, res) => {
  const { moduleName } = req.params;
  if (!MODULES[moduleName]) return res.status(404).json({ error: "Unknown module" });
  res.json(await list(moduleName));
});

app.post("/api/modules/:moduleName", authRequired, async (req, res) => {
  const { moduleName } = req.params;
  if (!MODULES[moduleName]) return res.status(404).json({ error: "Unknown module" });
  const row = await insert(moduleName, req.body || {});
  res.status(201).json(row);
});

app.put("/api/modules/:moduleName/:id", authRequired, async (req, res) => {
  const { moduleName, id } = req.params;
  if (!MODULES[moduleName]) return res.status(404).json({ error: "Unknown module" });
  const payload = req.body || {};

  const fields = MODULES[moduleName];
  const setFields = fields.filter((f) => Object.prototype.hasOwnProperty.call(payload, f));
  if (!setFields.length) return res.status(400).json({ error: "No valid fields to update" });

  const setClause = setFields.map((f) => `${f} = ?`).join(", ");
  const params = setFields.map((f) => payload[f]).concat([Number(id)]);
  await runRaw(`UPDATE ${moduleName} SET ${setClause} WHERE id = ?`, params);
  res.json({ ok: true });
});

app.delete("/api/modules/:moduleName/:id", authRequired, async (req, res) => {
  const { moduleName, id } = req.params;
  if (!MODULES[moduleName]) return res.status(404).json({ error: "Unknown module" });

  // Keep modules consistent when deleting a primary record.
  if (moduleName === "students") {
    const student = (await list("students")).find((s) => s.id === Number(id));
    if (student?.fullName) {
      await runRaw("DELETE FROM attendance WHERE studentName = ? AND rollNo = ?", [student.fullName, student.rollNo]);
      await runRaw("DELETE FROM exams WHERE studentName = ? AND rollNo = ?", [student.fullName, student.rollNo]);
      await runRaw("DELETE FROM fees WHERE studentName = ? AND rollNo = ?", [student.fullName, student.rollNo]);
      await runRaw("DELETE FROM library WHERE issuedTo = ?", [student.fullName]);
      await runRaw("DELETE FROM transport WHERE studentName = ?", [student.fullName]);
      await runRaw("DELETE FROM hostel WHERE studentName = ?", [student.fullName]);
      await runRaw("DELETE FROM faceEmbeddings WHERE targetType = ? AND name = ?", ["students", student.fullName]);
    }
  }

  if (moduleName === "teachers") {
    const teacher = (await list("teachers")).find((t) => t.id === Number(id));
    if (teacher?.fullName) {
      await runRaw("DELETE FROM classes WHERE classTeacher = ?", [teacher.fullName]);
      await runRaw("DELETE FROM subjects WHERE teacher = ?", [teacher.fullName]);
      await runRaw("DELETE FROM teacherAttendance WHERE teacherName = ?", [teacher.fullName]);
      await runRaw("DELETE FROM timetable WHERE teacher = ?", [teacher.fullName]);
      await runRaw("DELETE FROM payroll WHERE employeeName = ?", [teacher.fullName]);
      await runRaw("DELETE FROM faceEmbeddings WHERE targetType = ? AND name = ?", ["teachers", teacher.fullName]);
    }
  }

  await remove(moduleName, Number(id));
  res.json({ ok: true });
});

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, message: "School management server running" });
});

app.post("/api/admin/reset", authRequired, async (req, res) => {
  if (String(req.session.user.role).toLowerCase() !== "administrator") {
    return res.status(403).json({ error: "Only administrator can reset system data" });
  }
  await resetAndSeed();
  res.json({ ok: true });
});

async function startServer() {
  await initDb();
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Server start failed:", err);
  process.exit(1);
});
