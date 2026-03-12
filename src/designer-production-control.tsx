import { Hono } from 'hono'

// Página de Controle de Produção Semanal com permissões e layout azul
export function generateDesignerProductionControl(designerId: string, designerName: string, userRole: string) {
  const isAdmin = userRole === 'admin';
  
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${designerName} - Controle de Produção Semanal</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
  <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }
    
    .header-bg {
      background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
    }
    
    .week-header {
      background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%);
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
      background: #dbeafe;
      color: #1e40af;
      font-weight: 600;
      padding: 12px;
      text-align: center;
      border-bottom: 2px solid #bfdbfe;
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
      background: ${isAdmin ? 'white' : '#f3f4f6'};
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
      color: #9ca3af;
    }
    
    .pos-select {
      padding: 6px 10px;
      border: 2px solid #d1d5db;
      border-radius: 6px;
      font-weight: 500;
      transition: all 0.2s;
      background: ${isAdmin ? 'white' : '#f3f4f6'};
      cursor: ${isAdmin ? 'pointer' : 'not-allowed'};
    }
    
    .pos-select:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }
    
    .pos-select:disabled {
      background: #f3f4f6;
      cursor: not-allowed;
      color: #9ca3af;
    }
    
    .ok-checkbox {
      width: 24px;
      height: 24px;
      cursor: pointer;
      transition: transform 0.2s;
      accent-color: #3b82f6;
    }
    
    .ok-checkbox:hover {
      transform: scale(1.1);
    }
    
    .ok-checkbox:disabled {
      cursor: not-allowed;
      opacity: 0.5;
    }
    
    .ok-cell {
      background: #dbeafe !important;
      font-weight: 600;
      color: #1e40af;
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
    .status-criada { background: #dbeafe; color: #1e40af; }
    .status-ok { background: #d1fae5; color: #065f46; }
    
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
    
    .stats-card {
      background: white;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      text-align: center;
      border-left: 4px solid #3b82f6;
    }
    
    .stats-card .number {
      font-size: 2rem;
      font-weight: bold;
      color: #1e40af;
    }
    
    .stats-card .label {
      color: #6b7280;
      font-size: 0.875rem;
      margin-top: 4px;
    }
    
    .logo-container {
      background: white;
      padding: 20px;
      border-radius: 12px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 24px;
    }
    
    .logo-placeholder {
      width: 80px;
      height: 80px;
      background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2rem;
      color: white;
    }
    
    .company-info h2 {
      font-size: 1.5rem;
      font-weight: bold;
      color: #1e40af;
      margin: 0;
    }
    
    .company-info p {
      color: #6b7280;
      font-size: 0.875rem;
      margin: 4px 0 0 0;
    }
  </style>
</head>
<body class="bg-gray-50 min-h-screen">
  <!-- Header -->
  <header class="header-bg text-white shadow-lg">
    <div class="container mx-auto px-6 py-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <i class="fas fa-clipboard-check text-3xl"></i>
          <div>
            <h1 class="text-2xl font-bold">${designerName}</h1>
            <p class="text-blue-200 text-sm">Controle de Produção Semanal</p>
          </div>
        </div>
        <div class="flex items-center gap-4">
          <span class="bg-white/20 px-3 py-1 rounded-lg text-sm">
            ${isAdmin ? '👑 Administrador' : '👤 Designer'}
          </span>
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
    <!-- Logo e Nome da Empresa -->
    <div class="logo-container">
      <div class="logo-placeholder">
        <i class="fas fa-industry"></i>
      </div>
      <div class="company-info">
        <h2>NOME DA SUA EMPRESA</h2>
        <p>Sistema de Controle de Produção</p>
      </div>
    </div>

    <!-- Estatísticas Globais (Todas as Semanas) -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div class="stats-card">
        <div class="number" id="stat-total-global">0</div>
        <div class="label">Total de Tarefas</div>
        <div class="text-xs text-gray-500 mt-1">(Todas as semanas)</div>
      </div>
      <div class="stats-card">
        <div class="number text-blue-600" id="stat-criadas-global">0</div>
        <div class="label">Criadas</div>
        <div class="text-xs text-gray-500 mt-1">(Com quantidade)</div>
      </div>
      <div class="stats-card">
        <div class="number text-green-600" id="stat-ok-global">0</div>
        <div class="label">OK Marcados</div>
        <div class="text-xs text-gray-500 mt-1">(Checkbox marcado)</div>
      </div>
      <div class="stats-card">
        <div class="number text-purple-600" id="stat-aprovadas-designer">0</div>
        <div class="label">Aprovadas do Designer</div>
        <div class="text-xs text-gray-500 mt-1">(Total histórico)</div>
      </div>
    </div>

    <!-- Filtro de Semana -->
    <div class="bg-white rounded-xl shadow-md p-4 mb-6 flex items-center gap-4">
      <div class="flex items-center gap-2">
        <i class="fas fa-search text-blue-600"></i>
        <label class="font-semibold text-gray-700">Pesquisar Semana:</label>
      </div>
      <select id="filter-semana" onchange="loadWeekData()" class="flex-1 px-4 py-2 border-2 border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
        <option value="">Todas as Semanas</option>
      </select>
      <button onclick="clearWeekFilter()" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition">
        <i class="fas fa-times mr-2"></i>Limpar
      </button>
      <button onclick="loadWeekData()" class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition">
        <i class="fas fa-sync-alt mr-2"></i>Atualizar
      </button>
    </div>

    <!-- Tabela de Produtos -->
    <div id="week-container">
      <!-- Será preenchido dinamicamente -->
    </div>

    ${!isAdmin ? `
    <div class="bg-blue-50 border-l-4 border-blue-600 p-4 mt-6 rounded-lg">
      <div class="flex items-start">
        <i class="fas fa-info-circle text-blue-600 text-xl mr-3 mt-1"></i>
        <div>
          <p class="font-semibold text-blue-900 mb-1">Permissões de Designer</p>
          <p class="text-sm text-blue-800">
            Você pode <strong>apenas marcar/desmarcar os checkboxes OK</strong>. 
            Apenas o <strong>Administrador</strong> pode editar quantidades e posições.
          </p>
        </div>
      </div>
    </div>
    ` : ''}
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
    const IS_ADMIN = ${isAdmin ? 'true' : 'false'};
    let currentWeekFilter = '';
    let produtos = [];
    let allProductionData = [];

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

    // Popular select de semanas
    function populateWeekSelect() {
      const select = document.getElementById('filter-semana');
      select.innerHTML = '<option value="">Todas as Semanas</option>';
      
      // Adicionar semanas 1-52
      for (let i = 1; i <= 52; i++) {
        const option = document.createElement('option');
        option.value = i;
        const weekDate = getWeekDateString(i, new Date().getFullYear());
        option.textContent = \`Semana \${String(i).padStart(2, '0')} - \${weekDate}\`;
        select.appendChild(option);
      }
    }

    // Limpar filtro de semana
    function clearWeekFilter() {
      document.getElementById('filter-semana').value = '';
      currentWeekFilter = '';
      loadWeekData();
    }

    // Carregar dados (todas as semanas ou filtrado)
    async function loadWeekData() {
      try {
        showSaving();
        
        currentWeekFilter = document.getElementById('filter-semana').value;
        
        // Buscar todos os lançamentos do designer
        const params = {
          designer_id: DESIGNER_ID,
          limit: 1000
        };
        
        if (currentWeekFilter) {
          params.semana = currentWeekFilter;
        }
        
        const response = await axios.get(\`\${API_URL}/api/lancamentos\`, { params });
        allProductionData = response.data.data || [];
        
        // Atualizar interface
        renderProductionTable();
        updateGlobalStats();
        updateDesignerApprovedTotal();
        
        hideSaveIndicator();
        
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        showError('Erro ao carregar dados');
      }
    }

    // Renderizar tabela de produção
    function renderProductionTable() {
      const container = document.getElementById('week-container');
      
      if (currentWeekFilter) {
        // Mostra apenas a semana filtrada
        renderSingleWeek(container, parseInt(currentWeekFilter));
      } else {
        // Mostra todas as semanas que têm lançamentos
        const weeks = [...new Set(allProductionData.map(l => l.semana))].sort((a, b) => b - a);
        
        if (weeks.length === 0) {
          container.innerHTML = \`
            <div class="bg-white rounded-xl shadow-md p-8 text-center">
              <i class="fas fa-inbox text-gray-400 text-5xl mb-4"></i>
              <p class="text-gray-600">Nenhum lançamento encontrado</p>
            </div>
          \`;
          return;
        }
        
        let html = '';
        weeks.forEach(semana => {
          html += renderWeekSection(semana);
        });
        container.innerHTML = html;
      }
    }

    // Renderizar uma única semana
    function renderSingleWeek(container, semana) {
      container.innerHTML = renderWeekSection(semana);
    }

    // Renderizar seção de semana
    function renderWeekSection(semana) {
      const weekDate = getWeekDateString(semana, new Date().getFullYear());
      const weekData = allProductionData.filter(l => l.semana === semana);
      
      let html = \`
        <div class="mb-6">
          <div class="week-header">
            \${String(semana).padStart(2, '0')} SEMANA \${weekDate}
          </div>
          <table class="product-table">
            <thead>
              <tr>
                <th style="width: 35%">PRODUTO</th>
                <th style="width: 15%">Quantidade</th>
                <th style="width: 15%">Posição</th>
                <th style="width: 15%">OK</th>
                <th style="width: 20%">Status</th>
              </tr>
            </thead>
            <tbody>
      \`;
      
      // Agrupar por produto
      const productMap = new Map();
      weekData.forEach(lancamento => {
        if (!productMap.has(lancamento.produto_id)) {
          productMap.set(lancamento.produto_id, lancamento);
        }
      });
      
      // Se não tem lançamentos, mostrar produtos vazios
      if (productMap.size === 0) {
        produtos.forEach(produto => {
          html += renderProductRow(produto, null, semana);
        });
      } else {
        // Mostrar produtos com lançamentos
        productMap.forEach((lancamento, produtoId) => {
          const produto = produtos.find(p => p.id === produtoId);
          if (produto) {
            html += renderProductRow(produto, lancamento, semana);
          }
        });
      }
      
      html += \`
            </tbody>
          </table>
        </div>
      \`;
      
      return html;
    }

    // Renderizar linha de produto
    function renderProductRow(produto, lancamento, semana) {
      const id = lancamento?.id || null;
      const qtd = lancamento?.quantidade_criada || '';
      const pos = lancamento?.posicao || '';
      const criado_check = lancamento?.criado_check || 0;
      
      const isOK = criado_check === 1;
      const rowClass = isOK ? 'ok-cell' : '';
      
      // Determinar status
      let status = 'pendente';
      let statusLabel = 'Pendente';
      if (qtd && criado_check) {
        status = 'ok';
        statusLabel = 'OK';
      } else if (qtd) {
        status = 'criada';
        statusLabel = 'Criada';
      }
      
      return \`
        <tr data-produto-id="\${produto.id}" data-lancamento-id="\${id || ''}" data-semana="\${semana}">
          <td class="product-cell \${rowClass}">\${produto.nome}</td>
          <td class="\${rowClass}">
            <input 
              type="number" 
              class="qty-input" 
              value="\${qtd}"
              min="0"
              onchange="saveQuantity(this, \${produto.id}, \${id}, \${semana})"
              placeholder="0"
              \${!IS_ADMIN ? 'disabled' : ''}
            >
          </td>
          <td class="\${rowClass}">
            <select 
              class="pos-select" 
              onchange="savePosition(this, \${produto.id}, \${id}, \${semana})"
              \${!IS_ADMIN ? 'disabled' : ''}
            >
              <option value="">-</option>
              <option value="1º" \${pos === '1º' ? 'selected' : ''}>1º</option>
              <option value="2º" \${pos === '2º' ? 'selected' : ''}>2º</option>
              <option value="3º" \${pos === '3º' ? 'selected' : ''}>3º</option>
              <option value="4º" \${pos === '4º' ? 'selected' : ''}>4º</option>
              <option value="5º" \${pos === '5º' ? 'selected' : ''}>5º</option>
              <option value="6º" \${pos === '6º' ? 'selected' : ''}>6º</option>
            </select>
          </td>
          <td class="\${rowClass}">
            <input 
              type="checkbox" 
              class="ok-checkbox" 
              \${isOK ? 'checked' : ''}
              onchange="toggleCheck(this, \${produto.id}, \${id}, \${semana})"
            >
          </td>
          <td>
            <span class="status-badge status-\${status}">\${statusLabel}</span>
          </td>
        </tr>
      \`;
    }

    // Salvar quantidade (APENAS ADMIN)
    async function saveQuantity(input, produtoId, lancamentoId, semana) {
      if (!IS_ADMIN) {
        showError('Apenas o administrador pode editar quantidades');
        return;
      }
      
      const quantidade = parseInt(input.value) || 0;
      
      try {
        showSaving();
        
        if (lancamentoId && lancamentoId !== 'null') {
          // Atualizar
          const current = await axios.get(\`\${API_URL}/api/lancamentos/\${lancamentoId}\`);
          await axios.put(\`\${API_URL}/api/lancamentos/\${lancamentoId}\`, {
            ...current.data,
            quantidade_criada: quantidade
          });
        } else {
          // Criar
          const response = await axios.post(\`\${API_URL}/api/lancamentos\`, {
            designer_id: DESIGNER_ID,
            produto_id: produtoId,
            semana: semana,
            data: new Date().toISOString().split('T')[0],
            quantidade_criada: quantidade,
            quantidade_aprovada: 0,
            criado_check: 0,
            status: 'criada'
          });
          
          const row = input.closest('tr');
          row.setAttribute('data-lancamento-id', response.data.id);
        }
        
        showSaved();
        await loadWeekData();
        
      } catch (error) {
        console.error('Erro ao salvar:', error);
        showError('Erro ao salvar');
      }
    }

    // Salvar posição (APENAS ADMIN)
    async function savePosition(select, produtoId, lancamentoId, semana) {
      if (!IS_ADMIN) {
        showError('Apenas o administrador pode editar posições');
        return;
      }
      
      const posicao = select.value;
      
      try {
        showSaving();
        
        if (lancamentoId && lancamentoId !== 'null') {
          const current = await axios.get(\`\${API_URL}/api/lancamentos/\${lancamentoId}\`);
          await axios.put(\`\${API_URL}/api/lancamentos/\${lancamentoId}\`, {
            ...current.data,
            posicao: posicao || null
          });
        } else {
          const response = await axios.post(\`\${API_URL}/api/lancamentos\`, {
            designer_id: DESIGNER_ID,
            produto_id: produtoId,
            semana: semana,
            data: new Date().toISOString().split('T')[0],
            quantidade_criada: 0,
            quantidade_aprovada: 0,
            posicao: posicao || null,
            criado_check: 0,
            status: 'pendente'
          });
          
          const row = select.closest('tr');
          row.setAttribute('data-lancamento-id', response.data.id);
        }
        
        showSaved();
        
      } catch (error) {
        console.error('Erro ao salvar:', error);
        showError('Erro ao salvar');
      }
    }

    // Marcar/desmarcar checkbox (DESIGNER E ADMIN)
    async function toggleCheck(checkbox, produtoId, lancamentoId, semana) {
      const isChecked = checkbox.checked;
      
      try {
        showSaving();
        
        if (!lancamentoId || lancamentoId === 'null') {
          checkbox.checked = false;
          showError('Primeiro o admin deve adicionar a quantidade');
          return;
        }
        
        // Atualizar criado_check
        const current = await axios.get(\`\${API_URL}/api/lancamentos/\${lancamentoId}\`);
        
        await axios.put(\`\${API_URL}/api/lancamentos/\${lancamentoId}\`, {
          ...current.data,
          criado_check: isChecked ? 1 : 0,
          status: isChecked ? 'ok' : 'criada'
        });
        
        showSaved(isChecked ? 'OK marcado!' : 'OK desmarcado!');
        await loadWeekData();
        
      } catch (error) {
        console.error('Erro ao marcar:', error);
        checkbox.checked = !isChecked;
        showError('Erro ao marcar');
      }
    }

    // Atualizar estatísticas globais (todas as semanas)
    function updateGlobalStats() {
      // Total de tarefas: lançamentos que têm quantidade > 0
      const totalTarefas = allProductionData.filter(l => l.quantidade_criada > 0).length;
      
      // Criadas: mesmo que total (tarefas com quantidade)
      const criadas = totalTarefas;
      
      // OK: lançamentos com criado_check = 1
      const okMarcados = allProductionData.filter(l => l.criado_check === 1).length;
      
      document.getElementById('stat-total-global').textContent = totalTarefas;
      document.getElementById('stat-criadas-global').textContent = criadas;
      document.getElementById('stat-ok-global').textContent = okMarcados;
    }

    // Total de aprovadas do designer (histórico)
    async function updateDesignerApprovedTotal() {
      try {
        const response = await axios.get(\`\${API_URL}/api/lancamentos\`, {
          params: {
            designer_id: DESIGNER_ID,
            limit: 10000
          }
        });
        
        const allData = response.data.data || [];
        const totalAprovadas = allData.reduce((sum, l) => sum + (l.quantidade_aprovada || 0), 0);
        
        document.getElementById('stat-aprovadas-designer').textContent = totalAprovadas;
        
      } catch (error) {
        console.error('Erro ao buscar aprovadas:', error);
      }
    }

    // Indicadores
    function showSaving() {
      const indicator = document.getElementById('save-indicator');
      indicator.className = 'save-indicator saving';
      document.getElementById('save-text').innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Salvando...';
    }

    function showSaved(message = 'Salvo!') {
      const indicator = document.getElementById('save-indicator');
      indicator.className = 'save-indicator saved';
      document.getElementById('save-text').innerHTML = '<i class="fas fa-check mr-2"></i>' + message;
      setTimeout(hideSaveIndicator, 2000);
    }

    function showError(message) {
      const indicator = document.getElementById('save-indicator');
      indicator.className = 'save-indicator error';
      document.getElementById('save-text').innerHTML = '<i class="fas fa-times mr-2"></i>' + message;
      setTimeout(hideSaveIndicator, 3000);
    }

    function hideSaveIndicator() {
      document.getElementById('save-indicator').style.display = 'none';
    }

    // Inicialização
    async function init() {
      await loadProdutos();
      populateWeekSelect();
      await loadWeekData();
    }

    window.addEventListener('DOMContentLoaded', init);
  </script>
</body>
</html>
  `;
}
