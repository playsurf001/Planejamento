-- Migration 0008: Planejamento Semanal por Usuário
-- Data: 2026-01-27
-- Descrição: Adiciona suporte para planejamento individual por usuário com semana ISO-8601

-- 1. Criar nova tabela de planejamentos semanais por usuário
CREATE TABLE IF NOT EXISTS planejamentos_semanais (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  designer_id INTEGER NOT NULL,
  produto_id INTEGER NOT NULL,
  quantidade_planejada INTEGER NOT NULL CHECK(quantidade_planejada > 0),
  semana_numero INTEGER NOT NULL CHECK(semana_numero >= 1 AND semana_numero <= 53),
  semana_data_inicio DATE NOT NULL,
  ano INTEGER NOT NULL,
  admin_id INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (designer_id) REFERENCES designers(id),
  FOREIGN KEY (produto_id) REFERENCES produtos(id),
  FOREIGN KEY (admin_id) REFERENCES designers(id)
);

-- 2. Índices para performance
CREATE INDEX IF NOT EXISTS idx_planejamentos_semanais_designer ON planejamentos_semanais(designer_id);
CREATE INDEX IF NOT EXISTS idx_planejamentos_semanais_semana ON planejamentos_semanais(semana_numero, ano);
CREATE INDEX IF NOT EXISTS idx_planejamentos_semanais_produto ON planejamentos_semanais(produto_id);

-- 3. Índice único para evitar duplicação (designer + produto + semana + ano)
CREATE UNIQUE INDEX IF NOT EXISTS idx_planejamentos_semanais_unique 
  ON planejamentos_semanais(designer_id, produto_id, semana_numero, ano);

-- 4. Adicionar campo de referência em lancamentos
ALTER TABLE lancamentos ADD COLUMN planejamento_semanal_id INTEGER REFERENCES planejamentos_semanais(id);
