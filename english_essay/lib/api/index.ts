// 统一导出所有 API 函数
export * from './essays';
export * from './vocabulary';

// 导出类型
export type {
  Essay,
  VocabularyItem,
  CreateEssayRequest,
  UpdateEssayRequest,
  CreateVocabularyRequest,
  ApiResponse,
  PaginatedResponse,
  AiFeedback,
  Annotation,
} from '@/lib/types/database';

