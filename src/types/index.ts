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

/* ─── Work Projects Management (Lịch trình, Hướng dẫn, Thuật ngữ) ─── */
export interface ProjectSchedule {
  id: string;
  title: string;
  time?: string;
  date: string;
  done?: boolean;
  note?: string;
}

export interface ProjectGuide {
  id: string;
  question: string; // Vấn đề / Tên hướng dẫn
  answer: string;   // Hướng dẫn giải quyết / Nội dung chi tiết
}

export interface ProjectGlossary {
  id: string;
  term: string;       // Thuật ngữ
  definition: string; // Ý nghĩa / định nghĩa
}

export interface WorkProject {
  id: string;
  name: string;
  tagline: string;
  type: 'primary' | 'project';
  accentColor?: string;
  schedules: ProjectSchedule[];
  guides?: ProjectGuide[];
  glossary?: ProjectGlossary[];
}
