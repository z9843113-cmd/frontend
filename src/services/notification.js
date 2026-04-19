const NOTIFICATION_PERMISSION_KEY = 'notification_permission';

export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications');
    return false;
  }
  
  if (Notification.permission === 'granted') {
    return true;
  }
  
  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    localStorage.setItem(NOTIFICATION_PERMISSION_KEY, permission);
    return permission === 'granted';
  }
  
  return false;
};

export const getNotificationPermission = () => {
  if (!('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission;
};

export const showNotification = (title, options = {}) => {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return;
  }
  
  const defaultOptions = {
    icon: '/jexpaylogo.png',
    badge: '/jexpaylogo.png',
    vibrate: [200, 100, 200],
    tag: 'jexpay-notification',
    renotify: true,
    ...options
  };
  
  try {
    new Notification(title, defaultOptions);
  } catch (e) {
    console.log('Notification error:', e);
  }
};

export const playNotificationSound = () => {
  try {
    const audio = new Audio('/aabeyaar.mp3');
    audio.play().catch(() => {});
  } catch (e) {
    console.log('Audio play error:', e);
  }
};