import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import { handleCustomerWebhook } from './handlers/customer';
import { handleSubscriptionWebhook } from './handlers/subscription';
import { handlePaymentsWebhook } from './handlers/payments';
import { verifyHookdeckSignature } from './middleware/hookdeck-auth';
import { verifyChargebeeAuth } from './middleware/chargebee-auth';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware to parse JSON bodies and store raw body for signature verification
app.use(
  express.json({
    verify: (req, res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Apply authentication globally to all /webhooks/* routes
app.use('/webhooks', verifyHookdeckSignature, verifyChargebeeAuth);

app.post('/webhooks/chargebee/customer', handleCustomerWebhook);
app.post('/webhooks/chargebee/subscription', handleSubscriptionWebhook);
app.post('/webhooks/chargebee/payments', handlePaymentsWebhook);

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📡 Webhook endpoint: http://localhost:${PORT}/webhooks/chargebee`);
  console.log(`💚 Health check: http://localhost:${PORT}/health`);
});