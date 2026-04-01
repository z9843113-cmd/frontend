import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import { useAuthStore } from '../../store';
import AdminNotificationBell from '../../components/AdminNotificationBell';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const { logout } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try { 
        const res = await adminAPI.getUsers({ page, limit: 20, search }); 
        const data = res?.data || res; 
        setUsers(data?.users || []); 
        setTotalPages(data?.totalPages || 1); 
      }
      catch { console.log('Failed to fetch users'); }
      finally { setLoading(false); }
    };
    fetchUsers();
  }, [page, search]);

  const handleBlockToggle = async (userId, isBlocked) => {
    try { 
      await adminAPI.toggleUserBlock(userId, { isBlocked: !isBlocked }); 
      fetchUsers(); 
      if (selectedUser?.id === userId) {
        setSelectedUser({ ...selectedUser, isBlocked: !isBlocked });
      }
    }
    catch { console.error('Failed to toggle block'); }
  };

  const viewUserDetails = async (userId) => {
    setLoadingDetails(true);
    try {
      const res = await adminAPI.getUserDetails(userId);
      setUserDetails(res?.data || res);
      setSelectedUser(users.find(u => u.id === userId));
    } catch (err) {
      console.error('Failed to fetch user details:', err);
    } finally {
      setLoadingDetails(false);
    }
  };

  const menuItems = [
    { icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v-6a1 1 0 00-1-1h-3m-9 16v2a1 1 0 001 1h2', label: 'Home', path: '/admin/dashboard' },
    { icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z', label: 'Users', path: '/admin/users' },
    { icon: 'M12 4v16m8-8H4', label: 'Deposits', path: '/admin/deposits' },
    { icon: 'M20 12H4', label: 'Withdraw', path: '/admin/withdrawals' },
    { icon: 'M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z', label: 'UPI Apps', path: '/admin/upi-apps' },
    { icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', label: 'UPI Verify', path: '/admin/upi-verifications' },
    { icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z', label: 'Crypto', path: '/admin/crypto' },
    { icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z', label: 'Settings', path: '/admin/settings' },
  ];

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="min-h-screen bg-[#0a0a0a] pb-24 lg:pb-8 font-['Ubuntu',sans-serif]">
      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => { setSelectedUser(null); setUserDetails(null); }}>
          <div className="bg-[#0d0d0d] border border-[#2a2a2a] rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-[#0d0d0d] border-b border-[#2a2a2a] p-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">User Details</h3>
              <button onClick={() => { setSelectedUser(null); setUserDetails(null); }} className="p-2 rounded-xl bg-[#1a1a1a] hover:bg-[#252525]">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {loadingDetails ? (
              <div className="p-8 text-center">
                <div className="animate-spin w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full mx-auto"></div>
                <p className="text-gray-400 mt-4">Loading user details...</p>
              </div>
            ) : userDetails ? (
              <div className="p-4 space-y-4">
                {/* Basic Info */}
                <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] rounded-2xl p-4 border border-[#2a2a2a]">
                  <h4 className="text-[#D4AF37] font-semibold mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    Basic Information
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="bg-[#0a0a0a] rounded-xl p-3">
                      <p className="text-gray-500 text-xs">User ID</p>
                      <p className="text-white font-mono text-xs truncate">{userDetails.user?.id}</p>
                    </div>
                    <div className="bg-[#0a0a0a] rounded-xl p-3">
                      <p className="text-gray-500 text-xs">Email</p>
                      <p className="text-white font-medium">{userDetails.user?.email || 'N/A'}</p>
                    </div>
                    <div className="bg-[#0a0a0a] rounded-xl p-3">
                      <p className="text-gray-500 text-xs">Name</p>
                      <p className="text-white font-medium">{userDetails.user?.name || 'Not set'}</p>
                    </div>
                    <div className="bg-[#0a0a0a] rounded-xl p-3">
                      <p className="text-gray-500 text-xs">Mobile</p>
                      <p className="text-white font-medium">{userDetails.user?.mobile || 'Not set'}</p>
                    </div>
                    <div className="bg-[#0a0a0a] rounded-xl p-3">
                      <p className="text-gray-500 text-xs">Referral Code</p>
                      <p className="text-[#D4AF37] font-mono font-bold">{userDetails.user?.referralcode}</p>
                    </div>
                    <div className="bg-[#0a0a0a] rounded-xl p-3">
                      <p className="text-gray-500 text-xs">Status</p>
                      <span className={`inline-block px-2 py-1 rounded-lg text-xs ${userDetails.user?.isblocked ? 'bg-red-500/20 text-red-400' : userDetails.user?.isverified ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                        {userDetails.user?.isblocked ? 'Blocked' : userDetails.user?.isverified ? 'Active' : 'Unverified'}
                      </span>
                    </div>
                    <div className={`rounded-xl p-3 ${userDetails.paymentEnabled ? 'bg-green-500/10 border border-green-500/30' : 'bg-red-500/10 border border-red-500/30'}`}>
                      <p className="text-gray-500 text-xs">Receive Payment</p>
                      <p className={`font-bold text-sm ${userDetails.paymentEnabled ? 'text-green-400' : 'text-red-400'}`}>
                        {userDetails.paymentEnabled ? '✓ Able to receive payment' : '✕ Cannot receive payment'}
                      </p>
                      {!userDetails.paymentEnabled && <p className="text-red-400/70 text-xs mt-1">User has disabled payments</p>}
                    </div>
                    <div className="bg-[#0a0a0a] rounded-xl p-3">
                      <p className="text-gray-500 text-xs">Telegram Name</p>
                      <p className="text-white font-medium">{userDetails.user?.telegramname || 'N/A'}</p>
                    </div>
                    <div className="bg-[#0a0a0a] rounded-xl p-3">
                      <p className="text-gray-500 text-xs">Telegram Username</p>
                      <p className="text-white font-medium">{userDetails.user?.telegramusername || 'N/A'}</p>
                    </div>
                    <div className="bg-[#0a0a0a] rounded-xl p-3">
                      <p className="text-gray-500 text-xs">Telegram Chat ID</p>
                      <p className="text-white font-medium">{userDetails.user?.telegramchatid || 'N/A'}</p>
                    </div>
                    <div className="bg-[#0a0a0a] rounded-xl p-3">
                      <p className="text-gray-500 text-xs">Telegram</p>
                      <p className={`font-medium ${userDetails.user?.telegramid ? 'text-green-400' : 'text-gray-500'}`}>
                        {userDetails.user?.telegramid ? 'Connected' : 'Not connected'}
                      </p>
                    </div>
                    <div className="bg-[#0a0a0a] rounded-xl p-3">
                      <p className="text-gray-500 text-xs">Joined</p>
                      <p className="text-white">{userDetails.user?.createdat ? new Date(userDetails.user.createdat).toLocaleDateString() : 'N/A'}</p>
                    </div>
                    <div className="bg-[#0a0a0a] rounded-xl p-3">
                      <p className="text-gray-500 text-xs">PIN Status</p>
                      <p className={`font-medium ${userDetails.user?.pinEnabled ? 'text-green-400' : 'text-gray-500'}`}>
                        {userDetails.user?.pinEnabled ? 'Enabled' : 'Not Set'}
                      </p>
                    </div>
                    <div className="bg-[#0a0a0a] rounded-xl p-3">
                      <p className="text-gray-500 text-xs">KYC Status</p>
                      <p className={`font-medium ${userDetails.user?.kycStatus === 'verified' ? 'text-green-400' : userDetails.user?.kycStatus === 'pending' ? 'text-yellow-400' : 'text-gray-500'}`}>
                        {userDetails.user?.kycStatus || 'Not Verified'}
                      </p>
                    </div>
                    <div className="bg-[#0a0a0a] rounded-xl p-3">
                      <p className="text-gray-500 text-xs">Referral By</p>
                      <p className="text-white font-medium">{userDetails.user?.referredby || 'N/A'}</p>
                    </div>
                    <div className="bg-[#0a0a0a] rounded-xl p-3">
                      <p className="text-gray-500 text-xs">UPI Accounts</p>
                      <p className="text-white font-medium">{userDetails.upiAccounts?.length || 0}</p>
                    </div>
                    <div className="bg-[#0a0a0a] rounded-xl p-3">
                      <p className="text-gray-500 text-xs">Bank Accounts</p>
                      <p className="text-white font-medium">{userDetails.bankAccounts?.length || 0}</p>
                    </div>
                  </div>
                </div>

                {/* Wallet */}
                <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] rounded-2xl p-4 border border-[#2a2a2a]">
                  <h4 className="text-[#D4AF37] font-semibold mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                    Wallet Balance
                  </h4>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-[#0a0a0a] rounded-xl p-3 text-center">
                      <p className="text-gray-500 text-xs">INR Balance</p>
                      <p className="text-green-400 font-bold text-lg">₹{parseFloat(userDetails.wallet?.inrbalance || 0).toFixed(2)}</p>
                    </div>
                    <div className="bg-[#0a0a0a] rounded-xl p-3 text-center">
                      <p className="text-gray-500 text-xs">USDT</p>
                      <p className="text-blue-400 font-bold text-lg">${parseFloat(userDetails.wallet?.usdtbalance || 0).toFixed(2)}</p>
                    </div>
                    <div className="bg-[#0a0a0a] rounded-xl p-3 text-center">
                      <p className="text-gray-500 text-xs">J Token</p>
                      <p className="text-purple-400 font-bold text-lg">{parseFloat(userDetails.wallet?.tokenbalance || 0).toFixed(2)}</p>
                    </div>
                  </div>
                </div>

                {/* UPI Accounts */}
                <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] rounded-2xl p-4 border border-[#2a2a2a]">
                  <h4 className="text-[#D4AF37] font-semibold mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    UPI Accounts ({userDetails.upiAccounts?.length || 0})
                  </h4>
                  {userDetails.upiAccounts?.length > 0 ? (
                    <div className="space-y-2">
                      {userDetails.upiAccounts?.map((upi, i) => (
                        <div key={i} className="bg-[#0a0a0a] rounded-xl p-3">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="text-white font-medium">{upi.upiid}</p>
                              <p className="text-[#D4AF37] text-xs">{upi.appName || 'UPI App'}</p>
                            </div>
                            <span className={`px-2 py-1 rounded-lg text-xs ${upi.isprimary ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                              {upi.isprimary ? 'Primary' : 'Secondary'}
                            </span>
                          </div>
                          <div className="flex gap-2 mt-2">
                            <span className={`px-2 py-1 rounded-lg text-xs ${upi.isactive || upi.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                              {upi.isactive || upi.status === 'active' ? 'Active' : 'Pending'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">No UPI accounts linked</p>
                  )}
                </div>

                {/* UPI Verifications */}
                <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] rounded-2xl p-4 border border-[#2a2a2a]">
                  <h4 className="text-[#D4AF37] font-semibold mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    UPI Verifications ({userDetails.upiVerifications?.length || 0})
                  </h4>
                  {userDetails.upiVerifications?.length > 0 ? (
                    <div className="space-y-2">
                      {userDetails.upiVerifications?.map((v, i) => (
                        <div key={i} className="bg-[#0a0a0a] rounded-xl p-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-white font-medium">{v.upiid}</p>
                              {v.appName && <p className="text-[#D4AF37] text-xs">{v.appName}</p>}
                              <p className="text-gray-500 text-xs">{v.createdat ? new Date(v.createdat).toLocaleDateString() : ''}</p>
                            </div>
                            <span className={`px-2 py-1 rounded-lg text-xs ${
                              v.status === 'APPROVED' || v.status === 'VERIFIED' ? 'bg-green-500/20 text-green-400' : 
                              v.status === 'PENDING' || v.status === 'OTP_REQUESTED' || v.status === 'OTP_SUBMITTED' ? 'bg-yellow-500/20 text-yellow-400' : 
                              'bg-red-500/20 text-red-400'
                            }`}>
                              {v.status || 'PENDING'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">No pending verifications</p>
                  )}
                </div>

                {/* Bank Accounts */}
                <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] rounded-2xl p-4 border border-[#2a2a2a]">
                  <h4 className="text-[#D4AF37] font-semibold mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                    Bank Accounts ({userDetails.bankAccounts?.length || 0})
                  </h4>
                  {userDetails.bankAccounts?.length > 0 ? (
                    <div className="space-y-2">
                      {userDetails.bankAccounts?.map((bank, i) => (
                        <div key={i} className="bg-[#0a0a0a] rounded-xl p-3">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="text-white font-medium">{bank.holdername}</p>
                              <p className="text-gray-400 text-sm">{bank.bankname}</p>
                            </div>
                            <span className={`px-2 py-1 rounded-lg text-xs ${bank.isprimary ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                              {bank.isprimary ? 'Primary' : 'Secondary'}
                            </span>
                          </div>
                          <p className="text-gray-500 text-xs">A/C: {bank.accountnumber}</p>
                          <p className="text-gray-500 text-xs">IFSC: {bank.ifsccode}</p>
                          <div className="flex gap-2 mt-2">
                            <span className={`px-2 py-1 rounded-lg text-xs ${bank.isactive || bank.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                              {bank.isactive || bank.status === 'active' ? 'Active' : 'Pending'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">No bank accounts linked</p>
                  )}
                </div>

                {/* Recent Deposits */}
                <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] rounded-2xl p-4 border border-[#2a2a2a]">
                  <h4 className="text-[#D4AF37] font-semibold mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    Recent Deposits ({userDetails.deposits?.length || 0})
                  </h4>
                  {userDetails.deposits?.length > 0 ? (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {userDetails.deposits?.map((dep, i) => (
                        <div key={i} className="bg-[#0a0a0a] rounded-xl p-3 flex justify-between items-center">
                          <div>
                            <p className="text-white font-medium">₹{parseFloat(dep.amount).toFixed(2)}</p>
                            <p className="text-gray-500 text-xs">{new Date(dep.createdat).toLocaleString()}</p>
                          </div>
                          <span className={`px-2 py-1 rounded-lg text-xs ${dep.status === 'APPROVED' ? 'bg-green-500/20 text-green-400' : dep.status === 'REJECTED' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                            {dep.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">No deposits</p>
                  )}
                </div>

                {/* Recent Withdrawals */}
                <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] rounded-2xl p-4 border border-[#2a2a2a]">
                  <h4 className="text-[#D4AF37] font-semibold mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>
                    Recent Withdrawals ({userDetails.withdrawals?.length || 0})
                  </h4>
                  {userDetails.withdrawals?.length > 0 ? (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {userDetails.withdrawals?.map((wd, i) => (
                        <div key={i} className="bg-[#0a0a0a] rounded-xl p-3 flex justify-between items-center">
                          <div>
                            <p className="text-white font-medium">₹{parseFloat(wd.amount).toFixed(2)}</p>
                            <p className="text-gray-500 text-xs">{new Date(wd.createdat).toLocaleString()}</p>
                          </div>
                          <span className={`px-2 py-1 rounded-lg text-xs ${wd.status === 'APPROVED' ? 'bg-green-500/20 text-green-400' : wd.status === 'REJECTED' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                            {wd.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">No withdrawals</p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button onClick={() => handleBlockToggle(userDetails.user.id, userDetails.user.isblocked)} className={`flex-1 py-3 rounded-xl font-semibold ${userDetails.user.isblocked ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                    {userDetails.user.isblocked ? 'Unblock User' : 'Block User'}
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {sidebarOpen && <div className="fixed inset-0 bg-black/80 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <div className={`fixed top-0 left-0 h-full w-72 sm:w-80 bg-[#0d0d0d] z-50 transform transition-transform duration-300 lg:hidden ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-4 sm:p-5 border-b border-[#2a2a2a]">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] bg-clip-text text-transparent">𝙅𝙀𝙓 𝙋𝘼𝙔</h2>
              <p className="text-xs text-gray-500">Admin Panel</p>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="p-2 rounded-xl bg-[#1a1a1a] hover:bg-[#252525]">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>
        <div className="p-3 sm:p-4 space-y-1.5 sm:space-y-2">
          {menuItems.map((item, index) => (
            <button key={index} onClick={() => { navigate(item.path); setSidebarOpen(false); }} className="w-full flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-[#1a1a1a]/50 hover:bg-[#D4AF37]/10 text-left transition-all group">
              <div className="w-9 sm:w-10 h-9 sm:h-10 rounded-lg sm:rounded-xl bg-[#1a1a1a] group-hover:bg-[#D4AF37]/20 flex items-center justify-center transition-colors">
                <svg className="w-4 sm:w-5 h-4 sm:h-5 text-[#D4AF37]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} /></svg>
              </div>
              <span className="text-white font-medium text-sm sm:text-base">{item.label}</span>
            </button>
          ))}
          <hr className="border-[#2a2a2a] my-3 sm:my-4" />
          <button onClick={handleLogout} className="w-full flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-red-500/10 hover:bg-red-500/20 text-left transition-all">
            <div className="w-9 sm:w-10 h-9 sm:h-10 rounded-lg sm:rounded-xl bg-red-500/20 flex items-center justify-center">
              <svg className="w-4 sm:w-5 h-4 sm:h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            </div>
            <span className="text-red-400 font-medium text-sm sm:text-base">Logout</span>
          </button>
        </div>
      </div>

      <div className="sticky top-0 z-30 bg-[#0d0d0d]/80 backdrop-blur-2xl border-b border-[#1a1a1a]">
        <div className="flex items-center justify-between gap-2 px-3 py-3 sm:px-4 sm:py-3">
          <button onClick={() => setSidebarOpen(true)} className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-[#1a1a1a] hover:bg-[#252525] transition-colors">
            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
          <h1 className="min-w-0 flex-1 truncate text-center text-lg sm:text-xl font-bold text-white">Users</h1>
          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            <AdminNotificationBell />
            <button onClick={handleLogout} className="rounded-xl sm:rounded-2xl bg-red-500/10 px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-red-400 hover:bg-red-500/20">Logout</button>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-5 space-y-5 max-w-2xl mx-auto">
        <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] rounded-3xl p-4 sm:p-5 border border-[#2a2a2a]">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h2 className="text-white font-semibold">All Users</h2>
            <span className="text-xs sm:text-sm text-gray-500">{users.length} users</span>
          </div>
          <input type="text" placeholder="Search email or referral code..." value={searchInput} onChange={(e) => setSearchInput(e.target.value)} className="w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded-xl sm:rounded-2xl px-4 sm:px-5 py-3 sm:py-4 text-white placeholder-gray-500 focus:border-[#D4AF37] focus:outline-none text-sm sm:text-base" />
          {loading ? (
            <div className="animate-pulse space-y-3 mt-4">
              {[1,2,3,4,5].map(i => <div key={i} className="h-20 sm:h-16 bg-[#0a0a0a] rounded-2xl"></div>)}
            </div>
          ) : users.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No users found</p>
          ) : (
            <div className="space-y-3 mt-4">
              {users.map((user) => (
                <div key={user.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-[#0a0a0a] rounded-2xl border border-[#1a1a1a] gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-white font-medium truncate">{user?.email || 'N/A'}</p>
                      {user.mobile && <span className="text-gray-500 text-xs">📱 {user.mobile}</span>}
                    </div>
                    <p className="text-gray-500 text-sm">Ref: {user.referralcode}</p>
                    <p className="text-gray-600 text-xs mt-1">{user.createdat ? new Date(user.createdat).toLocaleDateString() : ''}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button onClick={() => viewUserDetails(user.id)} className="px-4 py-2 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 rounded-xl text-sm font-medium transition-colors">
                      View Details
                    </button>
                    <span className={`px-3 py-1 rounded-xl text-xs whitespace-nowrap ${user.isblocked ? 'bg-red-500/20 text-red-400' : user.isverified ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                      {user.isblocked ? 'Blocked' : user.isverified ? 'Active' : 'Unverified'}
                    </span>
                    <button onClick={() => handleBlockToggle(user.id, user.isblocked)} className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap ${user.isblocked ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'} transition-colors`}>
                      {user.isblocked ? 'Unblock' : 'Block'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          {totalPages > 1 && (
            <div className="flex flex-wrap justify-center items-center gap-2 mt-4">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 sm:px-4 py-2 bg-[#1a1a1a] text-white rounded-xl disabled:opacity-50 text-sm">Prev</button>
              <span className="text-gray-400 text-sm px-2">{page} / {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 sm:px-4 py-2 bg-[#1a1a1a] text-white rounded-xl disabled:opacity-50 text-sm">Next</button>
            </div>
          )}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-[#0d0d0d]/95 backdrop-blur-2xl border-t border-[#1a1a1a] lg:hidden z-50">
        <div className="flex items-center justify-around py-1.5 sm:py-2 px-1">
          <button onClick={() => navigate('/admin/dashboard')} className="flex flex-col items-center gap-1 p-1.5 sm:p-2 text-gray-500 hover:text-white transition-colors">
            <div className="w-9 sm:w-10 h-9 sm:h-10 rounded-xl sm:rounded-2xl bg-[#1a1a1a] flex items-center justify-center">
              <svg className="w-4 sm:w-5 h-4 sm:h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" /></svg>
            </div>
            <span className="text-[10px] sm:text-xs font-medium">Home</span>
          </button>
          <button onClick={() => navigate('/admin/users')} className="flex flex-col items-center gap-1 p-1.5 sm:p-2 text-[#D4AF37]">
            <div className="w-9 sm:w-10 h-9 sm:h-10 rounded-xl sm:rounded-2xl bg-[#D4AF37]/20 flex items-center justify-center">
              <svg className="w-4 sm:w-5 h-4 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            </div>
            <span className="text-[10px] sm:text-xs font-medium">Users</span>
          </button>
          <button onClick={() => navigate('/admin/deposits')} className="flex flex-col items-center gap-1 p-1.5 sm:p-2 text-gray-500 hover:text-white transition-colors">
            <div className="w-9 sm:w-10 h-9 sm:h-10 rounded-xl sm:rounded-2xl bg-[#1a1a1a] flex items-center justify-center">
              <svg className="w-4 sm:w-5 h-4 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            </div>
            <span className="text-[10px] sm:text-xs font-medium">Deposits</span>
          </button>
          <button onClick={() => navigate('/admin/withdrawals')} className="flex flex-col items-center gap-1 p-1.5 sm:p-2 text-gray-500 hover:text-white transition-colors">
            <div className="w-9 sm:w-10 h-9 sm:h-10 rounded-xl sm:rounded-2xl bg-[#1a1a1a] flex items-center justify-center">
              <svg className="w-4 sm:w-5 h-4 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>
            </div>
            <span className="text-[10px] sm:text-xs font-medium">Withdraw</span>
          </button>
          <button onClick={() => navigate('/admin/settings')} className="flex flex-col items-center gap-1 p-1.5 sm:p-2 text-gray-500 hover:text-white transition-colors">
            <div className="w-9 sm:w-10 h-9 sm:h-10 rounded-xl sm:rounded-2xl bg-[#1a1a1a] flex items-center justify-center">
              <svg className="w-4 sm:w-5 h-4 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /></svg>
            </div>
            <span className="text-[10px] sm:text-xs font-medium">Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
