# 🚀 GUIA RÁPIDO DE DEPLOY

## ⚡ RESUMO EXECUTIVO

Seu projeto está **100% pronto** para GitHub + Cloudflare Pages!

**Tempo total:** 10 minutos  
**Custo:** R$ 0,00 (gratuito)

---

## 📦 PASSO 1: ENVIAR PARA O GITHUB (3 minutos)

### Opção A - Linha de Comando (Recomendado)

1. **Configurar Git** (primeira vez):
```bash
cd /home/user/webapp
git config --global user.name "Seu Nome"
git config --global user.email "seu@email.com"
```

2. **Adicionar remote do repositório**:
```bash
git remote add origin https://github.com/playsurf001/Planejamento.git
```

3. **Fazer push**:
```bash
git push -u origin main
```

Quando pedir senha, use um **Personal Access Token**:
- Crie em: https://github.com/settings/tokens
- Clique: "Generate new token (classic)"
- Marque: `repo` e `workflow`
- Copie o token (guarde em local seguro)
- Use como senha no `git push`

### Opção B - GitHub Desktop (Visual)

1. Baixe: https://desktop.github.com/
2. Instale e faça login
3. File → Add Local Repository
4. Selecione: `/home/user/webapp`
5. Publish repository

### Opção C - VS Code (Integrado)

1. Abra VS Code na pasta `/home/user/webapp`
2. Source Control (Ctrl+Shift+G)
3. Clique em "Publish to GitHub"
4. Faça login quando solicitar
5. Selecione: Public ou Private

---

## ☁️ PASSO 2: DEPLOY NO CLOUDFLARE (7 minutos)

### 2.1 Login no Wrangler

```bash
cd /home/user/webapp
npx wrangler login
```

### 2.2 Criar Banco D1

```bash
npx wrangler d1 create webapp-production
```

**COPIE** o `database_id` que aparecer!

### 2.3 Configurar wrangler.jsonc

Edite o arquivo e cole o `database_id`:

```jsonc
{
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "webapp-production",
      "database_id": "COLE-AQUI"  // ← Seu ID aqui
    }
  ]
}
```

### 2.4 Aplicar Migrations

```bash
npm run db:migrate:prod
```

### 2.5 Deploy!

```bash
npm run deploy:prod
```

**Você receberá uma URL:** `https://webapp-xxx.pages.dev`

### 2.6 Configurar D1 Binding (IMPORTANTE)

1. Acesse: https://dash.cloudflare.com
2. Workers & Pages → `webapp`
3. Settings → Bindings → Add
4. Tipo: D1 database
   - Variable name: `DB`
   - D1 database: `webapp-production`
5. Save

### 2.7 Deploy Final

```bash
npm run deploy:prod
```

---

## ✅ PASSO 3: TESTAR

Acesse: `https://webapp-xxx.pages.dev`

Login: `Amanda` / `Amanda123`

**Teste:**
- Digite "2" na quantidade
- Clique OK ✓
- ✅ Linha verde = FUNCIONANDO!

---

## 🎯 COMANDOS ÚTEIS

```bash
# Desenvolvimento local
npm run build           # Build do projeto
npm run dev:sandbox     # Servidor local

# Banco de dados
npm run db:migrate:local   # Migrations local
npm run db:seed            # Dados de teste
npm run db:reset           # Resetar banco local

# Deploy
npm run deploy:prod     # Deploy Cloudflare

# Git
git add .               # Adicionar alterações
git commit -m "msg"     # Commit
git push origin main    # Enviar para GitHub
```

---

## 📖 DOCUMENTAÇÃO COMPLETA

- **Tutorial Detalhado:** `TUTORIAL_GITHUB_CLOUDFLARE.md`
- **README:** `README.md`
- **Instalação Rápida:** `INSTALACAO_RAPIDA.md`

---

## 🐛 PROBLEMAS COMUNS

### ❌ Erro: "Authentication failed" (GitHub)

**Solução:** Use Personal Access Token em vez de senha
- https://github.com/settings/tokens

### ❌ Erro: "Database not found" (Cloudflare)

**Solução:** Configure D1 binding no dashboard
- Settings → Bindings → Add D1

### ❌ Página em branco após deploy

**Solução:** Verifique logs
```bash
npx wrangler pages deployment tail
```

---

## 🎉 PRONTO!

Seu sistema está no ar! 🚀

**URLs importantes:**
- GitHub: https://github.com/playsurf001/Planejamento
- Cloudflare: https://dash.cloudflare.com
- Seu App: https://webapp-xxx.pages.dev

**Sucesso! 🎊**
