// API middleware integrado ao Vite — sem servidor separado, sem proxy para porta 3001
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import type { Plugin, ViteDevServer } from 'vite';

function apiMiddlewarePlugin(databaseUrl: string): Plugin {
  return {
    name: 'api-middleware',
    apply: 'serve',
    async configureServer(server: ViteDevServer) {
      if (!databaseUrl) {
        console.warn('[api] DATABASE_URL não configurada — rotas /api retornarão 503');
      }

      const { neon } = await import('@neondatabase/serverless');
      const sql = databaseUrl ? neon(databaseUrl) : null;

      function json(res: any, status: number, data: any) {
        res.statusCode = status;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(data));
      }

      function readBody(req: any): Promise<any> {
        return new Promise((resolve) => {
          let body = '';
          req.on('data', (chunk: any) => { body += chunk; });
          req.on('end', () => {
            try { resolve(body ? JSON.parse(body) : {}); }
            catch { resolve({}); }
          });
        });
      }

      server.middlewares.use(async (req: any, res: any, next: any) => {
        if (!req.url?.startsWith('/api')) return next();

        if (!sql) {
          return json(res, 503, { error: 'DATABASE_URL não configurada. Adicione a variável nas configurações do projeto.' });
        }

        const url = new URL(req.url, 'http://localhost');
        const p = url.pathname.replace(/^\/api/, '');
        const method = req.method?.toUpperCase();

        try {
          // ── PROJECTS ──────────────────────────────────────────
          if (method === 'GET' && p === '/projects') {
            const rows = await sql`SELECT * FROM projects ORDER BY created_at DESC`;
            return json(res, 200, rows);
          }
          if (method === 'GET' && /^\/projects\/[^/]+$/.test(p)) {
            const id = p.split('/')[2];
            const [project] = await sql`SELECT * FROM projects WHERE id=${id}`;
            if (!project) return json(res, 404, { error: 'Não encontrado' });
            const [objectives, requirements, tapRisks, stakeholders, milestones] = await Promise.all([
              sql`SELECT * FROM project_objectives WHERE project_id=${id} ORDER BY sort_order`,
              sql`SELECT * FROM project_requirements WHERE project_id=${id} ORDER BY sort_order`,
              sql`SELECT * FROM project_tap_risks WHERE project_id=${id} ORDER BY sort_order`,
              sql`SELECT * FROM project_stakeholders WHERE project_id=${id}`,
              sql`SELECT * FROM project_milestones WHERE project_id=${id} ORDER BY sort_order`,
            ]);
            return json(res, 200, { ...project, objectives, requirements, tapRisks, stakeholders, milestones });
          }
          if (method === 'POST' && p === '/projects') {
            const b = await readBody(req);
            const [row] = await sql`
              INSERT INTO projects (name, justification, budget, manager, sponsor, start_date, area, project_type, cno, location, status)
              VALUES (${b.name}, ${b.justification}, ${b.budget}, ${b.manager}, ${b.sponsor}, ${b.start_date}, ${b.area}, ${b.project_type}, ${b.cno}, ${b.location}, ${b.status ?? 'Em andamento'})
              RETURNING *`;
            return json(res, 201, row);
          }
          if (method === 'PUT' && /^\/projects\/[^/]+$/.test(p)) {
            const id = p.split('/')[2];
            const b = await readBody(req);
            const [row] = await sql`
              UPDATE projects SET name=${b.name}, justification=${b.justification}, budget=${b.budget},
                manager=${b.manager}, sponsor=${b.sponsor}, start_date=${b.start_date}, area=${b.area},
                project_type=${b.project_type}, cno=${b.cno}, location=${b.location}, status=${b.status}, updated_at=NOW()
              WHERE id=${id} RETURNING *`;
            return json(res, 200, row);
          }
          if (method === 'DELETE' && /^\/projects\/[^/]+$/.test(p)) {
            const id = p.split('/')[2];
            await sql`DELETE FROM projects WHERE id=${id}`;
            res.statusCode = 204; res.end(); return;
          }

          // ── TAP ────────────────────────────────────────────────
          if (method === 'PUT' && /^\/projects\/[^/]+\/tap$/.test(p)) {
            const id = p.split('/')[2];
            const b = await readBody(req);
            await sql`DELETE FROM project_objectives WHERE project_id=${id}`;
            await sql`DELETE FROM project_requirements WHERE project_id=${id}`;
            await sql`DELETE FROM project_tap_risks WHERE project_id=${id}`;
            await sql`DELETE FROM project_stakeholders WHERE project_id=${id}`;
            await sql`DELETE FROM project_milestones WHERE project_id=${id}`;
            if (b.objectives?.length) for (let i = 0; i < b.objectives.length; i++)
              await sql`INSERT INTO project_objectives (project_id, text, sort_order) VALUES (${id}, ${b.objectives[i]}, ${i})`;
            if (b.requirements?.length) for (let i = 0; i < b.requirements.length; i++)
              await sql`INSERT INTO project_requirements (project_id, text, sort_order) VALUES (${id}, ${b.requirements[i]}, ${i})`;
            if (b.tapRisks?.length) for (let i = 0; i < b.tapRisks.length; i++)
              await sql`INSERT INTO project_tap_risks (project_id, text, sort_order) VALUES (${id}, ${b.tapRisks[i]}, ${i})`;
            if (b.stakeholders?.length) for (const s of b.stakeholders)
              await sql`INSERT INTO project_stakeholders (project_id, name) VALUES (${id}, ${s})`;
            if (b.milestones?.length) for (let i = 0; i < b.milestones.length; i++) {
              const m = b.milestones[i];
              await sql`INSERT INTO project_milestones (project_id, date, description, sort_order) VALUES (${id}, ${m.date}, ${m.description}, ${i})`;
            }
            return json(res, 200, { success: true });
          }

          // ── CRONOGRAMA ─────────────────────────────────────────
          if (method === 'GET' && /^\/projects\/[^/]+\/schedule$/.test(p)) {
            const id = p.split('/')[2];
            const items = await sql`SELECT * FROM schedule_items WHERE project_id=${id} ORDER BY sort_order`;
            const result = await Promise.all(items.map(async (item: any) => {
              const tasks = await sql!`SELECT * FROM schedule_tasks WHERE schedule_item_id=${item.id}`;
              return { ...item, tasks };
            }));
            return json(res, 200, result);
          }
          if (method === 'POST' && /^\/projects\/[^/]+\/schedule$/.test(p)) {
            const id = p.split('/')[2];
            const b = await readBody(req);
            const [row] = await sql`
              INSERT INTO schedule_items (project_id, name, progress, color, is_milestone, sort_order)
              VALUES (${id}, ${b.name}, ${b.progress ?? 0}, ${b.color ?? 'bg-blue-500'}, ${b.is_milestone ?? false}, ${b.sort_order ?? 0})
              RETURNING *`;
            return json(res, 201, row);
          }
          if (method === 'PUT' && /^\/schedule\/[^/]+$/.test(p)) {
            const id = p.split('/')[2];
            const b = await readBody(req);
            const [row] = await sql`
              UPDATE schedule_items SET name=${b.name}, progress=${b.progress}, color=${b.color},
                is_milestone=${b.is_milestone}, sort_order=${b.sort_order}, updated_at=NOW()
              WHERE id=${id} RETURNING *`;
            return json(res, 200, row);
          }
          if (method === 'DELETE' && /^\/schedule\/[^/]+$/.test(p)) {
            const id = p.split('/')[2];
            await sql`DELETE FROM schedule_items WHERE id=${id}`;
            res.statusCode = 204; res.end(); return;
          }

          // ── RDO ────────────────────────────────────────────────
          if (method === 'GET' && /^\/projects\/[^/]+\/rdos$/.test(p)) {
            const id = p.split('/')[2];
            const rows = await sql`SELECT * FROM rdos WHERE project_id=${id} ORDER BY date DESC`;
            return json(res, 200, rows);
          }
          if (method === 'POST' && /^\/projects\/[^/]+\/rdos$/.test(p)) {
            const id = p.split('/')[2];
            const b = await readBody(req);
            const [row] = await sql`
              INSERT INTO rdos (project_id, date, description, weather, workers)
              VALUES (${id}, ${b.date}, ${b.description}, ${b.weather}, ${b.workers ?? 0}) RETURNING *`;
            return json(res, 201, row);
          }
          if (method === 'PUT' && /^\/rdos\/[^/]+$/.test(p)) {
            const id = p.split('/')[2];
            const b = await readBody(req);
            const [row] = await sql`
              UPDATE rdos SET date=${b.date}, description=${b.description}, weather=${b.weather}, workers=${b.workers}, updated_at=NOW()
              WHERE id=${id} RETURNING *`;
            return json(res, 200, row);
          }
          if (method === 'DELETE' && /^\/rdos\/[^/]+$/.test(p)) {
            const id = p.split('/')[2];
            await sql`DELETE FROM rdos WHERE id=${id}`;
            res.statusCode = 204; res.end(); return;
          }

          // ── EQUIPE ─────────────────────────────────────────────
          if (method === 'GET' && /^\/projects\/[^/]+\/team$/.test(p)) {
            const id = p.split('/')[2];
            const rows = await sql`SELECT * FROM team_members WHERE project_id=${id} ORDER BY created_at`;
            return json(res, 200, rows);
          }
          if (method === 'POST' && /^\/projects\/[^/]+\/team$/.test(p)) {
            const id = p.split('/')[2];
            const b = await readBody(req);
            const [row] = await sql`
              INSERT INTO team_members (project_id, name, role, company, status)
              VALUES (${id}, ${b.name}, ${b.role}, ${b.company}, ${b.status ?? 'Ativo'}) RETURNING *`;
            return json(res, 201, row);
          }
          if (method === 'PUT' && /^\/team\/[^/]+$/.test(p)) {
            const id = p.split('/')[2];
            const b = await readBody(req);
            const [row] = await sql`
              UPDATE team_members SET name=${b.name}, role=${b.role}, company=${b.company}, status=${b.status}, updated_at=NOW()
              WHERE id=${id} RETURNING *`;
            return json(res, 200, row);
          }
          if (method === 'DELETE' && /^\/team\/[^/]+$/.test(p)) {
            const id = p.split('/')[2];
            await sql`DELETE FROM team_members WHERE id=${id}`;
            res.statusCode = 204; res.end(); return;
          }

          // ── MATERIAIS ──────────────────────────────────────────
          if (method === 'GET' && /^\/projects\/[^/]+\/materials$/.test(p)) {
            const id = p.split('/')[2];
            const rows = await sql`SELECT * FROM materials WHERE project_id=${id} ORDER BY created_at`;
            return json(res, 200, rows);
          }
          if (method === 'POST' && /^\/projects\/[^/]+\/materials$/.test(p)) {
            const id = p.split('/')[2];
            const b = await readBody(req);
            const [row] = await sql`
              INSERT INTO materials (project_id, name, required, received, unit, vendor, status)
              VALUES (${id}, ${b.name}, ${b.required}, ${b.received}, ${b.unit}, ${b.vendor}, ${b.status ?? 'Pendente'}) RETURNING *`;
            return json(res, 201, row);
          }
          if (method === 'PUT' && /^\/materials\/[^/]+$/.test(p)) {
            const id = p.split('/')[2];
            const b = await readBody(req);
            const [row] = await sql`
              UPDATE materials SET name=${b.name}, required=${b.required}, received=${b.received},
                unit=${b.unit}, vendor=${b.vendor}, status=${b.status}, updated_at=NOW()
              WHERE id=${id} RETURNING *`;
            return json(res, 200, row);
          }
          if (method === 'DELETE' && /^\/materials\/[^/]+$/.test(p)) {
            const id = p.split('/')[2];
            await sql`DELETE FROM materials WHERE id=${id}`;
            res.statusCode = 204; res.end(); return;
          }

          // ── FINANCEIRO ─────────────────────────────────────────
          if (method === 'GET' && /^\/projects\/[^/]+\/financial$/.test(p)) {
            const id = p.split('/')[2];
            const rows = await sql`SELECT * FROM financial_entries WHERE project_id=${id} ORDER BY created_at`;
            return json(res, 200, rows);
          }
          if (method === 'POST' && /^\/projects\/[^/]+\/financial$/.test(p)) {
            const id = p.split('/')[2];
            const b = await readBody(req);
            const [row] = await sql`
              INSERT INTO financial_entries (project_id, company, service, value, payment_form, deadline, status)
              VALUES (${id}, ${b.company}, ${b.service}, ${b.value}, ${b.payment_form}, ${b.deadline}, ${b.status ?? 'Pendente'}) RETURNING *`;
            return json(res, 201, row);
          }
          if (method === 'PUT' && /^\/financial\/[^/]+$/.test(p)) {
            const id = p.split('/')[2];
            const b = await readBody(req);
            const [row] = await sql`
              UPDATE financial_entries SET company=${b.company}, service=${b.service}, value=${b.value},
                payment_form=${b.payment_form}, deadline=${b.deadline}, status=${b.status}, updated_at=NOW()
              WHERE id=${id} RETURNING *`;
            return json(res, 200, row);
          }
          if (method === 'DELETE' && /^\/financial\/[^/]+$/.test(p)) {
            const id = p.split('/')[2];
            await sql`DELETE FROM financial_entries WHERE id=${id}`;
            res.statusCode = 204; res.end(); return;
          }

          // ── CONTRATOS ──────────────────────────────────────────
          if (method === 'GET' && /^\/projects\/[^/]+\/contracts$/.test(p)) {
            const id = p.split('/')[2];
            const rows = await sql`SELECT * FROM contracts WHERE project_id=${id} ORDER BY created_at`;
            return json(res, 200, rows);
          }
          if (method === 'POST' && /^\/projects\/[^/]+\/contracts$/.test(p)) {
            const id = p.split('/')[2];
            const b = await readBody(req);
            const [row] = await sql`
              INSERT INTO contracts (project_id, company, scope, contract_number, value, deadline, warranty, status)
              VALUES (${id}, ${b.company}, ${b.scope}, ${b.contract_number}, ${b.value}, ${b.deadline}, ${b.warranty}, ${b.status ?? 'Em vigor'}) RETURNING *`;
            return json(res, 201, row);
          }
          if (method === 'PUT' && /^\/contracts\/[^/]+$/.test(p)) {
            const id = p.split('/')[2];
            const b = await readBody(req);
            const [row] = await sql`
              UPDATE contracts SET company=${b.company}, scope=${b.scope}, contract_number=${b.contract_number},
                value=${b.value}, deadline=${b.deadline}, warranty=${b.warranty}, status=${b.status}, updated_at=NOW()
              WHERE id=${id} RETURNING *`;
            return json(res, 200, row);
          }
          if (method === 'DELETE' && /^\/contracts\/[^/]+$/.test(p)) {
            const id = p.split('/')[2];
            await sql`DELETE FROM contracts WHERE id=${id}`;
            res.statusCode = 204; res.end(); return;
          }

          // ── EMPRESAS ──────────────────────────────────────────
          if (method === 'GET' && p === '/companies') {
            const rows = await sql`SELECT * FROM companies ORDER BY name`;
            return json(res, 200, rows);
          }
          if (method === 'POST' && p === '/companies') {
            const b = await readBody(req);
            const [row] = await sql`
              INSERT INTO companies (name, cnpj, contact, email, phone, type)
              VALUES (${b.name}, ${b.cnpj}, ${b.contact}, ${b.email}, ${b.phone}, ${b.type}) RETURNING *`;
            return json(res, 201, row);
          }
          if (method === 'PUT' && /^\/companies\/[^/]+$/.test(p)) {
            const id = p.split('/')[2];
            const b = await readBody(req);
            const [row] = await sql`
              UPDATE companies SET name=${b.name}, cnpj=${b.cnpj}, contact=${b.contact},
                email=${b.email}, phone=${b.phone}, type=${b.type}, updated_at=NOW()
              WHERE id=${id} RETURNING *`;
            return json(res, 200, row);
          }
          if (method === 'DELETE' && /^\/companies\/[^/]+$/.test(p)) {
            const id = p.split('/')[2];
            await sql`DELETE FROM companies WHERE id=${id}`;
            res.statusCode = 204; res.end(); return;
          }

          // ── DOCUMENTAÇÃO LEGAL ─────────────────────────────────
          if (method === 'GET' && /^\/projects\/[^/]+\/legal-docs$/.test(p)) {
            const id = p.split('/')[2];
            const rows = await sql`SELECT * FROM legal_documents WHERE project_id=${id} ORDER BY created_at`;
            return json(res, 200, rows);
          }
          if (method === 'POST' && /^\/projects\/[^/]+\/legal-docs$/.test(p)) {
            const id = p.split('/')[2];
            const b = await readBody(req);
            const [row] = await sql`
              INSERT INTO legal_documents (project_id, document, organization, requested_date, sent_date, approved_date, status)
              VALUES (${id}, ${b.document}, ${b.organization}, ${b.requested_date}, ${b.sent_date}, ${b.approved_date}, ${b.status ?? 'Pendente'}) RETURNING *`;
            return json(res, 201, row);
          }
          if (method === 'PUT' && /^\/legal-docs\/[^/]+$/.test(p)) {
            const id = p.split('/')[2];
            const b = await readBody(req);
            const [row] = await sql`
              UPDATE legal_documents SET document=${b.document}, organization=${b.organization},
                requested_date=${b.requested_date}, sent_date=${b.sent_date}, approved_date=${b.approved_date},
                status=${b.status}, updated_at=NOW()
              WHERE id=${id} RETURNING *`;
            return json(res, 200, row);
          }
          if (method === 'DELETE' && /^\/legal-docs\/[^/]+$/.test(p)) {
            const id = p.split('/')[2];
            await sql`DELETE FROM legal_documents WHERE id=${id}`;
            res.statusCode = 204; res.end(); return;
          }

          // ── PROJETOS TÉCNICOS ──────────────────────────────────
          if (method === 'GET' && /^\/projects\/[^/]+\/technical-projects$/.test(p)) {
            const id = p.split('/')[2];
            const rows = await sql`SELECT * FROM technical_projects WHERE project_id=${id} ORDER BY created_at`;
            return json(res, 200, rows);
          }
          if (method === 'POST' && /^\/projects\/[^/]+\/technical-projects$/.test(p)) {
            const id = p.split('/')[2];
            const b = await readBody(req);
            const [row] = await sql`
              INSERT INTO technical_projects (project_id, name, responsible, version, date, observations, status)
              VALUES (${id}, ${b.name}, ${b.responsible}, ${b.version}, ${b.date}, ${b.observations}, ${b.status ?? 'Pendente'}) RETURNING *`;
            return json(res, 201, row);
          }
          if (method === 'PUT' && /^\/technical-projects\/[^/]+$/.test(p)) {
            const id = p.split('/')[2];
            const b = await readBody(req);
            const [row] = await sql`
              UPDATE technical_projects SET name=${b.name}, responsible=${b.responsible}, version=${b.version},
                date=${b.date}, observations=${b.observations}, status=${b.status}, updated_at=NOW()
              WHERE id=${id} RETURNING *`;
            return json(res, 200, row);
          }
          if (method === 'DELETE' && /^\/technical-projects\/[^/]+$/.test(p)) {
            const id = p.split('/')[2];
            await sql`DELETE FROM technical_projects WHERE id=${id}`;
            res.statusCode = 204; res.end(); return;
          }

          // ── RISCOS ─────────────────────────────────────────────
          if (method === 'GET' && /^\/projects\/[^/]+\/risks$/.test(p)) {
            const id = p.split('/')[2];
            const rows = await sql`SELECT * FROM risks WHERE project_id=${id} ORDER BY created_at`;
            return json(res, 200, rows);
          }
          if (method === 'POST' && /^\/projects\/[^/]+\/risks$/.test(p)) {
            const id = p.split('/')[2];
            const b = await readBody(req);
            const [row] = await sql`
              INSERT INTO risks (project_id, level, title, description, color)
              VALUES (${id}, ${b.level}, ${b.title}, ${b.description}, ${b.color ?? 'bg-red-500/10'}) RETURNING *`;
            return json(res, 201, row);
          }
          if (method === 'PUT' && /^\/risks\/[^/]+$/.test(p)) {
            const id = p.split('/')[2];
            const b = await readBody(req);
            const [row] = await sql`
              UPDATE risks SET level=${b.level}, title=${b.title}, description=${b.description}, color=${b.color}, updated_at=NOW()
              WHERE id=${id} RETURNING *`;
            return json(res, 200, row);
          }
          if (method === 'DELETE' && /^\/risks\/[^/]+$/.test(p)) {
            const id = p.split('/')[2];
            await sql`DELETE FROM risks WHERE id=${id}`;
            res.statusCode = 204; res.end(); return;
          }

          // ── QUALIDADE ──────────────────────────────────────────
          if (method === 'GET' && /^\/projects\/[^/]+\/non-conformities$/.test(p)) {
            const id = p.split('/')[2];
            const rows = await sql`SELECT * FROM non_conformities WHERE project_id=${id} ORDER BY created_at`;
            return json(res, 200, rows);
          }
          if (method === 'POST' && /^\/projects\/[^/]+\/non-conformities$/.test(p)) {
            const id = p.split('/')[2];
            const b = await readBody(req);
            const [row] = await sql`
              INSERT INTO non_conformities (project_id, item, description, responsible, deadline, status)
              VALUES (${id}, ${b.item}, ${b.description}, ${b.responsible}, ${b.deadline}, ${b.status ?? 'Aberto'}) RETURNING *`;
            return json(res, 201, row);
          }
          if (method === 'PUT' && /^\/non-conformities\/[^/]+$/.test(p)) {
            const id = p.split('/')[2];
            const b = await readBody(req);
            const [row] = await sql`
              UPDATE non_conformities SET item=${b.item}, description=${b.description}, responsible=${b.responsible},
                deadline=${b.deadline}, status=${b.status}, updated_at=NOW()
              WHERE id=${id} RETURNING *`;
            return json(res, 200, row);
          }
          if (method === 'DELETE' && /^\/non-conformities\/[^/]+$/.test(p)) {
            const id = p.split('/')[2];
            await sql`DELETE FROM non_conformities WHERE id=${id}`;
            res.statusCode = 204; res.end(); return;
          }

          // ── ALERTAS ────────────────────────────────────────────
          if (method === 'GET' && p === '/alerts') {
            const rows = await sql`SELECT * FROM alerts WHERE resolved=false ORDER BY created_at DESC`;
            return json(res, 200, rows);
          }
          if (method === 'POST' && p === '/alerts') {
            const b = await readBody(req);
            const [row] = await sql`
              INSERT INTO alerts (project_id, text, type)
              VALUES (${b.project_id ?? null}, ${b.text}, ${b.type}) RETURNING *`;
            return json(res, 201, row);
          }
          if (method === 'PUT' && /^\/alerts\/[^/]+\/resolve$/.test(p)) {
            const id = p.split('/')[2];
            const [row] = await sql`UPDATE alerts SET resolved=true WHERE id=${id} RETURNING *`;
            return json(res, 200, row);
          }

          return json(res, 404, { error: 'Rota não encontrada' });

        } catch (e: any) {
          console.error('[api]', e.message);
          return json(res, 500, { error: e.message });
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const dbUrl = env.DATABASE_URL || process.env.DATABASE_URL || '';

  return {
    plugins: [react(), tailwindcss(), apiMiddlewarePlugin(dbUrl)],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY || ''),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify — file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
