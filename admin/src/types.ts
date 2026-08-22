export interface QuestionOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface QuestionTranslation {
  language: string; // tr, en, de, fr, es, zh, ru, ar
  text: string;
  options: QuestionOption[];
  explanation: string;
  wrongMessage: string;
  status: 'active' | 'draft' | 'missing';
}

export interface Question {
  id: string;
  type: string;
  difficulty: 'easy' | 'medium' | 'hard';
  categoryId: string;
  status: 'active' | 'passive';
  priority: number;
  translations: Record<string, QuestionTranslation>;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
}

export interface DashboardStats {
  totalUsers: number;
  dailyActive: number;
  totalQuestions: number;
  playedToday: number;
}

export interface AdminUser {
  email: string;
  name: string;
}

export interface Feedback {
  id: string;
  questionId: string;
  user: string;
  type: 'up' | 'down' | 'report';
  date: string;
  comment: string;
}

export interface AdminLog {
  id: string;
  date: string;
  admin: string;
  action: string;
  target: string;
  detail: string;
}
