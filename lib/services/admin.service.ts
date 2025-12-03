import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    Authorization: `Bearer ${token}`,
  };
};

export interface Achievement {
  _id?: string;
  title: string;
  description: string;
  imageUrl: string;
  awardedAt: Date;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneOrTelegram?: string;
  group?: string;
  accessUntil?: string;
  tariff?: string;
  faculty?: string;
  isAdmin: boolean;
  isCurator?: boolean;
  curatorId?: string;
  earnings: number;
  completedLessonsCount: number;
  completedModulesCount: number;
  achievements?: Achievement[];
}

export interface Curator {
  id: string;
  name: string;
  email: string;
}

export const adminService = {
  async getAllUsers(): Promise<User[]> {
    const response = await axios.get(`${API_URL}/admin/users`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  async assignFaculty(userId: string, faculty: string): Promise<User> {
    const response = await axios.put(
      `${API_URL}/admin/users/${userId}/faculty`,
      { faculty },
      { headers: getAuthHeaders() }
    );
    return response.data;
  },

  async toggleAdmin(userId: string): Promise<{ id: string; email: string; isAdmin: boolean }> {
    const response = await axios.put(
      `${API_URL}/admin/users/${userId}/admin`,
      {},
      { headers: getAuthHeaders() }
    );
    return response.data;
  },

  async createUser(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phoneOrTelegram?: string;
    group?: string;
    accessUntil?: string;
    tariff?: string;
    faculty?: string;
    isAdmin?: boolean;
    isCurator?: boolean;
  }): Promise<User> {
    const response = await axios.post(
      `${API_URL}/admin/users`,
      userData,
      { headers: getAuthHeaders() }
    );
    return response.data;
  },

  async awardAchievement(
    userId: string,
    achievement: {
      title: string;
      description: string;
      imageUrl: string;
    }
  ): Promise<{ id: string; firstName: string; lastName: string; achievements: Achievement[] }> {
    const response = await axios.post(
      `${API_URL}/admin/users/${userId}/achievements`,
      achievement,
      { headers: getAuthHeaders() }
    );
    return response.data;
  },

  async getUserAchievements(userId: string): Promise<{
    id: string;
    firstName: string;
    lastName: string;
    achievements: Achievement[];
  }> {
    const response = await axios.get(
      `${API_URL}/admin/users/${userId}/achievements`,
      { headers: getAuthHeaders() }
    );
    return response.data;
  },

  async removeAchievement(userId: string, achievementId: string): Promise<{ id: string; achievements: Achievement[] }> {
    const response = await axios.delete(
      `${API_URL}/admin/users/${userId}/achievements/${achievementId}`,
      { headers: getAuthHeaders() }
    );
    return response.data;
  },

  async toggleCurator(userId: string): Promise<{ id: string; email: string; isCurator: boolean }> {
    const response = await axios.put(
      `${API_URL}/admin/users/${userId}/curator-toggle`,
      {},
      { headers: getAuthHeaders() }
    );
    return response.data;
  },

  async assignCurator(userId: string, curatorId: string): Promise<{ id: string; curatorId: string; curatorName: string }> {
    const response = await axios.put(
      `${API_URL}/admin/users/${userId}/assign-curator`,
      { curatorId },
      { headers: getAuthHeaders() }
    );
    return response.data;
  },

  async getAllCurators(): Promise<Curator[]> {
    const response = await axios.get(
      `${API_URL}/admin/curators`,
      { headers: getAuthHeaders() }
    );
    return response.data;
  },

  // Avatar management
  async getAllAvatarLevels(): Promise<Array<{ _id: string; level: number; imageUrl: string; description?: string }>> {
    const response = await axios.get(
      `${API_URL}/admin/avatars`,
      { headers: getAuthHeaders() }
    );
    return response.data;
  },

  async setAvatarLevel(level: number, imageUrl: string, description?: string): Promise<{ level: number; imageUrl: string; description?: string }> {
    const response = await axios.put(
      `${API_URL}/admin/avatars/${level}`,
      { imageUrl, description },
      { headers: getAuthHeaders() }
    );
    return response.data;
  },

  async deleteAvatarLevel(level: number): Promise<{ message: string }> {
    const response = await axios.delete(
      `${API_URL}/admin/avatars/${level}`,
      { headers: getAuthHeaders() }
    );
    return response.data;
  },

  async initializeDefaultAvatars(): Promise<{ message: string; count: number }> {
    const response = await axios.post(
      `${API_URL}/admin/avatars/initialize`,
      {},
      { headers: getAuthHeaders() }
    );
    return response.data;
  },

  async uploadAvatarImage(level: number, file: File, description?: string): Promise<{ level: number; imageUrl: string; description?: string }> {
    const formData = new FormData();
    formData.append('file', file);
    if (description) {
      formData.append('description', description);
    }

    const response = await axios.post(
      `${API_URL}/admin/avatars/${level}/upload`,
      formData,
      { 
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'multipart/form-data',
        }
      }
    );
    return response.data;
  },
};
