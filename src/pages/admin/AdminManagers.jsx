import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import { useAuthStore } from '../../store';
import AdminNotificationBell from '../../components/AdminNotificationBell';

const AdminManagers = () => {
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '', name: '', referrerCode: '' });
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState('');
  const { logout, user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchManagers();
  }, []);

  const fetchManagers = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getManagers();
      setManagers(res || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    setMessage('');
    try {
      const res = await adminAPI.createManager(formData);
      setMessage('Manager created! Referral Code: ' + (res?.referralCode || 'N/A'));
      setFormData({ email: '', password: '', name: '', referrerCode: '' });
      fetchManagers();
      setTimeout(() => setShowModal(false), 2000);
    } catch (e) {
      setMessage(e.response?.data?.error || 'Failed to create manager');
    }
    finally { setCreating(false); }
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
    { icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z', label: 'Managers', path: '/admin/managers' },
    { icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z', label: 'Settings', path: '/admin/settings' },
  ];

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="min-h-screen bg-[#0a0a0a] font-['Ubuntu',sans-serif]">
      <div className="sticky top-0 z-30 bg-gradient-to-r from-[#0d0d0d] via-[#1a1a1a] to-[#0d0d0d] backdrop-blur-2xl border-b border-[#D4AF37]/20">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/admin/dashboard')} className="text-[#D4AF37] font-bold text-xl">JEX PAY</button>
            <span className="text-gray-500 text-sm">Admin</span>
          </div>
          <div className="flex items-center gap-3">
            <AdminNotificationBell />
            <button onClick={handleLogout} className="text-gray-400 hover:text-white">Logout</button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white">Managers</h1>
          <button onClick={() => setShowModal(true)} className="bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black font-bold px-4 py-2 rounded-lg">
            + Add Manager
          </button>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => <div key={i} className="h-16 bg-[#1a1a1a] rounded-xl animate-pulse"></div>)}
          </div>
        ) : managers.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No managers yet</p>
        ) : (
          <div className="bg-[#121212] rounded-2xl border border-[#1d1d1d] overflow-hidden">
            <table className="w-full">
              <thead className="bg-[#1a1a1a]">
                <tr>
                  <th className="text-left p-4 text-gray-400 text-sm">Name</th>
                  <th className="text-left p-4 text-gray-400 text-sm">Email</th>
                  <th className="text-left p-4 text-gray-400 text-sm">Referral Code</th>
                  <th className="text-left p-4 text-gray-400 text-sm">Created</th>
                </tr>
              </thead>
              <tbody>
                {managers.map(m => (
                  <tr key={m.id} className="border-t border-[#1d1d1d]">
                    <td className="p-4 text-white font-medium">{m.name}</td>
                    <td className="p-4 text-gray-300">{m.email}</td>
                    <td className="p-4 text-[#D4AF37] font-mono">{m.referralcode}</td>
                    <td className="p-4 text-gray-500 text-sm">{m.createdat ? new Date(m.createdat).toLocaleDateString('en-IN') : 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-[#121212] border border-[#D4AF37]/30 rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-white mb-4">Add New Manager</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-gray-400 text-sm">Name</label>
                <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-[#0a0a0a] border border-[#1d1d1d] rounded-lg p-3 text-white" />
              </div>
              <div>
                <label className="text-gray-400 text-sm">Email</label>
                <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-[#0a0a0a] border border-[#1d1d1d] rounded-lg p-3 text-white" />
              </div>
              <div>
                <label className="text-gray-400 text-sm">Password</label>
                <input type="password" required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})}
                  className="w-full bg-[#0a0a0a] border border-[#1d1d1d] rounded-lg p-3 text-white" />
              </div>
              <div>
                <label className="text-gray-400 text-sm">Referrer Code (Optional)</label>
                <input type="text" value={formData.referrerCode} onChange={e => setFormData({...formData, referrerCode: e.target.value})}
                  className="w-full bg-[#0a0a0a] border border-[#1d1d1d] rounded-lg p-3 text-white" />
              </div>
              {message && <p className={message.includes('Failed') ? 'text-rose-400' : 'text-emerald-400'}>{message}</p>}
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 bg-[#1a1a1a] text-white rounded-lg">Cancel</button>
                <button type="submit" disabled={creating} className="flex-1 py-3 bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black font-bold rounded-lg">
                  {creating ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminManagers;
