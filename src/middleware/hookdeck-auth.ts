import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

/**
 * Hookdeck signature verification middleware
 * 
 * Hookdeck signs all webhook deliveries with HMAC-SHA256.
 * This middleware verifies the signature to ensure webhooks originate from Hookdeck.
 * 
 * Environment variables required:
 * - HOOKDECK_WEBHOOK_SECRET
 * 
 * Note: This middleware requires the raw request body to be available on req.rawBody.
 * Make sure to configure express.json() with the verify option to store the raw body.
 */
export function verifyHookdeckSignature(req: Request, res: Response, next: NextFunction): void {
  const webhookSecret = process.env.HOOKDECK_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error('❌ HOOKDECK_WEBHOOK_SECRET not set');
    res.status(500).json({ error: 'Server configuration error' });
    return;
  }

  // Extract signature headers
  const hmacHeader = req.get('x-hookdeck-signature');
  const hmacHeader2 = req.get('x-hookdeck-signature-2');

  if (!hmacHeader) {
    console.warn('❌ Missing x-hookdeck-signature header');
    res.status(401).json({ error: 'Unauthorized', message: 'Missing signature' });
    return;
  }

  // Verify rawBody is available
  if (!req.rawBody) {
    console.error('❌ rawBody not available on request. Ensure express.json() is configured with verify option.');
    res.status(500).json({ error: 'Server configuration error' });
    return;
  }

  // Create hash based on the raw body
  const hash = crypto
    .createHmac('sha256', webhookSecret)
    .update(req.rawBody)
    .digest('base64');

  // Compare with both signature headers (Hookdeck provides two for signature rotation)
  if (hash === hmacHeader || (hmacHeader2 && hash === hmacHeader2)) {
    console.log('✅ Hookdeck signature verified');
    next();
  } else {
    console.warn('❌ Invalid Hookdeck signature');
    res.status(403).json({ error: 'Forbidden', message: 'Invalid signature' });
  }
}