import { createSupabaseServerClient } from '@/utils/supabase/server';

export async function POST(req: Request) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return Response.json({ error: '邮箱和密码不能为空' }, { status: 400 });
  }

  if (password.length < 6) {
    return Response.json({ error: '密码至少需要6个字符' }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${new URL(req.url).origin}/api/auth/callback`,
    },
  });

  if (error) {
    console.error('注册失败:', error);
    return Response.json({ error: error.message }, { status: 400 });
  }

  // 检查是否需要邮箱验证
  if (data.user && !data.session) {
    return Response.json({
      message: '注册成功，请查收邮箱验证链接',
      requiresEmailConfirmation: true,
    });
  }

  return Response.json({
    message: '注册成功',
    user: data.user,
  });
}

