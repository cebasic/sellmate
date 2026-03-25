const { dbRun, dbGet, dbAll } = require('../config/database');

/**
 * Process follow-up rules for a specific tenant.
 * Checks each active rule and sends messages to eligible conversations.
 */
async function processFollowUps(tenantId) {
  const { whatsappManager } = require('./whatsapp');
  const rules = await dbAll('SELECT * FROM follow_up_rules WHERE tenant_id = ? AND active = 1', [tenantId]);
  const settings = await dbGet('SELECT bot_name FROM settings WHERE tenant_id = ?', [tenantId]);
  const botName = settings?.bot_name || 'SellMate';

  let sentCount = 0;
  let skippedCount = 0;

  for (const rule of rules) {
    const eligible = await getEligibleConversations(tenantId, rule);

    for (const conv of eligible) {
      // Check if we already sent this rule to this conversation recently (avoid duplicates)
      const alreadySent = await dbGet(
        `SELECT id FROM follow_up_log WHERE tenant_id = ? AND rule_id = ? AND conversation_id = ?
         AND DATE(sent_at) > DATE_SUB(CURDATE(), INTERVAL ? DAY)`,
        [tenantId, rule.id, conv.id, Math.max(rule.delay_days - 1, 1)]
      );

      if (alreadySent) {
        skippedCount++;
        continue;
      }

      // Build personalized message
      const message = personalizeMessage(rule.message_template, conv, botName);

      try {
        await whatsappManager.sendMessage(tenantId, conv.phone_number, message);

        // Log the follow-up
        await dbRun(
          `INSERT INTO follow_up_log (tenant_id, rule_id, conversation_id, phone_number, message_sent) VALUES (?, ?, ?, ?, ?)`,
          [tenantId, rule.id, conv.id, conv.phone_number, message]
        );

        sentCount++;
      } catch (err) {
        console.error(`Follow-up send error (tenant ${tenantId}, conv ${conv.id}):`, err.message);
      }
    }
  }

  return { sentCount, skippedCount, rulesProcessed: rules.length };
}

/**
 * Get conversations eligible for a follow-up rule.
 */
async function getEligibleConversations(tenantId, rule) {
  let query = '';
  const params = [tenantId];

  switch (rule.trigger_type) {
    case 'days_after_last_contact':
      // Conversations where last message was N days ago
      query = `SELECT c.* FROM conversations c
        WHERE c.tenant_id = ? AND c.status != 'closed'
        AND DATE(c.last_message_at) <= DATE_SUB(CURDATE(), INTERVAL ? DAY)
        AND DATE(c.last_message_at) > DATE_SUB(CURDATE(), INTERVAL ? DAY)`;
      params.push(rule.delay_days, rule.delay_days + 7); // Window of 7 days
      break;

    case 'days_after_appointment':
      // Conversations with completed appointments N days ago
      query = `SELECT DISTINCT c.* FROM conversations c
        INNER JOIN appointments a ON a.conversation_id = c.id
        WHERE c.tenant_id = ? AND a.status = 'completed'
        AND DATE(a.date) <= DATE_SUB(CURDATE(), INTERVAL ? DAY)
        AND DATE(a.date) > DATE_SUB(CURDATE(), INTERVAL ? DAY)`;
      params.push(rule.delay_days, rule.delay_days + 7);
      break;

    case 'days_after_purchase':
      // Conversations with topic 'compra' N days ago
      query = `SELECT c.* FROM conversations c
        WHERE c.tenant_id = ? AND c.topic = 'compra'
        AND DATE(c.last_message_at) <= DATE_SUB(CURDATE(), INTERVAL ? DAY)
        AND DATE(c.last_message_at) > DATE_SUB(CURDATE(), INTERVAL ? DAY)`;
      params.push(rule.delay_days, rule.delay_days + 7);
      break;

    case 'recurring':
      // All conversations that haven't been contacted in N days
      query = `SELECT c.* FROM conversations c
        WHERE c.tenant_id = ?
        AND DATE(c.last_message_at) <= DATE_SUB(CURDATE(), INTERVAL ? DAY)`;
      params.push(rule.delay_days);
      break;

    default:
      return [];
  }

  // Filter by target audience
  if (rule.target_audience === 'with_appointments') {
    query = query.replace('WHERE c.tenant_id', `WHERE EXISTS (SELECT 1 FROM appointments a2 WHERE a2.conversation_id = c.id) AND c.tenant_id`);
  } else if (rule.target_audience === 'without_appointments') {
    query = query.replace('WHERE c.tenant_id', `WHERE NOT EXISTS (SELECT 1 FROM appointments a2 WHERE a2.conversation_id = c.id) AND c.tenant_id`);
  }

  return await dbAll(query, params);
}

/**
 * Replace template placeholders with actual values.
 */
function personalizeMessage(template, conversation, botName) {
  return template
    .replace(/\{nombre\}/gi, conversation.contact_name || 'estimado cliente')
    .replace(/\{telefono\}/gi, conversation.phone_number || '')
    .replace(/\{bot_name\}/gi, botName)
    .replace(/\{negocio\}/gi, botName);
}

/**
 * Process all tenants' follow-ups (called by cron).
 */
async function processAllFollowUps() {
  const tenants = await dbAll('SELECT id FROM tenants WHERE active = 1');
  let totalSent = 0;

  for (const tenant of tenants) {
    try {
      const result = await processFollowUps(tenant.id);
      totalSent += result.sentCount;
      if (result.sentCount > 0) {
        console.log(`Follow-ups: Tenant ${tenant.id} - sent ${result.sentCount} messages`);
      }
    } catch (err) {
      console.error(`Follow-ups: Error processing tenant ${tenant.id}:`, err.message);
    }
  }

  return totalSent;
}

module.exports = { processFollowUps, processAllFollowUps };
