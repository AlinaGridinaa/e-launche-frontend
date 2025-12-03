'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, BookOpen, Users, ClipboardCheck } from 'lucide-react';
import { curatorService, Homework, Student, CuratorModule } from '@/lib/services/curator.service';

export default function CuratorPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'homeworks' | 'modules' | 'students'>('homeworks');
  const [homeworks, setHomeworks] = useState<Homework[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [modules, setModules] = useState<CuratorModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedHomework, setSelectedHomework] = useState<Homework | null>(null);
  const [reviewScore, setReviewScore] = useState<number>(0);
  const [reviewFeedback, setReviewFeedback] = useState<string>('');
  const [reviewing, setReviewing] = useState(false);

  useEffect(() => {
    checkCuratorAccess();
    loadData();
  }, []);

  const checkCuratorAccess = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (!payload.isCurator) {
        router.push('/home');
      }
    } catch (error) {
      router.push('/login');
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [homeworksData, studentsData, modulesData] = await Promise.all([
        curatorService.getHomeworks(),
        curatorService.getMyStudents(),
        curatorService.getAllModules(),
      ]);
      setHomeworks(homeworksData);
      setStudents(studentsData);
      setModules(modulesData);
    } catch (error) {
      console.error('Failed to load curator data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSubmit = async () => {
    if (!selectedHomework || reviewScore < 0 || reviewScore > 100) {
      alert('Введіть коректну оцінку (0-100)');
      return;
    }

    try {
      setReviewing(true);
      await curatorService.reviewHomework(selectedHomework.id, reviewScore, reviewFeedback);
      
      // Оновлюємо локальний стан
      setHomeworks(homeworks.map(hw => 
        hw.id === selectedHomework.id 
          ? { ...hw, status: 'reviewed', score: reviewScore, feedback: reviewFeedback, reviewedAt: new Date() }
          : hw
      ));
      
      setSelectedHomework(null);
      setReviewScore(0);
      setReviewFeedback('');
      alert('Оцінку виставлено успішно! ✅');
    } catch (error: any) {
      console.error('Failed to review homework:', error);
      alert(error.response?.data?.message || 'Помилка оцінювання');
    } finally {
      setReviewing(false);
    }
  };

  const handleReturnForRevision = async () => {
    if (!selectedHomework || !reviewFeedback.trim()) {
      alert('Введіть коментар для студента');
      return;
    }

    try {
      setReviewing(true);
      await curatorService.returnForRevision(selectedHomework.id, reviewFeedback);
      
      // Оновлюємо локальний стан
      setHomeworks(homeworks.map(hw => 
        hw.id === selectedHomework.id 
          ? { ...hw, status: 'needs_revision', feedback: reviewFeedback, reviewedAt: new Date(), score: undefined }
          : hw
      ));
      
      setSelectedHomework(null);
      setReviewScore(0);
      setReviewFeedback('');
      alert('Завдання повернуто на доопрацювання 🔄');
    } catch (error: any) {
      console.error('Failed to return homework:', error);
      alert(error.response?.data?.message || 'Помилка');
    } finally {
      setReviewing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">Очікує</span>;
      case 'reviewed':
        return <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">Перевірено</span>;
      case 'approved':
        return <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">Затверджено</span>;
      case 'needs_revision':
        return <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">На доопрацюванні</span>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] max-w-md mx-auto flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#2466FF] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm text-gray-500">Завантаження...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] pb-24 max-w-md mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#2466FF] to-[#10A3FE] px-4 py-6 rounded-b-2xl">
        <div className="flex items-center gap-3 mb-4">
          <button 
            onClick={() => router.push('/home')}
            className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-2xl font-bold text-white">Панель куратора</h1>
        </div>

        {/* Статистика */}
        <div className="grid grid-cols-3 gap-2 mt-4">
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
            <p className="text-xs text-white/80">Завдань</p>
            <p className="text-2xl font-bold text-white">{homeworks.length}</p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
            <p className="text-xs text-white/80">Студентів</p>
            <p className="text-2xl font-bold text-white">{students.length}</p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
            <p className="text-xs text-white/80">Модулів</p>
            <p className="text-2xl font-bold text-white">{modules.length}</p>
          </div>
        </div>
      </div>

      {/* Таби */}
      <div className="px-4 mt-4">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('homeworks')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              activeTab === 'homeworks'
                ? 'bg-[#2466FF] text-white'
                : 'bg-white text-gray-700'
            }`}
          >
            <ClipboardCheck className="w-4 h-4" />
            Домашні завдання
          </button>
          <button
            onClick={() => setActiveTab('modules')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              activeTab === 'modules'
                ? 'bg-[#2466FF] text-white'
                : 'bg-white text-gray-700'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Модулі
          </button>
          <button
            onClick={() => setActiveTab('students')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              activeTab === 'students'
                ? 'bg-[#2466FF] text-white'
                : 'bg-white text-gray-700'
            }`}
          >
            <Users className="w-4 h-4" />
            Студенти
          </button>
        </div>
      </div>

      {/* Контент */}
      <div className="px-4 mt-4">
        {activeTab === 'homeworks' && (
          <div className="space-y-3">
            {homeworks.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-sm text-gray-500">Домашніх завдань немає</p>
              </div>
            ) : (
              homeworks.map((homework) => (
                <div
                  key={homework.id}
                  className="bg-white rounded-2xl p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-bold text-sm text-black mb-1">
                        {homework.studentName}
                      </h3>
                      <p className="text-xs text-gray-600">
                        Модуль {homework.moduleNumber}: {homework.moduleTitle}
                      </p>
                      <p className="text-xs text-gray-500">
                        Урок {homework.lessonNumber}
                      </p>
                    </div>
                    {getStatusBadge(homework.status)}
                  </div>

                  <div className="bg-gray-50 rounded-xl p-3 mb-3">
                    <p className="text-sm text-gray-700">{homework.answer}</p>
                  </div>

                  {homework.status === 'reviewed' && homework.score !== undefined && (
                    <div className="bg-green-50 rounded-xl p-3 mb-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-green-700">Оцінка:</span>
                        <span className="text-sm font-bold text-green-700">{homework.score} балів</span>
                      </div>
                      {homework.feedback && (
                        <p className="text-xs text-green-600 mt-2">{homework.feedback}</p>
                      )}
                    </div>
                  )}

                  {homework.status === 'pending' && (
                    <button
                      onClick={() => {
                        setSelectedHomework(homework);
                        setReviewScore(0);
                        setReviewFeedback('');
                      }}
                      className="w-full px-4 py-2 bg-[#2466FF] text-white text-sm font-medium rounded-xl hover:bg-[#1557ee] transition-colors"
                    >
                      Оцінити
                    </button>
                  )}

                  <p className="text-xs text-gray-400 mt-2">
                    Відправлено: {new Date(homework.submittedAt).toLocaleDateString('uk-UA')}
                  </p>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'modules' && (
          <div className="space-y-3">
            {modules.map((module) => (
              <div
                key={module.id}
                className="bg-white rounded-2xl p-4 shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-[#E9F0FF] rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-[#2466FF]">{module.number}</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-sm text-black mb-1">{module.title}</h3>
                    <p className="text-xs text-gray-600 mb-2">{module.description}</p>
                    <p className="text-xs text-gray-500">
                      {module.lessonsCount} уроків
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'students' && (
          <div className="space-y-3">
            {students.map((student) => (
              <div
                key={student.id}
                className="bg-white rounded-2xl p-4 shadow-sm"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-sm text-black mb-1">
                      {student.firstName}
                    </h3>
                    <p className="text-xs text-gray-600">{student.email}</p>
                    {student.faculty && (
                      <span className="inline-block mt-1 px-2 py-1 bg-[#E9F0FF] text-[#2466FF] text-xs font-medium rounded-full">
                        {student.faculty}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex gap-4 pt-3 border-t border-gray-100">
                  <div>
                    <p className="text-xs text-gray-500">Уроків</p>
                    <p className="text-sm font-bold text-black">{student.completedLessonsCount}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Модулів</p>
                    <p className="text-sm font-bold text-black">{student.completedModulesCount}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Заробіток</p>
                    <p className="text-sm font-bold text-black">$ {student.earnings}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Модальне вікно оцінювання */}
      {selectedHomework && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-black">Оцінити завдання</h2>
              <p className="text-sm text-gray-600 mt-1">
                {selectedHomework.studentName} - Модуль {selectedHomework.moduleNumber}, Урок {selectedHomework.lessonNumber}
              </p>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs font-medium text-gray-600 mb-2">Відповідь студента:</p>
                <p className="text-sm text-gray-700">{selectedHomework.answer}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Оцінка (0-100 балів) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={reviewScore}
                  onChange={(e) => setReviewScore(Number(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2466FF] text-black"
                  placeholder="0-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Коментар {reviewFeedback.trim() ? '(опціонально)' : ''}
                </label>
                <textarea
                  value={reviewFeedback}
                  onChange={(e) => setReviewFeedback(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2466FF] text-black resize-none"
                  placeholder="Залиште коментар для студента..."
                />
                {!reviewFeedback.trim() && (
                  <p className="text-xs text-orange-600 mt-1.5 flex items-center gap-1">
                    <span>⚠️</span>
                    <span>Коментар обов'язковий при поверненні ДЗ на доопрацювання</span>
                  </p>
                )}
              </div>

              <div className="space-y-3 pt-4">
                <div className="flex gap-3">
                  <button
                    onClick={handleReviewSubmit}
                    disabled={reviewing}
                    className="flex-1 px-4 py-3 bg-[#2466FF] text-white font-medium rounded-xl hover:bg-[#1557ee] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {reviewing ? 'Збереження...' : 'Виставити оцінку'}
                  </button>
                  <button
                    onClick={handleReturnForRevision}
                    disabled={reviewing || !reviewFeedback.trim()}
                    className={`flex-1 px-4 py-3 text-white font-medium rounded-xl transition-colors ${
                      !reviewFeedback.trim() 
                        ? 'bg-gray-300 cursor-not-allowed' 
                        : 'bg-orange-500 hover:bg-orange-600'
                    } disabled:opacity-50`}
                    title={!reviewFeedback.trim() ? 'Введіть коментар перед поверненням' : 'Повернути на доопрацювання'}
                  >
                    🔄 Повернути
                  </button>
                </div>
                <button
                  onClick={() => setSelectedHomework(null)}
                  className="w-full px-4 py-3 bg-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-300 transition-colors"
                >
                  Скасувати
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
