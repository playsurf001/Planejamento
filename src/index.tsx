import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'
import { authenticateUser, generateToken, verifyToken } from './auth'
import { generateLoginPage } from './login-page'
import { generateDesignerWeeklyControl } from './designer-weekly-control'

type Bindings = {
  DB: D1Database;
}

const app = new Hono<{ Bindings: Bindings }>()

// ======================
// UTILITIES - TIMEZONE
// ======================

/**
 * Retorna a data/hora atual no fuso horário de Brasília (America/Sao_Paulo)
 * @param format 'iso' para ISO string, 'date' para apenas data YYYY-MM-DD
 * @returns string com data/hora formatada
 */
function getBrasiliaDateTime(format: 'iso' | 'date' = 'iso'): string {
  const now = new Date();
  // Converter para horário de Brasília (UTC-3)
  const brasiliaTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
  
  if (format === 'date') {
    // Retorna apenas YYYY-MM-DD
    const year = brasiliaTime.getFullYear();
    const month = String(brasiliaTime.getMonth() + 1).padStart(2, '0');
    const day = String(brasiliaTime.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  // Retorna ISO string no formato do banco de dados
  const year = brasiliaTime.getFullYear();
  const month = String(brasiliaTime.getMonth() + 1).padStart(2, '0');
  const day = String(brasiliaTime.getDate()).padStart(2, '0');
  const hours = String(brasiliaTime.getHours()).padStart(2, '0');
  const minutes = String(brasiliaTime.getMinutes()).padStart(2, '0');
  const seconds = String(brasiliaTime.getSeconds()).padStart(2, '0');
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

// Enable CORS for API routes
app.use('/api/*', cors())

// Serve static files from Cloudflare Pages
app.use('/static/*', serveStatic({ root: './' }))
app.use('/images/*', serveStatic({ root: './' }))

// ======================
// AUTENTICAÇÃO
// ======================

// Página de login (Novo HTML profissional)
app.get('/login', (c) => {
  const loginHTML = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>COREPRO —Design</title>
  <link rel="icon" type="image/x-icon" href="/favicon.ico">
  <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
  <link rel="apple-touch-icon" sizes="180x180" href="/favicon-32x32.png">
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            teal: {
              50: '#e6f7f9',
              100: '#b3e5ec',
              200: '#80d3df',
              300: '#4dc1d2',
              400: '#1aafc5',
              500: '#00829B',
              600: '#00829B',
              700: '#006378',
              800: '#004a5a',
              900: '#00313c'
            }
          }
        }
      }
    }
  </script>
  <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
  <style>
    /* Responsividade Mobile - Android e iPhone */
    @media (max-width: 640px) {
      /* Ajustes gerais */
      body {
        font-size: 14px;
      }
      
      /* Header */
      #header {
        padding: 0.75rem 1rem !important;
      }
      
      /* Logo e título */
      .logo-text {
        font-size: 1.125rem !important;
      }
      
      /* Botões de navegação */
      .tab-button {
        padding: 0.5rem 0.75rem !important;
        font-size: 0.75rem !important;
      }
      
      .tab-button i {
        display: none !important;
      }
      
      /* Estatísticas (cards pequenos) */
      .stat-card {
        padding: 0.75rem !important;
      }
      
      .stat-value {
        font-size: 1.5rem !important;
      }
      
      /* Tabelas */
      table {
        font-size: 0.75rem !important;
      }
      
      table th, table td {
        padding: 0.5rem 0.25rem !important;
      }
      
      /* Botões de ação */
      .action-button {
        padding: 0.375rem 0.5rem !important;
        font-size: 0.75rem !important;
      }
      
      /* Modals */
      .modal-content {
        margin: 1rem !important;
        max-height: 90vh !important;
        overflow-y: auto !important;
      }
      
      /* Formulários */
      input, select, textarea {
        font-size: 16px !important; /* Previne zoom no iOS */
      }
      
      /* Grid responsivo */
      .grid {
        grid-template-columns: repeat(1, 1fr) !important;
      }
      
      .grid.grid-cols-2 {
        grid-template-columns: repeat(1, 1fr) !important;
      }
      
      .grid.grid-cols-3 {
        grid-template-columns: repeat(1, 1fr) !important;
      }
      
      .grid.grid-cols-4 {
        grid-template-columns: repeat(2, 1fr) !important;
      }
      
      /* Esconder elementos em mobile */
      .hidden-mobile {
        display: none !important;
      }
      
      /* Charts */
      canvas {
        max-height: 250px !important;
      }
      
      /* Sidebar user info */
      #userInfo {
        padding: 0.75rem !important;
      }
      
      /* Botão de logout */
      #btnLogout {
        padding: 0.5rem 1rem !important;
        font-size: 0.875rem !important;
      }
    }
    
    /* Tablets (641px - 1024px) */
    @media (min-width: 641px) and (max-width: 1024px) {
      .grid.grid-cols-3 {
        grid-template-columns: repeat(2, 1fr) !important;
      }
      
      .grid.grid-cols-4 {
        grid-template-columns: repeat(2, 1fr) !important;
      }
      
      table {
        font-size: 0.875rem !important;
      }
    }
    
    /* Ajustes para iPhone notch */
    @supports (padding-top: env(safe-area-inset-top)) {
      body {
        padding-top: env(safe-area-inset-top);
        padding-bottom: env(safe-area-inset-bottom);
      }
    }
    
    /* Scroll suave */
    * {
      -webkit-overflow-scrolling: touch;
    }
    
    /* Prevenir zoom duplo no iOS */
    button, input, select, textarea {
      touch-action: manipulation;
    }
    
    /* ========================================= */
    /* DROPDOWN MENU STYLES - ERP Professional */
    /* ========================================= */
    
    /* Dropdown container */
    .dropdown-container {
      position: relative;
    }
    
    /* Dropdown menu hidden by default */
    .dropdown-menu {
      opacity: 0;
      visibility: hidden;
      transform: translateY(-10px);
      transition: all 0.2s ease-in-out;
      pointer-events: none;
    }
    
    /* Show dropdown with .show class (via JavaScript) */
    .dropdown-menu.show {
      opacity: 1;
      visibility: visible;
      transform: translateY(0);
      pointer-events: auto;
    }
    
    /* Dropdown item hover effect */
    .dropdown-item {
      position: relative;
      overflow: hidden;
    }
    
    .dropdown-item::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      height: 100%;
      width: 3px;
      background: linear-gradient(to bottom, #0d9488, #14b8a6);
      transform: scaleY(0);
      transition: transform 0.2s ease;
    }
    
    .dropdown-item:hover::before {
      transform: scaleY(1);
    }
    
    .dropdown-item i {
      transition: all 0.2s ease;
    }
    
    .dropdown-item:hover i {
      color: #0d9488 !important;
      transform: translateX(2px);
    }
    
    /* Menu item active state */
    .menu-item.active {
      background-color: rgba(255, 255, 255, 0.2);
      font-weight: 600;
    }
    
    /* Chevron rotation when dropdown is open */
    .dropdown-menu.show ~ button .fa-chevron-down,
    .dropdown-container:has(.dropdown-menu.show) > button .fa-chevron-down {
      transform: rotate(180deg);
    }
    
    .fa-chevron-down {
      transition: transform 0.2s ease;
    }
    
    /* Smooth color transitions */
    .menu-item,
    .dropdown-item {
      transition: all 0.15s ease-in-out;
    }
    
    /* Badge/notification dot animation */
    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: 0.5;
      }
    }
    
    .animate-pulse {
      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }
  </style>
</head>
<body class="bg-gradient-to-br from-teal-500 to-teal-700 min-h-screen flex items-center justify-center">
  <div class="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
    <div class="text-center mb-8">
      <div class="mb-6 flex justify-center">
        <div class="bg-white rounded-2xl p-6 shadow-2xl border-2 border-teal-500/20">
          <img src="/images/logo.png" alt="COREPRO - DESIGN" class="h-24 w-auto object-contain">
        </div>
      </div>
      <h1 class="text-3xl font-bold text-gray-800 mb-2">COREPRO - DESIGN</h1>
      <p class="text-gray-600">Faça login para continuar</p>
    </div>

    <form id="loginForm" class="space-y-6">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          <i class="fas fa-user mr-2"></i>Usuário
        </label>
        <input 
          type="text" 
          id="username" 
          name="username"
          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          placeholder="Digite seu usuário"
          required
          autocomplete="username"
        >
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          <i class="fas fa-lock mr-2"></i>Senha
        </label>
        <div class="relative">
          <input 
            type="password" 
            id="password" 
            name="password"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            placeholder="Digite sua senha"
            required
            autocomplete="current-password"
          >
          <button 
            type="button" 
            onclick="togglePassword()"
            class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            <i id="toggleIcon" class="fas fa-eye"></i>
          </button>
        </div>
      </div>

      <div class="flex items-center">
        <input 
          type="checkbox" 
          id="remember" 
          class="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
        >
        <label for="remember" class="ml-2 text-sm text-gray-600">
          Lembrar-me
        </label>
      </div>

      <button 
        type="submit"
        class="w-full bg-teal-500 hover:bg-teal-600 text-white font-semibold py-3 rounded-lg transition duration-200 flex items-center justify-center"
      >
        <i class="fas fa-sign-in-alt mr-2"></i>
        Entrar
      </button>

      <div id="errorMessage" class="hidden bg-teal-100 border border-teal-400 text-teal-700 px-4 py-3 rounded-lg text-sm">
        <i class="fas fa-exclamation-circle mr-2"></i>
        <span id="errorText"></span>
      </div>

      <div id="successMessage" class="hidden bg-teal-100 border border-teal-400 text-teal-700 px-4 py-3 rounded-lg text-sm">
        <i class="fas fa-check-circle mr-2"></i>
        Login realizado com sucesso! Redirecionando...
      </div>
    </form>

    <div class="mt-6 text-center text-sm text-gray-600">
      <p>Usuários padrão:</p>
      <p class="mt-2 font-mono text-xs bg-gray-100 p-2 rounded">
        <strong>admin</strong> / senha: admin123<br>
        <strong>Designers</strong> / senha: [nome]123
      </p>
    </div>
  </div>

  <script>
    const API_URL = window.location.origin;

    function togglePassword() {
      const passwordInput = document.getElementById('password');
      const toggleIcon = document.getElementById('toggleIcon');
      
      if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleIcon.classList.remove('fa-eye');
        toggleIcon.classList.add('fa-eye-slash');
      } else {
        passwordInput.type = 'password';
        toggleIcon.classList.remove('fa-eye-slash');
        toggleIcon.classList.add('fa-eye');
      }
    }

    window.addEventListener('DOMContentLoaded', () => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        fetch(\`\${API_URL}/api/auth/verify\`, {
          headers: { 'Authorization': \`Bearer \${token}\` }
        })
        .then(res => res.json())
        .then(data => {
          if (data.valid) {
            window.location.href = '/';
          }
        })
        .catch(() => {
          localStorage.removeItem('auth_token');
        });
      }
    });

    document.getElementById('loginForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;
      const remember = document.getElementById('remember').checked;
      
      const errorMessage = document.getElementById('errorMessage');
      const successMessage = document.getElementById('successMessage');
      const errorText = document.getElementById('errorText');
      
      errorMessage.classList.add('hidden');
      successMessage.classList.add('hidden');
      
      try {
        const response = await fetch(\`\${API_URL}/api/auth/login\`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password, remember })
        });
        
        const data = await response.json();
        
        if (response.ok && data.token) {
          localStorage.setItem('auth_token', data.token);
          if (data.user) {
            localStorage.setItem('user_data', JSON.stringify(data.user));
          }
          
          successMessage.classList.remove('hidden');
          
          setTimeout(() => {
            window.location.href = '/';
          }, 1000);
          
        } else {
          throw new Error(data.message || 'Erro ao fazer login');
        }
        
      } catch (error) {
        errorText.textContent = error.message || 'Usuário ou senha inválidos';
        errorMessage.classList.remove('hidden');
      }
    });
  </script>
</body>
</html>
  `;
  
  return c.html(loginHTML);
})

// API de login
app.post('/api/auth/login', async (c) => {
  const { DB } = c.env
  const { username, password } = await c.req.json()
  
  const user = await authenticateUser(DB, username, password)
  
  if (!user) {
    return c.json({ success: false, message: 'Usuário ou senha inválidos' }, 401)
  }
  
  const token = generateToken(user)
  
  return c.json({
    success: true,
    token,
    user: {
      id: user.id,
      username: user.username,
      nome: user.nome,
      role: user.role,
      permissoes: user.permissoes || null
    }
  })
})

// API de verificação de token
app.get('/api/auth/verify', async (c) => {
  const authHeader = c.req.header('Authorization')
  const token = authHeader?.replace('Bearer ', '')
  
  if (!token) {
    return c.json({ success: false, message: 'Token não fornecido' }, 401)
  }
  
  const user = verifyToken(token)
  
  if (!user) {
    return c.json({ success: false, message: 'Token inválido ou expirado' }, 401)
  }
  
  return c.json({
    success: true,
    valid: true,
    user: {
      id: user.id,
      username: user.username,
      nome: user.nome,
      role: user.role,
      permissoes: user.permissoes || null
    }
  })
})

// API de logout (limpar token no cliente)
app.post('/api/auth/logout', async (c) => {
  // Backend stateless - logout é feito no frontend removendo token
  return c.json({
    success: true,
    message: 'Logout realizado com sucesso'
  })
})

// Middleware de autenticação (DESABILITADO para desenvolvimento)
// Para habilitar, descomente as linhas abaixo
/*
app.use('/*', async (c, next) => {
  // Permitir acesso à página de login e API de login
  if (c.req.path === '/login' || c.req.path === '/api/auth/login' || c.req.path.startsWith('/static/')) {
    return next()
  }
  
  // Verificar token no header
  const authHeader = c.req.header('Authorization')
  const token = authHeader?.replace('Bearer ', '')
  
  if (!token) {
    return c.redirect('/login')
  }
  
  const user = verifyToken(token)
  
  if (!user) {
    return c.redirect('/login')
  }
  
  // Token válido, continuar
  return next()
})
*/

// ======================
// API ROUTES - DESIGNERS
// ======================

app.get('/api/designers', async (c) => {
  const { DB } = c.env
  // Excluir designers com excluir_grafico = 1 (Alexandre e Evandro)
  const result = await DB.prepare('SELECT id, nome, ativo, role, created_at FROM designers WHERE ativo = 1 AND COALESCE(excluir_grafico, 0) = 0 ORDER BY nome').all()
  return c.json(result.results || [])
})

app.post('/api/designers', async (c) => {
  const { DB } = c.env
  const { nome } = await c.req.json()
  
  const result = await DB.prepare('INSERT INTO designers (nome, ativo, role) VALUES (?, 1, "user") RETURNING id, nome, ativo, role, created_at')
    .bind(nome)
    .first()
  
  return c.json(result, 201)
})

app.delete('/api/designers/:id', async (c) => {
  const { DB } = c.env
  const id = c.req.param('id')
  
  await DB.prepare('UPDATE designers SET ativo = 0 WHERE id = ?').bind(id).run()
  return c.json({ success: true })
})

// Editar perfil do usuário
app.put('/api/perfil/:id', async (c) => {
  const { DB } = c.env
  const id = c.req.param('id')
  const { nome } = await c.req.json()
  
  if (!nome || nome.trim() === '') {
    return c.json({ 
      success: false, 
      message: 'Nome é obrigatório' 
    }, 400)
  }
  
  try {
    await DB.prepare(`
      UPDATE designers 
      SET nome = ?
      WHERE id = ?
    `).bind(nome.trim(), id).run()
    
    // Buscar dados atualizados
    const updated = await DB.prepare(`
      SELECT id, nome, role, created_at
      FROM designers
      WHERE id = ?
    `).bind(id).first()
    
    return c.json({
      success: true,
      message: 'Perfil atualizado com sucesso',
      data: updated
    })
  } catch (error: any) {
    console.error('Erro ao atualizar perfil:', error)
    return c.json({ 
      success: false, 
      message: 'Erro ao atualizar perfil',
      error: error.message 
    }, 500)
  }
})

// Mudar senha
app.post('/api/perfil/:id/senha', async (c) => {
  const { DB } = c.env
  const id = c.req.param('id')
  const { senha_atual, senha_nova } = await c.req.json()
  
  if (!senha_atual || !senha_nova) {
    return c.json({ 
      success: false, 
      message: 'Senha atual e nova senha são obrigatórias' 
    }, 400)
  }
  
  if (senha_nova.length < 6) {
    return c.json({ 
      success: false, 
      message: 'Nova senha deve ter no mínimo 6 caracteres' 
    }, 400)
  }
  
  try {
    // 1. Buscar usuário
    const user = await DB.prepare(`
      SELECT id, nome, senha
      FROM designers
      WHERE id = ?
    `).bind(id).first<any>()
    
    if (!user) {
      return c.json({ 
        success: false, 
        message: 'Usuário não encontrado' 
      }, 404)
    }
    
    // 2. Verificar senha atual
    // NOTA: No sistema atual, senha = nome + '123'
    const senhaEsperada = `${user.nome}123`
    if (senha_atual !== senhaEsperada && senha_atual !== user.senha) {
      return c.json({ 
        success: false, 
        message: 'Senha atual incorreta' 
      }, 401)
    }
    
    // 3. Atualizar senha
    await DB.prepare(`
      UPDATE designers 
      SET senha = ?
      WHERE id = ?
    `).bind(senha_nova, id).run()
    
    return c.json({
      success: true,
      message: 'Senha alterada com sucesso'
    })
  } catch (error: any) {
    console.error('Erro ao alterar senha:', error)
    return c.json({ 
      success: false, 
      message: 'Erro ao alterar senha',
      error: error.message 
    }, 500)
  }
})

// ===========================
// USER PROFILE & SETTINGS API
// ===========================

// Get user profile (logged user only)
app.get('/api/user/profile', async (c) => {
  const { DB } = c.env
  const authHeader = c.req.header('Authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ success: false, message: 'Não autenticado' }, 401)
  }
  
  const token = authHeader.substring(7)
  const user = verifyToken(token)
  
  if (!user) {
    return c.json({ success: false, message: 'Token inválido' }, 401)
  }
  
  try {
    const profile = await DB.prepare(`
      SELECT 
        id, 
        nome, 
        email, 
        foto_perfil, 
        nome_exibicao, 
        role,
        configuracoes,
        created_at
      FROM designers
      WHERE id = ? AND ativo = 1
    `).bind(user.id).first<any>()
    
    if (!profile) {
      return c.json({ success: false, message: 'Usuário não encontrado' }, 404)
    }
    
    // Parse configuracoes JSON
    if (profile.configuracoes) {
      try {
        profile.configuracoes = JSON.parse(profile.configuracoes)
      } catch {
        profile.configuracoes = {}
      }
    } else {
      profile.configuracoes = {}
    }
    
    return c.json({
      success: true,
      data: profile
    })
  } catch (error: any) {
    console.error('Erro ao buscar perfil:', error)
    return c.json({ 
      success: false, 
      message: 'Erro ao buscar perfil',
      error: error.message 
    }, 500)
  }
})

// Update user profile (logged user only)
app.put('/api/user/profile', async (c) => {
  const { DB } = c.env
  const authHeader = c.req.header('Authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ success: false, message: 'Não autenticado' }, 401)
  }
  
  const token = authHeader.substring(7)
  const user = verifyToken(token)
  
  if (!user) {
    return c.json({ success: false, message: 'Token inválido' }, 401)
  }
  
  const { nome, email, nome_exibicao } = await c.req.json()
  
  // Validations
  if (!nome || nome.trim() === '') {
    return c.json({ success: false, message: 'Nome é obrigatório' }, 400)
  }
  
  if (email && email.trim() !== '' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return c.json({ success: false, message: 'Email inválido' }, 400)
  }
  
  try {
    await DB.prepare(`
      UPDATE designers 
      SET 
        nome = ?,
        email = ?,
        nome_exibicao = ?
      WHERE id = ?
    `).bind(
      nome.trim(), 
      email ? email.trim() : null,
      nome_exibicao ? nome_exibicao.trim() : null,
      user.id
    ).run()
    
    // Fetch updated profile
    const updated = await DB.prepare(`
      SELECT 
        id, 
        nome, 
        email, 
        foto_perfil, 
        nome_exibicao, 
        role,
        configuracoes,
        created_at
      FROM designers
      WHERE id = ?
    `).bind(user.id).first<any>()
    
    // Parse configuracoes
    if (updated && updated.configuracoes) {
      try {
        updated.configuracoes = JSON.parse(updated.configuracoes)
      } catch {
        updated.configuracoes = {}
      }
    }
    
    return c.json({
      success: true,
      message: 'Perfil atualizado com sucesso',
      data: updated
    })
  } catch (error: any) {
    console.error('Erro ao atualizar perfil:', error)
    return c.json({ 
      success: false, 
      message: 'Erro ao atualizar perfil',
      error: error.message 
    }, 500)
  }
})

// Update user avatar (logged user only)
app.put('/api/user/avatar', async (c) => {
  const { DB } = c.env
  const authHeader = c.req.header('Authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ success: false, message: 'Não autenticado' }, 401)
  }
  
  const token = authHeader.substring(7)
  const user = verifyToken(token)
  
  if (!user) {
    return c.json({ success: false, message: 'Token inválido' }, 401)
  }
  
  const { foto_perfil } = await c.req.json()
  
  // Validate data URL format (base64 image)
  if (!foto_perfil || !foto_perfil.startsWith('data:image/')) {
    return c.json({ 
      success: false, 
      message: 'Imagem inválida. Use formato Data URL (base64)' 
    }, 400)
  }
  
  // Check image size (limit to 500KB base64)
  if (foto_perfil.length > 700000) {
    return c.json({ 
      success: false, 
      message: 'Imagem muito grande. Máximo: 500KB' 
    }, 400)
  }
  
  try {
    await DB.prepare(`
      UPDATE designers 
      SET foto_perfil = ?
      WHERE id = ?
    `).bind(foto_perfil, user.id).run()
    
    return c.json({
      success: true,
      message: 'Foto de perfil atualizada com sucesso',
      data: { foto_perfil }
    })
  } catch (error: any) {
    console.error('Erro ao atualizar foto de perfil:', error)
    return c.json({ 
      success: false, 
      message: 'Erro ao atualizar foto de perfil',
      error: error.message 
    }, 500)
  }
})

// Change password (logged user only)
app.put('/api/user/password', async (c) => {
  const { DB } = c.env
  const authHeader = c.req.header('Authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ success: false, message: 'Não autenticado' }, 401)
  }
  
  const token = authHeader.substring(7)
  const user = verifyToken(token)
  
  if (!user) {
    return c.json({ success: false, message: 'Token inválido' }, 401)
  }
  
  const { senha_atual, senha_nova, senha_confirmacao } = await c.req.json()
  
  // Validations
  if (!senha_atual || !senha_nova || !senha_confirmacao) {
    return c.json({ 
      success: false, 
      message: 'Todos os campos são obrigatórios' 
    }, 400)
  }
  
  if (senha_nova !== senha_confirmacao) {
    return c.json({ 
      success: false, 
      message: 'Nova senha e confirmação não coincidem' 
    }, 400)
  }
  
  if (senha_nova.length < 6) {
    return c.json({ 
      success: false, 
      message: 'Nova senha deve ter no mínimo 6 caracteres' 
    }, 400)
  }
  
  try {
    // Fetch user with current password
    const dbUser = await DB.prepare(`
      SELECT id, nome, senha
      FROM designers
      WHERE id = ? AND ativo = 1
    `).bind(user.id).first<any>()
    
    if (!dbUser) {
      return c.json({ success: false, message: 'Usuário não encontrado' }, 404)
    }
    
    // Verify current password
    const senhaDefault = `${dbUser.nome}123`
    const senhaAtualCorreta = dbUser.senha 
      ? senha_atual === dbUser.senha 
      : senha_atual === senhaDefault
    
    if (!senhaAtualCorreta) {
      return c.json({ 
        success: false, 
        message: 'Senha atual incorreta' 
      }, 401)
    }
    
    // Update password
    await DB.prepare(`
      UPDATE designers 
      SET senha = ?
      WHERE id = ?
    `).bind(senha_nova, user.id).run()
    
    return c.json({
      success: true,
      message: 'Senha alterada com sucesso'
    })
  } catch (error: any) {
    console.error('Erro ao alterar senha:', error)
    return c.json({ 
      success: false, 
      message: 'Erro ao alterar senha',
      error: error.message 
    }, 500)
  }
})

// Update user settings (logged user only)
app.put('/api/user/settings', async (c) => {
  const { DB } = c.env
  const authHeader = c.req.header('Authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ success: false, message: 'Não autenticado' }, 401)
  }
  
  const token = authHeader.substring(7)
  const user = verifyToken(token)
  
  if (!user) {
    return c.json({ success: false, message: 'Token inválido' }, 401)
  }
  
  const { configuracoes } = await c.req.json()
  
  if (!configuracoes || typeof configuracoes !== 'object') {
    return c.json({ 
      success: false, 
      message: 'Configurações inválidas' 
    }, 400)
  }
  
  try {
    const configuracoesJson = JSON.stringify(configuracoes)
    
    await DB.prepare(`
      UPDATE designers 
      SET configuracoes = ?
      WHERE id = ?
    `).bind(configuracoesJson, user.id).run()
    
    return c.json({
      success: true,
      message: 'Configurações atualizadas com sucesso',
      data: { configuracoes }
    })
  } catch (error: any) {
    console.error('Erro ao atualizar configurações:', error)
    return c.json({ 
      success: false, 
      message: 'Erro ao atualizar configurações',
      error: error.message 
    }, 500)
  }
})

// ===== ADMIN ENDPOINTS - User Management =====

// Get all users (admin only)
app.get('/api/admin/users', async (c) => {
  const { DB } = c.env
  const authHeader = c.req.header('Authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ success: false, message: 'Não autenticado' }, 401)
  }
  
  const token = authHeader.substring(7)
  const user = verifyToken(token)
  
  if (!user || user.role !== 'admin') {
    return c.json({ success: false, message: 'Acesso negado' }, 403)
  }
  
  try {
    const users = await DB.prepare(`
      SELECT 
        id, 
        nome, 
        email, 
        foto_perfil, 
        nome_exibicao, 
        role, 
        ativo,
        configuracoes,
        created_at
      FROM designers
      WHERE ativo = 1
      ORDER BY nome ASC
    `).all()
    
    // Parse configuracoes JSON for each user
    const usersWithParsedConfig = users.results.map((u: any) => ({
      ...u,
      configuracoes: u.configuracoes ? JSON.parse(u.configuracoes) : {}
    }))
    
    return c.json({
      success: true,
      users: usersWithParsedConfig
    })
  } catch (error: any) {
    console.error('Erro ao buscar usuários:', error)
    return c.json({ 
      success: false, 
      message: 'Erro ao buscar usuários',
      error: error.message 
    }, 500)
  }
})

// Get specific user (admin only)
app.get('/api/admin/users/:id', async (c) => {
  const { DB } = c.env
  const userId = c.req.param('id')
  const authHeader = c.req.header('Authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ success: false, message: 'Não autenticado' }, 401)
  }
  
  const token = authHeader.substring(7)
  const user = verifyToken(token)
  
  if (!user || user.role !== 'admin') {
    return c.json({ success: false, message: 'Acesso negado' }, 403)
  }
  
  try {
    const targetUser = await DB.prepare(`
      SELECT 
        id, 
        nome, 
        email, 
        foto_perfil, 
        nome_exibicao, 
        role, 
        ativo,
        configuracoes,
        created_at
      FROM designers
      WHERE id = ?
    `).bind(userId).first<any>()
    
    if (!targetUser) {
      return c.json({ success: false, message: 'Usuário não encontrado' }, 404)
    }
    
    return c.json({
      success: true,
      user: {
        ...targetUser,
        configuracoes: targetUser.configuracoes ? JSON.parse(targetUser.configuracoes) : {}
      }
    })
  } catch (error: any) {
    console.error('Erro ao buscar usuário:', error)
    return c.json({ 
      success: false, 
      message: 'Erro ao buscar usuário',
      error: error.message 
    }, 500)
  }
})

// Update user profile (admin only)
app.put('/api/admin/users/:id/profile', async (c) => {
  const { DB } = c.env
  const userId = c.req.param('id')
  const authHeader = c.req.header('Authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ success: false, message: 'Não autenticado' }, 401)
  }
  
  const token = authHeader.substring(7)
  const user = verifyToken(token)
  
  if (!user || user.role !== 'admin') {
    return c.json({ success: false, message: 'Acesso negado' }, 403)
  }
  
  const { nome, nome_exibicao, email, role, ativo } = await c.req.json()
  
  try {
    // Build dynamic update query
    const updates: string[] = []
    const values: any[] = []
    
    if (nome !== undefined) {
      updates.push('nome = ?')
      values.push(nome)
    }
    
    if (nome_exibicao !== undefined) {
      updates.push('nome_exibicao = ?')
      values.push(nome_exibicao)
    }
    
    if (email !== undefined) {
      updates.push('email = ?')
      values.push(email)
    }
    
    if (role !== undefined) {
      updates.push('role = ?')
      values.push(role)
    }
    
    if (ativo !== undefined) {
      updates.push('ativo = ?')
      values.push(ativo ? 1 : 0)
    }
    
    if (updates.length === 0) {
      return c.json({ 
        success: false, 
        message: 'Nenhum campo para atualizar' 
      }, 400)
    }
    
    values.push(userId)
    
    await DB.prepare(`
      UPDATE designers 
      SET ${updates.join(', ')}
      WHERE id = ?
    `).bind(...values).run()
    
    // Fetch updated user
    const updatedUser = await DB.prepare(`
      SELECT 
        id, 
        nome, 
        email, 
        foto_perfil, 
        nome_exibicao, 
        role, 
        ativo,
        configuracoes,
        created_at
      FROM designers
      WHERE id = ?
    `).bind(userId).first<any>()
    
    return c.json({
      success: true,
      message: 'Perfil atualizado com sucesso',
      user: {
        ...updatedUser,
        configuracoes: updatedUser.configuracoes ? JSON.parse(updatedUser.configuracoes) : {}
      }
    })
  } catch (error: any) {
    console.error('Erro ao atualizar perfil:', error)
    return c.json({ 
      success: false, 
      message: 'Erro ao atualizar perfil',
      error: error.message 
    }, 500)
  }
})

// Update user avatar (admin only)
app.put('/api/admin/users/:id/avatar', async (c) => {
  const { DB } = c.env
  const userId = c.req.param('id')
  const authHeader = c.req.header('Authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ success: false, message: 'Não autenticado' }, 401)
  }
  
  const token = authHeader.substring(7)
  const user = verifyToken(token)
  
  if (!user || user.role !== 'admin') {
    return c.json({ success: false, message: 'Acesso negado' }, 403)
  }
  
  const { foto_perfil } = await c.req.json()
  
  if (!foto_perfil) {
    return c.json({ 
      success: false, 
      message: 'Foto de perfil é obrigatória' 
    }, 400)
  }
  
  try {
    await DB.prepare(`
      UPDATE designers 
      SET foto_perfil = ?
      WHERE id = ?
    `).bind(foto_perfil, userId).run()
    
    return c.json({
      success: true,
      message: 'Avatar atualizado com sucesso'
    })
  } catch (error: any) {
    console.error('Erro ao atualizar avatar:', error)
    return c.json({ 
      success: false, 
      message: 'Erro ao atualizar avatar',
      error: error.message 
    }, 500)
  }
})

// Reset user password (admin only)
app.put('/api/admin/users/:id/password', async (c) => {
  const { DB } = c.env
  const userId = c.req.param('id')
  const authHeader = c.req.header('Authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ success: false, message: 'Não autenticado' }, 401)
  }
  
  const token = authHeader.substring(7)
  const user = verifyToken(token)
  
  if (!user || user.role !== 'admin') {
    return c.json({ success: false, message: 'Acesso negado' }, 403)
  }
  
  const { senha_nova } = await c.req.json()
  
  if (!senha_nova) {
    return c.json({ 
      success: false, 
      message: 'Nova senha é obrigatória' 
    }, 400)
  }
  
  if (senha_nova.length < 6) {
    return c.json({ 
      success: false, 
      message: 'Nova senha deve ter no mínimo 6 caracteres' 
    }, 400)
  }
  
  try {
    await DB.prepare(`
      UPDATE designers 
      SET senha = ?
      WHERE id = ?
    `).bind(senha_nova, userId).run()
    
    return c.json({
      success: true,
      message: 'Senha resetada com sucesso'
    })
  } catch (error: any) {
    console.error('Erro ao resetar senha:', error)
    return c.json({ 
      success: false, 
      message: 'Erro ao resetar senha',
      error: error.message 
    }, 500)
  }
})

// Update user settings (admin only)
app.put('/api/admin/users/:id/settings', async (c) => {
  const { DB } = c.env
  const userId = c.req.param('id')
  const authHeader = c.req.header('Authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ success: false, message: 'Não autenticado' }, 401)
  }
  
  const token = authHeader.substring(7)
  const user = verifyToken(token)
  
  if (!user || user.role !== 'admin') {
    return c.json({ success: false, message: 'Acesso negado' }, 403)
  }
  
  const { configuracoes } = await c.req.json()
  
  if (!configuracoes || typeof configuracoes !== 'object') {
    return c.json({ 
      success: false, 
      message: 'Configurações inválidas' 
    }, 400)
  }
  
  try {
    const configuracoesJson = JSON.stringify(configuracoes)
    
    await DB.prepare(`
      UPDATE designers 
      SET configuracoes = ?
      WHERE id = ?
    `).bind(configuracoesJson, userId).run()
    
    return c.json({
      success: true,
      message: 'Configurações atualizadas com sucesso'
    })
  } catch (error: any) {
    console.error('Erro ao atualizar configurações:', error)
    return c.json({ 
      success: false, 
      message: 'Erro ao atualizar configurações',
      error: error.message 
    }, 500)
  }
})

// ======================
// ENDPOINTS SUPERVISOR
// ======================

// Get pending approvals for supervisor
app.get('/api/supervisor/pendencias', async (c) => {
  const { DB } = c.env
  const authHeader = c.req.header('Authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ success: false, message: 'Não autenticado' }, 401)
  }
  
  const token = authHeader.substring(7)
  const user = verifyToken(token)
  
  // Verificar se é admin, supervisor ou tem permissão 'pendencias'
  const hasPermission = user && (
    user.role === 'admin' || 
    user.role === 'supervisor' || 
    (user.permissoes && user.permissoes['pendencias'])
  )
  
  if (!hasPermission) {
    return c.json({ success: false, message: 'Acesso negado' }, 403)
  }
  
  try {
    let query = `
      SELECT 
        l.id,
        l.designer_id,
        d.nome as designer_nome,
        l.produto_id,
        p.nome as produto_nome,
        l.quantidade_criada,
        l.quantidade_aprovada,
        l.quantidade_reprovada,
        l.status_aprovacao,
        l.created_at,
        l.observacoes
      FROM lancamentos l
      JOIN designers d ON l.designer_id = d.id
      JOIN produtos p ON l.produto_id = p.id
      WHERE l.status_aprovacao = 'pendente'
    `
    
    // Se for supervisor, filtrar por setor
    if (user.role === 'supervisor' && user.sector_id) {
      query += ` AND d.sector_id = ${user.sector_id}`
    }
    
    query += ` ORDER BY l.created_at DESC`
    
    const result = await DB.prepare(query).all()
    
    return c.json({
      success: true,
      pendencias: result.results || []
    })
  } catch (error: any) {
    console.error('Erro ao buscar pendências:', error)
    return c.json({ 
      success: false, 
      message: 'Erro ao buscar pendências',
      error: error.message 
    }, 500)
  }
})

// Approve or reject production record
app.put('/api/supervisor/aprovar/:id', async (c) => {
  const { DB } = c.env
  const lancamentoId = c.req.param('id')
  const authHeader = c.req.header('Authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ success: false, message: 'Não autenticado' }, 401)
  }
  
  const token = authHeader.substring(7)
  const user = verifyToken(token)
  
  // Verificar se é admin, supervisor ou tem permissão 'pendencias'
  const hasPermission = user && (
    user.role === 'admin' || 
    user.role === 'supervisor' || 
    (user.permissoes && user.permissoes['pendencias'])
  )
  
  if (!hasPermission) {
    return c.json({ success: false, message: 'Acesso negado' }, 403)
  }
  
  try {
    const { status_aprovacao, quantidade_aprovada, quantidade_reprovada, motivo } = await c.req.json()
    
    // Validações
    if (!['aprovado', 'reprovado'].includes(status_aprovacao)) {
      return c.json({ 
        success: false, 
        message: 'Status inválido. Use "aprovado" ou "reprovado"' 
      }, 400)
    }
    
    // Buscar lançamento
    const lancamento = await DB.prepare(`
      SELECT l.*, d.sector_id 
      FROM lancamentos l
      JOIN designers d ON l.designer_id = d.id
      WHERE l.id = ?
    `).bind(lancamentoId).first()
    
    if (!lancamento) {
      return c.json({ 
        success: false, 
        message: 'Lançamento não encontrado' 
      }, 404)
    }
    
    // Se for supervisor, verificar setor
    if (user.role === 'supervisor' && user.sector_id && lancamento.sector_id !== user.sector_id) {
      return c.json({ 
        success: false, 
        message: 'Você não tem permissão para aprovar este lançamento' 
      }, 403)
    }
    
    // Atualizar lançamento
    await DB.prepare(`
      UPDATE lancamentos
      SET status_aprovacao = ?,
          quantidade_aprovada = ?,
          quantidade_reprovada = ?,
          aprovador_id = ?,
          data_aprovacao = datetime('now')
      WHERE id = ?
    `).bind(
      status_aprovacao,
      quantidade_aprovada || 0,
      quantidade_reprovada || 0,
      user.id,
      lancamentoId
    ).run()
    
    // Registrar no audit log
    await DB.prepare(`
      INSERT INTO audit_logs (
        actor_user_id, 
        action_type, 
        entity, 
        entity_id, 
        old_value, 
        new_value, 
        reason
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      user.id,
      status_aprovacao === 'aprovado' ? 'APPROVE' : 'REJECT',
      'lancamento',
      lancamentoId,
      JSON.stringify({ status_aprovacao: 'pendente' }),
      JSON.stringify({ 
        status_aprovacao, 
        quantidade_aprovada, 
        quantidade_reprovada 
      }),
      motivo || 'Sem motivo informado'
    ).run()
    
    return c.json({
      success: true,
      message: `Lançamento ${status_aprovacao} com sucesso`
    })
  } catch (error: any) {
    console.error('Erro ao aprovar/reprovar:', error)
    return c.json({ 
      success: false, 
      message: 'Erro ao processar aprovação',
      error: error.message 
    }, 500)
  }
})

// Edit production record (supervisor/admin only)
app.put('/api/supervisor/editar-lancamento/:id', async (c) => {
  const { DB } = c.env
  const lancamentoId = c.req.param('id')
  const authHeader = c.req.header('Authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ success: false, message: 'Não autenticado' }, 401)
  }
  
  const token = authHeader.substring(7)
  const user = verifyToken(token)
  
  // Verificar se é admin, supervisor ou tem permissão 'pendencias'
  const hasPermission = user && (
    user.role === 'admin' || 
    user.role === 'supervisor' || 
    (user.permissoes && user.permissoes['pendencias'])
  )
  
  if (!hasPermission) {
    return c.json({ success: false, message: 'Acesso negado' }, 403)
  }
  
  try {
    const { quantidade_criada, quantidade_aprovada, quantidade_reprovada, observacoes, motivo } = await c.req.json()
    
    // Buscar lançamento atual
    const lancamentoAtual = await DB.prepare(`
      SELECT l.*, d.sector_id 
      FROM lancamentos l
      JOIN designers d ON l.designer_id = d.id
      WHERE l.id = ?
    `).bind(lancamentoId).first()
    
    if (!lancamentoAtual) {
      return c.json({ 
        success: false, 
        message: 'Lançamento não encontrado' 
      }, 404)
    }
    
    // Se for supervisor, verificar setor
    if (user.role === 'supervisor' && user.sector_id && lancamentoAtual.sector_id !== user.sector_id) {
      return c.json({ 
        success: false, 
        message: 'Você não tem permissão para editar este lançamento' 
      }, 403)
    }
    
    // Atualizar lançamento
    await DB.prepare(`
      UPDATE lancamentos
      SET quantidade_criada = ?,
          quantidade_aprovada = ?,
          quantidade_reprovada = ?,
          observacoes = ?
      WHERE id = ?
    `).bind(
      quantidade_criada,
      quantidade_aprovada,
      quantidade_reprovada,
      observacoes,
      lancamentoId
    ).run()
    
    // Registrar no audit log
    await DB.prepare(`
      INSERT INTO audit_logs (
        actor_user_id,
        actor_nome,
        actor_role,
        action_type, 
        entity, 
        entity_id, 
        old_value, 
        new_value, 
        reason
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      user.id,
      user.nome,
      user.role,
      'EDIT',
      'lancamento',
      lancamentoId,
      JSON.stringify({
        quantidade_criada: lancamentoAtual.quantidade_criada,
        quantidade_aprovada: lancamentoAtual.quantidade_aprovada,
        quantidade_reprovada: lancamentoAtual.quantidade_reprovada,
        observacoes: lancamentoAtual.observacoes
      }),
      JSON.stringify({
        quantidade_criada,
        quantidade_aprovada,
        quantidade_reprovada,
        observacoes
      }),
      motivo || 'Correção de dados'
    ).run()
    
    return c.json({
      success: true,
      message: 'Lançamento atualizado com sucesso'
    })
  } catch (error: any) {
    console.error('Erro ao editar lançamento:', error)
    return c.json({ 
      success: false, 
      message: 'Erro ao editar lançamento',
      error: error.message 
    }, 500)
  }
})

// Get supervisor dashboard stats
app.get('/api/supervisor/dashboard', async (c) => {
  const { DB } = c.env
  const authHeader = c.req.header('Authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ success: false, message: 'Não autenticado' }, 401)
  }
  
  const token = authHeader.substring(7)
  const user = verifyToken(token)
  
  // Verificar se é admin, supervisor ou tem permissão 'painel-supervisor'
  const hasPermission = user && (
    user.role === 'admin' || 
    user.role === 'supervisor' || 
    (user.permissoes && user.permissoes['painel-supervisor'])
  )
  
  if (!hasPermission) {
    return c.json({ success: false, message: 'Acesso negado' }, 403)
  }
  
  try {
    let sectorFilter = ''
    if (user.role === 'supervisor' && user.sector_id) {
      sectorFilter = ` AND d.sector_id = ${user.sector_id}`
    }
    
    // Total produzido hoje
    const totalHoje = await DB.prepare(`
      SELECT COALESCE(SUM(l.quantidade_criada), 0) as total
      FROM lancamentos l
      JOIN designers d ON l.designer_id = d.id
      WHERE DATE(l.created_at) = DATE('now')
      ${sectorFilter}
    `).first()
    
    // Total reprovado hoje
    const reprovadoHoje = await DB.prepare(`
      SELECT COALESCE(SUM(l.quantidade_reprovada), 0) as total
      FROM lancamentos l
      JOIN designers d ON l.designer_id = d.id
      WHERE DATE(l.created_at) = DATE('now')
      ${sectorFilter}
    `).first()
    
    // Pendências
    const pendencias = await DB.prepare(`
      SELECT COUNT(*) as total
      FROM lancamentos l
      JOIN designers d ON l.designer_id = d.id
      WHERE l.status_aprovacao = 'pendente'
      ${sectorFilter}
    `).first()
    
    // Eficiência por usuário
    const eficiencia = await DB.prepare(`
      SELECT 
        d.nome,
        COALESCE(SUM(l.quantidade_criada), 0) as total_criado,
        COALESCE(SUM(l.quantidade_aprovada), 0) as total_aprovado,
        CASE 
          WHEN SUM(l.quantidade_criada) > 0 
          THEN ROUND((SUM(l.quantidade_aprovada) * 100.0) / SUM(l.quantidade_criada), 2)
          ELSE 0
        END as eficiencia_percent
      FROM designers d
      LEFT JOIN lancamentos l ON d.id = l.designer_id
      WHERE d.ativo = 1
      ${sectorFilter}
      GROUP BY d.id, d.nome
      ORDER BY eficiencia_percent DESC
      LIMIT 10
    `).all()
    
    return c.json({
      success: true,
      dashboard: {
        total_produzido_hoje: totalHoje?.total || 0,
        total_reprovado_hoje: reprovadoHoje?.total || 0,
        pendencias: pendencias?.total || 0,
        eficiencia_por_usuario: eficiencia.results || []
      }
    })
  } catch (error: any) {
    console.error('Erro ao buscar dashboard supervisor:', error)
    return c.json({ 
      success: false, 
      message: 'Erro ao buscar dashboard',
      error: error.message 
    }, 500)
  }
})

// Get audit logs
app.get('/api/supervisor/audit-logs', async (c) => {
  const { DB } = c.env
  const authHeader = c.req.header('Authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ success: false, message: 'Não autenticado' }, 401)
  }
  
  const token = authHeader.substring(7)
  const user = verifyToken(token)
  
  // Verificar se é admin, supervisor ou tem permissão 'painel-supervisor'
  const hasPermission = user && (
    user.role === 'admin' || 
    user.role === 'supervisor' || 
    (user.permissoes && user.permissoes['painel-supervisor'])
  )
  
  if (!hasPermission) {
    return c.json({ success: false, message: 'Acesso negado' }, 403)
  }
  
  try {
    let query = `
      SELECT 
        a.id,
        a.actor_user_id,
        d.nome as actor_nome,
        a.action_type,
        a.entity,
        a.entity_id,
        a.old_value,
        a.new_value,
        a.reason,
        a.created_at
      FROM audit_logs a
      JOIN designers d ON a.actor_user_id = d.id
    `
    
    // Se for supervisor, mostrar apenas seus próprios logs
    if (user.role === 'supervisor') {
      query += ` WHERE a.actor_user_id = ${user.id}`
    }
    
    query += ` ORDER BY a.created_at DESC LIMIT 100`
    
    const result = await DB.prepare(query).all()
    
    return c.json({
      success: true,
      logs: result.results || []
    })
  } catch (error: any) {
    console.error('Erro ao buscar audit logs:', error)
    return c.json({ 
      success: false, 
      message: 'Erro ao buscar logs',
      error: error.message 
    }, 500)
  }
})

// Delete user (admin only)
app.delete('/api/admin/users/:id', async (c) => {
  const { DB } = c.env
  const userId = c.req.param('id')
  const authHeader = c.req.header('Authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ success: false, message: 'Não autenticado' }, 401)
  }
  
  const token = authHeader.substring(7)
  const user = verifyToken(token)
  
  if (!user || user.role !== 'admin') {
    return c.json({ success: false, message: 'Acesso negado' }, 403)
  }
  
  // Prevent admin from deleting themselves
  if (user.id.toString() === userId) {
    return c.json({ 
      success: false, 
      message: 'Você não pode excluir sua própria conta' 
    }, 400)
  }
  
  try {
    // Check if user exists
    const targetUser = await DB.prepare(`
      SELECT id, nome, role
      FROM designers
      WHERE id = ?
    `).bind(userId).first<any>()
    
    if (!targetUser) {
      return c.json({ 
        success: false, 
        message: 'Usuário não encontrado' 
      }, 404)
    }
    
    // Soft delete - set ativo = 0 instead of actually deleting
    // This preserves referential integrity with other tables
    await DB.prepare(`
      UPDATE designers 
      SET ativo = 0
      WHERE id = ?
    `).bind(userId).run()
    
    return c.json({
      success: true,
      message: `Usuário "${targetUser.nome}" excluído com sucesso`
    })
  } catch (error: any) {
    console.error('Erro ao excluir usuário:', error)
    return c.json({ 
      success: false, 
      message: 'Erro ao excluir usuário',
      error: error.message 
    }, 500)
  }
})

// ===== END ADMIN ENDPOINTS =====

// Estatísticas individuais do designer
app.get('/api/designers/:id/stats', async (c) => {
  const { DB } = c.env
  const id = c.req.param('id')
  
  try {
    // 1. Informações do designer
    const designer = await DB.prepare(`
      SELECT id, nome, role, created_at 
      FROM designers 
      WHERE id = ? AND ativo = 1
    `).bind(id).first<any>()
    
    if (!designer) {
      return c.json({ error: 'Designer não encontrado' }, 404)
    }
    
    // 2. Total criado (quantidade_criada)
    const totalCriado = await DB.prepare(`
      SELECT COALESCE(SUM(quantidade_criada), 0) as total
      FROM lancamentos
      WHERE designer_id = ?
    `).bind(id).first<any>()
    
    // 3. Total aprovado (quantidade_aprovada)
    const totalAprovado = await DB.prepare(`
      SELECT COALESCE(SUM(quantidade_aprovada), 0) as total
      FROM lancamentos
      WHERE designer_id = ?
    `).bind(id).first<any>()
    
    // 3.5. Total reprovado (usando coluna quantidade_reprovada)
    const totalReprovado = await DB.prepare(`
      SELECT COALESCE(SUM(quantidade_reprovada), 0) as total
      FROM lancamentos
      WHERE designer_id = ?
    `).bind(id).first<any>()
    
    // 4. Taxa de aprovação e reprovação
    const taxaAprovacao = totalCriado.total > 0 
      ? Math.round((totalAprovado.total / totalCriado.total) * 100) 
      : 0
    
    const taxaReprovacao = totalCriado.total > 0 
      ? Math.round((totalReprovado.total / totalCriado.total) * 100) 
      : 0
    
    // 5. Produtos por status
    const porStatus = await DB.prepare(`
      SELECT 
        status,
        COUNT(*) as quantidade,
        COALESCE(SUM(quantidade_criada), 0) as total_criado,
        COALESCE(SUM(quantidade_aprovada), 0) as total_aprovado
      FROM lancamentos
      WHERE designer_id = ?
      GROUP BY status
    `).bind(id).all()
    
    // 6. Últimos lançamentos
    const ultimosLancamentos = await DB.prepare(`
      SELECT 
        l.id,
        l.data,
        l.quantidade_criada,
        l.quantidade_aprovada,
        l.status,
        p.nome as produto_nome
      FROM lancamentos l
      JOIN produtos p ON l.produto_id = p.id
      WHERE l.designer_id = ?
      ORDER BY l.data DESC, l.id DESC
      LIMIT 10
    `).bind(id).all()
    
    // 7. Comparativo com outros designers
    const ranking = await DB.prepare(`
      SELECT 
        d.id,
        d.nome,
        COALESCE(SUM(l.quantidade_criada), 0) as total_criado,
        COALESCE(SUM(l.quantidade_aprovada), 0) as total_aprovado,
        CASE 
          WHEN COALESCE(SUM(l.quantidade_criada), 0) > 0 
          THEN ROUND(CAST(COALESCE(SUM(l.quantidade_aprovada), 0) AS FLOAT) / COALESCE(SUM(l.quantidade_criada), 0) * 100, 2)
          ELSE 0
        END as taxa_aprovacao
      FROM designers d
      LEFT JOIN lancamentos l ON d.id = l.designer_id
      WHERE d.ativo = 1 AND d.role = 'user'
      GROUP BY d.id, d.nome
      ORDER BY total_aprovado DESC
    `).all()
    
    // Encontrar posição do designer no ranking
    const posicaoRanking = ranking.results.findIndex((r: any) => r.id === parseInt(id)) + 1
    
    return c.json({
      designer,
      resumo: {
        total_criado: totalCriado.total,
        total_aprovado: totalAprovado.total,
        total_reprovado: totalReprovado.total,
        taxa_aprovacao: taxaAprovacao,
        taxa_reprovacao: taxaReprovacao,
        posicao_ranking: posicaoRanking,
        total_designers: ranking.results.length
      },
      por_status: porStatus.results,
      ultimos_lancamentos: ultimosLancamentos.results,
      ranking: ranking.results
    })
  } catch (error: any) {
    console.error('Erro ao buscar estatísticas do designer:', error)
    return c.json({ 
      error: 'Erro ao buscar estatísticas',
      message: error.message 
    }, 500)
  }
})

// ================================
// API ROUTES - ACOMPANHAMENTO SEMANAL
// ================================

// GET - Buscar todos os designers com progresso de semanas baseado em planejamento
app.get('/api/designers-semanas', async (c) => {
  const { DB } = c.env
  
  try {
    // Buscar apenas designers ativos (role = 'user')
    // Excluir: Administradores, Supervisores, e usuários específicos (Alexandre, Playsurf)
    const designers = await DB.prepare(`
      SELECT id, nome, role, created_at
      FROM designers
      WHERE ativo = 1
      AND role = 'user'
      AND LOWER(nome) NOT IN ('alexandre', 'playsurf')
      ORDER BY nome ASC
    `).all()
    
    if (!designers.results || designers.results.length === 0) {
      return c.json({ designers: [] })
    }
    
    // Para cada designer, buscar semanas do planejamento e calcular progresso
    const designersComSemanas = await Promise.all(
      designers.results.map(async (designer: any) => {
        // Buscar semanas únicas do planejamento semanal
        const semanas = await DB.prepare(`
          SELECT DISTINCT
            ps.semana_numero,
            ps.semana_data_inicio,
            DATE(ps.semana_data_inicio, '+6 days') as semana_data_fim,
            ps.ano,
            (
              SELECT COUNT(DISTINCT produto_id)
              FROM planejamentos_semanais
              WHERE designer_id = ps.designer_id
              AND semana_numero = ps.semana_numero
              AND ano = ps.ano
            ) as total_produtos_planejados,
            (
              SELECT COUNT(DISTINCT l.produto_id)
              FROM lancamentos l
              WHERE l.designer_id = ps.designer_id
              AND l.semana = ps.semana_numero
              AND DATE(l.data) >= ps.semana_data_inicio
              AND DATE(l.data) <= DATE(ps.semana_data_inicio, '+6 days')
              AND l.produto_id IN (
                SELECT produto_id
                FROM planejamentos_semanais
                WHERE designer_id = ps.designer_id
                AND semana_numero = ps.semana_numero
                AND ano = ps.ano
              )
            ) as produtos_lancados,
            CASE 
              WHEN (
                SELECT COUNT(DISTINCT produto_id)
                FROM planejamentos_semanais
                WHERE designer_id = ps.designer_id
                AND semana_numero = ps.semana_numero
                AND ano = ps.ano
              ) = (
                SELECT COUNT(DISTINCT l.produto_id)
                FROM lancamentos l
                WHERE l.designer_id = ps.designer_id
                AND l.semana = ps.semana_numero
                AND DATE(l.data) >= ps.semana_data_inicio
                AND DATE(l.data) <= DATE(ps.semana_data_inicio, '+6 days')
                AND l.produto_id IN (
                  SELECT produto_id
                  FROM planejamentos_semanais
                  WHERE designer_id = ps.designer_id
                  AND semana_numero = ps.semana_numero
                  AND ano = ps.ano
                )
              ) AND (
                SELECT COUNT(DISTINCT produto_id)
                FROM planejamentos_semanais
                WHERE designer_id = ps.designer_id
                AND semana_numero = ps.semana_numero
                AND ano = ps.ano
              ) > 0
              THEN 'concluida'
              ELSE 'pendente'
            END as status,
            (
              SELECT MAX(l.created_at)
              FROM lancamentos l
              WHERE l.designer_id = ps.designer_id 
              AND l.semana = ps.semana_numero
              AND DATE(l.data) >= ps.semana_data_inicio
              AND DATE(l.data) <= DATE(ps.semana_data_inicio, '+6 days')
            ) as concluida_em
          FROM planejamentos_semanais ps
          WHERE ps.designer_id = ?
          GROUP BY ps.semana_numero, ps.ano, ps.semana_data_inicio
          ORDER BY ps.ano DESC, ps.semana_numero ASC
        `).bind(designer.id).all()
        
        const totalSemanas = semanas.results?.length || 0
        const semanasConcluidas = semanas.results?.filter((s: any) => s.status === 'concluida').length || 0
        const percentual = totalSemanas > 0 ? Math.round((semanasConcluidas / totalSemanas) * 100) : 0
        
        return {
          id: designer.id,
          nome: designer.nome,
          role: designer.role,
          semanas: semanas.results || [],
          progresso: {
            total: totalSemanas,
            concluidas: semanasConcluidas,
            pendentes: totalSemanas - semanasConcluidas,
            percentual,
            projeto_finalizado: percentual === 100
          }
        }
      })
    )
    
    return c.json({ designers: designersComSemanas })
  } catch (error: any) {
    console.error('Erro ao buscar designers com semanas:', error)
    return c.json({ 
      error: 'Erro ao buscar acompanhamento de semanas',
      message: error.message 
    }, 500)
  }
})

// ======================
// API ROUTES - PRODUTOS
// ======================

app.get('/api/produtos', async (c) => {
  const { DB } = c.env
  const result = await DB.prepare('SELECT id, nome, ativo, created_at FROM produtos WHERE ativo = 1 ORDER BY nome').all()
  return c.json(result.results || [])
})

app.post('/api/produtos', async (c) => {
  const { DB } = c.env
  const { nome } = await c.req.json()
  
  const result = await DB.prepare('INSERT INTO produtos (nome) VALUES (?) RETURNING *')
    .bind(nome)
    .first()
  
  return c.json(result, 201)
})

app.delete('/api/produtos/:id', async (c) => {
  const { DB } = c.env
  const id = c.req.param('id')
  
  await DB.prepare('UPDATE produtos SET ativo = 0 WHERE id = ?').bind(id).run()
  return c.json({ success: true })
})

// ================================
// API ROUTES - PLANEJAMENTO SEMANAL
// ================================

// Função auxiliar: Calcular semana ISO-8601
function getISOWeek(date: Date): { weekNumber: number; weekStartDate: string; year: number } {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  const weekNumber = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
  
  // Calcular segunda-feira da semana
  const mondayDate = new Date(d)
  mondayDate.setUTCDate(d.getUTCDate() - (d.getUTCDay() === 0 ? 6 : d.getUTCDay() - 1))
  
  return {
    weekNumber,
    weekStartDate: mondayDate.toISOString().split('T')[0],
    year: d.getUTCFullYear()
  }
}

// POST /api/planejamento-semanal - Criar planejamento
app.post('/api/planejamento-semanal', async (c) => {
  const { DB } = c.env
  const { produto_id, quantidade_planejada, data_base, designer_ids, aplicar_todos, admin_id } = await c.req.json()
  
  if (!produto_id || !quantidade_planejada || !data_base || !admin_id) {
    return c.json({ 
      success: false, 
      error: 'Campos obrigatórios: produto_id, quantidade_planejada, data_base, admin_id' 
    }, 400)
  }
  
  if (quantidade_planejada <= 0) {
    return c.json({ 
      success: false, 
      error: 'Quantidade deve ser maior que zero' 
    }, 400)
  }
  
  // Calcular semana ISO-8601
  const weekInfo = getISOWeek(new Date(data_base))
  
  // Verificar se produto está ativo
  const produto = await DB.prepare('SELECT * FROM produtos WHERE id = ? AND ativo = 1')
    .bind(produto_id).first()
  
  if (!produto) {
    return c.json({ 
      success: false, 
      error: 'Produto não encontrado ou inativo' 
    }, 404)
  }
  
  // Determinar lista de designers
  let designersList: number[] = []
  
  if (aplicar_todos) {
    const designers = await DB.prepare('SELECT id FROM designers WHERE ativo = 1 AND role = ?')
      .bind('user').all()
    designersList = designers.results.map((d: any) => d.id)
  } else {
    if (!designer_ids || designer_ids.length === 0) {
      return c.json({ 
        success: false, 
        error: 'Selecione pelo menos um usuário' 
      }, 400)
    }
    designersList = designer_ids
  }
  
  const created: any[] = []
  const conflicts: any[] = []
  
  for (const designer_id of designersList) {
    // Verificar se usuário existe
    const designer = await DB.prepare('SELECT * FROM designers WHERE id = ? AND ativo = 1')
      .bind(designer_id).first()
    
    if (!designer) {
      conflicts.push({ designer_id, error: 'Usuário não encontrado' })
      continue
    }
    
    // Verificar duplicidade
    const existing = await DB.prepare(`
      SELECT ps.*, d.nome as designer_nome, p.nome as produto_nome
      FROM planejamentos_semanais ps
      JOIN designers d ON ps.designer_id = d.id
      JOIN produtos p ON ps.produto_id = p.id
      WHERE ps.designer_id = ? 
        AND ps.produto_id = ? 
        AND ps.semana_numero = ? 
        AND ps.ano = ?
    `).bind(designer_id, produto_id, weekInfo.weekNumber, weekInfo.year).first()
    
    if (existing) {
      conflicts.push({ 
        designer_id, 
        designer_nome: (existing as any).designer_nome,
        produto_nome: (existing as any).produto_nome,
        semana: weekInfo.weekNumber,
        ano: weekInfo.year,
        error: 'Já existe planejamento para este usuário nesta semana'
      })
      continue
    }
    
    // Inserir planejamento
    const result = await DB.prepare(`
      INSERT INTO planejamentos_semanais 
        (designer_id, produto_id, quantidade_planejada, semana_numero, semana_data_inicio, ano, admin_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      RETURNING *
    `).bind(
      designer_id, 
      produto_id, 
      quantidade_planejada, 
      weekInfo.weekNumber, 
      weekInfo.weekStartDate, 
      weekInfo.year, 
      admin_id
    ).first()
    
    created.push(result)
  }
  
  return c.json({ 
    success: true, 
    created: created.length,
    conflicts: conflicts.length,
    data: { created, conflicts },
    semana: {
      numero: weekInfo.weekNumber,
      data_inicio: weekInfo.weekStartDate,
      ano: weekInfo.year,
      formato_exibicao: `Semana ${weekInfo.weekNumber} – ${new Date(weekInfo.weekStartDate).toLocaleDateString('pt-BR')}`
    }
  }, conflicts.length > 0 ? 207 : 201)
})

// PUT /api/planejamento-semanal/:id - Editar planejamento existente
app.put('/api/planejamento-semanal/:id', async (c) => {
  const { DB } = c.env
  const id = c.req.param('id')
  const { designer_id, produto_id, quantidade_planejada, admin_id } = await c.req.json()
  
  if (!designer_id || !produto_id || !quantidade_planejada || !admin_id) {
    return c.json({ 
      success: false, 
      error: 'Campos obrigatórios: designer_id, produto_id, quantidade_planejada, admin_id' 
    }, 400)
  }
  
  if (quantidade_planejada <= 0) {
    return c.json({ 
      success: false, 
      error: 'Quantidade deve ser maior que zero' 
    }, 400)
  }
  
  try {
    // Buscar planejamento atual
    const planejamentoAtual = await DB.prepare(`
      SELECT * FROM planejamentos_semanais WHERE id = ?
    `).bind(id).first()
    
    if (!planejamentoAtual) {
      return c.json({ 
        success: false, 
        error: 'Planejamento não encontrado' 
      }, 404)
    }
    
    // Verificar se produto está ativo
    const produto = await DB.prepare('SELECT * FROM produtos WHERE id = ? AND ativo = 1')
      .bind(produto_id).first()
    
    if (!produto) {
      return c.json({ 
        success: false, 
        error: 'Produto não encontrado ou inativo' 
      }, 404)
    }
    
    // Verificar se designer está ativo
    const designer = await DB.prepare('SELECT * FROM designers WHERE id = ? AND ativo = 1')
      .bind(designer_id).first()
    
    if (!designer) {
      return c.json({ 
        success: false, 
        error: 'Designer não encontrado ou inativo' 
      }, 404)
    }
    
    // Verificar se já existe outro planejamento com mesmo designer, produto e semana
    const duplicado = await DB.prepare(`
      SELECT * FROM planejamentos_semanais 
      WHERE designer_id = ? 
        AND produto_id = ? 
        AND semana_numero = ? 
        AND ano = ?
        AND id != ?
    `).bind(
      designer_id, 
      produto_id, 
      (planejamentoAtual as any).semana_numero, 
      (planejamentoAtual as any).ano,
      id
    ).first()
    
    if (duplicado) {
      return c.json({ 
        success: false, 
        error: 'Já existe um planejamento para este designer e produto nesta semana' 
      }, 409)
    }
    
    // Atualizar planejamento
    const result = await DB.prepare(`
      UPDATE planejamentos_semanais 
      SET 
        designer_id = ?,
        produto_id = ?,
        quantidade_planejada = ?,
        admin_id = ?,
        updated_at = DATETIME('now')
      WHERE id = ?
      RETURNING *
    `).bind(designer_id, produto_id, quantidade_planejada, admin_id, id).first()
    
    return c.json({ 
      success: true, 
      message: 'Planejamento atualizado com sucesso',
      data: result
    })
  } catch (error: any) {
    console.error('Erro ao atualizar planejamento:', error)
    return c.json({ 
      success: false, 
      error: 'Erro ao atualizar planejamento',
      details: error.message 
    }, 500)
  }
})

// GET /api/planejamento-semanal/:id - Buscar planejamento por ID
app.get('/api/planejamento-semanal/:id', async (c) => {
  const { DB } = c.env
  const id = c.req.param('id')
  
  try {
    const planejamento = await DB.prepare(`
      SELECT 
        ps.*,
        d.nome as designer_nome,
        p.nome as produto_nome,
        da.nome as admin_nome
      FROM planejamentos_semanais ps
      JOIN designers d ON ps.designer_id = d.id
      JOIN produtos p ON ps.produto_id = p.id
      JOIN designers da ON ps.admin_id = da.id
      WHERE ps.id = ?
    `).bind(id).first()
    
    if (!planejamento) {
      return c.json({ 
        success: false, 
        error: 'Planejamento não encontrado' 
      }, 404)
    }
    
    return c.json(planejamento)
  } catch (error: any) {
    console.error('Erro ao buscar planejamento:', error)
    return c.json({ 
      success: false, 
      error: 'Erro ao buscar planejamento',
      details: error.message 
    }, 500)
  }
})

// GET /api/planejamento-semanal - Listar planejamentos
app.get('/api/planejamento-semanal', async (c) => {
  const { DB } = c.env
  const { designer_id, semana, ano, produto_id } = c.req.query()
  
  let query = `
    SELECT 
      ps.*,
      d.nome as designer_nome,
      p.nome as produto_nome,
      da.nome as admin_nome
    FROM planejamentos_semanais ps
    JOIN designers d ON ps.designer_id = d.id
    JOIN produtos p ON ps.produto_id = p.id
    JOIN designers da ON ps.admin_id = da.id
    WHERE 1=1
  `
  const params: any[] = []
  
  if (designer_id) {
    query += ' AND ps.designer_id = ?'
    params.push(designer_id)
  }
  
  if (semana) {
    query += ' AND ps.semana_numero = ?'
    params.push(semana)
  }
  
  if (ano) {
    query += ' AND ps.ano = ?'
    params.push(ano)
  }
  
  if (produto_id) {
    query += ' AND ps.produto_id = ?'
    params.push(produto_id)
  }
  
  query += ' ORDER BY ps.ano DESC, ps.semana_numero DESC, d.nome'
  
  const result = await DB.prepare(query).bind(...params).all()
  
  return c.json(result.results)
})

// DELETE /api/planejamento-semanal/:id - Deletar planejamento
app.delete('/api/planejamento-semanal/:id', async (c) => {
  const { DB } = c.env
  const id = c.req.param('id')
  
  try {
    // 1. Deletar product_units relacionadas
    await DB.prepare('DELETE FROM product_units WHERE planejamento_semanal_id = ?').bind(id).run()
    
    // 2. Deletar lançamentos relacionados (se houver)
    await DB.prepare('DELETE FROM lancamentos WHERE planejamento_semanal_id = ?').bind(id).run()
    
    // 3. Deletar o planejamento
    await DB.prepare('DELETE FROM planejamentos_semanais WHERE id = ?').bind(id).run()
    
    return c.json({ success: true, message: 'Planejamento excluído com sucesso' })
  } catch (error: any) {
    console.error('Erro ao excluir planejamento:', error)
    return c.json({ 
      success: false, 
      message: 'Erro ao excluir planejamento',
      error: error.message 
    }, 500)
  }
})

// POST /api/planejamento-semanal/duplicar - Duplicar para próxima semana
app.post('/api/planejamento-semanal/duplicar', async (c) => {
  const { DB } = c.env
  const { planejamento_id, admin_id } = await c.req.json()
  
  if (!planejamento_id || !admin_id) {
    return c.json({ 
      success: false, 
      error: 'Campos obrigatórios: planejamento_id, admin_id' 
    }, 400)
  }
  
  // Buscar planejamento original
  const original = await DB.prepare(`
    SELECT * FROM planejamentos_semanais WHERE id = ?
  `).bind(planejamento_id).first<any>()
  
  if (!original) {
    return c.json({ 
      success: false, 
      error: 'Planejamento não encontrado' 
    }, 404)
  }
  
  // Calcular próxima semana
  const currentWeekStart = new Date(original.semana_data_inicio)
  currentWeekStart.setDate(currentWeekStart.getDate() + 7)
  const nextWeekInfo = getISOWeek(currentWeekStart)
  
  // Verificar duplicidade
  const existing = await DB.prepare(`
    SELECT * FROM planejamentos_semanais 
    WHERE designer_id = ? 
      AND produto_id = ? 
      AND semana_numero = ? 
      AND ano = ?
  `).bind(
    original.designer_id, 
    original.produto_id, 
    nextWeekInfo.weekNumber, 
    nextWeekInfo.year
  ).first()
  
  if (existing) {
    return c.json({ 
      success: false, 
      error: 'Já existe planejamento para a próxima semana' 
    }, 409)
  }
  
  // Criar novo planejamento
  const result = await DB.prepare(`
    INSERT INTO planejamentos_semanais 
      (designer_id, produto_id, quantidade_planejada, semana_numero, semana_data_inicio, ano, admin_id)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    RETURNING *
  `).bind(
    original.designer_id,
    original.produto_id,
    original.quantidade_planejada,
    nextWeekInfo.weekNumber,
    nextWeekInfo.weekStartDate,
    nextWeekInfo.year,
    admin_id
  ).first()
  
  return c.json({ 
    success: true, 
    data: result,
    semana: {
      numero: nextWeekInfo.weekNumber,
      data_inicio: nextWeekInfo.weekStartDate,
      ano: nextWeekInfo.year,
      formato_exibicao: `Semana ${nextWeekInfo.weekNumber} – ${new Date(nextWeekInfo.weekStartDate).toLocaleDateString('pt-BR')}`
    }
  }, 201)
})

// ======================
// API ROUTES - METAS
// ======================

app.get('/api/metas', async (c) => {
  const { DB } = c.env
  const result = await DB.prepare(`
    SELECT m.id, m.produto_id, p.nome as produto_nome, m.meta_aprovacao, m.periodo_semanas,
           m.status, m.aprovada_em, m.concluida_em, m.created_at
    FROM metas m
    JOIN produtos p ON m.produto_id = p.id
    ORDER BY 
      CASE m.status 
        WHEN 'pendente' THEN 0
        WHEN 'aprovada' THEN 1
        WHEN 'concluida' THEN 2
      END,
      p.nome
  `).all()
  return c.json(result.results)
})

app.post('/api/metas', async (c) => {
  const { DB } = c.env
  const { produto_id, meta_aprovacao, periodo_semanas } = await c.req.json()
  
  const result = await DB.prepare(`
    INSERT INTO metas (produto_id, meta_aprovacao, periodo_semanas) 
    VALUES (?, ?, ?) 
    RETURNING *
  `)
    .bind(produto_id, meta_aprovacao, periodo_semanas || 18)
    .first()
  
  return c.json(result, 201)
})

app.put('/api/metas/:id', async (c) => {
  const { DB } = c.env
  const id = c.req.param('id')
  const { meta_aprovacao, periodo_semanas } = await c.req.json()
  
  await DB.prepare(`
    UPDATE metas 
    SET meta_aprovacao = ?, periodo_semanas = ?
    WHERE id = ?
  `)
    .bind(meta_aprovacao, periodo_semanas, id)
    .run()
  
  const result = await DB.prepare('SELECT id, produto_id, meta_aprovacao, periodo_semanas, created_at FROM metas WHERE id = ?').bind(id).first()
  return c.json(result || {})
})

app.delete('/api/metas/:id', async (c) => {
  const { DB } = c.env
  const id = c.req.param('id')
  
  await DB.prepare('DELETE FROM metas WHERE id = ?').bind(id).run()
  return c.json({ success: true })
})

// Aprovar meta (ativa no TOP 6)
app.put('/api/metas/:id/aprovar', async (c) => {
  const { DB } = c.env
  const id = c.req.param('id')
  
  const meta = await DB.prepare('SELECT * FROM metas WHERE id = ?').bind(id).first()
  if (!meta) {
    return c.json({ success: false, error: 'Meta não encontrada' }, 404)
  }
  
  // Se já está aprovada, não fazer nada
  if (meta.status === 'aprovada' || meta.status === 'concluida') {
    return c.json({ success: false, error: 'Meta já está aprovada ou concluída' }, 400)
  }
  
  await DB.prepare(`
    UPDATE metas 
    SET status = 'aprovada', aprovada_em = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).bind(id).run()
  
  const result = await DB.prepare(`
    SELECT m.id, m.produto_id, p.nome as produto_nome, m.meta_aprovacao, 
           m.periodo_semanas, m.status, m.aprovada_em, m.concluida_em
    FROM metas m
    JOIN produtos p ON m.produto_id = p.id
    WHERE m.id = ?
  `).bind(id).first()
  
  return c.json({ success: true, data: result })
})

// Obter TOP 6 Metas Aprovadas com Progresso
app.get('/api/metas/top6', async (c) => {
  const { DB } = c.env
  
  // Buscar metas aprovadas (excluindo concluídas)
  const metas = await DB.prepare(`
    SELECT m.id, m.produto_id, p.nome as produto_nome, m.meta_aprovacao, 
           m.periodo_semanas, m.status, m.aprovada_em, m.concluida_em
    FROM metas m
    JOIN produtos p ON m.produto_id = p.id
    WHERE m.status IN ('aprovada', 'concluida')
    ORDER BY 
      CASE m.status 
        WHEN 'aprovada' THEN 0 
        WHEN 'concluida' THEN 1 
      END,
      m.aprovada_em DESC
    LIMIT 6
  `).all()
  
  // Calcular progresso de cada meta baseado em quantidade_criada E quantidade_aprovada nos lançamentos
  const metasComProgresso = []
  
  for (const meta of metas.results as any[]) {
    // Somar quantidade_criada E quantidade_aprovada dos lançamentos do produto
    const progresso = await DB.prepare(`
      SELECT 
        COALESCE(SUM(quantidade_criada), 0) as total_criado,
        COALESCE(SUM(quantidade_aprovada), 0) as total_aprovado
      FROM lancamentos
      WHERE produto_id = ?
    `).bind(meta.produto_id).first() as any
    
    const totalCriado = progresso?.total_criado || 0
    const totalAprovado = progresso?.total_aprovado || 0
    
    // Usar quantidade_criada para calcular o progresso (conforme solicitado)
    const percentual = meta.meta_aprovacao > 0 
      ? Math.min(Math.round((totalCriado / meta.meta_aprovacao) * 100), 100)
      : 0
    
    // Se atingiu 100% e ainda está 'aprovada', marcar como 'concluida'
    if (percentual >= 100 && meta.status === 'aprovada') {
      await DB.prepare(`
        UPDATE metas 
        SET status = 'concluida', concluida_em = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).bind(meta.id).run()
      
      meta.status = 'concluida'
      meta.concluida_em = getBrasiliaDateTime('iso')
    }
    
    metasComProgresso.push({
      ...meta,
      total_criado: totalCriado,
      total_aprovado: totalAprovado,
      progresso_percent: percentual,
      faltam: Math.max(meta.meta_aprovacao - totalCriado, 0)
    })
  }
  
  return c.json(metasComProgresso)
})

// ======================
// API ROUTES - PRODUTOS PLANEJADOS (ADMIN)
// ======================

// Listar produtos planejados (com progresso)
app.get('/api/produtos-planejados', async (c) => {
  const { DB } = c.env
  const { periodo, status, produto_id } = c.req.query()
  
  let query = `
    SELECT 
      id, produto_id, produto_nome, quantidade_planejada,
      semana, mes, ano, periodo, status, admin_id, admin_nome,
      created_at, quantidade_concluida, quantidade_aprovada, progresso_percent
    FROM vw_produtos_planejados 
    WHERE 1=1
  `
  const params: any[] = []
  
  if (periodo) {
    query += ' AND periodo = ?'
    params.push(periodo)
  }
  
  if (status) {
    query += ' AND status = ?'
    params.push(status)
  }
  
  if (produto_id) {
    query += ' AND produto_id = ?'
    params.push(produto_id)
  }
  
  query += ' ORDER BY created_at DESC'
  
  const result = await DB.prepare(query).bind(...params).all()
  return c.json(result.results)
})

// Criar produto planejado (ADMIN apenas)
app.post('/api/produtos-planejados', async (c) => {
  const { DB } = c.env
  const { produto_id, quantidade_planejada, semana, mes, ano, periodo, admin_id } = await c.req.json()
  
  // Validar campos obrigatórios
  if (!produto_id || !quantidade_planejada || !periodo || !admin_id) {
    return c.json({ 
      success: false, 
      message: 'Campos obrigatórios: produto_id, quantidade_planejada, periodo, admin_id' 
    }, 400)
  }
  
  try {
    const result = await DB.prepare(`
      INSERT INTO produtos_planejados 
        (produto_id, quantidade_planejada, semana, mes, ano, periodo, admin_id, status) 
      VALUES (?, ?, ?, ?, ?, ?, ?, 'pendente') 
      RETURNING id, produto_id, quantidade_planejada, semana, mes, ano, periodo, admin_id, status, created_at
    `)
      .bind(produto_id, quantidade_planejada, semana || null, mes || null, ano || null, periodo, admin_id)
      .first()
    
    return c.json({
      success: true,
      message: 'Planejamento criado com sucesso',
      data: result
    }, 201)
  } catch (error: any) {
    console.error('Erro ao criar planejamento:', error)
    if (error.message?.includes('UNIQUE constraint')) {
      return c.json({ 
        success: false, 
        message: 'Já existe um planejamento para este produto neste período' 
      }, 409)
    }
    return c.json({ 
      success: false, 
      message: 'Erro ao criar planejamento',
      error: error.message 
    }, 500)
  }
})

// Atualizar produto planejado (ADMIN apenas)
app.put('/api/produtos-planejados/:id', async (c) => {
  const { DB } = c.env
  const id = c.req.param('id')
  const { quantidade_planejada, status } = await c.req.json()
  
  await DB.prepare(`
    UPDATE produtos_planejados 
    SET quantidade_planejada = ?, 
        status = ?
    WHERE id = ?
  `)
    .bind(quantidade_planejada, status || 'pendente', id)
    .run()
  
  const result = await DB.prepare(`
    SELECT 
      id, produto_id, produto_nome, quantidade_planejada,
      semana, mes, ano, periodo, status, admin_id, admin_nome,
      created_at, quantidade_concluida, quantidade_aprovada, progresso_percent
    FROM vw_produtos_planejados 
    WHERE id = ?
  `).bind(id).first()
  
  return c.json({
    success: true,
    message: 'Planejamento atualizado com sucesso',
    data: result || {}
  })
})

// Deletar produto planejado (ADMIN apenas)
app.delete('/api/produtos-planejados/:id', async (c) => {
  const { DB } = c.env
  const id = c.req.param('id')
  
  try {
    // 1. Deletar lançamentos relacionados (se houver)
    await DB.prepare('DELETE FROM lancamentos WHERE planejamento_id = ?').bind(id).run()
    
    // 2. Deletar o produto planejado
    await DB.prepare('DELETE FROM produtos_planejados WHERE id = ?').bind(id).run()
    
    return c.json({ success: true, message: 'Produto planejado excluído com sucesso' })
  } catch (error: any) {
    console.error('Erro ao excluir produto planejado:', error)
    return c.json({ 
      success: false, 
      message: 'Erro ao excluir produto planejado',
      error: error.message 
    }, 500)
  }
})

// ======================
// API ROUTES - CONFIRMAR PRODUÇÃO (USER)
// ======================

// Usuário confirma conclusão de um produto planejado
app.post('/api/confirmar-producao', async (c) => {
  const { DB } = c.env
  const { planejamento_id, designer_id } = await c.req.json()
  
  if (!planejamento_id || !designer_id) {
    return c.json({ 
      success: false, 
      message: 'Campos obrigatórios: planejamento_id e designer_id' 
    }, 400)
  }
  
  try {
    // 1. Buscar produto planejado (colunas explícitas)
    const planejamento = await DB.prepare(`
      SELECT id, produto_id, quantidade_planejada, semana, periodo, status
      FROM produtos_planejados 
      WHERE id = ?
    `).bind(planejamento_id).first<any>()
    
    if (!planejamento) {
      return c.json({ 
        success: false, 
        message: 'Planejamento não encontrado' 
      }, 404)
    }
    
    // 2. Verificar se já foi confirmado (DUPLICATA)
    const jaConfirmado = await DB.prepare(`
      SELECT id FROM lancamentos 
      WHERE planejamento_id = ? AND designer_id = ?
      LIMIT 1
    `).bind(planejamento_id, designer_id).first()
    
    if (jaConfirmado) {
      return c.json({ 
        success: false, 
        message: 'Você já confirmou este produto neste período' 
      }, 409)
    }
    
    // 3. Criar lançamento automático
    const hoje = getBrasiliaDateTime('date')
    const brasiliaDate = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }))
    const semanaAtual = Math.ceil(brasiliaDate.getDate() / 7)
    
    const lancamento = await DB.prepare(`
      INSERT INTO lancamentos 
        (designer_id, produto_id, semana, data, 
         quantidade_criada, quantidade_aprovada, 
         criado_check, aprovado_ok, status, 
         planejamento_id, concluido_em, concluido_por)
      VALUES (?, ?, ?, ?, ?, ?, 1, 0, 'em_andamento', ?, CURRENT_TIMESTAMP, ?)
      RETURNING id, designer_id, produto_id, quantidade_criada, quantidade_aprovada, status
    `)
      .bind(
        designer_id, 
        planejamento.produto_id, 
        planejamento.semana || semanaAtual,
        hoje,
        planejamento.quantidade_planejada,  // quantidade_criada = quantidade planejada
        0,  // quantidade_aprovada = 0 (ainda não foi aprovada)
        planejamento_id,
        designer_id
      )
      .first()
    
    // 4. Atualizar status do planejamento
    await DB.prepare(`
      UPDATE produtos_planejados 
      SET status = 'em_andamento',
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(planejamento_id).run()
    
    return c.json({
      success: true,
      lancamento,
      message: `Produção registrada como CRIADA! ${planejamento.quantidade_planejada} unidades aguardando aprovação.`
    }, 201)
    
  } catch (error: any) {
    console.error('❌ Erro ao confirmar produção:', error)
    return c.json({ 
      success: false, 
      message: 'Erro interno ao confirmar produção',
      error: error.message
    }, 500)
  }
})

// DELETE - Desmarcar produção (permitir usuário desmarcar)
app.delete('/api/confirmar-producao', async (c) => {
  const { DB } = c.env
  const { planejamento_id, designer_id } = await c.req.json()
  
  if (!planejamento_id || !designer_id) {
    return c.json({ 
      success: false, 
      message: 'Campos obrigatórios: planejamento_id e designer_id' 
    }, 400)
  }
  
  try {
    // 1. Verificar se o lançamento existe
    const lancamento = await DB.prepare(`
      SELECT id, quantidade_criada, aprovado_ok
      FROM lancamentos 
      WHERE planejamento_id = ? AND designer_id = ?
      LIMIT 1
    `).bind(planejamento_id, designer_id).first<any>()
    
    if (!lancamento) {
      return c.json({ 
        success: false, 
        message: 'Lançamento não encontrado' 
      }, 404)
    }
    
    // 2. Verificar se já foi aprovado (não pode desmarcar se aprovado)
    if (lancamento.aprovado_ok === 1) {
      return c.json({ 
        success: false, 
        message: 'Não é possível desmarcar um produto já aprovado pelo administrador' 
      }, 403)
    }
    
    // 3. Resetar product_units relacionadas (remover lancamento_id, voltar status para pendente)
    await DB.prepare(`
      UPDATE product_units 
      SET status = 'pendente', 
          lancamento_id = NULL, 
          confirmed_at = NULL, 
          confirmed_by = NULL,
          updated_at = datetime('now')
      WHERE lancamento_id = ?
    `).bind(lancamento.id).run()
    
    // 4. Deletar lançamento
    await DB.prepare(`
      DELETE FROM lancamentos 
      WHERE id = ?
    `).bind(lancamento.id).run()
    
    // 5. Atualizar status do planejamento para pendente
    await DB.prepare(`
      UPDATE produtos_planejados 
      SET status = 'pendente',
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(planejamento_id).run()
    
    return c.json({
      success: true,
      message: `Produção desmarcada com sucesso! ${lancamento.quantidade_criada} unidades removidas.`
    }, 200)
    
  } catch (error: any) {
    console.error('❌ Erro ao desmarcar produção:', error)
    return c.json({ 
      success: false, 
      message: 'Erro interno ao desmarcar produção',
      error: error.message
    }, 500)
  }
})

// Listar produtos planejados para o usuário confirmar
// API ROUTES - MEUS PRODUTOS (USER)
app.get('/api/meus-produtos-semanais', async (c) => {
  const { DB } = c.env
  const { designer_id } = c.req.query()
  
  if (!designer_id) {
    return c.json({ error: 'designer_id obrigatório' }, 400)
  }
  
  // Buscar planejamentos semanais do usuário com contagem de unidades
  // DISTINCT garante que não haverá duplicatas mesmo com múltiplos lançamentos
  const query = `
    SELECT DISTINCT
      ps.id,
      ps.designer_id,
      ps.produto_id,
      ps.quantidade_planejada,
      ps.semana_numero,
      ps.semana_data_inicio,
      ps.ano,
      p.nome as produto_nome,
      l.id as lancamento_id,
      l.quantidade_criada,
      l.quantidade_aprovada,
      l.quantidade_reprovada,
      l.concluido_em,
      (SELECT COUNT(*) FROM product_units WHERE planejamento_semanal_id = ps.id) as units_count,
      (SELECT COUNT(*) FROM product_units WHERE planejamento_semanal_id = ps.id AND status = 'confirmado') as units_confirmed,
      (SELECT COUNT(*) FROM product_units WHERE planejamento_semanal_id = ps.id AND status = 'pendente') as units_pending
    FROM planejamentos_semanais ps
    JOIN produtos p ON ps.produto_id = p.id
    LEFT JOIN lancamentos l ON ps.id = l.planejamento_semanal_id AND l.designer_id = ps.designer_id
    WHERE ps.designer_id = ?
    ORDER BY ps.ano DESC, ps.semana_numero DESC, p.nome
  `
  
  const result = await DB.prepare(query).bind(designer_id).all()
  
  return c.json(result.results || [])
})

app.get('/api/meus-produtos-planejados', async (c) => {
  const { DB } = c.env
  const { designer_id } = c.req.query()
  
  if (!designer_id) {
    return c.json({ error: 'designer_id obrigatório' }, 400)
  }
  
  // Buscar planejamentos semanais do usuário
  const query = `
    SELECT 
      ps.id,
      ps.designer_id,
      ps.produto_id,
      ps.quantidade_planejada,
      ps.semana_numero,
      ps.semana_data_inicio,
      ps.ano,
      p.nome as produto_nome,
      CASE 
        WHEN l.id IS NOT NULL THEN 1
        ELSE 0
      END as ja_confirmado,
      l.concluido_em,
      l.quantidade_criada as quantidade_confirmada
    FROM planejamentos_semanais ps
    JOIN produtos p ON ps.produto_id = p.id
    LEFT JOIN lancamentos l ON ps.id = l.planejamento_semanal_id AND l.designer_id = ps.designer_id
    WHERE ps.designer_id = ?
    ORDER BY ps.ano DESC, ps.semana_numero DESC, p.nome
  `
  
  const result = await DB.prepare(query).bind(designer_id).all()
  
  return c.json(result.results || [])
})

// POST /api/planejamento-semanal/:id/confirmar - Confirmar produção
app.post('/api/planejamento-semanal/:id/confirmar', async (c) => {
  const { DB } = c.env
  const planejamento_id = c.req.param('id')
  const { designer_id, semana_numero, semana_data_inicio } = await c.req.json()
  
  if (!designer_id || !semana_numero || !semana_data_inicio) {
    return c.json({ 
      success: false, 
      error: 'Campos obrigatórios: designer_id, semana_numero, semana_data_inicio' 
    }, 400)
  }
  
  // Buscar planejamento
  const planejamento = await DB.prepare(`
    SELECT ps.*, p.nome as produto_nome
    FROM planejamentos_semanais ps
    JOIN produtos p ON ps.produto_id = p.id
    WHERE ps.id = ?
  `).bind(planejamento_id).first<any>()
  
  if (!planejamento) {
    return c.json({ 
      success: false, 
      error: 'Planejamento não encontrado' 
    }, 404)
  }
  
  // Verificar se já existe lançamento
  const existing = await DB.prepare(`
    SELECT id FROM lancamentos 
    WHERE planejamento_semanal_id = ? AND designer_id = ?
  `).bind(planejamento_id, designer_id).first()
  
  if (existing) {
    return c.json({ 
      success: false, 
      error: 'Produção já confirmada' 
    }, 400)
  }
  
  // Criar lançamento com a quantidade planejada como quantidade_criada
  const result = await DB.prepare(`
    INSERT INTO lancamentos 
      (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, quantidade_reprovada, planejamento_semanal_id)
    VALUES (?, ?, ?, ?, ?, 0, 0, ?)
    RETURNING *
  `).bind(
    designer_id,
    planejamento.produto_id,
    semana_numero,
    semana_data_inicio,
    planejamento.quantidade_planejada,
    planejamento_id
  ).first()
  
  return c.json({ 
    success: true, 
    data: result,
    message: `${planejamento.produto_nome} marcado para produção! ✓`
  })
})

// DELETE /api/planejamento-semanal/:id/lancamento/:lancamento_id - Desmarcar produção
app.delete('/api/planejamento-semanal/:id/lancamento/:lancamento_id', async (c) => {
  const { DB } = c.env
  const planejamento_id = c.req.param('id')
  const lancamento_id = c.req.param('lancamento_id')
  
  // Buscar lançamento
  const lancamento = await DB.prepare(`
    SELECT * FROM lancamentos WHERE id = ? AND planejamento_semanal_id = ?
  `).bind(lancamento_id, planejamento_id).first<any>()
  
  if (!lancamento) {
    return c.json({ 
      success: false, 
      error: 'Lançamento não encontrado' 
    }, 404)
  }
  
  // Verificar se já foi aprovado
  if (lancamento.quantidade_aprovada > 0) {
    return c.json({ 
      success: false, 
      error: 'Não é possível desmarcar um produto já com quantidade aprovada' 
    }, 403)
  }
  
  try {
    // 1. Resetar product_units relacionadas (remover lancamento_id, voltar status para pendente)
    await DB.prepare(`
      UPDATE product_units 
      SET status = 'pendente', 
          lancamento_id = NULL, 
          confirmed_at = NULL, 
          confirmed_by = NULL,
          updated_at = datetime('now')
      WHERE lancamento_id = ?
    `).bind(lancamento_id).run()
    
    // 2. Deletar lançamento
    await DB.prepare('DELETE FROM lancamentos WHERE id = ?').bind(lancamento_id).run()
    
    return c.json({ success: true, message: 'Produção desmarcada com sucesso' })
  } catch (error: any) {
    console.error('Erro ao desmarcar produção:', error)
    return c.json({ 
      success: false, 
      message: 'Erro ao desmarcar produção',
      error: error.message 
    }, 500)
  }
})

// ======================
// API ROUTES - PRODUCT UNITS (Individual Unit Confirmation)
// ======================

// GET /api/product-units/:planejamentoId - Get all units for a planned product
app.get('/api/product-units/:planejamentoId', async (c) => {
  const { DB } = c.env
  const planejamentoId = c.req.param('planejamentoId')
  
  try {
    // Get all units for this planejamento
    const units = await DB.prepare(`
      SELECT 
        pu.*,
        l.quantidade_criada,
        l.quantidade_aprovada,
        l.quantidade_reprovada,
        d.nome as confirmed_by_nome
      FROM product_units pu
      LEFT JOIN lancamentos l ON pu.lancamento_id = l.id
      LEFT JOIN designers d ON pu.confirmed_by = d.id
      WHERE pu.planejamento_semanal_id = ?
      ORDER BY pu.unit_number ASC
    `).bind(planejamentoId).all()
    
    return c.json({
      success: true,
      units: units.results || []
    })
  } catch (error: any) {
    console.error('Erro ao buscar unidades:', error)
    return c.json({ 
      success: false, 
      message: 'Erro ao buscar unidades',
      error: error.message 
    }, 500)
  }
})

// POST /api/product-units/initialize/:planejamentoId - Initialize units for a planned product
app.post('/api/product-units/initialize/:planejamentoId', async (c) => {
  const { DB } = c.env
  const planejamentoId = c.req.param('planejamentoId')
  
  try {
    // Get planejamento info
    const planejamento = await DB.prepare(`
      SELECT quantidade_planejada 
      FROM planejamentos_semanais 
      WHERE id = ?
    `).bind(planejamentoId).first<any>()
    
    if (!planejamento) {
      return c.json({ 
        success: false, 
        message: 'Planejamento não encontrado' 
      }, 404)
    }
    
    // Check if units already exist
    const existingUnits = await DB.prepare(`
      SELECT COUNT(*) as count 
      FROM product_units 
      WHERE planejamento_semanal_id = ?
    `).bind(planejamentoId).first<any>()
    
    if (existingUnits && existingUnits.count > 0) {
      return c.json({ 
        success: false, 
        message: 'Unidades já inicializadas' 
      }, 400)
    }
    
    // Create individual units
    const quantidadePlanejada = planejamento.quantidade_planejada
    for (let i = 1; i <= quantidadePlanejada; i++) {
      await DB.prepare(`
        INSERT INTO product_units (planejamento_semanal_id, unit_number, status)
        VALUES (?, ?, 'pendente')
      `).bind(planejamentoId, i).run()
    }
    
    return c.json({ 
      success: true, 
      message: `${quantidadePlanejada} unidades inicializadas com sucesso`
    })
  } catch (error: any) {
    console.error('Erro ao inicializar unidades:', error)
    return c.json({ 
      success: false, 
      message: 'Erro ao inicializar unidades',
      error: error.message 
    }, 500)
  }
})

// PATCH /api/product-units/:unitId/confirm - Confirm a single unit
app.patch('/api/product-units/:unitId/confirm', async (c) => {
  const { DB } = c.env
  const unitId = c.req.param('unitId')
  const authHeader = c.req.header('Authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ success: false, message: 'Não autenticado' }, 401)
  }
  
  const token = authHeader.substring(7)
  const user = verifyToken(token)
  
  if (!user) {
    return c.json({ success: false, message: 'Token inválido' }, 401)
  }
  
  try {
    const { semana_numero, semana_data_inicio } = await c.req.json()
    
    // Get unit info
    const unit = await DB.prepare(`
      SELECT pu.*, ps.produto_id, ps.designer_id, ps.quantidade_planejada
      FROM product_units pu
      JOIN planejamentos_semanais ps ON pu.planejamento_semanal_id = ps.id
      WHERE pu.id = ?
    `).bind(unitId).first<any>()
    
    if (!unit) {
      return c.json({ 
        success: false, 
        message: 'Unidade não encontrada' 
      }, 404)
    }
    
    if (unit.status === 'confirmado') {
      return c.json({ 
        success: false, 
        message: 'Unidade já confirmada' 
      }, 400)
    }
    
    // Create or update lancamento
    let lancamentoId = unit.lancamento_id
    
    if (!lancamentoId) {
      // Create new lancamento with quantidade_criada = 1
      const newLancamento = await DB.prepare(`
        INSERT INTO lancamentos 
          (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, quantidade_reprovada, planejamento_semanal_id)
        VALUES (?, ?, ?, ?, 1, 0, 0, ?)
        RETURNING id
      `).bind(
        unit.designer_id,
        unit.produto_id,
        semana_numero,
        semana_data_inicio,
        unit.planejamento_semanal_id
      ).first<any>()
      
      lancamentoId = newLancamento.id
    } else {
      // Update existing lancamento - increment quantidade_criada
      await DB.prepare(`
        UPDATE lancamentos
        SET quantidade_criada = quantidade_criada + 1
        WHERE id = ?
      `).bind(lancamentoId).run()
    }
    
    // Update unit status
    await DB.prepare(`
      UPDATE product_units
      SET status = 'confirmado',
          lancamento_id = ?,
          confirmed_at = datetime('now'),
          confirmed_by = ?,
          updated_at = datetime('now')
      WHERE id = ?
    `).bind(lancamentoId, user.id, unitId).run()
    
    return c.json({ 
      success: true, 
      message: 'Unidade confirmada com sucesso'
    })
  } catch (error: any) {
    console.error('Erro ao confirmar unidade:', error)
    return c.json({ 
      success: false, 
      message: 'Erro ao confirmar unidade',
      error: error.message 
    }, 500)
  }
})

// PATCH /api/product-units/:unitId/cancel - Cancel a unit confirmation
app.patch('/api/product-units/:unitId/cancel', async (c) => {
  const { DB } = c.env
  const unitId = c.req.param('unitId')
  const authHeader = c.req.header('Authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ success: false, message: 'Não autenticado' }, 401)
  }
  
  const token = authHeader.substring(7)
  const user = verifyToken(token)
  
  if (!user) {
    return c.json({ success: false, message: 'Token inválido' }, 401)
  }
  
  try {
    // Get unit info
    const unit = await DB.prepare(`
      SELECT * FROM product_units WHERE id = ?
    `).bind(unitId).first<any>()
    
    if (!unit) {
      return c.json({ 
        success: false, 
        message: 'Unidade não encontrada' 
      }, 404)
    }
    
    if (unit.status !== 'confirmado') {
      return c.json({ 
        success: false, 
        message: 'Unidade não está confirmada' 
      }, 400)
    }
    
    // Decrement lancamento quantidade_criada
    if (unit.lancamento_id) {
      await DB.prepare(`
        UPDATE lancamentos
        SET quantidade_criada = CASE 
          WHEN quantidade_criada > 0 THEN quantidade_criada - 1 
          ELSE 0 
        END
        WHERE id = ?
      `).bind(unit.lancamento_id).run()
    }
    
    // Update unit status
    await DB.prepare(`
      UPDATE product_units
      SET status = 'pendente',
          lancamento_id = NULL,
          confirmed_at = NULL,
          confirmed_by = NULL,
          updated_at = datetime('now')
      WHERE id = ?
    `).bind(unitId).run()
    
    return c.json({ 
      success: true, 
      message: 'Confirmação cancelada com sucesso'
    })
  } catch (error: any) {
    console.error('Erro ao cancelar confirmação:', error)
    return c.json({ 
      success: false, 
      message: 'Erro ao cancelar confirmação',
      error: error.message 
    }, 500)
  }
})

// POST /api/product-units/:planejamentoId/confirm-all - Confirm all units at once
app.post('/api/product-units/:planejamentoId/confirm-all', async (c) => {
  const { DB } = c.env
  const planejamentoId = c.req.param('planejamentoId')
  const authHeader = c.req.header('Authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ success: false, message: 'Não autenticado' }, 401)
  }
  
  const token = authHeader.substring(7)
  const user = verifyToken(token)
  
  if (!user) {
    return c.json({ success: false, message: 'Token inválido' }, 401)
  }
  
  try {
    const { semana_numero, semana_data_inicio } = await c.req.json()
    
    // Get planejamento info
    const planejamento = await DB.prepare(`
      SELECT ps.*, COUNT(pu.id) as units_count
      FROM planejamentos_semanais ps
      LEFT JOIN product_units pu ON ps.id = pu.planejamento_semanal_id
      WHERE ps.id = ?
      GROUP BY ps.id
    `).bind(planejamentoId).first<any>()
    
    if (!planejamento) {
      return c.json({ 
        success: false, 
        message: 'Planejamento não encontrado' 
      }, 404)
    }
    
    // Create or get lancamento
    let existing = await DB.prepare(`
      SELECT id, quantidade_criada FROM lancamentos 
      WHERE planejamento_semanal_id = ? AND designer_id = ?
    `).bind(planejamentoId, planejamento.designer_id).first<any>()
    
    let lancamentoId;
    
    if (existing) {
      lancamentoId = existing.id
      // Update to match quantidade_planejada
      await DB.prepare(`
        UPDATE lancamentos
        SET quantidade_criada = ?
        WHERE id = ?
      `).bind(planejamento.quantidade_planejada, lancamentoId).run()
    } else {
      // Create new lancamento
      const newLancamento = await DB.prepare(`
        INSERT INTO lancamentos 
          (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, quantidade_reprovada, planejamento_semanal_id)
        VALUES (?, ?, ?, ?, ?, 0, 0, ?)
        RETURNING id
      `).bind(
        planejamento.designer_id,
        planejamento.produto_id,
        semana_numero,
        semana_data_inicio,
        planejamento.quantidade_planejada,
        planejamentoId
      ).first<any>()
      
      lancamentoId = newLancamento.id
    }
    
    // Update all pending units to confirmado
    await DB.prepare(`
      UPDATE product_units
      SET status = 'confirmado',
          lancamento_id = ?,
          confirmed_at = datetime('now'),
          confirmed_by = ?,
          updated_at = datetime('now')
      WHERE planejamento_semanal_id = ? AND status = 'pendente'
    `).bind(lancamentoId, user.id, planejamentoId).run()
    
    return c.json({ 
      success: true, 
      message: 'Todas as unidades confirmadas com sucesso'
    })
  } catch (error: any) {
    console.error('Erro ao confirmar todas unidades:', error)
    return c.json({ 
      success: false, 
      message: 'Erro ao confirmar todas unidades',
      error: error.message 
    }, 500)
  }
})

// ======================
// API ROUTES - LANÇAMENTOS
// ======================

app.get('/api/lancamentos', async (c) => {
  const { DB } = c.env
  const { designer_id, produto_id, semana, mes, ano, limit = 100, offset = 0 } = c.req.query()
  
  let query = `
    SELECT 
      l.id, l.semana, l.data, l.quantidade_criada, l.quantidade_reprovada, l.quantidade_aprovada, l.observacoes,
      d.nome as designer_nome, d.id as designer_id,
      p.nome as produto_nome, p.id as produto_id,
      strftime('%m', l.data) as mes,
      strftime('%Y', l.data) as ano
    FROM lancamentos l
    JOIN designers d ON l.designer_id = d.id
    JOIN produtos p ON l.produto_id = p.id
    WHERE 1=1
  `
  const params: any[] = []
  
  if (designer_id) {
    query += ' AND l.designer_id = ?'
    params.push(designer_id)
  }
  
  if (produto_id) {
    query += ' AND l.produto_id = ?'
    params.push(produto_id)
  }
  
  if (semana) {
    query += ' AND l.semana = ?'
    params.push(semana)
  }
  
  if (mes) {
    query += ' AND strftime("%m", l.data) = ?'
    params.push(mes.toString().padStart(2, '0'))
  }
  
  if (ano) {
    query += ' AND strftime("%Y", l.data) = ?'
    params.push(ano)
  }
  
  query += ' ORDER BY l.data DESC, l.semana DESC LIMIT ? OFFSET ?'
  params.push(limit, offset)
  
  const result = await DB.prepare(query).bind(...params).all()
  
  // Count total
  let countQuery = `
    SELECT COUNT(*) as total
    FROM lancamentos l
    WHERE 1=1
  `
  const countParams: any[] = []
  
  if (designer_id) {
    countQuery += ' AND l.designer_id = ?'
    countParams.push(designer_id)
  }
  
  if (produto_id) {
    countQuery += ' AND l.produto_id = ?'
    countParams.push(produto_id)
  }
  
  if (semana) {
    countQuery += ' AND l.semana = ?'
    countParams.push(semana)
  }
  
  if (mes) {
    countQuery += ' AND strftime("%m", l.data) = ?'
    countParams.push(mes.toString().padStart(2, '0'))
  }
  
  if (ano) {
    countQuery += ' AND strftime("%Y", l.data) = ?'
    countParams.push(ano)
  }
  
  const countResult = await DB.prepare(countQuery).bind(...countParams).first()
  
  return c.json({
    data: result.results,
    total: countResult?.total || 0,
    limit: parseInt(limit),
    offset: parseInt(offset)
  })
})

app.get('/api/lancamentos/:id', async (c) => {
  const { DB } = c.env
  const id = c.req.param('id')
  
  const result = await DB.prepare(`
    SELECT 
      l.id, l.semana, l.data, l.quantidade_criada, l.quantidade_reprovada, l.quantidade_aprovada, l.observacoes,
      l.designer_id, l.produto_id,
      d.nome as designer_nome,
      p.nome as produto_nome
    FROM lancamentos l
    JOIN designers d ON l.designer_id = d.id
    JOIN produtos p ON l.produto_id = p.id
    WHERE l.id = ?
  `).bind(id).first()
  
  return c.json(result)
})

app.post('/api/lancamentos', async (c) => {
  const { DB } = c.env
  const { 
    designer_id, produto_id, semana, data, 
    quantidade_criada, quantidade_reprovada, quantidade_aprovada, observacoes,
    criado_check, aprovado_ok, posicao, status, aprovada_manual 
  } = await c.req.json()
  
  // Validação: reprovada não pode ser maior que criada
  const reprovada = quantidade_reprovada || 0;
  const criada = quantidade_criada || 0;
  
  if (reprovada > criada) {
    return c.json({ 
      success: false, 
      error: 'Quantidade reprovada não pode ser maior que quantidade criada' 
    }, 400);
  }
  
  // Calcular aprovada automaticamente: aprovada = criada - reprovada
  const aprovadaAutomatica = criada - reprovada;
  
  // Determinar se foi editada manualmente
  const aprovadaFinal = quantidade_aprovada !== undefined ? quantidade_aprovada : aprovadaAutomatica;
  const foiEditadoManualmente = aprovada_manual === 1 || (quantidade_aprovada !== undefined && quantidade_aprovada !== aprovadaAutomatica) ? 1 : 0;
  
  // Calcular status automaticamente se não fornecido
  let finalStatus = status;
  if (!finalStatus) {
    const criado = criado_check || (criada > 0 ? 1 : 0);
    const aprovadoBool = aprovado_ok || (aprovadaFinal > 0 ? 1 : 0);
    
    if (criado && aprovadoBool) {
      finalStatus = 'completo';
    } else if (criado || aprovadoBool) {
      finalStatus = 'em_andamento';
    } else {
      finalStatus = 'pendente';
    }
  }
  
  const result = await DB.prepare(`
    INSERT INTO lancamentos (
      designer_id, produto_id, semana, data, 
      quantidade_criada, quantidade_reprovada, quantidade_aprovada, observacoes,
      criado_check, aprovado_ok, posicao, status, aprovada_manual
    ) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) 
    RETURNING *
  `)
    .bind(
      designer_id, produto_id, semana, data, 
      criada, reprovada, aprovadaFinal, observacoes || null,
      criado_check || 0, aprovado_ok || 0, posicao || null, finalStatus, foiEditadoManualmente
    )
    .first()
  
  return c.json(result, 201)
})

app.put('/api/lancamentos/:id', async (c) => {
  const { DB } = c.env
  const id = c.req.param('id')
  
  try {
    const { 
      designer_id, produto_id, semana, data, 
      quantidade_criada, quantidade_reprovada, quantidade_aprovada, observacoes,
      criado_check, aprovado_ok, posicao, status, aprovada_manual, edicao_manual 
    } = await c.req.json()
    
    // Validação: reprovada não pode ser maior que criada
    const reprovada = quantidade_reprovada || 0;
    const criada = quantidade_criada || 0;
    
    if (reprovada > criada) {
      return c.json({ 
        success: false, 
        error: 'Quantidade reprovada não pode ser maior que quantidade criada' 
      }, 400);
    }
    
    // EDIÇÃO MANUAL: Respeitar valores fornecidos pelo admin/supervisor
    // NÃO recalcular aprovadas automaticamente durante edição manual
    let aprovadaFinal;
    let foiEditadoManualmente = 0;
    
    if (edicao_manual === true) {
      // Edição manual: usar valores exatos fornecidos
      aprovadaFinal = quantidade_aprovada;
      foiEditadoManualmente = 1;
    } else {
      // Criação automática: calcular aprovada = criada - reprovada
      const aprovadaAutomatica = criada - reprovada;
      aprovadaFinal = quantidade_aprovada !== undefined ? quantidade_aprovada : aprovadaAutomatica;
      foiEditadoManualmente = aprovada_manual === 1 || (quantidade_aprovada !== undefined && quantidade_aprovada !== aprovadaAutomatica) ? 1 : 0;
    }
    
    // Calcular status automaticamente se não fornecido
    let finalStatus = status;
    if (!finalStatus) {
      const criadoCheck = criado_check !== undefined ? criado_check : (criada > 0 ? 1 : 0);
      const aprovadoBool = aprovado_ok !== undefined ? aprovado_ok : (aprovadaFinal > 0 ? 1 : 0);
      
      if (criadoCheck && aprovadoBool) {
        finalStatus = 'completo';
      } else if (criadoCheck || aprovadoBool) {
        finalStatus = 'em_andamento';
      } else {
        finalStatus = 'pendente';
      }
    }
    
    await DB.prepare(`
      UPDATE lancamentos 
      SET designer_id = ?, produto_id = ?, semana = ?, data = ?, 
          quantidade_criada = ?, quantidade_reprovada = ?, quantidade_aprovada = ?, observacoes = ?, 
          criado_check = ?,
          aprovado_ok = ?,
          posicao = ?,
          status = ?,
          aprovada_manual = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `)
      .bind(
        designer_id, produto_id, semana, data, 
        criada, reprovada, aprovadaFinal, observacoes || null,
        criado_check !== undefined ? criado_check : 0, 
        aprovado_ok !== undefined ? aprovado_ok : 0, 
        posicao || null, 
        finalStatus, foiEditadoManualmente, id
      )
      .run()
    
    const result = await DB.prepare('SELECT * FROM lancamentos WHERE id = ?').bind(id).first()
    return c.json({ success: true, data: result, message: 'Lançamento atualizado com sucesso' })
  } catch (error: any) {
    console.error('Erro ao atualizar lançamento:', error)
    return c.json({ 
      success: false, 
      message: 'Erro ao atualizar lançamento',
      error: error.message 
    }, 500)
  }
})

app.delete('/api/lancamentos/:id', async (c) => {
  const { DB } = c.env
  const id = c.req.param('id')
  
  try {
    // 1. Resetar product_units relacionadas (remover lancamento_id, voltar status para pendente)
    await DB.prepare(`
      UPDATE product_units 
      SET status = 'pendente', 
          lancamento_id = NULL, 
          confirmed_at = NULL, 
          confirmed_by = NULL,
          updated_at = datetime('now')
      WHERE lancamento_id = ?
    `).bind(id).run()
    
    // 2. Excluir histórico de aprovações relacionado
    await DB.prepare('DELETE FROM historico_aprovacoes WHERE lancamento_id = ?').bind(id).run()
    
    // 3. Excluir o lançamento
    await DB.prepare('DELETE FROM lancamentos WHERE id = ?').bind(id).run()
    
    return c.json({ success: true, message: 'Lançamento excluído com sucesso' })
  } catch (error: any) {
    console.error('Erro ao excluir lançamento:', error)
    return c.json({ 
      success: false, 
      message: 'Erro ao excluir lançamento',
      error: error.message 
    }, 500)
  }
})

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
// Implementa a fórmula: =SE(OU(H5="OK");F5;"")
// Se marcar OK, quantidade_aprovada = quantidade_criada
app.patch('/api/lancamentos/:id/check-aprovado', async (c) => {
  const { DB } = c.env
  const id = c.req.param('id')
  const { checked } = await c.req.json()
  
  // Buscar lançamento atual para pegar quantidade_criada
  const lancamento = await DB.prepare('SELECT quantidade_criada FROM lancamentos WHERE id = ?').bind(id).first()
  
  // Se marcar OK, quantidade_aprovada = quantidade_criada (fórmula da planilha)
  const quantidade_aprovada = checked ? (lancamento.quantidade_criada || 0) : 0
  
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
    .bind(checked ? 1 : 0, quantidade_aprovada, checked ? 1 : 0, checked ? 1 : 0, id)
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


// ======================
// HEALTH CHECK
// ======================

app.get('/api/health', async (c) => {
  try {
    const { DB } = c.env
    
    if (!DB) {
      return c.json({
        status: 'error',
        database: 'not configured',
        message: 'D1 binding não configurado. Configure no Cloudflare Dashboard.'
      }, 500)
    }
    
    // Testa conexão com query simples
    await DB.prepare('SELECT 1').first()
    
    return c.json({
      status: 'ok',
      database: 'connected',
      message: 'Sistema funcionando corretamente'
    })
  } catch (error) {
    return c.json({
      status: 'error',
      database: 'connection failed',
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    }, 500)
  }
})

// ======================
// API ROUTES - APROVAÇÕES (ADMIN)
// ======================

// Listar lançamentos para aprovação
app.get('/api/aprovacoes', async (c) => {
  const { DB } = c.env
  const { status } = c.req.query()
  
  try {
    let query = `
      SELECT 
        l.id,
        l.designer_id,
        l.produto_id,
        l.data,
        l.quantidade_criada,
        l.quantidade_reprovada,
        l.quantidade_aprovada,
        l.status,
        l.criado_check,
        l.aprovado_ok,
        l.concluido_em,
        l.concluido_por,
        d.nome as designer_nome,
        p.nome as produto_nome
      FROM lancamentos l
      JOIN designers d ON l.designer_id = d.id
      JOIN produtos p ON l.produto_id = p.id
      WHERE l.criado_check = 1
    `
    
    // Filtrar por status se fornecido
    if (status && status !== 'todos') {
      if (status === 'pendente') {
        query += ' AND l.aprovado_ok = 0 AND l.status = "em_andamento"'
      } else if (status === 'aprovado') {
        query += ' AND l.aprovado_ok = 1'
      }
    }
    
    query += ' ORDER BY l.concluido_em DESC, l.id DESC'
    
    const result = await DB.prepare(query).all()
    
    return c.json(result.results || [])
  } catch (error: any) {
    console.error('Erro ao buscar aprovações:', error)
    return c.json({ error: 'Erro ao buscar aprovações', message: error.message }, 500)
  }
})

// Aprovar lançamento
app.post('/api/aprovacoes/:id/aprovar', async (c) => {
  const { DB } = c.env
  const id = c.req.param('id')
  const { admin_id, observacao } = await c.req.json()
  
  if (!admin_id) {
    return c.json({ 
      success: false, 
      message: 'ID do administrador é obrigatório' 
    }, 400)
  }
  
  try {
    // 1. Buscar lançamento
    const lancamento = await DB.prepare(`
      SELECT id, designer_id, produto_id, quantidade_criada, quantidade_aprovada, aprovado_ok
      FROM lancamentos
      WHERE id = ?
    `).bind(id).first<any>()
    
    if (!lancamento) {
      return c.json({ 
        success: false, 
        message: 'Lançamento não encontrado' 
      }, 404)
    }
    
    if (lancamento.aprovado_ok === 1) {
      return c.json({ 
        success: false, 
        message: 'Este lançamento já foi aprovado' 
      }, 409)
    }
    
    // 2. Aprovar lançamento
    const hoje = getBrasiliaDateTime('iso')
    await DB.prepare(`
      UPDATE lancamentos
      SET quantidade_aprovada = quantidade_criada,
          aprovado_ok = 1,
          status = 'aprovado',
          observacoes = ?
      WHERE id = ?
    `).bind(observacao || null, id).run()
    
    // 3. Registrar no histórico de aprovações
    await DB.prepare(`
      INSERT INTO historico_aprovacoes 
        (lancamento_id, admin_id, data_aprovacao, observacao)
      VALUES (?, ?, ?, ?)
    `).bind(id, admin_id, hoje, observacao || null).run()
    
    // 4. Buscar dados atualizados
    const atualizado = await DB.prepare(`
      SELECT 
        l.*,
        d.nome as designer_nome,
        p.nome as produto_nome
      FROM lancamentos l
      JOIN designers d ON l.designer_id = d.id
      JOIN produtos p ON l.produto_id = p.id
      WHERE l.id = ?
    `).bind(id).first()
    
    return c.json({
      success: true,
      message: `${lancamento.quantidade_criada} unidades aprovadas com sucesso!`,
      data: atualizado
    })
  } catch (error: any) {
    console.error('Erro ao aprovar lançamento:', error)
    return c.json({ 
      success: false, 
      message: 'Erro ao aprovar lançamento',
      error: error.message 
    }, 500)
  }
})

// Reprovar lançamento
app.post('/api/aprovacoes/:id/reprovar', async (c) => {
  const { DB } = c.env
  const id = c.req.param('id')
  const { admin_id, motivo } = await c.req.json()
  
  if (!admin_id || !motivo) {
    return c.json({ 
      success: false, 
      message: 'ID do administrador e motivo são obrigatórios' 
    }, 400)
  }
  
  try {
    // 1. Buscar lançamento
    const lancamento = await DB.prepare(`
      SELECT id, designer_id, produto_id, quantidade_criada
      FROM lancamentos
      WHERE id = ?
    `).bind(id).first<any>()
    
    if (!lancamento) {
      return c.json({ 
        success: false, 
        message: 'Lançamento não encontrado' 
      }, 404)
    }
    
    // 2. Reprovar lançamento
    await DB.prepare(`
      UPDATE lancamentos
      SET quantidade_aprovada = 0,
          aprovado_ok = 0,
          status = 'reprovado',
          observacoes = ?
      WHERE id = ?
    `).bind(motivo, id).run()
    
    // 3. Registrar no histórico
    const hoje = getBrasiliaDateTime('iso')
    await DB.prepare(`
      INSERT INTO historico_aprovacoes 
        (lancamento_id, admin_id, data_aprovacao, observacao, tipo)
      VALUES (?, ?, ?, ?, 'reprovacao')
    `).bind(id, admin_id, hoje, motivo).run()
    
    return c.json({
      success: true,
      message: `Lançamento reprovado: ${motivo}`
    })
  } catch (error: any) {
    console.error('Erro ao reprovar lançamento:', error)
    return c.json({ 
      success: false, 
      message: 'Erro ao reprovar lançamento',
      error: error.message 
    }, 500)
  }
})

// ======================
// RELATÓRIOS DE PRODUÇÃO
// ======================

// Endpoint: Relatórios consolidados de produção
app.get('/api/relatorios/producao', async (c) => {
  const { DB } = c.env
  const { data_inicio, data_fim } = c.req.query()
  
  if (!data_inicio || !data_fim) {
    return c.json({ 
      success: false, 
      message: 'Parâmetros data_inicio e data_fim são obrigatórios' 
    }, 400)
  }
  
  try {
    // 1. Total produzido no período
    const totalProduzido = await DB.prepare(`
      SELECT COALESCE(SUM(quantidade_aprovada), 0) as total
      FROM lancamentos
      WHERE data BETWEEN ? AND ?
        AND aprovado_ok = 1
    `).bind(data_inicio, data_fim).first<{total: number}>()
    
    // 2. Meta total (soma de todas as metas ativas)
    const metaTotal = await DB.prepare(`
      SELECT COALESCE(SUM(meta_aprovacao), 0) as total
      FROM metas
      WHERE status = 'pendente' OR status = 'aprovada'
    `).first<{total: number}>()
    
    // 3. Produção por semana
    const producaoPorSemana = await DB.prepare(`
      SELECT 
        semana,
        SUM(quantidade_aprovada) as total
      FROM lancamentos
      WHERE data BETWEEN ? AND ?
        AND aprovado_ok = 1
      GROUP BY semana
      ORDER BY semana
    `).bind(data_inicio, data_fim).all()
    
    // 4. Produção por designer
    const porDesigner = await DB.prepare(`
      SELECT 
        d.id,
        d.nome,
        COALESCE(SUM(l.quantidade_aprovada), 0) as total,
        0 as meta
      FROM designers d
      LEFT JOIN lancamentos l ON d.id = l.designer_id 
        AND l.data BETWEEN ? AND ?
        AND l.aprovado_ok = 1
      WHERE d.ativo = 1
      GROUP BY d.id, d.nome
      ORDER BY total DESC
    `).bind(data_inicio, data_fim).all()
    
    // 5. Produção por meta/produto
    const porMeta = await DB.prepare(`
      SELECT 
        p.nome as produto,
        COALESCE(m.meta_aprovacao, 0) as meta,
        COALESCE(SUM(l.quantidade_aprovada), 0) as produzido
      FROM produtos p
      LEFT JOIN metas m ON p.id = m.produto_id 
        AND (m.status = 'pendente' OR m.status = 'aprovada')
      LEFT JOIN lancamentos l ON p.id = l.produto_id 
        AND l.data BETWEEN ? AND ?
        AND l.aprovado_ok = 1
      GROUP BY p.id, p.nome, m.meta_aprovacao
      HAVING meta > 0
      ORDER BY produzido DESC
    `).bind(data_inicio, data_fim).all()
    
    // Calcular percentual
    const percentual = metaTotal && metaTotal.total > 0 
      ? (totalProduzido!.total / metaTotal.total) * 100 
      : 0
    
    return c.json({
      success: true,
      dados: {
        total_produzido: totalProduzido?.total || 0,
        meta_total: metaTotal?.total || 0,
        percentual: percentual,
        producao_por_semana: producaoPorSemana.results || [],
        por_designer: porDesigner.results || [],
        por_meta: porMeta.results || []
      }
    })
  } catch (error: any) {
    console.error('Erro ao gerar relatório:', error)
    return c.json({ 
      success: false, 
      message: 'Erro ao gerar relatório',
      error: error.message 
    }, 500)
  }
})

// Endpoint: Exportar PDF
app.get('/api/relatorios/pdf', async (c) => {
  const { data_inicio, data_fim, tipo } = c.req.query()
  
  if (!data_inicio || !data_fim || !tipo) {
    return c.json({ 
      success: false, 
      message: 'Parâmetros data_inicio, data_fim e tipo são obrigatórios' 
    }, 400)
  }
  
  // Por enquanto, retornar mensagem informativa
  // A geração real de PDF requer biblioteca como jsPDF no frontend
  // ou pdfkit no backend (não suportado no Cloudflare Workers)
  return c.json({
    success: false,
    message: 'Geração de PDF deve ser feita no frontend usando jsPDF ou similar',
    tip: 'Use window.print() ou biblioteca jsPDF para gerar PDF do conteúdo HTML'
  }, 501)
})

// Histórico de aprovações
app.get('/api/aprovacoes/historico', async (c) => {
  const { DB } = c.env
  const { limit } = c.req.query()
  
  try {
    const query = `
      SELECT 
        h.id,
        h.lancamento_id,
        h.admin_id,
        h.data_aprovacao,
        h.observacao,
        h.tipo,
        a.nome as admin_nome,
        l.quantidade_criada,
        l.quantidade_aprovada,
        d.nome as designer_nome,
        p.nome as produto_nome
      FROM historico_aprovacoes h
      JOIN designers a ON h.admin_id = a.id
      JOIN lancamentos l ON h.lancamento_id = l.id
      JOIN designers d ON l.designer_id = d.id
      JOIN produtos p ON l.produto_id = p.id
      ORDER BY h.data_aprovacao DESC
      LIMIT ?
    `
    
    const result = await DB.prepare(query).bind(parseInt(limit || '50')).all()
    
    return c.json(result.results || [])
  } catch (error: any) {
    console.error('Erro ao buscar histórico:', error)
    return c.json({ error: 'Erro ao buscar histórico', message: error.message }, 500)
  }
})

// ======================
// API ROUTES - RELATÓRIOS E DASHBOARD
// ======================

// Resumo por designer
app.get('/api/relatorios/por-designer', async (c) => {
  const { DB } = c.env
  const { semana_inicio, semana_fim, mes, ano } = c.req.query()
  
  let query = `
    SELECT 
      d.nome as designer,
      d.id as designer_id,
      COUNT(l.id) as total_lancamentos,
      SUM(l.quantidade_criada) as total_criadas,
      SUM(l.quantidade_aprovada) as total_aprovadas,
      COALESCE(SUM(l.quantidade_reprovada), 0) as total_reprovadas,
      ROUND(CAST(SUM(l.quantidade_aprovada) AS FLOAT) / NULLIF(SUM(l.quantidade_criada), 0) * 100, 2) as taxa_aprovacao,
      ROUND(CAST(COALESCE(SUM(l.quantidade_reprovada), 0) AS FLOAT) / NULLIF(SUM(l.quantidade_criada), 0) * 100, 2) as taxa_reprovacao
    FROM designers d
    LEFT JOIN lancamentos l ON d.id = l.designer_id
    WHERE d.ativo = 1
  `
  const params: any[] = []
  
  if (semana_inicio) {
    query += ' AND l.semana >= ?'
    params.push(semana_inicio)
  }
  
  if (semana_fim) {
    query += ' AND l.semana <= ?'
    params.push(semana_fim)
  }
  
  if (mes) {
    query += ' AND strftime("%m", l.data) = ?'
    params.push(mes.toString().padStart(2, '0'))
  }
  
  if (ano) {
    query += ' AND strftime("%Y", l.data) = ?'
    params.push(ano)
  }
  
  query += ' GROUP BY d.id, d.nome ORDER BY total_aprovadas DESC'
  
  const result = await DB.prepare(query).bind(...params).all()
  return c.json(result.results)
})

// Resumo por produto
app.get('/api/relatorios/por-produto', async (c) => {
  try {
    const { DB } = c.env
    if (!DB) return c.json([])
    
    const { limit } = c.req.query()
    
    // Query simples sem filtros complexos
    const query = `
      SELECT 
        p.nome as produto,
        p.id as produto_id,
        0 as meta_aprovacao,
        COUNT(l.id) as total_lancamentos,
        COALESCE(SUM(l.quantidade_criada), 0) as total_criadas,
        COALESCE(SUM(l.quantidade_aprovada), 0) as total_aprovadas,
        ROUND(CAST(COALESCE(SUM(l.quantidade_aprovada), 0) AS FLOAT) / NULLIF(COALESCE(SUM(l.quantidade_criada), 0), 0) * 100, 2) as taxa_aprovacao,
        NULL as progresso_meta,
        MAX(l.updated_at) as ultima_atualizacao
      FROM produtos p
      LEFT JOIN lancamentos l ON p.id = l.produto_id
      WHERE p.ativo = 1
      GROUP BY p.id, p.nome
      ORDER BY total_aprovadas DESC
      LIMIT ?
    `
    
    const result = await DB.prepare(query).bind(limit ? parseInt(limit) : 10).all()
    return c.json(result.results || [])
  } catch (error) {
    console.error('Erro em por-produto:', error)
    return c.json([])
  }
})

// Estatísticas gerais
app.get('/api/relatorios/estatisticas', async (c) => {
  try {
    const { DB } = c.env
    
    if (!DB) {
      return c.json({
        total_designers: 0,
        total_produtos: 0,
        total_lancamentos: 0,
        total_criadas: 0,
        total_aprovadas: 0,
        total_reprovadas: 0,
        taxa_aprovacao_geral: 0,
        taxa_reprovacao_geral: 0
      })
    }
    
    const { mes, ano } = c.req.query()
    
    let query = `
      SELECT 
        COUNT(DISTINCT designer_id) as total_designers,
        COUNT(DISTINCT produto_id) as total_produtos,
        COUNT(*) as total_lancamentos,
        COALESCE(SUM(quantidade_criada), 0) as total_criadas,
        COALESCE(SUM(quantidade_aprovada), 0) as total_aprovadas,
        COALESCE(SUM(quantidade_reprovada), 0) as total_reprovadas,
        COALESCE(ROUND(CAST(SUM(quantidade_aprovada) AS FLOAT) / NULLIF(SUM(quantidade_criada), 0) * 100, 2), 0) as taxa_aprovacao_geral,
        COALESCE(ROUND(CAST(SUM(quantidade_reprovada) AS FLOAT) / NULLIF(SUM(quantidade_criada), 0) * 100, 2), 0) as taxa_reprovacao_geral
      FROM lancamentos
      WHERE 1=1
    `
    const params: any[] = []
    
    if (mes) {
      query += ' AND strftime("%m", data) = ?'
      params.push(mes.toString().padStart(2, '0'))
    }
    
    if (ano) {
      query += ' AND strftime("%Y", data) = ?'
      params.push(ano)
    }
    
    const stats = await DB.prepare(query).bind(...params).first()
    
    // Garantir que retorna zeros se não houver dados
    return c.json({
      total_designers: stats?.total_designers || 0,
      total_produtos: stats?.total_produtos || 0,
      total_lancamentos: stats?.total_lancamentos || 0,
      total_criadas: stats?.total_criadas || 0,
      total_aprovadas: stats?.total_aprovadas || 0,
      total_reprovadas: stats?.total_reprovadas || 0,
      taxa_aprovacao_geral: stats?.taxa_aprovacao_geral || 0,
      taxa_reprovacao_geral: stats?.taxa_reprovacao_geral || 0
    })
  } catch (error) {
    console.error('Erro em /api/relatorios/estatisticas:', error)
    return c.json({
      total_designers: 0,
      total_produtos: 0,
      total_lancamentos: 0,
      total_criadas: 0,
      total_aprovadas: 0,
      taxa_aprovacao_geral: 0
    })
  }
})

// Timeline de produção
app.get('/api/relatorios/timeline', async (c) => {
  const { DB } = c.env
  const { limit = 12, mes, ano } = c.req.query()
  
  let query = `
    SELECT 
      semana,
      strftime('%m', data) as mes,
      strftime('%Y', data) as ano,
      COUNT(*) as total_lancamentos,
      SUM(quantidade_criada) as total_criadas,
      SUM(quantidade_aprovada) as total_aprovadas,
      COALESCE(SUM(quantidade_reprovada), 0) as total_reprovadas,
      ROUND(CAST(SUM(quantidade_aprovada) AS FLOAT) / NULLIF(SUM(quantidade_criada), 0) * 100, 2) as taxa_aprovacao,
      ROUND(CAST(COALESCE(SUM(quantidade_reprovada), 0) AS FLOAT) / NULLIF(SUM(quantidade_criada), 0) * 100, 2) as taxa_reprovacao
    FROM lancamentos
    WHERE 1=1
  `
  const params: any[] = []
  
  if (mes) {
    query += ' AND strftime("%m", data) = ?'
    params.push(mes.toString().padStart(2, '0'))
  }
  
  if (ano) {
    query += ' AND strftime("%Y", data) = ?'
    params.push(ano)
  }
  
  query += ' GROUP BY semana, mes, ano ORDER BY ano DESC, semana DESC LIMIT ?'
  params.push(limit)
  
  const result = await DB.prepare(query).bind(...params).all()
  
  return c.json(result.results)
})

// GET /api/relatorios/completo - Relatório consolidado com todas métricas
app.get('/api/relatorios/completo', async (c) => {
  const { DB } = c.env
  const { mes, ano, designer_id, produto_id } = c.req.query()
  
  try {
    // Construir filtros
    let whereClause = 'WHERE 1=1'
    const params: any[] = []
    
    if (mes) {
      whereClause += ' AND strftime("%m", l.data) = ?'
      params.push(mes.toString().padStart(2, '0'))
    }
    
    if (ano) {
      whereClause += ' AND strftime("%Y", l.data) = ?'
      params.push(ano)
    }
    
    if (designer_id) {
      whereClause += ' AND l.designer_id = ?'
      params.push(designer_id)
    }
    
    if (produto_id) {
      whereClause += ' AND l.produto_id = ?'
      params.push(produto_id)
    }
    
    // 1. MÉTRICAS GERAIS
    const metricsQuery = `
      SELECT 
        COUNT(DISTINCT l.designer_id) as total_designers,
        COUNT(DISTINCT l.produto_id) as total_produtos,
        COUNT(*) as total_lancamentos,
        SUM(l.quantidade_criada) as total_criadas,
        SUM(l.quantidade_aprovada) as total_aprovadas,
        COALESCE(SUM(l.quantidade_reprovada), 0) as total_reprovadas,
        ROUND(CAST(SUM(l.quantidade_aprovada) AS FLOAT) / NULLIF(SUM(l.quantidade_criada), 0) * 100, 2) as taxa_aprovacao_geral,
        ROUND(CAST(COALESCE(SUM(l.quantidade_reprovada), 0) AS FLOAT) / NULLIF(SUM(l.quantidade_criada), 0) * 100, 2) as taxa_reprovacao_geral
      FROM lancamentos l
      ${whereClause}
    `
    const metrics = await DB.prepare(metricsQuery).bind(...params).first()
    
    // 2. PERFORMANCE POR DESIGNER (Top 10)
    const designersQuery = `
      SELECT 
        d.id,
        d.nome as designer,
        COUNT(l.id) as total_lancamentos,
        SUM(l.quantidade_criada) as total_criadas,
        SUM(l.quantidade_aprovada) as total_aprovadas,
        COALESCE(SUM(l.quantidade_reprovada), 0) as total_reprovadas,
        ROUND(CAST(SUM(l.quantidade_aprovada) AS FLOAT) / NULLIF(SUM(l.quantidade_criada), 0) * 100, 2) as taxa_aprovacao,
        ROUND(CAST(SUM(l.quantidade_aprovada) AS FLOAT) / COUNT(l.id), 2) as media_aprovadas_por_lancamento
      FROM designers d
      JOIN lancamentos l ON d.id = l.designer_id
      ${whereClause}
      GROUP BY d.id, d.nome
      ORDER BY total_aprovadas DESC
      LIMIT 10
    `
    const designers = await DB.prepare(designersQuery).bind(...params).all()
    
    // 3. PERFORMANCE POR PRODUTO (Top 10) - SEM m.ativo
    const produtosQuery = `
      SELECT 
        p.id,
        p.nome as produto,
        COUNT(l.id) as total_lancamentos,
        SUM(l.quantidade_criada) as total_criadas,
        SUM(l.quantidade_aprovada) as total_aprovadas,
        COALESCE(SUM(l.quantidade_reprovada), 0) as total_reprovadas,
        ROUND(CAST(SUM(l.quantidade_aprovada) AS FLOAT) / NULLIF(SUM(l.quantidade_criada), 0) * 100, 2) as taxa_aprovacao,
        m.meta_aprovacao,
        CASE 
          WHEN m.meta_aprovacao IS NOT NULL THEN 
            ROUND(CAST(SUM(l.quantidade_aprovada) AS FLOAT) / m.meta_aprovacao * 100, 2)
          ELSE NULL
        END as progresso_meta
      FROM produtos p
      JOIN lancamentos l ON p.id = l.produto_id
      LEFT JOIN metas m ON p.id = m.produto_id
      ${whereClause}
      GROUP BY p.id, p.nome, m.meta_aprovacao
      ORDER BY total_aprovadas DESC
      LIMIT 10
    `
    const produtos = await DB.prepare(produtosQuery).bind(...params).all()
    
    // 4. TIMELINE SEMANAL (Últimas 12 semanas)
    const timelineQuery = `
      SELECT 
        l.semana,
        strftime('%m', l.data) as mes,
        strftime('%Y', l.data) as ano,
        COUNT(*) as total_lancamentos,
        SUM(l.quantidade_criada) as total_criadas,
        SUM(l.quantidade_aprovada) as total_aprovadas,
        COALESCE(SUM(l.quantidade_reprovada), 0) as total_reprovadas,
        ROUND(CAST(SUM(l.quantidade_aprovada) AS FLOAT) / NULLIF(SUM(l.quantidade_criada), 0) * 100, 2) as taxa_aprovacao
      FROM lancamentos l
      ${whereClause}
      GROUP BY l.semana, mes, ano
      ORDER BY ano DESC, l.semana DESC
      LIMIT 12
    `
    const timeline = await DB.prepare(timelineQuery).bind(...params).all()
    
    // 5. DISTRIBUIÇÃO DE STATUS (para gráfico de pizza)
    const statusQuery = `
      SELECT 
        CASE 
          WHEN l.status_aprovacao = 'aprovado' THEN 'Aprovado'
          WHEN l.status_aprovacao = 'reprovado' THEN 'Reprovado'
          ELSE 'Pendente'
        END as status,
        COUNT(*) as total
      FROM lancamentos l
      ${whereClause}
      GROUP BY status
    `
    const statusDistribution = await DB.prepare(statusQuery).bind(...params).all()
    
    // 6. TOP 5 MELHORES TAXAS DE APROVAÇÃO (designers)
    const topTaxasQuery = `
      SELECT 
        d.nome as designer,
        ROUND(CAST(SUM(l.quantidade_aprovada) AS FLOAT) / NULLIF(SUM(l.quantidade_criada), 0) * 100, 2) as taxa_aprovacao,
        SUM(l.quantidade_criada) as total_criadas
      FROM designers d
      JOIN lancamentos l ON d.id = l.designer_id
      ${whereClause}
      GROUP BY d.id, d.nome
      HAVING SUM(l.quantidade_criada) >= 10
      ORDER BY taxa_aprovacao DESC
      LIMIT 5
    `
    const topTaxas = await DB.prepare(topTaxasQuery).bind(...params).all()
    
    return c.json({
      success: true,
      periodo: {
        mes: mes || 'Todos',
        ano: ano || 'Todos'
      },
      metricas_gerais: metrics,
      performance_designers: designers.results || [],
      performance_produtos: produtos.results || [],
      timeline_semanal: timeline.results || [],
      distribuicao_status: statusDistribution.results || [],
      top_taxas_aprovacao: topTaxas.results || []
    })
  } catch (error: any) {
    console.error('Erro em /api/relatorios/completo:', error)
    return c.json({ 
      success: false, 
      message: 'Erro ao gerar relatório completo',
      error: error.message 
    }, 500)
  }
})

// Listar períodos disponíveis (meses/anos)
app.get('/api/periodos', async (c) => {
  const { DB } = c.env
  
  const result = await DB.prepare(`
    SELECT DISTINCT 
      strftime('%Y', data) as ano,
      strftime('%m', data) as mes,
      strftime('%Y-%m', data) as periodo
    FROM lancamentos
    ORDER BY ano DESC, mes DESC
  `).all()
  
  return c.json(result.results)
})

// Obter dados de um designer específico com referências cruzadas de outros designers
// Implementa a lógica da planilha: cada designer vê seus dados + dados de outros designers
app.get('/api/designer/:designer_id/planilha', async (c) => {
  const { DB } = c.env
  const designer_id = c.req.param('designer_id')
  const { semana, ano } = c.req.query()
  
  try {
    // 1. Buscar informações do designer
    const designer = await DB.prepare('SELECT * FROM designers WHERE id = ? AND ativo = 1').bind(designer_id).first()
    
    if (!designer) {
      return c.json({ error: 'Designer não encontrado' }, 404)
    }
    
    // 2. Buscar todos os produtos
    const produtos = await DB.prepare('SELECT id, nome FROM produtos WHERE ativo = 1 ORDER BY nome').all()
    
    // 3. Buscar lançamentos do designer com filtros
    let query = `
      SELECT 
        l.*,
        p.nome as produto_nome,
        d.nome as designer_nome
      FROM lancamentos l
      LEFT JOIN produtos p ON l.produto_id = p.id
      LEFT JOIN designers d ON l.designer_id = d.id
      WHERE l.designer_id = ?
    `
    const params: any[] = [designer_id]
    
    if (semana) {
      query += ' AND l.semana = ?'
      params.push(semana)
    }
    
    if (ano) {
      query += ' AND strftime("%Y", l.data) = ?'
      params.push(ano)
    }
    
    query += ' ORDER BY l.semana DESC, p.nome'
    
    const lancamentos = await DB.prepare(query).bind(...params).all()
    
    // 4. Buscar dados de OUTROS designers para referência cruzada (como WELLINGTON!AM5)
    // Busca os totais aprovados de cada produto por outros designers
    const referenciasCruzadas = await DB.prepare(`
      SELECT 
        d.id as designer_id,
        d.nome as designer_nome,
        p.id as produto_id,
        p.nome as produto_nome,
        SUM(l.quantidade_aprovada) as total_aprovadas,
        MAX(l.semana) as ultima_semana
      FROM lancamentos l
      JOIN designers d ON l.designer_id = d.id
      JOIN produtos p ON l.produto_id = p.id
      WHERE d.ativo = 1 
        AND p.ativo = 1
        AND l.designer_id != ?
      GROUP BY d.id, d.nome, p.id, p.nome
      ORDER BY d.nome, p.nome
    `).bind(designer_id).all()
    
    return c.json({
      designer: {
        id: designer.id,
        nome: designer.nome,
        email: designer.email
      },
      produtos: produtos.results,
      lancamentos: lancamentos.results,
      referencias_cruzadas: referenciasCruzadas.results
    })
  } catch (error) {
    console.error('Erro em /api/designer/:designer_id/planilha:', error)
    return c.json({ error: 'Erro ao carregar planilha do designer' }, 500)
  }
})

// ======================
// NOVOS MÓDULOS: FILA, RANKING E RELATÓRIO EXECUTIVO
// ======================

// GET /api/fila-producao - Fila de produção ordenada por prioridade e data
app.get('/api/fila-producao', async (c) => {
  const { DB } = c.env
  const { designer_id, mes, ano } = c.req.query()
  
  try {
    let query = `
      SELECT 
        l.*,
        d.nome as designer_nome,
        p.nome as produto_nome,
        COALESCE(l.prioridade, 'media') as prioridade_calc,
        CASE 
          WHEN l.quantidade_aprovada > 0 THEN 'Pronto'
          ELSE 'Em produção'
        END as status_calc
      FROM lancamentos l
      JOIN designers d ON l.designer_id = d.id
      JOIN produtos p ON l.produto_id = p.id
      WHERE 1=1
    `
    const params: any[] = []
    
    // Filtros
    if (designer_id) {
      query += ' AND l.designer_id = ?'
      params.push(designer_id)
    }
    
    if (mes && ano) {
      query += ' AND strftime("%m", l.data) = ? AND strftime("%Y", l.data) = ?'
      params.push(mes.padStart(2, '0'))
      params.push(ano)
    } else if (ano) {
      query += ' AND strftime("%Y", l.data) = ?'
      params.push(ano)
    }
    
    // Ordenação: prioridade (urgente > alta > media > baixa) e data mais recente
    query += `
      ORDER BY 
        CASE prioridade_calc
          WHEN 'urgente' THEN 1
          WHEN 'alta' THEN 2
          WHEN 'media' THEN 3
          WHEN 'baixa' THEN 4
          ELSE 3
        END,
        l.data DESC
    `
    
    const result = await DB.prepare(query).bind(...params).all()
    
    return c.json({
      success: true,
      total: result.results.length,
      data: result.results
    })
  } catch (error: any) {
    console.error('Erro ao buscar fila de produção:', error)
    return c.json({
      success: false,
      error: 'Erro ao buscar fila de produção',
      details: error.message
    }, 500)
  }
})

// GET /api/ranking-designers - Ranking de designers por desempenho
app.get('/api/ranking-designers', async (c) => {
  const { DB } = c.env
  const { mes, ano } = c.req.query()
  
  try {
    let query = `
      SELECT 
        d.id,
        d.nome as designer,
        COALESCE(SUM(l.quantidade_criada), 0) as total_criadas,
        COALESCE(SUM(l.quantidade_aprovada), 0) as total_aprovadas,
        COALESCE(SUM(l.quantidade_reprovada), 0) as total_reprovadas,
        CASE 
          WHEN SUM(l.quantidade_criada) > 0 THEN 
            ROUND((CAST(SUM(l.quantidade_aprovada) AS REAL) / CAST(SUM(l.quantidade_criada) AS REAL)) * 100, 2)
          ELSE 0
        END as taxa_aprovacao
      FROM designers d
      LEFT JOIN lancamentos l ON d.id = l.designer_id
      WHERE d.ativo = 1 AND d.role = 'user'
    `
    const params: any[] = []
    
    // Filtros
    if (mes && ano) {
      query += ' AND strftime("%m", l.data) = ? AND strftime("%Y", l.data) = ?'
      params.push(mes.padStart(2, '0'))
      params.push(ano)
    } else if (ano) {
      query += ' AND strftime("%Y", l.data) = ?'
      params.push(ano)
    }
    
    query += `
      GROUP BY d.id, d.nome
      ORDER BY total_aprovadas DESC, taxa_aprovacao DESC
    `
    
    const result = await DB.prepare(query).bind(...params).all()
    
    // Adicionar medalhas aos 3 primeiros
    const ranking = result.results.map((item: any, index: number) => ({
      ...item,
      posicao: index + 1,
      medalha: index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : ''
    }))
    
    return c.json({
      success: true,
      total: ranking.length,
      data: ranking
    })
  } catch (error: any) {
    console.error('Erro ao buscar ranking:', error)
    return c.json({
      success: false,
      error: 'Erro ao buscar ranking de designers',
      details: error.message
    }, 500)
  }
})

// GET /api/relatorio-executivo - Relatório executivo completo
app.get('/api/relatorio-executivo', async (c) => {
  const { DB } = c.env
  const { mes, ano } = c.req.query()
  
  try {
    let whereClause = '1=1'
    const params: any[] = []
    
    if (mes && ano) {
      whereClause += ' AND strftime("%m", l.data) = ? AND strftime("%Y", l.data) = ?'
      params.push(mes.padStart(2, '0'))
      params.push(ano)
    } else if (ano) {
      whereClause += ' AND strftime("%Y", l.data) = ?'
      params.push(ano)
    }
    
    // 1. Resumo geral
    const resumoQuery = `
      SELECT 
        COALESCE(SUM(l.quantidade_criada), 0) as total_criadas,
        COALESCE(SUM(l.quantidade_aprovada), 0) as total_aprovadas,
        COALESCE(SUM(l.quantidade_reprovada), 0) as total_reprovadas,
        CASE 
          WHEN SUM(l.quantidade_criada) > 0 THEN 
            ROUND((CAST(SUM(l.quantidade_aprovada) AS REAL) / CAST(SUM(l.quantidade_criada) AS REAL)) * 100, 2)
          ELSE 0
        END as taxa_aprovacao
      FROM lancamentos l
      WHERE ${whereClause}
    `
    const resumo = await DB.prepare(resumoQuery).bind(...params).first()
    
    // 2. Ranking de designers
    const rankingQuery = `
      SELECT 
        d.nome as designer,
        COALESCE(SUM(l.quantidade_criada), 0) as criadas,
        COALESCE(SUM(l.quantidade_aprovada), 0) as aprovadas,
        CASE 
          WHEN SUM(l.quantidade_criada) > 0 THEN 
            ROUND((CAST(SUM(l.quantidade_aprovada) AS REAL) / CAST(SUM(l.quantidade_criada) AS REAL)) * 100, 2)
          ELSE 0
        END as taxa
      FROM designers d
      LEFT JOIN lancamentos l ON d.id = l.designer_id AND ${whereClause}
      WHERE d.ativo = 1 AND d.role = 'user'
      GROUP BY d.id, d.nome
      ORDER BY aprovadas DESC
      LIMIT 10
    `
    const ranking = await DB.prepare(rankingQuery).bind(...params).all()
    
    // 3. Produção por produto
    const produtosQuery = `
      SELECT 
        p.nome as produto,
        COALESCE(SUM(l.quantidade_criada), 0) as criadas,
        COALESCE(SUM(l.quantidade_aprovada), 0) as aprovadas,
        COALESCE(SUM(l.quantidade_reprovada), 0) as reprovadas
      FROM produtos p
      LEFT JOIN lancamentos l ON p.id = l.produto_id AND ${whereClause}
      WHERE p.ativo = 1
      GROUP BY p.id, p.nome
      HAVING criadas > 0
      ORDER BY aprovadas DESC
      LIMIT 20
    `
    const produtos = await DB.prepare(produtosQuery).bind(...params).all()
    
    // 4. Produção semanal
    const semanalQuery = `
      SELECT 
        l.semana,
        COALESCE(SUM(l.quantidade_criada), 0) as criadas,
        COALESCE(SUM(l.quantidade_aprovada), 0) as aprovadas,
        COALESCE(SUM(l.quantidade_reprovada), 0) as reprovadas
      FROM lancamentos l
      WHERE ${whereClause}
      GROUP BY l.semana
      ORDER BY l.semana
    `
    const semanal = await DB.prepare(semanalQuery).bind(...params).all()
    
    return c.json({
      success: true,
      periodo: {
        mes: mes || 'Todos',
        ano: ano || new Date().getFullYear().toString()
      },
      resumo,
      ranking_designers: ranking.results,
      producao_produtos: produtos.results,
      producao_semanal: semanal.results
    })
  } catch (error: any) {
    console.error('Erro ao gerar relatório executivo:', error)
    return c.json({
      success: false,
      error: 'Erro ao gerar relatório executivo',
      details: error.message
    }, 500)
  }
})

// ======================
// PÁGINA DA PLANILHA DO DESIGNER (estilo Excel)
// ======================
app.get('/designer/:designer_id/planilha', async (c) => {
  const { DB } = c.env
  const designer_id = c.req.param('designer_id')
  
  const designer = await DB.prepare('SELECT * FROM designers WHERE id = ? AND ativo = 1').bind(designer_id).first()
  
  if (!designer) {
    return c.html('<h1>Designer não encontrado</h1>', 404)
  }
  
  return c.html(`
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Planilha ${designer.nome} - Controle de Produção</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <script>
          tailwind.config = {
            theme: {
              extend: {
                colors: {
                  teal: {
                    50: '#e6f7f9',
                    100: '#b3e5ec',
                    200: '#80d3df',
                    300: '#4dc1d2',
                    400: '#1aafc5',
                    500: '#00829B',
                    600: '#00829B',
                    700: '#006378',
                    800: '#004a5a',
                    900: '#00313c'
                  }
                }
              }
            }
          }
        </script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    </head>
    <body class="bg-gray-50">
        <!-- Header -->
        <header class="bg-gradient-to-r from-teal-600 to-teal-800 text-white shadow-lg">
            <div class="container mx-auto px-6 py-4">
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-3">
                        <i class="fas fa-table text-3xl"></i>
                        <div>
                            <h1 class="text-2xl font-bold">Planilha de ${designer.nome}</h1>
                            <p class="text-teal-100 text-sm">Controle Semanal de Produção</p>
                        </div>
                    </div>
                    <a href="/" class="bg-white text-teal-600 px-4 py-2 rounded-lg hover:bg-teal-50 transition">
                        <i class="fas fa-home mr-2"></i>Voltar ao Sistema
                    </a>
                </div>
            </div>
        </header>

        <!-- Filtros -->
        <div class="container mx-auto px-6 py-6">
            <div class="bg-white rounded-lg shadow p-4 mb-6">
                <div class="flex gap-4 items-end">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Semana</label>
                        <input type="number" id="filtro-semana" min="1" max="52" 
                               class="border border-gray-300 rounded px-3 py-2 w-24"
                               placeholder="Todas">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Ano</label>
                        <input type="number" id="filtro-ano" min="2020" max="2030" 
                               class="border border-gray-300 rounded px-3 py-2 w-24"
                               placeholder="Todos">
                    </div>
                    <button onclick="carregarPlanilha()" class="bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700">
                        <i class="fas fa-filter mr-2"></i>Filtrar
                    </button>
                    <button onclick="limparFiltros()" class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
                        <i class="fas fa-times mr-2"></i>Limpar
                    </button>
                </div>
            </div>

            <!-- Tabela estilo Excel -->
            <div class="bg-white rounded-lg shadow overflow-auto">
                <table class="w-full border-collapse" id="tabela-planilha">
                    <thead class="bg-teal-600 text-white sticky top-0">
                        <tr>
                            <th class="border border-teal-700 px-4 py-2">Semana</th>
                            <th class="border border-teal-700 px-4 py-2">Produto</th>
                            <th class="border border-teal-700 px-4 py-2">Criadas</th>
                            <th class="border border-teal-700 px-4 py-2">
                                <i class="fas fa-check-circle mr-1"></i>Check
                            </th>
                            <th class="border border-teal-700 px-4 py-2">Aprovadas</th>
                            <th class="border border-teal-700 px-4 py-2">
                                <i class="fas fa-check-double mr-1"></i>OK
                            </th>
                            <th class="border border-teal-700 px-4 py-2">Status</th>
                            <th class="border border-teal-700 px-4 py-2">Referências</th>
                        </tr>
                    </thead>
                    <tbody id="corpo-tabela">
                        <!-- Carregado via JavaScript -->
                    </tbody>
                </table>
            </div>

            <!-- Loading -->
            <div id="loading" class="text-center py-8 hidden">
                <i class="fas fa-spinner fa-spin text-4xl text-teal-600"></i>
                <p class="text-gray-600 mt-2">Carregando planilha...</p>
            </div>
        </div>

        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script>
            const DESIGNER_ID = ${designer_id};
            
            async function carregarPlanilha() {
                const loading = document.getElementById('loading');
                const tabela = document.getElementById('tabela-planilha');
                const corpo = document.getElementById('corpo-tabela');
                
                loading.classList.remove('hidden');
                tabela.style.opacity = '0.5';
                
                try {
                    const semana = document.getElementById('filtro-semana').value;
                    const ano = document.getElementById('filtro-ano').value;
                    
                    let url = \`/api/designer/\${DESIGNER_ID}/planilha\`;
                    const params = [];
                    if (semana) params.push(\`semana=\${semana}\`);
                    if (ano) params.push(\`ano=\${ano}\`);
                    if (params.length > 0) url += '?' + params.join('&');
                    
                    const response = await axios.get(url);
                    const data = response.data;
                    
                    // Renderizar tabela
                    corpo.innerHTML = '';
                    
                    if (data.lancamentos.length === 0) {
                        corpo.innerHTML = '<tr><td colspan="8" class="text-center py-8 text-gray-500">Nenhum lançamento encontrado</td></tr>';
                    } else {
                        data.lancamentos.forEach(lanc => {
                            // Buscar referências de outros designers para este produto
                            const refs = data.referencias_cruzadas.filter(r => r.produto_id === lanc.produto_id);
                            const refsHtml = refs.map(r => 
                                \`<div class="text-xs"><strong>\${r.designer_nome}:</strong> \${r.total_aprovadas} aprovadas</div>\`
                            ).join('');
                            
                            const row = \`
                                <tr class="hover:bg-gray-50">
                                    <td class="border px-4 py-2 text-center">\${lanc.semana}</td>
                                    <td class="border px-4 py-2">\${lanc.produto_nome}</td>
                                    <td class="border px-4 py-2 text-center">\${lanc.quantidade_criada || 0}</td>
                                    <td class="border px-4 py-2 text-center">
                                        <input type="checkbox" \${lanc.criado_check ? 'checked' : ''} 
                                               onchange="toggleCheck(\${lanc.id}, this.checked)"
                                               class="w-5 h-5 text-teal-600">
                                    </td>
                                    <td class="border px-4 py-2 text-center font-bold \${lanc.quantidade_aprovada > 0 ? 'text-green-600' : ''}">\${lanc.quantidade_aprovada || 0}</td>
                                    <td class="border px-4 py-2 text-center">
                                        <input type="checkbox" \${lanc.aprovado_ok ? 'checked' : ''} 
                                               onchange="toggleAprovado(\${lanc.id}, this.checked)"
                                               class="w-5 h-5 text-green-600">
                                    </td>
                                    <td class="border px-4 py-2 text-center">
                                        <span class="px-2 py-1 rounded text-xs \${getStatusClass(lanc.status)}">\${getStatusText(lanc.status)}</span>
                                    </td>
                                    <td class="border px-4 py-2">
                                        \${refsHtml || '<span class="text-white text-xs">Sem referências</span>'}
                                    </td>
                                </tr>
                            \`;
                            corpo.innerHTML += row;
                        });
                    }
                } catch (error) {
                    console.error('Erro ao carregar planilha:', error);
                    alert('Erro ao carregar planilha: ' + error.message);
                } finally {
                    loading.classList.add('hidden');
                    tabela.style.opacity = '1';
                }
            }
            
            async function toggleCheck(id, checked) {
                try {
                    await axios.patch(\`/api/lancamentos/\${id}/check-criado\`, { checked });
                    await carregarPlanilha();
                } catch (error) {
                    console.error('Erro ao atualizar check:', error);
                    alert('Erro ao atualizar check: ' + (error.response?.data?.error || error.message));
                }
            }
            
            async function toggleAprovado(id, checked) {
                try {
                    await axios.patch(\`/api/lancamentos/\${id}/check-aprovado\`, { checked });
                    await carregarPlanilha();
                } catch (error) {
                    console.error('Erro ao atualizar aprovação:', error);
                    alert('Erro ao atualizar aprovação: ' + (error.response?.data?.error || error.message));
                }
            }
            
            function limparFiltros() {
                document.getElementById('filtro-semana').value = '';
                document.getElementById('filtro-ano').value = '';
                carregarPlanilha();
            }
            
            function getStatusClass(status) {
                const classes = {
                    'completo': 'bg-green-100 text-green-800',
                    'em_andamento': 'bg-yellow-100 text-yellow-800',
                    'pendente': 'bg-gray-100 text-gray-800'
                };
                return classes[status] || 'bg-gray-100 text-gray-800';
            }
            
            function getStatusText(status) {
                const texts = {
                    'completo': 'Completo',
                    'em_andamento': 'Em andamento',
                    'pendente': 'Pendente'
                };
                return texts[status] || 'Desconhecido';
            }
            
            // Carregar ao abrir a página
            carregarPlanilha();
        </script>
    </body>
    </html>
  `)
})

// ======================
// PÁGINA PRINCIPAL
// ======================

app.get('/', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>COREPRO —Design</title>
        <link rel="icon" type="image/x-icon" href="/favicon.ico">
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
        <link rel="apple-touch-icon" sizes="180x180" href="/favicon-32x32.png">
        <script src="https://cdn.tailwindcss.com"></script>
        <script>
          tailwind.config = {
            theme: {
              extend: {
                colors: {
                  teal: {
                    50: '#e6f7f9',
                    100: '#b3e5ec',
                    200: '#80d3df',
                    300: '#4dc1d2',
                    400: '#1aafc5',
                    500: '#00829B',
                    600: '#00829B',
                    700: '#006378',
                    800: '#004a5a',
                    900: '#00313c'
                  }
                }
              }
            }
          }
        </script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
    </head>
    <body class="bg-gray-50 overflow-hidden">
        <!-- Header Fixo Profissional ERP Style -->
        <header id="header" class="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-teal-600 to-teal-800 text-white shadow-lg">
            <div class="container mx-auto px-4 sm:px-6 py-3">
                <div class="flex items-center justify-between gap-4">
                    <!-- Logo e Título (Esquerda) -->
                    <div class="flex items-center space-x-4 min-w-0 flex-shrink-0">
                        <!-- Logo -->
                        <div class="flex-shrink-0 bg-white rounded-lg p-2 shadow-md">
                            <img src="/images/logo.png" alt="COREPRO" class="h-8 w-auto object-contain">
                        </div>
                        
                        <div class="border-l border-white/30 h-10 hidden md:block"></div>
                        
                        <div class="hidden md:block min-w-0">
                            <h1 class="text-xl font-bold text-white tracking-tight whitespace-nowrap">COREPRO</h1>
                            <p class="text-teal-100 text-xs font-medium whitespace-nowrap">Sistema de Gestão de Design</p>
                        </div>
                    </div>
                    
                    <!-- Menu Desktop com Dropdown (Centro) -->\n                    <nav id="desktop-menu" class="hidden lg:flex items-center space-x-1 flex-1 justify-center">\n                        <!-- Dashboard (sem dropdown) -->\n                        <button onclick="showTab('dashboard')" class="menu-item px-4 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 transition text-sm font-medium text-white whitespace-nowrap">\n                            <i class="fas fa-chart-pie mr-2"></i>Dashboard\n                        </button>\n                        \n                        <!-- Operações (com dropdown) -->\n                        <div class="relative dropdown-container">\n                            <button onclick="toggleDropdown(this)" class="menu-item px-4 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 transition text-sm font-medium text-white whitespace-nowrap flex items-center">\n                                <i class="fas fa-tasks mr-2"></i>Operações\n                                <i class="fas fa-chevron-down ml-2 text-xs"></i>\n                            </button>\n                            <div class="dropdown-menu hidden absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-2 min-w-[200px] z-50">\n                                <a onclick="showTab('designers')" class="dropdown-item flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-teal-50 hover:text-teal-600 cursor-pointer transition">\n                                    <i class="fas fa-user-check w-5 mr-3 text-gray-400"></i>\n                                    <span>Designers</span>\n                                </a>\n                                <a onclick="showTab('lancamentos')" id="btn-lancamentos" class="dropdown-item flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-teal-50 hover:text-teal-600 cursor-pointer transition">\n                                    <i class="fas fa-plus-circle w-5 mr-3 text-gray-400"></i>\n                                    <span>Lançamentos</span>\n                                </a>\n                                <a onclick="showTab('fila-producao')" id="btn-fila-producao" class="dropdown-item flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-teal-50 hover:text-teal-600 cursor-pointer transition">\n                                    <i class="fas fa-list-ol w-5 mr-3 text-gray-400"></i>\n                                    <span>Fila de Produção</span>\n                                </a>\n                                <a onclick="showTab('pendencias')" id="btn-pendencias" class="dropdown-item flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-teal-50 hover:text-teal-600 cursor-pointer transition">\n                                    <i class="fas fa-clipboard-check w-5 mr-3 text-gray-400"></i>\n                                    <span>Pendências</span>\n                                </a>\n                                <a onclick="showTab('meus-produtos')" id="btn-meus-produtos" class="dropdown-item flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-teal-50 hover:text-teal-600 cursor-pointer transition">\n                                    <i class="fas fa-box-open w-5 mr-3 text-gray-400"></i>\n                                    <span>Meus Produtos</span>\n                                </a>\n                            </div>\n                        </div>\n                        \n                        <!-- Gestão (com dropdown) -->\n                        <div class="relative dropdown-container">\n                            <button onclick="toggleDropdown(this)" class="menu-item px-4 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 transition text-sm font-medium text-white whitespace-nowrap flex items-center">\n                                <i class="fas fa-briefcase mr-2"></i>Gestão\n                                <i class="fas fa-chevron-down ml-2 text-xs"></i>\n                            </button>\n                            <div class="dropdown-menu hidden absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-2 min-w-[200px] z-50">\n                                <a onclick="showTab('metas')" id="btn-metas" class="dropdown-item flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-teal-50 hover:text-teal-600 cursor-pointer transition">\n                                    <i class="fas fa-bullseye w-5 mr-3 text-gray-400"></i>\n                                    <span>Metas</span>\n                                </a>\n                                <a onclick="showTab('planejamentos')" id="btn-planejamentos" class="dropdown-item flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-teal-50 hover:text-teal-600 cursor-pointer transition">\n                                    <i class="fas fa-clipboard-list w-5 mr-3 text-gray-400"></i>\n                                    <span>Planejamentos</span>\n                                </a>\n                                <a onclick="showTab('acompanhamento')" id="btn-acompanhamento" class="dropdown-item flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-teal-50 hover:text-teal-600 cursor-pointer transition">\n                                    <i class="fas fa-calendar-check w-5 mr-3 text-gray-400"></i>\n                                    <span>Acompanhamento</span>\n                                </a>\n                            </div>\n                        </div>\n                        \n                        <!-- Relatórios (com dropdown) -->\n                        <div class="relative dropdown-container">\n                            <button onclick="toggleDropdown(this)" class="menu-item px-4 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 transition text-sm font-medium text-white whitespace-nowrap flex items-center">\n                                <i class="fas fa-chart-bar mr-2"></i>Relatórios\n                                <i class="fas fa-chevron-down ml-2 text-xs"></i>\n                            </button>\n                            <div class="dropdown-menu hidden absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-2 min-w-[200px] z-50">\n                                <a onclick="showTab('relatorios')" class="dropdown-item flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-teal-50 hover:text-teal-600 cursor-pointer transition">\n                                    <i class="fas fa-file-chart-line w-5 mr-3 text-gray-400"></i>\n                                    <span>Relatórios</span>\n                                </a>\n                                <a onclick="showTab('ranking-designers')" id="btn-ranking-designers" class="dropdown-item flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-teal-50 hover:text-teal-600 cursor-pointer transition">\n                                    <i class="fas fa-trophy w-5 mr-3 text-gray-400"></i>\n                                    <span>Ranking</span>\n                                </a>\n                                <a onclick="showTab('relatorio-executivo')" id="btn-relatorio-executivo" class="dropdown-item flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-teal-50 hover:text-teal-600 cursor-pointer transition">\n                                    <i class="fas fa-file-pdf w-5 mr-3 text-gray-400"></i>\n                                    <span>Relatório Executivo</span>\n                                </a>\n                            </div>\n                        </div>\n                        \n                        <!-- Administração (com dropdown) -->\n                        <div class="relative dropdown-container">\n                            <button onclick="toggleDropdown(this)" class="menu-item px-4 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 transition text-sm font-medium text-white whitespace-nowrap flex items-center">\n                                <i class="fas fa-shield-alt mr-2"></i>Admin\n                                <i class="fas fa-chevron-down ml-2 text-xs"></i>\n                            </button>\n                            <div class="dropdown-menu hidden absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-2 min-w-[200px] z-50">\n                                <a onclick="showTab('cadastros')" id="btn-cadastros" class="dropdown-item flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-teal-50 hover:text-teal-600 cursor-pointer transition">\n                                    <i class="fas fa-database w-5 mr-3 text-gray-400"></i>\n                                    <span>Cadastros</span>\n                                </a>\n                                <a onclick="showTab('gerenciar-usuarios')" id="btn-gerenciar-usuarios" class="dropdown-item flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-teal-50 hover:text-teal-600 cursor-pointer transition">\n                                    <i class="fas fa-users-cog w-5 mr-3 text-gray-400"></i>\n                                    <span>Gerenciar Usuários</span>\n                                </a>\n                                <div class="border-t border-gray-200 my-2"></div>\n                                <a onclick="showTab('painel-supervisor')" id="btn-painel-supervisor" class="dropdown-item flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-teal-50 hover:text-teal-600 cursor-pointer transition">\n                                    <i class="fas fa-user-shield w-5 mr-3 text-gray-400"></i>\n                                    <span>Painel Supervisor</span>\n                                </a>\n                            </div>\n                        </div>\n                        \n                        <!-- Items escondidos para compatibilidade -->\n                        <button id="btn-aprovacoes" class="hidden"></button>\n                        <button id="btn-planilhas" class="hidden"></button>\n                        <button id="btn-configuracoes" class="hidden"></button>\n                    </nav>
                    
                    <!-- User Area + Actions (Direita) -->\n                    <div class="flex items-center gap-2 flex-shrink-0">\n                        <!-- Notificações -->\n                        <button class="hidden lg:flex items-center justify-center w-10 h-10 rounded-lg hover:bg-white/20 transition relative">\n                            <i class="fas fa-bell text-white text-lg"></i>\n                            <span class="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>\n                        </button>\n                        \n                        <!-- Configurações -->\n                        <button onclick="showTab('configuracoes')" id="btn-configuracoes" class="hidden lg:flex items-center justify-center w-10 h-10 rounded-lg hover:bg-white/20 transition">\n                            <i class="fas fa-cog text-white text-lg"></i>\n                        </button>\n                        \n                        <!-- User Info Dropdown -->\n                        <div class="hidden lg:block relative dropdown-container">\n                            <button onclick="toggleDropdown(this)" class="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/20 transition">\n                                <div id="userInfo" class="flex items-center gap-2">\n                                    <!-- Will be filled dynamically -->\n                                </div>\n                                <i class="fas fa-chevron-down text-white text-xs"></i>\n                            </button>\n                            <div class="dropdown-menu hidden absolute top-full right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-2 min-w-[200px] z-50">\n                                <a onclick="showTab('configuracoes')" class="dropdown-item flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer transition">\n                                    <i class="fas fa-user-cog w-5 mr-3 text-gray-400"></i>\n                                    <span>Meu Perfil</span>\n                                </a>\n                                <div class="border-t border-gray-200 my-2"></div>\n                                <a onclick="handleLogout()" class="dropdown-item flex items-center px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 cursor-pointer transition">\n                                    <i class="fas fa-sign-out-alt w-5 mr-3 text-red-400"></i>\n                                    <span>Sair</span>\n                                </a>\n                            </div>\n                        </div>\n                        \n                        <!-- Menu Mobile Button -->\n                        <button id="mobile-menu-button" class="lg:hidden flex items-center justify-center w-10 h-10 rounded-lg hover:bg-white/20 transition" onclick="toggleMobileMenu()">\n                            <i class="fas fa-bars text-white text-xl"></i>\n                        </button>\n                    </div>
                </div>
                
                <!-- Mobile Menu Dropdown -->
                <div id="mobile-menu" class="hidden sm:hidden mt-4 pb-4 space-y-2">
                    <button onclick="showTab('dashboard'); toggleMobileMenu()" class="w-full tab-button tab-btn px-4 py-3 rounded-lg bg-white/20 hover:bg-white/30 transition text-left">
                        <i class="fas fa-chart-pie mr-3"></i>Dashboard
                    </button>
                    <button onclick="showTab('designers'); toggleMobileMenu()" class="w-full tab-button tab-btn px-4 py-3 rounded-lg bg-white/20 hover:bg-white/30 transition text-left">
                        <i class="fas fa-user-check mr-3"></i>Designers
                    </button>
                    <button onclick="showTab('lancamentos'); toggleMobileMenu()" id="btn-lancamentos-mobile" class="w-full tab-button tab-btn px-4 py-3 rounded-lg bg-white/20 hover:bg-white/30 transition text-left hidden">
                        <i class="fas fa-plus-circle mr-3"></i>Lançamentos
                    </button>
                    <button onclick="showTab('relatorios'); toggleMobileMenu()" class="w-full tab-button tab-btn px-4 py-3 rounded-lg bg-white/20 hover:bg-white/30 transition text-left">
                        <i class="fas fa-file-chart-line mr-3"></i>Relatórios
                    </button>
                    <button onclick="showTab('metas'); toggleMobileMenu()" id="btn-metas-mobile" class="w-full tab-button tab-btn px-4 py-3 rounded-lg bg-white/20 hover:bg-white/30 transition text-left">
                        <i class="fas fa-bullseye mr-3"></i>Metas
                    </button>
                    <button onclick="showTab('acompanhamento'); toggleMobileMenu()" id="btn-acompanhamento-mobile" class="w-full tab-button tab-btn px-4 py-3 rounded-lg bg-white/20 hover:bg-white/30 transition text-left">
                        <i class="fas fa-calendar-check mr-3"></i>Acompanhamento
                    </button>
                    <button onclick="showTab('cadastros'); toggleMobileMenu()" id="btn-cadastros-mobile" class="w-full tab-button tab-btn px-4 py-3 rounded-lg bg-white/20 hover:bg-white/30 transition text-left hidden">
                        <i class="fas fa-cog mr-3"></i>Cadastros
                    </button>
                    <button onclick="showTab('planejamentos'); toggleMobileMenu()" id="btn-planejamentos-mobile" class="w-full tab-button tab-btn px-4 py-3 rounded-lg bg-white/20 hover:bg-white/30 transition text-left hidden">
                        <i class="fas fa-clipboard-list mr-3"></i>Planejamentos
                    </button>
                    <button onclick="showTab('meus-produtos'); toggleMobileMenu()" id="btn-meus-produtos-mobile" class="w-full tab-button tab-btn px-4 py-3 rounded-lg bg-white/20 hover:bg-white/30 transition text-left hidden">
                        <i class="fas fa-tasks mr-3"></i>Meus Produtos
                    </button>
                    <button onclick="showTab('painel-supervisor'); toggleMobileMenu()" id="btn-painel-supervisor-mobile" class="w-full tab-button tab-btn px-4 py-3 rounded-lg bg-white/20 hover:bg-white/30 transition text-left hidden">
                        <i class="fas fa-user-shield mr-3"></i>Painel Supervisor
                    </button>
                    <button onclick="showTab('pendencias'); toggleMobileMenu()" id="btn-pendencias-mobile" class="w-full tab-button tab-btn px-4 py-3 rounded-lg bg-white/20 hover:bg-white/30 transition text-left hidden">
                        <i class="fas fa-clipboard-check mr-3"></i>Pendências
                    </button>
                    <button onclick="showTab('fila-producao'); toggleMobileMenu()" id="btn-fila-producao-mobile" class="w-full tab-button tab-btn px-4 py-3 rounded-lg bg-white/20 hover:bg-white/30 transition text-left">
                        <i class="fas fa-list-ol mr-3"></i>Fila de Produção
                    </button>
                    <button onclick="showTab('ranking-designers'); toggleMobileMenu()" id="btn-ranking-designers-mobile" class="w-full tab-button tab-btn px-4 py-3 rounded-lg bg-white/20 hover:bg-white/30 transition text-left">
                        <i class="fas fa-trophy mr-3"></i>Ranking de Designers
                    </button>
                    <button onclick="showTab('relatorio-executivo'); toggleMobileMenu()" id="btn-relatorio-executivo-mobile" class="w-full tab-button tab-btn px-4 py-3 rounded-lg bg-white/20 hover:bg-white/30 transition text-left">
                        <i class="fas fa-file-pdf mr-3"></i>Relatório Executivo
                    </button>
                    <button onclick="showTab('gerenciar-usuarios'); toggleMobileMenu()" id="btn-gerenciar-usuarios-mobile" class="w-full tab-button tab-btn px-4 py-3 rounded-lg bg-white/20 hover:bg-white/30 transition text-left hidden">
                        <i class="fas fa-users-cog mr-3"></i>Gerenciar Usuários
                    </button>
                    <button onclick="showTab('configuracoes'); toggleMobileMenu()" id="btn-configuracoes-mobile" class="w-full tab-button tab-btn px-4 py-3 rounded-lg bg-white/20 hover:bg-white/30 transition text-left hidden">
                        <i class="fas fa-user-cog mr-3"></i>Configurações
                    </button>
                    <div id="userInfo-mobile" class="px-4 py-3 bg-white/10 rounded-lg">
                        <!-- User info mobile -->
                    </div>
                    <button onclick="handleLogout()" class="w-full px-4 py-3 rounded-lg bg-red-500 hover:bg-red-600 transition text-left font-semibold">
                        <i class="fas fa-sign-out-alt mr-3"></i>Sair
                    </button>
                </div>
            </div>
        </header>

        <!-- Main Content com altura ajustada e rolagem -->
        <main class="container mx-auto px-6 py-8 overflow-y-auto" style="height: calc(100vh - 80px); margin-top: 80px;">
            <!-- Dashboard Tab -->
            <div id="tab-dashboard" class="tab-content">
                <!-- Filtros -->
                <div class="bg-white rounded-xl shadow-md p-4 mb-6">
                    <div class="flex items-center space-x-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Mês</label>
                            <select id="filter-mes" onchange="applyDashboardFilters()" class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500">
                                <option value="">Todos</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Ano</label>
                            <select id="filter-ano" onchange="applyDashboardFilters()" class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500">
                                <option value="">Todos</option>
                            </select>
                        </div>
                        <button onclick="clearDashboardFilters()" class="mt-6 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition">
                            <i class="fas fa-times mr-2"></i>Limpar
                        </button>
                    </div>
                </div>

                <!-- Loading Spinner -->
                <div id="dashboard-loading" class="hidden text-center py-12">
                    <i class="fas fa-spinner fa-spin text-5xl text-teal-600"></i>
                    <p class="text-gray-600 mt-4 text-lg">Carregando dashboard...</p>
                </div>

                <!-- Estatísticas Gerais -->
                <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div class="bg-white rounded-xl shadow-md p-6 border-l-4 border-teal-500">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-gray-500 text-sm font-medium">Total de Designers</p>
                                <p id="stat-designers" class="text-3xl font-bold text-gray-800 mt-2">-</p>
                            </div>
                            <div class="bg-teal-100 rounded-full p-3">
                                <i class="fas fa-users text-teal-600 text-2xl"></i>
                            </div>
                        </div>
                    </div>
                    
                    <div class="bg-white rounded-xl shadow-md p-6 border-l-4 border-teal-500">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-gray-500 text-sm font-medium">Total Aprovadas</p>
                                <p id="stat-aprovadas" class="text-3xl font-bold text-gray-800 mt-2">-</p>
                            </div>
                            <div class="bg-teal-100 rounded-full p-3">
                                <i class="fas fa-check-circle text-teal-600 text-2xl"></i>
                            </div>
                        </div>
                    </div>
                    
                    <div class="bg-white rounded-xl shadow-md p-6 border-l-4 border-yellow-500">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-gray-500 text-sm font-medium">Total Criadas</p>
                                <p id="stat-criadas" class="text-3xl font-bold text-gray-800 mt-2">-</p>
                            </div>
                            <div class="bg-yellow-100 rounded-full p-3">
                                <i class="fas fa-palette text-yellow-600 text-2xl"></i>
                            </div>
                        </div>
                    </div>
                    
                    <div class="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-gray-500 text-sm font-medium">Taxa de Aprovação</p>
                                <p id="stat-taxa" class="text-3xl font-bold text-gray-800 mt-2">-%</p>
                            </div>
                            <div class="bg-purple-100 rounded-full p-3">
                                <i class="fas fa-percentage text-purple-600 text-2xl"></i>
                            </div>
                        </div>
                    </div>
                    
                    <div class="bg-white rounded-xl shadow-md p-6 border-l-4 border-red-500">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-gray-500 text-sm font-medium">Total Reprovadas</p>
                                <p id="stat-reprovadas" class="text-3xl font-bold text-gray-800 mt-2">-</p>
                            </div>
                            <div class="bg-red-100 rounded-full p-3">
                                <i class="fas fa-times-circle text-red-600 text-2xl"></i>
                            </div>
                        </div>
                    </div>
                    
                    <div class="bg-white rounded-xl shadow-md p-6 border-l-4 border-orange-500">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-gray-500 text-sm font-medium">Taxa de Reprovação</p>
                                <p id="stat-taxa-reprovacao" class="text-3xl font-bold text-gray-800 mt-2">-%</p>
                            </div>
                            <div class="bg-orange-100 rounded-full p-3">
                                <i class="fas fa-chart-line text-orange-600 text-2xl"></i>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Gráficos -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    <div class="bg-white rounded-xl shadow-md p-6">
                        <h3 class="text-lg font-semibold text-gray-800 mb-4">
                            <i class="fas fa-chart-bar text-teal-600 mr-2"></i>
                            Performance por Designer
                        </h3>
                        <div style="height: 300px; position: relative;">
                            <canvas id="chartDesigners"></canvas>
                        </div>
                    </div>
                    
                    <div class="bg-white rounded-xl shadow-md p-6">
                        <h3 class="text-lg font-semibold text-gray-800 mb-4">
                            <i class="fas fa-chart-line text-teal-600 mr-2"></i>
                            Timeline de Produção
                        </h3>
                        <div style="height: 300px; position: relative;">
                            <canvas id="chartTimeline"></canvas>
                        </div>
                    </div>
                </div>

                <!-- Top Produtos -->
                <div class="bg-white rounded-xl shadow-md p-6">
                    <h3 class="text-lg font-semibold text-gray-800 mb-4">
                        <i class="fas fa-trophy text-yellow-600 mr-2"></i>
                        Top 6 Produtos Mais Recentes
                    </h3>
                    <div id="topProdutos" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <!-- Será preenchido via JS -->
                    </div>
                </div>
            </div>

            <!-- Designers Tab -->
            <div id="tab-designers" class="tab-content hidden">
                <!-- Loading Spinner -->
                <div id="designers-loading" class="hidden text-center py-12">
                    <i class="fas fa-spinner fa-spin text-5xl text-teal-600"></i>
                    <p class="text-gray-600 mt-4 text-lg">Carregando designers...</p>
                </div>
                
                <!-- Estatísticas Gerais dos Designers -->
                <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                    <div class="bg-white rounded-xl shadow-md p-6 border-l-4 border-teal-500">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-gray-500 text-sm font-medium">Total Designers</p>
                                <p id="designers-stat-total" class="text-3xl font-bold text-gray-800 mt-2">0</p>
                            </div>
                            <div class="bg-teal-100 rounded-full p-3">
                                <i class="fas fa-users text-teal-600 text-2xl"></i>
                            </div>
                        </div>
                    </div>
                    
                    <div class="bg-white rounded-xl shadow-md p-6 border-l-4 border-teal-500">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-gray-500 text-sm font-medium">Total Lançamentos</p>
                                <p id="designers-stat-lancamentos" class="text-3xl font-bold text-gray-800 mt-2">0</p>
                            </div>
                            <div class="bg-teal-100 rounded-full p-3">
                                <i class="fas fa-clipboard-list text-teal-600 text-2xl"></i>
                            </div>
                        </div>
                    </div>
                    
                    <div class="bg-white rounded-xl shadow-md p-6 border-l-4 border-yellow-500">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-gray-500 text-sm font-medium">Total Aprovados</p>
                                <p id="designers-stat-aprovados" class="text-3xl font-bold text-gray-800 mt-2">0</p>
                            </div>
                            <div class="bg-yellow-100 rounded-full p-3">
                                <i class="fas fa-check-circle text-yellow-600 text-2xl"></i>
                            </div>
                        </div>
                    </div>
                    
                    <div class="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-gray-500 text-sm font-medium">Taxa Aprovação</p>
                                <p id="designers-stat-taxa" class="text-3xl font-bold text-gray-800 mt-2">0%</p>
                            </div>
                            <div class="bg-purple-100 rounded-full p-3">
                                <i class="fas fa-percentage text-purple-600 text-2xl"></i>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="bg-white rounded-xl shadow-md p-6">
                    <h2 class="text-2xl font-bold text-gray-800 mb-6">
                        <i class="fas fa-users text-teal-600 mr-3"></i>
                        Telas Individuais dos Designers
                    </h2>
                    <p class="text-gray-600 mb-6">Selecione um designer para acessar sua planilha individual de controle:</p>
                    
                    <div id="designersList" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <!-- Será preenchido via JS -->
                    </div>
                </div>
            </div>

            <!-- Modal Dashboard Individual do Designer -->
            <div id="modalDesignerDashboard" class="hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                <div class="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
                    <div class="sticky top-0 bg-gradient-to-r from-teal-600 to-blue-600 text-white p-6 rounded-t-xl flex justify-between items-center">
                        <div>
                            <h2 class="text-2xl font-bold" id="modal-designer-nome">Dashboard do Designer</h2>
                            <p class="text-teal-100 text-sm mt-1">Desempenho e estatísticas individuais</p>
                        </div>
                        <button onclick="closeDesignerDashboard()" class="text-white hover:text-red-200 transition">
                            <i class="fas fa-times text-3xl"></i>
                        </button>
                    </div>
                    
                    <div id="dashboard-content" class="p-6">
                        <!-- Loading -->
                        <div id="dashboard-loading" class="text-center py-12">
                            <i class="fas fa-spinner fa-spin text-5xl text-teal-600"></i>
                            <p class="text-gray-600 mt-4">Carregando estatísticas...</p>
                        </div>
                        
                        <!-- Conteúdo será preenchido via JS -->
                    </div>
                </div>
            </div>

            <!-- Modal Editar Perfil -->
            <div id="modalEditarPerfil" class="hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                <div class="bg-white rounded-xl shadow-2xl max-w-md w-full">
                    <div class="bg-gradient-to-r from-teal-600 to-blue-600 text-white p-6 rounded-t-xl flex justify-between items-center">
                        <div>
                            <h2 class="text-2xl font-bold">Editar Perfil</h2>
                            <p class="text-teal-100 text-sm mt-1">Atualize suas informações</p>
                        </div>
                        <button onclick="closeEditarPerfil()" class="text-white hover:text-red-200 transition">
                            <i class="fas fa-times text-2xl"></i>
                        </button>
                    </div>
                    
                    <div class="p-6">
                        <form id="formEditarPerfil" class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Nome</label>
                                <input type="text" id="perfil-nome" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500" required>
                            </div>
                            
                            <div class="border-t pt-4">
                                <h3 class="text-lg font-semibold text-gray-800 mb-3">
                                    <i class="fas fa-key text-teal-600 mr-2"></i>
                                    Alterar Senha
                                </h3>
                                
                                <div class="space-y-3">
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-2">Senha Atual</label>
                                        <input type="password" id="perfil-senha-atual" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500">
                                    </div>
                                    
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-2">Nova Senha</label>
                                        <input type="password" id="perfil-senha-nova" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500" minlength="6">
                                        <p class="text-xs text-gray-500 mt-1">Mínimo 6 caracteres</p>
                                    </div>
                                    
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-2">Confirmar Nova Senha</label>
                                        <input type="password" id="perfil-senha-confirmar" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500" minlength="6">
                                    </div>
                                </div>
                            </div>
                            
                            <div class="flex space-x-3 pt-4">
                                <button type="submit" class="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 px-6 rounded-lg transition">
                                    <i class="fas fa-save mr-2"></i>Salvar
                                </button>
                                <button type="button" onclick="closeEditarPerfil()" class="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-3 px-6 rounded-lg transition">
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            <!-- Lançamentos Tab -->
            <div id="tab-lancamentos" class="tab-content hidden">
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <!-- Formulário -->
                    <div class="lg:col-span-1">
                        <div class="bg-white rounded-xl shadow-md p-6">
                            <h3 class="text-xl font-semibold text-gray-800 mb-4">
                                <i class="fas fa-plus-circle text-teal-600 mr-2"></i>
                                Novo Lançamento
                            </h3>
                            <form id="formLancamento" class="space-y-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Designer</label>
                                    <select id="input-designer" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent" required>
                                        <option value="">Selecione...</option>
                                    </select>
                                </div>
                                
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Produto</label>
                                    <select id="input-produto" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent" required>
                                        <option value="">Selecione...</option>
                                    </select>
                                </div>
                                
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Semana</label>
                                    <input type="number" id="input-semana" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent" min="1" required>
                                </div>
                                
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Data</label>
                                    <input type="date" id="input-data" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent" required>
                                </div>
                                
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Quantidade Criada</label>
                                    <input type="number" id="input-criada" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent" min="0" value="0" required>
                                </div>
                                
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Quantidade Reprovada</label>
                                    <input type="number" id="input-reprovada" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent" min="0" value="0" required>
                                    <p class="text-xs text-gray-500 mt-1">Não pode ser maior que Quantidade Criada</p>
                                </div>
                                
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">
                                        Quantidade Aprovada 
                                        <span id="aprovada-status" class="text-xs text-blue-600 ml-2">
                                            <i class="fas fa-calculator"></i> calculado automaticamente
                                        </span>
                                    </label>
                                    <div class="relative">
                                        <input type="number" id="input-aprovada" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent" min="0" value="0">
                                        <button type="button" onclick="toggleAprovadaEdit()" class="absolute right-2 top-2 text-teal-600 hover:text-teal-800">
                                            <i class="fas fa-edit"></i>
                                        </button>
                                    </div>
                                    <p class="text-xs text-gray-500 mt-1">Clique no ícone para editar manualmente</p>
                                </div>
                                
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Observações</label>
                                    <textarea id="input-obs" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent" rows="3"></textarea>
                                </div>
                                
                                <button type="submit" class="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 px-6 rounded-lg transition shadow-md">
                                    <i class="fas fa-save mr-2"></i>Salvar Lançamento
                                </button>
                            </form>
                        </div>
                    </div>

                    <!-- Lista de Lançamentos -->
                    <div class="lg:col-span-2">
                        <div class="bg-white rounded-xl shadow-md p-6">
                            <div class="flex items-center justify-between mb-4 flex-wrap gap-2">
                                <h3 class="text-xl font-semibold text-gray-800">
                                    <i class="fas fa-list text-teal-600 mr-2"></i>
                                    Lançamentos
                                </h3>
                                <div class="flex space-x-2 flex-wrap gap-2">
                                    <select id="lancamentos-designer-filter" onchange="loadLancamentos()" class="px-4 py-2 border border-gray-300 rounded-lg">
                                        <option value="">Todos Designers</option>
                                    </select>
                                    <select id="lancamentos-produto-filter" onchange="loadLancamentos()" class="px-4 py-2 border border-gray-300 rounded-lg">
                                        <option value="">Todos Produtos</option>
                                    </select>
                                    <select id="lancamentos-semana-filter" onchange="loadLancamentos()" class="px-4 py-2 border border-gray-300 rounded-lg">
                                        <option value="">Todas Semanas</option>
                                    </select>
                                    <button onclick="loadLancamentos()" class="text-teal-600 hover:text-teal-800">
                                        <i class="fas fa-sync-alt"></i>
                                    </button>
                                </div>
                            </div>
                            
                            <!-- Loading Spinner -->
                            <div id="lancamentos-loading" class="hidden text-center py-12">
                                <i class="fas fa-spinner fa-spin text-5xl text-teal-600"></i>
                                <p class="text-gray-600 mt-4 text-lg">Carregando lançamentos...</p>
                            </div>
                            
                            <div id="listaLancamentos" class="overflow-x-auto">
                                <!-- Será preenchido via JS -->
                            </div>
                            <div id="paginationLancamentos" class="mt-4 flex justify-center space-x-2">
                                <!-- Paginação será preenchida via JS -->
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Relatórios Tab -->
            <div id="tab-relatorios" class="tab-content hidden">
                <div class="max-w-7xl mx-auto space-y-6">
                    <!-- Header -->
                    <div class="bg-gradient-to-r from-teal-600 to-blue-600 rounded-xl shadow-lg p-6 text-white">
                        <div class="flex items-center justify-between">
                            <div>
                                <h2 class="text-3xl font-bold flex items-center">
                                    <i class="fas fa-chart-bar mr-3"></i>
                                    Relatórios de Produção
                                </h2>
                                <p class="text-teal-100 mt-2">Análise completa de desempenho e produtividade</p>
                            </div>
                        </div>
                    </div>

                    <!-- Filtros de Período -->
                    <div class="bg-white rounded-xl shadow-md p-6">
                        <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                            <i class="fas fa-filter text-teal-600 mr-2"></i>
                            Filtros de Período
                        </h3>
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Data Inicial</label>
                                <input type="date" id="relatorio-data-inicio" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Data Final</label>
                                <input type="date" id="relatorio-data-fim" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500">
                            </div>
                            <div class="flex items-end">
                                <button onclick="loadRelatoriosProducao()" class="w-full bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-lg transition shadow-md">
                                    <i class="fas fa-search mr-2"></i>Consultar
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Loading -->
                    <div id="relatorios-loading" class="hidden text-center py-12 bg-white rounded-xl shadow-md">
                        <i class="fas fa-spinner fa-spin text-5xl text-teal-600"></i>
                        <p class="text-gray-600 mt-4 text-lg">Carregando relatórios...</p>
                    </div>

                    <!-- Resumo de Produção -->
                    <div id="resumo-producao" class="hidden">
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div class="bg-white rounded-xl shadow-md p-6">
                                <div class="flex items-center justify-between">
                                    <div>
                                        <p class="text-gray-600 text-sm font-medium">Total Produzido</p>
                                        <p id="total-produzido" class="text-3xl font-bold text-blue-600 mt-2">0</p>
                                    </div>
                                    <div class="bg-blue-100 p-4 rounded-full">
                                        <i class="fas fa-boxes text-blue-600 text-2xl"></i>
                                    </div>
                                </div>
                            </div>
                            <div class="bg-white rounded-xl shadow-md p-6">
                                <div class="flex items-center justify-between">
                                    <div>
                                        <p class="text-gray-600 text-sm font-medium">Meta Total</p>
                                        <p id="meta-total" class="text-3xl font-bold text-purple-600 mt-2">0</p>
                                    </div>
                                    <div class="bg-purple-100 p-4 rounded-full">
                                        <i class="fas fa-bullseye text-purple-600 text-2xl"></i>
                                    </div>
                                </div>
                            </div>
                            <div class="bg-white rounded-xl shadow-md p-6">
                                <div class="flex items-center justify-between">
                                    <div>
                                        <p class="text-gray-600 text-sm font-medium">Percentual Concluído</p>
                                        <p id="percentual-concluido" class="text-3xl font-bold text-green-600 mt-2">0%</p>
                                    </div>
                                    <div class="bg-green-100 p-4 rounded-full">
                                        <i class="fas fa-percentage text-green-600 text-2xl"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Tabs de Relatórios -->
                    <div class="bg-white rounded-xl shadow-md overflow-hidden">
                        <div class="border-b border-gray-200">
                            <nav class="flex space-x-2 p-2" role="tablist">
                                <button onclick="showRelatorioTab('producao')" id="tab-btn-producao" class="relatorio-tab-btn px-6 py-3 text-sm font-medium rounded-lg transition bg-teal-600 text-white">
                                    <i class="fas fa-chart-line mr-2"></i>Relatório de Produção
                                </button>
                                <button onclick="showRelatorioTab('designer')" id="tab-btn-designer" class="relatorio-tab-btn px-6 py-3 text-sm font-medium rounded-lg transition text-gray-600 hover:bg-white/20">
                                    <i class="fas fa-users mr-2"></i>Relatório por Designer
                                </button>
                                <button onclick="showRelatorioTab('metas')" id="tab-btn-metas" class="relatorio-tab-btn px-6 py-3 text-sm font-medium rounded-lg transition text-gray-600 hover:bg-white/20">
                                    <i class="fas fa-trophy mr-2"></i>Relatório de Metas
                                </button>
                                <button onclick="showRelatorioTab('curva-abc')" id="tab-btn-curva-abc" class="relatorio-tab-btn px-6 py-3 text-sm font-medium rounded-lg transition text-gray-600 hover:bg-white/20">
                                    <i class="fas fa-chart-pie mr-2"></i>Curva ABC
                                </button>
                            </nav>
                        </div>

                        <!-- Tab: Relatório de Produção -->
                        <div id="relatorio-tab-producao" class="relatorio-tab-content p-6">
                            <h3 class="text-xl font-semibold text-gray-800 mb-4">Produção por Semana</h3>
                            <canvas id="chart-producao-semana" class="w-full" style="max-height: 400px;"></canvas>
                        </div>

                        <!-- Tab: Relatório por Designer -->
                        <div id="relatorio-tab-designer" class="relatorio-tab-content p-6 hidden">
                            <div class="flex items-center justify-between mb-4">
                                <h3 class="text-xl font-semibold text-gray-800">Performance por Designer</h3>
                                <button onclick="exportarPDF('designer')" class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition">
                                    <i class="fas fa-file-pdf mr-2"></i>Exportar PDF
                                </button>
                            </div>
                            <div class="overflow-x-auto">
                                <table class="w-full">
                                    <thead class="bg-gray-50">
                                        <tr>
                                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Designer</th>
                                            <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Total Produzido</th>
                                            <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Meta</th>
                                            <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Percentual</th>
                                            <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody id="tabela-designers" class="bg-white divide-y divide-gray-200">
                                        <!-- Será preenchido via JS -->
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <!-- Tab: Relatório de Metas -->
                        <div id="relatorio-tab-metas" class="relatorio-tab-content p-6 hidden">
                            <div class="flex items-center justify-between mb-4">
                                <h3 class="text-xl font-semibold text-gray-800">Status de Metas</h3>
                                <button onclick="exportarPDF('metas')" class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition">
                                    <i class="fas fa-file-pdf mr-2"></i>Exportar PDF
                                </button>
                            </div>
                            <div class="overflow-x-auto">
                                <table class="w-full">
                                    <thead class="bg-gray-50">
                                        <tr>
                                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produto</th>
                                            <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Meta</th>
                                            <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Produzido</th>
                                            <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Percentual</th>
                                            <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody id="tabela-metas" class="bg-white divide-y divide-gray-200">
                                        <!-- Será preenchido via JS -->
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <!-- Tab: Curva ABC -->
                        <div id="relatorio-tab-curva-abc" class="relatorio-tab-content p-6 hidden">
                            <div class="flex items-center justify-between mb-4">
                                <div>
                                    <h3 class="text-xl font-semibold text-gray-800">Análise Curva ABC</h3>
                                    <p class="text-sm text-gray-600 mt-1">Classificação baseada na produtividade acumulada</p>
                                </div>
                                <button onclick="exportarPDF('curva-abc')" class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition">
                                    <i class="fas fa-file-pdf mr-2"></i>Exportar PDF
                                </button>
                            </div>
                            
                            <!-- Legenda Curva ABC -->
                            <div class="grid grid-cols-3 gap-4 mb-6">
                                <div class="bg-green-50 border-2 border-green-500 rounded-lg p-4">
                                    <div class="flex items-center justify-between">
                                        <div>
                                            <p class="text-sm font-medium text-gray-600">Classe A</p>
                                            <p class="text-xs text-gray-500 mt-1">Até 80% acumulado</p>
                                        </div>
                                        <div class="bg-green-500 text-white font-bold px-3 py-1 rounded-full">A</div>
                                    </div>
                                </div>
                                <div class="bg-yellow-50 border-2 border-yellow-500 rounded-lg p-4">
                                    <div class="flex items-center justify-between">
                                        <div>
                                            <p class="text-sm font-medium text-gray-600">Classe B</p>
                                            <p class="text-xs text-gray-500 mt-1">De 80% até 95%</p>
                                        </div>
                                        <div class="bg-yellow-500 text-white font-bold px-3 py-1 rounded-full">B</div>
                                    </div>
                                </div>
                                <div class="bg-red-50 border-2 border-red-500 rounded-lg p-4">
                                    <div class="flex items-center justify-between">
                                        <div>
                                            <p class="text-sm font-medium text-gray-600">Classe C</p>
                                            <p class="text-xs text-gray-500 mt-1">Acima de 95%</p>
                                        </div>
                                        <div class="bg-red-500 text-white font-bold px-3 py-1 rounded-full">C</div>
                                    </div>
                                </div>
                            </div>

                            <div class="overflow-x-auto">
                                <table class="w-full">
                                    <thead class="bg-gray-50">
                                        <tr>
                                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Designer</th>
                                            <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Produção</th>
                                            <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">% Individual</th>
                                            <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">% Acumulado</th>
                                            <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Classificação</th>
                                        </tr>
                                    </thead>
                                    <tbody id="tabela-curva-abc" class="bg-white divide-y divide-gray-200">
                                        <!-- Será preenchido via JS -->
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Metas Tab -->
            <div id="tab-metas" class="tab-content hidden">
                <div class="space-y-6">
                    <!-- Cabeçalho com botão Adicionar Meta (APENAS ADMIN) -->
                    <div id="metas-header-admin" class="bg-white rounded-xl shadow-md p-6 hidden">
                        <div class="flex items-center justify-between mb-4">
                            <div>
                                <h2 class="text-2xl font-bold text-gray-800">
                                    <i class="fas fa-bullseye text-teal-600 mr-2"></i>
                                    Gerenciamento de Metas
                                </h2>
                                <p class="text-gray-600 text-sm mt-1">Configure e acompanhe as metas de produção por produto</p>
                            </div>
                            <button onclick="showMetaForm()" class="bg-teal-600 hover:bg-teal-700 text-white font-semibold px-6 py-3 rounded-lg transition shadow-md">
                                <i class="fas fa-plus-circle mr-2"></i>Adicionar Meta
                            </button>
                        </div>
                    </div>
                    
                    <!-- TOP 6 METAS ATIVAS (VISÍVEL PARA TODOS) -->
                    <div class="bg-gradient-to-br from-teal-50 to-blue-50 rounded-xl shadow-lg p-6 border-2 border-teal-200">
                        <div class="flex items-center justify-between mb-6">
                            <div class="flex items-center space-x-3">
                                <div class="bg-teal-600 p-3 rounded-lg">
                                    <i class="fas fa-trophy text-white text-2xl"></i>
                                </div>
                                <div>
                                    <h2 class="text-2xl font-bold text-gray-800">Top 6 Metas Ativas</h2>
                                    <p class="text-gray-600 text-sm">Acompanhamento em tempo real do progresso</p>
                                </div>
                            </div>
                            <button onclick="loadTop6Metas()" class="bg-white hover:bg-gray-50 text-teal-600 px-4 py-2 rounded-lg shadow-md transition" title="Atualizar">
                                <i class="fas fa-sync-alt mr-2"></i>Atualizar
                            </button>
                        </div>
                        
                        <!-- Loading Spinner -->
                        <div id="top6-loading" class="hidden text-center py-12">
                            <i class="fas fa-spinner fa-spin text-4xl text-teal-600"></i>
                            <p class="text-gray-600 mt-4">Carregando metas...</p>
                        </div>
                        
                        <!-- Grid de Cards -->
                        <div id="top6-metas-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <!-- Será preenchido via JS -->
                        </div>
                        
                        <!-- Mensagem quando não há metas aprovadas -->
                        <div id="top6-empty" class="hidden text-center py-12">
                            <i class="fas fa-info-circle text-4xl text-gray-400 mb-3"></i>
                            <p class="text-gray-600">Nenhuma meta aprovada ainda.</p>
                            <p class="text-gray-500 text-sm mt-2">Aprove metas abaixo para que apareçam no Top 6</p>
                        </div>
                    </div>
                    
                    <!-- Formulário de Meta (inicialmente oculto - APENAS ADMIN) -->
                    <div id="meta-form-container" class="hidden">
                        <div class="bg-white rounded-xl shadow-md p-6">
                            <h3 class="text-xl font-semibold text-gray-800 mb-4">
                                <i class="fas fa-edit text-teal-600 mr-2"></i>
                                <span id="meta-form-title">Nova Meta</span>
                            </h3>
                            <form id="formMeta" class="space-y-4">
                                <input type="hidden" id="meta-id">
                                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-2">
                                            Produto *
                                        </label>
                                        <select id="meta-produto" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500" required>
                                            <option value="">Selecione...</option>
                                        </select>
                                    </div>
                                    
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-2">
                                            Meta de Aprovação *
                                        </label>
                                        <input type="number" id="meta-aprovacao" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500" min="1" placeholder="Ex: 100" required>
                                    </div>
                                    
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-2">
                                            Período (Semanas) *
                                        </label>
                                        <input type="number" id="meta-periodo" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500" min="1" placeholder="Ex: 18" value="18" required>
                                    </div>
                                </div>
                                
                                <div class="flex space-x-2">
                                    <button type="submit" class="bg-teal-600 hover:bg-teal-700 text-white font-semibold px-6 py-2 rounded-lg transition">
                                        <i class="fas fa-save mr-2"></i>
                                        <span id="meta-btn-text">Salvar Meta</span>
                                    </button>
                                    <button type="button" onclick="cancelEditMeta()" class="bg-gray-500 hover:bg-gray-600 text-white font-semibold px-6 py-2 rounded-lg transition">
                                        <i class="fas fa-times mr-2"></i>Cancelar
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    <!-- Lista de Metas (APENAS ADMIN) -->
                    <div id="metas-lista-admin" class="bg-white rounded-xl shadow-md p-6 hidden">
                        <div class="flex items-center justify-between mb-4">
                            <h3 class="text-xl font-semibold text-gray-800">
                                <i class="fas fa-list text-teal-600 mr-2"></i>
                                Metas Cadastradas
                            </h3>
                            <button onclick="loadMetas()" class="text-teal-600 hover:text-teal-800" title="Atualizar lista">
                                <i class="fas fa-sync-alt"></i>
                            </button>
                        </div>
                        
                        <!-- Loading Spinner -->
                        <div id="metas-loading" class="hidden text-center py-12">
                            <i class="fas fa-spinner fa-spin text-5xl text-teal-600"></i>
                            <p class="text-gray-600 mt-4 text-lg">Carregando metas...</p>
                        </div>
                        
                        <div id="listaMetas" class="overflow-x-auto">
                            <!-- Será preenchido via JS -->
                        </div>
                    </div>
                </div>
            </div>

            <!-- Acompanhamento Tab -->
            <div id="tab-acompanhamento" class="tab-content hidden">
                <!-- Loading Spinner -->
                <div id="acompanhamento-loading" class="hidden text-center py-12">
                    <i class="fas fa-spinner fa-spin text-5xl text-teal-600"></i>
                    <p class="text-gray-600 mt-4 text-lg">Carregando acompanhamento...</p>
                </div>
                
                <div class="space-y-6">
                    <div class="bg-white rounded-xl shadow-md p-6">
                        <h2 class="text-2xl font-bold text-gray-800 mb-2">
                            <i class="fas fa-calendar-check text-teal-600 mr-2"></i>
                            Acompanhamento Semanal
                        </h2>
                        <p class="text-gray-600 text-sm">Acompanhamento em tempo real do progresso</p>
                    </div>

                    <!-- Grid de Designers -->
                    <div id="designers-semanas-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <!-- Cards preenchidos via JS -->
                    </div>

                    <!-- Estado Vazio -->
                    <div id="acompanhamento-empty" class="hidden text-center py-12">
                        <i class="fas fa-inbox text-gray-300 text-6xl mb-4"></i>
                        <p class="text-gray-500 text-lg">Nenhum designer com semanas planejadas</p>
                        <p class="text-gray-400 text-sm mt-2">Crie planejamentos na aba de Planejamentos</p>
                    </div>
                </div>
            </div>

            <!-- Cadastros Tab -->
            <div id="tab-cadastros" class="tab-content hidden">
                <!-- Loading Spinner -->
                <div id="cadastros-loading" class="hidden text-center py-12">
                    <i class="fas fa-spinner fa-spin text-5xl text-teal-600"></i>
                    <p class="text-gray-600 mt-4 text-lg">Carregando cadastros...</p>
                </div>
                
                <div class="space-y-6">
                    <!-- Designers e Produtos -->
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <!-- Designers -->
                        <div class="bg-white rounded-xl shadow-md p-6">
                            <h3 class="text-xl font-semibold text-gray-800 mb-4">
                                <i class="fas fa-users text-teal-600 mr-2"></i>
                                Designers
                            </h3>
                            <form id="formDesigner" class="mb-4 flex space-x-2">
                                <input type="text" id="input-designer-nome" placeholder="Nome do designer" class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500" required>
                                <button type="submit" class="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-lg transition">
                                    <i class="fas fa-plus mr-2"></i>Adicionar
                                </button>
                            </form>
                            <div id="listaDesigners" class="space-y-2">
                                <!-- Será preenchido via JS -->
                            </div>
                        </div>

                        <!-- Produtos -->
                        <div class="bg-white rounded-xl shadow-md p-6">
                            <h3 class="text-xl font-semibold text-gray-800 mb-4">
                                <i class="fas fa-box text-teal-600 mr-2"></i>
                                Produtos
                            </h3>
                            <form id="formProduto" class="mb-4 flex space-x-2">
                                <input type="text" id="input-produto-nome" placeholder="Nome do produto" class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500" required>
                                <button type="submit" class="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-lg transition">
                                    <i class="fas fa-plus mr-2"></i>Adicionar
                                </button>
                            </form>
                            <div id="listaProdutos" class="space-y-2">
                                <!-- Será preenchido via JS -->
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Tab Planilhas -->
            <div id="tab-planilhas" class="tab-content hidden">
                <!-- Loading Spinner -->
                <div id="planilhas-loading" class="hidden text-center py-12">
                    <i class="fas fa-spinner fa-spin text-5xl text-teal-600"></i>
                    <p class="text-gray-600 mt-4 text-lg">Carregando planilhas...</p>
                </div>
                
                <div class="space-y-6">
                    <div class="bg-white rounded-xl shadow-md p-6">
                        <h3 class="text-xl font-semibold text-gray-800 mb-4">
                            <i class="fas fa-table text-teal-600 mr-2"></i>
                            Planilhas Individuais dos Designers
                        </h3>
                        <p class="text-gray-600 mb-6">
                            Clique no nome do designer para abrir sua planilha individual (estilo Excel) com referências cruzadas.
                        </p>
                        <div id="listaPlanilhasDesigners" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <!-- Será preenchido via JS -->
                        </div>
                    </div>
                </div>
            </div>

            <!-- Tab Planejamentos (ADMIN) -->
            <div id="tab-planejamentos" class="tab-content hidden">
                <div class="space-y-6">
                    <div class="bg-white rounded-xl shadow-md p-6">
                        <div class="flex items-center justify-between mb-6">
                            <div>
                                <h2 class="text-2xl font-bold text-gray-800">
                                    <i class="fas fa-clipboard-list text-teal-600 mr-2"></i>
                                    Planejamento Semanal
                                </h2>
                                <p class="text-gray-600 text-sm mt-1">Crie planejamentos por usuário com cálculo automático de semana ISO-8601</p>
                            </div>
                            <button onclick="showPlanejamentoSemanalForm()" class="bg-teal-600 hover:bg-teal-700 text-white font-semibold px-6 py-3 rounded-lg transition shadow-md">
                                <i class="fas fa-plus-circle mr-2"></i>Novo Planejamento
                            </button>
                        </div>
                    </div>

                    <!-- Formulário -->
                    <div id="planejamento-semanal-form" class="hidden bg-white rounded-xl shadow-md p-6">
                        <h3 class="text-xl font-semibold text-gray-800 mb-4">
                            <i class="fas fa-calendar-week text-teal-600 mr-2"></i>
                            Novo Planejamento Semanal
                        </h3>
                        <form id="formPlanejamentoSemanal" class="space-y-4">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Produto *</label>
                                    <select id="ps-produto" class="w-full px-4 py-2 border border-gray-300 rounded-lg" required>
                                        <option value="">Selecione...</option>
                                    </select>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Quantidade *</label>
                                    <input type="number" id="ps-quantidade" min="1" class="w-full px-4 py-2 border border-gray-300 rounded-lg" required>
                                </div>
                            </div>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Data Base *</label>
                                    <input type="date" id="ps-data" class="w-full px-4 py-2 border border-gray-300 rounded-lg" required>
                                    <p class="text-xs text-gray-500 mt-1">Semana será calculada automaticamente</p>
                                </div>
                                <div id="ps-semana-preview" class="p-4 bg-blue-50 border border-blue-200 rounded-lg hidden">
                                    <p class="text-sm font-medium text-gray-700">Semana Calculada:</p>
                                    <p id="ps-semana-texto" class="text-lg font-bold text-blue-600"></p>
                                </div>
                            </div>
                            <div>
                                <label class="flex items-center space-x-2 mb-2">
                                    <input type="checkbox" id="ps-aplicar-todos" class="w-4 h-4">
                                    <span class="text-sm font-medium text-gray-700">Aplicar para todos os usuários</span>
                                </label>
                            </div>
                            <div id="ps-usuarios-container">
                                <label class="block text-sm font-medium text-gray-700 mb-2">Usuários *</label>
                                <div id="ps-usuarios" class="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto border border-gray-300 rounded-lg p-3">
                                    <!-- Checkboxes preenchidos via JS -->
                                </div>
                            </div>
                            <div class="flex space-x-3">
                                <button type="submit" class="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-lg">
                                    <i class="fas fa-save mr-2"></i>Salvar
                                </button>
                                <button type="button" onclick="hidePlanejamentoSemanalForm()" class="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg">
                                    <i class="fas fa-times mr-2"></i>Cancelar
                                </button>
                            </div>
                        </form>
                    </div>

                    <!-- Lista -->
                    <div class="bg-white rounded-xl shadow-md p-6">
                        <h3 class="text-xl font-semibold text-gray-800 mb-4">
                            <i class="fas fa-list text-teal-600 mr-2"></i>
                            Planejamentos Cadastrados
                        </h3>
                        <div id="listaPlanejamentosSemanal"></div>
                    </div>
                </div>
                
                <!-- Modal Editar Planejamento -->
                <div id="modalEditPlanejamento" class="fixed inset-0 bg-black bg-opacity-50 hidden items-center justify-center z-50">
                    <div class="bg-white rounded-xl shadow-2xl p-8 max-w-2xl w-full mx-4">
                        <div class="flex items-center justify-between mb-6">
                            <h3 class="text-2xl font-bold text-gray-800">
                                <i class="fas fa-edit text-teal-600 mr-2"></i>
                                Editar Item do Planejamento
                            </h3>
                            <button onclick="closeEditPlanejamentoModal()" class="text-gray-400 hover:text-gray-600 text-2xl">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        
                        <form onsubmit="event.preventDefault(); salvarEdicaoPlanejamento()" class="space-y-4">
                            <input type="hidden" id="edit-planejamento-id">
                            
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Designer *</label>
                                <select id="edit-planejamento-designer" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500" required>
                                    <option value="">Selecione...</option>
                                </select>
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Produto *</label>
                                <select id="edit-planejamento-produto" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500" required>
                                    <option value="">Selecione...</option>
                                </select>
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Quantidade Planejada *</label>
                                <input type="number" id="edit-planejamento-quantidade" min="1" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500" required>
                            </div>
                            
                            <div class="flex space-x-3 pt-4">
                                <button type="submit" class="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-semibold px-6 py-3 rounded-lg transition">
                                    <i class="fas fa-save mr-2"></i>Salvar Alterações
                                </button>
                                <button type="button" onclick="closeEditPlanejamentoModal()" class="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold px-6 py-3 rounded-lg transition">
                                    <i class="fas fa-times mr-2"></i>Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            <!-- Tab Aprovações (ADMIN) -->
            <div id="tab-aprovacoes" class="tab-content hidden">
                <div class="bg-white rounded-xl shadow-md p-6 mb-6">
                    <div class="flex items-center justify-between mb-6">
                        <div>
                            <h2 class="text-2xl font-bold text-gray-800">
                                <i class="fas fa-check-double text-teal-600 mr-2"></i>
                                Aprovação de Produtos
                            </h2>
                            <p class="text-gray-600 text-sm mt-1">Gerencie as aprovações dos produtos criados pelos designers</p>
                        </div>
                        <div class="flex space-x-2">
                            <button onclick="filtrarAprovacoes('pendente')" class="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 transition">
                                <i class="fas fa-clock mr-2"></i>Pendentes
                            </button>
                            <button onclick="filtrarAprovacoes('todos')" class="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition">
                                <i class="fas fa-list mr-2"></i>Todos
                            </button>
                        </div>
                    </div>

                    <!-- Estatísticas Rápidas -->
                    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div class="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-4 border-l-4 border-yellow-500">
                            <div class="flex items-center justify-between">
                                <div>
                                    <p class="text-gray-600 text-sm font-medium">Pendentes</p>
                                    <p id="aprovacoes-pendentes" class="text-3xl font-bold text-gray-800 mt-1">0</p>
                                </div>
                                <div class="bg-yellow-200 rounded-full p-3">
                                    <i class="fas fa-hourglass-half text-yellow-700 text-xl"></i>
                                </div>
                            </div>
                        </div>
                        
                        <div class="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border-l-4 border-green-500">
                            <div class="flex items-center justify-between">
                                <div>
                                    <p class="text-gray-600 text-sm font-medium">Aprovados Hoje</p>
                                    <p id="aprovacoes-hoje" class="text-3xl font-bold text-gray-800 mt-1">0</p>
                                </div>
                                <div class="bg-green-200 rounded-full p-3">
                                    <i class="fas fa-check-circle text-green-700 text-xl"></i>
                                </div>
                            </div>
                        </div>
                        
                        <div class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border-l-4 border-blue-500">
                            <div class="flex items-center justify-between">
                                <div>
                                    <p class="text-gray-600 text-sm font-medium">Taxa Aprovação</p>
                                    <p id="aprovacoes-taxa" class="text-3xl font-bold text-gray-800 mt-1">0%</p>
                                </div>
                                <div class="bg-blue-200 rounded-full p-3">
                                    <i class="fas fa-percentage text-blue-700 text-xl"></i>
                                </div>
                            </div>
                        </div>
                        
                        <div class="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border-l-4 border-purple-500">
                            <div class="flex items-center justify-between">
                                <div>
                                    <p class="text-gray-600 text-sm font-medium">Total Criados</p>
                                    <p id="aprovacoes-total" class="text-3xl font-bold text-gray-800 mt-1">0</p>
                                </div>
                                <div class="bg-purple-200 rounded-full p-3">
                                    <i class="fas fa-boxes text-purple-700 text-xl"></i>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Loading -->
                    <div id="aprovacoes-loading" class="hidden text-center py-12">
                        <i class="fas fa-spinner fa-spin text-5xl text-teal-600"></i>
                        <p class="text-gray-600 mt-4">Carregando aprovações...</p>
                    </div>

                    <!-- Lista de Aprovações -->
                    <div id="listaAprovacoes" class="space-y-4">
                        <!-- Será preenchido via JS -->
                    </div>
                </div>
            </div>

            <!-- Tab Meus Produtos (USER) -->
            <div id="tab-meus-produtos" class="tab-content hidden">
                <div class="space-y-6">
                    <div class="bg-white rounded-xl shadow-md p-6">
                        <div class="flex items-center justify-between mb-6">
                            <div>
                                <h2 class="text-2xl font-bold text-gray-800">
                                    <i class="fas fa-tasks text-teal-600 mr-2"></i>
                                    Meus Produtos para Confirmar
                                </h2>
                                <p class="text-gray-600 text-sm mt-1">Todos os produtos planejados organizados por semana</p>
                            </div>
                            <button onclick="loadMeusProdutos()" class="text-teal-600 hover:text-teal-800" title="Atualizar">
                                <i class="fas fa-sync-alt text-2xl"></i>
                            </button>
                        </div>
                    </div>

                    <div id="meus-produtos-loading" class="hidden text-center py-12">
                        <i class="fas fa-spinner fa-spin text-5xl text-teal-600"></i>
                        <p class="text-gray-600 mt-4 text-lg">Carregando produtos...</p>
                    </div>

                    <div id="listaMeusProdutos" class="space-y-4">
                        <!-- Será preenchido via JS -->
                    </div>
                </div>
            </div>

            <!-- Painel Supervisor Tab (SUPERVISOR/ADMIN) -->
            <div id="tab-painel-supervisor" class="tab-content hidden">
                <div class="max-w-7xl mx-auto">
                    <div class="mb-6">
                        <h2 class="text-3xl font-bold text-gray-800 flex items-center">
                            <i class="fas fa-user-shield text-orange-600 mr-3"></i>
                            Painel do Supervisor
                        </h2>
                        <p class="text-gray-600 mt-2">Acompanhe a produção e eficiência do seu time</p>
                    </div>

                    <!-- Stats Cards -->
                    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div class="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
                            <div class="flex items-center justify-between">
                                <div>
                                    <p class="text-blue-100 text-sm font-semibold">Produzido Hoje</p>
                                    <p id="sup-total-hoje" class="text-4xl font-bold mt-2">0</p>
                                </div>
                                <i class="fas fa-box-open text-5xl text-blue-100 opacity-30"></i>
                            </div>
                        </div>

                        <div class="bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg p-6 text-white">
                            <div class="flex items-center justify-between">
                                <div>
                                    <p class="text-red-100 text-sm font-semibold">Reprovado Hoje</p>
                                    <p id="sup-reprovado-hoje" class="text-4xl font-bold mt-2">0</p>
                                </div>
                                <i class="fas fa-times-circle text-5xl text-red-100 opacity-30"></i>
                            </div>
                        </div>

                        <div class="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl shadow-lg p-6 text-white">
                            <div class="flex items-center justify-between">
                                <div>
                                    <p class="text-yellow-100 text-sm font-semibold">Pendências</p>
                                    <p id="sup-pendencias" class="text-4xl font-bold mt-2">0</p>
                                </div>
                                <i class="fas fa-clock text-5xl text-yellow-100 opacity-30"></i>
                            </div>
                        </div>

                        <div class="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
                            <div class="flex items-center justify-between">
                                <div>
                                    <p class="text-green-100 text-sm font-semibold">Eficiência</p>
                                    <p id="sup-eficiencia" class="text-4xl font-bold mt-2">0%</p>
                                </div>
                                <i class="fas fa-chart-line text-5xl text-green-100 opacity-30"></i>
                            </div>
                        </div>
                    </div>

                    <!-- Efficiency Ranking -->
                    <div class="bg-white rounded-xl shadow-md p-6">
                        <div class="flex items-center justify-between mb-4">
                            <h3 class="text-xl font-bold text-gray-800">
                                <i class="fas fa-trophy text-yellow-500 mr-2"></i>
                                Ranking de Eficiência
                            </h3>
                            <button onclick="loadSupervisorDashboard()" class="text-teal-600 hover:text-teal-700">
                                <i class="fas fa-sync-alt"></i>
                            </button>
                        </div>
                        <div id="eficiencia-ranking">
                            <!-- Will be populated via JS -->
                        </div>
                    </div>
                </div>
            </div>

            <!-- Pendências Tab (SUPERVISOR/ADMIN) -->
            <div id="tab-pendencias" class="tab-content hidden">
                <div class="max-w-7xl mx-auto">
                    <div class="flex items-center justify-between mb-6">
                        <div>
                            <h2 class="text-3xl font-bold text-gray-800 flex items-center">
                                <i class="fas fa-clipboard-check text-orange-600 mr-3"></i>
                                Painel de Aprovações
                            </h2>
                            <p class="text-gray-600 mt-2">Aprovar, reprovar ou editar lançamentos pendentes</p>
                        </div>
                        <button onclick="loadPendencias()" class="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg transition">
                            <i class="fas fa-sync-alt mr-2"></i>Atualizar
                        </button>
                    </div>

                    <div id="lista-pendencias" class="space-y-4">
                        <!-- Will be populated via JS -->
                    </div>
                </div>
            </div>

            <!-- Tab Fila de Produção (ADMIN/SUPERVISOR/USER) -->
            <div id="tab-fila-producao" class="tab-content hidden">
                <div class="max-w-7xl mx-auto">
                    <div class="flex items-center justify-between mb-6">
                        <div>
                            <h2 class="text-3xl font-bold text-gray-800 flex items-center">
                                <i class="fas fa-list-ol text-blue-600 mr-3"></i>
                                Fila de Produção
                            </h2>
                            <p class="text-gray-600 mt-2">Produtos ordenados por prioridade e data</p>
                        </div>
                        <button onclick="loadFilaProducao()" class="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg transition">
                            <i class="fas fa-sync-alt mr-2"></i>Atualizar
                        </button>
                    </div>

                    <!-- Filtros -->
                    <div class="bg-white rounded-xl shadow-md p-6 mb-6">
                        <div class="grid grid-cols-1 md:grid-cols-6 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Designer</label>
                                <select id="fila-filter-designer" onchange="loadFilaProducao()" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500">
                                    <option value="">Todos</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Mês</label>
                                <select id="fila-filter-mes" onchange="loadFilaProducao()" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500">
                                    <option value="">Todos</option>
                                    <option value="01">Janeiro</option>
                                    <option value="02">Fevereiro</option>
                                    <option value="03" selected>Março</option>
                                    <option value="04">Abril</option>
                                    <option value="05">Maio</option>
                                    <option value="06">Junho</option>
                                    <option value="07">Julho</option>
                                    <option value="08">Agosto</option>
                                    <option value="09">Setembro</option>
                                    <option value="10">Outubro</option>
                                    <option value="11">Novembro</option>
                                    <option value="12">Dezembro</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Ano</label>
                                <select id="fila-filter-ano" onchange="loadFilaProducao()" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500">
                                    <option value="2026" selected>2026</option>
                                    <option value="2025">2025</option>
                                    <option value="2024">2024</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Prioridade</label>
                                <select id="fila-filter-prioridade" onchange="loadFilaProducao()" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500">
                                    <option value="">Todas</option>
                                    <option value="urgente">🔴 Urgente</option>
                                    <option value="alta">🟠 Alta</option>
                                    <option value="media">🟡 Média</option>
                                    <option value="baixa">⚪ Baixa</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
                                <select id="fila-filter-status" onchange="loadFilaProducao()" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500">
                                    <option value="">Todos</option>
                                    <option value="pronto">✅ Pronto</option>
                                    <option value="em_producao">🔵 Em Produção</option>
                                </select>
                            </div>
                            <div class="flex items-end">
                                <button onclick="clearFilaFilters()" class="w-full px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition">
                                    <i class="fas fa-times mr-2"></i>Limpar
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Loading -->
                    <div id="fila-loading" class="hidden text-center py-12">
                        <i class="fas fa-spinner fa-spin text-5xl text-teal-600"></i>
                        <p class="text-gray-600 mt-4 text-lg">Carregando fila...</p>
                    </div>

                    <!-- Tabela de Fila -->
                    <div class="bg-white rounded-xl shadow-md overflow-hidden">
                        <div class="overflow-x-auto">
                            <table class="w-full">
                                <thead class="bg-gradient-to-r from-teal-600 to-teal-700 text-white">
                                    <tr>
                                        <th class="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Designer</th>
                                        <th class="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Produto</th>
                                        <th class="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider">Criadas</th>
                                        <th class="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider">Aprovadas</th>
                                        <th class="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider">Reprovadas</th>
                                        <th class="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider">Data</th>
                                        <th class="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider">Prioridade</th>
                                        <th class="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider">Status</th>
                                    </tr>
                                </thead>
                                <tbody id="fila-tbody" class="divide-y divide-gray-200">
                                    <!-- Will be populated via JS -->
                                </tbody>
                            </table>
                        </div>
                        <div id="fila-empty" class="hidden text-center py-12">
                            <i class="fas fa-inbox text-5xl text-gray-300 mb-4"></i>
                            <p class="text-gray-500 text-lg">Nenhum item na fila</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Tab Ranking de Designers (ADMIN/SUPERVISOR) -->
            <div id="tab-ranking-designers" class="tab-content hidden">
                <div class="max-w-7xl mx-auto">
                    <div class="flex items-center justify-between mb-6">
                        <div>
                            <h2 class="text-3xl font-bold text-gray-800 flex items-center">
                                <i class="fas fa-trophy text-yellow-500 mr-3"></i>
                                Ranking de Designers
                            </h2>
                            <p class="text-gray-600 mt-2">Classificação por desempenho e produtividade</p>
                        </div>
                        <button onclick="loadRanking()" class="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg transition">
                            <i class="fas fa-sync-alt mr-2"></i>Atualizar
                        </button>
                    </div>

                    <!-- Filtros -->
                    <div class="bg-white rounded-xl shadow-md p-6 mb-6">
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Mês</label>
                                <select id="ranking-filter-mes" onchange="loadRanking()" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500">
                                    <option value="">Todos</option>
                                    <option value="01">Janeiro</option>
                                    <option value="02">Fevereiro</option>
                                    <option value="03" selected>Março</option>
                                    <option value="04">Abril</option>
                                    <option value="05">Maio</option>
                                    <option value="06">Junho</option>
                                    <option value="07">Julho</option>
                                    <option value="08">Agosto</option>
                                    <option value="09">Setembro</option>
                                    <option value="10">Outubro</option>
                                    <option value="11">Novembro</option>
                                    <option value="12">Dezembro</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Ano</label>
                                <select id="ranking-filter-ano" onchange="loadRanking()" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500">
                                    <option value="2026" selected>2026</option>
                                    <option value="2025">2025</option>
                                    <option value="2024">2024</option>
                                </select>
                            </div>
                            <div class="flex items-end">
                                <button onclick="clearRankingFilters()" class="w-full px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition">
                                    <i class="fas fa-times mr-2"></i>Limpar
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Loading -->
                    <div id="ranking-loading" class="hidden text-center py-12">
                        <i class="fas fa-spinner fa-spin text-5xl text-teal-600"></i>
                        <p class="text-gray-600 mt-4 text-lg">Carregando ranking...</p>
                    </div>

                    <!-- Tabela de Ranking -->
                    <div class="bg-white rounded-xl shadow-md overflow-hidden">
                        <div class="overflow-x-auto">
                            <table class="w-full">
                                <thead class="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
                                    <tr>
                                        <th class="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider w-20">Posição</th>
                                        <th class="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Designer</th>
                                        <th class="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider">Total Criadas</th>
                                        <th class="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider">Total Aprovadas</th>
                                        <th class="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider">Total Reprovadas</th>
                                        <th class="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider">Taxa de Aprovação</th>
                                    </tr>
                                </thead>
                                <tbody id="ranking-tbody" class="divide-y divide-gray-200">
                                    <!-- Will be populated via JS -->
                                </tbody>
                            </table>
                        </div>
                        <div id="ranking-empty" class="hidden text-center py-12">
                            <i class="fas fa-trophy text-5xl text-gray-300 mb-4"></i>
                            <p class="text-gray-500 text-lg">Nenhum dado disponível</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Tab Relatório Executivo (ADMIN/SUPERVISOR) -->
            <div id="tab-relatorio-executivo" class="tab-content hidden">
                <div class="max-w-7xl mx-auto">
                    <div class="flex items-center justify-between mb-6">
                        <div>
                            <h2 class="text-3xl font-bold text-gray-800 flex items-center">
                                <i class="fas fa-file-pdf text-red-600 mr-3"></i>
                                Relatório Executivo
                            </h2>
                            <p class="text-gray-600 mt-2">Relatório completo de produção para download</p>
                        </div>
                        <div class="flex gap-3">
                            <button onclick="loadRelatorioExecutivo()" class="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg transition">
                                <i class="fas fa-sync-alt mr-2"></i>Atualizar
                            </button>
                            <button onclick="gerarPDF()" class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition">
                                <i class="fas fa-file-pdf mr-2"></i>Gerar PDF
                            </button>
                        </div>
                    </div>

                    <!-- Filtros -->
                    <div class="bg-white rounded-xl shadow-md p-6 mb-6">
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Mês</label>
                                <select id="relatorio-filter-mes" onchange="loadRelatorioExecutivo()" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500">
                                    <option value="">Todos</option>
                                    <option value="01">Janeiro</option>
                                    <option value="02">Fevereiro</option>
                                    <option value="03" selected>Março</option>
                                    <option value="04">Abril</option>
                                    <option value="05">Maio</option>
                                    <option value="06">Junho</option>
                                    <option value="07">Julho</option>
                                    <option value="08">Agosto</option>
                                    <option value="09">Setembro</option>
                                    <option value="10">Outubro</option>
                                    <option value="11">Novembro</option>
                                    <option value="12">Dezembro</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Ano</label>
                                <select id="relatorio-filter-ano" onchange="loadRelatorioExecutivo()" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500">
                                    <option value="2026" selected>2026</option>
                                    <option value="2025">2025</option>
                                    <option value="2024">2024</option>
                                </select>
                            </div>
                            <div class="flex items-end">
                                <button onclick="clearRelatorioFilters()" class="w-full px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition">
                                    <i class="fas fa-times mr-2"></i>Limpar
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Loading -->
                    <div id="relatorio-loading" class="hidden text-center py-12">
                        <i class="fas fa-spinner fa-spin text-5xl text-teal-600"></i>
                        <p class="text-gray-600 mt-4 text-lg">Carregando relatório...</p>
                    </div>

                    <!-- Conteúdo do Relatório -->
                    <div id="relatorio-content" class="space-y-6">
                        <!-- Resumo Geral -->
                        <div class="bg-white rounded-xl shadow-md p-6">
                            <h3 class="text-xl font-bold text-gray-800 mb-4 flex items-center">
                                <i class="fas fa-chart-bar text-teal-600 mr-2"></i>
                                Resumo Geral
                            </h3>
                            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div class="bg-blue-50 rounded-lg p-4 text-center">
                                    <p class="text-sm text-gray-600 mb-1">Total Criadas</p>
                                    <p id="resumo-criadas" class="text-3xl font-bold text-blue-600">0</p>
                                </div>
                                <div class="bg-green-50 rounded-lg p-4 text-center">
                                    <p class="text-sm text-gray-600 mb-1">Total Aprovadas</p>
                                    <p id="resumo-aprovadas" class="text-3xl font-bold text-green-600">0</p>
                                </div>
                                <div class="bg-red-50 rounded-lg p-4 text-center">
                                    <p class="text-sm text-gray-600 mb-1">Total Reprovadas</p>
                                    <p id="resumo-reprovadas" class="text-3xl font-bold text-red-600">0</p>
                                </div>
                                <div class="bg-teal-50 rounded-lg p-4 text-center">
                                    <p class="text-sm text-gray-600 mb-1">Taxa de Aprovação</p>
                                    <p id="resumo-taxa" class="text-3xl font-bold text-teal-600">0%</p>
                                </div>
                            </div>
                        </div>

                        <!-- Ranking de Designers -->
                        <div class="bg-white rounded-xl shadow-md p-6">
                            <h3 class="text-xl font-bold text-gray-800 mb-4 flex items-center">
                                <i class="fas fa-trophy text-yellow-500 mr-2"></i>
                                Top Designers
                            </h3>
                            <div class="overflow-x-auto">
                                <table class="w-full">
                                    <thead class="bg-gray-100">
                                        <tr>
                                            <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Designer</th>
                                            <th class="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Criadas</th>
                                            <th class="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Aprovadas</th>
                                            <th class="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Taxa</th>
                                        </tr>
                                    </thead>
                                    <tbody id="relatorio-ranking-tbody" class="divide-y divide-gray-200">
                                        <!-- Will be populated via JS -->
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <!-- Produção por Produto -->
                        <div class="bg-white rounded-xl shadow-md p-6">
                            <h3 class="text-xl font-bold text-gray-800 mb-4 flex items-center">
                                <i class="fas fa-box text-purple-600 mr-2"></i>
                                Produção por Produto
                            </h3>
                            <div class="overflow-x-auto">
                                <table class="w-full">
                                    <thead class="bg-gray-100">
                                        <tr>
                                            <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Produto</th>
                                            <th class="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Criadas</th>
                                            <th class="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Aprovadas</th>
                                            <th class="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Reprovadas</th>
                                        </tr>
                                    </thead>
                                    <tbody id="relatorio-produtos-tbody" class="divide-y divide-gray-200">
                                        <!-- Will be populated via JS -->
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <!-- Produção Semanal -->
                        <div class="bg-white rounded-xl shadow-md p-6">
                            <h3 class="text-xl font-bold text-gray-800 mb-4 flex items-center">
                                <i class="fas fa-calendar-week text-indigo-600 mr-2"></i>
                                Produção Semanal
                            </h3>
                            <div class="h-80">
                                <canvas id="chart-producao-semanal"></canvas>
                            </div>
                        </div>

                        <!-- Gráfico de Desempenho por Designer -->
                        <div class="bg-white rounded-xl shadow-md p-6">
                            <h3 class="text-xl font-bold text-gray-800 mb-4 flex items-center">
                                <i class="fas fa-chart-bar text-green-600 mr-2"></i>
                                Desempenho por Designer
                            </h3>
                            <div class="h-80">
                                <canvas id="chart-desempenho-designers"></canvas>
                            </div>
                        </div>
                    </div>

                    <div id="relatorio-empty" class="hidden text-center py-12 bg-white rounded-xl shadow-md">
                        <i class="fas fa-file-pdf text-5xl text-gray-300 mb-4"></i>
                        <p class="text-gray-500 text-lg">Nenhum dado disponível para o período selecionado</p>
                    </div>
                </div>
            </div>

            <!-- Gerenciar Usuários Tab (ADMIN ONLY) -->
            <div id="tab-gerenciar-usuarios" class="tab-content hidden">
                <div class="max-w-7xl mx-auto">
                    <div class="flex items-center justify-between mb-6">
                        <h2 class="text-2xl font-bold text-gray-800">
                            <i class="fas fa-users-cog text-teal-600 mr-3"></i>
                            Gerenciamento de Usuários
                        </h2>
                        <button onclick="loadAllUsers()" class="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg transition">
                            <i class="fas fa-sync-alt mr-2"></i>Atualizar
                        </button>
                    </div>

                    <!-- Users List -->
                    <div class="bg-white rounded-xl shadow-md p-6">
                        <!-- Loading -->
                        <div id="users-loading" class="hidden text-center py-12">
                            <i class="fas fa-spinner fa-spin text-5xl text-teal-600"></i>
                            <p class="text-gray-600 mt-4 text-lg">Carregando usuários...</p>
                        </div>
                        
                        <!-- Users Table -->
                        <div id="users-table-container" class="overflow-x-auto">
                            <!-- Will be populated via JS -->
                        </div>
                    </div>
                </div>
            </div>

            <!-- Modal: Editar Usuário (ADMIN) -->
            <div id="modalEditUser" class="fixed inset-0 bg-black bg-opacity-50 hidden items-center justify-center z-50">
                <div class="bg-white rounded-xl shadow-2xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                    <div class="sticky top-0 bg-teal-600 text-white px-6 py-4 flex justify-between items-center rounded-t-xl">
                        <h3 class="text-xl font-bold">
                            <i class="fas fa-user-edit mr-2"></i>
                            Editar Usuário
                        </h3>
                        <button onclick="closeEditUserModal()" class="text-white hover:text-gray-200 transition">
                            <i class="fas fa-times text-2xl"></i>
                        </button>
                    </div>
                    
                    <div class="p-6">
                        <form id="formEditUser">
                            <input type="hidden" id="edit-user-id">
                            
                            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                                <!-- Avatar Section -->
                                <div class="md:col-span-1">
                                    <div class="text-center">
                                        <div class="relative inline-block">
                                            <div id="edit-avatar-preview" class="w-32 h-32 rounded-full bg-teal-100 flex items-center justify-center text-3xl font-bold text-teal-600 mb-4 mx-auto overflow-hidden border-4 border-teal-200">
                                                <i class="fas fa-user"></i>
                                            </div>
                                            <label for="edit-avatar-upload" class="absolute bottom-2 right-2 bg-teal-600 hover:bg-teal-700 text-white rounded-full p-2 cursor-pointer transition shadow-lg">
                                                <i class="fas fa-camera"></i>
                                                <input type="file" id="edit-avatar-upload" accept="image/*" class="hidden">
                                            </label>
                                        </div>
                                        <p class="text-sm text-gray-500">Clique no ícone para alterar</p>
                                        <p class="text-xs text-gray-400 mt-1">Máx: 500KB</p>
                                    </div>
                                </div>
                                
                                <!-- User Info -->
                                <div class="md:col-span-2 space-y-4">
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-2">Nome Completo *</label>
                                        <input type="text" id="edit-user-nome" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500" required>
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-2">Nome de Exibição</label>
                                        <input type="text" id="edit-user-nome-exibicao" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500" placeholder="Opcional">
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-2">E-mail</label>
                                        <input type="email" id="edit-user-email" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500" placeholder="usuario@email.com">
                                    </div>
                                </div>
                            </div>
                            
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Função *</label>
                                    <select id="edit-user-role" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500" required>
                                        <option value="user">Usuário</option>
                                        <option value="admin">Administrador</option>
                                    </select>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Status *</label>
                                    <select id="edit-user-ativo" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500" required>
                                        <option value="1">Ativo</option>
                                        <option value="0">Inativo</option>
                                    </select>
                                </div>
                            </div>
                            
                            <!-- Password Reset Section -->
                            <div class="bg-gray-50 rounded-lg p-4 mb-6">
                                <h4 class="text-md font-semibold text-gray-700 mb-3 flex items-center">
                                    <i class="fas fa-key text-teal-600 mr-2"></i>
                                    Redefinir Senha
                                </h4>
                                <div class="space-y-3">
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-2">Nova Senha</label>
                                        <div class="relative">
                                            <input type="password" id="edit-user-senha" class="w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500" minlength="6" placeholder="Deixe vazio para não alterar">
                                            <button type="button" onclick="togglePassword('edit-user-senha')" class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700">
                                                <i class="fas fa-eye"></i>
                                            </button>
                                        </div>
                                        <p class="text-xs text-gray-500 mt-1">Mínimo: 6 caracteres. Deixe em branco para não alterar.</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="flex justify-end gap-3">
                                <button type="button" onclick="closeEditUserModal()" class="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-semibold">
                                    <i class="fas fa-times mr-2"></i>Cancelar
                                </button>
                                <button type="submit" id="btn-save-user" class="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-lg transition font-semibold">
                                    <i class="fas fa-save mr-2"></i>Salvar Alterações
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            <!-- Modal: Confirmar Exclusão de Usuário (ADMIN) -->
            <div id="modalConfirmDelete" class="fixed inset-0 bg-black bg-opacity-50 hidden items-center justify-center z-50">
                <div class="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4">
                    <div class="bg-red-600 text-white px-6 py-4 rounded-t-xl">
                        <h3 class="text-xl font-bold flex items-center">
                            <i class="fas fa-exclamation-triangle mr-2"></i>
                            Confirmar Exclusão
                        </h3>
                    </div>
                    
                    <div class="p-6">
                        <p class="text-gray-700 mb-2">Tem certeza que deseja excluir este usuário?</p>
                        <div id="delete-user-info" class="bg-gray-50 rounded-lg p-4 mb-4">
                            <div class="flex items-center">
                                <div id="delete-user-avatar" class="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 font-bold mr-3">
                                    <i class="fas fa-user"></i>
                                </div>
                                <div>
                                    <p class="font-semibold text-gray-800" id="delete-user-name">Nome do Usuário</p>
                                    <p class="text-sm text-gray-500" id="delete-user-email">email@example.com</p>
                                </div>
                            </div>
                        </div>
                        <p class="text-sm text-red-600 mb-4">
                            <i class="fas fa-info-circle mr-1"></i>
                            Esta ação não pode ser desfeita. O usuário será desativado do sistema.
                        </p>
                        
                        <div class="flex justify-end gap-3">
                            <button onclick="closeDeleteModal()" class="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-semibold">
                                <i class="fas fa-times mr-2"></i>Cancelar
                            </button>
                            <button onclick="confirmDeleteUser()" id="btn-confirm-delete" class="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition font-semibold">
                                <i class="fas fa-trash-alt mr-2"></i>Excluir Usuário
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Configurações Tab -->
            <div id="tab-configuracoes" class="tab-content hidden">
                <div class="max-w-4xl mx-auto">
                    <h2 class="text-2xl font-bold text-gray-800 mb-6">
                        <i class="fas fa-user-cog text-teal-600 mr-3"></i>
                        Configurações do Usuário
                    </h2>

                    <!-- Profile Section -->
                    <div class="bg-white rounded-xl shadow-md p-6 mb-6">
                        <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                            <i class="fas fa-user text-teal-600 mr-2"></i>
                            Perfil
                        </h3>
                        
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <!-- Avatar Preview -->
                            <div class="md:col-span-1">
                                <div class="text-center">
                                    <div class="relative inline-block">
                                        <div id="avatar-preview" class="w-32 h-32 rounded-full bg-teal-100 flex items-center justify-center text-3xl font-bold text-teal-600 mb-4 mx-auto overflow-hidden border-4 border-teal-200">
                                            <i class="fas fa-user"></i>
                                        </div>
                                        <label for="avatar-upload" class="absolute bottom-2 right-2 bg-teal-600 hover:bg-teal-700 text-white rounded-full p-2 cursor-pointer transition shadow-lg">
                                            <i class="fas fa-camera"></i>
                                            <input type="file" id="avatar-upload" accept="image/*" class="hidden">
                                        </label>
                                    </div>
                                    <p class="text-sm text-gray-500">Clique no ícone para alterar</p>
                                    <p class="text-xs text-gray-400 mt-1">Máx: 500KB</p>
                                </div>
                            </div>
                            
                            <!-- Profile Form -->
                            <div class="md:col-span-2">
                                <form id="form-profile" class="space-y-4">
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-2">Nome Completo *</label>
                                        <input type="text" id="profile-nome" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500" required>
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-2">Nome de Exibição</label>
                                        <input type="text" id="profile-nome-exibicao" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500" placeholder="Opcional">
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-2">E-mail</label>
                                        <input type="email" id="profile-email" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500" placeholder="seu@email.com">
                                    </div>
                                    <div class="flex justify-end">
                                        <button type="submit" id="btn-save-profile" class="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-lg transition font-semibold">
                                            <i class="fas fa-save mr-2"></i>Salvar Perfil
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>

                    <!-- Security Section -->
                    <div class="bg-white rounded-xl shadow-md p-6 mb-6">
                        <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                            <i class="fas fa-lock text-teal-600 mr-2"></i>
                            Segurança
                        </h3>
                        
                        <form id="form-password" class="space-y-4 max-w-md">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Senha Atual *</label>
                                <div class="relative">
                                    <input type="password" id="password-atual" class="w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500" required>
                                    <button type="button" onclick="togglePassword('password-atual')" class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700">
                                        <i class="fas fa-eye"></i>
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Nova Senha *</label>
                                <div class="relative">
                                    <input type="password" id="password-nova" class="w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500" required minlength="6">
                                    <button type="button" onclick="togglePassword('password-nova')" class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700">
                                        <i class="fas fa-eye"></i>
                                    </button>
                                </div>
                                <p class="text-xs text-gray-500 mt-1">Mínimo: 6 caracteres</p>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Confirmar Nova Senha *</label>
                                <div class="relative">
                                    <input type="password" id="password-confirmacao" class="w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500" required minlength="6">
                                    <button type="button" onclick="togglePassword('password-confirmacao')" class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700">
                                        <i class="fas fa-eye"></i>
                                    </button>
                                </div>
                            </div>
                            <div class="flex justify-end pt-2">
                                <button type="submit" id="btn-change-password" class="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-lg transition font-semibold">
                                    <i class="fas fa-key mr-2"></i>Alterar Senha
                                </button>
                            </div>
                        </form>
                    </div>

                    <!-- Preferences Section (Extensible) -->
                    <div class="bg-white rounded-xl shadow-md p-6">
                        <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                            <i class="fas fa-sliders-h text-teal-600 mr-2"></i>
                            Preferências
                        </h3>
                        
                        <div class="text-gray-500 text-center py-8">
                            <i class="fas fa-cog text-4xl mb-3"></i>
                            <p>Configurações adicionais em breve...</p>
                        </div>
                    </div>
                </div>
            </div>
        </main>

        <!-- Modal de Edição de Lançamento -->
        <div id="modalEditLancamento" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-xl font-semibold text-gray-800">
                        <i class="fas fa-edit text-teal-600 mr-2"></i>
                        Editar Lançamento
                    </h3>
                    <button onclick="closeEditModal()" class="text-gray-500 hover:text-gray-700">
                        <i class="fas fa-times text-xl"></i>
                    </button>
                </div>
                <form id="formEditLancamento" class="space-y-4">
                    <input type="hidden" id="edit-id">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Designer</label>
                        <select id="edit-designer" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500" required>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Produto</label>
                        <select id="edit-produto" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500" required>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Semana</label>
                        <input type="number" id="edit-semana" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500" min="1" required>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Data</label>
                        <input type="date" id="edit-data" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500" required>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Quantidade Criada</label>
                        <input type="number" id="edit-criada" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500" min="0" required>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Quantidade Reprovada</label>
                        <input type="number" id="edit-reprovada" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500" min="0" required>
                        <p class="text-xs text-gray-500 mt-1">Não pode ser maior que Quantidade Criada</p>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Quantidade Aprovada <span class="text-xs text-gray-500">(calculado automaticamente)</span></label>
                        <input type="number" id="edit-aprovada" class="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-teal-500" min="0" readonly>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Observações</label>
                        <textarea id="edit-obs" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500" rows="2"></textarea>
                    </div>
                    <button type="submit" class="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 px-6 rounded-lg transition shadow-md">
                        <i class="fas fa-save mr-2"></i>Salvar Alterações
                    </button>
                </form>
            </div>
        </div>

        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
        <script>
        // Função toggleDropdown - disponível imediatamente
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
        </script>
        
        <script src="/static/app.js"></script>
    </body>
    </html>
  `)
})


// ======================
// PÁGINA DE DESIGNER INDIVIDUAL
// ======================

// Importar a view estilo planilha
import { generateDesignerSheetView } from './designer-sheet-view'

app.get('/designer/:designer_id', async (c) => {
  const { DB } = c.env
  const designer_id = c.req.param('designer_id')
  
  // Buscar designer
  const designer = await DB.prepare('SELECT * FROM designers WHERE id = ? AND ativo = 1').bind(designer_id).first()
  
  if (!designer) {
    return c.text('Designer não encontrado', 404)
  }
  
  // Usar a view de Controle Semanal simplificada (v8)
  return c.html(generateDesignerWeeklyControl(designer_id, designer.nome))
  
  /* View anterior - Mantida para referência
  return c.html(`
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${designer.nome} - Checklist de Produção</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <script>
          tailwind.config = {
            theme: {
              extend: {
                colors: {
                  teal: {
                    50: '#e6f7f9',
                    100: '#b3e5ec',
                    200: '#80d3df',
                    300: '#4dc1d2',
                    400: '#1aafc5',
                    500: '#00829B',
                    600: '#00829B',
                    700: '#006378',
                    800: '#004a5a',
                    900: '#00313c'
                  }
                }
              }
            }
          }
        </script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <style>
          .checkbox-custom {
            width: 24px;
            height: 24px;
            cursor: pointer;
          }
          .task-complete {
            opacity: 0.6;
            background-color: #f0fdf4;
          }
        </style>
    </head>
    <body class="bg-gradient-to-br from-teal-50 to-teal-100 min-h-screen">
        <!-- Header -->
        <header class="bg-gradient-to-r from-teal-600 to-teal-800 text-white shadow-xl">
            <div class="container mx-auto px-6 py-4">
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-4">
                        <a href="/" class="text-white hover:text-teal-200 transition">
                            <i class="fas fa-arrow-left text-2xl"></i>
                        </a>
                        <div>
                            <h1 class="text-3xl font-bold">${designer.nome}</h1>
                            <p class="text-teal-200 text-sm">Checklist de Produção</p>
                        </div>
                    </div>
                    <div class="flex items-center space-x-4">
                        <select id="semana-filter" onchange="loadChecklist()" class="px-4 py-2 rounded-lg bg-white/20 text-white border-2 border-white/30 focus:outline-none focus:border-white">
                            <option value="">Todas as Semanas</option>
                        </select>
                        <button onclick="loadChecklist()" class="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition">
                            <i class="fas fa-sync-alt"></i>
                        </button>
                    </div>
                </div>
            </div>
        </header>

        <main class="container mx-auto px-6 py-8">
            <!-- Estatísticas -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div class="bg-white rounded-xl shadow-lg p-6 border-l-4 border-teal-500">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-gray-500 text-sm font-medium">Total de Tarefas</p>
                            <p id="stat-total" class="text-3xl font-bold text-gray-800 mt-2">-</p>
                        </div>
                        <div class="bg-teal-100 rounded-full p-3">
                            <i class="fas fa-tasks text-teal-600 text-2xl"></i>
                        </div>
                    </div>
                </div>
                
                <div class="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-500">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-gray-500 text-sm font-medium">Criadas ✓</p>
                            <p id="stat-criadas" class="text-3xl font-bold text-gray-800 mt-2">-</p>
                        </div>
                        <div class="bg-yellow-100 rounded-full p-3">
                            <i class="fas fa-check text-yellow-600 text-2xl"></i>
                        </div>
                    </div>
                </div>
                
                <div class="bg-white rounded-xl shadow-lg p-6 border-l-4 border-teal-500">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-gray-500 text-sm font-medium">Aprovadas OK</p>
                            <p id="stat-aprovadas" class="text-3xl font-bold text-gray-800 mt-2">-</p>
                        </div>
                        <div class="bg-teal-100 rounded-full p-3">
                            <i class="fas fa-thumbs-up text-teal-600 text-2xl"></i>
                        </div>
                    </div>
                </div>
                
                <div class="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-gray-500 text-sm font-medium">Completas</p>
                            <p id="stat-completas" class="text-3xl font-bold text-gray-800 mt-2">-</p>
                        </div>
                        <div class="bg-purple-100 rounded-full p-3">
                            <i class="fas fa-check-double text-purple-600 text-2xl"></i>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Checklist -->
            <div class="bg-white rounded-xl shadow-xl p-6">
                <h2 class="text-2xl font-bold text-gray-800 mb-6">
                    <i class="fas fa-clipboard-check text-teal-600 mr-2"></i>
                    Checklist de Produção
                </h2>
                <div id="checklist" class="space-y-4">
                    <!-- Será preenchido via JS -->
                </div>
            </div>
        </main>

        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script>
          const DESIGNER_ID = ${designer_id};
          const API_URL = '';
          
          async function loadChecklist() {
            try {
              const semana = document.getElementById('semana-filter').value;
              const params = new URLSearchParams();
              if (semana) params.append('semana', semana);
              
              // Carregar checklist
              const checklistRes = await axios.get(\`\${API_URL}/api/designer/\${DESIGNER_ID}/checklist?\${params}\`);
              renderChecklist(checklistRes.data);
              
              // Carregar estatísticas
              const statsRes = await axios.get(\`\${API_URL}/api/designer/\${DESIGNER_ID}/stats?\${params}\`);
              renderStats(statsRes.data);
              
              // Atualizar filtro de semanas
              await updateSemanasFilter(checklistRes.data);
              
            } catch (error) {
              console.error('Erro ao carregar checklist:', error);
              showNotification('Erro ao carregar dados', 'error');
            }
          }
          
          function renderStats(stats) {
            document.getElementById('stat-total').textContent = stats.total_tarefas || 0;
            document.getElementById('stat-criadas').textContent = stats.criadas_ok || 0;
            document.getElementById('stat-aprovadas').textContent = stats.aprovadas_ok || 0;
            document.getElementById('stat-completas').textContent = stats.completas || 0;
          }
          
          function renderChecklist(tasks) {
            const container = document.getElementById('checklist');
            
            if (!tasks || tasks.length === 0) {
              container.innerHTML = '<p class="text-gray-500 text-center py-8">Nenhuma tarefa encontrada</p>';
              return;
            }
            
            // Agrupar por semana
            const grouped = {};
            tasks.forEach(task => {
              if (!grouped[task.semana]) {
                grouped[task.semana] = [];
              }
              grouped[task.semana].push(task);
            });
            
            let html = '';
            Object.keys(grouped).sort((a, b) => b - a).forEach(semana => {
              html += \`
                <div class="mb-6">
                  <h3 class="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                    <i class="fas fa-calendar-week text-teal-600 mr-2"></i>
                    Semana \${semana}
                  </h3>
                  <div class="space-y-2">
                    \${grouped[semana].map(task => {
                      const isComplete = task.criado_check && task.aprovado_ok;
                      return \`
                        <div class="flex items-center p-4 border border-gray-200 rounded-lg hover:shadow-md transition \${isComplete ? 'task-complete' : ''}">
                          <div class="flex items-center space-x-4 flex-1">
                            <!-- Checkbox Criação -->
                            <div class="flex flex-col items-center">
                              <input type="checkbox" 
                                     \${task.criado_check ? 'checked' : ''}
                                     onchange="toggleCriado(\${task.id}, this.checked)"
                                     class="checkbox-custom"
                                     title="Marcar como criada">
                              <span class="text-xs text-gray-500 mt-1">Criada</span>
                            </div>
                            
                            <!-- Info Produto -->
                            <div class="flex-1">
                              <p class="font-semibold text-gray-800">\${task.produto_nome}</p>
                              <p class="text-sm text-gray-500">
                                \${task.data ? new Date(task.data).toLocaleDateString('pt-BR') : ''} 
                                \${task.posicao ? ' - ' + task.posicao : ''}
                              </p>
                            </div>
                            
                            <!-- Quantidade -->
                            <div class="text-center">
                              <p class="text-sm text-gray-500">Qtd</p>
                              <input type="number" 
                                     value="\${task.quantidade_aprovada || 0}"
                                     onchange="updateQuantidade(\${task.id}, this.value)"
                                     class="w-16 px-2 py-1 border border-gray-300 rounded text-center"
                                     min="0">
                            </div>
                            
                            <!-- Posição -->
                            <div class="text-center">
                              <p class="text-sm text-gray-500">Posição</p>
                              <select onchange="updatePosicao(\${task.id}, this.value)"
                                      class="px-2 py-1 border border-gray-300 rounded">
                                <option value="">-</option>
                                <option value="1º" \${task.posicao === '1º' ? 'selected' : ''}>1º</option>
                                <option value="2º" \${task.posicao === '2º' ? 'selected' : ''}>2º</option>
                                <option value="3º" \${task.posicao === '3º' ? 'selected' : ''}>3º</option>
                                <option value="4º" \${task.posicao === '4º' ? 'selected' : ''}>4º</option>
                                <option value="5º" \${task.posicao === '5º' ? 'selected' : ''}>5º</option>
                              </select>
                            </div>
                            
                            <!-- OK Button -->
                            <button onclick="toggleAprovado(\${task.id}, !\${task.aprovado_ok}, document.querySelector('input[onchange*=\"updateQuantidade(\${task.id}\"')[0] ? document.querySelector('input[onchange*=\"updateQuantidade(\${task.id}\"')[0].value : 0)"
                                    class="px-6 py-2 rounded-lg font-semibold transition \${task.aprovado_ok ? 'bg-teal-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-teal-500 hover:text-white'}">
                              \${task.aprovado_ok ? 'OK ✓' : 'OK'}
                            </button>
                          </div>
                        </div>
                      \`;
                    }).join('')}
                  </div>
                </div>
              \`;
            });
            
            container.innerHTML = html;
          }
          
          async function toggleCriado(id, checked) {
            try {
              await axios.patch(\`\${API_URL}/api/lancamentos/\${id}/check-criado\`, { checked });
              showNotification(checked ? 'Marcado como criada!' : 'Desmarcado', 'success');
              loadChecklist();
            } catch (error) {
              console.error('Erro:', error);
              showNotification('Erro ao atualizar', 'error');
            }
          }
          
          async function toggleAprovado(id, checked, quantidade) {
            try {
              await axios.patch(\`\${API_URL}/api/lancamentos/\${id}/check-aprovado\`, { 
                checked,
                quantidade_aprovada: parseInt(quantidade) || 0
              });
              showNotification(checked ? 'Aprovado! ✓' : 'Aprovação removida', 'success');
              loadChecklist();
            } catch (error) {
              console.error('Erro:', error);
              showNotification('Erro ao atualizar', 'error');
            }
          }
          
          async function updateQuantidade(id, quantidade) {
            try {
              await axios.put(\`\${API_URL}/api/lancamentos/\${id}\`, { 
                quantidade_aprovada: parseInt(quantidade) || 0
              });
              showNotification('Quantidade atualizada!', 'success');
            } catch (error) {
              console.error('Erro:', error);
            }
          }
          
          async function updatePosicao(id, posicao) {
            try {
              await axios.patch(\`\${API_URL}/api/lancamentos/\${id}/posicao\`, { posicao });
              showNotification('Posição atualizada!', 'success');
            } catch (error) {
              console.error('Erro:', error);
            }
          }
          
          function updateSemanasFilter(tasks) {
            const semanas = [...new Set(tasks.map(t => t.semana))].sort((a, b) => b - a);
            const select = document.getElementById('semana-filter');
            const currentValue = select.value;
            
            select.innerHTML = '<option value="">Todas as Semanas</option>' +
              semanas.map(s => \`<option value="\${s}">Semana \${s}</option>\`).join('');
            
            if (currentValue) select.value = currentValue;
          }
          
          function showNotification(message, type = 'info') {
            const colors = {
              success: 'bg-teal-500',
              error: 'bg-teal-500',
              info: 'bg-teal-500'
            };
            
            const notification = document.createElement('div');
            notification.className = \`fixed top-4 right-4 \${colors[type]} text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-opacity\`;
            notification.textContent = message;
            
            document.body.appendChild(notification);
            
            setTimeout(() => {
              notification.style.opacity = '0';
              setTimeout(() => notification.remove(), 300);
            }, 2000);
          }
          
          // Inicializar
          loadChecklist();
        </script>
    </body>
    </html>
  `)
  */
})


export default app
