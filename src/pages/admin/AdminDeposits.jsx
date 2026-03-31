import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import { useAuthStore } from '../../store';
import AdminNotificationBell from '../../components/AdminNotificationBell';

const AdminDeposits = () => {
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [processingId, setProcessingId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userDetails, setUserDetails] = useState(null);
  const [showUserPopup, setShowUserPopup] = useState(false);
  const [, setLoadingUser] = useState(false);
  const { logout } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => { fetchDeposits(); }, [page, status]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchDeposits = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await adminAPI.getDeposits({ page, limit: 20, status });
      setDeposits(res.deposits || []);
      setTotal(res.total || 0);
    } catch (err) {
      setError(err?.message || 'Failed to load deposits');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserDetails = async (userId) => {
    setLoadingUser(true);
    try {
      const res = await adminAPI.getUserDetails(userId);
      setUserDetails(res);
      setShowUserPopup(true);
    } catch {
      alert('Failed to load user details');
    } finally {
      setLoadingUser(false);
    }
  };

  const handleApprove = async (depositId) => {
    if (!window.confirm('Approve this deposit?')) return;
    setProcessingId(depositId);
    try {
      await adminAPI.approveDeposit(depositId);
      alert('Deposit approved!');
      fetchDeposits();
    } catch (err) {
      alert('Failed to approve: ' + (err.message || 'Unknown error'));
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (depositId) => {
    if (!window.confirm('Reject this deposit?')) return;
    setProcessingId(depositId);
    try {
      await adminAPI.rejectDeposit(depositId);
      alert('Deposit rejected!');
      fetchDeposits();
    } catch (err) {
      alert('Failed to reject: ' + (err.message || 'Unknown error'));
    } finally {
      setProcessingId(null);
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

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] pb-24 lg:pb-8 font-['Ubuntu',sans-serif]">
      {showUserPopup && userDetails && (
        <div className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] rounded-3xl p-6 border border-[#D4AF37]/30 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">User Details</h3>
              <button onClick={() => setShowUserPopup(false)} className="p-2 rounded-xl bg-[#1a1a1a] hover:bg-[#252525]">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="bg-[#0a0a0a] rounded-2xl p-4 border border-[#1a1a1a]">
                <h4 className="text-[#D4AF37] font-semibold mb-3">Basic Info</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-gray-400">Email:</div><div className="text-white break-all">{userDetails.user?.email}</div>
                  <div className="text-gray-400">Name:</div><div className="text-white">{userDetails.user?.name || 'N/A'}</div>
                  <div className="text-gray-400">Mobile:</div><div className="text-white">{userDetails.user?.mobile || 'N/A'}</div>
                  <div className="text-gray-400">Telegram Name:</div><div className="text-white">{userDetails.user?.telegramname || 'N/A'}</div>
                  <div className="text-gray-400">Telegram Username:</div><div className="text-white">@{userDetails.user?.telegramusername || 'N/A'}</div>
                  <div className="text-gray-400">Telegram Chat ID:</div><div className="text-white font-mono text-xs">{userDetails.user?.telegramchatid || 'N/A'}</div>
                  <div className="text-gray-400">Status:</div><div className={userDetails.user?.isblocked ? 'text-red-400' : 'text-green-400'}>{userDetails.user?.isblocked ? 'Blocked' : 'Active'}</div>
                  <div className={`${userDetails.paymentEnabled ? 'text-green-400' : 'text-red-400'}`}>
                    {userDetails.paymentEnabled ? '✓ Can receive payment' : '✕ Cannot receive payment'}
                  </div>
                  <div className="text-gray-400">Joined:</div><div className="text-white text-xs">{formatDate(userDetails.user?.createdat)}</div>
                  <div className="text-gray-400">User ID:</div><div className="text-white text-xs font-mono">{userDetails.user?.id?.slice(0, 8)}...</div>
                </div>
              </div>

              <div className="bg-[#0a0a0a] rounded-2xl p-4 border border-[#1a1a1a]">
                <h4 className="text-[#D4AF37] font-semibold mb-3">Wallet Balance</h4>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-[#0d0d0d] rounded-xl p-3">
                    <div className="text-gray-400 text-xs mb-1">INR</div>
                    <div className="text-green-400 font-bold">₹{parseFloat(userDetails.wallet?.inrbalance || 0).toFixed(2)}</div>
                  </div>
                  <div className="bg-[#0d0d0d] rounded-xl p-3">
                    <div className="text-gray-400 text-xs mb-1">USDT</div>
                    <div className="text-[#D4AF37] font-bold">${parseFloat(userDetails.wallet?.usdtbalance || 0).toFixed(2)}</div>
                  </div>
                  <div className="bg-[#0d0d0d] rounded-xl p-3">
                    <div className="text-gray-400 text-xs mb-1">Token</div>
                    <div className="text-white font-bold">{parseFloat(userDetails.wallet?.tokenbalance || 0).toFixed(2)}</div>
                  </div>
                </div>
              </div>

              <div className="bg-[#0a0a0a] rounded-2xl p-4 border border-[#1a1a1a]">
                <h4 className="text-[#D4AF37] font-semibold mb-3">Referral & Team</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-gray-400">My Code:</div><div className="text-[#D4AF37] font-bold font-mono">{userDetails.user?.referralcode}</div>
                  <div className="text-gray-400">Team Size:</div><div className="text-white">{userDetails.referralCount || 0} users</div>
                  <div className="text-gray-400">Referred By:</div><div className="text-white">{userDetails.user?.referredby || 'None'}</div>
                </div>
              </div>

              <div className="bg-[#0a0a0a] rounded-2xl p-4 border border-[#1a1a1a]">
                <h4 className="text-[#D4AF37] font-semibold mb-3">UPI Accounts ({userDetails.upiAccounts?.length || 0})</h4>
                {userDetails.upiAccounts?.length > 0 ? (
                  <div className="space-y-2 text-sm">
                    {userDetails.upiAccounts.map((u, i) => {
                      const getUpiAppName = (upiId) => {
                        const id = (upiId || '').toLowerCase();
                        if (id.includes('mobwik') || id.includes('mobiwik')) return 'MobiKwik';
                        if (id.includes('freerecharge')) return 'FreeCharge';
                        if (id.includes('paytm')) return 'Paytm';
                        if (id.includes('phonepe')) return 'PhonePe';
                        if (id.includes('google') || id.includes('gpay')) return 'Google Pay';
                        if (id.includes('bhim')) return 'BHIM';
                        if (id.includes('amazon')) return 'Amazon Pay';
                        return 'UPI App';
                      };
                      return (
                      <div key={i} className="flex justify-between items-center bg-[#0d0d0d] rounded-lg p-2">
                        <span className="text-white font-mono text-xs">{u.upiid}</span>
                        <span className="text-[#D4AF37] text-xs">{getUpiAppName(u.upiid)}</span>
                      </div>
                    )})}
                  </div>
                ) : <p className="text-gray-500 text-sm">No UPI linked</p>}
              </div>

              <div className="bg-[#0a0a0a] rounded-2xl p-4 border border-[#1a1a1a]">
                <h4 className="text-[#D4AF37] font-semibold mb-3">Bank Accounts ({userDetails.bankAccounts?.length || 0})</h4>
                {userDetails.bankAccounts?.length > 0 ? (
                  <div className="space-y-2 text-sm">
                    {userDetails.bankAccounts.map((b, i) => (
                      <div key={i} className="bg-[#0d0d0d] rounded-lg p-2">
                        <div className="text-white text-xs">{b.bankname}</div>
                        <div className="text-gray-400 text-xs">A/C: {b.accountnumber?.slice(-4).padStart(b.accountnumber?.length, '****')}</div>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-gray-500 text-sm">No bank linked</p>}
              </div>

              <div className="bg-[#0a0a0a] rounded-2xl p-4 border border-[#1a1a1a]">
                <h4 className="text-[#D4AF37] font-semibold mb-3">Recent Deposits ({userDetails.deposits?.length || 0})</h4>
                {userDetails.deposits?.length > 0 ? (
                  <div className="space-y-2">
                    {userDetails.deposits.slice(0, 10).map((d, i) => (
                      <div key={i} className="flex justify-between items-center bg-[#0d0d0d] rounded-lg p-2 text-sm">
                        <div>
                          <div className="text-green-400 font-bold">+₹{parseFloat(d.amount).toFixed(2)}</div>
                          <div className="text-gray-500 text-xs">{d.method} • {formatDate(d.createdat)}</div>
                        </div>
                        <span className={`px-2 py-1 rounded-lg text-xs ${d.status === 'APPROVED' ? 'bg-green-500/20 text-green-400' : d.status === 'REJECTED' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}`}>{d.status}</span>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-gray-500 text-sm">No deposits</p>}
              </div>

              <div className="bg-[#0a0a0a] rounded-2xl p-4 border border-[#1a1a1a]">
                <h4 className="text-[#D4AF37] font-semibold mb-3">Recent Withdrawals ({userDetails.withdrawals?.length || 0})</h4>
                {userDetails.withdrawals?.length > 0 ? (
                  <div className="space-y-2">
                    {userDetails.withdrawals.slice(0, 10).map((w, i) => (
                      <div key={i} className="flex justify-between items-center bg-[#0d0d0d] rounded-lg p-2 text-sm">
                        <div>
                          <div className="text-red-400 font-bold">-₹{parseFloat(w.amount).toFixed(2)}</div>
                          <div className="text-gray-500 text-xs">{w.method || 'Wallet'} • {formatDate(w.createdat)}</div>
                        </div>
                        <span className={`px-2 py-1 rounded-lg text-xs ${w.status === 'APPROVED' ? 'bg-green-500/20 text-green-400' : w.status === 'REJECTED' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}`}>{w.status}</span>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-gray-500 text-sm">No withdrawals</p>}
              </div>

              <div className="bg-[#0a0a0a] rounded-2xl p-4 border border-[#1a1a1a]">
                <h4 className="text-[#D4AF37] font-semibold mb-3">Recent Transactions ({userDetails.transactions?.length || 0})</h4>
                {userDetails.transactions?.length > 0 ? (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {userDetails.transactions.map((t, i) => (
                      <div key={i} className="flex justify-between items-center bg-[#0d0d0d] rounded-lg p-2 text-xs">
                        <div>
                          <div className={t.type === 'DEPOSIT' || t.type === 'REWARD' ? 'text-green-400' : 'text-red-400'}>{t.type}</div>
                          <div className="text-gray-500">{formatDate(t.createdat)}</div>
                        </div>
                        <div className="text-right">
                          <div className={t.type === 'DEPOSIT' || t.type === 'REWARD' ? 'text-green-400' : 'text-red-400'}>₹{parseFloat(t.amount).toFixed(2)}</div>
                          <span className={`px-2 py-0.5 rounded text-xs ${t.status === 'COMPLETED' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>{t.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-gray-500 text-sm">No transactions</p>}
              </div>
            </div>
          </div>
        </div>
      )}

      {sidebarOpen && <div className="fixed inset-0 bg-black/80 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}
      <div className={`fixed top-0 left-0 h-full w-80 bg-[#0d0d0d] z-50 transform transition-transform duration-300 lg:hidden ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-5 border-b border-[#2a2a2a]">
          <div className="flex items-center justify-between">
            <div><h2 className="text-2xl font-bold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] bg-clip-text text-transparent">𝙅𝙀𝙓 𝙋𝘼𝙔</h2><p className="text-xs text-gray-500">Admin Panel</p></div>
            <button onClick={() => setSidebarOpen(false)} className="p-2 rounded-xl bg-[#1a1a1a]"><svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
          </div>
        </div>
        <div className="p-4 space-y-2">
          {menuItems.map((item, index) => (<button key={index} onClick={() => { navigate(item.path); setSidebarOpen(false); }} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-left transition-all ${item.path === '/admin/deposits' ? 'bg-[#D4AF37]/10 text-white' : 'bg-[#1a1a1a]/50 hover:bg-[#D4AF37]/10 text-gray-300'}`}><div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.path === '/admin/deposits' ? 'bg-[#D4AF37]/20' : 'bg-[#1a1a1a]'}`}><svg className="w-5 h-5 text-[#D4AF37]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} /></svg></div><span className="font-medium">{item.label}</span></button>))}
          <hr className="border-[#2a2a2a] my-4" />
          <button onClick={handleLogout} className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl bg-red-500/10 hover:bg-red-500/20 text-left transition-all"><div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center"><svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg></div><span className="text-red-400 font-medium">Logout</span></button>
        </div>
      </div>
      <div className="sticky top-0 z-30 bg-[#0d0d0d]/80 backdrop-blur-2xl border-b border-[#1a1a1a]">
        <div className="flex items-center justify-between gap-2 px-3 py-3 sm:px-4 sm:py-3">
          <button onClick={() => setSidebarOpen(true)} className="rounded-xl bg-[#1a1a1a] p-2.5 hover:bg-[#252525]"><svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg></button>
          <h1 className="min-w-0 flex-1 truncate text-center text-lg font-bold text-white">Deposits</h1>
          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            <AdminNotificationBell />
            <button onClick={handleLogout} className="rounded-xl bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-400 hover:bg-red-500/20">Logout</button>
          </div>
        </div>
      </div>
      <div className="p-4 space-y-4">
        <div className="overflow-x-auto flex gap-2 pb-2">
          {['', 'PENDING', 'APPROVED', 'REJECTED'].map((s) => (
            <button key={s} onClick={() => { setStatus(s); setPage(1); }} className={`px-3 py-2 rounded-xl text-xs whitespace-nowrap ${status === s ? 'bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black font-semibold' : 'bg-[#1a1a1a] text-gray-400 border border-[#2a2a2a]'}`}>{s || 'All'}</button>
          ))}
        </div>
        
        {error && <div className="bg-red-500/20 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm">{error}</div>}
        
        <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] rounded-2xl border border-[#2a2a2a] overflow-hidden">
          {loading ? (
            <div className="p-4 space-y-3">
              {[1,2,3,4,5].map(i => <div key={i} className="h-20 bg-[#0a0a0a] rounded-xl animate-pulse"></div>)}
            </div>
          ) : deposits.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No deposits found</div>
          ) : (
            <div className="divide-y divide-[#1a1a1a]">
              {deposits.map((deposit) => (
                <div key={deposit.id} className="p-3 sm:p-4">
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <p className="text-white font-medium text-sm truncate">{deposit.email || 'N/A'}</p>
                        <span className="px-2 py-0.5 bg-gray-700 text-gray-300 rounded text-xs">{deposit.method}</span>
                      </div>
                      <p className="text-gray-500 text-xs">{formatDate(deposit.createdat)}</p>
                      {deposit.txid && (
                        <p className="text-blue-400 text-xs font-mono mt-1 truncate" title={deposit.txid}>TX: {deposit.txid}</p>
                      )}
                      {(deposit.cryptoid || deposit.cryptoamount) && (
                        <p className="text-green-400 text-xs mt-1">
                          Crypto: {deposit.cryptoid} × {deposit.cryptoamount}
                        </p>
                      )}
                      {deposit.screenshot && (
                        <a href={deposit.screenshot} target="_blank" rel="noopener noreferrer" className="inline-block mt-2">
                          <img src={deposit.screenshot} alt="Screenshot" className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg border border-[#2a2a2a]" />
                        </a>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center gap-1">
                        <button onClick={() => fetchUserDetails(deposit.userid)} className="p-1.5 sm:p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30" title="User Details">
                          <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        </button>
                        <span className={`px-2 py-1 rounded-lg text-xs font-medium ${deposit.status === 'APPROVED' ? 'bg-green-500/20 text-green-400' : deposit.status === 'REJECTED' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}`}>{deposit.status}</span>
                      </div>
                      <p className="text-[#D4AF37] font-bold text-base sm:text-lg">₹{parseFloat(deposit.amount || 0).toFixed(2)}</p>
                      {deposit.status === 'PENDING' && (
                        <div className="flex gap-1 sm:gap-2">
                          <button onClick={() => handleApprove(deposit.id)} disabled={processingId === deposit.id} className="px-2 sm:px-3 py-1 bg-green-500/20 text-green-400 rounded-lg text-xs font-medium hover:bg-green-500/30 disabled:opacity-50">Approve</button>
                          <button onClick={() => handleReject(deposit.id)} disabled={processingId === deposit.id} className="px-2 sm:px-3 py-1 bg-red-500/20 text-red-400 rounded-lg text-xs font-medium hover:bg-red-500/30 disabled:opacity-50">Reject</button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {total > 20 && (
          <div className="flex justify-center gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 bg-[#1a1a1a] text-white rounded-xl disabled:opacity-50">Prev</button>
            <span className="px-4 py-2 text-gray-400">Page {page}</span>
            <button onClick={() => setPage(p => p + 1)} disabled={deposits.length < 20} className="px-4 py-2 bg-[#1a1a1a] text-white rounded-xl disabled:opacity-50">Next</button>
          </div>
        )}
      </div>
      <div className="fixed bottom-0 left-0 right-0 bg-[#0d0d0d]/95 backdrop-blur-2xl border-t border-[#1a1a1a] lg:hidden z-50">
        <div className="flex items-center justify-around py-2 px-1">
          <button onClick={() => navigate('/admin/dashboard')} className="flex flex-col items-center gap-1 p-2 text-gray-500"><div className="w-9 h-9 rounded-xl bg-[#1a1a1a] flex items-center justify-center"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" /></svg></div><span className="text-xs">Home</span></button>
          <button onClick={() => navigate('/admin/users')} className="flex flex-col items-center gap-1 p-2 text-gray-500"><div className="w-9 h-9 rounded-xl bg-[#1a1a1a] flex items-center justify-center"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg></div><span className="text-xs">Users</span></button>
          <button onClick={() => navigate('/admin/deposits')} className="flex flex-col items-center gap-1 p-2 text-[#D4AF37]"><div className="w-9 h-9 rounded-xl bg-[#D4AF37]/20 flex items-center justify-center"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg></div><span className="text-xs">Deposits</span></button>
          <button onClick={() => navigate('/admin/withdrawals')} className="flex flex-col items-center gap-1 p-2 text-gray-500"><div className="w-9 h-9 rounded-xl bg-[#1a1a1a] flex items-center justify-center"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg></div><span className="text-xs">Withdraw</span></button>
          <button onClick={() => navigate('/admin/settings')} className="flex flex-col items-center gap-1 p-2 text-gray-500"><div className="w-9 h-9 rounded-xl bg-[#1a1a1a] flex items-center justify-center"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /></svg></div><span className="text-xs">Settings</span></button>
        </div>
      </div>
    </div>
  );
};

export default AdminDeposits;
