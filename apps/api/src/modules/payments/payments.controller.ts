import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';

@ApiTags('payments-readiness')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get('status')
  @ApiOperation({
    summary: 'Check online payment gateway readiness (Order Request mode active until client approval)',
  })
  getStatus() {
    return this.paymentsService.getReadinessStatus();
  }
}
