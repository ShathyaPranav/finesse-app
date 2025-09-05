// User-related types
export interface UserData {
  id: string;
  username: string;
  email: string;
  xp?: number;
  streak?: number;
  // Add other user fields as needed
}

// Auth-related types
export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: UserData;
}

// Lesson-related types
export interface Lesson {
  id: number;
  title: string;
  description: string;
  xp_reward: number;
  progress: number;
  // Add other lesson fields as needed
}

// API response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
}

// Form data types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}
