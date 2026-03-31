import { create } from 'zustand';

const getStoredData = () => {
  try {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    return {
      token: token || null,
      user: userStr ? JSON.parse(userStr) : null
    };
  } catch {
    return { token: null, user: null };
  }
};

const storedData = getStoredData();

export const useAuthStore = create((set) => ({
  token: storedData.token,
  user: storedData.user,
  setUser: (user) => {
    localStorage.setItem('user', JSON.stringify(user));
    set({ user });
  },
  setToken: (token) => {
    localStorage.setItem('token', token);
    set({ token });
  },
  logout: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    set({ user: null, token: null });
  }
}));

export const useWalletStore = create((set) => ({
  wallet: null,
  setWallet: (wallet) => set({ wallet })
}));

export const useUIStore = create((set) => ({
  sidebarOpen: true,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen }))
}));
