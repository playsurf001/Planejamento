-- Migration 0016: Product Units - Individual Unit Confirmation
-- Date: 2026-02-04
-- Description: Add table to track individual units of planned products

-- Create product_units table to store individual units
CREATE TABLE IF NOT EXISTS product_units (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  planejamento_semanal_id INTEGER NOT NULL,
  unit_number INTEGER NOT NULL,
  status TEXT DEFAULT 'pendente' CHECK(status IN ('pendente', 'confirmado', 'cancelado')),
  lancamento_id INTEGER,
  confirmed_at DATETIME,
  confirmed_by INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (planejamento_semanal_id) REFERENCES planejamentos_semanais(id),
  FOREIGN KEY (lancamento_id) REFERENCES lancamentos(id),
  FOREIGN KEY (confirmed_by) REFERENCES designers(id),
  UNIQUE(planejamento_semanal_id, unit_number)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_product_units_planejamento ON product_units(planejamento_semanal_id);
CREATE INDEX IF NOT EXISTS idx_product_units_status ON product_units(status);
CREATE INDEX IF NOT EXISTS idx_product_units_lancamento ON product_units(lancamento_id);

-- Trigger to automatically create units when a planejamento_semanal is created
-- This will be handled in the application code for better control
