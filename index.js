import express from 'express';
import bodyParser from 'body-parser';
import Stripe from 'stripe';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const PORT = process.env.PORT || 3000;
const HOSTINGER_API_URL = process.env.HOSTINGER_API_URL;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

// Custom logger
const logger = {
  info: (msg) => console.log(`[${new Date().toISOString()}] ℹ️  INFO: ${msg}`),
  success: (msg) => console.log(`[${new Date().toISOString()}] ✅ SUCCESS: ${msg}`),
  error: (msg) => console.log(`[${new Date().toISOString()}] ❌ ERROR: ${msg}`),
  warn: (msg) => console.log(`[${new Date().toISOString()}] ⚠️  WARN: ${msg}`)
};

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Webhook receiver is running' });
});

// Stripe webhook endpoint - MUST be before express.json()
app.post('/webhooks/stripe', bodyParser.raw({ type: 'application/json' }), async (req, res) => {
  logger.info('Stripe webhook received');
  
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, STRIPE_WEBHOOK_SECRET);
    logger.success('Stripe signature verified');
  } catch (err) {
    logger.error(`Webhook signature verification failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    logger.info(`Processing Stripe event: ${event.type}`);
    
    // Forward to Hostinger
    logger.info('Forwarding event to Hostinger');
    
    const payload = {
      event_type: event.type,
      event_data: event.data,
      timestamp: new Date().toISOString(),
      event_id: event.id,
      stripe_event_created: event.created
    };

    const response = await axios.post(
      `${HOSTINGER_API_URL}/api/webhooks/forward`,
      payload,
      { timeout: 10000 }
    );

    logger.success(`Event forwarded to Hostinger (Status: ${response.status})`);
    res.json({ received: true, event_id: event.id });
  } catch (err) {
    logger.error(`Failed to forward event: ${err.message}`);
    // Return 200 to Stripe so it doesn't retry
    res.json({ received: true, error: err.message });
  }
});

// Start server
app.listen(PORT, () => {
  logger.success(`Server running on port ${PORT}`);
  logger.info(`Webhook endpoint: POST http://localhost:${PORT}/webhooks/stripe`);
  logger.info(`Health check: GET http://localhost:${PORT}/health`);
});
