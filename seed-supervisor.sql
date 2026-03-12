-- Create Supervisor user for testing
-- Password: supervisor123

INSERT OR REPLACE INTO designers (
  id,
  nome,
  email,
  nome_exibicao,
  senha,
  role,
  sector_id,
  ativo,
  created_at
) VALUES (
  100,
  'Supervisor Teste',
  'supervisor@webapp.com',
  'Supervisor',
  'supervisor123',
  'supervisor',
  NULL,
  1,
  datetime('now')
);
