import React, { useState, useEffect } from 'react';
import { TrendingUp, AlertTriangle, CheckCircle2, Users, Package, DollarSign, FileText, Clock } from 'lucide-react';
import { api } from '../lib/api';
import { PageHeader, LoadingSpinner, StatusBadge } from './Layout';
import type { Project, Alert, RDO, ScheduleItem } from '../types';

export function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [rdos, setRdos] = useState<RDO[]>([]);
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [projs, alts] = await Promise.all([
          api.projects.list(),
          api.alerts.list(),
        ]);
        setProjects(projs);
        setAlerts(alts.filter((a: Alert) => !a.resolved));

        if (projs.length > 0) {
          const [rdoData, schedData] = await Promise.all([
            api.rdos.list(projs[0].id),
            api.schedule.list(projs[0].id),
          ]);
          setRdos(rdoData);
          setSchedule(schedData);
        }
      } catch (err) {
        console.error('[v0] Erro ao carregar dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <LoadingSpinner />;

  const project = projects[0];
  const avgProgress = schedule.length
    ? Math.round(schedule.reduce((a, s) => a + s.progress, 0) / schedule.length)
    : 0;
  const lastRdo = rdos[0];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <PageHeader title="Dashboard" subtitle="Visão geral do projeto" />

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: 'Progresso Geral',
            value: `${avgProgress}%`,
            icon: TrendingUp,
            color: 'text-blue-400',
            bg: 'bg-blue-500/10',
          },
          {
            label: 'Alertas Ativos',
            value: alerts.length,
            icon: AlertTriangle,
            color: 'text-amber-400',
            bg: 'bg-amber-500/10',
          },
          {
            label: 'Etapas',
            value: schedule.length,
            icon: Clock,
            color: 'text-violet-400',
            bg: 'bg-violet-500/10',
          },
          {
            label: 'RDOs',
            value: rdos.length,
            icon: FileText,
            color: 'text-emerald-400',
            bg: 'bg-emerald-500/10',
          },
        ].map(kpi => (
          <div key={kpi.label} className="bg-[#1C1F26] border border-white/5 rounded-xl p-5 flex items-center gap-4">
            <div className={`w-10 h-10 ${kpi.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
              <kpi.icon size={18} className={kpi.color} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider">{kpi.label}</p>
              <p className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Projeto ativo */}
      {project && (
        <div className="bg-[#1C1F26] border border-white/5 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white">Projeto Ativo</h3>
            <StatusBadge status={project.status} />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            {[
              { label: 'Nome', value: project.name },
              { label: 'Gestor', value: project.manager || '—' },
              { label: 'Orçamento', value: project.budget || '—' },
              { label: 'Início', value: project.start_date || '—' },
            ].map(f => (
              <div key={f.label}>
                <p className="text-zinc-600 font-bold uppercase tracking-wider text-[9px] mb-0.5">{f.label}</p>
                <p className="text-zinc-200 font-medium">{f.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cronograma resumido */}
      {schedule.length > 0 && (
        <div className="bg-[#1C1F26] border border-white/5 rounded-xl p-6">
          <h3 className="text-sm font-bold text-white mb-4">Cronograma — Progresso</h3>
          <div className="space-y-3">
            {schedule.slice(0, 6).map(item => (
              <div key={item.id}>
                <div className="flex justify-between mb-1">
                  <span className="text-xs text-zinc-300">{item.name}</span>
                  <span className="text-xs font-bold text-zinc-400">{item.progress}%</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all duration-500"
                    style={{ width: `${item.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Alertas */}
      {alerts.length > 0 && (
        <div className="bg-[#1C1F26] border border-white/5 rounded-xl p-6">
          <h3 className="text-sm font-bold text-white mb-4">Alertas Ativos</h3>
          <div className="space-y-2">
            {alerts.map(alert => (
              <div
                key={alert.id}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg border text-xs ${
                  alert.type === 'error'
                    ? 'bg-red-500/5 border-red-500/20 text-red-400'
                    : alert.type === 'warning'
                    ? 'bg-amber-500/5 border-amber-500/20 text-amber-400'
                    : 'bg-blue-500/5 border-blue-500/20 text-blue-400'
                }`}
              >
                <AlertTriangle size={14} />
                <span>{alert.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Último RDO */}
      {lastRdo && (
        <div className="bg-[#1C1F26] border border-white/5 rounded-xl p-6">
          <h3 className="text-sm font-bold text-white mb-4">Último RDO</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs mb-3">
            {[
              { label: 'Data', value: new Date(lastRdo.date).toLocaleDateString('pt-BR') },
              { label: 'Clima', value: lastRdo.weather },
              { label: 'Trabalhadores', value: String(lastRdo.workers) },
            ].map(f => (
              <div key={f.label}>
                <p className="text-zinc-600 font-bold uppercase tracking-wider text-[9px] mb-0.5">{f.label}</p>
                <p className="text-zinc-200 font-medium">{f.value}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">{lastRdo.description}</p>
        </div>
      )}

      {!project && (
        <div className="bg-[#1C1F26] border border-white/5 rounded-xl p-12 text-center">
          <p className="text-zinc-600 text-sm">Nenhum projeto cadastrado. Crie um projeto no TAP para começar.</p>
        </div>
      )}
    </div>
  );
}
