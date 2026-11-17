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
import { EnquiryStatus, RoleName } from '@prisma/client';
import { EnquiriesService } from './enquiries.service';
import { CreateEnquiryDto, UpdateEnquiryDto } from './dto/enquiry.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';

@ApiTags('enquiries')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class EnquiriesController {
  constructor(private readonly enquiriesService: EnquiriesService) {}

  @Post('enquiries')
  @ApiOperation({ summary: 'Customer: Submit a product, refurbished laptop, or service enquiry' })
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateEnquiryDto) {
    return this.enquiriesService.create(user.id, dto);
  }

  @Get('me/enquiries')
  @ApiOperation({ summary: 'Customer: List own submitted enquiries' })
  findMyEnquiries(@CurrentUser() user: AuthenticatedUser) {
    return this.enquiriesService.findCustomerEnquiries(user.id);
  }

  @Get('admin/enquiries')
  @UseGuards(RolesGuard)
  @Roles(RoleName.ADMIN)
  @ApiOperation({ summary: 'Admin: List and search all customer enquiries' })
  findAllAdmin(
    @Query('status') status?: EnquiryStatus,
    @Query('search') search?: string,
  ) {
    return this.enquiriesService.findAllAdmin({ status, search });
  }

  @Patch('admin/enquiries/:id')
  @UseGuards(RolesGuard)
  @Roles(RoleName.ADMIN)
  @ApiOperation({ summary: 'Admin: Update enquiry status, internal notes, or follow-up summary' })
  updateAdmin(
    @Param('id') id: string,
    @Body() dto: UpdateEnquiryDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.enquiriesService.updateAdmin(id, dto, user.id);
  }
}
