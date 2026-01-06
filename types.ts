
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

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export type View = 'login' | 'signup' | 'dashboard' | 'course-detail' | 'lesson';

export interface AppState {
  view: View;
  currentUser: User | null;
  selectedCourseId: string | null;
  selectedLessonId: string | null;
}
