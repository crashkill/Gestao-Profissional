# Scripts de Mudança de Ambiente

Esta pasta contém scripts automatizados para alternar entre os ambientes de produção e homologação do Supabase.

## 📁 Arquivos Disponíveis

### `switch-to-homolog.sh`
Script para alternar para o ambiente de homologação.

**Funcionalidades:**
- ✅ Documentação completa com comentários explicativos
- ✅ Configuração automática da URL de homologação
- ✅ Configuração automática da chave anônima de homologação
- ✅ Teste de conectividade automático
- ✅ Validação de cada etapa
- ✅ Mensagens de erro detalhadas
- ✅ Instruções de próximos passos

### `switch-to-production.sh`
Script para alternar para o ambiente de produção.

**Funcionalidades:**
- ✅ Documentação completa com comentários explicativos
- ✅ Avisos de segurança para ambiente de produção
- ✅ Configuração automática da URL de produção
- ✅ Configuração automática da chave anônima de produção
- ✅ Teste de conectividade automático
- ✅ Validação de cada etapa
- ✅ Mensagens de erro detalhadas
- ✅ Alertas sobre responsabilidade com dados de produção
- ✅ Instruções de próximos passos

## 🚀 Como Usar

### Pré-requisitos
1. **Doppler CLI** instalado e configurado
2. **Permissões de execução** nos scripts
3. **Chaves do Supabase** configuradas no Doppler

### Execução

```bash
# Para alternar para homologação
./scripts/switch-to-homolog.sh

# Para alternar para produção
./scripts/switch-to-production.sh
```

### Após a Execução
1. **Reinicie o servidor**: `doppler run -- npx vite`
2. **Acesse a aplicação**: http://localhost:5173/
3. **Verifique o ambiente**: Confirme se está conectado ao ambiente correto

## 📋 Estrutura de Documentação

Cada script possui:

### Cabeçalho Completo
```bash
#==============================================================================
# SCRIPT DE MUDANÇA PARA AMBIENTE DE [PRODUÇÃO/HOMOLOGAÇÃO]
#==============================================================================
# 
# Descrição: Script automatizado para alternar a aplicação
# Autor: Sistema de Gestão Profissional
# Versão: 1.0
# Pré-requisitos: Doppler CLI, chaves configuradas
# Uso: ./scripts/switch-to-[environment].sh
#==============================================================================
```

### Comentários por Etapa
- **Etapa 1**: Configuração da URL do Supabase
- **Etapa 2**: Configuração da Chave Anônima
- **Etapa 3**: Teste de Conectividade
- **Finalização**: Próximos passos

### Tratamento de Erros
- Validação de cada comando
- Mensagens específicas de erro
- Sugestões de solução
- Códigos de saída apropriados

## 🔒 Segurança

### Ambiente de Produção
- ⚠️ **Avisos especiais** antes da execução
- 🚨 **Lembretes constantes** sobre dados de produção
- 📋 **Instruções de teste** cuidadoso
- 🔍 **Verificações adicionais** de conectividade

### Ambiente de Homologação
- ✅ **Ambiente seguro** para testes
- 🧪 **Ideal para desenvolvimento** e validação
- 🔄 **Fácil alternância** de volta para produção

## 🛠️ Troubleshooting

### Script não executa
```bash
# Dar permissão de execução
chmod +x scripts/*.sh

# Verificar se está no diretório correto
pwd # Deve estar na raiz do projeto
```

### Erro de chave inválida
```bash
# Verificar chaves no Doppler
doppler secrets

# Verificar configuração do Doppler
doppler configure
```

### Erro de conexão
```bash
# Testar conectividade manualmente
curl -I https://[supabase-url].supabase.co

# Verificar se as URLs estão corretas
echo $VITE_SUPABASE_URL
```

## 📚 Documentação Adicional

- **Guia Completo**: `docs/TROCA-AMBIENTES.md`
- **Setup Local**: `docs/GUIA-SETUP-LOCAL.md`
- **Configuração Supabase**: `docs/SUPABASE-SETUP.md`

## 🔄 Fluxo Recomendado

1. **Desenvolvimento**: Use homologação
2. **Testes**: Valide em homologação
3. **Deploy**: Alterne para produção
4. **Manutenção**: Volte para homologação

---

**💡 Dica**: Sempre execute os scripts a partir da raiz do projeto para garantir que todas as configurações sejam aplicadas corretamente.