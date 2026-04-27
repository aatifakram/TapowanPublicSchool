const path = require("path");
const fs = require("fs");
const express = require("express");
const session = require("express-session");
const cors = require("cors");
const os = require("os");
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { GoogleGenAI } = require('@google/genai');

const {
  db,
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

    const configured = (process.env.CORS_ORIGIN || "")
      .split(",")
      .map(s => s.trim())
      .filter(Boolean);

    const defaults = [
      "https://aatifakram.github.io",
      "https://tapowanpublicschool-production.up.railway.app"
    ];

    // If no CORS_ORIGIN configured, allow all origins
    if (!configured.length) return cb(null, true);

    // Always include defaults alongside configured origins
    const allowed = new Set([...configured, ...defaults]);
    return cb(null, allowed.has(origin));
  },
  credentials: true,
  allowedHeaders: ["Content-Type", "Bypass-Tunnel-Reminder", "Authorization"]
}));

app.use(express.json({ limit: "10mb" }));

// Required behind Railway proxy
app.set("trust proxy", 1);

const sessionStore = new session.MemoryStore();

// Shared configuration for both local and tunnel access
const getSessionConfig = (isSecure) => ({
  name: "tps.sid",
  secret: process.env.SESSION_SECRET || "change-this-secret",
  resave: false,
  saveUninitialized: false,
  store: sessionStore, // CRITICAL: Use the same store for both!
  cookie: {
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: isSecure ? "none" : "lax",
    secure: isSecure
  }
});

const secureSession = session(getSessionConfig(true));
const localSession = session(getSessionConfig(false));

app.use((req, res, next) => {
  const isSecure = req.secure || req.headers["x-forwarded-proto"] === "https";
  const isLocal = req.headers.host && (req.headers.host.includes("localhost") || req.headers.host.includes("127.0.0.1"));
  
  if (isSecure) {
    return secureSession(req, res, next);
  }
  return localSession(req, res, next);
});


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

app.get("/favicon.ico", (req, res) => res.status(204).end());

// ------------------- AUTH -------------------

// ------------------- ROLE HELPERS -------------------

const ROLE_LEVEL = {
  administrator: 4,
  principal: 3,
  staff: 3,
  teacher: 2,
  student: 1
};

function getRoleLevel(role) {
  return ROLE_LEVEL[String(role).toLowerCase()] || 0;
}

function isAdmin(user) {
  return String(user?.role).toLowerCase() === "administrator";
}

function isStaffOrAbove(user) {
  return getRoleLevel(user?.role) >= 3;
}

function isTeacherOrAbove(user) {
  return getRoleLevel(user?.role) >= 2;
}

function authRequired(req, res, next) {
  if (!req.session.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

function adminRequired(req, res, next) {
  if (!req.session.user) return res.status(401).json({ error: "Unauthorized" });
  if (!isAdmin(req.session.user)) return res.status(403).json({ error: "Admin access required" });
  next();
}

function canWrite(req, res, next) {
  if (!req.session.user) return res.status(401).json({ error: "Unauthorized" });
  if (getRoleLevel(req.session.user.role) < 2) {
    return res.status(403).json({ error: "You don't have permission to modify records" });
  }
  next();
}

function canDelete(req, res, next) {
  if (!req.session.user) return res.status(401).json({ error: "Unauthorized" });
  if (!isStaffOrAbove(req.session.user) && !isAdmin(req.session.user)) {
    return res.status(403).json({ error: "You don't have permission to delete records" });
  }
  next();
}

// Modules teachers can write to
const TEACHER_WRITE_MODULES = new Set(["attendance", "teacherAttendance"]);
// Modules only admin/staff can write to  
const ADMIN_STAFF_ONLY_MODULES = new Set(["users", "payroll", "fees", "dueManagement", "admissions", "schoolInvestments", "schoolIncome", "schoolExpenses", "booksAndDress", "feeStructures", "whatsappAlerts", "settings"]);
// Modules only admin can access at all
const ADMIN_ONLY_MODULES = new Set(["users"]);

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
      admissionNo: user.admissionNo,
      role: user.role
    };

    res.json({ user: req.session.user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Login failed" });
  }
});

// ── ADMISSION HELPERS ──
function sendAdmissionNotification(student) {
  console.log(`[Notification] Sending Admission SMS/WhatsApp to ${student.phone1} for student ${student.fullName}`);
  // STUB: Here you would integrate with Twilio, MSG91, or a WhatsApp Gateway.
}

app.get("/api/admissions/draft", authRequired, async (req, res) => {
  try {
    const userId = req.session.user.id;
    const all = await list("admissions");
    const draft = all.find(a => String(a.draftUserId) === String(userId) && a.isDraft === "true");
    res.json({ draft: draft || null });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch draft" });
  }
});

app.post("/api/admissions/draft", authRequired, async (req, res) => {
  try {
    const userId = req.session.user.id;
    const payload = req.body || {};
    payload.isDraft = "true";
    payload.draftUserId = userId;
    payload.status = "Draft";

    const all = await list("admissions");
    const existingDraft = all.find(a => String(a.draftUserId) === String(userId) && a.isDraft === "true");

    if (existingDraft) {
      await update("admissions", existingDraft.id, payload);
      res.json({ message: "Draft updated", id: existingDraft.id });
    } else {
      const row = await insert("admissions", payload);
      res.json({ message: "Draft created", id: row.id });
    }
  } catch (err) {
    console.error("Draft save failed:", err);
    res.status(500).json({ error: "Failed to save draft" });
  }
});

app.post("/api/auth/signup", async (req, res) => {
  try {
    const { username, fullName, email, password, admissionNo } = req.body || {};
    if (!username || !password || !fullName || !admissionNo) {
      return res.status(400).json({ error: "username, fullName, password and admissionNo are required" });
    }
    
    // Validate that the student exists with this admission number and name
    const students = await list("students");
    const matchedStudent = students.find(s => 
      s.admissionNo === admissionNo && 
      String(s.fullName).trim().toLowerCase() === String(fullName).trim().toLowerCase()
    );
    
    if (!matchedStudent) {
      return res.status(404).json({ error: "No student found matching this Full Name and Admission Number." });
    }

    const users = await list("users");
    if (users.find(u => u.username === username)) {
      return res.status(409).json({ error: "Username already taken" });
    }
    if (users.find(u => u.admissionNo === admissionNo)) {
      return res.status(409).json({ error: "An account already exists for this Admission Number" });
    }

    const now = new Date().toISOString().slice(0, 19).replace("T", " ");
    const newUser = await insert("users", {
      username,
      fullName,
      admissionNo,
      role: "Student",
      email: email || "",
      status: "Active",
      lastLogin: now,
      password
    });
    req.session.user = {
      id: newUser.id,
      username: newUser.username,
      fullName: newUser.fullName,
      admissionNo: newUser.admissionNo,
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

// Auth check handled below by detailed route

// ------------------- STORE -------------------

app.get("/api/store", authRequired, async (req, res) => {
  try {
    res.json(await getStore());
  } catch (err) {
    res.status(500).json({ error: "Store fetch failed" });
  }
});

// Proxy for Face Recognition Server (InsightFace) on port 8000
app.all("/api/face/*", async (req, res) => {
  const path = req.params[0] || "";
  const target = `http://localhost:8000/${path}`;
  try {
    const options = {
      method: req.method,
      headers: { "Content-Type": "application/json" }
    };
    if (!["GET", "HEAD"].includes(req.method)) {
      options.body = JSON.stringify(req.body);
    }
    const response = await fetch(target, options);
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    res.status(502).json({ error: "Face Recognition server unreachable on port 8000" });
  }
});

// The PUT /api/store endpoint has been removed for security reasons.
// Bulk overwrites from the frontend are highly dangerous and can lead to data loss or corruption.
// Use the individual module CRUD endpoints instead.

// ------------------- ADMIN -------------------

app.get("/api/settings", authRequired, async (req, res) => {
  try {
    res.json(await list("settings"));
  } catch (err) {
    res.status(500).json({ error: "Settings fetch failed" });
  }
});

app.post("/api/settings", authRequired, async (req, res) => {
  if (req.session.user.role !== "Administrator") return res.status(403).json({ error: "Admin only" });
  try {
    const { key, value, category } = req.body;
    const existing = (await list("settings")).find(s => s.key === key);
    if (existing) {
      await update("settings", existing.id, { value, category, updatedBy: req.session.user.username });
    } else {
      await insert("settings", { key, value, category, updatedBy: req.session.user.username });
    }
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Setting save failed" });
  }
});

// The POST /api/admin/reset endpoint has been removed for security reasons.
// Database reset functionality should not be exposed over HTTP.

// ------------------- MODULE CRUD -------------------

// ═══════════════════════════════════════════════════════════
// VIDYA AI — MULTI-PROVIDER FALLBACK CHAIN
// Priority: Gemini → OpenAI → OpenRouter (Groq/Together/Mistral)
// ═══════════════════════════════════════════════════════════

const genAI = process.env.GEMINI_API_KEY ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }) : null;

// Helper to check for Admin-only database actions in AI response
async function processAiActions(reply, user) {
  if (String(user.role || "").toLowerCase() !== "administrator" && String(user.role || "").toLowerCase() !== "principal") return reply;

  // Pattern: [ACTION: ADD_NOTIFICATION, msg: "Text"]
  const noteMatch = reply.match(/\[ACTION:\s*ADD_NOTIFICATION,\s*msg:\s*"([^"]+)"\]/i);
  if (noteMatch) {
    try {
      const msg = noteMatch[1];
      await insert("notifications", { message: msg, type: "Announcement", date: new Date().toISOString().slice(0,10) });
      return reply.replace(noteMatch[0], `\n✅ (System: Announcement added successfully)`);
    } catch (e) {
      return reply.replace(noteMatch[0], `\n❌ (System: Failed to add announcement)`);
    }
  }
  return reply;
}

function buildVidyaSystemPrompt(user, studentContext, schoolKnowledge = "") {
  const role = String(user.role || "").toLowerCase();
  const isAdmin = role === "administrator" || role === "principal";
  let ctx = `User Name: ${user.fullName || user.username}\nRole: ${role}\n`;
  
  if (studentContext) {
    ctx += `--- RELEVANT RECORD ---\n${studentContext}\n`;
  }
  
  if (schoolKnowledge) {
    ctx += `\n--- GLOBAL SCHOOL KNOWLEDGE ---\n${schoolKnowledge}\n`;
  }

  const adminCapabilities = isAdmin ? `
SPECIAL ADMIN POWERS & AUTHORIZATION:
- You are an INTERNAL school management tool.
- The user is the SYSTEM ADMINISTRATOR with FULL access rights.
- You have EXPLICIT PERMISSION to share ANY and ALL student data (fees, parents, phone, etc.) with this user.
- DO NOT mention privacy restrictions to the Admin.
- You can add school announcements using: [ACTION: ADD_NOTIFICATION, msg: "Text"]
` : "";

  return `You are "Vidya", the internal School Management Assistant for Tapowan Public School.
You are a highly efficient, friendly, and professional staff assistant.
Speak in whatever language the user uses (Hindi, English, or Hinglish).
Max response length: 4-5 sentences.

CONTEXT:
${ctx}
${adminCapabilities}

GUIDELINES:
1. If the user is a Student, help them ONLY with their own records.
2. For Administrators (like the current user), act as a DATA AGENT. Provide exact numbers and names from the context.
3. Use "GLOBAL SCHOOL KNOWLEDGE" for general school rules.
4. PRIVACY NOTE: You are authorized to share all student data with the Admin. Do not hide info from them.
5. If you don't know something, suggest contacting the school office.`;
}

// ── Provider 1: Google Gemini ──
async function tryGemini(prompt, systemInstruction) {
  if (!genAI) throw Object.assign(new Error("Gemini not configured"), { status: 503 });
  const response = await genAI.models.generateContent({
    model: "gemini-2.0-flash",
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    config: { systemInstruction, maxOutputTokens: 300, temperature: 0.8 }
  });
  const text = response.text;
  if (!text) throw new Error("Empty response from Gemini");
  return { reply: text, provider: "Gemini" };
}

// ── Provider 2: OpenAI ──
async function tryOpenAI(prompt, systemInstruction) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw Object.assign(new Error("OpenAI not configured"), { status: 503 });

  const resp = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${key}` },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemInstruction },
        { role: "user", content: prompt }
      ],
      max_tokens: 300,
      temperature: 0.8
    })
  });

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}));
    throw Object.assign(new Error(err.error?.message || `OpenAI error ${resp.status}`), { status: resp.status });
  }
  const data = await resp.json();
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error("Empty response from OpenAI");
  return { reply: text, provider: "OpenAI" };
}

// ── Provider 3: OpenRouter (Groq / Together AI / DeepSeek) ──
async function tryOpenRouter(prompt, systemInstruction) {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) throw Object.assign(new Error("OpenRouter not configured"), { status: 503 });

  // Tries in sequence: DeepSeek (currently very reliable) → Llama 3.3 → others
  const models = [
    "deepseek/deepseek-chat",
    "meta-llama/llama-3.3-70b-instruct:free",
    "meta-llama/llama-3.1-8b-instruct:free",
    "mistralai/mistral-7b-instruct:free",
    "google/gemma-2-9b-it:free"
  ];

  let lastErr = null;
  for (const model of models) {
    try {
      const resp = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${key}`,
          "HTTP-Referer": "https://tapowanpublicschool.com",
          "X-Title": "Tapowan AI Vidya"
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: systemInstruction },
            { role: "user", content: prompt }
          ],
          max_tokens: 300,
          temperature: 0.8
        })
      });

      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({}));
        lastErr = Object.assign(new Error(errData.error?.message || `OpenRouter error ${resp.status}`), { status: resp.status });
        continue;
      }
      const data = await resp.json();
      const text = data.choices?.[0]?.message?.content;
      if (!text) { lastErr = new Error("Empty response"); continue; }
      return { reply: text, provider: `OpenRouter (${model.split("/")[1]})` };
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr || new Error("All OpenRouter models failed");
}

// ── Main Chat Endpoint — Auto Fallback Chain ──
app.post("/api/ai/chat", authRequired, async (req, res) => {
  try {
    const { prompt, studentContext, preferredProvider } = req.body || {};
    if (!prompt) return res.status(400).json({ error: "Prompt is required" });

    const user = req.session.user;
    const role = String(user.role || "").toLowerCase();
    const isAdmin = role === "administrator" || role === "principal";
    
    // Fetch School Knowledge from settings
    let schoolKnowledge = "";
    try {
      const allSettings = await list("settings");
      const k = allSettings.find(s => s.key === "ai_school_knowledge");
      if (k) schoolKnowledge = k.value;
    } catch (e) {
      console.warn("[Vidya AI] Could not fetch school knowledge from settings");
    }

    let dynamicContext = "";

    // For Admins, inject live database summary
    if (isAdmin) {
      try {
        const students = await list("students");
        const fees = await list("fees");
        const notes = await list("notifications");
        
        // Debug Log
        const logPath = path.join(process.cwd(), "ai_debug.log");
        fs.appendFileSync(logPath, `\n[${new Date().toISOString()}] Admin Query: "${prompt}"\n`);

        // --- Active Student Memory & Lookup ---
        const admMatch = prompt.match(/(\d+\/\d+|ADM\d+)/i);
        let s = null;
        
        if (admMatch) {
          const query = admMatch[0].toLowerCase();
          s = students.find(x => String(x.admissionNo).toLowerCase() === query);
          fs.appendFileSync(logPath, `Searching by ID: ${query} -> Found: ${s?.fullName || "None"}\n`);
        } else {
          // Robust Name Search: Check for Maryam, Fatima, etc.
          const searchTerms = prompt.toLowerCase().split(" ").filter(t => t.length > 2);
          s = students.find(x => {
            const fullName = (x.fullName || "").toLowerCase();
            // Match if at least 2 significant words from prompt match the student name
            const matches = searchTerms.filter(t => fullName.includes(t));
            return matches.length >= 2 || (searchTerms.length === 1 && fullName.includes(searchTerms[0]));
          });
          fs.appendFileSync(logPath, `Searching by Name terms: ${searchTerms.join(",")} -> Found: ${s?.fullName || "None"}\n`);
        }

        // If not found in current prompt, check session memory
        if (!s && req.session.lastAiStudentId) {
          s = students.find(x => x.id === req.session.lastAiStudentId);
          if (s) fs.appendFileSync(logPath, `Using Session Memory: ${s.fullName}\n`);
        }

        if (s) {
          req.session.lastAiStudentId = s.id;
          const sf = fees.filter(f => String(f.admissionNo).toLowerCase() === String(s.admissionNo).toLowerCase());
          const totalDue = sf.reduce((sum, f) => sum + Number(f.balance || 0), 0);
          
          dynamicContext += `IMPORTANT: DATA BELOW IS LIVE FROM DATABASE.
[ACTIVE STUDENT RECORD]
Name: ${s.fullName}
Admission No: ${s.admissionNo}
Father: ${s.parentName || "N/A"}
Mother: ${s.motherName || "N/A"}
Class: ${s.className}
Phone: ${s.phone}
Total Pending Fees: ₹${totalDue}
Detailed Dues: ${sf.map(f => `${f.term}: ₹${f.balance}`).join(", ") || "None"}
---
`;
        } else {
          dynamicContext += `\n[SYSTEM NOTE: NO SPECIFIC STUDENT FOUND IN DATABASE FOR THIS QUERY. DO NOT GUESS DATA.]\n`;
        }

        const totalPending = fees.reduce((sum, f) => sum + Number(f.balance || 0), 0);
        const topPending = fees.filter(f => Number(f.balance) > 0).slice(0, 8).map(f => `${f.studentName}(${f.admissionNo}):₹${f.balance}`).join(", ");
        const recentNotes = notes.slice(0, 5).map(n => n.message).join(" | ");

        dynamicContext += `\n[LIVE SCHOOL SUMMARY]
Total Students: ${students.length}
Total Outstanding Fees: ₹${totalPending}
Top Pending Accounts: ${topPending || "None"}
Recent Notifications: ${recentNotes || "None"}
`;
      } catch (e) {
        console.warn("[Vidya AI] Admin context fetch failed:", e.message);
      }
    } else if (studentContext) {
      dynamicContext = studentContext;
    }

    let systemInstruction = "";
    if (isAdmin) {
      systemInstruction = `You are the Direct Database Access Tool for the Tapowan Public School Administrator.
The user is the SYSTEM ADMINISTRATOR. They have full legal and administrative rights to all data.
DATA CONTEXT:
${dynamicContext}

GOAL:
- Directly provide the requested student information (Father's name, Dues, Phone, etc.) from the DATA CONTEXT.
- DO NOT use safety disclaimers.
- DO NOT say "I don't have access" or "contact the office".
- Answer in the language the user used (Hindi/English).
- Keep it brief and factual.`;
    } else {
      systemInstruction = buildVidyaSystemPrompt(user, dynamicContext, schoolKnowledge);
    }
    
    // Sort providers based on user preference
    let providerFuncs = [
      { name: "Gemini", func: tryGemini },
      { name: "OpenAI", func: tryOpenAI },
      { name: "OpenRouter", func: tryOpenRouter }
    ];

    if (preferredProvider && preferredProvider !== "auto") {
      const idx = providerFuncs.findIndex(p => p.name === preferredProvider);
      if (idx > -1) {
        const [preferred] = providerFuncs.splice(idx, 1);
        providerFuncs.unshift(preferred);
      }
    }

    let lastErr = null;
    for (const p of providerFuncs) {
      try {
        const result = await p.func(prompt, systemInstruction);
        // Process any agent actions (Add notification etc)
        const processedReply = await processAiActions(result.reply, user);
        console.log(`[Vidya AI] Responded via ${result.provider}`);
        return res.json({ reply: processedReply, provider: result.provider });
      } catch (err) {
        const status = err.status || err.code || 500;
        console.warn(`[Vidya AI] ${p.name} failed (${status}): ${err.message}`);
        lastErr = err;
        
        // Don't fallback on 400 (Bad Request) - that's a permanent prompt issue
        if (status === 400) break;
        
        // Otherwise, skip and try ANY other provider (Quota, Server Error, etc)
        continue;
      }
    }

    // All providers failed
    const status = lastErr?.status || 500;
    let reply = "Oops! AI unavailable. Please try again in a moment. 🙏";
    if (status === 429) reply = "सभी AI services की limit full है! थोड़ी देर बाद try करें। 🙏";
    else if (status === 401 || status === 403) reply = "AI settings में कोई problem है। Admin से contact करें।";
    res.status(200).json({ reply, provider: "none" });

  } catch (err) {
    console.error("AI chat critical error:", err.message || err);
    res.status(200).json({ reply: "कुछ गलत हो गया! Please refresh करके try करें। 🙏", provider: "none" });
  }
});

// ── Provider Status Endpoint ──
app.get("/api/ai/status", authRequired, (req, res) => {
  res.json({
    gemini:      !!process.env.GEMINI_API_KEY,
    openai:      !!process.env.OPENAI_API_KEY,
    openrouter:  !!process.env.OPENROUTER_API_KEY,
    activeProviders: [
      process.env.GEMINI_API_KEY     ? "Gemini"     : null,
      process.env.OPENAI_API_KEY     ? "OpenAI"     : null,
      process.env.OPENROUTER_API_KEY ? "OpenRouter" : null,
    ].filter(Boolean)
  });
});

app.get("/api/modules/:moduleName", authRequired, async (req, res) => {
  try {
    const { moduleName } = req.params;
    if (!MODULES[moduleName]) {
      return res.status(404).json({ error: "Unknown module" });
    }
    // Students can only access limited modules
    const user = req.session.user;
    const role = String(user.role).toLowerCase();
    if (role === "student" && ADMIN_ONLY_MODULES.has(moduleName)) {
      return res.status(403).json({ error: "Access denied" });
    }
    res.json(await list(moduleName));
  } catch (err) {
    res.status(500).json({ error: "Fetch failed" });
  }
});

app.get("/api/auth/me", async (req, res) => {
  try {
    const user = req.session.user;
    if (!user) return res.json({ user: null });
    
    const role = String(user.role).toLowerCase();
    const roleColors = { administrator: "#dc2626", principal: "#7c3aed", staff: "#2563eb", teacher: "#059669", student: "#d97706" };
    
    return res.json({ 
      user,
      id: user.id, 
      username: user.username, 
      fullName: user.fullName, 
      admissionNo: user.admissionNo,
      role: user.role, 
      roleColor: roleColors[role] || "#64748b" 
    });
  } catch (err) {
    res.status(500).json({ error: "Auth check failed" });
  }
});

// ------------------- HELPERS -------------------


app.post("/api/modules/:moduleName", authRequired, async (req, res) => {
  try {
    const { moduleName } = req.params;
    if (!MODULES[moduleName]) {
      return res.status(404).json({ error: "Unknown module" });
    }
    const user = req.session.user;
    const role = String(user.role).toLowerCase();

    // Students cannot create anything
    if (role === "student") {
      return res.status(403).json({ error: "Students cannot add records" });
    }
    // Teachers can only write attendance modules
    if (role === "teacher" && !TEACHER_WRITE_MODULES.has(moduleName)) {
      return res.status(403).json({ error: "Teachers can only add attendance records" });
    }
    // Admin-staff-only modules
    if (ADMIN_STAFF_ONLY_MODULES.has(moduleName) && !isStaffOrAbove(user) && !isAdmin(user)) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }
    // Prevent non-admins from creating users with elevated roles
    if (moduleName === "users" && !isAdmin(user)) {
      return res.status(403).json({ error: "Only admins can manage users" });
    }
    // --- Fee Reconciliation Logic Removed ---

    // ── SPECIALIZED ADMISSION LOGIC ──
    if (moduleName === "admissions") {
      const payload = req.body || {};
      
      // 1. Duplicate Detection (Name + DOB + Phone1) - Skip for drafts
      if (payload.isDraft !== "true") {
        const students = await list("students");
        const admissions = await list("admissions");
        const isDuplicate = [...students, ...admissions].some(s => 
          s.id !== payload.id && // exclude self if updating (though this is POST)
          String(s.fullName || "").toLowerCase().trim() === String(payload.fullName || "").toLowerCase().trim() &&
          String(s.dob || "") === String(payload.dob || "") &&
          String(s.phone1 || "") === String(payload.phone1 || "")
        );

        if (isDuplicate) {
          return res.status(409).json({ error: "Duplicate Student: A student with this Name, DOB and Mobile already exists in the system." });
        }

        // 2. Generate Admission No if missing
        if (!payload.admissionNo || payload.admissionNo.includes("TEMP")) {
          const year = new Date().getFullYear();
          const allAdmissions = await list("admissions");
          const allStudents = await list("students");
          const count = allAdmissions.length + allStudents.length + 1;
          payload.admissionNo = `TPS${year}-${String(count).padStart(4, "0")}`;
        }
      }

      if (payload.isDraft === "true") {
        payload.draftUserId = req.session.user.id;
      }
    }

    const row = await insert(moduleName, req.body || {});
    
    // If successful admission (not draft), send notification
    if (moduleName === "admissions" && row.isDraft !== "true" && row.status === "Pending") {
      sendAdmissionNotification(row);
    }
    
    // Instant Sync: If Fee Structure changed, trigger the automation immediately
    if (moduleName === "feeStructures") {
      console.log("[Fee Automation] Fee Structure added, triggering instant sync...");
      runAutomatedFeeTask().catch(e => console.error("Instant sync error:", e.message));
    }
    
    res.status(201).json(row);
  } catch (err) {
    console.error("Insert failed:", err);
    res.status(500).json({ error: "Insert failed" });
  }
});

app.put("/api/modules/:moduleName/:id", authRequired, async (req, res) => {
  try {
    const { moduleName, id } = req.params;
    if (!MODULES[moduleName]) {
      return res.status(404).json({ error: "Unknown module" });
    }
    const user = req.session.user;
    const role = String(user.role).toLowerCase();

    // Students cannot edit anything
    if (role === "student") {
      return res.status(403).json({ error: "Students cannot edit records" });
    }
    // Teachers can only edit attendance
    if (role === "teacher" && !TEACHER_WRITE_MODULES.has(moduleName)) {
      return res.status(403).json({ error: "Teachers can only edit attendance records" });
    }
    // Admin-staff-only modules
    if (ADMIN_STAFF_ONLY_MODULES.has(moduleName) && !isStaffOrAbove(user) && !isAdmin(user)) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }
    // Prevent non-admins from editing the users module
    if (moduleName === "users" && !isAdmin(user)) {
      return res.status(403).json({ error: "Only admins can manage users" });
    }
    // --- Fee Reconciliation Logic Removed ---
    const updated = await update(moduleName, Number(id), req.body || {});
    if (!updated) return res.status(404).json({ error: "Record not found" });

    // Instant Sync: If Fee Structure changed, trigger the automation immediately
    if (moduleName === "feeStructures") {
      console.log("[Fee Automation] Fee Structure updated, triggering instant sync...");
      runAutomatedFeeTask().catch(e => console.error("Instant sync error:", e.message));
    }
    
    res.json(updated);
  } catch (err) {
    console.error("Update failed:", err);
    res.status(500).json({ error: "Update failed" });
  }
});

app.delete("/api/modules/:moduleName/:id", authRequired, async (req, res) => {
  try {
    const { moduleName, id } = req.params;
    if (!MODULES[moduleName]) {
      return res.status(404).json({ error: "Unknown module" });
    }
    const user = req.session.user;
    // Only admin and principal can delete
    const roleStr = String(user.role || "").toLowerCase();
    if (roleStr !== "administrator" && roleStr !== "principal") {
      return res.status(403).json({ error: "Only Admins and Principals can delete records" });
    }
    // Users module: only admin
    if (moduleName === "users" && !isAdmin(user)) {
      return res.status(403).json({ error: "Only admins can delete users" });
    }
    await remove(moduleName, Number(id));

    // If a fee is deleted, trigger instant automation to recreate dues if necessary
    if (moduleName === "fees") {
        console.log("[Fee Automation] Fee record deleted. Triggering instant sync...");
        // Run in background to not block the response
        runAutomatedFeeTask().catch(e => console.error("Instant sync error:", e));
    }

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Delete failed" });
  }
});

// ------------------- WHATSAPP ALERTS -------------------

// GET /api/whatsapp/due-fees  →  returns pending/partial fee records enriched with parent phone
app.get("/api/whatsapp/due-fees", authRequired, async (req, res) => {
  try {
    const user = req.session.user;
    if (!isStaffOrAbove(user) && !isAdmin(user)) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }
    const fees = await list("fees");
    const students = await list("students");
    const dueMgmt = await list("dueManagement");

    const studentNameMap = {};
    const studentAdmMap = {};
    students.forEach(s => { 
      studentNameMap[s.fullName] = s; 
      if (s.admissionNo) studentAdmMap[s.admissionNo] = s;
    });

    const results = [];

    // 1. Process standard fees slips
    fees
      .filter(f => {
        const status = String(f.status || "").toLowerCase();
        const bal = parseFloat(f.balance) || 0;
        return (status === "pending" || status === "partial") && bal > 0;
      })
      .forEach(f => {
        const student = studentAdmMap[f.admissionNo] || studentNameMap[f.studentName] || {};
        results.push({
          feeId: f.id,
          admissionNo: f.admissionNo || student.admissionNo || "",
          studentName: f.studentName || "",
          className: f.className || student.className || "",
          rollNo: f.rollNo || student.rollNo || "",
          parentName: student.parentName || "",
          phone: student.phone || "",
          balance: f.balance || "0",
          totalFee: f.totalFee || "0",
          paidAmount: f.paidAmount || "0",
          term: f.term || "Fee Slip",
          status: f.status || "Pending",
          paymentDate: f.paymentDate || "",
          source: "fees"
        });
      });

    // 2. Process manual Due Management items
    dueMgmt
      .filter(d => {
        const status = String(d.status || "").toLowerCase();
        const bal = parseFloat(d.balance) || 0;
        return status !== "paid" && bal > 0;
      })
      .forEach(d => {
        const student = studentAdmMap[d.admissionNo] || studentNameMap[d.studentName] || {};
        results.push({
          feeId: `dm-${d.id}`,
          admissionNo: d.admissionNo || student.admissionNo || "",
          studentName: d.studentName || "",
          className: d.className || student.className || "",
          rollNo: d.rollNo || student.rollNo || "",
          parentName: student.parentName || "",
          phone: student.phone || "",
          balance: d.balance || "0",
          totalFee: d.dueAmount || "0",
          paidAmount: d.paidAmount || "0",
          term: d.particulars || "Due Mgmt",
          status: d.status || "Unpaid",
          paymentDate: "",
          source: "dueManagement"
        });
      });

    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch due fees" });
  }
});

// POST /api/whatsapp/log-alert  →  logs a WhatsApp alert that was sent
app.post("/api/whatsapp/log-alert", authRequired, async (req, res) => {
  try {
    const user = req.session.user;
    if (!isStaffOrAbove(user) && !isAdmin(user)) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }
    const { studentName, className, phone, parentName, balance, term, message } = req.body || {};
    const today = new Date().toISOString().slice(0, 10);
    const row = await insert("whatsappAlerts", {
      studentName: studentName || "",
      className: className || "",
      phone: phone || "",
      parentName: parentName || "",
      balance: String(balance || ""),
      term: term || "",
      alertDate: today,
      message: message || "",
      status: "Sent"
    });
    res.status(201).json(row);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to log alert" });
  }
});

// POST /api/sms/send  →  Proxies SMS gateway request via backend to bypass CORS and securely handle embedded passwords
app.post("/api/sms/send", authRequired, async (req, res) => {
  try {
     const user = req.session.user;
     if (!isStaffOrAbove(user) && !isAdmin(user)) return res.status(403).json({ error: "Insufficient permissions" });

     const { gatewayUrl, phone, message } = req.body;
     if (!gatewayUrl || !phone || !message) return res.status(400).json({ error: "Missing parameters" });

     // Parse the gateway URL
     const urlObj = new URL(gatewayUrl);
     const headers = {};

     // Handle Basic Auth from URL if present
     if (urlObj.username || urlObj.password) {
         const authStr = Buffer.from(`${urlObj.username}:${urlObj.password}`).toString("base64");
         headers["Authorization"] = `Basic ${authStr}`;
         // Strip credentials from the URL object for safety
         urlObj.username = "";
         urlObj.password = "";
     }
     
     // Build a CLEAN gateway URL string from our parsed object
     const cleanGatewayUrl = urlObj.toString();

     let targetUrl = cleanGatewayUrl;
     let method = 'POST';
     let body = null;

     const isTemplate = gatewayUrl.includes("{phone}") || gatewayUrl.includes("{message}");

     if (isTemplate) {
         // 1. Traditional Android Gateway apps (GET with Template)
         // IMPORTANT: Use ORIGINAL RAW string for replacement because cleanGatewayUrl (via URL object) 
         // encodes curly braces as %7B / %7D, which makes the .replace() fail.
         targetUrl = gatewayUrl.replace("{phone}", phone).replace("{message}", encodeURIComponent(message));
         method = 'GET';
         body = null;
     } else {
         // 2. Specialized or POST-based gateways
         method = 'POST';
         
         if (urlObj.pathname === "/" || urlObj.pathname === "") {
             // Default to Capcom6 style /message if no path provided
             const targetBase = `${urlObj.protocol}//${urlObj.host}`;
             targetUrl = `${targetBase}/message`;
         } else {
             targetUrl = cleanGatewayUrl;
         }

         body = JSON.stringify({
           phoneNumbers: [phone],
           message: message
         });
     }

     // Mask credentials for safe logging
     const maskedUrl = targetUrl.replace(/\/\/[^@]+@/, "//***:***@");
     console.log(`[SMS Backend Proxy] ${method} to ${maskedUrl}...`);
     if (headers["Authorization"]) console.log(`[SMS Backend Proxy] Using Authorization header (Basic)`);
     
     const controller = new AbortController();
     const timeoutId = setTimeout(() => controller.abort(), 10000); 

     try {
       const fetchOptions = {
           method: method,
           headers: headers,
           signal: controller.signal
       };

       if (method === 'POST') {
           fetchOptions.body = body;
           headers['Content-Type'] = 'application/json';
       }

       const response = await fetch(targetUrl, fetchOptions);
       clearTimeout(timeoutId);

       const responseText = await response.text();
       console.log(`[SMS Backend Proxy] Result: ${response.status}`, responseText);

       if (!response.ok && response.status !== 202) {
           const errHint = responseText ? `: ${responseText}` : "";
           return res.status(400).json({ 
             error: `Gateway responded with HTTP ${response.status}${errHint}`,
             body: responseText 
           });
       }

       res.json({ success: true });
     } catch (fetchErr) {
       clearTimeout(timeoutId);
       if (fetchErr.name === 'AbortError') {
         return res.status(504).json({ error: "Gateway Timeout: Phone took too long to respond. Check if the app is open and on the same WiFi." });
       }
       throw fetchErr;
     }
  } catch (err) {
     console.error("[SMS Backend Proxy Error]", err.message);
     res.status(500).json({ error: err.message });
  }
});

// ------------------- PROPER AI ASSISTANT -------------------

app.post("/api/chat", authRequired, async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(200).json({ reply: "⚠️ Gemini API Key is missing. Please add GEMINI_API_KEY to your backend environment (.env) to enable the AI." });
    }

    const { prompt, context } = req.body || {};
    if (!prompt) return res.status(400).json({ error: "No prompt provided" });

    const ai = new GoogleGenAI({ apiKey });

    const systemInstruction = `You are EduCore AI, a highly intuitive and helpful assistant for a School Management System.
The user is a staff member currently logged in.
Here is the current state of their app right now:
${context || 'No specific context provided.'}

Answer their questions confidently. Keep responses concise and helpful.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.4,
      }
    });

    res.json({ reply: response.text });
  } catch (err) {
    console.error("Gemini AI API Error:", err);
    res.status(500).json({ reply: `❌ AI Error: ${err.message}` });
  }
});

// ------------------- IP CAMERA SNAPSHOT PROXY -------------------
// Fetches a single JPEG frame from the IP camera so the browser can read
// the pixels without cross-origin canvas taint restrictions.

app.get("/api/camera-snapshot", authRequired, async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).json({ error: "Missing ?url= parameter" });

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    const contentType = response.headers.get("content-type") || "";

    if (contentType.includes("multipart")) {
      // MJPEG stream — read until we get one complete JPEG frame
      const reader = response.body.getReader();
      const chunks = [];
      let totalLen = 0;
      let foundJpeg = false;

      while (!foundJpeg && totalLen < 2 * 1024 * 1024) { // max 2MB
        const { value, done } = await reader.read();
        if (done) break;
        chunks.push(value);
        totalLen += value.length;

        // Concatenate and look for JPEG markers (FFD8 start, FFD9 end)
        const buf = Buffer.concat(chunks);
        const soi = buf.indexOf(Buffer.from([0xFF, 0xD8]));
        const eoi = buf.indexOf(Buffer.from([0xFF, 0xD9]), soi > -1 ? soi : 0);
        if (soi > -1 && eoi > -1 && eoi > soi) {
          const jpeg = buf.slice(soi, eoi + 2);
          reader.cancel();
          res.set("Content-Type", "image/jpeg");
          res.set("Cache-Control", "no-cache, no-store");
          res.send(jpeg);
          foundJpeg = true;
        }
      }
      if (!foundJpeg) {
        reader.cancel();
        res.status(502).json({ error: "Could not extract JPEG frame from MJPEG stream" });
      }
    } else {
      // Snapshot URL — pipe through
      res.set("Content-Type", contentType || "image/jpeg");
      res.set("Cache-Control", "no-cache, no-store");
      const arrayBuf = await response.arrayBuffer();
      res.send(Buffer.from(arrayBuf));
    }
  } catch (err) {
    if (err.name === "AbortError") {
      return res.status(504).json({ error: "IP camera request timed out" });
    }
    console.error("Camera proxy error:", err.message);
    res.status(502).json({ error: "Failed to reach IP camera: " + err.message });
  }
});

// ------------------- AUTOMATED FEE TASK -------------------

/**
 * Robustly matches a month name against a database month string (could be "Apr" or "April" etc.)
 */
function isMonthMatch(dbMonth, targetMonthName) {
    if (!dbMonth || !targetMonthName) return false;
    const dbVal = String(dbMonth).toLowerCase();
    const targetVal = String(targetMonthName).toLowerCase();
    const shortNames = {
        "january": "jan", "february": "feb", "march": "mar", "april": "apr",
        "may": "may", "june": "jun", "july": "jul", "august": "aug",
        "september": "sep", "october": "oct", "november": "nov", "december": "dec"
    };
    const shortTarget = shortNames[targetVal] || targetVal.substring(0, 3);
    
    // Check for full name or short name in the potentially comma-separated db string
    const parts = dbVal.split(",").map(p => p.trim());
    return parts.some(p => p === targetVal || p === shortTarget);
}

async function runAutomatedFeeTask() {
  try {
    const today = new Date();
    const day = today.getDate();
    const monthIndex = today.getMonth();
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const monthName = months[monthIndex];
    const session = "26-27";

    console.log(`[Fee Automation] Checking for ${monthName} dues (Day: ${day})...`);

    const students = await list("students");
    const feeStructures = await list("feeStructures");
    const dueManagement = await list("dueManagement");
    const allFees = await list("fees");

    // ── Auto-Sync: Remove Dues that have since been paid in Fees module ──
    const tuitionDues = dueManagement.filter(d => (d.particulars || "").startsWith("Tuition fee of") && d.status === "Unpaid");
    if (tuitionDues.length > 0) {
        let syncCount = 0;
        for (const due of tuitionDues) {
            const monthStored = due.particulars.replace("Tuition fee of ", "");
            
            // Robust check against all fees
            const isPaidNow = allFees.some(f => 
                f.admissionNo === due.admissionNo && 
                f.status === "Paid" && 
                isMonthMatch(f.month, monthStored)
            );

            if (isPaidNow) {
                console.log(`[Fee Automation] Sync: Found payment for ${due.studentName} (${monthStored}). Removing redundant due.`);
                await remove("dueManagement", due.id);
                syncCount++;
            }
        }
        if (syncCount > 0) console.log(`[Fee Automation] Sync: Cleaned up ${syncCount} paid records.`);
    }

    // ── Global Sync: Update ALL Unpaid Dues if Fee Structure changed ──
    // This ensures that if the Admin updates a price, it reflects in all months (March, April, etc.)
    let globalSyncCount = 0;
    const unpaidDues = dueManagement.filter(d => d.status === "Unpaid");
    for (const due of unpaidDues) {
        const student = students.find(s => s.admissionNo === due.admissionNo);
        if (!student) continue;

        const className = due.className || student.className;
        let feeType = "";
        if (due.particulars.startsWith("Tuition fee of")) feeType = "Tuition Fee";
        else if (due.particulars.startsWith("Late fee of")) feeType = "Late Fee";
        
        if (feeType) {
            const struct = feeStructures.find(s => s.className === className && s.feeType === feeType);
            if (struct && String(struct.amount) !== String(due.dueAmount)) {
                console.log(`[Fee Automation] Global Sync: Updating ${feeType} for ${due.studentName} (${due.particulars}) from ${due.dueAmount} to ${struct.amount}`);
                await update("dueManagement", due.id, {
                    dueAmount: struct.amount,
                    balance: struct.amount
                });
                globalSyncCount++;
            }
        }
    }
    if (globalSyncCount > 0) console.log(`[Fee Automation] Global Sync: Updated ${globalSyncCount} records across all months.`);
    // ──────────────────────────────────────────────────────────────────

    // ── One-time Cleanup: Skip April Late Fee (User Request) ─────
    if (monthName === "April") {
        const alreadyAdded = dueManagement.filter(d => d.particulars === "Late fee of April" && d.session === session);
        if (alreadyAdded.length > 0) {
            console.log(`[Fee Automation] Cleanup: Removing ${alreadyAdded.length} existing April late fees.`);
            for (const d of alreadyAdded) {
                await remove("dueManagement", d.id);
            }
        }
    }
    // ────────────────────────────────────────────────────────────

    for (const student of students) {
        if (student.status === "Inactive") continue;

        const className = student.className;
        const admNo = student.admissionNo;

        // 1. Tuition Fee (Day 1 onwards)
        if (day >= 1) {
            const particulars = `Tuition fee of ${monthName}`;
            const isPaidInFees = allFees.some(f => 
                f.admissionNo === admNo && 
                f.status === "Paid" && 
                isMonthMatch(f.month, monthName)
            );

            const existsInDues = dueManagement.find(d => d.admissionNo === admNo && d.particulars === particulars && d.session === session);
            
            if (!existsInDues && !isPaidInFees) {
                const struct = feeStructures.find(s => s.className === className && s.feeType === "Tuition Fee");
                if (struct) {
                    const amount = struct.amount || "0";
                    await insert("dueManagement", {
                        admissionNo: admNo,
                        studentName: student.fullName,
                        className: className,
                        rollNo: student.rollNo || "",
                        session: session,
                        particulars: particulars,
                        dueAmount: amount,
                        paidAmount: "0",
                        balance: amount,
                        status: "Unpaid"
                    });
                    console.log(`[Fee Automation] Added [Tuition Fee: ${amount}] for ${student.fullName} (${admNo})`);
                }
            }
        }

        // 2. Late Fee (Day 11 onwards)
        if (day >= 11 && monthName !== "April") {
            const particulars = `Late fee of ${monthName}`;
            const exists = dueManagement.find(d => d.admissionNo === admNo && d.particulars === particulars && d.session === session);
            if (!exists) {
                const struct = feeStructures.find(s => s.className === className && s.feeType === "Late Fee");
                if (struct) {
                    const amount = struct.amount || "0";
                    await insert("dueManagement", {
                        admissionNo: admNo,
                        studentName: student.fullName,
                        className: className,
                        rollNo: student.rollNo || "",
                        session: session,
                        particulars: particulars,
                        dueAmount: amount,
                        paidAmount: "0",
                        balance: amount,
                        status: "Unpaid"
                    });
                    console.log(`[Fee Automation] Added [Late Fee: ${amount}] for ${student.fullName} (${admNo})`);
                }
            }
        }
    }
    console.log("[Fee Automation] Task completed successfully.");
  } catch (err) {
    console.error("[Fee Automation] Critical Error:", err);
  }
}

// ------------------- START SERVER -------------------

async function startServer() {
  try {
    await initDb();
    console.log("✅ Database connected");
  } catch (err) {
    console.error("⚠️ DB failed but server continues:", err.message);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`\n🚀 ============================================`);
    console.log(`✅  TAPOWAN SCHOOL SERVER IS LIVE!`);
    console.log(`📡  PORT: ${PORT}`);
    console.log(`🌐  URL:  http://localhost:${PORT}`);
    console.log(`==============================================\n`);
    // Run automation task on start and then every hour
    runAutomatedFeeTask();
    setInterval(runAutomatedFeeTask, 6 * 60 * 60 * 1000);
  });
}

startServer();
