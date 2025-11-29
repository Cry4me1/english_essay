import { createSupabaseServerClient } from '@/utils/supabase/server';

export async function POST(req: Request) {
  const { provider } = await req.json();

  // 仅支持 GitHub（国内可用），已移除 Google
  if (provider !== 'github') {
    return Response.json({ error: '不支持的登录方式' }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const origin = new URL(req.url).origin;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      redirectTo: `${origin}/api/auth/callback`,
    },
  });

  if (error) {
    console.error('OAuth 登录失败:', error);
    return Response.json({ error: error.message }, { status: 400 });
  }

  return Response.json({
    url: data.url,
  });
}

