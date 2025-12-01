'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Users, BarChart3, BookMarked, TrendingUp, Shield } from 'lucide-react';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalModules: 0,
    totalLessons: 0,
    activeUsers: 0,
  });

  useEffect(() => {
    checkAdminAccess();
    loadStats();
  }, []);

  const checkAdminAccess = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    // Decode JWT to check if user is admin
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

  const loadStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/admin/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
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
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Адмін-панель</h1>
            <p className="text-sm text-white/80">Керування академією</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="px-4 -mt-4">
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-5 h-5 text-[#2466FF]" />
              <span className="text-xs text-gray-500 font-medium">Користувачі</span>
            </div>
            <p className="text-2xl font-bold text-black">{stats.totalUsers}</p>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <BookMarked className="w-5 h-5 text-[#2466FF]" />
              <span className="text-xs text-gray-500 font-medium">Модулі</span>
            </div>
            <p className="text-2xl font-bold text-black">{stats.totalModules}</p>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-[#2466FF]" />
              <span className="text-xs text-gray-500 font-medium">Активні</span>
            </div>
            <p className="text-2xl font-bold text-black">{stats.activeUsers}</p>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="w-5 h-5 text-[#2466FF]" />
              <span className="text-xs text-gray-500 font-medium">Уроки</span>
            </div>
            <p className="text-2xl font-bold text-black">{stats.totalLessons}</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-black px-1">Швидкі дії</h2>

          <button
            onClick={() => router.push('/admin/users')}
            className="w-full bg-white rounded-2xl p-4 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#E9F0FF] rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5 text-[#2466FF]" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-black">Керування користувачами</p>
                <p className="text-xs text-gray-500">Перегляд, редагування, призначення факультетів</p>
              </div>
            </div>
            <div className="text-[#2466FF]">→</div>
          </button>

          <button
            onClick={() => router.push('/admin/modules')}
            className="w-full bg-white rounded-2xl p-4 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#E9F0FF] rounded-xl flex items-center justify-center">
                <BookMarked className="w-5 h-5 text-[#2466FF]" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-black">Керування модулями</p>
                <p className="text-xs text-gray-500">Додавання, редагування модулів та уроків</p>
              </div>
            </div>
            <div className="text-[#2466FF]">→</div>
          </button>

          <button
            onClick={() => router.push('/admin/analytics')}
            className="w-full bg-white rounded-2xl p-4 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#E9F0FF] rounded-xl flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-[#2466FF]" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-black">Аналітика</p>
                <p className="text-xs text-gray-500">Статистика та прогрес студентів</p>
              </div>
            </div>
            <div className="text-[#2466FF]">→</div>
          </button>

          <button
            onClick={() => router.push('/admin/schedule')}
            className="w-full bg-white rounded-2xl p-4 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#E9F0FF] rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-[#2466FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-black">Розклад навчання</p>
                <p className="text-xs text-gray-500">Керування подіями та розкладом</p>
              </div>
            </div>
            <div className="text-[#2466FF]">→</div>
          </button>

          <button
            onClick={() => router.push('/admin/avatars')}
            className="w-full bg-white rounded-2xl p-4 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#E9F0FF] rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-[#2466FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-black">Аватари користувачів</p>
                <p className="text-xs text-gray-500">Налаштування аватарів за рівнями</p>
              </div>
            </div>
            <div className="text-[#2466FF]">→</div>
          </button>

          <button
            onClick={() => router.push('/admin/lesson-ratings')}
            className="w-full bg-white rounded-2xl p-4 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#FFF4E6] rounded-xl flex items-center justify-center">
                <span className="text-xl">⭐</span>
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-black">Оцінки уроків</p>
                <p className="text-xs text-gray-500">Відгуки студентів про уроки</p>
              </div>
            </div>
            <div className="text-[#2466FF]">→</div>
          </button>
        </div>
      </div>
    </div>
  );
}
