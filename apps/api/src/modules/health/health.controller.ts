import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../../prisma/prisma.service';

@ApiTags('health')
@Controller()
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  private async getStatusPayload() {
    let dbStatus = 'connected';
    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch {
      dbStatus = 'disconnected';
    }
    return {
      service: "Kiran's Infotech REST API",
      version: '1.0.0',
      status: dbStatus === 'connected' ? 'ok' : 'degraded',
      database: dbStatus,
      demoMode: process.env.DEMO_MODE !== 'false',
      guestRepairBookingAllowed: process.env.ALLOW_GUEST_REPAIR_BOOKING === 'true',
      onlinePaymentEnabled: process.env.ONLINE_PAYMENT_ENABLED === 'true',
      docsUrl: '/api/docs',
      timestamp: new Date().toISOString(),
    };
  }

  @Get()
  @ApiOperation({ summary: 'API root index and status check (/api/v1)' })
  async index() {
    return this.getStatusPayload();
  }

  @Get('health')
  @ApiOperation({ summary: 'System and database health check (/api/v1/health)' })
  async check() {
    return this.getStatusPayload();
  }
}
