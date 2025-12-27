#!/bin/sh

# -----------------------------------------------------------------------------
# entrypoint.sh - Orquestrador da Pipeline de Qualidade do Frontend
#
# MOTIVAÇÃO: Este script é o cérebro do nosso contêiner de desenvolvimento.
# Ele implementa a nossa "pipeline de qualidade em estágios" para garantir que
# o código esteja saudável antes de iniciar o servidor de desenvolvimento.
# -----------------------------------------------------------------------------

# Encerra o script imediatamente se qualquer comando falhar. Essencial para CI.
set -e

echo "--- INICIANDO PIPELINE DE QUALIDADE DO FRONTEND ---"

# --- ESTÁGIO 1: VALIDAÇÃO MÍNIMA (SEMPRE EXECUTA) ---
# MOTIVAÇÃO: Os testes unitários são rápidos e validam a lógica interna
# dos componentes. Eles devem sempre passar antes de qualquer outra coisa.
echo "🧪 Executando testes unitários..."
yarn test:unit --watch=false
echo "✅ Testes unitários passaram com sucesso!"

# --- ESTÁGIO 2: VALIDAÇÃO COMPLETA (OPCIONAL) ---
# MOTIVAÇÃO: Implementar o condicional que você sugeriu. Verificamos se a
# variável de ambiente RUN_E2E foi definida como "true".
if [ "$RUN_E2E" = "true" ]; then

  echo "🚀 Flag RUN_E2E detectada. Iniciando pipeline de validação completa..."

  # Passo 2.1: Esperar pelo Backend
  # MOTIVAÇÃO: Os testes E2E PRECISAM da API no ar. Colocamos o 'wait-for-it'
  # aqui dentro do 'if' para que ele SÓ seja executado quando necessário.
  # A variável de ambiente API_URL nos dá flexibilidade.
  echo "⏳ Aguardando Backend em ${VITE_API_BASE_URL}..."
  # Extrai o host e a porta da URL para usar com o wait-for-it
  API_HOST=$(echo $VITE_API_BASE_URL | cut -d'/' -f3 | cut -d':' -f1)
  API_PORT=$(echo $VITE_API_BASE_URL | cut -d'/' -f3 | cut -d':' -f2)
  ./wait-for-it.sh $API_HOST:$API_PORT --timeout=90 --strict -- echo "✅ Backend está pronto!"

  # Passo 2.2: Verificar o Build de Produção
  # MOTIVAÇÃO: Cumprir a sua regra de ouro: "não adianta rodar testes E2E
  # se o código não compila em modo produção".
  echo "📦 Verificando o build de produção..."
  yarn build
  echo "✅ Build de produção compilou com sucesso!"

  # Passo 2.3: Executar os Testes E2E no modo CI
  # MOTIVAÇÃO: Agora chamamos o nosso novo script, que testa
  # contra os arquivos buildados, e não o servidor de desenvolvimento.
  echo "🧪 Executando testes End-to-End (Cypress) no modo CI..."
  yarn test:e2e:ci
  echo "✅ Testes E2E passaram com sucesso!"

else

  # --- CAMINHO PADRÃO: DESENVOLVIMENTO ---
  # MOTIVAÇÃO: Se a flag RUN_E2E não for passada, seguimos o fluxo normal
  # do desenvolvedor: rodar testes unitários e iniciar o servidor para codificar.
  echo "🏁 Pipeline de validação rápida concluída. Iniciando servidor de desenvolvimento..."
  exec yarn start:dev

fi

echo "--- PIPELINE DE QUALIDADE DO FRONTEND CONCLUÍDA ---"