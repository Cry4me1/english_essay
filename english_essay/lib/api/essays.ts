import type {
  Essay,
  CreateEssayRequest,
  UpdateEssayRequest,
  ApiResponse,
  PaginatedResponse,
} from '@/lib/types/database';

const BASE_URL = '/api/essays';

/**
 * 获取文章列表
 */
export async function getEssays(params?: {
  status?: Essay['status'];
  limit?: number;
  offset?: number;
}): Promise<PaginatedResponse<Essay>> {
  const searchParams = new URLSearchParams();
  
  if (params?.status) searchParams.set('status', params.status);
  if (params?.limit) searchParams.set('limit', params.limit.toString());
  if (params?.offset) searchParams.set('offset', params.offset.toString());

  const url = searchParams.toString() ? `${BASE_URL}?${searchParams}` : BASE_URL;
  
  const res = await fetch(url);
  
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || '获取文章列表失败');
  }
  
  return res.json();
}

/**
 * 获取单篇文章
 */
export async function getEssay(id: string): Promise<ApiResponse<Essay>> {
  const res = await fetch(`${BASE_URL}/${id}`);
  
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || '获取文章失败');
  }
  
  return res.json();
}

/**
 * 创建新文章
 */
export async function createEssay(
  data: CreateEssayRequest
): Promise<ApiResponse<Essay>> {
  const res = await fetch(BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || '创建文章失败');
  }
  
  return res.json();
}

/**
 * 更新文章
 */
export async function updateEssay(
  id: string,
  data: UpdateEssayRequest
): Promise<ApiResponse<Essay>> {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || '更新文章失败');
  }
  
  return res.json();
}

/**
 * 删除文章
 */
export async function deleteEssay(id: string): Promise<ApiResponse<void>> {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: 'DELETE',
  });
  
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || '删除文章失败');
  }
  
  return res.json();
}

/**
 * 保存文章（自动判断创建或更新）
 */
export async function saveEssay(
  data: CreateEssayRequest & { id?: string }
): Promise<ApiResponse<Essay>> {
  if (data.id) {
    return updateEssay(data.id, data);
  }
  return createEssay(data);
}

