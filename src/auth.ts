// Sistema de Autenticação com D1 Database
// Suporte a 3 roles: admin, supervisor, user

export interface CustomPermissions {
  dashboard?: boolean;
  designers?: boolean;
  lancamentos?: boolean;
  relatorios?: boolean;
  metas?: boolean;
  acompanhamento?: boolean;
  cadastros?: boolean;
  planejamentos?: boolean;
  aprovacoes?: boolean;
  'painel-supervisor'?: boolean;
  pendencias?: boolean;
  'meus-produtos'?: boolean;
  'gerenciar-usuarios'?: boolean;
  configuracoes?: boolean;
  is_supervisor?: boolean;  // Flag para identificar supervisor via permissões
}

export interface User {
  id: number;
  username: string;
  nome: string;
  role: 'admin' | 'supervisor' | 'user'; // ← ATUALIZADO: 3 roles
  sector_id?: number | null; // ← NOVO: setor do supervisor
  permissoes?: CustomPermissions;
}

export interface Designer {
  id: number;
  nome: string;
  ativo: number;
  role: string;
  sector_id?: number | null;
  created_at: string;
}

// Interface estendida para incluir senha, permissoes e sector_id
interface DesignerWithPassword extends Designer {
  senha: string | null;
  permissoes: string | null;
  sector_id: number | null;
}

// Autenticar usuário no banco D1
export async function authenticateUser(
  DB: D1Database, 
  username: string, 
  password: string
): Promise<User | null> {
  try {
    // Buscar designer no banco COM senha, permissoes e sector_id
    const designer = await DB.prepare(`
      SELECT id, nome, role, senha, permissoes, sector_id
      FROM designers 
      WHERE LOWER(nome) = LOWER(?) 
        AND ativo = 1
    `).bind(username).first<DesignerWithPassword>();
    
    if (!designer) {
      return null;
    }
    
    // Verificar senha do banco de dados
    // Se senha está null, aceitar o padrão nome + "123" (retrocompatibilidade)
    const senhaValida = designer.senha 
      ? password === designer.senha 
      : password.toLowerCase() === username.toLowerCase() + '123';
    
    if (!senhaValida) {
      return null;
    }
    
    // Parse permissoes customizadas
    let permissoes: CustomPermissions | undefined = undefined;
    if (designer.permissoes) {
      try {
        permissoes = JSON.parse(designer.permissoes);
      } catch {
        permissoes = undefined;
      }
    }
    
    // Determinar role: admin, supervisor ou user
    let role: 'admin' | 'supervisor' | 'user' = 'user';
    if (designer.role === 'admin') {
      role = 'admin';
    } else if (designer.role === 'supervisor') {
      role = 'supervisor';
    }
    
    // Retornar usuário autenticado
    return {
      id: designer.id,
      username: designer.nome.toLowerCase(),
      nome: designer.nome,
      role,
      sector_id: designer.sector_id,
      permissoes
    };
  } catch (error) {
    console.error('Erro na autenticação:', error);
    return null;
  }
}

export function generateToken(user: User): string {
  // Token simples com Base64 (em produção, usar JWT)
  return Buffer.from(JSON.stringify({ 
    id: user.id,
    username: user.username, 
    nome: user.nome,
    role: user.role,
    sector_id: user.sector_id || null,
    permissoes: user.permissoes || {}
  })).toString('base64');
}

export function verifyToken(token: string): User | null {
  try {
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
    return {
      id: decoded.id,
      username: decoded.username,
      nome: decoded.nome,
      role: decoded.role,
      sector_id: decoded.sector_id || null,
      permissoes: decoded.permissoes || {}
    };
  } catch {
    return null;
  }
}
