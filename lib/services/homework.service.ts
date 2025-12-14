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

export interface Homework {
  id: string;
  moduleId: string;
  moduleTitle: string;
  moduleNumber: number;
  lessonNumber: number;
  answer: string;
  attachments: string[];
  fileAttachments?: string[];
  status: 'pending' | 'reviewed' | 'approved' | 'needs_revision';
  score?: number;
  feedback?: string;
  audioFeedback?: string;
  submittedAt: Date;
  reviewedAt?: Date;
}

export interface SubmitHomeworkDto {
  moduleId: string;
  lessonNumber: number;
  answer: string;
  attachments?: string[];
}

class HomeworkService {
  async submitHomework(dto: SubmitHomeworkDto, files?: File[]): Promise<Homework> {
    const formData = new FormData();
    formData.append('moduleId', dto.moduleId);
    formData.append('lessonNumber', String(dto.lessonNumber));
    formData.append('answer', dto.answer);
    
    // Додаємо attachments як JSON string, бо FormData не підтримує масиви напряму
    if (dto.attachments && dto.attachments.length > 0) {
      formData.append('attachments', JSON.stringify(dto.attachments));
    }

    // Додаємо файли
    if (files && files.length > 0) {
      files.forEach((file) => {
        formData.append('files', file);
      });
    }

    const response = await axios.post(`${API_URL}/homework/submit`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async getMyHomework(moduleId: string, lessonNumber: number): Promise<Homework | null> {
    try {
      const response = await axios.get(`${API_URL}/homework/my/${moduleId}/${lessonNumber}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  async getMyAllHomeworks(): Promise<Homework[]> {
    const response = await axios.get(`${API_URL}/homework/my`);
    return response.data;
  }
}

export const homeworkService = new HomeworkService();
