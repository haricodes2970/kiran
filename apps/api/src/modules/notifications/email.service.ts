import { Injectable, Logger, Optional } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  EmailEventType,
  EmailProvider,
  EmailSendResult,
} from './email.types';
import { renderEmailTemplate } from './email.templates';
import { ResendEmailAdapter, SandboxEmailAdapter } from './email.providers';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly sentKeys = new Set<string>();
  private readonly provider: EmailProvider;

  constructor(
    @Optional() private readonly prisma?: PrismaService,
    @Optional() customProvider?: EmailProvider,
  ) {
    if (customProvider) {
      this.provider = customProvider;
    } else {
      const emailEnabled = process.env.EMAIL_ENABLED === 'true';
      const resendKey = process.env.RESEND_API_KEY;
      const fromEmail = process.env.EMAIL_FROM || '';

      if (emailEnabled && resendKey && fromEmail) {
        this.provider = new ResendEmailAdapter(resendKey, fromEmail);
      } else {
        this.provider = new SandboxEmailAdapter();
      }
    }
  }

  getProviderName(): string {
    return this.provider.name;
  }

  async sendEventEmail(params: {
    event: EmailEventType;
    to: string;
    userId?: string;
    entityType?: string;
    entityId?: string;
    idempotencyKey?: string;
    data: Record<string, unknown>;
    maxRetries?: number;
  }): Promise<EmailSendResult> {
    const dedupKey = params.idempotencyKey
      ? `${params.event}:${params.to}:${params.idempotencyKey}`
      : undefined;

    if (dedupKey) {
      if (this.sentKeys.has(dedupKey)) {
        return {
          success: true,
          provider: this.provider.name,
          sandboxed: this.provider.name === 'sandbox',
          messageId: 'deduplicated-skipped',
        };
      }

      if (this.prisma?.auditLog?.findFirst) {
        const alreadySent = await this.prisma.auditLog
          .findFirst({
            where: {
              action: 'EMAIL_SENT_IDEMPOTENCY',
              entityType: 'EmailIdempotency',
              entityId: dedupKey,
            },
          })
          .catch(() => null);
        if (alreadySent) {
          this.sentKeys.add(dedupKey);
          return {
            success: true,
            provider: this.provider.name,
            sandboxed: this.provider.name === 'sandbox',
            messageId: 'deduplicated-skipped',
          };
        }
      }
    }

    const rendered = renderEmailTemplate(params.event, params.data);
    const maxAttempts = Math.max(1, params.maxRetries ?? 2);
    let lastError = '';

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const result = await this.provider.send({
          to: params.to,
          subject: rendered.subject,
          html: rendered.html,
          text: rendered.text,
          idempotencyKey: dedupKey,
        });

        if (dedupKey) {
          this.sentKeys.add(dedupKey);
          if (this.prisma?.auditLog?.create) {
            await this.prisma.auditLog
              .create({
                data: {
                  actorId: params.userId ?? null,
                  action: 'EMAIL_SENT_IDEMPOTENCY',
                  entityType: 'EmailIdempotency',
                  entityId: dedupKey,
                  safeMetadata: `${params.event}`,
                },
              })
              .catch(() => {});
          }
        }

        if (this.prisma && params.userId) {
          await this.prisma.notification
            .create({
              data: {
                userId: params.userId,
                channel: 'EMAIL',
                title: rendered.subject,
                message: rendered.text.slice(0, 500),
                entityType: params.entityType ?? null,
                entityId: params.entityId ?? null,
              },
            })
            .catch(() => {});
        }

        return result;
      } catch (err: any) {
        lastError = err?.message || 'Unknown email provider error';
        this.logger.warn(
          `Email attempt ${attempt}/${maxAttempts} failed for ${params.event}: ${lastError}`,
        );
        if (attempt < maxAttempts) {
          await new Promise((r) => setTimeout(r, 50 * attempt));
        }
      }
    }

    this.logger.error(
      `Email delivery failed permanently for ${params.event} (${params.to}): ${lastError}`,
    );

    return {
      success: false,
      provider: this.provider.name,
      sandboxed: this.provider.name === 'sandbox',
      error: 'Email delivery deferred due to provider error',
    };
  }
}
