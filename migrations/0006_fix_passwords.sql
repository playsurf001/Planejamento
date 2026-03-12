-- Migration: Corrigir senhas existentes
-- Data: 2026-01-23
-- Objetivo: Garantir que todos os usuários tenham senhas válidas

-- Definir senha do admin
UPDATE designers SET senha = 'rapboy123' WHERE LOWER(nome) = 'admin' OR id = 1;

-- Para todos os outros usuários (senha padrão)
UPDATE designers SET senha = 'rapboy' WHERE id != 1;
