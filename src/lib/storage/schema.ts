// 定義用戶角色
export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER'
}

// 定義用戶狀態
export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'suspended'
}

// 定義會員類型
export enum MemberType {
  NORMAL = 'normal',    // 一般會員
  VIP = 'vip',         // VIP會員
  ANGEL = 'angel',     // 天使會員
  SHAREHOLDER = 'shareholder', // 股東
  PARTNER = 'partner', // 合作
  BLACKLIST = 'blacklist' // 黑名單
}

// 定義合約狀態
export enum ContractStatus {
  DRAFT = 'draft',     // 草稿
  ACTIVE = 'active',   // 生效中
  EXPIRED = 'expired', // 已到期
  TERMINATED = 'terminated' // 已終止
}

// 定義資料庫結構
export interface DBSchema {
  users: {
    key: string; // userId
    value: {
      id: string;
      email: string;
      password: string; // 加密後的密碼
      name: string;
      role: UserRole;
      status: UserStatus;
      createdAt: Date;
      updatedAt: Date;
    };
  };
  members: {
    key: string; // memberId
    value: {
      id: string;
      name: string;
      phone: string;
      idNumber: string; // 身分證字號
      type: MemberType;
      status: UserStatus;
      expiryDate?: Date;
      notes?: string;
      createdAt: Date;
      updatedAt: Date;
      createdBy: string; // userId
      updatedBy: string; // userId
    };
  };
  contracts: {
    key: string; // contractId
    value: {
      id: string;
      memberId: string;
      title: string;
      content: string;
      status: ContractStatus;
      startDate: Date;
      endDate?: Date;
      amount: number;
      paymentMethod?: string;
      bankAccount?: string;
      attachments?: Array<{
        name: string;
        data: string; // Base64 encoded
      }>;
      createdAt: Date;
      updatedAt: Date;
      createdBy: string; // userId
      updatedBy: string; // userId
    };
  };
  relations: {
    key: string; // relationId
    value: {
      id: string;
      memberId: string;
      relatedMemberId: string;
      relationType: string;
      notes?: string;
      createdAt: Date;
      updatedAt: Date;
      createdBy: string; // userId
    };
  };
  changelog: {
    key: string; // changeId
    value: {
      id: string;
      entityType: 'member' | 'contract' | 'relation';
      entityId: string;
      action: 'create' | 'update' | 'delete';
      changes: {
        field: string;
        oldValue?: any;
        newValue?: any;
      }[];
      createdAt: Date;
      createdBy: string; // userId
    };
  };
  settings: {
    key: string; // settingId
    value: {
      id: string;
      key: string;
      value: any;
      updatedAt: Date;
      updatedBy: string; // userId
    };
  };
} 