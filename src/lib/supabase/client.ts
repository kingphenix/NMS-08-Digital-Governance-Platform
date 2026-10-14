import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const rawUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.VITE_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    '';

  const supabaseUrl =
    rawUrl && !rawUrl.includes('your-project-ref') && !rawUrl.includes('placeholder')
      ? rawUrl.trim()
      : 'https://placeholder-nms08-project.supabase.co';

  const rawKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY ||
    '';

  const supabaseAnonKey =
    rawKey && !rawKey.includes('your-anon-key') && !rawKey.includes('placeholder')
      ? rawKey.trim()
      : 'placeholder-anon-key-nms08-alumni';

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
