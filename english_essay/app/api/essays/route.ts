import { NextRequest } from 'next/server';
import { createSupabaseServerClient } from '@/utils/supabase/server';
import type { CreateEssayRequest, Essay, PaginatedResponse } from '@/lib/types/database';

// GET /api/essays - 获取用户文章列表
export async function GET(req: NextRequest) {
  const supabase = await createSupabaseServerClient();
  
  // 验证用户登录状态
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return Response.json({ error: '请先登录' }, { status: 401 });
  }

  // 解析查询参数
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status') as Essay['status'] | null;
  const limit = parseInt(searchParams.get('limit') || '20', 10);
  const offset = parseInt(searchParams.get('offset') || '0', 10);

  // 构建查询
  let query = supabase
    .from('essays')
    .select('*', { count: 'exact' })
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }

  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    console.error('获取文章列表失败:', error);
    return Response.json({ error: '获取文章列表失败' }, { status: 500 });
  }

  const response: PaginatedResponse<Essay> = {
    data: data as Essay[],
    total: count || 0,
    limit,
    offset,
  };

  return Response.json(response);
}

// POST /api/essays - 创建新文章
export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServerClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return Response.json({ error: '请先登录' }, { status: 401 });
  }

  let body: CreateEssayRequest;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: '无效的请求体' }, { status: 400 });
  }

  const { title, content = '' } = body;

  if (!title || title.trim().length === 0) {
    return Response.json({ error: '标题不能为空' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('essays')
    .insert({
      user_id: user.id,
      title: title.trim(),
      content,
      status: 'draft',
    })
    .select()
    .single();

  if (error) {
    console.error('创建文章失败:', error);
    return Response.json({ error: '创建文章失败' }, { status: 500 });
  }

  return Response.json({ data, message: '文章创建成功' }, { status: 201 });
}

