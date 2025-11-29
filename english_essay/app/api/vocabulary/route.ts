import { NextRequest } from 'next/server';
import { createSupabaseServerClient } from '@/utils/supabase/server';
import type { CreateVocabularyRequest, VocabularyItem, PaginatedResponse } from '@/lib/types/database';

// GET /api/vocabulary - 获取用户生词列表
export async function GET(req: NextRequest) {
  const supabase = await createSupabaseServerClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return Response.json({ error: '请先登录' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search');
  const limit = parseInt(searchParams.get('limit') || '50', 10);
  const offset = parseInt(searchParams.get('offset') || '0', 10);

  let query = supabase
    .from('vocabulary')
    .select('*', { count: 'exact' })
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  // 模糊搜索单词
  if (search && search.trim().length > 0) {
    query = query.ilike('word', `%${search.trim()}%`);
  }

  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    console.error('获取生词列表失败:', error);
    return Response.json({ error: '获取生词列表失败' }, { status: 500 });
  }

  const response: PaginatedResponse<VocabularyItem> = {
    data: data as VocabularyItem[],
    total: count || 0,
    limit,
    offset,
  };

  return Response.json(response);
}

// POST /api/vocabulary - 添加生词
export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServerClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return Response.json({ error: '请先登录' }, { status: 401 });
  }

  let body: CreateVocabularyRequest;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: '无效的请求体' }, { status: 400 });
  }

  const { word, phonetic, definition, context_sentence, part_of_speech, synonyms } = body;

  if (!word || word.trim().length === 0) {
    return Response.json({ error: '单词不能为空' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('vocabulary')
    .insert({
      user_id: user.id,
      word: word.trim().toLowerCase(),
      phonetic: phonetic || null,
      definition: definition || null,
      context_sentence: context_sentence || null,
      part_of_speech: part_of_speech || null,
      synonyms: synonyms || null,
    })
    .select()
    .single();

  if (error) {
    // 处理唯一约束冲突（重复收藏）
    if (error.code === '23505') {
      return Response.json({ error: '该单词已在生词本中' }, { status: 409 });
    }
    console.error('添加生词失败:', error);
    return Response.json({ error: '添加生词失败' }, { status: 500 });
  }

  return Response.json({ data, message: '生词添加成功' }, { status: 201 });
}

