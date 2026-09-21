import type {
  Task,
  Contract,
  LessonSchedule,
  LanguageProgress,
  SchoolProject,
  CryptoAsset,
  GymSession,
  NutritionToday,
} from '@/types';

export const todayTasks: Task[] = [
  { id: '1', title: 'Daily standup Maersk', time: '09:00', category: 'work', done: true, priority: 'high' },
  { id: '2', title: 'Review PR #42 — backend API', time: '10:00', category: 'work', done: false, priority: 'high' },
  { id: '3', title: 'Fix bug dashboard chart freelance A', time: '13:00', category: 'freelance', done: false, priority: 'high' },
  { id: '4', title: 'Dạy Scratch — Khối 4A buổi 7', time: '15:30', category: 'teach', done: false, priority: 'medium' },
  { id: '5', title: 'Duolingo Japanese — 10 phút', time: '20:00', category: 'study', done: false, priority: 'low' },
  { id: '6', title: 'Gym — Push day', time: '21:00', category: 'personal', done: false, priority: 'medium' },
];

export const contracts: Contract[] = [
  {
    id: 'f1',
    client: 'StartupX',
    project: 'Admin Dashboard',
    deadline: '2026-10-15',
    progress: 65,
    status: 'active',
    earned: 13000000,
    total: 20000000,
  },
  {
    id: 'f2',
    client: 'TechVN',
    project: 'Mobile App UI',
    deadline: '2026-09-30',
    progress: 90,
    status: 'review',
    earned: 8500000,
    total: 9000000,
  },
];

export const lessons: LessonSchedule[] = [
  { id: 'l1', student: 'Khối 4A (8 học sinh)', topic: 'Buổi 7 — Vòng lặp', time: '15:30', date: '2026-09-21', done: false },
  { id: 'l2', student: 'Khối 5B (5 học sinh)', topic: 'Buổi 3 — Biến số', time: '09:00', date: '2026-09-23', done: false },
  { id: 'l3', student: 'Khối 4A (8 học sinh)', topic: 'Buổi 8 — Project mini', time: '15:30', date: '2026-09-28', done: false },
];

export const languages: LanguageProgress[] = [
  {
    lang: 'EN',
    streak: 14,
    todayDone: true,
    level: 'B2',
    nextLesson: 'Business Writing — Unit 6',
    xp: 320,
    xpGoal: 500,
  },
  {
    lang: 'JA',
    streak: 6,
    todayDone: false,
    level: 'N4',
    nextLesson: 'て形 — Lesson 12',
    xp: 80,
    xpGoal: 200,
  },
];

export const schoolProjects: SchoolProject[] = [
  { id: 'p1', name: 'Hệ thống QLSV', subject: 'CSDL nâng cao', deadline: '2026-10-05', progress: 40, priority: 'high' },
  { id: 'p2', name: 'Research AI paper', subject: 'Machine Learning', deadline: '2026-11-01', progress: 15, priority: 'medium' },
  { id: 'p3', name: 'Báo cáo KTPM', subject: 'Kỹ thuật phần mềm', deadline: '2026-10-20', progress: 60, priority: 'medium' },
];

export const cryptoAssets: CryptoAsset[] = [
  { symbol: 'BTC', name: 'Bitcoin', amount: 0.012, value: 780, change24h: 2.4 },
  { symbol: 'ETH', name: 'Ethereum', amount: 0.35, value: 910, change24h: -1.2 },
  { symbol: 'SOL', name: 'Solana', amount: 5.2, value: 780, change24h: 4.8 },
];

export const gymSessions: GymSession[] = [
  { date: '2026-09-21', done: false, muscles: ['Chest', 'Triceps', 'Shoulders'], duration: undefined },
  { date: '2026-09-20', done: true, muscles: ['Back', 'Biceps'], duration: 62 },
  { date: '2026-09-19', done: true, muscles: ['Legs'], duration: 55 },
  { date: '2026-09-18', done: false, muscles: ['Rest'] },
  { date: '2026-09-17', done: true, muscles: ['Chest', 'Triceps'], duration: 58 },
];

export const nutritionToday: NutritionToday = {
  calories: 1640,
  caloriesGoal: 2400,
  protein: 98,
  proteinGoal: 160,
  carbs: 180,
  carbsGoal: 240,
  fat: 52,
  fatGoal: 70,
};
