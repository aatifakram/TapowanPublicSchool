const FACE_KEY = "school_face_embeddings_v2";
const FACE_MODEL_URL = "https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/";
const CLASS_STANDARD_OPTIONS = ["Nursery", "LKG", "UKG", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];

const moduleConfig = {
  dashboard: { title: "Dashboard", subtitle: "School overview and quick statistics", fields: [], columns: ["Metric", "Value"] },
  students: { title: "Students", subtitle: "Manage student admissions and profiles", fields: ["admissionNo", "rollNo", "fullName", "className", "gender", "dob", "parentName", "phone", "address", "photo"], columns: ["id", "admissionNo", "rollNo", "fullName", "className", "gender", "dob", "parentName", "phone"] },
  teachers: { title: "Teachers", subtitle: "Manage teacher records and contacts", fields: ["employeeNo", "fullName", "department", "qualification", "phone", "email", "joinDate"], columns: ["id", "employeeNo", "fullName", "department", "qualification", "phone", "email"] },
  classes: { title: "Classes", subtitle: "Create classes and assign class teachers", fields: ["className", "section", "classTeacher", "roomNo", "capacity"], columns: ["id", "className", "section", "classTeacher", "roomNo", "capacity"] },
  subjects: { title: "Subjects", subtitle: "Define subjects and assign faculty", fields: ["subjectCode", "subjectName", "className", "teacher", "credits"], columns: ["id", "subjectCode", "subjectName", "className", "teacher", "credits"] },
  attendance: { title: "Attendance", subtitle: "Track daily student attendance", fields: ["date", "className", "studentName", "rollNo", "status", "remarks"], columns: ["id", "date", "className", "studentName", "rollNo", "status", "remarks"] },
  teacherAttendance: { title: "Teacher Attendance", subtitle: "Track daily teacher attendance", fields: ["date", "department", "teacherName", "status", "remarks"], columns: ["id", "date", "department", "teacherName", "status", "remarks"] },
  exams: { title: "Exams & Results", subtitle: "Manage exams and student marks", fields: ["examName", "className", "subject", "studentName", "rollNo", "marksObtained", "maxMarks", "grade"], columns: ["id", "examName", "className", "subject", "studentName", "rollNo", "marksObtained", "maxMarks", "grade"] },
  fees: { title: "Fees", subtitle: "Record fee structures and payments", fields: ["studentName", "className", "rollNo", "term", "totalFee", "paidAmount", "balance", "status"], columns: ["id", "studentName", "className", "rollNo", "term", "totalFee", "paidAmount", "balance", "status"] },
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

const refs = {
  moduleNav: document.getElementById("moduleNav"),
  moduleTitle: document.getElementById("moduleTitle"),
  moduleSubtitle: document.getElementById("moduleSubtitle"),
  dynamicForm: document.getElementById("dynamicForm"),
  tableHead: document.getElementById("tableHead"),
  tableBody: document.getElementById("tableBody"),
  statsCards: document.getElementById("statsCards"),
  searchInput: document.getElementById("searchInput"),
  resetDataBtn: document.getElementById("resetDataBtn"),
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
  faceAutoControls: document.getElementById("faceAutoControls")
};

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function nowStr() {
  return new Date().toISOString().slice(0, 19).replace("T", " ");
}

function getStore() { return serverStore || {}; }
function getFaceStore() { return JSON.parse(localStorage.getItem(FACE_KEY) || "{}"); }
function saveFaceStore(v) { localStorage.setItem(FACE_KEY, JSON.stringify(v)); }

function toLabel(key) {
  const custom = {
    className: "Class",
    rollNo: "Roll No",
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
  moduleOrder.forEach(name => {
    const btn = document.createElement("button");
    btn.className = `nav-btn ${name === currentModule ? "active" : ""}`;
    btn.textContent = moduleConfig[name].title;
    btn.addEventListener("click", () => {
      currentModule = name;
      refs.searchInput.value = "";
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
    } else if (currentModule === "students" && field === "photo") {
      input = document.createElement("input");
      input.type = "file";
      input.name = field;
      input.accept = "image/*";
      input.required = false;
    } else {
      input = document.createElement("input");
      input.name = field;
      input.required = true;
      if (field.includes("date") || field === "dob") input.type = "date";
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
    const cells = cfg.columns.map(key => {
      const val = item[key] ?? "";
      if (String(val).toLowerCase().includes("active") || String(val).toLowerCase().includes("present")) return `<td><span class="badge">${val}</span></td>`;
      return `<td>${val}</td>`;
    }).join("");
    tr.innerHTML = `${cells}<td><button class="chip" data-id="${item.id}">Delete</button></td>`;
    refs.tableBody.appendChild(tr);
  });

  refs.tableBody.querySelectorAll("button[data-id]").forEach(btn => {
    btn.addEventListener("click", () => {
      removeRecord(currentModule, Number(btn.dataset.id)).then(renderAll).catch((e) => window.alert(e.message));
    });
  });
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
    record.balance = total - paid;
    record.status = record.balance <= 0 ? "Paid" : paid > 0 ? "Partial" : "Pending";
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
    card.innerHTML = `<h4>${k}</h4><p class="value">${v}</p>`;
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
    faceStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
    refs.faceVideo.srcObject = faceStream;
    refs.faceStatusText.textContent = "Camera started. Capture face when ready.";
  } catch (err) {
    refs.faceStatusText.textContent = `Camera access failed: ${err.message}`;
  }
}

async function captureFace() {
  const ready = await ensureFaceModelsLoaded();
  if (!ready) return;
  if (!refs.faceVideo.srcObject) return window.alert("Start camera first.");
  const detection = await faceapi
    .detectSingleFace(refs.faceVideo, new faceapi.TinyFaceDetectorOptions())
    .withFaceLandmarks()
    .withFaceDescriptor();
  if (!detection) {
    refs.faceStatusText.textContent = "No face detected. Keep face centered and try again.";
    return;
  }
  latestDescriptor = Array.from(detection.descriptor);
  const ctx = refs.faceCanvas.getContext("2d");
  refs.faceCanvas.width = refs.faceVideo.videoWidth || 640;
  refs.faceCanvas.height = refs.faceVideo.videoHeight || 360;
  ctx.drawImage(refs.faceVideo, 0, 0, refs.faceCanvas.width, refs.faceCanvas.height);
  refs.faceStatusText.textContent = "Face captured successfully.";
}

function cosineSimilarity(a, b) {
  let dot = 0; let na = 0; let nb = 0;
  for (let i = 0; i < a.length; i += 1) {
    dot += a[i] * b[i]; na += a[i] * a[i]; nb += b[i] * b[i];
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

function findBestFaceMatch(descriptor, targetType, minScore = 0.8) {
  const faceStore = getFaceStore();
  const scoped = Object.entries(faceStore).filter(([key]) => key.startsWith(`${targetType}|`));
  if (!scoped.length) return null;
  let best = null;
  scoped.forEach(([key, val]) => {
    const score = cosineSimilarity(descriptor, val.descriptor || []);
    if (!best || score > best.score) best = { key, ...val, score };
  });
  return best && best.score >= minScore ? best : null;
}

function getTopFaceMatches(descriptor, targetType, limit = 3) {
  const faceStore = getFaceStore();
  const scoped = Object.entries(faceStore).filter(([key]) => key.startsWith(`${targetType}|`));
  const scored = scoped.map(([key, val]) => ({
    key,
    name: val.name,
    tag: val.tag,
    score: cosineSimilarity(descriptor, val.descriptor || [])
  }));
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
    const confirmText = `Verify face match and mark attendance?\n\nStudent: ${recognizedName}\nClass: ${resolvedClassName}\nStatus: ${status}\nConfidence: ${best?.score != null ? best.score.toFixed(2) : "N/A"}`;
    if (!window.confirm(confirmText)) {
      refs.faceStatusText.textContent = "Attendance verification cancelled.";
      return;
    }
    const row = {
      id: getNextId(store.attendance || []),
      date: todayStr(),
      className: resolvedClassName,
      studentName: recognizedName,
      rollNo: student?.rollNo || "",
      status,
      remarks: "Face-recognized"
    };
    await api("/api/modules/attendance", { method: "POST", body: JSON.stringify(row) });
    currentModule = "attendance";
  } else {
    const resolvedDept = classDept || best?.tag || "N/A";
    const confirmText = `Verify face match and mark attendance?\n\nTeacher: ${recognizedName}\nDepartment: ${resolvedDept}\nStatus: ${status}\nConfidence: ${best?.score != null ? best.score.toFixed(2) : "N/A"}`;
    if (!window.confirm(confirmText)) {
      refs.faceStatusText.textContent = "Attendance verification cancelled.";
      return;
    }
    const row = { id: getNextId(store.teacherAttendance || []), date: todayStr(), department: resolvedDept, teacherName: recognizedName, status, remarks: "Face-recognized" };
    await api("/api/modules/teacherAttendance", { method: "POST", body: JSON.stringify(row) });
    currentModule = "teacherAttendance";
  }
  await loadStore();
  refs.faceStatusText.textContent = `Attendance marked for ${recognizedName}.`;
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

    const minConf = Math.max(0.5, Math.min(0.99, Number(refs.autoMinConfidence?.value) || 0.88));
    const stableCount = Math.max(1, Math.min(10, Number(refs.autoStableCount?.value) || 3));

    // Recognize the face from the current camera frame.
    const detection = await faceapi
      .detectSingleFace(refs.faceVideo, new faceapi.TinyFaceDetectorOptions())
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
      autoRecognitionStreak = 0;
      autoStreakKey = "";
      refs.faceStatusText.innerHTML = `AI: No confident match<br/>Top: ${topMatches.map((m) => `${m.name || "unknown"} (${m.score.toFixed(2)})`).join(", ")}`;
      return;
    }

    const store = getStore();
    const student = (store.students || []).find((s) => s.fullName === recognizedName);
    const resolvedClassName = manualClass || best.tag || student?.className || "N/A";

    // If teacher/operator entered a class, be strict: require it to match enrollment tag or student class.
    if (manualClass) {
      const enrolledClass = best.tag || student?.className || "";
      if (String(enrolledClass) !== String(manualClass)) {
        autoRecognitionStreak = 0;
        autoStreakKey = "";
        refs.faceStatusText.innerHTML = `AI: Face found but class mismatch<br/>Matched: ${recognizedName} (${best.score.toFixed(2)})<br/>Expected Class: ${enrolledClass || "N/A"} | Input: ${manualClass}`;
        return;
      }
    }

    const today = todayStr();
    const matchKey = `${recognizedName}|${resolvedClassName}|${today}`;

    if (autoStreakKey === matchKey) {
      autoRecognitionStreak += 1;
    } else {
      autoStreakKey = matchKey;
      autoRecognitionStreak = 1;
    }

    refs.faceStatusText.innerHTML = `AI: ${recognizedName}<br/>Confidence: ${best.score.toFixed(2)}<br/>Streak: ${autoRecognitionStreak}/${stableCount}<br/>Top: ${topMatches.map((m) => `${m.name || "unknown"} (${m.score.toFixed(2)})`).join(", ")}`;

    // Cooldown avoids repeated updates/marks while the same face stays in camera.
    const cooldownMs = 10000;
    const now = Date.now();
    if (autoRecognitionStreak < stableCount) return;
    if (autoLastAutoMarkKey === matchKey && (now - autoLastAutoMarkAt) < cooldownMs) return;

    autoCaptureBusy = true;
    const snap = videoFrameToResizedDataUrl(refs.faceVideo, 220, 0.68);
    const existing = findExistingAttendanceRecord(store, recognizedName, resolvedClassName, today);

    // Update existing record photo if already marked.
    if (existing?.id) {
      await api(`/api/modules/attendance/${existing.id}`, {
        method: "PUT",
        body: JSON.stringify({ facePhoto: snap })
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
  } catch (err) {
    refs.faceStatusText.textContent = `Auto mode error: ${err.message}`;
  } finally {
    autoCaptureBusy = false;
  }
}

async function autoBatchCaptureTick() {
  if (autoCaptureBusy) return;
  autoCaptureBusy = true;

  const minConf = Math.max(0.5, Math.min(0.99, Number(refs.autoMinConfidence?.value) || 0.88));
  const cooldownMs = 12000; // avoid repeated updates while same faces remain in frame
  const margin = 0.03; // bestScore - secondBestScore must be >= margin
  const maxMarksPerTick = 50;

  try {
    const detections = await faceapi
      .detectAllFaces(refs.faceVideo, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptors();

    if (!detections || !detections.length) {
      refs.faceStatusText.textContent = "AI Batch: No faces found";
      return;
    }

    const store = getStore();
    const today = todayStr();
    const now = Date.now();

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
        await api(`/api/modules/attendance/${existing.id}`, {
          method: "PUT",
          body: JSON.stringify({ facePhoto: snap })
        });
        existing.facePhoto = snap;
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
  // Special handling for student photo (file -> resized base64 string).
  for (const field of moduleConfig[currentModule].fields) {
    if (currentModule === "students" && field === "photo") {
      const file = form.get(field);
      if (file && file.size > 0) payload[field] = await fileToResizedDataUrl(file);
      else payload[field] = "";
    } else {
      payload[field] = (form.get(field) || "").toString().trim();
    }
  }
  await addRecord(currentModule, payload);
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

refs.logoutBtn.addEventListener("click", async () => {
  await logout();
  applyAuthUI(null);
  refs.tableBody.innerHTML = "";
  refs.tableHead.innerHTML = "";
  refs.statsCards.innerHTML = "";
  refs.dynamicForm.innerHTML = "";
});

refs.resetDataBtn.addEventListener("click", async () => {
  if (!window.confirm("Reset server data to initial sample?")) return;
  try {
    await api("/api/admin/reset", { method: "POST" });
    await loadStore();
    renderAll();
  } catch (err) {
    window.alert(err.message);
  }
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

    // Store embedding for this student.
    const faceStore = getFaceStore();
    const key = `students|${selectedName}`;
    faceStore[key] = { descriptor: latestDescriptor, name: selectedName, tag: student?.className || "" };
    saveFaceStore(faceStore);

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
  const intervalMs = Math.max(500, Number(refs.autoCaptureIntervalMs.value) || 2000);
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
  const intervalMs = Math.max(500, Number(refs.autoCaptureIntervalMs.value) || 2000);
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
    renderAll();
  } catch {
    applyAuthUI(null);
  }
}

boot();
