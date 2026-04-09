import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { authAPI } from '../../services/api';
import { useAuthStore } from '../../store';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [referralCode, setReferralCode] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('form');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const navigate = useNavigate();
  const { setToken, setUser } = useAuthStore();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const refCode = searchParams.get('ref');
    if (refCode) {
      setReferralCode(refCode);
    }
  }, [searchParams]);

  const validateField = (field, value) => {
    const errors = { ...fieldErrors };
    
    switch (field) {
      case 'name':
        if (!value.trim()) errors.name = 'Name is required';
        else if (value.trim().length < 2) errors.name = 'Name must be at least 2 characters';
        else delete errors.name;
        break;
      case 'email':
        if (!value.trim()) errors.email = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) errors.email = 'Please enter a valid email';
        else delete errors.email;
        break;
      case 'mobile':
        if (value && !/^\d{10}$/.test(value)) errors.mobile = 'Enter 10 digit mobile number';
        else delete errors.mobile;
        break;
      case 'password':
        if (!value) errors.password = 'Password is required';
        else if (value.length < 6) errors.password = 'Password must be at least 6 characters';
        else delete errors.password;
        break;
    }
    
    setFieldErrors(errors);
    return !errors[field];
  };

  const validateForm = () => {
    const errors = {};
    
    if (!name.trim()) errors.name = 'Name is required';
    else if (name.trim().length < 2) errors.name = 'Name must be at least 2 characters';
    
    if (!email.trim()) errors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Please enter a valid email';
    
    if (mobile && !/^\d{10}$/.test(mobile)) errors.mobile = 'Enter 10 digit mobile number';
    
    if (!password) errors.password = 'Password is required';
    else if (password.length < 6) errors.password = 'Password must be at least 6 characters';
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSendOtp = async () => {
    const isValid = validateForm();
    if (!isValid) {
      setError('Please fill all required fields correctly');
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');
    console.log('Registering with:', { email, name });
    console.log('Form valid, calling API...');
    try {
      const response = await authAPI.register({ name, email, mobile, password, referralcode: referralCode });
      console.log('Registration response:', response);
      if (response.error) {
        setError(response.error);
      } else {
        setStep('otp');
        setSuccess('OTP sent to your email!');
      }
    } catch (err) {
      console.error('Registration error:', err);
      const errorMsg = err.response?.data?.error || err.message || 'Registration failed';
      setError(errorMsg);
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
                  onChange={(e) => { setName(e.target.value); setError(''); if (fieldErrors.name) validateField('name', e.target.value); }} 
                  onBlur={(e) => validateField('name', e.target.value)}
                  placeholder="Enter your full name" 
                  className={`w-full bg-[#1a1a1a] border rounded-xl px-4 py-3.5 text-white placeholder-gray-600 focus:outline-none transition-colors ${fieldErrors.name ? 'border-red-500 focus:border-red-500' : 'border-[#2a2a2a] focus:border-yellow-500'}`} 
                />
                {fieldErrors.name && <p className="text-red-400 text-xs mt-1 ml-1">{fieldErrors.name}</p>}
              </div>
              <div className="mb-4">
                <label className="block text-sm text-gray-400 mb-2 ml-1">Email *</label>
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => { setEmail(e.target.value); setError(''); if (fieldErrors.email) validateField('email', e.target.value); }}
                  onBlur={(e) => validateField('email', e.target.value)}
                  placeholder="Enter your email" 
                  className={`w-full bg-[#1a1a1a] border rounded-xl px-4 py-3.5 text-white placeholder-gray-600 focus:outline-none transition-colors ${fieldErrors.email ? 'border-red-500 focus:border-red-500' : 'border-[#2a2a2a] focus:border-yellow-500'}`} 
                />
                {fieldErrors.email && <p className="text-red-400 text-xs mt-1 ml-1">{fieldErrors.email}</p>}
              </div>
              <div className="mb-4">
                <label className="block text-sm text-gray-400 mb-2 ml-1">Mobile Number (10 digits)</label>
                <input 
                  type="tel" 
                  value={mobile} 
                  onChange={(e) => { const v = e.target.value.replace(/\D/g, '').slice(0,10); setMobile(v); setError(''); if (fieldErrors.mobile) validateField('mobile', v); }}
                  onBlur={(e) => validateField('mobile', e.target.value)}
                  placeholder="Enter 10 digit mobile number" 
                  className={`w-full bg-[#1a1a1a] border rounded-xl px-4 py-3.5 text-white placeholder-gray-600 focus:outline-none transition-colors ${fieldErrors.mobile ? 'border-red-500 focus:border-red-500' : 'border-[#2a2a2a] focus:border-yellow-500'}`} 
                />
                {fieldErrors.mobile && <p className="text-red-400 text-xs mt-1 ml-1">{fieldErrors.mobile}</p>}
              </div>
              <div className="mb-4">
                <label className="block text-sm text-gray-400 mb-2 ml-1">Password *</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"}
                    value={password} 
                    onChange={(e) => { setPassword(e.target.value); setError(''); if (fieldErrors.password) validateField('password', e.target.value); }}
                    onBlur={(e) => validateField('password', e.target.value)}
                    placeholder="Create a password (min 6 characters)" 
                    className={`w-full bg-[#1a1a1a] border rounded-xl px-4 py-3.5 pr-12 text-white placeholder-gray-600 focus:outline-none transition-colors ${fieldErrors.password ? 'border-red-500 focus:border-red-500' : 'border-[#2a2a2a] focus:border-yellow-500'}`} 
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-yellow-400 transition-colors"
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    )}
                  </button>
                </div>
                {fieldErrors.password && <p className="text-red-400 text-xs mt-1 ml-1">{fieldErrors.password}</p>}
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
                type="button"
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
                  placeholder="Enter OTP" 
                  className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-4 py-3.5 text-white placeholder-gray-600 focus:border-yellow-500 focus:outline-none transition-colors text-center text-lg" 
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
