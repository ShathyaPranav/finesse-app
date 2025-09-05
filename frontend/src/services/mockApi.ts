import { Lesson, LessonContent, QuizContent } from '../types/lessons';

// Mock data for lessons
const mockLessons: Lesson[] = [
  {
    id: 1,
    title: 'Introduction to Investing',
    description: 'Master the fundamentals of investing and build a strong financial foundation.',
    icon: '💰',
    xp_reward: 150,
    estimated_duration: 30,
    order_index: 1,
    is_active: true,
    content_items: [
      {
        id: 1,
        lesson_id: 1,
        content_type: 'text',
        title: 'Introduction',
        content: 'Welcome to the world of investing! In this lesson, you will learn the basics of investing and how to get started.',
        order_index: 1,
        created_at: new Date().toISOString()
      } as const,
      {
        id: 2,
        lesson_id: 1,
        content_type: 'quiz',
        title: 'Quiz Time!',
        content: 'Test your knowledge!',
        order_index: 2,
        question: 'What is the primary goal of investing?',
        options: [
          'To spend all your money',
          'To make your money grow over time',
          'To avoid saving money'
        ] as string[], // Explicitly type as mutable string array
        correctAnswer: 1, // index of correct answer
        correct_answer: 1, // Backend uses snake_case
        explanation: 'The primary goal of investing is to make your money grow over time through various investment vehicles.',
        created_at: new Date().toISOString()
      }
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    locked: false,
    progress: 0
  },
  {
    id: 2,
    title: 'Stocks: Building Blocks of Wealth',
    description: 'Master stock market fundamentals and how to evaluate companies.',
    icon: '📈',
    xp_reward: 200,
    estimated_duration: 40,
    order_index: 2,
    is_active: true,
    content_items: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    locked: true,
    progress: 0
  }
];

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const mockApi = {
  // Get all lessons
  getLessons: async (): Promise<Lesson[]> => {
    await delay(500);
    return [...mockLessons];
  },

  // Get a single lesson by ID
  getLesson: async (id: number): Promise<Lesson | null> => {
    await delay(300);
    const lesson = mockLessons.find(lesson => lesson.id === id);
    return lesson || null;
  },

  // Update lesson progress
  updateLessonProgress: async (userId: number, lessonId: number, progress: number): Promise<void> => {
    await delay(300);
    const lesson = mockLessons.find(l => l.id === lessonId);
    if (lesson) {
      // Update progress
      const updatedLesson = {
        ...lesson,
        progress: Math.max(progress, lesson.progress || 0)
      };
      
      // Find and update the lesson in the array
      const index = mockLessons.findIndex(l => l.id === lessonId);
      if (index !== -1) {
        mockLessons[index] = updatedLesson;
      }
      
      // Unlock next lesson if progress is 100%
      if (progress >= 100) {
        const nextLessonIndex = mockLessons.findIndex(l => l.order_index === (lesson.order_index + 1));
        if (nextLessonIndex !== -1) {
          mockLessons[nextLessonIndex] = {
            ...mockLessons[nextLessonIndex],
            locked: false
          };
        }
      }
    }
  },

  // Get user progress
  getUserProgress: async (userId: number) => {
    await delay(300);
    return {
      total_lessons: mockLessons.length,
      completed_lessons: mockLessons.filter(l => l.progress === 100).length,
      total_xp: mockLessons.reduce((sum, lesson) => sum + (lesson.progress === 100 ? lesson.xp_reward : 0), 0)
    };
  }
};

export default mockApi;
