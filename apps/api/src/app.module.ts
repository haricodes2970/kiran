import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { AuditModule } from './modules/audit/audit.module';
import { HealthModule } from './modules/health/health.module';
import { AuthModule } from './modules/auth/auth.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { ProductsModule } from './modules/products/products.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { RefurbishedModule } from './modules/refurbished/refurbished.module';
import { ServicesModule } from './modules/services/services.module';
import { RepairsModule } from './modules/repairs/repairs.module';
import { EnquiriesModule } from './modules/enquiries/enquiries.module';
import { OrdersModule } from './modules/orders/orders.module';
import { AdminModule } from './modules/admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 120,
      },
    ]),
    PrismaModule,
    AuditModule,
    HealthModule,
    AuthModule,
    CategoriesModule,
    ProductsModule,
    InventoryModule,
    RefurbishedModule,
    ServicesModule,
    RepairsModule,
    EnquiriesModule,
    OrdersModule,
    AdminModule,
  ],
})
export class AppModule {}
