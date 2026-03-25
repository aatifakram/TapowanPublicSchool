
const path = require("path");
const express = require("express");
const session = require("express-session");
const cors = require("cors");
const os = require("os");
const { MODULES, initDb, list, insert, remove, replaceAll, getStore, resetAndSeed, runRaw } = require("./server/db");

const app = express();
const PORT = 3000;

/* =========================
   🔥 CRITICAL FIX
========================= */
app.set("trust proxy", 1); // REQUIRED for Render (HTTPS)

/* =========================
   CORS (FINAL)
========================= */
app.use(cors({
  origin: [
    "https://aatifakram.github.io",
    "https://tapowanpublicschool-o1s2.onrender.com"
  ],
  credentials: true
}));

app.use(express.json({ limit: "10mb" }));

/* =========================
   SESSION (FINAL FIX)
========================= */
app.use(session({
  name: "connect.sid",
  secret: process.env.SESSION_SECRET || "super-secret-key",
  resave: false,
  saveUninitialized: false,
  proxy: true,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: "none",   // 🔥 MUST for cross-domain
    secure: true        // 🔥 MUST for HTTPS (Render)
  }
}));

/* =========================
   STATIC FILES
========================= */
app.use(express.static(path.join(__dirname)));

/* =========================
   TEMPLATE PATHS
========================= */
const templatesDir = path.join(__dirname, "assets");

const cursorTemplatesDir = path.join(
  os.homedir(),
  ".cursor",
  "projects",
  "c-Users-Admin-school-management-system-node-modules",
  "assets"
);

app.use("/templates", express.static(templatesDir));
app.use("/templates", express.static(cursorTemplatesDir));

/* =========================
   AUTH MIDDLEWARE
========================= */
function authRequired(req, res, next) {
  if (!req.session.user) return res.status(401).json({ error: "Unauthorized" });
  next();
}

/* =========================
   AUTH ROUTES
========================= */
app.post("/api/auth/login", async (req, res) => {
  const { username, password } = req.body || {};
  const users = await list("users");

  const user = users.find((u) =>
    String(u.status).toLowerCase() === "active" &&
    u.username === username &&
    u.password === password
  );

  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  req.session.user = {
    id: user.id,
    username: user.username,
    fullName: user.fullName,
    role: user.role
  };

  res.json({ user: req.session.user });
});

app.post("/api/auth/signup", async (req, res) => {
  const { username, password, fullName, email } = req.body || {};

  if (!username || !password || !fullName || !email) {
    return res.status(400).json({ error: "All fields required" });
  }

  const users = await list("users");

  if (users.some(u => u.username === username)) {
    return res.status(409).json({ error: "Username exists" });
  }

  const user = await insert("users", {
    username,
    password,
    fullName,
    email,
    role: "Staff",
    status: "Active"
  });

  req.session.user = {
    id: user.id,
    username: user.username,
    fullName: user.fullName,
    role: user.role
  };

  res.status(201).json({ user: req.session.user });
});

app.post("/api/auth/logout", (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});

app.get("/api/auth/me", (req, res) => {
  res.json({ user: req.session.user || null });
});

/* =========================
   MAIN ROUTES
========================= */
app.get("/api/store", authRequired, async (_req, res) => {
  res.json(await getStore());
});

app.put("/api/store", authRequired, async (req, res) => {
  const body = req.body || {};
  for (const moduleName of Object.keys(MODULES)) {
    if (Array.isArray(body[moduleName])) {
      await replaceAll(moduleName, body[moduleName]);
    }
  }
  res.json({ ok: true });
});

/* =========================
   HEALTH CHECK
========================= */
app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

/* =========================
   START SERVER
========================= */
async function startServer() {
  await initDb();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer().catch(err => {
  console.error("Server start failed:", err);
  process.exit(1);
});
