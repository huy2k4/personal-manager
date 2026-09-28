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
    ('nam-khanh', 'a0000000-0000-0000-0000-000000000001', 'Nam Khánh', '', 'project', '#16A34A', '/NamKhanh.png')
ON CONFLICT (id) DO UPDATE SET 
    user_id = EXCLUDED.user_id,
    name = EXCLUDED.name,
    tagline = EXCLUDED.tagline,
    accent_color = EXCLUDED.accent_color,
    logo_url = EXCLUDED.logo_url;

-- Seed Project Guides for Maersk
INSERT INTO public.project_guides (id, project_id, question, answer)
VALUES 
    ('b0000000-0000-0000-0000-000000000001', 'maersk', 'Tạo xe tải mới (Register New Truck)', E'• Mục đích: Quản lý xe tải đi vào hoặc đi ra khỏi kho.\n• Thao tác: Vào menu "Truck Management" chọn kho -> Nhập điều kiện -> Bấm "ADD TRUCK" -> Điền thông tin -> Bấm "Update".'),
    ('b0000000-0000-0000-0000-000000000002', 'maersk', 'Sửa / Xóa / Cho xe ra cổng (Edit/Delete/Gate out Truck)', E'• Mục đích: Điều chỉnh thông tin xe, xóa bản ghi sai, hoặc ghi nhận thời gian thực tế xe rời kho.\n• Thao tác: Tìm kiếm xe trên hệ thống -> Cuộn sang phải -> Nhấn "EDIT" để sửa, "DELETE" để xóa, hoặc "Get Current Time" để cho xe ra cổng.'),
    ('b0000000-0000-0000-0000-000000000003', 'maersk', 'Quản lý Buồng/Khoang (Manage Chamber)', E'• Mục đích: Thiết lập các khu vực/buồng đỗ xe phục vụ cho hệ thống xếp hàng (Queue System) của xe tải.\n• Thao tác: Nhấn nút "MANAGE CHAMBER" -> Nhấn "ADD CHAMBER" để thêm mới, "Edit" để sửa hoặc "Delete" để xóa.'),
    ('b0000000-0000-0000-0000-000000000004', 'maersk', 'Quản lý Tài xế (Manage Truck Operator)', E'• Mục đích: Thêm mới hoặc điều chỉnh thông tin của tài xế điều khiển phương tiện.\n• Thao tác: Nhấn "Manage Truck Operator" -> Nhấn "Add Truck Operator" để thêm mới hoặc "Edit" để sửa.'),
    ('b0000000-0000-0000-0000-000000000005', 'maersk', 'Tạo SO thủ công (Manual SO Creation)', E'• Mục đích: Tạo đơn nhận hàng (SO) mới trực tiếp trên hệ thống Webwise.\n• Thao tác: Vào "SO Creation" -> Nhập số SO -> Chọn kho -> Nhấn OK và Save -> Điền thông tin bắt buộc -> Nhấn "Add PO" điền chi tiết -> Save PO -> Save SO.'),
    ('b0000000-0000-0000-0000-000000000006', 'maersk', 'Sửa / Xóa SO hiện tại (Edit SO)', E'• Mục đích: Cập nhật hoặc xóa thông tin đơn SO bị sai trước khi bắt đầu nhận hàng.\n• Thao tác: Vào "Edit SO" -> Chọn kho, client, nhập số SO -> Nhấn "Edit" để sửa Header/Line hoặc "Delete" để xóa -> Nhấn "Save".'),
    ('b0000000-0000-0000-0000-000000000007', 'maersk', 'Tạo đăng ký nhận hàng (Create Receipt Registration - RR)', E'• Mục đích: Gom 1 hoặc nhiều SO vào chung 1 nhóm (theo cấp độ Xe tải/Container) trước khi nhận hàng.\n• Thao tác: Vào "Receipt Registration" -> Chọn kho -> Nhấn "Add SO/Multiple SO" -> Chọn SO -> Confirm -> Release Receipt ID -> Nhập Assigned Zone.'),
    ('b0000000-0000-0000-0000-000000000008', 'maersk', 'Gán xe tải vào RR (Binding Truck to RR)', E'• Mục đích: Chỉ định rõ hàng hóa của RR này được bốc dỡ từ xe tải nào.\n• Thao tác: Bấm "Select Existing Truck and Bind it" -> Tìm và tick chọn xe [V] -> Nhấn "Confirm".'),
    ('b0000000-0000-0000-0000-000000000009', 'maersk', 'In danh sách RR / Tem LP (Print RR / LP Label)', E'• Mục đích: In danh sách đối chiếu kiểm đếm (RR List) hoặc tem dán pallet (LP Label) định danh hàng hóa.\n• Thao tác: Click "Print Receipt Operation List" để in danh sách. Để in tem LP: Nhập số RR/SO/PO để hệ thống tự tính số lượng tem, tránh in tem trắng.'),
    ('b0000000-0000-0000-0000-000000000010', 'maersk', 'Tạo CLP (Container Loading Plan)', E'• Mục đích: Gom các đơn SO/HBL xếp vào cùng 1 container khi xuất hàng (Lưu ý: Chỉ đưa SO đã nhận đủ hoặc nhận một phần).\n• Thao tác: Tạo qua Macro (nhập Excel xuất XML), tạo qua lệnh GWI từ MODS, hoặc tạo thủ công trên Webwise tại "CLP Creation".'),
    ('b0000000-0000-0000-0000-000000000011', 'maersk', 'Sửa / Xóa CLP (Modify CLP)', E'• Mục đích: Điều chỉnh thông tin/số lượng kế hoạch xếp container khi CLP chưa được Release.\n• Thao tác: Vào "Edit CLP" -> Chọn kho, client, số CLP -> Nhấn "Edit" để sửa hoặc "Delete" để xóa.'),
    ('b0000000-0000-0000-0000-000000000012', 'maersk', 'Xác nhận CLP (Confirming CLP)', E'• Mục đích: Gán số Container và số Chì (Seal) thực tế vào CLP sau khi đã chốt danh sách hàng xuất.\n• Thao tác: Vào "CLP Confirm" -> Tìm kiếm -> Nhấn "Confirm" -> Nhấn vào link để gán thông tin Container# và Seal#.'),
    ('b0000000-0000-0000-0000-000000000013', 'maersk', 'Giải phóng CLP (Releasing CLP)', E'• Mục đích: Hệ thống giữ (reserve) tồn kho cho CLP để chuẩn bị đi lấy hàng.\n• Thao tác: Vào "Release CLP" -> Chọn kho -> Tìm kiếm -> Nhấn "Release" (Nếu lỗi thường do thiếu tồn kho hoặc chưa cất hàng/putaway).'),
    ('b0000000-0000-0000-0000-000000000014', 'maersk', 'In danh sách lấy hàng (Print Pick List)', E'• Mục đích: Xuất danh sách cho xe nâng hoặc nhân viên kho đi nhặt hàng thực tế.\n• Thao tác: Vào "Print Pick List" -> Chọn kho -> Nhập số CLP/Container -> Chọn in Normal Pick List, Forklift Pick List hoặc CID Pick list.'),
    ('b0000000-0000-0000-0000-000000000015', 'maersk', 'Tự động lấy hàng (Auto Picking)', E'• Mục đích: Hệ thống tự động ghi nhận hoàn tất picking trên Webwise mà không cần súng quét RF.\n• Thao tác: Vào "Auto Picking" -> Chọn điều kiện tìm kiếm -> Nhấn icon để hệ thống tự động ghi nhận picking.'),
    ('b0000000-0000-0000-0000-000000000016', 'maersk', 'Cắt Seal (Unsealing)', E'• Mục đích: Tháo seal khi cần sửa đổi xếp hàng, dỡ hàng hoặc hủy lấy hàng của container đã khóa seal.\n• Thao tác: Vào "Cancel Seal" -> Nhập số CLP/Container -> Nhấn icon để tháo seal.'),
    ('b0000000-0000-0000-0000-000000000017', 'maersk', 'Dỡ hàng (Unloading)', E'• Mục đích: Bốc dỡ hàng đã xếp xuống (dỡ toàn bộ CLP/SO hoặc một phần PO) trả về khu vực tập kết xuất hàng.\n• Thao tác: Vào "Create Unload Task" -> Nhập số Container -> Chọn dỡ theo CLP/SO -> Chọn Outbound staging location -> Confirm.'),
    ('b0000000-0000-0000-0000-000000000018', 'maersk', 'Hủy lấy hàng (Unpicking)', E'• Mục đích: Hủy thao tác picking và trả hàng về lại vị trí tồn kho ban đầu.\n• Thao tác: Trên Webwise: Vào "Auto Unpick" -> Chọn kho -> Chọn CLP/SO/PO/SKU -> Chọn Inventory location -> Nhấn "Unpick".'),
    ('b0000000-0000-0000-0000-000000000019', 'maersk', 'Truy vấn trạng thái SO (SO Inquiry)', E'• Mục đích: Kiểm tra tiến độ nhận hàng của SO theo mã màu, xem chi tiết SO/Pallet hoặc cập nhật Hải quan.\n• Thao tác: Vào "SO Inquiry" -> Chọn kho -> Nhập điều kiện -> Bấm các icon chi tiết hoặc nhập thông tin Customs -> Save.'),
    ('b0000000-0000-0000-0000-000000000020', 'maersk', 'Mở khóa truy vấn RR (Receiving Status Inquiry)', E'• Mục đích: Mở khóa (unlock) một RR đã bị đóng để tiếp tục điều chỉnh nhận hàng bằng súng quét RF.\n• Thao tác: Vào "Receiving Status Inquiry" -> Chọn kho -> Tìm kiếm -> Nhấn biểu tượng Mở khóa để tiếp tục nhận hàng trên RF.'),
    ('b0000000-0000-0000-0000-000000000021', 'maersk', 'Truy vấn mã thùng (Carton ID Inquiry / Edit)', E'• Mục đích: Dành cho khách yêu cầu quét barcode thùng (vd: Nike) để kiểm tra, sửa, xóa hoặc resend file scan cho LNS.\n• Thao tác: Vào "Carton ID Inquiry/Edit" -> Tìm kiếm -> Sửa, xóa hoặc nhấn icon để resend file scan cho LNS.'),
    ('b0000000-0000-0000-0000-000000000022', 'maersk', 'Sửa tồn kho nhận hàng (Receiving Stock Adjustment)', E'• Mục đích: Điều chỉnh số lượng, CBM, kích thước sau khi nhận — tự động đồng bộ lịch sử và tồn kho.\n• Thao tác: Vào "Receiving Stock Adjustment" -> Tìm kiếm -> Click xem pallet -> Nhấn Edit -> Sửa thông tin -> Nhấn Update.'),
    ('b0000000-0000-0000-0000-000000000023', 'maersk', 'Sửa bắt buộc RR (Force Edit RR)', E'• Mục đích: Cập nhật lại thông tin RR khi quy trình nhận hàng đã diễn ra nhưng phát hiện sai sót.\n• Thao tác: Vào "Force Edit Receipt Registration" -> Tìm kiếm -> Click xem chi tiết -> Sửa/xóa SO line -> Lưu lại RR.'),
    ('b0000000-0000-0000-0000-000000000024', 'maersk', 'Sửa bắt buộc SO (Force Edit SO)', E'• Mục đích: Thay đổi thông tin đơn hàng ban đầu (Booked SO) khi đã bắt đầu nhận hàng.\n• Thao tác: Vào "Force Edit SO" -> Chọn kho -> Nhập số SO -> Nhấn icon để sửa Header, Line hoặc xóa Line -> Lưu lại.'),
    ('b0000000-0000-0000-0000-000000000025', 'maersk', 'Sửa bắt buộc CLP (Force Edit CLP)', E'• Mục đích: Ép sửa Header/Line của CLP khi đã release hoặc đang trong quá trình xử lý.\n• Thao tác: Vào "Force Edit CLP" -> Chọn kho -> Edit header hoặc SO detail (không xóa SO đang xử lý) -> Re-release.'),
    ('b0000000-0000-0000-0000-000000000026', 'maersk', 'Tái sử dụng CLP (Reuse CLP)', E'• Mục đích: Đóng thêm các SO/PO mới vào chung CLP đã release hoặc đang xử lý.\n• Thao tác: Vào "Reuse CLP" -> Chọn kho -> Edit CLP -> Nhấn thêm SO mới -> Nhập và chọn SO -> Bấm Save và Release.'),
    ('b0000000-0000-0000-0000-000000000027', 'maersk', 'Sửa xác nhận CLP (Force Edit CLP Confirm)', E'• Mục đích: Điều chỉnh lại số Container hoặc số Seal khi phát hiện bị sai sau khi đã khóa chì hoàn tất.\n• Thao tác: Vào "Force Edit CLP Confirm" -> Chọn kho -> Tìm kiếm -> Bấm reassign container -> Nhập số mới -> Confirm.'),
    ('b0000000-0000-0000-0000-000000000028', 'maersk', 'Xuất báo cáo (Report/Data Extract)', E'• Mục đích: Truy xuất dữ liệu tổng hợp chi tiết nhất về hoạt động nhập kho (Inbound) hoặc xuất kho (Outbound).\n• Thao tác: Vào "Inbound Data Extract" (nhập) hoặc "Outbound Data Extract" (xuất) -> Chọn kho -> Nhập điều kiện -> Nhấn Print.')
ON CONFLICT (id) DO UPDATE SET
    question = EXCLUDED.question,
    answer = EXCLUDED.answer;


