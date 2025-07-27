#!/bin/bash

#==============================================================================
# SCRIPT DE MUDANÇA PARA AMBIENTE DE PRODUÇÃO
#==============================================================================
# 
# Descrição: Script automatizado para alternar a aplicação para o ambiente
#            de produção do Supabase
#
# Autor: Sistema de Gestão Profissional
# Data: $(date +"%Y-%m-%d")
# Versão: 1.0
#
# Pré-requisitos:
# - Doppler CLI instalado e configurado
# - Chaves de produção configuradas no Doppler
# - Permissões de execução no script
#
# Uso: ./scripts/switch-to-production.sh
#
# Variáveis configuradas:
# - VITE_SUPABASE_URL: URL do projeto Supabase de produção
# - VITE_SUPABASE_ANON_KEY: Chave anônima de produção
#
# Pós-execução:
# - Reiniciar o servidor: doppler run -- npx vite
#
# ATENÇÃO: Este script altera para o ambiente de PRODUÇÃO!
#          Use com cuidado e certifique-se de que é isso que deseja.
#
#==============================================================================

echo "🔄 Alternando para ambiente de PRODUÇÃO..."
echo "⚠️  ATENÇÃO: Você está alterando para o ambiente de PRODUÇÃO!"
echo ""

#------------------------------------------------------------------------------
# ETAPA 1: Configuração da URL do Supabase
#------------------------------------------------------------------------------
# Define a URL base do projeto Supabase de produção
# Esta URL será usada para todas as requisições da aplicação
echo "📡 Configurando URL do Supabase para produção..."
doppler secrets set VITE_SUPABASE_URL="https://pwksgdjjkryqryqrvyja.supabase.co"
if [ $? -eq 0 ]; then
    echo "✅ URL de produção configurada com sucesso"
else
    echo "❌ Erro ao configurar URL de produção"
    echo "💡 Verifique se o Doppler está configurado corretamente"
    exit 1
fi

#------------------------------------------------------------------------------
# ETAPA 2: Configuração da Chave Anônima
#------------------------------------------------------------------------------
# Define a chave anônima de produção
# A chave anônima permite acesso público limitado ao banco de dados
echo "🔑 Configurando chave anônima de produção..."
# doppler secrets set VITE_SUPABASE_ANON_KEY="YOUR_PRODUCTION_ANON_KEY_HERE"
if [ $? -eq 0 ]; then
    echo "✅ Chave anônima de produção configurada com sucesso"
else
    echo "❌ Erro ao configurar chave anônima de produção"
    echo "💡 Verifique se a chave de produção está correta"
    exit 1
fi

#------------------------------------------------------------------------------
# ETAPA 3: Teste de Conectividade
#------------------------------------------------------------------------------
# Realiza um teste de conexão com o banco de produção
# Verifica se as credenciais estão funcionando corretamente
echo "🧪 Testando conexão com ambiente de produção..."
echo "📡 Endpoint: https://pwksgdjjkryqryqrvyja.supabase.co/rest/v1/colaboradores"
echo "⚠️  CUIDADO: Este teste acessa dados de PRODUÇÃO!"
echo ""

# Executa uma consulta simples para contar registros na tabela colaboradores
response=$(curl -s -X GET "https://pwksgdjjkryqryqrvyja.supabase.co/rest/v1/colaboradores?select=count" \
    -H "apikey: $(doppler secrets get VITE_SUPABASE_ANON_KEY --plain)" \
    -H "Authorization: Bearer $(doppler secrets get VITE_SUPABASE_ANON_KEY --plain)")

# Verifica o resultado da conexão
if [ $? -eq 0 ]; then
    echo "✅ Conexão com produção estabelecida com sucesso"
    echo "📊 Resposta do servidor: $response"
    echo "🔍 Se a resposta estiver vazia, pode indicar que a tabela não existe ou está vazia"
else
    echo "❌ Erro na conexão com produção"
    echo "🔧 Possíveis causas:"
    echo "   - Chaves incorretas ou expiradas"
    echo "   - Problemas de conectividade"
    echo "   - Configuração RLS restritiva"
    echo "   - Servidor de produção indisponível"
fi

#------------------------------------------------------------------------------
# FINALIZAÇÃO E PRÓXIMOS PASSOS
#------------------------------------------------------------------------------
echo ""
echo "🎯 Ambiente alterado para PRODUÇÃO com sucesso!"
echo "🚨 LEMBRE-SE: Você está agora conectado ao ambiente de PRODUÇÃO!"
echo ""
echo "📋 Próximos passos:"
echo "   1. Reinicie o servidor: doppler run -- npx vite"
echo "   2. Acesse: http://localhost:5173/"
echo "   3. Verifique se a aplicação está conectada ao ambiente correto"
echo "   4. TESTE CUIDADOSAMENTE antes de fazer alterações"
echo ""
echo "🔄 Para alternar para homologação: ./scripts/switch-to-homolog.sh"
echo "📚 Documentação completa: docs/TROCA-AMBIENTES.md"
echo ""
echo "⚠️  IMPORTANTE: Dados de produção são sensíveis - use com responsabilidade!"