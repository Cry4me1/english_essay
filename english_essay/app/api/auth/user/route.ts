import { createSupabaseServerClient } from '@/utils/supabase/server';

export async function GET() {
  const supabase = await createSupabaseServerClient();

  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return Response.json({ user: null });
  }

  // 获取用户 profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return Response.json({
    user: {
      id: user.id,
      email: user.email,
      fullName: profile?.full_name || user.user_metadata?.full_name || null,
      avatarUrl: profile?.avatar_url || user.user_metadata?.avatar_url || null,
    },
  });
}

