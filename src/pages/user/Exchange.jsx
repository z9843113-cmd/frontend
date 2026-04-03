import { useState, useEffect } from 'react';
import { userAPI, walletAPI, adminAPI } from '../../services/api';
import BottomNav from '../../components/BottomNav';
import RequestStatusModal from '../../components/RequestStatusModal';
import { FaGamepad, FaRandom, FaClock, FaCheck, FaTimes, FaHistory } from 'react-icons/fa';

const Exchange = () => {
  const [wallet, setWallet] = useState(null);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [selectedRate, setSelectedRate] = useState(null);
  const [showTradeModal, setShowTradeModal] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [pendingRequest, setPendingRequest] = useState(null);
  const [showWaitPopup, setShowWaitPopup] = useState(false);
  const [waitMessage, setWaitMessage] = useState('');
  const [usdtRate, setUsdtRate] = useState(0);
  const [usdtCommission, setUsdtCommission] = useState(0);
  const [exchangeRates, setExchangeRates] = useState({ gamingRate: 103, gamingRateMin: 80, mixRate: 108, mixRateMin: 80, minAmount: 100, maxAmount: 50000 });
  const [exchangeHistory, setExchangeHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [wal, settingsRes] = await Promise.all([
          walletAPI.getWallet(),
          adminAPI.getSettings().catch(() => ({}))
        ]);
        setWallet(wal?.data || wal || null);
        const settings = settingsRes?.data || settingsRes || {};
        setUsdtRate(parseFloat(settings.usdtrate) || 0);
        setUsdtCommission(parseFloat(settings.usdtcommissionpercent) || 0);
        setExchangeRates({
          gamingRate: parseFloat(settings.gamingrate) || 103,
          gamingRateMin: parseFloat(settings.gamingratemin) || 80,
          mixRate: parseFloat(settings.mixrate) || 108,
          mixRateMin: parseFloat(settings.mixratemin) || 80,
          minAmount: parseFloat(settings.exchangeminamount) || 100,
          maxAmount: parseFloat(settings.exchangemaxamount) || 50000
        });
      } catch (err) {
        console.error('Failed to fetch wallet', err);
      } finally {
        setLoading(false);
      }
    };

    const fetchHistory = async () => {
      try {
        const res = await userAPI.getMyExchangeRequests();
        const requests = res?.data?.requests || res?.requests || res?.data || [];
        setExchangeHistory(Array.isArray(requests) ? requests : []);
      } catch (err) {
        console.error('Failed to fetch exchange history', err);
        setExchangeHistory([]);
      } finally {
        setHistoryLoading(false);
      }
    };

    fetchData();
    fetchHistory();
    const interval = setInterval(fetchData, 2000);
    const historyInterval = setInterval(fetchHistory, 3000);
    return () => { clearInterval(interval); clearInterval(historyInterval); };
  }, []);

  const showError = (msg) => {
    setErrorMessage(msg);
    setShowErrorPopup(true);
  };

  const handleTrade = async () => {
    if (!selectedRate) {
      showError('Please select an exchange type');
      return;
    }
    const amountNum = parseFloat(amount);
    const usdtBalance = parseFloat(wallet?.usdtbalance || 0);
    const currentMin = selectedRate === 'GAMING' ? exchangeRates.gamingRateMin : exchangeRates.mixRateMin;
    
    if (!amount || amountNum <= 0) {
      showError('Please enter a valid amount');
      return;
    }
    if (amountNum > usdtBalance) {
      showError(`Insufficient USDT balance. You have ${usdtBalance.toFixed(4)} USDT`);
      return;
    }
    if (amountNum < currentMin) {
      showError(`Can't Be Place ${selectedRate === 'GAMING' ? 'Gaming' : 'Mix'} Funds Order Less Than $${currentMin} USDT`);
      return;
    }
    
    setProcessing(true);
    try {
      const res = await userAPI.createExchangeRequest({
        rateType: selectedRate,
        amount: parseFloat(amount),
        upiId: null
      });
      const newRequest = res?.request || res;
      if (newRequest?.id) {
        setShowTradeModal(false);
        setAmount('');
        setSelectedRate(null);
        
        // Show wait popup for 3-4 seconds then auto close
        setShowWaitPopup(true);
        
        setTimeout(() => {
          setShowWaitPopup(false);
        }, 3500);
      }
    } catch (err) {
      showError(err?.message || 'Failed to submit request');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] to-[#151515] flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-[#D4AF37] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] to-[#151515] pb-32 font-['Ubuntu',sans-serif]">
      <div className="sticky top-0 z-30 bg-gradient-to-r from-[#0d0d0d] via-[#1a1a1a] to-[#0d0d0d] backdrop-blur-2xl border-b border-[#D4AF37]/20">
        <div className="max-w-2xl mx-auto flex items-center justify-between px-4 py-3">
          <div>
            <img src="/jexpaylogo.png" alt="Jex Pay" className="h-8 sm:h-10 object-contain" />
            <p className="text-gray-500 text-xs">Exchange</p>
          </div>
          <div className="text-right bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] rounded-xl sm:rounded-2xl px-3 sm:px-4 py-2 border border-[#D4AF37]/20">
            <p className="text-[#D4AF37] font-bold text-sm sm:text-lg">₹{parseFloat(wallet?.inrbalance || 0).toFixed(2)}</p>
            <p className="text-gray-500 text-xs">Balance</p>
          </div>
        </div>
      </div>

      <div className="px-3 sm:px-4 py-4 space-y-4 sm:space-y-5 max-w-2xl mx-auto">
        <div className="bg-gradient-to-br from-[#1a1a1a] via-[#151515] to-[#1a1a1a] rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-[#2a2a2a] shadow-xl shadow-black/50">
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-5">
            <div>
              <h3 className="text-white font-bold text-base sm:text-lg">Choose Exchange Type</h3>
              <p className="text-gray-500 text-xs">Please select any one option before proceeding</p>
            </div>
          </div>
          <div className="space-y-2 sm:space-y-3">
            {[
              { id: 'GAMING', label: 'Gaming funds', rate: exchangeRates.gamingRate, desc: `1 USDT = ₹${exchangeRates.gamingRate} INR` },
              { id: 'MIX', label: 'Mix funds', rate: exchangeRates.mixRate, desc: `1 USDT = ₹${exchangeRates.mixRate} INR` },
            ].map((option) => (
              <button
                key={option.id}
                onClick={() => setSelectedRate(option.id)}
                className={`w-full flex items-center justify-between p-3 sm:p-4 rounded-xl sm:rounded-2xl border transition-all duration-300 ${
                  selectedRate === option.id 
                    ? 'border-[#D4AF37] bg-gradient-to-r from-[#D4AF37]/20 to-[#FFD700]/10 shadow-lg shadow-[#D4AF37]/10' 
                    : 'border-[#2a2a2a] bg-[#0a0a0a] hover:border-[#D4AF37]/30'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center ${selectedRate === option.id ? 'bg-[#D4AF37]/30 text-[#D4AF37]' : 'bg-[#1a1a1a] text-gray-400'}`}>
                    {option.id === 'GAMING' ? <FaGamepad className="w-5 h-5" /> : <FaRandom className="w-5 h-5" />}
                  </div>
                  <div className="text-left">
                    <p className="text-white font-semibold text-sm sm:text-base">{option.label}</p>
                    <p className="text-[#D4AF37] font-bold text-sm sm:text-lg">₹{option.rate} INR</p>
                  </div>
                </div>
                {selectedRate === option.id && (
                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#D4AF37] flex items-center justify-center">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => {
            const usdtBalance = parseFloat(wallet?.usdtbalance || 0);
            if (usdtBalance <= 0) {
              showError('Insufficient USDT balance. Please deposit USDT first.');
              return;
            }
            setShowTradeModal(true);
          }}
          disabled={!selectedRate}
          className="w-full py-4 sm:py-5 bg-gradient-to-r from-[#D4AF37] via-[#FFD700] to-[#D4AF37] hover:from-[#E5C158] hover:via-[#FFE44D] hover:to-[#E5C158] text-black font-bold rounded-xl sm:rounded-2xl text-base sm:text-lg shadow-lg shadow-[#D4AF37]/30 transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
          SELL USDT
        </button>

        {showTradeModal && (
          <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-3 sm:p-4">
            <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] w-full max-w-md rounded-2xl sm:rounded-3xl p-4 sm:p-6 max-h-[85vh] overflow-y-auto border border-[#D4AF37]/30 shadow-2xl shadow-black/50">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-white">SELL USDT</h3>
                  <p className="text-gray-500 text-xs sm:text-sm">Rate: ₹{selectedRate === 'GAMING' ? exchangeRates.gamingRate : selectedRate === 'MIX' ? exchangeRates.mixRate : usdtRate}/USDT</p>
                </div>
                <button onClick={() => setShowTradeModal(false)} className="p-2 sm:p-3 rounded-xl bg-[#1a1a1a] hover:bg-[#252525] transition-colors">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-gray-400 text-xs sm:text-sm mb-1 sm:mb-2 font-medium">Amount (USDT)</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder={`Min: $${selectedRate === 'GAMING' ? exchangeRates.gamingRateMin : selectedRate === 'MIX' ? exchangeRates.mixRateMin : exchangeRates.minAmount}`}
                    className="w-full bg-gradient-to-br from-[#0a0a0a] to-[#151515] border border-[#2a2a2a] rounded-xl sm:rounded-2xl px-3 sm:px-4 py-3 sm:py-4 text-white placeholder-gray-600 focus:border-[#D4AF37] focus:outline-none text-base sm:text-lg font-medium"
                  />
                  <p className="text-gray-500 text-xs mt-1">Min: ${selectedRate === 'GAMING' ? exchangeRates.gamingRateMin : selectedRate === 'MIX' ? exchangeRates.mixRateMin : exchangeRates.minAmount} USDT</p>
                </div>

                {amount && (() => {
                  const usdtAmount = parseFloat(amount);
                  const selectedRateValue = selectedRate === 'GAMING' ? exchangeRates.gamingRate : selectedRate === 'MIX' ? exchangeRates.mixRate : usdtRate;
                  const inrValue = usdtAmount * selectedRateValue;
                  const commissionAmount = inrValue * (usdtCommission / 100);
                  const afterCommission = inrValue + commissionAmount;
                  return (
                    <div className="p-3 sm:p-5 border border-green-500/30 bg-gradient-to-r from-green-500/20 to-emerald-500/10 rounded-xl sm:rounded-2xl">
                      <p className="text-gray-400 text-xs sm:text-sm">Rate: ₹{selectedRateValue}/USDT</p>
                      <p className="text-green-400 text-sm font-medium mt-1">Total: ₹{inrValue.toFixed(2)} INR</p>
                      {usdtCommission > 0 ? (
                        <>
                          <p className="text-yellow-400 text-xs mt-1">Commission ({usdtCommission}%): +₹{commissionAmount.toFixed(2)}</p>
                          <p className="font-bold text-lg sm:text-xl mt-1 sm:mt-2 text-white">
                            You will get: ₹{afterCommission.toFixed(2)}
                          </p>
                        </>
                      ) : (
                        <p className="font-bold text-lg sm:text-xl mt-1 sm:mt-2 text-white">
                          You will get: ₹{inrValue.toFixed(2)}
                        </p>
                      )}
                    </div>
                  );
                })()}

                <button
                  onClick={handleTrade}
                  disabled={processing || !amount}
                  className="w-full py-4 sm:py-5 bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 text-white font-bold rounded-xl sm:rounded-2xl text-base sm:text-lg shadow-lg shadow-red-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                >
                  {processing ? 'Processing...' : 'Submit Request'}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="bg-gradient-to-br from-[#1a1a1a] via-[#151515] to-[#1a1a1a] rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-[#2a2a2a] shadow-xl">
          <div className="flex items-center gap-2 mb-4">
            <FaHistory className="text-[#D4AF37]" />
            <h3 className="text-white font-bold text-base sm:text-lg">My Exchange History</h3>
          </div>
          
          {historyLoading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => <div key={i} className="h-16 bg-[#0a0a0a] rounded-xl animate-pulse"></div>)}
            </div>
          ) : exchangeHistory.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No exchange history</p>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {exchangeHistory.slice(0, 10).map((req) => (
                <div key={req.id} className="p-3 bg-[#0a0a0a] rounded-xl flex justify-between items-center">
                  <div>
                    <p className="text-[#D4AF37] font-bold text-sm">${parseFloat(req.amount || 0).toFixed(2)} USDT</p>
                    <p className="text-gray-500 text-xs">{req.ratetype} @ ₹{req.rate}</p>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium ${req.status === 'APPROVED' ? 'bg-green-500/20 text-green-400' : req.status === 'REJECTED' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}`}>{req.status === 'APPROVED' ? 'SUCCESS' : req.status}</span>
                    <p className="text-gray-500 text-xs mt-1">₹{(parseFloat(req.amount || 0) * parseFloat(req.rate || 0)).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showSuccessPopup && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] border border-[#D4AF37]/30 rounded-2xl sm:rounded-3xl p-5 sm:p-8 w-full max-w-sm mx-4 text-center shadow-2xl shadow-[#D4AF37]/10">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-green-500/30 to-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 border border-green-500/30">
              <FaClock className="w-10 h-10 sm:w-12 sm:h-12 text-yellow-400" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] bg-clip-text text-transparent mb-2 sm:mb-3">Waiting...</h3>
            <p className="text-gray-400 mb-3 sm:mb-4 text-sm sm:text-base">{successMessage}</p>
            <button onClick={() => setShowSuccessPopup(false)} className="w-full py-3 sm:py-4 bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black font-bold rounded-xl sm:rounded-2xl text-base sm:text-lg hover:opacity-90 transition-opacity">
              OK
            </button>
          </div>
        </div>
      )}

      {showErrorPopup && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] border-red-500/30 rounded-2xl sm:rounded-3xl p-5 sm:p-8 w-full max-w-sm mx-4 text-center shadow-2xl shadow-red-500/10">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-red-500/30 to-red-600/20 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 border border-red-500/30">
              <FaTimes className="w-10 h-10 sm:w-12 sm:h-12 text-red-400" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2 sm:mb-3">Error</h3>
            <p className="text-gray-400 mb-4 sm:mb-6 text-sm sm:text-base">{errorMessage}</p>
            <button onClick={() => setShowErrorPopup(false)} className="w-full py-3 sm:py-4 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold rounded-xl sm:rounded-2xl text-base sm:text-lg hover:opacity-90 transition-opacity">
              Try Again
            </button>
          </div>
        </div>
      )}

      {showWaitPopup && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] border border-[#D4AF37]/30 rounded-2xl sm:rounded-3xl p-5 sm:p-8 w-full max-w-sm mx-4 text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#D4AF37]/20 flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin"></div>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">Request Submitted</h3>
            <p className="text-gray-400 text-sm">Processing your request... Please wait.</p>
          </div>
        </div>
      )}

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

export default Exchange;