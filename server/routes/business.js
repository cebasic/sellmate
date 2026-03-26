const express = require('express');
const { dbRun, dbGet } = require('../config/database');
const { generateResponse, parseStructuredResponse } = require('../services/ai');
const { authMiddleware, adminOnly, requireTenant } = require('../middleware/auth');

const router = express.Router();

router.get('/', authMiddleware, requireTenant, async (req, res) => {
  const info = await dbGet('SELECT * FROM business_info WHERE tenant_id = ?', [req.tenantId]);
  res.json({ business: info });
});

router.put('/', authMiddleware, adminOnly, requireTenant, async (req, res) => {
  const { name, description, address, phone, hours, policies, extra_info } = req.body;
  const displayName = name || '';
  await dbRun(
    `UPDATE business_info SET name=?, description=?, address=?, phone=?, hours=?, policies=?, extra_info=?, updated_at=NOW() WHERE tenant_id=?`,
    [displayName, description || '', address || '', phone || '', hours || '', policies || '', extra_info || '', req.tenantId]
  );
  // Mantener tenants.name alineado (login y UI usan tenantName como respaldo)
  await dbRun('UPDATE tenants SET name = ? WHERE id = ?', [displayName || 'Mi Negocio', req.tenantId]);
  const info = await dbGet('SELECT * FROM business_info WHERE tenant_id = ?', [req.tenantId]);
  res.json({ business: info });
});

// Generate business description with AI
router.post('/generate-description', authMiddleware, adminOnly, requireTenant, async (req, res) => {
  try {
    const { businessName, businessType } = req.body;
    if (!businessName) return res.status(400).json({ error: 'Nombre del negocio requerido' });

    const settings = await dbGet('SELECT * FROM settings WHERE tenant_id = ?', [req.tenantId]);
    if (!settings || !settings.ai_api_key) {
      return res.status(400).json({ error: 'Configura tu proveedor de IA primero' });
    }

    const systemPrompt = `Eres un experto en marketing para pequeños negocios. Genera una descripcion breve y profesional para un negocio. La descripcion debe ser en español, en 2-3 oraciones, destacando lo que ofrece el negocio y su propuesta de valor. No uses comillas ni formato especial. Solo devuelve la descripcion, nada más.`;

    const messages = [
      { role: 'user', content: `Genera una descripcion para mi negocio:\nNombre: ${businessName}\nTipo: ${businessType}` }
    ];

    const aiResult = await generateResponse(req.tenantId, systemPrompt, messages, settings);
    const rawText = aiResult?.response || aiResult || '';
    const description = String(rawText).replace(/^["']|["']$/g, '').trim();

    res.json({ description });
  } catch (e) {
    console.error('Error generating description:', e.message);
    res.status(500).json({ error: 'Error al generar descripcion' });
  }
});

// Generate any business field with AI
router.post('/generate-field', authMiddleware, adminOnly, requireTenant, async (req, res) => {
  try {
    const { field, businessName, businessType, description } = req.body;
    if (!businessName) return res.status(400).json({ error: 'Nombre del negocio requerido' });

    const settings = await dbGet('SELECT * FROM settings WHERE tenant_id = ?', [req.tenantId]);
    if (!settings || !settings.ai_api_key) {
      return res.status(400).json({ error: 'Configura tu proveedor de IA primero' });
    }

    const prompts = {
      policies: `Eres un experto en politicas comerciales para pequeños negocios. Genera politicas claras y profesionales para un negocio, cubriendo envios, devoluciones y pagos. Deben ser en español, concisas (4-6 puntos), practicas y amigables con el cliente. No uses comillas ni formato markdown. Solo devuelve las politicas, nada más.`,
      extra_info: `Eres un experto en comunicacion comercial. Genera informacion adicional relevante para un negocio que ayude a los clientes a conocer mejor el negocio. Incluye aspectos como garantias, servicio al cliente, valores del negocio, o cualquier informacion util. En español, 2-4 oraciones. No uses comillas ni formato markdown. Solo devuelve la informacion, nada más.`
    };

    const systemPrompt = prompts[field];
    if (!systemPrompt) return res.status(400).json({ error: 'Campo no soportado' });

    const context = `Negocio: ${businessName}${businessType ? `\nTipo: ${businessType}` : ''}${description ? `\nDescripcion: ${description}` : ''}`;
    const messages = [
      { role: 'user', content: `Genera ${field === 'policies' ? 'las politicas' : 'informacion adicional'} para mi negocio:\n${context}` }
    ];

    const aiResult = await generateResponse(req.tenantId, systemPrompt, messages, settings);
    const rawText = aiResult?.response || aiResult || '';
    const result = String(rawText).replace(/^["']|["']$/g, '').trim();

    res.json({ result });
  } catch (e) {
    console.error('Error generating field:', e.message);
    res.status(500).json({ error: 'Error al generar contenido' });
  }
});

module.exports = router;
