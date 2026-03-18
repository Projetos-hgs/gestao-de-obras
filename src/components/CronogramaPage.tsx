import React, { useState, useEffect } from 'react';
import { Plus, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { api } from '../lib/api';
import { PageHeader, LoadingSpinner, EmptyState } from './Layout';
import type { ScheduleItem } from '../types';

const COLORS = [
  { label: 'Azul',    cls: 'bg-blue-500' },
  { label: 'Verde',   cls: 'bg-emerald-500' },
  { label: 'Roxo',    cls: 'bg-violet-500' },
  { label: 'Laranja', cls: 'bg-orange-500' },
  { label: 'Rosa',    cls: 'bg-pink-500' },
  { label: 'Amarelo', cls: 'bg-yellow-500' },
];

const inputCls = 'bg-[#121418] border border-white/10 rounded-lg px-3 py-2 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-blue-500/50 transition-colors';

export function CronogramaPage() {
  const [projectId, setProjectId] = useState<string | null>(null);
  const [items, setItems] = useState<ScheduleItem[]>([]);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [newItem, setNewItem] = useState({ name: '', progress: 0, color: 'bg-blue-500', is_milestone: false });

  useEffect(() => {
    api.projects.list().then(projs => {
      if (projs.length > 0) {
        setProjectId(projs[0].id);
        loadItems(projs[0].id);
      } else {
        setLoading(false);
      }
    }).catch(err => { console.error('[v0]', err); setLoading(false); });
  }, []);

  async function loadItems(pid: string) {
    setLoading(true);
    try {
      const data = await api.schedule.list(pid);
      setItems(data);
    } catch (err) {
      console.error('[v0] Erro ao carregar cronograma:', err);
    } finally {
      setLoading(false);
    }
  }

  async function addItem() {
    if (!projectId || !newItem.name.trim()) return;
    try {
      await api.schedule.create(projectId, { ...newItem, sort_order: items.length });
      await loadItems(projectId);
      setNewItem({ name: '', progress: 0, color: 'bg-blue-500', is_milestone: false });
      setAdding(false);
    } catch (err) {
      console.error('[v0] Erro ao adicionar item:', err);
    }
  }

  async function updateProgress(item: ScheduleItem, progress: number) {
    try {
      await api.schedule.update(item.id, { ...item, progress });
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, progress } : i));
    } catch (err) {
      console.error('[v0] Erro ao atualizar progresso:', err);
    }
  }

  async function deleteItem(id: string) {
    try {
      await api.schedule.delete(id);
      setItems(prev => prev.filter(i => i.id !== id));
    } catch (err) {
      console.error('[v0] Erro ao deletar item:', err);
    }
  }

  const toggle = (id: string) =>
    setExpanded(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });

  const avgProgress = items.length
    ? Math.round(items.reduce((a, i) => a + i.progress, 0) / items.length)
    : 0;

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <PageHeader
        title="Cronograma"
        subtitle="Controle de etapas e progresso da obra"
        action={
          <button
            onClick={() => setAdding(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-xs font-bold text-white transition-all"
          >
            <Plus size={13} /> Nova Etapa
          </button>
        }
      />

      {/* Progresso geral */}
      <div className="bg-[#1C1F26] border border-white/5 rounded-xl p-6">
        <div className="flex justify-between mb-2">
          <span className="text-sm font-bold text-white">Progresso Geral</span>
          <span className="text-sm font-bold text-blue-400">{avgProgress}%</span>
        </div>
        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full transition-all duration-700"
            style={{ width: `${avgProgress}%` }}
          />
        </div>
        <p className="text-[10px] text-zinc-600 mt-2">{items.length} etapas cadastradas</p>
      </div>

      {/* Formulário de adição */}
      {adding && (
        <div className="bg-[#1C1F26] border border-blue-500/30 rounded-xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-white">Nova Etapa</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Nome da Etapa</label>
              <input
                className={inputCls}
                value={newItem.name}
                onChange={e => setNewItem(n => ({ ...n, name: e.target.value }))}
                placeholder="Ex: Fundação"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Progresso: {newItem.progress}%</label>
              <input
                type="range" min={0} max={100}
                value={newItem.progress}
                onChange={e => setNewItem(n => ({ ...n, progress: Number(e.target.value) }))}
                className="accent-blue-500"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Cor</label>
              <div className="flex gap-2">
                {COLORS.map(c => (
                  <button
                    key={c.cls}
                    onClick={() => setNewItem(n => ({ ...n, color: c.cls }))}
                    className={`w-6 h-6 rounded-full ${c.cls} transition-all ${newItem.color === c.cls ? 'ring-2 ring-white ring-offset-1 ring-offset-[#1C1F26] scale-110' : 'opacity-60'}`}
                  />
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="milestone"
                checked={newItem.is_milestone}
                onChange={e => setNewItem(n => ({ ...n, is_milestone: e.target.checked }))}
                className="accent-blue-500"
              />
              <label htmlFor="milestone" className="text-xs text-zinc-400">É um marco?</label>
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <button onClick={() => setAdding(false)} className="px-4 py-2 text-xs font-bold text-zinc-400 hover:text-zinc-200 transition-colors">
              Cancelar
            </button>
            <button onClick={addItem} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-xs font-bold text-white transition-all">
              Adicionar
            </button>
          </div>
        </div>
      )}

      {/* Lista de etapas */}
      {!projectId ? (
        <EmptyState message="Crie um projeto no TAP para cadastrar o cronograma." />
      ) : items.length === 0 ? (
        <EmptyState message="Nenhuma etapa cadastrada." />
      ) : (
        <div className="space-y-3">
          {items.map(item => (
            <div key={item.id} className="bg-[#1C1F26] border border-white/5 rounded-xl overflow-hidden">
              <div className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  {item.tasks && item.tasks.length > 0 && (
                    <button onClick={() => toggle(item.id)} className="text-zinc-600 hover:text-zinc-300 transition-colors">
                      {expanded.has(item.id) ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </button>
                  )}
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${item.color || 'bg-blue-500'}`} />
                  <span className="text-sm font-bold text-zinc-200 flex-1">{item.name}</span>
                  {item.is_milestone && (
                    <span className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 rounded text-[10px] font-bold text-amber-400 uppercase">
                      Marco
                    </span>
                  )}
                  <span className="text-sm font-bold text-zinc-300 w-10 text-right">{item.progress}%</span>
                  <button
                    onClick={() => deleteItem(item.id)}
                    className="text-zinc-600 hover:text-red-400 transition-colors p-1"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <div className="h-1.5 flex-1 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${item.color || 'bg-blue-500'}`}
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                  <input
                    type="range" min={0} max={100}
                    value={item.progress}
                    onChange={e => updateProgress(item, Number(e.target.value))}
                    className="w-24 accent-blue-500"
                  />
                </div>
              </div>

              {expanded.has(item.id) && item.tasks && item.tasks.length > 0 && (
                <div className="border-t border-white/5 px-5 py-3 space-y-2">
                  {item.tasks.map(task => (
                    <div key={task.id} className="flex items-center gap-2 text-xs text-zinc-400">
                      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${task.completed ? 'bg-emerald-500' : 'bg-zinc-600'}`} />
                      <span className={task.completed ? 'line-through text-zinc-600' : ''}>{task.text}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
