import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../../services/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your registered email');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await authAPI.forgetPassword({ email });
      setSuccess(true);
      setMessage('Password reset link has been sent to your email. Click the link to reset your password. The link is valid for 10 minutes.');
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to send reset link');
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h2 className="text-xl sm:text-2xl font-semibold text-white mb-2">Check Your Email</h2>
              </div>
              
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 mb-6">
                <p className="text-emerald-400 text-sm text-center">{message}</p>
                <p className="text-gray-400 text-xs text-center mt-2">Link valid for 10 minutes</p>
              </div>
              
              <Link
                to="/login"
                className="block w-full bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black font-bold py-3.5 sm:py-4 rounded-xl text-center hover:shadow-lg hover:shadow-yellow-500/30 transition-all"
              >
                Back to Login
              </Link>
            </>
          ) : (
            <>
              <h2 className="text-xl sm:text-2xl font-semibold text-white mb-2">Forgot Password</h2>
              <p className="text-gray-400 text-sm mb-6">Enter your registered email to receive a password reset link.</p>
              
              {error && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl mb-4 font-medium text-sm">
                  {error}
                </div>
              )}
              
              <form onSubmit={handleSubmit}>
                <div className="mb-6">
                  <label className="block text-sm text-gray-400 mb-2 ml-1">Registered Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(''); }}
                    placeholder="Enter your registered email"
                    className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-4 py-3.5 text-white placeholder-gray-600 focus:border-yellow-500 focus:outline-none transition-colors"
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black font-bold py-3.5 sm:py-4 rounded-xl hover:shadow-lg hover:shadow-yellow-500/30 hover:scale-[1.02] transition-all duration-300 disabled:opacity-50"
                >
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>
              
              <p className="text-gray-400 text-center mt-5 text-sm">
                Remember your password?{' '}
                <Link to="/login" className="text-yellow-400 hover:text-yellow-300 font-medium">
                  Login
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
