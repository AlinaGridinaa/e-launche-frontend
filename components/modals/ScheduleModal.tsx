'use client';

import { useState } from 'react';
import { X, ChevronDown, MoreHorizontal } from 'lucide-react';

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ScheduleModal({ isOpen, onClose }: ScheduleModalProps) {
  const [currentMonth] = useState('СІЧЕНЬ');

  // Генеруємо дні місяця (1-31)
  const daysInMonth = Array.from({ length: 31 }, (_, i) => i + 1);
  
  // Поточний день і важливі дати
  const today = 28;
  const importantDates = [22, 23, 24, 25, 26, 28];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md mx-4 mt-20 animate-in slide-in-from-bottom h-full duration-300">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gray-50">
            <button
              onClick={onClose}
              className="flex items-center gap-2 text-gray-700 hover:text-gray-900"
            >
              <X className="w-5 h-5" />
              <span className="font-medium">Закрить</span>
            </button>
            <div className="flex items-center gap-3">
              <ChevronDown className="w-5 h-5 text-gray-600" />
              <MoreHorizontal className="w-5 h-5 text-gray-600" />
            </div>
          </div>

          {/* Calendar */}
          <div className="p-4">
            <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br h-full from-[#10A3FE] to-[#2173FF] p-4">
              {/* Month title */}
              <h3 className="text-white text-xl font-bold text-center mb-4">
                {currentMonth}
              </h3>

              {/* Calendar grid line */}
              <div className="border-t border-white/30 mb-4" />

              {/* Days grid */}
              <div className="grid grid-cols-7 gap-2">
                {/* Empty cells for alignment (assuming month starts on Monday) */}
                {[...Array(5)].map((_, i) => (
                  <div key={`empty-${i}`} />
                ))}

                {/* Days */}
                {daysInMonth.map((day) => {
                  const isToday = day === today;
                  const isImportant = importantDates.includes(day);

                  return (
                    <button
                      key={day}
                      className={`
                        aspect-square rounded-xl flex items-center justify-center text-sm font-medium transition-all
                        ${isToday 
                          ? 'bg-white text-[#2173FF] shadow-lg' 
                          : isImportant 
                            ? 'bg-white/20 text-white hover:bg-white/30' 
                            : 'bg-white/10 text-white/70 hover:bg-white/20'
                        }
                      `}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Schedule section */}
            <div className="mt-4">
              <h2 className="text-lg font-bold text-gray-900 mb-3 border-b border-gray-200 pb-3">
                Розкладу на тиждень
              </h2>

              <div className="space-y-4 text-sm">
                {/* Event 1 */}
                <div>
                  <p className="text-gray-600 mb-1">
                    23 січня (четвер) о 19:00 у Європі, 20:00 у Києві
                  </p>
                  <p className="font-bold text-gray-900">
                    Эфир с ответами на вопросы
                  </p>
                </div>

                {/* Event 2 */}
                <div>
                  <p className="text-gray-600 mb-1">
                    22-26 січня (вівторок-неділя)
                  </p>
                  <p className="font-bold text-gray-900">
                    Знайомство з кураторами
                  </p>
                </div>

                {/* Event 3 */}
                <div>
                  <p className="text-gray-600 mb-1">
                    28 січня (вівторок) о 17:00 у Європі, 18:00 у Києві
                  </p>
                  <p className="font-bold text-gray-900">
                    Відкриття спільного чату⭐
                  </p>
                  <p className="text-gray-500 text-xs mt-1">
                    (у цей день ми опублікуємо правила чату та посилання на нього, а також рекомендації, як правильно підготувати вашу самопрезентацію)
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
