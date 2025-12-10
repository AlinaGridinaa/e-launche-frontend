'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface UserProgress {
  completedModulesCount: number;
  totalModules: number;
}

export function ProgramModules() {
  const [progress, setProgress] = useState<UserProgress>({
    completedModulesCount: 0,
    totalModules: 10,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProgress();
    
    // Перезавантажуємо при фокусі на вікні
    const handleFocus = () => loadProgress();
    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const loadProgress = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      // Отримуємо дані про користувача
      const userResponse = await fetch(`${API_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (userResponse.ok) {
        const userData = await userResponse.json();
        const completedModulesCount = userData.completedModules?.length || 0;

        // Отримуємо загальну кількість модулів
        const modulesResponse = await fetch(`${API_URL}/modules`);
        if (modulesResponse.ok) {
          const modulesData = await modulesResponse.json();
          setProgress({
            completedModulesCount,
            totalModules: modulesData.length,
          });
        }
      }
    } catch (error) {
      console.error('Failed to load progress:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Link href="/modules">
      <div className="bg-[#2466FF] rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer mb-3">
        <div className="space-y-4">
          {/* Title */}
          <h2 className="text-2xl font-bold text-white">
            ПРОГРАМА НАВЧАННЯ
          </h2>

          {/* Progress text */}
          {loading ? (
            <p className="text-white/90 text-sm">Завантаження...</p>
          ) : (
            <p className="text-white/90 text-sm">
              {progress.completedModulesCount}/{progress.totalModules} модулів пройдено
            </p>
          )}

          {/* Progress bar */}
          <div className="flex gap-1">
            {Array.from({ length: progress.totalModules }).map((_, index) => (
              <div
                key={index}
                className={`h-1.5 flex-1 rounded-full ${
                  index < progress.completedModulesCount ? 'bg-white' : 'bg-white/30'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
}
