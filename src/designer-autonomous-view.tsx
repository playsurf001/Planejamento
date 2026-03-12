import { Hono } from 'hono'

// Página individual do designer com autonomia total
export function generateDesignerAutonomousPage(designerId: string, designerName: string) {
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${designerName} - Controle de Produção</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
  <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }
    
    .week-header {
      background: linear-gradient(135deg, #047857 0%, #059669 100%);
      color: white;
      font-weight: bold;
      font-size: 1.1rem;
      padding: 12px;
      text-align: center;
      border-radius: 8px 8px 0 0;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .product-table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0;
      background: white;
      border-radius: 0 0 8px 8px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    
    .product-table th {
      background: #f3f4f6;
      color: #374151;
      font-weight: 600;
      padding: 12px;
      text-align: center;
      border-bottom: 2px solid #e5e7eb;
      font-size: 0.875rem;
      text-transform: uppercase;
    }
    
    .product-table td {
      padding: 10px;
      text-align: center;
      border-bottom: 1px solid #e5e7eb;
      transition: background 0.2s;
    }
    
    .product-table tr:hover td {
      background: #f9fafb;
    }
    
    .product-cell {
      text-align: left;
      font-weight: 500;
      color: #1f2937;
      padding-left: 16px;
    }
    
    .qty-input {
      width: 60px;
      text-align: center;
      font-weight: bold;
      font-size: 1.1rem;
      border: 2px solid #d1d5db;
      border-radius: 6px;
      padding: 6px;
      transition: all 0.2s;
      background: white;
    }
    
    .qty-input:focus {
      outline: none;
      border-color: #3b82f6;
      background: #eff6ff;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }
    
    .qty-input:disabled {
      background: #f3f4f6;
      cursor: not-allowed;
    }
    
    .pos-select {
      padding: 6px 10px;
      border: 2px solid #d1d5db;
      border-radius: 6px;
      font-weight: 500;
      transition: all 0.2s;
      background: white;
      cursor: pointer;
    }
    
    .pos-select:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }
    
    .ok-checkbox {
      width: 24px;
      height: 24px;
      cursor: pointer;
      transition: transform 0.2s;
    }
    
    .ok-checkbox:hover {
      transform: scale(1.1);
    }
    
    .ok-cell {
      background: #d1fae5 !important;
      font-weight: 600;
      color: #047857;
    }
    
    .status-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
    }
    
    .status-pendente { background: #fef3c7; color: #92400e; }
    .status-em_andamento { background: #dbeafe; color: #1e40af; }
    .status-completo { background: #d1fae5; color: #065f46; }
    
    .icon-placeholder {
      font-size: 1.5rem;
      color: #6b7280;
    }
    
    .save-indicator {
      position: fixed;
      bottom: 20px;
      right: 20px;
      padding: 12px 20px;
      border-radius: 8px;
      font-weight: 600;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      z-index: 1000;
      display: none;
    }
    
    .save-indicator.saving {
      background: #3b82f6;
      color: white;
      display: block;
    }
    
    .save-indicator.saved {
      background: #10b981;
      color: white;
      display: block;
    }
    
    .save-indicator.error {
      background: #ef4444;
      color: white;
      display: block;
    }
    
    .week-nav {
      display: flex;
      align-items: center;
      gap: 16px;
      justify-content: center;
      margin-bottom: 24px;
    }
    
    .week-nav button {
      background: white;
      border: 2px solid #d1d5db;
      padding: 10px 20px;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .week-nav button:hover {
      background: #f3f4f6;
      border-color: #9ca3af;
    }
    
    .week-nav button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    
    .stats-card {
      background: white;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      text-align: center;
    }
    
    .stats-card .number {
      font-size: 2rem;
      font-weight: bold;
      color: #1f2937;
    }
    
    .stats-card .label {
      color: #6b7280;
      font-size: 0.875rem;
      margin-top: 4px;
    }
  </style>
</head>
<body class="bg-gray-50 min-h-screen">
  <!-- Header -->
  <header class="bg-gradient-to-r from-emerald-600 to-emerald-800 text-white shadow-lg">
    <div class="container mx-auto px-6 py-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <i class="fas fa-user-circle text-3xl"></i>
          <div>
            <h1 class="text-2xl font-bold">${designerName}</h1>
            <p class="text-emerald-200 text-sm">Controle de Produção Semanal</p>
          </div>
        </div>
        <div class="flex items-center gap-4">
          <button onclick="window.location.href='/'" class="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition">
            <i class="fas fa-home mr-2"></i>Dashboard
          </button>
          <button onclick="logout()" class="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition">
            <i class="fas fa-sign-out-alt mr-2"></i>Sair
          </button>
        </div>
      </div>
    </div>
  </header>

  <main class="container mx-auto px-6 py-8">
    <!-- Estatísticas -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div class="stats-card">
        <div class="number" id="stat-total">0</div>
        <div class="label">Total de Tarefas</div>
      </div>
      <div class="stats-card">
        <div class="number text-blue-600" id="stat-criadas">0</div>
        <div class="label">Criadas</div>
      </div>
      <div class="stats-card">
        <div class="number text-green-600" id="stat-aprovadas">0</div>
        <div class="label">Aprovadas (OK)</div>
      </div>
      <div class="stats-card">
        <div class="number text-purple-600" id="stat-taxa">0%</div>
        <div class="label">Taxa de Conclusão</div>
      </div>
    </div>

    <!-- Navegação de Semanas -->
    <div class="week-nav">
      <button onclick="changeWeek(-1)" id="btn-prev">
        <i class="fas fa-chevron-left"></i>
        Semana Anterior
      </button>
      <div class="text-lg font-semibold text-gray-700" id="current-week-display">
        Semana Atual
      </div>
      <button onclick="changeWeek(1)" id="btn-next">
        Próxima Semana
        <i class="fas fa-chevron-right"></i>
      </button>
    </div>

    <!-- Tabela de Produtos da Semana -->
    <div id="week-container">
      <!-- Será preenchido dinamicamente -->
    </div>
  </main>

  <!-- Indicador de Salvamento -->
  <div id="save-indicator" class="save-indicator">
    <i class="fas fa-spinner fa-spin mr-2"></i>
    <span id="save-text">Salvando...</span>
  </div>

  <script>
    const API_URL = window.location.origin;
    const DESIGNER_ID = ${designerId};
    const DESIGNER_NAME = '${designerName}';
    let currentWeek = 1;
    let currentDate = new Date();
    let produtos = [];
    let productionData = [];

    // Logout
    function logout() {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      window.location.href = '/login';
    }

    // Carregar produtos
    async function loadProdutos() {
      try {
        const response = await axios.get(\`\${API_URL}/api/produtos\`);
        produtos = response.data;
      } catch (error) {
        console.error('Erro ao carregar produtos:', error);
      }
    }

    // Calcular semana do ano
    function getWeekNumber(date) {
      const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
      const dayNum = d.getUTCDay() || 7;
      d.setUTCDate(d.getUTCDate() + 4 - dayNum);
      const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
      return Math.ceil((((d - yearStart) / 86400000) + 1)/7);
    }

    // Formatar data da semana
    function getWeekDateString(weekNum, year) {
      const date = new Date(year, 0, 1 + (weekNum - 1) * 7);
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const yearStr = year.toString().slice(-2);
      return \`\${day}/\${month}/\${yearStr}\`;
    }

    // Mudar semana
    function changeWeek(direction) {
      currentWeek += direction;
      
      // Limitar entre semana 1 e 52
      if (currentWeek < 1) currentWeek = 1;
      if (currentWeek > 52) currentWeek = 52;
      
      loadWeekData();
    }

    // Carregar dados da semana
    async function loadWeekData() {
      try {
        showSaving();
        
        // Buscar lançamentos da semana
        const response = await axios.get(\`\${API_URL}/api/lancamentos\`, {
          params: {
            designer_id: DESIGNER_ID,
            semana: currentWeek,
            limit: 100
          }
        });
        
        productionData = response.data.data || [];
        
        // Atualizar interface
        renderWeekTable();
        updateStats();
        updateWeekDisplay();
        
        hideSaveIndicator();
        
      } catch (error) {
        console.error('Erro ao carregar semana:', error);
        showError('Erro ao carregar dados da semana');
      }
    }

    // Renderizar tabela da semana
    function renderWeekTable() {
      const container = document.getElementById('week-container');
      const weekDate = getWeekDateString(currentWeek, currentDate.getFullYear());
      
      let html = \`
        <div class="week-header">
          \${String(currentWeek).padStart(2, '0')} SEMANA \${weekDate}
        </div>
        <table class="product-table">
          <thead>
            <tr>
              <th style="width: 40%">PRODUTO</th>
              <th style="width: 15%"><i class="fas fa-chart-bar icon-placeholder"></i></th>
              <th style="width: 15%"><i class="fas fa-exclamation-triangle icon-placeholder"></i></th>
              <th style="width: 15%"><i class="fas fa-check-circle icon-placeholder"></i></th>
              <th style="width: 15%">STATUS</th>
            </tr>
          </thead>
          <tbody>
      \`;
      
      produtos.forEach(produto => {
        // Buscar lançamento existente para este produto/semana
        const lancamento = productionData.find(
          l => l.produto_id === produto.id && l.semana === currentWeek
        );
        
        const id = lancamento?.id || null;
        const qtdCriada = lancamento?.quantidade_criada || '';
        const posicao = lancamento?.posicao || '';
        const aprovadoOk = lancamento?.aprovado_ok || 0;
        const status = lancamento?.status || 'pendente';
        
        const isOK = aprovadoOk === 1;
        const rowClass = isOK ? 'ok-cell' : '';
        
        html += \`
          <tr data-produto-id="\${produto.id}" data-lancamento-id="\${id || ''}">
            <td class="product-cell">\${produto.nome}</td>
            <td class="\${rowClass}">
              <input 
                type="number" 
                class="qty-input" 
                value="\${qtdCriada}"
                min="0"
                onchange="saveQuantity(this, \${produto.id}, \${id})"
                placeholder="0"
                \${isOK ? 'disabled' : ''}
              >
            </td>
            <td class="\${rowClass}">
              <select 
                class="pos-select" 
                onchange="savePosition(this, \${produto.id}, \${id})"
                \${isOK ? 'disabled' : ''}
              >
                <option value="">-</option>
                <option value="1º" \${posicao === '1º' ? 'selected' : ''}>1º</option>
                <option value="2º" \${posicao === '2º' ? 'selected' : ''}>2º</option>
                <option value="3º" \${posicao === '3º' ? 'selected' : ''}>3º</option>
                <option value="4º" \${posicao === '4º' ? 'selected' : ''}>4º</option>
                <option value="5º" \${posicao === '5º' ? 'selected' : ''}>5º</option>
                <option value="6º" \${posicao === '6º' ? 'selected' : ''}>6º</option>
              </select>
            </td>
            <td class="\${rowClass}">
              <input 
                type="checkbox" 
                class="ok-checkbox" 
                \${isOK ? 'checked' : ''}
                onchange="toggleOK(this, \${produto.id}, \${id})"
              >
            </td>
            <td>
              <span class="status-badge status-\${status}">\${getStatusLabel(status)}</span>
            </td>
          </tr>
        \`;
      });
      
      html += \`
          </tbody>
        </table>
      \`;
      
      container.innerHTML = html;
    }

    // Salvar quantidade
    async function saveQuantity(input, produtoId, lancamentoId) {
      const quantidade = parseInt(input.value) || 0;
      
      try {
        showSaving();
        
        if (lancamentoId && lancamentoId !== 'null') {
          // Atualizar lançamento existente
          await axios.put(\`\${API_URL}/api/lancamentos/\${lancamentoId}\`, {
            designer_id: DESIGNER_ID,
            produto_id: produtoId,
            semana: currentWeek,
            data: new Date().toISOString().split('T')[0],
            quantidade_criada: quantidade,
            quantidade_aprovada: 0
          });
        } else {
          // Criar novo lançamento
          const response = await axios.post(\`\${API_URL}/api/lancamentos\`, {
            designer_id: DESIGNER_ID,
            produto_id: produtoId,
            semana: currentWeek,
            data: new Date().toISOString().split('T')[0],
            quantidade_criada: quantidade,
            quantidade_aprovada: 0,
            posicao: null,
            status: 'em_andamento'
          });
          
          // Atualizar ID do lançamento na linha
          const row = input.closest('tr');
          row.setAttribute('data-lancamento-id', response.data.id);
        }
        
        showSaved();
        await loadWeekData(); // Recarregar para atualizar stats
        
      } catch (error) {
        console.error('Erro ao salvar quantidade:', error);
        showError('Erro ao salvar');
      }
    }

    // Salvar posição
    async function savePosition(select, produtoId, lancamentoId) {
      const posicao = select.value;
      
      try {
        showSaving();
        
        if (lancamentoId && lancamentoId !== 'null') {
          // Buscar dados atuais
          const current = await axios.get(\`\${API_URL}/api/lancamentos/\${lancamentoId}\`);
          const data = current.data;
          
          // Atualizar
          await axios.put(\`\${API_URL}/api/lancamentos/\${lancamentoId}\`, {
            ...data,
            posicao: posicao || null
          });
        } else {
          // Criar novo lançamento se não existir
          const response = await axios.post(\`\${API_URL}/api/lancamentos\`, {
            designer_id: DESIGNER_ID,
            produto_id: produtoId,
            semana: currentWeek,
            data: new Date().toISOString().split('T')[0],
            quantidade_criada: 0,
            quantidade_aprovada: 0,
            posicao: posicao || null,
            status: 'pendente'
          });
          
          const row = select.closest('tr');
          row.setAttribute('data-lancamento-id', response.data.id);
        }
        
        showSaved();
        
      } catch (error) {
        console.error('Erro ao salvar posição:', error);
        showError('Erro ao salvar');
      }
    }

    // Marcar/desmarcar OK
    async function toggleOK(checkbox, produtoId, lancamentoId) {
      const isChecked = checkbox.checked;
      
      try {
        showSaving();
        
        if (lancamentoId && lancamentoId !== 'null') {
          // Buscar dados atuais
          const current = await axios.get(\`\${API_URL}/api/lancamentos/\${lancamentoId}\`);
          const data = current.data;
          
          // Ao marcar OK, copia quantidade_criada para quantidade_aprovada
          const qtdAprovada = isChecked ? (data.quantidade_criada || 0) : 0;
          
          // Atualizar
          await axios.put(\`\${API_URL}/api/lancamentos/\${lancamentoId}\`, {
            ...data,
            aprovado_ok: isChecked ? 1 : 0,
            quantidade_aprovada: qtdAprovada,
            status: isChecked ? 'completo' : 'em_andamento'
          });
          
          showSaved('OK marcado! Quantidade aprovada: ' + qtdAprovada);
          
        } else {
          checkbox.checked = false;
          showError('Primeiro adicione a quantidade');
          return;
        }
        
        // Recarregar para atualizar interface
        await loadWeekData();
        
      } catch (error) {
        console.error('Erro ao marcar OK:', error);
        checkbox.checked = !isChecked;
        showError('Erro ao marcar OK');
      }
    }

    // Atualizar estatísticas
    function updateStats() {
      const total = productionData.length;
      const criadas = productionData.filter(l => l.quantidade_criada > 0).length;
      const aprovadas = productionData.filter(l => l.aprovado_ok === 1).length;
      const taxa = total > 0 ? Math.round((aprovadas / total) * 100) : 0;
      
      document.getElementById('stat-total').textContent = total;
      document.getElementById('stat-criadas').textContent = criadas;
      document.getElementById('stat-aprovadas').textContent = aprovadas;
      document.getElementById('stat-taxa').textContent = taxa + '%';
    }

    // Atualizar display da semana
    function updateWeekDisplay() {
      const weekDate = getWeekDateString(currentWeek, currentDate.getFullYear());
      document.getElementById('current-week-display').textContent = 
        \`Semana \${String(currentWeek).padStart(2, '0')} - \${weekDate}\`;
    }

    // Indicadores de salvamento
    function showSaving() {
      const indicator = document.getElementById('save-indicator');
      const text = document.getElementById('save-text');
      indicator.className = 'save-indicator saving';
      text.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Salvando...';
    }

    function showSaved(message = 'Salvo com sucesso!') {
      const indicator = document.getElementById('save-indicator');
      const text = document.getElementById('save-text');
      indicator.className = 'save-indicator saved';
      text.innerHTML = '<i class="fas fa-check mr-2"></i>' + message;
      setTimeout(hideSaveIndicator, 2000);
    }

    function showError(message) {
      const indicator = document.getElementById('save-indicator');
      const text = document.getElementById('save-text');
      indicator.className = 'save-indicator error';
      text.innerHTML = '<i class="fas fa-times mr-2"></i>' + message;
      setTimeout(hideSaveIndicator, 3000);
    }

    function hideSaveIndicator() {
      const indicator = document.getElementById('save-indicator');
      indicator.style.display = 'none';
    }

    // Labels de status
    function getStatusLabel(status) {
      const labels = {
        'pendente': 'Pendente',
        'em_andamento': 'Em Andamento',
        'completo': 'Completo'
      };
      return labels[status] || status;
    }

    // Inicialização
    async function init() {
      // Calcular semana atual
      currentWeek = getWeekNumber(currentDate);
      
      // Carregar dados
      await loadProdutos();
      await loadWeekData();
    }

    // Executar ao carregar
    window.addEventListener('DOMContentLoaded', init);
  </script>
</body>
</html>
  `;
}
