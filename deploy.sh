#!/bin/bash

# 顯示執行的命令
set -x

# 確保在錯誤時停止執行
set -e

# 執行部署
npm run deploy

echo "部署完成！" 