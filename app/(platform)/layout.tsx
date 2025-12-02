'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BottomTabBar } from '@/components/layout/BottomTabBar';
import { useAuth } from '@/contexts/AuthContext';
import { useAutoSubscribeNotifications } from '@/hooks/useAutoSubscribeNotifications';

export default function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  
  // Автоматична підписка на push-нотифікації
  useAutoSubscribeNotifications();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F2F2F2] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2466FF] mx-auto mb-4"></div>
          <p className="text-gray-600">Завантаження...</p>
        </div>
      </div>
    );
  }

  // Don't render protected content if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      {children}
      <BottomTabBar />
    </>
  );
}
