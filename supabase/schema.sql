-- ==============================================================================
-- SUPABASE DATABASE SCHEMA FOR PERSONAL MANAGER
-- ==============================================================================

-- 1. Tasks Table (Việc cần làm hôm nay / theo ngày)
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    time TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('work', 'freelance', 'study', 'personal')),
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
    done BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- 2. Contracts Table (Hợp đồng freelance)
CREATE TABLE IF NOT EXISTS public.contracts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client TEXT NOT NULL,
    project TEXT NOT NULL,
    deadline TEXT NOT NULL,
    progress INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'review', 'done')),
    earned BIGINT NOT NULL DEFAULT 0,
    total BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- 3. Work Projects Table (Dự án: Maersk, Betonamu, Nam Khánh)
CREATE TABLE IF NOT EXISTS public.work_projects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    tagline TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('fulltime', 'project')),
    accent_color TEXT NOT NULL,
    logo_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Project Schedules Table (Lịch trình công việc theo ngày)
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

-- 5. Enable Row Level Security (RLS)
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_schedules ENABLE ROW LEVEL SECURITY;

-- 6. Public Access / Dev Policies (Can be restricted when Supabase Auth is enabled)
CREATE POLICY "Allow public read tasks" ON public.tasks FOR SELECT USING (true);
CREATE POLICY "Allow public insert tasks" ON public.tasks FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update tasks" ON public.tasks FOR UPDATE USING (true);
CREATE POLICY "Allow public delete tasks" ON public.tasks FOR DELETE USING (true);

CREATE POLICY "Allow public read contracts" ON public.contracts FOR SELECT USING (true);
CREATE POLICY "Allow public insert contracts" ON public.contracts FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update contracts" ON public.contracts FOR UPDATE USING (true);

CREATE POLICY "Allow public read work_projects" ON public.work_projects FOR SELECT USING (true);
CREATE POLICY "Allow public read project_schedules" ON public.project_schedules FOR SELECT USING (true);
CREATE POLICY "Allow public write project_schedules" ON public.project_schedules FOR ALL USING (true);

-- 7. Initial Seed Data
INSERT INTO public.work_projects (id, name, tagline, type, accent_color, logo_url)
VALUES 
    ('maersk', 'Maersk', 'Fullstack Developer — Global Logistics Tech', 'fulltime', '#2563EB', '/maersk-logo.png'),
    ('betonamu', 'Betonamu', 'Project Web Tiếng Nhật & Nhân Sự', 'project', '#DC2626', NULL),
    ('nam-khanh', 'Nam Khánh', 'Project Web Xuất Khẩu Chuối', 'project', '#16A34A', NULL)
ON CONFLICT (id) DO NOTHING;
