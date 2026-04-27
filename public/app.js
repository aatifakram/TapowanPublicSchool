const FACE_KEY = "school_face_embeddings_v2";
let human = null;
const HUMAN_MODELS_URL = "https://cdn.jsdelivr.net/npm/@vladmandic/human/models/";
const CLASS_STANDARD_OPTIONS = ["Nursery", "LKG", "UKG", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];

const moduleConfig = {
  admissions: {
    title: "Admissions",
    subtitle: "Process new student applications and inquiries",
    fields: [
      "admissionNo", "rollNo", "fullName", "className", "section", "gender", "dob", "age",
      "aadhar", "category", "religion", "phone1", "phone2", "whatsapp", "email",
      "village", "post", "district", "state", "pin", "address",
      "fatherName", "motherName", "guardianName", "relation", "occupation", "incomeRange", "emergencyContact",
      "classApplyingFor", "session", "admissionDate", "prevSchool", "lastClassPassed", "tcReceived",
      "photo", "birthCert", "aadharDoc", "tcDoc", "parentIdDoc",
      "admissionFee", "monthlyFee", "transportFee", "discount",
      "status", "tc", "reportCard", "fatherAadhar", "motherAadhar", "remarks"
    ],
    columns: ["fullName", "classApplyingFor", "phone1", "admissionDate", "status"]
  },
  dashboard: { title: "Dashboard", subtitle: "School overview and quick statistics", fields: [], columns: ["Metric", "Value"] },
  students: {
    title: "Students",
    subtitle: "Manage student profiles and basic records",
    fields: [
      "admissionNo", "rollNo", "fullName", "className", "gender", "dob",
      "fatherName", "motherName", "phone", "address", "photo",
      "status", "monthlyFee", "aadhar", "tc", "reportCard", "fatherAadhar", "motherAadhar"
    ],
    columns: ["admissionNo", "fullName", "className", "phone", "gender", "status"]
  },

  teachers: { title: "Teachers", subtitle: "Manage teacher records and contacts", fields: ["employeeNo", "fullName", "department", "qualification", "phone", "email", "joinDate"], columns: ["employeeNo", "fullName", "department", "qualification", "phone", "email"] },
  classes: { title: "Classes", subtitle: "Create classes and assign class teachers", fields: ["className", "section", "classTeacher", "roomNo", "capacity"], columns: ["className", "section", "classTeacher", "roomNo", "capacity"] },
  subjects: { title: "Subjects", subtitle: "Define subjects and assign faculty", fields: ["subjectCode", "subjectName", "className", "teacher", "credits"], columns: ["subjectCode", "subjectName", "className", "teacher", "credits"] },
  attendance: { title: "Attendance", subtitle: "Track daily student attendance", fields: ["date", "className", "studentName", "rollNo", "status", "arrivalTime", "departureTime", "remarks"], columns: ["date", "className", "studentName", "rollNo", "status"] },
  teacherAttendance: { title: "Teacher Attendance", subtitle: "Track daily teacher attendance", fields: ["date", "department", "teacherName", "status", "arrivalTime", "departureTime", "remarks"], columns: ["date", "department", "teacherName", "status", "arrivalTime", "departureTime"] },
  exams: { title: "Exams & Results", subtitle: "Manage exams and student marks", fields: ["examName", "className", "subject", "studentName", "rollNo", "marksObtained", "maxMarks", "grade"], columns: ["examName", "className", "subject", "studentName", "rollNo", "marksObtained", "maxMarks", "grade"] },
  fees: { 
    title: "Fees", 
    subtitle: "Record fee structures and payments", 
    fields: [
      "admissionNo", "studentName", "className", "rollNo", "fatherName", "term", "month",
      "totalFee", "paidAmount", "balance", "status", "paymentDate", "paymentMethod", "onlineAmount", "cashAmount"
    ], 
    columns: ["admissionNo", "studentName", "className", "rollNo", "term", "month", "totalFee", "paidAmount", "balance", "status"] 
  },
  library: { title: "Library", subtitle: "Manage books, issues and returns", fields: ["bookCode", "bookTitle", "author", "issuedTo", "issueDate", "returnDate", "status"], columns: ["bookCode", "bookTitle", "author", "issuedTo", "issueDate", "returnDate", "status"] },
  transport: { title: "Transport", subtitle: "Track routes, buses and student allocation", fields: ["routeName", "vehicleNo", "driverName", "studentName", "pickupPoint", "monthlyFee"], columns: ["routeName", "vehicleNo", "driverName", "studentName", "pickupPoint", "monthlyFee"] },
  hostel: { title: "Hostel", subtitle: "Manage hostel rooms and allocations", fields: ["hostelName", "roomNo", "studentName", "warden", "checkInDate", "bedNo", "status"], columns: ["hostelName", "roomNo", "studentName", "warden", "checkInDate", "bedNo", "status"] },
  payroll: { title: "Payroll", subtitle: "Generate salary records and allowances", fields: ["employeeName", "designation", "month", "basicSalary", "allowances", "deductions", "netPay"], columns: ["employeeName", "designation", "month", "basicSalary", "allowances", "deductions", "netPay"] },
  users: { title: "Users & Roles", subtitle: "System user accounts and permissions", fields: ["username", "fullName", "role", "email", "status", "lastLogin", "password"], columns: ["username", "fullName", "role", "email", "status", "lastLogin"] },
  timetable: { title: "Timetable", subtitle: "Weekly class and subject scheduling", fields: ["className", "day", "period", "subject", "teacher", "roomNo"], columns: ["className", "day", "period", "subject", "teacher", "roomNo"] },
  booksAndDress: { title: "Books & Dress", subtitle: "Manage book sets and uniform uniform distributions", fields: ["className", "itemType", "itemName", "price", "term"], columns: ["className", "itemType", "itemName", "price", "term"] },
  whatsappAlerts: { title: "WhatsApp Alerts", subtitle: "Log and track automated communication", fields: ["studentName", "className", "phone", "parentName", "balance", "term", "alertDate", "message", "status"], columns: ["studentName", "className", "phone", "alertDate", "status"] },
  dueManagement: { title: "Due Management", subtitle: "Track and manage balances from previous sessions", fields: ["admissionNo", "studentName", "className", "rollNo", "session", "particulars", "dueAmount", "paidAmount", "balance", "status", "remarks"], columns: ["admissionNo", "studentName", "session", "dueAmount", "paidAmount", "balance", "status"] },
  aiAssistant: { title: "Vidya AI Brain", subtitle: "Manage AI knowledge base and settings", fields: [], columns: [] }
};

const moduleSections = [
  { label: "Core", modules: ["admissions", "dashboard", "aiAssistant", "students", "teachers", "classes"] },
  { label: "ACADEMIC", modules: ["subjects", "exams", "timetable"] },
  { label: "DAILY", modules: ["attendance", "teacherAttendance"] },
  { label: "FINANCE", modules: ["fees", "dueManagement", "payroll", "booksAndDress", "whatsappAlerts"] },
  { label: "RESOURCES", modules: ["library", "transport", "hostel", "users"] }
];

const moduleIcons = {
  dashboard: "📊", admissions: "🎯", students: "🎓", teachers: "👨‍🏫", classes: "🏢",
  subjects: "📚", exams: "📝", timetable: "⏰",
  attendance: "📅", teacherAttendance: "👨‍🏫",
  fees: "💳", dueManagement: "💸", payroll: "💼", booksAndDress: "📦", whatsappAlerts: "📲",
  library: "📖", transport: "🚌", hostel: "🏠", users: "👥", aiAssistant: "🧠"
};

const moduleOrder = Object.keys(moduleConfig);
const printableModules = new Set(["students", "exams", "fees"]);
let currentModule = "dashboard";
let currentUser = null; // ← global session user for role checks

// ─── ROLE PERMISSION HELPERS ───────────────────────────────────────
const ROLE_LEVEL = { administrator: 4, principal: 3, staff: 3, teacher: 2, student: 1 };
function getRoleLevel(role) { return ROLE_LEVEL[String(role || "").toLowerCase()] || 0; }
function userIsAdmin() { return String(currentUser?.role || "").toLowerCase() === "administrator"; }
function userIsStaffOrAbove() { return getRoleLevel(currentUser?.role) >= 3 || userIsAdmin(); }
function userIsTeacherOrAbove() { return getRoleLevel(currentUser?.role) >= 2; }
function userIsStudent() { return String(currentUser?.role || "").toLowerCase() === "student"; }

function getLinkedStudent() {
  if (!userIsStudent()) return null;
  const store = getStore();
  const adNo = String(currentUser?.admissionNo || "").trim().toLowerCase();
  const fName = String(currentUser?.fullName || "").trim().toLowerCase();
  
  return (store.students || []).find(s => {
    const sAd = String(s.admissionNo || "").trim().toLowerCase();
    const sName = String(s.fullName || "").trim().toLowerCase();
    if (sAd && adNo && sAd === adNo) return true;
    if (sName && fName && sName === fName) return true;
    return false;
  }) || null;
}

// Modules visible per role
const STUDENT_VISIBLE_MODULES = new Set(["dashboard", "students", "attendance", "exams", "fees", "timetable", "subjects"]);
const TEACHER_VISIBLE_MODULES = new Set(["dashboard", "admissions", "students", "teachers", "classes", "subjects", "attendance", "teacherAttendance", "exams", "timetable", "library"]);
// Modules where teacher can add/edit
const TEACHER_WRITE_MODULES = new Set(["attendance", "teacherAttendance"]);
// Modules only admin can see
const ADMIN_ONLY_MODULES = new Set(["users", "payroll"]);
let faceStream = null;
let latestDescriptor = null;
let faceModelsReady = false;
let serverStore = {};
let autoCaptureTimer = null;
let autoCaptureBusy = false;
let autoRecognitionStreak = 0;
let autoStreakKey = "";
let autoLastAutoMarkKey = "";
let autoLastAutoMarkAt = 0;
let autoRecognitionStreakByKey = {};
let autoLastAutoMarkAtByKey = {};
let editStudentId = null;
let editRecordId = null;
let pendingStudentPrefill = null;
// Tracking for Due Management integration in Fees module
let appliedDueMgmtAmount = 0;
let appliedDueMgmtParticulars = "";
let appliedDueMgmtIds = [];
let appliedFeeIds = [];

const refs = {
  sidebar: document.getElementById("sidebar"),
  mobileMenuBtn: document.getElementById("mobileMenuBtn"),
  bottomNavMoreBtn: document.getElementById("bottomNavMoreBtn"),
  mobileSidebarBackdrop: document.getElementById("mobileSidebarBackdrop"),
  moduleNav: document.getElementById("moduleNav"),
  moduleTitle: document.getElementById("moduleTitle"),
  moduleSubtitle: document.getElementById("moduleSubtitle"),
  dynamicForm: document.getElementById("dynamicForm"),
  tableHead: document.getElementById("tableHead"),
  tableBody: document.getElementById("tableBody"),
  statsCards: document.getElementById("statsCards"),
  moduleTools: document.querySelector(".panel-actions"),
  classFilter: document.getElementById("classFilter"),
  searchInput: document.getElementById("searchInput"),
  emptyState: document.getElementById("emptyState"),
  authOverlay: document.getElementById("authOverlay"),
  authSubtitle: document.getElementById("authSubtitle"),
  loginForm: document.getElementById("loginForm"),
  signupForm: document.getElementById("signupForm"),
  showLoginBtn: document.getElementById("showLoginBtn"),
  showSignupBtn: document.getElementById("showSignupBtn"),
  logoutBtn: document.getElementById("logoutBtn"),
  activeUserBadge: document.getElementById("activeUserBadge"),
  exportCsvBtn: document.getElementById("exportCsvBtn"),
  importDataBtn: document.getElementById("importDataBtn"),
  importFile: document.getElementById("importFile"),
  exportPdfBtn: document.getElementById("exportPdfBtn"),
  printDocBtn: document.getElementById("printDocBtn"),
  facePanel: document.getElementById("facePanel"),
  startCameraBtn: document.getElementById("startCameraBtn"),
  captureFaceBtn: document.getElementById("captureFaceBtn"),
  markFaceAttendanceBtn: document.getElementById("markFaceAttendanceBtn"),
  faceVideo: document.getElementById("faceVideo"),
  faceCanvas: document.getElementById("faceCanvas"),
  localCamWrapper: document.getElementById("localCamWrapper"),
  ipCameraImg: document.getElementById("ipCameraImg"),
  ipCamWrapper: document.getElementById("ipCamWrapper"),
  ipOverlayCanvas: document.getElementById("ipOverlayCanvas"),
  cameraSourceSelect: document.getElementById("cameraSourceSelect"),
  ipCameraUrl: document.getElementById("ipCameraUrl"),
  ipCameraControls: document.getElementById("ipCameraControls"),
  faceTargetType: document.getElementById("faceTargetType"),
  faceTargetName: document.getElementById("faceTargetName"),
  faceClassName: document.getElementById("faceClassName"),
  faceStatus: document.getElementById("faceStatus"),
  faceStatusText: document.getElementById("faceStatusText"),
  autoCaptureToggle: document.getElementById("autoCaptureToggle"),
  autoCaptureIntervalMs: document.getElementById("autoCaptureIntervalMs"),
  autoMinConfidence: document.getElementById("autoMinConfidence"),
  autoStableCount: document.getElementById("autoStableCount"),
  autoBatchMultiFaceToggle: document.getElementById("autoBatchMultiFaceToggle"),
  assistantToggleBtn: document.getElementById("assistantToggleBtn"),
  assistantCloseBtn: document.getElementById("assistantCloseBtn"),
  assistantInput: document.getElementById("assistantInput"),
  assistantSendBtn: document.getElementById("assistantSendBtn"),
  assistantAutoAttendanceBtn: document.getElementById("assistantAutoAttendanceBtn"),
  assistantPrintIdBtn: document.getElementById("assistantPrintIdBtn"),
  assistantPanel: document.getElementById("assistantPanel"),
  assistantOutput: document.getElementById("assistantOutput"),
  apiBaseInput: document.getElementById("apiBaseInput"),
  apiSaveBtn: document.getElementById("apiSaveBtn"),
  enrollFaceBtn: document.getElementById("enrollFaceBtn"),
  faceEnrollStudentField: document.getElementById("faceEnrollStudentField"),
  faceEnrollStudentSelect: document.getElementById("faceEnrollStudentSelect"),
  faceManualNameField: document.getElementById("faceManualNameField"),
  faceManualClassField: document.getElementById("faceManualClassField"),
  faceStatusField: document.getElementById("faceStatusField"),
  faceAutoControls: document.getElementById("faceAutoControls"),

  studentProfileBackdrop: document.getElementById("studentProfileBackdrop"),
  studentProfileModal: document.getElementById("studentProfileModal"),
  studentProfileCloseBtn: document.getElementById("studentProfileCloseBtn"),
  studentProfileName: document.getElementById("studentProfileName"),
  studentProfileSub: document.getElementById("studentProfileSub"),
  studentProfileContent: document.getElementById("studentProfileContent"),
  studentProfileTabs: document.querySelectorAll('.student-profile-tab'),

  // 4-in-1 Print fields
  print4in1Btn: document.getElementById("print4in1Btn"),
  print4in1Backdrop: document.getElementById("print4in1Backdrop"),
  print4in1Modal: document.getElementById("print4in1Modal"),
  print4in1CloseBtn: document.getElementById("print4in1CloseBtn"),
  box1Select: document.getElementById("box1Select"),
  box2Select: document.getElementById("box2Select"),
  box3Select: document.getElementById("box3Select"),
  box4Select: document.getElementById("box4Select"),
  executePrint4in1Btn: document.getElementById("executePrint4in1Btn")
};

function isMobileLayout() {
  return window.matchMedia("(max-width: 900px)").matches;
}

function setMobileSidebarOpen(open) {
  if (!refs.sidebar || !refs.mobileSidebarBackdrop) return;
  refs.sidebar.classList.toggle("mobile-open", !!open);
  refs.mobileSidebarBackdrop.classList.toggle("hidden", !open);
  document.body?.classList?.toggle("no-scroll", !!open);
  if (refs.mobileMenuBtn) {
    refs.mobileMenuBtn.setAttribute("aria-expanded", open ? "true" : "false");
  }
}

function todayStr() {
  const d = new Date();
  return [d.getFullYear(), String(d.getMonth() + 1).padStart(2, '0'), String(d.getDate()).padStart(2, '0')].join('-');
}

function displayDate(iso) {
  if (!iso || typeof iso !== 'string') return "";
  const s = iso.trim().replace(/\//g, "-").replace(/\s+/g, "-");
  const parts = s.split("-");
  
  // Already DD-MM-YYYY
  if (parts.length === 3 && parts[2].length === 4) return s;
  
  // YYYY-MM-DD
  if (parts.length === 3 && parts[0].length === 4) {
    const [y, m, d] = parts;
    return `${d.padStart(2, '0')}-${m.padStart(2, '0')}-${y}`;
  }
  
  // MM-DD-YY or DD-MM-YY? Let's check. 
  // We'll assume the standard system format provides DD-MM-YYYY.
  // If it's a raw unformatted M/D/YY string like "4/17/26"
  if (parts.length === 3 && parts[2].length === 2) {
    // If the first part is > 12, it must be DD. 
    // If it's "4/17/26", the second part is 17 (>12), so it must be MM/DD/YY.
    let d, m, y;
    if (Number(parts[1]) > 12) {
      // MM/DD/YY
      m = parts[0];
      d = parts[1];
    } else {
      // DD/MM/YY
      d = parts[0];
      m = parts[1];
    }
    y = "20" + parts[2];
    return `${d.padStart(2, '0')}-${m.padStart(2, '0')}-${y}`;
  }

  return s; 
}

function normalizeToISO(str) {
  if (!str) return "";
  const s = String(str).trim().replace(/\//g, "-").replace(/\s+/g, "-");
  const parts = s.split("-");
  if (parts.length === 3) {
    if (parts[0].length === 4) return s.slice(0, 10); // already YYYY-MM-DD
    
    // Check if it's MM/DD/YY or DD/MM/YYYY
    let d, m, y;
    if (parts[2].length === 4) {
      // DD-MM-YYYY or MM-DD-YYYY
      if (Number(parts[0]) <= 12 && Number(parts[1]) > 12) {
         m = parts[0]; d = parts[1]; // M/D/YYYY
      } else {
         d = parts[0]; m = parts[1]; // D/M/YYYY
      }
      y = parts[2];
    } else if (parts[2].length === 2) {
      if (Number(parts[1]) > 12) {
        m = parts[0]; d = parts[1]; // M/D/YY
      } else {
        d = parts[0]; m = parts[1]; // D/M/YY
      }
      y = "20" + parts[2];
    }
    
    // Fallback if parsing didn't set vars
    if (!y) { d = parts[0]; m = parts[1]; y = parts[2]; }
    
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }
  return s;
}

function nowStr() {
  return new Date().toISOString().slice(0, 19).replace("T", " ");
}

function timeStr() {
  // HH:mm (local time). Stored as TEXT in DB.
  return new Date().toTimeString().slice(0, 5);
}

function getStore() { return serverStore || {}; }
function getFaceStore() { 
  const store = JSON.parse(localStorage.getItem(FACE_KEY) || "{}"); 
  // Validate embedding length to ensure compatibility with InsightFace (512-d)
  for (let key in store) {
    const emb = store[key].avgDescriptor || store[key].descriptor;
    if (emb && emb.length !== 512) {
       console.warn("Found incompatible face embeddings (likely from old Human library). Clearing face store.");
       localStorage.removeItem(FACE_KEY);
       return {};
    }
    // Only need to check the first one to know if the store is compatible
    break;
  }
  return store;
}
function saveFaceStore(v) { localStorage.setItem(FACE_KEY, JSON.stringify(v)); }

// Auto-migration: wipe old 128D face-api.js embeddings (incompatible with new 1024D Human engine)
(function migrateFaceStore() {
  const store = getFaceStore();
  const keys = Object.keys(store);
  if (!keys.length) return;
  // Check if any entry has old 128D descriptor instead of new 1024D
  for (const key of keys) {
    const entry = store[key];
    const desc = entry.avgDescriptor || entry.descriptor;
    if (desc && desc.length && desc.length < 512) {
      // Old 128D data found — wipe everything
      console.log('[FaceAI] Migrating 128D -> 1024D');
      localStorage.removeItem(FACE_KEY);
      return;
    }
  }
})();

function toLabel(key) {
  const custom = {
    className: "Class",
    classPart: "Class",
    sectionPart: "Section",
    rollNo: "Roll No",
    phone: "Mobile",
    phone1: "Mobile",
    fatherName: "Parent Name",
    admissionNo: "Admission No",
    employeeNo: "Employee No",
    roomNo: "Room No",
    issueDate: "Issue Date",
    returnDate: "Return Date",
    checkInDate: "Check In Date",
    lastLogin: "Last Login"
  };
  if (custom[key]) return custom[key];
  return key.replace(/([A-Z])/g, " $1").replace(/^./, c => c.toUpperCase());
}
function asNum(value) {
  if (typeof value === 'number') return value;
  const s = String(value || "0").replace(/[^\d.-]/g, "");
  return parseFloat(s) || 0;
}

function splitClassName(value) {
  const s = String(value ?? "").trim();
  if (!s) return { classPart: "", sectionPart: "" };
  const parts = s.split("-");
  if (parts.length === 1) return { classPart: s, sectionPart: "" };
  const sectionPart = parts.pop() || "";
  const classPart = parts.join("-");
  return { classPart, sectionPart };
}

function fileToResizedDataUrl(file, maxDim = 240, quality = 0.85) {
  return new Promise((resolve, reject) => {
    if (!file) return resolve("");
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Failed to read image file."));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Failed to load image."));
      img.onload = () => {
        const width = img.width || 1;
        const height = img.height || 1;
        const scale = Math.min(1, maxDim / Math.max(width, height));
        const w = Math.max(1, Math.round(width * scale));
        const h = Math.max(1, Math.round(height * scale));

        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

function videoFrameToResizedDataUrl(videoEl, maxDim = 240, quality = 0.7) {
  const width = videoEl.videoWidth || 640;
  const height = videoEl.videoHeight || 360;
  const scale = Math.min(1, maxDim / Math.max(width, height));
  const w = Math.max(1, Math.round(width * scale));
  const h = Math.max(1, Math.round(height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(videoEl, 0, 0, w, h);
  return canvas.toDataURL("image/jpeg", quality);
}

function normalizeApiBaseUrl(v) {
  const s = (v ?? "").toString().trim();
  if (!s) return "";
  return s.replace(/\/$/, "");
}

function getApiBaseUrl() {
  const qs = new URLSearchParams(window.location.search || "");
  const fromQuery = normalizeApiBaseUrl(qs.get("api"));
  if (fromQuery) localStorage.setItem("API_BASE_URL", fromQuery);
  const fromStorage = normalizeApiBaseUrl(localStorage.getItem("API_BASE_URL"));
  const fromWindow = normalizeApiBaseUrl(window.API_BASE_URL);
  
  // Dynamic: use the browser's current hostname (works for localhost & LAN)
  const host = window.location.hostname || "localhost";
  const port = window.location.port || "3000";
  const dynamicUrl = `${window.location.protocol}//${host}:${port}`;
  
  // Static IP fallback for Android app (Capacitor WebView uses localhost internally)
  const isCapacitor = host === "localhost" && !window.location.port;
  const staticUrl = "https://tapowan-school-system-2026-stable-v1.loca.lt";
  
  return fromQuery || fromStorage || fromWindow || (isCapacitor ? staticUrl : dynamicUrl);
}

let API_BASE_URL = getApiBaseUrl();

async function api(path, options = {}) {
  const controller = new AbortController();
  const timeoutMs = Number(options.timeoutMs) > 0 ? Number(options.timeoutMs) : 70000;
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      credentials: "include",
      headers: { "Content-Type": "application/json", "Bypass-Tunnel-Reminder": "true", ...(options.headers || {}) },
      signal: controller.signal,
      ...options
    });
  } catch (e) {
    const isAbort = String(e?.name || "").toLowerCase().includes("abort");
    throw new Error(isAbort
      ? "Backend is waking up (Render free tier). Please wait 60 seconds and try again."
      : "Network error. Check your internet and Backend URL (Render)."
    );
  } finally {
    clearTimeout(timer);
  }
  
  // Guard: if server returned HTML instead of JSON, the URL is wrong
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("text/html")) {
    console.error(`[API] Got HTML response from ${API_BASE_URL}${path} — clearing cached URL`);
    localStorage.removeItem("API_BASE_URL");
    throw new Error("Server returned HTML instead of JSON. The API URL may be incorrect. Please restart the app.");
  }
  
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.error || "Request failed");
  }
  return response.json();
}

console.log("[EduCore] API_BASE_URL resolved to:", API_BASE_URL);

async function warmupBackend() {
  if (!API_BASE_URL) return;
  try {
    // Don't block UI; just try to wake Render.
    await api("/api/health", { timeoutMs: 70000 });
  } catch {
    // ignore; login will show a readable message
  }
}

async function loadStore() {
  try {
    const data = await api("/api/store");
    if (data && typeof data === "object") {
      serverStore = data;
      try {
        localStorage.setItem("OFFLINE_STORE", JSON.stringify(data));
      } catch(e) {
        console.warn("Could not save OFFLINE_STORE (quota exceeded)", e);
      }
      cleanupOrphanedFaces();
    } else {
      throw new Error("Server returned invalid data format");
    }
  } catch (err) {
    console.warn("loadStore network failed, using offline cache:", err);
    // Show a helpful error to the user so they can tell us what's wrong
    if (!localStorage.getItem("OFFLINE_STORE")) {
      alert("Error loading data: " + err.message + "\n\nTip: Make sure you ran START_ONLINE_TUNNEL.bat on your PC and your phone has internet!");
    }
    
    try {
      const cached = localStorage.getItem("OFFLINE_STORE");
      if (cached) {
        serverStore = JSON.parse(cached);
        return;
      }
    } catch(e) {}
    if (!serverStore || typeof serverStore !== "object") {
      serverStore = {};
    }
  }
}

function cleanupOrphanedFaces() {
  const store = getStore();
  const faceStore = getFaceStore();
  if (!store.students && !store.teachers) return; // Don't clean if store is empty/failed
  
  let changed = false;
  Object.keys(faceStore).forEach(key => {
    const parts = key.split("|");
    if (parts.length < 2) return;
    const targetType = parts[0];
    const name = parts[1];

    const people = targetType === "teachers" ? (store.teachers || []) : (store.students || []);
    const exists = people.some(p => p.fullName === name);

    if (!exists) {
      console.log(`[FaceAI] Cleaning up orphaned face data for: ${name} (${targetType})`);
      delete faceStore[key];
      changed = true;
    }
  });

  if (changed) {
    saveFaceStore(faceStore);
    console.log("[FaceAI] Orphan cleanup complete.");
  }
}

function applyAuthUI(session) {
  const loggedIn = !!session;
  currentUser = session || null;
  
  const auth = document.getElementById("authOverlay");
  const appContainer = document.querySelector(".app");
  const vidyaFab = document.getElementById("vidyaFab");
  
  if (loggedIn) {
    if (auth) auth.classList.add("hidden");
    if (appContainer) appContainer.style.display = ""; 
    if (vidyaFab) vidyaFab.style.display = "flex";
  } else {
    if (auth) auth.classList.remove("hidden");
    if (appContainer) appContainer.style.display = "none";
    if (vidyaFab) vidyaFab.style.display = "none";
  }

  refs.authOverlay.classList.toggle("hidden", loggedIn);
  refs.activeUserBadge.textContent = loggedIn ? `${session.fullName} (${session.role})` : "Guest";

  if (loggedIn) {
    const role = String(session.role || "").toLowerCase();
    const roleColors = {
      administrator: "#dc2626",
      principal: "#7c3aed",
      staff: "#2563eb",
      teacher: "#059669",
      student: "#d97706"
    };
    refs.activeUserBadge.style.cssText = `
      background: ${roleColors[role] || "#64748b"};
      color: white;
      padding: 4px 10px;
      border-radius: 20px;
      font-size: 0.78rem;
      font-weight: 600;
    `;
  } else {
    refs.activeUserBadge.style.cssText = "";
  }
}

async function getSessionUser() {
  try {
    const data = await api("/api/auth/me");
    if (data && data.user) {
      localStorage.setItem("OFFLINE_USER", JSON.stringify(data.user));
    }
    return data.user;
  } catch (err) {
    console.warn("getSessionUser network failed, trying offline cache:", err);
    const cached = localStorage.getItem("OFFLINE_USER");
    if (cached) {
      return JSON.parse(cached);
    }
    throw err;
  }
}

async function login(username, password) {
  try {
    const data = await api("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password })
    });
    localStorage.setItem("OFFLINE_USER", JSON.stringify(data.user));
    return data.user;
  } catch(err) {
    throw err;
  }
}

async function signup(payload) {
  const data = await api("/api/auth/signup", {
    method: "POST",
    body: JSON.stringify(payload)
  });
  return data.user;
}

async function logout() {
  try {
    await api("/api/auth/logout", { method: "POST" });
  } catch(e) {}
  localStorage.removeItem("OFFLINE_USER");
  // Optionally, we could clear OFFLINE_STORE here, but keeping it allows offline viewing for the next user 
  // (which is fine for a school app with staff, but security-wise it's a tradeoff).
  // We will keep OFFLINE_STORE so the app works offline.
}

function setAuthMode(mode) {
  const isLogin = mode === "login";
  refs.loginForm.classList.toggle("hidden", !isLogin);
  refs.signupForm.classList.toggle("hidden", isLogin);
  refs.showLoginBtn.classList.toggle("active", isLogin);
  refs.showSignupBtn.classList.toggle("active", !isLogin);
  refs.authSubtitle.textContent = isLogin ? "Sign in to continue" : "Create account to continue";
}

function getVisibleModules() {
  if (!currentUser) return ["dashboard"];
  let mods = ["dashboard"];
  if (userIsAdmin()) mods = moduleOrder;
  else if (userIsStaffOrAbove()) mods = moduleOrder.filter(m => !ADMIN_ONLY_MODULES.has(m));
  else if (String(currentUser.role || "").toLowerCase() === "teacher") mods = moduleOrder.filter(m => TEACHER_VISIBLE_MODULES.has(m));
  else if (userIsStudent()) mods = moduleOrder.filter(m => STUDENT_VISIBLE_MODULES.has(m));
  
  // Ensure admissions is visible for all roles except Student
  if (moduleConfig.admissions && !userIsStudent()) {
    if (!mods.includes("admissions")) mods.push("admissions");
  }
  return mods;
}


function canCurrentUserWrite(moduleName) {
  if (!currentUser) return false;
  if (userIsAdmin()) return true;
  if (userIsStaffOrAbove()) return moduleName !== "users";
  if (String(currentUser.role || "").toLowerCase() === "teacher") return TEACHER_WRITE_MODULES.has(moduleName);
  return false; // student = read only
}

function canCurrentUserDelete() {
  if (!currentUser) return false;
  const role = String(currentUser.role || "").toLowerCase();
  return role === "administrator" || role === "principal";
}

function switchModule(name) {
  if (!moduleConfig[name]) return;
  currentModule = name;
  if(refs.searchInput) refs.searchInput.value = "";
  if (isMobileLayout()) setMobileSidebarOpen(false);
  
  // Update Bottom Nav active state
  document.querySelectorAll(".bottom-nav .nav-item").forEach(btn => {
    if (btn.dataset.target === name) btn.classList.add("active");
    else btn.classList.remove("active");
  });
  
  renderAll();
}

function renderNav() {
  refs.moduleNav.innerHTML = "";
  const visibleModules = new Set(getVisibleModules());

  moduleSections.forEach(sec => {
    // Check if any module in this section is visible
    const visibleInSection = sec.modules.filter(m => visibleModules.has(m));
    if (!visibleInSection.length) return;

    if (sec.label) {
      const h = document.createElement("div");
      h.className = "nav-section-label";
      h.textContent = sec.label;
      refs.moduleNav.appendChild(h);
    }

    visibleInSection.forEach(name => {
      const btn = document.createElement("button");
      btn.className = `nav-btn ${name === currentModule ? "active" : ""}`;
      const icon = moduleIcons[name] || "🔹";
      btn.innerHTML = `<span class="nav-icon">${icon}</span> <span class="nav-text">${moduleConfig[name].title}</span>`;
      btn.addEventListener("click", () => switchModule(name));
      refs.moduleNav.appendChild(btn);
    });
  });
}


// ── ADMISSION FORM LOGIC (REWRITTEN) ──
let admissionCurrentStep = 1;
let admissionDraft = {};

function calculateAge(dobString) {
  if (!dobString) return "";
  const dob = new Date(dobString);
  const diff = Date.now() - dob.getTime();
  const ageDate = new Date(diff);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
}

async function openAdmissionForm() {
  admissionCurrentStep = 1;
  
  // 1. Load Draft (Local first, then try Backend)
  loadAdmissionDraftLocal();
  try {
    const res = await api("/api/admissions/draft");
    if (res.draft) {
      admissionDraft = { ...admissionDraft, ...res.draft };
    }
  } catch (e) { console.warn("Could not fetch backend draft:", e); }

  const modal = document.createElement("div");
  modal.id = "admissionModalOverlay";
  modal.className = "admission-modal-overlay";
  modal.innerHTML = `
    <div class="admission-modal">
      <div class="admission-header">
        <h2>🎯 Student Admission</h2>
        <button class="admission-close" onclick="closeAdmissionForm()">✕</button>
      </div>
      <div class="step-progress">
        <div class="step-item active" data-step="1">
          <div class="step-circle">1</div>
          <div class="step-label">Basic Details</div>
        </div>
        <div class="step-item" data-step="2">
          <div class="step-circle">2</div>
          <div class="step-label">Parent Info</div>
        </div>
        <div class="step-item" data-step="3">
          <div class="step-circle">3</div>
          <div class="step-label">Academic Info</div>
        </div>
        <div class="step-item" data-step="4">
          <div class="step-circle">4</div>
          <div class="step-label">Finish & Pay</div>
        </div>
      </div>
      <div class="admission-body" id="admissionFormBody">
        <!-- Step 1: Student Basic Details -->
        <div class="step-content active" id="admissionStep1">
          <div class="admission-grid">
            <div class="admission-field">
              <label>Full Name *</label>
              <input type="text" id="adm_fullName" placeholder="Official records name" value="${admissionDraft.fullName || ""}">
            </div>
            <div class="admission-field">
              <label>Gender *</label>
              <select id="adm_gender">
                <option value="">Select</option>
                <option value="Male" ${admissionDraft.gender === "Male" ? "selected" : ""}>Male</option>
                <option value="Female" ${admissionDraft.gender === "Female" ? "selected" : ""}>Female</option>
                <option value="Other" ${admissionDraft.gender === "Other" ? "selected" : ""}>Other</option>
              </select>
            </div>
            <div class="admission-field">
              <label>Date of Birth *</label>
              <input type="date" id="adm_dob" value="${admissionDraft.dob || ""}" onchange="updateAdmAge()">
            </div>
            <div class="admission-field">
              <label>Age (Auto)</label>
              <input type="text" id="adm_age" value="${admissionDraft.age || ""}" readonly style="background:#f1f5f9">
            </div>
            <div class="admission-field">
              <label>Aadhaar Number</label>
              <input type="text" id="adm_aadhar" maxlength="12" placeholder="12-digit Aadhaar" value="${admissionDraft.aadhar || ""}">
            </div>
            <div class="admission-field">
              <label>Category</label>
              <select id="adm_category">
                <option value="General" ${admissionDraft.category === "General" ? "selected" : ""}>General</option>
                <option value="OBC" ${admissionDraft.category === "OBC" ? "selected" : ""}>OBC</option>
                <option value="SC" ${admissionDraft.category === "SC" ? "selected" : ""}>SC</option>
                <option value="ST" ${admissionDraft.category === "ST" ? "selected" : ""}>ST</option>
              </select>
            </div>
            <div class="admission-field">
              <label>Religion</label>
              <input type="text" id="adm_religion" placeholder="Hindu/Muslim/Sikh/etc" value="${admissionDraft.religion || ""}">
            </div>
            <div class="admission-field">
              <label>Primary Mobile *</label>
              <input type="tel" id="adm_phone1" maxlength="10" placeholder="Parent mobile" value="${admissionDraft.phone1 || ""}">
            </div>
            <div class="admission-field">
              <label>Secondary Mobile</label>
              <input type="tel" id="adm_phone2" maxlength="10" placeholder="Alternative number" value="${admissionDraft.phone2 || ""}">
            </div>
            <div class="admission-field">
              <label>WhatsApp Number</label>
              <div style="display:flex; gap:8px;">
                <input type="tel" id="adm_whatsapp" maxlength="10" value="${admissionDraft.whatsapp || ""}" style="flex:1">
                <button class="btn-back" style="padding:6px 12px; font-size:0.7rem; height:42px;" onclick="copyAdmPhone()">Same</button>
              </div>
            </div>
            <div class="admission-field" style="grid-column: 1 / -1; margin-top:10px;">
              <h4 style="font-size:0.9rem; color:#64748b; margin-bottom:10px; border-bottom:1px solid #e2e8f0; padding-bottom:5px;">Address Details</h4>
              <div class="admission-grid">
                <div class="admission-field"><label>Village/Area</label><input id="adm_village" value="${admissionDraft.village || ""}"></div>
                <div class="admission-field"><label>Post Office</label><input id="adm_post" value="${admissionDraft.post || ""}"></div>
                <div class="admission-field"><label>District</label><input id="adm_district" value="${admissionDraft.district || ""}"></div>
                <div class="admission-field"><label>State</label><input id="adm_state" value="${admissionDraft.state || "Uttar Pradesh"}"></div>
                <div class="admission-field"><label>PIN Code</label><input id="adm_pin" value="${admissionDraft.pin || ""}"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Step 2: Parent/Guardian Details -->
        <div class="step-content" id="admissionStep2">
          <div class="admission-grid">
            <div class="admission-field">
              <label>Father's Name *</label>
              <input type="text" id="adm_fatherName" value="${admissionDraft.fatherName || ""}">
            </div>
            <div class="admission-field">
              <label>Mother's Name *</label>
              <input type="text" id="adm_motherName" value="${admissionDraft.motherName || ""}">
            </div>
            <div class="admission-field">
              <label>Guardian Name</label>
              <input type="text" id="adm_guardianName" value="${admissionDraft.guardianName || ""}">
            </div>
            <div class="admission-field">
              <label>Relation with Guardian</label>
              <input type="text" id="adm_relation" value="${admissionDraft.relation || ""}">
            </div>
            <div class="admission-field">
              <label>Occupation</label>
              <input type="text" id="adm_occupation" value="${admissionDraft.occupation || ""}">
            </div>
            <div class="admission-field">
              <label>Annual Income Range</label>
              <select id="adm_incomeRange">
                <option value="Below 1 Lakh" ${admissionDraft.incomeRange === "Below 1 Lakh" ? "selected" : ""}>Below 1 Lakh</option>
                <option value="1 - 3 Lakhs" ${admissionDraft.incomeRange === "1 - 3 Lakhs" ? "selected" : ""}>1 - 3 Lakhs</option>
                <option value="3 - 5 Lakhs" ${admissionDraft.incomeRange === "3 - 5 Lakhs" ? "selected" : ""}>3 - 5 Lakhs</option>
                <option value="Above 5 Lakhs" ${admissionDraft.incomeRange === "Above 5 Lakhs" ? "selected" : ""}>Above 5 Lakhs</option>
              </select>
            </div>
            <div class="admission-field">
              <label>Emergency Contact *</label>
              <input type="tel" id="adm_emergencyContact" maxlength="10" value="${admissionDraft.emergencyContact || ""}">
            </div>
            <div class="admission-field">
              <label>Email ID</label>
              <input type="email" id="adm_email" value="${admissionDraft.email || ""}">
            </div>
          </div>
        </div>

        <!-- Step 3: Academic & Admission Info -->
        <div class="step-content" id="admissionStep3">
          <div class="admission-grid">
            <div class="admission-field">
              <label>Admission No (Generated)</label>
              <input type="text" id="adm_admissionNo" value="${admissionDraft.admissionNo || "TEMP-" + Date.now()}" readonly style="background:#f1f5f9">
            </div>
            <div class="admission-field">
              <label>Class Applying For *</label>
              <select id="adm_classApplyingFor" onchange="autoFillAdmissionFees(this.value)">
                <option value="">Select Class</option>
                ${(getStore().classes || []).map(c => `<option value="${c.className}" ${admissionDraft.classApplyingFor === c.className ? "selected" : ""}>${c.className}</option>`).join("")}
              </select>
            </div>
            <div class="admission-field">
              <label>Section</label>
              <select id="adm_section">
                <option value="A" ${admissionDraft.section === "A" ? "selected" : ""}>A</option>
                <option value="B" ${admissionDraft.section === "B" ? "selected" : ""}>B</option>
                <option value="C" ${admissionDraft.section === "C" ? "selected" : ""}>C</option>
              </select>
            </div>
            <div class="admission-field">
              <label>Session</label>
              <input type="text" id="adm_session" value="${admissionDraft.session || "2025-26"}">
            </div>
            <div class="admission-field">
              <label>Admission Date</label>
              <input type="date" id="adm_admissionDate" value="${admissionDraft.admissionDate || todayStr()}">
            </div>
            <div class="admission-field">
              <label>Previous School Name</label>
              <input type="text" id="adm_prevSchool" value="${admissionDraft.prevSchool || ""}">
            </div>
            <div class="admission-field">
              <label>Last Class Passed</label>
              <input type="text" id="adm_lastClassPassed" value="${admissionDraft.lastClassPassed || ""}">
            </div>
            <div class="admission-field">
              <label>Transfer Certificate (TC)?</label>
              <select id="adm_tcReceived">
                <option value="No" ${admissionDraft.tcReceived === "No" ? "selected" : ""}>No</option>
                <option value="Yes" ${admissionDraft.tcReceived === "Yes" ? "selected" : ""}>Yes</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Step 4: Documents & Fees -->
        <div class="step-content" id="admissionStep4">
          <div style="display:grid; grid-template-columns: 1fr 300px; gap:24px;">
            <div>
              <h4 style="margin-bottom:16px;">Document Uploads (Select files)</h4>
              <div class="upload-grid">
                <div class="upload-box" onclick="document.getElementById('up_photo').click()">
                  <i class="icon">📷</i><span>Student Photo</span>
                  <img id="prev_photo" class="upload-preview">
                  <input type="file" id="up_photo" hidden onchange="handleAdmUpload(this, 'photo')">
                </div>
                <div class="upload-box" onclick="document.getElementById('up_birth').click()">
                  <i class="icon">📜</i><span>Birth Cert</span>
                  <img id="prev_birth" class="upload-preview">
                  <input type="file" id="up_birth" hidden onchange="handleAdmUpload(this, 'birthCert')">
                </div>
                <div class="upload-box" onclick="document.getElementById('up_aadhar').click()">
                  <i class="icon">🆔</i><span>Aadhaar Card</span>
                  <img id="prev_aadhar" class="upload-preview">
                  <input type="file" id="up_aadhar" hidden onchange="handleAdmUpload(this, 'aadharDoc')">
                </div>
                <div class="upload-box" onclick="document.getElementById('up_tc').click()">
                  <i class="icon">📂</i><span>Transfer Cert</span>
                  <img id="prev_tc" class="upload-preview">
                  <input type="file" id="up_tc" hidden onchange="handleAdmUpload(this, 'tcDoc')">
                </div>
                <div class="upload-box" onclick="document.getElementById('up_parentId').click()">
                  <i class="icon">👤</i><span>Parent ID</span>
                  <img id="prev_parentId" class="upload-preview">
                  <input type="file" id="up_parentId" hidden onchange="handleAdmUpload(this, 'parentIdDoc')">
                </div>
              </div>

              <h4 style="margin:24px 0 16px;">Fee Setup</h4>
              <div class="admission-grid">
                <div class="admission-field"><label>Admission Fee</label><input type="number" id="adm_admissionFee" value="${admissionDraft.admissionFee || ""}"></div>
                <div class="admission-field"><label>Monthly Fee</label><input type="number" id="adm_monthlyFee" value="${admissionDraft.monthlyFee || ""}"></div>
                <div class="admission-field"><label>Transport Fee</label><input type="number" id="adm_transportFee" value="${admissionDraft.transportFee || ""}"></div>
                <div class="admission-field"><label>Discount/Scholarship</label><input type="number" id="adm_discount" value="${admissionDraft.discount || ""}"></div>
              </div>
            </div>
            <div id="admissionPreview">
              <!-- Summary preview injected here -->
            </div>
          </div>
        </div>
      </div>
      <div class="admission-footer">
        <div class="draft-status">
          <span id="admDraftStatus">Draft auto-saved locally</span>
          <button class="btn-back" style="padding:4px 10px; font-size:0.7rem; margin-left:10px;" onclick="saveAdmissionDraft(true)">Save to Cloud</button>
        </div>
        <div style="display:flex; gap:12px;">
          <button class="btn-back" id="admBtnBack" onclick="changeAdmStep(-1)" style="visibility:hidden">Back</button>
          <button class="btn-next" id="admBtnNext" onclick="changeAdmStep(1)">Next Step</button>
          <button class="btn-submit hidden" id="admBtnSubmit" onclick="submitAdmission()">Finalize Admission</button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  
  // Attach listeners for auto-save
  modal.querySelectorAll("input, select, textarea").forEach(input => {
    input.addEventListener("input", () => saveAdmissionDraft(false));
  });

  // Restore previews if data exists
  ['photo', 'birthCert', 'aadharDoc', 'tcDoc', 'parentIdDoc'].forEach(key => {
    if (admissionDraft[key]) {
      const img = document.getElementById('prev_' + key);
      if (img) { img.src = admissionDraft[key]; img.style.display = 'block'; }
    }
  });

  window.closeAdmissionForm = () => modal.remove();
  window.updateAdmAge = () => {
    const dob = document.getElementById("adm_dob").value;
    const ageEl = document.getElementById("adm_age");
    if (ageEl) ageEl.value = calculateAge(dob);
    saveAdmissionDraft(false);
  };
  window.copyAdmPhone = () => {
    const p = document.getElementById("adm_phone1").value;
    const w = document.getElementById("adm_whatsapp");
    if (w) w.value = p;
    saveAdmissionDraft(false);
  };
  window.autoFillAdmissionFees = (cls) => {
    const structures = getStore().feeStructures || [];
    const monthly = structures.find(f => f.className === cls && f.feeType?.toLowerCase().includes("monthly"))?.amount || "";
    const admission = structures.find(f => f.className === cls && f.feeType?.toLowerCase().includes("admission"))?.amount || "";
    if (monthly) document.getElementById("adm_monthlyFee").value = monthly;
    if (admission) document.getElementById("adm_admissionFee").value = admission;
    saveAdmissionDraft(false);
  };
  window.handleAdmUpload = async (input, key) => {
    const file = input.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) return showToast("File size too large (>2MB)", "error");
    
    try {
      const dataUrl = await fileToResizedDataUrl(file, 600, 0.8);
      admissionDraft[key] = dataUrl;
      const prev = document.getElementById('prev_' + key);
      if (prev) { prev.src = dataUrl; prev.style.display = 'block'; }
      saveAdmissionDraft(false);
    } catch (e) { showToast("Upload failed", "error"); }
  };
  window.changeAdmStep = (delta) => {
    if (delta > 0 && !validateAdmStep(admissionCurrentStep)) return;
    admissionCurrentStep += delta;
    
    document.querySelectorAll(".step-item").forEach(item => {
      const s = parseInt(item.dataset.step);
      item.classList.toggle("active", s === admissionCurrentStep);
      item.classList.toggle("completed", s < admissionCurrentStep);
    });
    
    document.querySelectorAll(".step-content").forEach((c, idx) => {
      c.classList.toggle("active", idx + 1 === admissionCurrentStep);
    });
    
    document.getElementById("admBtnBack").style.visibility = admissionCurrentStep === 1 ? "hidden" : "visible";
    const nextBtn = document.getElementById("admBtnNext");
    const submitBtn = document.getElementById("admBtnSubmit");
    
    if (admissionCurrentStep === 4) {
      nextBtn.classList.add("hidden");
      submitBtn.classList.remove("hidden");
      renderAdmPreview();
    } else {
      nextBtn.classList.remove("hidden");
      submitBtn.classList.add("hidden");
    }
  };
}

function validateAdmStep(step) {
  const req = {
    1: ["adm_fullName", "adm_gender", "adm_dob", "adm_phone1"],
    2: ["adm_fatherName", "adm_motherName", "adm_emergencyContact"],
    3: ["adm_classApplyingFor"]
  };
  if (!req[step]) return true;
  for (let id of req[step]) {
    const el = document.getElementById(id);
    if (!el || !el.value.trim()) {
      showToast("Please fill all required fields (*) in this step", "error");
      el?.focus();
      return false;
    }
  }
  return true;
}

function saveAdmissionDraft(toBackend = false) {
  const draft = { ...admissionDraft };
  const modal = document.getElementById("admissionModalOverlay");
  if (modal) {
    modal.querySelectorAll("input, select, textarea").forEach(i => {
      if (i.id.startsWith("adm_")) draft[i.id.replace("adm_", "")] = i.value;
    });
  }
  admissionDraft = draft;
  localStorage.setItem("tps_admission_draft_v2", JSON.stringify(draft));
  const statusEl = document.getElementById("admDraftStatus");
  if (statusEl) statusEl.textContent = "Saved locally at " + new Date().toLocaleTimeString();

  if (toBackend) {
    api("/api/admissions/draft", {
      method: "POST",
      body: JSON.stringify(draft)
    }).then(() => showToast("Draft saved to cloud", "success"))
      .catch(() => showToast("Cloud save failed", "error"));
  }
}

function loadAdmissionDraftLocal() {
  const saved = localStorage.getItem("tps_admission_draft_v2");
  if (saved) {
    try { admissionDraft = JSON.parse(saved); } catch { admissionDraft = {}; }
  }
}

function renderAdmPreview() {
  const d = admissionDraft;
  const preview = document.getElementById("admissionPreview");
  if (!preview) return;
  preview.innerHTML = `
    <div class="preview-card">
      <div class="preview-section">
        <h4>${d.fullName || "New Student"}</h4>
        <div class="preview-grid">
          <div class="preview-item"><span>Gender:</span> ${d.gender}</div>
          <div class="preview-item"><span>Age:</span> ${d.age}</div>
          <div class="preview-item"><span>Phone:</span> ${d.phone1}</div>
          <div class="preview-item"><span>Class:</span> ${d.classApplyingFor}</div>
        </div>
      </div>
      <div class="preview-section">
        <h4>Parents</h4>
        <div class="preview-item"><span>Father:</span> ${d.fatherName}</div>
        <div class="preview-item"><span>Mother:</span> ${d.motherName}</div>
      </div>
      <div class="preview-section" style="background:#fff7ed; border-color:#fed7aa;">
        <h4>Financials</h4>
        <div class="preview-item"><span>Adm Fee:</span> ₹${d.admissionFee || 0}</div>
        <div class="preview-item"><span>Monthly:</span> ₹${d.monthlyFee || 0}</div>
        <div class="preview-item"><span>Discount:</span> ₹${d.discount || 0}</div>
      </div>
    </div>
  `;
}

async function submitAdmission() {
  if (!confirm("Finalize this admission? Student will be added to the pending list.")) return;
  try {
    showLoader("Registering student...");
    const payload = { ...admissionDraft, isDraft: "false", status: "Pending" };
    const res = await api("/api/modules/admissions", { method: "POST", body: JSON.stringify(payload) });
    hideLoader();
    showToast("Admission Successful!", "success");
    localStorage.removeItem("tps_admission_draft_v2");
    closeAdmissionForm();
    if (confirm("Print Admission Form?")) generateAdmissionPDF(res);
    renderAll();
  } catch (err) {
    hideLoader();
    showToast(err.message || "Failed to submit admission", "error");
  }
}

function generateAdmissionPDF(student) {
  if (typeof jspdf === "undefined") return showToast("PDF Library not loaded", "error");
  const { jsPDF } = jspdf;
  const doc = new jsPDF();
  const primary = [30, 64, 175];
  
  // Header
  doc.setFillColor(248, 250, 252); doc.rect(0, 0, 210, 45, 'F');
  doc.setFontSize(24); doc.setTextColor(...primary); doc.setFont("helvetica", "bold");
  doc.text("TAPOWAN PUBLIC SCHOOL", 105, 20, { align: "center" });
  doc.setFontSize(10); doc.setTextColor(100); doc.text("Quality Education for a Brighter Future", 105, 28, { align: "center" });
  doc.setFontSize(14); doc.setTextColor(0); doc.text("STUDENT ADMISSION FORM", 105, 38, { align: "center" });
  
  // Student Info
  let y = 60;
  doc.setFontSize(12); doc.setTextColor(...primary); doc.text("BASIC DETAILS", 20, y);
  doc.setDrawColor(...primary); doc.line(20, y + 2, 60, y + 2);
  y += 12;
  doc.setFontSize(10); doc.setTextColor(0); doc.setFont("helvetica", "normal");
  const row = (l, v) => {
    doc.setFont("helvetica", "bold"); doc.text(l + ":", 25, y);
    doc.setFont("helvetica", "normal"); doc.text(String(v || "N/A"), 75, y);
    y += 8;
  };
  row("Admission No", student.admissionNo);
  row("Full Name", student.fullName);
  row("Class/Session", `${student.classApplyingFor || student.className} (${student.session})`);
  row("Date of Birth", `${student.dob} (${student.age} yrs)`);
  row("Aadhaar No", student.aadhar);
  row("Category", student.category);
  
  y += 5;
  doc.setFontSize(12); doc.setTextColor(...primary); doc.text("PARENT & CONTACT", 20, y);
  y += 12;
  row("Father Name", student.fatherName);
  row("Mother Name", student.motherName);
  row("Contact 1", student.phone1);
  row("WhatsApp", student.whatsapp);
  row("Full Address", student.address || `${student.village}, ${student.district}, ${student.pin}`);

  y += 5;
  doc.setFontSize(12); doc.setTextColor(...primary); doc.text("FEES & ACADEMIC", 20, y);
  y += 12;
  row("Prev School", student.prevSchool);
  row("Admission Fee", "Rs. " + (student.admissionFee || 0));
  row("Monthly Fee", "Rs. " + (student.monthlyFee || 0));
  
  // Footer
  doc.setFontSize(8); doc.setTextColor(150);
  doc.text("Generated on " + new Date().toLocaleString(), 105, 285, { align: "center" });
  doc.save(`Admission_${student.admissionNo}.pdf`);
}
async function approveAdmission(admissionId) {
  if (!confirm("Are you sure you want to approve this admission? The student will be moved to the Active Students list.")) return;
  
  try {
    showLoader("Processing approval...");
    const admission = await api(`/api/admissions/${admissionId}`);
    if (!admission || admission.error) throw new Error("Admission not found");
    
    // 1. Create student record
    const studentPayload = { ...admission, status: "Active" };
    studentPayload.className = admission.classApplyingFor || admission.className;
    studentPayload.phone = admission.phone1 || admission.phone;
    delete studentPayload.id; // New ID for students table
    
    const studentRes = await api("/api/students", {
      method: "POST",
      body: JSON.stringify(studentPayload)
    });
    
    if (studentRes.error) throw new Error("Could not create student: " + studentRes.error);
    
    // 2. Update admission status to Approved
    await api(`/api/admissions/${admissionId}`, {
      method: "PUT",
      body: JSON.stringify({ status: "Approved" })
    });
    
    hideLoader();
    showToast("Admission Approved! Student record created.", "success");
    renderAll();
  } catch (err) {
    hideLoader();
    showToast("Approval failed: " + err.message, "error");
  }
}

async function rejectAdmission(admissionId) {
  const reason = prompt("Enter reason for rejection (optional):");
  if (reason === null) return;
  
  try {
    showLoader("Rejecting application...");
    await api(`/api/admissions/${admissionId}`, {
      method: "PUT",
      body: JSON.stringify({ status: "Rejected", remarks: reason })
    });
    hideLoader();
    showToast("Application Rejected", "warning");
    renderAll();
  } catch (err) {
    hideLoader();
    showToast("Action failed: " + err.message, "error");
  }
}

window.printAdmissionById = async (id) => {
  const store = getStore();
  const adm = (store.admissions || []).find(a => Number(a.id) === Number(id));
  if (adm) {
    generateAdmissionPDF(adm);
  } else {
    showToast("Admission record not found", "error");
  }
};



function renderForm() {
  const cfg = moduleConfig[currentModule];
  refs.dynamicForm.innerHTML = "";
  if (!cfg.fields.length) return;

  // Hide form for roles that cannot write to this module
  if (!canCurrentUserWrite(currentModule)) {
    refs.dynamicForm.innerHTML = `
      <div style="padding:14px 18px;background:#fef9c3;border:1px solid #fde68a;border-radius:10px;color:#92400e;font-size:0.9rem;display:flex;align-items:center;gap:8px;">
        <span>🔒</span>
        <span>You have <strong>read-only</strong> access to this module. Contact your administrator to make changes.</span>
      </div>`;
    return;
  }

  // Inject Due Alert Container for Fees module
  if (currentModule === "fees") {
    const dueContainer = document.createElement("div");
    dueContainer.id = "bd-due-alert-container";
    dueContainer.style.width = "100%";
    dueContainer.style.gridColumn = "1 / -1";
    dueContainer.style.marginBottom = "10px";
    refs.dynamicForm.appendChild(dueContainer);
  }

  if (currentModule === "dueManagement") {
    const store = getStore();
    const studentOptions = (store.students || []).map((s) => ({
      value: s.fullName,
      label: `${s.admissionNo ? `${s.admissionNo} - ` : ""}${s.fullName}${s.rollNo ? ` (${s.rollNo})` : ""}${s.parentName ? ` (F: ${s.parentName})` : ""}${s.className ? ` - ${s.className}` : ""}`,
      rollNo: s.rollNo || "",
      className: s.className || "",
      parentName: s.parentName || "",
      admissionNo: s.admissionNo || ""
    }));
    const classOptions = Array.from(new Set((store.classes || []).map((x) => [x.className, x.section].filter(Boolean).join("-")).filter(Boolean)));
    const formRefs = {};
    
    let initialValues = {};
    if (editRecordId != null) {
      initialValues = (store.dueManagement || []).find(r => r.id === editRecordId) || {};
    }

    renderDueManagementForm(cfg, studentOptions, classOptions, initialValues, formRefs);
    return;
  }
  const store = getStore();

  const classOptions = Array.from(new Set((store.classes || []).map((x) => [x.className, x.section].filter(Boolean).join("-")).filter(Boolean)));
    const studentOptions = (store.students || []).map((s) => ({
      value: s.fullName,
      label: `${s.admissionNo ? `${s.admissionNo} - ` : ""}${s.fullName}${s.rollNo ? ` (${s.rollNo})` : ""}${s.className ? ` - ${s.className}` : ""}`,
      rollNo: s.rollNo || "",
      className: s.className || "",
      parentName: s.parentName || "",
      admissionNo: s.admissionNo || ""
    }));
  const teacherOptions = (store.teachers || []).map((t) => ({
    value: t.fullName,
    label: `${t.fullName}${t.employeeNo ? ` (${t.employeeNo})` : ""}${t.department ? ` - ${t.department}` : ""}`,
    department: t.department || ""
  }));
  const subjectOptions = Array.from(new Set((store.subjects || []).map((x) => x.subjectName).filter(Boolean)));
  const departmentOptions = Array.from(new Set((store.teachers || []).map((x) => x.department).filter(Boolean)));
  const statusOptionsByModule = {
    students: ["Active", "Inactive"],
    attendance: ["Present", "Absent", "Late", "Leave"],
    teacherAttendance: ["Present", "Absent", "Late", "Leave"],
    fees: ["Paid", "Partial", "Pending"],
    hostel: ["Active", "Inactive"],
    library: ["Issued", "Returned"],
    users: ["Active", "Inactive"]
  };

  const formRefs = {};

  cfg.fields.forEach(field => {
    const wrapper = document.createElement("div");
    wrapper.className = "field";
    const label = document.createElement("label");
    label.textContent = toLabel(field);
    let input;

    const selectFrom = (options, mapFn, useDatalist = false) => {
      if (useDatalist) {
        const select = document.createElement("select");
        select.name = field;
        select.required = true;
        select.placeholder = `Select or type ${toLabel(field)}...`;
        
        const defaultOption = document.createElement("option");
        defaultOption.value = "";
        defaultOption.textContent = select.placeholder;
        select.appendChild(defaultOption);

        options.forEach((opt) => {
          const { value, label: itemLabel } = mapFn(opt);
          const option = document.createElement("option");
          option.value = value;
          option.textContent = itemLabel;
          select.appendChild(option);
        });
        
        select.dataset.tomselect = "true";
        return select;
      }

      const select = document.createElement("select");
      select.name = field;
      select.required = true;
      const defaultOption = document.createElement("option");
      defaultOption.value = "";
      defaultOption.textContent = `Select ${toLabel(field)}`;
      select.appendChild(defaultOption);
      options.forEach((opt) => {
        const { value, label: itemLabel } = mapFn(opt);
        const option = document.createElement("option");
        option.value = value;
        option.textContent = itemLabel;
        select.appendChild(option);
      });
      return select;
    };

    const isClassReferenceField = (field === "className" || field === "classApplyingFor") && currentModule !== "classes";
    const isTeacherReferenceField = ["teacherName", "classTeacher", "teacher", "employeeName"].includes(field) && currentModule !== "teachers";

    if (currentModule === "classes" && field === "className") {
      input = selectFrom(CLASS_STANDARD_OPTIONS, (opt) => ({ value: opt, label: opt }));
    } else if (field === "studentName" || field === "issuedTo") {
      input = selectFrom(studentOptions, (opt) => ({ value: opt.value, label: opt.label }), true);
    } else if (isTeacherReferenceField) {
      input = selectFrom(teacherOptions, (opt) => ({ value: opt.value, label: opt.label }), true);
    } else if (isClassReferenceField) {
      input = selectFrom(classOptions, (opt) => ({ value: opt, label: opt }));
      if (!classOptions.length) {
        input.required = false;
        input.disabled = true;
        input.innerHTML = `<option value="">No classes available</option>`;
      }
    } else if (field === "subject" && currentModule !== "subjects") {
      input = selectFrom(subjectOptions, (opt) => ({ value: opt, label: opt }));
      if (!subjectOptions.length) {
        input.required = false;
        input.disabled = true;
        input.innerHTML = `<option value="">No subjects available</option>`;
      }
    } else if (field === "department") {
      input = selectFrom(departmentOptions, (opt) => ({ value: opt, label: opt }));
      if (!departmentOptions.length) {
        input.required = false;
        input.disabled = true;
        input.innerHTML = `<option value="">No departments available</option>`;
      }
    } else if (currentModule === "users" && field === "role") {
      const roleOptions = userIsAdmin()
        ? ["Administrator", "Staff", "Teacher", "Student", "Principal"]
        : ["Student"];
      input = selectFrom(roleOptions, (opt) => ({ value: opt, label: opt }));
      input.value = "Student";
    } else if (field === "status") {
      const statusOptions = statusOptionsByModule[currentModule] || ["Active", "Inactive"];
      input = selectFrom(statusOptions, (opt) => ({ value: opt, label: opt }));
      if (currentModule === "students") input.value = "Active";
      // For fees, status is auto-calculated from totalFee vs paidAmount — disable the dropdown
      if (currentModule === "fees") {
        input.disabled = true;
        input.title = "Auto-calculated: Paid / Partial / Pending based on amounts";
        input.style.background = "#f1f5f9";
        input.style.cursor = "not-allowed";
        input.style.color = "#64748b";
        // Insert a helper note after the label
        const note = document.createElement("span");
        note.style.cssText = "font-size:0.72rem;color:#64748b;display:block;margin-top:2px;";
        note.textContent = "Auto-set based on Total Fee vs Amount Paid";
        label.appendChild(note);
      }
    } else if (currentModule === "fees" && field === "paymentMethod") {
      input = selectFrom(["Cash", "Online", "Online + Cash"], (opt) => ({ value: opt, label: opt }));
      input.id = "paymentMethodSelect";
    } else if ((currentModule === "students" || currentModule === "admissions") && ["photo", "aadhar", "tc", "reportCard", "fatherAadhar", "motherAadhar", "birthCert", "aadharDoc", "tcDoc", "parentIdDoc"].includes(field)) {
      input = document.createElement("input");
      input.type = "file";
      input.name = field;
      input.accept = "image/*";
      input.required = false;
    } else {
      input = document.createElement("input");
      input.name = field;
      input.required = true;
      if (field === "paymentMethod" || field === "paymentDate" || field === "balance" || field === "totalFee" || field === "onlineAmount" || field === "cashAmount") input.required = false;
      if (field.endsWith("Time")) {
        input.required = false; 
        input.type = "time";
      } else if (field.toLowerCase().includes("date") || field === "dob") input.type = "date";
      else if (["email"].includes(field)) input.type = "email";
      else if (field === "password") { input.type = "password"; input.required = false; input.placeholder = "Leave blank to keep unchanged"; }
      else if (["phone"].includes(field)) input.type = "tel";
      else if (["marksObtained", "maxMarks", "totalFee", "paidAmount", "balance", "monthlyFee", "basicSalary", "allowances", "deductions", "netPay", "credits", "capacity", "onlineAmount", "cashAmount"].includes(field)) input.type = "number";
    }

    if (currentModule === "fees" && (field === "onlineAmount" || field === "cashAmount")) {
      wrapper.id = field + "Wrapper";
      wrapper.style.display = "none";
    }

    formRefs[field] = input;
    if (field === "password") {
      const passGroup = document.createElement("div");
      passGroup.style.cssText = "position:relative; display:flex; align-items:center; width:100%;";
      input.style.width = "100%";
      input.style.paddingRight = "35px";
      
      const toggleBtn = document.createElement("button");
      toggleBtn.type = "button";
      toggleBtn.innerHTML = "👁️";
      toggleBtn.style.cssText = "position:absolute; right:12px; background:none; border:none; cursor:pointer; font-size:1.1rem; opacity:0.5; padding:0; transition:opacity 0.2s;";
      toggleBtn.title = "Show Password";
      
      toggleBtn.addEventListener("click", () => {
        if (input.type === "password") {
          input.type = "text";
          toggleBtn.innerHTML = "🙈";
          toggleBtn.title = "Hide Password";
        } else {
          input.type = "password";
          toggleBtn.innerHTML = "👁️";
          toggleBtn.title = "Show Password";
        }
      });
      toggleBtn.addEventListener("mouseover", () => toggleBtn.style.opacity = "1");
      toggleBtn.addEventListener("mouseout", () => toggleBtn.style.opacity = "0.5");
      
      passGroup.append(input, toggleBtn);
      wrapper.append(label, passGroup);
    } else {
      wrapper.append(label, input);
    }
    
    if (input.__datalist) wrapper.append(input.__datalist);
    refs.dynamicForm.appendChild(wrapper);
  });

  // Auto-fill class and roll number when selecting a student.
  if (formRefs.studentName) {
    formRefs.studentName.addEventListener("change", () => {
      const selected = studentOptions.find((s) => s.value === formRefs.studentName.value);
      if (!selected) return;
      if (formRefs.className) {
        formRefs.className.value = selected.className || formRefs.className.value;
        // Dispatch change so BD fee-type checkboxes reload for the auto-filled class
        formRefs.className.dispatchEvent(new Event("change"));
      }
      if (formRefs.rollNo) formRefs.rollNo.value = selected.rollNo || formRefs.rollNo.value;
      if (formRefs.parentName) formRefs.parentName.value = selected.parentName || formRefs.parentName.value;
      if (formRefs.admissionNo) {
        formRefs.admissionNo.value = selected.admissionNo || formRefs.admissionNo.value;
        // Trigger due alert update
        if (typeof renderStudentDueAlert === "function") {
          renderStudentDueAlert(formRefs.admissionNo.value);
        }
      }
    });
  }

  // Filter student dropdown when class is changed (fees, attendance, etc.)
  if (formRefs.className && formRefs.studentName && (currentModule === "fees" || currentModule === "attendance")) {
    formRefs.className.addEventListener("change", () => {
      const selectedClass = formRefs.className.value;
      const studentSelect = formRefs.studentName;
      const currentStudentVal = studentSelect.value;
      
      const targetElement = studentSelect.tomselect ? studentSelect.tomselect : studentSelect;
      
      if (studentSelect.tomselect) {
        studentSelect.tomselect.clearOptions();
        studentSelect.tomselect.addOption({value: "", text: `Select or type ${toLabel(studentSelect.name)}...`});
      } else {
        targetElement.innerHTML = "";
        if (!studentSelect.__datalist) {
          const defaultOpt = document.createElement("option");
          defaultOpt.value = "";
          defaultOpt.textContent = "Select Student Name";
          targetElement.appendChild(defaultOpt);
        }
      }
      
      const filtered = selectedClass 
        ? studentOptions.filter(s => s.className === selectedClass)
        : studentOptions;
      
      filtered.forEach(opt => {
        if (studentSelect.tomselect) {
          studentSelect.tomselect.addOption({value: opt.value, text: opt.label});
        } else {
          const option = document.createElement("option");
          option.value = opt.value;
          option.textContent = opt.label;
          targetElement.appendChild(option);
        }
      });
      
      if (currentStudentVal && filtered.some(s => s.value === currentStudentVal)) {
        if (studentSelect.tomselect) {
          studentSelect.tomselect.setValue(currentStudentVal);
        } else {
          studentSelect.value = currentStudentVal;
        }
      }
    });
  }
  // Auto-fill department from teacher selection when available.
  const teacherField = formRefs.teacherName || formRefs.classTeacher || formRefs.teacher || formRefs.employeeName;
  if (teacherField && formRefs.department) {
    teacherField.addEventListener("change", () => {
      const selected = teacherOptions.find((t) => t.value === teacherField.value);
      if (!selected) return;
      formRefs.department.value = selected.department || formRefs.department.value;
    });
  }

  // Prefill helper (used by Student Profile actions to reduce user work).
  if (pendingStudentPrefill && pendingStudentPrefill.module === currentModule) {
    const s = pendingStudentPrefill.student;
    if (formRefs.studentName && s.fullName) {
      formRefs.studentName.value = s.fullName;
      formRefs.studentName.dispatchEvent(new Event("change"));
    }
    if (formRefs.className && s.className) {
      formRefs.className.value = s.className;
      // Trigger change so BD fee-type checkboxes load for the prefilled class
      formRefs.className.dispatchEvent(new Event("change"));
    }
    if (formRefs.rollNo && s.rollNo) formRefs.rollNo.value = s.rollNo;
    if (formRefs.date && (currentModule === "attendance" || currentModule === "teacherAttendance")) formRefs.date.value = todayStr();
    if (formRefs.paymentDate && currentModule === "fees") formRefs.paymentDate.value = todayStr();
    if (formRefs.status && (currentModule === "attendance" || currentModule === "teacherAttendance")) formRefs.status.value = "Present";
    pendingStudentPrefill = null;
  }

  // Split Payment Handling (Fees Module)
  if (currentModule === "fees" && formRefs.paymentMethod) {
    const pm = formRefs.paymentMethod;
    const onlineWrap = document.getElementById("onlineAmountWrapper");
    const cashWrap = document.getElementById("cashAmountWrapper");

    const toggleSplit = () => {
      const isSplit = pm.value === "Online + Cash";
      if (onlineWrap) onlineWrap.style.display = isSplit ? "" : "none";
      if (cashWrap) cashWrap.style.display = isSplit ? "" : "none";
    };

    pm.addEventListener("change", toggleSplit);

    const calcTotal = () => {
      if (pm.value === "Online + Cash") {
        const online = parseFloat(formRefs.onlineAmount.value) || 0;
        const cash = parseFloat(formRefs.cashAmount.value) || 0;
        formRefs.paidAmount.value = online + cash;
        // Trigger input event to update balance/status if listeners exist
        formRefs.paidAmount.dispatchEvent(new Event("input"));
      }
    };

    if (formRefs.onlineAmount) formRefs.onlineAmount.addEventListener("input", calcTotal);
    if (formRefs.cashAmount) formRefs.cashAmount.addEventListener("input", calcTotal);

    const calcBalance = () => {
      const total = parseFloat(formRefs.totalFee.value) || 0;
      const paid = parseFloat(formRefs.paidAmount.value) || 0;
      const bal = Math.max(0, total - paid);
      formRefs.balance.value = bal;
      formRefs.status.value = bal <= 0 ? "Paid" : paid > 0 ? "Partial" : "Pending";
    };

    if (formRefs.totalFee) formRefs.totalFee.addEventListener("input", calcBalance);
    if (formRefs.paidAmount) formRefs.paidAmount.addEventListener("input", calcBalance);
  }

  const action = document.createElement("div");
  action.className = "actions";
  action.innerHTML = `<button type="submit">Save ${cfg.title}</button>`;
  refs.dynamicForm.appendChild(action);

  setTimeout(() => {
    refs.dynamicForm.querySelectorAll('select[data-tomselect="true"]').forEach(el => {
      if (!el.tomselect) {
        new TomSelect(el, {
          create: true,
          sortField: { field: "text", direction: "asc" },
          placeholder: el.getAttribute('placeholder'),
          allowEmptyOption: true
        });
      }
    });
  }, 0);
}

function getCurrentList() {
  if (currentModule === "dashboard") {
    return Object.entries(getDashboardStats(getStore())).map(([metric, value], idx) => ({ id: idx + 1, Metric: metric, Value: value }));
  }
  const store = getStore();
  const search = refs.searchInput.value.trim().toLowerCase();
  let list = (store[currentModule] || []).slice();
  
  if (currentModule === "attendance") {
    const teacherList = (store.teacherAttendance || []).map(t => ({
      ...t,
      studentName: t.teacherName,
      className: t.department || "Staff",
      rollNo: t.employeeNo || "Teacher",
      isTeacher: true
    }));
    list = [...list, ...teacherList];
    // Sort by date and arrival time (newest first)
    list.sort((a, b) => {
      const dateA = new Date(`${normalizeToISO(a.date)} ${a.arrivalTime || '00:00'}`);
      const dateB = new Date(`${normalizeToISO(b.date)} ${b.arrivalTime || '00:00'}`);
      return dateB - dateA;
    });
  }

  if (currentModule === "students" && refs.classFilter && !refs.classFilter.classList.contains("hidden")) {
    const classVal = refs.classFilter.value;
    if (classVal) {
      list = list.filter(item => String(item.className || "") === classVal);
    }
  }

  if (search) {
    list = list.filter(item => {
      // Priority fields for quick matching
      const p = (item.fullName || "").toLowerCase();
      const f = (item.fatherName || item.parentName || "").toLowerCase();
      const a = (item.admissionNo || "").toLowerCase();
      const r = (item.rollNo || "").toLowerCase();
      
      if (p.includes(search) || f.includes(search) || a.includes(search) || r.includes(search)) return true;
      
      // Fallback to broad search for other fields
      return JSON.stringify(item).toLowerCase().includes(search);
    });
  }
  return list;
}

function renderTable() {
  const cfg = moduleConfig[currentModule];
  refs.tableBody.innerHTML = "";

  const list = getCurrentList();
  if (currentModule === "dashboard") {
    refs.tableHead.innerHTML = `<tr style="color:#000000;font-weight:800;background:#f8fafc;"><th>Metric</th><th>Value</th></tr>`;
    list.forEach(item => {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td style="color:#000000;font-weight:600;">${item.Metric}</td><td><span class="badge" style="background:#eff6ff;color:#2563eb;">${item.Value}</span></td>`;
      refs.tableBody.appendChild(tr);
    });
    return;
  }

  refs.tableHead.innerHTML = `<tr>${cfg.columns.map(c => `<th style="color:#000000;font-weight:800;background:#f8fafc;">${toLabel(c)}</th>`).join("")}<th style="color:#000000;font-weight:800;background:#f8fafc;">Action</th></tr>`;
  if (!list.length) {
    refs.tableBody.appendChild(refs.emptyState.content.cloneNode(true));
    return;
  }

  list.forEach(item => {
    const tr = document.createElement("tr");
    const split = currentModule === "students" ? splitClassName(item.className) : { classPart: "", sectionPart: "" };

    const cells = cfg.columns.map(key => {
      let val = item[key] ?? "";
      
      // Special handle: Student module class/section split
      if (currentModule === "students") {
        if (key === "classPart") val = split.classPart;
        if (key === "sectionPart") val = split.sectionPart;
        if (key === "status" && !val) val = "Active";
      }

      const lbl = toLabel(key);
      // 1. Currency Formatting for Fee columns
      const feeKeys = ["totalFee", "paidAmount", "balance", "dueAmount", "monthlyFee", "netPay", "basicSalary", "onlineAmount", "cashAmount"];
      if (feeKeys.includes(key)) {
        const num = parseFloat(val) || 0;
        return `<td data-label="${lbl}" style="color:#000000; font-weight:700; white-space:nowrap;">₹ ${num.toLocaleString('en-IN')}</td>`;
      }

      // 2. Status Badge Formatting (Unified)
      if (key === "status") {
        const s = String(val).toLowerCase();
        let bg = "#f1f5f9", co = "#475569";
        if (s.includes("active") || s.includes("present") || s === "paid") { bg = "#dcfce7"; co = "#16a34a"; }
        if (s.includes("inactive") || s.includes("absent") || s === "pending") { bg = "#fee2e2"; co = "#dc2626"; }
        if (s.includes("late") || s === "partial" || s.includes("leave")) { bg = "#fef9c3"; co = "#854d0e"; }
        return `<td data-label="${lbl}"><span class="badge" style="background:${bg}; color:${co}; border-color:${co}44;">${val}</span></td>`;
      }

      // 3. Standard Text (High Contrast)
      let cellContent = `<td data-label="${lbl}" style="color:#000000; font-weight:600;">${val}`;
      if (currentModule === "attendance" && key === "studentName" && item.isTeacher) {
        cellContent += ` <span style="font-size:0.65rem; background:#7c3aed; color:white; padding:1px 5px; border-radius:4px; margin-left:4px;">Teacher</span>`;
      }
      return cellContent + `</td>`;
    }).join("");

    const canWrite = canCurrentUserWrite(currentModule);
    const canDel = canCurrentUserDelete();

    if (currentModule === "admissions") {
      const isPending = String(item.status).toLowerCase() === "pending";
      tr.innerHTML = `${cells}
        <td>
          <div style="display:flex; gap:6px; align-items:center;">
            ${isPending ? `<button class="btn-icon" onclick="approveAdmission(${item.id})" style="background:#dcfce7;color:#16a34a;padding:5px 12px;border:none;border-radius:10px;cursor:pointer;font-weight:700;font-size:0.75rem;">Approve</button>` : ""}
            ${isPending ? `<button class="btn-icon" onclick="rejectAdmission(${item.id})" style="background:#fee2e2;color:#dc2626;padding:5px 12px;border:none;border-radius:10px;cursor:pointer;font-weight:700;font-size:0.75rem;">Reject</button>` : ""}
            <button class="action-btn" onclick="printAdmissionById(${item.id})" style="background:#e0f2fe;color:#0369a1;border:none;padding:5px 8px;border-radius:6px;cursor:pointer;" title="Print Form">🖨️</button>
            <button class="action-btn action-edit" data-action="generic-edit" data-id="${item.id}" style="background:#f1f5f9;color:#475569;border:none;padding:5px 8px;border-radius:6px;cursor:pointer;">✏️</button>
            <button class="chip" data-delete-id="${item.id}" style="margin:0;">🗑️</button>
          </div>
        </td>`;
    } else if (currentModule === "students") {
      tr.innerHTML = `
        ${cells}
        <td>
          <div class="student-actions">
            <button class="action-btn action-view" data-action="view" data-id="${item.id}">View</button>
            ${canWrite ? `<button class="action-btn action-edit" data-action="edit" data-id="${item.id}">Edit</button>` : ""}
            ${canDel ? `<button class="chip" data-delete-id="${item.id}">Delete</button>` : ""}
          </div>
        </td>
      `;
    } else if (currentModule === "fees") {
      tr.innerHTML = `${cells}<td style="white-space:nowrap;">
        <button class="action-btn" data-action="print-receipt" data-id="${item.id}" style="margin-right:2px; background:#2563eb; color:#fff; border:none; padding:4px 8px;">🧾 RCP</button>
        <button class="action-btn" data-action="print-feeslip" data-id="${item.id}" style="margin-right:2px; background:#1e40af; color:#fff; border:none; padding:4px 8px;">📄 Slip</button>
        <button class="action-btn" data-action="whatsapp-slip" data-id="${item.id}" style="margin-right:2px; background:#16a34a; color:#fff; border:none; padding:4px 8px;">📲 WA</button>
        ${userIsAdmin() ? `<button class="action-btn" data-action="generic-edit" data-id="${item.id}" style="background:#475569; color:#fff; border:none; padding:4px 8px; margin-right:2px;">✏️</button>` : ""}
        ${canDel ? `<button class="chip" data-delete-id="${item.id}" style="margin-right:2px;">Delete</button>` : ""}
      </td>`;
    } else if (currentModule === "users" && userIsAdmin()) {
      tr.innerHTML = `${cells}<td style="white-space:nowrap;">
        <select class="role-assign-select" data-user-id="${item.id}" style="padding:4px 8px;border-radius:6px;border:1px solid #cbd5e1;font-size:0.8rem;margin-right:4px;">
          ${["Administrator","Staff","Teacher","Student","Principal"].map(r =>
            `<option value="${r}" ${item.role === r ? "selected" : ""}>${r}</option>`
          ).join("")}
        </select>
        <button class="action-btn" data-assign-role-id="${item.id}" style="padding:4px 10px;font-size:0.8rem;">Save</button>
        ${canWrite ? `<button class="action-btn action-edit" data-action="generic-edit" data-id="${item.id}" style="margin-left:4px;">✏️ Edit</button>` : ""}
        ${canDel ? `<button class="chip" data-delete-id="${item.id}" style="margin-left:4px;">Delete</button>` : ""}
      </td>`;
    } else {
      tr.innerHTML = `${cells}<td style="white-space:nowrap;">
        ${canWrite ? `<button class="action-btn action-edit" data-action="generic-edit" data-id="${item.id}" style="margin-right:4px;">✏️ Edit</button>` : ""}
        ${canDel ? `<button class="chip" data-delete-id="${item.id}">Delete</button>` : "—"}
      </td>`;
    }
    refs.tableBody.appendChild(tr);
  });

  refs.tableBody.querySelectorAll("button[data-delete-id]").forEach(btn => {
    btn.addEventListener("click", () => {
      if (!canCurrentUserDelete()) return window.alert("You don't have permission to delete records.");
      if (!window.confirm("Are you sure you want to delete this record?")) return;
      removeRecord(currentModule, Number(btn.dataset.deleteId)).then(renderAll).catch((e) => window.alert(e.message));
    });
  });

  // Role assignment (admin only — users module)
  if (currentModule === "users" && userIsAdmin()) {
    refs.tableBody.querySelectorAll("button[data-assign-role-id]").forEach(btn => {
      btn.addEventListener("click", async () => {
        const userId = Number(btn.dataset.assignRoleId);
        const select = refs.tableBody.querySelector(`select[data-user-id="${userId}"]`);
        const newRole = select?.value;
        if (!newRole) return;
        try {
          await api(`/api/modules/users/${userId}`, { method: "PUT", body: JSON.stringify({ role: newRole }) });
          await loadStore();
          renderAll();
          showToast(`Role updated to ${newRole}`, "success");
        } catch (err) {
          window.alert("Failed to update role: " + err.message);
        }
      });
    });
  }

  // Student View/Edit actions
  if (currentModule === "students") {
    refs.tableBody.querySelectorAll("button[data-action]").forEach(btn => {
      btn.addEventListener("click", () => {
        const action = btn.dataset.action;
        const id = Number(btn.dataset.id);
        if (action === "view") openStudentProfileById(id);
        if (action === "edit") startEditStudentById(id);
      });
    });
  }

  // Fee Receipt print action
  if (currentModule === "fees") {
    refs.tableBody.querySelectorAll("button[data-action='print-receipt']").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = Number(btn.dataset.id);
        const store = getStore();
        const f = (store.fees || []).find(x => x.id === id);
        if (f) printFeeReceipt(f);
      });
    });
    refs.tableBody.querySelectorAll("button[data-action='print-feeslip']").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = Number(btn.dataset.id);
        const store = getStore();
        const f = (store.fees || []).find(x => x.id === id);
        if (f) printFormalFeeSlip(f);
      });
    });
    refs.tableBody.querySelectorAll("button[data-action='whatsapp-slip']").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = Number(btn.dataset.id);
        if (typeof window.sendWhatsAppFeeSlip === "function") {
           window.sendWhatsAppFeeSlip(id);
        } else {
           showToast("WhatsApp module not loaded", "error");
        }
      });
    });
  }

  // Generic Edit action for all non-student modules
  refs.tableBody.querySelectorAll("button[data-action='generic-edit']").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = Number(btn.dataset.id);
      startGenericEditById(currentModule, id);
    });
  });
}

let activeStudentProfileTab = "profile";
let studentProfileStudent = null;

function closeStudentProfile() {
  if (!refs.studentProfileBackdrop || !refs.studentProfileModal) return;
  refs.studentProfileBackdrop.classList.add("hidden");
  refs.studentProfileModal.classList.add("hidden");
  refs.studentProfileContent.innerHTML = "";
  studentProfileStudent = null;
  activeStudentProfileTab = "profile";
  document.body?.classList?.remove("no-scroll");
}

function openStudentProfileById(studentId) {
  const store = getStore();
  const student = (store.students || []).find((s) => Number(s.id) === Number(studentId));
  if (!student) return window.alert("Student not found.");
  studentProfileStudent = student;
  activeStudentProfileTab = "profile";
  renderStudentProfile();
  refs.studentProfileBackdrop.classList.remove("hidden");
  refs.studentProfileModal.classList.remove("hidden");
  document.body?.classList?.add("no-scroll");
}

function setStudentProfileTab(tab) {
  activeStudentProfileTab = tab;
  renderStudentProfile();
}

function renderStudentProfile() {
  if (!studentProfileStudent) return;
  const student = studentProfileStudent;
  if (refs.studentProfileName) refs.studentProfileName.textContent = student.fullName || "Student";
  if (refs.studentProfileSub) {
    const split = splitClassName(student.className);
    const roll = student.rollNo ? ` • Roll ${student.rollNo}` : "";
    const classSec = [split.classPart, split.sectionPart].filter(Boolean).join("-");
    refs.studentProfileSub.textContent = `Class ${classSec || student.className || "-"}${roll}`;
  }

  if (refs.studentProfileTabs) {
    refs.studentProfileTabs.forEach((b) => {
      b.classList.toggle("active", b.dataset.tab === activeStudentProfileTab);
    });
  }

  // Content per tab
  if (activeStudentProfileTab === "profile") {
    const split = splitClassName(student.className);
    refs.studentProfileContent.innerHTML = `
      <div style="display:flex; flex-wrap:wrap; gap:20px; margin-bottom:20px;">
        <div style="flex:0 0 120px; display:flex; flex-direction:column; align-items:center; text-align:center;">
          <div style="width:100px; height:100px; border-radius:50%; background:linear-gradient(135deg, #eff6ff, #dbeafe); color:#2563eb; display:flex; align-items:center; justify-content:center; font-size:3rem; font-weight:800; margin:0 auto 12px; border:4px solid #fff; box-shadow:0 8px 20px rgba(37,99,235,0.15); overflow:hidden;">
            ${student.photo ? `<img src="${student.photo}" class="zoomable" onclick="openImageViewer('${student.photo}', 'Profile Photo')" style="width:100%; height:100%; object-fit:cover;" />` : (student.fullName ? student.fullName.charAt(0).toUpperCase() : "S")}
          </div>
          <span class="badge" style="background:#dcfce7; color:#16a34a; border-color:#bbf7d0; font-size:0.65rem; padding:3px 10px;">${student.status || "Active"}</span>
        </div>
        
        <div style="flex:1; min-width:250px; display:grid; grid-template-columns:repeat(auto-fit, minmax(110px, 1fr)); gap:10px;">
          <div style="background:#f8fafc; padding:10px; border-radius:12px; border:1px solid #e2e8f0;">
            <div style="font-size:0.62rem; color:#64748b; font-weight:800; text-transform:uppercase; margin-bottom:4px; letter-spacing:0.04em;">Full Name</div>
            <div style="color:#0f172a; font-weight:700; font-size:0.85rem;">${student.fullName || "-"}</div>
          </div>
          <div style="background:#f8fafc; padding:10px; border-radius:12px; border:1px solid #e2e8f0;">
            <div style="font-size:0.62rem; color:#64748b; font-weight:800; text-transform:uppercase; margin-bottom:4px; letter-spacing:0.04em;">Class & Sec</div>
            <div style="color:#0f172a; font-weight:700; font-size:0.85rem;">${split.classPart || "-"} ${split.sectionPart ? `(${split.sectionPart})` : ""}</div>
          </div>
          <div style="background:#f8fafc; padding:10px; border-radius:12px; border:1px solid #e2e8f0;">
            <div style="font-size:0.62rem; color:#64748b; font-weight:800; text-transform:uppercase; margin-bottom:4px; letter-spacing:0.04em;">Roll Number</div>
            <div style="color:#0f172a; font-weight:700; font-size:0.85rem;">${student.rollNo || "-"}</div>
          </div>
          <div style="background:#f8fafc; padding:10px; border-radius:12px; border:1px solid #e2e8f0;">
            <div style="font-size:0.62rem; color:#64748b; font-weight:800; text-transform:uppercase; margin-bottom:4px; letter-spacing:0.04em;">Date of Birth</div>
            <div style="color:#0f172a; font-weight:700; font-size:0.85rem;">${student.dob || "-"}</div>
          </div>
          <div style="background:#f8fafc; padding:10px; border-radius:12px; border:1px solid #e2e8f0;">
            <div style="font-size:0.62rem; color:#64748b; font-weight:800; text-transform:uppercase; margin-bottom:4px; letter-spacing:0.04em;">Gender</div>
            <div style="color:#0f172a; font-weight:700; font-size:0.85rem;">${student.gender || "-"}</div>
          </div>
          <div style="background:#f8fafc; padding:10px; border-radius:12px; border:1px solid #e2e8f0; grid-column:1/-1;">
            <div style="font-size:0.62rem; color:#64748b; font-weight:800; text-transform:uppercase; margin-bottom:4px; letter-spacing:0.04em;">Address</div>
            <div style="color:#0f172a; font-weight:700; font-size:0.85rem;">${student.address || "-"}</div>
          </div>
        </div>
      </div>

      <h4 style="font-size:0.82rem; font-weight:800; color:#334155; margin-bottom:10px; padding-bottom:6px; border-bottom:2px solid #f1f5f9;">Family & Contact</h4>
      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:10px; margin-bottom:20px;">
        <div style="display:flex; align-items:center; gap:12px; background:#fff; padding:12px; border-radius:14px; border:1px solid #e2e8f0;">
          <div style="width:36px; height:36px; background:#eff6ff; color:#3b82f6; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:1.1rem;">👨‍👩‍👧</div>
          <div>
            <div style="font-size:0.62rem; color:#64748b; font-weight:800; text-transform:uppercase; letter-spacing:0.04em;">Parent / Guardian</div>
            <div style="color:#0f172a; font-weight:700; font-size:0.85rem;">${student.fatherName || student.parentName || "-"}</div>
          </div>
        </div>
        <div style="display:flex; align-items:center; gap:12px; background:#fff; padding:12px; border-radius:14px; border:1px solid #e2e8f0;">
          <div style="width:36px; height:36px; background:#fdf2f8; color:#be185d; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:1.1rem;">👩</div>
          <div>
            <div style="font-size:0.62rem; color:#64748b; font-weight:800; text-transform:uppercase; letter-spacing:0.04em;">Mother's Name</div>
            <div style="color:#0f172a; font-weight:700; font-size:0.85rem;">${student.motherName || "-"}</div>
          </div>
        </div>
        <div style="display:flex; align-items:center; justify-content:space-between; background:#fff; padding:12px; border-radius:14px; border:1px solid #e2e8f0;">
          <div style="display:flex; align-items:center; gap:12px;">
            <div style="width:36px; height:36px; background:#f0fdf4; color:#16a34a; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:1.1rem;">📞</div>
            <div>
              <div style="font-size:0.62rem; color:#64748b; font-weight:800; text-transform:uppercase; letter-spacing:0.04em;">Mobile Number</div>
              <div style="color:#0f172a; font-weight:700; font-size:0.85rem;">${student.phone1 || student.phone || "-"}</div>
            </div>
          </div>
          ${(student.phone1 || student.phone) ? `<a href="https://wa.me/91${(student.phone1 || student.phone).replace(/\D/g,'')}" target="_blank" title="WhatsApp Parent" style="width:32px; height:32px; background:linear-gradient(135deg, #25D366, #128C7E); color:#fff; border-radius:8px; display:flex; align-items:center; justify-content:center; text-decoration:none;">💬</a>` : ''}
        </div>
      </div>

      <h4 style="font-size:0.82rem; font-weight:800; color:#334155; margin-bottom:10px; padding-bottom:6px; border-bottom:2px solid #f1f5f9;">Documents (Optional)</h4>
      <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(140px, 1fr));gap:12px; margin-bottom:20px;">
        <div style="border:1px solid #e2e8f0; border-radius:14px; padding:12px; background:#fff; text-align:center;">
          <b style="font-size:0.68rem; color:#475569; text-transform:uppercase; letter-spacing:0.04em;">Aadhar</b>
          <div style="color:#94a3b8; margin-top:8px;">
            ${student.aadhar ? `<img src="${student.aadhar}" class="zoomable" onclick="openImageViewer('${student.aadhar}', 'Aadhar Card')" alt="Aadhar" style="width:100%; height:70px; object-fit:cover; border-radius:8px; border:1px solid #e2e8f0;" />` : `<div style="height:70px; display:flex; align-items:center; justify-content:center; background:#f8fafc; border-radius:8px; border:1px dashed #cbd5e1; font-size:0.75rem;">Missing</div>`}
          </div>
        </div>
        <div style="border:1px solid #e2e8f0; border-radius:14px; padding:12px; background:#fff; text-align:center;">
          <b style="font-size:0.68rem; color:#475569; text-transform:uppercase; letter-spacing:0.04em;">TC</b>
          <div style="color:#94a3b8; margin-top:8px;">
            ${student.tc ? `<img src="${student.tc}" class="zoomable" onclick="openImageViewer('${student.tc}', 'Transfer Certificate (TC)')" alt="TC" style="width:100%; height:70px; object-fit:cover; border-radius:8px; border:1px solid #e2e8f0;" />` : `<div style="height:70px; display:flex; align-items:center; justify-content:center; background:#f8fafc; border-radius:8px; border:1px dashed #cbd5e1; font-size:0.75rem;">Missing</div>`}
          </div>
        </div>
        <div style="border:1px solid #e2e8f0; border-radius:14px; padding:12px; background:#fff; text-align:center;">
          <b style="font-size:0.68rem; color:#475569; text-transform:uppercase; letter-spacing:0.04em;">Report Card</b>
          <div style="color:#94a3b8; margin-top:8px;">
            ${student.reportCard ? `<img src="${student.reportCard}" class="zoomable" onclick="openImageViewer('${student.reportCard}', 'Academic Report Card')" alt="Report" style="width:100%; height:70px; object-fit:cover; border-radius:8px; border:1px solid #e2e8f0;" />` : `<div style="height:70px; display:flex; align-items:center; justify-content:center; background:#f8fafc; border-radius:8px; border:1px dashed #cbd5e1; font-size:0.75rem;">Missing</div>`}
          </div>
        </div>
        <div style="border:1px solid #e2e8f0; border-radius:14px; padding:12px; background:#fff; text-align:center;">
          <b style="font-size:0.68rem; color:#475569; text-transform:uppercase; letter-spacing:0.04em;">Father Aadhar</b>
          <div style="color:#94a3b8; margin-top:8px;">
            ${student.fatherAadhar ? `<img src="${student.fatherAadhar}" class="zoomable" onclick="openImageViewer('${student.fatherAadhar}', 'Father Aadhar Card')" alt="Father Aadhar" style="width:100%; height:70px; object-fit:cover; border-radius:8px; border:1px solid #e2e8f0;" />` : `<div style="height:70px; display:flex; align-items:center; justify-content:center; background:#f8fafc; border-radius:8px; border:1px dashed #cbd5e1; font-size:0.75rem;">Missing</div>`}
          </div>
        </div>
        <div style="border:1px solid #e2e8f0; border-radius:14px; padding:12px; background:#fff; text-align:center;">
          <b style="font-size:0.68rem; color:#475569; text-transform:uppercase; letter-spacing:0.04em;">Mother Aadhar</b>
          <div style="color:#94a3b8; margin-top:8px;">
            ${student.motherAadhar ? `<img src="${student.motherAadhar}" class="zoomable" onclick="openImageViewer('${student.motherAadhar}', 'Mother Aadhar Card')" alt="Mother Aadhar" style="width:100%; height:70px; object-fit:cover; border-radius:8px; border:1px solid #e2e8f0;" />` : `<div style="height:70px; display:flex; align-items:center; justify-content:center; background:#f8fafc; border-radius:8px; border:1px dashed #cbd5e1; font-size:0.75rem;">Missing</div>`}
          </div>
        </div>
      </div>

      <div style="display:flex; flex-wrap:wrap; gap:8px; background:linear-gradient(135deg, #f8fafc, #f1f5f9); padding:12px; border-radius:16px; border:1px solid #e2e8f0; align-items:center; justify-content:center; box-shadow:inset 0 2px 4px rgba(0,0,0,0.01);">
        <button type="button" class="btn btn-primary" data-profile-action="edit" style="border-radius:10px; font-size:0.75rem; padding:8px 14px;">✏️ Edit</button>
        <button type="button" class="btn dark" data-profile-action="fees" style="border-radius:10px; font-size:0.75rem; padding:8px 14px;">💳 Add Fee</button>
        <button type="button" class="btn dark" data-profile-action="exams" style="border-radius:10px; font-size:0.75rem; padding:8px 14px;">📝 Add Marks</button>
        <button type="button" class="btn dark" data-profile-action="attendance" style="border-radius:10px; font-size:0.75rem; padding:8px 14px;">📅 Mark Attendance</button>
        <button type="button" class="btn" data-profile-action="print" style="background:#fff; border:1px solid #cbd5e1; color:#0f172a; border-radius:10px; font-size:0.75rem; padding:8px 14px;">🖨️ Print Report</button>
      </div>
    `;
    // Wire actions (profile tab only).
    refs.studentProfileContent.querySelectorAll("button[data-profile-action]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const action = btn.dataset.profileAction;
        if (action === "edit") {
          closeStudentProfile();
          startEditStudentById(student.id);
        } else if (action === "fees") {
          currentModule = "fees";
          closeStudentProfile();
          pendingStudentPrefill = { module: "fees", student };
          renderAll();
        } else if (action === "exams") {
          currentModule = "exams";
          closeStudentProfile();
          pendingStudentPrefill = { module: "exams", student };
          renderAll();
        } else if (action === "attendance") {
          currentModule = "attendance";
          closeStudentProfile();
          pendingStudentPrefill = { module: "attendance", student };
          renderAll();
        } else if (action === "print") {
          closeStudentProfile();
          printStudentReport(student);
        }
      });
    });
    return;
  }

  if (activeStudentProfileTab === "exams") {
    const store = getStore();
    const exams = (store.exams || []).filter((e) => e.studentName === student.fullName);
    const byExam = {};
    exams.forEach((e) => {
      byExam[e.examName] = byExam[e.examName] || [];
      byExam[e.examName].push(e);
    });
    const totalObtained = exams.reduce((sum, e) => sum + asNum(e.marksObtained), 0);
    const totalMax = exams.reduce((sum, e) => sum + asNum(e.maxMarks), 0);
    const pct = totalMax > 0 ? Math.round((totalObtained / totalMax) * 1000) / 10 : 0;
    const resultStatus = pct >= 50 ? "Pass" : "Fail";

    const examCards = Object.entries(byExam)
      .sort((a, b) => String(b[0]).localeCompare(String(a[0])))
      .map(([examName, rows]) => {
        const lines = rows
          .map((r) => `<div style="margin-top:6px;"><b>${r.subject}:</b> ${r.marksObtained || ""}/${r.maxMarks || ""} (${r.grade || ""})</div>`)
          .join("");
        return `<div class="panel" style="margin-bottom:12px;"><h3 style="margin-bottom:8px;">${examName}</h3>${lines}</div>`;
      })
      .join("");

    refs.studentProfileContent.innerHTML = `
      <div style="background:linear-gradient(135deg, #1e3a8a, #312e81); border-radius:16px; padding:16px; color:#fff; margin-bottom:16px; box-shadow:0 8px 20px rgba(30,58,138,0.2);">
        <h3 style="margin-bottom:12px; font-size:1rem; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:8px;">Academic Summary</h3>
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(100px, 1fr)); gap:12px;">
          <div>
            <div style="font-size:0.65rem; color:#93c5fd; text-transform:uppercase; letter-spacing:0.04em; margin-bottom:3px;">Total Obtained</div>
            <div style="font-size:1.2rem; font-weight:800;">${totalObtained}</div>
          </div>
          <div>
            <div style="font-size:0.65rem; color:#93c5fd; text-transform:uppercase; letter-spacing:0.04em; margin-bottom:3px;">Total Max</div>
            <div style="font-size:1.2rem; font-weight:800;">${totalMax}</div>
          </div>
          <div>
            <div style="font-size:0.65rem; color:#93c5fd; text-transform:uppercase; letter-spacing:0.04em; margin-bottom:3px;">Percentage</div>
            <div style="font-size:1.2rem; font-weight:800;">${pct}%</div>
          </div>
          <div>
            <div style="font-size:0.65rem; color:#93c5fd; text-transform:uppercase; letter-spacing:0.04em; margin-bottom:3px;">Result</div>
            <div style="font-size:1.2rem; font-weight:800; ${resultStatus === 'Pass' ? 'color:#4ade80;' : 'color:#f87171;'}">${resultStatus}</div>
          </div>
        </div>
      </div>
      ${examCards || `<div style="text-align:center; padding:40px; color:#64748b; background:#f8fafc; border-radius:12px; border:1px dashed #cbd5e1;">No exam records found.</div>`}
    `;
    return;
  }

  if (activeStudentProfileTab === "fees") {
    const store = getStore();
    const fees = (store.fees || []).filter((f) => f.studentName === student.fullName);
    const dues = (store.dueManagement || []).filter((d) => d.studentName === student.fullName);
    
    let totalFee = fees.reduce((sum, f) => sum + asNum(f.totalFee), 0);
    let paidAmount = fees.reduce((sum, f) => sum + asNum(f.paidAmount), 0);
    let dueAmount = fees.reduce((sum, f) => sum + asNum(f.balance), 0);
    
    totalFee += dues.reduce((sum, d) => sum + asNum(d.dueAmount), 0);
    paidAmount += dues.reduce((sum, d) => sum + asNum(d.paidAmount), 0);
    dueAmount += dues.reduce((sum, d) => sum + asNum(d.balance), 0);

    const FEE_TYPE_KEYS = [
      { key: "tuitionFee", label: "Tuition Fee", icon: "📚" },
      { key: "admissionFee", label: "Admission Fee", icon: "🎓" },
      { key: "computerFee", label: "Computer Fee", icon: "💻" },
      { key: "developmentFee", label: "Development Fee", icon: "🏗️" },
      { key: "labFee", label: "Lab Fee", icon: "🔬" },
      { key: "sportsFee", label: "Sports Fee", icon: "⚽" },
      { key: "libraryFee", label: "Library Fee", icon: "📖" },
      { key: "examFee", label: "Exam Fee", icon: "📝" },
      { key: "otherFee", label: "Other Fee", icon: "➕" },
    ];
    function buildFeeBreakdown(f) {
      let lines = "";
      let hasAny = false;
      FEE_TYPE_KEYS.forEach(({ key, label, icon }) => {
        const amt = parseFloat(f[key]) || 0;
        if (amt > 0) {
          hasAny = true;
          lines += `<div style="display:flex;justify-content:space-between;padding:3px 0;font-size:0.82rem;border-bottom:1px dashed rgba(148,163,184,0.2);">
            <span style="color:#475569;">${icon} ${label}</span>
            <span style="font-weight:600;color:#0f172a;">₹ ${amt.toLocaleString("en-IN")}</span></div>`;
        }
      });
      if (!hasAny) {
        const labels = (f.feeTypes || f.monthlyFeeLabel || f.particulars || "").trim();
        const totalMonthly = parseFloat(f.monthlyFee) || parseFloat(f.dueAmount) || 0;
        if (labels) {
          const parts = labels.split(",").map(s => s.trim()).filter(Boolean);
          if (parts.length > 0 && totalMonthly > 0) {
            const perPart = totalMonthly / parts.length;
            parts.forEach(part => {
              lines += `<div style="display:flex;justify-content:space-between;padding:3px 0;font-size:0.82rem;border-bottom:1px dashed rgba(148,163,184,0.2);">
                <span style="color:#475569;">💳 ${part}</span>
                <span style="font-weight:600;color:#0f172a;">₹ ${perPart.toLocaleString("en-IN")}</span></div>`;
            });
          } else if (labels) {
            lines += `<div style="font-size:0.8rem;color:#64748b;">Particulars: ${labels}</div>`;
          }
        }
      }
      return lines ? `<div style="margin-top:6px;padding:4px 0;">${lines}</div>` : "";
    }
    
    const feeHistory = fees.map(f => ({...f, isDueRecord: false}));
    const dueHistory = dues.map(d => ({
        ...d,
        isDueRecord: true,
        term: d.session || "Previous Session",
        totalFee: d.dueAmount,
        paymentDate: d.updatedAt ? displayDate(d.updatedAt.split(" ")[0]) : "-"
    }));
    
    const history = [...dueHistory, ...feeHistory]
      .sort((a, b) => String(b.term).localeCompare(String(a.term)))
      .map((f) => {
        const feeBreakdown = buildFeeBreakdown(f);
        const statusColor = String(f.status||'').toLowerCase()==='paid'?'#16a34a':String(f.status||'').toLowerCase()==='partial'?'#d97706':'#dc2626';
        const statusBg = String(f.status||'').toLowerCase()==='paid'?'#dcfce7':String(f.status||'').toLowerCase()==='partial'?'#fef3c7':'#fee2e2';
        return `
        <div style="padding:10px;border:1px solid rgba(148,163,184,0.25);border-radius:10px;margin-bottom:10px; ${f.isDueRecord ? 'border-left: 4px solid #ef4444;' : ''}">
          <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:6px;">
            <b style="color:#1e3a8a;">${f.isDueRecord ? '⚠️ OUTSTANDING ARRERS ('+f.term+')' : 'Term: ' + (f.term || "—")}</b>
            <span style="background:${statusBg};color:${statusColor};font-weight:700;padding:2px 10px;border-radius:10px;font-size:0.78rem;border:1px solid ${statusColor};">${f.status || "Pending"}</span>
          </div>
          ${feeBreakdown}
          <div style="margin-top:8px;display:flex;justify-content:space-between;font-size:0.82rem;">
            <span style="color:#64748b;">Total Amount</span><span style="font-weight:700;color:#1e3a8a;">₹ ${(parseFloat(f.totalFee)||0).toLocaleString('en-IN')}</span>
          </div>
          <div style="display:flex;justify-content:space-between;font-size:0.82rem;">
            <span style="color:#64748b;">Amount Paid</span><span style="font-weight:700;color:#16a34a;">₹ ${(parseFloat(f.paidAmount)||0).toLocaleString('en-IN')}</span>
          </div>
          <div style="display:flex;justify-content:space-between;font-size:0.82rem;">
            <span style="color:#64748b;">Balance Due</span><span style="font-weight:700;color:#dc2626;">₹ ${(parseFloat(f.balance)||0).toLocaleString('en-IN')}</span>
          </div>
          ${!f.isDueRecord ? `
          <div style="display:flex;justify-content:space-between;align-items:center;margin-top:4px;">
            <div style="color:#64748b;font-size:0.78rem;">
              <b>Payment Date:</b> ${f.paymentDate || "-"} &nbsp;•&nbsp; <b>Method:</b> ${f.paymentMethod || "-"}
            </div>
            ${(parseFloat(f.paidAmount) > 0 || String(f.status).toLowerCase() === 'paid') ? `<button class="print-fee-btn" data-fee-id="${f.id}" style="font-size:0.75rem;padding:4px 10px;border-radius:6px;background:#e0e7ff;color:#4f46e5;border:1px solid #c7d2fe;cursor:pointer;font-weight:700;transition:all 0.2s;">🖨️ Download</button>` : ''}
          </div>` : ''}
        </div>
      `;
      }).join("");

    refs.studentProfileContent.innerHTML = `
      <div style="background:linear-gradient(135deg, #059669, #047857); border-radius:16px; padding:16px; color:#fff; margin-bottom:16px; box-shadow:0 8px 20px rgba(5,150,105,0.2);">
        <h3 style="margin-bottom:12px; font-size:1rem; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:8px;">Financial Overview</h3>
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(100px, 1fr)); gap:12px;">
          <div>
            <div style="font-size:0.65rem; color:#a7f3d0; text-transform:uppercase; letter-spacing:0.04em; margin-bottom:3px;">Total Charges</div>
            <div style="font-size:1.2rem; font-weight:800;">₹ ${totalFee.toLocaleString("en-IN")}</div>
          </div>
          <div>
            <div style="font-size:0.65rem; color:#a7f3d0; text-transform:uppercase; letter-spacing:0.04em; margin-bottom:3px;">Paid Amount</div>
            <div style="font-size:1.2rem; font-weight:800;">₹ ${paidAmount.toLocaleString("en-IN")}</div>
          </div>
          <div>
            <div style="font-size:0.65rem; color:#a7f3d0; text-transform:uppercase; letter-spacing:0.04em; margin-bottom:3px;">Total Due</div>
            <div style="font-size:1.2rem; font-weight:800; ${dueAmount > 0 ? 'color:#fca5a5;' : 'color:#fff;'}">₹ ${dueAmount.toLocaleString("en-IN")}</div>
          </div>
        </div>
      </div>
      ${history || `<div style="text-align:center; padding:40px; color:#64748b; background:#f8fafc; border-radius:12px; border:1px dashed #cbd5e1;">No fee or due records found.</div>`}
    `;

    const printBtns = refs.studentProfileContent.querySelectorAll('.print-fee-btn');
    printBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const feeId = e.currentTarget.dataset.feeId;
        const feeRecord = fees.find(fee => String(fee.id) === String(feeId));
        if (feeRecord) printFeeReceipt(feeRecord);
      });
    });
    
    return;
  }

  if (activeStudentProfileTab === "feeCard") {
    const store = getStore();
    const academicOrder = ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"];
    const fees = (store.fees || []).filter((f) => String(f.admissionNo || f.studentName) === String(student.admissionNo || student.fullName));
    
    const rows = academicOrder.map(m => {
       // Filter records where the month string contains this specific month name
       const monthRecord = fees.find(f => String(f.month).includes(m));
       const total = parseFloat(monthRecord?.totalFee) || 0;
       const paid  = parseFloat(monthRecord?.paidAmount) || 0;
       const bal   = parseFloat(monthRecord?.balance) || 0;
       const status = monthRecord?.status || "Pending";
       const statusColor = status.toLowerCase()==='paid'?'#16a34a':status.toLowerCase()==='partial'?'#d97706':'#dc2626';
       
       return `
         <tr>
           <td style="padding:12px; border-bottom:1px solid #f1f5f9; font-weight:700; color:#1e3a8a;">${m}</td>
           <td style="padding:12px; border-bottom:1px solid #f1f5f9; color:#475569;">₹ ${total.toLocaleString('en-IN')}</td>
           <td style="padding:12px; border-bottom:1px solid #f1f5f9; color:#16a34a; font-weight:700;">₹ ${paid.toLocaleString('en-IN')}</td>
           <td style="padding:12px; border-bottom:1px solid #f1f5f9; color:#dc2626; font-weight:700;">₹ ${bal.toLocaleString('en-IN')}</td>
           <td style="padding:12px; border-bottom:1px solid #f1f5f9;">
             <span style="background:${statusColor}15; color:${statusColor}; padding:3px 10px; border-radius:12px; font-size:0.75rem; font-weight:800; border:1px solid ${statusColor}40; text-transform:uppercase;">${status}</span>
           </td>
         </tr>
       `;
    }).join("");

    refs.studentProfileContent.innerHTML = `
      <div style="background:#fff; border:1px solid #e2e8f0; border-radius:14px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.03);">
        <table style="width:100%; border-collapse:collapse; font-size:0.85rem; text-align:left;">
          <thead style="background:#f8fafc; border-bottom:2px solid #e2e8f0;">
            <tr>
              <th style="padding:14px 12px; color:#64748b; font-weight:600; text-transform:uppercase; font-size:0.75rem; letter-spacing:0.025em;">Academic Month</th>
              <th style="padding:14px 12px; color:#64748b; font-weight:600; text-transform:uppercase; font-size:0.75rem; letter-spacing:0.025em;">Total</th>
              <th style="padding:14px 12px; color:#64748b; font-weight:600; text-transform:uppercase; font-size:0.75rem; letter-spacing:0.025em;">Paid</th>
              <th style="padding:14px 12px; color:#64748b; font-weight:600; text-transform:uppercase; font-size:0.75rem; letter-spacing:0.025em;">Balance</th>
              <th style="padding:14px 12px; color:#64748b; font-weight:600; text-transform:uppercase; font-size:0.75rem; letter-spacing:0.025em;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
      </div>
      <p style="margin-top:12px; font-size:0.75rem; color:#64748b; display:flex; align-items:center; gap:6px;">
        <span>ℹ️</span> This ledger reflects the latest payment status for each specific month in the academic session.
      </p>
    `;
    return;
  }

  if (activeStudentProfileTab === "attendance") {
    const store = getStore();
    const attendance = (store.attendance || []).filter((a) => a.studentName === student.fullName && a.className === student.className);
    const uniqueDates = Array.from(new Set(attendance.map((a) => String(a.date)).filter(Boolean)));
    const totalDays = uniqueDates.length;
    const presentDays = attendance.filter((a) => {
      const s = String(a.status || "").toLowerCase();
      return s.includes("present") || s.includes("late");
    }).map((a) => String(a.date));
    const presentUnique = Array.from(new Set(presentDays));
    const absentUnique = uniqueDates.filter((d) => !presentUnique.includes(d));
    const pct = totalDays > 0 ? Math.round((presentUnique.length / totalDays) * 1000) / 10 : 0;

    const monthRows = attendance
      .slice()
      .sort((a, b) => String(b.date).localeCompare(String(a.date)))
      .slice(0, 30)
      .map((a) => `<div style="padding:8px 10px;border:1px solid rgba(148,163,184,0.25);border-radius:10px;margin-bottom:8px;">
        <b>${a.date || ""}</b> • ${a.status || ""}${a.arrivalTime ? ` • Arr ${a.arrivalTime}` : ""}${a.departureTime ? ` • Dep ${a.departureTime}` : ""}
      </div>`)
      .join("");

    refs.studentProfileContent.innerHTML = `
      <div style="background:linear-gradient(135deg, #6d28d9, #4c1d95); border-radius:16px; padding:16px; color:#fff; margin-bottom:16px; box-shadow:0 8px 20px rgba(109,40,217,0.2);">
        <h3 style="margin-bottom:12px; font-size:1rem; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:8px;">Attendance Summary</h3>
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(90px, 1fr)); gap:12px;">
          <div>
            <div style="font-size:0.65rem; color:#ddd6fe; text-transform:uppercase; letter-spacing:0.04em; margin-bottom:3px;">Total Days</div>
            <div style="font-size:1.2rem; font-weight:800;">${totalDays}</div>
          </div>
          <div>
            <div style="font-size:0.65rem; color:#ddd6fe; text-transform:uppercase; letter-spacing:0.04em; margin-bottom:3px;">Present</div>
            <div style="font-size:1.2rem; font-weight:800; color:#4ade80;">${presentUnique.length}</div>
          </div>
          <div>
            <div style="font-size:0.65rem; color:#ddd6fe; text-transform:uppercase; letter-spacing:0.04em; margin-bottom:3px;">Absent</div>
            <div style="font-size:1.2rem; font-weight:800; color:#f87171;">${absentUnique.length}</div>
          </div>
          <div>
            <div style="font-size:0.65rem; color:#ddd6fe; text-transform:uppercase; letter-spacing:0.04em; margin-bottom:3px;">Percentage</div>
            <div style="font-size:1.2rem; font-weight:800;">${pct}%</div>
          </div>
        </div>
      </div>
      ${monthRows || `<div style="text-align:center; padding:40px; color:#64748b; background:#f8fafc; border-radius:12px; border:1px dashed #cbd5e1;">No attendance records found.</div>`}
    `;
    return;
  }
}

function startEditStudentById(studentId) {
  editStudentId = Number(studentId);
  currentModule = "students";
  refs.searchInput.value = "";
  // Re-render form then prefill.
  renderAll();
  const store = getStore();
  const student = (store.students || []).find((s) => Number(s.id) === Number(studentId));
  if (!student) return;
  if (refs.dynamicForm) {
    const inputs = refs.dynamicForm.querySelectorAll("input,select,textarea");
    inputs.forEach((el) => {
      const name = el.name || el.getAttribute("name");
      if (!name) return;
      if (["photo", "aadhar", "tc", "reportCard", "fatherAadhar", "motherAadhar"].includes(name)) return; // can't set file inputs
      if (el.tagName === "SELECT") el.value = student[name] ?? el.value;
      else if (el.type === "date" && student[name]) el.value = normalizeToISO(student[name]);
      else el.value = student[name] ?? "";
    });
  }
  // Put focus to first form input for convenience.
  const first = refs.dynamicForm.querySelector("input,select,textarea");
  first?.focus?.();
}

function startGenericEditById(moduleName, recordId) {
  editRecordId = Number(recordId);
  currentModule = moduleName;
  refs.searchInput.value = "";
  renderAll();
  const store = getStore();
  const records = store[moduleName] || [];
  const record = records.find(r => Number(r.id) === Number(recordId));
  if (!record) return;
  if (refs.dynamicForm) {
    const inputs = refs.dynamicForm.querySelectorAll("input,select,textarea");
    inputs.forEach((el) => {
      const name = el.name || el.getAttribute("name");
      if (!name) return;
      if (el.type === "file") return;
      if (el.tagName === "SELECT") el.value = record[name] ?? el.value;
      else if (el.type === "date" && record[name]) el.value = normalizeToISO(record[name]);
      else el.value = record[name] ?? "";
    });
  }
  // Update the submit button text to show "Update"
  const submitBtn = refs.dynamicForm.querySelector("button[type='submit']");
  if (submitBtn) submitBtn.textContent = '✏️ Update Record';
  // Scroll form into view
  refs.dynamicForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
  const first = refs.dynamicForm.querySelector("input,select,textarea");
  first?.focus?.();
}

function printStudentReport(student) {
  if (!student) return;
  const store = getStore();
  const split = splitClassName(student.className);

  const exams = (store.exams || []).filter((e) => e.studentName === student.fullName);
  const fees = (store.fees || []).filter((f) => f.studentName === student.fullName);
  const attendance = (store.attendance || []).filter((a) => a.studentName === student.fullName && a.className === student.className);

  const totalObtained = exams.reduce((sum, e) => sum + asNum(e.marksObtained), 0);
  const totalMax = exams.reduce((sum, e) => sum + asNum(e.maxMarks), 0);
  const pct = totalMax > 0 ? Math.round((totalObtained / totalMax) * 1000) / 10 : 0;
  const result = pct >= 50 ? "Pass" : "Fail";

  const totalFee = fees.reduce((sum, f) => sum + asNum(f.totalFee), 0);
  const paidAmount = fees.reduce((sum, f) => sum + asNum(f.paidAmount), 0);
  const dueAmount = fees.reduce((sum, f) => sum + asNum(f.balance), 0);

  const uniqueDates = Array.from(new Set(attendance.map((a) => String(a.date)).filter(Boolean)));
  const presentUnique = Array.from(new Set(attendance.filter((a) => {
    const s = String(a.status || "").toLowerCase();
    return s.includes("present") || s.includes("late");
  }).map((a) => String(a.date))));
  const totalDays = uniqueDates.length;
  const presentDays = presentUnique.length;
  const attendancePct = totalDays > 0 ? Math.round((presentDays / totalDays) * 1000) / 10 : 0;

  const profileHtml = `
    <div class="id-header">
      <h1>Student Report</h1>
      <p>${student.fullName || ""} • Roll ${student.rollNo || ""} • Class ${split.classPart || ""}${split.sectionPart ? "-" + split.sectionPart : ""}</p>
    </div>
    <div class="box">
      <div class="row"><b>Date of Birth:</b> ${student.dob || "-"}</div>
      <div class="row"><b>Gender:</b> ${student.gender || "-"}</div>
      <div class="row"><b>Address:</b> ${student.address || "-"}</div>
      <div class="row"><b>Mobile:</b> ${student.phone || "-"}</div>
      <div class="row"><b>Parent:</b> ${student.parentName || "-"}</div>
    </div>
    <div class="id-grid">
      <div class="box"><b>Exams %:</b> ${pct}% • <b>Result:</b> ${result}</div>
      <div class="box"><b>Fees:</b> Paid ${paidAmount} • Due ${dueAmount}</div>
      <div class="box"><b>Attendance %:</b> ${attendancePct}%</div>
    </div>
  `;

  const examsHtml = (() => {
    if (!exams.length) return `<div class="box">No exam records.</div>`;
    const byExam = {};
    exams.forEach((e) => {
      byExam[e.examName] = byExam[e.examName] || [];
      byExam[e.examName].push(e);
    });
    const blocks = Object.entries(byExam)
      .map(([examName, rows]) => {
        const lines = rows
          .map((r) => `<div class="row"><b>${r.subject}:</b> ${r.marksObtained || ""}/${r.maxMarks || ""} (${r.grade || ""})</div>`)
          .join("");
        return `<div class="box"><h2>${examName}</h2>${lines}</div>`;
      })
      .join("");
    return blocks;
  })();

  const feesHtml = (() => {
    if (!fees.length) return `<div class="box">No fee records.</div>`;
    const FEE_REPORT_TYPES = [
      { key: "tuitionFee", label: "Tuition Fee", icon: "📚" },
      { key: "admissionFee", label: "Admission Fee", icon: "🎓" },
      { key: "computerFee", label: "Computer Fee", icon: "💻" },
      { key: "developmentFee", label: "Development Fee", icon: "🏗️" },
      { key: "labFee", label: "Lab Fee", icon: "🔬" },
      { key: "sportsFee", label: "Sports Fee", icon: "⚽" },
      { key: "libraryFee", label: "Library Fee", icon: "📖" },
      { key: "examFee", label: "Exam Fee", icon: "📝" },
      { key: "otherFee", label: "Other Fee", icon: "➕" },
    ];
    const blocks = fees
      .slice()
      .sort((a, b) => String(b.term).localeCompare(String(a.term)))
      .map((f) => {
        let feeDetails = "";
        let hasAny = false;
        FEE_REPORT_TYPES.forEach(({ key, label, icon }) => {
          const amt = parseFloat(f[key]) || 0;
          if (amt > 0) { hasAny = true; feeDetails += `<div class="row">${icon} ${label}: ₹${amt.toLocaleString("en-IN")}</div>`; }
        });
        if (!hasAny) {
          const labels = (f.feeTypes || f.monthlyFeeLabel || "").trim();
          const totalMonthly = parseFloat(f.monthlyFee) || 0;
          if (labels && totalMonthly > 0) {
            const parts = labels.split(",").map(s => s.trim()).filter(Boolean);
            const perPart = parts.length > 0 ? totalMonthly / parts.length : 0;
            parts.forEach(part => { feeDetails += `<div class="row">💳 ${part}: ₹${perPart.toLocaleString("en-IN")}</div>`; });
          } else if (labels) {
            feeDetails += `<div class="row">Fee Types: ${labels}</div>`;
          }
        }
        return `
        <div class="box">
          <h2>Term: ${f.term || ""} — RCP-${f.id}</h2>
          ${feeDetails || '<div class="row" style="color:#94a3b8;">No fee breakdown recorded.</div>'}
          <div class="row" style="margin-top:6px;font-weight:700;"><b>Total Fee:</b> ₹${(parseFloat(f.totalFee)||0).toLocaleString("en-IN")}</div>
          <div class="row"><b>Amount Paid:</b> ₹${(parseFloat(f.paidAmount)||0).toLocaleString("en-IN")}</div>
          <div class="row"><b>Balance Due:</b> ₹${(parseFloat(f.balance)||0).toLocaleString("en-IN")}</div>
          <div class="row" style="color:#64748b;"><b>Date:</b> ${f.paymentDate || "-"} • <b>Method:</b> ${f.paymentMethod || "-"}</div>
        </div>
      `;
      })
      .join("");
    return blocks;
  })();

  const attendanceHtml = (() => {
    if (!attendance.length) return `<div class="box">No attendance records.</div>`;
    const blocks = attendance
      .slice()
      .sort((a, b) => String(b.date).localeCompare(String(a.date)))
      .slice(0, 20)
      .map((a) => `
        <div class="box">
          <div class="row"><b>Date:</b> ${a.date || ""}</div>
          <div class="row"><b>Status:</b> ${a.status || ""}</div>
          ${a.arrivalTime ? `<div class="row"><b>Arrival:</b> ${a.arrivalTime}</div>` : ""}
          ${a.departureTime ? `<div class="row"><b>Departure:</b> ${a.departureTime}</div>` : ""}
        </div>
      `).join("");
    return blocks;
  })();

  const contentHtml = `
    ${profileHtml}
    <h2 style="margin:16px 0 8px 0;">Exams</h2>
    ${examsHtml}
    <h2 style="margin:16px 0 8px 0;">Fees</h2>
    ${feesHtml}
    <h2 style="margin:16px 0 8px 0;">Attendance</h2>
    ${attendanceHtml}
  `;

  const html = buildPrintableHtml("Student Report", contentHtml);
  const w = window.open("", "_blank");
  if (!w) return window.alert("Popup blocked. Allow popups to print.");
  w.document.open();
  w.document.write(html);
  w.document.close();
}

function getNextId(items) {
  if (!items.length) return 1;
  return Math.max(...items.map(i => Number(i.id) || 0)) + 1;
}

async function addRecord(moduleName, formData) {
  const record = { ...formData };
  if (moduleName === "fees") {
    const total = asNum(record.totalFee);
    const paid = asNum(record.paidAmount);
    const balance = total - paid;
    // Auto-fill paymentDate if missing or empty to ensure it shows on dashboard
    if (!record.paymentDate || String(record.paymentDate).trim() === "") {
      record.paymentDate = todayStr();
    }
    // Only set balance/status if not already correctly set by form submit handler
    if (!record.balance || record.balance === "0") {
      record.balance = String(Math.max(0, balance));
    }
    if (!record.status) {
      record.status = balance <= 0 ? "Paid" : paid > 0 ? "Partial" : "Pending";
    }
  }
  if (moduleName === "users") {
    if (!record.password) record.password = "welcome123";
    if (!record.lastLogin) record.lastLogin = nowStr();
    if (!record.status) record.status = "Active";
  }
  await api(`/api/modules/${moduleName}`, { method: "POST", body: JSON.stringify(record) });
  await loadStore();
}

async function removeRecord(moduleName, id) {
  if (moduleName === "fees" && id) {
    const store = getStore();
    const fee = (store.fees || []).find(f => String(f.id) === String(id));
    if (fee && (fee.consolidatedFeeIds || fee.consolidatedDueMgmtIds)) {
      try {
        const feeIds = JSON.parse(fee.consolidatedFeeIds || "[]");
        const mgmtIds = JSON.parse(fee.consolidatedDueMgmtIds || "[]");
        
        for (const rid of feeIds) {
          const target = (store.fees || []).find(f => String(f.id) === String(rid));
          if (target) {
            const total = parseFloat(target.totalFee) || 0;
            const paid = parseFloat(target.paidAmount) || 0;
            const bal = total - paid;
            const status = bal <= 0 ? "Paid" : paid > 0 ? "Partial" : "Pending";
            await api(`/api/modules/fees/${rid}`, { method: "PUT", body: JSON.stringify({ status, balance: String(bal) }) });
          }
        }
        for (const rid of mgmtIds) {
          const target = (store.dueManagement || []).find(f => String(f.id) === String(rid));
          if (target) {
            const total = parseFloat(target.dueAmount) || 0;
            const paid = parseFloat(target.paidAmount) || 0;
            const bal = total - paid;
            const status = bal <= 0 ? "Paid" : paid > 0 ? "Partial" : "Pending";
            await api(`/api/modules/dueManagement/${rid}`, { method: "PUT", body: JSON.stringify({ status, balance: String(bal) }) });
          }
        }
      } catch (err) {
        console.error("Error reversing consolidation on delete:", err);
      }
    }
  }
  await api(`/api/modules/${moduleName}/${id}`, { method: "DELETE" });

  // Cleanup Face Recognition Data if deleting a student or teacher
  if (moduleName === "students" || moduleName === "teachers") {
    const person = (getStore()[moduleName] || []).find(p => String(p.id) === String(id));
    if (person && person.fullName) {
      const faceStore = getFaceStore();
      const faceKey = `${moduleName}|${person.fullName}`;
      if (faceStore[faceKey]) {
        delete faceStore[faceKey];
        saveFaceStore(faceStore);
        console.log(`[FaceAI] Deleted face data for ${person.fullName}`);
        
        // Try to remove from server as well (best effort)
        try {
          const store = getStore();
          const embeddings = store.faceEmbeddings || [];
          const emb = embeddings.find(e => e.name === person.fullName && e.targetType === moduleName);
          if (emb && emb.id) {
            await api(`/api/modules/faceEmbeddings/${emb.id}`, { method: "DELETE" });
          }
        } catch (e) {
          console.warn("Server face cleanup failed:", e.message);
        }
      }
    }
  }

  await loadStore();
}

// Global Image Viewer Helpers
window.openImageViewer = function(src, title) {
  const viewer = document.getElementById("imageViewer");
  const img = document.getElementById("imageViewerImg");
  const titleEl = document.getElementById("imageViewerTitle");
  if (!viewer || !img || !titleEl) return;
  
  img.src = src;
  titleEl.textContent = title;
  viewer.classList.remove("hidden");
  document.body.style.overflow = "hidden"; // Prevent background scroll
};

window.closeImageViewer = function() {
  const viewer = document.getElementById("imageViewer");
  if (!viewer) return;
  viewer.classList.add("hidden");
  document.body.style.overflow = ""; // Restore scroll
};

window.currentFeeFilter = window.currentFeeFilter || 'all';

function getDashboardStats(store) {
  const fees = store.fees || [];
  
  // Use robust local date logic instead of UTC to avoid timezone mismatch
  const now = new Date();
  const today = [now.getFullYear(), String(now.getMonth() + 1).padStart(2, '0'), String(now.getDate()).padStart(2, '0')].join('-');
  const curMonth = today.slice(0, 7);
  const curYear = today.slice(0, 4);

  const dues = store.dueManagement || [];
  
  const allCollections = [...fees.map(f => ({ ...f, type: 'fee' })), ...dues.map(d => ({ ...d, type: 'due' }))];

  let allTimeTotal = 0;
  const filteredTotal = allCollections.reduce((sum, item) => {
    // Fees use paymentDate, Dues use today for collection day stats
    let rawDate = item.type === 'fee' ? item.paymentDate : today;
    const date = normalizeToISO(rawDate);
    const amount = asNum(item.paidAmount);
    allTimeTotal += amount;
    
    if (window.currentFeeFilter === 'all') return sum + amount;
    if (window.currentFeeFilter === 'day' && date === today) return sum + amount;
    if (window.currentFeeFilter === 'month' && date.startsWith(curMonth)) return sum + amount;
    if (window.currentFeeFilter === 'year' && date.startsWith(curYear)) return sum + amount;
    
    return sum;
  }, 0);

  const lastThreePayments = fees.slice(0, 3).map(f => ({
    name: f.studentName || "Unknown",
    amount: asNum(f.paidAmount),
    date: displayDate(f.paymentDate) || "No Date"
  }));

  return {
    "Today's System Date": displayDate(today),
    "Total Students": (store.students || []).length,
    "Total Teachers": (store.teachers || []).length,
    "Total Classes": (store.classes || []).length,
    "Student Present Today": (store.attendance || []).filter(x => String(x.status).toLowerCase() === "present").length,
    "Teacher Present Today": (store.teacherAttendance || []).filter(x => String(x.status).toLowerCase() === "present").length,
    "Pending Fee Accounts": (store.fees || []).filter(x => String(x.status).toLowerCase() !== "paid").length,
    "Total Payment Received": "₹" + filteredTotal.toLocaleString("en-IN"),
    "Lifetime Collection": "₹" + allTimeTotal.toLocaleString("en-IN"),
    "LastThree": lastThreePayments,
    "Books Issued": (store.library || []).filter(x => String(x.status).toLowerCase() === "issued").length,
    "Hostel Active": (store.hostel || []).filter(x => String(x.status).toLowerCase() === "active").length,
    "New Admissions": (store.admissions || []).length,
    "Pending Admissions": (store.admissions || []).filter(x => String(x.status).toLowerCase() === "pending").length,
    "System Active Users": (store.users || []).filter(x => String(x.status).toLowerCase() === "active").length
  };
}

function renderStatsCards() {
  refs.statsCards.innerHTML = "";
  if (currentModule !== "dashboard") {
    renderAnalyticsCharts(getStore()); // This handles hiding the analytics grid
    return;
  }

  // Student pending-role notice banner
  if (userIsStudent()) {
    const banner = document.createElement("div");
    banner.style.cssText = "grid-column:1/-1;background:#fef3c7;border:1px solid #fde68a;border-radius:12px;padding:16px 20px;display:flex;align-items:center;gap:12px;margin-bottom:4px;";
    banner.innerHTML = `
      <span style="font-size:1.6rem;">🎓</span>
      <div>
        <div style="font-weight:700;color:#92400e;font-size:0.95rem;">Welcome! Your account has Student access.</div>
        <div style="color:#b45309;font-size:0.83rem;margin-top:2px;">Your administrator can assign you a different role (Teacher, Staff, etc.) from the <strong>Users & Roles</strong> module. Contact them if you need elevated access.</div>
      </div>`;
    refs.statsCards.appendChild(banner);
  }

  const stats = getDashboardStats(getStore());
  // Hide system stats students shouldn't see
  const hiddenForStudents = new Set(["System Active Users", "Pending Fee Accounts", "Hostel Active"]);
  Object.entries(stats).forEach(([k, v]) => {
    if (userIsStudent() && hiddenForStudents.has(k)) return;
    const card = document.createElement("article");
    card.className = "card";
    const statIcons = {
      "Total Students": "👥",
      "Total Teachers": "🎓",
      "Total Classes": "🏫",
      "Student Present Today": "✅",
      "Teacher Present Today": "✅",
      "Pending Fee Accounts": "💲",
      "Books Issued": "📚",
      "Hostel Active": "🏠",
      "System Active Users": "🛡️",
      "New Admissions": "📝",
      "Pending Admissions": "⏳"
    };

    const icon = statIcons[k] || "⭐";
    const trend = v > 0 ? { arrow: "↑", text: "+5%" } : { arrow: "↓", text: "-2%" };

    if (k === "Total Payment Received") {
      card.style.background = "linear-gradient(135deg, #f0fdf4, #ffffff)";
      card.style.border = "1px solid #bbf7d0";
      card.style.minHeight = "240px";
      const recentHtml = stats.LastThree.map(p => `
        <div style="display:flex; justify-content:space-between; font-size:0.68rem; padding:4px 0; border-bottom:1px solid #f0fdf4; color:#374151;">
          <span style="font-weight:600;">${p.name.split(' ')[0]}</span>
          <span style="color:#64748b;">${p.date}</span>
          <span style="font-weight:700; color:#16a34a;">₹${p.amount}</span>
        </div>
      `).join('');

      card.innerHTML = `
        <div class="stat-top">
          <h4 style="color:#166534;">${k}</h4>
          <div class="stat-icon-bubble" style="background:#dcfce7; color:#16a34a;">💰</div>
        </div>
        <div class="stat-value" style="color:#15803d; font-size:1.8rem;">${v}</div>
        <div style="font-size:0.72rem; color:#16a34a; font-weight:600; margin-top:2px; display:flex; justify-content:space-between;">
          <span>Overall: ${stats["Lifetime Collection"]}</span>
          <span style="opacity:0.6; font-weight:400;">Today: ${stats["Today's System Date"]}</span>
        </div>
        
        <div style="margin-top:10px; background:rgba(22,163,74,0.03); border-radius:8px; padding:8px;">
          <div style="font-size:0.6rem; text-transform:uppercase; color:#15803d; font-weight:800; margin-bottom:4px; letter-spacing:0.02em;">Recent Activity</div>
          ${recentHtml || '<div style="font-size:0.65rem; color:#94a3b8;">No recent payments</div>'}
        </div>

        <div style="margin-top:12px; display:flex; gap:4px; background:#f0f4f8; padding:3px; border-radius:8px; width:fit-content;">
          ${['day', 'month', 'year', 'all'].map(f => `
            <button class="fee-filter-btn ${window.currentFeeFilter === f ? 'active' : ''}" 
                    onclick="window.currentFeeFilter='${f}'; renderStatsCards()"
                    style="border:none; padding:4px 10px; border-radius:6px; font-size:0.65rem; font-weight:700; cursor:pointer; text-transform:uppercase; transition:all 0.2s;
                           ${window.currentFeeFilter === f ? 'background:#16a34a; color:#fff; box-shadow:0 2px 4px rgba(22,163,74,0.2);' : 'background:transparent; color:#64748b;'}">
              ${f}
            </button>
          `).join('')}
        </div>
      `;
    } else if (k === "Lifetime Collection" || k === "LastThree" || k === "Today's System Date") {
      return; // Skip rendering these as separate cards
    } else {
      card.innerHTML = `
        <div class="stat-top">
          <h4>${k}</h4>
          <div class="stat-icon-bubble">${icon}</div>
        </div>
        <div class="stat-value">${v}</div>
        <div class="stat-trend ${trend.arrow === "↑" ? "pos" : "neg"}">
          <span class="arrow">${trend.arrow}</span>
          <span class="pct">${trend.text}</span>
        </div>
      `;
    }
    card.className = "stat-card";
    refs.statsCards.appendChild(card);
  });

  renderAnalyticsCharts(getStore());
}

let dashboardCharts = [];

function renderAnalyticsCharts(store) {
  let grid = document.querySelector(".analytics-grid");

  if (currentModule !== "dashboard") {
    if (grid) grid.style.display = "none";
    return;
  }

  // Destroy old charts to prevent duplicate bindings/memory leaks
  dashboardCharts.forEach(c => c.destroy());
  dashboardCharts = [];

  if (!grid) {
    grid = document.createElement("div");
    grid.className = "analytics-grid";
    refs.statsCards.parentNode.insertBefore(grid, refs.statsCards.nextSibling);
  }
  grid.style.display = ""; // Ensure it is visible
  grid.innerHTML = ""; // Clear existing grid
  
  if (userIsStudent()) return; // Restrict analytics overview from students

  const fees = store.fees || [];
  let feeStatus = { paid: 0, pending: 0, partial: 0 };
  fees.forEach(f => {
     let st = String(f.status).toLowerCase();
     if(feeStatus[st] !== undefined) feeStatus[st]++;
  });

  const students = store.students || [];
  let classDist = {};
  students.forEach(s => {
     let cls = s.className || "Unassigned";
     classDist[cls] = (classDist[cls] || 0) + 1;
  });

  // Calculate generic "present today" vs entire active student population
  const today = new Date().toISOString().slice(0, 10);
  const attendance = store.attendance || [];
  const presentToday = attendance.filter(a => String(a.status).toLowerCase() === "present" && a.date === today && a.studentName).length;
  const absentToday = Math.max(0, students.length - presentToday);

  const chartsHtml = `
    <div class="chart-card">
      <h3 class="chart-title">Real-Time Fee Collection <span class="chart-badge"><div class="dot"></div> Live</span></h3>
      <div class="canvas-container"><canvas id="feeChart"></canvas></div>
    </div>
    <div class="chart-card">
      <h3 class="chart-title">Students Per Class <span class="chart-badge"><div class="dot"></div> Live</span></h3>
      <div class="canvas-container"><canvas id="classChart"></canvas></div>
    </div>
    <div class="chart-card">
      <h3 class="chart-title">Today's Attendance <span class="chart-badge"><div class="dot"></div> Live</span></h3>
      <div class="canvas-container"><canvas id="attChart"></canvas></div>
    </div>`;
  grid.innerHTML = chartsHtml;

  if (typeof Chart !== "undefined") {
    Chart.defaults.font.family = "'Inter', sans-serif";
    Chart.defaults.color = "#64748b";

    const feeEl = document.getElementById("feeChart");
    if(feeEl) {
      dashboardCharts.push(new Chart(feeEl, {
        type: "doughnut",
        data: {
          labels: ["Paid", "Pending", "Partial"],
          datasets: [{ data: [feeStatus.paid, feeStatus.pending, feeStatus.partial], backgroundColor: ["#22c55e", "#ef4444", "#f59e0b"], borderWidth: 0, hoverOffset: 4 }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } }, cutout: '70%', animation: { duration: 800 } }
      }));
    }

    const classEl = document.getElementById("classChart");
    if(classEl) {
      dashboardCharts.push(new Chart(classEl, {
        type: "bar",
        data: {
          labels: Object.keys(classDist),
          datasets: [{ label: 'Students', data: Object.values(classDist), backgroundColor: "#3b82f6", borderRadius: 6 }]
        },
        options: { 
          responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: true, border: {dash: [4,4]} }, x: { grid: {display: false} } },
          animation: { duration: 800 }
        }
      }));
    }

    const attEl = document.getElementById("attChart");
    if(attEl) {
      dashboardCharts.push(new Chart(attEl, {
        type: "pie",
        data: {
          labels: ["Present", "Absent/Unknown"],
          datasets: [{ data: [presentToday, absentToday], backgroundColor: ["#0284c7", "#94a3b8"], borderWidth: 0, hoverOffset: 4 }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } }, animation: { duration: 800 } }
      }));
    }
  }
}

function renderHeader() {
  refs.moduleTitle.textContent = moduleConfig[currentModule].title;
  let subtitle = moduleConfig[currentModule].subtitle;
  if (currentModule === "users" && userIsAdmin()) {
    subtitle = "Manage user accounts and assign roles — Admin only";
  }
  refs.moduleSubtitle.textContent = subtitle;
}

function populateEnrollStudentSelect() {
  if (!refs.faceEnrollStudentSelect) return;
  const store = getStore();
  const isTeachers = currentModule === "teachers";
  const people = isTeachers ? (store.teachers || []) : (store.students || []);

  const sel = refs.faceEnrollStudentSelect;
  const current = sel.value;
  sel.innerHTML = "";

  const empty = document.createElement("option");
  empty.value = "";
  empty.textContent = isTeachers ? "Select teacher..." : "Select student...";
  sel.appendChild(empty);

  people.forEach((p) => {
    const opt = document.createElement("option");
    opt.value = p.fullName;
    if (isTeachers) {
      opt.textContent = `${p.fullName}${p.phone ? ` (${p.phone})` : ""}${p.department ? ` - ${p.department}` : ""}`;
    } else {
      opt.textContent = `${p.fullName}${p.rollNo ? ` (${p.rollNo})` : ""}${p.className ? ` - ${p.className}` : ""}`;
    }
    sel.appendChild(opt);
  });

  if (Array.from(sel.options).some(o => o.value === current)) {
    sel.value = current;
  }
}

function renderModuleTools() {
  refs.printDocBtn.disabled = !printableModules.has(currentModule);

  if (refs.classFilter) {
    if (currentModule === "students") {
      refs.classFilter.classList.remove("hidden");
      const store = getStore();
      const currentVal = refs.classFilter.value;
      refs.classFilter.innerHTML = '<option value="">All Classes</option>';
      const classOptions = Array.from(new Set((store.classes || []).map((x) => [x.className, x.section].filter(Boolean).join("-")).filter(Boolean)));
      classOptions.forEach(opt => {
        const option = document.createElement("option");
        option.value = opt;
        option.textContent = opt;
        refs.classFilter.appendChild(option);
      });
      if (classOptions.includes(currentVal)) {
        refs.classFilter.value = currentVal;
      }
    } else {
      refs.classFilter.classList.add("hidden");
    }
  }


  // Students and teachers don't get export CSV/PDF buttons for sensitive modules
  const canExport = userIsAdmin() || userIsStaffOrAbove() || String(currentUser?.role || "").toLowerCase() === "teacher";
  if (refs.exportCsvBtn) refs.exportCsvBtn.style.display = canExport ? "" : "none";
  if (refs.exportPdfBtn) refs.exportPdfBtn.style.display = canExport ? "" : "none";
  if (refs.importDataBtn) {
    const canImport = currentModule !== "dashboard" && canCurrentUserWrite(currentModule);
    refs.importDataBtn.classList.toggle("hidden", !canImport);
  }
  if (refs.print4in1Btn) refs.print4in1Btn.classList.toggle("hidden", currentModule !== "fees");

  // Face panel only for users who can write attendance or manage people
  const showFacePanel = (currentModule === "attendance" || currentModule === "teacherAttendance" || currentModule === "students" || currentModule === "teachers")
    && (userIsAdmin() || userIsStaffOrAbove() || String(currentUser?.role || "").toLowerCase() === "teacher");
  refs.facePanel.classList.toggle("hidden", !showFacePanel);

  if (!showFacePanel) return;

  const isEnrollMode = (currentModule === "students" || currentModule === "teachers");

  // Set target type based on module
  if (refs.faceTargetType) {
    if (currentModule === "teachers") refs.faceTargetType.value = "teachers";
    else if (currentModule === "students") refs.faceTargetType.value = "students";
    refs.faceTargetType.disabled = isEnrollMode;
  }

  refs.enrollFaceBtn?.classList.toggle("hidden", !isEnrollMode);
  refs.markFaceAttendanceBtn?.classList.toggle("hidden", isEnrollMode);

  refs.faceEnrollStudentField?.classList.toggle("hidden", !isEnrollMode);
  refs.faceManualNameField?.classList.toggle("hidden", isEnrollMode);
  refs.faceManualClassField?.classList.toggle("hidden", isEnrollMode);
  refs.faceStatusField?.classList.toggle("hidden", isEnrollMode);

  refs.faceAutoControls?.classList.toggle("hidden", isEnrollMode);

  if (isEnrollMode) {
    refs.faceStatusText.textContent = "Enroll mode: select a person and click Enroll Face.";
    populateEnrollStudentSelect();
  } else {
    refs.faceStatusText.textContent = "Open attendance module to use face recognition.";
  }
}

function renderStudentPortalView() {
  const linkedStudent = getLinkedStudent();
  const contentArea = document.querySelector(".content-area");
  
  if (!linkedStudent) {
    if (contentArea) contentArea.innerHTML = `
      <div class="panel" style="text-align:center; padding:40px;">
        <h3 style="color:#ef4444; font-size:1.5rem; margin-bottom:10px;">Student Record Not Found</h3>
        <p style="color:#64748b; font-size:1rem;">Your user account is not linked to a valid student record.</p>
      </div>`;
    renderNav();
    return;
  }

  // Hide sidebar and adjust main layout
  if (refs.sidebar) refs.sidebar.style.display = "none";
  if (refs.mobileMenuBtn) refs.mobileMenuBtn.style.display = "none";
  const appEl = document.querySelector(".app");
  if (appEl) {
    appEl.style.display = "block";
  }
  const main = document.querySelector(".main");
  if (main) {
    main.style.marginLeft = "0";
    main.style.width = "100%";
    main.style.paddingLeft = "0"; // Mobile adjustment
  }

  // Customize topbar
  const topbar = document.querySelector(".topbar");
  if (topbar) {
    topbar.style.paddingLeft = "20px";
    const actions = topbar.querySelector(".topbar-actions");
    if (actions) {
      actions.innerHTML = `
        <button style="background:transparent;border:none;font-size:1.3rem;position:relative;margin-right:15px;cursor:pointer;">
          🔔
          <span style="position:absolute;top:-4px;right:-4px;background:#ef4444;color:#fff;border-radius:50%;font-size:0.6rem;padding:2px 5px;font-weight:bold;">1</span>
        </button>
        <button id="portalLogoutBtn" class="dark" style="border-radius:10px;">Logout</button>
      `;
      document.getElementById("portalLogoutBtn").addEventListener("click", async () => {
        await logout();
        window.location.reload();
      });
    }
    const titleDiv = topbar.querySelector(".topbar-title");
    if (titleDiv) {
      titleDiv.innerHTML = `
        <h2 style="font-size:1.4rem; margin:0; line-height:1.2;">Student Portal</h2>
        <p style="color:#64748b; font-size:0.85rem; margin:0;">Welcome back, ${linkedStudent.fullName || "Student"}</p>
      `;
    }
  }

  // Inject Student Portal HTML
  let portalCon = document.getElementById("studentPortalContainer");
  if (!portalCon && contentArea) {
    contentArea.innerHTML = "";
    portalCon = document.createElement("div");
    portalCon.id = "studentPortalContainer";
    portalCon.style.width = "100%";
    portalCon.style.maxWidth = "1100px";
    portalCon.style.margin = "0 auto";
    portalCon.style.padding = "10px 0";

    portalCon.innerHTML = `
      <div style="background:linear-gradient(135deg, #1e293b, #0f172a); color:#fff; border-radius:16px; padding:20px; margin-bottom:24px; box-shadow:0 10px 25px rgba(0,0,0,0.1); position:relative; overflow:hidden;">
        <div style="position:absolute; top:-20px; right:-20px; font-size:8rem; opacity:0.05;">📢</div>
        <h3 style="margin:0 0 10px 0; font-size:1.1rem; color:#94a3b8; text-transform:uppercase; letter-spacing:1px;">Latest Announcements</h3>
        <p style="margin:0; font-size:1rem; line-height:1.5;">Welcome to your personalized portal. Keep track of your academic performance, schedule, and fees here.</p>
      </div>

      <div class="student-profile-tabs" style="margin-bottom: 24px; display:flex; flex-wrap:wrap; gap:8px; background:transparent; border-bottom:none; padding:0;">
        <button class="student-profile-tab active" data-tab="profile" onclick="setStudentPortalTab('profile')" style="border:1px solid #e2e8f0; background:#fff;">Profile</button>
        <button class="student-profile-tab" data-tab="fees" onclick="setStudentPortalTab('fees')" style="border:1px solid #e2e8f0; background:#fff;">Fees & Dues</button>
        <button class="student-profile-tab" data-tab="feeCard" onclick="setStudentPortalTab('feeCard')" style="border:1px solid #e2e8f0; background:#fff;">Fee Card</button>
        <button class="student-profile-tab" data-tab="exams" onclick="setStudentPortalTab('exams')" style="border:1px solid #e2e8f0; background:#fff;">Exams</button>
        <button class="student-profile-tab" data-tab="attendance" onclick="setStudentPortalTab('attendance')" style="border:1px solid #e2e8f0; background:#fff;">Attendance</button>
        <button class="student-profile-tab" data-tab="timetable" onclick="setStudentPortalTab('timetable')" style="border:1px solid #e2e8f0; background:#fff;">Time Table</button>
      </div>
      <div id="studentPortalContent" class="student-profile-content" style="padding:0; overflow:visible; background:transparent;"></div>
    `;
    contentArea.appendChild(portalCon);
  }

  // Hijack the active refs for `renderStudentProfile` to point back to the portal
  studentProfileStudent = linkedStudent;
  if (!window.originalRenderStudentProfile) {
    window.originalRenderStudentProfile = renderStudentProfile;
  }
  
  refs.studentProfileContent = document.getElementById("studentPortalContent");
  refs.studentProfileTabs = document.getElementById("studentPortalContainer")?.querySelectorAll(".student-profile-tab");

  // Monkey-patch to hide admin buttons in the main view
  renderStudentProfile = function() {
    window.originalRenderStudentProfile();
    if (refs.studentProfileContent) {
      // Hide Action Button wrapper inside Profile tab
      const buttonsDiv = refs.studentProfileContent.querySelector('div[style*="linear-gradient"] > button[data-profile-action]')?.parentElement;
      if (buttonsDiv) buttonsDiv.style.display = "none";
      
      // Inject Timetable if selected
      if (activeStudentProfileTab === "timetable") {
        renderStudentPortalTimetable(linkedStudent);
      }
    }
  };

  renderStudentProfile();

  // Mount Vidya AI Avatar (only once)
  if (!document.getElementById("vidyaWidget")) {
    mountVidyaAvatar(linkedStudent);
  }
}

async function renderAiAssistant() {
  const contentArea = document.querySelector(".content-area");
  let panel = document.getElementById("ai-panel");
  
  if (!panel) {
    panel = document.createElement("div");
    panel.id = "ai-panel";
    panel.className = "panel";
    contentArea.appendChild(panel);
  }
  panel.style.display = "";
  panel.innerHTML = `
    <div style="background: linear-gradient(135deg, #7c3aed, #4f46e5); padding: 24px; border-radius: 12px; color: white; margin-bottom: 24px;">
      <h2 style="margin: 0; font-size: 1.5rem;">🧠 Vidya AI Brain Control</h2>
      <p style="margin: 8px 0 0; opacity: 0.9;">Feed Vidya with school rules, bus timings, and special instructions.</p>
    </div>
    
    <div style="background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px;">
      <h3 style="margin: 0 0 16px; font-size: 1.1rem; color: #1e293b;">🏫 School Global Knowledge</h3>
      <p style="font-size: 0.85rem; color: #64748b; margin-bottom: 12px;">
        Vidya will use the information below to answer student and staff queries. Be specific!
      </p>
      
      <textarea id="aiKnowledgeText" style="width: 100%; min-height: 300px; padding: 16px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-family: inherit; font-size: 0.9rem; line-height: 1.6; transition: border-color 0.2s; outline: none;" placeholder="Example:\n- School starts at 8:00 AM and ends at 2:30 PM.\n- Bus Route A: Drivers Name (Ranveer), Phone (9876543210).\n- Summer Holidays start from May 15th.\n- Library remains closed on Saturdays."></textarea>
      
      <div style="margin-top: 20px; display: flex; justify-content: flex-end;">
        <button id="saveAiKnowledgeBtn" class="btn btn-primary" style="background:#7c3aed; border:none; padding: 10px 24px; font-weight: 600;">💾 Save Knowledge Base</button>
      </div>
    </div>
  `;

  const textarea = document.getElementById("aiKnowledgeText");
  const saveBtn = document.getElementById("saveAiKnowledgeBtn");

  // Load existing knowledge
  try {
    const settings = await api("/api/settings");
    const k = settings.find(s => s.key === "ai_school_knowledge");
    if (k) textarea.value = k.value;
  } catch (err) { console.error("Failed to load AI knowledge", err); }

  saveBtn.onclick = async () => {
    const val = textarea.value.trim();
    saveBtn.disabled = true;
    saveBtn.textContent = "Saving...";
    
    try {
      await api("/api/settings", {
        method: "POST",
        body: JSON.stringify({ key: "ai_school_knowledge", value: val, category: "AI" })
      });
      showToast("Knowledge Base Updated Successfully! 🧠✨");
    } catch (err) {
      console.error(err);
      showToast("Failed to update knowledge.", "error");
    } finally {
      saveBtn.disabled = false;
      saveBtn.textContent = "💾 Save Knowledge Base";
    }
  };
}

window.setStudentPortalTab = function(tab) {
  activeStudentProfileTab = tab;
  renderStudentProfile();
};

function renderStudentPortalTimetable(student) {
  const store = getStore();
  const split = splitClassName(student.className);
  const classSec = [split.classPart, split.sectionPart].filter(Boolean).join("-");
  
  // Filter timetable for this student's exact class
  const schedules = (store.timetable || []).filter(t => t.className === classSec || t.className === student.className);
  
  if (!schedules.length) {
    refs.studentProfileContent.innerHTML = '<div style="text-align:center; padding:40px; color:#64748b; background:#f8fafc; border-radius:12px; border:1px dashed #cbd5e1;">Time Table not available for this class.</div>';
    return;
  }

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  let html = '<div style="display:grid; gap:16px;">';
  
  days.forEach(day => {
    const daySchedules = schedules.filter(s => Array.isArray(s.days) ? s.days.includes(day) : s.days === day);
    if (daySchedules.length > 0) {
      daySchedules.sort((a, b) => (a.startTime || "").localeCompare(b.startTime || ""));
      html += `
        <div style="background:#fff; border:1px solid #e2e8f0; border-radius:12px; overflow:hidden;">
          <h4 style="background:#f1f5f9; margin:0; padding:10px 16px; font-size:0.95rem; color:#1e293b; border-bottom:1px solid #e2e8f0;">${day}</h4>
          <div style="padding:10px 16px;">
            ${daySchedules.map(s => `
              <div style="display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px dashed #e2e8f0; font-size:0.85rem;">
                <div><span style="font-weight:600; color:#0f172a;">${s.subject || "-"}</span> <span style="color:#64748b; font-size:0.75rem;">(${s.teacherName || "-"})</span></div>
                <div style="color:#475569; font-family:monospace;">${s.startTime || ""} - ${s.endTime || ""}</div>
              </div>
            `).join("")}
          </div>
        </div>
      `;
    }
  });
  html += '</div>';
  refs.studentProfileContent.innerHTML = html;
}

function renderAll() {
  if (userIsStudent()) {
    if (typeof renderStudentPortalView === "function") {
      renderStudentPortalView();
      return;
    }
  } else {
    // Mount Vidya for Admins/Principal as well
    if (userIsStaffOrAbove() && !document.getElementById("vidyaWidget")) {
      mountVidyaAvatar(null); // Pass null for non-student
    }
  }

  const isDashboard = currentModule === "dashboard";
  const isBD = currentModule === "booksAndDress";
  const isWA = currentModule === "whatsappAlerts";
  const isAI = currentModule === "aiAssistant";

  const sc = document.getElementById("statsCards");
  if (sc) sc.style.display = isDashboard ? "" : "none";

  const contentArea = document.querySelector(".content-area");
  if (contentArea) {
    contentArea.querySelectorAll(".panel:not(#facePanel):not(#assistantPanel):not(#waAlertPanel):not(#bd-panel):not(#ai-panel)").forEach(p => {
      p.style.display = (isBD || isWA || isAI) ? "none" : "";
    });
  }

  if (isAI) {
    renderAiAssistant();
    return;
  }

  const bdPanel = document.getElementById("bd-panel");
  if (isBD && typeof window.showBDPanel === "function") {
    window.showBDPanel();
  } else if (bdPanel) {
    bdPanel.style.display = "none";
  }

  const waPanel = document.getElementById("waAlertPanel");
  if (isWA && typeof window.renderWhatsAppModule === "function") {
    window.renderWhatsAppModule();
  } else if (waPanel) {
    waPanel.style.display = "none";
  }

  renderNav();
  renderHeader();
  renderStatsCards();
  renderForm();
  renderTable();
  renderModuleTools();
}

function toCsv(rows, columns) {
  const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const header = columns.map(c => esc(c)).join(",");
  const body = rows.map(r => columns.map(c => esc(r[c])).join(","));
  return [header, ...body].join("\n");
}

function downloadBlob(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function exportCurrentCsv() {
  const rows = getCurrentList();
  if (!rows.length) return window.alert("No records to export.");
  
  const skipFiles = ["photo", "aadhar", "tc", "reportCard", "fatherAadhar", "motherAadhar", "id", "facePhoto"];
  const config = moduleConfig[currentModule];
  const columns = (config.fields || []).filter(f => !skipFiles.includes(f));
  
  if (currentModule === "dashboard") {
    const csv = toCsv(rows, ["Metric", "Value"]);
    downloadBlob(`dashboard-${todayStr()}.csv`, csv, "text/csv;charset=utf-8");
    return;
  }
  
  const csv = toCsv(rows, columns);
  downloadBlob(`${currentModule}-${todayStr()}.csv`, csv, "text/csv;charset=utf-8");
}

function exportCurrentPdf() {
  const rows = getCurrentList();
  if (!rows.length) return window.alert("No records to export.");

  if (currentModule === "fees") {
    const feeColumns = ["Student Name", "Class", "Roll No", "Term", "Fee Details", "Total", "Paid", "Balance", "Date", "Method", "Status"];
    const body = rows.map(f => {
      let details = "";
      if (f.monthlyFeeLabel && parseFloat(f.monthlyFee) > 0) {
        details += `Fees: ${f.monthlyFeeLabel} (Rs. ${f.monthlyFee})\n`;
      } else if (f.feeTypes) {
        details += `Fees: ${f.feeTypes}\n`;
      }
      
      const indivFees = [
        { key: "tuitionFee", label: "Tuition" },
        { key: "admissionFee", label: "Admission" },
        { key: "computerFee", label: "Computer" },
        { key: "developmentFee", label: "Development" },
        { key: "labFee", label: "Lab" },
        { key: "sportsFee", label: "Sports" },
        { key: "libraryFee", label: "Library" },
        { key: "examFee", label: "Exam" },
        { key: "otherFee", label: "Other" }
      ];
      indivFees.forEach(inf => {
        if (parseFloat(f[inf.key]) > 0) {
          details += `${inf.label}: Rs. ${f[inf.key]}\n`;
        }
      });
      
      return [
        f.studentName || "", f.className || "", f.rollNo || "", f.term || "", details.trim() || "-", 
        f.totalFee || "0", f.paidAmount || "0", f.balance || "0", f.paymentDate || "", f.paymentMethod || "", f.status || ""
      ];
    });

    const doc = new window.jspdf.jsPDF('landscape');
    doc.text(`Fees Report`, 14, 14);
    doc.autoTable({ head: [feeColumns], body, startY: 22, styles: { cellPadding: 2, fontSize: 7 }, columnStyles: { 4: { cellWidth: 70 } } });
    doc.save(`fees-${todayStr()}.pdf`);
    return;
  }

  const skipFiles = ["photo", "aadhar", "tc", "reportCard", "fatherAadhar", "motherAadhar", "id"];
  const columns = currentModule === "dashboard" ? ["Metric", "Value"] : moduleConfig[currentModule].fields.filter(f => !skipFiles.includes(f));
  
  const body = rows.map(row => columns.map(c => row[c] ?? ""));
  const doc = new window.jspdf.jsPDF('landscape');
  doc.text(`${moduleConfig[currentModule].title} Report`, 14, 14);
  doc.autoTable({ head: [columns.map(toLabel)], body, startY: 22, styles: { fontSize: 7, cellPadding: 2 } });
  doc.save(`${currentModule}-${todayStr()}.pdf`);
}

function printFeeReceipt(f) {
  const schoolName = "Tapowan Public School";
  const receiptNo = "RCP-" + (f.id || Date.now());
  const printDate = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });
  const totalFee = parseFloat(f.totalFee) || 0;
  const paidAmount = parseFloat(f.paidAmount) || 0;
  const balance = parseFloat(f.balance) || (totalFee - paidAmount);
  const statusColor = String(f.status).toLowerCase() === "paid" ? "#16a34a" : String(f.status).toLowerCase() === "partial" ? "#d97706" : "#dc2626";

  const html = `
    <div style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif;border:2px solid #1e3a8a;border-radius:10px;overflow:hidden;">
      <!-- Header -->
      <div style="background:#1e3a8a;color:#fff;padding:18px 24px;text-align:center;">
        <div style="font-size:26px;font-weight:900;letter-spacing:1px;">${schoolName}</div>
        <div style="font-size:13px;margin-top:4px;opacity:0.85;">Fee Payment Receipt</div>
      </div>
      <!-- Receipt meta -->
      <div style="display:flex;justify-content:space-between;padding:12px 24px;background:#f0f4ff;border-bottom:1px solid #c7d2fe;font-size:13px;color:#1e3a8a;">
        <div><strong>Receipt No:</strong> ${receiptNo}</div>
        <div><strong>Date:</strong> ${printDate}</div>
      </div>
      <!-- Student Info -->
      <div style="padding:16px 24px;border-bottom:1px solid #e2e8f0;">
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <tr>
            <td style="padding:5px 0;color:#64748b;width:40%;">Student Name</td>
            <td style="padding:5px 0;font-weight:700;color:#0f172a;">${f.studentName || "-"}</td>
          </tr>
          <tr>
            <td style="padding:5px 0;color:#64748b;">Class</td>
            <td style="padding:5px 0;font-weight:600;">${f.className || "-"}</td>
          </tr>
          <tr>
            <td style="padding:5px 0;color:#64748b;">Roll No</td>
            <td style="padding:5px 0;">${f.rollNo || "-"}</td>
          </tr>
          <tr>
            <td style="padding:5px 0;color:#64748b;">Term</td>
            <td style="padding:5px 0;">${f.term || "-"}</td>
          </tr>
          <tr>
            <td style="padding:5px 0;color:#64748b;">Payment Date</td>
            <td style="padding:5px 0;">${f.paymentDate || "-"}</td>
          </tr>
          <tr>
            <td style="padding:5px 0;color:#64748b;">Payment Method</td>
            <td style="padding:5px 0;">
              ${f.paymentMethod || "-"}
              ${f.paymentMethod === "Online + Cash" ? `
                <div style="font-size:12px;color:#64748b;margin-top:4px;">
                  Online: ₹${(parseFloat(f.onlineAmount)||0).toLocaleString("en-IN")} | 
                  Cash: ₹${(parseFloat(f.cashAmount)||0).toLocaleString("en-IN")}
                </div>
              ` : ""}
            </td>
          </tr>
        </table>
      </div>
      <!-- Fee Summary -->
      <div style="padding:16px 24px;border-bottom:1px solid #e2e8f0;">
        <div style="font-weight:700;color:#1e3a8a;margin-bottom:10px;font-size:15px;">Fee Summary</div>
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <tr style="background:#f8fafc;">
            <td style="padding:8px 10px;border:1px solid #e2e8f0;color:#475569;">Total Fee</td>
            <td style="padding:8px 10px;border:1px solid #e2e8f0;text-align:right;font-weight:600;">₹ ${totalFee.toLocaleString("en-IN")}</td>
          </tr>
          <tr>
            <td style="padding:8px 10px;border:1px solid #e2e8f0;color:#475569;">Amount Paid</td>
            <td style="padding:8px 10px;border:1px solid #e2e8f0;text-align:right;font-weight:600;color:#16a34a;">₹ ${paidAmount.toLocaleString("en-IN")}</td>
          </tr>
          <tr style="background:#fef2f2;">
            <td style="padding:8px 10px;border:1px solid #e2e8f0;color:#475569;">Balance Due</td>
            <td style="padding:8px 10px;border:1px solid #e2e8f0;text-align:right;font-weight:700;color:#dc2626;">₹ ${balance.toLocaleString("en-IN")}</td>
          </tr>
        </table>
      </div>
      <!-- Status -->
      <div style="padding:14px 24px;display:flex;justify-content:space-between;align-items:center;">
        <div style="font-size:13px;color:#64748b;">Payment Status</div>
        <div style="background:${statusColor};color:#fff;padding:4px 18px;border-radius:20px;font-size:13px;font-weight:700;">${f.status || "Pending"}</div>
      </div>
      <!-- Footer -->
      <div style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:12px 24px;text-align:center;font-size:12px;color:#94a3b8;">
        This is a computer-generated receipt. No signature required. &mdash; ${schoolName}
      </div>
    </div>`;

  const receiptHtml = buildPrintableHtml("Fee Receipt - " + schoolName, html);
  const w = window.open("", "_blank");
  if (!w) return window.alert("Popup blocked. Please allow popups for this site and try again.");
  w.document.write(receiptHtml);
  w.document.close();
  w.focus();
}

function buildPrintableHtml(title, contentHtml) {
  return `<!doctype html><html><head><title>${title}</title><style>
    body{font-family:Arial;margin:20px;color:#0f172a;} .box{border:1px solid #cbd5e1;border-radius:8px;padding:12px;margin-bottom:12px;}
    h1{margin:0 0 8px 0;font-size:20px;} h2{margin:0 0 6px 0;font-size:16px;} .row{margin:3px 0;}

    /* Auto-fit text utility (AI-style: reduces font-size until it fits) */
    .fitbox{display:block;overflow:hidden;white-space:nowrap;}

    .id-header{margin-bottom:14px;}
    .id-header h1{font-size:22px;margin:0 0 4px 0;}
    .id-header p{margin:0;color:#334155;font-size:13px;}
    .id-grid{display:flex;flex-wrap:wrap;gap:12px;}

    /* Sample-like card (template + overlay) */
    .t-grid{display:flex;flex-wrap:wrap;gap:14px;align-items:flex-start;}
    .t-card{width:420px;height:580px;position:relative;overflow:hidden;border-radius:18px;page-break-inside:avoid;background:#fff;box-shadow:0 2px 10px rgba(2,6,23,0.06);}
    .t-bg{position:absolute;inset:0;width:100%;height:100%;object-fit:fill;z-index:0;}
    .t-overlay{position:absolute;inset:0;z-index:1;pointer-events:none;}
    .t-cover{position:absolute;background:rgba(255,255,255,0.92);border-radius:10px;z-index:2;}
    .t-text{position:absolute;z-index:3;color:#0f172a;text-shadow:0 1px 0 rgba(255,255,255,0.25);}
    .t-photo{position:absolute;z-index:4;border:5px solid rgba(255,255,255,0.95);border-radius:50%;overflow:hidden;background:#fff;box-shadow:0 4px 10px rgba(2,6,23,0.15);}
    .t-photo img{width:100%;height:100%;object-fit:cover;display:block;}

    @media print{body{margin:10mm;} .t-grid{gap:8px;} .t-card{box-shadow:none;}}
  </style></head><body>
    ${contentHtml}
    <script>
      (function(){
        function fitText(el, min=10, max=26){
          if (!el) return;
          // Ensure starting font-size is within range.
          var base = parseFloat(window.getComputedStyle(el).fontSize) || max;
          base = Math.max(min, Math.min(max, base));
          var size = base;
          el.style.fontSize = size + 'px';
          // Binary-search like fitting by measuring scroll vs box.
          function fits(){
            // For nowrap elements, compare scrollWidth with offsetWidth.
            return el.scrollWidth <= el.clientWidth + 1 && el.scrollHeight <= el.clientHeight + 1;
          }
          var lo = min, hi = size;
          if (fits()) return;
          // Decrease until it fits
          for (var i=0;i<12;i++){
            size = Math.floor((lo+hi)/2);
            el.style.fontSize = size + 'px';
            if (fits()) hi = size; else lo = size;
          }
          el.style.fontSize = hi + 'px';
        }
        function autoFitAll(){
          var boxes = document.querySelectorAll('.fitbox');
          for (var i=0;i<boxes.length;i++){
            var el = boxes[i];
            // Heuristic: allow bigger for name-like fields.
            var max = (el.getAttribute('data-max') ? parseFloat(el.getAttribute('data-max')) : 26);
            fitText(el, 10, max || 26);
          }
        }
        window.addEventListener('load', function(){
          autoFitAll();
          // Small delay to let layout settle before print.
          setTimeout(function(){ try{ window.print(); }catch(e){} }, 150);
        });
      })();
    </script>
  </body></html>`;
}

function printDocumentByModule() {
  if (!printableModules.has(currentModule)) return;
  const store = getStore();

  // ── Students → Premium ID Cards ──────────────────────────────────────────
  if (currentModule === "students") {
    const fullHtml = generateIdCardsHTML(store);
    const w = window.open("", "_blank");
    if (!w) return window.alert("Popup blocked. Please allow popups for this site and try again.");
    w.document.open();
    w.document.write(fullHtml);
    w.document.close();
    w.focus();
    return;
  }

  // ── Other modules ───────────────────────────────────────────────────────
  let html = `<h1>${moduleConfig[currentModule].title}</h1>`;

  if (currentModule === "exams") {
    html += (store.exams || []).slice(0, 5).map(r => `<div class="box"><h2>Report Card</h2>
      <div class="row"><strong>Student:</strong> ${r.studentName}</div>
      <div class="row"><strong>Exam:</strong> ${r.examName}</div>
      <div class="row"><strong>Subject:</strong> ${r.subject}</div>
      <div class="row"><strong>Marks:</strong> ${r.marksObtained}/${r.maxMarks} (${r.grade})</div></div>`).join("");

  } else if (currentModule === "fees") {
    const schoolName = "Tapowan Public School";
    const PRINT_FEE_TYPES = [
      { key: "tuitionFee", label: "Tuition Fee", icon: "📚" },
      { key: "admissionFee", label: "Admission Fee", icon: "🎓" },
      { key: "computerFee", label: "Computer Fee", icon: "💻" },
      { key: "developmentFee", label: "Development Fee", icon: "🏗️" },
      { key: "labFee", label: "Lab Fee", icon: "🔬" },
      { key: "sportsFee", label: "Sports Fee", icon: "⚽" },
      { key: "libraryFee", label: "Library Fee", icon: "📖" },
      { key: "examFee", label: "Exam Fee", icon: "📝" },
      { key: "lateFee", label: "Late Fee", icon: "⏳" },
      { key: "otherFee", label: "Other Fee", icon: "➕" },
    ];
    html = `
      <div style="text-align:center;margin-bottom:20px;border-bottom:2px solid #1e3a8a;padding-bottom:14px;">
        <div style="font-size:24px;font-weight:900;color:#1e3a8a;">${schoolName}</div>
        <div style="font-size:14px;color:#475569;margin-top:4px;">Fee Records &mdash; Printed on ${new Date().toLocaleDateString("en-IN",{day:"2-digit",month:"long",year:"numeric"})}</div>
      </div>`;
    html += (store.fees || []).map(f => {
      const totalFee = parseFloat(f.totalFee) || 0;
      const paidAmount = parseFloat(f.paidAmount) || 0;
      const balance = parseFloat(f.balance) || (totalFee - paidAmount);
      const statusColor = String(f.status).toLowerCase() === "paid" ? "#16a34a" : String(f.status).toLowerCase() === "partial" ? "#d97706" : "#dc2626";
      let feeDetails = ""; let hasBrk = false;
      PRINT_FEE_TYPES.forEach(({ key, label, icon }) => {
        const amt = parseFloat(f[key]) || 0;
        if (amt > 0) { hasBrk = true; feeDetails += `<div class="row">${icon} ${label}: <strong>₹${amt.toLocaleString("en-IN")}</strong></div>`; }
      });
      if (!hasBrk) {
        const labels = (f.feeTypes || f.monthlyFeeLabel || "").trim();
        const totalMonthly = parseFloat(f.monthlyFee) || 0;
        if (labels && totalMonthly > 0) {
          const parts = labels.split(",").map(s => s.trim()).filter(Boolean);
          const perPart = parts.length > 0 ? totalMonthly / parts.length : 0;
          parts.forEach(part => { feeDetails += `<div class="row">💳 ${part}: <strong>₹${perPart.toLocaleString("en-IN")}</strong></div>`; });
        } else if (labels) {
          feeDetails += `<div class="row">Fee Types: ${labels}</div>`;
        }
      }

      // ── Add Books & Dress items breakdown ──
      try {
        const ids = JSON.parse(f.selectedBookIds || "[]");
        if (ids.length) {
          const allBDItems = [...(typeof window.bdBooks !== "undefined" ? window.bdBooks : []), ...(typeof window.bdDresses !== "undefined" ? window.bdDresses : [])];
          ids.map(id => allBDItems.find(r => String(r.id) === String(id)))
             .filter(Boolean)
             .sort((a,b) => (a.itemType||"").localeCompare(b.itemType||"") || (a.itemName||"").localeCompare(b.itemName||""))
             .forEach(item => {
               const p = parseFloat(item.price) || 0;
               feeDetails += `<div class="row" style="color:#1e40af;">${item.itemType === "Book" ? "📚" : "👕"} ${item.itemName}: <strong>₹${p.toLocaleString("en-IN")}</strong></div>`;
             });
        }
      } catch(e) {}
      return `<div class="box" style="page-break-inside:avoid;">
        <h2 style="color:#1e3a8a;margin-bottom:8px;">Fee Receipt &mdash; RCP-${f.id}</h2>
        <div class="row"><strong>Student:</strong> ${f.studentName || "-"} &nbsp;|&nbsp; <strong>Father:</strong> ${f.fatherName || "-"}</div>
        <div class="row"><strong>Class:</strong> ${f.className || "-"} &nbsp;|&nbsp; <strong>Roll No:</strong> ${f.rollNo || "-"}</div>
        <div class="row"><strong>Term:</strong> ${f.term || "-"} &nbsp;|&nbsp; <strong>Payment Date:</strong> ${f.paymentDate || "-"}</div>
        <div style="margin:8px 0;padding:8px;background:#f0f4ff;border-radius:6px;border-left:3px solid #1e3a8a;">
          <div style="font-weight:700;color:#1e3a8a;margin-bottom:4px;font-size:0.85em;">📋 Fee Breakdown:</div>
          ${feeDetails || '<div class="row" style="color:#94a3b8;">No fee breakdown recorded.</div>'}
        </div>
        <div class="row"><strong>Total Fee:</strong> ₹${totalFee.toLocaleString("en-IN")} &nbsp;|&nbsp; <strong>Paid:</strong> ₹${paidAmount.toLocaleString("en-IN")} &nbsp;|&nbsp; <strong>Balance:</strong> ₹${balance.toLocaleString("en-IN")}</div>
        <div class="row"><strong>Method:</strong> ${f.paymentMethod || "-"}${f.paymentMethod === "Online + Cash" ? ` (Online: ₹${(parseFloat(f.onlineAmount)||0).toLocaleString("en-IN")}, Cash: ₹${(parseFloat(f.cashAmount)||0).toLocaleString("en-IN")})` : ""} &nbsp;|&nbsp; <strong>Status:</strong> <span style="color:${statusColor};font-weight:700;">${f.status || "Pending"}</span></div>
      </div>`;
    }).join("");
  }

  const w = window.open("", "_blank");
  if (!w) return window.alert("Popup blocked. Please allow popups for this site and try again.");
  w.document.write(buildPrintableHtml(moduleConfig[currentModule].title, html));
  w.document.close();
  w.focus();
}



// --- InsightFace Integration ---
// Using static IP to prevent offline errors in Android wrapper
let insightFaceApiUrl = getApiBaseUrl() + "/api/face";

async function ensureFaceModelsLoaded() {
  if (faceModelsReady) return true;
  refs.faceStatusText.textContent = "Connecting to InsightFace server...";
  try {
    const res = await fetch(`${insightFaceApiUrl}/status`);
    if (!res.ok) throw new Error("Server not responding correctly");
    faceModelsReady = true;
    refs.faceStatusText.textContent = "InsightFace server connected.";
    return true;
  } catch (err) {
    refs.faceStatusText.textContent = `InsightFace server not reachable. Ensure Python server is running on port 8000.`;
    return false;
  }
}

async function getInsightFace(imageSource) {
  try {
    let base64 = "";
    if (imageSource instanceof HTMLVideoElement) {
       base64 = videoFrameToResizedDataUrl(imageSource, 640, 0.85);
    } else if (imageSource instanceof HTMLCanvasElement) {
       base64 = imageSource.toDataURL("image/jpeg", 0.85);
    } else {
       return { face: [] };
    }
    
    const res = await fetch(base64);
    const blob = await res.blob();
    
    const formData = new FormData();
    formData.append('file', blob, 'face.jpg');
    
    const response = await fetch(`${insightFaceApiUrl}/extract`, {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) return { face: [] };
    const data = await response.json();
    return { face: data.faces || [] };
  } catch (err) {
    console.error("InsightFace extraction failed:", err);
    return { face: [] };
  }
}

let ipCamRafId = null;
let ipCamMode = false;
let ipCamDetectTimer = null; // throttled detection for IP cam
let ipCamLastDetections = []; // cached detection results
let ipCamDetecting = false;  // guard against concurrent detections

// Toggle IP camera URL input when camera source changes
if (refs.cameraSourceSelect) {
  refs.cameraSourceSelect.addEventListener('change', () => {
    const isIp = refs.cameraSourceSelect.value === 'ip';
    if (refs.ipCameraControls) refs.ipCameraControls.style.display = isIp ? 'flex' : 'none';
  });
}

async function startCamera() {
  const source = refs.cameraSourceSelect?.value || 'local';

  // Stop any existing stream / loops
  if (faceStream) { faceStream.getTracks().forEach(t => t.stop()); faceStream = null; }
  if (ipCamRafId) { cancelAnimationFrame(ipCamRafId); ipCamRafId = null; }
  if (ipCamDetectTimer) { clearTimeout(ipCamDetectTimer); ipCamDetectTimer = null; }
  if (aiBBoxAnimFrame) { cancelAnimationFrame(aiBBoxAnimFrame); aiBBoxAnimFrame = null; }
  ipCamLastDetections = [];
  ipCamDetecting = false;

  if (source === 'ip') {
    const url = (refs.ipCameraUrl?.value || '').trim();
    if (!url) { window.alert('Please enter the IP camera URL (e.g. http://192.168.1.100:8080/video)'); return; }
    ipCamMode = true;
    // Show IP cam wrapper, hide local cam wrapper
    if (refs.localCamWrapper) refs.localCamWrapper.style.display = 'none';
    refs.ipCamWrapper.style.display = 'block';
    refs.faceStatusText.textContent = 'IP Camera connecting…';

    refs.ipCameraImg.onerror = () => {
      refs.faceStatusText.textContent = '⚠️ Could not load IP camera. Check URL and network.';
    };

    // MJPEG or snapshot?
    const isSnapshot = /\.(jpg|jpeg|png|bmp)(\?|$)/i.test(url);
    if (isSnapshot) {
      const refreshSnap = () => { if (!ipCamMode) return; refs.ipCameraImg.src = url + (url.includes('?') ? '&' : '?') + 't=' + Date.now(); setTimeout(refreshSnap, 300); };
      refs.ipCameraImg.src = url;
      setTimeout(refreshSnap, 350);
    } else {
      refs.ipCameraImg.src = url; // MJPEG — browser streams it natively
    }

    // Sync overlay canvas size to img when it loads
    refs.ipCameraImg.onload = () => {
      refs.faceStatusText.textContent = '✅ IP Camera connected!';
      const oc = refs.ipOverlayCanvas;
      oc.width  = refs.ipCameraImg.naturalWidth  || 640;
      oc.height = refs.ipCameraImg.naturalHeight || 480;
    };

    // Load models in background — non-blocking
    ensureFaceModelsLoaded().then(() => {
      refs.faceStatusText.textContent = '✅ IP Camera ready — tap Capture Face or enable Auto.';
      startIpCamOverlay();
    });

  } else {
    // ── Local webcam ──────────────────
    ipCamMode = false;
    if (refs.ipCamWrapper) refs.ipCamWrapper.style.display = 'none';
    if (refs.localCamWrapper) refs.localCamWrapper.style.display = 'block';
    // Canvas is now always positioned inside localCamWrapper in HTML
    refs.faceCanvas.style.display = '';
    if (!navigator.mediaDevices?.getUserMedia) return window.alert('Camera API not available.');
    try {
      faceStream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
        audio: false
      });
      refs.faceVideo.srcObject = faceStream;
      refs.faceStatusText.textContent = 'Camera started. Loading AI models…';
      ensureFaceModelsLoaded().then(() => {
        refs.faceStatusText.textContent = '✅ Ready — AI models loaded.';
        startBBoxOverlay();
      });
    } catch (err) {
      refs.faceStatusText.textContent = `Camera access failed: ${err.message}`;
    }
  }
}

// ── IP Cam Overlay: TWO separate loops ───────────────────────────
// Layer 1 (rAF, 60fps): redraws bounding boxes from CACHED results — lightweight
// Layer 2 (setTimeout, 800ms): grabs a frame + runs detectAllFaces — throttled
function startIpCamOverlay() {
  const canvas = refs.ipOverlayCanvas; // dedicated transparent overlay canvas
  if (!canvas) return;
  // Sync canvas pixel dimensions to img display size
  const syncSize = () => {
    if (refs.ipCameraImg.naturalWidth > 0) {
      canvas.width  = refs.ipCameraImg.naturalWidth;
      canvas.height = refs.ipCameraImg.naturalHeight;
    } else {
      canvas.width = 640; canvas.height = 480;
    }
  };
  syncSize();
  const ctx = canvas.getContext('2d', { alpha: true, willReadFrequently: false });

  // Layer 1 (rAF ~60fps): clear canvas and redraw cached bounding box overlays only
  const redrawOverlay = () => {
    if (!ipCamMode) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const scaleX = canvas.width  / (refs.ipCameraImg.naturalWidth  || canvas.width);
    const scaleY = canvas.height / (refs.ipCameraImg.naturalHeight || canvas.height);
    const targetType = refs.faceTargetType?.value || 'students';
    const minConf = parseFloat(refs.autoMinConfidence?.value || '0.65');
    ipCamLastDetections.forEach(det => {
      const b = det.box; // Absolute pixel bounding box [x,y,w,h]
      const rawX = b[0], rawY = b[1], rawW = b[2], rawH = b[3];
      // Since det.box in human is [x,y,width,height] natively in pixels for the drawn source
      const box = { x: rawX * scaleX, y: rawY * scaleY, width: rawW * scaleX, height: rawH * scaleY };
      const desc = det.embedding;
      const match = findBestFaceMatch(desc, targetType, minConf);
      const score = match ? match.score : 0;
      const name  = match ? match.name : 'Unknown';
      const color = match ? (score >= 0.65 ? '#10b981' : score >= 0.55 ? '#f59e0b' : '#f97316') : '#ef4444';
      ctx.strokeStyle = color; ctx.lineWidth = 2.5;
      ctx.strokeRect(box.x, box.y, box.width, box.height);
      const label = match ? `${name} ${(score*100).toFixed(0)}%` : 'Unknown';
      ctx.font = 'bold 12px sans-serif';
      const tw = ctx.measureText(label).width + 12;
      const ly = box.y > 24 ? box.y - 22 : box.y + box.height + 4;
      ctx.fillStyle = color; ctx.fillRect(box.x, ly, tw, 20);
      ctx.fillStyle = '#fff'; ctx.fillText(label, box.x + 6, ly + 14);
    });
    ipCamRafId = requestAnimationFrame(redrawOverlay);
  };
  ipCamRafId = requestAnimationFrame(redrawOverlay);

  // Layer 2 (throttled 1200ms): capture img frame → run detection → update cache
  const runDetection = async () => {
    if (!ipCamMode) return;
    if (!ipCamDetecting) {
      ipCamDetecting = true;
      try {
        const frameSrc = await getDetectSource(); // fetches via server proxy
        if (frameSrc) {
          const result = await getInsightFace(frameSrc);
          ipCamLastDetections = result.face || [];
        }
      } catch(e) { console.warn('IP cam detection error:', e.message); }
      ipCamDetecting = false;
    }
    ipCamDetectTimer = setTimeout(runDetection, 1200); 
  };
  ipCamDetectTimer = setTimeout(runDetection, 1200);
}

async function captureFace() {
  const ready = await ensureFaceModelsLoaded();
  if (!ready) return;
  if (!ipCamMode && !refs.faceVideo.srcObject) return window.alert("Start camera first.");
  if (ipCamMode && !refs.ipCameraImg.src) return window.alert("Start IP camera first.");
  refs.faceStatusText.textContent = "Detecting face…";
  
  // Use the helper to get correct detection source
  const detectSource = await getDetectSource();
  if (!detectSource) {
    refs.faceStatusText.textContent = "❌ Could not get camera frame. Check IP camera connection.";
    return;
  }
  
  // Run detection via Python InsightFace server
  const result = await getInsightFace(detectSource);
  let detection = result.face && result.face.length > 0 ? result.face[0] : null;
  
  if (!detection) {
    refs.faceStatusText.textContent = "❌ No face detected. Keep face centered in good lighting and try again.";
    return;
  }
  latestDescriptor = detection.embedding;
  
  // Draw bounding box on the correct canvas
  const overlayCanvas = ipCamMode ? refs.ipOverlayCanvas : refs.faceCanvas;
  const ctx = overlayCanvas.getContext("2d");
  if (!ipCamMode) {
    // For local cam: refresh canvas from video
    refs.faceCanvas.width = refs.faceVideo.videoWidth || 640;
    refs.faceCanvas.height = refs.faceVideo.videoHeight || 480;
    ctx.drawImage(refs.faceVideo, 0, 0, refs.faceCanvas.width, refs.faceCanvas.height);
  } else {
    ctx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
  }
  const b = detection.box;
  const rawX = b[0], rawY = b[1], rawW = b[2], rawH = b[3];
  let boxX = rawX, boxY = rawY, boxW = rawW, boxH = rawH;

  // If using IP cam overlay, we might need to scale
  if (ipCamMode) {
    const scaleX = overlayCanvas.width / (refs.ipCameraImg.naturalWidth || overlayCanvas.width);
    const scaleY = overlayCanvas.height / (refs.ipCameraImg.naturalHeight || overlayCanvas.height);
    boxX *= scaleX; boxY *= scaleY; boxW *= scaleX; boxH *= scaleY;
  }

  ctx.strokeStyle = "#22c55e";
  ctx.lineWidth = 3;
  ctx.strokeRect(boxX, boxY, boxW, boxH);
  ctx.fillStyle = "rgba(34,197,94,0.15)";
  ctx.fillRect(boxX, boxY, boxW, boxH);
  refs.faceStatusText.textContent = "✅ Face captured! Click Mark Attendance or enroll.";
}

function descriptorSimilarity(a, b) {
  if (!a || !b || a.length !== b.length) return 0;
  let dotProduct = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  // Use raw Cosine Similarity for InsightFace (0.35 - 0.45+ is a match)
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

function findBestFaceMatch(descriptor, targetType = "all", minScore = 0.65) {
  const faceStore = getFaceStore();
  const store = getStore(); // Access live database
  
  // Filter only people who still exist in the school database
  const scoped = Object.entries(faceStore).filter(([key]) => {
    if (targetType !== "all" && !key.startsWith(`${targetType}|`)) return false;
    
    // Existence check: Ensure person is still in the active student/teacher list
    const parts = key.split("|");
    const role = parts[0];
    const name = parts[1];
    const people = role === "teachers" ? (store.teachers || []) : (store.students || []);
    return people.some(p => p.fullName === name);
  });

  if (!scoped.length) return null;
  const scored = [];
  scoped.forEach(([key, val]) => {
    const stored = val.avgDescriptor || val.descriptor;
    if (!stored || !stored.length) return;
    const score = descriptorSimilarity(descriptor, stored);
    scored.push({ key, ...val, score });
  });
  scored.sort((a, b) => b.score - a.score);
  const best = scored[0];
  if (!best || best.score < minScore) return null;
  // MARGIN CHECK: best must be significantly ahead of second-best to avoid confusion
  const secondBest = scored[1];
  if (secondBest && best.score - secondBest.score < 0.08) return null; // too ambiguous
  return best;
}

function getTopFaceMatches(descriptor, targetType = "all", limit = 3) {
  const faceStore = getFaceStore();
  const store = getStore(); // Access live database
  
  // Filter only people who still exist in the school database
  const scoped = Object.entries(faceStore).filter(([key]) => {
    if (targetType !== "all" && !key.startsWith(`${targetType}|`)) return false;
    
    // Existence check: Only show matches for people currently in the system
    const parts = key.split("|");
    const role = parts[0];
    const name = parts[1];
    const people = role === "teachers" ? (store.teachers || []) : (store.students || []);
    return people.some(p => p.fullName === name);
  });

  const scored = scoped.map(([key, val]) => {
    const stored = val.avgDescriptor || val.descriptor;
    const score = stored?.length ? descriptorSimilarity(descriptor, stored) : 0;
    return { key, name: val.name, tag: val.tag, score };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit);
}
// ── Professional Kokoro Neural Voice Engine ────────────────────────
// This engine runs high-fidelity human models directly in the browser.
class ProfessionalNeuralEngine {
  constructor() {
    this.initialized = false;
    this.loading = false;
    this.model = null;
    this.voices = {};
  }

  async init() {
    if (this.initialized || this.loading) return;
    this.loading = true;
    console.log("[NeuralAI] Loading professional Kokoro models...");
    
    try {
      // Dynamic import of the Kokoro logic to keep app light
      const { Kokoro } = await import("https://cdn.jsdelivr.net/npm/kokoro-js@1.0.0-beta.4/dist/index.js");
      this.model = await Kokoro.fromPretrained("onnx-community/Kokoro-82M-v1.0-ONNX", {
        dtype: "q8", // 8-bit quantized for professional speed
        device: "webgpu" // Try WebGPU first for movie-quality speed
      });
      this.initialized = true;
      console.log("[NeuralAI] Professional voices ready ✓");
      showToast("🎭 Professional Voices Ready!", "success");
    } catch (e) {
      console.warn("[NeuralAI] WebGPU failed, falling back to WASM/CPU:", e.message);
      try {
        const { Kokoro } = await import("https://cdn.jsdelivr.net/npm/kokoro-js@1.0.0-beta.4/dist/index.js");
        this.model = await Kokoro.fromPretrained("onnx-community/Kokoro-82M-v1.0-ONNX", {
          dtype: "q8",
          device: "wasm"
        });
        this.initialized = true;
        showToast("🎭 Professional Voices Ready (CPU Mode)", "success");
      } catch (err) {
        console.error("[NeuralAI] Professional Engine failed entirely:", err.message);
        this.loading = false;
      }
    }
  }

  async speak(text, persona) {
    if (!this.initialized) return false;
    try {
      // Map each cartoon character to the best neural voice profile
      const voiceMap = {
        "Doraemon":      "af_heart",   // Friendly, high-pitched female
        "Chhota Bheem":  "am_adam",    // Bold, heroic male
        "Shin-chan":      "af_nicole",  // Playful, energetic female
        "Motu":          "am_michael", // Jolly, round male
        "Ninja Hattori": "am_adam",    // Calm, disciplined male
        "Krishna":       "bm_george",  // Deep, wise British male
        "Mighty Raju":   "af_heart",   // Energetic superhero child
        "Oggy":          "am_michael", // Silly, dramatic male
        "Tom Cat":       "am_adam",    // Sneaky, expressive male
        "Natural":       "af_bella",   // Professional female
      };
      const voiceName = voiceMap[persona.name] || "af_bella";
      const audio = await this.model.generate(text, { voice: voiceName });
      audio.play();
      return true;
    } catch (e) {
      console.error("[NeuralAI] Speech generation failed:", e.message);
      return false;
    }
  }
}
const NeuralEngine = new ProfessionalNeuralEngine();

// ── Voicebox Local AI Engine Integration (github.com/jamiepine/voicebox) ──
class VoiceboxEngine {
  constructor() {
    this.apiUrl = "http://127.0.0.1:17493/generate";
  }

  async speak(text, persona) {
    try {
      // Voicebox uses profile_id or name. Map persona name to Voicebox profile.
      const res = await fetch(this.apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: text,
          profile_id: persona.name, // The user must name their Voicebox profiles matching these names (e.g. "Doraemon")
          language: "hi" // Output language
        })
      });

      if (!res.ok) return false;

      // Voicebox returns the generated audio file
      const blob = await res.blob();
      const audioUrl = URL.createObjectURL(blob);
      const audio = new Audio(audioUrl);

      return new Promise((resolve) => {
        audio.onended = () => {
          URL.revokeObjectURL(audioUrl);
          resolve(true);
        };
        audio.onerror = () => resolve(false);
        audio.play().catch(() => resolve(false));
      });
    } catch (e) {
      // If Voicebox is not running or unreachable, this fails instantly
      return false;
    }
  }
}
const VoiceboxAI = new VoiceboxEngine();

// ── Open Source Cartoon Voice Engine (Web Audio FX + Sound Signatures) ─────
// Generates unique, 100% original sound signatures for each character.
// These are NOT copyrighted — they are created programmatically by code.
class CharacterVoiceEngine {
  constructor() {
    this.ctx = null;
  }
  
  init() {
    if (this.ctx) return;
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
  }

  // Helper: play a single tone
  _tone(freq, duration, startTime, type = "sine", vol = 0.3) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(vol, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(startTime);
    osc.stop(startTime + duration);
  }

  // ── CHARACTER SOUND SIGNATURES (100% Original, Copyright-Free) ──

  // Doraemon: Magical "gadget pocket" chime — ascending sparkly notes
  soundDoraemon() {
    this.init();
    const t = this.ctx.currentTime;
    [523, 659, 784, 1047].forEach((f, i) => {
      this._tone(f, 0.15, t + i * 0.1, "sine", 0.25);
      this._tone(f * 2, 0.1, t + i * 0.1 + 0.05, "sine", 0.1); // sparkle
    });
    return 500; // total duration ms
  }

  // Chhota Bheem: Heroic power-up fanfare — bold, strong tones
  soundBheem() {
    this.init();
    const t = this.ctx.currentTime;
    this._tone(196, 0.2, t, "sawtooth", 0.2);       // G3 - deep start
    this._tone(262, 0.2, t + 0.2, "sawtooth", 0.25); // C4 - rise
    this._tone(330, 0.15, t + 0.4, "sawtooth", 0.3);  // E4 - power
    this._tone(392, 0.4, t + 0.55, "sawtooth", 0.35); // G4 - hero!
    return 950;
  }

  // Shin-chan: Playful bouncy "boing-boing" — mischievous child sound
  soundShinchan() {
    this.init();
    const t = this.ctx.currentTime;
    [400, 600, 400, 800].forEach((f, i) => {
      this._tone(f, 0.12, t + i * 0.12, "triangle", 0.3);
    });
    // Add a silly wobble at the end
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(300, t + 0.5);
    osc.frequency.linearRampToValueAtTime(900, t + 0.7);
    osc.frequency.linearRampToValueAtTime(300, t + 0.9);
    gain.gain.setValueAtTime(0.2, t + 0.5);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.95);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t + 0.5);
    osc.stop(t + 1.0);
    return 1000;
  }

  // Motu: Jolly tuba-like "om-pa-pa" — funny fat character sound
  soundMotu() {
    this.init();
    const t = this.ctx.currentTime;
    this._tone(130, 0.25, t, "sawtooth", 0.2);
    this._tone(165, 0.15, t + 0.3, "sawtooth", 0.25);
    this._tone(130, 0.25, t + 0.5, "sawtooth", 0.2);
    this._tone(196, 0.35, t + 0.8, "sawtooth", 0.3);
    return 1200;
  }

  // Ninja Hattori: Mysterious ninja whoosh — fast, stealthy
  soundHattori() {
    this.init();
    const t = this.ctx.currentTime;
    // Whoosh sound using noise-like frequency sweep
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(100, t);
    osc.frequency.exponentialRampToValueAtTime(2000, t + 0.3);
    osc.frequency.exponentialRampToValueAtTime(100, t + 0.5);
    gain.gain.setValueAtTime(0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.55);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.6);
    // Followed by a calm bell
    this._tone(880, 0.3, t + 0.6, "sine", 0.2);
    this._tone(1320, 0.3, t + 0.7, "sine", 0.1);
    return 1000;
  }

  // Krishna: Divine flute melody — peaceful, spiritual
  soundKrishna() {
    this.init();
    const t = this.ctx.currentTime;
    // Pentatonic flute-like melody
    [523, 587, 659, 784, 659, 784, 1047].forEach((f, i) => {
      this._tone(f, 0.2, t + i * 0.15, "sine", 0.2);
    });
    return 1100;
  }

  // Mighty Raju: Superhero power-up — ascending with explosion
  soundRaju() {
    this.init();
    const t = this.ctx.currentTime;
    [262, 330, 392, 523].forEach((f, i) => {
      this._tone(f, 0.1, t + i * 0.08, "square", 0.15);
    });
    // Explosion burst
    this._tone(100, 0.3, t + 0.35, "sawtooth", 0.3);
    this._tone(80, 0.4, t + 0.35, "square", 0.15);
    return 800;
  }

  // Oggy: Silly cat scramble — chaotic cartoon sounds
  soundOggy() {
    this.init();
    const t = this.ctx.currentTime;
    [300, 500, 250, 600, 200, 700].forEach((f, i) => {
      this._tone(f, 0.08, t + i * 0.08, "triangle", 0.2);
    });
    return 550;
  }

  // Tom Cat: Sneaky tiptoeing — plucked strings going up
  soundTom() {
    this.init();
    const t = this.ctx.currentTime;
    [220, 247, 277, 311, 349, 392].forEach((f, i) => {
      this._tone(f, 0.1, t + i * 0.12, "triangle", 0.25);
    });
    return 750;
  }

  // Play the character's signature sound, returns a Promise that resolves when done
  playSignature(characterName) {
    const soundMap = {
      "Doraemon":       () => this.soundDoraemon(),
      "Chhota Bheem":   () => this.soundBheem(),
      "Shin-chan":       () => this.soundShinchan(),
      "Motu":           () => this.soundMotu(),
      "Ninja Hattori":  () => this.soundHattori(),
      "Krishna":        () => this.soundKrishna(),
      "Mighty Raju":    () => this.soundRaju(),
      "Oggy":           () => this.soundOggy(),
      "Tom Cat":        () => this.soundTom(),
    };
    
    const fn = soundMap[characterName];
    if (!fn) return Promise.resolve();
    
    const durationMs = fn();
    return new Promise(resolve => setTimeout(resolve, durationMs));
  }


  // Apply "Doraemon" Texture: High pitch + slight robotic resonance
  applyDoraemon(utterance) {
    utterance.pitch = 1.4;
    utterance.rate = 1.0;
  }

  // Apply "Bheem" Texture: Deep, resonant, brave
  applyBheem(utterance) {
    utterance.pitch = 0.95;
    utterance.rate = 0.85;
  }

  // Apply "Shin-chan" Texture: High pitch + mischievous rhythm
  applyShinchan(utterance) {
    utterance.pitch = 1.6;
    utterance.rate = 1.1;
  }

  // Apply "Motu" Texture: Jolly, fat and happy
  applyMotu(utterance) {
    utterance.pitch = 0.85;
    utterance.rate = 0.9;
  }

  // Apply "Ninja Hattori" Texture: Calm, disciplined
  applyHattori(utterance) {
    utterance.pitch = 1.05;
    utterance.rate = 0.88;
  }

  // Apply "Krishna" Texture: Divine, wise and melodic
  applyKrishna(utterance) {
    utterance.pitch = 1.1;
    utterance.rate = 0.82;
  }

  // Apply "Mighty Raju" Texture: Superhero child - energetic
  applyRaju(utterance) {
    utterance.pitch = 1.5;
    utterance.rate = 1.05;
  }

  // Apply "Oggy" Texture: Silly, dramatic
  applyOggy(utterance) {
    utterance.pitch = 1.2;
    utterance.rate = 1.0;
  }

  // Apply "Tom" Texture: Sneaky, dramatic
  applyTom(utterance) {
    utterance.pitch = 1.15;
    utterance.rate = 0.95;
  }

  apply(name, utterance) {
    const map = {
      "Doraemon": () => this.applyDoraemon(utterance),
      "Chhota Bheem": () => this.applyBheem(utterance),
      "Shin-chan": () => this.applyShinchan(utterance),
      "Motu": () => this.applyMotu(utterance),
      "Ninja Hattori": () => this.applyHattori(utterance),
      "Krishna": () => this.applyKrishna(utterance),
      "Mighty Raju": () => this.applyRaju(utterance),
      "Oggy": () => this.applyOggy(utterance),
      "Tom Cat": () => this.applyTom(utterance),
    };
    if (map[name]) map[name]();
  }
}
const VoiceEngine = new CharacterVoiceEngine();
// ── AI Voice Persona & Motivation System ──────────────────────────
const VOICE_PERSONAS = [
  { 
    name: "Natural",      label: "Professional",    gender: "female", neuralVoice: "af_bella",
    pitch: 1.0,  rate: 0.88,
    intro: "नमस्ते!", 
    style: "as a professional school assistant",
    color: "#10b981"
  },
  { 
    name: "Doraemon",     label: "Doraemon 🐱",     gender: "female", neuralVoice: "af_heart",
    pitch: 1.35, rate: 1.0,
    intro: "उँ... ओहो! हेहे! नमस्ते दोस्त। मैं हूँ, डोरेमोन। आज तुम बहुत अच्छे लग रहे हो!", 
    style: "as Doraemon. Be kind and robotic. Mention gadgets and Nobita.",
    color: "#3b82f6"
  },
  { 
    name: "Chhota Bheem", label: "Bheem 💪",        gender: "male",   neuralVoice: "am_adam",
    pitch: 0.95, rate: 0.82,
    intro: "हा-हा-हा! जय हिन्द! मैं हूँ, ढोलकपुर का भीम। क्या तुम लड्डू खाओगे?", 
    style: "as Chhota Bheem. Be brave and strong. Talk about Laddus and courage.",
    color: "#f59e0b"
  },
  { 
    name: "Shin-chan",    label: "Shin-chan 👦",    gender: "female", neuralVoice: "af_nicole",
    pitch: 1.45, rate: 1.1,
    intro: "ओ-हो! हेहे! अरे वाह! देखो मैं आ गया। मैं हूँ, शिन-चैन। चलो मस्ती करते हैं!", 
    style: "as Shin-chan. Be naughty, playful and funny like a mischievous 5-year-old.",
    color: "#ec4899"
  },
  { 
    name: "Motu",         label: "Motu 🍕",         gender: "male",   neuralVoice: "am_michael",
    pitch: 0.85, rate: 0.88,
    intro: "हाहाहा! मैं हूँ मोटू। समोसे खाओ, खुश रहो और आगे बढ़ो!", 
    style: "as Motu from Motu Patlu. Be jolly and funny. Mention samosas and Patlu.",
    color: "#f97316"
  },
  { 
    name: "Ninja Hattori",label: "Hattori 🥷",     gender: "male",   neuralVoice: "am_adam",
    pitch: 1.05, rate: 0.88,
    intro: "Ninjutsu! मैं हूँ निंजा हत्तोरी। अनुशासन और मेहनत से सब कुछ संभव है!", 
    style: "as Ninja Hattori. Be disciplined and wise. Talk about training and honor.",
    color: "#6366f1"
  },
  { 
    name: "Krishna",      label: "Krishna 🧘",      gender: "male",   neuralVoice: "bm_george",
    pitch: 1.1,  rate: 0.82,
    intro: "राधे राधे! मैं हूँ तुम्हारा कृष्ण। ज्ञान और प्रेम से ही जीवन महान बनता है!", 
    style: "as Lord Krishna. Be wise, calm and divine. Mention wisdom and knowledge.",
    color: "#7c3aed"
  },
  { 
    name: "Mighty Raju",  label: "Mighty Raju 🦸", gender: "female", neuralVoice: "af_heart",
    pitch: 1.5,  rate: 1.05,
    intro: "अरे वाह! मैं हूँ माइटी राजू। सुपरहीरो जैसे मेहनत करो और आगे बढ़ो!", 
    style: "as Mighty Raju the superhero. Be energetic and heroic. Motivate like a superhero.",
    color: "#ef4444"
  },
  { 
    name: "Oggy",         label: "Oggy 📺",         gender: "male",   neuralVoice: "am_michael",
    pitch: 1.2,  rate: 1.0,
    intro: "ओह! नमस्ते! मैं हूँ ओगी। आज का दिन बहुत अच्छा होगा!", 
    style: "as Oggy the cat. Be silly, funny and dramatic.",
    color: "#14b8a6"
  },
  { 
    name: "Tom Cat",      label: "Tom Cat 🐈",     gender: "male",   neuralVoice: "am_adam",
    pitch: 1.15, rate: 0.95,
    intro: "हेहे! मैं हूँ टॉम। आज तुम बहुत अच्छे लग रहे हो। मेहनत करो और आगे बढ़ो!", 
    style: "as Tom from Tom and Jerry. Be dramatic and expressive.",
    color: "#64748b"
  }
];


let activePersonaIndex = 0;

// Test active voice function
window.testActiveVoice = function() {
  const p = VOICE_PERSONAS[activePersonaIndex];
  if (window.speakText) {
    window.speakText(`${p.intro} मेरी आवाज़ कैसी है?`);
  }
};

// Manual switch function
window.cyclePersona = function() {
  activePersonaIndex = (activePersonaIndex + 1) % VOICE_PERSONAS.length;
  const p = VOICE_PERSONAS[activePersonaIndex];
  
  // Update UI badge
  const badge = document.getElementById('personaBadge');
  if (badge) {
    badge.textContent = `🎭 Voice: ${p.label}`;
    badge.style.background = p.name === "Natural" ? "rgba(16,185,129,0.2)" : "rgba(245,158,11,0.2)";
    badge.style.color = p.name === "Natural" ? "#10b981" : "#f59e0b";
  }
  
  showToast(`🎭 AI Character: ${p.name}`, 'success');
  
  // Speak intro immediately so user can hear the new voice
  window.testActiveVoice();
};

// Auto-switch character timer REMOVED at user request for 100% manual control
// Characters will now only change when you click the badge in the UI.


async function getDailyMotivation(role = "student") {
  const isTeacher = role === "teacher";
  const persona = VOICE_PERSONAS[activePersonaIndex];
  
  // Local fallbacks for characters if AI fails or is unavailable
  const localFallbacks = {
    "Natural": isTeacher ? "राष्ट्र निर्माता, आपका दिन शुभ और प्रगतिशील हो!" : "ज्ञान ही शक्ति है, मन लगाकर पढ़ें और सफल बनें!",
    "Doraemon": isTeacher ? "नमस्ते! आप समाज के सबसे बड़े गैजेट हैं। आपका दिन शुभ हो!" : "नमस्ते दोस्त! खूब पढ़ो और बड़े बनो।",
    "Chhota Bheem": isTeacher ? "प्रणाम! आपकी शक्ति से ही बच्चे महान बनेंगे।" : "लड्डू खाओ और खूब पढ़ाई करो, तुम बहुत बहादुर हो!",
    "Shin-chan": isTeacher ? "नमस्ते टीचर! आज मस्ती कम और पढ़ाई ज़्यादा करेंगे।" : "हेलो दोस्त! स्कूल में मज़े करो और आगे बढ़ो!",
    "Motu": isTeacher ? "गुरुजी नमस्ते! आप सबसे बेस्ट हो!" : "समोसे खाओ और पढ़ाई करो, सब अच्छा होगा!",
    "Ninja Hattori": isTeacher ? "सेंसेई को प्रणाम! अनुशासन ही सफलता की कुंजी है।" : "निंजा की तरह मेहनत करो, सफलता ज़रूर मिलेगी!",
    "Krishna": isTeacher ? "गुरुदेव को प्रणाम! ज्ञान का दीपक जलाते रहें।" : "कर्म करो, फल की चिंता मत करो। आज का दिन शुभ हो!",
    "Mighty Raju": isTeacher ? "सुपर टीचर, आप हीरो हो!" : "सुपरहीरो बनो! मेहनत करो और दुनिया बदलो!",
    "Oggy": isTeacher ? "नमस्ते टीचर! आज का दिन बहुत मज़ेदार होगा!" : "आज का दिन बहुत अच्छा होगा, बस खुश रहो!",
    "Tom Cat": isTeacher ? "नमस्ते! आज आप सबको इंस्पायर करेंगे!" : "चालाकी से नहीं, मेहनत से आगे बढ़ो! गुड मॉर्निंग!"
  };
  const defaultMsg = localFallbacks[persona.name] || localFallbacks["Natural"];

  const rolePrompt = isTeacher 
    ? `Give a short, 1-sentence motivational morning greeting in Hindi (Devanagari) ${persona.style}. Theme: leadership and wisdom. Under 15 words.`
    : `Give a short, 1-sentence motivational greeting in Hindi (Devanagari) ${persona.style}. Theme: curiosity and dreams. Under 15 words.`;

  try {
    const res = await api("/api/ai/chat", {
      method: "POST",
      body: JSON.stringify({ prompt: rolePrompt })
    });
    
    let reply = (res.reply || "").trim();
    
    // ERROR FILTER: Detect technical glitches like "AI is unavailable"
    const errorKeywords = ["unavailable", "error", "failed", "busy", "limit", "try again"];
    const isError = errorKeywords.some(w => reply.toLowerCase().includes(w));
    
    if (!reply || isError || reply.length < 5) return defaultMsg;

    return reply.replace(/[*#_`]/g, "");
  } catch (e) {
    return defaultMsg;
  }
}

window.speakText = async function(text, shouldQueue = false) {
  if (!window.speechSynthesis) return;
  
  const persona = VOICE_PERSONAS[activePersonaIndex];

  // STEP 1: Play the character's signature sound effect first
  if (persona.name !== "Natural" && typeof VoiceEngine !== 'undefined') {
    VoiceEngine.init();
    await VoiceEngine.playSignature(persona.name);
  }

  // STEP 2: TRY VOICEBOX STUDIO API (Ultra High-Fidelity Local Engine)
  if (persona.name !== "Natural" && typeof VoiceboxAI !== 'undefined') {
    const voiceboxSuccess = await VoiceboxAI.speak(text, persona);
    if (voiceboxSuccess) return; // Voicebox handled it successfully!
  }

  // STEP 3: TRY PROFESSIONAL NEURAL ENGINE (In-Browser ONNX/Kokoro)
  if (persona.name !== "Natural") {
    if (!NeuralEngine.initialized && !NeuralEngine.loading) NeuralEngine.init();
    if (NeuralEngine.initialized) {
      const success = await NeuralEngine.speak(text, persona);
      if (success) return;
    }
  }

  // STEP 4: FALLBACK — Traditional Web Speech API with Character Texture
  if (!shouldQueue) window.speechSynthesis.cancel(); 
  
  const processedText = text.replace(/([.!।?])/g, "$1  ");
  const utter = new SpeechSynthesisUtterance(processedText);

  // Apply character voice texture
  if (typeof VoiceEngine !== 'undefined') {
    VoiceEngine.apply(persona.name, utter);
  }

  const voices = window.speechSynthesis.getVoices();
  const isHindi = /[\u0900-\u097F]/.test(text);
  const targetLang = isHindi ? "hi-IN" : "en-IN";
  const targetGender = persona.gender || "female";
  
  const preferred = 
    voices.find(v => v.lang === targetLang && v.name.toLowerCase().includes(targetGender) && (v.name.includes("Natural") || v.name.includes("Neural"))) ||
    voices.find(v => v.lang === targetLang && (v.name.includes("Natural") || v.name.includes("Neural") || v.name.includes("Online"))) ||
    voices.find(v => v.lang === targetLang && v.name.toLowerCase().includes(targetGender)) ||
    voices.find(v => v.lang === targetLang);
  
  if (preferred) {
    utter.voice = preferred;
    utter.lang = preferred.lang;
    
    const isHighQuality = preferred.name.includes("Natural") || preferred.name.includes("Neural") || preferred.name.includes("Online");
    
    if (isHighQuality) {
      const jitter = (Math.random() * 0.06) - 0.03;
      utter.pitch = (persona.pitch || 1.0) + jitter; 
      utter.rate = (persona.rate || 0.88); 
    } else {
      utter.pitch = 1.0; 
      utter.rate = 0.92;
    }
  } else {
    utter.lang = targetLang;
  }
  
  utter.volume = 1.0;
  window.speechSynthesis.speak(utter);
};

async function speakAttendanceGreeting(names = [], isTeacher = false) {
  if (!names.length) return;
  
  const persona = VOICE_PERSONAS[activePersonaIndex];
  
  // STEP 1: Instant Welcome with Character Intro
  let welcome = "";
  if (names.length === 1) {
    welcome = `${persona.intro} नमस्ते ${names[0]}, टपोवन पब्लिक स्कूल में आपका स्वागत है.`;
  } else {
    welcome = `${persona.intro} नमस्ते, आप सभी का टपोवन पब्लिक स्कूल में स्वागत है.`;
  }
  
  // Speak the welcome part IMMEDIATELY
  window.speakText(welcome, false);

  // STEP 2: Fetch AI Motivation in background
  try {
    const motivation = await getDailyMotivation(isTeacher ? "teacher" : "student");
    if (motivation) {
      window.speakText(motivation, true);
    }
  } catch (e) {
    console.warn("Background motivation fetch failed:", e.message);
  }
}

async function markFaceAttendance() {
  if (!latestDescriptor) return window.alert("Capture face first.");
  const targetType = refs.faceTargetType.value;
  const manualName = refs.faceTargetName.value.trim();
  const classDept = refs.faceClassName.value.trim();
  const status = refs.faceStatus.value;
  const faceStore = getFaceStore();
  const key = `${targetType}|${manualName || "unknown"}`;

  if (manualName) {
    faceStore[key] = { descriptor: latestDescriptor, name: manualName, tag: classDept };
    saveFaceStore(faceStore);
  }

  const best = findBestFaceMatch(latestDescriptor, targetType);
  const recognizedName = (best && best.name) || manualName;
  if (!recognizedName) return window.alert("Enter name at least once to enroll face.");

  const store = getStore();
  const matchPrefix = (best && best.key) ? best.key.split("|")[0] : (targetType === "all" ? "students" : targetType);

  if (matchPrefix === "students") {
    const student = (store.students || []).find((s) => s.fullName === recognizedName);
    // Guard: if the student was deleted from DB, refuse to mark attendance
    if (!student) {
      const failMsg = `⚠ Student "${recognizedName}" not found in database.`;
      refs.faceStatusText.textContent = failMsg;
      if (typeof showToast === "function") showToast(failMsg, "error");
      return;
    }
    const resolvedClassName = classDept || best?.tag || student?.className || "N/A";
    const today = todayStr();
    const nowTime = timeStr();
    const existing = findExistingAttendanceRecord(store, recognizedName, resolvedClassName, today);

    if (existing?.id) {
      const update = { remarks: "Face-recognized" };
      if (!existing.arrivalTime) {
        update.arrivalTime = nowTime;
        update.status = status;
      } else if (!existing.departureTime) {
        update.departureTime = nowTime;
      }
      await api(`/api/modules/attendance/${existing.id}`, { method: "PUT", body: JSON.stringify(update) });
    } else {
      const row = {
        id: getNextId(store.attendance || []),
        date: today,
        className: resolvedClassName,
        studentName: recognizedName,
        rollNo: student?.rollNo || "",
        status,
        arrivalTime: nowTime,
        departureTime: "",
        remarks: "Face-recognized"
      };
      await api("/api/modules/attendance", { method: "POST", body: JSON.stringify(row) });
    }
  } else {
    // Teacher Path
    const teacher = (store.teachers || []).find((t) => t.fullName === recognizedName);
    if (!teacher) {
        const failMsg = `⚠ Teacher "${recognizedName}" not found in database.`;
        refs.faceStatusText.textContent = failMsg;
        if (typeof showToast === "function") showToast(failMsg, "error");
        return;
    }
    const resolvedDept = classDept || best?.tag || teacher?.department || "N/A";
    const today = todayStr();
    const nowTime = timeStr();
    const existing = findExistingTeacherAttendanceRecord(store, recognizedName, resolvedDept, today);

    if (existing?.id) {
      const update = { remarks: "Face-recognized" };
      if (!existing.arrivalTime) {
        update.arrivalTime = nowTime;
        update.status = status;
      } else {
        // Update departure time every face scan as requested
        update.departureTime = nowTime;
      }
      await api(`/api/modules/teacherAttendance/${existing.id}`, { method: "PUT", body: JSON.stringify(update) });
    } else {
      const row = {
        id: getNextId(store.teacherAttendance || []),
        date: today,
        department: resolvedDept,
        teacherName: recognizedName,
        status,
        arrivalTime: nowTime,
        departureTime: "",
        remarks: "Face-recognized"
      };
      await api("/api/modules/teacherAttendance", { method: "POST", body: JSON.stringify(row) });
    }
  }
  
  await loadStore();
  const successMsg = `✅ Attendance marked for ${recognizedName}.`;
  refs.faceStatusText.textContent = successMsg;
  if (typeof showToast === 'function') showToast(successMsg, 'success');
  if (typeof addLiveLog === 'function') addLiveLog(recognizedName, best?.score || 0.9, status);

  renderAll();
  
  // Trigger Greeting with Role Check
  speakAttendanceGreeting([recognizedName], matchPrefix === "teachers");
}

function findExistingAttendanceRecord(store, studentName, className, date = todayStr()) {
  const sn = String(studentName ?? "").trim();
  const cn = String(className ?? "").trim();
  const d = String(date ?? "").trim();
  return (store.attendance || []).find((a) => {
    return String(a.date ?? "").trim() === d
      && String(a.studentName ?? "").trim() === sn
      && String(a.className ?? "").trim() === cn;
  });
}

function findExistingTeacherAttendanceRecord(store, teacherName, department, date = todayStr()) {
  const tn = String(teacherName ?? "").trim();
  const dept = String(department ?? "").trim();
  const d = String(date ?? "").trim();
  return (store.teacherAttendance || []).find((a) => {
    return String(a.date ?? "").trim() === d
      && String(a.teacherName ?? "").trim() === tn
      && String(a.department ?? "").trim() === dept;
  });
}

// Returns the correct HTMLCanvasElement for face-api detection
// For IP cam: fetches a frame via server proxy to avoid cross-origin taint
async function getDetectSource() {
  if (ipCamMode) {
    const ipUrl = (refs.ipCameraUrl?.value || '').trim();
    if (!ipUrl) return null;
    try {
      const resp = await fetch(`/api/camera-snapshot?url=${encodeURIComponent(ipUrl)}`);
      if (!resp.ok) return null;
      const blob = await resp.blob();
      const bmp = await createImageBitmap(blob);
      const tmp = document.createElement('canvas');
      tmp.width = bmp.width;
      tmp.height = bmp.height;
      tmp.getContext('2d').drawImage(bmp, 0, 0);
      return tmp;
    } catch (e) {
      console.warn('IP cam proxy fetch failed:', e.message);
      return null;
    }
  }
  return refs.faceVideo;
}

// Capture a JPEG snapshot from the current camera source
async function snapshotFromSource(w = 220, q = 0.68) {
  if (ipCamMode) {
    const src = await getDetectSource();
    if (!src) return '';
    const tmp = document.createElement('canvas');
    const ratio = src.height / src.width;
    tmp.width = w;
    tmp.height = Math.round(w * ratio);
    tmp.getContext('2d').drawImage(src, 0, 0, tmp.width, tmp.height);
    return tmp.toDataURL('image/jpeg', q);
  }
  return videoFrameToResizedDataUrl(refs.faceVideo, w, q);
}

async function autoCaptureTick() {
  if (!refs.autoCaptureToggle.checked) return;
  if (autoCaptureBusy) return;
  // Guard: need either local video stream or IP cam image
  const localReady = !ipCamMode && refs.faceVideo?.srcObject;
  const ipReady    =  ipCamMode && refs.ipCameraImg?.naturalWidth > 0;
  if (!localReady && !ipReady) return;

  try {
    const ready = await ensureFaceModelsLoaded();
    if (!ready) return;

    const targetType = "all";

    if (refs.autoBatchMultiFaceToggle?.checked) {
      await autoBatchCaptureTick();
      return;
    }

    const minConf = Math.max(0.40, Math.min(0.99, Number(refs.autoMinConfidence?.value) || 0.65));
    const stableCount = Math.max(1, Math.min(10, Number(refs.autoStableCount?.value) || 1));

    // Recognize the face from the current camera frame.
    let detection = null;
    if (ipCamMode && ipCamLastDetections && ipCamLastDetections.length > 0) {
      // Reuse cached IP cam detection to avoid GPU contention
      detection = ipCamLastDetections[0];
    } else {
      const src = await getDetectSource();
      if (!src) return;
      const result = await getInsightFace(src);
      detection = result.face && result.face.length > 0 ? result.face[0] : null;
    }

    if (!detection) return;

    const descriptor = detection.embedding;
    latestDescriptor = descriptor;

    const topMatches = getTopFaceMatches(descriptor, targetType, 3);
    const best = findBestFaceMatch(descriptor, targetType, minConf);
    const recognizedName = best?.name;
    const manualClass = (refs.faceClassName.value || "").trim();

    // Declare today and matchKey early so they are available in all early-return branches below
    const today = todayStr();
    const _earlyMatchKey = recognizedName
      ? `${recognizedName}|${manualClass || (best?.tag) || ""}|${today}`
      : null;

    if (!recognizedName || !best) {
      if (_earlyMatchKey) autoRecognitionStreakByKey[_earlyMatchKey] = 0;
      refs.faceStatusText.innerHTML = `🔍 AI: No confident match<br/>Top: ${topMatches.map((m) => `${m.name || "unknown"} (${(m.score*100).toFixed(0)}%)`).join(", ")}<br/><small style="opacity:0.6">Try enrolling more poses or improve lighting</small>`;
      return;
    }

    const store = getStore();
    let person = null;
    const matchPrefix = best.key.split("|")[0]; // "students" or "teachers"

    if (matchPrefix === "students") {
      person = (store.students || []).find((s) => s.fullName === recognizedName);
    } else {
      person = (store.teachers || []).find((t) => t.fullName === recognizedName);
    }

    // Guard: if the person was deleted from DB, skip and warn
    if (!person) {
      refs.faceStatusText.innerHTML = `⚠ Matched face: <b>${recognizedName}</b> — but ${matchPrefix.slice(0,-1)} was deleted from database. Attendance not marked.`;
      return;
    }
    const resolvedClassName = manualClass || best.tag || person?.className || person?.department || "N/A";

    // If teacher/operator entered a class, be strict: require it to match enrollment tag or student class.
    if (manualClass) {
      const enrolledClass = best.tag || person?.className || person?.department || "";
      if (String(enrolledClass) !== String(manualClass)) {
        const _classMismatchKey = `${recognizedName}|${resolvedClassName}|${today}`;
        autoRecognitionStreakByKey[_classMismatchKey] = 0;
        refs.faceStatusText.innerHTML = `⚠ AI: Face found but class/dept mismatch<br/>Matched: ${recognizedName} (${(best.score*100).toFixed(0)}%)<br/>Expected: ${enrolledClass || "N/A"} | Entered: ${manualClass}`;
        return;
      }
    }

    const matchKey = `${recognizedName}|${resolvedClassName}|${today}`;

    // Per-student streak tracking (fixes bug where streak resets when another face appears)
    if (!autoRecognitionStreakByKey[matchKey]) autoRecognitionStreakByKey[matchKey] = 0;
    autoRecognitionStreakByKey[matchKey] += 1;
    // Reset old single-student globals for compat
    autoStreakKey = matchKey;
    autoRecognitionStreak = autoRecognitionStreakByKey[matchKey];

    refs.faceStatusText.innerHTML = `🎯 AI: <b>${recognizedName}</b><br/>Confidence: ${best.score.toFixed(2)} | Streak: ${autoRecognitionStreak}/${stableCount}<br/>Top: ${topMatches.map((m) => `${m.name || "unknown"} (${m.score.toFixed(2)})`).join(", ")}`;

    // Cooldown avoids repeated updates/marks while the same face stays in camera.
    const cooldownMs = 6000;
    const now = Date.now();
    if (autoRecognitionStreak < stableCount) return;
    if (autoLastAutoMarkKey === matchKey && (now - autoLastAutoMarkAt) < cooldownMs) return;

    autoCaptureBusy = true;
    const snap = await snapshotFromSource(220, 0.68);
    const nowTime = timeStr();

    if (matchPrefix === "teachers") {
      const existing = findExistingTeacherAttendanceRecord(store, recognizedName, resolvedClassName, today);
      if (existing?.id) {
        const update = { facePhoto: snap, remarks: "Auto face-recognized" };
        if (!existing.arrivalTime) {
          update.arrivalTime = nowTime;
          update.status = refs.faceStatus.value;
        } else {
          update.departureTime = nowTime; // Update departure for teachers
        }
        await api(`/api/modules/teacherAttendance/${existing.id}`, { method: "PUT", body: JSON.stringify(update) });
        await loadStore();
        refs.faceStatusText.textContent = `Photo updated for ${recognizedName} (${resolvedClassName}).`;
        if (typeof addLiveLog === 'function') addLiveLog(recognizedName, best?.score || 0.9, refs.faceStatus.value);
        renderTable();
      } else {
        const row = {
          id: getNextId(store.teacherAttendance || []),
          date: today,
          department: resolvedClassName,
          teacherName: recognizedName,
          status: refs.faceStatus.value,
          arrivalTime: nowTime,
          departureTime: "",
          remarks: "Auto face-recognized",
          facePhoto: snap
        };
        await api("/api/modules/teacherAttendance", { method: "POST", body: JSON.stringify(row) });
        await loadStore();
        refs.faceStatusText.textContent = `Auto attendance marked for ${recognizedName}.`;
        if (typeof addLiveLog === 'function') addLiveLog(recognizedName, best?.score || 0.9, refs.faceStatus.value);
        renderTable();
      }
    } else {
      const existing = findExistingAttendanceRecord(store, recognizedName, resolvedClassName, today);
      if (existing?.id) {
        const update = { facePhoto: snap, remarks: "Auto face-recognized" };
        if (!existing.arrivalTime) {
          update.arrivalTime = nowTime;
          update.status = refs.faceStatus.value;
        } else if (!existing.departureTime) {
          update.departureTime = nowTime;
        }
        await api(`/api/modules/attendance/${existing.id}`, { method: "PUT", body: JSON.stringify(update) });
        await loadStore();
        refs.faceStatusText.textContent = `Photo updated for ${recognizedName} (${resolvedClassName}).`;
        if (typeof addLiveLog === 'function') addLiveLog(recognizedName, best?.score || 0.9, refs.faceStatus.value);
        renderTable();
      } else {
        const row = {
          id: getNextId(store.attendance || []),
          date: today,
          className: resolvedClassName,
          studentName: recognizedName,
          rollNo: person?.rollNo || "",
          status: refs.faceStatus.value,
          arrivalTime: nowTime,
          departureTime: "",
          remarks: "Auto face-recognized",
          facePhoto: snap
        };
        await api("/api/modules/attendance", { method: "POST", body: JSON.stringify(row) });
        await loadStore();
        refs.faceStatusText.textContent = `Auto attendance marked for ${recognizedName}.`;
        if (typeof addLiveLog === 'function') addLiveLog(recognizedName, best?.score || 0.9, refs.faceStatus.value);
        renderTable();
      }
    }

    autoLastAutoMarkKey = matchKey;
    autoLastAutoMarkAt = now;
    autoRecognitionStreak = 0;
    autoStreakKey = "";
    autoRecognitionStreakByKey[matchKey] = 0;
    showToast(`✅ Attendance marked: ${recognizedName}`);
    
    // Trigger Greeting with Role Check
    speakAttendanceGreeting([recognizedName], matchPrefix === "teachers");
  } catch (err) {
    refs.faceStatusText.textContent = `Auto mode error: ${err.message}`;
  } finally {
    autoCaptureBusy = false;
  }
}

async function autoBatchCaptureTick() {
  if (autoCaptureBusy) return;
  autoCaptureBusy = true;

  const minConf = Math.max(0.40, Math.min(0.99, Number(refs.autoMinConfidence?.value) || 0.65));
  const cooldownMs = 6000;
  const margin = 0.02;
  const maxMarksPerTick = 50;

  try {
    let detections = [];
    if (ipCamMode && ipCamLastDetections && ipCamLastDetections.length > 0) {
      // Reuse cached IP cam detection to avoid GPU contention
      detections = ipCamLastDetections;
    } else {
      const batchSrc = await getDetectSource();
      if (!batchSrc) { refs.faceStatusText.textContent = 'AI Batch: Camera not available'; return; }
      const result = await getInsightFace(batchSrc);
      detections = result.face || [];
    }

    if (!detections.length) {
      refs.faceStatusText.textContent = "AI Batch: No faces found";
      return;
    }

    const store = getStore();
    const today = todayStr();
    const now = Date.now();
    const nowTime = timeStr();

    const localAttendance = (store.attendance || []).slice();
    let nextId = getNextId(localAttendance);
    const localTeacherAttendance = (store.teacherAttendance || []).slice();
    let nextTeacherId = getNextId(localTeacherAttendance);
    const localStore = { ...store, attendance: localAttendance, teacherAttendance: localTeacherAttendance };

    // Avoid marking same student twice in one frame.
    const markedThisFrame = new Set();
    const marked = [];
    const skippedLowConf = [];

    const manualClass = String(refs.faceClassName?.value || "").trim();
    const status = refs.faceStatus?.value || "Present";

    for (const det of detections) {
      if (marked.length >= maxMarksPerTick) break;

      const descriptor = Array.from(det.embedding);
      const topMatches = getTopFaceMatches(descriptor, "all", 3);
      const best = findBestFaceMatch(descriptor, "all", minConf);
      const recognizedName = best?.name;
      if (!recognizedName || !best) continue;

      const secondBestScore = topMatches[1]?.score ?? 0;
      if (best.score - secondBestScore < 0.08) {
        skippedLowConf.push(recognizedName);
        continue;
      }

      let person = null;
      const matchPrefix = best.key.split("|")[0]; // "students" or "teachers"

      if (matchPrefix === "students") {
        person = (store.students || []).find((s) => s.fullName === recognizedName);
      } else {
        person = (store.teachers || []).find((t) => t.fullName === recognizedName);
      }

      // Guard: skip deleted people
      if (!person) {
        skippedLowConf.push(`${recognizedName} (deleted)`);
        continue;
      }
      const resolvedClassName = manualClass || best.tag || person?.className || person?.department || "N/A";

      // Strict class match if operator entered one.
      if (manualClass && String(best.tag || person?.className || person?.department || "") !== manualClass) continue;

      const matchKey = `${recognizedName}|${resolvedClassName}|${today}`;
      if (markedThisFrame.has(matchKey)) continue;
      markedThisFrame.add(matchKey);

      const lastAt = autoLastAutoMarkAtByKey[matchKey] || 0;
      if (now - lastAt < cooldownMs) continue;

      const snap = await snapshotFromSource(220, 0.68);

      if (matchPrefix === "teachers") {
        const existing = findExistingTeacherAttendanceRecord(localStore, recognizedName, resolvedClassName, today);
        if (existing?.id) {
          const update = { facePhoto: snap, remarks: "Auto face-recognized" };
          if (!existing.arrivalTime) {
            update.arrivalTime = nowTime;
            update.status = status;
          } else {
            update.departureTime = nowTime;
          }
          await api(`/api/modules/teacherAttendance/${existing.id}`, { method: "PUT", body: JSON.stringify(update) });
          existing.facePhoto = snap;
          existing.remarks = update.remarks;
          if (update.arrivalTime) existing.arrivalTime = update.arrivalTime;
          if (update.departureTime) existing.departureTime = update.departureTime;
          if (update.status) existing.status = update.status;
        } else {
          const row = {
            id: nextTeacherId++,
            date: today,
            department: resolvedClassName,
            teacherName: recognizedName,
            status,
            arrivalTime: nowTime,
            departureTime: "",
            remarks: "Auto face-recognized",
            facePhoto: snap
          };
          await api("/api/modules/teacherAttendance", { method: "POST", body: JSON.stringify(row) });
          localTeacherAttendance.push(row);
        }
      } else {
        const existing = findExistingAttendanceRecord(localStore, recognizedName, resolvedClassName, today);
        if (existing?.id) {
          const update = { facePhoto: snap, remarks: "Auto face-recognized" };
          if (!existing.arrivalTime) {
            update.arrivalTime = nowTime;
            update.status = status;
          } else if (!existing.departureTime) {
            update.departureTime = nowTime;
          }
          await api(`/api/modules/attendance/${existing.id}`, { method: "PUT", body: JSON.stringify(update) });
          existing.facePhoto = snap;
          existing.remarks = update.remarks;
          if (update.arrivalTime) existing.arrivalTime = update.arrivalTime;
          if (update.departureTime) existing.departureTime = update.departureTime;
          if (update.status) existing.status = update.status;
        } else {
          const row = {
            id: nextId++,
            date: today,
            className: resolvedClassName,
            studentName: recognizedName,
            rollNo: person?.rollNo || "",
            status,
            arrivalTime: nowTime,
            departureTime: "",
            remarks: "Auto face-recognized",
            facePhoto: snap
          };
          await api("/api/modules/attendance", { method: "POST", body: JSON.stringify(row) });
          localAttendance.push(row);
        }
      }

      autoLastAutoMarkAtByKey[matchKey] = now;
      marked.push(recognizedName);
    }

    if (marked.length) {
      refs.faceStatusText.textContent =
        `AI Batch: Marked/Updated ${marked.length} students. ` +
        `(First: ${marked.slice(0, 5).join(", ")}${marked.length > 5 ? "..." : ""})`;
      await loadStore();
      renderTable();
      
      // Trigger Greeting for Batch
      // If any teachers in batch, use teacher motivation, otherwise student
      const hasTeacher = marked.some(name => {
        const store = getStore();
        return (store.teachers || []).some(t => t.fullName === name);
      });
      speakAttendanceGreeting(marked, hasTeacher);
    } else {
      refs.faceStatusText.textContent =
        "AI Batch: Faces found but none passed confidence filter (check Min Conf / lighting).";
    }
  } catch (err) {
    refs.faceStatusText.textContent = `AI Batch error: ${err.message}`;
  } finally {
    autoCaptureBusy = false;
  }
}

refs.dynamicForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (currentModule === "dashboard") return;

  const submitBtn = e.target.querySelector("button[type='submit']");
  if (submitBtn) {
    if (submitBtn.disabled) return; 
    submitBtn.disabled = true;
    submitBtn.innerHTML = "⏳ Saving...";
  }

  try {
    const form = new FormData(e.target);
    const payload = {};
    const isEditingStudent = currentModule === "students" && editStudentId != null;

    // Special handling for student files (file -> resized base64 string).
    for (const field of moduleConfig[currentModule].fields) {
      if (currentModule === "students" && ["photo", "aadhar", "tc", "reportCard", "fatherAadhar", "motherAadhar"].includes(field)) {
        const file = form.get(field);
        if (file && file.size > 0) {
          const maxDim = field === "photo" ? 240 : 360;
          payload[field] = await fileToResizedDataUrl(file, maxDim, 0.85);
        } else if (!isEditingStudent) {
          payload[field] = "";
        }
      } else {
        payload[field] = (form.get(field) || "").toString().trim();
      }
    }

    // ── Fee module: capture monthly fee + selected book/dress items ──
    if (currentModule === "fees") {
      const formEl = e.target;
      const monthlyFeeContainer = formEl.querySelector("#bd-monthly-fee-input");
      const checkedFeeBoxes = Array.from(monthlyFeeContainer?.querySelectorAll("input[name=\"bd-monthly-fee-checkbox\"]:checked") || []);
      const monthlyFee = checkedFeeBoxes.reduce((sum, cb) => sum + (parseFloat(cb.value) || 0), 0);
      payload.monthlyFee = String(monthlyFee);

      payload.monthlyFeeLabel = checkedFeeBoxes.length > 0 && monthlyFee > 0
        ? checkedFeeBoxes.map(cb => cb.dataset.label || "School Fee").join(", ")
        : "";

      const FEE_LABEL_MAP = {
        "tuition fee":     "tuitionFee",
        "tuition":         "tuitionFee",
        "admission fee":   "admissionFee",
        "admission":       "admissionFee",
        "computer fee":    "computerFee",
        "computer":        "computerFee",
        "development fee": "developmentFee",
        "development":     "developmentFee",
        "lab fee":         "labFee",
        "lab":             "labFee",
        "sports fee":      "sportsFee",
        "sports":          "sportsFee",
        "library fee":     "libraryFee",
        "library":         "libraryFee",
        "exam fee":        "examFee",
        "exam":            "examFee",
        "late fee":        "lateFee",
        "late fine":       "lateFee",
        "activity fee":    "otherFee",
        "activity":        "otherFee",
      };
      
      ["tuitionFee","admissionFee","computerFee","developmentFee","labFee","sportsFee","libraryFee","examFee","lateFee","otherFee"].forEach(k => { payload[k] = ""; });
      const feeAccum = {};
      const monthContainer = formEl.querySelector("#bd-month-selector");
      const checkedMonths = Array.from(monthContainer?.querySelectorAll("input[type='checkbox']:checked") || []).map(i => i.value);
      const monthCount = Math.max(1, checkedMonths.length);
      payload.month = checkedMonths.join(", ");

      checkedFeeBoxes.forEach(cb => {
        const label = (cb.dataset.label || "").trim();
        const baseAmt = parseFloat(cb.value) || 0;
        const isMonthly = label.toLowerCase().includes("tuition") || (cb.dataset.term || "").toLowerCase().includes("monthly");
        const amt = isMonthly ? baseAmt * monthCount : baseAmt;
        const fieldKey = FEE_LABEL_MAP[label.toLowerCase()] || "otherFee";
        feeAccum[fieldKey] = (feeAccum[fieldKey] || 0) + amt;
      });
      Object.entries(feeAccum).forEach(([k, v]) => { payload[k] = String(v); });
      payload.feeTypes = checkedFeeBoxes.map(cb => cb.dataset.label || "School Fee").join(", ");

      const selectedItems = [];
      formEl.querySelectorAll(".bd-item-checkbox:checked").forEach(cb => {
        selectedItems.push({ id: cb.dataset.id, price: parseFloat(cb.dataset.price || 0) || 0 });
      });
      payload.selectedBookIds = JSON.stringify(selectedItems.map(i => i.id));

      const totalFeeInput = formEl.querySelector("[name='totalFee']");
      const balanceInput  = formEl.querySelector("[name='balance']");
      if (totalFeeInput) payload.totalFee = totalFeeInput.value || "0";
      if (balanceInput)  payload.balance  = balanceInput.value  || "0";

      const total = parseFloat(payload.totalFee) || 0;
      const paid  = parseFloat(payload.paidAmount) || 0;
      const bal   = total - paid;
      payload.balance = String(Math.max(0, bal));
      payload.status  = bal <= 0 ? "Paid" : paid > 0 ? "Partial" : "Pending";

      // ── AUTO-SPLIT LOGIC for Fees Module ──
      if (checkedMonths.length > 1) {
        const academicOrder = ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"];
        const sortedMonths = checkedMonths.slice().sort((a,b) => academicOrder.indexOf(a) - academicOrder.indexOf(b));
        let totalPaidRemaining = parseFloat(payload.paidAmount) || 0;

        for (let i = 0; i < sortedMonths.length; i++) {
          const m = sortedMonths[i];
          const rowPayload = { ...payload };
          rowPayload.month = m;
          
          let rowTotal = 0;
          const rowAccum = {};
          ["tuitionFee","admissionFee","computerFee","developmentFee","labFee","sportsFee","libraryFee","examFee","lateFee","otherFee"].forEach(k => { rowAccum[k] = 0; });

          checkedFeeBoxes.forEach(cb => {
            const label = (cb.dataset.label || "").trim();
            const baseAmt = parseFloat(cb.value) || 0;
            const isMonthly = label.toLowerCase().includes("tuition") || (cb.dataset.term || "").toLowerCase().includes("monthly");
            const fieldKey = FEE_LABEL_MAP[label.toLowerCase()] || "otherFee";
            if (isMonthly) {
              rowAccum[fieldKey] += baseAmt;
              rowTotal += baseAmt;
            } else if (i === 0) {
              rowAccum[fieldKey] += baseAmt;
              rowTotal += baseAmt;
            }
          });

          if (i > 0) {
            rowPayload.selectedBookIds = "[]";
          } else {
            const bdItems = JSON.parse(payload.selectedBookIds || "[]");
            bdItems.forEach(it => { rowTotal += (parseFloat(it.price) || 0); });
            if (appliedDueMgmtAmount > 0) {
              rowTotal += appliedDueMgmtAmount;
            }
          }

          rowPayload.totalFee = String(rowTotal);
          const rowPaid = Math.min(totalPaidRemaining, rowTotal);
          totalPaidRemaining -= rowPaid;
          rowPayload.paidAmount = String(rowPaid);
          const rowBal = rowTotal - rowPaid;
          rowPayload.balance = String(rowBal);
          rowPayload.status = rowBal <= 0 ? "Paid" : rowPaid > 0 ? "Partial" : "Pending";
          Object.entries(rowAccum).forEach(([k, v]) => { rowPayload[k] = String(v); });
          
          if (i === 0 && appliedDueMgmtAmount > 0) {
            rowPayload.dueMgmtAmount = String(appliedDueMgmtAmount);
            rowPayload.dueMgmtParticulars = appliedDueMgmtParticulars;
            rowPayload.consolidatedDueMgmtIds = JSON.stringify(appliedDueMgmtIds);
            rowPayload.consolidatedFeeIds = JSON.stringify(appliedFeeIds);
          }
          await addRecord(currentModule, rowPayload);
        }
      } else {
        if (appliedDueMgmtAmount > 0) {
          payload.dueMgmtAmount = String(appliedDueMgmtAmount);
          payload.dueMgmtParticulars = appliedDueMgmtParticulars;
          payload.consolidatedDueMgmtIds = JSON.stringify(appliedDueMgmtIds);
          payload.consolidatedFeeIds = JSON.stringify(appliedFeeIds);
        }
        await addRecord(currentModule, payload);
      }
    } else if (currentModule === "dueManagement") {
      const due = parseFloat(payload.dueAmount) || 0;
      const paid = parseFloat(payload.paidAmount) || 0;
      const bal = due - paid;
      payload.balance = String(Math.max(0, bal));
      payload.status = bal <= 0 ? "Paid" : paid > 0 ? "Partial" : "Pending";
      
      if (editRecordId != null) {
        await api(`/api/modules/${currentModule}/${editRecordId}`, { method: "PUT", body: JSON.stringify(payload) });
        editRecordId = null;
      } else {
        await addRecord(currentModule, payload);
      }
    } else if (isEditingStudent) {
      await api(`/api/modules/students/${editStudentId}`, { method: "PUT", body: JSON.stringify(payload) });
      editStudentId = null;
    } else if (editRecordId != null) {
      await api(`/api/modules/${currentModule}/${editRecordId}`, { method: "PUT", body: JSON.stringify(payload) });
      editRecordId = null;
    } else {
      await addRecord(currentModule, payload);
    }

    // ── Post-Save: Mark consolidated dues as Paid (BY DELETING THEM to keep table clean) ──
    if (currentModule === "fees" && (appliedDueMgmtIds.length > 0 || appliedFeeIds.length > 0)) {
      for (const id of appliedDueMgmtIds) {
        try { await api(`/api/modules/dueManagement/${id}`, { method: "DELETE" }); } catch (err) {}
      }
      for (const id of appliedFeeIds) {
        try { await api(`/api/modules/fees/${id}`, { method: "DELETE" }); } catch (err) {}
      }
      appliedDueMgmtAmount = 0;
      appliedDueMgmtParticulars = "";
      appliedDueMgmtIds = [];
      appliedFeeIds = [];
    }

    // Reset splitByMonth checkbox to prevent accidental splitting
    const splitByMonthCb = document.getElementById("splitByMonth");
    if (splitByMonthCb) splitByMonthCb.checked = false;

    e.target.reset();
    const bdMonthly = document.getElementById("bd-monthly-fee-input");
    if (bdMonthly) {
      bdMonthly.querySelectorAll("input[type=checkbox]").forEach(cb => cb.checked = false);
      bdMonthly.querySelectorAll("label").forEach(l => l.style.background = "#fff");
      delete bdMonthly.dataset.selectedValues;
      delete bdMonthly.dataset.selectedIds;
    }
    const bdInfo = document.getElementById("bd-fee-info");
    if (bdInfo) { bdInfo.innerHTML = ""; bdInfo.style.display = "none"; }

    await loadStore();
    renderAll();
    if (typeof showToast === "function") showToast(`${toLabel(currentModule)} record saved successfully`, "success");

  } catch (error) {
    console.error("Form submission error:", error);
    if (typeof showToast === "function") {
      showToast(`Error: ${error.message || "Failed to save record"}`, "error");
    } else {
      alert(`Error saving record: ${error.message}`);
    }
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = "➕ Add Record";
    }
  }
});

refs.searchInput.addEventListener("input", renderTable);
if (refs.classFilter) {
  refs.classFilter.addEventListener("change", renderTable);
}
refs.exportCsvBtn.addEventListener("click", exportCurrentCsv);
if(refs.importDataBtn) refs.importDataBtn.addEventListener("click", () => refs.importFile?.click());
if(refs.importFile) refs.importFile.addEventListener("change", handleImportFile);
refs.exportPdfBtn.addEventListener("click", exportCurrentPdf);

async function handleImportFile(e) {
  const file = e.target.files[0];
  if (!file) return;

  const validExts = [".csv", ".xls", ".xlsx"];
  const isValid = validExts.some(ext => file.name.toLowerCase().endsWith(ext));
  if (!isValid) {
    window.alert("Invalid file format. Please upload a .csv, .xls, or .xlsx file.");
    e.target.value = "";
    return;
  }

  try {
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data, { type: 'array', cellDates: true });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    // raw data array
    const json = XLSX.utils.sheet_to_json(worksheet, { defval: "", raw: false });
    
    if (!json.length) {
      window.alert("The uploaded file is empty.");
      e.target.value = "";
      return;
    }

    // Map rows to system fields
    const config = moduleConfig[currentModule];
    const systemFields = config.fields; // target keys
    
    // Validate that the uploaded file matches the current module
    const rawHeaders = Object.keys(json[0] || {});
    const normalizedHeaders = rawHeaders.map(h => h.toLowerCase().replace(/\s+/g, ''));
    let matchCount = 0;
    
    systemFields.forEach(field => {
      const lowerField = field.toLowerCase();
      if (rawHeaders.includes(field) || normalizedHeaders.includes(lowerField)) {
        matchCount++;
      }
    });
    
    // Require at least a decent overlap of columns (minimum 3 fields, or 50% if the module has fewer fields)
    const requiredMatches = Math.min(3, Math.floor(systemFields.length * 0.4));
    if (matchCount < requiredMatches) {
      window.alert(`Validation failed: The imported file doesn't match the ${config.title} module format.\nPlease ensure you are importing into the correct module.`);
      e.target.value = "";
      return;
    }
    
    let successCount = 0;
    
    if (!window.confirm(`Found ${json.length} records to import into ${config.title}. Proceed?`)) {
      e.target.value = "";
      return;
    }
    
    showToast("Importing records... This may take a moment.");
    
    for (const row of json) {
      const payload = {};
      const lowerRow = {};
      let validRow = false;
      
      // 1. Capture every column provided in the CSV directly to preserve all extra data safely
      for (const [k, v] of Object.entries(row)) {
        const valStr = v === null || v === undefined ? "" : String(v);
        payload[k] = valStr;
        lowerRow[k.toLowerCase().replace(/\s+/g, '')] = valStr;
        if (valStr.trim() !== "") validRow = true;
      }
      
      // 2. Cross-map against system fields to handle case mismatches or missing fields
      systemFields.forEach(field => {
        const lowerField = field.toLowerCase();
        if (payload[field] !== undefined) {
          // Already have it natively mapped under the correct exact key
        } else if (lowerRow[lowerField] !== undefined) {
          // Found it under a case-insensitive different key in the CSV
          payload[field] = lowerRow[lowerField];
        } else {
          // Initialize empty if CSV omitted it completely but system expects it
          payload[field] = "";
        }
      });

      // Fix Excel serial date numbers in date fields
      ["paymentDate", "date", "issueDate", "returnDate", "checkInDate"].forEach(df => {
        if (payload[df] && !isNaN(Number(payload[df])) && Number(payload[df]) > 10000) {
          // Excel serial date → convert to DD-MM-YYYY
          const serial = Number(payload[df]);
          const epoch = new Date((serial - 25569) * 86400 * 1000);
          const dd = String(epoch.getDate()).padStart(2, '0');
          const mm = String(epoch.getMonth() + 1).padStart(2, '0');
          const yyyy = epoch.getFullYear();
          payload[df] = `${dd}-${mm}-${yyyy}`;
        }
      });
      
      // Auto-assign status
      if (!payload.status && currentModule === "students") {
        payload.status = "Active";
      }

      // ── SPECIAL POST-PROCESS FOR FEES ──
      // Recalculate financial consistency if user provided raw paid/total data
      if (currentModule === "fees") {
        const total = parseFloat(payload.totalFee) || 0;
        const paid  = parseFloat(payload.paidAmount) || 0;
        const bal   = total - paid;
        
        // Auto-fix balance if missing or obviously wrong (0 while total/paid differ)
        if (payload.balance === "" || (parseFloat(payload.balance) === 0 && bal !== 0)) {
           payload.balance = String(Math.max(0, bal));
        }
        // Auto-fix status if missing
        if (!payload.status || payload.status.trim() === "") {
           payload.status = bal <= 0 ? "Paid" : paid > 0 ? "Partial" : "Pending";
        }
        // If payment method is missing but money was paid, default to Cash
        if (!payload.paymentMethod && paid > 0) {
          payload.paymentMethod = "Cash";
          payload.cashAmount = String(paid);
          payload.onlineAmount = "0";
        }
      }
      
      // Submit row
      if (validRow) {
        await addRecord(currentModule, payload);
        successCount++;
      }
    }
    
    await loadStore();
    renderAll();
    window.alert(`Successfully imported ${successCount} records.`);
  } catch (err) {
    console.error(err);
    window.alert("Error importing file: " + err.message);
  } finally {
    e.target.value = ""; // Reset input
  }
}

refs.printDocBtn.addEventListener("click", printDocumentByModule);

// 4-in-1 Print Logic
if (refs.print4in1Btn) {
  refs.print4in1Btn.addEventListener("click", openPrint4in1Modal);
}
if (refs.print4in1CloseBtn) {
  refs.print4in1CloseBtn.addEventListener("click", closePrint4in1Modal);
}
if (refs.executePrint4in1Btn) {
  refs.executePrint4in1Btn.addEventListener("click", executePrint4in1);
}
const executePrint4in1SlipBtn = document.getElementById("executePrint4in1SlipBtn");
if (executePrint4in1SlipBtn) {
  executePrint4in1SlipBtn.addEventListener("click", executePrint4in1Slip);
}

function openPrint4in1Modal() {
  if (typeof window.loadBD === "function") window.loadBD();
  const store = getStore();
  const fees = store.fees || [];
  // Sort fees by ID descending so newest are on top
  const sortedFees = [...fees].sort((a,b) => (b.id||0) - (a.id||0));
  const optionsHtml = `<option value="">Select Receipt</option>` + sortedFees.map(f =>
    `<option value="${f.id}">${f.studentName || 'Unknown'} - Term ${f.term || '-'} (RCP-${f.id})</option>`
  ).join("");

  [refs.box1Select, refs.box2Select, refs.box3Select, refs.box4Select].forEach(sel => {
    if (sel) sel.innerHTML = optionsHtml;
  });

  if (refs.print4in1Backdrop && refs.print4in1Modal) {
    refs.print4in1Backdrop.classList.remove("hidden");
    refs.print4in1Modal.classList.remove("hidden");
    document.body?.classList?.add("no-scroll");
  }
}

function closePrint4in1Modal() {
  if (refs.print4in1Backdrop && refs.print4in1Modal) {
    refs.print4in1Backdrop.classList.add("hidden");
    refs.print4in1Modal.classList.add("hidden");
    document.body?.classList?.remove("no-scroll");
  }
}

async function executePrint4in1() {
  if (typeof window.loadBD === "function") await window.loadBD();
  const store = getStore();
  const fees = store.fees || [];
  const getHtml = (idStr) => {
    if (!idStr) return "<div></div>";
    const f = fees.find(x => String(x.id) === String(idStr));
    if (!f) return "Receipt not found";

    // Backfill missing data from student store if needed
    if (!f.admissionNo || !f.fatherName) {
      const student = (store.students || []).find(s => s.fullName === f.studentName);
      if (student) {
        if (!f.admissionNo) f.admissionNo = student.admissionNo || "";
        if (!f.fatherName) f.fatherName = student.parentName || "";
      }
    }
    return buildSingleFeeHtmlForGrid(f);
  };

  const id1 = refs.box1Select?.value;
  const id2 = refs.box2Select?.value;
  const id3 = refs.box3Select?.value;
  const id4 = refs.box4Select?.value;

  const html = `<!doctype html>
  <html><head><title>4-in-1 Receipts</title><style>
    @media print {
      @page { size: A4; margin: 15mm; }
      body { margin: 0; padding: 0; }
    }
    body { font-family: Arial, sans-serif; margin: 0; padding: 0; box-sizing: border-box; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr; width: 180mm; height: 267mm; gap: 6mm; margin: 0 auto; box-sizing: border-box; }
    .quadrant { height: 100%; width: 100%; box-sizing: border-box; overflow: hidden; page-break-inside: avoid; }
  </style></head><body>
    <div class="grid">
      <div class="quadrant">${getHtml(id1)}</div>
      <div class="quadrant">${getHtml(id2)}</div>
      <div class="quadrant">${getHtml(id3)}</div>
      <div class="quadrant">${getHtml(id4)}</div>
    </div>
    <script>
      window.onload = function() { setTimeout(function(){ window.print(); window.close(); }, 400); };
    </script>
  </body></html>`;

  const w = window.open("", "_blank");
  if (!w) return window.alert("Popup blocked.");
  w.document.open();
  w.document.write(html);
  w.document.close();
  closePrint4in1Modal();
}

async function executePrint4in1Slip() {
  if (typeof window.loadBD === "function") await window.loadBD();
  const store = getStore();
  const fees = store.fees || [];
  const getHtml = (idStr) => {
    if (!idStr) return "<div></div>";
    const f = fees.find(x => String(x.id) === String(idStr));
    if (!f) return "Slip not found";

    // Backfill missing data from student store if needed
    if (!f.admissionNo || !f.fatherName) {
      const student = (store.students || []).find(s => s.fullName === f.studentName);
      if (student) {
        if (!f.admissionNo) f.admissionNo = student.admissionNo || "";
        if (!f.fatherName) f.fatherName = student.parentName || "";
      }
    }
    return buildSingleSlipHtmlForGrid(f);
  };

  const id1 = refs.box1Select?.value;
  const id2 = refs.box2Select?.value;
  const id3 = refs.box3Select?.value;
  const id4 = refs.box4Select?.value;

  const html = `<!doctype html>
  <html><head><title>4-in-1 Slips</title><style>
    @media print {
      @page { size: A4; margin: 15mm; }
      body { margin: 0; padding: 0; }
    }
    body { font-family: Arial, sans-serif; margin: 0; padding: 0; box-sizing: border-box; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr; width: 180mm; height: 267mm; gap: 6mm; margin: 0 auto; box-sizing: border-box; }
    .quadrant { height: 100%; width: 100%; box-sizing: border-box; overflow: hidden; page-break-inside: avoid; }
  </style></head><body>
    <div class="grid">
      <div class="quadrant">${getHtml(id1)}</div>
      <div class="quadrant">${getHtml(id2)}</div>
      <div class="quadrant">${getHtml(id3)}</div>
      <div class="quadrant">${getHtml(id4)}</div>
    </div>
    <script>
      window.onload = function() { setTimeout(function(){ window.print(); window.close(); }, 400); };
    </script>
  </body></html>`;

  const w = window.open("", "_blank");
  if (!w) return window.alert("Popup blocked.");
  w.document.open();
  w.document.write(html);
  w.document.close();
  closePrint4in1Modal();
}

function buildSingleSlipHtmlForGrid(origF) {
  const f = window.getConsolidatedFeeRecord(origF);
  const schoolName = "Tapowan Public School";
  const slipNo = "FS-" + (f.id || Date.now());
  const printDate = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  const totalFee   = parseFloat(f.totalFee) || 0;
  const paidAmount = parseFloat(f.paidAmount) || 0;
  const balance    = parseFloat(f.balance) || Math.max(0, totalFee - paidAmount);
  const statusColor = String(f.status).toLowerCase() === "paid" ? "#16a34a" : String(f.status).toLowerCase() === "partial" ? "#d97706" : "#dc2626";
  const statusBg = String(f.status).toLowerCase() === "paid" ? "#dcfce7" : String(f.status).toLowerCase() === "partial" ? "#fef3c7" : "#fee2e2";

  let feeRows = "";
  let hasSlipIndividual = false;
  const SLIP_FEE_TYPES = [
    { key: "tuitionFee",     label: "Tuition Fee",     icon: "📚" },
    { key: "admissionFee",   label: "Admission Fee",   icon: "🎓" },
    { key: "computerFee",    label: "Computer Fee",    icon: "💻" },
    { key: "developmentFee", label: "Development Fee", icon: "🏗️" },
    { key: "labFee",         label: "Lab Fee",         icon: "🔬" },
    { key: "sportsFee",      label: "Sports Fee",      icon: "⚽" },
    { key: "libraryFee",     label: "Library Fee",     icon: "📖" },
    { key: "examFee",        label: "Exam Fee",        icon: "📝" },
    { key: "lateFee",        label: "Late Fee",        icon: "⏰" },
    { key: "otherFee",       label: "Other Fee",       icon: "➕" }
  ];
  SLIP_FEE_TYPES.forEach(({ key, label, icon }, idx) => {
    const amt = parseFloat(f[key]) || 0;
    if (amt > 0) {
      hasSlipIndividual = true;
      const bg = idx % 2 === 0 ? "#f9fafb" : "#fff";
      const isMonthly = key === "tuitionFee" || label.toLowerCase().includes("tuition") || label.toLowerCase().includes("monthly");
      const mSfx = (f.month && isMonthly) ? ` (${f.month})` : "";
      feeRows += `<tr style="background:${bg};">
        <td style="padding:4px 6px;border-bottom:1px solid #e5e7eb;font-size:10px;color:#374151;">${icon} ${label}${mSfx}</td>
        <td style="padding:4px 6px;border-bottom:1px solid #e5e7eb;text-align:right;font-size:10px;font-weight:600;color:#111827;">₹ ${amt.toLocaleString("en-IN")}</td>
      </tr>`;
    }
  });

  // ── Calculate Books & Dress total first ──
  let itemsTotal = 0;
  let itemsRows = "";
  try {
    const ids = JSON.parse(f.selectedBookIds || "[]");
    if (ids.length) {
      const allBDItems = getStore().booksAndDress || [];
      ids.map(id => allBDItems.find(r => String(r.id) === String(id)))
         .filter(Boolean)
         .sort((a,b) => (a.itemType||"").localeCompare(b.itemType||"") || (a.itemName||"").localeCompare(b.itemName||""))
         .forEach((item, idx) => {
          const price = parseFloat(item.price) || 0;
          itemsTotal += price;
          const bg = idx % 2 === 0 ? "#f0f4ff" : "#fff";
          itemsRows += `<tr style="background:${bg};"><td style="padding:4px 6px;border-bottom:1px solid #e5e7eb;font-size:10px;color:#374151;">${item.itemType === "Book" ? "📚" : "👕"} ${item.itemName}</td>
            <td style="padding:4px 6px;border-bottom:1px solid #e5e7eb;text-align:right;font-size:10px;font-weight:600;">₹ ${price.toLocaleString("en-IN")}</td></tr>`;
        });
    }
  } catch(e) {}



  if (!hasSlipIndividual) {
    const labels = (f.feeTypes || f.monthlyFeeLabel || "").trim();
    const totalMonthly = parseFloat(f.monthlyFee) || parseFloat(f.totalFee) || 0;
    if (labels && totalMonthly > 0) {
      const parts = labels.split(",").map(s => s.trim()).filter(Boolean);
      if (parts.length > 1) {
        const perPart = totalMonthly / parts.length;
        parts.forEach((part, idx) => {
          const bg = idx % 2 === 0 ? "#f9fafb" : "#fff";
          feeRows += `<tr style="background:${bg};">
            <td style="padding:4px 6px;border-bottom:1px solid #e5e7eb;font-size:10px;color:#374151;">💳 ${part}</td>
            <td style="padding:4px 6px;border-bottom:1px solid #e5e7eb;text-align:right;font-size:10px;font-weight:600;color:#111827;">₹ ${perPart.toLocaleString("en-IN")}</td>
          </tr>`;
        });
      } else {
        feeRows += `<tr style="background:#f9fafb;">
          <td style="padding:4px 6px;border-bottom:1px solid #e5e7eb;font-size:10px;color:#374151;">💳 ${labels}</td>
          <td style="padding:4px 6px;border-bottom:1px solid #e5e7eb;text-align:right;font-size:10px;font-weight:600;color:#111827;">₹ ${totalMonthly.toLocaleString("en-IN")}</td>
        </tr>`;
      }
    }
  }

  // Combine fee rows with items rows
  feeRows += itemsRows;

  // Add Due Management row if exists
  const dueAmt = parseFloat(f.dueMgmtAmount) || 0;
  if (dueAmt > 0) {
    const particulars = f.dueMgmtParticulars || "Outstanding Dues";
    feeRows += `<tr style="background:#fff1f2;">
      <td style="padding:4px 6px;border-bottom:1px solid #e5e7eb;font-size:10px;color:#991b1b;font-weight:700;">🔖 ${particulars}</td>
      <td style="padding:4px 6px;border-bottom:1px solid #e5e7eb;text-align:right;font-size:10px;font-weight:900;color:#991b1b;">₹ ${dueAmt.toLocaleString("en-IN")}</td>
    </tr>`;
  }


  return `
    <div style="height:100%;display:flex;flex-direction:column;font-family:Arial,sans-serif;font-size:11px;border:1.5px solid #1e3a8a;border-radius:6px;box-sizing:border-box;">
      <div style="border-bottom:2px solid #1e3a8a;padding:12px 5px;text-align:center;">
        <div style="display:flex;align-items:center;justify-content:center;gap:8px;"><img src="logo.png" style="height:36px;object-fit:contain;" alt="Logo" /><div style="font-size:14px;font-weight:900;color:#1e3a8a;letter-spacing:0.5px;text-transform:uppercase;">${schoolName}</div></div>
        <div style="font-size:10px;color:#1e3a8a;margin-top:1px;font-weight:700;">Prem Nagar Tapin North, Ramgarh(JH)</div>
        <div style="margin-top:5px;display:inline-block;background:#1e3a8a;color:#fff;padding:4px 14px;font-size:10px;font-weight:700;text-transform:uppercase;">FEE SLIP</div>
      </div>
      <div style="display:flex;justify-content:space-between;padding:3px 6px;background:#eef2ff;border-bottom:1px solid #c7d2fe;font-size:9px;color:#1e3a8a;">
        <span><strong>No:</strong> ${slipNo}</span>
        <span><strong>Term:</strong> ${f.term || "-"}</span>
        <span><strong>Date:</strong> ${printDate}</span>
      </div>
      <div style="padding:5px 8px;border-bottom:1px solid #e5e7eb;">
        <table style="width:100%;border-collapse:collapse;font-size:11px;">
          <tr>
            <td style="color:#000000;width:25%;padding:2px 0;font-weight:700;">Name</td>
            <td style="font-weight:900;color:#000000;padding:2px 0;">${f.studentName || "-"}</td>
            <td style="color:#000000;width:15%;padding:2px 0 2px 6px;font-weight:700;">Adm.No</td>
            <td style="font-weight:900;color:#000000;padding:2px 0;">${f.admissionNo || "-"}</td>
          </tr>
          <tr>
            <td style="color:#000000;padding:2px 0;font-weight:700;">Father</td>
            <td style="font-weight:900;color:#000000;padding:2px 0;">${f.fatherName || "-"}</td>
            <td style="color:#000000;padding:2px 0 2px 6px;font-weight:700;">Class</td>
            <td style="font-weight:900;color:#000000;padding:2px 0;">${f.className || "-"}</td>
          </tr>
          <tr>
            <td style="color:#000000;padding:2px 0;font-weight:700;">Roll</td>
            <td style="font-weight:900;color:#000000;padding:2px 0;">${f.rollNo || "-"}</td>
            <td style="color:#000000;padding:2px 0 2px 6px;font-weight:700;">Method</td>
            <td style="font-weight:900;color:#000000;padding:2px 0;">${f.paymentMethod || "-"}</td>
          </tr>
          <tr>
            <td style="color:#000000;padding:2px 0;font-weight:700;">Status</td>
            <td colspan="3" style="padding:2px 0;"><span style="background:${statusBg};color:${statusColor};font-weight:900;padding:1px 6px;border-radius:3px;font-size:9px;border:1px solid ${statusColor};">${f.status || "Pending"}</span></td>
          </tr>
        </table>
      </div>
      <div style="padding:4px 6px;border-bottom:1px solid #e5e7eb;flex:1;overflow-y:auto;">
        <div style="font-size:9px;font-weight:900;color:#000000;text-transform:uppercase;margin-bottom:2px;">Fee Details</div>
        <table style="width:100%;border-collapse:collapse;">
          <thead>
            <tr style="background:#1e3a8a;color:#fff;">
              <th style="padding:4px 6px;text-align:left;font-size:10px;font-weight:700;">Description</th>
              <th style="padding:4px 6px;text-align:right;font-size:10px;font-weight:700;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${feeRows || `<tr><td colspan="2" style="padding:4px;color:#000000;text-align:center;font-size:10px;font-weight:700;">No details</td></tr>`}
          </tbody>
        </table>
      </div>
       <div style="padding:4px 6px;background:#f8fafc;border-top:1px solid #e2e8f0;flex-shrink:0;display:flex;align-items:center;gap:10px;">
          <!-- QR Code Column -->
          <div style="width:52px;height:52px;background:#fff;padding:2px;display:flex;align-items:center;justify-content:center;border:1px solid #e2e8f0;">
            <img src="qr.png" style="width:100%;height:100%;object-fit:contain;" alt="Payment QR" />
          </div>
          <!-- Totals Column -->
          <div style="flex:1;">
            <div style="display:flex;justify-content:space-between;margin-bottom:2px;">
              <span style="color:#000000;font-weight:700;">Total Fee</span>
              <span style="font-weight:900;color:#000000;">₹ ${totalFee.toLocaleString("en-IN")}</span>
            </div>
            <div style="display:flex;justify-content:space-between;margin-bottom:2px;">
              <span style="color:#000000;font-weight:700;">Paid</span>
              <span style="font-weight:900;color:#16a34a;">₹ ${paidAmount.toLocaleString("en-IN")}</span>
            </div>
             <div style="display:flex;justify-content:space-between;">
              <span style="color:#000000;font-weight:700;">Balance</span>
              <span style="font-weight:900;color:#dc2626;">₹ ${balance.toLocaleString("en-IN")}</span>
            </div>
          </div>
        </div>
        <div style="padding:4px 6px 2px;display:flex;justify-content:space-between;font-size:9px;color:#000000;margin-top:auto">
          <div style="text-align:center;width:45%;"><div style="border-top:1px solid #000000;margin-top:12px;padding-top:2px;font-weight:700;">Parent</div></div>
          <div style="text-align:center;width:45%;"><div style="border-top:1px solid #000000;margin-top:12px;padding-top:2px;font-weight:700;">Cashier</div></div>
        </div>
    </div>`;
}

function buildSingleFeeHtmlForGrid(origF) {
  const f = window.getConsolidatedFeeRecord(origF);
  const schoolName = "Tapowan Public School";
  const receiptNo = "RCP-" + (f.id || Date.now());
  const printDate = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  const totalFee = parseFloat(f.totalFee) || 0;
  const paidAmount = parseFloat(f.paidAmount) || 0;
  const balance = parseFloat(f.balance) || (totalFee - paidAmount);
  const statusColor = String(f.status).toLowerCase() === "paid" ? "#16a34a" : String(f.status).toLowerCase() === "partial" ? "#d97706" : "#dc2626";

  const FEE_TYPE_KEYS = [
    { key: "tuitionFee", label: "Tuition" },
    { key: "admissionFee", label: "Admission" },
    { key: "computerFee", label: "Computer" },
    { key: "developmentFee", label: "Develop" },
    { key: "labFee", label: "Lab" },
    { key: "sportsFee", label: "Sports" },
    { key: "libraryFee", label: "Library" },
    { key: "examFee", label: "Exam" },
    { key: "lateFee", label: "Late Fee" },
    { key: "otherFee", label: "Other" }
  ];
  let feeBreakdown = "";
  let hasBrk = false;
  FEE_TYPE_KEYS.forEach(({ key, label }) => {
    const amt = parseFloat(f[key]) || 0;
    if (amt > 0) {
      hasBrk = true;
      const isMonthly = key === "tuitionFee" || label.toLowerCase().includes("tuition") || label.toLowerCase().includes("monthly");
      const mSfx = (f.month && isMonthly) ? ` (${f.month})` : "";
      feeBreakdown += `<div style="display:flex;justify-content:space-between;border-bottom:1px dashed #e2e8f0;padding:3px 0;"><span>${label}${mSfx}</span><strong>₹${amt.toLocaleString("en-IN")}</strong></div>`;
    }
  });
  if (!hasBrk) {
    const labels = (f.feeTypes || f.monthlyFeeLabel || "").trim();
    if (labels) feeBreakdown += `<div style="font-size:11px;color:#64748b;margin-bottom:4px;line-height:1.4;">Types: ${labels}</div>`;
  }

  // ── Add Books & Dress items breakdown ──
  try {
    const ids = JSON.parse(f.selectedBookIds || "[]");
    if (ids.length) {
      const allBDItems = getStore().booksAndDress || [];
      ids.map(id => allBDItems.find(r => String(r.id) === String(id)))
         .filter(Boolean)
         .sort((a,b) => (a.itemType||"").localeCompare(b.itemType||"") || (a.itemName||"").localeCompare(b.itemName||""))
         .forEach(item => {
        const p = parseFloat(item.price) || 0;
        feeBreakdown += `<div style="display:flex;justify-content:space-between;border-bottom:1px dashed #e2e8f0;padding:3px 0;color:#1e40af;">
          <span>${item.itemType === "Book" ? "📚" : "👕"} ${item.itemName}</span>
          <strong>₹${p.toLocaleString("en-IN")}</strong>
        </div>`;
        });
    }
  } catch(e) {}

  // ── ADD: Due Management record row for A4 template ──
  const dueAmt = parseFloat(f.dueMgmtAmount) || 0;
  if (dueAmt > 0) {
    const particulars = f.dueMgmtParticulars || "Outstanding Dues";
    feeBreakdown += `<div style="display:flex;justify-content:space-between;border-bottom:2px solid #fff1f2;background:#fff1f2;padding:4px 6px;margin:2px 0;border-radius:4px;color:#991b1b;">
      <span>🔖 ${particulars}</span>
      <strong>₹${dueAmt.toLocaleString("en-IN")}</strong>
    </div>`;
  }

  return `
    <div style="font-family:Arial,sans-serif;border:2px solid #1e3a8a;border-radius:10px;overflow:hidden;font-size:12px;display:flex;flex-direction:column;height:100%;box-sizing:border-box;">
      <div style="background:#1e3a8a;color:#fff;padding:15px;text-align:center;flex-shrink:0;">
        <div style="display:flex;align-items:center;justify-content:center;gap:10px;"><img src="logo.png" style="height:32px;object-fit:contain;" alt="Logo" /><div style="font-size:18px;font-weight:900;letter-spacing:1px;">${schoolName}</div></div>
        <div style="font-size:11px;opacity:1;margin-top:4px;font-weight:600;letter-spacing:0.3px;">Prem Nagar Tapin North, Ramgarh(JH)</div>
        <div style="font-size:11px;opacity:0.9;margin-top:4px;">Fee Payment Receipt</div>
      </div>
      <div style="display:flex;justify-content:space-between;padding:8px 12px;background:#f0f4ff;border-bottom:1px solid #c7d2fe;font-size:12px;color:#1e3a8a;flex-shrink:0;">
        <div><strong>Rec:</strong> ${receiptNo}</div>
        <div><strong>Date:</strong> ${printDate}</div>
      </div>
      <div style="padding:12px;flex-grow:1;display:flex;flex-direction:column;border-bottom:1px solid #e2e8f0;overflow:hidden;">
        <div style="display:grid;grid-template-columns:auto 1fr;gap:4px 10px;margin-bottom:10px;">
          <span style="color:#64748b;">Adm.No</span>
          <span style="font-weight:700;text-align:right;">${f.admissionNo || "-"}</span>
          <span style="color:#64748b;">Student</span>
          <span style="font-weight:700;text-align:right;">${f.studentName || "-"}</span>
          <span style="color:#64748b;">Father</span>
          <span style="font-weight:600;text-align:right;">${f.fatherName || "-"}</span>
          <span style="color:#64748b;">Class/Roll</span>
          <span style="font-weight:600;text-align:right;">${f.className || "-"} (${f.rollNo || "-"})</span>
          <span style="color:#64748b;">Term</span>
          <span style="text-align:right;">${f.term || "-"}</span>
        </div>
        <div style="font-weight:700;color:#1e3a8a;font-size:13px;border-bottom:1px solid #cbd5e1;padding-bottom:2px;margin-top:auto;">Summary</div>
        <div style="margin-top:6px;overflow-y:auto;flex-grow:1;">${feeBreakdown}</div>
      </div>
      <div style="padding:10px 12px;background:#f8fafc;flex-shrink:0;">
        <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
          <span style="color:#475569;">Total Fee</span>
          <span style="font-weight:600;">₹ ${totalFee.toLocaleString("en-IN")}</span>
        </div>
        <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
          <span style="color:#475569;">Paid</span>
          <span style="font-weight:600;color:#16a34a;">₹ ${paidAmount.toLocaleString("en-IN")}</span>
        </div>
        <div style="display:flex;justify-content:space-between;background:#fef2f2;padding:2px 4px;margin:0 -4px;border-radius:4px;">
          <span style="color:#475569;">Due</span>
          <span style="font-weight:700;color:#dc2626;">₹ ${balance.toLocaleString("en-IN")}</span>
        </div>
      </div>
      <div style="padding:8px 12px;display:flex;justify-content:space-between;align-items:center;border-top:1px solid #e2e8f0;flex-shrink:0;background:#fff;">
        <div style="font-size:9px;color:#64748b;max-width:60%;overflow:hidden;text-overflow:ellipsis;">
          ${f.paymentMethod || "N/A"}
          ${f.paymentMethod === "Online + Cash" ? '<div style="font-size:8px;">O: ₹' + (parseFloat(f.onlineAmount)||0).toLocaleString("en-IN") + ' | C: ₹' + (parseFloat(f.cashAmount)||0).toLocaleString("en-IN") + '</div>' : ""}
        </div>
        <div style="background:${statusColor};color:#fff;padding:4px 14px;border-radius:12px;font-size:12px;font-weight:700;">${f.status || "Pending"}</div>
      </div>
    </div>`;
}

refs.loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const submitBtn = e.target.querySelector("button[type='submit']");
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = "⏳ Logging in...";
  }

  const form = new FormData(e.target);
  try {
    const user = await login(String(form.get("username")).trim(), String(form.get("password")).trim());
    applyAuthUI(user);
    refs.authSubtitle.textContent = "Sign in to continue";
    await loadStore();
    await syncFaceEmbeddingsFromServer();
    renderAll();
    
    // Hide auth overlay and landing page on success
    const authOverlay = document.getElementById("authOverlay");
    if (authOverlay) authOverlay.classList.add("hidden");
    const landingPage = document.getElementById("landingPage");
    if (landingPage) landingPage.classList.add("hidden");
  } catch (err) {
    const msg = String(err?.message || "Login failed");
    refs.authSubtitle.textContent = msg;
    window.alert(msg);
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = "Login";
    }
  }
});

refs.signupForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const submitBtn = e.target.querySelector("button[type='submit']");
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = "⏳ Creating Account...";
  }

  const form = new FormData(e.target);
  try {
    const user = await signup({
      fullName: String(form.get("fullName")).trim(),
      admissionNo: String(form.get("admissionNo")).trim(),
      username: String(form.get("username")).trim(),
      email: String(form.get("email")).trim(),
      password: String(form.get("password"))
    });
    applyAuthUI(user);
    await loadStore();
    renderAll();
  } catch (err) {
    window.alert(err.message);
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = "Create Account";
    }
  }
});

refs.showLoginBtn.addEventListener("click", () => setAuthMode("login"));
refs.showSignupBtn.addEventListener("click", () => setAuthMode("signup"));

refs.mobileMenuBtn?.addEventListener("click", () => {
  const opening = !refs.sidebar?.classList.contains("mobile-open");
  setMobileSidebarOpen(opening);
});

refs.bottomNavMoreBtn?.addEventListener("click", () => {
  const opening = !refs.sidebar?.classList.contains("mobile-open");
  setMobileSidebarOpen(opening);
});

document.querySelectorAll(".bottom-nav .nav-item[data-target]").forEach(btn => {
  btn.addEventListener("click", () => {
    switchModule(btn.dataset.target);
  });
});

refs.mobileSidebarBackdrop?.addEventListener("click", () => {
  setMobileSidebarOpen(false);
});

window.addEventListener("resize", () => {
  if (!isMobileLayout()) setMobileSidebarOpen(false);
});

refs.logoutBtn.addEventListener("click", async () => {
  await logout();
  applyAuthUI(null);
  refs.tableBody.innerHTML = "";
  refs.tableHead.innerHTML = "";
  refs.statsCards.innerHTML = "";
  refs.dynamicForm.innerHTML = "";
});

// Reset data — Admin only (Deleted unconditionally)
const resetDataBtnEl = document.getElementById("resetDataBtn");
if (resetDataBtnEl) {
  resetDataBtnEl.remove();
}

refs.startCameraBtn.addEventListener("click", startCamera);
refs.captureFaceBtn.addEventListener("click", captureFace);
refs.markFaceAttendanceBtn.addEventListener("click", () => markFaceAttendance().catch((e) => window.alert(e.message)));

refs.enrollFaceBtn?.addEventListener("click", async () => {
  try {
    const selectedName = refs.faceEnrollStudentSelect?.value;
    if (!selectedName) return window.alert("Select a person first.");

    const store = getStore();
    const isTeachers = currentModule === "teachers";
    const person = isTeachers 
      ? (store.teachers || []).find((t) => t.fullName === selectedName)
      : (store.students || []).find((s) => s.fullName === selectedName);

    if (!person) return window.alert("Person not found in database.");

    // Ensure camera stream exists.
    if (!refs.faceVideo?.srcObject) await startCamera();

    // Capture current face embedding.
    await captureFace();
    if (!latestDescriptor) return window.alert("Could not capture face. Try again.");

    const targetType = isTeachers ? "teachers" : "students";
    const tag = isTeachers ? (person.department || "") : (person.className || "");

    // Store embedding in localStorage (fast local lookup)
    const faceStore = getFaceStore();
    const key = `${targetType}|${selectedName}`;
    faceStore[key] = { descriptor: latestDescriptor, name: selectedName, tag };
    saveFaceStore(faceStore);

    // Also persist to server DB so enrollments survive browser clears
    try {
      await api("/api/modules/faceEmbeddings", {
        method: "POST",
        body: JSON.stringify({
          targetType,
          name: selectedName,
          tag,
          descriptorJson: JSON.stringify(latestDescriptor)
        })
      });
    } catch (e) {
      console.warn("Could not persist face embedding to server:", e.message);
    }

    // Optional: keep inputs in sync (useful if you switch to Attendance module).
    if (refs.faceTargetName) refs.faceTargetName.value = selectedName;
    if (refs.faceClassName) refs.faceClassName.value = tag;

    refs.faceStatusText.textContent = `Face enrolled for ${selectedName}.`;
  } catch (err) {
    window.alert(err.message || String(err));
  }
});

refs.autoCaptureToggle.addEventListener("change", async () => {
  if (!refs.autoCaptureToggle.checked) {
    if (autoCaptureTimer) clearInterval(autoCaptureTimer);
    autoCaptureTimer = null;
    autoRecognitionStreakByKey = {};
    autoLastAutoMarkAtByKey = {};
    return;
  }
  // Auto mode should run on unified "all" target type.
  refs.faceTargetType.value = "all";
  refs.faceStatusText.textContent = "Auto mode enabled. Recognizing Students & Teachers simultaneously.";
  renderAll();
  try {
    if (!refs.faceVideo.srcObject) await startCamera();
  } catch (e) {
    window.alert(e.message);
  }
  if (autoCaptureTimer) clearInterval(autoCaptureTimer);
  autoRecognitionStreakByKey = {};
  autoLastAutoMarkAtByKey = {};
  const intervalMs = Math.max(300, Number(refs.autoCaptureIntervalMs.value) || 800);
  autoCaptureTimer = setInterval(() => {
    autoCaptureTick().catch((e) => console.warn("autoCaptureTick failed:", e));
  }, intervalMs);
  // Run once immediately.
  autoCaptureTick().catch((e) => console.warn("autoCaptureTick failed:", e));
});


function assistantRespond(userText) {
  const t = String(userText || "").toLowerCase();
  const tips = [];

  if (t.includes("id") || t.includes("card") || t.includes("admission")) {
    tips.push("Go to `Students` module.");
    tips.push("Upload the student photo (field: `photo`).");
    tips.push("Click `Print Document` to generate ID cards automatically.");
  } else if (t.includes("attendance") || t.includes("mark")) {
    tips.push("Open `Attendance` module (it shows Face Recognition panel).");
    tips.push("Enroll faces first: choose `Name` + `Class/Dept`, then click `Capture Face`.");
    tips.push("For automatic attendance: enable `Auto Capture & Mark` and keep camera steady.");
  } else if (t.includes("teacher")) {
    tips.push("Teacher face recognition uses the same panel.");
    tips.push("Set `Target Type = teachers` and enroll with `Capture Face`.");
    tips.push("Auto attendance is currently focused on students.");
  } else if (t.includes("how") || t.includes("help") || t.includes("module")) {
    tips.push("Use the sidebar to open modules (Students, Teachers, Attendance, Fees...).");
    tips.push("Add records with the form on the left panel.");
    tips.push("Use search + export for quick work.");
  } else {
    tips.push("Ask about `attendance`, `face recognition`, or `id card` and I will guide you step-by-step.");
  }

  return tips.map((x) => `- ${x}`).join("\n");
}

function escapeHtml(s) {
  return String(s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function assistantAppend(message) {
  const safe = escapeHtml(message);
  refs.assistantOutput.innerHTML += `<div style="margin-bottom:8px;"><div style="font-weight:700;">Assistant</div><div style="white-space:pre-wrap;color:#0f172a;">${safe}</div></div>`;
}

refs.assistantToggleBtn?.addEventListener("click", () => {
  refs.assistantPanel.classList.toggle("hidden");
});

refs.assistantCloseBtn?.addEventListener("click", () => {
  refs.assistantPanel.classList.add("hidden");
});

refs.assistantSendBtn?.addEventListener("click", async () => {
  const txt = refs.assistantInput.value.trim();
  if (!txt) return;
  refs.assistantInput.value = "";
  
  refs.assistantOutput.innerHTML += `<div style="margin-bottom:8px;text-align:right;"><div style="font-weight:700;color:#1e3a8a;">You</div><div style="white-space:pre-wrap;color:#334155;">${escapeHtml(txt)}</div></div>`;
  refs.assistantOutput.scrollTop = refs.assistantOutput.scrollHeight;

  const thinkingId = "think-" + Date.now();
  refs.assistantOutput.innerHTML += `<div id="${thinkingId}" style="margin-bottom:8px;font-style:italic;color:#64748b;">EduCore AI is thinking...</div>`;
  refs.assistantOutput.scrollTop = refs.assistantOutput.scrollHeight;

  try {
    const store = getStore();
    const context = `Current module: ${currentModule}. Students count: ${store.students?.length||0}. Classes count: ${store.classes?.length||0}.`;
    const res = await api("/api/chat", {
      method: "POST",
      body: JSON.stringify({ prompt: txt, context })
    });
    
    const thinkingEl = document.getElementById(thinkingId);
    if (thinkingEl) thinkingEl.remove();

    assistantAppend(res.reply || res.error || "No response received.");
  } catch (err) {
    const thinkingEl = document.getElementById(thinkingId);
    if (thinkingEl) thinkingEl.remove();
    assistantAppend(`❌ Connection error: ${err.message}`);
  }
  
  refs.assistantOutput.scrollTop = refs.assistantOutput.scrollHeight;
});

refs.assistantInput?.addEventListener("keydown", (e) => {
  if (e.key === "Enter") refs.assistantSendBtn.click();
});

refs.assistantAutoAttendanceBtn?.addEventListener("click", async () => {
  refs.assistantPanel.classList.add("hidden");
  currentModule = "attendance";
  refs.faceTargetType.value = "students";
  refs.autoCaptureToggle.checked = true;
  renderAll();
  try {
    if (!refs.faceVideo.srcObject) await startCamera();
  } catch (err) {
    window.alert(err.message);
  }
  const intervalMs = Math.max(300, Number(refs.autoCaptureIntervalMs.value) || 800);
  if (autoCaptureTimer) clearInterval(autoCaptureTimer);
  autoCaptureTimer = setInterval(() => autoCaptureTick().catch((e) => console.warn(e)), intervalMs);
  autoCaptureTick().catch((e) => console.warn(e));
});

refs.apiSaveBtn?.addEventListener("click", () => {
  const input = refs.apiBaseInput;
  if (!input) return;
  const base = normalizeApiBaseUrl(input.value);
  if (!base) return window.alert("Enter backend URL (Render) first.");
  API_BASE_URL = base;
  localStorage.setItem("API_BASE_URL", base);
  if (refs.assistantOutput) {
    assistantAppend(`Backend URL saved: ${base}\nNow login/attendance should work.`);
  }
});

refs.assistantPrintIdBtn?.addEventListener("click", async () => {
  refs.assistantPanel.classList.add("hidden");
  currentModule = "students";
  renderAll();
  // Let render happen then open print window.
  setTimeout(() => printDocumentByModule(), 150);
});

// Initial assistant hint.
if (refs.assistantOutput) {
  refs.assistantOutput.innerHTML = `<div style="font-weight:700;margin-bottom:6px;">Assistant</div><div style="white-space:pre-wrap;color:#0f172a;">Tip:\n- Upload student photos in ` + "`Students`" + ` module.\n- Capture face embeddings with ` + "`Capture Face`" + `.\n- Enable ` + "`Auto Capture & Mark`" + ` to automatically mark attendance.</div>`;
}

refs.studentProfileCloseBtn?.addEventListener("click", closeStudentProfile);
refs.studentProfileBackdrop?.addEventListener("click", closeStudentProfile);
refs.studentProfileTabs?.forEach((btn) => {
  btn.addEventListener("click", () => {
    const tab = btn.dataset.tab;
    if (!tab) return;
    setStudentProfileTab(tab);
  });
});

async function syncFaceEmbeddingsFromServer() {
  try {
    const rows = await api("/api/modules/faceEmbeddings");
    if (!Array.isArray(rows) || !rows.length) return;
    const faceStore = getFaceStore();
    let changed = false;
    rows.forEach((row) => {
      if (!row.name || !row.descriptorJson) return;
      const key = `${row.targetType || "students"}|${row.name}`;
      try {
        const descriptor = JSON.parse(row.descriptorJson);
        if (!faceStore[key]) {
          faceStore[key] = { descriptor, name: row.name, tag: row.tag || "" };
          changed = true;
        }
      } catch { /* skip malformed rows */ }
    });
    if (changed) saveFaceStore(faceStore);
  } catch (e) {
    console.warn("Could not sync face embeddings from server:", e.message);
  }
}

async function boot() {
  try {
    setAuthMode("login");
    // Wake Render free-tier backend early to avoid "Provisional headers".
    warmupBackend();
    const user = await getSessionUser();
    if (!user) {
      applyAuthUI(null);
      return;
    }
    applyAuthUI(user);
    await loadStore();
    await syncFaceEmbeddingsFromServer();
    renderAll();
  } catch {
    applyAuthUI(null);
  }
}

boot();

// =============================================
// ENHANCED ADDITIONS — EduCore v2
// =============================================

// === TOAST NOTIFICATIONS ===
function showToast(message, type = 'info', duration = 3500) {
  const icons = { info: 'ℹ️', success: '✅', error: '❌', warning: '⚠️' };
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${icons[type] || 'ℹ️'}</span>
    <span>${message}</span>
    <button class="toast-close" onclick="this.parentElement.remove()">✕</button>
  `;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'slideInRight 0.3s ease reverse both';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// === LIVE RECOGNITION LOG ===
function addLiveLog(name, confidence, status = 'Present') {
  const log = document.getElementById('liveLog');
  if (!log) return;
  const confColor = confidence >= 0.92 ? '#10b981' : confidence >= 0.85 ? '#f59e0b' : '#ef4444';
  const item = document.createElement('div');
  item.className = 'live-log-item';
  item.innerHTML = `
    <span>👤</span>
    <span style="font-weight:600;color:#fff">${escapeHtml(name)}</span>
    <span style="color:rgba(255,255,255,0.5)">${status}</span>
    <span style="font-size:0.7rem;color:rgba(255,255,255,0.4)">${new Date().toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit',second:'2-digit'})}</span>
    <span class="conf" style="color:${confColor}">${(confidence*100).toFixed(1)}%</span>
  `;
  // Insert at top
  log.insertBefore(item, log.firstChild);
  // Keep max 20 items
  while (log.children.length > 20) log.removeChild(log.lastChild);
}

// === ENHANCED MODULE ICONS ===
const MODULE_ICONS = {
  dashboard: '📊', aiAssistant: '🧠', admissions: '🎯', students: '🎓', teachers: '👩‍🏫', classes: '🏛️',
  subjects: '📚', attendance: '📅', teacherAttendance: '👨‍💼',
  exams: '📝', fees: '💳', library: '📖', transport: '🚌',
  hostel: '🏠', payroll: '💰', users: '🔐', timetable: '🗓️',
  booksAndDress: '📦', whatsappAlerts: '📲', dueManagement: '💸'
};
const NAV_GROUPS = {
  'Core': ['admissions', 'dashboard', 'aiAssistant', 'students', 'teachers', 'classes'],
  'Academic': ['subjects', 'exams', 'timetable'],
  'Daily': ['attendance', 'teacherAttendance'],
  'Finance': ['fees', 'dueManagement', 'payroll', 'booksAndDress', 'whatsappAlerts'],
  'Resources': ['library', 'transport', 'hostel', 'users']
};

// Patch renderNav to use icons + groups
const _origRenderNav = typeof renderNav === 'function' ? renderNav : null;

function renderNavEnhanced() {
  const nav = document.getElementById('moduleNav');
  if (!nav) return;
  nav.innerHTML = '';

  // Respect role-based visibility
  const visible = new Set(typeof getVisibleModules === 'function' ? getVisibleModules() : Object.keys(moduleConfig));

  // If current module is not visible for this role, redirect to dashboard
  if (!visible.has(currentModule)) {
    currentModule = 'dashboard';
  }

  for (const [groupName, modules] of Object.entries(NAV_GROUPS)) {
    const visibleInGroup = modules.filter(mod => moduleConfig[mod] && visible.has(mod));
    if (!visibleInGroup.length) continue;

    const label = document.createElement('div');
    label.className = 'nav-group-label';
    label.textContent = groupName;
    nav.appendChild(label);

    visibleInGroup.forEach(mod => {
      const btn = document.createElement('button');
      btn.dataset.module = mod;
      btn.className = mod === currentModule ? 'active' : '';
      btn.setAttribute('aria-current', mod === currentModule ? 'page' : 'false');
      
      let badge = '';
      const store = getStore();
      if (mod === 'admissions') {
        const pending = (store.admissions || []).filter(a => String(a.status).toLowerCase() === 'pending' || !a.status).length;
        if (pending > 0) badge = `<span class="nav-badge" style="background:#ef4444;color:#fff;">${pending}</span>`;
      } else if (mod === 'fees') {
        const pending = (store.fees || []).filter(f => f.status === 'Pending' || f.status === 'Partial').length;
        if (pending > 0) badge = `<span class="nav-badge" style="background:#f59e0b;color:#fff;">${pending}</span>`;
      }

      btn.innerHTML = `<span class="nav-icon">${MODULE_ICONS[mod] || '📌'}</span><span class="nav-text">${moduleConfig[mod].title}</span>${badge}`;
      btn.addEventListener('click', () => {
        currentModule = mod;
        // Clear search like original renderNav does
        const si = document.getElementById('searchInput');
        if (si) si.value = '';
        renderAll();
        if (typeof isMobileLayout === 'function' && isMobileLayout()) setMobileSidebarOpen(false);
      });
      nav.appendChild(btn);
    });
  }
}

// Intercept renderNav calls
if (typeof renderNav === 'function') {
  // Override if defined
  window.renderNav = renderNavEnhanced;
} else {
  window.renderNav = renderNavEnhanced;
}

// === ENHANCED STAT CARDS ===
function renderStatCardsEnhanced(store) {
  const grid = document.getElementById('statsCards');
  if (!grid) return;

  const students = (store.students || []).length;
  const teachers = (store.teachers || []).length;
  const todayAtt = (store.attendance || []).filter(a => a.date === todayStr());
  const presentToday = todayAtt.filter(a => a.status === 'Present').length;
  const feePending = (store.fees || []).filter(f => f.status === 'Pending' || f.status === 'Partial').length;
  const books = (store.library || []).filter(b => b.status === 'Issued').length;

  const cards = [
    { icon: '🎓', value: students, label: 'Total Students', trend: '↑ Enrolled', color: '#1a4fcf' },
    { icon: '👩‍🏫', value: teachers, label: 'Total Teachers', trend: '↑ Active Staff', color: '#7c3aed' },
    { icon: '✅', value: presentToday, label: 'Present Today', trend: `of ${todayAtt.length} marked`, color: '#059669' },
    { icon: '💳', value: feePending, label: 'Pending Fees', trend: '⚠ Needs follow-up', color: '#d97706' },
    { icon: '📖', value: books, label: 'Books Issued', trend: 'Library circulation', color: '#0891b2' },
    { icon: '🏛️', value: (store.classes || []).length, label: 'Classes', trend: 'Active classrooms', color: '#db2777' },
  ];

  grid.innerHTML = cards.map((c, i) => `
    <div class="stat-card" style="animation-delay:${i * 0.06}s">
      <div class="stat-icon" style="background:${c.color}18;color:${c.color}">${c.icon}</div>
      <div class="stat-value">${c.value}</div>
      <div class="stat-label">${c.label}</div>
      <div class="stat-trend">${c.trend}</div>
    </div>
  `).join('');
}

// === ENHANCED FACE RECOGNITION (faster TinyFace options) ===
const FAST_FACE_OPTIONS = { inputSize: 224, scoreThreshold: 0.5 };

// === PREMIUM ID CARD GENERATOR — v3 ===
function generateIdCardsHTML(store) {
  const students = store.students || [];
  if (!students.length) return '<p style="padding:32px;text-align:center;color:#64748b;font-family:sans-serif;">No students found. Add students first.</p>';

  const schoolName  = 'Tapowan Public School';
  const schoolAddr  = 'Prem Nagar, Tapin North';
  const schoolDist  = 'Ramgarh(JH)';
  const schoolPhone = '8757744973';

  const frontCards = students.map((s, idx) => {
    const initials   = (s.fullName || 'ST').split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase();
    const cardId     = s.admissionNo || String(s.id || idx+1).padStart(4,'0');
    const parentName = escapeHtml(s.parentName || s.fatherName || '—');
    const photoHtml = s.photo
      ? `<img src="${s.photo}" alt="Photo" style="width:100%;height:100%;object-fit:cover;" />`
      : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:#e2e8f0;color:#64748b;font-size:2rem;font-weight:900;">${initials}</div>`;

    return `
    <div class="id-card-wrap">
      <div class="id-card front">
        <div class="top-header">
          <div class="logo-box">
             <img src="logo.png" style="width:100%;height:100%;object-fit:contain;" alt="Logo" />
          </div>
          <div class="school-details">
             <div class="s-title">${escapeHtml(schoolName).toUpperCase()}</div>
             <div class="s-addr">${escapeHtml(schoolAddr)}</div>
             <div class="s-addr">${escapeHtml(schoolDist)}</div>
             <div class="s-phone">Phone:${escapeHtml(schoolPhone)}</div>
          </div>
        </div>
        <div class="photo-container">
           <div class="photo-box">
             ${photoHtml}
           </div>
           <div class="student-name-label">
             ${escapeHtml(s.fullName || '—').toUpperCase()}
           </div>
        </div>
        <div class="details-grid">
           <table class="d-table">
             <tr><td class="lbl">Adm. No</td><td class="sep">:</td><td class="val">${escapeHtml(cardId)}</td></tr>
             <tr><td class="lbl">Class</td><td class="sep">:</td><td class="val">${escapeHtml(s.className || '—')} &nbsp;&nbsp;&nbsp; <b>Roll:</b> ${escapeHtml(s.rollNo || '—')}</td></tr>
             <tr><td class="lbl">D.O.B</td><td class="sep">:</td><td class="val">${escapeHtml(s.dob || '—')}</td></tr>
             <tr><td class="lbl">Father</td><td class="sep">:</td><td class="val">${parentName}</td></tr>
             <tr><td class="lbl">Mother</td><td class="sep">:</td><td class="val">${escapeHtml(s.motherName || '—')}</td></tr>
             <tr><td class="lbl" style="vertical-align:top;">Address</td><td class="sep" style="vertical-align:top;">:</td><td class="val" style="line-height:1.15;">${escapeHtml(s.address || '—')}</td></tr>
             <tr><td class="lbl">Phone</td><td class="sep">:</td><td class="val">${escapeHtml(s.phone || '—')}</td></tr>
           </table>
        </div>
      </div>
    </div>`;
  }).join('');

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700;900&display=swap');
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}

    /* ============ 20 COLOR PALETTES ============ */
    .clr-1  { --c-bg:#fff; --c-bord:#0ea5e9; --t-bg:#1e3a8a; --t-color:#dbeafe; --t-bord:#0284c7; --t-title:#fff; --lbl-col:#1e40af; --val-col:#000; --name-col:#1e3a8a; }
    .clr-2  { --c-bg:#fff; --c-bord:#065f46; --t-bg:#064e3b; --t-color:#fef3c7; --t-bord:#d97706; --t-title:#fcd34d; --lbl-col:#064e3b; --val-col:#111; --name-col:#065f46; }
    .clr-3  { --c-bg:#fdf2f8; --c-bord:#be185d; --t-bg:#be185d; --t-color:#fff; --t-bord:#831843; --t-title:#fff; --lbl-col:#9d174d; --val-col:#111; --name-col:#9d174d; }
    .clr-4  { --c-bg:#1e293b; --c-bord:#475569; --t-bg:#0f172a; --t-color:#cbd5e1; --t-bord:#334155; --t-title:#38bdf8; --lbl-col:#94a3b8; --val-col:#f8fafc; --name-col:#38bdf8; }
    .clr-5  { --c-bg:#f5f3ff; --c-bord:#7c3aed; --t-bg:linear-gradient(135deg,#7c3aed,#4c1d95); --t-color:#ede9fe; --t-bord:#4c1d95; --t-title:#fff; --lbl-col:#5b21b6; --val-col:#111; --name-col:#6d28d9; }
    .clr-6  { --c-bg:#fff; --c-bord:#f97316; --t-bg:#334155; --t-color:#f8fafc; --t-bord:#ea580c; --t-title:#fdba74; --lbl-col:#475569; --val-col:#0f172a; --name-col:#ea580c; }
    .clr-7  { --c-bg:#fffbeb; --c-bord:#f59e0b; --t-bg:linear-gradient(135deg,#ea580c,#f59e0b); --t-color:#fff; --t-bord:#b45309; --t-title:#fff; --lbl-col:#b45309; --val-col:#451a03; --name-col:#d97706; }
    .clr-8  { --c-bg:#f0fdfa; --c-bord:#0d9488; --t-bg:#115e59; --t-color:#ccfbf1; --t-bord:#0f766e; --t-title:#5eead4; --lbl-col:#0f766e; --val-col:#134e4a; --name-col:#0d9488; }
    .clr-9  { --c-bg:#fef2f2; --c-bord:#dc2626; --t-bg:#991b1b; --t-color:#fef2f2; --t-bord:#7f1d1d; --t-title:#fca5a5; --lbl-col:#991b1b; --val-col:#1c1917; --name-col:#dc2626; }
    .clr-10 { --c-bg:#fff; --c-bord:#2563eb; --t-bg:linear-gradient(135deg,#1e40af,#3b82f6); --t-color:#dbeafe; --t-bord:#1e3a8a; --t-title:#fff; --lbl-col:#1e40af; --val-col:#0f172a; --name-col:#2563eb; }
    .clr-11 { --c-bg:#faf5ff; --c-bord:#9333ea; --t-bg:linear-gradient(135deg,#7e22ce,#a855f7); --t-color:#f3e8ff; --t-bord:#6b21a8; --t-title:#fff; --lbl-col:#7e22ce; --val-col:#1c1917; --name-col:#9333ea; }
    .clr-12 { --c-bg:#f0fdf4; --c-bord:#16a34a; --t-bg:#14532d; --t-color:#dcfce7; --t-bord:#166534; --t-title:#86efac; --lbl-col:#14532d; --val-col:#0f172a; --name-col:#16a34a; }
    .clr-13 { --c-bg:#fffbeb; --c-bord:#ca8a04; --t-bg:linear-gradient(135deg,#78350f,#b45309); --t-color:#fef3c7; --t-bord:#92400e; --t-title:#fde68a; --lbl-col:#78350f; --val-col:#1c1917; --name-col:#b45309; }
    .clr-14 { --c-bg:#0f172a; --c-bord:#6366f1; --t-bg:linear-gradient(135deg,#312e81,#4f46e5); --t-color:#c7d2fe; --t-bord:#3730a3; --t-title:#a5b4fc; --lbl-col:#818cf8; --val-col:#e2e8f0; --name-col:#a5b4fc; }
    .clr-15 { --c-bg:#fff1f2; --c-bord:#e11d48; --t-bg:linear-gradient(135deg,#be123c,#f43f5e); --t-color:#fff; --t-bord:#9f1239; --t-title:#fff; --lbl-col:#be123c; --val-col:#1c1917; --name-col:#e11d48; }
    .clr-16 { --c-bg:#ecfdf5; --c-bord:#059669; --t-bg:linear-gradient(135deg,#047857,#10b981); --t-color:#d1fae5; --t-bord:#065f46; --t-title:#fff; --lbl-col:#047857; --val-col:#0f172a; --name-col:#059669; }
    .clr-17 { --c-bg:#fdf4ff; --c-bord:#c026d3; --t-bg:linear-gradient(135deg,#a21caf,#d946ef); --t-color:#fae8ff; --t-bord:#86198f; --t-title:#fff; --lbl-col:#a21caf; --val-col:#1c1917; --name-col:#c026d3; }
    .clr-18 { --c-bg:#f8fafc; --c-bord:#334155; --t-bg:#0f172a; --t-color:#e2e8f0; --t-bord:#1e293b; --t-title:#f8fafc; --lbl-col:#64748b; --val-col:#0f172a; --name-col:#334155; }
    .clr-19 { --c-bg:#fff7ed; --c-bord:#ea580c; --t-bg:linear-gradient(135deg,#c2410c,#ea580c); --t-color:#fff; --t-bord:#9a3412; --t-title:#fff; --lbl-col:#c2410c; --val-col:#1c1917; --name-col:#ea580c; }
    .clr-20 { --c-bg:#f0f9ff; --c-bord:#0284c7; --t-bg:#0c4a6e; --t-color:#e0f2fe; --t-bord:#075985; --t-title:#7dd3fc; --lbl-col:#0369a1; --val-col:#0c4a6e; --name-col:#0284c7; }

    /* ============ 108 DESIGN LAYOUTS ============ */
    .dsg-1 .top-header{background:var(--t-bg);color:var(--t-color);position:relative;padding:6px;text-align:center;border-bottom:3px solid var(--t-bord);}
    .dsg-1 .logo-box{position:absolute;top:6px;left:6px;width:48px;height:36px;background:#fff;border-radius:6px;padding:2px;display:flex;align-items:center;justify-content:center;} 
    .dsg-1 .school-details{padding-left:46px;}

    .dsg-2 .top-header{background:var(--t-bg);color:var(--t-color);position:relative;padding:6px;padding-bottom:36px;text-align:center;border:none;border-radius:0 0 50% 50%/0 0 100% 100%;box-shadow:0 4px 10px rgba(0,0,0,.15);}
    .dsg-2 .logo-box{position:absolute;top:6px;left:6px;width:48px;height:36px;background:#fff;border-radius:6px;padding:2px;display:flex;align-items:center;justify-content:center;} 
    .dsg-2 .school-details{padding-left:46px;}
    .dsg-2 .photo-container{margin-top:-28px!important;position:relative;z-index:10;}
    .dsg-2 .photo-box{border-radius:50%!important;width:75px!important;height:75px!important;overflow:hidden;}

    .dsg-3 .top-header{background:var(--t-bg);color:var(--t-color);position:relative;padding:6px;padding-bottom:30px;text-align:center;border:none;clip-path:polygon(0 0,100% 0,100% 75%,0 100%);}
    .dsg-3 .logo-box{position:absolute;top:6px;left:6px;width:48px;height:36px;background:#fff;border-radius:6px;padding:2px;display:flex;align-items:center;justify-content:center;} 
    .dsg-3 .school-details{padding-left:46px;}
    .dsg-3 .photo-container{margin-top:-28px!important;position:relative;z-index:10;}

    .dsg-4 .top-header{background:var(--t-bg);color:var(--t-color);position:relative;padding:6px;padding-bottom:30px;text-align:center;border:none;clip-path:polygon(0 0,100% 0,100% 100%,0 75%);}
    .dsg-4 .logo-box{position:absolute;top:6px;left:6px;width:48px;height:36px;background:#fff;border-radius:6px;padding:2px;display:flex;align-items:center;justify-content:center;} 
    .dsg-4 .school-details{padding-left:46px;}
    .dsg-4 .photo-container{margin-top:-28px!important;position:relative;z-index:10;}

    .dsg-5 .top-header{background:var(--t-bg);color:var(--t-color);position:relative;padding:6px;padding-bottom:30px;text-align:center;border:none;clip-path:polygon(0 0,100% 0,100% 80%,50% 100%,0 80%);}
    .dsg-5 .logo-box{position:absolute;top:6px;left:6px;width:48px;height:36px;background:#fff;border-radius:6px;padding:2px;display:flex;align-items:center;justify-content:center;} 
    .dsg-5 .school-details{padding-left:46px;}
    .dsg-5 .photo-container{margin-top:-28px!important;position:relative;z-index:10;}

    .dsg-6 .top-header{background:var(--t-bg);color:var(--t-color);position:relative;padding:6px;padding-bottom:28px;text-align:center;border:none;border-radius:0 0 40% 60%/0 0 80% 60%;}
    .dsg-6 .logo-box{position:absolute;top:6px;left:6px;width:48px;height:36px;background:#fff;border-radius:6px;padding:2px;display:flex;align-items:center;justify-content:center;} 
    .dsg-6 .school-details{padding-left:46px;}
    .dsg-6 .photo-container{margin-top:-28px!important;position:relative;z-index:10;}

    .dsg-7 .top-header{background:var(--t-bg);color:var(--t-color);position:relative;padding:6px;padding-bottom:28px;text-align:center;border:none;clip-path:polygon(0 0,100% 0,100% 85%,85% 100%,15% 100%,0 85%);}
    .dsg-7 .logo-box{position:absolute;top:6px;left:6px;width:48px;height:36px;background:#fff;border-radius:6px;padding:2px;display:flex;align-items:center;justify-content:center;} 
    .dsg-7 .school-details{padding-left:46px;}
    .dsg-7 .photo-container{margin-top:-28px!important;position:relative;z-index:10;}

    .dsg-8 .top-header{background:var(--t-bg);color:var(--t-color);position:relative;padding:6px;padding-bottom:30px;text-align:center;border:none;clip-path:polygon(0 0,100% 0,100% 70%,50% 100%,0 70%);}
    .dsg-8 .logo-box{position:absolute;top:6px;left:6px;width:48px;height:36px;background:#fff;border-radius:6px;padding:2px;display:flex;align-items:center;justify-content:center;} 
    .dsg-8 .school-details{padding-left:46px;}
    .dsg-8 .photo-container{margin-top:-28px!important;position:relative;z-index:10;}

    .dsg-9 .top-header{background:var(--t-bg);color:var(--t-color);position:relative;padding:6px;padding-bottom:28px;text-align:center;border:none;clip-path:polygon(0 0,100% 0,100% 80%,70% 80%,70% 100%,30% 100%,30% 80%,0 80%);}
    .dsg-9 .logo-box{position:absolute;top:6px;left:6px;width:48px;height:36px;background:#fff;border-radius:6px;padding:2px;display:flex;align-items:center;justify-content:center;} 
    .dsg-9 .school-details{padding-left:46px;}
    .dsg-9 .photo-container{margin-top:-28px!important;position:relative;z-index:10;}

    .dsg-10 .top-header{background:var(--t-bg);color:var(--t-color);position:relative;padding:8px 6px;text-align:center;border-bottom:5px solid var(--t-bord);}
    .dsg-10 .logo-box{position:absolute;top:6px;left:6px;width:48px;height:36px;background:#fff;border-radius:6px;padding:2px;display:flex;align-items:center;justify-content:center;} 
    .dsg-10 .school-details{padding-left:46px;}

    .dsg-11 .top-header{background:var(--t-bg);color:var(--t-color);position:relative;padding:6px;padding-bottom:20px;text-align:center;border:none;border-radius:0 0 20px 20px;box-shadow:0 3px 8px rgba(0,0,0,.1);}
    .dsg-11 .logo-box{position:absolute;top:6px;left:6px;width:48px;height:36px;background:#fff;border-radius:6px;padding:2px;display:flex;align-items:center;justify-content:center;} 
    .dsg-11 .school-details{padding-left:46px;}

    .dsg-12 .top-header{background:var(--c-bg);color:var(--lbl-col);position:relative;padding:6px;text-align:center;border-bottom:1px dashed var(--c-bord);}
    .dsg-12 .logo-box{position:absolute;top:6px;left:50%;transform:translateX(-50%);width:44px;height:32px;background:transparent;border-radius:6px;padding:2px;display:flex;align-items:center;justify-content:center;box-shadow:none;} 
    .dsg-12 .school-details{padding-left:0;padding-top:36px;}
    .dsg-12 .s-title{color:var(--name-col);}
    .dsg-12 .s-addr,.dsg-12 .s-phone{color:var(--lbl-col);}

    .dsg-13 .top-header{background:var(--t-bg);color:var(--t-color);position:relative;padding:6px;padding-bottom:26px;text-align:center;border:none;clip-path:polygon(5% 0,95% 0,100% 100%,0 100%);}
    .dsg-13 .logo-box{position:absolute;top:6px;left:6px;width:48px;height:36px;background:#fff;border-radius:6px;padding:2px;display:flex;align-items:center;justify-content:center;} 
    .dsg-13 .school-details{padding-left:46px;}
    .dsg-13 .photo-container{margin-top:-28px!important;position:relative;z-index:10;}

    .dsg-14 .top-header{background:var(--t-bg);color:var(--t-color);position:relative;padding:6px;text-align:center;border-bottom:3px solid var(--t-bord);}
    .dsg-14 .logo-box{position:absolute;top:6px;left:6px;width:48px;height:36px;background:#fff;border-radius:6px;padding:2px;display:flex;align-items:center;justify-content:center;} 
    .dsg-14 .school-details{padding-left:46px;}
    .dsg-14 .photo-box{border-radius:50%!important;width:75px!important;height:75px!important;overflow:hidden;}

    .dsg-15 .top-header{background:var(--t-bg);color:var(--t-color);position:relative;padding:6px;padding-bottom:36px;text-align:center;border:none;border-radius:0 0 50% 50%/0 0 100% 100%;box-shadow:0 4px 10px rgba(0,0,0,.15);}
    .dsg-15 .logo-box{position:absolute;top:6px;left:6px;width:48px;height:36px;background:#fff;border-radius:6px;padding:2px;display:flex;align-items:center;justify-content:center;} 
    .dsg-15 .school-details{padding-left:46px;}
    .dsg-15 .photo-container{margin-top:-28px!important;position:relative;z-index:10;}
    .dsg-15 .photo-box{border-radius:50%!important;width:75px!important;height:75px!important;overflow:hidden;}
    .dsg-15 .student-name-label{background:var(--t-bg);color:var(--t-title)!important;padding:3px 12px!important;border-radius:4px;font-size:11px!important;}

    .dsg-16 .top-header{background:var(--t-bg);color:var(--t-color);position:relative;padding:6px;padding-bottom:30px;text-align:center;border:none;clip-path:polygon(0 0,100% 0,100% 75%,0 100%);}
    .dsg-16 .logo-box{position:absolute;top:6px;left:6px;width:48px;height:36px;background:#fff;border-radius:6px;padding:2px;display:flex;align-items:center;justify-content:center;} 
    .dsg-16 .school-details{padding-left:46px;}
    .dsg-16 .photo-container{margin-top:-28px!important;position:relative;z-index:10;}
    .dsg-16 .photo-box{border-radius:50%!important;width:75px!important;height:75px!important;overflow:hidden;}

    .dsg-17 .top-header{background:var(--t-bg);color:var(--t-color);position:relative;padding:6px;padding-bottom:30px;text-align:center;border:none;clip-path:polygon(0 0,100% 0,100% 100%,0 75%);}
    .dsg-17 .logo-box{position:absolute;top:6px;left:6px;width:48px;height:36px;background:#fff;border-radius:6px;padding:2px;display:flex;align-items:center;justify-content:center;} 
    .dsg-17 .school-details{padding-left:46px;}
    .dsg-17 .photo-container{margin-top:-28px!important;position:relative;z-index:10;}
    .dsg-17 .photo-box{border-radius:50%!important;width:75px!important;height:75px!important;overflow:hidden;}

    .dsg-18 .top-header{background:var(--t-bg);color:var(--t-color);position:relative;padding:6px;padding-bottom:30px;text-align:center;border:none;clip-path:polygon(0 0,100% 0,100% 80%,50% 100%,0 80%);}
    .dsg-18 .logo-box{position:absolute;top:6px;left:6px;width:48px;height:36px;background:#fff;border-radius:6px;padding:2px;display:flex;align-items:center;justify-content:center;} 
    .dsg-18 .school-details{padding-left:46px;}
    .dsg-18 .photo-container{margin-top:-28px!important;position:relative;z-index:10;}
    .dsg-18 .photo-box{border-radius:50%!important;width:75px!important;height:75px!important;overflow:hidden;}

    .dsg-19 .top-header{background:var(--t-bg);color:var(--t-color);position:relative;padding:6px;padding-bottom:28px;text-align:center;border:none;border-radius:0 0 40% 60%/0 0 80% 60%;}
    .dsg-19 .logo-box{position:absolute;top:6px;left:6px;width:48px;height:36px;background:#fff;border-radius:6px;padding:2px;display:flex;align-items:center;justify-content:center;} 
    .dsg-19 .school-details{padding-left:46px;}
    .dsg-19 .photo-container{margin-top:-28px!important;position:relative;z-index:10;}
    .dsg-19 .photo-box{border-radius:50%!important;width:75px!important;height:75px!important;overflow:hidden;}

    .dsg-20 .top-header{background:var(--t-bg);color:var(--t-color);position:relative;padding:6px;padding-bottom:28px;text-align:center;border:none;clip-path:polygon(0 0,100% 0,100% 85%,85% 100%,15% 100%,0 85%);}
    .dsg-20 .logo-box{position:absolute;top:6px;left:6px;width:48px;height:36px;background:#fff;border-radius:6px;padding:2px;display:flex;align-items:center;justify-content:center;} 
    .dsg-20 .school-details{padding-left:46px;}
    .dsg-20 .photo-container{margin-top:-28px!important;position:relative;z-index:10;}
    .dsg-20 .photo-box{border-radius:50%!important;width:75px!important;height:75px!important;overflow:hidden;}

    .dsg-21 .top-header{background:var(--t-bg);color:var(--t-color);position:relative;padding:6px;padding-bottom:30px;text-align:center;border:none;clip-path:polygon(0 0,100% 0,100% 70%,50% 100%,0 70%);}
    .dsg-21 .logo-box{position:absolute;top:6px;left:6px;width:48px;height:36px;background:#fff;border-radius:6px;padding:2px;display:flex;align-items:center;justify-content:center;} 
    .dsg-21 .school-details{padding-left:46px;}
    .dsg-21 .photo-container{margin-top:-28px!important;position:relative;z-index:10;}
    .dsg-21 .photo-box{border-radius:50%!important;width:75px!important;height:75px!important;overflow:hidden;}

    .dsg-22 .top-header{background:var(--t-bg);color:var(--t-color);position:relative;padding:6px;padding-bottom:28px;text-align:center;border:none;clip-path:polygon(0 0,100% 0,100% 80%,70% 80%,70% 100%,30% 100%,30% 80%,0 80%);}
    .dsg-22 .logo-box{position:absolute;top:6px;left:6px;width:48px;height:36px;background:#fff;border-radius:6px;padding:2px;display:flex;align-items:center;justify-content:center;} 
    .dsg-22 .school-details{padding-left:46px;}
    .dsg-22 .photo-container{margin-top:-28px!important;position:relative;z-index:10;}
    .dsg-22 .photo-box{border-radius:50%!important;width:75px!important;height:75px!important;overflow:hidden;}

    .dsg-23 .top-header{background:var(--t-bg);color:var(--t-color);position:relative;padding:8px 6px;text-align:center;border-bottom:5px solid var(--t-bord);}
    .dsg-23 .logo-box{position:absolute;top:6px;left:6px;width:48px;height:36px;background:#fff;border-radius:6px;padding:2px;display:flex;align-items:center;justify-content:center;} 
    .dsg-23 .school-details{padding-left:46px;}
    .dsg-23 .photo-box{border-radius:50%!important;width:75px!important;height:75px!important;overflow:hidden;}

    .dsg-24 .top-header{background:var(--t-bg);color:var(--t-color);position:relative;padding:6px;padding-bottom:20px;text-align:center;border:none;border-radius:0 0 20px 20px;box-shadow:0 3px 8px rgba(0,0,0,.1);}
    .dsg-24 .logo-box{position:absolute;top:6px;left:6px;width:48px;height:36px;background:#fff;border-radius:6px;padding:2px;display:flex;align-items:center;justify-content:center;} 
    .dsg-24 .school-details{padding-left:46px;}
    .dsg-24 .photo-box{border-radius:50%!important;width:75px!important;height:75px!important;overflow:hidden;}

    .dsg-25 .top-header{background:var(--c-bg);color:var(--lbl-col);position:relative;padding:6px;text-align:center;border-bottom:1px dashed var(--c-bord);}
    .dsg-25 .logo-box{position:absolute;top:6px;left:50%;transform:translateX(-50%);width:44px;height:32px;background:transparent;border-radius:6px;padding:2px;display:flex;align-items:center;justify-content:center;box-shadow:none;} 
    .dsg-25 .school-details{padding-left:0;padding-top:36px;}
    .dsg-25 .photo-box{border-radius:50%!important;width:75px!important;height:75px!important;overflow:hidden;}
    .dsg-25 .s-title{color:var(--name-col);}
    .dsg-25 .s-addr,.dsg-25 .s-phone{color:var(--lbl-col);}

    .dsg-26 .top-header{background:var(--t-bg);color:var(--t-color);position:relative;padding:6px;padding-bottom:26px;text-align:center;border:none;clip-path:polygon(5% 0,95% 0,100% 100%,0 100%);}
    .dsg-26 .logo-box{position:absolute;top:6px;left:6px;width:48px;height:36px;background:#fff;border-radius:6px;padding:2px;display:flex;align-items:center;justify-content:center;} 
    .dsg-26 .school-details{padding-left:46px;}
    .dsg-26 .photo-container{margin-top:-28px!important;position:relative;z-index:10;}
    .dsg-26 .photo-box{border-radius:50%!important;width:75px!important;height:75px!important;overflow:hidden;}

    .dsg-27 .top-header{background:var(--t-bg);color:var(--t-color);position:relative;padding:6px;text-align:center;border-bottom:3px solid var(--t-bord);}
    .dsg-27 .logo-box{position:absolute;top:6px;left:6px;width:48px;height:36px;background:#fff;border-radius:6px;padding:2px;display:flex;align-items:center;justify-content:center;} 
    .dsg-27 .school-details{padding-left:46px;}
    .dsg-27 .photo-box{border-radius:12px!important;}

    .dsg-28 .top-header{background:var(--t-bg);color:var(--t-color);position:relative;padding:6px;padding-bottom:36px;text-align:center;border:none;border-radius:0 0 50% 50%/0 0 100% 100%;box-shadow:0 4px 10px rgba(0,0,0,.15);}
    .dsg-28 .logo-box{position:absolute;top:6px;left:6px;width:48px;height:36px;background:#fff;border-radius:6px;padding:2px;display:flex;align-items:center;justify-content:center;} 
    .dsg-28 .school-details{padding-left:46px;}
    .dsg-28 .photo-container{margin-top:-28px!important;position:relative;z-index:10;}
    .dsg-28 .photo-box{border-radius:12px!important;}

    .dsg-29 .top-header{background:var(--t-bg);color:var(--t-color);position:relative;padding:6px;padding-bottom:30px;text-align:center;border:none;clip-path:polygon(0 0,100% 0,100% 75%,0 100%);}
    .dsg-29 .logo-box{position:absolute;top:6px;left:6px;width:48px;height:36px;background:#fff;border-radius:6px;padding:2px;display:flex;align-items:center;justify-content:center;} 
    .dsg-29 .school-details{padding-left:46px;}
    .dsg-29 .photo-container{margin-top:-28px!important;position:relative;z-index:10;}
    .dsg-29 .photo-box{border-radius:12px!important;}

    .dsg-30 .top-header{background:var(--t-bg);color:var(--t-color);position:relative;padding:6px;padding-bottom:30px;text-align:center;border:none;clip-path:polygon(0 0,100% 0,100% 100%,0 75%);}
    .dsg-30 .logo-box{position:absolute;top:6px;left:6px;width:48px;height:36px;background:#fff;border-radius:6px;padding:2px;display:flex;align-items:center;justify-content:center;} 
    .dsg-30 .school-details{padding-left:46px;}
    .dsg-30 .photo-container{margin-top:-28px!important;position:relative;z-index:10;}
    .dsg-30 .photo-box{border-radius:12px!important;}

    .dsg-31 .top-header{background:var(--t-bg);color:var(--t-color);position:relative;padding:6px;padding-bottom:30px;text-align:center;border:none;clip-path:polygon(0 0,100% 0,100% 80%,50% 100%,0 80%);}
    .dsg-31 .logo-box{position:absolute;top:6px;left:6px;width:48px;height:36px;background:#fff;border-radius:6px;padding:2px;display:flex;align-items:center;justify-content:center;} 
    .dsg-31 .school-details{padding-left:46px;}
    .dsg-31 .photo-container{margin-top:-28px!important;position:relative;z-index:10;}
    .dsg-31 .photo-box{border-radius:12px!important;}

    .dsg-32 .top-header{background:var(--t-bg);color:var(--t-color);position:relative;padding:6px;padding-bottom:28px;text-align:center;border:none;border-radius:0 0 40% 60%/0 0 80% 60%;}
    .dsg-32 .logo-box{position:absolute;top:6px;left:6px;width:48px;height:36px;background:#fff;border-radius:6px;padding:2px;display:flex;align-items:center;justify-content:center;} 
    .dsg-32 .school-details{padding-left:46px;}
    .dsg-32 .photo-container{margin-top:-28px!important;position:relative;z-index:10;}
    .dsg-32 .photo-box{border-radius:12px!important;}

    .dsg-33 .top-header{background:var(--t-bg);color:var(--t-color);position:relative;padding:6px;padding-bottom:28px;text-align:center;border:none;clip-path:polygon(0 0,100% 0,100% 85%,85% 100%,15% 100%,0 85%);}
    .dsg-33 .logo-box{position:absolute;top:6px;left:6px;width:48px;height:36px;background:#fff;border-radius:6px;padding:2px;display:flex;align-items:center;justify-content:center;} 
    .dsg-33 .school-details{padding-left:46px;}
    .dsg-33 .photo-container{margin-top:-28px!important;position:relative;z-index:10;}
    .dsg-33 .photo-box{border-radius:12px!important;}

    .dsg-34 .top-header{background:var(--t-bg);color:var(--t-color);position:relative;padding:6px;padding-bottom:30px;text-align:center;border:none;clip-path:polygon(0 0,100% 0,100% 70%,50% 100%,0 70%);}
    .dsg-34 .logo-box{position:absolute;top:6px;left:6px;width:48px;height:36px;background:#fff;border-radius:6px;padding:2px;display:flex;align-items:center;justify-content:center;} 
    .dsg-34 .school-details{padding-left:46px;}
    .dsg-34 .photo-container{margin-top:-28px!important;position:relative;z-index:10;}
    .dsg-34 .photo-box{border-radius:12px!important;}

    .dsg-35 .top-header{background:var(--t-bg);color:var(--t-color);position:relative;padding:6px;padding-bottom:28px;text-align:center;border:none;clip-path:polygon(0 0,100% 0,100% 80%,70% 80%,70% 100%,30% 100%,30% 80%,0 80%);}
    .dsg-35 .logo-box{position:absolute;top:6px;left:6px;width:48px;height:36px;background:#fff;border-radius:6px;padding:2px;display:flex;align-items:center;justify-content:center;} 
    .dsg-35 .school-details{padding-left:46px;}
    .dsg-35 .photo-container{margin-top:-28px!important;position:relative;z-index:10;}
    .dsg-35 .photo-box{border-radius:12px!important;}

    .dsg-36 .top-header{background:var(--t-bg);color:var(--t-color);position:relative;padding:8px 6px;text-align:center;border-bottom:5px solid var(--t-bord);}
    .dsg-36 .logo-box{position:absolute;top:6px;left:6px;width:48px;height:36px;background:#fff;border-radius:6px;padding:2px;display:flex;align-items:center;justify-content:center;} 
    .dsg-36 .school-details{padding-left:46px;}
    .dsg-36 .photo-box{border-radius:12px!important;}

    .dsg-37 .top-header{background:var(--t-bg);color:var(--t-color);position:relative;padding:6px;padding-bottom:20px;text-align:center;border:none;border-radius:0 0 20px 20px;box-shadow:0 3px 8px rgba(0,0,0,.1);}
    .dsg-37 .logo-box{position:absolute;top:6px;left:6px;width:48px;height:36px;background:#fff;border-radius:6px;padding:2px;display:flex;align-items:center;justify-content:center;} 
    .dsg-37 .school-details{padding-left:46px;}
    .dsg-37 .photo-box{border-radius:12px!important;}

    .dsg-38 .top-header{background:var(--c-bg);color:var(--lbl-col);position:relative;padding:6px;text-align:center;border-bottom:1px dashed var(--c-bord);}
    .dsg-38 .logo-box{position:absolute;top:6px;left:50%;transform:translateX(-50%);width:44px;height:32px;background:transparent;border-radius:6px;padding:2px;display:flex;align-items:center;justify-content:center;box-shadow:none;} 
    .dsg-38 .school-details{padding-left:0;padding-top:36px;}
    .dsg-38 .photo-box{border-radius:12px!important;}
    .dsg-38 .s-title{color:var(--name-col);}
    .dsg-38 .s-addr,.dsg-38 .s-phone{color:var(--lbl-col);}

    .dsg-39 .top-header{background:var(--t-bg);color:var(--t-color);position:relative;padding:6px;padding-bottom:26px;text-align:center;border:none;clip-path:polygon(5% 0,95% 0,100% 100%,0 100%);}
    .dsg-39 .logo-box{position:absolute;top:6px;left:6px;width:48px;height:36px;background:#fff;border-radius:6px;padding:2px;display:flex;align-items:center;justify-content:center;} 
    .dsg-39 .school-details{padding-left:46px;}
    .dsg-39 .photo-container{margin-top:-28px!important;position:relative;z-index:10;}
    .dsg-39 .photo-box{border-radius:12px!important;}

    .dsg-40 .top-header{background:var(--t-bg);color:var(--t-color);position:relative;padding:6px;text-align:center;border-bottom:3px solid var(--t-bord);}
    .dsg-40 .logo-box{position:absolute;top:6px;left:6px;width:48px;height:36px;background:#fff;border-radius:6px;padding:2px;display:flex;align-items:center;justify-content:center;} 
    .dsg-40 .school-details{padding-left:46px;}
    .dsg-40 .id-card{border:3px double var(--c-bord)!important;}

    .dsg-41 .top-header{background:var(--t-bg);color:var(--t-color);position:relative;padding:6px;padding-bottom:36px;text-align:center;border:none;border-radius:0 0 50% 50%/0 0 100% 100%;box-shadow:0 4px 10px rgba(0,0,0,.15);}
    .dsg-41 .logo-box{position:absolute;top:6px;left:6px;width:48px;height:36px;background:#fff;border-radius:6px;padding:2px;display:flex;align-items:center;justify-content:center;} 
    .dsg-41 .school-details{padding-left:46px;}
    .dsg-41 .photo-container{margin-top:-28px!important;position:relative;z-index:10;}
    .dsg-41 .photo-box{border-radius:50%!important;width:75px!important;height:75px!important;overflow:hidden;}
    .dsg-41 .id-card{border:3px double var(--c-bord)!important;}

    .dsg-42 .top-header{background:var(--t-bg);color:var(--t-color);position:relative;padding:6px;padding-bottom:30px;text-align:center;border:none;clip-path:polygon(0 0,100% 0,100% 75%,0 100%);}
    .dsg-42 .logo-box{position:absolute;top:6px;left:6px;width:48px;height:36px;background:#fff;border-radius:6px;padding:2px;display:flex;align-items:center;justify-content:center;} 
    .dsg-42 .school-details{padding-left:46px;}
    .dsg-42 .photo-container{margin-top:-28px!important;position:relative;z-index:10;}
    .dsg-42 .photo-box{border-radius:12px!important;}
    .dsg-42 .id-card{border:3px double var(--c-bord)!important;}

    .dsg-43 .top-header{background:var(--t-bg);color:var(--t-color);position:relative;padding:6px;text-align:center;border-bottom:3px solid var(--t-bord);}
    .dsg-43 .logo-box{position:absolute;top:6px;left:6px;width:48px;height:36px;background:#fff;border-radius:6px;padding:2px;display:flex;align-items:center;justify-content:center;} 
    .dsg-43 .school-details{padding-left:46px;}
    .dsg-43 .photo-box{border-radius:50%!important;width:75px!important;height:75px!important;overflow:hidden;}
    .dsg-43 .id-card{border:3px double var(--c-bord)!important;}

    .dsg-44 .top-header{background:var(--t-bg);color:var(--t-color);position:relative;padding:6px;padding-bottom:30px;text-align:center;border:none;clip-path:polygon(0 0,100% 0,100% 80%,50% 100%,0 80%);}
    .dsg-44 .logo-box{position:absolute;top:6px;left:6px;width:48px;height:36px;background:#fff;border-radius:6px;padding:2px;display:flex;align-items:center;justify-content:center;} 
    .dsg-44 .school-details{padding-left:46px;}
    .dsg-44 .photo-container{margin-top:-28px!important;position:relative;z-index:10;}
    .dsg-44 .id-card{border:3px double var(--c-bord)!important;}

    .dsg-45 .top-header{background:var(--t-bg);color:var(--t-color);position:relative;padding:6px;padding-bottom:28px;text-align:center;border:none;border-radius:0 0 40% 60%/0 0 80% 60%;}
    .dsg-45 .logo-box{position:absolute;top:6px;left:6px;width:48px;height:36px;background:#fff;border-radius:6px;padding:2px;display:flex;align-items:center;justify-content:center;} 
    .dsg-45 .school-details{padding-left:46px;}
    .dsg-45 .photo-container{margin-top:-28px!important;position:relative;z-index:10;}
    .dsg-45 .photo-box{border-radius:50%!important;width:75px!important;height:75px!important;overflow:hidden;}
    .dsg-45 .id-card{border:3px double var(--c-bord)!important;}

    .dsg-46 .top-header{background:var(--t-bg);color:var(--t-color);position:relative;padding:8px 6px;text-align:center;border-bottom:5px solid var(--t-bord);}
    .dsg-46 .logo-box{position:absolute;top:6px;left:6px;width:48px;height:36px;background:#fff;border-radius:6px;padding:2px;display:flex;align-items:center;justify-content:center;} 
    .dsg-46 .school-details{padding-left:46px;}
    .dsg-46 .photo-box{border-radius:12px!important;}
    .dsg-46 .id-card{border:3px double var(--c-bord)!important;}

    .dsg-47 .top-header{background:var(--t-bg);color:var(--t-color);position:relative;padding:6px;padding-bottom:20px;text-align:center;border:none;border-radius:0 0 20px 20px;box-shadow:0 3px 8px rgba(0,0,0,.1);}
    .dsg-47 .logo-box{position:absolute;top:6px;left:6px;width:48px;height:36px;background:#fff;border-radius:6px;padding:2px;display:flex;align-items:center;justify-content:center;} 
    .dsg-47 .school-details{padding-left:46px;}
    .dsg-47 .id-card{border:3px double var(--c-bord)!important;}

    .dsg-48 .top-header{background:var(--c-bg);color:var(--lbl-col);position:relative;padding:6px;text-align:center;border-bottom:1px dashed var(--c-bord);}
    .dsg-48 .logo-box{position:absolute;top:6px;left:50%;transform:translateX(-50%);width:44px;height:32px;background:transparent;border-radius:6px;padding:2px;display:flex;align-items:center;justify-content:center;box-shadow:none;} 
    .dsg-48 .school-details{padding-left:0;padding-top:36px;}
    .dsg-48 .photo-box{border-radius:50%!important;width:75px!important;height:75px!important;overflow:hidden;}
    .dsg-48 .id-card{border:3px double var(--c-bord)!important;}
    .dsg-48 .s-title{color:var(--name-col);}
    .dsg-48 .s-addr,.dsg-48 .s-phone{color:var(--lbl-col);}

    .dsg-49 .top-header{background:var(--t-bg);color:var(--t-color);position:relative;padding:6px;text-align:center;border-bottom:3px solid var(--t-bord);}
    .dsg-49 .logo-box{position:absolute;top:6px;left:6px;width:48px;height:36px;background:#fff;border-radius:6px;padding:2px;display:flex;align-items:center;justify-content:center;} 
    .dsg-49 .school-details{padding-left:46px;}
    .dsg-49 .id-card{border:3px dashed var(--c-bord)!important;}

    .dsg-50 .top-header{background:var(--t-bg);color:var(--t-color);position:relative;padding:6px;padding-bottom:36px;text-align:center;border:none;border-radius:0 0 50% 50%/0 0 100% 100%;box-shadow:0 4px 10px rgba(0,0,0,.15);}
    .dsg-50 .logo-box{position:absolute;top:6px;left:6px;width:48px;height:36px;background:#fff;border-radius:6px;padding:2px;display:flex;align-items:center;justify-content:center;} 
    .dsg-50 .school-details{padding-left:46px;}
    .dsg-50 .photo-container{margin-top:-28px!important;position:relative;z-index:10;}
    .dsg-50 .photo-box{border-radius:50%!important;width:75px!important;height:75px!important;overflow:hidden;}
    .dsg-50 .id-card{border:3px dashed var(--c-bord)!important;}

    .dsg-51 .top-header{background:var(--t-bg);color:var(--t-color);position:relative;padding:6px;text-align:center;border-bottom:3px solid var(--t-bord);}
    .dsg-51 .logo-box{position:absolute;top:6px;left:6px;width:48px;height:36px;background:#fff;border-radius:6px;padding:2px;display:flex;align-items:center;justify-content:center;} 
    .dsg-51 .school-details{padding-left:46px;}
    .dsg-51 .photo-box{border-radius:12px!important;}
    .dsg-51 .id-card{border:3px dashed var(--c-bord)!important;}

    .dsg-52 .top-header{background:var(--t-bg);color:var(--t-color);position:relative;padding:6px;padding-bottom:30px;text-align:center;border:none;clip-path:polygon(0 0,100% 0,100% 100%,0 75%);}
    .dsg-52 .logo-box{position:absolute;top:6px;left:6px;width:48px;height:36px;background:#fff;border-radius:6px;padding:2px;display:flex;align-items:center;justify-content:center;} 
    .dsg-52 .school-details{padding-left:46px;}
    .dsg-52 .photo-container{margin-top:-28px!important;position:relative;z-index:10;}
    .dsg-52 .id-card{border:3px dashed var(--c-bord)!important;}

    .dsg-53 .top-header{background:var(--t-bg);color:var(--t-color);position:relative;padding:6px;padding-bottom:28px;text-align:center;border:none;border-radius:0 0 40% 60%/0 0 80% 60%;}
    .dsg-53 .logo-box{position:absolute;top:6px;left:6px;width:48px;height:36px;background:#fff;border-radius:6px;padding:2px;display:flex;align-items:center;justify-content:center;} 
    .dsg-53 .school-details{padding-left:46px;}
    .dsg-53 .photo-container{margin-top:-28px!important;position:relative;z-index:10;}
    .dsg-53 .photo-box{border-radius:50%!important;width:75px!important;height:75px!important;overflow:hidden;}
    .dsg-53 .id-card{border:3px dashed var(--c-bord)!important;}

    .dsg-54 .top-header{background:var(--t-bg);color:var(--t-color);position:relative;padding:6px;padding-bottom:30px;text-align:center;border:none;clip-path:polygon(0 0,100% 0,100% 70%,50% 100%,0 70%);}
    .dsg-54 .logo-box{position:absolute;top:6px;left:6px;width:48px;height:36px;background:#fff;border-radius:6px;padding:2px;display:flex;align-items:center;justify-content:center;} 
    .dsg-54 .school-details{padding-left:46px;}
    .dsg-54 .photo-container{margin-top:-28px!important;position:relative;z-index:10;}
    .dsg-54 .photo-box{border-radius:12px!important;}
    .dsg-54 .id-card{border:3px dashed var(--c-bord)!important;}

    .dsg-55 .top-header{background:var(--t-bg);color:var(--t-color);position:relative;padding:8px 6px;text-align:center;border-bottom:5px solid var(--t-bord);}
    .dsg-55 .logo-box{position:absolute;top:6px;left:6px;width:48px;height:36px;background:#fff;border-radius:6px;padding:2px;display:flex;align-items:center;justify-content:center;} 
    .dsg-55 .school-details{padding-left:46px;}
    .dsg-55 .id-card{border:3px dashed var(--c-bord)!important;}

    .dsg-56 .top-header{background:var(--c-bg);color:var(--lbl-col);position:relative;padding:6px;text-align:center;border-bottom:1px dashed var(--c-bord);}
    .dsg-56 .logo-box{position:absolute;top:6px;left:50%;transform:translateX(-50%);width:44px;height:32px;background:transparent;border-radius:6px;padding:2px;display:flex;align-items:center;justify-content:center;box-shadow:none;} 
    .dsg-56 .school-details{padding-left:0;padding-top:36px;}
    .dsg-56 .id-card{border:3px dashed var(--c-bord)!important;}
    .dsg-56 .s-title{color:var(--name-col);}
    .dsg-56 .s-addr,.dsg-56 .s-phone{color:var(--lbl-col);}

    .dsg-57 .top-header{background:var(--t-bg);color:var(--t-color);position:relative;padding:6px;text-align:center;border-bottom:3px solid var(--t-bord);}
    .dsg-57 .logo-box{position:absolute;top:6px;left:6px;width:48px;height:36px;background:#fff;border-radius:6px;padding:2px;display:flex;align-items:center;justify-content:center;} 
    .dsg-57 .school-details{padding-left:46px;}
    .dsg-57 .id-card{border-left:12px solid var(--c-bord)!important;border-radius:0!important;}

    .dsg-58 .top-header{background:var(--t-bg);color:var(--t-color);position:relative;padding:6px;text-align:center;border-bottom:3px solid var(--t-bord);}
    .dsg-58 .logo-box{position:absolute;top:6px;left:6px;width:48px;height:36px;background:#fff;border-radius:6px;padding:2px;display:flex;align-items:center;justify-content:center;} 
    .dsg-58 .school-details{padding-left:46px;}
    .dsg-58 .photo-box{border-radius:50%!important;width:75px!important;height:75px!important;overflow:hidden;}
    .dsg-58 .id-card{border-left:12px solid var(--c-bord)!important;border-radius:0!important;}

    .dsg-59 .top-header{background:var(--t-bg);color:var(--t-color);position:relative;padding:6px;text-align:center;border-bottom:3px solid var(--t-bord);}
    .dsg-59 .logo-box{position:absolute;top:6px;left:6px;width:48px;height:36px;background:#fff;border-radius:6px;padding:2px;display:flex;align-items:center;justify-content:center;} 
    .dsg-59 .school-details{padding-left:46px;}
    .dsg-59 .photo-box{border-radius:12px!important;}
    .dsg-59 .id-card{border-left:12px solid var(--c-bord)!important;border-radius:0!important;}

    .dsg-60 .top-header{background:var(--t-bg);color:var(--t-color);position:relative;padding:8px 6px;text-align:center;border-bottom:5px solid var(--t-bord);}
    .dsg-60 .logo-box{position:absolute;top:6px;left:6px;width:48px;height:36px;background:#fff;border-radius:6px;padding:2px;display:flex;align-items:center;justify-content:center;} 
    .dsg-60 .school-details{padding-left:46px;}
    .dsg-60 .id-card{border-left:12px solid var(--c-bord)!important;border-radius:0!important;}

    .dsg-61 .top-header{background:var(--t-bg);color:var(--t-color);position:relative;padding:8px 6px;text-align:center;border-bottom:5px solid var(--t-bord);}
    .dsg-61 .logo-box{position:absolute;top:6px;left:6px;width:48px;height:36px;background:#fff;border-radius:6px;padding:2px;display:flex;align-items:center;justify-content:center;} 
    .dsg-61 .school-details{padding-left:46px;}
    .dsg-61 .photo-box{border-radius:12px!important;}
    .dsg-61 .id-card{border-left:12px solid var(--c-bord)!important;border-radius:0!important;}

    .dsg-62 .top-header{background:var(--t-bg);color:var(--t-color);position:relative;padding:6px;text-align:center;border-bottom:3px solid var(--t-bord);}
    .dsg-62 .logo-box{position:absolute;top:6px;left:6px;width:48px;height:36px;background:#fff;border-radius:6px;padding:2px;display:flex;align-items:center;justify-content:center;} 
    .dsg-62 .school-details{padding-left:46px;}
    .dsg-62 .id-card{border-left:12px solid var(--c-bord)!important;border-radius:0!important;}

    .dsg-63 .top-header{background:var(--t-bg);color:var(--t-color);position:relative;padding:6px;text-align:center;border-bottom:3px solid var(--t-bord);}
    .dsg-63 .logo-box{position:absolute;top:6px;left:6px;width:48px;height:36px;background:#fff;border-radius:6px;padding:2px;display:flex;align-items:center;justify-content:center;} 
    .dsg-63 .school-details{padding-left:46px;}
    .dsg-63 .photo-box{border-radius:50%!important;width:75px!important;height:75px!important;overflow:hidden;}
    .dsg-63 .id-card{border-left:12px solid var(--c-bord)!important;border-radius:0!important;}
    .dsg-63 .student-name-label{background:var(--t-bg);color:var(--t-title)!important;padding:3px 12px!important;border-radius:4px;font-size:11px!important;}

    .dsg-64 .top-header{background:var(--c-bg);color:var(--lbl-col);position:relative;padding:6px;text-align:center;border-bottom:1px dashed var(--c-bord);}
    .dsg-64 .logo-box{position:absolute;top:6px;left:50%;transform:translateX(-50%);width:44px;height:32px;background:transparent;border-radius:6px;padding:2px;display:flex;align-items:center;justify-content:center;box-shadow:none;} 
    .dsg-64 .school-details{padding-left:0;padding-top:36px;}
    .dsg-64 .id-card{border-left:12px solid var(--c-bord)!important;border-radius:0!important;}
    .dsg-64 .s-title{color:var(--name-col);}
    .dsg-64 .s-addr,.dsg-64 .s-phone{color:var(--lbl-col);}

    .dsg-65 .top-header{background:var(--t-bg);color:var(--t-color);position:relative;padding:6px;text-align:center;border-bottom:3px solid var(--t-bord);}
    .dsg-65 .logo-box{position:absolute;top:6px;left:6px;width:48px;height:36px;background:#fff;border-radius:6px;padding:2px;display:flex;align-items:center;justify-content:center;} 
    .dsg-65 .school-details{padding-left:46px;}
    .dsg-65 .id-card{border:1px solid #e2e8f0!important;border-top:6px solid var(--c-bord)!important;border-radius:0 0 12px 12px!important;}

    .dsg-66 .top-header{background:var(--t-bg);color:var(--t-color);position:relative;padding:6px;text-align:center;border-bottom:3px solid var(--t-bord);}
    .dsg-66 .logo-box{position:absolute;top:6px;left:6px;width:48px;height:36px;background:#fff;border-radius:6px;padding:2px;display:flex;align-items:center;justify-content:center;} 
    .dsg-66 .school-details{padding-left:46px;}
    .dsg-66 .photo-box{border-radius:50%!important;width:75px!important;height:75px!important;overflow:hidden;}
    .dsg-66 .id-card{border:1px solid #e2e8f0!important;border-top:6px solid var(--c-bord)!important;border-radius:0 0 12px 12px!important;}

    .dsg-67 .top-header{background:var(--t-bg);color:var(--t-color);position:relative;padding:6px;text-align:center;border-bottom:3px solid var(--t-bord);}
    .dsg-67 .logo-box{position:absolute;top:6px;left:6px;width:48px;height:36px;background:#fff;border-radius:6px;padding:2px;display:flex;align-items:center;justify-content:center;} 
    .dsg-67 .school-details{padding-left:46px;}
    .dsg-67 .photo-box{border-radius:12px!important;}
    .dsg-67 .id-card{border:1px solid #e2e8f0!important;border-top:6px solid var(--c-bord)!important;border-radius:0 0 12px 12px!important;}

    .dsg-68 .top-header{background:var(--t-bg);color:var(--t-color);position:relative;padding:6px;text-align:center;border-bottom:3px solid var(--t-bord);}
    .dsg-68 .logo-box{position:absolute;top:6px;left:6px;width:48px;height:36px;background:#fff;border-radius:6px;padding:2px;display:flex;align-items:center;justify-content:center;} 
    .dsg-68 .school-details{padding-left:46px;}
    .dsg-68 .id-card{border:1px solid #e2e8f0!important;border-top:6px solid var(--c-bord)!important;border-radius:0 0 12px 12px!important;}

    .dsg-69 .top-header{background:var(--c-bg);color:var(--lbl-col);position:relative;padding:6px;text-align:center;border-bottom:1px dashed var(--c-bord);}
    .dsg-69 .logo-box{position:absolute;top:6px;left:50%;transform:translateX(-50%);width:44px;height:32px;background:transparent;border-radius:6px;padding:2px;display:flex;align-items:center;justify-content:center;box-shadow:none;} 
    .dsg-69 .school-details{padding-left:0;padding-top:36px;}
    .dsg-69 .id-card{border:1px solid #e2e8f0!important;border-top:6px solid var(--c-bord)!important;border-radius:0 0 12px 12px!important;}
    .dsg-69 .s-title{color:var(--name-col);}
    .dsg-69 .s-addr,.dsg-69 .s-phone{color:var(--lbl-col);}

    .dsg-70 .top-header{background:var(--t-bg);color:var(--t-color);position:relative;padding:6px;text-align:center;border-bottom:3px solid var(--t-bord);}
    .dsg-70 .logo-box{position:absolute;top:6px;left:6px;width:48px;height:36px;background:#fff;border-radius:6px;padding:2px;display:flex;align-items:center;justify-content:center;} 
    .dsg-70 .school-details{padding-left:46px;}
    .dsg-70 .photo-box{box-shadow:0 6px 16px rgba(0,0,0,.18)!important;border-radius:8px!important;}
    .dsg-70 .id-card{border:1px solid #e2e8f0!important;border-top:6px solid var(--c-bord)!important;border-radius:0 0 12px 12px!important;}

    .dsg-71 .top-header{background:var(--t-bg);color:var(--t-color);position:relative;padding:6px;text-align:center;border-bottom:3px solid var(--t-bord);}
    .dsg-71 .logo-box{position:absolute;top:6px;left:6px;width:48px;height:36px;background:#fff;border-radius:6px;padding:2px;display:flex;align-items:center;justify-content:center;} 
    .dsg-71 .school-details{padding-left:46px;}
    .dsg-71 .photo-box{border:3px double var(--c-bord)!important;}
    .dsg-71 .id-card{border:1px solid #e2e8f0!important;border-top:6px solid var(--c-bord)!important;border-radius:0 0 12px 12px!important;}

    .dsg-72 .top-header{background:var(--t-bg);color:var(--t-color);position:relative;padding:6px;text-align:center;border-bottom:3px solid var(--t-bord);}
    .dsg-72 .logo-box{position:absolute;top:6px;left:6px;width:48px;height:36px;background:#fff;border-radius:6px;padding:2px;display:flex;align-items:center;justify-content:center;} 
    .dsg-72 .school-details{padding-left:46px;}
    .dsg-72 .id-card{border:1px solid #e2e8f0!important;border-top:6px solid var(--c-bord)!important;border-radius:0 0 12px 12px!important;}
    .dsg-72 .student-name-label{background:var(--t-bg);color:var(--t-title)!important;padding:3px 12px!important;border-radius:4px;font-size:11px!important;}

    .dsg-73 .top-header{background:var(--t-bg);color:var(--t-color);position:relative;padding:6px;text-align:center;border-bottom:3px solid var(--t-bord);}
    .dsg-73 .logo-box{position:absolute;top:6px;left:6px;width:48px;height:36px;background:#fff;border-radius:6px;padding:2px;display:flex;align-items:center;justify-content:center;} 
    .dsg-73 .school-details{padding-left:46px;}
    .dsg-73 .id-card{border:1px solid #e2e8f0!important;border-bottom:6px solid var(--c-bord)!important;border-radius:12px 12px 0 0!important;}

    .dsg-74 .top-header{background:var(--t-bg);color:var(--t-color);position:relative;padding:6px;text-align:center;border-bottom:3px solid var(--t-bord);}
    .dsg-74 .logo-box{position:absolute;top:6px;left:6px;width:48px;height:36px;background:#fff;border-radius:6px;padding:2px;display:flex;align-items:center;justify-content:center;} 
    .dsg-74 .school-details{padding-left:46px;}
    .dsg-74 .photo-box{border-radius:50%!important;width:75px!important;height:75px!important;overflow:hidden;}
    .dsg-74 .id-card{border:1px solid #e2e8f0!important;border-bottom:6px solid var(--c-bord)!important;border-radius:12px 12px 0 0!important;}

    .dsg-75 .top-header{background:var(--t-bg);color:var(--t-color);position:relative;padding:6px;text-align:center;border-bottom:3px solid var(--t-bord);}
    .dsg-75 .logo-box{position:absolute;top:6px;left:6px;width:48px;height:36px;background:#fff;border-radius:6px;padding:2px;display:flex;align-items:center;justify-content:center;} 
    .dsg-75 .school-details{padding-left:46px;}
    .dsg-75 .photo-box{border-radius:12px!important;}
    .dsg-75 .id-card{border:1px solid #e2e8f0!important;border-bottom:6px solid var(--c-bord)!important;border-radius:12px 12px 0 0!important;}

    .dsg-76 .top-header{background:var(--t-bg);color:var(--t-color);position:relative;padding:6px;text-align:center;border-bottom:3px solid var(--t-bord);}
    .dsg-76 .logo-box{position:absolute;top:6px;left:6px;width:48px;height:36px;background:#fff;border-radius:6px;padding:2px;display:flex;align-items:center;justify-content:center;} 
    .dsg-76 .school-details{padding-left:46px;}
    .dsg-76 .id-card{border:1px solid #e2e8f0!important;border-bottom:6px solid var(--c-bord)!important;border-radius:12px 12px 0 0!important;}

    .dsg-77 .top-header{background:var(--c-bg);color:var(--lbl-col);position:relative;padding:6px;text-align:center;border-bottom:1px dashed var(--c-bord);}
    .dsg-77 .logo-box{position:absolute;top:6px;left:50%;transform:translateX(-50%);width:44px;height:32px;background:transparent;border-radius:6px;padding:2px;display:flex;align-items:center;justify-content:center;box-shadow:none;} 
    .dsg-77 .school-details{padding-left:0;padding-top:36px;}
    .dsg-77 .id-card{border:1px solid #e2e8f0!important;border-bottom:6px solid var(--c-bord)!important;border-radius:12px 12px 0 0!important;}
    .dsg-77 .s-title{color:var(--name-col);}
    .dsg-77 .s-addr,.dsg-77 .s-phone{color:var(--lbl-col);}

    .dsg-78 .top-header{background:var(--t-bg);color:var(--t-color);position:relative;padding:6px;text-align:center;border-bottom:3px solid var(--t-bord);}
    .dsg-78 .logo-box{position:absolute;top:6px;left:6px;width:48px;height:36px;background:#fff;border-radius:6px;padding:2px;display:flex;align-items:center;justify-content:center;} 
    .dsg-78 .school-details{padding-left:46px;}
    .dsg-78 .photo-box{box-shadow:0 6px 16px rgba(0,0,0,.18)!important;border-radius:8px!important;}
    .dsg-78 .id-card{border:1px solid #e2e8f0!important;border-bottom:6px solid var(--c-bord)!important;border-radius:12px 12px 0 0!important;}

    .dsg-79 .top-header{background:var(--t-bg);color:var(--t-color);position:relative;padding:6px;text-align:center;border-bottom:3px solid var(--t-bord);}
    .dsg-79 .logo-box{position:absolute;top:6px;left:6px;width:48px;height:36px;background:#fff;border-radius:6px;padding:2px;display:flex;align-items:center;justify-content:center;} 
    .dsg-79 .school-details{padding-left:46px;}
    .dsg-79 .id-card{border-radius:0!important;}

    .dsg-80 .top-header{background:var(--t-bg);color:var(--t-color);position:relative;padding:8px 6px;text-align:center;border-bottom:5px solid var(--t-bord);}
    .dsg-80 .logo-box{position:absolute;top:6px;left:6px;width:48px;height:36px;background:#fff;border-radius:6px;padding:2px;display:flex;align-items:center;justify-content:center;} 
    .dsg-80 .school-details{padding-left:46px;}
    .dsg-80 .id-card{border-radius:0!important;}

    .dsg-81 .top-header{background:var(--t-bg);color:var(--t-color);position:relative;padding:6px;text-align:center;border-bottom:3px solid var(--t-bord);}
    .dsg-81 .logo-box{position:absolute;top:6px;left:6px;width:48px;height:36px;background:#fff;border-radius:6px;padding:2px;display:flex;align-items:center;justify-content:center;} 
    .dsg-81 .school-details{padding-left:46px;}
    .dsg-81 .photo-box{transform:rotate(3deg);box-shadow:-2px 2px 0 var(--c-bord);}
    .dsg-81 .id-card{border-radius:0!important;}

    .dsg-82 .top-header{background:var(--t-bg);color:var(--t-color);position:relative;padding:6px;text-align:center;border-bottom:3px solid var(--t-bord);}
    .dsg-82 .logo-box{position:absolute;top:6px;left:6px;width:48px;height:36px;background:#fff;border-radius:6px;padding:2px;display:flex;align-items:center;justify-content:center;} 
    .dsg-82 .school-details{padding-left:46px;}
    .dsg-82 .photo-box{transform:rotate(-3deg);box-shadow:2px 2px 0 var(--c-bord);}
    .dsg-82 .id-card{border-radius:0!important;}

    .dsg-83 .top-header{background:var(--t-bg);color:var(--t-color);position:relative;padding:6px;padding-bottom:30px;text-align:center;border:none;clip-path:polygon(0 0,100% 0,100% 75%,0 100%);}
    .dsg-83 .logo-box{position:absolute;top:6px;left:6px;width:48px;height:36px;background:#fff;border-radius:6px;padding:2px;display:flex;align-items:center;justify-content:center;} 
    .dsg-83 .school-details{padding-left:46px;}
    .dsg-83 .photo-container{margin-top:-28px!important;position:relative;z-index:10;}
    .dsg-83 .id-card{border-radius:0!important;}

    .dsg-84 .top-header{background:var(--t-bg);color:var(--t-color);position:relative;padding:6px;padding-bottom:30px;text-align:center;border:none;clip-path:polygon(0 0,100% 0,100% 100%,0 75%);}
    .dsg-84 .logo-box{position:absolute;top:6px;left:6px;width:48px;height:36px;background:#fff;border-radius:6px;padding:2px;display:flex;align-items:center;justify-content:center;} 
    .dsg-84 .school-details{padding-left:46px;}
    .dsg-84 .photo-container{margin-top:-28px!important;position:relative;z-index:10;}
    .dsg-84 .id-card{border-radius:0!important;}

    .dsg-85 .top-header{background:var(--t-bg);color:var(--t-color);position:relative;padding:6px;text-align:center;border-bottom:3px solid var(--t-bord);}
    .dsg-85 .logo-box{position:absolute;top:6px;left:6px;width:48px;height:36px;background:#fff;border-radius:6px;padding:2px;display:flex;align-items:center;justify-content:center;} 
    .dsg-85 .school-details{padding-left:46px;}
    .dsg-85 .photo-box{border-radius:50%!important;width:75px!important;height:75px!important;overflow:hidden;}
    .dsg-85 .id-card{border-radius:24px!important;}

    .dsg-86 .top-header{background:var(--t-bg);color:var(--t-color);position:relative;padding:6px;text-align:center;border-bottom:3px solid var(--t-bord);}
    .dsg-86 .logo-box{position:absolute;top:6px;left:6px;width:48px;height:36px;background:#fff;border-radius:6px;padding:2px;display:flex;align-items:center;justify-content:center;} 
    .dsg-86 .school-details{padding-left:46px;}
    .dsg-86 .photo-box{border-radius:12px!important;}
    .dsg-86 .id-card{border-radius:24px!important;}

    .dsg-87 .top-header{background:var(--t-bg);color:var(--t-color);position:relative;padding:6px;text-align:center;border-bottom:3px solid var(--t-bord);}
    .dsg-87 .logo-box{position:absolute;top:6px;left:6px;width:48px;height:36px;background:#fff;border-radius:6px;padding:2px;display:flex;align-items:center;justify-content:center;} 
    .dsg-87 .school-details{padding-left:46px;}
    .dsg-87 .id-card{border-radius:24px!important;}

    .dsg-88 .top-header{background:var(--c-bg);color:var(--lbl-col);position:relative;padding:6px;text-align:center;border-bottom:1px dashed var(--c-bord);}
    .dsg-88 .logo-box{position:absolute;top:6px;left:50%;transform:translateX(-50%);width:44px;height:32px;background:transparent;border-radius:6px;padding:2px;display:flex;align-items:center;justify-content:center;box-shadow:none;} 
    .dsg-88 .school-details{padding-left:0;padding-top:36px;}
    .dsg-88 .photo-box{border-radius:50%!important;width:75px!important;height:75px!important;overflow:hidden;}
    .dsg-88 .id-card{border-radius:24px!important;}
    .dsg-88 .s-title{color:var(--name-col);}
    .dsg-88 .s-addr,.dsg-88 .s-phone{color:var(--lbl-col);}

    .dsg-89 .top-header{background:var(--t-bg);color:var(--t-color);position:relative;padding:6px;text-align:center;border-bottom:3px solid var(--t-bord);}
    .dsg-89 .logo-box{position:absolute;top:6px;left:6px;width:48px;height:36px;background:#fff;border-radius:6px;padding:2px;display:flex;align-items:center;justify-content:center;} 
    .dsg-89 .school-details{padding-left:46px;}
    .dsg-89 .id-card{border:2px solid var(--c-bord)!important;outline:2px solid var(--c-bord);outline-offset:3px;}

    .dsg-90 .top-header{background:var(--t-bg);color:var(--t-color);position:relative;padding:6px;text-align:center;border-bottom:3px solid var(--t-bord);}
    .dsg-90 .logo-box{position:absolute;top:6px;left:6px;width:48px;height:36px;background:#fff;border-radius:6px;padding:2px;display:flex;align-items:center;justify-content:center;} 
    .dsg-90 .school-details{padding-left:46px;}
    .dsg-90 .photo-box{border-radius:50%!important;width:75px!important;height:75px!important;overflow:hidden;}
    .dsg-90 .id-card{border:2px solid var(--c-bord)!important;outline:2px solid var(--c-bord);outline-offset:3px;}

    .dsg-91 .top-header{background:var(--t-bg);color:var(--t-color);position:relative;padding:6px;text-align:center;border-bottom:3px solid var(--t-bord);}
    .dsg-91 .logo-box{position:absolute;top:6px;left:6px;width:48px;height:36px;background:#fff;border-radius:6px;padding:2px;display:flex;align-items:center;justify-content:center;} 
    .dsg-91 .school-details{padding-left:46px;}
    .dsg-91 .photo-box{border-radius:12px!important;}
    .dsg-91 .id-card{border:2px solid var(--c-bord)!important;outline:2px solid var(--c-bord);outline-offset:3px;}

    .dsg-92 .top-header{background:var(--t-bg);color:var(--t-color);position:relative;padding:8px 6px;text-align:center;border-bottom:5px solid var(--t-bord);}
    .dsg-92 .logo-box{position:absolute;top:6px;left:6px;width:48px;height:36px;background:#fff;border-radius:6px;padding:2px;display:flex;align-items:center;justify-content:center;} 
    .dsg-92 .school-details{padding-left:46px;}
    .dsg-92 .id-card{border:2px solid var(--c-bord)!important;outline:2px solid var(--c-bord);outline-offset:3px;}

    .dsg-93 .top-header{background:var(--t-bg);color:var(--t-color);position:relative;padding:6px;text-align:center;border-bottom:3px solid var(--t-bord);}
    .dsg-93 .logo-box{position:absolute;top:6px;left:6px;width:48px;height:36px;background:#fff;border-radius:6px;padding:2px;display:flex;align-items:center;justify-content:center;} 
    .dsg-93 .school-details{padding-left:46px;}
    .dsg-93 .id-card{border:2px solid var(--c-bord)!important;outline:2px solid var(--c-bord);outline-offset:3px;}

    .dsg-94 .top-header{background:var(--c-bg);color:var(--lbl-col);position:relative;padding:6px;text-align:center;border-bottom:1px dashed var(--c-bord);}
    .dsg-94 .logo-box{position:absolute;top:6px;left:50%;transform:translateX(-50%);width:44px;height:32px;background:transparent;border-radius:6px;padding:2px;display:flex;align-items:center;justify-content:center;box-shadow:none;} 
    .dsg-94 .school-details{padding-left:0;padding-top:36px;}
    .dsg-94 .id-card{border:2px solid var(--c-bord)!important;outline:2px solid var(--c-bord);outline-offset:3px;}
    .dsg-94 .s-title{color:var(--name-col);}
    .dsg-94 .s-addr,.dsg-94 .s-phone{color:var(--lbl-col);}

    .dsg-95 .top-header{background:var(--t-bg);color:var(--t-color);position:relative;padding:6px;text-align:center;border-bottom:3px solid var(--t-bord);}
    .dsg-95 .logo-box{position:absolute;top:6px;left:6px;width:48px;height:36px;background:#fff;border-radius:6px;padding:2px;display:flex;align-items:center;justify-content:center;} 
    .dsg-95 .school-details{padding-left:46px;}
    .dsg-95 .id-card{border:4px ridge var(--c-bord)!important;}

    .dsg-96 .top-header{background:var(--t-bg);color:var(--t-color);position:relative;padding:6px;text-align:center;border-bottom:3px solid var(--t-bord);}
    .dsg-96 .logo-box{position:absolute;top:6px;left:6px;width:48px;height:36px;background:#fff;border-radius:6px;padding:2px;display:flex;align-items:center;justify-content:center;} 
    .dsg-96 .school-details{padding-left:46px;}
    .dsg-96 .photo-box{border-radius:50%!important;width:75px!important;height:75px!important;overflow:hidden;}
    .dsg-96 .id-card{border:4px ridge var(--c-bord)!important;}

    .dsg-97 .top-header{background:var(--t-bg);color:var(--t-color);position:relative;padding:6px;text-align:center;border-bottom:3px solid var(--t-bord);}
    .dsg-97 .logo-box{position:absolute;top:6px;left:6px;width:48px;height:36px;background:#fff;border-radius:6px;padding:2px;display:flex;align-items:center;justify-content:center;} 
    .dsg-97 .school-details{padding-left:46px;}
    .dsg-97 .id-card{border:4px groove var(--c-bord)!important;}

    .dsg-98 .top-header{background:var(--t-bg);color:var(--t-color);position:relative;padding:6px;text-align:center;border-bottom:3px solid var(--t-bord);}
    .dsg-98 .logo-box{position:absolute;top:6px;left:6px;width:48px;height:36px;background:#fff;border-radius:6px;padding:2px;display:flex;align-items:center;justify-content:center;} 
    .dsg-98 .school-details{padding-left:46px;}
    .dsg-98 .photo-box{border-radius:50%!important;width:75px!important;height:75px!important;overflow:hidden;}
    .dsg-98 .id-card{border:4px groove var(--c-bord)!important;}

    .dsg-99 .top-header{background:var(--t-bg);color:var(--t-color);position:relative;padding:6px;text-align:center;border-bottom:3px solid var(--t-bord);}
    .dsg-99 .logo-box{position:absolute;top:6px;left:6px;width:48px;height:36px;background:#fff;border-radius:6px;padding:2px;display:flex;align-items:center;justify-content:center;} 
    .dsg-99 .school-details{padding-left:46px;}
    .dsg-99 .id-card{border-left:8px solid var(--c-bord)!important;border-right:8px solid var(--c-bord)!important;border-top:1px solid #e2e8f0!important;border-bottom:1px solid #e2e8f0!important;border-radius:0!important;}

    .dsg-100 .top-header{background:var(--t-bg);color:var(--t-color);position:relative;padding:6px;text-align:center;border-bottom:3px solid var(--t-bord);}
    .dsg-100 .logo-box{position:absolute;top:6px;left:6px;width:48px;height:36px;background:#fff;border-radius:6px;padding:2px;display:flex;align-items:center;justify-content:center;} 
    .dsg-100 .school-details{padding-left:46px;}
    .dsg-100 .photo-box{border-radius:50%!important;width:75px!important;height:75px!important;overflow:hidden;}
    .dsg-100 .id-card{border-left:8px solid var(--c-bord)!important;border-right:8px solid var(--c-bord)!important;border-top:1px solid #e2e8f0!important;border-bottom:1px solid #e2e8f0!important;border-radius:0!important;}

    .dsg-101 .top-header{background:var(--t-bg);color:var(--t-color);position:relative;padding:6px;text-align:center;border-bottom:3px solid var(--t-bord);}
    .dsg-101 .logo-box{position:absolute;top:6px;left:6px;width:48px;height:36px;background:#fff;border-radius:6px;padding:2px;display:flex;align-items:center;justify-content:center;} 
    .dsg-101 .school-details{padding-left:46px;}
    .dsg-101 .photo-box{border-radius:12px!important;}
    .dsg-101 .id-card{border-left:8px solid var(--c-bord)!important;border-right:8px solid var(--c-bord)!important;border-top:1px solid #e2e8f0!important;border-bottom:1px solid #e2e8f0!important;border-radius:0!important;}

    .dsg-102 .top-header{background:var(--t-bg);color:var(--t-color);position:relative;padding:8px 6px;text-align:center;border-bottom:5px solid var(--t-bord);}
    .dsg-102 .logo-box{position:absolute;top:6px;left:6px;width:48px;height:36px;background:#fff;border-radius:6px;padding:2px;display:flex;align-items:center;justify-content:center;} 
    .dsg-102 .school-details{padding-left:46px;}
    .dsg-102 .id-card{border-left:8px solid var(--c-bord)!important;border-right:8px solid var(--c-bord)!important;border-top:1px solid #e2e8f0!important;border-bottom:1px solid #e2e8f0!important;border-radius:0!important;}

    .dsg-103 .top-header{background:var(--t-bg);color:var(--t-color);position:relative;padding:6px;text-align:center;border-bottom:3px solid var(--t-bord);}
    .dsg-103 .logo-box{position:absolute;top:6px;left:6px;width:48px;height:36px;background:#fff;border-radius:6px;padding:2px;display:flex;align-items:center;justify-content:center;} 
    .dsg-103 .school-details{padding-left:46px;}
    .dsg-103 .id-card{border-left:8px solid var(--c-bord)!important;border-right:8px solid var(--c-bord)!important;border-top:1px solid #e2e8f0!important;border-bottom:1px solid #e2e8f0!important;border-radius:0!important;}

    .dsg-104 .top-header{background:var(--t-bg);color:var(--t-color);position:relative;padding:6px;text-align:center;border-bottom:3px solid var(--t-bord);}
    .dsg-104 .logo-box{position:absolute;top:6px;left:6px;width:48px;height:36px;background:#fff;border-radius:6px;padding:2px;display:flex;align-items:center;justify-content:center;} 
    .dsg-104 .school-details{padding-left:46px;}
    .dsg-104 .photo-box{transform:rotate(3deg);box-shadow:-2px 2px 0 var(--c-bord);}
    .dsg-104 .id-card{border-left:8px solid var(--c-bord)!important;border-right:8px solid var(--c-bord)!important;border-top:1px solid #e2e8f0!important;border-bottom:1px solid #e2e8f0!important;border-radius:0!important;}

    .dsg-105 .top-header{background:var(--t-bg);color:var(--t-color);position:relative;padding:6px;text-align:center;border-bottom:3px solid var(--t-bord);}
    .dsg-105 .logo-box{position:absolute;top:6px;left:6px;width:48px;height:36px;background:#fff;border-radius:6px;padding:2px;display:flex;align-items:center;justify-content:center;} 
    .dsg-105 .school-details{padding-left:46px;}
    .dsg-105 .photo-box{clip-path:polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%);width:80px!important;height:80px!important;border:none!important;}

    .dsg-106 .top-header{background:var(--t-bg);color:var(--t-color);position:relative;padding:6px;padding-bottom:36px;text-align:center;border:none;border-radius:0 0 50% 50%/0 0 100% 100%;box-shadow:0 4px 10px rgba(0,0,0,.15);}
    .dsg-106 .logo-box{position:absolute;top:6px;left:6px;width:48px;height:36px;background:#fff;border-radius:6px;padding:2px;display:flex;align-items:center;justify-content:center;} 
    .dsg-106 .school-details{padding-left:46px;}
    .dsg-106 .photo-container{margin-top:-28px!important;position:relative;z-index:10;}
    .dsg-106 .photo-box{clip-path:polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%);width:80px!important;height:80px!important;border:none!important;}

    .dsg-107 .top-header{background:var(--t-bg);color:var(--t-color);position:relative;padding:6px;text-align:center;border-bottom:3px solid var(--t-bord);}
    .dsg-107 .logo-box{position:absolute;top:6px;left:6px;width:48px;height:36px;background:#fff;border-radius:6px;padding:2px;display:flex;align-items:center;justify-content:center;} 
    .dsg-107 .school-details{padding-left:46px;}
    .dsg-107 .photo-box{clip-path:polygon(30% 0%,70% 0%,100% 30%,100% 70%,70% 100%,30% 100%,0% 70%,0% 30%);width:78px!important;height:78px!important;border:none!important;}

    .dsg-108 .top-header{background:var(--t-bg);color:var(--t-color);position:relative;padding:6px;padding-bottom:36px;text-align:center;border:none;border-radius:0 0 50% 50%/0 0 100% 100%;box-shadow:0 4px 10px rgba(0,0,0,.15);}
    .dsg-108 .logo-box{position:absolute;top:6px;left:6px;width:48px;height:36px;background:#fff;border-radius:6px;padding:2px;display:flex;align-items:center;justify-content:center;} 
    .dsg-108 .school-details{padding-left:46px;}
    .dsg-108 .photo-container{margin-top:-28px!important;position:relative;z-index:10;}
    .dsg-108 .photo-box{clip-path:polygon(30% 0%,70% 0%,100% 30%,100% 70%,70% 100%,30% 100%,0% 70%,0% 30%);width:78px!important;height:78px!important;border:none!important;}

    /* ============ BASE CARD STYLES ============ */
    body { font-family: 'Roboto', sans-serif; background: #e8edf5; padding: 40px 24px; color: #000; }
    .cards-grid { display: flex; flex-wrap: wrap; gap: 20px; justify-content: center; }
    .id-card-wrap { display: flex; page-break-inside: avoid; break-inside: avoid; }
    .id-card { width: 240px; height: 380px; background: var(--c-bg); border: 4px solid var(--c-bord); border-radius: 12px; position: relative; overflow: hidden; box-shadow: 0 8px 24px rgba(0,0,0,0.15); flex-shrink: 0; transition: all 0.3s; }
    .s-title { font-size: 13.5px; font-weight: 900; color: var(--t-title); letter-spacing: 0.3px; line-height: 1.1; margin-bottom: 2px; }
    .s-addr { font-size: 8.5px; font-weight: 700; color: var(--t-color); opacity: 0.9; line-height: 1.1; }
    .s-phone { font-size: 9.5px; font-weight: 900; color: var(--t-color); margin-top: 2px; }
    .photo-container { display: flex; flex-direction: column; align-items: center; margin-top: 6px; }
    .photo-box { width: 75px; height: 90px; border: 3px solid var(--c-bord); padding: 2px; background: #fff; }
    .student-name-label { margin-top: 5px; font-size: 14px; font-weight: 900; color: var(--name-col); letter-spacing: 0.3px; text-align: center; padding: 0 10px; }
    .details-grid { padding: 0 16px; margin-top: 6px; }
    .d-table { width: 100%; border-collapse: collapse; font-size: 11px; font-weight: 700; color: #000; }
    .d-table td { padding: 1px 0; }
    .d-table td.lbl { width: 55px; color: var(--lbl-col); vertical-align: top; font-weight: 800; }
    .d-table td.sep { width: 10px; text-align: center; vertical-align: top; color: var(--lbl-col); }
    .d-table td.val { color: var(--val-col); vertical-align: top; line-height: 1.2; word-break: break-word; }

    @media print {
      body { background: transparent; padding: 0mm; }
      * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
      .id-card { box-shadow: none; }
      .cards-grid { gap: 8px; zoom: 0.90; }
      .id-card-wrap { gap: 0; }
      @page { margin: 6mm; }
    }
  `;

  const printBarCss = `
    .print-bar { position: sticky; top: 0; z-index: 999; background: rgba(30,58,138,0.95); backdrop-filter: blur(8px); padding: 10px 16px; display: flex; align-items: center; justify-content: space-between; color: #fff; margin: -40px -24px 32px; flex-wrap: wrap; gap: 8px; }
    .print-btn { background: #10b981; color: #fff; border: none; padding: 9px 22px; border-radius: 10px; font-weight: 700; cursor: pointer; }
    .ctrl-select { background: #fff; color: #1e3a8a; border: none; padding: 5px 8px; border-radius: 6px; font-weight: 600; outline: none; cursor: pointer; font-size: 0.8rem; max-width: 220px; }
    .ctrl-label { font-weight: 600; font-size: 0.8rem; margin-left: 10px; }
    @media print { .print-bar { display: none; } }
  `;

  return `<!DOCTYPE html><html><head>
    <meta charset="UTF-8"/>
    <title>Student ID Cards — ${schoolName}</title>
    <style>${css}${printBarCss}</style>
  </head><body id="printBody" class="dsg-1 clr-1">
    <div class="print-bar">
      <div style="display:flex; align-items:center; flex-wrap:wrap; gap:4px;">
        <span style="font-size:1rem; margin-right:10px;"><b>🏫 ${schoolName}</b></span>

        <label class="ctrl-label">📐 Design:</label>
        <select id="designSelect" class="ctrl-select" onchange="applyTheme()">
          <option value="dsg-1">1. Flat • Square</option>
          <option value="dsg-2">2. Curve • Circle</option>
          <option value="dsg-3">3. Diagonal→ • Square</option>
          <option value="dsg-4">4. ←Diagonal • Square</option>
          <option value="dsg-5">5. Chevron • Square</option>
          <option value="dsg-6">6. Wave • Square</option>
          <option value="dsg-7">7. Notch • Square</option>
          <option value="dsg-8">8. Arrow • Square</option>
          <option value="dsg-9">9. Step • Square</option>
          <option value="dsg-10">10. Thick • Square</option>
          <option value="dsg-11">11. Rounded • Square</option>
          <option value="dsg-12">12. Minimal • Square • CtrLogo</option>
          <option value="dsg-13">13. Trapez • Square</option>
          <option value="dsg-14">14. Flat • Circle</option>
          <option value="dsg-15">15. Curve • Circle</option>
          <option value="dsg-16">16. Diagonal→ • Circle</option>
          <option value="dsg-17">17. ←Diagonal • Circle</option>
          <option value="dsg-18">18. Chevron • Circle</option>
          <option value="dsg-19">19. Wave • Circle</option>
          <option value="dsg-20">20. Notch • Circle</option>
          <option value="dsg-21">21. Arrow • Circle</option>
          <option value="dsg-22">22. Step • Circle</option>
          <option value="dsg-23">23. Thick • Circle</option>
          <option value="dsg-24">24. Rounded • Circle</option>
          <option value="dsg-25">25. Minimal • Circle • CtrLogo</option>
          <option value="dsg-26">26. Trapez • Circle</option>
          <option value="dsg-27">27. Flat • Rounded</option>
          <option value="dsg-28">28. Curve • Rounded</option>
          <option value="dsg-29">29. Diagonal→ • Rounded</option>
          <option value="dsg-30">30. ←Diagonal • Rounded</option>
          <option value="dsg-31">31. Chevron • Rounded</option>
          <option value="dsg-32">32. Wave • Rounded</option>
          <option value="dsg-33">33. Notch • Rounded</option>
          <option value="dsg-34">34. Arrow • Rounded</option>
          <option value="dsg-35">35. Step • Rounded</option>
          <option value="dsg-36">36. Thick • Rounded</option>
          <option value="dsg-37">37. Rounded • Rounded</option>
          <option value="dsg-38">38. Minimal • Rounded • CtrLogo</option>
          <option value="dsg-39">39. Trapez • Rounded</option>
          <option value="dsg-40">40. Flat • Square • DblBord</option>
          <option value="dsg-41">41. Curve • Circle • DblBord</option>
          <option value="dsg-42">42. Diagonal→ • Rounded • DblBord</option>
          <option value="dsg-43">43. Flat • Circle • DblBord</option>
          <option value="dsg-44">44. Chevron • Square • DblBord</option>
          <option value="dsg-45">45. Wave • Circle • DblBord</option>
          <option value="dsg-46">46. Thick • Rounded • DblBord</option>
          <option value="dsg-47">47. Rounded • Square • DblBord</option>
          <option value="dsg-48">48. Minimal • Circle • DblBord • CtrLogo</option>
          <option value="dsg-49">49. Flat • Square • Dashed</option>
          <option value="dsg-50">50. Curve • Circle • Dashed</option>
          <option value="dsg-51">51. Flat • Rounded • Dashed</option>
          <option value="dsg-52">52. ←Diagonal • Square • Dashed</option>
          <option value="dsg-53">53. Wave • Circle • Dashed</option>
          <option value="dsg-54">54. Arrow • Rounded • Dashed</option>
          <option value="dsg-55">55. Thick • Square • Dashed</option>
          <option value="dsg-56">56. Minimal • Square • Dashed • CtrLogo</option>
          <option value="dsg-57">57. Flat • Square • LeftBar</option>
          <option value="dsg-58">58. Flat • Circle • LeftBar</option>
          <option value="dsg-59">59. Flat • Rounded • LeftBar</option>
          <option value="dsg-60">60. Thick • Square • LeftBar</option>
          <option value="dsg-61">61. Thick • Rounded • LeftBar</option>
          <option value="dsg-62">62. Flat • Square • LeftBar</option>
          <option value="dsg-63">63. Flat • Circle • LeftBar</option>
          <option value="dsg-64">64. Minimal • Square • LeftBar • CtrLogo</option>
          <option value="dsg-65">65. Flat • Square • TopBar</option>
          <option value="dsg-66">66. Flat • Circle • TopBar</option>
          <option value="dsg-67">67. Flat • Rounded • TopBar</option>
          <option value="dsg-68">68. Flat • Square • TopBar</option>
          <option value="dsg-69">69. Minimal • Square • TopBar • CtrLogo</option>
          <option value="dsg-70">70. Flat • Shadow • TopBar</option>
          <option value="dsg-71">71. Flat • Double • TopBar</option>
          <option value="dsg-72">72. Flat • Square • TopBar</option>
          <option value="dsg-73">73. Flat • Square • BotBar</option>
          <option value="dsg-74">74. Flat • Circle • BotBar</option>
          <option value="dsg-75">75. Flat • Rounded • BotBar</option>
          <option value="dsg-76">76. Flat • Square • BotBar</option>
          <option value="dsg-77">77. Minimal • Square • BotBar • CtrLogo</option>
          <option value="dsg-78">78. Flat • Shadow • BotBar</option>
          <option value="dsg-79">79. Flat • Square • Sharp</option>
          <option value="dsg-80">80. Thick • Square • Sharp</option>
          <option value="dsg-81">81. Flat • Tilt+ • Sharp</option>
          <option value="dsg-82">82. Flat • Tilt- • Sharp</option>
          <option value="dsg-83">83. Diagonal→ • Square • Sharp</option>
          <option value="dsg-84">84. ←Diagonal • Square • Sharp</option>
          <option value="dsg-85">85. Flat • Circle • Pill</option>
          <option value="dsg-86">86. Flat • Rounded • Pill</option>
          <option value="dsg-87">87. Flat • Square • Pill</option>
          <option value="dsg-88">88. Minimal • Circle • Pill • CtrLogo</option>
          <option value="dsg-89">89. Flat • Square • Outline</option>
          <option value="dsg-90">90. Flat • Circle • Outline</option>
          <option value="dsg-91">91. Flat • Rounded • Outline</option>
          <option value="dsg-92">92. Thick • Square • Outline</option>
          <option value="dsg-93">93. Flat • Square • Outline</option>
          <option value="dsg-94">94. Minimal • Square • Outline • CtrLogo</option>
          <option value="dsg-95">95. Flat • Square • Ridge</option>
          <option value="dsg-96">96. Flat • Circle • Ridge</option>
          <option value="dsg-97">97. Flat • Square • Groove</option>
          <option value="dsg-98">98. Flat • Circle • Groove</option>
          <option value="dsg-99">99. Flat • Square • SideBars</option>
          <option value="dsg-100">100. Flat • Circle • SideBars</option>
          <option value="dsg-101">101. Flat • Rounded • SideBars</option>
          <option value="dsg-102">102. Thick • Square • SideBars</option>
          <option value="dsg-103">103. Flat • Square • SideBars</option>
          <option value="dsg-104">104. Flat • Tilt+ • SideBars</option>
          <option value="dsg-105">105. Flat • Hexagon</option>
          <option value="dsg-106">106. Curve • Hexagon</option>
          <option value="dsg-107">107. Flat • Octagon</option>
          <option value="dsg-108">108. Curve • Octagon</option>
        </select>

        <label class="ctrl-label">🎨 Color:</label>
        <select id="colorSelect" class="ctrl-select" onchange="applyTheme()">
          <option value="clr-1">Royal Blue</option>
          <option value="clr-2">Emerald & Gold</option>
          <option value="clr-3">Ruby Pink</option>
          <option value="clr-4">Midnight Dark</option>
          <option value="clr-5">Purple Gradient</option>
          <option value="clr-6">Slate & Orange</option>
          <option value="clr-7">Sunset Vibrant</option>
          <option value="clr-8">Teal Glass</option>
          <option value="clr-9">Crimson Red</option>
          <option value="clr-10">Ocean Blue</option>
          <option value="clr-11">Royal Purple</option>
          <option value="clr-12">Forest Green</option>
          <option value="clr-13">Amber Brown</option>
          <option value="clr-14">Indigo Night</option>
          <option value="clr-15">Rose Pink</option>
          <option value="clr-16">Mint Emerald</option>
          <option value="clr-17">Magenta Fuchsia</option>
          <option value="clr-18">Classic Charcoal</option>
          <option value="clr-19">Deep Orange</option>
          <option value="clr-20">Sky Cyan</option>
        </select>
      </div>
      <button class="print-btn" onclick="window.print()">🖨 Print IDs</button>
    </div>
    <div class="cards-grid">${frontCards}</div>
    <script>
      function applyTheme() {
        var d = document.getElementById('designSelect').value;
        var c = document.getElementById('colorSelect').value;
        document.getElementById('printBody').className = d + ' ' + c;
        localStorage.setItem('idDesign', d);
        localStorage.setItem('idColor', c);
      }
      var savedD = localStorage.getItem('idDesign');
      var savedC = localStorage.getItem('idColor');
      if(savedD) { document.getElementById('designSelect').value = savedD; }
      if(savedC) { document.getElementById('colorSelect').value = savedC; }
      if(savedD || savedC) { applyTheme(); }
    <\/script>
  </body></html>`;
}





// === INTERCEPT printDocumentByModule to use new ID card generator ===
// We patch the function after page load
// patchApp runs via DOMContentLoaded (or immediately if already loaded)
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => { setTimeout(patchApp, 200); });
} else {
  setTimeout(patchApp, 200);
}

function patchApp() {
  // Patch nav render
  if (typeof renderAll === 'function') {
    const _origRenderAll = renderAll;
    window.renderAll = function() {
      _origRenderAll();
      renderNavEnhanced();
      // Also enhance stats
      const store = getStore();
      if (store && Object.keys(store).length) renderStatCardsEnhanced(store);
    };
  }

  // Patch captureFace to add live log entry
  if (typeof captureFace === 'function') {
    const _origCaptureFace = captureFace;
    window.captureFace = async function() {
      await _origCaptureFace();
      if (window.latestDescriptor) {
        const name = document.getElementById('faceTargetName')?.value || 'Unknown';
        addLiveLog(name, 0.95, 'Captured');
      }
    };
  }

  // Patch markFaceAttendance to show toast + live log
  if (typeof markFaceAttendance === 'function') {
    const _origMark = markFaceAttendance;
    window.markFaceAttendance = async function() {
      try {
        await _origMark();
        const name = document.getElementById('faceTargetName')?.value || 'Student';
        showToast(`✅ Attendance marked for ${name}`, 'success');
        addLiveLog(name, 0.93, document.getElementById('faceStatus')?.value || 'Present');
      } catch(e) {
        showToast(e.message || 'Error marking attendance', 'error');
        throw e;
      }
    };
  }

  // Re-render nav once
  renderNavEnhanced();

  // Patch printDocumentByModule
  if (typeof printDocumentByModule === 'function') {
    const _origPrint = printDocumentByModule;
    window.printDocumentByModule = function() {
      if (currentModule === 'students') {
        const store = getStore();
        // generateIdCardsHTML now returns a full HTML document
        const fullHtml = generateIdCardsHTML(store);
        const w = window.open('', '_blank');
        if (!w) return window.alert('Popup blocked. Please allow popups.');
        w.document.open();
        w.document.write(fullHtml);
        w.document.close();
        showToast('🖨 Opening ID cards for print…', 'info');
      } else {
        _origPrint();
      }
    };
  }
  // ── LIVE UPDATE POLLING ──
  // Automatically refresh the UI if data changes on the server
  setInterval(async () => {
    // Only poll if the tab is active and user is not currently typing/selecting
    if (document.visibilityState === 'visible') {
      const activeEl = document.activeElement;
      const isUserTyping = activeEl && (
        activeEl.tagName === 'INPUT' || 
        activeEl.tagName === 'SELECT' || 
        activeEl.tagName === 'TEXTAREA' || 
        activeEl.classList.contains('ts-control') ||
        activeEl.closest('.ts-wrapper')
      );
      
      if (isUserTyping) return;

      const oldStoreStr = JSON.stringify(getStore());
      try {
        await loadStore();
        const newStoreStr = JSON.stringify(getStore());
        
        if (oldStoreStr !== newStoreStr) {
          console.log('[Live Update] Data changed on server, refreshing UI…');
          renderAll();
          // Optional: subtle toast or indicator could go here
        }
      } catch (err) {
        console.warn('[Live Update] Poll failed:', err.message);
      }
    }
  }, 8000); // Faster interval for more responsive feel
}

// Also patch startCamera to show toast
const _rawStartCamera = typeof startCamera === 'function' ? startCamera : null;
// patchApp() is already called via DOMContentLoaded above — only show the welcome toast here
window.addEventListener('load', () => {
  setTimeout(() => {
    showToast('Welcome to EduCore 🏫', 'info', 2500);
  }, 600);
});

// ================================================================
// AI FACE RECOGNITION ENGINE v2 — EduCore Enhanced
// ================================================================
// Improvements over baseline:
//  1. Multi-sample enrollment (3 captures averaged → reduces noise)
//  2. Weighted Ensemble Scoring (cosine + euclidean distance + confidence boost)
//  3. Liveness / anti-spoof check (motion delta between frames)
//  4. Real-time bounding box overlay with name + confidence bar on canvas
//  5. Adaptive threshold (auto-tightens after repeated false positives)
//  6. Face quality gate (reject blur, too-dark, too-small frames)
//  7. Smart cooldown — per-person, not global
//  8. Descriptors are averaged when multiple enrollments exist
// ================================================================
// Using InsightFace AI for face detection
const AI_FACE_VERSION = 4;          // 4 = InsightFace Engine (512D embeddings)
const MULTI_SAMPLE_COUNT = 3;       // captures averaged per enrollment

// State
let aiEnrollBuffer = [];      // accumulates descriptors during multi-sample enrollment
let aiEnrolling = false;
let aiBBoxAnimFrame = null;   // requestAnimationFrame handle for overlay

// ── Real-time bounding box + name overlay on canvas ─────────────
// For LOCAL camera only: uses rAF for video frame draw + throttled detection
let bboxDetectBusy = false;
let bboxLastDetections = [];
let bboxDetectTimer = null;

async function startBBoxOverlay() {
  if (aiBBoxAnimFrame) cancelAnimationFrame(aiBBoxAnimFrame);
  if (bboxDetectTimer) { clearTimeout(bboxDetectTimer); bboxDetectTimer = null; }
  bboxLastDetections = [];
  bboxDetectBusy = false;

  if (ipCamMode) return; // IP cam uses startIpCamOverlay() instead

  const video  = refs.faceVideo;
  const canvas = refs.faceCanvas;
  if (!canvas || !video) return;
  const ctx = canvas.getContext('2d', { willReadFrequently: false });
  let canvasSized = false;

  // Lightweight loop: just draw video frame to canvas at ~30fps. No AI here.
  const drawFrame = () => {
    if (ipCamMode || !video.srcObject) {
      aiBBoxAnimFrame = requestAnimationFrame(drawFrame);
      return;
    }
    if (!canvasSized || canvas.width !== (video.videoWidth || 640)) {
      canvas.width  = video.videoWidth  || 640;
      canvas.height = video.videoHeight || 480;
      canvasSized = true;
    }
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Draw any cached detection boxes (populated by on-demand detection)
    bboxLastDetections.forEach(det => {
      const b = det.box;
      if (!b) return;
      const box = { x: b[0], y: b[1], width: b[2], height: b[3] };
      if (box.width < QUALITY_MIN_BOX_SIZE) return;
      const desc = det.embedding;
      if (!desc) return;
      const targetType = refs.faceTargetType?.value || 'students';
      const minConf = parseFloat(refs.autoMinConfidence?.value || '0.65');
      const match = findBestFaceMatch(desc, targetType, minConf);
      const score = match ? match.score : 0;
      const name  = match ? match.name : 'Unknown';
      const color = match ? (score >= 0.65 ? '#10b981' : score >= 0.55 ? '#f59e0b' : '#f97316') : '#ef4444';
      ctx.strokeStyle = color; ctx.lineWidth = 2.5;
      ctx.strokeRect(box.x, box.y, box.width, box.height);
      const label = match ? `${name}  ${(score*100).toFixed(1)}%` : 'Unknown';
      ctx.font = 'bold 13px sans-serif';
      const tw = ctx.measureText(label).width + 16;
      const lx = box.x, ly = box.y > 28 ? box.y - 26 : box.y + box.height + 4;
      ctx.fillStyle = color; ctx.beginPath(); ctx.roundRect(lx, ly, tw, 22, 5); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.fillText(label, lx+8, ly+15);
    });
    aiBBoxAnimFrame = requestAnimationFrame(drawFrame);
  };
  aiBBoxAnimFrame = requestAnimationFrame(drawFrame);
  // NOTE: No background AI detection loop here. AI runs only on-demand
  // (Capture Face, Enroll, Auto-Capture timer) to keep camera smooth.
}

// Stop overlay
function stopBBoxOverlay() {
  if (aiBBoxAnimFrame) { cancelAnimationFrame(aiBBoxAnimFrame); aiBBoxAnimFrame = null; }
}

// ── Multi-sample enrollment UI ──────────────────────────────────
function startMultiSampleEnroll(name, tag, targetType = 'students') {
  aiEnrollBuffer = [];
  aiEnrollTarget = { name, tag, targetType };
  aiEnrolling    = true;
  updateEnrollUI();
  showToast(`Multi-sample enrollment started for ${name}. Capture ${MULTI_SAMPLE_COUNT} poses.`, 'info', 4000);
}

function updateEnrollUI() {
  const btn = document.getElementById('enrollFaceBtn');
  if (!btn) return;
  if (aiEnrolling) {
    btn.textContent = `📸 Capture ${aiEnrollBuffer.length + 1}/${MULTI_SAMPLE_COUNT}`;
    btn.style.background = '#f59e0b';
  } else {
    btn.textContent = '👤 Enroll Face';
    btn.style.background = '';
  }
}

async function captureEnrollSample() {
  if (!aiEnrolling || !aiEnrollTarget) return;
  const ready = await ensureFaceModelsLoaded();
  if (!ready) return showToast('Face models not loaded yet', 'error');

  // Pause background detection loops to avoid face-api.js contention
  if (bboxDetectTimer) { clearTimeout(bboxDetectTimer); bboxDetectTimer = null; }
  if (ipCamDetectTimer) { clearTimeout(ipCamDetectTimer); ipCamDetectTimer = null; }

  // Use correct source: proxy for IP cam, video for local
  let detectSource;
  if (ipCamMode) {
    detectSource = await getDetectSource(); // fetches via server proxy — no CORS issues
    if (!detectSource) {
      showToast('Could not get IP camera frame. Check connection.', 'error');
      return;
    }
  } else {
    detectSource = refs.faceVideo;
    if (!refs.faceVideo.srcObject) {
      showToast('Start camera first.', 'warning');
      return;
    }
  }

  try {
    // Run detection on-demand via Python InsightFace backend
    const result = await getInsightFace(detectSource);
    const det = result.face && result.face.length > 0 ? result.face[0] : null;

    if (!det) {
      showToast('No face detected. Make sure your face is centred and well-lit.', 'warning');
      return;
    }
    
    // Human absolute box check: [x,y,w,h]. Check box[2] for width.
    const b = det.box;
    if (b[2] < 40) {
      showToast('Face too small — move closer to the camera.', 'warning');
      return;
    }

    aiEnrollBuffer.push(det.embedding);
    showToast(`Sample ${aiEnrollBuffer.length}/${MULTI_SAMPLE_COUNT} captured ✓`, 'success', 1800);
    updateEnrollUI();

    if (aiEnrollBuffer.length >= MULTI_SAMPLE_COUNT) {
      await finaliseEnrollment();
    }
  } catch (err) {
    console.error('Enrollment capture error:', err);
    showToast('Detection error: ' + err.message, 'error');
  } finally {
    // Resume background detection only after full enrollment is done
    setTimeout(() => {
      if (!aiEnrolling) startBBoxOverlay();
    }, 500);
  }
}

// ── Average multiple 1024D descriptors ─────────────────────────
function averageDescriptors(descs) {
  if (!descs || !descs.length) return null;
  const len = descs[0].length;
  const avg = new Array(len).fill(0);
  descs.forEach(d => { for (let i = 0; i < len; i++) avg[i] += d[i]; });
  for (let i = 0; i < len; i++) avg[i] /= descs.length;
  return avg;
}

async function finaliseEnrollment() {
  const { name, tag, targetType } = aiEnrollTarget;
  const avgDesc = averageDescriptors(aiEnrollBuffer);
  const faceStore = getFaceStore();
  const key = `${targetType || 'students'}|${name}`;

  faceStore[key] = {
    descriptor:    avgDesc,   // keep for compat
    avgDescriptor: avgDesc,   // enhanced averaged version
    name, tag, targetType,
    enrolledAt: new Date().toISOString(),
    sampleCount: MULTI_SAMPLE_COUNT,
    aiVersion: AI_FACE_VERSION
  };
  saveFaceStore(faceStore);

  // Persist to server
  try {
    await api('/api/modules/faceEmbeddings', {
      method: 'POST',
      body: JSON.stringify({
        targetType: targetType || 'students', name, tag,
        descriptorJson: JSON.stringify(avgDesc)
      })
    });
  } catch(e) { console.warn('Server persist failed:', e.message); }

  aiEnrolling    = false;
  aiEnrollBuffer = [];
  aiEnrollTarget = null;
  updateEnrollUI();

  window.latestDescriptor = avgDesc;
  if (refs.faceTargetName) refs.faceTargetName.value = name;

  showToast(`✅ Face enrolled for ${name} (${MULTI_SAMPLE_COUNT} samples averaged)`, 'success', 4000);
  addLiveLog(name, 0.99, 'Enrolled');

  // Update live status
  if (refs.faceStatusText)
    refs.faceStatusText.textContent = `Multi-sample enrollment complete for ${name}.`;
}

// ── Override enrollFaceBtn to use multi-sample ──────────────────
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(patchFaceAI, 400);
});

function patchFaceAI() {
  const enrollBtn = document.getElementById('enrollFaceBtn');
  if (enrollBtn) {
    // Remove old listeners by cloning
    const newBtn = enrollBtn.cloneNode(true);
    enrollBtn.parentNode.replaceChild(newBtn, enrollBtn);
    refs.enrollFaceBtn = newBtn;

    newBtn.addEventListener('click', async () => {
      if (aiEnrolling) {
        // Mid-enrollment: capture next sample
        await captureEnrollSample();
        return;
      }
      const selectedName = refs.faceEnrollStudentSelect?.value;
      if (!selectedName) return window.alert('Select a person first.');
      const store = getStore();
      const isTeachers = currentModule === "teachers" || refs.faceTargetType?.value === "teachers";
      const people = isTeachers ? (store.teachers || []) : (store.students || []);
      const person = people.find(s => s.fullName === selectedName);
      
      if (!refs.faceVideo?.srcObject) await startCamera();
      startMultiSampleEnroll(selectedName, person?.className || person?.department || '', isTeachers ? 'teachers' : 'students');
      // capture first sample immediately
      await captureEnrollSample();
    });
  }

  // Patch startCamera to also kick off bbox overlay
  const origStartCamera = window.startCamera || startCamera;
  window.startCamera = async function() {
    await origStartCamera();
    // Start models load in background for faster first detection
    ensureFaceModelsLoaded().then(() => {
      startBBoxOverlay();
      showToast('🎯 AI face overlay active', 'success', 2000);
    });
  };

  // Hook startCameraBtn
  const camBtn = document.getElementById('startCameraBtn');
  if (camBtn) {
    const nc = camBtn.cloneNode(true);
    camBtn.parentNode.replaceChild(nc, camBtn);
    nc.addEventListener('click', () => window.startCamera().catch(e => showToast(e.message, 'error')));
  }

  // Patch autoCaptureTick to use new AI engine (which simplifies the logic)
  const _origTick = window.autoCaptureTick || autoCaptureTick;
  window.autoCaptureTick = async function() {
    if (!refs.autoCaptureToggle?.checked) return;
    if (window.autoCaptureBusy) return;

    // Check camera is ready
    const localReady = !ipCamMode && refs.faceVideo?.srcObject;
    const ipReady    =  ipCamMode && refs.ipCameraImg?.naturalWidth > 0;
    if (!localReady && !ipReady) return;

    await _origTick();
  };

  // ── IP cam freeze watchdog ─────────────────────────────────────
  // MJPEG streams can freeze. Detect by checking if naturalWidth is still 0
  // after a few seconds, and reload the src to unfreeze.
  let ipWatchdogLastGoodTime = Date.now();
  let ipWatchdogPrevSrc = '';
  setInterval(() => {
    if (!ipCamMode || !refs.ipCameraImg) return;
    const src = refs.ipCameraImg.src;
    if (!src || src === ipWatchdogPrevSrc) return;
    ipWatchdogPrevSrc = src;

    // Track if image is delivering frames
    if (refs.ipCameraImg.naturalWidth > 0) {
      ipWatchdogLastGoodTime = Date.now();
    } else if (Date.now() - ipWatchdogLastGoodTime > 8000) {
      // Frozen for 8s — reload
      console.warn('[IPCam] Stream appears frozen, reloading...');
      const url = refs.ipCameraUrl?.value?.trim();
      if (url) {
        const isSnapshot = /\.(jpg|jpeg|png|bmp)(\?|$)/i.test(url);
        refs.ipCameraImg.src = isSnapshot
          ? url + (url.includes('?') ? '&' : '?') + 't=' + Date.now()
          : url + (url.includes('?') ? '&' : '?') + '_r=' + Date.now();
        ipWatchdogLastGoodTime = Date.now();
        if (refs.faceStatusText) refs.faceStatusText.textContent = '🔄 IP camera reconnecting…';
      }
    }
  }, 3000);

  // Add AI status panel to face panel
  addAIStatusPanel();
}

// ── AI Status Panel ─────────────────────────────────────────────
function addAIStatusPanel() {
  const facePanel = document.getElementById('facePanel');
  if (!facePanel || document.getElementById('aiStatusPanel')) return;

  const panel = document.createElement('div');
  panel.id = 'aiStatusPanel';
  panel.style.cssText = `
    margin: 0 20px 16px;
    background: rgba(16,185,129,0.08);
    border: 1px solid rgba(16,185,129,0.25);
    border-radius: 10px;
    padding: 12px 16px;
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: center;
    font-size: 0.78rem;
    color: rgba(255,255,255,0.75);
  `;
  panel.innerHTML = `
    <span style="display:flex;align-items:center;gap:6px;">
      <span style="width:8px;height:8px;border-radius:50%;background:#10b981;display:inline-block;"></span>
      <strong style="color:#10b981">InsightFace Engine</strong>
    </span>
    <span>🎯 High-precision similarity matching (512D)</span>
    <span>📸 Multi-sample enrollment (${MULTI_SAMPLE_COUNT} poses)</span>
    <span id="personaBadge" onclick="cyclePersona()" style="cursor:pointer; background:rgba(245,158,11,0.15); padding:3px 12px; border-radius:12px; color:#f59e0b; font-weight:700; transition:all 0.3s; border:1px solid rgba(245,158,11,0.3); display:inline-flex; align-items:center; gap:5px; user-select:none;" title="Click to change character">
      🎭 Voice: ${VOICE_PERSONAS[activePersonaIndex].label}
    </span>
    <button onclick="testActiveVoice()" style="background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.15); color:#fff; border-radius:10px; padding:3px 10px; font-size:0.65rem; font-weight:600; cursor:pointer; transition:all 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.2)'" onmouseout="this.style.background='rgba(255,255,255,0.1)'">
      📢 Test Voice
    </button>
    <span id="aiEnrolledCount" style="margin-left:auto;background:rgba(16,185,129,0.15);padding:3px 10px;border-radius:12px;color:#10b981;font-weight:700;">
      ${Object.keys(getFaceStore()).length} enrolled
    </span>
  `;

  // Insert before faceAutoControls (only if it's a direct child of facePanel)
  const autoCtrl = document.getElementById('faceAutoControls');
  if (autoCtrl && autoCtrl.parentNode === facePanel) {
    facePanel.insertBefore(panel, autoCtrl);
  } else {
    facePanel.appendChild(panel);
  }
}

// Refresh enrolled count periodically
setInterval(() => {
  const el = document.getElementById('aiEnrolledCount');
  if (el) el.textContent = `${Object.keys(getFaceStore()).length} enrolled`;
}, 3000);

// ── Auto-start overlay when auto-capture is toggled on ──────────
const _origAutoToggle = document.getElementById('autoCaptureToggle');
if (_origAutoToggle) {
  _origAutoToggle.addEventListener('change', () => {
    if (_origAutoToggle.checked && refs.faceVideo?.srcObject && faceModelsReady) {
      startBBoxOverlay();
    } else if (!_origAutoToggle.checked) {
      stopBBoxOverlay();
    }
  });
}

// Final Voice Warm-up: ensure premium voices are ready for first arrival
if (window.speechSynthesis) {
  window.speechSynthesis.getVoices();
  if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
  }
}

console.log('[EduCore AI] Face Recognition Engine v2 loaded ✓');

// ── CanvasRenderingContext2D.roundRect polyfill ─────────────────
if (!CanvasRenderingContext2D.prototype.roundRect) {
  CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, r) {
    r = Math.min(r || 0, w / 2, h / 2);
    this.beginPath();
    this.moveTo(x + r, y);
    this.lineTo(x + w - r, y);
    this.arcTo(x + w, y, x + w, y + r, r);
    this.lineTo(x + w, y + h - r);
    this.arcTo(x + w, y + h, x + w - r, y + h, r);
    this.lineTo(x + r, y + h);
    this.arcTo(x, y + h, x, y + h - r, r);
    this.lineTo(x, y + r);
    this.arcTo(x, y, x + r, y, r);
    this.closePath();
    return this;
  };
}

/* ============================================================
 *  FINANCE & INVESTMENT MODULE — merged into app.js
 *  All data is persisted to the server via the api() function.
 * ============================================================ */
(function () {
  "use strict";

  const INVEST_KEY = "schoolInvestments";
  const EXPENSE_KEY = "schoolExpenses";
  const INCOME_KEY = "schoolIncome";



  /* ─── HELPERS ─────────────────────────────────────────────── */
  function fmt(n) { return "₹ " + (Number(n) || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 }); }
  function fmtK(n) {
    const v = Number(n) || 0;
    if (v >= 1e7) return "₹" + (v / 1e7).toFixed(2) + "Cr";
    if (v >= 1e5) return "₹" + (v / 1e5).toFixed(2) + "L";
    if (v >= 1e3) return "₹" + (v / 1e3).toFixed(1) + "K";
    return "₹" + v;
  }
  function isAdmin() {
    // Use the global currentUser set by auth, not fragile badge-text parsing
    if (typeof currentUser !== "undefined" && currentUser) {
      const role = String(currentUser.role || "").toLowerCase();
      return role === "administrator" || role === "principal";
    }
    // Fallback: read badge text (defensive for edge cases)
    try {
      const badge = document.getElementById("activeUserBadge")?.textContent || "";
      return badge.toLowerCase().includes("admin") ||
             badge.toLowerCase().includes("administrator") ||
             badge.toLowerCase().includes("principal");
    } catch { return false; }
  }
  function finTodayStr() { return new Date().toISOString().slice(0, 10); }
  function getFinStore() { return serverStore || {}; }

  /* ─── FINANCIAL CALCULATIONS ──────────────────────────────── */
  function calcFinancials(dateFrom, dateTo) {
    const store = getFinStore();
    const incomes = (store[INCOME_KEY] || []).filter(r => (!dateFrom || r.date >= dateFrom) && (!dateTo || r.date <= dateTo));
    const expenses = (store[EXPENSE_KEY] || []).filter(r => (!dateFrom || r.date >= dateFrom) && (!dateTo || r.date <= dateTo));
    // Only count fee payments from the fees module if there are NO schoolIncome entries
    // with category "Fees" in the same period (avoid double-counting when income records include fee entries)
    const hasFeeIncomeEntries = incomes.some(r => r.category === "Fees");
    const feePaid = hasFeeIncomeEntries ? [] :
      (store.fees || []).filter(r => (!dateFrom || (r.paymentDate || "") >= dateFrom) && (!dateTo || (r.paymentDate || "") <= dateTo));
    const feeIncome = feePaid.reduce((s, r) => s + (Number(r.paidAmount) || 0), 0);
    const otherIncome = incomes.reduce((s, r) => s + (Number(r.amount) || 0), 0);
    const totalIncome = feeIncome + otherIncome;
    const totalExpense = expenses.reduce((s, r) => s + (Number(r.amount) || 0), 0);
    const invested = (store[INVEST_KEY] || []).filter(r => r.status === "Active").reduce((s, r) => s + (Number(r.amount) || 0), 0);
    const payroll = (store.payroll || []).reduce((s, r) => s + (Number(r.netPay) || 0), 0);
    return { totalIncome, totalExpense, feeIncome, otherIncome, invested, payroll, balance: totalIncome - totalExpense };
  }

  function getDayWise(dateFrom, dateTo) {
    const store = getFinStore();
    const days = {};
    const addDay = (date, income, expense) => {
      if (!date) return;
      if (!days[date]) days[date] = { income: 0, expense: 0 };
      days[date].income += income;
      days[date].expense += expense;
    };
    (store[INCOME_KEY] || []).forEach(r => { if ((!dateFrom || r.date >= dateFrom) && (!dateTo || r.date <= dateTo)) addDay(r.date, Number(r.amount) || 0, 0); });
    // Only add fees module data if schoolIncome has no "Fees" category entries in this period (avoid double-counting)
    const hasFeeIncomeEntries = (store[INCOME_KEY] || []).some(r => r.category === "Fees" && (!dateFrom || r.date >= dateFrom) && (!dateTo || r.date <= dateTo));
    if (!hasFeeIncomeEntries) {
      (store.fees || []).forEach(r => { const d = r.paymentDate; if (d && (!dateFrom || d >= dateFrom) && (!dateTo || d <= dateTo)) addDay(d, Number(r.paidAmount) || 0, 0); });
    }
    (store[EXPENSE_KEY] || []).forEach(r => { if ((!dateFrom || r.date >= dateFrom) && (!dateTo || r.date <= dateTo)) addDay(r.date, 0, Number(r.amount) || 0); });
    return Object.entries(days).sort((a, b) => a[0].localeCompare(b[0])).map(([date, v]) => ({ date, ...v, balance: v.income - v.expense }));
  }

  /* ─── DASHBOARD BALANCE CARD ──────────────────────────────── */
  function injectDashboardCard() {
    if (currentModule !== "dashboard") return;
    const grid = document.getElementById("statsCards");
    if (!grid) return;
    document.querySelectorAll(".finance-injected-card").forEach(el => el.remove());
    const { totalIncome, totalExpense, balance, invested } = calcFinancials("2020-01-01", finTodayStr());
    const card = document.createElement("div");
    card.className = "stat-card finance-injected-card";
    card.style.cssText = `background:linear-gradient(135deg,#0f4c75 0%,#1b6ca8 50%,#118ab2 100%);border:1px solid rgba(255,255,255,0.2);color:#fff;cursor:pointer;position:relative;overflow:hidden;`;
    card.innerHTML = `
      <div style="position:absolute;top:-20px;right:-20px;width:100px;height:100px;background:rgba(255,255,255,0.05);border-radius:50%;"></div>
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
        <span style="font-size:1.4rem;">🏦</span>
        <span style="font-size:0.75rem;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;opacity:0.8;">School Balance</span>
      </div>
      <div style="font-size:1.6rem;font-weight:800;margin:4px 0;">${fmtK(balance)}</div>
      <div style="font-size:0.7rem;opacity:0.75;margin-bottom:6px;">Total Income: ${fmtK(totalIncome)} &nbsp;|&nbsp; Expenses: ${fmtK(totalExpense)}</div>
      <div style="display:flex;gap:8px;align-items:center;">
        <span style="background:rgba(255,255,255,0.15);border-radius:20px;padding:2px 10px;font-size:0.68rem;font-weight:700;">💼 Invested: ${fmtK(invested)}</span>
        ${isAdmin() ? `<span style="background:#fbbf24;color:#1a1a1a;border-radius:20px;padding:2px 10px;font-size:0.68rem;font-weight:700;">Admin View</span>` : ""}
      </div>`;
    card.title = "Click to open Finance Module";
    card.addEventListener("click", openFinanceModule);
    grid.prepend(card);
  }

  /* ─── MODAL STATE & CREATION ──────────────────────────────── */
  let financeModal = null;
  // Indian fiscal year starts April 1; if current month is Jan/Feb/Mar, start year is previous calendar year
  const _now = new Date();
  const _fiscalStartYear = _now.getMonth() < 3 ? _now.getFullYear() - 1 : _now.getFullYear();
  // Compute this-month start so default dateFrom/dayFilter are consistent
  const _initNow = new Date();
  const _initMonthStart = `${_initNow.getFullYear()}-${String(_initNow.getMonth()+1).padStart(2,"0")}-01`;
  let financeState = {
    view: "overview",
    dateFrom: `${_fiscalStartYear}-04-01`,
    dateTo: finTodayStr(),
    dayFilter: "thisYear",
    investTab: "active",
    // Caches user-typed form values so delete/re-render doesn't wipe them
    formValues: {},
  };

  // Save current form field values into financeState.formValues before any re-render
  function saveFormValues(content) {
    if (!content) return;
    const fields = ["inv_title","inv_amount","inv_return","inv_bank","inv_maturity","inv_notes","inv_start","inv_category",
                    "inc_date","inc_source","inc_category","inc_amount","inc_mode","inc_desc",
                    "exp_date","exp_head","exp_category","exp_amount","exp_mode","exp_desc"];
    fields.forEach(id => {
      const el = content.querySelector(`#${id}`);
      if (el && el.value !== undefined) financeState.formValues[id] = el.value;
    });
  }

  // Restore saved form values after re-render, then clear the cache
  function restoreFormValues(content) {
    if (!content) return;
    Object.entries(financeState.formValues).forEach(([id, val]) => {
      const el = content.querySelector(`#${id}`);
      if (el) el.value = val;
    });
  }

  // Hard-clear all investment form fields in DOM (defeats browser autofill on re-render)
  function clearInvestForm(content) {
    if (!content) return;
    ["#inv_title","#inv_amount","#inv_return","#inv_bank","#inv_maturity","#inv_notes"].forEach(sel => {
      const el = content.querySelector(sel); if (el) { el.value = ""; el.removeAttribute("readonly"); }
    });
    const startEl = content.querySelector("#inv_start"); if (startEl) startEl.value = finTodayStr();
    // Clear cached values for investment form so they don't get restored
    ["inv_title","inv_amount","inv_return","inv_bank","inv_maturity","inv_notes","inv_start"].forEach(k => delete financeState.formValues[k]);
  }

  function openFinanceModule() {
    if (!financeModal) createFinanceModal();
    financeModal.style.display = "flex";
    document.body.style.overflow = "hidden";
    renderFinanceContent();
  }

  function closeFinanceModule() {
    if (financeModal) financeModal.style.display = "none";
    document.body.style.overflow = "";
  }

  function createFinanceModal() {
    financeModal = document.createElement("div");
    financeModal.id = "financeModuleModal";
    financeModal.style.cssText = `position:fixed;inset:0;z-index:9999;display:none;align-items:stretch;justify-content:flex-end;background:rgba(10,15,30,0.7);backdrop-filter:blur(4px);`;
    financeModal.innerHTML = `
      <div id="financePanel" style="width:min(96vw,1100px);height:100vh;background:#0f172a;overflow-y:auto;box-shadow:-12px 0 60px rgba(0,0,0,0.5);display:flex;flex-direction:column;">
        <div style="background:linear-gradient(135deg,#0f4c75,#1b6ca8);padding:20px 28px;display:flex;align-items:center;justify-content:space-between;flex-shrink:0;">
          <div>
            <div style="color:rgba(255,255,255,0.7);font-size:0.72rem;text-transform:uppercase;letter-spacing:0.12em;margin-bottom:4px;">Tapowan Public School</div>
            <div style="color:#fff;font-size:1.4rem;font-weight:800;letter-spacing:-0.01em;">💰 Finance & Investment Centre</div>
          </div>
          <button id="financeCloseBtn" style="background:rgba(255,255,255,0.12);border:none;color:#fff;width:36px;height:36px;border-radius:50%;font-size:1.2rem;cursor:pointer;display:flex;align-items:center;justify-content:center;">✕</button>
        </div>
        <div id="financeNavTabs" style="background:#0d1b2e;padding:0 28px;display:flex;gap:4px;border-bottom:1px solid rgba(255,255,255,0.07);flex-shrink:0;overflow-x:auto;"></div>
        <div id="financeContent" style="flex:1;padding:24px 28px;overflow-y:auto;"></div>
      </div>`;
    document.body.appendChild(financeModal);
    financeModal.addEventListener("click", e => { if (e.target === financeModal) closeFinanceModule(); });
    financeModal.querySelector("#financeCloseBtn").addEventListener("click", closeFinanceModule);

    const tabs = [
      { key: "overview", icon: "📊", label: "Overview" },
      { key: "daywise", icon: "📅", label: "Day-wise" },
      { key: "investments", icon: "💼", label: "Investments" },
      { key: "income", icon: "⬆️", label: "Income" },
      { key: "expenses", icon: "⬇️", label: "Expenses" },
    ];
    const navTabs = financeModal.querySelector("#financeNavTabs");
    tabs.forEach(t => {
      const btn = document.createElement("button");
      btn.dataset.tab = t.key;
      btn.style.cssText = `background:none;border:none;color:rgba(255,255,255,0.55);cursor:pointer;padding:14px 18px;font-size:0.82rem;font-weight:600;white-space:nowrap;border-bottom:2px solid transparent;transition:all .2s;`;
      btn.innerHTML = `${t.icon} ${t.label}`;
      btn.addEventListener("click", () => { financeState.view = t.key; renderFinanceContent(); });
      navTabs.appendChild(btn);
    });
  }

  function renderFinanceContent() {
    if (!financeModal) return;
    financeModal.querySelectorAll("#financeNavTabs button").forEach(b => {
      const active = b.dataset.tab === financeState.view;
      b.style.color = active ? "#38bdf8" : "rgba(255,255,255,0.55)";
      b.style.borderBottomColor = active ? "#38bdf8" : "transparent";
    });
    const content = financeModal.querySelector("#financeContent");
    // Save any form values the user may have typed before we wipe innerHTML
    saveFormValues(content);
    switch (financeState.view) {
      case "overview": content.innerHTML = renderOverviewHTML(); break;
      case "daywise": content.innerHTML = renderDayWiseHTML(); break;
      case "investments": content.innerHTML = renderInvestmentsHTML(); break;
      case "income": content.innerHTML = renderIncomeHTML(); break;
      case "expenses": content.innerHTML = renderExpensesHTML(); break;
      default: content.innerHTML = renderOverviewHTML();
    }
    bindContentEvents(content);
    // Restore values the user had typed (survives delete-triggered re-renders)
    restoreFormValues(content);
  }

  /* ─── SHARED STYLES ──────────────────────────────────────── */
  const panelStyle = `background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:14px;padding:18px;`;
  const inputStyle = `background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.12);border-radius:7px;color:#fff;padding:5px 10px;font-size:0.8rem;margin-left:4px;`;
  const fieldStyle = `width:100%;box-sizing:border-box;background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.12);border-radius:8px;color:#fff;padding:8px 12px;font-size:0.82rem;outline:none;`;
  function btnStyle(color) {
    const colors = { blue: "#3b82f6", green: "#22c55e", red: "#ef4444", amber: "#f59e0b" };
    return `background:${colors[color] || "#3b82f6"};color:#fff;border:none;border-radius:8px;padding:7px 14px;font-size:0.78rem;font-weight:700;cursor:pointer;`;
  }
  function quickFilterBtn(key, label) {
    const active = financeState.dayFilter === key;
    return `<button data-qf="${key}" style="background:${active ? "#3b82f6" : "rgba(255,255,255,0.08)"};color:${active ? "#fff" : "rgba(255,255,255,0.6)"};border:none;border-radius:8px;padding:5px 12px;font-size:0.75rem;font-weight:600;cursor:pointer;">${label}</button>`;
  }
  function kpiCard(title, value, icon, color, sub) {
    return `<div style="background:rgba(255,255,255,0.04);border:1px solid ${color}30;border-radius:14px;padding:18px;position:relative;overflow:hidden;">
      <div style="position:absolute;top:-10px;right:-10px;width:60px;height:60px;background:${color}18;border-radius:50%;"></div>
      <div style="font-size:1.4rem;margin-bottom:8px;">${icon}</div>
      <div style="font-size:1.5rem;font-weight:800;color:${color};margin-bottom:4px;">${fmtK(value)}</div>
      <div style="font-size:0.82rem;font-weight:700;color:rgba(255,255,255,0.8);">${title}</div>
      <div style="font-size:0.72rem;color:rgba(255,255,255,0.4);margin-top:3px;">${sub}</div>
    </div>`;
  }
  function adminMetric(label, value, color) {
    return `<div style="background:rgba(255,255,255,0.04);border-radius:10px;padding:12px 14px;">
      <div style="font-size:1.1rem;font-weight:800;color:${color};">${fmtK(value)}</div>
      <div style="font-size:0.72rem;color:rgba(255,255,255,0.5);margin-top:2px;">${label}</div>
    </div>`;
  }
  function investCategoryBars(investments) {
    const cats = {};
    investments.filter(i => i.status === "Active").forEach(i => { cats[i.category] = (cats[i.category] || 0) + Number(i.amount); });
    const total = Object.values(cats).reduce((s, v) => s + v, 0) || 1;
    const colors = ["#38bdf8","#a78bfa","#4ade80","#fb923c","#f472b6","#fbbf24"];
    return Object.entries(cats).map(([cat, amt], i) => `
      <div style="margin-bottom:10px;">
        <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
          <span style="color:rgba(255,255,255,0.8);font-size:0.78rem;">${cat}</span>
          <span style="color:${colors[i % colors.length]};font-size:0.78rem;font-weight:700;">${fmtK(amt)}</span>
        </div>
        <div style="background:rgba(255,255,255,0.08);border-radius:4px;height:6px;overflow:hidden;">
          <div style="background:${colors[i % colors.length]};width:${(amt / total * 100).toFixed(1)}%;height:100%;border-radius:4px;"></div>
        </div>
      </div>`).join("") || `<div style="color:rgba(255,255,255,0.3);font-size:0.82rem;">No active investments</div>`;
  }
  function recentTxnList(store) {
    const txns = [];
    (store[INCOME_KEY] || []).forEach(r => txns.push({ date: r.date, label: r.source, amount: r.amount, type: "in" }));
    (store[EXPENSE_KEY] || []).forEach(r => txns.push({ date: r.date, label: r.head, amount: r.amount, type: "out" }));
    txns.sort((a, b) => b.date.localeCompare(a.date));
    return txns.slice(0, 8).map(t => `
      <div style="display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid rgba(255,255,255,0.05);">
        <div><div style="color:rgba(255,255,255,0.85);font-size:0.78rem;">${t.label}</div><div style="color:rgba(255,255,255,0.35);font-size:0.68rem;">${t.date}</div></div>
        <span style="font-size:0.82rem;font-weight:700;color:${t.type === "in" ? "#4ade80" : "#f87171"};">${t.type === "in" ? "+" : "−"}${fmtK(t.amount)}</span>
      </div>`).join("") || `<div style="color:rgba(255,255,255,0.3);font-size:0.82rem;">No transactions yet</div>`;
  }
  function balanceBar(income, expense, invested) {
    const total = Math.max(income, expense + invested, 1);
    const ip = (income / total * 100).toFixed(1), ep = (expense / total * 100).toFixed(1), vp = (invested / total * 100).toFixed(1);
    return `
      <div style="display:flex;gap:8px;align-items:center;margin-bottom:10px;"><div style="flex:1;background:rgba(255,255,255,0.08);border-radius:8px;height:18px;overflow:hidden;"><div style="background:#4ade80;width:${ip}%;height:100%;border-radius:8px;"></div></div><span style="color:#4ade80;font-size:0.72rem;width:60px;text-align:right;">${fmtK(income)}</span></div>
      <div style="display:flex;gap:8px;align-items:center;margin-bottom:10px;"><div style="flex:1;background:rgba(255,255,255,0.08);border-radius:8px;height:18px;overflow:hidden;"><div style="background:#f87171;width:${ep}%;height:100%;"></div></div><span style="color:#f87171;font-size:0.72rem;width:60px;text-align:right;">${fmtK(expense)}</span></div>
      <div style="display:flex;gap:8px;align-items:center;"><div style="flex:1;background:rgba(255,255,255,0.08);border-radius:8px;height:18px;overflow:hidden;"><div style="background:#a78bfa;width:${vp}%;height:100%;"></div></div><span style="color:#a78bfa;font-size:0.72rem;width:60px;text-align:right;">${fmtK(invested)}</span></div>
      <div style="display:flex;gap:16px;margin-top:10px;">
        <span style="display:flex;align-items:center;gap:5px;font-size:0.72rem;color:rgba(255,255,255,0.5);"><span style="width:10px;height:10px;background:#4ade80;border-radius:2px;display:inline-block;"></span>Income</span>
        <span style="display:flex;align-items:center;gap:5px;font-size:0.72rem;color:rgba(255,255,255,0.5);"><span style="width:10px;height:10px;background:#f87171;border-radius:2px;display:inline-block;"></span>Expenses</span>
        <span style="display:flex;align-items:center;gap:5px;font-size:0.72rem;color:rgba(255,255,255,0.5);"><span style="width:10px;height:10px;background:#a78bfa;border-radius:2px;display:inline-block;"></span>Invested</span>
      </div>`;
  }

  /* ─── OVERVIEW TAB ───────────────────────────────────────── */
  function renderOverviewHTML() {
    const { totalIncome, totalExpense, balance, invested, feeIncome, otherIncome, payroll } = calcFinancials(financeState.dateFrom, financeState.dateTo);
    const store = getFinStore();
    const investments = store[INVEST_KEY] || [];
    const activeInvest = investments.filter(i => i.status === "Active");
    const expectedReturns = activeInvest.reduce((s, i) => s + (Number(i.amount) * Number(i.expectedReturn) / 100), 0);
    const pctExpense = totalIncome > 0 ? Math.min(100, (totalExpense / totalIncome * 100)).toFixed(1) : 0;
    const pctInvested = (totalIncome + invested) > 0 ? (invested / (totalIncome + invested) * 100).toFixed(1) : 0;
    const adminSection = isAdmin() ? `
      <div style="${panelStyle}margin-bottom:20px;">
        <div style="color:rgba(255,255,255,0.5);font-size:0.72rem;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:14px;">🔐 Admin — Full Balance Breakdown</div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:12px;">
          ${adminMetric("Fee Income", feeIncome, "#4ade80")}${adminMetric("Other Income", otherIncome, "#38bdf8")}${adminMetric("Total Expenses", totalExpense, "#f87171")}${adminMetric("Payroll Paid", payroll, "#fb923c")}${adminMetric("Active Investments", invested, "#a78bfa")}${adminMetric("Expected Returns/yr", expectedReturns, "#fbbf24")}
        </div>
      </div>` : "";
    return `
      <div style="${panelStyle.replace("padding:18px", "padding:14px 18px")}margin-bottom:20px;display:flex;flex-wrap:wrap;align-items:center;gap:12px;">
        <span style="color:rgba(255,255,255,0.6);font-size:0.8rem;font-weight:600;">📅 Period:</span>
        ${quickFilterBtn("thisMonth","This Month")}${quickFilterBtn("thisQuarter","This Quarter")}${quickFilterBtn("thisYear","This Year")}${quickFilterBtn("allTime","All Time")}
        <span style="color:rgba(255,255,255,0.4);margin:0 4px;">|</span>
        <label style="color:rgba(255,255,255,0.6);font-size:0.75rem;">From <input type="date" id="fi_from" value="${financeState.dateFrom}" style="${inputStyle}" /></label>
        <label style="color:rgba(255,255,255,0.6);font-size:0.75rem;">To <input type="date" id="fi_to" value="${financeState.dateTo}" style="${inputStyle}" /></label>
        <button id="fi_applyRange" style="${btnStyle("blue")}">Apply</button>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:14px;margin-bottom:22px;">
        ${kpiCard("Total Income", totalIncome, "⬆️", "#4ade80", `Fee: ${fmtK(feeIncome)} + Other: ${fmtK(otherIncome)}`)}
        ${kpiCard("Total Expenses", totalExpense, "⬇️", "#f87171", `${pctExpense}% of income`)}
        ${kpiCard("Net Balance", balance, "💰", balance >= 0 ? "#38bdf8" : "#f87171", balance >= 0 ? "Surplus" : "Deficit")}
        ${kpiCard("Invested (Active)", invested, "💼", "#a78bfa", `${pctInvested}% of funds`)}
      </div>
      ${adminSection}
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px;">
        <div style="${panelStyle}"><div style="color:rgba(255,255,255,0.5);font-size:0.72rem;text-transform:uppercase;margin-bottom:14px;">📈 Investment Categories</div>${investCategoryBars(store[INVEST_KEY] || [])}</div>
        <div style="${panelStyle}"><div style="color:rgba(255,255,255,0.5);font-size:0.72rem;text-transform:uppercase;margin-bottom:14px;">🏦 Recent Transactions</div>${recentTxnList(store)}</div>
      </div>
      <div style="${panelStyle}"><div style="color:rgba(255,255,255,0.5);font-size:0.72rem;text-transform:uppercase;margin-bottom:12px;">📊 Income vs Expense vs Invested</div>${balanceBar(totalIncome, totalExpense, invested)}</div>`;
  }

  /* ─── DAY-WISE TAB ───────────────────────────────────────── */
  function renderDayWiseHTML() {
    const rows = getDayWise(financeState.dateFrom, financeState.dateTo);
    const totalInc = rows.reduce((s, r) => s + r.income, 0);
    const totalExp = rows.reduce((s, r) => s + r.expense, 0);
    const maxVal = Math.max(...rows.map(r => Math.max(r.income, r.expense)), 1);
    const chartRows = rows.slice(-30).map(r => {
      const incH = Math.round(r.income / maxVal * 100), expH = Math.round(r.expense / maxVal * 100);
      return `<div style="display:flex;flex-direction:column;align-items:center;gap:2px;flex:1;min-width:18px;cursor:pointer;" title="${r.date}: Inc ${fmt(r.income)}, Exp ${fmt(r.expense)}">
        <div style="display:flex;gap:1px;align-items:flex-end;height:80px;"><div style="width:6px;background:#4ade80;border-radius:2px 2px 0 0;height:${incH}%;min-height:${r.income > 0 ? 2 : 0}px;"></div><div style="width:6px;background:#f87171;border-radius:2px 2px 0 0;height:${expH}%;min-height:${r.expense > 0 ? 2 : 0}px;"></div></div>
        <div style="font-size:0.55rem;color:rgba(255,255,255,0.3);transform:rotate(-45deg);white-space:nowrap;">${r.date.slice(5)}</div>
      </div>`;
    }).join("");
    const tableRows = rows.slice().reverse().map(r => `
      <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
        <td style="padding:10px 12px;color:rgba(255,255,255,0.7);font-size:0.8rem;">${r.date}</td>
        <td style="padding:10px 12px;color:#4ade80;font-size:0.8rem;font-weight:700;">${r.income > 0 ? fmt(r.income) : "—"}</td>
        <td style="padding:10px 12px;color:#f87171;font-size:0.8rem;font-weight:700;">${r.expense > 0 ? fmt(r.expense) : "—"}</td>
        <td style="padding:10px 12px;font-size:0.8rem;font-weight:700;color:${r.balance >= 0 ? "#38bdf8" : "#f87171"};">${fmt(r.balance)}</td>
      </tr>`).join("");
    return `
      <div style="${panelStyle.replace("padding:18px","padding:14px 18px")}margin-bottom:20px;display:flex;flex-wrap:wrap;align-items:center;gap:12px;">
        <span style="color:rgba(255,255,255,0.6);font-size:0.8rem;font-weight:600;">📅 Filter:</span>
        ${quickFilterBtn("today","Today")}${quickFilterBtn("thisWeek","This Week")}${quickFilterBtn("thisMonth","This Month")}${quickFilterBtn("thisQuarter","This Quarter")}${quickFilterBtn("thisYear","This Year")}
        <span style="color:rgba(255,255,255,0.4);">|</span>
        <label style="color:rgba(255,255,255,0.6);font-size:0.75rem;">From <input type="date" id="fi_from" value="${financeState.dateFrom}" style="${inputStyle}" /></label>
        <label style="color:rgba(255,255,255,0.6);font-size:0.75rem;">To <input type="date" id="fi_to" value="${financeState.dateTo}" style="${inputStyle}" /></label>
        <button id="fi_applyRange" style="${btnStyle("blue")}">Apply</button>
        <button id="fi_exportDW" style="${btnStyle("green")}">⬇ Export CSV</button>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:20px;">
        <div style="${panelStyle}text-align:center;"><div style="font-size:1.3rem;font-weight:800;color:#4ade80;">${fmtK(totalInc)}</div><div style="font-size:0.75rem;color:rgba(255,255,255,0.5);">Total Income</div></div>
        <div style="${panelStyle}text-align:center;"><div style="font-size:1.3rem;font-weight:800;color:#f87171;">${fmtK(totalExp)}</div><div style="font-size:0.75rem;color:rgba(255,255,255,0.5);">Total Expense</div></div>
        <div style="${panelStyle}text-align:center;"><div style="font-size:1.3rem;font-weight:800;color:${totalInc-totalExp>=0?"#38bdf8":"#f87171"};">${fmtK(totalInc-totalExp)}</div><div style="font-size:0.75rem;color:rgba(255,255,255,0.5);">Net Balance</div></div>
      </div>
      <div style="${panelStyle}margin-bottom:20px;"><div style="color:rgba(255,255,255,0.5);font-size:0.72rem;text-transform:uppercase;margin-bottom:14px;">Daily Income vs Expense (last 30 days)</div>
        <div style="display:flex;align-items:flex-end;gap:1px;overflow-x:auto;padding-bottom:8px;">${chartRows || '<div style="color:rgba(255,255,255,0.3);">No data in this range</div>'}</div>
      </div>
      <div style="${panelStyle}"><div style="color:rgba(255,255,255,0.5);font-size:0.72rem;text-transform:uppercase;margin-bottom:14px;">Day-wise Ledger — ${rows.length} days</div>
        ${rows.length === 0 ? `<div style="color:rgba(255,255,255,0.3);padding:20px;text-align:center;">No transactions in this period</div>` : `
        <div style="overflow-x:auto;"><table style="width:100%;border-collapse:collapse;">
          <thead><tr style="border-bottom:1px solid rgba(255,255,255,0.1);">
            <th style="padding:10px 12px;text-align:left;font-size:0.72rem;color:rgba(255,255,255,0.4);font-weight:600;">DATE</th>
            <th style="padding:10px 12px;text-align:left;font-size:0.72rem;color:#4ade80;font-weight:600;">INCOME</th>
            <th style="padding:10px 12px;text-align:left;font-size:0.72rem;color:#f87171;font-weight:600;">EXPENSE</th>
            <th style="padding:10px 12px;text-align:left;font-size:0.72rem;color:#38bdf8;font-weight:600;">BALANCE</th>
          </tr></thead>
          <tbody>${tableRows}</tbody>
          <tfoot><tr style="border-top:2px solid rgba(255,255,255,0.15);">
            <td style="padding:10px 12px;font-size:0.8rem;font-weight:700;color:rgba(255,255,255,0.6);">TOTAL (${rows.length} days)</td>
            <td style="padding:10px 12px;color:#4ade80;font-size:0.85rem;font-weight:800;">${fmt(totalInc)}</td>
            <td style="padding:10px 12px;color:#f87171;font-size:0.85rem;font-weight:800;">${fmt(totalExp)}</td>
            <td style="padding:10px 12px;color:${totalInc-totalExp>=0?"#38bdf8":"#f87171"};font-size:0.85rem;font-weight:800;">${fmt(totalInc-totalExp)}</td>
          </tr></tfoot>
        </table></div>`}
      </div>`;
  }

  /* ─── INVESTMENTS TAB ────────────────────────────────────── */
  function renderInvestmentsHTML() {
    const store = getFinStore();
    const investments = store[INVEST_KEY] || [];
    const active = investments.filter(i => i.status === "Active");
    const completed = investments.filter(i => i.status !== "Active");
    const totalActive = active.reduce((s, i) => s + Number(i.amount), 0);
    const totalReturns = active.reduce((s, i) => s + (Number(i.amount) * Number(i.expectedReturn) / 100), 0);
    const tabItems = financeState.investTab === "active" ? active : completed;
    const cards = tabItems.map(inv => `
      <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);border-radius:14px;padding:18px;position:relative;">
        <div style="position:absolute;top:14px;right:14px;"><span style="background:${inv.status==="Active"?"#166534":"#7c3aed"};color:${inv.status==="Active"?"#4ade80":"#e9d5ff"};padding:3px 10px;border-radius:20px;font-size:0.68rem;font-weight:700;">${inv.status}</span></div>
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;">
          <div style="width:38px;height:38px;border-radius:10px;background:rgba(167,139,250,0.2);display:flex;align-items:center;justify-content:center;font-size:1.2rem;">${inv.category==="Fixed Deposit"?"🏦":inv.category==="Recurring Deposit"?"🔄":inv.category==="Infrastructure"?"🏗️":inv.category==="Technology"?"💻":"📚"}</div>
          <div><div style="font-size:0.9rem;font-weight:700;color:#fff;">${inv.title}</div><div style="font-size:0.72rem;color:rgba(255,255,255,0.4);">${inv.category} · ${inv.bank || ""}</div></div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px;">
          <div style="background:rgba(255,255,255,0.05);border-radius:8px;padding:10px;"><div style="font-size:1rem;font-weight:800;color:#a78bfa;">${fmt(inv.amount)}</div><div style="font-size:0.68rem;color:rgba(255,255,255,0.4);">Amount Invested</div></div>
          ${inv.expectedReturn > 0 ? `<div style="background:rgba(255,255,255,0.05);border-radius:8px;padding:10px;"><div style="font-size:1rem;font-weight:800;color:#4ade80;">${inv.expectedReturn}% p.a.</div><div style="font-size:0.68rem;color:rgba(255,255,255,0.4);">Expected Return</div></div>` : `<div style="background:rgba(255,255,255,0.05);border-radius:8px;padding:10px;"><div style="font-size:1rem;font-weight:800;color:#fb923c;">Capital Use</div><div style="font-size:0.68rem;color:rgba(255,255,255,0.4);">Purpose-based</div></div>`}
        </div>
        ${inv.startDate ? `<div style="font-size:0.72rem;color:rgba(255,255,255,0.4);margin-bottom:4px;">📅 ${inv.startDate}${inv.maturityDate ? ` → ${inv.maturityDate}` : ""}</div>` : ""}
        ${inv.notes ? `<div style="font-size:0.75rem;color:rgba(255,255,255,0.55);background:rgba(255,255,255,0.05);border-radius:7px;padding:8px 10px;margin-top:8px;">${inv.notes}</div>` : ""}
        ${isAdmin() ? `<div style="display:flex;gap:8px;margin-top:12px;align-items:center;">
          <button data-invest-delete="${inv.id}" style="background:rgba(239,68,68,0.15);color:#f87171;border:1px solid rgba(239,68,68,0.2);border-radius:7px;padding:5px 12px;font-size:0.72rem;cursor:pointer;">Delete</button>
          <button data-invest-toggle="${inv.id}" data-invest-status="${inv.status}" style="background:rgba(255,255,255,0.08);color:rgba(255,255,255,0.6);border:none;border-radius:7px;padding:5px 12px;font-size:0.72rem;cursor:pointer;">${inv.status==="Active"?"Mark Complete":"Reactivate"}</button>
        </div>` : ""}
      </div>`).join("");
    const addForm = isAdmin() ? `
      <div style="${panelStyle}margin-bottom:20px;">
        <div style="color:rgba(255,255,255,0.5);font-size:0.72rem;text-transform:uppercase;margin-bottom:16px;">➕ Add New Investment</div>
        <form autocomplete="off" onsubmit="return false;" style="display:contents;">
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px;">
          <div><label style="color:rgba(255,255,255,0.5);font-size:0.72rem;display:block;margin-bottom:4px;">Title *</label><input id="inv_title" name="inv_title_${Date.now()}" placeholder="e.g. SBI Fixed Deposit" autocomplete="new-password" readonly onfocus="this.removeAttribute('readonly')" style="${fieldStyle}" /></div>
          <div><label style="color:rgba(255,255,255,0.5);font-size:0.72rem;display:block;margin-bottom:4px;">Category *</label><select id="inv_category" name="inv_category_${Date.now()}" autocomplete="new-password" style="${fieldStyle}"><option>Fixed Deposit</option><option>Recurring Deposit</option><option>Infrastructure</option><option>Technology</option><option>Education</option><option>Other</option></select></div>
          <div><label style="color:rgba(255,255,255,0.5);font-size:0.72rem;display:block;margin-bottom:4px;">Amount (₹) *</label><input id="inv_amount" name="inv_amount_${Date.now()}" type="number" placeholder="500000" autocomplete="new-password" readonly onfocus="this.removeAttribute('readonly')" style="${fieldStyle}" /></div>
          <div><label style="color:rgba(255,255,255,0.5);font-size:0.72rem;display:block;margin-bottom:4px;">Expected Return (%/yr)</label><input id="inv_return" name="inv_return_${Date.now()}" type="number" placeholder="7.5" autocomplete="new-password" readonly onfocus="this.removeAttribute('readonly')" style="${fieldStyle}" /></div>
          <div><label style="color:rgba(255,255,255,0.5);font-size:0.72rem;display:block;margin-bottom:4px;">Bank / Source</label><input id="inv_bank" name="inv_bank_${Date.now()}" placeholder="State Bank of India" autocomplete="new-password" readonly onfocus="this.removeAttribute('readonly')" style="${fieldStyle}" /></div>
          <div><label style="color:rgba(255,255,255,0.5);font-size:0.72rem;display:block;margin-bottom:4px;">Start Date</label><input id="inv_start" name="inv_start_${Date.now()}" type="date" value="${finTodayStr()}" autocomplete="new-password" style="${fieldStyle}" /></div>
          <div><label style="color:rgba(255,255,255,0.5);font-size:0.72rem;display:block;margin-bottom:4px;">Maturity Date</label><input id="inv_maturity" name="inv_maturity_${Date.now()}" type="date" autocomplete="new-password" style="${fieldStyle}" /></div>
          <div><label style="color:rgba(255,255,255,0.5);font-size:0.72rem;display:block;margin-bottom:4px;">Notes</label><input id="inv_notes" name="inv_notes_${Date.now()}" placeholder="Purpose / remarks" autocomplete="new-password" readonly onfocus="this.removeAttribute('readonly')" style="${fieldStyle}" /></div>
        </div>
        </form>
        <div style="margin-top:14px;"><button id="inv_save" style="${btnStyle("blue")}">💾 Save Investment</button><span id="inv_saving" style="display:none;margin-left:10px;color:rgba(255,255,255,0.5);font-size:0.78rem;">Saving…</span></div>
      </div>` : "";
    return `
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;margin-bottom:20px;">
        ${kpiCard("Total Active Invested", totalActive, "💼", "#a78bfa", `${active.length} active investments`)}
        ${kpiCard("Expected Annual Returns", totalReturns, "📈", "#4ade80", "From FD & RD instruments")}
        ${kpiCard("Completed Investments", completed.reduce((s,i)=>s+Number(i.amount),0), "✅", "#38bdf8", `${completed.length} completed investments`)}
      </div>
      ${addForm}
      <div style="display:flex;gap:4px;margin-bottom:16px;">
        <button data-invest-tab="active" style="background:${financeState.investTab==="active"?"#3b82f6":"rgba(255,255,255,0.08)"};color:#fff;border:none;border-radius:8px;padding:7px 16px;font-size:0.8rem;font-weight:600;cursor:pointer;">Active (${active.length})</button>
        <button data-invest-tab="completed" style="background:${financeState.investTab==="completed"?"#3b82f6":"rgba(255,255,255,0.08)"};color:#fff;border:none;border-radius:8px;padding:7px 16px;font-size:0.8rem;font-weight:600;cursor:pointer;">Completed (${completed.length})</button>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:14px;">
        ${cards || `<div style="color:rgba(255,255,255,0.3);padding:30px;text-align:center;grid-column:1/-1;">No ${financeState.investTab} investments found. Add one above!</div>`}
      </div>`;
  }

  /* ─── INCOME TAB ─────────────────────────────────────────── */
  function renderIncomeHTML() {
    const store = getFinStore();
    let list = (store[INCOME_KEY] || []).filter(r => (!financeState.dateFrom || r.date >= financeState.dateFrom) && (!financeState.dateTo || r.date <= financeState.dateTo));
    list = list.slice().sort((a, b) => b.date.localeCompare(a.date));
    const total = list.reduce((s, r) => s + Number(r.amount), 0);
    const rows = list.map(r => `
      <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
        <td style="padding:10px 12px;color:rgba(255,255,255,0.7);font-size:0.78rem;">${r.date}</td>
        <td style="padding:10px 12px;color:rgba(255,255,255,0.85);font-size:0.78rem;">${r.source || ""}</td>
        <td style="padding:10px 12px;font-size:0.75rem;"><span style="background:rgba(56,189,248,0.15);color:#38bdf8;padding:2px 8px;border-radius:20px;">${r.category || "Other"}</span></td>
        <td style="padding:10px 12px;color:#4ade80;font-size:0.82rem;font-weight:700;">${fmt(r.amount)}</td>
        <td style="padding:10px 12px;color:rgba(255,255,255,0.4);font-size:0.75rem;">${r.mode || ""}</td>
        ${isAdmin() ? `<td style="padding:6px 12px;"><button data-income-delete="${r.id}" style="background:rgba(239,68,68,0.1);color:#f87171;border:none;border-radius:6px;padding:4px 10px;font-size:0.7rem;cursor:pointer;">Del</button></td>` : "<td></td>"}
      </tr>`).join("");
    const addForm = isAdmin() ? `
      <div style="${panelStyle}margin-bottom:20px;">
        <div style="color:rgba(255,255,255,0.5);font-size:0.72rem;text-transform:uppercase;margin-bottom:16px;">➕ Add Income Record</div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;">
          <div><label style="color:rgba(255,255,255,0.5);font-size:0.72rem;display:block;margin-bottom:4px;">Date *</label><input id="inc_date" type="date" value="${finTodayStr()}" autocomplete="new-password" style="${fieldStyle}" /></div>
          <div><label style="color:rgba(255,255,255,0.5);font-size:0.72rem;display:block;margin-bottom:4px;">Source *</label><input id="inc_source" placeholder="Fee Collection / Donation..." autocomplete="new-password" readonly onfocus="this.removeAttribute('readonly')" style="${fieldStyle}" /></div>
          <div><label style="color:rgba(255,255,255,0.5);font-size:0.72rem;display:block;margin-bottom:4px;">Category</label><select id="inc_category" autocomplete="new-password" style="${fieldStyle}"><option>Fees</option><option>Transport</option><option>Hostel</option><option>Exams</option><option>Donation</option><option>Grant</option><option>Other</option></select></div>
          <div><label style="color:rgba(255,255,255,0.5);font-size:0.72rem;display:block;margin-bottom:4px;">Amount (₹) *</label><input id="inc_amount" type="number" placeholder="50000" autocomplete="new-password" readonly onfocus="this.removeAttribute('readonly')" style="${fieldStyle}" /></div>
          <div><label style="color:rgba(255,255,255,0.5);font-size:0.72rem;display:block;margin-bottom:4px;">Mode</label><select id="inc_mode" autocomplete="new-password" style="${fieldStyle}"><option>Cash</option><option>UPI</option><option>Bank Transfer</option><option>Cheque</option><option>Mixed</option></select></div>
          <div><label style="color:rgba(255,255,255,0.5);font-size:0.72rem;display:block;margin-bottom:4px;">Description</label><input id="inc_desc" placeholder="Brief note" autocomplete="new-password" readonly onfocus="this.removeAttribute('readonly')" style="${fieldStyle}" /></div>
        </div>
        <div style="margin-top:14px;"><button id="inc_save" style="${btnStyle("green")}">💾 Save Income</button><span id="inc_saving" style="display:none;margin-left:10px;color:rgba(255,255,255,0.5);font-size:0.78rem;">Saving…</span></div>
      </div>` : "";
    return `
      <div style="${panelStyle.replace("padding:18px","padding:14px 18px")}margin-bottom:20px;display:flex;flex-wrap:wrap;align-items:center;gap:12px;">
        <span style="color:rgba(255,255,255,0.6);font-size:0.8rem;font-weight:600;">📅 Filter:</span>
        ${quickFilterBtn("thisMonth","This Month")}${quickFilterBtn("thisQuarter","This Quarter")}${quickFilterBtn("thisYear","This Year")}
        <label style="color:rgba(255,255,255,0.6);font-size:0.75rem;">From <input type="date" id="fi_from" value="${financeState.dateFrom}" style="${inputStyle}" /></label>
        <label style="color:rgba(255,255,255,0.6);font-size:0.75rem;">To <input type="date" id="fi_to" value="${financeState.dateTo}" style="${inputStyle}" /></label>
        <button id="fi_applyRange" style="${btnStyle("blue")}">Apply</button>
        <button id="fi_exportInc" style="${btnStyle("green")}">⬇ Export CSV</button>
      </div>
      <div style="margin-bottom:16px;"><span style="background:rgba(74,222,128,0.15);color:#4ade80;border-radius:8px;padding:8px 16px;font-size:0.9rem;font-weight:800;">${fmt(total)} total from ${list.length} records</span></div>
      ${addForm}
      <div style="${panelStyle}"><div style="overflow-x:auto;"><table style="width:100%;border-collapse:collapse;">
        <thead><tr style="border-bottom:1px solid rgba(255,255,255,0.1);">
          <th style="padding:10px 12px;text-align:left;font-size:0.7rem;color:rgba(255,255,255,0.4);">DATE</th>
          <th style="padding:10px 12px;text-align:left;font-size:0.7rem;color:rgba(255,255,255,0.4);">SOURCE</th>
          <th style="padding:10px 12px;text-align:left;font-size:0.7rem;color:rgba(255,255,255,0.4);">CATEGORY</th>
          <th style="padding:10px 12px;text-align:left;font-size:0.7rem;color:#4ade80;">AMOUNT</th>
          <th style="padding:10px 12px;text-align:left;font-size:0.7rem;color:rgba(255,255,255,0.4);">MODE</th><th></th>
        </tr></thead>
        <tbody>${rows || `<tr><td colspan="6" style="padding:30px;text-align:center;color:rgba(255,255,255,0.3);">No income records in this period</td></tr>`}</tbody>
      </table></div></div>`;
  }

  /* ─── EXPENSES TAB ───────────────────────────────────────── */
  function renderExpensesHTML() {
    const store = getFinStore();
    let list = (store[EXPENSE_KEY] || []).filter(r => (!financeState.dateFrom || r.date >= financeState.dateFrom) && (!financeState.dateTo || r.date <= financeState.dateTo));
    list = list.slice().sort((a, b) => b.date.localeCompare(a.date));
    const total = list.reduce((s, r) => s + Number(r.amount), 0);
    const catTotals = {};
    list.forEach(r => { catTotals[r.category || "Other"] = (catTotals[r.category || "Other"] || 0) + Number(r.amount); });
    const catMax = Math.max(...Object.values(catTotals), 1);
    const colors = ["#f87171","#fb923c","#fbbf24","#a78bfa","#38bdf8","#4ade80","#f472b6"];
    const catBars = Object.entries(catTotals).sort((a, b) => b[1] - a[1]).map(([cat, amt], i) => `
      <div style="margin-bottom:8px;">
        <div style="display:flex;justify-content:space-between;margin-bottom:3px;"><span style="color:rgba(255,255,255,0.75);font-size:0.78rem;">${cat}</span><span style="color:${colors[i%colors.length]};font-size:0.78rem;font-weight:700;">${fmtK(amt)}</span></div>
        <div style="background:rgba(255,255,255,0.08);border-radius:4px;height:6px;"><div style="background:${colors[i%colors.length]};width:${(amt/catMax*100).toFixed(1)}%;height:100%;border-radius:4px;"></div></div>
      </div>`).join("");
    const rows = list.map(r => `
      <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
        <td style="padding:10px 12px;color:rgba(255,255,255,0.7);font-size:0.78rem;">${r.date}</td>
        <td style="padding:10px 12px;color:rgba(255,255,255,0.85);font-size:0.78rem;">${r.head || ""}</td>
        <td style="padding:10px 12px;font-size:0.75rem;"><span style="background:rgba(248,113,113,0.15);color:#f87171;padding:2px 8px;border-radius:20px;">${r.category || "Other"}</span></td>
        <td style="padding:10px 12px;color:#f87171;font-size:0.82rem;font-weight:700;">${fmt(r.amount)}</td>
        <td style="padding:10px 12px;color:rgba(255,255,255,0.4);font-size:0.75rem;">${r.mode || ""}</td>
        ${isAdmin() ? `<td style="padding:6px 12px;"><button data-exp-delete="${r.id}" style="background:rgba(239,68,68,0.1);color:#f87171;border:none;border-radius:6px;padding:4px 10px;font-size:0.7rem;cursor:pointer;">Del</button></td>` : "<td></td>"}
      </tr>`).join("");
    const addForm = isAdmin() ? `
      <div style="${panelStyle}margin-bottom:20px;">
        <div style="color:rgba(255,255,255,0.5);font-size:0.72rem;text-transform:uppercase;margin-bottom:16px;">➕ Add Expense Record</div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;">
          <div><label style="color:rgba(255,255,255,0.5);font-size:0.72rem;display:block;margin-bottom:4px;">Date *</label><input id="exp_date" type="date" value="${finTodayStr()}" autocomplete="new-password" style="${fieldStyle}" /></div>
          <div><label style="color:rgba(255,255,255,0.5);font-size:0.72rem;display:block;margin-bottom:4px;">Head *</label><input id="exp_head" placeholder="Salary / Maintenance..." autocomplete="new-password" readonly onfocus="this.removeAttribute('readonly')" style="${fieldStyle}" /></div>
          <div><label style="color:rgba(255,255,255,0.5);font-size:0.72rem;display:block;margin-bottom:4px;">Category</label><select id="exp_category" autocomplete="new-password" style="${fieldStyle}"><option>Payroll</option><option>Utilities</option><option>Supplies</option><option>Maintenance</option><option>Infrastructure</option><option>Transport</option><option>Other</option></select></div>
          <div><label style="color:rgba(255,255,255,0.5);font-size:0.72rem;display:block;margin-bottom:4px;">Amount (₹) *</label><input id="exp_amount" type="number" placeholder="25000" autocomplete="new-password" readonly onfocus="this.removeAttribute('readonly')" style="${fieldStyle}" /></div>
          <div><label style="color:rgba(255,255,255,0.5);font-size:0.72rem;display:block;margin-bottom:4px;">Mode</label><select id="exp_mode" autocomplete="new-password" style="${fieldStyle}"><option>Cash</option><option>Bank Transfer</option><option>UPI</option><option>Cheque</option><option>Online</option></select></div>
          <div><label style="color:rgba(255,255,255,0.5);font-size:0.72rem;display:block;margin-bottom:4px;">Description</label><input id="exp_desc" placeholder="Brief note" autocomplete="new-password" readonly onfocus="this.removeAttribute('readonly')" style="${fieldStyle}" /></div>
        </div>
        <div style="margin-top:14px;"><button id="exp_save" style="${btnStyle("red")}">💾 Save Expense</button><span id="exp_saving" style="display:none;margin-left:10px;color:rgba(255,255,255,0.5);font-size:0.78rem;">Saving…</span></div>
      </div>` : "";
    return `
      <div style="${panelStyle.replace("padding:18px","padding:14px 18px")}margin-bottom:20px;display:flex;flex-wrap:wrap;align-items:center;gap:12px;">
        <span style="color:rgba(255,255,255,0.6);font-size:0.8rem;font-weight:600;">📅 Filter:</span>
        ${quickFilterBtn("thisMonth","This Month")}${quickFilterBtn("thisQuarter","This Quarter")}${quickFilterBtn("thisYear","This Year")}
        <label style="color:rgba(255,255,255,0.6);font-size:0.75rem;">From <input type="date" id="fi_from" value="${financeState.dateFrom}" style="${inputStyle}" /></label>
        <label style="color:rgba(255,255,255,0.6);font-size:0.75rem;">To <input type="date" id="fi_to" value="${financeState.dateTo}" style="${inputStyle}" /></label>
        <button id="fi_applyRange" style="${btnStyle("blue")}">Apply</button>
        <button id="fi_exportExp" style="${btnStyle("amber")}">⬇ Export CSV</button>
      </div>
      <div style="display:grid;grid-template-columns:2fr 1fr;gap:16px;margin-bottom:20px;">
        <div><span style="background:rgba(248,113,113,0.15);color:#f87171;border-radius:8px;padding:8px 16px;font-size:0.9rem;font-weight:800;">${fmt(total)} total from ${list.length} records</span></div>
        <div style="${panelStyle}padding:14px;"><div style="font-size:0.72rem;color:rgba(255,255,255,0.4);text-transform:uppercase;margin-bottom:10px;">By Category</div>${catBars || '<div style="color:rgba(255,255,255,0.3);font-size:0.8rem;">No data</div>'}</div>
      </div>
      ${addForm}
      <div style="${panelStyle}"><div style="overflow-x:auto;"><table style="width:100%;border-collapse:collapse;">
        <thead><tr style="border-bottom:1px solid rgba(255,255,255,0.1);">
          <th style="padding:10px 12px;text-align:left;font-size:0.7rem;color:rgba(255,255,255,0.4);">DATE</th>
          <th style="padding:10px 12px;text-align:left;font-size:0.7rem;color:rgba(255,255,255,0.4);">HEAD</th>
          <th style="padding:10px 12px;text-align:left;font-size:0.7rem;color:rgba(255,255,255,0.4);">CATEGORY</th>
          <th style="padding:10px 12px;text-align:left;font-size:0.7rem;color:#f87171;">AMOUNT</th>
          <th style="padding:10px 12px;text-align:left;font-size:0.7rem;color:rgba(255,255,255,0.4);">MODE</th><th></th>
        </tr></thead>
        <tbody>${rows || `<tr><td colspan="6" style="padding:30px;text-align:center;color:rgba(255,255,255,0.3);">No expense records in this period</td></tr>`}</tbody>
      </table></div></div>`;
  }

  /* ─── EVENT BINDING ──────────────────────────────────────── */
  function applyQuickFilter(key) {
    financeState.dayFilter = key;
    const now = new Date(), y = now.getFullYear(), m = now.getMonth(), d = now.getDate();
    if (key === "today") { financeState.dateFrom = financeState.dateTo = finTodayStr(); }
    else if (key === "thisWeek") { const s = new Date(now); s.setDate(d - s.getDay()); financeState.dateFrom = s.toISOString().slice(0, 10); financeState.dateTo = finTodayStr(); }
    else if (key === "thisMonth") { financeState.dateFrom = `${y}-${String(m+1).padStart(2,"0")}-01`; financeState.dateTo = finTodayStr(); }
    else if (key === "thisQuarter") {
      // Indian fiscal quarters: Q1=Apr-Jun, Q2=Jul-Sep, Q3=Oct-Dec, Q4=Jan-Mar
      const fiscalMonth = (m + 9) % 12; // Apr→0, May→1, ..., Mar→11
      const fiscalQ = Math.floor(fiscalMonth / 3); // 0,1,2,3
      // Map fiscal quarter back to calendar start month: 0→Apr(3), 1→Jul(6), 2→Oct(9), 3→Jan(0)
      const qStartCalMonth = [3, 6, 9, 0][fiscalQ];
      // Q4 (Jan-Mar): if current month is Jan/Feb/Mar, quarter started this calendar year
      // Q1-Q3: quarter started this calendar year
      const qStartYear = (fiscalQ === 3 && m >= 3) ? y + 1 : y;
      financeState.dateFrom = `${qStartYear}-${String(qStartCalMonth + 1).padStart(2,"0")}-01`;
      financeState.dateTo = finTodayStr();
    }
    else if (key === "thisYear") {
      // Indian fiscal year: April 1 to March 31
      // If current month is Jan(0), Feb(1), or Mar(2), fiscal year started in previous calendar year
      const fiscalStartYear = m < 3 ? y - 1 : y;
      financeState.dateFrom = `${fiscalStartYear}-04-01`;
      financeState.dateTo = finTodayStr();
    }
    else if (key === "allTime") { financeState.dateFrom = "2020-01-01"; financeState.dateTo = finTodayStr(); }
  }

  function exportCSV(rows, filename) {
    if (!rows.length) return alert("No data to export for the selected period.");
    const keys = Object.keys(rows[0]);
    const csv = [keys.join(","), ...rows.map(r => keys.map(k => `"${String(r[k]??"").replace(/"/g,'""')}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function bindContentEvents(content) {
    content.querySelectorAll("[data-qf]").forEach(btn => {
      btn.addEventListener("click", () => { applyQuickFilter(btn.dataset.qf); renderFinanceContent(); });
    });
    const applyBtn = content.querySelector("#fi_applyRange");
    if (applyBtn) applyBtn.addEventListener("click", () => {
      financeState.dateFrom = content.querySelector("#fi_from")?.value || financeState.dateFrom;
      financeState.dateTo = content.querySelector("#fi_to")?.value || financeState.dateTo;
      financeState.dayFilter = "custom";
      renderFinanceContent();
    });
    content.querySelector("#fi_exportDW")?.addEventListener("click", () => {
      exportCSV(getDayWise(financeState.dateFrom, financeState.dateTo), `daywise-${financeState.dateFrom}-to-${financeState.dateTo}.csv`);
    });
    content.querySelector("#fi_exportInc")?.addEventListener("click", () => {
      const list = (getFinStore()[INCOME_KEY] || []).filter(r => (!financeState.dateFrom || r.date >= financeState.dateFrom) && (!financeState.dateTo || r.date <= financeState.dateTo));
      exportCSV(list, `income-${financeState.dateFrom}-to-${financeState.dateTo}.csv`);
    });
    content.querySelector("#fi_exportExp")?.addEventListener("click", () => {
      const list = (getFinStore()[EXPENSE_KEY] || []).filter(r => (!financeState.dateFrom || r.date >= financeState.dateFrom) && (!financeState.dateTo || r.date <= financeState.dateTo));
      exportCSV(list, `expenses-${financeState.dateFrom}-to-${financeState.dateTo}.csv`);
    });
    content.querySelectorAll("[data-invest-tab]").forEach(btn => {
      btn.addEventListener("click", () => { financeState.investTab = btn.dataset.investTab; renderFinanceContent(); });
    });

    // ── DELETE INVESTMENT (API) ──
    content.querySelectorAll("[data-invest-delete]").forEach(btn => {
      btn.addEventListener("click", async () => {
        const id = Number(btn.dataset.investDelete);
        if (!confirm("Delete this investment?")) return;
        // Optimistic update: remove from local store immediately so UI reflects deletion at once
        if (serverStore && Array.isArray(serverStore[INVEST_KEY])) {
          serverStore[INVEST_KEY] = serverStore[INVEST_KEY].filter(i => Number(i.id) !== id);
        }
        renderFinanceContent();
        injectDashboardCard();
        try {
          await api(`/api/modules/${INVEST_KEY}/${id}`, { method: "DELETE" });
          await loadStore();
          renderFinanceContent();
          injectDashboardCard();
        } catch (e) {
          // Revert: reload real data and show error
          await loadStore();
          renderFinanceContent();
          injectDashboardCard();
          alert("Delete failed: " + e.message);
        }
      });
    });

    // ── TOGGLE INVESTMENT STATUS (API) ──
    content.querySelectorAll("[data-invest-toggle]").forEach(btn => {
      btn.addEventListener("click", async () => {
        const id = Number(btn.dataset.investToggle);
        const currentStatus = btn.dataset.investStatus;
        const newStatus = currentStatus === "Active" ? "Completed" : "Active";
        try {
          await api(`/api/modules/${INVEST_KEY}/${id}`, { method: "PUT", body: JSON.stringify({ status: newStatus }) });
          await loadStore();
          renderFinanceContent();
          injectDashboardCard();
        } catch (e) { alert("Update failed: " + e.message); }
      });
    });

    // ── SAVE INVESTMENT (API) ──
    content.querySelector("#inv_save")?.addEventListener("click", async () => {
      const title = content.querySelector("#inv_title")?.value?.trim();
      const amount = Number(content.querySelector("#inv_amount")?.value);
      if (!title || !amount) return alert("Title and Amount are required.");
      const savingEl = content.querySelector("#inv_saving");
      if (savingEl) savingEl.style.display = "inline";
      try {
        await api(`/api/modules/${INVEST_KEY}`, { method: "POST", body: JSON.stringify({
          title,
          category: content.querySelector("#inv_category")?.value,
          amount,
          expectedReturn: Number(content.querySelector("#inv_return")?.value) || 0,
          bank: content.querySelector("#inv_bank")?.value || "",
          startDate: content.querySelector("#inv_start")?.value || finTodayStr(),
          maturityDate: content.querySelector("#inv_maturity")?.value || "",
          notes: content.querySelector("#inv_notes")?.value || "",
          status: "Active",
        })});
        // Clear form + cache so browser autofill cannot re-populate fields after save
        clearInvestForm(content);
        await loadStore();
        renderFinanceContent();
        injectDashboardCard();
      } catch (e) { alert("Save failed: " + e.message); }
      finally { if (savingEl) savingEl.style.display = "none"; }
    });

    // ── DELETE INCOME (API) ──
    content.querySelectorAll("[data-income-delete]").forEach(btn => {
      btn.addEventListener("click", async () => {
        const id = Number(btn.dataset.incomeDelete);
        if (!confirm("Delete this income record?")) return;
        try {
          await api(`/api/modules/${INCOME_KEY}/${id}`, { method: "DELETE" });
          await loadStore();
          renderFinanceContent();
          injectDashboardCard();
        } catch (e) { alert("Delete failed: " + e.message); }
      });
    });

    // ── SAVE INCOME (API) ──
    content.querySelector("#inc_save")?.addEventListener("click", async () => {
      const source = content.querySelector("#inc_source")?.value?.trim();
      const amount = Number(content.querySelector("#inc_amount")?.value);
      if (!source || !amount) return alert("Source and Amount are required.");
      const savingEl = content.querySelector("#inc_saving");
      if (savingEl) savingEl.style.display = "inline";
      try {
        await api(`/api/modules/${INCOME_KEY}`, { method: "POST", body: JSON.stringify({
          date: content.querySelector("#inc_date")?.value || finTodayStr(),
          source,
          category: content.querySelector("#inc_category")?.value,
          amount,
          mode: content.querySelector("#inc_mode")?.value,
          description: content.querySelector("#inc_desc")?.value || "",
        })});
        // Clear fields after successful save
        ["#inc_source", "#inc_amount", "#inc_desc"].forEach(sel => {
          const el = content.querySelector(sel); if (el) el.value = "";
        });
        const incDateEl = content.querySelector("#inc_date"); if (incDateEl) incDateEl.value = finTodayStr();
        await loadStore();
        renderFinanceContent();
        injectDashboardCard();
      } catch (e) { alert("Save failed: " + e.message); }
      finally { if (savingEl) savingEl.style.display = "none"; }
    });

    // ── DELETE EXPENSE (API) ──
    content.querySelectorAll("[data-exp-delete]").forEach(btn => {
      btn.addEventListener("click", async () => {
        const id = Number(btn.dataset.expDelete);
        if (!confirm("Delete this expense record?")) return;
        try {
          await api(`/api/modules/${EXPENSE_KEY}/${id}`, { method: "DELETE" });
          await loadStore();
          renderFinanceContent();
          injectDashboardCard();
        } catch (e) { alert("Delete failed: " + e.message); }
      });
    });

    // ── SAVE EXPENSE (API) ──
    content.querySelector("#exp_save")?.addEventListener("click", async () => {
      const head = content.querySelector("#exp_head")?.value?.trim();
      const amount = Number(content.querySelector("#exp_amount")?.value);
      if (!head || !amount) return alert("Head and Amount are required.");
      const savingEl = content.querySelector("#exp_saving");
      if (savingEl) savingEl.style.display = "inline";
      try {
        await api(`/api/modules/${EXPENSE_KEY}`, { method: "POST", body: JSON.stringify({
          date: content.querySelector("#exp_date")?.value || finTodayStr(),
          head,
          category: content.querySelector("#exp_category")?.value,
          amount,
          mode: content.querySelector("#exp_mode")?.value,
          description: content.querySelector("#exp_desc")?.value || "",
        })});
        // Clear fields after successful save
        ["#exp_head", "#exp_amount", "#exp_desc"].forEach(sel => {
          const el = content.querySelector(sel); if (el) el.value = "";
        });
        const expDateEl = content.querySelector("#exp_date"); if (expDateEl) expDateEl.value = finTodayStr();
        await loadStore();
        renderFinanceContent();
        injectDashboardCard();
      } catch (e) { alert("Save failed: " + e.message); }
      finally { if (savingEl) savingEl.style.display = "none"; }
    });
  }

  /* ─── NAV INJECTION ──────────────────────────────────────── */
  function injectFinanceNavItem() {
    const nav = document.getElementById("moduleNav");
    if (!nav || nav.querySelector("[data-module='financeModule']")) return;
    const divider = document.createElement("div");
    divider.style.cssText = "padding:8px 16px;font-size:0.68rem;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:rgba(255,255,255,0.3);margin-top:6px;";
    divider.textContent = "Finance";
    const btn = document.createElement("button");
    btn.dataset.module = "financeModule";
    btn.style.cssText = "display:flex;align-items:center;gap:10px;width:100%;padding:10px 16px;background:none;border:none;color:rgba(255,255,255,0.75);cursor:pointer;font-size:0.85rem;border-radius:8px;text-align:left;";
    btn.innerHTML = `<span style="font-size:1.1rem;">💰</span><span>Finance & Investment</span>`;
    btn.addEventListener("click", openFinanceModule);
    nav.appendChild(divider);
    nav.appendChild(btn);
  }

  /* ─── PATCH renderAll ────────────────────────────────────── */
  // Use late-binding: capture the reference at call time, not at parse time.
  // This prevents issues if renderAll is defined after this IIFE runs.
  const _origRenderAll = window.renderAll;
  window.renderAll = function () {
    // Call the original renderAll if it existed before our patch
    if (typeof _origRenderAll === "function") _origRenderAll.apply(this, arguments);
    // Re-inject finance UI elements after the DOM updates
    setTimeout(() => {
      injectDashboardCard();
      injectFinanceNavItem();
    }, 80);
  };

  /* ─── INIT ───────────────────────────────────────────────── */
  async function financeInit() {
    // Wait until boot() has called loadStore() and serverStore has real data.
    // serverStore starts as {} (truthy/non-null), so we must wait until it
    // has at least one key (users, students, etc.) before proceeding.
    const check = () => {
      if (
        typeof serverStore !== "undefined" &&
        serverStore !== null &&
        Object.keys(serverStore).length > 0
      ) {
        injectDashboardCard();
        injectFinanceNavItem();
      } else {
        setTimeout(check, 300);
      }
    };
    check();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", financeInit);
  } else {
    financeInit();
  }
})();

// ============================================================
// BOOKS & DRESS PRICE MODULE  (plugin — appended to app.js)
// ============================================================
(function () {
  "use strict";

  // ── Local store (in-memory, synced to /api/modules/ endpoints) ──────────
  let bdBooks = [];       // { id, className, itemType:"Book", itemName, price, term }
  let bdDresses = [];     // { id, className, itemType:"Dress", itemName, price, term }
  let feeStructures = []; // { id, className, feeType, amount, term, description }

  const BD_ENDPOINT = "/api/modules/booksAndDress";
  const FS_ENDPOINT = "/api/modules/feeStructures";

  // ── Helpers ──────────────────────────────────────────────────────────────
  function formatINR(n) { return "₹ " + Number(n || 0).toLocaleString("en-IN"); }
  function allClasses() {
    const st = getStore();
    return Array.from(new Set(
      (st.classes || []).map(c => [c.className, c.section].filter(Boolean).join("-")).filter(Boolean)
    )).sort();
  }
  function termOptions() { return ["Q1","Q2","Q3","Q4","Annual"]; }

  async function loadBD() {
    try {
      const rows = await api(BD_ENDPOINT);
      bdBooks   = rows.filter(r => r.itemType === "Book");
      bdDresses = rows.filter(r => r.itemType === "Dress");
    } catch(e) { console.warn("BD load:", e); }
  }

  async function loadFS() {
    try {
      feeStructures = await api(FS_ENDPOINT);
    } catch(e) { console.warn("FS load:", e); feeStructures = []; }
  }

  async function saveBDItem(payload) {
    return api(BD_ENDPOINT, { method: "POST", body: JSON.stringify(payload) });
  }

  async function deleteBDItem(id) {
    return api(`${BD_ENDPOINT}/${id}`, { method: "DELETE" });
  }

  async function updateBDItem(id, payload) {
    return api(`${BD_ENDPOINT}/${id}`, { method: "PUT", body: JSON.stringify(payload) });
  }

  async function saveFSItem(payload) {
    return api(FS_ENDPOINT, { method: "POST", body: JSON.stringify(payload) });
  }

  async function deleteFSItem(id) {
    return api(`${FS_ENDPOINT}/${id}`, { method: "DELETE" });
  }

  async function updateFSItem(id, payload) {
    return api(`${FS_ENDPOINT}/${id}`, { method: "PUT", body: JSON.stringify(payload) });
  }

  // ── Compute totals for a class ────────────────────────────────────────────
  function classTotal(className, itemType) {
    const rows = itemType === "Book" ? bdBooks : bdDresses;
    return rows.filter(r => r.className === className)
               .reduce((s, r) => s + Number(r.price || 0), 0);
  }

  function classSummary(className) {
    const books   = bdBooks.filter(r => r.className === className);
    const dresses = bdDresses.filter(r => r.className === className);
    const bookTotal   = books.reduce((s, r) => s + Number(r.price || 0), 0);
    const dressTotal  = dresses.reduce((s, r) => s + Number(r.price || 0), 0);
    return { books, dresses, bookTotal, dressTotal, total: bookTotal + dressTotal };
  }

  // ── Main module render ────────────────────────────────────────────────────
  function renderBDModule() {
    const classes = allClasses();

    // Inject into the standard content-area to prevent global overlap
    const main = document.getElementById("moduleContent") || document.querySelector(".content-area");
    // Ensure the container is visible
    if (main) main.style.display = "block";
    let panel = document.getElementById("bd-panel");
    if (!panel) {
      panel = document.createElement("div");
      panel.id = "bd-panel";
      panel.style.cssText = "padding:24px;max-width:1200px;margin:0 auto;";
      if (main) main.appendChild(panel);
    }
    panel.style.display = "block";

    panel.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;margin-bottom:20px;">
        <div>
          <h2 style="margin:0;font-size:1.4rem;color:var(--primary,#1e3a8a);">📦 Books & Dress Prices</h2>
          <p style="margin:4px 0 0;color:#64748b;font-size:0.88rem;">Manage class-wise book and dress costs. Auto-linked to Fee receipts.</p>
        </div>
        <div style="display:flex;gap:10px;flex-wrap:wrap;">
          <button id="bd-add-btn" style="background:#1e3a8a;color:#fff;border:none;border-radius:8px;padding:9px 18px;cursor:pointer;font-size:0.9rem;">+ Add Item</button>
          <button id="bd-refresh-btn" style="background:#f1f5f9;border:1px solid #cbd5e1;border-radius:8px;padding:9px 14px;cursor:pointer;font-size:0.9rem;">🔄</button>
        </div>
      </div>

      <!-- Class filter -->
      <div style="display:flex;gap:12px;align-items:center;margin-bottom:18px;flex-wrap:wrap;">
        <label style="font-size:0.88rem;color:#475569;font-weight:600;">Filter Class:</label>
        <select id="bd-class-filter" style="border:1px solid #cbd5e1;border-radius:8px;padding:7px 12px;font-size:0.9rem;background:#fff;">
          <option value="">All Classes</option>
          ${classes.map(c => `<option value="${c}">${c}</option>`).join("")}
        </select>
        <select id="bd-type-filter" style="border:1px solid #cbd5e1;border-radius:8px;padding:7px 12px;font-size:0.9rem;background:#fff;">
          <option value="">Books & Dresses</option>
          <option value="Book">Books Only</option>
          <option value="Dress">Dresses Only</option>
        </select>
      </div>

      <!-- Summary cards -->
      <div id="bd-summary-cards" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:14px;margin-bottom:22px;"></div>

      <!-- Items table -->
      <div style="background:#fff;border-radius:12px;border:1px solid #e2e8f0;overflow:hidden;">
        <table id="bd-table" style="width:100%;border-collapse:collapse;font-size:0.88rem;">
          <thead style="background:#f8fafc;border-bottom:2px solid #e2e8f0;">
            <tr>
              <th style="padding:12px 16px;text-align:left;color:#475569;">#</th>
              <th style="padding:12px 16px;text-align:left;color:#475569;">Class</th>
              <th style="padding:12px 16px;text-align:left;color:#475569;">Type</th>
              <th style="padding:12px 16px;text-align:left;color:#475569;">Item Name</th>
              <th style="padding:12px 16px;text-align:left;color:#475569;">Term</th>
              <th style="padding:12px 16px;text-align:right;color:#475569;">Price</th>
              <th style="padding:12px 16px;text-align:center;color:#475569;">Actions</th>
            </tr>
          </thead>
          <tbody id="bd-tbody"></tbody>
        </table>
        <div id="bd-empty" style="display:none;text-align:center;padding:40px;color:#94a3b8;">No items found. Click "+ Add Item" to begin.</div>
      </div>

      <!-- Add/Edit Modal -->
      <div id="bd-modal" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:9999;align-items:center;justify-content:center;">
        <div style="background:#fff;border-radius:16px;width:min(480px,95vw);padding:28px;box-shadow:0 20px 60px rgba(0,0,0,0.2);">
          <h3 id="bd-modal-title" style="margin:0 0 20px;color:#1e3a8a;">Add Item</h3>
          <form id="bd-form" style="display:grid;gap:14px;">
            <input type="hidden" id="bd-edit-id">
            <div>
              <label style="display:block;font-size:0.85rem;font-weight:600;color:#475569;margin-bottom:6px;">Class *</label>
              <select id="bd-f-class" required style="width:100%;border:1px solid #cbd5e1;border-radius:8px;padding:9px 12px;font-size:0.9rem;">
                <option value="">Select Class</option>
                ${classes.map(c => `<option value="${c}">${c}</option>`).join("")}
              </select>
            </div>
            <div>
              <label style="display:block;font-size:0.85rem;font-weight:600;color:#475569;margin-bottom:6px;">Type *</label>
              <select id="bd-f-type" required style="width:100%;border:1px solid #cbd5e1;border-radius:8px;padding:9px 12px;font-size:0.9rem;">
                <option value="Book">📚 Book</option>
                <option value="Dress">👕 Dress / Uniform</option>
              </select>
            </div>
            <div>
              <label style="display:block;font-size:0.85rem;font-weight:600;color:#475569;margin-bottom:6px;">Item Name *</label>
              <input id="bd-f-name" required placeholder="e.g. Mathematics Textbook, Summer Uniform" style="width:100%;border:1px solid #cbd5e1;border-radius:8px;padding:9px 12px;font-size:0.9rem;box-sizing:border-box;">
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
              <div>
                <label style="display:block;font-size:0.85rem;font-weight:600;color:#475569;margin-bottom:6px;">Price (₹) *</label>
                <input id="bd-f-price" type="number" min="0" required placeholder="0" style="width:100%;border:1px solid #cbd5e1;border-radius:8px;padding:9px 12px;font-size:0.9rem;box-sizing:border-box;">
              </div>
              <div>
                <label style="display:block;font-size:0.85rem;font-weight:600;color:#475569;margin-bottom:6px;">Term</label>
                <select id="bd-f-term" style="width:100%;border:1px solid #cbd5e1;border-radius:8px;padding:9px 12px;font-size:0.9rem;">
                  <option value="Annual">Annual</option>
                  ${termOptions().filter(t=>t!=="Annual").map(t=>`<option value="${t}">${t}</option>`).join("")}
                </select>
              </div>
            </div>
            <div style="display:flex;gap:12px;justify-content:flex-end;margin-top:8px;">
              <button type="button" id="bd-modal-cancel" style="padding:9px 20px;border:1px solid #cbd5e1;border-radius:8px;background:#f8fafc;cursor:pointer;font-size:0.9rem;">Cancel</button>
              <button type="submit" style="padding:9px 24px;border:none;border-radius:8px;background:#1e3a8a;color:#fff;cursor:pointer;font-size:0.9rem;">Save</button>
            </div>
          </form>
        </div>
      </div>
    `;

    attachBDListeners();
    renderBDTable();
    renderBDSummaryCards();

    // ── Fee Structures section ────────────────────────────────────────────
    let fsSection = document.getElementById("fs-section");
    if (!fsSection) {
      fsSection = document.createElement("div");
      fsSection.id = "fs-section";
      panel.appendChild(fsSection);
    }
    fsSection.innerHTML = `
      <div style="margin-top:32px;">
        <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;margin-bottom:14px;">
          <div>
            <h3 style="margin:0;font-size:1.1rem;color:#1e3a8a;">💰 Monthly Fee Structures</h3>
            <p style="margin:3px 0 0;color:#64748b;font-size:0.82rem;">Set class-wise monthly fee amounts. These appear as a dropdown when adding a fee record.</p>
          </div>
          <button id="fs-add-btn" style="background:#1e3a8a;color:#fff;border:none;border-radius:8px;padding:8px 16px;cursor:pointer;font-size:0.88rem;">+ Add Fee Structure</button>
        </div>
        <div style="background:#fff;border-radius:12px;border:1px solid #e2e8f0;overflow:hidden;">
          <table id="fs-table" style="width:100%;border-collapse:collapse;font-size:0.86rem;">
            <thead style="background:#f8fafc;border-bottom:2px solid #e2e8f0;">
              <tr>
                <th style="padding:10px 14px;text-align:left;color:#475569;">#</th>
                <th style="padding:10px 14px;text-align:left;color:#475569;">Class</th>
                <th style="padding:10px 14px;text-align:left;color:#475569;">Fee Type</th>
                <th style="padding:10px 14px;text-align:left;color:#475569;">Term</th>
                <th style="padding:10px 14px;text-align:left;color:#475569;">Description</th>
                <th style="padding:10px 14px;text-align:right;color:#475569;">Amount (₹)</th>
                <th style="padding:10px 14px;text-align:center;color:#475569;">Actions</th>
              </tr>
            </thead>
            <tbody id="fs-tbody"></tbody>
          </table>
          <div id="fs-empty" style="display:none;text-align:center;padding:32px;color:#94a3b8;font-size:0.88rem;">No fee structures yet. Click "+ Add Fee Structure" to begin.</div>
        </div>
      </div>

      <!-- Fee Structure Modal -->
      <div id="fs-modal" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:9999;align-items:center;justify-content:center;">
        <div style="background:#fff;border-radius:16px;width:min(460px,95vw);padding:26px;box-shadow:0 20px 60px rgba(0,0,0,0.2);">
          <h3 id="fs-modal-title" style="margin:0 0 18px;color:#1e3a8a;">Add Fee Structure</h3>
          <form id="fs-form" style="display:grid;gap:13px;">
            <input type="hidden" id="fs-edit-id">
            <div>
              <label style="display:block;font-size:0.84rem;font-weight:600;color:#475569;margin-bottom:5px;">Class *</label>
              <select id="fs-f-class" required style="width:100%;border:1px solid #cbd5e1;border-radius:8px;padding:8px 12px;font-size:0.88rem;">
                <option value="">Select Class</option>
                ${allClasses().map(c => `<option value="${c}">${c}</option>`).join("")}
              </select>
            </div>
            <div>
              <label style="display:block;font-size:0.84rem;font-weight:600;color:#475569;margin-bottom:5px;">Fee Type *</label>
              <select id="fs-f-type" required style="width:100%;border:1px solid #cbd5e1;border-radius:8px;padding:8px 12px;font-size:0.88rem;">
                <option value="Tuition Fee">Tuition Fee</option>
                <option value="Admission Fee">Admission Fee</option>
                <option value="Development Fee">Development Fee</option>
                <option value="Sports Fee">Sports Fee</option>
                <option value="Lab Fee">Lab Fee</option>
                <option value="Computer Fee">Computer Fee</option>
                <option value="Library Fee">Library Fee</option>
                <option value="Exam Fee">Exam Fee</option>
                <option value="Late Fee">Late Fee</option>
                <option value="Activity Fee">Activity Fee</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label style="display:block;font-size:0.84rem;font-weight:600;color:#475569;margin-bottom:5px;">Amount (₹) *</label>
              <input id="fs-f-amount" type="number" min="0" required placeholder="e.g. 1500" style="width:100%;border:1px solid #cbd5e1;border-radius:8px;padding:8px 12px;font-size:0.88rem;box-sizing:border-box;">
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
              <div>
                <label style="display:block;font-size:0.84rem;font-weight:600;color:#475569;margin-bottom:5px;">Term</label>
                <select id="fs-f-term" style="width:100%;border:1px solid #cbd5e1;border-radius:8px;padding:8px 12px;font-size:0.88rem;">
                  <option value="Monthly">Monthly</option>
                  <option value="Annual">Annual</option>
                  <option value="Q1">Q1</option>
                  <option value="Q2">Q2</option>
                  <option value="Q3">Q3</option>
                  <option value="Q4">Q4</option>
                </select>
              </div>
              <div>
                <label style="display:block;font-size:0.84rem;font-weight:600;color:#475569;margin-bottom:5px;">Description</label>
                <input id="fs-f-desc" type="text" placeholder="Optional note" style="width:100%;border:1px solid #cbd5e1;border-radius:8px;padding:8px 12px;font-size:0.88rem;box-sizing:border-box;">
              </div>
            </div>
            <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:6px;">
              <button type="button" id="fs-modal-cancel" style="padding:8px 18px;border:1px solid #cbd5e1;border-radius:8px;background:#f8fafc;cursor:pointer;font-size:0.88rem;">Cancel</button>
              <button type="submit" style="padding:8px 22px;border:none;border-radius:8px;background:#1e3a8a;color:#fff;cursor:pointer;font-size:0.88rem;">Save</button>
            </div>
          </form>
        </div>
      </div>`;

    attachFSListeners();
    renderFSTable();
  }

  function renderBDSummaryCards() {
    const container = document.getElementById("bd-summary-cards");
    if (!container) return;
    const classes = allClasses();
    if (!classes.length) { container.innerHTML = ""; return; }

    const filterClass = document.getElementById("bd-class-filter")?.value || "";
    const displayClasses = filterClass ? [filterClass] : classes;

    container.innerHTML = displayClasses.map(cls => {
      const { bookTotal, dressTotal, total } = classSummary(cls);
      return `
        <div style="background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:16px;border-top:3px solid #1e3a8a;">
          <div style="font-weight:700;color:#1e3a8a;font-size:1rem;margin-bottom:10px;">Class ${cls}</div>
          <div style="display:flex;justify-content:space-between;font-size:0.83rem;color:#475569;margin-bottom:4px;">
            <span>📚 Books</span><span style="font-weight:600;">${formatINR(bookTotal)}</span>
          </div>
          <div style="display:flex;justify-content:space-between;font-size:0.83rem;color:#475569;margin-bottom:8px;">
            <span>👕 Dress</span><span style="font-weight:600;">${formatINR(dressTotal)}</span>
          </div>
          <div style="border-top:1px solid #e2e8f0;padding-top:8px;display:flex;justify-content:space-between;font-size:0.9rem;">
            <span style="font-weight:700;color:#0f172a;">Total</span>
            <span style="font-weight:800;color:#1e3a8a;font-size:1rem;">${formatINR(total)}</span>
          </div>
        </div>`;
    }).join("");
  }

  function renderBDTable() {
    const tbody = document.getElementById("bd-tbody");
    const empty = document.getElementById("bd-empty");
    if (!tbody) return;

    const filterClass = document.getElementById("bd-class-filter")?.value || "";
    const filterType  = document.getElementById("bd-type-filter")?.value || "";

    let rows = [...bdBooks, ...bdDresses];
    if (filterClass) rows = rows.filter(r => r.className === filterClass);
    if (filterType)  rows = rows.filter(r => r.itemType === filterType);

    // Sort: class → type → name
    rows.sort((a,b) => (a.className||"").localeCompare(b.className||"") ||
                       (a.itemType||"").localeCompare(b.itemType||"") ||
                       (a.itemName||"").localeCompare(b.itemName||""));

    if (!rows.length) {
      tbody.innerHTML = "";
      if(empty) empty.style.display = "block";
      return;
    }
    if(empty) empty.style.display = "none";

    tbody.innerHTML = rows.map((r,i) => `
      <tr style="border-bottom:1px solid #f1f5f9;${i%2===0?"":"background:#fafbff"}">
        <td style="padding:11px 16px;color:#94a3b8;">${i+1}</td>
        <td style="padding:11px 16px;font-weight:600;color:#1e3a8a;">${r.className||"-"}</td>
        <td style="padding:11px 16px;">
          <span style="background:${r.itemType==="Book"?"#dbeafe":"#fce7f3"};color:${r.itemType==="Book"?"#1e40af":"#9d174d"};padding:3px 10px;border-radius:12px;font-size:0.8rem;font-weight:600;">
            ${r.itemType==="Book"?"📚 Book":"👕 Dress"}
          </span>
        </td>
        <td style="padding:11px 16px;">${r.itemName||"-"}</td>
        <td style="padding:11px 16px;color:#64748b;">${r.term||"-"}</td>
        <td style="padding:11px 16px;text-align:right;font-weight:700;color:#0f172a;">${formatINR(r.price)}</td>
        <td style="padding:11px 16px;text-align:center;">
          <button data-bd-edit="${r.id}" style="background:#f1f5f9;border:none;border-radius:6px;padding:5px 10px;cursor:pointer;margin-right:4px;font-size:0.82rem;">✏️</button>
          <button data-bd-del="${r.id}" style="background:#fee2e2;border:none;border-radius:6px;padding:5px 10px;cursor:pointer;font-size:0.82rem;">🗑️</button>
        </td>
      </tr>`).join("");

    // Edit/delete event listeners
    tbody.querySelectorAll("[data-bd-edit]").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = Number(btn.dataset.bdEdit);
        const row = [...bdBooks, ...bdDresses].find(r => r.id === id);
        if (!row) return;
        openBDModal(row);
      });
    });
    tbody.querySelectorAll("[data-bd-del]").forEach(btn => {
      btn.addEventListener("click", async () => {
        if (!confirm("Delete this item?")) return;
        await deleteBDItem(Number(btn.dataset.bdDel));
        await loadBD();
        renderBDTable();
        renderBDSummaryCards();
      });
    });
  }

  function openBDModal(existingRow) {
    const modal = document.getElementById("bd-modal");
    if (!modal) return;
    document.getElementById("bd-modal-title").textContent = existingRow ? "Edit Item" : "Add Item";
    document.getElementById("bd-edit-id").value  = existingRow?.id || "";
    document.getElementById("bd-f-class").value  = existingRow?.className || "";
    document.getElementById("bd-f-type").value   = existingRow?.itemType || "Book";
    document.getElementById("bd-f-name").value   = existingRow?.itemName || "";
    document.getElementById("bd-f-price").value  = existingRow?.price || "";
    document.getElementById("bd-f-term").value   = existingRow?.term || "Annual";
    modal.style.display = "flex";
  }

  function closeBDModal() {
    const modal = document.getElementById("bd-modal");
    if (modal) modal.style.display = "none";
  }

  function attachBDListeners() {
    document.getElementById("bd-add-btn")?.addEventListener("click", () => openBDModal(null));
    document.getElementById("bd-modal-cancel")?.addEventListener("click", closeBDModal);
    document.getElementById("bd-refresh-btn")?.addEventListener("click", async () => {
      await loadBD();
      renderBDTable();
      renderBDSummaryCards();
    });

    document.getElementById("bd-class-filter")?.addEventListener("change", () => {
      renderBDTable();
      renderBDSummaryCards();
      renderFSTable();
    });
    document.getElementById("bd-type-filter")?.addEventListener("change", renderBDTable);

    document.getElementById("bd-form")?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const editId = document.getElementById("bd-edit-id").value;
      const payload = {
        className: document.getElementById("bd-f-class").value,
        itemType:  document.getElementById("bd-f-type").value,
        itemName:  document.getElementById("bd-f-name").value,
        price:     document.getElementById("bd-f-price").value,
        term:      document.getElementById("bd-f-term").value,
      };
      if (editId) {
        await updateBDItem(Number(editId), payload);
      } else {
        await saveBDItem(payload);
      }
      closeBDModal();
      await loadBD();
      renderBDTable();
      renderBDSummaryCards();
    });
  }

  // ── Fee Structures table, modal, listeners ────────────────────────────────

  function renderFSTable() {
    const tbody = document.getElementById("fs-tbody");
    const empty = document.getElementById("fs-empty");
    if (!tbody) return;

    const filterClass = document.getElementById("bd-class-filter")?.value || "";

    let rows = [...feeStructures];
    if (filterClass) rows = rows.filter(r => r.className === filterClass);

    rows.sort((a, b) =>
      (a.className || "").localeCompare(b.className || "") ||
      (a.feeType || "").localeCompare(b.feeType || "")
    );

    if (!rows.length) {
      tbody.innerHTML = "";
      if (empty) empty.style.display = "block";
      return;
    }
    if (empty) empty.style.display = "none";

    tbody.innerHTML = rows.map((r, i) => `
      <tr style="border-bottom:1px solid #f1f5f9;${i % 2 === 0 ? "" : "background:#fafbff"}">
        <td style="padding:10px 14px;color:#94a3b8;">${i + 1}</td>
        <td style="padding:10px 14px;font-weight:600;color:#1e3a8a;">${r.className || "-"}</td>
        <td style="padding:10px 14px;">
          <span style="background:#dbeafe;color:#1e40af;padding:2px 10px;border-radius:10px;font-size:0.78rem;font-weight:600;">${r.feeType || "-"}</span>
        </td>
        <td style="padding:10px 14px;color:#64748b;">${r.term || "-"}</td>
        <td style="padding:10px 14px;color:#64748b;font-size:0.83rem;">${r.description || "-"}</td>
        <td style="padding:10px 14px;text-align:right;font-weight:700;color:#0f172a;">${formatINR(r.amount)}</td>
        <td style="padding:10px 14px;text-align:center;">
          <button data-fs-edit="${r.id}" style="background:#f1f5f9;border:none;border-radius:6px;padding:5px 10px;cursor:pointer;margin-right:4px;font-size:0.8rem;">✏️</button>
          <button data-fs-del="${r.id}" style="background:#fee2e2;border:none;border-radius:6px;padding:5px 10px;cursor:pointer;font-size:0.8rem;">🗑️</button>
        </td>
      </tr>`).join("");

    tbody.querySelectorAll("[data-fs-edit]").forEach(btn => {
      btn.addEventListener("click", () => {
        const row = feeStructures.find(r => String(r.id) === String(btn.dataset.fsEdit));
        if (row) openFSModal(row);
      });
    });
    tbody.querySelectorAll("[data-fs-del]").forEach(btn => {
      btn.addEventListener("click", async () => {
        if (!confirm("Delete this fee structure?")) return;
        await deleteFSItem(Number(btn.dataset.fsDel));
        await loadFS();
        renderFSTable();
      });
    });
  }

  function openFSModal(existing) {
    const modal = document.getElementById("fs-modal");
    if (!modal) return;
    document.getElementById("fs-modal-title").textContent = existing ? "Edit Fee Structure" : "Add Fee Structure";
    document.getElementById("fs-edit-id").value  = existing?.id || "";
    document.getElementById("fs-f-class").value  = existing?.className || "";
    document.getElementById("fs-f-type").value   = existing?.feeType || "Tuition Fee";
    document.getElementById("fs-f-amount").value = existing?.amount || "";
    document.getElementById("fs-f-term").value   = existing?.term || "Monthly";
    document.getElementById("fs-f-desc").value   = existing?.description || "";
    modal.style.display = "flex";
  }

  function closeFSModal() {
    const modal = document.getElementById("fs-modal");
    if (modal) modal.style.display = "none";
  }

  function attachFSListeners() {
    document.getElementById("fs-add-btn")?.addEventListener("click", () => openFSModal(null));
    document.getElementById("fs-modal-cancel")?.addEventListener("click", closeFSModal);
    document.getElementById("fs-modal")?.addEventListener("click", e => {
      if (e.target === document.getElementById("fs-modal")) closeFSModal();
    });

    document.getElementById("fs-form")?.addEventListener("submit", async e => {
      e.preventDefault();
      const editId = document.getElementById("fs-edit-id").value;
      const payload = {
        className:   document.getElementById("fs-f-class").value,
        feeType:     document.getElementById("fs-f-type").value,
        amount:      document.getElementById("fs-f-amount").value,
        term:        document.getElementById("fs-f-term").value,
        description: document.getElementById("fs-f-desc").value,
      };
      if (editId) {
        await updateFSItem(Number(editId), payload);
      } else {
        await saveFSItem(payload);
      }
      closeFSModal();
      await loadFS();
      renderFSTable();
    });
  }

  // ── NAV injection ────────────────────────────────────────────────────────
  function injectBDNavItem() {
    const nav = document.getElementById("moduleNav");
    if (!nav || nav.querySelector("[data-module='booksAndDress']")) return;

    // Find or create "Resources" group label and inject after it
    const allBtns = Array.from(nav.querySelectorAll("button[data-module]"));
    const resourcesBtn = allBtns.find(b => b.dataset.module === "library");

    const btn = document.createElement("button");
    btn.dataset.module = "booksAndDress";
    btn.className = currentModule === "booksAndDress" ? "active" : "";
    btn.innerHTML = `<span class="nav-icon">📦</span><span>Books & Dress</span>`;
    btn.addEventListener("click", async () => {
      currentModule = "booksAndDress";
      
      showBDPanel();

      // Update active states
      nav.querySelectorAll("button").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      if (window.isMobileLayout && isMobileLayout()) setMobileSidebarOpen(false);
    });

    if (resourcesBtn) {
      resourcesBtn.after(btn);
    } else {
      nav.appendChild(btn);
    }
  }

  window.showBDPanel = async function showBDPanel() {
    // Clear out standard UI bits for this custom plugin view
    const titleEl = document.getElementById("moduleTitle");
    const subtitleEl = document.getElementById("moduleSubtitle");
    if (titleEl) titleEl.innerHTML = "";
    if (subtitleEl) subtitleEl.innerHTML = "";

    await Promise.all([loadBD(), loadFS()]);
    renderBDModule();
  }

  // ── Fee Module integration: enrich receipts & fee form ───────────────────────

  // Build books+dress section HTML for a given className
  function buildBDReceiptSection(className) {
    const summary = classSummary(className);
    if (!summary.books.length && !summary.dresses.length) return "";

    const bookRows = summary.books.map(b =>
      `<tr>
        <td style="padding:7px 10px;border:1px solid #e2e8f0;color:#475569;">&#128218; ${b.itemName}</td>
        <td style="padding:7px 10px;border:1px solid #e2e8f0;text-align:right;font-weight:600;">${formatINR(b.price)}</td>
      </tr>`
    ).join("");
    const dressRows = summary.dresses.map(d =>
      `<tr>
        <td style="padding:7px 10px;border:1px solid #e2e8f0;color:#475569;">&#128085; ${d.itemName}</td>
        <td style="padding:7px 10px;border:1px solid #e2e8f0;text-align:right;font-weight:600;">${formatINR(d.price)}</td>
      </tr>`
    ).join("");

    return `
      <div style="padding:16px 24px;border-bottom:1px solid #e2e8f0;">
        <div style="font-weight:700;color:#1e3a8a;margin-bottom:10px;font-size:15px;">&#128230; Books & Dress Charges — Class ${className}</div>
        <table style="width:100%;border-collapse:collapse;font-size:13px;">
          <thead>
            <tr style="background:#f0f4ff;">
              <th style="padding:7px 10px;border:1px solid #c7d2fe;text-align:left;color:#1e3a8a;">Item</th>
              <th style="padding:7px 10px;border:1px solid #c7d2fe;text-align:right;color:#1e3a8a;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${bookRows}${dressRows}
          </tbody>
          <tfoot>
            <tr style="background:#1e3a8a;">
              <td style="padding:9px 10px;border:1px solid #1e3a8a;font-weight:700;color:#fff;">&#128230; Books & Dress Total</td>
              <td style="padding:9px 10px;border:1px solid #1e3a8a;text-align:right;font-weight:800;color:#fff;">${formatINR(summary.total)}</td>
            </tr>
          </tfoot>
        </table>
      </div>`;
  }

  // ── Shared fee-type definitions (mirrors app.js FEE_TYPES) ────────────────
  const RECEIPT_FEE_TYPES = [
    { key: "tuitionFee",     label: "Tuition Fee",     icon: "📚" },
    { key: "admissionFee",   label: "Admission Fee",   icon: "🎓" },
    { key: "computerFee",    label: "Computer Fee",    icon: "💻" },
    { key: "developmentFee", label: "Development Fee", icon: "🏗️" },
    { key: "labFee",         label: "Lab Fee",         icon: "🔬" },
    { key: "sportsFee",      label: "Sports Fee",      icon: "⚽" },
    { key: "libraryFee",     label: "Library Fee",     icon: "📖" },
    { key: "examFee",        label: "Exam Fee",        icon: "📝" },
    { key: "lateFee",        label: "Late Fee",        icon: "⏳" },
    { key: "otherFee",       label: "Other Fee",       icon: "➕" }
  ];

  // Build fee rows: first try individual fee type fields, fall back to feeTypes label string
  function buildFeeRows_receipt(f) {
    let rows = "";
    let hasIndividual = false;

    RECEIPT_FEE_TYPES.forEach(({ key, label, icon }, idx) => {
      const amt = parseFloat(f[key]) || 0;
      if (amt > 0) {
        hasIndividual = true;
        const bg = idx % 2 === 0 ? "#f8fafc" : "#ffffff";
        // Append months only to tuition/monthly fees
        const isMonthly = key === "tuitionFee" || label.toLowerCase().includes("tuition") || label.toLowerCase().includes("monthly");
        const mSuffix = (f.month && isMonthly) ? ` (${f.month})` : "";
        rows += `<tr style="background:${bg};">
          <td style="padding:5px 8px;border:1px solid #e2e8f0;color:#475569;font-size:11px;">${icon} ${label}${mSuffix}</td>
          <td style="padding:5px 8px;border:1px solid #e2e8f0;text-align:right;font-weight:600;font-size:11px;">₹ ${amt.toLocaleString("en-IN")}</td>
        </tr>`;
      }
    });

    // Fallback: if no individual fee fields set, try monthlyFeeLabel or feeTypes
    if (!hasIndividual) {
      const labels = (f.feeTypes || f.monthlyFeeLabel || "").trim();
      const totalMonthly = parseFloat(f.monthlyFee) || parseFloat(f.totalFee) || 0;
      if (labels && totalMonthly > 0) {
        // Show each fee type label on separate rows, distributing total equally or show as lump
        const parts = labels.split(",").map(s => s.trim()).filter(Boolean);
        if (parts.length > 0) {
          const perPart = totalMonthly / parts.length;
          parts.forEach((part, idx) => {
            const bg = idx % 2 === 0 ? "#f8fafc" : "#ffffff";
            rows += `<tr style="background:${bg};">
              <td style="padding:5px 8px;border:1px solid #e2e8f0;color:#475569;font-size:11px;">💳 ${part}</td>
              <td style="padding:5px 8px;border:1px solid #e2e8f0;text-align:right;font-weight:600;font-size:11px;">₹ ${perPart.toLocaleString("en-IN")}</td>
            </tr>`;
          });
        } else {
          rows += `<tr style="background:#f8fafc;">
            <td style="padding:5px 8px;border:1px solid #e2e8f0;color:#475569;font-size:11px;">💳 School Fee</td>
            <td style="padding:5px 8px;border:1px solid #e2e8f0;text-align:right;font-weight:600;font-size:11px;">₹ ${totalMonthly.toLocaleString("en-IN")}</td>
          </tr>`;
        }
      }
    }
    
    // ── ALWAYS check for Due Management amount ──
    const dueAmt = parseFloat(f.dueMgmtAmount) || 0;
    if (dueAmt > 0) {
      const particulars = f.dueMgmtParticulars || "Outstanding Dues";
      rows += `<tr style="background:#fff1f2;">
        <td style="padding:5px 8px;border:1px solid #e2e8f0;color:#991b1b;font-size:11px;font-weight:700;">💳 ${particulars}</td>
        <td style="padding:5px 8px;border:1px solid #e2e8f0;text-align:right;font-weight:700;font-size:11px;color:#991b1b;">₹ ${dueAmt.toLocaleString("en-IN")}</td>
      </tr>`;
    }

    return rows;
  }

  function buildA4PrintHtml(title, singleCardHtml) {
    // Prints 4 identical copies on one A4 page (2×2 grid)
    const card = singleCardHtml;
    return `<!doctype html><html><head><title>${title}</title>
    <style>
      @page { size: A4 portrait; margin: 8mm; }
      * { box-sizing: border-box; }
      body { margin: 0; padding: 0; font-family: Arial, sans-serif; background: #fff; }
      .a4-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        grid-template-rows: 1fr 1fr;
        gap: 6mm;
        width: 100%;
        height: 277mm;
      }
      .receipt-copy {
        border: 1.5px solid #1e3a8a;
        border-radius: 6px;
        overflow: hidden;
        page-break-inside: avoid;
        font-size: 11px;
      }
      @media print {
        body { margin: 0; }
        .no-print { display: none; }
      }
    </style></head><body>
    <div class="a4-grid">
      <div class="receipt-copy">${card}</div>
      <div class="receipt-copy">${card}</div>
      <div class="receipt-copy">${card}</div>
      <div class="receipt-copy">${card}</div>
    </div>
    <script>window.onload=function(){window.print();}<\/script>
    </body></html>`;
  }

  // Directly override printFeeReceipt with full rebuilt version including BD section
  window.getConsolidatedFeeRecord = function(f) {
    if (!f || !f.admissionNo || !f.paymentDate) return f;
    const store = getStore();
    const allFees = store.fees || [];
    
    const targetAdm = String(f.admissionNo).trim().toLowerCase();
    const targetDate = String(f.paymentDate).trim();
    const targetMethod = String(f.paymentMethod || "").trim().toLowerCase();

    // Find sibling records paid by same student on same day with same method
    const siblings = allFees.filter(r => 
      String(r.admissionNo || "").trim().toLowerCase() === targetAdm && 
      String(r.paymentDate || "").trim() === targetDate &&
      (targetMethod === "" || String(r.paymentMethod || "").trim().toLowerCase() === targetMethod)
    );
    
    console.log(`[Consolidation] Found ${siblings.length} records for ${targetAdm} on ${targetDate}`);
    if (siblings.length <= 1) return f;
    
    const consolidated = { ...f, feeTypes: "", month: "" };
    const academicOrder = ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"];
    
    // Aggregate amounts
    const feeFields = ["tuitionFee", "admissionFee", "computerFee", "developmentFee", "labFee", "sportsFee", "libraryFee", "examFee", "lateFee", "otherFee", "totalFee", "paidAmount", "balance"];
    feeFields.forEach(k => { consolidated[k] = 0; });
    
    const monthSet = new Set();
    const feeTypeSet = new Set();
    const bdIdsSet = new Set();
    
    siblings.forEach(s => {
      feeFields.forEach(k => { consolidated[k] += (parseFloat(s[k]) || 0); });
      if (s.month) s.month.split(",").forEach(m => monthSet.add(m.trim()));
      if (s.feeTypes) s.feeTypes.split(",").forEach(t => feeTypeSet.add(t.trim()));
      try {
        const ids = JSON.parse(s.selectedBookIds || "[]");
        ids.forEach(id => bdIdsSet.add(id));
      } catch(e) {}
    });
    
    // Convert sets back to strings/arrays
    consolidated.month = Array.from(monthSet).sort((a,b) => academicOrder.indexOf(a) - academicOrder.indexOf(b)).join(", ");
    consolidated.feeTypes = Array.from(feeTypeSet).join(", ");
    consolidated.selectedBookIds = JSON.stringify(Array.from(bdIdsSet));
    
    // Convert numbers back to strings for compatibility
    feeFields.forEach(k => { consolidated[k] = String(consolidated[k]); });
    
    // Recover descriptions if available (Strict Deduplication & Cleaning)
    let pList = siblings.map(s => s.dueMgmtParticulars).filter(Boolean).map(p => p.trim());
    const particularsSet = new Set(pList);
    consolidated.dueMgmtParticulars = Array.from(particularsSet).join("; ");
    consolidated.dueMgmtAmount = String(siblings.reduce((acc, s) => acc + (parseFloat(s.dueMgmtAmount) || 0), 0));

    return consolidated;
  };

  window.printFeeReceipt = function(f) {
    f = window.getConsolidatedFeeRecord(f);
    const store = getStore();
    const schoolName = "Tapowan Public School";
    const receiptNo = "RCP-" + (f.id || Date.now());
    const printDate = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });

    // Backfill missing data from student store if needed
    if (!f.admissionNo || !f.fatherName) {
      const student = (store.students || []).find(s => s.fullName === f.studentName);
      if (student) {
        if (!f.admissionNo) f.admissionNo = student.admissionNo || "";
        if (!f.fatherName) f.fatherName = student.parentName || "";
      }
    }

    const totalFee   = parseFloat(f.totalFee) || 0;
    const paidAmount = parseFloat(f.paidAmount) || 0;
    const balance    = parseFloat(f.balance) || Math.max(0, totalFee - paidAmount);
    const statusColor = String(f.status).toLowerCase() === "paid" ? "#16a34a"
      : String(f.status).toLowerCase() === "partial" ? "#d97706" : "#dc2626";

    // ── Build fee rows from individual stored fields ──────────────────────
    const feeTypeRows = buildFeeRows_receipt(f);

    // ── Books & Dress items ───────────────────────────────────────────────
    let bdRows = ""; let itemsTotal = 0;
    try {
      const ids = JSON.parse(f.selectedBookIds || "[]");
      if (ids.length) {
        const allBDItems = [...(typeof bdBooks !== "undefined" ? bdBooks : []), ...(typeof bdDresses !== "undefined" ? bdDresses : [])];
        ids.map(id => allBDItems.find(r => String(r.id) === String(id)))
           .filter(Boolean)
           .sort((a,b) => (a.itemType||"").localeCompare(b.itemType||"") || (a.itemName||"").localeCompare(b.itemName||""))
           .forEach(item => {
             const price = parseFloat(item.price) || 0;
             itemsTotal += price;
             bdRows += `<tr><td style="padding:5px 8px;border:1px solid #e2e8f0;font-size:11px;color:#475569;">${item.itemType === "Book" ? "📚" : "👕"} ${item.itemName}</td>
               <td style="padding:5px 8px;border:1px solid #e2e8f0;text-align:right;font-size:11px;font-weight:600;">₹ ${price.toLocaleString("en-IN")}</td></tr>`;
           });
      }
    } catch(e) {}

    const noFeeData = !feeTypeRows && itemsTotal === 0;

    const card = `
      <div style="height:100%;display:flex;flex-direction:column;font-family:Arial,sans-serif;font-size:11px;">
        <!-- Header -->
        <div style="background:#1e3a8a;color:#fff;padding:12px 10px;text-align:center;">
          <div style="display:flex;align-items:center;justify-content:center;gap:10px;"><img src="logo.png" style="height:40px;width:auto;object-fit:contain;" alt="Logo" /><div style="font-size:16px;font-weight:900;letter-spacing:0.5px;">${schoolName}</div></div>
          <div style="font-size:11px;opacity:1;margin-top:3px;font-weight:600;">Prem Nagar Tapin North, Ramgarh(JH)</div>
          <div style="font-size:10px;opacity:0.85;margin-top:2px;">FEE PAYMENT RECEIPT</div>
        </div>
        <!-- Meta bar -->
        <div style="display:flex;justify-content:space-between;padding:4px 10px;background:#eef2ff;border-bottom:1px solid #c7d2fe;font-size:9px;color:#1e3a8a;">
          <span><strong>Receipt No:</strong> ${receiptNo}</span>
          <span><strong>Date:</strong> ${printDate}</span>
        </div>
        <!-- Student Info -->
        <div style="padding:8px 10px;border-bottom:1px solid #e2e8f0;">
          <table style="width:100%;border-collapse:collapse;">
            <tr>
              <td style="padding:3px 0;color:#64748b;width:30%;font-size:11px;">Admission No</td>
              <td style="padding:3px 0;font-weight:700;color:#0f172a;font-size:11px;">${f.admissionNo || "-"}</td>
              <td style="padding:3px 0;color:#64748b;width:15%;font-size:11px;">Father</td>
              <td style="padding:3px 0;font-weight:600;font-size:11px;">${f.fatherName || "-"}</td>
            </tr>
            <tr>
              <td style="padding:3px 0;color:#64748b;font-size:11px;">Student Name</td>
              <td style="padding:3px 0;font-weight:700;color:#0f172a;font-size:11px;">${f.studentName || "-"}</td>
              <td style="padding:3px 0;color:#64748b;font-size:11px;">Class</td>
              <td style="padding:3px 0;font-weight:600;font-size:11px;">${f.className || "-"}</td>
            </tr>
            <tr>
              <td style="padding:3px 0;color:#64748b;font-size:11px;">Roll No</td>
              <td style="padding:3px 0;font-size:11px;">${f.rollNo || "-"}</td>
              <td style="padding:3px 0;color:#64748b;font-size:11px;">Pay Date</td>
              <td style="padding:3px 0;font-size:11px;">${f.paymentDate || "-"}</td>
            </tr>
            <tr>
              <td style="padding:3px 0;color:#64748b;font-size:11px;">Term</td>
              <td style="padding:3px 0;font-size:11px;">${f.term || "-"}</td>
              <td style="padding:3px 0;color:#64748b;font-size:11px;">Month(s)</td>
              <td style="padding:3px 0;font-size:11px;font-weight:700;color:#1e3a8a;">${f.month || "-"}</td>
            </tr>
          </table>
        </div>
        <!-- Fee Breakdown -->
        <div style="padding:5px 10px;border-bottom:1px solid #e2e8f0;flex:1;">
          <div style="font-weight:700;color:#1e3a8a;margin-bottom:4px;font-size:10px;">📋 Fee Details</div>
          <table style="width:100%;border-collapse:collapse;">
            ${noFeeData ? `<tr><td colspan="2" style="padding:6px 8px;color:#94a3b8;font-style:italic;text-align:center;font-size:10px;">No fee types selected</td></tr>` : feeTypeRows}
            ${bdRows}
          </table>
        </div>
        <!-- Totals -->
        <div style="padding:5px 10px;border-bottom:1px solid #e2e8f0;">
          <table style="width:100%;border-collapse:collapse;">
            <tr style="background:#eef2ff;">
              <td style="padding:4px 8px;border:1px solid #c7d2fe;font-weight:700;color:#1e3a8a;font-size:11px;">Total Fee</td>
              <td style="padding:4px 8px;border:1px solid #c7d2fe;text-align:right;font-weight:700;color:#1e3a8a;font-size:11px;">₹ ${totalFee.toLocaleString("en-IN")}</td>
            </tr>
            <tr>
              <td style="padding:4px 8px;border:1px solid #e2e8f0;color:#475569;font-size:11px;">Amount Paid</td>
              <td style="padding:4px 8px;border:1px solid #e2e8f0;text-align:right;font-weight:600;color:#16a34a;font-size:11px;">₹ ${paidAmount.toLocaleString("en-IN")}</td>
            </tr>
            <tr style="background:#fef2f2;">
              <td style="padding:4px 8px;border:1px solid #fca5a5;color:#dc2626;font-size:11px;">Balance Due</td>
              <td style="padding:4px 8px;border:1px solid #fca5a5;text-align:right;font-weight:700;color:#dc2626;font-size:11px;">₹ ${balance.toLocaleString("en-IN")}</td>
            </tr>
          </table>
        </div>
        <!-- Status + Footer -->
        <div style="padding:5px 10px;display:flex;justify-content:space-between;align-items:center;background:#f8fafc;border-top:1px solid #e2e8f0;">
          <span style="font-size:9px;color:#94a3b8;">Computer-generated receipt</span>
          <span style="background:${statusColor};color:#fff;padding:2px 10px;border-radius:10px;font-size:9px;font-weight:700;">${(f.status || "PENDING").toUpperCase()}</span>
        </div>
      </div>`;

    const w = window.open("", "_blank");
    if (!w) return window.alert("Popup blocked. Please allow popups for this site and try again.");
    w.document.write(buildA4PrintHtml("Fee Receipt - " + schoolName, card));
    w.document.close();
    w.focus();
  };

  // ── Formal Fee Slip ────────────────────────────────────────────────────────
  window.printFormalFeeSlip = function(origF) {
    const f = window.getConsolidatedFeeRecord(origF);
    const store = getStore();
    const schoolName = "Tapowan Public School";
    const slipNo = "FS-" + (f.id || Date.now());
    const printDate = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });

    // Backfill missing data from student store if needed
    if (!f.admissionNo || !f.fatherName) {
      const student = (store.students || []).find(s => s.fullName === f.studentName);
      if (student) {
        if (!f.admissionNo) f.admissionNo = student.admissionNo || "";
        if (!f.fatherName) f.fatherName = student.parentName || "";
      }
    }

    const totalFee   = parseFloat(f.totalFee) || 0;
    const paidAmount = parseFloat(f.paidAmount) || 0;
    const balance    = parseFloat(f.balance) || Math.max(0, totalFee - paidAmount);
    const statusColor = String(f.status).toLowerCase() === "paid" ? "#16a34a"
      : String(f.status).toLowerCase() === "partial" ? "#d97706" : "#dc2626";
    const statusBg = String(f.status).toLowerCase() === "paid" ? "#dcfce7"
      : String(f.status).toLowerCase() === "partial" ? "#fef3c7" : "#fee2e2";

    // ── Build fee rows from individual stored fields ──────────────────────
    let feeRows = "";
    let hasSlipIndividual = false;
    RECEIPT_FEE_TYPES.forEach(({ key, label, icon }, idx) => {
      const amt = parseFloat(f[key]) || 0;
      if (amt > 0) {
        hasSlipIndividual = true;
        const bg = idx % 2 === 0 ? "#f9fafb" : "#fff";
        const mSfx = (f.month && (key === "tuitionFee" || label.toLowerCase().includes("tuition"))) ? ` (${f.month})` : "";
        feeRows += `<tr style="background:${bg};">
          <td style="padding:6px 10px;border-bottom:1px solid #e5e7eb;font-size:12px;color:#374151;">${icon} ${label}${mSfx}</td>
          <td style="padding:6px 10px;border-bottom:1px solid #e5e7eb;text-align:right;font-size:12px;font-weight:600;color:#111827;">₹ ${amt.toLocaleString("en-IN")}</td>
        </tr>`;
      }
    });
    // Fallback for old records without individual fee fields
    if (!hasSlipIndividual) {
      const labels = (f.feeTypes || f.monthlyFeeLabel || "").trim();
      const totalMonthly = parseFloat(f.monthlyFee) || parseFloat(f.totalFee) || 0;
      if (labels && totalMonthly > 0) {
        const parts = labels.split(",").map(s => s.trim()).filter(Boolean);
        if (parts.length > 0) {
          const perPart = totalMonthly / parts.length;
          parts.forEach((part, idx) => {
            const bg = idx % 2 === 0 ? "#f9fafb" : "#fff";
            feeRows += `<tr style="background:${bg};">
              <td style="padding:5px 9px;border-bottom:1px solid #e5e7eb;font-size:11px;color:#374151;">💳 ${part}</td>
              <td style="padding:5px 9px;border-bottom:1px solid #e5e7eb;text-align:right;font-size:11px;font-weight:600;color:#111827;">₹ ${perPart.toLocaleString("en-IN")}</td>
            </tr>`;
          });
        } else if (totalMonthly > 0) {
          feeRows += `<tr style="background:#f9fafb;">
            <td style="padding:5px 9px;border-bottom:1px solid #e5e7eb;font-size:11px;color:#374151;">💳 School Fee</td>
            <td style="padding:5px 9px;border-bottom:1px solid #e5e7eb;text-align:right;font-size:11px;font-weight:600;color:#111827;">₹ ${totalMonthly.toLocaleString("en-IN")}</td>
          </tr>`;
        }
      }
    }

    // Books & Dress items
    let itemsTotal = 0;
    try {
      const ids = JSON.parse(f.selectedBookIds || "[]");
      if (ids.length) {
        const allBDItems = [...(typeof bdBooks !== "undefined" ? bdBooks : []), ...(typeof bdDresses !== "undefined" ? bdDresses : [])];
        ids.map(id => allBDItems.find(r => String(r.id) === String(id)))
           .filter(Boolean)
           .sort((a,b) => (a.itemType||"").localeCompare(b.itemType||"") || (a.itemName||"").localeCompare(b.itemName||""))
           .forEach((item, idx) => {
          const price = parseFloat(item.price) || 0;
          itemsTotal += price;
          const bg = idx % 2 === 0 ? "#f0f4ff" : "#fff";
          feeRows += `<tr style="background:${bg};"><td style="padding:5px 9px;border-bottom:1px solid #e5e7eb;font-size:11px;color:#374151;">${item.itemType === "Book" ? "📚" : "👕"} ${item.itemName}</td>
            <td style="padding:5px 9px;border-bottom:1px solid #e5e7eb;text-align:right;font-size:11px;font-weight:600;">₹ ${price.toLocaleString("en-IN")}</td></tr>`;
        });
      }
    } catch(e) {}

    // Add Due Management row if exists
    const dueAmt = parseFloat(f.dueMgmtAmount) || 0;
    if (dueAmt > 0) {
      const particulars = f.dueMgmtParticulars || "Outstanding Dues";
      feeRows += `<tr style="background:#fff1f2;">
        <td style="padding:6px 10px;border-bottom:1px solid #e5e7eb;font-size:12px;color:#991b1b;font-weight:700;">🔖 ${particulars}</td>
        <td style="padding:6px 10px;border-bottom:1px solid #e5e7eb;text-align:right;font-size:12px;font-weight:700;color:#991b1b;">₹ ${dueAmt.toLocaleString("en-IN")}</td>
      </tr>`;
    }

    const card = `
      <div style="height:100%;display:flex;flex-direction:column;font-family:Arial,sans-serif;font-size:13px;">
        <!-- Header -->
        <div style="border-bottom:2px solid #1e3a8a;padding:10px 10px;text-align:center;">
          <div style="display:flex;align-items:center;justify-content:center;gap:10px;"><img src="logo.png" style="height:48px;width:auto;object-fit:contain;" alt="Logo" /><div style="font-size:16px;font-weight:900;color:#1e3a8a;letter-spacing:0.5px;text-transform:uppercase;">${schoolName}</div></div>
          <div style="font-size:11px;color:#1e3a8a;font-weight:700;margin-top:2px;">Prem Nagar Tapin North, Ramgarh(JH)</div>
          <div style="font-size:10px;color:#6b7280;margin-top:2px;">Affiliated to CBSE &nbsp;|&nbsp; Excellence in Education</div>
          <div style="margin-top:5px;display:inline-block;background:#1e3a8a;color:#fff;padding:4px 16px;font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;">FEE SLIP</div>
        </div>
        <!-- Slip Meta -->
        <div style="display:flex;justify-content:space-between;padding:3px 10px;background:#eef2ff;border-bottom:1px solid #c7d2fe;font-size:9px;color:#1e3a8a;">
          <span><strong>Slip No:</strong> ${slipNo}</span>
          <span><strong>Term:</strong> ${f.term || "-"}</span>
          <span><strong>Month(s):</strong> ${f.month || "-"}</span>
          <span><strong>Date:</strong> ${printDate}</span>
        </div>
        <!-- Student Info -->
        <div style="padding:8px 10px;border-bottom:1px solid #e5e7eb;">
          <div style="font-size:10px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:5px;">Student Information</div>
          <table style="width:100%;border-collapse:collapse;font-size:12px;">
            <tr>
              <td style="color:#6b7280;width:25%;padding:3px 0;">Student Name</td>
              <td style="font-weight:700;color:#111827;padding:3px 0;border-bottom:1px dotted #d1d5db;width:40%;">${f.studentName || "-"}</td>
              <td style="color:#6b7280;padding:3px 0 3px 6px;width:15%;">Adm. No</td>
              <td style="font-weight:700;padding:3px 0;border-bottom:1px dotted #d1d5db;">${f.admissionNo || "-"}</td>
            </tr>
            <tr>
              <td style="color:#6b7280;padding:3px 0;">Father Name</td>
              <td style="font-weight:700;color:#111827;padding:3px 0;border-bottom:1px dotted #d1d5db;width:40%;">${f.fatherName || "-"}</td>
              <td style="color:#6b7280;padding:3px 0 3px 6px;">Class</td>
              <td style="font-weight:600;padding:3px 0;border-bottom:1px dotted #d1d5db;">${f.className || "-"}</td>
            </tr>
            <tr>
              <td style="color:#6b7280;padding:3px 0;">Roll No.</td>
              <td style="font-weight:600;padding:3px 0;border-bottom:1px dotted #d1d5db;width:40%;">${f.rollNo || "-"}</td>
              <td style="color:#6b7280;padding:3px 0 3px 6px;">Term</td>
              <td style="font-weight:600;padding:3px 0;border-bottom:1px dotted #d1d5db;">${f.term || "-"}</td>
            </tr>
            <tr>
              <td style="color:#6b7280;padding:3px 0;">Pay Date</td>
              <td style="font-weight:600;padding:3px 0;border-bottom:1px dotted #d1d5db;width:40%;">${f.paymentDate || "-"}</td>
              <td style="color:#6b7280;padding:3px 0 3px 6px;">Method</td>
              <td style="font-weight:600;padding:3px 0;border-bottom:1px dotted #d1d5db;">${f.paymentMethod || "-"}</td>
            </tr>
            <tr>
               <td style="color:#6b7280;padding:3px 0;">Status</td>
               <td colspan="3" style="padding:3px 0;"><span style="background:${statusBg};color:${statusColor};font-weight:700;padding:2px 8px;border-radius:4px;font-size:10px;border:1px solid ${statusColor};">${f.status || "Pending"}</span></td>
            </tr>
          </table>
        </div>
        <!-- Totals + QR -->
        <div style="padding:0;border-bottom:1px solid #e5e7eb;flex:0 0 auto;display:flex;">
          <!-- QR Section -->
          <div style="width:100px;border-right:1px solid #e5e7eb;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:10px;background:#f8fafc;">
            <img src="qr.png" style="width:70px;height:70px;object-fit:contain;margin-bottom:4px;" alt="QR" />
            <div style="font-size:8px;color:#6b7280;font-weight:700;text-transform:uppercase;">Scan to Pay</div>
          </div>
          <!-- Totals Table -->
          <div style="flex:1;">
            <table style="width:100%;border-collapse:collapse;">
              <tfoot>
                <tr style="background:#eef2ff;">
                  <td style="padding:6px 9px;font-weight:700;font-size:11px;color:#1e3a8a;border-bottom:1px solid #cbd5e1;">Total Fee</td>
                  <td style="padding:6px 9px;text-align:right;font-weight:700;font-size:11px;color:#1e3a8a;border-bottom:1px solid #cbd5e1;">₹ ${totalFee.toLocaleString("en-IN")}</td>
                </tr>
                <tr style="background:#f0fdf4;">
                  <td style="padding:5px 9px;font-size:10px;color:#374151;border-bottom:1px solid #cbd5e1;">Amount Paid</td>
                  <td style="padding:5px 9px;text-align:right;font-weight:700;color:#16a34a;font-size:10px;border-bottom:1px solid #cbd5e1;">₹ ${paidAmount.toLocaleString("en-IN")}</td>
                </tr>
                <tr style="background:#fef2f2;">
                  <td style="padding:5px 9px;font-size:10px;color:#374151;">Balance Due</td>
                  <td style="padding:5px 9px;text-align:right;font-weight:700;color:#dc2626;font-size:10px;">₹ ${balance.toLocaleString("en-IN")}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
        <!-- Signatures -->
        <div style="padding:5px 10px 4px;display:flex;justify-content:space-between;font-size:9px;">
          <div style="text-align:center;width:30%;"><div style="border-top:1px solid #374151;margin-top:16px;padding-top:3px;color:#374151;">Parent Signature</div></div>
          <div style="text-align:center;width:30%;"><div style="border-top:1px solid #374151;margin-top:16px;padding-top:3px;color:#374151;">Cashier</div></div>
          <div style="text-align:center;width:30%;"><div style="border-top:1px solid #374151;margin-top:16px;padding-top:3px;color:#374151;">Principal</div></div>
        </div>
        <!-- Footer -->
        <div style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:3px 10px;display:flex;justify-content:space-between;font-size:8px;color:#9ca3af;">
          <span>Slip No: ${slipNo}</span>
          <span>Official School Fee Slip — ${schoolName}</span>
        </div>
      </div>`;

    const w = window.open("", "_blank");
    if (!w) return window.alert("Popup blocked. Please allow popups for this site and try again.");
    w.document.write(buildA4PrintHtml("Fee Slip - " + schoolName, card));
    w.document.close();
    w.focus();
  };

  // Populate the monthly fee checkboxes for a given class (supports multi-select)
  function populateMonthlyFeeSelect(cls) {
    const container = document.getElementById("bd-monthly-fee-input");
    if (!container) return;
    // Remember previously checked fee-types by ID (robust — not by amount which may clash)
    const prevIds = (container.dataset.selectedIds || "").split(",").filter(Boolean);
    container.innerHTML = "";
    const options = cls
      ? feeStructures.filter(f => f.className === cls)
      : feeStructures;
    if (options.length) {
      options.forEach(f => {
        const val = String(f.amount);
        const cbId = "bd-fee-cb-" + f.id;
        const label = document.createElement("label");
        label.htmlFor = cbId;
        label.style.cssText = "display:flex;align-items:center;gap:10px;padding:7px 10px;border-radius:8px;cursor:pointer;border:1px solid #e2e8f0;margin-bottom:6px;background:#fff;transition:background 0.15s;";
        const termStr = f.term ? ` <span style='color:#64748b;font-size:0.8rem;'>(${f.term})</span>` : "";
        const descStr = f.description ? ` <span style='color:#64748b;font-size:0.8rem;'>· ${f.description}</span>` : "";
        // Match by fee structure ID — avoids false positives when two types share the same amount
        const isChecked = prevIds.includes(String(f.id));
        label.innerHTML = `
          <input type="checkbox" id="${cbId}" name="bd-monthly-fee-checkbox" value="${val}"
            data-label="${f.feeType}" data-fee-id="${f.id}" data-term="${f.term || ""}"
            style="width:16px;height:16px;accent-color:#1e3a8a;cursor:pointer;flex-shrink:0;"
            ${isChecked ? "checked" : ""}>
          <span style="flex:1;font-size:0.88rem;color:#1e293b;">${f.feeType}${termStr}${descStr}</span>
          <span style="font-weight:700;color:#1e3a8a;white-space:nowrap;">${formatINR(f.amount)}</span>`;
        const cb = label.querySelector("input");
        cb.addEventListener("change", () => {
          // Track selections by fee-structure ID (not by amount) to avoid clashes
          const checked = Array.from(container.querySelectorAll("input[name=\"bd-monthly-fee-checkbox\"]:checked"))
            .map(i => i.dataset.feeId);
          container.dataset.selectedIds = checked.join(",");
          // Keep legacy selectedValues in sync for any external readers
          const checkedVals = Array.from(container.querySelectorAll("input[name=\"bd-monthly-fee-checkbox\"]:checked"))
            .map(i => i.value);
          container.dataset.selectedValues = checkedVals.join(",");
          // Highlight checked rows
          container.querySelectorAll("label").forEach(l => {
            const inp = l.querySelector("input");
            l.style.background = inp?.checked ? "#eff6ff" : "#fff";
          });
          recalcFeeTotals();
        });
        if (isChecked) label.style.background = "#eff6ff";
        container.appendChild(label);
      });
    } else if (cls) {
      container.innerHTML = `<div style="color:#94a3b8;font-size:0.85rem;padding:8px 0;">No fee structures for Class ${cls} — add them in Books &amp; Dress.</div>`;
    } else {
      container.innerHTML = `<div style="color:#94a3b8;font-size:0.85rem;padding:8px 0;">Select a class to see fee structures.</div>`;
    }
    recalcFeeTotals();
  }

  // Recalculate totalFee = monthlyFee + selected book/dress items; update balance
  function recalcFeeTotals() {
    const form = document.getElementById("dynamicForm");
    if (!form) return;

    // ── Month Selection Logic ──
    const monthContainer = form.querySelector("#bd-month-selector");
    const checkedMonths = Array.from(monthContainer?.querySelectorAll("input[type='checkbox']:checked") || []);
    const monthCount = Math.max(1, checkedMonths.length);
    
    // Sync the read-only "month" field if it exists
    const monthInput = form.querySelector("[name='month']");
    if (monthInput && monthContainer) {
      if (checkedMonths.length > 0) {
        monthInput.value = checkedMonths.map(i => i.value).join(", ");
      } else {
        monthInput.value = "";
      }
    }

    const monthlyFeeEl = form.querySelector("#bd-monthly-fee-input");
    const totalFeeInput = form.querySelector("[name='totalFee']");
    const paidInput     = form.querySelector("[name='paidAmount']");
    const balanceInput  = form.querySelector("[name='balance']");

    // Sum all checked fee type checkboxes (multi-select)
    let monthlyFee = 0;
    monthlyFeeEl?.querySelectorAll("input[name=\"bd-monthly-fee-checkbox\"]:checked").forEach(cb => {
      const baseAmt = parseFloat(cb.value || 0) || 0;
      const isMonthly = (cb.dataset.label || "").toLowerCase().includes("tuition") || (cb.dataset.term || "").toLowerCase().includes("monthly");
      
      if (isMonthly) {
        monthlyFee += baseAmt * monthCount;
      } else {
        monthlyFee += baseAmt;
      }
    });

    // Sum only checked book/dress items
    let selectedExtra = 0;
    form.querySelectorAll(".bd-item-checkbox:checked").forEach(cb => {
      selectedExtra += parseFloat(cb.dataset.price || 0) || 0;
    });

    const total = monthlyFee + selectedExtra + (appliedDueMgmtAmount || 0);

    if (totalFeeInput) {
      totalFeeInput.value = total;
      totalFeeInput.readOnly = true;
      totalFeeInput.style.background = "#f1f5f9";
      totalFeeInput.style.cursor = "not-allowed";
    }

    if (balanceInput) {
      const paid = parseFloat(paidInput?.value || 0) || 0;
      balanceInput.value = Math.max(0, total - paid);
      balanceInput.readOnly = true;
      balanceInput.style.background = "#f1f5f9";
      balanceInput.style.cursor = "not-allowed";
    }

    // Update running total shown in the panel
    const totalDisplay = document.getElementById("bd-running-total");
    if (totalDisplay) {
      totalDisplay.textContent = formatINR(total);
    }
  }

  // ── Outstanding Balance Alert Logic ──
  window.applyDueMgmtToFee = function(admissionNo) {
    const store = getStore();
    
    // 1. Collect Fee module dues
    const studentFees = (store.fees || []).filter(f => String(f.admissionNo) === String(admissionNo) && (parseFloat(f.balance) || 0) > 0);
    const feesDueAmt = studentFees.reduce((sum, f) => sum + (parseFloat(f.balance) || 0), 0);
    const feeIds = studentFees.map(f => f.id);
    
    // 2. Collect Due Management dues
    const studentDues = (store.dueManagement || []).filter(h => String(h.admissionNo) === String(admissionNo) && h.status !== "Paid");
    const mgmtDueAmt = studentDues.reduce((sum, d) => sum + (parseFloat(d.balance) || 0), 0);
    const mgmtIds = studentDues.map(d => d.id);
    
    if (feesDueAmt === 0 && mgmtDueAmt === 0) return;
    
    appliedDueMgmtAmount = feesDueAmt + mgmtDueAmt;
    appliedFeeIds = feeIds;
    appliedDueMgmtIds = mgmtIds;
    
    // Combine particulars
    const particularsArr = [];
    if (feesDueAmt > 0) particularsArr.push(`Prev. Fee Balance (₹${feesDueAmt})`);
    if (mgmtDueAmt > 0) {
      // Pull particulars and include session in brackets if available
      const mgmtNotes = studentDues.map(d => {
        const p = d.particulars || "Previous Session Balance";
        return d.session ? `${p} (${d.session})` : p;
      }).join(", ");
      particularsArr.push(mgmtNotes);
    }
    appliedDueMgmtParticulars = particularsArr.join(", ");
    
    const form = document.getElementById("dynamicForm");
    if (form) {
      const termInput = form.querySelector("[name='term']");
      if (termInput) {
        termInput.value = appliedDueMgmtParticulars;
      }
      
      const btn = document.getElementById("bd-add-due-btn");
      if (btn) {
        btn.innerHTML = "<span>✅</span> Added All Dues";
        btn.style.background = "#059669";
        btn.disabled = true;
      }
      
      recalcFeeTotals();
      if (typeof showToast === "function") showToast("All outstanding dues added to slip", "success");
    }
  };

  window.renderStudentDueAlert = function(admissionNo) {
    const container = document.getElementById("bd-due-alert-container");
    if (!container || currentModule !== "fees") return;

    if (!admissionNo) {
      container.innerHTML = "";
      appliedDueMgmtAmount = 0;
      appliedDueMgmtParticulars = "";
      appliedDueMgmtIds = [];
      appliedFeeIds = [];
      return;
    }

    const store = getStore();
    const studentFees = (store.fees || []).filter(f => String(f.admissionNo) === String(admissionNo));
    const totalFeesDue = studentFees.reduce((sum, f) => sum + (parseFloat(f.balance) || 0), 0);
    
    const studentDues = (store.dueManagement || []).filter(h => String(h.admissionNo) === String(admissionNo) && h.status !== "Paid");
    const totalMgmtDue = studentDues.reduce((sum, d) => sum + (parseFloat(d.balance) || 0), 0);

    const grandTotal = totalFeesDue + totalMgmtDue;

    if (grandTotal > 0) {
      let breakdownHtml = "";
      if (totalFeesDue > 0 && totalMgmtDue > 0) {
        breakdownHtml = `<div style="color:#b91c1c; font-size:0.75rem; margin-top:2px;">(Fee Balance: ${formatINR(totalFeesDue)} + Management Dues: ${formatINR(totalMgmtDue)})</div>`;
      }

      container.innerHTML = `
        <div style="background:#fef2f2; border:1px solid #fecaca; border-radius:12px; padding:12px 16px; display:flex; align-items:center; gap:16px; animation: slideDown 0.3s ease-out; margin-top:10px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
          <div style="background:#ef4444; color:#fff; width:32px; height:32px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:bold; font-size:18px; flex-shrink:0;">!</div>
          <div style="flex:1;">
            <div style="color:#991b1b; font-weight:700; font-size:0.95rem;">Outstanding Balance Detected</div>
            <div style="color:#b91c1c; font-size:0.85rem;">Total unpaid dues: <strong style="font-size:1rem; margin-left:4px;">${formatINR(grandTotal)}</strong></div>
            ${breakdownHtml}
          </div>
          <div style="display:flex; gap:8px; align-items:center;">
            <button id="bd-add-due-btn" type="button" onclick="applyDueMgmtToFee('${admissionNo}')" 
              style="background:#ef4444; color:#fff; border:none; padding:6px 12px; border-radius:6px; font-size:0.8rem; font-weight:700; cursor:pointer; transition: all 0.2s; display:flex; align-items:center; gap:4px;">
              <span>➕</span> Add to current Slip
            </button>
            <button type="button" onclick="this.parentElement.parentElement.style.display='none'" style="background:none; border:none; color:#f87171; cursor:pointer; font-size:18px; padding:4px;">✕</button>
          </div>
        </div>
      `;
    } else {
      container.innerHTML = "";
      appliedDueMgmtAmount = 0;
      appliedDueMgmtParticulars = "";
      appliedDueMgmtIds = [];
      appliedFeeIds = [];
    }
  };

  function showBDInfoForClass(cls) {
    // Update the monthly fee checkboxes for the selected class
    populateMonthlyFeeSelect(cls);

    let info = document.getElementById("bd-fee-info");
    if (!info) return;

    // Auto-hide: if no class selected, hide the panel entirely
    if (!cls) {
      info.style.display = "none";
      return;
    }

    const s = classSummary(cls);
    const allItems = [...s.books, ...s.dresses];

    // Auto-hide: show only when there are items OR fee structures for this class
    const hasFeeStructures = feeStructures.some(f => f.className === cls);
    if (!allItems.length && !hasFeeStructures) {
      info.style.display = "none";
      return;
    }

    // Remember previously checked books and dresses
    const prevCheckedItems = Array.from(info.querySelectorAll(".bd-item-checkbox:checked")).map(cb => cb.dataset.id);

    info.style.display = "block";

    const itemRows = allItems.map(item => {
      const icon = item.itemType === "Book" ? "📚" : "👕";
      return `
        <label style="display:flex;align-items:center;gap:10px;padding:6px 0;border-bottom:1px solid #dbeafe;cursor:pointer;">
          <input type="checkbox" class="bd-item-checkbox" data-id="${item.id}" data-price="${item.price}"
            style="width:16px;height:16px;accent-color:#1e3a8a;cursor:pointer;"
            ${prevCheckedItems.includes(String(item.id)) ? "checked" : ""}>
          <span style="flex:1;">${icon} ${item.itemName}</span>
          <span style="font-weight:600;color:#0f172a;">${formatINR(item.price)}</span>
        </label>`;
    }).join("");

    info.innerHTML = `
      <div style="font-weight:700;color:#1e3a8a;margin-bottom:10px;font-size:0.95rem;">📦 Books & Dress — Class ${cls || "(select class)"}</div>
      ${allItems.length ? `
        <div style="font-size:0.8rem;color:#64748b;margin-bottom:8px;">✅ Check items to include in fee. Unchecked items will NOT be added.</div>
        <div style="margin-bottom:10px;">${itemRows}</div>
      ` : `<div style="color:#94a3b8;font-size:0.85rem;margin-bottom:10px;">No books/dress items configured for this class.</div>`}
      <div style="background:#1e3a8a;color:#fff;border-radius:6px;padding:8px 14px;display:flex;justify-content:space-between;align-items:center;">
        <span style="font-weight:700;">Total Fee (Monthly + Selected)</span>
        <span id="bd-running-total" style="font-weight:800;font-size:1.05rem;">${formatINR(0)}</span>
      </div>
      <div style="font-size:0.75rem;color:#3b82f6;margin-top:6px;">ℹ️ Total Fee field is auto-calculated. Balance = Total Fee − Amount Paid.</div>`;

    // Attach checkbox change listeners
    info.querySelectorAll(".bd-item-checkbox").forEach(cb => {
      cb.addEventListener("change", recalcFeeTotals);
    });

    recalcFeeTotals();
  }

  function patchFeeFormForBD() {
    const observer = new MutationObserver(() => {
      if (currentModule !== "fees") {
        // Clean up any leftover BD elements from a previous fees visit
        document.getElementById("bd-fee-info")?.remove();
        document.getElementById("bd-monthly-fee-wrapper")?.remove();
        return;
      }

      const form = document.getElementById("dynamicForm");
      if (!form) return;

      const totalFeeInput = form.querySelector("[name='totalFee']");
      if (!totalFeeInput) return; // Wait until form is fully rendered

      if (form.querySelector("#bd-monthly-fee-wrapper")) return; // Already injected for this form instance

      // ── 1. Make totalFee and balance read-only immediately ──
      const balanceInput  = form.querySelector("[name='balance']");
      if (totalFeeInput) {
        totalFeeInput.readOnly = true;
        totalFeeInput.style.background = "#f1f5f9";
        totalFeeInput.style.cursor = "not-allowed";
        totalFeeInput.title = "Auto-calculated from Monthly Fee + selected items";
      }
      if (balanceInput) {
        balanceInput.readOnly = true;
        balanceInput.style.background = "#f1f5f9";
        balanceInput.style.cursor = "not-allowed";
        balanceInput.title = "Auto-calculated: Total Fee − Amount Paid";
      }

      // ── 1.5 Inject Month Selector grid before Fee Types ──
      if (!form.querySelector("#bd-month-selector-wrapper")) {
        const monthsWrap = document.createElement("div");
        monthsWrap.id = "bd-month-selector-wrapper";
        monthsWrap.className = "field";
        monthsWrap.style.gridColumn = "1 / -1"; // Span full width
        
        const academicMonths = ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"];
        const monthsHtml = academicMonths.map(m => `
          <label style="display:flex;align-items:center;gap:6px;padding:6px 8px;border:1px solid #e2e8f0;border-radius:6px;cursor:pointer;background:#fff;font-size:0.8rem;transition:0.15s;">
            <input type="checkbox" name="fee-month" value="${m}" style="width:14px;height:14px;accent-color:#1e3a8a;cursor:pointer;">
            ${m}
          </label>
        `).join("");

        monthsWrap.innerHTML = `
          <label style="font-weight:600;font-size:0.88rem;color:#374151;display:block;margin-bottom:8px;">Payment for Month(s)</label>
          <div id="bd-month-selector" style="display:grid;grid-template-columns:repeat(6, 1fr);gap:8px;background:#f8fafc;padding:12px;border:1px solid #e2e8f0;border-radius:8px;">
            ${monthsHtml}
          </div>
          <div style="font-size:0.75rem;color:#64748b;margin-top:5px;">ℹ️ Monthly fees (Tuition, etc.) will be multiplied by the number of months selected.</div>
        `;

        const target = form.querySelector("[name='term']")?.closest(".field") || form.querySelector("[name='totalFee']")?.closest(".field");
        if (target) {
          target.parentNode.insertBefore(monthsWrap, target.nextSibling);
        }

        // Attach listeners to month checkboxes
        monthsWrap.querySelectorAll("input").forEach(inp => {
          inp.addEventListener("change", (e) => {
            const lbl = e.target.closest("label");
            if (lbl) lbl.style.background = e.target.checked ? "#eff6ff" : "#fff";
            if (lbl) lbl.style.borderColor = e.target.checked ? "#3b82f6" : "#e2e8f0";
            recalcFeeTotals();
          });
        });
      }

      // ── 2. Inject Monthly Fee CHECKBOXES before totalFee ──
      if (!form.querySelector("#bd-monthly-fee-wrapper")) {
        const wrapper = document.createElement("div");
        wrapper.id = "bd-monthly-fee-wrapper";
        wrapper.className = "field";
        wrapper.innerHTML = `
          <label style="font-weight:600;font-size:0.88rem;color:#374151;display:block;margin-bottom:8px;">
            Fee Types <span style="color:#e53e3e;">*</span>
          </label>
          <div id="bd-monthly-fee-input"
            style="border:1px solid #e2e8f0;border-radius:8px;padding:8px 10px;background:#f8fafc;max-height:180px;overflow-y:auto;">
            <div style="color:#94a3b8;font-size:0.85rem;padding:4px 0;">Select a class to see fee structures.</div>
          </div>
          <div style="display:flex;align-items:center;gap:8px;margin-top:5px;">
            <span id="bd-monthly-fee-note" style="font-size:0.75rem;color:#64748b;flex:1;">
              Select one or more fee types from the class fee structures.
              <a href="#" id="bd-fs-manage-link" style="color:#1e3a8a;text-decoration:underline;font-weight:600;">Manage fee structures →</a>
            </span>
          </div>`;

        const totalFeeWrapper = totalFeeInput?.closest(".field") || totalFeeInput?.parentElement;
        if (totalFeeWrapper) {
          totalFeeWrapper.parentNode.insertBefore(wrapper, totalFeeWrapper);
        } else {
          form.insertBefore(wrapper, form.querySelector(".actions"));
        }

        // No separate event listener needed — radio buttons handle their own events inside populateMonthlyFeeSelect

        // Link to manage fee structures in Books & Dress panel
        wrapper.querySelector("#bd-fs-manage-link")?.addEventListener("click", e => {
          e.preventDefault();
          currentModule = "booksAndDress";
          document.querySelectorAll("#moduleNav button").forEach(b => b.classList.remove("active"));
          document.querySelector("[data-module='booksAndDress']")?.classList.add("active");
          showBDPanel().then(() => {
            setTimeout(() => document.getElementById("fs-section")?.scrollIntoView({ behavior: "smooth" }), 300);
          });
        });

        // Also recalc when paidAmount changes (to update balance)
        const paidInput = form.querySelector("[name='paidAmount']");
        if (paidInput && !paidInput.dataset.balancePatched) {
          paidInput.dataset.balancePatched = "1";
          paidInput.addEventListener("input", recalcFeeTotals);
        }
      }

      // ── 3. Inject BD info panel INSIDE the form (before actions) ──
      let info = document.getElementById("bd-fee-info");
      if (!info) {
        info = document.createElement("div");
        info.id = "bd-fee-info";
        info.style.cssText = "background:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;padding:14px 16px;font-size:0.86rem;color:#1e40af;margin-top:10px;display:none;margin-bottom:15px;";
        form.insertBefore(info, form.querySelector(".actions"));
      }

      const classField   = form.querySelector("[name='className']");
      const studentField = form.querySelector("[name='studentName']");

      if (classField && !classField.dataset.bdPatched) {
        classField.dataset.bdPatched = "1";
        classField.addEventListener("change", () => showBDInfoForClass(classField.value));
        if (classField.value) showBDInfoForClass(classField.value);
      }

      // Show panel for current class (e.g. after prefill)
      setTimeout(() => {
        const cls = classField ? classField.value : "";
        showBDInfoForClass(cls || "");
        recalcFeeTotals();
      }, 120);
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  // ── Init ─────────────────────────────────────────────────────────────────
  async function bdInit() {
    const waitForStore = () => new Promise(resolve => {
      const check = () => {
        if (typeof serverStore !== "undefined" && serverStore !== null && Object.keys(serverStore).length > 0) resolve();
        else setTimeout(check, 300);
      };
      check();
    });

    await waitForStore();
    await Promise.all([loadBD(), loadFS()]);

    patchFeeFormForBD();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bdInit);
  } else {
    bdInit();
  }

  // --- REAL TIME DASHBOARD ENGINE ---
  // Periodically polls local store to auto-refresh KPI stats cards and Charts on Dashboard view
  setInterval(async () => {
    if (currentModule === "dashboard" && currentUser && !userIsStudent()) {
      await loadStore();
      renderStatsCards(); 
    }
  }, 30000); // 30 seconds

  // Expose BD data for global access (e.g. 4-in-1 print)
  window.loadBD = loadBD;
  Object.defineProperty(window, 'bdBooks', { get: () => bdBooks });
  Object.defineProperty(window, 'bdDresses', { get: () => bdDresses });

  // Auto-load data if logged in
  if (window.serverUser) {
    loadBD();
    loadFS();
  }
  
})();

// ═══════════════════════════════════════════════════════════
//  WhatsApp Alert Automation Module
// ═══════════════════════════════════════════════════════════
(function () {
  "use strict";

  const DEFAULT_TEMPLATE = `🏫 *Tapowan Public School*
📢 Fee Due Reminder

Dear *{parentName}*,

This is a kind reminder that school fees for your ward are pending:

👤 *Student:* {studentName}
📚 *Class:* {className}
💰 *Balance Due:* ₹{balance}
📅 *Term:* {term}

Please pay the outstanding amount at the earliest to avoid any inconvenience.

📞 Contact school office for queries.
Thank you 🙏`;

  const WA_STORAGE_KEY = "wa_alert_template_v1";
  const SMS_GW_KEY = "wa_sms_gateway_url_v1";
  let waDueFees = [];
  let waAlertLog = [];
  let waQueue = [];
  let waQueueIndex = 0;
  let waActiveFilter = "due"; // or "all"
  let waSearchQuery = "";
  let waCurrentList = [];
  let waIsBulkSending = false;

  function getTemplate() { return localStorage.getItem(WA_STORAGE_KEY) || DEFAULT_TEMPLATE; }
  function saveTemplate(tpl) { localStorage.setItem(WA_STORAGE_KEY, tpl); }
  function getSmsGateway() { return localStorage.getItem(SMS_GW_KEY) || ""; }
  function saveSmsGateway(url) { localStorage.setItem(SMS_GW_KEY, url); }

  function buildMessage(template, row) {
    return template
      .replace(/\{studentName\}/g, row.studentName || "Student")
      .replace(/\{parentName\}/g, row.parentName || "Parent")
      .replace(/\{className\}/g, row.className || "—")
      .replace(/\{balance\}/g, row.balance || "0")
      .replace(/\{term\}/g, row.term || "—")
      .replace(/\{rollNo\}/g, row.rollNo || "—")
      .replace(/\{totalFee\}/g, row.totalFee || "0")
      .replace(/\{paidAmount\}/g, row.paidAmount || "0");
  }

  function cleanPhone(raw) {
    let p = String(raw || "").replace(/\D/g, "");
    if (p.length === 10) p = "91" + p;
    if (p.length === 11 && p.startsWith("0")) p = "91" + p.slice(1);
    return p;
  }

  window.openWhatsApp = openWhatsApp;
function openWhatsApp(phone, message) {
    const p = cleanPhone(phone);
    if (!p || p.length < 10) { showToast("⚠ No valid phone number for this student.", "warn"); return false; }
    window.open(`https://wa.me/${p}?text=${encodeURIComponent(message)}`, "_blank");
    return true;
  }

  async function sendLocalSms(phone, message) {
    const gw = getSmsGateway();
    if (!gw) { showToast("⚠ Please configure Local SMS Gateway URL in the settings above first.", "warn"); return false; }
    
    // For local gateway, we strip non-digits but we DO NOT forcefully append 91.
    // Local Android Gateway apps typically prefer native 10 digits for local numbers.
    let p = String(phone || "").replace(/\D/g, "");
    if (p.startsWith("91") && p.length === 12) p = p.slice(2);
    if (p.startsWith("0") && p.length === 11) p = p.slice(1);
    
    if (!p || p.length < 10) { showToast("⚠ No valid phone number.", "warn"); return false; }
    
    try {
      // Use backend proxy to bypass CORS/Mixed-Content restrictions
      const res = await api("/api/sms/send", {
          method: 'POST',
          body: JSON.stringify({ gatewayUrl: gw, phone: p, message })
      });
      return true;
    } catch(e) {
      console.warn("SMS proxy fail:", e);
      // Try to extract body if it's a JSON error from our proxy
      let hint = "";
      if (e.body) hint = `\nResponse: ${e.body}`;
      showToast("❌ SMS Gateway failed: " + e.message + hint, "error");
      return false;
    }
  }

  async function logAlert(row, message) {
    try {
      await api("/api/whatsapp/log-alert", {
        method: "POST",
        body: JSON.stringify({ studentName: row.studentName, className: row.className, phone: row.phone, parentName: row.parentName, balance: row.balance, term: row.term, message })
      });
    } catch (e) { console.warn("WhatsApp log failed:", e.message); }
  }

  async function loadDueFees() {
    try { waDueFees = await api("/api/whatsapp/due-fees"); } catch (e) { waDueFees = []; }
  }

  async function loadAlertLog() {
    try { waAlertLog = (getStore().whatsappAlerts || []).slice(0, 50); } catch (e) { waAlertLog = []; }
  }

  async function renderWhatsAppModule() {
    const contentArea = document.querySelector(".content-area");
    if (!contentArea) return;

    contentArea.querySelectorAll(".panel:not(#facePanel):not(#assistantPanel)").forEach(p => { p.style.display = "none"; });

    let waPanel = document.getElementById("waAlertPanel");
    if (!waPanel) {
      waPanel = document.createElement("section");
      waPanel.id = "waAlertPanel";
      waPanel.className = "panel wa-panel";
      contentArea.insertBefore(waPanel, contentArea.firstChild);
    }
    waPanel.style.display = "";

    // Refresh everything to ensure "All Students" and logs are accurate
    await Promise.all([loadStore(), loadDueFees(), loadAlertLog()]);

    const students = getStore().students || [];
    const template = getTemplate();

    // ── Logic: Compute Filtered List ──
    let displayList = [];
    if (waActiveFilter === "due") {
      // Use the raw list from server which contains itemized dues (Slips + Mgmt)
      displayList = [...waDueFees];
    } else {
      // Map all students and AGGREGATE their total balance for the "All Students" view
      displayList = students.map(s => {
        const myDues = waDueFees.filter(df => df.admissionNo === s.admissionNo);
        const totalBal = myDues.reduce((sum, d) => sum + (parseFloat(d.balance) || 0), 0);
        
        return {
          studentName: s.fullName,
          admissionNo: s.admissionNo,
          rollNo: s.rollNo,
          className: s.className,
          parentName: s.parentName,
          phone: s.phone,
          address: s.address || "",
          balance: String(totalBal),
          term: myDues.length > 1 ? `${myDues.length} Items Total` : (myDues[0]?.term || "No Dues"),
          status: totalBal > 0 ? (myDues.every(d => d.status === "Partial") ? "Partial" : "Unpaid") : "Paid",
          source: myDues.length > 1 ? "multiple" : (myDues[0]?.source || "all")
        };
      });
    }

    // Apply Search
    if (waSearchQuery.trim()) {
      const q = waSearchQuery.toLowerCase();
      displayList = displayList.filter(r => 
        (r.studentName || "").toLowerCase().includes(q) ||
        (r.admissionNo || "").toLowerCase().includes(q) ||
        (r.phone || "").toLowerCase().includes(q) ||
        (r.address || "").toLowerCase().includes(q) ||
        (r.parentName || "").toLowerCase().includes(q)
      );
    }
    waCurrentList = displayList;

    waPanel.innerHTML = `
      <div class="wa-header">
        <div class="wa-header-icon">📲</div>
        <div>
          <h3 class="wa-title">WhatsApp Fee Due Alerts</h3>
          <p class="wa-sub">Send payment reminders directly to parents via WhatsApp</p>
        </div>
        <div class="wa-summary-badges">
          <span class="wa-badge wa-badge-red">⚠ ${waDueFees.length} Due</span>
          <span class="wa-badge wa-badge-green">✅ ${waAlertLog.length} Sent</span>
        </div>
      </div>

      <div style="display:flex; gap:20px; flex-wrap:wrap; margin-bottom:20px;">
        <div class="wa-section" style="flex:1; min-width:300px; margin-bottom:0;">
          <div class="wa-section-title">✏️ Message Template
            <span class="wa-section-hint">Use {studentName} {parentName} {className} {balance} {term} {rollNo} {totalFee} {paidAmount}</span>
          </div>
          <textarea id="waTemplateEditor" class="wa-template-editor" style="min-height:100px;" rows="6">${template.replace(/</g,"&lt;")}</textarea>
          <div class="wa-template-actions">
            <button class="wa-btn wa-btn-secondary" id="waSaveTemplate">💾 Save Template</button>
            <button class="wa-btn wa-btn-secondary" id="waResetTemplate">↩ Reset</button>
            <span id="waTemplateSaveStatus" style="font-size:0.82rem;color:#16a34a;margin-left:8px;"></span>
          </div>
        </div>

        <div class="wa-section" style="flex:1; min-width:300px; margin-bottom:0;">
           <div class="wa-section-title">⚙️ Local SMS Gateway (Gate App)
             <span class="wa-section-hint">e.g. http://192.168.1.x:8080/v1/sms/send?phone={phone}&message={message}</span>
           </div>
           <input type="url" id="waSmsGatewayUrl" class="field" style="width:100%; border:1px solid #cbd5e1; border-radius:6px; padding:8px 12px; font-family:monospace; margin-bottom:12px; background:#f8fafc;" value="${getSmsGateway()}" placeholder="Enter SMS Gateway API URL...">
           <div class="wa-template-actions" style="margin-top:auto;">
              <button class="wa-btn wa-btn-secondary" id="waSaveSmsGateway" style="background:#1e293b;">💾 Save URL</button><button class="wa-btn wa-btn-secondary" id="waTestSmsGateway" style="background:#0284c7; margin-left:8px;">🔍 Test Connection</button>
              <span id="waGatewaySaveStatus" style="font-size:0.82rem;color:#16a34a;margin-left:8px;"></span>
           </div>
           <p style="font-size:0.75rem; color:#64748b; margin-top:8px;">*Ensure your phone's SMS Gateway Server is running and on the same WiFi network.</p>
        </div>
      </div>

      <div class="wa-section">
        <div class="wa-section-title" style="margin-bottom:12px; display:flex; align-items:center; flex-wrap:wrap; gap:12px;">
          <span>📋 Student Alerts Master List</span>
          
          <div style="display:flex; gap:8px; margin-left:auto;">
             <div class="field-wrap" style="position:relative; width:220px;">
                <span style="position:absolute; left:10px; top:50%; transform:translateY(-50%); font-size:14px;">🔍</span>
                <input type="text" id="waSearchInput" class="field" placeholder="Search name/adm/addr..." value="${waSearchQuery}" style="padding-left:32px; width:100%; border-radius:30px; height:36px; font-size:13px; background:#fff;">
             </div>
             <select id="waFilterSelect" class="field" style="width:160px; height:36px; font-size:13px; border-radius:30px; padding:0 12px; border-color:#cbd5e1;">
                <option value="due" ${waActiveFilter === 'due' ? 'selected' : ''}>Students with Dues</option>
                <option value="all" ${waActiveFilter === 'all' ? 'selected' : ''}>All Students</option>
             </select>
          </div>

          <div style="display:flex; gap:8px;">
            <button class="wa-btn wa-btn-primary" id="waSendAll">📢 Send All (${displayList.length})</button>
            <button class="wa-btn wa-btn-primary" id="waSendBulkSms" style="background:#0284c7;">🚀 Bulk SMS (Auto)</button>
            <button class="wa-btn wa-btn-primary" id="waSendSelected">📲 Send Selected</button>
          </div>
        </div>
        ${displayList.length === 0 ? `
          <div class="wa-empty">
            <div style="font-size:2.5rem">${waSearchQuery ? '🔍' : '🎉'}</div>
            <div>${waSearchQuery ? 'No students match your search.' : (waActiveFilter === 'due' ? 'No pending fees! All students are up to date.' : 'No students found in the database.')}</div>
          </div>` : `
          <div id="waQueueContainer" style="display:none; background:#f0fdf4; border:2px solid #25D366; padding:24px; border-radius:12px; margin-bottom:20px; text-align:center; box-shadow:0 10px 25px rgba(37,211,102,0.15);">
            <h3 style="color:#166534; margin-top:0;">📤 Bulk Sending Queue</h3>
            <p style="font-size:1.05rem; margin:15px 0; color:#1f2937;" id="waQueueStatus"></p>
            <div style="display:flex; gap:12px; justify-content:center; flex-wrap:wrap;">
               <button id="waQueueNextWA" class="wa-btn wa-btn-primary" style="font-size:1.1rem; padding:12px 24px;">📲 Next via WhatsApp</button>
               <button id="waQueueNextSMS" class="wa-btn" style="background:#0284c7;color:#fff;font-size:1.1rem; padding:12px 24px;">💬 Next via SMS</button>
               <button id="waQueueCancelBtn" class="wa-btn wa-btn-secondary" style="padding:12px 24px;">Cancel Bulk Send</button>
            </div>
            <p style="font-size:0.8rem; color:#64748b; margin-top:14px; margin-bottom:0;">Tip: After triggering, return here & click Next.</p>
          </div>

          <div id="waBulkSmsContainer" style="display:none; background:#eff6ff; border:2px solid #3b82f6; padding:24px; border-radius:12px; margin-bottom:20px; text-align:center; box-shadow:0 10px 25px rgba(59,130,246,0.15);">
            <h3 style="color:#1e40af; margin-top:0;">🚀 Automated Bulk SMS in Progress...</h3>
            <div id="waBulkProgressOuter" style="width:100%; height:8px; background:#dbeafe; border-radius:4px; margin:20px 0; overflow:hidden;">
              <div id="waBulkProgressBar" style="width:0%; height:100%; background:#3b82f6; transition:width 0.3s ease;"></div>
            </div>
            <p style="font-size:1.1rem; margin-bottom:20px; color:#1e293b;" id="waBulkStatus">Initializing...</p>
            <button id="waBulkCancelBtn" class="wa-btn wa-btn-secondary" style="padding:10px 24px;">⛔ Stop Sending</button>
          </div>
          <div class="wa-table-wrap">
            <table class="wa-table">
              <thead><tr>
                <th><input type="checkbox" id="waSelectAll" title="Select all" /></th>
                <th>Student</th><th>Class</th><th>Parent / Phone</th>
                <th>Term</th><th>Balance</th><th>Status</th><th>Action</th>
              </tr></thead>
              <tbody id="waDueFeesTbody">
                ${displayList.map((row, i) => `
                  <tr class="wa-row" data-idx="${i}">
                    <td><input type="checkbox" class="wa-row-check" data-idx="${i}" /></td>
                    <td><strong>${row.studentName}</strong><br><small style="color:#64748b">${row.rollNo || "No Roll"}</small></td>
                    <td>${row.className}</td>
                    <td>
                      <div style="font-weight:600">${row.parentName || "—"}</div>
                      <div style="color:#64748b;font-size:0.82rem">${row.phone ? "📞 " + row.phone : "<span style='color:#ef4444'>No phone</span>"}</div>
                    </td>
                    <td>
                      <div style="font-size:0.85rem; color:#1e293b;">${row.term}</div>
                      ${row.source === 'dueManagement' ? '<div style="color:#d946ef;font-size:0.7rem;font-weight:700;margin-top:2px;">📑 Manual Due</div>' : ''}
                      ${row.source === 'fees' ? '<div style="color:#3b82f6;font-size:0.7rem;font-weight:700;margin-top:2px;">📄 Fee Slip</div>' : ''}
                      ${row.source === 'multiple' ? '<div style="color:#f59e0b;font-size:0.7rem;font-weight:700;margin-top:2px;">📚 Mixed Dues</div>' : ''}
                    </td>
                    <td><span class="wa-balance">₹${Number(row.balance || 0).toLocaleString("en-IN")}</span></td>
                    <td><span class="wa-status-badge wa-status-${String(row.status || '').toLowerCase().replace('/','') || 'na'}">${row.status || 'N/A'}</span></td>
                    <td>
                      <div style="display:flex;gap:4px;">
                        <button class="wa-btn wa-btn-green wa-send-wa" data-idx="${i}" style="border-radius:4px;width:32px;padding:0;display:flex;align-items:center;justify-content:center;" title="WhatsApp">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.521.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                        </button>
                        <button class="wa-btn wa-send-sms" data-idx="${i}" style="border-radius:4px;background:#0284c7;color:#fff;width:32px;padding:0;display:flex;align-items:center;justify-content:center;" title="SMS">
                          💬
                        </button>
                      </div>
                    </td>
                  </tr>`).join("")}
              </tbody>
            </table>
          </div>`}
      </div>

      <div class="wa-section">
        <div class="wa-section-title">📊 Alert Log (Last 50)</div>
        ${waAlertLog.length === 0 ? `<div class="wa-empty" style="padding:20px 0"><div style="font-size:1.8rem">📭</div><div>No alerts sent yet.</div></div>` : `
          <div class="wa-table-wrap">
            <table class="wa-table">
              <thead><tr><th>#</th><th>Student</th><th>Class</th><th>Phone</th><th>Balance</th><th>Term</th><th>Date</th><th>Status</th></tr></thead>
              <tbody>
                ${waAlertLog.map((r, i) => `<tr>
                  <td>${i + 1}</td><td>${r.studentName}</td><td>${r.className}</td>
                  <td>${r.phone}</td><td>₹${Number(r.balance || 0).toLocaleString("en-IN")}</td>
                  <td>${r.term}</td><td>${r.alertDate}</td>
                  <td><span class="wa-badge wa-badge-green">✅ ${r.status}</span></td>
                </tr>`).join("")}
              </tbody>
            </table>
          </div>`}
      </div>
    `;

    // Wire events
    const tplEditor = document.getElementById("waTemplateEditor");

    document.getElementById("waSaveTemplate")?.addEventListener("click", () => {
      saveTemplate(tplEditor.value);
      const s = document.getElementById("waTemplateSaveStatus");
      if (s) { s.textContent = "✅ Saved!"; setTimeout(() => s.textContent = "", 2000); }
    });

    document.getElementById("waResetTemplate")?.addEventListener("click", () => {
      tplEditor.value = DEFAULT_TEMPLATE; saveTemplate(DEFAULT_TEMPLATE);
      showToast("Template reset to default", "info");
    });

    document.getElementById("waSelectAll")?.addEventListener("change", e => {
      document.querySelectorAll(".wa-row-check").forEach(cb => cb.checked = e.target.checked);
    });

    document.getElementById("waSaveSmsGateway")?.addEventListener("click", () => {
      saveSmsGateway(document.getElementById("waSmsGatewayUrl")?.value || "");
      const s = document.getElementById("waGatewaySaveStatus");
      if (s) { s.textContent = "✅ Saved!"; setTimeout(() => s.textContent = "", 2000); }
    });

    document.getElementById("waTestSmsGateway")?.addEventListener("click", async () => {
      const gw = document.getElementById("waSmsGatewayUrl")?.value;
      if (!gw) { showToast("Enter URL first.", "warn"); return; }
      const btn = document.getElementById("waTestSmsGateway");
      const oldTxt = btn.innerText;
      btn.innerText = "⏳ Testing...";
      btn.disabled = true;
      const ok = await sendLocalSms("0000000000", "Testing school SMS gateway connection...");
      btn.innerText = oldTxt; btn.disabled = false;
      if (ok) showToast("✅ Gateway Responded Successfully!", "success");
    });

    document.querySelectorAll(".wa-send-wa").forEach(btn => {
      btn.addEventListener("click", async () => {
        const row = waCurrentList[Number(btn.dataset.idx)]; if (!row) return;
        const msg = buildMessage(tplEditor?.value || getTemplate(), row);
        if (openWhatsApp(row.phone, msg)) {
          await logAlert(row, msg);
          showToast(`✅ WhatsApp opened for ${row.studentName}`, "success");
          btn.style.background = "#16a34a"; btn.textContent = "✓"; btn.disabled = true;
          setTimeout(async () => { await loadStore(); await loadAlertLog(); }, 1000);
        }
      });
    });
    
    document.querySelectorAll(".wa-send-sms").forEach(btn => {
      btn.addEventListener("click", async () => {
        const row = waCurrentList[Number(btn.dataset.idx)]; if (!row) return;
        const msg = buildMessage(tplEditor?.value || getTemplate(), row);
        if (await sendLocalSms(row.phone, msg)) {
           await logAlert(row, "[SMS] " + msg);
           showToast(`💬 SMS Sent for ${row.studentName}`, "success");
           btn.style.background = "#16a34a"; btn.textContent = "✓"; btn.disabled = true;
           setTimeout(async () => { await loadStore(); await loadAlertLog(); }, 1000);
        }
      });
    });

    // Wire Search & Filter
    const searchInp = document.getElementById("waSearchInput");
    if (searchInp) {
      searchInp.addEventListener("input", (e) => {
        const val = e.target.value;
        const pos = e.target.selectionStart;
        waSearchQuery = val;
        renderWhatsAppModule();
        // Restore focus and cursor
        const nextInp = document.getElementById("waSearchInput");
        if (nextInp) {
          nextInp.focus();
          nextInp.setSelectionRange(pos, pos);
        }
      });
    }

    const filterSel = document.getElementById("waFilterSelect");
    if (filterSel) {
      filterSel.addEventListener("change", (e) => {
        waActiveFilter = e.target.value;
        renderWhatsAppModule();
      });
    }

    function startQueue(rows) {
      if (!rows.length) return;
      waQueue = rows;
      waQueueIndex = 0;
      document.getElementById("waQueueContainer").style.display = "block";
      document.querySelector(".wa-table-wrap").style.display = "none";
      document.getElementById("waSendSelected").style.display = "none";
      document.getElementById("waSendAll").style.display = "none";
      updateQueueUI();
    }

    function updateQueueUI() {
      if (waQueueIndex >= waQueue.length) {
        document.getElementById("waQueueContainer").style.display = "none";
        document.querySelector(".wa-table-wrap").style.display = "block";
        document.getElementById("waSendSelected").style.display = "";
        document.getElementById("waSendAll").style.display = "";
        showToast("✅ Successfully processed all queued messages!", "success");
        loadStore().then(() => renderWhatsAppModule());
        return;
      }
      const row = waQueue[waQueueIndex];
      const phoneHtml = row.phone ? "📞 " + row.phone : "<span style='color:#ef4444;font-weight:bold'>No phone found</span>";
      document.getElementById("waQueueStatus").innerHTML = 
        `Sending <b>${waQueueIndex + 1} of ${waQueue.length}</b><br><br>` +
        `Student: <b>${row.studentName}</b><br>Parent: ${row.parentName || "—"} (${phoneHtml})`;
    }

    document.getElementById("waQueueNextWA")?.addEventListener("click", async () => {
      const row = waQueue[waQueueIndex];
      const msg = buildMessage(tplEditor?.value || getTemplate(), row);
      if (!row.phone) showToast("No phone number for " + row.studentName, "warn");
      else if (openWhatsApp(row.phone, msg)) {
         await logAlert(row, msg);
         showToast(`✅ Prepared WhatsApp for ${row.studentName}`, "success");
      }
      waQueueIndex++; updateQueueUI();
    });

    document.getElementById("waQueueNextSMS")?.addEventListener("click", async () => {
      const row = waQueue[waQueueIndex];
      const msg = buildMessage(tplEditor?.value || getTemplate(), row);
      if (!row.phone) showToast("No phone number for " + row.studentName, "warn");
      else if (await sendLocalSms(row.phone, msg)) {
         await logAlert(row, "[SMS] " + msg);
         showToast(`💬 SMS Sent for ${row.studentName}`, "success");
      }
      waQueueIndex++; updateQueueUI();
    });

    document.getElementById("waQueueCancelBtn")?.addEventListener("click", () => {
      waQueue = [];
      document.getElementById("waQueueContainer").style.display = "none";
      document.querySelector(".wa-table-wrap").style.display = "block";
      document.getElementById("waSendSelected").style.display = "";
      document.getElementById("waSendAll").style.display = "";
      showToast("Bulk send cancelled", "warn");
      loadStore().then(() => renderWhatsAppModule());
    });

    document.getElementById("waSendSelected")?.addEventListener("click", () => {
      const checkedIdxs = [...document.querySelectorAll(".wa-row-check:checked")].map(cb => Number(cb.dataset.idx));
      if (!checkedIdxs.length) { showToast("⚠ Please select at least one student.", "warn"); return; }
      const rows = checkedIdxs.map(i => displayList[i]).filter(Boolean);
      startQueue(rows);
    });

    document.getElementById("waSendAll")?.addEventListener("click", () => {
      if (!displayList.length) { showToast("No students found in current view.", "info"); return; }
      startQueue([...displayList]);
    });

    document.getElementById("waSendBulkSms")?.addEventListener("click", async () => {
      const checkedIdxs = [...document.querySelectorAll(".wa-row-check:checked")].map(cb => Number(cb.dataset.idx));
      if (!checkedIdxs.length) { showToast("⚠ Please select students first using the checkboxes.", "warn"); return; }
      const selectedRows = checkedIdxs.map(i => displayList[i]).filter(Boolean);
      await processBulkAutoSms(selectedRows);
    });

    async function processBulkAutoSms(rows) {
      if (waIsBulkSending) return;
      waIsBulkSending = true;

      const container = document.getElementById("waBulkSmsContainer");
      const statusText = document.getElementById("waBulkStatus");
      const progressBar = document.getElementById("waBulkProgressBar");
      const cancelBtn = document.getElementById("waBulkCancelBtn");
      const tableWrap = document.querySelector(".wa-table-wrap");

      if (container) container.style.display = "block";
      if (tableWrap) tableWrap.style.display = "none";
      
      let cancelled = false;
      const cancelHandler = () => { cancelled = true; waIsBulkSending = false; };
      cancelBtn?.addEventListener("click", cancelHandler, { once: true });

      const template = tplEditor?.value || getTemplate();
      let sentCount = 0;
      let failCount = 0;

      for (let i = 0; i < rows.length; i++) {
        if (cancelled) break;
        const row = rows[i];
        
        // Update UI
        if (statusText) statusText.innerHTML = `Sending <b>${i + 1} of ${rows.length}</b><br>Currently: <b>${row.studentName}</b>`;
        if (progressBar) progressBar.style.width = `${((i + 1) / rows.length) * 100}%`;

        const msg = buildMessage(template, row);
        const success = await sendLocalSms(row.phone, msg);
        
        if (success) {
          await logAlert(row, "[Bulk SMS] " + msg);
          sentCount++;
        } else {
          failCount++;
        }

        // Small delay between messages to not choke the gateway
        await new Promise(r => setTimeout(r, 600));
      }

      waIsBulkSending = false;
      if (container) container.style.display = "none";
      if (tableWrap) tableWrap.style.display = "block";

      if (cancelled) {
        showToast(`Stopped. Sent ${sentCount} messages.`, "warning");
      } else {
        showToast(`✅ Finished! Sent ${sentCount} SMS successfully. ${failCount ? failCount + ' failed.' : ''}`, "success");
      }
      
      await loadStore();
      await loadAlertLog();
      renderWhatsAppModule();
    }
  }

  window.renderWhatsAppModule = renderWhatsAppModule;
  window.renderStatsCards = renderStatsCards;

  // Removed misplaced global exposes of BD state

})();



// INJECTED WHATSAPP MODULE
(function() {
  window.sendWhatsAppFeeSlip = async function(feeId) {
    const store = getStore();
    const rawF = (store.fees || []).find(x => Number(x.id) === Number(feeId));
    if (!rawF) return showToast("Fee record not found", "error");

    const f = window.getConsolidatedFeeRecord(rawF);

    const container = document.createElement("div");
    container.style.cssText = "position:absolute; left:-9999px; top:0; width:450px; background:#fff; padding:20px; z-index:-1000;";
    document.body.appendChild(container);

    const student = (store.students || []).find(s => s.fullName === f.studentName || s.admissionNo === f.admissionNo);
    if (student) {
      if (!f.admissionNo) f.admissionNo = student.admissionNo || "";
      if (!f.fatherName) f.fatherName = student.parentName || "";
      if (!f.phone) f.phone = student.phone || student.phone1 || "";
      if (!f.rollNo) f.rollNo = student.rollNo || student.roll || "";
    }

    const schoolName = "Tapowan Public School";
    const slipNo = "FS-" + (f.id || Date.now());
    const printDate = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
    const totalFee = parseFloat(f.totalFee) || 0;
    const paidAmount = parseFloat(f.paidAmount) || 0;
    const balance = parseFloat(f.balance) || Math.max(0, totalFee - paidAmount);
    const statusColor = String(f.status || "").toLowerCase() === "paid" ? "#16a34a" : String(f.status || "").toLowerCase() === "partial" ? "#d97706" : "#dc2626";
    const statusBg = String(f.status || "").toLowerCase() === "paid" ? "#dcfce7" : String(f.status || "").toLowerCase() === "partial" ? "#fef3c7" : "#fee2e2";

    let feeRows = "";
    const SLIP_FEE_TYPES = [
      { key: "tuitionFee",     label: "Tuition Fee",     icon: "📚" },
      { key: "admissionFee",   label: "Admission Fee",   icon: "🎓" },
      { key: "computerFee",    label: "Computer Fee",    icon: "💻" },
      { key: "developmentFee", label: "Development Fee", icon: "🏗️" },
      { key: "labFee",         label: "Lab Fee",         icon: "🔬" },
      { key: "sportsFee",      label: "Sports Fee",      icon: "⚽" },
      { key: "libraryFee",     label: "Library Fee",     icon: "📖" },
      { key: "examFee",        label: "Exam Fee",        icon: "📝" },
      { key: "lateFee",        label: "Late Fee",        icon: "⏰" },
      { key: "otherFee",       label: "Other Fee",       icon: "➕" }
    ];

    SLIP_FEE_TYPES.forEach(({ key, label, icon }, idx) => {
      const amt = parseFloat(f[key]) || 0;
      if (amt > 0) {
        const bg = idx % 2 === 0 ? "#f9fafb" : "#ffffff";
        const mSuffix = (f.month && (key === "tuitionFee" || label.toLowerCase().includes("tuition"))) ? ` (${f.month})` : "";
        feeRows += `<tr style="background:${bg};"><td style="padding:5px 8px;border-bottom:1px solid #e5e7eb;font-size:12px;color:#000000;font-weight:700;">${icon} ${label}${mSuffix}</td><td style="padding:5px 8px;border-bottom:1px solid #e5e7eb;text-align:right;font-size:12px;font-weight:900;color:#000000;">₹ ${amt.toLocaleString("en-IN")}</td></tr>`;
      }
    });

    try {
      const bdIds = JSON.parse(f.selectedBookIds || "[]");
      if (bdIds.length) {
        const allBD = [...(store.booksAndDress || [])];
        bdIds.forEach(id => {
          const item = allBD.find(i => String(i.id) === String(id));
          if (item) {
            feeRows += `<tr style="background:#f0f4ff;"><td style="padding:5px 8px;border-bottom:1px solid #e5e7eb;font-size:12px;color:#000000;font-weight:700;">${item.itemType === "Book" ? "📚" : "👕"} ${item.itemName}</td><td style="padding:5px 8px;border-bottom:1px solid #e5e7eb;text-align:right;font-size:12px;font-weight:900;color:#000000;">₹ ${item.price.toLocaleString("en-IN")}</td></tr>`;
          }
        });
      }
    } catch(e) {}
    
    const dueAmt = parseFloat(f.dueMgmtAmount) || 0;
    if (dueAmt > 0) {
      const pars = f.dueMgmtParticulars || "Outstanding Dues";
      feeRows += `<tr style="background:#fff1f2;"><td style="padding:5px 8px;border-bottom:1px solid #e5e7eb;font-size:12px;color:#991b1b;font-weight:900;">🔖 ${pars}</td><td style="padding:5px 8px;border-bottom:1px solid #e5e7eb;text-align:right;font-size:12px;font-weight:900;color:#991b1b;">₹ ${dueAmt.toLocaleString("en-IN")}</td></tr>`;
    }

    container.innerHTML = `
    <style>
      .slip-abs-black, .slip-abs-black * {
        color: #000000 !important;
        opacity: 1 !important;
        visibility: visible !important;
        -webkit-font-smoothing: none !important;
        text-shadow: 0 0 1px rgba(0,0,0,0.3) !important;
      }
      .slip-grid {
        color: #000000 !important;
      }
    </style>
    <div class="slip-abs-black" style="width:400px;display:flex;flex-direction:column;font-family:Arial,sans-serif;font-size:12px;border:1.5px solid #1e3a8a;border-radius:6px;box-sizing:border-box;background-color:#ffffff;padding:0;">
      <div style="border-bottom:2px solid #1e3a8a;padding:15px 5px;text-align:center;">
        <div style="display:flex;align-items:center;justify-content:center;gap:8px;">
          <img src="logo.png" style="height:42px;object-fit:contain;" alt="Logo" />
          <div style="font-size:18px;font-weight:900;color:#1e3a8a !important;letter-spacing:0.5px;text-transform:uppercase;">${schoolName}</div>
        </div>
        <div style="font-size:11px;color:#1e3a8a !important;margin-top:1px;font-weight:800;">Prem Nagar Tapin North, Ramgarh(JH)</div>
        <div style="margin-top:6px;display:inline-block;background-color:#1e3a8a !important;color:#ffffff !important;padding:6px 18px;font-size:12px;font-weight:900;text-transform:uppercase;border-radius:2px;">FEE SLIP</div>
      </div>
      <div style="display:flex;justify-content:space-between;padding:6px 10px;background-color:#eef2ff;border-bottom:1px solid #c7d2fe;font-size:11px;color:#1e3a8a !important;font-weight:800;">
        <span><strong>No:</strong> ${slipNo}</span>
        <span><strong>Term:</strong> ${f.term || "-"}</span>
        <span><strong>Date:</strong> ${printDate}</span>
      </div>
      <div style="padding:10px 12px;border-bottom:1px solid #e5e7eb;">
        <table style="width:100%;border-collapse:collapse;font-size:12px;">
          <tr>
            <td style="color:#000000;width:25%;padding:3px 0;font-weight:800;">Name</td>
            <td style="font-weight:900;color:#000000;padding:3px 0;">${f.studentName || "-"}</td>
            <td style="color:#000000;width:15%;padding:3px 0 3px 8px;font-weight:800;">Adm.No</td>
            <td style="font-weight:900;color:#000000;padding:3px 0;">${f.admissionNo || "-"}</td>
          </tr>
          <tr>
            <td style="color:#000000;padding:3px 0;font-weight:800;">Father</td>
            <td style="font-weight:900;color:#000000;padding:3px 0;">${f.fatherName || "-"}</td>
            <td style="color:#000000;padding:3px 0 3px 8px;font-weight:800;">Class</td>
            <td style="font-weight:900;color:#000000;padding:3px 0;">${f.className || "-"}</td>
          </tr>
          <tr>
            <td style="color:#000000;padding:3px 0;font-weight:800;">Roll</td>
            <td style="font-weight:900;color:#000000;padding:3px 0;">${f.rollNo || "-"}</td>
            <td style="color:#000000;padding:3px 0 3px 8px;font-weight:800;">Method</td>
            <td style="font-weight:900;color:#000000;padding:3px 0;">${f.paymentMethod || "-"}</td>
          </tr>
          <tr>
            <td style="color:#000000;padding:4px 0 2px;font-weight:700;">Status</td>
            <td colspan="3" style="padding:4px 0;"><span style="background-color:${statusBg} !important;color:${statusColor} !important;font-weight:800;padding:2px 10px;border-radius:4px;font-size:11px;border:1px solid ${statusColor};">${(f.status || "Pending").toUpperCase()}</span></td>
          </tr>
        </table>
      </div>
      <div style="padding:8px 12px;border-bottom:1px solid #e5e7eb;flex:1;">
        <div style="font-size:11px;font-weight:900;color:#000000;text-transform:uppercase;margin-bottom:6px;">Fee Details</div>
        <table style="width:100%;border-collapse:collapse;">
          <thead style="background-color:#1e3a8a;">
            <tr style="background-color:#1e3a8a;">
              <th style="padding:6px 8px;text-align:left;font-size:11px;font-weight:800;color:#ffffff;background-color:#1e3a8a;">Description</th>
              <th style="padding:6px 8px;text-align:right;font-size:11px;font-weight:800;color:#ffffff;background-color:#1e3a8a;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${feeRows || `<tr><td colspan="2" style="padding:15px;color:#000000;text-align:center;font-size:12px;font-weight:800;">No details</td></tr>`}
          </tbody>
        </table>
      </div>
      <div style="padding:12px;background:#f8fafc;border-top:1px solid #e2e8f0;display:flex;align-items:center;gap:15px;">
        <!-- QR Code Column -->
        <div style="width:65px;height:65px;background:#fff;padding:3px;display:flex;align-items:center;justify-content:center;border:1px solid #e5e7eb;">
          <img src="qr.png" style="width:100%;height:100%;object-fit:contain;" alt="Payment QR" />
        </div>
        <!-- Totals Column -->
        <div style="flex:1;font-size:13px;">
          <div style="display:flex;justify-content:space-between;margin-bottom:5px;">
            <span style="color:#000000 !important;font-weight:700;">Total Fee</span>
            <span style="font-weight:900;color:#000000 !important;">₹ ${totalFee.toLocaleString("en-IN")}</span>
          </div>
          <div style="display:flex;justify-content:space-between;margin-bottom:5px;">
            <span style="color:#000000 !important;font-weight:700;">Paid</span>
            <span style="font-weight:900;color:#16a34a !important;">₹ ${paidAmount.toLocaleString("en-IN")}</span>
          </div>
            <div style="display:flex;justify-content:space-between;">
            <span style="color:#000000 !important;font-weight:700;">Balance</span>
            <span style="font-weight:900;color:#dc2626 !important;">₹ ${balance.toLocaleString("en-IN")}</span>
          </div>
        </div>
      </div>
      <div style="padding:5px 15px 15px;display:flex;justify-content:space-between;font-size:11px;color:#000000 !important;">
        <div style="text-align:center;width:45%;"><div style="border-top:1px solid #000000 !important;margin-top:20px;padding-top:4px;font-weight:700;color:#000000 !important;">Parent</div></div>
        <div style="text-align:center;width:45%;"><div style="border-top:1px solid #000000 !important;margin-top:20px;padding-top:4px;font-weight:700;color:#000000 !important;">Cashier</div></div>
      </div>
    </div>
    `;

    showToast(`📸 Generating Formal Slip for ${f.studentName}...`, "info");

    try {
      await new Promise(r => setTimeout(r, 400));
      const canvas = await html2canvas(container, {
        scale: 5,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false
      });
      document.body.removeChild(container);
      canvas.toBlob(async (blob) => {
        const fileName = `Fee_Slip_${f.studentName || 'Student'}.png`;
        try {
          if (navigator.clipboard && window.ClipboardItem) {
            await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
            showToast(`✅ Slip for ${f.studentName} COPIED! Ready to Paste.`, "success");
          } else {
            throw new Error("Clipboard API not available");
          }
        } catch (clipErr) {
          console.warn("Clipboard failed, using download fallback", clipErr);
          // Fallback: Download the file automatically
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = fileName;
          link.click();
          URL.revokeObjectURL(url);
          showToast(`💾 Slip saved to Downloads. Please attach it in WhatsApp.`, "warning");
        }
        openWhatsApp(f.phone || student?.phone || student?.phone1, `Hello! Attached is the Digital Fee Slip for *${f.studentName}*.`);
      }, 'image/png');
    } catch (err) {
      if (container.parentNode) document.body.removeChild(container);
      showToast("❌ Generation failed.", "error");
    }
  };
})();

async function renderDueManagementForm(cfg, studentOptions, classOptions, initialValues = {}, formRefs = {}) {
  const container = refs.dynamicForm;
  container.innerHTML = "";
  
  const outer = document.createElement("div");
  outer.className = "due-management-container";
  outer.style.width = "100%";
  outer.style.gridColumn = "1 / -1"; // Ensure it spans full width of parent .form-grid
  
  // Row 1: Student Selection & Info
  const row1 = document.createElement("div");
  row1.className = "due-form-row four-cols";
  
  ["admissionNo", "studentName", "className", "rollNo"].forEach(fn => {
    const field = document.createElement("div");
    field.className = "field";
    const label = document.createElement("label");
    label.textContent = toLabel(fn);
    
    let input;
    if (fn === "studentName") {
      input = document.createElement("select");
      input.name = fn;
      input.innerHTML = `<option value="">Select Student</option>` + studentOptions.map(s => `<option value="${s.value}">${s.label}</option>`).join("");
      input.dataset.tomselect = "true";
    } else if (fn === "className") {
      input = document.createElement("select");
      input.name = fn;
      input.innerHTML = `<option value="">Select Class</option>` + classOptions.map(c => `<option value="${c}">${c}</option>`).join("");
    } else {
      input = document.createElement("input");
      input.type = "text";
      input.name = fn;
    }
    
    input.value = initialValues[fn] || "";
    formRefs[fn] = input;
    field.append(label, input);
    row1.appendChild(field);
  });
  
  // Row 2: Session & Particulars
  const row2 = document.createElement("div");
  row2.className = "due-form-row four-cols";
  
  // Session (1 col)
  const sessionField = document.createElement("div");
  sessionField.className = "field";
  sessionField.innerHTML = `<label>Session</label><input type="text" name="session" value="${initialValues.session || ""}">`;
  formRefs.session = sessionField.querySelector("input");
  row2.appendChild(sessionField);
  
  // Particulars (3 cols)
  const particularsField = document.createElement("div");
  particularsField.className = "field";
  particularsField.style.gridColumn = "span 3";
  particularsField.innerHTML = `<label>Particulars</label><input type="text" name="particulars" placeholder="e.g. Previous Session Balance" value="${initialValues.particulars || ""}">`;
  formRefs.particulars = particularsField.querySelector("input");
  row2.appendChild(particularsField);
  
  // Row 3: Remarks (Full Row)
  const row3 = document.createElement("div");
  row3.className = "due-form-row";
  row3.style.gridTemplateColumns = "1fr";
  const remarksField = document.createElement("div");
  remarksField.className = "field";
  remarksField.innerHTML = `<label>Remarks</label><input type="text" name="remarks" placeholder="Any additional notes..." value="${initialValues.remarks || ""}">`;
  formRefs.remarks = remarksField.querySelector("input");
  row3.appendChild(remarksField);
  
  // Row 4: Financials
  const row4 = document.createElement("div");
  row4.className = "due-form-row four-cols";
  ["dueAmount", "paidAmount", "balance", "status"].forEach(fn => {
    const field = document.createElement("div");
    field.className = "field";
    const label = document.createElement("label");
    label.textContent = toLabel(fn);
    const input = (fn === "status") ? document.createElement("select") : document.createElement("input");
    
    if (fn === "status") {
      input.innerHTML = `<option value="Pending">Pending</option><option value="Partial">Partial</option><option value="Paid">Paid</option>`;
      input.disabled = true;
      input.style.background = "#f1f5f9";
    } else {
      input.type = "number";
    }
    
    input.name = fn;
    input.value = initialValues[fn] || (fn === "status" ? "Pending" : "0");
    if (fn === "balance") { input.readOnly = true; input.style.background = "#fff7ed"; input.style.fontWeight = "bold"; }
    
    formRefs[fn] = input;
    field.append(label, input);
    row4.appendChild(field);
  });
  
  const submitWrap = document.createElement("div");
  submitWrap.className = "due-submit-btn-wrap";
  
  const submitBtn = document.createElement("button");
  submitBtn.type = "submit";
  submitBtn.className = "due-submit-btn";
  submitBtn.innerHTML = `<span>✨</span> ${editRecordId ? 'Update Due Balance' : 'Save Due Record'}`;
  submitWrap.appendChild(submitBtn);
  
  outer.append(row1, row2, row3, row4, submitWrap);
  container.appendChild(outer);

  // Auto-fill student details
  if (formRefs.studentName) {
    if (formRefs.studentName.dataset.tomselect) {
        // Initialize tomselect after append
        setTimeout(() => {
            if (window.TomSelect && !formRefs.studentName.tomselect) {
                new TomSelect(formRefs.studentName, {
                    onChange: (val) => {
                        const s = studentOptions.find(o => o.value === val);
                        if (s) {
                            if (formRefs.className) formRefs.className.value = s.className || "";
                            if (formRefs.rollNo) formRefs.rollNo.value = s.rollNo || "";
                            if (formRefs.admissionNo) formRefs.admissionNo.value = s.admissionNo || "";
                        }
                    }
                });
            }
        }, 10);
    } else {
        formRefs.studentName.addEventListener("change", () => {
            const s = studentOptions.find(o => o.value === formRefs.studentName.value);
            if (s) {
                if (formRefs.className) formRefs.className.value = s.className || "";
                if (formRefs.rollNo) formRefs.rollNo.value = s.rollNo || "";
                if (formRefs.admissionNo) formRefs.admissionNo.value = s.admissionNo || "";
            }
        });
    }
  }

  // Auto-calculate balance
  const calc = () => {
    const due = parseFloat(formRefs.dueAmount.value) || 0;
    const paid = parseFloat(formRefs.paidAmount.value) || 0;
    const bal = due - paid;
    formRefs.balance.value = Math.max(0, bal);
    formRefs.status.value = bal <= 0 ? "Paid" : (paid > 0 ? "Partial" : "Pending");
  };
  formRefs.dueAmount.addEventListener("input", calc);
  formRefs.paidAmount.addEventListener("input", calc);

  // Populate initial values if editing
  if (editRecordId) {
    calc();
  }
}

/* ═══════════════════════════════════════════════════════════
   VIDYA — AI AVATAR ASSISTANT (Student Portal)
   ═══════════════════════════════════════════════════════════ */

function mountVidyaAvatar(student) {
  let vidyaLang = "auto"; 
  let vidyaPreferredProvider = "auto"; 
  let isSpeaking = false;
  let speechSynth = window.speechSynthesis;
  let recognition = null;
  
  const isS = !!student;
  const displayName = isS ? student.fullName : (currentUser?.fullName || "Admin");

  // ── Build context ──
  const store = getStore();
  let studentCtx = `Role: ${currentUser?.role || "Admin"}`;
  
  if (isS) {
    const fees = (store.fees || []).filter(f => f.studentName === student.fullName);
    const dues = (store.dueManagement || []).filter(d => d.studentName === student.fullName);
    const totalDue = dues.reduce((s, d) => s + (parseFloat(d.balance) || 0), 0) +
                     fees.reduce((s, f) => s + (parseFloat(f.balance) || 0), 0);
    const paidTotal = fees.reduce((s, f) => s + (parseFloat(f.paidAmount) || 0), 0);
    studentCtx = `Student Info: Name=${student.fullName}, Class=${student.className}, Roll No=${student.rollNo}, Admission No=${student.admissionNo}.
Fee Summary: Total Paid=₹${paidTotal}, Outstanding Due=₹${totalDue}.
Number of fee records=${fees.length}. Number of overdue records=${dues.length}.`;
  } else {
    studentCtx += "\nNote: User is an Administrator. Accessing system-wide knowledge base.";
  }

  // ── SVG Cartoon Character (Vidya) ──
  const avatarSVG = `
    <svg class="vidya-avatar-svg" id="vidyaAvatarSvg" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
      <!-- Body -->
      <ellipse cx="30" cy="52" rx="14" ry="8" fill="#7c3aed" opacity="0.3"/>
      <!-- Torso -->
      <rect x="18" y="38" width="24" height="16" rx="6" fill="#7c3aed"/>
      <!-- Collar stars -->
      <text x="25" y="50" font-size="5" fill="#c4b5fd">★</text>
      <!-- Head -->
      <circle cx="30" cy="26" r="16" fill="#fde68a"/>
      <!-- Hair -->
      <ellipse cx="30" cy="11" rx="15" ry="7" fill="#1e293b"/>
      <rect x="15" y="11" width="30" height="6" rx="0" fill="#1e293b"/>
      <!-- Left Ear -->
      <ellipse cx="14" cy="26" rx="3" ry="4" fill="#fde68a"/>
      <!-- Right Ear -->
      <ellipse cx="46" cy="26" rx="3" ry="4" fill="#fde68a"/>
      <!-- Eyes -->
      <circle cx="23" cy="25" r="4" fill="white"/>
      <circle cx="37" cy="25" r="4" fill="white"/>
      <circle cx="24" cy="25.5" r="2.2" fill="#1e293b"/>
      <circle cx="38" cy="25.5" r="2.2" fill="#1e293b"/>
      <!-- Eye shine -->
      <circle cx="25" cy="24.5" r="0.8" fill="white"/>
      <circle cx="39" cy="24.5" r="0.8" fill="white"/>
      <!-- Nose -->
      <ellipse cx="30" cy="29" rx="1.5" ry="1" fill="#f59e0b"/>
      <!-- Mouth -->
      <path class="vidya-avatar-mouth" d="M 24 33 Q 30 38 36 33" stroke="#92400e" stroke-width="1.5" fill="none" stroke-linecap="round"/>
      <!-- Cheeks -->
      <circle cx="20" cy="31" r="3" fill="#fca5a5" opacity="0.5"/>
      <circle cx="40" cy="31" r="3" fill="#fca5a5" opacity="0.5"/>
      <!-- Arms -->
      <rect x="5" y="40" width="13" height="6" rx="3" fill="#7c3aed" transform="rotate(-20 5 40)"/>
      <rect x="42" y="40" width="13" height="6" rx="3" fill="#7c3aed" transform="rotate(20 42 40)"/>
      <!-- Book in hand -->
      <rect x="4" y="47" width="9" height="7" rx="2" fill="#c7d2fe"/>
      <line x1="8.5" y1="47" x2="8.5" y2="54" stroke="#818cf8" stroke-width="0.8"/>
    </svg>`;

  // ── HTML Structure ──
  const quickHi = isS ? ["मेरी fees?", "My timetable?", "Results kab?", "Help me!"] : ["School status?", "Fee pending?", "Attendance summary", "Daily help"];

  const widget = document.createElement("div");
  widget.id = "vidyaWidget";
  widget.className = "vidya-widget hidden";
  widget.innerHTML = `
    <div class="vidya-header">
      <div class="vidya-header-top">
        <div class="vidya-header-info">
          <h4>🎓 Vidya — AI Helper</h4>
          <p>आपकी अपनी AI साथी • Hindi & English</p>
          <div id="vidyaProviderBadge" style="font-size:0.6rem; background:rgba(0,0,0,0.2); padding:1px 6px; border-radius:4px; display:inline-block; margin-top:4px;">Searching provider...</div>
        </div>
        <button class="vidya-close-btn" id="vidyaCloseBtn">✕</button>
      </div>
      <div class="vidya-avatar-svg-wrap">${avatarSVG}</div>
    </div>
    <div class="vidya-lang-toggle">
      <button class="vidya-lang-btn active" data-lang="auto">🌐 Auto</button>
      <button class="vidya-lang-btn" data-lang="hi">🇮🇳 Hindi</button>
      <button class="vidya-lang-btn" data-lang="en">🇬🇧 English</button>
    </div>
    <div class="vidya-model-toggle" id="vidyaModelToggle">
      <button class="vidya-model-btn active" data-provider="auto">🧠 Auto</button>
      <button class="vidya-model-btn" data-provider="Gemini">♊ Gemini</button>
      <button class="vidya-model-btn" data-provider="OpenRouter">🚀 DeepSeek</button>
      <button class="vidya-model-btn" data-provider="OpenAI">🤖 OpenAI</button>
    </div>
    <div class="vidya-messages" id="vidyaMessages">
      <div class="vidya-msg bot">
        <div class="vidya-msg-avatar">🤖</div>
        <div class="vidya-bubble">नमस्ते ${displayName.split(" ")[0]}! 👋 मैं Vidya हूँ — आपकी AI साथी! आप Hindi या English में कुछ भी पूछ सकते हैं। 😊</div>
      </div>
    </div>
    <div class="vidya-quick-wrap">
      ${quickHi.map(q => `<button class="vidya-quick-btn" data-q="${q}">${q}</button>`).join("")}
    </div>
    <div class="vidya-input-area">
      <button class="vidya-mic-btn" id="vidyaMicBtn" title="Speak / बोलें">🎤</button>
      <textarea class="vidya-input" id="vidyaInput" rows="1" placeholder="Hindi या English में पूछें..."></textarea>
      <button class="vidya-send-btn" id="vidyaSendBtn">➤</button>
    </div>`;

  // ── FAB Button ──
  const fab = document.createElement("div");
  fab.id = "vidyaFab";
  fab.className = "vidya-fab";
  fab.innerHTML = `
    <div class="vidya-fab-ring"></div>
    <div class="vidya-fab-avatar">🎓</div>
    <span class="vidya-fab-label">AI Vidya</span>`;

  document.body.appendChild(widget);
  document.body.appendChild(fab);

  // ── Helpers ──
  const msgBox = document.getElementById("vidyaMessages");
  const inputEl = document.getElementById("vidyaInput");
  const svgEl   = document.getElementById("vidyaAvatarSvg");

  function addMsg(text, role, provider) {
    const div = document.createElement("div");
    div.className = `vidya-msg ${role}`;
    const avatar = role === "bot" ? "🤖" : "🧑‍🎓";
    let providerHtml = provider ? `<div style="font-size:0.6rem; color:#64748b; margin-top:2px; text-align:left;">via ${provider}</div>` : "";
    div.innerHTML = `<div class="vidya-msg-avatar">${avatar}</div><div><div class="vidya-bubble">${text}</div>${providerHtml}</div>`;
    msgBox.appendChild(div);
    msgBox.scrollTop = msgBox.scrollHeight;
    return div;
  }

  function showTyping() {
    const d = document.createElement("div");
    d.className = "vidya-msg bot";
    d.id = "vidyaTyping";
    d.innerHTML = `<div class="vidya-msg-avatar">🤖</div><div class="vidya-bubble"><div class="vidya-typing"><span></span><span></span><span></span></div></div>`;
    msgBox.appendChild(d);
    msgBox.scrollTop = msgBox.scrollHeight;
  }

  function removeTyping() {
    const t = document.getElementById("vidyaTyping");
    if (t) t.remove();
  }

  function speak(text) {
    if (!speechSynth) return;
    speechSynth.cancel();
    const cleaned = text.replace(/[*_#`]/g, "");
    const utter = new SpeechSynthesisUtterance(cleaned);
    // Detect Hindi characters
    const hasHindi = /[\u0900-\u097F]/.test(cleaned);
    utter.lang = (vidyaLang === "hi" || (vidyaLang === "auto" && hasHindi)) ? "hi-IN" : "en-IN";
    utter.rate = 0.95;
    utter.pitch = 1.15;
    utter.onstart  = () => { isSpeaking = true;  svgEl?.classList.add("talking"); };
    utter.onend    = () => { isSpeaking = false; svgEl?.classList.remove("talking"); };
    utter.onerror  = () => { isSpeaking = false; svgEl?.classList.remove("talking"); };
    // Pick best voice
    const voices = speechSynth.getVoices();
    const preferred = voices.find(v => v.lang === utter.lang) ||
                      voices.find(v => v.lang.startsWith(utter.lang.split("-")[0]));
    if (preferred) utter.voice = preferred;
    speechSynth.speak(utter);
  }

  async function sendMessage(prompt) {
    if (!prompt.trim()) return;
    addMsg(escapeHtml(prompt), "user");
    inputEl.value = "";
    showTyping();

    try {
      const langHint = vidyaLang === "hi" ? "Answer in Hindi only." :
                       vidyaLang === "en" ? "Answer in English only." : "";
      const fullPrompt = langHint ? `(${langHint}) ${prompt}` : prompt;
      const res = await api("/api/ai/chat", {
        method: "POST",
        body: JSON.stringify({ 
          prompt: fullPrompt, 
          studentContext: studentCtx,
          preferredProvider: vidyaPreferredProvider 
        })
      });
      removeTyping();
      const reply = res.reply || "Sorry, no response!";
      const provider = res.provider || "";
      addMsg(reply, "bot", provider);
      if (provider) document.getElementById("vidyaProviderBadge").textContent = `Powered by ${provider}`;
      speak(reply);
    } catch (err) {
      removeTyping();
      const errMsg = "Oops! Connection error. Please try again!";
      addMsg(errMsg, "bot");
      speak(errMsg);
    }
  }

  // ── Lang toggle ──
  widget.querySelectorAll(".vidya-lang-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      widget.querySelectorAll(".vidya-lang-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      vidyaLang = btn.dataset.lang;
    });
  });

  // ── Model toggle ──
  widget.querySelectorAll(".vidya-model-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      widget.querySelectorAll(".vidya-model-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      vidyaPreferredProvider = btn.dataset.provider;
      
      const badge = document.getElementById("vidyaProviderBadge");
      if (vidyaPreferredProvider === "auto") {
        badge.textContent = "Auto Switching Mode...";
      } else {
        badge.textContent = `Using ${vidyaPreferredProvider} Brain...`;
      }
    });
  });

  // ── FAB toggle ──
  fab.addEventListener("click", () => {
    widget.classList.toggle("hidden");
    if (!widget.classList.contains("hidden")) inputEl.focus();
  });

  document.getElementById("vidyaCloseBtn").addEventListener("click", () => {
    widget.classList.add("hidden");
  });

  // ── Send button ──
  document.getElementById("vidyaSendBtn").addEventListener("click", () => sendMessage(inputEl.value));
  inputEl.addEventListener("keydown", e => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(inputEl.value); }
  });

  // ── Quick questions ──
  widget.querySelectorAll(".vidya-quick-btn").forEach(btn => {
    btn.addEventListener("click", () => sendMessage(btn.dataset.q));
  });

  // ── Mic / Speech Recognition ──
  const micBtn = document.getElementById("vidyaMicBtn");
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.continuous = false;

    recognition.onstart = () => micBtn.classList.add("listening");
    recognition.onend   = () => micBtn.classList.remove("listening");
    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      inputEl.value = transcript;
      sendMessage(transcript);
    };
    recognition.onerror = () => micBtn.classList.remove("listening");

    micBtn.addEventListener("click", () => {
      recognition.lang = vidyaLang === "hi" ? "hi-IN" : vidyaLang === "en" ? "en-IN" : "hi-IN";
      if (micBtn.classList.contains("listening")) {
        recognition.stop();
      } else {
        recognition.start();
      }
    });
  } else {
    micBtn.style.display = "none";
  }

  // Auto-greet with speech after a short delay
  setTimeout(() => {
    if (speechSynth && speechSynth.getVoices) speechSynth.getVoices(); // warm up
  }, 500);

  // Check active providers on start
  api("/api/ai/status").then(status => {
    const badge = document.getElementById("vidyaProviderBadge");
    if (status.activeProviders && status.activeProviders.length > 0) {
      badge.textContent = `Ready: ${status.activeProviders.join(", ")}`;
    } else {
      badge.textContent = "No AI keys configured";
      badge.style.background = "#ef4444";
    }
  }).catch(() => {
    const badge = document.getElementById("vidyaProviderBadge");
    if (badge) badge.textContent = "Offline";
  });
}

// Landing Page Event Listeners Removed
document.getElementById("closeAuthBtn")?.addEventListener("click", () => {
  // If no user, we can't really close login, so maybe just show a toast or do nothing
  if (!currentUser) {
    showToast("Please login to continue", "info");
    return;
  }
  document.getElementById("authOverlay")?.classList.add("hidden");
});

