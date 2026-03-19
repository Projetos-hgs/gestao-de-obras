/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Sidebar, Header, NAV_ITEMS } from './components/Layout';
import { DashboardPage }  from './components/DashboardPage';
import { TAPPage }        from './components/TAPPage';
import { CronogramaView as CronogramaPage } from './components/CronogramaView';
import { RDOPage }        from './components/RDOPage';
import {
  EquipePage,
  MateriaisPage,
  FinanceiroPage,
  ContratosPage,
} from './components/CRUDPages';
import {
  EmpresasPage,
  DocumentacaoPage,
  RiscosPage,
  QualidadePage,
} from './components/OtherPages';

function TitleUpdater() {
  const location = useLocation();

  useEffect(() => {
    const active = NAV_ITEMS.find(item =>
      item.path === '/' ? location.pathname === '/' : location.pathname.startsWith(item.path)
    );
    const label = active?.label ?? 'Dashboard';
    document.title = `Gestor de Obras - ${label}`;
  }, [location.pathname]);

  return null;
}

export default function App() {
  return (
    <div className="min-h-screen bg-[#121418] text-zinc-300 font-sans flex">
      <TitleUpdater />
      <Sidebar />

      <div className="flex-1 ml-64 min-h-screen flex flex-col">
        <Header />

        <main className="flex-1 p-8 w-full max-w-7xl mx-auto">
          <Routes>
            <Route path="/"             element={<DashboardPage />} />
            <Route path="/tap"          element={<TAPPage />} />
            <Route path="/cronograma"   element={<CronogramaPage />} />
            <Route path="/rdo"          element={<RDOPage />} />
            <Route path="/equipe"       element={<EquipePage />} />
            <Route path="/materiais"    element={<MateriaisPage />} />
            <Route path="/financeiro"   element={<FinanceiroPage />} />
            <Route path="/contratos"    element={<ContratosPage />} />
            <Route path="/empresas"     element={<EmpresasPage />} />
            <Route path="/documentacao" element={<DocumentacaoPage />} />
            <Route path="/riscos"       element={<RiscosPage />} />
            <Route path="/qualidade"    element={<QualidadePage />} />
          </Routes>
        </main>

        <footer className="px-8 py-4 border-t border-white/5 text-center">
          <p className="text-[10px] text-zinc-700 uppercase tracking-widest font-bold">
            VP Construtora • Gestão de Obras • {new Date().getFullYear()}
          </p>
        </footer>
      </div>
    </div>
  );
}
