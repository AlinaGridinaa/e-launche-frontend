'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/lib/services/auth.service';
import WelcomeModal from '@/components/modals/WelcomeModal';
import { profileService } from '@/lib/services/profile.service';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  phoneOrTelegram?: string;
  group?: string;
  accessUntil?: string;
  tariff?: string;
  avatarUrl?: string;
  faculty?: string;
  hasCompletedSorting: boolean;
  hasAcceptedRules: boolean;
  hasSeenWelcomeModal?: boolean;
  isAdmin: boolean;
  isCurator?: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(false);

  useEffect(() => {
    // Перевірити чи користувач залогінений при завантаженні
    if (!isCheckingAuth) {
      checkAuth();
    }
  }, []);

  useEffect(() => {
    // Показати welcome modal якщо користувач вперше логінився і має факультет
    if (user && !user.hasSeenWelcomeModal && user.faculty) {
      console.log('Showing welcome modal for user:', user.email, 'faculty:', user.faculty);
      setShowWelcomeModal(true);
    }
  }, [user]);

  const checkAuth = async () => {
    if (isCheckingAuth) {
      console.log('⏭️ Auth check already in progress, skipping...');
      return;
    }
    
    setIsCheckingAuth(true);
    try {
      // Додаємо timeout 5 секунд для запиту
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Auth check timeout')), 5000)
      );
      
      const authPromise = authService.getCurrentUser();
      const response = await Promise.race([authPromise, timeoutPromise]);
      
      console.log('✅ Auth check successful:', response.user?.email);
      setUser(response.user);
    } catch (error) {
      console.log('❌ Auth check failed:', error instanceof Error ? error.message : 'Unknown error');
      setUser(null);
      // Не кидаємо помилку, дозволяємо додатку завантажитися без автентифікації
    } finally {
      setIsLoading(false);
      setIsCheckingAuth(false);
    }
  };

  const login = async (email: string, password: string) => {
    console.log('🔐 Attempting login for:', email);
    const response = await authService.login({ email, password });
    console.log('✅ Login successful, setting user:', response.user.email);
    setUser(response.user);
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    router.push('/login');
  };

  const refreshUser = async () => {
    try {
      console.log('🔄 Refreshing user data...');
      const response = await authService.getCurrentUser();
      console.log('✅ User data refreshed:', response.user?.email);
      setUser(response.user);
    } catch (error) {
      console.log('❌ Failed to refresh user:', error instanceof Error ? error.message : 'Unknown error');
      setUser(null);
    }
  };

  const handleWelcomeModalClose = async () => {
    setShowWelcomeModal(false);
    // Оновити в базі, що користувач побачив модальне вікно
    try {
      await profileService.updateProfile({ hasSeenWelcomeModal: true });
      await refreshUser();
    } catch (error) {
      console.error('Failed to update welcome modal status:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        refreshUser,
      }}
    >
      {isLoading ? (
        // Fallback UI поки завантажується
        <div className="w-full h-screen bg-gradient-to-b from-[#0F1FEF] to-[#2466FF] flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white text-lg font-medium">Завантаження...</p>
          </div>
        </div>
      ) : (
        <>
          {children}
          {user && user.faculty && (
            <WelcomeModal
              isOpen={showWelcomeModal}
              faculty={user.faculty}
              onClose={handleWelcomeModalClose}
            />
          )}
        </>
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
