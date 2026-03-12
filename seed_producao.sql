-- Seeds para Produção - Sistema de Controle Centralizado v11

-- Inserir usuário administrador
INSERT OR IGNORE INTO designers (id, nome, ativo, role) VALUES 
  (1, 'admin', 1, 'admin');

-- Inserir usuários comuns (designers)
INSERT OR IGNORE INTO designers (id, nome, ativo, role) VALUES 
  (2, 'Amanda', 1, 'user'),
  (3, 'Bruno', 1, 'user'),
  (4, 'Carolina', 1, 'user'),
  (5, 'Diego', 1, 'user'),
  (6, 'Elena', 1, 'user');

-- Inserir produtos
INSERT OR IGNORE INTO produtos (id, nome, ativo) VALUES 
  (1, 'VOLLEY SUBLIMADO', 1),
  (2, 'VOLLEY JUVENIL', 1),
  (3, 'BOARDSHORT', 1),
  (4, 'BOARDSHORT JUVENIL', 1),
  (5, 'PASSEIO SUBLIMADO', 1),
  (6, 'BERMUDA MOLETOM', 1),
  (7, 'CAMISETA SUBLIMADA', 1),
  (8, 'CAMISETA ESTAMPADA', 1),
  (9, 'CAMISETA JUVENIL', 1),
  (10, 'REGATA SUBLIMADA', 1),
  (11, 'REGATA ESTAMPADA', 1),
  (12, 'REGATA MACHÃO', 1),
  (13, 'OVERSISED', 1);

-- Inserir metas de exemplo
INSERT OR IGNORE INTO metas (produto_id, meta_aprovacao, periodo_semanas) VALUES 
  (1, 100, 18),
  (3, 150, 18),
  (7, 80, 18);

-- Inserir planejamentos de exemplo para Janeiro/2026
-- O admin (id 1) cria planejamentos que todos os designers podem ver
INSERT OR IGNORE INTO produtos_planejados (produto_id, quantidade_planejada, periodo, admin_id) VALUES
  (1, 50, '2026-01', 1),  -- VOLLEY SUBLIMADO
  (2, 60, '2026-01', 1),  -- VOLLEY JUVENIL
  (3, 75, '2026-01', 1),  -- BOARDSHORT
  (7, 40, '2026-01', 1),  -- CAMISETA SUBLIMADA
  (8, 80, '2026-01', 1),  -- CAMISETA ESTAMPADA
  (10, 45, '2026-01', 1); -- REGATA SUBLIMADA
