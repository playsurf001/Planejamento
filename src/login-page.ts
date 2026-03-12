export function generateLoginPage() {
  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Login - Controle de Produção</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <style>
          body {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          }
        </style>
    </head>
    <body class="min-h-screen flex items-center justify-center p-4">
        <div class="max-w-md w-full">
            <!-- Logo/Header -->
            <div class="text-center mb-8">
                <div class="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <i class="fas fa-chart-line text-4xl text-indigo-600"></i>
                </div>
                <h1 class="text-3xl font-bold text-white mb-2">Controle de Produção</h1>
                <p class="text-indigo-200">Sistema de Gestão de Design</p>
            </div>

            <!-- Login Card -->
            <div class="bg-white rounded-2xl shadow-2xl p-8">
                <h2 class="text-2xl font-bold text-gray-800 mb-6 text-center">
                    <i class="fas fa-sign-in-alt text-indigo-600 mr-2"></i>
                    Entrar
                </h2>

                <!-- Mensagem de erro -->
                <div id="error-message" class="hidden mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                    <i class="fas fa-exclamation-circle mr-2"></i>
                    <span id="error-text"></span>
                </div>

                <!-- Formulário -->
                <form id="loginForm" class="space-y-6">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            <i class="fas fa-user text-gray-400 mr-2"></i>
                            Usuário
                        </label>
                        <input 
                            type="text" 
                            id="username" 
                            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            placeholder="Digite seu usuário"
                            required
                            autofocus>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            <i class="fas fa-lock text-gray-400 mr-2"></i>
                            Senha
                        </label>
                        <input 
                            type="password" 
                            id="password" 
                            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            placeholder="Digite sua senha"
                            required>
                    </div>

                    <button 
                        type="submit" 
                        class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg transition duration-200 shadow-lg hover:shadow-xl">
                        <i class="fas fa-sign-in-alt mr-2"></i>
                        Entrar
                    </button>
                </form>

                <!-- Usuários de teste -->
                <div class="mt-6 pt-6 border-t border-gray-200">
                    <p class="text-xs text-gray-500 text-center mb-2">Usuários de teste:</p>
                    <div class="text-xs text-gray-600 space-y-1">
                        <div class="bg-gray-50 p-2 rounded">
                            <strong>Admin:</strong> admin / admin123
                        </div>
                        <div class="bg-gray-50 p-2 rounded">
                            <strong>Designers:</strong> amanda, filiphe, lidivania / senha123
                        </div>
                    </div>
                </div>
            </div>

            <!-- Footer -->
            <div class="text-center mt-6 text-white text-sm">
                <p>&copy; 2025 Sistema de Controle de Produção</p>
            </div>
        </div>

        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script>
          const loginForm = document.getElementById('loginForm');
          const errorMessage = document.getElementById('error-message');
          const errorText = document.getElementById('error-text');

          loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            try {
              const response = await axios.post('/api/auth/login', {
                username,
                password
              });

              if (response.data.success) {
                // Salvar token no localStorage
                localStorage.setItem('auth_token', response.data.token);
                localStorage.setItem('user_data', JSON.stringify(response.data.user));
                
                // Redirecionar
                window.location.href = '/';
              }
            } catch (error) {
              errorMessage.classList.remove('hidden');
              errorText.textContent = error.response?.data?.message || 'Usuário ou senha inválidos';
              
              setTimeout(() => {
                errorMessage.classList.add('hidden');
              }, 3000);
            }
          });
        </script>
    </body>
    </html>
  `;
}
