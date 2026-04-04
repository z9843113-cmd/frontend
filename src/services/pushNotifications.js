import { useEffect } from 'react';
import { userAPI } from '../services/api';

const pushNotificationService = {
  subscription: null,
  retryCount: 0,
  
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
      
      console.log('[Push] Registering service worker...');
      const registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
      console.log('[Push] SW registered:', registration.scope);
      
      console.log('[Push] Waiting for SW to be ready...');
      await navigator.serviceWorker.ready;
      console.log('[Push] SW is ready');
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log('[Push] Getting existing subscription...');
      let subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        console.log('[Push] Already subscribed:', subscription.endpoint);
        this.subscription = subscription;
        try {
          await userAPI.subscribePush(subscription);
          console.log('[Push] Existing subscription saved to backend');
        } catch (e) {
          console.log('[Push] Could not save existing sub:', e.message);
        }
        return;
      }
      
      console.log('[Push] Getting VAPID public key...');
      const publicKey = await this.getPublicKey();
      if (!publicKey) {
        console.log('[Push] No public key, cannot subscribe');
        return;
      }
      
      console.log('[Push] Subscribing to push with key...');
      console.log('[Push] VAPID key length:', publicKey.length);
      
      try {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: this.urlBase64ToUint8Array(publicKey)
        });
        console.log('[Push] Subscription successful:', subscription.endpoint);
      } catch (subError) {
        console.log('[Push] Subscribe error:', subError.name, subError.message);
        
        if (this.retryCount < 2) {
          this.retryCount++;
          console.log('[Push] Retrying...', this.retryCount);
          await new Promise(resolve => setTimeout(resolve, 2000));
          subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: this.urlBase64ToUint8Array(publicKey)
          });
        } else {
          console.log('[Push] All retries failed, giving up');
          return;
        }
      }
      
      console.log('[Push] New subscription:', subscription.endpoint);
      this.subscription = subscription;
      
      await userAPI.subscribePush(subscription);
      console.log('[Push] Subscription saved to backend');
    } catch (error) {
      console.log('[Push] Final Error:', error.name, error.message);
      if (error.name === 'AbortError') {
        console.log('[Push] Push service not available on this device/browser');
      }
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
