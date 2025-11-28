'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';

interface Lesson {
  id: number;
  title: string;
  duration: string;
  isCompleted: boolean;
}

interface ModuleCardProps {
  moduleNumber: number;
  title: string;
  totalLessons: number;
  completedLessons: number;
  lessons: Lesson[];
}

export function ModuleCard({
  moduleNumber,
  title,
  totalLessons,
  completedLessons,
  lessons,
}: ModuleCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleToggleExpand = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="bg-white rounded-2xl backdrop-blur-sm overflow-hidden transition-all duration-300">
      {/* Closed State - Clickable to open module page */}
      <Link href={`/modules/${moduleNumber}`}>
        <div className="p-3 cursor-pointer hover:bg-gray-50/50 transition-colors">
          <div className="flex flex-col gap-3">
            {/* Top Section */}
            <div className="flex justify-between items-start">
              <div className="flex flex-col gap-2">
                {/* Module Badge */}
                <div className="inline-flex items-center bg-[#F2F2F2] rounded-full px-2 py-1.5 w-fit">
                  <span className="text-xs font-bold text-black">
                    Модуль {moduleNumber}
                  </span>
                </div>

                {/* Module Title */}
                <h3 className="text-base font-bold text-black leading-snug">
                  {title}
                </h3>
              </div>

              {/* Expand Arrow - Stops propagation */}
              <button
                onClick={handleToggleExpand}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors -mr-2"
              >
                <ChevronDown
                  className={`w-5 h-5 text-gray-900 transition-transform duration-300 ${
                    isExpanded ? 'rotate-180' : ''
                  }`}
                />
              </button>
            </div>

            {/* Progress Badge */}
            <div className="inline-flex items-center bg-[#F2F2F2] rounded-full px-2 py-1.5 w-fit">
              <span className="text-xs font-bold text-[#7F7F7F]">
                {completedLessons}/{totalLessons} уроків пройдено
              </span>
            </div>
          </div>
        </div>
      </Link>

      {/* Expanded State - Lessons List */}
      {isExpanded && (
        <div className="border-t border-gray-100 bg-gray-50/30">
          <div className="p-3 space-y-2">
            {lessons.map((lesson, index) => (
              <Link
                key={lesson.id}
                href={`/modules/${moduleNumber}/lessons/${lesson.id}`}
                className="block"
              >
                <div className="flex items-center justify-between p-3 bg-white rounded-xl hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    {/* Lesson Number */}
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-xs font-bold text-gray-600">
                      {index + 1}
                    </div>

                    {/* Lesson Title */}
                    <span className="text-sm font-medium text-gray-900">
                      {lesson.title}
                    </span>
                  </div>

                  {/* Duration & Status */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">
                      {lesson.duration}
                    </span>
                    {lesson.isCompleted && (
                      <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                        <svg
                          className="w-3 h-3 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
