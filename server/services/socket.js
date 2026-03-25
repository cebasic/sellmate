const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../middleware/auth');
const { dbRun, dbGet } = require('../config/database');
const { whatsappManager } = require('./whatsapp');

function setupSocket(io) {
  // Auth middleware for Socket.IO
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Token requerido'));
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      socket.user = decoded;
      socket.tenantId = decoded.tenantId;
      next();
    } catch (err) {
      next(new Error('Token inválido'));
    }
  });

  io.on('connection', (socket) => {
    const tenantId = socket.tenantId;
    console.log(`Socket connected: ${socket.user.name} (tenant: ${tenantId})`);

    // Join tenant-specific room
    if (tenantId) {
      socket.join(`tenant:${tenantId}`);
    }

    // Send current WhatsApp status for this tenant
    socket.emit('whatsapp:status', whatsappManager.getStatus(tenantId));
    const lastQr = whatsappManager.getLastQr(tenantId);
    if (whatsappManager.getStatus(tenantId) === 'connecting' && lastQr) {
      socket.emit('whatsapp:qr', lastQr);
    }

    // Agent sends a message
    socket.on('message:send', async (data) => {
      const { conversation_id, content } = data;
      if (!conversation_id || !content) return;

      // Verify conversation belongs to this tenant
      const conversation = await dbGet('SELECT * FROM conversations WHERE id = ? AND tenant_id = ?',
        [conversation_id, tenantId]);
      if (!conversation) return;

      const result = await dbRun(
        'INSERT INTO messages (conversation_id, sender, sender_name, content, message_type) VALUES (?, ?, ?, ?, ?)',
        [conversation_id, 'agent', socket.user.name, content, 'text']
      );
      const savedMsg = await dbGet('SELECT * FROM messages WHERE id = ?', [result.insertId]);

      await dbRun(`UPDATE conversations SET last_message_at = NOW() WHERE id = ?`, [conversation_id]);
      const updatedConv = await dbGet('SELECT * FROM conversations WHERE id = ?', [conversation_id]);

      // Emit only to tenant room
      io.to(`tenant:${tenantId}`).emit('message:new', { conversation: updatedConv, message: savedMsg });

      // Send via WhatsApp
      try {
        await whatsappManager.sendMessage(tenantId, conversation.phone_number, content);
      } catch (err) {
        console.error('Error sending via WhatsApp:', err);
        socket.emit('error', { message: 'Error enviando mensaje por WhatsApp' });
      }
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.user.name}`);
    });
  });
}

module.exports = { setupSocket };
