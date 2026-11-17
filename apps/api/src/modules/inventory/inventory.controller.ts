import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RoleName } from '@prisma/client';
import { InventoryService } from './inventory.service';
import { AdjustInventoryDto } from './dto/inventory.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';

@ApiTags('inventory')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleName.ADMIN)
@Controller('admin/inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  @ApiOperation({ summary: 'Admin: List inventory levels with low-stock and out-of-stock filtering' })
  findAll(@Query('filter') filter?: 'all' | 'low_stock' | 'out_of_stock') {
    return this.inventoryService.findAll(filter);
  }

  @Post('adjustments')
  @ApiOperation({ summary: 'Admin: Perform transactional stock adjustment and record movement ledger' })
  adjustStock(@Body() dto: AdjustInventoryDto, @CurrentUser() user: AuthenticatedUser) {
    return this.inventoryService.adjustStock(dto, user.id);
  }

  @Get(':productId/transactions')
  @ApiOperation({ summary: 'Admin: View stock movement history for a product' })
  getTransactions(@Param('productId') productId: string) {
    return this.inventoryService.getTransactions(productId);
  }
}
