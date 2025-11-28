'use client';

import { useState, useEffect } from 'react';
import { X, Play } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { modulesService, Module as ApiModule } from '@/lib/services/modules.service';

interface Lesson {
  id: number;
  title: string;
  duration: string;
  isCompleted: boolean;
  isLocked: boolean;
  videoUrl?: string;
}

export default function ModulePage() {
  const params = useParams();
  const router = useRouter();
  const moduleId = params.id as string;
  
  const [moduleData, setModuleData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadModule();
  }, [moduleId]);

  const loadModule = async () => {
    try {
      const data = await modulesService.getModuleById(moduleId);
      const transformedData = {
        id: data._id,
        category: `Модуль ${data.number}`,
        title: data.title,
        totalLessons: data.lessons.length,
        completedLessons: data.lessons.filter(l => l.isCompleted).length,
        lessons: data.lessons.map(lesson => ({
          id: lesson.number,
          title: lesson.title,
          duration: lesson.duration ? `${lesson.duration} хв` : '',
          isCompleted: lesson.isCompleted,
          isLocked: false,
          videoUrl: lesson.videoUrl,
        })),
      };
      setModuleData(transformedData);
    } catch (error) {
      console.error('Failed to load module:', error);
    } finally {
      setLoading(false);
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

  if (!moduleData) {
    return (
      <div className="min-h-screen bg-[#F2F2F2] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Модуль не знайдено</p>
          <button 
            onClick={() => router.push('/modules')}
            className="mt-4 px-4 py-2 bg-[#2466FF] text-white rounded-full"
          >
            Назад до модулів
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F2F2F2]">
      <div className="max-w-md mx-auto">
        {/* Header with white background */}
        <div className="bg-white pb-4 border-b border-gray-200 rounded-b-2xl">
          <div className="px-6 pt-6">
            {/* Close Button */}
            <button 
              onClick={() => router.push('/modules')}
              className="mb-6 inline-flex items-center gap-2 bg-black/10 backdrop-blur-sm rounded-full px-3 py-2 hover:bg-black/20 transition-colors"
            >
              <X className="w-5 h-5 text-gray-900" />
              <span className="text-sm font-medium text-gray-900">Закрыть</span>
            </button>

            {/* Module Info */}
            <div className="space-y-3 mb-4">
              {/* Category */}
              <p className="text-sm font-bold text-gray-500">
                {moduleData.category}
              </p>

              {/* Title */}
              <h1 className="text-2xl font-bold text-black leading-tight">
                {moduleData.title}
              </h1>
            </div>

            {/* Progress Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-black">Прогрес</span>
                <span className="text-sm font-bold text-[#2466FF]">
                  {moduleData.completedLessons}/{moduleData.totalLessons} уроків пройдено
                </span>
              </div>

              {/* Progress bars */}
              <div className="flex gap-0.5">
                {Array.from({ length: moduleData.totalLessons }).map((_, index) => (
                  <div
                    key={index}
                    className={`h-1.5 flex-1 rounded-full ${
                      index < moduleData.completedLessons ? 'bg-[#2466FF]' : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Lessons List */}
        <div className="px-4 pt-4 pb-24 space-y-3">
          {moduleData.lessons.map((lesson: any, index: number) => (
            <LessonCard
              key={lesson.id}
              lesson={lesson}
              lessonNumber={index + 1}
              moduleId={moduleId as string}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function LessonCard({
  lesson,
  lessonNumber,
  moduleId,
}: {
  lesson: Lesson;
  lessonNumber: number;
  moduleId: string;
}) {
  const handleClick = () => {
    if (!lesson.isLocked) {
      window.location.href = `/modules/${moduleId}/lessons/${lesson.id}`;
    }
  };

  // Extract YouTube video ID from URL
  const getYouTubeThumbnail = (url: string) => {
    if (!url) return null;
    
    let videoId = null;
    
    // Handle different YouTube URL formats
    if (url.includes('youtube.com/watch?v=')) {
      videoId = url.split('v=')[1]?.split('&')[0];
    } else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1]?.split('?')[0];
    }
    
    return videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : null;
  };

  const thumbnailUrl = lesson.videoUrl ? getYouTubeThumbnail(lesson.videoUrl) : null;

  return (
    <div className="relative">
      {/* Video Thumbnail */}
      <button
        onClick={handleClick}
        disabled={lesson.isLocked}
        className="w-full relative h-[200px] rounded-2xl overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900 group"
      >
        {/* YouTube thumbnail or gradient background */}
        {thumbnailUrl ? (
          <img 
            src={thumbnailUrl} 
            alt={lesson.title}
            className="absolute inset-0 w-full h-full object-cover"
            onError={(e) => {
              // Fallback to gradient if thumbnail fails to load
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-orange-900/40 via-gray-900 to-gray-900" />
        )}
        
        {/* Dark overlay for better contrast */}
        <div className="absolute inset-0 bg-black/20" />
        
        {/* Play button */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-10 h-10 rounded-full bg-[#2466FF] flex items-center justify-center group-hover:scale-110 transition-transform">
            <Play className="w-5 h-5 text-white fill-white ml-0.5" />
          </div>
        </div>

        {/* e-launch watermark */}
        <div className="absolute top-4 left-4">
          <span className="text-white/80 text-sm font-light tracking-wider">e-launch</span>
        </div>
      </button>

      {/* Lesson Info Card - overlapping thumbnail */}
      <div className="relative -mt-[75px] mx-3 bg-white backdrop-blur-sm rounded-2xl p-3 shadow-sm">
        <div className="space-y-2">
          {/* Badges */}
          <div className="flex items-center gap-1">
            {/* Lesson number badge */}
            <div className="inline-flex items-center bg-[#F2F2F2] rounded-full px-2 py-1.5">
              <span className="text-xs font-bold text-black">
                Урок {lessonNumber}
              </span>
            </div>

            {/* Status badge */}
            <div
              className={`inline-flex items-center rounded-full px-2 py-1.5 ${
                lesson.isCompleted
                  ? 'bg-[#E9F0FF]'
                  : 'bg-[#F2F2F2]'
              }`}
            >
              <span
                className={`text-xs font-bold ${
                  lesson.isCompleted ? 'text-[#2466FF]' : 'text-[#7F7F7F]'
                }`}
              >
                {lesson.isCompleted ? 'Пройдено' : 'Не пройдено'}
              </span>
            </div>
          </div>

          {/* Lesson title */}
          <h3 className="text-sm font-bold text-black leading-tight">
            {lesson.title}
          </h3>
        </div>
      </div>
    </div>
  );
}
