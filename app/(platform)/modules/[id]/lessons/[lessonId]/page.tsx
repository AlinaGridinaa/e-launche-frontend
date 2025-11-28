'use client';

import { X, Heart, Download, ChevronDown, Play } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { modulesService } from '@/lib/services/modules.service';

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
  const [activeTab, setActiveTab] = useState<'info' | 'materials'>('info');
  const [lessonData, setLessonData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);

  const moduleId = params.id as string;
  const lessonNumber = parseInt(params.lessonId as string);

  useEffect(() => {
    loadLesson();
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
          presentation: presentationMaterial ? {
            title: presentationMaterial.title || 'Завантажити презентацію до уроку',
            url: presentationMaterial.url,
          } : null,
        });
        setIsCompleted(lesson.isCompleted);
      }
    } catch (error) {
      console.error('Failed to load lesson:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsCompleted = async () => {
    try {
      const newStatus = !isCompleted;
      await modulesService.markLessonComplete(moduleId, lessonNumber, newStatus);
      setIsCompleted(newStatus);
    } catch (error) {
      console.error('Failed to update lesson completion:', error);
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
                <button className="w-10 h-10 bg-[#F2F2F2] backdrop-blur-sm rounded-xl flex items-center justify-center hover:bg-gray-200 transition-colors">
                  <Heart className="w-5 h-5 text-black" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-4 pt-4 flex items-center gap-2">
          <button
            onClick={() => setActiveTab('info')}
            className={`px-3 py-2 rounded-2xl text-sm font-medium transition-colors ${
              activeTab === 'info'
                ? 'bg-black text-white'
                : 'bg-white text-black'
            }`}
          >
            Інформація
          </button>
          <button
            onClick={() => setActiveTab('materials')}
            className={`px-3 py-2 rounded-2xl text-sm font-medium transition-colors ${
              activeTab === 'materials'
                ? 'bg-black text-white'
                : 'bg-white text-black'
            }`}
          >
            Матеріали уроку
          </button>
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
          ) : (
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
          )}
        </div>
      </div>
    </div>
  );
}
