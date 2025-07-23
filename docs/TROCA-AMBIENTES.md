# Guia de Troca de Ambientes

Este documento explica como alternar entre os ambientes de produção e homologação do Supabase.

## 🔑 Chaves Configuradas no Doppler

### Produção
- **URL**: `https://pwksgdjjkryqryqrvyja.supabase.co`
- **Chave Anônima**: `VITE_SUPABASE_ANON_KEY`
- **Chave de Serviço**: `SUPABASE_SERVICE_ROLE_KEY`

### Homologação
- **URL**: `https://zbiivgtdamejiwcabmcv.supabase.co`
- **Chave Anônima**: `VITE_SUPABASE_ANON_KEY_HOMOLOG`
- **Chave de Serviço**: `SUPABASE_SERVICE_ROLE_KEY_HOMOLOG`

## 🚀 Scripts de Troca de Ambiente

### Para Alternar para Homologação
```bash
./scripts/switch-to-homolog.sh
```

**Características:**
- Script totalmente documentado com comentários explicativos
- Validação de cada etapa com mensagens de erro detalhadas
- Teste automático de conectividade
- Instruções claras de próximos passos

Este script:
- Configura a URL para homologação
- Altera a chave anônima para homologação
- Testa a conexão
- Exibe instruções para reiniciar o servidor

### Para Alternar para Produção
```bash
./scripts/switch-to-production.sh
```

**Características:**
- Script totalmente documentado com comentários explicativos
- Avisos de segurança para ambiente de produção
- Validação de cada etapa com mensagens de erro detalhadas
- Teste automático de conectividade
- Instruções claras de próximos passos
- Alertas especiais sobre responsabilidade com dados de produção

Este script:
- Configura a URL para produção
- Altera a chave anônima para produção
- Testa a conexão
- Exibe instruções para reiniciar o servidor

## 🔄 Processo Completo de Troca

1. **Parar o servidor atual** (se estiver rodando):
   ```bash
   # Pressione Ctrl+C no terminal do servidor
   ```

2. **Executar o script de troca**:
   ```bash
   # Para homologação
   ./scripts/switch-to-homolog.sh
   
   # OU para produção
   ./scripts/switch-to-production.sh
   ```

3. **Reiniciar o servidor**:
   ```bash
   doppler run -- npx vite
   ```

## 📊 Verificação do Ambiente Atual

Para verificar qual ambiente está configurado:

```bash
# Ver todas as configurações
doppler secrets

# Ver apenas a URL atual
doppler secrets get VITE_SUPABASE_URL --plain

# Testar conexão
curl -X GET "$(doppler secrets get VITE_SUPABASE_URL --plain)/rest/v1/colaboradores?select=count" \
  -H "apikey: $(doppler secrets get VITE_SUPABASE_ANON_KEY --plain)" \
  -H "Authorization: Bearer $(doppler secrets get VITE_SUPABASE_ANON_KEY --plain)"
```

## ⚠️ Importantes Considerações

1. **Sempre reinicie o servidor** após trocar de ambiente
2. **Verifique a conexão** antes de começar a trabalhar
3. **Homologação pode ter estrutura incompleta** - use para testes específicos
4. **Produção contém dados reais** - tenha cuidado ao fazer alterações

## 📋 Estrutura de Documentação dos Scripts

Cada script possui documentação completa incluindo:

### Cabeçalho Informativo
- **Descrição**: Propósito e funcionalidade do script
- **Autor**: Sistema de Gestão Profissional
- **Versão**: Controle de versão do script
- **Pré-requisitos**: Dependências necessárias
- **Uso**: Comando de execução
- **Variáveis**: Lista de variáveis configuradas
- **Pós-execução**: Instruções após execução

### Comentários por Etapa
- **Etapa 1**: Configuração da URL do Supabase
- **Etapa 2**: Configuração da Chave Anônima
- **Etapa 3**: Teste de Conectividade
- **Finalização**: Próximos passos e instruções

### Tratamento de Erros
- Validação de cada comando executado
- Mensagens de erro específicas e informativas
- Sugestões de solução para problemas comuns
- Códigos de saída apropriados

### Avisos de Segurança
- Alertas especiais para ambiente de produção
- Lembretes sobre responsabilidade com dados
- Instruções de teste cuidadoso

## 🛠️ Troubleshooting

### Erro de API Key Inválida
- Verifique se as chaves estão corretas no Doppler
- Confirme se o ambiente foi trocado corretamente
- Reinicie o servidor
- Execute `doppler secrets` para listar todas as chaves

### Erro de Conexão
- Verifique a conectividade com a internet
- Confirme se a URL do Supabase está correta
- Teste a conexão manualmente com curl

### Scripts não executam
- Verifique se têm permissão de execução: `chmod +x scripts/*.sh`
- Execute a partir da raiz do projeto
- Confirme se está executando do diretório raiz do projeto
- Verifique se o shebang está correto: `#!/bin/bash`

## 📝 Logs e Monitoramento

Os scripts exibem logs detalhados durante a execução:
- ✅ Sucesso nas operações
- ❌ Erros encontrados
- 🧪 Resultados dos testes de conexão
- 💡 Próximos passos recomendados