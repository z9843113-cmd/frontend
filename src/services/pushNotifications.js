import { useEffect } from 'react';
import { userAPI } from '../services/api';

const pushNotificationService = {
  subscription: null,
  
  async init() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.log('Push notifications not supported');
      return;
    }
    
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        console.log('Notification permission denied');
        return;
      }
      
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(await this.getPublicKey())
      });
      
      await userAPI.subscribePush(subscription);
      console.log('Push subscription successful');
    } catch (error) {
      console.log('Push subscription error:', error);
    }
  },
  
  async getPublicKey() {
    try {
      const res = await userAPI.getPushKey();
      return res.data?.publicKey || res.publicKey;
    } catch (error) {
      console.log('Error getting push key:', error);
      return null;
    }
  },
  
  urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  },
  
  async unsubscribe() {
    try {
      await userAPI.unsubscribePush();
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
      }
    } catch (error) {
      console.log('Unsubscribe error:', error);
    }
  }
};

export const usePushNotifications = () => {
  useEffect(() => {
    pushNotificationService.init();
  }, []);
  
  return pushNotificationService;
};

export default pushNotificationService;
