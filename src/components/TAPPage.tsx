import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save, Edit3 } from 'lucide-react';
import { api } from '../lib/api';
import { PageHeader, LoadingSpinner, EmptyState } from './Layout';
import type { Project } from '../types';

const EMPTY_PROJECT: Omit<Project, 'id'> = {
  name: '',
  justification: '',
  budget: '',
  manager: '',
  sponsor: '',
  start_date: '',
  area: '',
  project_type: '',
  cno: '',
  location: '',
  status: 'Em andamento',
  objectives: [],
  requirements: [],
  tap_risks: [],
  stakeholders: [],
  milestones: [],
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-[#1C1F26] border border-white/5 rounded-xl p-6 space-y-4">
      <h3 className="text-sm font-bold text-white border-b border-white/5 pb-3">{title}</h3>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">{label}</label>
      {children}
    </div>
  );
}

const inputCls = 'bg-[#121418] border border-white/10 rounded-lg px-3 py-2 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-blue-500/50 transition-colors';

function ListEditor({
  label,
  items,
  onChange,
}: {
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
}) {
  const add = () => onChange([...items, '']);
  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i));
  const update = (i: number, val: string) => onChange(items.map((it, idx) => (idx === i ? val : it)));

  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex gap-2">
          <input
            className={inputCls + ' flex-1'}
            value={item}
            onChange={e => update(i, e.target.value)}
            placeholder={label}
          />
          <button onClick={() => remove(i)} className="p-2 text-zinc-600 hover:text-red-400 transition-colors">
            <Trash2 size={14} />
          </button>
        </div>
      ))}
      <button
        onClick={add}
        className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors"
      >
        <Plus size={12} /> Adicionar
      </button>
    </div>
  );
}

export function TAPPage() {
  const [project, setProject] = useState<Project | null>(null);
  const [form, setForm] = useState<Omit<Project, 'id'>>(EMPTY_PROJECT);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const projects = await api.projects.list();
      if (projects.length > 0) {
        const full = await api.projects.get(projects[0].id);
        setProject(full);
        setForm({
          name: full.name,
          justification: full.justification || '',
          budget: full.budget || '',
          manager: full.manager || '',
          sponsor: full.sponsor || '',
          start_date: full.start_date || '',
          area: full.area || '',
          project_type: full.project_type || '',
          cno: full.cno || '',
          location: full.location || '',
          status: full.status,
          objectives: (full.objectives || []).map((o: any) => o.text),
          requirements: (full.requirements || []).map((r: any) => r.text),
          tap_risks: (full.taprisk || full.tap_risks || []).map((r: any) => r.text),
          stakeholders: (full.stakeholders || []).map((s: any) => s.name),
          milestones: full.milestones || [],
        });
      } else {
        setEditing(true);
      }
    } catch (err) {
      console.error('[v0] Erro ao carregar TAP:', err);
    } finally {
      setLoading(false);
    }
  }

  async function save() {
    setSaving(true);
    try {
      if (project?.id) {
        await api.projects.update(project.id, {
          name: form.name,
          justification: form.justification,
          budget: form.budget,
          manager: form.manager,
          sponsor: form.sponsor,
          start_date: form.start_date,
          area: form.area,
          project_type: form.project_type,
          cno: form.cno,
          location: form.location,
          status: form.status,
        });
        await api.projects.updateTap(project.id, {
          objectives: form.objectives,
          requirements: form.requirements,
          tapRisks: form.tap_risks,
          stakeholders: form.stakeholders,
          milestones: form.milestones,
        });
      } else {
        const created = await api.projects.create({
          name: form.name,
          justification: form.justification,
          budget: form.budget,
          manager: form.manager,
          sponsor: form.sponsor,
          start_date: form.start_date,
          area: form.area,
          project_type: form.project_type,
          cno: form.cno,
          location: form.location,
          status: form.status,
        });
        await api.projects.updateTap(created.id, {
          objectives: form.objectives,
          requirements: form.requirements,
          tapRisks: form.tap_risks,
          stakeholders: form.stakeholders,
          milestones: form.milestones,
        });
      }
      await load();
      setEditing(false);
    } catch (err) {
      console.error('[v0] Erro ao salvar TAP:', err);
    } finally {
      setSaving(false);
    }
  }

  const set = (field: string, val: any) => setForm(f => ({ ...f, [field]: val }));

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <PageHeader
        title="TAP — Termo de Abertura do Projeto"
        subtitle="Documento formal de autorização do projeto"
        action={
          editing ? (
            <div className="flex gap-2">
              <button
                onClick={() => { setEditing(false); }}
                className="px-4 py-2 text-xs font-bold text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={save}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg text-xs font-bold text-white transition-all"
              >
                <Save size={13} /> {saving ? 'Salvando...' : 'Salvar TAP'}
              </button>
            </div>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-bold text-zinc-300 transition-all"
            >
              <Edit3 size={13} /> Editar
            </button>
          )
        }
      />

      {/* Dados do Projeto */}
      <Section title="Dados do Projeto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Nome do Projeto">
            {editing ? (
              <input className={inputCls} value={form.name} onChange={e => set('name', e.target.value)} placeholder="Nome do projeto" />
            ) : (
              <p className="text-sm text-zinc-200">{project?.name || '—'}</p>
            )}
          </Field>
          <Field label="Tipo de Projeto">
            {editing ? (
              <input className={inputCls} value={form.project_type || ''} onChange={e => set('project_type', e.target.value)} placeholder="Ex: Construção comercial" />
            ) : (
              <p className="text-sm text-zinc-200">{project?.project_type || '—'}</p>
            )}
          </Field>
          <Field label="Gestor Responsável">
            {editing ? (
              <input className={inputCls} value={form.manager || ''} onChange={e => set('manager', e.target.value)} placeholder="Nome do gestor" />
            ) : (
              <p className="text-sm text-zinc-200">{project?.manager || '—'}</p>
            )}
          </Field>
          <Field label="Patrocinador">
            {editing ? (
              <input className={inputCls} value={form.sponsor || ''} onChange={e => set('sponsor', e.target.value)} placeholder="Nome do patrocinador" />
            ) : (
              <p className="text-sm text-zinc-200">{project?.sponsor || '—'}</p>
            )}
          </Field>
          <Field label="Data de Início">
            {editing ? (
              <input className={inputCls} type="date" value={form.start_date || ''} onChange={e => set('start_date', e.target.value)} />
            ) : (
              <p className="text-sm text-zinc-200">{project?.start_date || '—'}</p>
            )}
          </Field>
          <Field label="CNO">
            {editing ? (
              <input className={inputCls} value={form.cno || ''} onChange={e => set('cno', e.target.value)} placeholder="Número do CNO" />
            ) : (
              <p className="text-sm text-zinc-200">{project?.cno || '—'}</p>
            )}
          </Field>
          <Field label="Área (m²)">
            {editing ? (
              <input className={inputCls} value={form.area || ''} onChange={e => set('area', e.target.value)} placeholder="Ex: 2.500 m²" />
            ) : (
              <p className="text-sm text-zinc-200">{project?.area || '—'}</p>
            )}
          </Field>
          <Field label="Orçamento">
            {editing ? (
              <input className={inputCls} value={form.budget || ''} onChange={e => set('budget', e.target.value)} placeholder="Ex: R$ 1.800.000,00" />
            ) : (
              <p className="text-sm text-zinc-200">{project?.budget || '—'}</p>
            )}
          </Field>
          <Field label="Localização">
            {editing ? (
              <input className={inputCls} value={form.location || ''} onChange={e => set('location', e.target.value)} placeholder="Endereço da obra" />
            ) : (
              <p className="text-sm text-zinc-200">{project?.location || '—'}</p>
            )}
          </Field>
          <Field label="Status">
            {editing ? (
              <select className={inputCls} value={form.status} onChange={e => set('status', e.target.value)}>
                {['Em andamento', 'Planejamento', 'Concluído', 'Suspenso'].map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            ) : (
              <p className="text-sm text-zinc-200">{project?.status || '—'}</p>
            )}
          </Field>
        </div>
        <Field label="Justificativa">
          {editing ? (
            <textarea
              className={inputCls + ' min-h-[80px] resize-none'}
              value={form.justification || ''}
              onChange={e => set('justification', e.target.value)}
              placeholder="Descreva a justificativa do projeto..."
            />
          ) : (
            <p className="text-sm text-zinc-400 leading-relaxed">{project?.justification || '—'}</p>
          )}
        </Field>
      </Section>

      {/* Objetivos */}
      <Section title="Objetivos do Projeto">
        {editing ? (
          <ListEditor
            label="Objetivo"
            items={(form.objectives as any[]).map(o => (typeof o === 'string' ? o : o.text))}
            onChange={items => set('objectives', items)}
          />
        ) : (
          <ul className="space-y-2">
            {(project?.objectives || []).length === 0 && <p className="text-zinc-600 text-sm">Nenhum objetivo cadastrado.</p>}
            {(project?.objectives || []).map((o: any) => (
              <li key={o.id} className="flex items-start gap-2 text-sm text-zinc-300">
                <span className="w-1 h-1 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                {o.text}
              </li>
            ))}
          </ul>
        )}
      </Section>

      {/* Requisitos */}
      <Section title="Requisitos do Projeto">
        {editing ? (
          <ListEditor
            label="Requisito"
            items={(form.requirements as any[]).map(r => (typeof r === 'string' ? r : r.text))}
            onChange={items => set('requirements', items)}
          />
        ) : (
          <ul className="space-y-2">
            {(project?.requirements || []).length === 0 && <p className="text-zinc-600 text-sm">Nenhum requisito cadastrado.</p>}
            {(project?.requirements || []).map((r: any) => (
              <li key={r.id} className="flex items-start gap-2 text-sm text-zinc-300">
                <span className="w-1 h-1 rounded-full bg-emerald-500 mt-2 flex-shrink-0" />
                {r.text}
              </li>
            ))}
          </ul>
        )}
      </Section>

      {/* Riscos do TAP */}
      <Section title="Riscos Identificados">
        {editing ? (
          <ListEditor
            label="Risco"
            items={(form.tap_risks as any[]).map(r => (typeof r === 'string' ? r : r.text))}
            onChange={items => set('tap_risks', items)}
          />
        ) : (
          <ul className="space-y-2">
            {(project as any)?.taprisk?.length === 0 && <p className="text-zinc-600 text-sm">Nenhum risco identificado.</p>}
            {((project as any)?.taprisk || []).map((r: any) => (
              <li key={r.id} className="flex items-start gap-2 text-sm text-zinc-300">
                <span className="w-1 h-1 rounded-full bg-amber-500 mt-2 flex-shrink-0" />
                {r.text}
              </li>
            ))}
          </ul>
        )}
      </Section>

      {/* Stakeholders */}
      <Section title="Partes Interessadas">
        {editing ? (
          <ListEditor
            label="Parte interessada"
            items={(form.stakeholders as any[]).map(s => (typeof s === 'string' ? s : s.name))}
            onChange={items => set('stakeholders', items)}
          />
        ) : (
          <div className="flex flex-wrap gap-2">
            {(project?.stakeholders || []).length === 0 && <p className="text-zinc-600 text-sm">Nenhuma parte interessada cadastrada.</p>}
            {(project?.stakeholders || []).map((s: any) => (
              <span key={s.id} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-zinc-300">
                {s.name}
              </span>
            ))}
          </div>
        )}
      </Section>

      {/* Marcos */}
      <Section title="Marcos do Projeto">
        {editing ? (
          <div className="space-y-2">
            {(form.milestones as any[]).map((m, i) => (
              <div key={i} className="flex gap-2">
                <input
                  className={inputCls}
                  type="date"
                  value={m.date || ''}
                  onChange={e => {
                    const updated = [...(form.milestones as any[])];
                    updated[i] = { ...updated[i], date: e.target.value };
                    set('milestones', updated);
                  }}
                />
                <input
                  className={inputCls + ' flex-1'}
                  value={m.description || ''}
                  onChange={e => {
                    const updated = [...(form.milestones as any[])];
                    updated[i] = { ...updated[i], description: e.target.value };
                    set('milestones', updated);
                  }}
                  placeholder="Descrição do marco"
                />
                <button
                  onClick={() => set('milestones', (form.milestones as any[]).filter((_, idx) => idx !== i))}
                  className="p-2 text-zinc-600 hover:text-red-400 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            <button
              onClick={() => set('milestones', [...(form.milestones as any[]), { date: '', description: '' }])}
              className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors"
            >
              <Plus size={12} /> Adicionar Marco
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {(project?.milestones || []).length === 0 && <p className="text-zinc-600 text-sm">Nenhum marco cadastrado.</p>}
            {(project?.milestones || []).map((m: any) => (
              <div key={m.id} className="flex items-center gap-4 py-2 border-b border-white/5 last:border-0">
                <span className="text-[11px] font-mono text-blue-400 bg-blue-500/10 px-2 py-1 rounded">{m.date}</span>
                <span className="text-sm text-zinc-300">{m.description}</span>
              </div>
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}
