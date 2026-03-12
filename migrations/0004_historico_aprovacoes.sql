-- Migration 0004: Tabela de Histórico de Aprovações
-- Data: 2026-01-22

CREATE TABLE IF NOT EXISTS historico_aprovacoes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  lancamento_id INTEGER NOT NULL,
  admin_id INTEGER NOT NULL,
  data_aprovacao DATETIME DEFAULT CURRENT_TIMESTAMP,
  observacao TEXT,
  tipo TEXT DEFAULT 'aprovacao' CHECK(tipo IN ('aprovacao', 'reprovacao')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (lancamento_id) REFERENCES lancamentos(id),
  FOREIGN KEY (admin_id) REFERENCES designers(id)
);

CREATE INDEX IF NOT EXISTS idx_historico_lancamento ON historico_aprovacoes(lancamento_id);
CREATE INDEX IF NOT EXISTS idx_historico_admin ON historico_aprovacoes(admin_id);
CREATE INDEX IF NOT EXISTS idx_historico_data ON historico_aprovacoes(data_aprovacao);
