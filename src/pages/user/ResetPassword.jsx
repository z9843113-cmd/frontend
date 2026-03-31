import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { authAPI } from '../../services/api';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email');
  const token = searchParams.get('token');
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!email || !token) {
      setError('Invalid reset link. Please request a new password reset link.');
    }
  }, [email, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!newPassword) {
      setError('Please enter a new password');
      return;
    }
    
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await authAPI.resetPassword({ email, token, newPassword });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] font-['Ubuntu',sans-serif] flex items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-md">
        <div className="relative overflow-hidden rounded-[28px] border border-[#3a3020] bg-[radial-gradient(circle_at_top_left,_rgba(212,175,55,0.18),_transparent_35%),linear-gradient(135deg,#171717_0%,#101010_60%,#090909_100%)] p-6 sm:p-8 shadow-[0_20px_80px_rgba(0,0,0,0.45)]">
          <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-[#D4AF37]/10 blur-3xl"></div>
          
          <div className="relative text-center mb-6 sm:mb-8">
            <img src="/jexpaylogo.png" alt="Jex Pay" className="h-16 sm:h-20 md:h-24 mx-auto object-contain mb-2" />
            <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] bg-clip-text text-transparent" style={{fontFamily: 'Cinzel, serif'}}>𝙅𝙀𝙓 𝙋𝘼𝙔</h1>
          </div>
          
          {success ? (
            <>
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-400/20 flex items-center justify-center">
                  <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-xl sm:text-2xl font-semibold text-white mb-2">Password Reset!</h2>
                <p className="text-gray-400 text-sm">Your password has been successfully reset.</p>
              </div>
              
              <Link
                to="/login"
                className="block w-full bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black font-bold py-3.5 sm:py-4 rounded-xl text-center hover:shadow-lg hover:shadow-yellow-500/30 transition-all"
              >
                Login with New Password
              </Link>
            </>
          ) : (
            <>
              <h2 className="text-xl sm:text-2xl font-semibold text-white mb-2">Set New Password</h2>
              <p className="text-gray-400 text-sm mb-6">Enter your new password below.</p>
              
              {error && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl mb-4 font-medium text-sm">
                  {error}
                </div>
              )}
              
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-sm text-gray-400 mb-2 ml-1">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => { setNewPassword(e.target.value); setError(''); }}
                    placeholder="Enter new password"
                    className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-4 py-3.5 text-white placeholder-gray-600 focus:border-yellow-500 focus:outline-none transition-colors"
                  />
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm text-gray-400 mb-2 ml-1">Confirm Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
                    placeholder="Confirm new password"
                    className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-4 py-3.5 text-white placeholder-gray-600 focus:border-yellow-500 focus:outline-none transition-colors"
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={loading || !email || !token}
                  className="w-full bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black font-bold py-3.5 sm:py-4 rounded-xl hover:shadow-lg hover:shadow-yellow-500/30 hover:scale-[1.02] transition-all duration-300 disabled:opacity-50"
                >
                  {loading ? 'Resetting...' : 'Reset Password'}
                </button>
              </form>
              
              <p className="text-gray-400 text-center mt-5 text-sm">
                <Link to="/login" className="text-yellow-400 hover:text-yellow-300 font-medium">
                  Back to Login
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
