-- Migration 0012: Add permissions and chart exclusion
-- Date: 2026-02-02
-- Description: Add custom permissions and exclude from performance chart

-- Add column to exclude from performance chart
ALTER TABLE designers ADD COLUMN excluir_grafico INTEGER DEFAULT 0;

-- Add column for custom permissions (JSON)
ALTER TABLE designers ADD COLUMN permissoes TEXT DEFAULT NULL;
