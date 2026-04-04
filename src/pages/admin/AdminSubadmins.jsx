import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import { useAuthStore } from '../../store';
import AdminNotificationBell from '../../components/AdminNotificationBell';

const AdminSubadmins = () => {
  const [subadmins, setSubadmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { logout } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => { fetchSubadmins(); }, []);

  const fetchSubadmins = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getSubadmins();
      setSubadmins(res?.data || res || []);
    } catch { console.log('Failed to fetch subadmins'); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await adminAPI.updateSubadmin(editingId, formData);
      } else {
        await adminAPI.createSubadmin(formData);
      }
      setShowModal(false);
      setFormData({ name: '', email: '', password: '' });
      setEditingId(null);
      fetchSubadmins();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to save subadmin');
    }
  };

  const handleEdit = (subadmin) => {
    setEditingId(subadmin.id);
    setFormData({ name: subadmin.name, email: subadmin.email, password: '' });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this subadmin?')) return;
    try {
      await adminAPI.deleteSubadmin(id);
      fetchSubadmins();
    } catch { alert('Failed to delete subadmin'); }
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
    { icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z', label: 'Subadmins', path: '/admin/subadmins' },
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
            <button key={index} onClick={() => { navigate(item.path); setSidebarOpen(false); }} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-left transition-all ${item.path === '/admin/subadmins' ? 'bg-[#D4AF37]/10 text-white' : 'bg-[#1a1a1a]/50 hover:bg-[#D4AF37]/10 text-gray-300'}`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.path === '/admin/subadmins' ? 'bg-[#D4AF37]/20' : 'bg-[#1a1a1a]'}`}>
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
            <h1 className="text-white font-bold text-xl">Subadmins</h1>
          </div>
          <AdminNotificationBell />
        </div>

        <div className="p-4">
          <button onClick={() => { setEditingId(null); setFormData({ name: '', email: '', password: '' }); setShowModal(true); }} className="mb-4 px-4 py-2 bg-[#D4AF37] text-black font-semibold rounded-xl hover:bg-[#c9a030]">
            + Add Subadmin
          </button>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {loading ? (
              <div className="col-span-full text-center py-8 text-gray-400">Loading...</div>
            ) : subadmins.length === 0 ? (
              <div className="col-span-full text-center py-8 text-gray-400">No subadmins found</div>
            ) : (
              subadmins.map((subadmin) => (
                <div key={subadmin.id} className="bg-[#1a1a1a] rounded-2xl p-5 border border-[#242424]">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37] font-bold text-lg">
                      {(subadmin.name || 'S')[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-white font-semibold">{subadmin.name}</p>
                      <p className="text-gray-500 text-sm">{subadmin.email}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(subadmin)} className="flex-1 py-2 bg-[#D4AF37]/20 text-[#D4AF37] rounded-lg text-sm hover:bg-[#D4AF37]/30">Edit</button>
                    <button onClick={() => handleDelete(subadmin.id)} className="flex-1 py-2 bg-red-500/20 text-red-400 rounded-lg text-sm hover:bg-red-500/30">Delete</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-[#0d0d0d] rounded-3xl p-6 w-full max-w-md border border-[#242424]" onClick={e => e.stopPropagation()}>
            <h3 className="text-white font-bold text-xl mb-4">{editingId ? 'Edit Subadmin' : 'Add Subadmin'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-gray-400 text-sm">Name</label>
                <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#242424] rounded-xl text-white focus:border-[#D4AF37] focus:outline-none" required />
              </div>
              <div>
                <label className="text-gray-400 text-sm">Email</label>
                <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#242424] rounded-xl text-white focus:border-[#D4AF37] focus:outline-none" required />
              </div>
              <div>
                <label className="text-gray-400 text-sm">{editingId ? 'New Password (leave blank to keep)' : 'Password'}</label>
                <input type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#242424] rounded-xl text-white focus:border-[#D4AF37] focus:outline-none" {...(editingId ? {} : {required: true})} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 bg-[#1a1a1a] text-gray-400 rounded-xl font-semibold hover:bg-[#252525]">Cancel</button>
                <button type="submit" className="flex-1 py-3 bg-[#D4AF37] text-black font-semibold rounded-xl hover:bg-[#c9a030]">{editingId ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSubadmins;
