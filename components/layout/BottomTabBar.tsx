'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BookOpen, Heart, Shield, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export function BottomTabBar() {
  const pathname = usePathname();
  const { user } = useAuth();

  // Базові таби для всіх
  const baseTabs = [
    {
      name: 'Головна',
      href: '/home',
      icon: Home,
    },
    {
      name: 'Мій прогрес',
      href: '/my-progress',
      icon: BookOpen,
    },
    {
      name: 'Обране',
      href: '/favorites',
      icon: Heart,
    },
  ];

  // Додаткові таби для адміна
  const adminTab = {
    name: 'Адмін',
    href: '/admin',
    icon: Shield,
  };

  // Додаткові таби для куратора
  const curatorTab = {
    name: 'Куратор',
    href: '/curator',
    icon: Users,
  };

  // Формуємо фінальний список табів
  let tabs = [...baseTabs];
  
  if (user?.isAdmin) {
    tabs.push(adminTab);
  }
  
  if (user?.isCurator && !user?.isAdmin) {
    // Показуємо таб куратора тільки якщо користувач не адмін
    tabs.push(curatorTab);
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pb-4 px-4">
      <div className="w-full">
        <div 
          className="bg-black/80 backdrop-blur-md rounded-full px-2 py-2 shadow-lg"
          style={{
            boxShadow: '0px 1.312px 1.312px rgba(0, 0, 0, 0.25)',
          }}
        >
          <div className="flex items-center justify-between">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = pathname === tab.href;

              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={`flex-1 flex flex-col items-center justify-center gap-1 py-2 px-4 rounded-full transition-all ${
                    isActive 
                      ? 'bg-[#2563EB]/20' 
                      : 'hover:bg-white/5'
                  }`}
                >
                  <Icon 
                    className={`w-6 h-6 ${
                      isActive 
                        ? 'text-[#2563EB]' 
                        : 'text-white'
                    }`}
                    strokeWidth={2}
                  />
                  <span 
                    className={`text-[11px] font-medium ${
                      isActive 
                        ? 'text-[#2563EB]' 
                        : 'text-white'
                    }`}
                  >
                    {tab.name}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
