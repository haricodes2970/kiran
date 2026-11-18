import * as crypto from 'crypto';
import { PaymentsService } from './payments.service';

describe('PaymentsService Architecture Boundary & Signature Verification', () => {
  it('defaults to ORDER_REQUEST_ONLY when ONLINE_PAYMENT_ENABLED is not true', () => {
    delete process.env.ONLINE_PAYMENT_ENABLED;
    const service = new PaymentsService();
    const status = service.getReadinessStatus();
    expect(status.onlinePaymentEnabled).toBe(false);
    expect(status.checkoutMode).toBe('ORDER_REQUEST_ONLY');
    expect(status.recommendedProvider).toBe('razorpay');
  });

  it('verifies Razorpay checkout HMAC-SHA256 payment signature strictly', () => {
    const secret = 'rzp_test_secret_12345';
    const orderId = 'order_Kiran123';
    const paymentId = 'pay_Kiran456';
    const sig = crypto
      .createHmac('sha256', secret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    const service = new PaymentsService();
    expect(
      service.verifyRazorpayCheckoutSignature({
        razorpayOrderId: orderId,
        razorpayPaymentId: paymentId,
        razorpaySignature: sig,
        keySecret: secret,
      }),
    ).toBe(true);

    expect(
      service.verifyRazorpayCheckoutSignature({
        razorpayOrderId: orderId,
        razorpayPaymentId: paymentId,
        razorpaySignature: '00'.repeat(32),
        keySecret: secret,
      }),
    ).toBe(false);
  });

  it('verifies Razorpay webhook HMAC-SHA256 signature strictly', () => {
    const webhookSecret = 'rzp_webhook_secret_xyz';
    const payload = JSON.stringify({ event: 'payment.captured' });
    const sig = crypto
      .createHmac('sha256', webhookSecret)
      .update(payload)
      .digest('hex');

    const service = new PaymentsService();
    expect(
      service.verifyRazorpayWebhookSignature(payload, sig, webhookSecret),
    ).toBe(true);
    expect(
      service.verifyRazorpayWebhookSignature(payload, undefined, webhookSecret),
    ).toBe(false);
  });
});
