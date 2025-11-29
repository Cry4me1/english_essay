import { createSupabaseServerClient } from '@/utils/supabase/server';

export async function POST(req: Request) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return Response.json({ error: '邮箱和密码不能为空' }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error('登录失败:', error);
    
    if (error.message.includes('Invalid login credentials')) {
      return Response.json({ error: '邮箱或密码错误' }, { status: 401 });
    }
    if (error.message.includes('Email not confirmed')) {
      return Response.json({ error: '请先验证邮箱' }, { status: 401 });
    }
    
    return Response.json({ error: error.message }, { status: 400 });
  }

  return Response.json({
    message: '登录成功',
    user: data.user,
  });
}

