-- Importação automática de Excel
-- Gerado em: 2026-01-08 19:24:31

-- Limpar dados existentes
DELETE FROM lancamentos;
DELETE FROM produtos;
DELETE FROM designers;

-- Inserir Designers
INSERT INTO designers (nome, ativo) VALUES ('Amanda', 1);
INSERT INTO designers (nome, ativo) VALUES ('Filiphe', 1);
INSERT INTO designers (nome, ativo) VALUES ('Lidivania', 1);
INSERT INTO designers (nome, ativo) VALUES ('Elison', 1);
INSERT INTO designers (nome, ativo) VALUES ('Wellington', 1);
INSERT INTO designers (nome, ativo) VALUES ('Vinicius', 1);

-- Inserir Produtos
INSERT INTO produtos (nome, ativo) VALUES ('VOLLEY SUBLIMADO', 1);
INSERT INTO produtos (nome, ativo) VALUES ('VOLLEY JUVENIL', 1);
INSERT INTO produtos (nome, ativo) VALUES ('BOARDSHORT', 1);
INSERT INTO produtos (nome, ativo) VALUES ('BOARDSHORT JUVENIL', 1);
INSERT INTO produtos (nome, ativo) VALUES ('PASSEIO SUBLIMADO', 1);
INSERT INTO produtos (nome, ativo) VALUES ('BERMUDA MOLETOM', 1);
INSERT INTO produtos (nome, ativo) VALUES ('CAMISETA SUBLIMADA', 1);
INSERT INTO produtos (nome, ativo) VALUES ('CAMISETA ESTAMPADA', 1);
INSERT INTO produtos (nome, ativo) VALUES ('CAMISETA JUVENIL', 1);
INSERT INTO produtos (nome, ativo) VALUES ('REGATA SUBLIMADA', 1);
INSERT INTO produtos (nome, ativo) VALUES ('REGATA ESTAMPADA', 1);
INSERT INTO produtos (nome, ativo) VALUES ('REGATA MACHÃO', 1);
INSERT INTO produtos (nome, ativo) VALUES ('OVERSIDED', 1);
INSERT INTO produtos (nome, ativo) VALUES ('OK', 1);

-- Inserir Lançamentos
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 1, '2025-10-06', 2, 2, 1, 1, 'completo'
FROM designers d, produtos p
WHERE d.nome = 'Amanda' AND p.nome = 'BOARDSHORT';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 1, '2025-10-06', 2, 2, 1, 1, 'completo'
FROM designers d, produtos p
WHERE d.nome = 'Amanda' AND p.nome = 'VOLLEY SUBLIMADO';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 1, '2025-10-06', 2, 1, 1, 1, 'completo'
FROM designers d, produtos p
WHERE d.nome = 'Amanda' AND p.nome = 'CAMISETA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 1, '2025-10-06', 2, 1, 1, 1, 'completo'
FROM designers d, produtos p
WHERE d.nome = 'Amanda' AND p.nome = 'REGATA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 1, '2025-10-06', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Amanda' AND p.nome = 'CAMISETA ESTAMPADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 1, '2025-10-06', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Amanda' AND p.nome = 'REGATA ESTAMPADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 2, '2025-10-13', 2, 2, 1, 1, 'completo'
FROM designers d, produtos p
WHERE d.nome = 'Amanda' AND p.nome = 'BOARDSHORT';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 2, '2025-10-13', 2, 2, 1, 1, 'completo'
FROM designers d, produtos p
WHERE d.nome = 'Amanda' AND p.nome = 'VOLLEY SUBLIMADO';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 2, '2025-10-13', 2, 2, 1, 1, 'completo'
FROM designers d, produtos p
WHERE d.nome = 'Amanda' AND p.nome = 'CAMISETA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 2, '2025-10-13', 2, 1, 1, 1, 'completo'
FROM designers d, produtos p
WHERE d.nome = 'Amanda' AND p.nome = 'REGATA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 2, '2025-10-13', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Amanda' AND p.nome = 'CAMISETA ESTAMPADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 2, '2025-10-13', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Amanda' AND p.nome = 'REGATA ESTAMPADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 3, '2025-10-20', 2, 2, 1, 1, 'completo'
FROM designers d, produtos p
WHERE d.nome = 'Amanda' AND p.nome = 'BOARDSHORT';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 3, '2025-10-20', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Amanda' AND p.nome = 'VOLLEY SUBLIMADO';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 3, '2025-10-20', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Amanda' AND p.nome = 'CAMISETA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 3, '2025-10-20', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Amanda' AND p.nome = 'REGATA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 3, '2025-10-20', 5, 5, 1, 1, 'completo'
FROM designers d, produtos p
WHERE d.nome = 'Amanda' AND p.nome = 'CAMISETA ESTAMPADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 3, '2025-10-20', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Amanda' AND p.nome = 'REGATA ESTAMPADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 4, '2025-10-27', 2, 2, 1, 1, 'completo'
FROM designers d, produtos p
WHERE d.nome = 'Amanda' AND p.nome = 'BOARDSHORT';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 4, '2025-10-27', 2, 2, 1, 1, 'completo'
FROM designers d, produtos p
WHERE d.nome = 'Amanda' AND p.nome = 'VOLLEY SUBLIMADO';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 4, '2025-10-27', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Amanda' AND p.nome = 'CAMISETA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 4, '2025-10-27', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Amanda' AND p.nome = 'REGATA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 4, '2025-10-27', 2, 2, 1, 1, 'completo'
FROM designers d, produtos p
WHERE d.nome = 'Amanda' AND p.nome = 'CAMISETA ESTAMPADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 4, '2025-10-27', 2, 2, 1, 1, 'completo'
FROM designers d, produtos p
WHERE d.nome = 'Amanda' AND p.nome = 'REGATA ESTAMPADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 5, '2025-11-03', 2, 2, 1, 1, 'completo'
FROM designers d, produtos p
WHERE d.nome = 'Amanda' AND p.nome = 'BOARDSHORT';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 5, '2025-11-03', 2, 1, 1, 1, 'completo'
FROM designers d, produtos p
WHERE d.nome = 'Amanda' AND p.nome = 'VOLLEY SUBLIMADO';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 5, '2025-11-03', 1, 1, 1, 1, 'completo'
FROM designers d, produtos p
WHERE d.nome = 'Amanda' AND p.nome = 'CAMISETA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 5, '2025-11-03', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Amanda' AND p.nome = 'REGATA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 5, '2025-11-03', 2, 0, 1, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Amanda' AND p.nome = 'CAMISETA ESTAMPADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 5, '2025-11-03', 2, 2, 1, 1, 'completo'
FROM designers d, produtos p
WHERE d.nome = 'Amanda' AND p.nome = 'REGATA ESTAMPADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 6, '2025-11-10', 2, 2, 1, 1, 'completo'
FROM designers d, produtos p
WHERE d.nome = 'Amanda' AND p.nome = 'BOARDSHORT';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 6, '2025-11-10', 2, 1, 1, 1, 'completo'
FROM designers d, produtos p
WHERE d.nome = 'Amanda' AND p.nome = 'VOLLEY SUBLIMADO';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 6, '2025-11-10', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Amanda' AND p.nome = 'CAMISETA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 6, '2025-11-10', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Amanda' AND p.nome = 'REGATA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 6, '2025-11-10', 2, 2, 1, 1, 'completo'
FROM designers d, produtos p
WHERE d.nome = 'Amanda' AND p.nome = 'CAMISETA ESTAMPADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 6, '2025-11-10', 2, 2, 1, 1, 'completo'
FROM designers d, produtos p
WHERE d.nome = 'Amanda' AND p.nome = 'REGATA ESTAMPADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 7, '2025-11-17', 2, 2, 1, 1, 'completo'
FROM designers d, produtos p
WHERE d.nome = 'Amanda' AND p.nome = 'BOARDSHORT';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 7, '2025-11-17', 2, 1, 1, 1, 'completo'
FROM designers d, produtos p
WHERE d.nome = 'Amanda' AND p.nome = 'VOLLEY SUBLIMADO';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 7, '2025-11-17', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Amanda' AND p.nome = 'CAMISETA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 7, '2025-11-17', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Amanda' AND p.nome = 'REGATA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 7, '2025-11-17', 2, 2, 1, 1, 'completo'
FROM designers d, produtos p
WHERE d.nome = 'Amanda' AND p.nome = 'CAMISETA ESTAMPADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 7, '2025-11-17', 2, 2, 1, 1, 'completo'
FROM designers d, produtos p
WHERE d.nome = 'Amanda' AND p.nome = 'REGATA ESTAMPADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 8, '2025-11-24', 2, 2, 1, 1, 'completo'
FROM designers d, produtos p
WHERE d.nome = 'Amanda' AND p.nome = 'BOARDSHORT';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 8, '2025-11-24', 2, 2, 1, 1, 'completo'
FROM designers d, produtos p
WHERE d.nome = 'Amanda' AND p.nome = 'VOLLEY SUBLIMADO';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 8, '2025-11-24', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Amanda' AND p.nome = 'CAMISETA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 8, '2025-11-24', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Amanda' AND p.nome = 'REGATA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 8, '2025-11-24', 2, 1, 1, 1, 'completo'
FROM designers d, produtos p
WHERE d.nome = 'Amanda' AND p.nome = 'CAMISETA ESTAMPADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 8, '2025-11-24', 2, 1, 1, 1, 'completo'
FROM designers d, produtos p
WHERE d.nome = 'Amanda' AND p.nome = 'REGATA ESTAMPADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 9, '2025-12-01', 2, 2, 1, 1, 'completo'
FROM designers d, produtos p
WHERE d.nome = 'Amanda' AND p.nome = 'BOARDSHORT';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 9, '2025-12-01', 2, 2, 1, 1, 'completo'
FROM designers d, produtos p
WHERE d.nome = 'Amanda' AND p.nome = 'VOLLEY SUBLIMADO';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 9, '2025-12-01', 2, 0, 1, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Amanda' AND p.nome = 'CAMISETA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 9, '2025-12-01', 2, 2, 1, 1, 'completo'
FROM designers d, produtos p
WHERE d.nome = 'Amanda' AND p.nome = 'REGATA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 10, '2025-12-08', 2, 1, 1, 1, 'completo'
FROM designers d, produtos p
WHERE d.nome = 'Amanda' AND p.nome = 'BOARDSHORT';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 10, '2025-12-08', 2, 2, 1, 1, 'completo'
FROM designers d, produtos p
WHERE d.nome = 'Amanda' AND p.nome = 'VOLLEY SUBLIMADO';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 10, '2025-12-08', 2, 1, 1, 1, 'completo'
FROM designers d, produtos p
WHERE d.nome = 'Amanda' AND p.nome = 'CAMISETA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 10, '2025-12-08', 2, 2, 1, 1, 'completo'
FROM designers d, produtos p
WHERE d.nome = 'Amanda' AND p.nome = 'REGATA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 11, '2025-12-15', 2, 0, 1, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Amanda' AND p.nome = 'BOARDSHORT';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 11, '2025-12-15', 2, 0, 1, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Amanda' AND p.nome = 'VOLLEY SUBLIMADO';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 11, '2025-12-15', 2, 0, 1, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Amanda' AND p.nome = 'CAMISETA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 11, '2025-12-15', 2, 0, 1, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Amanda' AND p.nome = 'REGATA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 12, '2025-12-22', 3, 0, 1, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Amanda' AND p.nome = 'BOARDSHORT';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 12, '2025-12-22', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Amanda' AND p.nome = 'VOLLEY SUBLIMADO';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 12, '2025-12-22', 3, 0, 1, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Amanda' AND p.nome = 'CAMISETA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 12, '2025-12-22', 2, 0, 1, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Amanda' AND p.nome = 'REGATA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 13, '2025-12-29', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Amanda' AND p.nome = 'BOARDSHORT';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 13, '2025-12-29', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Amanda' AND p.nome = 'VOLLEY SUBLIMADO';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 13, '2025-12-29', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Amanda' AND p.nome = 'CAMISETA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 13, '2025-12-29', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Amanda' AND p.nome = 'REGATA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 14, '2026-01-05', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Amanda' AND p.nome = 'BOARDSHORT';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 14, '2026-01-05', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Amanda' AND p.nome = 'VOLLEY SUBLIMADO';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 14, '2026-01-05', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Amanda' AND p.nome = 'CAMISETA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 14, '2026-01-05', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Amanda' AND p.nome = 'REGATA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 15, '2026-01-12', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Amanda' AND p.nome = 'BOARDSHORT';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 15, '2026-01-12', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Amanda' AND p.nome = 'VOLLEY SUBLIMADO';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 15, '2026-01-12', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Amanda' AND p.nome = 'CAMISETA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 15, '2026-01-12', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Amanda' AND p.nome = 'REGATA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 16, '2026-01-19', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Amanda' AND p.nome = 'BOARDSHORT';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 16, '2026-01-19', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Amanda' AND p.nome = 'VOLLEY SUBLIMADO';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 16, '2026-01-19', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Amanda' AND p.nome = 'CAMISETA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 16, '2026-01-19', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Amanda' AND p.nome = 'REGATA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 17, '2026-01-26', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Amanda' AND p.nome = 'BOARDSHORT';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 17, '2026-01-26', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Amanda' AND p.nome = 'VOLLEY SUBLIMADO';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 17, '2026-01-26', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Amanda' AND p.nome = 'CAMISETA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 17, '2026-01-26', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Amanda' AND p.nome = 'REGATA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 18, '2026-02-02', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Amanda' AND p.nome = 'BOARDSHORT';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 18, '2026-02-02', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Amanda' AND p.nome = 'VOLLEY SUBLIMADO';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 18, '2026-02-02', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Amanda' AND p.nome = 'CAMISETA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 18, '2026-02-02', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Amanda' AND p.nome = 'REGATA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 1, '2025-10-06', 2, 0, 1, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Filiphe' AND p.nome = 'BOARDSHORT';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 1, '2025-10-06', 2, 2, 1, 1, 'completo'
FROM designers d, produtos p
WHERE d.nome = 'Filiphe' AND p.nome = 'VOLLEY SUBLIMADO';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 1, '2025-10-06', 2, 0, 1, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Filiphe' AND p.nome = 'CAMISETA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 1, '2025-10-06', 2, 0, 1, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Filiphe' AND p.nome = 'REGATA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 1, '2025-10-06', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Filiphe' AND p.nome = 'CAMISETA ESTAMPADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 1, '2025-10-06', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Filiphe' AND p.nome = 'REGATA ESTAMPADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 2, '2025-10-13', 2, 1, 1, 1, 'completo'
FROM designers d, produtos p
WHERE d.nome = 'Filiphe' AND p.nome = 'BOARDSHORT';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 2, '2025-10-13', 2, 1, 1, 1, 'completo'
FROM designers d, produtos p
WHERE d.nome = 'Filiphe' AND p.nome = 'VOLLEY SUBLIMADO';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 2, '2025-10-13', 2, 1, 1, 1, 'completo'
FROM designers d, produtos p
WHERE d.nome = 'Filiphe' AND p.nome = 'CAMISETA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 2, '2025-10-13', 2, 1, 1, 1, 'completo'
FROM designers d, produtos p
WHERE d.nome = 'Filiphe' AND p.nome = 'REGATA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 2, '2025-10-13', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Filiphe' AND p.nome = 'CAMISETA ESTAMPADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 2, '2025-10-13', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Filiphe' AND p.nome = 'REGATA ESTAMPADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 3, '2025-10-20', 2, 1, 1, 1, 'completo'
FROM designers d, produtos p
WHERE d.nome = 'Filiphe' AND p.nome = 'BOARDSHORT';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 3, '2025-10-20', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Filiphe' AND p.nome = 'VOLLEY SUBLIMADO';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 3, '2025-10-20', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Filiphe' AND p.nome = 'CAMISETA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 3, '2025-10-20', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Filiphe' AND p.nome = 'REGATA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 3, '2025-10-20', 5, 4, 1, 1, 'completo'
FROM designers d, produtos p
WHERE d.nome = 'Filiphe' AND p.nome = 'CAMISETA ESTAMPADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 3, '2025-10-20', 1, 0, 1, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Filiphe' AND p.nome = 'REGATA ESTAMPADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 4, '2025-10-27', 2, 0, 1, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Filiphe' AND p.nome = 'BOARDSHORT';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 4, '2025-10-27', 2, 2, 1, 1, 'completo'
FROM designers d, produtos p
WHERE d.nome = 'Filiphe' AND p.nome = 'VOLLEY SUBLIMADO';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 4, '2025-10-27', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Filiphe' AND p.nome = 'CAMISETA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 4, '2025-10-27', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Filiphe' AND p.nome = 'REGATA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 4, '2025-10-27', 2, 2, 1, 1, 'completo'
FROM designers d, produtos p
WHERE d.nome = 'Filiphe' AND p.nome = 'CAMISETA ESTAMPADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 4, '2025-10-27', 2, 2, 1, 1, 'completo'
FROM designers d, produtos p
WHERE d.nome = 'Filiphe' AND p.nome = 'REGATA ESTAMPADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 5, '2025-11-03', 2, 0, 1, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Filiphe' AND p.nome = 'BOARDSHORT';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 5, '2025-11-03', 2, 0, 1, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Filiphe' AND p.nome = 'VOLLEY SUBLIMADO';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 5, '2025-11-03', 1, 1, 1, 1, 'completo'
FROM designers d, produtos p
WHERE d.nome = 'Filiphe' AND p.nome = 'CAMISETA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 5, '2025-11-03', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Filiphe' AND p.nome = 'REGATA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 5, '2025-11-03', 2, 2, 1, 1, 'completo'
FROM designers d, produtos p
WHERE d.nome = 'Filiphe' AND p.nome = 'CAMISETA ESTAMPADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 5, '2025-11-03', 2, 2, 1, 1, 'completo'
FROM designers d, produtos p
WHERE d.nome = 'Filiphe' AND p.nome = 'REGATA ESTAMPADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 6, '2025-11-10', 2, 0, 1, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Filiphe' AND p.nome = 'BOARDSHORT';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 6, '2025-11-10', 2, 0, 1, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Filiphe' AND p.nome = 'VOLLEY SUBLIMADO';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 6, '2025-11-10', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Filiphe' AND p.nome = 'CAMISETA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 6, '2025-11-10', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Filiphe' AND p.nome = 'REGATA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 6, '2025-11-10', 2, 2, 1, 1, 'completo'
FROM designers d, produtos p
WHERE d.nome = 'Filiphe' AND p.nome = 'CAMISETA ESTAMPADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 6, '2025-11-10', 2, 2, 1, 1, 'completo'
FROM designers d, produtos p
WHERE d.nome = 'Filiphe' AND p.nome = 'REGATA ESTAMPADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 7, '2025-11-17', 2, 0, 1, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Filiphe' AND p.nome = 'BOARDSHORT';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 7, '2025-11-17', 2, 2, 1, 1, 'completo'
FROM designers d, produtos p
WHERE d.nome = 'Filiphe' AND p.nome = 'VOLLEY SUBLIMADO';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 7, '2025-11-17', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Filiphe' AND p.nome = 'CAMISETA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 7, '2025-11-17', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Filiphe' AND p.nome = 'REGATA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 7, '2025-11-17', 2, 2, 1, 1, 'completo'
FROM designers d, produtos p
WHERE d.nome = 'Filiphe' AND p.nome = 'CAMISETA ESTAMPADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 7, '2025-11-17', 2, 1, 1, 1, 'completo'
FROM designers d, produtos p
WHERE d.nome = 'Filiphe' AND p.nome = 'REGATA ESTAMPADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 8, '2025-11-24', 2, 2, 1, 1, 'completo'
FROM designers d, produtos p
WHERE d.nome = 'Filiphe' AND p.nome = 'BOARDSHORT';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 8, '2025-11-24', 2, 2, 1, 1, 'completo'
FROM designers d, produtos p
WHERE d.nome = 'Filiphe' AND p.nome = 'VOLLEY SUBLIMADO';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 8, '2025-11-24', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Filiphe' AND p.nome = 'CAMISETA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 8, '2025-11-24', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Filiphe' AND p.nome = 'REGATA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 8, '2025-11-24', 2, 1, 1, 1, 'completo'
FROM designers d, produtos p
WHERE d.nome = 'Filiphe' AND p.nome = 'CAMISETA ESTAMPADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 8, '2025-11-24', 2, 0, 1, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Filiphe' AND p.nome = 'REGATA ESTAMPADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 9, '2025-12-01', 2, 0, 1, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Filiphe' AND p.nome = 'BOARDSHORT';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 9, '2025-12-01', 2, 0, 1, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Filiphe' AND p.nome = 'VOLLEY SUBLIMADO';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 9, '2025-12-01', 2, 0, 1, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Filiphe' AND p.nome = 'CAMISETA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 9, '2025-12-01', 2, 0, 1, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Filiphe' AND p.nome = 'REGATA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 10, '2025-12-08', 2, 2, 1, 1, 'completo'
FROM designers d, produtos p
WHERE d.nome = 'Filiphe' AND p.nome = 'BOARDSHORT';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 10, '2025-12-08', 2, 1, 1, 1, 'completo'
FROM designers d, produtos p
WHERE d.nome = 'Filiphe' AND p.nome = 'VOLLEY SUBLIMADO';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 10, '2025-12-08', 3, 3, 1, 1, 'completo'
FROM designers d, produtos p
WHERE d.nome = 'Filiphe' AND p.nome = 'CAMISETA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 10, '2025-12-08', 3, 3, 1, 1, 'completo'
FROM designers d, produtos p
WHERE d.nome = 'Filiphe' AND p.nome = 'REGATA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 11, '2025-12-15', 2, 0, 1, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Filiphe' AND p.nome = 'BOARDSHORT';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 11, '2025-12-15', 2, 0, 1, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Filiphe' AND p.nome = 'VOLLEY SUBLIMADO';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 11, '2025-12-15', 2, 0, 1, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Filiphe' AND p.nome = 'CAMISETA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 11, '2025-12-15', 2, 0, 1, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Filiphe' AND p.nome = 'REGATA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 12, '2025-12-22', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Filiphe' AND p.nome = 'BOARDSHORT';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 12, '2025-12-22', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Filiphe' AND p.nome = 'VOLLEY SUBLIMADO';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 12, '2025-12-22', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Filiphe' AND p.nome = 'CAMISETA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 12, '2025-12-22', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Filiphe' AND p.nome = 'REGATA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 13, '2025-12-29', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Filiphe' AND p.nome = 'BOARDSHORT';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 13, '2025-12-29', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Filiphe' AND p.nome = 'VOLLEY SUBLIMADO';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 13, '2025-12-29', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Filiphe' AND p.nome = 'CAMISETA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 13, '2025-12-29', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Filiphe' AND p.nome = 'REGATA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 14, '2026-01-05', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Filiphe' AND p.nome = 'BOARDSHORT';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 14, '2026-01-05', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Filiphe' AND p.nome = 'VOLLEY SUBLIMADO';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 14, '2026-01-05', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Filiphe' AND p.nome = 'CAMISETA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 14, '2026-01-05', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Filiphe' AND p.nome = 'REGATA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 15, '2026-01-12', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Filiphe' AND p.nome = 'BOARDSHORT';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 15, '2026-01-12', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Filiphe' AND p.nome = 'VOLLEY SUBLIMADO';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 15, '2026-01-12', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Filiphe' AND p.nome = 'CAMISETA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 15, '2026-01-12', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Filiphe' AND p.nome = 'REGATA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 16, '2026-01-19', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Filiphe' AND p.nome = 'BOARDSHORT';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 16, '2026-01-19', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Filiphe' AND p.nome = 'VOLLEY SUBLIMADO';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 16, '2026-01-19', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Filiphe' AND p.nome = 'CAMISETA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 16, '2026-01-19', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Filiphe' AND p.nome = 'REGATA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 17, '2026-01-26', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Filiphe' AND p.nome = 'BOARDSHORT';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 17, '2026-01-26', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Filiphe' AND p.nome = 'VOLLEY SUBLIMADO';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 17, '2026-01-26', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Filiphe' AND p.nome = 'CAMISETA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 17, '2026-01-26', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Filiphe' AND p.nome = 'REGATA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 18, '2026-02-02', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Filiphe' AND p.nome = 'BOARDSHORT';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 18, '2026-02-02', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Filiphe' AND p.nome = 'VOLLEY SUBLIMADO';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 18, '2026-02-02', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Filiphe' AND p.nome = 'CAMISETA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 18, '2026-02-02', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Filiphe' AND p.nome = 'REGATA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 1, '2025-10-06', 2, 2, 1, 1, 'completo'
FROM designers d, produtos p
WHERE d.nome = 'Lidivania' AND p.nome = 'BOARDSHORT';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 1, '2025-10-06', 2, 1, 1, 1, 'completo'
FROM designers d, produtos p
WHERE d.nome = 'Lidivania' AND p.nome = 'VOLLEY SUBLIMADO';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 1, '2025-10-06', 2, 0, 1, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Lidivania' AND p.nome = 'CAMISETA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 1, '2025-10-06', 2, 1, 1, 1, 'completo'
FROM designers d, produtos p
WHERE d.nome = 'Lidivania' AND p.nome = 'REGATA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 1, '2025-10-06', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Lidivania' AND p.nome = 'CAMISETA ESTAMPADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 1, '2025-10-06', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Lidivania' AND p.nome = 'REGATA ESTAMPADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 2, '2025-10-13', 2, 2, 1, 1, 'completo'
FROM designers d, produtos p
WHERE d.nome = 'Lidivania' AND p.nome = 'BOARDSHORT';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 2, '2025-10-13', 2, 2, 1, 1, 'completo'
FROM designers d, produtos p
WHERE d.nome = 'Lidivania' AND p.nome = 'VOLLEY SUBLIMADO';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 2, '2025-10-13', 2, 1, 1, 1, 'completo'
FROM designers d, produtos p
WHERE d.nome = 'Lidivania' AND p.nome = 'CAMISETA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 2, '2025-10-13', 2, 2, 1, 1, 'completo'
FROM designers d, produtos p
WHERE d.nome = 'Lidivania' AND p.nome = 'REGATA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 2, '2025-10-13', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Lidivania' AND p.nome = 'CAMISETA ESTAMPADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 2, '2025-10-13', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Lidivania' AND p.nome = 'REGATA ESTAMPADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 3, '2025-10-20', 2, 2, 1, 1, 'completo'
FROM designers d, produtos p
WHERE d.nome = 'Lidivania' AND p.nome = 'BOARDSHORT';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 3, '2025-10-20', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Lidivania' AND p.nome = 'VOLLEY SUBLIMADO';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 3, '2025-10-20', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Lidivania' AND p.nome = 'CAMISETA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 3, '2025-10-20', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Lidivania' AND p.nome = 'REGATA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 3, '2025-10-20', 5, 5, 1, 1, 'completo'
FROM designers d, produtos p
WHERE d.nome = 'Lidivania' AND p.nome = 'CAMISETA ESTAMPADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 3, '2025-10-20', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Lidivania' AND p.nome = 'REGATA ESTAMPADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 4, '2025-10-27', 2, 2, 1, 1, 'completo'
FROM designers d, produtos p
WHERE d.nome = 'Lidivania' AND p.nome = 'BOARDSHORT';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 4, '2025-10-27', 2, 2, 1, 1, 'completo'
FROM designers d, produtos p
WHERE d.nome = 'Lidivania' AND p.nome = 'VOLLEY SUBLIMADO';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 4, '2025-10-27', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Lidivania' AND p.nome = 'CAMISETA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 4, '2025-10-27', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Lidivania' AND p.nome = 'REGATA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 4, '2025-10-27', 2, 2, 1, 1, 'completo'
FROM designers d, produtos p
WHERE d.nome = 'Lidivania' AND p.nome = 'CAMISETA ESTAMPADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 4, '2025-10-27', 2, 2, 1, 1, 'completo'
FROM designers d, produtos p
WHERE d.nome = 'Lidivania' AND p.nome = 'REGATA ESTAMPADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 5, '2025-11-03', 2, 2, 1, 1, 'completo'
FROM designers d, produtos p
WHERE d.nome = 'Lidivania' AND p.nome = 'BOARDSHORT';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 5, '2025-11-03', 2, 2, 1, 1, 'completo'
FROM designers d, produtos p
WHERE d.nome = 'Lidivania' AND p.nome = 'VOLLEY SUBLIMADO';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 5, '2025-11-03', 1, 1, 1, 1, 'completo'
FROM designers d, produtos p
WHERE d.nome = 'Lidivania' AND p.nome = 'CAMISETA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 5, '2025-11-03', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Lidivania' AND p.nome = 'REGATA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 5, '2025-11-03', 2, 2, 1, 1, 'completo'
FROM designers d, produtos p
WHERE d.nome = 'Lidivania' AND p.nome = 'CAMISETA ESTAMPADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 5, '2025-11-03', 2, 2, 1, 1, 'completo'
FROM designers d, produtos p
WHERE d.nome = 'Lidivania' AND p.nome = 'REGATA ESTAMPADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 6, '2025-11-10', 2, 2, 1, 1, 'completo'
FROM designers d, produtos p
WHERE d.nome = 'Lidivania' AND p.nome = 'BOARDSHORT';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 6, '2025-11-10', 2, 2, 1, 1, 'completo'
FROM designers d, produtos p
WHERE d.nome = 'Lidivania' AND p.nome = 'VOLLEY SUBLIMADO';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 6, '2025-11-10', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Lidivania' AND p.nome = 'CAMISETA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 6, '2025-11-10', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Lidivania' AND p.nome = 'REGATA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 6, '2025-11-10', 2, 2, 1, 1, 'completo'
FROM designers d, produtos p
WHERE d.nome = 'Lidivania' AND p.nome = 'CAMISETA ESTAMPADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 6, '2025-11-10', 2, 2, 1, 1, 'completo'
FROM designers d, produtos p
WHERE d.nome = 'Lidivania' AND p.nome = 'REGATA ESTAMPADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 7, '2025-11-17', 2, 2, 1, 1, 'completo'
FROM designers d, produtos p
WHERE d.nome = 'Lidivania' AND p.nome = 'BOARDSHORT';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 7, '2025-11-17', 2, 0, 1, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Lidivania' AND p.nome = 'VOLLEY SUBLIMADO';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 7, '2025-11-17', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Lidivania' AND p.nome = 'CAMISETA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 7, '2025-11-17', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Lidivania' AND p.nome = 'REGATA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 7, '2025-11-17', 2, 1, 1, 1, 'completo'
FROM designers d, produtos p
WHERE d.nome = 'Lidivania' AND p.nome = 'CAMISETA ESTAMPADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 7, '2025-11-17', 2, 2, 1, 1, 'completo'
FROM designers d, produtos p
WHERE d.nome = 'Lidivania' AND p.nome = 'REGATA ESTAMPADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 8, '2025-11-24', 2, 0, 1, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Lidivania' AND p.nome = 'BOARDSHORT';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 8, '2025-11-24', 2, 0, 1, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Lidivania' AND p.nome = 'VOLLEY SUBLIMADO';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 8, '2025-11-24', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Lidivania' AND p.nome = 'CAMISETA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 8, '2025-11-24', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Lidivania' AND p.nome = 'REGATA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 8, '2025-11-24', 2, 1, 1, 1, 'completo'
FROM designers d, produtos p
WHERE d.nome = 'Lidivania' AND p.nome = 'CAMISETA ESTAMPADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 8, '2025-11-24', 2, 1, 1, 1, 'completo'
FROM designers d, produtos p
WHERE d.nome = 'Lidivania' AND p.nome = 'REGATA ESTAMPADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 9, '2025-12-01', 2, 2, 1, 1, 'completo'
FROM designers d, produtos p
WHERE d.nome = 'Lidivania' AND p.nome = 'BOARDSHORT';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 9, '2025-12-01', 2, 2, 1, 1, 'completo'
FROM designers d, produtos p
WHERE d.nome = 'Lidivania' AND p.nome = 'VOLLEY SUBLIMADO';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 9, '2025-12-01', 2, 2, 1, 1, 'completo'
FROM designers d, produtos p
WHERE d.nome = 'Lidivania' AND p.nome = 'CAMISETA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 9, '2025-12-01', 2, 2, 1, 1, 'completo'
FROM designers d, produtos p
WHERE d.nome = 'Lidivania' AND p.nome = 'REGATA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 10, '2025-12-08', 2, 2, 1, 1, 'completo'
FROM designers d, produtos p
WHERE d.nome = 'Lidivania' AND p.nome = 'BOARDSHORT';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 10, '2025-12-08', 2, 0, 1, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Lidivania' AND p.nome = 'VOLLEY SUBLIMADO';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 10, '2025-12-08', 2, 2, 1, 1, 'completo'
FROM designers d, produtos p
WHERE d.nome = 'Lidivania' AND p.nome = 'CAMISETA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 10, '2025-12-08', 2, 2, 1, 1, 'completo'
FROM designers d, produtos p
WHERE d.nome = 'Lidivania' AND p.nome = 'REGATA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 11, '2025-12-15', 2, 0, 1, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Lidivania' AND p.nome = 'BOARDSHORT';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 11, '2025-12-15', 2, 0, 1, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Lidivania' AND p.nome = 'VOLLEY SUBLIMADO';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 11, '2025-12-15', 2, 0, 1, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Lidivania' AND p.nome = 'CAMISETA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 11, '2025-12-15', 2, 0, 1, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Lidivania' AND p.nome = 'REGATA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 12, '2025-12-22', 3, 0, 1, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Lidivania' AND p.nome = 'BOARDSHORT';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 12, '2025-12-22', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Lidivania' AND p.nome = 'VOLLEY SUBLIMADO';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 12, '2025-12-22', 3, 0, 1, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Lidivania' AND p.nome = 'CAMISETA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 12, '2025-12-22', 2, 0, 1, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Lidivania' AND p.nome = 'REGATA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 13, '2025-12-29', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Lidivania' AND p.nome = 'BOARDSHORT';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 13, '2025-12-29', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Lidivania' AND p.nome = 'VOLLEY SUBLIMADO';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 13, '2025-12-29', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Lidivania' AND p.nome = 'CAMISETA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 13, '2025-12-29', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Lidivania' AND p.nome = 'REGATA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 14, '2026-01-05', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Lidivania' AND p.nome = 'BOARDSHORT';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 14, '2026-01-05', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Lidivania' AND p.nome = 'VOLLEY SUBLIMADO';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 14, '2026-01-05', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Lidivania' AND p.nome = 'CAMISETA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 14, '2026-01-05', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Lidivania' AND p.nome = 'REGATA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 15, '2026-01-12', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Lidivania' AND p.nome = 'BOARDSHORT';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 15, '2026-01-12', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Lidivania' AND p.nome = 'VOLLEY SUBLIMADO';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 15, '2026-01-12', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Lidivania' AND p.nome = 'CAMISETA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 15, '2026-01-12', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Lidivania' AND p.nome = 'REGATA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 16, '2026-01-19', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Lidivania' AND p.nome = 'BOARDSHORT';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 16, '2026-01-19', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Lidivania' AND p.nome = 'VOLLEY SUBLIMADO';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 16, '2026-01-19', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Lidivania' AND p.nome = 'CAMISETA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 16, '2026-01-19', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Lidivania' AND p.nome = 'REGATA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 17, '2026-01-26', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Lidivania' AND p.nome = 'BOARDSHORT';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 17, '2026-01-26', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Lidivania' AND p.nome = 'VOLLEY SUBLIMADO';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 17, '2026-01-26', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Lidivania' AND p.nome = 'CAMISETA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 17, '2026-01-26', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Lidivania' AND p.nome = 'REGATA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 18, '2026-02-02', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Lidivania' AND p.nome = 'BOARDSHORT';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 18, '2026-02-02', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Lidivania' AND p.nome = 'VOLLEY SUBLIMADO';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 18, '2026-02-02', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Lidivania' AND p.nome = 'CAMISETA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 18, '2026-02-02', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Lidivania' AND p.nome = 'REGATA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 1, '2025-10-06', 2, 0, 1, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Vinicius' AND p.nome = 'BOARDSHORT';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 1, '2025-10-06', 2, 1, 1, 1, 'completo'
FROM designers d, produtos p
WHERE d.nome = 'Vinicius' AND p.nome = 'VOLLEY SUBLIMADO';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 1, '2025-10-06', 2, 1, 1, 1, 'completo'
FROM designers d, produtos p
WHERE d.nome = 'Vinicius' AND p.nome = 'CAMISETA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 1, '2025-10-06', 2, 0, 1, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Vinicius' AND p.nome = 'REGATA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 1, '2025-10-06', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Vinicius' AND p.nome = 'CAMISETA ESTAMPADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 1, '2025-10-06', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Vinicius' AND p.nome = 'REGATA ESTAMPADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 2, '2025-10-13', 2, 1, 1, 1, 'completo'
FROM designers d, produtos p
WHERE d.nome = 'Vinicius' AND p.nome = 'BOARDSHORT';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 2, '2025-10-13', 2, 2, 1, 1, 'completo'
FROM designers d, produtos p
WHERE d.nome = 'Vinicius' AND p.nome = 'VOLLEY SUBLIMADO';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 2, '2025-10-13', 2, 0, 1, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Vinicius' AND p.nome = 'CAMISETA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 2, '2025-10-13', 2, 0, 1, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Vinicius' AND p.nome = 'REGATA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 2, '2025-10-13', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Vinicius' AND p.nome = 'CAMISETA ESTAMPADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 2, '2025-10-13', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Vinicius' AND p.nome = 'REGATA ESTAMPADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 3, '2025-10-20', 2, 2, 1, 1, 'completo'
FROM designers d, produtos p
WHERE d.nome = 'Vinicius' AND p.nome = 'BOARDSHORT';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 3, '2025-10-20', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Vinicius' AND p.nome = 'VOLLEY SUBLIMADO';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 3, '2025-10-20', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Vinicius' AND p.nome = 'CAMISETA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 3, '2025-10-20', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Vinicius' AND p.nome = 'REGATA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 3, '2025-10-20', 3, 2, 1, 1, 'completo'
FROM designers d, produtos p
WHERE d.nome = 'Vinicius' AND p.nome = 'CAMISETA ESTAMPADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 3, '2025-10-20', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Vinicius' AND p.nome = 'REGATA ESTAMPADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 4, '2025-10-27', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Vinicius' AND p.nome = 'BOARDSHORT';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 4, '2025-10-27', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Vinicius' AND p.nome = 'VOLLEY SUBLIMADO';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 4, '2025-10-27', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Vinicius' AND p.nome = 'CAMISETA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 4, '2025-10-27', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Vinicius' AND p.nome = 'REGATA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 4, '2025-10-27', 2, 0, 1, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Vinicius' AND p.nome = 'CAMISETA ESTAMPADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 4, '2025-10-27', 2, 0, 1, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Vinicius' AND p.nome = 'REGATA ESTAMPADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 5, '2025-11-03', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Vinicius' AND p.nome = 'BOARDSHORT';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 5, '2025-11-03', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Vinicius' AND p.nome = 'VOLLEY SUBLIMADO';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 5, '2025-11-03', 1, 1, 1, 1, 'completo'
FROM designers d, produtos p
WHERE d.nome = 'Vinicius' AND p.nome = 'CAMISETA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 5, '2025-11-03', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Vinicius' AND p.nome = 'REGATA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 5, '2025-11-03', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Vinicius' AND p.nome = 'CAMISETA ESTAMPADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 5, '2025-11-03', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Vinicius' AND p.nome = 'REGATA ESTAMPADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 6, '2025-11-10', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Vinicius' AND p.nome = 'BOARDSHORT';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 6, '2025-11-10', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Vinicius' AND p.nome = 'VOLLEY SUBLIMADO';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 6, '2025-11-10', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Vinicius' AND p.nome = 'CAMISETA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 6, '2025-11-10', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Vinicius' AND p.nome = 'REGATA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 6, '2025-11-10', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Vinicius' AND p.nome = 'CAMISETA ESTAMPADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 6, '2025-11-10', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Vinicius' AND p.nome = 'REGATA ESTAMPADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 7, '2025-11-17', 8, 5, 1, 1, 'completo'
FROM designers d, produtos p
WHERE d.nome = 'Elison' AND p.nome = 'BOARDSHORT';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 7, '2025-11-17', 7, 3, 1, 1, 'completo'
FROM designers d, produtos p
WHERE d.nome = 'Elison' AND p.nome = 'VOLLEY SUBLIMADO';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 7, '2025-11-17', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Elison' AND p.nome = 'CAMISETA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 7, '2025-11-17', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Elison' AND p.nome = 'REGATA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 7, '2025-11-17', 7, 4, 1, 1, 'completo'
FROM designers d, produtos p
WHERE d.nome = 'Elison' AND p.nome = 'CAMISETA ESTAMPADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 7, '2025-11-17', 4, 2, 1, 1, 'completo'
FROM designers d, produtos p
WHERE d.nome = 'Elison' AND p.nome = 'REGATA ESTAMPADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 8, '2025-11-24', 2, 0, 1, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Elison' AND p.nome = 'BOARDSHORT';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 8, '2025-11-24', 2, 1, 1, 1, 'completo'
FROM designers d, produtos p
WHERE d.nome = 'Elison' AND p.nome = 'VOLLEY SUBLIMADO';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 8, '2025-11-24', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Elison' AND p.nome = 'CAMISETA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 8, '2025-11-24', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Elison' AND p.nome = 'REGATA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 8, '2025-11-24', 2, 0, 1, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Elison' AND p.nome = 'CAMISETA ESTAMPADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 8, '2025-11-24', 2, 0, 1, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Elison' AND p.nome = 'REGATA ESTAMPADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 9, '2025-12-01', 2, 2, 1, 1, 'completo'
FROM designers d, produtos p
WHERE d.nome = 'Elison' AND p.nome = 'BOARDSHORT';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 9, '2025-12-01', 2, 2, 1, 1, 'completo'
FROM designers d, produtos p
WHERE d.nome = 'Elison' AND p.nome = 'VOLLEY SUBLIMADO';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 9, '2025-12-01', 2, 1, 1, 1, 'completo'
FROM designers d, produtos p
WHERE d.nome = 'Elison' AND p.nome = 'CAMISETA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 9, '2025-12-01', 2, 2, 1, 1, 'completo'
FROM designers d, produtos p
WHERE d.nome = 'Elison' AND p.nome = 'REGATA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 10, '2025-12-08', 2, 1, 1, 1, 'completo'
FROM designers d, produtos p
WHERE d.nome = 'Elison' AND p.nome = 'BOARDSHORT';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 10, '2025-12-08', 2, 0, 1, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Elison' AND p.nome = 'VOLLEY SUBLIMADO';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 10, '2025-12-08', 2, 2, 1, 1, 'completo'
FROM designers d, produtos p
WHERE d.nome = 'Elison' AND p.nome = 'CAMISETA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 10, '2025-12-08', 2, 0, 1, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Elison' AND p.nome = 'REGATA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 11, '2025-12-15', 2, 0, 1, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Elison' AND p.nome = 'BOARDSHORT';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 11, '2025-12-15', 2, 0, 1, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Elison' AND p.nome = 'VOLLEY SUBLIMADO';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 11, '2025-12-15', 2, 0, 1, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Elison' AND p.nome = 'CAMISETA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 11, '2025-12-15', 2, 0, 1, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Elison' AND p.nome = 'REGATA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 12, '2025-12-22', 3, 0, 1, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Elison' AND p.nome = 'BOARDSHORT';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 12, '2025-12-22', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Elison' AND p.nome = 'VOLLEY SUBLIMADO';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 12, '2025-12-22', 3, 0, 1, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Elison' AND p.nome = 'CAMISETA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 12, '2025-12-22', 2, 0, 1, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Elison' AND p.nome = 'REGATA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 13, '2025-12-29', 3, 0, 1, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Elison' AND p.nome = 'BOARDSHORT';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 13, '2025-12-29', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Elison' AND p.nome = 'VOLLEY SUBLIMADO';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 13, '2025-12-29', 3, 0, 1, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Elison' AND p.nome = 'CAMISETA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 13, '2025-12-29', 2, 0, 1, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Elison' AND p.nome = 'REGATA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 14, '2026-01-05', 2, 0, 1, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Elison' AND p.nome = 'BOARDSHORT';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 14, '2026-01-05', 2, 0, 1, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Elison' AND p.nome = 'VOLLEY SUBLIMADO';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 14, '2026-01-05', 2, 0, 1, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Elison' AND p.nome = 'CAMISETA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 14, '2026-01-05', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Elison' AND p.nome = 'REGATA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 15, '2026-01-12', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Elison' AND p.nome = 'BOARDSHORT';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 15, '2026-01-12', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Elison' AND p.nome = 'VOLLEY SUBLIMADO';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 15, '2026-01-12', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Elison' AND p.nome = 'CAMISETA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 15, '2026-01-12', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Elison' AND p.nome = 'REGATA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 16, '2026-01-19', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Elison' AND p.nome = 'BOARDSHORT';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 16, '2026-01-19', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Elison' AND p.nome = 'VOLLEY SUBLIMADO';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 16, '2026-01-19', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Elison' AND p.nome = 'CAMISETA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 16, '2026-01-19', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Elison' AND p.nome = 'REGATA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 17, '2026-01-26', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Elison' AND p.nome = 'BOARDSHORT';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 17, '2026-01-26', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Elison' AND p.nome = 'VOLLEY SUBLIMADO';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 17, '2026-01-26', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Elison' AND p.nome = 'CAMISETA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 17, '2026-01-26', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Elison' AND p.nome = 'REGATA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 18, '2026-02-02', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Elison' AND p.nome = 'BOARDSHORT';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 18, '2026-02-02', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Elison' AND p.nome = 'VOLLEY SUBLIMADO';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 18, '2026-02-02', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Elison' AND p.nome = 'CAMISETA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 18, '2026-02-02', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Elison' AND p.nome = 'REGATA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 1, '2025-10-06', 2, 0, 1, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Wellington' AND p.nome = 'BOARDSHORT';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 1, '2025-10-06', 2, 1, 1, 1, 'completo'
FROM designers d, produtos p
WHERE d.nome = 'Wellington' AND p.nome = 'VOLLEY SUBLIMADO';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 1, '2025-10-06', 2, 0, 1, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Wellington' AND p.nome = 'CAMISETA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 1, '2025-10-06', 2, 0, 1, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Wellington' AND p.nome = 'REGATA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 1, '2025-10-06', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Wellington' AND p.nome = 'CAMISETA ESTAMPADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 1, '2025-10-06', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Wellington' AND p.nome = 'REGATA ESTAMPADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 2, '2025-10-13', 2, 2, 1, 1, 'completo'
FROM designers d, produtos p
WHERE d.nome = 'Wellington' AND p.nome = 'BOARDSHORT';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 2, '2025-10-13', 2, 1, 1, 1, 'completo'
FROM designers d, produtos p
WHERE d.nome = 'Wellington' AND p.nome = 'VOLLEY SUBLIMADO';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 2, '2025-10-13', 2, 0, 1, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Wellington' AND p.nome = 'CAMISETA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 2, '2025-10-13', 2, 1, 1, 1, 'completo'
FROM designers d, produtos p
WHERE d.nome = 'Wellington' AND p.nome = 'REGATA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 2, '2025-10-13', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Wellington' AND p.nome = 'CAMISETA ESTAMPADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 2, '2025-10-13', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Wellington' AND p.nome = 'REGATA ESTAMPADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 3, '2025-10-20', 2, 1, 1, 1, 'completo'
FROM designers d, produtos p
WHERE d.nome = 'Wellington' AND p.nome = 'BOARDSHORT';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 3, '2025-10-20', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Wellington' AND p.nome = 'VOLLEY SUBLIMADO';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 3, '2025-10-20', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Wellington' AND p.nome = 'CAMISETA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 3, '2025-10-20', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Wellington' AND p.nome = 'REGATA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 3, '2025-10-20', 5, 5, 1, 1, 'completo'
FROM designers d, produtos p
WHERE d.nome = 'Wellington' AND p.nome = 'CAMISETA ESTAMPADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 3, '2025-10-20', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Wellington' AND p.nome = 'REGATA ESTAMPADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 4, '2025-10-27', 2, 2, 1, 1, 'completo'
FROM designers d, produtos p
WHERE d.nome = 'Wellington' AND p.nome = 'BOARDSHORT';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 4, '2025-10-27', 2, 2, 1, 1, 'completo'
FROM designers d, produtos p
WHERE d.nome = 'Wellington' AND p.nome = 'VOLLEY SUBLIMADO';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 4, '2025-10-27', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Wellington' AND p.nome = 'CAMISETA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 4, '2025-10-27', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Wellington' AND p.nome = 'REGATA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 4, '2025-10-27', 2, 1, 1, 1, 'completo'
FROM designers d, produtos p
WHERE d.nome = 'Wellington' AND p.nome = 'CAMISETA ESTAMPADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 4, '2025-10-27', 2, 1, 1, 1, 'completo'
FROM designers d, produtos p
WHERE d.nome = 'Wellington' AND p.nome = 'REGATA ESTAMPADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 5, '2025-11-03', 2, 1, 1, 1, 'completo'
FROM designers d, produtos p
WHERE d.nome = 'Wellington' AND p.nome = 'BOARDSHORT';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 5, '2025-11-03', 2, 1, 1, 1, 'completo'
FROM designers d, produtos p
WHERE d.nome = 'Wellington' AND p.nome = 'VOLLEY SUBLIMADO';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 5, '2025-11-03', 1, 1, 1, 1, 'completo'
FROM designers d, produtos p
WHERE d.nome = 'Wellington' AND p.nome = 'CAMISETA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 5, '2025-11-03', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Wellington' AND p.nome = 'REGATA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 5, '2025-11-03', 2, 1, 1, 1, 'completo'
FROM designers d, produtos p
WHERE d.nome = 'Wellington' AND p.nome = 'CAMISETA ESTAMPADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 5, '2025-11-03', 2, 1, 1, 1, 'completo'
FROM designers d, produtos p
WHERE d.nome = 'Wellington' AND p.nome = 'REGATA ESTAMPADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 6, '2025-11-10', 2, 0, 1, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Wellington' AND p.nome = 'BOARDSHORT';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 6, '2025-11-10', 2, 0, 1, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Wellington' AND p.nome = 'VOLLEY SUBLIMADO';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 6, '2025-11-10', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Wellington' AND p.nome = 'CAMISETA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 6, '2025-11-10', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Wellington' AND p.nome = 'REGATA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 6, '2025-11-10', 2, 1, 1, 1, 'completo'
FROM designers d, produtos p
WHERE d.nome = 'Wellington' AND p.nome = 'CAMISETA ESTAMPADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 6, '2025-11-10', 2, 1, 1, 1, 'completo'
FROM designers d, produtos p
WHERE d.nome = 'Wellington' AND p.nome = 'REGATA ESTAMPADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 7, '2025-11-17', 2, 0, 1, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Wellington' AND p.nome = 'BOARDSHORT';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 7, '2025-11-17', 2, 2, 1, 1, 'completo'
FROM designers d, produtos p
WHERE d.nome = 'Wellington' AND p.nome = 'VOLLEY SUBLIMADO';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 7, '2025-11-17', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Wellington' AND p.nome = 'CAMISETA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 7, '2025-11-17', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Wellington' AND p.nome = 'REGATA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 7, '2025-11-17', 2, 1, 1, 1, 'completo'
FROM designers d, produtos p
WHERE d.nome = 'Wellington' AND p.nome = 'CAMISETA ESTAMPADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 7, '2025-11-17', 2, 1, 1, 1, 'completo'
FROM designers d, produtos p
WHERE d.nome = 'Wellington' AND p.nome = 'REGATA ESTAMPADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 8, '2025-11-24', 2, 0, 1, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Wellington' AND p.nome = 'BOARDSHORT';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 8, '2025-11-24', 2, 2, 1, 1, 'completo'
FROM designers d, produtos p
WHERE d.nome = 'Wellington' AND p.nome = 'VOLLEY SUBLIMADO';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 8, '2025-11-24', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Wellington' AND p.nome = 'CAMISETA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 8, '2025-11-24', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Wellington' AND p.nome = 'REGATA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 8, '2025-11-24', 2, 0, 1, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Wellington' AND p.nome = 'CAMISETA ESTAMPADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 8, '2025-11-24', 2, 1, 1, 1, 'completo'
FROM designers d, produtos p
WHERE d.nome = 'Wellington' AND p.nome = 'REGATA ESTAMPADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 9, '2025-12-01', 2, 2, 1, 1, 'completo'
FROM designers d, produtos p
WHERE d.nome = 'Wellington' AND p.nome = 'BOARDSHORT';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 9, '2025-12-01', 2, 2, 1, 1, 'completo'
FROM designers d, produtos p
WHERE d.nome = 'Wellington' AND p.nome = 'VOLLEY SUBLIMADO';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 9, '2025-12-01', 2, 2, 1, 1, 'completo'
FROM designers d, produtos p
WHERE d.nome = 'Wellington' AND p.nome = 'CAMISETA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 9, '2025-12-01', 2, 2, 1, 1, 'completo'
FROM designers d, produtos p
WHERE d.nome = 'Wellington' AND p.nome = 'REGATA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 10, '2025-12-08', 2, 2, 1, 1, 'completo'
FROM designers d, produtos p
WHERE d.nome = 'Wellington' AND p.nome = 'BOARDSHORT';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 10, '2025-12-08', 2, 0, 1, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Wellington' AND p.nome = 'VOLLEY SUBLIMADO';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 10, '2025-12-08', 2, 2, 1, 1, 'completo'
FROM designers d, produtos p
WHERE d.nome = 'Wellington' AND p.nome = 'CAMISETA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 10, '2025-12-08', 2, 2, 1, 1, 'completo'
FROM designers d, produtos p
WHERE d.nome = 'Wellington' AND p.nome = 'REGATA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 11, '2025-12-15', 2, 0, 1, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Wellington' AND p.nome = 'BOARDSHORT';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 11, '2025-12-15', 2, 0, 1, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Wellington' AND p.nome = 'VOLLEY SUBLIMADO';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 11, '2025-12-15', 2, 0, 1, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Wellington' AND p.nome = 'CAMISETA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 11, '2025-12-15', 2, 0, 1, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Wellington' AND p.nome = 'REGATA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 12, '2025-12-22', 3, 0, 1, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Wellington' AND p.nome = 'BOARDSHORT';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 12, '2025-12-22', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Wellington' AND p.nome = 'VOLLEY SUBLIMADO';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 12, '2025-12-22', 3, 0, 1, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Wellington' AND p.nome = 'CAMISETA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 12, '2025-12-22', 2, 0, 1, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Wellington' AND p.nome = 'REGATA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 13, '2025-12-29', 3, 0, 1, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Wellington' AND p.nome = 'BOARDSHORT';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 13, '2025-12-29', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Wellington' AND p.nome = 'VOLLEY SUBLIMADO';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 13, '2025-12-29', 3, 0, 1, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Wellington' AND p.nome = 'CAMISETA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 13, '2025-12-29', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Wellington' AND p.nome = 'REGATA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 14, '2026-01-05', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Wellington' AND p.nome = 'BOARDSHORT';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 14, '2026-01-05', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Wellington' AND p.nome = 'VOLLEY SUBLIMADO';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 14, '2026-01-05', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Wellington' AND p.nome = 'CAMISETA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 14, '2026-01-05', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Wellington' AND p.nome = 'REGATA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 15, '2026-01-12', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Wellington' AND p.nome = 'BOARDSHORT';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 15, '2026-01-12', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Wellington' AND p.nome = 'VOLLEY SUBLIMADO';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 15, '2026-01-12', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Wellington' AND p.nome = 'CAMISETA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 15, '2026-01-12', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Wellington' AND p.nome = 'REGATA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 16, '2026-01-19', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Wellington' AND p.nome = 'BOARDSHORT';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 16, '2026-01-19', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Wellington' AND p.nome = 'VOLLEY SUBLIMADO';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 16, '2026-01-19', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Wellington' AND p.nome = 'CAMISETA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 16, '2026-01-19', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Wellington' AND p.nome = 'REGATA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 17, '2026-01-26', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Wellington' AND p.nome = 'BOARDSHORT';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 17, '2026-01-26', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Wellington' AND p.nome = 'VOLLEY SUBLIMADO';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 17, '2026-01-26', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Wellington' AND p.nome = 'CAMISETA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 17, '2026-01-26', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Wellington' AND p.nome = 'REGATA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 18, '2026-02-02', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Wellington' AND p.nome = 'BOARDSHORT';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 18, '2026-02-02', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Wellington' AND p.nome = 'VOLLEY SUBLIMADO';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 18, '2026-02-02', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Wellington' AND p.nome = 'CAMISETA SUBLIMADA';
INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, 18, '2026-02-02', 0, 0, 0, 0, 'pendente'
FROM designers d, produtos p
WHERE d.nome = 'Wellington' AND p.nome = 'REGATA SUBLIMADA';
