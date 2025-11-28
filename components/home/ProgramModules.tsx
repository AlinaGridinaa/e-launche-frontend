'use client';

import Image from 'next/image';
import Link from 'next/link';

export function ProgramModules() {
  const progress = 10; // 1/10 модулів = 10%

  return (
    <Link href="/modules">
      <div className="bg-gradient-to-r from-[#5B7FFF] to-[#4A6AE8] rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer mb-3">
        <div className="space-y-4">
          {/* Title */}
          <h2 className="text-2xl font-bold text-white">
            ПРОГРАМА НАВЧАННЯ
          </h2>

          {/* Progress text */}
          <p className="text-white/90 text-sm">
            1/10 модулей пройдено
          </p>

          {/* Progress bar */}
          <div className="flex gap-1">
            {Array.from({ length: 10 }).map((_, index) => (
              <div
                key={index}
                className={`h-1.5 flex-1 rounded-full ${
                  index === 0 ? 'bg-white' : 'bg-white/30'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
}
