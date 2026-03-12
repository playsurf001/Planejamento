// API Base URL
const API_URL = '';

// Modo de desenvolvimento (definir como false em produção)
const DEBUG_MODE = false;

// Logger condicional
const logger = {
  log: (...args) => { if (DEBUG_MODE) console.log(...args); },
  warn: (...args) => { if (DEBUG_MODE) console.warn(...args); },
  error: (...args) => console.error(...args), // Sempre manter errors
  info: (...args) => { if (DEBUG_MODE) console.info(...args); }
};

// ===========================
// TIMEZONE UTILITY - BRASÍLIA
// ===========================
/**
 * Retorna a data/hora atual no fuso horário de Brasília (America/Sao_Paulo)
 * @param {string} format - 'iso' para ISO string, 'date' para YYYY-MM-DD, 'datetime' para Date object
 * @returns {string|Date} Data formatada ou objeto Date
 */
function getBrasiliaDateTime(format = 'iso') {
  const now = new Date();
  const brasiliaTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
  
  if (format === 'datetime') {
    return brasiliaTime;
  }
  
  if (format === 'date') {
    const year = brasiliaTime.getFullYear();
    const month = String(brasiliaTime.getMonth() + 1).padStart(2, '0');
    const day = String(brasiliaTime.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  // ISO format for backend
  const year = brasiliaTime.getFullYear();
  const month = String(brasiliaTime.getMonth() + 1).padStart(2, '0');
  const day = String(brasiliaTime.getDate()).padStart(2, '0');
  const hours = String(brasiliaTime.getHours()).padStart(2, '0');
  const minutes = String(brasiliaTime.getMinutes()).padStart(2, '0');
  const seconds = String(brasiliaTime.getSeconds()).padStart(2, '0');
  
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
}

// ===========================
// ESTADO GLOBAL COM GERENCIAMENTO ROBUSTO
// ===========================
const AppState = {
  // Dados
  designers: [],
  produtos: [],
  periodos: [],
  metas: [],
  lancamentos: [],
  
  // Usuário atual
  currentUser: null,
  userRole: 'user', // 'admin' ou 'user'
  
  // Estado de carregamento
  loading: {
    dashboard: false,
    designers: false,
    lancamentos: false,
    relatorios: false,
    metas: false,
    cadastros: false,
    planejamentos: false,
    meusProdutos: false
  },
  
  // Erros
  errors: {
    dashboard: null,
    designers: null,
    lancamentos: null,
    relatorios: null,
    metas: null,
    cadastros: null,
    planejamentos: null,
    meusProdutos: null
  },
  
  // UI
  chartDesigners: null,
  chartTimeline: null,
  currentPage: 0,
  totalItems: 0,
  itemsPerPage: 20,
  currentFilters: {
    mes: '',
    ano: '',
    semana: ''
  },
  
  // Meta sendo editada
  editingMeta: null,
  
  // Planejamento sendo editado
  editingPlanejamento: null
};

// ===========================
// HELPERS DE ESTADO
// ===========================

function setLoading(section, isLoading) {
  AppState.loading[section] = isLoading;
  updateLoadingUI(section, isLoading);
}

function setError(section, error) {
  AppState.errors[section] = error;
  if (error) {
    console.error(`Erro em ${section}:`, error);
    
    // Mensagens de erro específicas e amigáveis
    let errorMessage = `Erro ao carregar ${section}`;
    
    if (error.response) {
      // Erro com resposta do servidor
      const status = error.response.status;
      if (status === 404) {
        errorMessage = `${section}: Dados não encontrados (404)`;
      } else if (status === 500) {
        errorMessage = `${section}: Erro no servidor (500)`;
      } else if (status === 403) {
        errorMessage = `${section}: Acesso negado (403)`;
      } else {
        errorMessage = `${section}: Erro ${status}`;
      }
      
      // Adicionar mensagem de erro do servidor se disponível
      if (error.response.data && error.response.data.error) {
        errorMessage += ` - ${error.response.data.error}`;
      }
    } else if (error.request) {
      // Erro de rede (sem resposta do servidor)
      errorMessage = `${section}: Backend indisponível. Verifique sua conexão.`;
    } else {
      // Outro tipo de erro
      errorMessage = `${section}: ${error.message || 'Erro desconhecido'}`;
    }
    
    showNotification(errorMessage, 'error');
  }
}

function updateLoadingUI(section, isLoading) {
  const spinner = document.getElementById(`${section}-loading`);
  if (spinner) {
    spinner.classList.toggle('hidden', !isLoading);
  }
}

// ===========================
// CONTROLE DE USUÁRIO E PERMISSÕES
// ===========================

function getCurrentWeek() {
  const now = new Date();
  const year = now.getFullYear();
  
  // Calcular o número da semana ISO
  const firstDayOfYear = new Date(year, 0, 1);
  const pastDaysOfYear = (now - firstDayOfYear) / 86400000;
  const weekNumber = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  
  // Formatar como YYYY-Www (ex: 2026-W04)
  return `${year}-W${weekNumber.toString().padStart(2, '0')}`;
}

function formatWeekDisplay(weekString) {
  // Converter "2026-W04" para "Semana 4 de 2026"
  if (!weekString) return '';
  const parts = weekString.split('-W');
  if (parts.length !== 2) return weekString;
  return `Semana ${parseInt(parts[1])} de ${parts[0]}`;
}

function initializeUser() {
  // VERIFICAR SE ESTAMOS NA PÁGINA DE LOGIN
  const currentPath = window.location.pathname;
  const isLoginPage = currentPath === '/login' || currentPath.includes('/login');
  
  // Se estiver na página de login, não fazer nada
  if (isLoginPage) {
    return;
  }
  
  // Verificar se há usuário logado no localStorage
  const userStr = localStorage.getItem('user_data');
  const authToken = localStorage.getItem('auth_token');
  
  // SE NÃO HOUVER TOKEN OU USER_DATA, REDIRECIONAR PARA LOGIN
  if (!userStr || !authToken) {
    logger.warn('❌ Usuário não autenticado - redirecionando para login');
    window.location.href = '/login';
    return;
  }
  
  try {
    const user = JSON.parse(userStr);
    AppState.currentUser = user;
    // Detectar supervisor por permissões customizadas
    const isSupervisor = user.permissoes?.is_supervisor === true;
    AppState.userRole = isSupervisor ? 'supervisor' : (user.role || 'user');
    updateUIForRole();
    showUserInfo();
  } catch (e) {
    console.error('Erro ao carregar usuário:', e);
    // SE ERRO, LIMPAR E REDIRECIONAR
    localStorage.clear();
    window.location.href = '/login';
  }
}

function updateUIForRole() {
  const role = AppState.userRole;
  const permissions = AppState.currentUser?.permissoes || {};
  
  // Mapeamento de botões para permissões
  const buttonPermissions = {
    'btn-dashboard': 'dashboard',
    'btn-designers': 'designers',
    'btn-lancamentos': 'lancamentos',
    'btn-relatorios': 'relatorios',
    'btn-metas': 'metas',
    'btn-acompanhamento': 'acompanhamento',
    'btn-cadastros': 'cadastros',
    'btn-planejamentos': 'planejamentos',
    'btn-aprovacoes': 'aprovacoes',
    'btn-painel-supervisor': 'painel-supervisor',
    'btn-pendencias': 'pendencias',
    'btn-fila-producao': 'fila-producao',
    'btn-ranking-designers': 'ranking-designers',
    'btn-relatorio-executivo': 'relatorio-executivo',
    'btn-meus-produtos': 'meus-produtos',
    'btn-gerenciar-usuarios': 'gerenciar-usuarios',
    'btn-configuracoes': 'configuracoes',
    // Mobile
    'btn-dashboard-mobile': 'dashboard',
    'btn-designers-mobile': 'designers',
    'btn-lancamentos-mobile': 'lancamentos',
    'btn-relatorios-mobile': 'relatorios',
    'btn-metas-mobile': 'metas',
    'btn-acompanhamento-mobile': 'acompanhamento',
    'btn-cadastros-mobile': 'cadastros',
    'btn-planejamentos-mobile': 'planejamentos',
    'btn-aprovacoes-mobile': 'aprovacoes',
    'btn-painel-supervisor-mobile': 'painel-supervisor',
    'btn-pendencias-mobile': 'pendencias',
    'btn-fila-producao-mobile': 'fila-producao',
    'btn-ranking-designers-mobile': 'ranking-designers',
    'btn-relatorio-executivo-mobile': 'relatorio-executivo',
    'btn-meus-produtos-mobile': 'meus-produtos',
    'btn-gerenciar-usuarios-mobile': 'gerenciar-usuarios',
    'btn-configuracoes-mobile': 'configuracoes'
  };
  
  // Seções da aba Metas que apenas ADMIN pode ver
  const metasAdminSections = [
    'metas-header-admin',    // Cabeçalho com botão Adicionar
    'metas-lista-admin'      // Lista de metas cadastradas
  ];
  
  if (role === 'admin') {
    // Admin vê TODAS as abas, EXCETO: Meus Produtos, Aprovações e Configurações
    const hiddenForAdmin = [
      'btn-meus-produtos', 
      'btn-meus-produtos-mobile',
      'btn-aprovacoes',
      'btn-aprovacoes-mobile',
      'btn-configuracoes',
      'btn-configuracoes-mobile'
    ];
    
    Object.keys(buttonPermissions).forEach(btnId => {
      const btn = document.getElementById(btnId);
      if (btn) {
        if (hiddenForAdmin.includes(btnId)) {
          btn.classList.add('hidden');
        } else {
          btn.classList.remove('hidden');
        }
      }
    });
    
    // Mostrar seções de gerenciamento de metas para admin
    metasAdminSections.forEach(id => {
      const section = document.getElementById(id);
      if (section) section.classList.remove('hidden');
    });
  } else if (role === 'supervisor') {
    // Supervisor vê: Dashboard, Designers, Relatórios, Metas, Acompanhamento, Painel Supervisor, Pendências, Fila, Ranking, Relatório
    // NÃO vê: Lançamentos, Cadastros, Planejamentos, Gerenciar Usuários, Configurações, Meus Produtos, Aprovações
    const visibleForSupervisor = [
      'btn-dashboard',
      'btn-dashboard-mobile',
      'btn-designers',
      'btn-designers-mobile',
      'btn-relatorios',
      'btn-relatorios-mobile',
      'btn-metas',
      'btn-metas-mobile',
      'btn-acompanhamento',
      'btn-acompanhamento-mobile',
      'btn-painel-supervisor',
      'btn-painel-supervisor-mobile',
      'btn-pendencias',
      'btn-pendencias-mobile',
      'btn-fila-producao',
      'btn-fila-producao-mobile',
      'btn-ranking-designers',
      'btn-ranking-designers-mobile',
      'btn-relatorio-executivo',
      'btn-relatorio-executivo-mobile'
    ];
    
    Object.keys(buttonPermissions).forEach(btnId => {
      const btn = document.getElementById(btnId);
      if (btn) {
        if (visibleForSupervisor.includes(btnId)) {
          btn.classList.remove('hidden');
        } else {
          btn.classList.add('hidden');
        }
      }
    });
    
    // Ocultar seções de gerenciamento de metas (supervisor apenas visualiza)
    metasAdminSections.forEach(id => {
      const section = document.getElementById(id);
      if (section) section.classList.add('hidden');
    });
  } else if (permissions && Object.keys(permissions).length > 0) {
    // User com permissões customizadas (como Alexandre)
    Object.keys(buttonPermissions).forEach(btnId => {
      const btn = document.getElementById(btnId);
      const permission = buttonPermissions[btnId];
      
      if (btn) {
        if (permissions[permission]) {
          btn.classList.remove('hidden');
        } else {
          btn.classList.add('hidden');
        }
      }
    });
    
    // Se tem permissão de metas, mostrar seções admin das metas
    if (permissions.metas) {
      metasAdminSections.forEach(id => {
        const section = document.getElementById(id);
        if (section) section.classList.remove('hidden');
      });
    }
  } else {
    // User padrão vê Dashboard, Designers, Relatórios, Metas, Acompanhamento, Fila, Ranking, Relatório Executivo e Meus Produtos
    const defaultUserButtons = [
      'btn-dashboard', 
      'btn-designers', 
      'btn-relatorios', 
      'btn-metas',           // NOVO - Metas visível para todos
      'btn-acompanhamento',  // NOVO - Acompanhamento visível para todos
      'btn-fila-producao',   // NOVO - Fila de Produção visível para todos
      'btn-ranking-designers', // NOVO - Ranking visível para todos
      'btn-relatorio-executivo', // NOVO - Relatório Executivo visível para todos
      'btn-meus-produtos', 
      'btn-dashboard-mobile', 
      'btn-designers-mobile', 
      'btn-relatorios-mobile', 
      'btn-metas-mobile',    // NOVO - Metas mobile visível para todos
      'btn-acompanhamento-mobile', // NOVO - Acompanhamento mobile visível para todos
      'btn-fila-producao-mobile', // NOVO - Fila mobile visível para todos
      'btn-ranking-designers-mobile', // NOVO - Ranking mobile visível para todos
      'btn-relatorio-executivo-mobile', // NOVO - Relatório Executivo mobile visível para todos
      'btn-meus-produtos-mobile'
    ];
    
    Object.keys(buttonPermissions).forEach(btnId => {
      const btn = document.getElementById(btnId);
      if (btn) {
        if (defaultUserButtons.includes(btnId)) {
          btn.classList.remove('hidden');
        } else {
          btn.classList.add('hidden');
        }
      }
    });
    
    // Usuários padrão (designers) veem apenas TOP 6, não editam metas
    metasAdminSections.forEach(id => {
      const section = document.getElementById(id);
      if (section) section.classList.add('hidden');
    });
  }
}

// Helper: Get user avatar HTML
function getUserAvatar(user, size = 'md') {
  const sizeClasses = {
    'sm': 'w-8 h-8 text-sm',
    'md': 'w-10 h-10 text-base',
    'lg': 'w-12 h-12 text-lg',
    'xl': 'w-16 h-16 text-xl',
    '2xl': 'w-24 h-24 text-2xl'
  };
  
  const sizeClass = sizeClasses[size] || sizeClasses['md'];
  
  if (user.foto_perfil) {
    return `<img src="${user.foto_perfil}" alt="${user.nome}" class="${sizeClass} rounded-full object-cover border-2 border-white shadow-sm">`;
  } else {
    // Generate initials
    const initials = user.nome 
      ? user.nome.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() 
      : 'U';
    return `<div class="${sizeClass} rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-bold shadow-sm border-2 border-white">${initials}</div>`;
  }
}

// Update user info in header and all UI elements
function updateUserInfo() {
  if (!AppState.currentUser) return;
  
  const userInfoDiv = document.getElementById('userInfo');
  const userInfoMobileDiv = document.getElementById('userInfo-mobile');
  
  // Detectar se é supervisor por permissões customizadas
  const isSupervisor = AppState.currentUser?.permissoes?.is_supervisor === true;
  
  const roleLabel = AppState.userRole === 'admin' ? 'Administrador' : 
                    AppState.userRole === 'supervisor' || isSupervisor ? 'Supervisor' : 'Usuário';
  const roleColor = AppState.userRole === 'admin' ? 'bg-purple-600' : 
                    AppState.userRole === 'supervisor' || isSupervisor ? 'bg-orange-600' : 'bg-teal-600';
  
  // Desktop userInfo
  if (userInfoDiv) {
    userInfoDiv.innerHTML = `
      <div class="flex items-center gap-3">
        ${getUserAvatar(AppState.currentUser, 'md')}
        <div class="flex flex-col items-start">
          <span class="text-white font-semibold text-sm">${AppState.currentUser.nome}</span>
          <span class="${roleColor} text-white text-xs px-2 py-0.5 rounded-full font-semibold">
            ${roleLabel}
          </span>
        </div>
      </div>
    `;
  }
  
  // Mobile userInfo
  if (userInfoMobileDiv) {
    userInfoMobileDiv.innerHTML = `
      <div class="flex items-center gap-3">
        ${getUserAvatar(AppState.currentUser, 'md')}
        <div class="flex-1">
          <p class="text-white font-semibold">${AppState.currentUser.nome}</p>
          <p class="${roleColor} text-white text-xs px-2 py-0.5 rounded-full font-semibold inline-block mt-1">
            ${roleLabel}
          </p>
        </div>
      </div>
    `;
  }
}

function showUserInfo() {
  updateUserInfo();
}

function handleLogout() {
  if (confirm('Deseja realmente sair do sistema?')) {
    // Limpar TODOS os dados do localStorage
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    localStorage.clear(); // Garantir limpeza total
    
    // Limpar estado da aplicação
    AppState.currentUser = null;
    AppState.userRole = 'user';
    AppState.designers = [];
    AppState.produtos = [];
    AppState.lancamentos = [];
    AppState.metas = [];
    
    // Notificação de sucesso
    showNotification('Logout realizado com sucesso! ✓', 'success');
    
    // Redirecionar IMEDIATAMENTE para login
    setTimeout(() => {
      window.location.href = '/login';
    }, 500);
  }
}

// ===========================
// NAVEGAÇÃO ENTRE TABS
// ===========================

function showTab(tabName) {
  // Esconder todas as tabs
  document.querySelectorAll('.tab-content').forEach(tab => {
    tab.classList.add('hidden');
  });
  
  // Mostrar tab selecionada
  const selectedTab = document.getElementById(`tab-${tabName}`);
  if (selectedTab) {
    selectedTab.classList.remove('hidden');
  }
  
  // Atualizar botões
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('bg-white/40');
  });
  
  // Parar auto-refresh de metas quando sair da aba
  if (tabName !== 'metas') {
    stopMetasAutoRefresh();
  }
  
  // Carregar dados da tab com tratamento de erros
  try {
    if (tabName === 'dashboard') {
      loadDashboard();
    } else if (tabName === 'designers') {
      loadDesignersList();
    } else if (tabName === 'lancamentos') {
      loadLancamentos();
    } else if (tabName === 'relatorios') {
      inicializarRelatorios();
    } else if (tabName === 'metas') {
      loadMetas();
      loadTop6Metas(); // Carregar TOP 6 também
      startMetasAutoRefresh(); // Iniciar atualização automática
    } else if (tabName === 'acompanhamento') {
      loadDesignersSemanas(); // Carregar acompanhamento de semanas
    } else if (tabName === 'cadastros') {
      loadCadastros();
    } else if (tabName === 'planilhas') {
      loadPlanilhasDesigners();
    } else if (tabName === 'planejamentos') {
      loadPlanejamentosSemanal();
    } else if (tabName === 'meus-produtos') {
      loadMeusProdutos();
    } else if (tabName === 'aprovacoes') {
      loadAprovacoes();
    } else if (tabName === 'gerenciar-usuarios') {
      loadAllUsers();
    } else if (tabName === 'configuracoes') {
      loadUserProfile();
    } else if (tabName === 'painel-supervisor') {
      loadSupervisorDashboard();
    } else if (tabName === 'pendencias') {
      loadPendencias();
    } else if (tabName === 'fila-producao') {
      populateFilaDesigners();
      loadFilaProducao();
      startAutoRefresh('fila-producao', loadFilaProducao);
    } else if (tabName === 'ranking-designers') {
      loadRanking();
      startAutoRefresh('ranking-designers', loadRanking);
    } else if (tabName === 'relatorio-executivo') {
      loadRelatorioExecutivo();
      startAutoRefresh('relatorio-executivo', loadRelatorioExecutivo);
    }
    
    // Parar auto-refresh de outros módulos ao trocar de aba
    const allModules = ['fila-producao', 'ranking-designers', 'relatorio-executivo'];
    allModules.forEach(module => {
      if (module !== tabName) {
        stopAutoRefresh(module);
      }
    });
    
  } catch (error) {
    console.error(`Erro ao carregar aba ${tabName}:`, error);
    setError(tabName, error);
  }
}

// ===========================
// INICIALIZAÇÃO
// ===========================

async function initializeApp() {
  try {
    setLoading('dashboard', true);
    
    // Inicializar usuário e controlar UI
    initializeUser();
    
    // Carregar períodos disponíveis
    try {
      const periodosRes = await axios.get(`${API_URL}/api/periodos`);
      AppState.periodos = periodosRes.data || [];
      populateFilterSelects();
    } catch (error) {
      console.error('Erro ao carregar períodos:', error);
      AppState.periodos = [];
    }
    
    // Carregar designers e produtos
    await loadDesignersAndProdutos();
    
    // Definir data padrão como hoje (horário de Brasília)
    const today = getBrasiliaDateTime('date');
    const inputData = document.getElementById('input-data');
    if (inputData) {
      inputData.value = today;
    }
    
    // Definir período padrão para filtro de usuário (semana atual)
    const filterPeriodoUser = document.getElementById('filter-periodo-user');
    if (filterPeriodoUser) {
      const currentWeek = getCurrentWeek();
      filterPeriodoUser.value = currentWeek;
    }
    
    // Definir período padrão para planejamento (semana atual)
    const planejamentoPeriodo = document.getElementById('planejamento-periodo');
    if (planejamentoPeriodo) {
      const currentWeek = getCurrentWeek();
      planejamentoPeriodo.value = currentWeek;
    }
    
    // Carregar dashboard por padrão
    await loadDashboard();
    
  } catch (error) {
    console.error('Erro na inicialização:', error);
    showNotification('Erro ao inicializar aplicação', 'error');
  } finally {
    setLoading('dashboard', false);
  }
}

async function loadDesignersAndProdutos() {
  try {
    const [designersRes, produtosRes] = await Promise.all([
      axios.get(`${API_URL}/api/designers`).catch(() => ({ data: [] })),
      axios.get(`${API_URL}/api/produtos`).catch(() => ({ data: [] }))
    ]);
    
    AppState.designers = designersRes.data || [];
    AppState.produtos = produtosRes.data || [];
    
    // Atualizar todos os selects
    updateDesignerSelects();
    updateProdutoSelects();
    
    return true;
  } catch (error) {
    console.error('Erro ao carregar designers e produtos:', error);
    AppState.designers = [];
    AppState.produtos = [];
    return false;
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
  if (!AppState.periodos || AppState.periodos.length === 0) {
    return;
  }
  
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
  const meses = {
    '01': 'Janeiro', '02': 'Fevereiro', '03': 'Março',
    '04': 'Abril', '05': 'Maio', '06': 'Junho',
    '07': 'Julho', '08': 'Agosto', '09': 'Setembro',
    '10': 'Outubro', '11': 'Novembro', '12': 'Dezembro'
  };
  return meses[mes] || mes;
}

// ===========================
// DASHBOARD
// ===========================

function applyDashboardFilters() {
  const filterMes = document.getElementById('filter-mes');
  const filterAno = document.getElementById('filter-ano');
  
  if (filterMes) AppState.currentFilters.mes = filterMes.value;
  if (filterAno) AppState.currentFilters.ano = filterAno.value;
  
  loadDashboard();
}

function clearDashboardFilters() {
  const filterMes = document.getElementById('filter-mes');
  const filterAno = document.getElementById('filter-ano');
  
  if (filterMes) filterMes.value = '';
  if (filterAno) filterAno.value = '';
  
  AppState.currentFilters.mes = '';
  AppState.currentFilters.ano = '';
  loadDashboard();
}

async function loadDashboard() {
  setLoading('dashboard', true);
  setError('dashboard', null);
  
  try {
    const params = new URLSearchParams();
    if (AppState.currentFilters.mes) params.append('mes', AppState.currentFilters.mes);
    if (AppState.currentFilters.ano) params.append('ano', AppState.currentFilters.ano);
    
    // Carregar estatísticas gerais
    const statsRes = await axios.get(`${API_URL}/api/relatorios/estatisticas?${params}`);
    const stats = statsRes.data || {};
    
    const statDesigners = document.getElementById('stat-designers');
    const statAprovadas = document.getElementById('stat-aprovadas');
    const statCriadas = document.getElementById('stat-criadas');
    const statTaxa = document.getElementById('stat-taxa');
    const statReprovadas = document.getElementById('stat-reprovadas');
    const statTaxaReprovacao = document.getElementById('stat-taxa-reprovacao');
    
    if (statDesigners) statDesigners.textContent = stats.total_designers || 0;
    if (statAprovadas) statAprovadas.textContent = stats.total_aprovadas || 0;
    if (statCriadas) statCriadas.textContent = stats.total_criadas || 0;
    if (statTaxa) statTaxa.textContent = `${stats.taxa_aprovacao_geral || 0}%`;
    if (statReprovadas) statReprovadas.textContent = stats.total_reprovadas || 0;
    if (statTaxaReprovacao) statTaxaReprovacao.textContent = `${stats.taxa_reprovacao_geral || 0}%`;
    
    // Carregar dados para gráfico de designers
    const designersRes = await axios.get(`${API_URL}/api/relatorios/por-designer?${params}`);
    renderChartDesigners(designersRes.data || []);
    
    // Carregar dados para timeline
    const timelineRes = await axios.get(`${API_URL}/api/relatorios/timeline?limit=12&${params}`);
    renderChartTimeline(timelineRes.data || []);
    
    // Carregar top 6 produtos mais recentes
    const produtosRes = await axios.get(`${API_URL}/api/relatorios/por-produto?limit=6&${params}`);
    renderTopProdutos(produtosRes.data || []);
    
    setError('dashboard', null);
    
  } catch (error) {
    console.error('Erro ao carregar dashboard:', error);
    setError('dashboard', error);
    
    // Renderizar UI vazia em caso de erro
    renderChartDesigners([]);
    renderChartTimeline([]);
    renderTopProdutos([]);
  } finally {
    setLoading('dashboard', false);
  }
}

function renderChartDesigners(data) {
  const ctx = document.getElementById('chartDesigners');
  if (!ctx) return;
  
  if (AppState.chartDesigners) {
    AppState.chartDesigners.destroy();
  }
  
  if (!data || data.length === 0) {
    ctx.parentElement.innerHTML = '<p class="text-gray-500 text-center py-8">Nenhum dado disponível</p>';
    return;
  }
  
  AppState.chartDesigners = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: data.map(d => d.designer),
      datasets: [
        {
          label: 'Aprovadas',
          data: data.map(d => d.total_aprovadas || 0),
          backgroundColor: 'rgba(34, 197, 94, 0.7)',
          borderColor: 'rgba(34, 197, 94, 1)',
          borderWidth: 1
        },
        {
          label: 'Reprovadas',
          data: data.map(d => d.total_reprovadas || 0),
          backgroundColor: 'rgba(239, 68, 68, 0.7)',
          borderColor: 'rgba(239, 68, 68, 1)',
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
  
  if (AppState.chartTimeline) {
    AppState.chartTimeline.destroy();
  }
  
  if (!data || data.length === 0) {
    ctx.parentElement.innerHTML = '<p class="text-gray-500 text-center py-8">Nenhum dado disponível</p>';
    return;
  }
  
  // Reverter ordem para mostrar semanas em ordem crescente
  const sortedData = [...data].reverse();
  
  AppState.chartTimeline = new Chart(ctx, {
    type: 'line',
    data: {
      labels: sortedData.map(d => `Sem ${d.semana}`),
      datasets: [
        {
          label: 'Aprovadas',
          data: sortedData.map(d => d.total_aprovadas || 0),
          borderColor: 'rgba(34, 197, 94, 1)',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          tension: 0.3,
          fill: true
        },
        {
          label: 'Reprovadas',
          data: sortedData.map(d => d.total_reprovadas || 0),
          borderColor: 'rgba(239, 68, 68, 1)',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          tension: 0.3,
          fill: true
        },
        {
          label: 'Criadas',
          data: sortedData.map(d => d.total_criadas || 0),
          borderColor: 'rgba(234, 179, 8, 1)',
          backgroundColor: 'rgba(234, 179, 8, 0.1)',
          tension: 0.3,
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

function renderTopProdutos(produtos) {
  const container = document.getElementById('topProdutos');
  if (!container) return;
  
  if (!produtos || produtos.length === 0) {
    container.innerHTML = '<p class="text-gray-500 text-center col-span-3 py-8">Nenhum produto encontrado</p>';
    return;
  }
  
  container.innerHTML = produtos.map((p, index) => {
    const icons = ['fa-trophy text-yellow-500', 'fa-medal text-gray-400', 'fa-medal text-orange-600', 'fa-star text-blue-500', 'fa-star text-purple-500', 'fa-star text-pink-500'];
    const icon = icons[index] || 'fa-star text-gray-500';
    const progressColor = (p.progresso_meta || 0) >= 100 ? 'bg-green-500' : (p.progresso_meta || 0) >= 70 ? 'bg-teal-500' : 'bg-orange-500';
    
    return `
      <div class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
        <div class="flex items-center justify-between mb-3">
          <h4 class="font-semibold text-gray-800 flex items-center text-sm">
            <i class="fas ${icon} mr-2"></i>
            ${p.produto}
          </h4>
          <span class="text-xl font-bold text-green-600">${p.total_aprovadas || 0}</span>
        </div>
        <div class="space-y-2 text-xs">
          ${p.meta_aprovacao ? `
          <div class="flex justify-between">
            <span class="text-gray-600">Meta:</span>
            <span class="font-medium">${p.meta_aprovacao}</span>
          </div>
          ` : ''}
          <div class="flex justify-between">
            <span class="text-gray-600">Taxa Aprovação:</span>
            <span class="font-medium">${p.taxa_aprovacao || 0}%</span>
          </div>
          ${p.progresso_meta ? `
            <div>
              <div class="flex justify-between text-xs mb-1">
                <span>Progresso</span>
                <span class="font-medium">${Math.round(p.progresso_meta)}%</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div class="${progressColor} h-2 rounded-full transition-all" style="width: ${Math.min(p.progresso_meta, 100)}%"></div>
              </div>
            </div>
          ` : ''}
          ${p.ultima_atualizacao ? `
            <div class="text-gray-500 text-xs mt-2">
              Atualizado: ${new Date(p.ultima_atualizacao).toLocaleDateString('pt-BR')}
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }).join('');
}

// ===========================
// LANÇAMENTOS
// ===========================

async function loadLancamentos(page = 0) {
  setLoading('lancamentos', true);
  setError('lancamentos', null);
  
  try {
    AppState.currentPage = page;
    
    // Obter valores dos filtros
    const semanaFilterEl = document.getElementById('lancamentos-semana-filter');
    const designerFilterEl = document.getElementById('lancamentos-designer-filter');
    const produtoFilterEl = document.getElementById('lancamentos-produto-filter');
    
    const semanaFilter = semanaFilterEl ? semanaFilterEl.value : '';
    const designerFilter = designerFilterEl ? designerFilterEl.value : '';
    const produtoFilter = produtoFilterEl ? produtoFilterEl.value : '';
    
    const params = new URLSearchParams();
    params.append('limit', AppState.itemsPerPage);
    params.append('offset', page * AppState.itemsPerPage);
    if (semanaFilter) params.append('semana', semanaFilter);
    if (designerFilter) params.append('designer_id', designerFilter);
    if (produtoFilter) params.append('produto_id', produtoFilter);
    
    const lancamentosRes = await axios.get(`${API_URL}/api/lancamentos?${params}`);
    const { data, total } = lancamentosRes.data || { data: [], total: 0 };
    
    AppState.lancamentos = data || [];
    AppState.totalItems = total || 0;
    
    renderLancamentos(AppState.lancamentos);
    renderPagination();
    
    // Atualizar filtro de semanas
    await updateSemanasFilter();
    
    // Popular filtros se ainda não foram populados
    await populateLancamentosFilters();
    
    setError('lancamentos', null);
    
  } catch (error) {
    console.error('Erro ao carregar lançamentos:', error);
    setError('lancamentos', error);
    renderLancamentos([]);
  } finally {
    setLoading('lancamentos', false);
  }
}

async function updateSemanasFilter() {
  try {
    const result = await axios.get(`${API_URL}/api/lancamentos?limit=1000`);
    const data = result.data?.data || [];
    const semanas = [...new Set(data.map(l => l.semana))].sort((a, b) => b - a);
    
    const select = document.getElementById('lancamentos-semana-filter');
    if (!select) return;
    
    const currentValue = select.value;
    
    select.innerHTML = '<option value="">Todas Semanas</option>' +
      semanas.map(s => `<option value="${s}">Semana ${s}</option>`).join('');
    
    if (currentValue) select.value = currentValue;
  } catch (error) {
    console.error('Erro ao atualizar filtro de semanas:', error);
  }
}

function renderLancamentos(lancamentos) {
  const container = document.getElementById('listaLancamentos');
  if (!container) return;
  
  if (!lancamentos || lancamentos.length === 0) {
    container.innerHTML = '<p class="text-gray-500 text-center py-8">Nenhum lançamento encontrado</p>';
    return;
  }
  
  container.innerHTML = `
    <table class="min-w-full divide-y divide-gray-200">
      <thead class="bg-gray-50">
        <tr>
          <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Semana</th>
          <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
          <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Designer</th>
          <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produto</th>
          <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Criadas</th>
          <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reprovadas</th>
          <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aprovadas</th>
          <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Taxa</th>
          <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
        </tr>
      </thead>
      <tbody class="bg-white divide-y divide-gray-200">
        ${lancamentos.map(l => {
          const reprovada = l.quantidade_reprovada || 0;
          const taxa = l.quantidade_criada > 0 ? Math.round((l.quantidade_aprovada / l.quantidade_criada) * 100) : 0;
          const taxaColor = taxa >= 75 ? 'text-green-600' : taxa >= 50 ? 'text-yellow-600' : 'text-red-600';
          
          return `
            <tr class="hover:bg-gray-50">
              <td class="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">${l.semana}</td>
              <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-500">${new Date(l.data).toLocaleDateString('pt-BR')}</td>
              <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900">${l.designer_nome}</td>
              <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900">${l.produto_nome}</td>
              <td class="px-4 py-3 whitespace-nowrap text-sm font-semibold text-blue-600">${l.quantidade_criada}</td>
              <td class="px-4 py-3 whitespace-nowrap text-sm font-semibold text-red-600">${reprovada}</td>
              <td class="px-4 py-3 whitespace-nowrap text-sm font-semibold text-green-600">${l.quantidade_aprovada}</td>
              <td class="px-4 py-3 whitespace-nowrap text-sm font-medium ${taxaColor}">${taxa}%</td>
              <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                <button onclick="editLancamento(${l.id})" class="text-teal-600 hover:text-teal-800 mr-3" title="Editar">
                  <i class="fas fa-edit"></i>
                </button>
                <button onclick="deleteLancamento(${l.id})" class="text-teal-600 hover:text-teal-800" title="Excluir">
                  <i class="fas fa-trash"></i>
                </button>
              </td>
            </tr>
          `;
        }).join('')}
      </tbody>
    </table>
  `;
}

function renderPagination() {
  const totalPages = Math.ceil(AppState.totalItems / AppState.itemsPerPage);
  const container = document.getElementById('paginationLancamentos');
  if (!container) return;
  
  if (totalPages <= 1) {
    container.innerHTML = '';
    return;
  }
  
  let pages = [];
  
  // Botão anterior
  pages.push(`
    <button onclick="loadLancamentos(${AppState.currentPage - 1})" 
            ${AppState.currentPage === 0 ? 'disabled' : ''} 
            class="px-4 py-2 border rounded-lg ${AppState.currentPage === 0 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white hover:bg-gray-50'}">
      <i class="fas fa-chevron-left"></i>
    </button>
  `);
  
  // Páginas
  for (let i = 0; i < totalPages; i++) {
    if (i === 0 || i === totalPages - 1 || (i >= AppState.currentPage - 2 && i <= AppState.currentPage + 2)) {
      pages.push(`
        <button onclick="loadLancamentos(${i})" 
                class="px-4 py-2 border rounded-lg ${i === AppState.currentPage ? 'bg-teal-600 text-white' : 'bg-white hover:bg-gray-50'}">
          ${i + 1}
        </button>
      `);
    } else if (i === AppState.currentPage - 3 || i === AppState.currentPage + 3) {
      pages.push('<span class="px-2">...</span>');
    }
  }
  
  // Botão próximo
  pages.push(`
    <button onclick="loadLancamentos(${AppState.currentPage + 1})" 
            ${AppState.currentPage >= totalPages - 1 ? 'disabled' : ''} 
            class="px-4 py-2 border rounded-lg ${AppState.currentPage >= totalPages - 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white hover:bg-gray-50'}">
      <i class="fas fa-chevron-right"></i>
    </button>
  `);
  
  container.innerHTML = pages.join('');
}

async function editLancamento(id) {
  try {
    const result = await axios.get(`${API_URL}/api/lancamentos/${id}`);
    const lancamento = result.data;
    
    // Preencher modal
    document.getElementById('edit-id').value = lancamento.id;
    document.getElementById('edit-designer').value = lancamento.designer_id;
    document.getElementById('edit-produto').value = lancamento.produto_id;
    document.getElementById('edit-semana').value = lancamento.semana;
    document.getElementById('edit-data').value = lancamento.data.split('T')[0];
    document.getElementById('edit-criada').value = lancamento.quantidade_criada;
    document.getElementById('edit-reprovada').value = lancamento.quantidade_reprovada || 0;
    document.getElementById('edit-aprovada').value = lancamento.quantidade_aprovada;
    document.getElementById('edit-obs').value = lancamento.observacoes || '';
    
    // Marcar como edição manual - valores NÃO serão recalculados automaticamente
    window.edicaoManualAtiva = true;
    
    // Mostrar modal
    document.getElementById('modalEditLancamento').classList.remove('hidden');
  } catch (error) {
    console.error('Erro ao carregar lançamento:', error);
    showNotification('Erro ao carregar lançamento', 'error');
  }
}

function closeEditModal() {
  const modal = document.getElementById('modalEditLancamento');
  if (modal) {
    modal.classList.add('hidden');
  }
  // Limpar flag de edição manual
  window.edicaoManualAtiva = false;
}

async function deleteLancamento(id) {
  if (!confirm('Deseja realmente excluir este lançamento?')) {
    return;
  }
  
  try {
    await axios.delete(`${API_URL}/api/lancamentos/${id}`);
    showNotification('Lançamento excluído com sucesso!', 'success');
    loadLancamentos(AppState.currentPage);
  } catch (error) {
    console.error('Erro ao excluir lançamento:', error);
    showNotification('Erro ao excluir lançamento', 'error');
  }
}

// ===========================
// RELATÓRIOS
// ===========================

async function loadRelatorios() {
  setLoading('relatorios', true);
  setError('relatorios', null);
  
  try {
    const mesEl = document.getElementById('relatorio-mes');
    const anoEl = document.getElementById('relatorio-ano');
    
    const mes = mesEl ? mesEl.value : '';
    const ano = anoEl ? anoEl.value : '';
    
    const params = new URLSearchParams();
    if (mes) params.append('mes', mes);
    if (ano) params.append('ano', ano);
    
    // Verificar se elementos de relatório completo existem
    const hasCompleteReport = document.getElementById('metric-criadas') !== null;
    
    if (hasCompleteReport) {
      // Usar endpoint consolidado para relatório completo
      const response = await axios.get(`${API_URL}/api/relatorios/completo?${params}`);
      if (response.data.success) {
        renderRelatorioCompleto(response.data);
      }
    } else {
      // Relatório antigo (por Designer e Produto)
      const designersRes = await axios.get(`${API_URL}/api/relatorios/por-designer?${params}`);
      renderRelatorioDesigners(designersRes.data || []);
      
      const produtosRes = await axios.get(`${API_URL}/api/relatorios/por-produto?${params}`);
      renderRelatorioProdutos(produtosRes.data || []);
    }
    
    setError('relatorios', null);
    
  } catch (error) {
    console.error('Erro ao carregar relatórios:', error);
    setError('relatorios', error);
    showNotification('Erro ao carregar relatórios', 'error');
  } finally {
    setLoading('relatorios', false);
  }
}

// Variáveis globais para os gráficos
let chartTimeline, chartStatus, chartDesigners, chartProdutos;

function renderRelatorioCompleto(data) {
  if (!data || !data.success) return;
  
  // 1. ATUALIZAR MÉTRICAS GERAIS
  const metrics = data.metricas_gerais || {};
  const metricCriadas = document.getElementById('metric-criadas');
  const metricAprovadas = document.getElementById('metric-aprovadas');
  const metricReprovadas = document.getElementById('metric-reprovadas');
  const metricTaxa = document.getElementById('metric-taxa');
  
  if (metricCriadas) metricCriadas.textContent = metrics.total_criadas || 0;
  if (metricAprovadas) metricAprovadas.textContent = metrics.total_aprovadas || 0;
  if (metricReprovadas) metricReprovadas.textContent = metrics.total_reprovadas || 0;
  if (metricTaxa) metricTaxa.textContent = `${Math.round(metrics.taxa_aprovacao_geral || 0)}%`;
  
  // 2. GRÁFICOS E TABELAS
  if (window.Chart) {
    renderChartTimeline(data.timeline_semanal || []);
    renderChartStatus(data.distribuicao_status || []);
    renderChartDesigners(data.performance_designers || []);
    renderChartProdutos(data.performance_produtos || []);
  }
  
  renderTableDesigners(data.performance_designers || []);
  renderTableProdutos(data.performance_produtos || []);
  renderTopTaxas(data.top_taxas_aprovacao || []);
}

function renderChartTimeline(data) {
  const ctx = document.getElementById('chartTimeline');
  if (!ctx || !window.Chart) return;
  
  if (chartTimeline) chartTimeline.destroy();
  
  const labels = data.map(d => `Sem ${d.semana}`).reverse();
  const criadas = data.map(d => d.total_criadas || 0).reverse();
  const aprovadas = data.map(d => d.total_aprovadas || 0).reverse();
  const reprovadas = data.map(d => d.total_reprovadas || 0).reverse();
  
  chartTimeline = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        { label: 'Criadas', data: criadas, borderColor: 'rgb(59, 130, 246)', backgroundColor: 'rgba(59, 130, 246, 0.1)', tension: 0.4, fill: true },
        { label: 'Aprovadas', data: aprovadas, borderColor: 'rgb(34, 197, 94)', backgroundColor: 'rgba(34, 197, 94, 0.1)', tension: 0.4, fill: true },
        { label: 'Reprovadas', data: reprovadas, borderColor: 'rgb(239, 68, 68)', backgroundColor: 'rgba(239, 68, 68, 0.1)', tension: 0.4, fill: true }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: true, position: 'top' } },
      scales: { y: { beginAtZero: true, ticks: { precision: 0 } } }
    }
  });
}

function renderChartStatus(data) {
  const ctx = document.getElementById('chartStatus');
  if (!ctx || !window.Chart) return;
  
  if (chartStatus) chartStatus.destroy();
  
  const labels = data.map(d => d.status);
  const values = data.map(d => d.total);
  const colors = labels.map(label => label === 'Aprovado' ? 'rgb(34, 197, 94)' : label === 'Reprovado' ? 'rgb(239, 68, 68)' : 'rgb(251, 191, 36)');
  
  chartStatus = new Chart(ctx, {
    type: 'doughnut',
    data: { labels: labels, datasets: [{ data: values, backgroundColor: colors, borderWidth: 2, borderColor: '#fff' }] },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: true, position: 'bottom' } }
    }
  });
}

function renderChartDesigners(data) {
  const ctx = document.getElementById('chartDesigners');
  if (!ctx || !window.Chart) return;
  
  if (chartDesigners) chartDesigners.destroy();
  
  const labels = data.map(d => d.designer);
  const criadas = data.map(d => d.total_criadas || 0);
  const aprovadas = data.map(d => d.total_aprovadas || 0);
  const reprovadas = data.map(d => d.total_reprovadas || 0);
  
  chartDesigners = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        { label: 'Criadas', data: criadas, backgroundColor: 'rgb(59, 130, 246)', borderRadius: 4 },
        { label: 'Aprovadas', data: aprovadas, backgroundColor: 'rgb(34, 197, 94)', borderRadius: 4 },
        { label: 'Reprovadas', data: reprovadas, backgroundColor: 'rgb(239, 68, 68)', borderRadius: 4 }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: true, position: 'top' } },
      scales: { y: { beginAtZero: true, ticks: { precision: 0 } } }
    }
  });
}

function renderChartProdutos(data) {
  const ctx = document.getElementById('chartProdutos');
  if (!ctx || !window.Chart) return;
  
  if (chartProdutos) chartProdutos.destroy();
  
  const labels = data.map(d => d.produto);
  const aprovadas = data.map(d => d.total_aprovadas || 0);
  const metas = data.map(d => d.meta_aprovacao || null);
  
  const datasets = [{ label: 'Aprovadas', data: aprovadas, backgroundColor: 'rgb(34, 197, 94)', borderRadius: 4 }];
  
  if (metas.some(m => m !== null)) {
    datasets.push({
      label: 'Meta',
      data: metas,
      type: 'line',
      borderColor: 'rgb(147, 51, 234)',
      borderWidth: 2,
      borderDash: [5, 5],
      fill: false,
      pointRadius: 4,
      pointBackgroundColor: 'rgb(147, 51, 234)'
    });
  }
  
  chartProdutos = new Chart(ctx, {
    type: 'bar',
    data: { labels: labels, datasets: datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: true, position: 'top' } },
      scales: { y: { beginAtZero: true, ticks: { precision: 0 } } }
    }
  });
}

function renderTableDesigners(data) {
  const container = document.getElementById('tableDesigners');
  if (!container || !data || data.length === 0) return;
  
  container.innerHTML = `
    <table class="w-full text-sm">
      <thead class="bg-gray-100 border-b"><tr>
        <th class="text-left py-3 px-4">#</th><th class="text-left py-3 px-4">Designer</th>
        <th class="text-center py-3 px-4">Criadas</th><th class="text-center py-3 px-4">Aprovadas</th>
        <th class="text-center py-3 px-4">Reprovadas</th><th class="text-center py-3 px-4">Taxa</th>
      </tr></thead>
      <tbody>${data.map((d, i) => {
        const taxa = d.taxa_aprovacao || 0;
        const color = taxa >= 75 ? 'text-green-600' : taxa >= 50 ? 'text-yellow-600' : 'text-red-600';
        const icon = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '';
        return `<tr class="border-b hover:bg-gray-50">
          <td class="py-3 px-4">${icon} ${i+1}</td><td class="py-3 px-4 font-medium">${d.designer}</td>
          <td class="py-3 px-4 text-center text-blue-600 font-semibold">${d.total_criadas||0}</td>
          <td class="py-3 px-4 text-center text-green-600 font-semibold">${d.total_aprovadas||0}</td>
          <td class="py-3 px-4 text-center text-red-600 font-semibold">${d.total_reprovadas||0}</td>
          <td class="py-3 px-4 text-center ${color} font-bold">${Math.round(taxa)}%</td>
        </tr>`;
      }).join('')}</tbody>
    </table>
  `;
}

function renderTableProdutos(data) {
  const container = document.getElementById('tableProdutos');
  if (!container || !data || data.length === 0) return;
  
  container.innerHTML = `
    <table class="w-full text-sm">
      <thead class="bg-gray-100 border-b"><tr>
        <th class="text-left py-3 px-4">#</th><th class="text-left py-3 px-4">Produto</th>
        <th class="text-center py-3 px-4">Criadas</th><th class="text-center py-3 px-4">Aprovadas</th>
        <th class="text-center py-3 px-4">Meta</th><th class="text-center py-3 px-4">Progresso</th>
        <th class="text-center py-3 px-4">Taxa</th>
      </tr></thead>
      <tbody>${data.map((p, i) => {
        const taxa = p.taxa_aprovacao || 0;
        const prog = p.progresso_meta || 0;
        const taxaColor = taxa >= 75 ? 'text-green-600' : taxa >= 50 ? 'text-yellow-600' : 'text-red-600';
        const progColor = prog >= 100 ? 'text-green-600' : prog >= 70 ? 'text-teal-600' : 'text-orange-600';
        const icon = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '';
        return `<tr class="border-b hover:bg-gray-50">
          <td class="py-3 px-4">${icon} ${i+1}</td><td class="py-3 px-4 font-medium">${p.produto}</td>
          <td class="py-3 px-4 text-center text-blue-600 font-semibold">${p.total_criadas||0}</td>
          <td class="py-3 px-4 text-center text-green-600 font-semibold">${p.total_aprovadas||0}</td>
          <td class="py-3 px-4 text-center text-purple-600 font-semibold">${p.meta_aprovacao||'-'}</td>
          <td class="py-3 px-4 text-center ${progColor} font-bold">${p.meta_aprovacao?Math.round(prog)+'%':'-'}</td>
          <td class="py-3 px-4 text-center ${taxaColor} font-bold">${Math.round(taxa)}%</td>
        </tr>`;
      }).join('')}</tbody>
    </table>
  `;
}

function renderTopTaxas(data) {
  const container = document.getElementById('topTaxas');
  if (!container || !data || data.length === 0) return;
  
  const medals = ['🥇', '🥈', '🥉', '🏅', '🏅'];
  const colors = ['from-yellow-400 to-yellow-500', 'from-gray-300 to-gray-400', 'from-orange-400 to-orange-500', 'from-blue-400 to-blue-500', 'from-purple-400 to-purple-500'];
  
  container.innerHTML = data.map((d, i) => `
    <div class="bg-gradient-to-br ${colors[i]} rounded-lg shadow-md p-4 text-white text-center transform hover:scale-105 transition">
      <div class="text-4xl mb-2">${medals[i]}</div>
      <h4 class="font-bold text-sm mb-1 truncate">${d.designer}</h4>
      <div class="text-2xl font-bold mb-1">${Math.round(d.taxa_aprovacao||0)}%</div>
      <p class="text-xs opacity-90">${d.total_criadas} criadas</p>
    </div>
  `).join('');
}

function renderRelatorioDesigners(data) {
  const container = document.getElementById('relatorioDesigners');
  if (!container) return;
  
  if (!data || data.length === 0) {
    container.innerHTML = '<p class="text-gray-500 text-center py-8">Nenhum dado encontrado</p>';
    return;
  }
  
  container.innerHTML = data.map(d => {
    const taxa = d.taxa_aprovacao || 0;
    const taxaColor = taxa >= 75 ? 'bg-green-500' : taxa >= 50 ? 'bg-yellow-500' : 'bg-teal-500';
    
    return `
      <div class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
        <h4 class="font-semibold text-gray-800 mb-3 flex items-center">
          <i class="fas fa-user-circle text-teal-600 mr-2"></i>
          ${d.designer}
        </h4>
        <div class="grid grid-cols-2 gap-3 text-sm mb-3">
          <div>
            <p class="text-gray-500">Criadas</p>
            <p class="text-xl font-bold text-gray-800">${d.total_criadas || 0}</p>
          </div>
          <div>
            <p class="text-gray-500">Aprovadas</p>
            <p class="text-xl font-bold text-green-600">${d.total_aprovadas || 0}</p>
          </div>
        </div>
        <div>
          <div class="flex justify-between text-xs mb-1">
            <span>Taxa de Aprovação</span>
            <span class="font-medium">${Math.round(taxa)}%</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div class="${taxaColor} h-2 rounded-full transition-all" style="width: ${Math.min(taxa, 100)}%"></div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function renderRelatorioProdutos(data) {
  const container = document.getElementById('relatorioProdutos');
  if (!container) return;
  
  if (!data || data.length === 0) {
    container.innerHTML = '<p class="text-gray-500 text-center py-8">Nenhum dado encontrado</p>';
    return;
  }
  
  container.innerHTML = data.map(p => {
    const taxa = p.taxa_aprovacao || 0;
    const progresso = p.progresso_meta || 0;
    const taxaColor = taxa >= 75 ? 'bg-green-500' : taxa >= 50 ? 'bg-yellow-500' : 'bg-teal-500';
    const progressoColor = progresso >= 100 ? 'bg-green-500' : progresso >= 70 ? 'bg-teal-500' : 'bg-orange-500';
    
    return `
      <div class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
        <h4 class="font-semibold text-gray-800 mb-3 flex items-center">
          <i class="fas fa-box text-green-600 mr-2"></i>
          ${p.produto}
        </h4>
        <div class="grid ${p.meta_aprovacao ? 'grid-cols-3' : 'grid-cols-2'} gap-2 text-sm mb-3">
          <div>
            <p class="text-gray-500 text-xs">Criadas</p>
            <p class="text-lg font-bold text-gray-800">${p.total_criadas || 0}</p>
          </div>
          <div>
            <p class="text-gray-500 text-xs">Aprovadas</p>
            <p class="text-lg font-bold text-green-600">${p.total_aprovadas || 0}</p>
          </div>
          ${p.meta_aprovacao ? `
          <div>
            <p class="text-gray-500 text-xs">Meta</p>
            <p class="text-lg font-bold text-purple-600">${p.meta_aprovacao}</p>
          </div>
          ` : ''}
        </div>
        <div class="space-y-2">
          <div>
            <div class="flex justify-between text-xs mb-1">
              <span>Taxa de Aprovação</span>
              <span class="font-medium">${Math.round(taxa)}%</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div class="${taxaColor} h-2 rounded-full transition-all" style="width: ${Math.min(taxa, 100)}%"></div>
            </div>
          </div>
          ${p.meta_aprovacao ? `
            <div>
              <div class="flex justify-between text-xs mb-1">
                <span>Progresso da Meta</span>
                <span class="font-medium">${Math.round(progresso)}%</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div class="${progressoColor} h-2 rounded-full transition-all" style="width: ${Math.min(progresso, 100)}%"></div>
              </div>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }).join('');
}

// Gerar PDF
async function generatePDF() {
  try {
    showNotification('Gerando PDF...', 'info');
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Título
    doc.setFontSize(20);
    doc.text('Relatório de Produção', 20, 20);
    
    // Data
    doc.setFontSize(12);
    const mesEl = document.getElementById('relatorio-mes');
    const anoEl = document.getElementById('relatorio-ano');
    const mes = mesEl ? mesEl.value : '';
    const ano = anoEl ? anoEl.value : '';
    const periodo = mes && ano ? `${getNomeMes(mes)}/${ano}` : 'Todos os períodos';
    doc.text(`Período: ${periodo}`, 20, 30);
    doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 20, 37);
    
    // Capturar conteúdo do relatório
    const content = document.getElementById('relatorio-content');
    
    await html2canvas(content, {
      scale: 2,
      logging: false,
      useCORS: true
    }).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 170;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      doc.addImage(imgData, 'PNG', 20, 45, imgWidth, imgHeight);
    });
    
    doc.save(`relatorio-producao-${Date.now()}.pdf`);
    showNotification('PDF gerado com sucesso!', 'success');
    
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    showNotification('Erro ao gerar PDF', 'error');
  }
}

// Expor funções globalmente
window.loadRelatorioCompleto = loadRelatorios;
window.exportarRelatorioPDF = generatePDF;

// ===========================
// METAS - SISTEMA COMPLETO COM VALIDAÇÃO
// ===========================

async function loadMetas() {
  setLoading('metas', true);
  setError('metas', null);
  
  try {
    // CORREÇÃO: Garantir que designers e produtos estejam carregados
    // antes de renderizar o formulário de metas
    await loadDesignersAndProdutos();
    
    const metasRes = await axios.get(`${API_URL}/api/metas`);
    AppState.metas = metasRes.data || [];
    renderMetas(AppState.metas);
    
    // Esconder formulário ao carregar
    hideMetaForm();
    
    setError('metas', null);
  } catch (error) {
    console.error('Erro ao carregar metas:', error);
    setError('metas', error);
    AppState.metas = [];
    renderMetas([]);
  } finally {
    setLoading('metas', false);
  }
}

function showMetaForm() {
  const formContainer = document.getElementById('meta-form-container');
  if (formContainer) {
    formContainer.classList.remove('hidden');
    formContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function hideMetaForm() {
  const formContainer = document.getElementById('meta-form-container');
  if (formContainer) {
    formContainer.classList.add('hidden');
  }
  
  // Limpar formulário
  const form = document.getElementById('formMeta');
  if (form) form.reset();
  
  const metaIdInput = document.getElementById('meta-id');
  if (metaIdInput) metaIdInput.value = '';
  
  // Restaurar títulos e botões
  const formTitle = document.getElementById('meta-form-title');
  const btnText = document.getElementById('meta-btn-text');
  
  if (formTitle) formTitle.textContent = 'Nova Meta';
  if (btnText) btnText.textContent = 'Salvar Meta';
  
  AppState.editingMeta = null;
}

function renderMetas(metas) {
  const container = document.getElementById('listaMetas');
  if (!container) return;
  
  if (!metas || metas.length === 0) {
    container.innerHTML = '<p class="text-gray-500 text-center py-8">Nenhuma meta cadastrada</p>';
    return;
  }
  
  container.innerHTML = `
    <table class="min-w-full divide-y divide-gray-200">
      <thead class="bg-gray-50">
        <tr>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produto</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Meta de Aprovação</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Período (Semanas)</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
        </tr>
      </thead>
      <tbody class="bg-white divide-y divide-gray-200">
        ${metas.map(m => {
          let statusBadge = '';
          let acoes = '';
          
          if (m.status === 'concluida') {
            statusBadge = '<span class="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800"><i class="fas fa-check-circle mr-1"></i>Concluída</span>';
            acoes = `
              <button onclick="editMeta(${m.id})" class="text-teal-600 hover:text-teal-800 mr-3" title="Editar">
                <i class="fas fa-edit"></i>
              </button>
              <button onclick="deleteMeta(${m.id})" class="text-red-600 hover:text-red-800" title="Excluir">
                <i class="fas fa-trash"></i>
              </button>
            `;
          } else if (m.status === 'aprovada') {
            statusBadge = '<span class="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-teal-100 text-teal-800"><i class="fas fa-clock mr-1"></i>Em Andamento</span>';
            acoes = `
              <button onclick="editMeta(${m.id})" class="text-teal-600 hover:text-teal-800 mr-3" title="Editar">
                <i class="fas fa-edit"></i>
              </button>
              <button onclick="deleteMeta(${m.id})" class="text-red-600 hover:text-red-800" title="Excluir">
                <i class="fas fa-trash"></i>
              </button>
            `;
          } else {
            statusBadge = '<span class="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800"><i class="fas fa-exclamation-triangle mr-1"></i>Pendente</span>';
            acoes = `
              <button onclick="aprovarMeta(${m.id})" class="text-green-600 hover:text-green-800 mr-3" title="Aprovar Meta (adiciona ao TOP 6)">
                <i class="fas fa-check-circle"></i>
              </button>
              <button onclick="editMeta(${m.id})" class="text-teal-600 hover:text-teal-800 mr-3" title="Editar">
                <i class="fas fa-edit"></i>
              </button>
              <button onclick="deleteMeta(${m.id})" class="text-red-600 hover:text-red-800" title="Excluir">
                <i class="fas fa-trash"></i>
              </button>
            `;
          }
          
          return `
          <tr class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${m.produto_nome}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${m.meta_aprovacao}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${m.periodo_semanas}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${statusBadge}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              ${acoes}
            </td>
          </tr>
        `;
        }).join('')}
      </tbody>
    </table>
  `;
}

async function editMeta(id) {
  try {
    // Buscar meta específica
    const meta = AppState.metas.find(m => m.id === id);
    
    if (!meta) {
      showNotification('Meta não encontrada', 'error');
      return;
    }
    
    // Armazenar meta sendo editada
    AppState.editingMeta = meta;
    
    // Mostrar formulário
    showMetaForm();
    
    // Preencher formulário com dados da meta
    const metaIdInput = document.getElementById('meta-id');
    const metaProdutoSelect = document.getElementById('meta-produto');
    const metaAprovacaoInput = document.getElementById('meta-aprovacao');
    const metaPeriodoInput = document.getElementById('meta-periodo');
    
    if (metaIdInput) metaIdInput.value = meta.id;
    if (metaProdutoSelect) metaProdutoSelect.value = meta.produto_id;
    if (metaAprovacaoInput) metaAprovacaoInput.value = meta.meta_aprovacao;
    if (metaPeriodoInput) metaPeriodoInput.value = meta.periodo_semanas;
    
    // Atualizar títulos e botões
    const formTitle = document.getElementById('meta-form-title');
    const btnText = document.getElementById('meta-btn-text');
    
    if (formTitle) formTitle.textContent = 'Editar Meta';
    if (btnText) btnText.textContent = 'Atualizar Meta';
    
    showNotification('Meta carregada para edição', 'info');
    
  } catch (error) {
    console.error('Erro ao carregar meta para edição:', error);
    showNotification('Erro ao carregar meta', 'error');
  }
}

function cancelEditMeta() {
  hideMetaForm();
  showNotification('Edição cancelada', 'info');
}

async function handleSaveMeta(e) {
  e.preventDefault();
  
  // Obter valores do formulário
  const metaIdInput = document.getElementById('meta-id');
  const metaProdutoSelect = document.getElementById('meta-produto');
  const metaAprovacaoInput = document.getElementById('meta-aprovacao');
  const metaPeriodoInput = document.getElementById('meta-periodo');
  
  const id = metaIdInput ? metaIdInput.value : '';
  const produto_id = metaProdutoSelect ? metaProdutoSelect.value : '';
  const meta_aprovacao = metaAprovacaoInput ? metaAprovacaoInput.value : '';
  const periodo_semanas = metaPeriodoInput ? metaPeriodoInput.value : '';
  
  // VALIDAÇÃO COMPLETA
  const errors = [];
  
  if (!produto_id || produto_id === '') {
    errors.push('Selecione um produto');
  }
  
  if (!meta_aprovacao || meta_aprovacao === '' || isNaN(meta_aprovacao) || parseInt(meta_aprovacao) <= 0) {
    errors.push('Meta de aprovação deve ser um número maior que zero');
  }
  
  if (!periodo_semanas || periodo_semanas === '' || isNaN(periodo_semanas) || parseInt(periodo_semanas) <= 0) {
    errors.push('Período deve ser um número de semanas maior que zero');
  }
  
  // Exibir erros se houver
  if (errors.length > 0) {
    showNotification(errors.join(', '), 'error');
    return;
  }
  
  // Preparar dados
  const data = {
    produto_id: parseInt(produto_id),
    meta_aprovacao: parseInt(meta_aprovacao),
    periodo_semanas: parseInt(periodo_semanas)
  };
  
  try {
    // Decidir entre criar ou atualizar
    if (id) {
      // ATUALIZAR META EXISTENTE
      await axios.put(`${API_URL}/api/metas/${id}`, data);
      showNotification('Meta atualizada com sucesso! ✓', 'success');
    } else {
      // CRIAR NOVA META
      await axios.post(`${API_URL}/api/metas`, data);
      showNotification('Meta cadastrada com sucesso! ✓', 'success');
    }
    
    // Limpar formulário e recarregar metas
    const form = document.getElementById('formMeta');
    if (form) form.reset();
    
    cancelEditMeta();
    await loadMetas();
    await loadTop6Metas(false); // Atualizar TOP 6 também (sem loader)
    
  } catch (error) {
    console.error('Erro ao salvar meta:', error);
    const errorMsg = error.response?.data?.error || 'Erro ao salvar meta';
    showNotification(errorMsg, 'error');
  }
}

async function deleteMeta(id) {
  if (!confirm('Deseja realmente excluir esta meta?')) {
    return;
  }
  
  try {
    await axios.delete(`${API_URL}/api/metas/${id}`);
    showNotification('Meta excluída com sucesso! ✓', 'success');
    await loadMetas();
    await loadTop6Metas(); // Atualizar TOP 6 também
  } catch (error) {
    console.error('Erro ao excluir meta:', error);
    showNotification('Erro ao excluir meta', 'error');
  }
}

// Aprovar meta (adiciona ao TOP 6)
async function aprovarMeta(id) {
  if (!confirm('Deseja aprovar esta meta? Ela será adicionada ao TOP 6 de acompanhamento.')) {
    return;
  }
  
  try {
    const response = await axios.put(`${API_URL}/api/metas/${id}/aprovar`);
    if (response.data.success) {
      showNotification('Meta aprovada com sucesso! ✓ Agora aparece no TOP 6', 'success');
      await loadMetas();
      await loadTop6Metas(); // Atualizar TOP 6
    } else {
      showNotification(response.data.error || 'Erro ao aprovar meta', 'error');
    }
  } catch (error) {
    console.error('Erro ao aprovar meta:', error);
    const errorMsg = error.response?.data?.error || 'Erro ao aprovar meta';
    showNotification(errorMsg, 'error');
  }
}

// Carregar TOP 6 Metas
// Variável para controlar o intervalo de auto-atualização
let metasAutoRefreshInterval = null;

async function loadTop6Metas(showLoader = true) {
  const container = document.getElementById('top6-metas-grid');
  const loading = document.getElementById('top6-loading');
  const empty = document.getElementById('top6-empty');
  
  if (!container) return;
  
  // Mostrar loading apenas na primeira carga
  if (showLoader) {
    if (loading) loading.classList.remove('hidden');
    if (empty) empty.classList.add('hidden');
    container.classList.add('hidden');
  }
  
  try {
    const response = await axios.get(`${API_URL}/api/metas/top6`);
    const metas = response.data || [];
    
    // Esconder loading
    if (loading) loading.classList.add('hidden');
    
    if (metas.length === 0) {
      if (empty) empty.classList.remove('hidden');
      container.classList.add('hidden');
      return;
    }
    
    // Renderizar cards com animações suaves
    container.classList.remove('hidden');
    renderMetasCards(metas);
    
  } catch (error) {
    console.error('Erro ao carregar TOP 6 metas:', error);
    if (loading) loading.classList.add('hidden');
    if (empty) empty.classList.remove('hidden');
    container.classList.add('hidden');
  }
}

function renderMetasCards(metas) {
  const container = document.getElementById('top6-metas-grid');
  if (!container) return;
  
  container.innerHTML = metas.map(meta => {
    const isCompleted = meta.status === 'concluida' || meta.progresso_percent >= 100;
    const isAlmostThere = meta.progresso_percent >= 80 && meta.progresso_percent < 100;
    const isLowProgress = meta.progresso_percent < 30;
    
    // Definir cores e estilos baseados no progresso
    let statusBadge, progressBarColor, cardBorder, progressTextColor;
    
    if (isCompleted) {
      statusBadge = '<span class="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold inline-flex items-center animate-pulse"><i class="fas fa-check-circle mr-1"></i>Concluída</span>';
      progressBarColor = 'bg-green-500';
      cardBorder = 'border-green-300 bg-green-50';
      progressTextColor = 'text-green-600';
    } else if (isAlmostThere) {
      statusBadge = '<span class="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-bold inline-flex items-center"><i class="fas fa-rocket mr-1"></i>Quase lá!</span>';
      progressBarColor = 'bg-blue-500';
      cardBorder = 'border-blue-200 bg-blue-50';
      progressTextColor = 'text-blue-600';
    } else if (isLowProgress) {
      statusBadge = '<span class="bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-bold inline-flex items-center"><i class="fas fa-exclamation-triangle mr-1"></i>Início</span>';
      progressBarColor = 'bg-yellow-500';
      cardBorder = 'border-yellow-200 bg-yellow-50';
      progressTextColor = 'text-yellow-600';
    } else {
      statusBadge = '<span class="bg-teal-500 text-white px-3 py-1 rounded-full text-xs font-bold inline-flex items-center"><i class="fas fa-clock mr-1"></i>Em Andamento</span>';
      progressBarColor = 'bg-teal-600';
      cardBorder = 'border-teal-200 bg-white';
      progressTextColor = 'text-teal-600';
    }
    
    return `
      <div class="relative ${cardBorder} border-2 rounded-xl p-5 shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-105" data-meta-id="${meta.id}">
        <!-- Badge de Status -->
        <div class="absolute top-3 right-3">
          ${statusBadge}
        </div>
        
        <!-- Título do Produto -->
        <div class="mb-4 pr-24">
          <h4 class="text-lg font-bold text-gray-800 truncate">
            <i class="fas fa-box ${progressTextColor} mr-2"></i>
            ${meta.produto_nome}
          </h4>
        </div>
        
        <!-- Estatísticas -->
        <div class="grid grid-cols-3 gap-3 mb-4">
          <div class="bg-gray-50 rounded-lg p-3 transition-all">
            <p class="text-xs text-gray-600 uppercase font-semibold mb-1">Meta</p>
            <p class="text-2xl font-bold text-gray-900" data-meta-target="${meta.id}">${meta.meta_aprovacao}</p>
          </div>
          <div class="bg-blue-50 rounded-lg p-3 transition-all">
            <p class="text-xs text-blue-700 uppercase font-semibold mb-1">Criado</p>
            <p class="text-2xl font-bold text-blue-600 transition-all duration-500" data-meta-created="${meta.id}">${meta.total_criado || 0}</p>
          </div>
          <div class="bg-green-50 rounded-lg p-3 transition-all">
            <p class="text-xs text-green-700 uppercase font-semibold mb-1">Aprovado</p>
            <p class="text-2xl font-bold text-green-600 transition-all duration-500" data-meta-approved="${meta.id}">${meta.total_aprovado || 0}</p>
          </div>
        </div>
        
        <!-- Barra de Progresso -->
        <div class="mb-3">
          <div class="flex justify-between items-center mb-2">
            <span class="text-sm font-semibold text-gray-700">Progresso</span>
            <span class="text-sm font-bold ${progressTextColor} transition-all duration-500" data-meta-percent="${meta.id}">${meta.progresso_percent}%</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div class="${progressBarColor} h-3 rounded-full transition-all duration-700 ease-out" data-meta-bar="${meta.id}" style="width: ${Math.min(meta.progresso_percent, 100)}%"></div>
          </div>
        </div>
        
        <!-- Informação Adicional -->
        <div class="text-sm text-gray-600 space-y-1">
          <p>
            <i class="fas fa-calendar-alt mr-2 ${progressTextColor}"></i>
            <span class="font-semibold">Período:</span> ${meta.periodo_semanas} semanas
          </p>
          ${!isCompleted ? `
            <p>
              <i class="fas fa-target mr-2 ${progressTextColor}"></i>
              <span class="font-semibold">Faltam:</span> <span class="font-bold transition-all duration-500" data-meta-remaining="${meta.id}">${meta.faltam}</span> unidades
            </p>
          ` : `
            <p class="text-green-600 font-semibold animate-pulse">
              <i class="fas fa-trophy mr-2"></i>
              Meta atingida!
            </p>
          `}
        </div>
      </div>
    `;
  }).join('');
}

// Atualizar metas em tempo real (sem reload completo)
async function updateMetasRealTime() {
  try {
    const response = await axios.get(`${API_URL}/api/metas/top6`);
    const metas = response.data || [];
    
    metas.forEach(meta => {
      // Atualizar valores criados com animação
      const createdEl = document.querySelector(`[data-meta-created="${meta.id}"]`);
      if (createdEl && createdEl.textContent !== String(meta.total_criado || 0)) {
        createdEl.textContent = meta.total_criado || 0;
        createdEl.classList.add('scale-110');
        setTimeout(() => createdEl.classList.remove('scale-110'), 300);
      }
      
      // Atualizar valores aprovados com animação
      const approvedEl = document.querySelector(`[data-meta-approved="${meta.id}"]`);
      if (approvedEl && approvedEl.textContent !== String(meta.total_aprovado || 0)) {
        approvedEl.textContent = meta.total_aprovado || 0;
        approvedEl.classList.add('scale-110');
        setTimeout(() => approvedEl.classList.remove('scale-110'), 300);
      }
      
      // Atualizar percentual
      const percentEl = document.querySelector(`[data-meta-percent="${meta.id}"]`);
      if (percentEl && percentEl.textContent !== `${meta.progresso_percent}%`) {
        percentEl.textContent = `${meta.progresso_percent}%`;
      }
      
      // Atualizar barra de progresso com animação suave
      const barEl = document.querySelector(`[data-meta-bar="${meta.id}"]`);
      if (barEl) {
        barEl.style.width = `${Math.min(meta.progresso_percent, 100)}%`;
      }
      
      // Atualizar "Faltam"
      const remainingEl = document.querySelector(`[data-meta-remaining="${meta.id}"]`);
      if (remainingEl && meta.faltam >= 0) {
        remainingEl.textContent = meta.faltam;
      }
      
      // Se atingiu 100%, recarregar para mostrar nova UI
      if (meta.progresso_percent >= 100) {
        setTimeout(() => loadTop6Metas(false), 1000);
      }
    });
    
  } catch (error) {
    console.error('Erro ao atualizar metas em tempo real:', error);
  }
}

// Iniciar auto-refresh quando a aba de metas estiver ativa
function startMetasAutoRefresh() {
  // Limpar intervalo anterior se existir
  if (metasAutoRefreshInterval) {
    clearInterval(metasAutoRefreshInterval);
  }
  
  // Atualizar a cada 10 segundos
  metasAutoRefreshInterval = setInterval(() => {
    const metasTab = document.querySelector('[data-tab="metas"]');
    if (metasTab && !metasTab.classList.contains('hidden')) {
      updateMetasRealTime();
    }
  }, 10000); // 10 segundos
}

// Parar auto-refresh
function stopMetasAutoRefresh() {
  if (metasAutoRefreshInterval) {
    clearInterval(metasAutoRefreshInterval);
    metasAutoRefreshInterval = null;
  }
}

// ===========================
// CADASTROS (DESIGNERS E PRODUTOS)
// ===========================

async function loadCadastros() {
  setLoading('cadastros', true);
  setError('cadastros', null);
  
  try {
    await loadDesignersAndProdutos();
    renderDesignersList();
    renderProdutosList();
    setError('cadastros', null);
  } catch (error) {
    console.error('Erro ao carregar cadastros:', error);
    setError('cadastros', error);
  } finally {
    setLoading('cadastros', false);
  }
}

function renderDesignersList() {
  const container = document.getElementById('listaDesigners');
  if (!container) return;
  
  if (!AppState.designers || AppState.designers.length === 0) {
    container.innerHTML = '<p class="text-gray-500 text-center py-8">Nenhum designer cadastrado</p>';
    return;
  }
  
  container.innerHTML = AppState.designers.map(d => `
    <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
      <div class="flex items-center gap-3">
        ${getUserAvatar(d, 'md')}
        <span class="font-medium text-gray-800">${d.nome}</span>
      </div>
      <button onclick="deleteDesigner(${d.id})" class="text-red-600 hover:text-red-800 transition">
        <i class="fas fa-trash"></i>
      </button>
    </div>
  `).join('');
}

function renderProdutosList() {
  const container = document.getElementById('listaProdutos');
  if (!container) return;
  
  if (!AppState.produtos || AppState.produtos.length === 0) {
    container.innerHTML = '<p class="text-gray-500 text-center py-8">Nenhum produto cadastrado</p>';
    return;
  }
  
  container.innerHTML = AppState.produtos.map(p => `
    <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
      <span class="font-medium text-gray-800">
        <i class="fas fa-box text-green-600 mr-2"></i>
        ${p.nome}
      </span>
      <button onclick="deleteProduto(${p.id})" class="text-teal-600 hover:text-teal-800">
        <i class="fas fa-trash"></i>
      </button>
    </div>
  `).join('');
}

async function deleteDesigner(id) {
  if (!confirm('Deseja realmente remover este designer? Os lançamentos associados não serão excluídos.')) {
    return;
  }
  
  try {
    await axios.delete(`${API_URL}/api/designers/${id}`);
    showNotification('Designer removido com sucesso!', 'success');
    loadCadastros();
  } catch (error) {
    console.error('Erro ao remover designer:', error);
    showNotification('Erro ao remover designer', 'error');
  }
}

async function deleteProduto(id) {
  if (!confirm('Deseja realmente remover este produto? Os lançamentos associados não serão excluídos.')) {
    return;
  }
  
  try {
    await axios.delete(`${API_URL}/api/produtos/${id}`);
    showNotification('Produto removido com sucesso!', 'success');
    loadCadastros();
  } catch (error) {
    console.error('Erro ao remover produto:', error);
    showNotification('Erro ao remover produto', 'error');
  }
}

// ===========================
// AUTENTICAÇÃO
// ===========================

async function checkAuthentication() {
  const token = localStorage.getItem('auth_token');
  
  // Se não tiver token, redireciona para login
  if (!token) {
    window.location.href = '/login';
    return false;
  }
  
  try {
    // Verificar se o token é válido
    const response = await fetch(`${API_URL}/api/auth/verify`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    
    if (!data.valid) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      window.location.href = '/login';
      return false;
    }
    
    // Exibir informações do usuário no header
    const userData = localStorage.getItem('user_data');
    if (userData) {
      const user = JSON.parse(userData);
      displayUserInfo(user);
    }
    
    return true;
    
  } catch (error) {
    console.error('Erro ao verificar autenticação:', error);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    window.location.href = '/login';
    return false;
  }
}

function displayUserInfo(user) {
  const userInfo = document.getElementById('userInfo');
  if (userInfo) {
    userInfo.innerHTML = `
      <div class="text-white flex items-center">
        <i class="fas fa-user-circle mr-2 text-xl"></i>
        <span class="font-semibold">${user.username}</span>
        <span class="text-xs ml-2 bg-white/20 px-2 py-1 rounded">${user.role === 'admin' ? 'Admin' : 'Designer'}</span>
      </div>
      <div class="flex gap-2">
        <button onclick="openEditProfile()" class="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition text-white font-semibold">
          <i class="fas fa-user-edit mr-2"></i>Perfil
        </button>
        <button onclick="logout()" class="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition text-white font-semibold">
          <i class="fas fa-sign-out-alt mr-2"></i>Sair
        </button>
      </div>
    `;
  }
}

function logout() {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user_data');
  window.location.href = '/login';
}

// ===========================
// FORMULÁRIOS
// ===========================

document.addEventListener('DOMContentLoaded', async () => {
  // Verificar autenticação primeiro
  const isAuthenticated = await checkAuthentication();
  if (!isAuthenticated) {
    return; // Para execução se não estiver autenticado
  }
  
  // Formulário de lançamento
  const formLancamento = document.getElementById('formLancamento');
  if (formLancamento) {
    formLancamento.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const data = {
        designer_id: parseInt(document.getElementById('input-designer').value),
        produto_id: parseInt(document.getElementById('input-produto').value),
        semana: parseInt(document.getElementById('input-semana').value),
        data: document.getElementById('input-data').value,
        quantidade_criada: parseInt(document.getElementById('input-criada').value),
        quantidade_reprovada: parseInt(document.getElementById('input-reprovada').value),
        quantidade_aprovada: parseInt(document.getElementById('input-aprovada').value),
        observacoes: document.getElementById('input-obs').value,
        aprovada_manual: window.aprovadaManualMode ? 1 : 0
      };
      
      try {
        await axios.post(`${API_URL}/api/lancamentos`, data);
        showNotification('Lançamento cadastrado com sucesso!', 'success');
        formLancamento.reset();
        document.getElementById('input-data').valueAsDate = getBrasiliaDateTime('datetime');
        window.aprovadaManualMode = false; // Reset manual mode
        loadLancamentos(AppState.currentPage);
      } catch (error) {
        console.error('Erro ao cadastrar lançamento:', error);
        showNotification('Erro ao cadastrar lançamento', 'error');
      }
    });
  }
  
  // Formulário de edição de lançamento
  const formEditLancamento = document.getElementById('formEditLancamento');
  if (formEditLancamento) {
    formEditLancamento.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const id = document.getElementById('edit-id').value;
      const data = {
        designer_id: parseInt(document.getElementById('edit-designer').value),
        produto_id: parseInt(document.getElementById('edit-produto').value),
        semana: parseInt(document.getElementById('edit-semana').value),
        data: document.getElementById('edit-data').value,
        quantidade_criada: parseInt(document.getElementById('edit-criada').value),
        quantidade_reprovada: parseInt(document.getElementById('edit-reprovada').value),
        quantidade_aprovada: parseInt(document.getElementById('edit-aprovada').value),
        observacoes: document.getElementById('edit-obs').value,
        edicao_manual: true // Flag para indicar edição manual - NÃO recalcular automaticamente
      };
      
      try {
        await axios.put(`${API_URL}/api/lancamentos/${id}`, data);
        showNotification('Lançamento atualizado com sucesso!', 'success');
        closeEditModal();
        loadLancamentos(AppState.currentPage);
      } catch (error) {
        console.error('Erro ao atualizar lançamento:', error);
        showNotification('Erro ao atualizar lançamento', 'error');
      }
    });
  }

  // ========================================
  // CÁLCULOS AUTOMÁTICOS - LANÇAMENTO
  // ========================================
  
  // Função para calcular quantidade aprovada automaticamente
  function calcularQuantidadeAprovada(criadaInputId, reprovadaInputId, aprovadaInputId) {
    const criadaInput = document.getElementById(criadaInputId);
    const reprovadaInput = document.getElementById(reprovadaInputId);
    const aprovadaInput = document.getElementById(aprovadaInputId);
    
    if (!criadaInput || !reprovadaInput || !aprovadaInput) return;
    
    const criada = parseInt(criadaInput.value) || 0;
    const reprovada = parseInt(reprovadaInput.value) || 0;
    
    // Validação: reprovada não pode ser maior que criada
    if (reprovada > criada) {
      reprovadaInput.value = criada;
      showNotification('Quantidade reprovada não pode ser maior que criada', 'error');
      aprovadaInput.value = 0;
      return;
    }
    
    // Calcular aprovada = criada - reprovada
    const aprovada = criada - reprovada;
    aprovadaInput.value = aprovada;
  }
  
  // Listeners para formulário de criação
  const inputCriada = document.getElementById('input-criada');
  const inputReprovada = document.getElementById('input-reprovada');
  
  if (inputCriada) {
    inputCriada.addEventListener('input', () => {
      if (!window.aprovadaManualMode) {
        calcularAprovada();
      }
    });
  }
  
  if (inputReprovada) {
    inputReprovada.addEventListener('input', () => {
      if (!window.aprovadaManualMode) {
        calcularAprovada();
      }
    });
  }
  
  // Listeners para formulário de edição
  // DESABILITADO: Durante edição manual, não recalcular automaticamente
  // A edição manual deve respeitar os valores inseridos pelo admin/supervisor
  const editCriada = document.getElementById('edit-criada');
  const editReprovada = document.getElementById('edit-reprovada');
  const editAprovada = document.getElementById('edit-aprovada');
  
  // Adicionar indicador visual de que a taxa será recalculada
  if (editCriada && editAprovada) {
    const calcularTaxa = () => {
      const criada = parseInt(editCriada.value) || 0;
      const aprovada = parseInt(editAprovada.value) || 0;
      
      if (criada > 0) {
        const taxa = Math.round((aprovada / criada) * 100);
        // Mostrar taxa calculada (opcional - pode adicionar um elemento visual)
        console.log(`Taxa calculada: ${taxa}%`);
      }
    };
    
    editCriada.addEventListener('input', calcularTaxa);
    editAprovada.addEventListener('input', calcularTaxa);
  }
  
  // Formulário de meta - NOVA IMPLEMENTAÇÃO COM VALIDAÇÃO
  const formMeta = document.getElementById('formMeta');
  if (formMeta) {
    formMeta.addEventListener('submit', handleSaveMeta);
  }
  
  // Formulário de designer
  const formDesigner = document.getElementById('formDesigner');
  if (formDesigner) {
    formDesigner.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const nome = document.getElementById('input-designer-nome').value;
      
      if (!nome || nome.trim() === '') {
        showNotification('Digite o nome do designer', 'error');
        return;
      }
      
      try {
        await axios.post(`${API_URL}/api/designers`, { nome });
        showNotification('Designer cadastrado com sucesso!', 'success');
        formDesigner.reset();
        loadCadastros();
      } catch (error) {
        console.error('Erro ao cadastrar designer:', error);
        showNotification('Erro ao cadastrar designer', 'error');
      }
    });
  }
  
  // Formulário de produto
  const formProduto = document.getElementById('formProduto');
  if (formProduto) {
    formProduto.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const nome = document.getElementById('input-produto-nome').value;
      
      if (!nome || nome.trim() === '') {
        showNotification('Digite o nome do produto', 'error');
        return;
      }
      
      try {
        await axios.post(`${API_URL}/api/produtos`, { nome });
        showNotification('Produto cadastrado com sucesso!', 'success');
        formProduto.reset();
        loadCadastros();
      } catch (error) {
        console.error('Erro ao cadastrar produto:', error);
        showNotification('Erro ao cadastrar produto', 'error');
      }
    });
  }
  
  // Inicializar aplicação
  initializeApp();
  
  // Listener para navegação automática entre abas (mensagem dos designers)
  window.addEventListener('message', (event) => {
    if (event.data && event.data.action === 'showTab') {
      showTab(event.data.tab);
    }
  });
});

// ===========================
// NOTIFICAÇÕES (TOASTS)
// ===========================

function showNotification(message, type = 'info') {
  const colors = {
    success: 'bg-green-500',
    error: 'bg-teal-500',
    info: 'bg-teal-500'
  };
  
  const icons = {
    success: 'fa-check-circle',
    error: 'fa-exclamation-circle',
    info: 'fa-info-circle'
  };
  
  const notification = document.createElement('div');
  notification.className = `fixed top-4 right-4 ${colors[type]} text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-opacity flex items-center space-x-2`;
  notification.innerHTML = `
    <i class="fas ${icons[type]}"></i>
    <span>${message}</span>
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.opacity = '0';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// ===========================
// TAB DESIGNERS
// ===========================

async function loadDesignersList() {
  setLoading('designers', true);
  setError('designers', null);
  
  const container = document.getElementById('designersList');
  if (!container) return;
  
  try {
    if (!AppState.designers || AppState.designers.length === 0) {
      await loadDesignersAndProdutos();
    }
    
    // Carregar estatísticas gerais
    try {
      const statsRes = await axios.get(`${API_URL}/api/relatorios/estatisticas`);
      const stats = statsRes.data || {};
      
      const statTotal = document.getElementById('designers-stat-total');
      const statLancamentos = document.getElementById('designers-stat-lancamentos');
      const statAprovados = document.getElementById('designers-stat-aprovados');
      const statTaxa = document.getElementById('designers-stat-taxa');
      
      if (statTotal) statTotal.textContent = stats.total_designers || 0;
      if (statLancamentos) statLancamentos.textContent = stats.total_lancamentos || 0;
      if (statAprovados) statAprovados.textContent = stats.total_aprovadas || 0;
      if (statTaxa) statTaxa.textContent = (stats.taxa_aprovacao_geral || 0) + '%';
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
    
    // Buscar estatísticas individuais de cada designer
    const designersWithStats = await Promise.all(AppState.designers.map(async (designer) => {
      try {
        const statsRes = await axios.get(`${API_URL}/api/designers/${designer.id}/stats`);
        return {
          ...designer,
          stats: statsRes.data.resumo
        };
      } catch (error) {
        return {
          ...designer,
          stats: null
        };
      }
    }));
    
    container.innerHTML = designersWithStats.map(designer => {
      const stats = designer.stats;
      const totalCriado = stats?.total_criado || 0;
      const totalAprovado = stats?.total_aprovado || 0;
      const taxaAprovacao = stats?.taxa_aprovacao || 0;
      
      return `
        <div onclick="openDesignerDashboard(${designer.id})" 
           class="cursor-pointer p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl hover:shadow-lg transition border border-teal-200 hover:border-teal-400">
          <div class="flex items-center space-x-4 mb-4">
            <div class="bg-teal-600 text-white w-14 h-14 rounded-full flex items-center justify-center text-2xl font-bold">
              ${designer.nome.charAt(0).toUpperCase()}
            </div>
            <div class="flex-1">
              <h3 class="text-lg font-bold text-gray-800">${designer.nome}</h3>
              <p class="text-sm text-gray-600">
                <i class="fas fa-chart-line mr-1"></i>
                Ver Dashboard Completo
              </p>
            </div>
            <div>
              <i class="fas fa-arrow-right text-teal-600 text-xl"></i>
            </div>
          </div>
          ${stats ? `
          <div class="grid grid-cols-3 gap-2 pt-4 border-t border-teal-200">
            <div class="text-center">
              <div class="text-xs text-gray-500">Criadas</div>
              <div class="text-lg font-bold text-blue-600">${totalCriado}</div>
            </div>
            <div class="text-center">
              <div class="text-xs text-gray-500">Aprovadas</div>
              <div class="text-lg font-bold text-green-600">${totalAprovado}</div>
            </div>
            <div class="text-center">
              <div class="text-xs text-gray-500">Taxa</div>
              <div class="text-lg font-bold text-purple-600">${taxaAprovacao}%</div>
            </div>
          </div>
          ` : ''}
        </div>
      `;
    }).join('');
    
    setError('designers', null);
    
  } catch (error) {
    console.error('Erro ao carregar lista de designers:', error);
    setError('designers', error);
    container.innerHTML = '<p class="text-teal-500 text-center py-8">Erro ao carregar designers</p>';
  } finally {
    setLoading('designers', false);
  }
}

// ===========================
// PLANILHAS INDIVIDUAIS
// ===========================

async function loadPlanilhasDesigners() {
  const container = document.getElementById('listaPlanilhasDesigners');
  if (!container) return;
  
  try {
    container.innerHTML = '<p class="text-gray-500 text-center py-4">Carregando designers...</p>';
    
    // Buscar designers ativos
    const response = await axios.get(`${API_URL}/api/designers`);
    const designers = response.data || [];
    
    if (designers.length === 0) {
      container.innerHTML = '<p class="text-gray-500 text-center py-4">Nenhum designer cadastrado</p>';
      return;
    }
    
    // Renderizar cards dos designers
    container.innerHTML = designers.filter(d => d.ativo).map(designer => `
      <a href="/designer/${designer.id}/planilha" 
         target="_blank"
         class="block p-6 bg-gradient-to-br from-teal-50 to-teal-100 rounded-xl hover:shadow-lg transition border border-teal-200 hover:border-teal-400">
        <div class="flex items-center space-x-4">
          <div class="bg-teal-600 text-white w-14 h-14 rounded-full flex items-center justify-center text-2xl font-bold">
            ${designer.nome.charAt(0).toUpperCase()}
          </div>
          <div class="flex-1">
            <h3 class="text-lg font-bold text-gray-800">${designer.nome}</h3>
            <p class="text-sm text-gray-600">
              <i class="fas fa-table mr-1"></i>
              Planilha Estilo Excel
            </p>
            <p class="text-xs text-gray-500 mt-1">
              <i class="fas fa-link mr-1"></i>
              Com referências cruzadas
            </p>
          </div>
          <div>
            <i class="fas fa-external-link-alt text-teal-600 text-xl"></i>
          </div>
        </div>
      </a>
    `).join('');
    
  } catch (error) {
    console.error('Erro ao carregar lista de planilhas:', error);
    container.innerHTML = '<p class="text-teal-500 text-center py-4">Erro ao carregar designers</p>';
  }
}

// ===========================
// CONTROLE POR ROLE (ADMIN/USER)
// ===========================

function setupRoleBasedUI() {
  const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
  const role = userData.role || 'user';
  
  // Elementos que só admin vê
  const adminElements = [
    'btn-lancamentos',
    'btn-cadastros',
    'btn-planejamentos'
  ];
  
  // Elementos que só user vê
  const userElements = [
    'btn-meus-produtos'
  ];
  
  if (role === 'admin') {
    // Mostrar elementos de admin
    adminElements.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.classList.remove('hidden');
    });
    // Ocultar elementos de user
    userElements.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.classList.add('hidden');
    });
  } else {
    // Ocultar elementos de admin
    adminElements.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.classList.add('hidden');
    });
    // Mostrar elementos de user
    userElements.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.classList.remove('hidden');
    });
  }
}

// ===========================
// ========================================
// PLANEJAMENTO SEMANAL (ADMIN)
// ========================================

async function showPlanejamentoSemanalForm() {
  document.getElementById('planejamento-semanal-form').classList.remove('hidden');
  
  // Carregar produtos
  const produtosRes = await axios.get(`${API_URL}/api/produtos`);
  const produtos = produtosRes.data || [];
  const selectProduto = document.getElementById('ps-produto');
  selectProduto.innerHTML = '<option value="">Selecione...</option>' +
    produtos.filter(p => p.ativo).map(p => `<option value="${p.id}">${p.nome}</option>`).join('');
  
  // Carregar usuários
  const designersRes = await axios.get(`${API_URL}/api/designers`);
  const designers = designersRes.data.filter(d => d.ativo && d.role === 'user') || [];
  const containerUsuarios = document.getElementById('ps-usuarios');
  containerUsuarios.innerHTML = designers.map(d => `
    <label class="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded">
      <input type="checkbox" class="ps-usuario-check" value="${d.id}">
      <span class="text-sm">${d.nome}</span>
    </label>
  `).join('');
  
  // Set today (Brasília timezone)
  document.getElementById('ps-data').valueAsDate = getBrasiliaDateTime('datetime');
  
  // Calcular semana ao mudar data
  document.getElementById('ps-data').addEventListener('change', calcularSemanaPreview);
  calcularSemanaPreview();
  
  // Toggle usuários ao marcar "todos"
  document.getElementById('ps-aplicar-todos').addEventListener('change', (e) => {
    document.getElementById('ps-usuarios-container').style.display = e.target.checked ? 'none' : 'block';
  });
}

function hidePlanejamentoSemanalForm() {
  document.getElementById('planejamento-semanal-form').classList.add('hidden');
  document.getElementById('formPlanejamentoSemanal').reset();
}

function calcularSemanaPreview() {
  const dataInput = document.getElementById('ps-data').value;
  if (!dataInput) return;
  
  const date = new Date(dataInput + 'T00:00:00');
  const weekInfo = getISOWeek(date);
  
  document.getElementById('ps-semana-preview').classList.remove('hidden');
  document.getElementById('ps-semana-texto').textContent = 
    `Semana ${weekInfo.weekNumber} – ${new Date(weekInfo.weekStartDate).toLocaleDateString('pt-BR')}`;
}

function getISOWeek(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNumber = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  
  const mondayDate = new Date(d);
  mondayDate.setUTCDate(d.getUTCDate() - (d.getUTCDay() === 0 ? 6 : d.getUTCDay() - 1));
  
  return {
    weekNumber,
    weekStartDate: mondayDate.toISOString().split('T')[0],
    year: d.getUTCFullYear()
  };
}

// Submit planejamento semanal
const formPS = document.getElementById('formPlanejamentoSemanal');
if (formPS) {
  formPS.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const produto_id = parseInt(document.getElementById('ps-produto').value);
    const quantidade_planejada = parseInt(document.getElementById('ps-quantidade').value);
    const data_base = document.getElementById('ps-data').value;
    const aplicar_todos = document.getElementById('ps-aplicar-todos').checked;
    
    const designer_ids = aplicar_todos ? [] : 
      Array.from(document.querySelectorAll('.ps-usuario-check:checked')).map(c => parseInt(c.value));
    
    if (!aplicar_todos && designer_ids.length === 0) {
      showNotification('Selecione pelo menos um usuário', 'error');
      return;
    }
    
    const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
    
    try {
      const res = await axios.post(`${API_URL}/api/planejamento-semanal`, {
        produto_id,
        quantidade_planejada,
        data_base,
        designer_ids,
        aplicar_todos,
        admin_id: userData.id
      });
      
      if (res.data.conflicts && res.data.conflicts.length > 0) {
        const conflictMsg = res.data.conflicts.map(c => 
          `${c.designer_nome}: ${c.error}`
        ).join('\n');
        showNotification(
          `${res.data.created} criados. ${res.data.conflicts.length} conflitos:\n${conflictMsg}`, 
          'warning'
        );
      } else {
        showNotification(`${res.data.created} planejamentos criados com sucesso!`, 'success');
      }
      
      hidePlanejamentoSemanalForm();
      loadPlanejamentosSemanal();
    } catch (error) {
      console.error('Erro ao criar planejamento:', error);
      showNotification(error.response?.data?.error || 'Erro ao criar planejamento', 'error');
    }
  });
}

async function loadPlanejamentosSemanal() {
  const container = document.getElementById('listaPlanejamentosSemanal');
  
  try {
    const res = await axios.get(`${API_URL}/api/planejamento-semanal`);
    const planejamentos = res.data || [];
    
    if (planejamentos.length === 0) {
      container.innerHTML = '<p class="text-gray-500 text-center py-8">Nenhum planejamento cadastrado</p>';
      return;
    }
    
    // Agrupar por semana
    const grouped = {};
    planejamentos.forEach(p => {
      const key = `${p.ano}-W${String(p.semana_numero).padStart(2, '0')}`;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(p);
    });
    
    container.innerHTML = Object.keys(grouped).sort().reverse().map(week => {
      const items = grouped[week];
      const firstItem = items[0];
      const weekDisplay = `Semana ${firstItem.semana_numero} – ${new Date(firstItem.semana_data_inicio).toLocaleDateString('pt-BR')}`;
      
      return `
        <div class="mb-6 border border-gray-200 rounded-lg p-4">
          <h4 class="font-bold text-lg text-gray-800 mb-3">
            <i class="fas fa-calendar-week text-teal-600 mr-2"></i>${weekDisplay}
          </h4>
          <div class="space-y-2">
            ${items.map(p => `
              <div class="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div class="flex-1">
                  <span class="font-semibold text-gray-800">${p.designer_nome}</span>
                  <span class="text-gray-600 mx-2">→</span>
                  <span class="text-gray-700">${p.produto_nome}</span>
                  <span class="text-teal-600 font-bold ml-2">${p.quantidade_planejada} un</span>
                </div>
                <div class="flex space-x-2">
                  <button onclick="editarPlanejamentoSemanal(${p.id})" class="text-green-600 hover:text-green-800" title="Editar">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button onclick="duplicarPlanejamento(${p.id})" class="text-blue-600 hover:text-blue-800" title="Duplicar para próxima semana">
                    <i class="fas fa-copy"></i>
                  </button>
                  <button onclick="deletePlanejamentoSemanal(${p.id})" class="text-red-600 hover:text-red-800" title="Excluir">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }).join('');
    
  } catch (error) {
    console.error('Erro ao carregar planejamentos:', error);
    container.innerHTML = '<p class="text-red-500 text-center py-8">Erro ao carregar planejamentos</p>';
  }
}

async function deletePlanejamentoSemanal(id) {
  if (!confirm('Deseja realmente excluir este planejamento?')) return;
  
  try {
    await axios.delete(`${API_URL}/api/planejamento-semanal/${id}`);
    showNotification('Planejamento excluído com sucesso!', 'success');
    loadPlanejamentosSemanal();
  } catch (error) {
    console.error('Erro ao excluir:', error);
    showNotification('Erro ao excluir planejamento', 'error');
  }
}

async function duplicarPlanejamento(id) {
  const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
  
  try {
    const res = await axios.post(`${API_URL}/api/planejamento-semanal/duplicar`, {
      planejamento_id: id,
      admin_id: userData.id
    });
    
    showNotification(`Planejamento duplicado para ${res.data.semana.formato_exibicao}!`, 'success');
    loadPlanejamentosSemanal();
  } catch (error) {
    console.error('Erro ao duplicar:', error);
    showNotification(error.response?.data?.error || 'Erro ao duplicar planejamento', 'error');
  }
}

// Editar item do planejamento semanal
async function editarPlanejamentoSemanal(id) {
  try {
    // Buscar dados do planejamento
    const res = await axios.get(`${API_URL}/api/planejamento-semanal/${id}`);
    const planejamento = res.data;
    
    if (!planejamento) {
      showNotification('Planejamento não encontrado', 'error');
      return;
    }
    
    // Preencher modal de edição
    document.getElementById('edit-planejamento-id').value = planejamento.id;
    document.getElementById('edit-planejamento-designer').value = planejamento.designer_id;
    document.getElementById('edit-planejamento-produto').value = planejamento.produto_id;
    document.getElementById('edit-planejamento-quantidade').value = planejamento.quantidade_planejada;
    
    // Carregar designers e produtos para os selects
    await carregarDesignersEProdutosParaEdicao();
    
    // Restaurar valores selecionados
    document.getElementById('edit-planejamento-designer').value = planejamento.designer_id;
    document.getElementById('edit-planejamento-produto').value = planejamento.produto_id;
    
    // Mostrar modal
    document.getElementById('modalEditPlanejamento').classList.remove('hidden');
    document.getElementById('modalEditPlanejamento').classList.add('flex');
    
  } catch (error) {
    console.error('Erro ao carregar planejamento:', error);
    showNotification('Erro ao carregar dados do planejamento', 'error');
  }
}

async function carregarDesignersEProdutosParaEdicao() {
  try {
    // Carregar designers
    const designersRes = await axios.get(`${API_URL}/api/designers`);
    const designers = designersRes.data.filter(d => d.ativo && d.role === 'user') || [];
    const selectDesigner = document.getElementById('edit-planejamento-designer');
    selectDesigner.innerHTML = '<option value="">Selecione...</option>' +
      designers.map(d => `<option value="${d.id}">${d.nome}</option>`).join('');
    
    // Carregar produtos
    const produtosRes = await axios.get(`${API_URL}/api/produtos`);
    const produtos = produtosRes.data.filter(p => p.ativo) || [];
    const selectProduto = document.getElementById('edit-planejamento-produto');
    selectProduto.innerHTML = '<option value="">Selecione...</option>' +
      produtos.map(p => `<option value="${p.id}">${p.nome}</option>`).join('');
      
  } catch (error) {
    console.error('Erro ao carregar designers/produtos:', error);
  }
}

function closeEditPlanejamentoModal() {
  document.getElementById('modalEditPlanejamento').classList.add('hidden');
  document.getElementById('modalEditPlanejamento').classList.remove('flex');
}

async function salvarEdicaoPlanejamento() {
  // Confirmar edição
  if (!confirm('Tem certeza que deseja editar este item do planejamento?')) {
    return;
  }
  
  const id = document.getElementById('edit-planejamento-id').value;
  const designer_id = parseInt(document.getElementById('edit-planejamento-designer').value);
  const produto_id = parseInt(document.getElementById('edit-planejamento-produto').value);
  const quantidade_planejada = parseInt(document.getElementById('edit-planejamento-quantidade').value);
  
  // Validações
  if (!designer_id || !produto_id || !quantidade_planejada) {
    showNotification('Preencha todos os campos', 'error');
    return;
  }
  
  if (quantidade_planejada <= 0) {
    showNotification('Quantidade deve ser maior que zero', 'error');
    return;
  }
  
  try {
    await axios.put(`${API_URL}/api/planejamento-semanal/${id}`, {
      designer_id,
      produto_id,
      quantidade_planejada
    });
    
    showNotification('Planejamento atualizado com sucesso!', 'success');
    closeEditPlanejamentoModal();
    
    // Atualizar módulos relacionados
    await loadPlanejamentosSemanal();
    
    // Atualizar acompanhamento se a função existir
    if (typeof loadDesignersSemanas === 'function') {
      await loadDesignersSemanas();
    }
    
    // Atualizar dashboard se a função existir
    if (typeof loadDashboard === 'function') {
      await loadDashboard();
    }
    
    // Atualizar metas se a função existir
    if (typeof loadTop6Metas === 'function') {
      await loadTop6Metas();
    }
    
  } catch (error) {
    console.error('Erro ao atualizar planejamento:', error);
    showNotification(error.response?.data?.error || 'Erro ao atualizar planejamento', 'error');
  }
}

// Expor funções
window.showPlanejamentoSemanalForm = showPlanejamentoSemanalForm;
window.hidePlanejamentoSemanalForm = hidePlanejamentoSemanalForm;
window.loadPlanejamentosSemanal = loadPlanejamentosSemanal;
window.deletePlanejamentoSemanal = deletePlanejamentoSemanal;
window.duplicarPlanejamento = duplicarPlanejamento;
window.editarPlanejamentoSemanal = editarPlanejamentoSemanal;
window.closeEditPlanejamentoModal = closeEditPlanejamentoModal;
window.salvarEdicaoPlanejamento = salvarEdicaoPlanejamento;
// ===========================

let editingPlanejamento = null;

function showPlanejamentoForm() {
  document.getElementById('planejamento-form-container').classList.remove('hidden');
  document.getElementById('planejamento-form-title').textContent = 'Novo Planejamento';
  document.getElementById('planejamento-btn-text').textContent = 'Salvar Planejamento';
  document.getElementById('planejamento-cancel-btn').classList.remove('hidden');
}

function hidePlanejamentoForm() {
  document.getElementById('planejamento-form-container').classList.add('hidden');
  document.getElementById('formPlanejamento').reset();
  document.getElementById('planejamento-id').value = '';
  editingPlanejamento = null;
}

async function loadPlanejamentos() {
  const container = document.getElementById('listaPlanejamentos');
  const loading = document.getElementById('planejamentos-loading');
  
  loading.classList.remove('hidden');
  
  try {
    const res = await axios.get(`${API_URL}/api/produtos-planejados`);
    const planejamentos = res.data || [];
    
    loading.classList.add('hidden');
    
    if (planejamentos.length === 0) {
      container.innerHTML = '<p class="text-gray-500 text-center py-8">Nenhum planejamento cadastrado</p>';
      return;
    }
    
    container.innerHTML = `
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produto</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qtd. Planejada</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Período</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Progresso</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          ${planejamentos.map(p => {
            const statusColors = {
              'pendente': 'bg-yellow-100 text-yellow-800',
              'em_andamento': 'bg-blue-100 text-blue-800',
              'concluido': 'bg-green-100 text-green-800'
            };
            const statusClass = statusColors[p.status] || 'bg-gray-100 text-gray-800';
            const progresso = p.progresso_percent || 0;
            
            return `
              <tr class="hover:bg-gray-50">
                <td class="px-4 py-3 text-sm font-medium text-gray-900">${p.produto_nome}</td>
                <td class="px-4 py-3 text-sm text-gray-900">${p.quantidade_planejada}</td>
                <td class="px-4 py-3 text-sm text-gray-900">${formatWeekDisplay(p.periodo)}</td>
                <td class="px-4 py-3">
                  <span class="px-2 py-1 text-xs rounded-full ${statusClass}">
                    ${p.status}
                  </span>
                </td>
                <td class="px-4 py-3">
                  <div class="flex items-center">
                    <div class="w-full bg-gray-200 rounded-full h-2 mr-2">
                      <div class="bg-teal-600 h-2 rounded-full" style="width: ${Math.min(progresso, 100)}%"></div>
                    </div>
                    <span class="text-xs text-gray-600">${progresso.toFixed(0)}%</span>
                  </div>
                </td>
                <td class="px-4 py-3 text-sm">
                  <button onclick="editPlanejamento(${p.id})" class="text-teal-600 hover:text-teal-800 mr-3" title="Editar">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button onclick="deletePlanejamento(${p.id})" class="text-teal-600 hover:text-teal-800" title="Excluir">
                    <i class="fas fa-trash"></i>
                  </button>
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    `;
  } catch (error) {
    loading.classList.add('hidden');
    console.error('Erro ao carregar planejamentos:', error);
    container.innerHTML = '<p class="text-teal-500 text-center py-8">Erro ao carregar planejamentos</p>';
  }
}

async function editPlanejamento(id) {
  try {
    const res = await axios.get(`${API_URL}/api/produtos-planejados`);
    const planejamento = res.data.find(p => p.id === id);
    
    if (!planejamento) {
      showNotification('Planejamento não encontrado', 'error');
      return;
    }
    
    editingPlanejamento = planejamento;
    
    document.getElementById('planejamento-id').value = planejamento.id;
    document.getElementById('planejamento-produto').value = planejamento.produto_id;
    document.getElementById('planejamento-quantidade').value = planejamento.quantidade_planejada;
    document.getElementById('planejamento-periodo').value = planejamento.periodo;
    
    document.getElementById('planejamento-form-title').textContent = 'Editar Planejamento';
    document.getElementById('planejamento-btn-text').textContent = 'Atualizar';
    document.getElementById('planejamento-cancel-btn').classList.remove('hidden');
    document.getElementById('planejamento-form-container').classList.remove('hidden');
    
    document.getElementById('formPlanejamento').scrollIntoView({ behavior: 'smooth' });
  } catch (error) {
    console.error('Erro ao editar planejamento:', error);
    showNotification('Erro ao carregar planejamento', 'error');
  }
}

async function deletePlanejamento(id) {
  if (!confirm('Deseja realmente excluir este planejamento?')) return;
  
  try {
    await axios.delete(`${API_URL}/api/produtos-planejados/${id}`);
    showNotification('Planejamento excluído com sucesso!', 'success');
    loadPlanejamentos();
  } catch (error) {
    console.error('Erro ao excluir planejamento:', error);
    showNotification('Erro ao excluir planejamento', 'error');
  }
}

// ===========================
// MEUS PRODUTOS (USER)
// ===========================

async function loadMeusProdutos() {
  const container = document.getElementById('listaMeusProdutos');
  const loading = document.getElementById('meus-produtos-loading');
  const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
  const designer_id = userData.id;
  
  if (!designer_id) {
    container.innerHTML = '<p class="text-teal-500 text-center py-8">Erro: usuário não identificado</p>';
    return;
  }
  
  loading.classList.remove('hidden');
  
  try {
    // Buscar planejamentos semanais do usuário (novo endpoint)
    const url = `${API_URL}/api/meus-produtos-semanais?designer_id=${designer_id}`;
    
    const res = await axios.get(url);
    let produtos = res.data || [];
    
    // Filtro de segurança: remover duplicatas por ID (caso backend retorne)
    const produtosUnicos = [];
    const idsVistos = new Set();
    
    produtos.forEach(p => {
      if (!idsVistos.has(p.id)) {
        idsVistos.add(p.id);
        produtosUnicos.push(p);
      }
    });
    
    produtos = produtosUnicos;
    
    loading.classList.add('hidden');
    
    if (produtos.length === 0) {
      container.innerHTML = '<div class="bg-white rounded-xl shadow-md p-8 text-center"><p class="text-gray-500">Nenhum produto planejado para você</p></div>';
      return;
    }
    
    // Agrupar produtos por semana
    const produtosPorSemana = {};
    produtos.forEach(p => {
      const chave = `${p.ano}-W${String(p.semana_numero).padStart(2, '0')}`;
      if (!produtosPorSemana[chave]) {
        produtosPorSemana[chave] = {
          numero: p.semana_numero,
          data_inicio: p.semana_data_inicio,
          ano: p.ano,
          produtos: []
        };
      }
      produtosPorSemana[chave].produtos.push(p);
    });
    
    // Ordenar semanas (formato: 2026-W01, 2026-W02, etc)
    const semanasOrdenadas = Object.keys(produtosPorSemana).sort();
    
    // Renderizar agrupado por semana
    container.innerHTML = semanasOrdenadas.map(chave => {
      const semanaInfo = produtosPorSemana[chave];
      const produtosDaSemana = semanaInfo.produtos;
      const totalProdutos = produtosDaSemana.length;
      const confirmados = produtosDaSemana.filter(p => p.lancamento_id).length;
      const pendentes = totalProdutos - confirmados;
      
      // Formatar data no padrão brasileiro
      const dataInicio = new Date(semanaInfo.data_inicio + 'T00:00:00');
      const dataFormatada = dataInicio.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
      
      return `
        <div class="bg-gradient-to-r from-teal-50 to-blue-50 rounded-xl shadow-lg p-6 mb-6">
          <!-- Cabeçalho da Semana -->
          <div class="flex items-center justify-between mb-4 pb-3 border-b-2 border-teal-200">
            <div>
              <h3 class="text-xl font-bold text-gray-800">
                <i class="fas fa-calendar-week text-teal-600 mr-2"></i>
                Semana ${semanaInfo.numero} – ${dataFormatada}
              </h3>
            </div>
            <div class="flex space-x-4 text-sm">
              <span class="bg-white px-3 py-1 rounded-full">
                <i class="fas fa-box text-gray-600 mr-1"></i>
                Total: <span class="font-semibold">${totalProdutos}</span>
              </span>
              <span class="bg-blue-100 px-3 py-1 rounded-full" title="Criados (aguardando aprovação)">
                <i class="fas fa-check-circle text-blue-600 mr-1"></i>
                <span class="font-semibold text-blue-600">${confirmados}</span>
              </span>
              <span class="bg-yellow-100 px-3 py-1 rounded-full" title="Ainda não criados">
                <i class="fas fa-clock text-yellow-600 mr-1"></i>
                <span class="font-semibold text-yellow-600">${pendentes}</span>
              </span>
            </div>
          </div>
          
          <!-- Lista de Produtos da Semana -->
          <div class="space-y-3">
            ${produtosDaSemana.map(p => {
              const checked = p.lancamento_id ? 'checked' : '';
              const bgColor = p.lancamento_id ? 'bg-blue-50' : 'bg-white';
              const borderColor = p.lancamento_id ? 'border-blue-500' : 'border-gray-300';
              
              // Calculate unit status
              const unitsConfirmed = p.units_confirmed || 0;
              const unitsPending = p.units_pending || 0;
              const totalUnits = p.quantidade_planejada;
              const hasUnits = p.units_count > 0;
              
              // Determine overall status
              let statusBadge = '';
              if (unitsConfirmed === totalUnits && totalUnits > 0) {
                statusBadge = `<span class="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold">
                  <i class="fas fa-check-double mr-1"></i>100% CONCLUÍDO
                </span>`;
              } else if (unitsConfirmed > 0 && unitsConfirmed < totalUnits) {
                statusBadge = `<span class="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold">
                  <i class="fas fa-spinner mr-1"></i>EM ANDAMENTO
                </span>`;
              } else {
                statusBadge = `<span class="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-semibold">
                  <i class="fas fa-clock mr-1"></i>PENDENTE
                </span>`;
              }
              
              return `
                <div class="${bgColor} border-2 ${borderColor} rounded-lg shadow-sm hover:shadow-md transition">
                  <!-- Product Header -->
                  <div class="p-4">
                    <div class="flex items-center justify-between">
                      <div class="flex-1">
                        <h4 class="text-base font-semibold text-gray-800 mb-2">${p.produto_nome}</h4>
                        <div class="flex items-center space-x-4">
                          <p class="text-sm text-gray-600">
                            <i class="fas fa-boxes text-teal-600 mr-1"></i>
                            <span class="font-semibold">${totalUnits}</span> unidade${totalUnits > 1 ? 's' : ''} planejada${totalUnits > 1 ? 's' : ''}
                          </p>
                          ${hasUnits ? `
                            <div class="flex items-center space-x-2">
                              <span class="text-sm text-green-600">
                                <i class="fas fa-check-circle mr-1"></i>
                                <span class="font-semibold">${unitsConfirmed}</span> confirmada${unitsConfirmed !== 1 ? 's' : ''}
                              </span>
                              ${unitsPending > 0 ? `
                                <span class="text-sm text-yellow-600">
                                  <i class="fas fa-hourglass-half mr-1"></i>
                                  <span class="font-semibold">${unitsPending}</span> pendente${unitsPending !== 1 ? 's' : ''}
                                </span>
                              ` : ''}
                            </div>
                          ` : ''}
                          ${p.lancamento_id && !hasUnits ? `
                            <p class="text-sm text-blue-600">
                              <i class="fas fa-check-circle mr-1"></i>
                              Criadas: <span class="font-semibold">${p.quantidade_criada || 0}</span>
                            </p>
                            ${p.quantidade_reprovada > 0 ? `
                              <p class="text-sm text-red-600">
                                <i class="fas fa-times-circle mr-1"></i>
                                Reprovadas: <span class="font-semibold">${p.quantidade_reprovada}</span>
                              </p>
                            ` : ''}
                            ${p.quantidade_aprovada > 0 ? `
                              <p class="text-sm text-green-600">
                                <i class="fas fa-check-double mr-1"></i>
                                Aprovadas: <span class="font-semibold">${p.quantidade_aprovada}</span>
                              </p>
                            ` : ''}
                          ` : ''}
                        </div>
                      </div>
                      <div class="ml-4 flex items-center space-x-2">
                        ${statusBadge}
                      </div>
                    </div>
                  </div>
                  
                  <!-- Units Section (Expandable) -->
                  <div class="border-t border-gray-200 p-4 bg-gray-50">
                    <div class="flex items-center justify-between mb-3">
                      <div class="flex items-center space-x-3">
                        <button 
                          id="toggle-btn-${p.id}"
                          onclick="toggleUnitsDisplay(${p.id})"
                          class="text-teal-600 hover:text-teal-700 text-sm font-semibold transition">
                          <i class="fas fa-chevron-down mr-1"></i>Ver Unidades
                        </button>
                        <span id="units-summary-${p.id}" class="text-xs text-gray-600">
                          ${hasUnits ? `<span class="font-semibold">${unitsConfirmed}/${totalUnits}</span> confirmadas` : ''}
                        </span>
                      </div>
                    </div>
                    
                    <div id="units-${p.id}" class="hidden space-y-2 mt-3">
                      <div id="units-list-${p.id}">
                        <!-- Units will be loaded here -->
                      </div>
                    </div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    }).join('');
    
  } catch (error) {
    loading.classList.add('hidden');
    console.error('Erro ao carregar produtos:', error);
    container.innerHTML = '<div class="bg-white rounded-xl shadow-md p-8 text-center"><p class="text-teal-500">Erro ao carregar produtos</p></div>';
  }
}

async function toggleProducaoSemanal(planejamento_id, designer_id, lancamento_id, semana_numero, semana_data_inicio) {
  const checkbox = document.getElementById(`checkbox-planejamento-${planejamento_id}`);
  
  try {
    if (lancamento_id) {
      // Desmarcar: deletar lançamento
      const res = await axios.delete(`${API_URL}/api/planejamento-semanal/${planejamento_id}/lancamento/${lancamento_id}`);
      
      if (res.data && res.data.success) {
        showNotification('Produção desmarcada com sucesso! ✓', 'success');
        await loadMeusProdutos();
      } else {
        throw new Error(res.data?.message || 'Erro ao desmarcar');
      }
    } else {
      // Marcar: criar lançamento
      const res = await axios.post(`${API_URL}/api/planejamento-semanal/${planejamento_id}/confirmar`, {
        designer_id,
        semana_numero,
        semana_data_inicio
      });
      
      if (res.data && res.data.success) {
        showNotification(res.data.message || 'Produção marcada como CRIADA! ✓', 'success');
        await loadMeusProdutos();
      } else {
        throw new Error(res.data?.message || 'Erro ao marcar');
      }
    }
  } catch (error) {
    console.error('Erro ao alternar produção:', error);
    const msg = error.response?.data?.message || error.response?.data?.error || error.message || 'Erro ao alterar produção';
    showNotification(msg, 'error');
    
    // Reverter checkbox
    if (checkbox) {
      checkbox.checked = !!lancamento_id;
    }
    
    // Recarregar lista
    loadMeusProdutos();
  }
}

async function toggleProducao(planejamento_id, designer_id, estaConfirmado) {
  const checkbox = document.getElementById(`checkbox-${planejamento_id}`);
  
  try {
    if (estaConfirmado) {
      // Desmarcar: deletar lançamento
      const res = await axios.delete(`${API_URL}/api/confirmar-producao`, {
        data: { planejamento_id, designer_id }
      });
      
      if (res.data && res.data.success) {
        showNotification('Produção desmarcada com sucesso! ✓', 'success');
        await loadMeusProdutos();
      } else {
        throw new Error(res.data?.message || 'Erro ao desmarcar');
      }
    } else {
      // Marcar: criar lançamento
      const res = await axios.post(`${API_URL}/api/confirmar-producao`, {
        planejamento_id,
        designer_id
      });
      
      if (res.data && res.data.success) {
        showNotification(res.data.message || 'Produção marcada como CRIADA! ✓', 'success');
        await loadMeusProdutos();
      } else {
        throw new Error(res.data?.message || 'Erro ao marcar');
      }
    }
  } catch (error) {
    console.error('Erro ao alternar produção:', error);
    const msg = error.response?.data?.message || error.response?.data?.error || error.message || 'Erro ao alterar produção';
    showNotification(msg, 'error');
    
    // Reverter checkbox
    if (checkbox) {
      checkbox.checked = estaConfirmado;
    }
    
    // Recarregar lista
    loadMeusProdutos();
  }
}

async function confirmarProducao(planejamento_id, designer_id) {
  try {
    const res = await axios.post(`${API_URL}/api/confirmar-producao`, {
      planejamento_id,
      designer_id
    });
    
    // Resposta padronizada: { success, message, ... }
    if (res.data && res.data.success) {
      showNotification(res.data.message || 'Produção registrada como CRIADA! ✓', 'success');
      await loadMeusProdutos();
    } else {
      throw new Error(res.data?.message || 'Resposta inválida do servidor');
    }
  } catch (error) {
    console.error('Erro ao confirmar produção:', error);
    const msg = error.response?.data?.message || error.response?.data?.error || error.message || 'Erro ao confirmar produção';
    showNotification(msg, 'error');
    // Recarregar para desfazer o check
    loadMeusProdutos();
  }
}

// Atualizar o showTab para incluir novos tabs
const originalShowTab = showTab;
showTab = function(tabName) {
  originalShowTab(tabName);
  
  if (tabName === 'planejamentos') {
    loadPlanejamentos();
  } else if (tabName === 'meus-produtos') {
    loadMeusProdutos();
  }
}

// Event listener para o formulário de planejamento
document.addEventListener('DOMContentLoaded', function() {
  const formPlanejamento = document.getElementById('formPlanejamento');
  if (formPlanejamento) {
    formPlanejamento.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
      const admin_id = userData.id;
      
      if (!admin_id) {
        showNotification('Erro: usuário não identificado', 'error');
        return;
      }
      
      const id = document.getElementById('planejamento-id').value;
      const produto_id = parseInt(document.getElementById('planejamento-produto').value);
      const quantidade_planejada = parseInt(document.getElementById('planejamento-quantidade').value);
      const periodo = document.getElementById('planejamento-periodo').value;
      
      if (!produto_id || !quantidade_planejada || !periodo) {
        showNotification('Por favor, preencha todos os campos obrigatórios', 'error');
        return;
      }
      
      // Extrair ano e semana do período (formato: 2026-W04)
      const [ano, semanaStr] = periodo.split('-W');
      const semana = parseInt(semanaStr);
      
      const data = {
        produto_id,
        quantidade_planejada,
        semana,
        ano: parseInt(ano),
        periodo,
        admin_id
      };
      
      try {
        let response;
        if (id) {
          // Atualizar
          response = await axios.put(`${API_URL}/api/produtos-planejados/${id}`, {
            quantidade_planejada: data.quantidade_planejada,
            status: 'pendente'
          });
          if (response.data && response.data.success) {
            showNotification(response.data.message || 'Planejamento atualizado com sucesso! ✓', 'success');
          }
        } else {
          // Criar
          response = await axios.post(`${API_URL}/api/produtos-planejados`, data);
          if (response.data && response.data.success) {
            showNotification(response.data.message || 'Planejamento criado com sucesso! ✓', 'success');
          }
        }
        
        hidePlanejamentoForm();
        await loadPlanejamentos();
      } catch (error) {
        console.error('Erro ao salvar planejamento:', error);
        const msg = error.response?.data?.message || error.response?.data?.error || 'Erro ao salvar planejamento';
        showNotification(msg, 'error');
      }
    });
  }
  
  // Configurar UI baseado no role
  setupRoleBasedUI();
  
  // Preencher select de produtos no form de planejamento
  async function preencherProdutosPlanejamento() {
    try {
      const res = await axios.get(`${API_URL}/api/produtos`);
      const produtos = res.data || [];
      const select = document.getElementById('planejamento-produto');
      if (select) {
        select.innerHTML = '<option value="">Selecione...</option>' +
          produtos.map(p => `<option value="${p.id}">${p.nome}</option>`).join('');
      }
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
    }
  }
  
  preencherProdutosPlanejamento();
  
  // Definir período padrão para semana atual (não mais mês)
  const hoje = new Date();
  const semanaAtual = getCurrentWeek(); // Usar função já existente
  const periodoInput = document.getElementById('planejamento-periodo');
  if (periodoInput) periodoInput.value = semanaAtual;
});

// ============================================
// DASHBOARD INDIVIDUAL DO DESIGNER
// ============================================

async function openDesignerDashboard(designerId) {
  const modal = document.getElementById('modalDesignerDashboard');
  const content = document.getElementById('dashboard-content');
  const loading = document.getElementById('dashboard-loading');
  const nomeEl = document.getElementById('modal-designer-nome');
  
  // Mostrar modal
  modal.classList.remove('hidden');
  loading.classList.remove('hidden');
  
  try {
    // Buscar estatísticas do designer
    const res = await axios.get(`${API_URL}/api/designers/${designerId}/stats`);
    const data = res.data;
    
    // Atualizar nome
    nomeEl.textContent = `Dashboard de ${data.designer.nome}`;
    
    // Esconder loading
    loading.classList.add('hidden');
    
    // Renderizar dashboard
    content.innerHTML = `
      <!-- Resumo Geral -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <div class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border-l-4 border-blue-500">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-600 text-sm font-medium">Total Criado</p>
              <p class="text-3xl font-bold text-gray-800 mt-1">${data.resumo.total_criado}</p>
              <p class="text-xs text-gray-500 mt-1">unidades produzidas</p>
            </div>
            <div class="bg-blue-200 rounded-full p-3">
              <i class="fas fa-boxes text-blue-700 text-xl"></i>
            </div>
          </div>
        </div>
        
        <div class="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border-l-4 border-green-500">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-600 text-sm font-medium">Total Aprovado</p>
              <p class="text-3xl font-bold text-gray-800 mt-1">${data.resumo.total_aprovado}</p>
              <p class="text-xs text-gray-500 mt-1">unidades aprovadas</p>
            </div>
            <div class="bg-green-200 rounded-full p-3">
              <i class="fas fa-check-circle text-green-700 text-xl"></i>
            </div>
          </div>
        </div>
        
        <div class="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border-l-4 border-purple-500">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-600 text-sm font-medium">Taxa de Aprovação</p>
              <p class="text-3xl font-bold text-gray-800 mt-1">${data.resumo.taxa_aprovacao}%</p>
              <p class="text-xs text-gray-500 mt-1">aprovação média</p>
            </div>
            <div class="bg-purple-200 rounded-full p-3">
              <i class="fas fa-percentage text-purple-700 text-xl"></i>
            </div>
          </div>
        </div>
        
        <div class="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-4 border-l-4 border-red-500">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-600 text-sm font-medium">Total Reprovado</p>
              <p class="text-3xl font-bold text-gray-800 mt-1">${data.resumo.total_reprovado || 0}</p>
              <p class="text-xs text-gray-500 mt-1">unidades reprovadas</p>
            </div>
            <div class="bg-red-200 rounded-full p-3">
              <i class="fas fa-times-circle text-red-700 text-xl"></i>
            </div>
          </div>
        </div>
        
        <div class="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border-l-4 border-orange-500">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-600 text-sm font-medium">Taxa de Reprovação</p>
              <p class="text-3xl font-bold text-gray-800 mt-1">${data.resumo.taxa_reprovacao || 0}%</p>
              <p class="text-xs text-gray-500 mt-1">reprovação média</p>
            </div>
            <div class="bg-orange-200 rounded-full p-3">
              <i class="fas fa-chart-line text-orange-700 text-xl"></i>
            </div>
          </div>
        </div>
        
        <div class="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-4 border-l-4 border-yellow-500">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-600 text-sm font-medium">Ranking</p>
              <p class="text-3xl font-bold text-gray-800 mt-1">${data.resumo.posicao_ranking}º</p>
              <p class="text-xs text-gray-500 mt-1">de ${data.resumo.total_designers} designers</p>
            </div>
            <div class="bg-yellow-200 rounded-full p-3">
              <i class="fas fa-trophy text-yellow-700 text-xl"></i>
            </div>
          </div>
        </div>
      </div>
      
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <!-- Gráfico de Status -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <h3 class="text-lg font-bold text-gray-800 mb-4">
            <i class="fas fa-chart-pie text-teal-600 mr-2"></i>
            Por Status
          </h3>
          <div class="space-y-3">
            ${data.por_status.map(s => {
              const cores = {
                'pendente': { bg: 'bg-yellow-100', text: 'text-yellow-800', bar: 'bg-yellow-500' },
                'em_andamento': { bg: 'bg-blue-100', text: 'text-blue-800', bar: 'bg-blue-500' },
                'aprovado': { bg: 'bg-green-100', text: 'text-green-800', bar: 'bg-green-500' },
                'reprovado': { bg: 'bg-red-100', text: 'text-red-800', bar: 'bg-red-500' }
              };
              const cor = cores[s.status] || { bg: 'bg-gray-100', text: 'text-gray-800', bar: 'bg-gray-500' };
              const percent = data.resumo.total_criado > 0 ? Math.round((s.total_criado / data.resumo.total_criado) * 100) : 0;
              
              return `
                <div>
                  <div class="flex justify-between items-center mb-1">
                    <span class="text-sm font-medium text-gray-700 capitalize">${s.status.replace('_', ' ')}</span>
                    <span class="text-sm font-semibold ${cor.text}">${s.quantidade} lançamentos</span>
                  </div>
                  <div class="w-full bg-gray-200 rounded-full h-3">
                    <div class="${cor.bar} h-3 rounded-full" style="width: ${percent}%"></div>
                  </div>
                  <div class="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Criado: ${s.total_criado}</span>
                    <span>Aprovado: ${s.total_aprovado}</span>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
        
        <!-- Ranking Comparativo -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <h3 class="text-lg font-bold text-gray-800 mb-4">
            <i class="fas fa-users text-teal-600 mr-2"></i>
            Ranking de Designers
          </h3>
          <div class="space-y-2 max-h-80 overflow-y-auto">
            ${data.ranking.slice(0, 10).map((d, index) => {
              const isCurrentDesigner = d.id === parseInt(designerId);
              const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}º`;
              
              return `
                <div class="${isCurrentDesigner ? 'bg-teal-100 border-2 border-teal-500' : 'bg-gray-50 border border-gray-200'} rounded-lg p-3">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-3 flex-1">
                      <span class="text-lg font-bold ${isCurrentDesigner ? 'text-teal-600' : 'text-gray-600'}">${medal}</span>
                      <div class="flex-1">
                        <p class="font-semibold ${isCurrentDesigner ? 'text-teal-800' : 'text-gray-800'}">${d.nome}</p>
                        <p class="text-xs text-gray-600">
                          Criado: ${d.total_criado} | Aprovado: ${d.total_aprovado}
                        </p>
                      </div>
                    </div>
                    <div class="text-right">
                      <div class="text-lg font-bold ${d.taxa_aprovacao >= 80 ? 'text-green-600' : d.taxa_aprovacao >= 50 ? 'text-yellow-600' : 'text-red-600'}">
                        ${d.taxa_aprovacao}%
                      </div>
                    </div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>
      
      <!-- Últimos Lançamentos -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h3 class="text-lg font-bold text-gray-800 mb-4">
          <i class="fas fa-history text-teal-600 mr-2"></i>
          Últimos 10 Lançamentos
        </h3>
        <div class="overflow-x-auto">
          <table class="min-w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-2 text-left text-xs font-semibold text-gray-600">Data</th>
                <th class="px-4 py-2 text-left text-xs font-semibold text-gray-600">Produto</th>
                <th class="px-4 py-2 text-center text-xs font-semibold text-gray-600">Criado</th>
                <th class="px-4 py-2 text-center text-xs font-semibold text-gray-600">Aprovado</th>
                <th class="px-4 py-2 text-center text-xs font-semibold text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              ${data.ultimos_lancamentos.map(l => {
                const statusCores = {
                  'pendente': { bg: 'bg-yellow-100', text: 'text-yellow-800' },
                  'em_andamento': { bg: 'bg-blue-100', text: 'text-blue-800' },
                  'aprovado': { bg: 'bg-green-100', text: 'text-green-800' },
                  'reprovado': { bg: 'bg-red-100', text: 'text-red-800' }
                };
                const cor = statusCores[l.status] || { bg: 'bg-gray-100', text: 'text-gray-800' };
                
                return `
                  <tr class="hover:bg-gray-50">
                    <td class="px-4 py-3 text-sm text-gray-700">${new Date(l.data).toLocaleDateString('pt-BR')}</td>
                    <td class="px-4 py-3 text-sm font-medium text-gray-800">${l.produto_nome}</td>
                    <td class="px-4 py-3 text-sm text-center font-semibold text-blue-600">${l.quantidade_criada}</td>
                    <td class="px-4 py-3 text-sm text-center font-semibold text-green-600">${l.quantidade_aprovada}</td>
                    <td class="px-4 py-3 text-center">
                      <span class="${cor.bg} ${cor.text} px-2 py-1 rounded-full text-xs font-semibold capitalize">
                        ${l.status.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
    
  } catch (error) {
    console.error('Erro ao carregar dashboard:', error);
    loading.classList.add('hidden');
    content.innerHTML = `
      <div class="text-center py-12">
        <i class="fas fa-exclamation-triangle text-red-500 text-5xl mb-4"></i>
        <p class="text-gray-600">Erro ao carregar estatísticas do designer</p>
        <button onclick="closeDesignerDashboard()" class="mt-4 bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700">
          Fechar
        </button>
      </div>
    `;
  }
}

function closeDesignerDashboard() {
  const modal = document.getElementById('modalDesignerDashboard');
  modal.classList.add('hidden');
}

// ============================================
// SISTEMA DE APROVAÇÕES
// ============================================

let filtroAprovacao = 'pendente';

async function loadAprovacoes() {
  const container = document.getElementById('listaAprovacoes');
  const loading = document.getElementById('aprovacoes-loading');
  
  loading.classList.remove('hidden');
  
  try {
    const url = `${API_URL}/api/aprovacoes?status=${filtroAprovacao}`;
    const res = await axios.get(url);
    const aprovacoes = res.data || [];
    
    loading.classList.add('hidden');
    
    // Atualizar estatísticas
    const pendentes = aprovacoes.filter(a => a.aprovado_ok === 0 && a.status === 'em_andamento').length;
    const hoje = getBrasiliaDateTime('date');
    const aprovadosHoje = aprovacoes.filter(a => a.aprovado_ok === 1 && a.concluido_em?.startsWith(hoje)).length;
    const totalCriados = aprovacoes.length;
    const totalAprovados = aprovacoes.filter(a => a.aprovado_ok === 1).length;
    const taxa = totalCriados > 0 ? Math.round((totalAprovados / totalCriados) * 100) : 0;
    
    document.getElementById('aprovacoes-pendentes').textContent = pendentes;
    document.getElementById('aprovacoes-hoje').textContent = aprovadosHoje;
    document.getElementById('aprovacoes-taxa').textContent = taxa + '%';
    document.getElementById('aprovacoes-total').textContent = totalCriados;
    
    if (aprovacoes.length === 0) {
      container.innerHTML = `
        <div class="bg-white rounded-lg shadow-md p-12 text-center">
          <i class="fas fa-check-circle text-green-500 text-6xl mb-4"></i>
          <p class="text-gray-600 text-lg">Nenhum lançamento ${filtroAprovacao === 'pendente' ? 'pendente de aprovação' : 'encontrado'}</p>
        </div>
      `;
      return;
    }
    
    // Renderizar lista
    container.innerHTML = aprovacoes.map(a => {
      const statusCores = {
        'em_andamento': { bg: 'bg-blue-50', border: 'border-blue-300', badge: 'bg-blue-100 text-blue-800' },
        'aprovado': { bg: 'bg-green-50', border: 'border-green-300', badge: 'bg-green-100 text-green-800' },
        'reprovado': { bg: 'bg-red-50', border: 'border-red-300', badge: 'bg-red-100 text-red-800' }
      };
      const cor = statusCores[a.status] || { bg: 'bg-gray-50', border: 'border-gray-300', badge: 'bg-gray-100 text-gray-800' };
      
      const isPendente = a.aprovado_ok === 0 && a.status === 'em_andamento';
      
      return `
        <div class="${cor.bg} border-2 ${cor.border} rounded-xl p-6 hover:shadow-lg transition">
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <div class="flex items-center space-x-3 mb-3">
                <div class="bg-teal-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold">
                  ${a.designer_nome.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 class="text-lg font-bold text-gray-800">${a.designer_nome}</h3>
                  <p class="text-sm text-gray-600">
                    <i class="fas fa-box text-teal-600 mr-1"></i>
                    ${a.produto_nome}
                  </p>
                </div>
                <span class="${cor.badge} px-3 py-1 rounded-full text-xs font-semibold capitalize">
                  ${a.status === 'em_andamento' ? 'Pendente' : a.status}
                </span>
              </div>
              
              <div class="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                <div>
                  <p class="text-xs text-gray-500">Quantidade Criada</p>
                  <p class="text-xl font-bold text-blue-600">${a.quantidade_criada}</p>
                </div>
                <div>
                  <p class="text-xs text-gray-500">Quantidade Reprovada</p>
                  <p class="text-xl font-bold text-red-600">${a.quantidade_reprovada || 0}</p>
                </div>
                <div>
                  <p class="text-xs text-gray-500">Quantidade Aprovada</p>
                  <p class="text-xl font-bold text-green-600">${a.quantidade_aprovada}</p>
                </div>
                <div>
                  <p class="text-xs text-gray-500">Data</p>
                  <p class="text-sm font-semibold text-gray-700">${new Date(a.data).toLocaleDateString('pt-BR')}</p>
                </div>
                <div>
                  <p class="text-xs text-gray-500">Criado em</p>
                  <p class="text-sm font-semibold text-gray-700">${new Date(a.concluido_em).toLocaleString('pt-BR')}</p>
                </div>
              </div>
              
              ${isPendente ? `
                <div class="flex space-x-3">
                  <button onclick="aprovarLancamento(${a.id})" class="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition shadow-md">
                    <i class="fas fa-check mr-2"></i>Aprovar
                  </button>
                  <button onclick="reprovarLancamento(${a.id})" class="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition shadow-md">
                    <i class="fas fa-times mr-2"></i>Reprovar
                  </button>
                </div>
              ` : `
                <div class="text-sm text-gray-600">
                  <i class="fas fa-info-circle mr-2"></i>
                  ${a.aprovado_ok === 1 ? 'Aprovado' : 'Reprovado'} - ${a.observacoes || 'Sem observações'}
                </div>
              `}
            </div>
          </div>
        </div>
      `;
    }).join('');
    
  } catch (error) {
    console.error('Erro ao carregar aprovações:', error);
    loading.classList.add('hidden');
    container.innerHTML = `
      <div class="bg-red-50 border-2 border-red-200 rounded-lg p-8 text-center">
        <i class="fas fa-exclamation-triangle text-red-500 text-5xl mb-4"></i>
        <p class="text-red-600">Erro ao carregar aprovações</p>
      </div>
    `;
  }
}

function filtrarAprovacoes(filtro) {
  filtroAprovacao = filtro;
  loadAprovacoes();
}

// ============================================
// EDIÇÃO DE PERFIL E MUDANÇA DE SENHA
// ============================================
async function openEditProfile() {
  const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
  
  if (!userData.id) {
    showNotification('Erro: usuário não identificado', 'error');
    return;
  }
  
  // Preencher dados atuais
  document.getElementById('edit-profile-nome').value = userData.nome || '';
  document.getElementById('edit-profile-id').value = userData.id;
  
  // Mostrar modal
  document.getElementById('modalEditProfile').classList.remove('hidden');
}

function closeEditProfile() {
  document.getElementById('modalEditProfile').classList.add('hidden');
  document.getElementById('formEditProfile').reset();
}

async function saveProfile() {
  const nome = document.getElementById('edit-profile-nome').value;
  const id = document.getElementById('edit-profile-id').value;
  
  if (!nome.trim()) {
    showNotification('Nome é obrigatório', 'error');
    return;
  }
  
  try {
    const res = await axios.put(`${API_URL}/api/perfil/${id}`, { nome });
    
    if (res.data && res.data.success) {
      // Atualizar localStorage
      const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
      userData.nome = nome;
      localStorage.setItem('user_data', JSON.stringify(userData));
      
      // Atualizar UI
      const userNameElements = document.querySelectorAll('#userName');
      userNameElements.forEach(el => el.textContent = nome);
      
      showNotification('Perfil atualizado com sucesso! ✓', 'success');
      closeEditProfile();
    }
  } catch (error) {
    console.error('Erro ao salvar perfil:', error);
    const msg = error.response?.data?.message || 'Erro ao salvar perfil';
    showNotification(msg, 'error');
  }
}

async function savePassword() {
  const senhaAtual = document.getElementById('senha-atual').value;
  const senhaNova = document.getElementById('senha-nova').value;
  const senhaConfirma = document.getElementById('senha-confirma').value;
  const id = document.getElementById('edit-profile-id').value;
  
  if (!senhaAtual || !senhaNova || !senhaConfirma) {
    showNotification('Preencha todos os campos de senha', 'error');
    return;
  }
  
  if (senhaNova !== senhaConfirma) {
    showNotification('Nova senha e confirmação não coincidem', 'error');
    return;
  }
  
  if (senhaNova.length < 6) {
    showNotification('Senha deve ter pelo menos 6 caracteres', 'error');
    return;
  }
  
  try {
    const res = await axios.put(`${API_URL}/api/perfil/${id}/senha`, {
      senha_atual: senhaAtual,
      senha_nova: senhaNova
    });
    
    if (res.data && res.data.success) {
      showNotification('Senha alterada com sucesso! ✓', 'success');
      closeEditProfile();
      document.getElementById('formEditProfile').reset();
    }
  } catch (error) {
    console.error('Erro ao alterar senha:', error);
    const msg = error.response?.data?.message || 'Erro ao alterar senha';
    showNotification(msg, 'error');
  }
}

// ============================================
// EXPOR FUNÇÕES NO ESCOPO GLOBAL (window)
// ============================================
window.showPlanejamentoForm = showPlanejamentoForm;
window.hidePlanejamentoForm = hidePlanejamentoForm;
window.editPlanejamento = editPlanejamento;
window.deletePlanejamento = deletePlanejamento;
window.confirmarProducao = confirmarProducao;
window.toggleProducao = toggleProducao;
window.toggleProducaoSemanal = toggleProducaoSemanal;
window.loadMeusProdutos = loadMeusProdutos;
window.deleteDesigner = deleteDesigner;
window.deleteProduto = deleteProduto;
window.handleSaveMeta = handleSaveMeta;
window.editMeta = editMeta;
window.deleteMeta = deleteMeta;
window.aprovarMeta = aprovarMeta;
window.loadTop6Metas = loadTop6Metas;
window.deleteLancamento = deleteLancamento;
window.showTab = showTab;
window.handleLogout = handleLogout;
window.openDesignerDashboard = openDesignerDashboard;
window.closeDesignerDashboard = closeDesignerDashboard;
window.loadAprovacoes = loadAprovacoes;
window.filtrarAprovacoes = filtrarAprovacoes;
window.aprovarLancamento = aprovarLancamento;
window.reprovarLancamento = reprovarLancamento;
window.openEditProfile = openEditProfile;
window.closeEditProfile = closeEditProfile;
window.saveProfile = saveProfile;
window.savePassword = savePassword;
window.editLancamento = editLancamento;
window.closeEditModal = closeEditModal;
window.deleteLancamento = deleteLancamento;

// Mobile Menu Toggle
function toggleMobileMenu() {
  const mobileMenu = document.getElementById('mobile-menu');
  const menuButton = document.getElementById('mobile-menu-button');
  
  if (mobileMenu.classList.contains('hidden')) {
    mobileMenu.classList.remove('hidden');
    menuButton.innerHTML = '<i class="fas fa-times text-2xl"></i>';
  } else {
    mobileMenu.classList.add('hidden');
    menuButton.innerHTML = '<i class="fas fa-bars text-2xl"></i>';
  }
}

window.toggleMobileMenu = toggleMobileMenu;

// ===========================
// USER SETTINGS / CONFIGURAÇÕES
// ===========================

// Load user profile
async function loadUserProfile() {
  try {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      showNotification('Sessão expirada. Faça login novamente.', 'error');
      setTimeout(() => window.location.href = '/login', 2000);
      return;
    }

    const response = await axios.get(`${API_URL}/api/user/profile`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (response.data.success) {
      const profile = response.data.data;
      
      // Fill profile form
      document.getElementById('profile-nome').value = profile.nome || '';
      document.getElementById('profile-email').value = profile.email || '';
      document.getElementById('profile-nome-exibicao').value = profile.nome_exibicao || '';
      
      // Update avatar preview
      updateAvatarPreview(profile.foto_perfil, profile.nome);
      
      // Setup event listeners (important: do this after DOM is ready)
      setupSettingsListeners();
      
      return profile;
    } else {
      showNotification('Erro ao carregar perfil', 'error');
    }
  } catch (error) {
    console.error('Erro ao carregar perfil:', error);
    showNotification('Erro ao carregar perfil', 'error');
  }
}

// Setup event listeners for settings page
function setupSettingsListeners() {
  const avatarUpload = document.getElementById('avatar-upload');
  if (avatarUpload && !avatarUpload.dataset.listenerAdded) {
    avatarUpload.addEventListener('change', handleAvatarUpload);
    avatarUpload.dataset.listenerAdded = 'true';
  }
  
  const formProfile = document.getElementById('form-profile');
  if (formProfile && !formProfile.dataset.listenerAdded) {
    formProfile.addEventListener('submit', handleSaveProfile);
    formProfile.dataset.listenerAdded = 'true';
  }
  
  const formPassword = document.getElementById('form-password');
  if (formPassword && !formPassword.dataset.listenerAdded) {
    formPassword.addEventListener('submit', handleChangePassword);
    formPassword.dataset.listenerAdded = 'true';
  }
}

// Update avatar preview
function updateAvatarPreview(foto_perfil, nome) {
  const preview = document.getElementById('avatar-preview');
  if (!preview) return;
  
  if (foto_perfil) {
    preview.innerHTML = `<img src="${foto_perfil}" alt="Avatar" class="w-full h-full object-cover">`;
  } else {
    // Show initials
    const initials = nome ? nome.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() : 'U';
    preview.innerHTML = `<span class="text-4xl">${initials}</span>`;
  }
}

// Handle avatar upload
async function handleAvatarUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  // Validate file type
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    showNotification('Formato inválido. Use: JPG, PNG ou WEBP', 'error');
    event.target.value = ''; // Reset input
    return;
  }
  
  // Validate file size (500KB)
  if (file.size > 500 * 1024) {
    showNotification('Imagem muito grande. Máximo: 500KB', 'error');
    event.target.value = ''; // Reset input
    return;
  }
  
  try {
    // Show loading state
    const preview = document.getElementById('avatar-preview');
    const originalHTML = preview.innerHTML;
    preview.innerHTML = '<i class="fas fa-spinner fa-spin text-3xl text-teal-600"></i>';
    
    // Convert to base64
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const dataUrl = reader.result;
        
        // Save to server
        const token = localStorage.getItem('auth_token');
        if (!token) {
          showNotification('Sessão expirada. Faça login novamente.', 'error');
          setTimeout(() => window.location.href = '/login', 2000);
          return;
        }
        
        const response = await axios.put(`${API_URL}/api/user/avatar`, {
          foto_perfil: dataUrl
        }, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.data && response.data.success) {
          // Update AppState
          if (AppState.currentUser) {
            AppState.currentUser.foto_perfil = dataUrl;
          }
          
          // Update localStorage
          const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
          userData.foto_perfil = dataUrl;
          localStorage.setItem('user_data', JSON.stringify(userData));
          
          // Update preview immediately
          updateAvatarPreview(dataUrl, AppState.currentUser?.nome);
          
          // Update avatar in header
          updateUserInfo();
          
          showNotification('✓ Foto de perfil atualizada!', 'success');
        } else {
          preview.innerHTML = originalHTML;
          showNotification(response.data?.message || 'Erro ao salvar foto', 'error');
        }
      } catch (error) {
        preview.innerHTML = originalHTML;
        console.error('Erro ao fazer upload da foto:', error);
        const errorMessage = error.response?.data?.message || 
                            error.response?.statusText || 
                            'Erro ao fazer upload da foto';
        showNotification(errorMessage, 'error');
      }
    };
    
    reader.onerror = () => {
      preview.innerHTML = originalHTML;
      showNotification('Erro ao ler arquivo de imagem', 'error');
    };
    
    reader.readAsDataURL(file);
  } catch (error) {
    console.error('Erro ao fazer upload da foto:', error);
    showNotification('Erro ao fazer upload da foto', 'error');
    event.target.value = ''; // Reset input
  }
}

// Save profile
async function handleSaveProfile(event) {
  event.preventDefault();
  
  const nome = document.getElementById('profile-nome').value.trim();
  const email = document.getElementById('profile-email').value.trim();
  const nome_exibicao = document.getElementById('profile-nome-exibicao').value.trim();
  
  if (!nome) {
    showNotification('Nome é obrigatório', 'error');
    return;
  }
  
  const btn = document.getElementById('btn-save-profile');
  const originalHTML = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Salvando...';
  
  try {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      showNotification('Sessão expirada. Faça login novamente.', 'error');
      setTimeout(() => window.location.href = '/login', 2000);
      return;
    }
    
    const response = await axios.put(`${API_URL}/api/user/profile`, {
      nome,
      email: email || null,
      nome_exibicao: nome_exibicao || null
    }, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (response.data && response.data.success) {
      // Update AppState
      if (AppState.currentUser) {
        AppState.currentUser.nome = response.data.data.nome;
        AppState.currentUser.email = response.data.data.email;
        AppState.currentUser.nome_exibicao = response.data.data.nome_exibicao;
        if (response.data.data.foto_perfil) {
          AppState.currentUser.foto_perfil = response.data.data.foto_perfil;
        }
      }
      
      // Update user data in localStorage
      const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
      userData.nome = response.data.data.nome;
      userData.email = response.data.data.email;
      userData.nome_exibicao = response.data.data.nome_exibicao;
      if (response.data.data.foto_perfil) {
        userData.foto_perfil = response.data.data.foto_perfil;
      }
      localStorage.setItem('user_data', JSON.stringify(userData));
      
      // Update UI
      updateUserInfo();
      
      showNotification('✓ Perfil atualizado com sucesso!', 'success');
    } else {
      showNotification(response.data?.message || 'Erro ao salvar perfil', 'error');
    }
  } catch (error) {
    console.error('Erro ao salvar perfil:', error);
    const errorMessage = error.response?.data?.message || 
                        error.response?.statusText || 
                        error.message || 
                        'Erro ao salvar perfil';
    showNotification(errorMessage, 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = originalHTML;
  }
}

// Change password
async function handleChangePassword(event) {
  event.preventDefault();
  
  const senha_atual = document.getElementById('password-atual').value;
  const senha_nova = document.getElementById('password-nova').value;
  const senha_confirmacao = document.getElementById('password-confirmacao').value;
  
  if (!senha_atual || !senha_nova || !senha_confirmacao) {
    showNotification('Todos os campos são obrigatórios', 'error');
    return;
  }
  
  if (senha_nova !== senha_confirmacao) {
    showNotification('Nova senha e confirmação não coincidem', 'error');
    return;
  }
  
  if (senha_nova.length < 6) {
    showNotification('Nova senha deve ter no mínimo 6 caracteres', 'error');
    return;
  }
  
  const btn = document.getElementById('btn-change-password');
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Alterando...';
  
  try {
    const token = localStorage.getItem('auth_token');
    const response = await axios.put(`${API_URL}/api/user/password`, {
      senha_atual,
      senha_nova,
      senha_confirmacao
    }, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (response.data.success) {
      showNotification('Senha alterada com sucesso!', 'success');
      
      // Clear form
      document.getElementById('form-password').reset();
    } else {
      showNotification(response.data.message || 'Erro ao alterar senha', 'error');
    }
  } catch (error) {
    console.error('Erro ao alterar senha:', error);
    showNotification(error.response?.data?.message || 'Erro ao alterar senha', 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-key mr-2"></i>Alterar Senha';
  }
}

// Toggle password visibility
function togglePassword(inputId) {
  const input = document.getElementById(inputId);
  const button = input.nextElementSibling;
  const icon = button.querySelector('i');
  
  if (input.type === 'password') {
    input.type = 'text';
    icon.classList.remove('fa-eye');
    icon.classList.add('fa-eye-slash');
  } else {
    input.type = 'password';
    icon.classList.remove('fa-eye-slash');
    icon.classList.add('fa-eye');
  }
}

// Update header avatar
function updateHeaderAvatar(foto_perfil) {
  // This will be called when avatar changes
  // Update header user info to include avatar
  updateUserInfo();
}

// Expose functions globally
window.loadUserProfile = loadUserProfile;
window.handleAvatarUpload = handleAvatarUpload;
window.handleSaveProfile = handleSaveProfile;
window.handleChangePassword = handleChangePassword;
window.togglePassword = togglePassword;

// ===== USER MANAGEMENT FUNCTIONS (ADMIN ONLY) =====

// Load all users
async function loadAllUsers() {
  const token = localStorage.getItem('auth_token');
  if (!token) {
    showNotification('Sessão expirada', 'error');
    return;
  }
  
  const container = document.getElementById('users-table-container');
  const loading = document.getElementById('users-loading');
  
  loading.classList.remove('hidden');
  container.innerHTML = '';
  
  try {
    const response = await axios.get(`${API_URL}/api/admin/users`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (response.data.success) {
      renderUsersTable(response.data.users);
    } else {
      showNotification(response.data.message || 'Erro ao carregar usuários', 'error');
    }
  } catch (error) {
    console.error('Erro ao carregar usuários:', error);
    showNotification('Erro ao carregar usuários', 'error');
  } finally {
    loading.classList.add('hidden');
  }
}

// Render users table
function renderUsersTable(users) {
  const container = document.getElementById('users-table-container');
  
  if (users.length === 0) {
    container.innerHTML = `
      <div class="text-center py-12">
        <i class="fas fa-users text-5xl text-gray-300 mb-4"></i>
        <p class="text-gray-500">Nenhum usuário encontrado</p>
      </div>
    `;
    return;
  }
  
  const tableHTML = `
    <table class="min-w-full divide-y divide-gray-200">
      <thead class="bg-gray-50">
        <tr>
          <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avatar</th>
          <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
          <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">E-mail</th>
          <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Função</th>
          <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
          <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
        </tr>
      </thead>
      <tbody class="bg-white divide-y divide-gray-200">
        ${users.map(user => `
          <tr class="hover:bg-gray-50">
            <td class="px-4 py-3 whitespace-nowrap">
              <div class="flex items-center">
                ${user.foto_perfil 
                  ? `<img src="${user.foto_perfil}" class="w-10 h-10 rounded-full object-cover" alt="${user.nome}">` 
                  : `<div class="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 font-bold">${user.nome.substring(0, 2).toUpperCase()}</div>`
                }
              </div>
            </td>
            <td class="px-4 py-3 whitespace-nowrap">
              <div class="text-sm font-medium text-gray-900">${user.nome}</div>
              ${user.nome_exibicao ? `<div class="text-xs text-gray-500">${user.nome_exibicao}</div>` : ''}
            </td>
            <td class="px-4 py-3 whitespace-nowrap">
              <div class="text-sm text-gray-900">${user.email || '<span class="text-gray-400">Não informado</span>'}</div>
            </td>
            <td class="px-4 py-3 whitespace-nowrap">
              <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}">
                ${user.role === 'admin' ? '<i class="fas fa-crown mr-1"></i>Admin' : '<i class="fas fa-user mr-1"></i>Usuário'}
              </span>
            </td>
            <td class="px-4 py-3 whitespace-nowrap">
              <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.ativo === 1 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                ${user.ativo === 1 ? '<i class="fas fa-check-circle mr-1"></i>Ativo' : '<i class="fas fa-times-circle mr-1"></i>Inativo'}
              </span>
            </td>
            <td class="px-4 py-3 whitespace-nowrap text-sm font-medium">
              <button onclick="openEditUserModal(${user.id})" class="text-teal-600 hover:text-teal-900 mr-3" title="Editar">
                <i class="fas fa-edit"></i>
              </button>
              <button onclick="openDeleteUserModal(${user.id}, '${user.nome.replace(/'/g, "\\'")}', '${user.email || ''}', '${user.foto_perfil || ''}')" class="text-red-600 hover:text-red-900" title="Excluir">
                <i class="fas fa-trash-alt"></i>
              </button>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
  
  container.innerHTML = tableHTML;
}

// Open edit user modal
let currentEditUserId = null;
let currentEditUserAvatarFile = null;

async function openEditUserModal(userId) {
  const token = localStorage.getItem('auth_token');
  if (!token) {
    showNotification('Sessão expirada', 'error');
    return;
  }
  
  try {
    const response = await axios.get(`${API_URL}/api/admin/users/${userId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (response.data.success) {
      const user = response.data.user;
      currentEditUserId = userId;
      currentEditUserAvatarFile = null;
      
      // Fill form
      document.getElementById('edit-user-id').value = user.id;
      document.getElementById('edit-user-nome').value = user.nome || '';
      document.getElementById('edit-user-nome-exibicao').value = user.nome_exibicao || '';
      document.getElementById('edit-user-email').value = user.email || '';
      document.getElementById('edit-user-role').value = user.role || 'user';
      document.getElementById('edit-user-ativo').value = user.ativo === 1 ? '1' : '0';
      document.getElementById('edit-user-senha').value = '';
      
      // Update avatar preview
      const avatarPreview = document.getElementById('edit-avatar-preview');
      if (user.foto_perfil) {
        avatarPreview.innerHTML = `<img src="${user.foto_perfil}" class="w-full h-full object-cover" alt="${user.nome}">`;
      } else {
        avatarPreview.innerHTML = `<i class="fas fa-user"></i>`;
      }
      
      // Setup avatar upload listener
      const avatarUpload = document.getElementById('edit-avatar-upload');
      avatarUpload.replaceWith(avatarUpload.cloneNode(true)); // Remove old listeners
      document.getElementById('edit-avatar-upload').addEventListener('change', handleEditUserAvatarUpload);
      
      // Setup form submit listener
      const form = document.getElementById('formEditUser');
      form.replaceWith(form.cloneNode(true)); // Remove old listeners
      document.getElementById('formEditUser').addEventListener('submit', handleSaveEditUser);
      
      // Show modal
      document.getElementById('modalEditUser').classList.remove('hidden');
      document.getElementById('modalEditUser').classList.add('flex');
    } else {
      showNotification(response.data.message || 'Erro ao carregar usuário', 'error');
    }
  } catch (error) {
    console.error('Erro ao carregar usuário:', error);
    showNotification('Erro ao carregar usuário', 'error');
  }
}

// Close edit user modal
function closeEditUserModal() {
  document.getElementById('modalEditUser').classList.add('hidden');
  document.getElementById('modalEditUser').classList.remove('flex');
  currentEditUserId = null;
  currentEditUserAvatarFile = null;
}

// Handle edit user avatar upload
async function handleEditUserAvatarUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  // Validation
  if (!file.type.startsWith('image/')) {
    showNotification('Por favor, selecione uma imagem válida', 'error');
    return;
  }
  
  if (file.size > 500 * 1024) {
    showNotification('Imagem muito grande. Máximo: 500KB', 'error');
    return;
  }
  
  // Convert to base64 and preview
  const reader = new FileReader();
  reader.onload = (e) => {
    const dataUrl = e.target.result;
    currentEditUserAvatarFile = dataUrl;
    
    // Update preview
    const preview = document.getElementById('edit-avatar-preview');
    preview.innerHTML = `<img src="${dataUrl}" class="w-full h-full object-cover" alt="Preview">`;
  };
  reader.readAsDataURL(file);
}

// Handle save edit user
async function handleSaveEditUser(event) {
  event.preventDefault();
  
  const token = localStorage.getItem('auth_token');
  if (!token || !currentEditUserId) {
    showNotification('Sessão expirada', 'error');
    return;
  }
  
  const btn = document.getElementById('btn-save-user');
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Salvando...';
  
  try {
    // 1. Update profile
    const profileData = {
      nome: document.getElementById('edit-user-nome').value,
      nome_exibicao: document.getElementById('edit-user-nome-exibicao').value,
      email: document.getElementById('edit-user-email').value,
      role: document.getElementById('edit-user-role').value,
      ativo: document.getElementById('edit-user-ativo').value === '1' ? 1 : 0
    };
    
    const profileResponse = await axios.put(
      `${API_URL}/api/admin/users/${currentEditUserId}/profile`,
      profileData,
      { headers: { 'Authorization': `Bearer ${token}` } }
    );
    
    if (!profileResponse.data.success) {
      throw new Error(profileResponse.data.message || 'Erro ao atualizar perfil');
    }
    
    // 2. Update avatar if changed
    if (currentEditUserAvatarFile) {
      const avatarResponse = await axios.put(
        `${API_URL}/api/admin/users/${currentEditUserId}/avatar`,
        { foto_perfil: currentEditUserAvatarFile },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      if (!avatarResponse.data.success) {
        throw new Error(avatarResponse.data.message || 'Erro ao atualizar avatar');
      }
    }
    
    // 3. Update password if provided
    const newPassword = document.getElementById('edit-user-senha').value;
    if (newPassword && newPassword.trim()) {
      const passwordResponse = await axios.put(
        `${API_URL}/api/admin/users/${currentEditUserId}/password`,
        { senha_nova: newPassword },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      if (!passwordResponse.data.success) {
        throw new Error(passwordResponse.data.message || 'Erro ao atualizar senha');
      }
    }
    
    showNotification('Usuário atualizado com sucesso!', 'success');
    closeEditUserModal();
    loadAllUsers(); // Reload list
    
  } catch (error) {
    console.error('Erro ao salvar usuário:', error);
    showNotification(error.message || 'Erro ao salvar usuário', 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-save mr-2"></i>Salvar Alterações';
  }
}

// ===== DELETE USER FUNCTIONS =====

// Store user to delete
let userToDelete = null;

// Open delete confirmation modal
function openDeleteUserModal(userId, userName, userEmail, userAvatar) {
  userToDelete = { id: userId, nome: userName, email: userEmail, foto_perfil: userAvatar };
  
  // Fill modal with user info
  document.getElementById('delete-user-name').textContent = userName;
  document.getElementById('delete-user-email').textContent = userEmail || 'Não informado';
  
  // Update avatar
  const avatarDiv = document.getElementById('delete-user-avatar');
  if (userAvatar) {
    avatarDiv.innerHTML = `<img src="${userAvatar}" class="w-full h-full object-cover rounded-full" alt="${userName}">`;
  } else {
    const initials = userName.substring(0, 2).toUpperCase();
    avatarDiv.innerHTML = `<span class="text-lg">${initials}</span>`;
  }
  
  // Show modal
  document.getElementById('modalConfirmDelete').classList.remove('hidden');
  document.getElementById('modalConfirmDelete').classList.add('flex');
}

// Close delete modal
function closeDeleteModal() {
  document.getElementById('modalConfirmDelete').classList.add('hidden');
  document.getElementById('modalConfirmDelete').classList.remove('flex');
  userToDelete = null;
}

// Confirm and execute delete
async function confirmDeleteUser() {
  if (!userToDelete) {
    showNotification('Nenhum usuário selecionado', 'error');
    return;
  }
  
  const token = localStorage.getItem('auth_token');
  if (!token) {
    showNotification('Sessão expirada', 'error');
    return;
  }
  
  const btn = document.getElementById('btn-confirm-delete');
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Excluindo...';
  
  try {
    const response = await axios.delete(
      `${API_URL}/api/admin/users/${userToDelete.id}`,
      { headers: { 'Authorization': `Bearer ${token}` } }
    );
    
    if (response.data.success) {
      showNotification(response.data.message || 'Usuário excluído com sucesso!', 'success');
      closeDeleteModal();
      loadAllUsers(); // Reload list
    } else {
      showNotification(response.data.message || 'Erro ao excluir usuário', 'error');
    }
  } catch (error) {
    console.error('Erro ao excluir usuário:', error);
    showNotification(error.response?.data?.message || 'Erro ao excluir usuário', 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-trash-alt mr-2"></i>Excluir Usuário';
  }
}

// Expose user management functions
window.loadAllUsers = loadAllUsers;
window.openEditUserModal = openEditUserModal;
window.closeEditUserModal = closeEditUserModal;
window.openDeleteUserModal = openDeleteUserModal;
window.closeDeleteModal = closeDeleteModal;

// ======================
// PRODUCT UNITS FUNCTIONS
// ======================

// Initialize units for a planned product
async function initializeProductUnits(planejamentoId) {
  try {
    const token = localStorage.getItem('auth_token');
    const response = await axios.post(
      `${API_URL}/api/product-units/initialize/${planejamentoId}`,
      {},
      { headers: { 'Authorization': `Bearer ${token}` } }
    );
    
    if (response.data.success) {
      showNotification(response.data.message, 'success');
      return true;
    } else {
      showNotification(response.data.message || 'Erro ao inicializar unidades', 'error');
      return false;
    }
  } catch (error) {
    console.error('Erro ao inicializar unidades:', error);
    showNotification(error.response?.data?.message || 'Erro ao inicializar unidades', 'error');
    return false;
  }
}

// Load units for a product
async function loadProductUnits(planejamentoId) {
  try {
    const response = await axios.get(`${API_URL}/api/product-units/${planejamentoId}`);
    
    if (response.data.success) {
      return response.data.units || [];
    }
    return [];
  } catch (error) {
    console.error('Erro ao carregar unidades:', error);
    return [];
  }
}

// Toggle units visibility
function toggleUnitsDisplay(planejamentoId) {
  const unitsContainer = document.getElementById(`units-${planejamentoId}`);
  const toggleBtn = document.getElementById(`toggle-btn-${planejamentoId}`);
  
  if (unitsContainer.classList.contains('hidden')) {
    unitsContainer.classList.remove('hidden');
    toggleBtn.innerHTML = '<i class="fas fa-chevron-up mr-1"></i>Ocultar Unidades';
    loadAndDisplayUnits(planejamentoId);
  } else {
    unitsContainer.classList.add('hidden');
    toggleBtn.innerHTML = '<i class="fas fa-chevron-down mr-1"></i>Ver Unidades';
  }
}

// Load and display units for a product
async function loadAndDisplayUnits(planejamentoId) {
  const container = document.getElementById(`units-list-${planejamentoId}`);
  container.innerHTML = '<p class="text-gray-500 text-center py-2"><i class="fas fa-spinner fa-spin mr-2"></i>Carregando unidades...</p>';
  
  const units = await loadProductUnits(planejamentoId);
  
  if (units.length === 0) {
    // Initialize units if they don't exist
    const initialized = await initializeProductUnits(planejamentoId);
    if (initialized) {
      // Reload units after initialization
      const newUnits = await loadProductUnits(planejamentoId);
      renderUnits(planejamentoId, newUnits);
    } else {
      container.innerHTML = '<p class="text-red-500 text-center py-2">Erro ao carregar unidades</p>';
    }
  } else {
    renderUnits(planejamentoId, units);
  }
}

// Render units list
function renderUnits(planejamentoId, units) {
  const container = document.getElementById(`units-list-${planejamentoId}`);
  
  if (units.length === 0) {
    container.innerHTML = '<p class="text-gray-500 text-center py-2">Nenhuma unidade encontrada</p>';
    return;
  }
  
  const unitsHtml = units.map(unit => {
    const isConfirmed = unit.status === 'confirmado';
    const statusBadge = isConfirmed 
      ? '<span class="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full"><i class="fas fa-check mr-1"></i>Confirmado</span>'
      : '<span class="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full"><i class="fas fa-clock mr-1"></i>Pendente</span>';
    
    const confirmedDate = unit.confirmed_at 
      ? `<span class="text-xs text-gray-500">em ${new Date(unit.confirmed_at).toLocaleString('pt-BR')}</span>`
      : '';
    
    return `
      <div class="flex items-center justify-between p-3 ${isConfirmed ? 'bg-green-50' : 'bg-white'} border border-gray-200 rounded-lg">
        <div class="flex items-center space-x-3">
          <div class="flex items-center">
            ${isConfirmed 
              ? '<i class="fas fa-check-circle text-green-600 text-xl"></i>' 
              : '<i class="far fa-circle text-gray-400 text-xl"></i>'}
          </div>
          <div>
            <p class="font-semibold text-gray-800">Unidade ${unit.unit_number}/${units.length}</p>
            <div class="flex items-center space-x-2">
              ${statusBadge}
              ${confirmedDate}
            </div>
          </div>
        </div>
        <div>
          ${isConfirmed 
            ? `<button 
                onclick="cancelUnitConfirmation(${unit.id}, ${planejamentoId})"
                class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-xs font-semibold transition"
                title="Cancelar confirmação">
                <i class="fas fa-times mr-1"></i>Cancelar
              </button>`
            : `<button 
                onclick="confirmUnit(${unit.id}, ${planejamentoId})"
                class="bg-teal-600 hover:bg-teal-700 text-white px-3 py-1 rounded-lg text-xs font-semibold transition"
                title="Confirmar unidade">
                <i class="fas fa-check mr-1"></i>Confirmar
              </button>`}
        </div>
      </div>
    `;
  }).join('');
  
  container.innerHTML = unitsHtml;
  
  // Update summary
  updateUnitsSummary(planejamentoId, units);
}

// Update units summary
function updateUnitsSummary(planejamentoId, units) {
  const summaryEl = document.getElementById(`units-summary-${planejamentoId}`);
  if (!summaryEl) return;
  
  const total = units.length;
  const confirmed = units.filter(u => u.status === 'confirmado').length;
  const pending = total - confirmed;
  
  summaryEl.innerHTML = `
    <span class="text-xs text-gray-600">
      <i class="fas fa-boxes mr-1"></i>
      <span class="font-semibold">${confirmed}/${total}</span> confirmadas
      ${pending > 0 ? `· <span class="text-yellow-600 font-semibold">${pending}</span> pendentes` : ''}
    </span>
  `;
}

// Confirm a single unit
// Track units being processed to prevent double-clicks
const unitsBeingProcessed = new Set();

async function confirmUnit(unitId, planejamentoId) {
  // Prevent double-click
  if (unitsBeingProcessed.has(unitId)) {
    return;
  }
  
  unitsBeingProcessed.add(unitId);
  
  // Disable button
  const button = document.querySelector(`button[onclick*="confirmUnit(${unitId}"]`);
  if (button) {
    button.disabled = true;
    button.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i>Processando...';
  }
  
  try {
    const token = localStorage.getItem('auth_token');
    
    // Get product data for semana info
    const productData = await axios.get(`${API_URL}/api/meus-produtos-semanais?designer_id=${JSON.parse(localStorage.getItem('user_data')).id}`);
    const product = productData.data.find(p => p.id === planejamentoId);
    
    if (!product) {
      showNotification('Produto não encontrado', 'error');
      return;
    }
    
    const response = await axios.patch(
      `${API_URL}/api/product-units/${unitId}/confirm`,
      {
        semana_numero: product.semana_numero,
        semana_data_inicio: product.semana_data_inicio
      },
      { headers: { 'Authorization': `Bearer ${token}` } }
    );
    
    if (response.data.success) {
      showNotification(response.data.message, 'success');
      loadAndDisplayUnits(planejamentoId);
      loadMeusProdutos(); // Reload main list
    } else {
      showNotification(response.data.message || 'Erro ao confirmar unidade', 'error');
    }
  } catch (error) {
    console.error('Erro ao confirmar unidade:', error);
    showNotification(error.response?.data?.message || 'Erro ao confirmar unidade', 'error');
  } finally {
    // Re-enable button and remove from processing set
    unitsBeingProcessed.delete(unitId);
    if (button) {
      button.disabled = false;
      button.innerHTML = '<i class="fas fa-check mr-1"></i>Confirmar';
    }
  }
}

// Cancel unit confirmation
async function cancelUnitConfirmation(unitId, planejamentoId) {
  if (!confirm('Deseja realmente cancelar a confirmação desta unidade?')) {
    return;
  }
  
  try {
    const token = localStorage.getItem('auth_token');
    const response = await axios.patch(
      `${API_URL}/api/product-units/${unitId}/cancel`,
      {},
      { headers: { 'Authorization': `Bearer ${token}` } }
    );
    
    if (response.data.success) {
      showNotification(response.data.message, 'success');
      loadAndDisplayUnits(planejamentoId);
      loadMeusProdutos(); // Reload main list
    } else {
      showNotification(response.data.message || 'Erro ao cancelar confirmação', 'error');
    }
  } catch (error) {
    console.error('Erro ao cancelar confirmação:', error);
    showNotification(error.response?.data?.message || 'Erro ao cancelar confirmação', 'error');
  }
}

// Confirm all units at once
async function confirmAllUnits(planejamentoId) {
  if (!confirm('Deseja confirmar TODAS as unidades de uma vez?')) {
    return;
  }
  
  // Prevent double-click on planning
  if (unitsBeingProcessed.has(`all-${planejamentoId}`)) {
    return;
  }
  
  unitsBeingProcessed.add(`all-${planejamentoId}`);
  
  // Disable button
  const button = document.querySelector(`button[onclick*="confirmAllUnits(${planejamentoId}"]`);
  if (button) {
    button.disabled = true;
    button.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i>Processando...';
  }
  
  try {
    const token = localStorage.getItem('auth_token');
    
    // Get product data for semana info
    const productData = await axios.get(`${API_URL}/api/meus-produtos-semanais?designer_id=${JSON.parse(localStorage.getItem('user_data')).id}`);
    const product = productData.data.find(p => p.id === planejamentoId);
    
    if (!product) {
      showNotification('Produto não encontrado', 'error');
      return;
    }
    
    const response = await axios.post(
      `${API_URL}/api/product-units/${planejamentoId}/confirm-all`,
      {
        semana_numero: product.semana_numero,
        semana_data_inicio: product.semana_data_inicio
      },
      { headers: { 'Authorization': `Bearer ${token}` } }
    );
    
    if (response.data.success) {
      showNotification(response.data.message, 'success');
      loadAndDisplayUnits(planejamentoId);
      loadMeusProdutos(); // Reload main list
    } else {
      showNotification(response.data.message || 'Erro ao confirmar todas unidades', 'error');
    }
  } catch (error) {
    console.error('Erro ao confirmar todas unidades:', error);
    showNotification(error.response?.data?.message || 'Erro ao confirmar todas unidades', 'error');
  } finally {
    // Re-enable button and remove from processing set
    unitsBeingProcessed.delete(`all-${planejamentoId}`);
    if (button) {
      button.disabled = false;
      button.innerHTML = '<i class="fas fa-check-double mr-1"></i>Confirmar Todas';
    }
  }
}

// Expose product units functions
window.initializeProductUnits = initializeProductUnits;
window.loadProductUnits = loadProductUnits;
window.toggleUnitsDisplay = toggleUnitsDisplay;
window.loadAndDisplayUnits = loadAndDisplayUnits;
window.confirmUnit = confirmUnit;
window.cancelUnitConfirmation = cancelUnitConfirmation;
window.confirmAllUnits = confirmAllUnits;

// ======================
// SUPERVISOR FUNCTIONS
// ======================

// Load supervisor dashboard
async function loadSupervisorDashboard() {
  try {
    const token = localStorage.getItem('auth_token');
    const response = await axios.get(`${API_URL}/api/supervisor/dashboard`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (response.data.success) {
      const dash = response.data.dashboard;
      
      // Update stats
      document.getElementById('sup-total-hoje').textContent = dash.total_produzido_hoje || 0;
      document.getElementById('sup-reprovado-hoje').textContent = dash.total_reprovado_hoje || 0;
      document.getElementById('sup-pendencias').textContent = dash.pendencias || 0;
      
      // Calculate efficiency
      const totalCriado = dash.total_produzido_hoje || 0;
      const totalAprovado = totalCriado - (dash.total_reprovado_hoje || 0);
      const eficiencia = totalCriado > 0 ? Math.round((totalAprovado / totalCriado) * 100) : 0;
      document.getElementById('sup-eficiencia').textContent = eficiencia + '%';
      
      // Render efficiency ranking
      renderEfficiencyRanking(dash.eficiencia_por_usuario || []);
    }
  } catch (error) {
    console.error('Erro ao carregar dashboard supervisor:', error);
    showNotification('Erro ao carregar dashboard', 'error');
  }
}

// Render efficiency ranking
function renderEfficiencyRanking(usuarios) {
  const container = document.getElementById('eficiencia-ranking');
  if (!container) return;
  
  if (usuarios.length === 0) {
    container.innerHTML = '<p class="text-gray-500 text-center py-4">Nenhum dado disponível</p>';
    return;
  }
  
  const html = usuarios.map((u, index) => {
    const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '';
    return `
      <div class="flex items-center justify-between py-3 border-b border-gray-200">
        <div class="flex items-center">
          <span class="text-2xl mr-3">${medal}</span>
          <div>
            <p class="font-semibold text-gray-800">${u.nome}</p>
            <p class="text-sm text-gray-600">${u.total_criado} criados | ${u.total_aprovado} aprovados</p>
          </div>
        </div>
        <div class="text-right">
          <p class="text-2xl font-bold text-teal-600">${u.eficiencia_percent}%</p>
        </div>
      </div>
    `;
  }).join('');
  
  container.innerHTML = html;
}

// Load pending approvals
async function loadPendencias() {
  try {
    const token = localStorage.getItem('auth_token');
    const response = await axios.get(`${API_URL}/api/supervisor/pendencias`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (response.data.success) {
      renderPendencias(response.data.pendencias || []);
    }
  } catch (error) {
    console.error('Erro ao carregar pendências:', error);
    showNotification('Erro ao carregar pendências', 'error');
  }
}

// Render pending approvals
function renderPendencias(pendencias) {
  const container = document.getElementById('lista-pendencias');
  if (!container) return;
  
  if (pendencias.length === 0) {
    container.innerHTML = `
      <div class="text-center py-12">
        <i class="fas fa-check-circle text-6xl text-green-500 mb-4"></i>
        <p class="text-xl text-gray-600">Nenhuma pendência no momento</p>
      </div>
    `;
    return;
  }
  
  const html = pendencias.map(p => `
    <div class="bg-white border border-gray-200 rounded-lg p-4 mb-4 hover:shadow-md transition">
      <div class="flex justify-between items-start mb-3">
        <div>
          <h4 class="font-semibold text-gray-800">${p.produto_nome}</h4>
          <p class="text-sm text-gray-600">Designer: ${p.designer_nome}</p>
          <p class="text-xs text-gray-500">${new Date(p.created_at).toLocaleString('pt-BR')}</p>
        </div>
        <span class="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">
          PENDENTE
        </span>
      </div>
      
      <div class="grid grid-cols-3 gap-2 mb-3 text-sm">
        <div class="bg-blue-50 p-2 rounded">
          <p class="text-xs text-gray-600">Criados</p>
          <p class="font-semibold text-blue-600">${p.quantidade_criada}</p>
        </div>
        <div class="bg-green-50 p-2 rounded">
          <p class="text-xs text-gray-600">Aprovados</p>
          <p class="font-semibold text-green-600">${p.quantidade_aprovada || 0}</p>
        </div>
        <div class="bg-red-50 p-2 rounded">
          <p class="text-xs text-gray-600">Reprovados</p>
          <p class="font-semibold text-red-600">${p.quantidade_reprovada || 0}</p>
        </div>
      </div>
      
      ${p.observacoes ? `<p class="text-sm text-gray-600 mb-3"><strong>Obs:</strong> ${p.observacoes}</p>` : ''}
      
      <div class="flex gap-2">
        <button 
          onclick="aprovarLancamento(${p.id}, 'aprovado')"
          class="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition">
          <i class="fas fa-check mr-2"></i>Aprovar
        </button>
        <button 
          onclick="reprovarLancamento(${p.id}, 'reprovado')"
          class="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition">
          <i class="fas fa-times mr-2"></i>Reprovar
        </button>
        <button 
          onclick="editarLancamento(${p.id})"
          class="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition">
          <i class="fas fa-edit"></i>
        </button>
      </div>
    </div>
  `).join('');
  
  container.innerHTML = html;
}

// Approve production record (usando endpoint correto)
async function aprovarLancamento(id, status) {
  const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
  const admin_id = userData.id;
  
  if (!admin_id) {
    showNotification('Erro: usuário não identificado', 'error');
    return;
  }
  
  const observacao = prompt('Observação (opcional):');
  
  if (observacao === null) return; // Cancelled
  
  try {
    const res = await axios.post(`${API_URL}/api/aprovacoes/${id}/aprovar`, {
      admin_id,
      observacao: observacao || null
    });
    
    if (res.data && res.data.success) {
      showNotification(res.data.message || 'Lançamento aprovado com sucesso! ✓', 'success');
      await loadPendencias();
      
      // Update related modules
      if (typeof loadSupervisorDashboard === 'function') {
        await loadSupervisorDashboard();
      }
      if (typeof loadDashboard === 'function') {
        await loadDashboard();
      }
      if (typeof loadTop6Metas === 'function') {
        await loadTop6Metas();
      }
      if (typeof loadRelatoriosProducao === 'function') {
        await loadRelatoriosProducao();
      }
    }
  } catch (error) {
    console.error('Erro ao aprovar:', error);
    const msg = error.response?.data?.message || 'Erro ao aprovar lançamento';
    showNotification(msg, 'error');
  }
}

// Reject production record (usando endpoint correto)
async function reprovarLancamento(id, status) {
  const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
  const admin_id = userData.id;
  
  if (!admin_id) {
    showNotification('Erro: usuário não identificado', 'error');
    return;
  }
  
  const motivo = prompt('Motivo da reprovação (obrigatório):');
  
  if (!motivo || motivo.trim() === '') {
    showNotification('Motivo é obrigatório para reprovar', 'error');
    return;
  }
  
  if (!confirm(`Tem certeza que deseja reprovar?\nMotivo: ${motivo}`)) {
    return;
  }
  
  try {
    const res = await axios.post(`${API_URL}/api/aprovacoes/${id}/reprovar`, {
      admin_id,
      motivo
    });
    
    if (res.data && res.data.success) {
      showNotification(res.data.message || 'Lançamento reprovado', 'success');
      await loadPendencias();
      
      // Update related modules
      if (typeof loadSupervisorDashboard === 'function') {
        await loadSupervisorDashboard();
      }
      if (typeof loadDashboard === 'function') {
        await loadDashboard();
      }
      if (typeof loadTop6Metas === 'function') {
        await loadTop6Metas();
      }
      if (typeof loadRelatoriosProducao === 'function') {
        await loadRelatoriosProducao();
      }
    }
  } catch (error) {
    console.error('Erro ao reprovar:', error);
    const msg = error.response?.data?.message || 'Erro ao reprovar lançamento';
    showNotification(msg, 'error');
  }
}

// Edit production record
async function editarLancamento(id) {
  try {
    const token = localStorage.getItem('auth_token');
    
    // Get current data
    const pendencias = await axios.get(`${API_URL}/api/supervisor/pendencias`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const lancamento = pendencias.data.pendencias.find(p => p.id === id);
    if (!lancamento) {
      showNotification('Lançamento não encontrado', 'error');
      return;
    }
    
    const quantidadeCriada = prompt('Quantidade Criada:', lancamento.quantidade_criada);
    if (quantidadeCriada === null) return;
    
    const quantidadeAprovada = prompt('Quantidade Aprovada:', lancamento.quantidade_aprovada || 0);
    if (quantidadeAprovada === null) return;
    
    const quantidadeReprovada = prompt('Quantidade Reprovada:', lancamento.quantidade_reprovada || 0);
    if (quantidadeReprovada === null) return;
    
    const observacoes = prompt('Observações:', lancamento.observacoes || '');
    if (observacoes === null) return;
    
    const motivo = prompt('Motivo da edição (obrigatório):');
    if (!motivo || motivo.trim() === '') {
      showNotification('Motivo é obrigatório', 'error');
      return;
    }
    
    const response = await axios.put(
      `${API_URL}/api/supervisor/editar-lancamento/${id}`,
      {
        quantidade_criada: parseInt(quantidadeCriada),
        quantidade_aprovada: parseInt(quantidadeAprovada),
        quantidade_reprovada: parseInt(quantidadeReprovada),
        observacoes: observacoes,
        motivo: motivo
      },
      { headers: { 'Authorization': `Bearer ${token}` } }
    );
    
    if (response.data.success) {
      showNotification('Lançamento editado com sucesso!', 'success');
      loadPendencias(); // Reload list
      loadSupervisorDashboard(); // Update stats
    } else {
      showNotification(response.data.message || 'Erro ao editar', 'error');
    }
  } catch (error) {
    console.error('Erro ao editar:', error);
    showNotification(error.response?.data?.message || 'Erro ao editar lançamento', 'error');
  }
}

// ========================================
// ACOMPANHAMENTO SEMANAL DE DESIGNERS
// ========================================

// Carregar todos os designers com suas semanas
async function loadDesignersSemanas() {
  const loading = document.getElementById('acompanhamento-loading');
  const grid = document.getElementById('designers-semanas-grid');
  const empty = document.getElementById('acompanhamento-empty');
  
  if (loading) loading.classList.remove('hidden');
  if (grid) grid.innerHTML = '';
  if (empty) empty.classList.add('hidden');
  
  try {
    const response = await axios.get(`${API_URL}/api/designers-semanas`);
    
    if (response.data.designers && response.data.designers.length > 0) {
      response.data.designers.forEach(designer => {
        if (grid) grid.innerHTML += createDesignerSemanaCard(designer);
      });
    } else {
      if (empty) empty.classList.remove('hidden');
    }
  } catch (error) {
    console.error('Erro ao carregar designers com semanas:', error);
    showNotification('Erro ao carregar acompanhamento de semanas', 'error');
    if (empty) empty.classList.remove('hidden');
  } finally {
    if (loading) loading.classList.add('hidden');
  }
}

// Criar card de designer com suas semanas
function createDesignerSemanaCard(designer) {
  const { id, nome, progresso, semanas } = designer;
  const { total, concluidas, pendentes, percentual, projeto_finalizado } = progresso;
  
  // Determinar cor da borda se projeto finalizado
  const borderClass = projeto_finalizado ? 'border-4 border-green-500' : 'border border-gray-200';
  
  // Badge de projeto finalizado
  const badgeFinalizado = projeto_finalizado ? `
    <div class="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
      <i class="fas fa-check-circle mr-1"></i>Projeto Finalizado
    </div>
  ` : '';
  
  // Criar lista de semanas
  const semanasHTML = semanas.map(semana => {
    const isConcluida = semana.status === 'concluida';
    const statusIcon = isConcluida ? '<i class="fas fa-check-circle text-green-600"></i>' : '<i class="far fa-circle text-gray-400"></i>';
    const statusColor = isConcluida ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200';
    const dataInicio = new Date(semana.semana_data_inicio + 'T00:00:00').toLocaleDateString('pt-BR');
    const dataFim = new Date(semana.semana_data_fim + 'T00:00:00').toLocaleDateString('pt-BR');
    
    // Status text (automático baseado em lançamentos)
    const statusText = isConcluida 
      ? '<span class="ml-auto text-green-600 text-xs font-semibold flex items-center"><i class="fas fa-check-double mr-1"></i>Concluído</span>'
      : '<span class="ml-auto text-gray-500 text-xs flex items-center"><i class="fas fa-clock mr-1"></i>Pendente</span>';
    
    return `
      <div class="flex items-center justify-between p-3 ${statusColor} border rounded-lg transition hover:shadow-sm">
        <div class="flex items-center space-x-3">
          <div class="text-lg">${statusIcon}</div>
          <div>
            <div class="font-semibold text-gray-800">Semana ${semana.semana_numero} - ${semana.ano || '2024'}</div>
            <div class="text-xs text-gray-600">${dataInicio} - ${dataFim}</div>
          </div>
        </div>
        ${statusText}
      </div>
    `;
  }).join('');
  
  return `
    <div class="bg-white rounded-xl shadow-lg overflow-hidden ${borderClass} transition-all duration-300 hover:shadow-xl relative">
      ${badgeFinalizado}
      
      <!-- Cabeçalho do Card -->
      <div class="bg-gradient-to-r from-teal-500 to-blue-500 p-6 text-white">
        <div class="flex items-center space-x-3 mb-4">
          <div class="bg-white/20 p-3 rounded-lg">
            <i class="fas fa-user text-2xl"></i>
          </div>
          <div>
            <h3 class="text-xl font-bold">${nome}</h3>
            <p class="text-white/90 text-sm">${total} semanas no total</p>
          </div>
        </div>
        
        <!-- Contador de Progresso -->
        <div class="bg-white/20 rounded-lg p-3 backdrop-blur-sm">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-semibold">Progresso Geral</span>
            <span class="text-lg font-bold">${percentual}%</span>
          </div>
          
          <!-- Barra de Progresso -->
          <div class="w-full bg-white/30 rounded-full h-3 overflow-hidden">
            <div class="h-full bg-white rounded-full transition-all duration-500" style="width: ${percentual}%"></div>
          </div>
          
          <div class="flex items-center justify-between mt-2 text-xs">
            <span><i class="fas fa-check-circle mr-1"></i>${concluidas} Concluídas</span>
            <span><i class="far fa-circle mr-1"></i>${pendentes} Pendentes</span>
          </div>
        </div>
      </div>
      
      <!-- Lista de Semanas -->
      <div class="p-6 max-h-96 overflow-y-auto space-y-2">
        ${semanasHTML || '<p class="text-gray-500 text-center py-4">Nenhuma semana planejada ainda</p>'}
      </div>
    </div>
  `;
}

// Expor funções globalmente
window.loadDesignersSemanas = loadDesignersSemanas;

// Expose supervisor functions
window.loadSupervisorDashboard = loadSupervisorDashboard;
window.loadPendencias = loadPendencias;
window.aprovarLancamento = aprovarLancamento;
window.reprovarLancamento = reprovarLancamento;
window.editarLancamento = editarLancamento;
window.confirmDeleteUser = confirmDeleteUser;


// ============================================
// RELATÓRIOS DE PRODUÇÃO - NOVAS FUNCIONALIDADES
// ============================================

let chartProducaoSemana = null;

// Alternar entre abas de relatório
function showRelatorioTab(tabName) {
  // Ocultar todas as abas
  document.querySelectorAll('.relatorio-tab-content').forEach(tab => {
    tab.classList.add('hidden');
  });
  
  // Remover classe ativa de todos os botões
  document.querySelectorAll('.relatorio-tab-btn').forEach(btn => {
    btn.classList.remove('bg-teal-600', 'text-white');
    btn.classList.add('text-gray-600', 'hover:bg-gray-100');
  });
  
  // Mostrar aba selecionada
  document.getElementById(`relatorio-tab-${tabName}`).classList.remove('hidden');
  
  // Ativar botão selecionado
  const activeBtn = document.getElementById(`tab-btn-${tabName}`);
  activeBtn.classList.remove('text-gray-600', 'hover:bg-gray-100');
  activeBtn.classList.add('bg-teal-600', 'text-white');
}

// Carregar relatórios de produção
async function loadRelatoriosProducao() {
  const dataInicio = document.getElementById('relatorio-data-inicio').value;
  const dataFim = document.getElementById('relatorio-data-fim').value;
  
  if (!dataInicio || !dataFim) {
    showNotification('Selecione o período inicial e final', 'error');
    return;
  }
  
  document.getElementById('relatorios-loading').classList.remove('hidden');
  document.getElementById('resumo-producao').classList.add('hidden');
  
  try {
    const token = localStorage.getItem('auth_token');
    
    // Buscar dados de produção
    const response = await axios.get(`${API_URL}/api/relatorios/producao`, {
      params: { data_inicio: dataInicio, data_fim: dataFim },
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (response.data.success) {
      const dados = response.data.dados;
      
      // Atualizar resumo
      document.getElementById('total-produzido').textContent = dados.total_produzido;
      document.getElementById('meta-total').textContent = dados.meta_total;
      document.getElementById('percentual-concluido').textContent = `${dados.percentual.toFixed(1)}%`;
      
      document.getElementById('resumo-producao').classList.remove('hidden');
      
      // Renderizar tabs
      renderGraficoProducaoSemana(dados.producao_por_semana);
      renderTabelaDesigners(dados.por_designer);
      renderTabelaMetas(dados.por_meta);
      renderCurvaABC(dados.por_designer);
      
      showNotification('Relatórios carregados com sucesso', 'success');
    }
  } catch (error) {
    console.error('Erro ao carregar relatórios:', error);
    showNotification('Erro ao carregar relatórios', 'error');
  } finally {
    document.getElementById('relatorios-loading').classList.add('hidden');
  }
}

// Renderizar gráfico de produção por semana
function renderGraficoProducaoSemana(dados) {
  const ctx = document.getElementById('chart-producao-semana');
  
  // Destruir gráfico anterior se existir
  if (chartProducaoSemana) {
    chartProducaoSemana.destroy();
  }
  
  const labels = dados.map(d => `Semana ${d.semana}`);
  const valores = dados.map(d => d.total);
  
  chartProducaoSemana = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Produção',
        data: valores,
        backgroundColor: 'rgba(20, 184, 166, 0.8)',
        borderColor: 'rgba(20, 184, 166, 1)',
        borderWidth: 2,
        borderRadius: 8
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          padding: 12,
          titleFont: { size: 14 },
          bodyFont: { size: 13 }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 10
          }
        }
      }
    }
  });
}

// Renderizar tabela de designers
function renderTabelaDesigners(designers) {
  const tbody = document.getElementById('tabela-designers');
  
  if (designers.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="text-center py-8 text-gray-500">Nenhum dado encontrado</td></tr>';
    return;
  }
  
  const html = designers.map(d => {
    const percentual = d.meta > 0 ? (d.total / d.meta * 100).toFixed(1) : 0;
    const statusClass = percentual >= 100 ? 'bg-green-100 text-green-800' : 
                       percentual >= 80 ? 'bg-yellow-100 text-yellow-800' : 
                       'bg-red-100 text-red-800';
    const statusText = percentual >= 100 ? 'Concluído' : 
                      percentual >= 80 ? 'Em Andamento' : 
                      'Atrasado';
    
    return `
      <tr class="hover:bg-gray-50">
        <td class="px-6 py-4 whitespace-nowrap">
          <div class="flex items-center">
            <div class="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 font-bold">
              ${d.nome.charAt(0)}
            </div>
            <span class="ml-3 font-medium text-gray-900">${d.nome}</span>
          </div>
        </td>
        <td class="px-6 py-4 text-center">
          <span class="text-lg font-semibold text-blue-600">${d.total}</span>
        </td>
        <td class="px-6 py-4 text-center">
          <span class="text-lg font-semibold text-purple-600">${d.meta}</span>
        </td>
        <td class="px-6 py-4 text-center">
          <div class="flex flex-col items-center">
            <span class="text-lg font-bold text-gray-900">${percentual}%</span>
            <div class="w-full bg-gray-200 rounded-full h-2 mt-1" style="max-width: 100px;">
              <div class="bg-teal-600 h-2 rounded-full" style="width: ${Math.min(percentual, 100)}%"></div>
            </div>
          </div>
        </td>
        <td class="px-6 py-4 text-center">
          <span class="px-3 py-1 text-xs font-semibold rounded-full ${statusClass}">
            ${statusText}
          </span>
        </td>
      </tr>
    `;
  }).join('');
  
  tbody.innerHTML = html;
}

// Renderizar tabela de metas
function renderTabelaMetas(metas) {
  const tbody = document.getElementById('tabela-metas');
  
  if (metas.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="text-center py-8 text-gray-500">Nenhuma meta encontrada</td></tr>';
    return;
  }
  
  const html = metas.map(m => {
    const percentual = m.meta > 0 ? (m.produzido / m.meta * 100).toFixed(1) : 0;
    const statusClass = percentual >= 100 ? 'bg-green-100 text-green-800' : 
                       percentual >= 80 ? 'bg-yellow-100 text-yellow-800' : 
                       'bg-red-100 text-red-800';
    const statusIcon = percentual >= 100 ? 'fa-check-circle' : 
                      percentual >= 80 ? 'fa-clock' : 
                      'fa-exclamation-circle';
    
    return `
      <tr class="hover:bg-gray-50">
        <td class="px-6 py-4 whitespace-nowrap">
          <span class="font-medium text-gray-900">${m.produto}</span>
        </td>
        <td class="px-6 py-4 text-center">
          <span class="text-lg font-semibold text-purple-600">${m.meta}</span>
        </td>
        <td class="px-6 py-4 text-center">
          <span class="text-lg font-semibold text-blue-600">${m.produzido}</span>
        </td>
        <td class="px-6 py-4 text-center">
          <div class="flex flex-col items-center">
            <span class="text-lg font-bold text-gray-900">${percentual}%</span>
            <div class="w-full bg-gray-200 rounded-full h-2 mt-1" style="max-width: 120px;">
              <div class="bg-teal-600 h-2 rounded-full" style="width: ${Math.min(percentual, 100)}%"></div>
            </div>
          </div>
        </td>
        <td class="px-6 py-4 text-center">
          <span class="px-3 py-1 text-xs font-semibold rounded-full ${statusClass}">
            <i class="fas ${statusIcon} mr-1"></i>
            ${Math.round(percentual)}%
          </span>
        </td>
      </tr>
    `;
  }).join('');
  
  tbody.innerHTML = html;
}

// Renderizar Curva ABC
function renderCurvaABC(designers) {
  const tbody = document.getElementById('tabela-curva-abc');
  
  if (designers.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="text-center py-8 text-gray-500">Nenhum dado encontrado</td></tr>';
    return;
  }
  
  // Ordenar por produção (maior para menor)
  const sorted = [...designers].sort((a, b) => b.total - a.total);
  
  // Calcular total geral
  const totalGeral = sorted.reduce((sum, d) => sum + d.total, 0);
  
  // Calcular percentuais e acumulados
  let acumulado = 0;
  const dadosComPercentual = sorted.map((d, index) => {
    const percentualIndividual = totalGeral > 0 ? (d.total / totalGeral * 100) : 0;
    acumulado += percentualIndividual;
    
    // Classificação ABC
    let classificacao = 'C';
    let classeColor = 'bg-red-500';
    if (acumulado <= 80) {
      classificacao = 'A';
      classeColor = 'bg-green-500';
    } else if (acumulado <= 95) {
      classificacao = 'B';
      classeColor = 'bg-yellow-500';
    }
    
    return {
      ...d,
      posicao: index + 1,
      percentualIndividual: percentualIndividual.toFixed(2),
      percentualAcumulado: acumulado.toFixed(2),
      classificacao,
      classeColor
    };
  });
  
  const html = dadosComPercentual.map(d => `
    <tr class="hover:bg-gray-50">
      <td class="px-6 py-4 text-center">
        <span class="text-lg font-bold text-gray-700">${d.posicao}º</span>
      </td>
      <td class="px-6 py-4 whitespace-nowrap">
        <div class="flex items-center">
          <div class="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 font-bold">
            ${d.nome.charAt(0)}
          </div>
          <span class="ml-3 font-medium text-gray-900">${d.nome}</span>
        </div>
      </td>
      <td class="px-6 py-4 text-center">
        <span class="text-lg font-semibold text-blue-600">${d.total}</span>
      </td>
      <td class="px-6 py-4 text-center">
        <span class="text-sm font-medium text-gray-700">${d.percentualIndividual}%</span>
      </td>
      <td class="px-6 py-4 text-center">
        <div class="flex flex-col items-center">
          <span class="text-sm font-bold text-gray-900">${d.percentualAcumulado}%</span>
          <div class="w-full bg-gray-200 rounded-full h-2 mt-1" style="max-width: 100px;">
            <div class="bg-teal-600 h-2 rounded-full" style="width: ${d.percentualAcumulado}%"></div>
          </div>
        </div>
      </td>
      <td class="px-6 py-4 text-center">
        <span class="${d.classeColor} text-white font-bold text-lg px-4 py-2 rounded-full shadow-md">
          ${d.classificacao}
        </span>
      </td>
    </tr>
  `).join('');
  
  tbody.innerHTML = html;
}

// Exportar PDF
function exportarPDF(tipo) {
  const dataInicio = document.getElementById('relatorio-data-inicio').value;
  const dataFim = document.getElementById('relatorio-data-fim').value;
  
  if (!dataInicio || !dataFim) {
    showNotification('Selecione o período para gerar o PDF', 'error');
    return;
  }
  
  // Preparar conteúdo para impressão
  const titulo = tipo === 'designer' ? 'Relatório por Designer' :
                 tipo === 'metas' ? 'Relatório de Metas' :
                 tipo === 'curva-abc' ? 'Análise Curva ABC' :
                 'Relatório de Produção';
  
  // Pegar conteúdo da tab ativa
  let conteudo = '';
  const totalProduzido = document.getElementById('total-produzido')?.textContent || '0';
  const metaTotal = document.getElementById('meta-total')?.textContent || '0';
  const percentual = document.getElementById('percentual-concluido')?.textContent || '0%';
  
  if (tipo === 'designer') {
    const tabela = document.getElementById('tabela-designers');
    conteudo = tabela?.parentElement?.outerHTML || '';
  } else if (tipo === 'metas') {
    const tabela = document.getElementById('tabela-metas');
    conteudo = tabela?.parentElement?.outerHTML || '';
  } else if (tipo === 'curva-abc') {
    const legenda = document.querySelector('#relatorio-tab-curva-abc .grid');
    const tabela = document.getElementById('tabela-curva-abc');
    conteudo = (legenda?.outerHTML || '') + (tabela?.parentElement?.outerHTML || '');
  }
  
  // Criar janela de impressão
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    showNotification('Por favor, permita pop-ups para gerar o PDF', 'error');
    return;
  }
  
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>${titulo} - ${dataInicio} a ${dataFim}</title>
      <script src="https://cdn.tailwindcss.com"></script>
      <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
      <style>
        @media print {
          body { margin: 0; padding: 20px; }
          .no-print { display: none !important; }
        }
        body { font-family: system-ui, -apple-system, sans-serif; }
      </style>
    </head>
    <body class="bg-white">
      <div class="max-w-7xl mx-auto p-8">
        <!-- Cabeçalho -->
        <div class="text-center mb-8 border-b-2 border-teal-600 pb-4">
          <h1 class="text-4xl font-bold text-teal-600 mb-2">COREPRO - DESIGN</h1>
          <h2 class="text-2xl font-semibold text-gray-800">${titulo}</h2>
          <p class="text-gray-600 mt-2">Período: ${dataInicio} até ${dataFim}</p>
          <p class="text-sm text-gray-500 mt-1">Gerado em: ${new Date().toLocaleString('pt-BR')}</p>
        </div>
        
        <!-- Resumo -->
        <div class="grid grid-cols-3 gap-6 mb-8">
          <div class="bg-blue-50 border-2 border-blue-500 rounded-lg p-4 text-center">
            <p class="text-sm font-medium text-gray-600">Total Produzido</p>
            <p class="text-3xl font-bold text-blue-600 mt-2">${totalProduzido}</p>
          </div>
          <div class="bg-purple-50 border-2 border-purple-500 rounded-lg p-4 text-center">
            <p class="text-sm font-medium text-gray-600">Meta Total</p>
            <p class="text-3xl font-bold text-purple-600 mt-2">${metaTotal}</p>
          </div>
          <div class="bg-green-50 border-2 border-green-500 rounded-lg p-4 text-center">
            <p class="text-sm font-medium text-gray-600">Percentual Concluído</p>
            <p class="text-3xl font-bold text-green-600 mt-2">${percentual}</p>
          </div>
        </div>
        
        <!-- Conteúdo -->
        ${conteudo}
        
        <!-- Rodapé -->
        <div class="mt-8 pt-4 border-t border-gray-300 text-center text-sm text-gray-500">
          <p>COREPRO - Sistema de Gestão de Design e Lançamentos</p>
        </div>
      </div>
      
      <script>
        window.onload = function() {
          setTimeout(function() {
            window.print();
            setTimeout(function() {
              window.close();
            }, 500);
          }, 500);
        };
      </script>
    </body>
    </html>
  `);
  
  printWindow.document.close();
  showNotification('Abrindo janela de impressão...', 'success');
}

// Inicializar datas com período atual
function inicializarRelatorios() {
  const hoje = getBrasiliaDateTime('date');
  const inicioMes = hoje.substring(0, 8) + '01';
  
  document.getElementById('relatorio-data-inicio').value = inicioMes;
  document.getElementById('relatorio-data-fim').value = hoje;
}

// Expor funções globalmente
window.showRelatorioTab = showRelatorioTab;
window.loadRelatoriosProducao = loadRelatoriosProducao;
window.exportarPDF = exportarPDF;
window.inicializarRelatorios = inicializarRelatorios;

// Função para popular filtros de lançamentos
async function populateLancamentosFilters() {
  try {
    // Popular filtro de designers
    const designersSelect = document.getElementById('lancamentos-designer-filter');
    if (designersSelect && AppState.designers.length > 0) {
      designersSelect.innerHTML = '<option value="">Todos Designers</option>' +
        AppState.designers
          .filter(d => d.ativo)
          .map(d => `<option value="${d.id}">${d.nome}</option>`)
          .join('');
    }
    
    // Popular filtro de produtos
    const produtosSelect = document.getElementById('lancamentos-produto-filter');
    if (produtosSelect && AppState.produtos.length > 0) {
      produtosSelect.innerHTML = '<option value="">Todos Produtos</option>' +
        AppState.produtos
          .map(p => `<option value="${p.id}">${p.nome}</option>`)
          .join('');
    }
  } catch (error) {
    console.error('Erro ao popular filtros:', error);
  }
}

// Estado para controlar se quantidade aprovada é manual
let aprovadaManualMode = false;

// Alternar modo de edição de quantidade aprovada
function toggleAprovadaEdit() {
  const inputAprovada = document.getElementById('input-aprovada');
  const statusSpan = document.getElementById('aprovada-status');
  
  if (!inputAprovada || !statusSpan) return;
  
  aprovadaManualMode = !aprovadaManualMode;
  
  if (aprovadaManualMode) {
    inputAprovada.classList.remove('bg-gray-50');
    inputAprovada.classList.add('bg-yellow-50', 'border-yellow-500');
    statusSpan.innerHTML = '<i class="fas fa-edit"></i> valor ajustado manualmente';
    statusSpan.classList.remove('text-blue-600');
    statusSpan.classList.add('text-yellow-600');
    inputAprovada.focus();
  } else {
    inputAprovada.classList.remove('bg-yellow-50', 'border-yellow-500');
    inputAprovada.classList.add('bg-gray-50');
    statusSpan.innerHTML = '<i class="fas fa-calculator"></i> calculado automaticamente';
    statusSpan.classList.remove('text-yellow-600');
    statusSpan.classList.add('text-blue-600');
    // Recalcular automaticamente
    calcularAprovada();
  }
}

// Calcular quantidade aprovada automaticamente
function calcularAprovada() {
  if (aprovadaManualMode) return;
  
  const criada = parseInt(document.getElementById('input-criada')?.value || 0);
  const reprovada = parseInt(document.getElementById('input-reprovada')?.value || 0);
  const aprovada = Math.max(0, criada - reprovada);
  
  const inputAprovada = document.getElementById('input-aprovada');
  if (inputAprovada) {
    inputAprovada.value = aprovada;
  }
}

// Expor funções globalmente
window.populateLancamentosFilters = populateLancamentosFilters;
window.toggleAprovadaEdit = toggleAprovadaEdit;
window.calcularAprovada = calcularAprovada;

// =======================
// DROPDOWN MENU TOGGLE
// =======================

function toggleDropdown(button) {
  const container = button.closest('.dropdown-container');
  const menu = container.querySelector('.dropdown-menu');
  const allDropdowns = document.querySelectorAll('.dropdown-menu');
  
  // Fechar todos os outros dropdowns
  allDropdowns.forEach(dropdown => {
    if (dropdown !== menu) {
      dropdown.classList.add('hidden');
      dropdown.classList.remove('show');
    }
  });
  
  // Toggle do dropdown atual
  if (menu.classList.contains('hidden')) {
    menu.classList.remove('hidden');
    menu.classList.add('show');
  } else {
    menu.classList.add('hidden');
    menu.classList.remove('show');
  }
}

// Fechar dropdowns ao clicar fora
document.addEventListener('click', function(event) {
  if (!event.target.closest('.dropdown-container')) {
    const allDropdowns = document.querySelectorAll('.dropdown-menu');
    allDropdowns.forEach(dropdown => {
      dropdown.classList.add('hidden');
      dropdown.classList.remove('show');
    });
  }
});

// Expor função globalmente
window.toggleDropdown = toggleDropdown;

// =======================
// NOVOS MÓDULOS: FILA, RANKING E RELATÓRIO
// =======================

// Variáveis globais para controle de gráficos
let producaoSemanalChart = null;
let desempenhoDesignersChart = null;

// Sistema de atualização automática
const AUTO_REFRESH_INTERVAL = 30000; // 30 segundos
let autoRefreshTimers = {};

function startAutoRefresh(moduleName, refreshFunction) {
  // Limpar timer existente
  if (autoRefreshTimers[moduleName]) {
    clearInterval(autoRefreshTimers[moduleName]);
  }
  
  // Iniciar novo timer
  autoRefreshTimers[moduleName] = setInterval(() => {
    console.log(`Auto-refresh: ${moduleName}`);
    refreshFunction();
  }, AUTO_REFRESH_INTERVAL);
}

function stopAutoRefresh(moduleName) {
  if (autoRefreshTimers[moduleName]) {
    clearInterval(autoRefreshTimers[moduleName]);
    delete autoRefreshTimers[moduleName];
  }
}

function stopAllAutoRefresh() {
  Object.keys(autoRefreshTimers).forEach(module => {
    stopAutoRefresh(module);
  });
}

// ===== FILA DE PRODUÇÃO =====
async function loadFilaProducao() {
  const tbody = document.getElementById('fila-tbody');
  const loading = document.getElementById('fila-loading');
  const empty = document.getElementById('fila-empty');
  
  if (!tbody || !loading || !empty) return;
  
  loading.classList.remove('hidden');
  tbody.innerHTML = '';
  empty.classList.add('hidden');
  
  try {
    // Obter filtros
    const designer_id = document.getElementById('fila-filter-designer')?.value || '';
    const mes = document.getElementById('fila-filter-mes')?.value || '';
    const ano = document.getElementById('fila-filter-ano')?.value || '';
    
    // Construir query string
    let query = [];
    if (designer_id) query.push(`designer_id=${designer_id}`);
    if (mes) query.push(`mes=${mes}`);
    if (ano) query.push(`ano=${ano}`);
    const queryString = query.length > 0 ? '?' + query.join('&') : '';
    
    const res = await axios.get(`${API_URL}/api/fila-producao${queryString}`);
    const { data, total } = res.data;
    
    loading.classList.add('hidden');
    
    if (!data || data.length === 0) {
      empty.classList.remove('hidden');
      return;
    }
    
    // Renderizar tabela
    data.forEach(item => {
      const prioridadeClass = {
        'urgente': 'bg-red-100 text-red-800',
        'alta': 'bg-orange-100 text-orange-800',
        'media': 'bg-yellow-100 text-yellow-800',
        'baixa': 'bg-gray-100 text-gray-800'
      }[item.prioridade_calc] || 'bg-gray-100 text-gray-800';
      
      const statusClass = item.status_calc === 'Pronto' 
        ? 'bg-green-100 text-green-800' 
        : 'bg-blue-100 text-blue-800';
      
      const tr = document.createElement('tr');
      tr.className = 'hover:bg-gray-50';
      tr.innerHTML = `
        <td class="px-6 py-4 text-sm text-gray-900">${item.designer_nome}</td>
        <td class="px-6 py-4 text-sm text-gray-900">${item.produto_nome}</td>
        <td class="px-6 py-4 text-center text-sm text-gray-900">${item.quantidade_criada}</td>
        <td class="px-6 py-4 text-center text-sm text-green-600 font-semibold">${item.quantidade_aprovada}</td>
        <td class="px-6 py-4 text-center text-sm text-red-600">${item.quantidade_reprovada || 0}</td>
        <td class="px-6 py-4 text-center text-sm text-gray-600">${new Date(item.data).toLocaleDateString('pt-BR')}</td>
        <td class="px-6 py-4 text-center">
          <span class="px-3 py-1 rounded-full text-xs font-semibold uppercase ${prioridadeClass}">
            ${item.prioridade_calc}
          </span>
        </td>
        <td class="px-6 py-4 text-center">
          <span class="px-3 py-1 rounded-full text-xs font-semibold ${statusClass}">
            ${item.status_calc}
          </span>
        </td>
      `;
      tbody.appendChild(tr);
    });
    
  } catch (error) {
    console.error('Erro ao carregar fila:', error);
    loading.classList.add('hidden');
    showNotification('Erro ao carregar fila de produção', 'error');
  }
}

async function populateFilaDesigners() {
  try {
    const res = await axios.get(`${API_URL}/api/designers`);
    const select = document.getElementById('fila-filter-designer');
    if (!select) return;
    
    // Manter opção "Todos"
    select.innerHTML = '<option value="">Todos</option>';
    
    res.data.forEach(designer => {
      const option = document.createElement('option');
      option.value = designer.id;
      option.textContent = designer.nome;
      select.appendChild(option);
    });
  } catch (error) {
    console.error('Erro ao carregar designers:', error);
  }
}

function clearFilaFilters() {
  document.getElementById('fila-filter-designer').value = '';
  document.getElementById('fila-filter-mes').value = '';
  document.getElementById('fila-filter-ano').value = '2026';
  loadFilaProducao();
}

// ===== RANKING DE DESIGNERS =====
async function loadRanking() {
  const tbody = document.getElementById('ranking-tbody');
  const loading = document.getElementById('ranking-loading');
  const empty = document.getElementById('ranking-empty');
  
  if (!tbody || !loading || !empty) return;
  
  loading.classList.remove('hidden');
  tbody.innerHTML = '';
  empty.classList.add('hidden');
  
  try {
    const mes = document.getElementById('ranking-filter-mes')?.value || '';
    const ano = document.getElementById('ranking-filter-ano')?.value || '';
    
    let query = [];
    if (mes) query.push(`mes=${mes}`);
    if (ano) query.push(`ano=${ano}`);
    const queryString = query.length > 0 ? '?' + query.join('&') : '';
    
    const res = await axios.get(`${API_URL}/api/ranking-designers${queryString}`);
    const { data } = res.data;
    
    loading.classList.add('hidden');
    
    if (!data || data.length === 0) {
      empty.classList.remove('hidden');
      return;
    }
    
    data.forEach(item => {
      const posicaoClass = item.posicao <= 3 
        ? 'text-2xl font-bold' 
        : 'text-lg font-semibold text-gray-600';
      
      const rowClass = item.posicao === 1 
        ? 'bg-yellow-50' 
        : item.posicao === 2 
        ? 'bg-gray-50' 
        : item.posicao === 3 
        ? 'bg-orange-50' 
        : '';
      
      // Generate avatar from designer name
      const designerObj = { nome: item.designer, foto_perfil: null };
      const avatarHTML = getUserAvatar(designerObj, 'md');
      
      const tr = document.createElement('tr');
      tr.className = `hover:bg-gray-100 ${rowClass}`;
      tr.innerHTML = `
        <td class="px-6 py-4 text-center ${posicaoClass}">
          ${item.medalha || item.posicao}
        </td>
        <td class="px-6 py-4">
          <div class="flex items-center gap-3">
            ${avatarHTML}
            <span class="text-sm font-semibold text-gray-900">${item.designer}</span>
          </div>
        </td>
        <td class="px-6 py-4 text-center text-sm text-gray-900">${item.total_criadas}</td>
        <td class="px-6 py-4 text-center text-sm text-green-600 font-semibold">${item.total_aprovadas}</td>
        <td class="px-6 py-4 text-center text-sm text-red-600">${item.total_reprovadas}</td>
        <td class="px-6 py-4 text-center text-sm font-bold ${item.taxa_aprovacao >= 70 ? 'text-green-600' : item.taxa_aprovacao >= 50 ? 'text-yellow-600' : 'text-red-600'}">
          ${item.taxa_aprovacao.toFixed(1)}%
        </td>
      `;
      tbody.appendChild(tr);
    });
    
  } catch (error) {
    console.error('Erro ao carregar ranking:', error);
    loading.classList.add('hidden');
    showNotification('Erro ao carregar ranking', 'error');
  }
}

function clearRankingFilters() {
  document.getElementById('ranking-filter-mes').value = '';
  document.getElementById('ranking-filter-ano').value = '2026';
  loadRanking();
}

// ===== RELATÓRIO EXECUTIVO =====
async function loadRelatorioExecutivo() {
  const loading = document.getElementById('relatorio-loading');
  const content = document.getElementById('relatorio-content');
  const empty = document.getElementById('relatorio-empty');
  
  if (!loading || !content || !empty) return;
  
  loading.classList.remove('hidden');
  content.classList.add('hidden');
  empty.classList.add('hidden');
  
  try {
    const mes = document.getElementById('relatorio-filter-mes')?.value || '';
    const ano = document.getElementById('relatorio-filter-ano')?.value || '';
    
    let query = [];
    if (mes) query.push(`mes=${mes}`);
    if (ano) query.push(`ano=${ano}`);
    const queryString = query.length > 0 ? '?' + query.join('&') : '';
    
    const res = await axios.get(`${API_URL}/api/relatorio-executivo${queryString}`);
    const { resumo, ranking_designers, producao_produtos, producao_semanal } = res.data;
    
    loading.classList.add('hidden');
    
    if (!resumo || resumo.total_criadas === 0) {
      empty.classList.remove('hidden');
      return;
    }
    
    content.classList.remove('hidden');
    
    // Preencher resumo
    document.getElementById('resumo-criadas').textContent = resumo.total_criadas;
    document.getElementById('resumo-aprovadas').textContent = resumo.total_aprovadas;
    document.getElementById('resumo-reprovadas').textContent = resumo.total_reprovadas;
    document.getElementById('resumo-taxa').textContent = resumo.taxa_aprovacao.toFixed(1) + '%';
    
    // Preencher ranking
    const rankingTbody = document.getElementById('relatorio-ranking-tbody');
    rankingTbody.innerHTML = '';
    ranking_designers.forEach(item => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="px-4 py-3 text-sm text-gray-900">${item.designer}</td>
        <td class="px-4 py-3 text-center text-sm text-gray-900">${item.criadas}</td>
        <td class="px-4 py-3 text-center text-sm text-green-600 font-semibold">${item.aprovadas}</td>
        <td class="px-4 py-3 text-center text-sm font-semibold ${item.taxa >= 70 ? 'text-green-600' : item.taxa >= 50 ? 'text-yellow-600' : 'text-red-600'}">
          ${item.taxa.toFixed(1)}%
        </td>
      `;
      rankingTbody.appendChild(tr);
    });
    
    // Preencher produtos
    const produtosTbody = document.getElementById('relatorio-produtos-tbody');
    produtosTbody.innerHTML = '';
    producao_produtos.forEach(item => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="px-4 py-3 text-sm text-gray-900">${item.produto}</td>
        <td class="px-4 py-3 text-center text-sm text-gray-900">${item.criadas}</td>
        <td class="px-4 py-3 text-center text-sm text-green-600 font-semibold">${item.aprovadas}</td>
        <td class="px-4 py-3 text-center text-sm text-red-600">${item.reprovadas}</td>
      `;
      produtosTbody.appendChild(tr);
    });
    
    // Salvar dados globalmente para PDF
    window.relatorioData = res.data;
    
    // Renderizar gráficos
    renderProducaoSemanalChart(producao_semanal);
    renderDesempenhoDesignersChart(ranking_designers);
    
  } catch (error) {
    console.error('Erro ao carregar relatório:', error);
    loading.classList.add('hidden');
    showNotification('Erro ao carregar relatório executivo', 'error');
  }
}

function clearRelatorioFilters() {
  document.getElementById('relatorio-filter-mes').value = '';
  document.getElementById('relatorio-filter-ano').value = '2026';
  loadRelatorioExecutivo();
}

// ===== GRÁFICOS COM CHART.JS =====
function renderProducaoSemanalChart(data) {
  const ctx = document.getElementById('chart-producao-semanal');
  if (!ctx) return;
  
  // Destruir gráfico anterior
  if (producaoSemanalChart) {
    producaoSemanalChart.destroy();
  }
  
  if (!data || data.length === 0) {
    ctx.parentElement.innerHTML = '<p class="text-gray-500 text-center py-8">Sem dados para exibir</p>';
    return;
  }
  
  const labels = data.map(item => `Semana ${item.semana}`);
  const valores = data.map(item => item.total_aprovadas);
  
  producaoSemanalChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Produtos Aprovados',
        data: valores,
        backgroundColor: 'rgba(34, 197, 94, 0.7)',
        borderColor: 'rgba(34, 197, 94, 1)',
        borderWidth: 2,
        borderRadius: 6,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          display: false
        },
        title: {
          display: true,
          text: 'Produção Semanal',
          font: { size: 16, weight: 'bold' }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return `Aprovadas: ${context.parsed.y}`;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1
          }
        }
      }
    }
  });
}

function renderDesempenhoDesignersChart(data) {
  const ctx = document.getElementById('chart-desempenho-designers');
  if (!ctx) return;
  
  // Destruir gráfico anterior
  if (desempenhoDesignersChart) {
    desempenhoDesignersChart.destroy();
  }
  
  if (!data || data.length === 0) {
    ctx.parentElement.innerHTML = '<p class="text-gray-500 text-center py-8">Sem dados para exibir</p>';
    return;
  }
  
  // Pegar top 10 designers
  const top10 = data.slice(0, 10);
  const labels = top10.map(item => item.designer);
  const aprovadas = top10.map(item => item.aprovadas);
  const taxas = top10.map(item => item.taxa);
  
  desempenhoDesignersChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Aprovadas',
          data: aprovadas,
          backgroundColor: 'rgba(59, 130, 246, 0.7)',
          borderColor: 'rgba(59, 130, 246, 1)',
          borderWidth: 2,
          borderRadius: 6,
          yAxisID: 'y'
        },
        {
          label: 'Taxa de Aprovação (%)',
          data: taxas,
          type: 'line',
          borderColor: 'rgba(251, 146, 60, 1)',
          backgroundColor: 'rgba(251, 146, 60, 0.2)',
          borderWidth: 3,
          pointRadius: 5,
          pointHoverRadius: 7,
          tension: 0.3,
          yAxisID: 'y1'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      interaction: {
        mode: 'index',
        intersect: false
      },
      plugins: {
        legend: {
          display: true,
          position: 'top'
        },
        title: {
          display: true,
          text: 'Desempenho por Designer',
          font: { size: 16, weight: 'bold' }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              let label = context.dataset.label || '';
              if (label) {
                label += ': ';
              }
              if (context.dataset.yAxisID === 'y1') {
                label += context.parsed.y.toFixed(1) + '%';
              } else {
                label += context.parsed.y;
              }
              return label;
            }
          }
        }
      },
      scales: {
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          beginAtZero: true,
          title: {
            display: true,
            text: 'Produtos Aprovados'
          }
        },
        y1: {
          type: 'linear',
          display: true,
          position: 'right',
          beginAtZero: true,
          max: 100,
          title: {
            display: true,
            text: 'Taxa de Aprovação (%)'
          },
          grid: {
            drawOnChartArea: false
          }
        }
      }
    }
  });
}

async function gerarPDF() {
  if (!window.relatorioData) {
    showNotification('Carregue o relatório primeiro', 'error');
    return;
  }
  
  showNotification('Gerando PDF... (aguarde)', 'info');
  
  try {
    // Importar jsPDF
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    const data = window.relatorioData;
    const periodo = data.periodo.mes ? `${String(data.periodo.mes).padStart(2, '0')}/${data.periodo.ano}` : data.periodo.ano;
    
    // ===== PÁGINA 1: RESUMO E RANKINGS =====
    // Título
    doc.setFontSize(18);
    doc.setFont(undefined, 'bold');
    doc.text('COREPRO - Relatório Executivo', 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    doc.text(`Período: ${periodo}`, 105, 28, { align: 'center' });
    doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 105, 34, { align: 'center' });
    
    // Resumo
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Resumo Geral', 20, 48);
    
    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    doc.text(`Total Criadas: ${data.resumo.total_criadas}`, 25, 58);
    doc.text(`Total Aprovadas: ${data.resumo.total_aprovadas}`, 25, 65);
    doc.text(`Total Reprovadas: ${data.resumo.total_reprovadas}`, 25, 72);
    doc.text(`Taxa de Aprovação: ${data.resumo.taxa_aprovacao.toFixed(1)}%`, 25, 79);
    
    // Top 5 Designers
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Top 5 Designers', 20, 93);
    
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    let y = 103;
    data.ranking_designers.slice(0, 5).forEach((item, index) => {
      const medalha = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '';
      doc.text(`${medalha} ${index + 1}. ${item.designer} - ${item.aprovadas} aprovadas (${item.taxa.toFixed(1)}%)`, 25, y);
      y += 7;
    });
    
    // Top 10 Produtos
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Top 10 Produtos', 20, y + 8);
    
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    y += 18;
    data.producao_produtos.slice(0, 10).forEach((item, index) => {
      doc.text(`${index + 1}. ${item.produto.substring(0, 40)} - ${item.aprovadas} aprovadas`, 25, y);
      y += 7;
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
    });
    
    // ===== PÁGINA 2: GRÁFICOS =====
    if (producaoSemanalChart && desempenhoDesignersChart) {
      doc.addPage();
      
      // Título da página
      doc.setFontSize(16);
      doc.setFont(undefined, 'bold');
      doc.text('Gráficos de Produção', 105, 20, { align: 'center' });
      
      // Gráfico 1: Produção Semanal
      try {
        const canvas1 = document.getElementById('chart-producao-semanal');
        if (canvas1) {
          const imgData1 = canvas1.toDataURL('image/png');
          doc.setFontSize(12);
          doc.setFont(undefined, 'bold');
          doc.text('Produção Semanal', 20, 35);
          doc.addImage(imgData1, 'PNG', 15, 40, 180, 90);
        }
      } catch (e) {
        console.error('Erro ao adicionar gráfico de produção semanal:', e);
      }
      
      // Gráfico 2: Desempenho por Designer
      try {
        const canvas2 = document.getElementById('chart-desempenho-designers');
        if (canvas2) {
          const imgData2 = canvas2.toDataURL('image/png');
          doc.setFontSize(12);
          doc.setFont(undefined, 'bold');
          doc.text('Desempenho por Designer', 20, 145);
          doc.addImage(imgData2, 'PNG', 15, 150, 180, 90);
        }
      } catch (e) {
        console.error('Erro ao adicionar gráfico de desempenho:', e);
      }
    }
    
    // Salvar
    const filename = `relatorio-corepro-${periodo.replace('/', '-')}.pdf`;
    doc.save(filename);
    showNotification('PDF gerado com sucesso!', 'success');
    
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    showNotification('Erro ao gerar PDF: ' + error.message, 'error');
  }
}

// Expor funções globalmente
window.loadFilaProducao = loadFilaProducao;
window.populateFilaDesigners = populateFilaDesigners;
window.clearFilaFilters = clearFilaFilters;
window.loadRanking = loadRanking;
window.clearRankingFilters = clearRankingFilters;
window.loadRelatorioExecutivo = loadRelatorioExecutivo;
window.clearRelatorioFilters = clearRelatorioFilters;
window.gerarPDF = gerarPDF;
window.getUserAvatar = getUserAvatar;

