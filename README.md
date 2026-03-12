# Sistema de Controle de Produção - webapp

## 🎯 Versão Atual: v22.0.0 - Advanced Reporting & Auto-Refresh

### 📋 Overview
Sistema profissional de controle de produção com 3 níveis de acesso (Admin, Supervisor, User), RBAC (Role-Based Access Control), **3 novos módulos avançados** (Fila de Produção, Ranking de Designers, Relatório Executivo com gráficos Chart.js), sistema de confirmação de unidades individuais, atualização automática em tempo real e geração de PDF profissional.

---

## 🌐 URLs do Sistema

- **Produção**: https://webapp-5et.pages.dev
- **Último Deploy**: https://9d418755.webapp-5et.pages.dev
- **GitHub**: https://github.com/playsurf001/Planejamento
- **Backup**: https://www.genspark.ai/api/files/s/20CcOUCR

---

## 🆕 Novos Módulos v22.0.0

### 1. **FILA DE PRODUÇÃO**
**Visualização em tempo real dos lançamentos**
- 📊 Colunas: Designer, Produto, Criadas, Aprovadas, Reprovadas, Data, Prioridade, Status
- 🎯 Prioridades: Urgente, Alta, Média, Baixa
- ✅ Status automático: Pronto (aprovadas > 0) / Em Produção
- 🔄 Atualização automática a cada 30 segundos
- 🔍 Filtros: Designer, Mês, Ano
- 🎨 Ordenação: Prioridade (urgente→baixa) + Data recente

### 2. **RANKING DE DESIGNERS**
**Classificação de desempenho dos designers**
- 🥇🥈🥉 Medalhas para Top 3
- 📊 Métricas: Criadas, Aprovadas, Reprovadas, Taxa de Aprovação
- 📈 Ordenação: Total de Aprovadas (decrescente)
- 🎨 Cores de destaque por posição
- 🔄 Atualização automática a cada 30 segundos
- 🔍 Filtros: Mês, Ano

### 3. **RELATÓRIO EXECUTIVO**
**Relatório gerencial completo com gráficos**
- 📑 Resumo Geral (totais e taxa de aprovação)
- 👥 Top 10 Designers com métricas
- 📦 Top 20 Produtos por produção
- 📊 **Gráfico de Produção Semanal** (Chart.js - barras verdes)
- 📈 **Gráfico de Desempenho por Designer** (Chart.js - barras + linha)
- 📄 **Geração de PDF profissional** (2 páginas com gráficos incluídos)
- 🔄 Atualização automática a cada 30 segundos
- 🔍 Filtros: Mês, Ano

### 📊 Gráficos Interativos (Chart.js 4.4.1)
- **Produção Semanal**: Gráfico de barras mostrando aprovadas por semana
- **Desempenho Designers**: Dual-axis com barras (aprovadas) e linha (taxa %)
- Tooltips informativos
- Responsivos e interativos
- Cores consistentes com o design do sistema

### 🔄 Sistema de Atualização Automática
- Refresh a cada 30 segundos nos 3 módulos
- Timers inteligentes por módulo
- Limpeza automática ao trocar de aba
- Não afeta performance do sistema

## 👥 Perfis de Usuário e Permissões

### 1. **ADMINISTRADOR** (Admin)
**Acesso Total ao Sistema**
- ✅ Dashboard Completo
- ✅ Designers
- ✅ Lançamentos
- ✅ Relatórios
- ✅ Metas (criar/editar/excluir)
- ✅ Cadastros (produtos/designers)
- ✅ Planejamentos
- ✅ Gerenciar Usuários
- ✅ **Fila de Produção** (todos os designers)
- ✅ **Ranking de Designers** (completo)
- ✅ **Relatório Executivo** (geração de PDF)
- ❌ Aprovações (oculto)
- ❌ Configurações (oculto)
- ❌ Meus Produtos (oculto)
- ❌ Painel Supervisor (oculto)
- ❌ Pendências (oculto)

**Badge**: 🟣 Roxo

### 2. **SUPERVISOR** (Supervisor)
**Acesso Operacional e Aprovações**
- ✅ Dashboard
- ✅ Designers
- ✅ Lançamentos
- ✅ Relatórios
- ✅ Metas (somente visualização)
- ✅ **Painel Supervisor** (estatísticas + ranking)
- ✅ **Pendências** (aprovar/reprovar lançamentos)
- ✅ **Fila de Produção** (todos os designers)
- ✅ **Ranking de Designers** (completo)
- ✅ **Relatório Executivo** (geração de PDF)
- ❌ Cadastros
- ❌ Planejamentos
- ❌ Gerenciar Usuários
- ❌ Configurações
- ❌ Meus Produtos
- ❌ Aprovações

**Badge**: 🟠 Laranja

**Permissões Especiais:**
- Aprovar/Reprovar registros de produção
- Editar lançamentos com audit log
- Visualizar dashboard com métricas do time
- Ver ranking de eficiência
- Filtrado por setor (se configurado)

### 3. **USUÁRIO** (User/Designer)
**Acesso Básico**
- ✅ Dashboard
- ✅ Designers
- ✅ Relatórios
- ✅ Meus Produtos
- ✅ **Fila de Produção** (somente seus próprios itens)
- ❌ Ranking de Designers (oculto)
- ❌ Relatório Executivo (oculto)
- ❌ Lançamentos
- ❌ Metas
- ❌ Cadastros
- ❌ Planejamentos
- ❌ Gerenciar Usuários
- ❌ Configurações
- ❌ Aprovações
- ❌ Painel Supervisor
- ❌ Pendências

**Badge**: 🔵 Azul Teal

---

## 🔐 Credenciais de Teste

### Admin
- **Usuário**: admin
- **Senha**: admin123
- **Email**: admin@webapp.com

### Usuários Regulares
1. **João Silva**
   - Usuário: João Silva
   - Senha: joaosilva123
   - Email: joao@webapp.com

2. **Maria Santos**
   - Usuário: Maria Santos
   - Senha: mariasantos123
   - Email: maria@webapp.com

3. **Designer 1**
   - Usuário: designer1
   - Senha: designer1123
   - Email: designer1@webapp.com

4. **Designer 2**
   - Usuário: designer2
   - Senha: designer2123
   - Email: designer2@webapp.com

### Supervisor
- **Usuário**: Supervisor Teste
- **Senha**: supervisor123
- **Email**: supervisor@webapp.com

### Usuários com Permissões Especiais
- **Alexandre** (ID: 34)
  - Usuário: alexandre
  - Senha: rapboy
  - Email: alexandre@webapp.com
  - Permissões: Dashboard, Designers, Lançamentos, Relatórios, Metas
  - Excluído do gráfico de performance: ✅

- **Evandro** (ID: 7 - User)
  - Usuário: evandro
  - Senha: evandro123
  - Email: evandro@webapp.com
  - Excluído do gráfico de performance: ✅

---

## 🗃️ Arquitetura de Dados

### Storage Services
- **Cloudflare D1**: Database principal (SQLite distribuído)
- **Local Development**: SQLite local com `.wrangler/state/v3/d1`

### Principais Tabelas
1. **designers**: Usuários do sistema
   - Campos: id, nome, email, senha, role, sector_id, ativo, permissoes, excluir_grafico
   
2. **lancamentos**: Registros de produção
   - Campos: id, designer_id, produto_id, quantidade_criada, quantidade_aprovada, quantidade_reprovada, status_aprovacao, aprovador_id
   
3. **product_units**: Unidades individuais de produtos (NOVO v19.0.0)
   - Campos: id, planejamento_semanal_id, unit_number, status, lancamento_id, confirmed_at, confirmed_by
   - Status: pendente, confirmado, cancelado
   
4. **audit_logs**: Trilha de auditoria
   - Campos: id, actor_user_id, action_type, entity, entity_id, old_value, new_value, reason
   
5. **produtos**: Produtos do sistema
6. **metas**: Metas de produção
7. **planejamentos_semanais**: Planejamento por semana

### Migrações Aplicadas
- ✅ 0010: User Profile and Settings (disabled - problemas de FK)
- ✅ 0011: Add Profile Columns
- ✅ 0012: Custom Permissions
- ✅ 0013: Supervisor Role and Audit (disabled - problemas de FK)
- ✅ 0015: Supervisor Simplified (disabled - problemas de FK)
- ✅ 0016: Product Units - Sistema de confirmação de unidades individuais (NOVO v19.0.0)

---

## 🔧 Funcionalidades Principais

### Para Admin
- Gerenciar todos os usuários
- Criar/editar/excluir produtos e metas
- Visualizar relatórios completos
- Fazer planejamentos semanais
- Editar permissões de usuários
- **Tela Lançamentos**: Filtros avançados por Designer e Produto (NOVO v20.0.0)
- **Edição de Quantidade Aprovada**: Cálculo automático ou manual (NOVO v20.0.0)

### Para Supervisor
- **Painel Supervisor**:
  - Total produzido hoje
  - Total reprovado hoje
  - Pendências
  - Eficiência do time
  - Ranking de eficiência com medalhas 🥇🥈🥉

- **Painel de Aprovações**:
  - **Aprovação individual por produto** (NOVO v20.0.0)
  - Visualizar lançamentos pendentes
  - Aprovar registros (com motivo opcional)
  - Reprovar registros (motivo obrigatório)
  - Editar lançamentos (com audit log)
  - **Atualização em tempo real**: Dashboard, Relatórios, Metas (NOVO v20.0.0)

### Para User
- Visualizar dashboard geral
- Ver lista de designers
- Consultar relatórios
- **Gerenciar produtos por unidades individuais**:
  - Ver unidades de cada produto planejado
  - **Confirmar unidades uma por uma** (botão "Confirmar Todos" removido - v20.0.0)
  - Cancelar confirmações
  - Acompanhar status: Pendente, Em Andamento, 100% Concluído
  - Ver contadores: Planejado, Confirmado, Pendente

---

## 🚀 Endpoints da API

### Autenticação
- `POST /api/auth/login` - Login

### Usuário
- `GET /api/user/profile` - Ver perfil
- `PUT /api/user/profile` - Atualizar perfil
- `PUT /api/user/avatar` - Upload de avatar
- `PUT /api/user/password` - Alterar senha

### Admin
- `GET /api/admin/users` - Listar usuários
- `GET /api/admin/users/:id` - Detalhes de usuário
- `PUT /api/admin/users/:id/profile` - Atualizar perfil de usuário
- `PUT /api/admin/users/:id/avatar` - Atualizar avatar de usuário
- `PUT /api/admin/users/:id/password` - Redefinir senha
- `PUT /api/admin/users/:id/settings` - Atualizar configurações

### Supervisor (NOVO v18.0.0)
- `GET /api/supervisor/pendencias` - Listar pendências
- `PUT /api/supervisor/aprovar/:id` - Aprovar/reprovar lançamento
- `PUT /api/supervisor/editar-lancamento/:id` - Editar lançamento
- `GET /api/supervisor/dashboard` - Dashboard do supervisor
- `GET /api/supervisor/audit-logs` - Ver logs de auditoria

### Designers
- `GET /api/designers` - Listar designers (exceto excluir_grafico=1)
- `POST /api/designers` - Criar designer
- `DELETE /api/designers/:id` - Desativar designer

### Lançamentos
- `GET /api/lancamentos` - Listar lançamentos
- `POST /api/lancamentos` - Criar lançamento
- `PUT /api/lancamentos/:id` - Atualizar lançamento
- `DELETE /api/lancamentos/:id` - Excluir lançamento (com limpeza de unidades)

### Product Units (NOVO v19.0.0)
- `GET /api/product-units/:planejamentoId` - Listar unidades de um planejamento
- `POST /api/product-units/initialize/:planejamentoId` - Inicializar unidades
- `PATCH /api/product-units/:unitId/confirm` - Confirmar uma unidade
- `PATCH /api/product-units/:unitId/cancel` - Cancelar confirmação
- `POST /api/product-units/:planejamentoId/confirm-all` - Confirmar todas unidades
- `DELETE /api/product-units/:unitId` - Excluir unidade

### Planejamento Semanal (ATUALIZADO v21.0.0)
- `GET /api/planejamento-semanal` - Listar planejamentos
- `GET /api/planejamento-semanal/:id` - **Buscar planejamento por ID** (NOVO v21.0.0)
- `POST /api/planejamento-semanal` - Criar planejamento
- `PUT /api/planejamento-semanal/:id` - **Editar planejamento** (NOVO v21.0.0)
- `POST /api/planejamento-semanal/duplicar` - Duplicar planejamento
- `DELETE /api/planejamento-semanal/:id` - Excluir planejamento

### Novos Módulos (NOVO v22.0.0)
- `GET /api/fila-producao` - **Fila de Produção** com prioridades e status
  - Query params: `designer_id`, `mes`, `ano`
  - Retorna: lista ordenada por prioridade (urgente→baixa) e data
  - Campos: designer, produto, criadas, aprovadas, reprovadas, data, prioridade, status
  
- `GET /api/ranking-designers` - **Ranking de Designers** por performance
  - Query params: `mes`, `ano`
  - Retorna: designers ordenados por total de aprovadas (desc)
  - Campos: posição, medalha (🥇🥈🥉), designer, criadas, aprovadas, reprovadas, taxa
  
- `GET /api/relatorio-executivo` - **Relatório Executivo** completo
  - Query params: `mes`, `ano`
  - Retorna: resumo, ranking_designers, producao_produtos, producao_semanal
  - Inclui dados para gráficos Chart.js e geração de PDF

### Relatórios
- `GET /api/relatorios` - Relatórios completos
- `GET /api/dashboard` - Dashboard com estatísticas

### Metas
- `GET /api/metas` - Listar metas
- `POST /api/metas` - Criar meta (admin)
- `PUT /api/metas/:id` - Atualizar meta (admin)
- `DELETE /api/metas/:id` - Excluir meta (admin)

---

## 🛡️ Segurança

### Autenticação
- **Bearer Token** em todas as rotas protegidas
- Token: Base64(JSON com user data)
- Produção: usar JWT com secret

### Autorização
- Role-Based Access Control (RBAC)
- Verificação de permissões em cada endpoint
- Logs de auditoria para ações de supervisores
- Filtragem por setor (se configurado)

### Validações
- Input validation em todos os endpoints
- Prepared statements (SQL injection prevention)
- CORS configurado
- Rate limiting (via Cloudflare)

---

## 📊 Métricas de Entrega v20.0.0

### Build
- **Size**: 266.25 kB (+29 kB desde v19.0.0)
- **Time**: 702 ms
- **Modules**: 40

### Código
- **Backend**: ~750 linhas (+50)
- **Frontend**: ~650 linhas (+50)
- **Endpoints Modificados**: 2 (lancamentos POST/PUT)
- **Funções JS**: 19 (+3)
- **Migrações**: 1 nova

### Arquivos Modificados
- migrations/0020_add_aprovada_manual_flag.sql (novo)
- src/index.tsx (2 endpoints modificados)
- public/static/app.js (3 novas funções + UI melhorada)

---

## 📝 Changelog v20.0.0

### ✨ Features
- ✅ **Filtros avançados na tela Lançamentos**: Designer e Produto
- ✅ Filtros trabalham em conjunto com filtro de semana existente
- ✅ Layout responsivo com flex-wrap
- ✅ **Quantidade Aprovada editável manualmente**:
  - Cálculo automático (Criada - Reprovada) por padrão
  - Botão toggle para modo manual
  - Indicador visual: ícone calculadora (auto) ou ícone edição (manual)
  - Background cinza para auto, amarelo para manual
- ✅ **Aprovação individual na tela Pendências**:
  - Cada pendência tem botões próprios: Aprovar, Reprovar, Editar
  - Atualização em tempo real de Dashboard, Relatórios e Metas
  - Sem aprovação em lote
- ✅ **Botão "Confirmar Todos" removido** da tela Meus Produtos
- ✅ Confirmação individual obrigatória para usuários

### ✨ v21.0.0 - Individual Planning Editing (11/03/2026)
- ✅ **Edição individual de itens do Planejamento Semanal**:
  - Botão "Editar" (✏️) ao lado de Duplicar e Deletar
  - Modal de edição com campos: Designer, Produto, Quantidade
  - Confirmação antes de salvar: "Tem certeza que deseja editar este item?"
  - Apenas Admin e Supervisor podem editar (Designer não pode)
- ✅ **Validações completas**:
  - Campos obrigatórios (designer_id, produto_id, quantidade_planejada, admin_id)
  - Quantidade deve ser maior que zero
  - Produto deve estar ativo
  - Designer deve estar ativo
  - Não permite duplicidade (mesmo designer+produto+semana)
- ✅ **Preservação de dados**:
  - Edição afeta apenas o item selecionado
  - Histórico de produção preservado (lançamentos não afetados)
  - Semana original mantida (não recalcula)
- ✅ **Atualização automática**:
  - Refresh da lista após edição
  - Sem reload da página
  - Notificações de sucesso/erro
- ✅ **Backend robusto**:
  - Endpoint PUT /api/planejamento-semanal/:id
  - Validação de duplicidade com exclusão do próprio registro
  - Timestamps updated_at atualizados automaticamente
  - Retorna dados completos após atualização

### 🔧 Backend
- ✅ Campo `aprovada_manual` adicionado à tabela lancamentos
- ✅ POST/PUT /api/lancamentos: aceita e salva flag aprovada_manual
- ✅ Detecção automática de edição manual vs automática
- ✅ Migration 0020: ADD COLUMN aprovada_manual INTEGER DEFAULT 0

### 🎨 Frontend
- ✅ Eventos de input em quantidade_criada e quantidade_reprovada
- ✅ Recálculo automático em tempo real (modo automático)
- ✅ Toggle entre modo automático e manual
- ✅ Indicadores visuais de modo ativo
- ✅ Envio correto do flag aprovada_manual no submit
- ✅ Filtros de Designer e Produto populados automaticamente
- ✅ Atualização de módulos relacionados após aprovação/reprovação

### 🗃️ Database
- ✅ Migration 0020: Campo aprovada_manual
- ✅ Índice para performance: idx_lancamentos_aprovada_manual
- ✅ Valor padrão: 0 (automático)

### 🐛 Bug Fixes
- ✅ Filtros de lançamentos agora funcionam corretamente
- ✅ Cálculo automático não sobrescreve edição manual
- ✅ Aprovação individual atualiza todas as métricas
- ✅ Modo manual persiste durante edição do formulário

---

## 🐛 Issues Conhecidos

### 1. **Role 'supervisor' no banco**
**Status**: ⚠️ Pendente  
**Problema**: Constraint CHECK no campo `role` permite apenas 'admin' e 'user'  
**Workaround**: Supervisor criado como 'user' mas com permissões customizadas no campo `permissoes`  
**Solução Futura**: Migração para remover o constraint CHECK e permitir 'supervisor'

### 2. **Foreign Keys em Migrações**
**Status**: ✅ RESOLVIDO v19.0.0  
**Problema**: Algumas migrações falhavam devido a foreign keys de outras tabelas  
**Solução**: Todos os endpoints DELETE agora limpam FK constraints corretamente antes de deletar
**Status Atual**: Sistema estável e funcional

---

## 🚀 Deploy & CI/CD

### Cloudflare Pages
- **Platform**: Cloudflare Workers + Pages
- **Runtime**: Edge (distribuído globalmente)
- **Database**: Cloudflare D1 (SQLite global)

### Build & Deploy
```bash
# Local development
npm run build
pm2 start ecosystem.config.cjs

# Deploy to production
npm run deploy:prod
# ou
wrangler pages deploy dist --project-name webapp

# Database migrations
wrangler d1 migrations apply webapp-production --remote
```

---

## 📚 Documentação Adicional

- `TESTES.md` - Resultados de testes
- `SUPERVISOR_STATUS.md` - Status da implementação do Supervisor
- `CHECKLIST_DEPLOY.md` - Checklist de deploy

---

## 🤝 Contribuindo

1. Criar branch: `git checkout -b feature/nova-funcionalidade`
2. Commit: `git commit -m "feat: adiciona nova funcionalidade"`
3. Push: `git push origin feature/nova-funcionalidade`
4. Abrir Pull Request

---

## 📅 Última Atualização

- **Data**: 11/03/2026
- **Versão**: v20.0.0
- **Status**: ✅ EM PRODUÇÃO
- **Deploy URL**: https://a9644295.webapp-5et.pages.dev
- **Features**: Filtros avançados + Edição manual + Aprovação individual
- **Próxima Feature**: Otimizações de performance

---

## 📞 Suporte

Para dúvidas ou problemas:
1. Verificar logs: `/home/user/.pm2/logs/`
2. Verificar wrangler logs: `/home/user/.config/.wrangler/logs/`
3. Consultar documentação do Cloudflare D1

---

## 🎉 Conquistas v20.0.0

✅ Sistema RBAC completo com 3 níveis  
✅ Supervisor pode aprovar/reprovar lançamentos  
✅ Dashboard com ranking de eficiência  
✅ Audit logs implementado  
✅ Sistema de confirmação de unidades individuais  
✅ Correções críticas em operações DELETE  
✅ **Filtros avançados em Lançamentos (Designer + Produto)** (NOVO)  
✅ **Edição manual de Quantidade Aprovada** (NOVO)  
✅ **Aprovação individual de pendências** (NOVO)  
✅ **Atualização em tempo real de módulos relacionados** (NOVO)  
✅ Status badges dinâmicos: Pendente, Em Andamento, Concluído  
✅ Contadores em tempo real  
✅ UI expansível e intuitiva  
✅ FK constraints resolvidas  
✅ UI responsiva e profissional  
✅ 100% funcional em produção  
✅ Deploy bem-sucedido  
✅ Backup criado  
✅ Documentação completa  

**Status Final**: 🟢 SISTEMA TOTALMENTE FUNCIONAL E ESTÁVEL ✅
