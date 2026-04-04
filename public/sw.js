const CACHE_NAME = 'jexpay-v1';
const OFFLINE_URL = '/';

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll([OFFLINE_URL]);
    })
  );
});

self.addEventListener('push', function(event) {
  console.log('[SW] Push event received:', event);
  
  let data = { title: 'JexPay', body: 'New notification', url: '/' };
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    console.log('[SW] Error parsing push data:', e);
  }
  
  const title = data.title || 'JexPay';
  const options = {
    body: data.body || 'New notification',
    icon: '/jexpaylogo.png',
    badge: '/jexpaylogo.png',
    vibrate: [200, 100, 200],
    tag: 'jexpay-notification',
    renotify: true,
    data: { url: data.url || '/' },
    actions: [
      { action: 'open', title: 'Open App' }
    ]
  };
  
  console.log('[SW] Showing notification:', title, options);
  
  event.waitUntil(
    self.registration.showNotification(title, options).then(() => {
      console.log('[SW] Notification shown successfully');
    }).catch(err => {
      console.log('[SW] Error showing notification:', err);
    })
  );
});

self.addEventListener('notificationclick', function(event) {
  console.log('[SW] Notification clicked:', event);
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url || '/')
  );
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});