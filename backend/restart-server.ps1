# Script PowerShell para reiniciar el servidor limpiamente
Write-Host "🔄 Limpiando procesos Node.js..." -ForegroundColor Yellow

# Matar todos los procesos de Node.js y nodemon
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force
Get-Process -Name "nodemon" -ErrorAction SilentlyContinue | Stop-Process -Force

# Esperar un momento
Start-Sleep -Seconds 2

# Verificar que el puerto esté libre
$port = 3002
$connection = Test-NetConnection -ComputerName localhost -Port $port -InformationLevel Quiet -WarningAction SilentlyContinue

if ($connection) {
    Write-Host "⚠️  Puerto $port aún ocupado, intentando liberar..." -ForegroundColor Red
    $process = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess
    if ($process) {
        Stop-Process -Id $process -Force
        Write-Host "✅ Puerto $port liberado" -ForegroundColor Green
    }
} else {
    Write-Host "✅ Puerto $port disponible" -ForegroundColor Green
}

Write-Host "🚀 Iniciando servidor..." -ForegroundColor Green
npm run dev