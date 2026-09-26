import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey || url === 'YOUR_SUPABASE_URL' || anonKey === 'YOUR_SUPABASE_ANON_KEY') {
    return NextResponse.json({
      status: 'missing_env',
      message: 'Chưa cấu hình NEXT_PUBLIC_SUPABASE_URL hoặc NEXT_PUBLIC_SUPABASE_ANON_KEY trong file .env.local',
      hasUrl: Boolean(url && url !== 'YOUR_SUPABASE_URL'),
      hasAnonKey: Boolean(anonKey && anonKey !== 'YOUR_SUPABASE_ANON_KEY'),
    }, { status: 200 });
  }

  try {
    const supabase = await createClient();
    
    // Ping Supabase with a lightweight query
    const startTime = Date.now();
    const { data, error } = await supabase.from('work_projects').select('id, name').limit(1);
    const pingMs = Date.now() - startTime;

    if (error) {
      // If table does not exist yet but auth/connection succeeds
      if (error.code === '42P01' || error.message.includes('relation') || error.message.includes('does not exist')) {
        return NextResponse.json({
          status: 'connected_no_tables',
          message: 'Kết nối Supabase thành công! (Chưa chạy script tạo bảng schema.sql)',
          url: url.replace(/(https?:\/\/).*/, '$1***.supabase.co'),
          pingMs,
          error: error.message,
        });
      }

      return NextResponse.json({
        status: 'error',
        message: `Lỗi kết nối: ${error.message}`,
        code: error.code,
        pingMs,
      }, { status: 400 });
    }

    return NextResponse.json({
      status: 'connected',
      message: 'Kết nối Supabase hoàn toàn thành công & sẵn sàng!',
      url: url.replace(/(https?:\/\/).*/, '$1***.supabase.co'),
      pingMs,
      data,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({
      status: 'error',
      message: `Lỗi bất ngờ khi kết nối: ${message}`,
    }, { status: 500 });
  }
}
