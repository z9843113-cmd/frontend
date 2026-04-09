import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import PushNotificationInit from './components/PushNotificationInit';
import ForcedLogoutCheck from './components/ForcedLogoutCheck';

import Login from './pages/user/Login';
import Register from './pages/user/Register';
import ForgotPassword from './pages/user/ForgotPassword';
import ResetPassword from './pages/user/ResetPassword';
import Home from './pages/user/Home';
import Exchange from './pages/user/Exchange';
import ManageAccount from './pages/user/ManageAccount';
import Team from './pages/user/Team';
import Profile from './pages/user/Profile';
import Withdraw from './pages/user/Withdraw';
import Deposit from './pages/user/Deposit';
import Wallet from './pages/user/Wallet';
import CryptoRates from './pages/user/CryptoRates';
import BuyJToken from './pages/user/BuyJToken';

import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminActiveUsers from './pages/admin/AdminActiveUsers';
import AdminDeposits from './pages/admin/AdminDeposits';
import AdminWithdrawals from './pages/admin/AdminWithdrawals';
import AdminExchange from './pages/admin/AdminExchange';
import AdminUpiApps from './pages/admin/AdminUpiApps';
import AdminCrypto from './pages/admin/AdminCrypto';
import AdminSettings from './pages/admin/AdminSettings';
import AdminSubadmins from './pages/admin/AdminSubadmins';
import AdminManagers from './pages/admin/AdminManagers';
import AdminJToken from './pages/admin/AdminJToken';
import AdminJTokenHistory from './pages/admin/AdminJTokenHistory';
import AdminJTokenRequests from './pages/admin/AdminJTokenRequests';
import AdminUpiVerifications from './pages/admin/AdminUpiVerifications';
import AdminMobileVerifications from './pages/admin/AdminMobileVerifications';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <main>
        <div className="p-0 lg:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <PushNotificationInit />
      <ForcedLogoutCheck />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        
        {/* USER ROUTES */}
        <Route path="/home" element={
          <ProtectedRoute>
            <Layout><Home /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/dashboard" element={<Navigate to="/home" replace />} />
        <Route path="/exchange" element={
          <ProtectedRoute>
            <Layout><Exchange /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/manage-account" element={
          <ProtectedRoute>
            <Layout><ManageAccount /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/team" element={
          <ProtectedRoute>
            <Layout><Team /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <Layout><Profile /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/withdraw" element={
          <ProtectedRoute>
            <Layout><Withdraw /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/deposit" element={
          <ProtectedRoute>
            <Layout><Deposit /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/wallet" element={
          <ProtectedRoute>
            <Layout><Wallet /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/buy-jtoken" element={
          <ProtectedRoute>
            <Layout><BuyJToken /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/crypto-rates" element={
          <ProtectedRoute>
            <Layout><CryptoRates /></Layout>
          </ProtectedRoute>
        } />

        {/* ADMIN/MANAGER ROUTES */}
        <Route path="/admin/dashboard" element={
          <ProtectedRoute roles={['ADMIN', 'MANAGER']}>
            <Layout><AdminDashboard /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/admin/users" element={
          <ProtectedRoute roles={['ADMIN', 'MANAGER']}>
            <Layout><AdminUsers /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/admin/active-users" element={
          <ProtectedRoute roles={['ADMIN', 'MANAGER']}>
            <Layout><AdminActiveUsers /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/admin/deposits" element={
          <ProtectedRoute roles={['ADMIN', 'MANAGER']}>
            <Layout><AdminDeposits /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/admin/withdrawals" element={
          <ProtectedRoute roles={['ADMIN', 'MANAGER']}>
            <Layout><AdminWithdrawals /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/admin/upi-apps" element={
          <ProtectedRoute roles={['ADMIN']}>
            <Layout><AdminUpiApps /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/admin/upi-verifications" element={
          <ProtectedRoute roles={['ADMIN', 'MANAGER']}>
            <Layout><AdminUpiVerifications /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/admin/mobile-verifications" element={
          <ProtectedRoute roles={['ADMIN', 'MANAGER']}>
            <Layout><AdminMobileVerifications /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/admin/crypto" element={
          <ProtectedRoute roles={['ADMIN']}>
            <Layout><AdminCrypto /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/admin/jtoken" element={
          <ProtectedRoute roles={['ADMIN', 'MANAGER']}>
            <Layout><AdminJToken /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/admin/jtoken-history" element={
          <ProtectedRoute roles={['ADMIN', 'MANAGER']}>
            <Layout><AdminJTokenHistory /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/admin/jtoken-requests" element={
          <ProtectedRoute roles={['ADMIN', 'MANAGER']}>
            <Layout><AdminJTokenRequests /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/admin/exchange" element={
          <ProtectedRoute roles={['ADMIN', 'MANAGER']}>
            <Layout><AdminExchange /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/admin/settings" element={
          <ProtectedRoute roles={['ADMIN']}>
            <Layout><AdminSettings /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/admin/subadmins" element={
          <ProtectedRoute roles={['ADMIN']}>
            <Layout><AdminSubadmins /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/admin/managers" element={
          <ProtectedRoute roles={['ADMIN']}>
            <Layout><AdminManagers /></Layout>
          </ProtectedRoute>
        } />

        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
