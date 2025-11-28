'use client';

import { WelcomeBanner } from '@/components/home/WelcomeBanner';
import { WeeklySchedule } from '@/components/home/WeeklySchedule';
import { ProgramModules } from '@/components/home/ProgramModules';
import { CommunityRules } from '@/components/home/CommunityRules';
import { SupportButton } from '@/components/home/SupportButton';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#F5F5F5] pb-20">
      <div className="max-w-md mx-auto px-4 py-6">
        {/* Welcome Banner */}
        <WelcomeBanner />

        {/* Main Content */}
        <div className="mt-6 space-y-3">
          {/* Schedule */}
          <WeeklySchedule />

          {/* Program Progress */}
          <ProgramModules />

          {/* Community Rules */}
          <CommunityRules />

          {/* Support */}
          <SupportButton />
        </div>
      </div>
    </div>
  );
}
