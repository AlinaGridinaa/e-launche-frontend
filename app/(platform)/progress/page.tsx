'use client';

import { useState } from 'react';
import { Search, ChevronDown, ChevronUp, Lock } from 'lucide-react';

interface Lesson {
  id: number;
  title: string;
  isCompleted: boolean;
}

interface Module {
  id: number;
  category: string;
  title: string;
  lessonsCompleted: number;
  totalLessons: number;
  isActive: boolean;
  isLocked: boolean;
  unlockDate?: string;
  lessons: Lesson[];
}

export default function ProgressPage() {
  const [expandedModuleId, setExpandedModuleId] = useState<number | null>(null);
  
  // Mock data
  const totalModules = 10;
  const completedModules = 0;
  
  const modules: Module[] = [
    {
      id: 0,
      category: 'Переднавчання',
      title: 'Мышление продюссера своей жизни',
      lessonsCompleted: 5,
      totalLessons: 6,
      isActive: true,
      isLocked: false,
      lessons: [
        { id: 1, title: 'Вступ до курсу', isCompleted: true },
        { id: 2, title: 'Основи мислення продюсера', isCompleted: true },
        { id: 3, title: 'Планування цілей', isCompleted: true },
        { id: 4, title: 'Управління часом', isCompleted: true },
        { id: 5, title: 'Фінансова грамотність', isCompleted: true },
        { id: 6, title: 'Практичне завдання', isCompleted: false },
      ],
    },
    {
      id: 1,
      category: 'Модуль 1',
      title: 'Формула запуска на мільйон',
      lessonsCompleted: 5,
      totalLessons: 7,
      isActive: false,
      isLocked: false,
      lessons: [
        { id: 1, title: 'Хто такий продюсер і що він робить', isCompleted: false },
        { id: 2, title: 'Системи та види запусків', isCompleted: true },
        { id: 3, title: 'Схема запуску. Від ідеї до першого мільйона', isCompleted: true },
        { id: 4, title: 'Вибір прибуткової ніші для запуску', isCompleted: true },
        { id: 5, title: 'Типи інфопродуктів', isCompleted: true },
        { id: 6, title: 'Декомпозиція запуску. Як досягти мети', isCompleted: false },
        { id: 7, title: 'Види воронок продажів на запусках: через сторіс, через безкоштовник, через анкету', isCompleted: false },
      ],
    },
    {
      id: 2,
      category: 'Модуль 2',
      title: 'Вибір ідеального експерта для запуску',
      lessonsCompleted: 0,
      totalLessons: 7,
      isActive: false,
      isLocked: false,
      lessons: [],
    },
    {
      id: 3,
      category: 'Модуль 3',
      title: 'Продукт, що сам себе продає',
      lessonsCompleted: 0,
      totalLessons: 7,
      isActive: false,
      isLocked: true,
      unlockDate: '24 грудня',
      lessons: [],
    },
  ];

  const toggleModule = (moduleId: number) => {
    setExpandedModuleId(expandedModuleId === moduleId ? null : moduleId);
  };

  return (
    <div className="min-h-screen bg-[#F2F2F2]">
      {/* Header with white background */}
      <div className="bg-white pb-4">
        <div className="max-w-md mx-auto px-4 pt-28">
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

function ModuleCard({ 
  module, 
  isExpanded,
  onToggle 
}: { 
  module: Module;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className={`rounded-2xl overflow-hidden ${
        module.isActive
          ? 'bg-gradient-to-br from-[#1792FE] to-[#2466FF]'
          : module.isLocked
          ? 'bg-white/50 backdrop-blur-sm'
          : 'bg-white'
      }`}
    >
      <div 
        className="p-3 cursor-pointer"
        onClick={module.isLocked ? undefined : onToggle}
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
            ) : isExpanded ? (
              <ChevronUp className={`w-5 h-5 ${module.isActive ? 'text-white' : 'text-gray-400'}`} />
            ) : (
              <ChevronDown className={`w-5 h-5 ${module.isActive ? 'text-white' : 'text-gray-400'}`} />
            )}
          </div>

          {/* Progress badge */}
          <div
            className={`inline-flex items-center px-2 py-1.5 rounded-full text-xs font-bold ${
              module.isActive
                ? 'bg-[#5BB3FE] text-white'
                : 'bg-[#F2F2F2] text-gray-500'
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
