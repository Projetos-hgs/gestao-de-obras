import React, { useState, useEffect } from 'react';
import {
  DollarSign, FileText, Building2, CalendarDays, UserCircle2,
  AlertTriangle, TrendingUp, Plus, X, Trash2, ArrowRight,
  CheckCircle2, Clock, ChevronRight,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { LoadingSpinner } from './Layout';
import type { Project, Alert, ScheduleItem } from '../types';

/* ─── helpers ─────────────────────────────────────────────── */
const inputCls =
  'w-full bg-[#0E1014] border border-white/10 rounded-lg px-3 py-2 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-blue-500/50 transition-colors';

const EMPTY_FORM = {
  name: '', start_date: '', area: '', project_type: '', justification: '',
  manager: '', sponsor: '', budget: '',
  objectives: '', requirements: '', tap_risks: '', stakeholders: '',
  milestones: '', // "AAAA-MM-DD - Descrição", uma por linha
};

/* ─── Stat Card ────────────────────────────────────────────── */
function StatCard({
  label, value, sub, icon: Icon, accent, onClick,
}: {
  label: string; value: React.ReactNode; sub?: string;
  icon: React.ElementType; accent: string; onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`bg-[#1C1F26] border border-white/5 rounded-xl p-5 flex flex-col gap-3
        ${onClick ? 'cursor-pointer hover:border-white/15 transition-all' : ''}`}
    >
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{label}</p>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${accent}`}>
          <Icon size={15} />
        </div>
      </div>
      <p className="text-2xl font-bold text-white leading-none">{value}</p>
      {sub && <p className="text-[11px] text-zinc-500 leading-snug">{sub}</p>}
    </div>
  );
}

/* ─── Modal Novo TAP ───────────────────────────────────────── */
function NewTAPModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (k: keyof typeof EMPTY_FORM, v: string) =>
    setForm(f => ({ ...f, [k]: v }));

  async function handleSave() {
    if (!form.name.trim()) { setError('Nome do projeto é obrigatório.'); return; }
    setSaving(true);
    setError('');
    try {
      const created = await api.projects.create({
        name: form.name.trim(),
        start_date: form.start_date || null,
        area: form.area || null,
        project_type: form.project_type || null,
        justification: form.justification || null,
        manager: form.manager || null,
        sponsor: form.sponsor || null,
        budget: form.budget || null,
        status: 'Em andamento',
      });

      const objectives = form.objectives.split('\n').map(s => s.trim()).filter(Boolean);
      const requirements = form.requirements.split('\n').map(s => s.trim()).filter(Boolean);
      const tapRisks = form.tap_risks.split('\n').map(s => s.trim()).filter(Boolean);
      const stakeholders = form.stakeholders.split('\n').map(s => s.trim()).filter(Boolean);
      const milestones = form.milestones
        .split('\n')
        .map(s => s.trim())
        .filter(Boolean)
        .map(line => {
          const idx = line.indexOf(' - ');
          return idx !== -1
            ? { date: line.slice(0, idx).trim(), description: line.slice(idx + 3).trim() }
            : { date: '', description: line };
        });

      await api.projects.updateTap(created.id, {
        objectives, requirements, tapRisks, stakeholders, milestones,
      });

      onSaved();
      onClose();
    } catch (e: any) {
      setError(e.message || 'Erro ao salvar.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#1C1F26] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">
        {/* header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <div>
            <h2 className="text-sm font-bold text-white">Novo TAP</h2>
            <p className="text-[11px] text-zinc-500 mt-0.5">Termo de Abertura do Projeto</p>
          </div>
          <button onClick={onClose} className="p-2 text-zinc-600 hover:text-zinc-300 transition-colors rounded-lg hover:bg-white/5">
            <X size={16} />
          </button>
        </div>

        {/* body */}
        <div className="overflow-y-auto px-6 py-5 space-y-5 flex-1">
          {/* Dados básicos */}
          <div>
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3">Dados do Projeto</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="md:col-span-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-1">Nome do Projeto *</label>
                <input className={inputCls} placeholder="Ex: Edifício Comercial Torre Norte" value={form.name} onChange={e => set('name', e.target.value)} />
              </div>
              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-1">Data de Início</label>
                <input className={inputCls} type="date" value={form.start_date} onChange={e => set('start_date', e.target.value)} />
              </div>
              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-1">Área</label>
                <input className={inputCls} placeholder="Ex: 3.200 m²" value={form.area} onChange={e => set('area', e.target.value)} />
              </div>
              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-1">Tipo</label>
                <input className={inputCls} placeholder="Ex: Construção comercial" value={form.project_type} onChange={e => set('project_type', e.target.value)} />
              </div>
              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-1">Gerente</label>
                <input className={inputCls} placeholder="Nome do gerente" value={form.manager} onChange={e => set('manager', e.target.value)} />
              </div>
              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-1">Sponsor</label>
                <input className={inputCls} placeholder="Nome do sponsor" value={form.sponsor} onChange={e => set('sponsor', e.target.value)} />
              </div>
              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-1">Orçamento Estimado</label>
                <input className={inputCls} placeholder="Ex: R$ 4.500.000,00" value={form.budget} onChange={e => set('budget', e.target.value)} />
              </div>
              <div className="md:col-span-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-1">Justificativa</label>
                <textarea
                  className={inputCls + ' resize-none min-h-[70px]'}
                  placeholder="Descreva a justificativa do projeto..."
                  value={form.justification}
                  onChange={e => set('justification', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Listas */}
          {(
            [
              { key: 'objectives' as const, label: 'Objetivos', hint: 'Um objetivo por linha' },
              { key: 'requirements' as const, label: 'Requisitos', hint: 'Um requisito por linha' },
              { key: 'tap_risks' as const, label: 'Riscos', hint: 'Um risco por linha' },
              { key: 'stakeholders' as const, label: 'Stakeholders', hint: 'Um nome por linha' },
            ] as { key: keyof typeof EMPTY_FORM; label: string; hint: string }[]
          ).map(({ key, label, hint }) => (
            <div key={key}>
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3">{label}</p>
              <textarea
                className={inputCls + ' resize-none min-h-[80px] font-mono text-xs'}
                placeholder={hint}
                value={form[key]}
                onChange={e => set(key, e.target.value)}
              />
            </div>
          ))}

          {/* Marcos */}
          <div>
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Marcos</p>
            <p className="text-[10px] text-zinc-600 mb-2">Formato: AAAA-MM-DD - Descrição do marco (um por linha)</p>
            <textarea
              className={inputCls + ' resize-none min-h-[80px] font-mono text-xs'}
              placeholder={'2025-03-01 - Fundação concluída\n2025-06-15 - Estrutura finalizada'}
              value={form.milestones}
              onChange={e => set('milestones', e.target.value)}
            />
          </div>

          {error && (
            <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>
          )}
        </div>

        {/* footer */}
        <div className="px-6 py-4 border-t border-white/5 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg text-xs font-bold text-white transition-all"
          >
            {saving ? 'Salvando...' : 'Salvar TAP'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Dashboard Page ────────────────────────────────────────── */
export function DashboardPage() {
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [legalDocs, setLegalDocs] = useState<any[]>([]);
  const [techProjects, setTechProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewTAP, setShowNewTAP] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const [projs, alts, comps] = await Promise.all([
        api.projects.list(),
        api.alerts.list(),
        api.companies.list(),
      ]);
      setAlerts(alts.filter((a: Alert) => !a.resolved));
      setCompanies(comps);

      if (projs.length > 0) {
        const full = await api.projects.get(projs[0].id);
        setProject(full);
        const [sched, legal, tech] = await Promise.all([
          api.schedule.list(projs[0].id),
          api.legalDocs.list(projs[0].id),
          api.technicalProjects.list(projs[0].id),
        ]);
        setSchedule(sched);
        setLegalDocs(legal);
        setTechProjects(tech);
      }
    } catch (err) {
      console.error('[v0] Erro ao carregar dashboard:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  if (loading) return <LoadingSpinner />;

  /* ── Cálculos ── */
  const pendingDocs = [...legalDocs, ...techProjects].filter(
    d => d.status === 'Pendente' || d.status === 'Em análise' || !d.status,
  ).length;

  const diasObra = project?.start_date
    ? Math.max(0, Math.floor((Date.now() - new Date(project.start_date).getTime()) / 86_400_000))
    : 0;

  const milestones: { id: string; date: string; description: string }[] =
    (project as any)?.milestones || [];

  const now = new Date();
  const nextMilestone = milestones
    .filter(m => m.date && new Date(m.date) >= now)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];

  const overdueAlerts = alerts.filter(a => a.type === 'error');
  const warningAlerts = alerts.filter(a => a.type === 'warning');

  return (
    <div className="space-y-8 animate-in fade-in duration-300">

      {/* ── Header ── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Dashboard</h1>
          <p className="text-sm text-zinc-500 mt-1">
            {project ? project.name : 'Nenhum projeto ativo'}
          </p>
        </div>
        <button
          onClick={() => setShowNewTAP(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-xl text-xs font-bold text-white transition-all shadow-lg shadow-blue-500/20"
        >
          <Plus size={14} /> Novo TAP
        </button>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard
          label="Orçamento"
          value={project?.budget || '—'}
          sub={project ? 'Orçamento estimado do projeto' : 'Crie um TAP para começar'}
          icon={DollarSign}
          accent="bg-emerald-500/15 text-emerald-400"
        />
        <StatCard
          label="Documentos Pendentes"
          value={pendingDocs}
          sub={pendingDocs > 0 ? `${pendingDocs} doc${pendingDocs > 1 ? 's' : ''} aguardando ação` : 'Documentação em dia'}
          icon={FileText}
          accent={pendingDocs > 0 ? 'bg-amber-500/15 text-amber-400' : 'bg-zinc-500/15 text-zinc-400'}
          onClick={() => navigate('/documentacao')}
        />
        <StatCard
          label="Empresas Parceiras"
          value={companies.length}
          sub={companies.length > 0 ? companies.slice(0, 2).map(c => c.name).join(', ') : 'Nenhuma empresa cadastrada'}
          icon={Building2}
          accent="bg-violet-500/15 text-violet-400"
          onClick={() => navigate('/empresas')}
        />
        <StatCard
          label="Dias de Obra"
          value={diasObra}
          sub={project?.start_date ? `Desde ${new Date(project.start_date).toLocaleDateString('pt-BR')}` : 'Data de início não definida'}
          icon={CalendarDays}
          accent="bg-blue-500/15 text-blue-400"
        />
        <StatCard
          label="Gerente"
          value={project?.manager || '—'}
          sub={project?.sponsor ? `Sponsor: ${project.sponsor}` : 'Sponsor não definido'}
          icon={UserCircle2}
          accent="bg-sky-500/15 text-sky-400"
        />
        <StatCard
          label="Alertas Ativos"
          value={alerts.length}
          sub={
            overdueAlerts.length > 0
              ? `${overdueAlerts.length} crítico${overdueAlerts.length > 1 ? 's' : ''}, ${warningAlerts.length} aviso${warningAlerts.length !== 1 ? 's' : ''}`
              : alerts.length === 0 ? 'Nenhum alerta ativo' : `${warningAlerts.length} aviso${warningAlerts.length !== 1 ? 's' : ''}`
          }
          icon={AlertTriangle}
          accent={overdueAlerts.length > 0 ? 'bg-red-500/15 text-red-400' : alerts.length > 0 ? 'bg-amber-500/15 text-amber-400' : 'bg-zinc-500/15 text-zinc-400'}
        />
      </div>

      {/* ── Alertas e Pendências ── */}
      <div className="bg-[#1C1F26] border border-white/5 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle size={15} className="text-amber-400" />
          <h3 className="text-sm font-bold text-white">Alertas e Pendências</h3>
          {alerts.length > 0 && (
            <span className="ml-auto text-[10px] font-bold text-zinc-600 bg-white/5 px-2 py-1 rounded-md">
              {alerts.length} ativo{alerts.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {alerts.length === 0 ? (
          <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-emerald-500/5 border border-emerald-500/15 text-xs text-emerald-400">
            <CheckCircle2 size={13} className="flex-shrink-0" />
            Nenhum alerta ativo no momento.
          </div>
        ) : (
          <div className="space-y-2">
            {alerts.map(alert => (
              <div
                key={alert.id}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg border-l-2 text-xs ${
                  alert.type === 'error'
                    ? 'bg-[#201A1A] border-red-500 text-red-300'
                    : alert.type === 'warning'
                    ? 'bg-[#1E1B14] border-amber-500 text-amber-300'
                    : 'bg-[#141A20] border-blue-500 text-blue-300'
                }`}
              >
                <AlertTriangle
                  size={13}
                  className={`flex-shrink-0 ${
                    alert.type === 'error' ? 'text-red-500' : alert.type === 'warning' ? 'text-amber-500' : 'text-blue-500'
                  }`}
                />
                <span className="leading-relaxed">{alert.text}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Evolução de Marcos ── */}
      <div className="bg-[#1C1F26] border border-white/5 rounded-xl p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-sm font-bold text-white">Evolução de Marcos</h3>
            {nextMilestone && (
              <p className="text-[11px] text-zinc-500 mt-0.5">
                Próximo: <span className="text-blue-400 font-medium">{nextMilestone.description}</span>
                {' '}— {new Date(nextMilestone.date).toLocaleDateString('pt-BR')}
              </p>
            )}
          </div>
          <button
            onClick={() => navigate('/cronograma')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-[11px] font-bold text-zinc-300 transition-all"
          >
            Ver Cronograma <ArrowRight size={12} />
          </button>
        </div>

        {milestones.length === 0 && schedule.length === 0 ? (
          <p className="text-xs text-zinc-600 text-center py-4">Cadastre marcos no TAP ou etapas no Cronograma para visualizar o progresso aqui.</p>
        ) : (
          <div className="space-y-4">
            {/* Progresso do cronograma */}
            {schedule.slice(0, 5).map(item => {
              const done = item.progress >= 100;
              return (
                <div key={item.id}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      {done
                        ? <CheckCircle2 size={13} className="text-emerald-400 flex-shrink-0" />
                        : <Clock size={13} className="text-zinc-500 flex-shrink-0" />
                      }
                      <span className="text-xs text-zinc-300">{item.name}</span>
                    </div>
                    <span className={`text-xs font-bold ${done ? 'text-emerald-400' : 'text-zinc-400'}`}>
                      {item.progress}%
                    </span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${done ? 'bg-emerald-500' : 'bg-blue-500'}`}
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                </div>
              );
            })}

            {/* Linha do tempo de marcos */}
            {milestones.length > 0 && (
              <div className="mt-5 pt-4 border-t border-white/5">
                <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-3">Marcos</p>
                <div className="flex flex-col gap-2">
                  {milestones.slice(0, 5).map((m: any) => {
                    const d = m.date ? new Date(m.date) : null;
                    const past = d && d < now;
                    return (
                      <div key={m.id} className="flex items-center gap-3">
                        <span className={`text-[11px] font-mono px-2 py-0.5 rounded flex-shrink-0 ${
                          past ? 'bg-emerald-500/10 text-emerald-400' : 'bg-blue-500/10 text-blue-400'
                        }`}>
                          {d ? d.toLocaleDateString('pt-BR') : '—'}
                        </span>
                        <ChevronRight size={11} className="text-zinc-700 flex-shrink-0" />
                        <span className={`text-xs ${past ? 'text-zinc-500 line-through' : 'text-zinc-300'}`}>
                          {m.description}
                        </span>
                        {past && <CheckCircle2 size={12} className="text-emerald-500 flex-shrink-0 ml-auto" />}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Sem projeto ── */}
      {!project && alerts.length === 0 && (
        <div className="bg-[#1C1F26] border border-white/5 rounded-xl p-12 text-center">
          <TrendingUp size={32} className="text-zinc-700 mx-auto mb-3" />
          <p className="text-zinc-500 text-sm mb-4">Nenhum projeto cadastrado ainda.</p>
          <button
            onClick={() => setShowNewTAP(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-xl text-xs font-bold text-white transition-all"
          >
            <Plus size={14} /> Criar primeiro TAP
          </button>
        </div>
      )}

      {/* ── Modal ── */}
      {showNewTAP && (
        <NewTAPModal
          onClose={() => setShowNewTAP(false)}
          onSaved={() => { setShowNewTAP(false); load(); }}
        />
      )}
    </div>
  );
}
