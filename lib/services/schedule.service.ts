const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export interface ScheduleEvent {
  _id: string;
  title: string;
  description?: string;
  date: string;
  time?: string;
  timeEurope?: string;
  type: 'platform_opening' | 'live_stream' | 'module_opening' | 'zoom_meeting' | 'group_meeting';
  link?: string;
  speaker?: string;
  isCompleted: boolean;
  notes?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ScheduleResponse {
  success: boolean;
  data: ScheduleEvent[];
}

export const scheduleService = {
  // Отримати всі події
  async getAllEvents(): Promise<ScheduleEvent[]> {
    const response = await fetch(`${API_URL}/schedule`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch schedule events');
    }

    const result: ScheduleResponse = await response.json();
    return result.data;
  },

  // Отримати майбутні події
  async getUpcomingEvents(): Promise<ScheduleEvent[]> {
    const response = await fetch(`${API_URL}/schedule/upcoming`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch upcoming events');
    }

    const result: ScheduleResponse = await response.json();
    return result.data;
  },

  // Отримати події за діапазоном дат
  async getEventsByDateRange(startDate: string, endDate: string): Promise<ScheduleEvent[]> {
    const response = await fetch(
      `${API_URL}/schedule/range?startDate=${startDate}&endDate=${endDate}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch events by date range');
    }

    const result: ScheduleResponse = await response.json();
    return result.data;
  },

  // Отримати одну подію
  async getEventById(id: string): Promise<ScheduleEvent> {
    const response = await fetch(`${API_URL}/schedule/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch event');
    }

    const result = await response.json();
    return result.data;
  },
};
