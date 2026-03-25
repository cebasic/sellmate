const express = require('express');
const { dbRun, dbGet } = require('../config/database');
const { authMiddleware, adminOnly, requireTenant } = require('../middleware/auth');

const router = express.Router();

router.get('/', authMiddleware, requireTenant, async (req, res) => {
  const info = await dbGet('SELECT * FROM business_info WHERE tenant_id = ?', [req.tenantId]);
  res.json({ business: info });
});

router.put('/', authMiddleware, adminOnly, requireTenant, async (req, res) => {
  const { name, description, address, phone, hours, policies, extra_info } = req.body;
  await dbRun(
    `UPDATE business_info SET name=?, description=?, address=?, phone=?, hours=?, policies=?, extra_info=?, updated_at=NOW() WHERE tenant_id=?`,
    [name || '', description || '', address || '', phone || '', hours || '', policies || '', extra_info || '', req.tenantId]
  );
  const info = await dbGet('SELECT * FROM business_info WHERE tenant_id = ?', [req.tenantId]);
  res.json({ business: info });
});

module.exports = router;
