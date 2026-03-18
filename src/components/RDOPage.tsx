import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit3, Save, X } from 'lucide-react';
import { api } from '../lib/api';
import { PageHeader, LoadingSpinner, EmptyState, StatusBadge } from './Layout';
import type { RDO } from '../types';

const inputCls = 'bg-[#121418] border border-white/10 rounded-lg px-3 py-2 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-blue-500/50 transition-colors w-full';
const EMPTY: Omit<RDO, 'id' | 'project_id'> = { date: '', description: '', weather: 'Ensolarado', workers: 0 };
const WEATHERS = ['Ensolarado', 'Nublado', 'Chuvoso', 'Parcialmente nublado', 'Tempestade'];

export function RDOPage() {
  const [projectId, setProjectId] = useState<string | null>(null);
  const [rdos, setRdos] = useState<RDO[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<RDO | null>(null);
  const [form, setForm] = useState<Omit<RDO, 'id' | 'project_id'>>(EMPTY);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.projects.list().then(projs => {
      if (projs.length > 0) { setProjectId(projs[0].id); load(projs[0].id); }
      else setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  async function load(pid: string) {
    setLoading(true);
    try { setRdos(await api.rdos.list(pid)); }
    catch (err) { console.error('[v0]', err); }
    finally { setLoading(false); }
  }

  async function save() {
    if (!projectId) return;
    setSaving(true);
    try {
      if (editing) {
        await api.rdos.update(editing.id, form);
      } else {
        await api.rdos.create(projectId, form);
      }
      await load(projectId);
      reset();
    } catch (err) { console.error('[v0]', err); }
    finally { setSaving(false); }
  }

  function startEdit(rdo: RDO) {
    setEditing(rdo);
    setForm({ date: rdo.date, description: rdo.description, weather: rdo.weather, workers: rdo.workers });
    setShowForm(true);
  }

  function reset() { setShowForm(false); setEditing(null); setForm(EMPTY); }

  async function del(id: string) {
    if (!projectId) return;
    try { await api.rdos.delete(id); setRdos(prev => prev.filter(r => r.id !== id)); }
    catch (err) { console.error('[v0]', err); }
  }

  const set = (k: keyof typeof form, v: any) => setForm(f => ({ ...f, [k]: v }));

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <PageHeader
        title="RDO — Relatório Diário de Obra"
        subtitle={`${rdos.length} relatório(s) registrado(s)`}
        action={
          !showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-xs font-bold text-white transition-all"
            >
              <Plus size={13} /> Novo RDO
            </button>
          )
        }
      />

      {showForm && (
        <div className="bg-[#1C1F26] border border-blue-500/30 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">{editing ? 'Editar RDO' : 'Novo RDO'}</h3>
            <button onClick={reset} className="text-zinc-600 hover:text-zinc-300 transition-colors"><X size={16} /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Data</label>
              <input className={inputCls} type="date" value={form.date} onChange={e => set('date', e.target.value)} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Clima</label>
              <select className={inputCls} value={form.weather} onChange={e => set('weather', e.target.value)}>
                {WEATHERS.map(w => <option key={w} value={w}>{w}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Trabalhadores</label>
              <input className={inputCls} type="number" min={0} value={form.workers} onChange={e => set('workers', Number(e.target.value))} />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Descrição das Atividades</label>
            <textarea
              className={inputCls + ' min-h-[100px] resize-none'}
              value={form.description}
              onChange={e => set('description', e.target.value)}
              placeholder="Descreva as atividades realizadas no dia..."
            />
          </div>
          <div className="flex gap-2 pt-2">
            <button onClick={reset} className="px-4 py-2 text-xs font-bold text-zinc-400 hover:text-zinc-200 transition-colors">Cancelar</button>
            <button
              onClick={save}
              disabled={saving || !form.date || !form.description}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg text-xs font-bold text-white transition-all"
            >
              <Save size={13} /> {saving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </div>
      )}

      {!projectId ? (
        <EmptyState message="Crie um projeto no TAP para registrar RDOs." />
      ) : rdos.length === 0 ? (
        <EmptyState message="Nenhum RDO registrado ainda." />
      ) : (
        <div className="space-y-3">
          {rdos.map(rdo => (
            <div key={rdo.id} className="bg-[#1C1F26] border border-white/5 rounded-xl p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-mono font-bold text-blue-400 bg-blue-500/10 px-2 py-1 rounded">
                    {new Date(rdo.date).toLocaleDateString('pt-BR')}
                  </span>
                  <span className="text-xs text-zinc-400">{rdo.weather}</span>
                  <span className="text-xs text-zinc-500">{rdo.workers} trabalhador(es)</span>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => startEdit(rdo)} className="p-1.5 text-zinc-600 hover:text-zinc-300 transition-colors rounded hover:bg-white/5">
                    <Edit3 size={13} />
                  </button>
                  <button onClick={() => del(rdo.id)} className="p-1.5 text-zinc-600 hover:text-red-400 transition-colors rounded hover:bg-white/5">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
              <p className="text-sm text-zinc-400 leading-relaxed">{rdo.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
