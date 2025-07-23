#!/bin/bash
# Script para verificar a existência do arquivo Excel

OUTPUT_FILE="excel-check-result.txt"

echo "🔍 Verificando arquivos Excel no projeto..." | tee "$OUTPUT_FILE"

# Verificar o arquivo específico mencionado no script
echo "\n📊 Verificando arquivo específico:" | tee -a "$OUTPUT_FILE"
if [ -f "./Cadastro Colaboradores - FSW São Paulo(1-97) - Detalhada.xlsx" ]; then
  echo "✅ Arquivo encontrado: ./Cadastro Colaboradores - FSW São Paulo(1-97) - Detalhada.xlsx" | tee -a "$OUTPUT_FILE"
else
  echo "❌ Arquivo não encontrado: ./Cadastro Colaboradores - FSW São Paulo(1-97) - Detalhada.xlsx" | tee -a "$OUTPUT_FILE"
fi

# Procurar por arquivos Excel no diretório atual e subdiretórios
echo "\n📊 Procurando por arquivos Excel no projeto:" | tee -a "$OUTPUT_FILE"
find . -name "*.xlsx" -type f | tee -a "$OUTPUT_FILE"

# Verificar arquivos Excel no diretório public
echo "\n📊 Verificando arquivos Excel no diretório public:" | tee -a "$OUTPUT_FILE"
if [ -d "./public" ]; then
  ls -la ./public/*.xlsx 2>/dev/null | tee -a "$OUTPUT_FILE" || echo "❌ Nenhum arquivo Excel encontrado no diretório public" | tee -a "$OUTPUT_FILE"
else
  echo "❌ Diretório public não encontrado" | tee -a "$OUTPUT_FILE"
fi

echo "\n✅ Verificação concluída!" | tee -a "$OUTPUT_FILE"
echo "📄 Resultados salvos em: $OUTPUT_FILE"