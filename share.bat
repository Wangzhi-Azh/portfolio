@echo off
chcp 65001 >nul
title 王智作品集 · 分享临时链接
cd /d "%~dp0"

set "CF=%~dp0..\tools\cloudflared.exe"
if not exist "%CF%" (
  echo.
  echo   找不到 cloudflared.exe
  echo   请把它放到：D:\王智\tools\cloudflared.exe
  echo   下载地址：https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe
  echo.
  pause
  exit /b
)

echo.
echo   正在启动本地服务与隧道，请稍候约 10 秒…
echo.

rem 本地服务（127.0.0.1:6123）
start "portfolio-server" /min cmd /c "py serve.py --port 6123 || python serve.py --port 6123"
timeout /t 2 >nul

set "LOG=%TEMP%\cf-tunnel.log"
if exist "%LOG%" del "%LOG%" >nul 2>nul

rem 公网隧道
start "cloudflared" /min "%CF%" tunnel --url http://127.0.0.1:6123 --no-autoupdate --logfile "%LOG%"

rem 等日志里出现链接
for /l %%i in (1,1,40) do (
  timeout /t 1 >nul
  findstr /c:"trycloudflare.com" "%LOG%" >nul 2>nul && goto :found
)

echo   没拿到地址。看任务栏里的 cloudflared 窗口有没有报错。
pause
exit /b

:found
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$l = Select-String -Path '%LOG%' -Pattern 'https://[a-z0-9-]+\.trycloudflare\.com' | Select-Object -First 1; if ($l) { $v = [regex]::Match($l.Line, 'https://[a-z0-9-]+\.trycloudflare\.com').Value; Set-Clipboard -Value $v; Write-Host ''; Write-Host '  分享链接（已复制到剪贴板）：' -ForegroundColor Green; Write-Host ''; Write-Host ('  ' + $v) -ForegroundColor Cyan; Write-Host ''; Write-Host '  注意：' -ForegroundColor DarkGray; Write-Host '  · 电脑要开着，两个最小化的黑窗口不要关' -ForegroundColor DarkGray; Write-Host '  · 关掉后链接失效，重新运行本文件会得到新链接' -ForegroundColor DarkGray; Write-Host '  · 想要长期固定网址：见 DEPLOY.md 里的 GitHub Pages / Netlify' -ForegroundColor DarkGray } else { Write-Host '  没解析到链接，请看 cloudflared 窗口' -ForegroundColor Yellow }"

echo.
pause
