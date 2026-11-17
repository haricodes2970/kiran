import { Module } from '@nestjs/common';
import { RefurbishedService } from './refurbished.service';
import { RefurbishedController } from './refurbished.controller';

@Module({
  controllers: [RefurbishedController],
  providers: [RefurbishedService],
  exports: [RefurbishedService],
})
export class RefurbishedModule {}
