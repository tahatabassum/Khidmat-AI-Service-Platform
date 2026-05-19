# Khidmat dev launcher — backend (uvicorn) + Expo from repo root.
# Usage: .\start.ps1   or double-click start.bat

$ErrorActionPreference = 'Stop'
$Root = $PSScriptRoot
$BackendDir = Join-Path $Root 'backend'
$AppDir = Join-Path $Root 'KhidmatApp'
$VenvDir = Join-Path $BackendDir 'venv'
$VenvPython = Join-Path $VenvDir 'Scripts\python.exe'
$VenvPip = Join-Path $VenvDir 'Scripts\pip.exe'
$Requirements = Join-Path $BackendDir 'requirements.txt'
$Port = 8000

function Get-LanIPv4 {
    try {
        $candidate = Get-NetIPAddress -AddressFamily IPv4 -ErrorAction Stop |
            Where-Object {
                $_.IPAddress -notmatch '^127\.' -and
                $_.IPAddress -notmatch '^169\.254\.' -and
                $_.PrefixOrigin -in @('Dhcp', 'Manual', 'RouterAdvertisement')
            } |
            Sort-Object InterfaceMetric |
            Select-Object -First 1 -ExpandProperty IPAddress
        if ($candidate) { return $candidate }
    } catch { }

    $fallback = [System.Net.Dns]::GetHostAddresses([System.Net.Dns]::GetHostName()) |
        Where-Object { $_.AddressFamily -eq 'InterNetwork' -and -not $_.IPAddress.StartsWith('127.') } |
        Select-Object -First 1
    if ($fallback) { return $fallback.IPAddressToString }
    return $null
}

function Ensure-BackendVenv {
    if (-not (Get-Command python -ErrorAction SilentlyContinue)) {
        Write-Warning 'Python not found on PATH. Install Python 3 and re-run.'
        return $false
    }
    if (-not (Test-Path $VenvPython)) {
        Write-Host 'Creating backend venv...'
        & python -m venv $VenvDir
    }
    $uvicornExe = Join-Path $VenvDir 'Scripts\uvicorn.exe'
    if (-not (Test-Path $uvicornExe)) {
        Write-Host 'Installing backend dependencies (first run)...'
        & $VenvPip install -q -r $Requirements
    }
    return (Test-Path $VenvPython)
}

if (-not (Ensure-BackendVenv)) {
    exit 1
}

$lanIp = Get-LanIPv4
$apiLocal = "http://localhost:${Port}"
$apiLan = if ($lanIp) { "http://${lanIp}:${Port}" } else { $apiLocal }
$expoApiUrl = $apiLan

Write-Host ''
Write-Host '=== Khidmat dev stack ===' -ForegroundColor Cyan
Write-Host "Backend API (local):  $apiLocal"
if ($lanIp) {
    Write-Host "Backend API (LAN):    $apiLan" -ForegroundColor Yellow
    Write-Host "Physical device tip:  set EXPO_PUBLIC_API_URL in KhidmatApp\.env to $apiLan"
} else {
    Write-Host 'LAN IP not detected — emulator/web can use localhost.' -ForegroundColor Yellow
}
Write-Host "Expo will use:        EXPO_PUBLIC_API_URL=$expoApiUrl"
Write-Host ''

$backendScript = @"
Set-Location -LiteralPath '$BackendDir'
& '$VenvPython' -m uvicorn main:app --reload --host 0.0.0.0 --port $Port
"@

$expoScript = @"
`$env:EXPO_PUBLIC_API_URL = '$expoApiUrl'
Set-Location -LiteralPath '$AppDir'
if (-not (Test-Path 'node_modules')) { npm install }
npx expo start
"@

Start-Process powershell -ArgumentList @('-NoExit', '-NoProfile', '-Command', $backendScript) -WindowStyle Normal
Start-Sleep -Seconds 1
Start-Process powershell -ArgumentList @('-NoExit', '-NoProfile', '-Command', $expoScript) -WindowStyle Normal

Write-Host 'Started backend and Expo in separate windows.' -ForegroundColor Green
Write-Host 'Close those windows to stop the servers.'
