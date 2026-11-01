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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const navigate = useNavigate();
  const { setToken, setUser } = useAuthStore();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const refCode = searchParams.get('ref');
    if (refCode) setReferralCode(refCode);
  }, [searchParams]);

  const validateForm = () => {
    const errors = {};

    if (!name.trim()) errors.name = 'Name is required';
    else if (name.trim().length < 2)
      errors.name = 'Name must be at least 2 characters';

    if (!email.trim()) errors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      errors.email = 'Please enter a valid email';

    if (mobile && !/^\d{10}$/.test(mobile))
      errors.mobile = 'Enter 10 digit mobile number';

    if (!password) errors.password = 'Password is required';
    else if (password.length < 6)
      errors.password = 'Password must be at least 6 characters';

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateField = (field, value) => {
    const errors = { ...fieldErrors };

    if (field === 'name') {
      if (!value.trim()) errors.name = 'Name is required';
      else if (value.trim().length < 2)
        errors.name = 'Name must be at least 2 characters';
      else delete errors.name;
    }

    if (field === 'email') {
      if (!value.trim()) errors.email = 'Email is required';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
        errors.email = 'Please enter a valid email';
      else delete errors.email;
    }

    if (field === 'mobile') {
      if (value && !/^\d{10}$/.test(value))
        errors.mobile = 'Enter 10 digit mobile number';
      else delete errors.mobile;
    }

    if (field === 'password') {
      if (!value) errors.password = 'Password is required';
      else if (value.length < 6)
        errors.password = 'Password must be at least 6 characters';
      else delete errors.password;
    }

    setFieldErrors(errors);
    return !errors[field];
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      setError('Please fill all required fields correctly');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await authAPI.register({
        name,
        email,
        mobile,
        password,
        referralcode: referralCode
      });

      if (!response || !response.token || !response.user) {
        throw new Error(
          response?.error || 'Registration failed. Please try again.'
        );
      }

      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));

      setToken(response.token);
      setUser(response.user);

      setSuccess('Registration successful!');

      setTimeout(() => navigate('/home'), 1000);
    } catch (err) {
      setError(
        err.response?.data?.error ||
        err.message ||
        'Registration failed'
      );
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
            <img
              src="/jexpaylogo.png"
              alt="Jex Pay"
              className="h-16 sm:h-20 md:h-24 mx-auto object-contain mb-2"
            />
            <h1
              className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] bg-clip-text text-transparent"
              style={{ fontFamily: 'Cinzel, serif' }}
            >
              𝙅𝙀𝙓 𝙋𝘼𝙔
            </h1>
          </div>

          <h2 className="text-xl sm:text-2xl font-semibold text-white mb-5 sm:mb-6">
            Create Account
          </h2>

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl mb-4 font-medium text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-emerald-500/10 border border-emerald-500/50 text-emerald-400 px-4 py-3 rounded-xl mb-4 font-medium text-sm">
              {success}
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm text-gray-400 mb-2 ml-1">
              Full Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError('');
                if (fieldErrors.name) validateField('name', e.target.value);
              }}
              onBlur={(e) => validateField('name', e.target.value)}
              placeholder="Enter your full name"
              className={`w-full bg-[#1a1a1a] border rounded-xl px-4 py-3.5 text-white placeholder-gray-600 focus:outline-none transition-colors ${
                fieldErrors.name
                  ? 'border-red-500 focus:border-red-500'
                  : 'border-[#2a2a2a] focus:border-yellow-500'
              }`}
            />
            {fieldErrors.name && (
              <p className="text-red-400 text-xs mt-1 ml-1">
                {fieldErrors.name}
              </p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-sm text-gray-400 mb-2 ml-1">
              Email *
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError('');
                if (fieldErrors.email) validateField('email', e.target.value);
              }}
              onBlur={(e) => validateField('email', e.target.value)}
              placeholder="Enter your email"
              className={`w-full bg-[#1a1a1a] border rounded-xl px-4 py-3.5 text-white placeholder-gray-600 focus:outline-none transition-colors ${
                fieldErrors.email
                  ? 'border-red-500 focus:border-red-500'
                  : 'border-[#2a2a2a] focus:border-yellow-500'
              }`}
            />
            {fieldErrors.email && (
              <p className="text-red-400 text-xs mt-1 ml-1">
                {fieldErrors.email}
              </p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-sm text-gray-400 mb-2 ml-1">
              Mobile Number (10 digits)
            </label>
            <input
              type="tel"
              value={mobile}
              onChange={(e) => {
                const v = e.target.value.replace(/\D/g, '').slice(0, 10);
                setMobile(v);
                setError('');
                if (fieldErrors.mobile) validateField('mobile', v);
              }}
              onBlur={(e) => validateField('mobile', e.target.value)}
              placeholder="Enter 10 digit mobile number"
              className={`w-full bg-[#1a1a1a] border rounded-xl px-4 py-3.5 text-white placeholder-gray-600 focus:outline-none transition-colors ${
                fieldErrors.mobile
                  ? 'border-red-500 focus:border-red-500'
                  : 'border-[#2a2a2a] focus:border-yellow-500'
              }`}
            />
            {fieldErrors.mobile && (
              <p className="text-red-400 text-xs mt-1 ml-1">
                {fieldErrors.mobile}
              </p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-sm text-gray-400 mb-2 ml-1">
              Password *
            </label>

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                  if (fieldErrors.password)
                    validateField('password', e.target.value);
                }}
                onBlur={(e) => validateField('password', e.target.value)}
                placeholder="Create a password (min 6 characters)"
                className={`w-full bg-[#1a1a1a] border rounded-xl px-4 py-3.5 pr-12 text-white placeholder-gray-600 focus:outline-none transition-colors ${
                  fieldErrors.password
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-[#2a2a2a] focus:border-yellow-500'
                }`}
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-yellow-400 transition-colors"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>

            {fieldErrors.password && (
              <p className="text-red-400 text-xs mt-1 ml-1">
                {fieldErrors.password}
              </p>
            )}
          </div>

          <div className="mb-6">
            <label className="block text-sm text-gray-400 mb-2 ml-1">
              Referral Code {searchParams.get('ref') ? '(Auto-filled!)' : '(Optional)'}
            </label>
            <input
              type="text"
              value={referralCode}
              onChange={(e) => {
                setReferralCode(e.target.value);
                setError('');
              }}
              placeholder="Enter referral code"
              className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-4 py-3.5 text-white placeholder-gray-600 focus:border-yellow-500 focus:outline-none transition-colors"
            />
          </div>

          <button
            type="button"
            onClick={handleRegister}
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black font-bold py-3.5 sm:py-4 rounded-xl hover:shadow-lg hover:shadow-yellow-500/30 hover:scale-[1.02] transition-all duration-300 disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>

          <p className="text-gray-400 text-center mt-5 text-sm">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-yellow-400 hover:text-yellow-300 font-medium"
            >
              Login
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
};

export default Register;
