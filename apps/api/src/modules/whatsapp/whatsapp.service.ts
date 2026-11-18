import {
  Injectable,
  Logger,
  Optional,
  UnauthorizedException,
} from '@nestjs/common';
import * as crypto from 'crypto';
import {
  WhatsAppEventType,
  WhatsAppProvider,
  WhatsAppSendResult,
} from './whatsapp.types';
import {
  MetaCloudWhatsAppAdapter,
  SandboxWhatsAppAdapter,
} from './whatsapp.providers';

const TEMPLATE_MAP: Record<WhatsAppEventType, string> = {
  [WhatsAppEventType.NEW_ORDER_REQUEST]: 'kiran_order_request_received',
  [WhatsAppEventType.ORDER_STATUS_CHANGE]: 'kiran_order_status_update',
  [WhatsAppEventType.REPAIR_BOOKING_CONFIRMATION]: 'kiran_repair_booking_confirmed',
  [WhatsAppEventType.REPAIR_STATUS_CHANGE]: 'kiran_repair_status_update',
  [WhatsAppEventType.QUOTATION_AVAILABLE]: 'kiran_repair_quotation_ready',
  [WhatsAppEventType.QUOTATION_APPROVED]: 'kiran_repair_quotation_approved',
  [WhatsAppEventType.BUYBACK_EVALUATION_UPDATE]: 'kiran_buyback_evaluation_update',
  [WhatsAppEventType.ADMIN_NEW_ENQUIRY]: 'kiran_admin_new_enquiry_alert',
};

@Injectable()
export class WhatsappService {
  private readonly logger = new Logger(WhatsappService.name);
  private readonly provider: WhatsAppProvider;

  constructor(@Optional() customProvider?: WhatsAppProvider) {
    if (customProvider) {
      this.provider = customProvider;
    } else {
      const enabled = process.env.WHATSAPP_CLOUD_ENABLED === 'true';
      const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
      const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

      if (enabled && phoneNumberId && accessToken) {
        this.provider = new MetaCloudWhatsAppAdapter(phoneNumberId, accessToken);
      } else {
        this.provider = new SandboxWhatsAppAdapter();
      }
    }
  }

  getProviderName(): string {
    return this.provider.name;
  }

  async sendEventTemplate(params: {
    event: WhatsAppEventType;
    toPhone: string;
    parameters: string[];
    customerOptedIn?: boolean;
  }): Promise<WhatsAppSendResult> {
    const isAdminAlert = params.event === WhatsAppEventType.ADMIN_NEW_ENQUIRY;
    if (!isAdminAlert && params.customerOptedIn === false) {
      return {
        success: false,
        provider: this.provider.name,
        sandboxed: this.provider.name === 'sandbox',
        skippedReason: 'CUSTOMER_OPTED_OUT',
      };
    }

    const templateName = TEMPLATE_MAP[params.event];
    try {
      return await this.provider.sendTemplate({
        toPhone: params.toPhone,
        templateName,
        languageCode: 'en',
        parameters: params.parameters,
      });
    } catch (err: any) {
      this.logger.warn(
        `WhatsApp template send failed for ${params.event}: ${err?.message || 'Unknown error'}`,
      );
      return {
        success: false,
        provider: this.provider.name,
        sandboxed: this.provider.name === 'sandbox',
        error: 'WhatsApp notification deferred due to provider error',
      };
    }
  }

  verifyWebhookChallenge(
    mode: string | undefined,
    token: string | undefined,
    challenge: string | undefined,
  ): string {
    const expectedToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN;
    if (
      mode === 'subscribe' &&
      expectedToken &&
      token === expectedToken &&
      challenge
    ) {
      return challenge;
    }
    throw new UnauthorizedException('Invalid WhatsApp webhook verification token');
  }

  verifyWebhookSignature(
    rawBody: Buffer | string,
    signatureHeader: string | undefined,
    appSecret = process.env.WHATSAPP_APP_SECRET,
  ): boolean {
    if (!appSecret || !signatureHeader) {
      return false;
    }
    const prefix = 'sha256=';
    if (!signatureHeader.startsWith(prefix)) {
      return false;
    }
    const providedHex = signatureHeader.slice(prefix.length);
    const expectedHex = crypto
      .createHmac('sha256', appSecret)
      .update(rawBody)
      .digest('hex');

    const providedBuf = Buffer.from(providedHex, 'hex');
    const expectedBuf = Buffer.from(expectedHex, 'hex');
    if (providedBuf.length !== expectedBuf.length) {
      return false;
    }
    return crypto.timingSafeEqual(providedBuf, expectedBuf);
  }

  handleWebhookPayload(payload: any): { processedStatuses: number } {
    let processedStatuses = 0;
    const entries = Array.isArray(payload?.entry) ? payload.entry : [];
    for (const entry of entries) {
      const changes = Array.isArray(entry?.changes) ? entry.changes : [];
      for (const change of changes) {
        const statuses = Array.isArray(change?.value?.statuses)
          ? change.value.statuses
          : [];
        for (const st of statuses) {
          processedStatuses += 1;
          this.logger.log(
            `WhatsApp delivery status: id=${st.id || 'unknown'} status=${st.status || 'unknown'}`,
          );
        }
      }
    }
    return { processedStatuses };
  }
}
