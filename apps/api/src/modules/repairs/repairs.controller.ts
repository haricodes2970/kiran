import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RepairBookingStatus, RoleName } from '@prisma/client';
import { RepairsService } from './repairs.service';
import {
  CreateRepairBookingDto,
  CreateRepairQuotationDto,
  RespondRepairQuotationDto,
  UpdateRepairStatusDto,
} from './dto/repair.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../../common/guards/optional-jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';

@ApiTags('repairs')
@Controller()
export class RepairsController {
  constructor(private readonly repairsService: RepairsService) {}

  @Post('repair-bookings')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Submit a hardware repair booking request' })
  createBooking(
    @Body() dto: CreateRepairBookingDto,
    @CurrentUser() user?: AuthenticatedUser,
  ) {
    return this.repairsService.createBooking(dto, user);
  }

  @Get('me/repair-bookings')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Customer: List own repair bookings and status history' })
  findMyBookings(@CurrentUser() user: AuthenticatedUser) {
    return this.repairsService.findCustomerBookings(user.id);
  }

  @Get('me/repair-bookings/:reference')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Customer: Get own repair booking details by reference' })
  findMyBookingByReference(
    @CurrentUser() user: AuthenticatedUser,
    @Param('reference') reference: string,
  ) {
    return this.repairsService.findCustomerBookingByReference(user.id, reference);
  }

  @Post('me/repair-bookings/:id/quotations/:quotationId/respond')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Customer: Approve or decline a repair quotation' })
  respondToQuotation(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Param('quotationId') quotationId: string,
    @Body() dto: RespondRepairQuotationDto,
  ) {
    return this.repairsService.respondToQuotation(user.id, id, quotationId, dto);
  }

  @Get('admin/repair-bookings')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: List all repair bookings including internal notes' })
  findAllAdmin(@Query('status') status?: RepairBookingStatus) {
    return this.repairsService.findAllAdmin(status);
  }

  @Get('admin/repair-bookings/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: Get full repair booking details' })
  findByIdAdmin(@Param('id') id: string) {
    return this.repairsService.findByIdAdmin(id);
  }

  @Patch('admin/repair-bookings/:id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary:
      'Admin: Update repair status, diagnostic summary, customer-visible message, and private internal note',
  })
  updateStatusAdmin(
    @Param('id') id: string,
    @Body() dto: UpdateRepairStatusDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.repairsService.updateStatusAdmin(id, dto, user.id);
  }

  @Post('admin/repair-bookings/:id/quotations')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: Prepare a repair quotation for customer approval' })
  createQuotationAdmin(
    @Param('id') id: string,
    @Body() dto: CreateRepairQuotationDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.repairsService.createQuotationAdmin(id, dto, user.id);
  }
}
