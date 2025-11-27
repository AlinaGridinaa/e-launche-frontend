'use client';

import { PlayCircle } from 'lucide-react';
import Image from 'next/image';

export function WelcomeBanner() {
  return (
    <div className="relative w-full aspect-square rounded-2xl overflow-hidden shadow-lg">
      {/* Background Image */}
      <Image
        src="/images/Banner.png"
        alt="Welcome Banner"
        fill
        className="object-cover"
        priority
      />
      


      {/* Content */}
      <div className="relative h-full flex flex-col items-start justify-end text-white px-3 pb-4">
        
        {/* Video button */}
        <button className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-white/20 to-black/20 backdrop-blur-[30px] rounded-[34px] transition-all hover:scale-105">
          <PlayCircle className="w-3 h-3 text-white" />
          <span className="text-xs font-medium text-white leading-[18px]">
            Переглянути привітання від Дмитра
          </span>
        </button>
      </div>
    </div>
  );
}
