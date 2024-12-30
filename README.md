# B2B 多維表格 CRM 平台

## 最新更新
- ✨ 添加記錄狀態管理
- 🎨 改進表格列配置
- ♿️ 提升可訪問性
- 🔧 優化組件交互

## 部署
本項目已部署在 Vercel 平台上。

### Vercel 部署步驟
1. 在 [Vercel](https://vercel.com) 註冊帳號並登入
2. 點擊 "New Project" 按鈕
3. 從 GitHub 導入您的專案倉庫
4. 配置部署設置：
   - Framework Preset: Next.js
   - Build Command: `next build` (確保使用 Next.js 的建置指令)
   - Output Directory: `.next` (Next.js 的預設輸出目錄)
5. 配置環境變數（如果需要）:
   - 在 Vercel 專案設置中找到 "Environment Variables"
   - 添加所需的環境變數
6. 點擊 "Deploy" 開始部署

### 自動部署
- 推送到 `main` 分支會自動觸發生產環境部署
- 推送到其他分支會創建預覽環境

## 分支管理
- `main`: 穩定版本
- `develop`: 開發版本
- `feature/*`: 功能開發分支

## Git 提交規範
使用以下前綴來標識提交類型：
- ✨ feat: 新功能
- 🐛 fix: 錯誤修復
- 💄 style: 樣式更新
- ♻️ refactor: 代碼重構
- 📝 docs: 文檔更新
- 🔧 chore: 構建過程或輔助工具的變動

## 開發流程
1. 從 `develop` 分支創建功能分支
2. 在功能分支上開發並提交
3. 完成後提交 Pull Request
4. 代碼審查通過後合併到 `develop`
5. 定期從 `develop` 合併到 `main`

## 發布流程
1. 在 `develop` 分支完成功能開發
2. 創建 release 分支進行測試
3. 測試通過後合併到 `main`
4. 在 `main` 分支打標籤發布 