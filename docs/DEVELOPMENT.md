# 開發指南

## 開發環境設置
1. 安裝依賴：
```bash
npm install
```

2. 設置環境變數：
- 複製 `.env.example` 為 `.env.local`
- 更新必要的環境變數

3. 啟動開發服務器：
```bash
npm run dev
```

## 專案結構
```
src/
├── app/          # Next.js 13+ App Router
├── components/   # React 組件
├── lib/          # 共用函式庫
├── pages/        # Next.js Pages
├── styles/       # 全局樣式
└── types/        # TypeScript 類型定義
```

## 開發規範

### 程式碼風格
- 使用 TypeScript
- 遵循 ESLint 規則
- 使用 Prettier 格式化程式碼

### Git 工作流程
1. 從 `main` 分支創建新的功能分支
2. 提交變更時使用規範化的提交訊息
3. 提交 Pull Request 前執行測試

### 測試
```bash
# 執行單元測試
npm run test

# 執行 E2E 測試
npm run test:e2e
```

## 除錯工具
- Chrome DevTools
- React Developer Tools
- Next.js Debug Mode 