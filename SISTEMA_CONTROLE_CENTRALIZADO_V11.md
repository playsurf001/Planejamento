# 🔐 SISTEMA DE CONTROLE CENTRALIZADO v11.0

**Data:** 21/01/2026  
**Versão:** v11.0  
**Status:** 🚧 EM DESENVOLVIMENTO  
**Tipo:** Sistema de Controle Centralizado com Roles

---

## 📋 VISÃO GERAL

Sistema redesenhado com controle centralizado pelo administrador, separando claramente as responsabilidades entre Admin e Usuários.

---

## 👥 PERFIS E PERMISSÕES

### 🔑 ADMINISTRADOR

**Acesso Completo:**
- ✅ Cadastrar produtos
- ✅ Definir quantidades planejadas
- ✅ Editar quantidades a qualquer momento
- ✅ Ver todos os relatórios
- ✅ Gerenciar metas
- ✅ Gerenciar usuários
- ✅ Acesso a todas as abas

**Menus Visíveis:**
- Dashboard
- Designers
- Lançamentos
- Relatórios
- Metas
- **Cadastros** (exclusivo admin)
- Planilhas

### 👤 USUÁRIO

**Acesso Limitado:**
- ✅ Visualizar produtos planejados (somente leitura)
- ✅ Confirmar conclusão de produção (checkbox)
- ✅ Ver seu próprio progresso
- ❌ NÃO pode editar quantidades
- ❌ NÃO pode cadastrar produtos

**Menus Visíveis:**
- Dashboard
- Designers (apenas visualização)
- Relatórios
- Metas
- Planilhas

---

## 🗄️ ESTRUTURA DO BANCO DE DADOS

### Tabela `designers` (atualizada)
```sql
CREATE TABLE designers (
  id INTEGER PRIMARY KEY,
  nome TEXT NOT NULL,
  ativo INTEGER DEFAULT 1,
  role TEXT DEFAULT 'user' CHECK(role IN ('admin', 'user')),  -- NOVO
  created_at DATETIME
);
```

### Tabela `produtos_planejados` (NOVA)
```sql
CREATE TABLE produtos_planejados (
  id INTEGER PRIMARY KEY,
  produto_id INTEGER NOT NULL,
  quantidade_planejada INTEGER NOT NULL,  -- Definido pelo admin
  semana INTEGER,
  mes INTEGER,
  ano INTEGER,
  periodo TEXT,  -- YYYY-MM ou YYYY-WW
  admin_id INTEGER NOT NULL,  -- Quem definiu
  status TEXT DEFAULT 'pendente',  -- pendente, em_andamento, concluido
  created_at DATETIME,
  updated_at DATETIME,
  UNIQUE(produto_id, periodo)  -- Impede duplicação
);
```

### Tabela `lancamentos` (atualizada)
```sql
ALTER TABLE lancamentos 
  ADD COLUMN planejamento_id INTEGER,  -- Referência ao planejamento
  ADD COLUMN concluido_em DATETIME,    -- Quando foi confirmado
  ADD COLUMN concluido_por INTEGER;    -- Quem confirmou (designer_id)
```

### View `vw_produtos_planejados`
```sql
CREATE VIEW vw_produtos_planejados AS
SELECT 
  pp.id,
  pp.produto_id,
  p.nome as produto_nome,
  pp.quantidade_planejada,
  pp.periodo,
  pp.status,
  pp.admin_id,
  da.nome as admin_nome,
  -- Quantidade já concluída
  COALESCE(SUM(l.quantidade_criada), 0) as quantidade_concluida,
  -- Progresso
  ROUND(CAST(COALESCE(SUM(l.quantidade_criada), 0) AS FLOAT) / pp.quantidade_planejada * 100, 2) as progresso_percent
FROM produtos_planejados pp
JOIN produtos p ON pp.produto_id = p.id
JOIN designers da ON pp.admin_id = da.id
LEFT JOIN lancamentos l ON pp.id = l.planejamento_id
GROUP BY pp.id;
```

---

## 🔄 FLUXO DE TRABALHO

### 1️⃣ Admin Define Planejamento
```
Admin → Cadastros → Nova Produção
  ├─ Seleciona Produto
  ├─ Define Quantidade Planejada (ex: 100)
  ├─ Define Período (ex: 2026-01)
  └─ Salva
```

**API:**
```http
POST /api/produtos-planejados
{
  "produto_id": 1,
  "quantidade_planejada": 100,
  "periodo": "2026-01",
  "admin_id": 1
}
```

### 2️⃣ Usuário Visualiza
```
Usuário → Planilhas → Meus Produtos
  └─ Vê lista:
      ├─ CAMISETA ESTAMPADA | 100 unidades | [ ] Confirmar
      ├─ BERMUDA MOLETOM   | 80 unidades  | [ ] Confirmar
      └─ REGATA SUBLIMADA  | 120 unidades | [ ] Confirmar
```

**API:**
```http
GET /api/meus-produtos-planejados?designer_id=2&periodo=2026-01
```

### 3️⃣ Usuário Confirma Conclusão
```
Usuário marca checkbox → Sistema automaticamente:
  ├─ Cria lançamento com quantidade_planejada
  ├─ Registra data/hora atual
  ├─ Registra quem confirmou (designer_id)
  ├─ Atualiza status para "em_andamento"
  └─ Impede confirmação duplicada
```

**API:**
```http
POST /api/confirmar-producao
{
  "planejamento_id": 5,
  "designer_id": 2
}
```

**Resultado:**
```json
{
  "success": true,
  "lancamento": {
    "id": 123,
    "designer_id": 2,
    "produto_id": 1,
    "quantidade_criada": 100,  ← Quantidade automática
    "planejamento_id": 5,
    "concluido_em": "2026-01-21 15:30:00",
    "concluido_por": 2
  },
  "message": "Produção confirmada! 100 unidades registradas."
}
```

---

## 🔐 SISTEMA DE AUTENTICAÇÃO

### Login
```
Usuário: amanda
Senha: amanda123
Role: user

Usuário: admin
Senha: admin123
Role: admin
```

### Token JWT (Base64)
```json
{
  "id": 1,
  "username": "amanda",
  "nome": "Amanda",
  "role": "admin"
}
```

### Verificação de Role no Frontend
```javascript
const userData = JSON.parse(localStorage.getItem('user_data'));

if (userData.role === 'admin') {
  // Mostrar menu Cadastros
  // Permitir edições
} else {
  // Ocultar menu Cadastros
  // Mostrar apenas confirmação
}
```

---

## 📡 APIS IMPLEMENTADAS

### Produtos Planejados

#### 1. Listar (Admin e User)
```http
GET /api/produtos-planejados?periodo=2026-01&status=pendente
```

#### 2. Criar (Admin apenas)
```http
POST /api/produtos-planejados
{
  "produto_id": 1,
  "quantidade_planejada": 100,
  "semana": 4,
  "mes": 1,
  "ano": 2026,
  "periodo": "2026-01",
  "admin_id": 1
}
```

#### 3. Atualizar (Admin apenas)
```http
PUT /api/produtos-planejados/:id
{
  "quantidade_planejada": 120,
  "status": "pendente"
}
```

#### 4. Deletar (Admin apenas)
```http
DELETE /api/produtos-planejados/:id
```

### Confirmação de Produção

#### 5. Listar Meus Produtos (User)
```http
GET /api/meus-produtos-planejados?designer_id=2&periodo=2026-01
```

**Resposta:**
```json
[
  {
    "id": 5,
    "produto_id": 1,
    "produto_nome": "CAMISETA ESTAMPADA",
    "quantidade_planejada": 100,
    "periodo": "2026-01",
    "status": "pendente",
    "ja_confirmado": 0,  // 0 = não confirmado, 1 = já confirmado
    "concluido_em": null,
    "quantidade_confirmada": null
  }
]
```

#### 6. Confirmar Produção (User)
```http
POST /api/confirmar-producao
{
  "planejamento_id": 5,
  "designer_id": 2
}
```

---

## ✅ VALIDAÇÕES IMPLEMENTADAS

### 1. Impedir Duplicação
```sql
UNIQUE INDEX idx_produtos_planejados_unique 
  ON produtos_planejados(produto_id, periodo);
```

**Erro:**
```json
{
  "error": "Já existe um planejamento para este produto neste período"
}
```

### 2. Impedir Confirmação Duplicada
```javascript
const jaConfirmado = await DB.prepare(`
  SELECT id FROM lancamentos 
  WHERE planejamento_id = ? AND designer_id = ?
`).bind(planejamento_id, designer_id).first()

if (jaConfirmado) {
  return c.json({ 
    error: 'Este produto já foi confirmado por você neste período' 
  }, 409)
}
```

### 3. Registrar Dados Automáticos
```sql
INSERT INTO lancamentos 
  (designer_id, produto_id, quantidade_criada, 
   planejamento_id, concluido_em, concluido_por)
VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, ?)
```

---

## 🎨 INTERFACE DO USUÁRIO

### Admin - Cadastrar Planejamento
```
┌─────────────────────────────────────────┐
│ Nova Produção Planejada                 │
├─────────────────────────────────────────┤
│ Produto: [CAMISETA ESTAMPADA ▼]        │
│ Quantidade: [100]                        │
│ Período: [2026-01]                       │
│ [ Salvar ] [ Cancelar ]                 │
└─────────────────────────────────────────┘
```

### Usuário - Confirmar Produção
```
┌──────────────────────────────────────────────┐
│ Meus Produtos - Janeiro/2026                 │
├──────────────────────────────────────────────┤
│ ☐ CAMISETA ESTAMPADA    100 un.   Pendente  │
│ ☐ BERMUDA MOLETOM        80 un.   Pendente  │
│ ☑ REGATA SUBLIMADA      120 un.   Concluído │
│   ↳ Confirmado em 21/01 às 15:30            │
└──────────────────────────────────────────────┘
```

---

## 📊 PROGRESSO DO DESENVOLVIMENTO

### ✅ Concluído
- [x] Migration com tabelas e campos
- [x] Sistema de roles (admin/user)
- [x] APIs de produtos planejados
- [x] API de confirmação de produção
- [x] Validações de duplicação
- [x] Registro automático de data/hora/usuário
- [x] View com progresso calculado

### 🚧 Pendente
- [ ] Interface admin para cadastrar planejamentos
- [ ] Interface usuário para confirmar produção
- [ ] Ocultar menus por role
- [ ] Atualizar frontend para usar novas APIs
- [ ] Testes completos do fluxo

---

## 🚀 PRÓXIMOS PASSOS

1. **Build e Deploy** da versão com APIs
2. **Criar interface Admin** (cadastro de planejamentos)
3. **Criar interface User** (confirmação com checkbox)
4. **Implementar controle de menus** por role
5. **Testar fluxo completo**

---

## 🔧 COMANDOS ÚTEIS

### Desenvolvimento
```bash
# Aplicar migrations
npm run db:migrate:local

# Verificar estrutura
npx wrangler d1 execute webapp-production --local --command="PRAGMA table_info(produtos_planejados);"

# Ver planejamentos
npx wrangler d1 execute webapp-production --local --command="SELECT * FROM vw_produtos_planejados;"

# Ver confirmações
npx wrangler d1 execute webapp-production --local --command="SELECT * FROM lancamentos WHERE planejamento_id IS NOT NULL;"
```

---

## 📝 CREDENCIAIS

### Admin
- **Usuário:** admin
- **Senha:** admin123
- **Role:** admin

### Usuários
- **Usuário:** amanda
- **Senha:** amanda123
- **Role:** admin (primeiro designer)

- **Usuário:** bruno
- **Senha:** bruno123
- **Role:** user

---

**Desenvolvido por:** Claude Code Assistant  
**Data:** 21 de Janeiro de 2026  
**Versão:** 11.0 (em desenvolvimento)
