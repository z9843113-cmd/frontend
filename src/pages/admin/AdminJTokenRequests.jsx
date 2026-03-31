import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI, uploadToCloudinary } from '../../services/api';
import { useAuthStore } from '../../store';
import AdminNotificationBell from '../../components/AdminNotificationBell';

const FILTERS = ['', 'WAITING_ADMIN', 'READY_TO_PAY', 'PAYMENT_STARTED', 'PAYMENT_SUBMITTED', 'APPROVED', 'REJECTED', 'CANCELLED', 'EXPIRED'];

const AdminJTokenRequests = () => {
  const [requests, setRequests] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState('');
  const [selected, setSelected] = useState(null);
  const [paymentUpi, setPaymentUpi] = useState('');
  const [adminNote, setAdminNote] = useState('');
  const [qrImage, setQrImage] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [bankDetails, setBankDetails] = useState({ bankName: '', accountNumber: '', ifscCode: '', payeeName: '' });
  const [uploadingQr, setUploadingQr] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { logout } = useAuthStore();
  const navigate = useNavigate();

  const menuItems = [
    { label: 'Home', path: '/admin/dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v-6a1 1 0 00-1-1h-3m-9 16v2a1 1 0 001 1h2' },
    { label: 'J Token', path: '/admin/jtoken', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    { label: 'Requests', path: '/admin/jtoken-requests', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
    { label: 'History', path: '/admin/jtoken-history', icon: 'M4 6h16M4 12h16M4 18h10' },
    { label: 'Settings', path: '/admin/settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' }
  ];

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getJTokenPurchases({ page, limit: 20, status });
      const data = res?.data || res;
      setRequests(data?.purchases || []);
      setTotalPages(data?.totalPages || 1);
    } catch (error) {
      console.error('Failed to fetch J Token requests', error);
    } finally {
      setLoading(false);
    }
  }, [page, status]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchRequests();
    }, 8000);

    return () => clearInterval(intervalId);
  }, [fetchRequests]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleAssign = async () => {
    if (!selected?.id) return;
    if (paymentMethod === 'UPI' && !paymentUpi.trim() && !qrImage) {
      alert('Please enter UPI ID or upload QR image');
      return;
    }
    if (paymentMethod === 'BANK') {
      if (!bankDetails.bankName || !bankDetails.accountNumber || !bankDetails.ifscCode || !bankDetails.payeeName) {
        alert('Please fill all bank details');
        return;
      }
    }
    setProcessingId(selected.id);
    try {
      await adminAPI.assignJTokenPurchase(selected.id, { 
        paymentUpi: paymentUpi.trim(), 
        qrImage, 
        adminNote: adminNote.trim(),
        bankDetails: paymentMethod === 'BANK' ? bankDetails : null
      });
      setSelected(null);
      setPaymentUpi('');
      setAdminNote('');
      setQrImage('');
      setBankDetails({ bankName: '', accountNumber: '', ifscCode: '', payeeName: '' });
      fetchRequests();
    } catch (error) {
      alert(error?.message || 'Failed to assign details');
    } finally {
      setProcessingId('');
    }
  };

  const handleApprove = async (purchaseId) => {
    setProcessingId(purchaseId);
    try {
      await adminAPI.approveJTokenPurchase(purchaseId);
      fetchRequests();
    } catch (error) {
      alert(error?.message || 'Failed to approve request');
    } finally {
      setProcessingId('');
    }
  };

  const handleReject = async (purchaseId) => {
    const note = window.prompt('Reason for rejection', 'Rejected by admin');
    if (note === null) return;
    setProcessingId(purchaseId);
    try {
      await adminAPI.rejectJTokenPurchase(purchaseId, { note });
      fetchRequests();
    } catch (error) {
      alert(error?.message || 'Failed to reject request');
    } finally {
      setProcessingId('');
    }
  };

  const handleQrUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingQr(true);
    try {
      const uploaded = await uploadToCloudinary(file);
      setQrImage(uploaded);
    } catch (error) {
      alert(error?.message || 'Failed to upload QR');
    } finally {
      setUploadingQr(false);
    }
  };

  const handleOpenUserDetails = async (userId) => {
    try {
      const res = await adminAPI.getUserDetails(userId);
      const data = res?.data || res;
      setUserDetails(data);
      setShowUserDetails(true);
    } catch (error) {
      alert(error?.message || 'Failed to load user details');
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleString();
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] pb-24 font-['Ubuntu',sans-serif]">
      {showUserDetails && userDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4" onClick={() => setShowUserDetails(false)}>
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-[#D4AF37]/30 bg-[#0d0d0d] p-6" onClick={(e) => e.stopPropagation()}>
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">User Details</h3>
              <button onClick={() => setShowUserDetails(false)} className="rounded-xl bg-[#1a1a1a] p-2 text-white">X</button>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border border-[#242424] bg-[#111] p-4">
                <h4 className="mb-3 font-semibold text-[#D4AF37]">Basic Info</h4>
                <div className="grid gap-3 sm:grid-cols-2 text-sm">
                  <div><span className="text-gray-500">Email:</span> <span className="text-white break-all">{userDetails.user?.email || 'N/A'}</span></div>
                  <div><span className="text-gray-500">Name:</span> <span className="text-white">{userDetails.user?.name || 'N/A'}</span></div>
                  <div><span className="text-gray-500">Mobile:</span> <span className="text-white">{userDetails.user?.mobile || 'N/A'}</span></div>
                  <div><span className="text-gray-500">Telegram Name:</span> <span className="text-white">{userDetails.user?.telegramname || 'N/A'}</span></div>
                  <div><span className="text-gray-500">Telegram Username:</span> <span className="text-white">@{userDetails.user?.telegramusername || 'N/A'}</span></div>
                  <div><span className="text-gray-500">Telegram Chat ID:</span> <span className="text-white font-mono text-xs">{userDetails.user?.telegramchatid || 'N/A'}</span></div>
                  <div><span className="text-gray-500">Referral Code:</span> <span className="text-[#D4AF37]">{userDetails.user?.referralcode || 'N/A'}</span></div>
                  <div className={userDetails.paymentEnabled ? 'text-green-400' : 'text-red-400'}>
                    {userDetails.paymentEnabled ? '✓ Can receive payment' : '✕ Cannot receive payment'}
                  </div>
                  <div><span className="text-gray-500">Joined:</span> <span className="text-white">{formatDate(userDetails.user?.createdat)}</span></div>
                </div>
              </div>

              <div className="rounded-2xl border border-[#242424] bg-[#111] p-4">
                <h4 className="mb-3 font-semibold text-[#D4AF37]">Wallet</h4>
                <div className="grid gap-3 sm:grid-cols-4 text-center text-sm">
                  <div className="rounded-xl bg-[#0b0b0b] p-3"><p className="text-gray-500">INR</p><p className="mt-1 text-white">₹{parseFloat(userDetails.wallet?.inrbalance || 0).toFixed(2)}</p></div>
                  <div className="rounded-xl bg-[#0b0b0b] p-3"><p className="text-gray-500">USDT</p><p className="mt-1 text-white">{parseFloat(userDetails.wallet?.usdtbalance || 0).toFixed(2)}</p></div>
                  <div className="rounded-xl bg-[#0b0b0b] p-3"><p className="text-gray-500">J Token</p><p className="mt-1 text-white">{parseFloat(userDetails.wallet?.tokenbalance || 0).toFixed(2)}</p></div>
                  <div className="rounded-xl bg-[#0b0b0b] p-3"><p className="text-gray-500">Referral</p><p className="mt-1 text-white">₹{parseFloat(userDetails.wallet?.referralbalance || 0).toFixed(2)}</p></div>
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-2xl border border-[#242424] bg-[#111] p-4">
                  <h4 className="mb-3 font-semibold text-[#D4AF37]">UPI Accounts</h4>
                  {userDetails.upiAccounts?.length ? userDetails.upiAccounts.map((upi) => {
                    const appId = upi.appid || '';
                    const upiId = (upi.upiid || '').toLowerCase();
                    let appName = '';
                    if (appId === 'mobikwik' || appId === 'mobiwik' || upiId.includes('mobwik') || upiId.includes('mobiwik')) appName = 'MobiKwik';
                    else if (appId === 'freecharge' || appId === 'freerecharge' || upiId.includes('freerecharge')) appName = 'FreeCharge';
                    else if (appId === 'paytm' || upiId.includes('paytm')) appName = 'Paytm';
                    else if (appId === 'phonepe' || upiId.includes('phonepe')) appName = 'PhonePe';
                    else if (appId === 'google-pay' || upiId.includes('gpay') || upiId.includes('google')) appName = 'Google Pay';
                    else if (appId === 'bhim' || upiId.includes('bhim')) appName = 'BHIM';
                    else if (appId === 'amazon-pay' || upiId.includes('amazon')) appName = 'Amazon Pay';
                    else if (upiId.includes('okaxis')) appName = 'Axis Bank';
                    else if (upiId.includes('yesbank')) appName = 'Yes Bank';
                    else if (upiId.includes('sbi')) appName = 'SBI';
                    else if (upiId.includes('icici')) appName = 'ICICI';
                    else if (upiId.includes('hdfc')) appName = 'HDFC';
                    else appName = 'UPI App';
                    return (
                    <div key={upi.id} className="mb-2 rounded-xl bg-[#0b0b0b] p-3 text-sm last:mb-0">
                      <p className="text-white break-all">{upi.upiid}</p>
                      <p className="mt-1 text-xs text-[#D4AF37]">{appName} {upi.isprimary ? '• Primary' : ''}</p>
                    </div>
                  )}) : <p className="text-sm text-gray-500">No UPI accounts</p>}
                </div>

                <div className="rounded-2xl border border-[#242424] bg-[#111] p-4">
                  <h4 className="mb-3 font-semibold text-[#D4AF37]">Bank Accounts</h4>
                  {userDetails.bankAccounts?.length ? userDetails.bankAccounts.map((bank) => (
                    <div key={bank.id} className="mb-2 rounded-xl bg-[#0b0b0b] p-3 text-sm last:mb-0">
                      <p className="text-white">{bank.bankname || bank.holdername || 'Bank Account'}</p>
                      <p className="mt-1 text-xs text-gray-500">A/C: {bank.accountnumber || 'N/A'}</p>
                      <p className="mt-1 text-xs text-gray-500">IFSC: {bank.ifsc || 'N/A'} {bank.isprimary ? '• Primary' : ''}</p>
                    </div>
                  )) : <p className="text-sm text-gray-500">No bank accounts</p>}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4" onClick={() => { setSelected(null); setPaymentMethod('UPI'); setBankDetails({ bankName: '', accountNumber: '', ifscCode: '', payeeName: '' }); }}>
          <div className="w-full max-w-lg rounded-3xl border border-[#D4AF37]/30 bg-[#0d0d0d] p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">Assign Payment Details</h3>
              <button onClick={() => setSelected(null)} className="rounded-xl bg-[#1a1a1a] p-2 text-white">X</button>
            </div>
            <div className="mt-4 space-y-4">
              <div className="rounded-2xl bg-[#111] p-4 text-sm text-gray-300">
                <p>{selected.email}</p>
                <p className="mt-1 text-[#D4AF37]">₹{parseFloat(selected.amount || 0).toFixed(2)} / {parseFloat(selected.tokenamount || 0).toFixed(2)} J Token</p>
              </div>
              
              {/* Payment Method Selection */}
              <div className="flex gap-3">
                <button
                  onClick={() => setPaymentMethod('UPI')}
                  className={`flex-1 py-3 rounded-xl font-bold border ${
                    paymentMethod === 'UPI' 
                      ? 'bg-[#D4AF37]/20 border-[#D4AF37] text-[#D4AF37]' 
                      : 'bg-[#1a1a1a] border-[#2a2a2a] text-gray-400'
                  }`}
                >
                  UPI
                </button>
                <button
                  onClick={() => setPaymentMethod('BANK')}
                  className={`flex-1 py-3 rounded-xl font-bold border ${
                    paymentMethod === 'BANK' 
                      ? 'bg-[#D4AF37]/20 border-[#D4AF37] text-[#D4AF37]' 
                      : 'bg-[#1a1a1a] border-[#2a2a2a] text-gray-400'
                  }`}
                >
                  Bank Transfer
                </button>
              </div>

              {/* UPI Fields */}
              {paymentMethod === 'UPI' && (
                <>
                  <input value={paymentUpi} onChange={(e) => setPaymentUpi(e.target.value)} placeholder="Enter YOUR UPI ID for payment" className="w-full rounded-2xl border border-[#2a2a2a] bg-[#0a0a0a] px-4 py-4 text-white placeholder-gray-500 focus:border-[#D4AF37] focus:outline-none" />
                  <textarea value={adminNote} onChange={(e) => setAdminNote(e.target.value)} placeholder="Optional note" rows={3} className="w-full rounded-2xl border border-[#2a2a2a] bg-[#0a0a0a] px-4 py-4 text-white placeholder-gray-500 focus:border-[#D4AF37] focus:outline-none" />
                  <label className="block rounded-2xl border border-dashed border-[#2a2a2a] bg-[#0a0a0a] p-4 text-center text-gray-500 cursor-pointer hover:border-[#D4AF37]/50">
                    {qrImage ? <img src={qrImage} alt="QR" className="mx-auto h-48 rounded-2xl object-contain" /> : 'Upload QR Image'}
                    <input type="file" accept="image/*" className="hidden" onChange={handleQrUpload} />
                  </label>
                  {uploadingQr && <p className="text-sm text-[#D4AF37]">Uploading QR...</p>}
                </>
              )}

              {/* Bank Fields */}
              {paymentMethod === 'BANK' && (
                <div className="space-y-3">
                  <input 
                    value={bankDetails.bankName} 
                    onChange={(e) => setBankDetails({...bankDetails, bankName: e.target.value})} 
                    placeholder="Bank Name" 
                    className="w-full rounded-2xl border border-[#2a2a2a] bg-[#0a0a0a] px-4 py-3 text-white placeholder-gray-500 focus:border-[#D4AF37] focus:outline-none" 
                  />
                  <input 
                    value={bankDetails.accountNumber} 
                    onChange={(e) => setBankDetails({...bankDetails, accountNumber: e.target.value})} 
                    placeholder="Account Number" 
                    className="w-full rounded-2xl border border-[#2a2a2a] bg-[#0a0a0a] px-4 py-3 text-white placeholder-gray-500 focus:border-[#D4AF37] focus:outline-none" 
                  />
                  <input 
                    value={bankDetails.ifscCode} 
                    onChange={(e) => setBankDetails({...bankDetails, ifscCode: e.target.value})} 
                    placeholder="IFSC Code" 
                    className="w-full rounded-2xl border border-[#2a2a2a] bg-[#0a0a0a] px-4 py-3 text-white placeholder-gray-500 focus:border-[#D4AF37] focus:outline-none" 
                  />
                  <input 
                    value={bankDetails.payeeName} 
                    onChange={(e) => setBankDetails({...bankDetails, payeeName: e.target.value})} 
                    placeholder="Payee Name" 
                    className="w-full rounded-2xl border border-[#2a2a2a] bg-[#0a0a0a] px-4 py-3 text-white placeholder-gray-500 focus:border-[#D4AF37] focus:outline-none" 
                  />
                </div>
              )}

              <button onClick={handleAssign} disabled={processingId === selected.id || uploadingQr} className="w-full rounded-2xl bg-gradient-to-r from-[#D4AF37] to-[#FFD700] py-4 font-bold text-black disabled:opacity-50">Assign Details</button>
            </div>
          </div>
        </div>
      )}

      {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/80 lg:hidden" onClick={() => setSidebarOpen(false)} />}
      <div className={`fixed top-0 left-0 z-50 h-full w-80 transform bg-[#0d0d0d] transition-transform duration-300 lg:hidden ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="border-b border-[#2a2a2a] p-5"><div className="flex items-center justify-between"><div><h2 className="bg-gradient-to-r from-[#D4AF37] to-[#FFD700] bg-clip-text text-2xl font-bold text-transparent">𝙅𝙀𝙓 𝙋𝘼𝙔</h2><p className="text-xs text-gray-500">J Token Requests</p></div><button onClick={() => setSidebarOpen(false)} className="rounded-xl bg-[#1a1a1a] p-2 text-white">X</button></div></div>
        <div className="space-y-2 p-4">
          {menuItems.map((item) => <button key={item.path} onClick={() => { navigate(item.path); setSidebarOpen(false); }} className={`flex w-full items-center gap-4 rounded-2xl px-5 py-4 text-left ${item.path === '/admin/jtoken-requests' ? 'bg-[#D4AF37]/10' : 'bg-[#1a1a1a]/50'}`}><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1a1a1a] text-[#D4AF37]"><svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} /></svg></div><span className="text-white">{item.label}</span></button>)}
          <button onClick={handleLogout} className="mt-4 flex w-full items-center gap-4 rounded-2xl bg-red-500/10 px-5 py-4 text-left text-red-400"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/20">X</div><span>Logout</span></button>
        </div>
      </div>

      <div className="sticky top-0 z-30 border-b border-[#1a1a1a] bg-[#0d0d0d]/90 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-2 px-3 py-3 sm:px-4 sm:py-4">
          <button onClick={() => setSidebarOpen(true)} className="rounded-xl sm:rounded-2xl bg-[#1a1a1a] p-2.5 sm:p-3 text-white lg:hidden">☰</button>
          <div className="min-w-0 flex-1 text-center lg:text-left"><p className="text-xs uppercase tracking-[0.25em] text-[#D4AF37]">Admin</p><h1 className="truncate text-base sm:text-xl font-bold text-white">Buy J Token Requests</h1></div>
          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            <AdminNotificationBell />
            <button onClick={() => navigate('/admin/jtoken')} className="rounded-xl sm:rounded-2xl bg-[#1a1a1a] px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold text-[#D4AF37]">Manual</button>
            <button onClick={handleLogout} className="rounded-xl sm:rounded-2xl bg-red-500/10 px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold text-red-400 hover:bg-red-500/20">Logout</button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl space-y-5 px-4 py-5">
        <div className="flex flex-wrap gap-3">
          {FILTERS.map((filter) => <button key={filter || 'ALL'} onClick={() => { setStatus(filter); setPage(1); }} className={`rounded-2xl px-4 py-3 text-sm font-semibold ${status === filter ? 'bg-[#D4AF37] text-black' : 'bg-[#171717] text-gray-400'}`}>{filter || 'All'}</button>)}
        </div>

        <div className="space-y-3">
          {loading && <div className="rounded-3xl bg-[#171717] p-8 text-center text-gray-500">Loading requests...</div>}
          {!loading && requests.length === 0 && <div className="rounded-3xl bg-[#171717] p-8 text-center text-gray-500">No requests found.</div>}
          {requests.map((request) => (
            <div key={request.id} className="rounded-3xl border border-[#242424] bg-gradient-to-br from-[#171717] to-[#0d0d0d] p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-white">{request.email}</p>
                  <span className="rounded-full bg-[#D4AF37]/10 px-3 py-1 text-xs font-bold text-[#D4AF37]">{request.status}</span>
                  <button onClick={() => handleOpenUserDetails(request.userid)} className="rounded-full bg-sky-500/10 px-3 py-1 text-xs font-bold text-sky-400">View User</button>
                </div>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    <div className="rounded-2xl bg-[#111] p-3 text-xs">
                      <p className="text-gray-500">User Name</p>
                      <p className="mt-1 text-white">{request.name || 'N/A'}</p>
                    </div>
                    <div className="rounded-2xl bg-[#111] p-3 text-xs">
                      <p className="text-gray-500">Mobile</p>
                      <p className="mt-1 text-white">{request.mobile || 'N/A'}</p>
                    </div>
                    <div className="rounded-2xl bg-[#111] p-3 text-xs">
                      <p className="text-gray-500">Telegram</p>
                      <p className="mt-1 text-white break-all">{request.telegramid || 'Not linked'}</p>
                    </div>
                    <div className="rounded-2xl bg-[#111] p-3 text-xs">
                      <p className="text-gray-500">Referral Code</p>
                      <p className="mt-1 text-[#D4AF37]">{request.referralcode || 'N/A'}</p>
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-gray-500">Method: {request.method} • Created: {request.createdat ? new Date(request.createdat).toLocaleString() : 'N/A'}</p>
                  <p className="mt-1 text-xs text-gray-500">Joined: {request.usercreatedat ? new Date(request.usercreatedat).toLocaleString() : 'N/A'}</p>
                  <p className="mt-2 text-sm text-white">₹{parseFloat(request.amount || 0).toFixed(2)} for {parseFloat(request.tokenamount || 0).toFixed(2)} J Token</p>
                  {request.paymentupi && <p className="mt-2 text-sm text-[#D4AF37]">UPI: {request.paymentupi}</p>}
                  {request.utr && <p className="mt-2 text-sm text-emerald-400">UTR: {request.utr}</p>}
                  {request.adminnote && <p className="mt-2 text-sm text-gray-400">Note: {request.adminnote}</p>}
                  {request.screenshot && <a href={request.screenshot} target="_blank" rel="noreferrer" className="mt-2 inline-block text-sm text-sky-400">View payment screenshot</a>}
                </div>
                <div className="flex flex-wrap gap-3">
                  {request.status === 'WAITING_ADMIN' && <button onClick={() => { 
                    setSelected(request); 
                    setPaymentUpi(''); 
                    setAdminNote(''); 
                    setQrImage(''); 
                  }} className="rounded-2xl bg-gradient-to-r from-[#D4AF37] to-[#FFD700] px-4 py-3 font-bold text-black">Assign Details</button>}
                  {request.status === 'PAYMENT_SUBMITTED' && <button onClick={() => handleApprove(request.id)} disabled={processingId === request.id} className="rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 px-4 py-3 font-bold text-white disabled:opacity-50">Approve</button>}
                  {['WAITING_ADMIN', 'READY_TO_PAY', 'PAYMENT_STARTED', 'PAYMENT_SUBMITTED'].includes(request.status) && <button onClick={() => handleReject(request.id)} disabled={processingId === request.id} className="rounded-2xl bg-red-500/15 px-4 py-3 font-bold text-red-400 disabled:opacity-50">Reject</button>}
                </div>
              </div>
            </div>
          ))}
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

export default AdminJTokenRequests;
