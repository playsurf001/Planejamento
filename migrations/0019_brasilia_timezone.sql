-- Migration 0019: Configurar fuso horário de Brasília para timestamps
-- Date: 2026-03-03
-- Description: Criar triggers para converter timestamps para horário de Brasília (UTC-3)

-- Nota: SQLite não suporta timezone nativamente, mas podemos ajustar via triggers
-- Esta migração é um placeholder - a conversão será feita no código da aplicação

-- O código TypeScript/JavaScript já foi atualizado para usar getBrasiliaDateTime()
-- que converte automaticamente para America/Sao_Paulo timezone

SELECT 1; -- Placeholder statement
