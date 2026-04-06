import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import { useAuthStore } from '../../store';
import AdminNotificationBell from '../../components/AdminNotificationBell';

const AdminManagers = () => {
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '', name: '', referrerCode: '' });
  const [editData, setEditData] = useState({ id: '', email: '', name: '', password: '' });
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [message, setMessage] = useState('');
  const [selectedManager, setSelectedManager] = useState(null);
  const [referralUsers, setReferralUsers] = useState([]);
  const [loadingReferrals, setLoadingReferrals] = useState(false);
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

  const fetchManagerReferrals = async (manager) => {
    if (!manager.referralcode) return;
    setLoadingReferrals(true);
    try {
      const res = await adminAPI.getReferralsByCode(manager.referralcode);
      setReferralUsers(res || []);
    } catch (e) { console.error(e); }
    finally { setLoadingReferrals(false); }
  };

  const handleViewReferrals = (manager) => {
    setSelectedManager(manager);
    fetchManagerReferrals(manager);
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
      setTimeout(() => { setShowModal(false); setMessage(''); }, 2000);
    } catch (e) {
      setMessage(e.response?.data?.error || 'Failed to create manager');
    }
    finally { setCreating(false); }
  };

  const handleEdit = (manager) => {
    setEditData({ id: manager.id, email: manager.email, name: manager.name, password: '' });
    setShowEditModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = { name: editData.name };
      if (editData.password) data.password = editData.password;
      await adminAPI.updateManager(editData.id, data);
      setMessage('Manager updated successfully!');
      fetchManagers();
      setTimeout(() => { setShowEditModal(false); setMessage(''); }, 1500);
    } catch (e) {
      setMessage(e.response?.data?.error || 'Failed to update manager');
    }
    finally { setSaving(false); }
  };

  const handleDelete = async (managerId) => {
    if (!window.confirm('Are you sure you want to delete this manager?')) return;
    setDeleting(managerId);
    try {
      await adminAPI.deleteManager(managerId);
      fetchManagers();
    } catch (e) {
      alert(e.response?.data?.error || 'Failed to delete manager');
    }
    finally { setDeleting(null); }
  };

  const handleToggleJTokenRequest = async (manager, currentStatus) => {
    try {
      await adminAPI.toggleManagerJTokenRequest(manager.id, !currentStatus);
      fetchManagers();
    } catch (e) {
      alert(e.response?.data?.error || 'Failed to update permission');
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
    { icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z', label: 'Managers', path: '/admin/managers' },
    { icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z', label: 'Settings', path: '/admin/settings' },
  ];

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="min-h-screen bg-[#0a0a0a] pb-24 lg:pb-8 font-['Ubuntu',sans-serif]">
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold text-white">Managers</h1>
          <div className="flex gap-2">
            {managers.length > 0 && (
              <button onClick={async () => {
                if (!window.confirm('Delete ALL managers?')) return;
                try {
                  await adminAPI.deleteAllManagers();
                  fetchManagers();
                } catch (e) { alert(e.response?.data?.error || 'Failed to delete managers'); }
              }} className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold">
                Delete All
              </button>
            )}
            <button onClick={() => setShowModal(true)} className="bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black font-bold px-4 py-2 rounded-lg">
              + Add Manager
            </button>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => <div key={i} className="h-16 bg-[#1a1a1a] rounded-xl animate-pulse"></div>)}
          </div>
        ) : managers.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No managers yet</p>
        ) : (
          <div className="space-y-3 lg:space-y-0">
            <div className="hidden lg:grid grid-cols-7 bg-[#1a1a1a] rounded-t-xl p-4 text-gray-400 text-sm font-semibold">
              <div className="col-span-1">Name</div>
              <div className="col-span-2">Email</div>
              <div className="col-span-1">Referral Code</div>
              <div className="col-span-1">JToken Request</div>
              <div className="col-span-1">Created</div>
              <div className="col-span-1">Actions</div>
            </div>
            {managers.map(m => (
              <div key={m.id} className="bg-[#121212] rounded-xl border border-[#1d1d1d] p-4 lg:p-0 lg:border-none lg:grid lg:grid-cols-7 lg:items-center">
                <div className="lg:col-span-1 mb-2 lg:mb-0">
                  <p className="text-gray-400 text-xs lg:hidden">Name</p>
                  <p className="text-white font-medium">{m.name}</p>
                </div>
                <div className="lg:col-span-2 mb-2 lg:mb-0">
                  <p className="text-gray-400 text-xs lg:hidden">Email</p>
                  <p className="text-gray-300 text-sm">{m.email}</p>
                </div>
                <div className="lg:col-span-1 mb-2 lg:mb-0">
                  <p className="text-gray-400 text-xs lg:hidden">Referral Code</p>
                  <p className="text-[#D4AF37] font-mono text-sm">{m.referralcode}</p>
                </div>
                <div className="lg:col-span-1 mb-2 lg:mb-0">
                  <p className="text-gray-400 text-xs lg:hidden">JToken Request</p>
                  <button
                    onClick={() => handleToggleJTokenRequest(m, m.managerJTokenRequestEnabled)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                      m.managerJTokenRequestEnabled 
                        ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' 
                        : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                    }`}
                  >
                    {m.managerJTokenRequestEnabled ? '✓ Enabled' : '✕ Disabled'}
                  </button>
                </div>
                <div className="lg:col-span-1 mb-2 lg:mb-0">
                  <p className="text-gray-400 text-xs lg:hidden">Created</p>
                  <p className="text-gray-500 text-sm">{m.createdat ? new Date(m.createdat).toLocaleDateString('en-IN') : 'N/A'}</p>
                </div>
                <div className="lg:col-span-1 flex flex-wrap gap-2">
                  <button 
                    onClick={() => handleViewReferrals(m)}
                    className="text-xs sm:text-sm bg-[#D4AF37]/20 text-[#D4AF37] px-2 sm:px-3 py-1.5 rounded-lg hover:bg-[#D4AF37]/30"
                  >
                    View
                  </button>
                  <button 
                    onClick={() => handleEdit(m)}
                    className="text-xs sm:text-sm bg-blue-500/20 text-blue-400 px-2 sm:px-3 py-1.5 rounded-lg hover:bg-blue-500/30"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(m.id)}
                    disabled={deleting === m.id}
                    className="text-xs sm:text-sm bg-red-500/20 text-red-400 px-2 sm:px-3 py-1.5 rounded-lg hover:bg-red-500/30 disabled:opacity-50"
                  >
                    {deleting === m.id ? '...' : 'Delete'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#121212] border border-[#D4AF37]/30 rounded-2xl p-6 w-full max-w-md my-8">
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
                <button type="button" onClick={() => { setShowModal(false); setMessage(''); }} className="flex-1 py-3 bg-[#1a1a1a] text-white rounded-lg">Cancel</button>
                <button type="submit" disabled={creating} className="flex-1 py-3 bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black font-bold rounded-lg">
                  {creating ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#121212] border border-[#D4AF37]/30 rounded-2xl p-6 w-full max-w-md my-8">
            <h2 className="text-xl font-bold text-white mb-4">Edit Manager</h2>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="text-gray-400 text-sm">Name</label>
                <input type="text" required value={editData.name} onChange={e => setEditData({...editData, name: e.target.value})}
                  className="w-full bg-[#0a0a0a] border border-[#1d1d1d] rounded-lg p-3 text-white" />
              </div>
              <div>
                <label className="text-gray-400 text-sm">Email (read-only)</label>
                <input type="email" value={editData.email} disabled
                  className="w-full bg-[#0a0a0a] border border-[#1d1d1d] rounded-lg p-3 text-gray-500" />
              </div>
              <div>
                <label className="text-gray-400 text-sm">New Password (leave blank to keep current)</label>
                <input type="password" value={editData.password} onChange={e => setEditData({...editData, password: e.target.value})}
                  className="w-full bg-[#0a0a0a] border border-[#1d1d1d] rounded-lg p-3 text-white" />
              </div>
              {message && <p className={message.includes('Failed') ? 'text-rose-400' : 'text-emerald-400'}>{message}</p>}
              <div className="flex gap-3">
                <button type="button" onClick={() => { setShowEditModal(false); setMessage(''); }} className="flex-1 py-3 bg-[#1a1a1a] text-white rounded-lg">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-bold rounded-lg">
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedManager && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-start justify-center p-4 pt-10 overflow-y-auto" onClick={() => setSelectedManager(null)}>
          <div className="bg-[#121212] border border-[#D4AF37]/30 rounded-2xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">
                {selectedManager.name}'s Referrals
              </h2>
              <button onClick={() => setSelectedManager(null)} className="text-gray-400 hover:text-white text-xl">✕</button>
            </div>
            
            <div className="mb-4 p-3 bg-[#1a1a1a] rounded-lg">
              <p className="text-gray-400 text-sm">Referral Code: <span className="text-[#D4AF37] font-mono">{selectedManager.referralcode}</span></p>
              <p className="text-gray-400 text-sm">Total Referrals: <span className="text-white font-bold">{referralUsers.length}</span></p>
            </div>

            {loadingReferrals ? (
              <p className="text-gray-500 text-center py-4">Loading...</p>
            ) : referralUsers.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No users joined using this referral code</p>
            ) : (
              <div className="space-y-2">
                {referralUsers.map(user => (
                  <div key={user.id} className="p-3 bg-[#0a0a0a] rounded-lg flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">{user.name || 'N/A'}</p>
                      <p className="text-gray-400 text-sm">{user.email}</p>
                      <p className="text-gray-500 text-xs">Joined: {user.createdat ? new Date(user.createdat).toLocaleDateString('en-IN') : 'N/A'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[#D4AF37] text-sm">₹{parseFloat(user.inrbalance || 0).toFixed(2)}</p>
                      <p className="text-gray-500 text-xs">{user.isblocked ? 'Blocked' : 'Active'}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminManagers;
