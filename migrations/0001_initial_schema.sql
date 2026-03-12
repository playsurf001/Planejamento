-- Tabela de Designers
CREATE TABLE IF NOT EXISTS designers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  ativo INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Produtos
CREATE TABLE IF NOT EXISTS produtos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  ativo INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Lançamentos
CREATE TABLE IF NOT EXISTS lancamentos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  designer_id INTEGER NOT NULL,
  produto_id INTEGER NOT NULL,
  semana INTEGER NOT NULL,
  data DATE NOT NULL,
  quantidade_criada INTEGER DEFAULT 0,
  quantidade_aprovada INTEGER DEFAULT 0,
  criado_check INTEGER DEFAULT 0,
  aprovado_ok INTEGER DEFAULT 0,
  posicao INTEGER,
  status TEXT DEFAULT 'pendente',
  observacoes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (designer_id) REFERENCES designers(id),
  FOREIGN KEY (produto_id) REFERENCES produtos(id)
);

-- Tabela de Metas
CREATE TABLE IF NOT EXISTS metas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  designer_id INTEGER,
  produto_id INTEGER,
  semana INTEGER,
  mes INTEGER,
  ano INTEGER,
  meta_quantidade INTEGER DEFAULT 0,
  tipo TEXT DEFAULT 'semanal',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (designer_id) REFERENCES designers(id),
  FOREIGN KEY (produto_id) REFERENCES produtos(id)
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_lancamentos_designer ON lancamentos(designer_id);
CREATE INDEX IF NOT EXISTS idx_lancamentos_produto ON lancamentos(produto_id);
CREATE INDEX IF NOT EXISTS idx_lancamentos_semana ON lancamentos(semana);
CREATE INDEX IF NOT EXISTS idx_lancamentos_status ON lancamentos(status);
CREATE INDEX IF NOT EXISTS idx_metas_designer ON metas(designer_id);
CREATE INDEX IF NOT EXISTS idx_metas_produto ON metas(produto_id);
