// 通用響應類型
export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

// 分頁響應類型
export interface PaginatedResponse<T> extends ApiResponse<T> {
  pagination: {
    total: number;
    current: number;
    pageSize: number;
  };
} 