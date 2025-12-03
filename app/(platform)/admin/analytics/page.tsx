'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, TrendingUp, Users, Award, Clock } from 'lucide-react';

interface UserProgress {
  id: string;
  name: string;
  email: string;
  faculty?: string;
  completedLessons: number;
  completedModules: number;
  earnings: number;
  lastActive?: string;
}

export default function AdminAnalyticsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<UserProgress[]>([]);

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
      }
    } catch (error) {
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
        setUsers(data.map((user: any) => ({
          id: user.id,
          name: user.firstName,
          email: user.email,
          faculty: user.faculty,
          completedLessons: user.completedLessonsCount || 0,
          completedModules: user.completedModulesCount || 0,
          earnings: user.earnings || 0,
        })));
      }
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  const topEarners = [...users].sort((a, b) => b.earnings - a.earnings).slice(0, 5);
  const topLearners = [...users].sort((a, b) => b.completedLessons - a.completedLessons).slice(0, 5);

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
          className="flex items-center gap-2 text-white/90 hover:text-white mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm font-medium">Назад</span>
        </button>

        <h1 className="text-2xl font-bold text-white mb-2">Аналітика</h1>
        <p className="text-sm text-white/80">Статистика активності студентів</p>
      </div>

      <div className="px-4 -mt-4 space-y-6">
        {/* Top Earners */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-5 h-5 text-[#2466FF]" />
            <h2 className="text-lg font-bold text-black">Топ за доходом</h2>
          </div>

          <div className="space-y-3">
            {topEarners.map((user, index) => (
              <div key={user.id} className="flex items-center justify-between p-3 bg-[#F5F5F5] rounded-xl">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                    index === 0 ? 'bg-yellow-500 text-white' :
                    index === 1 ? 'bg-gray-400 text-white' :
                    index === 2 ? 'bg-amber-700 text-white' :
                    'bg-gray-200 text-gray-600'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-black">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.faculty || 'Без факультету'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-base font-bold text-[#2466FF]">${user.earnings}</p>
                  <p className="text-xs text-gray-500">{user.completedModules} модулів</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Learners */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-[#2466FF]" />
            <h2 className="text-lg font-bold text-black">Топ за уроками</h2>
          </div>

          <div className="space-y-3">
            {topLearners.map((user, index) => (
              <div key={user.id} className="flex items-center justify-between p-3 bg-[#F5F5F5] rounded-xl">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                    index === 0 ? 'bg-green-500 text-white' :
                    index === 1 ? 'bg-blue-400 text-white' :
                    index === 2 ? 'bg-purple-500 text-white' :
                    'bg-gray-200 text-gray-600'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-black">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-base font-bold text-green-600">{user.completedLessons} уроків</p>
                  <p className="text-xs text-gray-500">{user.completedModules} модулів</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Faculty Distribution */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-[#2466FF]" />
            <h2 className="text-lg font-bold text-black">Розподіл по факультетам</h2>
          </div>

          <div className="space-y-2">
            {['Gryffindor', 'Slytherin', 'Ravenclaw', 'Hufflepuff'].map(faculty => {
              const count = users.filter(u => u.faculty === faculty).length;
              const percentage = users.length > 0 ? (count / users.length * 100).toFixed(0) : 0;
              
              return (
                <div key={faculty} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-700">{faculty}</span>
                    <span className="text-gray-500">{count} студентів ({percentage}%)</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#2466FF] rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
