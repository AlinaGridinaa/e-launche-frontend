'use client';

import Image from 'next/image';

export function SupportButton() {
  return (
    <a 
      href="http://t.me/dimashevchuck_support" 
      target="_blank" 
      rel="noopener noreferrer"
      className="block bg-white rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="flex items-center gap-4">
        {/* Icon */}
        <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center flex-shrink-0">
          <Image 
            src="/icons/support.svg" 
            alt="Support" 
            width={64} 
            height={64}
            className="object-contain"
          />
        </div>

        {/* Content */}
        <div className="flex-1 flex items-center">
          <h2 className="text-xl font-bold text-gray-900">
            ПІДТРИМКА
          </h2>
        </div>
      </div>
    </a>
  );
}
