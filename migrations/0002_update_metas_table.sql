-- Migration 0002: Atualizar estrutura da tabela metas
-- Data: 2026-01-21
-- Descrição: Ajustar campos da tabela metas para corresponder à API

-- Dropar tabela antiga
DROP TABLE IF EXISTS metas;

-- Recriar tabela com estrutura correta
CREATE TABLE IF NOT EXISTS metas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  produto_id INTEGER NOT NULL,
  meta_aprovacao INTEGER NOT NULL,
  periodo_semanas INTEGER DEFAULT 18,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (produto_id) REFERENCES produtos(id)
);

-- Criar índice para performance
CREATE INDEX IF NOT EXISTS idx_metas_produto ON metas(produto_id);

-- Garantir que não haja metas duplicadas por produto
CREATE UNIQUE INDEX IF NOT EXISTS idx_metas_produto_unique ON metas(produto_id);
