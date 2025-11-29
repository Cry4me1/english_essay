// 数据库表类型定义

export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
}

export interface Essay {
  id: string;
  user_id: string;
  title: string;
  content: string;
  word_count: number;
  ai_score: number | null;
  ai_feedback: AiFeedback | null;
  status: 'draft' | 'completed' | 'archived';
  created_at: string;
  updated_at: string;
}

export interface AiFeedback {
  score: number;
  summary: string;
  breakdown: {
    label: string;
    value: number;
  }[];
  annotations: Annotation[];
}

export interface Annotation {
  id: string;
  type: 'grammar' | 'vocabulary' | 'logic';
  originalText: string;
  suggestion: string;
  reason: string;
}

export interface VocabularyItem {
  id: string;
  user_id: string;
  word: string;
  phonetic: string | null;
  definition: string | null;
  context_sentence: string | null;
  part_of_speech: string[] | null;
  synonyms: string[] | null;
  created_at: string;
}

// API 请求/响应类型

export interface CreateEssayRequest {
  title: string;
  content?: string;
}

export interface UpdateEssayRequest {
  title?: string;
  content?: string;
  ai_score?: number;
  ai_feedback?: AiFeedback;
  status?: 'draft' | 'completed' | 'archived';
}

export interface EssayListParams {
  status?: 'draft' | 'completed' | 'archived';
  limit?: number;
  offset?: number;
}

export interface CreateVocabularyRequest {
  word: string;
  phonetic?: string;
  definition?: string;
  context_sentence?: string;
  part_of_speech?: string[];
  synonyms?: string[];
}

export interface VocabularyListParams {
  search?: string;
  limit?: number;
  offset?: number;
}

// API 响应包装类型
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
}

