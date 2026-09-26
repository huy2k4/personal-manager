-- ==============================================================================
-- SUPABASE DATABASE SCHEMA FOR PERSONAL MANAGER (MULTI-USER & JOB CARDS)
-- ==============================================================================

-- 1. Profiles Table (Quản lý tài khoản người dùng, chỉ Admin mới tạo được tài khoản)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name TEXT,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
    has_finance BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Work Projects / Job Cards Table
CREATE TABLE IF NOT EXISTS public.work_projects (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    tagline TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('fulltime', 'project')),
    accent_color TEXT NOT NULL,
    logo_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Ensure user_id column exists if table was already created
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'work_projects' AND column_name = 'user_id'
    ) THEN
        ALTER TABLE public.work_projects ADD COLUMN user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 3. Project Schedules (Lịch trình công việc)
CREATE TABLE IF NOT EXISTS public.project_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id TEXT NOT NULL REFERENCES public.work_projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    time TEXT NOT NULL,
    date TEXT NOT NULL,
    done BOOLEAN NOT NULL DEFAULT false,
    note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Project Guides (Hướng dẫn công việc)
CREATE TABLE IF NOT EXISTS public.project_guides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id TEXT NOT NULL REFERENCES public.work_projects(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Project Glossary (Thuật ngữ chuyên môn)
CREATE TABLE IF NOT EXISTS public.project_glossary (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id TEXT NOT NULL REFERENCES public.work_projects(id) ON DELETE CASCADE,
    term TEXT NOT NULL,
    definition TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Tasks Table
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    time TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('work', 'freelance', 'study', 'personal')),
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
    done BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Contracts Table
CREATE TABLE IF NOT EXISTS public.contracts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    client TEXT NOT NULL,
    project TEXT NOT NULL,
    deadline TEXT NOT NULL,
    progress INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'review', 'done')),
    earned BIGINT NOT NULL DEFAULT 0,
    total BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_guides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_glossary ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;

-- 9. Open RLS Policies for App Operations
DO $$
BEGIN
    -- Drop old policies to avoid conflicts
    DROP POLICY IF EXISTS "Allow public all profiles" ON public.profiles;
    DROP POLICY IF EXISTS "Allow public all work_projects" ON public.work_projects;
    DROP POLICY IF EXISTS "Allow public all project_schedules" ON public.project_schedules;
    DROP POLICY IF EXISTS "Allow public all project_guides" ON public.project_guides;
    DROP POLICY IF EXISTS "Allow public all project_glossary" ON public.project_glossary;
    DROP POLICY IF EXISTS "Allow public all tasks" ON public.tasks;
    DROP POLICY IF EXISTS "Allow public all contracts" ON public.contracts;
END $$;

CREATE POLICY "Allow public all profiles" ON public.profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all work_projects" ON public.work_projects FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all project_schedules" ON public.project_schedules FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all project_guides" ON public.project_guides FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all project_glossary" ON public.project_glossary FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all tasks" ON public.tasks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all contracts" ON public.contracts FOR ALL USING (true) WITH CHECK (true);

-- 10. Seed Admin Account (huyproplus2004 / 572004huypromax)
INSERT INTO public.profiles (id, username, password_hash, full_name, role, has_finance)
VALUES 
    ('a0000000-0000-0000-0000-000000000001', 'huyproplus2004', '572004huypromax', 'Huy Pro Plus', 'admin', true)
ON CONFLICT (username) DO UPDATE SET 
    password_hash = EXCLUDED.password_hash,
    role = EXCLUDED.role,
    has_finance = EXCLUDED.has_finance;

-- Seed Work Projects linked to admin user
INSERT INTO public.work_projects (id, user_id, name, tagline, type, accent_color, logo_url)
VALUES 
    ('maersk', 'a0000000-0000-0000-0000-000000000001', 'Maersk', 'Fullstack Developer — Global Logistics Tech', 'fulltime', '#2563EB', '/maersk-logo.png'),
    ('betonamu', 'a0000000-0000-0000-0000-000000000001', 'Betonamu', 'Project Web Tiếng Nhật & Nhân Sự', 'project', '#DC2626', NULL),
    ('nam-khanh', 'a0000000-0000-0000-0000-000000000001', 'Nam Khánh', 'Project Web Xuất Khẩu Chuối', 'project', '#16A34A', NULL)
ON CONFLICT (id) DO UPDATE SET 
    user_id = EXCLUDED.user_id,
    name = EXCLUDED.name,
    tagline = EXCLUDED.tagline,
    accent_color = EXCLUDED.accent_color,
    logo_url = EXCLUDED.logo_url;

-- Seed Schedules
INSERT INTO public.project_schedules (project_id, title, time, date, done, note)
VALUES 
    ('maersk', 'Daily Standup Logistics Core', '09:00', '21/09', true, 'Cập nhật tiến độ module Booking API'),
    ('maersk', 'Họp Sprint Review & Retrospective Q3', '14:00', '22/09', false, 'Báo cáo KPI và backlog cho Tech Lead'),
    ('maersk', 'Review Pull Request #128 — EDI mapping service', '10:00', '23/09', false, 'Tập trung logic parse XML sang JSON'),
    ('maersk', 'Release hotfix container tracking pipeline v2.4.1', '16:30', '24/09', false, 'Kiểm tra deploy staging trước 15:00'),
    ('maersk', 'Refactor luồng xác thực SSO nội bộ công ty', '09:30', '25/09', false, NULL),
    ('maersk', 'Deploy staging và chạy smoke test cuối tuần', '15:00', '26/09', false, NULL),
    ('betonamu', 'Họp kickoff phase 2: Module tìm kiếm nhân sự', '10:00', '21/09', false, 'Thống nhất cấu trúc payload với Tech Lead đối tác'),
    ('betonamu', 'Gửi bản thiết kế giao diện Figma cho khách hàng duyệt', '15:00', '23/09', false, 'Kèm phương án dark mode'),
    ('betonamu', 'Fix bug responsive trên thiết bị iPad & Android tablet', '11:00', '25/09', false, NULL),
    ('betonamu', 'Deploy bản demo lên server Vercel để test nội bộ', '17:00', '27/09', false, NULL),
    ('betonamu', 'Nghiệm thu thanh toán đợt 1 hợp đồng', '09:00', '30/09', false, 'Gửi kèm biên bản bàn giao deliverables'),
    ('nam-khanh', 'Liên lạc với anh ABC để chốt hợp đồng', '20:00', '22/09', false, 'Chốt phạm vi tính năng & mốc thanh toán đợt 1'),
    ('nam-khanh', 'Gửi demo Dashboard khách hàng & tracking đơn', '16:00', '25/09', false, NULL),
    ('nam-khanh', 'Chốt bảng quy cách đóng gói và xuất khẩu', '11:00', '28/09', false, NULL),
    ('nam-khanh', 'Revise thiết kế trang chủ theo feedback', '09:00', '27/09', false, NULL),
    ('nam-khanh', 'Gửi báo giá cập nhật cho khách hàng', '16:00', '30/09', false, NULL),
    ('nam-khanh', 'Họp nội bộ thống nhất bàn giao', '10:00', '01/10', false, NULL)
ON CONFLICT DO NOTHING;

-- Seed Guides
INSERT INTO public.project_guides (project_id, question, answer)
VALUES 
    ('maersk', 'Kiến trúc hệ thống container tracking', 'Sử dụng Event-driven architecture với Kafka pipeline kết nối IoT tracker trên tàu biển với PostgreSQL Core.'),
    ('maersk', 'Quy trình deploy production chuẩn', 'Merge PR vào main -> chạy CI test tự động -> Tag version release -> Blue-Green deployment trên Kubernetes cluster.'),
    ('maersk', 'Xử lý lỗi EDI 301/310 format', 'Kiểm tra segment BGM và RFF trong EDI payload, đối soát checksum trước khi gửi sang API gateway.'),
    ('betonamu', 'Quy tắc đặt tên component & file tiếng Nhật', 'Luôn dùng camelCase tiếng Anh cho component (VD: CandidateFilter.tsx), chú thích bằng tiếng Nhật trong JSDoc.'),
    ('betonamu', 'Quy trình nghiệm thu với đối tác Nhật', 'Gửi checklist kiểm thử song ngữ Nhật - Việt, đính kèm video record demo và tài liệu hướng dẫn vận hành trước 3 ngày.'),
    ('betonamu', 'Cấu trúc chuyển ngữ i18n', 'Tách riêng file ja.json và vi.json theo namespace màn hình, tuyệt đối không hardcode text tiếng Nhật trực tiếp trong component.'),
    ('nam-khanh', 'Cách làm dashboard khách hàng', 'Dashboard khách hàng gồm 3 khối trọng tâm: (1) Trạng thái thời gian thực các lô chuối đang vận chuyển, (2) Biểu đồ nhiệt độ container lạnh Reefer (duy trì 13.5°C), (3) Khu vực tải file chứng từ kiểm dịch Phytosanitary và B/L trực tiếp.'),
    ('nam-khanh', 'Quy trình kiểm định và phân loại chuối xuất cảng', 'Kiểm tra độ cong tiêu chuẩn, đường kính quả theo thước kẹp chuyên dụng, màu sắc vỏ theo bảng chuẩn xuất khẩu trước khi dán tem truy xuất nguồn gốc.')
ON CONFLICT DO NOTHING;

-- Seed Glossary
INSERT INTO public.project_glossary (project_id, term, definition)
VALUES 
    ('maersk', 'EDI (Electronic Data Interchange)', 'Chuẩn trao đổi dữ liệu điện tử thương mại giữa các hệ thống logistics toàn cầu.'),
    ('maersk', 'B/L (Bill of Lading)', 'Vận đơn đường biển — chứng từ quan trọng xác nhận quyền sở hữu hàng hóa.'),
    ('maersk', 'TEU (Twenty-foot Equivalent Unit)', 'Đơn vị đo sức chở theo tiêu chuẩn container 20 feet.'),
    ('maersk', 'Demurrage & Detention', 'Phí lưu container tại bãi cảng vượt quá thời gian miễn phí cho phép.'),
    ('betonamu', '仕様書 (Shiyousho)', 'Bản tài liệu đặc tả yêu cầu kỹ thuật và nghiệp vụ của dự án.'),
    ('betonamu', '納品 (Nouhin)', 'Bàn giao sản phẩm hoặc deliverables cho khách hàng nghiệm thu.'),
    ('betonamu', '受入テスト (Ukeire Test)', 'Acceptance Testing — Kiểm thử tiếp nhận người dùng cuối trước khi release.'),
    ('betonamu', '工数 (Kousuu)', 'Khối lượng công việc dự tính (tính theo Man-Month hoặc Man-Day).'),
    ('nam-khanh', 'TypeB', 'Loại 2, kích thước nhỏ hơn (khoảng 16-19cm), dành cho thị trường thứ cấp.'),
    ('nam-khanh', 'TypeA', 'Loại 1, chuẩn xuất khẩu cao cấp (quả đều, không tì vết, chiều dài >20cm).'),
    ('nam-khanh', 'Reefer Container', 'Container lạnh chuyên dụng duy trì nhiệt độ bảo quản chuối tươi ở 13°C - 14°C trong suốt hải trình.'),
    ('nam-khanh', 'Phytosanitary', 'Giấy chứng nhận kiểm dịch thực vật bắt buộc khi thông quan hàng nông sản sang nước nhập khẩu.')
ON CONFLICT DO NOTHING;
