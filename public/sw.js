/* Atur Pintar — Push Notification Service Worker */

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Handle incoming push
self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { title: 'Atur Pintar', body: event.data ? event.data.text() : '' };
  }

  const title = data.title || 'Atur Pintar';
  const options = {
    body: data.body || '',
    icon: data.icon || 'https://media.base44.com/images/public/69a82e8090f60786b869983c/d2e52bdf2_3.png',
    badge: data.badge || 'https://media.base44.com/images/public/69a82e8090f60786b869983c/d2e52bdf2_3.png',
    tag: data.tag || 'aturpintar-notif',
    renotify: data.renotify !== false,
    requireInteraction: data.requireInteraction === true,
    data: {
      url: data.url || '/Dashboard',
      ...(data.data || {}),
    },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Handle click on notification → focus/open app
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || '/Dashboard';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          client.postMessage({ type: 'navigate', url: targetUrl });
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
