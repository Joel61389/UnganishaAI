# ─────────────────────────────────────────────────────────────────────────────
# start.ps1  –  UnganishaAI unified dev launcher
#
# Usage:  .\start.ps1
#
# What it does:
#   1. Detects your LAN IP automatically
#   2. Writes frontend/.env.local with VITE_API_URL pointing to your LAN IP
#   3. Starts the FastAPI backend on 0.0.0.0:8000  (background job)
#   4. Starts the Vite frontend on 0.0.0.0:5173   (foreground)
#
# Phones/tablets on the same Wi-Fi network can then open:
#   http://<YOUR-LAN-IP>:5173
# ─────────────────────────────────────────────────────────────────────────────

$root   = $PSScriptRoot
$be     = Join-Path $root "backend"
$fe     = Join-Path $root "frontend"
$venv   = Join-Path $be   ".venv\Scripts\python.exe"

# ── 1. Detect LAN IP ──────────────────────────────────────────────────────────
$lanIP = (
  Get-NetIPAddress -AddressFamily IPv4 |
  Where-Object { $_.IPAddress -notmatch '^127\.' -and $_.PrefixOrigin -ne 'WellKnown' } |
  Sort-Object InterfaceIndex |
  Select-Object -First 1
).IPAddress

if (-not $lanIP) { $lanIP = "localhost" }

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "  🌍  Unganisha AI  —  Network Dev Launcher" -ForegroundColor White
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Detected LAN IP  :  $lanIP" -ForegroundColor Yellow
Write-Host "  Backend API      :  http://$lanIP`:8000" -ForegroundColor Green
Write-Host "  Frontend App     :  http://$lanIP`:5173" -ForegroundColor Green
Write-Host ""
Write-Host "  Open this on any phone / tablet on the same Wi-Fi:" -ForegroundColor White
Write-Host "  ➜  http://$lanIP`:5173" -ForegroundColor Cyan
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

# ── 2. Write frontend .env.local ──────────────────────────────────────────────
$envFile = Join-Path $fe ".env.local"
Set-Content -Path $envFile -Value "VITE_API_URL=http://$lanIP`:8000"
Write-Host "  ✅  Wrote $envFile" -ForegroundColor DarkGreen

# ── 3. Start FastAPI backend in a background job ──────────────────────────────
Write-Host "  🚀  Starting FastAPI backend on 0.0.0.0:8000 ..." -ForegroundColor Magenta
$backendJob = Start-Job -ScriptBlock {
  param($dir, $python)
  Set-Location $dir
  & $python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
} -ArgumentList $be, $venv

# ── 4. Give backend a moment to initialise, then start frontend ───────────────
Start-Sleep -Seconds 2
Write-Host "  🎨  Starting Vite frontend on 0.0.0.0:5173 ..." -ForegroundColor Magenta
Write-Host ""

Set-Location $fe
npm run dev
