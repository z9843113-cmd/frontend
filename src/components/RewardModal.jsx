import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaWallet, FaUniversity, FaTelegramPlane, FaGift, FaTimes, FaCheckCircle, FaChevronRight, FaKey } from 'react-icons/fa';

const RewardModal = ({ onClose, userData, telegramBotUrl, rewardSettings }) => {
  const navigate = useNavigate();
  const [showTelegramInput, setShowTelegramInput] = useState(false);
  const [telegramKey, setTelegramKey] = useState('');

  const upiRewardAmount = parseFloat(rewardSettings?.upiRewardAmount) || 20;
  const bankRewardAmount = parseFloat(rewardSettings?.bankRewardAmount) || 20;
  const telegramRewardAmount = parseFloat(rewardSettings?.telegramRewardAmount) || 20;
  const whatsappRewardAmount = 5;

  const tasks = [
    {
      id: 'upi',
      icon: <FaWallet className="w-8 h-8" />,
      title: 'Add UPI Account',
      description: 'Link your UPI for instant deposits',
      reward: upiRewardAmount,
      completed: userData?.hasUPI || false,
      path: '/manage-account',
      color: 'from-green-500 to-emerald-600',
      bgColor: 'bg-green-500/20',
      textColor: 'text-green-400'
    },
    {
      id: 'whatsapp',
      icon: <span className="w-8 h-8 text-2xl">💬</span>,
      title: 'Bind WhatsApp',
      description: 'Enter your WhatsApp number',
      reward: whatsappRewardAmount,
      completed: userData?.whatsappbound || false,
      path: '/profile',
      color: 'from-green-400 to-emerald-500',
      bgColor: 'bg-green-400/20',
      textColor: 'text-green-400'
    },
    {
      id: 'telegram',
      icon: <FaTelegramPlane className="w-8 h-8" />,
      title: 'Connect Telegram',
      description: 'Get instant notifications',
      reward: telegramRewardAmount,
      completed: userData?.hasTelegram || false,
      color: 'from-purple-500 to-pink-600',
      bgColor: 'bg-purple-500/20',
      textColor: 'text-purple-400'
    }
  ];

  const incompleteTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);
  const totalReward = upiRewardAmount + bankRewardAmount + telegramRewardAmount + whatsappRewardAmount;
  const earnedReward = completedTasks.reduce((sum, t) => sum + t.reward, 0);

  const handleComplete = (task) => {
    if (task.id === 'telegram') {
      handleOpenTelegram();
    } else {
      onClose();
      navigate(task.path);
    }
  };

  const handleOpenTelegram = () => {
    const botUsername = telegramBotUrl?.replace('https://t.me/', '') || 'zcryptoauthbot';
    window.open(`https://t.me/${botUsername}`, '_blank');
    setShowTelegramInput(true);
  };

  const handleBindTelegram = () => {
    if (telegramKey.trim().length > 0) {
      onClose();
      navigate('/profile?telegram_key=' + encodeURIComponent(telegramKey.trim()));
    }
  };

  if (showTelegramInput) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] rounded-3xl p-6 w-full max-w-md border border-purple-500/30">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                <FaTelegramPlane className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Connect Telegram</h2>
                <p className="text-purple-400 text-sm">Enter your verification key</p>
              </div>
            </div>
            <button onClick={() => setShowTelegramInput(false)} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
              <FaTimes className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          <div className="bg-[#0a0a0a] rounded-2xl p-4 border border-[#2a2a2a] mb-4">
            <h3 className="text-white font-bold mb-2">How to bind Telegram:</h3>
            <ol className="text-gray-400 text-sm space-y-2">
              <li>1. Click "Open Telegram Bot" below</li>
              <li>2. Send /start to the bot</li>
              <li>3. Enter your registered email</li>
              <li>4. Bot will give you a verification key</li>
              <li>5. Copy & paste that key here</li>
              <li>6. Click "Bind Telegram" button</li>
            </ol>
          </div>

          <button
            onClick={handleOpenTelegram}
            className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 mb-4"
          >
            <FaTelegramPlane className="w-5 h-5" />
            Open Telegram Bot
            <FaChevronRight className="w-4 h-4" />
          </button>

          <div className="mb-4">
            <label className="block text-gray-400 text-sm mb-2">Verification Key (from bot)</label>
            <input
              type="text"
              value={telegramKey}
              onChange={(e) => setTelegramKey(e.target.value.toUpperCase())}
              placeholder="Paste key here (e.g., TGABC1234)"
              className="w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
            />
          </div>

          <button
            onClick={handleBindTelegram}
            disabled={telegramKey.trim().length === 0}
            className={`w-full py-3 font-bold rounded-xl flex items-center justify-center gap-2 ${
              telegramKey.trim().length > 0
                ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white'
                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
            }`}
          >
            <FaKey className="w-5 h-5" />
            Bind Telegram (+₹20)
          </button>
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
