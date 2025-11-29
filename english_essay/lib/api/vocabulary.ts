import type {
  VocabularyItem,
  CreateVocabularyRequest,
  ApiResponse,
  PaginatedResponse,
} from '@/lib/types/database';

const BASE_URL = '/api/vocabulary';

/**
 * 获取生词列表
 */
export async function getVocabulary(params?: {
  search?: string;
  limit?: number;
  offset?: number;
}): Promise<PaginatedResponse<VocabularyItem>> {
  const searchParams = new URLSearchParams();
  
  if (params?.search) searchParams.set('search', params.search);
  if (params?.limit) searchParams.set('limit', params.limit.toString());
  if (params?.offset) searchParams.set('offset', params.offset.toString());

  const url = searchParams.toString() ? `${BASE_URL}?${searchParams}` : BASE_URL;
  
  const res = await fetch(url);
  
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || '获取生词列表失败');
  }
  
  return res.json();
}

/**
 * 获取单个生词详情
 */
export async function getVocabularyItem(id: string): Promise<ApiResponse<VocabularyItem>> {
  const res = await fetch(`${BASE_URL}/${id}`);
  
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || '获取生词失败');
  }
  
  return res.json();
}

/**
 * 添加生词到生词本
 */
export async function addVocabulary(
  data: CreateVocabularyRequest
): Promise<ApiResponse<VocabularyItem>> {
  const res = await fetch(BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || '添加生词失败');
  }
  
  return res.json();
}

/**
 * 从生词本删除生词
 */
export async function removeVocabulary(id: string): Promise<ApiResponse<void>> {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: 'DELETE',
  });
  
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || '删除生词失败');
  }
  
  return res.json();
}

/**
 * 检查单词是否已在生词本中（本地缓存版本）
 * 注意：这个函数需要配合 React Query 或 SWR 使用来缓存数据
 */
export function isWordInVocabulary(
  vocabularyList: VocabularyItem[],
  word: string
): boolean {
  return vocabularyList.some(
    (item) => item.word.toLowerCase() === word.toLowerCase()
  );
}

