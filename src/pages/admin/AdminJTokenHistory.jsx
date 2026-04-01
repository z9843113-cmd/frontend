import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import { useAuthStore } from '../../store';
import AdminNotificationBell from '../../components/AdminNotificationBell';

const AdminJTokenHistory = () => {
  const [history, setHistory] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { logout } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const res = await adminAPI.getJTokenHistory({ page, limit: 20, type: filter });
        const data = res?.data || res;
        setHistory((data?.history || []).filter(Boolean));
        setTotalPages(data?.totalPages || 1);
      } catch (error) {
        console.error('Failed to load J Token history', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [page, filter]);

  const menuItems = [
    { label: 'Home', path: '/admin/dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v-6a1 1 0 00-1-1h-3m-9 16v2a1 1 0 001 1h2' },
    { label: 'Users', path: '/admin/users', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
    { label: 'J Token', path: '/admin/jtoken', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    { label: 'Requests', path: '/admin/jtoken-requests', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
    { label: 'Exchange', path: '/admin/exchange', icon: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4' },
    { label: 'History', path: '/admin/jtoken-history', icon: 'M4 6h16M4 12h16M4 18h10' },
    { label: 'Settings', path: '/admin/settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' }
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getTypeStyles = (type) => {
    if (type === 'DEPOSIT') return 'bg-emerald-500/10 text-emerald-400';
    if (type === 'WITHDRAWAL') return 'bg-rose-500/10 text-rose-400';
    if (type === 'JTOKEN_REQUEST') return 'bg-sky-500/10 text-sky-400';
    if (type === 'JTOKEN_CREDIT' || type === 'JTOKEN_PURCHASE') return 'bg-[#D4AF37]/10 text-[#D4AF37]';
    if (type === 'JTOKEN_DEBIT' || type === 'JTOKEN_TRADE') return 'bg-orange-500/10 text-orange-400';
    return 'bg-[#1a1a1a] text-gray-300';
  };

  const getTypeLabel = (type) => {
    const labels = {
      DEPOSIT: 'Deposit',
      WITHDRAWAL: 'Withdrawal',
      JTOKEN_REQUEST: 'J Token Request',
      JTOKEN_CREDIT: 'J Token Credit',
      JTOKEN_DEBIT: 'J Token Debit',
      JTOKEN_TRADE: 'J Token Redeem',
      JTOKEN_PURCHASE: 'J Token Purchase'
    };
    return labels[type] || type;
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] pb-24 font-['Ubuntu',sans-serif]">
      {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/80 lg:hidden" onClick={() => setSidebarOpen(false)} />}
      <div className={`fixed top-0 left-0 z-50 h-full w-80 transform bg-[#0d0d0d] transition-transform duration-300 lg:hidden ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="border-b border-[#2a2a2a] p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="bg-gradient-to-r from-[#D4AF37] to-[#FFD700] bg-clip-text text-2xl font-bold text-transparent">𝙅𝙀𝙓 𝙋𝘼𝙔</h2>
              <p className="text-xs text-gray-500">J Token History</p>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="rounded-xl bg-[#1a1a1a] p-2 text-white">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>
        <div className="space-y-2 p-4">
          {menuItems.map((item) => (
            <button key={item.path} onClick={() => { navigate(item.path); setSidebarOpen(false); }} className={`flex w-full items-center gap-4 rounded-2xl px-5 py-4 text-left ${item.path === '/admin/jtoken-history' ? 'bg-[#D4AF37]/10' : 'bg-[#1a1a1a]/50'}`}>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1a1a1a] text-[#D4AF37]">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} /></svg>
              </div>
              <span className="text-white">{item.label}</span>
            </button>
          ))}
          <button onClick={handleLogout} className="mt-4 flex w-full items-center gap-4 rounded-2xl bg-red-500/10 px-5 py-4 text-left text-red-400">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/20">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            </div>
            <span>Logout</span>
          </button>
        </div>
      </div>

      <div className="sticky top-0 z-30 border-b border-[#1a1a1a] bg-[#0d0d0d]/90 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-2 px-3 py-3 sm:px-4 sm:py-4">
          <button onClick={() => setSidebarOpen(true)} className="rounded-xl sm:rounded-2xl bg-[#1a1a1a] p-2.5 sm:p-3 text-white lg:hidden">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
          <div className="min-w-0 flex-1 text-center lg:text-left">
            <p className="text-xs uppercase tracking-[0.25em] text-[#D4AF37]">Admin</p>
            <h1 className="truncate text-base sm:text-xl font-bold text-white">J Token History</h1>
          </div>
          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            <AdminNotificationBell />
            <button onClick={() => navigate('/admin/jtoken')} className="rounded-xl sm:rounded-2xl bg-[#1a1a1a] px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold text-[#D4AF37]">Manage</button>
            <button onClick={handleLogout} className="rounded-xl sm:rounded-2xl bg-red-500/10 px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold text-red-400 hover:bg-red-500/20">Logout</button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl space-y-5 px-4 py-5">
        <div className="rounded-[28px] border border-[#3a3020] bg-[radial-gradient(circle_at_top_left,_rgba(212,175,55,0.16),_transparent_35%),linear-gradient(135deg,#171717_0%,#101010_60%,#090909_100%)] p-6">
              <p className="text-sm text-gray-400">Platform-wide activity</p>
              <h2 className="mt-2 text-3xl font-bold text-white">Track deposits, withdrawals, and every J Token movement</h2>
              <p className="mt-2 text-sm text-gray-500">Use this page to audit all wallet activity across the full admin panel.</p>
        </div>

        <div className="flex flex-wrap gap-3">
          {['ALL', 'DEPOSIT', 'WITHDRAWAL', 'JTOKEN_REQUEST', 'JTOKEN_CREDIT', 'JTOKEN_DEBIT', 'JTOKEN_TRADE', 'JTOKEN_PURCHASE'].map((type) => (
            <button key={type} onClick={() => { setFilter(type); setPage(1); }} className={`rounded-2xl px-4 py-3 text-sm font-semibold ${filter === type ? 'bg-[#D4AF37] text-black' : 'bg-[#171717] text-gray-400'}`}>
              {type === 'ALL' ? 'All Activity' : getTypeLabel(type)}
            </button>
          ))}
        </div>

        <div className="rounded-[28px] border border-[#242424] bg-gradient-to-br from-[#171717] to-[#0d0d0d] p-5">
          {loading ? (
            <div className="py-12 text-center text-gray-500">Loading history...</div>
          ) : history.length === 0 ? (
            <div className="py-12 text-center text-gray-500">No history records found.</div>
          ) : (
            <div className="space-y-3">
              {history.filter((entry) => entry?.id).map((entry) => (
                <div key={entry.id} className="rounded-2xl border border-[#1d1d1d] bg-[#0d0d0d] p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-white">{entry.email || 'No email'}</p>
                        <span className={`rounded-full px-3 py-1 text-xs font-bold ${getTypeStyles(entry.itemtype || entry.type)}`}>
                          {getTypeLabel(entry.itemtype || entry.type)}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-gray-500">{entry.name || 'No name'} • {entry.createdat ? new Date(entry.createdat).toLocaleString() : 'N/A'}</p>
                      <p className="mt-2 text-sm text-gray-300">{entry.note || `Method: ${entry.method || 'N/A'}`}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3 sm:min-w-[220px]">
                      <div className="rounded-2xl bg-[#121212] p-3 text-center">
                        <p className="text-xs text-gray-500">{(entry.itemtype || entry.type).includes('JTOKEN') ? 'J Token' : 'Amount'}</p>
                        <p className="mt-1 font-bold text-white">{(entry.itemtype || entry.type).includes('JTOKEN') ? parseFloat(entry.tokenamount || 0).toFixed(2) : `₹${parseFloat(entry.amount || 0).toFixed(2)}`}</p>
                      </div>
                      <div className="rounded-2xl bg-[#121212] p-3 text-center">
                        <p className="text-xs text-gray-500">Status / INR</p>
                        <p className="mt-1 font-bold text-[#D4AF37]">{entry.status || 'COMPLETED'} • ₹{parseFloat(entry.inrvalue || entry.amount || 0).toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between rounded-2xl border border-[#242424] bg-[#121212] px-4 py-4">
          <button onClick={() => setPage((prev) => Math.max(prev - 1, 1))} disabled={page === 1} className="rounded-xl bg-[#1a1a1a] px-4 py-2 text-sm font-semibold text-white disabled:opacity-40">Previous</button>
          <p className="text-sm text-gray-400">Page {page} of {totalPages}</p>
          <button onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))} disabled={page >= totalPages} className="rounded-xl bg-[#1a1a1a] px-4 py-2 text-sm font-semibold text-white disabled:opacity-40">Next</button>
        </div>
      </div>
    </div>
  );
};

export default AdminJTokenHistory;
