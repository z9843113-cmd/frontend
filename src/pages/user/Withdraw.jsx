import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { withdrawalAPI, userAPI, walletAPI } from '../../services/api';
import BottomNav from '../../components/BottomNav';
import RequestStatusModal from '../../components/RequestStatusModal';

const Withdraw = () => {
  const [method, setMethod] = useState('UPI');
  const [amount, setAmount] = useState('');
  const [upiAccounts, setUpiAccounts] = useState([]);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [wallet, setWallet] = useState(null);
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [message, setMessage] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pendingRequest, setPendingRequest] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 2000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    setLoadingData(true);
    try {
      const [upi, bank, wal, withdr] = await Promise.all([
        userAPI.getUpiAccounts(), 
        userAPI.getBankAccounts(), 
        walletAPI.getWallet(), 
        withdrawalAPI.getHistory()
      ]);
      console.log('API Responses:', { upi, bank, wal, withdr });
      
      const upiData = upi?.data || upi || [];
      const bankData = bank?.data || bank || [];
      const walData = wal?.data || wal || {};
      const withdrData = withdr?.data || withdr || [];
      
      console.log('Parsed withdrawal data:', withdrData);
      console.log('UPI accounts:', upiData);
      console.log('Bank accounts:', bankData);
      
      setUpiAccounts(upiData);
      setBankAccounts(bankData);
      setWallet(walData);
      setWithdrawals(withdrData);
      
      const primaryUpi = upiData.find(u => u.isprimary || u.isPrimary);
      const primaryBank = bankData.find(b => b.isprimary || b.isPrimary);
      
      console.log('Primary UPI:', primaryUpi);
      console.log('Primary Bank:', primaryBank);
      
      if (primaryUpi) setSelectedUpi(primaryUpi.id);
      if (primaryBank) setSelectedBank(primaryBank.id);
    } catch (err) {
      console.error('Error fetching withdrawal data:', err);
    } finally {
      setLoadingData(false);
    }
  };

  const [selectedUpi, setSelectedUpi] = useState('');
  const [selectedBank, setSelectedBank] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      console.log('Submitting withdrawal:', { amount, method, selectedUpi, selectedBank });
      const res = await withdrawalAPI.create({ 
        amount: parseFloat(amount), 
        method, 
        upiId: method === 'UPI' ? selectedUpi : undefined, 
        bankAccountId: method === 'BANK' ? selectedBank : undefined 
      });
      console.log('Withdrawal response:', res);
      const newWithdrawal = res?.data || res;
      setPendingRequest({ id: newWithdrawal.id, type: 'WITHDRAWAL', title: 'Withdrawal Request' });
      setAmount('');
      // Refresh wallet
      const wal = await walletAPI.getWallet();
      setWallet(wal?.data || wal || {});
      // Refresh history
      const hist = await withdrawalAPI.getHistory();
      const data = hist?.data || hist || [];
      console.log('Updated history:', data);
      setWithdrawals(data);
    } catch (err) { 
      console.error('Withdrawal error:', err);
      const errMsg = err.response?.data?.error || err.message || 'Failed to submit withdrawal';
      setMessage(errMsg);
    }
    finally { setLoading(false); }
  };

  const primaryUpi = upiAccounts.find(u => u.isprimary || u.isPrimary);
  const primaryBank = bankAccounts.find(b => b.isprimary || b.isPrimary);

  const menuItems = [
    { icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v-6a1 1 0 00-1-1h-3m-9 16v2a1 1 0 001 1h2', label: 'Home', path: '/home' },
    { icon: 'M3 10h18M5 10l7-7 7 7M13 10l7 7-7 7', label: 'Buy', path: '/buy' },
    { icon: 'M19 14l-7 7m0 0l-7-7m7 7V3', label: 'Sell', path: '/sell' },
    { icon: 'M12 4v16m8-8H4', label: 'Account', path: '/deposit' },
    { icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z', label: 'Team', path: '/team' },
    { icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z', label: 'Profile', path: '/profile' },
  ];

  if (loadingData) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] p-5 font-['Ubuntu',sans-serif]">
        <div className="animate-pulse space-y-5">
          <div className="h-12 w-32 bg-[#1a1a1a] rounded-2xl"></div>
          <div className="h-32 bg-[#1a1a1a] rounded-3xl"></div>
          <div className="h-64 bg-[#1a1a1a] rounded-3xl"></div>
        </div>
      </div>
    );
  }

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
          <h1 className="text-xl font-bold text-white">Withdraw</h1>
          <div className="w-12"></div>
        </div>
      </div>

      <div className="p-5 space-y-5 max-w-2xl mx-auto">
        <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] rounded-3xl p-6 border border-[#2a2a2a]">
          <p className="text-gray-400 text-sm mb-2">Available Balance</p>
          <p className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] bg-clip-text text-transparent">₹{(parseFloat(wallet?.inrbalance) || 0).toFixed(2)}</p>
        </div>

        {(!primaryUpi && method === 'UPI') || (!primaryBank && method === 'BANK') ? (
          <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] rounded-3xl p-6 border border-[#2a2a2a]">
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-2xl bg-yellow-500/20 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <p className="text-gray-400">{method === 'UPI' ? 'Please add and set a primary UPI account to withdraw' : 'Please add and set a primary bank account to withdraw'}</p>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] rounded-3xl p-6 border border-[#2a2a2a]">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white">Withdraw Funds</h3>
            </div>
            
            {message && (
              <div className={`mb-5 px-5 py-3 rounded-2xl ${message.includes('successfully') ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                {message}
              </div>
            )}
            
            <div className="flex gap-3 mb-6">
              <button 
                onClick={() => setMethod('UPI')} 
                className={`flex-1 py-4 rounded-2xl font-semibold transition-all ${method === 'UPI' ? 'bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black shadow-lg shadow-[#D4AF37]/20' : 'bg-[#0a0a0a] text-gray-400 border border-[#2a2a2a]'}`}
              >
                UPI
              </button>
              <button 
                onClick={() => setMethod('BANK')} 
                className={`flex-1 py-4 rounded-2xl font-semibold transition-all ${method === 'BANK' ? 'bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black shadow-lg shadow-[#D4AF37]/20' : 'bg-[#0a0a0a] text-gray-400 border border-[#2a2a2a]'}`}
              >
                Bank
              </button>
            </div>
            
            {method === 'UPI' && primaryUpi && (
              <div className="mb-5 p-5 bg-[#0a0a0a] rounded-2xl border border-[#2a2a2a]">
                <p className="text-gray-400 text-sm mb-1">Withdraw to:</p>
                <p className="text-white font-semibold text-lg">{primaryUpi.upiid || primaryUpi.upiId}</p>
              </div>
            )}
            
            {method === 'BANK' && primaryBank && (
              <div className="mb-5 p-5 bg-[#0a0a0a] rounded-2xl border border-[#2a2a2a]">
                <p className="text-gray-400 text-sm mb-1">Withdraw to:</p>
                <p className="text-white font-semibold text-lg">{primaryBank.holdername || primaryBank.holderName}</p>
                <p className="text-gray-500 text-sm">A/C: {primaryBank.accountnumber || primaryBank.accountNumber}</p>
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="mb-5">
                <label className="block text-gray-400 text-sm mb-2">Amount (INR)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="w-full px-5 py-4 bg-[#0a0a0a] border border-[#2a2a2a] rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37] transition-colors"
                  required
                />
              </div>
              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/20 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : 'Withdraw Now'}
              </button>
            </form>
          </div>
        )}

        <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] rounded-3xl p-6 border border-[#2a2a2a]">
          <h3 className="text-lg font-bold text-white mb-5">Withdrawal History</h3>
          {withdrawals.length === 0 ? (
            <p className="text-gray-500 text-center py-10">No withdrawals yet</p>
          ) : (
            <div className="space-y-3">
              {withdrawals.map((w) => (
                <div key={w.id} className="flex items-center justify-between p-4 bg-[#0a0a0a] rounded-2xl border border-[#1a1a1a]">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${w.status === 'APPROVED' ? 'bg-green-500/20 text-green-400' : w.status === 'REJECTED' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-white font-semibold">₹{parseFloat(w.amount).toFixed(2)}</p>
                      <p className="text-gray-500 text-sm">{w.method}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-4 py-2 rounded-xl text-sm font-medium ${w.status === 'APPROVED' ? 'bg-green-500/20 text-green-400' : w.status === 'REJECTED' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                      {w.status}
                    </span>
                    <p className="text-gray-500 text-sm mt-1">{w.createdat ? new Date(w.createdat).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A'}</p>
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

export default Withdraw;
