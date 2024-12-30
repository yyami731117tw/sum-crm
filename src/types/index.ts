// 通用介面定義
export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
}

// 儀表板相關類型
export interface DashboardStats {
  totalMembers: number;
  investorMembers: number;
  genderStats: {
    male: number;
    female: number;
  };
  managerStats: {
    total: number;
  };
}

// 表格相關類型
export interface TableData {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  records: number;
}

// 權限相關類型
export interface Permission {
  id: string;
  name: string;
  description: string;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
} 