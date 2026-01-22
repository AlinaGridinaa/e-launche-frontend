'use client';

import { useState, useEffect } from 'react';
import { X, ChevronDown, MoreHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';
import { scheduleService, ScheduleEvent } from '@/lib/services/schedule.service';

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ScheduleModal({ isOpen, onClose }: ScheduleModalProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  // Отримуємо інформацію про поточний місяць
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;
  const currentDay = today.getDate();
  
  // Назва місяця
  const monthNames = ['СІЧЕНЬ', 'ЛЮТИЙ', 'БЕРЕЗЕНЬ', 'КВІТЕНЬ', 'ТРАВЕНЬ', 'ЧЕРВЕНЬ', 
                      'ЛИПЕНЬ', 'СЕРПЕНЬ', 'ВЕРЕСЕНЬ', 'ЖОВТЕНЬ', 'ЛИСТОПАД', 'ГРУДЕНЬ'];
  const currentMonth = monthNames[month];
  
  // Кількість днів у місяці
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  
  // Перший день місяця (0 = неділя, 1 = понеділок, ...)
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const emptyDays = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
  
  // Фільтруємо події по поточному місяцю та створюємо мапу дата -> події
  const eventsByDate = events.reduce((acc, event) => {
    const eventDate = new Date(event.date);
    const eventYear = eventDate.getFullYear();
    const eventMonth = eventDate.getMonth();
    const day = eventDate.getDate();
    
    // Додаємо тільки події поточного місяця
    if (eventYear === year && eventMonth === month) {
      if (!acc[day]) acc[day] = [];
      acc[day].push(event);
    }
    return acc;
  }, {} as Record<number, ScheduleEvent[]>);
  
  // Фільтруємо тільки майбутні та сьогоднішні події для списку
  const upcomingEvents = Object.values(eventsByDate)
    .flat()
    .filter(event => {
      const eventDate = new Date(event.date);
      eventDate.setHours(23, 59, 59, 999); // Встановлюємо кінець дня події
      return eventDate >= new Date(new Date().setHours(0, 0, 0, 0)); // Порівнюємо з початком сьогоднішнього дня
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  const importantDates = Object.keys(eventsByDate).map(Number);
  
  // Отримати події для обраного дня
  const selectedDayEvents = selectedDay ? eventsByDate[selectedDay] || [] : [];

  // Завантаження подій
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const data = await scheduleService.getAllEvents();
        setEvents(data);
      } catch (error) {
        console.error('Failed to load schedule events:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchEvents();
    }
  }, [isOpen]);

  // Блокуємо скрол body коли модалка відкрита
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    // Cleanup при unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Форматування дати для відображення
  const formatEventDate = (event: ScheduleEvent) => {
    const date = new Date(event.date);
    const day = date.getDate();
    const monthNames = [
      'січня', 'лютого', 'березня', 'квітня', 'травня', 'червня',
      'липня', 'серпня', 'вересня', 'жовтня', 'листопада', 'грудня'
    ];
    const month = monthNames[date.getMonth()];
    
    const dayNames = ['неділя', 'понеділок', 'вівторок', 'середа', 'четвер', 'п\'ятниця', 'субота'];
    const dayName = dayNames[date.getDay()];

    let timeStr = '';
    if (event.timeEurope && event.time) {
      timeStr = ` о ${event.time} за Києвом, о ${event.timeEurope} за Європою`;
    }

    return `${day} ${month} (${dayName})${timeStr}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed mb-0 inset-0 z-50 flex flex-col bg-black/50 backdrop-blur-sm">
      <div className="w-full flex flex-col h-full">
        {/* Header - Above modal */}
        <div className="flex items-center justify-between px-4 py-3 pt-10 flex-shrink-0">
          <button
            onClick={onClose}
            className="flex items-center gap-2 text-white hover:text-white/80 px-3 py-1.5 rounded-full border border-white/20 bg-white/5 backdrop-blur-sm"
          >
            <X className="w-5 h-5" />
            <span className="font-medium">Закрити</span>
          </button>
         
        </div>

        {/* Modal Content */}
        <div className="bg-white mx-4 rounded-t-3xl shadow-2xl overflow-hidden flex flex-col flex-1">
          {/* Calendar and Content - Scrollable */}
          <div className="flex-1 overflow-y-auto pb-20">
            <div className="p-4">
              <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#10A3FE] to-[#2173FF] p-4">
              {/* Month title with navigation */}
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-white" />
                </button>
                
                <h3 className="text-white text-xl font-bold">
                  {currentMonth} {year}
                </h3>
                
                <button
                  onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <ChevronRight className="w-5 h-5 text-white" />
                </button>
              </div>

              {/* Calendar grid line */}
              <div className="border-t border-white/30 mb-4" />

              {/* Days grid */}
              <div className="grid grid-cols-7 gap-2">
                {/* Empty cells for alignment */}
                {[...Array(emptyDays)].map((_, i) => (
                  <div key={`empty-${i}`} />
                ))}

                {/* Days */}
                {daysArray.map((day) => {
                  const isTodayDate = isCurrentMonth && day === currentDay;
                  const hasEvents = importantDates.includes(day);
                  const isSelected = selectedDay === day;
                  const dayEvents = eventsByDate[day] || [];

                  return (
                    <button
                      key={day}
                      onClick={() => setSelectedDay(hasEvents ? day : null)}
                      className={`
                        relative aspect-square rounded-xl flex flex-col items-center justify-center text-sm font-medium transition-all
                        ${isSelected
                          ? 'bg-white text-[#2173FF] shadow-xl scale-105 ring-2 ring-white/50'
                          : isTodayDate 
                            ? 'bg-white/30 text-white ring-1 ring-white/40' 
                            : hasEvents 
                              ? 'bg-white text-[#2173FF] hover:scale-105 shadow-md hover:shadow-lg' 
                              : 'bg-white/10 text-white/70 hover:bg-white/20'
                        }
                      `}
                    >
                      {day}
                      {hasEvents && dayEvents.length > 1 && !isSelected && (
                        <span className="absolute -bottom-0.5 text-[10px] font-bold opacity-70">
                          •••
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Day Details - In Your Style */}
            {selectedDay && selectedDayEvents.length > 0 && (
              <div className="mt-4 animate-in slide-in-from-top duration-300">
                <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
                    <h3 className="text-gray-900 font-bold text-lg">
                      {selectedDay} {monthNames[month].toLowerCase()}
                    </h3>
                    <button
                      onClick={() => setSelectedDay(null)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    {selectedDayEvents.map((event) => (
                      <div
                        key={event._id}
                        className="border-l-4 border-blue-500 pl-4 py-2"
                      >
                        {/* Event Type Badge */}
                        <div className="flex items-start justify-between mb-2">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-blue-700">
                            {event.type === 'live_stream' && 'Прямий ефір'}
                            {event.type === 'zoom_meeting' && 'Zoom-зустріч'}
                            {event.type === 'module_opening' && 'Відкриття модуля'}
                            {event.type === 'platform_opening' && 'Старт платформи'}
                            {event.type === 'group_meeting' && 'Групова зустріч'}
                          </span>
                          {event.isCompleted && (
                            <span className="text-green-600 text-sm">✓</span>
                          )}
                        </div>

                        {/* Event Title */}
                        <h4 className="text-gray-900 font-bold text-base mb-2">
                          {event.title}
                        </h4>

                        {/* Time */}
                        {(event.time || event.timeEurope) && (
                          <div className="inline-block text-sm font-semibold text-[#2466FF] bg-blue-50 px-3 py-1.5 rounded-lg mb-2">
                            {event.time && event.timeEurope ? (
                              <span>{event.time} за Києвом, {event.timeEurope} за Європою</span>
                            ) : event.time ? (
                              <span>{event.time} за Києвом</span>
                            ) : (
                              <span>{event.timeEurope} за Європою</span>
                            )}
                          </div>
                        )}

                        {/* Description */}
                        {event.description && (
                          <p className="text-gray-700 text-sm mb-2">
                            {event.description}
                          </p>
                        )}

                        {/* Speaker */}
                        {event.speaker && (
                          <div className="text-sm text-gray-600 mb-2">
                            Спікер: <span className="font-medium text-gray-900">{event.speaker}</span>
                          </div>
                        )}

                        {/* Notes */}
                        {event.notes && (
                          <div className="mt-2 p-2 bg-gray-50 border border-gray-200 rounded-md">
                            <p className="text-gray-600 text-xs">
                              {event.notes}
                            </p>
                          </div>
                        )}

                        {/* Tags */}
                        {event.tags && event.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {event.tags.map((tag, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Schedule section */}
            <div className="mt-4">
              <h2 className="text-lg font-bold text-gray-900 mb-3 border-b border-gray-200 pb-3">
                🗓 Актуальні події
              </h2>

              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : upcomingEvents.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Немає заплановованих подій
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingEvents.map((event) => {
                    const eventDate = new Date(event.date);
                    const day = eventDate.getDate();
                    const monthNames = [
                      'січня', 'лютого', 'березня', 'квітня', 'травня', 'червня',
                      'липня', 'серпня', 'вересня', 'жовтня', 'листопада', 'грудня'
                    ];
                    const month = monthNames[eventDate.getMonth()];
                    const dayNames = ['неділя', 'понеділок', 'вівторок', 'середа', 'четвер', 'п\'ятниця', 'субота'];
                    const dayName = dayNames[eventDate.getDay()];

                    return (
                      <div 
                        key={event._id} 
                        className={`bg-white rounded-2xl p-4 shadow-sm border border-gray-200 ${
                          event.isCompleted ? 'opacity-60' : ''
                        }`}
                      >
                        {/* Дата і час - головний акцент */}
                        <div className="flex items-start gap-3 mb-3">
                          <div className="flex-shrink-0 mt-0.5">
                            {event.isCompleted ? (
                              <span className="text-2xl">✅</span>
                            ) : (
                              <span className="text-2xl">🗓</span>
                            )}
                          </div>
                          <div className="flex-1">
                            {/* Дата - великим жирним */}
                            <div className="mb-2">
                              <span className="text-xl font-bold text-gray-900">
                                {day} {month} ({dayName})
                              </span>
                            </div>
                            
                            {/* Час - простий формат */}
                            {(event.time || event.timeEurope) && (
                              <div className="inline-block text-sm font-semibold text-[#2466FF] bg-blue-50 px-3 py-1.5 rounded-lg mb-2">
                                {event.time && event.timeEurope ? (
                                  <span>{event.time} за Києвом, {event.timeEurope} за Європою</span>
                                ) : event.time ? (
                                  <span>{event.time} за Києвом</span>
                                ) : (
                                  <span>{event.timeEurope} за Європою</span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Назва події */}
                        <p className="text-base font-semibold text-gray-900 mb-2 pl-11">
                          {event.title}
                        </p>

                        {/* Додаткова інформація */}
                        <div className="pl-11 space-y-1.5">
                          {event.description && (
                            <p className="text-sm text-gray-600 leading-relaxed">
                              {event.description}
                            </p>
                          )}
                          {event.speaker && (
                            <p className="text-sm text-gray-600">
                              <span className="font-medium text-gray-900">Спікер:</span> {event.speaker}
                            </p>
                          )}
                          {event.notes && (
                            <p className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                              {event.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
