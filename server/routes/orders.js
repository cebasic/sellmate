const express = require('express');
const { dbRun, dbGet, dbAll } = require('../config/database');
const { authMiddleware, adminOnly, requireTenant } = require('../middleware/auth');
const { whatsappManager } = require('../services/whatsapp');

const router = express.Router();

const VALID_STATUSES = ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'];

// Professional status notification messages (like DHL/MercadoLibre)
const STATUS_MESSAGES = {
  confirmed: (order, business) => `✅ *Pedido #${order.id} confirmado*\n\nHola ${order.contact_name || 'cliente'}, tu pedido ha sido confirmado y sera procesado en breve.\n\n${business ? `— ${business.name}` : ''}`,
  preparing: (order, business) => `👨‍🍳 *Pedido #${order.id} en preparacion*\n\nTu pedido esta siendo preparado. Te avisaremos cuando este listo.\n\n${business ? `— ${business.name}` : ''}`,
  ready: (order, business) => `🎉 *Pedido #${order.id} listo*\n\nTu pedido esta listo para entrega. Gracias por tu preferencia.\n\n${business ? `— ${business.name}` : ''}`,
  delivered: (order, business) => `📦 *Pedido #${order.id} entregado*\n\nTu pedido ha sido entregado. Esperamos que lo disfrutes. Gracias por elegirnos.\n\n${business ? `— ${business.name}` : ''}`,
  cancelled: (order, business) => `❌ *Pedido #${order.id} cancelado*\n\nTu pedido ha sido cancelado. Si tienes dudas, no dudes en contactarnos.\n\n${business ? `— ${business.name}` : ''}`
};

// GET /api/orders - List orders for tenant
router.get('/', authMiddleware, requireTenant, async (req, res) => {
  try {
    const { status } = req.query;
    let query = 'SELECT * FROM orders WHERE tenant_id = ?';
    const params = [req.tenantId];

    if (status && VALID_STATUSES.includes(status)) {
      query += ' AND status = ?';
      params.push(status);
    }

    query += ' ORDER BY created_at DESC';
    const orders = await dbAll(query, params);
    res.json({ orders });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/orders/:id - Get single order with conversation messages
router.get('/:id', authMiddleware, requireTenant, async (req, res) => {
  try {
    const order = await dbGet('SELECT * FROM orders WHERE id = ? AND tenant_id = ?',
      [Number(req.params.id), req.tenantId]);
    if (!order) return res.status(404).json({ error: 'Pedido no encontrado' });

    let messages = [];
    if (order.conversation_id) {
      messages = await dbAll(
        'SELECT * FROM messages WHERE conversation_id = ? ORDER BY timestamp ASC',
        [order.conversation_id]
      );
    }

    res.json({ order, messages });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/orders/:id/status - Update order status
router.put('/:id/status', authMiddleware, requireTenant, async (req, res) => {
  try {
    const { status } = req.body;
    if (!status || !VALID_STATUSES.includes(status)) {
      return res.status(400).json({ error: 'Estado no valido. Valores permitidos: ' + VALID_STATUSES.join(', ') });
    }

    const existing = await dbGet('SELECT * FROM orders WHERE id = ? AND tenant_id = ?',
      [Number(req.params.id), req.tenantId]);
    if (!existing) return res.status(404).json({ error: 'Pedido no encontrado' });

    await dbRun('UPDATE orders SET status = ? WHERE id = ? AND tenant_id = ?',
      [status, Number(req.params.id), req.tenantId]);

    const order = await dbGet('SELECT * FROM orders WHERE id = ?', [Number(req.params.id)]);

    const io = req.app.get('io');
    if (io) {
      io.to(`tenant:${req.tenantId}`).emit('order:updated', order);
    }

    // Notify customer via WhatsApp if configured
    try {
      const moduleConfig = await dbGet('SELECT config FROM tenant_modules WHERE tenant_id = ? AND module_key = ?', [req.tenantId, 'orders']);
      const config = moduleConfig?.config ? JSON.parse(moduleConfig.config) : {};
      const notifyCustomer = config.customerNotifications || {};

      if (notifyCustomer[status] && STATUS_MESSAGES[status]) {
        const business = await dbGet('SELECT name FROM business_info WHERE tenant_id = ?', [req.tenantId]);
        const msg = STATUS_MESSAGES[status](order, business);
        await whatsappManager.sendMessage(req.tenantId, order.phone_number, msg);
      }
    } catch (e) {
      console.error('Customer notification error:', e.message);
    }

    res.json({ order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/orders/:id - Delete an order
router.delete('/:id', authMiddleware, adminOnly, requireTenant, async (req, res) => {
  try {
    await dbRun('DELETE FROM orders WHERE id = ? AND tenant_id = ?',
      [Number(req.params.id), req.tenantId]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
