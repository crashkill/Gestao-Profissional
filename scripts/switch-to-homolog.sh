#!/bin/bash

#==============================================================================
# SCRIPT DE MUDANÇA PARA AMBIENTE DE HOMOLOGAÇÃO
#==============================================================================
# 
# Descrição: Script automatizado para alternar a aplicação para o ambiente
#            de homologação do Supabase
#
# Autor: Sistema de Gestão Profissional
# Data: $(date +"%Y-%m-%d")
# Versão: 1.0
#
# Pré-requisitos:
# - Doppler CLI instalado e configurado
# - Chaves de homologação configuradas no Doppler
# - Permissões de execução no script
#
# Uso: ./scripts/switch-to-homolog.sh
#
# Variáveis configuradas:
# - VITE_SUPABASE_URL: URL do projeto Supabase de homologação
# - VITE_SUPABASE_ANON_KEY: Chave anônima de homologação
#
# Pós-execução:
# - Reiniciar o servidor: doppler run -- npx vite
#
#==============================================================================

echo "🔄 Alternando para ambiente de HOMOLOGAÇÃO..."

#------------------------------------------------------------------------------
# ETAPA 1: Configuração da URL do Supabase
#------------------------------------------------------------------------------
# Define a URL base do projeto Supabase de homologação
# Esta URL será usada para todas as requisições da aplicação
echo "📡 Configurando URL do Supabase para homologação..."
doppler secrets set VITE_SUPABASE_URL="https://zbiivgtdamejiwcabmcv.supabase.co"
if [ $? -eq 0 ]; then
    echo "✅ URL de homologação configurada com sucesso"
else
    echo "❌ Erro ao configurar URL de homologação"
    echo "💡 Verifique se o Doppler está configurado corretamente"
    exit 1
fi

#------------------------------------------------------------------------------
# ETAPA 2: Configuração da Chave Anônima
#------------------------------------------------------------------------------
# Copia a chave anônima de homologação para a variável ativa
# A chave anônima permite acesso público limitado ao banco de dados
echo "🔑 Configurando chave anônima de homologação..."
doppler secrets set VITE_SUPABASE_ANON_KEY="$(doppler secrets get VITE_SUPABASE_ANON_KEY_HOMOLOG --plain)"
if [ $? -eq 0 ]; then
    echo "✅ Chave anônima de homologação configurada com sucesso"
else
    echo "❌ Erro ao configurar chave anônima de homologação"
    echo "💡 Verifique se VITE_SUPABASE_ANON_KEY_HOMOLOG existe no Doppler"
    exit 1
fi

#------------------------------------------------------------------------------
# ETAPA 3: Teste de Conectividade
#------------------------------------------------------------------------------
# Realiza um teste de conexão com o banco de homologação
# Verifica se as credenciais estão funcionando corretamente
echo "🧪 Testando conexão com ambiente de homologação..."
echo "📡 Endpoint: https://zbiivgtdamejiwcabmcv.supabase.co/rest/v1/colaboradores"

# Executa uma consulta simples para contar registros na tabela colaboradores
response=$(curl -s -X GET "https://zbiivgtdamejiwcabmcv.supabase.co/rest/v1/colaboradores?select=count" \
    -H "apikey: $(doppler secrets get VITE_SUPABASE_ANON_KEY --plain)" \
    -H "Authorization: Bearer $(doppler secrets get VITE_SUPABASE_ANON_KEY --plain)")

# Verifica o resultado da conexão
if [ $? -eq 0 ]; then
    echo "✅ Conexão com homologação estabelecida com sucesso"
    echo "📊 Resposta do servidor: $response"
    echo "🔍 Se a resposta estiver vazia, pode indicar que a tabela não existe ou está vazia"
else
    echo "❌ Erro na conexão com homologação"
    echo "🔧 Possíveis causas:"
    echo "   - Chaves incorretas ou expiradas"
    echo "   - Problemas de conectividade"
    echo "   - Configuração RLS restritiva"
fi

#------------------------------------------------------------------------------
# FINALIZAÇÃO E PRÓXIMOS PASSOS
#------------------------------------------------------------------------------
echo ""
echo "🎯 Ambiente alterado para HOMOLOGAÇÃO com sucesso!"
echo ""
echo "📋 Próximos passos:"
echo "   1. Reinicie o servidor: doppler run -- npx vite"
echo "   2. Acesse: http://localhost:5173/"
echo "   3. Verifique se a aplicação está conectada ao ambiente correto"
echo ""
echo "🔄 Para voltar à produção: ./scripts/switch-to-production.sh"
echo "📚 Documentação completa: docs/TROCA-AMBIENTES.md"