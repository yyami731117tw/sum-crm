# 分支管理策略

## 主要分支
- `main`: 主分支，穩定版本
- `develop`: 開發分支，最新開發版本

## 功能分支
- `feature/*`: 新功能開發
- `bugfix/*`: 錯誤修復
- `hotfix/*`: 緊急修復
- `release/*`: 版本發布準備

## 分支命名規範
- 功能分支: `feature/功能名稱`
- 錯誤修復: `bugfix/錯誤描述`
- 緊急修復: `hotfix/問題描述`
- 發布分支: `release/版本號`

## 工作流程
1. 從 `develop` 分支創建功能分支
2. 在功能分支上開發
3. 完成後提交 Pull Request 到 `develop`
4. 經過代碼審查後合併
5. 定期從 `develop` 合併到 `main` 發布新版本

## 提交規範
- feat: 新功能
- fix: 錯誤修復
- docs: 文檔更新
- style: 代碼格式調整
- refactor: 重構
- test: 測試相關
- chore: 建置/工具相關 