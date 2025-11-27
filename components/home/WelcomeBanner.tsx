'use client';

import { PlayCircle } from 'lucide-react';
import Image from 'next/image';

export function WelcomeBanner() {
  return (
    <div className="relative w-full h-[200px] rounded-2xl overflow-hidden shadow-lg">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#2D1B4E] via-[#4A2D7C] to-[#6B46C1]" />
      
      {/* Decorative stars/sparkles */}
      <div className="absolute inset-0">
        <div className="absolute top-8 right-12 w-1 h-1 bg-yellow-300 rounded-full animate-pulse" />
        <div className="absolute top-16 right-20 w-0.5 h-0.5 bg-yellow-200 rounded-full animate-pulse delay-100" />
        <div className="absolute bottom-20 left-16 w-1 h-1 bg-yellow-300 rounded-full animate-pulse delay-200" />
      </div>

      {/* Content */}
      <div className="relative h-full flex flex-col items-center justify-center text-white px-6">
        <h1 className="text-2xl font-bold mb-2 text-center">
          Ласкаво просимо до Хогвартсу!
        </h1>
        <p className="text-sm text-purple-100 mb-6 text-center">
          Почніть свій магічний шлях навчання
        </p>
        
        {/* Video button */}
        <button className="flex items-center gap-2 px-6 py-3 bg-white text-purple-700 rounded-full font-medium shadow-lg hover:shadow-xl transition-all hover:scale-105">
          <PlayCircle className="w-5 h-5" />
          Переглянути вітання
        </button>
      </div>
    </div>
  );
}
