import { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store';

const ProtectedRoute = ({ children, roles }) => {
  const { user, token } = useAuthStore();
  const location = useLocation();
  const [showModal, setShowModal] = useState(false);
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

  useEffect(() => {
    if (roles && !roles.includes(user?.role) && token) {
      setShowModal(true);
    }
  }, [user?.role, roles, token]);

  if (!ready) {
    return <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center"><div className="text-white">Loading...</div></div>;
  }

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && !roles.includes(user?.role)) {
    return (
      <>
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
          <div className="bg-[#1a1a1a] border border-red-500/30 rounded-2xl p-6 max-w-md text-center">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
            <p className="text-gray-400 mb-4">Sorry, you don't have permission to access this page.</p>
            <p className="text-sm text-gray-500 mb-4">Required roles: {roles.join(', ')}</p>
            <p className="text-sm text-gray-500 mb-4">Your role: {user?.role}</p>
            <button 
              onClick={() => {
                if (user?.role === 'ADMIN' || user?.role === 'MANAGER') {
                  window.location.href = '/admin/dashboard';
                } else if (user?.role === 'SUBADMIN') {
                  window.location.href = '/subadmin/dashboard';
                } else {
                  window.location.href = '/home';
                }
              }}
              className="px-6 py-2 bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black font-semibold rounded-xl hover:opacity-90"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
        {showModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-[#1a1a1a] border border-red-500/30 rounded-2xl p-6 max-w-md w-full text-center animate-pulse">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
              <p className="text-gray-400 mb-4">Sorry, you don't have permission to access this page.</p>
              <p className="text-sm text-gray-500 mb-4">Required roles: {roles?.join(', ')}</p>
              <p className="text-sm text-gray-500 mb-4">Your role: {user?.role}</p>
              <button 
                onClick={() => {
                  setShowModal(false);
                  if (user?.role === 'ADMIN' || user?.role === 'MANAGER') {
                    window.location.href = '/admin/dashboard';
                  } else {
                    window.location.href = '/home';
                  }
                }}
                className="w-full px-6 py-3 bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black font-semibold rounded-xl hover:opacity-90"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return children;
};

export default ProtectedRoute;
