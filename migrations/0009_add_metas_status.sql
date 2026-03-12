-- Migration 0009: Adicionar campos de status e aprovação à tabela metas
-- Data: 2026-01-29
-- Descrição: Adicionar campos para controlar aprovação e acompanhamento de metas

-- Adicionar campo status (pendente, aprovada, concluida)
ALTER TABLE metas ADD COLUMN status TEXT DEFAULT 'pendente' CHECK(status IN ('pendente', 'aprovada', 'concluida'));

-- Adicionar campo aprovada_em
ALTER TABLE metas ADD COLUMN aprovada_em DATETIME;

-- Adicionar campo concluida_em
ALTER TABLE metas ADD COLUMN concluida_em DATETIME;

-- Criar índice para performance em queries filtradas por status
CREATE INDEX IF NOT EXISTS idx_metas_status ON metas(status);

-- Criar índice para ordenação por aprovação
CREATE INDEX IF NOT EXISTS idx_metas_aprovada_em ON metas(aprovada_em);
