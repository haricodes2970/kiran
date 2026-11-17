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
import { OrderStatus, RoleName } from '@prisma/client';
import { OrdersService } from './orders.service';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto/order.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';

@ApiTags('orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('orders')
  @ApiOperation({
    summary:
      'Customer: Submit a cart order request with transactional stock validation and price snapshots',
  })
  createOrder(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateOrderDto) {
    return this.ordersService.createOrder(user.id, dto);
  }

  @Get('me/orders')
  @ApiOperation({ summary: 'Customer: List own orders' })
  findMyOrders(@CurrentUser() user: AuthenticatedUser) {
    return this.ordersService.findCustomerOrders(user.id);
  }

  @Get('me/orders/:reference')
  @ApiOperation({ summary: 'Customer: Get own order details by reference' })
  findMyOrderByReference(
    @CurrentUser() user: AuthenticatedUser,
    @Param('reference') reference: string,
  ) {
    return this.ordersService.findCustomerOrderByReference(user.id, reference);
  }

  @Get('admin/orders')
  @UseGuards(RolesGuard)
  @Roles(RoleName.ADMIN)
  @ApiOperation({ summary: 'Admin: List all customer orders' })
  findAllAdmin(@Query('status') status?: OrderStatus) {
    return this.ordersService.findAllAdmin(status);
  }

  @Get('admin/orders/:id')
  @UseGuards(RolesGuard)
  @Roles(RoleName.ADMIN)
  @ApiOperation({ summary: 'Admin: Get full order details' })
  findByIdAdmin(@Param('id') id: string) {
    return this.ordersService.findByIdAdmin(id);
  }

  @Patch('admin/orders/:id/status')
  @UseGuards(RolesGuard)
  @Roles(RoleName.ADMIN)
  @ApiOperation({ summary: 'Admin: Update order status or payment status' })
  updateStatusAdmin(
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.ordersService.updateStatusAdmin(id, dto, user.id);
  }
}
