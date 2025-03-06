# 部署指南

## 環境要求
- Node.js 18+
- PostgreSQL 14+
- Redis (可選，用於緩存)

## 環境變數配置
部署前需要配置以下環境變數：
1. 複製 `.env.example` 為 `.env.production`
2. 更新所有必要的環境變數

## 部署步驟

### 1. 安裝依賴
```bash
npm install --production
```

### 2. 建置專案
```bash
npm run build
```

### 3. 啟動服務
```bash
npm start
```

## 部署檢查清單
- [ ] 環境變數配置完成
- [ ] 資料庫遷移完成
- [ ] SSL 證書配置完成
- [ ] 防火牆設置完成
- [ ] 監控系統設置完成

## 故障排除
常見問題及解決方案將在此更新。 