# 🔐 **Configuração de Chaves de Serviço do Supabase**

## 📋 **O que são Chaves de Serviço?**

As **Service Role Keys** do Supabase são chaves administrativas que:
- ✅ Permitem acesso completo ao banco de dados
- ✅ Ignoram políticas de RLS (Row Level Security)
- ✅ São necessárias para operações de migração
- ⚠️ **NUNCA devem ser expostas no frontend**

---

## 🎯 **PASSO 1: Obter Chaves de Serviço**

### **Para o Projeto de PRODUÇÃO:**

1. **Acesse o Dashboard do Supabase:**
   - URL: https://supabase.com/dashboard
   - Faça login na sua conta

2. **Selecione o Projeto de Produção:**
   - Projeto ID: `pwksgdjjkryqryqrvyja`
   - URL: https://pwksgdjjkryqryqrvyja.supabase.co

3. **Navegue para Settings → API:**
   - No menu lateral, clique em **"Settings"**
   - Depois clique em **"API"**

4. **Copie a Service Role Key:**
   - Procure por **"service_role"** na seção **"Project API keys"**
   - Clique no ícone de **"olho"** para revelar a chave
   - Copie a chave completa (começa com `eyJ...`)

### **Para o Projeto de HOMOLOGAÇÃO:**

1. **Selecione o Projeto de Homologação:**
   - Projeto ID: `zbiivgtdamejiwcabmcv`
   - URL: https://zbiivgtdamejiwcabmcv.supabase.co

2. **Repita os passos 3 e 4** acima para obter a Service Role Key de homologação

---

## 🔧 **PASSO 2: Configurar no Doppler**

### **2.1 Configurar Chave de Produção:**
```bash
# Substitua [SUA_CHAVE_PRODUCAO] pela chave real
doppler secrets set SUPABASE_PROD_SERVICE_KEY="[SUA_CHAVE_PRODUCAO]"
```

### **2.2 Configurar Chave de Homologação:**
```bash
# Substitua [SUA_CHAVE_HOMOLOGACAO] pela chave real
doppler secrets set SUPABASE_HOMOLOG_SERVICE_KEY="[SUA_CHAVE_HOMOLOGACAO]"
```

### **2.3 Verificar Configuração:**
```bash
# Verificar se as chaves foram configuradas
doppler secrets | grep SUPABASE.*SERVICE

# Verificar valores (primeiros caracteres)
doppler secrets get SUPABASE_PROD_SERVICE_KEY --plain | head -c 50
doppler secrets get SUPABASE_HOMOLOG_SERVICE_KEY --plain | head -c 50
```

---

## 🚀 **PASSO 3: Executar Migração**

Após configurar as chaves:

```bash
# Executar migração completa
doppler run -- ./scripts/migrate-prod-to-homolog.sh
```

---

## 🔍 **Exemplo Visual das Chaves**

### **Formato das Chaves:**
```
# Anon Key (já configurada)
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB3a3NnZGpqa3J5cXJ5cXJ2eWphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg1NjAwNDgsImV4cCI6MjA2NDEzNjA0OH0.CbqU-Gx-QglerhxQzDjK6KFAi4CRLUl90LeKvDEKtbc

# Service Role Key (precisa configurar)
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB3a3NnZGpqa3J5cXJ5cXJ2eWphIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODU2MDA0OCwiZXhwIjoyMDY0MTM2MDQ4fQ.EXEMPLO_DE_SERVICE_KEY
```

### **Diferenças:**
- **Anon Key:** `"role":"anon"` - Acesso limitado, respeita RLS
- **Service Key:** `"role":"service_role"` - Acesso administrativo completo

---

## 📱 **Onde Encontrar no Dashboard**

```
Supabase Dashboard
├── [Selecionar Projeto]
├── Settings (menu lateral)
│   └── API
│       ├── Project URL ✅ (já temos)
│       ├── Project API keys
│       │   ├── anon public ✅ (já temos)
│       │   └── service_role ⚠️ (precisamos)
│       └── JWT Settings
```

---

## 🚨 **Segurança Importante**

### ⚠️ **NUNCA:**
- Exponha service keys no frontend
- Commite service keys no Git
- Compartilhe service keys em canais inseguros
- Use service keys em aplicações client-side

### ✅ **SEMPRE:**
- Use service keys apenas em scripts server-side
- Armazene no Doppler (ambiente seguro)
- Rotacione as chaves periodicamente
- Monitore o uso das chaves

---

## 🧪 **Testar Chaves**

### **Testar Chave de Produção:**
```bash
# Testar acesso com service key
curl "https://pwksgdjjkryqryqrvyja.supabase.co/rest/v1/colaboradores?select=count" \
  -H "apikey: $(doppler secrets get SUPABASE_PROD_SERVICE_KEY --plain)" \
  -H "Authorization: Bearer $(doppler secrets get SUPABASE_PROD_SERVICE_KEY --plain)"
```

### **Testar Chave de Homologação:**
```bash
# Testar acesso com service key
curl "https://zbiivgtdamejiwcabmcv.supabase.co/rest/v1/colaboradores?select=count" \
  -H "apikey: $(doppler secrets get SUPABASE_HOMOLOG_SERVICE_KEY --plain)" \
  -H "Authorization: Bearer $(doppler secrets get SUPABASE_HOMOLOG_SERVICE_KEY --plain)"
```

---

## 📞 **Troubleshooting**

### ❌ **"Invalid API key"**
- Verifique se copiou a chave completa
- Confirme que é a **service_role** key, não a anon key
- Teste a chave diretamente no dashboard do Supabase

### ❌ **"Project not found"**
- Verifique se o projeto ID está correto
- Confirme que você tem acesso ao projeto
- Verifique se o projeto não foi pausado/deletado

### ❌ **"Unauthorized"**
- A chave pode ter expirado
- Verifique as permissões do seu usuário no projeto
- Regenere a chave se necessário

---

## ✅ **Checklist**

- [ ] **Acessei** o dashboard do Supabase
- [ ] **Obtive** a service key de produção
- [ ] **Obtive** a service key de homologação
- [ ] **Configurei** `SUPABASE_PROD_SERVICE_KEY` no Doppler
- [ ] **Configurei** `SUPABASE_HOMOLOG_SERVICE_KEY` no Doppler
- [ ] **Testei** as chaves com curl
- [ ] **Executei** o script de migração
- [ ] **Verifiquei** que a migração foi bem-sucedida

---

## 🎯 **Próximos Passos**

Após configurar as chaves:

1. ✅ **Executar migração:** `doppler run -- ./scripts/migrate-prod-to-homolog.sh`
2. ✅ **Verificar dados:** Confirmar que os dados foram copiados
3. ✅ **Configurar ambiente:** Usar homologação para desenvolvimento
4. ✅ **Testar aplicação:** Verificar se tudo funciona corretamente

**Comando para executar após configurar:**
```bash
# Migração completa
doppler run -- ./scripts/migrate-prod-to-homolog.sh

# Verificar diferenças
./scripts/diff-supabase-structure.sh

# Configurar ambiente de desenvolvimento para usar homologação
doppler secrets set VITE_SUPABASE_URL="https://zbiivgtdamejiwcabmcv.supabase.co"
doppler secrets set VITE_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpiaWl2Z3RkYW1laml3Y2FibWN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTExOTA5NTYsImV4cCI6MjA2Njc2Njk1Nn0.qrXX_H0dqN5HP3_-TQUUTyIpb_-oauRBmwj8vyaKMe4"
```