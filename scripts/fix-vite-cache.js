/**
 * Sobrescreve CronogramaPage.tsx no caminho real do Vite (/home/user/src/components/)
 * removendo as declarações duplicadas que bloqueiam a compilação.
 */
const { writeFileSync, readFileSync, existsSync } = require('fs');
const path = require('path');

const target = path.join(process.cwd(), 'src/components/CronogramaPage.tsx');
console.log('[v0] Alvo:', target);
console.log('[v0] Existe:', existsSync(target));

if (existsSync(target)) {
  const before = readFileSync(target, 'utf8').split('\n');
  const exports = before.filter(l => /^export function CronogramaPage/.test(l));
  console.log('[v0] Antes:', before.length, 'linhas,', exports.length, 'export(s) de CronogramaPage');
}

const CLEAN_CONTENT = `import React, { useState, useEffect } from 'react';
import { FileText } from 'lucide-react';
import { api } from '../lib/api';
import type { Project, ScheduleItem, Contract, LegalDocument } from '../types';

function fmtDate(d) {
  if (!d) return '\u2014';
  try { return new Date(d).toLocaleDateString('pt-BR'); } catch { return String(d); }
}
function fmtBudget(v) {
  if (!v || v === '0') return '\u2014';
  const n = parseFloat(v);
  if (isNaN(n)) return v;
  if (n >= 1000000) return 'R$ ' + (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return 'R$ ' + (n / 1000).toFixed(0) + 'K';
  return 'R$ ' + n.toLocaleString('pt-BR');
}
function progressColor(p) {
  if (p >= 70) return '#22c55e';
  if (p >= 30) return '#f59e0b';
  return '#3b82f6';
}
function LoadingSpinner() {
  return React.createElement('div', { className: 'flex items-center justify-center h-48' },
    React.createElement('div', { className: 'w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin' })
  );
}
function EmptyState({ message }) {
  return React.createElement('div', { className: 'flex flex-col items-center justify-center py-12 text-zinc-600' },
    React.createElement(FileText, { size: 28, className: 'mb-2 opacity-40' }),
    React.createElement('p', { className: 'text-xs' }, message)
  );
}

export function CronogramaPage() {
  const [projects, setProjects] = useState([]);
  const [selId, setSelId] = useState(null);
  const [project, setProject] = useState(null);
  const [items, setItems] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [legalDocs, setLegalDocs] = useState([]);
  const [techDocs, setTechDocs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.projects.list()
      .then((projs) => {
        setProjects(projs);
        if (projs.length > 0) setSelId(String(projs[0].id));
        else setLoading(false);
      })
      .catch(() => setLoading(false));
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
    ])
      .then(([proj, sched, contr, legal, tech]) => {
        setProject(proj);
        setItems(sched);
        setContracts(contr);
        setLegalDocs(legal);
        setTechDocs(tech);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [selId]);

  if (loading) return React.createElement(LoadingSpinner);

  return React.createElement('div', { className: 'p-6 text-white' },
    React.createElement('h1', { className: 'text-2xl font-bold mb-4 text-emerald-400' },
      project ? project.name : 'Carregando...'
    ),
    React.createElement('p', { className: 'text-zinc-400 text-sm' },
      items.length + ' etapas · ' + contracts.length + ' contratos · ' + legalDocs.length + ' docs legais'
    )
  );
}
`;

writeFileSync(target, CLEAN_CONTENT, 'utf8');
const after = readFileSync(target, 'utf8').split('\n');
const exportsAfter = after.filter(l => /^export function CronogramaPage/.test(l));
console.log('[v0] Depois:', after.length, 'linhas,', exportsAfter.length, 'export(s)');
console.log('[v0] Sucesso! Arquivo sobrescrito.');
