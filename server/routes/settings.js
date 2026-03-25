const express = require('express');
const { dbRun, dbGet, dbAll } = require('../config/database');
const { authMiddleware, adminOnly, requireTenant } = require('../middleware/auth');

const router = express.Router();

// GET /api/settings
router.get('/', authMiddleware, requireTenant, async (req, res) => {
  const settings = await dbGet('SELECT * FROM settings WHERE tenant_id = ?', [req.tenantId]);
  if (req.user.role !== 'admin' && settings && settings.ai_api_key) {
    settings.ai_api_key = '****' + settings.ai_api_key.slice(-4);
  }
  res.json({ settings });
});

// PUT /api/settings
router.put('/', authMiddleware, adminOnly, requireTenant, async (req, res) => {
  const {
    bot_name, friendliness, greeting_message, farewell_message,
    ai_provider, ai_api_key, ai_model, ai_custom_endpoint, whitelist_mode
  } = req.body;
  const current = await dbGet('SELECT * FROM settings WHERE tenant_id = ?', [req.tenantId]);
  await dbRun(
    `UPDATE settings SET bot_name=?, friendliness=?, greeting_message=?, farewell_message=?,
     ai_provider=?, ai_api_key=?, ai_model=?, ai_custom_endpoint=?, whitelist_mode=?, updated_at=NOW() WHERE tenant_id=?`,
    [
      bot_name ?? current.bot_name,
      friendliness ?? current.friendliness,
      greeting_message ?? current.greeting_message,
      farewell_message ?? current.farewell_message,
      ai_provider ?? current.ai_provider,
      ai_api_key ?? current.ai_api_key,
      ai_model ?? current.ai_model,
      ai_custom_endpoint ?? current.ai_custom_endpoint,
      whitelist_mode ?? current.whitelist_mode,
      req.tenantId
    ]
  );
  const settings = await dbGet('SELECT * FROM settings WHERE tenant_id = ?', [req.tenantId]);
  res.json({ settings });
});

// PUT /api/settings/online-status
router.put('/online-status', authMiddleware, requireTenant, async (req, res) => {
  const { online_status } = req.body;
  const value = online_status ? 1 : 0;
  await dbRun('UPDATE settings SET online_status = ?, updated_at = NOW() WHERE tenant_id = ?', [value, req.tenantId]);

  // Emit to all connected clients of this tenant so they stay in sync
  if (req.app.get('io')) {
    req.app.get('io').to(`tenant:${req.tenantId}`).emit('settings:online_status', !!online_status);
  }

  res.json({ online_status: !!online_status });
});

// ===== WHITELIST CRUD =====

router.get('/whitelist', authMiddleware, adminOnly, requireTenant, async (req, res) => {
  const list = await dbAll('SELECT * FROM whitelist WHERE tenant_id = ? ORDER BY created_at DESC', [req.tenantId]);
  res.json({ whitelist: list });
});

router.post('/whitelist', authMiddleware, adminOnly, requireTenant, async (req, res) => {
  const { phone_number, label } = req.body;
  if (!phone_number || !phone_number.trim()) {
    return res.status(400).json({ error: 'Número de teléfono requerido' });
  }
  const normalized = phone_number.trim().replace(/[\s\-\(\)]/g, '');
  try {
    const result = await dbRun(
      'INSERT INTO whitelist (tenant_id, phone_number, label) VALUES (?, ?, ?)',
      [req.tenantId, normalized, label || '']
    );
    const entry = await dbGet('SELECT * FROM whitelist WHERE id = ?', [result.lastInsertRowid]);
    res.json({ entry });
  } catch (err) {
    if (err.message && err.message.includes('UNIQUE')) {
      return res.status(409).json({ error: 'Este número ya está en la lista blanca' });
    }
    res.status(500).json({ error: err.message });
  }
});

router.delete('/whitelist/:id', authMiddleware, adminOnly, requireTenant, async (req, res) => {
  await dbRun('DELETE FROM whitelist WHERE id = ? AND tenant_id = ?', [req.params.id, req.tenantId]);
  res.json({ success: true });
});

// ===== MCP SERVERS CRUD =====

const { mcpManager } = require('../services/mcp');

router.get('/mcp', authMiddleware, adminOnly, requireTenant, (req, res) => {
  const status = mcpManager.getStatusForTenant(req.tenantId);
  res.json({ servers: status });
});

router.post('/mcp', authMiddleware, adminOnly, requireTenant, async (req, res) => {
  const { name, transport, command, args, url, env_vars, enabled } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Nombre del servidor requerido' });
  }
  if (!transport || !['stdio', 'sse'].includes(transport)) {
    return res.status(400).json({ error: 'Transporte debe ser "stdio" o "sse"' });
  }
  if (transport === 'stdio' && (!command || !command.trim())) {
    return res.status(400).json({ error: 'Comando requerido para transporte stdio' });
  }
  if (transport === 'sse' && (!url || !url.trim())) {
    return res.status(400).json({ error: 'URL requerida para transporte SSE' });
  }

  try {
    const result = await dbRun(
      `INSERT INTO mcp_servers (tenant_id, name, transport, command, args, url, env_vars, enabled) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.tenantId, name.trim(), transport, command || '', JSON.stringify(args || []),
       url || '', JSON.stringify(env_vars || {}), enabled !== false ? 1 : 0]
    );

    const server = await dbGet('SELECT * FROM mcp_servers WHERE id = ?', [result.lastInsertRowid]);

    if (server.enabled) {
      try {
        await mcpManager.connectServer(req.tenantId, server);
      } catch (err) {
        const status = mcpManager.getStatusForTenant(req.tenantId);
        return res.json({ server, connectionError: err.message, servers: status });
      }
    }

    const status = mcpManager.getStatusForTenant(req.tenantId);
    res.json({ server, servers: status });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/mcp/:id', authMiddleware, adminOnly, requireTenant, async (req, res) => {
  const { id } = req.params;
  const existing = await dbGet('SELECT * FROM mcp_servers WHERE id = ? AND tenant_id = ?', [id, req.tenantId]);
  if (!existing) return res.status(404).json({ error: 'Servidor MCP no encontrado' });

  const { name, transport, command, args, url, env_vars, enabled } = req.body;

  await dbRun(
    `UPDATE mcp_servers SET name=?, transport=?, command=?, args=?, url=?, env_vars=?, enabled=?, created_at=created_at WHERE id=? AND tenant_id=?`,
    [name ?? existing.name, transport ?? existing.transport, command ?? existing.command,
     args ? JSON.stringify(args) : existing.args, url ?? existing.url,
     env_vars ? JSON.stringify(env_vars) : existing.env_vars,
     enabled !== undefined ? (enabled ? 1 : 0) : existing.enabled, id, req.tenantId]
  );

  const server = await dbGet('SELECT * FROM mcp_servers WHERE id = ?', [id]);

  if (server.enabled) {
    try {
      await mcpManager.connectServer(req.tenantId, server);
    } catch (err) {
      const status = mcpManager.getStatusForTenant(req.tenantId);
      return res.json({ server, connectionError: err.message, servers: status });
    }
  } else {
    await mcpManager.disconnectServer(req.tenantId, server.id);
  }

  const status = mcpManager.getStatusForTenant(req.tenantId);
  res.json({ server, servers: status });
});

router.delete('/mcp/:id', authMiddleware, adminOnly, requireTenant, async (req, res) => {
  const { id } = req.params;
  await mcpManager.disconnectServer(req.tenantId, Number(id));
  await dbRun('DELETE FROM mcp_servers WHERE id = ? AND tenant_id = ?', [id, req.tenantId]);
  res.json({ success: true });
});

router.post('/mcp/:id/test', authMiddleware, adminOnly, requireTenant, async (req, res) => {
  const server = await dbGet('SELECT * FROM mcp_servers WHERE id = ? AND tenant_id = ?', [req.params.id, req.tenantId]);
  if (!server) return res.status(404).json({ error: 'Servidor MCP no encontrado' });

  try {
    const tools = await mcpManager.connectServer(req.tenantId, server);
    res.json({ success: true, tools: tools.map(t => ({ name: t.name, description: t.description })) });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
