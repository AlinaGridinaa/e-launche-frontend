'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

interface LessonRatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (moodRating: number, usefulnessRating: number) => Promise<void>;
  lessonTitle: string;
}

const moodEmojis = ['😞', '😐', '🙂', '😀', '😄'];
const moodLabels = ['Погано', 'Нормально', 'Добре', 'Відмінно', 'Чудово'];

export default function LessonRatingModal({
  isOpen,
  onClose,
  onSubmit,
  lessonTitle,
}: LessonRatingModalProps) {
  const [moodRating, setMoodRating] = useState<number | null>(null);
  const [usefulnessRating, setUsefulnessRating] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      // Відправляємо оцінки (або 0, якщо не поставлено)
      await onSubmit(moodRating || 0, usefulnessRating || 0);
      onClose();
    } catch (error) {
      console.error('Failed to submit rating:', error);
      alert('Помилка при збереженні оцінок');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSkip = () => {
    // Відправляємо без оцінок
    onSubmit(0, 0).then(() => onClose());
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-black">Оцініть урок</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div>
            <p className="text-sm text-gray-600 mb-4">{lessonTitle}</p>
          </div>

          {/* Mood Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Настрій після уроку: <span className="text-gray-400 text-xs font-normal">(необов'язково)</span>
            </label>
            <div className="flex justify-between gap-2">
              {moodEmojis.map((emoji, index) => (
                <button
                  key={index}
                  onClick={() => setMoodRating(index + 1)}
                  className={`flex-1 aspect-square flex flex-col items-center justify-center rounded-xl border-2 transition-all ${
                    moodRating === index + 1
                      ? 'border-[#2466FF] bg-[#E9F0FF]'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="text-3xl mb-1">{emoji}</span>
                  <span className="text-[10px] text-gray-600">{moodLabels[index]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Usefulness Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Наскільки зрозуміла інформація? <span className="text-gray-400 text-xs font-normal">(необов'язково)</span>
            </label>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setUsefulnessRating(star)}
                  className="transition-all hover:scale-110"
                >
                  <span
                    className={`text-5xl ${
                      usefulnessRating && star <= usefulnessRating
                        ? 'text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  >
                    ⭐
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Already rated message */}
          {moodRating && usefulnessRating && (
            <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-3 rounded-xl">
              <span>✓</span>
              <span>Дякуємо за оцінку!</span>
            </div>
          )}

          {/* Buttons */}
          <div className="flex flex-col gap-3 pt-4">
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full px-4 py-3 bg-[#2466FF] text-white font-medium rounded-xl hover:bg-[#1557ee] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Збереження...' : 'Позначити як пройдений'}
            </button>
            <button
              onClick={handleSkip}
              disabled={submitting}
              className="w-full px-4 py-3 bg-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-300 transition-colors disabled:opacity-50"
            >
              Пропустити оцінку
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
