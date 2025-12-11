const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export interface AvatarLevel {
  _id: string;
  level: number;
  imageUrl: string;
  description?: string;
  text?: string;
}

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}

export const avatarService = {
  async getAvatarByLevel(level: number): Promise<AvatarLevel | null> {
    try {
      const response = await fetch(`${API_URL}/avatars/${level}`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        return null;
      }

      return response.json();
    } catch (error) {
      console.error('Failed to fetch avatar:', error);
      return null;
    }
  },

  async getAllAvatars(): Promise<AvatarLevel[]> {
    try {
      const response = await fetch(`${API_URL}/avatars`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        return [];
      }

      return response.json();
    } catch (error) {
      console.error('Failed to fetch avatars:', error);
      return [];
    }
  },
};
