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
    guides: [
      {
        id: 'g-maersk-1',
        question: 'Tạo xe tải mới (Register New Truck)',
        answer: '• Mục đích: Quản lý xe tải đi vào hoặc đi ra khỏi kho.\n• Thao tác: Vào menu "Truck Management" chọn kho → Nhập điều kiện → Bấm "ADD TRUCK" → Điền thông tin → Bấm "Update".',
      },
      {
        id: 'g-maersk-2',
        question: 'Sửa / Xóa / Cho xe ra cổng (Edit/Delete/Gate out Truck)',
        answer: '• Mục đích: Điều chỉnh thông tin xe, xóa bản ghi sai, hoặc ghi nhận thời gian thực tế xe rời kho.\n• Thao tác: Tìm kiếm xe trên hệ thống → Cuộn sang phải → Nhấn "EDIT" để sửa, "DELETE" để xóa, hoặc "Get Current Time" để cho xe ra cổng.',
      },
      {
        id: 'g-maersk-3',
        question: 'Quản lý Buồng/Khoang (Manage Chamber)',
        answer: '• Mục đích: Thiết lập các khu vực/buồng đỗ xe phục vụ cho hệ thống xếp hàng (Queue System) của xe tải.\n• Thao tác: Nhấn nút "MANAGE CHAMBER" → Nhấn "ADD CHAMBER" để thêm mới, "Edit" để sửa hoặc "Delete" để xóa.',
      },
      {
        id: 'g-maersk-4',
        question: 'Quản lý Tài xế (Manage Truck Operator)',
        answer: '• Mục đích: Thêm mới hoặc điều chỉnh thông tin của tài xế điều khiển phương tiện.\n• Thao tác: Nhấn "Manage Truck Operator" → Nhấn "Add Truck Operator" để thêm mới hoặc "Edit" để sửa.',
      },
      {
        id: 'g-maersk-5',
        question: 'Tạo SO thủ công (Manual SO Creation)',
        answer: '• Mục đích: Tạo đơn nhận hàng (SO) mới trực tiếp trên hệ thống Webwise.\n• Thao tác: Vào "SO Creation" → Nhập số SO → Chọn kho → Nhấn OK và Save → Điền thông tin bắt buộc → Nhấn "Add PO" điền chi tiết → Save PO → Save SO.',
      },
      {
        id: 'g-maersk-6',
        question: 'Sửa / Xóa SO hiện tại (Edit SO)',
        answer: '• Mục đích: Cập nhật hoặc xóa thông tin đơn SO bị sai trước khi bắt đầu nhận hàng.\n• Thao tác: Vào "Edit SO" → Chọn kho, client, nhập số SO → Nhấn "Edit" để sửa Header/Line hoặc "Delete" để xóa → Nhấn "Save".',
      },
      {
        id: 'g-maersk-7',
        question: 'Tạo đăng ký nhận hàng (Create Receipt Registration - RR)',
        answer: '• Mục đích: Gom 1 hoặc nhiều SO vào chung 1 nhóm (theo cấp độ Xe tải/Container) trước khi nhận hàng.\n• Thao tác: Vào "Receipt Registration" → Chọn kho → Nhấn "Add SO/Multiple SO" → Chọn SO → Confirm → Release Receipt ID → Nhập Assigned Zone.',
      },
      {
        id: 'g-maersk-8',
        question: 'Gán xe tải vào RR (Binding Truck to RR)',
        answer: '• Mục đích: Chỉ định rõ hàng hóa của RR này được bốc dỡ từ xe tải nào.\n• Thao tác: Bấm "Select Existing Truck and Bind it" → Tìm và tick chọn xe [V] → Nhấn "Confirm".',
      },
      {
        id: 'g-maersk-9',
        question: 'In danh sách RR / Tem LP (Print RR / LP Label)',
        answer: '• Mục đích: In danh sách đối chiếu kiểm đếm (RR List) hoặc tem dán pallet (LP Label) định danh hàng hóa.\n• Thao tác: Click "Print Receipt Operation List" để in danh sách. Để in tem LP: Nhập số RR/SO/PO để hệ thống tự tính số lượng tem, tránh in tem trắng.',
      },
      {
        id: 'g-maersk-10',
        question: 'Tạo CLP (Container Loading Plan)',
        answer: '• Mục đích: Gom các đơn SO/HBL xếp vào cùng 1 container khi xuất hàng (Lưu ý: Chỉ đưa SO đã nhận đủ hoặc nhận một phần).\n• Thao tác: Tạo qua Macro (nhập Excel xuất XML), tạo qua lệnh GWI từ MODS, hoặc tạo thủ công trên Webwise tại "CLP Creation".',
      },
      {
        id: 'g-maersk-11',
        question: 'Sửa / Xóa CLP (Modify CLP)',
        answer: '• Mục đích: Điều chỉnh thông tin/số lượng kế hoạch xếp container khi CLP chưa được Release.\n• Thao tác: Vào "Edit CLP" → Chọn kho, client, số CLP → Nhấn "Edit" để sửa hoặc "Delete" để xóa.',
      },
      {
        id: 'g-maersk-12',
        question: 'Xác nhận CLP (Confirming CLP)',
        answer: '• Mục đích: Gán số Container và số Chì (Seal) thực tế vào CLP sau khi đã chốt danh sách hàng xuất.\n• Thao tác: Vào "CLP Confirm" → Tìm kiếm → Nhấn "Confirm" → Nhấn vào link để gán thông tin Container# và Seal#.',
      },
      {
        id: 'g-maersk-13',
        question: 'Giải phóng CLP (Releasing CLP)',
        answer: '• Mục đích: Hệ thống giữ (reserve) tồn kho cho CLP để chuẩn bị đi lấy hàng.\n• Thao tác: Vào "Release CLP" → Chọn kho → Tìm kiếm → Nhấn "Release" (Nếu lỗi thường do thiếu tồn kho hoặc chưa cất hàng/putaway).',
      },
      {
        id: 'g-maersk-14',
        question: 'In danh sách lấy hàng (Print Pick List)',
        answer: '• Mục đích: Xuất danh sách cho xe nâng hoặc nhân viên kho đi nhặt hàng thực tế.\n• Thao tác: Vào "Print Pick List" → Chọn kho → Nhập số CLP/Container → Chọn in Normal Pick List, Forklift Pick List hoặc CID Pick list.',
      },
      {
        id: 'g-maersk-15',
        question: 'Tự động lấy hàng (Auto Picking)',
        answer: '• Mục đích: Hệ thống tự động ghi nhận hoàn tất picking trên Webwise mà không cần súng quét RF.\n• Thao tác: Vào "Auto Picking" → Chọn điều kiện tìm kiếm → Nhấn icon để hệ thống tự động ghi nhận picking.',
      },
      {
        id: 'g-maersk-16',
        question: 'Cắt Seal (Unsealing)',
        answer: '• Mục đích: Tháo seal khi cần sửa đổi xếp hàng, dỡ hàng hoặc hủy lấy hàng của container đã khóa seal.\n• Thao tác: Vào "Cancel Seal" → Nhập số CLP/Container → Nhấn icon để tháo seal.',
      },
      {
        id: 'g-maersk-17',
        question: 'Dỡ hàng (Unloading)',
        answer: '• Mục đích: Bốc dỡ hàng đã xếp xuống (dỡ toàn bộ CLP/SO hoặc một phần PO) trả về khu vực tập kết xuất hàng.\n• Thao tác: Vào "Create Unload Task" → Nhập số Container → Chọn dỡ theo CLP/SO → Chọn Outbound staging location → Confirm.',
      },
      {
        id: 'g-maersk-18',
        question: 'Hủy lấy hàng (Unpicking)',
        answer: '• Mục đích: Hủy thao tác picking và trả hàng về lại vị trí tồn kho ban đầu.\n• Thao tác: Trên Webwise: Vào "Auto Unpick" → Chọn kho → Chọn CLP/SO/PO/SKU → Chọn Inventory location → Nhấn "Unpick".',
      },
      {
        id: 'g-maersk-19',
        question: 'Truy vấn trạng thái SO (SO Inquiry)',
        answer: '• Mục đích: Kiểm tra tiến độ nhận hàng của SO theo mã màu, xem chi tiết SO/Pallet hoặc cập nhật Hải quan.\n• Thao tác: Vào "SO Inquiry" → Chọn kho → Nhập điều kiện → Bấm các icon chi tiết hoặc nhập thông tin Customs → Save.',
      },
      {
        id: 'g-maersk-20',
        question: 'Mở khóa truy vấn RR (Receiving Status Inquiry)',
        answer: '• Mục đích: Mở khóa (unlock) một RR đã bị đóng để tiếp tục điều chỉnh nhận hàng bằng súng quét RF.\n• Thao tác: Vào "Receiving Status Inquiry" → Chọn kho → Tìm kiếm → Nhấn biểu tượng Mở khóa để tiếp tục nhận hàng trên RF.',
      },
      {
        id: 'g-maersk-21',
        question: 'Truy vấn mã thùng (Carton ID Inquiry / Edit)',
        answer: '• Mục đích: Dành cho khách yêu cầu quét barcode thùng (vd: Nike) để kiểm tra, sửa, xóa hoặc resend file scan cho LNS.\n• Thao tác: Vào "Carton ID Inquiry/Edit" → Tìm kiếm → Sửa, xóa hoặc nhấn icon để resend file scan cho LNS.',
      },
      {
        id: 'g-maersk-22',
        question: 'Sửa tồn kho nhận hàng (Receiving Stock Adjustment)',
        answer: '• Mục đích: Điều chỉnh số lượng, CBM, kích thước sau khi nhận — tự động đồng bộ lịch sử và tồn kho.\n• Thao tác: Vào "Receiving Stock Adjustment" → Tìm kiếm → Click xem pallet → Nhấn Edit → Sửa thông tin → Nhấn Update.',
      },
      {
        id: 'g-maersk-23',
        question: 'Sửa bắt buộc RR (Force Edit RR)',
        answer: '• Mục đích: Cập nhật lại thông tin RR khi quy trình nhận hàng đã diễn ra nhưng phát hiện sai sót.\n• Thao tác: Vào "Force Edit Receipt Registration" → Tìm kiếm → Click xem chi tiết → Sửa/xóa SO line → Lưu lại RR.',
      },
      {
        id: 'g-maersk-24',
        question: 'Sửa bắt buộc SO (Force Edit SO)',
        answer: '• Mục đích: Thay đổi thông tin đơn hàng ban đầu (Booked SO) khi đã bắt đầu nhận hàng.\n• Thao tác: Vào "Force Edit SO" → Chọn kho → Nhập số SO → Nhấn icon để sửa Header, Line hoặc xóa Line → Lưu lại.',
      },
      {
        id: 'g-maersk-25',
        question: 'Sửa bắt buộc CLP (Force Edit CLP)',
        answer: '• Mục đích: Ép sửa Header/Line của CLP khi đã release hoặc đang trong quá trình xử lý.\n• Thao tác: Vào "Force Edit CLP" → Chọn kho → Edit header hoặc SO detail (không xóa SO đang xử lý) → Re-release.',
      },
      {
        id: 'g-maersk-26',
        question: 'Tái sử dụng CLP (Reuse CLP)',
        answer: '• Mục đích: Đóng thêm các SO/PO mới vào chung CLP đã release hoặc đang xử lý.\n• Thao tác: Vào "Reuse CLP" → Chọn kho → Edit CLP → Nhấn thêm SO mới → Nhập và chọn SO → Bấm Save và Release.',
      },
      {
        id: 'g-maersk-27',
        question: 'Sửa xác nhận CLP (Force Edit CLP Confirm)',
        answer: '• Mục đích: Điều chỉnh lại số Container hoặc số Seal khi phát hiện bị sai sau khi đã khóa chì hoàn tất.\n• Thao tác: Vào "Force Edit CLP Confirm" → Chọn kho → Tìm kiếm → Bấm reassign container → Nhập số mới → Confirm.',
      },
      {
        id: 'g-maersk-28',
        question: 'Xuất báo cáo (Report/Data Extract)',
        answer: '• Mục đích: Truy xuất dữ liệu tổng hợp chi tiết nhất về hoạt động nhập kho (Inbound) hoặc xuất kho (Outbound).\n• Thao tác: Vào "Inbound Data Extract" (nhập) hoặc "Outbound Data Extract" (xuất) → Chọn kho → Nhập điều kiện → Nhấn Print.',
      },
    ],
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
    name: 'NAMKHANH',
    logoUrl: '/NamKhanh.png',
    tagline: '',
    type: 'project',
    accentColor: '#16A34A',
    schedules: [],
    guides: [],
    glossary: [],
  },
];

