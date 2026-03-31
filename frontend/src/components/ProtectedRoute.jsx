import { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store';

const ProtectedRoute = ({ children, roles }) => {
  const { user, token } = useAuthStore();
  const location = useLocation();
  const [ready] = useState(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (storedToken && !token) {
      useAuthStore.getState().setToken(storedToken);
      if (storedUser) {
        useAuthStore.getState().setUser(JSON.parse(storedUser));
      }
    }
    return true;
  });

  if (!ready) {
    return <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center"><div className="text-white">Loading...</div></div>;
  }

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && !roles.includes(user?.role)) {
    return <Navigate to="/home" replace />;
  }

  return children;
};

export default ProtectedRoute;
