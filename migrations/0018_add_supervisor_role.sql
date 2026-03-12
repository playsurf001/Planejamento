-- Migration 0018: Add supervisor role to designers table
-- Date: 2026-03-02
-- Description: Remover CHECK constraint do role para permitir supervisor

-- Nota: D1 não suporta ALTER TABLE para modificar constraints com foreign keys ativas
-- Solução: Validação será feita no código da aplicação

-- Esta migration é apenas um placeholder para documentar a mudança
-- O role 'supervisor' será aceito via validação no código (src/auth.ts)

SELECT 1; -- Placeholder statement
