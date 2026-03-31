import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../../components/BottomNav';
import RequestStatusModal from '../../components/RequestStatusModal';
import { jTokenPurchaseAPI, walletAPI, uploadToCloudinary, publicAPI, userAPI } from '../../services/api';
import { FaArrowLeft, FaClock, FaCoins, FaCopy, FaCreditCard, FaUniversity, FaCheck, FaTimes } from 'react-icons/fa';

const BuyJToken = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [amount, setAmount] = useState('');
  const [request, setRequest] = useState(null);
  const [history, setHistory] = useState([]);
  const [showActivePopup, setShowActivePopup] = useState(false);
  const [wallet, setWallet] = useState(null);
  const [message, setMessage] = useState('');
  const [showWaitPopup, setShowWaitPopup] = useState(false);
  const [showPaymentPopup, setShowPaymentPopup] = useState(false);
  const [utr, setUtr] = useState('');
  const [screenshot, setScreenshot] = useState('');
  const [screenshotPreview, setScreenshotPreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState('');
  const [upiApps, setUpiApps] = useState([]);
  const [pendingRequest, setPendingRequest] = useState(null);
  const [primaryUpi, setPrimaryUpi] = useState(null);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copied!');
  };

  const generateOrderNumber = () => {
    const now = new Date();
    const dateStr = now.toISOString().slice(0,10).replace(/-/g,'');
    const random = Math.floor(Math.random() * 10000000000).toString().padStart(10, '0');
    return `A${dateStr}${random}`;
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const walletRes = await walletAPI.getWallet().catch(() => null);
        const requestsRes = await jTokenPurchaseAPI.getMyRequests().catch(() => ({ data: { purchases: [] } }));
        const upiRes = await publicAPI.getUpiApps().catch(() => []);
        const userUpiRes = await userAPI.getUpiAccounts().catch(() => []);
        
        setWallet(walletRes?.data || walletRes || null);
        const allRequests = requestsRes?.data?.purchases || requestsRes?.purchases || requestsRes?.data || requestsRes || [];
        setHistory(allRequests);
        const req = allRequests.find(r => !['APPROVED', 'REJECTED', 'CANCELLED', 'EXPIRED'].includes(r.status));
        if (req) setRequest(req);
        else setRequest(null);
        
        const userUpiAccounts = (userUpiRes?.data || userUpiRes || []).filter(
          u => u.status === 'active' || u.status === 'verified'
        );
        const primaryUpi = userUpiAccounts.find(u => u.isprimary === true || u.isprimary === 'true');
        setPrimaryUpi(primaryUpi);
        
        const allApps = upiRes?.data || upiRes || [];
        const jtokenApps = allApps.filter(app => 
          app.isforjtoken === true || app.isforjtoken === 'true' ||
          app.isForJToken === true || app.isForJToken === 'true'
        );
        setUpiApps(jtokenApps);
        
        if (jtokenApps.length > 0 && !selectedMethod) {
          if (primaryUpi) {
            const primaryUpiId = (primaryUpi.upiid || primaryUpi.upiId || '').toLowerCase();
            const matchedApp = jtokenApps.find(app => {
              const appId = (app.id || '').toLowerCase();
              if (appId === 'mobikwik' || appId === 'mobiwik') {
                return primaryUpiId.includes('mobwik') || primaryUpiId.includes('mobiwik');
              }
              if (appId === 'freecharge' || appId === 'freerecharge') {
                return primaryUpiId.includes('freerecharge');
              }
              return false;
            });
            if (matchedApp) setSelectedMethod(matchedApp.id);
          }
        }
      } catch (err) {
        console.error('Load error:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => { 
    const interval = setInterval(() => {
      try {
        walletAPI.getWallet().then(res => setWallet(res?.data || res || null));
        jTokenPurchaseAPI.getMyRequests().then(res => {
          const allRequests = res?.data?.purchases || res?.purchases || res?.data || res || [];
          setHistory(allRequests);
          const req = allRequests.find(r => !['APPROVED', 'REJECTED', 'CANCELLED', 'EXPIRED'].includes(r.status));
          if (req) setRequest(req);
        });
      } catch {}
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (request?.status === 'PAYMENT_STARTED') {
      setShowPaymentPopup(true);
    }
  }, [request?.status]);

  const handleCreate = async () => {
    if (!amount || parseFloat(amount) < 10) {
      setMessage('Minimum amount is ₹10');
      return;
    }
    if (!selectedMethod) {
      setMessage('Please select a payment method');
      return;
    }
    setSubmitting(true);
    try {
      const res = await jTokenPurchaseAPI.create({ amount: parseFloat(amount), method: selectedMethod });
      const newRequest = res?.data?.request || res?.request || res?.data || res;
      setRequest(newRequest);
      setPendingRequest({ id: newRequest.id, type: 'JTOKEN', title: 'J Token Purchase' });
      setMessage('');
    } catch (err) {
      setMessage(err?.message || 'Failed to create request');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStartPay = async () => {
    setSubmitting(true);
    try {
      await jTokenPurchaseAPI.startPay(request.id);
      setRequest({ ...request, status: 'PAYMENT_STARTED' });
    } catch (err) {
      setMessage(err?.message || 'Failed to start payment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm('Cancel this request?')) return;
    setSubmitting(true);
    try {
      await jTokenPurchaseAPI.cancel(request.id);
      setRequest(null);
    } catch (err) {
      setMessage(err?.message || 'Failed to cancel');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitPayment = async () => {
    if (!utr) {
      setMessage('Please enter UTR number');
      return;
    }
    setSubmitting(true);
    try {
      await jTokenPurchaseAPI.submitPayment(request.id, { utr, screenshot });
      setMessage('');
      setShowPaymentPopup(false);
    } catch (err) {
      setMessage(err?.message || 'Failed to submit payment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleScreenshot = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadToCloudinary(file);
      setScreenshot(url);
      setScreenshotPreview(URL.createObjectURL(file));
    } catch (err) {
      setMessage('Failed to upload screenshot');
    } finally {
      setUploading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-GB');
  };

  if (loading) {
    return <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center"><div className="animate-spin w-12 h-12 border-4 border-[#D4AF37] border-t-transparent rounded-full"></div></div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] to-[#151515] pb-24 font-['Ubuntu',sans-serif]">
      <div className="sticky top-0 z-30 bg-gradient-to-r from-[#0d0d0d] via-[#1a1a1a] to-[#0d0d0d] backdrop-blur-2xl border-b border-[#D4AF37]/20">
        <div className="max-w-2xl mx-auto flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="p-2 rounded-xl bg-[#1a1a1a]"><FaArrowLeft className="text-white" /></button>
            <div>
              <img src="/jexpaylogo.png" alt="Jex Pay" className="h-8 sm:h-10 object-contain" />
              <p className="text-gray-500 text-xs">Buy J Token</p>
            </div>
          </div>
          <div className="text-right bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] rounded-xl px-3 py-2 border border-[#D4AF37]/20">
            <p className="text-[#D4AF37] font-bold text-sm">₹{parseFloat(wallet?.tokenbalance || 0).toFixed(2)}</p>
            <p className="text-gray-500 text-xs">J Token</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
        {message && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3">
            <p className="text-red-400 text-sm">{message}</p>
          </div>
        )}

        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4">
          <p className="text-yellow-400 font-bold text-sm mb-2">⚠️ NOTE..</p>
          <p className="text-white text-sm">Cancel the order if the payment details do not match ❗️</p>
          <p className="text-gray-400 text-sm mt-2">अगर पेमेंट डिटेल्स मैच नहीं होती हैं तो ऑर्डर कैंसिल करें ❗️</p>
        </div>

        {request && (
          <div onClick={() => setShowActivePopup(true)} className="bg-gradient-to-r from-[#D4AF37]/20 to-[#FFD700]/10 border border-[#D4AF37]/30 rounded-2xl p-4 cursor-pointer hover:from-[#D4AF37]/30 hover:to-[#FFD700]/20 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-bold">Active Request</p>
                <p className="text-gray-400 text-sm">₹{parseFloat(request.amount || 0).toFixed(2)} • {request.status}</p>
              </div>
              <div className="text-right">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  request.status === 'APPROVED' ? 'bg-green-500/20 text-green-400' :
                  request.status === 'PAYMENT_SUBMITTED' ? 'bg-yellow-500/20 text-yellow-400' :
                  request.status === 'PAYMENT_STARTED' ? 'bg-blue-500/20 text-blue-400' :
                  'bg-gray-500/20 text-gray-400'
                }`}>
                  {request.status}
                </span>
                <p className="text-[#D4AF37] text-xs mt-1">Tap to view →</p>
              </div>
            </div>
          </div>
        )}

        {!request ? (
          <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] rounded-3xl p-6 border border-[#2a2a2a]">
            <h2 className="text-white font-bold text-lg mb-4">Buy J Token</h2>
            
            <div className="mb-4">
              <p className="text-gray-400 text-sm mb-2">Select Payment Method</p>
              {upiApps.length === 0 ? (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3">
                  {primaryUpi ? (
                    <p className="text-red-400 text-sm">JToken payment method not configured. Please contact support.</p>
                  ) : (
                    <p className="text-red-400 text-sm">Please add and verify a Primary UPI first to purchase JToken.</p>
                  )}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {upiApps.map((app) => (
                    <button
                      key={app.id}
                      onClick={() => setSelectedMethod(app.id)}
                      className={`px-4 py-2 rounded-xl font-semibold text-sm ${
                        selectedMethod === app.id
                          ? 'bg-[#D4AF37] text-black'
                          : 'bg-[#0a0a0a] border border-[#2a2a2a] text-gray-400'
                      }`}
                    >
                      {app.name || app.id}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="mb-4">
              <p className="text-gray-400 text-sm mb-2">Enter amount (min ₹10)</p>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#2a2a2a] rounded-2xl text-white placeholder-gray-500 focus:border-[#D4AF37] focus:outline-none"
              />
            </div>

            <button onClick={handleCreate} disabled={submitting || !selectedMethod || !amount} className="w-full py-4 bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black font-bold rounded-2xl disabled:opacity-50">
              {submitting ? 'Creating...' : 'Create Request'}
            </button>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] rounded-3xl p-6 border border-[#2a2a2a]">
            <div className="text-center mb-4">
              <p className="text-white font-bold text-lg">Request Details</p>
              <p className="text-gray-400 text-sm">Order: {request.ordernumber || generateOrderNumber()}</p>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <p className="text-gray-400">Amount</p>
                <p className="text-white font-bold">₹{parseFloat(request.amount || 0).toFixed(2)}</p>
              </div>
              <div className="flex justify-between">
                <p className="text-gray-400">Method</p>
                <p className="text-white">{request.method || selectedMethod}</p>
              </div>
              <div className="flex justify-between">
                <p className="text-gray-400">Status</p>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  request.status === 'APPROVED' ? 'bg-green-500/20 text-green-400' :
                  request.status === 'PAYMENT_SUBMITTED' ? 'bg-yellow-500/20 text-yellow-400' :
                  request.status === 'PAYMENT_STARTED' ? 'bg-blue-500/20 text-blue-400' :
                  'bg-gray-500/20 text-gray-400'
                }`}>
                  {request.status}
                </span>
              </div>
            </div>

            {request.status === 'PAYMENT_STARTED' && (
              <button onClick={handleStartPay} disabled={submitting} className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl font-bold text-white disabled:opacity-50 mt-4">
                {submitting ? 'Loading...' : 'Pay Now'}
              </button>
            )}

            {(request.status === 'WAITING_ADMIN' || request.status === 'READY_TO_PAY') && (
              <button onClick={handleCancel} disabled={submitting} className="w-full py-3 bg-red-500/20 text-red-400 rounded-2xl font-semibold mt-3 disabled:opacity-50">
                Cancel Request
              </button>
            )}
          </div>
        )}

        {history.length > 0 && (
          <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] rounded-3xl p-6 border border-[#2a2a2a]">
            <h3 className="text-white font-bold text-lg mb-4">History</h3>
            <div className="space-y-3">
              {history.slice(0, 5).map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-[#0a0a0a] rounded-xl">
                  <div>
                    <p className="text-white font-medium">₹{parseFloat(item.amount || 0).toFixed(2)}</p>
                    <p className="text-gray-500 text-xs">{formatDate(item.createdat)}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    item.status === 'APPROVED' ? 'bg-green-500/20 text-green-400' :
                    item.status === 'REJECTED' ? 'bg-red-500/20 text-red-400' :
                    item.status === 'CANCELLED' ? 'bg-gray-500/20 text-gray-400' :
                    'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {showActivePopup && request && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowActivePopup(false)}>
          <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] rounded-3xl p-6 border border-[#2a2a2a] w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white font-bold text-lg">Request Details</h3>
              <button onClick={() => setShowActivePopup(false)} className="text-gray-400"><FaTimes /></button>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <p className="text-gray-400">Order</p>
                <p className="text-white font-mono text-sm">{request.ordernumber || 'N/A'}</p>
              </div>
              <div className="flex justify-between">
                <p className="text-gray-400">Amount</p>
                <p className="text-white font-bold">₹{parseFloat(request.amount || 0).toFixed(2)}</p>
              </div>
              <div className="flex justify-between">
                <p className="text-gray-400">Method</p>
                <p className="text-white">{request.method}</p>
              </div>
              <div className="flex justify-between">
                <p className="text-gray-400">Status</p>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  request.status === 'APPROVED' ? 'bg-green-500/20 text-green-400' :
                  request.status === 'PAYMENT_SUBMITTED' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-gray-500/20 text-gray-400'
                }`}>
                  {request.status}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
};

export default BuyJToken;
