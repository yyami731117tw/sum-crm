# 多元商會員管理系統 (CRM Dashboard)

## 版本信息
- 當前版本：v1.1.3
- 更新日期：2025-01-01
- Node.js 版本要求：18.x

## 最新更新內容
### v1.1.3
- 優化導航功能，實現即時頁面刷新
- 完善登出功能
- 添加請求速率限制
- 改進錯誤處理和日誌記錄
- 優化用戶體驗

### v1.1.2
- 實作 Google 註冊流程
- 添加電子郵件驗證功能
- 改進密碼強度檢查
- 優化表單驗證

## 主要功能
- 會員管理
- 合約管理
- 項目管理
- 用戶認證
  - 電子郵件/密碼登入
  - Google 帳號登入
  - 雙重驗證
- 權限控制
- 系統日誌

## 技術棧
- Next.js 14
- TypeScript
- Tailwind CSS
- JWT 認證
- Google OAuth 2.0

## 安裝與設置
1. 安裝依賴：
```bash
npm install
```

2. 設置環境變數：
```env
# 創建 .env.local 文件並添加以下配置
JWT_SECRET=your-jwt-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback
```

3. 運行開發服務器：
```bash
npm run dev
```

## 安全性功能
- JWT 基於的身份驗證
- 請求速率限制
- CSRF 保護
- 密碼強度檢查
- 會話管理
- 安全的 Cookie 設置

## API 速率限制
- 一般 API 請求：100次/分鐘
- 身份驗證相關請求：5次/分鐘

## 開發團隊
- 多元商科技團隊

## 授權
- 私有軟件，版權所有 © 2024 多元商 