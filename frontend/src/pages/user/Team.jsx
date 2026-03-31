import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store';
import { userAPI, referralAPI, walletAPI } from '../../services/api';
import BottomNav from '../../components/BottomNav';
import { FaUsers, FaCopy, FaCheck, FaLink, FaWhatsapp, FaTelegram, FaWallet, FaPercentage, FaArrowUp, FaArrowDown } from 'react-icons/fa';

const Team = () => {
  const { user, setUser } = useAuthStore();
  const [teamData, setTeamData] = useState(null);
  const [walletData, setWalletData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawing, setWithdrawing] = useState(false);
  const [withdrawMessage, setWithdrawMessage] = useState('');

  const referralLink = `https://zcyrpto.netlify.app/register?ref=${user?.referralCode}`;

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async () => {
    try {
      const [profileRes, teamRes, walletRes] = await Promise.all([
        userAPI.getProfile(),
        referralAPI.getTeam(),
        walletAPI.getWallet()
      ]);
      setUser(profileRes);
      setTeamData(teamRes?.data || teamRes);
      setWalletData(walletRes?.data || walletRes);
    } catch (err) {
      console.error('Error fetching team data:', err);
    } finally {
      setLoading(false);
    }
  };

  const copyReferralCode = () => {
    if (user?.referralCode) {
      navigator.clipboard.writeText(user.referralCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const copyReferralLink = () => {
    if (referralLink) {
      navigator.clipboard.writeText(referralLink);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    }
  };

  const shareWhatsApp = () => {
    const msg = encodeURIComponent(`Join 𝙅𝙀𝙓 𝙋𝘼𝙔 and earn! Use my referral code: ${user?.referralCode}\n\n${referralLink}`);
    window.open(`https://wa.me/?text=${msg}`, '_blank');
  };

  const shareTelegram = () => {
    const msg = encodeURIComponent(`Join 𝙅𝙀𝙓 𝙋𝘼𝙔 and earn! Use my referral code: ${user?.referralCode}\n\n${referralLink}`);
    window.open(`https://t.me/share/url?url=${referralLink}&text=${msg}`, '_blank');
  };

  const handleWithdrawReferral = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      setWithdrawMessage('Please enter a valid amount');
      return;
    }
    
    const balance = parseFloat(walletData?.referralBalance || 0);
    if (parseFloat(withdrawAmount) > balance) {
      setWithdrawMessage('Amount exceeds available balance');
      return;
    }
    
    setWithdrawing(true);
    setWithdrawMessage('');
    try {
      const res = await walletAPI.withdrawReferral({ amount: parseFloat(withdrawAmount) });
      setWithdrawMessage(res.message || 'Withdrawal successful!');
      setWithdrawAmount('');
      fetchData();
      
      setTimeout(() => {
        setShowWithdrawModal(false);
        setWithdrawMessage('');
      }, 2000);
    } catch (err) {
      setWithdrawMessage(err.message || 'Withdrawal failed');
    } finally {
      setWithdrawing(false);
    }
  };

  const formatINR = (amt) => {
    return parseFloat(amt || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const formatDate = (date) => {
    if (!date) return 'Never';
    try {
      const d = new Date(date);
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
    } catch {
      return 'Invalid date';
    }
  };

  const getTimeAgo = (date) => {
    if (!date) return 'Never';
    const now = new Date();
    const past = new Date(date);
    const diffMs = now - past;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatDate(date);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] to-[#151515] pb-32 font-['Ubuntu',sans-serif]">
        <div className="animate-pulse p-4 space-y-4 max-w-2xl mx-auto">
          <div className="h-20 bg-[#1a1a1a] rounded-2xl"></div>
          <div className="h-32 bg-[#1a1a1a] rounded-2xl"></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="h-24 bg-[#1a1a1a] rounded-2xl"></div>
            <div className="h-24 bg-[#1a1a1a] rounded-2xl"></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="h-24 bg-[#1a1a1a] rounded-2xl"></div>
            <div className="h-24 bg-[#1a1a1a] rounded-2xl"></div>
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] to-[#151515] pb-32 font-['Ubuntu',sans-serif]">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-gradient-to-r from-[#0d0d0d] via-[#1a1a1a] to-[#0d0d0d] backdrop-blur-2xl border-b border-[#D4AF37]/20">
        <div className="max-w-2xl mx-auto flex items-center justify-between px-4 py-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-[#D4AF37] via-[#FFD700] to-[#D4AF37] bg-clip-text text-transparent">
              Team
            </h1>
            <p className="text-gray-500 text-xs">Invite & Earn</p>
          </div>
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-[#D4AF37]/20 flex items-center justify-center">
            <FaUsers className="w-5 h-5 sm:w-6 sm:h-6 text-[#D4AF37]" />
          </div>
        </div>
      </div>

      <div className="px-3 sm:px-4 py-4 space-y-4 max-w-2xl mx-auto">
        {/* Referral Code Card */}
        <div className="bg-gradient-to-br from-[#1a1a1a] via-[#2a2520] to-[#1a1a1a] rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-[#D4AF37]/30 text-center">
          <p className="text-gray-400 text-xs sm:text-sm mb-2 sm:mb-3">Your Referral Code</p>
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <span className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] bg-clip-text text-transparent font-mono tracking-wider">
              {user?.referralCode || 'N/A'}
            </span>
            <button 
              onClick={copyReferralCode} 
              className="p-2 sm:p-3 bg-[#D4AF37]/20 rounded-xl hover:bg-[#D4AF37]/30 transition-all active:scale-95"
            >
              {copied ? (
                <FaCheck className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
              ) : (
                <FaCopy className="w-4 h-4 sm:w-5 sm:h-5 text-[#D4AF37]" />
              )}
            </button>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-2 mb-3 sm:mb-4">
            <button 
              onClick={copyReferralLink} 
              className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-[#D4AF37] text-black rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold hover:bg-[#FFD700] transition-all active:scale-95"
            >
              {linkCopied ? <><FaCheck className="w-3 h-3 sm:w-4 sm:h-4" /> Copied!</> : <><FaLink className="w-3 h-3 sm:w-4 sm:h-4" /> Copy Link</>}
            </button>
            <button 
              onClick={shareWhatsApp} 
              className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-green-600 text-white rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold hover:bg-green-500 transition-all active:scale-95"
            >
              <FaWhatsapp className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">WhatsApp</span>
            </button>
            <button 
              onClick={shareTelegram} 
              className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-[#0088cc] text-white rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold hover:bg-[#0077b5] transition-all active:scale-95"
            >
              <FaTelegram className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Telegram</span>
            </button>
          </div>
          
          <p className="text-gray-500 text-xs">Share your link - friends who register get ₹10 bonus!</p>
        </div>

        {/* Stats Grid - Row 1 */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {/* Referral Earnings */}
          <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] rounded-2xl p-4 sm:p-5 border border-[#2a2a2a]">
            <div className="flex items-center gap-2 mb-2 sm:mb-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-[#D4AF37]/20 flex items-center justify-center">
                <FaWallet className="w-4 h-4 sm:w-5 sm:h-5 text-[#D4AF37]" />
              </div>
              <p className="text-gray-400 text-xs sm:text-sm">Referral Earnings</p>
            </div>
            <p className="text-xl sm:text-2xl md:text-3xl font-bold text-[#D4AF37] mb-2 sm:mb-3">
              ₹{formatINR(walletData?.referralBalance || 0)}
            </p>
            {(walletData?.referralBalance || 0) > 0 && (
              <button
                onClick={() => { setShowWithdrawModal(true); setWithdrawMessage(''); setWithdrawAmount(''); }}
                className="w-full py-2 sm:py-2.5 bg-green-500 text-white rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold hover:bg-green-600 transition-all active:scale-[0.98]"
              >
                Withdraw
              </button>
            )}
          </div>

          {/* Commission % */}
          <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] rounded-2xl p-4 sm:p-5 border border-[#2a2a2a]">
            <div className="flex items-center gap-2 mb-2 sm:mb-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-blue-500/20 flex items-center justify-center">
                <FaPercentage className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
              </div>
              <p className="text-gray-400 text-xs sm:text-sm">Commission</p>
            </div>
            <p className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-1">
              {walletData?.referralPercent || 5}%
            </p>
            <p className="text-gray-500 text-xs">Per deposit</p>
          </div>
        </div>

        {/* Stats Grid - Row 2 */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {/* Today Earnings */}
          <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] rounded-2xl p-4 sm:p-5 border border-[#2a2a2a]">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                <FaArrowUp className="w-4 h-4 text-green-400" />
              </div>
              <p className="text-gray-400 text-xs sm:text-sm">Today Earnings</p>
            </div>
            <p className="text-lg sm:text-xl md:text-2xl font-bold text-green-400">
              ₹{formatINR(teamData?.todayEarnings || 0)}
            </p>
          </div>

          {/* Yesterday */}
          <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] rounded-2xl p-4 sm:p-5 border border-[#2a2a2a]">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                <FaArrowDown className="w-4 h-4 text-yellow-400" />
              </div>
              <p className="text-gray-400 text-xs sm:text-sm">Yesterday</p>
            </div>
            <p className="text-lg sm:text-xl md:text-2xl font-bold text-white">
              ₹{formatINR(teamData?.yesterdayEarnings || 0)}
            </p>
          </div>
        </div>

        {/* Stats Grid - Row 3 */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {/* New Team This Month */}
          <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] rounded-2xl p-4 sm:p-5 border border-[#2a2a2a]">
            <p className="text-gray-400 text-xs sm:text-sm mb-2">New Team (This Month)</p>
            <p className="text-xl sm:text-2xl md:text-3xl font-bold text-white">
              {teamData?.newTeamThisMonth || 0}
            </p>
          </div>

          {/* Total Team */}
          <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] rounded-2xl p-4 sm:p-5 border border-[#2a2a2a]">
            <p className="text-gray-400 text-xs sm:text-sm mb-2">Total Team</p>
            <p className="text-xl sm:text-2xl md:text-3xl font-bold text-white">
              {teamData?.totalReferrals || 0}
            </p>
          </div>
        </div>

        {/* Team Members List */}
        <div>
          <h3 className="text-base sm:text-lg font-bold text-white mb-3 sm:mb-4 flex items-center gap-2">
            <FaUsers className="w-4 h-4 sm:w-5 sm:h-5 text-[#D4AF37]" />
            Team Members ({teamData?.totalReferrals || 0})
          </h3>
          
          {!teamData?.referrals || teamData.referrals.length === 0 ? (
            <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] rounded-2xl p-6 sm:p-10 border border-[#2a2a2a] text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gray-800/50 flex items-center justify-center mx-auto mb-4">
                <FaUsers className="w-8 h-8 sm:w-10 sm:h-10 text-gray-600" />
              </div>
              <p className="text-gray-400 text-sm sm:text-base mb-1">No team members yet</p>
              <p className="text-gray-600 text-xs sm:text-sm">Share your referral code to invite members</p>
            </div>
          ) : (
            <div className="space-y-2 sm:space-y-3">
              {teamData.referrals.map((member, index) => (
                <div 
                  key={member.id || index} 
                  className="bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-[#2a2a2a] hover:border-[#D4AF37]/30 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-sm sm:text-base font-bold ${
                        member.isverified 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {(member.name || member.email || 'U').charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium text-sm sm:text-base truncate">
                          {member.name || member.email?.split('@')[0] || 'User'}
                        </p>
                        <p className="text-gray-500 text-xs truncate">{member.email || 'No email'}</p>
                        <p className="text-gray-600 text-xs mt-0.5">
                          Joined: {formatDate(member.joinDate)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right flex-shrink-0 ml-2">
                      <p className="text-[#D4AF37] font-bold text-sm sm:text-base">
                        ₹{formatINR(member.totalEarnings || 0)}
                      </p>
                      <p className="text-gray-500 text-xs">
                        {member.totalEarnings > 0 ? 'Active' : 'No earnings'}
                      </p>
                      {member.lastActive && (
                        <p className="text-gray-600 text-xs">
                          {getTimeAgo(member.lastActive)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] rounded-2xl sm:rounded-3xl w-full max-w-sm mx-4 p-5 sm:p-6 border border-[#D4AF37]/30 shadow-2xl">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h3 className="text-lg sm:text-xl font-bold text-white">Withdraw to Main Balance</h3>
              <button 
                onClick={() => setShowWithdrawModal(false)} 
                className="p-2 bg-[#252525] rounded-xl hover:bg-[#303030] transition-colors"
              >
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="mb-4 sm:mb-5 p-3 sm:p-4 bg-[#0d0d0d] rounded-xl sm:rounded-2xl">
              <p className="text-gray-500 text-xs sm:text-sm mb-1">Available Balance</p>
              <p className="text-2xl sm:text-3xl font-bold text-green-400">
                ₹{formatINR(walletData?.referralBalance || 0)}
              </p>
            </div>

            <div className="mb-4 sm:mb-5">
              <label className="text-gray-400 text-xs sm:text-sm mb-2 block">Amount (₹)</label>
              <input
                type="number"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                placeholder="Enter amount"
                className="w-full bg-[#0d0d0d] border border-[#2a2a2a] rounded-xl sm:rounded-2xl px-4 py-3 sm:py-4 text-white placeholder-gray-600 focus:outline-none focus:border-[#D4AF37] text-base sm:text-lg"
              />
            </div>

            {withdrawMessage && (
              <div className={`mb-4 p-3 rounded-xl text-sm ${withdrawMessage.includes('successful') ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                {withdrawMessage}
              </div>
            )}

            <button
              onClick={handleWithdrawReferral}
              disabled={withdrawing}
              className="w-full py-3 sm:py-4 bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black font-bold rounded-xl sm:rounded-2xl hover:opacity-90 transition-all disabled:opacity-50 text-sm sm:text-base"
            >
              {withdrawing ? 'Processing...' : 'Withdraw'}
            </button>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
};

export default Team;
