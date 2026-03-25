const express = require('express');
const { dbRun, dbGet, dbAll } = require('../config/database');
const { authMiddleware, adminOnly, requireTenant } = require('../middleware/auth');

const router = express.Router();

router.get('/', authMiddleware, requireTenant, async (req, res) => {
  const products = await dbAll('SELECT * FROM products WHERE tenant_id = ? ORDER BY created_at DESC', [req.tenantId]);
  res.json({ products });
});

router.post('/', authMiddleware, adminOnly, requireTenant, async (req, res) => {
  const { name, description, price, category, image_url, stock } = req.body;
  if (!name || price == null) {
    return res.status(400).json({ error: 'Nombre y precio son requeridos' });
  }
  const result = await dbRun(
    'INSERT INTO products (tenant_id, name, description, price, category, image_url, stock) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [req.tenantId, name, description || '', price, category || '', image_url || '', stock || 0]
  );
  const product = await dbGet('SELECT * FROM products WHERE id = ?', [result.lastInsertRowid]);
  res.json({ product });
});

router.put('/:id', authMiddleware, adminOnly, requireTenant, async (req, res) => {
  const { name, description, price, category, image_url, stock, active } = req.body;
  const existing = await dbGet('SELECT * FROM products WHERE id = ? AND tenant_id = ?', [Number(req.params.id), req.tenantId]);
  if (!existing) return res.status(404).json({ error: 'Producto no encontrado' });
  await dbRun(
    'UPDATE products SET name=?, description=?, price=?, category=?, image_url=?, stock=?, active=? WHERE id=? AND tenant_id=?',
    [name ?? existing.name, description ?? existing.description, price ?? existing.price,
     category ?? existing.category, image_url ?? existing.image_url, stock ?? existing.stock,
     active ?? existing.active, Number(req.params.id), req.tenantId]
  );
  const product = await dbGet('SELECT * FROM products WHERE id = ?', [Number(req.params.id)]);
  res.json({ product });
});

router.delete('/:id', authMiddleware, adminOnly, requireTenant, async (req, res) => {
  await dbRun('DELETE FROM products WHERE id = ? AND tenant_id = ?', [Number(req.params.id), req.tenantId]);
  res.json({ success: true });
});

module.exports = router;
