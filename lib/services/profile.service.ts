const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface UserProfile {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatarUrl?: string;
  faculty?: string;
  hasCompletedSorting: boolean;
  hasAcceptedRules: boolean;
  hasSeenWelcomeModal?: boolean;
  favoriteLessons: Array<{
    moduleId: string;
    lessonNumber: number;
    addedAt: string;
  }>;
}

export interface ProfileStats {
  modulesCompleted: number;
  totalModules: number;
  lessonsCompleted: number;
  totalLessons: number;
  earnings: number;
  rank: number;
}

export interface Achievement {
  _id?: string;
  title: string;
  description: string;
  imageUrl: string;
  awardedAt: Date;
}

export interface ProfileResponse {
  user: UserProfile;
  stats: ProfileStats;
}

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}

export const profileService = {
  async getProfile(): Promise<ProfileResponse> {
    const response = await fetch(`${API_URL}/profile`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch profile');
    }

    return response.json();
  },

  async updateProfile(data: Partial<UserProfile>): Promise<UserProfile> {
    const response = await fetch(`${API_URL}/profile`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to update profile');
    }

    return response.json();
  },

  async uploadAvatar(file: File): Promise<{ success: boolean; avatarUrl: string; user: UserProfile }> {
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await fetch(`${API_URL}/profile/avatar`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to upload avatar');
    }

    return response.json();
  },

  async getLeaderboard(): Promise<Array<{ rank: number; name: string; earnings: number; isCurrentUser: boolean }>> {
    const response = await fetch(`${API_URL}/profile/leaderboard`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch leaderboard');
    }

    return response.json();
  },

  async getMyAchievements(): Promise<Achievement[]> {
    const token = localStorage.getItem('token');
    if (!token) return [];

    // Декодуємо JWT щоб отримати userId
    const payload = JSON.parse(atob(token.split('.')[1]));
    const userId = payload.sub;

    const response = await fetch(`${API_URL}/admin/users/${userId}/achievements`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch achievements');
    }

    const data = await response.json();
    return data.achievements || [];
  },
};
