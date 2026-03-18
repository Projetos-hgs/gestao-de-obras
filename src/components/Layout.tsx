import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Clock, History, Users, Package, Wallet,
  FileSignature, Building2, FileText, ShieldAlert, Award,
  FileCheck, TrendingUp, MoreHorizontal
} from 'lucide-react';
import type { NavItem } from '../types';

export const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard',    label: 'Dashboard',    icon: LayoutDashboard, category: 'VISÃO GERAL', path: '/' },
  { id: 'tap',          label: 'TAP',           icon: FileCheck,       category: 'VISÃO GERAL', path: '/tap' },
  { id: 'cronograma',   label: 'Cronograma',    icon: Clock,           category: 'VISÃO GERAL', path: '/cronograma' },
  { id: 'rdo',          label: 'RDO',           icon: History,         category: 'EXECUÇÃO',    path: '/rdo' },
  { id: 'equipe',       label: 'Equipe e MO',   icon: Users,           category: 'EXECUÇÃO',    path: '/equipe' },
  { id: 'materiais',    label: 'Materiais',     icon: Package,         category: 'EXECUÇÃO',    path: '/materiais' },
  { id: 'financeiro',   label: 'Financeiro',    icon: Wallet,          category: 'GESTÃO',      path: '/financeiro' },
  { id: 'contratos',    label: 'Contratos',     icon: FileSignature,   category: 'GESTÃO',      path: '/contratos' },
  { id: 'empresas',     label: 'Empresas',      icon: Building2,       category: 'GESTÃO',      path: '/empresas' },
  { id: 'documentacao', label: 'Documentação',  icon: FileText,        category: 'GESTÃO',      path: '/documentacao' },
  { id: 'riscos',       label: 'Riscos',        icon: ShieldAlert,     category: 'CONTROLE',    path: '/riscos' },
  { id: 'qualidade',    label: 'Qualidade',     icon: Award,           category: 'CONTROLE',    path: '/qualidade' },
];

export function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const categories = Array.from(new Set(NAV_ITEMS.map(i => i.category)));
  const activeId = NAV_ITEMS.find(item =>
    item.path === '/' ? location.pathname === '/' : location.pathname.startsWith(item.path)
  )?.id || 'dashboard';

  return (
    <aside className="w-64 bg-[#0F1115] border-r border-white/5 flex flex-col h-screen fixed left-0 top-0 z-50">
      <div className="p-6 border-b border-white/5">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <TrendingUp size={16} className="text-white" />
          </div>
          <h1 className="font-bold text-white text-base tracking-tight">Gestor de Obras</h1>
        </div>
        <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider mt-1">VP Construtora</p>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {categories.map(cat => (
          <div key={cat}>
            <h3 className="px-3 text-[9px] font-bold text-zinc-600 uppercase tracking-[0.2em] mb-1.5">{cat}</h3>
            {NAV_ITEMS.filter(i => i.category === cat).map(item => (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-150 group ${
                  activeId === item.id
                    ? 'bg-blue-600/15 text-blue-400'
                    : 'text-zinc-500 hover:text-zinc-200 hover:bg-white/5'
                }`}
              >
                <item.icon
                  size={15}
                  className={activeId === item.id ? 'text-blue-400' : 'text-zinc-600 group-hover:text-zinc-300'}
                />
                <span className="text-xs font-medium">{item.label}</span>
                {activeId === item.id && (
                  <span className="ml-auto w-1 h-4 bg-blue-500 rounded-full" />
                )}
              </button>
            ))}
          </div>
        ))}
      </nav>
    </aside>
  );
}

export function Header() {
  const today = new Date().toLocaleDateString('pt-BR', {
    weekday: 'short', day: '2-digit', month: 'short', year: 'numeric'
  });

  return (
    <header className="h-16 border-b border-white/5 bg-[#0F1115]/80 backdrop-blur px-8 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <div className="px-3 py-1.5 bg-blue-600/10 border border-blue-500/20 rounded-lg">
          <p className="text-[9px] font-bold text-blue-500 uppercase tracking-wider">CNO</p>
          <p className="text-[11px] font-bold text-blue-300">90.027.49566/77</p>
        </div>
        <div className="hidden md:block">
          <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-wider">Localização</p>
          <p className="text-xs font-medium text-zinc-400">Av. Belém do São Francisco • Boa Vista</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-lg">
          <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
          <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">Em andamento</span>
        </div>
        <p className="text-xs text-zinc-500 hidden md:block">{today}</p>
        <button className="p-2 text-zinc-600 hover:text-zinc-300 transition-colors rounded-lg hover:bg-white/5">
          <MoreHorizontal size={18} />
        </button>
      </div>
    </header>
  );
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}
export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h2 className="text-xl font-bold text-white text-balance">{title}</h2>
        {subtitle && <p className="text-xs text-zinc-500 mt-0.5">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="bg-[#1C1F26] border border-white/5 rounded-xl p-12 text-center">
      <p className="text-zinc-600 text-sm">{message}</p>
    </div>
  );
}

interface StatusBadgeProps { status: string }
export function StatusBadge({ status }: StatusBadgeProps) {
  const map: Record<string, string> = {
    'Ativo': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    'Inativo': 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
    'Aprovado': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    'Pendente': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    'Em vigor': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    'Encerrado': 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
    'Recebido': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    'Pago': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    'Aberto': 'bg-red-500/10 text-red-400 border-red-500/20',
    'Resolvido': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    'Em andamento': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    'Cancelado': 'bg-red-500/10 text-red-400 border-red-500/20',
  };
  const cls = map[status] || 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${cls}`}>
      {status}
    </span>
  );
}
