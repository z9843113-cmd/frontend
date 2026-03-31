import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import { useAuthStore } from '../../store';
import AdminNotificationBell from '../../components/AdminNotificationBell';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { logout } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => { 
    adminAPI.getDashboard()
      .then(data => setStats(data?.data || data))
      .catch(console.error)
      .finally(() => setLoading(false)); 
  }, []);

  const menuItems = [
    { icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v-6a1 1 0 00-1-1h-3m-9 16v2a1 1 0 001 1h2', label: 'Home', path: '/admin/dashboard' },
    { icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z', label: 'Users', path: '/admin/users' },
    { icon: 'M12 4v16m8-8H4', label: 'Deposits', path: '/admin/deposits' },
    { icon: 'M20 12H4', label: 'Withdraw', path: '/admin/withdrawals' },
    { icon: 'M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z', label: 'UPI Apps', path: '/admin/upi-apps' },
    { icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', label: 'UPI Verify', path: '/admin/upi-verifications' },
    { icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z', label: 'Crypto', path: '/admin/crypto' },
    { icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z', label: 'J Token', path: '/admin/jtoken' },
    { icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', label: 'Requests', path: '/admin/jtoken-requests' },
    { icon: 'M4 6h16M4 12h16M4 18h10', label: 'History', path: '/admin/jtoken-history' },
    { icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z', label: 'Settings', path: '/admin/settings' },
  ];

  const handleLogout = () => { logout(); navigate('/login'); };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] p-5 font-['Ubuntu',sans-serif]">
        <div className="animate-pulse space-y-5">
          <div className="h-12 w-32 bg-[#1a1a1a] rounded-2xl"></div>
          <div className="grid grid-cols-4 gap-4">
            <div className="h-28 bg-[#1a1a1a] rounded-3xl"></div>
            <div className="h-28 bg-[#1a1a1a] rounded-3xl"></div>
            <div className="h-28 bg-[#1a1a1a] rounded-3xl"></div>
            <div className="h-28 bg-[#1a1a1a] rounded-3xl"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] pb-24 lg:pb-8 font-['Ubuntu',sans-serif]">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/80 z-40" onClick={() => setSidebarOpen(false)} />
      )}

      <div className={`fixed top-0 left-0 h-full w-80 bg-[#0d0d0d] z-50 transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="flex flex-col h-full">
          <div className="p-5 border-b border-[#2a2a2a]">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] bg-clip-text text-transparent">𝙅𝙀𝙓 𝙋𝘼𝙔</h2>
                <p className="text-xs text-gray-500">Admin Panel</p>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="p-2 rounded-xl bg-[#1a1a1a] hover:bg-[#252525] transition-colors lg:hidden">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {menuItems.map((item, index) => (
              <button key={index} onClick={() => { navigate(item.path); setSidebarOpen(false); }} className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl bg-[#1a1a1a]/50 hover:bg-[#D4AF37]/10 text-left transition-all group">
                <div className="w-10 h-10 rounded-xl bg-[#1a1a1a] group-hover:bg-[#D4AF37]/20 flex items-center justify-center transition-colors">
                  <svg className="w-5 h-5 text-[#D4AF37]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                  </svg>
                </div>
                <span className="text-white font-medium">{item.label}</span>
              </button>
            ))}
          </div>
          <div className="p-4 border-t border-[#2a2a2a] pb-24 lg:pb-4">
            <button onClick={handleLogout} className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl bg-red-500/10 hover:bg-red-500/20 text-left transition-all">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </div>
              <span className="text-red-400 font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>

      <div className="sticky top-0 z-30 bg-[#0d0d0d]/80 backdrop-blur-2xl border-b border-[#1a1a1a] lg:hidden">
        <div className="flex items-center justify-between gap-2 px-3 py-3 sm:px-5 sm:py-4">
          <button onClick={() => setSidebarOpen(true)} className="rounded-xl sm:rounded-2xl bg-[#1a1a1a] p-2.5 sm:p-3 hover:bg-[#252525] transition-colors">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="min-w-0 flex-1 truncate text-center text-base sm:text-xl font-bold text-white">Admin Dashboard</h1>
          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            <AdminNotificationBell />
            <button onClick={handleLogout} className="rounded-xl sm:rounded-2xl bg-red-500/10 px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-red-400 hover:bg-red-500/20 lg:hidden">Logout</button>
          </div>
        </div>
      </div>

      <div className="p-5 space-y-5 max-w-2xl mx-auto lg:ml-80 pb-24">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] rounded-3xl p-5 border border-[#2a2a2a]">
            <p className="text-gray-400 text-sm mb-2">Total Users</p>
            <p className="text-3xl font-bold text-white">{stats?.totalUsers || 0}</p>
          </div>
          <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] rounded-3xl p-5 border border-[#2a2a2a]">
            <p className="text-gray-400 text-sm mb-2">Verified Users</p>
            <p className="text-3xl font-bold text-green-400">{stats?.verifiedUsers || 0}</p>
          </div>
          <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] rounded-3xl p-5 border border-[#2a2a2a]">
            <p className="text-gray-400 text-sm mb-2">Pending Deposits</p>
            <p className="text-3xl font-bold text-yellow-400">{stats?.pendingDeposits || 0}</p>
          </div>
          <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] rounded-3xl p-5 border border-[#2a2a2a]">
            <p className="text-gray-400 text-sm mb-2">Pending Withdrawals</p>
            <p className="text-3xl font-bold text-yellow-400">{stats?.pendingWithdrawals || 0}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] rounded-3xl p-5 border border-[#2a2a2a]">
            <p className="text-gray-400 text-sm mb-2">Total Deposits</p>
            <p className="text-3xl font-bold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] bg-clip-text text-transparent">₹{parseFloat(stats?.totalDeposits || 0).toFixed(2)}</p>
          </div>
          <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] rounded-3xl p-5 border border-[#2a2a2a]">
            <p className="text-gray-400 text-sm mb-2">Total Withdrawals</p>
            <p className="text-3xl font-bold text-red-400">₹{parseFloat(stats?.totalWithdrawals || 0).toFixed(2)}</p>
          </div>
        </div>

        <div className="rounded-3xl border border-[#3a3020] bg-[radial-gradient(circle_at_top_left,_rgba(212,175,55,0.16),_transparent_35%),linear-gradient(135deg,#171717_0%,#101010_60%,#090909_100%)] p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-[#D4AF37]">Reward Controls</p>
              <h2 className="mt-2 text-2xl font-bold text-white">J Token reward system overview</h2>
              <p className="mt-2 text-sm text-gray-500">Track issued rewards, redemptions, live supply, and commission settings from one place.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => navigate('/admin/jtoken-requests')} className="rounded-2xl bg-gradient-to-r from-[#D4AF37] to-[#FFD700] px-4 py-3 text-sm font-bold text-black">Open Requests</button>
              <button onClick={() => navigate('/admin/jtoken')} className="rounded-2xl bg-[#1a1a1a] px-4 py-3 text-sm font-bold text-white">Manage J Token</button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] rounded-3xl p-5 border border-[#2a2a2a]">
            <p className="text-gray-400 text-sm mb-2">J Token Issued</p>
            <p className="text-3xl font-bold text-[#D4AF37]">{parseFloat(stats?.totalJTokenIssued || 0).toFixed(2)}</p>
          </div>
          <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] rounded-3xl p-5 border border-[#2a2a2a]">
            <p className="text-gray-400 text-sm mb-2">J Token Redeemed</p>
            <p className="text-3xl font-bold text-emerald-400">{parseFloat(stats?.totalJTokenRedeemed || 0).toFixed(2)}</p>
          </div>
          <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] rounded-3xl p-5 border border-[#2a2a2a]">
            <p className="text-gray-400 text-sm mb-2">J Token In Wallets</p>
            <p className="text-3xl font-bold text-white">{parseFloat(stats?.totalJTokenInWallets || 0).toFixed(2)}</p>
          </div>
          <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] rounded-3xl p-5 border border-[#2a2a2a]">
            <p className="text-gray-400 text-sm mb-2">Reward Payouts</p>
            <p className="text-3xl font-bold text-sky-400">₹{parseFloat(stats?.totalRewardPayouts || 0).toFixed(2)}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] rounded-3xl p-5 border border-[#2a2a2a]">
            <p className="text-gray-400 text-sm mb-2">Today Reward Payouts</p>
            <p className="text-3xl font-bold text-emerald-400">₹{parseFloat(stats?.todayRewardPayouts || 0).toFixed(2)}</p>
          </div>
          <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] rounded-3xl p-5 border border-[#2a2a2a]">
            <p className="text-gray-400 text-sm mb-2">J Token / USDT Commission</p>
            <p className="text-3xl font-bold text-white">{parseFloat(stats?.jTokenCommissionPercent || 0).toFixed(1)}% / {parseFloat(stats?.usdtCommissionPercent || 0).toFixed(1)}%</p>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-[#0d0d0d]/95 backdrop-blur-2xl border-t border-[#1a1a1a] lg:hidden z-50">
        <div className="flex items-center justify-around py-2 px-1">
          <button onClick={() => navigate('/admin/dashboard')} className="flex flex-col items-center gap-1.5 p-2 text-[#D4AF37]">
            <div className="w-10 h-10 rounded-2xl bg-[#D4AF37]/20 flex items-center justify-center">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
              </svg>
            </div>
            <span className="text-xs font-medium">Home</span>
          </button>
          <button onClick={() => navigate('/admin/users')} className="flex flex-col items-center gap-1.5 p-2 text-gray-500 hover:text-white transition-colors">
            <div className="w-10 h-10 rounded-2xl bg-[#1a1a1a] flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <span className="text-xs font-medium">Users</span>
          </button>
          <button onClick={() => navigate('/admin/deposits')} className="flex flex-col items-center gap-1.5 p-2 text-gray-500 hover:text-white transition-colors">
            <div className="w-10 h-10 rounded-2xl bg-[#1a1a1a] flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <span className="text-xs font-medium">Deposits</span>
          </button>
          <button onClick={() => navigate('/admin/withdrawals')} className="flex flex-col items-center gap-1.5 p-2 text-gray-500 hover:text-white transition-colors">
            <div className="w-10 h-10 rounded-2xl bg-[#1a1a1a] flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </div>
            <span className="text-xs font-medium">Withdraw</span>
          </button>
          <button onClick={() => navigate('/admin/settings')} className="flex flex-col items-center gap-1.5 p-2 text-gray-500 hover:text-white transition-colors">
            <div className="w-10 h-10 rounded-2xl bg-[#1a1a1a] flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              </svg>
            </div>
            <span className="text-xs font-medium">Settings</span>
          </button>
          <button onClick={() => navigate('/admin/jtoken')} className="flex flex-col items-center gap-1.5 p-2 text-gray-500 hover:text-white transition-colors">
            <div className="w-10 h-10 rounded-2xl bg-[#1a1a1a] flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-xs font-medium">J Token</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
