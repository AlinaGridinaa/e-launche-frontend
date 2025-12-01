'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, X, Upload, Link as LinkIcon, FileText } from 'lucide-react';
import { achievementsService, UserAchievement } from '@/lib/services/achievements.service';

export default function AchievementsPage() {
  const router = useRouter();
  const [achievements, setAchievements] = useState<UserAchievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAchievement, setSelectedAchievement] = useState<UserAchievement | null>(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [formData, setFormData] = useState({
    proofText: '',
    proofFile: '',
    proofLink: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadAchievements();
  }, []);

  const loadAchievements = async () => {
    try {
      setLoading(true);
      const data = await achievementsService.getMyAchievements();
      setAchievements(data);
    } catch (error) {
      console.error('Failed to load achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAchievementClick = (achievement: UserAchievement) => {
    setSelectedAchievement(achievement);
  };

  const handleSubmit = async () => {
    if (!selectedAchievement) return;
    
    if (!formData.proofText && !formData.proofFile && !formData.proofLink) {
      alert('Будь ласка, надайте хоча б одне підтвердження');
      return;
    }

    try {
      setSubmitting(true);
      await achievementsService.submitAchievement({
        achievementId: selectedAchievement.id,
        proofText: formData.proofText,
        proofFile: formData.proofFile,
        proofLink: formData.proofLink,
      });
      
      alert('Заявку відправлено! Куратор перевірить її найближчим часом.');
      setShowSubmitModal(false);
      setSelectedAchievement(null);
      setFormData({ proofText: '', proofFile: '', proofLink: '' });
      await loadAchievements();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Помилка відправки заявки');
    } finally {
      setSubmitting(false);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'sales':
        return 'from-green-400 to-emerald-500';
      case 'content':
        return 'from-purple-400 to-pink-500';
      case 'progress':
        return 'from-blue-400 to-cyan-500';
      case 'social':
        return 'from-orange-400 to-red-500';
      default:
        return 'from-gray-400 to-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F2F2F2] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2466FF] mx-auto mb-4"></div>
          <p className="text-gray-600">Завантаження нагород...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F2F2F2] pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#2466FF] to-[#1557EE] px-4 pt-14 pb-8">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm"
          >
            <X className="w-6 h-6 text-white" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">Нагороди</h1>
            <p className="text-sm text-white/80">За проходження курсу</p>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-white/70 text-sm">Отримано</p>
            <p className="text-white text-2xl font-bold">
              {achievements.filter(a => a.isUnlocked).length} / {achievements.length}
            </p>
          </div>
          <div className="text-5xl">🏆</div>
        </div>
      </div>

      {/* Achievements Grid */}
      <div className="px-4 pt-4">
        <div className="grid grid-cols-2 gap-3">
          {achievements.map((achievement) => (
            <button
              key={achievement.id}
              onClick={() => handleAchievementClick(achievement)}
              className={`relative bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-all ${
                achievement.isUnlocked ? '' : 'opacity-60'
              }`}
            >
              {/* Lock icon for locked achievements */}
              {!achievement.isUnlocked && !achievement.isPending && (
                <div className="absolute top-2 right-2 w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                  <Lock className="w-3 h-3 text-gray-500" />
                </div>
              )}

              {/* Pending badge */}
              {achievement.isPending && (
                <div className="absolute top-2 right-2 px-2 py-0.5 bg-yellow-100 rounded-full">
                  <span className="text-xs text-yellow-700 font-medium">На розгляді</span>
                </div>
              )}

              {/* Emoji */}
              <div className="text-5xl mb-3 text-center">
                {achievement.emoji}
              </div>

              {/* Title */}
              <h3 className="text-sm font-bold text-black text-center leading-tight">
                {achievement.title}
              </h3>
            </button>
          ))}
        </div>
      </div>

      {/* Achievement Detail Modal */}
      {selectedAchievement && !showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-t-3xl shadow-2xl p-6 animate-in slide-in-from-bottom duration-300 min-h-[50vh] pb-24 relative">
            {/* Close button */}
            <button
              onClick={() => setSelectedAchievement(null)}
              className="absolute top-4 right-4 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>

            {/* Emoji */}
            <div className="text-7xl text-center mb-4">
              {selectedAchievement.emoji}
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-black text-center mb-2">
              {selectedAchievement.title}
            </h2>

            {/* Description */}
            <p className="text-gray-600 text-center mb-6">
              {selectedAchievement.description}
            </p>

            {/* Status */}
            {selectedAchievement.isUnlocked && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
                <p className="text-green-700 text-center font-medium">
                  ✅ Нагороду отримано!
                </p>
                {selectedAchievement.curatorComment && (
                  <p className="text-green-600 text-sm text-center mt-2">
                    {selectedAchievement.curatorComment}
                  </p>
                )}
              </div>
            )}

            {selectedAchievement.isPending && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-4">
                <p className="text-yellow-700 text-center font-medium">
                  ⏳ Заявка на розгляді
                </p>
                <p className="text-yellow-600 text-sm text-center mt-2">
                  Куратор перевірить вашу заявку найближчим часом
                </p>
              </div>
            )}

            {selectedAchievement.isRejected && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
                <p className="text-red-700 text-center font-medium">
                  ❌ Заявку відхилено
                </p>
                {selectedAchievement.curatorComment && (
                  <p className="text-red-600 text-sm text-center mt-2">
                    {selectedAchievement.curatorComment}
                  </p>
                )}
              </div>
            )}

            {/* Submit button */}
            {!selectedAchievement.isUnlocked && (
              <button
                onClick={() => setShowSubmitModal(true)}
                className="w-full py-4 bg-[#2466FF] text-white font-bold rounded-2xl hover:bg-[#1557ee] transition-colors"
              >
                🔵 Отримати нагороду
              </button>
            )}
          </div>
        </div>
      )}

      {/* Submit Modal */}
      {showSubmitModal && selectedAchievement && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm ">
          <div className="w-full max-w-md bg-white rounded-t-3xl shadow-2xl p-6 max-h-[90vh] min-h-[80vh] overflow-y-autop pb-24">
            {/* Close button */}
            <button
              onClick={() => setShowSubmitModal(false)}
              className="absolute top-4 right-4 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>

            <h2 className="text-xl font-bold text-black mb-2">
              Підтвердження нагороди
            </h2>
            <p className="text-gray-600 text-sm mb-6">
              Відправте скріншот підтвердження куратору, щоб ми відкрили для вас нагороду.
            </p>

            {/* Form */}
            <div className="space-y-4">
              {/* Text */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FileText className="w-4 h-4 inline mr-1" />
                  Текст опису
                </label>
                <textarea
                  value={formData.proofText}
                  onChange={(e) => setFormData({ ...formData, proofText: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2466FF] text-black"
                  rows={3}
                  placeholder="Опишіть вашу перемогу..."
                />
              </div>

              {/* File URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Upload className="w-4 h-4 inline mr-1" />
                  Посилання на файл/скріншот
                </label>
                <input
                  type="url"
                  value={formData.proofFile}
                  onChange={(e) => setFormData({ ...formData, proofFile: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2466FF] text-black"
                  placeholder="https://..."
                />
              </div>

              {/* Link */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <LinkIcon className="w-4 h-4 inline mr-1" />
                  Додаткове посилання
                </label>
                <input
                  type="url"
                  value={formData.proofLink}
                  onChange={(e) => setFormData({ ...formData, proofLink: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2466FF] text-black"
                  placeholder="https://..."
                />
              </div>

              {/* Submit button */}
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full py-4 bg-[#2466FF] text-white font-bold rounded-2xl hover:bg-[#1557ee] transition-colors disabled:opacity-50"
              >
                {submitting ? 'Відправка...' : 'Відправити на розгляд'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
