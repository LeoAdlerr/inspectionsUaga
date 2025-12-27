#!/bin/sh
set -e

echo "--- INICIANDO PIPELINE DE QUALIDADE DO BACKEND ---"

DB_HOST=${DB_HOST:-db}
echo "⏳ Aguardando Banco de Dados no host '${DB_HOST}' na porta 3306..."
./wait-for-it.sh ${DB_HOST}:3306 --timeout=90 --strict -- echo "✅ Banco de Dados está pronto!"

if [ "$NODE_ENV" = "production" ]; then

  echo "🏁 Ambiente de Produção detectado. Construindo e iniciando servidor..."

  echo "📦 Construindo a aplicação para produção..."
  yarn build
  echo "✅ Build de produção concluído."

  echo "🚀 Iniciando servidor de produção..."
  exec yarn start:prod

else
  echo "🧪 Executando testes unitários e de integração..."
  yarn test --passWithNoTests
  echo "✅ Testes unitários e de integração passaram com sucesso!"

  if [ "$RUN_E2E" = "true" ]; then

    echo "🚀 Flag RUN_E2E detectada. Iniciando pipeline de validação E2E..."

    echo "📦 Verificando o build de produção..."
    yarn build
    echo "✅ Build de produção compilou com sucesso!"

    echo "🧪 Executando testes End-to-End (Jest/Supertest)..."
    yarn test:e2e
    
    echo "🏁 Pipeline de validação e2e concluída. Iniciando servidor de produção..."
    exec yarn start:prod

  else
    
    echo "🏁 Pipeline de validação rápida concluída. Iniciando servidor de desenvolvimento..."
    exec yarn start:dev

  fi # Este 'fi' fecha o if do RUN_E2E

fi # --- CORREÇÃO AQUI: Adicionado o 'fi' que faltava para fechar o if do NODE_ENV ---

echo "--- PIPELINE DE QUALIDADE DO BACKEND CONCLUÍDA ---"