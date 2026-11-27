@echo off
chcp 65001 >nul
title 王智作品集 · 本地预览
cd /d "%~dp0"

echo.
echo   王智 · 工业设计作品集
echo   ----------------------------------------
echo   1. 只在本机看
echo   2. 让同一 Wi-Fi 下的手机 / 同事也能看
echo.
set /p choice="请输入 1 或 2 后回车（默认 1）："

if "%choice%"=="2" (
  set HOSTARG=--host 0.0.0.0
) else (
  set HOSTARG=
)

where py >nul 2>nul
if %errorlevel%==0 (
  py serve.py %HOSTARG% --open
  goto :end
)

where python >nul 2>nul
if %errorlevel%==0 (
  python serve.py %HOSTARG% --open
  goto :end
)

echo.
echo   没有找到 Python，改成直接打开网页文件（功能完全一样，只是没有本地地址）。
start "" "index.html"

:end
pause
