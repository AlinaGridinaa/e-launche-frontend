'use client';

import { useEffect, useRef } from 'react';
import { notificationsService } from '@/lib/services/notifications.service';

export function useAutoSubscribeNotifications() {
  const hasAttempted = useRef(false);

  useEffect(() => {
    // Виконуємо тільки один раз за сесію
    if (hasAttempted.current) return;
    hasAttempted.current = true;

    const autoSubscribe = async () => {
      try {
        // Перевіряємо чи підтримуються нотифікації
        if (!notificationsService.isSupported()) {
          console.log('📱 Notifications not supported');
          return;
        }

        // Перевіряємо чи вже є підписка
        const isSubscribed = await notificationsService.isSubscribed();
        if (isSubscribed) {
          console.log('✅ Already subscribed to notifications');
          return;
        }

        // Перевіряємо поточний дозвіл
        const permission = notificationsService.getPermission();
        
        // Якщо раніше заборонили - не питаємо знову
        if (permission === 'denied') {
          console.log('🚫 Notification permission denied');
          return;
        }

        // Якщо дозвіл вже є - підписуємось без запиту
        if (permission === 'granted') {
          console.log('🔔 Auto-subscribing with existing permission...');
          await notificationsService.subscribe();
          console.log('✅ Auto-subscribed to notifications');
          return;
        }

        // Якщо дозволу немає (default) - запитуємо його
        // Робимо невелику затримку, щоб не лякати користувача одразу після входу
        setTimeout(async () => {
          console.log('🔔 Requesting notification permission...');
          const success = await notificationsService.subscribe();
          if (success) {
            console.log('✅ Successfully subscribed to notifications');
          } else {
            console.log('❌ Failed to subscribe to notifications');
          }
        }, 3000); // Затримка 3 секунди після входу

      } catch (error) {
        console.error('Error during auto-subscribe:', error);
      }
    };

    // Чекаємо трохи після монтування компонента
    const timer = setTimeout(autoSubscribe, 1000);
    return () => clearTimeout(timer);
  }, []);
}
