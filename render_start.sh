#!/usr/bin/env bash
# 為了讓 Render 正確找到檔案，我們要先進入 backend/
cd backend

# 確保 Render 使用 gunicorn 啟動 Flask
gunicorn -w 4 -b 0.0.0.0:10000 app:app
