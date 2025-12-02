'use client';

import { useState, useEffect } from 'react';
import { Bell, BellOff } from 'lucide-react';
import { notificationsService } from '@/lib/services/notifications.service';

export default function NotificationSettings() {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    checkSupport();
    checkSubscription();
  }, []);

  const checkSupport = () => {
    const supported = notificationsService.isSupported();
    setIsSupported(supported);
    if (supported) {
      setPermission(notificationsService.getPermission());
    }
  };

  const checkSubscription = async () => {
    try {
      const subscribed = await notificationsService.isSubscribed();
      setIsSubscribed(subscribed);
    } catch (error) {
      console.error('Failed to check subscription:', error);
    }
  };

  const handleSubscribe = async () => {
    setIsLoading(true);
    try {
      await notificationsService.subscribe();
      setIsSubscribed(true);
      setPermission('granted');
      alert('✅ Нотифікації увімкнено!');
    } catch (error: any) {
      console.error('Failed to subscribe:', error);
      alert('❌ Помилка: ' + (error.message || 'Не вдалося увімкнути нотифікації'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnsubscribe = async () => {
    setIsLoading(true);
    try {
      await notificationsService.unsubscribe();
      setIsSubscribed(false);
      alert('Нотифікації вимкнено');
    } catch (error: any) {
      console.error('Failed to unsubscribe:', error);
      alert('Помилка: ' + (error.message || 'Не вдалося вимкнути нотифікації'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestNotification = async () => {
    setIsLoading(true);
    try {
      await notificationsService.sendTestNotification();
      alert('✅ Тестову нотифікацію відправлено!');
    } catch (error: any) {
      console.error('Failed to send test notification:', error);
      alert('❌ Помилка: ' + (error.message || 'Не вдалося відправити тестову нотифікацію'));
    } finally {
      setIsLoading(false);
    }
  };

  if (!isSupported) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
        <p className="text-sm text-yellow-800">
          ⚠️ Ваш браузер не підтримує push-нотифікації
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            {isSubscribed ? (
              <Bell className="w-6 h-6 text-[#2466FF]" />
            ) : (
              <BellOff className="w-6 h-6 text-gray-400" />
            )}
            <div>
              <h3 className="text-base font-bold text-black">Push-нотифікації</h3>
              <p className="text-xs text-gray-500">
                {isSubscribed ? 'Увімкнено' : 'Вимкнено'}
              </p>
            </div>
          </div>
          
          <button
            onClick={isSubscribed ? handleUnsubscribe : handleSubscribe}
            disabled={isLoading}
            className={`px-4 py-2 rounded-xl font-medium text-sm transition-colors disabled:opacity-50 ${
              isSubscribed
                ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                : 'bg-[#2466FF] text-white hover:bg-[#1557ee]'
            }`}
          >
            {isLoading ? '...' : isSubscribed ? 'Вимкнути' : 'Увімкнути'}
          </button>
        </div>

        <p className="text-xs text-gray-600 mb-3">
          Отримуйте сповіщення про нові модулі, прямі ефіри, перевірені домашні завдання та інші важливі події
        </p>

        {permission === 'denied' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-3">
            <p className="text-xs text-red-800">
              ⛔ Ви заблокували нотифікації. Дозвольте їх у налаштуваннях браузера
            </p>
          </div>
        )}

        {isSubscribed && (
          <button
            onClick={handleTestNotification}
            disabled={isLoading}
            className="w-full mt-3 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-medium text-sm hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            Відправити тестову нотифікацію
          </button>
        )}
      </div>

      {/* Інформація про типи нотифікацій */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <h4 className="text-sm font-bold text-black mb-3">Ви будете отримувати:</h4>
        <ul className="space-y-2 text-xs text-gray-600">
          <li className="flex items-start gap-2">
            <span>🎓</span>
            <span>Нотифікації про відкриття нових модулів</span>
          </li>
          <li className="flex items-start gap-2">
            <span>🔴</span>
            <span>Нагадування про прямі ефіри та зустрічі</span>
          </li>
          <li className="flex items-start gap-2">
            <span>✅</span>
            <span>Статуси перевірки домашніх завдань</span>
          </li>
          <li className="flex items-start gap-2">
            <span>🏆</span>
            <span>Повідомлення про отримані нагороди</span>
          </li>
          <li className="flex items-start gap-2">
            <span>📞</span>
            <span>Нагадування про Zoom-зустрічі</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
