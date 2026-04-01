import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { depositAPI, publicAPI, uploadToCloudinary, adminAPI } from '../../services/api';
import BottomNav from '../../components/BottomNav';
import RequestStatusModal from '../../components/RequestStatusModal';

const Deposit = () => {
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('');
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [depositsLoading, setDepositsLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [screenshot, setScreenshot] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState(null);
  const [txid, setTxid] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [cryptoAddresses, setCryptoAddresses] = useState([]);
  const [pendingRequest, setPendingRequest] = useState(null);
  const [usdtRate, setUsdtRate] = useState(0);
  const [usdtCommission, setUsdtCommission] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    depositAPI.getHistory().then((history) => {
      setDeposits(history?.data || history || []);
      setDepositsLoading(false);
    }).catch(console.error);
    
    publicAPI.getCryptoAddresses().then((res) => {
      const addresses = (res?.data || []).filter(a => a.isActive || a.isactive);
      setCryptoAddresses(addresses);
      if (addresses.length > 0) {
        setMethod(addresses[0].id);
      }
    }).catch(console.error);
    
    adminAPI.getSettings().then((res) => {
      const settings = res?.data || res || {};
      setUsdtRate(parseFloat(settings.usdtrate) || 0);
      setUsdtCommission(parseFloat(settings.usdtcommissionpercent) || 0);
    }).catch(console.error);

    const interval = setInterval(() => {
      depositAPI.getHistory().then((history) => {
        setDeposits(history?.data || history || []);
      }).catch(console.error);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleScreenshotChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      setMessage('Please upload an image file');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      setMessage('Image size must be less than 5MB');
      return;
    }
    
    setScreenshot(file);
    setScreenshotPreview(URL.createObjectURL(file));
    setUploadingImage(true);
    setMessage('');
    
    try {
      const url = await uploadToCloudinary(file);
      setScreenshot(url);
      setMessage('');
    } catch (err) {
      console.error('Upload error:', err);
      setMessage(err.message || 'Failed to upload screenshot. Please try again.');
      setScreenshot(null);
      setScreenshotPreview(null);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
      setMessage('Please enter a valid amount');
      return;
    }
    
    if (!screenshot) {
      setMessage('Please upload payment screenshot');
      return;
    }
    if (!txid.trim()) {
      setMessage('Please enter Transaction ID');
      return;
    }
    
    setLoading(true);
    setMessage('');
    try {
      if (!method) {
        setMessage('Please select a payment method');
        setLoading(false);
        return;
      }
      const depositData = { 
        amount: parseFloat(amount), 
        method,
        screenshot,
        txid: txid.trim()
      };
      console.log('Submitting deposit:', depositData);
      const res = await depositAPI.create(depositData);
      const newDeposit = res.data || res;
      setPendingRequest({ id: newDeposit.id, type: 'DEPOSIT', title: 'Deposit Request' });
      setAmount('');
      setScreenshot(null);
      setScreenshotPreview(null);
      setTxid('');
      const historyRes = await depositAPI.getHistory();
      setDeposits(historyRes?.data || historyRes || []);
    } catch (err) { 
      console.error('Deposit error:', err);
      setMessage(err.response?.data?.error || err.message || 'Failed to submit deposit'); 
    }
    finally { setLoading(false); }
  };

  const menuItems = [
    { icon: 'M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z', label: 'Home', path: '/home' },
    { icon: 'M3 10h18M5 10l7-7 7 7M13 21l7-7 7 7', label: 'Buy', path: '/buy' },
    { icon: 'M19 14l-7 7m0 0l-7-7m7 7V3', label: 'Sell', path: '/sell' },
    { icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z', label: 'Account', path: '/manage-account' },
    { icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z', label: 'Team', path: '/team' },
    { icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z', label: 'Profile', path: '/profile' }
  ];

  const _currentIndex = 3;

  return (
    <div className="min-h-screen bg-[#0a0a0a] pb-24 lg:pb-8 font-['Ubuntu',sans-serif]">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/80 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <div className={`fixed top-0 left-0 h-full w-80 bg-[#0d0d0d] z-50 transform transition-transform duration-300 lg:hidden ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-5 border-b border-[#2a2a2a]">
          <div className="flex items-center justify-between">
            <div>
              <img src="/jexpaylogo.png" alt="Jex Pay" className="h-10 sm:h-12 object-contain" />
            </div>
            <button onClick={() => setSidebarOpen(false)} className="p-2 rounded-xl bg-[#1a1a1a] hover:bg-[#252525] transition-colors">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        <div className="p-4 space-y-2">
          {menuItems.map((item, index) => (
            <button key={index} onClick={() => { navigate(item.path); setSidebarOpen(false); }} className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl bg-[#1a1a1a]/50 hover:bg-[#D4AF37]/10 text-left transition-all group">
              <div className="w-10 h-10 rounded-xl bg-[#1a1a1a] group-hover:bg-[#D4AF37]/20 flex items-center justify-center transition-colors">
                <svg className="w-5 h-5 text-[#D4AF37]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                </svg>
              </div>
              <span className="text-white font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="sticky top-0 z-30 bg-[#0d0d0d]/80 backdrop-blur-2xl border-b border-[#1a1a1a]">
        <div className="flex items-center justify-between px-5 py-4">
          <button onClick={() => setSidebarOpen(true)} className="p-3 rounded-2xl bg-[#1a1a1a] hover:bg-[#252525] transition-colors">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="text-xl font-bold text-white">Deposit</h1>
          <div className="w-12"></div>
        </div>
      </div>

      <div className="p-5 space-y-5 max-w-2xl mx-auto">
        <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] rounded-3xl p-6 border border-[#2a2a2a]">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-green-500/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white">Request Deposit</h3>
          </div>
          
          {message && (
            <div className={`mb-5 px-5 py-3 rounded-2xl ${message.includes('successfully') ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
              {message}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-400 text-sm mb-2">Payment Method</label>
              {cryptoAddresses.length === 0 ? (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-center">
                  <p className="text-red-400 text-sm">No payment methods available. Please contact support.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {cryptoAddresses.map((addr) => (
                    <button
                      key={addr.id}
                      type="button"
                      onClick={() => { setMethod(addr.id); setMessage(''); }}
                      className={`py-3 rounded-xl text-sm font-medium transition-all ${method === addr.id ? 'bg-[#D4AF37] text-black' : 'bg-[#0a0a0a] text-gray-400 border border-[#2a2a2a]'}`}
                    >
                      {addr.coin} ({addr.network})
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-400 text-sm mb-2">
                Amount ({cryptoAddresses.find(a => a.id === method)?.coin || 'USDT'})
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={`Enter ${cryptoAddresses.find(a => a.id === method)?.coin || 'USDT'} amount`}
                className="w-full px-5 py-4 bg-[#0a0a0a] border border-[#2a2a2a] rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37] transition-colors"
                required
              />
              {amount && (() => {
                const inrValue = parseFloat(amount) * usdtRate;
                const commissionAmount = inrValue * (usdtCommission / 100);
                const afterCommission = inrValue + commissionAmount;
                return (
                  <div className="mt-2 space-y-1 bg-[#0a0a0a] p-3 rounded-xl border border-[#2a2a2a]">
                    <p className="text-gray-400 text-xs">Exchange Rate: ₹{usdtRate}/USDT</p>
                    <p className="text-green-400 text-sm font-medium">Total: ₹{inrValue.toFixed(2)} INR</p>
                    {usdtCommission > 0 ? (
                      <>
                        <p className="text-yellow-400 text-xs">Commission ({usdtCommission}%): +₹{commissionAmount.toFixed(2)}</p>
                        <p className="text-white text-sm font-bold">You will get: ₹{afterCommission.toFixed(2)}</p>
                      </>
                    ) : (
                      <p className="text-white text-sm font-bold">You will get: ₹{inrValue.toFixed(2)}</p>
                    )}
                  </div>
                );
              })()}
            </div>

            {method && (
              <div className="mb-4 bg-[#0a0a0a] rounded-2xl p-4 border border-[#D4AF37]/30">
                <p className="text-[#D4AF37] text-sm font-semibold mb-3">{cryptoAddresses.find(a => a.id === method)?.coin || 'Crypto'} Deposit Instructions:</p>
                <div className="text-gray-300 text-sm space-y-3">
                  <p>1. Transfer <span className="text-white font-bold">{amount || '0'} {cryptoAddresses.find(a => a.id === method)?.coin || 'USDT'}</span> to this address:</p>
                  <div className="bg-[#1a1a1a] p-3 rounded-xl font-mono text-xs break-all text-[#D4AF37] select-all">
                    {cryptoAddresses.find(a => a.id === method)?.address || 'Loading...'}
                  </div>
                  
                  {/* QR Code */}
                  {cryptoAddresses.find(a => a.id === method)?.address && (
                    <div className="mt-4 flex flex-col items-center">
                      <p className="text-gray-400 text-xs mb-2">Scan to Pay</p>
                      <div className="bg-white p-3 rounded-xl">
                        <img 
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(cryptoAddresses.find(a => a.id === method)?.address)}`}
                          alt="QR Code"
                          className="w-32 h-32"
                        />
                      </div>
                    </div>
                  )}
                  
                  <p>2. Upload screenshot of your transfer</p>
                  <p>3. Enter TX ID from your wallet</p>
                </div>
              </div>
            )}

            <div className="mb-4">
              <label className="block text-gray-400 text-sm mb-2">Payment Screenshot {screenshot && <span className="text-green-400">(Uploaded)</span>}</label>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleScreenshotChange}
                  className="hidden"
                  id="screenshot-upload"
                />
                <label 
                  htmlFor="screenshot-upload"
                  className={`flex flex-col items-center justify-center w-full h-32 bg-[#0a0a0a] border-2 border-dashed rounded-2xl cursor-pointer transition-colors ${screenshot ? 'border-green-500/50' : 'border-[#2a2a2a] hover:border-[#D4AF37]'}`}
                >
                  {screenshotPreview ? (
                    <img src={screenshotPreview} alt="Preview" className="h-full w-auto object-contain rounded-xl" />
                  ) : uploadingImage ? (
                    <div className="text-center">
                      <div className="w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                      <p className="text-gray-400 text-sm">Uploading...</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <svg className="w-8 h-8 text-gray-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-gray-500 text-sm">Click to upload screenshot</p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-gray-400 text-sm mb-2">Transaction ID / UTR Number</label>
              <input
                type="text"
                value={txid}
                onChange={(e) => setTxid(e.target.value)}
                placeholder="Enter TX ID from wallet"
                className="w-full px-5 py-4 bg-[#0a0a0a] border border-[#2a2a2a] rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37] transition-colors font-mono text-sm"
              />
            </div>
            
            <button 
              type="submit" 
              disabled={loading || uploadingImage}
              className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-2xl shadow-lg shadow-green-500/20 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : 'Submit Deposit Request'}
            </button>
          </form>
        </div>
        
        <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] rounded-3xl p-6 border border-[#2a2a2a]">
          <h3 className="text-lg font-bold text-white mb-5">Deposit History</h3>
          {depositsLoading ? (
            <div className="animate-pulse space-y-3">
              {[1,2,3].map(i => <div key={i} className="h-16 bg-[#0a0a0a] rounded-2xl"></div>)}
            </div>
          ) : deposits.length === 0 ? (
            <p className="text-gray-500 text-center py-10">No deposits yet</p>
          ) : (
            <div className="space-y-3">
              {deposits.map((deposit) => (
                <div key={deposit.id} className="flex items-center justify-between p-4 bg-[#0a0a0a] rounded-2xl border border-[#1a1a1a]">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${deposit.status === 'APPROVED' ? 'bg-green-500/20 text-green-400' : deposit.status === 'REJECTED' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                      {deposit.status === 'APPROVED' ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : deposit.status === 'REJECTED' ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <p className={`font-semibold ${deposit.method?.toUpperCase().includes('USDT') ? 'text-green-400' : 'text-white'}`}>
                        {deposit.method?.toUpperCase().includes('USDT') ? '$' : '₹'}{parseFloat(deposit.amount).toFixed(2)}
                      </p>
                      <p className="text-gray-500 text-sm">{deposit.method}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-4 py-2 rounded-xl text-sm font-medium ${deposit.status === 'APPROVED' ? 'bg-green-500/20 text-green-400' : deposit.status === 'REJECTED' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                      {deposit.status === 'APPROVED' ? 'SUCCESS' : deposit.status === 'REJECTED' ? 'FAILED' : deposit.status}
                    </span>
                    <p className="text-gray-500 text-sm mt-1">{deposit.createdat ? new Date(deposit.createdat).toLocaleDateString() : 'N/A'}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <BottomNav />

      <RequestStatusModal 
        isOpen={!!pendingRequest}
        onClose={() => setPendingRequest(null)}
        type={pendingRequest?.type}
        requestId={pendingRequest?.id}
        title={pendingRequest?.title}
      />
    </div>
  );
};

export default Deposit;
