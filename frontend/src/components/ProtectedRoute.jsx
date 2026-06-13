import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute wraps any route that requires authentication.
 *
 * Usage:
 *   <Route path="/checkout" element={
 *     <ProtectedRoute><Checkout /></ProtectedRoute>
 *   } />
 *
 *   <Route path="/admin" element={
 *     <ProtectedRoute allowedRoles={['Admin']}><AdminPage /></ProtectedRoute>
 *   } />
 *
 * Props:
 *   allowedRoles  - optional array of roles; if omitted, any logged-in user is allowed
 *   redirectTo    - where to redirect unauthenticated users (default: /login)
 */
const ProtectedRoute = ({ children, allowedRoles = null, redirectTo = '/login' }) => {
  const { isLoggedIn, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    // Show a minimal spinner while we restore session
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: '100vh', background: '#f8fafc'
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: '50%',
          border: '4px solid var(--primary)', borderTopColor: 'transparent',
          animation: 'spin 0.8s linear infinite'
        }} />
      </div>
    );
  }

  if (!isLoggedIn) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    // Logged in but wrong role
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
