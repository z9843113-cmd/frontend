import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { userAPI, walletAPI } from '../../services/api';
import { useAuthStore } from '../../store';
import BottomNav from '../../components/BottomNav';

const Profile = () => {
  const { user, setUser, logout } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [supportLinks, setSupportLinks] = useState({ whatsappSupport: '', telegramSupport: '', telegramGroup: '' });
  const [searchParams] = useSearchParams();
  
  const [showTelegramModal, setShowTelegramModal] = useState(false);
  const [, setTelegramStep] = useState(1);
  const [, setTelegramKey] = useState('');
  const [telegramInput, setTelegramInput] = useState('');
  const [, setGeneratingKey] = useState(false);
  const [bindingTelegram, setBindingTelegram] = useState(false);
  
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinStep, setPinStep] = useState(1);
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [settingPin, setSettingPin] = useState(false);
  
  const [showMobileModal, setShowMobileModal] = useState(false);
  const [mobileInput, setMobileInput] = useState('');
  const [bindingMobile, setBindingMobile] = useState(false);
  
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [whatsappInput, setWhatsappInput] = useState('');
  const [bindingWhatsApp, setBindingWhatsApp] = useState(false);
  
  const [wallet, setWallet] = useState(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    const telegramKeyFromUrl = searchParams.get('telegram_key');
    if (telegramKeyFromUrl) {
      setTelegramInput(telegramKeyFromUrl);
      setShowTelegramModal(true);
      setTelegramStep(2);
    }
    fetchData();
  }, [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchData = async () => {
    try {
      const [profileRes, supportRes, walletRes] = await Promise.all([
        userAPI.getProfile(),
        userAPI.getSupportLinks(),
        walletAPI.getWallet()
      ]);
      setUser(profileRes?.data || profileRes || null);
      setSupportLinks(supportRes?.data || supportRes || { whatsappSupport: '', telegramSupport: '', telegramGroup: '' });
      setWallet(walletRes?.data || walletRes || null);
    } catch {
      console.error('Failed to load profile page');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const _handleGenerateTelegramKey = async () => {
    setGeneratingKey(true);
    try {
      const data = await userAPI.generateTelegramKey();
      const key = data?.key || data?.data?.key;
      if (key) {
        setTelegramKey(key);
        setTelegramStep(2);
      }
    } catch (err) {
      setMessage(err?.message || 'Failed to generate key');
    } finally {
      setGeneratingKey(false);
    }
  };

  const handleVerifyTelegramKey = async () => {
    if (!telegramInput.trim()) {
      setMessage('Please enter the verification key');
      return;
    }
    setBindingTelegram(true);
    try {
      const data = await userAPI.bindTelegram({ key: telegramInput.trim().toUpperCase() });
      const response = data?.data || data;
      setUser({ ...user, telegramId: 'bound' });
      setMessage(response.rewardGiven ? `Telegram bound! You received ₹${response.rewardAmount || 20} reward!` : 'Telegram bound successfully!');
      setTelegramInput('');
      setTelegramKey('');
      setTelegramStep(1);
      setShowTelegramModal(false);
      fetchData();
    } catch (err) {
      setMessage(err?.message || 'Failed to verify key');
    } finally {
      setBindingTelegram(false);
    }
  };

  const handleSetPin = async (e) => {
    e.preventDefault();
    
    if (!user?.hasPin) {
      if (newPin.length !== 4) {
        setMessage('PIN must be 4 digits');
        return;
      }
      if (newPin !== confirmPin) {
        setMessage('PINs do not match');
        return;
      }
      setSettingPin(true);
      setMessage('');
      try {
        await userAPI.setPin({ pin: newPin });
        setMessage('Transaction PIN set successfully!');
        setNewPin('');
        setConfirmPin('');
        fetchData();
        setShowPinModal(false);
      } catch (err) {
        setMessage(err.response?.data?.error || 'Failed to set PIN');
      } finally {
        setSettingPin(false);
      }
    } else {
      if (pinStep === 1) {
        setSettingPin(true);
        setMessage('');
        try {
          await userAPI.verifyPin({ pin: oldPin });
          setPinStep(2);
          setMessage('');
        } catch (err) {
          setMessage(err.response?.data?.error || 'Incorrect PIN');
        } finally {
          setSettingPin(false);
        }
      } else if (pinStep === 2) {
        if (newPin.length !== 4) {
          setMessage('PIN must be 4 digits');
          return;
        }
        setPinStep(3);
        setMessage('');
      } else if (pinStep === 3) {
        if (newPin !== confirmPin) {
          setMessage('PINs do not match');
          return;
        }
        setSettingPin(true);
        setMessage('');
        try {
          await userAPI.setPin({ pin: newPin });
          setMessage('Transaction PIN changed successfully!');
          setOldPin('');
          setNewPin('');
          setConfirmPin('');
          setPinStep(1);
          fetchData();
          setShowPinModal(false);
        } catch (err) {
          setMessage(err.response?.data?.error || 'Failed to set PIN');
        } finally {
          setSettingPin(false);
        }
      }
    }
  };

  const handleBindMobile = async () => {
    if (!mobileInput.trim()) {
      setMessage('Please enter mobile number');
      return;
    }
    setBindingMobile(true);
    setMessage('');
    try {
      const data = await userAPI.bindMobile({ mobile: mobileInput.trim() });
      const response = data || {};
      setMessage(response.rewardGiven ? `Phone number added! You received ₹${response.rewardAmount || 10} reward!` : 'Phone number updated!');
      setMobileInput('');
      setShowMobileModal(false);
      fetchData();
    } catch (err) {
      setMessage(err.message || 'Failed to bind phone');
    } finally {
      setBindingMobile(false);
    }
  };

  const handleBindWhatsApp = async () => {
    if (!whatsappInput.trim()) {
      setMessage('Please enter WhatsApp number');
      return;
    }
    setBindingWhatsApp(true);
    setMessage('');
    try {
      const data = await userAPI.bindWhatsApp({ whatsappnumber: whatsappInput.trim() });
      const response = data || {};
      setMessage(response.rewardGiven ? `WhatsApp bound! You received ₹${response.rewardAmount || 20} reward!` : 'WhatsApp number updated!');
      setWhatsappInput('');
      setShowWhatsAppModal(false);
      fetchData();
    } catch (err) {
      setMessage(err.message || 'Failed to bind WhatsApp');
    } finally {
      setBindingWhatsApp(false);
    }
  };

  const menuItems = [
    { icon: 'M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z', label: 'Home', path: '/home' },
    { icon: 'M3 10h18M5 10l7-7 7 7M13 21l7-7 7 7', label: 'Buy', path: '/buy' },
    { icon: 'M19 14l-7 7m0 0l-7-7m7 7V3', label: 'Sell', path: '/sell' },
    { icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z', label: 'Account', path: '/manage-account' },
    { icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z', label: 'Team', path: '/team' },
    { icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z', label: 'Profile', path: '/profile' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] p-5 font-['Ubuntu',sans-serif]">
        <div className="animate-pulse space-y-5">
          <div className="h-12 w-32 bg-[#1a1a1a] rounded-2xl"></div>
          <div className="h-48 bg-[#1a1a1a] rounded-3xl"></div>
          <div className="h-32 bg-[#1a1a1a] rounded-3xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] pb-24 lg:pb-8 font-['Ubuntu',sans-serif]">
      {showTelegramModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => { setShowTelegramModal(false); setTelegramStep(1); setTelegramKey(''); setTelegramInput(''); }}>
          <div className="bg-[#0d0d0d] border border-[#2a2a2a] rounded-3xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Bind Telegram</h3>
              <button onClick={() => { setShowTelegramModal(false); setTelegramStep(1); setTelegramKey(''); setTelegramInput(''); }} className="p-2 rounded-xl bg-[#1a1a1a] hover:bg-[#252525]">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                </svg>
              </div>
              <h3 className="text-white font-bold text-xl mb-2">Connect Telegram</h3>
              <p className="text-gray-400 text-sm mb-6">Get ₹20 reward by connecting your Telegram account</p>
              
              <button 
                onClick={() => {
                  const botUsername = supportLinks.telegramSupport?.replace('https://t.me/', '') || 'zcryptoauthbot';
                  window.open(`https://t.me/${botUsername}`, '_blank');
                }}
                className="w-full py-4 bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-bold rounded-2xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2 mb-4"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                </svg>
                Open Telegram Bot
              </button>
              
              <div className="bg-[#0a0a0a] rounded-2xl p-4 mb-4">
                <h4 className="text-white font-semibold mb-2">How it works:</h4>
                <ol className="text-gray-400 text-sm text-left space-y-1">
                  <li>1. Open Telegram Bot above</li>
                  <li>2. Send /start or /bind</li>
                  <li>3. Enter your registered email</li>
                  <li>4. Bot will give you a verification key</li>
                  <li>5. Paste the key below</li>
                </ol>
              </div>
              
              <div className="mb-4">
                <input
                  type="text"
                  value={telegramInput}
                  onChange={(e) => setTelegramInput(e.target.value.toUpperCase())}
                  placeholder="Paste verification key here"
                  className="w-full px-5 py-4 bg-[#0a0a0a] border border-[#2a2a2a] rounded-2xl text-white placeholder-gray-500 focus:border-[#D4AF37] focus:outline-none font-mono text-center"
                />
              </div>
              
              <button 
                onClick={handleVerifyTelegramKey}
                disabled={bindingTelegram || !telegramInput.trim()}
                className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] transition-all"
              >
                {bindingTelegram ? 'Verifying...' : 'Verify & Bind (+₹20)'}
              </button>
              
              {message && (
                <p className={`mt-4 text-sm ${message.includes('success') || message.includes('bound') ? 'text-green-400' : 'text-red-400'}`}>
                  {message}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {showPinModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => { setShowPinModal(false); setOldPin(''); setNewPin(''); setConfirmPin(''); setPinStep(1); setMessage(''); }}>
          <div className="bg-[#0d0d0d] border border-[#2a2a2a] rounded-3xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">
                {!user?.hasPin ? 'Set Transaction PIN' : pinStep === 1 ? 'Change PIN' : pinStep === 2 ? 'New PIN' : 'Confirm New PIN'}
              </h3>
              <button onClick={() => { setShowPinModal(false); setOldPin(''); setNewPin(''); setConfirmPin(''); setPinStep(1); setMessage(''); }} className="p-2 rounded-xl bg-[#1a1a1a] hover:bg-[#252525]">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              {!user?.hasPin 
                ? 'Set a 4-digit PIN for secure SELL transactions.' 
                : pinStep === 1 
                  ? 'Enter your current PIN to continue.'
                  : pinStep === 2
                  ? 'Enter your new 4-digit PIN.'
                  : 'Enter your new PIN again to confirm.'}
            </p>
            
            {message && (
              <div className={`mb-4 px-4 py-2 rounded-xl ${message.includes('success') || message.includes('changed') || message.includes('set') ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                {message}
              </div>
            )}

            <form onSubmit={handleSetPin} className="space-y-4">
              {(!user?.hasPin || (user?.hasPin && pinStep === 1)) && (
                <div>
                  <label className="text-gray-400 text-sm mb-2 block">
                    {!user?.hasPin ? 'Enter 4-digit PIN' : 'Current PIN'}
                  </label>
                  <input
                    type="password"
                    value={!user?.hasPin ? newPin : oldPin}
                    onChange={(e) => !user?.hasPin ? setNewPin(e.target.value.replace(/\D/g, '').slice(0, 4)) : setOldPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    placeholder="****"
                    maxLength={4}
                    className="w-full px-5 py-4 bg-[#0a0a0a] border border-[#2a2a2a] rounded-2xl text-white placeholder-gray-500 focus:border-[#D4AF37] focus:outline-none text-2xl font-mono tracking-widest text-center"
                  />
                </div>
              )}

              {user?.hasPin && pinStep === 2 && (
                <div>
                  <label className="text-gray-400 text-sm mb-2 block">New PIN</label>
                  <input
                    type="password"
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    placeholder="****"
                    maxLength={4}
                    className="w-full px-5 py-4 bg-[#0a0a0a] border border-[#2a2a2a] rounded-2xl text-white placeholder-gray-500 focus:border-[#D4AF37] focus:outline-none text-2xl font-mono tracking-widest text-center"
                  />
                </div>
              )}

              {!user?.hasPin && (
                <div>
                  <label className="text-gray-400 text-sm mb-2 block">Confirm PIN</label>
                  <input
                    type="password"
                    value={confirmPin}
                    onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    placeholder="****"
                    maxLength={4}
                    className="w-full px-5 py-4 bg-[#0a0a0a] border border-[#2a2a2a] rounded-2xl text-white placeholder-gray-500 focus:border-[#D4AF37] focus:outline-none text-2xl font-mono tracking-widest text-center"
                  />
                </div>
              )}

              {user?.hasPin && pinStep === 3 && (
                <div>
                  <label className="text-gray-400 text-sm mb-2 block">Confirm New PIN</label>
                  <input
                    type="password"
                    value={confirmPin}
                    onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    placeholder="****"
                    maxLength={4}
                    className="w-full px-5 py-4 bg-[#0a0a0a] border border-[#2a2a2a] rounded-2xl text-white placeholder-gray-500 focus:border-[#D4AF37] focus:outline-none text-2xl font-mono tracking-widest text-center"
                  />
                </div>
              )}

              {!user?.hasPin && (
                <button 
                  type="submit"
                  disabled={settingPin || newPin.length !== 4 || confirmPin.length !== 4}
                  className="w-full py-4 bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black font-bold rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] transition-all"
                >
                  {settingPin ? 'Setting PIN...' : 'Set PIN'}
                </button>
              )}

              {user?.hasPin && pinStep === 1 && (
                <button 
                  type="submit"
                  disabled={settingPin || oldPin.length !== 4}
                  className="w-full py-4 bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black font-bold rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] transition-all"
                >
                  {settingPin ? 'Verifying...' : 'Continue'}
                </button>
              )}

              {user?.hasPin && pinStep === 2 && (
                <button 
                  type="submit"
                  disabled={settingPin || newPin.length !== 4}
                  className="w-full py-4 bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black font-bold rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] transition-all"
                >
                  Continue
                </button>
              )}

              {user?.hasPin && pinStep === 3 && (
                <button 
                  type="submit"
                  disabled={settingPin || confirmPin.length !== 4}
                  className="w-full py-4 bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black font-bold rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] transition-all"
                >
                  {settingPin ? 'Changing PIN...' : 'Change PIN'}
                </button>
              )}
            </form>
          </div>
        </div>
      )}

      {showMobileModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => { setShowMobileModal(false); setMobileInput(''); setMessage(''); }}>
          <div className="bg-[#0d0d0d] border border-[#2a2a2a] rounded-3xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Bind Phone Number</h3>
              <button onClick={() => { setShowMobileModal(false); setMobileInput(''); setMessage(''); }} className="p-2 rounded-xl bg-[#1a1a1a] hover:bg-[#252525]">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <h4 className="text-white font-bold text-lg mb-2">Get ₹10 Reward!</h4>
              <p className="text-gray-400 text-sm">Bind your phone number and get instant reward</p>
            </div>
            
            {message && (
              <div className={`mb-4 px-4 py-2 rounded-xl ${message.includes('success') || message.includes('reward') || message.includes('added') ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                {message}
              </div>
            )}

            <div className="mb-4">
              <label className="text-gray-400 text-sm mb-2 block">Enter Phone Number</label>
              <input
                type="tel"
                value={mobileInput}
                onChange={(e) => setMobileInput(e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder="10 digit mobile number"
                maxLength={10}
                className="w-full px-5 py-4 bg-[#0a0a0a] border border-[#2a2a2a] rounded-2xl text-white placeholder-gray-500 focus:border-[#D4AF37] focus:outline-none text-lg text-center"
              />
            </div>
            
            <button 
              onClick={handleBindMobile}
              disabled={bindingMobile || mobileInput.length !== 10}
              className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] transition-all"
            >
              {bindingMobile ? 'Binding...' : 'Bind & Get ₹10'}
            </button>
          </div>
        </div>
      )}

      {showWhatsAppModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => { setShowWhatsAppModal(false); setWhatsappInput(''); setMessage(''); }}>
          <div className="bg-[#0d0d0d] border border-[#2a2a2a] rounded-3xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Bind WhatsApp</h3>
              <button onClick={() => { setShowWhatsAppModal(false); setWhatsappInput(''); setMessage(''); }} className="p-2 rounded-xl bg-[#1a1a1a] hover:bg-[#252525]">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-[#25D366]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-[#25D366]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m7.616-5.503c-.225-.95-.769-1.692-1.386-2.396-.344-.39-.615-.538-.928-.607-.316-.069-.64-.052-.919-.023-.28.034-.683.14-.994.46-.297.298-.497.636-.597.96-.104.333-.104.707 0 1.04.05.2.02.4-.013.597-.1.594-.314 1.193-.616 1.703-.297.498-.626.908-.966 1.237-.34.33-.697.555-1.124.683-.43.128-1.035.157-1.58.08-.546-.077-1.034-.283-1.487-.617-.454-.334-.836-.73-1.17-1.192l-.39-.534c-.16-.245-.272-.396-.398-.536-.124-.139-.224-.252-.308-.334-.17-.152-.344-.28-.518-.373-.349-.173-.716-.264-1.075-.264-.36 0-.71.058-1.037.174-.327.116-.62.29-.878.522l-.686.617c-.226.198-.391.443-.49.723-.098.28-.127.56-.088.826.04.267.136.517.284.74.148.223.34.416.567.573.227.157.48.278.748.36.268.082.548.139.835.169.287.03.573.04.857.03.285-.01.567-.04.844-.09.278-.05.552-.117.82-.202.27-.084.533-.185.788-.303.256-.117.502-.253.737-.406.236-.153.46-.325.672-.515l.556-.504c.2-.182.416-.35.647-.504.23-.154.472-.29.724-.406.25-.117.513-.215.787-.296.274-.08.56-.14.848-.18.287-.04.577-.06.867-.06.29 0 .578.018.864.053.286.036.57.09.85.162.28.073.556.163.825.27.27.108.536.232.797.374.26.14.515.298.74.465.226.166.437.352.632.558.196.207.374.425.534.654.16.229.293.472.399.728.105.256.181.52.226.791.046.272.067.545.064.817-.004.273-.03.543-.077.809-.047.266-.117.527-.209.782-.092.256-.205.507-.338.752-.134.245-.287.485-.459.72-.171.235-.36.464-.567.687-.206.223-.43.44-.671.65-.24.21-.497.413-.768.608-.272.195-.558.383-.856.562-.3.18-.61.35-.931.512-.322.162-.653.313-.992.454-.34.141-.683.271-1.03.391-.346.12-.693.229-1.04.328-.348.1-.694.19-1.038.269-.345.08-.686.15-1.024.21-.338.06-.67.11-.996.15-.326.04-.644.07-.96.09-.315.02-.622.03-.92.03-.298 0-.59-.01-.873-.03-.283-.02-.558-.05-.824-.09l-.532-.08c-.267-.05-.525-.1-.774-.16-.249-.06-.49-.12-.72-.19-.23-.07-.453-.14-.668-.22-.215-.08-.423-.17-.624-.27-.2-.1-.395-.21-.582-.33-.187-.12-.366-.25-.538-.39-.172-.14-.336-.29-.492-.45-.156-.16-.304-.32-.443-.48-.14-.16-.27-.33-.393-.5-.124-.17-.238-.34-.344-.52-.105-.18-.2-.36-.286-.55-.086-.19-.162-.39-.228-.6-.066-.21-.121-.42-.167-.64-.046-.22-.08-.44-.105-.66-.025-.22-.04-.44-.045-.66-.004-.22.01-.44.045-.66.035-.22.08-.43.135-.64.056-.21.121-.42.195-.62.074-.2.158-.4.251-.59.093-.19.196-.38.308-.56.111-.18.232-.36.362-.53.13-.17.269-.33.418-.48.15-.15.308-.29.476-.42.168-.13.345-.25.53-.36.185-.11.38-.21.583-.3.204-.09.416-.17.636-.24.22-.07.448-.13.683-.18.235-.05.478-.09.728-.12.25-.03.507-.05.771-.06.264-.01.526-.01.786 0 .26.01.518.03.772.06.254.03.505.07.752.12.247.05.49.11.728.18.238.07.47.15.697.24.227.09.447.19.66.3.213.11.42.23.618.36.2.13.39.27.57.42.18.15.35.31.503.48.154.17.298.35.43.54.133.19.255.39.366.6.11.21.21.42.3.64.09.22.17.44.239.66.07.22.128.44.174.66.046.22.08.44.103.66.023.22.034.44.034.66 0 .22-.01.43-.03.65-.02.22-.05.43-.08.64-.03.21-.07.42-.11.62-.04.2-.09.4-.15.6-.05.2-.11.39-.18.58-.07.19-.14.37-.22.55-.08.18-.17.36-.27.53-.09.17-.2.34-.3.5-.1.16-.21.32-.33.48-.12.16-.24.31-.37.46-.13.15-.27.29-.41.43-.14.14-.29.27-.44.4-.15.13-.3.26-.46.38-.16.12-.32.24-.49.35-.17.11-.34.22-.52.32-.18.1-.37.2-.56.29-.19.09-.38.17-.58.25-.2.08-.4.15-.61.22-.21.07-.42.13-.64.19-.22.06-.44.11-.66.16-.22.05-.44.09-.66.13-.22.04-.44.07-.66.09-.22.02-.44.04-.65.05-.21.01-.42.02-.62.02-.2 0-.41-.01-.61-.02-.2-.01-.4-.02-.59-.04-.19-.02-.38-.04-.57-.07-.19-.03-.37-.06-.55-.09-.18-.03-.36-.07-.53-.11-.17-.04-.34-.08-.5-.13-.16-.05-.32-.1-.47-.15-.15-.05-.3-.11-.44-.17-.14-.06-.28-.12-.41-.19-.13-.07-.26-.14-.38-.21-.12-.07-.24-.15-.35-.23-.11-.08-.22-.16-.32-.25-.1-.09-.2-.18-.29-.28-.09-.1-.18-.2-.26-.31-.08-.11-.16-.22-.23-.34-.07-.12-.14-.24-.19-.37-.05-.13-.1-.26-.14-.4-.04-.14-.07-.28-.1-.42-.03-.14-.05-.28-.07-.43-.02-.15-.03-.3-.04-.45-.01-.15-.02-.3-.02-.46 0-.15.01-.3.02-.46.01-.15.02-.3.04-.45.02-.15.04-.3.06-.45.02-.15.05-.3.08-.45.03-.15.06-.3.1-.45.04-.15.08-.29.12-.44.04-.15.09-.29.14-.43.05-.14.1-.28.16-.42.06-.14.12-.28.18-.41.06-.13.13-.27.2-.4.07-.13.14-.26.22-.38.08-.12.16-.24.25-.36.09-.12.18-.24.28-.35.1-.11.2-.22.31-.33.11-.11.22-.21.34-.31.12-.1.24-.2.37-.29.13-.09.26-.18.4-.26.14-.08.28-.16.43-.23.15-.07.3-.14.46-.2.16-.06.32-.12.49-.17.17-.05.35-.1.53-.15.18-.05.36-.09.55-.13.19-.04.38-.08.57-.11.19-.03.39-.06.58-.09.2-.03.39-.05.59-.07.2-.02.4-.04.6-.05.2-.01.41-.02.61-.02.2 0 .41.01.61.02.2.01.4.02.6.04.2.02.4.04.59.07.19.03.38.06.56.1.18.04.36.08.53.13.17.05.34.1.5.16.16.06.31.12.46.19.15.07.29.14.43.21.14.07.27.15.39.24.12.09.24.18.35.27.11.1.22.2.31.31.1.11.19.22.28.34.09.12.17.24.24.37.07.13.13.26.18.4.05.14.09.28.12.43.03.15.05.3.06.46.01.16.02.32.02.48v1.2c0 .16-.01.32-.02.48-.01.16-.03.32-.06.46-.03.15-.07.29-.12.43-.05.14-.11.27-.18.4-.07.13-.15.25-.24.37-.09.12-.19.23-.28.34-.1.11-.21.21-.31.31-.1.11-.24.21-.35.27-.11.1-.27.18-.39.24-.12.09-.29.15-.43.21-.14.07-.31.12-.46.19-.15.06-.33.11-.5.16-.17.05-.36.09-.53.13-.18.04-.37.08-.55.13-.18.03-.37.07-.54.11-.17.04-.35.08-.52.13-.17.05-.34.1-.5.16-.16.06-.32.12-.47.19-.15.07-.3.14-.44.22-.14.08-.28.16-.41.25-.13.09-.26.18-.38.28-.12.1-.24.21-.35.33-.11.12-.22.24-.32.37-.1.13-.2.26-.29.4-.09.14-.17.28-.25.43-.08.15-.15.31-.21.47-.06.16-.11.32-.16.49-.05.17-.09.34-.12.52-.03.18-.05.36-.07.55-.02.19-.03.38-.04.57v.24c.01.19.02.38.04.57.02.19.04.37.07.55.03.18.06.36.1.53.04.17.08.34.13.5.05.16.1.32.16.47.06.15.12.3.19.44.07.14.14.28.22.41.08.13.16.26.25.38.09.12.18.24.28.35.1.11.2.22.31.32.11.1.22.2.34.29.12.09.24.18.37.26.13.08.26.16.4.23.14.07.28.14.43.2.15.06.31.12.47.17.16.05.32.1.49.14.17.04.34.08.52.12.18.04.36.07.55.1.19.03.38.05.58.07.2.02.4.04.6.05.2.01.41.02.62.02z"/>
                </svg>
              </div>
              <h4 className="text-white font-bold text-lg mb-2">Get ₹20 Reward!</h4>
              <p className="text-gray-400 text-sm">Bind your WhatsApp number and get instant reward</p>
            </div>
            
            {message && (
              <div className={`mb-4 px-4 py-2 rounded-xl ${message.includes('success') || message.includes('reward') || message.includes('bound') ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                {message}
              </div>
            )}

            <div className="mb-4">
              <label className="text-gray-400 text-sm mb-2 block">Enter WhatsApp Number</label>
              <input
                type="tel"
                value={whatsappInput}
                onChange={(e) => setWhatsappInput(e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder="10 digit WhatsApp number"
                maxLength={10}
                className="w-full px-5 py-4 bg-[#0a0a0a] border border-[#2a2a2a] rounded-2xl text-white placeholder-gray-500 focus:border-[#D4AF37] focus:outline-none text-lg text-center"
              />
            </div>
            
            <button 
              onClick={handleBindWhatsApp}
              disabled={bindingWhatsApp || whatsappInput.length !== 10}
              className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] transition-all"
            >
              {bindingWhatsApp ? 'Binding...' : 'Bind & Get ₹20'}
            </button>
          </div>
        </div>
      )}

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
          <h1 className="text-xl font-bold text-white">Profile</h1>
          <button onClick={handleLogout} className="p-3 rounded-2xl bg-red-500/20 hover:bg-red-500/30 transition-colors">
            <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>

      <div className="p-5 space-y-5 max-w-2xl mx-auto">
        {message && !showPinModal && (
          <div className={`px-5 py-3 rounded-2xl ${message.includes('success') ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
            {message}
          </div>
        )}

        <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] rounded-3xl p-6 border border-[#2a2a2a]">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-r from-[#D4AF37] to-[#FFD700] flex items-center justify-center">
              <span className="text-black text-2xl font-bold">{user?.email?.charAt(0).toUpperCase()}</span>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-white mb-1">{user?.name || 'User'}</h3>
              <p className="text-gray-400 text-sm">{user?.email ? user.email.replace(/(.{2})(.*)(@.*)/, '$1***$3') : ''}</p>
              {user?.id && (
                <div className="flex items-center gap-2 mt-2">
                  <p className="text-gray-500 text-xs font-mono">{user.id.slice(0, 8)}...</p>
                  <button 
                    onClick={() => { navigator.clipboard.writeText(user.id); setMessage('ID copied!'); setTimeout(() => setMessage(''), 2000); }}
                    className="p-1 bg-[#1a1a1a] hover:bg-[#252525] rounded text-gray-400 hover:text-[#D4AF37]"
                    title="Copy ID"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
              )}
              <span className="inline-block mt-2 px-3 py-1 bg-green-500/20 text-green-400 text-sm rounded-xl">
                {user?.isVerified ? 'Verified' : 'Unverified'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] rounded-3xl p-6 border border-[#2a2a2a]">
          <h3 className="text-lg font-bold text-white mb-4">Account Information</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-3 border-b border-[#2a2a2a]">
              <span className="text-gray-400">User ID</span>
              <span className="text-white font-mono text-sm">{user?.id?.slice(0, 8)}...</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-[#2a2a2a]">
              <span className="text-gray-400">Mobile</span>
              {user?.mobile ? (
                <span className="text-green-400 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  {user.mobile}
                </span>
              ) : (
                <button onClick={() => setShowMobileModal(true)} className="px-3 py-1 bg-green-500/20 text-green-400 rounded-lg text-sm hover:bg-green-500/30">
                  + Bind Number
                </button>
              )}
            </div>
            <div className="flex justify-between items-center py-3 border-b border-[#2a2a2a]">
              <span className="text-gray-400">Referral Code</span>
              <span className="text-[#D4AF37] font-mono font-bold">{user?.referralCode}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-[#2a2a2a]">
              <span className="text-gray-400">Telegram</span>
              <span className={user?.telegramId ? 'text-green-400' : 'text-gray-500'}>
                {user?.telegramId ? 'Connected' : 'Not connected'}
              </span>
            </div>
            <div className="flex justify-between items-center py-3">
              <span className="text-gray-400">WhatsApp</span>
              {user?.whatsappnumber ? (
                <span className="text-green-400 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  {user.whatsappnumber}
                </span>
              ) : (
                <button onClick={() => setShowWhatsAppModal(true)} className="px-3 py-1 bg-[#25D366]/20 text-[#25D366] rounded-lg text-sm hover:bg-[#25D366]/30">
                  + Bind Number
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] rounded-3xl p-6 border border-[#2a2a2a]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white">Balance & Actions</h3>
          </div>
          
            <div className="bg-gradient-to-r from-[#D4AF37]/10 to-[#FFD700]/10 rounded-2xl p-5 mb-5 border border-[#D4AF37]/20">
            <p className="text-gray-400 text-sm mb-1">Available Balance</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-white">₹{(parseFloat(wallet?.inrbalance) || 0).toFixed(2)}</span>
              <span className="text-gray-500 text-sm">INR</span>
            </div>
            <p className="text-gray-500 text-sm mt-2">≈ {(parseFloat(wallet?.usdtbalance) || 0).toFixed(4)} USDT @ ₹{wallet?.usdtrate || 83}</p>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <button 
              onClick={() => navigate('/deposit')}
              className="py-3 px-4 bg-green-500/20 hover:bg-green-500/30 text-green-400 font-semibold rounded-xl transition-all border border-green-500/20"
            >
              + Add Funds
            </button>
            <button 
              onClick={() => navigate('/withdraw')}
              className="py-3 px-4 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 font-semibold rounded-xl transition-all border border-blue-500/20"
            >
              Withdraw
            </button>
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] rounded-3xl p-6 border border-[#2a2a2a]">
          <h3 className="text-lg font-bold text-white mb-4">Account Settings</h3>
          <div className="grid grid-cols-1 gap-3">
            <button 
              onClick={() => setShowTelegramModal(true)}
              className="flex items-center gap-4 p-4 bg-[#0a0a0a] rounded-2xl border border-[#1a1a1a] hover:border-[#D4AF37]/50 transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                </svg>
              </div>
              <div className="flex-1 text-left">
                <p className="text-white font-medium">Bind Telegram</p>
                <p className="text-gray-500 text-sm">Connect Telegram for updates</p>
              </div>
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            <button 
              onClick={() => setShowWhatsAppModal(true)}
              className="flex items-center gap-4 p-4 bg-[#0a0a0a] rounded-2xl border border-[#1a1a1a] hover:border-[#25D366]/50 transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-[#25D366]/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-[#25D366]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m7.616-5.503c-.225-.95-.769-1.692-1.386-2.396-.344-.39-.615-.538-.928-.607-.316-.069-.64-.052-.919-.023-.28.034-.683.14-.994.46-.297.298-.497.636-.597.96-.104.333-.104.707 0 1.04.05.2.02.4-.013.597-.1.594-.314 1.193-.616 1.703-.297.498-.626.908-.966 1.237-.34.33-.697.555-1.124.683-.43.128-1.035.157-1.58.08-.546-.077-1.034-.283-1.487-.617-.454-.334-.836-.73-1.17-1.192l-.39-.534c-.16-.245-.272-.396-.398-.536-.124-.139-.224-.252-.308-.334-.17-.152-.344-.28-.518-.373-.349-.173-.716-.264-1.075-.264-.36 0-.71.058-1.037.174-.327.116-.62.29-.878.522l-.686.617c-.226.198-.391.443-.49.723-.098.28-.127.56-.088.826.04.267.136.517.284.74.148.223.34.416.567.573.227.157.48.278.748.36.268.082.548.139.835.169.287.03.573.04.857.03.285-.01.567-.04.844-.09.278-.05.552-.117.82-.202.27-.084.533-.185.788-.303.256-.117.502-.253.737-.406.236-.153.46-.325.672-.515l.556-.504c.2-.182.416-.35.647-.504.23-.154.472-.29.724-.406.25-.117.513-.215.787-.296.274-.08.56-.14.848-.18.287-.04.577-.06.867-.06.29 0 .578.018.864.053.286.036.57.09.85.162.28.073.556.163.825.27.27.108.536.232.797.374.26.14.515.298.74.465z"/>
                </svg>
              </div>
              <div className="flex-1 text-left">
                <p className="text-white font-medium">Bind WhatsApp</p>
                <p className="text-gray-500 text-sm">Connect WhatsApp for updates</p>
              </div>
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            <button 
              onClick={() => { setPinStep(1); setOldPin(''); setNewPin(''); setConfirmPin(''); setMessage(''); setShowPinModal(true); }}
              className="flex items-center gap-4 p-4 bg-[#0a0a0a] rounded-2xl border border-[#1a1a1a] hover:border-[#D4AF37]/50 transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div className="flex-1 text-left">
                <div className="flex items-center gap-2">
                  <p className="text-white font-medium">Transaction PIN</p>
                  {user?.hasPin && (
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${user?.pinEnabled ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                      {user?.pinEnabled ? 'Enabled' : 'Disabled'}
                    </span>
                  )}
                </div>
                <p className="text-gray-500 text-sm">{user?.hasPin ? 'Required for SELL transactions' : 'Set a PIN to secure transactions'}</p>
              </div>
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {user?.hasPin && (
              <div className="flex items-center justify-between p-4 bg-[#0a0a0a] rounded-2xl border border-[#1a1a1a]">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-white font-medium">PIN Protection</p>
                    <p className="text-gray-500 text-sm">Require PIN for SELL</p>
                  </div>
                </div>
                <button
                  onClick={async () => {
                    try {
                      const newEnabled = !user?.pinEnabled;
                      await userAPI.setPinEnabled({ enabled: newEnabled });
                      const profileRes = await userAPI.getProfile();
                      setUser(profileRes);
                      setMessage(newEnabled ? 'PIN protection enabled!' : 'PIN protection disabled');
                    } catch (err) {
                      setMessage(err.message || 'Failed to update');
                    }
                  }}
                  className={`relative w-14 h-8 rounded-full transition-colors ${user?.pinEnabled ? 'bg-green-500' : 'bg-gray-600'}`}
                >
                  <span className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-transform ${user?.pinEnabled ? 'left-7' : 'left-1'}`} />
                </button>
              </div>
            )}

          </div>
        </div>

        <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] rounded-3xl p-6 border border-[#2a2a2a]">
          <h3 className="text-lg font-bold text-white mb-4">Support</h3>
          <div className="grid grid-cols-1 gap-3">
            {supportLinks.whatsappSupport && (
              <a 
                href={supportLinks.whatsappSupport}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 bg-[#0a0a0a] rounded-2xl border border-[#1a1a1a] hover:border-[#25D366]/50 transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-[#25D366]/20 flex items-center justify-center">
                  <svg className="w-6 h-6 text-[#25D366]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m7.616-5.503c-.225-.95-.769-1.692-1.386-2.396-.344-.39-.615-.538-.928-.607-.316-.069-.64-.052-.919-.023-.28.034-.683.14-.994.46-.297.298-.497.636-.597.96-.104.333-.104.707 0 1.04.05.2.02.4-.013.597-.1.594-.314 1.193-.616 1.703-.297.498-.626.908-.966 1.237-.34.33-.697.555-1.124.683-.43.128-1.035.157-1.58.08-.546-.077-1.034-.283-1.487-.617-.454-.334-.836-.73-1.17-1.192l-.39-.534c-.16-.245-.272-.396-.398-.536-.124-.139-.224-.252-.308-.334-.17-.152-.344-.28-.518-.373-.349-.173-.716-.264-1.075-.264-.36 0-.71.058-1.037.174-.327.116-.62.29-.878.522l-.686.617c-.226.198-.391.443-.49.723-.098.28-.127.56-.088.826.04.267.136.517.284.74.148.223.34.416.567.573.227.157.48.278.748.36.268.082.548.139.835.169.287.03.573.04.857.03.285-.01.567-.04.844-.09.278-.05.552-.117.82-.202.27-.084.533-.185.788-.303.256-.117.502-.253.737-.406.236-.153.46-.325.672-.515l.556-.504c.2-.182.416-.35.647-.504.23-.154.472-.29.724-.406.25-.117.513-.215.787-.296.274-.08.56-.14.848-.18.287-.04.577-.06.867-.06.29 0 .578.018.864.053.286.036.57.09.85.162.28.073.556.163.825.27.27.108.536.232.797.374.26.14.515.298.763.473.248.175.488.366.718.574.23.208.447.43.65.665.026.03.052.061.078.092.133.16.24.32.323.48.083.16.14.328.17.5.03.174.04.35.03.527-.01.176-.038.353-.082.528z"/>
                  </svg>
                </div>
                <div className="flex-1 text-left">
                  <p className="text-white font-medium">WhatsApp Support</p>
                  <p className="text-gray-500 text-sm">Chat with us on WhatsApp</p>
                </div>
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            )}

            {supportLinks.telegramSupport && (
              <a 
                href={supportLinks.telegramSupport}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 bg-[#0a0a0a] rounded-2xl border border-[#1a1a1a] hover:border-[#0088cc]/50 transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-[#0088cc]/20 flex items-center justify-center">
                  <svg className="w-6 h-6 text-[#0088cc]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                  </svg>
                </div>
                <div className="flex-1 text-left">
                  <p className="text-white font-medium">Telegram Support</p>
                  <p className="text-gray-500 text-sm">Chat with us on Telegram</p>
                </div>
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            )}

            {supportLinks.telegramGroup && (
              <a 
                href={supportLinks.telegramGroup}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 bg-[#0a0a0a] rounded-2xl border border-[#1a1a1a] hover:border-[#E91E63]/50 transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-[#E91E63]/20 flex items-center justify-center">
                  <svg className="w-6 h-6 text-[#E91E63]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                  </svg>
                </div>
                <div className="flex-1 text-left">
                  <p className="text-white font-medium">Telegram Group</p>
                  <p className="text-gray-500 text-sm">Join our community</p>
                </div>
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            )}

            {!supportLinks.whatsappSupport && !supportLinks.telegramSupport && !supportLinks.telegramGroup && (
              <p className="text-gray-500 text-center py-4">No support links configured</p>
            )}
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Profile;
