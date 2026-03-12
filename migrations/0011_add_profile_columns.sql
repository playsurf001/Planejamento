-- Migration 0011: Add user profile columns (simpler approach)
-- Date: 2026-02-02
-- Description: Add email, foto_perfil, nome_exibicao, configuracoes columns

-- Add email column if it doesn't exist
ALTER TABLE designers ADD COLUMN email TEXT;

-- Add foto_perfil column if it doesn't exist
ALTER TABLE designers ADD COLUMN foto_perfil TEXT;

-- Add nome_exibicao column if it doesn't exist
ALTER TABLE designers ADD COLUMN nome_exibicao TEXT;

-- Add configuracoes column if it doesn't exist
ALTER TABLE designers ADD COLUMN configuracoes TEXT DEFAULT '{}';

-- Create index on email
CREATE INDEX IF NOT EXISTS idx_designers_email ON designers(email);
