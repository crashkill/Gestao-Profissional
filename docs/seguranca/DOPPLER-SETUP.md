# Configuração do Doppler para Gerenciamento de Segredos

## Introdução

Este documento descreve como configurar e utilizar o Doppler CLI para gerenciar segredos e variáveis de ambiente de forma segura no projeto. O Doppler é uma ferramenta que permite armazenar e gerenciar segredos de forma centralizada, evitando a exposição de dados sensíveis em arquivos de configuração ou repositórios.

## Pré-requisitos

- Node.js 16.x ou superior
- npm 7.x ou superior
- Acesso à internet
- Conta no Doppler (https://doppler.com)

## Instalação do Doppler CLI

### macOS

```bash
brew install dopplerhq/cli/doppler
```

### Linux (Debian/Ubuntu)

```bash
curl -sLf --retry 3 --tlsv1.2 --proto "=https" 'https://packages.doppler.com/public/cli/gpg.DE2A7741A397C129.key' | sudo apt-key add -
echo "deb https://packages.doppler.com/public/cli/deb/debian any-version main" | sudo tee /etc/apt/sources.list.d/doppler-cli.list
sudo apt-get update && sudo apt-get install doppler
```

### Windows

```bash
# Usando scoop
scoop bucket add doppler https://github.com/DopplerHQ/scoop-doppler.git
scoop install doppler
```

Para outras opções de instalação, consulte a [documentação oficial do Doppler](https://docs.doppler.com/docs/cli).

## Configuração Inicial

1. Faça login no Doppler:

```bash
doppler login
```

2. Execute o script de configuração do projeto:

```bash
npm run doppler:setup
```

Este script irá:
- Verificar se o Doppler está instalado
- Criar um projeto no Doppler (se não existir)
- Configurar o ambiente de desenvolvimento
- Migrar variáveis existentes do arquivo .env (se houver)
- Configurar variáveis padrão

3. Verifique se a configuração foi bem-sucedida:

```bash
npm run doppler:verify
```

## Estrutura de Ambientes

O projeto utiliza três ambientes principais:

1. **Desenvolvimento (dev)**: Ambiente local para desenvolvimento
2. **Homologação (homologacao)**: Ambiente para testes e validação
3. **Produção (production)**: Ambiente final para usuários

Cada ambiente possui sua própria configuração no Doppler.

## Comandos Úteis

### Verificar instalação e configuração

```bash
npm run doppler:verify
```

### Configurar o projeto

```bash
npm run doppler:setup
```

### Acessar o dashboard do Doppler

```bash
npm run doppler:dashboard
```

### Listar segredos configurados

```bash
npm run doppler:secrets
```

### Executar comandos com variáveis do Doppler

```bash
npm run doppler:run -- <comando>
```

### Executar o projeto com Doppler

```bash
npm run dev
```

### Fazer build com Doppler

```bash
npm run doppler:build
```

## Integração com CI/CD

### GitHub Actions

Para integrar o Doppler com GitHub Actions, adicione o seguinte ao seu workflow:

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Install Doppler CLI
        run: |
          curl -sLf --retry 3 --tlsv1.2 --proto "=https" 'https://packages.doppler.com/public/cli/gpg.DE2A7741A397C129.key' | sudo apt-key add -
          echo "deb https://packages.doppler.com/public/cli/deb/debian any-version main" | sudo tee /etc/apt/sources.list.d/doppler-cli.list
          sudo apt-get update && sudo apt-get install doppler
      
      - name: Build with Doppler
        run: doppler run --token=${{ secrets.DOPPLER_TOKEN }} -- npm run build
```

### GitLab CI

Para integrar o Doppler com GitLab CI, adicione o seguinte ao seu `.gitlab-ci.yml`:

```yaml
build:
  stage: build
  script:
    - curl -sLf --retry 3 --tlsv1.2 --proto "=https" 'https://packages.doppler.com/public/cli/gpg.DE2A7741A397C129.key' | apt-key add -
    - echo "deb https://packages.doppler.com/public/cli/deb/debian any-version main" | tee /etc/apt/sources.list.d/doppler-cli.list
    - apt-get update && apt-get install doppler
    - doppler run --token=$DOPPLER_TOKEN -- npm run build
  variables:
    DOPPLER_TOKEN: $DOPPLER_TOKEN
```

## Boas Práticas

1. **Nunca armazene segredos em arquivos de configuração**: Use o Doppler para gerenciar todos os segredos.

2. **Não comite arquivos .env**: Adicione todos os arquivos .env* ao .gitignore.

3. **Use tokens de serviço para CI/CD**: Crie tokens específicos para cada pipeline de CI/CD.

4. **Rotacione segredos regularmente**: Atualize segredos e tokens periodicamente.

5. **Limite o acesso**: Conceda acesso apenas aos membros da equipe que precisam.

6. **Monitore alterações**: Verifique regularmente o histórico de alterações no Doppler.

## Troubleshooting

### Erro de autenticação

Se você encontrar erros de autenticação, tente:

```bash
doppler login
```

### Erro de configuração

Se o Doppler não estiver configurado corretamente:

```bash
doppler setup
```

### Variáveis não disponíveis

Se as variáveis não estiverem disponíveis no ambiente:

```bash
doppler run -- env | grep VITE_
```

## Referências

- [Documentação oficial do Doppler](https://docs.doppler.com/)
- [Doppler CLI Reference](https://docs.doppler.com/docs/cli)
- [Integração com CI/CD](https://docs.doppler.com/docs/ci-cd-integrations)