const express = require('express');
const bcrypt = require('bcryptjs');
const { dbRun, dbGet, dbAll } = require('../config/database');
const { generateToken, authMiddleware, adminOnly, requireTenant, superAdminOnly } = require('../middleware/auth');

const router = express.Router();

// POST /api/auth/register - First super-admin registration (only when no users exist)
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, businessName } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, contraseña y nombre son requeridos' });
    }
    const row = await dbGet('SELECT COUNT(*) as count FROM users');
    if (row.count > 0) {
      return res.status(403).json({ error: 'Ya existe un administrador. Usa login.' });
    }
    const existing = await dbGet('SELECT id FROM users WHERE email = ?', [email]);
    if (existing) return res.status(409).json({ error: 'Email ya registrado' });

    const hash = await bcrypt.hash(password, 10);
    const tenantName = businessName || 'Mi Negocio';
    const slug = tenantName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'mi-negocio';

    // Create user first, then tenant, then link
    const userResult = await dbRun(
      'INSERT INTO users (email, password_hash, name, role, super_admin) VALUES (?, ?, ?, ?, ?)',
      [email, hash, name, 'admin', 1]
    );
    const userId = userResult.lastInsertRowid;

    const tenantResult = await dbRun(
      'INSERT INTO tenants (slug, name, owner_user_id) VALUES (?, ?, ?)',
      [slug, tenantName, userId]
    );
    const tenantId = tenantResult.lastInsertRowid;

    await dbRun('UPDATE users SET tenant_id = ? WHERE id = ?', [tenantId, userId]);

    // Create default settings and business_info
    await dbRun('INSERT INTO settings (tenant_id) VALUES (?)', [tenantId]);
    await dbRun('INSERT INTO business_info (tenant_id, name) VALUES (?, ?)', [tenantId, tenantName]);

    const user = { id: userId, email, name, role: 'admin', super_admin: 1 };
    res.json({ token: generateToken(user, tenantId), user: { ...user, tenantId, tenantName } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/register-tenant - Register a new tenant (new business)
router.post('/register-tenant', async (req, res) => {
  try {
    const { email, password, name, businessName } = req.body;
    if (!email || !password || !name || !businessName) {
      return res.status(400).json({ error: 'Email, contraseña, nombre y nombre del negocio son requeridos' });
    }

    const existing = await dbGet('SELECT id FROM users WHERE email = ?', [email]);
    if (existing) return res.status(409).json({ error: 'Email ya registrado' });

    const hash = await bcrypt.hash(password, 10);
    const slug = businessName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    const slugExists = await dbGet('SELECT id FROM tenants WHERE slug = ?', [slug]);
    if (slugExists) {
      return res.status(409).json({ error: 'Ya existe un negocio con ese nombre. Elige otro.' });
    }

    const userResult = await dbRun(
      'INSERT INTO users (email, password_hash, name, role) VALUES (?, ?, ?, ?)',
      [email, hash, name, 'admin']
    );
    const userId = userResult.lastInsertRowid;

    const tenantResult = await dbRun(
      'INSERT INTO tenants (slug, name, owner_user_id) VALUES (?, ?, ?)',
      [slug, businessName, userId]
    );
    const tenantId = tenantResult.lastInsertRowid;

    await dbRun('UPDATE users SET tenant_id = ? WHERE id = ?', [tenantId, userId]);
    await dbRun('INSERT INTO settings (tenant_id) VALUES (?)', [tenantId]);
    await dbRun('INSERT INTO business_info (tenant_id, name) VALUES (?, ?)', [tenantId, businessName]);

    const user = { id: userId, email, name, role: 'admin', super_admin: 0 };
    res.json({ token: generateToken(user, tenantId), user: { ...user, tenantId, tenantName: businessName } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña requeridos' });
    }
    const user = await dbGet('SELECT * FROM users WHERE email = ? AND active = 1', [email]);
    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    const tenantId = user.tenant_id;
    const tenant = tenantId ? await dbGet('SELECT name FROM tenants WHERE id = ?', [tenantId]) : null;
    const userData = {
      id: user.id, email: user.email, name: user.name, role: user.role,
      tenantId, superAdmin: !!user.super_admin, tenantName: tenant?.name || ''
    };
    res.json({ token: generateToken(user, tenantId), user: userData });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/auth/me
router.get('/me', authMiddleware, async (req, res) => {
  const tenant = req.tenantId ? await dbGet('SELECT name FROM tenants WHERE id = ?', [req.tenantId]) : null;
  const userData = {
    id: req.user.id, email: req.user.email, name: req.user.name, role: req.user.role,
    tenantId: req.tenantId, superAdmin: !!req.user.super_admin, tenantName: tenant?.name || ''
  };
  res.json({ user: userData });
});

// GET /api/auth/check
router.get('/check', async (req, res) => {
  try {
    const row = await dbGet('SELECT COUNT(*) as count FROM users');
    res.json({ hasAdmin: row.count > 0 });
  } catch (err) {
    console.error('Auth check error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/agents
router.post('/agents', authMiddleware, adminOnly, requireTenant, async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, contraseña y nombre son requeridos' });
    }
    const existing = await dbGet('SELECT id FROM users WHERE email = ?', [email]);
    if (existing) return res.status(409).json({ error: 'Email ya registrado' });
    const hash = await bcrypt.hash(password, 10);
    const result = await dbRun(
      'INSERT INTO users (tenant_id, email, password_hash, name, role, created_by) VALUES (?, ?, ?, ?, ?, ?)',
      [req.tenantId, email, hash, name, 'agent', req.user.id]
    );
    res.json({ agent: { id: result.lastInsertRowid, email, name, role: 'agent' } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/auth/agents
router.get('/agents', authMiddleware, adminOnly, requireTenant, async (req, res) => {
  const agents = await dbAll(
    'SELECT id, email, name, role, active, created_at FROM users WHERE tenant_id = ? AND role = ?',
    [req.tenantId, 'agent']
  );
  res.json({ agents });
});

// DELETE /api/auth/agents/:id
router.delete('/agents/:id', authMiddleware, adminOnly, requireTenant, async (req, res) => {
  await dbRun('UPDATE users SET active = 0 WHERE id = ? AND tenant_id = ? AND role = ?',
    [Number(req.params.id), req.tenantId, 'agent']);
  res.json({ success: true });
});

// ===== SUPER-ADMIN: Tenant Management =====

// GET /api/auth/tenants
router.get('/tenants', authMiddleware, superAdminOnly, async (req, res) => {
  const tenants = await dbAll(`
    SELECT t.*, u.name as owner_name, u.email as owner_email,
      (SELECT COUNT(*) FROM conversations WHERE tenant_id = t.id) as conversation_count,
      (SELECT COUNT(*) FROM users WHERE tenant_id = t.id) as user_count
    FROM tenants t
    LEFT JOIN users u ON u.id = t.owner_user_id
    ORDER BY t.created_at DESC
  `);
  res.json({ tenants });
});

// POST /api/auth/tenants/:id/toggle
router.post('/tenants/:id/toggle', authMiddleware, superAdminOnly, async (req, res) => {
  const tenant = await dbGet('SELECT * FROM tenants WHERE id = ?', [Number(req.params.id)]);
  if (!tenant) return res.status(404).json({ error: 'Tenant no encontrado' });
  await dbRun('UPDATE tenants SET active = ? WHERE id = ?', [tenant.active ? 0 : 1, tenant.id]);
  res.json({ success: true, active: !tenant.active });
});

module.exports = router;
