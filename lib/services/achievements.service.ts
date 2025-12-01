import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Configure axios interceptor to add token to requests
axios.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface AchievementType {
  id: string;
  title: string;
  emoji: string;
  description: string;
  category: 'sales' | 'content' | 'progress' | 'social';
}

export interface UserAchievement extends AchievementType {
  isUnlocked: boolean;
  isPending: boolean;
  isRejected: boolean;
  submittedAt?: Date;
  approvedAt?: Date;
  curatorComment?: string;
  userAchievementId?: string;
}

export interface SubmitAchievementDto {
  achievementId: string;
  proofText?: string;
  proofFile?: string;
  proofLink?: string;
}

class AchievementsService {
  async getAllTypes(): Promise<AchievementType[]> {
    try {
      const response = await axios.get(`${API_URL}/achievements/types`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching achievement types:', error);
      throw error;
    }
  }

  async getMyAchievements(): Promise<UserAchievement[]> {
    try {
      const response = await axios.get(`${API_URL}/achievements/my`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching my achievements:', error);
      throw error;
    }
  }

  async submitAchievement(dto: SubmitAchievementDto): Promise<any> {
    try {
      const response = await axios.post(`${API_URL}/achievements/submit`, dto);
      return response.data;
    } catch (error) {
      console.error('Error submitting achievement:', error);
      throw error;
    }
  }

  async getPendingAchievements(): Promise<any[]> {
    try {
      const response = await axios.get(`${API_URL}/achievements/pending`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching pending achievements:', error);
      throw error;
    }
  }

  async approveAchievement(id: string, comment?: string): Promise<any> {
    try {
      const response = await axios.put(`${API_URL}/achievements/${id}/approve`, { comment });
      return response.data;
    } catch (error) {
      console.error('Error approving achievement:', error);
      throw error;
    }
  }

  async rejectAchievement(id: string, comment: string): Promise<any> {
    try {
      const response = await axios.put(`${API_URL}/achievements/${id}/reject`, { comment });
      return response.data;
    } catch (error) {
      console.error('Error rejecting achievement:', error);
      throw error;
    }
  }
}

export const achievementsService = new AchievementsService();
