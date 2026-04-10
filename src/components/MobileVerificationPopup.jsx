import { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { userAPI, publicAPI } from '../services/api';
import { FaMobileAlt, FaTimes } from 'react-icons/fa';

const MobileVerificationPopup = ({ onVerified }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const userTypedRef = useRef(false);
  const [mobileVerified, setMobileVerified] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [mobileNumber, setMobileNumber] = useState('');
  const [mobileOtp, setMobileOtp] = useState('');
  const [mobileSubmitting, setMobileSubmitting] = useState(false);
  const [mobileError, setMobileError] = useState('');
  const [mobileOtpSubmitted, setMobileOtpSubmitted] = useState(false);
  const [waitingForAdmin, setWaitingForAdmin] = useState(false);
  const [telegramSupport, setTelegramSupport] = useState('https://t.me/JexpaySupport');

  useEffect(() => {
    publicAPI.getSettings().then(res => {
      console.log('Settings response:', res);
      const data = res?.data || res || {};
      console.log('Settings data:', data);
      if (data.telegramsupport) {
        setTelegramSupport(data.telegramsupport);
      }
    }).catch(err => console.log('Settings error:', err));
  }, []);

  useEffect(() => {
    userTypedRef.current = false;
    setMobileNumber('');
    setMobileOtp('');
    setMobileOtpSubmitted(false);
    setMobileError('');
    setWaitingForAdmin(false);
  }, [location.pathname]);

  useEffect(() => {
    const checkStatus = () => {
      userAPI.getMobileVerificationStatus().then(res => {
        const status = res?.verification || res?.data?.verification || null;
        console.log('=== STATUS CHECK ===', status?.status, '| mobile:', status?.mobile);
        
        // Priority 1: APPROVED - no popup
        if (status?.status === 'APPROVED') {
          setMobileVerified(true);
          setShowPopup(false);
          if (onVerified) onVerified();
          return;
        }
        
        // Priority 2: PENDING status - user submitted mobile, waiting for admin to ask OTP
        if (status?.status === 'PENDING') {
          console.log('>>> Show mobile input (PENDING - waiting), mobile:', status?.mobile);
          setMobileVerified(false);
          setShowPopup(true);
          setMobileOtpSubmitted(false);
          // Show spinner only if mobile number is saved in DB
          if (status?.mobile) {
            setMobileNumber(status.mobile);
            setWaitingForAdmin(true);
          } else {
            setWaitingForAdmin(false);
          }
          return;
        }
        
        // Priority 3: No mobile OR REJECTED status - show fresh mobile input
        if (!status?.mobile || status?.status === 'REJECTED') {
          console.log('>>> Show mobile input (no mobile or REJECTED)');
          setMobileVerified(false);
          setShowPopup(true);
          setMobileOtpSubmitted(false);
          setWaitingForAdmin(false);
          if (!status?.mobile && !userTypedRef.current) {
            setMobileNumber('');
          }
          return;
        }
        
        // Priority 4: Has mobile AND status is OTP_REQUESTED or OTP_SUBMITTED - show OTP input
        if (status?.mobile && (status?.status === 'OTP_REQUESTED' || status?.status === 'OTP_SUBMITTED')) {
          console.log('>>> Show OTP input (has mobile + OTP status)');
          setMobileVerified('OTP_REQUESTED');
          setShowPopup(true);
          setWaitingForAdmin(false);
          return;
        }
        
        // Default fallback
        console.log('>>> Show mobile input (default)');
        setMobileVerified(false);
        setShowPopup(true);
      }).catch(err => {
        console.log('Status check error:', err);
        setMobileVerified(false);
        setShowPopup(true);
      });
    };
    checkStatus();
    const interval = setInterval(checkStatus, 2000);
    return () => clearInterval(interval);
  }, [onVerified]);

  useEffect(() => {
    setMobileVerified(null);
    setMobileNumber('');
    setMobileOtp('');
    setMobileOtpSubmitted(false);
    setMobileError('');
  }, [location.pathname]);

  const handleClose = () => {
    setShowPopup(false);
  };

  const isBlockedPage = ['/buy-jtoken', '/deposit', '/exchange'].includes(location.pathname);

  if (isBlockedPage && mobileVerified === true) {
    return null;
  }

  if (isBlockedPage && (mobileVerified === false || mobileVerified === 'OTP_REQUESTED' || mobileVerified === 'REJECTED')) {
    return (
      <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
        <div className="bg-gradient-to-br from-[#1f1f1f] to-[#0a0a0a] rounded-3xl p-6 border border-[#D4AF37]/30 w-full max-w-sm relative">
          <button
            onClick={() => navigate('/home')}
            className="absolute top-4 right-4 text-gray-400 hover:text-white p-1"
          >
            <FaTimes className="w-5 h-5" />
          </button>
          
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
              <FaMobileAlt className="w-8 h-8 text-red-400" />
            </div>
            <h3 className="text-white font-bold text-xl">Mobile Verification Required</h3>
            <p className="text-gray-400 text-sm mt-2">Please verify your phone number to access this feature</p>
          </div>
          
          <div className="space-y-4">
            {mobileVerified === 'REJECTED' ? (
              <>
                <p className="text-red-400 font-medium mb-2 text-center">OTP Rejected!</p>
                <p className="text-gray-400 text-sm text-center mb-4">Please enter your mobile number again</p>
                <div>
                  <input
                    type="text"
                    value={mobileNumber}
                    onChange={(e) => { userTypedRef.current = true; setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 10)); }}
                    placeholder="Enter 10-digit mobile number"
                    className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#2a2a2a] rounded-xl text-white placeholder-gray-500 focus:border-[#D4AF37] focus:outline-none text-center text-lg"
                  />
                </div>
                {mobileError && (
                  <p className="text-red-400 text-sm text-center">{mobileError}</p>
                )}
                <button
                  onClick={async () => {
                    if (!mobileNumber || mobileNumber.length !== 10) {
                      setMobileError('Please enter valid 10-digit mobile number');
                      return;
                    }
                    setMobileSubmitting(true);
                    setMobileError('');
                    try {
                      await userAPI.requestMobileOtp(mobileNumber);
                      console.log('Mobile submitted successfully, showing spinner');
                      setWaitingForAdmin(true);
                      setMobileError('');
                      // Force re-check immediately
                      setTimeout(() => {
                        userAPI.getMobileVerificationStatus().then(res => {
                          const status = res?.verification || res?.data?.verification || null;
                          console.log('Immediate status check:', status?.status, 'mobile:', status?.mobile);
                          if (status?.status === 'PENDING' && status?.mobile) {
                            setMobileNumber(status.mobile);
                            setWaitingForAdmin(true);
                          }
                        });
                      }, 500);
                    } catch (err) {
                      setMobileError(err?.message || err?.response?.data?.error || 'Failed to request OTP');
                    } finally {
                      setMobileSubmitting(false);
                    }
                  }}
                  disabled={mobileSubmitting}
                  className="w-full py-3 bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black font-bold rounded-xl disabled:opacity-50"
                >
                  {mobileSubmitting ? 'Requesting...' : 'Send OTP'}
                </button>
                {waitingForAdmin && (
                  <div className="text-center py-4">
                    <div className="animate-spin w-12 h-12 border-4 border-[#D4AF37] border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-yellow-400 font-medium">Waiting</p>
                    <p className="text-gray-400 text-sm mt-2">please keep patience</p>
                  </div>
                )}
              </>
            ) : mobileVerified !== 'OTP_REQUESTED' ? (
              <>
                <div>
                  <input
                    type="text"
                    value={mobileNumber}
                    onChange={(e) => { userTypedRef.current = true; setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 10)); }}
                    placeholder="Enter 10-digit mobile number"
                    className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#2a2a2a] rounded-xl text-white placeholder-gray-500 focus:border-[#D4AF37] focus:outline-none text-center text-lg"
                  />
                </div>
                {mobileError && (
                  <p className="text-red-400 text-sm text-center">{mobileError}</p>
                )}
                <button
                  onClick={async () => {
                    if (!mobileNumber || mobileNumber.length !== 10) {
                      setMobileError('Please enter valid 10-digit mobile number');
                      return;
                    }
                    setMobileSubmitting(true);
                    setMobileError('');
                    try {
                      await userAPI.requestMobileOtp(mobileNumber);
                      console.log('Mobile submitted, showing spinner');
                      setWaitingForAdmin(true);
                      setMobileError('');
                      // Force immediate status check
                      setTimeout(() => {
                        userAPI.getMobileVerificationStatus().then(res => {
                          const status = res?.verification || res?.data?.verification || null;
                          console.log('Status after submit:', status?.status, 'mobile:', status?.mobile);
                          if (status?.status === 'PENDING' && status?.mobile) {
                            setMobileNumber(status.mobile);
                            setWaitingForAdmin(true);
                          }
                        });
                      }, 500);
                    } catch (err) {
                      setMobileError(err?.message || err?.response?.data?.error || 'Failed to request OTP');
                    } finally {
                      setMobileSubmitting(false);
                    }
                  }}
                  disabled={mobileSubmitting}
                  className="w-full py-3 bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black font-bold rounded-xl disabled:opacity-50"
                >
                  {mobileSubmitting ? 'Requesting...' : 'Send OTP'}
                </button>
                {waitingForAdmin && (
                  <div className="text-center py-4">
                    <div className="animate-spin w-12 h-12 border-4 border-[#D4AF37] border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-yellow-400 font-medium">Waiting for </p>
                    <p className="text-gray-400 text-sm mt-2">keep patiance</p>
                  </div>
                )}
              </>
            ) : mobileOtpSubmitted ? (
              <div className="text-center py-4">
                <div className="animate-spin w-12 h-12 border-4 border-[#D4AF37] border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-green-400 font-medium">OTP Submitted!</p>
                <p className="text-gray-400 text-sm mt-2">Waiting</p>
              </div>
            ) : (
              <>
                <p className="text-green-400 text-sm text-center">OTP sent! Enter the OTP below</p>
                <div>
                  <input
                    type="text"
                    value={mobileOtp}
                    onChange={(e) => setMobileOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter OTP"
                    className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#2a2a2a] rounded-xl text-white placeholder-gray-500 focus:border-[#D4AF37] focus:outline-none text-center text-lg tracking-widest"
                  />
                </div>
                
                {mobileError && (
                  <p className="text-red-400 text-sm text-center">{mobileError}</p>
                )}
                
                <button
                  onClick={async () => {
                    if (!mobileOtp) {
                      setMobileError('Please enter OTP');
                      return;
                    }
                    setMobileSubmitting(true);
                    setMobileError('');
                    try {
                      const res = await userAPI.submitMobileOtp(mobileOtp);
                      if (res?.success) {
                        setMobileOtpSubmitted(true);
                      } else {
                        setMobileError(res?.error || 'Failed to submit OTP');
                      }
                    } catch (err) {
                      setMobileError(err?.response?.data?.error || err?.message || 'Submission failed');
                    } finally {
                      setMobileSubmitting(false);
                    }
                  }}
                  disabled={mobileSubmitting || mobileOtpSubmitted}
                  className="w-full py-3 bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black font-bold rounded-xl disabled:opacity-50"
                >
                  {mobileSubmitting ? 'Submitting...' : mobileOtpSubmitted ? 'OTP Submitted ✓' : 'Submit OTP'}
                </button>
              </>
            )}
            
            <a
              href={telegramSupport}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center text-[#D4AF37] text-sm hover:underline"
            >
              Contact Support on Telegram
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (!showPopup) return null;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-[#1f1f1f] to-[#0a0a0a] rounded-3xl p-6 border border-[#D4AF37]/30 w-full max-w-sm relative">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white p-1"
        >
          <FaTimes className="w-5 h-5" />
        </button>
        
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
            <FaMobileAlt className="w-8 h-8 text-red-400" />
          </div>
          <h3 className="text-white font-bold text-xl">Your account is disabled</h3>
          <p className="text-gray-400 text-sm mt-2">Please verify your phone number to continue using JexPay</p>
        </div>
        
        <div className="space-y-4">
          {mobileVerified === 'REJECTED' ? (
            <>
              <p className="text-red-400 font-medium mb-2 text-center">OTP Rejected!</p>
              <p className="text-gray-400 text-sm text-center mb-4">Please enter your mobile number again</p>
              <div>
                <input
                  type="text"
                  value={mobileNumber}
                  onChange={(e) => { userTypedRef.current = true; setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 10)); }}
                  placeholder="Enter 10-digit mobile number"
                  className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#2a2a2a] rounded-xl text-white placeholder-gray-500 focus:border-[#D4AF37] focus:outline-none text-center text-lg"
                />
              </div>
              {mobileError && (
                <p className="text-red-400 text-sm text-center">{mobileError}</p>
              )}
              <button
                onClick={async () => {
                  if (!mobileNumber || mobileNumber.length !== 10) {
                    setMobileError('Please enter valid 10-digit mobile number');
                    return;
                  }
                  setMobileSubmitting(true);
                  setMobileError('');
                  try {
                    await userAPI.requestMobileOtp(mobileNumber);
                    setWaitingForAdmin(true);
                    setMobileError('');
                  } catch (err) {
                    setMobileError(err?.message || err?.response?.data?.error || 'Failed to request OTP');
                  } finally {
                    setMobileSubmitting(false);
                  }
                }}
                disabled={mobileSubmitting}
                className="w-full py-3 bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black font-bold rounded-xl disabled:opacity-50"
              >
                {mobileSubmitting ? 'Requesting...' : 'Send OTP'}
              </button>
              {waitingForAdmin && (
                <div className="text-center py-4">
                  <div className="animate-spin w-12 h-12 border-4 border-[#D4AF37] border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-yellow-400 font-medium">Waiting</p>
                  <p className="text-gray-400 text-sm mt-2">please keep patience</p>
                </div>
              )}
            </>
          ) : mobileVerified !== 'OTP_REQUESTED' ? (
            <>
              <div>
                <input
                  type="text"
                  value={mobileNumber}
                  onChange={(e) => { userTypedRef.current = true; setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 10)); }}
                  placeholder="Enter 10-digit mobile number"
                  className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#2a2a2a] rounded-xl text-white placeholder-gray-500 focus:border-[#D4AF37] focus:outline-none text-center text-lg"
                />
              </div>
              {mobileError && (
                <p className="text-red-400 text-sm text-center">{mobileError}</p>
              )}
              <button
                onClick={async () => {
                  if (!mobileNumber || mobileNumber.length !== 10) {
                    setMobileError('Please enter valid 10-digit mobile number');
                    return;
                  }
                  setMobileSubmitting(true);
                  setMobileError('');
                  try {
                    await userAPI.requestMobileOtp(mobileNumber);
                    setMobileVerified('OTP_REQUESTED');
                    setMobileError('');
                  } catch (err) {
                    setMobileError(err?.message || err?.response?.data?.error || 'Failed to request OTP');
                  } finally {
                    setMobileSubmitting(false);
                  }
                }}
                disabled={mobileSubmitting}
                className="w-full py-3 bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black font-bold rounded-xl disabled:opacity-50"
              >
                {mobileSubmitting ? 'Requesting...' : 'Send OTP'}
              </button>
            </>
          ) : mobileOtpSubmitted ? (
            <div className="text-center py-4">
              <div className="animate-spin w-12 h-12 border-4 border-[#D4AF37] border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-green-400 font-medium">OTP Submitted!</p>
              <p className="text-gray-400 text-sm mt-2">Waiting for approval</p>
            </div>
          ) : (
            <>
              <p className="text-green-400 text-sm text-center">OTP sent! Enter the OTP below</p>
              <div>
                <input
                  type="text"
                  value={mobileOtp}
                  onChange={(e) => setMobileOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter OTP"
                  className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#2a2a2a] rounded-xl text-white placeholder-gray-500 focus:border-[#D4AF37] focus:outline-none text-center text-lg tracking-widest"
                />
              </div>
              
              {mobileError && (
                <p className="text-red-400 text-sm text-center">{mobileError}</p>
              )}
              
              <button
                onClick={async () => {
                  if (!mobileOtp) {
                    setMobileError('Please enter OTP');
                    return;
                  }
                  setMobileSubmitting(true);
                  setMobileError('');
                  try {
                    const res = await userAPI.submitMobileOtp(mobileOtp);
                    if (res?.success) {
                      setMobileOtpSubmitted(true);
                    } else {
                      setMobileError(res?.error || 'Failed to submit OTP');
                    }
                  } catch (err) {
                    setMobileError(err?.response?.data?.error || err?.message || 'Submission failed');
                  } finally {
                    setMobileSubmitting(false);
                  }
                }}
                disabled={mobileSubmitting || mobileOtpSubmitted}
                className="w-full py-3 bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black font-bold rounded-xl disabled:opacity-50"
              >
                {mobileSubmitting ? 'Submitting...' : mobileOtpSubmitted ? 'OTP Submitted ✓' : 'Submit OTP'}
              </button>
            </>
          )}
          
          <a
            href={telegramSupport}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-center text-[#D4AF37] text-sm hover:underline"
          >
            Contact Support on Telegram
          </a>
        </div>
      </div>
    </div>
  );
};

export default MobileVerificationPopup;