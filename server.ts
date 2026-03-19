/**
 * API Router do Gestor de Obras.
 * Exporta `createApiRouter()` para ser montado como middleware do Vite (configureServer).
 * As rotas não incluem o prefixo /api — o Vite já monta em /api.
 */
import express from 'express';
import { neon } from '@neondatabase/serverless';

export async function createApiRouter() {
  const router = express.Router();
  router.use(express.json());

  if (!process.env.DATABASE_URL) {
    console.error('[api] DATABASE_URL não está definida.');
    return router;
  }

  const sql = neon(process.env.DATABASE_URL);

  // ============================================================
  // PROJETOS
  // ============================================================
  router.get('/projects', async (_req, res) => {
    try {
      const projects = await sql`SELECT * FROM projects ORDER BY created_at DESC`;
      res.json(projects);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  router.get('/projects/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const [project] = await sql`SELECT * FROM projects WHERE id = ${id}`;
      if (!project) return res.status(404).json({ error: 'Projeto não encontrado' });
      const [objectives, requirements, tapRisks, stakeholders, milestones] = await Promise.all([
        sql`SELECT * FROM project_objectives WHERE project_id = ${id} ORDER BY sort_order`,
        sql`SELECT * FROM project_requirements WHERE project_id = ${id} ORDER BY sort_order`,
        sql`SELECT * FROM project_tap_risks WHERE project_id = ${id} ORDER BY sort_order`,
        sql`SELECT * FROM project_stakeholders WHERE project_id = ${id}`,
        sql`SELECT * FROM project_milestones WHERE project_id = ${id} ORDER BY sort_order`,
      ]);
      res.json({ ...project, objectives, requirements, tapRisks, stakeholders, milestones });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  router.post('/projects', async (req, res) => {
    try {
      const { name, justification, budget, manager, sponsor, start_date, area, project_type, cno, location, status } = req.body;
      const [project] = await sql`
        INSERT INTO projects (name, justification, budget, manager, sponsor, start_date, area, project_type, cno, location, status)
        VALUES (${name}, ${justification}, ${budget}, ${manager}, ${sponsor}, ${start_date}, ${area}, ${project_type}, ${cno}, ${location}, ${status ?? 'Em andamento'})
        RETURNING *
      `;
      res.status(201).json(project);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  router.put('/projects/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { name, justification, budget, manager, sponsor, start_date, area, project_type, cno, location, status } = req.body;
      const [project] = await sql`
        UPDATE projects SET name=${name}, justification=${justification}, budget=${budget},
          manager=${manager}, sponsor=${sponsor}, start_date=${start_date},
          area=${area}, project_type=${project_type}, cno=${cno},
          location=${location}, status=${status}, updated_at=NOW()
        WHERE id=${id} RETURNING *
      `;
      res.json(project);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  router.delete('/projects/:id', async (req, res) => {
    try {
      const { id } = req.params;
      await sql`DELETE FROM projects WHERE id=${id}`;
      res.status(204).send();
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  // TAP sub-recursos
  router.put('/projects/:id/tap', async (req, res) => {
    try {
      const { id } = req.params;
      const { objectives = [], requirements = [], tapRisks = [], stakeholders = [], milestones = [] } = req.body;

      // Limpa e reinsere (estratégia replace-all)
      await sql`DELETE FROM project_objectives   WHERE project_id=${id}`;
      await sql`DELETE FROM project_requirements WHERE project_id=${id}`;
      await sql`DELETE FROM project_tap_risks    WHERE project_id=${id}`;
      await sql`DELETE FROM project_stakeholders WHERE project_id=${id}`;
      await sql`DELETE FROM project_milestones   WHERE project_id=${id}`;

      for (let i = 0; i < objectives.length; i++)
        await sql`INSERT INTO project_objectives (project_id, text, sort_order) VALUES (${id}, ${objectives[i]}, ${i})`;
      for (let i = 0; i < requirements.length; i++)
        await sql`INSERT INTO project_requirements (project_id, text, sort_order) VALUES (${id}, ${requirements[i]}, ${i})`;
      for (let i = 0; i < tapRisks.length; i++)
        await sql`INSERT INTO project_tap_risks (project_id, text, sort_order) VALUES (${id}, ${tapRisks[i]}, ${i})`;
      for (const s of stakeholders)
        await sql`INSERT INTO project_stakeholders (project_id, name) VALUES (${id}, ${s})`;
      for (let i = 0; i < milestones.length; i++) {
        const m = milestones[i];
        await sql`INSERT INTO project_milestones (project_id, date, description, sort_order) VALUES (${id}, ${m.date ?? ''}, ${m.description ?? ''}, ${i})`;
      }

      res.json({ success: true });
    } catch (e: any) {
      console.error('[api] PUT /projects/:id/tap error:', e.message);
      res.status(500).json({ error: e.message });
    }
  });

  // ============================================================
  // CRONOGRAMA
  // ============================================================
  router.get('/projects/:id/schedule', async (req, res) => {
    try {
      const { id } = req.params;
      const items = await sql`SELECT * FROM schedule_items WHERE project_id=${id} ORDER BY sort_order`;
      const result = await Promise.all(items.map(async (item: any) => {
        const tasks = await sql`SELECT * FROM schedule_tasks WHERE schedule_item_id=${item.id}`;
        return { ...item, tasks };
      }));
      res.json(result);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  router.post('/projects/:id/schedule', async (req, res) => {
    try {
      const { id } = req.params;
      const { name, progress, color, is_milestone, sort_order } = req.body;
      const [item] = await sql`
        INSERT INTO schedule_items (project_id, name, progress, color, is_milestone, sort_order)
        VALUES (${id}, ${name}, ${progress ?? 0}, ${color ?? 'bg-blue-500'}, ${is_milestone ?? false}, ${sort_order ?? 0})
        RETURNING *
      `;
      res.status(201).json(item);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  router.put('/schedule/:itemId', async (req, res) => {
    try {
      const { itemId } = req.params;
      const { name, progress, color, is_milestone, sort_order } = req.body;

      // Busca o item atual para não sobrescrever campos não enviados
      const [current] = await sql`SELECT * FROM schedule_items WHERE id=${itemId}`;
      if (!current) return res.status(404).json({ error: 'Item não encontrado' });

      const [item] = await sql`
        UPDATE schedule_items
        SET
          name        = ${name          ?? current.name},
          progress    = ${progress      ?? current.progress},
          color       = ${color         ?? current.color},
          is_milestone= ${is_milestone  ?? current.is_milestone},
          sort_order  = ${sort_order    ?? current.sort_order},
          updated_at  = NOW()
        WHERE id=${itemId} RETURNING *
      `;
      res.json(item);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  router.delete('/schedule/:itemId', async (req, res) => {
    try {
      const { itemId } = req.params;
      await sql`DELETE FROM schedule_items WHERE id=${itemId}`;
      res.status(204).send();
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  // ============================================================
  // RDO
  // ============================================================
  router.get('/projects/:id/rdos', async (req, res) => {
    try {
      const { id } = req.params;
      const rows = await sql`SELECT * FROM rdos WHERE project_id=${id} ORDER BY date DESC`;
      res.json(rows);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  router.post('/projects/:id/rdos', async (req, res) => {
    try {
      const { id } = req.params;
      const { date, description, weather, workers } = req.body;
      const [row] = await sql`
        INSERT INTO rdos (project_id, date, description, weather, workers)
        VALUES (${id}, ${date}, ${description}, ${weather}, ${workers ?? 0})
        RETURNING *
      `;
      res.status(201).json(row);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  router.put('/rdos/:rdoId', async (req, res) => {
    try {
      const { rdoId } = req.params;
      const { date, description, weather, workers } = req.body;
      const [row] = await sql`
        UPDATE rdos SET date=${date}, description=${description}, weather=${weather}, workers=${workers}, updated_at=NOW()
        WHERE id=${rdoId} RETURNING *
      `;
      res.json(row);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  router.delete('/rdos/:rdoId', async (req, res) => {
    try {
      const { rdoId } = req.params;
      await sql`DELETE FROM rdos WHERE id=${rdoId}`;
      res.status(204).send();
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  // ============================================================
  // EQUIPE
  // ============================================================
  router.get('/projects/:id/team', async (req, res) => {
    try {
      const { id } = req.params;
      const rows = await sql`SELECT * FROM team_members WHERE project_id=${id} ORDER BY created_at`;
      res.json(rows);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  router.post('/projects/:id/team', async (req, res) => {
    try {
      const { id } = req.params;
      const { name, role, company, status } = req.body;
      const [row] = await sql`
        INSERT INTO team_members (project_id, name, role, company, status)
        VALUES (${id}, ${name}, ${role}, ${company}, ${status ?? 'Ativo'})
        RETURNING *
      `;
      res.status(201).json(row);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  router.put('/team/:memberId', async (req, res) => {
    try {
      const { memberId } = req.params;
      const { name, role, company, status } = req.body;
      const [row] = await sql`
        UPDATE team_members SET name=${name}, role=${role}, company=${company}, status=${status}, updated_at=NOW()
        WHERE id=${memberId} RETURNING *
      `;
      res.json(row);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  router.delete('/team/:memberId', async (req, res) => {
    try {
      const { memberId } = req.params;
      await sql`DELETE FROM team_members WHERE id=${memberId}`;
      res.status(204).send();
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  // ============================================================
  // MATERIAIS
  // ============================================================
  router.get('/projects/:id/materials', async (req, res) => {
    try {
      const { id } = req.params;
      const rows = await sql`SELECT * FROM materials WHERE project_id=${id} ORDER BY created_at`;
      res.json(rows);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  router.post('/projects/:id/materials', async (req, res) => {
    try {
      const { id } = req.params;
      const { name, required, received, unit, vendor, status } = req.body;
      const [row] = await sql`
        INSERT INTO materials (project_id, name, required, received, unit, vendor, status)
        VALUES (${id}, ${name}, ${required}, ${received}, ${unit}, ${vendor}, ${status ?? 'Pendente'})
        RETURNING *
      `;
      res.status(201).json(row);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  router.put('/materials/:materialId', async (req, res) => {
    try {
      const { materialId } = req.params;
      const { name, required, received, unit, vendor, status } = req.body;
      const [row] = await sql`
        UPDATE materials SET name=${name}, required=${required}, received=${received},
          unit=${unit}, vendor=${vendor}, status=${status}, updated_at=NOW()
        WHERE id=${materialId} RETURNING *
      `;
      res.json(row);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  router.delete('/materials/:materialId', async (req, res) => {
    try {
      const { materialId } = req.params;
      await sql`DELETE FROM materials WHERE id=${materialId}`;
      res.status(204).send();
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  // ============================================================
  // FINANCEIRO
  // ============================================================
  router.get('/projects/:id/financial', async (req, res) => {
    try {
      const { id } = req.params;
      const rows = await sql`SELECT * FROM financial_entries WHERE project_id=${id} ORDER BY created_at`;
      res.json(rows);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  router.post('/projects/:id/financial', async (req, res) => {
    try {
      const { id } = req.params;
      const { company, service, value, payment_form, deadline, status } = req.body;
      const [row] = await sql`
        INSERT INTO financial_entries (project_id, company, service, value, payment_form, deadline, status)
        VALUES (${id}, ${company}, ${service}, ${value}, ${payment_form}, ${deadline}, ${status ?? 'Pendente'})
        RETURNING *
      `;
      res.status(201).json(row);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  router.put('/financial/:entryId', async (req, res) => {
    try {
      const { entryId } = req.params;
      const { company, service, value, payment_form, deadline, status } = req.body;
      const [row] = await sql`
        UPDATE financial_entries SET company=${company}, service=${service}, value=${value},
          payment_form=${payment_form}, deadline=${deadline}, status=${status}, updated_at=NOW()
        WHERE id=${entryId} RETURNING *
      `;
      res.json(row);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  router.delete('/financial/:entryId', async (req, res) => {
    try {
      const { entryId } = req.params;
      await sql`DELETE FROM financial_entries WHERE id=${entryId}`;
      res.status(204).send();
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  // ============================================================
  // CONTRATOS
  // ============================================================
  router.get('/projects/:id/contracts', async (req, res) => {
    try {
      const { id } = req.params;
      const rows = await sql`SELECT * FROM contracts WHERE project_id=${id} ORDER BY created_at`;
      res.json(rows);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  router.post('/projects/:id/contracts', async (req, res) => {
    try {
      const { id } = req.params;
      const { company, scope, contract_number, value, deadline, warranty, status } = req.body;
      const [row] = await sql`
        INSERT INTO contracts (project_id, company, scope, contract_number, value, deadline, warranty, status)
        VALUES (${id}, ${company}, ${scope}, ${contract_number}, ${value}, ${deadline}, ${warranty}, ${status ?? 'Em vigor'})
        RETURNING *
      `;
      res.status(201).json(row);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  router.put('/contracts/:contractId', async (req, res) => {
    try {
      const { contractId } = req.params;
      const { company, scope, contract_number, value, deadline, warranty, status } = req.body;
      const [row] = await sql`
        UPDATE contracts SET company=${company}, scope=${scope}, contract_number=${contract_number},
          value=${value}, deadline=${deadline}, warranty=${warranty}, status=${status}, updated_at=NOW()
        WHERE id=${contractId} RETURNING *
      `;
      res.json(row);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  router.delete('/contracts/:contractId', async (req, res) => {
    try {
      const { contractId } = req.params;
      await sql`DELETE FROM contracts WHERE id=${contractId}`;
      res.status(204).send();
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  // ============================================================
  // EMPRESAS
  // ============================================================
  router.get('/companies', async (_req, res) => {
    try {
      const rows = await sql`SELECT * FROM companies ORDER BY name`;
      res.json(rows);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  router.post('/companies', async (req, res) => {
    try {
      const { name, cnpj, contact, email, phone, type } = req.body;
      const [row] = await sql`
        INSERT INTO companies (name, cnpj, contact, email, phone, type)
        VALUES (${name}, ${cnpj}, ${contact}, ${email}, ${phone}, ${type})
        RETURNING *
      `;
      res.status(201).json(row);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  router.put('/companies/:companyId', async (req, res) => {
    try {
      const { companyId } = req.params;
      const { name, cnpj, contact, email, phone, type } = req.body;
      const [row] = await sql`
        UPDATE companies SET name=${name}, cnpj=${cnpj}, contact=${contact},
          email=${email}, phone=${phone}, type=${type}, updated_at=NOW()
        WHERE id=${companyId} RETURNING *
      `;
      res.json(row);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  router.delete('/companies/:companyId', async (req, res) => {
    try {
      const { companyId } = req.params;
      await sql`DELETE FROM companies WHERE id=${companyId}`;
      res.status(204).send();
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  // ============================================================
  // DOCUMENTAÇÃO LEGAL
  // ============================================================
  router.get('/projects/:id/legal-docs', async (req, res) => {
    try {
      const { id } = req.params;
      const rows = await sql`SELECT * FROM legal_documents WHERE project_id=${id} ORDER BY created_at`;
      res.json(rows);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  router.post('/projects/:id/legal-docs', async (req, res) => {
    try {
      const { id } = req.params;
      const { document, organization, requested_date, sent_date, approved_date, status } = req.body;
      const [row] = await sql`
        INSERT INTO legal_documents (project_id, document, organization, requested_date, sent_date, approved_date, status)
        VALUES (${id}, ${document}, ${organization}, ${requested_date}, ${sent_date}, ${approved_date}, ${status ?? 'Pendente'})
        RETURNING *
      `;
      res.status(201).json(row);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  router.put('/legal-docs/:docId', async (req, res) => {
    try {
      const { docId } = req.params;
      const { document, organization, requested_date, sent_date, approved_date, status } = req.body;
      const [row] = await sql`
        UPDATE legal_documents SET document=${document}, organization=${organization},
          requested_date=${requested_date}, sent_date=${sent_date}, approved_date=${approved_date},
          status=${status}, updated_at=NOW()
        WHERE id=${docId} RETURNING *
      `;
      res.json(row);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  router.delete('/legal-docs/:docId', async (req, res) => {
    try {
      const { docId } = req.params;
      await sql`DELETE FROM legal_documents WHERE id=${docId}`;
      res.status(204).send();
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  // ============================================================
  // PROJETOS TÉCNICOS
  // ============================================================
  router.get('/projects/:id/technical-projects', async (req, res) => {
    try {
      const { id } = req.params;
      const rows = await sql`SELECT * FROM technical_projects WHERE project_id=${id} ORDER BY created_at`;
      res.json(rows);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  router.post('/projects/:id/technical-projects', async (req, res) => {
    try {
      const { id } = req.params;
      const { name, responsible, version, date, observations, status } = req.body;
      const [row] = await sql`
        INSERT INTO technical_projects (project_id, name, responsible, version, date, observations, status)
        VALUES (${id}, ${name}, ${responsible}, ${version}, ${date}, ${observations}, ${status ?? 'Pendente'})
        RETURNING *
      `;
      res.status(201).json(row);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  router.put('/technical-projects/:tpId', async (req, res) => {
    try {
      const { tpId } = req.params;
      const { name, responsible, version, date, observations, status } = req.body;
      const [row] = await sql`
        UPDATE technical_projects SET name=${name}, responsible=${responsible}, version=${version},
          date=${date}, observations=${observations}, status=${status}, updated_at=NOW()
        WHERE id=${tpId} RETURNING *
      `;
      res.json(row);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  router.delete('/technical-projects/:tpId', async (req, res) => {
    try {
      const { tpId } = req.params;
      await sql`DELETE FROM technical_projects WHERE id=${tpId}`;
      res.status(204).send();
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  // ============================================================
  // RISCOS
  // ============================================================
  router.get('/projects/:id/risks', async (req, res) => {
    try {
      const { id } = req.params;
      const rows = await sql`SELECT * FROM risks WHERE project_id=${id} ORDER BY created_at`;
      res.json(rows);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  router.post('/projects/:id/risks', async (req, res) => {
    try {
      const { id } = req.params;
      const { level, title, description, color } = req.body;
      const [row] = await sql`
        INSERT INTO risks (project_id, level, title, description, color)
        VALUES (${id}, ${level}, ${title}, ${description}, ${color ?? 'bg-red-500/10'})
        RETURNING *
      `;
      res.status(201).json(row);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  router.put('/risks/:riskId', async (req, res) => {
    try {
      const { riskId } = req.params;
      const { level, title, description, color } = req.body;
      const [row] = await sql`
        UPDATE risks SET level=${level}, title=${title}, description=${description}, color=${color}, updated_at=NOW()
        WHERE id=${riskId} RETURNING *
      `;
      res.json(row);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  router.delete('/risks/:riskId', async (req, res) => {
    try {
      const { riskId } = req.params;
      await sql`DELETE FROM risks WHERE id=${riskId}`;
      res.status(204).send();
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  // ============================================================
  // QUALIDADE - Não Conformidades
  // ============================================================
  router.get('/projects/:id/non-conformities', async (req, res) => {
    try {
      const { id } = req.params;
      const rows = await sql`SELECT * FROM non_conformities WHERE project_id=${id} ORDER BY created_at`;
      res.json(rows);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  router.post('/projects/:id/non-conformities', async (req, res) => {
    try {
      const { id } = req.params;
      const { item, description, responsible, deadline, status } = req.body;
      const [row] = await sql`
        INSERT INTO non_conformities (project_id, item, description, responsible, deadline, status)
        VALUES (${id}, ${item}, ${description}, ${responsible}, ${deadline}, ${status ?? 'Aberto'})
        RETURNING *
      `;
      res.status(201).json(row);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  router.put('/non-conformities/:ncId', async (req, res) => {
    try {
      const { ncId } = req.params;
      const { item, description, responsible, deadline, status } = req.body;
      const [row] = await sql`
        UPDATE non_conformities SET item=${item}, description=${description}, responsible=${responsible},
          deadline=${deadline}, status=${status}, updated_at=NOW()
        WHERE id=${ncId} RETURNING *
      `;
      res.json(row);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  router.delete('/non-conformities/:ncId', async (req, res) => {
    try {
      const { ncId } = req.params;
      await sql`DELETE FROM non_conformities WHERE id=${ncId}`;
      res.status(204).send();
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  // ============================================================
  // ALERTAS
  // ============================================================
  router.get('/alerts', async (_req, res) => {
    try {
      const rows = await sql`SELECT * FROM alerts WHERE resolved=false ORDER BY created_at DESC`;
      res.json(rows);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  router.post('/alerts', async (req, res) => {
    try {
      const { project_id, text, type } = req.body;
      const [row] = await sql`
        INSERT INTO alerts (project_id, text, type)
        VALUES (${project_id ?? null}, ${text}, ${type})
        RETURNING *
      `;
      res.status(201).json(row);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  router.put('/alerts/:alertId/resolve', async (req, res) => {
    try {
      const { alertId } = req.params;
      const [row] = await sql`UPDATE alerts SET resolved=true WHERE id=${alertId} RETURNING *`;
      res.json(row);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  return router;
}
