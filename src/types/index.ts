// 通用響應類型
export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

// 表格數據類型
export interface TableData {
  id: string;
  title: string;
  records: number;
  updatedAt: string;
} 