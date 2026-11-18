import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class PaymentsService {
  isOnlinePaymentEnabled(): boolean {
    return process.env.ONLINE_PAYMENT_ENABLED === 'true';
  }

  getReadinessStatus() {
    return {
      onlinePaymentEnabled: this.isOnlinePaymentEnabled(),
      recommendedProvider: 'razorpay',
      checkoutMode: this.isOnlinePaymentEnabled()
        ? 'ONLINE_GATEWAY_ACTIVE'
        : 'ORDER_REQUEST_ONLY',
      currency: 'INR',
      requiresClientApproval: true,
    };
  }

  verifyRazorpayCheckoutSignature(params: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
    keySecret?: string;
  }): boolean {
    const secret = params.keySecret || process.env.RAZORPAY_KEY_SECRET;
    if (!secret || !params.razorpaySignature) {
      return false;
    }
    const expected = crypto
      .createHmac('sha256', secret)
      .update(`${params.razorpayOrderId}|${params.razorpayPaymentId}`)
      .digest('hex');

    const providedBuf = Buffer.from(params.razorpaySignature, 'hex');
    const expectedBuf = Buffer.from(expected, 'hex');
    if (providedBuf.length !== expectedBuf.length) {
      return false;
    }
    return crypto.timingSafeEqual(providedBuf, expectedBuf);
  }

  verifyRazorpayWebhookSignature(
    rawBody: Buffer | string,
    signatureHeader: string | undefined,
    webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET,
  ): boolean {
    if (!webhookSecret || !signatureHeader) {
      return false;
    }
    const expected = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBody)
      .digest('hex');

    const providedBuf = Buffer.from(signatureHeader, 'hex');
    const expectedBuf = Buffer.from(expected, 'hex');
    if (providedBuf.length !== expectedBuf.length) {
      return false;
    }
    return crypto.timingSafeEqual(providedBuf, expectedBuf);
  }
}
