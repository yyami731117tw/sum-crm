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

// 表格數據類型
export interface TableData {
  id: string;
  title: string;
  records: number;
  updatedAt: string;
}

// 用戶類型
export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
} 