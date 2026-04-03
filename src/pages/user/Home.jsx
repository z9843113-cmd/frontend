import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store';
import { userAPI, walletAPI, depositAPI, withdrawalAPI, publicAPI, adminAPI } from '../../services/api';
import RewardModal from '../../components/RewardModal';
import BottomNav from '../../components/BottomNav';
import {
  FaArrowCircleDown,
  FaArrowCircleUp,
  FaArrowDown,
  FaArrowUp,
  FaBars,
  FaBell,
  FaBolt,
  FaChartArea,
  FaCoins,
  FaExchangeAlt,
  FaGift,
  FaShieldAlt,
  FaStar,
  FaUsers,
  FaWallet,
  FaToggleOn,
  FaToggleOff,
  FaGamepad,
  FaUniversity,
  FaMoneyBillWave,
  FaRupeeSign
} from 'react-icons/fa';

const Home = () => {
  const navigate = useNavigate();
  const { setUser, user } = useAuthStore();
  const [wallet, setWallet] = useState(null);
  const [recentDeposits, setRecentDeposits] = useState([]);
  const [recentWithdrawals, setRecentWithdrawals] = useState([]);
  const [recentExchanges, setRecentExchanges] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [userStats, setUserStats] = useState({ todayVolume: 0, totalVolume: 0, todayProfit: 0, totalProfit: 0 });
  const [loading, setLoading] = useState(true);
  const [usdtRate, setUsdtRate] = useState(0);
  const [tokenRate, setTokenRate] = useState(0);
  const [usdtCommission, setUsdtCommission] = useState(0);
  const [jTokenCommission, setJTokenCommission] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [showUpiWarning, setShowUpiWarning] = useState(() => {
    return !localStorage.getItem('upiWarningDismissed');
  });
  const [userAccountData, setUserAccountData] = useState({ hasUPI: false, hasBank: false, hasTelegram: false });
  const [rewardSettings, setRewardSettings] = useState({ upiRewardAmount: 20, bankRewardAmount: 20, telegramRewardAmount: 20 });
  const [paymentEnabled, setPaymentEnabled] = useState(true);
  const [togglingPayment, setTogglingPayment] = useState(false);
  const [banner, setBanner] = useState({
    enabled: true,
    title: 'Welcome Bonus',
    subtitle: 'Get 50% extra on first deposit',
    buttonText: 'Claim Now',
    link: '/deposit'
  });
  const [liveActivity, setLiveActivity] = useState([]);

  const generateLiveActivity = () => {
    const names = [
      '+91823***1631', '+91987***4522', '+91700***8891', '+91876***2234',
      '+91956***7789', '+91889***1122', '+91788***4455', '+91987***9900',
      '+91823***5567', '+91654***3344', '+91789***6677', '+91909***1122',
      '+91823***8899', '+91654***4477', '+91700***2233', '+91987***5566',
      '+91876***7788', '+91654***9900', '+91956***1122', '+91789***3344'
    ];
    const actions = ['Bought', 'Deposited', 'Sold', 'Transferred'];
    
    const UsdtIcon = () => (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" fill="#10B981"/>
        <path d="M12 6v12M9 9h2a3 3 0 110 6M9 15h2a3 3 0 110-6" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    );
    
    const types = [
      { name: 'JToken', color: '#D4AF37', icon: <FaCoins /> },
      { name: 'USDT', color: '#10B981', icon: <UsdtIcon /> },
      { name: 'Gaming', color: '#EF4444', icon: <FaGamepad /> },
      { name: 'MIX', color: '#8B5CF6', icon: <FaExchangeAlt /> }
    ];
    
    return Array.from({ length: 8 }, (_, i) => {
      const type = types[Math.floor(Math.random() * types.length)];
      const isINR = type.name !== 'USDT';
      const amount = isINR 
        ? `₹${Math.floor(Math.random() * 25000) + 1000}`
        : `$${Math.floor(Math.random() * 500) + 50}`;
      
      return {
        id: Date.now() + i,
        name: names[Math.floor(Math.random() * names.length)],
        action: actions[Math.floor(Math.random() * actions.length)],
        amount,
        type: type.name,
        color: type.color,
        icon: type.icon,
        time: Math.floor(Math.random() * 59) + 1
      };
    });
  };

  useEffect(() => {
    setLiveActivity(generateLiveActivity());
    const interval = setInterval(() => {
      setLiveActivity(prev => {
        const newItem = generateLiveActivity()[Math.floor(Math.random() * 8)];
        return [newItem, ...prev.slice(0, 7)];
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const loadHome = async () => {
      try {
        const [walletRes, depositsRes, withdrawalsRes, profileRes, upiRes, bankRes, ratesRes, settingsRes, statsRes, exchangeRes, transactionsRes] = await Promise.all([
          walletAPI.getWallet(),
          depositAPI.getHistory(),
          withdrawalAPI.getHistory(),
          userAPI.getProfile(),
          userAPI.getUpiAccounts(),
          userAPI.getBankAccounts ? userAPI.getBankAccounts() : Promise.resolve({ data: [] }),
          publicAPI.getCryptoRates(),
          adminAPI.getSettings(),
          userAPI.getUserStats().catch(() => ({ data: {} })),
          userAPI.getMyExchangeRequests().catch(() => ({ data: [] })),
          userAPI.getTransactions().catch(() => [])
        ]);

        const walletData = walletRes?.data || walletRes || null;
        const depositsData = depositsRes?.data || depositsRes || [];
        const withdrawalsData = withdrawalsRes?.data || withdrawalsRes || [];
        const exchangeData = exchangeRes?.data || exchangeRes || [];
        const transactionsData = transactionsRes?.data || transactionsRes || [];
        const profileData = profileRes?.data || profileRes || {};
        const upiData = upiRes?.data || upiRes || [];
        const bankData = bankRes?.data || bankRes || [];
        const ratesData = ratesRes?.data || ratesRes || [];
        const settingsData = settingsRes?.data || settingsRes || {};
        console.log('Settings Response:', settingsRes);
        console.log('Settings Data for banner:', settingsData);
        console.log('Banner enabled value:', settingsData.bannerenabled);
        console.log('Banner title value:', settingsData.bannertitle);
        const statsData = statsRes?.data || statsRes || {};
        const tether = Array.isArray(ratesData) ? ratesData.find((rate) => rate.id === 'tether') : null;

        console.log('Banner data from settings:', {
          bannerEnabled: settingsData.bannerenabled,
          bannerTitle: settingsData.bannertitle,
          bannerSubtitle: settingsData.bannersubtitle,
          bannerButtonText: settingsData.bannerbuttontext,
          bannerLink: settingsData.bannerlink
        });

        setWallet(walletData);
        setRecentDeposits(Array.isArray(depositsData) ? depositsData : []);
        setRecentWithdrawals(Array.isArray(withdrawalsData) ? withdrawalsData : []);
        setRecentExchanges(Array.isArray(exchangeData) ? exchangeData : []);
        setRecentTransactions(Array.isArray(transactionsData) ? transactionsData : []);
        setUserStats({
          todayVolume: parseFloat(statsData.todayVolume || 0),
          totalVolume: parseFloat(statsData.totalVolume || 0),
          todayProfit: parseFloat(statsData.todayProfit || 0),
          totalProfit: parseFloat(statsData.totalProfit || 0)
        });
        setUser(profileData);
        setPaymentEnabled(profileData.paymentEnabled !== false);
        setUsdtCommission(parseFloat(settingsData?.usdtcommissionpercent) || 0);
        setJTokenCommission(parseFloat(settingsData?.jtokencommissionpercent) || 0);
        setTokenRate(parseFloat(settingsData?.tokenrate) || 0);
        
        setRewardSettings({
          upiRewardAmount: parseFloat(settingsData?.upirewardamount) || 20,
          bankRewardAmount: parseFloat(settingsData?.bankrewardamount) || 20,
          telegramRewardAmount: parseFloat(settingsData?.telegramrewardamount) || 20
        });
        
        console.log('Settings Data:', settingsData);
        console.log('JToken Commission from settings:', settingsData?.jtokencommissionpercent);

        if (tether?.inr) {
          setUsdtRate(parseFloat(tether.inr));
        } else if (settingsData?.usdtrate) {
          setUsdtRate(parseFloat(settingsData.usdtrate));
        } else if (walletData?.usdtrate) {
          setUsdtRate(parseFloat(walletData.usdtrate));
        } else if (walletData?.usdtRate) {
          setUsdtRate(parseFloat(walletData.usdtRate));
        }

        // Banner settings from admin
        const bannerEnabled = settingsData.bannerenabled !== undefined 
          ? settingsData.bannerenabled !== false 
          : true;
        const bannerTitle = settingsData.bannertitle || 'Welcome Bonus';
        
        // Build subtitle based on discounts
        const depositDiscountEnabled = settingsData.depositdiscountenabled;
        const depositDiscountPercent = parseFloat(settingsData.depositdiscountpercent || 0);
        const depositDiscountMax = parseFloat(settingsData.depositdiscountmax || 0);
        const depositDiscountMaxUses = parseInt(settingsData.depositdiscountmaxuses || 1);
        
        const jtokenDiscountEnabled = settingsData.jtokendiscountenabled;
        const jtokenDiscountPercent = parseFloat(settingsData.jtokendiscountpercent || 0);
        const jtokenDiscountMax = parseFloat(settingsData.jtokendiscountmax || 0);
        const jtokenDiscountMaxUses = parseInt(settingsData.jtokendiscountmaxuses || 1);
        
        let bannerSubtitle = settingsData.bannersubtitle || '';
        if (depositDiscountEnabled && depositDiscountPercent > 0) {
          const usesText = depositDiscountMaxUses > 1 ? ` (${depositDiscountMaxUses}x)` : '';
          bannerSubtitle = `Get ${depositDiscountPercent}% Extra on Deposit${usesText}`;
        }
        if (jtokenDiscountEnabled && jtokenDiscountPercent > 0) {
          const prefix = bannerSubtitle ? ', ' : '';
          const usesText = jtokenDiscountMaxUses > 1 ? ` (${jtokenDiscountMaxUses}x)` : '';
          bannerSubtitle += `${prefix}${jtokenDiscountPercent}% Extra on JToken${usesText}`;
        }
        if (!bannerSubtitle) {
          bannerSubtitle = 'Get bonus on deposits and JToken';
        }
        
        const bannerButtonText = settingsData.bannerbuttontext || 'Claim Now';
        const bannerLink = settingsData.bannerlink || '/deposit';
        
        setBanner({
          enabled: bannerEnabled,
          title: bannerTitle,
          subtitle: bannerSubtitle,
          buttonText: bannerButtonText,
          link: bannerLink
        });

        const accountState = {
          hasUPI: upiData.length > 0,
          hasBank: bankData.length > 0,
          hasTelegram: !!profileData.telegramId
        };

        setUserAccountData(accountState);
        if (!accountState.hasUPI || !accountState.hasBank || !accountState.hasTelegram) {
          setShowRewardModal(true);
        }
      } catch (error) {
        console.error('Failed to load home page', error);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(loadHome, 0);
    const intervalId = setInterval(async () => {
      try {
        const [walletRes, settingsRes, statsRes] = await Promise.all([
          walletAPI.getWallet(),
          adminAPI.getSettings().catch(() => ({})),
          userAPI.getUserStats().catch(() => ({}))
        ]);
        const walletData = walletRes?.data || walletRes || null;
        setWallet(walletData);
        if (walletData?.usdtRate) {
          setUsdtRate(parseFloat(walletData.usdtRate));
        } else if (walletData?.usdtrate) {
          setUsdtRate(parseFloat(walletData.usdtrate));
        }
        const settingsData = settingsRes?.data || settingsRes || {};
        if (settingsData?.usdtrate && !walletData?.usdtRate) {
          setUsdtRate(parseFloat(settingsData.usdtrate));
        }
        // Update stats in real-time
        const statsData = statsRes?.data || statsRes || {};
        setUserStats({
          todayVolume: parseFloat(statsData.todayVolume || 0),
          totalVolume: parseFloat(statsData.totalVolume || 0),
          todayProfit: parseFloat(statsData.todayProfit || 0),
          totalProfit: parseFloat(statsData.totalProfit || 0)
        });
      } catch (error) {
        console.error('Failed to refresh data', error);
      }
    }, 2000);

    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
    };
  }, [setUser]);

  const menuItems = [
    { icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0h6', label: 'Home', path: '/home' },
    { icon: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4', label: 'Exchange', path: '/exchange' },
    { icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37', label: 'Account', path: '/manage-account' },
    { icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z', label: 'Team', path: '/team' },
    { icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z', label: 'Profile', path: '/profile' }
  ];

  const formatINR = (amount) => parseFloat(amount || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  const formatToken = (amount) => parseFloat(amount || 0).toFixed(2);

  const getActiveStatus = () => userAccountData.hasUPI && userAccountData.hasBank && userAccountData.hasTelegram;

  const handleTogglePayment = async () => {
    setTogglingPayment(true);
    try {
      const newValue = !paymentEnabled;
      await userAPI.togglePayment(newValue);
      setPaymentEnabled(newValue);
    } catch (error) {
      console.error('Failed to toggle payment:', error);
    } finally {
      setTogglingPayment(false);
    }
  };

  const getTotalBalance = () => {
    const inrBalance = parseFloat(wallet?.inrbalance || 0);
    const usdtBalance = parseFloat(wallet?.usdtbalance || 0);
    return inrBalance + (usdtBalance * usdtRate);
  };

  const getRewardValue = () => parseFloat(wallet?.tokenbalance || 0) * tokenRate;
  const getTokenRate = () => tokenRate;
  const getJTokenCommission = () => jTokenCommission;
  const getUsdtCommission = () => usdtCommission;

  const getTodayVolume = () => userStats.todayVolume || 0;
  const getTotalVolume = () => userStats.totalVolume || 0;
  const getTodayVolumeUsdt = () => parseFloat(userStats.todayUsdtVolume || 0);
  const getTotalVolumeUsdt = () => parseFloat(userStats.totalUsdtVolume || 0);
  const getTodayInrVolume = () => parseFloat(userStats.todayInrVolume || 0);
  const getTotalInrVolume = () => parseFloat(userStats.totalInrVolume || 0);
  const getTodayProfit = () => userStats.todayProfit;
  const getTotalProfit = () => userStats.totalProfit;

  const getRecentActivity = () => {
    const depositItems = recentDeposits.map((item) => ({ ...item, entryType: 'deposit' }));
    const withdrawalItems = recentWithdrawals.map((item) => ({ ...item, entryType: 'withdrawal' }));
    const exchangeItems = recentExchanges.map((item) => ({ 
      ...item, 
      entryType: 'exchange',
      method: item.ratetype === 'GAMING' ? 'Sell USDT' : 'Sell USDT'
    }));
    
    // Only add non-USDT transactions to avoid duplicates
    const transactionItems = recentTransactions
      .filter(item => item.type !== 'USDT_DEPOSIT')
      .map((item) => ({ 
        ...item, 
        entryType: 'transaction',
        method: item.type || 'Transaction'
      }));
    
    return [...depositItems, ...withdrawalItems, ...exchangeItems, ...transactionItems]
      .sort((a, b) => new Date(b.createdat || 0) - new Date(a.createdat || 0))
      .slice(0, 6);
  };

  const isPositiveTransaction = (item) => {
    const amount = parseFloat(item.amount || 0);
    if (amount < 0) return false;
    if (amount > 0) return true;
    if (item.entryType === 'deposit') return true;
    if (item.entryType === 'exchange') return false; // All exchanges are sells (negative)
    if (item.method === 'REWARD') return true;
    if (item.method === 'USDT_DEPOSIT') return true;
    if (item.method === 'JTOKEN_PURCHASE') return true;
    if (item.type === 'REWARD') return true;
    if (item.type === 'JTOKEN_PURCHASE') return true;
    if (item.type === 'COMMISSION') return true;
    if (item.type === 'SOLD_TOKENS') return true;
    if (item.type === 'TRANSFER') return true;
    if (item.type === 'USDT_DEPOSIT') return true;
    if (item.type === 'USDT') return true;
    return false;
  };

  const isUSDTTransaction = (item) => {
    return (item.method || '').toUpperCase().includes('USDT') || 
           (item.type || '').toUpperCase().includes('USDT') ||
           item.type === 'USDT_DEPOSIT';
  };

  console.log('Recent Deposits:', recentDeposits);
  console.log('Recent Withdrawals:', recentWithdrawals);
  console.log('Recent Exchanges:', recentExchanges);
  console.log('Recent Transactions:', recentTransactions);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] p-4 font-['Ubuntu',sans-serif]">
        <div className="animate-pulse space-y-4">
          <div className="h-16 rounded-2xl bg-[#151515]"></div>
          <div className="h-52 rounded-3xl bg-[#151515]"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-28 rounded-3xl bg-[#151515]"></div>
            <div className="h-28 rounded-3xl bg-[#151515]"></div>
          </div>
          <div className="h-40 rounded-3xl bg-[#151515]"></div>
        </div>
      </div>
    );
  }

  const recentActivity = getRecentActivity();

  return (
    <div className="min-h-screen bg-[#0a0a0a] pb-24 font-['Ubuntu',sans-serif]">
      {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/80 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <div className={`fixed top-0 left-0 z-50 h-full w-80 transform bg-[#0d0d0d] transition-transform duration-300 lg:hidden ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="border-b border-[#2a2a2a] p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#FFD700] text-black font-bold text-lg">
                {(user?.name || user?.email || 'U')[0].toUpperCase()}
              </div>
              <div>
                <p className="text-white font-semibold">{user?.name || user?.email?.split('@')[0] || 'User'}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role || 'Member'}</p>
              </div>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="rounded-xl bg-[#1a1a1a] p-2 text-white">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        <div className="space-y-2 p-4">
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => {
                navigate(item.path);
                setSidebarOpen(false);
              }}
              className={`flex w-full items-center gap-4 rounded-2xl px-5 py-4 text-left transition-all ${item.path === '/home' ? 'bg-[#D4AF37]/10' : 'bg-[#1a1a1a]/50 hover:bg-[#D4AF37]/10'}`}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1a1a1a] text-[#D4AF37]">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                </svg>
              </div>
              <span className="font-medium text-white">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="sticky top-0 z-30 border-b border-[#1a1a1a] bg-[#0d0d0d]/95 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-4">
          <button onClick={() => setSidebarOpen(true)} className="rounded-2xl bg-[#1a1a1a] p-3 text-white lg:hidden">
            <FaBars className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <img src="/jexpaylogo.png" alt="Jex Pay" className="h-8 sm:h-9 object-contain" />
            <div>
              <p className="text-xs uppercase tracking-[0.2em] bg-gradient-to-r from-[#D4AF37] to-[#FFD700] bg-clip-text text-transparent font-semibold">𝙅𝙀𝙓 𝙋𝘼𝙔</p>
              <h1 className="text-sm font-bold text-white">Member Home</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#D4AF37] to-[#FFD700] text-black font-bold text-sm">
              {(user?.name || user?.email || 'U')[0].toUpperCase()}
            </div>
            <button className="relative rounded-2xl bg-[#1a1a1a] p-3 text-white">
              <FaBell className="h-4 w-4 text-gray-300" />
              <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-[#D4AF37]"></span>
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-2xl space-y-4 px-4 py-5">

        <div className="relative overflow-hidden rounded-[28px] border border-[#3a3020] bg-[radial-gradient(circle_at_top_left,_rgba(212,175,55,0.18),_transparent_35%),linear-gradient(135deg,#171717_0%,#101010_60%,#090909_100%)] p-6 shadow-[0_20px_80px_rgba(0,0,0,0.45)]">
          <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-[#D4AF37]/10 blur-3xl"></div>
          <div className="relative space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-gray-400">Total wallet balance</p>
                <h2 className="mt-2 bg-gradient-to-r from-[#D4AF37] to-[#FFE08A] bg-clip-text text-4xl font-bold text-transparent sm:text-5xl">
                  ₹{formatINR(getTotalBalance())}
                </h2>
              </div>
              <div className={`rounded-full border px-3 py-1 text-xs font-semibold ${getActiveStatus() ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' : 'border-amber-500/30 bg-amber-500/10 text-amber-300'}`}>
                {getActiveStatus() ? 'Rewards Active' : 'Complete setup'}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/5 bg-black/20 p-4">
                <p className="text-xs text-gray-500">INR Wallet</p>
                <p className="mt-2 text-xl font-semibold text-white">₹{formatINR(wallet?.inrbalance || 0)}</p>
              </div>
              <div className="rounded-2xl border border-white/5 bg-black/20 p-4">
                <p className="text-xs text-gray-500">USDT Wallet</p>
                <p className="mt-2 text-xl font-semibold text-white">{parseFloat(wallet?.usdtbalance || 0).toFixed(4)}</p>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between rounded-2xl bg-[#0b0b0b] px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-white">Receive Payments</p>
                <p className="text-xs text-gray-500">{paymentEnabled ? 'Start selling' : 'Payments disabled'}</p>
              </div>
              <button
                onClick={handleTogglePayment}
                disabled={togglingPayment}
                className={`text-3xl ${paymentEnabled ? 'text-emerald-400' : 'text-gray-500'}`}
              >
                {paymentEnabled ? <FaToggleOn /> : <FaToggleOff />}
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-[28px] border border-[#242424] bg-gradient-to-br from-[#171717] to-[#0d0d0d] p-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-[#1d1d1d] bg-[#0b0b0b] p-3">
              <p className="text-xs text-gray-400">USDT Rate</p>
              <p className="mt-1 text-lg font-bold text-emerald-400">{usdtRate > 0 ? `₹${usdtRate.toFixed(2)}` : '-'}</p>
            </div>
            <div className="rounded-2xl border border-[#1d1d1d] bg-[#0b0b0b] p-3">
              <p className="text-xs text-gray-400">J Token Rate</p>
              <p className="mt-1 text-lg font-bold text-[#D4AF37]">{tokenRate > 0 ? `₹${tokenRate.toFixed(2)}` : '-'}</p>
            </div>
            <div className="rounded-2xl border border-[#1d1d1d] bg-[#0b0b0b] p-3">
              <p className="text-xs text-gray-400">J Token Commission</p>
              <p className="mt-1 text-lg font-bold text-white">{jTokenCommission > 0 ? `${jTokenCommission.toFixed(1)}%` : '0%'}</p>
            </div>
            <div className="rounded-2xl border border-[#1d1d1d] bg-[#0b0b0b] p-3">
              <p className="text-xs text-gray-400">USDT Commission</p>
              <p className="mt-1 text-lg font-bold text-white">{usdtCommission.toFixed(0)}%</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Buy J Token', icon: <FaCoins className="h-5 w-5" />, path: '/buy-jtoken', tone: 'text-[#D4AF37] bg-[#D4AF37]/15' },
            { label: 'Add USDT', icon: <FaArrowCircleDown className="h-5 w-5" />, path: '/deposit', tone: 'text-emerald-400 bg-emerald-400/15' }
          ].map((action) => (
            <button
              key={action.label}
              onClick={() => navigate(action.path)}
              className="rounded-3xl border border-[#242424] bg-gradient-to-br from-[#171717] to-[#0d0d0d] p-4 transition-transform hover:scale-[1.02]"
            >
              <div className={`mx-auto flex h-11 w-11 items-center justify-center rounded-2xl ${action.tone}`}>{action.icon}</div>
              <p className="mt-3 text-center text-xs font-semibold text-white sm:text-sm">{action.label}</p>
            </button>
          ))}
        </div>

        {banner.enabled && (
          <button
            onClick={() => navigate(banner.link)}
            className="relative block w-full overflow-hidden rounded-[28px] bg-gradient-to-r from-[#D4AF37] via-[#E4C45A] to-[#F1D57C] p-5 text-left text-black shadow-[0_18px_60px_rgba(212,175,55,0.22)] transition-transform hover:scale-[1.01]"
          >
            <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-white/20 blur-2xl"></div>
            <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-black/15 text-white">
                  <FaGift className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-black/70">Campaign</p>
                  <h3 className="mt-1 text-xl font-bold">{banner.title}</h3>
                  <p className="mt-1 text-sm text-black/70">{banner.subtitle}</p>
                </div>
              </div>
              <span className="inline-flex w-fit items-center rounded-2xl bg-black px-4 py-2 text-sm font-bold text-[#D4AF37]">
                {banner.buttonText}
              </span>
            </div>
          </button>
        )}

        <div>
          <div className="mb-3 flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-[#D4AF37]"></div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#D4AF37]">Banners</p>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[28px] border border-[#242424] bg-gradient-to-br from-[#171717] via-[#121212] to-[#0c0c0c] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.32)]">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#D4AF37]">Live Activity</p>
            <h3 className="mt-2 text-2xl font-bold text-white">Real Time Order Flow</h3>
            
            <div className="mt-5 overflow-hidden rounded-2xl">
              <div className="relative h-[320px] overflow-hidden rounded-2xl bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a] border border-[#2a2a2a] shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(212,175,55,0.08),_transparent_50%)]"></div>
                <div className="absolute inset-0 flex flex-col gap-2 p-2">
                  {liveActivity.map((item, index) => (
                    <div 
                      key={item.id + index}
                      className="group relative flex items-center justify-between rounded-xl p-3 animate-slide-in backdrop-blur-sm"
                      style={{
                        animationDelay: `${index * 0.3}s`,
                        animationFillMode: 'both',
                        background: `linear-gradient(135deg, rgba(30,30,30,0.9) 0%, rgba(20,20,20,0.95) 100%)`,
                        boxShadow: `0 4px 20px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05), 0 0 20px ${item.color}10`
                      }}
                    >
                      <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: `linear-gradient(135deg, ${item.color}15 0%, transparent 100%)` }}></div>
                      <div className="relative flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.4)]" style={{ background: `linear-gradient(135deg, ${item.color}30 0%, ${item.color}15 100%)`, border: `1px solid ${item.color}40` }}>
                          <span style={{ color: item.color }}>{item.icon}</span>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">
                            {item.name} <span className="text-gray-400 font-normal">{item.action}</span>
                          </p>
                          <p className="text-xs font-medium" style={{ color: item.color }}>{item.type}</p>
                        </div>
                      </div>
                      <div className="relative text-right">
                        <p className="text-sm font-bold" style={{ color: item.color, textShadow: `0 0 10px ${item.color}50` }}>{item.amount}</p>
                        <p className="text-xs text-gray-500">{item.time}s ago</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <style>{`
              @keyframes slideIn {
                from {
                  opacity: 0;
                  transform: translateX(-20px) scale(0.95);
                }
                to {
                  opacity: 1;
                  transform: translateX(0) scale(1);
                }
              }
              .animate-slide-in {
                animation: slideIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                opacity: 0;
              }
            `}</style>
          </div>

          <div className="space-y-4">
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-3xl border border-[#242424] bg-gradient-to-br from-[#171717] to-[#0d0d0d] p-5">
            <p className="text-xs text-gray-500">USDT Volume (24h)</p>
            <p className="mt-2 text-xl font-bold text-white">{getTodayVolumeUsdt().toFixed(6)} USDT</p>
            <p className="mt-1 text-xs text-emerald-400">₹{formatINR(getTodayVolumeUsdt() * (usdtRate || 83))}</p>
          </div>
          <div className="rounded-3xl border border-[#242424] bg-gradient-to-br from-[#171717] to-[#0d0d0d] p-5">
            <p className="text-xs text-gray-500">USDT Volume (Total)</p>
            <p className="mt-2 text-xl font-bold text-white">{getTotalVolumeUsdt().toFixed(6)} USDT</p>
            <p className="mt-1 text-xs text-emerald-400">₹{formatINR(getTotalVolumeUsdt() * (usdtRate || 83))}</p>
          </div>
          <div className="rounded-3xl border border-[#242424] bg-gradient-to-br from-[#171717] to-[#0d0d0d] p-5">
            <p className="text-xs text-gray-500">Profit (24h)</p>
            <p className={`mt-2 text-xl font-bold ${getTodayProfit() >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>₹{formatINR(getTodayProfit())}</p>
          </div>
          <div className="rounded-3xl border border-[#242424] bg-gradient-to-br from-[#171717] to-[#0d0d0d] p-5">
            <p className="text-xs text-gray-500">Profit (Total)</p>
            <p className="mt-2 text-xl font-bold text-emerald-400">₹{formatINR(getTotalProfit())}</p>
          </div>
        </div>

        <div className="rounded-[28px] border border-[#242424] bg-gradient-to-br from-[#171717] via-[#111111] to-[#0c0c0c] p-5">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#D4AF37]">Recent Activity</p>
              <h3 className="mt-2 text-2xl font-bold text-white">USDT Wallet Movement</h3>
            </div>
            <button onClick={() => navigate('/exchange')} className="text-sm font-semibold text-[#D4AF37]">
              View All
            </button>
          </div>

          <div className="space-y-3">
            {recentActivity.filter(item => (item.method || '').toUpperCase().includes('USDT')).length === 0 ? (
              <div className="rounded-2xl border border-[#1d1d1d] bg-[#0d0d0d] px-4 py-8 text-center text-sm text-gray-500">
                No USDT activity yet.
              </div>
            ) : (
              recentActivity.filter(item => isUSDTTransaction(item)).slice(0, 5).map((item, index) => {
                    const isUSDT = true;
                    const isExchange = item.entryType === 'exchange';
                    const isDeposit = item.entryType === 'deposit';
                    const isPositive = isPositiveTransaction(item);
                    return (
                      <div key={`${item.id || index}-${item.createdat || index}`} className="flex items-center justify-between rounded-2xl border border-[#1d1d1d] bg-[#0d0d0d] p-4">
                        <div className="flex items-center gap-3">
                           <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${isPositive ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'}`}>
                             {isPositive ? <FaArrowDown className="h-4 w-4" /> : <FaArrowUp className="h-4 w-4" />}
                           </div>
                           <div>
                            <p className="text-sm font-semibold text-white">
                              {isExchange 
                                ? 'Sell USDT' 
                                : item.method === 'USDT_DEPOSIT' || item.type === 'USDT_DEPOSIT' || item.type === 'USDT'
                                  ? 'USDT Deposit'
                                  : item.method || (isDeposit ? 'Deposit' : 'Withdrawal')}
                            </p>
                            <p className="text-xs text-gray-500">{item.createdat ? new Date(item.createdat).toLocaleString() : 'Pending time'}</p>
                          </div>
                        </div>
                         <div className="text-right">
                           <p className={`text-sm font-bold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                             {isPositive ? '+' : '-'}{isUSDT ? `${parseFloat(item.amount || 0).toFixed(4)} USDT` : `₹${formatINR(Math.abs(item.amount || 0))}`}
                           </p>
                          <p className={`text-xs font-medium ${item.status === 'APPROVED' ? 'text-emerald-400' : item.status === 'REJECTED' ? 'text-rose-400' : 'text-amber-400'}`}>
                            {item.status === 'APPROVED' ? 'SUCCESS' : item.status === 'REJECTED' ? 'FAILED' : item.status || 'PENDING'}
                          </p>
                        </div>
                      </div>
                    );
                  })
            )}
          </div>
        </div>

        <div className="rounded-[28px] border border-[#242424] bg-gradient-to-br from-[#171717] via-[#111111] to-[#0c0c0c] p-5">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#D4AF37]">INR Activity</p>
              <h3 className="mt-2 text-2xl font-bold text-white">INR Wallet Movement</h3>
            </div>
          </div>

          <div className="space-y-3">
            {recentActivity.filter(item => !isUSDTTransaction(item)).length === 0 ? (
              <div className="rounded-2xl border border-[#1d1d1d] bg-[#0d0d0d] px-4 py-8 text-center text-sm text-gray-500">
                No INR activity yet.
              </div>
            ) : (
              recentActivity.filter(item => !isUSDTTransaction(item)).slice(0, 10).map((item, index) => {
                    const isUSDT = false;
                    const isExchange = item.entryType === 'exchange';
                    const isDeposit = item.entryType === 'deposit';
                    const isPositive = isPositiveTransaction(item);
                    const status = item.status || 'PENDING';
                    const isNegative = !isPositive && !isExchange;
                    
                    const typeLabel = isExchange 
                      ? (item.ratetype === 'BUY' ? 'Buy USDT' : 'Sell USDT') 
                      : item.type === 'REWARD' ? 'Reward' 
                      : item.type === 'COMMISSION' ? 'Commission'
                      : item.type === 'SOLD_TOKENS' ? 'Sold Tokens'
                      : item.type === 'TRANSFER' ? 'Transfer'
                      : item.type === 'JTOKEN_PURCHASE' ? 'JToken Purchase'
                      : item.method || item.type || (isDeposit ? 'Deposit' : 'Withdrawal');
                    
                    return (
                      <div key={`${item.id || index}-${item.createdat || index}`} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 rounded-2xl border border-[#1d1d1d] bg-[#0d0d0d] p-3">
                        <div className="flex items-center gap-2 w-full overflow-hidden">
                          <div className={`flex h-8 w-8 items-center justify-center rounded-lg shrink-0 ${isPositive ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'}`}>
                            {isPositive ? <FaArrowDown className="h-3 w-3" /> : <FaArrowUp className="h-3 w-3" />}
                          </div>
                          <div className="min-w-0 flex-1 overflow-hidden">
                            <p className="text-sm font-semibold text-white truncate">{typeLabel}</p>
                            {item.note && <p className="text-xs text-gray-500 truncate">{item.note}</p>}
                          </div>
                        </div>
                        <div className="flex items-center justify-between w-full pl-10 sm:pl-0 sm:w-auto sm:items-end">
                          <p className={`text-sm font-bold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {isPositive ? '+' : '-'}₹{formatINR(Math.abs(item.amount || 0))}
                          </p>
                          <span className={`text-xs font-medium px-2 py-0.5 rounded ${isPositive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                            {isPositive ? 'CREDIT' : 'DEBIT'}
                          </span>
                        </div>
                      </div>
                    );
                  })
            )}
          </div>
        </div>
      </div>

      <BottomNav />

      {showRewardModal && (
        <RewardModal onClose={() => setShowRewardModal(false)} userData={userAccountData} telegramBotUrl="https://t.me/zcryptoauthbot" rewardSettings={rewardSettings} />
      )}

      {/* UPI Warning Popup */}
      {showUpiWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl border border-red-500/30 bg-[#0d0d0d] p-6">
            <div className="text-center mb-4">
              <p className="text-yellow-400 font-bold text-lg mb-2">⚠️ Worning / सावधान</p>
            </div>
            <div className="space-y-3 mb-6">
              <p className="text-white text-sm">Do not receive any personal money on the UPI ID linked by you on our website.</p>
              <p className="text-gray-400 text-sm">If you receive any personal money on the UPI linked on the Website, that money will be detected by our system and you will be responsible for this loss.</p>
              <p className="text-white text-sm">हमारी वेबसाइट पर आपके द्वारा लिंक की गई UPI ID पर कोई भी पर्सनल पैसा न लें।</p>
              <p className="text-gray-400 text-sm">अगर आपको वेबसाइट पर लिंक किए गए UPI पर कोई पर्सनल पैसा मिलता है, तो वह पैसा हमारे सिस्टम द्वारा पता लगा लिया जाएगा और आप इस नुकसान के लिए ज़िम्मेदार होंगे। धन्यवाद 🙏</p>
            </div>
            <button
              onClick={() => {
                localStorage.setItem('upiWarningDismissed', 'true');
                setShowUpiWarning(false);
              }}
              className="w-full bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black font-bold py-3 rounded-xl hover:shadow-lg hover:shadow-yellow-500/30 transition-all"
            >
              I Understand
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
