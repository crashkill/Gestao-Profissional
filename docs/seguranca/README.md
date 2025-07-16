# Documentação de Segurança - Talent Sphere

Este documento fornece uma visão abrangente das medidas de segurança implementadas no sistema Talent Sphere, incluindo políticas de acesso, auditoria, monitoramento e procedimentos de backup.

## Índice

1. [Visão Geral do Sistema de Segurança](#visão-geral-do-sistema-de-segurança)
2. [Autenticação e Autorização](#autenticação-e-autorização)
3. [Políticas de Segurança do Banco de Dados](#políticas-de-segurança-do-banco-de-dados)
4. [Auditoria e Logs](#auditoria-e-logs)
5. [Gerenciamento de Chaves de API](#gerenciamento-de-chaves-de-api)
6. [Monitoramento de Recursos](#monitoramento-de-recursos)
7. [Backup e Recuperação](#backup-e-recuperação)
8. [Atualizações de Segurança](#atualizações-de-segurança)
9. [Rotação de Logs](#rotação-de-logs)
10. [Procedimentos de Emergência](#procedimentos-de-emergência)
11. [Glossário de Termos Técnicos](#glossário-de-termos-técnicos)

## Visão Geral do Sistema de Segurança

O sistema de segurança do Talent Sphere foi projetado seguindo as melhores práticas de segurança da informação, incluindo o princípio do menor privilégio, defesa em profundidade e registro abrangente de atividades.

### Componentes Principais

- **Row Level Security (RLS)**: Controle de acesso em nível de linha para todas as tabelas sensíveis
- **Auditoria Completa**: Registro detalhado de todas as operações críticas
- **Monitoramento em Tempo Real**: Acompanhamento de desempenho e detecção de anomalias
- **Backup Automatizado**: Sistema de backup regular e verificável
- **Gerenciamento de Acesso**: Controle rigoroso sobre permissões e chaves de API

## Autenticação e Autorização

### Fluxo de Autenticação

1. Os usuários se autenticam usando JWT (JSON Web Tokens)
2. Cada token contém:
   - ID do usuário
   - Papéis (roles)
   - Data de expiração
   - Outras claims personalizadas

### Níveis de Acesso

- **service_role**: Acesso total ao sistema (apenas para administradores)
- **authenticated**: Usuários autenticados com permissões limitadas
- **anonymous**: Acesso não autenticado (apenas para endpoints públicos)

## Políticas de Segurança do Banco de Dados

### Row Level Security (RLS)

Todas as tabelas sensíveis têm RLS habilitado com políticas específicas:

- `colaboradores`: Acesso restrito com base no departamento/equipe
- `professional_profiles`: Acesso baseado em propriedade (cada usuário vê apenas seu próprio perfil)
- `dre_hitss`: Acesso restrito a administradores
- `skills`: Leitura pública, escrita restrita

### Políticas de Acesso

Cada política é documentada no banco de dados e pode ser consultada usando a função `security_report()`.

## Auditoria e Logs

### Tabela de Auditoria

A tabela `audit_logs` registra todas as operações críticas, incluindo:
- Criação, atualização e exclusão de registros
- Acessos de usuários
- Alterações de configuração
- Eventos de segurança

### Consultando Logs

```sql
-- Ver os últimos 100 eventos de auditoria
SELECT * FROM audit_logs 
ORDER BY created_at DESC 
LIMIT 100;
```

## Gerenciamento de Chaves de API

### Criando uma Nova Chave

```sql
SELECT create_api_key(
    'Aplicação Móvel',
    'Chave para o aplicativo móvel da equipe de vendas',
    ARRAY['read:profile', 'update:profile'],
    90  -- Expira em 90 dias
);
```

### Boas Práticas

1. Nunca armazene chaves de API no código-fonte
2. Use escopos específicos para cada chave
3. Revogue chaves não utilizadas
4. Monitore o uso das chaves regularmente

## Monitoramento de Recursos

### Métricas Coletadas

- Uso de CPU e memória
- Número de conexões ativas
- Consultas lentas
- Uso de armazenamento

### Consultando Métricas

```sql
-- Obter estatísticas de uso de recursos
SELECT * FROM get_resource_usage_stats('7 days', '1 hour');
```

## Backup e Recuperação

### Política de Backup

- Backups completos diários
- Retenção de 30 dias
- Verificação mensal de restauração

### Criando um Backup Manual

```sql
SELECT create_backup('backup-pre-atualizacao', 'Backup antes da atualização do sistema', 'full');
```

### Listando Backups

```sql
SELECT * FROM list_backups(10, 0);
```

## Atualizações de Segurança

### Verificando Atualizações

```sql
SELECT * FROM check_security_updates();
```

### Aplicando Atualizações

```sql
SELECT * FROM apply_security_updates();
```

## Rotação de Logs

### Configuração

A rotação de logs é configurada na tabela `log_rotation_config`.

### Executando Rotação Manual

```sql
SELECT * FROM rotate_logs('audit_logs');
```

### Verificando Status

```sql
SELECT * FROM get_log_rotation_status(10, 0);
```

## Procedimentos de Emergência

### Vazamento de Credenciais

1. Revogue imediatamente as credenciais comprometidas
2. Gere novas chaves de API
3. Revise os logs de acesso das credenciais vazadas
4. Notifique os usuários afetados

### Recuperação de Desastres

1. Identifique o ponto de recuperação mais recente
2. Restaure o banco de dados a partir do backup
3. Aplique os logs de transações (se aplicável)
4. Verifique a integridade dos dados
5. Notifique as partes interessadas

## Glossário de Termos Técnicos

- **RLS (Row Level Security)**: Mecanismo de segurança que restringe o acesso a linhas em uma tabela de banco de dados
- **JWT (JSON Web Token)**: Padrão para criação de tokens de acesso que são assinados digitalmente
- **RBAC (Role-Based Access Control)**: Controle de acesso baseado em funções
- **TLS (Transport Layer Security)**: Protocolo de segurança que protege a comunicação entre cliente e servidor
- **HMAC (Hash-based Message Authentication Code)**: Código de autenticação de mensagem baseado em hash

---

**Última Atualização:** 15/07/2025  
**Responsável:** Equipe de Segurança da Informação  
**Contato:** segurança@talentsphere.com.br
