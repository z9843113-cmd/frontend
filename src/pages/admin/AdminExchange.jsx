import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import { useAuthStore } from '../../store';
import AdminNotificationBell from '../../components/AdminNotificationBell';

const AdminExchange = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [processingId, setProcessingId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { logout } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => { fetchRequests(); }, [page, status, search]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchRequests();
    }, 5000);
    return () => clearInterval(interval);
  }, [page, status, search]);

  const fetchRequests = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await adminAPI.getExchangeRequests({ page, limit: 20, status, search });
      setRequests(res.requests || []);
      setTotal(res.total || 0);
    } catch (err) {
      setError(err?.message || 'Failed to load exchange requests');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId) => {
    if (!window.confirm('Approve this exchange request? INR will be added to user wallet.')) return;
    setProcessingId(requestId);
    try {
      await adminAPI.approveExchangeRequest(requestId);
      alert('Exchange request approved!');
      fetchRequests();
    } catch (err) {
      alert('Failed: ' + (err.message || 'Unknown error'));
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (requestId) => {
    if (!window.confirm('Reject this exchange request?')) return;
    setProcessingId(requestId);
    try {
      await adminAPI.rejectExchangeRequest(requestId);
      alert('Exchange request rejected.');
      fetchRequests();
    } catch (err) {
      alert('Failed: ' + (err.message || 'Unknown error'));
    } finally {
      setProcessingId(null);
    }
  };

  const menuItems = [
    { icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v-6a1 1 0 00-1-1h-3m-9 16v2a1 1 0 001 1h2', label: 'Home', path: '/admin/dashboard' },
    { icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z', label: 'Users', path: '/admin/users' },
    { icon: 'M12 4v16m8-8H4', label: 'Deposits', path: '/admin/deposits' },
    { icon: 'M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z', label: 'UPI Apps', path: '/admin/upi-apps' },
    { icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', label: 'UPI Verify', path: '/admin/upi-verifications' },
    { icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z', label: 'J Token', path: '/admin/jtoken' },
    { icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', label: 'Requests', path: '/admin/jtoken-requests' },
    { icon: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4', label: 'Exchange', path: '/admin/exchange' },
    { icon: 'M4 6h16M4 12h16M4 18h10', label: 'History', path: '/admin/jtoken-history' },
    { icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z', label: 'Settings', path: '/admin/settings' },
  ];

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit', hour: '2-digit', minute: '2-digit' });
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="min-h-screen bg-[#0a0a0a] pb-24 lg:pb-8 font-['Ubuntu',sans-serif]">
      <div className="sticky top-0 z-30 bg-[#0d0d0d] border-b border-[#1a1a1a]">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={() => setSidebarOpen(true)} className="rounded-xl bg-[#1a1a1a] p-2.5 hover:bg-[#252525]">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
          <h1 className="min-w-0 flex-1 truncate text-center text-lg font-bold text-white">Exchange Requests</h1>
          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            <AdminNotificationBell />
            <button onClick={handleLogout} className="rounded-xl bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-400 hover:bg-red-500/20">Logout</button>
          </div>
        </div>
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="w-64 bg-[#0d0d0d] border-r border-[#1a1a1a] p-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-[#D4AF37] font-bold text-xl">Admin Panel</h2>
              <button onClick={() => setSidebarOpen(false)} className="p-2 rounded-xl bg-[#1a1a1a]">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="space-y-2">
              {menuItems.map((item, index) => (
                <button key={index} onClick={() => { navigate(item.path); setSidebarOpen(false); }} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-left transition-all ${item.path === '/admin/exchange' ? 'bg-[#D4AF37]/10 text-white' : 'bg-[#1a1a1a]/50 hover:bg-[#D4AF37]/10 text-gray-300'}`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.path === '/admin/exchange' ? 'bg-[#D4AF37]/20' : 'bg-[#1a1a1a]'}`}>
                    <svg className="w-5 h-5 text-[#D4AF37]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} /></svg>
                  </div>
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
          <button className="flex-1 bg-black/50" onClick={() => setSidebarOpen(false)}></button>
        </div>
      )}

      <div className="p-4 space-y-4">
        <input type="text" placeholder="Search by email or user ID..." value={searchInput} onChange={(e) => setSearchInput(e.target.value)} className="w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-[#D4AF37] focus:outline-none" />
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
          ) : requests.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No exchange requests found</div>
          ) : (
            <div className="divide-y divide-[#1a1a1a]">
              {requests.map((r) => (
                <div key={r.id} className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="text-white font-medium text-sm">{r.email || 'N/A'}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <p className="text-gray-500 text-xs font-mono">{r.userid?.slice(0, 8)}...</p>
                          <button 
                            onClick={() => { navigator.clipboard.writeText(r.userid); }}
                            className="p-1 bg-[#1a1a1a] hover:bg-[#252525] rounded text-gray-400 hover:text-[#D4AF37]"
                            title="Copy ID"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          </button>
                        </div>
                        <p className="text-gray-500 text-xs mt-1">{formatDate(r.createdat)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-lg text-xs font-medium ${r.status === 'APPROVED' ? 'bg-green-500/20 text-green-400' : r.status === 'REJECTED' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}`}>{r.status}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-[#D4AF37] font-bold text-lg">${parseFloat(r.amount || 0).toFixed(2)} USDT</p>
                      <p className="text-gray-500 text-xs">Rate: ₹{r.rate} | Type: {r.ratetype}</p>
                      <p className="text-green-400 text-sm">= ₹{(parseFloat(r.amount || 0) * parseFloat(r.rate || 0)).toFixed(2)} INR</p>
                    </div>
                    {r.status === 'PENDING' && (
                      <div className="flex gap-2">
                        <button onClick={() => handleApprove(r.id)} disabled={processingId === r.id} className="px-3 py-1.5 bg-green-500/20 text-green-400 rounded-lg text-xs font-medium hover:bg-green-500/30 disabled:opacity-50">Approve</button>
                        <button onClick={() => handleReject(r.id)} disabled={processingId === r.id} className="px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg text-xs font-medium hover:bg-red-500/30 disabled:opacity-50">Reject</button>
                      </div>
                    )}
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
            <button onClick={() => setPage(p => p + 1)} disabled={requests.length < 20} className="px-4 py-2 bg-[#1a1a1a] text-white rounded-xl disabled:opacity-50">Next</button>
          </div>
        )}
      </div>
      <div className="fixed bottom-0 left-0 right-0 bg-[#0d0d0d]/95 backdrop-blur-2xl border-t border-[#1a1a1a] lg:hidden z-50">
        <div className="flex items-center justify-around py-2 px-1">
          <button onClick={() => navigate('/admin/dashboard')} className="flex flex-col items-center gap-1 p-2 text-gray-500"><div className="w-9 h-9 rounded-xl bg-[#1a1a1a] flex items-center justify-center"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" /></svg></div><span className="text-xs">Home</span></button>
          <button onClick={() => navigate('/admin/users')} className="flex flex-col items-center gap-1 p-2 text-gray-500"><div className="w-9 h-9 rounded-xl bg-[#1a1a1a] flex items-center justify-center"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg></div><span className="text-xs">Users</span></button>
          <button onClick={() => navigate('/admin/deposits')} className="flex flex-col items-center gap-1 p-2 text-gray-500"><div className="w-9 h-9 rounded-xl bg-[#1a1a1a] flex items-center justify-center"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg></div><span className="text-xs">Deposits</span></button>
          <button onClick={() => navigate('/admin/settings')} className="flex flex-col items-center gap-1 p-2 text-gray-500"><div className="w-9 h-9 rounded-xl bg-[#1a1a1a] flex items-center justify-center"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /></svg></div><span className="text-xs">Settings</span></button>
        </div>
      </div>
    </div>
  );
};

export default AdminExchange;