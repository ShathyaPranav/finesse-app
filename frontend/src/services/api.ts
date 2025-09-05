import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

// Helper function to handle API errors
const handleApiError = (error: any) => {
  if (error.response) {
    console.error('API Error:', {
      status: error.response.status,
      data: error.response.data,
      url: error.config?.url
    });
    throw new Error(error.response.data.detail || 'An error occurred');
  } else if (error.request) {
    console.error('No response received:', error.request);
    console.error('Request URL:', error.config?.url);
    throw new Error('No response from server. Please check your connection.');
  } else {
    console.error('Request setup error:', error.message);
    throw new Error('Error setting up request');
  }
};

// Tutor API
export const tutorApi = {
  ask: async (question: string, context?: string) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/tutor/ask`, { question, context });
      return response.data as { answer: string };
    } catch (error) {
      return handleApiError(error);
    }
  }
};

// Users API (leaderboard and XP sync)
export const usersApi = {
  getLeaderboard: async (limit: number = 10) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/users/leaderboard`, { params: { limit } });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
  setUserXP: async (userId: number, xp_points: number) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/users/${userId}/xp`, { xp_points });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
  setUserStreak: async (userId: number, streak_days: number) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/users/${userId}/streak`, { streak_days });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  }
};

// Auth API
export const authApi = {
  login: async (username: string, password: string) => {
    try {
      const params = new URLSearchParams();
      params.append('username', username);
      params.append('password', password);
      params.append('grant_type', 'password');
      const response = await axios.post(
        `${API_BASE_URL}/token`,
        params,
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
      );
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
  
  register: async (username: string, email: string, password: string) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/register`, {
        username,
        email,
        password,
      });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
};

// Lessons API
export const lessonsApi = {
  getLessons: async () => {
    try {
      console.log('Making request to:', `${API_BASE_URL}/lessons`);
      const response = await axios.get(`${API_BASE_URL}/lessons`);
      console.log('Lessons response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error in getLessons:', error);
      throw handleApiError(error);
    }
  },
  
  getLesson: async (id: number) => {
    try {
      console.log('Making request to:', `${API_BASE_URL}/lessons/${id}`);
      const response = await axios.get(`${API_BASE_URL}/lessons/${id}`);
      console.log('Lesson response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error in getLesson:', error);
      throw handleApiError(error);
    }
  },
};

// User Progress API
export const progressApi = {
  getUserProgress: async (userId: number) => {
    try {
      console.log('Making request to:', `${API_BASE_URL}/users/${userId}/progress`);
      const response = await axios.get(`${API_BASE_URL}/users/${userId}/progress`);
      console.log('Progress response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error in getUserProgress:', error);
      throw handleApiError(error);
    }
  },
  
  updateLessonProgress: async (userId: number, lessonId: number, progress: number) => {
    try {
      console.log('Making request to:', `${API_BASE_URL}/users/${userId}/lessons/${lessonId}/progress`);
      const response = await axios.post(
        `${API_BASE_URL}/users/${userId}/lessons/${lessonId}/progress`,
        { progress_percentage: progress }
      );
      console.log('Update progress response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error in updateLessonProgress:', error);
      throw handleApiError(error);
    }
  },
};

export default {
  auth: authApi,
  lessons: lessonsApi,
  progress: progressApi,
  users: usersApi,
  tutor: tutorApi,
};
