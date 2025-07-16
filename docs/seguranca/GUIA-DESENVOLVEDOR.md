# Guia do Desenvolvedor - Segurança do Talent Sphere

Este guia fornece orientações detalhadas para desenvolvedores trabalharem com o sistema de segurança do Talent Sphere.

## Índice

1. [Configuração do Ambiente](#configuração-do-ambiente)
2. [Autenticação e Autorização](#autenticação-e-autorização-1)
3. [Trabalhando com RLS](#trabalhando-com-rls)
4. [Implementando Auditoria](#implementando-auditoria)
5. [Usando Chaves de API](#usando-chaves-de-api)
6. [Boas Práticas de Segurança](#boas-práticas-de-segurança)
7. [Solução de Problemas](#solução-de-problemas)
8. [Referências](#referências)

## Configuração do Ambiente

### Pré-requisitos

- Node.js 16+
- PostgreSQL 14+
- Supabase CLI

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
# Configurações do Supabase
VITE_SUPABASE_URL=seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon
VITE_SUPABASE_SERVICE_ROLE_KEY=sua-chave-service-role  # Apenas para ambientes de desenvolvimento

# Configurações de Segurança
ENABLE_SECURITY_LOGS=true
API_RATE_LIMIT=100
```

## Autenticação e Autorização

### Autenticação de Usuário

```javascript
import { supabase } from '@/lib/supabaseClient';

// Login
async function login(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) throw error;
  return data;
}

// Verificar sessão
async function checkSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}
```

### Controle de Acesso Baseado em Funções (RBAC)

```javascript
// Verificar função do usuário
function hasRole(user, requiredRole) {
  return user?.user_metadata?.roles?.includes(requiredRole) || false;
}

// Uso no componente
const user = supabase.auth.user();
if (hasRole(user, 'admin')) {
  // Renderizar conteúdo administrativo
}
```

## Trabalhando com RLS

### Consultas Seguras

Sempre use o cliente Supabase autenticado:

```javascript
// Bom - Usa RLS
const { data, error } = await supabase
  .from('colaboradores')
  .select('*');

// Ruim - Ignora RLS
const { data, error } = await supabase.rpc('function_that_bypasses_rls');
```

### Criando Novas Políticas

1. Crie um arquivo de migração:

```bash
supabase migration new add_policies_for_nova_tabela
```

2. Adicione as políticas no arquivo de migração:

```sql
-- Habilita RLS
ALTER TABLE nova_tabela ENABLE ROW LEVEL SECURITY;

-- Permite leitura para usuários autenticados
CREATE POLICY "Permitir leitura para usuários autenticados"
ON public.nova_tabela
FOR SELECT
TO authenticated
USING (true);

-- Permite escrita apenas para administradores
CREATE POLICY "Permitir escrita para administradores"
ON public.nova_tabela
FOR ALL
TO authenticated
USING (auth.jwt() ->> 'role' = 'service_role');
```

## Implementando Auditoria

### Log de Eventos Personalizados

```javascript
async function logEvent(eventType, entity, entityId, details = {}) {
  const { data: { user } } = await supabase.auth.getUser();
  
  const { error } = await supabase
    .from('audit_logs')
    .insert([
      {
        event_type: eventType,
        entity_type: entity,
        entity_id: entityId,
        user_id: user?.id || null,
        ip_address: getClientIp(), // Implemente esta função
        user_agent: navigator.userAgent,
        details: details
      }
    ]);
    
  if (error) {
    console.error('Erro ao registrar evento de auditoria:', error);
  }
}

// Uso
try {
  await updateUserProfile(profileData);
  await logEvent('profile_update', 'user_profile', userId, {
    fields_updated: Object.keys(profileData)
  });
} catch (error) {
  await logEvent('profile_update_failed', 'user_profile', userId, {
    error: error.message,
    fields_attempted: Object.keys(profileData)
  });
  throw error;
}
```

## Usando Chaves de API

### Criando uma Chave de API

```sql
-- No banco de dados
SELECT create_api_key(
  'Integração Externa',
  'Usada para integração com o sistema de RH',
  ARRAY['read:colaboradores', 'read:departamentos'],
  180  -- Expira em 180 dias
);
```

### Validando uma Chave de API

```javascript
// Middleware de autenticação
async function apiKeyAuth(req, res, next) {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey) {
    return res.status(401).json({ error: 'Chave de API não fornecida' });
  }
  
  const { data, error } = await supabase.rpc('validate_api_key', {
    p_api_key: apiKey,
    p_required_scope: 'read:colaboradores'  // Escopo necessário para esta rota
  });
  
  if (error || !data) {
    return res.status(403).json({ error: 'Chave de API inválida ou sem permissão' });
  }
  
  req.apiKey = data;
  next();
}
```

## Boas Práticas de Segurança

### Frontend

1. **Nunca exponha chaves sensíveis** no código do cliente
2. **Valide todas as entradas** do usuário
3. **Use HTTPS** em todas as requisições
4. **Implemente CSRF tokens** para formulários
5. **Use Content Security Policy (CSP)**

### Backend

1. **Sempre valide entradas** mesmo com RLS
2. **Use parâmetros preparados** para evitar injeção SQL
3. **Limite as taxas de requisição**
4. **Registre atividades suspeitas**
5. **Atualize dependências** regularmente

### Banco de Dados

1. **Siga o princípio do menor privilégio**
2. **Revise regularmente** as políticas de segurança
3. **Monitore consultas lentas**
4. **Faça backups regulares**
5. **Mantenha o sistema atualizado**

## Solução de Problemas

### Problema: Erro de Permissão

**Sintoma:** `permission denied for table X`

**Solução:**
1. Verifique se o RLS está habilitado na tabela
2. Confira se existem políticas que permitem a operação
3. Verifique o papel do usuário atual

```sql
-- Verificar RLS
SELECT relname, relrowsecurity 
FROM pg_class 
WHERE relname = 'nome_da_tabela';

-- Listar políticas
SELECT * FROM pg_policies 
WHERE tablename = 'nome_da_tabela';
```

### Problema: Consulta Lenta

**Solução:**
1. Use `EXPLAIN ANALYZE` para identificar gargalos
2. Adicione índices quando necessário
3. Considere particionamento para tabelas grandes

### Problema: Vazamento de Dados

**Ações Imediatas:**
1. Revogue as credenciais comprometidas
2. Revise os logs de acesso
3. Notifique os usuários afetados
4. Atualize as chaves de API

## Referências

- [Documentação do Supabase](https://supabase.com/docs)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Guia de Segurança do PostgreSQL](https://www.postgresql.org/docs/current/static/monitoring.html)
- [Boas Práticas de Segurança em Aplicações Web](https://cheatsheetseries.owasp.org/)

---

**Última Atualização:** 15/07/2025  
**Responsável:** Equipe de Desenvolvimento  
**Contato:** dev@talentsphere.com.br
