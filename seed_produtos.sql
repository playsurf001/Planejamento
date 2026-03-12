-- Limpar lançamentos antigos com quantidade 0 e criar novos com valores reais
-- Semana 1 (06/01/2026)
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
VALUES 
  (16, 40, 1, '2026-01-06', 15, 12, 1, 1, 'completo'),
  (16, 42, 1, '2026-01-06', 10, 8, 1, 1, 'completo'),
  (16, 46, 1, '2026-01-06', 12, 10, 1, 1, 'completo'),
  (17, 40, 1, '2026-01-06', 12, 9, 1, 1, 'completo'),
  (17, 43, 1, '2026-01-06', 8, 6, 1, 1, 'completo'),
  (18, 42, 1, '2026-01-06', 14, 11, 1, 1, 'completo');

-- Semana 2 (13/01/2026)
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
VALUES 
  (16, 40, 2, '2026-01-13', 18, 15, 1, 1, 'completo'),
  (16, 44, 2, '2026-01-13', 11, 9, 1, 1, 'completo'),
  (18, 42, 2, '2026-01-13', 14, 11, 1, 1, 'completo'),
  (18, 46, 2, '2026-01-13', 20, 16, 1, 1, 'completo'),
  (19, 40, 2, '2026-01-13', 13, 10, 1, 1, 'completo'),
  (20, 43, 2, '2026-01-13', 9, 7, 1, 1, 'completo');

-- Semana 3 (20/01/2026)
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
VALUES 
  (16, 40, 3, '2026-01-20', 16, 14, 1, 1, 'completo'),
  (16, 42, 3, '2026-01-20', 12, 10, 1, 1, 'completo'),
  (17, 46, 3, '2026-01-20', 15, 12, 1, 1, 'completo'),
  (18, 40, 3, '2026-01-20', 14, 11, 1, 1, 'completo'),
  (19, 44, 3, '2026-01-20', 10, 8, 1, 1, 'completo'),
  (20, 42, 3, '2026-01-20', 11, 9, 1, 1, 'completo');

-- Semana 4 (27/01/2026)
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
VALUES 
  (16, 40, 4, '2026-01-27', 17, 15, 1, 1, 'completo'),
  (16, 43, 4, '2026-01-27', 9, 7, 1, 1, 'completo'),
  (17, 42, 4, '2026-01-27', 13, 11, 1, 1, 'completo'),
  (18, 46, 4, '2026-01-27', 19, 16, 1, 1, 'completo'),
  (19, 40, 4, '2026-01-27', 15, 12, 1, 1, 'completo'),
  (20, 44, 4, '2026-01-27', 12, 10, 1, 1, 'completo');
