import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import { useAuthStore } from '../../store';
import AdminNotificationBell from '../../components/AdminNotificationBell';
import { FaSearch, FaFilter, FaHistory, FaArrowLeft, FaArrowRight, FaExchangeAlt, FaCoins, FaGift, FaArrowDown, FaArrowUp, FaUser, FaCheckCircle, FaClock, FaTimesCircle, FaCopy } from 'react-icons/fa';

const AdminJTokenHistory = () => {
  const [history, setHistory] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { logout } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const res = await adminAPI.getJTokenHistory({ page, limit: 20, type: filter, search: searchQuery });
        const data = res?.data || res;
        setHistory((data?.history || []).filter(Boolean));
        setTotalPages(data?.totalPages || 1);
      } catch (error) {
        console.error('Failed to load history', error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [page, filter, searchQuery]);

  const menuItems = [
    { label: 'Home', path: '/admin/dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v-6a1 1 0 00-1-1h-3m-9 16v2a1 1 0 001 1h2' },
    { label: 'Users', path: '/admin/users', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
    { label: 'J Token', path: '/admin/jtoken', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    { label: 'Requests', path: '/admin/jtoken-requests', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
    { label: 'Exchange', path: '/admin/exchange', icon: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4' },
    { label: 'History', path: '/admin/jtoken-history', icon: 'M4 6h16M4 12h16M4 18h10' },
    { label: 'Settings', path: '/admin/settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' }
  ];

  const handleLogout = () => { logout(); navigate('/login'); };

  const getTypeStyles = (type) => {
    const styles = {
      DEPOSIT: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', icon: <FaArrowDown className="w-4 h-4" /> },
      WITHDRAWAL: { bg: 'bg-rose-500/20', text: 'text-rose-400', icon: <FaArrowUp className="w-4 h-4" /> },
      JTOKEN_REQUEST: { bg: 'bg-sky-500/20', text: 'text-sky-400', icon: <FaCoins className="w-4 h-4" /> },
      JTOKEN_PURCHASE: { bg: 'bg-violet-500/20', text: 'text-violet-400', icon: <FaCoins className="w-4 h-4" /> },
      JTOKEN_CREDIT: { bg: 'bg-amber-500/20', text: 'text-amber-400', icon: <FaArrowDown className="w-4 h-4" /> },
      JTOKEN_DEBIT: { bg: 'bg-orange-500/20', text: 'text-orange-400', icon: <FaArrowUp className="w-4 h-4" /> },
      JTOKEN_TRADE: { bg: 'bg-cyan-500/20', text: 'text-cyan-400', icon: <FaExchangeAlt className="w-4 h-4" /> },
      REWARD: { bg: 'bg-[#D4AF37]/20', text: 'text-[#D4AF37]', icon: <FaGift className="w-4 h-4" /> },
      REFERRAL: { bg: 'bg-green-500/20', text: 'text-green-400', icon: <FaUser className="w-4 h-4" /> },
      COMMISSION: { bg: 'bg-blue-500/20', text: 'text-blue-400', icon: <FaCoins className="w-4 h-4" /> },
      USDT_DEPOSIT: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', icon: <FaArrowDown className="w-4 h-4" /> },
      EXCHANGE: { bg: 'bg-cyan-500/20', text: 'text-cyan-400', icon: <FaExchangeAlt className="w-4 h-4" /> },
      ADMIN_CREDIT: { bg: 'bg-purple-500/20', text: 'text-purple-400', icon: <FaArrowDown className="w-4 h-4" /> },
      ADMIN_DEBIT: { bg: 'bg-red-500/20', text: 'text-red-400', icon: <FaArrowUp className="w-4 h-4" /> },
    };
    return styles[type] || { bg: 'bg-gray-500/20', text: 'text-gray-400', icon: <FaHistory className="w-4 h-4" /> };
  };

  const getTypeLabel = (type) => {
    const labels = {
      DEPOSIT: 'Deposit', WITHDRAWAL: 'Withdrawal', JTOKEN_REQUEST: 'J Token Request',
      JTOKEN_CREDIT: 'J Token Credit', JTOKEN_DEBIT: 'J Token Debit', JTOKEN_TRADE: 'J Token Redeem',
      JTOKEN_PURCHASE: 'J Token Purchase', REWARD: 'Reward', REFERRAL: 'Referral',
      COMMISSION: 'Commission', SOLD_TOKENS: 'Sold Tokens', TRANSFER: 'Transfer',
      USDT_DEPOSIT: 'USDT Deposit', EXCHANGE: 'Exchange', ADMIN_CREDIT: 'Admin Credit',
      ADMIN_DEBIT: 'Admin Debit', UPI_REWARD: 'UPI Reward', TELEGRAM_BIND: 'Telegram Bind',
      WHATSAPP_BIND: 'WhatsApp Bind', BANK_REWARD: 'Bank Reward', MOBILE_BIND: 'Mobile Bind'
    };
    return labels[type] || type;
  };

  const getStatusIcon = (status) => {
    if (status === 'COMPLETED' || status === 'APPROVED') return <FaCheckCircle className="w-4 h-4 text-green-400" />;
    if (status === 'PENDING') return <FaClock className="w-4 h-4 text-yellow-400" />;
    return <FaTimesCircle className="w-4 h-4 text-red-400" />;
  };

  const filterOptions = [
    { value: 'ALL', label: 'All' },
    { value: 'DEPOSIT', label: 'Deposit' },
    { value: 'WITHDRAWAL', label: 'Withdrawal' },
    { value: 'JTOKEN_PURCHASE', label: 'J Token Purchase' },
    { value: 'JTOKEN_CREDIT', label: 'J Token Credit' },
    { value: 'JTOKEN_TRADE', label: 'J Token Trade' },
    { value: 'REWARD', label: 'Reward' },
    { value: 'REFERRAL', label: 'Referral' },
    { value: 'USDT_DEPOSIT', label: 'USDT Deposit' },
    { value: 'EXCHANGE', label: 'Exchange' },
    { value: 'SOLD_TOKENS', label: 'Sold Tokens' }
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] pb-28 lg:pb-8 font-['Ubuntu',sans-serif]">
      {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/80 lg:hidden" onClick={() => setSidebarOpen(false)} />}
      
      <div className={`fixed top-0 left-0 z-50 h-full w-80 transform bg-[#0d0d0d] transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="border-b border-[#2a2a2a] p-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="bg-gradient-to-r from-[#D4AF37] to-[#FFD700] bg-clip-text text-2xl font-bold text-transparent">JEX PAY</h2>
                <p className="text-xs text-gray-500">History</p>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="rounded-xl bg-[#1a1a1a] p-2 hover:bg-[#252525]">
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {menuItems.map((item) => (
              <button key={item.path} onClick={() => { navigate(item.path); setSidebarOpen(false); }} className={`flex w-full items-center gap-4 rounded-2xl px-5 py-4 text-left transition-all ${item.path === '/admin/jtoken-history' ? 'bg-[#D4AF37]/10 text-[#D4AF37]' : 'bg-[#1a1a1a]/50 text-white hover:bg-[#D4AF37]/10'}`}>
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${item.path === '/admin/jtoken-history' ? 'bg-[#D4AF37]/20' : 'bg-[#1a1a1a]'}`}>
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} /></svg>
                </div>
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
            <button onClick={handleLogout} className="flex w-full items-center gap-4 rounded-2xl bg-red-500/10 px-5 py-4 text-left text-red-400 mt-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/20">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              </div>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      <div className="sticky top-0 z-30 border-b border-[#1a1a1a] bg-[#0d0d0d]/95 backdrop-blur-xl lg:hidden">
        <div className="flex items-center justify-between gap-2 px-3 py-3">
          <button onClick={() => setSidebarOpen(true)} className="rounded-xl bg-[#1a1a1a] p-2.5 text-white">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
          <h1 className="text-base font-bold text-white">Transaction History</h1>
          <div className="flex items-center gap-2">
            <AdminNotificationBell />
            <button onClick={handleLogout} className="rounded-xl bg-red-500/10 p-2.5 text-red-400">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            </button>
          </div>
        </div>
      </div>

      <div className="lg:ml-80 px-4 py-5 space-y-5 max-w-6xl mx-auto">
        <div className="rounded-[28px] border border-[#3a3020] bg-gradient-to-br from-[#1a1a1a] via-[#151515] to-[#0d0d0d] p-5 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-[#D4AF37] mb-1">Admin Panel</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-white">Transaction History</h2>
              <p className="text-sm text-gray-500 mt-2">Track all deposits, withdrawals, and wallet activity</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => navigate('/admin/jtoken')} className="rounded-2xl bg-[#D4AF37]/10 px-4 py-2.5 text-sm font-semibold text-[#D4AF37] hover:bg-[#D4AF37]/20 transition-all">
                Manage J Token
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search by Order ID, Email, or Amount..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
              className="w-full pl-12 pr-4 py-3.5 bg-[#171717] border border-[#2a2a2a] rounded-2xl text-white placeholder-gray-500 focus:border-[#D4AF37] focus:outline-none"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
            {filterOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => { setFilter(option.value); setPage(1); }}
                className={`whitespace-nowrap px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${filter === option.value ? 'bg-[#D4AF37] text-black' : 'bg-[#171717] text-gray-400 hover:bg-[#1f1f1f]'}`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] rounded-3xl border border-[#2a2a2a] overflow-hidden">
          {loading ? (
            <div className="py-20 text-center">
              <div className="inline-block w-10 h-10 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-gray-500">Loading transactions...</p>
            </div>
          ) : history.length === 0 ? (
            <div className="py-20 text-center">
              <FaHistory className="w-16 h-16 mx-auto text-gray-700 mb-4" />
              <p className="text-gray-500 text-lg">No transactions found</p>
              <p className="text-gray-600 text-sm mt-2">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="divide-y divide-[#1f1f1f]">
              {history.filter((entry) => entry?.id).map((entry) => {
                const styles = getTypeStyles(entry.itemtype || entry.type);
                const orderId = entry.ordernumber || entry.id?.substring(0, 8).toUpperCase() || 'N/A';
                return (
                  <div key={entry.id} className="p-4 sm:p-6 hover:bg-[#151515] transition-colors">
                    <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-3 mb-3">
                          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${styles.bg} ${styles.text}`}>
                            {styles.icon}
                            <span className="text-xs font-bold">{getTypeLabel(entry.itemtype || entry.type)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-500">
                            {getStatusIcon(entry.status)}
                            <span className="text-xs">{entry.status || 'COMPLETED'}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 rounded-full bg-[#2a2a2a] flex items-center justify-center">
                            <FaUser className="w-4 h-4 text-gray-400" />
                          </div>
                          <div>
                            <p className="font-semibold text-white text-sm">{entry.email || 'Unknown User'}</p>
                            <p className="text-xs text-gray-500">{entry.name || 'No name'}</p>
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-400 mb-2">
                          {entry.note || `Method: ${entry.method || 'N/A'}`}
                        </p>
                        
                        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600">
                          <span className="flex items-center gap-1">
                            <FaClock className="w-3 h-3" />
                            {entry.createdat ? new Date(entry.createdat).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                          </span>
                          {orderId !== 'N/A' && (
                            <span className="flex items-center gap-1 text-[#D4AF37]">
                              <span 
                                className="font-mono cursor-pointer hover:text-[#FFD700]" 
                                onClick={() => { navigator.clipboard.writeText(orderId); }}
                                title="Click to copy"
                              >
                                #{orderId}
                              </span>
                              <button 
                                onClick={() => { navigator.clipboard.writeText(orderId); }} 
                                className="p-1 hover:text-[#FFD700]"
                                title="Copy order ID"
                              >
                                <FaCopy className="w-3 h-3" />
                              </button>
                            </span>
                          )}
                        </div>
                      </div>
                      
                        <div className="flex lg:flex-col gap-4 lg:min-w-[180px]">
                          <div className="flex-1 rounded-2xl bg-[#0d0d0d] p-4 text-center">
                            <p className="text-xs text-gray-500 mb-1">
                              {(entry.itemtype || entry.type)?.includes('JTOKEN') ? 'J Token' : 'Amount'}
                            </p>
                            <p className={`text-xl font-bold ${
                              (entry.itemtype || entry.type) === 'USDT_DEPOSIT' || (entry.itemtype || entry.type) === 'EXCHANGE' ? 'text-emerald-400' :
                              (entry.itemtype || entry.type)?.includes('JTOKEN') ? 'text-violet-400' : 'text-emerald-400'
                            }`}>
                              {(entry.itemtype || entry.type) === 'USDT_DEPOSIT' || (entry.itemtype || entry.type) === 'EXCHANGE'
                                ? `$${parseFloat(entry.amount || 0).toFixed(2)}`
                                : `₹${parseFloat(entry.amount || 0).toFixed(2)}`
                              }
                            </p>
                          </div>
                          <div className="flex-1 rounded-2xl bg-[#0d0d0d] p-4 text-center">
                            <p className="text-xs text-gray-500 mb-1">
                              {(entry.itemtype || entry.type)?.includes('JTOKEN') ? 'J Token' : 'INR Value'}
                            </p>
                            <p className="text-xl font-bold text-[#D4AF37]">
                              {(entry.itemtype || entry.type)?.includes('JTOKEN')
                                ? `${parseFloat(entry.tokenamount || 0).toFixed(2)} J`
                                : `₹${parseFloat(entry.inrvalue || entry.amount || 0).toFixed(2)}`
                              }
                            </p>
                          </div>
                        </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl bg-[#171717] p-4 border border-[#2a2a2a]">
            <p className="text-sm text-gray-500">Showing page {page} of {totalPages}</p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                disabled={page === 1}
                className="flex items-center gap-2 rounded-xl bg-[#1a1a1a] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-40 hover:bg-[#252525] transition-all"
              >
                <FaArrowLeft className="w-4 h-4" />
                Previous
              </button>
              <button
                onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={page >= totalPages}
                className="flex items-center gap-2 rounded-xl bg-[#1a1a1a] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-40 hover:bg-[#252525] transition-all"
              >
                Next
                <FaArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-[#0d0d0d]/95 backdrop-blur-xl border-t border-[#1a1a1a] lg:hidden z-50">
        <div className="flex items-center justify-around py-2 px-1">
          <button onClick={() => navigate('/admin/dashboard')} className="flex flex-col items-center gap-1.5 p-2 text-gray-500 hover:text-white">
            <div className="w-10 h-10 rounded-2xl bg-[#1a1a1a] flex items-center justify-center">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" /></svg>
            </div>
            <span className="text-xs font-medium">Home</span>
          </button>
          <button onClick={() => navigate('/admin/users')} className="flex flex-col items-center gap-1.5 p-2 text-gray-500 hover:text-white">
            <div className="w-10 h-10 rounded-2xl bg-[#1a1a1a] flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            </div>
            <span className="text-xs font-medium">Users</span>
          </button>
          <button onClick={() => navigate('/admin/jtoken')} className="flex flex-col items-center gap-1.5 p-2 text-gray-500 hover:text-white">
            <div className="w-10 h-10 rounded-2xl bg-[#1a1a1a] flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <span className="text-xs font-medium">J Token</span>
          </button>
          <button onClick={() => navigate('/admin/settings')} className="flex flex-col items-center gap-1.5 p-2 text-gray-500 hover:text-white">
            <div className="w-10 h-10 rounded-2xl bg-[#1a1a1a] flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /></svg>
            </div>
            <span className="text-xs font-medium">Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminJTokenHistory;