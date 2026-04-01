import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { walletAPI } from '../../services/api';
import BottomNav from '../../components/BottomNav';

const Wallet = () => {
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tradeAmount, setTradeAmount] = useState('');
  const [tradeType, setTradeType] = useState('USDT_TO_INR');
  const [trading, setTrading] = useState(false);
  const [message, setMessage] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => { fetchWallet(); }, []);

  const fetchWallet = async () => {
    try {
      const { data } = await walletAPI.getWallet();
      setWallet(data);
    } catch { console.error('Failed to fetch wallet'); }
    finally { setLoading(false); }
  };

  const handleTrade = async (e) => {
    e.preventDefault();
    setTrading(true);
    setMessage('');
    try {
      const { data } = await walletAPI.trade({ amount: parseFloat(tradeAmount), type: tradeType });
      setMessage(data.message || 'Trade successful!');
      setTradeAmount('');
      fetchWallet();
    } catch (err) { setMessage(err.response?.data?.error || 'Trade failed'); }
    finally { setTrading(false); }
  };

  const menuItems = [
    { icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v-6a1 1 0 00-1-1h-3m-9 16v2a1 1 0 001 1h2', label: 'Home', path: '/home' },
    { icon: 'M3 10h18M5 10l7-7 7 7M13 10l7 7-7 7', label: 'Exchange', path: '/exchange' },
    { icon: 'M12 4v16m8-8H4', label: 'Deposit', path: '/deposit' },
    { icon: 'M19 14l-7 7m0 0l-7-7m7 7V3', label: 'Withdraw', path: '/withdraw' },
    { icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z', label: 'Team', path: '/team' },
    { icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z', label: 'Profile', path: '/profile' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] p-5 font-['Ubuntu',sans-serif]">
        <div className="animate-pulse space-y-5">
          <div className="h-12 w-32 bg-[#1a1a1a] rounded-2xl"></div>
<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="h-32 bg-[#1a1a1a] rounded-3xl"></div>
            <div className="h-32 bg-[#1a1a1a] rounded-3xl"></div>
            <div className="h-32 bg-[#1a1a1a] rounded-3xl"></div>
          </div>
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
          <h1 className="text-xl font-bold text-white">My Wallet</h1>
          <div className="w-12"></div>
        </div>
      </div>

      <div className="p-5 space-y-5 max-w-2xl mx-auto">
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] rounded-3xl p-5 border border-[#2a2a2a]">
            <p className="text-gray-400 text-sm mb-2">USDT</p>
            <p className="text-xl md:text-2xl font-bold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] bg-clip-text text-transparent">{parseFloat(wallet?.usdtbalance || 0).toFixed(2)}</p>
            <p className="text-gray-500 text-xs mt-2">Rate: ₹{wallet?.usdtrate || 83}</p>
          </div>
          <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] rounded-3xl p-5 border border-[#2a2a2a]">
            <p className="text-gray-400 text-sm mb-2">INR</p>
            <p className="text-xl md:text-2xl font-bold text-white">{parseFloat(wallet?.inrbalance || 0).toFixed(2)}</p>
          </div>
            <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] rounded-3xl p-5 border border-[#2a2a2a]">
              <p className="text-gray-400 text-sm mb-2">J Token Rewards</p>
              <p className="text-xl md:text-2xl font-bold text-white">{parseFloat(wallet?.tokenbalance || 0).toFixed(2)}</p>
              <p className="text-[#D4AF37] text-sm mt-2 font-semibold">₹{(parseFloat(wallet?.tokenbalance || 0) * (wallet?.tokenrate || 0.01)).toFixed(2)} INR</p>
            </div>
        </div>

        <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] rounded-3xl p-6 border border-[#2a2a2a]">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-[#D4AF37]/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-[#D4AF37]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white">Convert Wallet Assets</h3>
          </div>
          
          {message && (
            <div className={`mb-5 px-5 py-3 rounded-2xl ${message.includes('successful') ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
              {message}
            </div>
          )}
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
            <button 
              onClick={() => setTradeType('USDT_TO_INR')} 
              className={`flex-1 py-4 rounded-2xl font-semibold transition-all ${tradeType === 'USDT_TO_INR' ? 'bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black shadow-lg shadow-[#D4AF37]/20' : 'bg-[#1a1a1a] text-gray-400 border border-[#2a2a2a]'}`}
            >
              USDT → INR
            </button>
            <button 
              onClick={() => setTradeType('INR_TO_USDT')} 
              className={`flex-1 py-4 rounded-2xl font-semibold transition-all ${tradeType === 'INR_TO_USDT' ? 'bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black shadow-lg shadow-[#D4AF37]/20' : 'bg-[#1a1a1a] text-gray-400 border border-[#2a2a2a]'}`}
            >
              INR → USDT
            </button>
            <button 
              onClick={() => setTradeType('JTOKEN_TO_INR')} 
              className={`flex-1 py-4 rounded-2xl font-semibold transition-all ${tradeType === 'JTOKEN_TO_INR' ? 'bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black shadow-lg shadow-[#D4AF37]/20' : 'bg-[#1a1a1a] text-gray-400 border border-[#2a2a2a]'}`}
            >
              J Token → INR
            </button>
          </div>
          
          <form onSubmit={handleTrade}>
            <div className="mb-5">
              <label className="block text-gray-400 text-sm mb-2">{tradeType === 'USDT_TO_INR' ? 'USDT Amount' : tradeType === 'INR_TO_USDT' ? 'INR Amount' : 'J Token Amount'}</label>
              <input
                type="number"
                value={tradeAmount}
                onChange={(e) => setTradeAmount(e.target.value)}
                placeholder={`Enter ${tradeType === 'USDT_TO_INR' ? 'USDT' : tradeType === 'INR_TO_USDT' ? 'INR' : 'J Token'} amount`}
                className="w-full px-5 py-4 bg-[#0a0a0a] border border-[#2a2a2a] rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37] transition-colors"
                required
              />
            </div>
            {tradeAmount && (
              <div className="mb-5 p-4 bg-[#0a0a0a] rounded-2xl border border-[#2a2a2a]">
                <p className="text-gray-400 text-sm">You will receive:</p>
                <p className="text-[#D4AF37] font-bold text-xl">
                  {tradeType === 'USDT_TO_INR' 
                    ? `₹${(parseFloat(tradeAmount) * (wallet?.usdtRate || 83)).toFixed(2)}` 
                    : tradeType === 'INR_TO_USDT'
                      ? `${(parseFloat(tradeAmount) / (wallet?.usdtRate || 83)).toFixed(6)} USDT`
                      : `₹${(parseFloat(tradeAmount) * (wallet?.tokenrate || 0.01)).toFixed(2)}`
                  }
                </p>
                {tradeType === 'JTOKEN_TO_INR' && (
                  <p className="text-gray-500 text-xs mt-2">Reward rate: ₹{wallet?.tokenrate || 0.01} per J Token</p>
                )}
              </div>
            )}
            <button 
              type="submit" 
              disabled={trading}
              className="w-full py-4 bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black font-bold rounded-2xl shadow-lg shadow-[#D4AF37]/20 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {trading ? 'Processing...' : 'Trade Now'}
            </button>
          </form>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Wallet;
