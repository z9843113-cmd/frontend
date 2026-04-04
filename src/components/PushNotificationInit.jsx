import { useEffect } from 'react';
import pushNotificationService from '../services/pushNotifications';

const PushNotificationInit = () => {
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      console.log('[App] User logged in, initializing push...');
      setTimeout(() => {
        pushNotificationService.init();
      }, 2000);
    }
  }, []);
  
  return null;
};

export default PushNotificationInit;
