-- Adiciona campos de contrato para exibição na tabela de Prestadores e Contratos
ALTER TABLE contracts
  ADD COLUMN IF NOT EXISTS signed        BOOLEAN DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS installments  INT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS payment_terms TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS duration_days INT DEFAULT NULL;
