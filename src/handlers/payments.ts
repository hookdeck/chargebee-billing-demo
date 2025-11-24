import { Request, Response } from 'express';

/**
 * Payments webhook handler
 * Handles: payment_succeeded
 * 
 * This handler is responsible for:
 * - Renewal confirmation
 * - Revenue/metrics updates
 * - Clearing "pending renewal" flags
 */
export function handlePaymentsWebhook(req: Request, res: Response): void {
  try {
    const { id, event_type, content } = req.body;

    console.log('='.repeat(50));
    console.log('💳 Payment Event Received');
    console.log('Event ID:', id);
    console.log('Event Type:', event_type);
    console.log('Timestamp:', new Date().toISOString());
    console.log('='.repeat(50));

    const transaction = content?.transaction;

    if (!transaction) {
      console.warn('No transaction data in payload');
      res.status(200).json({ received: true, warning: 'No transaction data' });
      return;
    }

    // Handle payment events
    if (event_type === 'payment_succeeded') {
      console.log(`✅ Payment succeeded: ${transaction.id}`);
      console.log(`   Customer ID: ${transaction.customer_id}`);
      console.log(`   Amount: ${transaction.amount / 100} ${transaction.currency_code}`);
      console.log(`   Subscription ID: ${transaction.subscription_id}`);
      // TODO: Update revenue metrics
      // TODO: Clear any "pending renewal" flags
      // TODO: Send payment confirmation email
    } else {
      console.log(`ℹ️  Unhandled payment event: ${event_type}`);
    }

    res.status(200).json({ 
      received: true, 
      event_id: id,
      event_type,
      transaction_id: transaction.id
    });
  } catch (error) {
    console.error('❌ Error processing payment webhook:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}