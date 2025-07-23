#!/bin/bash

# Script para automatizar o commit e push para GitHub e GitLab
# Autor: Fabricio Cardoso de Lima
# Data: Criado automaticamente

set -e  # Parar em caso de erro

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para exibir mensagens coloridas
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Verificar se git está instalado
if ! command -v git &> /dev/null; then
    print_error "Git não está instalado!"
    exit 1
fi

print_status "Git encontrado"

# Verificar se estamos em um repositório git
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    print_error "Este não é um repositório Git!"
    exit 1
fi

print_status "Repositório Git válido"

# Verificar status do git
print_info "Verificando status do Git..."
git status

# Perguntar pela mensagem de commit
echo
read -p "Digite a mensagem de commit: " commit_message

if [ -z "$commit_message" ]; then
    commit_message="chore: atualização automática $(date +"%d/%m/%Y %H:%M")"
    print_warning "Usando mensagem de commit padrão: $commit_message"
fi

# Adicionar todos os arquivos
print_info "Adicionando arquivos..."
git add .

# Fazer commit
print_info "Fazendo commit..."
git commit -m "$commit_message"

# Push para GitHub
print_info "Enviando para GitHub..."
git push origin main

# Verificar se o remote do GitLab existe
if git remote | grep -q "gitlab"; then
    print_info "Remote do GitLab encontrado"
    
    # Push para GitLab
    print_info "Enviando para GitLab..."
    git push gitlab main
else
    print_warning "Remote do GitLab não encontrado. Deseja configurar? (s/n)"
    read -p "" setup_gitlab
    
    if [[ $setup_gitlab =~ ^[Ss]$ ]]; then
        print_info "Executando script de setup do GitLab..."
        bash ./gitlab-setup.sh
    else
        print_info "Pulando configuração do GitLab"
    fi
fi

print_status "Processo de commit e push concluído com sucesso!"
print_info "Verificando status das Actions no GitHub: https://github.com/crashkill/gestao-profissional/actions"