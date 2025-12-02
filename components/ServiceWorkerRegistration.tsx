'use client';

import { useEffect } from 'react';

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    console.log('🔧 ServiceWorkerRegistration component mounted');
    
    if (typeof window === 'undefined') {
      console.log('⚠️ Window is undefined, skipping SW registration');
      return;
    }

    if (!('serviceWorker' in navigator)) {
      console.warn('⚠️ Service Worker not supported in this browser');
      return;
    }

    console.log('🔍 Checking for existing Service Worker...');
    
    // Перевіряємо чи вже є зареєстрований Service Worker
    navigator.serviceWorker.getRegistration().then((existingReg) => {
      if (existingReg) {
        console.log('✅ Service Worker already registered:', existingReg);
        return;
      }

      console.log('📝 Registering new Service Worker...');
      
      // Реєструємо Service Worker
      navigator.serviceWorker
        .register('/sw-custom.js', {
          scope: '/',
        })
        .then((registration) => {
          console.log('✅ Service Worker registered successfully:', registration);
          console.log('   - Scope:', registration.scope);
          console.log('   - Active:', !!registration.active);
          console.log('   - Installing:', !!registration.installing);
          
          // Перевіряємо оновлення Service Worker
          registration.addEventListener('updatefound', () => {
            console.log('🔄 Service Worker update found');
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                console.log('🔄 Service Worker state changed:', newWorker.state);
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  console.log('✨ New Service Worker installed and ready');
                }
              });
            }
          });
        })
        .catch((error) => {
          console.error('❌ Service Worker registration failed:', error);
        });
    });

    // Слухаємо повідомлення від Service Worker
    navigator.serviceWorker.addEventListener('message', (event) => {
      console.log('📨 Message from Service Worker:', event.data);
      
      if (event.data && event.data.type === 'NOTIFICATION_CLICK') {
        const url = event.data.url;
        if (url) {
          window.location.href = url;
        }
      }
    });

    // Перевіряємо готовність Service Worker
    navigator.serviceWorker.ready.then((registration) => {
      console.log('🎉 Service Worker is ready!', registration);
    });
  }, []);

  return null;
}
