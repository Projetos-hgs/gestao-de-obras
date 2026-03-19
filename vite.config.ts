import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import type { Plugin } from 'vite';
// cache bust: 1

/**
 * Plugin de API inline — sem servidor separado, sem proxy para porta 3001.
 * O cliente Neon é criado de forma lazy (por request) para nunca lançar
 * exceção durante a inicialização do Vite (evita "server restart failed").
 */
function apiPlugin(): Plugin {
  return {
    name: 'api-middleware',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        // Só intercepta rotas /api/*
        if (!req.url?.startsWith('/api')) return next();

        const dbUrl =
          process.env.DATABASE_URL ||
          process.env.VITE_DATABASE_URL ||
          '';

        function json(status: number, data: unknown) {
          res.statusCode = status;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(data));
        }

        if (!dbUrl) {
          return json(503, {
            error:
              'DATABASE_URL não configurada. Adicione a variável nas configurações do projeto (Settings → Vars).',
          });
        }

        function readBody(r: typeof req): Promise<Record<string, any>> {
          return new Promise((resolve) => {
            let raw = '';
            r.on('data', (chunk) => { raw += chunk; });
            r.on('end', () => {
              try { resolve(raw ? JSON.parse(raw) : {}); }
              catch { resolve({}); }
            });
          });
        }

        try {
          // Importação dinâmica + instância lazy por request
          const { neon } = await import('@neondatabase/serverless');
          const sql = neon(dbUrl);

          const url = new URL(req.url!, 'http://localhost');
          const p = url.pathname.replace(/^\/api/, '');
          const m = req.method?.toUpperCase() ?? 'GET';

          // ── PROJECTS ────────────────────────────────────────────
          if (m === 'GET' && p === '/projects') {
            return json(200, await sql`SELECT * FROM projects ORDER BY created_at DESC`);
          }
          if (m === 'GET' && /^\/projects\/[^/]+$/.test(p)) {
            const id = p.split('/')[2];
            const [project] = await sql`SELECT * FROM projects WHERE id=${id}`;
            if (!project) return json(404, { error: 'Não encontrado' });
            const [objectives, requirements, tapRisks, stakeholders, milestones] = await Promise.all([
              sql`SELECT * FROM project_objectives  WHERE project_id=${id} ORDER BY sort_order`,
              sql`SELECT * FROM project_requirements WHERE project_id=${id} ORDER BY sort_order`,
              sql`SELECT * FROM project_tap_risks   WHERE project_id=${id} ORDER BY sort_order`,
              sql`SELECT * FROM project_stakeholders WHERE project_id=${id}`,
              sql`SELECT * FROM project_milestones  WHERE project_id=${id} ORDER BY sort_order`,
            ]);
            return json(200, { ...project, objectives, requirements, tapRisks, stakeholders, milestones });
          }
          if (m === 'POST' && p === '/projects') {
            const b = await readBody(req);
            const [row] = await sql`
              INSERT INTO projects (name,justification,budget,manager,sponsor,start_date,area,project_type,cno,location,status)
              VALUES (${b.name},${b.justification},${b.budget},${b.manager},${b.sponsor},${b.start_date},${b.area},${b.project_type},${b.cno},${b.location},${b.status ?? 'Em andamento'})
              RETURNING *`;
            return json(201, row);
          }
          if (m === 'PUT' && /^\/projects\/[^/]+$/.test(p)) {
            const id = p.split('/')[2];
            const b = await readBody(req);
            const [row] = await sql`
              UPDATE projects SET name=${b.name},justification=${b.justification},budget=${b.budget},
                manager=${b.manager},sponsor=${b.sponsor},start_date=${b.start_date},area=${b.area},
                project_type=${b.project_type},cno=${b.cno},location=${b.location},status=${b.status},updated_at=NOW()
              WHERE id=${id} RETURNING *`;
            return json(200, row);
          }
          if (m === 'DELETE' && /^\/projects\/[^/]+$/.test(p)) {
            const id = p.split('/')[2];
            await sql`DELETE FROM projects WHERE id=${id}`;
            res.statusCode = 204; return res.end();
          }

          // ── TAP ──────────────────────────────────────────────────
          if (m === 'PUT' && /^\/projects\/[^/]+\/tap$/.test(p)) {
            const id = p.split('/')[2];
            const b = await readBody(req);
            await sql`DELETE FROM project_objectives  WHERE project_id=${id}`;
            await sql`DELETE FROM project_requirements WHERE project_id=${id}`;
            await sql`DELETE FROM project_tap_risks   WHERE project_id=${id}`;
            await sql`DELETE FROM project_stakeholders WHERE project_id=${id}`;
            await sql`DELETE FROM project_milestones  WHERE project_id=${id}`;
            for (let i = 0; i < (b.objectives?.length ?? 0); i++)
              await sql`INSERT INTO project_objectives(project_id,text,sort_order) VALUES(${id},${b.objectives[i]},${i})`;
            for (let i = 0; i < (b.requirements?.length ?? 0); i++)
              await sql`INSERT INTO project_requirements(project_id,text,sort_order) VALUES(${id},${b.requirements[i]},${i})`;
            for (let i = 0; i < (b.tapRisks?.length ?? 0); i++)
              await sql`INSERT INTO project_tap_risks(project_id,text,sort_order) VALUES(${id},${b.tapRisks[i]},${i})`;
            for (const s of (b.stakeholders ?? []))
              await sql`INSERT INTO project_stakeholders(project_id,name) VALUES(${id},${s})`;
            for (let i = 0; i < (b.milestones?.length ?? 0); i++) {
              const mv = b.milestones[i];
              await sql`INSERT INTO project_milestones(project_id,date,description,sort_order) VALUES(${id},${mv.date},${mv.description},${i})`;
            }
            return json(200, { success: true });
          }

          // ── CRONOGRAMA ───────────────────────────────────────────
          if (m === 'GET' && /^\/projects\/[^/]+\/schedule$/.test(p)) {
            const id = p.split('/')[2];
            const items = await sql`SELECT * FROM schedule_items WHERE project_id=${id} ORDER BY sort_order`;
            const result = await Promise.all(items.map(async (item: any) => ({
              ...item, tasks: await sql`SELECT * FROM schedule_tasks WHERE schedule_item_id=${item.id}`,
            })));
            return json(200, result);
          }
          if (m === 'POST' && /^\/projects\/[^/]+\/schedule$/.test(p)) {
            const id = p.split('/')[2];
            const b = await readBody(req);
            const [row] = await sql`
              INSERT INTO schedule_items(project_id,name,progress,color,is_milestone,sort_order)
              VALUES(${id},${b.name},${b.progress ?? 0},${b.color ?? 'bg-blue-500'},${b.is_milestone ?? false},${b.sort_order ?? 0})
              RETURNING *`;
            return json(201, row);
          }
          if (m === 'PUT' && /^\/schedule\/[^/]+$/.test(p)) {
            const id = p.split('/')[2];
            const b = await readBody(req);
            const [row] = await sql`
              UPDATE schedule_items SET name=${b.name},progress=${b.progress},color=${b.color},
                is_milestone=${b.is_milestone},sort_order=${b.sort_order},updated_at=NOW()
              WHERE id=${id} RETURNING *`;
            return json(200, row);
          }
          if (m === 'DELETE' && /^\/schedule\/[^/]+$/.test(p)) {
            const id = p.split('/')[2];
            await sql`DELETE FROM schedule_items WHERE id=${id}`;
            res.statusCode = 204; return res.end();
          }

          // ── RDO ──────────────────────────────────────────────────
          if (m === 'GET' && /^\/projects\/[^/]+\/rdos$/.test(p)) {
            const id = p.split('/')[2];
            return json(200, await sql`SELECT * FROM rdos WHERE project_id=${id} ORDER BY date DESC`);
          }
          if (m === 'POST' && /^\/projects\/[^/]+\/rdos$/.test(p)) {
            const id = p.split('/')[2];
            const b = await readBody(req);
            const [row] = await sql`
              INSERT INTO rdos(project_id,date,description,weather,workers)
              VALUES(${id},${b.date},${b.description},${b.weather},${b.workers ?? 0}) RETURNING *`;
            return json(201, row);
          }
          if (m === 'PUT' && /^\/rdos\/[^/]+$/.test(p)) {
            const id = p.split('/')[2];
            const b = await readBody(req);
            const [row] = await sql`
              UPDATE rdos SET date=${b.date},description=${b.description},weather=${b.weather},workers=${b.workers},updated_at=NOW()
              WHERE id=${id} RETURNING *`;
            return json(200, row);
          }
          if (m === 'DELETE' && /^\/rdos\/[^/]+$/.test(p)) {
            const id = p.split('/')[2];
            await sql`DELETE FROM rdos WHERE id=${id}`;
            res.statusCode = 204; return res.end();
          }

          // ── EQUIPE ───────────────────────────────────────────────
          if (m === 'GET' && /^\/projects\/[^/]+\/team$/.test(p)) {
            const id = p.split('/')[2];
            return json(200, await sql`SELECT * FROM team_members WHERE project_id=${id} ORDER BY created_at`);
          }
          if (m === 'POST' && /^\/projects\/[^/]+\/team$/.test(p)) {
            const id = p.split('/')[2];
            const b = await readBody(req);
            const [row] = await sql`
              INSERT INTO team_members(project_id,name,role,company,status)
              VALUES(${id},${b.name},${b.role},${b.company},${b.status ?? 'Ativo'}) RETURNING *`;
            return json(201, row);
          }
          if (m === 'PUT' && /^\/team\/[^/]+$/.test(p)) {
            const id = p.split('/')[2];
            const b = await readBody(req);
            const [row] = await sql`
              UPDATE team_members SET name=${b.name},role=${b.role},company=${b.company},status=${b.status},updated_at=NOW()
              WHERE id=${id} RETURNING *`;
            return json(200, row);
          }
          if (m === 'DELETE' && /^\/team\/[^/]+$/.test(p)) {
            const id = p.split('/')[2];
            await sql`DELETE FROM team_members WHERE id=${id}`;
            res.statusCode = 204; return res.end();
          }

          // ── MATERIAIS ────────────────────────────────────────────
          if (m === 'GET' && /^\/projects\/[^/]+\/materials$/.test(p)) {
            const id = p.split('/')[2];
            return json(200, await sql`SELECT * FROM materials WHERE project_id=${id} ORDER BY created_at`);
          }
          if (m === 'POST' && /^\/projects\/[^/]+\/materials$/.test(p)) {
            const id = p.split('/')[2];
            const b = await readBody(req);
            const [row] = await sql`
              INSERT INTO materials(project_id,name,required,received,unit,vendor,status)
              VALUES(${id},${b.name},${b.required},${b.received},${b.unit},${b.vendor},${b.status ?? 'Pendente'}) RETURNING *`;
            return json(201, row);
          }
          if (m === 'PUT' && /^\/materials\/[^/]+$/.test(p)) {
            const id = p.split('/')[2];
            const b = await readBody(req);
            const [row] = await sql`
              UPDATE materials SET name=${b.name},required=${b.required},received=${b.received},
                unit=${b.unit},vendor=${b.vendor},status=${b.status},updated_at=NOW()
              WHERE id=${id} RETURNING *`;
            return json(200, row);
          }
          if (m === 'DELETE' && /^\/materials\/[^/]+$/.test(p)) {
            const id = p.split('/')[2];
            await sql`DELETE FROM materials WHERE id=${id}`;
            res.statusCode = 204; return res.end();
          }

          // ── FINANCEIRO ───────────────────────────────────────────
          if (m === 'GET' && /^\/projects\/[^/]+\/financial$/.test(p)) {
            const id = p.split('/')[2];
            return json(200, await sql`SELECT * FROM financial_entries WHERE project_id=${id} ORDER BY created_at`);
          }
          if (m === 'POST' && /^\/projects\/[^/]+\/financial$/.test(p)) {
            const id = p.split('/')[2];
            const b = await readBody(req);
            const [row] = await sql`
              INSERT INTO financial_entries(project_id,company,service,value,payment_form,deadline,status)
              VALUES(${id},${b.company},${b.service},${b.value},${b.payment_form},${b.deadline},${b.status ?? 'Pendente'}) RETURNING *`;
            return json(201, row);
          }
          if (m === 'PUT' && /^\/financial\/[^/]+$/.test(p)) {
            const id = p.split('/')[2];
            const b = await readBody(req);
            const [row] = await sql`
              UPDATE financial_entries SET company=${b.company},service=${b.service},value=${b.value},
                payment_form=${b.payment_form},deadline=${b.deadline},status=${b.status},updated_at=NOW()
              WHERE id=${id} RETURNING *`;
            return json(200, row);
          }
          if (m === 'DELETE' && /^\/financial\/[^/]+$/.test(p)) {
            const id = p.split('/')[2];
            await sql`DELETE FROM financial_entries WHERE id=${id}`;
            res.statusCode = 204; return res.end();
          }

          // ── CONTRATOS ────────────────────────────────────────────
          if (m === 'GET' && /^\/projects\/[^/]+\/contracts$/.test(p)) {
            const id = p.split('/')[2];
            return json(200, await sql`SELECT * FROM contracts WHERE project_id=${id} ORDER BY created_at`);
          }
          if (m === 'POST' && /^\/projects\/[^/]+\/contracts$/.test(p)) {
            const id = p.split('/')[2];
            const b = await readBody(req);
            const [row] = await sql`
              INSERT INTO contracts(project_id,company,scope,contract_number,value,deadline,warranty,status)
              VALUES(${id},${b.company},${b.scope},${b.contract_number},${b.value},${b.deadline},${b.warranty},${b.status ?? 'Em vigor'}) RETURNING *`;
            return json(201, row);
          }
          if (m === 'PUT' && /^\/contracts\/[^/]+$/.test(p)) {
            const id = p.split('/')[2];
            const b = await readBody(req);
            const [row] = await sql`
              UPDATE contracts SET company=${b.company},scope=${b.scope},contract_number=${b.contract_number},
                value=${b.value},deadline=${b.deadline},warranty=${b.warranty},status=${b.status},updated_at=NOW()
              WHERE id=${id} RETURNING *`;
            return json(200, row);
          }
          if (m === 'DELETE' && /^\/contracts\/[^/]+$/.test(p)) {
            const id = p.split('/')[2];
            await sql`DELETE FROM contracts WHERE id=${id}`;
            res.statusCode = 204; return res.end();
          }

          // ── EMPRESAS ─────────────────────────────────────────────
          if (m === 'GET' && p === '/companies') {
            return json(200, await sql`SELECT * FROM companies ORDER BY name`);
          }
          if (m === 'POST' && p === '/companies') {
            const b = await readBody(req);
            const [row] = await sql`
              INSERT INTO companies(name,cnpj,contact,email,phone,type)
              VALUES(${b.name},${b.cnpj},${b.contact},${b.email},${b.phone},${b.type}) RETURNING *`;
            return json(201, row);
          }
          if (m === 'PUT' && /^\/companies\/[^/]+$/.test(p)) {
            const id = p.split('/')[2];
            const b = await readBody(req);
            const [row] = await sql`
              UPDATE companies SET name=${b.name},cnpj=${b.cnpj},contact=${b.contact},
                email=${b.email},phone=${b.phone},type=${b.type},updated_at=NOW()
              WHERE id=${id} RETURNING *`;
            return json(200, row);
          }
          if (m === 'DELETE' && /^\/companies\/[^/]+$/.test(p)) {
            const id = p.split('/')[2];
            await sql`DELETE FROM companies WHERE id=${id}`;
            res.statusCode = 204; return res.end();
          }

          // ── DOCS LEGAIS ──────────────────────────────────────────
          if (m === 'GET' && /^\/projects\/[^/]+\/legal-docs$/.test(p)) {
            const id = p.split('/')[2];
            return json(200, await sql`SELECT * FROM legal_documents WHERE project_id=${id} ORDER BY created_at`);
          }
          if (m === 'POST' && /^\/projects\/[^/]+\/legal-docs$/.test(p)) {
            const id = p.split('/')[2];
            const b = await readBody(req);
            const [row] = await sql`
              INSERT INTO legal_documents(project_id,document,organization,requested_date,sent_date,approved_date,status)
              VALUES(${id},${b.document},${b.organization},${b.requested_date},${b.sent_date},${b.approved_date},${b.status ?? 'Pendente'}) RETURNING *`;
            return json(201, row);
          }
          if (m === 'PUT' && /^\/legal-docs\/[^/]+$/.test(p)) {
            const id = p.split('/')[2];
            const b = await readBody(req);
            const [row] = await sql`
              UPDATE legal_documents SET document=${b.document},organization=${b.organization},
                requested_date=${b.requested_date},sent_date=${b.sent_date},approved_date=${b.approved_date},
                status=${b.status},updated_at=NOW()
              WHERE id=${id} RETURNING *`;
            return json(200, row);
          }
          if (m === 'DELETE' && /^\/legal-docs\/[^/]+$/.test(p)) {
            const id = p.split('/')[2];
            await sql`DELETE FROM legal_documents WHERE id=${id}`;
            res.statusCode = 204; return res.end();
          }

          // ── PROJETOS TÉCNICOS ────────────────────────────────────
          if (m === 'GET' && /^\/projects\/[^/]+\/technical-projects$/.test(p)) {
            const id = p.split('/')[2];
            return json(200, await sql`SELECT * FROM technical_projects WHERE project_id=${id} ORDER BY created_at`);
          }
          if (m === 'POST' && /^\/projects\/[^/]+\/technical-projects$/.test(p)) {
            const id = p.split('/')[2];
            const b = await readBody(req);
            const [row] = await sql`
              INSERT INTO technical_projects(project_id,name,responsible,version,date,observations,status)
              VALUES(${id},${b.name},${b.responsible},${b.version},${b.date},${b.observations},${b.status ?? 'Pendente'}) RETURNING *`;
            return json(201, row);
          }
          if (m === 'PUT' && /^\/technical-projects\/[^/]+$/.test(p)) {
            const id = p.split('/')[2];
            const b = await readBody(req);
            const [row] = await sql`
              UPDATE technical_projects SET name=${b.name},responsible=${b.responsible},version=${b.version},
                date=${b.date},observations=${b.observations},status=${b.status},updated_at=NOW()
              WHERE id=${id} RETURNING *`;
            return json(200, row);
          }
          if (m === 'DELETE' && /^\/technical-projects\/[^/]+$/.test(p)) {
            const id = p.split('/')[2];
            await sql`DELETE FROM technical_projects WHERE id=${id}`;
            res.statusCode = 204; return res.end();
          }

          // ── RISCOS ───────────────────────────────────────────────
          if (m === 'GET' && /^\/projects\/[^/]+\/risks$/.test(p)) {
            const id = p.split('/')[2];
            return json(200, await sql`SELECT * FROM risks WHERE project_id=${id} ORDER BY created_at`);
          }
          if (m === 'POST' && /^\/projects\/[^/]+\/risks$/.test(p)) {
            const id = p.split('/')[2];
            const b = await readBody(req);
            const [row] = await sql`
              INSERT INTO risks(project_id,level,title,description,color)
              VALUES(${id},${b.level},${b.title},${b.description},${b.color ?? 'bg-red-500/10'}) RETURNING *`;
            return json(201, row);
          }
          if (m === 'PUT' && /^\/risks\/[^/]+$/.test(p)) {
            const id = p.split('/')[2];
            const b = await readBody(req);
            const [row] = await sql`
              UPDATE risks SET level=${b.level},title=${b.title},description=${b.description},color=${b.color},updated_at=NOW()
              WHERE id=${id} RETURNING *`;
            return json(200, row);
          }
          if (m === 'DELETE' && /^\/risks\/[^/]+$/.test(p)) {
            const id = p.split('/')[2];
            await sql`DELETE FROM risks WHERE id=${id}`;
            res.statusCode = 204; return res.end();
          }

          // ── QUALIDADE ────────────────────────────────────────────
          if (m === 'GET' && /^\/projects\/[^/]+\/non-conformities$/.test(p)) {
            const id = p.split('/')[2];
            return json(200, await sql`SELECT * FROM non_conformities WHERE project_id=${id} ORDER BY created_at`);
          }
          if (m === 'POST' && /^\/projects\/[^/]+\/non-conformities$/.test(p)) {
            const id = p.split('/')[2];
            const b = await readBody(req);
            const [row] = await sql`
              INSERT INTO non_conformities(project_id,item,description,responsible,deadline,status)
              VALUES(${id},${b.item},${b.description},${b.responsible},${b.deadline},${b.status ?? 'Aberto'}) RETURNING *`;
            return json(201, row);
          }
          if (m === 'PUT' && /^\/non-conformities\/[^/]+$/.test(p)) {
            const id = p.split('/')[2];
            const b = await readBody(req);
            const [row] = await sql`
              UPDATE non_conformities SET item=${b.item},description=${b.description},responsible=${b.responsible},
                deadline=${b.deadline},status=${b.status},updated_at=NOW()
              WHERE id=${id} RETURNING *`;
            return json(200, row);
          }
          if (m === 'DELETE' && /^\/non-conformities\/[^/]+$/.test(p)) {
            const id = p.split('/')[2];
            await sql`DELETE FROM non_conformities WHERE id=${id}`;
            res.statusCode = 204; return res.end();
          }

          // ── ALERTAS ──────────────────────────────────────────────
          if (m === 'GET' && p === '/alerts') {
            return json(200, await sql`SELECT * FROM alerts WHERE resolved=false ORDER BY created_at DESC`);
          }
          if (m === 'POST' && p === '/alerts') {
            const b = await readBody(req);
            const [row] = await sql`
              INSERT INTO alerts(project_id,text,type)
              VALUES(${b.project_id ?? null},${b.text},${b.type}) RETURNING *`;
            return json(201, row);
          }
          if (m === 'PUT' && /^\/alerts\/[^/]+\/resolve$/.test(p)) {
            const id = p.split('/')[2];
            const [row] = await sql`UPDATE alerts SET resolved=true WHERE id=${id} RETURNING *`;
            return json(200, row);
          }

          return json(404, { error: 'Rota não encontrada' });
        } catch (e: any) {
          console.error('[api error]', e.message);
          return json(500, { error: e.message });
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react(), tailwindcss(), apiPlugin()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY || ''),
    },
    resolve: {
      alias: { '@': path.resolve(__dirname, '.') },
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
