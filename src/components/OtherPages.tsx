import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit3, Save, X } from 'lucide-react';
import { api } from '../lib/api';
import { PageHeader, LoadingSpinner, EmptyState, StatusBadge } from './Layout';
import type { Company, LegalDocument, TechnicalProject, Risk, NonConformity } from '../types';

const inputCls = 'bg-[#121418] border border-white/10 rounded-lg px-3 py-2 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-blue-500/50 transition-colors w-full';

// ─────────────────────────────────────────────────
// EMPRESAS
// ─────────────────────────────────────────────────
const COMP_EMPTY = { name: '', cnpj: '', contact: '', email: '', phone: '', type: 'Fornecedor' };

export function EmpresasPage() {
  const [items, setItems] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<any>(COMP_EMPTY);
  const [editing, setEditing] = useState<Company | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try { setItems(await api.companies.list()); }
    catch (e) { console.error('[v0]', e); }
    finally { setLoading(false); }
  }

  async function save() {
    setSaving(true);
    try {
      if (editing) await api.companies.update(editing.id, form);
      else await api.companies.create(form);
      await load();
      reset();
    } catch (e) { console.error('[v0]', e); }
    finally { setSaving(false); }
  }

  async function del(id: string) {
    try { await api.companies.delete(id); setItems(p => p.filter(i => i.id !== id)); }
    catch (e) { console.error('[v0]', e); }
  }

  function startEdit(item: Company) {
    setEditing(item);
    setForm({ name: item.name, cnpj: item.cnpj, contact: item.contact, email: item.email, phone: item.phone, type: item.type });
    setShowForm(true);
  }
  function reset() { setShowForm(false); setEditing(null); setForm(COMP_EMPTY); }
  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <PageHeader
        title="Empresas e Fornecedores"
        subtitle={`${items.length} empresa(s) cadastrada(s)`}
        action={!showForm && (
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-xs font-bold text-white transition-all">
            <Plus size={13} /> Nova Empresa
          </button>
        )}
      />

      {showForm && (
        <div className="bg-[#1C1F26] border border-blue-500/30 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">{editing ? 'Editar Empresa' : 'Nova Empresa'}</h3>
            <button onClick={reset} className="text-zinc-600 hover:text-zinc-300"><X size={16} /></button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { k: 'name', label: 'Razão Social', placeholder: 'Nome da empresa' },
              { k: 'cnpj', label: 'CNPJ', placeholder: '00.000.000/0000-00' },
              { k: 'contact', label: 'Contato', placeholder: 'Nome do contato' },
              { k: 'email', label: 'E-mail', placeholder: 'email@empresa.com' },
              { k: 'phone', label: 'Telefone', placeholder: '(00) 00000-0000' },
            ].map(f => (
              <div key={f.k} className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">{f.label}</label>
                <input className={inputCls} value={form[f.k]} onChange={e => set(f.k, e.target.value)} placeholder={f.placeholder} />
              </div>
            ))}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Tipo</label>
              <select className={inputCls} value={form.type} onChange={e => set('type', e.target.value)}>
                {['Fornecedor', 'Empreiteira', 'Consultoria', 'Fiscalização', 'Outro'].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={reset} className="px-4 py-2 text-xs font-bold text-zinc-400 hover:text-zinc-200">Cancelar</button>
            <button onClick={save} disabled={saving || !form.name}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg text-xs font-bold text-white transition-all">
              <Save size={13} /> {saving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </div>
      )}

      {items.length === 0 ? <EmptyState message="Nenhuma empresa cadastrada." /> : (
        <div className="bg-[#1C1F26] border border-white/5 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                {['Razão Social', 'CNPJ', 'Contato', 'E-mail', 'Telefone', 'Tipo', ''].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-[9px] font-bold text-zinc-600 uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {items.map(item => (
                <tr key={item.id} className="hover:bg-white/3 transition-colors">
                  <td className="px-5 py-3 text-sm font-bold text-zinc-200">{item.name}</td>
                  <td className="px-5 py-3 text-xs font-mono text-zinc-400">{item.cnpj}</td>
                  <td className="px-5 py-3 text-xs text-zinc-400">{item.contact}</td>
                  <td className="px-5 py-3 text-xs text-zinc-400">{item.email}</td>
                  <td className="px-5 py-3 text-xs text-zinc-400">{item.phone}</td>
                  <td className="px-5 py-3 text-xs text-zinc-400">{item.type}</td>
                  <td className="px-5 py-3">
                    <div className="flex gap-1 justify-end">
                      <button onClick={() => startEdit(item)} className="p-1.5 text-zinc-600 hover:text-zinc-300 rounded hover:bg-white/5"><Edit3 size={13} /></button>
                      <button onClick={() => del(item.id)} className="p-1.5 text-zinc-600 hover:text-red-400 rounded hover:bg-white/5"><Trash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────
// DOCUMENTAÇÃO
// ─────────────────────────────────────────────────
const DOC_EMPTY = { document: '', organization: '', requested_date: '', sent_date: '', approved_date: '', status: 'Pendente' };
const TECH_EMPTY = { name: '', responsible: '', version: '', date: '', observations: '', status: 'Pendente' };

export function DocumentacaoPage() {
  const [projectId, setProjectId] = useState<string | null>(null);
  const [legalDocs, setLegalDocs] = useState<LegalDocument[]>([]);
  const [techProjects, setTechProjects] = useState<TechnicalProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'legal' | 'tech'>('legal');
  const [form, setForm] = useState<any>(DOC_EMPTY);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.projects.list().then(p => {
      if (p.length > 0) { setProjectId(p[0].id); load(p[0].id); }
      else setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  async function load(pid: string) {
    setLoading(true);
    try {
      const [legal, tech] = await Promise.all([
        api.legalDocs.list(pid),
        api.technicalProjects.list(pid),
      ]);
      setLegalDocs(legal);
      setTechProjects(tech);
    } catch (e) { console.error('[v0]', e); }
    finally { setLoading(false); }
  }

  async function saveLegal() {
    if (!projectId) return;
    setSaving(true);
    try {
      if (editingId) await api.legalDocs.update(editingId, form);
      else await api.legalDocs.create(projectId, form);
      await load(projectId);
      reset();
    } catch (e) { console.error('[v0]', e); }
    finally { setSaving(false); }
  }

  async function saveTech() {
    if (!projectId) return;
    setSaving(true);
    try {
      if (editingId) await api.technicalProjects.update(editingId, form);
      else await api.technicalProjects.create(projectId, form);
      await load(projectId);
      reset();
    } catch (e) { console.error('[v0]', e); }
    finally { setSaving(false); }
  }

  async function delLegal(id: string) {
    try { await api.legalDocs.delete(id); setLegalDocs(p => p.filter(i => i.id !== id)); }
    catch (e) { console.error('[v0]', e); }
  }

  async function delTech(id: string) {
    try { await api.technicalProjects.delete(id); setTechProjects(p => p.filter(i => i.id !== id)); }
    catch (e) { console.error('[v0]', e); }
  }

  function reset() {
    setShowForm(false);
    setEditingId(null);
    setForm(activeTab === 'legal' ? DOC_EMPTY : TECH_EMPTY);
  }

  const changeTab = (tab: 'legal' | 'tech') => { setActiveTab(tab); reset(); };
  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <PageHeader
        title="Documentação"
        subtitle="Documentos legais e projetos técnicos"
        action={!showForm && (
          <button
            onClick={() => { setForm(activeTab === 'legal' ? DOC_EMPTY : TECH_EMPTY); setShowForm(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-xs font-bold text-white transition-all">
            <Plus size={13} /> Novo
          </button>
        )}
      />

      <div className="flex gap-1 bg-[#1C1F26] border border-white/5 rounded-xl p-1 w-fit">
        {(['legal', 'tech'] as const).map(tab => (
          <button key={tab} onClick={() => changeTab(tab)}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === tab ? 'bg-blue-600 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>
            {tab === 'legal' ? 'Documentos Legais' : 'Projetos Técnicos'}
          </button>
        ))}
      </div>

      {showForm && activeTab === 'legal' && (
        <div className="bg-[#1C1F26] border border-blue-500/30 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">{editingId ? 'Editar Documento' : 'Novo Documento Legal'}</h3>
            <button onClick={reset} className="text-zinc-600 hover:text-zinc-300"><X size={16} /></button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { k: 'document', label: 'Documento', placeholder: 'Ex: Alvará de Construção' },
              { k: 'organization', label: 'Órgão', placeholder: 'Ex: Prefeitura' },
              { k: 'requested_date', label: 'Data Requisição', type: 'date' },
              { k: 'sent_date', label: 'Data Envio', type: 'date' },
              { k: 'approved_date', label: 'Data Aprovação', type: 'date' },
            ].map(f => (
              <div key={f.k} className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">{f.label}</label>
                <input className={inputCls} type={f.type || 'text'} value={form[f.k] || ''} onChange={e => set(f.k, e.target.value)} placeholder={(f as any).placeholder || ''} />
              </div>
            ))}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Status</label>
              <select className={inputCls} value={form.status} onChange={e => set('status', e.target.value)}>
                {['Pendente', 'Em análise', 'Aprovado', 'Rejeitado'].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={reset} className="px-4 py-2 text-xs font-bold text-zinc-400 hover:text-zinc-200">Cancelar</button>
            <button onClick={saveLegal} disabled={saving || !form.document}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg text-xs font-bold text-white transition-all">
              <Save size={13} /> {saving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </div>
      )}

      {showForm && activeTab === 'tech' && (
        <div className="bg-[#1C1F26] border border-blue-500/30 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">{editingId ? 'Editar Projeto Técnico' : 'Novo Projeto Técnico'}</h3>
            <button onClick={reset} className="text-zinc-600 hover:text-zinc-300"><X size={16} /></button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { k: 'name', label: 'Projeto', placeholder: 'Ex: Projeto Estrutural' },
              { k: 'responsible', label: 'Responsável', placeholder: 'Nome do responsável' },
              { k: 'version', label: 'Versão', placeholder: 'Ex: Rev. 02' },
              { k: 'date', label: 'Data', type: 'date' },
              { k: 'observations', label: 'Observações', placeholder: 'Observações adicionais' },
            ].map(f => (
              <div key={f.k} className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">{f.label}</label>
                <input className={inputCls} type={f.type || 'text'} value={form[f.k] || ''} onChange={e => set(f.k, e.target.value)} placeholder={(f as any).placeholder || ''} />
              </div>
            ))}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Status</label>
              <select className={inputCls} value={form.status} onChange={e => set('status', e.target.value)}>
                {['Pendente', 'Em revisão', 'Aprovado', 'Cancelado'].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={reset} className="px-4 py-2 text-xs font-bold text-zinc-400 hover:text-zinc-200">Cancelar</button>
            <button onClick={saveTech} disabled={saving || !form.name}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg text-xs font-bold text-white transition-all">
              <Save size={13} /> {saving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </div>
      )}

      {!projectId ? <EmptyState message="Crie um projeto no TAP primeiro." /> : (
        activeTab === 'legal' ? (
          legalDocs.length === 0 ? <EmptyState message="Nenhum documento legal cadastrado." /> : (
            <div className="bg-[#1C1F26] border border-white/5 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    {['Documento', 'Órgão', 'Requisição', 'Envio', 'Aprovação', 'Status', ''].map(h => (
                      <th key={h} className="px-5 py-3 text-left text-[9px] font-bold text-zinc-600 uppercase tracking-widest">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {legalDocs.map(item => (
                    <tr key={item.id} className="hover:bg-white/3 transition-colors">
                      <td className="px-5 py-3 text-sm font-bold text-zinc-200">{item.document}</td>
                      <td className="px-5 py-3 text-xs text-zinc-400">{item.organization}</td>
                      <td className="px-5 py-3 text-xs text-zinc-400">{item.requested_date}</td>
                      <td className="px-5 py-3 text-xs text-zinc-400">{item.sent_date}</td>
                      <td className="px-5 py-3 text-xs text-zinc-400">{item.approved_date}</td>
                      <td className="px-5 py-3"><StatusBadge status={item.status} /></td>
                      <td className="px-5 py-3">
                        <button onClick={() => delLegal(item.id)} className="p-1.5 text-zinc-600 hover:text-red-400 rounded hover:bg-white/5"><Trash2 size={13} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          techProjects.length === 0 ? <EmptyState message="Nenhum projeto técnico cadastrado." /> : (
            <div className="bg-[#1C1F26] border border-white/5 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    {['Projeto', 'Responsável', 'Versão', 'Data', 'Observações', 'Status', ''].map(h => (
                      <th key={h} className="px-5 py-3 text-left text-[9px] font-bold text-zinc-600 uppercase tracking-widest">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {techProjects.map(item => (
                    <tr key={item.id} className="hover:bg-white/3 transition-colors">
                      <td className="px-5 py-3 text-sm font-bold text-zinc-200">{item.name}</td>
                      <td className="px-5 py-3 text-xs text-zinc-400">{item.responsible}</td>
                      <td className="px-5 py-3 text-xs font-mono text-zinc-400">{item.version}</td>
                      <td className="px-5 py-3 text-xs text-zinc-400">{item.date}</td>
                      <td className="px-5 py-3 text-xs text-zinc-400">{item.observations}</td>
                      <td className="px-5 py-3"><StatusBadge status={item.status} /></td>
                      <td className="px-5 py-3">
                        <button onClick={() => delTech(item.id)} className="p-1.5 text-zinc-600 hover:text-red-400 rounded hover:bg-white/5"><Trash2 size={13} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────
// RISCOS
// ─────────────────────────────────────────────────
const RISK_EMPTY = { level: 'MEDIO' as const, title: '', description: '', color: 'bg-amber-500/10' };
const RISK_COLORS: Record<string, string> = {
  ALTO: 'bg-red-500/10 border-red-500/20 text-red-400',
  MEDIO: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
  BAIXO: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
};

export function RiscosPage() {
  const [projectId, setProjectId] = useState<string | null>(null);
  const [items, setItems] = useState<Risk[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<any>(RISK_EMPTY);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.projects.list().then(p => {
      if (p.length > 0) { setProjectId(p[0].id); load(p[0].id); }
      else setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  async function load(pid: string) {
    setLoading(true);
    try { setItems(await api.risks.list(pid)); }
    catch (e) { console.error('[v0]', e); }
    finally { setLoading(false); }
  }

  async function save() {
    if (!projectId) return;
    setSaving(true);
    const colorMap: Record<string, string> = {
      ALTO: 'bg-red-500/10', MEDIO: 'bg-amber-500/10', BAIXO: 'bg-emerald-500/10'
    };
    try {
      await api.risks.create(projectId, { ...form, color: colorMap[form.level] });
      await load(projectId);
      reset();
    } catch (e) { console.error('[v0]', e); }
    finally { setSaving(false); }
  }

  async function del(id: string) {
    try { await api.risks.delete(id); setItems(p => p.filter(i => i.id !== id)); }
    catch (e) { console.error('[v0]', e); }
  }

  function reset() { setShowForm(false); setForm(RISK_EMPTY); }
  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  const grouped = { ALTO: items.filter(r => r.level === 'ALTO'), MEDIO: items.filter(r => r.level === 'MEDIO'), BAIXO: items.filter(r => r.level === 'BAIXO') };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <PageHeader
        title="Gestão de Riscos"
        subtitle={`${items.length} risco(s) identificado(s)`}
        action={!showForm && (
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-xs font-bold text-white transition-all">
            <Plus size={13} /> Novo Risco
          </button>
        )}
      />

      {showForm && (
        <div className="bg-[#1C1F26] border border-blue-500/30 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Novo Risco</h3>
            <button onClick={reset} className="text-zinc-600 hover:text-zinc-300"><X size={16} /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Nível</label>
              <select className={inputCls} value={form.level} onChange={e => set('level', e.target.value)}>
                {['ALTO', 'MEDIO', 'BAIXO'].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="md:col-span-2 flex flex-col gap-1">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Título</label>
              <input className={inputCls} value={form.title} onChange={e => set('title', e.target.value)} placeholder="Ex: Atraso na entrega de materiais" />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Descrição / Mitigação</label>
            <textarea
              className={inputCls + ' min-h-[80px] resize-none'}
              value={form.description}
              onChange={e => set('description', e.target.value)}
              placeholder="Descreva o risco e as ações de mitigação..."
            />
          </div>
          <div className="flex gap-2">
            <button onClick={reset} className="px-4 py-2 text-xs font-bold text-zinc-400 hover:text-zinc-200">Cancelar</button>
            <button onClick={save} disabled={saving || !form.title}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg text-xs font-bold text-white transition-all">
              <Save size={13} /> {saving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </div>
      )}

      {!projectId ? <EmptyState message="Crie um projeto no TAP primeiro." /> : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(['ALTO', 'MEDIO', 'BAIXO'] as const).map(level => (
            <div key={level}>
              <div className={`px-4 py-2 rounded-t-xl border-t border-x font-bold text-xs uppercase tracking-wider text-center ${RISK_COLORS[level]}`}>
                {level === 'MEDIO' ? 'MÉDIO' : level}
                <span className="ml-2 opacity-70">({grouped[level].length})</span>
              </div>
              <div className="space-y-2 p-2 bg-[#1C1F26] border border-white/5 rounded-b-xl min-h-[100px]">
                {grouped[level].length === 0 && (
                  <p className="text-center text-zinc-700 text-xs py-4">Nenhum risco</p>
                )}
                {grouped[level].map(risk => (
                  <div key={risk.id} className={`p-3 rounded-lg border text-xs ${RISK_COLORS[level]}`}>
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-bold">{risk.title}</p>
                      <button onClick={() => del(risk.id)} className="flex-shrink-0 opacity-50 hover:opacity-100 transition-opacity">
                        <Trash2 size={12} />
                      </button>
                    </div>
                    {risk.description && <p className="mt-1 opacity-70 leading-relaxed">{risk.description}</p>}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────
// QUALIDADE
// ─────────────────────────────────────────────────
const NC_EMPTY = { item: '', description: '', responsible: '', deadline: '', status: 'Aberto' };

export function QualidadePage() {
  const [projectId, setProjectId] = useState<string | null>(null);
  const [items, setItems] = useState<NonConformity[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<any>(NC_EMPTY);
  const [editing, setEditing] = useState<NonConformity | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.projects.list().then(p => {
      if (p.length > 0) { setProjectId(p[0].id); load(p[0].id); }
      else setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  async function load(pid: string) {
    setLoading(true);
    try { setItems(await api.nonConformities.list(pid)); }
    catch (e) { console.error('[v0]', e); }
    finally { setLoading(false); }
  }

  async function save() {
    if (!projectId) return;
    setSaving(true);
    try {
      if (editing) await api.nonConformities.update(editing.id, form);
      else await api.nonConformities.create(projectId, form);
      await load(projectId);
      reset();
    } catch (e) { console.error('[v0]', e); }
    finally { setSaving(false); }
  }

  async function del(id: string) {
    try { await api.nonConformities.delete(id); setItems(p => p.filter(i => i.id !== id)); }
    catch (e) { console.error('[v0]', e); }
  }

  function startEdit(item: NonConformity) {
    setEditing(item);
    setForm({ item: item.item, description: item.description, responsible: item.responsible, deadline: item.deadline, status: item.status });
    setShowForm(true);
  }
  function reset() { setShowForm(false); setEditing(null); setForm(NC_EMPTY); }
  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  const abertos = items.filter(i => i.status === 'Aberto').length;
  const resolvidos = items.filter(i => i.status === 'Resolvido').length;

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <PageHeader
        title="Controle de Qualidade"
        subtitle={`${abertos} aberto(s) • ${resolvidos} resolvido(s)`}
        action={!showForm && (
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-xs font-bold text-white transition-all">
            <Plus size={13} /> Nova NC
          </button>
        )}
      />

      {showForm && (
        <div className="bg-[#1C1F26] border border-blue-500/30 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">{editing ? 'Editar Não Conformidade' : 'Nova Não Conformidade'}</h3>
            <button onClick={reset} className="text-zinc-600 hover:text-zinc-300"><X size={16} /></button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { k: 'item', label: 'Item/Elemento', placeholder: 'Ex: Laje do 2º pavimento' },
              { k: 'responsible', label: 'Responsável', placeholder: 'Nome do responsável' },
              { k: 'deadline', label: 'Prazo', type: 'date' },
            ].map(f => (
              <div key={f.k} className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">{f.label}</label>
                <input className={inputCls} type={f.type || 'text'} value={form[f.k] || ''} onChange={e => set(f.k, e.target.value)} placeholder={(f as any).placeholder || ''} />
              </div>
            ))}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Status</label>
              <select className={inputCls} value={form.status} onChange={e => set('status', e.target.value)}>
                {['Aberto', 'Em tratamento', 'Resolvido', 'Cancelado'].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Descrição da Não Conformidade</label>
            <textarea
              className={inputCls + ' min-h-[80px] resize-none'}
              value={form.description}
              onChange={e => set('description', e.target.value)}
              placeholder="Descreva a não conformidade..."
            />
          </div>
          <div className="flex gap-2">
            <button onClick={reset} className="px-4 py-2 text-xs font-bold text-zinc-400 hover:text-zinc-200">Cancelar</button>
            <button onClick={save} disabled={saving || !form.item}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg text-xs font-bold text-white transition-all">
              <Save size={13} /> {saving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </div>
      )}

      {!projectId ? <EmptyState message="Crie um projeto no TAP primeiro." /> :
        items.length === 0 ? <EmptyState message="Nenhuma não conformidade registrada." /> : (
          <div className="bg-[#1C1F26] border border-white/5 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  {['Item', 'Descrição', 'Responsável', 'Prazo', 'Status', ''].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-[9px] font-bold text-zinc-600 uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {items.map(item => (
                  <tr key={item.id} className="hover:bg-white/3 transition-colors">
                    <td className="px-5 py-3 text-sm font-bold text-zinc-200">{item.item}</td>
                    <td className="px-5 py-3 text-xs text-zinc-400 max-w-[220px] truncate">{item.description}</td>
                    <td className="px-5 py-3 text-xs text-zinc-400">{item.responsible}</td>
                    <td className="px-5 py-3 text-xs text-zinc-400">{item.deadline}</td>
                    <td className="px-5 py-3"><StatusBadge status={item.status} /></td>
                    <td className="px-5 py-3">
                      <div className="flex gap-1 justify-end">
                        <button onClick={() => startEdit(item)} className="p-1.5 text-zinc-600 hover:text-zinc-300 rounded hover:bg-white/5"><Edit3 size={13} /></button>
                        <button onClick={() => del(item.id)} className="p-1.5 text-zinc-600 hover:text-red-400 rounded hover:bg-white/5"><Trash2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
    </div>
  );
}
