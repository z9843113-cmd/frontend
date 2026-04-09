import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../services/api';
import { useAuthStore } from '../store';

const ForcedLogoutCheck = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuthStore();
  const [showForcedLogout, setShowForcedLogout] = useState(false);
  const lastCheckRef = useRef({ lastLogout: null, tokenversion: null });

  useEffect(() => {
    // Only check for admin/manager users
    if (!user || (user.role !== 'ADMIN' && user.role !== 'MANAGER')) return;

    const checkForcedLogout = async () => {
      try {
        const res = await adminAPI.checkLogout();
        if (!res) return;
        
        // Check if tokenversion changed
        if (lastCheckRef.current.tokenversion && res.tokenversion !== lastCheckRef.current.tokenversion) {
          setShowForcedLogout(true);
          return;
        }
        
        // Check if lastLogout changed
        if (lastCheckRef.current.lastLogout && res.lastLogout) {
          const oldTime = new Date(lastCheckRef.current.lastLogout).getTime();
          const newTime = new Date(res.lastLogout).getTime();
          if (newTime > oldTime) {
            setShowForcedLogout(true);
            return;
          }
        }
        
        // Update reference values
        lastCheckRef.current = {
          lastLogout: res.lastLogout,
          tokenversion: res.tokenversion
        };
      } catch (err) {
        // Ignore errors
      }
    };

    // Initial check
    checkForcedLogout().then(() => {
      const interval = setInterval(checkForcedLogout, 3000);
      return () => clearInterval(interval);
    });
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!showForcedLogout) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90">
      <div className="bg-gradient-to-br from-[#1f1f1f] to-[#0a0a0a] rounded-3xl p-8 border border-red-500/50 w-full max-w-md mx-4">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Logged Out</h2>
          <p className="text-gray-400 mb-6">You have been logged out from all devices. Please login again.</p>
          <button
            onClick={handleLogout}
            className="w-full py-4 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors"
          >
            Login Again
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForcedLogoutCheck;
