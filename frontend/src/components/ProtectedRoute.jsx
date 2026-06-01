import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-500/30 border-t-indigo-500"></div>
          <p className="text-slate-400 text-sm font-medium">Verifying credentials...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if user is unauthenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Enforce role authorization
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // If manager tries employee path, redirect to manager dashboard, and vice-versa
    const defaultRedirect = user.role === 'manager' ? '/manager' : '/employee';
    return <Navigate to={defaultRedirect} replace />;
  }

  return children;
};

export default ProtectedRoute;
