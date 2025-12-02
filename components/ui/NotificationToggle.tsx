'use client';

import { useState, useEffect } from 'react';
import { Bell, BellOff } from 'lucide-react';
import { notificationsService } from '@/lib/services/notifications.service';

export default function NotificationToggle() {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    console.log('🔔 NotificationToggle mounted');
    checkNotificationStatus();
  }, []);

  const checkNotificationStatus = async () => {
    console.log('🔍 Checking notification status...');
    setIsLoading(true);
    
    const supported = notificationsService.isSupported();
    console.log('   - Supported:', supported);
    setIsSupported(supported);

    if (supported) {
      const perm = notificationsService.getPermission();
      console.log('   - Permission:', perm);
      setPermission(perm);

      const subscribed = await notificationsService.isSubscribed();
      console.log('   - Subscribed:', subscribed);
      setIsSubscribed(subscribed);
    }

    setIsLoading(false);
    console.log('✅ Notification status check complete');
  };

  const handleToggle = async () => {
    if (isLoading) return;

    setIsLoading(true);

    try {
      if (isSubscribed) {
        // Відписатися
        const success = await notificationsService.unsubscribe();
        if (success) {
          setIsSubscribed(false);
          setPermission('default');
          alert('✅ Нотифікації вимкнено');
        } else {
          alert('❌ Не вдалося вимкнути нотифікації');
        }
      } else {
        // Підписатися
        console.log('Subscribing to notifications...');
        const success = await notificationsService.subscribe();
        console.log('Subscribe result:', success);
        
        if (success) {
          setIsSubscribed(true);
          setPermission('granted');
          alert('✅ Нотифікації увімкнено! Тепер ви будете отримувати сповіщення.');
        } else {
          const perm = notificationsService.getPermission();
          setPermission(perm);
          
          if (perm === 'denied') {
            alert('❌ Нотифікації заблоковані в налаштуваннях браузера. Будь ласка, дозвольте їх.');
          } else {
            alert('❌ Не вдалося підписатись на нотифікації. Спробуйте ще раз.');
          }
        }
      }
    } catch (error) {
      console.error('Error toggling notifications:', error);
      alert('❌ Помилка при зміні налаштувань нотифікацій');
    } finally {
      setIsLoading(false);
      await checkNotificationStatus(); // Перевіряємо статус після зміни
    }
  };

  const handleTestNotification = async () => {
    try {
      await notificationsService.sendTestNotification();
      alert('✅ Тестова нотифікація відправлена!');
    } catch (error) {
      alert('❌ Помилка відправки тестової нотифікації');
    }
  };

  if (!isSupported) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4">
        <p className="text-sm text-yellow-800">
          ⚠️ Ваш браузер не підтримує push-нотифікації
        </p>
      </div>
    );
  }

  if (permission === 'denied') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
        <p className="text-sm text-red-800 mb-2">
          🚫 Нотифікації заблоковані
        </p>
        <p className="text-xs text-red-600">
          Щоб увімкнути, дозвольте нотифікації в налаштуваннях браузера
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            {isSubscribed ? (
              <Bell className="w-5 h-5 text-[#2466FF]" />
            ) : (
              <BellOff className="w-5 h-5 text-gray-400" />
            )}
            <div>
              <p className="text-sm font-semibold text-black">
                Push-нотифікації
              </p>
              <p className="text-xs text-gray-500">
                {isSubscribed 
                  ? 'Увімкнено - ви будете отримувати сповіщення' 
                  : 'Вимкнено - увімкніть щоб отримувати сповіщення'}
              </p>
            </div>
          </div>

          <button
            onClick={handleToggle}
            disabled={isLoading}
            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
              isSubscribed ? 'bg-[#2466FF]' : 'bg-gray-300'
            } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                isSubscribed ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <div className="text-xs text-gray-500 space-y-1">
          <p>• Відкриття нових модулів</p>
          <p>• Прямі ефіри та зустрічі</p>
          <p>• Перевірка домашніх завдань</p>
          <p>• Нові нагороди</p>
        </div>
      </div>

      {isSubscribed && (
        <button
          onClick={handleTestNotification}
          className="w-full px-4 py-3 bg-[#E9F0FF] text-[#2466FF] font-medium rounded-xl hover:bg-[#d4e4ff] transition-colors"
        >
          Відправити тестову нотифікацію 🔔
        </button>
      )}
    </div>
  );
}
