const { readdirSync, existsSync } = require('fs');
const path = require('path');

// Discover where the project actually lives
const candidates = [
  '/vercel/share/v0-next-shadcn',
  '/vercel/share/v0-project',
  '/home/user/project',
  process.cwd(),
];

for (const base of candidates) {
  const f = path.join(base, 'src/components/CronogramaPage.tsx');
  console.log('[v0] Checking:', f, '→ exists:', existsSync(f));
}

try { console.log('[v0] CWD files:', readdirSync(process.cwd())); } catch(e) {}
try { console.log('[v0] CWD/src:', readdirSync(path.join(process.cwd(), 'src'))); } catch(e) {}
try { console.log('[v0] CWD/src/components:', readdirSync(path.join(process.cwd(), 'src/components'))); } catch(e) {}

const content = `import React, { useState, useEffect } from 'react';
import { FileText } from 'lucide-react';
import { api } from '../lib/api';
import type { Project, ScheduleItem, Contract, LegalDocument } from '../types';

function fmtDate(d?: string | null) {
  if (!d) return '—';
  try { return new Date(d).toLocaleDateString('pt-BR'); } catch { return String(d); }
}
function fmtBudget(v?: string | null) {
  if (!v || v === '0') return '—';
  const n = parseFloat(v);
  if (isNaN(n)) return v;
  if (n >= 1_000_000) return \`R\$ \${(n / 1_000_000).toFixed(1)}M\`;
  if (n >= 1_000) return \`R\$ \${(n / 1_000).toFixed(0)}K\`;
  return \`R\$ \${n.toLocaleString('pt-BR')}\`;
}
function progressColor(p: number) {
  if (p >= 70) return '#22c55e';
  if (p >= 30) return '#f59e0b';
  return '#3b82f6';
}
function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center h-48">
      <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-zinc-600">
      <FileText size={28} className="mb-2 opacity-40" />
      <p className="text-xs">{message}</p>
    </div>
  );
}
function StatusBadge({ status }: { status: string }) {
  const s = (status ?? '').toLowerCase();
  let cls = 'bg-zinc-500/15 text-zinc-400 border-zinc-500/30';
  let label = status;
  if (s === 'emitido' || s === 'aprovado')              { cls = 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'; }
  else if (s.includes('com rrt') || s === 'rrt')        { cls = 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'; label = 'COM RRT'; }
  else if (s.includes('com art') || s === 'art')        { cls = 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'; label = 'COM ART'; }
  else if (s === 'em elaboração' || s === 'elaboracao') { cls = 'bg-amber-500/15 text-amber-400 border-amber-500/30'; label = 'EM ELABORAÇÃO'; }
  else if (s.includes('boleto'))                        { cls = 'bg-red-500/15 text-red-400 border-red-500/30'; label = 'AG. BOLETO PAGAMENTO'; }
  else if (s.includes('envio'))                         { cls = 'bg-red-500/15 text-red-400 border-red-500/30'; label = 'AG. ENVIO DO PROJETO'; }
  else if (s.includes('aguardando'))                    { cls = 'bg-blue-500/15 text-blue-400 border-blue-500/30'; label = 'AGUARDANDO ÓRGÃO'; }
  else if (s === 'pendente')                            { cls = 'bg-amber-500/15 text-amber-400 border-amber-500/30'; label = 'PENDENTE'; }
  return (
    <span className={\`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border \${cls}\`}>
      {label}
    </span>
  );
}

export function CronogramaPage() {
  const [projects, setProjects]   = useState<Project[]>([]);
  const [selId, setSelId]         = useState<string | null>(null);
  const [project, setProject]     = useState<Project | null>(null);
  const [items, setItems]         = useState<ScheduleItem[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [legalDocs, setLegalDocs] = useState<LegalDocument[]>([]);
  const [techDocs, setTechDocs]   = useState<any[]>([]);
  const [loading, setLoading]     = useState(true);
  const [activeTab, setActiveTab] = useState<'progress' | 'docs' | 'contracts'>('progress');

  useEffect(() => {
    api.projects.list().then((projs: Project[]) => {
      setProjects(projs);
      if (projs.length > 0) setSelId(String(projs[0].id));
      else setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selId) return;
    setLoading(true);
    Promise.all([
      api.projects.get(selId),
      api.schedule.list(selId),
      api.contracts.list(selId),
      api.legalDocs.list(selId),
      api.technicalProjects.list(selId),
    ]).then(([proj, sched, contr, legal, tech]) => {
      setProject(proj);
      setItems(sched);
      setContracts(contr);
      setLegalDocs(legal);
      setTechDocs(tech);
    }).catch(err => console.error('[v0]', err))
      .finally(() => setLoading(false));
  }, [selId]);

  async function updateProgress(id: string, value: number) {
    setItems(prev => prev.map(i => i.id === String(id) ? { ...i, progress: value } : i));
    try { await api.schedule.update(id, { progress: value }); }
    catch (e) { console.error('[v0] updateProgress:', e); }
  }

  const avgProgress = items.length
    ? Math.round(items.reduce((s, i) => s + (i.progress ?? 0), 0) / items.length) : 0;
  const topItems = [...items].sort((a, b) => (b.progress ?? 0) - (a.progress ?? 0)).slice(0, 3);
  const bigContract = contracts.length
    ? contracts.reduce((m, c) => parseFloat(c.value || '0') > parseFloat(m.value || '0') ? c : m, contracts[0])
    : null;
  const pendingDocs = legalDocs.filter(d => d.status?.toLowerCase() === 'pendente').length
    + techDocs.filter(d => d.status?.toLowerCase() === 'pendente').length;

  if (loading) return <LoadingSpinner />;

  const nameParts = (project?.name ?? '').split(' ');
  const nameFirst = nameParts[0] ?? '';
  const nameRest  = nameParts.slice(1).join(' ');

  return (
    <div className="space-y-6 animate-in fade-in duration-300">

      <div className="space-y-1">
        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">VP Construtora</p>
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-3xl font-black leading-tight">
            <span className="text-white">{nameFirst} </span>
            <span className="text-emerald-400">{nameRest}</span>
          </h1>
          <span className={\`flex-shrink-0 mt-1 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold border \${
            (project?.status ?? '').toLowerCase().includes('anda')
              ? 'bg-amber-500/10 text-amber-400 border-amber-500/25'
              : 'bg-zinc-500/10 text-zinc-400 border-zinc-500/25'
          }\`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            {project?.status ?? 'EM ANDAMENTO'}
          </span>
        </div>
        {projects.length > 1 && (
          <select
            value={selId ?? ''}
            onChange={e => setSelId(e.target.value)}
            className="mt-1 appearance-none bg-transparent border-b border-white/10 text-xs text-zinc-400 pr-4 focus:outline-none cursor-pointer"
          >
            {projects.map(p => (
              <option key={p.id} value={String(p.id)} className="bg-[#1C1F26]">{p.name}</option>
            ))}
          </select>
        )}
        <p className="text-[11px] text-zinc-500 pt-1">
          {project?.cno && <span className="mr-3">CNO {project.cno}</span>}
          {project?.start_date && <span className="mr-3">Início: {fmtDate(project.start_date)}</span>}
          {project?.area && <span className="mr-3">Área: {project.area}</span>}
          {project?.manager && <span>Resp: {project.manager}</span>}
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-[#1C1F26] border border-emerald-500/20 rounded-xl p-4 flex flex-col gap-1">
          <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Etapa Atual</p>
          <p className="text-lg font-black text-white leading-tight">{topItems[0]?.name ?? '—'}</p>
          <p className="text-[10px] text-zinc-500">{topItems[0] ? \`\${topItems[0].progress}% concluído\` : 'Sem etapas'}</p>
        </div>
        {topItems.slice(0, 3).map((item, idx) => {
          const col = progressColor(item.progress);
          const labels = ['Em andamento', 'Quase concluído', 'Iniciada'];
          return (
            <div key={item.id} className="bg-[#1C1F26] border border-white/5 rounded-xl p-4 flex flex-col gap-1" style={{ borderTopColor: col, borderTopWidth: 2 }}>
              <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest truncate">{item.name}</p>
              <p className="text-2xl font-black" style={{ color: col }}>{item.progress}%</p>
              <p className="text-[10px] text-zinc-500">{labels[idx]}</p>
            </div>
          );
        })}
        <div className="bg-[#1C1F26] border border-white/5 rounded-xl p-4 flex flex-col gap-1">
          <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Maior Contrato</p>
          <p className="text-lg font-black text-white leading-tight">{fmtBudget(bigContract?.value)}</p>
          <p className="text-[10px] text-zinc-500 truncate">{bigContract?.company ?? '—'}</p>
        </div>
        <div className="bg-[#1C1F26] border border-white/5 rounded-xl p-4 flex flex-col gap-1">
          <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Docs Pendentes</p>
          <p className="text-2xl font-black text-white">{pendingDocs}</p>
          <p className="text-[10px] text-zinc-500">{pendingDocs === 0 ? 'Em dia' : 'Aguardando'}</p>
        </div>
      </div>

      <div className="flex items-center gap-1 border-b border-white/5">
        {([
          { key: 'progress',  label: 'Progresso físico' },
          { key: 'docs',      label: 'Documentação' },
          { key: 'contracts', label: 'Contratos' },
        ] as const).map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={\`px-4 py-2 text-xs font-semibold rounded-t-lg border-b-2 transition-all -mb-px \${
              activeTab === tab.key
                ? 'border-emerald-400 text-white bg-emerald-500/5'
                : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }\`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'progress' && (
        <div className="space-y-2">
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">
            Avanço Físico — {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
          </p>
          {items.length === 0
            ? <EmptyState message="Nenhuma etapa cadastrada no cronograma." />
            : items.map(item => {
                const pct = item.progress ?? 0;
                const color = progressColor(pct);
                return (
                  <div key={item.id} className="group flex items-center gap-4 px-4 py-3 bg-[#181B22] border border-white/5 rounded-lg hover:border-white/10 transition-colors">
                    <span className="w-52 flex-shrink-0 text-sm font-semibold text-zinc-200 truncate">{item.name}</span>
                    <div className="flex-1 relative h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div className="absolute inset-y-0 left-0 rounded-full transition-all duration-300" style={{ width: \`\${pct}%\`, backgroundColor: color }} />
                    </div>
                    <div className="flex items-center gap-2 w-20 justify-end">
                      <span className="text-xs font-bold" style={{ color: pct > 0 ? color : '#52525b' }}>{pct}%</span>
                      <input
                        type="range" min={0} max={100} step={5} value={pct}
                        onChange={e => updateProgress(item.id, Number(e.target.value))}
                        className="w-16 opacity-0 group-hover:opacity-100 transition-opacity accent-blue-500 cursor-pointer"
                      />
                    </div>
                  </div>
                );
              })
          }
          {items.length > 0 && (
            <div className="mt-4 flex items-center justify-between px-4 py-3 bg-[#1C1F26] border border-white/5 rounded-xl">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Progresso Médio Geral</span>
              <span className="text-xl font-black" style={{ color: progressColor(avgProgress) }}>{avgProgress}%</span>
            </div>
          )}
        </div>
      )}

      {activeTab === 'docs' && (
        <div className="space-y-6">
          <div>
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3">Projetos Técnicos</p>
            {techDocs.length === 0
              ? <EmptyState message="Nenhum projeto técnico cadastrado." />
              : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                  {techDocs.map(doc => (
                    <div key={doc.id} className="bg-[#181B22] border border-white/5 hover:border-white/10 rounded-xl p-4 flex flex-col gap-2 transition-colors">
                      <p className="text-sm font-bold text-white leading-snug">{doc.name}</p>
                      <p className="text-[11px] text-zinc-500 leading-snug">
                        {doc.responsible}{doc.version && \` · \${doc.version}\`}{doc.date && \` · \${fmtDate(doc.date)}\`}
                      </p>
                      <div className="mt-auto pt-1"><StatusBadge status={doc.status} /></div>
                    </div>
                  ))}
                </div>
              )
            }
          </div>
          <div>
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3">Licenças e Aprovações Legais</p>
            {legalDocs.length === 0
              ? <EmptyState message="Nenhum documento legal cadastrado." />
              : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                  {legalDocs.map(doc => (
                    <div key={doc.id} className="bg-[#181B22] border border-white/5 hover:border-white/10 rounded-xl p-4 flex flex-col gap-2 transition-colors">
                      <p className="text-sm font-bold text-white leading-snug">{doc.document}</p>
                      <p className="text-[11px] text-zinc-500 leading-snug">
                        {doc.organization}{doc.sent_date && \` · enviado \${fmtDate(doc.sent_date)}\`}
                      </p>
                      <div className="mt-auto pt-1"><StatusBadge status={doc.status} /></div>
                    </div>
                  ))}
                </div>
              )
            }
          </div>
        </div>
      )}

      {activeTab === 'contracts' && (
        <div>
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3">Prestadores e Contratos</p>
          {contracts.length === 0
            ? <EmptyState message="Nenhum contrato cadastrado." />
            : (
              <div className="rounded-xl overflow-hidden border border-white/5">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-white/5 bg-[#181B22]">
                      {['Empresa', 'Escopo', 'Contrato', 'Valor', 'Pagamento', 'Prazo'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-zinc-500 uppercase tracking-widest whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {contracts.map((c, i) => {
                      const rawSigned = (c as any).signed;
                      const signed = rawSigned === true || rawSigned === 'true' || rawSigned === 'sim' ? true
                        : rawSigned === false || rawSigned === 'false' || rawSigned === 'nao' || rawSigned === 'não' ? false
                        : null;
                      const hasValue = c.value && parseFloat(c.value) > 0;
                      const prazo = (c as any).duration_days
                        ? \`\${(c as any).duration_days} dias\`
                        : c.deadline ? fmtDate(c.deadline) : null;
                      const pagamento = (c as any).installments
                        ? \`\${(c as any).installments} parcelas\`
                        : (c as any).payment_terms ?? null;
                      return (
                        <tr key={c.id} className={\`border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors \${i % 2 === 0 ? 'bg-[#16191F]' : 'bg-[#181B22]'}\`}>
                          <td className="px-4 py-3.5 font-bold text-white whitespace-nowrap">{c.company}</td>
                          <td className="px-4 py-3.5 text-zinc-400 max-w-xs">{c.scope || '—'}</td>
                          <td className="px-4 py-3.5">
                            {signed === true ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">SIM</span>
                            ) : signed === false ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/25">NÃO</span>
                            ) : (
                              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-zinc-800 text-zinc-500 text-xs">–</span>
                            )}
                          </td>
                          <td className="px-4 py-3.5 font-bold whitespace-nowrap">
                            {hasValue
                              ? <span className="text-emerald-400">{fmtBudget(c.value)}</span>
                              : <span className="text-zinc-600">—</span>
                            }
                          </td>
                          <td className="px-4 py-3.5 text-zinc-400 whitespace-nowrap">
                            {pagamento ?? <span className="text-zinc-600">—</span>}
                          </td>
                          <td className="px-4 py-3.5 text-zinc-400 whitespace-nowrap">
                            {prazo ?? <span className="text-zinc-600">—</span>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )
          }
        </div>
      )}

    </div>
  );
}
`;

// Write to destination only
writeFileSync(dst, content, 'utf8');
console.log('[v0] Written. Lines:', content.split('\n').length);
