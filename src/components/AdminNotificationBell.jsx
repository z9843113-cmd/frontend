import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../services/api';

const LAST_IDS_KEY = 'admin_notification_ids';
const READ_IDS_KEY = 'admin_notification_read_ids';
const DISMISSED_IDS_KEY = 'admin_notification_dismissed_ids';

const playNotificationSound = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const context = new AudioContext();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(880, context.currentTime);
    oscillator.frequency.setValueAtTime(660, context.currentTime + 0.12);
    gain.gain.setValueAtTime(0.001, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.14, context.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.35);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + 0.35);
  } catch {
    // ignore audio issues
  }
};

const AdminNotificationBell = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState({ totalUnread: 0, items: [], unreadIds: [] });
  const initialized = useRef(false);

  const markAsRead = (ids) => {
    try {
      const previousRead = JSON.parse(localStorage.getItem(READ_IDS_KEY) || '[]');
      const nextRead = [...new Set([...previousRead, ...ids])];
      localStorage.setItem(READ_IDS_KEY, JSON.stringify(nextRead));
      setNotifications((prev) => ({ ...prev, unreadIds: [] }));
    } catch {
      setNotifications((prev) => ({ ...prev, unreadIds: [] }));
    }
  };

  const handleClearAll = () => {
    const allIds = notifications.items.map((item) => item.id);
    if (allIds.length === 0) return;
    try {
      localStorage.setItem(DISMISSED_IDS_KEY, JSON.stringify(allIds));
    } catch {
      // ignore storage issue
    }
    markAsRead(allIds);
    setNotifications({ totalUnread: 0, items: [], unreadIds: [] });
    setOpen(false);
  };

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await adminAPI.getNotifications();
        const data = res?.data || res || { totalUnread: 0, items: [] };
        const currentIds = (data.items || []).map((item) => item.id);
        const previousIds = JSON.parse(localStorage.getItem(LAST_IDS_KEY) || '[]');
        const readIds = JSON.parse(localStorage.getItem(READ_IDS_KEY) || '[]');
        const dismissedIds = JSON.parse(localStorage.getItem(DISMISSED_IDS_KEY) || '[]');
        const visibleItems = (data.items || []).filter((item) => !dismissedIds.includes(item.id));
        const visibleIds = visibleItems.map((item) => item.id);
        const unreadIds = visibleIds.filter((id) => !readIds.includes(id));

        if (initialized.current) {
          const hasNew = currentIds.some((id) => !previousIds.includes(id));
          if (hasNew && visibleIds.length > 0) {
            playNotificationSound();
            if ('Notification' in window && Notification.permission === 'granted') {
              const latest = visibleItems[0];
              new Notification(latest.title, { body: latest.description });
            }
          }
        } else {
          initialized.current = true;
          if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission().catch(() => {});
          }
        }

        localStorage.setItem(LAST_IDS_KEY, JSON.stringify(currentIds));
        setNotifications({ totalUnread: unreadIds.length, items: visibleItems, unreadIds });
      } catch {
        // keep silent in UI header
      }
    };

    fetchNotifications();
    const intervalId = setInterval(fetchNotifications, 8000);
    return () => clearInterval(intervalId);
  }, []);

  const handleToggleOpen = () => {
    setOpen((prev) => {
      const next = !prev;
      if (next && notifications.unreadIds.length > 0) {
        markAsRead(notifications.unreadIds);
      }
      return next;
    });
  };

  return (
    <div className="relative">
      <button onClick={handleToggleOpen} className="relative rounded-2xl bg-[#1a1a1a] p-3 text-white hover:bg-[#252525]">
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {notifications.totalUnread > 0 && <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">{notifications.totalUnread > 99 ? '99+' : notifications.totalUnread}</span>}
      </button>

      {open && (
        <>
          <button className="fixed inset-0 z-40 bg-black/40 sm:hidden" onClick={() => setOpen(false)} aria-label="Close notifications" />
          <div className="fixed left-4 right-4 top-20 z-50 max-h-[70vh] overflow-hidden rounded-3xl border border-[#2a2a2a] bg-[#0d0d0d] p-4 shadow-2xl shadow-black/50 sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-3 sm:max-h-none sm:w-[320px] sm:max-w-[calc(100vw-2rem)]">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Notifications</h3>
            <div className="flex items-center gap-2">
              {notifications.items.length > 0 && (
                <button onClick={handleClearAll} className="rounded-lg bg-[#1a1a1a] px-2 py-1 text-xs text-[#D4AF37] hover:bg-[#252525]">
                  Clear All
                </button>
              )}
              <span className="text-xs text-[#D4AF37]">{notifications.totalUnread} unread</span>
              <button onClick={() => setOpen(false)} className="rounded-lg bg-[#1a1a1a] px-2 py-1 text-xs text-gray-300 sm:hidden">Close</button>
            </div>
          </div>

          <div className="max-h-[58vh] space-y-2 overflow-y-auto sm:max-h-96">
            {notifications.items.length === 0 && (
              <div className="rounded-2xl bg-[#111] px-4 py-6 text-center text-sm text-gray-500">No new requests right now</div>
            )}

            {notifications.items.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  navigate(item.path);
                  setOpen(false);
                }}
                className={`w-full rounded-2xl border p-3 text-left hover:border-[#D4AF37]/40 ${notifications.unreadIds.includes(item.id) ? 'border-[#D4AF37]/40 bg-[#16120a]' : 'border-[#1d1d1d] bg-[#111]'}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-white">{item.title}</p>
                  <span className="text-[10px] uppercase tracking-[0.2em] text-[#D4AF37]">{item.type}</span>
                </div>
                <p className="mt-1 text-xs text-gray-400">{item.description}</p>
                <p className="mt-2 text-[11px] text-gray-500">{item.createdat ? new Date(item.createdat).toLocaleString() : 'Now'}</p>
              </button>
            ))}
          </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminNotificationBell;
