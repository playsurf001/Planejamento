-- Migration 0007: Adicionar campo quantidade_reprovada
-- Data: 2026-01-23
-- Descrição: Adiciona coluna quantidade_reprovada na tabela lancamentos para controle de produtos reprovados

-- Adicionar coluna quantidade_reprovada (padrão 0)
ALTER TABLE lancamentos ADD COLUMN quantidade_reprovada INTEGER DEFAULT 0;

-- Atualizar registros existentes onde status = 'reprovado'
-- Se um lançamento foi reprovado, quantidade_reprovada = quantidade_criada e quantidade_aprovada = 0
UPDATE lancamentos 
SET quantidade_reprovada = quantidade_criada,
    quantidade_aprovada = 0
WHERE status = 'reprovado' AND quantidade_reprovada IS NULL;

-- Para registros aprovados, garantir que reprovada = 0
UPDATE lancamentos 
SET quantidade_reprovada = 0
WHERE status = 'aprovado' AND quantidade_reprovada IS NULL;

-- Para registros em andamento/pendente, calcular reprovada com base na diferença
UPDATE lancamentos 
SET quantidade_reprovada = CASE 
  WHEN quantidade_criada > quantidade_aprovada THEN quantidade_criada - quantidade_aprovada
  ELSE 0
END
WHERE status IN ('em_andamento', 'pendente') AND quantidade_reprovada IS NULL;
