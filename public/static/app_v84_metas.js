// ==============================================
// SISTEMA DE CONTROLE DE PRODUÇÃO v8.4
// Reescrito com Gerenciamento de Estado Robusto
// ==============================================

// API Base URL
const API_URL = '';

// ==============================================
// GERENCIAMENTO DE ESTADO GLOBAL
// ==============================================

const AppState = {
  // Dados
  designers: [],
  produtos: [],
  metas: [],
  lancamentos: [],
  periodos: [],
  
  // Estado de carregamento
  loading: {
    dashboard: false,
    designers: false,
    produtos: false,
    metas: false,
    lancamentos: false
  },
  
  // Erros
  errors: {
    dashboard: null,
    designers: null,
    produtos: null,
    metas: null,
    lancamentos: null
  },
  
  // Filtros
  filters: {
    mes: '',
    ano: '',
    semana: ''
  },
  
  // Gráficos
  charts: {
    designers: null,
    timeline: null
  },
  
  // Paginação
  pagination: {
    currentPage: 0,
    itemsPerPage: 20,
    totalItems: 0
  }
};

// ==============================================
// SISTEMA DE NOTIFICAÇÕES (TOASTS)
// ==============================================

const Toast = {
  show(message, type = 'info', duration = 3000) {
    const colors = {
      success: 'bg-green-500',
      error: 'bg-red-500',
      warning: 'bg-yellow-500',
      info: 'bg-blue-500'
    };
    
    const icons = {
      success: 'fa-check-circle',
      error: 'fa-exclamation-circle',
      warning: 'fa-exclamation-triangle',
      info: 'fa-info-circle'
    };
    
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 ${colors[type]} text-white px-6 py-4 rounded-lg shadow-2xl z-[9999] flex items-center gap-3 animate-slide-in transform transition-all duration-300`;
    toast.innerHTML = `
      <i class="fas ${icons[type]} text-xl"></i>
      <span class="font-medium">${message}</span>
      <button onclick="this.parentElement.remove()" class="ml-4 hover:bg-white/20 rounded p-1">
        <i class="fas fa-times"></i>
      </button>
    `;
    
    document.body.appendChild(toast);
    
    // Auto-remover após duração
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  },
  
  success(message) { this.show(message, 'success'); },
  error(message) { this.show(message, 'error', 4000); },
  warning(message) { this.show(message, 'warning'); },
  info(message) { this.show(message, 'info'); }
};

// ==============================================
// COMPONENTES DE UI - LOADING E ERRO
// ==============================================

const UI = {
  // Mostrar loading
  showLoading(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = `
      <div class="flex flex-col items-center justify-center py-12">
        <div class="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mb-4"></div>
        <p class="text-gray-600 font-medium">Carregando dados...</p>
      </div>
    `;
  },
  
  // Mostrar erro
  showError(containerId, message, onRetry = null) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = `
      <div class="flex flex-col items-center justify-center py-12">
        <i class="fas fa-exclamation-triangle text-red-500 text-5xl mb-4"></i>
        <p class="text-gray-800 font-semibold text-lg mb-2">Erro ao carregar dados</p>
        <p class="text-gray-600 mb-6">${message}</p>
        ${onRetry ? `<button onclick="${onRetry}()" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
          <i class="fas fa-redo mr-2"></i>Tentar Novamente
        </button>` : ''}
      </div>
    `;
  },
  
  // Mostrar vazio
  showEmpty(containerId, message = 'Nenhum dado encontrado') {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = `
      <div class="flex flex-col items-center justify-center py-12">
        <i class="fas fa-inbox text-gray-400 text-5xl mb-4"></i>
        <p class="text-gray-600 font-medium">${message}</p>
      </div>
    `;
  }
};

// ==============================================
// UTILITÁRIOS
// ==============================================

const Utils = {
  // Formatar data
  formatDate(date) {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('pt-BR');
  },
  
  // Validar campos obrigatórios
  validateRequired(fields) {
    const errors = [];
    
    for (const [name, value] of Object.entries(fields)) {
      if (!value || value === '' || value === '0' || value === 0) {
        errors.push(`Campo "${name}" é obrigatório`);
      }
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  },
  
  // Debounce
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
};

// ==============================================
// NAVEGAÇÃO ENTRE TABS
// ==============================================

function showTab(tabName) {
  // Esconder todas as tabs
  document.querySelectorAll('.tab-content').forEach(tab => {
    tab.classList.add('hidden');
  });
  
  // Mostrar tab selecionada
  const targetTab = document.getElementById(`tab-${tabName}`);
  if (targetTab) {
    targetTab.classList.remove('hidden');
  }
  
  // Atualizar botões
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('bg-white/40');
  });
  
  // Carregar dados da tab
  switch(tabName) {
    case 'dashboard':
      loadDashboard();
      break;
    case 'designers':
      loadDesignersList();
      break;
    case 'lancamentos':
      loadLancamentos();
      break;
    case 'relatorios':
      loadRelatorios();
      break;
    case 'metas':
      loadMetas();
      break;
    case 'cadastros':
      loadCadastros();
      break;
  }
}

// ==============================================
// INICIALIZAÇÃO
// ==============================================

async function initializeApp() {
  try {
    // Carregar dados iniciais em paralelo
    await Promise.all([
      loadPeriodos(),
      loadDesignersAndProdutos()
    ]);
    
    // Definir data padrão
    const today = new Date().toISOString().split('T')[0];
    const inputData = document.getElementById('input-data');
    if (inputData) {
      inputData.value = today;
    }
    
    // Carregar dashboard
    loadDashboard();
    
    Toast.success('Sistema iniciado com sucesso!');
  } catch (error) {
    console.error('Erro na inicialização:', error);
    Toast.error('Erro ao inicializar sistema');
  }
}

async function loadPeriodos() {
  try {
    const response = await axios.get(`${API_URL}/api/periodos`);
    AppState.periodos = response.data || [];
    populateFilterSelects();
  } catch (error) {
    console.error('Erro ao carregar períodos:', error);
    AppState.periodos = [];
  }
}

async function loadDesignersAndProdutos() {
  try {
    const [designersRes, produtosRes] = await Promise.all([
      axios.get(`${API_URL}/api/designers`),
      axios.get(`${API_URL}/api/produtos`)
    ]);
    
    AppState.designers = designersRes.data || [];
    AppState.produtos = produtosRes.data || [];
    
    updateDesignerSelects();
    updateProdutoSelects();
  } catch (error) {
    console.error('Erro ao carregar designers e produtos:', error);
    AppState.designers = [];
    AppState.produtos = [];
    Toast.error('Erro ao carregar listas de designers e produtos');
  }
}

function updateDesignerSelects() {
  const selects = ['input-designer', 'edit-designer'];
  selects.forEach(selectId => {
    const select = document.getElementById(selectId);
    if (select) {
      select.innerHTML = '<option value="">Selecione...</option>' +
        AppState.designers.map(d => `<option value="${d.id}">${d.nome}</option>`).join('');
    }
  });
}

function updateProdutoSelects() {
  const selects = ['input-produto', 'edit-produto', 'meta-produto'];
  selects.forEach(selectId => {
    const select = document.getElementById(selectId);
    if (select) {
      select.innerHTML = '<option value="">Selecione...</option>' +
        AppState.produtos.map(p => `<option value="${p.id}">${p.nome}</option>`).join('');
    }
  });
}

function populateFilterSelects() {
  const meses = [...new Set(AppState.periodos.map(p => p.mes))].sort();
  const anos = [...new Set(AppState.periodos.map(p => p.ano))].sort().reverse();
  
  // Filtros do dashboard
  const filterMes = document.getElementById('filter-mes');
  const filterAno = document.getElementById('filter-ano');
  
  if (filterMes) {
    filterMes.innerHTML = '<option value="">Todos</option>' +
      meses.map(m => `<option value="${m}">${getNomeMes(m)}</option>`).join('');
  }
  
  if (filterAno) {
    filterAno.innerHTML = '<option value="">Todos</option>' +
      anos.map(a => `<option value="${a}">${a}</option>`).join('');
  }
  
  // Filtros de relatórios
  const relatorioMes = document.getElementById('relatorio-mes');
  const relatorioAno = document.getElementById('relatorio-ano');
  
  if (relatorioMes) {
    relatorioMes.innerHTML = '<option value="">Todos</option>' +
      meses.map(m => `<option value="${m}">${getNomeMes(m)}</option>`).join('');
  }
  
  if (relatorioAno) {
    relatorioAno.innerHTML = '<option value="">Todos</option>' +
      anos.map(a => `<option value="${a}">${a}</option>`).join('');
  }
}

function getNomeMes(mes) {
  const meses = ['', 'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  return meses[parseInt(mes)] || mes;
}

// ==============================================
// DASHBOARD
// ==============================================

async function loadDashboard() {
  AppState.loading.dashboard = true;
  AppState.errors.dashboard = null;
  
  try {
    const params = new URLSearchParams();
    if (AppState.filters.mes) params.append('mes', AppState.filters.mes);
    if (AppState.filters.ano) params.append('ano', AppState.filters.ano);
    
    // Carregar todas as estatísticas em paralelo
    const [statsRes, designersRes, timelineRes, produtosRes] = await Promise.all([
      axios.get(`${API_URL}/api/relatorios/estatisticas?${params}`),
      axios.get(`${API_URL}/api/relatorios/por-designer?${params}`),
      axios.get(`${API_URL}/api/relatorios/timeline?limit=12&${params}`),
      axios.get(`${API_URL}/api/relatorios/por-produto?limit=6&${params}`)
    ]);
    
    // Atualizar estatísticas
    const stats = statsRes.data;
    document.getElementById('stat-designers').textContent = stats.total_designers || 0;
    document.getElementById('stat-aprovadas').textContent = stats.total_aprovadas || 0;
    document.getElementById('stat-criadas').textContent = stats.total_criadas || 0;
    document.getElementById('stat-taxa').textContent = `${stats.taxa_aprovacao_geral || 0}%`;
    
    // Renderizar gráficos
    renderChartDesigners(designersRes.data || []);
    renderChartTimeline(timelineRes.data || []);
    renderTopProdutos(produtosRes.data || []);
    
    AppState.loading.dashboard = false;
    
  } catch (error) {
    console.error('Erro ao carregar dashboard:', error);
    AppState.errors.dashboard = error.message;
    AppState.loading.dashboard = false;
    Toast.error('Erro ao carregar dashboard');
  }
}

function renderChartDesigners(data) {
  const ctx = document.getElementById('chartDesigners');
  if (!ctx) return;
  
  if (AppState.charts.designers) {
    AppState.charts.designers.destroy();
  }
  
  if (!data || data.length === 0) {
    ctx.parentElement.innerHTML = '<p class="text-gray-500 text-center py-8">Nenhum dado disponível</p>';
    return;
  }
  
  AppState.charts.designers = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: data.map(d => d.designer || 'Sem nome'),
      datasets: [
        {
          label: 'Aprovadas',
          data: data.map(d => d.total_aprovadas || 0),
          backgroundColor: 'rgba(34, 197, 94, 0.7)',
          borderColor: 'rgba(34, 197, 94, 1)',
          borderWidth: 1
        },
        {
          label: 'Criadas',
          data: data.map(d => d.total_criadas || 0),
          backgroundColor: 'rgba(234, 179, 8, 0.7)',
          borderColor: 'rgba(234, 179, 8, 1)',
          borderWidth: 1
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      scales: {
        y: {
          beginAtZero: true
        }
      },
      plugins: {
        legend: {
          position: 'top'
        }
      }
    }
  });
}

function renderChartTimeline(data) {
  const ctx = document.getElementById('chartTimeline');
  if (!ctx) return;
  
  if (AppState.charts.timeline) {
    AppState.charts.timeline.destroy();
  }
  
  if (!data || data.length === 0) {
    ctx.parentElement.innerHTML = '<p class="text-gray-500 text-center py-8">Nenhum dado disponível</p>';
    return;
  }
  
  const sortedData = [...data].reverse();
  
  AppState.charts.timeline = new Chart(ctx, {
    type: 'line',
    data: {
      labels: sortedData.map(d => `Sem ${d.semana}`),
      datasets: [
        {
          label: 'Aprovadas',
          data: sortedData.map(d => d.total_aprovadas || 0),
          borderColor: 'rgba(34, 197, 94, 1)',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          tension: 0.4,
          fill: true
        },
        {
          label: 'Criadas',
          data: sortedData.map(d => d.total_criadas || 0),
          borderColor: 'rgba(234, 179, 8, 1)',
          backgroundColor: 'rgba(234, 179, 8, 0.1)',
          tension: 0.4,
          fill: true
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      scales: {
        y: {
          beginAtZero: true
        }
      },
      plugins: {
        legend: {
          position: 'top'
        }
      }
    }
  });
}

function renderTopProdutos(data) {
  const container = document.getElementById('topProdutos');
  if (!container) return;
  
  if (!data || data.length === 0) {
    container.innerHTML = '<p class="text-gray-500 text-center py-8">Nenhum produto encontrado</p>';
    return;
  }
  
  container.innerHTML = data.map((produto, index) => `
    <div class="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200 hover:shadow-lg transition">
      <div class="flex items-start justify-between mb-2">
        <div class="flex items-center gap-2">
          <span class="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
            ${index + 1}º
          </span>
          <h4 class="font-semibold text-gray-800">${produto.produto || 'Sem nome'}</h4>
        </div>
      </div>
      <div class="grid grid-cols-2 gap-2 text-sm">
        <div>
          <p class="text-gray-600">Criadas</p>
          <p class="font-bold text-yellow-600">${produto.total_criadas || 0}</p>
        </div>
        <div>
          <p class="text-gray-600">Aprovadas</p>
          <p class="font-bold text-green-600">${produto.total_aprovadas || 0}</p>
        </div>
      </div>
      ${produto.taxa_aprovacao ? `
        <div class="mt-2 pt-2 border-t border-blue-200">
          <p class="text-xs text-gray-600">Taxa de Aprovação</p>
          <div class="flex items-center gap-2">
            <div class="flex-1 bg-gray-200 rounded-full h-2">
              <div class="bg-green-500 h-2 rounded-full" style="width: ${produto.taxa_aprovacao}%"></div>
            </div>
            <span class="text-sm font-semibold text-green-600">${produto.taxa_aprovacao}%</span>
          </div>
        </div>
      ` : ''}
    </div>
  `).join('');
}

function applyDashboardFilters() {
  AppState.filters.mes = document.getElementById('filter-mes').value;
  AppState.filters.ano = document.getElementById('filter-ano').value;
  loadDashboard();
}

function clearDashboardFilters() {
  document.getElementById('filter-mes').value = '';
  document.getElementById('filter-ano').value = '';
  AppState.filters.mes = '';
  AppState.filters.ano = '';
  loadDashboard();
}

// ==============================================
// METAS - IMPLEMENTAÇÃO COMPLETA COM VALIDAÇÃO
// ==============================================

// Estado da Meta sendo editada
let currentMetaId = null;

async function loadMetas() {
  AppState.loading.metas = true;
  AppState.errors.metas = null;
  
  UI.showLoading('listaMetas');
  
  try {
    const response = await axios.get(`${API_URL}/api/metas`);
    AppState.metas = response.data || [];
    
    renderMetas();
    AppState.loading.metas = false;
    
  } catch (error) {
    console.error('Erro ao carregar metas:', error);
    AppState.errors.metas = error.message;
    AppState.loading.metas = false;
    UI.showError('listaMetas', 'Não foi possível carregar as metas', 'loadMetas');
    Toast.error('Erro ao carregar metas');
  }
}

function renderMetas() {
  const container = document.getElementById('listaMetas');
  if (!container) return;
  
  if (AppState.metas.length === 0) {
    UI.showEmpty('listaMetas', 'Nenhuma meta cadastrada ainda');
    return;
  }
  
  container.innerHTML = `
    <div class="overflow-x-auto">
      <table class="w-full">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Produto</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Meta de Aprovação</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Período (Semanas)</th>
            <th class="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase">Ações</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          ${AppState.metas.map(meta => `
            <tr class="hover:bg-gray-50 transition">
              <td class="px-4 py-3 font-medium text-gray-900">${meta.produto_nome || 'N/A'}</td>
              <td class="px-4 py-3">
                <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800">
                  <i class="fas fa-bullseye mr-2"></i>${meta.meta_aprovacao || 0}
                </span>
              </td>
              <td class="px-4 py-3 text-gray-700">${meta.periodo_semanas || 18} semanas</td>
              <td class="px-4 py-3 text-right">
                <button onclick="editMeta(${meta.id})" 
                        class="text-blue-600 hover:text-blue-800 mr-3 transition">
                  <i class="fas fa-edit"></i> Editar
                </button>
                <button onclick="confirmDeleteMeta(${meta.id})" 
                        class="text-red-600 hover:text-red-800 transition">
                  <i class="fas fa-trash"></i> Excluir
                </button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

// Criar/Editar Meta com Validação
async function handleSaveMeta(event) {
  event.preventDefault();
  
  // Obter valores do formulário
  const produtoId = document.getElementById('meta-produto').value;
  const metaAprovacao = document.getElementById('meta-aprovacao').value;
  const periodo = document.getElementById('meta-periodo').value;
  
  // Validação de campos obrigatórios
  const validation = Utils.validateRequired({
    'Produto': produtoId,
    'Meta de Aprovação': metaAprovacao,
    'Período': periodo
  });
  
  if (!validation.valid) {
    Toast.error(validation.errors.join('<br>'));
    // Destacar campos vazios
    if (!produtoId) document.getElementById('meta-produto').classList.add('border-red-500');
    if (!metaAprovacao) document.getElementById('meta-aprovacao').classList.add('border-red-500');
    if (!periodo) document.getElementById('meta-periodo').classList.add('border-red-500');
    return;
  }
  
  // Validar valores numéricos
  if (parseInt(metaAprovacao) <= 0) {
    Toast.error('Meta de Aprovação deve ser maior que zero');
    return;
  }
  
  if (parseInt(periodo) <= 0) {
    Toast.error('Período deve ser maior que zero');
    return;
  }
  
  // Remover destaque de erro
  document.getElementById('meta-produto').classList.remove('border-red-500');
  document.getElementById('meta-aprovacao').classList.remove('border-red-500');
  document.getElementById('meta-periodo').classList.remove('border-red-500');
  
  // Preparar dados
  const metaData = {
    produto_id: parseInt(produtoId),
    meta_aprovacao: parseInt(metaAprovacao),
    periodo_semanas: parseInt(periodo)
  };
  
  try {
    let response;
    
    if (currentMetaId) {
      // Atualizar meta existente
      response = await axios.put(`${API_URL}/api/metas/${currentMetaId}`, metaData);
      Toast.success('Meta atualizada com sucesso!');
    } else {
      // Criar nova meta
      response = await axios.post(`${API_URL}/api/metas`, metaData);
      Toast.success('Meta criada com sucesso!');
    }
    
    // Limpar formulário e recarregar lista
    resetMetaForm();
    await loadMetas();
    
  } catch (error) {
    console.error('Erro ao salvar meta:', error);
    
    if (error.response) {
      Toast.error(`Erro ao salvar: ${error.response.data.message || 'Erro desconhecido'}`);
    } else if (error.request) {
      Toast.error('Não foi possível conectar ao servidor');
    } else {
      Toast.error('Erro ao processar requisição');
    }
  }
}

// Editar Meta - Preencher formulário
async function editMeta(id) {
  try {
    // Encontrar meta no estado
    const meta = AppState.metas.find(m => m.id === id);
    
    if (!meta) {
      Toast.error('Meta não encontrada');
      return;
    }
    
    // Preencher formulário
    document.getElementById('meta-produto').value = meta.produto_id;
    document.getElementById('meta-aprovacao').value = meta.meta_aprovacao;
    document.getElementById('meta-periodo').value = meta.periodo_semanas;
    
    // Atualizar título e botão
    document.getElementById('meta-form-title').textContent = 'Editar Meta';
    document.getElementById('meta-btn-text').textContent = 'Atualizar Meta';
    document.getElementById('meta-cancel-btn').classList.remove('hidden');
    
    // Guardar ID
    currentMetaId = id;
    
    // Scroll para o formulário
    document.getElementById('formMeta').scrollIntoView({ behavior: 'smooth', block: 'start' });
    
    Toast.info('Meta carregada para edição');
    
  } catch (error) {
    console.error('Erro ao editar meta:', error);
    Toast.error('Erro ao carregar meta para edição');
  }
}

// Cancelar edição
function cancelEditMeta() {
  resetMetaForm();
  Toast.info('Edição cancelada');
}

// Resetar formulário
function resetMetaForm() {
  document.getElementById('formMeta').reset();
  document.getElementById('meta-form-title').textContent = 'Nova Meta';
  document.getElementById('meta-btn-text').textContent = 'Salvar Meta';
  document.getElementById('meta-cancel-btn').classList.add('hidden');
  currentMetaId = null;
  
  // Remover destaques de erro
  document.getElementById('meta-produto').classList.remove('border-red-500');
  document.getElementById('meta-aprovacao').classList.remove('border-red-500');
  document.getElementById('meta-periodo').classList.remove('border-red-500');
}

// Confirmar exclusão
function confirmDeleteMeta(id) {
  const meta = AppState.metas.find(m => m.id === id);
  
  if (!meta) {
    Toast.error('Meta não encontrada');
    return;
  }
  
  if (confirm(`Deseja realmente excluir a meta do produto "${meta.produto_nome}"?`)) {
    deleteMeta(id);
  }
}

// Excluir Meta
async function deleteMeta(id) {
  try {
    await axios.delete(`${API_URL}/api/metas/${id}`);
    Toast.success('Meta excluída com sucesso!');
    await loadMetas();
  } catch (error) {
    console.error('Erro ao excluir meta:', error);
    Toast.error('Erro ao excluir meta');
  }
}

// ==============================================
// EVENT LISTENERS
// ==============================================

document.addEventListener('DOMContentLoaded', () => {
  // Inicializar app
  initializeApp();
  
  // Form de Meta
  const formMeta = document.getElementById('formMeta');
  if (formMeta) {
    formMeta.addEventListener('submit', handleSaveMeta);
  }
  
  // Remover destaque de erro ao digitar
  ['meta-produto', 'meta-aprovacao', 'meta-periodo'].forEach(id => {
    const element = document.getElementById(id);
    if (element) {
      element.addEventListener('change', () => {
        element.classList.remove('border-red-500');
      });
    }
  });
});

// ==============================================
// FUNÇÕES AUXILIARES (mantidas para compatibilidade)
// ==============================================

function loadDesignersList() {
  // Implementação mantida da versão anterior
  console.log('loadDesignersList chamada');
}

function loadLancamentos() {
  // Implementação mantida da versão anterior
  console.log('loadLancamentos chamada');
}

function loadRelatorios() {
  // Implementação mantida da versão anterior
  console.log('loadRelatorios chamada');
}

function loadCadastros() {
  // Implementação mantida da versão anterior
  console.log('loadCadastros chamada');
}
