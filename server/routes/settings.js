const express = require('express');
const { dbRun, dbGet, dbAll } = require('../config/database');
const { authMiddleware, adminOnly, requireTenant } = require('../middleware/auth');

const router = express.Router();

// GET /api/settings
router.get('/', authMiddleware, requireTenant, async (req, res) => {
  const settings = await dbGet('SELECT * FROM settings WHERE tenant_id = ?', [req.tenantId]);
  if (settings && settings.ai_api_key) {
    if (req.user.role !== 'admin') {
      settings.ai_api_key = '****' + settings.ai_api_key.slice(-4);
    } else {
      // Admin sees masked key in UI, real key stays in DB
      settings.ai_api_key_masked = '****' + settings.ai_api_key.slice(-4);
    }
  }
  res.json({ settings });
});

// PUT /api/settings
router.put('/', authMiddleware, adminOnly, requireTenant, async (req, res) => {
  const {
    bot_name, friendliness, greeting_message, farewell_message,
    ai_provider, ai_api_key, ai_model, ai_custom_endpoint, whitelist_mode, bot_always_on
  } = req.body;
  const current = await dbGet('SELECT * FROM settings WHERE tenant_id = ?', [req.tenantId]);
  await dbRun(
    `UPDATE settings SET bot_name=?, friendliness=?, greeting_message=?, farewell_message=?,
     ai_provider=?, ai_api_key=?, ai_model=?, ai_custom_endpoint=?, whitelist_mode=?, bot_always_on=?, updated_at=NOW() WHERE tenant_id=?`,
    [
      bot_name ?? current.bot_name,
      friendliness ?? current.friendliness,
      greeting_message ?? current.greeting_message,
      farewell_message ?? current.farewell_message,
      ai_provider ?? current.ai_provider,
      (ai_api_key && !ai_api_key.startsWith('****')) ? ai_api_key : current.ai_api_key,
      ai_model ?? current.ai_model,
      ai_custom_endpoint ?? current.ai_custom_endpoint,
      whitelist_mode ?? current.whitelist_mode,
      bot_always_on !== undefined ? (bot_always_on ? 1 : 0) : current.bot_always_on,
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

  // Update WhatsApp presence via Baileys
  try {
    const { whatsappManager } = require('../services/whatsapp');
    const conn = whatsappManager._getConn(req.tenantId);
    if (conn.sock && conn.status === 'connected') {
      await conn.sock.sendPresenceUpdate(value ? 'available' : 'unavailable');
      console.log(`[WA:${req.tenantId}] Presence set to ${value ? 'available' : 'unavailable'}`);
    }
  } catch (e) {
    console.error('Presence update error:', e.message);
  }

  // Emit to all connected clients of this tenant so they stay in sync
  if (req.app.get('io')) {
    req.app.get('io').to(`tenant:${req.tenantId}`).emit('settings:online_status', !!online_status);
  }

  res.json({ online_status: !!online_status });
});

// GET /api/settings/models - Fetch available models from provider API
router.get('/models', authMiddleware, requireTenant, async (req, res) => {
  try {
    const settings = await dbGet('SELECT * FROM settings WHERE tenant_id = ?', [req.tenantId]);

    // Support fetching by ai_key_id (for the model picker)
    let provider, apiKey, customEndpoint;
    if (req.query.ai_key_id) {
      const keyRow = await dbGet('SELECT * FROM ai_keys WHERE id = ? AND tenant_id = ?', [req.query.ai_key_id, req.tenantId]);
      if (keyRow) {
        provider = keyRow.provider;
        apiKey = keyRow.api_key;
        customEndpoint = keyRow.custom_endpoint || '';
      }
    }
    if (!provider) {
      provider = req.query.provider || settings?.ai_provider || 'openai';
      const rawKey = req.query.api_key;
      apiKey = (rawKey && !rawKey.startsWith('****')) ? rawKey : (settings?.ai_api_key || '');
      customEndpoint = req.query.custom_endpoint || settings?.ai_custom_endpoint || '';
    }

    let models = [];

    if (provider === 'openai') {
      try {
        const response = await fetch('https://api.openai.com/v1/models', {
          headers: { 'Authorization': `Bearer ${apiKey}` }
        });
        const data = await response.json();
        if (data.data) {
          const chatPrefixes = ['gpt-5', 'gpt-4.1', 'gpt-4o', 'gpt-4-turbo', 'chatgpt-4o'];
          models = data.data
            .filter(m => chatPrefixes.some(p => m.id.startsWith(p)))
            .map(m => ({ id: m.id, name: m.id }))
            .sort((a, b) => a.id.localeCompare(b.id));
        }
      } catch {
        models = [
          { id: 'gpt-4o', name: 'gpt-4o' },
          { id: 'gpt-4o-mini', name: 'gpt-4o-mini' },
          { id: 'gpt-4-turbo', name: 'gpt-4-turbo' },
          { id: 'o1', name: 'o1' },
          { id: 'o1-mini', name: 'o1-mini' },
          { id: 'o3-mini', name: 'o3-mini' },
          { id: 'chatgpt-4o-latest', name: 'chatgpt-4o-latest' },
        ];
      }
    } else if (provider === 'anthropic') {
      models = [
        { id: 'claude-sonnet-4-6-20250514', name: 'Claude Sonnet 4.6' },
        { id: 'claude-haiku-4-5-20250315', name: 'Claude Haiku 4.5' },
        { id: 'claude-opus-4-20250514', name: 'Claude Opus 4' },
      ];
    } else if (provider === 'gemini') {
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await response.json();
        if (data.models) {
          models = data.models
            .filter(m => m.supportedGenerationMethods?.includes('generateContent'))
            .map(m => ({ id: m.name.replace('models/', ''), name: m.displayName || m.name.replace('models/', '') }))
            .sort((a, b) => a.id.localeCompare(b.id));
        }
      } catch {
        models = [
          { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash' },
          { id: 'gemini-2.5-flash-preview-05-20', name: 'Gemini 2.5 Flash' },
          { id: 'gemini-2.5-pro-preview-05-06', name: 'Gemini 2.5 Pro' },
          { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro' },
          { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash' },
        ];
      }
    } else if (provider === 'deepseek') {
      try {
        const response = await fetch('https://api.deepseek.com/models', {
          headers: { 'Authorization': `Bearer ${apiKey}` }
        });
        const data = await response.json();
        if (data.data) {
          models = data.data.map(m => ({ id: m.id, name: m.id })).sort((a, b) => a.id.localeCompare(b.id));
        }
      } catch {
        models = [
          { id: 'deepseek-chat', name: 'DeepSeek Chat (V3)' },
          { id: 'deepseek-reasoner', name: 'DeepSeek Reasoner (R1)' },
        ];
      }
    } else if (provider === 'custom') {
      try {
        const baseUrl = customEndpoint.replace(/\/chat\/completions\/?$/, '').replace(/\/$/, '');
        const response = await fetch(`${baseUrl}/models`, {
          headers: { 'Authorization': `Bearer ${apiKey}` }
        });
        const data = await response.json();
        if (data.data) {
          models = data.data.map(m => ({ id: m.id, name: m.id })).sort((a, b) => a.id.localeCompare(b.id));
        }
      } catch {
        models = [];
      }
    }

    res.json({ models });
  } catch (err) {
    res.status(500).json({ error: err.message, models: [] });
  }
});

// POST /api/settings/test-ai - Test AI provider connection
router.post('/test-ai', authMiddleware, adminOnly, requireTenant, async (req, res) => {
  let { provider, model, api_key, custom_endpoint } = req.body;

  // If api_key is masked or missing, fetch the real one from DB
  if (!api_key || api_key.startsWith('****')) {
    const settings = await dbGet('SELECT * FROM settings WHERE tenant_id = ?', [req.tenantId]);
    if (settings) {
      api_key = api_key || settings.ai_api_key;
      provider = provider || settings.ai_provider;
      model = model || settings.ai_model;
      custom_endpoint = custom_endpoint || settings.ai_custom_endpoint;
    }
  }

  if (!provider || !api_key) {
    return res.status(400).json({ success: false, error: 'Provider y API key son requeridos' });
  }

  const start = Date.now();

  try {
    let result;

    if (provider === 'openai' || provider === 'custom' || provider === 'deepseek') {
      const baseUrl = provider === 'custom'
        ? (custom_endpoint || 'https://api.openai.com/v1/chat/completions')
        : provider === 'deepseek'
          ? 'https://api.deepseek.com/chat/completions'
          : 'https://api.openai.com/v1/chat/completions';
      const response = await fetch(baseUrl, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${api_key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: model || 'gpt-4o-mini',
          max_tokens: 30,
          messages: [{ role: 'user', content: 'Say hello in 5 words' }]
        })
      });
      result = await response.json();
      if (result.error) throw new Error(result.error.message);
      if (!result.choices?.[0]) throw new Error('No response received');
    } else if (provider === 'anthropic') {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': api_key,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: model || 'claude-haiku-4-5-20250315',
          max_tokens: 30,
          messages: [{ role: 'user', content: 'Say hello in 5 words' }]
        })
      });
      result = await response.json();
      if (result.error) throw new Error(result.error.message);
      if (!result.content?.[0]) throw new Error('No response received');
    } else if (provider === 'gemini') {
      const modelId = model || 'gemini-2.0-flash';
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${api_key}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: 'Say hello in 5 words' }] }],
            generationConfig: { maxOutputTokens: 30 }
          })
        }
      );
      result = await response.json();
      if (result.error) throw new Error(result.error.message || JSON.stringify(result.error));
      if (!result.candidates?.[0]) throw new Error('No response received');
    } else {
      return res.status(400).json({ success: false, error: `Proveedor no soportado: ${provider}` });
    }

    res.json({ success: true, response_time_ms: Date.now() - start, model_used: model || 'default' });
  } catch (err) {
    res.json({ success: false, error: err.message, response_time_ms: Date.now() - start });
  }
});

// ===== AI KEYS CRUD =====

// GET /api/settings/ai-keys - List all API keys
router.get('/ai-keys', authMiddleware, adminOnly, requireTenant, async (req, res) => {
  try {
    const keys = await dbAll('SELECT * FROM ai_keys WHERE tenant_id = ? ORDER BY created_at DESC', [req.tenantId]);
    const masked = keys.map(k => ({ ...k, api_key_masked: '****' + k.api_key.slice(-4), api_key: undefined }));
    res.json({ keys: masked });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/settings/ai-keys - Add a new API key
router.post('/ai-keys', authMiddleware, adminOnly, requireTenant, async (req, res) => {
  try {
    const { label, provider, api_key, custom_endpoint } = req.body;
    if (!provider || !api_key) return res.status(400).json({ error: 'Provider y API key son requeridos' });
    const result = await dbRun(
      `INSERT INTO ai_keys (tenant_id, label, provider, api_key, custom_endpoint) VALUES (?, ?, ?, ?, ?)`,
      [req.tenantId, label || `${provider} key`, provider, api_key, custom_endpoint || '']
    );
    res.json({ id: result.lastInsertRowid });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE /api/settings/ai-keys/:id
router.delete('/ai-keys/:id', authMiddleware, adminOnly, requireTenant, async (req, res) => {
  try {
    const key = await dbGet('SELECT * FROM ai_keys WHERE id = ? AND tenant_id = ?', [req.params.id, req.tenantId]);
    if (!key) return res.status(404).json({ error: 'Key no encontrada' });
    // Cascade deletes ai_models referencing this key
    await dbRun('DELETE FROM ai_keys WHERE id = ? AND tenant_id = ?', [req.params.id, req.tenantId]);
    // If active model used this key, clear settings
    const activeModel = await dbGet('SELECT * FROM ai_models WHERE tenant_id = ? AND is_active = 1', [req.tenantId]);
    if (!activeModel) {
      await dbRun(`UPDATE settings SET ai_api_key='', ai_model='gpt-4o-mini' WHERE tenant_id=?`, [req.tenantId]);
    }
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ===== AI MODELS (favorites) CRUD =====

// GET /api/settings/ai-models - List all favorite models with their key info
router.get('/ai-models', authMiddleware, adminOnly, requireTenant, async (req, res) => {
  try {
    const models = await dbAll(
      `SELECT m.*, k.provider, k.label as key_label, k.custom_endpoint
       FROM ai_models m JOIN ai_keys k ON m.ai_key_id = k.id
       WHERE m.tenant_id = ? ORDER BY m.is_active DESC, m.created_at DESC`,
      [req.tenantId]
    );
    res.json({ models });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/settings/ai-models - Add a favorite model
router.post('/ai-models', authMiddleware, adminOnly, requireTenant, async (req, res) => {
  try {
    const { ai_key_id, model, label } = req.body;
    if (!ai_key_id || !model) return res.status(400).json({ error: 'Key y modelo son requeridos' });
    const key = await dbGet('SELECT * FROM ai_keys WHERE id = ? AND tenant_id = ?', [ai_key_id, req.tenantId]);
    if (!key) return res.status(404).json({ error: 'Key no encontrada' });

    // If no models exist yet, make this one active
    const existing = await dbAll('SELECT id FROM ai_models WHERE tenant_id = ?', [req.tenantId]);
    const isActive = existing.length === 0 ? 1 : 0;

    const result = await dbRun(
      `INSERT INTO ai_models (tenant_id, ai_key_id, model, label, is_active) VALUES (?, ?, ?, ?, ?)`,
      [req.tenantId, ai_key_id, model, label || model, isActive]
    );

    // Sync to settings if active
    if (isActive) {
      await dbRun(
        `UPDATE settings SET ai_provider=?, ai_api_key=?, ai_model=?, ai_custom_endpoint=? WHERE tenant_id=?`,
        [key.provider, key.api_key, model, key.custom_endpoint || '', req.tenantId]
      );
    }

    res.json({ id: result.lastInsertRowid, is_active: !!isActive });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT /api/settings/ai-models/:id/activate - Set a model as active
router.put('/ai-models/:id/activate', authMiddleware, adminOnly, requireTenant, async (req, res) => {
  try {
    const modelRow = await dbGet(
      `SELECT m.*, k.provider, k.api_key, k.custom_endpoint FROM ai_models m JOIN ai_keys k ON m.ai_key_id = k.id WHERE m.id = ? AND m.tenant_id = ?`,
      [req.params.id, req.tenantId]
    );
    if (!modelRow) return res.status(404).json({ error: 'Modelo no encontrado' });

    await dbRun('UPDATE ai_models SET is_active = 0 WHERE tenant_id = ?', [req.tenantId]);
    await dbRun('UPDATE ai_models SET is_active = 1 WHERE id = ?', [req.params.id]);

    // Sync to settings
    await dbRun(
      `UPDATE settings SET ai_provider=?, ai_api_key=?, ai_model=?, ai_custom_endpoint=? WHERE tenant_id=?`,
      [modelRow.provider, modelRow.api_key, modelRow.model, modelRow.custom_endpoint || '', req.tenantId]
    );

    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE /api/settings/ai-models/:id
router.delete('/ai-models/:id', authMiddleware, adminOnly, requireTenant, async (req, res) => {
  try {
    const modelRow = await dbGet('SELECT * FROM ai_models WHERE id = ? AND tenant_id = ?', [req.params.id, req.tenantId]);
    if (!modelRow) return res.status(404).json({ error: 'Modelo no encontrado' });

    await dbRun('DELETE FROM ai_models WHERE id = ? AND tenant_id = ?', [req.params.id, req.tenantId]);

    // If was active, activate next or clear
    if (modelRow.is_active) {
      const next = await dbGet(
        `SELECT m.*, k.provider, k.api_key, k.custom_endpoint FROM ai_models m JOIN ai_keys k ON m.ai_key_id = k.id WHERE m.tenant_id = ? ORDER BY m.created_at DESC LIMIT 1`,
        [req.tenantId]
      );
      if (next) {
        await dbRun('UPDATE ai_models SET is_active = 1 WHERE id = ?', [next.id]);
        await dbRun(`UPDATE settings SET ai_provider=?, ai_api_key=?, ai_model=?, ai_custom_endpoint=? WHERE tenant_id=?`,
          [next.provider, next.api_key, next.model, next.custom_endpoint || '', req.tenantId]);
      } else {
        await dbRun(`UPDATE settings SET ai_api_key='', ai_model='gpt-4o-mini' WHERE tenant_id=?`, [req.tenantId]);
      }
    }
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
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

router.get('/mcp', authMiddleware, adminOnly, requireTenant, async (req, res) => {
  const status = await mcpManager.getStatusForTenant(req.tenantId);
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
        const status = await mcpManager.getStatusForTenant(req.tenantId);
        return res.json({ server, connectionError: err.message, servers: status });
      }
    }

    const status = await mcpManager.getStatusForTenant(req.tenantId);
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
      const status = await mcpManager.getStatusForTenant(req.tenantId);
      return res.json({ server, connectionError: err.message, servers: status });
    }
  } else {
    await mcpManager.disconnectServer(req.tenantId, server.id);
  }

  const status = await mcpManager.getStatusForTenant(req.tenantId);
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
