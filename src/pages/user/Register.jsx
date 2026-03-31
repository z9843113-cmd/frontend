import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { authAPI } from '../../services/api';
import { useAuthStore } from '../../store';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('form');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const { setToken, setUser } = useAuthStore();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const refCode = searchParams.get('ref');
    if (refCode) {
      setReferralCode(refCode);
    }
  }, [searchParams]);

  const validateForm = () => {
    if (!name.trim()) return 'Please enter your name';
    if (!email.trim()) return 'Please enter your email';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return 'Please enter a valid email';
    if (!password.trim()) return 'Please enter a password';
    if (password.length < 6) return 'Password must be at least 6 characters';
    return null;
  };

  const handleSendOtp = async () => {
    const validationError = validateForm();
    if (validationError) { setError(validationError); return; }
    setLoading(true);
    setError('');
    setSuccess('');
    console.log('Registering with:', { email, name });
    try {
      const response = await authAPI.register({ name, email, mobile, password, referralcode: referralCode });
      console.log('Registration response:', response);
      setStep('otp');
      setSuccess('OTP sent to your email!');
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp.trim()) {
      setError('Please enter OTP');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const data = await authAPI.verifyOtp({ email, otp });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      setStep('success');
      setTimeout(() => navigate('/home'), 2000);
    } catch (err) {
      console.error('OTP verification error:', err);
      setError(err.message || 'Invalid OTP');
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
          
          <h2 className="text-xl sm:text-2xl font-semibold text-white mb-5 sm:mb-6">
            {step === 'form' ? 'Create Account' : step === 'otp' ? 'Verify Email' : 'Success!'}
          </h2>
          
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl mb-4 font-medium text-sm">
              {error}
            </div>
          )}
          
          {success && !error && (
            <div className="bg-emerald-500/10 border border-emerald-500/50 text-emerald-400 px-4 py-3 rounded-xl mb-4 font-medium text-sm">
              {success}
            </div>
          )}
          
          {step === 'form' && (
            <>
              <div className="mb-4">
                <label className="block text-sm text-gray-400 mb-2 ml-1">Full Name *</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => { setName(e.target.value); setError(''); }} 
                  placeholder="Enter your full name" 
                  className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-4 py-3.5 text-white placeholder-gray-600 focus:border-yellow-500 focus:outline-none transition-colors" 
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm text-gray-400 mb-2 ml-1">Email *</label>
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => { setEmail(e.target.value); setError(''); }} 
                  placeholder="Enter your email" 
                  className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-4 py-3.5 text-white placeholder-gray-600 focus:border-yellow-500 focus:outline-none transition-colors" 
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm text-gray-400 mb-2 ml-1">Mobile Number</label>
                <input 
                  type="tel" 
                  value={mobile} 
                  onChange={(e) => { setMobile(e.target.value); setError(''); }} 
                  placeholder="Enter mobile number (optional)" 
                  className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-4 py-3.5 text-white placeholder-gray-600 focus:border-yellow-500 focus:outline-none transition-colors" 
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm text-gray-400 mb-2 ml-1">Password *</label>
                <input 
                  type="password" 
                  value={password} 
                  onChange={(e) => { setPassword(e.target.value); setError(''); }} 
                  placeholder="Create a password" 
                  className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-4 py-3.5 text-white placeholder-gray-600 focus:border-yellow-500 focus:outline-none transition-colors" 
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm text-gray-400 mb-2 ml-1">
                  Referral Code {searchParams.get('ref') ? <span className="text-emerald-400">(Auto-filled!)</span> : '(Optional)'}
                </label>
                <input 
                  type="text" 
                  value={referralCode} 
                  onChange={(e) => { setReferralCode(e.target.value); setError(''); }} 
                  placeholder="Enter referral code" 
                  className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-4 py-3.5 text-white placeholder-gray-600 focus:border-yellow-500 focus:outline-none transition-colors" 
                />
              </div>
              <button
                onClick={handleSendOtp}
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black font-bold py-3.5 sm:py-4 rounded-xl hover:shadow-lg hover:shadow-yellow-500/30 hover:scale-[1.02] transition-all duration-300 disabled:opacity-50"
              >
                {loading ? 'Sending OTP...' : 'Send OTP'}
              </button>
            </>
          )}
          
          {step === 'otp' && (
            <>
              <div className="mb-6">
                <label className="block text-sm text-gray-400 mb-2 ml-1">Enter OTP</label>
                <input 
                  type="text" 
                  value={otp} 
                  onChange={(e) => { setOtp(e.target.value); setError(''); }} 
                  placeholder="Enter 6-digit OTP" 
                  className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-4 py-3.5 text-white placeholder-gray-600 focus:border-yellow-500 focus:outline-none transition-colors text-center text-lg letter-spacing-4" 
                  maxLength={6}
                />
                <p className="text-gray-500 text-xs mt-2 ml-1">OTP sent to {email}</p>
              </div>
              <button
                onClick={handleVerifyOtp}
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black font-bold py-3.5 sm:py-4 rounded-xl hover:shadow-lg hover:shadow-yellow-500/30 hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 mb-4"
              >
                {loading ? 'Verifying...' : 'Verify & Register'}
              </button>
              <button
                onClick={() => { setStep('form'); setError(''); }}
                className="w-full text-gray-400 text-sm hover:text-yellow-400 transition-colors"
              >
                Change email or resend OTP
              </button>
            </>
          )}
          
          {step === 'success' && (
            <div className="text-center py-8">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-emerald-400/20 flex items-center justify-center">
                <svg className="w-10 h-10 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-emerald-400 font-semibold">Registration Successful!</p>
              <p className="text-gray-400 text-sm mt-2">Redirecting to home...</p>
            </div>
          )}
          
          {step !== 'success' && (
            <p className="text-gray-400 text-center mt-5 text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-yellow-400 hover:text-yellow-300 font-medium">
                Login
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Register;
