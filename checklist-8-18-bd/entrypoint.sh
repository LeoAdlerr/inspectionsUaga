#!/bin/bash
set -e # Encerra o script se qualquer comando falhar

# ==============================================================================
# Entrypoint Personalizado para o Container MySQL (VERSAO CORRIGIDA)
# ==============================================================================

echo "Iniciando o servidor MySQL em background..."
docker-entrypoint.sh "$@" &

MYSQL_PID=$!

echo "Aguardando o MySQL ficar pronto..."
# CORRECAO: Usamos o usuario root para verificar o status, e mais confiavel.
until mysqladmin ping -h localhost -u root -p"$MYSQL_ROOT_PASSWORD" --silent; do
    echo -n "."
    sleep 1
done
echo "MySQL pronto para conexoes!"

# CORRECAO: Usamos o usuario root para verificar a existencia das tabelas.
TABLE_EXISTS=$(mysql -u root -p"$MYSQL_ROOT_PASSWORD" "$MYSQL_DATABASE" -s -N -e "SELECT COUNT(*) FROM information_schema.TABLES WHERE table_schema = '$MYSQL_DATABASE' AND table_name = 'users';")

if [ "$TABLE_EXISTS" -eq 1 ]; then
    echo "VERIFICACAO: As tabelas ja existem. Nenhuma acao de inicializacao necessaria."
else
    echo "VERIFICACAO: Banco de dados vazio. Executando scripts de inicializacao..."

    # CORRECAO: Usamos o usuario root para executar o script de inicializacao.
    echo "Executando init.sql para criar o schema e os dados iniciais..."
    mysql -u root -p"$MYSQL_ROOT_PASSWORD" "$MYSQL_DATABASE" < /docker-entrypoint-initdb.d/init.sql
    echo "init.sql executado com sucesso."

    # CORRECAO: Usamos o usuario root para a verificacao pos-criacao.
    TABLE_COUNT=$(mysql -u root -p"$MYSQL_ROOT_PASSWORD" "$MYSQL_DATABASE" -s -N -e "SELECT COUNT(*) FROM information_schema.TABLES WHERE table_schema = '$MYSQL_DATABASE' AND table_name IN ('users', 'roles', 'inspections', 'inspection_checklist_items');")

    if [ "$TABLE_COUNT" -eq 4 ]; then
        echo "VERIFICACAO: As 4 tabelas chave foram criadas com sucesso!"
        
        # CORRECAO: Usamos o usuario root para executar os casos de uso.
        echo "Executando casosDeUso.sql para validar a logica do modelo..."
        mysql -u root -p"$MYSQL_ROOT_PASSWORD" "$MYSQL_DATABASE" < /docker-entrypoint-initdb.d/casosDeUso.sql
        echo "casosDeUso.sql executado com sucesso. O ambiente esta validado e pronto!"
    else
        echo "ERRO FATAL: A criacao das tabelas falhou. Esperado 4 tabelas chave, encontrado $TABLE_COUNT."
        exit 1
    fi
fi

# Traz o processo do MySQL para o primeiro plano.
wait $MYSQL_PID