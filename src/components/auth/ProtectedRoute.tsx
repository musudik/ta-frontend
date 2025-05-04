import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { UserRole, User } from '../../types/auth';

interface ProtectedRouteProps {
  children: React.ReactNode | ((props: { user: User | null }) => React.ReactNode);
  allowedRoles?: UserRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect to login but save the attempted location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // Redirect to role-specific dashboard if user's role is not allowed
    const dashboardPath = 
      user.role === UserRole.CLIENT 
        ? '/dashboard/client'
        : user.role === UserRole.TAX_AGENT
        ? '/dashboard/tax-agent'
        : '/dashboard/admin';
    
    return <Navigate to={dashboardPath} replace />;
  }

  // If children is a function, call it with the user
  if (typeof children === 'function') {
    return <>{children({ user })}</>;
  }

  // Otherwise, render children directly
  return <>{children}</>;
};

export default ProtectedRoute; 