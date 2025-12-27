'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, BookOpen, Users, ClipboardCheck } from 'lucide-react';
import { curatorService, Homework, Student, CuratorModule } from '@/lib/services/curator.service';
import AudioRecorder from '@/components/AudioRecorder';

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
  const [showAudioRecorder, setShowAudioRecorder] = useState(false);
  const [audioFeedbackUrl, setAudioFeedbackUrl] = useState<string | null>(null);
  const [uploadingAudio, setUploadingAudio] = useState(false);
  
  // Фільтрація та пошук
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'reviewed' | 'approved' | 'needs_revision'>('all');
  const [filterStudent, setFilterStudent] = useState<string>('all');

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

  const handleAudioRecorded = async (audioBlob: Blob) => {
    try {
      setUploadingAudio(true);
      console.log('Audio blob size:', audioBlob.size, 'bytes');
      console.log('Audio blob type:', audioBlob.type);
      const result = await curatorService.uploadAudioFeedback(audioBlob);
      setAudioFeedbackUrl(result.audioUrl);
      setShowAudioRecorder(false);
      alert('Голосовий коментар збережено! 🎙️');
    } catch (error: any) {
      console.error('Failed to upload audio:', error);
      console.error('Error response:', error.response?.data);
      alert(`Помилка завантаження аудіо: ${error.response?.data?.message || error.message || 'Невідома помилка'}`);
    } finally {
      setUploadingAudio(false);
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
    if (!selectedHomework) {
      return;
    }

    if (reviewScore < 0 || reviewScore > 100) {
      alert('Оцінка має бути від 0 до 100');
      return;
    }

    try {
      setReviewing(true);
      await curatorService.reviewHomework(selectedHomework.id, reviewScore, reviewFeedback, audioFeedbackUrl || undefined);
      
      // Оновлюємо локальний стан
      setHomeworks(homeworks.map(hw => 
        hw.id === selectedHomework.id 
          ? { ...hw, status: 'reviewed', score: reviewScore, feedback: reviewFeedback, audioFeedback: audioFeedbackUrl || undefined, reviewedAt: new Date() }
          : hw
      ));
      
      setSelectedHomework(null);
      setReviewScore(0);
      setReviewFeedback('');
      setAudioFeedbackUrl(null);
      setShowAudioRecorder(false);
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
      await curatorService.returnForRevision(selectedHomework.id, reviewFeedback, audioFeedbackUrl || undefined);
      
      // Оновлюємо локальний стан
      setHomeworks(homeworks.map(hw => 
        hw.id === selectedHomework.id 
          ? { ...hw, status: 'needs_revision', feedback: reviewFeedback, audioFeedback: audioFeedbackUrl || undefined, reviewedAt: new Date(), score: undefined }
          : hw
      ));
      
      setSelectedHomework(null);
      setReviewScore(0);
      setReviewFeedback('');
      setAudioFeedbackUrl(null);
      setShowAudioRecorder(false);
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

  // Фільтрація домашніх завдань
  const filteredHomeworks = homeworks.filter((hw) => {
    // Фільтр по пошуку (ім'я студента або номер модуля)
    const matchesSearch = searchQuery === '' || 
      hw.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hw.moduleTitle.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Фільтр по статусу
    const matchesStatus = filterStatus === 'all' || hw.status === filterStatus;
    
    // Фільтр по студенту
    const matchesStudent = filterStudent === 'all' || hw.studentId === filterStudent;
    
    return matchesSearch && matchesStatus && matchesStudent;
  });

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
      <div className="px-4 mt-4 pb-20">
        {activeTab === 'homeworks' && (
          <div className="space-y-4">
            {/* Пошук та фільтрація */}
            <div className="space-y-3">
              {/* Пошук */}
              <input
                type="text"
                placeholder="🔍 Пошук по студенту або модулю..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2466FF] text-black text-sm"
              />
              
              {/* Фільтри */}
              <div className="grid grid-cols-2 gap-2">
                {/* Фільтр по статусу */}
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2466FF] text-black text-sm"
                >
                  <option value="all">Всі статуси</option>
                  <option value="pending">Очікує</option>
                  <option value="reviewed">Перевірено</option>
                  <option value="approved">Затверджено</option>
                  <option value="needs_revision">На доопрацюванні</option>
                </select>
                
                {/* Фільтр по студенту */}
                <select
                  value={filterStudent}
                  onChange={(e) => setFilterStudent(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2466FF] text-black text-sm"
                >
                  <option value="all">Всі студенти</option>
                  {students.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.firstName} {student.lastName}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Лічильник результатів */}
              {(searchQuery || filterStatus !== 'all' || filterStudent !== 'all') && (
                <p className="text-xs text-gray-500">
                  Знайдено: <span className="font-bold text-gray-700">{filteredHomeworks.length}</span> завдань
                </p>
              )}
            </div>

            {filteredHomeworks.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-sm text-gray-500">
                  {homeworks.length === 0 ? 'Домашніх завдань немає' : 'За фільтрами нічого не знайдено'}
                </p>
              </div>
            ) : (
              filteredHomeworks.map((homework) => (
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

            <div className="p-6 space-y-4 ">
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs font-medium text-gray-600 mb-2">Відповідь студента:</p>
                <p className="text-sm text-gray-700">{selectedHomework.answer}</p>
              </div>

              {/* Прикріплені посилання */}
              {selectedHomework.attachments && selectedHomework.attachments.length > 0 && (
                <div className="bg-blue-50 rounded-xl p-4">
                  <p className="text-xs font-medium text-gray-600 mb-2">Прикріплені посилання:</p>
                  <div className="space-y-2">
                    {selectedHomework.attachments.map((url: string, index: number) => (
                      <a
                        key={index}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-sm text-[#2466FF] hover:underline truncate"
                      >
                        {url}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Завантажені файли */}
              {selectedHomework.fileAttachments && selectedHomework.fileAttachments.length > 0 && (
                <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                  <p className="text-xs font-medium text-gray-600 mb-2">📁 Завантажені файли:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedHomework.fileAttachments.map((url: string, index: number) => {
                      const fileName = url.split('/').pop() || 'Файл';
                      // Cloudinary зображення мають /image/upload/ в URL
                      const isImage = url.includes('/image/upload/') || /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
                      
                      return (
                        <div key={index} className="relative group">
                          {isImage ? (
                            <a
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block rounded-lg overflow-hidden border-2 border-green-200 hover:border-green-400 transition-colors"
                            >
                              <img 
                                src={url} 
                                alt={fileName}
                                className="w-full h-32 object-cover"
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                                <svg className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                                </svg>
                              </div>
                            </a>
                          ) : (
                            <a
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 p-3 rounded-lg border-2 border-green-200 hover:border-green-400 transition-colors bg-white"
                            >
                              <svg className="w-6 h-6 flex-shrink-0 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                              </svg>
                              <span className="text-xs text-green-700 truncate">{fileName}</span>
                            </a>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Оцінка (0-100 балів) {reviewScore > 0 && '(опціонально)'}
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={reviewScore}
                  onChange={(e) => setReviewScore(Number(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2466FF] text-black"
                  placeholder="Залиште пустим, якщо оцінка не потрібна"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Коментар (опціонально)
                </label>
                <textarea
                  value={reviewFeedback}
                  onChange={(e) => setReviewFeedback(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2466FF] text-black resize-none"
                  placeholder="Залиште коментар для студента..."
                />
                <p className="text-xs text-gray-500 mt-1.5">
                  💡 Коментар можна додати як при прийнятті, так і при поверненні роботи
                </p>
              </div>

              {/* Голосовий коментар */}
              <div>
                {!showAudioRecorder && !audioFeedbackUrl && (
                  <button
                    onClick={() => setShowAudioRecorder(true)}
                    className="w-full py-3 border-2 border-dashed border-[#2466FF] text-[#2466FF] rounded-xl hover:bg-[#2466FF]/5 transition-colors flex items-center justify-center gap-2"
                  >
                    🎙️ Додати голосовий коментар
                  </button>
                )}

                {showAudioRecorder && (
                  <AudioRecorder
                    onAudioRecorded={handleAudioRecorded}
                    onCancel={() => setShowAudioRecorder(false)}
                  />
                )}

                {audioFeedbackUrl && !showAudioRecorder && (
                  <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-green-700">✅ Голосовий коментар додано</p>
                      <button
                        onClick={() => {
                          setAudioFeedbackUrl(null);
                          setShowAudioRecorder(true);
                        }}
                        className="text-sm text-red-600 hover:text-red-700"
                      >
                        ❌ Видалити
                      </button>
                    </div>
                    <audio src={audioFeedbackUrl} controls className="w-full" />
                  </div>
                )}

                {uploadingAudio && (
                  <div className="text-center py-4">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#2466FF]"></div>
                    <p className="text-sm text-gray-600 mt-2">Завантаження...</p>
                  </div>
                )}
              </div>

              <div className="space-y-3 pt-4 pb-12">
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
