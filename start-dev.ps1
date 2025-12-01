Write-Host "════════════════════════════════════════" -ForegroundColor Green
Write-Host "  INICIANDO SERVIDOR NEXT.JS" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════`n" -ForegroundColor Green

# Verificar que estamos en el directorio correcto
if (-not (Test-Path "package.json")) {
    Write-Host "Error: No se encuentra package.json" -ForegroundColor Red
    Write-Host "Asegúrate de estar en el directorio del proyecto" -ForegroundColor Yellow
    exit 1
}

# Detener procesos Node anteriores
Write-Host "Deteniendo procesos Node anteriores..." -ForegroundColor Yellow
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# Ejecutar servidor
Write-Host "`nIniciando servidor de desarrollo...`n" -ForegroundColor Cyan
Write-Host "Espera a ver: 'Ready' y 'Local: http://localhost:3000'`n" -ForegroundColor Yellow
Write-Host "────────────────────────────────────────`n" -ForegroundColor Gray

npm run dev

