import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Navigate } from 'react-router-dom';
import Card from '../ui/Card';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
     return (
      <div className="min-h-screen bg-retro-dark flex items-center justify-center">
        <h1 className="text-3xl font-press-start text-retro-cyan animate-pulse">CHECKING CLEARANCE...</h1>
      </div>
    );
  }

  if (user?.role !== 'admin') {
    // User is not an admin, you can redirect or show an access denied message
    // Redirecting to dashboard is a common pattern
    // Alternatively, you could render a specific "Access Denied" component here
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
