import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store';
import { FaHome, FaExchangeAlt, FaUserCog, FaUsers, FaUserPlus, FaMoneyBillWave, FaCog, FaUserShield } from 'react-icons/fa';
import { IoWalletOutline } from 'react-icons/io5';

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();

  const userLinks = [
    { path: '/home', label: 'Home', Icon: FaHome },
    { path: '/exchange', label: 'Exchange', Icon: FaExchangeAlt },
    { path: '/manage-account', label: 'Account', Icon: IoWalletOutline },
    { path: '/team', label: 'Team', Icon: FaUsers },
    { path: '/profile', label: 'Profile', Icon: FaUserCog },
  ];

  const adminLinks = [
    { path: '/admin/dashboard', label: 'Home', Icon: FaHome },
    { path: '/admin/users', label: 'Users', Icon: FaUsers },
    { path: '/admin/deposits', label: 'Deposits', Icon: FaUserPlus },
    { path: '/admin/withdrawals', label: 'Withdraw', Icon: FaMoneyBillWave },
    { path: '/admin/settings', label: 'Settings', Icon: FaCog },
  ];

  const links = user?.role === 'ADMIN' || user?.role === 'SUBADMIN' ? adminLinks : userLinks;
  const currentIndex = links.findIndex(link => location.pathname === link.path);

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-[#0d0d0d] to-[#1a1a1a] backdrop-blur-2xl border-t border-[#D4AF37]/20 lg:hidden z-50">
      <div className="flex items-center justify-around py-2 px-1">
        {links.map((link, index) => (
          <button
            key={link.path}
            onClick={() => navigate(link.path)}
            className={`flex flex-col items-center gap-1 p-2 transition-all duration-200 ${index === currentIndex ? 'text-[#D4AF37] scale-105' : 'text-gray-500 hover:text-gray-300'}`}
          >
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-200 ${
              index === currentIndex 
                ? 'bg-gradient-to-br from-[#D4AF37]/30 to-[#FFD700]/10 shadow-lg shadow-[#D4AF37]/20' 
                : 'bg-[#1a1a1a] hover:bg-[#252525]'
            }`}>
              <link.Icon className={`w-5 h-5 ${index === currentIndex ? 'text-[#D4AF37]' : 'text-gray-400'}`} />
            </div>
            <span className="text-xs font-medium">{link.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
