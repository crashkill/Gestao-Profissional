# Migração para Doppler

## Variáveis Migradas

| Variável | Status | Descrição |
|----------|--------|-----------|
| `VITE_SUPABASE_URL` | ✅ Migrada | URL do projeto Supabase |
| `VITE_SUPABASE_ANON_KEY` | ✅ Migrada | Chave anônima do Supabase |

## Exemplo de Configuração

```bash
VITE_SUPABASE_URL=[URL_SUPABASE]
VITE_SUPABASE_ANON_KEY=[CHAVE_SUPABASE]
```

## Comandos Doppler

```bash
doppler secrets set VITE_SUPABASE_URL="[URL_SUPABASE]"
doppler secrets set VITE_SUPABASE_ANON_KEY="[CHAVE_SUPABASE]"
``` 