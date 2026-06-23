# EMS - Employee Management System

A modern, full-featured Employee Management System (EMS) designed to streamline organizational workflows. Built on the MERN stack (MongoDB, Express, React, Node.js), this platform offers a sleek, responsive design and robust modules to simplify human resources and project tracking.

---

## 🌟 Key Features

* **Role-Based Access Control (RBAC)**: Distinct, secure dashboard layouts and options customized for system admins, employers, and employees.
* **Attendance & Time Tracking**: Seamless clock-in/out functionality with visual daily and monthly logs.
* **Leave Management**: Intuitive portal for requesting leaves (Sick, Casual, Annual) with real-time manager approvals.
* **Payroll & Payslip Generator**: Automatic monthly salary calculations, dynamic PDF payslip downloads, and payroll registers exportable to Excel.
* **Task Delegation**: A Kanban-style interface to assign, track, and update project tasks with live notifications.
* **Real-time Notifications**: Instant updates via Socket.io for notifications when tasks are assigned or leaves are processed.
* **Interactive Dashboards**: Data visualization using clean charts to track department counts, employee growth, and task completion.
* **Modern Interface**: Designed using Material-UI with support for beautiful dark and light themes.

---

## 👥 User Roles & Portals

### 🛡️ Super Admin
* System-wide configuration.
* High-level analytics and organization oversight.
* Management of employer credentials and system status.

### 💼 Employer (HR / Manager)
* Complete employee directory management.
* Salary settings, bonus declarations, and payroll generation.
* Real-time leave approvals and task assignments.
* Department structure setup and auditing logs.

### 👤 Employee
* Quick check-in / check-out controls.
* Personal attendance records calendar.
* Simple leave application forms.
* Personal payslip downloads (PDF format).
* Task board showing assigned work items and completion status.

---

## 💻 Tech Stack Highlights

* **Frontend**: React (Vite), Redux Toolkit, React Router DOM, Material-UI, Chart.js, Socket.io-client.
* **Backend**: Node.js, Express.js, MongoDB (Mongoose), JWT, Socket.io, PDFKit, ExcelJS, Nodemailer.
