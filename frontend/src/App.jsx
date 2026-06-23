import React, { useState, useMemo } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';


import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';


import Login from './pages/Auth/Login';
import AdminDashboard from './pages/Admin/AdminDashboard';
import EmployerDashboard from './pages/Employer/EmployerDashboard';
import EmployeeManagement from './pages/Employer/EmployeeManagement';
import DepartmentManagement from './pages/Employer/DepartmentManagement';
import LeaveApprovals from './pages/Employer/LeaveApprovals';
import TaskAssignment from './pages/Employer/TaskAssignment';
import PayrollGeneration from './pages/Employer/PayrollGeneration';
import EmployeeDashboard from './pages/Employee/EmployeeDashboard';
import AttendanceHistory from './pages/Employee/AttendanceHistory';
import LeaveRequests from './pages/Employee/LeaveRequests';
import Payslips from './pages/Employee/Payslips';
import Tasks from './pages/Employee/Tasks';
import Profile from './pages/Common/Profile';

function App() {
  const [darkMode, setDarkMode] = useState(false);

  
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: darkMode ? 'dark' : 'light',
          primary: {
            main: '#4f46e5', 
            light: '#818cf8',
            dark: '#3730a3',
            contrastText: '#ffffff',
          },
          secondary: {
            main: '#ec4899', 
            light: '#f472b6',
            dark: '#be185d',
            contrastText: '#ffffff',
          },
          background: {
            default: darkMode ? '#0f172a' : '#f8fafc',
            paper: darkMode ? '#1e293b' : '#ffffff',
          },
        },
        typography: {
          fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
          h4: {
            fontWeight: 700,
          },
          h6: {
            fontWeight: 600,
          },
        },
        shape: {
          borderRadius: 8,
        },
        components: {
          MuiButton: {
            styleOverrides: {
              root: {
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: '8px',
              },
            },
          },
          MuiCard: {
            styleOverrides: {
              root: {
                backgroundImage: 'none',
              },
            },
          },
        },
      }),
    [darkMode]
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          {}
          <Route path="/login" element={<Login />} />

          {}
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Layout darkMode={darkMode} setDarkMode={setDarkMode} />
              </PrivateRoute>
            }
          >
            {}
            <Route
              path="admin/dashboard"
              element={
                <PrivateRoute allowedRoles={['Super Admin']}>
                  <AdminDashboard />
                </PrivateRoute>
              }
            />

            {}
            <Route
              path="employer/dashboard"
              element={
                <PrivateRoute allowedRoles={['Employer']}>
                  <EmployerDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="employer/employees"
              element={
                <PrivateRoute allowedRoles={['Employer']}>
                  <EmployeeManagement />
                </PrivateRoute>
              }
            />
            <Route
              path="employer/departments"
              element={
                <PrivateRoute allowedRoles={['Employer']}>
                  <DepartmentManagement />
                </PrivateRoute>
              }
            />
            <Route
              path="employer/leaves"
              element={
                <PrivateRoute allowedRoles={['Employer']}>
                  <LeaveApprovals />
                </PrivateRoute>
              }
            />
            <Route
              path="employer/tasks"
              element={
                <PrivateRoute allowedRoles={['Employer']}>
                  <TaskAssignment />
                </PrivateRoute>
              }
            />
            <Route
              path="employer/payroll"
              element={
                <PrivateRoute allowedRoles={['Employer']}>
                  <PayrollGeneration />
                </PrivateRoute>
              }
            />

            {}
            <Route
              path="employee/dashboard"
              element={
                <PrivateRoute allowedRoles={['Employee']}>
                  <EmployeeDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="employee/attendance"
              element={
                <PrivateRoute allowedRoles={['Employee']}>
                  <AttendanceHistory />
                </PrivateRoute>
              }
            />
            <Route
              path="employee/leaves"
              element={
                <PrivateRoute allowedRoles={['Employee']}>
                  <LeaveRequests />
                </PrivateRoute>
              }
            />
            <Route
              path="employee/payslips"
              element={
                <PrivateRoute allowedRoles={['Employee']}>
                  <Payslips />
                </PrivateRoute>
              }
            />
            <Route
              path="employee/tasks"
              element={
                <PrivateRoute allowedRoles={['Employee']}>
                  <Tasks />
                </PrivateRoute>
              }
            />

            {}
            <Route path="profile" element={<Profile />} />

            {}
            <Route path="" element={<Navigate to="/profile" replace />} />
          </Route>

          {}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
