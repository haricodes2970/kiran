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
import { ConditionGrade, RefurbishedStatus, RoleName } from '@prisma/client';
import { RefurbishedService } from './refurbished.service';
import {
  CreateDeviceInspectionDto,
  CreateRefurbishedDeviceDto,
  CreateUsedDeviceSubmissionDto,
  UpdateRefurbishedDeviceDto,
  UpdateUsedDeviceSubmissionDto,
} from './dto/refurbished.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';

@ApiTags('refurbished')
@Controller()
export class RefurbishedController {
  constructor(private readonly refurbishedService: RefurbishedService) {}

  @Get('refurbished')
  @ApiOperation({ summary: 'List published refurbished laptops available for sale' })
  findAllPublic(
    @Query('search') search?: string,
    @Query('brand') brand?: string,
    @Query('conditionGrade') conditionGrade?: ConditionGrade,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('sortBy') sortBy?: 'newest' | 'price_asc' | 'price_desc',
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.refurbishedService.findAllPublic({
      search,
      brand,
      conditionGrade,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      sortBy,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 12,
    });
  }

  @Get('refurbished/:slug')
  @ApiOperation({ summary: 'Get published refurbished laptop details and inspection report' })
  findBySlug(@Param('slug') slug: string) {
    return this.refurbishedService.findBySlugPublic(slug);
  }

  @Post('used-device-submissions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Customer: Submit second-hand laptop for business evaluation' })
  createUsedSubmission(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateUsedDeviceSubmissionDto,
  ) {
    return this.refurbishedService.createUsedSubmission(user.id, dto);
  }

  @Get('me/used-device-submissions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Customer: List own second-hand laptop sell requests' })
  listMySubmissions(@CurrentUser() user: AuthenticatedUser) {
    return this.refurbishedService.listCustomerUsedSubmissions(user.id);
  }

  @Get('admin/refurbished-devices')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: List all refurbished devices across all 9 lifecycle stages' })
  findAllAdmin(@Query('status') status?: RefurbishedStatus) {
    return this.refurbishedService.findAllAdmin(status);
  }

  @Post('admin/refurbished-devices')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: Register a new refurbished device intake' })
  createAdmin(
    @Body() dto: CreateRefurbishedDeviceDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.refurbishedService.createAdmin(dto, user.id);
  }

  @Patch('admin/refurbished-devices/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: Update refurbished device lifecycle stage, cost, or price' })
  updateAdmin(
    @Param('id') id: string,
    @Body() dto: UpdateRefurbishedDeviceDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.refurbishedService.updateAdmin(id, dto, user.id);
  }

  @Post('admin/refurbished-devices/:id/inspections')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: Record a hardware inspection checklist for a refurbished device' })
  addInspection(
    @Param('id') id: string,
    @Body() dto: CreateDeviceInspectionDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.refurbishedService.addInspection(id, dto, user.id);
  }

  @Get('admin/used-device-submissions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: List customer second-hand laptop sell requests' })
  listAdminSubmissions() {
    return this.refurbishedService.listAdminUsedSubmissions();
  }

  @Patch('admin/used-device-submissions/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: Update evaluation status or offer price on used-device submission' })
  updateAdminSubmission(
    @Param('id') id: string,
    @Body() dto: UpdateUsedDeviceSubmissionDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.refurbishedService.updateAdminUsedSubmission(id, dto, user.id);
  }
}
