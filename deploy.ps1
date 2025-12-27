# ==============================================================================
# Script de Deploy Automatizado - v5.0 (Lógica de Configuração Explícita)
# ==============================================================================
$ErrorActionPreference = "Stop"

# --- CONFIGURAÇÃO DO AMBIENTE DE HOMOLOGAÇÃO ---
$ApiBaseUrl = "http://localhost:8080"
$sourceRepoPath = $PSScriptRoot
$frontendDestPath = "C:\inetpub\wwwroot\uaga-inspection-front"
$backendDestPath = "C:\inetpub\wwwroot\uaga-inspection-back"
$backendAppPoolUser = "IIS APPPOOL\uaga-inspection-api-pool"
$frontendAppPoolUser = "IIS APPPOOL\uaga-inspection-app-pool"

# --- INÍCIO DO PROCESSO ---
Write-Host "🚀 INICIANDO PROCESSO DE DEPLOY AUTOMATIZADO v5.0..." -ForegroundColor Green

# Passos 1 a 4 permanecem os mesmos...
# 1. ATUALIZAR O CÓDIGO-FONTE
Write-Host "    - Passo 1/9: Atualizando repositório..."
# cd $sourceRepoPath
# git checkout main
# git pull
# Write-Host "    ✅ Repositório atualizado."

# 2. BUILD DO BACKEND
Write-Host "    - Passo 2/9: Construindo o Backend..."
cd "$sourceRepoPath\checklist-8-18-back"
yarn install --frozen-lockfile
yarn build
if (-not (Test-Path -Path ".\dist")) { throw "ERRO: Build do Backend falhou!" }
Write-Host "    ✅ Backend construído."

# 3. DEPLOY DO BACKEND
Write-Host "    - Passo 3/9: Implantando o Backend no IIS..."
if (-not (Test-Path -Path $backendDestPath)) { New-Item -ItemType Directory -Force -Path $backendDestPath }
$backendFilesToCopy = @("dist", "node_modules", "package.json", "web.config")
foreach ($item in $backendFilesToCopy) {
    robocopy ".\$item" "$backendDestPath\$item" /E /NFL /NDL /NJH /NJS /nc /ns /np
}
Write-Host "    ✅ Backend implantado."

# 4. BUILD DO FRONTEND
Write-Host "    - Passo 4/9: Construindo o Frontend..."
cd "$sourceRepoPath\checklist-8-18-front"
yarn install --frozen-lockfile
yarn build
if (-not (Test-Path -Path ".\dist")) { throw "ERRO: Build do Frontend falhou!" }
Write-Host "    ✅ Frontend construído."


# 5. DEPLOY DO FRONTEND 
Write-Host "    - Passo 5/9: Implantando o Frontend no IIS..."
if (-not (Test-Path -Path $frontendDestPath)) { New-Item -ItemType Directory -Force -Path $frontendDestPath }
# MOTIVAÇÃO: Adicionamos a flag /XF para EXCLUIR o config.js de exemplo do repositório.
# Isso garante que apenas o config.js gerado pelo deploy exista no servidor.
robocopy ".\dist" $frontendDestPath /E /PURGE /XF config.js /NFL /NDL /NJH /NJS /nc /ns /np
Write-Host "    ✅ Frontend implantado (excluindo config.js de exemplo)."


# Passos subsequentes permanecem os mesmos...
# 6. COPIAR web.config DO FRONTEND
Write-Host "    - Passo 6/9: Copiando web.config do Frontend..."
Copy-Item -Path ".\web.config" -Destination $frontendDestPath -Force
Write-Host "    ✅ web.config do Frontend copiado."

# 7. GERAR config.js DO FRONTEND
Write-Host "    - Passo 7/9: Gerando config.js de runtime do Frontend..."
$configContent = "window.runtimeConfig = { VITE_API_BASE_URL: '$ApiBaseUrl' };"
Set-Content -Path "$frontendDestPath\config.js" -Value $configContent
Write-Host "    ✅ config.js gerado com a URL: $ApiBaseUrl"

# 8. CORREÇÃO DE PERMISSÕES DO BACKEND
Write-Host "    - Passo 8/9: Corrigindo permissões da pasta do Backend..."
icacls $backendDestPath /grant "$backendAppPoolUser`:(OI)(CI)M" /T
Write-Host "    ✅ Permissões do Backend corrigidas."

# 9. CORREÇÃO DE PERMISSÕES DO FRONTEND
Write-Host "    - Passo 9/9: Corrigindo permissões da pasta do Frontend..."
icacls $frontendDestPath /grant "$frontendAppPoolUser`:(OI)(CI)M" /T
Write-Host "    ✅ Permissões do Frontend corrigidas."

Write-Host "🎉 DEPLOY CONCLUÍDO COM SUCESSO!" -ForegroundColor Green