const express = require('express');
const router = express.Router();
const { dbGet, dbAll } = require('../config/database');
const { authMiddleware, adminOnly, requireTenant } = require('../middleware/auth');

// GET /api/usage - get usage summary for this tenant
router.get('/', authMiddleware, adminOnly, requireTenant, async (req, res) => {
  try {
    const { period, start_date, end_date } = req.query;
    let dateFilter = '';
    const filterParams = [];
    if (period === 'custom' && start_date && end_date) {
      dateFilter = "AND DATE(created_at) BETWEEN ? AND ?";
      filterParams.push(start_date, end_date);
    } else if (period === 'today') dateFilter = "AND DATE(created_at) = CURDATE()";
    else if (period === 'week') dateFilter = "AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)";
    else if (period === 'month') dateFilter = "AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)";

    const summary = await dbGet(
      `SELECT
        COUNT(*) as total_requests,
        COALESCE(SUM(input_tokens), 0) as total_input_tokens,
        COALESCE(SUM(output_tokens), 0) as total_output_tokens,
        COALESCE(SUM(total_tokens), 0) as total_tokens,
        COALESCE(SUM(cost_estimate), 0) as total_cost
      FROM ai_usage WHERE tenant_id = ? ${dateFilter}`,
      [req.tenantId, ...filterParams]
    );

    const byModel = await dbAll(
      `SELECT model, provider,
        COUNT(*) as requests,
        SUM(total_tokens) as tokens,
        SUM(cost_estimate) as cost
      FROM ai_usage WHERE tenant_id = ? ${dateFilter}
      GROUP BY model, provider ORDER BY tokens DESC`,
      [req.tenantId, ...filterParams]
    );

    const daily = await dbAll(
      `SELECT DATE(created_at) as date,
        COUNT(*) as requests,
        SUM(total_tokens) as tokens,
        SUM(cost_estimate) as cost
      FROM ai_usage WHERE tenant_id = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY DATE(created_at) ORDER BY date DESC LIMIT 30`,
      [req.tenantId]
    );

    res.json({ summary, byModel, daily });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/usage/detailed - Detailed daily data for a date range
router.get('/detailed', authMiddleware, adminOnly, requireTenant, async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    const start = start_date || new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);
    const end = end_date || new Date().toISOString().slice(0, 10);

    const daily = await dbAll(
      `SELECT DATE(created_at) as date, provider, model,
        COUNT(*) as requests,
        COALESCE(SUM(input_tokens), 0) as input_tokens,
        COALESCE(SUM(output_tokens), 0) as output_tokens,
        COALESCE(SUM(total_tokens), 0) as total_tokens,
        COALESCE(SUM(cost_estimate), 0) as cost
      FROM ai_usage
      WHERE tenant_id = ? AND DATE(created_at) BETWEEN ? AND ?
      GROUP BY DATE(created_at), provider, model
      ORDER BY date DESC, provider, model`,
      [req.tenantId, start, end]
    );

    const totals = await dbGet(
      `SELECT
        COUNT(*) as total_requests,
        COALESCE(SUM(input_tokens), 0) as total_input_tokens,
        COALESCE(SUM(output_tokens), 0) as total_output_tokens,
        COALESCE(SUM(total_tokens), 0) as total_tokens,
        COALESCE(SUM(cost_estimate), 0) as total_cost
      FROM ai_usage
      WHERE tenant_id = ? AND DATE(created_at) BETWEEN ? AND ?`,
      [req.tenantId, start, end]
    );

    res.json({ daily, totals });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/usage/by-provider - Aggregated stats grouped by provider
router.get('/by-provider', authMiddleware, adminOnly, requireTenant, async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    const start = start_date || new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);
    const end = end_date || new Date().toISOString().slice(0, 10);

    const providerRows = await dbAll(
      `SELECT provider,
        COUNT(*) as requests,
        COALESCE(SUM(total_tokens), 0) as tokens,
        COALESCE(SUM(cost_estimate), 0) as cost
      FROM ai_usage
      WHERE tenant_id = ? AND DATE(created_at) BETWEEN ? AND ?
      GROUP BY provider ORDER BY cost DESC`,
      [req.tenantId, start, end]
    );

    const modelRows = await dbAll(
      `SELECT provider, model,
        COUNT(*) as requests,
        COALESCE(SUM(total_tokens), 0) as tokens,
        COALESCE(SUM(cost_estimate), 0) as cost
      FROM ai_usage
      WHERE tenant_id = ? AND DATE(created_at) BETWEEN ? AND ?
      GROUP BY provider, model ORDER BY provider, cost DESC`,
      [req.tenantId, start, end]
    );

    const providers = providerRows.map(p => ({
      ...p,
      models: modelRows.filter(m => m.provider === p.provider).map(m => ({
        model: m.model,
        requests: m.requests,
        tokens: m.tokens,
        cost: m.cost
      }))
    }));

    res.json({ providers });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
