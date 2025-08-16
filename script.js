// Global variables for data (will be populated from Supabase)
let students = [];
let teachers = [];
let payrollEntries = [];
let invoices = [];
let announcements = [];
let notifications = []; // Client-side for simplicity
let auditLogs = [];
let backups = []; // Client-side for simplicity
let attendanceRecords = [];
let teacherAttendanceRecords = [];
let profiles = []; // New global variable for profiles
let exams = []; // Global variable for exams
let homeworkAssignments = []; // Global variable for homework
let holidays = []; // Global variable for holidays
let currentInvoiceId = null; // New global variable for tracking the invoice being edited
let teacherFaceRegStream = null;
const teacherFaceRegVideo = document.getElementById('teacherFaceRegVideo');
const teacherFaceRegCanvas = document.getElementById('teacherFaceRegCanvas');
const teacherFaceRegFeedback = document.getElementById('teacherFaceRegFeedback');


// Supabase Client Initialization (Replace with your actual keys)
const SUPABASE_URL = 'https://zyvwttzwjweeslvjbatg.supabase.co'; // Replace with your Supabase URL
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp5dnd0dHp3andlZXNsdmpiYXRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5NTQwODMsImV4cCI6MjA2OTUzMDA4M30.pgzB45XBJAyGBlkKUJF4Jr0yVNunXjwa8p8JOaX7Nso'; // Replace with your actual Supabase Anon Key
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Global variable to store loaded labeled descriptors
let labeledDescriptors = [];

/**
 * Loads labeled face descriptors for a given user type (e.g., 'teacher', 'student')
 * from Supabase storage.
 * @param {string} userType - 'teacher' or 'student'
 * @returns {Promise<faceapi.LabeledFaceDescriptors[]>} An array of LabeledFaceDescriptors.
 */
async function loadLabeledDescriptors(userType) {
    console.log(`Loading labeled descriptors for ${userType}s...`);
    const tableName = `${userType}_face_descriptors`; // Assuming a table like 'teacher_face_descriptors'
    // If you store descriptors directly in 'teacher_faces' table, adjust this:
    // const tableName = `${userType}_faces`;

    try {
        const { data, error } = await supabase
            .from(tableName)
            .select('teacher_id, descriptor'); // Select the ID and the descriptor JSONB column

        if (error) {
            console.error(`Error fetching ${userType} face descriptors:`, error);
            return [];
        }

        if (!data || data.length === 0) {
            console.warn(`No ${userType} face descriptors found in ${tableName}.`);
            return [];
        }

        const descriptors = data.map(item => {
            // Ensure the descriptor is a Float32Array
            const descriptorArray = new Float32Array(item.descriptor);
            // Use the teacher_id (UUID) as the label for recognition
            return new faceapi.LabeledFaceDescriptors(item.teacher_id, [descriptorArray]);
        });

        labeledDescriptors = descriptors; // Store globally if needed elsewhere
        console.log(`Loaded ${descriptors.length} labeled descriptors for ${userType}s.`);
        return descriptors;

    } catch (err) {
        console.error(`Unexpected error in loadLabeledDescriptors for ${userType}:`, err);
        return [];
    }
}



// =============================================
// FACE RECOGNITION MODULE
// =============================================

// Global variables

// Main initialization function
async function initFaceRecognition() {
  try {
    // Load models first
    await loadModels();
    
    // Setup camera if models loaded successfully
    if (modelsLoaded) {
      await setupCamera();
      isRecognitionActive = true;
      detectFaces();
      teacherFaceRecognitionFeedback.textContent = 'Face recognition started';
    }
  } catch (error) {
    console.error('Initialization failed:', error);
    teacherFaceRecognitionFeedback.textContent = 'Failed to initialize: ' + error.message;
  }
}

// Load all required models
async function loadModels() {
  try {
    console.log('Loading face recognition models...');
    teacherFaceRecognitionFeedback.textContent = 'Loading models...';
    
   async function loadFaceApiModels() {
    const MODEL_URL = './models';
    await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
    await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
    await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
    await faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL);
    await faceapi.nets.tinyYolov2.loadFromUri(MODEL_URL);
    console.log("✅ Face-api models loaded successfully");
}

    
    modelsLoaded = true;
    teacherFaceRecognitionFeedback.textContent = 'Models loaded successfully';
    console.log('Models loaded: SSD MobilenetV1, FaceLandmark68, FaceRecognition');
  } catch (error) {
    console.error('Model loading error:', error);
    teacherFaceRecognitionFeedback.textContent = 'Model loading failed';
    throw error;
  }
}

// Set up camera stream
async function setupCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ 
      video: { width: 640, height: 480 } 
    });
    videoElement.srcObject = stream;
    return new Promise((resolve) => {
      videoElement.onloadedmetadata = () => {
        videoElement.play();
        resolve();
      };
    });
  } catch (error) {
    console.error('Camera setup failed:', error);
    throw new Error('Could not access camera: ' + error.message);
  }
}

// Face detection loop
async function detectFaces() {
  if (!isRecognitionActive || !modelsLoaded) return;

  try {
    const detections = await faceapi.detectAllFaces(
      videoElement,
      new faceapi.SsdMobilenetv1Options()
    )
    .withFaceLandmarks()
    .withFaceDescriptors();

    if (detections.length > 0) {
      // Process detections
      const teacherId = await recognizeTeacher(detections[0].descriptor);
      if (teacherId) {
        await markTeacherAttendance(teacherId, 'face_recognition');
      }
    }

    // Continue detection loop
    requestAnimationFrame(detectFaces);
  } catch (error) {
    console.error('Detection error:', error);
    teacherFaceRecognitionFeedback.textContent = 'Detection error occurred';
  }
}

// Face matching function
async function recognizeTeacher(descriptor) {
  try {
    const { data: teacherFaces } = await supabase
      .from('teacher_faces')
      .select('teacher_id, descriptor');
    
    if (!teacherFaces || teacherFaces.length === 0) {
      return null;
    }

    const bestMatch = teacherFaces.reduce((match, face) => {
      const distance = faceapi.euclideanDistance(
        JSON.parse(face.descriptor),
        descriptor
      );
      return distance < (match.distance || Infinity) ? 
        { id: face.teacher_id, distance } : match;
    }, {});

    return bestMatch.distance < 0.6 ? bestMatch.id : null;
  } catch (error) {
    console.error('Recognition error:', error);
    return null;
  }
}

// Clean up function
function stopFaceRecognition() {
  isRecognitionActive = false;
  if (videoElement.srcObject) {
    videoElement.srcObject.getTracks().forEach(track => track.stop());
    videoElement.srcObject = null;
  }
  teacherFaceRecognitionFeedback.textContent = 'Face recognition stopped';
}

// =============================================
// EVENT LISTENERS
// =============================================

// Start when page loads
document.addEventListener('DOMContentLoaded', () => {
  // Optional: Auto-start recognition
  // initFaceRecognition();
  
  // Or use button click
  document.getElementById('startRecognition')?.addEventListener('click', initFaceRecognition);
  document.getElementById('stopRecognition')?.addEventListener('click', stopFaceRecognition);
});

// Global variables for face-api.js
const teacherFaceRecognitionVideo = document.getElementById('teacherFaceRecognitionVideo');
const teacherFaceRecognitionCanvas = document.getElementById('teacherFaceRecognitionCanvas');
let faceDetectionInterval = null; // To store the interval ID for face detection

// =============================================
// FACE RECOGNITION MODULE
// =============================================

// Global variables
let isRecognitionActive = false;
let modelsLoaded = false;
const teacherFaceRecognitionFeedback = document.getElementById('faceRecognitionFeedback');
const videoElement = document.getElementById('teacherFaceRecognitionVideo');

// Main initialization function
async function initFaceRecognition() {
  try {
    // Load models first
    await loadModels();
    
    // Setup camera if models loaded successfully
    if (modelsLoaded) {
      await setupCamera();
      isRecognitionActive = true;
      detectFaces();
      teacherFaceRecognitionFeedback.textContent = 'Face recognition started';
    }
  } catch (error) {
    console.error('Initialization failed:', error);
    teacherFaceRecognitionFeedback.textContent = 'Failed to initialize: ' + error.message;
  }
}

// Load all required models
async function loadModels() {
  try {
    console.log('Loading face recognition models...');
    teacherFaceRecognitionFeedback.textContent = 'Loading models...';
    
    await Promise.all([
      faceapi.nets.ssdMobilenetv1.loadFromUri('/models'),
      faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
      faceapi.nets.faceRecognitionNet.loadFromUri('/models')
    ]);
    
    modelsLoaded = true;
    teacherFaceRecognitionFeedback.textContent = 'Models loaded successfully';
    console.log('Models loaded: SSD MobilenetV1, FaceLandmark68, FaceRecognition');
  } catch (error) {
    console.error('Model loading error:', error);
    teacherFaceRecognitionFeedback.textContent = 'Model loading failed';
    throw error;
  }
}

// Set up camera stream
async function setupCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ 
      video: { width: 640, height: 480 } 
    });
    videoElement.srcObject = stream;
    return new Promise((resolve) => {
      videoElement.onloadedmetadata = () => {
        videoElement.play();
        resolve();
      };
    });
  } catch (error) {
    console.error('Camera setup failed:', error);
    throw new Error('Could not access camera: ' + error.message);
  }
}

// Face detection loop
async function detectFaces() {
  if (!isRecognitionActive || !modelsLoaded) return;

  try {
    const detections = await faceapi.detectAllFaces(
      videoElement,
      new faceapi.SsdMobilenetv1Options()
    )
    .withFaceLandmarks()
    .withFaceDescriptors();

    if (detections.length > 0) {
      // Process detections
      const teacherId = await recognizeTeacher(detections[0].descriptor);
      if (teacherId) {
        await markTeacherAttendance(teacherId, 'face_recognition');
      }
    }

    // Continue detection loop
    requestAnimationFrame(detectFaces);
  } catch (error) {
    console.error('Detection error:', error);
    teacherFaceRecognitionFeedback.textContent = 'Detection error occurred';
  }
}

// Face matching function
async function recognizeTeacher(descriptor) {
  try {
    const { data: teacherFaces } = await supabase
      .from('teacher_faces')
      .select('teacher_id, descriptor');
    
    if (!teacherFaces || teacherFaces.length === 0) {
      return null;
    }

    const bestMatch = teacherFaces.reduce((match, face) => {
      const distance = faceapi.euclideanDistance(
        JSON.parse(face.descriptor),
        descriptor
      );
      return distance < (match.distance || Infinity) ? 
        { id: face.teacher_id, distance } : match;
    }, {});

    return bestMatch.distance < 0.6 ? bestMatch.id : null;
  } catch (error) {
    console.error('Recognition error:', error);
    return null;
  }
}

// Clean up function
function stopFaceRecognition() {
  isRecognitionActive = false;
  if (videoElement.srcObject) {
    videoElement.srcObject.getTracks().forEach(track => track.stop());
    videoElement.srcObject = null;
  }
  teacherFaceRecognitionFeedback.textContent = 'Face recognition stopped';
}

// =============================================
// EVENT LISTENERS
// =============================================

// Start when page loads
document.addEventListener('DOMContentLoaded', () => {
  // Optional: Auto-start recognition
  // initFaceRecognition();
  
  // Or use button click
  document.getElementById('startRecognition')?.addEventListener('click', initFaceRecognition);
  document.getElementById('stopRecognition')?.addEventListener('click', stopFaceRecognition);
});

async function startTeacherFaceRecognition() {
    if (!teacherFaceRecognitionVideo || !teacherFaceRecognitionCanvas || !teacherFaceRecognitionFeedback) {
        console.error('Face recognition elements not found.');
        teacherFaceRecognitionFeedback.textContent = 'Face recognition elements not found.';
        return;
    }

    teacherFaceRecognitionFeedback.textContent = 'Checking models...';
    console.log('Starting face recognition...');
    try {
        await loadFaceApiModels();
    } catch (err) {
        teacherFaceRecognitionFeedback.textContent = 'Models failed to load. Cannot start.';
        console.error('Model loading failed:', err);
        return;
    }

    teacherFaceRecognitionFeedback.textContent = 'Starting camera...';
    try {
        if (teacherFaceRecognitionStream) {
            teacherFaceRecognitionStream.getTracks().forEach(track => track.stop());
        }

        teacherFaceRecognitionStream = await navigator.mediaDevices.getUserMedia({ video: true });
        teacherFaceRecognitionVideo.srcObject = teacherFaceRecognitionStream;
        console.log('Camera stream initialized.');

        teacherFaceRecognitionVideo.addEventListener('play', () => {
            if (teacherFaceRecognitionVideo.videoWidth === 0 || teacherFaceRecognitionVideo.videoHeight === 0) {
                teacherFaceRecognitionFeedback.textContent = 'Video not ready. Waiting for camera...';
                console.warn('Video dimensions not ready:', teacherFaceRecognitionVideo.videoWidth, teacherFaceRecognitionVideo.videoHeight);
                return;
            }
            teacherFaceRecognitionFeedback.textContent = 'Camera started. Detecting faces...';
            console.log('Video playing, starting detection. Dimensions:', teacherFaceRecognitionVideo.videoWidth, 'x', teacherFaceRecognitionVideo.videoHeight);
            const displaySize = { width: teacherFaceRecognitionVideo.videoWidth, height: teacherFaceRecognitionVideo.videoHeight };
            faceapi.matchDimensions(teacherFaceRecognitionCanvas, displaySize);

            if (faceDetectionInterval) {
                clearInterval(faceDetectionInterval);
            }

            faceDetectionInterval = setInterval(async () => {
                try {
                    const options = new faceapi.SsdMobilenetv1Options({ minConfidence: 0.3 });
                    const detections = await faceapi.detectAllFaces(teacherFaceRecognitionVideo, options).withFaceLandmarks();
                    const resizedDetections = faceapi.resizeResults(detections, displaySize);

                    teacherFaceRecognitionCanvas.getContext('2d').clearRect(0, 0, teacherFaceRecognitionCanvas.width, teacherFaceRecognitionCanvas.height);
                    faceapi.draw.drawDetections(teacherFaceRecognitionCanvas, resizedDetections);
                    faceapi.draw.drawFaceLandmarks(teacherFaceRecognitionCanvas, resizedDetections);

                    if (detections.length > 0) {
                        teacherFaceRecognitionFeedback.textContent = `Face detected! (${detections.length} face(s))`;
                        console.log('Faces detected:', detections);
                    } else {
                        teacherFaceRecognitionFeedback.textContent = 'No face detected. Ensure good lighting, center your face, and position closer to the camera.';
                        console.log('No faces detected in frame.');
                    }
                } catch (error) {
                    console.error('Error during face detection:', error);
                    teacherFaceRecognitionFeedback.textContent = 'Error during detection. Check console.';
                }
            }, 100);
        });

    } catch (err) {
        console.error('Error accessing camera:', err.name, err.message);
        let errorMessage = 'Error accessing camera. Please ensure camera is available.';
        if (err.name === 'NotAllowedError') {
            errorMessage = 'Camera access denied. Please grant camera permissions in your browser settings.';
        } else if (err.name === 'NotFoundError') {
            errorMessage = 'No camera found. Please connect a webcam and try again.';
        }
        teacherFaceRecognitionFeedback.textContent = errorMessage;
        alert(errorMessage);
    }
}
async function stopTeacherFaceRecognition() {
    if (teacherFaceRecognitionStream) {
        teacherFaceRecognitionStream.getTracks().forEach(track => track.stop());
        teacherFaceRecognitionStream = null;
    }
    if (faceDetectionInterval) {
        clearInterval(faceDetectionInterval);
        faceDetectionInterval = null;
    }
    if (teacherFacePlayHandlerRef) {
        teacherFaceRecognitionVideo.removeEventListener('play', teacherFacePlayHandlerRef);
        teacherFacePlayHandlerRef = null;
    }
    console.log("🛑 Teacher face recognition stopped");
}

// ========================
// Init on page load
// ========================
document.addEventListener('DOMContentLoaded', async () => {
    await loadFaceApiModels();
    // Optionally auto-start
    // await startTeacherFaceRecognition();
});

function toggleStudentFaceRecognitionSection() {
    const section = document.getElementById('studentFaceRecognitionSection');
    if (section.classList.contains('hidden')) {
        section.classList.remove('hidden');
    } else {
        section.classList.add('hidden');
    }
}

function toggleStudentFaceRegistrationSection() {
    const section = document.getElementById('studentFaceRegistrationSection');
    if (section.classList.contains('hidden')) {
        section.classList.remove('hidden');
    } else {
        section.classList.add('hidden');
    }
}
function toggleTeacherFaceRegistrationSection() {
    const section = document.getElementById('teacherFaceRegistrationSection');
    if (section.classList.contains('hidden')) {
        section.classList.remove('hidden');
        section.style.display = 'block';
    } else {
        section.classList.add('hidden');
        section.style.display = 'none';
        stopTeacherFaceRegistration(); // Stop camera when hiding
    }
}
function toggleTeacherFaceRecognitionSection() {
  const section = document.getElementById("teacherFaceRecognitionSection");
  if (!section) {
    console.warn("Teacher Face Recognition section not found!");
    return;
  }

  // Toggle hidden/display
  if (section.style.display === "none" || section.classList.contains("hidden")) {
    section.style.display = "block";
    section.classList.remove("hidden");
  } else {
    section.style.display = "none";
    section.classList.add("hidden");
  }
}



// Global variable for QR Scanner instances
let html5QrCodeScanner = null;
let html5QrCodeScannerTeacher = null; // For teacher QR scanner

// Ensure html5-qrcode is available. It's expected to be loaded via <script> tag in index.html
// This check is for robustness, but the primary loading mechanism is the HTML script tag.
function checkHtml5QrCodeAvailability() {
    if (typeof Html5QrcodeScanner === 'undefined') {
        console.error('Html5QrcodeScanner is not defined. Ensure html5-qrcode.min.js is loaded correctly.');
        alert('QR scanner library not loaded. Please check your internet connection or script path.');
        return false;
    }
    return true;
}


// --- IMPORTANT RLS NOTE ---
// If you are still getting 403 errors after this, ensure your Row Level Security (RLS) policies
// in Supabase are configured to allow 'SELECT', 'INSERT', 'UPDATE', 'DELETE' for the 'authenticated'
// and/or 'anon' roles on ALL tables your application interacts with.
//
// For testing, you can temporarily set very permissive policies like:
// CREATE POLICY "Allow all for authenticated users" ON your_table FOR ALL TO authenticated USING (true);
// CREATE POLICY "Allow all for anon users" ON your_table FOR ALL TO anon USING (true);
//
// Remember to refine these for production security!
//
// If you are getting 403 errors for attendance, specifically check:
// 1. RLS is ENABLED on the 'attendance' and 'teacher_attendance' tables.
// 2. There is a 'SELECT' policy for the 'authenticated' role (or 'anon' if needed before login)
//    on both 'attendance' and 'teacher_attendance' tables, with a 'USING' expression of 'true'.


// --- UI Utilities: Dark Mode and Exports ---
function applyDarkModeFromStorage() {
    const dark = localStorage.getItem('darkMode');
    const body = document.body;
    const darkModeIcon = document.getElementById('darkModeToggle')?.querySelector('i');

    if (dark === 'true') {
        body.classList.add('dark-mode');
        if (darkModeIcon) darkModeIcon.classList.replace('fa-moon', 'fa-sun');
    } else {
        body.classList.remove('dark-mode');
        if (darkModeIcon) darkModeIcon.classList.replace('fa-sun', 'fa-moon');
    }
}

function toggleDarkMode() {
    const body = document.body;
    const darkModeIcon = document.getElementById('darkModeToggle')?.querySelector('i');
    const isDark = body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', isDark ? 'true' : 'false');

    if (darkModeIcon) {
        if (isDark) {
            darkModeIcon.classList.replace('fa-moon', 'fa-sun');
        } else {
            darkModeIcon.classList.replace('fa-sun', 'fa-moon');
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const darkModeToggleBtn = document.getElementById('darkModeToggle');
    if (darkModeToggleBtn) {
        darkModeToggleBtn.addEventListener('click', toggleDarkMode);
    }
    applyDarkModeFromStorage();
});

// Export utilities
function exportChartAsPNG(chartCanvasId, filename = 'chart.png') {
    const canvas = document.getElementById(chartCanvasId);
    if (!canvas) {
        console.error(`Canvas with ID ${chartCanvasId} not found.`);
        return;
    }
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = filename;
    link.click();
}

function exportArrayToCSV(array, filename = 'export.csv') {
    if (!Array.isArray(array) || array.length === 0) { alert('No data to export'); return; }
    const keys = Object.keys(array[0]);
    const lines = [keys.join(',')].concat(array.map(row => keys.map(k => JSON.stringify(row[k] ?? '')).join(',')));
    const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

// Placeholder for Excel export functions (requires XLSX.js)
function exportStudentsToExcel() {
    if (students.length === 0) {
        alert('No student data to export.');
        return;
    }
    const ws = XLSX.utils.json_to_sheet(students);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Students");
    XLSX.writeFile(wb, "students_data.xlsx");
    console.log('Students data exported to Excel.');
}

function exportTeachersToExcel() {
    if (teachers.length === 0) {
        alert('No teacher data to export.');
        return;
    }
    const ws = XLSX.utils.json_to_sheet(teachers);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Teachers");
    XLSX.writeFile(wb, "teachers_data.xlsx");
    console.log('Teachers data exported to Excel.');
}

function exportHomeworkToExcel() {
    if (homeworkAssignments.length === 0) {
        alert('No homework data to export.');
        return;
    }
    const ws = XLSX.utils.json_to_sheet(homeworkAssignments);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Homework");
    XLSX.writeFile(wb, "homework_data.xlsx");
    console.log('Homework data exported to Excel.');
}

function exportStudentAttendanceToExcel() {
    if (attendanceRecords.length === 0) {
        alert('No student attendance data to export.');
        return;
    }
    const dataToExport = attendanceRecords.map(record => ({
        'Student Name': record.students?.name || 'N/A',
        'Roll No.': record.students?.roll_no || 'N/A',
        'Class': record.students?.class || 'N/A',
        'Date': record.date,
        'Status': record.status,
        'Remarks': record.remarks || ''
    }));
    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "StudentAttendance");
    XLSX.writeFile(wb, "student_attendance_data.xlsx");
    console.log('Student attendance data exported to Excel.');
}

function exportTeacherAttendanceToExcel() {
    if (teacherAttendanceRecords.length === 0) {
        alert('No teacher attendance data to export.');
        return;
    }
    const dataToExport = teacherAttendanceRecords.map(record => ({
        'Teacher Name': record.teachers?.name || 'N/A',
        'Subject': record.teachers?.subject || 'N/A',
        'Date': record.date,
        'Status': record.status,
        'Remarks': record.remarks || ''
    }));
    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "TeacherAttendance");
    XLSX.writeFile(wb, "teachers_attendance_data.xlsx");
    console.log('Teacher attendance data exported to Excel.');
}

// Placeholder for PDF export functions (requires jspdf)
function exportReportsToPdf() {
    alert('Generating reports PDF...');
    // Implement jspdf logic here to generate a PDF of the reports dashboard
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.text("School Reports", 10, 10);
    // Add content from charts and tables
    doc.save("school_reports.pdf");
    console.log('Reports PDF generation initiated.');
}

function generateHomeworkReport() {
    alert('Generating homework report PDF...');
    // Implement jspdf logic here to generate a PDF of homework assignments
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.text("Homework Assignments Report", 10, 10);
    // Add homework data
    doc.save("homework_report.pdf");
    console.log('Homework report PDF generation initiated.');
}

function exportStudentAttendanceToPdf() {
    alert('Generating student attendance PDF...');
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.text("Student Attendance Report", 10, 10);
    const tableColumn = ["Student Name", "Roll No.", "Class", "Date", "Status", "Remarks"];
    const tableRows = [];

    attendanceRecords.forEach(record => {
        const studentData = [
            record.students?.name || 'N/A',
            record.students?.roll_no || 'N/A',
            record.students?.class || 'N/A',
            record.date,
            record.status,
            record.remarks || ''
        ];
        tableRows.push(studentData);
    });

    doc.autoTable(tableColumn, tableRows, { startY: 20 });
    doc.save("student_attendance_report.pdf");
    console.log('Student attendance PDF generation initiated.');
}

function exportTeacherAttendanceToPdf() {
    alert('Generating teacher attendance PDF...');
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.text("Teacher Attendance Report", 10, 10);
    const tableColumn = ["Teacher Name", "Subject", "Date", "Status", "Remarks"];
    const tableRows = [];

    teacherAttendanceRecords.forEach(record => {
        const teacherData = [
            record.teachers?.name || 'N/A',
            record.teachers?.subject || 'N/A',
            record.date,
            record.status,
            record.remarks || ''
        ];
        tableRows.push(teacherData);
    });

    doc.autoTable(tableColumn, tableRows, { startY: 20 });
    doc.save("teacher_attendance_report.pdf");
    console.log('Teacher attendance PDF generation initiated.');
}

// --- Utility Functions ---

/**
 * Generates a unique UUID.
 * @returns {string} A UUID string.
 */
function generateUniqueId() {
    return crypto.randomUUID();
}

/**
 * Adds an entry to the audit_logs table in Supabase.
 * @param {string} userEmail - The email of the user performing the action.
 * @param {string} action - The action performed (e.g., 'Logged In', 'Added Student').
 * @param {string} module - The module where the action occurred (e.g., 'Authentication', 'Students').
 * @param {string} details - More specific details about the action.
 */
async function addAuditLog(userEmail, action, module, details) {
    try {
        const emailToLog = userEmail || 'anonymous@example.com';

        const { data, error } = await supabase.from('audit_logs').insert([
            {
                user_email: emailToLog,
                action: action,
                module: module,
                details: details,
                timestamp: new Date().toISOString()
            }
        ]);
        if (error) {
            console.error('Audit Log Error: Error adding audit log:', error);
            // Log the full error object for debugging RLS issues
            console.error('Audit Log Error: Supabase RLS or DB error details:', error.message, error.details, error.hint);
        } else {
            console.log('Audit Log Success: Audit log added:', data);
        }
    } catch (err) {
        console.error('Audit Log Unexpected Error:', err);
    }
}

/**
 * Converts an ArrayBuffer to a Base64 string.
 * Used for storing WebAuthn credentials.
 * @param {ArrayBuffer} buffer - The ArrayBuffer to convert.
 * @returns {string} The Base64 encoded string.
 */
function arrayBufferToBase64(buffer) {
    return btoa(String.fromCharCode.apply(null, new Uint8Array(buffer)));
}

/**
 * Converts a Base64 string to an ArrayBuffer.
 * Used for retrieving WebAuthn credentials.
 * @param {string} base64 - The Base64 string to convert.
 * @returns {ArrayBuffer} The ArrayBuffer.
 */
function base64ToArrayBuffer(base64) {
    const binary_string = atob(base64);
    const len = binary_string.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
}

// Placeholder for voice assistant
function startVoiceAssistant() {
    alert('Voice assistant functionality is not yet implemented.');
    console.log('Voice assistant started.');
}

// Placeholder for typing effect
function initTypedWelcome() {
    const typedWelcomeElement = document.getElementById('typed-welcome');
    if (typedWelcomeElement) {
        // Simple typing effect simulation
        const text = "Welcome to Tapowan Public School Management System";
        let i = 0;
        typedWelcomeElement.textContent = ''; // Clear content initially
        function typeWriter() {
            if (i < text.length) {
                typedWelcomeElement.textContent += text.charAt(i);
                i++;
                setTimeout(typeWriter, 50); // Typing speed
            }
        }
        typeWriter();
    }
}


// --- Data Fetching Functions (from Supabase) ---

async function fetchStudents() {
    console.log('Fetching students...');
    try {
        // Fetch students from the 'students' table
        const { data, error } = await supabase.from('students').select('*');
        if (error) throw error;
        students = data;
        console.log('Students fetched successfully:', students.length);
    } catch (error) {
        console.error('Error fetching students:', error);
        students = [];
    } finally {
        renderStudentTable();
        updateDashboardStats();
    }
}

async function fetchTeachers() {
    console.log('Fetching teachers...');
    try {
        const { data, error } = await supabase.from('teachers').select('*');
        if (error) throw error;
        teachers = data;
        console.log('Teachers fetched successfully:', teachers.length);
    } catch (error) {
        console.error('Error fetching teachers:', error);
        teachers = [];
    } finally {
        renderTeacherTable();
        updateDashboardStats();
    }
}
// Existing attendance functions...

// --- Face Recognition Attendance Functionality ---

// Function to initialize face recognition
async function initFaceRecognition() {
    const videoElement = document.getElementById('teacherFaceRecognitionVideo');
    const feedbackElement = document.getElementById('teacherFaceRecognitionFeedback');

    // Validate required elements exist
    if (!videoElement || !feedbackElement) {
        console.error('Required elements not found for face recognition');
        return false;
    }

    try {
        feedbackElement.textContent = 'Loading face recognition models...';
        
        // Load face-api.js models
        await loadFaceApiModels();
        feedbackElement.textContent = 'Models loaded. Starting camera...';

        // Request camera access (corrected method name)
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: true,
            audio: false  // Explicitly disable audio as we don't need it
        });

        // Set video source and handle playback
        videoElement.srcObject = stream;
        await videoElement.play();

        // Start face detection when video is playing
        videoElement.onplaying = () => {
            feedbackElement.textContent = 'Camera ready. Detecting faces...';
            detectionInterval = setInterval(detectFaces, 1000); // Save interval ID for cleanup
        };

        return true;
        
    } catch (error) {
        console.error('Face recognition initialization failed:', error);
        feedbackElement.textContent = `Error: ${error.message}. Please ensure camera permissions are granted.`;
        
        // Clean up if video was partially initialized
        if (videoElement.srcObject) {
            videoElement.srcObject.getTracks().forEach(track => track.stop());
            videoElement.srcObject = null;
        }
        
        return false;
    }
}

// Function to detect faces and recognize teachers
async function detectFaces() {
    const videoElement = document.getElementById('teacherFaceRecognitionVideo');
    const feedbackElement = document.getElementById('teacherFaceRecognitionFeedback');

    const detections = await faceapi.detectAllFaces(videoElement, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptors();

    if (detections.length > 0) {
        feedbackElement.textContent = 'Face detected! Attempting to recognize...';
        const descriptors = detections.map(d => d.descriptor);
        
        // Here you would compare the descriptors with stored teacher descriptors
        const recognizedTeacher = await recognizeTeacher(descriptors[0]); // Assuming single face detection for simplicity

        if (recognizedTeacher) {
            await markTeacherAttendance(recognizedTeacher.id, 'Face Recognition');
        } else {
            feedbackElement.textContent = 'Recognized face but no matching teacher found.';
        }
    } else {
        feedbackElement.textContent = 'No face detected. Please position your face in frame.';
    }
}



// Function to get the teacher ID based on the string ID
// Function to get the teacher ID based on the string ID



// Function to mark attendance for recognized teacher
// Modify markTeacherAttendance
async function markTeacherAttendance(teacherUuid, method) { // Renamed parameter for clarity
    const today = new Date().toISOString().split('T')[0];
    const currentTime = new Date().toTimeString().split(' ')[0];
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    const userEmail = loggedInUser?.email || 'Face Recognition System'; // Changed default for clarity

    try {
        // Fetch existing attendance records for the teacher on the current date
        const { data: existingRecords, error } = await supabase
            .from('teacher_attendance')
            .select('*')
            .eq('teacher_id', teacherUuid) // Use the UUID directly
            .eq('date', today);

        if (error) {
            console.error('Error fetching attendance:', error);
            await addAuditLog(userEmail, 'Error Fetching Attendance', 'Teacher Attendance', `Error fetching attendance for teacher UUID: ${teacherUuid}: ${error.message}`);
            return;
        }

        if (existingRecords && existingRecords.length > 0) {
            const existingRecord = existingRecords[0];
            if (existingRecord.arrival_time) {
                console.log(`Arrival already marked for teacher UUID: ${teacherUuid}`);
                teacherFaceRecognitionFeedback.textContent = `Arrival already marked for ${teacherUuid}.`;
                await addAuditLog(userEmail, 'Face Recognition Duplicate Arrival', 'Teacher Attendance', `Duplicate recognition for teacher UUID: ${teacherUuid}`);
            } else {
                // Update the existing record with arrival time
                const { error: updateError } = await supabase
                    .from('teacher_attendance')
                    .update({ arrival_time: currentTime, status: 'Present' })
                    .eq('id', existingRecord.id); // Update by the attendance record's ID

                if (updateError) {
                    console.error('Error updating attendance:', updateError);
                    throw updateError;
                }

                console.log(`Arrival marked for teacher UUID: ${teacherUuid}`);
                teacherFaceRecognitionFeedback.textContent = `Arrival marked for ${teacherUuid}.`;
                await addAuditLog(userEmail, 'Face Recognition Attendance Marked', 'Teacher Attendance', `Marked Arrival for teacher UUID: ${teacherUuid} via Face Recognition`);
            }
        } else {
            // Create a new attendance record if none exists
            const { error: insertError } = await supabase
                .from('teacher_attendance')
                .insert([{
                    teacher_id: teacherUuid, // Use the UUID directly
                    date: today,
                    status: 'Present',
                    arrival_time: currentTime,
                    remarks: method
                }]);

            if (insertError) {
                console.error('Error inserting attendance:', insertError);
                throw insertError;
            }

            console.log(`Attendance marked for teacher UUID: ${teacherUuid}`);
            teacherFaceRecognitionFeedback.textContent = `Attendance marked for ${teacherUuid}.`;
            await addAuditLog(userEmail, 'Face Recognition Attendance Marked', 'Teacher Attendance', `Marked Arrival for teacher UUID: ${teacherUuid} via Face Recognition`);
        }
    } catch (error) {
        console.error('Error marking attendance:', error);
        teacherFaceRecognitionFeedback.textContent = `Error marking attendance: ${error.message}`;
        await addAuditLog(userEmail, 'Face Recognition Attendance Failed', 'Teacher Attendance', `Error marking attendance for teacher UUID: ${teacherUuid}: ${error.message}`);
    }
}


// Function to stop face recognition
function stopFaceRecognition() {
    const videoElement = document.getElementById('teacherFaceRecognitionVideo');
    if (videoElement && videoElement.srcObject) {
        videoElement.srcObject.getTracks().forEach(track => track.stop());
        videoElement.srcObject = null;
    }
    console.log('Face recognition stopped.');
}

// Event listener to start face recognition when the page loads or when the module is accessed
document.addEventListener('DOMContentLoaded', async () => {
    await initFaceRecognition(); // Initialize face recognition on page load
});

// Existing attendance functions continue...

// --- Student Face Recognition ---
let studentFaceRecognitionStream = null;
const studentFaceRecognitionVideo = document.getElementById('studentFaceRecognitionVideo');
const studentFaceRecognitionCanvas = document.getElementById('studentFaceRecognitionCanvas');
const studentFaceRecognitionFeedback = document.getElementById('studentFaceRecognitionFeedback');
let studentFaceDetectionInterval = null;

async function startStudentFaceRecognition() {
    studentFaceRecognitionFeedback.textContent = 'Starting camera...';
    try {
        if (studentFaceRecognitionStream) {
            studentFaceRecognitionStream.getTracks().forEach(track => track.stop());
        }
        studentFaceRecognitionStream = await navigator.mediaDevices.getUserMedia({ video: true });
        studentFaceRecognitionVideo.srcObject = studentFaceRecognitionStream;

        studentFaceRecognitionVideo.addEventListener('play', () => {
            studentFaceRecognitionFeedback.textContent = 'Detecting faces...';
            const displaySize = { width: studentFaceRecognitionVideo.width, height: studentFaceRecognitionVideo.height };
            faceapi.matchDimensions(studentFaceRecognitionCanvas, displaySize);

            if (studentFaceDetectionInterval) clearInterval(studentFaceDetectionInterval);

            studentFaceDetectionInterval = setInterval(async () => {
                const detections = await faceapi
                    .detectAllFaces(studentFaceRecognitionVideo, new faceapi.TinyFaceDetectorOptions())
                    .withFaceLandmarks();

                const resizedDetections = faceapi.resizeResults(detections, displaySize);
                studentFaceRecognitionCanvas.getContext('2d').clearRect(0, 0, studentFaceRecognitionCanvas.width, studentFaceRecognitionCanvas.height);
                faceapi.draw.drawDetections(studentFaceRecognitionCanvas, resizedDetections);
                faceapi.draw.drawFaceLandmarks(studentFaceRecognitionCanvas, resizedDetections);

                if (detections.length > 0) {
                    studentFaceRecognitionFeedback.textContent = `Face detected (${detections.length})`;
                    // Simulated match
                    await markStudentAttendance('student1', 'Face Recognition');
                } else {
                    studentFaceRecognitionFeedback.textContent = 'No face detected';
                }
            }, 1000);
        });
    } catch (err) {
        console.error('Error starting student face recognition:', err);
        studentFaceRecognitionFeedback.textContent = 'Camera error';
    }
}

async function stopStudentFaceRecognition() {
    if (studentFaceDetectionInterval) {
        clearInterval(studentFaceDetectionInterval);
        studentFaceDetectionInterval = null;
    }
    if (studentFaceRecognitionStream) {
        studentFaceRecognitionStream.getTracks().forEach(track => track.stop());
        studentFaceRecognitionStream = null;
    }
    studentFaceRecognitionVideo.srcObject = null;
    studentFaceRecognitionCanvas.getContext('2d').clearRect(0, 0, studentFaceRecognitionCanvas.width, studentFaceRecognitionCanvas.height);
    studentFaceRecognitionFeedback.textContent = 'Stopped';
}

async function markStudentAttendance(studentId, method) {
    const today = new Date().toISOString().split('T')[0];
    const currentTime = new Date().toTimeString().split(' ')[0];

    try {
        // Step 1: Get real UUID from students table
        const { data: student, error: studentFetchError } = await supabase
            .from('students')
            .select('id')
            .eq('custom_id', studentId) // your "student1" stored here
            .single();

        if (studentFetchError || !student) {
            console.error('Student not found:', studentFetchError);
            return;
        }

        // Step 2: Check if attendance already exists for today
        const { data: existingRecords, error: checkError } = await supabase
            .from('attendance')
            .select('*')
            .eq('student_id', student.id) // ✅ now using UUID
            .eq('attendance_date', today);

        if (checkError) {
            console.error('Error checking attendance:', checkError);
            return;
        }

        if (existingRecords && existingRecords.length > 0) {
            console.log('Already marked');
        } else {
            // Step 3: Insert attendance
            const { error: insertError } = await supabase
                .from('attendance')
                .insert([{
                    student_id: student.id, // real UUID
                    attendance_date: today,
                    status: 'Present',
                    arrival_time: currentTime,
                    remarks: method
                }]);

            if (insertError) {
                console.error('Error inserting attendance:', insertError);
            } else {
                console.log('Student attendance marked');
            }
        }
    } catch (err) {
        console.error('Unexpected error marking student attendance:', err);
    }
}

let studentFaceRegStream = null;
const studentFaceRegVideo = document.getElementById('studentFaceRegVideo');
const studentFaceRegCanvas = document.getElementById('studentFaceRegCanvas');
const studentFaceRegFeedback = document.getElementById('studentFaceRegFeedback');

async function startStudentFaceRegistration() {
    const studentId = document.getElementById('studentFaceRegId').value.trim();
    if (!studentId) {
        studentFaceRegFeedback.textContent = "Enter Student ID first";
        return;
    }

    try {
        studentFaceRegStream = await navigator.mediaDevices.getUserMedia({ video: true });
        studentFaceRegVideo.srcObject = studentFaceRegStream;

        studentFaceRegVideo.addEventListener('play', async () => {
            studentFaceRegFeedback.textContent = "Detecting face...";

            const detections = await faceapi
                .detectSingleFace(studentFaceRegVideo, new faceapi.TinyFaceDetectorOptions())
                .withFaceLandmarks()
                .withFaceDescriptor();

            if (detections) {
                const ctx = studentFaceRegCanvas.getContext('2d');

                // Draw video frame into canvas
                ctx.drawImage(studentFaceRegVideo, 0, 0, studentFaceRegCanvas.width, studentFaceRegCanvas.height);

                // Convert to Blob and upload to Supabase
                studentFaceRegCanvas.toBlob(async (blob) => {
                    if (!blob) {
                        console.error("Canvas is empty, blob is null");
                        studentFaceRegFeedback.textContent = "Capture failed, try again.";
                        return;
                    }

                    const fileName = `${studentId}.png`;
                    const { data, error } = await supabase.storage
                        .from('student-faces')
                        .upload(fileName, blob, { upsert: true });

                    if (!error) {
                        const { data: publicData } = supabase
                            .storage
                            .from('student-faces')
                            .getPublicUrl(fileName);

                        await supabase.from('student_faces').insert([{
                            student_id: studentId,
                            face_url: publicData.publicUrl
                        }]);

                        studentFaceRegFeedback.textContent = "Face registered successfully!";
                    } else {
                        console.error(error);
                        studentFaceRegFeedback.textContent = "Upload failed.";
                    }
                }, "image/png");
            } else {
                studentFaceRegFeedback.textContent = "No face detected. Try again.";
            }
        }, { once: true });

    } catch (err) {
        console.error(err);
        studentFaceRegFeedback.textContent = "Camera error";
    }
}

function stopStudentFaceRegistration() {
    if (studentFaceRegStream) {
        studentFaceRegStream.getTracks().forEach(track => track.stop());
        studentFaceRegStream = null;
    }
    studentFaceRegVideo.srcObject = null;
}

async function startTeacherFaceRegistration() {
    const teacherId = document.getElementById('teacherFaceRegId').value.trim();
    if (!teacherId) {
        teacherFaceRegFeedback.textContent = "Enter Teacher ID first";
        return;
    }

    teacherFaceRegFeedback.textContent = 'Starting camera...';
    try {
        // Stop any existing stream
        if (teacherFaceRegStream) {
            teacherFaceRegStream.getTracks().forEach(track => track.stop());
        }

        // Start the camera
        teacherFaceRegStream = await navigator.mediaDevices.getUserMedia({ video: true });
        teacherFaceRegVideo.srcObject = teacherFaceRegStream;

        // Wait for the video to start playing
        teacherFaceRegVideo.addEventListener('play', async () => {
            teacherFaceRegFeedback.textContent = "Detecting face...";

            // Wait a moment to ensure the frame is ready
            await new Promise(resolve => setTimeout(resolve, 500));

            try {
                const detections = await faceapi
                    .detectSingleFace(teacherFaceRegVideo, new faceapi.TinyFaceDetectorOptions())
                    .withFaceLandmarks()
                    .withFaceDescriptor();

                if (detections && detections.descriptor) {
                    // Convert descriptor to array
                    const descriptorArray = Array.from(detections.descriptor);

                    // Save descriptor directly into Supabase table
                    const { data: descriptorData, error: descriptorError } = await supabase
                        .from('teacher_face_descriptors')
                        .insert([{
                            teacher_id: teacherId, // must match DB type
                            descriptor: descriptorArray
                        }]);

                    if (descriptorError) {
                        console.error("Error saving face descriptor:", descriptorError);
                        teacherFaceRegFeedback.textContent = "Error saving face descriptor.";
                        return;
                    } else {
                        console.log("Face descriptor saved successfully:", descriptorData);
                    }

                    // 🖼 Capture image from video
                    const ctx = teacherFaceRegCanvas.getContext('2d');
                    teacherFaceRegCanvas.width = teacherFaceRegVideo.videoWidth;
                    teacherFaceRegCanvas.height = teacherFaceRegVideo.videoHeight;
                    ctx.drawImage(teacherFaceRegVideo, 0, 0, teacherFaceRegCanvas.width, teacherFaceRegCanvas.height);

                    teacherFaceRegCanvas.toBlob(async (blob) => {
                        if (!blob) {
                            console.error("Canvas is empty, blob is null");
                            teacherFaceRegFeedback.textContent = "Capture failed, try again.";
                            return;
                        }

                        const fileName = `${teacherId}.png`;
                        const { error: uploadError } = await supabase.storage
                            .from('teacher_faces')
                            .upload(fileName, blob, { upsert: true });

                        if (uploadError) {
                            console.error("Error uploading face image:", uploadError);
                            teacherFaceRegFeedback.textContent = "Upload failed.";
                            return;
                        }

                        // Get public URL for the uploaded image
                        const { data: publicData } = supabase
                            .storage
                            .from('teacher_faces')
                            .getPublicUrl(fileName);

                        // Insert record into teacher_faces table
                        const { error: dbError } = await supabase.from('teacher_faces').insert([{
                            teacher_id: teacherId,
                            face_url: publicData.publicUrl
                        }]);

                        if (dbError) {
                            console.error("Error saving face data to database:", dbError);
                            teacherFaceRegFeedback.textContent = "Error saving face data to database.";
                        } else {
                            teacherFaceRegFeedback.textContent = "Face registered successfully!";
                            console.log(`Teacher face for ID ${teacherId} registered and uploaded.`);
                        }
                    }, "image/png");

                } else {
                    teacherFaceRegFeedback.textContent = "No face detected. Please ensure your face is clearly visible.";
                }

            } catch (err) {
                console.error("Error detecting/saving face:", err);
                teacherFaceRegFeedback.textContent = "Face detection or saving error.";
            }
        }, { once: true });

    } catch (err) {
        console.error("Error starting teacher face registration:", err);
        teacherFaceRegFeedback.textContent = `Camera error: ${err.message}. Please ensure camera permissions are granted.`;
    }
}



function stopTeacherFaceRegistration() {
    if (teacherFaceRegStream) {
        teacherFaceRegStream.getTracks().forEach(track => track.stop());
        teacherFaceRegStream = null;
    }
    if (teacherFaceRegVideo) {
        teacherFaceRegVideo.srcObject = null;
    }
    if (teacherFaceRegCanvas) {
        const ctx = teacherFaceRegCanvas.getContext('2d');
        ctx.clearRect(0, 0, teacherFaceRegCanvas.width, teacherFaceRegCanvas.height);
    }
    if (teacherFaceRegFeedback) {
        teacherFaceRegFeedback.textContent = 'Registration stopped.';
    }
    console.log('Teacher face registration stopped.');
}


async function fetchPayrollEntries() {
    console.log('Fetching payroll entries...');
    try {
        const { data, error } = await supabase.from('payroll').select('*');
        if (error) throw error;
        payrollEntries = data;
        console.log('Payroll entries fetched successfully:', payrollEntries.length);
    } catch (error) {
        console.error('Error fetching payroll entries:', error);
        payrollEntries = [];
    } finally {
        renderPayrollTable();
    }
}

async function fetchInvoices() {
    console.log('Fetching invoices...');
    try {
        const { data, error } = await supabase.from('finance').select(`
            *,
            students (
                id,
                name,
                class,
                father_name
            )
        `);
        if (error) throw error;
        invoices = data;
        console.log('Invoices fetched successfully:', invoices.length);
    } catch (error) {
        console.error('Error fetching invoices:', error);
        invoices = [];
    } finally {
        renderFinanceTable();
        updateDashboardStats();
    }
}

async function fetchAnnouncements() {
    console.log('Fetching announcements...');
    try {
        const { data, error } = await supabase.from('announcements').select('*');
        if (error) throw error;
        announcements = data;
        console.log('Announcements fetched successfully:', announcements.length);
    } catch (error) {
        console.error('Error fetching announcements:', error);
        announcements = [];
    } finally {
        renderAnnouncementTable();
    }
}

async function fetchNotifications() {
    console.log('Fetching notifications (client-side simulation)...');
    // Notifications are still client-side for simplicity, but could be fetched from DB
    notifications = JSON.parse(localStorage.getItem('notifications')) || [
        { id: 1, title: "New student enrolled!", description: "Emily Johnson joined Grade 10.", time: "5 minutes ago", unread: true },
        { id: 2, title: "Payroll processed", description: "March payroll completed for all staff.", time: "1 hour ago", unread: true },
        { id: 3, title: "Event Reminder", description: "Parent-Teacher meeting tomorrow at 3 PM.", time: "Yesterday", unread: true },
        { id: 4, title: "System Update", description: "System maintenance scheduled for Sunday.", time: "2 days ago", unread: false },
    ];
    renderDropdownNotifications();
    console.log('Notifications loaded:', notifications.length);
}

async function fetchAuditLogs() {
    console.log('Fetching audit logs...');
    try {
        const { data, error } = await supabase.from('audit_logs').select('*').order('timestamp', { ascending: false });
        if (error) throw error;
        auditLogs = data;
        console.log('Audit logs fetched successfully:', auditLogs.length);
    } catch (error) {
        console.error('Error fetching audit logs:', error);
        auditLogs = [];
    } finally {
        renderAuditLogs();
        renderRecentActivity();
    }
}

async function fetchBackups() {
    console.log('Fetching backups (client-side simulation)...');
    // Backups are simulated, but could be fetched from a storage service
    backups = JSON.parse(localStorage.getItem('backups')) || [
        { id: 'B001', backup_id: 'BK20231026-001', date: '2023-10-26 02:00:00', size: '150 MB', type: 'Full' },
        { id: 'B002', backup_id: 'BK20231025-001', date: '2023-10-25 02:00:00', size: '148 MB', type: 'Full' }
    ];
    renderBackupTable();
    console.log('Backups loaded:', backups.length);
}

async function fetchAttendanceRecords() {
    console.log('Fetching student attendance records...');
    try {
        // Fetch attendance records and join with students table to get student details
        const { data, error } = await supabase
            .from('attendance')
            .select(`
                *,
                students (
                    id,
                    name,
                    class,
                    roll_no
                )
            `);
        if (error) {
            console.error('Error fetching student attendance records:', error);
            console.error('Supabase RLS or DB error details for student attendance:', error.message, error.details, error.hint);
            if (error.code === '403') {
                console.error("Received 403 Forbidden for student attendance. Check RLS policies for 'attendance' table.");
            }
            throw error; // Re-throw to ensure finally block is reached
        }
        attendanceRecords = data;
        console.log('Student attendance records fetched successfully:', attendanceRecords.length);
    } catch (error) {
        console.error('Caught error fetching student attendance, setting attendanceRecords to empty array.');
        attendanceRecords = [];
    } finally {
        // Ensure renderAttendanceTable is called after data is fetched
        renderAttendanceTable();
        // Also update dashboard stats that rely on attendance
        updateDashboardStats();
    }
}

async function fetchTeacherAttendanceRecords() {
    console.log('Fetching teacher attendance records...');
    try {
        // Fetch teacher attendance records and join with teachers table to get teacher details
        const { data, error } = await supabase
            .from('teacher_attendance')
            .select(`
                *,
                teachers (
                    id,
                    name,
                    subject
                )
            `);
        if (error) {
            console.error('Error fetching teacher attendance records:', error);
            console.error('Supabase RLS or DB error details for teacher attendance:', error.message, error.details, error.hint);
            if (error.code === '403') {
                console.error("Received 403 Forbidden for teacher attendance. Check RLS policies for 'teacher_attendance' table.");
            }
            throw error; // Re-throw to ensure finally block is reached
        }
        teacherAttendanceRecords = data;
        console.log('Teacher attendance records fetched successfully:', teacherAttendanceRecords.length);
    }
    catch (error) {
        console.error('Caught error fetching teacher attendance, setting teacherAttendanceRecords to empty array.');
        teacherAttendanceRecords = [];
    } finally {
        renderTeacherAttendanceTable();
        updateDashboardStats();
    }
}

async function fetchProfiles() {
    console.log('Fetching user profiles...');
    try {
        const { data, error } = await supabase.from('profiles').select('*');
        if (error) throw error;
        profiles = data;
        console.log('User profiles fetched successfully:', profiles.length);
    } catch (error) {
        console.error('Error fetching profiles:', error);
        profiles = [];
    } finally {
        renderUserTable();
    }
}

async function fetchExams() {
    console.log('Fetching exams...');
    try {
        const { data, error } = await supabase.from('exams').select('*');
        if (error) throw error;
        exams = data;
        console.log('Exams fetched successfully:', exams.length);
    } catch (error) {
        console.error('Error fetching exams:', error);
        exams = [];
    } finally {
        renderExams();
    }
}

async function fetchHomework() {
    console.log('Fetching homework assignments...');
    try {
        const { data, error } = await supabase.from('homework').select('*');
        if (error) throw error;
        homeworkAssignments = data;
        console.log('Homework assignments fetched successfully:', homeworkAssignments.length);
    } catch (error) {
        console.error('Error fetching homework:', error);
        homeworkAssignments = [];
    } finally {
        renderHomeworkTable();
    }
}

async function fetchHolidays() {
    console.log('Fetching holidays...');
    try {
        const { data, error } = await supabase.from('holidays').select('*');
        if (error) throw error;
        holidays = data;
        console.log('Holidays fetched successfully:', holidays.length);
    } catch (error) {
        console.error('Error fetching holidays:', error);
        holidays = [];
    } finally {
        renderHolidayList();
    }
}

/**
 * Fetches the role of a specific user from the 'profiles' table.
 * @param {string} userId - The UUID of the user.
 * @returns {Promise<string|null>} The role of the user (e.g., 'admin', 'teacher', 'student') or null if not found.
 */
async function fetchUserRole(userId) {
    console.log(`Fetching role for user ID: ${userId}`);
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', userId)
            .single();

        if (error) {
            console.error('Error fetching user role:', error);
            return null;
        }

        if (data) {
            console.log(`User role for ${userId}: ${data.role}`);
            return data.role;
        } else {
            console.warn(`No profile found for user ID: ${userId}`);
            return null;
        }
    } catch (err) {
        console.error('Unexpected error in fetchUserRole:', err);
        return null;
    }
}

// --- Initial Data Load ---
async function loadAllData() {
    console.log('Loading all initial data...');
    await Promise.all([
        fetchStudents(),
        fetchTeachers(),
        fetchPayrollEntries(),
        fetchInvoices(),
        fetchAnnouncements(),
        fetchNotifications(), // Still local
        fetchAuditLogs(),
        fetchBackups(), // Still local
        fetchAttendanceRecords(), // Ensure this is awaited
        fetchTeacherAttendanceRecords(), // Ensure this is awaited
        fetchProfiles(),
        fetchExams(), // Fetch exams
        fetchHomework(), // Fetch homework
        fetchHolidays() // Fetch holidays
    ]);
    console.log('All initial data loaded.');
    updateDashboardStats();
    renderHolidayList();
}

// --- UI Element References ---

// Login UI Elements
const loginUi = document.getElementById('login-ui');
const schoolSiteUi = document.getElementById('school-site-ui');
const roleButtons = document.querySelectorAll('.role-button');
const selectedRoleInput = document.getElementById('selectedRole');
const loginForm = document.getElementById('loginForm');
const forgotPasswordLink = document.getElementById('forgotPasswordLink');
const forgotPasswordModal = document.getElementById('forgotPasswordModal');
const closeForgotPasswordModal = document.getElementById('closeForgotPasswordModal');
const forgotPasswordForm = document.getElementById('forgotPasswordForm');
const signUpButton = document.getElementById('signUpButton');
const signUpModal = document.getElementById('signUpModal');
const closeSignUpModal = document.getElementById('closeSignUpModal');
const signUpForm = document.getElementById('signUpForm');

// School Site UI Elements
const logoutButton = document.getElementById('logoutButton');
const notificationButton = document.getElementById('notificationButton');
const notificationDropdown = document.getElementById('notificationDropdown');
const markAllReadBtn = document.getElementById('markAllReadBtn');
const viewAllNotificationsLink = document.getElementById('viewAllNotificationsLink');
const notificationList = document.getElementById("notificationList");
const notificationCount = document.getElementById("notificationCount");
const newCount = document.getElementById("newCount");
const loggedInUserName = document.getElementById('loggedInUserName');
const currentModuleTitle = document.getElementById('currentModuleTitle');

const viewAllModal = document.getElementById("viewAllModal");
const viewAllNotificationList = document.getElementById("viewAllNotificationList");
const closeViewAllModal = document.getElementById("closeViewAllModal");
const modalMarkAllReadBtn = document.getElementById("modalMarkAllReadBtn");

const openPayrollModalBtn = document.getElementById('openPayrollModalBtn');
const payrollModal = document.getElementById('payrollModal');
const closePayrollModalBtn = document.getElementById('closePayrollModalBtn');
const payrollForm = document.getElementById('payrollForm');
const payrollTableBody = document.getElementById('payrollTableBody');
const searchPayrollPeriodInput = document.getElementById('searchPayrollPeriod');
const applyPayrollSearchButton = document.getElementById('applyPayrollSearch');

const openAddInvoiceModalBtn = document.getElementById('openAddInvoiceModalBtn');
const addInvoiceModal = document.getElementById('addInvoiceModal');
const closeAddInvoiceModalBtn = document.getElementById('closeAddInvoiceModalBtn');
const addInvoiceForm = document.getElementById('addInvoiceForm');
const financeTableBody = document.getElementById('financeTableBody');
const searchInvoiceNumberInput = document.getElementById('searchInvoiceNumber');
const applyInvoiceSearchButton = document.getElementById('applyInvoiceSearch');
const invoiceStudentSelect = document.getElementById('invoiceStudentId');

const userProfileToggle = document.getElementById('userProfileToggle');
const userDropdown = document.getElementById('userDropdown');

const searchStudentNameInput = document.getElementById('searchStudentName');
const searchRollInput = document.getElementById('searchRoll');
const searchClassSelect = document.getElementById('searchClass');
const applyStudentSearchButton = document.getElementById('applyStudentSearch');
const studentTableBody = document.getElementById('studentTableBody');

const studentModal = document.getElementById('studentModal');
const closeStudentModal = document.getElementById('closeStudentModal');
const studentForm = document.getElementById('studentForm');
const studentModalTitle = document.getElementById('studentModalTitle');
const studentFormSubmitBtn = document.getElementById('studentFormSubmitBtn');
const studentDetailsModal = document.getElementById('studentDetailsModal');
const closeStudentDetailsModal = document.getElementById('closeStudentDetailsModal');
const studentDetailsContent = document.getElementById('studentDetailsContent');


const searchTeacherNameInput = document.getElementById('searchTeacherName');
const searchTeacherSubjectSelect = document.getElementById('searchTeacherSubject');
const applyTeacherSearchButton = document.getElementById('applyTeacherSearch');
const teacherModal = document.getElementById('teacherModal');
const closeTeacherModal = document.getElementById('closeTeacherModal');
const teacherForm = document.getElementById('teacherForm');
const teacherTableBody = document.getElementById('teacherTableBody');
const teacherModalTitle = document.getElementById('teacherModalTitle');
const teacherFormSubmitBtn = document.getElementById('teacherFormSubmitBtn');
const teacherDetailsModal = document.getElementById('teacherDetailsModal');
const closeTeacherDetailsModal = document.getElementById('closeTeacherDetailsModal');
const teacherDetailsContent = document.getElementById('teacherDetailsContent');

const userModal = document.getElementById('userModal');
const closeUserModal = document.getElementById('closeUserModal');
const userForm = document.getElementById('userForm');
const userTableBody = document.getElementById('userTableBody');
const userModalTitle = document.getElementById('userModalTitle');
const userFormSubmitBtn = document.getElementById('userFormSubmitBtn');

const announcementModal = document.getElementById('announcementModal');
const closeAnnouncementModal = document.getElementById('closeAnnouncementModal');
const announcementForm = document.getElementById('announcementForm');
const announcementTableBody = document.getElementById('announcementTableBody');
const announcementModalTitle = document.getElementById('announcementModalTitle');
const announcementFormSubmitBtn = document.getElementById('announcementFormSubmitBtn');

const auditLogTableBody = document.getElementById('auditLogTableBody');
const backupTableBody = document.getElementById('backupTableBody');
const recentActivityList = document.getElementById('recentActivityList');

// Dashboard Stats Elements
const totalStudentsCount = document.getElementById('totalStudentsCount');
const totalTeachersCount = document.getElementById('totalTeachersCount');
const monthlyRevenue = document.getElementById('monthlyRevenue');
const upcomingEventsCount = document.getElementById('upcomingEventsCount');
const studentsPresentToday = document.getElementById('studentsPresentToday');
const teachersPresentToday = document.getElementById('teachersPresentToday');

// Chart.js instances (These are for dashboard charts, not reports)
// Centralized chart update scheduler to avoid multiple re-initializations
let chartUpdateScheduled = false;
function scheduleChartUpdate() {
    if (chartUpdateScheduled) return;
    chartUpdateScheduled = true;
    // Use requestAnimationFrame to batch DOM work and avoid layout thrash
    requestAnimationFrame(() => {
        try {
            initCharts(); // Call initCharts directly here
        } finally {
            chartUpdateScheduled = false;
        }
    });
}
/** Utility to safely destroy a Chart.js instance **/
function safeDestroy(chartInstance) {
    try {
        if (chartInstance && typeof chartInstance.destroy === 'function') {
            chartInstance.destroy();
        }
    } catch (e) {
        console.warn('Error destroying chart instance:', e);
    }
}

let financeOverviewChartInstance = null;
let studentAttendanceChartInstance = null;
let teacherAttendanceChartInstance = null;
let monthlyAttendanceTrendChartInstance = null;

// Student Attendance Module Elements
const attendanceModal = document.getElementById('attendanceModal');
const closeAttendanceModal = document.getElementById('closeAttendanceModal');
const attendanceForm = document.getElementById('attendanceForm');
const attendanceModalTitle = document.getElementById('attendanceModalTitle');
const attendanceFormSubmitBtn = document.getElementById('attendanceFormSubmitBtn');
const attendanceStudentSelect = document.getElementById('attendanceStudentSelect');
const attendanceTableBody = document.getElementById('attendanceTableBody');
const attendanceClassFilter = document.getElementById('attendanceClassFilter');
const attendanceDateFilter = document.getElementById('attendanceDateFilter');
const attendanceStudentNameFilter = document.getElementById('attendanceStudentNameFilter');
const applyAttendanceFilter = document.getElementById('applyAttendanceFilter');
const attendanceTotalStudents = document.getElementById('attendanceTotalStudents');
const attendanceTotalPresent = document.getElementById('attendanceTotalPresent');
const attendanceTotalAbsent = document.getElementById('attendanceTotalAbsent');
const registerStudentFingerprintBtn = document.getElementById('registerStudentFingerprintBtn');
const verifyStudentFingerprintBtn = document.getElementById('verifyStudentFingerprintBtn');
const qrScannerSection = document.getElementById('qrScannerSection');
const qrVideo = document.getElementById('qrVideo');
const classAttendanceSelect = document.getElementById('classAttendanceSelect');
const classAttendanceDate = document.getElementById('classAttendanceDate');
const loadClassStudentsBtn = document.getElementById('loadClassStudentsBtn');
const markAllPresentBtn = document.getElementById('markAllPresentBtn'); // Corrected ID
const classAttendanceTableBody = document.getElementById('classAttendanceTableBody');

// Teacher Attendance Module Elements
const teacherAttendanceModal = document.getElementById('teacherAttendanceModal');
const closeTeacherAttendanceModal = document.getElementById('closeTeacherAttendanceModal');
const teacherAttendanceForm = document.getElementById('teacherAttendanceForm');
const teacherAttendanceModalTitle = document.getElementById('teacherAttendanceModalTitle');
const teacherAttendanceFormSubmitBtn = document.getElementById('teacherAttendanceFormSubmitBtn');
const teacherAttendanceTeacherSelect = document.getElementById('teacherAttendanceTeacherSelect');
const teacherAttendanceRecordsTableBody = document.getElementById('teacherAttendanceTableBody');
const teacherAttendanceSubjectFilter = document.getElementById('teacherAttendanceSubjectFilter');
const teacherAttendanceDateFilter = document.getElementById('teacherAttendanceDateFilter');
const teacherAttendanceNameFilter = document.getElementById('teacherAttendanceNameFilter');
const applyTeacherAttendanceFilter = document.getElementById('applyTeacherAttendanceFilter');
const teacherAttendanceTotalTeachers = document.getElementById('teacherAttendanceTotalTeachers');
const teacherAttendanceTotalPresent = document.getElementById('teacherAttendanceTotalPresent');
const teacherAttendanceTotalAbsent = document.getElementById('teacherAttendanceTotalAbsent');
const registerTeacherFingerprintBtn = document.getElementById('registerTeacherFingerprintBtn');
const verifyTeacherFingerprintBtn = document.getElementById('verifyTeacherFingerprintBtn');
const teacherQrScannerSection = document.getElementById('teacherQrScannerSection');
const teacherQrVideo = document.getElementById('teacherQrVideo');

// QR Code Modal Elements
const studentQrCodeModal = document.getElementById('studentQrCodeModal');
const closeStudentQrCodeModal = document.getElementById('closeStudentQrCodeModal');
const studentQrCodeCanvas = document.getElementById('studentQrCodeCanvas');
const qrCodeStudentIdDisplay = document.getElementById('qrCodeStudentIdDisplay');
const downloadQrCodeLink = document.getElementById('downloadQrCodeLink');

// Exam Module Elements
const examTableBody = document.getElementById('examTableBody');
const examModal = document.getElementById('examModal');
const closeExamModal = document.getElementById('closeExamModal');
const examForm = document.getElementById('examForm');
const examModalTitle = document.getElementById('examModalTitle');
const examFormSubmitBtn = document.getElementById('examFormSubmitBtn');
let currentExamId = null;

// Generate Exam Results Modal elements
const generateResultsModal = document.getElementById('generateResultsModal');
const closeGenerateResultsModal = document.getElementById('closeGenerateResultsModal');
const generateResultsForm = document.getElementById('generateResultsForm');
const resultsClassFilter = document.getElementById('resultsClassFilter');
const resultsExamTypeFilter = document.getElementById('resultsExamTypeFilter');

// Chart instances for reports
let reportsAttendanceChart = null;
let reportsPerformanceChart = null;
let reportsStudentStatusChart = null;
let reportsClassPerformanceChart = null;

// Calendar Module Elements
const calendarEl = document.getElementById('calendar-full');
let calendar;
const holidayListContainer = document.getElementById('holidayList');
const addHolidayModal = document.getElementById('addHolidayModal');
const closeAddHolidayModal = document.getElementById('closeAddHolidayModal');
const addHolidayForm = document.getElementById('addHolidayForm');

// Invoice Details Modal
const invoiceDetailsModal = document.getElementById('invoiceDetailsModal');
const closeInvoiceDetailsModal = document.getElementById('closeInvoiceDetailsModal');
const invoiceContent = document.getElementById('invoiceContent');

// Homework Module Elements
const homeworkTableBody = document.getElementById('homeworkTableBody');
const addHomeworkModal = document.getElementById('addHomeworkModal');
const closeAddHomeworkModal = document.getElementById('closeAddHomeworkModal');
const homeworkForm = document.getElementById('homeworkForm');
const homeworkModalTitle = document.getElementById('addHomeworkModalTitle');
const homeworkFormSubmitBtn = document.getElementById('homeworkFormSubmitBtn');
const filterHomeworkClass = document.getElementById('filterHomeworkClass');
const filterHomeworkSubject = document.getElementById('filterHomeworkSubject');
const filterHomeworkDueDate = document.getElementById('filterHomeworkDueDate');
const applyHomeworkFilter = document.getElementById('applyHomeworkFilter');
const homeworkDetailsModal = document.getElementById('homeworkDetailsModal');
const closeHomeworkDetailsModal = document.getElementById('closeHomeworkDetailsModal');
const homeworkDetailsContent = document.getElementById('homeworkDetailsContent');

// Teacher QR Code Modal Elements
const teacherQrCodeModal = document.getElementById('teacherQrCodeModal');
const closeTeacherQrCodeModal = document.getElementById('closeTeacherQrCodeModal');
const teacherQrCodeCanvas = document.getElementById('teacherQrCodeCanvas');
const qrCodeTeacherIdDisplay = document.getElementById('qrCodeTeacherIdDisplay');
const downloadTeacherQrCodeLink = document.getElementById('downloadTeacherQrCodeLink');

// Reports Module Elements
const reportTypeSelect = document.getElementById('reportType');
const reportClassFilterSelect = document.getElementById('reportClassFilter');
const reportStartDateInput = document.getElementById('reportStartDate');
const reportEndDateInput = document.getElementById('reportEndDate');
const reportDisplayArea = document.getElementById('reportDisplayArea');

// New elements for QR scan feedback
const qrScanFeedback = document.getElementById('qrScanFeedback');
const qrScanFeedbackTeacher = document.getElementById('qrScanFeedbackTeacher');
const teacherQrScannerTitle = document.getElementById('teacherQrScannerTitle'); // Added for teacher QR scanner title


// --- Initial UI State Management ---

/**
 * Shows the login UI and hides the main school site UI.
 */
function showLoginUi() {
    console.log('Showing login UI.');
    if (loginUi) {
        loginUi.style.display = 'flex';
    }
    if (schoolSiteUi) {
        schoolSiteUi.style.display = 'none';
    }
    document.body.style.justifyContent = 'center';
    document.body.style.alignItems = 'center';
    document.body.style.minHeight = '100vh';
    document.body.style.backgroundColor = 'var(--light)';
    document.body.style.overflow = 'hidden';
    initTypedWelcome(); // Initialize typing effect on login page
}

/**
 * Shows the main school site UI and hides the login UI.
 * Loads all initial data and updates UI elements.
 */
async function showSchoolSiteUi() {
    console.log('Showing school site UI.');
    if (loginUi) {
        loginUi.style.display = 'none';
    }
    if (schoolSiteUi) {
        schoolSiteUi.style.display = 'flex';
    }
    document.body.style.justifyContent = 'flex-start';
    document.body.style.alignItems = 'flex-start';
    document.body.style.minHeight = 'auto';
    document.body.style.backgroundColor = 'var(--light)';
    document.body.style.overflow = 'auto';

    const { data: { session } } = await supabase.auth.getSession();
    console.log("showSchoolSiteUi: Current session status:", session ? "Authenticated" : "Not Authenticated");
    if (session && session.user) {
        console.log("showSchoolSiteUi: Authenticated user email:", session.user.email);
    }

    await loadAllData(); // Load all data from Supabase

    updateLoggedInUserName();
    updateUIAccess(); // Adjust UI based on role

    if (calendarEl && typeof FullCalendar !== 'undefined' && !calendar) {
        calendar = new FullCalendar.Calendar(calendarEl, {
            initialView: 'dayGridMonth',
            themeSystem: 'standard',
            headerToolbar: {
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,listWeek'
            },
            editable: true,
            selectable: true,
            dayMaxEvents: true,
            firstDay: 1,
            eventColor: '#4F46E5',
            eventTextColor: '#ffffff',
            height: 'auto',
            events: [
                {
                    title: 'Parent-Teacher Meeting',
                    start: new Date().toISOString().split('T')[0],
                    backgroundColor: '#4F46E5',
                    borderColor: '#4F46E5'
                },
                {
                    title: 'Sports Day',
                    start: new Date(new Date().getTime() + 86400000 * 5).toISOString().split('T')[0],
                    backgroundColor: '#10B981',
                    borderColor: '#10B981'
                },
                {
                    title: 'End of Term Exams',
                    start: new Date(new Date().getTime() + 86400000 * 14).toISOString().split('T')[0],
                    end: new Date(new Date().getTime() + 86400000 * 18).toISOString().split('T')[0],
                    backgroundColor: '#F59E0B',
                    borderColor: '#F59E0B'
                }
            ],
            eventSources: [
                {
                    events: holidays.map(holiday => ({
                        title: holiday.name,
                        start: holiday.date,
                        allDay: true,
                        classNames: ['holiday'],
                        display: 'background'
                    }))
                }
            ],
            eventDidMount: function(info) {
                info.el.title = info.event.title;
            }
        });
        calendar.render();
    } else if (calendar) {
        calendar.render(); // Re-render if already initialized
    }
}

/**
 * Updates UI elements (navigation, buttons) to be fully visible.
 * All role-based restrictions are removed from the frontend JS.
 * Backend RLS should enforce actual permissions.
 */
function updateUIAccess() {
    console.log('Updating UI access: showing all elements. Backend RLS will enforce permissions.');
    // Show all elements with data-role attributes
    document.querySelectorAll('[data-role]').forEach(el => {
        el.style.display = 'block';
    });

    // Show all navigation items
    document.querySelectorAll('.nav-item').forEach(navItem => {
        navItem.classList.remove('hidden');
    });

    // Show all specific buttons/forms
    // These elements are now correctly referenced by their IDs from index.html
    document.querySelector('#studentsModule button[onclick="showAddStudentForm()"]')?.classList.remove('hidden');
    document.querySelector('#teachersModule button[onclick="showAddTeacherForm()"]')?.classList.remove('hidden');
    document.querySelector('#user-managementModule button[onclick="showAddUserForm()"]')?.classList.remove('hidden');
    openPayrollModalBtn?.classList.remove('hidden');
    openAddInvoiceModalBtn?.classList.remove('hidden');
}


// Check login status on load
document.addEventListener('DOMContentLoaded', () => {
    // Always show the login UI initially to prevent auto-login on refresh
    // This ensures a clean login flow.
    showLoginUi();

    // If you want to automatically log in if a session exists on refresh,
    // uncomment the block below. However, the current setup requires manual login
    // after a refresh for security and clarity.
    /*
    supabase.auth.getSession().then(async ({ data: { session } }) => {
        if (session) {
            console.log("DOMContentLoaded: Existing session found. Attempting to show school site UI.");
            localStorage.setItem('loggedIn', 'true');
            localStorage.setItem('loggedInUser', JSON.stringify(session.user));
            showSchoolSiteUi();
        } else {
            console.log("DOMContentLoaded: No existing session. Showing login UI.");
            localStorage.removeItem('loggedIn');
            localStorage.removeItem('loggedInUser');
            showLoginUi();
        }
    });
    */
});

// --- Login UI Logic ---

roleButtons.forEach(button => {
    button.addEventListener('click', function() {
        roleButtons.forEach(btn => btn.classList.remove('active'));
        this.classList.add('active');
        if (selectedRoleInput) {
            selectedRoleInput.value = this.dataset.role;
        }
        console.log(`Role selected: ${this.dataset.role}`);
    });
});

/**
 * Handles user login authentication with Supabase.
 * Verifies selected role against user_metadata.
 */
async function handleLogin() {
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const selectedRoleElement = document.getElementById('selectedRole');

    const email = emailInput ? emailInput.value.trim() : '';
    const password = passwordInput ? passwordInput.value.trim() : '';
    const selectedRole = selectedRoleElement ? selectedRoleElement.value : '';

    // Ensure all fields are filled and a role is selected
    if (!email || !password || !selectedRole) {
        alert('Please fill in all fields and select a role.');
        console.warn('Login attempt failed: Missing email, password, or role.');
        return;
    }

    console.log(`Attempting login for ${email} with role ${selectedRole}...`);
    try {
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });

        if (authError) {
            alert('Login failed: ' + authError.message);
            console.error('Supabase signInWithPassword error:', authError);
            await addAuditLog(email, 'Login Failed', 'Authentication', `Error: ${authError.message}`);
            return;
        }

        if (authData.user) {
            // Determine the user's actual role from Supabase metadata
            const userRole = authData.user.user_metadata?.role || authData.user.app_metadata?.role || 'admin';
            console.log(`User ${authData.user.email} logged in. Actual role: ${userRole}`);

            // Frontend role check (optional, backend RLS is primary)
            // If you want to strictly enforce that the selected role matches the user's actual role:
            // if (selectedRole !== userRole && userRole !== 'admin') { // Allow admin to bypass for testing
            //     alert(`You logged in as ${userRole}, but selected ${selectedRole}. Please select your correct role.`);
            //     await supabase.auth.signOut(); // Force logout if role mismatch
            //     await addAuditLog(email, 'Login Failed (Role Mismatch)', 'Authentication', `User ${email} tried to log in as ${selectedRole} but is ${userRole}.`);
            //     return;
            // }

            localStorage.setItem('loggedIn', 'true');
            localStorage.setItem('loggedInUser', JSON.stringify(authData.user)); // Store the full user object
            alert('Login successful! Redirecting...');
            await addAuditLog(authData.user.email, 'Logged In', 'Authentication', `Successful login for role: ${userRole}`);
            showSchoolSiteUi(); // Only call this on successful login
        } else {
            // This case should ideally be covered by authError, but as a fallback
            alert('Login failed: No user data returned.');
            console.error('Login failed: No user data returned from signInWithPassword.');
            await addAuditLog(email, 'Login Failed (No User Data)', 'Authentication', 'No user data returned from signInWithPassword.');
        }
    } catch (err) {
        console.error('Unexpected error during login:', err);
        alert('An unexpected error occurred: ' + err.message);
        await addAuditLog(email, 'Login Failed (Unexpected)', 'Authentication', `Unexpected error: ${err.message}`);
    }
}

// Event listener for the login form submission
if (loginForm) {
    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        await handleLogin();
    });
}

// Forgot Password Modal Logic
if (forgotPasswordLink) {
    forgotPasswordLink.addEventListener('click', function(event) {
        event.preventDefault();
        if (forgotPasswordModal) {
            forgotPasswordModal.classList.add('active');
            forgotPasswordModal.style.display = 'flex'; // Ensure it's visible
        }
        console.log('Forgot password modal opened.');
    });
}

if (closeForgotPasswordModal) {
    closeForgotPasswordModal.addEventListener('click', function() {
        if (forgotPasswordModal) {
            forgotPasswordModal.classList.remove('active');
            forgotPasswordModal.style.display = 'none'; // Ensure it's hidden
        }
        if (forgotPasswordForm) {
            forgotPasswordForm.reset();
        }
        console.log('Forgot password modal closed.');
    });
}

if (forgotPasswordModal) {
    forgotPasswordModal.addEventListener('click', function(event) {
        if (event.target === forgotPasswordModal) {
            forgotPasswordModal.classList.remove('active');
            forgotPasswordModal.style.display = 'none'; // Ensure it's hidden
            if (forgotPasswordForm) {
                forgotPasswordForm.reset();
            }
            console.log('Forgot password modal closed by outside click.');
        }
    });
}

if (forgotPasswordForm) {
    forgotPasswordForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        const forgotEmailInput = document.getElementById('forgotEmail');
        const email = forgotEmailInput ? forgotEmailInput.value : '';
        if (!email) {
            alert('Please enter your email address.');
            console.warn('Forgot password attempt: No email entered.');
            return;
        }
        console.log(`Sending password reset link to ${email}...`);
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email);
            if (error) {
                alert('Error sending reset link: ' + error.message);
                console.error('Supabase resetPasswordForEmail error:', error);
                await addAuditLog(email, 'Forgot Password Failed', 'Authentication', `Failed to send reset link: ${error.message}`);
            } else {
                alert('If an account with that email exists, a password reset link has been sent to ' + email + '.');
                console.log('Password reset link sent successfully (if email exists).');
                await addAuditLog(email, 'Forgot Password Initiated', 'Authentication', 'Password reset link sent.');
            }
        } catch (err) {
            console.error('Unexpected error during password reset:', err);
            alert('An unexpected error occurred: ' + err.message);
            await addAuditLog(email, 'Forgot Password (Unexpected)', 'Authentication', `Unexpected error: ${err.message}`);
        } finally {
            if (forgotPasswordModal) {
                forgotPasswordModal.classList.remove('active');
                forgotPasswordModal.style.display = 'none'; // Ensure it's hidden
            }
            if (forgotPasswordForm) {
                forgotPasswordForm.reset();
            }
        }
    });
}

// Sign Up Modal Logic
if (signUpButton) {
    signUpButton.addEventListener('click', function() {
        if (signUpModal) {
            signUpModal.classList.remove('hidden');
            signUpModal.style.display = 'flex';
        }
        if (signUpForm) {
            signUpForm.reset();
        }
        console.log('Sign Up modal opened.');
    });
}

if (closeSignUpModal) {
    closeSignUpModal.addEventListener('click', function() {
        if (signUpModal) {
            signUpModal.classList.add('hidden');
            signUpModal.style.display = 'none';
        }
        if (signUpForm) {
            signUpForm.reset();
        }
        console.log('Sign Up modal closed.');
    });
}

if (signUpModal) {
    signUpModal.addEventListener('click', function(event) {
        if (event.target === signUpModal) {
            signUpModal.classList.add('hidden');
            signUpModal.style.display = 'none';
            if (signUpForm) {
                signUpForm.reset();
            }
            console.log('Sign Up modal closed by outside click.');
        }
    });
}

if (signUpForm) {
    signUpForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        const signUpFullNameInput = document.getElementById('signUpFullName');
        const signUpEmailInput = document.getElementById('signUpEmail');
        const signUpPasswordInput = document.getElementById('signUpPassword');
        const signUpRoleSelect = document.getElementById('signUpRole');

        const fullName = signUpFullNameInput ? signUpFullNameInput.value.trim() : '';
        const email = signUpEmailInput ? signUpEmailInput.value.trim() : '';
        const password = signUpPasswordInput ? signUpPasswordInput.value.trim() : '';
        const role = signUpRoleSelect ? signUpRoleSelect.value : '';

        if (!fullName || !email || !password || !role) {
            alert('Please fill in all fields.');
            console.warn('Sign Up attempt failed: Missing fields.');
            return;
        }

        console.log(`Attempting to sign up new user: ${email} with role: ${role}`);
        try {
            const { data, error } = await supabase.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: {
                        full_name: fullName,
                        role: role
                    }
                }
            });

            if (error) {
                alert('Sign Up failed: ' + error.message);
                console.error('Supabase signUp error:', error);
                await addAuditLog(email, 'Sign Up Failed', 'Authentication', `Error: ${error.message}`);
                return;
            }

            if (data.user) {
                // Insert into profiles table
                const { error: profileError } = await supabase.from('profiles').insert([
                    {
                        id: data.user.id,
                        full_name: fullName,
                        email: email,
                        role: role,
                        status: 'Active'
                    }
                ]);

                if (profileError) {
                    console.error('Error inserting profile:', profileError);
                    alert('Sign Up successful, but failed to create user profile. Please contact support.');
                    await addAuditLog(email, 'Sign Up Partial Success', 'Authentication', `Profile creation failed: ${profileError.message}`);
                    // Optionally, you might want to delete the auth user here if profile creation is critical
                } else {
                    alert('Sign Up successful! Please check your email to confirm your account.');
                    await addAuditLog(email, 'Sign Up Successful', 'Authentication', `New user signed up with role: ${role}`);
                }
                if (signUpModal) {
                    signUpModal.classList.add('hidden');
                    signUpModal.style.display = 'none';
                }
                if (signUpForm) {
                    signUpForm.reset();
                }
            } else {
                alert('Sign Up failed: No user data returned.');
                await addAuditLog(email, 'Sign Up Failed (No User Data)', 'Authentication', 'No user data returned from signUp.');
            }
        } catch (err) {
            console.error('Unexpected error during sign up:', err);
            alert('An unexpected error occurred: ' + err.message);
            await addAuditLog(email, 'Sign Up Failed (Unexpected)', 'Authentication', `Unexpected error: ${err.message}`);
        }
    });
}


// --- School Site UI Logic ---

// Logout functionality
if (logoutButton) {
    logoutButton.addEventListener('click', async function() {
        if (confirm('Are you sure you want to logout?')) {
            const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
            console.log(`Logging out user: ${loggedInUser ? loggedInUser.email : 'Unknown'}`);
            try {
                const { error } = await supabase.auth.signOut();
                if (error) throw error;

                await addAuditLog(loggedInUser ? loggedInUser.email : 'Unknown', 'Logged Out', 'Authentication', 'User logged out');
                localStorage.clear(); // Clear all local storage on logout

                // Reset UI elements to default dashboard view
                document.querySelectorAll('.module-content').forEach(m => m.classList.add('hidden'));
                document.getElementById('dashboardMainContent')?.classList.remove('hidden');
                document.getElementById('moduleTabs')?.classList.remove('hidden');
                document.getElementById('modulesContainer')?.classList.add('hidden');
                document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
                document.querySelector('.nav-item[data-module="dashboard"]')?.classList.add('active');
                document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
                document.querySelector('.tab[data-tab="dashboard"]')?.classList.add('active');

                // Destroy all chart instances to prevent memory leaks and re-render issues
                safeDestroy(financeOverviewChartInstance);
                safeDestroy(studentAttendanceChartInstance);
                safeDestroy(teacherAttendanceChartInstance);
                safeDestroy(monthlyAttendanceTrendChartInstance);
                safeDestroy(reportsAttendanceChart);
                safeDestroy(reportsPerformanceChart);
                safeDestroy(reportsStudentStatusChart);
                safeDestroy(reportsClassPerformanceChart);

                // Reset global data arrays
                students = [];
                teachers = [];
                payrollEntries = [];
                invoices = [];
                announcements = [];
                notifications = [];
                auditLogs = [];
                backups = [];
                attendanceRecords = [];
                teacherAttendanceRecords = [];
                profiles = [];
                exams = [];
                homeworkAssignments = [];
                holidays = [];

                // Stop QR scanners if they are active
                if (html5QrCodeScanner && html5QrCodeScanner.isScanning) {
                    await html5QrCodeScanner.stop();
                    html5QrCodeScanner = null; // Clear the instance
                }
                if (html5QrCodeScannerTeacher && html5QrCodeScannerTeacher.isScanning) {
                    await html5QrCodeScannerTeacher.stop();
                    html5QrCodeScannerTeacher = null; // Clear the instance
                }

                // Show login UI after all cleanup
                showLoginUi();
                console.log('Logout successful. UI reset and data cleared.');

            } catch (error) {
                console.error('Error logging out:', error);
                alert('Error logging out: ' + error.message);
                await addAuditLog(loggedInUser ? loggedInUser.email : 'Unknown', 'Logout Failed', 'Authentication', `Error: ${error.message}`);
            }
        }
    });
}


function renderHolidayList() {
    if (!holidayListContainer) return;
    holidayListContainer.innerHTML = '';
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcomingHolidays = holidays
        .filter(holiday => new Date(holiday.date) >= today)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()); // Sort ascending to show nearest first

    if (upcomingHolidays.length === 0) {
        holidayListContainer.innerHTML = '<p class="text-gray-500 text-center py-4">No upcoming holidays.</p>';
        return;
    }

    upcomingHolidays.slice(0, 5).forEach(holiday => {
        const holidayDate = new Date(holiday.date);
        const formattedDate = holidayDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const listItem = document.createElement('div');
        listItem.className = 'holiday-list-item module-card';
        listItem.innerHTML = `
            <span class="date">${formattedDate}</span>
            <span class="name">${holiday.name}</span>
            <i class="fas fa-star text-red-500"></i>
        `;
        holidayListContainer.appendChild(listItem);
    });
    console.log('Holiday list rendered.');
}

window.showAddHolidayModal = function() {
    if (addHolidayModal) {
        addHolidayModal.classList.remove('hidden');
        addHolidayModal.style.display = 'flex';
    }
    if (addHolidayForm) {
        addHolidayForm.reset();
    }
    console.log('Add Holiday modal opened.');
}

if (closeAddHolidayModal) {
    closeAddHolidayModal.addEventListener('click', () => {
        if (addHolidayModal) {
            addHolidayModal.classList.add('hidden');
            addHolidayModal.style.display = 'none';
        }
        console.log('Add Holiday modal closed.');
    });
}

if (addHolidayModal) {
    addHolidayModal.addEventListener('click', (e) => {
        if (e.target === addHolidayModal) {
            addHolidayModal.classList.add('hidden');
            addHolidayModal.style.display = 'none';
            if (addHolidayForm) {
                addHolidayForm.reset();
            }
            console.log('Add Holiday modal closed by outside click.');
        }
    });
}

if (addHolidayForm) {
    addHolidayForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const holidayNameInput = document.getElementById('holidayName');
        const holidayDateInput = document.getElementById('holidayDate');

        const holidayName = holidayNameInput ? holidayNameInput.value : '';
        const holidayDate = holidayDateInput ? holidayDateInput.value : '';

        if (!holidayName || !holidayDate) {
            alert('Please fill in all fields.');
            console.warn('Add Holiday failed: Missing name or date.');
            return;
        }

        try {
            const { data, error } = await supabase.from('holidays').insert([
                { name: holidayName, date: holidayDate }
            ]).select();

            if (error) throw error;

            alert('Holiday added successfully!');
            await fetchHolidays(); // Re-fetch holidays to update the list and calendar
            if (calendar) {
                calendar.addEvent({
                    title: holidayName,
                    start: holidayDate,
                    allDay: true,
                    classNames: ['holiday'],
                    display: 'background'
                });
            }
            if (addHolidayModal) {
                addHolidayModal.classList.add('hidden');
                addHolidayModal.style.display = 'none';
            }
            if (addHolidayForm) {
                addHolidayForm.reset();
            }
            const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
            await addAuditLog(loggedInUser?.email || 'admin', 'Added Holiday', 'Calendar', `Added holiday: ${holidayName} on ${holidayDate}`);
            console.log(`Holiday "${holidayName}" added.`);
        } catch (error) {
            alert('Error adding holiday: ' + error.message);
            console.error('Supabase error adding holiday:', error);
            const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
            await addAuditLog(loggedInUser?.email || 'admin', 'Add Holiday Failed', 'Calendar', `Error: ${error.message}`);
        }
    });
}


/**
 * Shows the specified module content and updates active navigation/tab states.
 * All modules are accessible.
 * @param {string} moduleName - The name of the module to show (e.g., 'dashboard', 'students').
 */
window.showModule = async function(moduleName) {
    console.log(`Showing module: ${moduleName}`);
    const dashboardMainContent = document.getElementById('dashboardMainContent');
    const modulesContainer = document.getElementById('modulesContainer');
    const moduleTabs = document.getElementById('moduleTabs');
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    // Role retrieval is kept for audit logging, but not for access control
    const userRole = loggedInUser ? loggedInUser.user_metadata?.role || loggedInUser.app_metadata?.role || 'admin' : null;

    if (currentModuleTitle) {
        currentModuleTitle.textContent = moduleName.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }

    document.querySelectorAll('.module-content').forEach(m => m.classList.add('hidden'));
    if (dashboardMainContent) {
        dashboardMainContent.classList.add('hidden');
    }
    if (modulesContainer) {
        modulesContainer.classList.remove('hidden');
    }

    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));

    // Stop QR scanner if active when switching modules
    if (html5QrCodeScanner && html5QrCodeScanner.isScanning) {
        await stopQrAttendance();
    }
    if (html5QrCodeScannerTeacher && html5QrCodeScannerTeacher.isScanning) {
        await stopTeacherQrAttendance();
    }

    if (moduleName === 'dashboard') {
        if (dashboardMainContent) {
            dashboardMainContent.classList.remove('hidden');
        }
        if (modulesContainer) {
            modulesContainer.classList.add('hidden');
        }
        if (moduleTabs) {
            moduleTabs.classList.remove('hidden');
        }
        document.querySelector('.tab[data-tab="dashboard"]')?.classList.add('active');
        document.querySelector('.nav-item[data-module="dashboard"]')?.classList.add('active');
        if (currentModuleTitle) {
            currentModuleTitle.textContent = 'Dashboard';
        }
        updateDashboardStats();
        scheduleChartUpdate();
    } else {
        const moduleElement = document.getElementById(`${moduleName}Module`);
        if (moduleElement) {
            moduleElement.classList.remove('hidden');
        }
        const tabElement = document.querySelector(`.tab[data-tab="${moduleName}"]`);
        if (tabElement) {
            tabElement.classList.add('active');
        }
        const activeNavItem = document.querySelector(`.nav-item[data-module="${moduleName}"]`);
        if (activeNavItem) {
            activeNavItem.classList.add('active');
        }

        // Re-fetch data for the module when it's opened
        switch (moduleName) {
            case 'students': await fetchStudents(); break;
            case 'teachers': await fetchTeachers(); break;
            case 'payroll': await fetchPayrollEntries(); break;
            case 'finance': await fetchInvoices(); populateInvoiceStudentSelect(); break;
            case 'attendance': await fetchAttendanceRecords(); populateStudentSelect(); break;
            case 'teacher-attendance': await fetchTeacherAttendanceRecords(); populateTeacherSelect(); break;
            case 'announcements': await fetchAnnouncements(); break;
            case 'audit-logs': await fetchAuditLogs(); break;
            case 'backup-restore': await fetchBackups(); break;
            case 'user-management': await fetchProfiles(); break;
            case 'exams': await fetchExams(); break;
            case 'reports': initReportsCharts(); break; // Initialize reports charts when reports module is opened
            case 'homework': await fetchHomework(); break;
            case 'calendar': await fetchHolidays(); if(calendar) calendar.render(); break;
            default: console.warn(`No specific data fetch defined for module: ${moduleName}`);
        }
    }
    if (notificationDropdown) notificationDropdown.classList.add('hidden');
    if (userDropdown) userDropdown.classList.add('hidden');
}

document.querySelectorAll('.open-module, .tab, .nav-item').forEach(el => {
    el.addEventListener('click', async (e) => {
        e.preventDefault();
        const moduleName = el.dataset.module || el.dataset.tab;
        if (moduleName) {
            showModule(moduleName);
        }
    });
});

// User Dropdown Toggle
if (userProfileToggle) {
    userProfileToggle.addEventListener('click', function() {
        if (userDropdown) userDropdown.classList.toggle('hidden');
        if (notificationDropdown) notificationDropdown.classList.add('hidden');
        console.log('User profile dropdown toggled.');
    });
}

// Close dropdowns when clicking outside
document.addEventListener('click', function(event) {
    if (notificationDropdown && !notificationDropdown.contains(event.target) && (!notificationButton || !notificationButton.contains(event.target))) {
        notificationDropdown.classList.add('hidden');
    }
    if (userDropdown && !userDropdown.contains(event.target) && (!userProfileToggle || !userProfileToggle.contains(event.target))) {
        userDropdown.classList.add('hidden');
    }
});


function renderDropdownNotifications() {
    if (!notificationList || !notificationCount || !newCount) return;
    notificationList.innerHTML = "";
    let unreadCount = 0;
    notifications.slice(0, 3).forEach((notif) => {
        if (notif.unread) unreadCount++;
        const div = document.createElement("div");
        div.className = "notification-item" + (notif.unread ? " unread" : "");
        div.dataset.id = notif.id;
        div.innerHTML = `
            <div class="title">${notif.title}</div>
            <p class="text-sm text-gray-600">${notif.description}</p>
            <div class="time">${notif.time}</div>
        `;
        div.addEventListener("click", () => {
            markNotificationRead(notif.id);
        });
        notificationList.appendChild(div);
    });
    notificationCount.textContent = unreadCount > 0 ? unreadCount : "";
    newCount.textContent = unreadCount > 0 ? `${unreadCount} New` : "No new";
    localStorage.setItem('notifications', JSON.stringify(notifications));
    console.log('Dropdown notifications rendered.');
}

function renderModalNotifications() {
    if (!viewAllNotificationList) return;
    viewAllNotificationList.innerHTML = "";
    notifications.forEach((notif) => {
        const div = document.createElement("div");
        div.className = "view-all-notification" + (notif.unread ? " unread" : "");
        div.dataset.id = notif.id;
        div.innerHTML = `
            <div class="title">${notif.title}</div>
            <p class="text-sm text-gray-600">${notif.description}</p>
            <div class="time">${notif.time}</div>
        `;
        div.addEventListener("click", () => {
            markNotificationRead(notif.id);
            div.classList.remove("unread");
        });
        viewAllNotificationList.appendChild(div);
    });
    localStorage.setItem('notifications', JSON.stringify(notifications));
    console.log('Modal notifications rendered.');
}

async function markNotificationRead(id) {
    const notif = notifications.find((n) => n.id === id);
    if (notif && notif.unread) {
        notif.unread = false;
        renderDropdownNotifications();
        renderModalNotifications();
        const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
        await addAuditLog(loggedInUser?.email || 'System', 'Notification Read', 'Notifications', `Notification "${notif.title}" marked as read.`);
        console.log(`Notification ID ${id} marked as read.`);
    }
}

async function markAllAsRead() {
    notifications.forEach((n) => (n.unread = false));
    renderDropdownNotifications();
    renderModalNotifications();
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    await addAuditLog(loggedInUser?.email || 'System', 'Notifications', 'Notifications', 'All notifications marked as read.');
    console.log('All notifications marked as read.');
}

if (notificationButton) {
    notificationButton.addEventListener('click', function(event) {
        event.stopPropagation();
        if (notificationDropdown) {
            notificationDropdown.classList.toggle('hidden');
        }
        if (userDropdown) {
            userDropdown.classList.add('hidden');
        }
        console.log('Notification dropdown toggled.');
    });
}


if (markAllReadBtn) {
    markAllReadBtn.addEventListener('click', markAllAsRead);
}

if (viewAllNotificationsLink) {
    viewAllNotificationsLink.addEventListener('click', function(event) {
        event.preventDefault();
        if (notificationDropdown) notificationDropdown.classList.add("hidden");
        if (viewAllModal) {
            viewAllModal.classList.remove("hidden");
            viewAllModal.style.display = 'flex';
        }
        renderModalNotifications();
        console.log('View All Notifications modal opened.');
    });
}

if (closeViewAllModal) {
    closeViewAllModal.addEventListener("click", () => {
        if (viewAllModal) {
            viewAllModal.classList.add("hidden");
            viewAllModal.style.display = 'none';
        }
        console.log('View All Notifications modal closed.');
    });
}

if (viewAllModal) {
    viewAllModal.addEventListener("click", (e) => {
        if (e.target === viewAllModal) {
            viewAllModal.classList.add("hidden");
            viewAllModal.style.display = 'none';
            console.log('View All Notifications modal closed by outside click.');
        }
    });
}

if (modalMarkAllReadBtn) {
    modalMarkAllReadBtn.addEventListener("click", markAllAsRead);
}

// Payroll Module Specific JavaScript
function renderPayrollTable(filteredPayroll = payrollEntries) {
    if (!payrollTableBody) return;
    payrollTableBody.innerHTML = '';
    if (filteredPayroll.length === 0) {
        payrollTableBody.innerHTML = '<tr><td colspan="5" class="text-center py-4 text-gray-500">No payroll entries found.</td></tr>';
        return;
    }
    // const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser')); // Not used for rendering
    // const userRole = loggedInUser ? loggedInUser.user_metadata?.role || loggedInUser.app_metadata?.role : null;

    filteredPayroll.forEach(entry => {
        const newRow = document.createElement('tr');
        newRow.className = 'border-b hover:bg-gray-50';
        let statusBgClass = '';
        let statusTextColorClass = '';
        switch (entry.status) {
            case 'Paid': statusBgClass = 'bg-green-100'; statusTextColorClass = 'text-green-800'; break;
            case 'Processing': statusBgClass = 'bg-yellow-100'; statusTextColorClass = 'text-yellow-800'; break;
            case 'Pending': statusBgClass = 'bg-blue-100'; statusTextColorClass = 'text-blue-800'; break;
            default: statusBgClass = 'bg-gray-100'; statusTextColorClass = 'text-gray-800'; break;
        }
        newRow.innerHTML = `
            <td class="py-3 px-4">${entry.period}</td>
            <td class="py-3 px-4">${entry.staff_count}</td>
            <td class="py-3 px-4">₹${parseFloat(entry.total_amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            <td class="py-3 px-4">
                <span class="px-2 py-1 ${statusBgClass} ${statusTextColorClass} text-xs rounded-full">${entry.status}</span>
            </td>
            <td class="py-3 px-4">
                <button class="text-blue-600 hover:text-blue-800 mr-3" title="View Details" onclick="alert('Viewing details for payroll ${entry.period}')">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="text-red-600 hover:text-red-800" title="Download PDF" onclick="alert('Downloading PDF for payroll ${entry.period}')">
                    <i class="fas fa-file-pdf"></i>
                </button>
            </td>
        `;
        payrollTableBody.prepend(newRow);
    });
    console.log('Payroll table rendered.');
}

function filterPayroll() {
    const periodQuery = searchPayrollPeriodInput ? searchPayrollPeriodInput.value.toLowerCase() : '';
    const filtered = payrollEntries.filter(entry => {
        return entry.period.toLowerCase().includes(periodQuery);
    });
    renderPayrollTable(filtered);
    console.log('Payroll filtered.');
}

if (applyPayrollSearchButton) applyPayrollSearchButton.addEventListener('click', filterPayroll);
if (searchPayrollPeriodInput) searchPayrollPeriodInput.addEventListener('keyup', filterPayroll);


if (openPayrollModalBtn) {
    openPayrollModalBtn.addEventListener('click', () => {
        if (payrollModal) {
            payrollModal.classList.remove('hidden');
            payrollModal.style.display = 'flex';
            console.log('Payroll modal opened.');
        }
    });
}

if (closePayrollModalBtn) {
    closePayrollModalBtn.addEventListener('click', () => {
        if (payrollModal) {
            payrollModal.classList.add('hidden');
            payrollModal.style.display = 'none';
        }
        if (payrollForm) payrollForm.reset();
        console.log('Payroll modal closed.');
    });
}

if (payrollModal) {
    payrollModal.addEventListener('click', (e) => {
        if (e.target === payrollModal) {
            payrollModal.classList.add('hidden');
            payrollModal.style.display = 'none';
            if (payrollForm) payrollForm.reset();
            console.log('Payroll modal closed by outside click.');
        }
    });
}

if (payrollForm) {
    payrollForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
        const userEmail = loggedInUser?.email || 'admin';

        const payrollPeriodInput = document.getElementById('payrollPeriod');
        const staffCountInput = document.getElementById('staffCount');
        const totalAmountInput = document.getElementById('totalAmount');

        const periodInput = payrollPeriodInput ? payrollPeriodInput.value : '';
        const staffCount = staffCountInput ? staffCountInput.value : '';
        const totalAmount = totalAmountInput ? parseFloat(totalAmountInput.value) : NaN;

        if (!periodInput || !staffCount || isNaN(totalAmount)) {
            alert('Please fill in all fields correctly.');
            console.warn('Payroll form submission failed: Missing or invalid fields.');
            return;
        }

        const [year, monthNum] = periodInput.split('-');
        const date = new Date(year, monthNum - 1);
        const formattedPeriod = date.toLocaleString('default', { month: 'long', year: 'numeric' });

        console.log(`Submitting payroll for ${formattedPeriod}...`);
        try {
            const { data, error } = await supabase.from('payroll').insert([
                {
                    period: formattedPeriod,
                    staff_count: parseInt(staffCount),
                    total_amount: totalAmount,
                    status: 'Processing'
                }
            ]).select();

            if (error) throw error;

            alert('Payroll processing initiated successfully!');
            await addAuditLog(userEmail, 'Processed Payroll', 'Payroll', `Processed payroll for ${formattedPeriod}, amount: ₹${totalAmount}`);
            await fetchPayrollEntries();
            if (payrollModal) {
                payrollModal.classList.add('hidden');
                payrollModal.style.display = 'none';
            }
            if (payrollForm) {
                payrollForm.reset();
            }
            console.log('Payroll submitted successfully.');
        } catch (error) {
            alert('Error processing payroll: ' + error.message);
            console.error('Supabase error processing payroll:', error);
            await addAuditLog(userEmail, 'Payroll Processing Failed', 'Payroll', `Error: ${error.message}`);
        }
    });
}

// Finance Module Specific JavaScript
function renderFinanceTable(filteredInvoices = invoices) {
    if (!financeTableBody) return;
    financeTableBody.innerHTML = '';
    if (filteredInvoices.length === 0) {
        financeTableBody.innerHTML = '<tr><td colspan="11" class="text-center py-4 text-gray-500">No invoices found.</td></tr>';
        return;
    }

    filteredInvoices.forEach(invoice => {
        const newRow = document.createElement('tr');
        newRow.className = 'border-b hover:bg-gray-50';
        let statusBgClass = '';
        let statusTextColorClass = '';
        switch (invoice.status) {
            case 'Paid': statusBgClass = 'bg-blue-100'; statusTextColorClass = 'text-blue-800'; break;
            case 'Pending': statusBgClass = 'bg-yellow-100'; statusTextColorClass = 'text-yellow-800'; break;
            case 'Overdue': statusBgClass = 'bg-red-100'; statusTextColorClass = 'text-red-800'; break;
            default: statusBgClass = 'bg-gray-100'; statusTextColorClass = 'text-gray-800'; break;
        }

        const studentName = invoice.students ? invoice.students.name : 'N/A';
        const studentClass = invoice.students ? invoice.students.class : 'N/A';
        const fatherName = invoice.students ? invoice.students.father_name : 'N/A';
        const dueAmount = parseFloat(invoice.amount) - parseFloat(invoice.paid_amount || 0);

        newRow.innerHTML = `
            <td class="py-3 px-4">${invoice.invoice_number}</td>
            <td class="py-3 px-4">${studentName}</td>
            <td class="py-3 px-4">${studentClass}</td>
            <td class="py-3 px-4">${fatherName}</td>
            <td class="py-3 px-4">₹${parseFloat(invoice.amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            <td class="py-3 px-4">₹${parseFloat(invoice.paid_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            <td class="py-3 px-4">₹${dueAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            <td class="py-3 px-4">${invoice.date}</td>
            <td class="py-3 px-4">${invoice.due_date || 'N/A'}</td>
            <td class="py-3 px-4">
                <span class="px-2 py-1 ${statusBgClass} ${statusTextColorClass} text-xs rounded-full">${invoice.status}</span>
            </td>
            <td class="py-3 px-4 table-actions">
                <button class="text-blue-600 mr-3" title="Edit Invoice" onclick="editInvoice('${invoice.id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="text-red-600 mr-3" title="Delete Invoice" onclick="deleteInvoice('${invoice.id}')">
                    <i class="fas fa-trash"></i>
                </button>
                <button class="text-blue-600 hover:text-blue-800 mr-3" title="View Details" onclick="showInvoiceDetailsModal('${invoice.id}')">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="text-green-600 hover:text-green-800" title="Print Slip" onclick="printInvoiceSlip('${invoice.id}')">
                    <i class="fas fa-print"></i>
                </button>
                <button class="text-red-600 hover:text-red-800" title="Download PDF" onclick="alert('Downloading PDF for invoice ${invoice.invoice_number}')">
                    <i class="fas fa-file-pdf"></i>
                </button>
            </td>
        `;
        financeTableBody.prepend(newRow);
    });
    console.log('Finance table rendered.');
}

// New function for printing a simplified invoice slip
window.printInvoiceSlip = async function(invoiceId) {
    console.log(`Generating print slip for invoice ID: ${invoiceId}`);
    const invoice = invoices.find(inv => inv.id === invoiceId);
    if (!invoice) {
        alert('Invoice not found for printing slip.');
        console.error(`Invoice with ID ${invoiceId} not found for slip printing.`);
        return;
    }

    const student = students.find(s => s.id === invoice.student_id);
    const studentName = student ? student.name : 'N/A';
    const studentClass = student ? student.class : 'N/A';
    const fatherName = student ? student.father_name : 'N/A';
    const dueAmount = parseFloat(invoice.amount) - parseFloat(invoice.paid_amount || 0);

    const slipContent = `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ccc; max-width: 400px; margin: 20px auto;">
            <h3 style="text-align: center; margin-bottom: 15px;">Invoice Slip - Tapowan Public School</h3>
            <p><strong>Invoice No:</strong> ${invoice.invoice_number}</p>
            <p><strong>Date:</strong> ${invoice.date}</p>
            <hr style="margin: 10px 0;">
            <p><strong>Student Name:</strong> ${studentName}</p>
            <p><strong>Class:</strong> ${studentClass}</p>
            <p><strong>Father's Name:</strong> ${fatherName}</p>
            <hr style="margin: 10px 0;">
            <p><strong>Total Amount:</strong> ₹${parseFloat(invoice.amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            <p><strong>Paid Amount:</strong> ₹${parseFloat(invoice.paid_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            <p><strong>Due Amount:</strong> ₹${dueAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            <p><strong>Status:</strong> ${invoice.status}</p>
            <hr style="margin: 10px 0;">
            <p style="text-align: center; font-size: 0.8em;">Thank you for your payment!</p>
        </div>
    `;

    const printWindow = window.open('', '_blank', 'width=600,height=400');
    printWindow.document.write('<html><head><title>Invoice Slip</title>');
    printWindow.document.write('<style>');
    printWindow.document.write(`
        body { margin: 0; padding: 0; }
        @media print {
            body { margin: 0; padding: 0; }
            div { box-shadow: none !important; border: none !important; }
        }
    `);
    printWindow.document.write('</style>');
    printWindow.document.write('</head><body>');
    printWindow.document.write(slipContent);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
    console.log('Invoice slip print initiated.');

    const loggedInUser  = JSON.parse(localStorage.getItem('loggedInUser '));
    await addAuditLog(loggedInUser ?.email || 'admin', 'Printed Invoice Slip', 'Finance', `Printed slip for invoice ${invoice.invoice_number}`);
};


function filterInvoices() {
    const invoiceNumberQueryInput = document.getElementById('searchInvoiceNumber');
    const studentNameQueryInput = document.getElementById('searchInvoiceStudent');

    const invoiceNumberQuery = invoiceNumberQueryInput ? invoiceNumberQueryInput.value.toLowerCase() : '';
    const studentNameQuery = studentNameQueryInput ? studentNameQueryInput.value.toLowerCase() : '';

    const filtered = invoices.filter(invoice => {
        const invoiceMatch = invoice.invoice_number.toLowerCase().includes(invoiceNumberQuery);
        const studentMatch = studentNameQuery === '' || (invoice.students && invoice.students.name.toLowerCase().includes(studentNameQuery));
        return invoiceMatch && studentMatch;
    });
    renderFinanceTable(filtered);
    console.log('Invoices filtered.');
}

if (applyInvoiceSearchButton) applyInvoiceSearchButton.addEventListener('click', filterInvoices);
if (searchInvoiceNumberInput) searchInvoiceNumberInput.addEventListener('keyup', filterInvoices);
if (document.getElementById('searchInvoiceStudent')) document.getElementById('searchInvoiceStudent').addEventListener('keyup', filterInvoices);


if (openAddInvoiceModalBtn) {
    openAddInvoiceModalBtn.addEventListener('click', () => {
        if (addInvoiceModal) {
            addInvoiceModal.classList.remove('hidden');
            addInvoiceModal.style.display = 'flex';
        }
        currentInvoiceId = null; // Reset for new invoice
        if (document.getElementById('addInvoiceModalTitle')) {
            document.getElementById('addInvoiceModalTitle').textContent = 'Add New Invoice';
        }
        if (document.getElementById('invoiceFormSubmitBtn')) {
            document.getElementById('invoiceFormSubmitBtn').textContent = 'Add Invoice';
        }
        if (addInvoiceForm) addInvoiceForm.reset();
        populateInvoiceStudentSelect();
        console.log('Add Invoice modal opened.');
    });
}

if (closeAddInvoiceModalBtn) {
    closeAddInvoiceModalBtn.addEventListener('click', () => {
        if (addInvoiceModal) {
            addInvoiceModal.classList.add('hidden');
            addInvoiceModal.style.display = 'none';
        }
        if (addInvoiceForm) addInvoiceForm.reset();
        console.log('Add Invoice modal closed.');
    });
}

if (addInvoiceModal) {
    addInvoiceModal.addEventListener('click', (e) => {
        if (e.target === addInvoiceModal) {
            addInvoiceModal.classList.add('hidden');
            addInvoiceModal.style.display = 'none';
            if (addInvoiceForm) addInvoiceForm.reset();
            console.log('Add Invoice modal closed by outside click.');
        }
    });
}

// Function to populate the student select dropdown in the Add Invoice modal
async function populateInvoiceStudentSelect(selectedStudentId = '') {
    if (!invoiceStudentSelect) return;

    if (students.length === 0) {
        await fetchStudents(); // Ensure students data is available
    }

    invoiceStudentSelect.innerHTML = '<option value="">Select Student</option>';
    students.forEach(student => {
        const option = document.createElement('option');
        option.value = student.id;
        option.textContent = `${student.name} (Class: ${student.class})`;
        if (student.id === selectedStudentId) {
            option.selected = true;
        }
        invoiceStudentSelect.appendChild(option);
    });
    console.log('Invoice student select populated.');
}

// New function to edit an invoice
window.editInvoice = async function(id) {
    console.log(`Editing invoice ID: ${id}`);
    const invoice = invoices.find(inv => inv.id === id);
    if (invoice) {
        currentInvoiceId = invoice.id;
        if (document.getElementById('addInvoiceModalTitle')) {
            document.getElementById('addInvoiceModalTitle').textContent = 'Edit Invoice';
        }
        if (document.getElementById('invoiceFormSubmitBtn')) {
            document.getElementById('invoiceFormSubmitBtn').textContent = 'Save Changes';
        }

        document.getElementById('invoiceNumber').value = invoice.invoice_number;
        document.getElementById('invoiceTotalAmount').value = invoice.amount;
        document.getElementById('invoicePaidAmount').value = invoice.paid_amount || 0;
        document.getElementById('invoiceIssueDate').value = invoice.date;
        document.getElementById('invoiceDueDate').value = invoice.due_date || '';
        document.getElementById('invoiceStatus').value = invoice.status;

        populateInvoiceStudentSelect(invoice.student_id); // Pre-select student

        if (addInvoiceModal) {
            addInvoiceModal.classList.remove('hidden');
            addInvoiceModal.style.display = 'flex';
        }
        console.log(`Invoice ${id} data loaded for editing.`);
    } else {
        alert('Invoice not found.');
        console.error(`Invoice with ID ${id} not found for editing.`);
    }
};

// New function to delete an invoice
window.deleteInvoice = async function(id) {
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    const userEmail = loggedInUser?.email || 'admin';
    if (confirm('Are you sure you want to delete this invoice?')) {
        console.log(`Deleting invoice ID: ${id}`);
        try {
            const { error } = await supabase.from('finance').delete().eq('id', id);
            if (error) throw error;

            const deletedInvoice = invoices.find(inv => inv.id === id);
            await addAuditLog(userEmail, 'Deleted Invoice', 'Finance', `Deleted invoice ${deletedInvoice?.invoice_number || id}`);
            alert('Invoice deleted successfully!');
            await fetchInvoices(); // Re-fetch to update the table
            console.log(`Invoice ${id} deleted successfully.`);
        } catch (error) {
            alert('Error deleting invoice: ' + error.message);
            console.error('Supabase error deleting invoice:', error);
            await addAuditLog(userEmail, 'Delete Invoice Failed', 'Finance', `Error: ${error.message}`);
        }
    }
};


if (addInvoiceForm) {
    addInvoiceForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
        const userEmail = loggedInUser?.email || 'admin';

        const studentIdInput = document.getElementById('invoiceStudentId');
        const invoiceNumberInput = document.getElementById('invoiceNumber');
        const invoiceTotalAmountInput = document.getElementById('invoiceTotalAmount');
        const invoicePaidAmountInput = document.getElementById('invoicePaidAmount');
        const invoiceIssueDateInput = document.getElementById('invoiceIssueDate');
        const invoiceDueDateInput = document.getElementById('invoiceDueDate');
        const invoiceStatusInput = document.getElementById('invoiceStatus');

        const studentId = studentIdInput ? studentIdInput.value : '';
        const invoiceNumber = invoiceNumberInput ? invoiceNumberInput.value : '';
        const invoiceTotalAmount = invoiceTotalAmountInput ? parseFloat(invoiceTotalAmountInput.value) : NaN;
        const invoicePaidAmount = invoicePaidAmountInput ? parseFloat(invoicePaidAmountInput.value) : NaN;
        const invoiceIssueDate = invoiceIssueDateInput ? invoiceIssueDateInput.value : '';
        const invoiceDueDate = invoiceDueDateInput ? invoiceDueDateInput.value : '';
        const invoiceStatus = invoiceStatusInput ? invoiceStatusInput.value : '';

        if (!studentId || !invoiceNumber || isNaN(invoiceTotalAmount) || isNaN(invoicePaidAmount) || !invoiceIssueDate || !invoiceDueDate || !invoiceStatus) {
            alert('Please fill in all fields correctly.');
            console.warn('Add/Edit Invoice form submission failed: Missing or invalid fields.');
            return;
        }

        const invoiceData = {
            student_id: studentId,
            invoice_number: invoiceNumber,
            amount: invoiceTotalAmount,
            paid_amount: invoicePaidAmount,
            date: invoiceIssueDate,
            due_date: invoiceDueDate,
            status: invoiceStatus
        };

        try {
            let result;
            if (currentInvoiceId) {
                // Update existing invoice
                console.log(`Updating invoice ${currentInvoiceId}...`);
                result = await supabase.from('finance').update(invoiceData).eq('id', currentInvoiceId).select();
                await addAuditLog(userEmail, 'Updated Invoice', 'Finance', `Updated invoice ${invoiceNumber}`);
                alert('Invoice updated successfully!');
            } else {
                // Add new invoice
                console.log(`Adding new invoice ${invoiceNumber}...`);
                result = await supabase.from('finance').insert([invoiceData]).select();
                await addAuditLog(userEmail, 'Added Invoice', 'Finance', `Added invoice ${invoiceNumber}`);
                alert('Invoice added successfully!');
            }

            if (result.error) throw result.error;

            await fetchInvoices(); // Re-fetch to update the table
            if (addInvoiceModal) {
                addInvoiceModal.classList.add('hidden');
                addInvoiceModal.style.display = 'none';
            }
            if (addInvoiceForm) {
                addInvoiceForm.reset();
            }
            console.log('Invoice operation completed successfully.');
        } catch (error) {
            alert('Error saving invoice: ' + error.message);
            console.error('Supabase error saving invoice:', error);
            await addAuditLog(userEmail, 'Save Invoice Failed', 'Finance', `Error: ${error.message}`);
        }
    });
}

window.showInvoiceDetailsModal = async function(invoiceId) {
    console.log(`Showing details for invoice ID: ${invoiceId}`);
    // Ensure invoices data is up-to-date before searching
    if (invoices.length === 0) {
        await fetchInvoices();
    }

    const invoice = invoices.find(inv => inv.id === invoiceId);
    if (!invoice) {
        alert('Invoice not found.');
        console.error(`Invoice with ID ${invoiceId} not found in current data.`);
        return;
    }

    // Ensure students data is up-to-date before searching
    if (students.length === 0) {
        await fetchStudents();
    }
    const student = students.find(s => s.id === invoice.student_id);

    if (invoiceContent) {
        document.getElementById('invoiceDetailNumber').textContent = invoice.invoice_number;
        document.getElementById('invoiceDetailDate').textContent = invoice.date;
        document.getElementById('invoiceDetailStatus').textContent = invoice.status;
        document.getElementById('invoiceDetailStatus').className = `font-bold ${invoice.status === 'Paid' ? 'text-blue-800' : invoice.status === 'Pending' ? 'text-yellow-800' : 'text-red-800'}`;
        document.getElementById('invoiceDetailTotalAmount').textContent = `₹${parseFloat(invoice.amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        document.getElementById('invoiceDetailTotalAmountSummary').textContent = `₹${parseFloat(invoice.amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        document.getElementById('invoiceDetailPaidAmount').textContent = `₹${parseFloat(invoice.paid_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        document.getElementById('invoiceDetailPaidAmountSummary').textContent = `₹${parseFloat(invoice.paid_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

        const dueAmount = parseFloat(invoice.amount) - parseFloat(invoice.paid_amount || 0);
        document.getElementById('invoiceDetailDueAmount').textContent = `₹${dueAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        document.getElementById('invoiceDetailDueAmountSummary').textContent = `₹${dueAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        document.getElementById('invoiceDetailDueDate').textContent = invoice.due_date || 'N/A';


        if (student) {
            document.getElementById('invoiceDetailStudentName').textContent = student.name;
            document.getElementById('invoiceDetailStudentClass').textContent = `Class: ${student.class}`;
            document.getElementById('invoiceDetailFatherName').textContent = `Father: ${student.father_name}`;
        } else {
            document.getElementById('invoiceDetailStudentName').textContent = 'N/A';
            document.getElementById('invoiceDetailStudentClass').textContent = '';
            document.getElementById('invoiceDetailFatherName').textContent = '';
        }
    }

    if (invoiceDetailsModal) {
        invoiceDetailsModal.classList.remove('hidden');
        invoiceDetailsModal.style.display = 'flex';
        console.log('Invoice details modal opened.');
    }
};

if (closeInvoiceDetailsModal) {
    closeInvoiceDetailsModal.addEventListener('click', () => {
        if (invoiceDetailsModal) {
            invoiceDetailsModal.classList.add('hidden');
            invoiceDetailsModal.style.display = 'none';
        }
        console.log('Invoice details modal closed.');
    });
}

if (invoiceDetailsModal) {
    invoiceDetailsModal.addEventListener('click', (e) => {
        if (e.target === invoiceDetailsModal) {
            invoiceDetailsModal.classList.add('hidden');
            invoiceDetailsModal.style.display = 'none';
            console.log('Invoice details modal closed by outside click.');
        }
    });
}

window.printInvoice = function() {
    console.log('Printing invoice...');
    const printArea = document.getElementById('invoiceDetailsModal')?.querySelector('.print-area');
    if (!printArea) {
        console.error('Print area not found.');
        return;
    }
    const printContents = printArea.innerHTML;
    const originalContents = document.body.innerHTML;

    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    printWindow.document.write('<html><head><title>Print Invoice</title>');
    // Copy styles from the main document
    document.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
        printWindow.document.write(`<link rel="stylesheet" href="${link.href}">`);
    });
    printWindow.document.write('<style>.print-hide { display: none !important; }</style>');
    printWindow.document.write('</head><body>');
    printWindow.document.write(printContents);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
    console.log('Invoice print initiated.');
}


async function updateLoggedInUserName() {
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    if (loggedInUser && loggedInUserName) {
        loggedInUserName.textContent = loggedInUser.user_metadata?.name || loggedInUser.email;
        console.log(`Logged in user name updated to: ${loggedInUserName.textContent}`);
    }
}


// Student Search and Render Functionality
function renderStudentTable(filteredStudents = students) {
    if (!studentTableBody) return;
    studentTableBody.innerHTML = '';
    if (filteredStudents.length === 0) {
        studentTableBody.innerHTML = '<tr><td colspan="15" class="text-center py-4 text-gray-500">No students found matching your criteria.</td></tr>';
        return;
    }
    // const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser')); // Not used for rendering
    // const userRole = loggedInUser ? loggedInUser.user_metadata?.role || loggedInUser.app_metadata?.role : null;

    filteredStudents.forEach(student => {
        const newRow = document.createElement('tr');
        newRow.className = 'border-b hover:bg-gray-50';
        let statusBgClass = '';
        let statusTextColorClass = '';
        switch (student.status) {
            case 'Active': statusBgClass = 'bg-green-100'; statusTextColorClass = 'text-green-800'; break;
            case 'Inactive': statusBgClass = 'bg-yellow-100'; statusTextColorClass = 'text-yellow-800'; break;
            default: statusBgClass = 'bg-gray-100'; statusTextColorClass = 'text-gray-800'; break;
        }
        newRow.innerHTML = `
            <td class="py-3 px-4">${student.id}</td>
            <td class="py-3 px-4">${student.name}</td>
            <td class="py-3 px-4">${student.father_name}</td>
            <td class="py-3 px-4">${student.mother_name}</td>
            <td class="py-3 px-4">${student.class}</td>
            <td class="py-3 px-4">${student.roll_no}</td>
            <td class="py-3 px-4">${student.aadhar_no}</td>
            <td class="py-3 px-4">${student.blood_group || 'N/A'}</td>
            <td class="py-3 px-4">${student.admission_no || 'N/A'}</td>
            <td class="py-3 px-4">${student.admission_date || 'N/A'}</td>
            <td class="py-3 px-4">${student.father_aadhar || 'N/A'}</td>
            <td class="py-3 px-4">${student.mother_aadhar || 'N/A'}</td>
            <td class="py-3 px-4">
                <span class="px-2 py-1 ${statusBgClass} ${statusTextColorClass} text-xs rounded-full">${student.status}</span>
            </td>
            <td class="py-3 px-4 table-actions">
                <button class="text-blue-600 mr-3" title="Edit Student" onclick="editStudent('${student.id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="text-red-600 mr-3" title="Delete Student" onclick="deleteStudent('${student.id}')">
                    <i class="fas fa-trash"></i>
                </button>
                <button class="text-purple-600 mr-3" title="Show QR Code" onclick="showStudentQrCodeModal('${student.id}')">
                    <i class="fas fa-qrcode"></i>
                </button>
                <button class="text-green-600" title="View Details" onclick="showStudentDetailsModal('${student.id}')">
                    <i class="fas fa-info-circle"></i>
                </button>
            </td>
        `;
        studentTableBody.appendChild(newRow);
    });
    console.log('Student table rendered.');
}

function filterStudents() {
    const nameQuery = searchStudentNameInput ? searchStudentNameInput.value.toLowerCase() : '';
    const rollQuery = searchRollInput ? searchRollInput.value.toLowerCase() : '';
    const classQuery = searchClassSelect ? searchClassSelect.value.toLowerCase() : '';

    const filtered = students.filter(student => {
        const nameMatch = student.name.toLowerCase().includes(nameQuery);
        const rollMatch = student.roll_no.toLowerCase().includes(rollQuery);
        const classMatch = classQuery === '' || student.class.toLowerCase() === classQuery;
        return nameMatch && rollMatch && classMatch;
    });
    renderStudentTable(filtered);
    console.log('Students filtered.');
}

if (applyStudentSearchButton) applyStudentSearchButton.addEventListener('click', filterStudents);
if (searchStudentNameInput) searchStudentNameInput.addEventListener('keyup', filterStudents);
if (searchRollInput) searchRollInput.addEventListener('keyup', filterStudents);
if (searchClassSelect) searchClassSelect.addEventListener('change', filterStudents);

// Teacher Render Functionality
function renderTeacherTable(filteredTeachers = teachers) {
    if (!teacherTableBody) return;
    teacherTableBody.innerHTML = '';
    if (filteredTeachers.length === 0) {
        teacherTableBody.innerHTML = '<tr><td colspan="5" class="text-center py-4 text-gray-500">No teachers found.</td></tr>';
        return;
    }
    // const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser')); // Not used for rendering
    // const userRole = loggedInUser ? loggedInUser.user_metadata?.role || loggedInUser.app_metadata?.role : null;

    filteredTeachers.forEach(teacher => {
        const newRow = document.createElement('tr');
        newRow.className = 'border-b hover:bg-gray-50';
        newRow.innerHTML = `
            <td class="py-3 px-4">${teacher.id}</td>
            <td class="py-3 px-4">${teacher.name}</td>
            <td class="py-3 px-4">${teacher.subject}</td>
            <td class="py-3 px-4">${teacher.classes}</td>
            <td class="py-3 px-4 table-actions">
                <button class="text-blue-600 mr-3" title="Edit Teacher" onclick="editTeacher('${teacher.id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="text-red-600 mr-3" title="Delete Teacher" onclick="deleteTeacher('${teacher.id}')">
                    <i class="fas fa-trash"></i>
                </button>
                <button class="text-purple-600 mr-3" title="Show QR Code" onclick="showTeacherQrCodeModal('${teacher.id}')">
                    <i class="fas fa-qrcode"></i>
                </button>
                <button class="text-green-600" title="View Details" onclick="showTeacherDetailsModal('${teacher.id}')">
                    <i class="fas fa-info-circle"></i>
                </button>
            </td>
        `;
        teacherTableBody.appendChild(newRow);
    });
    console.log('Teacher table rendered.');
}

function filterTeachers() {
    const nameQuery = searchTeacherNameInput ? searchTeacherNameInput.value.toLowerCase() : '';
    const subjectQuery = searchTeacherSubjectSelect ? searchTeacherSubjectSelect.value.toLowerCase() : '';

    const filtered = teachers.filter(teacher => {
        const nameMatch = teacher.name.toLowerCase().includes(nameQuery);
        const subjectMatch = subjectQuery === '' || teacher.subject.toLowerCase() === subjectQuery;
        return nameMatch && subjectMatch;
    });
    renderTeacherTable(filtered);
    console.log('Teachers filtered.');
}

if (applyTeacherSearchButton) applyTeacherSearchButton.addEventListener('click', filterTeachers);
if (searchTeacherNameInput) searchTeacherNameInput.addEventListener('keyup', filterTeachers);
if (searchTeacherSubjectSelect) searchTeacherSubjectSelect.addEventListener('change', filterTeachers);


// User Render Functionality (Now uses profiles data)
function renderUserTable() {
    if (!userTableBody) return;
    userTableBody.innerHTML = '';
    if (profiles.length === 0) {
        userTableBody.innerHTML = '<tr><td colspan="6" class="text-center py-4 text-gray-500">No user profiles found.</td></tr>';
        return;
    }
    // const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser')); // Not used for rendering
    // const currentUserRole = loggedInUser ? loggedInUser.user_metadata?.role || loggedInUser.app_metadata?.role : null;

    profiles.forEach(profile => {
        const newRow = document.createElement('tr');
        newRow.className = 'border-b hover:bg-gray-50';
        newRow.innerHTML = `
            <td class="py-3 px-4">${profile.id}</td>
            <td class="py-3 px-4">${profile.full_name || 'N/A'}</td>
            <td class="py-3 px-4">${profile.email || 'N/A'}</td>
            <td class="py-3 px-4">${profile.role || 'N/A'}</td>
            <td class="py-3 px-4">${profile.status || 'N/A'}</td>
            <td class="py-3 px-4 table-actions">
                <button class="text-blue-600 mr-3" title="Edit User" onclick="editUser('${profile.id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="text-red-600" title="Delete User" onclick="deleteUser('${profile.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        userTableBody.appendChild(newRow);
    });
    console.log('User table rendered.');
}

// Announcement Render Functionality
function renderAnnouncementTable() {
    if (!announcementTableBody) return;
    announcementTableBody.innerHTML = '';
    if (announcements.length === 0) {
        announcementTableBody.innerHTML = '<tr><td colspan="5" class="text-center py-4 text-gray-500">No announcements found.</td></tr>';
        return;
    }
    // const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser')); // Not used for rendering
    // const userRole = loggedInUser ? loggedInUser.user_metadata?.role || loggedInUser.app_metadata?.role : null;

    announcements.forEach(announcement => {
        const newRow = document.createElement('tr');
        newRow.className = 'border-b hover:bg-gray-50';
        let statusBgClass = '';
        let statusTextColorClass = '';
        switch (announcement.status) {
            case 'Active': statusBgClass = 'bg-green-100'; statusTextColorClass = 'text-green-800'; break;
            case 'Archived': statusBgClass = 'bg-yellow-100'; statusTextColorClass = 'text-yellow-800'; break;
            default: statusBgClass = 'bg-gray-100'; statusTextColorClass = 'text-gray-800'; break;
        }
        newRow.innerHTML = `
            <td class="py-3 px-4">${announcement.title}</td>
            <td class="py-3 px-4">${announcement.content.substring(0, 50)}${announcement.content.length > 50 ? '...' : ''}</td>
            <td class="py-3 px-4">${announcement.date_posted}</td>
            <td class="py-3 px-4">
                <span class="px-2 py-1 ${statusBgClass} ${statusTextColorClass} text-xs rounded-full">${announcement.status}</span>
            </td>
            <td class="py-3 px-4 table-actions">
                <button class="text-blue-600 mr-3" title="Edit Announcement" onclick="editAnnouncement('${announcement.id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="text-red-600" title="Delete Announcement" onclick="deleteAnnouncement('${announcement.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        announcementTableBody.appendChild(newRow);
    });
    console.log('Announcement table rendered.');
}

// Audit Log Render Functionality
function renderAuditLogs() {
    if (!auditLogTableBody) return;
    auditLogTableBody.innerHTML = '';
    if (auditLogs.length === 0) {
        auditLogTableBody.innerHTML = '<tr><td colspan="5" class="text-center py-4 text-gray-500">No audit logs found.</td></tr>';
        return;
    }
    auditLogs.forEach(log => {
        const newRow = document.createElement('tr');
        newRow.className = 'border-b hover:bg-gray-50';
        newRow.innerHTML = `
            <td class="py-3 px-4">${new Date(log.timestamp).toLocaleString()}</td>
            <td class="py-3 px-4">${log.user_email}</td>
            <td class="py-3 px-4">${log.action}</td>
            <td class="py-3 px-4">${log.module}</td>
            <td class="py-3 px-4">${log.details}</td>
        `;
        auditLogTableBody.appendChild(newRow);
    });
    console.log('Audit logs rendered.');
}

// Backup Render Functionality
function renderBackupTable() {
    if (!backupTableBody) return;
    backupTableBody.innerHTML = '';
    if (backups.length === 0) {
        backupTableBody.innerHTML = '<tr><td colspan="5" class="text-center py-4 text-gray-500">No backups found.</td></tr>';
        return;
    }
    // const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser')); // Not used for rendering
    // const userRole = loggedInUser ? loggedInUser.user_metadata?.role || loggedInUser.app_metadata?.role : null;

    backups.forEach(backup => {
        const newRow = document.createElement('tr');
        newRow.className = 'border-b hover:bg-gray-50';
        newRow.innerHTML = `
            <td class="py-3 px-4">${backup.backup_id}</td>
            <td class="py-3 px-4">${new Date(backup.date).toLocaleString()}</td>
            <td class="py-3 px-4">${backup.size}</td>
            <td class="py-3 px-4">${backup.type}</td>
            <td class="py-3 px-4 table-actions">
                <button class="text-blue-600 mr-3" title="Download Backup" onclick="alert('Downloading backup ${backup.backup_id}...')">
                    <i class="fas fa-download"></i>
                </button>
                <button class="text-green-600 mr-3" title="Restore from this Backup" onclick="alert('Restoring from backup ${backup.backup_id}...')">
                    <i class="fas fa-undo"></i>
                </button>
                <button class="text-red-600" title="Delete Backup" onclick="alert('Deleting backup ${backup.backup_id}...')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        backupTableBody.appendChild(newRow);
    });
    console.log('Backup table rendered.');
}

// Student Attendance Module Functions
function renderAttendanceTable(filteredAttendance = attendanceRecords) {
    if (!attendanceTableBody) return;
    attendanceTableBody.innerHTML = '';

    let uniqueStudentsPresent = new Set(); // Track unique students present
    let uniqueStudentsAbsent = new Set(); // Track unique students absent
    let uniqueStudentsTotal = new Set(); // Track all unique students in records

    // const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser')); // Not used for rendering
    // const userRole = loggedInUser ? loggedInUser.user_metadata?.role || loggedInUser.app_metadata?.role : null;

    if (filteredAttendance.length === 0) {
        attendanceTableBody.innerHTML = '<tr><td colspan="9" class="text-center py-4 text-gray-500">No attendance records found for the selected criteria.</td></tr>';
    } else {
        filteredAttendance.forEach(record => {
            // Access student details directly from the joined 'students' object
            const student = record.students;
            if (!student) {
                console.warn(`Student data not found for attendance record ID: ${record.id}. Skipping row.`);
                return; // Skip if student data is not found (e.g., if the student was deleted)
            }

            uniqueStudentsTotal.add(student.id); // Add student to total unique count

            if (record.status === 'Present') {
                uniqueStudentsPresent.add(student.id); // Count unique present students
            } else if (record.status === 'Absent') {
                uniqueStudentsAbsent.add(student.id); // Count unique absent students
            }

            const newRow = document.createElement('tr');
            newRow.className = 'border-b hover:bg-gray-50';
            let statusBgClass = '';
            let statusTextColorClass = '';
            switch (record.status) {
                case 'Present': statusBgClass = 'bg-green-100'; statusTextColorClass = 'text-green-800'; break;
                case 'Absent': statusBgClass = 'bg-red-100'; statusTextColorClass = 'text-red-800'; break;
                case 'Leave': statusBgClass = 'bg-yellow-100'; statusTextColorClass = 'text-yellow-800'; break;
                default: statusBgClass = 'bg-gray-100'; statusTextColorClass = 'text-gray-800'; break;
            }
            newRow.innerHTML = `
                <td class="py-3 px-4">${student.name}</td>
                <td class="py-3 px-4">${student.roll_no}</td>
                <td class="py-3 px-4">${student.class}</td>
                <td class="py-3 px-4">${record.date}</td>
                <td class="py-3 px-4">
                    <span class="px-2 py-1 ${statusBgClass} ${statusTextColorClass} text-xs rounded-full">${record.status}</span>
                </td>
                <td class="py-3 px-4">${record.arrival_time || '-'}</td>
                <td class="py-3 px-4">${record.departure_time || '-'}</td>
                <td class="py-3 px-4">${record.remarks || '-'}</td>
                <td class="py-3 px-4 table-actions">
                    <button class="text-blue-600 mr-3" title="Edit Attendance" onclick="editAttendance('${record.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="text-red-600" title="Delete Attendance" onclick="deleteAttendance('${record.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            attendanceTableBody.appendChild(newRow);
        });
    }

    // Update the summary counts based on unique students
    if (attendanceTotalStudents) attendanceTotalStudents.textContent = uniqueStudentsTotal.size;
    if (attendanceTotalPresent) attendanceTotalPresent.textContent = uniqueStudentsPresent.size;
    if (attendanceTotalAbsent) attendanceTotalAbsent.textContent = uniqueStudentsAbsent.size;
    console.log('Student attendance table rendered.');
}

function filterAttendance() {
    const classFilter = attendanceClassFilter ? attendanceClassFilter.value.toLowerCase() : '';
    const dateFilter = attendanceDateFilter ? attendanceDateFilter.value : '';
    const studentNameFilter = attendanceStudentNameFilter ? attendanceStudentNameFilter.value.toLowerCase() : '';

    const filtered = attendanceRecords.filter(record => {
        // Access student details directly from the joined 'students' object
        const student = record.students;
        if (!student) return false; // Skip if student data is missing

        const classMatch = classFilter === '' || student.class.toLowerCase() === classFilter;
        const dateMatch = dateFilter === '' || record.date === dateFilter;
        const nameMatch = studentNameFilter === '' || student.name.toLowerCase().includes(studentNameFilter);

        return classMatch && dateMatch && nameMatch;
    });
    renderAttendanceTable(filtered);
    console.log('Student attendance filtered.');
}

if (applyAttendanceFilter) applyAttendanceFilter.addEventListener('click', filterAttendance);
if (attendanceClassFilter) attendanceClassFilter.addEventListener('change', filterAttendance);
if (attendanceDateFilter) attendanceDateFilter.addEventListener('change', filterAttendance);
if (attendanceStudentNameFilter) attendanceStudentNameFilter.addEventListener('keyup', filterAttendance);

// Class-wise Attendance Functions
if (loadClassStudentsBtn) {
    loadClassStudentsBtn.addEventListener('click', async () => {
        const selectedClass = classAttendanceSelect ? classAttendanceSelect.value : '';
        const selectedDate = classAttendanceDate ? classAttendanceDate.value : '';

        if (!selectedClass || !selectedDate) {
            alert('Please select both a class and a date.');
            console.warn('Load Class Students failed: Missing class or date.');
            return;
        }
        console.log(`Loading students for class ${selectedClass} on ${selectedDate}...`);

        const studentsInClass = students.filter(s => s.class === selectedClass);
        const classAttendanceBody = document.getElementById('classAttendanceTableBody');
        if (!classAttendanceBody) return;
        classAttendanceBody.innerHTML = '';

        if (studentsInClass.length === 0) {
            classAttendanceBody.innerHTML = '<tr><td colspan="5" class="text-center py-4 text-gray-500">No students found in this class.</td></tr>';
            console.log(`No students found in class ${selectedClass}.`);
            return;
        }

        for (const student of studentsInClass) {
            // Fetch the specific record for this student and date
            const { data: existingRecords, error: fetchError } = await supabase
                .from('attendance')
                .select('*')
                .eq('student_id', student.id)
                .eq('date', selectedDate);

            if (fetchError) {
                console.error('Error fetching existing attendance record for class-wise attendance:', fetchError);
                // Fallback to default if there's an error fetching
            }

            const existingRecord = existingRecords && existingRecords.length > 0 ? existingRecords[0] : null;
            const status = existingRecord ? existingRecord.status : 'Absent'; // Default to Absent if no record
            const remarks = existingRecord ? existingRecord.remarks : '';

            const newRow = document.createElement('tr');
            newRow.className = 'border-b hover:bg-gray-50';
            newRow.innerHTML = `
                <td class="py-3 px-4">${student.name}</td>
                <td class="py-3 px-4">${student.roll_no}</td>
                <td class="py-3 px-4">
                    <select class="p-2 border border-gray-300 rounded-lg status-select" data-student-id="${student.id}">
                        <option value="Present" ${status === 'Present' ? 'selected' : ''}>Present</option>
                        <option value="Absent" ${status === 'Absent' ? 'selected' : ''}>Absent</option>
                        <option value="Leave" ${status === 'Leave' ? 'selected' : ''}>Leave</option>
                    </select>
                </td>
                <td class="py-3 px-4">
                    <input type="text" class="w-full p-2 border border-gray-300 rounded-lg remarks-input" value="${remarks}" placeholder="Remarks">
                </td>
                <td class="py-3 px-4">
                    <button class="bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600 save-attendance-btn" data-student-id="${student.id}">Save</button>
                </td>
            `;
            classAttendanceBody.appendChild(newRow);
        }

        // Add event listeners for individual save buttons
        document.querySelectorAll('.save-attendance-btn').forEach(button => {
            button.addEventListener('click', async (event) => {
                const studentId = event.target.dataset.studentId;
                const row = event.target.closest('tr');
                const statusSelect = row?.querySelector('.status-select');
                const remarksInput = row?.querySelector('.remarks-input');

                const status = statusSelect ? statusSelect.value : 'Absent';
                const remarks = remarksInput ? remarksInput.value : '';
                await markIndividualAttendance(studentId, selectedDate, status, remarks);
            });
        });
        console.log(`Students for class ${selectedClass} loaded into class attendance table.`);
    });
}

if (markAllPresentBtn) {
    markAllPresentBtn.addEventListener('click', async () => {
        const selectedClass = classAttendanceSelect ? classAttendanceSelect.value : '';
        const selectedDate = classAttendanceDate ? classAttendanceDate.value : '';

        if (!selectedClass || !selectedDate) {
            alert('Please select both a class and a date.');
            console.warn('Mark Class Attendance failed: Missing class or date.');
            return;
        }

        if (!confirm(`Are you sure you want to mark all students in ${selectedClass} as PRESENT for ${selectedDate}?`)) {
            return;
        }
        console.log(`Marking all students in ${selectedClass} as PRESENT for ${selectedDate}...`);

        const studentsInClass = students.filter(s => s.class === selectedClass);
        const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
        const userEmail = loggedInUser?.email || 'System';

        for (const student of studentsInClass) {
            const attendanceData = {
                student_id: student.id,
                date: selectedDate,
                status: 'Present',
                remarks: 'Marked Present (Class-wise)'
            };

            try {
                await supabase.from('attendance').upsert(
                    { ...attendanceData },
                    { onConflict: ['student_id', 'date'] }
                );
                await addAuditLog(userEmail, 'Marked Class Attendance', 'Attendance', `Marked Present for ${student.name} (Class: ${selectedClass}) on ${selectedDate}`);
            } catch (error) {
                console.error(`Error marking attendance for ${student.name}:`, error);
                await addAuditLog(userEmail, 'Class Attendance Failed', 'Attendance', `Failed to mark attendance for ${student.name} (Class: ${selectedClass}) on ${selectedDate}: ${error.message}`);
            }
        }
        alert(`All students in ${selectedClass} marked as Present for ${selectedDate}.`);
        await fetchAttendanceRecords(); // Refresh the main attendance table and summary counts
        loadClassStudentsBtn?.click(); // Reload the class-wise table to show updated statuses
        console.log('Class attendance marked successfully.');
    });
}

async function markIndividualAttendance(studentId, date, status, remarks) {
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    const userEmail = loggedInUser?.email || 'System';
    const student = students.find(s => s.id === studentId);
    console.log(`Marking individual attendance for ${student ? student.name : studentId} as ${status} on ${date}...`);

    const attendanceData = {
        student_id: studentId,
        date: date,
        status: status,
        arrival_time: status === 'Present' ? new Date().toTimeString().split(' ')[0] : null, // Set arrival time if marking present
        departure_time: null, // Clear departure time if marking present
        remarks: remarks
    };

    try {
        await supabase.from('attendance').upsert(
            { ...attendanceData },
            { onConflict: ['student_id', 'date'] }
        );
        alert(`Attendance for ${student ? student.name : 'student'} updated to ${status} for ${date}.`);
        await addAuditLog(userEmail, 'Marked Individual Attendance', 'Attendance', `Marked ${status} for ${student ? student.name : studentId} on ${date}`);
        await fetchAttendanceRecords(); // Refresh the main attendance table and summary counts
        console.log(`Individual attendance for ${student ? student.name : studentId} updated successfully.`);
    } catch (error) {
        console.error(`Error marking attendance for ${student ? student.name : studentId}:`, error);
        alert(`Error marking attendance for ${student ? student.name : studentId}: ${error.message}`);
        await addAuditLog(userEmail, 'Individual Attendance Failed', 'Attendance', `Failed to mark attendance for ${student ? student.name : studentId} on ${date}: ${error.message}`);
    }
}


// Teacher Attendance Module Functions
function renderTeacherAttendanceTable(filteredRecords = teacherAttendanceRecords) {
    if (!teacherAttendanceRecordsTableBody) return;
    teacherAttendanceRecordsTableBody.innerHTML = '';

    let uniqueTeachersPresent = new Set(); // Track unique teachers present
    let uniqueTeachersAbsent = new Set(); // Track unique teachers absent
    let uniqueTeachersTotal = new Set(); // Track all unique teachers in records

    // const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser')); // Not used for rendering
    // const userRole = loggedInUser ? loggedInUser.user_metadata?.role || loggedInUser.app_metadata?.role : null;

    if (filteredRecords.length === 0) {
        teacherAttendanceRecordsTableBody.innerHTML = '<tr><td colspan="8" class="text-center py-4 text-gray-500">No teacher attendance records found for the selected criteria.</td></tr>';
    } else {
        filteredRecords.forEach(record => {
            // Access teacher details directly from the joined 'teachers' object
            const teacher = record.teachers;
            if (!teacher) {
                console.warn(`Teacher data not found for teacher attendance record ID: ${record.id}. Skipping row.`);
                return; // Skip if teacher data is not found
            }

            uniqueTeachersTotal.add(teacher.id); // Add teacher to total unique count

            if (record.status === 'Present') {
                uniqueTeachersPresent.add(teacher.id); // Count unique present teachers
            } else if (record.status === 'Absent') {
                uniqueTeachersAbsent.add(teacher.id); // Count unique absent teachers
            }

            const newRow = document.createElement('tr');
            newRow.className = 'border-b hover:bg-gray-50';
            let statusBgClass = '';
            let statusTextColorClass = '';
            switch (record.status) {
                case 'Present': statusBgClass = 'bg-green-100'; statusTextColorClass = 'text-green-800'; break;
                case 'Absent': statusBgClass = 'bg-red-100'; statusTextColorClass = 'text-red-800'; break;
                case 'Leave': statusBgClass = 'bg-yellow-100'; statusTextColorClass = 'text-yellow-800'; break;
                default: statusBgClass = 'bg-gray-100'; statusTextColorClass = 'text-gray-800'; break;
            }
            newRow.innerHTML = `
                <td class="py-3 px-4">${teacher.name}</td>
                <td class="py-3 px-4">${teacher.subject}</td>
                <td class="py-3 px-4">${record.date}</td>
                <td class="py-3 px-4">
                    <span class="px-2 py-1 ${statusBgClass} ${statusTextColorClass} text-xs rounded-full">${record.status}</span>
                </td>
                <td class="py-3 px-4">${record.arrival_time || '-'}</td>
                <td class="py-3 px-4">${record.departure_time || '-'}</td>
                <td class="py-3 px-4">${record.remarks || '-'}</td>
                <td class="py-3 px-4 table-actions">
                    <button class="text-blue-600 mr-3" title="Edit Attendance" onclick="editTeacherAttendance('${record.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="text-red-600" title="Delete Attendance" onclick="deleteTeacherAttendance('${record.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                    <button class="text-green-600" title="View Teacher Details" onclick="showTeacherDetailsModal('${teacher.id}')">
                        <i class="fas fa-info-circle"></i>
                    </button>
                </td>
            `;
            teacherAttendanceRecordsTableBody.appendChild(newRow);
        });
    }

    // Update the summary counts based on unique teachers
    if (teacherAttendanceTotalTeachers) teacherAttendanceTotalTeachers.textContent = uniqueTeachersTotal.size;
    if (teacherAttendanceTotalPresent) teacherAttendanceTotalPresent.textContent = uniqueTeachersPresent.size;
    if (teacherAttendanceTotalAbsent) teacherAttendanceTotalAbsent.textContent = uniqueTeachersAbsent.size;
    console.log('Teacher attendance table rendered.');
}

function filterTeacherAttendance() {
    const subjectFilter = teacherAttendanceSubjectFilter ? teacherAttendanceSubjectFilter.value.toLowerCase() : '';
    const dateFilter = teacherAttendanceDateFilter ? teacherAttendanceDateFilter.value : '';
    const nameFilter = teacherAttendanceNameFilter ? teacherAttendanceNameFilter.value.toLowerCase() : '';

    const filtered = teacherAttendanceRecords.filter(record => {
        // Access teacher details directly from the joined 'teachers' object
        const teacher = record.teachers;
        if (!teacher) return false; // Skip if teacher data is missing

        const subjectMatch = subjectFilter === '' || teacher.subject.toLowerCase() === subjectFilter;
        const dateMatch = dateFilter === '' || record.date === dateFilter;
        const nameMatch = nameFilter === '' || teacher.name.toLowerCase().includes(nameFilter);

        return subjectMatch && dateMatch && nameMatch;
    });
    renderTeacherAttendanceTable(filtered);
    console.log('Teacher attendance filtered.');
}

if (applyTeacherAttendanceFilter) applyTeacherAttendanceFilter.addEventListener('click', filterTeacherAttendance);
if (teacherAttendanceSubjectFilter) teacherAttendanceSubjectFilter.addEventListener('change', filterTeacherAttendance);
if (teacherAttendanceDateFilter) teacherAttendanceDateFilter.addEventListener('change', filterTeacherAttendance);
if (teacherAttendanceNameFilter) teacherAttendanceNameFilter.addEventListener('keyup', filterTeacherAttendance);

window.showAddTeacherAttendanceModal = function() {
    // const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser')); // Not used for modal display logic
    // const userRole = loggedInUser ? loggedInUser.user_metadata?.role || loggedInUser.app_metadata?.role : null;
    if (teacherAttendanceModalTitle) {
        teacherAttendanceModalTitle.textContent = 'Mark Teacher Attendance';
    }
    if (teacherAttendanceFormSubmitBtn) {
        teacherAttendanceFormSubmitBtn.textContent = 'Mark Attendance';
    }
    document.getElementById('teacherAttendanceId').value = '';
    if (teacherAttendanceForm) {
        teacherAttendanceForm.reset();
    }
    populateTeacherSelect();
    const teacherAttendanceDateInput = document.getElementById('teacherAttendanceDate');
    if (teacherAttendanceDateInput) {
        teacherAttendanceDateInput.valueAsDate = new Date();
    }
    if (teacherAttendanceModal) {
        teacherAttendanceModal.classList.remove('hidden');
        teacherAttendanceModal.style.display = 'flex';
        console.log('Add Teacher Attendance modal opened.');
    }
}

window.editTeacherAttendance = function(id) {
    // const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser')); // Not used for modal display logic
    // const userRole = loggedInUser ? loggedInUser.user_metadata?.role || loggedInUser.app_metadata?.role : null;
    const record = teacherAttendanceRecords.find(r => r.id === id);
    if (record) {
        if (teacherAttendanceModalTitle) {
            teacherAttendanceModalTitle.textContent = 'Edit Teacher Attendance';
        }
        if (teacherAttendanceFormSubmitBtn) {
            teacherAttendanceFormSubmitBtn.textContent = 'Save Changes';
        }
        document.getElementById('teacherAttendanceId').value = record.id;
        populateTeacherSelect(record.teacher_id);
        document.getElementById('teacherAttendanceDate').value = record.date;
        document.getElementById('teacherAttendanceStatus').value = record.status;
        document.getElementById('teacherArrivalTime').value = record.arrival_time || '';
        document.getElementById('teacherDepartureTime').value = record.departure_time || '';
        document.getElementById('teacherAttendanceRemarks').value = record.remarks || '';
        if (teacherAttendanceModal) {
            teacherAttendanceModal.classList.remove('hidden');
            teacherAttendanceModal.style.display = 'flex';
            console.log(`Edit Teacher Attendance modal opened for ID: ${id}`);
        }
    }
}

window.deleteTeacherAttendance = async function(id) {
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    const userEmail = loggedInUser?.email || 'admin';
    if (confirm('Are you sure you want to delete this teacher attendance record?')) {
        console.log(`Deleting teacher attendance record ID: ${id}`);
        try {
            const { error } = await supabase.from('teacher_attendance').delete().eq('id', id);
            if (error) throw error;

            const deletedRecord = teacherAttendanceRecords.find(r => r.id === id);
            const teacher = deletedRecord?.teachers; // Access teacher details from the joined object
            await addAuditLog(userEmail, 'Deleted Teacher Attendance', 'Teacher Attendance', `Deleted attendance for ${teacher ? teacher.name : 'Unknown Teacher'} on ${deletedRecord?.date || 'N/A'}`);
            alert('Teacher attendance record deleted successfully!');
            await fetchTeacherAttendanceRecords();
            console.log(`Teacher attendance record ID ${id} deleted successfully.`);
        } catch (error) {
            alert('Error deleting teacher attendance record: ' + error.message);
            console.error('Supabase error deleting teacher attendance record:', error);
            await addAuditLog(userEmail, 'Delete Teacher Attendance Failed', 'Teacher Attendance', `Error: ${error.message}`);
        }
    }
}

function populateTeacherSelect(selectedTeacherId = '') {
    if (!teacherAttendanceTeacherSelect) return;
    teacherAttendanceTeacherSelect.innerHTML = '<option value="">Select Teacher</option>';
    teachers.forEach(teacher => {
        const option = document.createElement('option');
        option.value = teacher.id;
        option.textContent = `${teacher.name} (Subject: ${teacher.subject})`;
        if (teacher.id === selectedTeacherId) {
            option.selected = true;
        }
        teacherAttendanceTeacherSelect.appendChild(option);
    });
    console.log('Teacher select populated.');
}

// Update Dashboard Stats
function updateDashboardStats() {
    if (totalStudentsCount) totalStudentsCount.textContent = students.length.toLocaleString();
    if (totalTeachersCount) totalTeachersCount.textContent = teachers.length.toLocaleString();

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const currentMonthRevenue = invoices.filter(inv => {
        const invDate = new Date(inv.date);
        return inv.status === 'Paid' && invDate.getMonth() === currentMonth && invDate.getFullYear() === currentYear;
    }).reduce((sum, inv) => sum + parseFloat(inv.amount), 0);
    if (monthlyRevenue) monthlyRevenue.textContent = `₹${currentMonthRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    // Calculate students present today
    const today = new Date().toISOString().split('T')[0];
    // Use unique students for today's count
    const studentsPresentTodayCount = new Set(attendanceRecords.filter(record => record.date === today && record.status === 'Present').map(rec => rec.student_id)).size;
    if (studentsPresentToday) {
        studentsPresentToday.textContent = studentsPresentTodayCount.toLocaleString();
    }

    // Calculate teachers present today
    // Use unique teachers for today's count
    const teachersPresentTodayCount = new Set(teacherAttendanceRecords.filter(record => record.date === today && record.status === 'Present').map(rec => rec.teacher_id)).size;
    if (teachersPresentToday) {
        teachersPresentToday.textContent = teachersPresentTodayCount.toLocaleString();
    }


    if (upcomingEventsCount && calendar) {
        const today = new Date();
        today.setHours(0,0,0,0);
        const upcomingEvents = calendar.getEvents().filter(event => {
            if (event.classNames.includes('holiday')) {
                return new Date(event.start) >= today;
            }
            return event.end ? new Date(event.end) >= today : new Date(event.start) >= today;
        });
        upcomingEventsCount.textContent = upcomingEvents.length.toLocaleString();
    } else if (upcomingEventsCount) {
        upcomingEventsCount.textContent = 'N/A';
    }
    console.log('Dashboard stats updated.');
    initCharts(); // Ensure charts are updated with new data
}

// Render Recent Activity
function renderRecentActivity() {
    if (!recentActivityList) return;
    recentActivityList.innerHTML = '';
    auditLogs.slice(0, 3).forEach(log => {
        const div = document.createElement('div');
        div.className = 'flex items-start space-x-3 animate-slideInFromLeft';
        let iconClass = 'fas fa-info-circle';
        let iconBgClass = 'bg-gray-50';
        let iconTextColorClass = 'text-gray-600';

        if (log.action.includes('Added Student')) { iconClass = 'fas fa-user-plus'; iconBgClass = 'bg-blue-50'; iconTextColorClass = 'text-blue-600'; }
        else if (log.action.includes('Processed Payroll')) { iconClass = 'fas fa-money-bill-wave'; iconBgClass = 'bg-green-50'; iconTextColorClass = 'text-green-600'; }
        else if (log.action.includes('Added Invoice')) { iconClass = 'fas fa-file-invoice-dollar'; iconBgClass = 'bg-purple-50'; iconTextColorClass = 'text-purple-600'; }
        else if (log.action.includes('Logged In')) { iconClass = 'fas fa-sign-in-alt'; iconBgClass = 'bg-indigo-50'; iconTextColorClass = 'text-indigo-600'; }
        else if (log.action.includes('Notification')) { iconClass = 'fas fa-bell'; iconBgClass = 'bg-orange-50'; iconTextColorClass = 'text-orange-600'; }
        else if (log.action.includes('Added Teacher')) { iconClass = 'fas fa-chalkboard-teacher'; iconBgClass = 'bg-green-50'; iconTextColorClass = 'text-green-600'; }
        else if (log.action.includes('Added User')) { iconClass = 'fas fa-user-plus'; iconBgClass = 'bg-red-50'; iconTextColorClass = 'text-red-600'; }
        else if (log.action.includes('Published Announcement')) { iconClass = 'fas fa-bullhorn'; iconBgClass = 'bg-pink-50'; iconTextColorClass = 'text-pink-600'; }
        else if (log.action.includes('Marked Attendance') || log.action.includes('Updated Attendance')) { iconClass = 'fas fa-check-circle'; iconBgClass = 'bg-indigo-50'; iconTextColorClass = 'text-indigo-600'; }

        div.innerHTML = `
            <div class="icon-wrapper ${iconBgClass} ${iconTextColorClass}">
                <i class="${iconClass}"></i>
            </div>
            <div>
                <p class="font-medium">${log.action}</p>
                <p class="text-sm text-gray-500">${log.details}</p>
                <p class="text-xs text-gray-400">${new Date(log.timestamp).toLocaleString()}</p>
            </div>
        `;
        recentActivityList.appendChild(div);
    });
    console.log('Recent activity list rendered.');
}

// Modals for Add/Edit Student, Teacher, User, Announcement, Attendance
window.showAddStudentForm = function() {
    // const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser')); // Not used for modal display logic
    // const userRole = loggedInUser ? loggedInUser.user_metadata?.role || loggedInUser.app_metadata?.role : null;
    if (studentModalTitle) {
        studentModalTitle.textContent = 'Add New Student';
    }
    if (studentFormSubmitBtn) {
        studentFormSubmitBtn.textContent = 'Add Student';
    }
    document.getElementById('studentId').value = '';
    if (studentForm) {
        studentForm.reset();
    }
    if (studentModal) {
        studentModal.classList.remove('hidden');
        studentModal.style.display = 'flex';
        console.log('Add Student form opened.');
    }
}
window.editStudent = function(id) {
    // const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser')); // Not used for modal display logic
    // const userRole = loggedInUser ? loggedInUser.user_metadata?.role || loggedInUser.app_metadata?.role : null;
    const student = students.find(s => s.id === id);
    if (student) {
        if (studentModalTitle) {
            studentModalTitle.textContent = 'Edit Student';
        }
        if (studentFormSubmitBtn) {
            studentFormSubmitBtn.textContent = 'Save Changes';
        }
        document.getElementById('studentId').value = student.id;
        document.getElementById('studentFullName').value = student.name;
        document.getElementById('studentFatherName').value = student.father_name;
        document.getElementById('studentMotherName').value = student.mother_name;
        document.getElementById('studentClass').value = student.class;
        document.getElementById('studentRollNo').value = student.roll_no;
        document.getElementById('studentAadharNo').value = student.aadhar_no;
        document.getElementById('studentBloodGroup').value = student.blood_group || '';
        document.getElementById('studentAdmissionNo').value = student.admission_no || '';
        document.getElementById('studentAdmissionDate').value = student.admission_date || '';
        document.getElementById('studentFatherAadhar').value = student.father_aadhar || '';
        document.getElementById('studentMotherAadhar').value = student.mother_aadhar || '';
        document.getElementById('studentEmail').value = student.email || '';
        document.getElementById('studentPhone').value = student.phone || '';
        document.getElementById('studentStatus').value = student.status;
        if (studentModal) {
            studentModal.classList.remove('hidden');
            studentModal.style.display = 'flex';
            console.log(`Edit Student form opened for ID: ${id}`);
        }
    }
}

if (closeStudentModal) {
    closeStudentModal.addEventListener('click', () => {
        if (studentModal) {
            studentModal.classList.add('hidden');
            studentModal.style.display = 'none';
        }
        if (studentForm) studentForm.reset();
        console.log('Student modal closed.');
    });
}

if (studentModal) {
    studentModal.addEventListener('click', (e) => {
        if (e.target === studentModal) {
            studentModal.classList.add('hidden');
            studentModal.style.display = 'none';
            if (studentForm) studentForm.reset();
            console.log('Student modal closed by outside click.');
        }
    });
}

if (studentForm) {
    studentForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
        const userEmail = loggedInUser?.email || 'admin';

        const studentId = document.getElementById('studentId').value;
        const studentData = {
            name: document.getElementById('studentFullName').value,
            father_name: document.getElementById('studentFatherName').value,
            mother_name: document.getElementById('studentMotherName').value,
            class: document.getElementById('studentClass').value,
            roll_no: document.getElementById('studentRollNo').value,
            aadhar_no: document.getElementById('studentAadharNo').value,
            blood_group: document.getElementById('studentBloodGroup').value || null,
            admission_no: document.getElementById('studentAdmissionNo').value || null,
            admission_date: document.getElementById('studentAdmissionDate').value || null,
            father_aadhar: document.getElementById('studentFatherAadhar').value || null,
            mother_aadhar: document.getElementById('studentMotherAadhar').value || null,
            email: document.getElementById('studentEmail').value || null,
            phone: document.getElementById('studentPhone').value || null,
            status: document.getElementById('studentStatus').value
        };

        try {
            let response;
            if (studentId) {
                // Update existing student
                response = await supabase.from('students').update(studentData).eq('id', studentId).select();
                alert('Student updated successfully!');
                await addAuditLog(userEmail, 'Updated Student', 'Students', `Updated student: ${studentData.name} (ID: ${studentId})`);
            } else {
                // Add new student
                response = await supabase.from('students').insert([studentData]).select();
                alert('Student added successfully!');
                await addAuditLog(userEmail, 'Added Student', 'Students', `Added new student: ${studentData.name}`);
            }

            if (response.error) throw response.error;

            await fetchStudents(); // Re-fetch students to update the table
            if (studentModal) {
                studentModal.classList.add('hidden');
                studentModal.style.display = 'none';
            }
            if (studentForm) {
                studentForm.reset();
            }
            console.log('Student form submitted successfully.');
        } catch (error) {
            alert('Error saving student: ' + error.message);
            console.error('Supabase error saving student:', error);
            await addAuditLog(userEmail, 'Student Save Failed', 'Students', `Error: ${error.message}`);
        }
    });
}

window.deleteStudent = async function(id) {
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    const userEmail = loggedInUser?.email || 'admin';
    if (confirm('Are you sure you want to delete this student? This action cannot be undone.')) {
        console.log(`Deleting student ID: ${id}`);
        try {
            const { error } = await supabase.from('students').delete().eq('id', id);
            if (error) throw error;

            const deletedStudent = students.find(s => s.id === id);
            await addAuditLog(userEmail, 'Deleted Student', 'Students', `Deleted student: ${deletedStudent?.name || 'Unknown'} (ID: ${id})`);
            alert('Student deleted successfully!');
            await fetchStudents(); // Re-fetch students to update the table
            console.log(`Student ID ${id} deleted successfully.`);
        } catch (error) {
            alert('Error deleting student: ' + error.message);
            console.error('Supabase error deleting student:', error);
            await addAuditLog(userEmail, 'Student Delete Failed', 'Students', `Error: ${error.message}`);
        }
    }
}

window.showStudentDetailsModal = function(id) {
    const student = students.find(s => s.id === id);
    if (student) {
        if (studentDetailsModalTitle) {
            studentDetailsModalTitle.textContent = `Details for ${student.name}`;
        }
        if (studentDetailsContent) {
            studentDetailsContent.innerHTML = `
                <p><strong>ID:</strong> ${student.id}</p>
                <p><strong>Full Name:</strong> ${student.name}</p>
                <p><strong>Father's Name:</strong> ${student.father_name}</p>
                <p><strong>Mother's Name:</strong> ${student.mother_name}</p>
                <p><strong>Class:</strong> ${student.class}</p>
                <p><strong>Roll No.:</strong> ${student.roll_no}</p>
                <p><strong>Aadhar No.:</strong> ${student.aadhar_no}</p>
                <p><strong>Blood Group:</strong> ${student.blood_group || 'N/A'}</p>
                <p><strong>Admission No.:</strong> ${student.admission_no || 'N/A'}</p>
                <p><strong>Admission Date:</strong> ${student.admission_date || 'N/A'}</p>
                <p><strong>Father's Aadhar:</strong> ${student.father_aadhar || 'N/A'}</p>
                <p><strong>Mother's Aadhar:</strong> ${student.mother_aadhar || 'N/A'}</p>
                <p><strong>Email:</strong> ${student.email || 'N/A'}</p>
                <p><strong>Phone:</strong> ${student.phone || 'N/A'}</p>
                <p><strong>Status:</strong> ${student.status}</p>
            `;
        }
        if (studentDetailsModal) {
            studentDetailsModal.classList.remove('hidden');
            studentDetailsModal.style.display = 'flex';
            console.log(`Student details modal opened for ID: ${id}`);
        }
    } else {
        alert('Student not found.');
        console.warn(`Student with ID ${id} not found for details display.`);
    }
}

if (closeStudentDetailsModal) {
    closeStudentDetailsModal.addEventListener('click', () => {
        if (studentDetailsModal) {
            studentDetailsModal.classList.add('hidden');
            studentDetailsModal.style.display = 'none';
        }
        console.log('Student details modal closed.');
    });
}

if (studentDetailsModal) {
    studentDetailsModal.addEventListener('click', (e) => {
        if (e.target === studentDetailsModal) {
            studentDetailsModal.classList.add('hidden');
            studentDetailsModal.style.display = 'none';
            console.log('Student details modal closed by outside click.');
        }
    });
}

window.showAddTeacherForm = function() {
    // const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser')); // Not used for modal display logic
    // const userRole = loggedInUser ? loggedInUser.user_metadata?.role || loggedInUser.app_metadata?.role : null;
    if (teacherModalTitle) {
        teacherModalTitle.textContent = 'Add New Teacher';
    }
    if (teacherFormSubmitBtn) {
        teacherFormSubmitBtn.textContent = 'Add Teacher';
    }
    document.getElementById('teacherId').value = '';
    if (teacherForm) {
        teacherForm.reset();
    }
    if (teacherModal) {
        teacherModal.classList.remove('hidden');
        teacherModal.style.display = 'flex';
        console.log('Add Teacher form opened.');
    }
}

window.editTeacher = function(id) {
    // const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser')); // Not used for modal display logic
    // const userRole = loggedInUser ? loggedInUser.user_metadata?.role || loggedInUser.app_metadata?.role : null;
    const teacher = teachers.find(t => t.id === id);
    if (teacher) {
        if (teacherModalTitle) {
            teacherModalTitle.textContent = 'Edit Teacher';
        }
        if (teacherFormSubmitBtn) {
            teacherFormSubmitBtn.textContent = 'Save Changes';
        }
        document.getElementById('teacherId').value = teacher.id;
        document.getElementById('teacherFullName').value = teacher.name;
        document.getElementById('teacherSubject').value = teacher.subject;
        document.getElementById('teacherEmail').value = teacher.email || '';
        document.getElementById('teacherClasses').value = teacher.classes || '';
        if (teacherModal) {
            teacherModal.classList.remove('hidden');
            teacherModal.style.display = 'flex';
            console.log(`Edit Teacher form opened for ID: ${id}`);
        }
    }
}

if (closeTeacherModal) {
    closeTeacherModal.addEventListener('click', () => {
        if (teacherModal) {
            teacherModal.classList.add('hidden');
            teacherModal.style.display = 'none';
        }
        if (teacherForm) teacherForm.reset();
        console.log('Teacher modal closed.');
    });
}

if (teacherModal) {
    teacherModal.addEventListener('click', (e) => {
        if (e.target === teacherModal) {
            teacherModal.classList.add('hidden');
            teacherModal.style.display = 'none';
            if (teacherForm) teacherForm.reset();
            console.log('Teacher modal closed by outside click.');
        }
    });
}

if (teacherForm) {
    teacherForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
        const userEmail = loggedInUser?.email || 'admin';

        const teacherId = document.getElementById('teacherId').value;
        const teacherData = {
            name: document.getElementById('teacherFullName').value,
            subject: document.getElementById('teacherSubject').value,
            email: document.getElementById('teacherEmail').value || null,
            classes: document.getElementById('teacherClasses').value || null
        };

        try {
            let response;
            if (teacherId) {
                // Update existing teacher
                response = await supabase.from('teachers').update(teacherData).eq('id', teacherId).select();
                alert('Teacher updated successfully!');
                await addAuditLog(userEmail, 'Updated Teacher', 'Teachers', `Updated teacher: ${teacherData.name} (ID: ${teacherId})`);
            } else {
                // Add new teacher
                response = await supabase.from('teachers').insert([teacherData]).select();
                alert('Teacher added successfully!');
                await addAuditLog(userEmail, 'Added Teacher', 'Teachers', `Added new teacher: ${teacherData.name}`);
            }

            if (response.error) throw response.error;

            await fetchTeachers(); // Re-fetch teachers to update the table
            if (teacherModal) {
                teacherModal.classList.add('hidden');
                teacherModal.style.display = 'none';
            }
            if (teacherForm) {
                teacherForm.reset();
            }
            console.log('Teacher form submitted successfully.');
        } catch (error) {
            alert('Error saving teacher: ' + error.message);
            console.error('Supabase error saving teacher:', error);
            await addAuditLog(userEmail, 'Teacher Save Failed', 'Teachers', `Error: ${error.message}`);
        }
    });
}

window.deleteTeacher = async function(id) {
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    const userEmail = loggedInUser?.email || 'admin';
    if (confirm('Are you sure you want to delete this teacher? This action cannot be undone.')) {
        console.log(`Deleting teacher ID: ${id}`);
        try {
            const { error } = await supabase.from('teachers').delete().eq('id', id);
            if (error) throw error;

            const deletedTeacher = teachers.find(t => t.id === id);
            await addAuditLog(userEmail, 'Deleted Teacher', 'Teachers', `Deleted teacher: ${deletedTeacher?.name || 'Unknown'} (ID: ${id})`);
            alert('Teacher deleted successfully!');
            await fetchTeachers(); // Re-fetch teachers to update the table
            console.log(`Teacher ID ${id} deleted successfully.`);
        } catch (error) {
            alert('Error deleting teacher: ' + error.message);
            console.error('Supabase error deleting teacher:', error);
            await addAuditLog(userEmail, 'Teacher Delete Failed', 'Teachers', `Error: ${error.message}`);
        }
    }
}

window.showTeacherDetailsModal = function(id) {
    const teacher = teachers.find(t => t.id === id);
    if (teacher) {
        if (teacherDetailsModalTitle) {
            teacherDetailsModalTitle.textContent = `Details for ${teacher.name}`;
        }
        if (teacherDetailsContent) {
            teacherDetailsContent.innerHTML = `
                <p><strong>ID:</strong> ${teacher.id}</p>
                <p><strong>Full Name:</strong> ${teacher.name}</p>
                <p><strong>Subject:</strong> ${teacher.subject}</p>
                <p><strong>Email:</strong> ${teacher.email || 'N/A'}</p>
                <p><strong>Classes:</strong> ${teacher.classes || 'N/A'}</p>
            `;
        }
        if (teacherDetailsModal) {
            teacherDetailsModal.classList.remove('hidden');
            teacherDetailsModal.style.display = 'flex';
            console.log(`Teacher details modal opened for ID: ${id}`);
        }
    } else {
        alert('Teacher not found.');
        console.warn(`Teacher with ID ${id} not found for details display.`);
    }
}

if (closeTeacherDetailsModal) {
    closeTeacherDetailsModal.addEventListener('click', () => {
        if (teacherDetailsModal) {
            teacherDetailsModal.classList.add('hidden');
            teacherDetailsModal.style.display = 'none';
        }
        console.log('Teacher details modal closed.');
    });
}

if (teacherDetailsModal) {
    teacherDetailsModal.addEventListener('click', (e) => {
        if (e.target === teacherDetailsModal) {
            teacherDetailsModal.classList.add('hidden');
            teacherDetailsModal.style.display = 'none';
            console.log('Teacher details modal closed by outside click.');
        }
    });
}

window.showAddUserForm = function() {
    // const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser')); // Not used for modal display logic
    // const userRole = loggedInUser ? loggedInUser.user_metadata?.role || loggedInUser.app_metadata?.role : null;
    if (userModalTitle) {
        userModalTitle.textContent = 'Add New User';
    }
    if (userFormSubmitBtn) {
        userFormSubmitBtn.textContent = 'Add User';
    }
    document.getElementById('userId').value = '';
    if (userForm) {
        userForm.reset();
    }
    if (userModal) {
        userModal.classList.remove('hidden');
        userModal.style.display = 'flex';
        console.log('Add User form opened.');
    }
}

window.editUser = function(id) {
    // const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser')); // Not used for modal display logic
    // const userRole = loggedInUser ? loggedInUser.user_metadata?.role || loggedInUser.app_metadata?.role : null;
    const profile = profiles.find(p => p.id === id);
    if (profile) {
        if (userModalTitle) {
            userModalTitle.textContent = 'Edit User';
        }
        if (userFormSubmitBtn) {
            userFormSubmitBtn.textContent = 'Save Changes';
        }
        document.getElementById('userId').value = profile.id;
        document.getElementById('userFullName').value = profile.full_name || '';
        document.getElementById('userEmail').value = profile.email || '';
        document.getElementById('userRole').value = profile.role || '';
        document.getElementById('userStatus').value = profile.status || '';
        // Password field is intentionally left blank for editing
        document.getElementById('userPassword').value = '';
        if (userModal) {
            userModal.classList.remove('hidden');
            userModal.style.display = 'flex';
            console.log(`Edit User form opened for ID: ${id}`);
        }
    }
}

if (closeUserModal) {
    closeUserModal.addEventListener('click', () => {
        if (userModal) {
            userModal.classList.add('hidden');
            userModal.style.display = 'none';
        }
        if (userForm) userForm.reset();
        console.log('User modal closed.');
    });
}

if (userModal) {
    userModal.addEventListener('click', (e) => {
        if (e.target === userModal) {
            userModal.classList.add('hidden');
            userModal.style.display = 'none';
            if (userForm) userForm.reset();
            console.log('User modal closed by outside click.');
        }
    });
}

if (userForm) {
    userForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
        const userEmail = loggedInUser?.email || 'admin';

        const userId = document.getElementById('userId').value;
        const fullName = document.getElementById('userFullName').value;
        const email = document.getElementById('userEmail').value;
        const role = document.getElementById('userRole').value;
        const password = document.getElementById('userPassword').value;
        const status = document.getElementById('userStatus').value;

        try {
            if (userId) {
                // Update existing user profile
                const { error: profileError } = await supabase.from('profiles').update({
                    full_name: fullName,
                    email: email,
                    role: role,
                    status: status
                }).eq('id', userId);

                if (profileError) throw profileError;

                // Update user authentication email/password if provided
                if (password) {
                    const { error: authUpdateError } = await supabase.auth.admin.updateUserById(userId, {
                        email: email,
                        password: password
                    });
                    if (authUpdateError) throw authUpdateError;
                } else {
                    // If password is not provided, only update email if it changed
                    const { data: userData, error: fetchUserError } = await supabase.auth.admin.getUserById(userId);
                    if (fetchUserError) throw fetchUserError;
                    if (userData.user.email !== email) {
                        const { error: authUpdateEmailError } = await supabase.auth.admin.updateUserById(userId, { email: email });
                        if (authUpdateEmailError) throw authUpdateEmailError;
                    }
                }

                alert('User updated successfully!');
                await addAuditLog(userEmail, 'Updated User', 'User Management', `Updated user: ${fullName} (ID: ${userId})`);
            } else {
                // Add new user (sign up)
                const { data, error: signUpError } = await supabase.auth.signUp({
                    email: email,
                    password: password,
                    options: {
                        data: {
                            full_name: fullName,
                            role: role
                        }
                    }
                });

                if (signUpError) throw signUpError;

                // Insert into profiles table
                const { error: profileInsertError } = await supabase.from('profiles').insert([
                    {
                        id: data.user.id,
                        full_name: fullName,
                        email: email,
                        role: role,
                        status: status
                    }
                ]);

                if (profileInsertError) throw profileInsertError;

                alert('User added successfully! An email has been sent for confirmation.');
                await addAuditLog(userEmail, 'Added User', 'User Management', `Added new user: ${fullName}`);
            }

            await fetchProfiles(); // Re-fetch profiles to update the table
            if (userModal) {
                userModal.classList.add('hidden');
                userModal.style.display = 'none';
            }
            if (userForm) {
                userForm.reset();
            }
            console.log('User form submitted successfully.');
        } catch (error) {
            alert('Error saving user: ' + error.message);
            console.error('Supabase error saving user:', error);
            await addAuditLog(userEmail, 'User Save Failed', 'User Management', `Error: ${error.message}`);
        }
    });
}

window.deleteUser = async function(id) {
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    const userEmail = loggedInUser?.email || 'admin';
    if (confirm('Are you sure you want to delete this user? This will also delete their authentication record. This action cannot be undone.')) {
        console.log(`Deleting user ID: ${id}`);
        try {
            // Delete from profiles table first
            const { error: profileError } = await supabase.from('profiles').delete().eq('id', id);
            if (profileError) throw profileError;

            // Then delete from auth.users
            const { error: authError } = await supabase.auth.admin.deleteUser(id);
            if (authError) throw authError;

            const deletedProfile = profiles.find(p => p.id === id);
            await addAuditLog(userEmail, 'Deleted User', 'User Management', `Deleted user: ${deletedProfile?.full_name || 'Unknown'} (ID: ${id})`);
            alert('User deleted successfully!');
            await fetchProfiles(); // Re-fetch profiles to update the table
            console.log(`User ID ${id} deleted successfully.`);
        } catch (error) {
            alert('Error deleting user: ' + error.message);
            console.error('Supabase error deleting user:', error);
            await addAuditLog(userEmail, 'User Delete Failed', 'User Management', `Error: ${error.message}`);
        }
    }
}

window.showAddAnnouncementModal = function() {
    // const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser')); // Not used for modal display logic
    // const userRole = loggedInUser ? loggedInUser.user_metadata?.role || loggedInUser.app_metadata?.role : null;
    if (announcementModalTitle) {
        announcementModalTitle.textContent = 'Add New Announcement';
    }
    if (announcementFormSubmitBtn) {
        announcementFormSubmitBtn.textContent = 'Publish Announcement';
    }
    document.getElementById('announcementId').value = '';
    if (announcementForm) {
        announcementForm.reset();
    }
    if (announcementModal) {
        announcementModal.classList.remove('hidden');
        announcementModal.style.display = 'flex';
        console.log('Add Announcement modal opened.');
    }
}

window.editAnnouncement = function(id) {
    // const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser')); // Not used for modal display logic
    // const userRole = loggedInUser ? loggedInUser.user_metadata?.role || loggedInUser.app_metadata?.role : null;
    const announcement = announcements.find(a => a.id === id);
    if (announcement) {
        if (announcementModalTitle) {
            announcementModalTitle.textContent = 'Edit Announcement';
        }
        if (announcementFormSubmitBtn) {
            announcementFormSubmitBtn.textContent = 'Save Changes';
        }
        document.getElementById('announcementId').value = announcement.id;
        document.getElementById('announcementTitle').value = announcement.title;
        document.getElementById('announcementContent').value = announcement.content;
        document.getElementById('announcementStatus').value = announcement.status;
        if (announcementModal) {
            announcementModal.classList.remove('hidden');
            announcementModal.style.display = 'flex';
            console.log(`Edit Announcement modal opened for ID: ${id}`);
        }
    }
}

if (closeAnnouncementModal) {
    closeAnnouncementModal.addEventListener('click', () => {
        if (announcementModal) {
            announcementModal.classList.add('hidden');
            announcementModal.style.display = 'none';
        }
        if (announcementForm) announcementForm.reset();
        console.log('Announcement modal closed.');
    });
}

if (announcementModal) {
    announcementModal.addEventListener('click', (e) => {
        if (e.target === announcementModal) {
            announcementModal.classList.add('hidden');
            announcementModal.style.display = 'none';
            if (announcementForm) announcementForm.reset();
            console.log('Announcement modal closed by outside click.');
        }
    });
}

if (announcementForm) {
    announcementForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
        const userEmail = loggedInUser?.email || 'admin';

        const announcementId = document.getElementById('announcementId').value;
        const announcementData = {
            title: document.getElementById('announcementTitle').value,
            content: document.getElementById('announcementContent').value,
            status: document.getElementById('announcementStatus').value,
            date_posted: new Date().toISOString().split('T')[0] // Set current date
        };

        try {
            let response;
            if (announcementId) {
                // Update existing announcement
                response = await supabase.from('announcements').update(announcementData).eq('id', announcementId).select();
                alert('Announcement updated successfully!');
                await addAuditLog(userEmail, 'Updated Announcement', 'Announcements', `Updated announcement: "${announcementData.title}" (ID: ${announcementId})`);
            } else {
                // Add new announcement
                response = await supabase.from('announcements').insert([announcementData]).select();
                alert('Announcement published successfully!');
                await addAuditLog(userEmail, 'Published Announcement', 'Announcements', `Published new announcement: "${announcementData.title}"`);
            }

            if (response.error) throw response.error;

            await fetchAnnouncements(); // Re-fetch announcements to update the table
            if (announcementModal) {
                announcementModal.classList.add('hidden');
                announcementModal.style.display = 'none';
            }
            if (announcementForm) {
                announcementForm.reset();
            }
            console.log('Announcement form submitted successfully.');
        } catch (error) {
            alert('Error saving announcement: ' + error.message);
            console.error('Supabase error saving announcement:', error);
            await addAuditLog(userEmail, 'Announcement Save Failed', 'Announcements', `Error: ${error.message}`);
        }
    });
}

window.deleteAnnouncement = async function(id) {
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    const userEmail = loggedInUser?.email || 'admin';
    if (confirm('Are you sure you want to delete this announcement? This action cannot be undone.')) {
        console.log(`Deleting announcement ID: ${id}`);
        try {
            const { error } = await supabase.from('announcements').delete().eq('id', id);
            if (error) throw error;

            const deletedAnnouncement = announcements.find(a => a.id === id);
            await addAuditLog(userEmail, 'Deleted Announcement', 'Announcements', `Deleted announcement: "${deletedAnnouncement?.title || 'Unknown'}" (ID: ${id})`);
            alert('Announcement deleted successfully!');
            await fetchAnnouncements(); // Re-fetch announcements to update the table
            console.log(`Announcement ID ${id} deleted successfully.`);
        } catch (error) {
            alert('Error deleting announcement: ' + error.message);
            console.error('Supabase error deleting announcement:', error);
            await addAuditLog(userEmail, 'Announcement Delete Failed', 'Announcements', `Error: ${error.message}`);
        }
    }
}

window.showAddAttendanceModal = function() {
    // const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser')); // Not used for modal display logic
    // const userRole = loggedInUser ? loggedInUser.user_metadata?.role || loggedInUser.app_metadata?.role : null;
    if (attendanceModalTitle) {
        attendanceModalTitle.textContent = 'Mark Attendance';
    }
    if (attendanceFormSubmitBtn) {
        attendanceFormSubmitBtn.textContent = 'Mark Attendance';
    }
    document.getElementById('attendanceId').value = '';
    if (attendanceForm) {
        attendanceForm.reset();
    }
    populateStudentSelect();
    const attendanceDateInput = document.getElementById('attendanceDate');
    if (attendanceDateInput) {
        attendanceDateInput.valueAsDate = new Date();
    }
    if (attendanceModal) {
        attendanceModal.classList.remove('hidden');
        attendanceModal.style.display = 'flex';
        console.log('Add Attendance modal opened.');
    }
}

window.editAttendance = function(id) {
    // const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser')); // Not used for modal display logic
    // const userRole = loggedInUser ? loggedInUser.user_metadata?.role || loggedInUser.app_metadata?.role : null;
    const record = attendanceRecords.find(r => r.id === id);
    if (record) {
        if (attendanceModalTitle) {
            attendanceModalTitle.textContent = 'Edit Attendance';
        }
        if (attendanceFormSubmitBtn) {
            attendanceFormSubmitBtn.textContent = 'Save Changes';
        }
        document.getElementById('attendanceId').value = record.id;
        populateStudentSelect(record.student_id);
        document.getElementById('attendanceDate').value = record.date;
        document.getElementById('attendanceStatus').value = record.status;
        document.getElementById('arrivalTime').value = record.arrival_time || '';
        document.getElementById('departureTime').value = record.departure_time || '';
        document.getElementById('attendanceRemarks').value = record.remarks || '';
        if (attendanceModal) {
            attendanceModal.classList.remove('hidden');
            attendanceModal.style.display = 'flex';
            console.log(`Edit Attendance modal opened for ID: ${id}`);
        }
    }
}

if (closeAttendanceModal) {
    closeAttendanceModal.addEventListener('click', () => {
        if (attendanceModal) {
            attendanceModal.classList.add('hidden');
            attendanceModal.style.display = 'none';
        }
        if (attendanceForm) attendanceForm.reset();
        console.log('Attendance modal closed.');
    });
}

if (attendanceModal) {
    attendanceModal.addEventListener('click', (e) => {
        if (e.target === attendanceModal) {
            attendanceModal.classList.add('hidden');
            attendanceModal.style.display = 'none';
            if (attendanceForm) attendanceForm.reset();
            console.log('Attendance modal closed by outside click.');
        }
    });
}

if (attendanceForm) {
    attendanceForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
        const userEmail = loggedInUser?.email || 'admin';

        const attendanceId = document.getElementById('attendanceId').value;
        const attendanceData = {
            student_id: document.getElementById('attendanceStudentSelect').value,
            date: document.getElementById('attendanceDate').value,
            status: document.getElementById('attendanceStatus').value,
            arrival_time: document.getElementById('arrivalTime').value || null,
            departure_time: document.getElementById('departureTime').value || null,
            remarks: document.getElementById('attendanceRemarks').value || null
        };

        try {
            let response;
            if (attendanceId) {
                // Update existing attendance
                response = await supabase.from('attendance').update(attendanceData).eq('id', attendanceId).select();
                alert('Attendance updated successfully!');
                await addAuditLog(userEmail, 'Updated Attendance', 'Attendance', `Updated attendance for student ID: ${attendanceData.student_id} on ${attendanceData.date}`);
            } else {
                // Add new attendance
                response = await supabase.from('attendance').insert([attendanceData]).select();
                alert('Attendance marked successfully!');
                await addAuditLog(userEmail, 'Marked Attendance', 'Attendance', `Marked attendance for student ID: ${attendanceData.student_id} on ${attendanceData.date}`);
            }

            if (response.error) throw response.error;

            await fetchAttendanceRecords(); // Re-fetch attendance to update the table
            if (attendanceModal) {
                attendanceModal.classList.add('hidden');
                attendanceModal.style.display = 'none';
            }
            if (attendanceForm) {
                attendanceForm.reset();
            }
            console.log('Attendance form submitted successfully.');
        } catch (error) {
            alert('Error saving attendance: ' + error.message);
            console.error('Supabase error saving attendance:', error);
            await addAuditLog(userEmail, 'Attendance Save Failed', 'Attendance', `Error: ${error.message}`);
        }
    });
}

window.deleteAttendance = async function(id) {
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    const userEmail = loggedInUser?.email || 'admin';
    if (confirm('Are you sure you want to delete this attendance record? This action cannot be undone.')) {
        console.log(`Deleting attendance record ID: ${id}`);
        try {
            const { error } = await supabase.from('attendance').delete().eq('id', id);
            if (error) throw error;

            const deletedRecord = attendanceRecords.find(r => r.id === id);
            const student = deletedRecord?.students; // Access student details from the joined object
            await addAuditLog(userEmail, 'Deleted Attendance', 'Attendance', `Deleted attendance for ${student ? student.name : 'Unknown Student'} on ${deletedRecord?.date || 'N/A'}`);
            alert('Attendance record deleted successfully!');
            await fetchAttendanceRecords(); // Re-fetch attendance to update the table
            console.log(`Attendance record ID ${id} deleted successfully.`);
        } catch (error) {
            alert('Error deleting attendance record: ' + error.message);
            console.error('Supabase error deleting attendance record:', error);
            await addAuditLog(userEmail, 'Attendance Delete Failed', 'Attendance', `Error: ${error.message}`);
        }
    }
}

function populateStudentSelect(selectedStudentId = '') {
    if (!attendanceStudentSelect) return;
    attendanceStudentSelect.innerHTML = '<option value="">Select Student</option>';
    students.forEach(student => {
        const option = document.createElement('option');
        option.value = student.id;
        option.textContent = `${student.name} (Class: ${student.class}, Roll: ${student.roll_no})`;
        if (student.id === selectedStudentId) {
            option.selected = true;
        }
        attendanceStudentSelect.appendChild(option);
    });
    console.log('Student select populated.');
}

// QR Code Generation and Scanning for Students
window.showStudentQrCodeModal = function(studentId) {
    const student = students.find(s => s.id === studentId);
    if (!student) {
        alert('Student not found.');
        return;
    }

    const studentQrCodeModalTitle = document.getElementById('studentQrCodeModalTitle'); // Assuming this element exists
    if (studentQrCodeModalTitle) {
        studentQrCodeModalTitle.textContent = `QR Code for ${student.name}`;
    }
    if (qrCodeStudentIdDisplay) {
        qrCodeStudentIdDisplay.textContent = `Student ID: ${student.id}`;
    }

    // Generate QR code using QRious
    const qr = new QRious({
        element: studentQrCodeCanvas,
        value: `student_attendance:${student.id}`, // Prefix to identify QR type
        size: 200
    });

    // Set download link
    if (downloadQrCodeLink) {
        downloadQrCodeLink.href = studentQrCodeCanvas.toDataURL('image/png');
        downloadQrCodeLink.download = `student_${student.id}_qrcode.png`;
    }

    if (studentQrCodeModal) {
        studentQrCodeModal.classList.remove('hidden');
        studentQrCodeModal.style.display = 'flex';
        console.log(`Student QR code modal opened for student ID: ${studentId}`);
    }
};

if (closeStudentQrCodeModal) {
    closeStudentQrCodeModal.addEventListener('click', () => {
        if (studentQrCodeModal) {
            studentQrCodeModal.classList.add('hidden');
            studentQrCodeModal.style.display = 'none';
        }
        console.log('Student QR code modal closed.');
    });
}

if (studentQrCodeModal) {
    studentQrCodeModal.addEventListener('click', (e) => {
        if (e.target === studentQrCodeModal) {
            studentQrCodeModal.classList.add('hidden');
            studentQrCodeModal.style.display = 'none';
            console.log('Student QR code modal closed by outside click.');
        }
    });
}

window.printStudentQrCode = function() {
    console.log('Printing student QR code...');
    const printContents = studentQrCodeModal.innerHTML;
    const originalContents = document.body.innerHTML;

    const printWindow = window.open('', '_blank');
    printWindow.document.write('<html><head><title>Print Student QR Code</title>');
    document.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
        printWindow.document.write(`<link rel="stylesheet" href="${link.href}">`);
    });
    printWindow.document.write('<style>.print-hide { display: none !important; }</style>');
    printWindow.document.write('</head><body>');
    printWindow.document.write(printContents);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
    console.log('Student QR code print initiated.');
};

window.startQrAttendance = function() {
    if (!checkHtml5QrCodeAvailability()) return;

    if (qrScannerSection) {
        qrScannerSection.classList.remove('hidden');
    }
    if (qrVideo) {
        qrVideo.innerHTML = ''; // Clear previous content
    }
    if (qrScanFeedback) {
        qrScanFeedback.innerHTML = ''; // Clear previous feedback
        qrScanFeedback.classList.remove('text-green-600', 'text-red-600');
    }


    html5QrCodeScanner = new Html5QrcodeScanner(
        "qrVideo",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        /* verbose= */ false
    );

    html5QrCodeScanner.render(onScanSuccessStudent, onScanErrorStudent);
    console.log('Student QR attendance scanner started.');
};

window.stopQrAttendance = async function() {
    if (html5QrCodeScanner && html5QrCodeScanner.isScanning) {
        try {
            await html5QrCodeScanner.stop();
            console.log('Student QR attendance scanner stopped.');
        } catch (err) {
            console.error('Error stopping student QR scanner:', err);
        } finally {
            if (qrScannerSection) {
                qrScannerSection.classList.add('hidden');
            }
            if (qrVideo) {
                qrVideo.innerHTML = '';
            }
            if (qrScanFeedback) {
                qrScanFeedback.innerHTML = '';
                qrScanFeedback.classList.remove('text-green-600', 'text-red-600');
            }
            html5QrCodeScanner = null; // Clear the instance
        }
    }
};

// Function to play a beep sound
function playBeep() {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.type = 'sine';
    oscillator.frequency.value = 440; // A4 note
    gainNode.gain.value = 0.1; // Volume

    oscillator.start();
    setTimeout(() => {
        oscillator.stop();
        audioCtx.close();
    }, 100); // Beep duration in milliseconds
}

async function onScanSuccessStudent(decodedText, decodedResult) {
    console.log(`QR Code scanned: ${decodedText}`);
    playBeep(); // Play beep sound on successful scan

    if (qrScanFeedback) {
        qrScanFeedback.classList.remove('text-green-600', 'text-red-600'); // Reset color
        qrScanFeedback.textContent = 'Processing...'; // Initial feedback
    }

    if (decodedText.startsWith('student_attendance:')) {
        const studentId = decodedText.split(':')[1];
        const student = students.find(s => s.id === studentId);
        if (student) {
            const today = new Date().toISOString().split('T')[0];
            const currentTime = new Date().toTimeString().split(' ')[0];
            const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
            const userEmail = loggedInUser?.email || 'QR Scanner';

            try {
                // Check if an attendance record already exists for today
                const { data: existingRecords, error: fetchError } = await supabase
                    .from('attendance')
                    .select('*')
                    .eq('student_id', studentId)
                    .eq('attendance_date', today)


                if (fetchError) throw fetchError;

                if (existingRecords && existingRecords.length > 0) {
                    const existingRecord = existingRecords[0];
                    if (existingRecord.status === 'Present') {
                        if (qrScanFeedback) {
                            qrScanFeedback.textContent = `${student.name} (Roll No: ${student.roll_no}) - Already Marked Present`;
                            qrScanFeedback.classList.add('text-red-600');
                        }
                        console.log(`Attendance already marked for ${student.name} today.`);
                        await addAuditLog(userEmail, 'QR Attendance Duplicate', 'Attendance', `Duplicate QR scan for ${student.name} (ID: ${studentId})`);
                    } else {
                        // Update status to Present and set arrival time if not already set
                        const updateData = { status: 'Present' };
                        if (!existingRecord.arrival_time) {
                            updateData.arrival_time = currentTime;
                        }
                        const { error: updateError } = await supabase.from('attendance').update(updateData).eq('id', existingRecord.id);
                        if (updateError) throw updateError;
                        if (qrScanFeedback) {
                            qrScanFeedback.textContent = `${student.name} (Roll No: ${student.roll_no}) - Marked Present`;
                            qrScanFeedback.classList.add('text-green-600');
                        }
                        console.log(`Attendance updated for ${student.name}: Marked Present.`);
                        await addAuditLog(userEmail, 'QR Attendance Updated', 'Attendance', `Updated attendance for ${student.name} (ID: ${studentId}) to Present`);
                    }
                } else {
                    // Create new attendance record
                    const { error: insertError } = await supabase.from('attendance').insert([
                        {
                            student_id: studentId,
                            date: today,
                            status: 'Present',
                            arrival_time: currentTime,
                            remarks: 'QR Scan'
                        }
                    ]);
                    if (insertError) throw insertError;
                    if (qrScanFeedback) {
                        qrScanFeedback.textContent = `${student.name} (Roll No: ${student.roll_no}) - Marked Present`;
                        qrScanFeedback.classList.add('text-green-600');
                    }
                    console.log(`Attendance marked for ${student.name}: Present.`);
                    await addAuditLog(userEmail, 'QR Attendance Marked', 'Attendance', `Marked Present for ${student.name} (ID: ${studentId}) via QR scan`);
                }
                await fetchAttendanceRecords(); // Refresh attendance data
            } catch (error) {
                if (qrScanFeedback) {
                    qrScanFeedback.textContent = `Error for ${student.name}: ${error.message}`;
                    qrScanFeedback.classList.add('text-red-600');
                }
                console.error('Supabase error marking attendance via QR:', error);
                await addAuditLog(userEmail, 'QR Attendance Failed', 'Attendance', `Error marking attendance for ${student.name} (ID: ${studentId}): ${error.message}`);
            }
        } else {
            if (qrScanFeedback) {
                qrScanFeedback.textContent = `Student not found for this QR code: ${studentId}`;
                qrScanFeedback.classList.add('text-red-600');
            }
            console.warn(`Student not found for QR code: ${studentId}`);
            await addAuditLog('QR Scanner', 'QR Scan Failed', 'Attendance', `Student not found for QR code: ${studentId}`);
        }
    } else {
        if (qrScanFeedback) {
            qrScanFeedback.textContent = `Invalid QR code format: ${decodedText}`;
            qrScanFeedback.classList.add('text-red-600');
        }
        console.warn(`Invalid QR code format: ${decodedText}`);
        await addAuditLog('QR Scanner', 'QR Scan Failed', 'Attendance', `Invalid QR code format: ${decodedText}`);
    }
    // Optionally stop scanner after successful scan
    // await stopQrAttendance(); // Keep scanner running for continuous scanning
}

function onScanErrorStudent(errorMessage) {
    // console.warn(`QR Code scan error: ${errorMessage}`); // Too verbose for console
    // No feedback for errors to keep it clean, only for successful scans or critical errors
}

// QR Code Generation and Scanning for Teachers
window.showTeacherQrCodeModal = function(teacherId) {
    const teacher = teachers.find(t => t.id === teacherId);
    if (!teacher) {
        alert('Teacher not found.');
        return;
    }

    const teacherQrCodeModalTitle = document.getElementById('teacherQrCodeModalTitle'); // Assuming this element exists
    if (teacherQrCodeModalTitle) {
        teacherQrCodeModalTitle.textContent = `QR Code for ${teacher.name}`;
    }
    if (qrCodeTeacherIdDisplay) {
        qrCodeTeacherIdDisplay.textContent = `Teacher ID: ${teacher.id}`;
    }

    // Generate QR code using QRious
    const qr = new QRious({
        element: teacherQrCodeCanvas,
        value: `teacher_attendance:${teacher.id}`, // Prefix to identify QR type
        size: 200
    });

    // Set download link
    if (downloadTeacherQrCodeLink) {
        downloadTeacherQrCodeLink.href = teacherQrCodeCanvas.toDataURL('image/png');
        downloadTeacherQrCodeLink.download = `teacher_${teacher.id}_qrcode.png`;
    }

    if (teacherQrCodeModal) {
        teacherQrCodeModal.classList.remove('hidden');
        teacherQrCodeModal.style.display = 'flex';
        console.log(`Teacher QR code modal opened for teacher ID: ${teacherId}`);
    }
};

if (closeTeacherQrCodeModal) {
    closeTeacherQrCodeModal.addEventListener('click', () => {
        if (teacherQrCodeModal) {
            teacherQrCodeModal.classList.add('hidden');
            teacherQrCodeModal.style.display = 'none';
        }
        console.log('Teacher QR code modal closed.');
    });
}

if (teacherQrCodeModal) {
    teacherQrCodeModal.addEventListener('click', (e) => {
        if (e.target === teacherQrCodeModal) {
            teacherQrCodeModal.classList.add('hidden');
            teacherQrCodeModal.style.display = 'none';
            console.log('Teacher QR code modal closed by outside click.');
        }
    });
}

window.printTeacherQrCode = function() {
    console.log('Printing teacher QR code...');
    const printContents = teacherQrCodeModal.innerHTML;
    const originalContents = document.body.innerHTML;

    const printWindow = window.open('', '_blank');
    printWindow.document.write('<html><head><title>Print Teacher QR Code</title>');
    document.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
        printWindow.document.write(`<link rel="stylesheet" href="${link.href}">`);
    });
    printWindow.document.write('<style>.print-hide { display: none !important; }</style>');
    printWindow.document.write('</head><body>');
    printWindow.document.write(printContents);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
    console.log('Teacher QR code print initiated.');
};

window.startTeacherQrAttendance = function(type) {
    if (!checkHtml5QrCodeAvailability()) return;

    if (teacherQrScannerSection) {
        teacherQrScannerSection.classList.remove('hidden');
    }
    if (teacherQrVideo) {
        teacherQrVideo.innerHTML = ''; // Clear previous content
    }
    if (teacherQrScannerTitle) {
        teacherQrScannerTitle.textContent = `Scan QR Code for Teacher ${type.charAt(0).toUpperCase() + type.slice(1)} Attendance`;
    }
    if (qrScanFeedbackTeacher) {
        qrScanFeedbackTeacher.innerHTML = ''; // Clear previous feedback
        qrScanFeedbackTeacher.classList.remove('text-green-600', 'text-red-600');
    }

    html5QrCodeScannerTeacher = new Html5QrcodeScanner(
        "teacherQrVideo",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        /* verbose= */ false
    );

    html5QrCodeScannerTeacher.render((decodedText, decodedResult) => onScanSuccessTeacher(decodedText, decodedResult, type), onScanErrorTeacher);
    console.log(`Teacher QR attendance scanner started for ${type}.`);
};

window.stopTeacherQrAttendance = async function() {
    if (html5QrCodeScannerTeacher && html5QrCodeScannerTeacher.isScanning) {
        try {
            await html5QrCodeScannerTeacher.stop();
            console.log('Teacher QR attendance scanner stopped.');
        } catch (err) {
            console.error('Error stopping teacher QR scanner:', err);
        } finally {
            if (teacherQrScannerSection) {
                teacherQrScannerSection.classList.add('hidden');
            }
            if (teacherQrVideo) {
                teacherQrVideo.innerHTML = '';
            }
            if (qrScanFeedbackTeacher) {
                qrScanFeedbackTeacher.innerHTML = '';
                qrScanFeedbackTeacher.classList.remove('text-green-600', 'text-red-600');
            }
            html5QrCodeScannerTeacher = null; // Clear the instance
        }
    }
};

async function onScanSuccessTeacher(decodedText, decodedResult, type) {
    console.log(`Teacher QR Code scanned: ${decodedText} for ${type}`);
    playBeep(); // Play beep sound on successful scan

    if (qrScanFeedbackTeacher) {
        qrScanFeedbackTeacher.classList.remove('text-green-600', 'text-red-600'); // Reset color
        qrScanFeedbackTeacher.textContent = 'Processing...'; // Initial feedback
    }

    if (decodedText.startsWith('teacher_attendance:')) {
        const teacherId = decodedText.split(':')[1];
        const teacher = teachers.find(t => t.id === teacherId);
        if (teacher) {
            const today = new Date().toISOString().split('T')[0];
            const currentTime = new Date().toTimeString().split(' ')[0];
            const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
            const userEmail = loggedInUser?.email || 'QR Scanner';

            try {
                // Check if an attendance record already exists for today
                const { data: existingRecords, error: fetchError } = await supabase
                    .from('teacher_attendance')
                    .select('*')
                    .eq('teacher_id', teacherId)
                    .eq('date', today);

                if (fetchError) throw fetchError;

                if (existingRecords && existingRecords.length > 0) {
                    const existingRecord = existingRecords[0];
                    if (type === 'arrival') {
                        if (existingRecord.arrival_time) {
                            if (qrScanFeedbackTeacher) {
                                qrScanFeedbackTeacher.textContent = `${teacher.name} (Subject: ${teacher.subject}) - Arrival Already Marked`;
                                qrScanFeedbackTeacher.classList.add('text-red-600');
                            }
                            console.log(`Arrival already marked for ${teacher.name} today.`);
                            await addAuditLog(userEmail, 'Teacher QR Attendance Duplicate Arrival', 'Teacher Attendance', `Duplicate QR scan for ${teacher.name} (ID: ${teacherId}) - Arrival`);
                        } else {
                            const { error: updateError } = await supabase.from('teacher_attendance').update({ arrival_time: currentTime, status: 'Present' }).eq('id', existingRecord.id);
                            if (updateError) throw updateError;
                            if (qrScanFeedbackTeacher) {
                                qrScanFeedbackTeacher.textContent = `${teacher.name} (Subject: ${teacher.subject}) - Arrival Marked`;
                                qrScanFeedbackTeacher.classList.add('text-green-600');
                            }
                            console.log(`Arrival marked for ${teacher.name}.`);

                           // Speak welcome/goodbye message
                            const welcomeMessage = type === 'arrival'
                            ? `Welcome to TPS, ${teacher.name}`
                            : `Goodbye from TPS, ${teacher.name}`;
                            window.speechSynthesis.cancel();
                            const utterance = new SpeechSynthesisUtterance(welcomeMessage);
                            utterance.lang = 'en-US';
                            utterance.pitch = 1;
                            utterance.rate = 1;
                            window.speechSynthesis.speak(utterance);


                            await addAuditLog(userEmail, 'Teacher QR Attendance Arrival', 'Teacher Attendance', `Marked Arrival for ${teacher.name} (ID: ${teacherId}) via QR scan`);
                        }
                    } else if (type === 'departure') {
                        if (existingRecord.departure_time) {
                            if (qrScanFeedbackTeacher) {
                                qrScanFeedbackTeacher.textContent = `${teacher.name} (Subject: ${teacher.subject}) - Departure Already Marked`;
                                qrScanFeedbackTeacher.classList.add('text-red-600');
                            }
                            console.log(`Departure already marked for ${teacher.name} today.`);
                            await addAuditLog(userEmail, 'Teacher QR Attendance Duplicate Departure', 'Teacher Attendance', `Duplicate QR scan for ${teacher.name} (ID: ${teacherId}) - Departure`);
                        } else {
                            const { error: updateError } = await supabase.from('teacher_attendance').update({ departure_time: currentTime }).eq('id', existingRecord.id);
                            if (updateError) throw updateError;
                            if (qrScanFeedbackTeacher) {
                                qrScanFeedbackTeacher.textContent = `${teacher.name} (Subject: ${teacher.subject}) - Departure Marked`;
                                qrScanFeedbackTeacher.classList.add('text-green-600');
                            }
                            console.log(`Departure marked for ${teacher.name}.`);

                            // Speak welcome/goodbye message
                            const welcomeMessage = type === 'arrival'
                                ? `Welcome to TPS, ${teacher.name}`
                                : `Goodbye from TPS, ${teacher.name}`;
                            window.speechSynthesis.cancel();
                            const utterance = new SpeechSynthesisUtterance(welcomeMessage);
                            utterance.lang = 'en-US';
                            utterance.pitch = 1;
                            utterance.rate = 1;
                            window.speechSynthesis.speak(utterance);


                            await addAuditLog(userEmail, 'Teacher QR Attendance Departure', 'Teacher Attendance', `Marked Departure for ${teacher.name} (ID: ${teacherId}) via QR scan`);
                        }
                    }
                } else {
                    // Create new attendance record for arrival
                    if (type === 'arrival') {
                        const { error: insertError } = await supabase.from('teacher_attendance').insert([
                            {
                                teacher_id: teacherId,
                                date: today,
                                status: 'Present',
                                arrival_time: currentTime,
                                remarks: 'QR Scan'
                            }
                        ]);
                        if (insertError) throw insertError;
                        if (qrScanFeedbackTeacher) {
                            qrScanFeedbackTeacher.textContent = `${teacher.name} (Subject: ${teacher.subject}) - Arrival Marked`;
                            qrScanFeedbackTeacher.classList.add('text-green-600');
                        }
                        console.log(`Arrival marked for ${teacher.name}.`);

                        // Speak welcome/goodbye message
                            const welcomeMessage = type === 'arrival'
                                ? `Welcome to TPS, ${teacher.name}`
                                : `Goodbye from TPS, ${teacher.name}`;
                            window.speechSynthesis.cancel();
                            const utterance = new SpeechSynthesisUtterance(welcomeMessage);
                            utterance.lang = 'en-US';
                            utterance.pitch = 1;
                            utterance.rate = 1;
                            window.speechSynthesis.speak(utterance);


                        await addAuditLog(userEmail, 'Teacher QR Attendance Marked', 'Teacher Attendance', `Marked Arrival for ${teacher.name} (ID: ${teacherId}) via QR scan`);
                    } else {
                        if (qrScanFeedbackTeacher) {
                            qrScanFeedbackTeacher.textContent = `${teacher.name} (Subject: ${teacher.subject}) - Please mark arrival first.`;
                            qrScanFeedbackTeacher.classList.add('text-red-600');
                        }
                        console.warn(`Attempted to mark departure before arrival for ${teacher.name}.`);
                        await addAuditLog(userEmail, 'Teacher QR Scan Error', 'Teacher Attendance', `Attempted to mark departure before arrival for ${teacher.name} (ID: ${teacherId})`);
                    }
                }
                await fetchTeacherAttendanceRecords(); // Refresh attendance data
            } catch (error) {
                if (qrScanFeedbackTeacher) {
                    qrScanFeedbackTeacher.textContent = `Error for ${teacher.name}: ${error.message}`;
                    qrScanFeedbackTeacher.classList.add('text-red-600');
                }
                console.error('Supabase error marking teacher attendance via QR:', error);
                await addAuditLog(userEmail, 'Teacher QR Attendance Failed', 'Teacher Attendance', `Error marking attendance for ${teacher.name} (ID: ${teacherId}): ${error.message}`);
            }
        } else {
            if (qrScanFeedbackTeacher) {
                qrScanFeedbackTeacher.textContent = `Teacher not found for this QR code: ${teacherId}`;
                qrScanFeedbackTeacher.classList.add('text-red-600');
            }
            console.warn(`Teacher not found for QR code: ${teacherId}`);
            await addAuditLog('QR Scanner', 'QR Scan Failed', 'Teacher Attendance', `Teacher not found for QR code: ${teacherId}`);
        }
    } else {
        if (qrScanFeedbackTeacher) {
            qrScanFeedbackTeacher.textContent = `Invalid QR code format: ${decodedText}`;
            qrScanFeedbackTeacher.classList.add('text-red-600');
        }
        console.warn(`Invalid QR code format: ${decodedText}`);
        await addAuditLog('QR Scanner', 'QR Scan Failed', 'Teacher Attendance', `Invalid QR code format: ${decodedText}`);
    }
}


    // Optionally stop scanner after successful scan
    // await stopTeacherQrAttendance(); // Keep scanner running for continuous scanning

function onScanErrorTeacher(errorMessage) {
    // console.warn(`Teacher QR Code scan error: ${errorMessage}`); // Too verbose for console
    // No feedback for errors to keep it clean, only for successful scans or critical errors
}

// --- START NEW CODE INSERTION ---

// This is a highly simplified and INSECURE conceptual example.
// DO NOT USE IN PRODUCTION. It lacks crucial security, privacy, and error handling.

// Function to start face recognition for attendance
async function startTeacherFaceRecognition() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert('Your browser does not support camera access.');
        console.error('getUserMedia not supported in this browser.');
        return;
    }

    const videoElement = document.getElementById('teacherFaceRecognitionVideo'); // Assume you have a <video id="teacherFaceRecognitionVideo"></video>
    const feedbackElement = document.getElementById('teacherFaceRecognitionFeedback'); // Assume a feedback element

    if (!videoElement || !feedbackElement) {
        console.error('Video or feedback element not found for face recognition.');
        return;
    }

    feedbackElement.textContent = 'Loading face recognition models...';

    try {
        // Load face-api.js models (conceptual, requires actual library setup)
        // await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
        // await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
        // await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
        // await faceapi.nets.faceExpressionNet.loadFromUri('/models'); // Example model

        feedbackElement.textContent = 'Models loaded. Starting camera...';

        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoElement.srcObject = stream;
        videoElement.play();

        videoElement.addEventListener('play', () => {
            feedbackElement.textContent = 'Camera started. Looking for faces...';
            const displaySize = { width: videoElement.width, height: videoElement.height };
            // faceapi.matchDimensions(canvas, displaySize); // Conceptual canvas for drawing

            setInterval(async () => {
                // Conceptual: Detect faces and extract descriptors
                // const detections = await faceapi.detectAllFaces(videoElement, new faceapi.TinyFaceDetectorOptions())
                //     .withFaceLandmarks()
                //     .withFaceDescriptors();

                // if (detections.length > 0) {
                //     feedbackElement.textContent = 'Face detected! Attempting to recognize...';
                //     // In a real system, send 'detections[0].descriptor' to a secure backend
                //     // for comparison against stored teacher face templates.
                //     // For this example, we'll just simulate success.

                //     const simulatedTeacherId = 'some-teacher-uuid-from-db'; // Replace with actual recognized ID
                //     const teacher = teachers.find(t => t.id === simulatedTeacherId);

                //     if (teacher) {
                //         feedbackElement.textContent = `Recognized: ${teacher.name}. Marking attendance...`;
                //         // Call your existing attendance marking function
                //         // await markTeacherAttendance(teacher.id, 'Present', 'Face Recognition');
                //         // stopTeacherFaceRecognition(); // Stop after successful recognition
                //     } else {
                //         feedbackElement.textContent = 'Face recognized, but teacher not found in system.';
                //     }
                // } else {
                //     feedbackElement.textContent = 'No face detected.';
                // }
            }, 1000); // Check every second
        });

    } catch (err) {
        console.error('Error accessing camera or loading models:', err);
        feedbackElement.textContent = `Error: ${err.message}. Please ensure camera is available and permissions are granted.`;
        alert(`Error starting face recognition: ${err.message}`);
    }
}

// Function to stop face recognition
function stopTeacherFaceRecognition() {
    const videoElement = document.getElementById('teacherFaceRecognitionVideo');
    if (videoElement && videoElement.srcObject) {
        videoElement.srcObject.getTracks().forEach(track => track.stop());
        videoElement.srcObject = null;
    }
    const feedbackElement = document.getElementById('teacherFaceRecognitionFeedback');
    if (feedbackElement) {
        feedbackElement.textContent = '';
    }
    console.log('Face recognition stopped.');
}

// --- END NEW CODE INSERTION ---


// Exams Module Functions
function renderExams() {
    if (!examTableBody) return;
    examTableBody.innerHTML = '';
    if (exams.length === 0) {
        examTableBody.innerHTML = '<tr><td colspan="6" class="text-center py-4 text-gray-500">No exams found.</td></tr>';
        return;
    }
    // const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser')); // Not used for rendering
    // const userRole = loggedInUser ? loggedInUser.user_metadata?.role || loggedInUser.app_metadata?.role : null;

    exams.forEach(exam => {
        const newRow = document.createElement('tr');
        newRow.className = 'border-b hover:bg-gray-50';
        newRow.innerHTML = `
            <td class="py-3 px-4">${exam.name}</td>
            <td class="py-3 px-4">${exam.class}</td>
            <td class="py-3 px-4">${exam.subject}</td>
            <td class="py-3 px-4">${exam.date}</td>
            <td class="py-3 px-4">${exam.max_marks}</td>
            <td class="py-3 px-4 table-actions">
                <button class="text-blue-600 mr-3" title="Edit Exam" onclick="editExam('${exam.id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="text-red-600" title="Delete Exam" onclick="deleteExam('${exam.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        examTableBody.appendChild(newRow);
    });
    console.log('Exams table rendered.');
}

window.showAddExamModal = function() {
    // const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser')); // Not used for modal display logic
    // const userRole = loggedInUser ? loggedInUser.user_metadata?.role || loggedInUser.app_metadata?.role : null;
    if (examModalTitle) {
        examModalTitle.textContent = 'Add New Exam';
    }
    if (examFormSubmitBtn) {
        examFormSubmitBtn.textContent = 'Save Exam';
    }
    document.getElementById('examId').value = '';
    if (examForm) {
        examForm.reset();
    }
    if (examModal) {
        examModal.classList.remove('hidden');
        examModal.style.display = 'flex';
        console.log('Add Exam modal opened.');
    }
}

window.editExam = function(id) {
    // const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser')); // Not used for modal display logic
    // const userRole = loggedInUser ? loggedInUser.user_metadata?.role || loggedInUser.app_metadata?.role : null;
    const exam = exams.find(e => e.id === id);
    if (exam) {
        if (examModalTitle) {
            examModalTitle.textContent = 'Edit Exam';
        }
        if (examFormSubmitBtn) {
            examFormSubmitBtn.textContent = 'Save Changes';
        }
        document.getElementById('examId').value = exam.id;
        document.getElementById('examName').value = exam.name;
        document.getElementById('examClass').value = exam.class;
        document.getElementById('examSubject').value = exam.subject;
        document.getElementById('examDate').value = exam.date;
        document.getElementById('examMaxMarks').value = exam.max_marks;
        if (examModal) {
            examModal.classList.remove('hidden');
            examModal.style.display = 'flex';
            console.log(`Edit Exam modal opened for ID: ${id}`);
        }
    }
}

if (closeExamModal) {
    closeExamModal.addEventListener('click', () => {
        if (examModal) {
            examModal.classList.add('hidden');
            examModal.style.display = 'none';
        }
        if (examForm) examForm.reset();
        console.log('Exam modal closed.');
    });
}

if (examModal) {
    examModal.addEventListener('click', (e) => {
        if (e.target === examModal) {
            examModal.classList.add('hidden');
            examModal.style.display = 'none';
            if (examForm) examForm.reset();
            console.log('Exam modal closed by outside click.');
        }
    });
}

if (examForm) {
    examForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
        const userEmail = loggedInUser?.email || 'admin';

        const examId = document.getElementById('examId').value;
        const examData = {
            name: document.getElementById('examName').value,
            class: document.getElementById('examClass').value,
            subject: document.getElementById('examSubject').value,
            date: document.getElementById('examDate').value,
            max_marks: parseInt(document.getElementById('examMaxMarks').value)
        };

        try {
            let response;
            if (examId) {
                // Update existing exam
                response = await supabase.from('exams').update(examData).eq('id', examId).select();
                alert('Exam updated successfully!');
                await addAuditLog(userEmail, 'Updated Exam', 'Exams', `Updated exam: ${examData.name} (ID: ${examId})`);
            } else {
                // Add new exam
                response = await supabase.from('exams').insert([examData]).select();
                alert('Exam added successfully!');
                await addAuditLog(userEmail, 'Added Exam', 'Exams', `Added new exam: ${examData.name}`);
            }

            if (response.error) throw response.error;

            await fetchExams(); // Re-fetch exams to update the table
            if (examModal) {
                examModal.classList.add('hidden');
                examModal.style.display = 'none';
            }
            if (examForm) {
                examForm.reset();
            }
            console.log('Exam form submitted successfully.');
        } catch (error) {
            alert('Error saving exam: ' + error.message);
            console.error('Supabase error saving exam:', error);
            await addAuditLog(userEmail, 'Exam Save Failed', 'Exams', `Error: ${error.message}`);
        }
    });
}

window.deleteExam = async function(id) {
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    const userEmail = loggedInUser?.email || 'admin';
    if (confirm('Are you sure you want to delete this exam? This action cannot be undone.')) {
        console.log(`Deleting exam ID: ${id}`);
        try {
            const { error } = await supabase.from('exams').delete().eq('id', id);
            if (error) throw error;

            const deletedExam = exams.find(e => e.id === id);
            await addAuditLog(userEmail, 'Deleted Exam', 'Exams', `Deleted exam: ${deletedExam?.name || 'Unknown'} (ID: ${id})`);
            alert('Exam deleted successfully!');
            await fetchExams(); // Re-fetch exams to update the table
            console.log(`Exam ID ${id} deleted successfully.`);
        } catch (error) {
            alert('Error deleting exam: ' + error.message);
            console.error('Supabase error deleting exam:', error);
            await addAuditLog(userEmail, 'Exam Delete Failed', 'Exams', `Error: ${error.message}`);
        }
    }
}

// Generate Exam Results Modal
window.showGenerateResultsModal = function() {
    if (generateResultsModal) {
        generateResultsModal.classList.remove('hidden');
        generateResultsModal.style.display = 'flex';
    }
    if (generateResultsForm) {
        generateResultsForm.reset();
    }
    console.log('Generate Exam Results modal opened.');
}

if (closeGenerateResultsModal) {
    closeGenerateResultsModal.addEventListener('click', () => {
        if (generateResultsModal) {
            generateResultsModal.classList.add('hidden');
            generateResultsModal.style.display = 'none';
        }
        if (generateResultsForm) generateResultsForm.reset();
        console.log('Generate Exam Results modal closed.');
    });
}

if (generateResultsModal) {
    generateResultsModal.addEventListener('click', (e) => {
        if (e.target === generateResultsModal) {
            generateResultsModal.classList.add('hidden');
            generateResultsModal.style.display = 'none';
            if (generateResultsForm) generateResultsForm.reset();
            console.log('Generate Exam Results modal closed by outside click.');
        }
    });
}

if (generateResultsForm) {
    generateResultsForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const selectedClass = resultsClassFilter ? resultsClassFilter.value : '';
        const examType = resultsExamTypeFilter ? resultsExamTypeFilter.value : '';

        if (!selectedClass || !examType) {
            alert('Please select both Class and Exam Type.');
            return;
        }

        alert(`Generating PDF report for ${examType} exams in ${selectedClass}... (Functionality to be implemented)`);
        console.log(`Generating PDF report for ${examType} exams in ${selectedClass}...`);

        // Here you would typically fetch exam results data from your database
        // based on selectedClass and examType, then use jspdf to generate the PDF.
        // For demonstration, we'll just simulate.

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        doc.setFontSize(18);
        doc.text(`Exam Results Report - ${examType}`, 14, 22);
        doc.setFontSize(12);
        doc.text(`Class: ${selectedClass}`, 14, 30);
        doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 38);

        const tableColumn = ["Student Name", "Roll No.", "Subject", "Marks Obtained", "Max Marks", "Grade"];
        const tableRows = [];

        // Simulate fetching results
        const simulatedResults = students.filter(s => s.class === selectedClass).map(student => {
            const studentExams = exams.filter(e => e.class === selectedClass && e.name.includes(examType));
            return studentExams.map(exam => {
                const marksObtained = Math.floor(Math.random() * (exam.max_marks + 1)); // Random marks
                let grade = 'F';
                if (marksObtained >= exam.max_marks * 0.9) grade = 'A+';
                else if (marksObtained >= exam.max_marks * 0.8) grade = 'A';
                else if (marksObtained >= exam.max_marks * 0.7) grade = 'B';
                else if (marksObtained >= exam.max_marks * 0.6) grade = 'C';
                else if (marksObtained >= exam.max_marks * 0.5) grade = 'D';

                return [student.name, student.roll_no, exam.subject, marksObtained, exam.max_marks, grade];
            });
        }).flat();

        tableRows.push(...simulatedResults);

        doc.autoTable(tableColumn, tableRows, { startY: 45 });
        doc.save(`Exam_Results_${selectedClass}_${examType}.pdf`);

        const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
        await addAuditLog(loggedInUser?.email || 'admin', 'Generated Exam Report', 'Exams', `Generated PDF report for ${examType} exams in ${selectedClass}`);

        if (generateResultsModal) {
            generateResultsModal.classList.add('hidden');
            generateResultsModal.style.display = 'none';
        }
        if (generateResultsForm) {
            generateResultsForm.reset();
        }
    });
}

// Homework Module Functions
function renderHomeworkTable(filteredHomework = homeworkAssignments) {
    if (!homeworkTableBody) return;
    homeworkTableBody.innerHTML = '';
    if (filteredHomework.length === 0) {
        homeworkTableBody.innerHTML = '<tr><td colspan="7" class="text-center py-4 text-gray-500">No homework assignments found.</td></tr>';
        return;
    }
    // const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser')); // Not used for rendering
    // const userRole = loggedInUser ? loggedInUser.user_metadata?.role || loggedInUser.app_metadata?.role : null;

    filteredHomework.forEach(assignment => {
        const newRow = document.createElement('tr');
        newRow.className = 'border-b hover:bg-gray-50';
        newRow.innerHTML = `
            <td class="py-3 px-4">${assignment.id}</td>
            <td class="py-3 px-4">${assignment.title}</td>
            <td class="py-3 px-4">${assignment.class}</td>
            <td class="py-3 px-4">${assignment.subject}</td>
            <td class="py-3 px-4">${assignment.assigned_date}</td>
            <td class="py-3 px-4">${assignment.due_date}</td>
            <td class="py-3 px-4 table-actions">
                <button class="text-blue-600 mr-3" title="Edit Homework" onclick="editHomework('${assignment.id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="text-red-600 mr-3" title="Delete Homework" onclick="deleteHomework('${assignment.id}')">
                    <i class="fas fa-trash"></i>
                </button>
                <button class="text-green-600" title="View Details" onclick="showHomeworkDetailsModal('${assignment.id}')">
                    <i class="fas fa-info-circle"></i>
                </button>
            </td>
        `;
        homeworkTableBody.appendChild(newRow);
    });
    console.log('Homework table rendered.');
}

window.showAddHomeworkModal = function() {
    // const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser')); // Not used for modal display logic
    // const userRole = loggedInUser ? loggedInUser.user_metadata?.role || loggedInUser.app_metadata?.role : null;
    if (homeworkModalTitle) {
        homeworkModalTitle.textContent = 'Add New Homework';
    }
    if (homeworkFormSubmitBtn) {
        homeworkFormSubmitBtn.textContent = 'Add Homework';
    }
    document.getElementById('homeworkId').value = '';
    if (homeworkForm) {
        homeworkForm.reset();
        // Set assigned date to today by default
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('homeworkAssignedDate').value = today;
    }
    if (addHomeworkModal) {
        addHomeworkModal.classList.remove('hidden');
        addHomeworkModal.style.display = 'flex';
        console.log('Add Homework modal opened.');
    }
}

window.editHomework = function(id) {
    // const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser')); // Not used for modal display logic
    // const userRole = loggedInUser ? loggedInUser.user_metadata?.role || loggedInUser.app_metadata?.role : null;
    const assignment = homeworkAssignments.find(a => a.id === id);
    if (assignment) {
        if (homeworkModalTitle) {
            homeworkModalTitle.textContent = 'Edit Homework';
        }
        if (homeworkFormSubmitBtn) {
            homeworkFormSubmitBtn.textContent = 'Save Changes';
        }
        document.getElementById('homeworkId').value = assignment.id;
        document.getElementById('homeworkTitle').value = assignment.title;
        document.getElementById('homeworkClass').value = assignment.class;
        document.getElementById('homeworkSubject').value = assignment.subject;
        document.getElementById('homeworkAssignedDate').value = assignment.assigned_date;
        document.getElementById('homeworkDueDate').value = assignment.due_date;
        document.getElementById('homeworkDescription').value = assignment.description || '';
        if (addHomeworkModal) {
            addHomeworkModal.classList.remove('hidden');
            addHomeworkModal.style.display = 'flex';
            console.log(`Edit Homework modal opened for ID: ${id}`);
        }
    }
}

if (closeAddHomeworkModal) {
    closeAddHomeworkModal.addEventListener('click', () => {
        if (addHomeworkModal) {
            addHomeworkModal.classList.add('hidden');
            addHomeworkModal.style.display = 'none';
        }
        if (homeworkForm) homeworkForm.reset();
        console.log('Add Homework modal closed.');
    });
}

if (addHomeworkModal) {
    addHomeworkModal.addEventListener('click', (e) => {
        if (e.target === addHomeworkModal) {
            addHomeworkModal.classList.add('hidden');
            addHomeworkModal.style.display = 'none';
            if (homeworkForm) homeworkForm.reset();
            console.log('Add Homework modal closed by outside click.');
        }
    });
}

if (homeworkForm) {
    homeworkForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
        const userEmail = loggedInUser?.email || 'admin';

        const homeworkId = document.getElementById('homeworkId').value;
        const homeworkData = {
            title: document.getElementById('homeworkTitle').value,
            class: document.getElementById('homeworkClass').value,
            subject: document.getElementById('homeworkSubject').value,
            assigned_date: document.getElementById('homeworkAssignedDate').value,
            due_date: document.getElementById('homeworkDueDate').value,
            description: document.getElementById('homeworkDescription').value || null
        };

        try {
            let response;
            if (homeworkId) {
                // Update existing homework
                response = await supabase.from('homework').update(homeworkData).eq('id', homeworkId).select();
                alert('Homework updated successfully!');
                await addAuditLog(userEmail, 'Updated Homework', 'Homework', `Updated homework: "${homeworkData.title}" (ID: ${homeworkId})`);
            } else {
                // Add new homework
                response = await supabase.from('homework').insert([homeworkData]).select();
                alert('Homework added successfully!');
                await addAuditLog(userEmail, 'Added Homework', 'Homework', `Added new homework: "${homeworkData.title}"`);
            }

            if (response.error) throw response.error;

            await fetchHomework(); // Re-fetch homework to update the table
            if (addHomeworkModal) {
                addHomeworkModal.classList.add('hidden');
                addHomeworkModal.style.display = 'none';
            }
            if (homeworkForm) {
                homeworkForm.reset();
            }
            console.log('Homework form submitted successfully.');
        } catch (error) {
            alert('Error saving homework: ' + error.message);
            console.error('Supabase error saving homework:', error);
            await addAuditLog(userEmail, 'Homework Save Failed', 'Homework', `Error: ${error.message}`);
        }
    });
}

window.deleteHomework = async function(id) {
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    const userEmail = loggedInUser?.email || 'admin';
    if (confirm('Are you sure you want to delete this homework assignment? This action cannot be undone.')) {
        console.log(`Deleting homework ID: ${id}`);
        try {
            const { error } = await supabase.from('homework').delete().eq('id', id);
            if (error) throw error;

            const deletedAssignment = homeworkAssignments.find(a => a.id === id);
            await addAuditLog(userEmail, 'Deleted Homework', 'Homework', `Deleted homework: "${deletedAssignment?.title || 'Unknown'}" (ID: ${id})`);
            alert('Homework assignment deleted successfully!');
            await fetchHomework(); // Re-fetch homework to update the table
            console.log(`Homework ID ${id} deleted successfully.`);
        } catch (error) {
            alert('Error deleting homework: ' + error.message);
            console.error('Supabase error deleting homework:', error);
            await addAuditLog(userEmail, 'Homework Delete Failed', 'Homework', `Error: ${error.message}`);
        }
    }
}

window.showHomeworkDetailsModal = function(id) {
    const assignment = homeworkAssignments.find(a => a.id === id);
    if (assignment) {
        const homeworkDetailsModalTitle = document.getElementById('homeworkDetailsModalTitle'); // Assuming this element exists
        if (homeworkDetailsModalTitle) {
            homeworkDetailsModalTitle.textContent = `Details for "${assignment.title}"`;
        }
        if (homeworkDetailsContent) {
            homeworkDetailsContent.innerHTML = `
                <p><strong>ID:</strong> ${assignment.id}</p>
                <p><strong>Title:</strong> ${assignment.title}</p>
                <p><strong>Class:</strong> ${assignment.class}</p>
                <p><strong>Subject:</strong> ${assignment.subject}</p>
                <p><strong>Assigned Date:</strong> ${assignment.assigned_date}</p>
                <p><strong>Due Date:</strong> ${assignment.due_date}</p>
                <p><strong>Description:</strong> ${assignment.description || 'N/A'}</p>
            `;
        }
        if (homeworkDetailsModal) {
            homeworkDetailsModal.classList.remove('hidden');
            homeworkDetailsModal.style.display = 'flex';
            console.log(`Homework details modal opened for ID: ${id}`);
        }
    } else {
        alert('Homework assignment not found.');
        console.warn(`Homework assignment with ID ${id} not found for details display.`);
    }
}

if (closeHomeworkDetailsModal) {
    closeHomeworkDetailsModal.addEventListener('click', () => {
        if (homeworkDetailsModal) {
            homeworkDetailsModal.classList.add('hidden');
            homeworkDetailsModal.style.display = 'none';
        }
        console.log('Homework details modal closed.');
    });
}

if (homeworkDetailsModal) {
    homeworkDetailsModal.addEventListener('click', (e) => {
        if (e.target === homeworkDetailsModal) {
            homeworkDetailsModal.classList.add('hidden');
            homeworkDetailsModal.style.display = 'none';
            console.log('Homework details modal closed by outside click.');
        }
    });
}

window.filterHomework = function() {
    const classFilter = filterHomeworkClass ? filterHomeworkClass.value : '';
    const subjectFilter = filterHomeworkSubject ? filterHomeworkSubject.value : '';
    const dueDateFilter = filterHomeworkDueDate ? filterHomeworkDueDate.value : '';

    const filtered = homeworkAssignments.filter(assignment => {
        const classMatch = classFilter === '' || assignment.class === classFilter;
        const subjectMatch = subjectFilter === '' || assignment.subject === subjectFilter;
        const dueDateMatch = dueDateFilter === '' || assignment.due_date === dueDateFilter;
        return classMatch && subjectMatch && dueDateMatch;
    });
    renderHomeworkTable(filtered);
    console.log('Homework filtered.');
}

// Reports Module Functions
function initReportsCharts() {
    // Destroy existing chart instances before re-initializing
    safeDestroy(reportsAttendanceChart);
    safeDestroy(reportsPerformanceChart);
    safeDestroy(reportsStudentStatusChart);
    safeDestroy(reportsClassPerformanceChart);

    // Example data for reports charts (can be replaced with fetched data)
    const attendanceData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
            label: 'Student Attendance Rate (%)',
            data: [90, 88, 92, 85, 95, 90],
            backgroundColor: 'rgba(75, 192, 192, 0.6)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1
        }]
    };

    const performanceData = {
        labels: ['Math', 'Science', 'English', 'History'],
        datasets: [{
            label: 'Average Score (%)',
            data: [85, 78, 90, 70],
            backgroundColor: [
                'rgba(255, 99, 132, 0.6)',
                'rgba(54, 162, 235, 0.6)',
                'rgba(255, 206, 86, 0.6)',
                'rgba(153, 102, 255, 0.6)'
            ],
            borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(153, 102, 255, 1)'
            ],
            borderWidth: 1
        }]
    };

    const studentStatusData = {
        labels: ['Active', 'Inactive', 'On Leave'],
        datasets: [{
            label: 'Student Status',
            data: [students.filter(s => s.status === 'Active').length, students.filter(s => s.status === 'Inactive').length, students.filter(s => s.status === 'On Leave').length],
            backgroundColor: [
                'rgba(75, 192, 192, 0.6)',
                'rgba(255, 159, 64, 0.6)',
                'rgba(255, 99, 132, 0.6)'
            ],
            borderColor: [
                'rgba(75, 192, 192, 1)',
                'rgba(255, 159, 64, 1)',
                'rgba(255, 99, 132, 1)'
            ],
            borderWidth: 1
        }]
    };

    const classPerformanceData = {
        labels: ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5'],
        datasets: [{
            label: 'Average Class Score (%)',
            data: [80, 85, 75, 90, 82],
            backgroundColor: 'rgba(54, 162, 235, 0.6)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1
        }]
    };

    // Render charts if their canvases exist
    const attendanceChartCanvas = document.getElementById('reportsAttendanceChart');
    if (attendanceChartCanvas) {
        reportsAttendanceChart = new Chart(attendanceChartCanvas, {
            type: 'bar',
            data: attendanceData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });
    }

    const performanceChartCanvas = document.getElementById('reportsPerformanceChart');
    if (performanceChartCanvas) {
        reportsPerformanceChart = new Chart(performanceChartCanvas, {
            type: 'doughnut',
            data: performanceData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
            }
        });
    }

    const studentStatusChartCanvas = document.getElementById('reportsStudentStatusChart');
    if (studentStatusChartCanvas) {
        reportsStudentStatusChart = new Chart(studentStatusChartCanvas, {
            type: 'pie',
            data: studentStatusData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
            }
        });
    }

    const classPerformanceChartCanvas = document.getElementById('reportsClassPerformanceChart');
    if (classPerformanceChartCanvas) {
        reportsClassPerformanceChart = new Chart(classPerformanceChartCanvas, {
            type: 'line',
            data: classPerformanceData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });
    }
    console.log('Reports charts initialized.');
}

window.generateReport = async function() {
    const reportType = reportTypeSelect ? reportTypeSelect.value : '';
    const reportClass = reportClassFilterSelect ? reportClassFilterSelect.value : '';
    const startDate = reportStartDateInput ? reportStartDateInput.value : '';
    const endDate = reportEndDateInput ? reportEndDateInput.value : '';
    const reportDisplayArea = document.getElementById('reportDisplayArea');

    if (!reportType) {
        alert('Please select a report type.');
        return;
    }

    let reportContent = '';
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    const userEmail = loggedInUser?.email || 'admin';

    try {
        switch (reportType) {
            case 'student_performance':
                reportContent = await generateStudentPerformanceReport(reportClass, startDate, endDate);
                await addAuditLog(userEmail, 'Generated Report', 'Reports', `Generated Student Performance Report for Class: ${reportClass || 'All'}, Dates: ${startDate || 'All'} to ${endDate || 'All'}`);
                break;
            case 'attendance_summary':
                reportContent = await generateAttendanceSummaryReport(reportClass, startDate, endDate);
                await addAuditLog(userEmail, 'Generated Report', 'Reports', `Generated Attendance Summary Report for Class: ${reportClass || 'All'}, Dates: ${startDate || 'All'} to ${endDate || 'All'}`);
                break;
            case 'financial_overview':
                reportContent = await generateFinancialOverviewReport(startDate, endDate);
                await addAuditLog(userEmail, 'Generated Report', 'Reports', `Generated Financial Overview Report for Dates: ${startDate || 'All'} to ${endDate || 'All'}`);
                break;
            case 'teacher_load':
                reportContent = await generateTeacherLoadReport();
                await addAuditLog(userEmail, 'Generated Report', 'Reports', `Generated Teacher Load Report`);
                break;
            default:
                reportContent = '<p class="text-red-500">Invalid report type selected.</p>';
                console.warn(`Invalid report type: ${reportType}`);
        }
    } catch (error) {
        reportContent = `<p class="text-red-500">Error generating report: ${error.message}</p>`;
        console.error(`Error generating report ${reportType}:`, error);
        await addAuditLog(userEmail, 'Report Generation Failed', 'Reports', `Failed to generate ${reportType} report: ${error.message}`);
    }

    if (reportDisplayArea) {
        reportDisplayArea.innerHTML = reportContent;
    }
    console.log(`Report "${reportType}" generated.`);
}

async function generateStudentPerformanceReport(className, startDate, endDate) {
    let filteredStudents = students;
    if (className) {
        filteredStudents = students.filter(s => s.class === className);
    }

    let reportHtml = `
        <h4 class="text-lg font-semibold mb-3">Student Performance Report ${className ? `for Class ${className}` : 'for All Classes'}</h4>
        <p class="text-sm text-gray-600 mb-4">Report Period: ${startDate || 'All Time'} to ${endDate || 'All Time'}</p>
        <div class="overflow-x-auto">
            <table class="min-w-full table-auto">
                <thead>
                    <tr class="bg-gray-100">
                        <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Name</th>
                        <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
                        <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                        <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score (%)</th>
                        <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                    </tr>
                </thead>
                <tbody>
    `;

    if (filteredStudents.length === 0) {
        reportHtml += `<tr><td colspan="5" class="px-4 py-2 text-center text-gray-500">No students found for this criteria.</td></tr>`;
    } else {
        for (const student of filteredStudents) {
            // Simulate fetching exam results for each student
            const studentExams = exams.filter(e => e.class === student.class); // Filter by student's class
            let studentScores = [];

            for (const exam of studentExams) {
                // Simulate score generation for each exam
                const score = Math.floor(Math.random() * (exam.max_marks + 1));
                const percentage = ((score / exam.max_marks) * 100).toFixed(2);
                let grade = 'F';
                if (percentage >= 90) grade = 'A+';
                else if (percentage >= 80) grade = 'A';
                else if (percentage >= 70) grade = 'B';
                else if (percentage >= 60) grade = 'C';
                else if (percentage >= 50) grade = 'D';

                studentScores.push({
                    subject: exam.subject,
                    percentage: percentage,
                    grade: grade
                });
            }

            if (studentScores.length === 0) {
                reportHtml += `
                    <tr>
                        <td class="px-4 py-2">${student.name}</td>
                        <td class="px-4 py-2">${student.class}</td>
                        <td colspan="3" class="px-4 py-2 text-center text-gray-500">No exam data available.</td>
                    </tr>
                `;
            } else {
                studentScores.forEach((score, index) => {
                    reportHtml += `
                        <tr>
                            <td class="px-4 py-2">${index === 0 ? student.name : ''}</td>
                            <td class="px-4 py-2">${student.class}</td>
                            <td class="px-4 py-2">${score.subject}</td>
                            <td class="px-4 py-2">${score.percentage}%</td>
                            <td class="px-4 py-2">${score.grade}</td>
                        </tr>
                    `;
                });
            }
        }
    }

    reportHtml += `
                </tbody>
            </table>
        </div>
    `;
    return reportHtml;
}

async function generateAttendanceSummaryReport(className, startDate, endDate) {
    let filteredAttendance = attendanceRecords;
    if (className) {
        filteredAttendance = filteredAttendance.filter(rec => rec.students?.class === className);
    }
    if (startDate) {
        filteredAttendance = filteredAttendance.filter(rec => new Date(rec.date) >= new Date(startDate));
    }
    if (endDate) {
        filteredAttendance = filteredAttendance.filter(rec => new Date(rec.date) <= new Date(endDate));
    }

    const studentAttendanceSummary = {};
    filteredAttendance.forEach(record => {
        const studentId = record.student_id;
        if (!studentAttendanceSummary[studentId]) {
            studentAttendanceSummary[studentId] = {
                name: record.students?.name || 'N/A',
                class: record.students?.class || 'N/A',
                present: 0,
                absent: 0,
                leave: 0,
                totalDays: 0
            };
        }
        studentAttendanceSummary[studentId].totalDays++;
        if (record.status === 'Present') {
            studentAttendanceSummary[studentId].present++;
        } else if (record.status === 'Absent') {
            studentAttendanceSummary[studentId].absent++;
        } else if (record.status === 'Leave') {
            studentAttendanceSummary[studentId].leave++;
        }
    });

    let reportHtml = `
        <h4 class="text-lg font-semibold mb-3">Attendance Summary Report ${className ? `for Class ${className}` : 'for All Classes'}</h4>
        <p class="text-sm text-gray-600 mb-4">Report Period: ${startDate || 'All Time'} to ${endDate || 'All Time'}</p>
        <div class="overflow-x-auto">
            <table class="min-w-full table-auto">
                <thead>
                    <tr class="bg-gray-100">
                        <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Name</th>
                        <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
                        <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Present</th>
                        <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Absent</th>
                        <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">On Leave</th>
                        <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Days</th>
                        <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attendance Rate (%)</th>
                    </tr>
                </thead>
                <tbody>
    `;

    const sortedStudents = Object.values(studentAttendanceSummary).sort((a, b) => a.name.localeCompare(b.name));

    if (sortedStudents.length === 0) {
        reportHtml += `<tr><td colspan="7" class="px-4 py-2 text-center text-gray-500">No attendance data found for this criteria.</td></tr>`;
    } else {
        sortedStudents.forEach(summary => {
            const attendanceRate = summary.totalDays > 0 ? ((summary.present / summary.totalDays) * 100).toFixed(2) : 0;
            reportHtml += `
                <tr>
                    <td class="px-4 py-2">${summary.name}</td>
                    <td class="px-4 py-2">${summary.class}</td>
                    <td class="px-4 py-2">${summary.present}</td>
                    <td class="px-4 py-2">${summary.absent}</td>
                    <td class="px-4 py-2">${summary.leave}</td>
                    <td class="px-4 py-2">${summary.totalDays}</td>
                    <td class="px-4 py-2">${attendanceRate}%</td>
                </tr>
            `;
        });
    }

    reportHtml += `
                </tbody>
            </table>
        </div>
    `;
    return reportHtml;
}

async function generateFinancialOverviewReport(startDate, endDate) {
    let filteredInvoices = invoices;
    if (startDate) {
        filteredInvoices = filteredInvoices.filter(inv => new Date(inv.date) >= new Date(startDate));
    }
    if (endDate) {
        filteredInvoices = filteredInvoices.filter(inv => new Date(inv.date) <= new Date(endDate));
    }

    const totalRevenue = filteredInvoices.reduce((sum, inv) => sum + parseFloat(inv.amount), 0);
    const totalPaid = filteredInvoices.reduce((sum, inv) => sum + parseFloat(inv.paid_amount || 0), 0);
    const totalDue = totalRevenue - totalPaid;

    const paidInvoices = filteredInvoices.filter(inv => inv.status === 'Paid').length;
    const pendingInvoices = filteredInvoices.filter(inv => inv.status === 'Pending').length;
    const overdueInvoices = filteredInvoices.filter(inv => inv.status === 'Overdue').length;

    let reportHtml = `
        <h4 class="text-lg font-semibold mb-3">Financial Overview Report</h4>
        <p class="text-sm text-gray-600 mb-4">Report Period: ${startDate || 'All Time'} to ${endDate || 'All Time'}</p>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div class="module-card p-4">
                <p class="text-gray-500">Total Revenue</p>
                <h4 class="text-2xl font-bold mt-1">₹${totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h4>
            </div>
            <div class="module-card p-4">
                <p class="text-gray-500">Total Paid</p>
                <h4 class="text-2xl font-bold mt-1 text-green-600">₹${totalPaid.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h4>
            </div>
            <div class="module-card p-4">
                <p class="text-gray-500">Total Due</p>
                <h4 class="text-2xl font-bold mt-1 text-red-600">₹${totalDue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h4>
            </div>
            <div class="module-card p-4">
                <p class="text-gray-500">Invoices Status</p>
                <p>Paid: ${paidInvoices}</p>
                <p>Pending: ${pendingInvoices}</p>
                <p>Overdue: ${overdueInvoices}</p>
            </div>
        </div>
        <h5 class="text-md font-semibold mb-3">Recent Invoices</h5>
        <div class="overflow-x-auto">
            <table class="min-w-full table-auto">
                <thead>
                    <tr class="bg-gray-100">
                        <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice #</th>
                        <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                        <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount (₹)</th>
                        <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paid (₹)</th>
                        <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due (₹)</th>
                        <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                </thead>
                <tbody>
    `;

    if (filteredInvoices.length === 0) {
        reportHtml += `<tr><td colspan="6" class="px-4 py-2 text-center text-gray-500">No invoice data found for this criteria.</td></tr>`;
    } else {
        filteredInvoices.slice(0, 10).forEach(inv => { // Show top 10 recent invoices
            const dueAmount = parseFloat(inv.amount) - parseFloat(inv.paid_amount || 0);
            reportHtml += `
                <tr>
                    <td class="px-4 py-2">${inv.invoice_number}</td>
                    <td class="px-4 py-2">${inv.students?.name || 'N/A'}</td>
                    <td class="px-4 py-2">₹${parseFloat(inv.amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td class="px-4 py-2">₹${parseFloat(inv.paid_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td class="px-4 py-2">₹${dueAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td class="px-4 py-2">${inv.status}</td>
                </tr>
            `;
        });
    }

    reportHtml += `
                </tbody>
            </table>
        </div>
    `;
    return reportHtml;
}

async function generateTeacherLoadReport() {
    const teacherLoad = {};
    teachers.forEach(teacher => {
        teacherLoad[teacher.id] = {
            name: teacher.name,
            subject: teacher.subject,
            classesTaught: teacher.classes ? teacher.classes.split(',').map(c => c.trim()).length : 0,
            assignedHomework: homeworkAssignments.filter(hw => hw.subject === teacher.subject).length, // Simplified: assumes teacher teaches all classes for their subject
            // In a real system, you'd link teachers to specific classes/sections
        };
    });

    let reportHtml = `
        <h4 class="text-lg font-semibold mb-3">Teacher Load Report</h4>
        <p class="text-sm text-gray-600 mb-4">Overview of teacher assignments and workload.</p>
        <div class="overflow-x-auto">
            <table class="min-w-full table-auto">
                <thead>
                    <tr class="bg-gray-100">
                        <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teacher Name</th>
                        <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                        <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Classes Taught</th>
                        <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned Homework</th>
                    </tr>
                </thead>
                <tbody>
    `;

    const sortedTeachers = Object.values(teacherLoad).sort((a, b) => a.name.localeCompare(b.name));

    if (sortedTeachers.length === 0) {
        reportHtml += `<tr><td colspan="4" class="px-4 py-2 text-center text-gray-500">No teacher data found.</td></tr>`;
    } else {
        sortedTeachers.forEach(load => {
            reportHtml += `
                <tr>
                    <td class="px-4 py-2">${load.name}</td>
                    <td class="px-4 py-2">${load.subject}</td>
                    <td class="px-4 py-2">${load.classesTaught}</td>
                    <td class="px-4 py-2">${load.assignedHomework}</td>
                </tr>
            `;
        });
    }

    reportHtml += `
                </tbody>
            </table>
        </div>
    `;
    return reportHtml;
}

// Event listeners for reports module
if (reportTypeSelect) {
    reportTypeSelect.addEventListener('change', () => {
        // Optionally show/hide filters based on report type
        const type = reportTypeSelect.value;
        if (type === 'teacher_load' || type === 'financial_overview') {
            reportClassFilterSelect.value = ''; // Clear class filter for these reports
            reportClassFilterSelect.disabled = true;
        } else {
            reportClassFilterSelect.disabled = false;
        }
    });
}

// Initial chart rendering for dashboard
function initCharts() {
    // Destroy existing chart instances before re-initializing
    safeDestroy(financeOverviewChartInstance);
    safeDestroy(studentAttendanceChartInstance);
    safeDestroy(teacherAttendanceChartInstance);
    safeDestroy(monthlyAttendanceTrendChartInstance);

    // Data for Finance Overview Chart
    const financeData = {
        labels: ['Total Revenue', 'Total Paid', 'Total Due'],
        datasets: [{
            data: [
                invoices.reduce((sum, inv) => sum + parseFloat(inv.amount), 0),
                invoices.reduce((sum, inv) => sum + parseFloat(inv.paid_amount || 0), 0),
                invoices.reduce((sum, inv) => sum + (parseFloat(inv.amount) - parseFloat(inv.paid_amount || 0)), 0)
            ],
            backgroundColor: ['#4CAF50', '#2196F3', '#F44336'],
            hoverOffset: 4
        }]
    };

    const financeCtx = document.getElementById('financeOverviewChart');
    if (financeCtx) {
        financeOverviewChartInstance = new Chart(financeCtx, {
            type: 'doughnut',
            data: financeData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Financial Overview'
                    }
                }
            }
        });
    }

    // Data for Student Attendance Chart
    const studentAttendanceCounts = {
        present: attendanceRecords.filter(rec => rec.status === 'Present').length,
        absent: attendanceRecords.filter(rec => rec.status === 'Absent').length,
        leave: attendanceRecords.filter(rec => rec.status === 'Leave').length
    };
    const studentAttendanceData = {
        labels: ['Present', 'Absent', 'On Leave'],
        datasets: [{
            data: [studentAttendanceCounts.present, studentAttendanceCounts.absent, studentAttendanceCounts.leave],
            backgroundColor: ['#4CAF50', '#F44336', '#FFC107'],
            hoverOffset: 4
        }]
    };

        const studentAttendanceCtx = document.getElementById('studentAttendanceChart');
    if (studentAttendanceCtx) {
        studentAttendanceChartInstance = new Chart(studentAttendanceCtx, {
            type: 'pie',
            data: studentAttendanceData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Student Attendance Overview'
                    }
                }
            }
        });
    }

    // Data for Teacher Attendance Chart
    const teacherAttendanceCounts = {
        present: teacherAttendanceRecords.filter(rec => rec.status === 'Present').length,
        absent: teacherAttendanceRecords.filter(rec => rec.status === 'Absent').length,
        leave: teacherAttendanceRecords.filter(rec => rec.status === 'Leave').length
    };
    const teacherAttendanceData = {
        labels: ['Present', 'Absent', 'On Leave'],
        datasets: [{
            data: [teacherAttendanceCounts.present, teacherAttendanceCounts.absent, teacherAttendanceCounts.leave],
            backgroundColor: ['#4CAF50', '#F44336', '#FFC107'],
            hoverOffset: 4
        }]
    };

    const teacherAttendanceCtx = document.getElementById('teacherAttendanceChart');
    if (teacherAttendanceCtx) {
        teacherAttendanceChartInstance = new Chart(teacherAttendanceCtx, {
            type: 'pie',
            data: teacherAttendanceData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Teacher Attendance Overview'
                    }
                }
            }
        });
    }

    // Data for Monthly Attendance Trend Chart
    const monthlyAttendanceData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [{
            label: 'Monthly Attendance',
            data: Array(12).fill(0).map((_, index) => {
                const month = index + 1;
                return attendanceRecords.filter(record => new Date(record.date).getMonth() + 1 === month).length;
            }),
            backgroundColor: 'rgba(75, 192, 192, 0.6)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1
        }]
    };

    const monthlyAttendanceTrendCtx = document.getElementById('monthlyAttendanceTrendChart');
    if (monthlyAttendanceTrendCtx) {
        monthlyAttendanceTrendChartInstance = new Chart(monthlyAttendanceTrendCtx, {
            type: 'bar',
            data: monthlyAttendanceData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: { beginAtZero: true }
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Monthly Attendance Trend'
                    }
                }
            }
        });
    }

    console.log('All charts initialized successfully.');
}

// Initialize the application
document.addEventListener('DOMContentLoaded', async () => {
    await loadAllData(); // Load all data on initial load
    updateDashboardStats(); // Update dashboard stats after data load
    initCharts(); // Initialize charts after data load
});



// QR Code Scanning for Attendance
// QR Code Scanning for Attendance
window.startQrAttendance = function() {
    if (!checkHtml5QrCodeAvailability()) return;

    if (qrScannerSection) {
        qrScannerSection.classList.remove('hidden');
    }
    if (qrVideo) {
        qrVideo.innerHTML = ''; // Clear previous content
    }
    if (qrScanFeedback) {
        qrScanFeedback.innerHTML = ''; // Clear previous feedback
        qrScanFeedback.classList.remove('text-green-600', 'text-red-600');
    }

    html5QrCodeScanner = new Html5QrcodeScanner(
        "qrVideo",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        /* verbose= */ false
    );

    // --- MODIFIED CODE START ---
    html5QrCodeScanner.render(
        async (decodedText, decodedResult) => {
            // Handle success, e.g., stop scanning and process the ID
            console.log(`QR Code scanned: ${decodedText}`);
            playBeep(); // Play beep sound on successful scan

            if (qrScanFeedback) {
                qrScanFeedback.classList.remove('text-green-600', 'text-red-600'); // Reset color
                qrScanFeedback.textContent = 'Processing...'; // Initial feedback
            }

            // Process the scanned student ID and mark attendance
            if (decodedText.startsWith('student_attendance:')) {
                const studentId = decodedText.split(':')[1];
                const student = students.find(s => s.id === studentId);
                if (student) {
                    const today = new Date().toISOString().split('T')[0];
                    const currentTime = new Date().toTimeString().split(' ')[0];
                    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser')); // Corrected variable name
                    const userEmail = loggedInUser?.email || 'QR Scanner';

                    try {
                        // Check if an attendance record already exists for today
                        const { data: existingRecords, error: fetchError } = await supabase
                            .from('attendance')
                            .select('*')
                            .eq('student_id', studentId)
                            .eq('attendance_date', today);

                        if (fetchError) throw fetchError;

                        if (existingRecords && existingRecords.length > 0) {
                            const existingRecord = existingRecords[0];
                            if (existingRecord.status === 'Present') {
                                if (qrScanFeedback) {
                                    qrScanFeedback.textContent = `${student.name} (Roll No: ${student.roll_no}) - Already Marked Present`;
                                    qrScanFeedback.classList.add('text-red-600');
                                }
                                console.log(`Attendance already marked for ${student.name} today.`);
                                await addAuditLog(userEmail, 'QR Attendance Duplicate', 'Attendance', `Duplicate QR scan for ${student.name} (ID: ${studentId})`);
                            } else {
                                // Update status to Present and set arrival time if not already set
                                const updateData = { status: 'Present' };
                                if (!existingRecord.arrival_time) {
                                    updateData.arrival_time = currentTime;
                                }
                                const { error: updateError } = await supabase.from('attendance').update(updateData).eq('id', existingRecord.id);
                                if (updateError) throw updateError;
                                if (qrScanFeedback) {
                                    qrScanFeedback.textContent = `${student.name} (Roll No: ${student.roll_no}) - Marked Present`;
                                    qrScanFeedback.classList.add('text-green-600');
                                }
                                console.log(`Attendance updated for ${student.name}: Marked Present.`);
                                await addAuditLog(userEmail, 'QR Attendance Updated', 'Attendance', `Updated attendance for ${student.name} (ID: ${studentId}) to Present`);
                            }
                        } else {
                            // Create new attendance record
                            const { error: insertError } = await supabase.from('attendance').insert([
                                {
                                    student_id: studentId,
                                    date: today,
                                    status: 'Present',
                                    arrival_time: currentTime,
                                    remarks: 'QR Scan'
                                }
                            ]);
                            if (insertError) throw insertError;
                            if (qrScanFeedback) {
                                qrScanFeedback.textContent = `${student.name} (Roll No: ${student.roll_no}) - Marked Present`;
                                qrScanFeedback.classList.add('text-green-600');
                            }
                            console.log(`Attendance marked for ${student.name}: Present.`);
                            await addAuditLog(userEmail, 'QR Attendance Marked', 'Attendance', `Marked Present for ${student.name} (ID: ${studentId}) via QR scan`);
                        }
                        await fetchAttendanceRecords(); // Refresh attendance data
                    } catch (error) {
                        if (qrScanFeedback) {
                            qrScanFeedback.textContent = `Error for ${student.name}: ${error.message}`;
                            qrScanFeedback.classList.add('text-red-600');
                        }
                        console.error('Supabase error marking attendance via QR:', error);
                        await addAuditLog(userEmail, 'QR Attendance Failed', 'Attendance', `Error marking attendance for ${student.name} (ID: ${studentId}): ${error.message}`);
                    }
                } else {
                    if (qrScanFeedback) {
                        qrScanFeedback.textContent = `Student not found for this QR code: ${studentId}`;
                        qrScanFeedback.classList.add('text-red-600');
                    }
                    console.warn(`Student not found for QR code: ${studentId}`);
                    await addAuditLog('QR Scanner', 'QR Scan Failed', 'Attendance', `Student not found for QR code: ${studentId}`);
                }
            } else {
                if (qrScanFeedback) {
                    qrScanFeedback.textContent = `Invalid QR code format: ${decodedText}`;
                    qrScanFeedback.classList.add('text-red-600');
                }
                console.warn(`Invalid QR code format: ${decodedText}`);
                await addAuditLog('QR Scanner', 'QR Scan Failed', 'Attendance', `Invalid QR code format: ${decodedText}`);
            }
        },
        (errorMessage) => {
            // console.warn(`QR Code scan error: ${errorMessage}`); // Too verbose for console
        }
    );
    // --- MODIFIED CODE END ---
    console.log('Student QR attendance scanner started.');
};


// Stop QR Attendance Scanning
window.stopQrAttendance = async function() {
    if (html5QrCodeScanner && html5QrCodeScanner.isScanning) {
        try {
            await html5QrCodeScanner.stop();
            console.log('Student QR attendance scanner stopped.');
        } catch (err) {
            console.error('Error stopping student QR scanner:', err);
        } finally {
            if (qrScannerSection) {
                qrScannerSection.classList.add('hidden');
            }
            if (qrVideo) {
                qrVideo.innerHTML = '';
            }
            if (qrScanFeedback) {
                qrScanFeedback.innerHTML = '';
                qrScanFeedback.classList.remove('text-green-600', 'text-red-600');
            }
            html5QrCodeScanner = null; // Clear the instance
        }
    }
};

// Function to handle successful QR scan for students
async function onScanSuccessStudent(decodedText, decodedResult) {
    console.log(`QR Code scanned: ${decodedText}`);
    playBeep(); // Play beep sound on successful scan

    if (qrScanFeedback) {
        qrScanFeedback.classList.remove('text-green-600', 'text-red-600'); // Reset color
        qrScanFeedback.textContent = 'Processing...'; // Initial feedback
    }

    if (decodedText.startsWith('student_attendance:')) {
        const studentId = decodedText.split(':')[1];
        const student = students.find(s => s.id === studentId);
        if (student) {
            const today = new Date().toISOString().split('T')[0];
            const currentTime = new Date().toTimeString().split(' ')[0];
            const loggedInUser  = JSON.parse(localStorage.getItem('loggedInUser '));
            const userEmail = loggedInUser ?.email || 'QR Scanner';

            try {
                // Check if an attendance record already exists for today
                const { data: existingRecords, error: fetchError } = await supabase
                    .from('attendance')
                    .select('*')
                    .eq('student_id', studentId)
                    .eq('attendance_date', today);

                if (fetchError) throw fetchError;

                if (existingRecords && existingRecords.length > 0) {
                    const existingRecord = existingRecords[0];
                    if (existingRecord.status === 'Present') {
                        if (qrScanFeedback) {
                            qrScanFeedback.textContent = `${student.name} (Roll No: ${student.roll_no}) - Already Marked Present`;
                            qrScanFeedback.classList.add('text-red-600');
                        }
                        console.log(`Attendance already marked for ${student.name} today.`);
                        await addAuditLog(userEmail, 'QR Attendance Duplicate', 'Attendance', `Duplicate QR scan for ${student.name} (ID: ${studentId})`);
                    } else {
                        // Update status to Present and set arrival time if not already set
                        const updateData = { status: 'Present' };
                        if (!existingRecord.arrival_time) {
                            updateData.arrival_time = currentTime;
                        }
                        const { error: updateError } = await supabase.from('attendance').update(updateData).eq('id', existingRecord.id);
                        if (updateError) throw updateError;
                        if (qrScanFeedback) {
                            qrScanFeedback.textContent = `${student.name} (Roll No: ${student.roll_no}) - Marked Present`;
                            qrScanFeedback.classList.add('text-green-600');
                        }
                        console.log(`Attendance updated for ${student.name}: Marked Present.`);
                        await addAuditLog(userEmail, 'QR Attendance Updated', 'Attendance', `Updated attendance for ${student.name} (ID: ${studentId}) to Present`);
                    }
                } else {
                    // Create new attendance record
                    const { error: insertError } = await supabase.from('attendance').insert([
                        {
                            student_id: studentId,
                            date: today,
                            status: 'Present',
                            arrival_time: currentTime,
                            remarks: 'QR Scan'
                        }
                    ]);
                    if (insertError) throw insertError;
                    if (qrScanFeedback) {
                        qrScanFeedback.textContent = `${student.name} (Roll No: ${student.roll_no}) - Marked Present`;
                        qrScanFeedback.classList.add('text-green-600');
                    }
                    console.log(`Attendance marked for ${student.name}: Present.`);
                    await addAuditLog(userEmail, 'QR Attendance Marked', 'Attendance', `Marked Present for ${student.name} (ID: ${studentId}) via QR scan`);
                }
                await fetchAttendanceRecords(); // Refresh attendance data
            } catch (error) {
                if (qrScanFeedback) {
                    qrScanFeedback.textContent = `Error for ${student.name}: ${error.message}`;
                    qrScanFeedback.classList.add('text-red-600');
                }
                console.error('Supabase error marking attendance via QR:', error);
                await addAuditLog(userEmail, 'QR Attendance Failed', 'Attendance', `Error marking attendance for ${student.name} (ID: ${studentId}): ${error.message}`);
            }
        } else {
            if (qrScanFeedback) {
                qrScanFeedback.textContent = `Student not found for this QR code: ${studentId}`;
                qrScanFeedback.classList.add('text-red-600');
            }
            console.warn(`Student not found for QR code: ${studentId}`);
            await addAuditLog('QR Scanner', 'QR Scan Failed', 'Attendance', `Student not found for QR code: ${studentId}`);
        }
    } else {
        if (qrScanFeedback) {
            qrScanFeedback.textContent = `Invalid QR code format: ${decodedText}`;
            qrScanFeedback.classList.add('text-red-600');
        }
        console.warn(`Invalid QR code format: ${decodedText}`);
        await addAuditLog('QR Scanner', 'QR Scan Failed', 'Attendance', `Invalid QR code format: ${decodedText}`);
    }
}

// Function to handle errors during QR scanning
function onScanErrorStudent(errorMessage) {
    // console.warn(`QR Code scan error: ${errorMessage}`); // Too verbose for console
}

// QR Code Scanning for Teacher Attendance
window.startTeacherQrAttendance = function(type) {
    if (!checkHtml5QrCodeAvailability()) return;

    if (teacherQrScannerSection) {
        teacherQrScannerSection.classList.remove('hidden');
    }
    if (teacherQrVideo) {
        teacherQrVideo.innerHTML = ''; // Clear previous content
    }
    if (qrScanFeedbackTeacher) {
        qrScanFeedbackTeacher.innerHTML = ''; // Clear previous feedback
        qrScanFeedbackTeacher.classList.remove('text-green-600', 'text-red-600');
    }

    html5QrCodeScannerTeacher = new Html5QrcodeScanner(
        "teacherQrVideo",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        /* verbose= */ false
    );

    html5QrCodeScannerTeacher.render(
        async (decodedText, decodedResult) => {
            console.log(`Teacher QR Code scanned: ${decodedText}`);
            playBeep(); // Play beep sound on successful scan

            if (qrScanFeedbackTeacher) {
                qrScanFeedbackTeacher.classList.remove('text-green-600', 'text-red-600'); // Reset color
                qrScanFeedbackTeacher.textContent = 'Processing...'; // Initial feedback
            }

            if (decodedText.startsWith('teacher_attendance:')) {
                const teacherId = decodedText.split(':')[1];
                const teacher = teachers.find(t => t.id === teacherId);
                if (teacher) {
                    const today = new Date().toISOString().split('T')[0];
                    const currentTime = new Date().toTimeString().split(' ')[0];
                    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser')); // Corrected variable name
                    const userEmail = loggedInUser?.email || 'QR Scanner';

                    try {
                        // Check if an attendance record already exists for today
                        const { data: existingRecords, error: fetchError } = await supabase
                            .from('teacher_attendance')
                            .select('*')
                            .eq('teacher_id', teacherId)
                            .eq('date', today);

                        if (fetchError) throw fetchError;

                        if (existingRecords && existingRecords.length > 0) {
                            const existingRecord = existingRecords[0];
                            if (type === 'arrival') {
                                if (existingRecord.arrival_time) {
                                    if (qrScanFeedbackTeacher) {
                                        qrScanFeedbackTeacher.textContent = `${teacher.name} (Subject: ${teacher.subject}) - Already Marked Arrival`;
                                        qrScanFeedbackTeacher.classList.add('text-red-600');
                                    }
                                    console.log(`Arrival already marked for ${teacher.name} today.`);
                                    await addAuditLog(userEmail, 'Teacher QR Attendance Duplicate Arrival', 'Teacher Attendance', `Duplicate QR scan for ${teacher.name} (ID: ${teacherId}) - Arrival`);
                                } else {
                                    const { error: updateError } = await supabase.from('teacher_attendance').update({ arrival_time: currentTime, status: 'Present' }).eq('id', existingRecord.id);
                                    if (updateError) throw updateError;
                                    if (qrScanFeedbackTeacher) {
                                        qrScanFeedbackTeacher.textContent = `${teacher.name} (Subject: ${teacher.subject}) - Arrival Marked`;
                                        qrScanFeedbackTeacher.classList.add('text-green-600');
                                    }
                                    console.log(`Arrival marked for ${teacher.name}.`);

                                    // Speak welcome/goodbye message
                                    const welcomeMessage = type === 'arrival'
                                        ? `Welcome to TPS, ${teacher.name}`
                                        : `Goodbye from TPS, ${teacher.name}`;
                                    window.speechSynthesis.cancel();
                                    const utterance = new SpeechSynthesisUtterance(welcomeMessage);
                                    utterance.lang = 'en-US';
                                    utterance.pitch = 1;
                                    utterance.rate = 1;
                                    window.speechSynthesis.speak(utterance);


                                    await addAuditLog(userEmail, 'Teacher QR Attendance Arrival', 'Teacher Attendance', `Marked Arrival for ${teacher.name} (ID: ${teacherId}) via QR scan`);
                                }
                            } else if (type === 'departure') {
                                if (existingRecord.departure_time) {
                                    if (qrScanFeedbackTeacher) {
                                        qrScanFeedbackTeacher.textContent = `${teacher.name} (Subject: ${teacher.subject}) - Already Marked Departure`;
                                        qrScanFeedbackTeacher.classList.add('text-red-600');
                                    }
                                    console.log(`Departure already marked for ${teacher.name} today.`);
                                    await addAuditLog(userEmail, 'Teacher QR Attendance Duplicate Departure', 'Teacher Attendance', `Duplicate QR scan for ${teacher.name} (ID: ${teacherId}) - Departure`);
                                } else {
                                    const { error: updateError } = await supabase.from('teacher_attendance').update({ departure_time: currentTime }).eq('id', existingRecord.id);
                                    if (updateError) throw updateError;
                                    if (qrScanFeedbackTeacher) {
                                        qrScanFeedbackTeacher.textContent = `${teacher.name} (Subject: ${teacher.subject}) - Departure Marked`;
                                        qrScanFeedbackTeacher.classList.add('text-green-600');
                                    }
                                    console.log(`Departure marked for ${teacher.name}.`)
                                     // Speak welcome/goodbye message
                            const welcomeMessage = type === 'arrival'
                                ? `Welcome to TPS, ${teacher.name}`
                                : `Goodbye from TPS, ${teacher.name}`;
                            window.speechSynthesis.cancel();
                            const utterance = new SpeechSynthesisUtterance(welcomeMessage);
                            utterance.lang = 'en-US';
                            utterance.pitch = 1;
                            utterance.rate = 1;
                            window.speechSynthesis.speak(utterance);

                                    await addAuditLog(userEmail, 'Teacher QR Attendance Departure', 'Teacher Attendance', `Marked Departure for ${teacher.name} (ID: ${teacherId}) via QR scan`);
                                }
                            }
                        } else {
                            if (type === 'arrival') {
                                const { error: insertError } = await supabase.from('teacher_attendance').insert([
                                    {
                                        teacher_id: teacherId,
                                        date: today,
                                        status: 'Present',
                                        arrival_time: currentTime,
                                        remarks: 'QR Scan'
                                    }
                                ]);
                                if (insertError) throw insertError;
                                if (qrScanFeedbackTeacher) {
                                    qrScanFeedbackTeacher.textContent = `${teacher.name} (Subject: ${teacher.subject}) - Arrival Marked`;
                                    qrScanFeedbackTeacher.classList.add('text-green-600');
                                }
                                console.log(`Arrival marked for ${teacher.name}.`);

                                // Speak welcome/goodbye message
                                const welcomeMessage = type === 'arrival'
                                    ? `Welcome to TPS, ${teacher.name}`
                                    : `Goodbye from TPS, ${teacher.name}`;
                                window.speechSynthesis.cancel();
                                const utterance = new SpeechSynthesisUtterance(welcomeMessage);
                                utterance.lang = 'en-US';
                                utterance.pitch = 1;
                                utterance.rate = 1;
                                window.speechSynthesis.speak(utterance);

                                await addAuditLog(userEmail, 'Teacher QR Attendance Marked', 'Teacher Attendance', `Marked Arrival for ${teacher.name} (ID: ${teacherId}) via QR scan`);
                            } else {
                                if (qrScanFeedbackTeacher) {
                                    qrScanFeedbackTeacher.textContent = `${teacher.name} (Subject: ${teacher.subject}) - Please mark arrival first.`;
                                    qrScanFeedbackTeacher.classList.add('text-red-600');
                                }
                                console.warn(`Attempted to mark departure before arrival for ${teacher.name}.`);
                                await addAuditLog(userEmail, 'Teacher QR Scan Error', 'Teacher Attendance', `Attempted to mark departure before arrival for ${teacher.name} (ID: ${teacherId})`);
                            }
                        }
                        await fetchTeacherAttendanceRecords(); // Refresh attendance data
                    } catch (error) {
                        if (qrScanFeedbackTeacher) {
                            qrScanFeedbackTeacher.textContent = `Error for ${teacher.name}: ${error.message}`;
                            qrScanFeedbackTeacher.classList.add('text-red-600');
                        }
                        console.error('Supabase error marking teacher attendance via QR:', error);
                        await addAuditLog(userEmail, 'Teacher QR Attendance Failed', 'Teacher Attendance', `Error marking attendance for ${teacher.name} (ID: ${teacherId}): ${error.message}`);
                    }
                } else {
                    if (qrScanFeedbackTeacher) {
                        qrScanFeedbackTeacher.textContent = `Teacher not found for this QR code: ${teacherId}`;
                        qrScanFeedbackTeacher.classList.add('text-red-600');
                    }
                    console.warn(`Teacher not found for QR code: ${teacherId}`);
                    await addAuditLog('QR Scanner', 'QR Scan Failed', 'Teacher Attendance', `Teacher not found for QR code: ${teacherId}`);
                }
            } else {
                if (qrScanFeedbackTeacher) {
                    qrScanFeedbackTeacher.textContent = `Invalid QR code format: ${decodedText}`;
                    qrScanFeedbackTeacher.classList.add('text-red-600');
                }
                console.warn(`Invalid QR code format: ${decodedText}`);
                await addAuditLog('QR Scanner', 'QR Scan Failed', 'Teacher Attendance', `Invalid QR code format: ${decodedText}`);
            }
        },
        (errorMessage) => {
            // console.warn(`Teacher QR Code scan error: ${errorMessage}`); // Too verbose for console
        }
    );
    console.log(`Teacher QR attendance scanner started for ${type}.`);
};

// Stop Teacher QR Attendance Scanning
window.stopTeacherQrAttendance = async function() {
    if (html5QrCodeScannerTeacher && html5QrCodeScannerTeacher.isScanning) {
        try {
            await html5QrCodeScannerTeacher.stop();
            console.log('Teacher QR attendance scanner stopped.');
        } catch (err) {
            console.error('Error stopping teacher QR scanner:', err);
        } finally {
            if (teacherQrScannerSection) {
                teacherQrScannerSection.classList.add('hidden');
            }
            if (teacherQrVideo) {
                teacherQrVideo.innerHTML = '';
            }
            if (qrScanFeedbackTeacher) {
                qrScanFeedbackTeacher.innerHTML = '';
                qrScanFeedbackTeacher.classList.remove('text-green-600', 'text-red-600');
            }
            html5QrCodeScannerTeacher = null; // Clear the instance
        }
    }
};

// Function to handle successful QR scan for teachers
async function onScanSuccessTeacher(decodedText, decodedResult) {
    console.log(`Teacher QR Code scanned: ${decodedText}`);
    playBeep(); // Play beep sound on successful scan

    if (qrScanFeedbackTeacher) {
        qrScanFeedbackTeacher.classList.remove('text-green-600', 'text-red-600'); // Reset color
        qrScanFeedbackTeacher.textContent = 'Processing...'; // Initial feedback
    }

    if (decodedText.startsWith('teacher_attendance:')) {
        const teacherId = decodedText.split(':')[1];
        const teacher = teachers.find(t => t.id === teacherId);
        if (teacher) {
            const today = new Date().toISOString().split('T')[0];
            const currentTime = new Date().toTimeString().split(' ')[0];
            const loggedInUser  = JSON.parse(localStorage.getItem('loggedInUser '));
            const userEmail = loggedInUser ?.email || 'QR Scanner';

            try {
                // Check if an attendance record already exists for today
                const { data: existingRecords, error: fetchError } = await supabase
                    .from('teacher_attendance')
                    .select('*')
                    .eq('teacher_id', teacherId)
                    .eq('date', today);

                if (fetchError) throw fetchError;

                if (existingRecords && existingRecords.length > 0) {
                    const existingRecord = existingRecords[0];
                    if (existingRecord.status === 'Present') {
                        if (qrScanFeedbackTeacher) {
                            qrScanFeedbackTeacher.textContent = `${teacher.name} (Subject: ${teacher.subject}) - Arrival Already Marked`;
                            qrScanFeedbackTeacher.classList.add('text-red-600');
                        }
                        console.log(`Arrival already marked for ${teacher.name} today.`);
                        await addAuditLog(userEmail, 'Teacher QR Attendance Duplicate Arrival', 'Teacher Attendance', `Duplicate QR scan for ${teacher.name} (ID: ${teacherId}) - Arrival`);
                    } else {
                        const { error: updateError } = await supabase.from('teacher_attendance').update({ arrival_time: currentTime, status: 'Present' }).eq('id', existingRecord.id);
                        if (updateError) throw updateError;
                        if (qrScanFeedbackTeacher) {
                            qrScanFeedbackTeacher.textContent = `${teacher.name} (Subject: ${teacher.subject}) - Arrival Marked`;
                            qrScanFeedbackTeacher.classList.add('text-green-600');
                        }
                        console.log(`Arrival marked for ${teacher.name}.`);
                        // Speak welcome/goodbye message
                        const welcomeMessage = type === 'arrival'
                            ? `Welcome to TPS, ${teacher.name}`
                            : `Goodbye from TPS, ${teacher.name}`;
                        window.speechSynthesis.cancel();
                        const utterance = new SpeechSynthesisUtterance(welcomeMessage);
                        utterance.lang = 'en-US';
                        utterance.pitch = 1;
                        utterance.rate = 1;
                        window.speechSynthesis.speak(utterance);

                        await addAuditLog(userEmail, 'Teacher QR Attendance Arrival', 'Teacher Attendance', `Marked Arrival for ${teacher.name} (ID: ${teacherId}) via QR scan`);
                    }
                } else {
                    // Create new attendance record for arrival
                    const { error: insertError } = await supabase.from('teacher_attendance').insert([
                        {
                            teacher_id: teacherId,
                            date: today,
                            status: 'Present',
                            arrival_time: currentTime,
                            remarks: 'QR Scan'
                        }
                    ]);
                    if (insertError) throw insertError;
                    if (qrScanFeedbackTeacher) {
                        qrScanFeedbackTeacher.textContent = `${teacher.name} (Subject: ${teacher.subject}) - Arrival Marked`;
                        qrScanFeedbackTeacher.classList.add('text-green-600');
                    }
                    console.log(`Arrival marked for ${teacher.name}.`);
                    // Speak welcome/goodbye message
                    const welcomeMessage = type === 'arrival'
                        ? `Welcome to TPS, ${teacher.name}`
                        : `Goodbye from TPS, ${teacher.name}`;
                    window.speechSynthesis.cancel();
                    const utterance = new SpeechSynthesisUtterance(welcomeMessage);
                    utterance.lang = 'en-US';
                    utterance.pitch = 1;
                    utterance.rate = 1;
                    window.speechSynthesis.speak(utterance);

                    await addAuditLog(userEmail, 'Teacher QR Attendance Marked', 'Teacher Attendance', `Marked Arrival for ${teacher.name} (ID: ${teacherId}) via QR scan`);
                }
                await fetchTeacherAttendanceRecords(); // Refresh attendance data
            } catch (error) {
                if (qrScanFeedbackTeacher) {
                    qrScanFeedbackTeacher.textContent = `Error for ${teacher.name}: ${error.message}`;
                    qrScanFeedbackTeacher.classList.add('text-red-600');
                }
                console.error('Supabase error marking teacher attendance via QR:', error);
                await addAuditLog(userEmail, 'Teacher QR Attendance Failed', 'Teacher Attendance', `Error marking attendance for ${teacher.name} (ID: ${teacherId}): ${error.message}`);
            }
        } else {
            if (qrScanFeedbackTeacher) {
                qrScanFeedbackTeacher.textContent = `Teacher not found for this QR code: ${teacherId}`;
                qrScanFeedbackTeacher.classList.add('text-red-600');
            }
            console.warn(`Teacher not found for QR code: ${teacherId}`);
            await addAuditLog('QR Scanner', 'QR Scan Failed', 'Teacher Attendance', `Teacher not found for QR code: ${teacherId}`);
        }
    } else {
        if (qrScanFeedbackTeacher) {
            qrScanFeedbackTeacher.textContent = `Invalid QR code format: ${decodedText}`;
            qrScanFeedbackTeacher.classList.add('text-red-600');
        }
        console.warn(`Invalid QR code format: ${decodedText}`);
        await addAuditLog('QR Scanner', 'QR Scan Failed', 'Teacher Attendance', `Invalid QR code format: ${decodedText}`);
    }
}

// Function to handle errors during QR scanning for teachers
function onScanErrorTeacher(errorMessage) {
    // console.warn(`Teacher QR Code scan error: ${errorMessage}`); // Too verbose for console
}

// Initialize the application
document.addEventListener('DOMContentLoaded', async () => {
    await loadAllData(); // Load all data on initial load
    updateDashboardStats(); // Update dashboard stats after data load
    initCharts(); // Initialize charts after data load
});


/* ========================
   SAFE PATCH: Face Recognition & Missing Globals (appended by fixer)
   ======================== */
(function(){
  // Avoid re-applying the patch
  if (window.__FR_PATCH_APPLIED__) return;
  window.__FR_PATCH_APPLIED__ = true;

  // Supabase client must exist
  if (typeof supabase === 'undefined') {
    console.error('Supabase client not found. Ensure Supabase is initialized before this patch.');
    return;
  }

  // Missing globals
  window.teacherFaceRecognitionStream = window.teacherFaceRecognitionStream || null;
  window.teacherFacePlayHandlerRef = window.teacherFacePlayHandlerRef || null;
  window.detectionInterval = window.detectionInterval || null;

  // Element getters (safe)
  const $ = (id) => document.getElementById(id);
  const videoEl = $('teacherFaceRecognitionVideo');
  const canvasEl = $('teacherFaceRecognitionCanvas');
  const feedbackEl = $('teacherFaceRecognitionFeedback');

  // Provide loadFaceApiModels if not defined
  if (typeof window.loadFaceApiModels !== 'function') {
    window.loadFaceApiModels = async function loadFaceApiModels() {
      if (window.__FR_MODELS_LOADED__) return;
      const modelsPath = '/models'; // change if needed
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(modelsPath),
        faceapi.nets.faceLandmark68Net.loadFromUri(modelsPath),
        faceapi.nets.faceRecognitionNet.loadFromUri(modelsPath)
      ]);
      window.__FR_MODELS_LOADED__ = true;
    };
  }

  // Unified recognizeTeacher using teacher_faces table where descriptor is stored as JSON array
  async function recognizeTeacher(descriptor) {
    try {
      const { data: teacherFaces, error } = await supabase
        .from('teacher_faces')
        .select('teacher_id, descriptor');

      if (error) {
        console.error('Supabase error loading teacher_faces:', error);
        return null;
      }
      if (!Array.isArray(teacherFaces) || teacherFaces.length === 0) return null;

      let bestId = null, bestDist = Infinity;
      for (const row of teacherFaces) {
        let stored = row.descriptor;
        // descriptor might be JSON string or array
        if (typeof stored === 'string') {
          try { stored = JSON.parse(stored); } catch {}
        }
        const a = new Float32Array(stored);
        const dist = faceapi.euclideanDistance(a, descriptor);
        if (dist < bestDist) {
          bestDist = dist;
          bestId = row.teacher_id;
        }
      }
      return (bestDist < 0.6) ? bestId : null;
    } catch (e) {
      console.error('recognizeTeacher failed:', e);
      return null;
    }
  }

  // Robust markTeacherAttendance
  async function markTeacherAttendance(teacherUuid, method) {
    const today = new Date().toISOString().split('T')[0];
    const currentTime = new Date().toTimeString().split(' ')[0];
    const loggedInUser = (()=>{ try { return JSON.parse(localStorage.getItem('loggedInUser')); } catch(e){ return null; } })();
    const userEmail = (loggedInUser && loggedInUser.email) ? loggedInUser.email : 'Face Recognition System';

    try {
      const { data: existing, error: selErr } = await supabase
        .from('teacher_attendance')
        .select('*')
        .eq('teacher_id', teacherUuid)
        .eq('date', today);

      if (selErr) {
        console.error('Attendance select error:', selErr);
        try { await addAuditLog(userEmail, 'Error Fetching Attendance', 'Teacher Attendance', selErr.message || 'error'); } catch {}
        return;
      }

      if (Array.isArray(existing) && existing.length > 0) {
        const rec = existing[0];
        if (rec.arrival_time) {
          if (feedbackEl) feedbackEl.textContent = `Arrival already marked for ${teacherUuid}.`;
          try { await addAuditLog(userEmail, 'Duplicate Arrival', 'Teacher Attendance', `Teacher ${teacherUuid}`); } catch {}
        } else {
          const { error: updErr } = await supabase
            .from('teacher_attendance')
            .update({ arrival_time: currentTime, status: 'Present' })
            .eq('id', rec.id);
          if (updErr) {
            console.error('Attendance update error:', updErr);
            if (feedbackEl) feedbackEl.textContent = 'Failed to update attendance.';
            return;
          }
          if (feedbackEl) feedbackEl.textContent = `Arrival marked for ${teacherUuid}.`;
        }
      } else {
        const { error: insErr } = await supabase
          .from('teacher_attendance')
          .insert([{ teacher_id: teacherUuid, date: today, status: 'Present', arrival_time: currentTime, remarks: method || 'Face Recognition' }]);
        if (insErr) {
          console.error('Attendance insert error:', insErr);
          if (feedbackEl) feedbackEl.textContent = 'Failed to mark attendance.';
          return;
        }
        if (feedbackEl) feedbackEl.textContent = `Attendance marked for ${teacherUuid}.`;
      }
    } catch (e) {
      console.error('markTeacherAttendance exception:', e);
      if (feedbackEl) feedbackEl.textContent = `Error: ${e.message}`;
    }
  }

  // Unified initFaceRecognition that overrides earlier duplicates
  async function initFaceRecognition() {
    if (!videoEl || !canvasEl || !feedbackEl) {
      console.warn('Face recognition UI elements missing; skipping init.');
      return;
    }
    try {
      feedbackEl.textContent = 'Loading models...';
      await window.loadFaceApiModels();
      if (window.teacherFaceRecognitionStream) {
        window.teacherFaceRecognitionStream.getTracks().forEach(t => t.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 }, audio: false });
      window.teacherFaceRecognitionStream = stream;
      videoEl.srcObject = stream;
      await videoEl.play();

      const displaySize = { width: videoEl.videoWidth || 640, height: videoEl.videoHeight || 480 };
      canvasEl.width = displaySize.width; canvasEl.height = displaySize.height;
      faceapi.matchDimensions(canvasEl, displaySize);
      feedbackEl.textContent = 'Detecting faces...';

      const detect = async () => {
        if (!window.teacherFaceRecognitionStream) return;
        try {
          const detections = await faceapi
            .detectAllFaces(videoEl, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks()
            .withFaceDescriptors();
          const resized = faceapi.resizeResults(detections, displaySize);
          const ctx = canvasEl.getContext('2d');
          ctx.clearRect(0,0,canvasEl.width, canvasEl.height);
          faceapi.draw.drawDetections(canvasEl, resized);
          faceapi.draw.drawFaceLandmarks(canvasEl, resized);

          if (detections.length > 0) {
            feedbackEl.textContent = `Face detected (${detections.length}). Recognizing...`;
            const teacherId = await recognizeTeacher(detections[0].descriptor);
            if (teacherId) {
              await markTeacherAttendance(teacherId, 'Face Recognition');
            } else {
              feedbackEl.textContent = 'No matching teacher found.';
            }
          } else {
            feedbackEl.textContent = 'No face detected. Look at the camera.';
          }
          window.requestAnimationFrame(detect);
        } catch (err) {
          console.error('Detection loop error:', err);
          feedbackEl.textContent = 'Detection error.';
          window.requestAnimationFrame(detect);
        }
      };
      window.requestAnimationFrame(detect);
    } catch (err) {
      console.error('initFaceRecognition error:', err);
      feedbackEl.textContent = (err && err.message) ? err.message : 'Camera error';
    }
  }

  function stopFaceRecognition() {
    if (window.teacherFaceRecognitionStream) {
      window.teacherFaceRecognitionStream.getTracks().forEach(t => t.stop());
      window.teacherFaceRecognitionStream = null;
    }
    if (videoEl) videoEl.srcObject = null;
    if (canvasEl) {
      const ctx = canvasEl.getContext('2d');
      ctx && ctx.clearRect(0,0,canvasEl.width, canvasEl.height);
    }
    if (feedbackEl) feedbackEl.textContent = 'Stopped';
  }

  // Expose overrides globally to overshadow duplicates defined earlier
  window.initFaceRecognition = initFaceRecognition;
  window.stopFaceRecognition = stopFaceRecognition;

  // Wire buttons if present
  document.addEventListener('DOMContentLoaded', () => {
    const startBtn = $('startRecognition');
    const stopBtn = $('stopRecognition');
    if (startBtn) startBtn.addEventListener('click', initFaceRecognition);
    if (stopBtn) stopBtn.addEventListener('click', stopFaceRecognition);
  });
})();
