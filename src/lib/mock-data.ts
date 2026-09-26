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

export const todayTasks: Task[] = [
  { id: '1', title: 'Daily standup Maersk', time: '09:00', category: 'work', done: true, priority: 'high' },
  { id: '2', title: 'Review PR #42 — backend API', time: '10:00', category: 'work', done: false, priority: 'high' },
  { id: '3', title: 'Họp review mockup web Betonamu', time: '10:00', category: 'freelance', done: false, priority: 'high' },
  { id: '4', title: 'Liên lạc anh ABC chốt HĐ Nam Khánh', time: '20:00', category: 'freelance', done: false, priority: 'high' },
  { id: '5', title: 'Duolingo Japanese — 10 phút', time: '21:00', category: 'study', done: false, priority: 'low' },
  { id: '6', title: 'Gym — Push day', time: '21:30', category: 'personal', done: false, priority: 'medium' },
];

export const contracts: Contract[] = [
  {
    id: 'f1',
    client: 'Betonamu',
    project: 'Web Tiếng Nhật',
    deadline: '2026-10-15',
    progress: 65,
    status: 'active',
    earned: 15000000,
    total: 22000000,
  },
  {
    id: 'f2',
    client: 'Nam Khánh',
    project: 'Web Xuất Khẩu Chuối',
    deadline: '2026-09-30',
    progress: 85,
    status: 'review',
    earned: 12000000,
    total: 15000000,
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

/* ─── 3 Work Cards (Maersk, Betonamu, Nam Khánh) ─── */
export const workProjects: WorkProject[] = [
  {
    id: 'maersk',
    name: 'Maersk',
    logoUrl: '/maersk-logo.png',
    tagline: '',
    type: 'primary',
    schedules: [
      { id: 'm1', title: 'Daily standup Maersk', time: '09:00', date: '21/09', done: true },
      { id: 'm2', title: 'Review PR #42 — Backend Tracking API', time: '10:30', date: '21/09', done: false },
      { id: 'm3', title: 'Sprint Planning & Backlog Refinement', time: '14:00', date: '23/09', done: false },
      { id: 'm4', title: 'Deploy Release v2.4 lên Staging', time: '17:00', date: '25/09', done: false },
      { id: 'm5', title: 'Daily standup Maersk', time: '09:00', date: '26/09', done: false },
      { id: 'm6', title: 'Code review module Container Tracking', time: '11:00', date: '27/09', done: false },
      { id: 'm7', title: 'Fix bug EDI message parsing', time: '14:00', date: '29/09', done: false },
      { id: 'm8', title: 'Sprint demo & retrospective', time: '15:00', date: '01/10', done: false },
    ],
    guides: [
      {
        id: 'mg1',
        question: 'Quy chuẩn PR và commit message Maersk',
        answer: 'Tuân thủ Conventional Commits: feat(tracking): description hoặc fix(api): description. Mọi PR cần tối thiểu 2 approvals và pass toàn bộ CI pipeline trước khi merge.',
      },
      {
        id: 'mg2',
        question: 'Cấu hình VPN và truy cập nội bộ',
        answer: 'Kết nối qua Cisco AnyConnect với MFA chứng thực qua Microsoft Authenticator. Domain nội bộ staging: *.internal.maersk.com.',
      },
      {
        id: 'mg3',
        question: 'Quy trình xử lý sự cố tracking API',
        answer: 'Kiểm tra log trên Datadog service "ocean-tracking-api", verify message queue trên Azure Service Bus và báo cáo cho Tech Lead nếu độ trễ vượt 200ms.',
      },
    ],
    glossary: [
      { id: 'mg1', term: 'EDI', definition: 'Chuẩn trao đổi dữ liệu điện tử giữa hãng tàu và đối tác logistics.' },
      { id: 'mg2', term: 'B/L (Bill of Lading)', definition: 'Vận đơn đường biển, chứng từ sở hữu và vận chuyển hàng hóa quốc tế.' },
      { id: 'mg3', term: 'Demurrage', definition: 'Phí lưu bãi/lưu container tại cảng khi vượt quá số ngày miễn phí.' },
    ],
  },
  {
    id: 'betonamu',
    name: 'Betonamu',
    tagline: 'Project Web Tiếng Nhật',
    type: 'project',
    accentColor: '#DC2626',
    schedules: [
      { id: 'b1', title: 'Họp review UI mockup với PM bên Nhật', time: '10:00', date: '22/09', done: false, note: 'Chuẩn bị prototype Figma' },
      { id: 'b2', title: 'Hoàn thành layout module bài học đa ngôn ngữ', time: '18:00', date: '24/09', done: false },
      { id: 'b3', title: 'Bàn giao bản Test nội bộ (Alpha release)', time: '12:00', date: '28/09', done: false },
      { id: 'b4', title: 'Fix lỗi font Kanji trên Safari', time: '10:00', date: '26/09', done: false },
      { id: 'b5', title: 'Họp check-in tiến độ với client Nhật', time: '14:00', date: '30/09', done: false },
      { id: 'b6', title: 'Viết tài liệu API i18n', time: '10:00', date: '02/10', done: false },
    ],
    guides: [
      {
        id: 'bg1',
        question: 'Quy chuẩn font chữ và hiển thị tiếng Nhật',
        answer: 'Sử dụng font Noto Sans JP hoặc Hiragino Kaku Gothic làm fallback; set line-height tối thiểu 1.7 để tránh dính chữ Kanji. Luôn kiểm tra wrap từ (word-break: keep-all).',
      },
      {
        id: 'bg2',
        question: 'Xử lý Ruby text (Furigana) trong giao diện',
        answer: 'Dùng thẻ HTML <ruby><rt>...</rt></ruby> chuẩn hóa cho phần phiên âm trên đầu Kanji, chú ý test responsive trên mobile để không làm nhảy độ cao dòng.',
      },
      {
        id: 'bg3',
        question: 'Cấu trúc chuyển ngữ i18n',
        answer: 'Tách riêng file ja.json và vi.json theo namespace màn hình, tuyệt đối không hardcode text tiếng Nhật trực tiếp trong component.',
      },
    ],
    glossary: [
      { id: 'bt1', term: '仕様書 (Shiyousho)', definition: 'Bản tài liệu đặc tả yêu cầu kỹ thuật và nghiệp vụ của dự án.' },
      { id: 'bt2', term: '納品 (Nouhin)', definition: 'Bàn giao sản phẩm hoặc deliverables cho khách hàng nghiệm thu.' },
      { id: 'bt3', term: '受入テスト (Ukeire Test)', definition: 'Acceptance Testing — Kiểm thử tiếp nhận người dùng cuối trước khi release.' },
      { id: 'bt4', term: '工数 (Kousuu)', definition: 'Khối lượng công việc dự tính (tính theo Man-Month hoặc Man-Day).' },
    ],
  },
  {
    id: 'nam-khanh',
    name: 'Nam Khánh',
    tagline: 'Project Web Xuất Khẩu Chuối',
    type: 'project',
    accentColor: '#16A34A',
    schedules: [
      { id: 'nk1', title: 'Liên lạc với anh ABC để chốt hợp đồng', time: '20:00', date: '22/09', done: false, note: 'Chốt phạm vi tính năng & mốc thanh toán đợt 1' },
      { id: 'nk2', title: 'Gửi demo Dashboard khách hàng & tracking đơn', time: '16:00', date: '25/09', done: false },
      { id: 'nk3', title: 'Chốt bảng quy cách đóng gói và xuất khẩu', time: '11:00', date: '28/09', done: false },
      { id: 'nk4', title: 'Revise thiết kế trang chủ theo feedback', time: '09:00', date: '27/09', done: false },
      { id: 'nk5', title: 'Gửi báo giá cập nhật cho khách hàng', time: '16:00', date: '30/09', done: false },
      { id: 'nk6', title: 'Họp nội bộ thống nhất bàn giao', time: '10:00', date: '01/10', done: false },
    ],
    guides: [
      {
        id: 'nkg1',
        question: 'Cách làm dashboard khách hàng',
        answer: 'Dashboard khách hàng gồm 3 khối trọng tâm: (1) Trạng thái thời gian thực các lô chuối đang vận chuyển, (2) Biểu đồ nhiệt độ container lạnh Reefer (duy trì 13.5°C), (3) Khu vực tải file chứng từ kiểm dịch Phytosanitary và B/L trực tiếp.',
      },
      {
        id: 'nkg2',
        question: 'Quy trình kiểm định và phân loại chuối xuất cảng',
        answer: 'Kiểm tra độ cong tiêu chuẩn, đường kính quả theo thước kẹp chuyên dụng, màu sắc vỏ theo bảng chuẩn xuất khẩu trước khi dán tem truy xuất nguồn gốc.',
      },
    ],
    glossary: [
      { id: 'nkt1', term: 'TypeB', definition: 'Loại 2, kích thước nhỏ hơn (khoảng 16-19cm), dành cho thị trường thứ cấp.' },
      { id: 'nkt2', term: 'TypeA', definition: 'Loại 1, chuẩn xuất khẩu cao cấp (quả đều, không tì vết, chiều dài >20cm).' },
      { id: 'nkt3', term: 'Reefer Container', definition: 'Container lạnh chuyên dụng duy trì nhiệt độ bảo quản chuối tươi ở 13°C - 14°C trong suốt hải trình.' },
      { id: 'nkt4', term: 'Phytosanitary', definition: 'Giấy chứng nhận kiểm dịch thực vật bắt buộc khi thông quan hàng nông sản sang nước nhập khẩu.' },
    ],
  },
];
