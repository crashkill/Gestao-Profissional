# 🦊 GitLab Setup - Gestão Profissional HITSS

## 📋 **Resumo**

Guia para configuração e deploy do projeto "Gestão Profissional" no GitLab da GlobalHitss.

---

## 🔧 **Configuração do Projeto**

### **Informações do Projeto:**
- **Nome:** Gestão Profissional
- **Descrição:** Sistema de gestão de profissionais de TI para HITSS (Grupo Telefônica)
- **Visibilidade:** Private (Empresa)
- **Tecnologias:** React 18 + TypeScript + Vite + Supabase

---

## 🚀 **Instruções de Deploy**

### **1. Setup Automatizado (Recomendado):**
```bash
# Executar script de configuração
./gitlab-setup.sh
```

### **2. Setup Manual:**
```bash
# Adicionar remote do GitLab
git remote add gitlab https://gitlab.globalhitss.com/ti/gestao-profissional.git

# Push para GitLab
git push gitlab main
```

### **3. Criar Projeto no GitLab:**
1. Acesse: https://gitlab.globalhitss.com
2. Clique em "New Project" > "Create blank project"
3. **Project name:** Gestão Profissional
4. **Project slug:** gestao-profissional
5. **Visibility:** Private
6. **Initialize repository:** Desmarcar (já temos código)
7. Clique em "Create project"

### **2. Configurar CI/CD (GitLab CI):**
```yaml
# .gitlab-ci.yml
stages:
  - build
  - deploy

variables:
  NODE_VERSION: "18"

build:
  stage: build
  image: node:$NODE_VERSION
  script:
    - npm ci
    - npm run doppler:build
  artifacts:
    paths:
      - dist/
    expire_in: 1 hour

deploy:
  stage: deploy
  image: node:$NODE_VERSION
  script:
    - echo "Deploy para ambiente de produção"
  only:
    - main
```

### **4. Configurar Variáveis de Ambiente:**

**No GitLab (Settings > CI/CD > Variables):**

| Variável | Valor | Tipo | Status |
|----------|-------|------|--------|
| `VITE_SUPABASE_URL` | `[URL_SUPABASE]` | Variable | ✅ |
| `VITE_SUPABASE_ANON_KEY` | `[CHAVE_SUPABASE]` | Variable | ✅ |

**Passos para adicionar:**
1. Acesse: Projeto > Settings > CI/CD
2. Expand "Variables"
3. Clique "Add variable"
4. Preencha Key, Value
5. Marque "Protect variable" para variáveis sensíveis
6. Clique "Add variable"

---

## 📊 **Status do Projeto**

- ✅ **Código fonte:** Completo e funcional
- ✅ **Documentação:** Completa
- ✅ **Conectividade:** Supabase com proxy
- ✅ **Segurança:** Doppler configurado
- ✅ **115 profissionais:** Dados reais carregados

---

## 🔗 **Links Importantes**

- **GitHub:** https://github.com/crashkill/gestao-profissionais
- **GitLab:** (será adicionado após criação)
- **Aplicação:** http://localhost:8080
- **Supabase:** https://pwksgdjjkryqryqrvyja.supabase.co

---

## 📞 **Contato**

Para dúvidas sobre o projeto GitLab:
1. Verificar documentação completa
2. Consultar logs do CI/CD
3. Verificar variáveis de ambiente
4. Contatar equipe de DevOps HITSS 