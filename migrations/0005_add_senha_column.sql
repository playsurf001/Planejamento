-- Migration 0005: Adicionar coluna senha
-- Data: 2026-01-23

-- Adicionar coluna senha (NULL inicialmente)
ALTER TABLE designers ADD COLUMN senha TEXT;

-- Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_designers_nome ON designers(nome);
