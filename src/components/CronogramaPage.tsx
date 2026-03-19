import React, { useState, useEffect } from 'react';
import { Plus, Trash2, FileText, Briefcase, TrendingUp } from 'lucide-react';
import { api } from '../lib/api';
import { LoadingSpinner, EmptyState } from './Layout';
import type { ScheduleItem, Project, Contract, LegalDocument } from '../types';

/* ── helpers ── */
function progressColor(p: number): string {
  if (p >= 70) return '#22d3a0';
  if (p >= 30) return '#f59e0b';
  return '#6366f1';
}

function progressTextColor(p: number): string {
  if (p >= 70) return 'text-emerald-400';
  if (p >= 30) return 'text-amber-400';
  return 'text-indigo-400';
}

function fmtDate(d?: string) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('pt-BR');
}

function fmtBudget(v?: string) {
  if (!v) return '—';
  const n = parseFloat(v.replace(/[^\d.]/g, ''));
  if (isNaN(n)) return v;
  if (n >= 1_000_000) return `R$ ${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `R$ ${(n / 1_000).toFixed(0)}K`;
  return `R$ ${n.toFixed(0)}`;
}

const inputCls =
  'bg-[#121418] border border-white/10 rounded-lg px-3 py-2 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-blue-500/50 transition-colors w-full';

/* ── KPI card ── */
function KpiCard({ label, value, sub, accent }: {
  label: string; value: string; sub?: string; accent?: string;
}) {
  return (
    <div className="rounded-xl p-4 flex flex-col gap-1 border border-white/5" style={{ background: '#181B22' }}>
      <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">{label}</p>
      <p className={`text-2xl font-black leading-none ${accent ?? 'text-white'}`}>{value}</p>
      {sub && <p className="text-[10px] text-zinc-600 mt-0.5">{sub}</p>}
    </div>
  );
}

/* ── Progress row ── */
function ProgressRow({ item, onUpdate, onDelete }: {
  item: ScheduleItem;
  onUpdate: (id: string, progress: number) => void;
  onDelete: (id: string) => void;
}) {
  const color = progressColor(item.progress);
  const textCls = progressTextColor(item.progress);

  return (
    <div className="flex items-center gap-4 px-4 py-3 border-b border-white/5 last:border-0 group hover:bg-white/[0.02] transition-colors">
      <span className="text-sm text-zinc-200 font-medium w-52 flex-shrink-0 truncate">{item.name}</span>
      <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${item.progress}%`, backgroundColor: color }}
        />
      </div>
      <span className={`text-xs font-bold w-10 text-right flex-shrink-0 ${textCls}`}>
        {item.progress}%
      </span>
      <input
        type="range" min={0} max={100}
        value={item.progress}
        onChange={e => onUpdate(item.id, Number(e.target.value))}
        className="w-20 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
        style={{ accentColor: color }}
      />
      <button
        onClick={() => onDelete(item.id)}
        className="opacity-0 group-hover:opacity-100 transition-opacity text-zinc-600 hover:text-red-400 flex-shrink-0"
      >
        <Trash2 size={12} />
      </button>
    </div>
  );
}

/* ── Status badge ── */
function StatusBadge({ status }: { status: string }) {
  const s = (status ?? '').toLowerCase();
  let cls = 'bg-zinc-500/15 text-zinc-400 border-zinc-500/30';
  let label = status;

  if (s === 'emitido' || s === 'aprovado') {
    cls = 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
  } else if (s.includes('rrt')) {
    cls = 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'; label = 'COM RRT';
  } else if (s.includes('art')) {
    cls = 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'; label = 'COM ART';
  } else if (s === 'em elaboração' || s === 'elaboracao' || s === 'em elaboracao') {
    cls = 'bg-amber-500/15 text-amber-400 border-amber-500/30'; label = 'EM ELABORAÇÃO';
  } else if (s.includes('boleto')) {
    cls = 'bg-red-500/15 text-red-400 border-red-500/30'; label = 'AG. BOLETO PAGAMENTO';
  } else if (s.includes('envio')) {
    cls = 'bg-red-500/15 text-red-400 border-red-500/30'; label = 'AG. ENVIO DO PROJETO';
  } else if (s.includes('aguardando')) {
    cls = 'bg-blue-500/15 text-blue-400 border-blue-500/30'; label = 'AGUARDANDO ÓRGÃO';
  } else if (s === 'pendente') {
    cls = 'bg-amber-500/15 text-amber-400 border-amber-500/30'; label = 'PENDENTE';
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${cls}`}>
      {label}
    </span>
  );
}

/* ══════════════════════════════════════════════════════════════ */
export function CronogramaPage() {
  const [projects, setProjects]   = useState<Project[]>([]);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [project, setProject]     = useState<Project | null>(null);
  const [items, setItems]         = useState<ScheduleItem[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [legalDocs, setLegalDocs] = useState<LegalDocument[]>([]);
  const [techDocs, setTechDocs]   = useState<any[]>([]);
  const [loading, setLoading]     = useState(true);
  const [activeTab, setActiveTab] = useState<'progress' | 'docs' | 'contracts'>('progress');
  const [adding, setAdding]       = useState(false);
  const [newItem, setNewItem]     = useState({ name: '', progress: 0 });

  /* carrega lista de projetos */
  useEffect(() => {
    api.projects.list()
      .then(projs => {
        setProjects(projs);
        if (projs.length > 0) setProjectId(String(projs[0].id));
        else setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  /* carrega dados do projeto selecionado */
  useEffect(() => {
    if (!projectId) return;
    setLoading(true);
    Promise.all([
      api.projects.get(projectId),
      api.schedule.list(projectId),
      api.contracts.list(projectId),
      api.legalDocs.list(projectId),
      api.technicalProjects.list(projectId),
    ])
      .then(([proj, sched, contr, legal, tech]) => {
        setProject(proj);
        setItems(sched);
        setContracts(contr);
        setLegalDocs(legal);
        setTechDocs(tech);
      })
      .catch(err => console.error('[v0]', err))
      .finally(() => setLoading(false));
  }, [projectId]);

  async function addItem() {
    if (!projectId || !newItem.name.trim()) return;
    try {
      await api.schedule.create(projectId, { ...newItem, color: 'bg-blue-500', is_milestone: false, sort_order: items.length });
      const data = await api.schedule.list(projectId);
      setItems(data);
      setNewItem({ name: '', progress: 0 });
      setAdding(false);
    } catch (err) { console.error('[v0]', err); }
  }

  async function updateProgress(id: string, progress: number) {
    const item = items.find(i => i.id === id);
    if (!item) return;
    try {
      await api.schedule.update(id, { ...item, progress });
      setItems(prev => prev.map(i => i.id === id ? { ...i, progress } : i));
    } catch (err) { console.error('[v0]', err); }
  }

  async function deleteItem(id: string) {
    try {
      await api.schedule.delete(id);
      setItems(prev => prev.filter(i => i.id !== id));
    } catch (err) { console.error('[v0]', err); }
  }

  /* ── KPI derivados ── */
  const pendingDocs = legalDocs.filter(d => {
    const s = (d.status ?? '').toLowerCase();
    return s !== 'aprovado' && s !== 'emitido';
  }).length;

  const biggestContract = contracts.reduce((max, c) => {
    const v = parseFloat(String(c.value).replace(/[^\d.]/g, '')) || 0;
    const m = parseFloat(String((max as any).value ?? '0').replace(/[^\d.]/g, '')) || 0;
    return v > m ? c : max;
  }, {} as any);

  const currentPhase = items.find(i => i.progress > 0 && i.progress < 100)
    ?? items.find(i => i.progress === 0)
    ?? null;

  const phases = items.slice(0, 3);

  const tabs = [
    { id: 'progress' as const,  label: 'Progresso físico', icon: TrendingUp },
    { id: 'docs' as const,      label: 'Documentação',     icon: FileText },
    { id: 'contracts' as const, label: 'Contratos',        icon: Briefcase },
  ];

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">

      {/* ── Seletor de projeto ── */}
      {projects.length > 1 && (
        <div className="flex items-center gap-3">
          <label className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Projeto</label>
          <select
            value={projectId ?? ''}
            onChange={e => setProjectId(e.target.value)}
            className="bg-[#1C1F26] border border-white/10 rounded-lg px-3 py-1.5 text-sm text-zinc-200 focus:outline-none focus:border-blue-500/50"
          >
            {projects.map(p => (
              <option key={p.id} value={p.id} className="bg-[#1C1F26]">{p.name}</option>
            ))}
          </select>
        </div>
      )}

      {/* ── Header do projeto ── */}
      <div className="bg-[#181B22] border border-white/5 rounded-xl p-6">
        <div className="flex items-start justify-between gap-4 mb-1">
          <div>
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">VP Construtora</p>
            <h1 className="text-3xl font-black text-white leading-tight">
              {project?.name
                ? project.name.split(' ').map((word, i) =>
                    i === 0
                      ? <span key={i} className="text-white">{word} </span>
                      : <span key={i} className="text-emerald-400">{word} </span>
                  )
                : 'Cronograma'
              }
            </h1>
            <p className="text-xs text-zinc-500 mt-1.5 flex flex-wrap gap-x-4 gap-y-1">
              {project?.cno        && <span>CNO {project.cno}</span>}
              {project?.start_date && <span>Início: {fmtDate(project.start_date)}</span>}
              {project?.area       && <span>Área: {project.area}</span>}
              {project?.manager    && <span>Resp: {project.manager}</span>}
            </p>
          </div>
          <span className="px-3 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 flex-shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            {project?.status ?? 'Em andamento'}
          </span>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mt-5">
          <KpiCard
            label="Etapa Atual"
            value={currentPhase?.name ?? '—'}
            sub={currentPhase ? `${currentPhase.progress}% concluído` : 'Nenhuma etapa'}
          />
          {phases.map(ph => (
            <KpiCard
              key={ph.id}
              label={ph.name}
              value={`${ph.progress}%`}
              sub={ph.progress >= 100 ? 'Concluído' : ph.progress > 0 ? 'Em andamento' : 'Não iniciado'}
              accent={progressTextColor(ph.progress)}
            />
          ))}
          {phases.length < 3 && Array.from({ length: 3 - phases.length }).map((_, i) => (
            <KpiCard key={`empty-${i}`} label="—" value="—" />
          ))}
          <KpiCard
            label="Maior Contrato"
            value={biggestContract?.value ? fmtBudget(String(biggestContract.value)) : '—'}
            sub={biggestContract?.company ?? 'Nenhum contrato'}
          />
          <KpiCard
            label="Docs Pendentes"
            value={String(pendingDocs)}
            sub={pendingDocs > 0 ? 'Aguardando aprovação' : 'Em dia'}
            accent={pendingDocs > 0 ? 'text-amber-400' : 'text-emerald-400'}
          />
        </div>
      </div>

      {/* ── Abas ── */}
      <div className="flex items-center gap-1 bg-[#181B22] border border-white/5 rounded-xl p-1 w-fit">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === tab.id ? 'bg-white/10 text-white' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <tab.icon size={13} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── ABA: Progresso físico ── */}
      {activeTab === 'progress' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
              Avanço Físico — {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }).toUpperCase()}
            </p>
            <button
              onClick={() => setAdding(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-xs text-zinc-300 transition-colors"
            >
              <Plus size={12} /> Nova etapa
            </button>
          </div>

          {/* Formulário de nova etapa */}
          {adding && (
            <div className="bg-[#181B22] border border-white/10 rounded-xl p-4 flex flex-wrap gap-3 items-end">
              <div className="flex-1 min-w-48">
                <label className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold block mb-1">Nome da etapa</label>
                <input
                  className={inputCls}
                  placeholder="Ex: Fundação"
                  value={newItem.name}
                  onChange={e => setNewItem(p => ({ ...p, name: e.target.value }))}
                  onKeyDown={e => e.key === 'Enter' && addItem()}
                  autoFocus
                />
              </div>
              <div className="w-28">
                <label className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold block mb-1">Progresso %</label>
                <input
                  type="number" min={0} max={100}
                  className={inputCls}
                  value={newItem.progress}
                  onChange={e => setNewItem(p => ({ ...p, progress: Number(e.target.value) }))}
                />
              </div>
              <div className="flex gap-2">
                <button onClick={addItem} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-xs font-bold text-white transition-colors">
                  Salvar
                </button>
                <button onClick={() => setAdding(false)} className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs text-zinc-400 transition-colors">
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {items.length === 0 ? (
            <EmptyState message="Nenhuma etapa cadastrada. Clique em 'Nova etapa' para começar." />
          ) : (
            <div className="bg-[#181B22] border border-white/5 rounded-xl overflow-hidden">
              {items.map(item => (
                <ProgressRow key={item.id} item={item} onUpdate={updateProgress} onDelete={deleteItem} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── ABA: Documentação ── */}
      {activeTab === 'docs' && (
        <div className="space-y-6">

          {/* Projetos Técnicos */}
          <div>
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3">
              Projetos Técnicos
            </p>
            {techDocs.length === 0 ? (
              <EmptyState message="Nenhum projeto técnico cadastrado." />
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {techDocs.map(doc => (
                  <div key={doc.id} className="bg-[#181B22] border border-white/5 hover:border-white/10 rounded-xl p-4 flex flex-col gap-2 transition-colors">
                    <p className="text-sm font-bold text-white leading-snug">{doc.name}</p>
                    <p className="text-[11px] text-zinc-500 leading-snug">
                      {doc.responsible}
                      {doc.version && ` · ${doc.version}`}
                      {doc.date && ` · ${fmtDate(doc.date)}`}
                    </p>
                    <div className="mt-auto pt-1">
                      <StatusBadge status={doc.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Licenças e Aprovações Legais */}
          <div>
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3">
              Licenças e Aprovações Legais
            </p>
            {legalDocs.length === 0 ? (
              <EmptyState message="Nenhum documento legal cadastrado." />
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {legalDocs.map(doc => (
                  <div key={doc.id} className="bg-[#181B22] border border-white/5 hover:border-white/10 rounded-xl p-4 flex flex-col gap-2 transition-colors">
                    <p className="text-sm font-bold text-white leading-snug">{doc.document}</p>
                    <p className="text-[11px] text-zinc-500 leading-snug">
                      {doc.organization}
                      {doc.sent_date && ` · enviado ${fmtDate(doc.sent_date)}`}
                    </p>
                    <div className="mt-auto pt-1">
                      <StatusBadge status={doc.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── ABA: Contratos ── */}
      {activeTab === 'contracts' && (
        <div className="bg-[#181B22] border border-white/5 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-white/5">
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Contratos</p>
          </div>
          {contracts.length === 0 ? (
            <EmptyState message="Nenhum contrato cadastrado." />
          ) : (
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-white/5">
                  {['Empresa', 'Escopo', 'Valor', 'Prazo', 'Status'].map(h => (
                    <th key={h} className="px-4 py-2.5 text-left text-[10px] font-bold text-zinc-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {contracts.map(c => (
                  <tr key={c.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                    <td className="px-4 py-3 text-zinc-200 font-medium">{c.company}</td>
                    <td className="px-4 py-3 text-zinc-400">{c.scope}</td>
                    <td className="px-4 py-3 text-zinc-300 font-semibold">{fmtBudget(String(c.value))}</td>
                    <td className="px-4 py-3 text-zinc-500">{fmtDate(c.deadline)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        c.status === 'ativo' || c.status === 'Ativo'
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : c.status === 'pendente' || c.status === 'Pendente'
                          ? 'bg-amber-500/10 text-amber-400'
                          : 'bg-zinc-500/10 text-zinc-400'
                      }`}>
                        {c.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

    </div>
  );
}
