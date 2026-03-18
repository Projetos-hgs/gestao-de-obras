/**
 * Componente genérico de tabela CRUD para as páginas do sistema.
 * Reutilizado em: Equipe, Materiais, Financeiro, Contratos, Empresas, Documentação, Riscos, Qualidade
 */
import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, Edit3, Save, X } from 'lucide-react';
import { PageHeader, LoadingSpinner, EmptyState, StatusBadge } from './Layout';
import { api } from '../lib/api';
import type {
  TeamMember, Material, FinancialEntry, Contract,
  Company, LegalDocument, TechnicalProject, Risk, NonConformity
} from '../types';

const inputCls = 'bg-[#121418] border border-white/10 rounded-lg px-3 py-2 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-blue-500/50 transition-colors w-full';

// ─────────────────────────────────────────────────
// EQUIPE
// ─────────────────────────────────────────────────
const TEAM_EMPTY = { name: '', role: '', company: '', status: 'Ativo' };

export function EquipePage() {
  const [projectId, setProjectId] = useState<string | null>(null);
  const [items, setItems] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<any>(TEAM_EMPTY);
  const [editing, setEditing] = useState<TeamMember | null>(null);
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
    try { setItems(await api.team.list(pid)); }
    catch (e) { console.error('[v0]', e); }
    finally { setLoading(false); }
  }

  async function save() {
    if (!projectId) return;
    setSaving(true);
    try {
      if (editing) await api.team.update(editing.id, form);
      else await api.team.create(projectId, form);
      await load(projectId);
      reset();
    } catch (e) { console.error('[v0]', e); }
    finally { setSaving(false); }
  }

  async function del(id: string) {
    try { await api.team.delete(id); setItems(p => p.filter(i => i.id !== id)); }
    catch (e) { console.error('[v0]', e); }
  }

  function startEdit(item: TeamMember) {
    setEditing(item);
    setForm({ name: item.name, role: item.role, company: item.company, status: item.status });
    setShowForm(true);
  }

  function reset() { setShowForm(false); setEditing(null); setForm(TEAM_EMPTY); }
  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <PageHeader
        title="Equipe e Mão de Obra"
        subtitle={`${items.length} membro(s) cadastrado(s)`}
        action={!showForm && (
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-xs font-bold text-white transition-all">
            <Plus size={13} /> Novo Membro
          </button>
        )}
      />

      {showForm && (
        <div className="bg-[#1C1F26] border border-blue-500/30 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">{editing ? 'Editar Membro' : 'Novo Membro'}</h3>
            <button onClick={reset} className="text-zinc-600 hover:text-zinc-300"><X size={16} /></button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { k: 'name', label: 'Nome', placeholder: 'Nome completo' },
              { k: 'role', label: 'Função', placeholder: 'Ex: Pedreiro' },
              { k: 'company', label: 'Empresa', placeholder: 'Nome da empresa' },
            ].map(f => (
              <div key={f.k} className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">{f.label}</label>
                <input className={inputCls} value={form[f.k]} onChange={e => set(f.k, e.target.value)} placeholder={f.placeholder} />
              </div>
            ))}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Status</label>
              <select className={inputCls} value={form.status} onChange={e => set('status', e.target.value)}>
                {['Ativo', 'Inativo', 'Afastado'].map(s => <option key={s} value={s}>{s}</option>)}
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

      {!projectId ? <EmptyState message="Crie um projeto no TAP primeiro." /> :
        items.length === 0 ? <EmptyState message="Nenhum membro cadastrado." /> : (
          <div className="bg-[#1C1F26] border border-white/5 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  {['Nome', 'Função', 'Empresa', 'Status', ''].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-[9px] font-bold text-zinc-600 uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {items.map(item => (
                  <tr key={item.id} className="hover:bg-white/3 transition-colors">
                    <td className="px-5 py-3 text-sm font-bold text-zinc-200">{item.name}</td>
                    <td className="px-5 py-3 text-xs text-zinc-400">{item.role}</td>
                    <td className="px-5 py-3 text-xs text-zinc-400">{item.company}</td>
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

// ─────────────────────────────────────────────────
// MATERIAIS
// ─────────────────────────────────────────────────
const MAT_EMPTY = { name: '', required: '', received: '', unit: 'un', vendor: '', status: 'Pendente' };

export function MateriaisPage() {
  const [projectId, setProjectId] = useState<string | null>(null);
  const [items, setItems] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<any>(MAT_EMPTY);
  const [editing, setEditing] = useState<Material | null>(null);
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
    try { setItems(await api.materials.list(pid)); }
    catch (e) { console.error('[v0]', e); }
    finally { setLoading(false); }
  }

  async function save() {
    if (!projectId) return;
    setSaving(true);
    try {
      if (editing) await api.materials.update(editing.id, form);
      else await api.materials.create(projectId, form);
      await load(projectId);
      reset();
    } catch (e) { console.error('[v0]', e); }
    finally { setSaving(false); }
  }

  async function del(id: string) {
    try { await api.materials.delete(id); setItems(p => p.filter(i => i.id !== id)); }
    catch (e) { console.error('[v0]', e); }
  }

  function startEdit(item: Material) {
    setEditing(item);
    setForm({ name: item.name, required: item.required, received: item.received, unit: item.unit, vendor: item.vendor, status: item.status });
    setShowForm(true);
  }
  function reset() { setShowForm(false); setEditing(null); setForm(MAT_EMPTY); }
  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <PageHeader
        title="Materiais"
        subtitle={`${items.length} item(ns) cadastrado(s)`}
        action={!showForm && (
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-xs font-bold text-white transition-all">
            <Plus size={13} /> Novo Material
          </button>
        )}
      />

      {showForm && (
        <div className="bg-[#1C1F26] border border-blue-500/30 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">{editing ? 'Editar Material' : 'Novo Material'}</h3>
            <button onClick={reset} className="text-zinc-600 hover:text-zinc-300"><X size={16} /></button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { k: 'name', label: 'Material', placeholder: 'Ex: Cimento CP-II' },
              { k: 'required', label: 'Qtd. Requisitada', placeholder: 'Ex: 500' },
              { k: 'received', label: 'Qtd. Recebida', placeholder: 'Ex: 200' },
              { k: 'unit', label: 'Unidade', placeholder: 'Ex: sacos' },
              { k: 'vendor', label: 'Fornecedor', placeholder: 'Nome do fornecedor' },
            ].map(f => (
              <div key={f.k} className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">{f.label}</label>
                <input className={inputCls} value={form[f.k]} onChange={e => set(f.k, e.target.value)} placeholder={f.placeholder} />
              </div>
            ))}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Status</label>
              <select className={inputCls} value={form.status} onChange={e => set('status', e.target.value)}>
                {['Pendente', 'Parcialmente recebido', 'Recebido', 'Cancelado'].map(s => <option key={s}>{s}</option>)}
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

      {!projectId ? <EmptyState message="Crie um projeto no TAP primeiro." /> :
        items.length === 0 ? <EmptyState message="Nenhum material cadastrado." /> : (
          <div className="bg-[#1C1F26] border border-white/5 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  {['Material', 'Requisitado', 'Recebido', 'Unidade', 'Fornecedor', 'Status', ''].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-[9px] font-bold text-zinc-600 uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {items.map(item => (
                  <tr key={item.id} className="hover:bg-white/3 transition-colors">
                    <td className="px-5 py-3 text-sm font-bold text-zinc-200">{item.name}</td>
                    <td className="px-5 py-3 text-xs text-zinc-400">{item.required}</td>
                    <td className="px-5 py-3 text-xs text-zinc-400">{item.received}</td>
                    <td className="px-5 py-3 text-xs text-zinc-400">{item.unit}</td>
                    <td className="px-5 py-3 text-xs text-zinc-400">{item.vendor}</td>
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

// ─────────────────────────────────────────────────
// FINANCEIRO
// ─────────────────────────────────────────────────
const FIN_EMPTY = { company: '', service: '', value: '', payment_form: 'Boleto', deadline: '', status: 'Pendente' };

export function FinanceiroPage() {
  const [projectId, setProjectId] = useState<string | null>(null);
  const [items, setItems] = useState<FinancialEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<any>(FIN_EMPTY);
  const [editing, setEditing] = useState<FinancialEntry | null>(null);
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
    try { setItems(await api.financial.list(pid)); }
    catch (e) { console.error('[v0]', e); }
    finally { setLoading(false); }
  }

  async function save() {
    if (!projectId) return;
    setSaving(true);
    try {
      if (editing) await api.financial.update(editing.id, form);
      else await api.financial.create(projectId, form);
      await load(projectId);
      reset();
    } catch (e) { console.error('[v0]', e); }
    finally { setSaving(false); }
  }

  async function del(id: string) {
    try { await api.financial.delete(id); setItems(p => p.filter(i => i.id !== id)); }
    catch (e) { console.error('[v0]', e); }
  }

  function startEdit(item: FinancialEntry) {
    setEditing(item);
    setForm({ company: item.company, service: item.service, value: item.value, payment_form: item.payment_form, deadline: item.deadline, status: item.status });
    setShowForm(true);
  }
  function reset() { setShowForm(false); setEditing(null); setForm(FIN_EMPTY); }
  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  const total = items.reduce((a, i) => {
    const n = parseFloat(i.value?.replace(/[^0-9,.]/g, '').replace(',', '.') || '0');
    return a + (isNaN(n) ? 0 : n);
  }, 0);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <PageHeader
        title="Financeiro"
        subtitle={`${items.length} lançamento(s) • Total: R$ ${total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
        action={!showForm && (
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-xs font-bold text-white transition-all">
            <Plus size={13} /> Novo Lançamento
          </button>
        )}
      />

      {showForm && (
        <div className="bg-[#1C1F26] border border-blue-500/30 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">{editing ? 'Editar Lançamento' : 'Novo Lançamento'}</h3>
            <button onClick={reset} className="text-zinc-600 hover:text-zinc-300"><X size={16} /></button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { k: 'company', label: 'Empresa', placeholder: 'Nome da empresa' },
              { k: 'service', label: 'Serviço/Produto', placeholder: 'Descrição' },
              { k: 'value', label: 'Valor', placeholder: 'Ex: R$ 15.000,00' },
              { k: 'deadline', label: 'Vencimento', placeholder: '', type: 'date' },
            ].map(f => (
              <div key={f.k} className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">{f.label}</label>
                <input className={inputCls} type={f.type || 'text'} value={form[f.k]} onChange={e => set(f.k, e.target.value)} placeholder={f.placeholder} />
              </div>
            ))}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Forma de Pagamento</label>
              <select className={inputCls} value={form.payment_form} onChange={e => set('payment_form', e.target.value)}>
                {['Boleto', 'PIX', 'Transferência', 'Cheque', 'Dinheiro'].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Status</label>
              <select className={inputCls} value={form.status} onChange={e => set('status', e.target.value)}>
                {['Pendente', 'Pago', 'Em atraso', 'Cancelado'].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={reset} className="px-4 py-2 text-xs font-bold text-zinc-400 hover:text-zinc-200">Cancelar</button>
            <button onClick={save} disabled={saving || !form.company}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg text-xs font-bold text-white transition-all">
              <Save size={13} /> {saving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </div>
      )}

      {!projectId ? <EmptyState message="Crie um projeto no TAP primeiro." /> :
        items.length === 0 ? <EmptyState message="Nenhum lançamento financeiro cadastrado." /> : (
          <div className="bg-[#1C1F26] border border-white/5 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  {['Empresa', 'Serviço', 'Valor', 'Forma Pgto', 'Vencimento', 'Status', ''].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-[9px] font-bold text-zinc-600 uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {items.map(item => (
                  <tr key={item.id} className="hover:bg-white/3 transition-colors">
                    <td className="px-5 py-3 text-sm font-bold text-zinc-200">{item.company}</td>
                    <td className="px-5 py-3 text-xs text-zinc-400">{item.service}</td>
                    <td className="px-5 py-3 text-xs font-mono text-emerald-400">{item.value}</td>
                    <td className="px-5 py-3 text-xs text-zinc-400">{item.payment_form}</td>
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

// ─────────────────────────────────────────────────
// CONTRATOS
// ─────────────────────────────────────────────────
const CON_EMPTY = { company: '', scope: '', contract_number: '', value: '', deadline: '', warranty: '', status: 'Em vigor' };

export function ContratosPage() {
  const [projectId, setProjectId] = useState<string | null>(null);
  const [items, setItems] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<any>(CON_EMPTY);
  const [editing, setEditing] = useState<Contract | null>(null);
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
    try { setItems(await api.contracts.list(pid)); }
    catch (e) { console.error('[v0]', e); }
    finally { setLoading(false); }
  }

  async function save() {
    if (!projectId) return;
    setSaving(true);
    try {
      if (editing) await api.contracts.update(editing.id, form);
      else await api.contracts.create(projectId, form);
      await load(projectId);
      reset();
    } catch (e) { console.error('[v0]', e); }
    finally { setSaving(false); }
  }

  async function del(id: string) {
    try { await api.contracts.delete(id); setItems(p => p.filter(i => i.id !== id)); }
    catch (e) { console.error('[v0]', e); }
  }

  function startEdit(item: Contract) {
    setEditing(item);
    setForm({ company: item.company, scope: item.scope, contract_number: item.contract_number, value: item.value, deadline: item.deadline, warranty: item.warranty, status: item.status });
    setShowForm(true);
  }
  function reset() { setShowForm(false); setEditing(null); setForm(CON_EMPTY); }
  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <PageHeader
        title="Contratos"
        subtitle={`${items.length} contrato(s) cadastrado(s)`}
        action={!showForm && (
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-xs font-bold text-white transition-all">
            <Plus size={13} /> Novo Contrato
          </button>
        )}
      />

      {showForm && (
        <div className="bg-[#1C1F26] border border-blue-500/30 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">{editing ? 'Editar Contrato' : 'Novo Contrato'}</h3>
            <button onClick={reset} className="text-zinc-600 hover:text-zinc-300"><X size={16} /></button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { k: 'company', label: 'Empresa', placeholder: 'Nome da empresa' },
              { k: 'scope', label: 'Escopo', placeholder: 'Escopo do contrato' },
              { k: 'contract_number', label: 'Nº Contrato', placeholder: 'Ex: CT-001/2025' },
              { k: 'value', label: 'Valor', placeholder: 'Ex: R$ 120.000,00' },
              { k: 'deadline', label: 'Prazo', placeholder: 'Ex: 12 meses' },
              { k: 'warranty', label: 'Garantia', placeholder: 'Ex: 5 anos' },
            ].map(f => (
              <div key={f.k} className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">{f.label}</label>
                <input className={inputCls} value={form[f.k]} onChange={e => set(f.k, e.target.value)} placeholder={f.placeholder} />
              </div>
            ))}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Status</label>
              <select className={inputCls} value={form.status} onChange={e => set('status', e.target.value)}>
                {['Em vigor', 'Em andamento', 'Encerrado', 'Cancelado'].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={reset} className="px-4 py-2 text-xs font-bold text-zinc-400 hover:text-zinc-200">Cancelar</button>
            <button onClick={save} disabled={saving || !form.company}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg text-xs font-bold text-white transition-all">
              <Save size={13} /> {saving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </div>
      )}

      {!projectId ? <EmptyState message="Crie um projeto no TAP primeiro." /> :
        items.length === 0 ? <EmptyState message="Nenhum contrato cadastrado." /> : (
          <div className="bg-[#1C1F26] border border-white/5 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  {['Empresa', 'Escopo', 'Nº Contrato', 'Valor', 'Prazo', 'Garantia', 'Status', ''].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-[9px] font-bold text-zinc-600 uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {items.map(item => (
                  <tr key={item.id} className="hover:bg-white/3 transition-colors">
                    <td className="px-5 py-3 text-sm font-bold text-zinc-200">{item.company}</td>
                    <td className="px-5 py-3 text-xs text-zinc-400">{item.scope}</td>
                    <td className="px-5 py-3 text-xs font-mono text-zinc-300">{item.contract_number}</td>
                    <td className="px-5 py-3 text-xs font-mono text-emerald-400">{item.value}</td>
                    <td className="px-5 py-3 text-xs text-zinc-400">{item.deadline}</td>
                    <td className="px-5 py-3 text-xs text-zinc-400">{item.warranty}</td>
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
