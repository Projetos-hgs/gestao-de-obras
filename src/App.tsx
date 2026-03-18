/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
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
import { api } from './lib/api';

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
  path: string;
}

interface Company {
  id?: string;
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
  id?: string;
  text: string;
  type: 'error' | 'warning' | 'info';
  icon: any;
  projectName?: string;
}

interface TeamMember {
  id?: string;
  name: string;
  role: string;
  company: string;
  status: string;
  projectName?: string;
}

interface Material {
  id?: string;
  name: string;
  req: string;
  rec: string;
  unit: string;
  vendor: string;
  status: string;
  projectName?: string;
}

interface FinancialEntry {
  id?: string;
  company: string;
  service: string;
  value: string;
  form: string;
  deadline: string;
  status: string;
  projectName?: string;
}

interface Contract {
  id?: string;
  company: string;
  scope: string;
  contract: string;
  value: string;
  deadline: string;
  warranty: string;
  projectName?: string;
}

interface LegalDocument {
  id?: string;
  doc: string;
  org: string;
  req: string;
  sent: string;
  app: string;
  status: string;
  projectName?: string;
}

interface TechnicalProject {
  id?: string;
  proj: string;
  resp: string;
  ver: string;
  date: string;
  obs: string;
  status: string;
  projectName?: string;
}

interface Risk {
  id?: string;
  level: 'ALTO' | 'MEDIO' | 'BAIXO';
  title: string;
  desc: string;
  color: string;
  projectName?: string;
}

interface RDO {
  id?: string;
  date: string;
  description: string;
  weather: string;
  workers: number;
  projectName?: string;
}

interface NonConformity {
  id?: string;
  item: string;
  description: string;
  responsible: string;
  deadline: string;
  status: string;
  projectName?: string;
}

interface TAPData {
  id?: string;
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
  cno?: string;
  location?: string;
  status?: string;
}

// --- Constants & Data ---

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, category: 'VISÃO GERAL', path: '/' },
  { id: 'tap', label: 'TAP', icon: FileCheck, category: 'VISÃO GERAL', path: '/tap' },
  { id: 'cronograma', label: 'Cronograma', icon: Clock, category: 'VISÃO GERAL', path: '/cronograma' },
  
  { id: 'rdo', label: 'RDO', icon: History, category: 'EXECUÇÃO', path: '/rdo' },
  { id: 'equipe', label: 'Equipe e MO', icon: Users, category: 'EXECUÇÃO', path: '/equipe' },
  { id: 'materiais', label: 'Materiais', icon: Package, category: 'EXECUÇÃO', path: '/materiais' },
  
  { id: 'financeiro', label: 'Financeiro', icon: Wallet, category: 'GESTÃO', path: '/financeiro' },
  { id: 'contratos', label: 'Contratos', icon: FileSignature, category: 'GESTÃO', path: '/contratos' },
  { id: 'empresas', label: 'Empresas', icon: Building2, category: 'GESTÃO', path: '/empresas' },
  { id: 'documentacao', label: 'Documentação', icon: FileText, category: 'GESTÃO', path: '/documentacao' },
  
  { id: 'riscos', label: 'Riscos', icon: ShieldAlert, category: 'CONTROLE', path: '/riscos' },
  { id: 'qualidade', label: 'Qualidade', icon: Award, category: 'CONTROLE', path: '/qualidade' },
];

// --- Sidebar Component ---
const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const categories = Array.from(new Set(NAV_ITEMS.map(i => i.category)));

  const activeView = NAV_ITEMS.find(item => item.path === location.pathname)?.id || 'dashboard';

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
                onClick={() => navigate(item.path)}
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

// --- Header Component ---
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

// --- Main App Component ---
export default function App() {
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Simular carregamento inicial
    setTimeout(() => setLoading(false), 300);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#121418] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-zinc-500 text-sm">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#121418] text-zinc-300 font-sans flex">
      <Sidebar />
      
      <div className="flex-1 ml-64 min-h-screen flex flex-col">
        <Header />
        
        <main className="flex-1 p-8 max-w-7xl mx-auto w-full">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/tap" element={<TAPPage />} />
            <Route path="/cronograma" element={<CronogramaPage />} />
            <Route path="/rdo" element={<RDOPage />} />
            <Route path="/equipe" element={<EquipePage />} />
            <Route path="/materiais" element={<MateriaisPage />} />
            <Route path="/financeiro" element={<FinanceiroPage />} />
            <Route path="/contratos" element={<ContratosPage />} />
            <Route path="/empresas" element={<EmpresasPage />} />
            <Route path="/documentacao" element={<DocumentacaoPage />} />
            <Route path="/riscos" element={<RiscosPage />} />
            <Route path="/qualidade" element={<QualidadePage />} />
          </Routes>
        </main>

        <footer className="px-8 py-6 border-t border-white/5 text-center">
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">
            VP CONSTRUTORA • Última atualização: {new Date().toLocaleDateString('pt-BR')}
          </p>
        </footer>
      </div>
    </div>
  );
}

// --- Pages (Placeholders for now) ---
const DashboardPage = () => (
  <div className="space-y-6 animate-in fade-in duration-500">
    <h2 className="text-2xl font-bold text-white">Dashboard</h2>
    <p className="text-zinc-400">Integração com banco de dados em desenvolvimento...</p>
  </div>
);

const TAPPage = () => (
  <div className="space-y-6 animate-in fade-in duration-500">
    <h2 className="text-2xl font-bold text-white">TAP - Termo de Abertura do Projeto</h2>
    <p className="text-zinc-400">Integração com banco de dados em desenvolvimento...</p>
  </div>
);

const CronogramaPage = () => (
  <div className="space-y-6 animate-in fade-in duration-500">
    <h2 className="text-2xl font-bold text-white">Cronograma</h2>
    <p className="text-zinc-400">Integração com banco de dados em desenvolvimento...</p>
  </div>
);

const RDOPage = () => (
  <div className="space-y-6 animate-in fade-in duration-500">
    <h2 className="text-2xl font-bold text-white">RDO - Relatório Diário de Obra</h2>
    <p className="text-zinc-400">Integração com banco de dados em desenvolvimento...</p>
  </div>
);

const EquipePage = () => (
  <div className="space-y-6 animate-in fade-in duration-500">
    <h2 className="text-2xl font-bold text-white">Equipe e Mão de Obra</h2>
    <p className="text-zinc-400">Integração com banco de dados em desenvolvimento...</p>
  </div>
);

const MateriaisPage = () => (
  <div className="space-y-6 animate-in fade-in duration-500">
    <h2 className="text-2xl font-bold text-white">Materiais</h2>
    <p className="text-zinc-400">Integração com banco de dados em desenvolvimento...</p>
  </div>
);

const FinanceiroPage = () => (
  <div className="space-y-6 animate-in fade-in duration-500">
    <h2 className="text-2xl font-bold text-white">Financeiro</h2>
    <p className="text-zinc-400">Integração com banco de dados em desenvolvimento...</p>
  </div>
);

const ContratosPage = () => (
  <div className="space-y-6 animate-in fade-in duration-500">
    <h2 className="text-2xl font-bold text-white">Contratos</h2>
    <p className="text-zinc-400">Integração com banco de dados em desenvolvimento...</p>
  </div>
);

const EmpresasPage = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    try {
      const data = await api.companies.list();
      setCompanies(data);
    } catch (error) {
      console.error('[v0] Erro ao carregar empresas:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <h2 className="text-2xl font-bold text-white">Empresas</h2>
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Empresas</h2>
        <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-xs font-bold text-white transition-all">
          <Plus size={14} /> Nova Empresa
        </button>
      </div>

      {companies.length === 0 ? (
        <div className="bg-[#1C1F26] border border-white/5 rounded-xl p-12 text-center">
          <p className="text-zinc-500">Nenhuma empresa cadastrada.</p>
        </div>
      ) : (
        <div className="bg-[#1C1F26] border border-white/5 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest border-b border-white/5">
                <th className="px-6 py-4 text-left">Empresa</th>
                <th className="px-6 py-4 text-left">CNPJ</th>
                <th className="px-6 py-4 text-left">Contato</th>
                <th className="px-6 py-4 text-left">Tipo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {companies.map((company) => (
                <tr key={company.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 text-sm font-bold text-zinc-200">{company.name}</td>
                  <td className="px-6 py-4 text-xs text-zinc-400">{company.cnpj}</td>
                  <td className="px-6 py-4 text-xs text-zinc-400">{company.contact}</td>
                  <td className="px-6 py-4 text-xs text-zinc-400">{company.type}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const DocumentacaoPage = () => (
  <div className="space-y-6 animate-in fade-in duration-500">
    <h2 className="text-2xl font-bold text-white">Documentação</h2>
    <p className="text-zinc-400">Integração com banco de dados em desenvolvimento...</p>
  </div>
);

const RiscosPage = () => (
  <div className="space-y-6 animate-in fade-in duration-500">
    <h2 className="text-2xl font-bold text-white">Riscos</h2>
    <p className="text-zinc-400">Integração com banco de dados em desenvolvimento...</p>
  </div>
);

const QualidadePage = () => (
  <div className="space-y-6 animate-in fade-in duration-500">
    <h2 className="text-2xl font-bold text-white">Controle de Qualidade</h2>
    <p className="text-zinc-400">Integração com banco de dados em desenvolvimento...</p>
  </div>
);
