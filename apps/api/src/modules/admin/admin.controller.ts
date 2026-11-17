import {
  Body,
  Controller,
  Get,
  Param,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RoleName } from '@prisma/client';
import { AdminService } from './admin.service';
import { AuditService } from '../audit/audit.service';
import { UpsertSiteContentDto } from './dto/admin.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';

@ApiTags('admin-and-content')
@Controller()
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly auditService: AuditService,
  ) {}

  @Get('site-content')
  @ApiOperation({ summary: 'Get all published site content blocks' })
  getAllSiteContent() {
    return this.adminService.getAllSiteContentPublic();
  }

  @Get('site-content/:key')
  @ApiOperation({ summary: 'Get published site content block by key' })
  getSiteContentByKey(@Param('key') key: string) {
    return this.adminService.getSiteContentByKeyPublic(key);
  }

  @Get('admin/dashboard/overview')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: Live database metrics and recent operational activity' })
  getDashboardOverview() {
    return this.adminService.getDashboardOverview();
  }

  @Get('admin/customers')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: List registered customers with activity counts' })
  listCustomers(@Query('search') search?: string) {
    return this.adminService.listCustomers(search);
  }

  @Get('admin/customers/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: Get customer profile and order/enquiry/repair history' })
  getCustomerDetail(@Param('id') id: string) {
    return this.adminService.getCustomerDetail(id);
  }

  @Put('admin/site-content/:key')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: Create or update a site content block' })
  upsertSiteContent(
    @Param('key') key: string,
    @Body() dto: UpsertSiteContentDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.adminService.upsertSiteContent(key, dto, user.id);
  }

  @Get('admin/reports/summary')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary:
      'Admin: Financial and operational report distinguishing revenue, purchase cost basis, and gross margin',
  })
  getReportsSummary() {
    return this.adminService.getReportsSummary();
  }

  @Get('admin/audit-logs')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: View audit logs of sensitive actions' })
  getAuditLogs(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.auditService.findAll(
      page ? Number(page) : 1,
      limit ? Number(limit) : 30,
    );
  }
}
