import { createBrowserClient } from '@supabase/ssr';

export const createClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zncqndfghqkafuaswphq.supabase.co';
  // Fallback JWT anon key to ensure SSR prerendering never crashes even if env variable is pending
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpuY3FuZGZnaHFrYWZ1YXN3cGhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDAwMDAwMDAsImV4cCI6MjA1MDAwMDAwMH0.mock-anon-key-placeholder';

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
};
