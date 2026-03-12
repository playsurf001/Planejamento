// ======================
// API ROUTES - CHECKLIST DESIGNER (NOVAS)
// ======================

// Obter checklist de um designer específico (tela individual)
app.get('/api/designer/:designer_id/checklist', async (c) => {
  const { DB } = c.env
  const designer_id = c.req.param('designer_id')
  const { semana } = c.req.query()
  
  let query = `
    SELECT 
      l.id, l.semana, l.data, l.quantidade_criada, l.quantidade_aprovada, 
      l.criado_check, l.aprovado_ok, l.posicao, l.status, l.observacoes,
      p.nome as produto_nome, p.id as produto_id,
      d.nome as designer_nome
    FROM lancamentos l
    JOIN produtos p ON l.produto_id = p.id
    JOIN designers d ON l.designer_id = d.id
    WHERE l.designer_id = ?
  `
  const params: any[] = [designer_id]
  
  if (semana) {
    query += ' AND l.semana = ?'
    params.push(semana)
  }
  
  query += ' ORDER BY l.semana DESC, p.nome'
  
  const result = await DB.prepare(query).bind(...params).all()
  return c.json(result.results)
})

// Marcar/desmarcar criação (checkbox)
app.patch('/api/lancamentos/:id/check-criado', async (c) => {
  const { DB } = c.env
  const id = c.req.param('id')
  const { checked } = await c.req.json()
  
  await DB.prepare(`
    UPDATE lancamentos 
    SET criado_check = ?,
        status = CASE WHEN ? = 1 AND aprovado_ok = 1 THEN 'completo' ELSE 'em_andamento' END,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `)
    .bind(checked ? 1 : 0, checked ? 1 : 0, id)
    .run()
  
  const result = await DB.prepare('SELECT * FROM lancamentos WHERE id = ?').bind(id).first()
  return c.json(result)
})

// Marcar/desmarcar aprovação (OK)
app.patch('/api/lancamentos/:id/check-aprovado', async (c) => {
  const { DB } = c.env
  const id = c.req.param('id')
  const { checked, quantidade_aprovada } = await c.req.json()
  
  await DB.prepare(`
    UPDATE lancamentos 
    SET aprovado_ok = ?,
        quantidade_aprovada = ?,
        status = CASE WHEN criado_check = 1 AND ? = 1 THEN 'completo' 
                     WHEN ? = 1 THEN 'em_andamento'
                     ELSE 'pendente' END,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `)
    .bind(checked ? 1 : 0, quantidade_aprovada || 0, checked ? 1 : 0, checked ? 1 : 0, id)
    .run()
  
  const result = await DB.prepare('SELECT * FROM lancamentos WHERE id = ?').bind(id).first()
  return c.json(result)
})

// Atualizar posição/ranking
app.patch('/api/lancamentos/:id/posicao', async (c) => {
  const { DB } = c.env
  const id = c.req.param('id')
  const { posicao } = await c.req.json()
  
  await DB.prepare(`
    UPDATE lancamentos 
    SET posicao = ?,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `)
    .bind(posicao, id)
    .run()
  
  const result = await DB.prepare('SELECT * FROM lancamentos WHERE id = ?').bind(id).first()
  return c.json(result)
})

// Estatísticas do designer (para a tela individual)
app.get('/api/designer/:designer_id/stats', async (c) => {
  const { DB } = c.env
  const designer_id = c.req.param('designer_id')
  const { semana } = c.req.query()
  
  let query = `
    SELECT 
      COUNT(*) as total_tarefas,
      SUM(CASE WHEN criado_check = 1 THEN 1 ELSE 0 END) as criadas_ok,
      SUM(CASE WHEN aprovado_ok = 1 THEN 1 ELSE 0 END) as aprovadas_ok,
      SUM(CASE WHEN status = 'completo' THEN 1 ELSE 0 END) as completas,
      SUM(quantidade_criada) as total_criadas,
      SUM(quantidade_aprovada) as total_aprovadas
    FROM lancamentos
    WHERE designer_id = ?
  `
  const params: any[] = [designer_id]
  
  if (semana) {
    query += ' AND semana = ?'
    params.push(semana)
  }
  
  const stats = await DB.prepare(query).bind(...params).first()
  return c.json(stats)
})
