import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import { useAuthStore } from '../../store';
import AdminNotificationBell from '../../components/AdminNotificationBell';

const AdminActiveUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const { logout } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => { fetchUsers(); }, [page, search]);

  const fetchUsers = async () => {
    setLoading(true);
    try { 
      const res = await adminAPI.getUsers({ page, limit: 30, search, paymentEnabled: true }); 
      const data = res?.data || res; 
      setUsers(data?.users || []); 
      setTotalPages(data?.totalPages || 1); 
    }
    catch { console.log('Failed to fetch users'); }
    finally { setLoading(false); }
  };

  const viewUserDetails = async (userId) => {
    try {
      const res = await adminAPI.getUserDetails(userId);
      setUserDetails(res?.data || res);
      setSelectedUser(users.find(u => u.id === userId));
    } catch (err) {
      console.error('Failed to fetch user details:', err);
    }
  };

  const menuItems = [
    { icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v-6a1 1 0 00-1-1h-3m-9 16v2a1 1 0 001 1h2', label: 'Home', path: '/admin/dashboard' },
    { icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z', label: 'Users', path: '/admin/users' },
    { icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', label: 'Active Users', path: '/admin/active-users' },
    { icon: 'M12 4v16m8-8H4', label: 'Deposits', path: '/admin/deposits' },
    { icon: 'M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z', label: 'UPI Apps', path: '/admin/upi-apps' },
    { icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', label: 'UPI Verify', path: '/admin/upi-verifications' },
    { icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z', label: 'Crypto', path: '/admin/crypto' },
    { icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z', label: 'J Token', path: '/admin/jtoken' },
    { icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', label: 'Requests', path: '/admin/jtoken-requests' },
    { icon: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4', label: 'Exchange', path: '/admin/exchange' },
    { icon: 'M4 6h16M4 12h16M4 18h10', label: 'History', path: '/admin/jtoken-history' },
    { icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z', label: 'Settings', path: '/admin/settings' },
  ];

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="min-h-screen bg-[#0a0a0a] font-['Ubuntu',sans-serif] pb-20">
      <div className={`fixed top-0 left-0 h-full w-72 bg-[#0d0d0d] border-r border-[#242424] transform transition-transform z-50 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="p-5 border-b border-[#242424]">
          <img src="/jexpaylogo.png" alt="Logo" className="h-10" />
        </div>
        <div className="p-4 space-y-2 overflow-y-auto h-[calc(100vh-140px)]">
          {menuItems.map((item, index) => (
            <button key={index} onClick={() => { navigate(item.path); setSidebarOpen(false); }} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-left transition-all ${item.path === '/admin/active-users' ? 'bg-[#D4AF37]/10 text-white' : 'bg-[#1a1a1a]/50 hover:bg-[#D4AF37]/10 text-gray-300'}`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.path === '/admin/active-users' ? 'bg-[#D4AF37]/20' : 'bg-[#1a1a1a]'}`}>
                <svg className="w-5 h-5 text-[#D4AF37]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} /></svg>
              </div>
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-[#242424]">
          <button onClick={handleLogout} className="w-full py-3 bg-red-500/20 text-red-400 rounded-xl font-semibold hover:bg-red-500/30">Logout</button>
        </div>
      </div>

      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <div className="lg:ml-72">
        <div className="sticky top-0 z-30 bg-[#0d0d0d] border-b border-[#242424] px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 bg-[#1a1a1a] rounded-xl text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <h1 className="text-white font-bold text-xl">Active Users</h1>
          </div>
          <AdminNotificationBell />
        </div>

        <div className="p-4">
          <div className="mb-4">
            <input type="text" placeholder="Search by email, ID or referral code..." value={searchInput} onChange={(e) => { setSearchInput(e.target.value); setPage(1); }} className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#242424] rounded-xl text-white placeholder-gray-500 focus:border-[#D4AF37] focus:outline-none" />
          </div>

          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-gray-400 text-sm border-b border-[#242424]">
                  <th className="pb-3 pl-2">User</th>
                  <th className="pb-3">Mobile</th>
                  <th className="pb-3">UPI ID</th>
                  <th className="pb-3">UPI App</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Joined</th>
                  <th className="pb-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} className="py-8 text-center text-gray-400">Loading...</td></tr>
                ) : users.length === 0 ? (
                  <tr><td colSpan={7} className="py-8 text-center text-gray-400">No active users found</td></tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="border-b border-[#1a1a1a] hover:bg-[#1a1a1a]/50">
                      <td className="py-3 pl-2">
                        <div>
                          <p className="text-white font-medium">{user.name || 'N/A'}</p>
                          <p className="text-gray-500 text-xs">{user.email}</p>
                          <div className="flex items-center gap-1 mt-1">
                            <p className="text-gray-600 text-xs font-mono">ID: {user.id}</p>
                            <button 
                              onClick={() => { navigator.clipboard.writeText(user.id); }}
                              className="p-1 bg-[#1a1a1a] hover:bg-[#252525] rounded text-gray-400 hover:text-[#D4AF37]"
                              title="Copy ID"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 text-gray-300">{user.mobile || 'N/A'}</td>
                      <td className="py-3 text-gray-300 text-sm">{user.upiId || 'N/A'}</td>
                      <td className="py-3 text-[#D4AF37] text-sm">{user.appName || 'N/A'}</td>
                      <td className="py-3">
                        <span className={`px-2 py-1 rounded-lg text-xs ${user.isblocked ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                          {user.isblocked ? 'Blocked' : 'Active'}
                        </span>
                      </td>
                      <td className="py-3 text-gray-400 text-sm">{user.createdat ? new Date(user.createdat).toLocaleDateString() : 'N/A'}</td>
                      <td className="py-3">
                        <button onClick={() => viewUserDetails(user.id)} className="px-3 py-1.5 bg-[#D4AF37]/20 text-[#D4AF37] rounded-lg text-sm hover:bg-[#D4AF37]/30">View</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="lg:hidden space-y-3">
            {loading ? (
              <div className="text-center py-8 text-gray-400">Loading...</div>
            ) : users.length === 0 ? (
              <div className="text-center py-8 text-gray-400">No active users found</div>
            ) : (
              users.map((user) => (
                <div key={user.id} className="bg-[#1a1a1a] rounded-xl p-4 border border-[#242424]">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="text-white font-medium text-lg">{user.name || 'N/A'}</p>
                      <p className="text-gray-400 text-sm">{user.email}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <p className="text-gray-600 text-xs font-mono">ID: {user.id}</p>
                        <button 
                          onClick={() => { navigator.clipboard.writeText(user.id); }}
                          className="p-1 bg-[#252525] hover:bg-[#303030] rounded text-gray-400 hover:text-[#D4AF37]"
                          title="Copy ID"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-lg text-xs ${user.isblocked ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                      {user.isblocked ? 'Blocked' : 'Active'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                    <div><span className="text-gray-500">Mobile:</span> <span className="text-white ml-1">{user.mobile || 'N/A'}</span></div>
                    <div><span className="text-gray-500">Joined:</span> <span className="text-white ml-1">{user.createdat ? new Date(user.createdat).toLocaleDateString() : 'N/A'}</span></div>
                    <div><span className="text-gray-500">UPI ID:</span> <span className="text-white ml-1">{user.upiId || 'N/A'}</span></div>
                    <div><span className="text-gray-500">UPI App:</span> <span className="text-[#D4AF37] ml-1">{user.appName || 'N/A'}</span></div>
                  </div>
                  <button onClick={() => viewUserDetails(user.id)} className="w-full py-2 bg-[#D4AF37]/20 text-[#D4AF37] rounded-lg text-sm hover:bg-[#D4AF37]/30">View Details</button>
                </div>
              ))
            )}
          </div>

          <div className="flex items-center justify-between mt-4">
            <button onClick={() => setPage(p => Math.max(p - 1, 1))} disabled={page === 1} className="px-4 py-2 bg-[#1a1a1a] text-gray-400 rounded-xl disabled:opacity-40">Previous</button>
            <p className="text-gray-400 text-sm">Page {page} of {totalPages}</p>
            <button onClick={() => setPage(p => Math.min(p + 1, totalPages))} disabled={page >= totalPages} className="px-4 py-2 bg-[#1a1a1a] text-gray-400 rounded-xl disabled:opacity-40">Next</button>
          </div>
        </div>
      </div>

      {selectedUser && userDetails && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => { setSelectedUser(null); setUserDetails(null); }}>
          <div className="bg-[#0d0d0d] rounded-3xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-[#242424]" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white font-bold text-xl">User Details</h3>
              <button onClick={() => { setSelectedUser(null); setUserDetails(null); }} className="text-gray-400 text-2xl">&times;</button>
            </div>
            
            <div className="space-y-4">
              <div className="bg-[#1a1a1a] rounded-xl p-4">
                <h4 className="text-[#D4AF37] font-semibold mb-3">Basic Info</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-gray-500">Email:</span> <span className="text-white ml-1">{userDetails.user?.email}</span></div>
                  <div><span className="text-gray-500">Name:</span> <span className="text-white ml-1">{userDetails.user?.name}</span></div>
                  <div><span className="text-gray-500">Mobile:</span> <span className="text-white ml-1">{userDetails.user?.mobile}</span></div>
                  <div><span className="text-gray-500">Referral:</span> <span className="text-[#D4AF37] ml-1">{userDetails.user?.referralcode}</span></div>
                  <div><span className="text-gray-500">Joined:</span> <span className="text-white ml-1">{userDetails.user?.createdat ? new Date(userDetails.user.createdat).toLocaleString() : 'N/A'}</span></div>
                </div>
              </div>

              <div className="bg-[#1a1a1a] rounded-xl p-4">
                <h4 className="text-[#D4AF37] font-semibold mb-3">Wallet</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-gray-500">INR:</span> <span className="text-white ml-1">₹{parseFloat(userDetails.wallet?.inrbalance || 0).toFixed(2)}</span></div>
                  <div><span className="text-gray-500">USDT:</span> <span className="text-white ml-1">{parseFloat(userDetails.wallet?.usdtbalance || 0).toFixed(2)}</span></div>
                  <div><span className="text-gray-500">J Token:</span> <span className="text-white ml-1">{parseFloat(userDetails.wallet?.tokenbalance || 0).toFixed(2)}</span></div>
                  <div><span className="text-gray-500">Referral:</span> <span className="text-white ml-1">₹{parseFloat(userDetails.wallet?.referralbalance || 0).toFixed(2)}</span></div>
                </div>
              </div>

              {userDetails.upiAccounts?.length > 0 && (
                <div className="bg-[#1a1a1a] rounded-xl p-4">
                  <h4 className="text-[#D4AF37] font-semibold mb-3">UPI Accounts</h4>
                  <div className="space-y-2">
                    {userDetails.upiAccounts.map((upi, i) => (
                      <div key={i} className="flex justify-between items-center p-2 bg-[#0a0a0a] rounded-lg">
                        <div>
                          <p className="text-white text-sm">{upi.upiid}</p>
                          <p className="text-[#D4AF37] text-xs">{upi.appName || 'UPI App'}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-lg text-xs ${upi.isactive ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                          {upi.isactive ? 'Active' : 'Pending'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminActiveUsers;
