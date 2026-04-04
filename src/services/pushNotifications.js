import { useEffect } from 'react';
import { userAPI } from '../services/api';

const pushNotificationService = {
  subscription: null,
  
  async init() {
    console.log('[Push] Initializing push notifications...');
    
    if (!('serviceWorker' in navigator)) {
      console.log('[Push] Service workers not supported');
      return;
    }
    
    if (!('PushManager' in window)) {
      console.log('[Push] PushManager not supported');
      return;
    }
    
    try {
      console.log('[Push] Requesting notification permission...');
      const permission = await Notification.requestPermission();
      console.log('[Push] Permission:', permission);
      
      if (permission !== 'granted') {
        console.log('[Push] Notification permission not granted:', permission);
        return;
      }
      
      console.log('[Push] Getting service worker registration...');
      const registration = await navigator.serviceWorker.ready;
      console.log('[Push] SW ready, checking existing subscription...');
      
      const existingSub = await registration.pushManager.getSubscription();
      if (existingSub) {
        console.log('[Push] Already subscribed, using existing:', existingSub.endpoint);
        this.subscription = existingSub;
        return;
      }
      
      console.log('[Push] Getting VAPID public key...');
      const publicKey = await this.getPublicKey();
      if (!publicKey) {
        console.log('[Push] No public key, cannot subscribe');
        return;
      }
      
      console.log('[Push] Subscribing to push...');
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(publicKey)
      });
      
      console.log('[Push] New subscription:', subscription.endpoint);
      this.subscription = subscription;
      
      await userAPI.subscribePush(subscription);
      console.log('[Push] Subscription saved to backend');
    } catch (error) {
      console.log('[Push] Error:', error.message, error);
    }
  },
  
  async getPublicKey() {
    try {
      const res = await userAPI.getPushKey();
      const key = res.data?.publicKey || res.publicKey;
      console.log('[Push] Got public key:', key ? 'yes' : 'no');
      return key;
    } catch (error) {
      console.log('[Push] Error getting push key:', error.message);
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
      console.log('[Push] Unsubscribe error:', error);
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
