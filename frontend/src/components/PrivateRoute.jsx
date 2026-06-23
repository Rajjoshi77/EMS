import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const PrivateRoute = ({ children, allowedRoles }) => {
  const { user, token } = useSelector((state) => state.auth);

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    
    if (user.role === 'Super Admin') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'Employer') return <Navigate to="/employer/dashboard" replace />;
    return <Navigate to="/employee/dashboard" replace />;
  }

  return children;
};

export default PrivateRoute;
