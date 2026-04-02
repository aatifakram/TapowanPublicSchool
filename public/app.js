const FACE_KEY = "school_face_embeddings_v2";
const FACE_MODEL_URL = "https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/";
const CLASS_STANDARD_OPTIONS = ["Nursery", "LKG", "UKG", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];

const moduleConfig = {
  dashboard: { title: "Dashboard", subtitle: "School overview and quick statistics", fields: [], columns: ["Metric", "Value"] },
  students: {
    title: "Students",
    subtitle: "Manage student admissions and profiles",
    fields: ["admissionNo", "rollNo", "fullName", "className", "gender", "dob", "parentName", "phone", "address", "photo", "status", "aadhar", "tc", "reportCard"],
    columns: ["fullName", "rollNo", "classPart", "sectionPart", "phone", "status"]
  },
  teachers: { title: "Teachers", subtitle: "Manage teacher records and contacts", fields: ["employeeNo", "fullName", "department", "qualification", "phone", "email", "joinDate"], columns: ["id", "employeeNo", "fullName", "department", "qualification", "phone", "email"] },
  classes: { title: "Classes", subtitle: "Create classes and assign class teachers", fields: ["className", "section", "classTeacher", "roomNo", "capacity"], columns: ["id", "className", "section", "classTeacher", "roomNo", "capacity"] },
  subjects: { title: "Subjects", subtitle: "Define subjects and assign faculty", fields: ["subjectCode", "subjectName", "className", "teacher", "credits"], columns: ["id", "subjectCode", "subjectName", "className", "teacher", "credits"] },
  attendance: { title: "Attendance", subtitle: "Track daily student attendance", fields: ["date", "className", "studentName", "rollNo", "status", "arrivalTime", "departureTime", "remarks"], columns: ["id", "date", "className", "studentName", "rollNo", "status", "arrivalTime", "departureTime", "remarks"] },
  teacherAttendance: { title: "Teacher Attendance", subtitle: "Track daily teacher attendance", fields: ["date", "department", "teacherName", "status", "remarks"], columns: ["id", "date", "department", "teacherName", "status", "remarks"] },
  exams: { title: "Exams & Results", subtitle: "Manage exams and student marks", fields: ["examName", "className", "subject", "studentName", "rollNo", "marksObtained", "maxMarks", "grade"], columns: ["id", "examName", "className", "subject", "studentName", "rollNo", "marksObtained", "maxMarks", "grade"] },
  fees: { title: "Fees", subtitle: "Record fee structures and payments", fields: ["studentName", "className", "rollNo", "term", "totalFee", "paidAmount", "status", "paymentDate", "paymentMethod"], columns: ["id", "studentName", "className", "rollNo", "term", "totalFee", "paidAmount", "balance", "status"] },
  library: { title: "Library", subtitle: "Manage books, issues and returns", fields: ["bookCode", "bookTitle", "author", "issuedTo", "issueDate", "returnDate", "status"], columns: ["id", "bookCode", "bookTitle", "author", "issuedTo", "issueDate", "returnDate", "status"] },
  transport: { title: "Transport", subtitle: "Track routes, buses and student allocation", fields: ["routeName", "vehicleNo", "driverName", "studentName", "pickupPoint", "monthlyFee"], columns: ["id", "routeName", "vehicleNo", "driverName", "studentName", "pickupPoint", "monthlyFee"] },
  hostel: { title: "Hostel", subtitle: "Manage hostel rooms and allocations", fields: ["hostelName", "roomNo", "studentName", "warden", "checkInDate", "bedNo", "status"], columns: ["id", "hostelName", "roomNo", "studentName", "warden", "checkInDate", "bedNo", "status"] },
  payroll: { title: "Payroll", subtitle: "Generate salary records and allowances", fields: ["employeeName", "designation", "month", "basicSalary", "allowances", "deductions", "netPay"], columns: ["id", "employeeName", "designation", "month", "basicSalary", "allowances", "deductions", "netPay"] },
  users: { title: "Users & Roles", subtitle: "System user accounts and permissions", fields: ["username", "fullName", "role", "email", "status", "lastLogin", "password"], columns: ["id", "username", "fullName", "role", "email", "status", "lastLogin"] },
  timetable: { title: "Timetable", subtitle: "Weekly class and subject scheduling", fields: ["className", "day", "period", "subject", "teacher", "roomNo"], columns: ["id", "className", "day", "period", "subject", "teacher", "roomNo"] }
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

// Modules visible per role
const STUDENT_VISIBLE_MODULES = new Set(["dashboard", "students", "attendance", "exams", "fees", "timetable", "subjects"]);
const TEACHER_VISIBLE_MODULES = new Set(["dashboard", "students", "teachers", "classes", "subjects", "attendance", "teacherAttendance", "exams", "timetable", "library"]);
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
let pendingStudentPrefill = null;

const refs = {
  sidebar: document.getElementById("sidebar"),
  mobileMenuBtn: document.getElementById("mobileMenuBtn"),
  mobileSidebarBackdrop: document.getElementById("mobileSidebarBackdrop"),
  moduleNav: document.getElementById("moduleNav"),
  moduleTitle: document.getElementById("moduleTitle"),
  moduleSubtitle: document.getElementById("moduleSubtitle"),
  dynamicForm: document.getElementById("dynamicForm"),
  tableHead: document.getElementById("tableHead"),
  tableBody: document.getElementById("tableBody"),
  statsCards: document.getElementById("statsCards"),
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
  exportPdfBtn: document.getElementById("exportPdfBtn"),
  printDocBtn: document.getElementById("printDocBtn"),
  facePanel: document.getElementById("facePanel"),
  startCameraBtn: document.getElementById("startCameraBtn"),
  captureFaceBtn: document.getElementById("captureFaceBtn"),
  markFaceAttendanceBtn: document.getElementById("markFaceAttendanceBtn"),
  faceVideo: document.getElementById("faceVideo"),
  faceCanvas: document.getElementById("faceCanvas"),
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
  studentProfileTabs: document.querySelectorAll('.student-profile-tab')
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
  return new Date().toISOString().slice(0, 10);
}

function nowStr() {
  return new Date().toISOString().slice(0, 19).replace("T", " ");
}

function timeStr() {
  // HH:mm (local time). Stored as TEXT in DB.
  return new Date().toTimeString().slice(0, 5);
}

function getStore() { return serverStore || {}; }
function getFaceStore() { return JSON.parse(localStorage.getItem(FACE_KEY) || "{}"); }
function saveFaceStore(v) { localStorage.setItem(FACE_KEY, JSON.stringify(v)); }

function toLabel(key) {
  const custom = {
    className: "Class",
    classPart: "Class",
    sectionPart: "Section",
    rollNo: "Roll No",
    phone: "Mobile",
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
function asNum(value) { return Number(value) || 0; }

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
  return fromQuery || fromStorage || fromWindow || "";
}

let API_BASE_URL = getApiBaseUrl();

async function api(path, options = {}) {
  const controller = new AbortController();
  const timeoutMs = Number(options.timeoutMs) > 0 ? Number(options.timeoutMs) : 70000; // Render free tier can take ~50s to wake
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      credentials: "include",
      headers: { "Content-Type": "application/json", ...(options.headers || {}) },
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
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.error || "Request failed");
  }
  return response.json();
}

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
    }
  } catch (err) {
    console.error("loadStore failed:", err);
    // Keep existing serverStore intact on failure rather than wiping it
    if (!serverStore || typeof serverStore !== "object") {
      serverStore = {};
    }
  }
}

function applyAuthUI(session) {
  const loggedIn = !!session;
  currentUser = session || null;
  refs.authOverlay.classList.toggle("hidden", loggedIn);
  refs.activeUserBadge.textContent = loggedIn ? `${session.fullName} (${session.role})` : "Guest";

  // Show/hide role badge with color coding
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
  const data = await api("/api/auth/me");
  return data.user;
}

async function login(username, password) {
  const data = await api("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password })
  });
  return data.user;
}

async function signup(payload) {
  const data = await api("/api/auth/signup", {
    method: "POST",
    body: JSON.stringify(payload)
  });
  return data.user;
}

async function logout() {
  await api("/api/auth/logout", { method: "POST" });
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
  if (userIsAdmin()) return moduleOrder;
  if (userIsStaffOrAbove()) return moduleOrder.filter(m => !ADMIN_ONLY_MODULES.has(m));
  if (String(currentUser.role || "").toLowerCase() === "teacher") return moduleOrder.filter(m => TEACHER_VISIBLE_MODULES.has(m));
  if (userIsStudent()) return moduleOrder.filter(m => STUDENT_VISIBLE_MODULES.has(m));
  return ["dashboard"];
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
  return userIsAdmin() || userIsStaffOrAbove();
}

function renderNav() {
  refs.moduleNav.innerHTML = "";
  const navIcons = {
    dashboard: "🏠",
    students: "👥",
    teachers: "🧑‍🏫",
    attendance: "🗓️",
    teacherAttendance: "🧾",
    studentsAttendance: "🗓️",
    exams: "📚",
    fees: "💲",
    library: "📖",
    transport: "🚌",
    hostel: "🏠",
    payroll: "💼",
    users: "🛡️",
    timetable: "⏰",
    notifications: "🔔"
  };

  const visibleModules = getVisibleModules();

  // If current module not visible, redirect to dashboard
  if (!visibleModules.includes(currentModule)) {
    currentModule = "dashboard";
  }

  visibleModules.forEach(name => {
    const btn = document.createElement("button");
    btn.className = `nav-btn ${name === currentModule ? "active" : ""}`;
    const icon = navIcons[name] || "•";
    btn.innerHTML = `<span class="nav-icon">${icon}</span><span class="nav-text">${moduleConfig[name].title}</span>`;
    btn.addEventListener("click", () => {
      currentModule = name;
      refs.searchInput.value = "";
      if (isMobileLayout()) setMobileSidebarOpen(false);
      renderAll();
    });
    refs.moduleNav.appendChild(btn);
  });
}

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
  const store = getStore();

  const classOptions = Array.from(new Set((store.classes || []).map((x) => [x.className, x.section].filter(Boolean).join("-")).filter(Boolean)));
  const studentOptions = (store.students || []).map((s) => ({
    value: s.fullName,
    label: `${s.fullName}${s.rollNo ? ` (${s.rollNo})` : ""}${s.className ? ` - ${s.className}` : ""}`,
    rollNo: s.rollNo || "",
    className: s.className || ""
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

    const selectFrom = (options, mapFn) => {
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

    const isClassReferenceField = field === "className" && currentModule !== "classes";
    const isTeacherReferenceField = ["teacherName", "classTeacher", "teacher", "employeeName"].includes(field) && currentModule !== "teachers";

    if (currentModule === "classes" && field === "className") {
      input = selectFrom(CLASS_STANDARD_OPTIONS, (opt) => ({ value: opt, label: opt }));
    } else if (field === "studentName" || field === "issuedTo") {
      input = selectFrom(studentOptions, (opt) => ({ value: opt.value, label: opt.label }));
    } else if (isTeacherReferenceField) {
      input = selectFrom(teacherOptions, (opt) => ({ value: opt.value, label: opt.label }));
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
    } else if (currentModule === "students" && ["photo", "aadhar", "tc", "reportCard"].includes(field)) {
      input = document.createElement("input");
      input.type = "file";
      input.name = field;
      input.accept = "image/*";
      input.required = false;
    } else {
      input = document.createElement("input");
      input.name = field;
      input.required = true;
      if (field === "paymentMethod" || field === "paymentDate") input.required = false;
      if (field.endsWith("Time")) {
        input.required = false; // arrival is required, but departure may be empty; handled by face auto-fill.
        input.type = "time";
      } else if (field.includes("date") || field === "dob") input.type = "date";
      else if (["email"].includes(field)) input.type = "email";
      else if (field === "password") { input.type = "password"; input.required = false; input.placeholder = "Leave blank to keep unchanged"; }
      else if (["phone"].includes(field)) input.type = "tel";
      else if (["marksObtained", "maxMarks", "totalFee", "paidAmount", "balance", "monthlyFee", "basicSalary", "allowances", "deductions", "netPay", "credits", "capacity"].includes(field)) input.type = "number";
    }

    formRefs[field] = input;
    wrapper.append(label, input);
    refs.dynamicForm.appendChild(wrapper);
  });

  // Auto-fill class and roll number when selecting a student.
  if (formRefs.studentName) {
    formRefs.studentName.addEventListener("change", () => {
      const selected = studentOptions.find((s) => s.value === formRefs.studentName.value);
      if (!selected) return;
      if (formRefs.className) formRefs.className.value = selected.className || formRefs.className.value;
      if (formRefs.rollNo) formRefs.rollNo.value = selected.rollNo || formRefs.rollNo.value;
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
    if (formRefs.className && s.className) formRefs.className.value = s.className;
    if (formRefs.rollNo && s.rollNo) formRefs.rollNo.value = s.rollNo;
    if (formRefs.date && (currentModule === "attendance" || currentModule === "teacherAttendance")) formRefs.date.value = todayStr();
    if (formRefs.status && (currentModule === "attendance" || currentModule === "teacherAttendance")) formRefs.status.value = "Present";
    pendingStudentPrefill = null;
  }

  const action = document.createElement("div");
  action.className = "actions";
  action.innerHTML = `<button type="submit">Save ${cfg.title}</button>`;
  refs.dynamicForm.appendChild(action);
}

function getCurrentList() {
  if (currentModule === "dashboard") {
    return Object.entries(getDashboardStats(getStore())).map(([metric, value], idx) => ({ id: idx + 1, Metric: metric, Value: value }));
  }
  const store = getStore();
  const search = refs.searchInput.value.trim().toLowerCase();
  let list = (store[currentModule] || []).slice();
  if (search) list = list.filter(item => JSON.stringify(item).toLowerCase().includes(search));
  return list;
}

function renderTable() {
  const cfg = moduleConfig[currentModule];
  refs.tableHead.innerHTML = "";
  refs.tableBody.innerHTML = "";

  const list = getCurrentList();
  if (currentModule === "dashboard") {
    refs.tableHead.innerHTML = "<tr><th>Metric</th><th>Value</th></tr>";
    list.forEach(item => {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td>${item.Metric}</td><td><span class="badge">${item.Value}</span></td>`;
      refs.tableBody.appendChild(tr);
    });
    return;
  }

  refs.tableHead.innerHTML = `<tr>${cfg.columns.map(c => `<th>${toLabel(c)}</th>`).join("")}<th>Action</th></tr>`;
  if (!list.length) {
    refs.tableBody.appendChild(refs.emptyState.content.cloneNode(true));
    return;
  }

  list.forEach(item => {
    const tr = document.createElement("tr");
    const split = currentModule === "students" ? splitClassName(item.className) : { classPart: "", sectionPart: "" };

    const cells = cfg.columns.map(key => {
      let val;
      if (currentModule === "students" && key === "classPart") val = split.classPart;
      else if (currentModule === "students" && key === "sectionPart") val = split.sectionPart;
      else if (currentModule === "students" && key === "status") val = item.status || "Active";
      else val = item[key] ?? "";

      if (String(val).toLowerCase().includes("active") || String(val).toLowerCase().includes("present")) {
        return `<td><span class="badge">${val}</span></td>`;
      }
      return `<td>${val}</td>`;
    }).join("");

    const canWrite = canCurrentUserWrite(currentModule);
    const canDel = canCurrentUserDelete();

    if (currentModule === "students") {
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
        <button class="action-btn action-view" data-action="print-receipt" data-id="${item.id}" style="margin-right:4px;">🖨 Receipt</button>
        ${canDel ? `<button class="chip" data-delete-id="${item.id}">Delete</button>` : ""}
      </td>`;
    } else if (currentModule === "users" && userIsAdmin()) {
      tr.innerHTML = `${cells}<td style="white-space:nowrap;">
        <select class="role-assign-select" data-user-id="${item.id}" style="padding:4px 8px;border-radius:6px;border:1px solid #cbd5e1;font-size:0.8rem;margin-right:4px;">
          ${["Administrator","Staff","Teacher","Student","Principal"].map(r =>
            `<option value="${r}" ${item.role === r ? "selected" : ""}>${r}</option>`
          ).join("")}
        </select>
        <button class="action-btn" data-assign-role-id="${item.id}" style="padding:4px 10px;font-size:0.8rem;">Save</button>
        ${canDel ? `<button class="chip" data-delete-id="${item.id}" style="margin-left:4px;">Delete</button>` : ""}
      </td>`;
    } else {
      tr.innerHTML = `${cells}<td>${canDel ? `<button class="chip" data-delete-id="${item.id}">Delete</button>` : "—"}</td>`;
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
  }
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
      <div class="panel" style="margin-bottom:12px;">
        <h3 style="margin-bottom:8px;">Basic Information</h3>
        <div class="student-actions" style="gap:12px;">
          <div style="min-width:200px;">
            <div><b>Name:</b> ${student.fullName || ""}</div>
            <div><b>Roll Number:</b> ${student.rollNo || ""}</div>
            <div><b>Class:</b> ${split.classPart || ""}</div>
            <div><b>Section:</b> ${split.sectionPart || ""}</div>
          </div>
          <div style="min-width:200px;">
            <div><b>Date of Birth:</b> ${student.dob || ""}</div>
            <div><b>Gender:</b> ${student.gender || ""}</div>
            <div><b>Address:</b> ${student.address || ""}</div>
            <div><b>Mobile:</b> ${student.phone || ""}</div>
            <div><b>Parent:</b> ${student.parentName || ""}</div>
          </div>
        </div>
      </div>
      <div class="panel" style="margin-bottom:12px;">
        <h3 style="margin-bottom:8px;">Documents (Optional)</h3>
        <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;">
          <div style="border:1px solid rgba(148,163,184,0.25);border-radius:10px;padding:10px;">
            <b>Aadhar</b>
            <div style="color:#64748b;margin-top:6px;">${student.aadhar ? `<img src="${student.aadhar}" alt="Aadhar" style="width:100%;max-width:160px;border-radius:10px;" />` : "Not uploaded"}</div>
          </div>
          <div style="border:1px solid rgba(148,163,184,0.25);border-radius:10px;padding:10px;">
            <b>TC</b>
            <div style="color:#64748b;margin-top:6px;">${student.tc ? `<img src="${student.tc}" alt="TC" style="width:100%;max-width:160px;border-radius:10px;" />` : "Not uploaded"}</div>
          </div>
          <div style="border:1px solid rgba(148,163,184,0.25);border-radius:10px;padding:10px;grid-column:1 / -1;">
            <b>Report Card</b>
            <div style="color:#64748b;margin-top:6px;">${student.reportCard ? `<img src="${student.reportCard}" alt="Report Card" style="width:100%;max-width:320px;border-radius:10px;" />` : "Not uploaded"}</div>
          </div>
        </div>
      </div>
      <div class="panel" style="margin-bottom:12px;">
        <h3 style="margin-bottom:8px;">Actions</h3>
        <div class="student-actions">
          <button type="button" class="action-btn" data-profile-action="edit">Edit Student</button>
          <button type="button" class="action-btn" data-profile-action="fees">Add Fee</button>
          <button type="button" class="action-btn" data-profile-action="exams">Add Marks</button>
          <button type="button" class="action-btn" data-profile-action="attendance">Mark Attendance</button>
          <button type="button" class="action-btn" data-profile-action="print">Print Report</button>
        </div>
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
      <div class="panel" style="margin-bottom:12px;">
        <h3 style="margin-bottom:8px;">Academic / Exams Summary</h3>
        <div><b>Total Obtained:</b> ${totalObtained}</div>
        <div><b>Total Max:</b> ${totalMax}</div>
        <div><b>Percentage:</b> ${pct}%</div>
        <div><b>Result:</b> ${resultStatus}</div>
      </div>
      ${examCards || `<div class="muted">No exam records found.</div>`}
    `;
    return;
  }

  if (activeStudentProfileTab === "fees") {
    const store = getStore();
    const fees = (store.fees || []).filter((f) => f.studentName === student.fullName);
    const totalFee = fees.reduce((sum, f) => sum + asNum(f.totalFee), 0);
    const paidAmount = fees.reduce((sum, f) => sum + asNum(f.paidAmount), 0);
    const dueAmount = fees.reduce((sum, f) => sum + asNum(f.balance), 0);

    const history = fees
      .slice()
      .sort((a, b) => String(b.term).localeCompare(String(a.term)))
      .map((f) => `
        <div style="padding:10px;border:1px solid rgba(148,163,184,0.25);border-radius:10px;margin-bottom:10px;">
          <div style="display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;">
            <b>Term:</b> ${f.term || ""} <span class="badge" style="background:#e0e7ff;color:#3730a3;">${f.status || ""}</span>
          </div>
          <div style="margin-top:8px;"><b>Total Fee:</b> ${f.totalFee || ""}</div>
          <div><b>Paid:</b> ${f.paidAmount || ""} | <b>Due:</b> ${f.balance || ""}</div>
          <div style="color:#64748b;margin-top:4px;">
            <b>Payment Date:</b> ${f.paymentDate || "-"} • <b>Method:</b> ${f.paymentMethod || "-"}
          </div>
        </div>
      `).join("");

    refs.studentProfileContent.innerHTML = `
      <div class="panel" style="margin-bottom:12px;">
        <h3 style="margin-bottom:8px;">Fee Details</h3>
        <div><b>Total Fees:</b> ${totalFee}</div>
        <div><b>Paid Amount:</b> ${paidAmount}</div>
        <div><b>Due Amount:</b> ${dueAmount}</div>
      </div>
      ${history || `<div class="muted">No fee records found.</div>`}
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
      <div class="panel" style="margin-bottom:12px;">
        <h3 style="margin-bottom:8px;">Attendance</h3>
        <div><b>Total Days:</b> ${totalDays}</div>
        <div><b>Present:</b> ${presentUnique.length}</div>
        <div><b>Absent:</b> ${absentUnique.length}</div>
        <div><b>Attendance %:</b> ${pct}%</div>
      </div>
      ${monthRows || `<div class="muted">No attendance records found.</div>`}
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
      if (["photo", "aadhar", "tc", "reportCard"].includes(name)) return; // can't set file inputs
      if (el.tagName === "SELECT") el.value = student[name] ?? el.value;
      else el.value = student[name] ?? "";
    });
  }
  // Put focus to first form input for convenience.
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
    const blocks = fees
      .slice()
      .sort((a, b) => String(b.term).localeCompare(String(a.term)))
      .map((f) => `
        <div class="box">
          <h2>Term: ${f.term || ""}</h2>
          <div class="row"><b>Total:</b> ${f.totalFee || ""}</div>
          <div class="row"><b>Paid:</b> ${f.paidAmount || ""}</div>
          <div class="row"><b>Due:</b> ${f.balance || ""}</div>
          <div class="row" style="color:#64748b;"><b>Date:</b> ${f.paymentDate || "-"} • <b>Method:</b> ${f.paymentMethod || "-"}</div>
        </div>
      `)
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
  await api(`/api/modules/${moduleName}/${id}`, { method: "DELETE" });
  await loadStore();
}

function getDashboardStats(store) {
  return {
    "Total Students": (store.students || []).length,
    "Total Teachers": (store.teachers || []).length,
    "Total Classes": (store.classes || []).length,
    "Student Present Today": (store.attendance || []).filter(x => String(x.status).toLowerCase() === "present").length,
    "Teacher Present Today": (store.teacherAttendance || []).filter(x => String(x.status).toLowerCase() === "present").length,
    "Pending Fee Accounts": (store.fees || []).filter(x => String(x.status).toLowerCase() !== "paid").length,
    "Books Issued": (store.library || []).filter(x => String(x.status).toLowerCase() === "issued").length,
    "Hostel Active": (store.hostel || []).filter(x => String(x.status).toLowerCase() === "active").length,
    "System Active Users": (store.users || []).filter(x => String(x.status).toLowerCase() === "active").length
  };
}

function renderStatsCards() {
  refs.statsCards.innerHTML = "";

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
      "System Active Users": "🛡️"
    };

    const icon = statIcons[k] || "⭐";
    const trend = v > 0 ? { arrow: "↑", text: "+5%" } : { arrow: "↓", text: "-2%" };

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
    refs.statsCards.appendChild(card);
  });
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
  const students = store.students || [];

  const sel = refs.faceEnrollStudentSelect;
  const current = sel.value;
  sel.innerHTML = "";

  const empty = document.createElement("option");
  empty.value = "";
  empty.textContent = "Select student...";
  sel.appendChild(empty);

  students.forEach((s) => {
    const opt = document.createElement("option");
    opt.value = s.fullName;
    opt.textContent = `${s.fullName}${s.rollNo ? ` (${s.rollNo})` : ""}${s.className ? ` - ${s.className}` : ""}`;
    sel.appendChild(opt);
  });

  // Keep selection if still valid; otherwise select first real student.
  if (current && students.some((s) => s.fullName === current)) {
    sel.value = current;
  } else if (students.length) {
    sel.value = students[0].fullName;
  }
}

function renderModuleTools() {
  refs.printDocBtn.disabled = !printableModules.has(currentModule);

  // Students and teachers don't get export CSV/PDF buttons for sensitive modules
  const canExport = userIsAdmin() || userIsStaffOrAbove() || String(currentUser?.role || "").toLowerCase() === "teacher";
  if (refs.exportCsvBtn) refs.exportCsvBtn.style.display = canExport ? "" : "none";
  if (refs.exportPdfBtn) refs.exportPdfBtn.style.display = canExport ? "" : "none";

  // Face panel only for users who can write attendance
  const showFacePanel = (currentModule === "attendance" || currentModule === "teacherAttendance" || currentModule === "students")
    && (userIsAdmin() || userIsStaffOrAbove() || String(currentUser?.role || "").toLowerCase() === "teacher");
  refs.facePanel.classList.toggle("hidden", !showFacePanel);

  if (!showFacePanel) return;

  const isEnrollMode = currentModule === "students";

  // Enable face enrollment mode in Students module.
  if (refs.faceTargetType) {
    refs.faceTargetType.value = "students";
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
    // Auto mode only makes sense in Attendance.
    if (refs.autoCaptureToggle) refs.autoCaptureToggle.checked = false;
    if (autoCaptureTimer) clearInterval(autoCaptureTimer);
    autoCaptureTimer = null;
    autoRecognitionStreak = 0;
    autoStreakKey = "";
    refs.faceStatusText.textContent = "Enroll mode: select a student and click Enroll Face.";
    populateEnrollStudentSelect();
  } else {
    refs.faceStatusText.textContent = "Open attendance module to use face recognition.";
  }
}

function renderAll() {
  renderNav();
  renderHeader();
  renderStatsCards();
  renderForm();
  renderTable();
  renderModuleTools();
}

function toCsv(rows, columns) {
  const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  return [columns.join(","), ...rows.map(r => columns.map(c => esc(r[c])).join(","))].join("\n");
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
  const columns = currentModule === "dashboard" ? ["Metric", "Value"] : moduleConfig[currentModule].columns;
  const csv = toCsv(rows, columns);
  downloadBlob(`${currentModule}-${todayStr()}.csv`, csv, "text/csv;charset=utf-8");
}

function exportCurrentPdf() {
  const rows = getCurrentList();
  if (!rows.length) return window.alert("No records to export.");
  const columns = currentModule === "dashboard" ? ["Metric", "Value"] : moduleConfig[currentModule].columns;
  const body = rows.map(row => columns.map(c => row[c] ?? ""));
  const doc = new window.jspdf.jsPDF();
  doc.text(`${moduleConfig[currentModule].title} Report`, 14, 14);
  doc.autoTable({ head: [columns.map(toLabel)], body, startY: 22 });
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
            <td style="padding:5px 0;">${f.paymentMethod || "-"}</td>
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
  let html = `<h1>${moduleConfig[currentModule].title}</h1>`;

  if (currentModule === "students") {
    const schoolName = "Tapowan Public School";
    const templateFile = "tapowan-id-template.png";

    const escapeHtml = (v) => String(v ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

    const truncate = (v, maxLen) => {
      const s = String(v ?? "");
      if (s.length <= maxLen) return s;
      return s.slice(0, Math.max(0, maxLen - 1)) + "…";
    };

    html = `
      <div class="id-header">
        <h1>${escapeHtml(schoolName)}</h1>
        <p>AI template ID Cards (Generated)</p>
      </div>
      <div class="t-grid">
        ${(store.students || []).map((s) => {
          const cardNo = s.admissionNo ? `TPS-${s.admissionNo}` : `TPS-${s.id}`;
          const studentName = truncate(s.fullName, 22);
          const fatherName = truncate(s.parentName, 26);
          const rollNo = truncate(s.rollNo, 16);
          const dob = truncate(s.dob, 16);
          const address = truncate(s.address, 30);
          const phone = truncate(s.phone, 15);

          const photoHtml = s.photo
            ? `<div class="t-photo"><img src="${s.photo}" alt="Student photo" /></div>`
            : `<div class="t-photo"><div style="font-size:12px;color:#0f172a;text-align:center;padding:8px;font-weight:600;">No<br/>Photo</div></div>`;

          return `
            <div class="t-card">
              <img class="t-bg" src="${API_BASE_URL}/templates/${templateFile}" alt="ID card template" />

              ${photoHtml}

              <div class="t-overlay">
                <!-- Cover template text zones -->
                <div class="t-cover" style="left:60px; top:55px; width:290px; height:44px; border-radius:16px; background:rgba(255,255,255,0.62);"></div>
                <div class="t-cover" style="left:40px; top:235px; width:340px; height:72px; border-radius:18px; background:rgba(255,255,255,0.60);"></div>
                <div class="t-cover" style="left:40px; top:315px; width:340px; height:150px; border-radius:18px; background:rgba(0,102,255,0.18);"></div>
                <div class="t-cover" style="left:40px; top:470px; width:230px; height:90px; border-radius:18px; background:rgba(0,102,255,0.22);"></div>

                <!-- Student name -->
                <div class="t-text fitbox" data-max="36" style="left:55px; top:240px; width:310px; height:62px; line-height:1.0; font-weight:900; font-size:32px; color:#FFD400; text-shadow:0 2px 3px rgba(0,0,0,0.35); background:rgba(0,0,0,0.18); padding:4px 10px; border-radius:16px; box-sizing:border-box;">
                  ${escapeHtml(studentName).toUpperCase()}
                </div>

                <!-- Father name -->
                <div class="t-text fitbox" data-max="18" style="left:55px; top:318px; width:340px; height:28px; line-height:1.1; font-size:16px; font-weight:800; color:#ffffff; background:rgba(13,110,253,0.55); padding:4px 10px; border-radius:12px; box-sizing:border-box;">
                  Father Name - ${escapeHtml(fatherName)}
                </div>

                <!-- Roll no -->
                <div class="t-text fitbox" data-max="18" style="left:55px; top:352px; width:240px; height:22px; line-height:1.1; font-size:14px; font-weight:900; color:#ffffff; background:rgba(13,110,253,0.55); padding:4px 10px; border-radius:12px; box-sizing:border-box;">
                  Roll No - ${escapeHtml(rollNo)}
                </div>

                <!-- DOB -->
                <div class="t-text fitbox" data-max="18" style="left:55px; top:378px; width:240px; height:22px; line-height:1.1; font-size:14px; font-weight:900; color:#ffffff; background:rgba(13,110,253,0.55); padding:4px 10px; border-radius:12px; box-sizing:border-box;">
                  D.O.B - ${escapeHtml(dob)}
                </div>

                <!-- Address -->
                <div class="t-text fitbox" data-max="16" style="left:55px; top:404px; width:330px; height:22px; line-height:1.1; font-size:13px; font-weight:900; color:#ffffff; background:rgba(13,110,253,0.55); padding:4px 10px; border-radius:12px; box-sizing:border-box;">
                  Address - ${escapeHtml(address)}
                </div>

                <!-- Phone -->
                <div class="t-text fitbox" data-max="18" style="left:55px; top:478px; width:290px; height:34px; line-height:1.0; font-size:20px; font-weight:900; color:#ffffff; background:rgba(225,29,72,0.9); padding:6px 10px; border-radius:14px; box-sizing:border-box;">
                  ${escapeHtml(phone)}
                </div>

                <!-- School name overlay -->
                <div class="t-text fitbox" data-max="22" style="left:65px; top:56px; width:290px; height:44px; line-height:1.0; font-size:22px; font-weight:900; color:#0B3BFF; background:rgba(255,255,255,0.65); padding:6px 10px; border-radius:14px; box-sizing:border-box;">
                  ${escapeHtml(schoolName)}
                </div>

                <!-- Card no (small) -->
                <div class="t-text fitbox" data-max="14" style="left:280px; top:515px; width:120px; height:22px; line-height:1.1; font-size:12px; font-weight:900; color:#0F172A; opacity:0.95; background:rgba(255,255,255,0.65); padding:4px 8px; border-radius:12px; box-sizing:border-box;">
                  ${escapeHtml(cardNo)}
                </div>
              </div>

              <style>
                /* Position photo for each card separately (keeps template untouched). */
                .t-card .t-photo{left:105px; top:115px; width:210px; height:210px;}
              </style>
            </div>
          `;
        }).join("")}
      </div>
    `;
  } else if (currentModule === "exams") {
    html += (store.exams || []).slice(0, 5).map(r => `<div class="box"><h2>Report Card</h2>
      <div class="row"><strong>Student:</strong> ${r.studentName}</div>
      <div class="row"><strong>Exam:</strong> ${r.examName}</div>
      <div class="row"><strong>Subject:</strong> ${r.subject}</div>
      <div class="row"><strong>Marks:</strong> ${r.marksObtained}/${r.maxMarks} (${r.grade})</div></div>`).join("");
  } else if (currentModule === "fees") {
    const schoolName = "Tapowan Public School";
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
      return `<div class="box" style="page-break-inside:avoid;">
        <h2 style="color:#1e3a8a;margin-bottom:8px;">Fee Receipt &mdash; RCP-${f.id}</h2>
        <div class="row"><strong>Student:</strong> ${f.studentName || "-"}</div>
        <div class="row"><strong>Class:</strong> ${f.className || "-"} &nbsp;|&nbsp; <strong>Roll No:</strong> ${f.rollNo || "-"}</div>
        <div class="row"><strong>Term:</strong> ${f.term || "-"} &nbsp;|&nbsp; <strong>Payment Date:</strong> ${f.paymentDate || "-"}</div>
        <div class="row"><strong>Total Fee:</strong> ₹${totalFee.toLocaleString("en-IN")} &nbsp;|&nbsp; <strong>Paid:</strong> ₹${paidAmount.toLocaleString("en-IN")} &nbsp;|&nbsp; <strong>Balance:</strong> ₹${balance.toLocaleString("en-IN")}</div>
        <div class="row"><strong>Method:</strong> ${f.paymentMethod || "-"} &nbsp;|&nbsp; <strong>Status:</strong> <span style="color:${statusColor};font-weight:700;">${f.status || "Pending"}</span></div>
      </div>`;
    }).join("");
  }

  const w = window.open("", "_blank");
  if (!w) return window.alert("Popup blocked. Please allow popups for this site and try again.");
  w.document.write(buildPrintableHtml(moduleConfig[currentModule].title, html));
  w.document.close();
  w.focus();
  // Printing is triggered by the auto-fit script inside buildPrintableHtml.
}

async function ensureFaceModelsLoaded() {
  if (faceModelsReady || !window.faceapi) return faceModelsReady;
  try {
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(FACE_MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(FACE_MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(FACE_MODEL_URL)
    ]);
    faceModelsReady = true;
    refs.faceStatusText.textContent = "Face models loaded.";
  } catch (err) {
    refs.faceStatusText.textContent = `Face model load failed: ${err.message}`;
  }
  return faceModelsReady;
}

async function startCamera() {
  if (!navigator.mediaDevices?.getUserMedia) return window.alert("Camera API not available.");
  try {
    faceStream = await navigator.mediaDevices.getUserMedia({
      video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: "user" },
      audio: false
    });
    refs.faceVideo.srcObject = faceStream;
    refs.faceStatusText.textContent = "Camera started. Loading AI models…";
    // Pre-load models in background so recognition is instant
    ensureFaceModelsLoaded().then(() => {
      refs.faceStatusText.textContent = "✅ Ready — AI models loaded. Face will be detected automatically.";
      startBBoxOverlay();
    });
  } catch (err) {
    refs.faceStatusText.textContent = `Camera access failed: ${err.message}`;
  }
}

async function captureFace() {
  const ready = await ensureFaceModelsLoaded();
  if (!ready) return;
  if (!refs.faceVideo.srcObject) return window.alert("Start camera first.");
  refs.faceStatusText.textContent = "Detecting face…";
  const detection = await faceapi
    .detectSingleFace(refs.faceVideo, new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.4 }))
    .withFaceLandmarks()
    .withFaceDescriptor();
  if (!detection) {
    refs.faceStatusText.textContent = "❌ No face detected. Keep face centered in good lighting and try again.";
    return;
  }
  latestDescriptor = Array.from(detection.descriptor);
  const ctx = refs.faceCanvas.getContext("2d");
  refs.faceCanvas.width = refs.faceVideo.videoWidth || 640;
  refs.faceCanvas.height = refs.faceVideo.videoHeight || 480;
  ctx.drawImage(refs.faceVideo, 0, 0, refs.faceCanvas.width, refs.faceCanvas.height);
  // Draw bounding box on captured frame
  const box = detection.detection.box;
  ctx.strokeStyle = "#22c55e";
  ctx.lineWidth = 3;
  ctx.strokeRect(box.x, box.y, box.width, box.height);
  ctx.fillStyle = "rgba(34,197,94,0.15)";
  ctx.fillRect(box.x, box.y, box.width, box.height);
  refs.faceStatusText.textContent = "✅ Face captured! Click Mark Attendance or enroll.";
}

function cosineSimilarity(a, b) {
  let dot = 0; let na = 0; let nb = 0;
  for (let i = 0; i < a.length; i += 1) {
    dot += a[i] * b[i]; na += a[i] * a[i]; nb += b[i] * b[i];
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

function euclideanDistance(a, b) {
  let sum = 0;
  for (let i = 0; i < a.length; i++) sum += (a[i] - b[i]) ** 2;
  return Math.sqrt(sum);
}

function descriptorSimilarity(a, b) {
  // Combine cosine similarity and euclidean distance for better accuracy
  const cos = cosineSimilarity(a, b);
  const euc = euclideanDistance(a, b);
  // Euclidean distance for 128-d face vectors: <0.6 = same person typically
  const eucScore = Math.max(0, 1 - euc / 0.9);
  return (cos * 0.6) + (eucScore * 0.4);
}

function findBestFaceMatch(descriptor, targetType, minScore = 0.72) {
  const faceStore = getFaceStore();
  const scoped = Object.entries(faceStore).filter(([key]) => key.startsWith(`${targetType}|`));
  if (!scoped.length) return null;
  let best = null;
  scoped.forEach(([key, val]) => {
    // Support multiple descriptors per person (stored as descriptors array or single descriptor)
    const descriptors = val.descriptors || (val.descriptor ? [val.descriptor] : []);
    let topScore = 0;
    for (const d of descriptors) {
      const score = descriptorSimilarity(descriptor, d);
      if (score > topScore) topScore = score;
    }
    if (!best || topScore > best.score) best = { key, ...val, score: topScore };
  });
  return best && best.score >= minScore ? best : null;
}

function getTopFaceMatches(descriptor, targetType, limit = 3) {
  const faceStore = getFaceStore();
  const scoped = Object.entries(faceStore).filter(([key]) => key.startsWith(`${targetType}|`));
  const scored = scoped.map(([key, val]) => {
    const descriptors = val.descriptors || (val.descriptor ? [val.descriptor] : []);
    let topScore = 0;
    for (const d of descriptors) {
      const s = descriptorSimilarity(descriptor, d);
      if (s > topScore) topScore = s;
    }
    return { key, name: val.name, tag: val.tag, score: topScore };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit);
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
  if (targetType === "students") {
    const student = (store.students || []).find((s) => s.fullName === recognizedName);
    // Guard: if the student was deleted from DB, refuse to mark attendance
    if (!student) {
      refs.faceStatusText.textContent = `⚠ Student "${recognizedName}" not found in database (may have been deleted). Attendance not marked.`;
      if (typeof showToast === "function") showToast(`⚠ Student "${recognizedName}" not found in database`, "error");
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
    currentModule = "attendance";
  } else {
    const resolvedDept = classDept || best?.tag || "N/A";
    const row = { id: getNextId(store.teacherAttendance || []), date: todayStr(), department: resolvedDept, teacherName: recognizedName, status, remarks: "Face-recognized" };
    await api("/api/modules/teacherAttendance", { method: "POST", body: JSON.stringify(row) });
    currentModule = "teacherAttendance";
  }
  await loadStore();
  const successMsg = `✅ Attendance marked for ${recognizedName}.`;
  refs.faceStatusText.textContent = successMsg;
  if (typeof showToast === 'function') showToast(successMsg, 'success');
  if (typeof addLiveLog === 'function') addLiveLog(recognizedName, best?.score || 0.9, status);
  renderAll();
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

async function autoCaptureTick() {
  if (!refs.autoCaptureToggle.checked) return;
  if (autoCaptureBusy) return;
  if (!refs.faceVideo?.srcObject) return;

  try {
    const ready = await ensureFaceModelsLoaded();
    if (!ready) return;

    const targetType = refs.faceTargetType.value;
    if (targetType !== "students") return; // auto mode currently supports student attendance

    if (refs.autoBatchMultiFaceToggle?.checked) {
      await autoBatchCaptureTick();
      return;
    }

    const minConf = Math.max(0.4, Math.min(0.99, Number(refs.autoMinConfidence?.value) || 0.72));
    const stableCount = Math.max(1, Math.min(10, Number(refs.autoStableCount?.value) || 2));

    // Recognize the face from the current camera frame.
    const detection = await faceapi
      .detectSingleFace(refs.faceVideo, new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.35 }))
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!detection) return;

    const descriptor = Array.from(detection.descriptor);
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
    const student = (store.students || []).find((s) => s.fullName === recognizedName);
    // Guard: if the student was deleted from DB, skip and warn
    if (!student) {
      refs.faceStatusText.innerHTML = `⚠ Matched face: <b>${recognizedName}</b> — but student was deleted from database. Attendance not marked.`;
      return;
    }
    const resolvedClassName = manualClass || best.tag || student?.className || "N/A";

    // If teacher/operator entered a class, be strict: require it to match enrollment tag or student class.
    if (manualClass) {
      const enrolledClass = best.tag || student?.className || "";
      if (String(enrolledClass) !== String(manualClass)) {
        const _classMismatchKey = `${recognizedName}|${resolvedClassName}|${today}`;
        autoRecognitionStreakByKey[_classMismatchKey] = 0;
        refs.faceStatusText.innerHTML = `⚠ AI: Face found but class mismatch<br/>Matched: ${recognizedName} (${(best.score*100).toFixed(0)}%)<br/>Expected: ${enrolledClass || "N/A"} | Entered: ${manualClass}`;
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
    const snap = videoFrameToResizedDataUrl(refs.faceVideo, 220, 0.68);
    const existing = findExistingAttendanceRecord(store, recognizedName, resolvedClassName, today);
    const nowTime = timeStr();

    // Update existing record photo if already marked.
    if (existing?.id) {
      const update = { facePhoto: snap, remarks: "Auto face-recognized" };
      if (!existing.arrivalTime) {
        update.arrivalTime = nowTime;
        update.status = refs.faceStatus.value; // arrival status
      } else if (!existing.departureTime) {
        update.departureTime = nowTime; // keep arrival status
      }
      await api(`/api/modules/attendance/${existing.id}`, {
        method: "PUT",
        body: JSON.stringify(update)
      });
      await loadStore();
      refs.faceStatusText.textContent = `Photo updated for ${recognizedName} (${resolvedClassName}).`;
      renderTable();
    } else {
      const row = {
        id: getNextId(store.attendance || []),
        date: today,
        className: resolvedClassName,
        studentName: recognizedName,
        rollNo: student?.rollNo || "",
        status: refs.faceStatus.value,
        arrivalTime: nowTime,
        departureTime: "",
        remarks: "Auto face-recognized",
        facePhoto: snap
      };

      await api("/api/modules/attendance", { method: "POST", body: JSON.stringify(row) });
      await loadStore();
      refs.faceStatusText.textContent = `Auto attendance marked for ${recognizedName}.`;
      renderTable();
    }

    autoLastAutoMarkKey = matchKey;
    autoLastAutoMarkAt = now;
    autoRecognitionStreak = 0;
    autoStreakKey = "";
    autoRecognitionStreakByKey[matchKey] = 0;
    showToast(`✅ Attendance marked: ${recognizedName}`);
  } catch (err) {
    refs.faceStatusText.textContent = `Auto mode error: ${err.message}`;
  } finally {
    autoCaptureBusy = false;
  }
}

async function autoBatchCaptureTick() {
  if (autoCaptureBusy) return;
  autoCaptureBusy = true;

  const minConf = Math.max(0.4, Math.min(0.99, Number(refs.autoMinConfidence?.value) || 0.72));
  const cooldownMs = 6000; // avoid repeated updates while same faces remain in frame
  const margin = 0.02; // bestScore - secondBestScore must be >= margin (lowered for speed)
  const maxMarksPerTick = 50;

  try {
    const detections = await faceapi
      .detectAllFaces(refs.faceVideo, new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.35 }))
      .withFaceLandmarks()
      .withFaceDescriptors();

    if (!detections || !detections.length) {
      refs.faceStatusText.textContent = "AI Batch: No faces found";
      return;
    }

    const store = getStore();
    const today = todayStr();
    const now = Date.now();
    const nowTime = timeStr();

    // Keep a local mutable copy to avoid repeatedly calling loadStore() inside the loop.
    const localAttendance = (store.attendance || []).slice();
    let nextId = getNextId(localAttendance);
    const localStore = { ...store, attendance: localAttendance };

    // Avoid marking same student twice in one frame.
    const markedThisFrame = new Set();
    const marked = [];
    const skippedLowConf = [];

    const manualClass = String(refs.faceClassName?.value || "").trim();
    const status = refs.faceStatus?.value || "Present";

    for (const det of detections) {
      if (marked.length >= maxMarksPerTick) break;

      const descriptor = Array.from(det.descriptor);
      const topMatches = getTopFaceMatches(descriptor, "students", 3);
      const best = findBestFaceMatch(descriptor, "students", minConf);
      const recognizedName = best?.name;
      if (!recognizedName || !best) continue;

      const secondBestScore = topMatches[1]?.score ?? 0;
      if (best.score - secondBestScore < margin) {
        skippedLowConf.push(recognizedName);
        continue;
      }

      const student = (store.students || []).find((s) => s.fullName === recognizedName);
      // Guard: skip deleted students — don't mark attendance for removed DB records
      if (!student) {
        skippedLowConf.push(`${recognizedName} (deleted)`);
        continue;
      }
      const resolvedClassName = manualClass || best.tag || student?.className || "N/A";

      // Strict class match if operator entered one.
      if (manualClass && String(best.tag || student?.className || "") !== manualClass) continue;

      const matchKey = `${recognizedName}|${resolvedClassName}|${today}`;
      if (markedThisFrame.has(matchKey)) continue;
      markedThisFrame.add(matchKey);

      const lastAt = autoLastAutoMarkAtByKey[matchKey] || 0;
      if (now - lastAt < cooldownMs) continue;

      const existing = findExistingAttendanceRecord(localStore, recognizedName, resolvedClassName, today);
      const snap = videoFrameToResizedDataUrl(refs.faceVideo, 220, 0.68);

      if (existing?.id) {
        const update = { facePhoto: snap, remarks: "Auto face-recognized" };
        if (!existing.arrivalTime) {
          update.arrivalTime = nowTime;
          update.status = status; // arrival status
        } else if (!existing.departureTime) {
          update.departureTime = nowTime; // keep arrival status
        }
        await api(`/api/modules/attendance/${existing.id}`, {
          method: "PUT",
          body: JSON.stringify(update)
        });
        existing.facePhoto = snap;
        existing.remarks = update.remarks;
        if (update.arrivalTime) existing.arrivalTime = update.arrivalTime;
        if (update.departureTime) existing.departureTime = update.departureTime;
        if (update.status) existing.status = update.status;
        await loadStore();
        renderTable();
      } else {
        const row = {
          id: nextId++,
          date: today,
          className: resolvedClassName,
          studentName: recognizedName,
          rollNo: student?.rollNo || "",
          status,
          arrivalTime: nowTime,
          departureTime: "",
          remarks: "Auto face-recognized",
          facePhoto: snap
        };
        await api("/api/modules/attendance", { method: "POST", body: JSON.stringify(row) });
        localAttendance.push(row);
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
  const form = new FormData(e.target);
  const payload = {};
  const isEditingStudent = currentModule === "students" && editStudentId != null;

  // Special handling for student files (file -> resized base64 string).
  for (const field of moduleConfig[currentModule].fields) {
    if (currentModule === "students" && ["photo", "aadhar", "tc", "reportCard"].includes(field)) {
      const file = form.get(field);
      if (file && file.size > 0) {
        const maxDim = field === "photo" ? 240 : 360;
        payload[field] = await fileToResizedDataUrl(file, maxDim, 0.85);
      } else if (!isEditingStudent) {
        // For edit mode, don't overwrite existing file data unless user selects a new file.
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
    const checkedRadio = monthlyFeeContainer?.querySelector("input[name=\"bd-monthly-fee-radio\"]:checked");
    const monthlyFee = parseFloat(checkedRadio?.value || 0) || 0;
    payload.monthlyFee = String(monthlyFee);

    // Save the fee type label from the selected radio's data-label
    payload.monthlyFeeLabel = checkedRadio && monthlyFee > 0
      ? (checkedRadio.dataset.label || "Monthly School Fee")
      : "";

    // Collect selected book/dress items from checkboxes
    const selectedItems = [];
    formEl.querySelectorAll(".bd-item-checkbox:checked").forEach(cb => {
      selectedItems.push({ id: cb.dataset.id, price: parseFloat(cb.dataset.price || 0) || 0 });
    });
    payload.selectedBookIds = JSON.stringify(selectedItems.map(i => i.id));

    // Ensure totalFee and balance are correctly set from auto-calc
    const totalFeeInput = formEl.querySelector("[name='totalFee']");
    const balanceInput  = formEl.querySelector("[name='balance']");
    if (totalFeeInput) payload.totalFee = totalFeeInput.value || "0";
    if (balanceInput)  payload.balance  = balanceInput.value  || "0";

    // Fix status based on recalculated values
    const total = parseFloat(payload.totalFee) || 0;
    const paid  = parseFloat(payload.paidAmount) || 0;
    const bal   = total - paid;
    payload.balance = String(Math.max(0, bal));
    payload.status  = bal <= 0 ? "Paid" : paid > 0 ? "Partial" : "Pending";
  }

  if (isEditingStudent) {
    await api(`/api/modules/students/${editStudentId}`, { method: "PUT", body: JSON.stringify(payload) });
    editStudentId = null;
    await loadStore(); // refresh store so the table shows the updated student record
  } else {
    await addRecord(currentModule, payload);
  }
  e.target.reset();
  // Clear monthly fee radio checkboxes and bd info panel after submit
  const bdMonthly = document.getElementById("bd-monthly-fee-input");
  if (bdMonthly) {
    bdMonthly.querySelectorAll("input[type=radio]").forEach(r => r.checked = false);
    bdMonthly.querySelectorAll("label").forEach(l => l.style.background = "#fff");
    delete bdMonthly.dataset.selectedValue;
  }
  const bdInfo = document.getElementById("bd-fee-info");
  if (bdInfo) bdInfo.innerHTML = "";
  renderAll();
});

refs.searchInput.addEventListener("input", renderTable);
refs.exportCsvBtn.addEventListener("click", exportCurrentCsv);
refs.exportPdfBtn.addEventListener("click", exportCurrentPdf);
refs.printDocBtn.addEventListener("click", printDocumentByModule);

refs.loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = new FormData(e.target);
  try {
    const user = await login(String(form.get("username")).trim(), String(form.get("password")).trim());
    applyAuthUI(user);
    refs.authSubtitle.textContent = "Sign in to continue";
    await loadStore();
    await syncFaceEmbeddingsFromServer();
    renderAll();
  } catch (err) {
    const msg = String(err?.message || "Login failed");
    refs.authSubtitle.textContent = msg;
    window.alert(msg);
  }
});

refs.signupForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = new FormData(e.target);
  try {
    const user = await signup({
      fullName: String(form.get("fullName")).trim(),
      username: String(form.get("username")).trim(),
      email: String(form.get("email")).trim(),
      password: String(form.get("password"))
    });
    applyAuthUI(user);
    await loadStore();
    renderAll();
  } catch (err) {
    window.alert(err.message);
  }
});

refs.showLoginBtn.addEventListener("click", () => setAuthMode("login"));
refs.showSignupBtn.addEventListener("click", () => setAuthMode("signup"));

refs.mobileMenuBtn?.addEventListener("click", () => {
  const opening = !refs.sidebar?.classList.contains("mobile-open");
  setMobileSidebarOpen(opening);
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

refs.startCameraBtn.addEventListener("click", startCamera);
refs.captureFaceBtn.addEventListener("click", captureFace);
refs.markFaceAttendanceBtn.addEventListener("click", () => markFaceAttendance().catch((e) => window.alert(e.message)));

refs.enrollFaceBtn?.addEventListener("click", async () => {
  try {
    const selectedName = refs.faceEnrollStudentSelect?.value;
    if (!selectedName) return window.alert("Select a student first.");

    const store = getStore();
    const student = (store.students || []).find((s) => s.fullName === selectedName);

    // Ensure camera stream exists.
    if (!refs.faceVideo?.srcObject) await startCamera();

    // Capture current face embedding.
    await captureFace();
    if (!latestDescriptor) return window.alert("Could not capture face. Try again.");

    // Store embedding in localStorage (fast local lookup)
    const faceStore = getFaceStore();
    const key = `students|${selectedName}`;
    faceStore[key] = { descriptor: latestDescriptor, name: selectedName, tag: student?.className || "" };
    saveFaceStore(faceStore);

    // Also persist to server DB so enrollments survive browser clears
    try {
      await api("/api/modules/faceEmbeddings", {
        method: "POST",
        body: JSON.stringify({
          targetType: "students",
          name: selectedName,
          tag: student?.className || "",
          descriptorJson: JSON.stringify(latestDescriptor)
        })
      });
    } catch (e) {
      console.warn("Could not persist face embedding to server:", e.message);
    }

    // Optional: keep inputs in sync (useful if you switch to Attendance module).
    if (refs.faceTargetName) refs.faceTargetName.value = selectedName;
    if (refs.faceClassName) refs.faceClassName.value = student?.className || "";

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
  // Auto mode should run on student attendance.
  currentModule = "attendance";
  refs.faceTargetType.value = "students";
  refs.faceStatusText.textContent = "Auto mode enabled. Make sure faces are enrolled first (use Capture Face).";
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

refs.assistantSendBtn?.addEventListener("click", () => {
  const txt = refs.assistantInput.value.trim();
  if (!txt) return;
  refs.assistantInput.value = "";
  assistantAppend(`You asked: ${txt}\n\n${assistantRespond(txt)}`);
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
  dashboard: '📊', students: '🎓', teachers: '👩‍🏫', classes: '🏛️',
  subjects: '📚', attendance: '📅', teacherAttendance: '👨‍💼',
  exams: '📝', fees: '💳', library: '📖', transport: '🚌',
  hostel: '🏠', payroll: '💰', users: '🔐', timetable: '🗓️'
};

const NAV_GROUPS = {
  'Core': ['dashboard', 'students', 'teachers', 'classes'],
  'Academic': ['subjects', 'exams', 'timetable'],
  'Daily': ['attendance', 'teacherAttendance'],
  'Finance': ['fees', 'payroll'],
  'Resources': ['library', 'transport', 'hostel', 'users']
};

// Patch renderNav to use icons + groups
const _origRenderNav = typeof renderNav === 'function' ? renderNav : null;

function renderNavEnhanced() {
  const nav = document.getElementById('moduleNav');
  if (!nav) return;
  nav.innerHTML = '';

  // Respect role-based visibility — same logic as original renderNav
  const visible = new Set(typeof getVisibleModules === 'function' ? getVisibleModules() : Object.keys(moduleConfig));

  for (const [groupName, modules] of Object.entries(NAV_GROUPS)) {
    // Only render the group label if at least one module in it is visible
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
      btn.innerHTML = `<span class="nav-icon">${MODULE_ICONS[mod] || '📌'}</span><span>${moduleConfig[mod].title}</span>`;
      btn.addEventListener('click', () => {
        currentModule = mod;
        renderAll();
        if (window.isMobileLayout && isMobileLayout()) setMobileSidebarOpen(false);
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

// === ENHANCED ID CARD GENERATOR (no backend template needed) ===
function generateIdCardsHTML(store) {
  const students = store.students || [];
  if (!students.length) return '<p style="padding:32px;text-align:center;color:#64748b;">No students found. Add students first.</p>';

  const schoolName = 'Tapowan Public School';
  const cards = students.map(s => {
    const initials = (s.fullName || 'ST').split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase();
    const photoHtml = s.photo
      ? `<img src="${s.photo}" alt="Photo" style="width:100%;height:100%;object-fit:cover;border-radius:10px;" />`
      : `<div style="width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;background:linear-gradient(135deg,#1a4fcf,#4f83f1);border-radius:10px;color:#fff;font-size:2rem;font-weight:800;">${initials}</div>`;

    const cardId = s.admissionNo ? `TPS-${s.admissionNo}` : `TPS-${s.id || '000'}`;
    const { classPart, sectionPart } = splitClassName(s.className || '');
    const classDisplay = sectionPart ? `${classPart} - ${sectionPart}` : classPart;

    return `
      <div style="
        width:340px; min-height:200px;
        background:linear-gradient(135deg,#0b1437 0%,#1a3a7c 50%,#0b1437 100%);
        border-radius:16px; overflow:hidden; position:relative;
        box-shadow:0 8px 32px rgba(0,0,0,0.35); page-break-inside:avoid;
        border:1px solid rgba(255,255,255,0.1); display:flex; flex-direction:column;
      ">
        <!-- Header -->
        <div style="background:linear-gradient(90deg,#1a4fcf,#4f83f1);padding:12px 16px;display:flex;align-items:center;gap:10px;">
          <div style="font-size:1.4rem;">🏫</div>
          <div>
            <div style="color:#fff;font-weight:800;font-size:0.9rem;letter-spacing:0.02em;">${escapeHtml(schoolName)}</div>
            <div style="color:rgba(255,255,255,0.7);font-size:0.65rem;letter-spacing:0.08em;text-transform:uppercase;">Student Identity Card</div>
          </div>
          <div style="margin-left:auto;background:rgba(255,255,255,0.15);color:#fff;padding:3px 8px;border-radius:6px;font-size:0.62rem;font-weight:700;">${escapeHtml(cardId)}</div>
        </div>
        <!-- Body -->
        <div style="padding:14px 16px;display:flex;gap:14px;align-items:flex-start;flex:1;">
          <!-- Photo -->
          <div style="width:80px;height:95px;flex-shrink:0;border-radius:10px;overflow:hidden;border:2px solid rgba(255,255,255,0.2);">
            ${photoHtml}
          </div>
          <!-- Info -->
          <div style="flex:1;color:#fff;">
            <div style="font-size:1rem;font-weight:800;color:#fff;margin-bottom:6px;line-height:1.2;">${escapeHtml(s.fullName || 'Student')}</div>
            <div style="display:grid;grid-template-columns:auto 1fr;gap:2px 8px;font-size:0.72rem;">
              <span style="color:rgba(255,255,255,0.5);">Class:</span><span style="color:#93c5fd;font-weight:600;">${escapeHtml(classDisplay || 'N/A')}</span>
              <span style="color:rgba(255,255,255,0.5);">Roll No:</span><span style="color:#93c5fd;font-weight:600;">${escapeHtml(s.rollNo || 'N/A')}</span>
              <span style="color:rgba(255,255,255,0.5);">DOB:</span><span style="color:rgba(255,255,255,0.8);">${escapeHtml(s.dob || 'N/A')}</span>
              <span style="color:rgba(255,255,255,0.5);">Father:</span><span style="color:rgba(255,255,255,0.8);">${escapeHtml(s.parentName || 'N/A')}</span>
              <span style="color:rgba(255,255,255,0.5);">Phone:</span><span style="color:rgba(255,255,255,0.8);">${escapeHtml(s.phone || 'N/A')}</span>
            </div>
          </div>
        </div>
        <!-- Footer -->
        <div style="background:rgba(0,0,0,0.3);padding:8px 16px;display:flex;align-items:center;justify-content:space-between;font-size:0.65rem;color:rgba(255,255,255,0.4);">
          <span>Valid: 2024–25</span>
          <span style="color:rgba(255,255,255,0.2);">|</span>
          <span>If found, please return to school</span>
        </div>
      </div>
    `;
  }).join('');

  return `
    <div style="padding:32px;background:#f0f4ff;min-height:100vh;">
      <div style="text-align:center;margin-bottom:28px;">
        <h1 style="font-size:1.8rem;font-weight:800;color:#0b1437;">${schoolName}</h1>
        <p style="color:#64748b;margin-top:4px;">Student ID Cards — ${new Date().toLocaleDateString('en-IN',{year:'numeric',month:'long'})}</p>
      </div>
      <div style="display:flex;flex-wrap:wrap;gap:20px;justify-content:center;">
        ${cards}
      </div>
    </div>
  `;
}

// === INTERCEPT printDocumentByModule to use new ID card generator ===
// We patch the function after page load
document.addEventListener('DOMContentLoaded', () => {
  // small delay to let app.js finish setting up
  setTimeout(patchApp, 200);
});

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
        const html = generateIdCardsHTML(store);
        const w = window.open('', '_blank');
        if (!w) return window.alert('Popup blocked. Please allow popups.');
        w.document.write(`<!DOCTYPE html><html><head>
          <title>ID Cards — Tapowan Public School</title>
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap" rel="stylesheet">
          <style>
            body { font-family: 'Plus Jakarta Sans',sans-serif; margin:0; }
            @media print {
              body { background:#fff; }
              @page { margin: 10mm; }
            }
          </style>
        </head><body>${html}
          <script>window.onload = () => { setTimeout(() => window.print(), 600); }<\/script>
        </body></html>`);
        w.document.close();
        showToast('🖨 Opening ID cards for print…', 'info');
      } else {
        _origPrint();
      }
    };
  }
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

const AI_FACE_VERSION = 2;
const MULTI_SAMPLE_COUNT = 3;       // captures averaged per enrollment
const LIVENESS_MOTION_THRESHOLD = 8; // pixel diff required to confirm live face
const QUALITY_MIN_BOX_SIZE = 60;    // px — reject tiny detected boxes
const QUALITY_MIN_BRIGHTNESS = 35;  // 0-255 — reject too-dark frames
const ENSEMBLE_EUCLIDEAN_WEIGHT = 0.35; // blend cosine (65%) + euclidean (35%)

// State
let aiEnrollBuffer = [];      // accumulates descriptors during multi-sample enrollment
let aiEnrollTarget = null;    // { name, tag } during multi-sample mode
let aiEnrolling = false;
let aiLastFrame = null;       // ImageData for liveness delta
let aiLivenessOk = false;
let aiAdaptiveThreshold = {}; // per-name adaptive threshold adjustments
let aiBBoxAnimFrame = null;   // requestAnimationFrame handle for overlay

// ── Euclidean distance (normalised to 0-1 similarity) ──────────
function euclideanSimilarity(a, b) {
  let sum = 0;
  for (let i = 0; i < a.length; i++) sum += (a[i] - b[i]) ** 2;
  const dist = Math.sqrt(sum);
  // face-api 128-d descriptors: max dist ≈ 1.2, map to 0-1
  return Math.max(0, 1 - dist / 1.2);
}

// ── Ensemble score (cosine + euclidean blend) ───────────────────
function ensembleScore(a, b) {
  const cos  = cosineSimilarity(a, b);
  const euc  = euclideanSimilarity(a, b);
  return cos * (1 - ENSEMBLE_EUCLIDEAN_WEIGHT) + euc * ENSEMBLE_EUCLIDEAN_WEIGHT;
}

// ── Average multiple descriptors ───────────────────────────────
function averageDescriptors(descs) {
  if (!descs || !descs.length) return null;
  const len = descs[0].length;
  const avg = new Array(len).fill(0);
  descs.forEach(d => { for (let i = 0; i < len; i++) avg[i] += d[i]; });
  for (let i = 0; i < len; i++) avg[i] /= descs.length;
  return avg;
}

// ── Frame quality gate ──────────────────────────────────────────
function checkFrameQuality(video) {
  const c = document.createElement('canvas');
  c.width = 80; c.height = 60;
  const ctx = c.getContext('2d');
  ctx.drawImage(video, 0, 0, 80, 60);
  const data = ctx.getImageData(0, 0, 80, 60).data;
  let brightness = 0;
  for (let i = 0; i < data.length; i += 4)
    brightness += (data[i] * 0.299 + data[i+1] * 0.587 + data[i+2] * 0.114);
  brightness /= (data.length / 4);
  return { brightness, ok: brightness >= QUALITY_MIN_BRIGHTNESS };
}

// ── Liveness check (motion between frames) ─────────────────────
function checkLiveness(video) {
  const c = document.createElement('canvas');
  c.width = 40; c.height = 30;
  const ctx = c.getContext('2d');
  ctx.drawImage(video, 0, 0, 40, 30);
  const frame = ctx.getImageData(0, 0, 40, 30);

  if (!aiLastFrame) {
    aiLastFrame = frame;
    return false;
  }
  let diff = 0;
  for (let i = 0; i < frame.data.length; i += 4) {
    diff += Math.abs(frame.data[i] - aiLastFrame.data[i])
          + Math.abs(frame.data[i+1] - aiLastFrame.data[i+1])
          + Math.abs(frame.data[i+2] - aiLastFrame.data[i+2]);
  }
  diff /= (frame.data.length / 4);
  aiLastFrame = frame;
  return diff >= LIVENESS_MOTION_THRESHOLD;
}

// ── Improved findBestFaceMatch using ensemble score ─────────────
function findBestFaceMatchAI(descriptor, targetType, minScore) {
  const faceStore = getFaceStore();
  const scoped = Object.entries(faceStore).filter(([k]) => k.startsWith(targetType + '|'));
  if (!scoped.length) return null;

  let best = null;
  scoped.forEach(([key, val]) => {
    // support averaged multi-descriptor entries
    const stored = val.avgDescriptor || val.descriptor || [];
    if (!stored.length) return;
    const score = ensembleScore(descriptor, stored);

    // apply adaptive threshold offset (tightens if that person had false positives)
    const adj = aiAdaptiveThreshold[val.name] || 0;
    const effectiveMin = (minScore || 0.80) + adj;

    if (!best || score > best.score) best = { key, ...val, score, effectiveMin };
  });
  return best && best.score >= (best.effectiveMin || minScore || 0.80) ? best : null;
}

// ── Real-time bounding box + name overlay on canvas ────────────
async function startBBoxOverlay() {
  if (aiBBoxAnimFrame) cancelAnimationFrame(aiBBoxAnimFrame);
  const video  = refs.faceVideo;
  const canvas = refs.faceCanvas;
  if (!canvas || !video) return;

  const ctx = canvas.getContext('2d');

  async function drawFrame() {
    if (!video.srcObject || !faceModelsReady) {
      aiBBoxAnimFrame = requestAnimationFrame(drawFrame);
      return;
    }
    canvas.width  = video.videoWidth  || 640;
    canvas.height = video.videoHeight || 360;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    try {
      const detections = await faceapi
        .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.45 }))
        .withFaceLandmarks()
        .withFaceDescriptors();

      const targetType = refs.faceTargetType?.value || 'students';
      const minConf = parseFloat(refs.autoMinConfidence?.value || '0.82');

      detections.forEach(det => {
        const box = det.detection.box;
        if (box.width < QUALITY_MIN_BOX_SIZE) return;

        const desc = Array.from(det.descriptor);
        const match = findBestFaceMatchAI(desc, targetType, minConf);
        const score = match ? match.score : 0;
        const name  = match ? match.name  : 'Unknown';

        // Color: green=good, yellow=borderline, red=unknown
        const color = match
          ? (score >= 0.92 ? '#10b981' : score >= 0.84 ? '#f59e0b' : '#f97316')
          : '#ef4444';

        // Draw bounding box
        ctx.strokeStyle = color;
        ctx.lineWidth   = 2.5;
        ctx.strokeRect(box.x, box.y, box.width, box.height);

        // Corner accents
        const cLen = 14;
        ctx.lineWidth = 4;
        // top-left
        ctx.beginPath(); ctx.moveTo(box.x, box.y + cLen); ctx.lineTo(box.x, box.y); ctx.lineTo(box.x + cLen, box.y); ctx.stroke();
        // top-right
        ctx.beginPath(); ctx.moveTo(box.x + box.width - cLen, box.y); ctx.lineTo(box.x + box.width, box.y); ctx.lineTo(box.x + box.width, box.y + cLen); ctx.stroke();
        // bottom-left
        ctx.beginPath(); ctx.moveTo(box.x, box.y + box.height - cLen); ctx.lineTo(box.x, box.y + box.height); ctx.lineTo(box.x + cLen, box.y + box.height); ctx.stroke();
        // bottom-right
        ctx.beginPath(); ctx.moveTo(box.x + box.width - cLen, box.y + box.height); ctx.lineTo(box.x + box.width, box.y + box.height); ctx.lineTo(box.x + box.width, box.y + box.height - cLen); ctx.stroke();

        // Label background
        const label = match ? `${name}  ${(score * 100).toFixed(1)}%` : 'Unknown';
        ctx.font = 'bold 13px Plus Jakarta Sans, sans-serif';
        const tw = ctx.measureText(label).width + 16;
        const lx = box.x, ly = box.y > 28 ? box.y - 26 : box.y + box.height + 4;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.roundRect(lx, ly, tw, 22, 5);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.fillText(label, lx + 8, ly + 15);

        // Confidence bar below box
        const barY = box.y + box.height + (box.y > 28 ? 4 : 30);
        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.beginPath(); ctx.roundRect(box.x, barY, box.width, 5, 2); ctx.fill();
        ctx.fillStyle = color;
        ctx.beginPath(); ctx.roundRect(box.x, barY, box.width * score, 5, 2); ctx.fill();
      });
    } catch(_) {}

    aiBBoxAnimFrame = requestAnimationFrame(drawFrame);
  }
  drawFrame();
}

// Stop overlay
function stopBBoxOverlay() {
  if (aiBBoxAnimFrame) { cancelAnimationFrame(aiBBoxAnimFrame); aiBBoxAnimFrame = null; }
}

// ── Multi-sample enrollment UI ──────────────────────────────────
function startMultiSampleEnroll(name, tag) {
  aiEnrollBuffer = [];
  aiEnrollTarget = { name, tag };
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

  const { ok, brightness } = checkFrameQuality(refs.faceVideo);
  if (!ok) return showToast(`Frame too dark (brightness ${brightness.toFixed(0)}). Improve lighting.`, 'warning');

  const det = await faceapi
    .detectSingleFace(refs.faceVideo, new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.5 }))
    .withFaceLandmarks()
    .withFaceDescriptor();

  if (!det) return showToast('No face detected. Centre your face and retry.', 'warning');
  if (det.detection.box.width < QUALITY_MIN_BOX_SIZE)
    return showToast('Face too small. Move closer to the camera.', 'warning');

  aiEnrollBuffer.push(Array.from(det.descriptor));
  showToast(`Sample ${aiEnrollBuffer.length}/${MULTI_SAMPLE_COUNT} captured ✓`, 'success', 1800);
  updateEnrollUI();

  if (aiEnrollBuffer.length >= MULTI_SAMPLE_COUNT) {
    await finaliseEnrollment();
  }
}

async function finaliseEnrollment() {
  const { name, tag } = aiEnrollTarget;
  const avgDesc = averageDescriptors(aiEnrollBuffer);
  const faceStore = getFaceStore();
  const key = `students|${name}`;

  faceStore[key] = {
    descriptor:    avgDesc,   // keep for compat
    avgDescriptor: avgDesc,   // enhanced averaged version
    name, tag,
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
        targetType: 'students', name, tag,
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
      if (!selectedName) return window.alert('Select a student first.');
      const store = getStore();
      const student = (store.students || []).find(s => s.fullName === selectedName);
      if (!refs.faceVideo?.srcObject) await startCamera();
      startMultiSampleEnroll(selectedName, student?.className || '');
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

  // Patch autoCaptureTick to use AI ensemble matching
  const _origTick = window.autoCaptureTick || autoCaptureTick;
  window.autoCaptureTick = async function() {
    if (!refs.autoCaptureToggle?.checked) return;
    if (window.autoCaptureBusy) return;
    if (!refs.faceVideo?.srcObject) return;

    // Liveness gate
    const live = checkLiveness(refs.faceVideo);
    if (!live && !aiLivenessOk) {
      if (refs.faceStatusText) refs.faceStatusText.textContent = 'Liveness check: please move slightly…';
      return;
    }
    aiLivenessOk = true; // once confirmed live, allow subsequent frames

    // Quality gate
    const { ok, brightness } = checkFrameQuality(refs.faceVideo);
    if (!ok) {
      if (refs.faceStatusText) refs.faceStatusText.textContent = `⚠ Low light (${brightness.toFixed(0)}). Improve lighting for better accuracy.`;
      return;
    }

    // Delegate to original which handles API calls, but intercept match scoring
    const origFindBest = window.findBestFaceMatch;
    window.findBestFaceMatch = findBestFaceMatchAI;
    try {
      await _origTick();
    } finally {
      window.findBestFaceMatch = origFindBest;
    }
  };

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
      <strong style="color:#10b981">AI Engine v2</strong>
    </span>
    <span>🎯 Ensemble scoring (cosine + euclidean)</span>
    <span>📸 Multi-sample enrollment (${MULTI_SAMPLE_COUNT} poses)</span>
    <span>✅ Liveness detection</span>
    <span>🔦 Quality gate</span>
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

// patchFaceAI is already called on DOMContentLoaded above — no need to call again on load

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

    // Inject into main content area (same pattern used by finance module)
    const main = document.querySelector(".main-content") || document.querySelector("main") || document.body;
    let panel = document.getElementById("bd-panel");
    if (!panel) {
      panel = document.createElement("div");
      panel.id = "bd-panel";
      panel.style.cssText = "padding:24px;max-width:1200px;margin:0 auto;";
      main.appendChild(panel);
    }

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
                <option value="Development Fee">Development Fee</option>
                <option value="Sports Fee">Sports Fee</option>
                <option value="Lab Fee">Lab Fee</option>
                <option value="Computer Fee">Computer Fee</option>
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

    const rows = [...feeStructures].sort((a, b) =>
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
      // Hide standard content panels
      const contentEl = document.getElementById("moduleContent") || document.querySelector(".module-content");
      if (contentEl) contentEl.style.display = "none";

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

  async function showBDPanel() {
    // Hide other panels
    document.querySelectorAll(".module-panel, #bd-panel").forEach(el => el.remove());
    const contentEl = document.getElementById("moduleContent") || document.querySelector(".module-content");
    if (contentEl) contentEl.style.display = "none";

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

  // Directly override printFeeReceipt with full rebuilt version including BD section
  window.printFeeReceipt = function(f) {
    const schoolName = "Tapowan Public School";
    const receiptNo = "RCP-" + (f.id || Date.now());
    const printDate = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });
    const totalFee   = parseFloat(f.totalFee) || 0;
    const paidAmount = parseFloat(f.paidAmount) || 0;
    const balance    = parseFloat(f.balance) || Math.max(0, totalFee - paidAmount);
    const monthlyFee = parseFloat(f.monthlyFee) || 0;
    const monthlyFeeLabel = f.monthlyFeeLabel || "Monthly School Fee";
    const statusColor = String(f.status).toLowerCase() === "paid" ? "#16a34a"
      : String(f.status).toLowerCase() === "partial" ? "#d97706" : "#dc2626";

    // Build selected items section from stored selectedBookIds
    let selectedItemsHtml = "";
    let itemsTotal = 0;
    try {
      const ids = JSON.parse(f.selectedBookIds || "[]");
      if (ids.length) {
        const allBDItems = [...bdBooks, ...bdDresses];
        const selectedItems = ids.map(id => allBDItems.find(r => String(r.id) === String(id))).filter(Boolean);
        if (selectedItems.length) {
          const rows = selectedItems.map(item => {
            const price = parseFloat(item.price) || 0;
            itemsTotal += price;
            const icon = item.itemType === "Book" ? "📚" : "👕";
            return `<tr>
              <td style="padding:7px 10px;border:1px solid #e2e8f0;color:#475569;">${icon} ${item.itemName}</td>
              <td style="padding:7px 10px;border:1px solid #e2e8f0;text-align:right;font-weight:600;">₹ ${price.toLocaleString("en-IN")}</td>
            </tr>`;
          }).join("");
          selectedItemsHtml = `
            <div style="padding:16px 24px;border-bottom:1px solid #e2e8f0;">
              <div style="font-weight:700;color:#1e3a8a;margin-bottom:10px;font-size:15px;">📦 Books & Dress Charges</div>
              <table style="width:100%;border-collapse:collapse;font-size:13px;">
                <thead><tr style="background:#f0f4ff;">
                  <th style="padding:7px 10px;border:1px solid #c7d2fe;text-align:left;color:#1e3a8a;">Item</th>
                  <th style="padding:7px 10px;border:1px solid #c7d2fe;text-align:right;color:#1e3a8a;">Price</th>
                </tr></thead>
                <tbody>${rows}</tbody>
                <tfoot><tr style="background:#1e3a8a;">
                  <td style="padding:9px 10px;border:1px solid #1e3a8a;font-weight:700;color:#fff;">Books & Dress Total</td>
                  <td style="padding:9px 10px;border:1px solid #1e3a8a;text-align:right;font-weight:800;color:#fff;">₹ ${itemsTotal.toLocaleString("en-IN")}</td>
                </tr></tfoot>
              </table>
            </div>`;
        }
      }
    } catch(e) { /* ignore parse errors */ }

    const html = `
      <div style="max-width:620px;margin:0 auto;font-family:Arial,sans-serif;border:2px solid #1e3a8a;border-radius:10px;overflow:hidden;">
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
            <tr><td style="padding:5px 0;color:#64748b;width:40%;">Student Name</td><td style="padding:5px 0;font-weight:700;color:#0f172a;">${f.studentName || "-"}</td></tr>
            <tr><td style="padding:5px 0;color:#64748b;">Class</td><td style="padding:5px 0;font-weight:600;">${f.className || "-"}</td></tr>
            <tr><td style="padding:5px 0;color:#64748b;">Roll No</td><td style="padding:5px 0;">${f.rollNo || "-"}</td></tr>
            <tr><td style="padding:5px 0;color:#64748b;">Term</td><td style="padding:5px 0;">${f.term || "-"}</td></tr>
            <tr><td style="padding:5px 0;color:#64748b;">Payment Date</td><td style="padding:5px 0;">${f.paymentDate || "-"}</td></tr>
            <tr><td style="padding:5px 0;color:#64748b;">Payment Method</td><td style="padding:5px 0;">${f.paymentMethod || "-"}</td></tr>
          </table>
        </div>
        <!-- Fee Breakdown -->
        <div style="padding:16px 24px;border-bottom:1px solid #e2e8f0;">
          <div style="font-weight:700;color:#1e3a8a;margin-bottom:10px;font-size:15px;">Fee Summary</div>
          <table style="width:100%;border-collapse:collapse;font-size:14px;">
            ${monthlyFee > 0 ? `<tr style="background:#f8fafc;">
              <td style="padding:8px 10px;border:1px solid #e2e8f0;color:#475569;">${monthlyFeeLabel}</td>
              <td style="padding:8px 10px;border:1px solid #e2e8f0;text-align:right;font-weight:600;">₹ ${monthlyFee.toLocaleString("en-IN")}</td>
            </tr>` : ""}
            ${itemsTotal > 0 ? `<tr>
              <td style="padding:8px 10px;border:1px solid #e2e8f0;color:#475569;">Books & Dress Charges</td>
              <td style="padding:8px 10px;border:1px solid #e2e8f0;text-align:right;font-weight:600;">₹ ${itemsTotal.toLocaleString("en-IN")}</td>
            </tr>` : ""}
            <tr style="background:#eef2ff;">
              <td style="padding:8px 10px;border:1px solid #e2e8f0;color:#1e3a8a;font-weight:700;">Total Fee</td>
              <td style="padding:8px 10px;border:1px solid #e2e8f0;text-align:right;font-weight:700;color:#1e3a8a;">₹ ${totalFee.toLocaleString("en-IN")}</td>
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
        <!-- Books & Dress Detail -->
        ${selectedItemsHtml}
        <!-- Status -->
        <div style="padding:14px 24px;display:flex;justify-content:space-between;align-items:center;">
          <div style="font-size:13px;color:#64748b;">Payment Status</div>
          <div style="background:${statusColor};color:#fff;padding:4px 18px;border-radius:20px;font-size:13px;font-weight:700;">${f.status || "Pending"}</div>
        </div>
        <!-- Footer -->
        <div style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:12px 24px;text-align:center;font-size:12px;color:#94a3b8;">
          This is a computer-generated receipt. No signature required. — ${schoolName}
        </div>
      </div>`;

    const receiptHtml = buildPrintableHtml("Fee Receipt - " + schoolName, html);
    const w = window.open("", "_blank");
    if (!w) return window.alert("Popup blocked. Please allow popups for this site and try again.");
    w.document.write(receiptHtml);
    w.document.close();
    w.focus();
  };

  // ── Fee form: Monthly fee + selectable books/dresses ─────────────────────────

  // Populate the monthly fee radio checkboxes for a given class
  function populateMonthlyFeeSelect(cls) {
    const container = document.getElementById("bd-monthly-fee-input");
    if (!container) return;
    const prevValue = container.dataset.selectedValue || "";
    container.innerHTML = "";
    const options = cls
      ? feeStructures.filter(f => f.className === cls)
      : feeStructures;
    if (options.length) {
      options.forEach(f => {
        const val = String(f.amount);
        const label = document.createElement("label");
        label.style.cssText = "display:flex;align-items:center;gap:10px;padding:7px 10px;border-radius:8px;cursor:pointer;border:1px solid #e2e8f0;margin-bottom:6px;background:#fff;transition:background 0.15s;";
        const termStr = f.term ? ` <span style='color:#64748b;font-size:0.8rem;'>(${f.term})</span>` : "";
        const descStr = f.description ? ` <span style='color:#64748b;font-size:0.8rem;'>· ${f.description}</span>` : "";
        label.innerHTML = `
          <input type="radio" name="bd-monthly-fee-radio" value="${val}"
            data-label="${f.feeType}"
            style="width:16px;height:16px;accent-color:#1e3a8a;cursor:pointer;flex-shrink:0;"
            ${prevValue === val ? "checked" : ""}>
          <span style="flex:1;font-size:0.88rem;color:#1e293b;">${f.feeType}${termStr}${descStr}</span>
          <span style="font-weight:700;color:#1e3a8a;white-space:nowrap;">${formatINR(f.amount)}</span>`;
        const radio = label.querySelector("input");
        radio.addEventListener("change", () => {
          container.dataset.selectedValue = val;
          container.querySelectorAll("label").forEach(l => l.style.background = "#fff");
          label.style.background = "#eff6ff";
          recalcFeeTotals();
        });
        if (prevValue === val) label.style.background = "#eff6ff";
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

    const monthlyFeeEl  = form.querySelector("#bd-monthly-fee-input");
    const totalFeeInput = form.querySelector("[name='totalFee']");
    const paidInput     = form.querySelector("[name='paidAmount']");
    const balanceInput  = form.querySelector("[name='balance']");

    // Read from radio button group (checkbox style)
    const checkedRadio = monthlyFeeEl?.querySelector("input[name=\"bd-monthly-fee-radio\"]:checked");
    const monthlyFee = parseFloat(checkedRadio?.value || 0) || 0;

    // Sum only checked book/dress items
    let selectedExtra = 0;
    form.querySelectorAll(".bd-item-checkbox:checked").forEach(cb => {
      selectedExtra += parseFloat(cb.dataset.price || 0) || 0;
    });

    const total = monthlyFee + selectedExtra;

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

    info.style.display = "block";

    const itemRows = allItems.map(item => {
      const icon = item.itemType === "Book" ? "📚" : "👕";
      return `
        <label style="display:flex;align-items:center;gap:10px;padding:6px 0;border-bottom:1px solid #dbeafe;cursor:pointer;">
          <input type="checkbox" class="bd-item-checkbox" data-id="${item.id}" data-price="${item.price}"
            style="width:16px;height:16px;accent-color:#1e3a8a;cursor:pointer;"
            ${item.itemType === "Dress" ? "" : ""}>
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
      if (!form || form.dataset.bdInfoInjected) return;
      form.dataset.bdInfoInjected = "1";

      // ── 1. Make totalFee and balance read-only immediately ──
      const totalFeeInput = form.querySelector("[name='totalFee']");
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

      // ── 2. Inject Monthly Fee CHECKBOXES before totalFee ──
      if (!form.querySelector("#bd-monthly-fee-wrapper")) {
        const wrapper = document.createElement("div");
        wrapper.id = "bd-monthly-fee-wrapper";
        wrapper.className = "form-group";
        wrapper.innerHTML = `
          <label style="font-weight:600;font-size:0.88rem;color:#374151;display:block;margin-bottom:8px;">
            Monthly Fee <span style="color:#e53e3e;">*</span>
          </label>
          <div id="bd-monthly-fee-input"
            style="border:1px solid #e2e8f0;border-radius:8px;padding:8px 10px;background:#f8fafc;max-height:180px;overflow-y:auto;">
            <div style="color:#94a3b8;font-size:0.85rem;padding:4px 0;">Select a class to see fee structures.</div>
          </div>
          <div style="display:flex;align-items:center;gap:8px;margin-top:5px;">
            <span id="bd-monthly-fee-note" style="font-size:0.75rem;color:#64748b;flex:1;">
              Select one fee type from the class fee structures.
              <a href="#" id="bd-fs-manage-link" style="color:#1e3a8a;text-decoration:underline;font-weight:600;">Manage fee structures →</a>
            </span>
          </div>`;

        const totalFeeWrapper = totalFeeInput?.closest(".form-group") || totalFeeInput?.parentElement;
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

      // ── 3. Inject BD info panel after the form ──
      let info = document.getElementById("bd-fee-info");
      if (!info) {
        info = document.createElement("div");
        info.id = "bd-fee-info";
        info.style.cssText = "background:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;padding:14px 16px;font-size:0.86rem;color:#1e40af;margin-top:10px;display:none;";
        form.parentNode.insertBefore(info, form.nextSibling);
      }

      const classField   = form.querySelector("[name='className']");
      const studentField = form.querySelector("[name='studentName']");

      if (classField && !classField.dataset.bdPatched) {
        classField.dataset.bdPatched = "1";
        classField.addEventListener("change", () => showBDInfoForClass(classField.value));
        if (classField.value) showBDInfoForClass(classField.value);
      }

      if (studentField && !studentField.dataset.bdPatched) {
        studentField.dataset.bdPatched = "1";
        studentField.addEventListener("change", () => {
          setTimeout(() => {
            const cls = classField ? classField.value : "";
            showBDInfoForClass(cls);
          }, 80);
        });
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

    // Inject nav item (retry until nav is rendered)
    const tryNav = () => {
      injectBDNavItem();
      if (!document.querySelector("[data-module='booksAndDress']")) setTimeout(tryNav, 500);
    };
    tryNav();

    patchFeeFormForBD();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bdInit);
  } else {
    bdInit();
  }
})();
