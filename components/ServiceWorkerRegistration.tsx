'use client';

import { useEffect } from 'react';

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      // Реєструємо Service Worker
      navigator.serviceWorker
        .register('/sw-custom.js')
        .then((registration) => {
          console.log('✅ Service Worker registered:', registration);
          
          // Перевіряємо оновлення Service Worker
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  console.log('🔄 New Service Worker available, please reload');
                }
              });
            }
          });
        })
        .catch((error) => {
          console.error('❌ Service Worker registration failed:', error);
        });

      // Слухаємо повідомлення від Service Worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        console.log('📨 Message from Service Worker:', event.data);
        
        if (event.data && event.data.type === 'NOTIFICATION_CLICK') {
          // Обробляємо клік по нотифікації
          const url = event.data.url;
          if (url) {
            window.location.href = url;
          }
        }
      });
    } else {
      console.warn('⚠️ Service Worker not supported in this browser');
    }
  }, []);

  return null; // Цей компонент нічого не рендерить
}
