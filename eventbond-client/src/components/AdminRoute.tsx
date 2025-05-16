import React, { type JSX } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import ProtectedRoute from './ProtectedRoute';

interface AdminRouteProps {
  children: JSX.Element;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { user } = useAuth();
  
  return (
    <ProtectedRoute>
      {user?.role === 'admin' ? children : <Navigate to="/" replace />}
    </ProtectedRoute>
  );
};

export default AdminRoute;