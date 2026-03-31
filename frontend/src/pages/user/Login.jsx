import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../../services/api';
import { useAuthStore } from '../../store';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setUser, setToken } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Please enter email and password');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const data = await authAPI.login({ email, password });
      const { token, user } = data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setToken(token);
      setUser(user);
      
      if (user.role === 'ADMIN' || user.role === 'SUBADMIN') {
        navigate('/admin/dashboard');
      } else {
        navigate('/home');
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Invalid credentials');
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
          
          <h2 className="text-xl sm:text-2xl font-semibold text-white mb-5 sm:mb-6">Welcome Back</h2>
          
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl mb-4 font-medium text-sm">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm text-gray-400 mb-2 ml-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                placeholder="Enter your email"
                className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-4 py-3.5 text-white placeholder-gray-600 focus:border-yellow-500 focus:outline-none transition-colors"
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-sm text-gray-400 mb-2 ml-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                placeholder="Enter your password"
                className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-4 py-3.5 text-white placeholder-gray-600 focus:border-yellow-500 focus:outline-none transition-colors"
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black font-bold py-3.5 sm:py-4 rounded-xl hover:shadow-lg hover:shadow-yellow-500/30 hover:scale-[1.02] transition-all duration-300 disabled:opacity-50"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
          
          <div className="flex flex-col sm:flex-row justify-between mt-5 gap-3">
            <Link to="/forgot-password" className="text-yellow-400 hover:text-yellow-300 text-sm font-medium text-center sm:text-left">
              Forgot Password?
            </Link>
            <p className="text-gray-400 text-sm text-center sm:text-right">
              Don't have an account?{' '}
              <Link to="/register" className="text-yellow-400 hover:text-yellow-300 font-medium">
                Register
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
