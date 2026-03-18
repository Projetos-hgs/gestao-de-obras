/**
 * Tipos compartilhados do sistema de Gestão de Obras
 */

export type View =
  | 'dashboard'
  | 'tap'
  | 'cronograma'
  | 'rdo'
  | 'equipe'
  | 'materiais'
  | 'financeiro'
  | 'contratos'
  | 'documentacao'
  | 'riscos'
  | 'qualidade'
  | 'empresas';

export interface NavItem {
  id: View;
  label: string;
  icon: any;
  category: string;
  path: string;
}

export interface Project {
  id: string;
  name: string;
  justification?: string;
  budget?: string;
  manager?: string;
  sponsor?: string;
  start_date?: string;
  area?: string;
  project_type?: string;
  cno?: string;
  location?: string;
  status: string;
  objectives?: { id: string; text: string }[];
  requirements?: { id: string; text: string }[];
  tap_risks?: { id: string; text: string }[];
  stakeholders?: { id: string; name: string }[];
  milestones?: { id: string; date: string; description: string }[];
}

export interface ScheduleItem {
  id: string;
  project_id: string;
  name: string;
  progress: number;
  color: string;
  is_milestone: boolean;
  sort_order: number;
  tasks?: { id: string; text: string; completed: boolean }[];
}

export interface RDO {
  id: string;
  project_id: string;
  date: string;
  description: string;
  weather: string;
  workers: number;
}

export interface TeamMember {
  id: string;
  project_id: string;
  name: string;
  role: string;
  company: string;
  status: string;
}

export interface Material {
  id: string;
  project_id: string;
  name: string;
  required: string;
  received: string;
  unit: string;
  vendor: string;
  status: string;
}

export interface FinancialEntry {
  id: string;
  project_id: string;
  company: string;
  service: string;
  value: string;
  payment_form: string;
  deadline: string;
  status: string;
}

export interface Contract {
  id: string;
  project_id: string;
  company: string;
  scope: string;
  contract_number: string;
  value: string;
  deadline: string;
  warranty: string;
  status: string;
}

export interface Company {
  id: string;
  name: string;
  cnpj: string;
  contact: string;
  email: string;
  phone: string;
  type: string;
}

export interface LegalDocument {
  id: string;
  project_id: string;
  document: string;
  organization: string;
  requested_date: string;
  sent_date: string;
  approved_date: string;
  status: string;
}

export interface TechnicalProject {
  id: string;
  project_id: string;
  name: string;
  responsible: string;
  version: string;
  date: string;
  observations: string;
  status: string;
}

export interface Risk {
  id: string;
  project_id: string;
  level: 'ALTO' | 'MEDIO' | 'BAIXO';
  title: string;
  description: string;
  color: string;
}

export interface NonConformity {
  id: string;
  project_id: string;
  item: string;
  description: string;
  responsible: string;
  deadline: string;
  status: string;
}

export interface Alert {
  id: string;
  project_id?: string;
  text: string;
  type: 'error' | 'warning' | 'info';
  resolved: boolean;
}
