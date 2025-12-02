// Custom Service Worker для PWA з підтримкою Push Notifications

const CACHE_NAME = 'hogwarts-v1';
const urlsToCache = [
  '/',
  '/home',
  '/my-progress',
  '/favorites',
  '/modules',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

// Встановлення Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Opened cache');
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

// Активація Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch із стратегією Network First
self.addEventListener('fetch', (event) => {
  // Ігноруємо не-http(s) запити (наприклад chrome-extension://)
  if (!event.request.url.startsWith('http')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Клонуємо відповідь тільки якщо це успішна відповідь
        if (response && response.status === 200 && response.type === 'basic') {
          const responseToCache = response.clone();
          
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        
        return response;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});

// Push-нотифікації
self.addEventListener('push', (event) => {
  console.log('Push event received:', event);
  
  let notification = {
    title: 'Нова нотифікація',
    body: 'У вас є нове повідомлення',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    data: { url: '/home' },
  };

  if (event.data) {
    try {
      notification = event.data.json();
    } catch (e) {
      console.error('Failed to parse notification data:', e);
    }
  }

  event.waitUntil(
    self.registration.showNotification(notification.title, {
      body: notification.body,
      icon: notification.icon || '/icons/icon-192.png',
      badge: notification.badge || '/icons/icon-192.png',
      data: notification.data || {},
      actions: notification.actions || [],
      vibrate: [200, 100, 200],
      requireInteraction: false,
    })
  );
});

// Клік по нотифікації
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  
  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/home';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Перевіряємо чи вже відкрита вкладка
      for (const client of clientList) {
        if (client.url.includes(urlToOpen) && 'focus' in client) {
          return client.focus();
        }
      }
      
      // Відкриваємо нову вкладку
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Закриття нотифікації
self.addEventListener('notificationclose', (event) => {
  console.log('Notification closed:', event);
});
