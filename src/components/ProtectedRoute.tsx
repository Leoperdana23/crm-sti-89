
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  try {
    const { user, loading } = useAuth();

    if (loading) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            <span className="text-sm md:text-base">Memuat...</span>
          </div>
        </div>
      );
    }

    if (!user) {
      return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
  } catch (error) {
    console.error('ProtectedRoute error:', error);
    // If there's an error, redirect to auth page
    return <Navigate to="/login" replace />;
  }
};

export default ProtectedRoute;
