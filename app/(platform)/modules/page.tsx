'use client';

import { useState, useEffect } from 'react';
import { Search, ChevronDown, ChevronUp, Lock } from 'lucide-react';
import { modulesService, Module as ApiModule } from '@/lib/services/modules.service';

interface Lesson {
  id: number;
  title: string;
  isCompleted: boolean;
}

interface Module {
  id: string;
  category: string;
  title: string;
  lessonsCompleted: number;
  totalLessons: number;
  isActive: boolean;
  isLocked: boolean;
  unlockDate?: string;
  lessons: Lesson[];
}

export default function ModulesPage() {
  const [expandedModuleId, setExpandedModuleId] = useState<string | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadModules();
  }, []);

  const loadModules = async () => {
    try {
      const data = await modulesService.getModules();
      const transformedModules = data.map((apiModule: ApiModule) => {
        const completedLessons = apiModule.lessons.filter(l => l.isCompleted).length;
        return {
          id: apiModule._id,
          category: `Модуль ${apiModule.number}`,
          title: apiModule.title,
          lessonsCompleted: completedLessons,
          totalLessons: apiModule.lessons.length,
          isActive: apiModule.number === 1 && !apiModule.isLocked, // First unlocked module is active
          isLocked: apiModule.isLocked,
          unlockDate: apiModule.unlockDate ? new Date(apiModule.unlockDate).toLocaleDateString('uk-UA', { day: 'numeric', month: 'long' }) : undefined,
          lessons: apiModule.lessons.map(lesson => ({
            id: lesson.number,
            title: lesson.title,
            isCompleted: lesson.isCompleted,
          })),
        };
      });
      setModules(transformedModules);
    } catch (error) {
      console.error('Failed to load modules:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalModules = modules.length;
  const completedModules = modules.filter(m => m.lessonsCompleted === m.totalLessons && m.totalLessons > 0).length;

  const toggleModule = (moduleId: string) => {
    setExpandedModuleId(expandedModuleId === moduleId ? null : moduleId);
  };

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
            isExpanded={expandedModuleId === module.id}
            onToggle={() => toggleModule(module.id)}
          />
        ))}
      </div>
    </div>
  );
}

interface ModuleCardProps {
  module: Module;
  isExpanded: boolean;
  onToggle: () => void;
}

function ModuleCard({ 
  module, 
  isExpanded,
  onToggle 
}: ModuleCardProps) {
  const handleArrowClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onToggle();
  };

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
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-bold px-2 py-1.5 rounded-full ${
                    module.isActive
                      ? 'bg-white text-black'
                      : 'bg-[#F2F2F2] text-black'
                  }`}
                >
                  {module.category}
                </span>
                {module.isLocked && (
                  <span className="text-xs text-gray-500">
                    Відкриється {module.unlockDate}
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

            {/* Lock icon or Arrow */}
            {module.isLocked ? (
              <div className="w-6 h-6 flex items-center justify-center">
                <Lock className="w-5 h-5 text-gray-400" />
              </div>
            ) : (
              <button
                onClick={handleArrowClick}
                className="p-1 hover:bg-black/10 rounded-full transition-colors"
              >
                {isExpanded ? (
                  <ChevronUp className={`w-5 h-5 ${module.isActive ? 'text-white' : 'text-gray-900'}`} />
                ) : (
                  <ChevronDown className={`w-5 h-5 ${module.isActive ? 'text-white' : 'text-gray-900'}`} />
                )}
              </button>
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

      {/* Lessons list */}
      {isExpanded && module.lessons.length > 0 && (
        <div className="bg-white">
          {module.lessons.map((lesson, index) => (
            <div
              key={lesson.id}
              className={`flex items-center gap-3 px-3 py-3 ${
                index !== module.lessons.length - 1 ? 'border-b border-gray-200' : ''
              }`}
            >
              {/* Lesson number badge */}
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                  lesson.isCompleted
                    ? 'bg-[#E9F0FF] text-[#2466FF]'
                    : 'bg-[#F2F2F2] text-black'
                }`}
              >
                {lesson.id}
              </div>

              {/* Lesson title */}
              <p className="text-sm font-bold text-black flex-1 leading-snug">
                {lesson.title}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
