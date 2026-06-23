# Complete MERN Employee Management System

A production-ready Employee Management System built using the MERN stack (MongoDB, Express, React, Node.js) with JWT authentication, Role-Based Access Control (RBAC), real-time notifications via Socket.io, Material-UI dashboards, leave management, attendance tracking, and payroll processing with PDF/Excel generation.

---

## 📖 Simple Codebase Explanation

This application is split into two main sections: **Frontend (Client)** and **Backend (Server)**. 

### 1. The Backend (`backend/`)
The backend is a RESTful API built on **Node.js** and **Express.js** that communicates with a **MongoDB** database (using **Mongoose** as an ORM).
* **`server.js`**: The entry point of the server. It connects to MongoDB, starts the HTTP & Socket.io servers, configures security middlewares (cors, helmet, express-rate-limit), registers the API routes, and seeds the default Super Admin user (`admin@company.com` / `admin123`) on startup if the database is empty.
* **`routes/`**: Defines the endpoint paths and determines which Controller function handles them. It also applies middleware for authentication and authorization.
* **`middleware/`**:
  * `auth.js`: Verifies JWT tokens and checks if the logged-in user has the required roles (e.g., `Super Admin`, `Employer`, `Employee`).
  * `upload.js`: Uses Multer to handle profile image uploads.
  * `error.js`: Global error handler to catch and return unified error formats.
* **`controllers/`**: Contains the core business logic (e.g., how payroll is calculated, how attendance checks in/out work, etc.).
* **`models/`**: Defines the structure of the database collections (Schemas) for MongoDB (Users, Employees, Departments, Attendance, Leaves, Tasks, Payrolls, Notifications, and AuditLogs).
* **`socket/`**: Handles real-time, bi-directional events (like sending notification counts immediately when a manager approves a leave or assigns a task).

### 2. The Frontend (`frontend/`)
The frontend is a single-page application (SPA) built with **React** (bundled using **Vite**).
* **`src/App.jsx`**: Configures the app-wide **Material-UI (MUI)** theme (with light/dark mode support) and manages page navigation routing via **React Router DOM**.
* **`src/services/api.js`**: An Axios-based API client helper. It automatically intercepts outgoing requests to attach the logged-in user's JWT authorization token and handles response errors (redirecting to `/login` if a token expires).
* **`src/pages/`**: Organized by user roles:
  * **Admin**: High-level system settings, employer management.
  * **Employer (HR/Manager)**: Manages employees, departments, leave approvals, task assignments, and payroll generation.
  * **Employee**: Dashboard, clock-in/out attendance, leave requests, tasks board, and payslips view.
  * **Common**: Account profile updating.

---

## 🛠️ Technology Stack & Libraries Used

### Backend Dependencies
* **`express`**: Fast, unopinionated minimalist web framework for Node.js routing.
* **`mongoose`**: MongoDB object modeling tool designed to work in an asynchronous environment.
* **`jsonwebtoken`**: Generates and verifies JSON Web Tokens (JWT) for secure authentication.
* **`bcryptjs`**: Hashes user passwords securely using salt hashing algorithms.
* **`cors`**: Middleware to enable Cross-Origin Resource Sharing.
* **`helmet`**: Secures HTTP headers to protect against common web vulnerabilities.
* **`express-rate-limit`**: Rate limiting middleware to prevent brute-force attacks and abuse.
* **`multer`**: Node.js middleware for parsing multi-part form data, primarily used for uploading profile images.
* **`socket.io`**: Enables real-time, bi-directional, event-based communication.
* **`pdfkit`**: A PDF generation library used to build downloadable payroll payslips on-the-fly.
* **`exceljs`**: Read, manipulate and write spreadsheet data to XLSX format, used for exporting payroll sheets.
* **`nodemailer`**: Sending emails for system alerts and credentials.
* **`dotenv`**: Loads environment variables from a `.env` file.
* **`nodemon` (Dev)**: Automatically restarts the node application on file changes.

### Frontend Dependencies
* **`react`** & **`react-dom`**: Core library for building declarative component-driven user interfaces.
* **`react-router-dom`**: Client-side routing library for single-page applications.
* **`@mui/material`**, **`@emotion/react`**, **`@emotion/styled`**: Material-UI (MUI) design system libraries for high-quality, pre-built, responsive UI components.
* **`@mui/icons-material`**: Icon set for UI representation.
* **`@reduxjs/toolkit`** & **`react-redux`**: Standard toolkit for predictable global state management (auth state, notifications, etc.).
* **`axios`**: Promise-based HTTP client for API communication.
* **`socket.io-client`**: Real-time Socket.io client to listen for real-time events on the frontend.
* **`chart.js`** & **`react-chartjs-2`**: Charts wrappers for visual dashboard data representation.
* **`react-hook-form`**: Flexible, extensible form validation.

---

## 🔌 API Endpoints Reference

All API endpoints are prefixed with `/api`.

### 🔐 Authentication (`/api/auth`)
| HTTP Method | Endpoint | Auth Required | Allowed Roles | Description |
| :--- | :--- | :--- | :--- | :--- |
| **POST** | `/auth/login` | No | All | Authenticates user and returns JWT token + user details |
| **POST** | `/auth/forgotpassword` | No | All | Generates a reset token and sends an email request |
| **PUT** | `/auth/resetpassword/:resettoken` | No | All | Resets the password using a valid reset token |
| **POST** | `/auth/register` | Yes | `Super Admin`, `Employer` | Registers a new user with optional profile image upload |
| **GET** | `/auth/me` | Yes | All | Returns currently authenticated user details |
| **PUT** | `/auth/updatedetails` | Yes | All | Updates name, email, or profile image of the logged-in user |
| **PUT** | `/auth/updatepassword` | Yes | All | Safely updates the logged-in user's password |

---

### 🏢 Department Management (`/api/departments`)
| HTTP Method | Endpoint | Auth Required | Allowed Roles | Description |
| :--- | :--- | :--- | :--- | :--- |
| **GET** | `/departments` | Yes | All | Lists all departments |
| **POST** | `/departments` | Yes | `Super Admin`, `Employer` | Creates a new department |
| **GET** | `/departments/:id` | Yes | All | Retrieves details of a specific department |
| **PUT** | `/departments/:id` | Yes | `Super Admin`, `Employer` | Updates department metadata |
| **DELETE** | `/departments/:id` | Yes | `Super Admin`, `Employer` | Deletes a department |

---

### 👥 Employee Management (`/api/employees`)
| HTTP Method | Endpoint | Auth Required | Allowed Roles | Description |
| :--- | :--- | :--- | :--- | :--- |
| **GET** | `/employees` | Yes | All | Lists all employee profiles |
| **POST** | `/employees` | Yes | `Super Admin`, `Employer` | Creates a new employee profile with system login credentials |
| **GET** | `/employees/employers` | Yes | `Super Admin` | Lists all employer profiles |
| **GET** | `/employees/:id` | Yes | All | Retrieves a single employee's profile details |
| **PUT** | `/employees/:id` | Yes | All | Updates employee profile (personal details, salary, etc.) |
| **DELETE** | `/employees/:id` | Yes | `Super Admin`, `Employer` | Soft/Hard deletes employee profile and user login credentials |

---

### ⏱️ Attendance Tracking (`/api/attendance`)
| HTTP Method | Endpoint | Auth Required | Allowed Roles | Description |
| :--- | :--- | :--- | :--- | :--- |
| **POST** | `/attendance/checkin` | Yes | All | Creates a clock-in record for today with current timestamp |
| **PUT** | `/attendance/checkout` | Yes | All | Updates today's clock-in record with checkout timestamp and calculates hours |
| **GET** | `/attendance/my-history` | Yes | All | Retrieves attendance history of the logged-in employee |
| **GET** | `/attendance/daily` | Yes | `Super Admin`, `Employer` | Retrieves daily attendance logs of all employees for HR dashboard |
| **POST** | `/attendance/mark-absent` | Yes | `Super Admin`, `Employer` | Triggers batch script to mark missing check-ins as absent |

---

### 📅 Leave Management (`/api/leaves`)
| HTTP Method | Endpoint | Auth Required | Allowed Roles | Description |
| :--- | :--- | :--- | :--- | :--- |
| **GET** | `/leaves` | Yes | `Super Admin`, `Employer` | Lists all leave requests in the system |
| **POST** | `/leaves` | Yes | All | Employee submits a new leave request (Sick, Casual, Annual, etc.) |
| **GET** | `/leaves/my-leaves` | Yes | All | Lists leave requests submitted by the logged-in employee |
| **PUT** | `/leaves/:id` | Yes | `Super Admin`, `Employer` | Approves or rejects a leave request (emits real-time notification) |

---

### 💳 Payroll System (`/api/payroll`)
| HTTP Method | Endpoint | Auth Required | Allowed Roles | Description |
| :--- | :--- | :--- | :--- | :--- |
| **GET** | `/payroll` | Yes | `Super Admin`, `Employer` | Retrieves list of all generated payrolls |
| **POST** | `/payroll` | Yes | `Super Admin`, `Employer` | Generates monthly payroll for an employee based on formula |
| **GET** | `/payroll/my-payslips` | Yes | All | Lists generated payslips for the logged-in employee |
| **GET** | `/payroll/:id/pdf` | Yes | All | Generates and downloads a custom PDF payslip |
| **PUT** | `/payroll/:id` | Yes | `Super Admin`, `Employer` | Updates payment status (e.g., from `Pending` to `Paid`) |
| **GET** | `/payroll/export/excel` | Yes | `Super Admin`, `Employer` | Generates and downloads an Excel sheet of the payroll register |

---

### 📋 Task Delegation (`/api/tasks`)
| HTTP Method | Endpoint | Auth Required | Allowed Roles | Description |
| :--- | :--- | :--- | :--- | :--- |
| **GET** | `/tasks` | Yes | All | Lists delegated tasks (filters applied automatically by role) |
| **POST** | `/tasks` | Yes | `Super Admin`, `Employer` | Assigns a new task to an employee (emits real-time notification) |
| **GET** | `/tasks/:id` | Yes | All | Retrieves task details |
| **PUT** | `/tasks/:id` | Yes | All | Updates task details or changes status (`Pending` -> `In Progress` -> `Completed`) |
| **DELETE** | `/tasks/:id` | Yes | `Super Admin`, `Employer` | Deletes a task |

---

### 🔔 Notifications (`/api/notifications`)
| HTTP Method | Endpoint | Auth Required | Allowed Roles | Description |
| :--- | :--- | :--- | :--- | :--- |
| **GET** | `/notifications` | Yes | All | Lists notifications for the current user |
| **PUT** | `/notifications/read-all` | Yes | All | Marks all user notifications as read |
| **PUT** | `/notifications/:id/read` | Yes | All | Marks a single notification as read |

---

### 📊 Dashboard Reports (`/api/reports`)
| HTTP Method | Endpoint | Auth Required | Allowed Roles | Description |
| :--- | :--- | :--- | :--- | :--- |
| **GET** | `/reports/dashboard` | Yes | All | Retrieves high-level stats (counts, charts data) tailored to user role |

---

## 🧭 Frontend Client Router Paths

All routes are fully configured inside `frontend/src/App.jsx`.

### Public Route
* **`/login`**: Renders the credential login screen.

### Private Routes (Inside Layout wrapper)
* **`/profile`**: Account overview and details update form (Common).
* **`/` (Default)**: Redirects to `/profile`.

#### Super Admin Panel
* **`/admin/dashboard`**: System-wide control panel with summary statistics.

#### Employer Panel (HR Managers)
* **`/employer/dashboard`**: HR summary dashboard, task completion rates, quick attendance grid.
* **`/employer/employees`**: Complete CRUD interface for employee details, salary configuration, and accounts.
* **`/employer/departments`**: Department organization board.
* **`/employer/leaves`**: Leave approval portal with real-time feedback.
* **`/employer/tasks`**: Task dispatch desk for adding and deleting assignments.
* **`/employer/payroll`**: Salary generator panel, payment status modifier, and export desk (Excel).

#### Employee Portal
* **`/employee/dashboard`**: Today's work card, quick check-in/out button, recent alerts.
* **`/employee/attendance`**: Calendar/list of personal clock-in and clock-out history.
* **`/employee/leaves`**: Submission form and approval status grid for leave requests.
* **`/employee/payslips`**: Direct PDF downloads of generated payroll records.
* **`/employee/tasks`**: Kanban-style status dashboard showing assigned tasks with status updates.

---

## 🚀 Getting Started

### 1. Install Server Dependencies
```bash
cd backend
npm install
npm run dev
```

### 2. Install Client Dependencies
```bash
cd frontend
npm install
npm run dev
```
