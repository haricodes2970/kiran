import { Logger } from '@nestjs/common';
import {
  WhatsAppProvider,
  WhatsAppSendResult,
  WhatsAppTemplatePayload,
} from './whatsapp.types';

export class SandboxWhatsAppAdapter implements WhatsAppProvider {
  readonly name = 'sandbox';
  private readonly logger = new Logger(SandboxWhatsAppAdapter.name);
  public readonly sentLog: WhatsAppTemplatePayload[] = [];

  async sendTemplate(
    payload: WhatsAppTemplatePayload,
  ): Promise<WhatsAppSendResult> {
    this.sentLog.push(payload);
    // Mask phone suffix in logs to avoid unnecessary PII exposure
    const maskedPhone =
      payload.toPhone.length > 4
        ? `***${payload.toPhone.slice(-4)}`
        : '***';
    this.logger.log(
      `[SANDBOX WHATSAPP] To=${maskedPhone} Template=${payload.templateName}`,
    );
    return {
      success: true,
      provider: this.name,
      messageId: `wamid.sandbox.${Date.now()}`,
      sandboxed: true,
    };
  }
}

export class MetaCloudWhatsAppAdapter implements WhatsAppProvider {
  readonly name = 'meta-cloud';

  constructor(
    private readonly phoneNumberId: string,
    private readonly accessToken: string,
  ) {}

  async sendTemplate(
    payload: WhatsAppTemplatePayload,
  ): Promise<WhatsAppSendResult> {
    const cleanPhone = payload.toPhone.replace(/[^0-9]/g, '');
    const url = `https://graph.facebook.com/v20.0/${this.phoneNumberId}/messages`;

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: cleanPhone,
        type: 'template',
        template: {
          name: payload.templateName,
          language: { code: payload.languageCode || 'en' },
          components: payload.parameters.length
            ? [
                {
                  type: 'body',
                  parameters: payload.parameters.map((text) => ({
                    type: 'text',
                    text,
                  })),
                },
              ]
            : undefined,
        },
      }),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      throw new Error(`Meta WhatsApp HTTP ${res.status}: ${errText.slice(0, 200)}`);
    }

    const body = (await res.json()) as {
      messages?: Array<{ id?: string }>;
    };

    return {
      success: true,
      provider: this.name,
      messageId: body.messages?.[0]?.id,
      sandboxed: false,
    };
  }
}
