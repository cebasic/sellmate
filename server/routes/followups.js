const express = require('express');
const { dbRun, dbGet, dbAll } = require('../config/database');
const { authMiddleware, adminOnly, requireTenant } = require('../middleware/auth');

const router = express.Router();

// ===== FOLLOW-UP RULES CRUD =====

// GET /api/followups/rules - List all rules
router.get('/rules', authMiddleware, requireTenant, async (req, res) => {
  const rules = await dbAll('SELECT * FROM follow_up_rules WHERE tenant_id = ? ORDER BY created_at DESC', [req.tenantId]);
  res.json({ rules });
});

// POST /api/followups/rules - Create rule
router.post('/rules', authMiddleware, adminOnly, requireTenant, async (req, res) => {
  const { name, trigger_type, delay_days, message_template, target_audience } = req.body;
  if (!name || !message_template) {
    return res.status(400).json({ error: 'Nombre y plantilla de mensaje son requeridos' });
  }

  const result = await dbRun(
    `INSERT INTO follow_up_rules (tenant_id, name, trigger_type, delay_days, message_template, target_audience)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [req.tenantId, name, trigger_type || 'days_after_last_contact',
     delay_days || 15, message_template, target_audience || 'all']
  );

  const rule = await dbGet('SELECT * FROM follow_up_rules WHERE id = ?', [result.lastInsertRowid]);
  res.json({ rule });
});

// PUT /api/followups/rules/:id - Update rule
router.put('/rules/:id', authMiddleware, adminOnly, requireTenant, async (req, res) => {
  const existing = await dbGet('SELECT * FROM follow_up_rules WHERE id = ? AND tenant_id = ?',
    [Number(req.params.id), req.tenantId]);
  if (!existing) return res.status(404).json({ error: 'Regla no encontrada' });

  const { name, trigger_type, delay_days, message_template, active, target_audience } = req.body;
  await dbRun(
    `UPDATE follow_up_rules SET name=?, trigger_type=?, delay_days=?, message_template=?, active=?, target_audience=? WHERE id=? AND tenant_id=?`,
    [name ?? existing.name, trigger_type ?? existing.trigger_type,
     delay_days ?? existing.delay_days, message_template ?? existing.message_template,
     active !== undefined ? (active ? 1 : 0) : existing.active,
     target_audience ?? existing.target_audience,
     Number(req.params.id), req.tenantId]
  );

  const rule = await dbGet('SELECT * FROM follow_up_rules WHERE id = ?', [Number(req.params.id)]);
  res.json({ rule });
});

// DELETE /api/followups/rules/:id - Delete rule
router.delete('/rules/:id', authMiddleware, adminOnly, requireTenant, async (req, res) => {
  await dbRun('DELETE FROM follow_up_log WHERE rule_id = ? AND tenant_id = ?', [Number(req.params.id), req.tenantId]);
  await dbRun('DELETE FROM follow_up_rules WHERE id = ? AND tenant_id = ?', [Number(req.params.id), req.tenantId]);
  res.json({ success: true });
});

// ===== FOLLOW-UP LOG =====

// GET /api/followups/log - View sent follow-ups
router.get('/log', authMiddleware, requireTenant, async (req, res) => {
  const { rule_id, limit } = req.query;
  let query = `SELECT fl.*, fr.name as rule_name, c.contact_name
    FROM follow_up_log fl
    LEFT JOIN follow_up_rules fr ON fr.id = fl.rule_id
    LEFT JOIN conversations c ON c.id = fl.conversation_id
    WHERE fl.tenant_id = ?`;
  const params = [req.tenantId];

  if (rule_id) {
    query += ' AND fl.rule_id = ?';
    params.push(Number(rule_id));
  }

  query += ' ORDER BY fl.sent_at DESC LIMIT ?';
  params.push(Number(limit) || 50);

  const log = await dbAll(query, params);
  res.json({ log });
});

// POST /api/followups/execute - Manually trigger follow-up processing
router.post('/execute', authMiddleware, adminOnly, requireTenant, async (req, res) => {
  try {
    const { processFollowUps } = require('../services/followups');
    const result = await processFollowUps(req.tenantId);
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/followups/stats - Stats overview
router.get('/stats', authMiddleware, requireTenant, async (req, res) => {
  const activeRules = await dbGet('SELECT COUNT(*) as count FROM follow_up_rules WHERE tenant_id = ? AND active = 1', [req.tenantId]);
  const totalSent = await dbGet('SELECT COUNT(*) as count FROM follow_up_log WHERE tenant_id = ?', [req.tenantId]);
  const sentToday = await dbGet(
    `SELECT COUNT(*) as count FROM follow_up_log WHERE tenant_id = ? AND DATE(sent_at) = CURDATE()`,
    [req.tenantId]
  );
  const responded = await dbGet('SELECT COUNT(*) as count FROM follow_up_log WHERE tenant_id = ? AND response_received = 1', [req.tenantId]);

  res.json({
    stats: {
      activeRules: activeRules.count,
      totalSent: totalSent.count,
      sentToday: sentToday.count,
      responseRate: totalSent.count > 0 ? Math.round((responded.count / totalSent.count) * 100) : 0
    }
  });
});

module.exports = router;
