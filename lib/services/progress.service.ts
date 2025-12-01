const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}

export const progressService = {
  async completeLesson(
    moduleId: string, 
    lessonNumber: number,
    moodRating?: number,
    usefulnessRating?: number
  ): Promise<{ success: boolean; message: string; completedLessons: number }> {
    const response = await fetch(`${API_URL}/progress/lessons/${moduleId}/${lessonNumber}/complete`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ moodRating, usefulnessRating }),
    });

    if (!response.ok) {
      throw new Error('Failed to complete lesson');
    }

    return response.json();
  },

  async uncompleteLesson(moduleId: string, lessonNumber: number): Promise<{ success: boolean; message: string; completedLessons: number }> {
    const response = await fetch(`${API_URL}/progress/lessons/${moduleId}/${lessonNumber}/complete`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to uncomplete lesson');
    }

    return response.json();
  },

  async completeModule(moduleId: string): Promise<{ success: boolean; message: string; completedModules: number }> {
    const response = await fetch(`${API_URL}/progress/modules/${moduleId}/complete`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to complete module');
    }

    return response.json();
  },

  async getLessonStatus(moduleId: string, lessonNumber: number): Promise<{ isCompleted: boolean }> {
    const response = await fetch(`${API_URL}/progress/lessons/${moduleId}/${lessonNumber}/status`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to get lesson status');
    }

    return response.json();
  },
};
