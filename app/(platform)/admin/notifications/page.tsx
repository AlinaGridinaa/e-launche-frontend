'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Send, Users, ChevronLeft } from 'lucide-react';

interface User {
  _id: string;
  name: string;
  email: string;
  faculty?: string;
}

export default function AdminNotificationsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [url, setUrl] = useState('');
  const [sendToAll, setSendToAll] = useState(true);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  useEffect(() => {
    checkAdminAccess();
    loadUsers();
  }, []);

  const checkAdminAccess = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (!payload.isAdmin) {
        router.push('/home');
        return;
      }
    } catch (error) {
      console.error('Invalid token:', error);
      router.push('/login');
    }
  };

  const loadUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/admin/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendNotification = async () => {
    if (!title.trim() || !message.trim()) {
      alert('Заповніть назву та повідомлення');
      return;
    }

    if (!sendToAll && selectedUsers.length === 0) {
      alert('Виберіть хоча б одного користувача');
      return;
    }

    setSending(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/admin/send-notification`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          message,
          url: url || undefined,
          sendToAll,
          userIds: sendToAll ? undefined : selectedUsers,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        alert(`✅ Нотифікації відправлено!\n\nВідправлено: ${result.sent}\nНе вдалося: ${result.failed}`);
        
        // Очистити форму
        setTitle('');
        setMessage('');
        setUrl('');
        setSendToAll(true);
        setSelectedUsers([]);
      } else {
        const error = await response.json();
        alert(`❌ Помилка: ${error.message || 'Не вдалося відправити нотифікації'}`);
      }
    } catch (error) {
      console.error('Failed to send notification:', error);
      alert('❌ Помилка при відправці нотифікацій');
    } finally {
      setSending(false);
    }
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#2466FF] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm text-gray-500">Завантаження...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#2466FF] to-[#1557EE] px-4 pt-14 pb-8">
        <button
          onClick={() => router.back()}
          className="mb-4 text-white/80 hover:text-white flex items-center gap-2 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="text-sm">Назад</span>
        </button>
        
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
            <Bell className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Push-нотифікації</h1>
            <p className="text-sm text-white/80">Відправити повідомлення студентам</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="px-4 -mt-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
          <h2 className="text-base font-bold text-black mb-4">Текст нотифікації</h2>
          
          {/* Title */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Назва <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Наприклад: 🎓 Новий модуль"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2466FF] focus:border-transparent"
              maxLength={60}
            />
            <p className="text-xs text-gray-500 mt-1">{title.length}/60 символів</p>
          </div>

          {/* Message */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Повідомлення <span className="text-red-500">*</span>
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Текст повідомлення..."
              rows={4}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2466FF] focus:border-transparent resize-none"
              maxLength={200}
            />
            <p className="text-xs text-gray-500 mt-1">{message.length}/200 символів</p>
          </div>

          {/* URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Посилання (опціонально)
            </label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="/modules або https://..."
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2466FF] focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              При натисканні на нотифікацію відкриється це посилання
            </p>
          </div>
        </div>

        {/* Recipients */}
        <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
          <h2 className="text-base font-bold text-black mb-4">Отримувачі</h2>
          
          {/* Send to All Toggle */}
          <div className="mb-4">
            <button
              onClick={() => setSendToAll(!sendToAll)}
              className={`w-full p-4 rounded-xl border-2 transition-all ${
                sendToAll 
                  ? 'border-[#2466FF] bg-[#E9F0FF]' 
                  : 'border-gray-200 bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Users className={`w-5 h-5 ${sendToAll ? 'text-[#2466FF]' : 'text-gray-400'}`} />
                  <div className="text-left">
                    <p className={`text-sm font-semibold ${sendToAll ? 'text-[#2466FF]' : 'text-black'}`}>
                      Відправити всім
                    </p>
                    <p className="text-xs text-gray-500">
                      Нотифікація прийде всім користувачам
                    </p>
                  </div>
                </div>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  sendToAll ? 'border-[#2466FF] bg-[#2466FF]' : 'border-gray-300'
                }`}>
                  {sendToAll && (
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </div>
            </button>
          </div>

          {/* User Selection */}
          {!sendToAll && (
            <div>
              <p className="text-sm text-gray-600 mb-3">
                Виберіть користувачів ({selectedUsers.length} вибрано)
              </p>
              <div className="max-h-[400px] overflow-y-auto space-y-2">
                {users.map(user => (
                  <button
                    key={user._id}
                    onClick={() => toggleUserSelection(user._id)}
                    className={`w-full p-3 rounded-xl border transition-all text-left ${
                      selectedUsers.includes(user._id)
                        ? 'border-[#2466FF] bg-[#E9F0FF]'
                        : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`text-sm font-medium ${
                          selectedUsers.includes(user._id) ? 'text-[#2466FF]' : 'text-black'
                        }`}>
                          {user.name}
                        </p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                        {user.faculty && (
                          <p className="text-xs text-gray-400 mt-0.5">{user.faculty}</p>
                        )}
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        selectedUsers.includes(user._id) 
                          ? 'border-[#2466FF] bg-[#2466FF]' 
                          : 'border-gray-300'
                      }`}>
                        {selectedUsers.includes(user._id) && (
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Send Button */}
        <button
          onClick={handleSendNotification}
          disabled={sending || !title.trim() || !message.trim()}
          className={`w-full py-4 rounded-2xl font-semibold text-white flex items-center justify-center gap-2 transition-all ${
            sending || !title.trim() || !message.trim()
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-gradient-to-r from-[#2466FF] to-[#1557EE] hover:shadow-lg'
          }`}
        >
          {sending ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Відправка...</span>
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              <span>Відправити нотифікацію</span>
            </>
          )}
        </button>

        {/* Info */}
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <p className="text-xs text-blue-700 leading-relaxed">
            💡 <strong>Підказка:</strong> Нотифікації отримають тільки ті користувачі, які підписалися на push-повідомлення в налаштуваннях.
            Якщо у користувача декілька пристроїв, нотифікація прийде на всі підписані пристрої.
          </p>
        </div>
      </div>
    </div>
  );
}
