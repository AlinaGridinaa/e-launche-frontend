const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}

// Конвертація base64 в Uint8Array для VAPID
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export const notificationsService = {
  // Перевірка підтримки нотифікацій
  isSupported(): boolean {
    return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
  },

  // Перевірка дозволу
  getPermission(): NotificationPermission {
    return Notification.permission;
  },

  // Запит дозволу
  async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported()) {
      throw new Error('Push notifications are not supported');
    }

    const permission = await Notification.requestPermission();
    return permission;
  },

  // Реєстрація Service Worker
  async registerServiceWorker(): Promise<ServiceWorkerRegistration> {
    if (!('serviceWorker' in navigator)) {
      throw new Error('Service Worker is not supported');
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw-custom.js', {
        scope: '/',
      });
      console.log('Service Worker registered:', registration);
      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      throw error;
    }
  },

  // Отримати VAPID публічний ключ
  async getVapidPublicKey(): Promise<string> {
    const response = await fetch(`${API_URL}/notifications/vapid-public-key`);
    if (!response.ok) {
      throw new Error('Failed to get VAPID public key');
    }
    const data = await response.json();
    return data.publicKey;
  },

  // Підписка на push-нотифікації
  async subscribe(): Promise<{ success: boolean; message: string }> {
    try {
      // Перевіряємо підтримку
      if (!this.isSupported()) {
        throw new Error('Push notifications are not supported');
      }

      // Запитуємо дозвіл
      const permission = await this.requestPermission();
      if (permission !== 'granted') {
        throw new Error('Notification permission denied');
      }

      // Реєструємо Service Worker
      const registration = await this.registerServiceWorker();

      // Отримуємо VAPID ключ
      const vapidPublicKey = await this.getVapidPublicKey();
      const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);

      // Підписуємось на push
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey as BufferSource,
      });

      // Відправляємо підписку на backend
      const response = await fetch(`${API_URL}/notifications/subscribe`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(subscription.toJSON()),
      });

      if (!response.ok) {
        throw new Error('Failed to save subscription');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Failed to subscribe:', error);
      throw error;
    }
  },

  // Відписка від нотифікацій
  async unsubscribe(): Promise<{ success: boolean; message: string }> {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        // Відписуємось локально
        await subscription.unsubscribe();

        // Видаляємо з backend
        const response = await fetch(`${API_URL}/notifications/unsubscribe`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        });

        if (!response.ok) {
          throw new Error('Failed to remove subscription from server');
        }

        return await response.json();
      }

      return { success: true, message: 'No active subscription' };
    } catch (error) {
      console.error('Failed to unsubscribe:', error);
      throw error;
    }
  },

  // Перевірка чи користувач підписаний
  async isSubscribed(): Promise<boolean> {
    try {
      if (!this.isSupported()) {
        return false;
      }

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      return subscription !== null;
    } catch (error) {
      console.error('Failed to check subscription:', error);
      return false;
    }
  },

  // Тестова нотифікація
  async sendTestNotification(): Promise<any> {
    const response = await fetch(`${API_URL}/notifications/test`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to send test notification');
    }

    return response.json();
  },
};
