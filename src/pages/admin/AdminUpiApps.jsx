import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import { useAuthStore } from '../../store';
import AdminNotificationBell from '../../components/AdminNotificationBell';

const AdminUpiApps = () => {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [iconUrl, setIconUrl] = useState('');
  const [isForJToken, setIsForJToken] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { logout } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => { fetchApps(); }, []);
  const fetchApps = async () => { try { const res = await adminAPI.getUpiApps(); setApps(res?.data || res || []); } catch { console.error('Failed to fetch UPI apps'); } finally { setLoading(false); } };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try { editId ? await adminAPI.updateUpiApp(editId, { name, iconUrl, isForJToken }) : await adminAPI.createUpiApp({ name, iconUrl }); setName(''); setIconUrl(''); setIsForJToken(false); setShowForm(false); setEditId(null); fetchApps(); }
    catch { console.error('Failed to save UPI app'); }
    finally { setSaving(false); }
  };

  const handleEdit = (app) => { setName(app.name); setIconUrl(app.iconUrl || ''); setIsForJToken(app.isforjtoken === true || app.isforjtoken === 'true' || app.isForJToken === true || app.isForJToken === 'true'); setEditId(app.id); setShowForm(true); };
  const handleToggle = async (app) => { try { await adminAPI.updateUpiApp(app.id, { isActive: !(app.isActive || app.isactive) }); fetchApps(); } catch { console.error('Failed to toggle UPI app'); } };
  const handleSetJToken = async (app) => { try { const current = app.isforjtoken === true || app.isforjtoken === 'true' || app.isForJToken === true || app.isForJToken === 'true'; await adminAPI.updateUpiApp(app.id, { isForJToken: !current }); fetchApps(); } catch { console.error('Failed to set JToken app'); } };
  const handleDelete = async (id) => { if (!confirm('Are you sure?')) return; try { await adminAPI.deleteUpiApp(id); fetchApps(); } catch { console.error('Failed to delete UPI app'); } };

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
      {sidebarOpen && <div className="fixed inset-0 bg-black/80 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}
      <div className={`fixed top-0 left-0 h-full w-80 bg-[#0d0d0d] z-50 transform transition-transform duration-300 lg:hidden ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-5 border-b border-[#2a2a2a]">
          <div className="flex items-center justify-between">
            <div><h2 className="text-2xl font-bold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] bg-clip-text text-transparent">𝙅𝙀𝙓 𝙋𝘼𝙔</h2><p className="text-xs text-gray-500">Admin Panel</p></div>
            <button onClick={() => setSidebarOpen(false)} className="p-2 rounded-xl bg-[#1a1a1a]"><svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
          </div>
        </div>
        <div className="p-4 space-y-2">
          {menuItems.map((item, index) => (<button key={index} onClick={() => { navigate(item.path); setSidebarOpen(false); }} className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl bg-[#1a1a1a]/50 hover:bg-[#D4AF37]/10 text-left transition-all group"><div className="w-10 h-10 rounded-xl bg-[#1a1a1a] group-hover:bg-[#D4AF37]/20 flex items-center justify-center"><svg className="w-5 h-5 text-[#D4AF37]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} /></svg></div><span className="text-white font-medium">{item.label}</span></button>))}
          <hr className="border-[#2a2a2a] my-4" />
          <button onClick={handleLogout} className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl bg-red-500/10 hover:bg-red-500/20 text-left transition-all"><div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center"><svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg></div><span className="text-red-400 font-medium">Logout</span></button>
        </div>
      </div>
      <div className="sticky top-0 z-30 bg-[#0d0d0d]/80 backdrop-blur-2xl border-b border-[#1a1a1a]">
        <div className="flex items-center justify-between gap-2 px-3 py-3 sm:px-5 sm:py-4">
          <button onClick={() => setSidebarOpen(true)} className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-[#1a1a1a] hover:bg-[#252525]"><svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg></button>
          <h1 className="min-w-0 flex-1 truncate text-center text-base sm:text-xl font-bold text-white">UPI Apps</h1>
          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            <AdminNotificationBell />
            <button onClick={handleLogout} className="rounded-xl sm:rounded-2xl bg-red-500/10 px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-red-400 hover:bg-red-500/20">Logout</button>
          </div>
        </div>
      </div>
      <div className="p-5 space-y-5 max-w-2xl mx-auto">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-white">UPI Apps</h1>
          <button onClick={() => setShowForm(!showForm)} className="px-5 py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black font-bold rounded-2xl">{showForm ? 'Cancel' : 'Add UPI App'}</button>
        </div>
        {showForm && (
          <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] rounded-3xl p-6 border border-[#2a2a2a]">
            <h3 className="text-lg font-semibold text-white mb-4">{editId ? 'Edit UPI App' : 'Add New UPI App'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><label className="block text-gray-400 text-sm mb-2">App Name / UPI ID</label><input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter UPI ID or app name" className="w-full px-5 py-4 bg-[#0a0a0a] border border-[#2a2a2a] rounded-2xl text-white placeholder-gray-500 focus:border-[#D4AF37] focus:outline-none" required /></div>
              <div><label className="block text-gray-400 text-sm mb-2">Icon URL (Optional)</label><input type="text" value={iconUrl} onChange={(e) => setIconUrl(e.target.value)} placeholder="Enter icon URL" className="w-full px-5 py-4 bg-[#0a0a0a] border border-[#2a2a2a] rounded-2xl text-white placeholder-gray-500 focus:border-[#D4AF37] focus:outline-none" /></div>
              {editId && (
                <div className="flex items-center gap-3 p-4 bg-[#0a0a0a] rounded-2xl border border-[#D4AF37]/30">
                  <input type="checkbox" id="isForJToken" checked={isForJToken} onChange={(e) => setIsForJToken(e.target.checked)} className="w-5 h-5 accent-[#D4AF37]" />
                  <label htmlFor="isForJToken" className="text-white font-medium">Use for JToken Purchase</label>
                </div>
              )}
              <button type="submit" disabled={saving} className="w-full py-4 bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black font-bold rounded-2xl disabled:opacity-50">{saving ? 'Saving...' : (editId ? 'Update' : 'Create')}</button>
            </form>
          </div>
        )}
        <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] rounded-3xl p-3 sm:p-5 border border-[#2a2a2a]">
          {loading ? <div className="animate-pulse space-y-3">{[1,2,3].map(i => <div key={i} className="h-20 bg-[#0a0a0a] rounded-2xl"></div>)}</div> : apps.length === 0 ? <p className="text-gray-500 text-center py-8">No UPI apps found</p> : (
            <div className="space-y-3">
              {apps.map((app) => {
                const isJToken = app.isforjtoken === true || app.isforjtoken === 'true' || app.isForJToken === true || app.isForJToken === 'true';
                return (
                <div key={app.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 sm:p-4 bg-[#0a0a0a] rounded-2xl border border-[#1a1a1a]">
                  <div className="w-full sm:w-auto">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-white font-medium text-sm sm:text-base">{app.name}</p>
                      {isJToken && <span className="px-2 py-0.5 bg-[#D4AF37]/20 text-[#D4AF37] text-xs rounded-full">JToken</span>}
                    </div>
                    <p className="text-gray-500 text-xs sm:text-sm">{(app.isActive || app.isactive) ? 'Active' : 'Inactive'}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 w-full sm:w-auto items-center">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <span className="text-gray-400 text-xs">JToken</span>
                      <div className="relative">
                        <input type="checkbox" checked={isJToken} onChange={() => handleSetJToken(app)} className="sr-only peer" />
                        <div className="w-11 h-6 bg-[#1a1a1a] rounded-full peer peer-checked:bg-[#D4AF37] transition-colors"></div>
                        <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full transition-transform peer-checked:translate-x-5"></div>
                      </div>
                    </label>
                    <button onClick={() => handleToggle(app)} className="flex-1 sm:flex-none px-3 py-2 bg-[#1a1a1a] text-gray-400 rounded-xl text-xs sm:text-sm hover:bg-[#252525]">{(app.isActive || app.isactive) ? 'Disable' : 'Enable'}</button>
                    <button onClick={() => handleEdit(app)} className="flex-1 sm:flex-none px-3 py-2 bg-[#1a1a1a] text-gray-400 rounded-xl text-xs sm:text-sm hover:bg-[#252525]">Edit</button>
                    <button onClick={() => handleDelete(app.id)} className="flex-1 sm:flex-none px-3 py-2 bg-red-500/20 text-red-400 rounded-xl text-xs sm:text-sm hover:bg-red-500/30">Delete</button>
                  </div>
                </div>
              )})}
            </div>
          )}
        </div>
      </div>
      <div className="fixed bottom-0 left-0 right-0 bg-[#0d0d0d]/95 backdrop-blur-2xl border-t border-[#1a1a1a] lg:hidden z-50">
        <div className="flex items-center justify-around py-2 px-1">
          <button onClick={() => navigate('/admin/dashboard')} className="flex flex-col items-center gap-1.5 p-2 text-gray-500"><div className="w-10 h-10 rounded-2xl bg-[#1a1a1a] flex items-center justify-center"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" /></svg></div><span className="text-xs font-medium">Home</span></button>
          <button onClick={() => navigate('/admin/users')} className="flex flex-col items-center gap-1.5 p-2 text-gray-500"><div className="w-10 h-10 rounded-2xl bg-[#1a1a1a] flex items-center justify-center"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg></div><span className="text-xs font-medium">Users</span></button>
          <button onClick={() => navigate('/admin/deposits')} className="flex flex-col items-center gap-1.5 p-2 text-gray-500"><div className="w-10 h-10 rounded-2xl bg-[#1a1a1a] flex items-center justify-center"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg></div><span className="text-xs font-medium">Deposits</span></button>
          <button onClick={() => navigate('/admin/withdrawals')} className="flex flex-col items-center gap-1.5 p-2 text-gray-500"><div className="w-10 h-10 rounded-2xl bg-[#1a1a1a] flex items-center justify-center"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg></div><span className="text-xs font-medium">Withdraw</span></button>
          <button onClick={() => navigate('/admin/settings')} className="flex flex-col items-center gap-1.5 p-2 text-gray-500"><div className="w-10 h-10 rounded-2xl bg-[#1a1a1a] flex items-center justify-center"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /></svg></div><span className="text-xs font-medium">Settings</span></button>
        </div>
      </div>
    </div>
  );
};

export default AdminUpiApps;
