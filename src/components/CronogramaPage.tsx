import React, { useState, useEffect } from 'react';
import {
  Plus, Trash2, Calendar, FileText, Briefcase,
  ChevronDown, TrendingUp, AlertTriangle, CheckCircle2,
} from 'lucide-react';
import { api } from '../lib/api';
import { LoadingSpinner, EmptyState } from './Layout';
import type { ScheduleItem, Project, Contract, LegalDocument } from '../types';

/* ── helpers ── */
function progressColor(p: number): string {
  if (p >= 70) return '#22d3a0';   // verde
  if (p >= 30) return '#f59e0b';   // laranja
  return '#6366f1';                // azul/roxo
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
function KpiCard({
  label, value, sub, accent,
}: { label: string; value: string; sub?: string; accent?: string }) {
  return (
    <div
      className="rounded-xl p-4 flex flex-col gap-1 border border-white/5"
      style={{ background: '#181B22' }}
    >
      <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">{label}</p>
      <p className={`text-2xl font-black leading-none ${accent ?? 'text-white'}`}>{value}</p>
      {sub && <p className="text-[10px] text-zinc-600 mt-0.5">{sub}</p>}
    </div>
  );
}

/* ── Progress row ── */
function ProgressRow({
  item, onUpdate, onDelete,
}: {
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
      {/* slider inline para ajustar */}
      <input
        type="range" min={0} max={100}
        value={item.progress}
        onChange={e => onUpdate(item.id, Number(e.target.value))}
        className="w-20 accent-blue-500 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
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

/* ══════════════════════════════════════════════════════════════ */
export function CronogramaPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [items, setItems] = useState<ScheduleItem[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [legalDocs, setLegalDocs] = useState<LegalDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'progress' | 'docs' | 'contracts'>('progress');
  const [adding, setAdding] = useState(false);
  const [newItem, setNewItem] = useState({ name: '', progress: 0 });

  /* carrega lista de projetos */
  useEffect(() => {
    api.projects.list().then(projs => {
      setProjects(projs);
      if (projs.length > 0) setProjectId(String(projs[0].id));
      else setLoading(false);
    }).catch(() => setLoading(false));
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
    ]).then(([proj, sched, contr, legal]) => {
      setProject(proj);
      setItems(sched);
      setContracts(contr);
      setLegalDocs(legal);
    }).catch(err => console.error('[v0]', err))
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
  const avgProgress = items.length
    ? Math.round(items.reduce((a, i) => a + (i.progress ?? 0), 0) / items.length)
    : 0;

  const pendingDocs = legalDocs.filter(d => d.status !== 'aprovado' && d.status !== 'Aprovado').length;
  const biggestContract = contracts.reduce((max, c) => {
    const v = parseFloat(String(c.value).replace(/[^\d.]/g, '')) || 0;
    const m = parseFloat(String(max.value ?? '0').replace(/[^\d.]/g, '')) || 0;
    return v > m ? c : max;
  }, {} as any);

  const currentPhase = items.find(i => i.progress > 0 && i.progress < 100)
    ?? items.find(i => i.progress === 0)
    ?? null;

  /* fases chave para os KPI cards (pega 3 primeiras com progresso) */
  const phases = items.slice(0, 3);

  if (loading) return <LoadingSpinner />;

  const tabs = [
    { id: 'progress' as const,   label: 'Progresso físico', icon: TrendingUp },
    { id: 'docs' as const,       label: 'Documentação',     icon: FileText },
    { id: 'contracts' as const,  label: 'Contratos',        icon: Briefcase },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">

      {/* ── Seletor de projeto (se houver mais de 1) ── */}
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
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">
              VP Construtora
            </p>
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
              {project?.cno && <span>CNO {project.cno}</span>}
              {project?.start_date && <span>Início: {fmtDate(project.start_date)}</span>}
              {project?.area && <span>Área: {project.area}</span>}
              {project?.manager && <span>Resp: {project.manager}</span>}
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
          {phases.map((ph, i) => (
            <KpiCard
              key={ph.id}
              label={ph.name}
              value={`${ph.progress}%`}
              sub={ph.progress >= 100 ? 'Concluído' : ph.progress > 0 ? 'Em andamento' : 'Não iniciado'}
              accent={progressTextColor(ph.progress)}
            />
          ))}
          {/* preenche KPIs restantes */}
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
            sub={pendingDocs > 0 ? 'Aguardando aprovação' : 'Documentação em dia'}
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
              activeTab === tab.id
                ? 'bg-white/10 text-white'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <tab.icon size={13} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── ABA: Progresso Físico ── */}
      {activeTab === 'progress' && (
        <div className="bg-[#181B22] border border-white/5 rounded-xl overflow-hidden">
          {/* sub-header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
              Avanço Físico — {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }).toUpperCase()}
            </p>
            <div className="flex items-center gap-3">
              <span className="text-xs text-zinc-400">
                Média: <span className="font-bold text-white">{avgProgress}%</span>
              </span>
              <button
                onClick={() => setAdding(v => !v)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 rounded-lg text-xs font-bold text-emerald-400 transition-all"
              >
                <Plus size={12} /> Nova Etapa
              </button>
            </div>
          </div>

          {/* form de adição */}
          {adding && (
            <div className="px-4 py-4 border-b border-blue-500/20 bg-blue-500/5 flex items-end gap-3 flex-wrap">
              <div className="flex flex-col gap-1 flex-1 min-w-40">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Nome da etapa</label>
                <input
                  className={inputCls}
                  value={newItem.name}
                  onChange={e => setNewItem(n => ({ ...n, name: e.target.value }))}
                  placeholder="Ex: Fundação"
                  onKeyDown={e => e.key === 'Enter' && addItem()}
                />
              </div>
              <div className="flex flex-col gap-1 w-40">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                  Progresso: {newItem.progress}%
                </label>
                <input
                  type="range" min={0} max={100}
                  value={newItem.progress}
                  onChange={e => setNewItem(n => ({ ...n, progress: Number(e.target.value) }))}
                  className="accent-blue-500"
                />
              </div>
              <div className="flex gap-2">
                <button onClick={() => setAdding(false)} className="px-3 py-2 text-xs text-zinc-500 hover:text-zinc-200 transition-colors">
                  Cancelar
                </button>
                <button onClick={addItem} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-xs font-bold text-white transition-all">
                  Adicionar
                </button>
              </div>
            </div>
          )}

          {/* lista */}
          {items.length === 0 ? (
            <EmptyState message="Nenhuma etapa cadastrada. Adicione a primeira etapa." />
          ) : (
            <div>
              {items.map(item => (
                <ProgressRow
                  key={item.id}
                  item={item}
                  onUpdate={updateProgress}
                  onDelete={deleteItem}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── ABA: Documentação ── */}
      {activeTab === 'docs' && (
        <div className="bg-[#181B22] border border-white/5 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-white/5">
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Documentação Legal</p>
          </div>
          {legalDocs.length === 0 ? (
            <EmptyState message="Nenhum documento cadastrado." />
          ) : (
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-white/5">
                  {['Documento', 'Órgão', 'Solicitado', 'Enviado', 'Status'].map(h => (
                    <th key={h} className="px-4 py-2.5 text-left text-[10px] font-bold text-zinc-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {legalDocs.map(doc => (
                  <tr key={doc.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                    <td className="px-4 py-3 text-zinc-200 font-medium">{doc.document}</td>
                    <td className="px-4 py-3 text-zinc-400">{doc.organization}</td>
                    <td className="px-4 py-3 text-zinc-500">{fmtDate(doc.requested_date)}</td>
                    <td className="px-4 py-3 text-zinc-500">{fmtDate(doc.sent_date)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        doc.status === 'aprovado' || doc.status === 'Aprovado'
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : doc.status === 'pendente' || doc.status === 'Pendente'
                          ? 'bg-amber-500/10 text-amber-400'
                          : 'bg-zinc-500/10 text-zinc-400'
                      }`}>
                        {doc.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
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
