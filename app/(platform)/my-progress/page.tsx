'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, MoreHorizontal, X, Plus, Camera, Lock } from 'lucide-react';
import Image from 'next/image';
import { profileService, UserProfile, ProfileStats, Achievement } from '@/lib/services/profile.service';

interface LeaderboardEntry {
  rank: number;
  name: string;
  earnings: number;
  isCurrentUser: boolean;
}

export default function MyProgressPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'rating' | 'rewards'>('rating');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadProfile();
    loadLeaderboard();
    loadAchievements();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await profileService.getProfile();
      setProfile(data.user);
      setStats(data.stats);
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadLeaderboard = async () => {
    try {
      const data = await profileService.getLeaderboard();
      setLeaderboard(data);
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
    }
  };

  const loadAchievements = async () => {
    try {
      const data = await profileService.getMyAchievements();
      setAchievements(data);
    } catch (error) {
      console.error('Failed to load achievements:', error);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Перевірка типу файлу
    if (!file.type.startsWith('image/')) {
      alert('Будь ласка, виберіть зображення');
      return;
    }

    // Перевірка розміру (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Файл занадто великий. Максимальний розмір 5MB');
      return;
    }

    try {
      setUploading(true);
      const result = await profileService.uploadAvatar(file);
      setProfile(result.user);
    } catch (error) {
      console.error('Failed to upload avatar:', error);
      alert('Помилка завантаження аватарки');
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = () => {
    // Видаляємо токен
    localStorage.removeItem('token');
    // Перенаправляємо на логін
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] pb-24 max-w-md mx-auto flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#2466FF] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm text-gray-500">Завантаження...</p>
        </div>
      </div>
    );
  }

  if (!profile || !stats) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] pb-24 max-w-md mx-auto">
      {/* Header з градієнтом */}
      <div className="relative bg-gradient-to-br from-[#2466FF] to-[#10A3FE] rounded-b-2xl">
        <div className="relative  pt-8 pb-20">
        {/* Header кнопки */}
        <div className="absolute top-6 left-0 right-0 px-4 flex items-center justify-between">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 px-4 py-2 bg-black/20 backdrop-blur-md rounded-[32px] hover:bg-black/30 transition-colors"
          >
            <X className="w-5 h-5 text-white" />
            <span className="text-sm font-medium text-white">Закрить</span>
          </button>
          <div className="relative">
            <button 
              onClick={() => setShowMenu(!showMenu)}
              className="flex items-center gap-3 px-4 py-2 bg-black/20 backdrop-blur-md rounded-[32px] hover:bg-black/30 transition-colors"
            >
              <ChevronDown className="w-5 h-5 text-white" />
              <MoreHorizontal className="w-5 h-5 text-white" />
            </button>

            {/* Dropdown меню */}
            {showMenu && (
              <>
                {/* Backdrop для закриття */}
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowMenu(false)}
                />
                
                {/* Саме меню */}
                <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-2xl shadow-lg overflow-hidden z-50 animate-in slide-in-from-top-2 duration-200">
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-3 text-left text-sm font-medium text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                  >
                    <span>🚪</span>
                    <span>Вийти</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Заголовок */}
        <div className="px-4 pt-12">
          <h1 className="text-2xl font-bold text-white mb-4">Мій прогрес</h1>
          
          <button 
            onClick={() => router.push('/earnings')}
            className="flex items-center gap-1 px-4 py-2.5 bg-black/20 backdrop-blur-md rounded-[13px] hover:bg-black/30 transition-colors"
          >
            <Plus className="w-4 h-4 text-white" />
            <span className="text-xs font-medium text-white">Додати дохід</span>
          </button>
        </div>
      </div>

      {/* Картка профілю */}
      <div className=" -mt-16">
        <div className="rounded-2xl overflow-hidden shadow-sm">
          {/* Верхня частина з градієнтом */}
          <div className=" p-4">
            <div className="flex gap-3.5">
              {/* Аватар з можливістю завантаження */}
              <div 
                className="w-[123px] h-[164px] bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg flex items-center justify-center overflow-hidden relative border border-white/50 cursor-pointer group"
                onClick={handleAvatarClick}
              >
                {profile.avatarUrl ? (
                  <>
                    <img 
                      src={profile.avatarUrl.startsWith('http') ? profile.avatarUrl : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}${profile.avatarUrl}`}
                      alt={`${profile.firstName} ${profile.lastName}`}
                      className="w-full h-full object-cover"
                    />
                    {/* Overlay при наведенні */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Camera className="w-8 h-8 text-white" />
                    </div>
                  </>
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-[#4A4A4A] to-[#2A2A2A] flex items-center justify-center">
                    <div className="text-center">
                      <span className="text-6xl">🧙‍♂️</span>
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Camera className="w-8 h-8 text-white" />
                      </div>
                    </div>
                  </div>
                )}
                {uploading && (
                  <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              {/* Інформація */}
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex flex-wrap gap-2 mb-3.5">
                    <div className="inline-block px-2 py-1.5 bg-white rounded-full">
                      <span className="text-xs font-bold text-black leading-[11px]">
                        {profile.firstName} {profile.lastName}
                      </span>
                    </div>
                    {profile.faculty && (
                      <div className="inline-block px-2 py-1.5 bg-white/90 rounded-full">
                        <span className="text-xs font-medium text-[#2466FF] leading-[11px]">
                          {profile.faculty}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="mb-0">
                    <p className="text-base font-bold text-white mb-2 leading-5">
                      {stats.modulesCompleted}/{stats.totalModules} модулів пройдено
                    </p>
                    {/* Прогрес бар */}
                    <div className="flex gap-0.5">
                      {Array.from({ length: stats.totalModules }).map((_, i) => (
                        <div
                          key={i}
                          className={`h-1.5 flex-1 rounded-full ${
                            i < stats.modulesCompleted
                              ? 'bg-white'
                              : 'bg-white/30'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <p className="text-sm text-white/90 leading-5 mt-3">
                  Ти поки що новачок. Проходь модулі та виконуй завдання уроків щоб стати випускником Академії запусків
                </p>
              </div>
            </div>
          </div>

          {/* Пройдено уроків - біла частина */}
          <div className="bg-white rounded-b-2xl p-3">
            <div className="flex items-center justify-between">
              <div className="px-2 py-1.5 bg-[#F2F2F2] rounded-full">
                <span className="text-xs font-bold text-black leading-[11px]">Пройдено уроків</span>
              </div>
              <span className="text-sm font-bold text-black leading-5">
                {stats.lessonsCompleted}/{stats.totalLessons}
              </span>
            </div>
          </div>
        </div>
      </div>
      </div>
      

      {/* Таби */}
      <div className="px-4 mt-4">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('rating')}
            className={`px-3 py-2 rounded-[20px] text-sm font-medium transition-colors ${
              activeTab === 'rating'
                ? 'bg-black text-white'
                : 'bg-white text-black'
            }`}
          >
            Рейтинг студентів
          </button>
          <button
            onClick={() => setActiveTab('rewards')}
            className={`px-3 py-2 rounded-[20px] text-sm font-medium transition-colors ${
              activeTab === 'rewards'
                ? 'bg-black text-white'
                : 'bg-white text-black'
            }`}
          >
            Мої нагороди
          </button>
        </div>
      </div>

      {/* Контент табів */}
      <div className="px-4 mt-4 mb-32">
        {activeTab === 'rating' ? (
          // Лідерборд
          leaderboard.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-sm text-gray-500">Рейтинг порожній</p>
              <p className="text-xs text-gray-400 mt-1">Додайте дохід, щоб з'явитися в рейтингу</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
              {leaderboard.map((user, index) => {
              const isTop3 = user.rank <= 3;
              const getRankEmoji = () => {
                if (user.rank === 1) return '🥇';
                if (user.rank === 2) return '🥈';
                if (user.rank === 3) return '🥉';
                return null;
              };
              const emoji = getRankEmoji();

              return (
                <div
                  key={`${user.rank}-${user.name}`}
                  className={`flex items-center gap-3 p-3 border-b border-gray-100 last:border-b-0 ${
                    user.isCurrentUser ? 'bg-[#E9F0FF]' : ''
                  }`}
                >
                  {/* Ранк */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    user.isCurrentUser 
                      ? 'bg-[#2466FF]' 
                      : isTop3 
                        ? 'bg-gradient-to-br from-gray-100 to-gray-200' 
                        : 'bg-gray-100'
                  }`}>
                    {emoji ? (
                      <span className="text-base">{emoji}</span>
                    ) : (
                      <span className={`text-xs font-bold ${
                        user.isCurrentUser ? 'text-white' : 'text-gray-700'
                      }`}>
                        {user.rank}
                      </span>
                    )}
                  </div>

                  {/* Ім'я */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-bold truncate ${
                      user.isCurrentUser ? 'text-[#2466FF]' : 'text-black'
                    }`}>
                      {user.name}
                    </p>
                  </div>

                  {/* Заробіток */}
                  <div className="text-right">
                    <span className={`text-sm font-bold ${
                      user.isCurrentUser ? 'text-[#2466FF]' : 'text-black'
                    }`}>
                      $ {user.earnings.toLocaleString()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
          )
        ) : (
          // Нагороди
          <div className="flex flex-wrap gap-3">
            {achievements.map((achievement) => (
              <div
                key={achievement._id}
                className="w-[105px] h-[124px] bg-white rounded-2xl p-3 shadow-sm backdrop-blur-sm relative"
              >
                <div className="flex flex-col items-center justify-between h-full">
                  {/* Іконка/Емоджі */}
                  <div className="w-[73px] h-[60px] flex items-center justify-center">
                    <img 
                      src={achievement.imageUrl} 
                      alt={achievement.title}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        e.currentTarget.src = 'https://via.placeholder.com/60?text=🏆';
                      }}
                    />
                  </div>

                  {/* Назва */}
                  <p className="text-xs font-bold text-black text-center leading-4 w-full">
                    {achievement.title}
                  </p>
                </div>

                {/* Дата */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <div className="px-2 py-1.5 bg-[#E9F0FF] rounded-[41px] whitespace-nowrap">
                    <span className="text-xs font-bold text-[#2466FF]">
                      {new Date(achievement.awardedAt).toLocaleDateString('uk-UA', { 
                        day: 'numeric', 
                        month: 'short' 
                      })}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {achievements.length === 0 && (
              <div className="w-full text-center py-12">
                <p className="text-sm text-gray-500">Нагород поки немає</p>
                <p className="text-xs text-gray-400 mt-1">Виконуйте завдання щоб отримати нагороди</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Мій дохід - внизу з градієнтом */}
      <div className="fixed bottom-20 left-0 right-0 px-4 pt-5 pb-5 bg-gradient-to-t from-[#F2F2F2]/70 to-transparent pointer-events-none max-w-md mx-auto">
        <div className="bg-white rounded-xl border border-[#E7E7E7] p-3 shadow-sm pointer-events-auto">
          <div className="flex items-center gap-1">
            <div className="w-[35px] h-6 bg-white rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-[#2466FF]">{stats.rank}</span>
            </div>
            <div className="px-2 py-1.5 bg-[#E9F0FF] rounded-full">
              <span className="text-xs font-bold text-[#2466FF]">Мій дохід</span>
            </div>
            <div className="flex-1" />
            <span className="text-sm font-bold text-black">$ {stats.earnings}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
