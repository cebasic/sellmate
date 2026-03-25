const express = require('express');
const { dbRun, dbGet, dbAll } = require('../config/database');
const { authMiddleware, adminOnly, requireTenant } = require('../middleware/auth');

const router = express.Router();

// GET /api/appointments - List appointments for tenant
router.get('/', authMiddleware, requireTenant, async (req, res) => {
  const { status, date, phone } = req.query;
  let query = 'SELECT * FROM appointments WHERE tenant_id = ?';
  const params = [req.tenantId];

  if (status) {
    query += ' AND status = ?';
    params.push(status);
  }
  if (date) {
    query += ' AND date = ?';
    params.push(date);
  }
  if (phone) {
    query += ' AND phone_number LIKE ?';
    params.push(`%${phone}%`);
  }

  query += ' ORDER BY date ASC, time ASC';
  const appointments = await dbAll(query, params);
  res.json({ appointments });
});

// GET /api/appointments/upcoming - Upcoming appointments
router.get('/upcoming', authMiddleware, requireTenant, async (req, res) => {
  const appointments = await dbAll(
    `SELECT * FROM appointments WHERE tenant_id = ? AND status IN ('scheduled', 'confirmed')
     AND (date > CURDATE() OR (date = CURDATE() AND time >= CURTIME()))
     ORDER BY date ASC, time ASC LIMIT 20`,
    [req.tenantId]
  );
  res.json({ appointments });
});

// GET /api/appointments/:id - Get single appointment
router.get('/:id', authMiddleware, requireTenant, async (req, res) => {
  const appointment = await dbGet('SELECT * FROM appointments WHERE id = ? AND tenant_id = ?',
    [Number(req.params.id), req.tenantId]);
  if (!appointment) return res.status(404).json({ error: 'Cita no encontrada' });
  res.json({ appointment });
});

// POST /api/appointments - Create appointment
router.post('/', authMiddleware, requireTenant, async (req, res) => {
  const { phone_number, contact_name, title, description, date, time, duration_minutes, notes } = req.body;
  if (!phone_number || !title || !date || !time) {
    return res.status(400).json({ error: 'Teléfono, título, fecha y hora son requeridos' });
  }

  // Link to conversation if exists
  const conversation = await dbGet('SELECT id FROM conversations WHERE tenant_id = ? AND phone_number = ?',
    [req.tenantId, phone_number]);

  const result = await dbRun(
    `INSERT INTO appointments (tenant_id, conversation_id, phone_number, contact_name, title, description, date, time, duration_minutes, notes, created_by, created_by_user_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [req.tenantId, conversation?.id || null, phone_number, contact_name || '',
     title, description || '', date, time, duration_minutes || 60, notes || '',
     'agent', req.user.id]
  );

  const appointment = await dbGet('SELECT * FROM appointments WHERE id = ?', [result.lastInsertRowid]);

  const io = req.app.get('io');
  if (io) {
    io.to(`tenant:${req.tenantId}`).emit('appointment:new', appointment);
  }

  res.json({ appointment });
});

// PUT /api/appointments/:id - Update appointment
router.put('/:id', authMiddleware, requireTenant, async (req, res) => {
  const existing = await dbGet('SELECT * FROM appointments WHERE id = ? AND tenant_id = ?',
    [Number(req.params.id), req.tenantId]);
  if (!existing) return res.status(404).json({ error: 'Cita no encontrada' });

  const { title, description, date, time, duration_minutes, status, notes } = req.body;
  await dbRun(
    `UPDATE appointments SET title=?, description=?, date=?, time=?, duration_minutes=?, status=?, notes=? WHERE id=? AND tenant_id=?`,
    [title ?? existing.title, description ?? existing.description,
     date ?? existing.date, time ?? existing.time,
     duration_minutes ?? existing.duration_minutes, status ?? existing.status,
     notes ?? existing.notes, Number(req.params.id), req.tenantId]
  );

  const appointment = await dbGet('SELECT * FROM appointments WHERE id = ?', [Number(req.params.id)]);

  const io = req.app.get('io');
  if (io) {
    io.to(`tenant:${req.tenantId}`).emit('appointment:updated', appointment);
  }

  res.json({ appointment });
});

// DELETE /api/appointments/:id - Cancel/delete appointment
router.delete('/:id', authMiddleware, adminOnly, requireTenant, async (req, res) => {
  await dbRun('DELETE FROM appointments WHERE id = ? AND tenant_id = ?',
    [Number(req.params.id), req.tenantId]);
  res.json({ success: true });
});

// GET /api/appointments/:id/ics - Generate .ics calendar file
router.get('/:id/ics', authMiddleware, requireTenant, async (req, res) => {
  const appt = await dbGet('SELECT * FROM appointments WHERE id = ? AND tenant_id = ?',
    [Number(req.params.id), req.tenantId]);
  if (!appt) return res.status(404).json({ error: 'Cita no encontrada' });

  const business = await dbGet('SELECT name, address FROM business_info WHERE tenant_id = ?', [req.tenantId]);
  const icsContent = generateICS(appt, business);

  res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="cita-${appt.id}.ics"`);
  res.send(icsContent);
});

// POST /api/appointments/:id/send-ics - Send .ics to client via WhatsApp
router.post('/:id/send-ics', authMiddleware, requireTenant, async (req, res) => {
  const appt = await dbGet('SELECT * FROM appointments WHERE id = ? AND tenant_id = ?',
    [Number(req.params.id), req.tenantId]);
  if (!appt) return res.status(404).json({ error: 'Cita no encontrada' });

  const business = await dbGet('SELECT name, address FROM business_info WHERE tenant_id = ?', [req.tenantId]);
  const settings = await dbGet('SELECT bot_name FROM settings WHERE tenant_id = ?', [req.tenantId]);

  // Send a formatted message with appointment details
  const { whatsappManager } = require('../services/whatsapp');
  const dateFormatted = formatDateSpanish(appt.date);
  const message = `${settings?.bot_name || 'SellMate'}: Tu cita ha sido agendada.\n\n` +
    `*${appt.title}*\n` +
    `Fecha: ${dateFormatted}\n` +
    `Hora: ${appt.time}\n` +
    `Duracion: ${appt.duration_minutes} minutos\n` +
    (business?.address ? `Lugar: ${business.address}\n` : '') +
    (appt.description ? `\n${appt.description}\n` : '') +
    `\nGuarda esta fecha en tu calendario.`;

  try {
    await whatsappManager.sendMessage(req.tenantId, appt.phone_number, message);
    res.json({ success: true, message: 'Mensaje enviado al cliente' });
  } catch (err) {
    res.status(500).json({ error: 'Error enviando mensaje: ' + err.message });
  }
});

/**
 * Generate ICS calendar file content
 */
function generateICS(appt, business) {
  const uid = `sellmate-appt-${appt.id}@sellmate`;
  const now = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

  // Parse date/time
  const [year, month, day] = appt.date.split('-');
  const [hour, minute] = appt.time.split(':');
  const dtStart = `${year}${month}${day}T${hour}${minute || '00'}00`;

  // Calculate end time
  const startDate = new Date(`${appt.date}T${appt.time}:00`);
  const endDate = new Date(startDate.getTime() + (appt.duration_minutes || 60) * 60000);
  const dtEnd = endDate.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '').slice(0, 15);

  const location = business?.address || '';
  const organizer = business?.name || 'SellMate';

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//SellMate//ES',
    'CALSCALE:GREGORIAN',
    'METHOD:REQUEST',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${now}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${escapeICS(appt.title)}`,
    appt.description ? `DESCRIPTION:${escapeICS(appt.description)}` : '',
    location ? `LOCATION:${escapeICS(location)}` : '',
    `ORGANIZER;CN=${escapeICS(organizer)}:MAILTO:noreply@sellmate.app`,
    'STATUS:CONFIRMED',
    'BEGIN:VALARM',
    'TRIGGER:-PT30M',
    'ACTION:DISPLAY',
    'DESCRIPTION:Recordatorio de cita',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR'
  ].filter(Boolean).join('\r\n');
}

function escapeICS(text) {
  return (text || '').replace(/[,;\\]/g, '\\$&').replace(/\n/g, '\\n');
}

function formatDateSpanish(dateStr) {
  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  const d = new Date(dateStr + 'T12:00:00');
  return `${days[d.getDay()]} ${d.getDate()} de ${months[d.getMonth()]} de ${d.getFullYear()}`;
}

module.exports = router;
