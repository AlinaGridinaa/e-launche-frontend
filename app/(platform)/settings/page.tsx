'use client';

import { useRouter } from 'next/navigation';
import { ChevronDown } from 'lucide-react';
import NotificationSettings from '@/components/settings/NotificationSettings';

export default function SettingsPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#F5F5F5] pb-24">
      <div className="max-w-md mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
          >
            <ChevronDown className="w-6 h-6 text-gray-600 rotate-90" />
          </button>
          <h1 className="text-2xl font-bold text-black">Налаштування</h1>
        </div>

        {/* Notification Settings */}
        <NotificationSettings />
      </div>
    </div>
  );
}
