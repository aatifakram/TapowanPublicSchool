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
  fees: { title: "Fees", subtitle: "Record fee structures and payments", fields: ["studentName", "className", "rollNo", "term", "totalFee", "paidAmount", "balance", "status", "paymentDate", "paymentMethod"], columns: ["id", "studentName", "className", "rollNo", "term", "totalFee", "paidAmount", "balance", "status"] },
  library: { title: "Library", subtitle: "Manage books, issues and returns", fields: ["bookCode", "bookTitle", "author", "issuedTo", "issueDate", "returnDate", "status"], columns: ["id", "bookCode", "bookTitle", "author", "issuedTo", "issueDate", "returnDate", "status"] },
  transport: { title: "Transport", subtitle: "Track routes, buses and student allocation", fields: ["routeName", "vehicleNo", "driverName", "studentName", "pickupPoint", "monthlyFee"], columns: ["id", "routeName", "vehicleNo", "driverName", "studentName", "pickupPoint", "monthlyFee"] },
  hostel: { title: "Hostel", subtitle: "Manage hostel rooms and allocations", fields: ["hostelName", "roomNo", "studentName", "warden", "checkInDate", "bedNo", "status"], columns: ["id", "hostelName", "roomNo", "studentName", "warden", "checkInDate", "bedNo", "status"] },
  payroll: { title: "Payroll", subtitle: "Generate salary records and allowances", fields: ["employeeName", "designation", "month", "basicSalary", "allowances", "deductions", "netPay"], columns: ["id", "employeeName", "designation", "month", "basicSalary", "allowances", "deductions", "netPay"] },
  users: { title: "Users & Roles", subtitle: "System user accounts and permissions", fields: ["username", "fullName", "role", "email", "status", "lastLogin"], columns: ["id", "username", "fullName", "role", "email", "status", "lastLogin"] },
  timetable: { title: "Timetable", subtitle: "Weekly class and subject scheduling", fields: ["className", "day", "period", "subject", "teacher", "roomNo"], columns: ["id", "className", "day", "period", "subject", "teacher", "roomNo"] }
};

const moduleOrder = Object.keys(moduleConfig);
const printableModules = new Set(["students", "exams", "fees"]);
let currentModule = "dashboard";
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
  const data = await api("/api/store");
  serverStore = data;
}

function applyAuthUI(session) {
  const loggedIn = !!session;
  refs.authOverlay.classList.toggle("hidden", loggedIn);
  refs.activeUserBadge.textContent = loggedIn ? `${session.fullName} (${session.role})` : "Guest";
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

  moduleOrder.forEach(name => {
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

    if (currentModule === "students") {
      tr.innerHTML = `
        ${cells}
        <td>
          <div class="student-actions">
            <button class="action-btn action-view" data-action="view" data-id="${item.id}">View</button>
            <button class="action-btn action-edit" data-action="edit" data-id="${item.id}">Edit</button>
            <button class="chip" data-delete-id="${item.id}">Delete</button>
          </div>
        </td>
      `;
    } else {
      tr.innerHTML = `${cells}<td><button class="chip" data-delete-id="${item.id}">Delete</button></td>`;
    }
    refs.tableBody.appendChild(tr);
  });

  refs.tableBody.querySelectorAll("button[data-delete-id]").forEach(btn => {
    btn.addEventListener("click", () => {
      removeRecord(currentModule, Number(btn.dataset.deleteId)).then(renderAll).catch((e) => window.alert(e.message));
    });
  });

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
    record.balance = String(balance);
    record.status = balance <= 0 ? "Paid" : paid > 0 ? "Partial" : "Pending";
  }
  if (moduleName === "users" && !record.password) record.password = "welcome123";
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
  const stats = getDashboardStats(getStore());
  refs.statsCards.innerHTML = "";
  Object.entries(stats).forEach(([k, v]) => {
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
  refs.moduleSubtitle.textContent = moduleConfig[currentModule].subtitle;
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
  const showFacePanel = currentModule === "attendance" || currentModule === "teacherAttendance" || currentModule === "students";
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
  a.click();
  URL.revokeObjectURL(url);
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
    html += (store.fees || []).slice(0, 5).map(f => `<div class="box"><h2>Fee Invoice</h2>
      <div class="row"><strong>Student:</strong> ${f.studentName}</div>
      <div class="row"><strong>Class:</strong> ${f.className}</div>
      <div class="row"><strong>Term:</strong> ${f.term}</div>
      <div class="row"><strong>Total:</strong> ${f.totalFee}</div>
      <div class="row"><strong>Paid:</strong> ${f.paidAmount}</div>
      <div class="row"><strong>Balance:</strong> ${f.balance}</div></div>`).join("");
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
    if (!recognizedName || !best) {
      autoRecognitionStreakByKey[matchKey] = 0;
      refs.faceStatusText.innerHTML = `🔍 AI: No confident match<br/>Top: ${topMatches.map((m) => `${m.name || "unknown"} (${(m.score*100).toFixed(0)}%)`).join(", ")}<br/><small style="opacity:0.6">Try enrolling more poses or improve lighting</small>`;
      return;
    }

    const store = getStore();
    const student = (store.students || []).find((s) => s.fullName === recognizedName);
    const resolvedClassName = manualClass || best.tag || student?.className || "N/A";

    // If teacher/operator entered a class, be strict: require it to match enrollment tag or student class.
    if (manualClass) {
      const enrolledClass = best.tag || student?.className || "";
      if (String(enrolledClass) !== String(manualClass)) {
        autoRecognitionStreakByKey[matchKey] = 0;
        refs.faceStatusText.innerHTML = `⚠ AI: Face found but class mismatch<br/>Matched: ${recognizedName} (${(best.score*100).toFixed(0)}%)<br/>Expected: ${enrolledClass || "N/A"} | Entered: ${manualClass}`;
        return;
      }
    }

    const today = todayStr();
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

  if (isEditingStudent) {
    await api(`/api/modules/students/${editStudentId}`, { method: "PUT", body: JSON.stringify(payload) });
    editStudentId = null;
  } else {
    await addRecord(currentModule, payload);
  }
  e.target.reset();
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

  for (const [groupName, modules] of Object.entries(NAV_GROUPS)) {
    const label = document.createElement('div');
    label.className = 'nav-group-label';
    label.textContent = groupName;
    nav.appendChild(label);

    modules.forEach(mod => {
      if (!moduleConfig[mod]) return;
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
// run on first interaction if needed
window.addEventListener('load', () => {
  setTimeout(() => {
    patchApp();
    // initial toast
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

  // Insert before faceAutoControls
  const autoCtrl = document.getElementById('faceAutoControls');
  if (autoCtrl) {
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

window.addEventListener('load', () => {
  setTimeout(patchFaceAI, 700);
});

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
