import { createBrowserClient } from '@supabase/ssr';

const DEFAULT_SUPABASE_URL = 'https://hmahzbyfapbuhpxxblwi.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_8RlFnV17HawPVf0_oF8GNA_DAlkbW9K';

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

export const supabase = createClient();

