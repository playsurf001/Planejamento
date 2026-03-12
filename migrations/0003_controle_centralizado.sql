-- Migration 0003: Sistema de Controle Centralizado - Roles e Produtos Planejados
-- Data: 2026-01-21
-- Descrição: Adicionar sistema de roles (admin/user) e tabela de produtos planejados

-- 1. Adicionar campo 'role' na tabela designers
ALTER TABLE designers ADD COLUMN role TEXT DEFAULT 'user' CHECK(role IN ('admin', 'user'));

-- 2. Atualizar o primeiro designer para admin (será o administrador padrão)
UPDATE designers SET role = 'admin' WHERE id = 1;

-- 3. Criar tabela de produtos planejados (controle do administrador)
CREATE TABLE IF NOT EXISTS produtos_planejados (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  produto_id INTEGER NOT NULL,
  quantidade_planejada INTEGER NOT NULL,
  semana INTEGER,
  mes INTEGER,
  ano INTEGER,
  periodo TEXT,  -- formato: YYYY-MM ou YYYY-WW
  admin_id INTEGER NOT NULL,  -- quem definiu
  status TEXT DEFAULT 'pendente' CHECK(status IN ('pendente', 'em_andamento', 'concluido')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (produto_id) REFERENCES produtos(id),
  FOREIGN KEY (admin_id) REFERENCES designers(id)
);

-- 4. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_produtos_planejados_produto ON produtos_planejados(produto_id);
CREATE INDEX IF NOT EXISTS idx_produtos_planejados_periodo ON produtos_planejados(periodo);
CREATE INDEX IF NOT EXISTS idx_produtos_planejados_status ON produtos_planejados(status);

-- 5. Criar índice único para evitar duplicação (produto + período)
CREATE UNIQUE INDEX IF NOT EXISTS idx_produtos_planejados_unique 
  ON produtos_planejados(produto_id, periodo);

-- 6. Adicionar campo para rastrear quem concluiu (usuário)
ALTER TABLE lancamentos ADD COLUMN planejamento_id INTEGER REFERENCES produtos_planejados(id);
ALTER TABLE lancamentos ADD COLUMN concluido_em DATETIME;
ALTER TABLE lancamentos ADD COLUMN concluido_por INTEGER REFERENCES designers(id);

-- 7. Criar view para facilitar consultas
CREATE VIEW IF NOT EXISTS vw_produtos_planejados AS
SELECT 
  pp.id,
  pp.produto_id,
  p.nome as produto_nome,
  pp.quantidade_planejada,
  pp.semana,
  pp.mes,
  pp.ano,
  pp.periodo,
  pp.status,
  pp.admin_id,
  da.nome as admin_nome,
  pp.created_at,
  pp.updated_at,
  -- Quantidade já concluída
  COALESCE(SUM(l.quantidade_criada), 0) as quantidade_concluida,
  -- Quantidade aprovada
  COALESCE(SUM(l.quantidade_aprovada), 0) as quantidade_aprovada,
  -- Progresso
  ROUND(CAST(COALESCE(SUM(l.quantidade_criada), 0) AS FLOAT) / pp.quantidade_planejada * 100, 2) as progresso_percent
FROM produtos_planejados pp
JOIN produtos p ON pp.produto_id = p.id
JOIN designers da ON pp.admin_id = da.id
LEFT JOIN lancamentos l ON pp.id = l.planejamento_id
GROUP BY pp.id, pp.produto_id, p.nome, pp.quantidade_planejada, 
         pp.semana, pp.mes, pp.ano, pp.periodo, pp.status, 
         pp.admin_id, da.nome, pp.created_at, pp.updated_at;
