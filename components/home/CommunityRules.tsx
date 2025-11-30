'use client';

import Image from 'next/image';

export function CommunityRules() {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
      <div className="flex items-center gap-4">
        {/* Icon */}
        <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center flex-shrink-0">
          <span className="text-4xl">🏆</span>
        </div>

        {/* Content */}
        <div className="flex-1 flex items-center">
          <h2 className="text-xl font-bold text-gray-900">
            НАШІ ЦІННОСТІ<br />ТА ПРАВИЛА СПІЛЬНОТИ
          </h2>
        </div>
      </div>
    </div>
  );
}
