import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../../prisma/prisma.service';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: 'System and database health check' })
  async check() {
    let dbStatus = 'connected';
    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch {
      dbStatus = 'disconnected';
    }
    return {
      status: dbStatus === 'connected' ? 'ok' : 'degraded',
      database: dbStatus,
      demoMode: process.env.DEMO_MODE !== 'false',
      guestRepairBookingAllowed: process.env.ALLOW_GUEST_REPAIR_BOOKING === 'true',
      onlinePaymentEnabled: process.env.ONLINE_PAYMENT_ENABLED === 'true',
      timestamp: new Date().toISOString(),
    };
  }
}
