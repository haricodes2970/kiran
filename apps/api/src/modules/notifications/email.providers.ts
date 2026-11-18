import { Logger } from '@nestjs/common';
import { EmailMessage, EmailProvider, EmailSendResult } from './email.types';

export class SandboxEmailAdapter implements EmailProvider {
  readonly name = 'sandbox';
  private readonly logger = new Logger(SandboxEmailAdapter.name);
  public readonly sentLog: EmailMessage[] = [];

  async send(message: EmailMessage): Promise<EmailSendResult> {
    this.sentLog.push(message);
    this.logger.log(
      `[SANDBOX EMAIL] To=${message.to} Subject="${message.subject}"`,
    );
    return {
      success: true,
      provider: this.name,
      messageId: `sandbox-${Date.now()}`,
      sandboxed: true,
    };
  }
}

export class ResendEmailAdapter implements EmailProvider {
  readonly name = 'resend';

  constructor(
    private readonly apiKey: string,
    private readonly fromEmail: string,
  ) {}

  async send(message: EmailMessage): Promise<EmailSendResult> {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        ...(message.idempotencyKey
          ? { 'Idempotency-Key': message.idempotencyKey }
          : {}),
      },
      body: JSON.stringify({
        from: this.fromEmail,
        to: [message.to],
        subject: message.subject,
        html: message.html,
        text: message.text,
      }),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      throw new Error(`Resend HTTP ${res.status}: ${errText.slice(0, 200)}`);
    }

    const body = (await res.json()) as { id?: string };
    return {
      success: true,
      provider: this.name,
      messageId: body.id,
      sandboxed: false,
    };
  }
}
