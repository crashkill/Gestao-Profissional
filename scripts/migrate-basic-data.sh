#!/bin/bash
# 🔄 Script de Migração Básica: Produção → Homologação
# Este script replica os dados básicos usando apenas chaves anônimas

set -e  # Parar em caso de erro

# 🎯 Configurações dos Projetos
PROD_PROJECT_ID="pwksgdjjkryqryqrvyja"
HOMOLOG_PROJECT_ID="zbiivgtdamejiwcabmcv"
PROD_URL="https://pwksgdjjkryqryqrvyja.supabase.co"
HOMOLOG_URL="https://zbiivgtdamejiwcabmcv.supabase.co"

# 🔐 Chaves Anônimas (do Doppler)
PROD_ANON_KEY="YOUR_PRODUCTION_ANON_KEY_HERE"
HOMOLOG_ANON_KEY="YOUR_HOMOLOG_ANON_KEY_HERE"

# 📁 Arquivo temporário para dados
TEMP_DATA_FILE="/tmp/colaboradores_backup.json"

echo "🚀 Iniciando Migração Básica: Produção → Homologação"
echo "========================================================"
echo "📊 Produção:   $PROD_PROJECT_ID"
echo "🧪 Homologação: $HOMOLOG_PROJECT_ID"
echo "========================================================"

# 🔍 Verificar conectividade
echo "🔍 Verificando conectividade..."

# Testar produção
echo "📊 Testando conexão com PRODUÇÃO..."
PROD_TEST=$(curl -s -o /dev/null -w "%{http_code}" \
  "$PROD_URL/rest/v1/colaboradores?select=count" \
  -H "apikey: $PROD_ANON_KEY" \
  -H "Authorization: Bearer $PROD_ANON_KEY")

if [ "$PROD_TEST" != "200" ]; then
  echo "❌ ERRO: Não foi possível conectar à PRODUÇÃO (HTTP $PROD_TEST)"
  exit 1
fi
echo "✅ Conexão com PRODUÇÃO: OK"

# Testar homologação
echo "🧪 Testando conexão com HOMOLOGAÇÃO..."
HOMOLOG_TEST=$(curl -s -o /dev/null -w "%{http_code}" \
  "$HOMOLOG_URL/rest/v1/colaboradores?select=count" \
  -H "apikey: $HOMOLOG_ANON_KEY" \
  -H "Authorization: Bearer $HOMOLOG_ANON_KEY")

if [ "$HOMOLOG_TEST" != "200" ]; then
  echo "❌ ERRO: Não foi possível conectar à HOMOLOGAÇÃO (HTTP $HOMOLOG_TEST)"
  exit 1
fi
echo "✅ Conexão com HOMOLOGAÇÃO: OK"

# 📊 Verificar dados em produção
echo "📊 Verificando dados em PRODUÇÃO..."
PROD_COUNT=$(curl -s \
  "$PROD_URL/rest/v1/colaboradores?select=count" \
  -H "apikey: $PROD_ANON_KEY" \
  -H "Authorization: Bearer $PROD_ANON_KEY" | \
  jq -r '.[0].count // 0')

echo "📈 Registros em PRODUÇÃO: $PROD_COUNT"

if [ "$PROD_COUNT" = "0" ] || [ "$PROD_COUNT" = "null" ]; then
  echo "⚠️ AVISO: Nenhum dado encontrado em PRODUÇÃO"
  echo "🔍 Verificando se a tabela existe..."
  
  # Tentar listar colunas da tabela
  PROD_SCHEMA=$(curl -s \
    "$PROD_URL/rest/v1/colaboradores?select=*&limit=0" \
    -H "apikey: $PROD_ANON_KEY" \
    -H "Authorization: Bearer $PROD_ANON_KEY")
  
  if echo "$PROD_SCHEMA" | jq -e '. | length' > /dev/null 2>&1; then
    echo "✅ Tabela existe em PRODUÇÃO, mas está vazia"
  else
    echo "❌ ERRO: Tabela não existe ou não é acessível em PRODUÇÃO"
    exit 1
  fi
fi

# 📥 Baixar dados de produção
echo "📥 Baixando dados de PRODUÇÃO..."
curl -s \
  "$PROD_URL/rest/v1/colaboradores?select=*" \
  -H "apikey: $PROD_ANON_KEY" \
  -H "Authorization: Bearer $PROD_ANON_KEY" \
  > "$TEMP_DATA_FILE"

# Verificar se o download foi bem-sucedido
if [ ! -s "$TEMP_DATA_FILE" ]; then
  echo "❌ ERRO: Falha ao baixar dados de PRODUÇÃO"
  exit 1
fi

DOWNLOADED_COUNT=$(jq '. | length' "$TEMP_DATA_FILE")
echo "✅ Baixados $DOWNLOADED_COUNT registros de PRODUÇÃO"

# 🧪 Verificar dados em homologação
echo "🧪 Verificando dados em HOMOLOGAÇÃO..."
HOMOLOG_COUNT=$(curl -s \
  "$HOMOLOG_URL/rest/v1/colaboradores?select=count" \
  -H "apikey: $HOMOLOG_ANON_KEY" \
  -H "Authorization: Bearer $HOMOLOG_ANON_KEY" | \
  jq -r '.[0].count // 0')

echo "📈 Registros atuais em HOMOLOGAÇÃO: $HOMOLOG_COUNT"

# 🗑️ Limpar dados de homologação (se houver)
if [ "$HOMOLOG_COUNT" != "0" ] && [ "$HOMOLOG_COUNT" != "null" ]; then
  echo "🗑️ Limpando dados existentes em HOMOLOGAÇÃO..."
  
  # Nota: Com chave anônima, só podemos deletar se as políticas RLS permitirem
  # Vamos tentar deletar todos os registros
  DELETE_RESULT=$(curl -s -X DELETE \
    "$HOMOLOG_URL/rest/v1/colaboradores?id=gte.0" \
    -H "apikey: $HOMOLOG_ANON_KEY" \
    -H "Authorization: Bearer $HOMOLOG_ANON_KEY" \
    -H "Prefer: return=minimal")
  
  # Verificar se a limpeza funcionou
  NEW_COUNT=$(curl -s \
    "$HOMOLOG_URL/rest/v1/colaboradores?select=count" \
    -H "apikey: $HOMOLOG_ANON_KEY" \
    -H "Authorization: Bearer $HOMOLOG_ANON_KEY" | \
    jq -r '.[0].count // 0')
  
  if [ "$NEW_COUNT" = "0" ]; then
    echo "✅ Dados limpos com sucesso"
  else
    echo "⚠️ AVISO: Não foi possível limpar todos os dados ($NEW_COUNT restantes)"
    echo "💡 Isso pode ser devido às políticas RLS. Continuando..."
  fi
fi

# 📤 Enviar dados para homologação
if [ "$DOWNLOADED_COUNT" -gt 0 ]; then
  echo "📤 Enviando dados para HOMOLOGAÇÃO..."
  
  # Remover campos que podem causar conflito (id, created_at)
  jq 'map(del(.id, .created_at))' "$TEMP_DATA_FILE" > "${TEMP_DATA_FILE}.clean"
  
  # Enviar dados em lotes (para evitar timeout)
  BATCH_SIZE=50
  TOTAL_RECORDS=$(jq '. | length' "${TEMP_DATA_FILE}.clean")
  BATCHES=$(( (TOTAL_RECORDS + BATCH_SIZE - 1) / BATCH_SIZE ))
  
  echo "📦 Enviando $TOTAL_RECORDS registros em $BATCHES lotes..."
  
  for ((i=0; i<BATCHES; i++)); do
    START=$((i * BATCH_SIZE))
    echo "📦 Lote $((i+1))/$BATCHES (registros $((START+1))-$((START+BATCH_SIZE)))..."
    
    # Extrair lote
    jq ".[${START}:${START}+${BATCH_SIZE}]" "${TEMP_DATA_FILE}.clean" > "${TEMP_DATA_FILE}.batch"
    
    # Enviar lote
    UPLOAD_RESULT=$(curl -s -X POST \
      "$HOMOLOG_URL/rest/v1/colaboradores" \
      -H "apikey: $HOMOLOG_ANON_KEY" \
      -H "Authorization: Bearer $HOMOLOG_ANON_KEY" \
      -H "Content-Type: application/json" \
      -H "Prefer: return=minimal" \
      -d @"${TEMP_DATA_FILE}.batch")
    
    # Verificar se houve erro
    if echo "$UPLOAD_RESULT" | jq -e '.code' > /dev/null 2>&1; then
      echo "❌ ERRO no lote $((i+1)): $UPLOAD_RESULT"
    else
      echo "✅ Lote $((i+1)) enviado com sucesso"
    fi
    
    # Pequena pausa entre lotes
    sleep 1
  done
  
  # Limpar arquivos temporários
  rm -f "${TEMP_DATA_FILE}.clean" "${TEMP_DATA_FILE}.batch"
else
  echo "⚠️ Nenhum dado para migrar"
fi

# 🔍 Verificar resultado final
echo "🔍 Verificando resultado da migração..."
FINAL_COUNT=$(curl -s \
  "$HOMOLOG_URL/rest/v1/colaboradores?select=count" \
  -H "apikey: $HOMOLOG_ANON_KEY" \
  -H "Authorization: Bearer $HOMOLOG_ANON_KEY" | \
  jq -r '.[0].count // 0')

echo "📈 Registros finais em HOMOLOGAÇÃO: $FINAL_COUNT"

# 🧹 Limpar arquivo temporário
rm -f "$TEMP_DATA_FILE"

# 📊 Resumo
echo ""
echo "📊 RESUMO DA MIGRAÇÃO"
echo "==================="
echo "📊 Produção:    $PROD_COUNT registros"
echo "🧪 Homologação: $FINAL_COUNT registros"

if [ "$FINAL_COUNT" -gt 0 ]; then
  echo "✅ MIGRAÇÃO CONCLUÍDA COM SUCESSO!"
  echo ""
  echo "🎯 Próximos passos:"
  echo "1. Configurar ambiente de desenvolvimento para usar homologação:"
  echo "   doppler secrets set VITE_SUPABASE_URL=\"https://zbiivgtdamejiwcabmcv.supabase.co\""
  echo "   doppler secrets set VITE_SUPABASE_ANON_KEY=\"$HOMOLOG_ANON_KEY\""
  echo ""
  echo "2. Reiniciar a aplicação:"
  echo "   doppler run -- npx vite"
  echo ""
  echo "3. Testar a aplicação em http://localhost:5173/"
else
  echo "⚠️ MIGRAÇÃO INCOMPLETA"
  echo "💡 Verifique as políticas RLS e permissões"
fi

echo ""
echo "🏁 Script finalizado!"