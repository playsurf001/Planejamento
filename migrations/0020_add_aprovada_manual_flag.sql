-- Migration: Adicionar flag aprovada_manual em lancamentos
-- Date: 2026-03-11
-- Description: Adiciona campo para identificar se quantidade_aprovada foi editada manualmente

-- Adicionar coluna aprovada_manual (0 = automático, 1 = manual)
ALTER TABLE lancamentos ADD COLUMN aprovada_manual INTEGER DEFAULT 0;

-- Criar índice para performance
CREATE INDEX IF NOT EXISTS idx_lancamentos_aprovada_manual ON lancamentos(aprovada_manual);
