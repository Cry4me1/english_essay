import { createSupabaseServerClient } from '@/utils/supabase/server';

export async function POST(req: Request) {
  const { email } = await req.json();

  if (!email) {
    return Response.json({ error: '邮箱不能为空' }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${new URL(req.url).origin}/api/auth/callback`,
    },
  });

  if (error) {
    console.error('发送 Magic Link 失败:', error);
    return Response.json({ error: error.message }, { status: 400 });
  }

  return Response.json({
    message: '登录链接已发送到您的邮箱',
  });
}

