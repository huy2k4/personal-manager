export interface Task {
  id: string;
  title: string;
  time?: string;
  category: 'work' | 'freelance' | 'teach' | 'study' | 'personal';
  done: boolean;
  priority: 'high' | 'medium' | 'low';
}

export interface Contract {
  id: string;
  client: string;
  project: string;
  deadline: string;
  progress: number; // 0-100
  status: 'active' | 'review' | 'overdue';
  earned: number;
  total: number;
}

export interface LessonSchedule {
  id: string;
  student: string;
  topic: string;
  time: string;
  date: string;
  done: boolean;
}

export interface LanguageProgress {
  lang: 'EN' | 'JA';
  streak: number;
  todayDone: boolean;
  level: string;
  nextLesson: string;
  xp: number;
  xpGoal: number;
}

export interface SchoolProject {
  id: string;
  name: string;
  subject: string;
  deadline: string;
  progress: number;
  priority: 'high' | 'medium' | 'low';
}

export interface CryptoAsset {
  symbol: string;
  name: string;
  amount: number;
  value: number; // USD
  change24h: number; // percent
}

export interface GymSession {
  date: string;
  done: boolean;
  muscles: string[];
  duration?: number; // minutes
}

export interface NutritionToday {
  calories: number;
  caloriesGoal: number;
  protein: number;
  proteinGoal: number;
  carbs: number;
  carbsGoal: number;
  fat: number;
  fatGoal: number;
}
