import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    Authorization: `Bearer ${token}`,
  };
};

export interface Homework {
  id: string;
  studentId: string;
  studentName: string;
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

export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  faculty?: string;
  completedLessonsCount: number;
  completedModulesCount: number;
  earnings: number;
}

export interface CuratorModule {
  id: string;
  number: number;
  title: string;
  description: string;
  lessonsCount: number;
}

export const curatorService = {
  async getHomeworks(): Promise<Homework[]> {
    const response = await axios.get(`${API_URL}/curator/homeworks`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  async uploadAudioFeedback(audioBlob: Blob): Promise<{ audioUrl: string }> {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'feedback.webm');
    
    const response = await axios.post(
      `${API_URL}/curator/homeworks/upload-audio`,
      formData,
      {
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  async reviewHomework(
    homeworkId: string,
    score: number,
    feedback?: string,
    audioFeedback?: string
  ): Promise<{ id: string; score: number; feedback?: string; audioFeedback?: string; status: string; reviewedAt: Date }> {
    const response = await axios.put(
      `${API_URL}/curator/homeworks/${homeworkId}/review`,
      { score, feedback, audioFeedback },
      { headers: getAuthHeaders() }
    );
    return response.data;
  },

  async returnForRevision(
    homeworkId: string,
    feedback: string,
    audioFeedback?: string
  ): Promise<{ id: string; feedback: string; audioFeedback?: string; status: string; reviewedAt: Date }> {
    const response = await axios.put(
      `${API_URL}/curator/homeworks/${homeworkId}/return`,
      { feedback, audioFeedback },
      { headers: getAuthHeaders() }
    );
    return response.data;
  },

  async getMyStudents(): Promise<Student[]> {
    const response = await axios.get(`${API_URL}/curator/students`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  async getAllModules(): Promise<CuratorModule[]> {
    const response = await axios.get(`${API_URL}/curator/modules`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },
};
