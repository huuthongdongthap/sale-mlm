const crypto = require('crypto');

const webhookSubscriptions = [];

function subscribeWebhook(url, events = ['*']) {
  const sub = { id: crypto.randomUUID(), url, events, createdAt: new Date().toISOString() };
  webhookSubscriptions.push(sub);
  return sub;
}

function unsubscribeWebhook(id) {
  const idx = webhookSubscriptions.findIndex(s => s.id === id);
  if (idx === -1) return false;
  webhookSubscriptions.splice(idx, 1);
  return true;
}

async function triggerWebhooks(psnId, alerts, metrics) {
  const payload = { psnId, alerts, metrics, timestamp: new Date().toISOString() };
  for (const sub of webhookSubscriptions) {
    if (sub.events.includes('*') || sub.events.some(e => alerts.some(a => a.action === e))) {
      try {
        await fetch(sub.url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        console.log(`[webhook] Delivered to ${sub.url}`);
      } catch (err) {
        console.error(`[webhook] Failed to deliver to ${sub.url}:`, err.message);
      }
    }
  }
}

function getSubscriptions() {
  return webhookSubscriptions;
}

module.exports = {
  webhookSubscriptions,
  subscribeWebhook,
  unsubscribeWebhook,
  triggerWebhooks,
  getSubscriptions,
};
