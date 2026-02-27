'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, BookOpen, Users, ClipboardCheck, Award, ExternalLink, FileText, Link as LinkIcon, CheckCircle, XCircle } from 'lucide-react';
import { curatorService, Homework, Student, CuratorModule } from '@/lib/services/curator.service';
import { achievementsService } from '@/lib/services/achievements.service';
import AudioRecorder from '@/components/AudioRecorder';

export default function CuratorPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'homeworks' | 'modules' | 'students' | 'achievements'>('homeworks');
  const [homeworks, setHomeworks] = useState<Homework[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [modules, setModules] = useState<CuratorModule[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [selectedAchievement, setSelectedAchievement] = useState<any | null>(null);
  const [reviewingAchievement, setReviewingAchievement] = useState(false);
  const [achievementComment, setAchievementComment] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [selectedHomework, setSelectedHomework] = useState<Homework | null>(null);
  const [reviewScore, setReviewScore] = useState<number>(0);
  const [reviewFeedback, setReviewFeedback] = useState<string>('');
  const [reviewing, setReviewing] = useState(false);
  const [showAudioRecorder, setShowAudioRecorder] = useState(false);
  const [audioFeedbackUrl, setAudioFeedbackUrl] = useState<string | null>(null);
  const [uploadingAudio, setUploadingAudio] = useState(false);
  const [previewFile, setPreviewFile] = useState<string | null>(null);
  const [previewBlob, setPreviewBlob] = useState<string | null>(null);
  const [previewFileType, setPreviewFileType] = useState<string>('');
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [previewError, setPreviewError] = useState(false);
  
  // Фільтрація та пошук
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'reviewed' | 'approved' | 'needs_revision'>('all');
  const [filterStudent, setFilterStudent] = useState<string>('all');

  useEffect(() => {
    checkCuratorAccess();
    loadData();
  }, []);

  // Cleanup blob URL when preview closes
  useEffect(() => {
    if (!previewFile && previewBlob) {
      URL.revokeObjectURL(previewBlob);
      setPreviewBlob(null);
      setPreviewFileType('');
    }
  }, [previewFile]);

  // Load file as blob when preview opens
  useEffect(() => {
    if (previewFile) {
      loadFileAsBlob(previewFile);
    }
  }, [previewFile]);

  const detectFileTypeFromMagicBytes = async (blob: Blob): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const arr = new Uint8Array(reader.result as ArrayBuffer);
        
        // Перевіряємо magic bytes (file signature)
        if (arr.length >= 4) {
          // PNG: 89 50 4E 47
          if (arr[0] === 0x89 && arr[1] === 0x50 && arr[2] === 0x4E && arr[3] === 0x47) {
            return resolve('image/png');
          }
          // JPEG: FF D8 FF
          if (arr[0] === 0xFF && arr[1] === 0xD8 && arr[2] === 0xFF) {
            return resolve('image/jpeg');
          }
          // GIF: 47 49 46 38
          if (arr[0] === 0x47 && arr[1] === 0x49 && arr[2] === 0x46 && arr[3] === 0x38) {
            return resolve('image/gif');
          }
          // WEBP: 52 49 46 46 ... 57 45 42 50
          if (arr[0] === 0x52 && arr[1] === 0x49 && arr[2] === 0x46 && arr[3] === 0x46) {
            if (arr.length >= 12 && arr[8] === 0x57 && arr[9] === 0x45 && arr[10] === 0x42 && arr[11] === 0x50) {
              return resolve('image/webp');
            }
          }
          // PDF: 25 50 44 46
          if (arr[0] === 0x25 && arr[1] === 0x50 && arr[2] === 0x44 && arr[3] === 0x46) {
            return resolve('application/pdf');
          }
        }
        
        resolve('application/octet-stream');
      };
      reader.readAsArrayBuffer(blob.slice(0, 12));
    });
  };

  const loadFileAsBlob = async (url: string) => {
    setIsLoadingPreview(true);
    setPreviewError(false);
    setPreviewBlob(null);
    setPreviewFileType('');

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch file');
      }
      const blob = await response.blob();
      
      // Визначаємо тип файлу за пріоритетом:
      // 1. Magic bytes (для старих файлів без розширень)
      // 2. Розширення з URL
      // 3. Blob type з серверу
      let fileType = blob.type;
      
      if (!fileType || fileType === 'application/octet-stream') {
        // Спочатку перевіряємо magic bytes
        const detectedType = await detectFileTypeFromMagicBytes(blob);
        
        if (detectedType !== 'application/octet-stream') {
          fileType = detectedType;
        } else {
          // Якщо не вдалося визначити за magic bytes, пробуємо за розширенням
          const extension = url.split('.').pop()?.toLowerCase();
          const mimeTypes: Record<string, string> = {
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'png': 'image/png',
            'gif': 'image/gif',
            'webp': 'image/webp',
            'pdf': 'application/pdf',
            'doc': 'application/msword',
            'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
          };
          fileType = mimeTypes[extension || ''] || 'application/octet-stream';
        }
      }
      
      const blobUrl = URL.createObjectURL(blob);
      setPreviewBlob(blobUrl);
      setPreviewFileType(fileType);
      console.log('URL:', url);
      console.log('Original blob type:', blob.type);
      console.log('Detected file type:', fileType);
    } catch (error) {
      console.error('Error loading file:', error);
      setPreviewError(true);
    } finally {
      setIsLoadingPreview(false);
    }
  };

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
      const [homeworksData, studentsData, modulesData, achievementsData] = await Promise.all([
        curatorService.getHomeworks(),
        curatorService.getMyStudents(),
        curatorService.getAllModules(),
        achievementsService.getPendingAchievements(),
      ]);
      setHomeworks(homeworksData);
      setStudents(studentsData);
      setModules(modulesData);
      setAchievements(achievementsData);
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

  const handleApproveAchievement = async () => {
    if (!selectedAchievement) return;

    try {
      setReviewingAchievement(true);
      await achievementsService.approveAchievement(selectedAchievement._id, achievementComment || undefined);
      
      // Оновлюємо локальний стан
      setAchievements(achievements.filter(a => a._id !== selectedAchievement._id));
      setSelectedAchievement(null);
      setAchievementComment('');
      alert('Нагороду схвалено! 🏆');
    } catch (error: any) {
      console.error('Failed to approve achievement:', error);
      alert(error.response?.data?.message || 'Помилка схвалення');
    } finally {
      setReviewingAchievement(false);
    }
  };

  const handleRejectAchievement = async () => {
    if (!selectedAchievement) return;

    if (!achievementComment.trim()) {
      alert('Введіть коментар для студента');
      return;
    }

    try {
      setReviewingAchievement(true);
      await achievementsService.rejectAchievement(selectedAchievement._id, achievementComment);
      
      // Оновлюємо локальний стан
      setAchievements(achievements.filter(a => a._id !== selectedAchievement._id));
      setSelectedAchievement(null);
      setAchievementComment('');
      alert('Заявку відхилено');
    } catch (error: any) {
      console.error('Failed to reject achievement:', error);
      alert(error.response?.data?.message || 'Помилка відхилення');
    } finally {
      setReviewingAchievement(false);
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
      <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#2466FF] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm text-gray-500">Завантаження...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] pb-24">
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
            <p className="text-xs text-white/80">Нагород</p>
            <p className="text-2xl font-bold text-white">{achievements.length}</p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
            <p className="text-xs text-white/80">Студентів</p>
            <p className="text-2xl font-bold text-white">{students.length}</p>
          </div>
        </div>
      </div>

      {/* Таби */}
      <div className="px-4 mt-4">
        <div className="flex gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('homeworks')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === 'homeworks'
                ? 'bg-[#2466FF] text-white'
                : 'bg-white text-gray-700'
            }`}
          >
            <ClipboardCheck className="w-4 h-4" />
            Домашні завдання
          </button>
          <button
            onClick={() => setActiveTab('achievements')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === 'achievements'
                ? 'bg-[#2466FF] text-white'
                : 'bg-white text-gray-700'
            }`}
          >
            <Award className="w-4 h-4" />
            Нагороди {achievements.length > 0 && <span className="ml-1 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">{achievements.length}</span>}
          </button>
          <button
            onClick={() => setActiveTab('modules')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${
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
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${
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

        {activeTab === 'achievements' && (
          <div className="space-y-3">
            {achievements.length === 0 ? (
              <div className="text-center py-12">
                <Award className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">Немає заявок на нагороди</p>
              </div>
            ) : (
              achievements.map((achievement) => (
                <div
                  key={achievement._id}
                  onClick={() => setSelectedAchievement(achievement)}
                  className="bg-white rounded-2xl p-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-3">
                    <div className="text-3xl">{achievement.achievementType?.emoji || '🏆'}</div>
                    <div className="flex-1">
                      <h3 className="font-bold text-sm text-black mb-1">
                        {achievement.achievementType?.title || 'Нагорода'}
                      </h3>
                      <p className="text-xs text-gray-600 mb-2">
                        {achievement.userId?.firstName} {achievement.userId?.lastName}
                      </p>
                      <p className="text-xs text-gray-500">
                        📅 {new Date(achievement.submittedAt).toLocaleDateString('uk-UA', { 
                          day: 'numeric', 
                          month: 'long',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <ChevronLeft className="w-5 h-5 text-gray-400 rotate-180" />
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Модальне вікно оцінювання */}
      {selectedHomework && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-t-3xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto pb-24">
            {/* Close button */}
            <button
              onClick={() => setSelectedHomework(null)}
              className="absolute top-4 right-4 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h2 className="text-xl font-bold text-black mb-2">Оцінити завдання</h2>
            <p className="text-sm text-gray-600 mb-6">
              {selectedHomework.studentName} - Модуль {selectedHomework.moduleNumber}, Урок {selectedHomework.lessonNumber}
            </p>

            <div className="space-y-4">
              <div className="bg-gray-50 rounded-xl p-3 sm:p-4">
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
                <div className="bg-green-50 rounded-xl p-3 sm:p-4 border border-green-200">
                  <p className="text-xs font-medium text-gray-600 mb-2">📁 Завантажені файли:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedHomework.fileAttachments.map((url: string, index: number) => {
                      const fileName = url.split('/').pop() || 'Файл';
                      const isImage = url.includes('/image/upload/') || /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
                      
                      return (
                        <div key={index} className="relative group">
                          {isImage ? (
                            <button
                              onClick={() => setPreviewFile(url)}
                              className="block rounded-lg overflow-hidden border-2 border-green-200 hover:border-green-400 active:border-green-500 transition-colors w-full"
                            >
                              <img 
                                src={url} 
                                alt={fileName}
                                className="w-full h-24 sm:h-32 object-cover"
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                                </svg>
                              </div>
                            </button>
                          ) : (
                            <button
                              onClick={() => setPreviewFile(url)}
                              className="flex flex-col items-center justify-center gap-1 p-2 sm:p-3 rounded-lg border-2 border-green-200 hover:border-green-400 active:border-green-500 transition-colors bg-white h-24 sm:h-32 w-full"
                            >
                              <svg className="w-8 h-8 sm:w-10 sm:h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                              </svg>
                              <span className="text-[10px] sm:text-xs text-green-700 text-center truncate w-full px-1">{fileName.length > 12 ? fileName.slice(0, 9) + '...' : fileName}</span>
                              <span className="text-[10px] sm:text-xs text-green-600 font-medium">👁️ Переглянути</span>
                            </button>
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

              {/* Кнопки дій */}
              <div className="flex gap-2 mt-6">
                <button
                  onClick={handleReviewSubmit}
                  disabled={reviewing}
                  className="flex-1 px-4 py-3 bg-[#2466FF] text-white font-bold rounded-2xl hover:bg-[#1557ee] active:bg-[#1557ee] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {reviewing ? 'Збереження...' : 'Виставити оцінку'}
                </button>
                <button
                  onClick={handleReturnForRevision}
                  disabled={reviewing || !reviewFeedback.trim()}
                  className={`flex-1 px-4 py-3 text-white font-bold rounded-2xl transition-colors ${
                    !reviewFeedback.trim() 
                      ? 'bg-gray-300 cursor-not-allowed' 
                      : 'bg-orange-500 hover:bg-orange-600 active:bg-orange-600'
                  } disabled:opacity-50`}
                  title={!reviewFeedback.trim() ? 'Введіть коментар перед поверненням' : 'Повернути на доопрацювання'}
                >
                  🔄 Повернути
                </button>
              </div>

              <button
                onClick={() => setSelectedHomework(null)}
                className="w-full px-4 py-3 bg-gray-200 text-gray-700 font-bold rounded-2xl hover:bg-gray-300 active:bg-gray-300 transition-colors"
              >
                Скасувати
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Модальне вікно для перегляду файлів */}
      {previewFile && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setPreviewFile(null)}
        >
          <div 
            className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Перегляд файлу</h3>
              <button
                onClick={() => setPreviewFile(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-hidden p-4">
              {isLoadingPreview ? (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                    <p className="text-gray-600">Завантаження файлу...</p>
                  </div>
                </div>
              ) : previewError ? (
                <div className="w-full h-full flex flex-col items-center justify-center gap-4">
                  <svg className="w-20 h-20 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-red-600 text-center font-medium">
                    ❌ Не вдалося завантажити файл
                  </p>
                  <p className="text-gray-500 text-sm text-center">
                    Спробуйте завантажити файл напряму
                  </p>
                  <a
                    href={previewFile!}
                    download
                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Завантажити файл
                  </a>
                </div>
              ) : previewBlob ? (
                (() => {
                  const isImage = previewFileType.startsWith('image/');
                  const isPdf = previewFileType === 'application/pdf';
                  
                  if (isImage) {
                    return (
                      <div className="w-full h-full flex items-center justify-center">
                        <img 
                          src={previewBlob} 
                          alt="Preview" 
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                    );
                  }
                  
                  if (isPdf) {
                    return (
                      <iframe
                        src={previewBlob}
                        className="w-full h-full border-0 rounded-lg min-h-[600px]"
                        title="PDF preview"
                      />
                    );
                  }
                  
                  return (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-4">
                      <svg className="w-20 h-20 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      <p className="text-gray-600 text-center">
                        Перегляд недоступний для цього типу файлу.<br />
                        Тип: {previewFileType || 'невідомий'}
                      </p>
                      <a
                        href={previewFile!}
                        download
                        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Завантажити файл
                      </a>
                    </div>
                  );
                })()
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* Модальне вікно перегляду нагороди */}
      {selectedAchievement && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-t-3xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto pb-24">
            {/* Close button */}
            <button
              onClick={() => {
                setSelectedAchievement(null);
                setAchievementComment('');
              }}
              className="absolute top-4 right-4 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="text-center mb-6">
              <div className="text-5xl mb-3">{selectedAchievement.achievementType?.emoji || '🏆'}</div>
              <h2 className="text-xl font-bold text-black mb-2">
                {selectedAchievement.achievementType?.title || 'Нагорода'}
              </h2>
              <p className="text-sm text-gray-600 mb-1">
                {selectedAchievement.userId?.firstName} {selectedAchievement.userId?.lastName}
              </p>
              <p className="text-xs text-gray-500">
                {selectedAchievement.userId?.email}
              </p>
            </div>

            <div className="space-y-4">
              {/* Опис нагороди */}
              <div className="bg-purple-50 rounded-xl p-4">
                <p className="text-xs font-medium text-purple-900 mb-1">Опис нагороди:</p>
                <p className="text-sm text-purple-700">
                  {selectedAchievement.achievementType?.description || 'Без опису'}
                </p>
              </div>

              {/* Текстове підтвердження */}
              {selectedAchievement.proofText && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs font-medium text-gray-600 mb-2 flex items-center gap-1">
                    <FileText className="w-3 h-3" /> Текстове підтвердження:
                  </p>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedAchievement.proofText}</p>
                </div>
              )}

              {/* Файл */}
              {selectedAchievement.proofFile && (
                <div className="bg-blue-50 rounded-xl p-4">
                  <p className="text-xs font-medium text-blue-900 mb-2 flex items-center gap-1">
                    <FileText className="w-3 h-3" /> Файл підтвердження:
                  </p>
                  <a
                    href={selectedAchievement.proofFile}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Відкрити файл
                  </a>
                </div>
              )}

              {/* Посилання */}
              {selectedAchievement.proofLink && (
                <div className="bg-green-50 rounded-xl p-4">
                  <p className="text-xs font-medium text-green-900 mb-2 flex items-center gap-1">
                    <LinkIcon className="w-3 h-3" /> Посилання:
                  </p>
                  <a
                    href={selectedAchievement.proofLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-green-600 hover:text-green-700 font-medium break-all"
                  >
                    <ExternalLink className="w-4 h-4" />
                    {selectedAchievement.proofLink}
                  </a>
                </div>
              )}

              {/* Коментар куратора */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Коментар для студента (опціонально)
                </label>
                <textarea
                  value={achievementComment}
                  onChange={(e) => setAchievementComment(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2466FF] text-black resize-none"
                  placeholder="Додайте коментар..."
                />
              </div>

              {/* Кнопки дій */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleRejectAchievement}
                  disabled={reviewingAchievement}
                  className="flex-1 px-4 py-3 bg-red-500 text-white font-medium rounded-xl hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <XCircle className="w-5 h-5" />
                  {reviewingAchievement ? 'Обробка...' : 'Відхилити'}
                </button>
                <button
                  onClick={handleApproveAchievement}
                  disabled={reviewingAchievement}
                  className="flex-1 px-4 py-3 bg-green-500 text-white font-medium rounded-xl hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  {reviewingAchievement ? 'Обробка...' : 'Схвалити'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
