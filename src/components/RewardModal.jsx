import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaWallet, FaGift, FaTimes, FaCheckCircle, FaChevronRight, FaWhatsapp, FaMobileAlt, FaTelegram } from 'react-icons/fa';
import { userAPI } from '../services/api';

const RewardModal = ({ onClose, userData, rewardSettings, telegramSupportUrl }) => {
  const navigate = useNavigate();
  const [localUserData, setLocalUserData] = useState(userData);
  const [showMobileVerifyModal, setShowMobileVerifyModal] = useState(false);

  // Sync local state with props
  useEffect(() => {
    setLocalUserData(userData);
  }, [userData]);

  const upiRewardAmount = parseFloat(rewardSettings?.upiRewardAmount) || 20;
  const bankRewardAmount = parseFloat(rewardSettings?.bankRewardAmount) || 20;
  const telegramRewardAmount = parseFloat(rewardSettings?.telegramRewardAmount) || 20;
  const whatsappRewardAmount = parseFloat(rewardSettings?.whatsappRewardAmount) || 20;

  const [mobileNumber, setMobileNumber] = useState('');
  const [showMobileModal, setShowMobileModal] = useState(false);
  const [mobileError, setMobileError] = useState('');
  const [requestingOtp, setRequestingOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState('');
  const [mobileStatus, setMobileStatus] = useState(null);
  const initialLoadRef = useRef(true);
  const [userClosedPopup, setUserClosedPopup] = useState(false);

  const { mobileVerified } = localUserData || {};

  const tasks = [
    {
      id: 'upi',
      icon: <FaWallet className="w-8 h-8" />,
      title: 'Add UPI Account',
      description: 'Link your UPI for instant deposits',
      reward: upiRewardAmount,
      completed: localUserData?.hasUPI || false,
      path: '/manage-account',
      color: 'from-green-500 to-emerald-600',
      bgColor: 'bg-green-500/20',
      textColor: 'text-green-400'
    },
    {
      id: 'whatsapp',
      icon: <FaWhatsapp className="w-8 h-8" />,
      title: 'Bind WhatsApp',
      description: 'Enter your WhatsApp number',
      reward: whatsappRewardAmount,
      completed: localUserData?.whatsappbound || false,
      path: '/profile',
      color: 'from-green-400 to-emerald-500',
      bgColor: 'bg-green-400/20',
      textColor: 'text-green-400'
    },
    {
      id: 'mobile_verification',
      icon: <FaMobileAlt className="w-8 h-8" />,
      title: 'Mobile Verification',
      description: 'Verify your mobile number',
      reward: telegramRewardAmount,
      completed: mobileVerified || false,
      color: 'from-blue-500 to-cyan-600',
      bgColor: 'bg-blue-500/20',
      textColor: 'text-blue-400'
    }
  ];

  // Refresh user data and check mobile verification when modal opens
  useEffect(() => {
    if (showMobileModal) {
      // First try to get fresh profile data
      userAPI.getProfile().then(profile => {
        if (profile?.mobileverified) {
          setLocalUserData(prev => ({ ...prev, mobileVerified: true }));
        }
      }).catch(() => {});
      
      // Also check from mobile verification status
      userAPI.getMobileVerificationStatus().then(res => {
        const status = res?.verification || res?.data?.verification || null;
        if (status && status.status === 'APPROVED') {
          // User is verified, update the completed status
          setLocalUserData(prev => ({ ...prev, mobileVerified: true }));
        }
      }).catch(() => {});
    }
  }, [showMobileModal]);

  // Poll for status changes when modal is open
  useEffect(() => {
    if (!showMobileModal) return;
    
    let lastStatus = null;
    
    const fetchStatus = () => {
      userAPI.getMobileVerificationStatus().then(res => {
        const status = res?.verification || res?.data?.verification || null;
        
        if (initialLoadRef.current) {
          lastStatus = status?.status || null;
          initialLoadRef.current = false;
          if (status?.mobile) setMobileNumber(status.mobile);
          if (status && ['PENDING', 'OTP_SENT', 'OTP_REQUESTED', 'OTP_SUBMITTED'].includes(status.status)) {
            setMobileStatus(status);
          }
          return;
        }
        
        if (userClosedPopup) return;
        
        console.log('Status check - current:', status?.status, 'last:', lastStatus);
        
        // Mark mobile as verified when approved
        if (status && status.status === 'APPROVED') {
          console.log('Status is APPROVED, closing modal...');
          setLocalUserData(prev => ({ ...prev, mobileVerified: true }));
          setMobileStatus(null);
          setUserClosedPopup(false);
          setShowMobileModal(false);
          onClose();
          return;
        }
        
        // Show pending statuses
        if (status && ['PENDING', 'OTP_SENT', 'OTP_REQUESTED', 'OTP_SUBMITTED'].includes(status.status)) {
          setMobileStatus(status);
          if (status.mobile) setMobileNumber(status.mobile);
        }
        
        lastStatus = status?.status || null;
      }).catch(() => {});
    };
    
    fetchStatus();
    const interval = setInterval(fetchStatus, 2000);
    return () => clearInterval(interval);
  }, [showMobileModal, userClosedPopup, onClose]);

  const incompleteTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);
  const totalReward = upiRewardAmount + bankRewardAmount + telegramRewardAmount + whatsappRewardAmount;
  const earnedReward = completedTasks.reduce((sum, t) => sum + t.reward, 0);

  const handleComplete = (task) => {
    if (task.id === 'mobile_verification') {
      setShowMobileVerifyModal(true);
    } else if (task.id === 'upi' || task.id === 'whatsapp') {
      onClose();
      navigate(task.path);
    }
  };

  const handleStartMobileVerification = () => {
    setShowMobileVerifyModal(false);
    setShowMobileModal(true);
  };

  const handleRequestOtp = async () => {
    console.log('handleRequestOtp called, mobileNumber:', mobileNumber);
    if (!mobileNumber || mobileNumber.length !== 10) {
      setMobileError('Please enter valid 10-digit mobile number');
      return;
    }
    setMobileError('');
    setRequestingOtp(true);
    try {
      console.log('Calling requestMobileOtp API with:', mobileNumber);
      const res = await userAPI.requestMobileOtp(mobileNumber);
      console.log('requestMobileOtp response:', res);
      setMobileStatus({ status: 'PENDING', mobile: mobileNumber });
      setVerificationMessage('Request submitted.');
    } catch (err) {
      console.error('requestMobileOtp error:', err);
      setMobileError(err.message || err?.response?.data?.error || 'Failed to submit');
    } finally {
      setRequestingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length === 0) {
      setMobileError('Please enter OTP');
      return;
    }
    setMobileError('');
    setVerifying(true);
    try {
      await userAPI.submitMobileOtp(otp);
      setVerificationMessage('OTP submitted!');
      setOtp('');
    } catch (err) {
      setMobileError(err.message || 'Invalid OTP');
    } finally {
      setVerifying(false);
    }
  };

  const handleCancel = async () => {
    try {
      await userAPI.cancelMobileVerification();
    } catch (e) {}
    setShowMobileModal(false);
    setMobileNumber('');
    setOtp('');
    setOtpSent(false);
    setMobileStatus(null);
    setVerificationMessage('');
    setUserClosedPopup(false);
  };

  if (showMobileVerifyModal) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
        <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] rounded-2xl sm:rounded-3xl p-4 sm:p-6 w-full max-w-md border border-red-500/30">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl flex items-center justify-center">
                <FaMobileAlt className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-white">Mobile Verification</h2>
                <p className="text-red-400 text-xs sm:text-sm">Important Warning</p>
              </div>
            </div>
            <button onClick={() => setShowMobileVerifyModal(false)} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
              <FaTimes className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          <div className="bg-red-500/10 border border-red-500/30 rounded-xl sm:rounded-2xl p-4 mb-4">
            <p className="text-red-400 text-sm font-medium mb-2">⚠️ Warning / चेतावनी</p>
            <p className="text-white text-sm mb-2">If your number is not verified by Jex Pay, you will NOT be able to buy J-Token!</p>
            <p className="text-gray-400 text-sm">यदि आपका नंबर Jex Pay द्वारा वेरिफाई नहीं किया जाएगा, तो आप J-Token खरीदने में सक्षम नहीं होंगे!</p>
          </div>

          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl sm:rounded-2xl p-3 sm:p-4 mb-4">
            <p className="text-yellow-400 text-xs sm:text-sm font-medium">
              Submit your number for verification to become a verified member
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setShowMobileVerifyModal(false)}
              className="flex-1 py-3 bg-gray-600 text-white font-bold rounded-xl"
            >
              Cancel
            </button>
            <button
              onClick={handleStartMobileVerification}
              className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-bold rounded-xl"
            >
              Verify Number
            </button>
          </div>

          {telegramSupportUrl && (
            <div className="mt-4 pt-4 border-t border-gray-700">
              <p className="text-gray-400 text-xs text-center mb-2">Need help? Contact on Telegram</p>
              <a
                href={telegramSupportUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-2 bg-[#229ED9] text-white font-medium rounded-xl hover:bg-[#1a8cc8]"
              >
                <FaTelegram className="w-5 h-5" />
                Contact Support
              </a>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (showMobileModal) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
        <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] rounded-2xl sm:rounded-3xl p-4 sm:p-6 w-full max-w-md border border-blue-500/30">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
                <FaMobileAlt className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-white">Mobile Verification</h2>
                <p className="text-blue-400 text-xs sm:text-sm">Reward: ₹{telegramRewardAmount}</p>
              </div>
            </div>
            <button onClick={handleCancel} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
              <FaTimes className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl sm:rounded-2xl p-3 sm:p-4 mb-3 sm:mb-4">
            <p className="text-yellow-400 text-xs sm:text-sm font-medium">
              ⚠️ Please complete mobile verification to become a verified user
            </p>
          </div>

          {!mobileStatus ? (
            <>
              <div className="mb-3 sm:mb-4">
                <label className="block text-gray-400 text-xs sm:text-sm mb-2">Mobile Number</label>
                <input
                  type="tel"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="Enter 10-digit mobile number"
                  className="w-full px-4 sm:px-5 py-3 sm:py-4 bg-[#0a0a0a] border border-[#2a2a2a] rounded-xl sm:rounded-2xl text-white text-sm sm:text-base focus:border-blue-500 focus:outline-none"
                  maxLength={10}
                  disabled={requestingOtp}
                />
              </div>
              {mobileError && <p className="text-red-400 text-xs sm:text-sm mb-3 sm:mb-4">{mobileError}</p>}
              <button
                onClick={handleRequestOtp}
                disabled={requestingOtp || !mobileNumber}
                className="w-full py-2.5 sm:py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-bold rounded-xl text-sm sm:text-base disabled:opacity-50"
              >
                {requestingOtp ? 'Submitting...' : 'Submit for Verification'}
              </button>
            </>
          ) : (mobileStatus.status === 'PENDING' || mobileStatus.status === 'OTP_SENT') ? (
            <div className="text-center py-4 sm:py-6">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <FaMobileAlt className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-400" />
              </div>
              <p className="text-yellow-400 font-medium text-sm sm:text-base mb-2">Will be verified soon</p>
              <p className="text-white font-bold text-base sm:text-lg mb-2">+91 {mobileStatus.mobile}</p>
              <p className="text-gray-400 text-xs sm:text-sm">Please wait</p>
              <button
                onClick={handleCancel}
                className="mt-3 sm:mt-4 py-2 px-5 sm:px-6 bg-red-600/20 text-red-400 rounded-xl font-medium text-sm hover:bg-red-600/30"
              >
                Cancel Request
              </button>
            </div>
          ) : mobileStatus.status === 'OTP_REQUESTED' ? (
            <>
              <div className="mb-3 sm:mb-4">
                <label className="block text-gray-400 text-xs sm:text-sm mb-2">Enter OTP</label>
                <input
                  type="tel"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Enter OTP"
                  className="w-full px-4 sm:px-5 py-3 sm:py-4 bg-[#0a0a0a] border border-[#2a2a2a] rounded-xl sm:rounded-2xl text-white text-sm sm:text-base focus:border-blue-500 focus:outline-none"
                  maxLength={6}
                />
              </div>
              {mobileError && <p className="text-red-400 text-xs sm:text-sm mb-3 sm:mb-4">{mobileError}</p>}
              {verificationMessage && <p className="text-green-400 text-xs sm:text-sm mb-3 sm:mb-4">{verificationMessage}</p>}
              <button
                onClick={handleVerifyOtp}
                disabled={verifying || !otp}
                className="w-full py-2.5 sm:py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-bold rounded-xl text-sm sm:text-base disabled:opacity-50"
              >
                {verifying ? 'Submitting...' : 'Submit OTP'}
              </button>
            </>
          ) : mobileStatus.status === 'OTP_SUBMITTED' ? (
            <div className="text-center py-4 sm:py-6">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <FaCheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400" />
              </div>
              <p className="text-blue-400 font-medium text-sm sm:text-base mb-2">OTP Submitted</p>
              <p className="text-gray-400 text-xs sm:text-sm">Waiting </p>
            </div>
          ) : null}

          <div className="flex gap-2 sm:gap-3 mt-3 sm:mt-4">
            <button onClick={handleCancel} className="flex-1 py-2 sm:py-2.5 bg-[#1a1a1a] text-gray-400 rounded-xl font-medium text-sm sm:text-base">
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (incompleteTasks.length === 0) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] rounded-3xl p-6 w-full max-w-md border border-[#D4AF37]/30">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-[#D4AF37] to-[#FFD700] rounded-full flex items-center justify-center mx-auto mb-4">
              <FaGift className="w-10 h-10 text-black" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">All Tasks Completed!</h2>
            <p className="text-gray-400 mb-4">You've earned ₹{earnedReward} in rewards</p>
            <div className="flex justify-center gap-2 mb-6">
              {completedTasks.map(t => (
                <div key={t.id} className={`${t.bgColor} p-2 rounded-xl`}>
                  {t.icon}
                </div>
              ))}
            </div>
            <button
              onClick={onClose}
              className="w-full py-3 bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black font-bold rounded-xl"
            >
              Continue to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] rounded-3xl p-6 w-full max-w-md border border-[#D4AF37]/30">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-[#D4AF37] to-[#FFD700] rounded-xl flex items-center justify-center">
              <FaGift className="w-6 h-6 text-black" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Complete Tasks</h2>
              <p className="text-[#D4AF37] text-sm">Earn ₹{totalReward} in rewards!</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
            <FaTimes className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="flex items-center gap-2 mb-6 bg-[#D4AF37]/10 p-3 rounded-xl">
          <div className="flex-1 bg-[#2a2a2a] rounded-full h-2">
            <div
              className="bg-gradient-to-r from-[#D4AF37] to-[#FFD700] h-2 rounded-full transition-all"
              style={{ width: `${(completedTasks.length / tasks.length) * 100}%` }}
            />
          </div>
          <span className="text-white text-sm font-bold">{completedTasks.length}/{tasks.length}</span>
        </div>

        <div className="space-y-3">
          {incompleteTasks.map(task => (
            <div
              key={task.id}
              className="bg-[#0a0a0a] rounded-2xl p-4 border border-[#2a2a2a] hover:border-[#D4AF37]/50 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${task.color} flex items-center justify-center ${task.textColor}`}>
                  {task.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-bold">{task.title}</h3>
                  <p className="text-gray-500 text-sm">{task.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-[#D4AF37] font-bold text-lg">+₹{task.reward}</p>
                </div>
              </div>
              <button
                onClick={() => handleComplete(task)}
                className={`w-full mt-3 py-3 bg-gradient-to-r ${task.color} text-white font-bold rounded-xl flex items-center justify-center gap-2`}
              >
                Complete Now
                <FaChevronRight className="w-4 h-4" />
              </button>
            </div>
          ))}

          {completedTasks.map(task => (
            <div
              key={task.id}
              className="bg-[#0a0a0a] rounded-2xl p-4 border border-green-500/30 opacity-60"
            >
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-xl ${task.bgColor} flex items-center justify-center ${task.textColor}`}>
                  <FaCheckCircle className="w-8 h-8" />
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-bold">{task.title}</h3>
                  <p className="text-green-400 text-sm">Completed! +₹{task.reward} earned</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-gradient-to-r from-[#D4AF37]/20 to-[#FFD700]/20 rounded-xl border border-[#D4AF37]/30">
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Total Earned</span>
            <span className="text-[#D4AF37] font-bold text-xl">₹{earnedReward} / ₹{totalReward}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RewardModal;