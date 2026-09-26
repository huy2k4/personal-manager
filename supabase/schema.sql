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
    ('maersk', 'a0000000-0000-0000-0000-000000000001', 'Maersk', '', 'fulltime', '#2563EB', '/maersk-logo.png'),
    ('betonamu', 'a0000000-0000-0000-0000-000000000001', 'Betonamu', '', 'project', '#DC2626', NULL),
    ('nam-khanh', 'a0000000-0000-0000-0000-000000000001', 'Nam Khánh', '', 'project', '#16A34A', NULL)
ON CONFLICT (id) DO UPDATE SET 
    user_id = EXCLUDED.user_id,
    name = EXCLUDED.name,
    tagline = EXCLUDED.tagline,
    accent_color = EXCLUDED.accent_color,
    logo_url = EXCLUDED.logo_url;

