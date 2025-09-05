export type LessonContentType = 'text' | 'quiz' | 'video' | 'interactive';

export interface BaseContent {
  id: number;
  lesson_id: number;
  content_type: LessonContentType;
  title: string;
  content: string | Record<string, any>;
  order_index: number;
  created_at: string;
}

export interface TextContent extends BaseContent {
  content_type: 'text';
  content: string;
}

export interface QuizContent extends BaseContent {
  content_type: 'quiz';
  question: string;
  options: string[];
  correctAnswer: number;
  correct_answer: number; // Backend uses snake_case
  explanation: string;
}

export interface VideoContent extends BaseContent {
  content_type: 'video';
  content: {
    videoUrl: string;
    thumbnailUrl?: string;
    duration?: number; // in seconds
  };
}

export interface InteractiveContent extends BaseContent {
  content_type: 'interactive';
  content: {
    component: string;
    data: Record<string, any>;
  };
}

export type LessonContent = TextContent | QuizContent | VideoContent | InteractiveContent;

export interface Lesson {
  // Core properties
  id: number;
  title: string;
  description: string;
  completed?: boolean;
  icon: string;
  
  // Backend properties
  xp_reward: number;
  estimated_duration: number; // in minutes
  order_index: number;
  is_active: boolean;
  content_items: LessonContent[];
  created_at: string;
  updated_at: string;
  
  // Client-side properties
  locked?: boolean;
  progress?: number;
  prerequisites?: number[];
  tags?: string[];
}

export interface LessonProgress {
  lessonId: number;
  completed: boolean;
  progress: number;
  lastAccessed: string;
  stepsCompleted: Record<string, boolean>;
}

export interface UserProgress {
  completedLessons: number;
  totalLessons: number;
  completionPercentage: number;
  totalXP: number;
}
