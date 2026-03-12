-- Seed users for testing
-- Admin user: admin / admin123
INSERT OR IGNORE INTO designers (id, nome, email, senha, role, ativo, created_at) 
VALUES (1, 'admin', 'admin@webapp.com', 'admin123', 'admin', 1, datetime('now'));

-- Regular user: designer1 / designer1123  
INSERT OR IGNORE INTO designers (id, nome, email, senha, role, ativo, created_at) 
VALUES (2, 'designer1', 'designer1@webapp.com', 'designer1123', 'user', 1, datetime('now'));

-- Regular user: designer2 / designer2123
INSERT OR IGNORE INTO designers (id, nome, email, senha, role, ativo, created_at) 
VALUES (3, 'designer2', 'designer2@webapp.com', 'designer2123', 'user', 1, datetime('now'));

-- Regular user: João Silva / joaosilva123
INSERT OR IGNORE INTO designers (id, nome, email, nome_exibicao, senha, role, ativo, created_at) 
VALUES (4, 'João Silva', 'joao@webapp.com', 'João', 'joaosilva123', 'user', 1, datetime('now'));

-- Regular user: Maria Santos / mariasantos123
INSERT OR IGNORE INTO designers (id, nome, email, nome_exibicao, senha, role, ativo, created_at) 
VALUES (5, 'Maria Santos', 'maria@webapp.com', 'Maria', 'mariasantos123', 'user', 1, datetime('now'));

-- Special user: Alexandre / alexandre123
-- Has custom permissions (dashboard, relatorios, metas, lancamentos, designers)
-- Excluded from performance chart
INSERT OR IGNORE INTO designers (id, nome, email, senha, role, ativo, excluir_grafico, permissoes, created_at) 
VALUES (6, 'Alexandre', 'alexandre@webapp.com', 'alexandre123', 'user', 1, 1, '{"dashboard":true,"relatorios":true,"metas":true,"lancamentos":true,"designers":true}', datetime('now'));

-- Regular user: Evandro / evandro123
-- Excluded from performance chart
INSERT OR IGNORE INTO designers (id, nome, email, senha, role, ativo, excluir_grafico, created_at) 
VALUES (7, 'Evandro', 'evandro@webapp.com', 'evandro123', 'user', 1, 1, datetime('now'));

-- Test some products
INSERT OR IGNORE INTO produtos (id, nome, ativo) VALUES (1, 'Produto A', 1);
INSERT OR IGNORE INTO produtos (id, nome, ativo) VALUES (2, 'Produto B', 1);
INSERT OR IGNORE INTO produtos (id, nome, ativo) VALUES (3, 'Produto C', 1);
