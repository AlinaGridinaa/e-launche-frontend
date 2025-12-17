'use client';

import { useState, useEffect } from 'react';
import { Search, Lock } from 'lucide-react';
import { modulesService, Module as ApiModule } from '@/lib/services/modules.service';
import { useAuth } from '@/contexts/AuthContext';

interface Lesson {
  id: number;
  title: string;
  isCompleted: boolean;
}

interface Module {
  id: string;
  category: string;
  title: string;
  number: number;
  lessonsCompleted: number;
  totalLessons: number;
  isActive: boolean;
  isLocked: boolean;
  unlockDate?: string;
  lessons: Lesson[];
}

export default function ModulesPage() {
  const { user } = useAuth();
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadModules();
    
    // Reload data when page becomes visible (user returns from lesson)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('🔄 Page visible, reloading modules...');
        loadModules();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const loadModules = async () => {
    try {
      console.log('📚 Loading modules...');
      const data = await modulesService.getModules();
      console.log('📦 Raw API data:', data);
      const transformedModules = data.map((apiModule: ApiModule) => {
        const completedLessons = apiModule.lessons.filter(l => l.isCompleted).length;
        console.log(`📖 Module ${apiModule.number}: ${completedLessons}/${apiModule.lessons.length} lessons completed`);
        console.log(`📝 Module ${apiModule.number} lessons:`, apiModule.lessons);
        return {
          id: apiModule._id,
          category: `Модуль ${apiModule.number}`,
          title: apiModule.title,
          number: apiModule.number,
          lessonsCompleted: completedLessons,
          totalLessons: apiModule.lessons.length,
          isActive: !apiModule.isLocked, // All unlocked modules are active (blue)
          isLocked: apiModule.isLocked,
          unlockDate: apiModule.unlockDate ? new Date(apiModule.unlockDate).toLocaleDateString('uk-UA', { day: 'numeric', month: 'long' }) : undefined,
          lessons: apiModule.lessons.map(lesson => ({
            id: lesson.number,
            title: lesson.title || `Урок ${lesson.number}`,
            isCompleted: lesson.isCompleted || false,
          })),
        };
      });
      
      // Сортуємо модулі за номером
      transformedModules.sort((a, b) => a.number - b.number);
      
      setModules(transformedModules);
      console.log('✅ Modules loaded successfully');
    } catch (error) {
      console.error('❌ Failed to load modules:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalModules = modules.length;
  const completedModules = modules.filter(m => m.lessonsCompleted === m.totalLessons && m.totalLessons > 0).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F2F2F2] max-w-md mx-auto flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2466FF] mx-auto mb-4"></div>
          <p className="text-gray-600">Завантаження...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F2F2F2] max-w-md mx-auto">
      {/* Header with white background */}
      <div className="bg-white pb-4 rounded-b-2xl shadow-sm">
        <div className="max-w-md mx-auto px-4 pt-6">
          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            Програма навчання
          </h1>

          {/* Progress info */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-gray-900">Прогрес</span>
              <span className="text-sm font-bold text-[#2466FF]">
                {completedModules}/{totalModules} модулів пройдено
              </span>
            </div>

            {/* Progress bar */}
            <div className="flex gap-0.5">
              {Array.from({ length: totalModules }).map((_, index) => (
                <div
                  key={index}
                  className={`h-1.5 flex-1 rounded-full ${
                    index < completedModules ? 'bg-[#2466FF]' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Search */}
          <div className="bg-[#F2F2F2] rounded-3xl px-4 py-2.5 flex items-center gap-2">
            <Search className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Пошук..."
              className="bg-transparent flex-1 text-sm outline-none placeholder:text-gray-500"
            />
          </div>
        </div>
      </div>

      {/* Modules list */}
      <div className="max-w-md mx-auto px-4 pt-4 pb-24 space-y-3">
        {modules.map((module) => (
          <ModuleCard 
            key={module.id} 
            module={module}
          />
        ))}

        {/* Tariff Info */}
        {user && user.tariff && !user.isAdmin && !user.isCurator && (
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-4 border-2 border-purple-200">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center flex-shrink-0">
                <span className="text-xl">💎</span>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 mb-1">
                  Ваш тариф: {user.tariff}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {user.tariff === 'Преміум' && 'У вас є доступ до 7 модулів навчання'}
                  {user.tariff === 'ВІП' && 'У вас є доступ до 9 модулів навчання'}
                  {user.tariff === 'Легенда' && 'У вас є доступ до всіх 10 модулів навчання'}
                </p>
                {user.tariff !== 'Легенда' && (
                  <p className="text-xs text-purple-600 mt-2">
                    💡 Хочете доступ до всіх модулів? Зверніться до адміністратора
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface ModuleCardProps {
  module: Module;
}

function ModuleCard({ 
  module
}: ModuleCardProps) {
  const handleModuleClick = () => {
    if (!module.isLocked) {
      window.location.href = `/modules/${module.id}`;
    }
  };

  return (
    <div
      className={`rounded-2xl overflow-hidden ${
        module.isActive
          ? 'bg-gradient-to-br from-[#1792FE] to-[#2466FF]'
          : module.isLocked
          ? 'bg-white/50 backdrop-blur-sm'
          : 'bg-white backdrop-blur-sm'
      }`}
    >
      <div 
        className="p-3 cursor-pointer hover:opacity-90 transition-opacity"
        onClick={handleModuleClick}
      >
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1">
              {/* Category badge */}
              <div className="flex flex-col gap-1.5">
                <span
                  className={`text-xs font-bold px-2 py-1.5 rounded-full w-fit ${
                    module.isActive
                      ? 'bg-white text-black'
                      : 'bg-[#F2F2F2] text-black'
                  }`}
                >
                  {module.category}
                </span>
                {module.isLocked && module.unlockDate && (
                  <span className="text-xs text-gray-500">
                    🗓 Відкриється {module.unlockDate}
                  </span>
                )}
                {module.isLocked && !module.unlockDate && (
                  <span className="text-xs text-purple-600 font-medium">
                    💎 Доступно на вищому тарифі
                  </span>
                )}
              </div>

              {/* Title */}
              <h3
                className={`text-base font-bold leading-snug ${
                  module.isActive ? 'text-white' : 'text-black'
                }`}
              >
                {module.title}
              </h3>
            </div>

            {/* Lock icon */}
            {module.isLocked && (
              <div className="w-6 h-6 flex items-center justify-center">
                <Lock className="w-5 h-5 text-gray-400" />
              </div>
            )}
          </div>

          {/* Progress badge */}
          <div
            className={`inline-flex items-center px-2 py-1.5 rounded-full text-xs font-bold ${
              module.isActive
                ? 'bg-[#5BB3FE] text-white'
                : 'bg-[#F2F2F2] text-[#7F7F7F]'
            }`}
          >
            {module.lessonsCompleted}/{module.totalLessons} уроків пройдено
          </div>
        </div>
      </div>
    </div>
  );
}
