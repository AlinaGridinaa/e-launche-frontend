const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface LoginCredentials {
  email: string;
  password: string;
}

interface AuthResponse {
  success: boolean;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    avatarUrl?: string;
    faculty?: string;
    hasCompletedSorting: boolean;
    hasAcceptedRules: boolean;
    hasSeenWelcomeModal?: boolean;
    isAdmin: boolean;
  };
}

class AuthService {
  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
  }

  private setToken(token: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('token', token);
  }

  private removeToken(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('token');
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse & { token: string }> {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Помилка при вході');
    }

    const data = await response.json();
    this.setToken(data.token);
    return data;
  }

  async logout(): Promise<void> {
    this.removeToken();
    
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.getToken()}`,
        },
      });
    } catch (error) {
      // Ignore errors on logout
    }
  }

  async getCurrentUser(): Promise<AuthResponse> {
    const token = this.getToken();
    
    if (!token) {
      console.log('❌ No token found in localStorage');
      throw new Error('Не авторизовано');
    }

    console.log('🔍 Checking auth with token...');
    
    const response = await fetch(`${API_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      console.log('❌ Auth check failed, status:', response.status);
      this.removeToken();
      
      if (response.status === 401) {
        throw new Error('Сесія закінчилася. Будь ласка, увійдіть знову');
      }
      
      throw new Error('Не авторизовано');
    }

    const data = await response.json();
    console.log('✅ Auth check response:', data);
    return data;
  }
}

export const authService = new AuthService();
