import { Hono } from 'hono'

// Controle de Produção Semanal - Versão Final Simplificada
export function generateDesignerWeeklyControl(designerId: string, designerName: string) {
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
      margin-bottom: 24px;
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
      width: 70px;
      text-align: center;
      font-weight: bold;
      font-size: 1.1rem;
      border: 2px solid #d1d5db;
      border-radius: 6px;
      padding: 8px;
      transition: all 0.2s;
      background: white;
    }
    
    .qty-input:focus {
      outline: none;
      border-color: #10b981;
      background: #f0fdf4;
      box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
    }
    
    .ok-checkbox {
      width: 24px;
      height: 24px;
      cursor: pointer;
      transition: transform 0.2s;
      accent-color: #10b981;
    }
    
    .ok-checkbox:hover {
      transform: scale(1.1);
    }
    
    .row-criada {
      background: #d1fae5 !important;
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
    .status-criada { background: #d1fae5; color: #065f46; }
    
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
          <i class="fas fa-clipboard-check text-3xl"></i>
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
    <!-- Estatísticas Globais -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div class="stats-card">
        <div class="number" id="stat-total">0</div>
        <div class="label">Total de Tarefas</div>
      </div>
      <div class="stats-card">
        <div class="number text-green-600" id="stat-criadas">0</div>
        <div class="label">Criadas (OK Marcado)</div>
      </div>
      <div class="stats-card">
        <div class="number text-blue-600" id="stat-quantidade-total">0</div>
        <div class="label">Quantidade Total</div>
      </div>
    </div>

    <!-- Filtro de Pesquisa -->
    <div class="bg-white rounded-xl shadow-md p-4 mb-6 flex items-center gap-4">
      <div class="flex items-center gap-2">
        <i class="fas fa-search text-emerald-600"></i>
        <label class="font-semibold text-gray-700">Pesquisar Semana:</label>
      </div>
      <select id="filter-semana" onchange="applyFilter()" class="flex-1 px-4 py-2 border-2 border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent">
        <option value="">Todas as Semanas</option>
      </select>
      <button onclick="clearFilter()" class="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition">
        <i class="fas fa-times mr-2"></i>Limpar
      </button>
    </div>

    <!-- Todas as Semanas -->
    <div id="weeks-container">
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
    let produtos = [];
    let allData = [];
    let filteredWeeks = [];

    function logout() {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      window.location.href = '/login';
    }

    async function loadProdutos() {
      try {
        const response = await axios.get(\`\${API_URL}/api/produtos\`);
        produtos = response.data;
      } catch (error) {
        console.error('Erro ao carregar produtos:', error);
      }
    }

    function getWeekNumber(date) {
      const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
      const dayNum = d.getUTCDay() || 7;
      d.setUTCDate(d.getUTCDate() + 4 - dayNum);
      const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
      return Math.ceil((((d - yearStart) / 86400000) + 1)/7);
    }

    function getWeekDateString(weekNum, year) {
      const date = new Date(year, 0, 1 + (weekNum - 1) * 7);
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const yearStr = year.toString().slice(-2);
      return \`\${day}/\${month}/\${yearStr}\`;
    }

    function populateWeekSelect() {
      const select = document.getElementById('filter-semana');
      select.innerHTML = '<option value="">Todas as Semanas</option>';
      
      for (let i = 1; i <= 52; i++) {
        const option = document.createElement('option');
        option.value = i;
        const weekDate = getWeekDateString(i, new Date().getFullYear());
        option.textContent = \`Semana \${String(i).padStart(2, '0')} - \${weekDate}\`;
        select.appendChild(option);
      }
    }

    async function loadAllData() {
      try {
        showSaving();
        
        const response = await axios.get(\`\${API_URL}/api/lancamentos\`, {
          params: {
            designer_id: DESIGNER_ID,
            limit: 10000
          }
        });
        
        allData = response.data.data || [];
        
        // Determinar semanas a exibir
        const filterWeek = document.getElementById('filter-semana').value;
        if (filterWeek) {
          filteredWeeks = [parseInt(filterWeek)];
        } else {
          // Mostrar semanas que têm dados OU semanas próximas
          const weeksWithData = [...new Set(allData.map(l => l.semana))];
          const currentWeek = getWeekNumber(new Date());
          
          // Mostrar semana atual e adjacentes + semanas com dados
          const weeksToShow = new Set([
            currentWeek - 1,
            currentWeek,
            currentWeek + 1,
            ...weeksWithData
          ]);
          
          filteredWeeks = Array.from(weeksToShow)
            .filter(w => w >= 1 && w <= 52)
            .sort((a, b) => a - b);
        }
        
        renderAllWeeks();
        updateStats();
        hideSaveIndicator();
        
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        showError('Erro ao carregar dados');
      }
    }

    function renderAllWeeks() {
      const container = document.getElementById('weeks-container');
      
      if (filteredWeeks.length === 0) {
        container.innerHTML = \`
          <div class="bg-white rounded-xl shadow-md p-8 text-center">
            <i class="fas fa-inbox text-gray-400 text-5xl mb-4"></i>
            <p class="text-gray-600">Nenhuma semana para exibir</p>
          </div>
        \`;
        return;
      }
      
      let html = '';
      filteredWeeks.forEach(semana => {
        html += renderWeekSection(semana);
      });
      container.innerHTML = html;
    }

    function renderWeekSection(semana) {
      const weekDate = getWeekDateString(semana, new Date().getFullYear());
      const weekData = allData.filter(l => l.semana === semana);
      
      let html = \`
        <div class="mb-6">
          <div class="week-header">
            \${String(semana).padStart(2, '0')} SEMANA \${weekDate}
          </div>
          <table class="product-table">
            <thead>
              <tr>
                <th style="width: 60%">PRODUTO</th>
                <th style="width: 15%">Quantidade</th>
                <th style="width: 10%">OK</th>
                <th style="width: 15%">Status</th>
              </tr>
            </thead>
            <tbody>
      \`;
      
      // Criar mapa de lançamentos por produto
      const productMap = new Map();
      weekData.forEach(l => {
        productMap.set(l.produto_id, l);
      });
      
      // Renderizar todos os produtos
      produtos.forEach(produto => {
        const lancamento = productMap.get(produto.id);
        html += renderProductRow(produto, lancamento, semana);
      });
      
      html += \`
            </tbody>
          </table>
        </div>
      \`;
      
      return html;
    }

    function renderProductRow(produto, lancamento, semana) {
      const id = lancamento?.id || null;
      const qtd = lancamento?.quantidade_criada || '';
      const criado_check = lancamento?.criado_check || 0;
      
      const isOK = criado_check === 1;
      const rowClass = isOK ? 'row-criada' : '';
      const status = isOK ? 'criada' : 'pendente';
      const statusLabel = isOK ? 'Criada' : 'Pendente';
      
      return \`
        <tr class="\${rowClass}" data-produto-id="\${produto.id}" data-lancamento-id="\${id || ''}" data-semana="\${semana}">
          <td class="product-cell">\${produto.nome}</td>
          <td>
            <input 
              type="number" 
              class="qty-input" 
              value="\${qtd}"
              min="0"
              onchange="saveQuantity(this, \${produto.id}, \${id}, \${semana})"
              placeholder="0"
            >
          </td>
          <td>
            <input 
              type="checkbox" 
              class="ok-checkbox" 
              \${isOK ? 'checked' : ''}
              onchange="toggleOK(this, \${produto.id}, \${id}, \${semana})"
            >
          </td>
          <td>
            <span class="status-badge status-\${status}">\${statusLabel}</span>
          </td>
        </tr>
      \`;
    }

    async function saveQuantity(input, produtoId, lancamentoId, semana) {
      const quantidade = parseInt(input.value) || 0;
      const row = input.closest('tr');
      
      try {
        showSaving();
        
        if (lancamentoId && lancamentoId !== 'null' && lancamentoId !== '') {
          // Atualizar existente
          console.log('Atualizando lançamento:', lancamentoId, 'quantidade:', quantidade);
          
          const response = await axios.get(\`\${API_URL}/api/lancamentos/\${lancamentoId}\`);
          const lancamento = response.data;
          
          const updateData = {
            designer_id: lancamento.designer_id,
            produto_id: lancamento.produto_id,
            semana: lancamento.semana,
            data: lancamento.data,
            quantidade_criada: quantidade,
            quantidade_aprovada: lancamento.quantidade_aprovada || 0,
            criado_check: lancamento.criado_check || 0,
            aprovado_ok: lancamento.aprovado_ok || 0,
            status: lancamento.status || 'pendente',
            observacoes: lancamento.observacoes || ''
          };
          
          await axios.put(\`\${API_URL}/api/lancamentos/\${lancamentoId}\`, updateData);
          
        } else if (quantidade > 0) {
          // Criar novo
          console.log('Criando novo lançamento para produto:', produtoId, 'semana:', semana);
          
          const response = await axios.post(\`\${API_URL}/api/lancamentos\`, {
            designer_id: DESIGNER_ID,
            produto_id: produtoId,
            semana: semana,
            data: new Date().toISOString().split('T')[0],
            quantidade_criada: quantidade,
            quantidade_aprovada: 0,
            criado_check: 0,
            aprovado_ok: 0,
            status: 'pendente',
            observacoes: ''
          });
          
          console.log('Lançamento criado:', response.data);
          
          // Atualizar data-lancamento-id na linha
          row.setAttribute('data-lancamento-id', response.data.id);
          
          // Atualizar o checkbox para usar o novo ID
          const checkbox = row.querySelector('.ok-checkbox');
          if (checkbox) {
            checkbox.setAttribute('onchange', \`toggleOK(this, \${produtoId}, \${response.data.id}, \${semana})\`);
          }
        }
        
        showSaved('Quantidade salva!');
        await loadAllData();
        
      } catch (error) {
        console.error('Erro ao salvar quantidade:', error);
        console.error('Detalhes:', error.response?.data);
        showError('Erro ao salvar: ' + (error.response?.data?.message || error.message));
      }
    }

    async function toggleOK(checkbox, produtoId, lancamentoId, semana) {
      const isChecked = checkbox.checked;
      const row = checkbox.closest('tr');
      
      try {
        // Validar se existe lançamento
        if (!lancamentoId || lancamentoId === 'null' || lancamentoId === '') {
          checkbox.checked = false;
          showError('Primeiro adicione a quantidade');
          return;
        }
        
        showSaving();
        
        // Buscar dados atuais do lançamento
        const response = await axios.get(\`\${API_URL}/api/lancamentos/\${lancamentoId}\`);
        const lancamento = response.data;
        
        console.log('Lançamento atual:', lancamento);
        
        // Validar quantidade
        const quantidade = parseInt(lancamento.quantidade_criada) || 0;
        if (quantidade === 0 && isChecked) {
          checkbox.checked = false;
          showError('Adicione uma quantidade maior que zero');
          return;
        }
        
        // Atualizar criado_check e status
        const updateData = {
          designer_id: lancamento.designer_id,
          produto_id: lancamento.produto_id,
          semana: lancamento.semana,
          data: lancamento.data,
          quantidade_criada: lancamento.quantidade_criada,
          quantidade_aprovada: lancamento.quantidade_aprovada || 0,
          criado_check: isChecked ? 1 : 0,
          aprovado_ok: lancamento.aprovado_ok || 0,
          status: isChecked ? 'criada' : 'pendente',
          observacoes: lancamento.observacoes || ''
        };
        
        console.log('Atualizando com:', updateData);
        
        await axios.put(\`\${API_URL}/api/lancamentos/\${lancamentoId}\`, updateData);
        
        // Atualizar UI imediatamente
        if (isChecked) {
          row.classList.add('row-criada');
          row.querySelector('.status-badge').className = 'status-badge status-criada';
          row.querySelector('.status-badge').textContent = 'Criada';
        } else {
          row.classList.remove('row-criada');
          row.querySelector('.status-badge').className = 'status-badge status-pendente';
          row.querySelector('.status-badge').textContent = 'Pendente';
        }
        
        showSaved(isChecked ? 'OK marcado!' : 'OK desmarcado!');
        
        // Recarregar dados para atualizar estatísticas
        await loadAllData();
        
      } catch (error) {
        console.error('Erro ao marcar OK:', error);
        console.error('Detalhes:', error.response?.data);
        checkbox.checked = !isChecked;
        showError('Erro ao marcar OK: ' + (error.response?.data?.message || error.message));
      }
    }

    function updateStats() {
      // Total de tarefas: lançamentos com OK marcado (criado_check = 1)
      const totalTarefas = allData.filter(l => l.criado_check === 1).length;
      
      // Criadas: soma das quantidades onde criado_check = 1
      const criadas = allData
        .filter(l => l.criado_check === 1)
        .reduce((sum, l) => sum + (l.quantidade_criada || 0), 0);
      
      // Quantidade total: soma de TODAS as quantidades inseridas (mesmo sem OK)
      const quantidadeTotal = allData
        .reduce((sum, l) => sum + (l.quantidade_criada || 0), 0);
      
      document.getElementById('stat-total').textContent = totalTarefas;
      document.getElementById('stat-criadas').textContent = criadas;
      document.getElementById('stat-quantidade-total').textContent = quantidadeTotal;
    }

    function applyFilter() {
      loadAllData();
    }

    function clearFilter() {
      document.getElementById('filter-semana').value = '';
      loadAllData();
    }

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

    async function init() {
      await loadProdutos();
      populateWeekSelect();
      await loadAllData();
    }

    window.addEventListener('DOMContentLoaded', init);
  </script>
</body>
</html>
  `;
}
