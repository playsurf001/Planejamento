// Função para gerar a view estilo planilha Excel para o designer
export function generateDesignerSheetView(designer: any, designer_id: string) {
  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${designer.nome} - Controle de Produção</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          }
          
          /* Estilo de tabela Excel */
          .excel-table {
            border-collapse: collapse;
            width: 100%;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          }
          
          .excel-table th,
          .excel-table td {
            border: 1px solid #d1d5db;
            padding: 8px 12px;
            text-align: center;
            font-size: 13px;
          }
          
          .excel-table th {
            background: linear-gradient(to bottom, #f9fafb 0%, #e5e7eb 100%);
            font-weight: 600;
            color: #374151;
            position: sticky;
            top: 0;
            z-index: 10;
          }
          
          .excel-table tbody tr:nth-child(even) {
            background-color: #f9fafb;
          }
          
          .excel-table tbody tr:hover {
            background-color: #eff6ff;
          }
          
          /* Células editáveis */
          .editable-cell {
            cursor: pointer;
            min-width: 60px;
            transition: all 0.2s;
          }
          
          .editable-cell:hover {
            background-color: #dbeafe !important;
          }
          
          .editable-cell input,
          .editable-cell select {
            width: 100%;
            border: 2px solid #3b82f6;
            border-radius: 4px;
            padding: 4px 8px;
            font-size: 13px;
            text-align: center;
          }
          
          .editable-cell input:focus,
          .editable-cell select:focus {
            outline: none;
            border-color: #1d4ed8;
          }
          
          /* Checkbox OK */
          .ok-checkbox {
            width: 20px;
            height: 20px;
            cursor: pointer;
            accent-color: #10b981;
          }
          
          /* Célula com OK marcado */
          .ok-checked {
            background-color: #d1fae5 !important;
          }
          
          /* Header da semana */
          .week-header {
            background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
            color: white;
            font-weight: bold;
            font-size: 14px;
            padding: 12px;
          }
          
          /* Produto header */
          .product-cell {
            background-color: #f3f4f6;
            font-weight: 600;
            text-align: left;
            padding-left: 16px;
            color: #1f2937;
          }
          
          /* Status indicator */
          .status-dot {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            display: inline-block;
            margin-right: 6px;
          }
          
          .status-pendente { background-color: #ef4444; }
          .status-em_andamento { background-color: #f59e0b; }
          .status-completo { background-color: #10b981; }
          
          /* Notification */
          .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 16px 24px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 1000;
            animation: slideIn 0.3s ease-out;
          }
          
          @keyframes slideIn {
            from {
              transform: translateX(400px);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
          
          .notification-success {
            background-color: #10b981;
            color: white;
          }
          
          .notification-error {
            background-color: #ef4444;
            color: white;
          }
          
          /* Loading overlay */
          .loading-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
          }
          
          .spinner {
            width: 50px;
            height: 50px;
            border: 4px solid #f3f4f6;
            border-top-color: #3b82f6;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
          
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        </style>
    </head>
    <body class="bg-gray-50">
        <!-- Header -->
        <header class="bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg sticky top-0 z-50">
            <div class="container mx-auto px-6 py-4">
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-4">
                        <a href="/" class="text-white hover:text-blue-200 transition">
                            <i class="fas fa-arrow-left text-2xl"></i>
                        </a>
                        <div>
                            <h1 class="text-2xl font-bold">${designer.nome} - Controle de Produção</h1>
                            <p class="text-blue-200 text-sm">Planilha Interativa de Lançamentos</p>
                        </div>
                    </div>
                    <div class="flex items-center space-x-4">
                        <button onclick="refreshData()" class="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition flex items-center space-x-2">
                            <i class="fas fa-sync-alt"></i>
                            <span>Atualizar</span>
                        </button>
                        <button onclick="exportToExcel()" class="bg-green-500 hover:bg-green-600 px-4 py-2 rounded-lg transition flex items-center space-x-2">
                            <i class="fas fa-file-excel"></i>
                            <span>Exportar</span>
                        </button>
                    </div>
                </div>
            </div>
        </header>

        <!-- Estatísticas -->
        <div class="container mx-auto px-6 py-6">
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div class="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
                    <div class="text-sm text-gray-500 mb-1">Total Semanas</div>
                    <div id="stat-semanas" class="text-2xl font-bold text-gray-800">0</div>
                </div>
                <div class="bg-white rounded-lg shadow p-4 border-l-4 border-yellow-500">
                    <div class="text-sm text-gray-500 mb-1">Total Produtos</div>
                    <div id="stat-produtos" class="text-2xl font-bold text-gray-800">0</div>
                </div>
                <div class="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
                    <div class="text-sm text-gray-500 mb-1">Com OK</div>
                    <div id="stat-ok" class="text-2xl font-bold text-gray-800">0</div>
                </div>
                <div class="bg-white rounded-lg shadow p-4 border-l-4 border-purple-500">
                    <div class="text-sm text-gray-500 mb-1">Taxa Conclusão</div>
                    <div id="stat-taxa" class="text-2xl font-bold text-gray-800">0%</div>
                </div>
            </div>
        </div>

        <!-- Tabela estilo Excel -->
        <div class="container mx-auto px-6 pb-8">
            <div class="bg-white rounded-lg shadow-xl overflow-hidden">
                <div class="overflow-x-auto">
                    <table id="productionTable" class="excel-table">
                        <thead id="tableHeader">
                            <!-- Será preenchido via JS -->
                        </thead>
                        <tbody id="tableBody">
                            <!-- Será preenchido via JS -->
                        </tbody>
                    </table>
                </div>
            </div>
            
            <!-- Legenda -->
            <div class="mt-4 bg-white rounded-lg shadow p-4">
                <div class="text-sm font-semibold text-gray-700 mb-2">Legenda:</div>
                <div class="flex flex-wrap gap-4 text-sm text-gray-600">
                    <div class="flex items-center">
                        <span class="status-dot status-pendente"></span>
                        Pendente
                    </div>
                    <div class="flex items-center">
                        <span class="status-dot status-em_andamento"></span>
                        Em Andamento
                    </div>
                    <div class="flex items-center">
                        <span class="status-dot status-completo"></span>
                        Completo
                    </div>
                    <div class="flex items-center ml-6">
                        <div class="w-8 h-4 bg-green-100 border border-green-300 mr-2"></div>
                        Com OK marcado
                    </div>
                </div>
            </div>
        </div>

        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script>
          const DESIGNER_ID = ${designer_id};
          const API_URL = '';
          
          let productionData = [];
          let produtos = [];
          let semanas = [];
          
          // Inicialização
          document.addEventListener('DOMContentLoaded', () => {
            loadData();
          });
          
          async function loadData() {
            showLoading();
            try {
              // Buscar produtos disponíveis
              const produtosRes = await axios.get(\`\${API_URL}/api/produtos\`);
              produtos = produtosRes.data;
              
              // Buscar dados do designer
              const checklistRes = await axios.get(\`\${API_URL}/api/designer/\${DESIGNER_ID}/checklist\`);
              productionData = checklistRes.data;
              
              // Processar dados
              processData();
              renderTable();
              updateStats();
              
            } catch (error) {
              console.error('Erro ao carregar dados:', error);
              showNotification('Erro ao carregar dados', 'error');
            } finally {
              hideLoading();
            }
          }
          
          function processData() {
            // Extrair semanas únicas
            const semanasSet = new Set();
            productionData.forEach(item => {
              if (item.semana) semanasSet.add(item.semana);
            });
            semanas = Array.from(semanasSet).sort((a, b) => a - b);
          }
          
          function renderTable() {
            const header = document.getElementById('tableHeader');
            const body = document.getElementById('tableBody');
            
            // Renderizar cabeçalho
            let headerHTML = '<tr><th class="product-cell">PRODUTO</th>';
            semanas.forEach(semana => {
              headerHTML += \`
                <th colspan="3" class="week-header">Semana \${semana}</th>
              \`;
            });
            headerHTML += '</tr>';
            
            headerHTML += '<tr><th class="product-cell"></th>';
            semanas.forEach(() => {
              headerHTML += \`
                <th style="background-color: #f3f4f6;">Qtd</th>
                <th style="background-color: #f3f4f6;">Pos</th>
                <th style="background-color: #f3f4f6;">OK</th>
              \`;
            });
            headerHTML += '</tr>';
            
            header.innerHTML = headerHTML;
            
            // Renderizar corpo
            let bodyHTML = '';
            produtos.forEach(produto => {
              bodyHTML += \`<tr>\`;
              bodyHTML += \`<td class="product-cell">\${produto.nome}</td>\`;
              
              semanas.forEach(semana => {
                // Buscar lançamento para este produto/semana
                const lancamento = productionData.find(
                  l => l.produto_id === produto.id && l.semana === semana
                );
                
                const id = lancamento?.id || null;
                const qtdCriada = lancamento?.quantidade_criada || ''; // MUDADO: quantidade_criada ao invés de aprovada
                const pos = lancamento?.posicao || '';
                const ok = lancamento?.aprovado_ok || 0;
                const okClass = ok ? 'ok-checked' : '';
                
                // Quantidade CRIADA (ao clicar OK, copia para aprovada)
                bodyHTML += \`
                  <td class="editable-cell \${okClass}" onclick="editCell(this, \${id}, \${produto.id}, \${semana}, 'quantidade')">
                    <span class="cell-display">\${qtdCriada}</span>
                  </td>
                \`;
                
                // Posição
                bodyHTML += \`
                  <td class="editable-cell \${okClass}" onclick="editCell(this, \${id}, \${produto.id}, \${semana}, 'posicao')">
                    <span class="cell-display">\${pos}</span>
                  </td>
                \`;
                
                // OK Checkbox
                bodyHTML += \`
                  <td class="\${okClass}" style="background-color: \${ok ? '#d1fae5' : 'white'};">
                    <input type="checkbox" 
                           class="ok-checkbox" 
                           \${ok ? 'checked' : ''}
                           onchange="toggleOK(this, \${id}, \${produto.id}, \${semana})"
                           data-lancamento-id="\${id}"
                           data-produto-id="\${produto.id}"
                           data-semana="\${semana}">
                  </td>
                \`;
              });
              
              bodyHTML += \`</tr>\`;
            });
            
            body.innerHTML = bodyHTML;
          }
          
          async function editCell(cell, lancamentoId, produtoId, semana, field) {
            const displaySpan = cell.querySelector('.cell-display');
            const currentValue = displaySpan.textContent.trim();
            
            let inputHTML;
            if (field === 'posicao') {
              inputHTML = \`
                <select onblur="saveCell(this, \${lancamentoId}, \${produtoId}, \${semana}, '\${field}')" 
                        onchange="saveCell(this, \${lancamentoId}, \${produtoId}, \${semana}, '\${field}')"
                        autofocus>
                  <option value="">-</option>
                  <option value="1º" \${currentValue === '1º' ? 'selected' : ''}>1º</option>
                  <option value="2º" \${currentValue === '2º' ? 'selected' : ''}>2º</option>
                  <option value="3º" \${currentValue === '3º' ? 'selected' : ''}>3º</option>
                  <option value="4º" \${currentValue === '4º' ? 'selected' : ''}>4º</option>
                  <option value="5º" \${currentValue === '5º' ? 'selected' : ''}>5º</option>
                  <option value="6º" \${currentValue === '6º' ? 'selected' : ''}>6º</option>
                </select>
              \`;
            } else {
              inputHTML = \`
                <input type="number" 
                       value="\${currentValue}" 
                       min="0"
                       onblur="saveCell(this, \${lancamentoId}, \${produtoId}, \${semana}, '\${field}')"
                       onkeypress="if(event.key==='Enter') saveCell(this, \${lancamentoId}, \${produtoId}, \${semana}, '\${field}')"
                       autofocus>
              \`;
            }
            
            cell.innerHTML = inputHTML;
            cell.querySelector(field === 'posicao' ? 'select' : 'input').focus();
          }
          
          async function saveCell(input, lancamentoId, produtoId, semana, field) {
            const value = input.value;
            const cell = input.parentElement;
            
            try {
              if (lancamentoId && lancamentoId !== 'null' && lancamentoId !== null) {
                // Buscar dados atuais do lançamento
                const currentData = await axios.get(\`\${API_URL}/api/lancamentos/\${lancamentoId}\`);
                
                // Preparar dados para atualização
                const updateData = {
                  designer_id: currentData.data.designer_id,
                  produto_id: currentData.data.produto_id,
                  semana: currentData.data.semana,
                  data: currentData.data.data,
                  quantidade_criada: currentData.data.quantidade_criada || 0,
                  quantidade_aprovada: currentData.data.quantidade_aprovada || 0,
                  observacoes: currentData.data.observacoes,
                  criado_check: currentData.data.criado_check || 0,
                  aprovado_ok: currentData.data.aprovado_ok || 0,
                  posicao: currentData.data.posicao
                };
                
                // Atualizar campo específico
                if (field === 'quantidade') {
                  updateData.quantidade_criada = parseInt(value) || 0; // MUDADO: salva em quantidade_criada
                } else if (field === 'posicao') {
                  updateData.posicao = value;
                }
                
                await axios.put(\`\${API_URL}/api/lancamentos/\${lancamentoId}\`, updateData);
                showNotification('Atualizado com sucesso!', 'success');
                
              } else if (value) {
                // Criar novo lançamento
                const newData = {
                  designer_id: DESIGNER_ID,
                  produto_id: produtoId,
                  semana: semana,
                  data: new Date().toISOString().split('T')[0],
                  quantidade_criada: field === 'quantidade' ? (parseInt(value) || 0) : 0, // MUDADO: salva em criada
                  quantidade_aprovada: 0,
                  posicao: field === 'posicao' ? value : null,
                  criado_check: 0,
                  aprovado_ok: 0,
                  status: 'pendente'
                };
                
                const response = await axios.post(\`\${API_URL}/api/lancamentos\`, newData);
                showNotification('Criado com sucesso!', 'success');
              }
              
              // Recarregar dados
              await loadData();
              
            } catch (error) {
              console.error('Erro ao salvar:', error);
              console.error('Detalhes:', error.response?.data);
              showNotification('Erro ao salvar: ' + (error.response?.data?.message || error.message), 'error');
              cell.innerHTML = \`<span class="cell-display">\${value}</span>\`;
            }
          }
          
          async function toggleOK(checkbox, lancamentoId, produtoId, semana) {
            const isChecked = checkbox.checked;
            
            try {
              if (lancamentoId && lancamentoId !== 'null' && lancamentoId !== null) {
                // Buscar dados atuais
                const currentData = await axios.get(\`\${API_URL}/api/lancamentos/\${lancamentoId}\`);
                
                // MUDADO: Quando marcar OK, copia quantidade_criada para quantidade_aprovada
                const qtdCriada = currentData.data.quantidade_criada || 0;
                const qtdAprovada = isChecked ? qtdCriada : 0; // Se marcar OK, copia criada para aprovada
                
                // Atualizar lançamento existente mantendo todos os campos
                const updateData = {
                  designer_id: currentData.data.designer_id,
                  produto_id: currentData.data.produto_id,
                  semana: currentData.data.semana,
                  data: currentData.data.data,
                  quantidade_criada: qtdCriada,
                  quantidade_aprovada: qtdAprovada, // AUTOMÁTICO: copia da quantidade criada ao marcar OK
                  observacoes: currentData.data.observacoes,
                  criado_check: currentData.data.criado_check || 0,
                  aprovado_ok: isChecked ? 1 : 0,
                  posicao: currentData.data.posicao
                };
                
                await axios.put(\`\${API_URL}/api/lancamentos/\${lancamentoId}\`, updateData);
                showNotification(isChecked ? \`Marcado como OK! (\${qtdCriada} aprovadas)\` : 'Desmarcado', 'success');
                
                // Navegar para aba Lançamentos após marcar OK
                if (isChecked) {
                  setTimeout(() => {
                    if (typeof showTab === 'function') {
                      showTab('lancamentos');
                    } else {
                      window.location.href = '/?tab=lancamentos';
                    }
                  }, 1000);
                }
                
              } else if (isChecked) {
                // Criar novo lançamento ao marcar OK
                const newData = {
                  designer_id: DESIGNER_ID,
                  produto_id: produtoId,
                  semana: semana,
                  data: new Date().toISOString().split('T')[0],
                  quantidade_criada: 0,
                  quantidade_aprovada: 0,
                  criado_check: 0,
                  aprovado_ok: 1,
                  posicao: null,
                  status: 'em_andamento'
                };
                
                const response = await axios.post(\`\${API_URL}/api/lancamentos\`, newData);
                showNotification('Criado e marcado como OK!', 'success');
                
                // Navegar para aba Lançamentos após criar
                setTimeout(() => {
                  if (typeof showTab === 'function') {
                    showTab('lancamentos');
                  } else {
                    window.location.href = '/?tab=lancamentos';
                  }
                }, 1000);
              }
              
              // Recarregar dados
              await loadData();
              
              // NOVO: Navegar automaticamente para aba de Lançamentos ao marcar OK
              if (isChecked) {
                showNotification('Navegando para Lançamentos...', 'success');
                setTimeout(() => {
                  window.parent.postMessage({ action: 'showTab', tab: 'lancamentos' }, '*');
                }, 1000);
              }
              
            } catch (error) {
              console.error('Erro ao marcar OK:', error);
              console.error('Detalhes:', error.response?.data);
              checkbox.checked = !isChecked;
              showNotification('Erro ao marcar OK: ' + (error.response?.data?.message || error.message), 'error');
            }
          }
          
          function updateStats() {
            // Contar estatísticas
            const totalSemanas = semanas.length;
            const totalProdutos = produtos.length;
            const totalCelulas = totalSemanas * totalProdutos;
            const celulosOK = productionData.filter(l => l.aprovado_ok).length;
            const taxa = totalCelulas > 0 ? ((celulosOK / totalCelulas) * 100).toFixed(1) : 0;
            
            document.getElementById('stat-semanas').textContent = totalSemanas;
            document.getElementById('stat-produtos').textContent = totalProdutos;
            document.getElementById('stat-ok').textContent = celulosOK;
            document.getElementById('stat-taxa').textContent = taxa + '%';
          }
          
          async function refreshData() {
            await loadData();
            showNotification('Dados atualizados!', 'success');
          }
          
          function exportToExcel() {
            showNotification('Função de exportação em desenvolvimento', 'error');
          }
          
          function showLoading() {
            const overlay = document.createElement('div');
            overlay.id = 'loading-overlay';
            overlay.className = 'loading-overlay';
            overlay.innerHTML = '<div class="spinner"></div>';
            document.body.appendChild(overlay);
          }
          
          function hideLoading() {
            const overlay = document.getElementById('loading-overlay');
            if (overlay) overlay.remove();
          }
          
          function showNotification(message, type) {
            const notification = document.createElement('div');
            notification.className = \`notification notification-\${type}\`;
            notification.innerHTML = \`
              <div class="flex items-center space-x-2">
                <i class="fas fa-\${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
                <span>\${message}</span>
              </div>
            \`;
            
            document.body.appendChild(notification);
            
            setTimeout(() => {
              notification.style.opacity = '0';
              setTimeout(() => notification.remove(), 300);
            }, 3000);
          }
        </script>
    </body>
    </html>
  `;
}
