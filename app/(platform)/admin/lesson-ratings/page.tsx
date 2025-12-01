'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown } from 'lucide-react';

interface LessonRating {
  userId: string;
  userEmail: string;
  userName: string;
  moduleId: string;
  lessonNumber: number;
  moodRating?: number;
  usefulnessRating?: number;
  completedAt: Date;
}

const moodEmojis = ['😞', '😐', '🙂', '😀', '😄'];

export default function LessonRatingsPage() {
  const router = useRouter();
  const [ratings, setRatings] = useState<LessonRating[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterModule, setFilterModule] = useState<string>('all');

  useEffect(() => {
    loadRatings();
  }, []);

  const loadRatings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/lesson-ratings`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setRatings(data);
      }
    } catch (error) {
      console.error('Failed to load ratings:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRatings = filterModule === 'all' 
    ? ratings 
    : ratings.filter(r => r.moduleId === filterModule);

  const uniqueModules = Array.from(new Set(ratings.map(r => r.moduleId)));

  const averageMood = filteredRatings.length > 0
    ? (filteredRatings.reduce((sum, r) => sum + (r.moodRating || 0), 0) / filteredRatings.length).toFixed(1)
    : '0';

  const averageUsefulness = filteredRatings.length > 0
    ? (filteredRatings.reduce((sum, r) => sum + (r.usefulnessRating || 0), 0) / filteredRatings.length).toFixed(1)
    : '0';

  return (
    <div className="min-h-screen bg-[#F5F5F5] pb-24">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => router.push('/admin')}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
          >
            <ChevronDown className="w-6 h-6 text-gray-600 rotate-90" />
          </button>
          <h1 className="text-2xl font-bold text-black">Оцінки уроків</h1>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <p className="text-sm text-gray-600 mb-1">Всього оцінок</p>
            <p className="text-3xl font-bold text-black">{filteredRatings.length}</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <p className="text-sm text-gray-600 mb-1">Середній настрій</p>
            <p className="text-3xl font-bold text-black">{averageMood} / 5</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <p className="text-sm text-gray-600 mb-1">Середня застосовність</p>
            <p className="text-3xl font-bold text-black">{averageUsefulness} / 5</p>
          </div>
        </div>

        {/* Filter */}
        <div className="bg-white rounded-2xl p-4 shadow-sm mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Фільтр за модулем:
          </label>
          <select
            value={filterModule}
            onChange={(e) => setFilterModule(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2466FF] text-black"
          >
            <option value="all">Всі модулі</option>
            {uniqueModules.map((moduleId) => (
              <option key={moduleId} value={moduleId}>
                Модуль {moduleId}
              </option>
            ))}
          </select>
        </div>

        {/* Ratings List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-[#2466FF] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-sm text-gray-500">Завантаження...</p>
          </div>
        ) : filteredRatings.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center">
            <p className="text-gray-500">Оцінок поки немає</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredRatings
              .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
              .map((rating, index) => (
                <div key={index} className="bg-white rounded-2xl p-4 shadow-sm">
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    {/* User info */}
                    <div className="flex-1">
                      <p className="font-bold text-black">{rating.userName}</p>
                      <p className="text-sm text-gray-600">{rating.userEmail}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        Модуль {rating.moduleId} → Урок {rating.lessonNumber}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(rating.completedAt).toLocaleString('uk-UA')}
                      </p>
                    </div>

                    {/* Ratings */}
                    <div className="flex gap-6">
                      {/* Mood */}
                      <div className="text-center">
                        <p className="text-xs text-gray-600 mb-1">Настрій</p>
                        <div className="flex items-center gap-1">
                          <span className="text-2xl">
                            {rating.moodRating ? moodEmojis[rating.moodRating - 1] : '—'}
                          </span>
                          <span className="text-sm text-gray-600">
                            {rating.moodRating || 0}/5
                          </span>
                        </div>
                      </div>

                      {/* Usefulness */}
                      <div className="text-center">
                        <p className="text-xs text-gray-600 mb-1">Застосовність</p>
                        <div className="flex items-center gap-1">
                          <span className="text-2xl">⭐</span>
                          <span className="text-sm text-gray-600">
                            {rating.usefulnessRating || 0}/5
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
