import { createSupabaseServerClient } from '@/utils/supabase/server';

export async function POST() {
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error('登出失败:', error);
    return Response.json({ error: error.message }, { status: 400 });
  }

  return Response.json({ message: '登出成功' });
}

