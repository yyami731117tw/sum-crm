# API 文檔

## 概述
此文檔描述了 MBC 管理系統的 API 端點。

## 認證
所有 API 請求都需要通過 JWT 認證。

## API 端點

### 用戶管理
- `GET /api/users` - 獲取用戶列表
- `POST /api/users` - 創建新用戶
- `PUT /api/users/:id` - 更新用戶資訊
- `DELETE /api/users/:id` - 刪除用戶

### 會員管理
- `GET /api/members` - 獲取會員列表
- `POST /api/members` - 創建新會員
- `PUT /api/members/:id` - 更新會員資訊
- `DELETE /api/members/:id` - 刪除會員

### 合約管理
- `GET /api/contracts` - 獲取合約列表
- `POST /api/contracts` - 創建新合約
- `PUT /api/contracts/:id` - 更新合約資訊
- `DELETE /api/contracts/:id` - 刪除合約

## 錯誤處理
API 使用標準的 HTTP 狀態碼表示請求的結果。 