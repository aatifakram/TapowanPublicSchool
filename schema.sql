-- School Management System SQL Schema (MySQL 8+ compatible)
-- Run in your SQL client: source schema.sql

DROP DATABASE IF EXISTS school_management;
CREATE DATABASE school_management;
USE school_management;

CREATE TABLE roles (
  role_id INT PRIMARY KEY AUTO_INCREMENT,
  role_name VARCHAR(50) NOT NULL UNIQUE,
  description VARCHAR(255)
);

CREATE TABLE users (
  user_id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) NOT NULL UNIQUE,
  full_name VARCHAR(120) NOT NULL,
  email VARCHAR(120) UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role_id INT NOT NULL,
  status ENUM('Active', 'Inactive') DEFAULT 'Active',
  last_login DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (role_id) REFERENCES roles(role_id)
);

CREATE TABLE academic_years (
  year_id INT PRIMARY KEY AUTO_INCREMENT,
  year_name VARCHAR(20) NOT NULL UNIQUE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_current BOOLEAN DEFAULT FALSE
);

CREATE TABLE classes (
  class_id INT PRIMARY KEY AUTO_INCREMENT,
  class_name VARCHAR(20) NOT NULL,
  section VARCHAR(10) NOT NULL,
  room_no VARCHAR(20),
  capacity INT DEFAULT 40,
  UNIQUE (class_name, section)
);

CREATE TABLE students (
  student_id INT PRIMARY KEY AUTO_INCREMENT,
  admission_no VARCHAR(40) NOT NULL UNIQUE,
  full_name VARCHAR(120) NOT NULL,
  gender ENUM('Male','Female','Other') NOT NULL,
  date_of_birth DATE NOT NULL,
  class_id INT NOT NULL,
  parent_name VARCHAR(120),
  parent_phone VARCHAR(20),
  address TEXT,
  admission_date DATE NOT NULL,
  status ENUM('Active','Graduated','Transferred','Dropped') DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (class_id) REFERENCES classes(class_id)
);

CREATE TABLE departments (
  department_id INT PRIMARY KEY AUTO_INCREMENT,
  department_name VARCHAR(80) NOT NULL UNIQUE
);

CREATE TABLE teachers (
  teacher_id INT PRIMARY KEY AUTO_INCREMENT,
  employee_no VARCHAR(40) NOT NULL UNIQUE,
  full_name VARCHAR(120) NOT NULL,
  department_id INT,
  qualification VARCHAR(100),
  phone VARCHAR(20),
  email VARCHAR(120),
  join_date DATE,
  base_salary DECIMAL(12,2) DEFAULT 0,
  status ENUM('Active','Inactive') DEFAULT 'Active',
  FOREIGN KEY (department_id) REFERENCES departments(department_id)
);

CREATE TABLE subjects (
  subject_id INT PRIMARY KEY AUTO_INCREMENT,
  subject_code VARCHAR(20) NOT NULL UNIQUE,
  subject_name VARCHAR(100) NOT NULL,
  credits INT DEFAULT 1
);

CREATE TABLE class_subjects (
  class_subject_id INT PRIMARY KEY AUTO_INCREMENT,
  class_id INT NOT NULL,
  subject_id INT NOT NULL,
  teacher_id INT,
  FOREIGN KEY (class_id) REFERENCES classes(class_id),
  FOREIGN KEY (subject_id) REFERENCES subjects(subject_id),
  FOREIGN KEY (teacher_id) REFERENCES teachers(teacher_id),
  UNIQUE (class_id, subject_id)
);

CREATE TABLE attendance (
  attendance_id INT PRIMARY KEY AUTO_INCREMENT,
  attendance_date DATE NOT NULL,
  student_id INT NOT NULL,
  class_id INT NOT NULL,
  status ENUM('Present','Absent','Late','Leave') NOT NULL,
  remarks VARCHAR(255),
  FOREIGN KEY (student_id) REFERENCES students(student_id),
  FOREIGN KEY (class_id) REFERENCES classes(class_id),
  UNIQUE (attendance_date, student_id)
);

CREATE TABLE exams (
  exam_id INT PRIMARY KEY AUTO_INCREMENT,
  exam_name VARCHAR(80) NOT NULL,
  class_id INT NOT NULL,
  exam_date DATE NOT NULL,
  term VARCHAR(30),
  year_id INT,
  FOREIGN KEY (class_id) REFERENCES classes(class_id),
  FOREIGN KEY (year_id) REFERENCES academic_years(year_id)
);

CREATE TABLE exam_results (
  result_id INT PRIMARY KEY AUTO_INCREMENT,
  exam_id INT NOT NULL,
  student_id INT NOT NULL,
  subject_id INT NOT NULL,
  marks_obtained DECIMAL(6,2) NOT NULL,
  max_marks DECIMAL(6,2) NOT NULL,
  grade VARCHAR(5),
  FOREIGN KEY (exam_id) REFERENCES exams(exam_id),
  FOREIGN KEY (student_id) REFERENCES students(student_id),
  FOREIGN KEY (subject_id) REFERENCES subjects(subject_id),
  UNIQUE (exam_id, student_id, subject_id)
);

CREATE TABLE fee_structures (
  fee_structure_id INT PRIMARY KEY AUTO_INCREMENT,
  class_id INT NOT NULL,
  term VARCHAR(20) NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  FOREIGN KEY (class_id) REFERENCES classes(class_id),
  UNIQUE (class_id, term)
);

CREATE TABLE fee_payments (
  payment_id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  term VARCHAR(20) NOT NULL,
  monthly_fee DECIMAL(12,2) NOT NULL DEFAULT 0,
  selected_book_ids TEXT DEFAULT NULL,
  total_fee DECIMAL(12,2) NOT NULL,
  paid_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  balance DECIMAL(12,2) NOT NULL DEFAULT 0,
  payment_date DATE,
  payment_mode ENUM('Cash','Card','UPI','Bank Transfer') DEFAULT 'Cash',
  status ENUM('Paid','Partial','Pending') DEFAULT 'Pending',
  FOREIGN KEY (student_id) REFERENCES students(student_id)
);

CREATE TABLE books (
  book_id INT PRIMARY KEY AUTO_INCREMENT,
  book_code VARCHAR(30) NOT NULL UNIQUE,
  title VARCHAR(150) NOT NULL,
  author VARCHAR(120),
  isbn VARCHAR(30),
  total_copies INT DEFAULT 1,
  available_copies INT DEFAULT 1
);

CREATE TABLE book_issues (
  issue_id INT PRIMARY KEY AUTO_INCREMENT,
  book_id INT NOT NULL,
  student_id INT NOT NULL,
  issue_date DATE NOT NULL,
  due_date DATE NOT NULL,
  return_date DATE,
  status ENUM('Issued','Returned','Overdue') DEFAULT 'Issued',
  FOREIGN KEY (book_id) REFERENCES books(book_id),
  FOREIGN KEY (student_id) REFERENCES students(student_id)
);

CREATE TABLE transport_routes (
  route_id INT PRIMARY KEY AUTO_INCREMENT,
  route_name VARCHAR(80) NOT NULL UNIQUE,
  vehicle_no VARCHAR(30) NOT NULL UNIQUE,
  driver_name VARCHAR(120),
  monthly_fee DECIMAL(10,2) DEFAULT 0
);

CREATE TABLE transport_allocations (
  allocation_id INT PRIMARY KEY AUTO_INCREMENT,
  route_id INT NOT NULL,
  student_id INT NOT NULL,
  pickup_point VARCHAR(120),
  FOREIGN KEY (route_id) REFERENCES transport_routes(route_id),
  FOREIGN KEY (student_id) REFERENCES students(student_id),
  UNIQUE (route_id, student_id)
);

CREATE TABLE hostels (
  hostel_id INT PRIMARY KEY AUTO_INCREMENT,
  hostel_name VARCHAR(80) NOT NULL UNIQUE,
  warden_name VARCHAR(120)
);

CREATE TABLE hostel_rooms (
  room_id INT PRIMARY KEY AUTO_INCREMENT,
  hostel_id INT NOT NULL,
  room_no VARCHAR(20) NOT NULL,
  bed_count INT DEFAULT 1,
  FOREIGN KEY (hostel_id) REFERENCES hostels(hostel_id),
  UNIQUE (hostel_id, room_no)
);

CREATE TABLE hostel_allocations (
  hostel_allocation_id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  room_id INT NOT NULL,
  bed_no VARCHAR(10),
  check_in_date DATE NOT NULL,
  check_out_date DATE,
  status ENUM('Active','Inactive') DEFAULT 'Active',
  FOREIGN KEY (student_id) REFERENCES students(student_id),
  FOREIGN KEY (room_id) REFERENCES hostel_rooms(room_id),
  UNIQUE (student_id, status)
);

CREATE TABLE payroll (
  payroll_id INT PRIMARY KEY AUTO_INCREMENT,
  teacher_id INT NOT NULL,
  salary_month CHAR(7) NOT NULL,
  basic_salary DECIMAL(12,2) NOT NULL,
  allowances DECIMAL(12,2) DEFAULT 0,
  deductions DECIMAL(12,2) DEFAULT 0,
  net_pay DECIMAL(12,2) NOT NULL,
  payment_date DATE,
  FOREIGN KEY (teacher_id) REFERENCES teachers(teacher_id),
  UNIQUE (teacher_id, salary_month)
);

CREATE TABLE timetable (
  timetable_id INT PRIMARY KEY AUTO_INCREMENT,
  class_id INT NOT NULL,
  day_name ENUM('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday') NOT NULL,
  period_no INT NOT NULL,
  subject_id INT NOT NULL,
  teacher_id INT NOT NULL,
  room_no VARCHAR(20),
  FOREIGN KEY (class_id) REFERENCES classes(class_id),
  FOREIGN KEY (subject_id) REFERENCES subjects(subject_id),
  FOREIGN KEY (teacher_id) REFERENCES teachers(teacher_id),
  UNIQUE (class_id, day_name, period_no)
);

-- Seed data
INSERT INTO roles (role_name, description) VALUES
('Administrator', 'Full system access'),
('Principal', 'Academic and administrative oversight'),
('Teacher', 'Classroom and marks management'),
('Accountant', 'Fee and payroll operations');

INSERT INTO users (username, full_name, email, password_hash, role_id, status)
VALUES ('admin', 'System Administrator', 'admin@school.com', 'change_me_hash', 1, 'Active');

INSERT INTO departments (department_name) VALUES ('Science'), ('Mathematics'), ('Languages');

INSERT INTO classes (class_name, section, room_no, capacity) VALUES
('10', 'A', '204', 40),
('9', 'B', '103', 40);

INSERT INTO teachers (employee_no, full_name, department_id, qualification, phone, email, join_date, base_salary)
VALUES
('EMP100', 'Neha Verma', 1, 'M.Sc', '9900112233', 'neha@school.com', '2018-06-10', 42000),
('EMP101', 'Amit Kumar', 2, 'M.Ed', '9900112244', 'amit@school.com', '2019-01-05', 40000);

INSERT INTO subjects (subject_code, subject_name, credits) VALUES
('MAT10', 'Mathematics', 5),
('SCI10', 'Science', 5),
('ENG10', 'English', 4);

INSERT INTO students (admission_no, full_name, gender, date_of_birth, class_id, parent_name, parent_phone, address, admission_date)
VALUES
('ADM001', 'Aarav Sharma', 'Male', '2010-03-12', 1, 'Rohit Sharma', '9876501234', 'Sector 5', '2023-04-01'),
('ADM002', 'Ananya Singh', 'Female', '2011-07-20', 2, 'Vikas Singh', '9823401234', 'Green Park', '2024-04-01');

INSERT INTO class_subjects (class_id, subject_id, teacher_id) VALUES
(1, 1, 2),
(1, 2, 1);
