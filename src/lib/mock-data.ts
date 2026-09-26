import type {
  Task,
  Contract,
  LessonSchedule,
  LanguageProgress,
  SchoolProject,
  CryptoAsset,
  GymSession,
  NutritionToday,
  WorkProject,
} from '@/types';

export const todayTasks: Task[] = [];

export const contracts: Contract[] = [];

export const lessons: LessonSchedule[] = [];

export const languages: LanguageProgress[] = [
  {
    lang: 'EN',
    streak: 0,
    todayDone: false,
    level: 'B2',
    nextLesson: 'Business Writing',
    xp: 0,
    xpGoal: 500,
  },
  {
    lang: 'JA',
    streak: 0,
    todayDone: false,
    level: 'N4',
    nextLesson: 'Tiếng Nhật',
    xp: 0,
    xpGoal: 200,
  },
];

export const schoolProjects: SchoolProject[] = [];

export const cryptoAssets: CryptoAsset[] = [
  { symbol: 'BTC', name: 'Bitcoin', amount: 0.012, value: 780, change24h: 2.4 },
  { symbol: 'ETH', name: 'Ethereum', amount: 0.35, value: 910, change24h: -1.2 },
  { symbol: 'SOL', name: 'Solana', amount: 5.2, value: 780, change24h: 4.8 },
];

export const gymSessions: GymSession[] = [];

export const nutritionToday: NutritionToday = {
  calories: 0,
  caloriesGoal: 2400,
  protein: 0,
  proteinGoal: 160,
  carbs: 0,
  carbsGoal: 240,
  fat: 0,
  fatGoal: 70,
};

/* ─── 3 Work Cards (Maersk, Betonamu, Nam Khánh) — Blank slate ready for real input ─── */
export const workProjects: WorkProject[] = [
  {
    id: 'maersk',
    name: 'Maersk',
    logoUrl: '/maersk-logo.png',
    tagline: '',
    type: 'primary',
    schedules: [],
    guides: [],
    glossary: [],
  },
  {
    id: 'betonamu',
    name: 'Betonamu',
    tagline: '',
    type: 'project',
    accentColor: '#DC2626',
    schedules: [],
    guides: [],
    glossary: [],
  },
  {
    id: 'nam-khanh',
    name: 'Nam Khánh',
    tagline: '',
    type: 'project',
    accentColor: '#16A34A',
    schedules: [],
    guides: [],
    glossary: [],
  },
];

