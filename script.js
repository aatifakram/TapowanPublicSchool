// Supabase Configuration (REPLACE WITH YOUR ACTUAL DETAILS)
const SUPABASE_URL = 'https://zyvwttzwjweeslvjbatg.supabase.co'; // e.g., 'https://abcdefg.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp5dnd0dHp3andlZXNsdmpiYXRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5NTQwODMsImV4cCI6MjA2OTUzMDA4M30.pgzB45XBJAyGBlkKUJF4Jr0yVNunXjwa8p8JOaX7Nso'; // e.g., 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'

const supabase = Supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- Global Variables ---
let currentRole = 'admin'; // Default role
let loggedInUser = null;
let typedWelcomeText = "Welcome to Tapowan Public School!";
let typedWelcomeIndex = 0;
let typingSpeed = 70; // milliseconds
let isDarkMode = false;

// --- DOM Elements ---
const loginUI = document.getElementById('login-ui');
const schoolSiteUI = document.getElementById('school-site-ui');
const loginForm = document.getElementById('loginForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const selectedRoleInput = document.getElementById('selectedRole');
const roleButtons = document.querySelectorAll('.role-button');
const forgotPasswordLink = document.getElementById('forgotPasswordLink');
const forgotPasswordModal = document.getElementById('forgotPasswordModal');
const closeForgotPasswordModal = document.getElementById('closeForgotPasswordModal');
const forgotPasswordForm = document.getElementById('forgotPasswordForm');

const sidebarNavItems = document.querySelectorAll('.nav-item');
const moduleTabs = document.getElementById('moduleTabs');
const modulesContainer = document.getElementById('modulesContainer');
const dashboardMainContent = document.getElementById('dashboardMainContent');
const currentModuleTitle = document.getElementById('currentModuleTitle');
const loggedInUserName = document.getElementById('loggedInUserName');
const logoutButton = document.getElementById('logoutButton');
const userProfileToggle = document.getElementById('userProfileToggle');
const userDropdown = document.getElementById('userDropdown');
const notificationButton = document.getElementById('notificationButton');
const notificationDropdown = document.getElementById('notificationDropdown');
const notificationCount = document.getElementById('notificationCount');
const notificationList = document.getElementById('notificationList');
const newCount = document.getElementById('newCount');
const markAllReadBtn = document.getElementById('markAllReadBtn');
const viewAllNotificationsLink = document.getElementById('viewAllNotificationsLink');
const viewAllModal = document.getElementById('viewAllModal');
const closeViewAllModal = document.getElementById('closeViewAllModal');
const viewAllNotificationList = document.getElementById('viewAllNotificationList');
const modalMarkAllReadBtn = document.getElementById('modalMarkAllReadBtn');
const darkModeToggle = document.getElementById('darkModeToggle');

// Stats Cards
const totalStudentsCount = document.getElementById('totalStudentsCount');
const totalTeachersCount = document.getElementById('totalTeachersCount');
const monthlyRevenue = document.getElementById('monthlyRevenue');
const upcomingEventsCount = document.getElementById('upcomingEventsCount');

// Module-specific elements
const profileModule = document.getElementById('profileModule');
const profileForm = document.getElementById('profileForm');
const profilePictureInput = document.getElementById('profilePicture');
const profilePicturePreview = document.getElementById('profilePicturePreview');
const fullNameInput = document.getElementById('fullName');
const profileEmailInput = document.getElementById('profileEmail');
const roleSelect = document.getElementById('role');
const phoneInput = document.getElementById('phone');
const addressTextarea = document.getElementById('address');

const userManagementModule = document.getElementById('user-managementModule');
const userTableBody = document.getElementById('userTableBody');
const userModal = document.getElementById('userModal');
const closeUserModal = document.getElementById('closeUserModal');
const userModalTitle = document.getElementById('userModalTitle');
const userForm = document.getElementById('userForm');
const userIdInput = document.getElementById('userId');
const userFullNameInput = document.getElementById('userFullName');
const userEmailInput = document.getElementById('userEmail');
const userRoleSelect = document.getElementById('userRole');
const userPasswordInput = document.getElementById('userPassword');
const userStatusSelect = document.getElementById('userStatus');
const userFormSubmitBtn = document.getElementById('userFormSubmitBtn');

const systemSettingsModule = document.getElementById('system-settingsModule');
const systemSettingsForm = document.getElementById('systemSettingsForm');
const schoolNameInput = document.getElementById('schoolName');
const schoolAddressInput = document.getElementById('schoolAddress');
const contactEmailInput = document.getElementById('contactEmail');
const contactPhoneInput = document.getElementById('contactPhone');
const smtpHostInput = document.getElementById('smtpHost');
const smtpPortInput = document.getElementById('smtpPort');
const smtpUsernameInput = document.getElementById('smtpUsername');
const smtpPasswordInput = document.getElementById('smtpPassword');

const auditLogsModule = document.getElementById('audit-logsModule');
const auditLogTableBody = document.getElementById('auditLogTableBody');

const backupRestoreModule = document.getElementById('backup-restoreModule');
const backupTableBody = document.getElementById('backupTableBody');

const announcementsModule = document.getElementById('announcementsModule');
const announcementTableBody = document.getElementById('announcementTableBody');
const announcementModal = document.getElementById('announcementModal');
const closeAnnouncementModal = document.getElementById('closeAnnouncementModal');
const announcementModalTitle = document.getElementById('announcementModalTitle');
const announcementForm = document.getElementById('announcementForm');
const announcementIdInput = document.getElementById('announcementId');
const announcementTitleInput = document.getElementById('announcementTitle');
const announcementContentTextarea = document.getElementById('announcementContent');
const announcementStatusSelect = document.getElementById('announcementStatus');
const announcementFormSubmitBtn = document.getElementById('announcementFormSubmitBtn');

const studentsModule = document.getElementById('studentsModule');
const studentTableBody = document.getElementById('studentTableBody');
const studentModal = document.getElementById('studentModal');
const closeStudentModal = document.getElementById('closeStudentModal');
const studentModalTitle = document.getElementById('studentModalTitle');
const studentForm = document.getElementById('studentForm');
const studentIdInput = document.getElementById('studentId');
const studentFullNameInput = document.getElementById('studentFullName');
const studentFatherNameInput = document.getElementById('studentFatherName');
const studentMotherNameInput = document.getElementById('studentMotherName');
const studentClassSelect = document.getElementById('studentClass');
const studentRollNoInput = document.getElementById('studentRollNo');
const studentAadharNoInput = document.getElementById('studentAadharNo');
const studentEmailInput = document.getElementById('studentEmail');
const studentPhoneInput = document.getElementById('studentPhone');
const studentStatusSelect = document.getElementById('studentStatus');
const studentFormSubmitBtn = document.getElementById('studentFormSubmitBtn');
const searchRollInput = document.getElementById('searchRoll');
const searchClassSelect = document.getElementById('searchClass');
const applySearchButton = document.getElementById('applySearch');

const teachersModule = document.getElementById('teachersModule');
const teacherTableBody = document.getElementById('teacherTableBody');
const teacherModal = document.getElementById('teacherModal');
const closeTeacherModal = document.getElementById('closeTeacherModal');
const teacherModalTitle = document.getElementById('teacherModalTitle');
const teacherForm = document.getElementById('teacherForm');
const teacherIdInput = document.getElementById('teacherId');
const teacherFullNameInput = document.getElementById('teacherFullName');
const teacherSubjectSelect = document.getElementById('teacherSubject');
const teacherEmailInput = document.getElementById('teacherEmail');
const teacherClassesInput = document.getElementById('teacherClasses');
const teacherFormSubmitBtn = document.getElementById('teacherFormSubmitBtn');

const payrollModule = document.getElementById('payrollModule');
const payrollTableBody = document.getElementById('payrollTableBody');
const openPayrollModalBtn = document.getElementById('openPayrollModalBtn');
const payrollModal = document.getElementById('payrollModal');
const closePayrollModalBtn = document.getElementById('closePayrollModalBtn');
const payrollForm = document.getElementById('payrollForm');
const payrollPeriodInput = document.getElementById('payrollPeriod');
const staffCountInput = document.getElementById('staffCount');
const totalAmountInput = document.getElementById('totalAmount');

const financeModule = document.getElementById('financeModule');
const financeTableBody = document.getElementById('financeTableBody');
const openAddInvoiceModalBtn = document.getElementById('openAddInvoiceModalBtn');
const addInvoiceModal = document.getElementById('addInvoiceModal');
const closeAddInvoiceModalBtn = document.getElementById('closeAddInvoiceModalBtn');
const addInvoiceForm = document.getElementById('addInvoiceForm');
const invoiceNumberInput = document.getElementById('invoiceNumber');
const invoiceDateInput = document.getElementById('invoiceDate');
const invoiceAmountInput = document.getElementById('invoiceAmount');
const invoiceStatusSelect = document.getElementById('invoiceStatus');

const attendanceModule = document.getElementById('attendanceModule');
const attendanceTableBody = document.getElementById('attendanceTableBody');
const attendanceStudentNameFilter = document.getElementById('attendanceStudentNameFilter');
const attendanceClassFilter = document.getElementById('attendanceClassFilter');
const attendanceDateFilter = document.getElementById('attendanceDateFilter');
const applyAttendanceFilter = document.getElementById('applyAttendanceFilter');
const attendanceTotalStudents = document.getElementById('attendanceTotalStudents');
const attendanceTotalPresent = document.getElementById('attendanceTotalPresent');
const attendanceTotalAbsent = document.getElementById('attendanceTotalAbsent');
const attendanceModal = document.getElementById('attendanceModal');
const closeAttendanceModal = document.getElementById('closeAttendanceModal');
const attendanceForm = document.getElementById('attendanceForm');
const attendanceIdInput = document.getElementById('attendanceId');
const attendanceStudentSelect = document.getElementById('attendanceStudentSelect');
const attendanceDateInput = document.getElementById('attendanceDate');
const attendanceStatusSelect = document.getElementById('attendanceStatus');
const attendanceRemarksTextarea = document.getElementById('attendanceRemarks');
const registerStudentFingerprintBtn = document.getElementById('registerStudentFingerprintBtn');
const verifyStudentFingerprintBtn = document.getElementById('verifyStudentFingerprintBtn');
const attendanceFormSubmitBtn = document.getElementById('attendanceFormSubmitBtn');

const teacherAttendanceModule = document.getElementById('teacher-attendanceModule');
const teacherAttendanceTableBody = document.getElementById('teacherAttendanceTableBody');
const teacherAttendanceNameFilter = document.getElementById('teacherAttendanceNameFilter');
const teacherAttendanceSubjectFilter = document.getElementById('teacherAttendanceSubjectFilter');
const teacherAttendanceDateFilter = document.getElementById('teacherAttendanceDateFilter');
const applyTeacherAttendanceFilter = document.getElementById('applyTeacherAttendanceFilter');
const teacherAttendanceTotalTeachers = document.getElementById('teacherAttendanceTotalTeachers');
const teacherAttendanceTotalPresent = document.getElementById('teacherAttendanceTotalPresent');
const teacherAttendanceTotalAbsent = document.getElementById('teacherAttendanceTotalAbsent');
const teacherAttendanceModal = document.getElementById('teacherAttendanceModal');
const closeTeacherAttendanceModal = document.getElementById('closeTeacherAttendanceModal');
const teacherAttendanceForm = document.getElementById('teacherAttendanceForm');
const teacherAttendanceIdInput = document.getElementById('teacherAttendanceId');
const teacherAttendanceTeacherSelect = document.getElementById('teacherAttendanceTeacherSelect');
const teacherAttendanceDateInput = document.getElementById('teacherAttendanceDate');
const teacherAttendanceStatusSelect = document.getElementById('teacherAttendanceStatus');
const teacherAttendanceRemarksTextarea = document.getElementById('teacherAttendanceRemarks');
const registerTeacherFingerprintBtn = document.getElementById('registerTeacherFingerprintBtn');
const verifyTeacherFingerprintBtn = document.getElementById('verifyTeacherFingerprintBtn');
const teacherAttendanceFormSubmitBtn = document.getElementById('teacherAttendanceFormSubmitBtn');

const calendarModule = document.getElementById('calendarModule');
const fullCalendarEl = document.getElementById('calendar-full');
const holidayList = document.getElementById('holidayList');

const reportsModule = document.getElementById('reportsModule');
let attendanceChart;
let performanceChart;

// --- Utility Functions ---

/**
 * Displays a toast notification.
 * @param {string} message - The message to display.
 * @param {string} type - 'success', 'error', 'info', 'warning'.
 */
function showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toast-container') || (() => {
        const div = document.createElement('div');
        div.id = 'toast-container';
        div.className = 'fixed bottom-4 right-4 z-[1000] space-y-2';
        document.body.appendChild(div);
        return div;
    })();

    const toast = document.createElement('div');
    toast.className = `p-3 rounded-lg shadow-md text-white flex items-center space-x-2 animate-slideIn`;

    switch (type) {
        case 'success':
            toast.classList.add('bg-green-500');
            toast.innerHTML = `<i class="fas fa-check-circle"></i> <span>${message}</span>`;
            break;
        case 'error':
            toast.classList.add('bg-red-500');
            toast.innerHTML = `<i class="fas fa-times-circle"></i> <span>${message}</span>`;
            break;
        case 'warning':
            toast.classList.add('bg-yellow-500');
            toast.innerHTML = `<i class="fas fa-exclamation-triangle"></i> <span>${message}</span>`;
            break;
        case 'info':
        default:
            toast.classList.add('bg-blue-500');
            toast.innerHTML = `<i class="fas fa-info-circle"></i> <span>${message}</span>`;
            break;
    }

    toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('animate-slideOut');
        toast.addEventListener('animationend', () => toast.remove());
    }, 3000);
}

/**
 * Simulates typing effect for welcome message.
 */
function typeWelcomeMessage() {
    if (typedWelcomeIndex < typedWelcomeText.length) {
        document.getElementById('typed-welcome').textContent += typedWelcomeText.charAt(typedWelcomeIndex);
        typedWelcomeIndex++;
        setTimeout(typeWelcomeMessage, typingSpeed);
    }
}

/**
 * Toggles dark mode.
 */
function toggleDarkMode() {
    isDarkMode = !isDarkMode;
    document.documentElement.classList.toggle('dark', isDarkMode);
    localStorage.setItem('darkMode', isDarkMode);
    updateDarkModeIcon();
}

/**
 * Updates the dark mode toggle icon based on current mode.
 */
function updateDarkModeIcon() {
    const icon = darkModeToggle.querySelector('i');
    if (isDarkMode) {
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
        icon.classList.add('text-yellow-500'); // Sun icon color
        icon.classList.remove('text-gray-600');
    } else {
        icon.classList.remove('fa-sun');
        icon.classList.remove('text-yellow-500');
        icon.classList.add('fa-moon');
        icon.classList.add('text-gray-600'); // Moon icon color
    }
}

/**
 * Sets the current active module in the UI.
 * @param {string} moduleName - The name of the module to activate.
 */
function setActiveModule(moduleName) {
    // Update sidebar active state
    sidebarNavItems.forEach(item => {
        if (item.dataset.module === moduleName) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });

    // Update tabs active state
    Array.from(moduleTabs.children).forEach(tab => {
        if (tab.dataset.tab === moduleName) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });

    // Hide all module content and show the selected one
    Array.from(modulesContainer.children).forEach(moduleDiv => {
        if (moduleDiv.id === `${moduleName}Module`) {
            moduleDiv.classList.remove('hidden');
        } else {
            moduleDiv.classList.add('hidden');
        }
    });

    // Special handling for dashboard
    if (moduleName === 'dashboard') {
        dashboardMainContent.classList.remove('hidden');
        modulesContainer.classList.add('hidden');
    } else {
        dashboardMainContent.classList.add('hidden');
        modulesContainer.classList.remove('hidden');
    }

    // Update module title
    currentModuleTitle.textContent = moduleName.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

    // Trigger specific module load functions if they exist
    switch (moduleName) {
        case 'profile':
            loadProfileData();
            break;
        case 'user-management':
            loadUsers();
            break;
        case 'announcements':
            loadAnnouncements();
            break;
        case 'students':
            loadStudents();
            break;
        case 'teachers':
            loadTeachers();
            break;
        case 'payroll':
            loadPayrollEntries();
            break;
        case 'finance':
            loadInvoices();
            break;
        case 'attendance':
            loadAttendanceRecords();
            loadStudentsForAttendanceSelect();
            break;
        case 'teacher-attendance':
            loadTeacherAttendanceRecords();
            loadTeachersForTeacherAttendanceSelect();
            break;
        case 'calendar':
            loadCalendarEvents();
            loadUpcomingHolidays();
            break;
        case 'reports':
            loadReportsData();
            break;
        case 'audit-logs':
            loadAuditLogs();
            break;
        case 'backup-restore':
            loadBackupHistory();
            break;
        case 'system-settings':
            loadSystemSettings();
            break;
        // No default needed, dashboard is handled above
    }
}

/**
 * Handles navigation clicks (sidebar and tabs).
 * @param {Event} event
 */
function handleNavigationClick(event) {
    event.preventDefault();
    const moduleName = event.currentTarget.dataset.module || event.currentTarget.dataset.tab;
    if (moduleName) {
        setActiveModule(moduleName);
        // Update URL hash for direct access/bookmarking
        window.location.hash = moduleName;
    }
}

/**
 * Initializes FullCalendar.
 */
function initializeFullCalendar() {
    const calendarEl = document.getElementById('calendar'); // Dashboard calendar
    const fullCalendarEl = document.getElementById('calendar-full'); // Dedicated calendar module

    if (calendarEl) {
        new FullCalendar.Calendar(calendarEl, {
            initialView: 'dayGridMonth',
            headerToolbar: {
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay'
            },
            events: [], // Events will be loaded dynamically
            height: 'auto'
        }).render();
    }

    if (fullCalendarEl) {
        new FullCalendar.Calendar(fullCalendarEl, {
            initialView: 'dayGridMonth',
            headerToolbar: {
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay'
            },
            editable: true, // Allow dragging/resizing events
            selectable: true, // Allow selecting dates
            events: [], // Events will be loaded dynamically
            eventClick: function(info) {
                // Handle event click (e.g., show event details modal)
                showToast(`Event: ${info.event.title} on ${info.event.start.toLocaleDateString()}`, 'info');
            },
            dateClick: function(info) {
                // Handle date click (e.g., add new event modal)
                showToast(`Clicked on: ${info.dateStr}`, 'info');
            },
            eventDrop: function(info) {
                // Handle event drag-and-drop (update event in DB)
                showToast(`Event moved to ${info.event.start.toLocaleDateString()}`, 'success');
                // TODO: Update event in Supabase
            },
            eventResize: function(info) {
                // Handle event resize (update event in DB)
                showToast(`Event resized`, 'success');
                // TODO: Update event in Supabase
            }
        }).render();
    }
}

/**
 * Initializes Chart.js for reports.
 */
function initializeCharts() {
    const attendanceCtx = document.getElementById('attendanceChart');
    const performanceCtx = document.getElementById('performanceChart');

    if (attendanceCtx) {
        attendanceChart = new Chart(attendanceCtx, {
            type: 'bar',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'Student Attendance (%)',
                    data: [90, 85, 92, 88, 95, 91],
                    backgroundColor: 'rgba(75, 192, 192, 0.6)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100
                    }
                }
            }
        });
    }

    if (performanceCtx) {
        performanceChart = new Chart(performanceCtx, {
            type: 'line',
            data: {
                labels: ['Term 1', 'Term 2', 'Term 3'],
                datasets: [{
                    label: 'Average Exam Score',
                    data: [75, 80, 82],
                    backgroundColor: 'rgba(153, 102, 255, 0.6)',
                    borderColor: 'rgba(153, 102, 255, 1)',
                    borderWidth: 1,
                    fill: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100
                    }
                }
            }
        });
    }
}

// --- Supabase Authentication and User Management ---

/**
 * Handles user login.
 * @param {Event} event
 */
async function handleLogin(event) {
    event.preventDefault();
    const email = emailInput.value;
    const password = passwordInput.value;
    const role = selectedRoleInput.value;

    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        });

        if (error) throw error;

        // Verify user role after successful login
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', data.user.id)
            .single();

        if (profileError) throw profileError;

        if (profile.role !== role) {
            await supabase.auth.signOut(); // Log out if role doesn't match
            showToast('Login failed: Invalid role for this account.', 'error');
            return;
        }

        loggedInUser = data.user;
        currentRole = profile.role; // Set the actual role from the profile
        showToast(`Logged in as ${profile.role}!`, 'success');
        showSchoolSite();
        updateLoggedInUserUI();
        setActiveModule('dashboard'); // Load dashboard after login

    } catch (error) {
        showToast(`Login failed: ${error.message}`, 'error');
        console.error('Login error:', error.message);
    }
}

/**
 * Handles user logout.
 */
async function handleLogout() {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        loggedInUser = null;
        showToast('Logged out successfully!', 'info');
        showLoginUI();
    } catch (error) {
        showToast(`Logout failed: ${error.message}`, 'error');
        console.error('Logout error:', error.message);
    }
}

/**
 * Handles forgot password request.
 * @param {Event} event
 */
async function handleForgotPassword(event) {
    event.preventDefault();
    const email = document.getElementById('forgotEmail').value;

    try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/update-password.html`, // Or a specific password reset page
        });

        if (error) throw error;

        showToast('Password reset link sent to your email!', 'success');
        forgotPasswordModal.classList.add('hidden');
    } catch (error) {
        showToast(`Failed to send reset link: ${error.message}`, 'error');
        console.error('Forgot password error:', error.message);
    }
}

/**
 * Checks if a user is currently logged in and updates UI.
 */
async function checkUserSession() {
    const { data: { session }, error } = await supabase.auth.getSession();

    if (session) {
        loggedInUser = session.user;
        // Fetch user profile to get the role
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', loggedInUser.id)
            .single();

        if (profileError) {
            console.error('Error fetching user profile:', profileError.message);
            await supabase.auth.signOut(); // Log out if profile can't be fetched
            showLoginUI();
            return;
        }

        currentRole = profile.role;
        showSchoolSite();
        updateLoggedInUserUI();
        // Determine initial module based on hash or default to dashboard
        const initialModule = window.location.hash ? window.location.hash.substring(1) : 'dashboard';
        setActiveModule(initialModule);
    } else {
        showLoginUI();
    }
}

/**
 * Updates the UI with logged-in user's name and role.
 */
function updateLoggedInUserUI() {
    if (loggedInUser) {
        loggedInUserName.textContent = loggedInUser.email.split('@')[0]; // Display username from email
        // You might want to fetch the full name from the 'profiles' table
        // For now, using email part.
    }
}

// --- UI State Management ---

/**
 * Shows the login UI and hides the school site UI.
 */
function showLoginUI() {
    loginUI.classList.remove('hidden');
    schoolSiteUI.classList.add('hidden');
    emailInput.value = '';
    passwordInput.value = '';
    typedWelcomeIndex = 0;
    document.getElementById('typed-welcome').textContent = '';
    typeWelcomeMessage();
}

/**
 * Shows the school site UI and hides the login UI.
 */
function showSchoolSite() {
    loginUI.classList.add('hidden');
    schoolSiteUI.classList.remove('hidden');
}

// --- Data Fetching and Display (Supabase Integration) ---

/**
 * Fetches and displays dashboard statistics.
 */
async function loadDashboardStats() {
    try {
        // Total Students
        const { count: studentsCount, error: studentsError } = await supabase
            .from('students')
            .select('*', { count: 'exact' });
        if (studentsError) throw studentsError;
        totalStudentsCount.textContent = studentsCount;

        // Total Teachers
        const { count: teachersCount, error: teachersError } = await supabase
            .from('teachers')
            .select('*', { count: 'exact' });
        if (teachersError) throw teachersError;
        totalTeachersCount.textContent = teachersCount;

        // Monthly Revenue (Example: Sum of 'Paid' invoices for current month)
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString();
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString();

        const { data: invoices, error: invoicesError } = await supabase
            .from('finance')
            .select('amount')
            .eq('status', 'Paid')
            .gte('invoice_date', startOfMonth)
            .lte('invoice_date', endOfMonth);

        if (invoicesError) throw invoicesError;
        const totalRevenue = invoices.reduce((sum, invoice) => sum + invoice.amount, 0);
        monthlyRevenue.textContent = `$${totalRevenue.toFixed(2)}`;

        // Upcoming Events (Example: Events from 'calendar_events' table in the next 30 days)
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(today.getDate() + 30);

        const { count: eventsCount, error: eventsError } = await supabase
            .from('calendar_events')
            .select('*', { count: 'exact' })
            .gte('start_date', today.toISOString())
            .lte('start_date', thirtyDaysFromNow.toISOString());

        if (eventsError) throw eventsError;
        upcomingEventsCount.textContent = eventsCount;

    } catch (error) {
        console.error('Error loading dashboard stats:', error.message);
        showToast('Failed to load dashboard statistics.', 'error');
    }
}

/**
 * Fetches and displays recent activity.
 */
async function loadRecentActivity() {
    try {
        const { data, error } = await supabase
            .from('audit_logs') // Assuming audit_logs can serve as recent activity
            .select('timestamp, user_email, action, details')
            .order('timestamp', { ascending: false })
            .limit(5); // Get latest 5 activities

        if (error) throw error;

        recentActivityList.innerHTML = ''; // Clear previous entries
        if (data.length === 0) {
            recentActivityList.innerHTML = '<p class="text-gray-500">No recent activity.</p>';
            return;
        }

        data.forEach(activity => {
            const activityItem = document.createElement('div');
            activityItem.className = 'flex items-center space-x-3 p-3 bg-gray-50 rounded-lg';
            activityItem.innerHTML = `
                <div class="icon-wrapper bg-blue-100 text-blue-600 text-sm">
                    <i class="fas fa-info"></i>
                </div>
                <div>
                    <p class="text-sm font-medium">${activity.action} by ${activity.user_email}</p>
                    <p class="text-xs text-gray-500">${activity.details} - ${new Date(activity.timestamp).toLocaleString()}</p>
                </div>
            `;
            recentActivityList.appendChild(activityItem);
        });

    } catch (error) {
        console.error('Error loading recent activity:', error.message);
        showToast('Failed to load recent activity.', 'error');
    }
}

/**
 * Loads user profile data into the form.
 */
async function loadProfileData() {
    if (!loggedInUser) return;

    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', loggedInUser.id)
            .single();

        if (error) throw error;

        fullNameInput.value = data.full_name || '';
        profileEmailInput.value = data.email || '';
        roleSelect.value = data.role || '';
        phoneInput.value = data.phone || '';
        addressTextarea.value = data.address || '';
        if (data.avatar_url) {
            profilePicturePreview.src = data.avatar_url;
        } else {
            profilePicturePreview.src = "https://via.placeholder.com/96/cccccc/ffffff?text=User";
        }

    } catch (error) {
        console.error('Error loading profile data:', error.message);
        showToast('Failed to load profile data.', 'error');
    }
}

/**
 * Handles profile form submission (saving changes).
 * @param {Event} event
 */
async function saveProfileChanges(event) {
    event.preventDefault();
    if (!loggedInUser) return;

    const updates = {
        full_name: fullNameInput.value,
        email: profileEmailInput.value,
        role: roleSelect.value,
        phone: phoneInput.value,
        address: addressTextarea.value,
        updated_at: new Date().toISOString(),
    };

    try {
        // Handle profile picture upload if a new one is selected
        if (profilePictureInput.files.length > 0) {
            const file = profilePictureInput.files[0];
            const filePath = `${loggedInUser.id}/${Date.now()}_${file.name}`;
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('avatars') // Ensure you have a storage bucket named 'avatars'
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: publicUrlData } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            updates.avatar_url = publicUrlData.publicUrl;
        }

        const { error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', loggedInUser.id);

        if (error) throw error;

        showToast('Profile updated successfully!', 'success');
        loadProfileData(); // Reload to reflect changes
    } catch (error) {
        console.error('Error saving profile:', error.message);
        showToast(`Failed to save profile: ${error.message}`, 'error');
    }
}

/**
 * Loads users for User Management module.
 */
async function loadUsers() {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        userTableBody.innerHTML = '';
        if (data.length === 0) {
            userTableBody.innerHTML = '<tr><td colspan="6" class="text-center py-4 text-gray-500">No users found.</td></tr>';
            return;
        }

        data.forEach(user => {
            const row = userTableBody.insertRow();
            row.className = 'border-b hover:bg-gray-50';
            row.innerHTML = `
                <td class="py-3 px-4">${user.id.substring(0, 8)}...</td>
                <td class="py-3 px-4">${user.full_name || 'N/A'}</td>
                <td class="py-3 px-4">${user.email}</td>
                <td class="py-3 px-4">${user.role}</td>
                <td class="py-3 px-4">
                    <span class="px-2 py-1 rounded-full text-xs font-semibold ${user.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                        ${user.status}
                    </span>
                </td>
                <td class="py-3 px-4">
                    <button class="text-blue-600 hover:text-blue-800 mr-3" title="Edit User" onclick="editUser('${user.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="text-red-600 hover:text-red-800" title="Delete User" onclick="deleteUser('${user.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
        });
    } catch (error) {
        console.error('Error loading users:', error.message);
        showToast('Failed to load users.', 'error');
    }
}

/**
 * Shows the add/edit user modal.
 * @param {string} [userId] - Optional user ID for editing.
 */
async function showAddUserForm(userId = null) {
    userForm.reset();
    userIdInput.value = '';
    userPasswordInput.placeholder = 'Leave blank to keep current password';
    userPasswordInput.required = true; // Required for new user

    if (userId) {
        userModalTitle.textContent = 'Edit User';
        userFormSubmitBtn.textContent = 'Save Changes';
        userPasswordInput.required = false; // Not required for edit

        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) throw error;

            userIdInput.value = data.id;
            userFullNameInput.value = data.full_name || '';
            userEmailInput.value = data.email;
            userRoleSelect.value = data.role;
            userStatusSelect.value = data.status;

        } catch (error) {
            console.error('Error fetching user for edit:', error.message);
            showToast('Failed to load user data for editing.', 'error');
            return;
        }
    } else {
        userModalTitle.textContent = 'Add New User';
        userFormSubmitBtn.textContent = 'Add User';
    }
    userModal.classList.remove('hidden');
}

/**
 * Handles add/edit user form submission.
 * @param {Event} event
 */
async function handleUserFormSubmit(event) {
    event.preventDefault();
    const id = userIdInput.value;
    const fullName = userFullNameInput.value;
    const email = userEmailInput.value;
    const role = userRoleSelect.value;
    const password = userPasswordInput.value;
    const status = userStatusSelect.value;

    try {
        if (id) {
            // Update existing user
            const updates = {
                full_name: fullName,
                email: email,
                role: role,
                status: status,
                updated_at: new Date().toISOString(),
            };
            if (password) {
                // Supabase doesn't allow updating user password directly from client-side update()
                // You'd typically use a server-side function or a password reset flow for this.
                // For simplicity in this example, we'll just show a toast.
                showToast('Password cannot be updated directly from this form. Use password reset.', 'warning');
            }

            const { error } = await supabase
                .from('profiles')
                .update(updates)
                .eq('id', id);

            if (error) throw error;
            showToast('User updated successfully!', 'success');

        } else {
            // Add new user (requires admin privileges or RLS setup)
            // For security, user creation with password should ideally be done via a server-side function
            // or a signup flow. This client-side example assumes RLS allows it or it's for internal admin use.
            const { data, error } = await supabase.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: {
                        full_name: fullName,
                        role: role,
                        status: status,
                    }
                }
            });

            if (error) throw error;
            showToast('User added successfully! An email verification might be sent.', 'success');
        }

        userModal.classList.add('hidden');
        loadUsers(); // Reload user list
    } catch (error) {
        console.error('Error saving user:', error.message);
        showToast(`Failed to save user: ${error.message}`, 'error');
    }
}

/**
 * Deletes a user.
 * @param {string} userId
 */
async function deleteUser(userId) {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
        return;
    }

    try {
        // Deleting a user from 'auth.users' table requires service_role key or a server-side function.
        // Client-side, you can only delete the profile entry and mark the auth user as inactive.
        // For a full user deletion, implement a Supabase Edge Function.
        const { error: profileError } = await supabase
            .from('profiles')
            .delete()
            .eq('id', userId);

        if (profileError) throw profileError;

        showToast('User profile deleted. Note: Actual authentication user might still exist unless handled by RLS or server function.', 'success');
        loadUsers();
    } catch (error) {
        console.error('Error deleting user:', error.message);
        showToast(`Failed to delete user: ${error.message}`, 'error');
    }
}

/**
 * Loads system settings.
 */
async function loadSystemSettings() {
    try {
        const { data, error } = await supabase
            .from('system_settings')
            .select('*')
            .single(); // Assuming only one row for system settings

        if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found
            throw error;
        }

        if (data) {
            schoolNameInput.value = data.school_name || '';
            schoolAddressInput.value = data.school_address || '';
            contactEmailInput.value = data.contact_email || '';
            contactPhoneInput.value = data.contact_phone || '';
            smtpHostInput.value = data.smtp_host || '';
            smtpPortInput.value = data.smtp_port || '';
            smtpUsernameInput.value = data.smtp_username || '';
            smtpPasswordInput.value = data.smtp_password || ''; // Should be masked or not loaded directly
        } else {
            // Initialize with default values if no settings found
            schoolNameInput.value = 'Tapowan Public School';
            schoolAddressInput.value = '123 Education Lane, School City';
            contactEmailInput.value = 'info@tps.com';
            contactPhoneInput.value = '+1 (555) 123-4567';
            smtpHostInput.value = 'smtp.example.com';
            smtpPortInput.value = '587';
            smtpUsernameInput.value = 'noreply@schoolpulse.com';
            smtpPasswordInput.value = '********';
        }
    } catch (error) {
        console.error('Error loading system settings:', error.message);
        showToast('Failed to load system settings.', 'error');
    }
}

/**
 * Handles system settings form submission.
 * @param {Event} event
 */
async function saveSystemSettings(event) {
    event.preventDefault();

    const settings = {
        school_name: schoolNameInput.value,
        school_address: schoolAddressInput.value,
        contact_email: contactEmailInput.value,
        contact_phone: contactPhoneInput.value,
        smtp_host: smtpHostInput.value,
        smtp_port: smtpPortInput.value,
        smtp_username: smtpUsernameInput.value,
        // smtp_password should not be sent back directly if it's sensitive
        // For this example, we'll include it, but in production, handle securely.
        smtp_password: smtpPasswordInput.value,
        updated_at: new Date().toISOString(),
    };

    try {
        // Check if settings exist, then update or insert
        const { data: existingSettings, error: fetchError } = await supabase
            .from('system_settings')
            .select('id')
            .single();

        if (fetchError && fetchError.code !== 'PGRST116') {
            throw fetchError;
        }

        if (existingSettings) {
            const { error } = await supabase
                .from('system_settings')
                .update(settings)
                .eq('id', existingSettings.id);
            if (error) throw error;
        } else {
            const { error } = await supabase
                .from('system_settings')
                .insert([settings]);
            if (error) throw error;
        }

        showToast('System settings saved successfully!', 'success');
    } catch (error) {
        console.error('Error saving system settings:', error.message);
        showToast(`Failed to save system settings: ${error.message}`, 'error');
    }
}

/**
 * Loads audit logs.
 */
async function loadAuditLogs() {
    try {
        const { data, error } = await supabase
            .from('audit_logs')
            .select('*')
            .order('timestamp', { ascending: false });

        if (error) throw error;

        auditLogTableBody.innerHTML = '';
        if (data.length === 0) {
            auditLogTableBody.innerHTML = '<tr><td colspan="5" class="text-center py-4 text-gray-500">No audit logs found.</td></tr>';
            return;
        }

        data.forEach(log => {
            const row = auditLogTableBody.insertRow();
            row.className = 'border-b hover:bg-gray-50';
            row.innerHTML = `
                <td class="py-3 px-4">${new Date(log.timestamp).toLocaleString()}</td>
                <td class="py-3 px-4">${log.user_email || 'System'}</td>
                <td class="py-3 px-4">${log.action}</td>
                <td class="py-3 px-4">${log.module}</td>
                <td class="py-3 px-4">${log.details}</td>
            `;
        });
    } catch (error) {
        console.error('Error loading audit logs:', error.message);
        showToast('Failed to load audit logs.', 'error');
    }
}

/**
 * Loads backup history.
 */
async function loadBackupHistory() {
    try {
        const { data, error } = await supabase
            .from('backups') // Assuming a 'backups' table
            .select('*')
            .order('backup_date', { ascending: false });

        if (error) throw error;

        backupTableBody.innerHTML = '';
        if (data.length === 0) {
            backupTableBody.innerHTML = '<tr><td colspan="5" class="text-center py-4 text-gray-500">No backup history found.</td></tr>';
            return;
        }

        data.forEach(backup => {
            const row = backupTableBody.insertRow();
            row.className = 'border-b hover:bg-gray-50';
            row.innerHTML = `
                <td class="py-3 px-4">${backup.id.substring(0, 8)}...</td>
                <td class="py-3 px-4">${new Date(backup.backup_date).toLocaleString()}</td>
                <td class="py-3 px-4">${(backup.size_mb || 0).toFixed(2)} MB</td>
                <td class="py-3 px-4">${backup.type || 'Manual'}</td>
                <td class="py-3 px-4">
                    <button class="text-green-600 hover:text-green-800 mr-3" title="Download Backup" onclick="downloadBackup('${backup.file_url}')">
                        <i class="fas fa-download"></i>
                    </button>
                    <button class="text-red-600 hover:text-red-800" title="Delete Backup" onclick="deleteBackup('${backup.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
        });
    } catch (error) {
        console.error('Error loading backup history:', error.message);
        showToast('Failed to load backup history.', 'error');
    }
}

/**
 * Placeholder for downloading a backup.
 * @param {string} fileUrl
 */
function downloadBackup(fileUrl) {
    window.open(fileUrl, '_blank');
    showToast('Downloading backup...', 'info');
}

/**
 * Placeholder for deleting a backup.
 * @param {string} backupId
 */
async function deleteBackup(backupId) {
    if (!confirm('Are you sure you want to delete this backup record?')) {
        return;
    }
    try {
        const { error } = await supabase
            .from('backups')
            .delete()
            .eq('id', backupId);
        if (error) throw error;
        showToast('Backup record deleted successfully!', 'success');
        loadBackupHistory();
    } catch (error) {
        console.error('Error deleting backup:', error.message);
        showToast(`Failed to delete backup: ${error.message}`, 'error');
    }
}

/**
 * Loads announcements.
 */
async function loadAnnouncements() {
    try {
        const { data, error } = await supabase
            .from('announcements')
            .select('*')
            .order('date_posted', { ascending: false });

        if (error) throw error;

        announcementTableBody.innerHTML = '';
        if (data.length === 0) {
            announcementTableBody.innerHTML = '<tr><td colspan="5" class="text-center py-4 text-gray-500">No announcements found.</td></tr>';
            return;
        }

        data.forEach(announcement => {
            const row = announcementTableBody.insertRow();
            row.className = 'border-b hover:bg-gray-50';
            row.innerHTML = `
                <td class="py-3 px-4">${announcement.title}</td>
                <td class="py-3 px-4">${announcement.content.substring(0, 50)}...</td>
                <td class="py-3 px-4">${new Date(announcement.date_posted).toLocaleDateString()}</td>
                <td class="py-3 px-4">
                    <span class="px-2 py-1 rounded-full text-xs font-semibold ${announcement.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}">
                        ${announcement.status}
                    </span>
                </td>
                <td class="py-3 px-4">
                    <button class="text-blue-600 hover:text-blue-800 mr-3" title="Edit Announcement" onclick="editAnnouncement('${announcement.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="text-red-600 hover:text-red-800" title="Delete Announcement" onclick="deleteAnnouncement('${announcement.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
        });
    } catch (error) {
        console.error('Error loading announcements:', error.message);
        showToast('Failed to load announcements.', 'error');
    }
}

/**
 * Shows the add/edit announcement modal.
 * @param {string} [announcementId] - Optional announcement ID for editing.
 */
async function showAddAnnouncementModal(announcementId = null) {
    announcementForm.reset();
    announcementIdInput.value = '';

    if (announcementId) {
        announcementModalTitle.textContent = 'Edit Announcement';
        announcementFormSubmitBtn.textContent = 'Save Changes';

        try {
            const { data, error } = await supabase
                .from('announcements')
                .select('*')
                .eq('id', announcementId)
                .single();

            if (error) throw error;

            announcementIdInput.value = data.id;
            announcementTitleInput.value = data.title;
            announcementContentTextarea.value = data.content;
            announcementStatusSelect.value = data.status;

        } catch (error) {
            console.error('Error fetching announcement for edit:', error.message);
            showToast('Failed to load announcement data for editing.', 'error');
            return;
        }
    } else {
        announcementModalTitle.textContent = 'Add New Announcement';
        announcementFormSubmitBtn.textContent = 'Publish Announcement';
    }
    announcementModal.classList.remove('hidden');
}

/**
 * Handles add/edit announcement form submission.
 * @param {Event} event
 */
async function handleAnnouncementFormSubmit(event) {
    event.preventDefault();
    const id = announcementIdInput.value;
    const title = announcementTitleInput.value;
    const content = announcementContentTextarea.value;
    const status = announcementStatusSelect.value;

    try {
        if (id) {
            // Update existing announcement
            const { error } = await supabase
                .from('announcements')
                .update({ title, content, status, updated_at: new Date().toISOString() })
                .eq('id', id);

            if (error) throw error;
            showToast('Announcement updated successfully!', 'success');

        } else {
            // Add new announcement
            const { error } = await supabase
                .from('announcements')
                .insert([{ title, content, status, date_posted: new Date().toISOString() }]);

            if (error) throw error;
            showToast('Announcement published successfully!', 'success');
        }

        announcementModal.classList.add('hidden');
        loadAnnouncements(); // Reload announcements list
    } catch (error) {
        console.error('Error saving announcement:', error.message);
        showToast(`Failed to save announcement: ${error.message}`, 'error');
    }
}

/**
 * Deletes an announcement.
 * @param {string} announcementId
 */
async function deleteAnnouncement(announcementId) {
    if (!confirm('Are you sure you want to delete this announcement?')) {
        return;
    }
    try {
        const { error } = await supabase
            .from('announcements')
            .delete()
            .eq('id', announcementId);
        if (error) throw error;
        showToast('Announcement deleted successfully!', 'success');
        loadAnnouncements();
    } catch (error) {
        console.error('Error deleting announcement:', error.message);
        showToast(`Failed to delete announcement: ${error.message}`, 'error');
    }
}

/**
 * Loads students for Students Management module.
 */
async function loadStudents() {
    try {
        let query = supabase.from('students').select('*');

        const searchRoll = searchRollInput.value.trim();
        const searchClass = searchClassSelect.value;

        if (searchRoll) {
            query = query.ilike('roll_no', `%${searchRoll}%`);
        }
        if (searchClass) {
            query = query.eq('class', searchClass);
        }

        const { data, error } = await query.order('full_name', { ascending: true });

        if (error) throw error;

        studentTableBody.innerHTML = '';
        if (data.length === 0) {
            studentTableBody.innerHTML = '<tr><td colspan="9" class="text-center py-4 text-gray-500">No students found.</td></tr>';
            return;
        }

        data.forEach(student => {
            const row = studentTableBody.insertRow();
            row.className = 'border-b hover:bg-gray-50';
            row.innerHTML = `
                <td class="py-3 px-4">${student.id.substring(0, 8)}...</td>
                <td class="py-3 px-4">${student.full_name}</td>
                <td class="py-3 px-4">${student.father_name || 'N/A'}</td>
                <td class="py-3 px-4">${student.mother_name || 'N/A'}</td>
                <td class="py-3 px-4">${student.class}</td>
                <td class="py-3 px-4">${student.roll_no}</td>
                <td class="py-3 px-4">${student.aadhar_no || 'N/A'}</td>
                <td class="py-3 px-4">
                    <span class="px-2 py-1 rounded-full text-xs font-semibold ${student.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                        ${student.status}
                    </span>
                </td>
                <td class="py-3 px-4">
                    <button class="text-blue-600 hover:text-blue-800 mr-3" title="Edit Student" onclick="editStudent('${student.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="text-red-600 hover:text-red-800" title="Delete Student" onclick="deleteStudent('${student.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
        });
    } catch (error) {
        console.error('Error loading students:', error.message);
        showToast('Failed to load students.', 'error');
    }
}

/**
 * Shows the add/edit student modal.
 * @param {string} [studentId] - Optional student ID for editing.
 */
async function showAddStudentForm(studentId = null) {
    studentForm.reset();
    studentIdInput.value = '';

    if (studentId) {
        studentModalTitle.textContent = 'Edit Student';
        studentFormSubmitBtn.textContent = 'Save Changes';

        try {
            const { data, error } = await supabase
                .from('students')
                .select('*')
                .eq('id', studentId)
                .single();

            if (error) throw error;

            studentIdInput.value = data.id;
            studentFullNameInput.value = data.full_name;
            studentFatherNameInput.value = data.father_name || '';
            studentMotherNameInput.value = data.mother_name || '';
            studentClassSelect.value = data.class;
            studentRollNoInput.value = data.roll_no;
            studentAadharNoInput.value = data.aadhar_no || '';
            studentEmailInput.value = data.email || '';
            studentPhoneInput.value = data.phone || '';
            studentStatusSelect.value = data.status;

        } catch (error) {
            console.error('Error fetching student for edit:', error.message);
            showToast('Failed to load student data for editing.', 'error');
            return;
        }
    } else {
        studentModalTitle.textContent = 'Add New Student';
        studentFormSubmitBtn.textContent = 'Add Student';
    }
    studentModal.classList.remove('hidden');
}

/**
 * Handles add/edit student form submission.
 * @param {Event} event
 */
async function handleStudentFormSubmit(event) {
    event.preventDefault();
    const id = studentIdInput.value;
    const studentData = {
        full_name: studentFullNameInput.value,
        father_name: studentFatherNameInput.value,
        mother_name: studentMotherNameInput.value,
        class: studentClassSelect.value,
        roll_no: studentRollNoInput.value,
        aadhar_no: studentAadharNoInput.value,
        email: studentEmailInput.value,
        phone: studentPhoneInput.value,
        status: studentStatusSelect.value,
    };

    try {
        if (id) {
            // Update existing student
            const { error } = await supabase
                .from('students')
                .update({ ...studentData, updated_at: new Date().toISOString() })
                .eq('id', id);

            if (error) throw error;
            showToast('Student updated successfully!', 'success');

        } else {
            // Add new student
            const { error } = await supabase
                .from('students')
                .insert([{ ...studentData, created_at: new Date().toISOString() }]);

            if (error) throw error;
            showToast('Student added successfully!', 'success');
        }

        studentModal.classList.add('hidden');
        loadStudents(); // Reload students list
    } catch (error) {
        console.error('Error saving student:', error.message);
        showToast(`Failed to save student: ${error.message}`, 'error');
    }
}

/**
 * Deletes a student.
 * @param {string} studentId
 */
async function deleteStudent(studentId) {
    if (!confirm('Are you sure you want to delete this student?')) {
        return;
    }
    try {
        const { error } = await supabase
            .from('students')
            .delete()
            .eq('id', studentId);
        if (error) throw error;
        showToast('Student deleted successfully!', 'success');
        loadStudents();
    } catch (error) {
        console.error('Error deleting student:', error.message);
        showToast(`Failed to delete student: ${error.message}`, 'error');
    }
}

/**
 * Exports student data to Excel.
 */
async function exportStudentsToExcel() {
    try {
        const { data, error } = await supabase
            .from('students')
            .select('*')
            .order('full_name', { ascending: true });

        if (error) throw error;

        if (data.length === 0) {
            showToast('No student data to export.', 'info');
            return;
        }

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Students");
        XLSX.writeFile(wb, "Students_Data.xlsx");
        showToast('Student data exported to Excel!', 'success');

    } catch (error) {
        console.error('Error exporting students:', error.message);
        showToast('Failed to export student data.', 'error');
    }
}

/**
 * Loads teachers for Teachers Management module.
 */
async function loadTeachers() {
    try {
        const { data, error } = await supabase
            .from('teachers')
            .select('*')
            .order('full_name', { ascending: true });

        if (error) throw error;

        teacherTableBody.innerHTML = '';
        if (data.length === 0) {
            teacherTableBody.innerHTML = '<tr><td colspan="5" class="text-center py-4 text-gray-500">No teachers found.</td></tr>';
            return;
        }

        data.forEach(teacher => {
            const row = teacherTableBody.insertRow();
            row.className = 'border-b hover:bg-gray-50';
            row.innerHTML = `
                <td class="py-3 px-4">${teacher.id.substring(0, 8)}...</td>
                <td class="py-3 px-4">${teacher.full_name}</td>
                <td class="py-3 px-4">${teacher.subject || 'N/A'}</td>
                <td class="py-3 px-4">${teacher.classes || 'N/A'}</td>
                <td class="py-3 px-4">
                    <button class="text-blue-600 hover:text-blue-800 mr-3" title="Edit Teacher" onclick="editTeacher('${teacher.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="text-red-600 hover:text-red-800" title="Delete Teacher" onclick="deleteTeacher('${teacher.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
        });
    } catch (error) {
        console.error('Error loading teachers:', error.message);
        showToast('Failed to load teachers.', 'error');
    }
}

/**
 * Shows the add/edit teacher modal.
 * @param {string} [teacherId] - Optional teacher ID for editing.
 */
async function showAddTeacherForm(teacherId = null) {
    teacherForm.reset();
    teacherIdInput.value = '';

    if (teacherId) {
        teacherModalTitle.textContent = 'Edit Teacher';
        teacherFormSubmitBtn.textContent = 'Save Changes';

        try {
            const { data, error } = await supabase
                .from('teachers')
                .select('*')
                .eq('id', teacherId)
                .single();

            if (error) throw error;

            teacherIdInput.value = data.id;
            teacherFullNameInput.value = data.full_name;
            teacherSubjectSelect.value = data.subject || '';
            teacherEmailInput.value = data.email;
            teacherClassesInput.value = data.classes || '';

        } catch (error) {
            console.error('Error fetching teacher for edit:', error.message);
            showToast('Failed to load teacher data for editing.', 'error');
            return;
        }
    } else {
        teacherModalTitle.textContent = 'Add New Teacher';
        teacherFormSubmitBtn.textContent = 'Add Teacher';
    }
    teacherModal.classList.remove('hidden');
}

/**
 * Handles add/edit teacher form submission.
 * @param {Event} event
 */
async function handleTeacherFormSubmit(event) {
    event.preventDefault();
    const id = teacherIdInput.value;
    const teacherData = {
        full_name: teacherFullNameInput.value,
        subject: teacherSubjectSelect.value,
        email: teacherEmailInput.value,
        classes: teacherClassesInput.value,
    };

    try {
        if (id) {
            // Update existing teacher
            const { error } = await supabase
                .from('teachers')
                .update({ ...teacherData, updated_at: new Date().toISOString() })
                .eq('id', id);

            if (error) throw error;
            showToast('Teacher updated successfully!', 'success');

        } else {
            // Add new teacher
            const { error } = await supabase
                .from('teachers')
                .insert([{ ...teacherData, created_at: new Date().toISOString() }]);

            if (error) throw error;
            showToast('Teacher added successfully!', 'success');
        }

        teacherModal.classList.add('hidden');
        loadTeachers(); // Reload teachers list
    } catch (error) {
        console.error('Error saving teacher:', error.message);
        showToast(`Failed to save teacher: ${error.message}`, 'error');
    }
}

/**
 * Deletes a teacher.
 * @param {string} teacherId
 */
async function deleteTeacher(teacherId) {
    if (!confirm('Are you sure you want to delete this teacher?')) {
        return;
    }
    try {
        const { error } = await supabase
            .from('teachers')
            .delete()
            .eq('id', teacherId);
        if (error) throw error;
        showToast('Teacher deleted successfully!', 'success');
        loadTeachers();
    } catch (error) {
        console.error('Error deleting teacher:', error.message);
        showToast(`Failed to delete teacher: ${error.message}`, 'error');
    }
}

/**
 * Exports teacher data to Excel.
 */
async function exportTeachersToExcel() {
    try {
        const { data, error } = await supabase
            .from('teachers')
            .select('*')
            .order('full_name', { ascending: true });

        if (error) throw error;

        if (data.length === 0) {
            showToast('No teacher data to export.', 'info');
            return;
        }

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Teachers");
        XLSX.writeFile(wb, "Teachers_Data.xlsx");
        showToast('Teacher data exported to Excel!', 'success');

    } catch (error) {
        console.error('Error exporting teachers:', error.message);
        showToast('Failed to export teacher data.', 'error');
    }
}

/**
 * Loads payroll entries.
 */
async function loadPayrollEntries() {
    try {
        const { data, error } = await supabase
            .from('payroll')
            .select('*')
            .order('payroll_period', { ascending: false });

        if (error) throw error;

        payrollTableBody.innerHTML = '';
        if (data.length === 0) {
            payrollTableBody.innerHTML = '<tr><td colspan="5" class="text-center py-4 text-gray-500">No payroll entries found.</td></tr>';
            return;
        }

        data.forEach(entry => {
            const row = payrollTableBody.insertRow();
            row.className = 'border-b hover:bg-gray-50';
            row.innerHTML = `
                <td class="py-3 px-4">${entry.payroll_period}</td>
                <td class="py-3 px-4">${entry.staff_count}</td>
                <td class="py-3 px-4">$${entry.total_amount.toFixed(2)}</td>
                <td class="py-3 px-4">
                    <span class="px-2 py-1 rounded-full text-xs font-semibold ${entry.status === 'Processed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}">
                        ${entry.status}
                    </span>
                </td>
                <td class="py-3 px-4">
                    <button class="text-blue-600 hover:text-blue-800 mr-3" title="Edit Payroll" onclick="editPayroll('${entry.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="text-red-600 hover:text-red-800" title="Delete Payroll" onclick="deletePayroll('${entry.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
        });
    } catch (error) {
        console.error('Error loading payroll entries:', error.message);
        showToast('Failed to load payroll entries.', 'error');
    }
}

/**
 * Handles payroll form submission.
 * @param {Event} event
 */
async function handlePayrollFormSubmit(event) {
    event.preventDefault();
    const payrollData = {
        payroll_period: payrollPeriodInput.value,
        staff_count: staffCountInput.value,
        total_amount: totalAmountInput.value,
        status: 'Processed', // Default status
        created_at: new Date().toISOString(),
    };

    try {
        const { error } = await supabase
            .from('payroll')
            .insert([payrollData]);

        if (error) throw error;
        showToast('Payroll processed successfully!', 'success');
        payrollModal.classList.add('hidden');
        loadPayrollEntries();
    } catch (error) {
        console.error('Error processing payroll:', error.message);
        showToast(`Failed to process payroll: ${error.message}`, 'error');
    }
}

/**
 * Placeholder for editing payroll.
 * @param {string} payrollId
 */
function editPayroll(payrollId) {
    showToast(`Edit payroll ID: ${payrollId} (Functionality not fully implemented)`, 'info');
    // Implement fetching payroll data and populating the modal for editing
}

/**
 * Placeholder for deleting payroll.
 * @param {string} payrollId
 */
async function deletePayroll(payrollId) {
    if (!confirm('Are you sure you want to delete this payroll entry?')) {
        return;
    }
    try {
        const { error } = await supabase
            .from('payroll')
            .delete()
            .eq('id', payrollId);
        if (error) throw error;
        showToast('Payroll entry deleted successfully!', 'success');
        loadPayrollEntries();
    } catch (error) {
        console.error('Error deleting payroll:', error.message);
        showToast(`Failed to delete payroll: ${error.message}`, 'error');
    }
}

/**
 * Loads invoices for Finance module.
 */
async function loadInvoices() {
    try {
        const { data, error } = await supabase
            .from('finance')
            .select('*')
            .order('invoice_date', { ascending: false });

        if (error) throw error;

        financeTableBody.innerHTML = '';
        if (data.length === 0) {
            financeTableBody.innerHTML = '<tr><td colspan="5" class="text-center py-4 text-gray-500">No invoices found.</td></tr>';
            return;
        }

        data.forEach(invoice => {
            const row = financeTableBody.insertRow();
            row.className = 'border-b hover:bg-gray-50';
            row.innerHTML = `
                <td class="py-3 px-4">${invoice.invoice_number}</td>
                <td class="py-3 px-4">${new Date(invoice.invoice_date).toLocaleDateString()}</td>
                <td class="py-3 px-4">$${invoice.amount.toFixed(2)}</td>
                <td class="py-3 px-4">
                    <span class="px-2 py-1 rounded-full text-xs font-semibold ${invoice.status === 'Paid' ? 'bg-green-100 text-green-800' : invoice.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}">
                        ${invoice.status}
                    </span>
                </td>
                <td class="py-3 px-4">
                    <button class="text-blue-600 hover:text-blue-800 mr-3" title="Edit Invoice" onclick="editInvoice('${invoice.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="text-red-600 hover:text-red-800" title="Delete Invoice" onclick="deleteInvoice('${invoice.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
        });
    } catch (error) {
        console.error('Error loading invoices:', error.message);
        showToast('Failed to load invoices.', 'error');
    }
}

/**
 * Handles add invoice form submission.
 * @param {Event} event
 */
async function handleAddInvoiceFormSubmit(event) {
    event.preventDefault();
    const invoiceData = {
        invoice_number: invoiceNumberInput.value,
        invoice_date: invoiceDateInput.value,
        amount: invoiceAmountInput.value,
        status: invoiceStatusSelect.value,
        created_at: new Date().toISOString(),
    };

    try {
        const { error } = await supabase
            .from('finance')
            .insert([invoiceData]);

        if (error) throw error;
        showToast('Invoice added successfully!', 'success');
        addInvoiceModal.classList.add('hidden');
        loadInvoices();
    } catch (error) {
        console.error('Error adding invoice:', error.message);
        showToast(`Failed to add invoice: ${error.message}`, 'error');
    }
}

/**
 * Placeholder for editing invoice.
 * @param {string} invoiceId
 */
function editInvoice(invoiceId) {
    showToast(`Edit invoice ID: ${invoiceId} (Functionality not fully implemented)`, 'info');
    // Implement fetching invoice data and populating the modal for editing
}

/**
 * Placeholder for deleting invoice.
 * @param {string} invoiceId
 */
async function deleteInvoice(invoiceId) {
    if (!confirm('Are you sure you want to delete this invoice?')) {
        return;
    }
    try {
        const { error } = await supabase
            .from('finance')
            .delete()
            .eq('id', invoiceId);
        if (error) throw error;
        showToast('Invoice deleted successfully!', 'success');
        loadInvoices();
    } catch (error) {
        console.error('Error deleting invoice:', error.message);
        showToast(`Failed to delete invoice: ${error.message}`, 'error');
    }
}

/**
 * Loads attendance records.
 */
async function loadAttendanceRecords() {
    try {
        let query = supabase.from('student_attendance').select('*, students(full_name, class, roll_no)');

        const studentName = attendanceStudentNameFilter.value.trim();
        const studentClass = attendanceClassFilter.value;
        const attendanceDate = attendanceDateFilter.value;

        if (studentName) {
            query = query.ilike('students.full_name', `%${studentName}%`);
        }
        if (studentClass) {
            query = query.eq('students.class', studentClass);
        }
        if (attendanceDate) {
            query = query.eq('attendance_date', attendanceDate);
        }

        const { data, error } = await query.order('attendance_date', { ascending: false });

        if (error) throw error;

        attendanceTableBody.innerHTML = '';
        if (data.length === 0) {
            attendanceTableBody.innerHTML = '<tr><td colspan="7" class="text-center py-4 text-gray-500">No attendance records found.</td></tr>';
            attendanceTotalStudents.textContent = 0;
            attendanceTotalPresent.textContent = 0;
            attendanceTotalAbsent.textContent = 0;
            return;
        }

        let totalStudents = 0;
        let totalPresent = 0;
        let totalAbsent = 0;

        data.forEach(record => {
            totalStudents++;
            if (record.status === 'Present') {
                totalPresent++;
            } else if (record.status === 'Absent') {
                totalAbsent++;
            }

            const row = attendanceTableBody.insertRow();
            row.className = 'border-b hover:bg-gray-50';
            row.innerHTML = `
                <td class="py-3 px-4">${record.students.full_name}</td>
                <td class="py-3 px-4">${record.students.roll_no}</td>
                <td class="py-3 px-4">${record.students.class}</td>
                <td class="py-3 px-4">${new Date(record.attendance_date).toLocaleDateString()}</td>
                <td class="py-3 px-4">
                    <span class="px-2 py-1 rounded-full text-xs font-semibold ${record.status === 'Present' ? 'bg-green-100 text-green-800' : record.status === 'Absent' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}">
                        ${record.status}
                    </span>
                </td>
                <td class="py-3 px-4">${record.remarks || 'N/A'}</td>
                <td class="py-3 px-4">
                    <button class="text-blue-600 hover:text-blue-800 mr-3" title="Edit Attendance" onclick="editAttendance('${record.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="text-red-600 hover:text-red-800" title="Delete Attendance" onclick="deleteAttendance('${record.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
        });

        attendanceTotalStudents.textContent = totalStudents;
        attendanceTotalPresent.textContent = totalPresent;
        attendanceTotalAbsent.textContent = totalAbsent;

    } catch (error) {
        console.error('Error loading attendance records:', error.message);
        showToast('Failed to load attendance records.', 'error');
    }
}

/**
 * Populates the student select dropdown for attendance marking.
 */
async function loadStudentsForAttendanceSelect() {
    try {
        const { data, error } = await supabase
            .from('students')
            .select('id, full_name, roll_no, class')
            .order('full_name', { ascending: true });

        if (error) throw error;

        attendanceStudentSelect.innerHTML = '<option value="">Select Student</option>';
        data.forEach(student => {
            const option = document.createElement('option');
            option.value = student.id;
            option.textContent = `${student.full_name} (Roll No: ${student.roll_no}, Class: ${student.class})`;
            attendanceStudentSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading students for attendance select:', error.message);
    }
}

/**
 * Shows the add/edit attendance modal.
 * @param {string} [attendanceId] - Optional attendance ID for editing.
 */
async function showAddAttendanceModal(attendanceId = null) {
    attendanceForm.reset();
    attendanceIdInput.value = '';
    attendanceDateInput.valueAsDate = new Date(); // Set default date to today

    if (attendanceId) {
        attendanceModalTitle.textContent = 'Edit Attendance';
        attendanceFormSubmitBtn.textContent = 'Save Changes';

        try {
            const { data, error } = await supabase
                .from('student_attendance')
                .select('*')
                .eq('id', attendanceId)
                .single();

            if (error) throw error;

            attendanceIdInput.value = data.id;
            attendanceStudentSelect.value = data.student_id;
            attendanceDateInput.value = data.attendance_date;
            attendanceStatusSelect.value = data.status;
            attendanceRemarksTextarea.value = data.remarks || '';

        } catch (error) {
            console.error('Error fetching attendance for edit:', error.message);
            showToast('Failed to load attendance data for editing.', 'error');
            return;
        }
    } else {
        attendanceModalTitle.textContent = 'Mark Attendance';
        attendanceFormSubmitBtn.textContent = 'Mark Attendance';
    }
    attendanceModal.classList.remove('hidden');
}

/**
 * Handles add/edit attendance form submission.
 * @param {Event} event
 */
async function handleAttendanceFormSubmit(event) {
    event.preventDefault();
    const id = attendanceIdInput.value;
    const attendanceData = {
        student_id: attendanceStudentSelect.value,
        attendance_date: attendanceDateInput.value,
        status: attendanceStatusSelect.value,
        remarks: attendanceRemarksTextarea.value,
    };

    try {
        if (id) {
            // Update existing attendance
            const { error } = await supabase
                .from('student_attendance')
                .update({ ...attendanceData, updated_at: new Date().toISOString() })
                .eq('id', id);

            if (error) throw error;
            showToast('Attendance updated successfully!', 'success');

        } else {
            // Add new attendance
            const { error } = await supabase
                .from('student_attendance')
                .insert([{ ...attendanceData, created_at: new Date().toISOString() }]);

            if (error) throw error;
            showToast('Attendance marked successfully!', 'success');
        }

        attendanceModal.classList.add('hidden');
        loadAttendanceRecords(); // Reload attendance records
    } catch (error) {
        console.error('Error saving attendance:', error.message);
        showToast(`Failed to save attendance: ${error.message}`, 'error');
    }
}

/**
 * Deletes an attendance record.
 * @param {string} attendanceId
 */
async function deleteAttendance(attendanceId) {
    if (!confirm('Are you sure you want to delete this attendance record?')) {
        return;
    }
    try {
        const { error } = await supabase
            .from('student_attendance')
            .delete()
            .eq('id', attendanceId);
        if (error) throw error;
        showToast('Attendance record deleted successfully!', 'success');
        loadAttendanceRecords();
    } catch (error) {
        console.error('Error deleting attendance:', error.message);
        showToast(`Failed to delete attendance: ${error.message}`, 'error');
    }
}

/**
 * Placeholder for registering student fingerprint.
 */
function registerStudentFingerprint() {
    showToast('Fingerprint registration for students not yet implemented.', 'info');
    // This would involve hardware integration and a backend service.
}

/**
 * Placeholder for verifying student fingerprint.
 */
function verifyStudentFingerprint() {
    showToast('Fingerprint verification for students not yet implemented.', 'info');
    // This would involve hardware integration and a backend service.
    // If successful, you'd mark attendance as 'Present' for the selected student.
}

/**
 * Loads teacher attendance records.
 */
async function loadTeacherAttendanceRecords() {
    try {
        let query = supabase.from('teacher_attendance').select('*, teachers(full_name, subject)');

        const teacherName = teacherAttendanceNameFilter.value.trim();
        const teacherSubject = teacherAttendanceSubjectFilter.value;
        const attendanceDate = teacherAttendanceDateFilter.value;

        if (teacherName) {
            query = query.ilike('teachers.full_name', `%${teacherName}%`);
        }
        if (teacherSubject) {
            query = query.eq('teachers.subject', teacherSubject);
        }
        if (attendanceDate) {
            query = query.eq('attendance_date', attendanceDate);
        }

        const { data, error } = await query.order('attendance_date', { ascending: false });

        if (error) throw error;

        teacherAttendanceTableBody.innerHTML = '';
        if (data.length === 0) {
            teacherAttendanceTableBody.innerHTML = '<tr><td colspan="6" class="text-center py-4 text-gray-500">No teacher attendance records found.</td></tr>';
            teacherAttendanceTotalTeachers.textContent = 0;
            teacherAttendanceTotalPresent.textContent = 0;
            teacherAttendanceTotalAbsent.textContent = 0;
            return;
        }

        let totalTeachers = 0;
        let totalPresent = 0;
        let totalAbsent = 0;

        data.forEach(record => {
            totalTeachers++;
            if (record.status === 'Present') {
                totalPresent++;
            } else if (record.status === 'Absent') {
                totalAbsent++;
            }

            const row = teacherAttendanceTableBody.insertRow();
            row.className = 'border-b hover:bg-gray-50';
            row.innerHTML = `
                <td class="py-3 px-4">${record.teachers.full_name}</td>
                <td class="py-3 px-4">${record.teachers.subject}</td>
                <td class="py-3 px-4">${new Date(record.attendance_date).toLocaleDateString()}</td>
                <td class="py-3 px-4">
                    <span class="px-2 py-1 rounded-full text-xs font-semibold ${record.status === 'Present' ? 'bg-green-100 text-green-800' : record.status === 'Absent' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}">
                        ${record.status}
                    </span>
                </td>
                <td class="py-3 px-4">${record.remarks || 'N/A'}</td>
                <td class="py-3 px-4">
                    <button class="text-blue-600 hover:text-blue-800 mr-3" title="Edit Attendance" onclick="editTeacherAttendance('${record.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="text-red-600 hover:text-red-800" title="Delete Attendance" onclick="deleteTeacherAttendance('${record.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
        });

        teacherAttendanceTotalTeachers.textContent = totalTeachers;
        teacherAttendanceTotalPresent.textContent = totalPresent;
        teacherAttendanceTotalAbsent.textContent = totalAbsent;

    } catch (error) {
        console.error('Error loading teacher attendance records:', error.message);
        showToast('Failed to load teacher attendance records.', 'error');
    }
}

/**
 * Populates the teacher select dropdown for teacher attendance marking.
 */
async function loadTeachersForTeacherAttendanceSelect() {
    try {
        const { data, error } = await supabase
            .from('teachers')
            .select('id, full_name, subject')
            .order('full_name', { ascending: true });

        if (error) throw error;

        teacherAttendanceTeacherSelect.innerHTML = '<option value="">Select Teacher</option>';
        data.forEach(teacher => {
            const option = document.createElement('option');
            option.value = teacher.id;
            option.textContent = `${teacher.full_name} (${teacher.subject})`;
            teacherAttendanceTeacherSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading teachers for attendance select:', error.message);
    }
}

/**
 * Shows the add/edit teacher attendance modal.
 * @param {string} [teacherAttendanceId] - Optional teacher attendance ID for editing.
 */
async function showAddTeacherAttendanceModal(teacherAttendanceId = null) {
    teacherAttendanceForm.reset();
    teacherAttendanceIdInput.value = '';
    teacherAttendanceDateInput.valueAsDate = new Date(); // Set default date to today

    if (teacherAttendanceId) {
        teacherAttendanceModalTitle.textContent = 'Edit Teacher Attendance';
        teacherAttendanceFormSubmitBtn.textContent = 'Save Changes';

        try {
            const { data, error } = await supabase
                .from('teacher_attendance')
                .select('*')
                .eq('id', teacherAttendanceId)
                .single();

            if (error) throw error;

            teacherAttendanceIdInput.value = data.id;
            teacherAttendanceTeacherSelect.value = data.teacher_id;
            teacherAttendanceDateInput.value = data.attendance_date;
            teacherAttendanceStatusSelect.value = data.status;
            teacherAttendanceRemarksTextarea.value = data.remarks || '';

        } catch (error) {
            console.error('Error fetching teacher attendance for edit:', error.message);
            showToast('Failed to load teacher attendance data for editing.', 'error');
            return;
        }
    } else {
        teacherAttendanceModalTitle.textContent = 'Mark Teacher Attendance';
        teacherAttendanceFormSubmitBtn.textContent = 'Mark Attendance';
    }
    teacherAttendanceModal.classList.remove('hidden');
}

/**
 * Handles add/edit teacher attendance form submission.
 * @param {Event} event
 */
async function handleTeacherAttendanceFormSubmit(event) {
    event.preventDefault();
    const id = teacherAttendanceIdInput.value;
    const attendanceData = {
        teacher_id: teacherAttendanceTeacherSelect.value,
        attendance_date: teacherAttendanceDateInput.value,
        status: teacherAttendanceStatusSelect.value,
        remarks: teacherAttendanceRemarksTextarea.value,
    };

    try {
        if (id) {
            // Update existing teacher attendance
            const { error } = await supabase
                .from('teacher_attendance')
                .update({ ...attendanceData, updated_at: new Date().toISOString() })
                .eq('id', id);

            if (error) throw error;
            showToast('Teacher attendance updated successfully!', 'success');

        } else {
            // Add new teacher attendance
            const { error } = await supabase
                .from('teacher_attendance')
                .insert([{ ...attendanceData, created_at: new Date().toISOString() }]);

            if (error) throw error;
            showToast('Teacher attendance marked successfully!', 'success');
        }

        teacherAttendanceModal.classList.add('hidden');
        loadTeacherAttendanceRecords(); // Reload teacher attendance records
    } catch (error) {
        console.error('Error saving teacher attendance:', error.message);
        showToast(`Failed to save teacher attendance: ${error.message}`, 'error');
    }
}

/**
 * Deletes a teacher attendance record.
 * @param {string} teacherAttendanceId
 */
async function deleteTeacherAttendance(teacherAttendanceId) {
    if (!confirm('Are you sure you want to delete this teacher attendance record?')) {
        return;
    }
    try {
        const { error } = await supabase
            .from('teacher_attendance')
            .delete()
            .eq('id', teacherAttendanceId);
        if (error) throw error;
        showToast('Teacher attendance record deleted successfully!', 'success');
        loadTeacherAttendanceRecords();
    } catch (error) {
        console.error('Error deleting teacher attendance:', error.message);
        showToast(`Failed to delete teacher attendance: ${error.message}`, 'error');
    }
}

/**
 * Placeholder for registering teacher fingerprint.
 */
function registerTeacherFingerprint() {
    showToast('Fingerprint registration for teachers not yet implemented.', 'info');
    // This would involve hardware integration and a backend service.
}

/**
 * Placeholder for verifying teacher fingerprint.
 */
function verifyTeacherFingerprint() {
    showToast('Fingerprint verification for teachers not yet implemented.', 'info');
    // This would involve hardware integration and a backend service.
    // If successful, you'd mark attendance as 'Present' for the selected teacher.
}

/**
 * Loads calendar events.
 */
async function loadCalendarEvents() {
    try {
        const { data, error } = await supabase
            .from('calendar_events')
            .select('*');

        if (error) throw error;

        const events = data.map(event => ({
            id: event.id,
            title: event.title,
            start: event.start_date,
            end: event.end_date,
            allDay: event.all_day,
            color: event.color || '#3788d8' // Default FullCalendar blue
        }));

        // Update both calendars
        const calendar = FullCalendar.getCalendarById('calendar'); // Dashboard calendar
        const fullCalendar = FullCalendar.getCalendarById('calendar-full'); // Dedicated calendar module

        if (calendar) {
            calendar.removeAllEvents();
            calendar.addEventSource(events);
        }
        if (fullCalendar) {
            fullCalendar.removeAllEvents();
            fullCalendar.addEventSource(events);
        }

    } catch (error) {
        console.error('Error loading calendar events:', error.message);
        showToast('Failed to load calendar events.', 'error');
    }
}

/**
 * Loads upcoming holidays.
 */
async function loadUpcomingHolidays() {
    try {
        const today = new Date().toISOString();
        const { data, error } = await supabase
            .from('holidays') // Assuming a 'holidays' table
            .select('*')
            .gte('holiday_date', today)
            .order('holiday_date', { ascending: true })
            .limit(5); // Show next 5 holidays

        if (error) throw error;

        holidayList.innerHTML = '';
        if (data.length === 0) {
            holidayList.innerHTML = '<p class="text-gray-500">No upcoming holidays.</p>';
            return;
        }

        data.forEach(holiday => {
            const holidayItem = document.createElement('div');
            holidayItem.className = 'p-3 bg-blue-50 rounded-lg flex justify-between items-center';
            holidayItem.innerHTML = `
                <div>
                    <p class="font-medium">${holiday.name}</p>
                    <p class="text-sm text-gray-600">${new Date(holiday.holiday_date).toLocaleDateString()}</p>
                </div>
                <i class="fas fa-calendar-day text-blue-600"></i>
            `;
            holidayList.appendChild(holidayItem);
        });

    } catch (error) {
        console.error('Error loading upcoming holidays:', error.message);
        showToast('Failed to load upcoming holidays.', 'error');
    }
}

/**
 * Loads data for reports and updates charts.
 */
async function loadReportsData() {
    try {
        // Example: Fetch student attendance data for the chart
        const { data: attendanceData, error: attendanceError } = await supabase
            .from('student_attendance')
            .select('attendance_date, status');

        if (attendanceError) throw attendanceError;

        // Process attendance data for chart (e.g., monthly attendance percentage)
        const monthlyAttendance = {};
        attendanceData.forEach(record => {
            const date = new Date(record.attendance_date);
            const monthYear = `${date.getFullYear()}-${date.getMonth() + 1}`;
            if (!monthlyAttendance[monthYear]) {
                monthlyAttendance[monthYear] = { present: 0, total: 0 };
            }
            monthlyAttendance[monthYear].total++;
            if (record.status === 'Present') {
                monthlyAttendance[monthYear].present++;
            }
        });

        const labels = Object.keys(monthlyAttendance).sort();
        const percentages = labels.map(monthYear => {
            const { present, total } = monthlyAttendance[monthYear];
            return total > 0 ? (present / total) * 100 : 0;
        });

        if (attendanceChart) {
            attendanceChart.data.labels = labels;
            attendanceChart.data.datasets[0].data = percentages;
            attendanceChart.update();
        }

        // Example: Fetch exam performance data for the chart
        const { data: examData, error: examError } = await supabase
            .from('exam_results') // Assuming an 'exam_results' table
            .select('exam_term, score');

        if (examError) throw examError;

        // Process exam data (e.g., average score per term)
        const termScores = {};
        examData.forEach(result => {
            if (!termScores[result.exam_term]) {
                termScores[result.exam_term] = { sum: 0, count: 0 };
            }
            termScores[result.exam_term].sum += result.score;
            termScores[result.exam_term].count++;
        });

        const termLabels = Object.keys(termScores).sort();
        const averageScores = termLabels.map(term => {
            const { sum, count } = termScores[term];
            return count > 0 ? sum / count : 0;
        });

        if (performanceChart) {
            performanceChart.data.labels = termLabels;
            performanceChart.data.datasets[0].data = averageScores;
            performanceChart.update();
        }

    } catch (error) {
        console.error('Error loading reports data:', error.message);
        showToast('Failed to load reports data.', 'error');
    }
}

// --- Notification Handling ---

let notifications = [
    { id: 1, message: 'New student "Alice Smith" enrolled.', time: '2 hours ago', read: false },
    { id: 2, message: 'Payroll for July is due tomorrow.', time: '5 hours ago', read: false },
    { id: 3, message: 'System update scheduled for 10 PM.', time: 'Yesterday', read: false },
    { id: 4, message: 'Teacher "Mr. John Doe" marked absent today.', time: '2 days ago', read: true },
    { id: 5, message: 'New announcement: School closed on Monday.', time: '3 days ago', read: true },
];

/**
 * Renders notifications in the dropdown and updates count.
 */
function renderNotifications() {
    notificationList.innerHTML = '';
    viewAllNotificationList.innerHTML = '';
    let unreadCount = 0;

    notifications.forEach(n => {
        if (!n.read) {
            unreadCount++;
        }

        const notificationItem = document.createElement('div');
        notificationItem.className = `notification-item ${n.read ? 'read' : ''}`;
        notificationItem.innerHTML = `
            <div class="icon-wrapper ${n.read ? 'bg-gray-100 text-gray-500' : 'bg-blue-100 text-blue-600'}">
                <i class="fas fa-bell"></i>
            </div>
            <div class="content">
                <p class="message">${n.message}</p>
                <p class="time">${n.time}</p>
            </div>
            <button class="mark-read-btn" data-id="${n.id}" title="Mark as Read">
                <i class="fas fa-check"></i>
            </button>
        `;
        notificationList.appendChild(notificationItem);

        // Clone for "View All" modal
        const modalNotificationItem = notificationItem.cloneNode(true);
        viewAllNotificationList.appendChild(modalNotificationItem);
    });

    notificationCount.textContent = unreadCount;
    notificationCount.classList.toggle('hidden', unreadCount === 0);
    newCount.textContent = `${unreadCount} New`;

    // Add event listeners for "Mark as Read" buttons
    document.querySelectorAll('.mark-read-btn').forEach(button => {
        button.onclick = (e) => {
            const id = parseInt(e.currentTarget.dataset.id);
            markNotificationAsRead(id);
        };
    });
}

/**
 * Marks a single notification as read.
 * @param {number} id - The ID of the notification.
 */
function markNotificationAsRead(id) {
    const notification = notifications.find(n => n.id === id);
    if (notification && !notification.read) {
        notification.read = true;
        renderNotifications();
        showToast('Notification marked as read.', 'info');
    }
}

/**
 * Marks all notifications as read.
 */
function markAllNotificationsAsRead() {
    let changed = false;
    notifications.forEach(n => {
        if (!n.read) {
            n.read = true;
            changed = true;
        }
    });
    if (changed) {
        renderNotifications();
        showToast('All notifications marked as read.', 'success');
    } else {
        showToast('No new notifications to mark as read.', 'info');
    }
}

// --- Event Listeners ---

// Login UI
roleButtons.forEach(button => {
    button.addEventListener('click', () => {
        roleButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        selectedRoleInput.value = button.dataset.role;
    });
});

loginForm.addEventListener('submit', handleLogin);

forgotPasswordLink.addEventListener('click', (e) => {
    e.preventDefault();
    forgotPasswordModal.classList.remove('hidden');
});

closeForgotPasswordModal.addEventListener('click', () => {
    forgotPasswordModal.classList.add('hidden');
});

forgotPasswordForm.addEventListener('submit', handleForgotPassword);

// School Site UI
sidebarNavItems.forEach(item => {
    item.addEventListener('click', handleNavigationClick);
});

Array.from(moduleTabs.children).forEach(tab => {
    tab.addEventListener('click', handleNavigationClick);
});

// Quick Access Modules buttons
document.querySelectorAll('.open-module').forEach(button => {
    button.addEventListener('click', handleNavigationClick);
});

logoutButton.addEventListener('click', handleLogout);

userProfileToggle.addEventListener('click', () => {
    userDropdown.classList.toggle('hidden');
    notificationDropdown.classList.add('hidden'); // Close notifications if open
});

notificationButton.addEventListener('click', () => {
    notificationDropdown.classList.toggle('hidden');
    userDropdown.classList.add('hidden'); // Close user dropdown if open
});

// Close dropdowns if clicked outside
document.addEventListener('click', (event) => {
    if (!userProfileToggle.contains(event.target) && !userDropdown.contains(event.target)) {
        userDropdown.classList.add('hidden');
    }
    if (!notificationButton.contains(event.target) && !notificationDropdown.contains(event.target)) {
        notificationDropdown.classList.add('hidden');
    }
});

markAllReadBtn.addEventListener('click', markAllNotificationsAsRead);
modalMarkAllReadBtn.addEventListener('click', markAllNotificationsAsRead);

viewAllNotificationsLink.addEventListener('click', (e) => {
    e.preventDefault();
    viewAllModal.classList.remove('hidden');
    renderNotifications(); // Re-render to ensure all are shown
});

closeViewAllModal.addEventListener('click', () => {
    viewAllModal.classList.add('hidden');
});

darkModeToggle.addEventListener('click', toggleDarkMode);

// Profile Module
profileForm.addEventListener('submit', saveProfileChanges);
profilePictureInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            profilePicturePreview.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
});

// User Management Module
userForm.addEventListener('submit', handleUserFormSubmit);
closeUserModal.addEventListener('click', () => userModal.classList.add('hidden'));

// System Settings Module
systemSettingsForm.addEventListener('submit', saveSystemSettings);

// Announcements Module
announcementForm.addEventListener('submit', handleAnnouncementFormSubmit);
closeAnnouncementModal.addEventListener('click', () => announcementModal.classList.add('hidden'));

// Students Module
studentForm.addEventListener('submit', handleStudentFormSubmit);
closeStudentModal.addEventListener('click', () => studentModal.classList.add('hidden'));
applySearchButton.addEventListener('click', loadStudents);

// Teachers Module
teacherForm.addEventListener('submit', handleTeacherFormSubmit);
closeTeacherModal.addEventListener('click', () => teacherModal.classList.add('hidden'));

// Payroll Module
openPayrollModalBtn.addEventListener('click', () => payrollModal.classList.remove('hidden'));
closePayrollModalBtn.addEventListener('click', () => payrollModal.classList.add('hidden'));
payrollForm.addEventListener('submit', handlePayrollFormSubmit);

// Finance Module
openAddInvoiceModalBtn.addEventListener('click', () => addInvoiceModal.classList.remove('hidden'));
closeAddInvoiceModalBtn.addEventListener('click', () => addInvoiceModal.classList.add('hidden'));
addInvoiceForm.addEventListener('submit', handleAddInvoiceFormSubmit);

// Attendance Module
document.querySelector('#attendanceModule button[onclick="showAddAttendanceModal()"]').addEventListener('click', () => showAddAttendanceModal());
closeAttendanceModal.addEventListener('click', () => attendanceModal.classList.add('hidden'));
attendanceForm.addEventListener('submit', handleAttendanceFormSubmit);
applyAttendanceFilter.addEventListener('click', loadAttendanceRecords);
registerStudentFingerprintBtn.addEventListener('click', registerStudentFingerprint);
verifyStudentFingerprintBtn.addEventListener('click', verifyStudentFingerprint);

// Teacher Attendance Module
document.querySelector('#teacher-attendanceModule button[onclick="showAddTeacherAttendanceModal()"]').addEventListener('click', () => showAddTeacherAttendanceModal());
closeTeacherAttendanceModal.addEventListener('click', () => teacherAttendanceModal.classList.add('hidden'));
teacherAttendanceForm.addEventListener('submit', handleTeacherAttendanceFormSubmit);
applyTeacherAttendanceFilter.addEventListener('click', loadTeacherAttendanceRecords);
registerTeacherFingerprintBtn.addEventListener('click', registerTeacherFingerprint);
verifyTeacherFingerprintBtn.addEventListener('click', verifyTeacherFingerprint);

// --- Initializations on Load ---
document.addEventListener('DOMContentLoaded', async () => {
    // Apply dark mode preference
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode === 'true') {
        isDarkMode = true;
        document.documentElement.classList.add('dark');
    }
    updateDarkModeIcon();

    typeWelcomeMessage();
    initializeFullCalendar();
    initializeCharts();
    renderNotifications(); // Initial render of notifications

    // Check user session on page load
    await checkUserSession();

    // If logged in, load dashboard stats and recent activity
    if (loggedInUser) {
        loadDashboardStats();
        loadRecentActivity();
    }
});

// Global functions for onclick attributes in HTML
window.showAddUserForm = showAddUserForm;
window.editUser = showAddUserForm; // Alias for editing
window.deleteUser = deleteUser;
window.showAddAnnouncementModal = showAddAnnouncementModal;
window.editAnnouncement = showAddAnnouncementModal;
window.deleteAnnouncement = deleteAnnouncement;
window.showAddStudentForm = showAddStudentForm;
window.editStudent = showAddStudentForm;
window.deleteStudent = deleteStudent;
window.exportStudentsToExcel = exportStudentsToExcel;
window.showAddTeacherForm = showAddTeacherForm;
window.editTeacher = showAddTeacherForm;
window.deleteTeacher = deleteTeacher;
window.exportTeachersToExcel = exportTeachersToExcel;
window.editPayroll = editPayroll; // Placeholder
window.deletePayroll = deletePayroll;
window.editInvoice = editInvoice; // Placeholder
window.deleteInvoice = deleteInvoice;
window.showAddAttendanceModal = showAddAttendanceModal;
window.editAttendance = showAddAttendanceModal;
window.deleteAttendance = deleteAttendance;
window.showAddTeacherAttendanceModal = showAddTeacherAttendanceModal;
window.editTeacherAttendance = showAddTeacherAttendanceModal;
window.deleteTeacherAttendance = deleteTeacherAttendance;
window.downloadBackup = downloadBackup;
window.deleteBackup = deleteBackup;
window.registerStudentFingerprint = registerStudentFingerprint;
window.verifyStudentFingerprint = verifyStudentFingerprint;
window.registerTeacherFingerprint = registerTeacherFingerprint;
window.verifyTeacherFingerprint = verifyTeacherFingerprint;

// Voice Assistant Placeholder (from index.html)
function startVoiceAssistant() {
    showToast('Voice assistant functionality not yet implemented.', 'info');
    // This would typically involve Web Speech API or a third-party voice AI service.
}
window.startVoiceAssistant = startVoiceAssistant; // Make it globally accessible
