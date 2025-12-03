'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Calendar, Clock } from 'lucide-react';
import { scheduleService, ScheduleEvent } from '@/lib/services/schedule.service';

export default function AdminSchedulePage() {
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<ScheduleEvent | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    timeEurope: '',
    type: '',
    link: '',
    speaker: '',
    isCompleted: false,
    notes: '',
    tags: [] as string[],
  });

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const data = await scheduleService.getAllEvents();
      // Сортуємо події за датою
      data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      setEvents(data);
    } catch (error) {
      console.error('Failed to load events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingEvent) {
        await scheduleService.updateEvent(editingEvent._id, formData);
      } else {
        await scheduleService.createEvent(formData);
      }
      
      await loadEvents();
      closeModal();
    } catch (error: any) {
      console.error('Failed to save event:', error);
      alert(error.response?.data?.message || 'Помилка збереження події');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Видалити цю подію?')) return;
    
    try {
      await scheduleService.deleteEvent(id);
      await loadEvents();
    } catch (error) {
      console.error('Failed to delete event:', error);
      alert('Помилка видалення події');
    }
  };

  const openModal = (event?: ScheduleEvent) => {
    if (event) {
      setEditingEvent(event);
      setFormData({
        title: event.title,
        description: event.description || '',
        date: new Date(event.date).toISOString().split('T')[0],
        time: event.time || '',
        timeEurope: event.timeEurope || '',
        type: event.type as any,
        link: event.link || '',
        speaker: event.speaker || '',
        isCompleted: event.isCompleted || false,
        notes: event.notes || '',
        tags: event.tags || [],
      });
    } else {
      setEditingEvent(null);
      setFormData({
        title: '',
        description: '',
        date: '',
        time: '',
        timeEurope: '',
        type: '' as any,
        link: '',
        speaker: '',
        isCompleted: false,
        notes: '',
        tags: [],
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingEvent(null);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('uk-UA', { 
      day: 'numeric', 
      month: 'long',
      year: 'numeric' 
    });
  };

  const eventTypeLabels = {
    'online_meeting': 'Онлайн-зустріч',
    'live_stream': 'Прямий ефір',
    'zoom_meeting': 'Zoom-зустріч',
    'module_opening': 'Відкриття модуля',
    'platform_opening': 'Старт платформи',
    'group_meeting': 'Групова зустріч',
  };

  return (
    <div className="min-h-screen bg-[#F2F2F2] pb-20">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Розклад навчання</h1>
            <p className="text-gray-600 mt-1">Керування подіями та розкладом</p>
          </div>
          <button
            onClick={() => openModal()}
            className="flex items-center gap-2 px-4 py-2 bg-[#2466FF] text-white rounded-xl hover:bg-[#1557ee] transition-colors"
          >
            <Plus className="w-5 h-5" />
            Додати подію
          </button>
        </div>

        {/* Events List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2466FF]"></div>
          </div>
        ) : (
          <div className="grid gap-4">
            {events.map((event) => (
              <div
                key={event._id}
                className={`bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow ${
                  event.isCompleted ? 'opacity-60' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Type Badge */}
                    <div className="flex items-center gap-2 mb-3">
                      {event.type && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                          {eventTypeLabels[event.type as keyof typeof eventTypeLabels]}
                        </span>
                      )}
                      {event.isCompleted && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700">
                          ✓ Завершено
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {event.title}
                    </h3>

                    {/* Date and Time */}
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {formatDate(event.date)}
                      </div>
                      {(event.time || event.timeEurope) && (
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          {event.timeEurope && <span>{event.timeEurope} (ЄС)</span>}
                          {event.time && event.timeEurope && <span>•</span>}
                          {event.time && <span>{event.time} (Київ)</span>}
                        </div>
                      )}
                    </div>

                    {/* Description */}
                    {event.description && (
                      <p className="text-gray-700 mb-2">{event.description}</p>
                    )}

                    {/* Speaker */}
                    {event.speaker && (
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Спікер:</span> {event.speaker}
                      </p>
                    )}

                    {/* Notes */}
                    {event.notes && (
                      <p className="text-sm text-gray-500 mt-2 italic">
                        {event.notes}
                      </p>
                    )}

                    {/* Tags */}
                    {/* {event.tags && event.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {event.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )} */}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => openModal(event)}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(event._id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {events.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                Немає подій. Створіть першу подію.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 pb-32">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {editingEvent ? 'Редагувати подію' : 'Нова подія'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Назва події *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2466FF] text-black"
                    placeholder="Наприклад: Прямий ефір від ректора"
                  />
                </div>

                {/* Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Тип події
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2466FF] text-black"
                  >
                    <option value="">Не обрано</option>
                    <option value="online_meeting">Онлайн-зустріч</option>
                  </select>
                </div>

                {/* Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Дата *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2466FF] text-black"
                  />
                </div>

                {/* Time */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Час (Київ)
                    </label>
                    <input
                      type="time"
                      value={formData.time}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2466FF] text-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Час (Європа)
                    </label>
                    <input
                      type="time"
                      value={formData.timeEurope}
                      onChange={(e) => setFormData({ ...formData, timeEurope: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2466FF] text-black"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Опис
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2466FF] text-black"
                    rows={3}
                    placeholder="Тема або детальний опис події"
                  />
                </div>

                {/* Speaker */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Спікер
                  </label>
                  <input
                    type="text"
                    value={formData.speaker}
                    onChange={(e) => setFormData({ ...formData, speaker: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2466FF] text-black"
                    placeholder="Наприклад: Олег Лобанов"
                  />
                </div>

                {/* Link */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Посилання (Zoom/YouTube)
                  </label>
                  <input
                    type="url"
                    value={formData.link}
                    onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2466FF] text-black"
                    placeholder="https://..."
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Примітки
                  </label>
                  <input
                    type="text"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2466FF] text-black"
                    placeholder="Додаткова інформація"
                  />
                </div>

                {/* Is Completed */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isCompleted"
                    checked={formData.isCompleted}
                    onChange={(e) => setFormData({ ...formData, isCompleted: e.target.checked })}
                    className="w-4 h-4 text-[#2466FF] border-gray-300 rounded focus:ring-[#2466FF]"
                  />
                  <label htmlFor="isCompleted" className="text-sm text-gray-700">
                    Подія завершена
                  </label>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-[#2466FF] text-white font-medium rounded-xl hover:bg-[#1557ee] transition-colors"
                  >
                    {editingEvent ? 'Зберегти зміни' : 'Створити подію'}
                  </button>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-3 bg-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-300 transition-colors"
                  >
                    Скасувати
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
