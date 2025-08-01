# 🚀 Guia de Deploy - GitHub Pages & Vercel

> **Gestão Profissional HITSS** - Deploy em múltiplas plataformas

## 📋 Visão Geral

Este projeto está configurado para deploy automático em **duas plataformas**:

- 🟢 **GitHub Pages**: `https://crashkill.github.io/gestao-profissional/`
- 🔵 **Vercel**: `https://gestao-profissional-hitss.vercel.app/`

---

## 🛠️ Configuração Inicial

### 1. GitHub Pages (✅ Já Configurado)

- ✅ Branch `gh-pages` ativa
- ✅ Workflow `.github/workflows/deploy.yml` configurado
- ✅ Script `build:gh-pages` no package.json
- ✅ Deploy automático a cada push na `main`

### 2. Vercel (🔧 Configuração Necessária)

#### Passo 1: Configurar Secrets no GitHub

Adicione os seguintes secrets no repositório GitHub:

```bash
# No GitHub: Settings > Secrets and variables > Actions
VERCEL_TOKEN=seu_token_vercel
VERCEL_ORG_ID=team_UiVpIFOXItKlFz16kwqkRhrQ
VERCEL_PROJECT_ID=prj_pnbwOem61YIKkfqByxbHOf3oUqfM
VITE_SUPABASE_URL=sua_url_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima_supabase
```

#### Passo 2: Obter Token da Vercel

1. Acesse: https://vercel.com/account/tokens
2. Crie um novo token
3. Adicione como `VERCEL_TOKEN` nos secrets do GitHub

#### Passo 3: Configurar Variáveis de Ambiente na Vercel

```bash
# Via CLI (recomendado)
npm run vercel:env

# Ou via Dashboard Vercel
# Settings > Environment Variables
VITE_SUPABASE_URL=sua_url_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima_supabase
VITE_ENVIRONMENT=production
VITE_APP_NAME="Talent Sphere Registry"
VITE_DEBUG_MODE=false
```

---

## 🚀 Comandos de Deploy

### Deploy Manual

```bash
# GitHub Pages
npm run build:gh-pages
git add dist && git commit -m "Deploy: GitHub Pages" && git push

# Vercel (produção)
npm run build:vercel
npm run vercel:deploy

# Vercel (preview)
npm run vercel:preview

# Deploy em ambas as plataformas
npm run deploy:all
```

### Deploy Automático

- **GitHub Pages**: Automático a cada push na `main`
- **Vercel**: Automático via workflow `.github/workflows/deploy-vercel.yml`

---

## 🔄 Fluxo de Trabalho

### Desenvolvimento
```bash
git checkout -b feature/nova-funcionalidade
# ... desenvolvimento ...
git push origin feature/nova-funcionalidade
# Criar PR para main
```

### Homologação
```bash
git checkout homolog
git merge main
git push origin homolog
# Deploy automático na Vercel (preview)
```

### Produção
```bash
git checkout main
git merge homolog
git push origin main
# Deploy automático em ambas as plataformas
```

---

## 📊 Status dos Deploys

| Plataforma | Status | URL | Branch |
|------------|--------|-----|--------|
| GitHub Pages | ✅ Ativo | https://crashkill.github.io/gestao-profissional/ | `gh-pages` |
| Vercel | ✅ Ativo | https://gestao-profissional.vercel.app/ | `main` |

### 🎉 URLs de Produção Ativas

- **GitHub Pages**: https://crashkill.github.io/gestao-profissional/
- **Vercel**: https://gestao-profissional.vercel.app/
- **Vercel (alternativa)**: https://gestao-profissional-crashkills-projects.vercel.app/

---

## 🔧 Troubleshooting

### GitHub Pages

```bash
# Verificar status da branch gh-pages
git checkout gh-pages
git log --oneline -5

# Forçar rebuild
git checkout main
npm run build:gh-pages
git add dist && git commit -m "Force rebuild" && git push
```

### Vercel

```bash
# Verificar configuração
vercel --version
vercel whoami
vercel ls

# Debug do build
npm run build:vercel
vercel deploy --debug

# Verificar logs
vercel logs gestao-profissional-hitss
```

### Problemas Comuns

1. **Build falha**: Verificar variáveis de ambiente
2. **404 na Vercel**: Verificar `vercel.json` e rotas SPA
3. **Supabase não conecta**: Verificar CORS e variáveis

---

## 🔐 Segurança

### Variáveis Sensíveis

- ✅ Usar **Doppler** para desenvolvimento local
- ✅ Usar **GitHub Secrets** para CI/CD
- ✅ Usar **Vercel Environment Variables** para produção
- ❌ **NUNCA** commitar `.env` com dados reais

### Headers de Segurança

Configurados no `vercel.json`:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Content-Security-Policy`

---

## 📈 Monitoramento

### GitHub Pages
- Status: GitHub Actions tab
- Logs: Workflow runs
- Métricas: GitHub Insights

### Vercel
- Dashboard: https://vercel.com/dashboard
- Analytics: Vercel Analytics
- Logs: `vercel logs`

---

## 🎯 Próximos Passos

1. [x] ~~Configurar secrets da Vercel no GitHub~~ ✅ Concluído
2. [x] ~~Testar deploy na Vercel~~ ✅ Concluído
3. [ ] Configurar variáveis de ambiente do Supabase na Vercel
4. [ ] Configurar domínio customizado (opcional)
5. [ ] Configurar Vercel Analytics
6. [ ] Configurar alertas de deploy
7. [ ] Otimizar bundle size (chunks > 500KB)

---

## 📞 Suporte

Em caso de problemas:

1. Verificar logs dos workflows
2. Consultar documentação oficial:
   - [GitHub Pages](https://docs.github.com/pages)
   - [Vercel](https://vercel.com/docs)
3. Verificar status das plataformas:
   - [GitHub Status](https://www.githubstatus.com/)
   - [Vercel Status](https://vercel-status.com/)

---

*Última atualização: $(date)*