-- ============================================================
-- GESTÃO DE OBRAS - Schema Principal
-- ============================================================

-- ============================================================
-- 1. PROJETOS (TAP - Termo de Abertura de Projeto)
-- ============================================================
CREATE TABLE IF NOT EXISTS projects (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  justification TEXT,
  budget        TEXT,
  manager       TEXT,
  sponsor       TEXT,
  start_date    TEXT,
  area          TEXT,
  project_type  TEXT,
  cno           TEXT,
  location      TEXT,
  status        TEXT NOT NULL DEFAULT 'Em andamento',
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Objetivos do projeto (1:N)
CREATE TABLE IF NOT EXISTS project_objectives (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  text       TEXT NOT NULL,
  sort_order INT DEFAULT 0
);

-- Requisitos do projeto (1:N)
CREATE TABLE IF NOT EXISTS project_requirements (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  text       TEXT NOT NULL,
  sort_order INT DEFAULT 0
);

-- Riscos resumidos do TAP (1:N)
CREATE TABLE IF NOT EXISTS project_tap_risks (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  text       TEXT NOT NULL,
  sort_order INT DEFAULT 0
);

-- Stakeholders (1:N)
CREATE TABLE IF NOT EXISTS project_stakeholders (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name       TEXT NOT NULL
);

-- Marcos / Milestones (1:N)
CREATE TABLE IF NOT EXISTS project_milestones (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  date        TEXT NOT NULL,
  description TEXT NOT NULL,
  sort_order  INT DEFAULT 0
);

-- ============================================================
-- 2. CRONOGRAMA / PROGRESSO
-- ============================================================
CREATE TABLE IF NOT EXISTS schedule_items (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id   UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  progress     INT NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  color        TEXT DEFAULT 'bg-blue-500',
  is_milestone BOOLEAN DEFAULT FALSE,
  sort_order   INT DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Tarefas do item de cronograma (1:N)
CREATE TABLE IF NOT EXISTS schedule_tasks (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_item_id UUID NOT NULL REFERENCES schedule_items(id) ON DELETE CASCADE,
  text             TEXT NOT NULL,
  completed        BOOLEAN DEFAULT FALSE
);

-- ============================================================
-- 3. RDO - Relatório Diário de Obra
-- ============================================================
CREATE TABLE IF NOT EXISTS rdos (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  date        DATE NOT NULL,
  description TEXT NOT NULL,
  weather     TEXT,
  workers     INT DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 4. EQUIPE E MÃO DE OBRA
-- ============================================================
CREATE TABLE IF NOT EXISTS team_members (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  role       TEXT,
  company    TEXT,
  status     TEXT DEFAULT 'Ativo',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 5. MATERIAIS
-- ============================================================
CREATE TABLE IF NOT EXISTS materials (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  required   TEXT,
  received   TEXT,
  unit       TEXT,
  vendor     TEXT,
  status     TEXT DEFAULT 'Pendente',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 6. FINANCEIRO
-- ============================================================
CREATE TABLE IF NOT EXISTS financial_entries (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  company    TEXT NOT NULL,
  service    TEXT,
  value      TEXT,
  payment_form TEXT,
  deadline   TEXT,
  status     TEXT DEFAULT 'Pendente',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 7. CONTRATOS
-- ============================================================
CREATE TABLE IF NOT EXISTS contracts (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  company     TEXT NOT NULL,
  scope       TEXT,
  contract_number TEXT,
  value       TEXT,
  deadline    TEXT,
  warranty    TEXT,
  status      TEXT DEFAULT 'Em vigor',
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 8. EMPRESAS / FORNECEDORES
-- ============================================================
CREATE TABLE IF NOT EXISTS companies (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  cnpj       TEXT,
  contact    TEXT,
  email      TEXT,
  phone      TEXT,
  type       TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 9. DOCUMENTAÇÃO LEGAL
-- ============================================================
CREATE TABLE IF NOT EXISTS legal_documents (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  document    TEXT NOT NULL,
  organization TEXT,
  requested_date TEXT,
  sent_date   TEXT,
  approved_date TEXT,
  status      TEXT DEFAULT 'Pendente',
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Projetos Técnicos (Documentação)
CREATE TABLE IF NOT EXISTS technical_projects (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  responsible TEXT,
  version     TEXT,
  date        TEXT,
  observations TEXT,
  status      TEXT DEFAULT 'Pendente',
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 10. RISCOS
-- ============================================================
CREATE TABLE IF NOT EXISTS risks (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  level       TEXT NOT NULL CHECK (level IN ('ALTO', 'MEDIO', 'BAIXO')),
  title       TEXT NOT NULL,
  description TEXT,
  color       TEXT DEFAULT 'bg-red-500/10',
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 11. QUALIDADE - Não Conformidades
-- ============================================================
CREATE TABLE IF NOT EXISTS non_conformities (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  item        TEXT NOT NULL,
  description TEXT,
  responsible TEXT,
  deadline    TEXT,
  status      TEXT DEFAULT 'Aberto',
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 12. ALERTAS DO DASHBOARD
-- ============================================================
CREATE TABLE IF NOT EXISTS alerts (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  text       TEXT NOT NULL,
  type       TEXT NOT NULL CHECK (type IN ('error', 'warning', 'info')),
  resolved   BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ÍNDICES PARA PERFORMANCE
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_schedule_items_project   ON schedule_items(project_id);
CREATE INDEX IF NOT EXISTS idx_rdos_project             ON rdos(project_id);
CREATE INDEX IF NOT EXISTS idx_rdos_date                ON rdos(date);
CREATE INDEX IF NOT EXISTS idx_team_members_project     ON team_members(project_id);
CREATE INDEX IF NOT EXISTS idx_materials_project        ON materials(project_id);
CREATE INDEX IF NOT EXISTS idx_financial_entries_project ON financial_entries(project_id);
CREATE INDEX IF NOT EXISTS idx_contracts_project        ON contracts(project_id);
CREATE INDEX IF NOT EXISTS idx_legal_documents_project  ON legal_documents(project_id);
CREATE INDEX IF NOT EXISTS idx_technical_projects_project ON technical_projects(project_id);
CREATE INDEX IF NOT EXISTS idx_risks_project            ON risks(project_id);
CREATE INDEX IF NOT EXISTS idx_non_conformities_project ON non_conformities(project_id);
CREATE INDEX IF NOT EXISTS idx_alerts_project           ON alerts(project_id);
