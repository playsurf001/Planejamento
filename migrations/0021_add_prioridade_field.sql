-- Migration: Add prioridade field to lancamentos table
-- Date: 2026-03-11
-- Description: Add priority field for production queue ordering

-- Add prioridade column with default value 'media'
ALTER TABLE lancamentos ADD COLUMN prioridade TEXT DEFAULT 'media' CHECK(prioridade IN ('baixa', 'media', 'alta', 'urgente'));

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_lancamentos_prioridade ON lancamentos(prioridade);

-- Create compound index for queue ordering (prioridade + data)
CREATE INDEX IF NOT EXISTS idx_lancamentos_queue ON lancamentos(prioridade, data DESC);
