import * as crypto from 'crypto';
import { UnauthorizedException } from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';
import { SandboxWhatsAppAdapter } from './whatsapp.providers';
import { WhatsAppEventType } from './whatsapp.types';

describe('WhatsappService & Webhook Security Unit Tests', () => {
  it('sends approved template payload in sandbox mode and respects customer opt-out consent', async () => {
    const sandbox = new SandboxWhatsAppAdapter();
    const service = new WhatsappService(sandbox);

    const skipped = await service.sendEventTemplate({
      event: WhatsAppEventType.REPAIR_STATUS_CHANGE,
      toPhone: '+919820100101',
      parameters: ['REP-123', 'IN_REPAIR'],
      customerOptedIn: false,
    });
    expect(skipped.success).toBe(false);
    expect(skipped.skippedReason).toBe('CUSTOMER_OPTED_OUT');
    expect(sandbox.sentLog).toHaveLength(0);

    const sent = await service.sendEventTemplate({
      event: WhatsAppEventType.REPAIR_STATUS_CHANGE,
      toPhone: '+919820100101',
      parameters: ['REP-123', 'IN_REPAIR'],
      customerOptedIn: true,
    });
    expect(sent.success).toBe(true);
    expect(sent.sandboxed).toBe(true);
    expect(sandbox.sentLog[0].templateName).toBe('kiran_repair_status_update');
  });

  it('verifies Meta webhook challenge token and rejects invalid tokens', () => {
    process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN = 'kiran-verify-2026';
    const service = new WhatsappService();

    expect(
      service.verifyWebhookChallenge('subscribe', 'kiran-verify-2026', '12345'),
    ).toBe('12345');

    expect(() =>
      service.verifyWebhookChallenge('subscribe', 'wrong-token', '12345'),
    ).toThrow(UnauthorizedException);
  });

  it('validates X-Hub-Signature-256 HMAC-SHA256 webhook signatures strictly', () => {
    const secret = 'test-whatsapp-app-secret';
    const rawBody = JSON.stringify({
      entry: [{ changes: [{ value: { statuses: [{ id: 'wamid.1', status: 'delivered' }] } }] }],
    });
    const validSig =
      'sha256=' +
      crypto.createHmac('sha256', secret).update(rawBody).digest('hex');

    const service = new WhatsappService();

    expect(service.verifyWebhookSignature(rawBody, validSig, secret)).toBe(true);
    expect(
      service.verifyWebhookSignature(rawBody, 'sha256=deadbeef', secret),
    ).toBe(false);
    expect(service.verifyWebhookSignature(rawBody, undefined, secret)).toBe(
      false,
    );

    const parsed = service.handleWebhookPayload(JSON.parse(rawBody));
    expect(parsed.processedStatuses).toBe(1);
  });
});
