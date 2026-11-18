import { EmailService } from './email.service';
import { SandboxEmailAdapter } from './email.providers';
import { EmailEventType, EmailProvider } from './email.types';

describe('EmailService & Templates Unit Tests', () => {
  it('renders HTML + plain-text templates and prevents XSS injection', async () => {
    const sandbox = new SandboxEmailAdapter();
    const service = new EmailService(undefined, sandbox);

    const res = await service.sendEventEmail({
      event: EmailEventType.REPAIR_BOOKING_CONFIRMATION,
      to: 'customer@example.com',
      idempotencyKey: 'rep-1',
      data: {
        customerName: '<script>alert(1)</script>',
        reference: 'REP-20261117-0001',
        device: 'Dell Latitude 5420',
      },
    });

    expect(res.success).toBe(true);
    expect(res.sandboxed).toBe(true);
    expect(sandbox.sentLog).toHaveLength(1);
    expect(sandbox.sentLog[0].html).not.toContain('<script>');
    expect(sandbox.sentLog[0].html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
    expect(sandbox.sentLog[0].text).toContain('REP-20261117-0001');
  });

  it('deduplicates repeated events with identical idempotencyKey', async () => {
    const sandbox = new SandboxEmailAdapter();
    const service = new EmailService(undefined, sandbox);

    await service.sendEventEmail({
      event: EmailEventType.ORDER_REQUEST_CONFIRMATION,
      to: 'buyer@example.com',
      idempotencyKey: 'ord-100',
      data: { customerName: 'Rahul', reference: 'ORD-100', totalAmount: '45000' },
    });

    const dup = await service.sendEventEmail({
      event: EmailEventType.ORDER_REQUEST_CONFIRMATION,
      to: 'buyer@example.com',
      idempotencyKey: 'ord-100',
      data: { customerName: 'Rahul', reference: 'ORD-100', totalAmount: '45000' },
    });

    expect(dup.messageId).toBe('deduplicated-skipped');
    expect(sandbox.sentLog).toHaveLength(1);
  });

  it('retries transient provider errors and handles permanent failures gracefully without throwing', async () => {
    let calls = 0;
    const failingProvider: EmailProvider = {
      name: 'mock-failing',
      async send() {
        calls += 1;
        throw new Error('SMTP 503 service unavailable');
      },
    };

    const service = new EmailService(undefined, failingProvider);
    const res = await service.sendEventEmail({
      event: EmailEventType.QUOTATION_NOTIFICATION,
      to: 'user@example.com',
      maxRetries: 2,
      data: {
        customerName: 'Priya',
        reference: 'REP-2',
        quotationNumber: 'QUO-2',
        totalAmount: '2500',
      },
    });

    expect(calls).toBe(2);
    expect(res.success).toBe(false);
    expect(res.error).toBe('Email delivery deferred due to provider error');
  });

  it('deduplicates across separate EmailService instances via persistent AuditLog storage', async () => {
    const storedLogs: Array<{ entityId: string; action: string; entityType: string }> = [];
    const mockPrisma: any = {
      auditLog: {
        findFirst: async ({ where }: any) =>
          storedLogs.find(
            (l) =>
              l.action === where.action &&
              l.entityType === where.entityType &&
              l.entityId === where.entityId,
          ) ?? null,
        create: async ({ data }: any) => {
          storedLogs.push(data);
          return data;
        },
      },
    };

    const sandbox1 = new SandboxEmailAdapter();
    const service1 = new EmailService(mockPrisma, sandbox1);
    const first = await service1.sendEventEmail({
      event: EmailEventType.ORDER_REQUEST_CONFIRMATION,
      to: 'buyer@example.com',
      idempotencyKey: 'ord-persist-1',
      data: { customerName: 'Rahul', reference: 'ORD-P1', totalAmount: '10000' },
    });
    expect(first.success).toBe(true);
    expect(sandbox1.sentLog).toHaveLength(1);

    // Simulate process restart / second horizontal instance with empty in-memory Set
    const sandbox2 = new SandboxEmailAdapter();
    const service2 = new EmailService(mockPrisma, sandbox2);
    const second = await service2.sendEventEmail({
      event: EmailEventType.ORDER_REQUEST_CONFIRMATION,
      to: 'buyer@example.com',
      idempotencyKey: 'ord-persist-1',
      data: { customerName: 'Rahul', reference: 'ORD-P1', totalAmount: '10000' },
    });
    expect(second.messageId).toBe('deduplicated-skipped');
    expect(sandbox2.sentLog).toHaveLength(0);
  });
});
