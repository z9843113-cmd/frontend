import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import AdminNotificationBell from '../../components/AdminNotificationBell';
import { FaSearch, FaMobileAlt, FaCheck, FaTimes, FaRedo } from 'react-icons/fa';

const AdminMobileVerifications = () => {
  const [verifications, setVerifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [processingId, setProcessingId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const fetchVerifications = async (statusFilter = status) => {
    setLoading(true);
    setError('');
    try {
      const params = { page, limit: 10 };
      if (statusFilter && statusFilter !== 'ALL') {
        params.status = statusFilter;
      }
      if (search && search.trim()) {
        params.search = search.trim();
      }
      const res = await adminAPI.getMobileVerifications(params);
      setVerifications(res.verifications || []);
      setTotal(res.total || 0);
    } catch (err) {
      console.error('Failed to load verifications:', err);
      setError(err?.message || 'Failed to load verifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchVerifications(); }, [page, status]);

  useEffect(() => {
    const interval = setInterval(() => {
      const params = { page, limit: 10 };
      if (status && status !== 'ALL') {
        params.status = status;
      }
      if (search && search.trim()) {
        params.search = search.trim();
      }
      adminAPI.getMobileVerifications(params).then(res => {
        setVerifications(res.verifications || []);
        setTotal(res.total || 0);
      }).catch(() => {});
    }, 3000);
    return () => clearInterval(interval);
  }, [page, status, search]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchVerifications();
  };

  const handleReverify = async (id) => {
    if (!confirm('Re-verify this number? User will be able to submit OTP again.')) return;
    setProcessingId(id);
    try {
      await adminAPI.reverifyMobileOtp(id);
      alert('User can now submit OTP for reverification');
      fetchVerifications();
    } catch (err) {
      console.error('Reverify error:', err);
      alert(err?.message || err?.response?.data?.error || 'Failed to reverify');
    } finally {
      setProcessingId(null);
    }
  };

  const handleAskOtp = async (id) => {
    if (!confirm('Ask user to enter OTP?')) return;
    setProcessingId(id);
    try {
      await adminAPI.askMobileOtp(id);
      alert('User prompted to enter OTP');
      fetchVerifications();
    } catch (err) {
      console.error('Ask OTP error:', err);
      alert(err?.message || err?.response?.data?.error || 'Failed to ask OTP');
    } finally {
      setProcessingId(null);
    }
  };

  const handleApprove = async (id) => {
    if (!confirm('Approve this mobile verification?')) return;
    setProcessingId(id);
    try {
      await adminAPI.approveMobileVerification(id);
      fetchVerifications();
    } catch (err) {
      console.error('Approve error:', err);
      alert(err?.message || err?.response?.data?.error || 'Failed to approve');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id) => {
    const reason = prompt('Enter rejection reason (optional):');
    setProcessingId(id);
    try {
      await adminAPI.rejectMobileVerification(id, { reason });
      fetchVerifications();
    } catch (err) {
      console.error('Reject error:', err);
      alert(err?.message || err?.response?.data?.error || 'Failed to reject');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white">
      {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/80 lg:hidden" onClick={() => setSidebarOpen(false)} />}
      <div className={`fixed top-0 left-0 h-full w-80 bg-[#0d0d0d] z-50 transform transition-transform duration-300 lg:hidden ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-4 border-b border-[#2a2a2a]">
          <h2 className="text-xl font-bold text-[#D4AF37]">Jex Pay Admin</h2>
        </div>
        <nav className="p-4 space-y-2">
          <a href="/admin/dashboard" className="block py-2 px-4 rounded-lg hover:bg-[#1a1a1a]">Dashboard</a>
          <a href="/admin/users" className="block py-2 px-4 rounded-lg hover:bg-[#1a1a1a]">Users</a>
          <a href="/admin/deposits" className="block py-2 px-4 rounded-lg hover:bg-[#1a1a1a]">Deposits</a>
          <a href="/admin/withdrawals" className="block py-2 px-4 rounded-lg hover:bg-[#1a1a1a]">Withdrawals</a>
          <a href="/admin/upi-verifications" className="block py-2 px-4 rounded-lg hover:bg-[#1a1a1a]">UPI Verifications</a>
          <a href="/admin/mobile-verifications" className="block py-2 px-4 rounded-lg bg-[#D4AF37]/20 text-[#D4AF37]">Mobile Verifications</a>
          <a href="/admin/settings" className="block py-2 px-4 rounded-lg hover:bg-[#1a1a1a]">Settings</a>
          <a href="/" className="block py-2 px-4 rounded-lg hover:bg-[#1a1a1a] text-red-400">Logout</a>
        </nav>
      </div>
      
      <div className="fixed top-0 left-0 right-0 z-50 bg-[#0d0d0d] border-b border-[#2a2a2a]">
        <div className="flex items-center justify-between px-3 sm:px-4 py-3">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-[#1a1a1a] rounded-lg">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
          <h1 className="text-lg sm:text-xl font-bold">Mobile Verifications</h1>
          <AdminNotificationBell />
        </div>
      </div>

      <div className="pt-20 px-3 sm:px-4 pb-8">
        <div className="mb-3 sm:mb-4">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2 sm:gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by mobile or user ID..."
                className="w-full rounded-xl bg-[#1a1a1a] px-4 py-2 pl-10 text-white text-sm sm:text-base border border-[#2a2a2a]"
              />
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
            <button type="submit" className="px-4 py-2 bg-[#D4AF37] text-black font-medium rounded-xl hover:bg-[#c9a030]">
              Search
            </button>
          </form>
        </div>

        <div className="mb-3 sm:mb-4 flex flex-col sm:flex-row gap-2 sm:gap-4">
          <select 
            value={status} 
            onChange={(e) => { setStatus(e.target.value); setPage(1); }} 
            className="rounded-xl bg-[#1a1a1a] px-3 sm:px-4 py-2 text-white text-sm sm:text-base border border-[#2a2a2a]"
          >
            <option value="">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="OTP_REQUESTED">Awaiting OTP</option>
            <option value="OTP_SUBMITTED">OTP Submitted</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>

        {error && <div className="mb-4 rounded-xl bg-red-500/20 p-4 text-red-400">{error}</div>}

        {loading ? (
          <div className="animate-pulse space-y-4">
            {[1,2,3].map(i => <div key={i} className="h-20 rounded-xl bg-[#1a1a1a]" />)}
          </div>
        ) : verifications.length === 0 ? (
          <div className="rounded-xl bg-[#1a1a1a] p-8 text-center text-gray-400">No verification requests</div>
        ) : (
          <>
            <div className="space-y-3">
              {verifications.map(v => (
                <div key={v.id} className="rounded-xl border border-[#2a2a2a] bg-[#121212] p-3 sm:p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-white font-bold text-sm sm:text-base">{v.name || v.email || 'Unknown User'}</p>
                        <p className="text-gray-400 text-xs sm:text-sm">{v.email || 'No email'}</p>
                        <p className="text-blue-400 font-medium mt-1 text-sm sm:text-base">+91 {v.mobile}</p>
                        {v.otp && <p className="text-green-400 text-xs sm:text-sm mt-1">OTP: {v.otp}</p>}
                      </div>
                    </div>
                    <div className="flex flex-col sm:items-end gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        v.status === 'OTP_SUBMITTED' ? 'bg-blue-500/20 text-blue-400' :
                        v.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-400' :
                        v.status === 'OTP_REQUESTED' ? 'bg-orange-500/20 text-orange-400' :
                        v.status === 'APPROVED' ? 'bg-green-500/20 text-green-400' :
                        v.status === 'REJECTED' ? 'bg-red-500/20 text-red-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {v.status}
                      </span>
                      <p className="text-gray-500 text-xs">
                        {new Date(v.createdat).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 sm:mt-4">
                    {(v.status === 'PENDING' || v.status === 'OTP_SENT') && (
                      <div className="flex flex-col sm:flex-row gap-2">
                        <button
                          onClick={() => handleAskOtp(v.id)}
                          disabled={processingId === v.id}
                          className="flex-1 py-2 sm:py-2.5 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium text-sm disabled:opacity-50"
                        >
                          Ask OTP
                        </button>
                        <button
                          onClick={() => handleApprove(v.id)}
                          disabled={processingId === v.id}
                          className="flex-1 py-2 sm:py-2.5 bg-green-600 hover:bg-green-700 rounded-lg font-medium text-sm disabled:opacity-50"
                        >
                          Direct Approve
                        </button>
                        <button
                          onClick={() => handleReject(v.id)}
                          disabled={processingId === v.id}
                          className="flex-1 py-2 sm:py-2.5 bg-red-600 hover:bg-red-700 rounded-lg font-medium text-sm disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                    {v.status === 'OTP_REQUESTED' && (
                      <div className="space-y-2">
                        <div className="bg-[#0a0a0a] rounded-xl p-3">
                          <p className="text-yellow-400 text-sm font-medium">⏳ Waiting for user to enter OTP...</p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <button
                            onClick={() => handleApprove(v.id)}
                            disabled={processingId === v.id}
                            className="flex-1 py-2 sm:py-2.5 bg-green-600 hover:bg-green-700 rounded-lg font-medium text-sm disabled:opacity-50"
                          >
                            Direct Approve
                          </button>
                          <button
                            onClick={() => handleReject(v.id)}
                            disabled={processingId === v.id}
                            className="flex-1 py-2 sm:py-2.5 bg-red-600 hover:bg-red-700 rounded-lg font-medium text-sm disabled:opacity-50"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    )}
                    {v.status === 'OTP_SUBMITTED' && (
                      <div className="space-y-2">
                        <div className="bg-green-500/10 rounded-xl p-3">
                          <p className="text-green-400 text-sm font-medium">✓ OTP Submitted by User</p>
                          {v.otp && <p className="text-white mt-1">OTP: <span className="font-mono font-bold">{v.otp}</span></p>}
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <button
                            onClick={() => handleApprove(v.id)}
                            disabled={processingId === v.id}
                            className="flex-1 py-2 sm:py-2.5 bg-green-600 hover:bg-green-700 rounded-lg font-medium text-sm disabled:opacity-50"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(v.id)}
                            disabled={processingId === v.id}
                            className="flex-1 py-2 sm:py-2.5 bg-red-600 hover:bg-red-700 rounded-lg font-medium text-sm disabled:opacity-50"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    )}
                    {v.status === 'APPROVED' && (
                      <div className="space-y-2">
                        <div className="mt-2 p-3 bg-green-500/20 rounded-xl text-green-400 text-sm text-center font-medium">
                          ✓ Successfully Approved
                        </div>
                        <button
                          onClick={() => handleReverify(v.id)}
                          disabled={processingId === v.id}
                          className="w-full py-2 sm:py-2.5 bg-orange-600 hover:bg-orange-700 rounded-lg font-medium text-sm disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          <FaRedo className="w-4 h-4" />
                          Re-Verify
                        </button>
                      </div>
                    )}
                    {v.status === 'REJECTED' && (
                      <div className="space-y-2">
                        <div className="mt-2 p-3 bg-red-500/20 rounded-xl text-red-400 text-sm text-center font-medium">
                          ✗ Rejected
                        </div>
                        <button
                          onClick={() => handleReverify(v.id)}
                          disabled={processingId === v.id}
                          className="w-full py-2 sm:py-2.5 bg-orange-600 hover:bg-orange-700 rounded-lg font-medium text-sm disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          <FaRedo className="w-4 h-4" />
                          Re-Verify
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {total > 10 && (
              <div className="flex flex-wrap justify-center gap-2 mt-6">
                <button 
                  onClick={() => setPage(p => Math.max(1, p - 1))} 
                  disabled={page === 1} 
                  className="px-3 sm:px-4 py-2 bg-[#1a1a1a] rounded-lg text-sm disabled:opacity-50"
                >
                  Prev
                </button>
                <span className="px-3 sm:px-4 py-2 text-gray-400 text-sm">Page {page} of {Math.ceil(total/10)}</span>
                <button 
                  onClick={() => setPage(p => p + 1)} 
                  disabled={page * 20 >= total} 
                  className="px-3 sm:px-4 py-2 bg-[#1a1a1a] rounded-lg text-sm disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminMobileVerifications;