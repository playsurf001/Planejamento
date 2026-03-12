// Middleware de Autorização - RBAC System
// Suporta 3 roles: admin, supervisor, user

import { Context } from 'hono';
import { verifyToken, User } from './auth';

// Tipos de ação para auditoria
export type ActionType = 
  | 'CREATE' | 'UPDATE' | 'DELETE' 
  | 'APPROVE' | 'REJECT' 
  | 'VIEW' | 'EXPORT';

// Função para verificar autenticação
export function requireAuth(c: Context): User | null {
  const authHeader = c.req.header('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  const token = authHeader.substring(7);
  return verifyToken(token);
}

// Middleware: Requer Admin
export function requireAdmin(user: User | null): boolean {
  return user?.role === 'admin';
}

// Middleware: Requer Admin ou Supervisor
export function requireAdminOrSupervisor(user: User | null): boolean {
  return user?.role === 'admin' || user?.role === 'supervisor';
}

// Middleware: Verifica se o usuário pode acessar o setor
export function canAccessSector(user: User | null, targetSectorId: number | null): boolean {
  if (!user) return false;
  
  // Admin vê tudo
  if (user.role === 'admin') return true;
  
  // Supervisor com sector_id NULL vê tudo (supervisor geral)
  if (user.role === 'supervisor' && user.sector_id === null) return true;
  
  // Supervisor setorial vê apenas seu setor
  if (user.role === 'supervisor' && user.sector_id) {
    return user.sector_id === targetSectorId;
  }
  
  // User comum vê apenas seus próprios dados
  return false;
}

// Middleware: Verifica se pode editar
export function canEdit(user: User | null, resourceOwnerId: number): boolean {
  if (!user) return false;
  
  // Admin pode editar tudo
  if (user.role === 'admin') return true;
  
  // Supervisor pode editar registros do seu setor
  if (user.role === 'supervisor') return true;
  
  // User pode editar apenas seus próprios registros
  return user.id === resourceOwnerId;
}

// Middleware: Verifica se pode aprovar
export function canApprove(user: User | null): boolean {
  if (!user) return false;
  
  // Apenas Admin e Supervisor podem aprovar
  return user.role === 'admin' || user.role === 'supervisor';
}

// Middleware: Verifica se pode gerenciar usuários
export function canManageUsers(user: User | null): boolean {
  if (!user) return false;
  
  // Apenas Admin pode gerenciar usuários
  return user.role === 'admin';
}

// Middleware: Verifica se pode acessar configurações
export function canAccessSettings(user: User | null): boolean {
  if (!user) return false;
  
  // Apenas Admin pode acessar configurações
  return user.role === 'admin';
}

// Função para registrar ação no audit log
export async function logAction(
  DB: D1Database,
  user: User,
  action: ActionType,
  entity: string,
  entityId: number,
  oldValue: any,
  newValue: any,
  reason: string,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  try {
    await DB.prepare(`
      INSERT INTO audit_logs (
        actor_user_id, actor_nome, actor_role,
        action_type, entity, entity_id,
        old_value, new_value, reason,
        ip_address, user_agent
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      user.id,
      user.nome,
      user.role,
      action,
      entity,
      entityId,
      JSON.stringify(oldValue),
      JSON.stringify(newValue),
      reason,
      ipAddress || null,
      userAgent || null
    ).run();
  } catch (error) {
    console.error('Erro ao registrar audit log:', error);
    // Não falhar a operação principal se o log falhar
  }
}

// Helper: Resposta de erro de autorização
export function unauthorizedResponse(c: Context, message: string = 'Não autorizado') {
  return c.json({ success: false, message }, 401);
}

export function forbiddenResponse(c: Context, message: string = 'Acesso negado') {
  return c.json({ success: false, message }, 403);
}
