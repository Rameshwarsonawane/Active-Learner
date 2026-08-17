export enum LessonStatus {
  NOT_STARTED = 'Not Started',
  IN_PROGRESS = 'In Progress',
  COMPLETED = 'Completed'
}

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  image: string;
  lessonCount: number;
}

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  content: string;
  order: number;
  quiz?: Quiz;
}

export interface Quiz {
  id: string;
  lessonId: string;
  title: string;
  questions: QuizQuestion[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctOption: number;
}

export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  enrolledAt: string;
}

export interface LessonProgress {
  id: string;
  userId: string;
  lessonId: string;
  status: LessonStatus;
  bestScore: number;
  updatedAt: string;
}

// Fix: Added missing Badge interface used for mastery tracking and certification visualization.
export interface Badge {
  id: string;
  userId: string;
  courseId: string;
  title: string;
  icon: string;
  awardedAt: string;
}

export type ViewPath = 'dashboard' | 'login' | 'register' | 'course-detail' | 'lesson-player' | 'courses-list';