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
      console.error('Push notifications are not supported');
      throw new Error('Push notifications are not supported');
    }

    console.log('🔔 Requesting notification permission...');
    console.log('Current permission:', Notification.permission);
    
    const permission = await Notification.requestPermission();
    console.log('Permission result:', permission);
    
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
    console.log('🔑 Fetching VAPID public key from:', `${API_URL}/notifications/vapid-public-key`);
    
    const response = await fetch(`${API_URL}/notifications/vapid-public-key`);
    if (!response.ok) {
      console.error('Failed to get VAPID public key:', response.status, response.statusText);
      throw new Error('Failed to get VAPID public key');
    }
    const data = await response.json();
    console.log('✅ VAPID public key received:', data.publicKey.substring(0, 20) + '...');
    return data.publicKey;
  },

  // Підписка на push-нотифікації
  async subscribe(): Promise<boolean> {
    try {
      // Перевіряємо підтримку
      if (!this.isSupported()) {
        console.error('Push notifications are not supported');
        return false;
      }

      // Запитуємо дозвіл
      const permission = await this.requestPermission();
      console.log('Notification permission:', permission);
      
      if (permission !== 'granted') {
        console.error('Notification permission denied');
        return false;
      }

      // Чекаємо на готовність Service Worker
      const registration = await navigator.serviceWorker.ready;
      console.log('Service Worker ready:', registration);

      // Отримуємо VAPID ключ
      const vapidPublicKey = await this.getVapidPublicKey();
      console.log('VAPID public key received');
      const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);

      // Підписуємось на push
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey as BufferSource,
      });
      console.log('Push subscription created:', subscription);

      // Відправляємо підписку на backend
      const response = await fetch(`${API_URL}/notifications/subscribe`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(subscription.toJSON()),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('Failed to save subscription:', error);
        return false;
      }

      const result = await response.json();
      console.log('Subscription saved:', result);
      return true;
    } catch (error) {
      console.error('Failed to subscribe:', error);
      return false;
    }
  },

  // Відписка від нотифікацій
  async unsubscribe(): Promise<boolean> {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        // Відписуємось локально
        await subscription.unsubscribe();
        console.log('Unsubscribed locally');

        // Видаляємо з backend
        const response = await fetch(`${API_URL}/notifications/unsubscribe`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        });

        if (!response.ok) {
          console.error('Failed to remove subscription from server');
          return false;
        }

        console.log('Subscription removed from server');
        return true;
      }

      console.log('No active subscription');
      return true;
    } catch (error) {
      console.error('Failed to unsubscribe:', error);
      return false;
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
