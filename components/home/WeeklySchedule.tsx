'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ScheduleModal } from '@/components/modals/ScheduleModal';

export function WeeklySchedule() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div 
        onClick={() => setIsModalOpen(true)}
        className="bg-white rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      >
        <div className="flex items-center gap-4">
          {/* Icon */}
          <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center flex-shrink-0">
            <span className="text-4xl">📅</span>
          </div>

          {/* Content */}
          <div className="flex-1 flex items-center">
            <h2 className="text-xl font-bold text-gray-900">
              РОЗКЛАДУ<br />НА ТИЖДЕНЬ
            </h2>
          </div>
        </div>
      </div>

      <ScheduleModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  );
}
