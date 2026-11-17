import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RoleName } from '@prisma/client';
import { ServicesService } from './services.service';
import { CreateServiceDto, UpdateServiceDto } from './dto/service.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';

@ApiTags('services')
@Controller()
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Get('services')
  @ApiOperation({ summary: 'List active hardware repair and upgrade services' })
  findAllPublic(@Query('categorySlug') categorySlug?: string) {
    return this.servicesService.findAllPublic(categorySlug);
  }

  @Get('services/:slug')
  @ApiOperation({ summary: 'Get active service details by slug' })
  findBySlug(@Param('slug') slug: string) {
    return this.servicesService.findBySlugPublic(slug);
  }

  @Get('admin/services')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: List all services and service categories' })
  findAllAdmin() {
    return this.servicesService.findAllAdmin();
  }

  @Post('admin/services')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: Create a new hardware service' })
  create(@Body() dto: CreateServiceDto, @CurrentUser() user: AuthenticatedUser) {
    return this.servicesService.create(dto, user.id);
  }

  @Patch('admin/services/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: Update service details or availability' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateServiceDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.servicesService.update(id, dto, user.id);
  }

  @Delete('admin/services/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: Deactivate/archive service' })
  archive(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.servicesService.archive(id, user.id);
  }
}
