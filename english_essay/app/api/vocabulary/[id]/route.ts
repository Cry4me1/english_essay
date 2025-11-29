import { NextRequest } from 'next/server';
import { createSupabaseServerClient } from '@/utils/supabase/server';

interface RouteContext {
  params: Promise<{ id: string }>;
}

// GET /api/vocabulary/[id] - 获取单个生词详情
export async function GET(req: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const supabase = await createSupabaseServerClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return Response.json({ error: '请先登录' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('vocabulary')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return Response.json({ error: '生词不存在' }, { status: 404 });
    }
    console.error('获取生词失败:', error);
    return Response.json({ error: '获取生词失败' }, { status: 500 });
  }

  return Response.json({ data });
}

// DELETE /api/vocabulary/[id] - 删除生词
export async function DELETE(req: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const supabase = await createSupabaseServerClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return Response.json({ error: '请先登录' }, { status: 401 });
  }

  const { error } = await supabase
    .from('vocabulary')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    console.error('删除生词失败:', error);
    return Response.json({ error: '删除生词失败' }, { status: 500 });
  }

  return Response.json({ message: '生词删除成功' });
}

