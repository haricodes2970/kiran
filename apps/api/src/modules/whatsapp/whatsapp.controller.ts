import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { WhatsappService } from './whatsapp.service';

@ApiTags('whatsapp-webhooks')
@Controller('webhooks/whatsapp')
export class WhatsappController {
  constructor(private readonly whatsappService: WhatsappService) {}

  @Get()
  @ApiOperation({ summary: 'Meta WhatsApp Cloud API webhook verification challenge' })
  verifyChallenge(
    @Query('hub.mode') mode?: string,
    @Query('hub.verify_token') token?: string,
    @Query('hub.challenge') challenge?: string,
  ) {
    return this.whatsappService.verifyWebhookChallenge(mode, token, challenge);
  }

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Meta WhatsApp Cloud API delivery status webhook (HMAC-SHA256 verified)',
  })
  handleWebhook(
    @Req() req: Request & { rawBody?: Buffer },
    @Headers('x-hub-signature-256') signature: string | undefined,
    @Body() body: any,
  ) {
    const rawPayload = req.rawBody ?? JSON.stringify(body ?? {});
    const valid = this.whatsappService.verifyWebhookSignature(
      rawPayload,
      signature,
    );
    if (!valid) {
      throw new UnauthorizedException('Invalid WhatsApp webhook signature');
    }
    return this.whatsappService.handleWebhookPayload(body);
  }
}
