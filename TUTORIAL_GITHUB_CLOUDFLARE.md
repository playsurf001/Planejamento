# 📚 TUTORIAL COMPLETO - GITHUB + CLOUDFLARE PAGES

## 🎯 O QUE VOCÊ VAI APRENDER

Neste tutorial, você vai aprender a:
1. ✅ Colocar seu projeto no GitHub
2. ✅ Fazer deploy no Cloudflare Pages
3. ✅ Configurar banco de dados D1
4. ✅ Acessar seu sistema online

**Tempo estimado:** 20-30 minutos  
**Nível:** Iniciante  
**Custo:** R$ 0,00 (100% gratuito)

---

## 📋 PARTE 1: PRÉ-REQUISITOS (5 minutos)

### 1.1 Criar Conta GitHub

1. Acesse: https://github.com/signup
2. Preencha:
   - Email
   - Senha
   - Nome de usuário
3. Confirme o email
4. ✅ Pronto!

### 1.2 Criar Conta Cloudflare

1. Acesse: https://dash.cloudflare.com/sign-up
2. Preencha:
   - Email
   - Senha
3. Confirme o email
4. ✅ Pronto!

### 1.3 Instalar Git (se ainda não tem)

**Windows:**
- Baixe: https://git-scm.com/download/win
- Instale com opções padrão
- Abra o terminal e digite: `git --version`

**Mac:**
- Abra o Terminal
- Digite: `git --version`
- Se não tiver, instale Xcode Command Line Tools

**Linux:**
```bash
sudo apt install git
```

### 1.4 Instalar Node.js (se ainda não tem)

1. Acesse: https://nodejs.org
2. Baixe a versão **LTS** (recomendada)
3. Instale com opções padrão
4. Abra o terminal e digite:
```bash
node --version
npm --version
```

✅ Se aparecer a versão, está instalado!

---

## 📦 PARTE 2: BAIXAR E PREPARAR O PROJETO (5 minutos)

### 2.1 Baixar o Projeto

**Opção A - Clonar do GitHub (se já está no GitHub):**
```bash
git clone https://github.com/playsurf001/Planejamento.git
cd Planejamento
```

**Opção B - Baixar o Backup:**
1. Baixe: https://www.genspark.ai/api/files/s/AmKYeLOt
2. Extraia o arquivo
3. Abra o terminal na pasta `webapp/`

### 2.2 Instalar Dependências

No terminal, dentro da pasta do projeto:

```bash
npm install
```

⏳ Aguarde 1-2 minutos. Você verá muitas mensagens, isso é normal.

✅ Quando aparecer o prompt novamente, está pronto!

### 2.3 Testar Localmente

```bash
# 1. Criar banco de dados local
npm run db:migrate:local

# 2. Inserir dados de teste
npm run db:seed

# 3. Build do projeto
npm run build

# 4. Iniciar servidor
npm run dev:sandbox
```

Abra o navegador: http://localhost:3000

**Teste:**
- Login: `Amanda` / `Amanda123`
- Digite quantidade "2"
- Clique OK ✓
- ✅ Linha deve ficar verde

**Se funcionou = ✅ Projeto está pronto para deploy!**

---

## 🐙 PARTE 3: COLOCAR NO GITHUB (5 minutos)

### 3.1 Criar Repositório no GitHub

1. Acesse: https://github.com/new
2. Preencha:
   - **Repository name:** `controle-producao` (ou o nome que quiser)
   - **Description:** "Sistema de Controle de Produção"
   - **Public** ou **Private** (sua escolha)
   - ❌ NÃO marque "Add a README file"
3. Clique em **"Create repository"**

### 3.2 Inicializar Git Local

No terminal, dentro da pasta do projeto:

```bash
# 1. Inicializar repositório (se ainda não foi)
git init

# 2. Adicionar todos os arquivos
git add .

# 3. Fazer primeiro commit
git commit -m "Initial commit: Sistema de Controle de Produção v8.2"

# 4. Renomear branch para 'main'
git branch -M main
```

### 3.3 Conectar com GitHub

Copie os comandos que apareceram na página do GitHub após criar o repositório.

Deve ser algo como:

```bash
git remote add origin https://github.com/SEU-USUARIO/controle-producao.git
git push -u origin main
```

**Substitua `SEU-USUARIO` e `controle-producao` pelos seus valores.**

### 3.4 Autenticar (se solicitado)

**Primeira vez usando Git:**
- GitHub vai pedir usuário e senha
- **IMPORTANTE:** Use um **Personal Access Token** como senha
- Como criar: https://github.com/settings/tokens
- Marque: `repo` e `workflow`

### 3.5 Verificar

1. Acesse: `https://github.com/SEU-USUARIO/controle-producao`
2. ✅ Você deve ver todos os arquivos do projeto!

---

## ☁️ PARTE 4: DEPLOY NO CLOUDFLARE PAGES (10 minutos)

### 4.1 Fazer Login no Wrangler

No terminal:

```bash
npx wrangler login
```

- Uma página do navegador vai abrir
- Clique em **"Allow"**
- ✅ Volte para o terminal

### 4.2 Criar Banco de Dados D1

```bash
npx wrangler d1 create webapp-production
```

Você verá algo assim:

```
✅ Successfully created DB 'webapp-production'

📋 Add the following to your wrangler.jsonc to connect to it from a Worker:

[[d1_databases]]
binding = "DB"
database_name = "webapp-production"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

**IMPORTANTE:** Copie o `database_id` (a linha com letras e números)

### 4.3 Configurar wrangler.jsonc

Abra o arquivo `wrangler.jsonc` no editor de texto e edite:

```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "webapp",
  "compatibility_date": "2025-12-09",
  "pages_build_output_dir": "./dist",
  "compatibility_flags": ["nodejs_compat"],
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "webapp-production",
      "database_id": "COLE-O-ID-AQUI"  // ← Substitua por seu database_id
    }
  ]
}
```

Salve o arquivo.

### 4.4 Aplicar Migrations no Banco D1 (Produção)

```bash
npm run db:migrate:prod
```

Você verá:

```
🌀 Mapping SQL input into an array of statements
🌀 Parsing 1 statements
✅ Successfully applied 1 migration(s)!
```

✅ Banco de dados criado e configurado!

### 4.5 Fazer Build do Projeto

```bash
npm run build
```

Aguarde ~10 segundos. Você verá:

```
✓ built in XXXms
```

### 4.6 Criar Projeto no Cloudflare Pages

```bash
npx wrangler pages project create webapp --production-branch main
```

Responda:
- **Production branch:** `main` (tecle Enter)

✅ Projeto criado!

### 4.7 Deploy!

```bash
npm run deploy:prod
```

Você verá várias mensagens e, no final:

```
✨ Deployment complete! Take a peek over at https://webapp-xxx.pages.dev
```

**COPIE ESTA URL!** É o endereço do seu sistema online!

### 4.8 Configurar D1 Binding no Pages

1. Acesse: https://dash.cloudflare.com
2. Clique em **"Workers & Pages"**
3. Clique no seu projeto: **"webapp"**
4. Clique na aba **"Settings"**
5. Role até **"Bindings"**
6. Clique em **"Add"** → **"D1 database"**
7. Preencha:
   - **Variable name:** `DB`
   - **D1 database:** Selecione `webapp-production`
8. Clique em **"Save"**

### 4.9 Fazer Novo Deploy (para aplicar binding)

```bash
npm run deploy:prod
```

---

## 🎉 PARTE 5: TESTAR SEU SISTEMA ONLINE (2 minutos)

### 5.1 Acessar

Abra o navegador e acesse a URL que você copiou:

```
https://webapp-xxx.pages.dev
```

Substitua `xxx` pelo seu ID.

### 5.2 Fazer Login

Use as credenciais:
- **Usuário:** `Amanda`
- **Senha:** `Amanda123`

### 5.3 Testar o Sistema

1. Você verá a tela de **Controle de Produção Semanal**
2. Digite "2" na quantidade de qualquer produto
3. Aguarde "Quantidade salva!"
4. Clique no checkbox OK ✓
5. **Verifique:**
   - ✅ Linha fica verde
   - ✅ Status muda para "CRIADA"
   - ✅ "Criadas" aumenta +2

**Se tudo funcionou = 🎉 SEU SISTEMA ESTÁ NO AR!**

---

## 🔧 PARTE 6: PERSONALIZAÇÕES (OPCIONAL)

### 6.1 Alterar Nome do Projeto

Edite `wrangler.jsonc`:

```jsonc
{
  "name": "meu-sistema-producao",  // ← Altere aqui
  ...
}
```

Depois:

```bash
npm run deploy:prod
```

### 6.2 Usar Domínio Próprio

1. Acesse: https://dash.cloudflare.com
2. Workers & Pages → Seu projeto
3. Aba **"Custom domains"**
4. Clique em **"Set up a custom domain"**
5. Digite seu domínio: `sistema.seusite.com`
6. Siga as instruções
7. ✅ Em ~5 minutos seu domínio estará ativo!

### 6.3 Adicionar Designers

**Opção A - Via Cloudflare Dashboard:**

1. Acesse: https://dash.cloudflare.com
2. Storage & Databases → D1
3. Clique em: `webapp-production`
4. Aba **"Console"**
5. Execute:

```sql
INSERT INTO designers (nome, ativo) VALUES ('João', 1);
```

**Opção B - Via Wrangler:**

```bash
npx wrangler d1 execute webapp-production --command="INSERT INTO designers (nome, ativo) VALUES ('João', 1)"
```

Login do novo designer: `João` / `João123`

### 6.4 Adicionar Produtos

```sql
INSERT INTO produtos (nome, ativo) VALUES ('NOVO PRODUTO', 1);
```

---

## 📊 PARTE 7: MANUTENÇÃO E ATUALIZAÇÕES

### 7.1 Fazer Alterações no Código

1. Edite os arquivos que quiser
2. Teste localmente:
```bash
npm run build
npm run dev:sandbox
```

3. Commit no Git:
```bash
git add .
git commit -m "Descrição da alteração"
git push origin main
```

4. Deploy no Cloudflare:
```bash
npm run deploy:prod
```

### 7.2 Ver Logs do Sistema

```bash
npx wrangler pages deployment tail
```

Pressione Ctrl+C para sair.

### 7.3 Fazer Backup do Banco

```bash
# Listar todos os dados
npx wrangler d1 execute webapp-production --command="SELECT * FROM lancamentos"

# Exportar para arquivo
npx wrangler d1 export webapp-production > backup.sql
```

### 7.4 Restaurar Banco (se necessário)

```bash
npx wrangler d1 execute webapp-production --file=backup.sql
```

---

## 🐛 PARTE 8: TROUBLESHOOTING

### ❌ Erro: "Database not found"

**Causa:** Database ID não configurado ou incorreto

**Solução:**
1. Verifique `wrangler.jsonc`
2. Confirme que `database_id` está correto
3. Execute: `npx wrangler d1 list`
4. Copie o ID correto

### ❌ Erro: "Binding 'DB' not found"

**Causa:** D1 binding não configurado no Cloudflare Pages

**Solução:**
1. Acesse Cloudflare Dashboard
2. Workers & Pages → webapp → Settings → Bindings
3. Adicione D1 binding: `DB` → `webapp-production`
4. Faça novo deploy: `npm run deploy:prod`

### ❌ Página em branco após deploy

**Causa:** Build falhou ou binding não configurado

**Solução:**
1. Verifique logs: `npx wrangler pages deployment tail`
2. Confirme binding D1 está configurado
3. Teste local primeiro: `npm run dev:sandbox`
4. Faça novo deploy: `npm run deploy:prod`

### ❌ "Authentication required"

**Causa:** Token expirado ou inválido

**Solução:**
```bash
npx wrangler logout
npx wrangler login
```

### ❌ Checkbox OK não funciona online

**Causa:** Migrations não foram aplicadas

**Solução:**
```bash
npm run db:migrate:prod
npm run deploy:prod
```

---

## ✅ PARTE 9: CHECKLIST FINAL

Confirme que tudo está funcionando:

### Localmente:
- [ ] `npm install` executou sem erros
- [ ] `npm run db:migrate:local` criou banco
- [ ] `npm run build` buildou com sucesso
- [ ] `npm run dev:sandbox` inicia servidor
- [ ] Login funciona (Amanda / Amanda123)
- [ ] Checkbox OK marca e linha fica verde

### GitHub:
- [ ] Repositório criado no GitHub
- [ ] Código foi commitado
- [ ] `git push` enviou arquivos
- [ ] Arquivos visíveis no GitHub

### Cloudflare:
- [ ] `npx wrangler login` autenticou
- [ ] `npx wrangler d1 create` criou banco
- [ ] `database_id` copiado para wrangler.jsonc
- [ ] `npm run db:migrate:prod` aplicou migrations
- [ ] `npm run deploy:prod` fez deploy
- [ ] URL recebida (https://webapp-xxx.pages.dev)
- [ ] D1 binding configurado no dashboard
- [ ] Sistema abre online
- [ ] Login funciona online
- [ ] Checkbox OK funciona online

**Se TODOS os itens estão marcados = 🎉 PARABÉNS!**

---

## 📞 PARTE 10: RECURSOS E SUPORTE

### Documentação Oficial

- **Cloudflare Pages:** https://developers.cloudflare.com/pages
- **Cloudflare D1:** https://developers.cloudflare.com/d1
- **Wrangler:** https://developers.cloudflare.com/workers/wrangler
- **Hono:** https://hono.dev

### Comunidade

- **Cloudflare Discord:** https://discord.cloudflare.com
- **GitHub Issues:** https://github.com/playsurf001/Planejamento/issues

### Custos

- **GitHub:** ✅ Grátis (repositórios ilimitados)
- **Cloudflare Pages:** ✅ Grátis (500 builds/mês)
- **Cloudflare D1:** ✅ Grátis (5GB armazenamento)
- **Domínio Próprio:** 💰 R$ 40/ano (opcional)

**Total para começar: R$ 0,00**

---

## 🎓 PARTE 11: PRÓXIMOS PASSOS

Agora que seu sistema está no ar, você pode:

1. **Personalizar o Visual**
   - Edite cores no TailwindCSS
   - Adicione sua logo
   - Customize o header

2. **Adicionar Funcionalidades**
   - Relatórios em PDF
   - Gráficos de produtividade
   - Notificações por email

3. **Melhorar a Segurança**
   - Implementar 2FA
   - Usar senhas criptografadas
   - Adicionar rate limiting

4. **Integrar com Outras Ferramentas**
   - Google Sheets
   - Slack
   - Discord

5. **Monitorar o Sistema**
   - Cloudflare Analytics
   - Logs centralizados
   - Alertas de erro

---

## 🎉 CONCLUSÃO

**Parabéns! 🎊**

Você aprendeu a:
- ✅ Colocar um projeto no GitHub
- ✅ Fazer deploy no Cloudflare Pages
- ✅ Configurar banco de dados D1
- ✅ Manter e atualizar o sistema

**Seu Sistema de Controle de Produção está:**
- 🌍 **Online** e acessível de qualquer lugar
- ⚡ **Rápido** (edge computing)
- 💰 **Gratuito** (sem custos mensais)
- 🔒 **Seguro** (HTTPS automático)
- 📈 **Escalável** (suporta milhares de usuários)

**Tempo gasto:** ~30 minutos  
**Custo:** R$ 0,00  
**Resultado:** Sistema profissional no ar! 🚀

---

**Dúvidas?** Abra uma issue no GitHub!  
**Gostou?** Deixe uma ⭐ no repositório!

**Bom trabalho! 🎉**
