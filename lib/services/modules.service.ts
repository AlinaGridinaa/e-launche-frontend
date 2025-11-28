import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Configure axios to send cookies
axios.defaults.withCredentials = true;

export interface LessonMaterial {
  type: string;
  title: string;
  url: string;
}

export interface Lesson {
  _id?: string;
  number: number;
  title: string;
  videoUrl: string;
  description: string;
  materials: LessonMaterial[];
  homework: string;
  duration: number;
  isCompleted: boolean;
}

export interface Module {
  _id: string;
  number: number;
  title: string;
  description: string;
  isLocked: boolean;
  unlockDate?: Date;
  lessons: Lesson[];
  progress: number;
  category: string;
  createdAt: Date;
  updatedAt: Date;
}

class ModulesService {
  async getModules(): Promise<Module[]> {
    try {
      const response = await axios.get(`${API_URL}/modules`);
      return response.data;
    } catch (error) {
      console.error('Error fetching modules:', error);
      throw error;
    }
  }

  async getModuleById(id: string): Promise<Module> {
    try {
      const response = await axios.get(`${API_URL}/modules/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching module:', error);
      throw error;
    }
  }

  async getModuleByNumber(number: number): Promise<Module> {
    try {
      const response = await axios.get(`${API_URL}/modules/number/${number}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching module:', error);
      throw error;
    }
  }

  async markLessonComplete(moduleId: string, lessonNumber: number, isCompleted: boolean): Promise<Module> {
    try {
      const response = await axios.put(
        `${API_URL}/modules/${moduleId}/lessons/${lessonNumber}/complete`,
        { isCompleted }
      );
      return response.data;
    } catch (error) {
      console.error('Error updating lesson completion:', error);
      throw error;
    }
  }

  async createModule(moduleData: Partial<Module>): Promise<Module> {
    try {
      const response = await axios.post(`${API_URL}/modules`, moduleData);
      return response.data;
    } catch (error) {
      console.error('Error creating module:', error);
      throw error;
    }
  }

  async updateModule(id: string, moduleData: Partial<Module>): Promise<Module> {
    try {
      const response = await axios.put(`${API_URL}/modules/${id}`, moduleData);
      return response.data;
    } catch (error) {
      console.error('Error updating module:', error);
      throw error;
    }
  }

  async deleteModule(id: string): Promise<void> {
    try {
      await axios.delete(`${API_URL}/modules/${id}`);
    } catch (error) {
      console.error('Error deleting module:', error);
      throw error;
    }
  }
}

export const modulesService = new ModulesService();
