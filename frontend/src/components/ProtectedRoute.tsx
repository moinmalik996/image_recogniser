import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('access_token');
  if (!token) {
    return <Navigate to="/auth-pages/login" replace />;
  }
  return <>{children}</>;
};

export default ProtectedRoute;
