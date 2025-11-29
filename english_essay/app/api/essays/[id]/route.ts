import { NextRequest } from 'next/server';
import { createSupabaseServerClient } from '@/utils/supabase/server';
import type { UpdateEssayRequest } from '@/lib/types/database';

interface RouteContext {
  params: Promise<{ id: string }>;
}

// GET /api/essays/[id] - 获取单篇文章
export async function GET(req: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const supabase = await createSupabaseServerClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return Response.json({ error: '请先登录' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('essays')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return Response.json({ error: '文章不存在' }, { status: 404 });
    }
    console.error('获取文章失败:', error);
    return Response.json({ error: '获取文章失败' }, { status: 500 });
  }

  return Response.json({ data });
}

// PUT /api/essays/[id] - 更新文章
export async function PUT(req: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const supabase = await createSupabaseServerClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return Response.json({ error: '请先登录' }, { status: 401 });
  }

  let body: UpdateEssayRequest;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: '无效的请求体' }, { status: 400 });
  }

  // 构建更新对象，只包含提供的字段
  const updateData: Record<string, unknown> = {};
  
  if (body.title !== undefined) {
    if (body.title.trim().length === 0) {
      return Response.json({ error: '标题不能为空' }, { status: 400 });
    }
    updateData.title = body.title.trim();
  }
  
  if (body.content !== undefined) {
    updateData.content = body.content;
  }
  
  if (body.ai_score !== undefined) {
    updateData.ai_score = body.ai_score;
  }
  
  if (body.ai_feedback !== undefined) {
    updateData.ai_feedback = body.ai_feedback;
  }
  
  if (body.status !== undefined) {
    if (!['draft', 'completed', 'archived'].includes(body.status)) {
      return Response.json({ error: '无效的状态值' }, { status: 400 });
    }
    updateData.status = body.status;
  }

  if (Object.keys(updateData).length === 0) {
    return Response.json({ error: '没有提供要更新的字段' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('essays')
    .update(updateData)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return Response.json({ error: '文章不存在' }, { status: 404 });
    }
    console.error('更新文章失败:', error);
    return Response.json({ error: '更新文章失败' }, { status: 500 });
  }

  return Response.json({ data, message: '文章更新成功' });
}

// DELETE /api/essays/[id] - 删除文章
export async function DELETE(req: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const supabase = await createSupabaseServerClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return Response.json({ error: '请先登录' }, { status: 401 });
  }

  const { error } = await supabase
    .from('essays')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    console.error('删除文章失败:', error);
    return Response.json({ error: '删除文章失败' }, { status: 500 });
  }

  return Response.json({ message: '文章删除成功' });
}

