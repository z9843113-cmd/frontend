self.addEventListener('push', function(event) {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'JexPay';
  const options = {
    body: data.body || 'New notification',
    icon: '/jexpaylogo.png',
    badge: '/jexpaylogo.png',
    vibrate: [200, 100, 200],
    tag: 'jexpay-notification',
    renotify: true,
    data: { url: data.url || '/' }
  };
  
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url || '/')
  );
});