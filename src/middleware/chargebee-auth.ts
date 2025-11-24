import { Request, Response, NextFunction } from 'express';

/**
 * Basic Auth middleware for Chargebee webhooks
 * 
 * Chargebee sends webhooks with Basic Authentication credentials.
 * This middleware verifies the credentials against environment variables.
 * 
 * Environment variables required:
 * - CHARGEBEE_WEBHOOK_USERNAME
 * - CHARGEBEE_WEBHOOK_PASSWORD
 */
export function verifyChargebeeAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.get('authorization');

  if (!authHeader || !authHeader.startsWith('Basic ')) {
    console.warn('❌ Missing or invalid Authorization header');
    res.status(401).json({ error: 'Unauthorized', message: 'Missing credentials' });
    return;
  }

  const base64Credentials = authHeader.split(' ')[1];
  const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
  const [username, password] = credentials.split(':');

  const expectedUsername = process.env.CHARGEBEE_WEBHOOK_USERNAME;
  const expectedPassword = process.env.CHARGEBEE_WEBHOOK_PASSWORD;

  if (!expectedUsername || !expectedPassword) {
    console.error('❌ CHARGEBEE_WEBHOOK_USERNAME or CHARGEBEE_WEBHOOK_PASSWORD not set');
    res.status(500).json({ error: 'Server configuration error' });
    return;
  }

  if (username === expectedUsername && password === expectedPassword) {
    console.log('✅ Chargebee Basic Auth verified');
    next();
  } else {
    console.warn('❌ Invalid Chargebee credentials');
    res.status(401).json({ error: 'Unauthorized', message: 'Invalid credentials' });
  }
}