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
    isAdmin: boolean;
  };
}

class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Важливо для cookies
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Помилка при вході');
    }

    return response.json();
  }

  async logout(): Promise<void> {
    const response = await fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Помилка при виході');
    }
  }

  async getCurrentUser(): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/auth/me`, {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Не авторизовано');
    }

    return response.json();
  }
}

export const authService = new AuthService();
