// 定義權限級別
export type PermissionLevel = 'read' | 'write' | 'admin';

// 定義資源類型
export type ResourceType = 'table' | 'dashboard' | 'user' | 'system';

// 定義權限項
export interface Permission {
  resource: ResourceType;
  level: PermissionLevel;
}

// 定義角色
export interface Role {
  id: string;
  name: string;
  permissions: Permission[];
  createdAt: Date;
  updatedAt: Date;
}

// 定義用戶
export interface User {
  id: string;
  username: string;
  email: string;
  roles: Role[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Google 用戶資料類型
export interface GoogleUser {
  email: string;
  name: string;
  picture: string;
  sub: string; // Google's unique identifier
}

// 登入響應類型
export interface AuthResponse {
  user: User;
  token: string;
}

// 登入狀態類型
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface UserSession {
  id: string
  email: string
  name: string
  role: string
  expiresAt: Date
}

export interface AuthResponse {
  success: boolean
  message?: string
  session?: UserSession
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData extends LoginCredentials {
  name: string
  confirmPassword: string
} 