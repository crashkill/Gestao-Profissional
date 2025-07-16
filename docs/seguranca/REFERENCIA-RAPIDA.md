# Referência Rápida - Funções de Segurança

Este documento serve como uma referência rápida para as principais funções de segurança implementadas no sistema Talent Sphere.

## Índice

1. [Auditoria e Logs](#auditoria-e-logs)
2. [Gerenciamento de Acesso](#gerenciamento-de-acesso)
3. [Backup e Recuperação](#backup-e-recuperação)
4. [Monitoramento](#monitoramento)
5. [Segurança do Banco de Dados](#segurança-do-banco-de-dados)
6. [Rotação de Logs](#rotação-de-logs)

## Auditoria e Logs

### `audit_logs` (Tabela)
Registra eventos de segurança e alterações nos dados.

**Colunas Principais:**
- `id`: Identificador único
- `user_id`: ID do usuário que realizou a ação
- `action`: Tipo de ação (ex: 'INSERT', 'UPDATE', 'DELETE')
- `table_name`: Tabela afetada
- `record_id`: ID do registro afetado
- `old_data`: Dados anteriores (para UPDATE/DELETE)
- `new_data`: Novos dados (para INSERT/UPDATE)
- `ip_address`: Endereço IP de origem
- `user_agent`: Navegador/agente do usuário
- `created_at`: Data/hora do evento

### `log_audit_event()` (Função)
Função de trigger para registrar automaticamente alterações nas tabelas monitoradas.

**Uso em Triggers:**
```sql
CREATE TRIGGER audit_table_name
AFTER INSERT OR UPDATE OR DELETE ON table_name
FOR EACH ROW EXECUTE FUNCTION log_audit_event();
```

## Gerenciamento de Acesso

### `create_api_key(nome, descrição, escopos, dias_para_expirar)`
Cria uma nova chave de API.

**Parâmetros:**
- `nome`: Nome descritivo da chave
- `descrição`: Descrição detalhada do uso
- `escopos`: Array de permissões (ex: `ARRAY['read:users', 'write:profile']`)
- `dias_para_expirar`: Validade da chave em dias

**Exemplo:**
```sql
SELECT create_api_key(
    'Integração Mobile',
    'Usada pelo aplicativo móvel',
    ARRAY['read:profile', 'update:profile'],
    90
);
```

### `validate_api_key(chave, escopo_necessario)`
Valida uma chave de API.

**Retorno:** `true` se válida, `false` caso contrário

**Exemplo:**
```sql
SELECT validate_api_key('chave-secreta', 'read:profile');
```

## Backup e Recuperação

### `create_backup(nome, descrição, tipo)`
Cria um backup manual do banco de dados.

**Parâmetros:**
- `nome`: Nome descritivo do backup
- `descrição`: Detalhes sobre o backup
- `tipo`: 'full', 'differential' ou 'incremental'

**Exemplo:**
```sql
SELECT create_backup(
    'backup-pre-atualizacao',
    'Backup antes da atualização da v1.2.0',
    'full'
);
```

### `list_backups(limite, deslocamento)`
Lista os backups disponíveis.

**Exemplo:**
```sql
-- Listar os 10 backups mais recentes
SELECT * FROM list_backups(10, 0);
```

## Monitoramento

### `check_security_compliance()`
Verifica a conformidade com as políticas de segurança.

**Retorno:** JSON com resultados da verificação

**Exemplo:**
```sql
SELECT * FROM check_security_compliance();
```

### `generate_security_report()`
Gera um relatório detalhado de segurança em formato HTML.

**Exemplo:**
```sql
-- Salve o resultado em um arquivo HTML
COPY (
    SELECT generate_security_report()
) TO '/caminho/para/relatorio.html';
```

## Segurança do Banco de Dados

### `apply_security_updates()`
Aplica atualizações de segurança pendentes.

**Exemplo:**
```sql
SELECT * FROM apply_security_updates();
```

### `security_report` (Visão)
Visão que mostra o status de segurança atual.

**Colunas Principais:**
- `tables`: Lista de tabelas e suas políticas
- `tables_without_rls`: Tabelas sem RLS habilitado
- `audit_logs_summary`: Estatísticas de logs de auditoria

**Exemplo:**
```sql
SELECT * FROM security_report;
```

## Rotação de Logs

### `rotate_logs(tipo_log)`
Executa a rotação de logs para o tipo especificado.

**Exemplo:**
```sql
-- Rodar rotação para logs de auditoria
SELECT * FROM rotate_logs('audit_logs');
```

### `get_log_rotation_status(limite, deslocamento)`
Mostra o status das rotações de log.

**Exemplo:**
```sql
-- Mostrar as 5 últimas rotações
SELECT * FROM get_log_rotation_status(5, 0);
```

## Funções Úteis para Desenvolvimento

### `is_admin()`
Verifica se o usuário atual é administrador.

**Exemplo:**
```sql
SELECT is_admin();
```

### `current_user_has_role(papel)`
Verifica se o usuário atual tem um papel específico.

**Exemplo:**
```sql
-- Verificar se o usuário é gerente
SELECT current_user_has_role('gerente');
```

---

**Última Atualização:** 15/07/2025  
**Responsável:** Equipe de Segurança
