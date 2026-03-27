const path = require("path");
const express = require("express");
const session = require("express-session");
const cors = require("cors");
const os = require("os");

const {
  MODULES,
  initDb,
  list,
  insert,
  update,
  remove,
  replaceAll,
  getStore,
  resetAndSeed,
  runRaw
} = require("./server/db");

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// ------------------- GLOBAL SAFETY -------------------
// Prevent silent crashes (you had zero protection)
process.on("unhandledRejection", err => {
  console.error("Unhandled Rejection:", err);
});
process.on("uncaughtException", err => {
  console.error("Uncaught Exception:", err);
});

// ------------------- MIDDLEWARE -------------------

app.use(cors({
  origin(origin, cb) {
    if (!origin) return cb(null, true);

    const allowed = (process.env.CORS_ORIGIN || "")
      .split(",")
      .map(s => s.trim())
      .filter(Boolean);

    const defaults = [
      "https://aatifakram.github.io",
      "beneficial-magic-production.up.railway.app"
    ];

    if (!allowed.length) return cb(null, true);

    return cb(null, allowed.includes(origin) || defaults.includes(origin));
  },
  credentials: true
}));

app.use(express.json({ limit: "10mb" }));

// Required behind Railway proxy
app.set("trust proxy", 1);

const isProd = String(process.env.NODE_ENV).toLowerCase() === "production";

app.use(session({
  name: "tps.sid",
  secret: process.env.SESSION_SECRET || "change-this-secret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: isProd ? "none" : "lax",
    secure: isProd
  }
}));

// ------------------- STATIC -------------------

app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname)));

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

// ------------------- HEALTH -------------------

app.get("/", (req, res) => {
  const indexPath = path.join(__dirname, "public", "index.html");
  res.sendFile(indexPath, (err) => {
    if (err) res.send("✅ Backend is live");
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    uptime: process.uptime(),
    time: new Date()
  });
});

// ------------------- AUTH -------------------

function authRequired(req, res, next) {
  if (!req.session.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

app.post("/api/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body || {};
    const users = await list("users");

    const user = users.find(u =>
      String(u.status).toLowerCase() === "active" &&
      u.username === username &&
      u.password === password
    );

    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    // Update lastLogin timestamp
    const now = new Date().toISOString().slice(0, 19).replace("T", " ");
    await update("users", user.id, { lastLogin: now });

    req.session.user = {
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      role: user.role
    };

    res.json({ user: req.session.user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Login failed" });
  }
});

app.post("/api/auth/signup", async (req, res) => {
  try {
    const { username, fullName, email, password } = req.body || {};
    if (!username || !password || !fullName) {
      return res.status(400).json({ error: "username, fullName and password are required" });
    }
    const users = await list("users");
    if (users.find(u => u.username === username)) {
      return res.status(409).json({ error: "Username already taken" });
    }
    const now = new Date().toISOString().slice(0, 19).replace("T", " ");
    const newUser = await insert("users", {
      username,
      fullName,
      role: "Staff",
      email: email || "",
      status: "Active",
      lastLogin: now,
      password
    });
    req.session.user = {
      id: newUser.id,
      username: newUser.username,
      fullName: newUser.fullName,
      role: newUser.role
    };
    res.status(201).json({ user: req.session.user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Signup failed" });
  }
});

app.post("/api/auth/logout", (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});

app.get("/api/auth/me", (req, res) => {
  res.json({ user: req.session.user || null });
});

// ------------------- STORE -------------------

app.get("/api/store", authRequired, async (req, res) => {
  try {
    res.json(await getStore());
  } catch (err) {
    res.status(500).json({ error: "Store fetch failed" });
  }
});

app.put("/api/store", authRequired, async (req, res) => {
  try {
    const body = req.body || {};
    for (const moduleName of Object.keys(MODULES)) {
      if (Array.isArray(body[moduleName])) {
        await replaceAll(moduleName, body[moduleName]);
      }
    }
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Store update failed" });
  }
});

// ------------------- ADMIN -------------------

app.post("/api/admin/reset", authRequired, async (req, res) => {
  try {
    await resetAndSeed();
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Reset failed" });
  }
});

// ------------------- MODULE CRUD -------------------

app.get("/api/modules/:moduleName", authRequired, async (req, res) => {
  try {
    const { moduleName } = req.params;
    if (!MODULES[moduleName]) {
      return res.status(404).json({ error: "Unknown module" });
    }
    res.json(await list(moduleName));
  } catch (err) {
    res.status(500).json({ error: "Fetch failed" });
  }
});

app.post("/api/modules/:moduleName", authRequired, async (req, res) => {
  try {
    const { moduleName } = req.params;
    if (!MODULES[moduleName]) {
      return res.status(404).json({ error: "Unknown module" });
    }
    const row = await insert(moduleName, req.body || {});
    res.status(201).json(row);
  } catch (err) {
    res.status(500).json({ error: "Insert failed" });
  }
});

app.put("/api/modules/:moduleName/:id", authRequired, async (req, res) => {
  try {
    const { moduleName, id } = req.params;
    if (!MODULES[moduleName]) {
      return res.status(404).json({ error: "Unknown module" });
    }
    const row = await update(moduleName, Number(id), req.body || {});
    if (!row) return res.status(404).json({ error: "Record not found" });
    res.json(row);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Update failed" });
  }
});

app.delete("/api/modules/:moduleName/:id", authRequired, async (req, res) => {
  try {
    const { moduleName, id } = req.params;
    if (!MODULES[moduleName]) {
      return res.status(404).json({ error: "Unknown module" });
    }
    await remove(moduleName, Number(id));
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Delete failed" });
  }
});

// ------------------- START SERVER -------------------

async function startServer() {
  try {
    await initDb();
    console.log("✅ Database connected");
  } catch (err) {
    console.error("⚠️ DB failed but server continues:", err.message);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

startServer();
