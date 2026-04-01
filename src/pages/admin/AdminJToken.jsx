import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import { useAuthStore } from '../../store';
import AdminNotificationBell from '../../components/AdminNotificationBell';

const AdminJToken = () => {
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [amount, setAmount] = useState('');
  const [action, setAction] = useState('CREDIT');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [limitSaving, setLimitSaving] = useState(false);
  const [minBuyAmount, setMinBuyAmount] = useState(10);
  const [message, setMessage] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { logout } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await adminAPI.getSettings();
        const data = res?.data || res || {};
        setMinBuyAmount(parseFloat(data.minjtokenbuy) || 10);
      } catch (error) {
        console.error('Failed to fetch J Token settings', error);
      }
    };

    fetchSettings();

  }, []);

  useEffect(() => {
    if (search.trim().length < 2) {
      setUsers([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await adminAPI.getUsers({ page: 1, limit: 10, search });
        const data = res?.data || res;
        setUsers((data?.users || []).filter(Boolean));
      } catch (error) {
        console.error('Failed to search users', error);
      } finally {
        setLoading(false);
      }
    }, 350);

    return () => clearTimeout(timeoutId);
  }, [search]);

  const handleSaveLimit = async () => {
    if (!minBuyAmount || parseFloat(minBuyAmount) <= 0) {
      setMessage('Enter a valid minimum INR amount');
      return;
    }

    setLimitSaving(true);
    setMessage('');
    try {
      await adminAPI.updateSettings({ minJTokenBuy: parseFloat(minBuyAmount) });
      setMessage('Minimum J Token buy amount updated successfully');
    } catch (error) {
      setMessage(error?.message || 'Failed to update minimum J Token buy amount');
    } finally {
      setLimitSaving(false);
    }
  };

  const menuItems = [
    { label: 'Home', path: '/admin/dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v-6a1 1 0 00-1-1h-3m-9 16v2a1 1 0 001 1h2' },
    { label: 'Users', path: '/admin/users', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
    { label: 'J Token', path: '/admin/jtoken', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    { label: 'Requests', path: '/admin/jtoken-requests', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
    { label: 'Exchange', path: '/admin/exchange', icon: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4' },
    { label: 'History', path: '/admin/jtoken-history', icon: 'M4 6h16M4 12h16M4 18h10' },
    { label: 'Settings', path: '/admin/settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUser) {
      setMessage('Please select a user first');
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      setMessage('Enter a valid J Token amount');
      return;
    }

    setSaving(true);
    setMessage('');
    try {
      const res = await adminAPI.updateUserJToken(selectedUser.id, {
        action,
        amount: parseFloat(amount),
        note: note.trim()
      });
      const data = res?.data || res;
      setMessage(data?.message || 'J Token updated successfully');
      setAmount('');
      setNote('');
      const refresh = await adminAPI.getUserDetails(selectedUser.id);
      const refreshed = refresh?.data || refresh;
      setSelectedUser({ ...selectedUser, wallet: refreshed.wallet });
    } catch (error) {
      setMessage(error?.response?.data?.error || 'Failed to update balance');
    } finally {
      setSaving(false);
    }
  };

  const handleSelectUser = async (user) => {
    setLoading(true);
    try {
      const res = await adminAPI.getUserDetails(user.id);
      const details = res?.data || res;
      setSelectedUser({ ...user, wallet: details.wallet });
      setMessage('');
    } catch (error) {
      setMessage(error?.message || 'Failed to load user details');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] pb-24 font-['Ubuntu',sans-serif]">
      {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/80 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <div className={`fixed top-0 left-0 z-50 h-full w-80 transform bg-[#0d0d0d] transition-transform duration-300 lg:hidden ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="border-b border-[#2a2a2a] p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="bg-gradient-to-r from-[#D4AF37] to-[#FFD700] bg-clip-text text-2xl font-bold text-transparent">𝙅𝙀𝙓 𝙋𝘼𝙔</h2>
              <p className="text-xs text-gray-500">J Token Control</p>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="rounded-xl bg-[#1a1a1a] p-2 text-white">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>
        <div className="space-y-2 p-4">
          {menuItems.map((item) => (
            <button key={item.path} onClick={() => { navigate(item.path); setSidebarOpen(false); }} className={`flex w-full items-center gap-4 rounded-2xl px-5 py-4 text-left ${item.path === '/admin/jtoken' ? 'bg-[#D4AF37]/10' : 'bg-[#1a1a1a]/50'}`}>
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
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-2 px-3 py-3 sm:px-4 sm:py-4">
          <button onClick={() => setSidebarOpen(true)} className="rounded-xl sm:rounded-2xl bg-[#1a1a1a] p-2.5 sm:p-3 text-white lg:hidden">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
          <div className="min-w-0 flex-1 text-center lg:text-left">
            <p className="text-xs uppercase tracking-[0.25em] text-[#D4AF37]">Admin</p>
            <h1 className="truncate text-base sm:text-xl font-bold text-white">J Token Manager</h1>
          </div>
          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            <AdminNotificationBell />
            <button onClick={() => navigate('/admin/jtoken-history')} className="rounded-xl sm:rounded-2xl bg-[#1a1a1a] px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold text-[#D4AF37]">History</button>
            <button onClick={handleLogout} className="rounded-xl sm:rounded-2xl bg-red-500/10 px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold text-red-400 hover:bg-red-500/20">Logout</button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl space-y-5 px-4 py-5">
        <div className="rounded-[28px] border border-[#3a3020] bg-[radial-gradient(circle_at_top_left,_rgba(212,175,55,0.16),_transparent_35%),linear-gradient(135deg,#171717_0%,#101010_60%,#090909_100%)] p-6">
          <p className="text-sm text-gray-400">Manual reward distribution</p>
          <h2 className="mt-2 text-3xl font-bold text-white">Credit or debit J Token with full admin control</h2>
          <p className="mt-2 text-sm text-gray-500">Search by email or referral code, then apply the exact reward adjustment you want.</p>
        </div>

        <div className="rounded-[28px] border border-[#242424] bg-gradient-to-br from-[#171717] to-[#0d0d0d] p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white">Minimum Buy Limit</h3>
              <p className="mt-1 text-sm text-gray-500">Set the minimum INR amount a user must spend to buy J Token.</p>
              <input
                type="number"
                min="0"
                step="0.01"
                value={minBuyAmount}
                onChange={(e) => setMinBuyAmount(e.target.value)}
                placeholder="Minimum INR amount"
                className="mt-4 w-full rounded-2xl border border-[#2a2a2a] bg-[#0a0a0a] px-4 py-4 text-white placeholder-gray-500 focus:border-[#D4AF37] focus:outline-none"
              />
            </div>
            <button
              onClick={handleSaveLimit}
              disabled={limitSaving}
              className="rounded-2xl bg-gradient-to-r from-[#D4AF37] to-[#FFD700] px-5 py-4 font-bold text-black disabled:opacity-50"
            >
              {limitSaving ? 'Saving...' : 'Save Limit'}
            </button>
          </div>
        </div>

        {message && (
          <div className={`rounded-2xl px-4 py-3 text-sm font-medium ${message.toLowerCase().includes('success') || message.toLowerCase().includes('credited') || message.toLowerCase().includes('debited') ? 'border border-green-500/30 bg-green-500/10 text-green-400' : 'border border-red-500/30 bg-red-500/10 text-red-400'}`}>
            {message}
          </div>
        )}

        <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
          <div className="rounded-[28px] border border-[#242424] bg-gradient-to-br from-[#171717] to-[#0d0d0d] p-5">
            <h3 className="text-lg font-semibold text-white">Find User</h3>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by email or referral code"
              className="mt-4 w-full rounded-2xl border border-[#2a2a2a] bg-[#0a0a0a] px-4 py-4 text-white placeholder-gray-500 focus:border-[#D4AF37] focus:outline-none"
            />
            <div className="mt-4 space-y-3">
              {loading && <p className="text-sm text-gray-500">Loading users...</p>}
              {!loading && search.trim().length >= 2 && users.length === 0 && <p className="text-sm text-gray-500">No users found</p>}
              {users.filter((user) => user?.id).map((user) => (
                <button key={user.id} onClick={() => handleSelectUser(user)} className="w-full rounded-2xl border border-[#242424] bg-[#101010] p-4 text-left transition hover:border-[#D4AF37]/40">
                  <p className="font-semibold text-white">{user.email || 'No email'}</p>
                  <p className="mt-1 text-xs text-gray-500">Referral: {user.referralcode || 'N/A'}</p>
                  <p className="mt-2 text-sm text-[#D4AF37]">Current J Token: {parseFloat(user.tokenbalance || 0).toFixed(2)}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] border border-[#242424] bg-gradient-to-br from-[#171717] to-[#0d0d0d] p-5">
            <h3 className="text-lg font-semibold text-white">Adjust Balance</h3>
            {selectedUser ? (
              <>
                <div className="mt-4 rounded-2xl border border-[#2a2a2a] bg-[#0b0b0b] p-4">
                  <p className="text-sm text-gray-500">Selected user</p>
                  <p className="mt-1 font-semibold text-white">{selectedUser.email}</p>
                  <p className="mt-2 text-sm text-[#D4AF37]">Live J Token balance: {parseFloat(selectedUser.wallet?.tokenbalance || selectedUser.tokenbalance || 0).toFixed(2)}</p>
                </div>

                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <button type="button" onClick={() => setAction('CREDIT')} className={`rounded-2xl py-4 font-bold ${action === 'CREDIT' ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white' : 'border border-[#2a2a2a] bg-[#0a0a0a] text-gray-400'}`}>
                      Credit
                    </button>
                    <button type="button" onClick={() => setAction('DEBIT')} className={`rounded-2xl py-4 font-bold ${action === 'DEBIT' ? 'bg-gradient-to-r from-red-500 to-rose-600 text-white' : 'border border-[#2a2a2a] bg-[#0a0a0a] text-gray-400'}`}>
                      Debit
                    </button>
                  </div>
                  <input type="number" min="0" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="J Token amount" className="w-full rounded-2xl border border-[#2a2a2a] bg-[#0a0a0a] px-4 py-4 text-white placeholder-gray-500 focus:border-[#D4AF37] focus:outline-none" />
                  <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Reason or note" rows={4} className="w-full rounded-2xl border border-[#2a2a2a] bg-[#0a0a0a] px-4 py-4 text-white placeholder-gray-500 focus:border-[#D4AF37] focus:outline-none" />
                  <button type="submit" disabled={saving} className="w-full rounded-2xl bg-gradient-to-r from-[#D4AF37] to-[#FFD700] py-4 font-bold text-black disabled:opacity-50">
                    {saving ? 'Updating...' : `${action === 'CREDIT' ? 'Credit' : 'Debit'} J Token`}
                  </button>
                </form>
              </>
            ) : (
              <div className="mt-4 rounded-2xl border border-dashed border-[#2a2a2a] bg-[#0b0b0b] px-4 py-10 text-center text-sm text-gray-500">
                Search and select a user to start manual J Token adjustment.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminJToken;
