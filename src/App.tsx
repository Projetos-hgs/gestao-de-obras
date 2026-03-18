/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  FileText, 
  Users, 
  HardHat, 
  Building2,
  TrendingUp,
  DollarSign,
  FileCheck,
  ClipboardList,
  ChevronRight,
  ChevronDown,
  MoreHorizontal,
  Plus,
  Trash2,
  Edit3,
  ArrowRight,
  ShieldAlert,
  Award,
  History,
  Package,
  Wallet,
  FileSignature,
  Search,
  Menu,
  X,
  LayoutGrid
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Types ---

type View = 
  | 'dashboard' 
  | 'tap'
  | 'progresso' 
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

interface NavItem {
  id: View;
  label: string;
  icon: any;
  category?: string;
}

interface Company {
  name: string;
  cnpj: string;
  contact: string;
  email: string;
  phone: string;
  type: string;
}

interface ProgressItem {
  name: string;
  progress: number;
  color: string;
  isMilestone?: boolean;
  tasks?: { text: string; completed: boolean }[];
  projectName?: string;
}

interface Alert {
  text: string;
  type: 'error' | 'warning' | 'info';
  icon: any;
  projectName?: string;
}

interface TeamMember {
  name: string;
  role: string;
  company: string;
  status: string;
  projectName?: string;
}

interface Material {
  name: string;
  req: string;
  rec: string;
  unit: string;
  vendor: string;
  status: string;
  projectName?: string;
}

interface FinancialEntry {
  company: string;
  service: string;
  value: string;
  form: string;
  deadline: string;
  status: string;
  projectName?: string;
}

interface Contract {
  company: string;
  scope: string;
  contract: string;
  value: string;
  deadline: string;
  warranty: string;
  projectName?: string;
}

interface LegalDocument {
  doc: string;
  org: string;
  req: string;
  sent: string;
  app: string;
  status: string;
  projectName?: string;
}

interface TechnicalProject {
  proj: string;
  resp: string;
  ver: string;
  date: string;
  obs: string;
  status: string;
  projectName?: string;
}

interface Risk {
  level: 'ALTO' | 'MEDIO' | 'BAIXO';
  title: string;
  desc: string;
  color: string;
  projectName?: string;
}

interface RDO {
  date: string;
  description: string;
  weather: string;
  workers: number;
  projectName?: string;
}

interface NonConformity {
  item: string;
  description: string;
  responsible: string;
  deadline: string;
  status: string;
  projectName?: string;
}

interface TAPData {
  projectName: string;
  justification: string;
  objectives: string[];
  requirements: string[];
  risks: string[];
  milestones: { date: string; description: string }[];
  budget: string;
  manager: string;
  sponsor: string;
  stakeholders: string[];
  startDate?: string;
  area?: string;
  projectType?: string;
}

// --- Constants & Data ---

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, category: 'VISÃO GERAL' },
  { id: 'tap', label: 'TAP', icon: FileCheck, category: 'VISÃO GERAL' },
  { id: 'cronograma', label: 'Cronograma', icon: Clock, category: 'VISÃO GERAL' },
  
  { id: 'rdo', label: 'RDO', icon: History, category: 'EXECUÇÃO' },
  { id: 'equipe', label: 'Equipe e MO', icon: Users, category: 'EXECUÇÃO' },
  { id: 'materiais', label: 'Materiais', icon: Package, category: 'EXECUÇÃO' },
  
  { id: 'financeiro', label: 'Financeiro', icon: Wallet, category: 'GESTÃO' },
  { id: 'contratos', label: 'Contratos', icon: FileSignature, category: 'GESTÃO' },
  { id: 'empresas', label: 'Empresas', icon: Building2, category: 'GESTÃO' },
  { id: 'documentacao', label: 'Documentação', icon: FileText, category: 'GESTÃO' },
  
  { id: 'riscos', label: 'Riscos', icon: ShieldAlert, category: 'CONTROLE' },
  { id: 'qualidade', label: 'Qualidade', icon: Award, category: 'CONTROLE' },
];

const PROGRESS_DATA = [
  { name: 'Limpeza superficial do terreno', progress: 100, color: 'bg-emerald-500' },
  { name: 'Tapume', progress: 100, color: 'bg-emerald-500' },
  { name: 'Canteiro de obra', progress: 90, color: 'bg-amber-500' },
  { name: 'Inst. hidráulicas do canteiro', progress: 70, color: 'bg-amber-500' },
  { name: 'Serviços preliminares', progress: 70, color: 'bg-amber-500' },
  { name: 'Terraplanagem', progress: 60, color: 'bg-amber-500' },
  { name: 'Padrão Celpe', progress: 20, color: 'bg-blue-500' },
  { name: 'Fundação', progress: 15, color: 'bg-blue-500' },
];

const ALL_PROJECTS_TAP: TAPData = {
  projectName: "Todos os Projetos",
  justification: "Visão consolidada de todos os projetos em andamento.",
  objectives: [],
  requirements: [],
  risks: [],
  milestones: [],
  stakeholders: [],
  manager: "Vários",
  sponsor: "Vários",
  budget: "Consolidado",
  startDate: "",
  area: "Várias",
  projectType: "Múltiplos"
};

const INITIAL_TAP_DATA: TAPData = {
  projectName: "Galeria Comercial Triângulo",
  justification: "Atender à demanda crescente por espaços comerciais na região de Boa Vista, aproveitando a localização estratégica da Av. Belém do São Francisco.",
  objectives: [
    "Concluir a obra em 12 meses",
    "Manter o custo dentro do orçamento de R$ 4.5M",
    "Alcançar 100% de conformidade com normas técnicas e de segurança"
  ],
  requirements: [
    "Área construída total de 1.200m²",
    "15 lojas comerciais modulares",
    "Estacionamento para 20 veículos",
    "Acessibilidade completa (NBR 9050)"
  ],
  risks: [
    "Atrasos por condições climáticas (período de chuvas)",
    "Oscilação de preços de materiais (aço e cimento)",
    "Escassez de mão de obra qualificada na região"
  ],
  milestones: [
    { date: "15/03/2026", description: "Início das Obras / Mobilização" },
    { date: "15/05/2026", description: "Conclusão das Fundações" },
    { date: "15/09/2026", description: "Conclusão da Estrutura" },
    { date: "15/12/2026", description: "Fechamentos e Cobertura" },
    { date: "15/03/2027", description: "Entrega Final / Habite-se" }
  ],
  budget: "R$ 4.500.000,00",
  manager: "Eng. Ricardo Silva",
  sponsor: "VP Construtora e Incorporadora",
  stakeholders: [
    "Investidores",
    "Prefeitura Municipal",
    "Comunidade Local",
    "Futuros Lojistas"
  ],
  startDate: "15/03/2026",
  area: "1.200 m²",
  projectType: "Galeria Comercial"
};

const ALERTS = [
  { text: 'Alvará da Prefeitura não solicitado — risco de embargo', type: 'error', icon: AlertTriangle },
  { text: 'Projeto de combate a incêndio: aguardando pagamento do boleto (Coronel Alberto)', type: 'error', icon: AlertTriangle },
  { text: 'Ligação de energia (Celpe): não iniciada', type: 'warning', icon: AlertTriangle },
  { text: 'Compesa: cartas de viabilidade enviadas em 02/03 — aguardando retorno', type: 'info', icon: ClipboardList },
  { text: 'EVA/PGRCC/RIT (Arque Engenharia): aguardando envio do projeto', type: 'warning', icon: AlertTriangle },
  { text: 'Macrodrenagem e locação (Catec): projeto ainda não entregue', type: 'warning', icon: AlertTriangle },
];

// --- Components ---

const Sidebar = ({ activeView, onViewChange }: { activeView: View, onViewChange: (v: View) => void }) => {
  const categories = Array.from(new Set(NAV_ITEMS.map(i => i.category)));

  return (
    <aside className="w-64 bg-[#0F1115] border-r border-white/5 flex flex-col h-screen fixed left-0 top-0 z-50">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
            <TrendingUp size={20} className="text-black" />
          </div>
          <h1 className="font-bold text-white text-lg tracking-tight">Gestor de Obras</h1>
        </div>
        <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider">Galeria Comercial • VP Construtora</p>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 space-y-6 pb-6">
        {categories.map(cat => (
          <div key={cat} className="space-y-1">
            <h3 className="px-3 text-[10px] font-bold text-zinc-600 uppercase tracking-[0.15em] mb-2">{cat}</h3>
            {NAV_ITEMS.filter(i => i.category === cat).map(item => (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 group ${
                  activeView === item.id 
                    ? 'bg-blue-600/10 text-blue-400' 
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
                }`}
              >
                <item.icon size={16} className={activeView === item.id ? 'text-blue-400' : 'text-zinc-500 group-hover:text-zinc-300'} />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            ))}
          </div>
        ))}
      </nav>
    </aside>
  );
};

const Header = () => (
  <header className="h-20 border-b border-white/5 bg-[#16181D] px-8 flex items-center justify-between sticky top-0 z-40">
    <div className="flex items-center gap-6">
      <div className="px-4 py-2 bg-blue-600/10 border border-blue-500/20 rounded-lg">
        <p className="text-[10px] font-bold text-blue-400 uppercase tracking-wider mb-0.5">CNO</p>
        <p className="text-xs font-bold text-blue-200">90.027.49566/77</p>
      </div>
      <div className="hidden md:block">
        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-0.5">Localização</p>
        <p className="text-xs font-medium text-zinc-300">Av. Belém do São Francisco • Boa Vista</p>
      </div>
    </div>

    <div className="flex items-center gap-6">
      <div className="flex items-center gap-3 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-lg">
        <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
        <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">Em andamento</span>
      </div>
      <div className="text-right">
        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-0.5">Sáb., 14 de</p>
        <p className="text-xs font-medium text-zinc-300">mar. de 2026</p>
      </div>
      <button className="p-2 text-zinc-500 hover:text-zinc-300 transition-colors">
        <MoreHorizontal size={20} />
      </button>
    </div>
  </header>
);

const ProjectSelector = ({ 
  selectedTap, 
  taps, 
  onSelectTap 
}: { 
  selectedTap: TAPData, 
  taps: TAPData[], 
  onSelectTap: (tap: TAPData) => void 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const isAllProjects = selectedTap.projectName === "Todos os Projetos";

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold text-white transition-all group"
      >
        <LayoutGrid size={16} className="text-zinc-400 group-hover:text-blue-400 transition-colors" />
        Trocar Projeto
        <ChevronDown size={14} className={`text-zinc-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)} 
            />
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 mt-2 w-72 bg-[#1C1F26] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden"
            >
              <div className="p-2 max-h-80 overflow-y-auto custom-scrollbar">
                <button
                  onClick={() => {
                    onSelectTap(ALL_PROJECTS_TAP);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all ${
                    isAllProjects 
                      ? 'bg-blue-500/10 border border-blue-500/20' 
                      : 'hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    isAllProjects ? 'bg-blue-500 text-white' : 'bg-white/5 text-zinc-500'
                  }`}>
                    <LayoutGrid size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-bold truncate ${isAllProjects ? 'text-white' : 'text-zinc-400'}`}>
                      Todos os Projetos
                    </p>
                    <p className="text-[10px] text-zinc-500 truncate">Visão consolidada do portfólio</p>
                  </div>
                </button>
                {taps.map((tap) => (
                  <button
                    key={tap.projectName}
                    onClick={() => {
                      onSelectTap(tap);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all ${
                      selectedTap.projectName === tap.projectName 
                        ? 'bg-blue-500/10 border border-blue-500/20' 
                        : 'hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      selectedTap.projectName === tap.projectName ? 'bg-blue-500 text-white' : 'bg-white/5 text-zinc-500'
                    }`}>
                      <LayoutGrid size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-bold truncate ${selectedTap.projectName === tap.projectName ? 'text-white' : 'text-zinc-400'}`}>
                        {tap.projectName}
                      </p>
                      <p className="text-[10px] text-zinc-500 truncate">{tap.projectType} • {tap.area}</p>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

const ViewHeader = ({ 
  title, 
  description, 
  selectedTap, 
  taps, 
  onSelectTap,
  action
}: { 
  title: string, 
  description?: string, 
  selectedTap: TAPData, 
  taps: TAPData[], 
  onSelectTap: (tap: TAPData) => void,
  action?: React.ReactNode
}) => {
  const isAllProjects = selectedTap.projectName === "Todos os Projetos";
  
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#1C1F26] p-6 rounded-2xl border border-white/5 shadow-xl">
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-white tracking-tight">{title}</h2>
          <span className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded text-[10px] font-bold text-blue-400 uppercase tracking-widest">
            {selectedTap.projectName}
          </span>
        </div>
        <p className="text-xs text-zinc-500 font-medium tracking-wide">
          {description || (isAllProjects ? `Visão consolidada de ${title.toLowerCase()} de todos os projetos` : `${title}: ${selectedTap.projectName}`)}
        </p>
      </div>
      
      <div className="flex items-center gap-3">
        <ProjectSelector selectedTap={selectedTap} taps={taps} onSelectTap={onSelectTap} />
        {action}
      </div>
    </div>
  );
};

const MetricCard = ({ label, value, subtext, color = "blue" }: { label: string, value: string, subtext: string, color?: string }) => (
  <div className="bg-[#1C1F26] border border-white/5 rounded-xl p-5 space-y-3">
    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{label}</p>
    <div className="space-y-1">
      <h4 className="text-2xl font-bold text-white tracking-tight">{value}</h4>
      <p className="text-[10px] text-zinc-400 font-medium">{subtext}</p>
    </div>
  </div>
);

const DashboardView = ({ onViewChange, progressData, alerts, companies, onAddTap, selectedTap, taps, onSelectTap, legalDocs }: { 
  onViewChange: (v: View) => void, 
  progressData: ProgressItem[], 
  alerts: Alert[], 
  companies: Company[],
  onAddTap: () => void,
  selectedTap: TAPData,
  taps: TAPData[],
  onSelectTap: (tap: TAPData) => void,
  legalDocs: LegalDocument[]
}) => {
  const isAllProjects = selectedTap.projectName === "Todos os Projetos";
  
  const selectedProjectProgress = progressData.find(p => p.name === selectedTap.projectName);
  
  // Calcular progresso médio se for "Todos os Projetos"
  const calculateOverallProgress = () => {
    if (!isAllProjects) {
      return selectedProjectProgress ? `${selectedProjectProgress.progress}%` : "0%";
    }
    
    const projectMilestones = progressData.filter(p => p.isMilestone && p.projectName);
    if (projectMilestones.length === 0) return "0%";
    
    const totalProgress = projectMilestones.reduce((acc, curr) => acc + curr.progress, 0);
    return `${Math.round(totalProgress / projectMilestones.length)}%`;
  };

  const overallProgress = calculateOverallProgress();
  const pendingDocsCount = legalDocs.filter(d => d.status !== 'Aprovado' && d.status !== 'Concluído').length;

  // Calcular dias de obra
  const calculateDaysOfWork = () => {
    if (isAllProjects) return "—";
    if (!selectedTap.startDate) return 0;
    try {
      const [day, month, year] = selectedTap.startDate.split('/').map(Number);
      const startDate = new Date(year, month - 1, day);
      const today = new Date();
      const diffTime = Math.abs(today.getTime() - startDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    } catch (e) {
      return 0;
    }
  };
  const daysOfWork = calculateDaysOfWork();

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-white tracking-tight">{selectedTap.projectName}</h2>
            <div className="relative group">
              <button className="p-1.5 bg-white/5 border border-white/10 rounded-md hover:bg-white/10 transition-all flex items-center gap-2 text-zinc-400 hover:text-white">
                <ChevronDown size={14} />
                <span className="text-[10px] font-bold uppercase tracking-wider">Trocar Projeto</span>
              </button>
              <div className="absolute top-full left-0 mt-2 w-64 bg-[#1C1F26] border border-white/10 rounded-xl shadow-2xl hidden group-hover:block z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-4 py-2 border-b border-white/5 bg-white/5">
                  <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Selecione o Projeto</span>
                </div>
                <div className="max-h-64 overflow-y-auto custom-scrollbar">
                  <button 
                    onClick={() => onSelectTap(ALL_PROJECTS_TAP)}
                    className={`w-full text-left px-4 py-3 text-xs font-medium transition-colors border-b border-white/5 flex items-center justify-between ${
                      isAllProjects 
                        ? 'bg-blue-600/20 text-blue-400' 
                        : 'text-zinc-400 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <span className="truncate pr-2">Todos os Projetos</span>
                    {isAllProjects && <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />}
                  </button>
                  {taps.map((tap, idx) => (
                    <button 
                      key={idx}
                      onClick={() => onSelectTap(tap)}
                      className={`w-full text-left px-4 py-3 text-xs font-medium transition-colors border-b border-white/5 last:border-0 flex items-center justify-between ${
                        selectedTap.projectName === tap.projectName 
                          ? 'bg-blue-600/20 text-blue-400' 
                          : 'text-zinc-400 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <span className="truncate pr-2">{tap.projectName}</span>
                      {selectedTap.projectName === tap.projectName && <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <p className="text-xs text-zinc-500 font-medium">
            {isAllProjects ? "Visão consolidada do portfólio" : `Início: ${selectedTap.startDate || 'A definir'} • Área: ${selectedTap.area || 'A definir'} • ${selectedTap.projectType || 'A definir'}`}
          </p>
        </div>
        <button 
          onClick={onAddTap}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-xs font-bold text-white transition-all shadow-lg shadow-emerald-600/20"
        >
          <Plus size={14} />
          Novo TAP
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <MetricCard label="PROGRESSO MÉDIO" value={overallProgress} subtext={isAllProjects ? "Média de todos os projetos" : (selectedProjectProgress?.progress === 100 ? "Concluído" : "Em andamento")} />
        <MetricCard label="ORÇAMENTO" value={selectedTap.budget} subtext={isAllProjects ? "Consolidado" : "valor total do TAP"} />
        <MetricCard label="DOCUMENTOS PENDENTES" value={pendingDocsCount.toString()} subtext="licenças em aberto" />
        <MetricCard label="EMPRESAS PARCEIRAS" value={companies.length.toString()} subtext="cadastradas no sistema" />
        <MetricCard label="DIAS DE OBRA" value={daysOfWork.toString()} subtext={isAllProjects ? "Consolidado" : `Início: ${selectedTap.startDate}`} />
        <MetricCard label="GERENTE" value={isAllProjects ? "Vários" : (selectedTap.manager.split(' ').pop() || '')} subtext={selectedTap.manager} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-[#1C1F26] border border-white/5 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
            <h3 className="font-bold text-white text-sm">Evolução de Marcos</h3>
            <button 
              onClick={() => onViewChange('cronograma')}
              className="text-[10px] font-bold text-zinc-400 hover:text-white transition-colors flex items-center gap-1.5 px-3 py-1.5 border border-white/10 rounded-md"
            >
              Cronograma <ArrowRight size={12} />
            </button>
          </div>
          <div className="p-6 space-y-5">
            {selectedProjectProgress ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">{selectedProjectProgress.name}</span>
                  <span className="text-xs font-bold text-blue-400">{selectedProjectProgress.progress}%</span>
                </div>
                <div className="bg-white/5 h-2 rounded-full overflow-hidden">
                  <div className={`h-full ${selectedProjectProgress.color}`} style={{ width: `${selectedProjectProgress.progress}%` }} />
                </div>
                <div className="space-y-3 pt-2">
                  <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Tarefas / Marcos Detalhados</h4>
                  {selectedProjectProgress.tasks?.map((task, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/5">
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${task.completed ? 'bg-emerald-500 border-emerald-500' : 'border-white/20'}`}>
                        {task.completed && <CheckCircle2 size={10} className="text-white" />}
                      </div>
                      <span className={`text-[11px] ${task.completed ? 'text-zinc-500 line-through' : 'text-zinc-300'}`}>{task.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="py-12 text-center space-y-3">
                <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto">
                  <Clock size={20} className="text-zinc-600" />
                </div>
                <p className="text-xs text-zinc-500">Nenhum dado de evolução encontrado para este projeto.</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-[#1C1F26] border border-white/5 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white/5 flex items-center gap-2">
              <AlertTriangle size={16} className="text-zinc-400" />
              <h3 className="font-bold text-white text-sm">Alertas e Pendências</h3>
            </div>
            <div className="p-4 space-y-3">
              {alerts.slice(0, 4).map((alert, idx) => (
                <div key={idx} className={`p-3 rounded-lg border flex items-start gap-3 ${
                  alert.type === 'error' ? 'bg-red-500/5 border-red-500/20 text-red-400' :
                  alert.type === 'warning' ? 'bg-amber-500/5 border-amber-500/20 text-amber-400' :
                  'bg-blue-500/5 border-blue-500/20 text-blue-400'
                }`}>
                  <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                  <p className="text-[11px] leading-relaxed">{alert.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const TAPView = ({ taps, onAdd, onEdit, selectedTap, onSelectTap }: { 
  taps: TAPData[], 
  onAdd: () => void, 
  onEdit: (tap: TAPData) => void,
  selectedTap: TAPData | null,
  onSelectTap: (tap: TAPData) => void
}) => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-white tracking-tight">Termo de Abertura do Projeto (TAP)</h2>
          <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Project Charter • Autorização Formal da Obra</p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={onAdd}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-xs font-bold text-white transition-all shadow-lg shadow-emerald-600/20"
          >
            <Plus size={14} />
            Incluir Novo TAP
          </button>
        </div>
      </div>

      {/* List of TAPs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {taps.map((tap, index) => (
          <button
            key={index}
            onClick={() => onSelectTap(tap)}
            className={`p-4 rounded-xl border transition-all text-left space-y-2 group ${
              selectedTap === tap 
                ? 'bg-blue-600/10 border-blue-500/50 shadow-lg shadow-blue-500/10' 
                : 'bg-[#1C1F26] border-white/5 hover:border-white/10'
            }`}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white truncate pr-2 group-hover:text-blue-400 transition-colors">{tap.projectName}</h3>
              <div className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded text-[8px] font-bold text-emerald-500 uppercase tracking-wider">
                Aprovado
              </div>
            </div>
            <p className="text-[10px] text-zinc-500 line-clamp-2 leading-relaxed">{tap.justification}</p>
            <div className="flex items-center justify-between pt-2 border-t border-white/5">
              <div className="flex items-center gap-1.5">
                <HardHat size={10} className="text-blue-400" />
                <span className="text-[9px] font-bold text-blue-400 uppercase tracking-wider">{tap.manager}</span>
              </div>
              <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-wider">{tap.budget}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Selected TAP Details */}
      {selectedTap && (
        <div className="pt-8 border-t border-white/5 space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-6 bg-blue-500 rounded-full" />
              <h3 className="text-lg font-bold text-white">Visualizando: {selectedTap.projectName}</h3>
            </div>
            <button 
              onClick={() => onEdit(selectedTap)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600/10 border border-blue-500/20 hover:bg-blue-600/20 rounded-lg text-xs font-bold text-blue-400 transition-all"
            >
              <Edit3 size={14} />
              Editar este TAP
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {/* Identificação e Justificativa */}
              <div className="bg-[#1C1F26] border border-white/5 rounded-xl p-8 space-y-6">
                <div className="space-y-2">
                  <h3 className="text-[10px] font-bold text-blue-400 uppercase tracking-[0.2em]">Nome do Projeto</h3>
                  <p className="text-xl font-bold text-white">{selectedTap.projectName}</p>
                </div>
                <div className="space-y-2">
                  <h3 className="text-[10px] font-bold text-blue-400 uppercase tracking-[0.2em]">Justificativa do Projeto</h3>
                  <p className="text-sm text-zinc-300 leading-relaxed">{selectedTap.justification}</p>
                </div>
              </div>

              {/* Objetivos e Requisitos */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-[#1C1F26] border border-white/5 rounded-xl p-6 space-y-4">
                  <h3 className="text-[10px] font-bold text-emerald-400 uppercase tracking-[0.2em]">Objetivos do Projeto</h3>
                  <ul className="space-y-3">
                    {selectedTap.objectives.map((obj, i) => (
                      <li key={i} className="flex gap-3 text-xs text-zinc-400">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-1.5 shrink-0" />
                        <span>{obj}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-[#1C1F26] border border-white/5 rounded-xl p-6 space-y-4">
                  <h3 className="text-[10px] font-bold text-amber-400 uppercase tracking-[0.2em]">Requisitos de Alto Nível</h3>
                  <ul className="space-y-3">
                    {selectedTap.requirements.map((req, i) => (
                      <li key={i} className="flex gap-3 text-xs text-zinc-400">
                        <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-1.5 shrink-0" />
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Riscos e Stakeholders */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-[#1C1F26] border border-white/5 rounded-xl p-6 space-y-4">
                  <h3 className="text-[10px] font-bold text-red-400 uppercase tracking-[0.2em]">Riscos de Alto Nível</h3>
                  <ul className="space-y-3">
                    {selectedTap.risks.map((risk, i) => (
                      <li key={i} className="flex gap-3 text-xs text-zinc-400">
                        <AlertTriangle size={14} className="text-red-500 shrink-0" />
                        <span>{risk}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-[#1C1F26] border border-white/5 rounded-xl p-6 space-y-4">
                  <h3 className="text-[10px] font-bold text-purple-400 uppercase tracking-[0.2em]">Principais Stakeholders</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedTap.stakeholders.map((sh, i) => (
                      <span key={i} className="px-3 py-1 bg-purple-500/10 border border-purple-500/20 rounded-full text-[10px] font-bold text-purple-400 uppercase tracking-wider">
                        {sh}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              {/* Autoridade e Responsabilidade */}
              <div className="bg-[#1C1F26] border border-white/5 rounded-xl p-6 space-y-6">
                <h3 className="text-[10px] font-bold text-white uppercase tracking-[0.2em]">Governança</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-600/20 rounded-xl flex items-center justify-center">
                      <HardHat size={20} className="text-blue-400" />
                    </div>
                    <div>
                      <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Gerente do Projeto</p>
                      <p className="text-xs font-bold text-white">{selectedTap.manager}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-emerald-600/20 rounded-xl flex items-center justify-center">
                      <Award size={20} className="text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Patrocinador (Sponsor)</p>
                      <p className="text-xs font-bold text-white">{selectedTap.sponsor}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-amber-600/20 rounded-xl flex items-center justify-center">
                      <DollarSign size={20} className="text-amber-400" />
                    </div>
                    <div>
                      <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Orçamento Estimado</p>
                      <p className="text-xs font-bold text-white">{selectedTap.budget}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cronograma de Marcos */}
              <div className="bg-[#1C1F26] border border-white/5 rounded-xl p-6 space-y-6">
                <h3 className="text-[10px] font-bold text-white uppercase tracking-[0.2em]">Cronograma de Marcos</h3>
                <div className="space-y-6 relative">
                  <div className="absolute left-[7px] top-2 bottom-2 w-px bg-white/5" />
                  {selectedTap.milestones.map((m, i) => (
                    <div key={i} className="relative pl-6">
                      <div className="absolute left-0 top-1.5 w-3.5 h-3.5 bg-[#1C1F26] border-2 border-blue-500 rounded-full z-10" />
                      <p className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">{m.date}</p>
                      <p className="text-xs font-medium text-zinc-300">{m.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const CronogramaView = ({ 
  progressData, 
  onAdd, 
  onDetail, 
  onToggleTask, 
  onDelete,
  selectedTap,
  taps,
  onSelectTap
}: { 
  progressData: ProgressItem[], 
  onAdd: () => void, 
  onDetail: (item: ProgressItem) => void, 
  onToggleTask: (milestoneName: string, taskIndex: number) => void,
  onDelete: (milestoneName: string) => void,
  selectedTap: TAPData,
  taps: TAPData[],
  onSelectTap: (tap: TAPData) => void
}) => {
  const [isProjectSelectorOpen, setIsProjectSelectorOpen] = useState(false);
  
  const isAllProjects = selectedTap.projectName === "Todos os Projetos";
  
  const milestones = progressData.filter(item => 
    item.isMilestone && (isAllProjects || !item.projectName || item.projectName === selectedTap.projectName)
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#1C1F26] p-6 rounded-2xl border border-white/5 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-white tracking-tight">Cronograma</h2>
            <span className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded text-[10px] font-bold text-blue-400 uppercase tracking-widest">
              {selectedTap.projectName}
            </span>
          </div>
          <p className="text-xs text-zinc-500 font-medium tracking-wide">
            {isAllProjects ? "Visão consolidada de todos os projetos" : `Acompanhamento detalhado: ${selectedTap.projectName}`}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <button 
              onClick={() => setIsProjectSelectorOpen(!isProjectSelectorOpen)}
              className="flex items-center gap-3 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold text-white transition-all group"
            >
              <LayoutGrid size={16} className="text-zinc-400 group-hover:text-blue-400 transition-colors" />
              Trocar Projeto
              <ChevronDown size={14} className={`text-zinc-500 transition-transform duration-300 ${isProjectSelectorOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {isProjectSelectorOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setIsProjectSelectorOpen(false)} 
                  />
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-72 bg-[#1C1F26] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden"
                  >
                    <div className="p-2 max-h-80 overflow-y-auto custom-scrollbar">
                      <button
                        onClick={() => {
                          onSelectTap(ALL_PROJECTS_TAP);
                          setIsProjectSelectorOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all ${
                          isAllProjects 
                            ? 'bg-blue-500/10 border border-blue-500/20' 
                            : 'hover:bg-white/5 border border-transparent'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          isAllProjects ? 'bg-blue-500 text-white' : 'bg-white/5 text-zinc-500'
                        }`}>
                          <LayoutGrid size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-bold truncate ${isAllProjects ? 'text-white' : 'text-zinc-400'}`}>
                            Todos os Projetos
                          </p>
                          <p className="text-[10px] text-zinc-500 truncate">Visão consolidada do portfólio</p>
                        </div>
                      </button>
                      {taps.map((tap) => (
                        <button
                          key={tap.projectName}
                          onClick={() => {
                            onSelectTap(tap);
                            setIsProjectSelectorOpen(false);
                          }}
                          className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all ${
                            selectedTap.projectName === tap.projectName 
                              ? 'bg-blue-500/10 border border-blue-500/20' 
                              : 'hover:bg-white/5 border border-transparent'
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                            selectedTap.projectName === tap.projectName ? 'bg-blue-500 text-white' : 'bg-white/5 text-zinc-500'
                          }`}>
                            <LayoutGrid size={16} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-xs font-bold truncate ${selectedTap.projectName === tap.projectName ? 'text-white' : 'text-zinc-400'}`}>
                              {tap.projectName}
                            </p>
                            <p className="text-[10px] text-zinc-500 truncate">{tap.projectType} • {tap.area}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          <button 
            onClick={onAdd}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-xs font-bold text-white transition-all shadow-lg shadow-emerald-600/20"
          >
            <Plus size={14} /> Adicionar Etapa
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {milestones.length === 0 ? (
          <div className="bg-[#1C1F26] border border-white/5 rounded-xl p-12 text-center space-y-3">
            <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto text-zinc-600">
              <Calendar size={24} />
            </div>
            <p className="text-xs text-zinc-500 italic">Nenhum marco cadastrado para {isAllProjects ? "os projetos" : `o projeto ${selectedTap.projectName}`}.</p>
          </div>
        ) : (
          milestones.map((item, idx) => (
            <div key={idx} className="bg-[#1C1F26] border border-white/5 rounded-xl p-6 space-y-4 hover:border-white/10 transition-colors group">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${item.color}`} />
                  <h3 className="text-sm font-bold text-white">{item.name}</h3>
                  {item.projectName && (
                    <span className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded text-[9px] font-bold text-blue-400 uppercase tracking-widest">
                      {item.projectName}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => onDetail(item)}
                    className="text-[10px] font-bold text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
                  >
                    <Plus size={10} /> Detalhar
                  </button>
                  <button 
                    onClick={() => onDelete(item.name)}
                    className="text-zinc-500 hover:text-red-400 transition-colors p-1"
                    title="Remover Etapa"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="flex-1 bg-white/5 h-2 rounded-full overflow-hidden relative">
                  <div className={`h-full ${item.color}`} style={{ width: `${item.progress}%` }} />
                </div>
                <span className="text-[11px] font-bold text-zinc-500 w-10 text-right">{item.progress}%</span>
              </div>

              {item.tasks && item.tasks.length > 0 && (
                <div className="pt-4 border-t border-white/5 grid grid-cols-1 md:grid-cols-2 gap-3">
                  {item.tasks.map((task, tIdx) => (
                    <button 
                      key={tIdx} 
                      onClick={() => onToggleTask(item.name, tIdx)}
                      className="flex items-center gap-3 text-[10px] text-left group/task"
                    >
                      <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                        task.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-white/10 text-transparent group-hover/task:border-white/30'
                      }`}>
                        <CheckCircle2 size={10} />
                      </div>
                      <span className={`transition-colors ${task.completed ? 'text-zinc-500 line-through' : 'text-zinc-300'}`}>
                        {task.text}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const EquipeView = ({ 
  team, 
  onAdd, 
  onEdit, 
  onDelete,
  selectedTap,
  taps,
  onSelectTap
}: { 
  team: TeamMember[], 
  onAdd: () => void, 
  onEdit: (member: TeamMember, index: number) => void, 
  onDelete: (index: number) => void,
  selectedTap: TAPData,
  taps: TAPData[],
  onSelectTap: (tap: TAPData) => void
}) => {
  const isAllProjects = selectedTap.projectName === "Todos os Projetos";
  const filteredTeam = team.filter(member => isAllProjects || !member.projectName || member.projectName === selectedTap.projectName);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <ViewHeader 
        title="Equipe e Mão de Obra" 
        selectedTap={selectedTap} 
        taps={taps} 
        onSelectTap={onSelectTap}
        action={
          <button 
            onClick={onAdd}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-xs font-bold text-white transition-all shadow-lg shadow-emerald-600/20"
          >
            <Plus size={14} /> Adicionar
          </button>
        }
      />

      <div className="bg-[#1C1F26] border border-white/5 rounded-xl overflow-hidden shadow-xl">
        <table className="w-full text-left">
          <thead>
            <tr className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest border-b border-white/5 bg-white/[0.02]">
              <th className="px-6 py-4">Nome</th>
              <th className="px-6 py-4">Função</th>
              <th className="px-6 py-4">Empresa</th>
              {isAllProjects && <th className="px-6 py-4">Projeto</th>}
              <th className="px-6 py-4 text-right">Status</th>
              <th className="px-6 py-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredTeam.length === 0 ? (
              <tr>
                <td colSpan={isAllProjects ? 6 : 5} className="px-6 py-12 text-center text-xs text-zinc-500 italic">Nenhum membro da equipe cadastrado.</td>
              </tr>
            ) : (
              filteredTeam.map((person, idx) => (
                <tr key={idx} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-4 text-xs font-bold text-zinc-200">{person.name}</td>
                  <td className="px-6 py-4 text-xs text-zinc-400">{person.role}</td>
                  <td className="px-6 py-4 text-xs text-zinc-400">{person.company}</td>
                  {isAllProjects && (
                    <td className="px-6 py-4 text-xs text-zinc-500">
                      <span className="px-2 py-0.5 bg-white/5 rounded text-[9px] font-bold uppercase tracking-widest">
                        {person.projectName || 'Global'}
                      </span>
                    </td>
                  )}
                  <td className="px-6 py-4 text-right">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                      {person.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => onEdit(person, idx)} className="p-1.5 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-white transition-colors">
                        <Edit3 size={14} />
                      </button>
                      <button onClick={() => onDelete(idx)} className="p-1.5 hover:bg-red-500/20 rounded-lg text-zinc-400 hover:text-red-400 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const MateriaisView = ({ 
  materials, 
  onAdd, 
  onEdit, 
  onDelete,
  selectedTap,
  taps,
  onSelectTap
}: { 
  materials: Material[], 
  onAdd: () => void, 
  onEdit: (material: Material, index: number) => void, 
  onDelete: (index: number) => void,
  selectedTap: TAPData,
  taps: TAPData[],
  onSelectTap: (tap: TAPData) => void
}) => {
  const isAllProjects = selectedTap.projectName === "Todos os Projetos";
  const filteredMaterials = materials.filter(m => isAllProjects || !m.projectName || m.projectName === selectedTap.projectName);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <ViewHeader 
        title="Controle de Materiais" 
        selectedTap={selectedTap} 
        taps={taps} 
        onSelectTap={onSelectTap}
        action={
          <button 
            onClick={onAdd}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-xs font-bold text-white transition-all shadow-lg shadow-emerald-600/20"
          >
            <Plus size={14} /> Requisição
          </button>
        }
      />

      <div className="bg-[#1C1F26] border border-white/5 rounded-xl overflow-hidden shadow-xl">
        <table className="w-full text-left">
          <thead>
            <tr className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest border-b border-white/5 bg-white/[0.02]">
              <th className="px-6 py-4">Material</th>
              <th className="px-6 py-4">Qtd. Solicitada</th>
              <th className="px-6 py-4">Qtd. Recebida</th>
              <th className="px-6 py-4">Unid.</th>
              <th className="px-6 py-4">Fornecedor</th>
              {isAllProjects && <th className="px-6 py-4">Projeto</th>}
              <th className="px-6 py-4 text-right">Status</th>
              <th className="px-6 py-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredMaterials.length === 0 ? (
              <tr>
                <td colSpan={isAllProjects ? 8 : 7} className="px-6 py-12 text-center text-xs text-zinc-500 italic">Nenhuma requisição de material registrada.</td>
              </tr>
            ) : (
              filteredMaterials.map((item, idx) => (
                <tr key={idx} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-4 text-xs font-bold text-zinc-200">{item.name}</td>
                  <td className="px-6 py-4 text-xs text-zinc-500">{item.req}</td>
                  <td className="px-6 py-4 text-xs text-zinc-500">{item.rec}</td>
                  <td className="px-6 py-4 text-xs text-zinc-400">{item.unit}</td>
                  <td className="px-6 py-4 text-xs text-zinc-500">{item.vendor}</td>
                  {isAllProjects && (
                    <td className="px-6 py-4 text-xs text-zinc-500">
                      <span className="px-2 py-0.5 bg-white/5 rounded text-[9px] font-bold uppercase tracking-widest">
                        {item.projectName || 'Global'}
                      </span>
                    </td>
                  )}
                  <td className="px-6 py-4 text-right">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => onEdit(item, idx)} className="p-1.5 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-white transition-colors">
                        <Edit3 size={14} />
                      </button>
                      <button onClick={() => onDelete(idx)} className="p-1.5 hover:bg-red-500/20 rounded-lg text-zinc-400 hover:text-red-400 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const FinanceiroView = ({ 
  financialEntries, 
  onAdd, 
  onEdit, 
  onDelete 
}: { 
  financialEntries: FinancialEntry[], 
  onAdd: () => void,
  onEdit: (item: FinancialEntry, idx: number) => void,
  onDelete: (idx: number) => void
}) => {
  const parseCurrency = (val: string) => {
    if (!val) return 0;
    const clean = val.replace('R$', '').replace(/\./g, '').replace(',', '.').trim();
    const parsed = parseFloat(clean);
    return isNaN(parsed) ? 0 : parsed;
  };

  const totalContracted = financialEntries.reduce((acc, curr) => acc + parseCurrency(curr.value), 0);
  const pendingPayments = financialEntries.filter(e => e.status === 'Pendente').reduce((acc, curr) => acc + parseCurrency(curr.value), 0);
  const contractsWithDoc = financialEntries.filter(e => e.status === 'Formalizado').length;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold text-white tracking-tight">Controle Financeiro</h2>
        <p className="text-xs text-zinc-500 font-medium">Gestão de custos e pagamentos</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard 
          label="TOTAL CONTRATADO" 
          value={formatCurrency(totalContracted)} 
          subtext="valor global de contratos" 
        />
        <div className="bg-[#1C1F26] border border-red-500/20 rounded-xl p-5 space-y-3">
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">A PAGAR (PENDENTES)</p>
          <div className="space-y-1">
            <h4 className="text-2xl font-bold text-white tracking-tight">
              {pendingPayments > 0 ? formatCurrency(pendingPayments) : '—'}
            </h4>
            <p className="text-[10px] text-zinc-400 font-medium">
              {pendingPayments > 0 ? 'faturas em aberto' : 'sem faturas em aberto'}
            </p>
          </div>
        </div>
        <div className="bg-[#1C1F26] border border-emerald-500/20 rounded-xl p-5 space-y-3">
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">CONTRATOS C/ DOC.</p>
          <div className="space-y-1">
            <h4 className="text-2xl font-bold text-white tracking-tight">{contractsWithDoc}</h4>
            <p className="text-[10px] text-zinc-400 font-medium">de {financialEntries.length} prestadores</p>
          </div>
        </div>
      </div>

      <div className="bg-[#1C1F26] border border-white/5 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
          <h3 className="font-bold text-white text-sm">Fluxo de Contratos</h3>
          <button 
            onClick={onAdd}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-xs font-bold text-white hover:bg-white/10 transition-all"
          >
            <Plus size={14} /> Lançar Pagamento
          </button>
        </div>
        <table className="w-full text-left">
          <thead>
            <tr className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest border-b border-white/5">
              <th className="px-6 py-4">Empresa</th>
              <th className="px-6 py-4">Serviço</th>
              <th className="px-6 py-4">Valor</th>
              <th className="px-6 py-4">Forma</th>
              <th className="px-6 py-4">Prazo</th>
              <th className="px-6 py-4">Contrato</th>
              <th className="px-6 py-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {financialEntries.map((item, idx) => (
              <tr key={idx} className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-4 text-xs font-bold text-zinc-200">{item.company}</td>
                <td className="px-6 py-4 text-xs text-zinc-400">{item.service}</td>
                <td className="px-6 py-4 text-xs font-bold text-zinc-300">{item.value}</td>
                <td className="px-6 py-4 text-xs text-zinc-500">{item.form}</td>
                <td className="px-6 py-4 text-xs text-zinc-500">{item.deadline}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                    item.status === 'Formalizado' 
                      ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                      : item.status === 'Pendente'
                      ? 'bg-red-500/10 text-red-500 border-red-500/20'
                      : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                  }`}>
                    {item.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button 
                      onClick={() => onEdit(item, idx)}
                      className="p-1.5 text-zinc-500 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                      title="Editar Lançamento"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button 
                      onClick={() => onDelete(idx)}
                      className="p-1.5 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                      title="Excluir Lançamento"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const EmpresasView = ({ 
  companies, 
  onAdd, 
  onEdit, 
  onDelete 
}: { 
  companies: Company[], 
  onAdd: () => void, 
  onEdit: (item: Company, idx: number) => void,
  onDelete: (idx: number) => void 
}) => (
  <div className="space-y-8 animate-in fade-in duration-500">
    <div className="flex items-center justify-between">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold text-white tracking-tight">Empresas</h2>
        <p className="text-xs text-zinc-500 font-medium">Gestão de parceiros, fornecedores e clientes</p>
      </div>
      <button 
        onClick={onAdd}
        className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-xs font-bold text-white hover:bg-white/10 transition-all"
      >
        <Plus size={14} /> Nova Empresa
      </button>
    </div>

    <div className="bg-[#1C1F26] border border-white/5 rounded-xl overflow-hidden overflow-x-auto">
      <table className="w-full text-left min-w-[800px]">
        <thead>
          <tr className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest border-b border-white/5">
            <th className="px-6 py-4">Nome</th>
            <th className="px-6 py-4">CNPJ</th>
            <th className="px-6 py-4">Contato</th>
            <th className="px-6 py-4">E-mail</th>
            <th className="px-6 py-4">Telefone</th>
            <th className="px-6 py-4">Tipo</th>
            <th className="px-6 py-4 text-right">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {companies.map((item, idx) => (
            <tr key={idx} className="hover:bg-white/5 transition-colors">
              <td className="px-6 py-4 text-xs font-bold text-zinc-200">{item.name}</td>
              <td className="px-6 py-4 text-xs text-zinc-400 font-mono">{item.cnpj}</td>
              <td className="px-6 py-4 text-xs text-zinc-400">{item.contact}</td>
              <td className="px-6 py-4 text-xs text-zinc-400">{item.email}</td>
              <td className="px-6 py-4 text-xs text-zinc-400">{item.phone}</td>
              <td className="px-6 py-4">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold border bg-white/5 text-zinc-400 border-white/10">
                  {item.type}
                </span>
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex items-center justify-end gap-2">
                  <button 
                    onClick={() => onEdit(item, idx)}
                    className="p-1.5 text-zinc-500 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                    title="Editar Empresa"
                  >
                    <Edit3 size={14} />
                  </button>
                  <button 
                    onClick={() => onDelete(idx)}
                    className="p-1.5 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                    title="Excluir Empresa"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const ContratosView = ({ 
  contracts, 
  onAdd, 
  onEdit, 
  onDelete 
}: { 
  contracts: Contract[], 
  onAdd: () => void, 
  onEdit: (item: Contract, idx: number) => void,
  onDelete: (idx: number) => void 
}) => (
  <div className="space-y-8 animate-in fade-in duration-500">
    <div className="flex items-center justify-between">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold text-white tracking-tight">Contratos e Prestadores</h2>
        <p className="text-xs text-zinc-500 font-medium">Gestão de parceiros e garantias</p>
      </div>
      <button 
        onClick={onAdd}
        className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-xs font-bold text-white hover:bg-white/10 transition-all"
      >
        <Plus size={14} /> Novo Contrato
      </button>
    </div>

    <div className="bg-[#1C1F26] border border-white/5 rounded-xl overflow-hidden">
      <table className="w-full text-left">
        <thead>
          <tr className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest border-b border-white/5">
            <th className="px-6 py-4">Empresa</th>
            <th className="px-6 py-4">Escopo</th>
            <th className="px-6 py-4">Contrato</th>
            <th className="px-6 py-4">Valor</th>
            <th className="px-6 py-4">Prazo</th>
            <th className="px-6 py-4">Garantia</th>
            <th className="px-6 py-4 text-right">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {contracts.map((item, idx) => (
            <tr key={idx} className="hover:bg-white/5 transition-colors">
              <td className="px-6 py-4 text-xs font-bold text-zinc-200">{item.company}</td>
              <td className="px-6 py-4 text-xs text-zinc-400">{item.scope}</td>
              <td className="px-6 py-4">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                  item.contract === 'Sim' 
                    ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                    : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                }`}>
                  {item.contract}
                </span>
              </td>
              <td className="px-6 py-4 text-xs text-zinc-300 font-medium">{item.value}</td>
              <td className="px-6 py-4 text-xs text-zinc-500">{item.deadline}</td>
              <td className="px-6 py-4 text-xs text-zinc-500">{item.warranty}</td>
              <td className="px-6 py-4 text-right">
                <div className="flex items-center justify-end gap-2">
                  <button 
                    onClick={() => onEdit(item, idx)}
                    className="p-1.5 text-zinc-500 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                    title="Editar Contrato"
                  >
                    <Edit3 size={14} />
                  </button>
                  <button 
                    onClick={() => onDelete(idx)}
                    className="p-1.5 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                    title="Excluir Contrato"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const DocumentacaoView = ({ 
  legalDocs, 
  techProjects, 
  onAddLegal, 
  onAddTech,
  onEditLegal, 
  onDeleteLegal, 
  onEditTech, 
  onDeleteTech 
}: { 
  legalDocs: LegalDocument[], 
  techProjects: TechnicalProject[], 
  onAddLegal: () => void,
  onAddTech: () => void,
  onEditLegal: (item: LegalDocument, idx: number) => void,
  onDeleteLegal: (idx: number) => void,
  onEditTech: (item: TechnicalProject, idx: number) => void,
  onDeleteTech: (idx: number) => void
}) => (
  <div className="space-y-8 animate-in fade-in duration-500">
    <div className="flex items-center justify-between">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold text-white tracking-tight">Documentação Legal e Técnica</h2>
        <p className="text-xs text-zinc-500 font-medium">Controle de licenças e projetos</p>
      </div>
    </div>

    <div className="bg-[#1C1F26] border border-white/5 rounded-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
        <h3 className="font-bold text-white text-sm">Licenças e Autorizações</h3>
        <button 
          onClick={onAddLegal}
          className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-[10px] font-bold text-white hover:bg-white/10 transition-all uppercase tracking-widest"
        >
          <Plus size={12} /> Nova Licença
        </button>
      </div>
      <table className="w-full text-left">
        <thead>
          <tr className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest border-b border-white/5">
            <th className="px-6 py-4">Documento</th>
            <th className="px-6 py-4">Órgão</th>
            <th className="px-6 py-4">Obrigatório</th>
            <th className="px-6 py-4">Enviado</th>
            <th className="px-6 py-4">Aprovação</th>
            <th className="px-6 py-4">Status</th>
            <th className="px-6 py-4 text-right">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {legalDocs.map((item, idx) => (
            <tr key={idx} className="hover:bg-white/5 transition-colors">
              <td className="px-6 py-4 text-xs font-bold text-zinc-200">{item.doc}</td>
              <td className="px-6 py-4 text-xs text-zinc-400">{item.org}</td>
              <td className="px-6 py-4 text-xs text-zinc-500">{item.req}</td>
              <td className="px-6 py-4 text-xs text-zinc-500">{item.sent}</td>
              <td className="px-6 py-4 text-xs text-zinc-500">{item.app}</td>
              <td className="px-6 py-4">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                  item.status === 'Aprovado' 
                    ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                    : item.status === 'Aguardando'
                    ? 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                    : 'bg-red-500/10 text-red-500 border-red-500/20'
                }`}>
                  {item.status}
                </span>
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex items-center justify-end gap-2">
                  <button 
                    onClick={() => onEditLegal(item, idx)}
                    className="p-1.5 text-zinc-500 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                  >
                    <Edit3 size={14} />
                  </button>
                  <button 
                    onClick={() => onDeleteLegal(idx)}
                    className="p-1.5 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    <div className="bg-[#1C1F26] border border-white/5 rounded-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
        <h3 className="font-bold text-white text-sm">Projetos Técnicos</h3>
        <button 
          onClick={onAddTech}
          className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-[10px] font-bold text-white hover:bg-white/10 transition-all uppercase tracking-widest"
        >
          <Plus size={12} /> Novo Projeto
        </button>
      </div>
      <table className="w-full text-left">
        <thead>
          <tr className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest border-b border-white/5">
            <th className="px-6 py-4">Projeto</th>
            <th className="px-6 py-4">Responsável</th>
            <th className="px-6 py-4">Versão</th>
            <th className="px-6 py-4">Data</th>
            <th className="px-6 py-4">Obs.</th>
            <th className="px-6 py-4">Status</th>
            <th className="px-6 py-4 text-right">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {techProjects.map((item, idx) => (
            <tr key={idx} className="hover:bg-white/5 transition-colors">
              <td className="px-6 py-4 text-xs font-bold text-zinc-200">{item.proj}</td>
              <td className="px-6 py-4 text-xs text-zinc-400">{item.resp}</td>
              <td className="px-6 py-4 text-xs text-zinc-500">{item.ver}</td>
              <td className="px-6 py-4 text-xs text-zinc-500">{item.date}</td>
              <td className="px-6 py-4 text-xs text-zinc-500">{item.obs}</td>
              <td className="px-6 py-4">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                  item.status === 'Aprovado' 
                    ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                    : item.status === 'Pendente'
                    ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                    : 'bg-red-500/10 text-red-500 border-red-500/20'
                }`}>
                  {item.status}
                </span>
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex items-center justify-end gap-2">
                  <button 
                    onClick={() => onEditTech(item, idx)}
                    className="p-1.5 text-zinc-500 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                  >
                    <Edit3 size={14} />
                  </button>
                  <button 
                    onClick={() => onDeleteTech(idx)}
                    className="p-1.5 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const RiscosView = ({ 
  risks, 
  onAdd, 
  onEdit, 
  onDelete,
  selectedTap,
  taps,
  onSelectTap
}: { 
  risks: Risk[], 
  onAdd: () => void,
  onEdit: (item: Risk, idx: number) => void,
  onDelete: (idx: number) => void,
  selectedTap: TAPData,
  taps: TAPData[],
  onSelectTap: (tap: TAPData) => void
}) => {
  const [isProjectSelectorOpen, setIsProjectSelectorOpen] = useState(false);
  const isAllProjects = selectedTap.projectName === "Todos os Projetos";
  
  const filteredRisks = risks.filter(risk => 
    isAllProjects || !risk.projectName || risk.projectName === selectedTap.projectName
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#1C1F26] p-6 rounded-2xl border border-white/5 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-white tracking-tight">Gestão de Riscos</h2>
            <span className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded text-[10px] font-bold text-blue-400 uppercase tracking-widest">
              {selectedTap.projectName}
            </span>
          </div>
          <p className="text-xs text-zinc-500 font-medium tracking-wide">
            {isAllProjects ? "Visão consolidada de riscos de todos os projetos" : `Identificação e mitigação: ${selectedTap.projectName}`}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <button 
              onClick={() => setIsProjectSelectorOpen(!isProjectSelectorOpen)}
              className="flex items-center gap-3 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold text-white transition-all group"
            >
              <LayoutGrid size={16} className="text-zinc-400 group-hover:text-blue-400 transition-colors" />
              Trocar Projeto
              <ChevronDown size={14} className={`text-zinc-500 transition-transform duration-300 ${isProjectSelectorOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {isProjectSelectorOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setIsProjectSelectorOpen(false)} 
                  />
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-72 bg-[#1C1F26] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden"
                  >
                    <div className="p-2 max-h-80 overflow-y-auto custom-scrollbar">
                      <button
                        onClick={() => {
                          onSelectTap(ALL_PROJECTS_TAP);
                          setIsProjectSelectorOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all ${
                          isAllProjects 
                            ? 'bg-blue-500/10 border border-blue-500/20' 
                            : 'hover:bg-white/5 border border-transparent'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          isAllProjects ? 'bg-blue-500 text-white' : 'bg-white/5 text-zinc-500'
                        }`}>
                          <LayoutGrid size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-bold truncate ${isAllProjects ? 'text-white' : 'text-zinc-400'}`}>
                            Todos os Projetos
                          </p>
                          <p className="text-[10px] text-zinc-500 truncate">Visão consolidada do portfólio</p>
                        </div>
                      </button>
                      {taps.map((tap) => (
                        <button
                          key={tap.projectName}
                          onClick={() => {
                            onSelectTap(tap);
                            setIsProjectSelectorOpen(false);
                          }}
                          className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all ${
                            selectedTap.projectName === tap.projectName 
                              ? 'bg-blue-500/10 border border-blue-500/20' 
                              : 'hover:bg-white/5 border border-transparent'
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                            selectedTap.projectName === tap.projectName ? 'bg-blue-500 text-white' : 'bg-white/5 text-zinc-500'
                          }`}>
                            <LayoutGrid size={16} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-xs font-bold truncate ${selectedTap.projectName === tap.projectName ? 'text-white' : 'text-zinc-400'}`}>
                              {tap.projectName}
                            </p>
                            <p className="text-[10px] text-zinc-500 truncate">{tap.projectType} • {tap.area}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          <button 
            onClick={onAdd}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-xs font-bold text-white transition-all shadow-lg shadow-emerald-600/20"
          >
            <Plus size={14} /> Adicionar Risco
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRisks.length === 0 ? (
          <div className="col-span-full bg-[#1C1F26] border border-white/5 rounded-xl p-12 text-center space-y-3">
            <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto text-zinc-600">
              <ShieldAlert size={24} />
            </div>
            <p className="text-xs text-zinc-500 italic">Nenhum risco cadastrado para {isAllProjects ? "os projetos" : `o projeto ${selectedTap.projectName}`}.</p>
          </div>
        ) : (
          filteredRisks.map((risk, idx) => (
            <div key={idx} className={`p-5 rounded-xl border ${risk.color} space-y-3 relative group transition-all hover:scale-[1.02]`}>
              <div className="absolute top-4 right-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => onEdit(risk, idx)}
                  className="p-1.5 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-white transition-colors"
                  title="Editar Risco"
                >
                  <Edit3 size={12} />
                </button>
                <button 
                  onClick={() => onDelete(idx)}
                  className="p-1.5 hover:bg-red-500/20 rounded-lg text-zinc-400 hover:text-red-400 transition-colors"
                  title="Excluir Risco"
                >
                  <Trash2 size={12} />
                </button>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <p className="text-[10px] font-bold uppercase tracking-widest">{risk.level} • {risk.title}</p>
                </div>
                {risk.projectName && (
                  <span className="w-fit px-1.5 py-0.5 bg-white/10 rounded text-[8px] font-bold text-white/60 uppercase tracking-widest">
                    {risk.projectName}
                  </span>
                )}
              </div>
              <p className="text-xs font-medium leading-relaxed opacity-80">{risk.desc}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const RDOView = ({ rdos, onAdd }: { rdos: RDO[], onAdd: () => void }) => (
  <div className="space-y-8 animate-in fade-in duration-500">
    <div className="flex items-center justify-between">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold text-white tracking-tight">Relatório Diário de Obra</h2>
        <p className="text-xs text-zinc-500 font-medium">Registro diário de atividades, mão de obra e ocorrências</p>
      </div>
      <button 
        onClick={onAdd}
        className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-xs font-bold text-white hover:bg-white/10 transition-all"
      >
        <Plus size={14} /> Novo RDO
      </button>
    </div>

    {rdos.length === 0 ? (
      <div className="bg-[#1C1F26] border border-white/5 rounded-xl p-12 flex flex-col items-center justify-center text-center space-y-4">
        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center text-zinc-600">
          <History size={32} />
        </div>
        <div className="space-y-1">
          <h4 className="text-white font-bold">Nenhum RDO registrado</h4>
          <p className="text-xs text-zinc-500 max-w-xs">Clique em "+ Novo RDO" para começar o registro das atividades diárias.</p>
        </div>
      </div>
    ) : (
      <div className="bg-[#1C1F26] border border-white/5 rounded-xl overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest border-b border-white/5">
              <th className="px-6 py-4">Data</th>
              <th className="px-6 py-4">Clima</th>
              <th className="px-6 py-4">Efetivo</th>
              <th className="px-6 py-4">Descrição</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {rdos.map((rdo, idx) => (
              <tr key={idx} className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-4 text-xs font-bold text-zinc-200">{rdo.date}</td>
                <td className="px-6 py-4 text-xs text-zinc-400">{rdo.weather}</td>
                <td className="px-6 py-4 text-xs text-zinc-400">{rdo.workers}</td>
                <td className="px-6 py-4 text-xs text-zinc-500">{rdo.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
);

const QualidadeView = ({ nonConformities, onAdd }: { nonConformities: NonConformity[], onAdd: () => void }) => (
  <div className="space-y-8 animate-in fade-in duration-500">
    <div className="flex items-center justify-between">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold text-white tracking-tight">Controle de Qualidade</h2>
        <p className="text-xs text-zinc-500 font-medium">Inspeções e não conformidades</p>
      </div>
      <button 
        onClick={onAdd}
        className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-xs font-bold text-white hover:bg-white/10 transition-all"
      >
        <Plus size={14} /> Não Conformidade
      </button>
    </div>

    <div className="bg-[#1C1F26] border border-white/5 rounded-xl overflow-hidden">
      <table className="w-full text-left">
        <thead>
          <tr className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest border-b border-white/5">
            <th className="px-6 py-4">Item</th>
            <th className="px-6 py-4">Descrição</th>
            <th className="px-6 py-4">Responsável</th>
            <th className="px-6 py-4">Prazo</th>
            <th className="px-6 py-4 text-right">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {nonConformities.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-6 py-12 text-center text-xs text-zinc-500 italic">Nenhuma não conformidade registrada.</td>
            </tr>
          ) : (
            nonConformities.map((nc, idx) => (
              <tr key={idx} className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-4 text-xs font-bold text-zinc-200">{nc.item}</td>
                <td className="px-6 py-4 text-xs text-zinc-400">{nc.description}</td>
                <td className="px-6 py-4 text-xs text-zinc-400">{nc.responsible}</td>
                <td className="px-6 py-4 text-xs text-zinc-400">{nc.deadline}</td>
                <td className="px-6 py-4 text-right">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                    {nc.status}
                  </span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  </div>
);

export default function App() {
  const [activeView, setActiveView] = useState<View>('dashboard');
  
  // --- Functional State ---
  const [progressData, setProgressData] = useState<ProgressItem[]>([
    { 
      name: 'Preparação do terreno', 
      progress: 66, 
      color: 'bg-blue-500', 
      isMilestone: true, 
      tasks: [
        { text: 'Limpeza do terreno', completed: true }, 
        { text: 'Nivelamento inicial', completed: true }, 
        { text: 'Instalação de tapumes', completed: false }
      ] 
    },
    { 
      name: 'Terraplanagem e drenagem', 
      progress: 33, 
      color: 'bg-emerald-500', 
      isMilestone: true, 
      tasks: [
        { text: 'Movimentação de terra', completed: true }, 
        { text: 'Escavação de valas', completed: false }, 
        { text: 'Instalação de tubos', completed: false }
      ] 
    },
    { 
      name: 'Fundação', 
      progress: 0, 
      color: 'bg-amber-500', 
      isMilestone: true, 
      tasks: [
        { text: 'Locação de estacas', completed: false }, 
        { text: 'Perfuração', completed: false }, 
        { text: 'Concretagem', completed: false }
      ] 
    },
    { name: 'Estrutura pré-moldada', progress: 0, color: 'bg-purple-500', isMilestone: true },
    { name: 'Instalações', progress: 0, color: 'bg-red-500', isMilestone: true },
    { name: 'Acabamentos', progress: 0, color: 'bg-cyan-500', isMilestone: true },
    { name: 'Limpeza superficial do terreno', progress: 100, color: 'bg-emerald-500' },
    { name: 'Tapume', progress: 100, color: 'bg-emerald-500' },
    { name: 'Canteiro de obra', progress: 90, color: 'bg-amber-500' },
    { name: 'Inst. hidráulicas do canteiro', progress: 70, color: 'bg-amber-500' },
    { name: 'Serviços preliminares', progress: 70, color: 'bg-amber-500' },
    { name: 'Terraplanagem', progress: 60, color: 'bg-amber-500' },
    { name: 'Padrão Celpe', progress: 20, color: 'bg-blue-500' },
    { name: 'Fundação', progress: 15, color: 'bg-blue-500' },
    { name: 'Drenagem de solo', progress: 15, color: 'bg-blue-500' },
    { name: 'Instalações elétricas', progress: 5, color: 'bg-blue-500' },
    { name: 'Alvenaria', progress: 0, color: 'bg-zinc-700' },
    { name: 'Estrutura INBRAC', progress: 0, color: 'bg-zinc-700' },
    { name: 'Impermeabilização', progress: 0, color: 'bg-zinc-700' },
    { name: 'Piso em concreto', progress: 0, color: 'bg-zinc-700' },
    { name: 'Revestimento interno', progress: 0, color: 'bg-zinc-700' },
    { name: 'Revestimento externo', progress: 0, color: 'bg-zinc-700' },
  ]);

  const [alerts, setAlerts] = useState<Alert[]>(ALERTS);
  
  const [team, setTeam] = useState<TeamMember[]>([
    { name: 'Thiago Patriota', role: 'Responsável Técnico / Gestor', company: 'VP Construtora', status: 'Ativo' },
    { name: 'Roberta Lima', role: 'Gestora de Obra', company: 'VP Construtora', status: 'Ativo' },
  ]);

  const [materials, setMaterials] = useState<Material[]>([
    { name: 'Tela de tapume metálico', req: '—', rec: '—', unit: 'm', vendor: '—', status: 'Recebido' },
    { name: 'Brita e areia', req: '—', rec: '—', unit: 'm³', vendor: '—', status: 'Recebido' },
  ]);

  const [financialEntries, setFinancialEntries] = useState<FinancialEntry[]>([
    { company: 'INBRAC', service: 'Galpão pré-moldado', value: 'R$ 2.800.000', form: '7 parcelas', deadline: '100 dias', status: 'Formalizado' },
    { company: 'Coronel Alberto', service: 'Proj. incêndio e SPDA', value: 'R$ 14.700', form: '3 parcelas', deadline: '45 dias', status: 'Sem contrato' },
    { company: 'Arque Engenharia', service: 'EVA + PGRCC + RIT', value: 'R$ 11.500', form: '2 parcelas', deadline: '10 dias', status: 'Formalizado' },
    { company: 'Catec Engenharia', service: 'Macrodrenagem e locação', value: 'R$ 9.000', form: '3 parcelas', deadline: '15 dias', status: 'Sem contrato' },
    { company: 'Compesa', service: 'Cartas de viabilidade', value: 'R$ 1.200', form: 'À vista', deadline: '—', status: 'Sem contrato' },
    { company: 'Empesa', service: 'Destinação resíduos sólidos', value: 'R$80/ton', form: 'Mensal', deadline: '—', status: 'Formalizado' },
  ]);

  const [contracts, setContracts] = useState<Contract[]>([
    { company: 'INBRAC', scope: 'Galpão pré-moldado', contract: 'Sim', value: 'R$ 2.800.000', deadline: '100 dias', warranty: 'Contra defeitos' },
    { company: 'Coronel Alberto', scope: 'Proj. incêndio e SPDA', contract: 'Não', value: 'R$ 14.700', deadline: '45 dias', warranty: '—' },
    { company: 'Arque Engenharia', scope: 'EVA + PGRCC + RIT', contract: 'Sim', value: 'R$ 11.500', deadline: '10 dias', warranty: '—' },
    { company: 'Catec Engenharia', scope: 'Macrodrenagem e locação', contract: 'Não', value: 'R$ 9.000', deadline: '15 dias', warranty: '—' },
    { company: 'Compesa', scope: 'Cartas de viabilidade', contract: 'Não', value: 'R$ 1.200', deadline: '—', warranty: '—' },
    { company: 'Empesa', scope: 'Destinação resíduos sólidos', contract: 'Sim', value: 'R$80/ton', deadline: '—', warranty: '—' },
    { company: 'Muderna', scope: 'Projeto de arquitetura', contract: 'Não', value: '—', deadline: '—', warranty: '—' },
    { company: 'VP Construtora', scope: 'Execução da obra', contract: 'Não', value: '—', deadline: '—', warranty: '—' },
    { company: 'Djalma Filho', scope: 'Terraplanagem e pavimentação', contract: 'Não', value: '—', deadline: '—', warranty: '—' },
  ]);

  const [companies, setCompanies] = useState<Company[]>([
    { name: 'INBRAC', cnpj: '00.000.000/0001-00', contact: 'João Silva', email: 'joao@inbrac.com.br', phone: '(81) 99999-9999', type: 'Subempreiteiro' },
    { name: 'VP Construtora', cnpj: '11.111.111/0001-11', contact: 'Thiago Patriota', email: 'thiago@vp.com.br', phone: '(81) 88888-8888', type: 'Construtora' },
    { name: 'Muderna', cnpj: '22.222.222/0001-22', contact: 'Roberta Lima', email: 'roberta@muderna.com.br', phone: '(81) 77777-7777', type: 'Arquitetura' },
    { name: 'Catec Engenharia', cnpj: '33.333.333/0001-33', contact: 'Carlos Tec', email: 'carlos@catec.com.br', phone: '(81) 66666-6666', type: 'Topografia' },
  ]);

  const [legalDocs, setLegalDocs] = useState<LegalDocument[]>([
    { doc: 'Ligação de energia', org: 'Celpe', req: 'Sim', sent: '—', app: '—', status: 'Não iniciado' },
    { doc: 'Viabilidade de esgotamento sanitário', org: 'Compesa', req: 'Sim', sent: '02/03/2026', app: '—', status: 'Aguardando' },
    { doc: 'Viabilidade de abastecimento de água', org: 'Compesa', req: 'Sim', sent: '02/03/2026', app: '—', status: 'Aguardando' },
    { doc: 'Alvará', org: 'Prefeitura', req: 'Sim', sent: '—', app: '—', status: 'Não iniciado' },
    { doc: 'AVCB', org: 'Corpo de Bombeiros', req: 'Sim', sent: '—', app: '—', status: 'Não iniciado' },
    { doc: 'Licença sanitária', org: 'Vigilância sanitária', req: '—', sent: '—', app: '—', status: 'Não iniciado' },
  ]);

  const [techProjects, setTechProjects] = useState<TechnicalProject[]>([
    { proj: 'Arquitetura (projeto legal)', resp: 'Muderna', ver: 'REV03', date: '12/11/2025', obs: 'Tem RRT', status: 'Aprovado' },
    { proj: 'Arquitetura (projeto executivo)', resp: 'Muderna', ver: 'REV00', date: '02/03/2026', obs: '—', status: 'Aprovado' },
    { proj: 'Levantamento topográfico', resp: 'Catec Engenharia', ver: 'REV00', date: 'jul/25', obs: 'Tem ART', status: 'Aprovado' },
    { proj: 'Macrodrenagem e locação', resp: 'Catec Engenharia', ver: '—', date: '—', obs: '—', status: 'Não iniciado' },
    { proj: 'Sondagem do solo', resp: 'Tec Solo Engenharia', ver: 'REV00', date: '04/08/2025', obs: '—', status: 'Aprovado' },
    { proj: 'Proj. drenagem e pavimentação', resp: 'Djalma Filho', ver: 'REV01', date: '26/02/2026', obs: 'Tem ART', status: 'Aprovado' },
    { proj: 'EVA / PGRCC / RIT', resp: 'Arque Engenharia', ver: '—', date: '—', obs: 'Ag. envio do projeto', status: 'Pendente' },
    { proj: 'Proj. combate a incêndio', resp: 'Coronel Alberto', ver: '—', date: '—', obs: 'Ag. boleto', status: 'Pendente' },
    { proj: 'Projeto SPDA', resp: 'Coronel Alberto', ver: '—', date: '—', obs: 'Ag. boleto', status: 'Pendente' },
    { proj: 'Estrutural', resp: '—', ver: '—', date: '—', obs: 'Não iniciado', status: 'Não iniciado' },
    { proj: 'Elétrico', resp: '—', ver: '—', date: '—', obs: 'Não iniciado', status: 'Não iniciado' },
    { proj: 'Hidrossanitário', resp: '—', ver: '—', date: '—', obs: 'Não iniciado', status: 'Não iniciado' },
  ]);

  const [risks, setRisks] = useState<Risk[]>([
    { level: 'ALTO', title: 'Alvará não emitido', desc: 'Obra pode ser embargada sem alvará prefeitura', color: 'border-red-500/30 text-red-400 bg-red-500/5', projectName: "Galpão Logístico - Extrema/MG" },
    { level: 'ALTO', title: 'Proj. incêndio pendente', desc: 'Boleto aguardando - pode atrasar aprovação CBMPE', color: 'border-red-500/30 text-red-400 bg-red-500/5', projectName: "Galpão Logístico - Extrema/MG" },
    { level: 'MEDIO', title: 'Terraplanagem incompleta', desc: '60% — chuvas podem impactar prazo', color: 'border-amber-500/30 text-amber-400 bg-amber-500/5', projectName: "Galpão Logístico - Extrema/MG" },
    { level: 'MEDIO', title: 'INBRAC: 100 dias', desc: 'Galpão pré-moldado: prazo curto para R$2,8M', color: 'border-amber-500/30 text-amber-400 bg-amber-500/5', projectName: "Galpão Logístico - Extrema/MG" },
    { level: 'BAIXO', title: 'Macrodrenagem em elaboração', desc: 'Catec ainda não entregou o projeto', color: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/5', projectName: "Galpão Logístico - Extrema/MG" },
    { level: 'BAIXO', title: 'Projetos técnicos pendentes', desc: 'Elétrico, estrutural e hidro não iniciados', color: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/5', projectName: "Galpão Logístico - Extrema/MG" },
  ]);

  const [rdos, setRdos] = useState<RDO[]>([]);
  const [nonConformities, setNonConformities] = useState<NonConformity[]>([]);
  const [taps, setTaps] = useState<TAPData[]>([INITIAL_TAP_DATA]);
  const [selectedTap, setSelectedTap] = useState<TAPData>(ALL_PROJECTS_TAP);

  // --- Modal State ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<any>(null);

  const openModal = (type: string, item: any = null) => {
    setModalType(type);
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const renderModalContent = () => {
    switch (modalType) {
      case 'tap':
        return (
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const newTAP: TAPData = {
              projectName: formData.get('projectName') as string,
              justification: formData.get('justification') as string,
              objectives: (formData.get('objectives') as string).split('\n').filter(s => s.trim()),
              requirements: (formData.get('requirements') as string).split('\n').filter(s => s.trim()),
              risks: (formData.get('risks') as string).split('\n').filter(s => s.trim()),
              stakeholders: (formData.get('stakeholders') as string).split('\n').filter(s => s.trim()),
              budget: formData.get('budget') as string,
              manager: formData.get('manager') as string,
              sponsor: formData.get('sponsor') as string,
              startDate: formData.get('startDate') as string,
              area: formData.get('area') as string,
              projectType: formData.get('projectType') as string,
              milestones: (formData.get('milestones') as string).split('\n').filter(s => s.trim()).map(line => {
                const [date, ...descParts] = line.split(' - ');
                return { date: date.trim(), description: descParts.join(' - ').trim() };
              })
            };
            
            if (editingItem) {
              setTaps(prev => prev.map(t => t.projectName === editingItem.projectName ? newTAP : t));
              // Atualizar também no cronograma/dashboard se o nome bater
              setProgressData(prev => prev.map(item => 
                item.name === editingItem.projectName ? { ...item, name: newTAP.projectName } : item
              ));
            } else {
              setTaps(prev => [...prev, newTAP]);
              // Incluir o projeto no dashboard como um novo marco
              const newMilestone: ProgressItem = {
                name: newTAP.projectName,
                progress: 0,
                color: 'bg-blue-500',
                isMilestone: true,
                tasks: newTAP.milestones.map(m => ({ text: m.description, completed: false }))
              };
              setProgressData(prev => [newMilestone, ...prev]);
            }
            closeModal();
          }} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Nome do Projeto</label>
              <input name="projectName" defaultValue={editingItem?.projectName} required className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-blue-500/50" />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Data Início</label>
                <input name="startDate" defaultValue={editingItem?.startDate} placeholder="Ex: 15/03/2026" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-blue-500/50" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Área</label>
                <input name="area" defaultValue={editingItem?.area} placeholder="Ex: 1.200 m²" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-blue-500/50" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Tipo</label>
                <input name="projectType" defaultValue={editingItem?.projectType} placeholder="Ex: Galeria" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-blue-500/50" />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Justificativa</label>
              <textarea name="justification" defaultValue={editingItem?.justification} rows={3} required className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-blue-500/50 resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Gerente</label>
                <input name="manager" defaultValue={editingItem?.manager} required className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-blue-500/50" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Sponsor</label>
                <input name="sponsor" defaultValue={editingItem?.sponsor} required className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-blue-500/50" />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Orçamento Estimado</label>
              <input name="budget" defaultValue={editingItem?.budget} required className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-blue-500/50" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Objetivos (um por linha)</label>
              <textarea name="objectives" defaultValue={editingItem?.objectives?.join('\n') || ''} rows={3} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-blue-500/50 resize-none" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Requisitos (um por linha)</label>
              <textarea name="requirements" defaultValue={editingItem?.requirements?.join('\n') || ''} rows={3} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-blue-500/50 resize-none" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Riscos (um por linha)</label>
              <textarea name="risks" defaultValue={editingItem?.risks?.join('\n') || ''} rows={3} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-blue-500/50 resize-none" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Stakeholders (um por linha)</label>
              <textarea name="stakeholders" defaultValue={editingItem?.stakeholders?.join('\n') || ''} rows={3} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-blue-500/50 resize-none" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Marcos (Data - Descrição)</label>
              <textarea name="milestones" defaultValue={editingItem?.milestones?.map((m: any) => `${m.date} - ${m.description}`).join('\n') || ''} rows={4} placeholder="Ex: 15/03/2026 - Início das Obras" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-blue-500/50 resize-none" />
            </div>
            <button type="submit" className="w-full py-3 bg-blue-600 rounded-lg text-xs font-bold text-white hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20">
              Salvar Alterações no TAP
            </button>
          </form>
        );
      case 'progress':
        return (
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const progress = parseInt(formData.get('progress') as string);
            if (editingItem) {
              const updated = progressData.map(item => 
                item.name === (editingItem as ProgressItem).name ? { ...item, progress } : item
              );
              setProgressData(updated);
            }
            closeModal();
          }} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Serviço</label>
              <p className="text-sm text-white font-medium">{(editingItem as ProgressItem)?.name}</p>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Progresso (%)</label>
              <input 
                name="progress"
                type="number" 
                min="0" 
                max="100" 
                defaultValue={(editingItem as ProgressItem)?.progress}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-emerald-500/50"
              />
            </div>
            <button type="submit" className="w-full py-3 bg-emerald-500 rounded-lg text-xs font-bold text-white hover:bg-emerald-600 transition-colors">
              Atualizar Progresso
            </button>
          </form>
        );
      case 'legal_doc':
        return (
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const newDoc: LegalDocument = {
              doc: formData.get('doc') as string,
              org: formData.get('org') as string,
              req: formData.get('req') as string,
              sent: formData.get('sent') as string,
              app: formData.get('app') as string,
              status: formData.get('status') as any
            };
            if (editingItem) {
              setLegalDocs(prev => prev.map((item, i) => i === editingItem.index ? newDoc : item));
            } else {
              setLegalDocs([...legalDocs, newDoc]);
            }
            closeModal();
          }} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Documento</label>
              <input name="doc" defaultValue={editingItem?.doc} required className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-emerald-500/50" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Órgão / Empresa</label>
              <select name="org" defaultValue={editingItem?.org} required className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-emerald-500/50">
                <option value="" disabled>Selecione uma empresa</option>
                {companies.map((c, i) => (
                  <option key={i} value={c.name} className="bg-[#1C1F26]">{c.name}</option>
                ))}
                <option value="Celpe" className="bg-[#1C1F26]">Celpe</option>
                <option value="Compesa" className="bg-[#1C1F26]">Compesa</option>
                <option value="Prefeitura" className="bg-[#1C1F26]">Prefeitura</option>
                <option value="Corpo de Bombeiros" className="bg-[#1C1F26]">Corpo de Bombeiros</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Obrigatório</label>
                <input name="req" defaultValue={editingItem?.req} placeholder="Ex: Sim" required className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-emerald-500/50" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Enviado</label>
                <input name="sent" defaultValue={editingItem?.sent} placeholder="Ex: 10/03" required className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-emerald-500/50" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Aprovação</label>
                <input name="app" defaultValue={editingItem?.app} placeholder="Ex: 15/03" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-emerald-500/50" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Status</label>
                <select name="status" defaultValue={editingItem?.status || 'Aguardando'} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-emerald-500/50">
                  <option value="Não iniciado">Não iniciado</option>
                  <option value="Aguardando">Aguardando</option>
                  <option value="Aprovado">Aprovado</option>
                  <option value="Pendente">Pendente</option>
                </select>
              </div>
            </div>
            <button type="submit" className="w-full py-3 bg-emerald-500 rounded-lg text-xs font-bold text-white hover:bg-emerald-600 transition-colors">
              {editingItem ? 'Salvar Alterações' : 'Adicionar Licença'}
            </button>
          </form>
        );
      case 'tech_project':
        return (
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const newProject: TechnicalProject = {
              proj: formData.get('proj') as string,
              resp: formData.get('resp') as string,
              ver: formData.get('ver') as string,
              date: formData.get('date') as string,
              obs: formData.get('obs') as string,
              status: formData.get('status') as any
            };
            if (editingItem) {
              setTechProjects(prev => prev.map((item, i) => i === editingItem.index ? newProject : item));
            } else {
              setTechProjects([...techProjects, newProject]);
            }
            closeModal();
          }} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Projeto</label>
              <input name="proj" defaultValue={editingItem?.proj} required className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-emerald-500/50" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Responsável / Empresa</label>
              <select name="resp" defaultValue={editingItem?.resp} required className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-emerald-500/50">
                <option value="" disabled>Selecione uma empresa</option>
                {companies.map((c, i) => (
                  <option key={i} value={c.name} className="bg-[#1C1F26]">{c.name}</option>
                ))}
                <option value="Muderna" className="bg-[#1C1F26]">Muderna</option>
                <option value="Catec Engenharia" className="bg-[#1C1F26]">Catec Engenharia</option>
                <option value="Tec Solo Engenharia" className="bg-[#1C1F26]">Tec Solo Engenharia</option>
                <option value="Djalma Filho" className="bg-[#1C1F26]">Djalma Filho</option>
                <option value="Arque Engenharia" className="bg-[#1C1F26]">Arque Engenharia</option>
                <option value="Coronel Alberto" className="bg-[#1C1F26]">Coronel Alberto</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Versão</label>
                <input name="ver" defaultValue={editingItem?.ver} placeholder="Ex: REV01" required className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-emerald-500/50" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Data</label>
                <input name="date" defaultValue={editingItem?.date} placeholder="Ex: 10/03/2026" required className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-emerald-500/50" />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Observações</label>
              <input name="obs" defaultValue={editingItem?.obs} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-emerald-500/50" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Status</label>
              <select name="status" defaultValue={editingItem?.status || 'Não iniciado'} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-emerald-500/50">
                <option value="Não iniciado">Não iniciado</option>
                <option value="Pendente">Pendente</option>
                <option value="Aprovado">Aprovado</option>
              </select>
            </div>
            <button type="submit" className="w-full py-3 bg-blue-600 rounded-lg text-xs font-bold text-white hover:bg-blue-700 transition-colors">
              {editingItem ? 'Salvar Alterações' : 'Adicionar Projeto'}
            </button>
          </form>
        );
      case 'team':
        return (
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const newMember: TeamMember = {
              name: formData.get('name') as string,
              role: formData.get('role') as string,
              company: formData.get('company') as string,
              status: (formData.get('status') as any) || 'Ativo'
            };
            if (editingItem) {
              setTeam(prev => prev.map((item, i) => i === editingItem.index ? newMember : item));
            } else {
              setTeam([...team, newMember]);
            }
            closeModal();
          }} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Nome</label>
              <input name="name" defaultValue={editingItem?.name} required className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-emerald-500/50" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Cargo</label>
                <input name="role" defaultValue={editingItem?.role} required className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-emerald-500/50" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Empresa</label>
                <input name="company" defaultValue={editingItem?.company} required className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-emerald-500/50" />
              </div>
            </div>
            {editingItem && (
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Status</label>
                <select name="status" defaultValue={editingItem?.status} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-emerald-500/50">
                  <option value="Ativo" className="bg-[#1C1F26]">Ativo</option>
                  <option value="Inativo" className="bg-[#1C1F26]">Inativo</option>
                  <option value="Férias" className="bg-[#1C1F26]">Férias</option>
                </select>
              </div>
            )}
            <button type="submit" className="w-full py-3 bg-emerald-500 rounded-lg text-xs font-bold text-white hover:bg-emerald-600 transition-colors">
              {editingItem ? 'Salvar Alterações' : 'Adicionar Membro'}
            </button>
          </form>
        );
      case 'material':
        return (
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const newItem: Material = {
              name: formData.get('name') as string,
              req: formData.get('qty') as string,
              rec: formData.get('rec') as string || '0',
              unit: formData.get('unit') as string || 'un',
              vendor: formData.get('vendor') as string || 'Pendente',
              status: (formData.get('status') as any) || 'Pendente'
            };
            if (editingItem) {
              setMaterials(prev => prev.map((item, i) => i === editingItem.index ? newItem : item));
            } else {
              setMaterials([...materials, newItem]);
            }
            closeModal();
          }} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Material</label>
              <input name="name" defaultValue={editingItem?.name} required className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-emerald-500/50" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Qtd. Solicitada</label>
                <input name="qty" defaultValue={editingItem?.req} required className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-emerald-500/50" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Unidade</label>
                <input name="unit" defaultValue={editingItem?.unit || 'un'} required className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-emerald-500/50" />
              </div>
            </div>
            {editingItem && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Qtd. Recebida</label>
                    <input name="rec" defaultValue={editingItem?.rec} required className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-emerald-500/50" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Fornecedor</label>
                    <input name="vendor" defaultValue={editingItem?.vendor} required className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-emerald-500/50" />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Status</label>
                  <select name="status" defaultValue={editingItem?.status} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-emerald-500/50">
                    <option value="Pendente" className="bg-[#1C1F26]">Pendente</option>
                    <option value="Entregue" className="bg-[#1C1F26]">Entregue</option>
                    <option value="Parcial" className="bg-[#1C1F26]">Parcial</option>
                    <option value="Cancelado" className="bg-[#1C1F26]">Cancelado</option>
                  </select>
                </div>
              </>
            )}
            <button type="submit" className="w-full py-3 bg-emerald-500 rounded-lg text-xs font-bold text-white hover:bg-emerald-600 transition-colors">
              {editingItem ? 'Salvar Alterações' : 'Solicitar Material'}
            </button>
          </form>
        );
      case 'financial':
        return (
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const newEntry: FinancialEntry = {
              company: formData.get('company') as string,
              service: formData.get('service') as string,
              value: formData.get('value') as string,
              form: formData.get('form') as string,
              deadline: formData.get('date') as string,
              status: formData.get('status') as any
            };
            if (editingItem) {
              setFinancialEntries(prev => prev.map((item, i) => i === editingItem.index ? newEntry : item));
            } else {
              setFinancialEntries([...financialEntries, newEntry]);
            }
            closeModal();
          }} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Empresa</label>
              <select name="company" defaultValue={editingItem?.company} required className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-emerald-500/50">
                <option value="" disabled>Selecione uma empresa</option>
                {companies.map((c, i) => (
                  <option key={i} value={c.name} className="bg-[#1C1F26]">{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Serviço</label>
              <input name="service" defaultValue={editingItem?.service} required className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-emerald-500/50" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Valor</label>
                <input name="value" defaultValue={editingItem?.value} placeholder="R$ 0,00" required className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-emerald-500/50" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Data</label>
                <input name="date" defaultValue={editingItem?.deadline} type="text" placeholder="Ex: 10/03/2026" required className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-emerald-500/50" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Forma</label>
                <input name="form" defaultValue={editingItem?.form || 'Boleto'} required className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-emerald-500/50" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Status</label>
                <select name="status" defaultValue={editingItem?.status || 'Pendente'} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-emerald-500/50">
                  <option value="Pendente">Pendente</option>
                  <option value="Formalizado">Formalizado</option>
                </select>
              </div>
            </div>
            <button type="submit" className="w-full py-3 bg-emerald-500 rounded-lg text-xs font-bold text-white hover:bg-emerald-600 transition-colors">
              {editingItem ? 'Salvar Alterações' : 'Lançar Pagamento'}
            </button>
          </form>
        );
      case 'rdo':
        return (
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const newRDO: RDO = {
              date: new Date().toLocaleDateString('pt-BR'),
              weather: formData.get('weather') as string,
              workers: parseInt(formData.get('workers') as string) || 0,
              description: formData.get('description') as string
            };
            setRdos([newRDO, ...rdos]);
            closeModal();
          }} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Clima</label>
                <select name="weather" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-emerald-500/50">
                  <option value="Bom">Bom</option>
                  <option value="Chuvoso">Chuvoso</option>
                  <option value="Instável">Instável</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Efetivo</label>
                <input name="workers" placeholder="Ex: 12 pessoas" required className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-emerald-500/50" />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Descrição das Atividades</label>
              <textarea name="description" rows={4} required className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-emerald-500/50" />
            </div>
            <button type="submit" className="w-full py-3 bg-emerald-500 rounded-lg text-xs font-bold text-white hover:bg-emerald-600 transition-colors">
              Salvar RDO
            </button>
          </form>
        );
      case 'quality':
        return (
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const newNC: NonConformity = {
              item: formData.get('item') as string,
              description: formData.get('description') as string,
              responsible: formData.get('responsible') as string,
              deadline: formData.get('deadline') as string,
              status: 'Pendente'
            };
            setNonConformities([...nonConformities, newNC]);
            closeModal();
          }} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Item/Serviço</label>
              <input name="item" required className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-emerald-500/50" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Descrição da Não Conformidade</label>
              <textarea name="description" rows={3} required className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-emerald-500/50" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Responsável</label>
                <input name="responsible" required className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-emerald-500/50" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Prazo</label>
                <input name="deadline" type="date" required className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-emerald-500/50" />
              </div>
            </div>
            <button type="submit" className="w-full py-3 bg-emerald-500 rounded-lg text-xs font-bold text-white hover:bg-emerald-600 transition-colors">
              Registrar Não Conformidade
            </button>
          </form>
        );
      case 'risk':
        return (
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const level = formData.get('level') as 'ALTO' | 'MEDIO' | 'BAIXO';
            
            const colorMap = {
              'ALTO': 'border-red-500/30 text-red-400 bg-red-500/5',
              'MEDIO': 'border-amber-500/30 text-amber-400 bg-amber-500/5',
              'BAIXO': 'border-emerald-500/30 text-emerald-400 bg-emerald-500/5'
            };

            const newRisk: Risk = {
              level,
              title: formData.get('title') as string,
              desc: formData.get('desc') as string,
              color: colorMap[level],
              projectName: formData.get('projectName') as string || undefined
            };

            if (editingItem) {
              setRisks(prev => prev.map((item, i) => i === editingItem.index ? newRisk : item));
            } else {
              setRisks([...risks, newRisk]);
            }
            closeModal();
          }} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Projeto Relacionado</label>
              <select 
                name="projectName" 
                defaultValue={editingItem?.projectName || (selectedTap.projectName === "Todos os Projetos" ? "" : selectedTap.projectName)} 
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-emerald-500/50"
              >
                <option value="" className="bg-[#1C1F26]">Global / Todos</option>
                {taps.map(tap => (
                  <option key={tap.projectName} value={tap.projectName} className="bg-[#1C1F26]">{tap.projectName}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Título do Risco</label>
              <input name="title" defaultValue={editingItem?.title} required className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-emerald-500/50" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Nível de Impacto</label>
              <select name="level" defaultValue={editingItem?.level || 'MEDIO'} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-emerald-500/50">
                <option value="ALTO" className="bg-[#1C1F26]">ALTO</option>
                <option value="MEDIO" className="bg-[#1C1F26]">MÉDIO</option>
                <option value="BAIXO" className="bg-[#1C1F26]">BAIXO</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Descrição / Mitigação</label>
              <textarea name="desc" defaultValue={editingItem?.desc} rows={3} required className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-emerald-500/50" />
            </div>
            <button type="submit" className="w-full py-3 bg-emerald-500 rounded-lg text-xs font-bold text-white hover:bg-emerald-600 transition-colors">
              {editingItem ? 'Salvar Alterações' : 'Adicionar Risco'}
            </button>
          </form>
        );
      case 'milestone':
        return (
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const name = formData.get('name') as string;
            const tasksStr = formData.get('tasks') as string;
            const tasks = tasksStr ? tasksStr.split(',').map(t => ({ text: t.trim(), completed: false })).filter(t => t.text !== '') : [];
            const projectName = formData.get('projectName') as string;
            
            // Create new milestone
            const newMilestone: ProgressItem = {
              name,
              progress: tasks.length > 0 ? 0 : (parseInt(formData.get('progress') as string) || 0),
              color: 'bg-blue-500',
              isMilestone: true,
              tasks,
              projectName: projectName || undefined
            };
            setProgressData([newMilestone, ...progressData]);
            closeModal();
          }} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Projeto</label>
              <select 
                name="projectName" 
                defaultValue={selectedTap?.projectName || ""} 
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-emerald-500/50"
              >
                <option value="">Global / Todos</option>
                {taps.map((t, i) => (
                  <option key={i} value={t.projectName} className="bg-[#1C1F26]">{t.projectName}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Nome do Marco</label>
              <input name="name" placeholder="Ex: Entrega da Fundação" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-emerald-500/50" required />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Atividades (separadas por vírgula)</label>
              <textarea name="tasks" placeholder="Ex: Limpeza, Nivelamento, Marcação" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-emerald-500/50" rows={3} />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Progresso Inicial (%)</label>
              <input name="progress" type="number" min="0" max="100" defaultValue="0" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-emerald-500/50" />
            </div>
            <button type="submit" className="w-full py-3 bg-blue-600 rounded-lg text-xs font-bold text-white hover:bg-blue-700 transition-colors">
              Vincular ao Cronograma
            </button>
          </form>
        );
      case 'milestone_detail':
        return (
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const tasksStr = formData.get('tasks') as string;
            const newTasks = tasksStr ? tasksStr.split(',').map(t => ({ text: t.trim(), completed: false })).filter(t => t.text !== '') : [];
            
            const updated = progressData.map(item => {
              if (item.name === (editingItem as ProgressItem).name) {
                // For simplicity, we replace tasks but you could merge if needed
                // Here we merge to keep completed states if texts match
                const mergedTasks = newTasks.map(nt => {
                  const existing = item.tasks?.find(et => et.text === nt.text);
                  return existing ? existing : nt;
                });
                const completedCount = mergedTasks.filter(t => t.completed).length;
                const newProgress = mergedTasks.length > 0 ? Math.round((completedCount / mergedTasks.length) * 100) : item.progress;
                return { ...item, tasks: mergedTasks, progress: newProgress };
              }
              return item;
            });
            setProgressData(updated);
            closeModal();
          }} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Marco</label>
              <p className="text-sm text-white font-bold">{(editingItem as ProgressItem)?.name}</p>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Atividades Detalhadas (separadas por vírgula)</label>
              <textarea 
                name="tasks" 
                defaultValue={(editingItem as ProgressItem)?.tasks?.map(t => t.text).join(', ')}
                placeholder="Ex: Limpeza, Nivelamento, Marcação" 
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-emerald-500/50" 
                rows={5} 
              />
            </div>
            <button type="submit" className="w-full py-3 bg-emerald-500 rounded-lg text-xs font-bold text-white hover:bg-emerald-600 transition-colors">
              Salvar Detalhamento
            </button>
          </form>
        );
      case 'contract':
        return (
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const newContract: Contract = {
              company: formData.get('company') as string,
              scope: formData.get('scope') as string,
              contract: formData.get('contract') as string,
              value: formData.get('value') as string,
              deadline: formData.get('deadline') as string,
              warranty: formData.get('warranty') as string,
            };
            if (editingItem) {
              setContracts(prev => prev.map((item, i) => i === editingItem.index ? newContract : item));
            } else {
              setContracts([...contracts, newContract]);
            }
            closeModal();
          }} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Empresa</label>
              <select name="company" defaultValue={editingItem?.company} required className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-emerald-500/50">
                <option value="" disabled>Selecione uma empresa</option>
                {companies.map((c, i) => (
                  <option key={i} value={c.name} className="bg-[#1C1F26]">{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Escopo</label>
              <input name="scope" defaultValue={editingItem?.scope} required className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-emerald-500/50" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Contrato Assinado?</label>
                <select name="contract" defaultValue={editingItem?.contract || 'Sim'} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-emerald-500/50">
                  <option value="Sim" className="bg-[#1C1F26]">Sim</option>
                  <option value="Não" className="bg-[#1C1F26]">Não</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Valor</label>
                <input name="value" defaultValue={editingItem?.value} placeholder="R$ 0,00" required className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-emerald-500/50" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Prazo</label>
                <input name="deadline" defaultValue={editingItem?.deadline} placeholder="Ex: 30 dias" required className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-emerald-500/50" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Garantia</label>
                <input name="warranty" defaultValue={editingItem?.warranty} placeholder="Ex: 5 anos" required className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-emerald-500/50" />
              </div>
            </div>
            <button type="submit" className="w-full py-3 bg-emerald-500 rounded-lg text-xs font-bold text-white hover:bg-emerald-600 transition-colors">
              {editingItem ? 'Salvar Alterações' : 'Cadastrar Contrato'}
            </button>
          </form>
        );
      case 'company':
        return (
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const newCompany: Company = {
              name: formData.get('name') as string,
              cnpj: formData.get('cnpj') as string,
              contact: formData.get('contact') as string,
              email: formData.get('email') as string,
              phone: formData.get('phone') as string,
              type: formData.get('type') as string,
            };

            if (editingItem) {
              setCompanies(prev => prev.map((item, i) => i === editingItem.index ? newCompany : item));
            } else {
              setCompanies([...companies, newCompany]);
            }
            closeModal();
          }} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Nome da Empresa</label>
              <input name="name" defaultValue={editingItem?.name} required className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-emerald-500/50" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">CNPJ</label>
                <input name="cnpj" defaultValue={editingItem?.cnpj} required className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-emerald-500/50" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Tipo</label>
                <select name="type" defaultValue={editingItem?.type || 'Fornecedor'} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-emerald-500/50">
                  <option value="Construtora" className="bg-[#1C1F26]">Construtora</option>
                  <option value="Subempreiteiro" className="bg-[#1C1F26]">Subempreiteiro</option>
                  <option value="Fornecedor" className="bg-[#1C1F26]">Fornecedor</option>
                  <option value="Arquitetura" className="bg-[#1C1F26]">Arquitetura</option>
                  <option value="Topografia" className="bg-[#1C1F26]">Topografia</option>
                  <option value="Cliente" className="bg-[#1C1F26]">Cliente</option>
                  <option value="Outro" className="bg-[#1C1F26]">Outro</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Pessoa de Contato</label>
              <input name="contact" defaultValue={editingItem?.contact} required className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-emerald-500/50" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">E-mail</label>
                <input name="email" type="email" defaultValue={editingItem?.email} required className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-emerald-500/50" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Telefone</label>
                <input name="phone" defaultValue={editingItem?.phone} required className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-emerald-500/50" />
              </div>
            </div>
            <button type="submit" className="w-full py-3 bg-emerald-500 rounded-lg text-xs font-bold text-white hover:bg-emerald-600 transition-colors">
              {editingItem ? 'Salvar Alterações' : 'Cadastrar Empresa'}
            </button>
          </form>
        );
      default:
        return <p className="text-zinc-500 text-xs italic">Formulário em desenvolvimento...</p>;
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalType(null);
    setEditingItem(null);
  };

  const handleToggleTask = (milestoneName: string, taskIndex: number) => {
    setProgressData(prev => prev.map(item => {
      if (item.name === milestoneName && item.tasks) {
        const newTasks = item.tasks.map((task, idx) => 
          idx === taskIndex ? { ...task, completed: !task.completed } : task
        );
        const completedCount = newTasks.filter(t => t.completed).length;
        const newProgress = Math.round((completedCount / newTasks.length) * 100);
        return { ...item, tasks: newTasks, progress: newProgress };
      }
      return item;
    }));
  };

  const handleDeleteMilestone = (milestoneName: string) => {
    setProgressData(prev => prev.map(item => 
      item.name === milestoneName ? { ...item, isMilestone: false } : item
    ));
  };

  const handleDeleteContract = (index: number) => {
    if (window.confirm('Tem certeza que deseja excluir este contrato?')) {
      setContracts(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleDeleteCompany = (index: number) => {
    if (window.confirm('Tem certeza que deseja excluir esta empresa?')) {
      setCompanies(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleDeleteLegalDoc = (index: number) => {
    if (window.confirm('Tem certeza que deseja excluir esta licença?')) {
      setLegalDocs(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleDeleteTechProject = (index: number) => {
    if (window.confirm('Tem certeza que deseja excluir este projeto?')) {
      setTechProjects(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleDeleteFinancial = (index: number) => {
    if (window.confirm('Tem certeza que deseja excluir este lançamento financeiro?')) {
      setFinancialEntries(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleDeleteRisk = (index: number) => {
    if (window.confirm('Tem certeza que deseja excluir este risco?')) {
      setRisks(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleDeleteTeam = (index: number) => {
    if (window.confirm('Tem certeza que deseja excluir este membro da equipe?')) {
      setTeam(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleDeleteMaterial = (index: number) => {
    if (window.confirm('Tem certeza que deseja excluir esta requisição de material?')) {
      setMaterials(prev => prev.filter((_, i) => i !== index));
    }
  };

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard': return <DashboardView progressData={progressData} alerts={alerts} onViewChange={setActiveView} companies={companies} onAddTap={() => openModal('tap')} selectedTap={selectedTap} taps={taps} onSelectTap={setSelectedTap} legalDocs={legalDocs} />;
      case 'tap': return <TAPView taps={taps} onAdd={() => openModal('tap')} onEdit={(tap) => openModal('tap', tap)} selectedTap={selectedTap} onSelectTap={setSelectedTap} />;
      case 'cronograma': return <CronogramaView progressData={progressData} onAdd={() => openModal('milestone')} onDetail={(item) => openModal('milestone_detail', item)} onToggleTask={handleToggleTask} onDelete={handleDeleteMilestone} selectedTap={selectedTap} taps={taps} onSelectTap={setSelectedTap} />;
      case 'equipe': return <EquipeView team={team} onAdd={() => openModal('team')} onEdit={(item, index) => openModal('team', { ...item, index })} onDelete={handleDeleteTeam} />;
      case 'materiais': return <MateriaisView materials={materials} onAdd={() => openModal('material')} onEdit={(item, index) => openModal('material', { ...item, index })} onDelete={handleDeleteMaterial} />;
      case 'financeiro': return (
        <FinanceiroView 
          financialEntries={financialEntries} 
          onAdd={() => openModal('financial')} 
          onEdit={(item, index) => openModal('financial', { ...item, index })}
          onDelete={handleDeleteFinancial}
        />
      );
      case 'contratos': return (
        <ContratosView 
          contracts={contracts} 
          onAdd={() => openModal('contract')} 
          onEdit={(item, index) => openModal('contract', { ...item, index })}
          onDelete={handleDeleteContract} 
        />
      );
      case 'empresas': return (
        <EmpresasView 
          companies={companies} 
          onAdd={() => openModal('company')} 
          onEdit={(item, index) => openModal('company', { ...item, index })}
          onDelete={handleDeleteCompany} 
        />
      );
      case 'documentacao': return (
        <DocumentacaoView 
          legalDocs={legalDocs} 
          techProjects={techProjects} 
          onAddLegal={() => openModal('legal_doc')} 
          onAddTech={() => openModal('tech_project')}
          onEditLegal={(item, index) => openModal('legal_doc', { ...item, index })}
          onDeleteLegal={handleDeleteLegalDoc}
          onEditTech={(item, index) => openModal('tech_project', { ...item, index })}
          onDeleteTech={handleDeleteTechProject}
        />
      );
      case 'riscos': return (
        <RiscosView 
          risks={risks} 
          onAdd={() => openModal('risk')} 
          onEdit={(item, index) => openModal('risk', { ...item, index })}
          onDelete={handleDeleteRisk}
          selectedTap={selectedTap}
          taps={taps}
          onSelectTap={setSelectedTap}
        />
      );
      case 'rdo': return <RDOView rdos={rdos} onAdd={() => openModal('rdo')} />;
      case 'qualidade': return <QualidadeView nonConformities={nonConformities} onAdd={() => openModal('quality')} />;
      default: return <DashboardView progressData={progressData} alerts={alerts} onViewChange={setActiveView} companies={companies} onAddTap={() => openModal('tap')} selectedTap={selectedTap} taps={taps} onSelectTap={setSelectedTap} legalDocs={legalDocs} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#121418] text-zinc-300 font-sans flex">
      <Sidebar activeView={activeView} onViewChange={setActiveView} />
      
      <div className="flex-1 ml-64 min-h-screen flex flex-col">
        <Header />
        
        <main className="flex-1 p-8 max-w-5xl mx-auto w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </main>

        <footer className="px-8 py-6 border-t border-white/5 text-center">
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">
            VP CONSTRUTORA • Última atualização: {new Date().toLocaleDateString('pt-BR')}
          </p>
        </footer>
      </div>

      {/* Modal System */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-[#1C1F26] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-white/5">
                <h3 className="text-sm font-bold text-white uppercase tracking-widest">
                  {modalType === 'progress' ? 'Atualizar Progresso' : 
                   modalType === 'team' ? 'Novo Membro' :
                   modalType === 'material' ? 'Solicitar Material' :
                   modalType === 'financial' ? (editingItem ? 'Editar Lançamento' : 'Lançar Pagamento') :
                   modalType === 'contract' ? (editingItem ? 'Editar Contrato' : 'Novo Contrato') :
                   modalType === 'risk' ? (editingItem ? 'Editar Risco' : 'Novo Risco') :
                   modalType === 'rdo' ? 'Novo RDO' :
                   modalType === 'quality' ? 'Registrar Não Conformidade' :
                   modalType === 'milestone' ? 'Vincular ao Cronograma' :
                   modalType === 'milestone_detail' ? 'Detalhamento do Marco' :
                   modalType === 'legal_doc' ? (editingItem ? 'Editar Licença' : 'Nova Licença') :
                   modalType === 'tech_project' ? (editingItem ? 'Editar Projeto' : 'Novo Projeto') :
                   modalType === 'photo' ? 'Adicionar Registro' : 'Novo Item'}
                </h3>
                <button onClick={closeModal} className="text-zinc-500 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>
              <div className="p-6">
                {renderModalContent()}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
