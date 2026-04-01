import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../../components/BottomNav';
import { jTokenPurchaseAPI, walletAPI, uploadToCloudinary, userAPI, adminAPI } from '../../services/api';
import { FaArrowLeft, FaCopy, FaTimes } from 'react-icons/fa';

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
  const [selectedUpi, setSelectedUpi] = useState('');
  const [userUpiAccounts, setUserUpiAccounts] = useState([]);
  const [tokenRate, setTokenRate] = useState(1);
  const [jTokenCommission, setJTokenCommission] = useState(0);

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
        const [walletRes, requestsRes, userUpiRes, settingsRes] = await Promise.all([
          walletAPI.getWallet().catch(() => null),
          jTokenPurchaseAPI.getMyRequests().catch(() => ({ data: { purchases: [] } })),
          userAPI.getUpiAccounts().catch(() => []),
          adminAPI.getSettings().catch(() => ({}))
        ]);
        
        setWallet(walletRes?.data || walletRes || null);
        const allRequests = requestsRes?.data?.purchases || requestsRes?.purchases || requestsRes?.data || requestsRes || [];
        setHistory(allRequests);
        const req = allRequests.find(r => !['APPROVED', 'REJECTED', 'CANCELLED', 'EXPIRED'].includes(r.status));
        if (req) setRequest(req);
        else setRequest(null);
        
        setUserUpiAccounts(userUpiRes?.data || userUpiRes || []);
        
        const settings = settingsRes?.data || settingsRes || {};
        setTokenRate(parseFloat(settings.tokenrate) || 1);
        setJTokenCommission(parseFloat(settings.jtokencommissionpercent) || 0);
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
    if (request?.status === 'PAYMENT_STARTED' || request?.status === 'READY_TO_PAY') {
      setShowWaitPopup(false);
      setShowPaymentPopup(true);
    }
  }, [request?.status]);

  const handleCreate = async () => {
    if (!amount || parseFloat(amount) < 10) {
      setMessage('Minimum amount is ₹10');
      return;
    }
    if (!selectedUpi) {
      setMessage('Please select your UPI account');
      return;
    }
    
    const selectedUpiData = userUpiAccounts.find(u => u.id === selectedUpi);
    const appId = selectedUpiData?.appid || selectedUpiData?.appId || selectedUpiData?.appID;
    if (!appId) {
      setMessage('Please select a verified UPI account');
      return;
    }
    
    setSubmitting(true);
    try {
      const res = await jTokenPurchaseAPI.create({ amount: parseFloat(amount), method: appId, upiId: selectedUpi });
      const newRequest = res?.data?.request || res?.request || res?.data || res;
      setRequest(newRequest);
      setShowWaitPopup(true);
      setMessage('');
    } catch (err) {
      setMessage(err?.message || 'Failed to create request');
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
      setShowWaitPopup(false);
    } catch (err) {
      setMessage(err?.message || 'Failed to cancel');
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
            <p className="text-[#D4AF37] font-bold text-sm">₹{parseFloat(wallet?.inrbalance || 0).toFixed(2)}</p>
            <p className="text-gray-500 text-xs">INR Wallet</p>
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
              <p className="text-gray-400 text-sm mb-2">Select Your UPI Account</p>
              {userUpiAccounts.length === 0 ? (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3">
                  <p className="text-red-400 text-sm">Please add and verify a UPI account first.</p>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {userUpiAccounts.map((upi) => (
                    <button
                      key={upi.id}
                      onClick={() => setSelectedUpi(upi.id)}
                      className={`px-4 py-2 rounded-xl font-semibold text-sm ${
                        selectedUpi === upi.id
                          ? 'bg-[#D4AF37] text-black'
                          : 'bg-[#0a0a0a] border border-[#2a2a2a] text-gray-400'
                      }`}
                    >
                      {upi.upiid || upi.upiId} {upi.appName && <span className="text-[#D4AF37] text-xs">({upi.appName})</span>}
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
              {amount && (() => {
                const inrValue = parseFloat(amount);
                const commissionAmount = inrValue * (jTokenCommission / 100);
                const afterCommission = inrValue - commissionAmount;
                const tokens = afterCommission / tokenRate;
                return (
                  <div className="mt-2 space-y-1 bg-[#0a0a0a] p-3 rounded-xl border border-[#2a2a2a]">
                    <p className="text-gray-400 text-xs">Token Rate: ₹{tokenRate}/JToken</p>
                    <p className="text-green-400 text-sm font-medium">Total: ₹{inrValue.toFixed(2)}</p>
                    {jTokenCommission > 0 ? (
                      <>
                        <p className="text-yellow-400 text-xs">Commission ({jTokenCommission}%): -₹{commissionAmount.toFixed(2)}</p>
                        <p className="text-white text-sm font-bold">You will get: ₹{afterCommission.toFixed(2)} = {tokens.toFixed(2)} JToken</p>
                      </>
                    ) : (
                      <p className="text-white text-sm font-bold">You will get: ₹{inrValue.toFixed(2)} = {(inrValue/tokenRate).toFixed(2)} JToken</p>
                    )}
                  </div>
                );
              })()}
            </div>

            <button onClick={handleCreate} disabled={submitting || !selectedUpi || !amount} className="w-full py-4 bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black font-bold rounded-2xl disabled:opacity-50">
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
                <p className="text-white">{request.method}</p>
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

            {(request.status === 'PAYMENT_STARTED' || request.status === 'READY_TO_PAY') && (
              <div className="mt-4">
                <button onClick={() => setShowPaymentPopup(true)} className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl font-bold text-white disabled:opacity-50">
                  {submitting ? 'Loading...' : 'Pay Now'}
                </button>
              </div>
            )}

            {(request.status === 'WAITING_ADMIN' || request.status === 'WAITING_ORDER' || request.status === 'READY_TO_PAY' || request.status === 'PAYMENT_STARTED') && (
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

      {showWaitPopup && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] rounded-3xl p-8 border border-[#2a2a2a] w-full max-w-sm text-center">
            <div className="animate-spin w-16 h-16 border-4 border-[#D4AF37] border-t-transparent rounded-full mx-auto mb-6"></div>
            <h3 className="text-white font-bold text-xl mb-2">Wait for Order</h3>
            <p className="text-gray-400 text-sm">Payment details will be received soon</p>
            <p className="text-gray-500 text-xs mt-4">Please wait while admin assigns payment details...</p>
            <button onClick={() => { setShowWaitPopup(false); setRequest(null); }} className="mt-6 text-gray-500 text-sm hover:text-white">
              Cancel Request
            </button>
          </div>
        </div>
      )}

      {showPaymentPopup && request && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4 pb-20 sm:pb-4">
          <div className="bg-gradient-to-b from-[#1f1f1f] via-[#141414] to-[#0a0a0a] rounded-2xl sm:rounded-3xl p-4 sm:p-6 w-full sm:max-w-md max-h-[85vh] sm:max-h-[90vh] overflow-y-auto shadow-2xl border border-[#333]">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-[#2a2a2a]">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#D4AF37] animate-pulse"></div>
                <h3 className="text-white font-bold text-lg">Payment Details</h3>
              </div>
              <button onClick={() => setShowPaymentPopup(false)} className="text-gray-400 hover:text-white p-1">
                <FaTimes />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-[#D4AF37]/15 via-[#D4AF37]/10 to-transparent rounded-xl p-5 text-center border border-[#D4AF37]/20">
                <p className="text-gray-300 text-sm font-medium mb-1">Amount to Pay</p>
                <p className="text-[#D4AF37] font-bold text-3xl">₹{parseFloat(request.amount || 0).toFixed(2)}</p>
              </div>
              
              {request.paymentupi && (
                <div className="bg-[#0a0a0a] rounded-xl p-4 border border-[#2a2a2a]">
                  <p className="text-gray-400 text-xs mb-2">Pay to this UPI ID</p>
                  <div className="flex items-center justify-between bg-[#141414] rounded-lg p-3">
                    <p className="text-white font-bold text-sm sm:text-lg break-all">{request.paymentupi}</p>
                    <button onClick={() => copyToClipboard(request.paymentupi)} className="ml-2 p-2 bg-[#D4AF37]/20 rounded-lg text-[#D4AF37] hover:bg-[#D4AF37]/30 transition-colors">
                      <FaCopy className="text-sm" />
                    </button>
                  </div>
                </div>
              )}
              
              {request.qrimage && (
                <div className="text-center">
                  <p className="text-gray-400 text-xs sm:text-sm mb-1">Scan QR to Pay</p>
                  <img src={request.qrimage} alt="Payment QR" className="mx-auto h-32 sm:h-48 rounded-xl max-w-full" />
                </div>
              )}
              
              {(request.adminnote || request.bankdetails) && (
                <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] rounded-xl p-4 border border-[#2a2a2a]">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <p className="text-gray-300 text-sm font-semibold">Bank Transfer Details</p>
                  </div>
                  <div className="space-y-2">
                    {(() => {
                      let rawText = request.bankdetails || request.adminnote || '';
                      let fields = [];
                      
                      if (typeof rawText === 'string') {
                        rawText = ' ' + rawText + ' ';
                        
                        const bankMatch = rawText.match(/Bank:\s*(\S+)/i);
                        const accMatch = rawText.match(/Account\s*No\.?:\s*(\S+)/i);
                        const ifscMatch = rawText.match(/IFSC:\s*(\S+)/i);
                        const payeeMatch = rawText.match(/Payee\s*Name:\s*(\S+)/i);
                        
                        console.log('Raw text:', rawText);
                        console.log('Bank:', bankMatch);
                        console.log('Acc:', accMatch);
                        console.log('IFSC:', ifscMatch);
                        console.log('Payee:', payeeMatch);
                        
                        fields = [
                          { label: 'Bank Name', value: bankMatch?.[1] || '' },
                          { label: 'Account No.', value: accMatch?.[1] || '' },
                          { label: 'IFSC Code', value: ifscMatch?.[1] || '' },
                          { label: 'Payee Name', value: payeeMatch?.[1] || '' }
                        ].filter(f => f.value);
                      } else if (rawText && typeof rawText === 'object') {
                        fields = [
                          { label: 'Bank Name', value: rawText.bankName || rawText.bank || '' },
                          { label: 'Account No.', value: rawText.accountNumber || rawText.accountNo || rawText.ac || '' },
                          { label: 'IFSC Code', value: rawText.ifscCode || rawText.ifsc || '' },
                          { label: 'Payee Name', value: rawText.payeeName || rawText.payee || '' }
                        ].filter(f => f.value);
                      }
                      
                      console.log('Fields:', fields);
                      
                      if (fields.length === 0) {
                        return <p className="text-gray-500 text-xs">No bank details available</p>;
                      }
                      
                      return fields.filter(f => f.value).map((field, idx) => (
                        <div key={idx} className="flex justify-between items-center py-2 border-b border-[#2a2a2a] last:border-0">
                          <span className="text-gray-500 text-xs">{field.label}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-white text-sm font-mono">{field.value}</span>
                            <button onClick={() => copyToClipboard(field.value)} className="p-1.5 bg-[#D4AF37]/20 rounded-lg text-[#D4AF37] hover:bg-[#D4AF37]/30">
                              <FaCopy className="text-xs" />
                            </button>
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                </div>
              )}
              
              <div className="border-t border-[#2a2a2a] pt-3 sm:pt-4 mt-3 sm:mt-4">
                <p className="text-white font-semibold text-sm sm:text-base mb-2">Submit Payment Proof</p>
                <input 
                  type="text" 
                  value={utr} 
                  onChange={(e) => setUtr(e.target.value)} 
                  placeholder="Enter UTR / Transaction ID" 
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-[#0a0a0a] border border-[#2a2a2a] rounded-xl text-white placeholder-gray-500 focus:border-[#D4AF37] focus:outline-none text-sm sm:text-base mb-2 sm:mb-3"
                />
                <label className="block rounded-xl border border-dashed border-[#2a2a2a] bg-[#0a0a0a] p-3 sm:p-4 text-center text-gray-500 cursor-pointer hover:border-[#D4AF37]/50 mb-2 sm:mb-3 text-xs sm:text-sm">
                  {screenshotPreview || screenshot ? (
                    <img src={screenshotPreview || screenshot} alt="Screenshot" className="mx-auto h-24 sm:h-32 rounded-lg object-contain max-w-full" />
                  ) : 'Upload Payment Screenshot'}
                  <input type="file" accept="image/*" className="hidden" onChange={handleScreenshot} />
                </label>
                {uploading && <p className="text-sm text-[#D4AF37] text-center">Uploading...</p>}
              </div>
              
              <div className="flex gap-2 sm:gap-3 mt-3 sm:mt-4">
                <button onClick={() => setShowPaymentPopup(false)} className="flex-1 py-2 sm:py-3 bg-gray-600 text-white rounded-xl font-semibold text-sm sm:text-base">
                  Cancel
                </button>
                <button onClick={async () => {
                  if (!utr.trim()) {
                    setMessage('Please enter UTR/Transaction ID');
                    return;
                  }
                  if (!screenshot && !screenshotPreview) {
                    setMessage('Please upload payment screenshot');
                    return;
                  }
                  setSubmitting(true);
                  try {
                    await jTokenPurchaseAPI.submitPayment(request.id, { utr: utr.trim(), screenshot });
                    setMessage('');
                    setShowPaymentPopup(false);
                    setUtr('');
                    setScreenshot('');
                    setScreenshotPreview('');
                  } catch (err) {
                    setMessage(err?.message || 'Failed to submit payment');
                  } finally {
                    setSubmitting(false);
                  }
                }} disabled={submitting} className="flex-1 py-2 sm:py-3 bg-[#D4AF37] text-black rounded-xl font-semibold text-sm sm:text-base disabled:opacity-50">
                  {submitting ? 'Submitting...' : 'I Have Paid'}
                </button>
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
