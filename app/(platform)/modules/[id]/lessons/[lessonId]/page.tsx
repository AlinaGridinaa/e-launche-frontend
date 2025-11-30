'use client';

import { X, Heart, Download, ChevronDown, Play, FileText, Upload, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { modulesService } from '@/lib/services/modules.service';
import { favoritesService } from '@/lib/services/favorites.service';
import { progressService } from '@/lib/services/progress.service';
import { homeworkService, Homework } from '@/lib/services/homework.service';

// Helper function to extract YouTube video ID
const getYouTubeVideoId = (url: string) => {
  if (!url) return '';
  
  try {
    // Handle different YouTube URL formats
    if (url.includes('youtube.com/watch?v=')) {
      const urlParams = new URLSearchParams(url.split('?')[1]);
      return urlParams.get('v') || '';
    } else if (url.includes('youtu.be/')) {
      const path = url.split('youtu.be/')[1];
      // Remove query parameters and extract video ID
      return path.split('?')[0].split('/')[0] || '';
    }
  } catch (error) {
    console.error('Error parsing YouTube URL:', error);
  }
  
  return '';
};

export default function LessonPage() {
  const params = useParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'info' | 'materials' | 'homework'>('info');
  const [lessonData, setLessonData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  
  // Homework states
  const [homework, setHomework] = useState<Homework | null>(null);
  const [homeworkAnswer, setHomeworkAnswer] = useState('');
  const [homeworkAttachments, setHomeworkAttachments] = useState<string[]>([]);
  const [attachmentInput, setAttachmentInput] = useState('');
  const [homeworkLoading, setHomeworkLoading] = useState(false);
  const [homeworkSubmitted, setHomeworkSubmitted] = useState(false);

  const moduleId = params.id as string;
  const lessonNumber = parseInt(params.lessonId as string);

  useEffect(() => {
    loadLesson();
    checkFavoriteStatus();
    loadHomework();
  }, [moduleId, lessonNumber]);

  const loadLesson = async () => {
    try {
      const module = await modulesService.getModuleById(moduleId);
      const lesson = module.lessons.find(l => l.number === lessonNumber);
      
      if (lesson) {
        const presentationMaterial = lesson.materials.find(m => m.type === 'pdf' || m.type === 'document');
        
        setLessonData({
          moduleId: module._id,
          moduleNumber: module.number,
          lessonNumber: lesson.number,
          title: lesson.title,
          description: lesson.description || 'Опис відео буде доступний незабаром',
          videoUrl: lesson.videoUrl,
          materials: lesson.materials,
          homework: lesson.homework || '',
          presentation: presentationMaterial ? {
            title: presentationMaterial.title || 'Завантажити презентацію до уроку',
            url: presentationMaterial.url,
          } : null,
        });
        
        // Завантажуємо статус завершення з прогресу користувача
        try {
          const status = await progressService.getLessonStatus(moduleId, lessonNumber);
          setIsCompleted(status.isCompleted);
        } catch (error) {
          console.error('Failed to load lesson status:', error);
          setIsCompleted(false);
        }
      }
    } catch (error) {
      console.error('Failed to load lesson:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkFavoriteStatus = async () => {
    try {
      const status = await favoritesService.checkIsFavorite(moduleId, lessonNumber);
      setIsFavorite(status);
    } catch (error) {
      console.error('Failed to check favorite status:', error);
    }
  };

  const loadHomework = async () => {
    try {
      const hw = await homeworkService.getMyHomework(moduleId, lessonNumber);
      if (hw) {
        setHomework(hw);
        setHomeworkAnswer(hw.answer);
        setHomeworkAttachments(hw.attachments);
        setHomeworkSubmitted(true);
      }
    } catch (error) {
      console.error('Failed to load homework:', error);
    }
  };

  const handleSubmitHomework = async () => {
    if (!homeworkAnswer.trim()) {
      alert('Будь ласка, введіть відповідь');
      return;
    }

    try {
      setHomeworkLoading(true);
      const result = await homeworkService.submitHomework({
        moduleId,
        lessonNumber,
        answer: homeworkAnswer,
        attachments: homeworkAttachments,
      });
      
      setHomework(result);
      setHomeworkSubmitted(true);
      alert('Домашнє завдання успішно відправлено! ✅');
    } catch (error: any) {
      console.error('Failed to submit homework:', error);
      alert(error.response?.data?.message || 'Помилка відправки домашнього завдання');
    } finally {
      setHomeworkLoading(false);
    }
  };

  const handleAddAttachment = () => {
    if (attachmentInput.trim()) {
      setHomeworkAttachments([...homeworkAttachments, attachmentInput.trim()]);
      setAttachmentInput('');
    }
  };

  const handleRemoveAttachment = (index: number) => {
    setHomeworkAttachments(homeworkAttachments.filter((_, i) => i !== index));
  };

  const handleMarkAsCompleted = async () => {
    try {
      const newStatus = !isCompleted;
      
      if (newStatus) {
        // Позначити як завершений
        await progressService.completeLesson(moduleId, lessonNumber);
      } else {
        // Зняти позначку завершення
        await progressService.uncompleteLesson(moduleId, lessonNumber);
      }
      
      setIsCompleted(newStatus);
    } catch (error) {
      console.error('Failed to update lesson completion:', error);
    }
  };

  const handleToggleFavorite = async () => {
    if (favoriteLoading) return;

    setFavoriteLoading(true);
    try {
      if (isFavorite) {
        await favoritesService.removeFromFavorites(moduleId, lessonNumber);
        setIsFavorite(false);
      } else {
        await favoritesService.addToFavorites(moduleId, lessonNumber);
        setIsFavorite(true);
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    } finally {
      setFavoriteLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F2F2F2] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2466FF] mx-auto mb-4"></div>
          <p className="text-gray-600">Завантаження...</p>
        </div>
      </div>
    );
  }

  if (!lessonData) {
    return (
      <div className="min-h-screen bg-[#F2F2F2] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Урок не знайдено</p>
          <button 
            onClick={() => router.push(`/modules/${moduleId}`)}
            className="mt-4 px-4 py-2 bg-[#2466FF] text-white rounded-full"
          >
            Назад до модуля
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F2F2F2]">
      <div className="max-w-md mx-auto">
        {/* Header with white background */}
        <div className="bg-white pb-4 border-b border-gray-200 rounded-b-2xl shadow-sm ">
          <div className="px-4 pt-6">
            {/* Back Button - Styled like close button */}
            <button
              onClick={() => router.push(`/modules/${moduleId}`)}
              className="w-10 h-10 rounded-full bg-[#F2F2F2] flex items-center justify-center mb-4 hover:bg-gray-200 transition-colors"
            >
              <ChevronDown className="w-5 h-5 text-black rotate-90" />
            </button>

            {/* Breadcrumb - Clickable */}
            <div className="flex items-center gap-1 mb-2">
              <button
                onClick={() => router.push('/modules')}
                className="text-sm font-bold text-gray-500 hover:text-[#2466FF] transition-colors"
              >
                Модулі
              </button>
              <ChevronDown className="w-3 h-3 text-gray-500 -rotate-90" />
              <button
                onClick={() => router.push(`/modules/${moduleId}`)}
                className="text-sm font-bold text-gray-500 hover:text-[#2466FF] transition-colors"
              >
                Модуль {lessonData.moduleNumber}
              </button>
              <ChevronDown className="w-3 h-3 text-gray-500 -rotate-90" />
              <span className="text-sm font-bold text-[#2466FF]">Урок {lessonData.lessonNumber}</span>
            </div>

            {/* Title */}
            <h1 className="text-2xl font-bold text-black leading-tight mb-3">
              {lessonData.title}
            </h1>

            {/* Actions Row */}
            <div className="flex items-center justify-between">
              {/* Status Badge */}
              <div
                className={`inline-flex items-center rounded-full px-2 py-1.5 ${
                  isCompleted ? 'bg-[#E9F0FF]' : 'bg-[#F2F2F2]'
                }`}
              >
                <span
                  className={`text-xs font-bold ${
                    isCompleted ? 'text-[#2466FF]' : 'text-[#7F7F7F]'
                  }`}
                >
                  {isCompleted ? 'Пройдено' : 'Не пройдено'}
                </span>
              </div>

              {/* Right Actions */}
              <div className="flex items-center gap-2">
                {/* Mark as completed button */}
                <button
                  onClick={handleMarkAsCompleted}
                  className="bg-[#F2F2F2] backdrop-blur-sm rounded-xl px-4 py-2.5 hover:bg-gray-200 transition-colors"
                >
                  <span className="text-xs font-medium text-black">
                    Позначити як пройдений
                  </span>
                </button>

                {/* Favorite button */}
                <button 
                  onClick={handleToggleFavorite}
                  disabled={favoriteLoading}
                  className="w-10 h-10 bg-[#F2F2F2] backdrop-blur-sm rounded-xl flex items-center justify-center hover:bg-gray-200 transition-all disabled:opacity-50"
                >
                  <Heart 
                    className={`w-5 h-5 transition-all ${
                      isFavorite 
                        ? 'text-red-500 fill-red-500' 
                        : 'text-black'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-4 pt-4 flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('info')}
            className={`px-3 py-2 rounded-2xl text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === 'info'
                ? 'bg-black text-white'
                : 'bg-white text-black'
            }`}
          >
            Інформація
          </button>
          <button
            onClick={() => setActiveTab('materials')}
            className={`px-3 py-2 rounded-2xl text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === 'materials'
                ? 'bg-black text-white'
                : 'bg-white text-black'
            }`}
          >
            Матеріали уроку
          </button>
          {lessonData?.homework && (
            <button
              onClick={() => setActiveTab('homework')}
              className={`px-3 py-2 rounded-2xl text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === 'homework'
                  ? 'bg-black text-white'
                  : 'bg-white text-black'
              }`}
            >
              Домашнє завдання
            </button>
          )}
        </div>

        {/* Content */}
        <div className="px-4 pt-4 pb-24 space-y-3">
          {activeTab === 'info' ? (
            <>
              {/* Video Card */}
              <div className="relative">
                {/* Video Player */}
                {lessonData.videoUrl ? (
                  <div className="relative rounded-2xl overflow-hidden bg-black group">
                    {/* YouTube Thumbnail as background */}
                    <div className="relative" style={{ paddingBottom: '56.25%' }}>
                      <img 
                        src={`https://img.youtube.com/vi/${getYouTubeVideoId(lessonData.videoUrl)}/maxresdefault.jpg`}
                        alt={lessonData.title}
                        className="absolute inset-0 w-full h-full object-cover"
                        onError={(e) => {
                          // Fallback to hqdefault if maxresdefault doesn't exist
                          e.currentTarget.src = `https://img.youtube.com/vi/${getYouTubeVideoId(lessonData.videoUrl)}/hqdefault.jpg`;
                        }}
                      />
                      
                      {/* Dark overlay */}
                      <div className="absolute inset-0 bg-black/30" />
                      
                      {/* Play button that opens YouTube */}
                      <a 
                        href={lessonData.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute inset-0 flex items-center justify-center"
                      >
                        <div className="w-16 h-16 rounded-full bg-[#2466FF] flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                          <Play className="w-8 h-8 text-white fill-white ml-1" />
                        </div>
                      </a>

                      {/* e-launch watermark */}
                      <div className="absolute top-4 left-4">
                        <span className="text-white text-sm font-light tracking-wider drop-shadow-lg">e-launch</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="relative h-[200px] rounded-2xl overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900">
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-900/40 via-gray-900 to-gray-900" />
                    
                    {/* Play button */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-10 h-10 rounded-full bg-[#2466FF] flex items-center justify-center">
                        <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                      </div>
                    </div>

                    {/* e-launch watermark */}
                    <div className="absolute top-4 left-4">
                      <span className="text-white/80 text-sm font-light tracking-wider">e-launch</span>
                    </div>
                  </div>
                )}

                {/* Info Card - overlapping */}
                <div className="relative -mt-[75px] mx-0 bg-white backdrop-blur-sm rounded-2xl p-3 shadow-sm">
                  <div className="space-y-2">
                    {/* Title */}
                    <h3 className="text-sm font-bold text-black leading-tight">
                      {lessonData.title}
                    </h3>

                    {/* Description */}
                    <p className="text-sm text-black leading-relaxed">
                      {lessonData.description}
                    </p>

                    {/* Download Presentation */}
                    {lessonData.presentation && (
                      <a 
                        href={lessonData.presentation.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full bg-[#F2F2F2] backdrop-blur-sm rounded-xl px-2 py-2.5 flex items-center justify-center gap-3 hover:bg-gray-200 transition-colors"
                      >
                        <Download className="w-5 h-5 text-black" />
                        <span className="text-xs font-medium text-black">
                          {lessonData.presentation.title}
                        </span>
                      </a>
                    )}
                  </div>
                </div>

                {/* Materials Section - Also on Info Tab */}
                {lessonData.materials && lessonData.materials.length > 0 && (
                  <div className="bg-white rounded-2xl p-4 mt-4">
                    <h3 className="text-base font-bold text-black mb-3">
                      Матеріали уроку
                    </h3>

                    <div className="space-y-3">
                      {lessonData.materials.map((material: any, index: number) => (
                        <a
                          key={index}
                          href={material.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full flex items-center gap-3 hover:bg-gray-50 rounded-xl p-3 transition-colors"
                        >
                          {/* Icon based on material type */}
                          <div className="w-12 h-12 bg-[#F2F2F2] rounded-xl flex items-center justify-center flex-shrink-0">
                            {material.type === 'pdf' || material.type === 'document' ? (
                              <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                              </svg>
                            ) : material.type === 'video' ? (
                              <svg className="w-6 h-6 text-[#2466FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            ) : material.type === 'spreadsheet' ? (
                              <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                            ) : (
                              <svg className="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                              </svg>
                            )}
                          </div>

                          {/* Text */}
                          <div className="flex-1 text-left">
                            <p className="text-sm font-medium text-black leading-tight">
                              {material.title}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {material.type === 'pdf' && 'PDF документ'}
                              {material.type === 'document' && 'Google документ'}
                              {material.type === 'video' && 'Відео'}
                              {material.type === 'spreadsheet' && 'Таблиця'}
                              {material.type === 'file' && 'Файл'}
                              {material.type === 'link' && 'Посилання'}
                            </p>
                          </div>

                          {/* Arrow icon */}
                          <ChevronDown className="w-5 h-5 text-gray-400 -rotate-90" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : activeTab === 'materials' ? (
            /* Materials Tab */
            <div className="bg-white rounded-2xl p-3">
              <h3 className="text-base font-bold text-black mb-3">
                Матеріали уроку
              </h3>

              {lessonData.materials && lessonData.materials.length > 0 ? (
                <div className="space-y-3">
                  {lessonData.materials.map((material: any, index: number) => (
                    <a
                      key={index}
                      href={material.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center gap-3 hover:bg-gray-50 rounded-xl p-3 transition-colors"
                    >
                      {/* Icon based on material type */}
                      <div className="w-12 h-12 bg-[#F2F2F2] rounded-xl flex items-center justify-center flex-shrink-0">
                        {material.type === 'pdf' || material.type === 'document' ? (
                          <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                        ) : material.type === 'video' ? (
                          <svg className="w-6 h-6 text-[#2466FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        ) : material.type === 'spreadsheet' ? (
                          <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        ) : (
                          <svg className="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                          </svg>
                        )}
                      </div>

                      {/* Text */}
                      <div className="flex-1 text-left">
                        <p className="text-sm font-medium text-black leading-tight">
                          {material.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {material.type === 'pdf' && 'PDF документ'}
                          {material.type === 'document' && 'Google документ'}
                          {material.type === 'video' && 'Відео'}
                          {material.type === 'spreadsheet' && 'Таблиця'}
                          {material.type === 'file' && 'Файл'}
                          {material.type === 'link' && 'Посилання'}
                        </p>
                      </div>

                      {/* Arrow icon */}
                      <ChevronDown className="w-5 h-5 text-gray-400 -rotate-90" />
                    </a>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-500">Додаткові матеріали відсутні</p>
                  <p className="text-xs text-gray-400 mt-1">Перегляньте відео для отримання інформації</p>
                </div>
              )}
            </div>
          ) : (
            /* Homework Tab */
            <div className="bg-white rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-[#2466FF]" />
                <h3 className="text-base font-bold text-black">
                  Домашнє завдання
                </h3>
              </div>

              {/* Homework Task */}
              <div className="bg-[#F2F2F2] rounded-xl p-4 mb-4">
                <p className="text-sm text-black leading-relaxed whitespace-pre-wrap">
                  {lessonData.homework}
                </p>
              </div>

              {/* Submission Status */}
              {homework && (
                <div className={`rounded-xl p-3 mb-4 flex items-center gap-3 ${
                  homework.status === 'approved' ? 'bg-green-50' :
                  homework.status === 'reviewed' ? 'bg-blue-50' :
                  homework.status === 'needs_revision' ? 'bg-orange-50' :
                  'bg-yellow-50'
                }`}>
                  {homework.status === 'approved' ? (
                    <>
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <div className="flex-1">
                        <p className="text-sm font-bold text-green-800">Затверджено куратором</p>
                        {homework.score !== undefined && (
                          <p className="text-xs text-green-600 mt-0.5">Оцінка: {homework.score}/100</p>
                        )}
                      </div>
                    </>
                  ) : homework.status === 'reviewed' ? (
                    <>
                      <CheckCircle className="w-5 h-5 text-blue-600" />
                      <div className="flex-1">
                        <p className="text-sm font-bold text-blue-800">Перевірено куратором</p>
                        {homework.score !== undefined && (
                          <p className="text-xs text-blue-600 mt-0.5">Оцінка: {homework.score}/100</p>
                        )}
                      </div>
                    </>
                  ) : homework.status === 'needs_revision' ? (
                    <>
                      <AlertCircle className="w-5 h-5 text-orange-600" />
                      <div className="flex-1">
                        <p className="text-sm font-bold text-orange-800">Потрібна доопрацювання</p>
                        <p className="text-xs text-orange-600 mt-0.5">Перегляньте коментар куратора та оновіть відповідь</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <Clock className="w-5 h-5 text-yellow-600" />
                      <div className="flex-1">
                        <p className="text-sm font-bold text-yellow-800">На перевірці</p>
                        <p className="text-xs text-yellow-600 mt-0.5">Очікується відповідь куратора</p>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Feedback from curator */}
              {homework?.feedback && (
                <div className="bg-[#E9F0FF] rounded-xl p-3 mb-4">
                  <p className="text-xs font-bold text-[#2466FF] mb-1">Відгук куратора:</p>
                  <p className="text-sm text-black leading-relaxed">{homework.feedback}</p>
                </div>
              )}

              {/* Answer Input */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-black mb-2">
                  Ваша відповідь <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={homeworkAnswer}
                  onChange={(e) => setHomeworkAnswer(e.target.value)}
                  placeholder="Напишіть вашу відповідь тут..."
                  rows={6}
                  disabled={homework?.status === 'approved'}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2466FF] text-black resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>

              {/* Attachments Section */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-black mb-2">
                  Прикріплені файли (посилання)
                </label>
                
                {/* Existing attachments */}
                {homeworkAttachments.length > 0 && (
                  <div className="space-y-2 mb-3">
                    {homeworkAttachments.map((attachment, index) => (
                      <div key={index} className="flex items-center gap-2 bg-[#F2F2F2] rounded-lg p-2">
                        <a 
                          href={attachment}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 text-sm text-[#2466FF] hover:underline truncate"
                        >
                          {attachment}
                        </a>
                        {homework?.status !== 'approved' && (
                          <button
                            onClick={() => handleRemoveAttachment(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Add attachment input */}
                {homework?.status !== 'approved' && (
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={attachmentInput}
                      onChange={(e) => setAttachmentInput(e.target.value)}
                      placeholder="https://drive.google.com/..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2466FF] text-sm"
                    />
                    <button
                      onClick={handleAddAttachment}
                      disabled={!attachmentInput.trim()}
                      className="px-4 py-2 bg-[#F2F2F2] rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Upload className="w-4 h-4 text-black" />
                    </button>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              {homework?.status !== 'approved' && (
                <button
                  onClick={handleSubmitHomework}
                  disabled={homeworkLoading || !homeworkAnswer.trim()}
                  className={`w-full px-4 py-3 font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                    homework?.status === 'needs_revision'
                      ? 'bg-orange-500 hover:bg-orange-600 text-white'
                      : 'bg-[#2466FF] hover:bg-[#1557ee] text-white'
                  }`}
                >
                  {homeworkLoading ? 'Відправка...' : homework?.status === 'needs_revision' ? 'Відправити виправлену версію' : homeworkSubmitted ? 'Оновити відповідь' : 'Відправити на перевірку'}
                </button>
              )}

              {/* Submission info */}
              {homework?.submittedAt && (
                <p className="text-xs text-gray-500 text-center mt-3">
                  Відправлено: {new Date(homework.submittedAt).toLocaleString('uk-UA')}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
